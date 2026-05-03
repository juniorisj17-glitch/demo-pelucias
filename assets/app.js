/* === Clube das Gruas (by FreePix) - SPA + PWA consumindo a FreePix API ===
 *
 * Single-page app vanilla mobile-first, routing por hash.
 * Endpoints:
 *   GET  /v1/claw/{stats,featured,gallery}?tenant_key=pelucias-demo  (publico)
 *   POST /v1/auth/{register,login,password/forgot}                   (publico)
 *   GET  /v1/auth/google/start?tenant_key=...&return_url=...          (redirect oauth)
 *   GET  /v1/auth/bridge/exchange?token=...                           (apos redirect google)
 *   GET  /v1/wallet/accounts/pelucias-demo/{email}                    (autenticado tenant)
 */

const CONFIG = {
    API_BASE: "https://api.freepix.net.br",
    TENANT_KEY: "pelucias-demo",
    SITE_SLUG: "clubedasgruas",
    LS_TOKEN: "pelucias_demo_token",
    LS_USER: "pelucias_demo_user",
};

// ============================================================
// HELPERS
// ============================================================
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const fmtBRL = (cents) => {
    const v = (cents || 0) / 100;
    return "R$ " + v.toFixed(2).replace(".", ",");
};
const fmtDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return "agora";
    if (diff < 3600) return `${Math.floor(diff / 60)}min atras`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atras`;
    return d.toLocaleDateString("pt-BR");
};

const RARITY_EMOJI = {
    comum: "🧸", raro: "🐻", lendario: "⭐", exclusivo: "🦄",
};
const RARITY_LABEL = {
    comum: "Comum", raro: "Raro", lendario: "Lendario", exclusivo: "Exclusivo",
};

function toast(msg, kind = "") {
    const el = $("#toast");
    el.textContent = msg;
    el.className = "toast show " + kind;
    setTimeout(() => el.classList.remove("show"), 3500);
}

// ============================================================
// API CLIENT
// ============================================================
async function apiGet(path, { withCredentials = false } = {}) {
    const url = CONFIG.API_BASE + path;
    const headers = { "Accept": "application/json" };
    const token = localStorage.getItem(CONFIG.LS_TOKEN);
    if (token) headers["Authorization"] = "Bearer " + token;
    const init = { headers };
    if (withCredentials) init.credentials = "include";
    const r = await fetch(url, init);
    if (!r.ok) throw { status: r.status, body: await r.text() };
    return r.json();
}
async function apiPost(path, body) {
    const url = CONFIG.API_BASE + path;
    const headers = { "Content-Type": "application/json", "Accept": "application/json" };
    const token = localStorage.getItem(CONFIG.LS_TOKEN);
    if (token) headers["Authorization"] = "Bearer " + token;
    const r = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
    const text = await r.text();
    if (!r.ok) throw { status: r.status, body: text };
    return text ? JSON.parse(text) : {};
}

// ============================================================
// ROUTING
// ============================================================
function showRoute(name) {
    $$(".route").forEach(el => el.classList.add("hidden"));
    const route = $(`#route-${name}`);
    if (route) route.classList.remove("hidden");
    else $("#route-home").classList.remove("hidden");

    // Marca ativo na topbar nav E na bottom-nav
    $$(".nav a, .bottom-nav a").forEach(a => a.classList.remove("active"));
    $$(`.nav a[data-route="${name}"], .bottom-nav a[data-route="${name}"]`).forEach(a => a.classList.add("active"));

    window.scrollTo({ top: 0, behavior: "smooth" });

    // Render dinamico por rota
    if (name === "home" || name === undefined) {
        loadStats();
        loadFeatured("featured-grid", 6);
        loadGallery("home-gallery", 8);
    } else if (name === "maquinas") {
        loadFeatured("all-featured-grid", 50);
    } else if (name === "galeria") {
        currentGalleryOffset = 0;
        loadGallery("full-gallery", 24, false);
    } else if (name === "conta") {
        const user = currentUser();
        if (!user) { window.location.hash = "#login"; return; }
        renderAccount(user);
    }
}

function handleHashChange() {
    const hash = window.location.hash.replace("#", "") || "home";
    showRoute(hash);
}
window.addEventListener("hashchange", handleHashChange);

// Intercept clicks com data-route
document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-route]");
    if (!link) return;
    const route = link.dataset.route;
    if (route) {
        e.preventDefault();
        window.location.hash = "#" + route;
    }
});

// ============================================================
// HOME — STATS
// ============================================================
async function loadStats() {
    try {
        const stats = await apiGet(`/v1/claw/stats?tenant_key=${CONFIG.TENANT_KEY}`);
        $("#stat-total").textContent = stats.total_prizes_won;
        $("#stat-rare").textContent = stats.rare_prizes_won;
        $("#stat-24h").textContent = stats.last_24h_wins;
        $("#stat-machines").textContent = stats.active_machines_with_inventory;
        if ($("#hero-stat-prizes")) $("#hero-stat-prizes").textContent = stats.total_prizes_won;
    } catch (e) {
        console.warn("stats failed", e);
    }
}

// ============================================================
// FEATURED MACHINES
// ============================================================
async function loadFeatured(targetId, limit) {
    const target = $("#" + targetId);
    if (!target) return;
    try {
        const data = await apiGet(`/v1/claw/featured?tenant_key=${CONFIG.TENANT_KEY}&limit=${limit}`);
        const machines = data.machines || [];
        if (!machines.length) {
            target.innerHTML = '<div class="empty">Nenhuma maquina com premios raros agora. Volte em breve.</div>';
            return;
        }
        target.innerHTML = machines.map(m => {
            const p = m.rare_prize;
            const emoji = RARITY_EMOJI[p.rarity] || "🧸";
            const imageStyle = p.image_url ? `background-image:url('${p.image_url}')` : "";
            return `
                <div class="featured-card">
                    <span class="rarity-tag ${p.rarity}">${RARITY_LABEL[p.rarity] || p.rarity}</span>
                    <div class="prize-image" style="${imageStyle}">${p.image_url ? "" : emoji}</div>
                    <h3>${p.name}</h3>
                    <div class="machine-label">Maquina ${m.label}</div>
                    <div class="remaining">
                        🎯 <strong>${p.remaining}</strong> restante${p.remaining > 1 ? "s" : ""}
                    </div>
                    ${m.other_rare_prizes > 0 ? `<div class="other-rare">+ ${m.other_rare_prizes} outros premios raros nesta maquina</div>` : ""}
                </div>
            `;
        }).join("");
    } catch (e) {
        target.innerHTML = '<div class="empty">Erro carregando maquinas.</div>';
        console.warn("featured failed", e);
    }
}

// ============================================================
// GALLERY
// ============================================================
let currentGalleryOffset = 0;
async function loadGallery(targetId, limit, append = false) {
    const target = $("#" + targetId);
    if (!target) return;
    try {
        const offset = append ? currentGalleryOffset : 0;
        const data = await apiGet(`/v1/claw/gallery?tenant_key=${CONFIG.TENANT_KEY}&limit=${limit}&offset=${offset}`);
        const items = data.items || [];
        const html = items.map(w => {
            const emoji = RARITY_EMOJI[w.prize.rarity] || "🧸";
            const photo = w.photo_url || w.prize.image_url;
            const photoStyle = photo ? `background-image:url('${photo}')` : "";
            return `
                <div class="gallery-card">
                    <div class="photo" style="${photoStyle}">${photo ? "" : emoji}</div>
                    <div class="winner-name">${w.user_display_name || "Anonimo"}<span class="rarity-pill ${w.prize.rarity}">${RARITY_LABEL[w.prize.rarity] || w.prize.rarity}</span></div>
                    <div class="prize-name">${w.prize.name}</div>
                    <div class="when">${fmtDate(w.won_at)} · ${w.machine.label}</div>
                </div>
            `;
        }).join("");

        if (append) {
            target.insertAdjacentHTML("beforeend", html);
        } else {
            target.innerHTML = html || '<div class="empty">Nenhum ganhador ainda. Seja o primeiro!</div>';
        }
        currentGalleryOffset = offset + items.length;

        const loadMoreBtn = $("#load-more-gallery");
        if (loadMoreBtn) {
            loadMoreBtn.style.display = items.length < limit ? "none" : "inline-flex";
        }
    } catch (e) {
        if (!append) target.innerHTML = '<div class="empty">Erro carregando galeria.</div>';
        console.warn("gallery failed", e);
    }
}

$("#load-more-gallery")?.addEventListener("click", () => {
    loadGallery("full-gallery", 24, true);
});

// ============================================================
// AUTH — sessao e nav
// ============================================================
function currentUser() {
    const raw = localStorage.getItem(CONFIG.LS_USER);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
}
function setSession(token, user) {
    if (token) localStorage.setItem(CONFIG.LS_TOKEN, token);
    localStorage.setItem(CONFIG.LS_USER, JSON.stringify(user));
    refreshNavForAuth();
}
function clearSession() {
    localStorage.removeItem(CONFIG.LS_TOKEN);
    localStorage.removeItem(CONFIG.LS_USER);
    refreshNavForAuth();
}
function refreshNavForAuth() {
    const user = currentUser();
    const nav = $("#nav-actions");
    if (user) {
        const shortName = (user.display_name || user.email.split("@")[0]).slice(0, 18);
        nav.innerHTML = `
            <a href="#conta" class="btn btn-ghost" data-route="conta">${shortName}</a>
            <a href="#conta" class="btn btn-primary" data-route="conta">Minha conta</a>
        `;
    } else {
        nav.innerHTML = `
            <a href="#login" class="btn btn-ghost" data-route="login">Entrar</a>
            <a href="#cadastro" class="btn btn-primary" data-route="cadastro">Cadastrar</a>
        `;
    }
}

// ============================================================
// AUTH — register / login email+senha (mantido)
// ============================================================
$("#register-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = {
        email: fd.get("email"),
        password: fd.get("password"),
        display_name: fd.get("display_name") || null,
        tenant_key: CONFIG.TENANT_KEY,
    };
    try {
        const res = await apiPost("/v1/auth/register", payload);
        const access = res.access_token || res.token;
        const user = res.user || { email: payload.email, display_name: payload.display_name };
        if (access) {
            setSession(access, user);
            toast("Conta criada! Bem-vindo 🎉", "success");
            window.location.hash = "#conta";
        } else {
            const loginRes = await apiPost("/v1/auth/login", { email: payload.email, password: payload.password });
            setSession(loginRes.access_token || loginRes.token, loginRes.user || { email: payload.email });
            toast("Conta criada e logado! 🎉", "success");
            window.location.hash = "#conta";
        }
    } catch (err) {
        let msg = "Erro ao criar conta.";
        try { const j = JSON.parse(err.body); if (j.detail) msg = "Erro: " + j.detail; } catch {}
        toast(msg, "error");
        console.warn("register error", err);
    }
});

$("#login-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = { email: fd.get("email"), password: fd.get("password") };
    try {
        const res = await apiPost("/v1/auth/login", payload);
        const access = res.access_token || res.token;
        if (!access) throw { status: 401, body: "no_token" };
        setSession(access, res.user || { email: payload.email });
        toast("Bem-vindo de volta! 👋", "success");
        window.location.hash = "#conta";
    } catch (err) {
        toast("Email ou senha invalidos.", "error");
        console.warn("login error", err);
    }
});

// ============================================================
// AUTH — botoes sociais (Google / Facebook em breve / Apple em breve)
// ============================================================
document.addEventListener("click", (e) => {
    const btn = e.target.closest(".social-btn");
    if (!btn || btn.disabled) return;

    const provider = btn.dataset.social;
    if (provider === "google") {
        startGoogleOAuth();
    }
});

function startGoogleOAuth() {
    // return_url = URL atual sem hash, sem query string previa de token
    const url = new URL(window.location.href);
    url.search = "";
    url.hash = "";
    const returnUrl = url.toString();

    const params = new URLSearchParams({
        tenant_key: CONFIG.TENANT_KEY,
        site_slug: CONFIG.SITE_SLUG,
        return_url: returnUrl,
    });
    window.location.href = `${CONFIG.API_BASE}/v1/auth/google/start?${params.toString()}`;
}

/**
 * Apos redirect do callback Google, o backend devolve para
 * <return_url>?token=<bridge_token>. Detectamos isso na carga, trocamos
 * pelo objeto user via /v1/auth/bridge/exchange e armazenamos no LS.
 *
 * Nota: o JWT vive em cookie HttpOnly do dominio api.freepix.net.br (apos
 * SSL); chamadas autenticadas posteriores precisam de credentials:'include'.
 */
async function handleBridgeToken() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) return;

    // Limpa o token da URL pra nao re-disparar e nao expor no histórico
    const cleanUrl = window.location.pathname + window.location.hash;
    history.replaceState({}, document.title, cleanUrl);

    try {
        const res = await apiGet(`/v1/auth/bridge/exchange?token=${encodeURIComponent(token)}`, { withCredentials: true });
        const user = res.user || res;
        if (!user || !user.email) throw new Error("bridge_exchange_no_user");

        // Sem JWT propio — sessao via cookie cross-origin do api.freepix.net.br
        setSession(null, {
            email: user.email,
            display_name: user.display_name || user.name || null,
            picture: user.picture || null,
            email_verified: user.email_verified !== false,
        });
        toast("Logado com Google 🎉", "success");
        window.location.hash = "#conta";
    } catch (err) {
        console.warn("bridge_exchange failed", err);
        toast("Nao foi possivel concluir o login Google. Tente de novo.", "error");
    }
}

// ============================================================
// AUTH — esqueci minha senha
// ============================================================
$("#link-forgot-password")?.addEventListener("click", (e) => {
    e.preventDefault();
    const modal = $("#modal-forgot");
    modal.classList.remove("hidden");
    // Pre-preencher com email do form de login se ja digitado
    const loginEmail = $("#login-form input[name='email']")?.value;
    if (loginEmail) modal.querySelector("input[name='email']").value = loginEmail;
    modal.querySelector("input[name='email']").focus();
});

$("#btn-forgot-cancel")?.addEventListener("click", () => {
    $("#modal-forgot").classList.add("hidden");
});

$("#modal-forgot")?.addEventListener("click", (e) => {
    // Fecha se clicar fora do modal-content
    if (e.target.id === "modal-forgot") {
        $("#modal-forgot").classList.add("hidden");
    }
});

$("#forgot-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const email = fd.get("email");
    try {
        await apiPost("/v1/auth/password/forgot", { email });
        // Backend e silencioso (nao vaza existencia da conta) — sempre 200 OK
        $("#modal-forgot").classList.add("hidden");
        toast("Se o email existir, enviamos o link de redefinicao 📨", "success");
    } catch (err) {
        toast("Erro ao enviar. Tente de novo.", "error");
        console.warn("forgot password error", err);
    }
});

// ============================================================
// MINHA CONTA
// ============================================================
async function renderAccount(user) {
    $("#me-greeting").textContent = `Ola, ${(user.display_name || user.email.split("@")[0])}!`;
    $("#me-email").textContent = user.email;

    // Endpoint exige tenant secret (nao temos no front) — exibimos R$ 0,00
    // se nao for possivel. Numa versao real, ficaria atras de um proxy.
    try {
        const wallet = await apiGet(
            `/v1/wallet/accounts/${CONFIG.TENANT_KEY}/${encodeURIComponent(user.email)}`,
            { withCredentials: true },
        );
        $("#balance-amount").textContent = fmtBRL(wallet.balance_cents);
    } catch (err) {
        $("#balance-amount").textContent = "R$ 0,00";
    }
}

$("#btn-add-balance")?.addEventListener("click", () => {
    toast("PIX em desenvolvimento — em breve! 🚀");
});

$("#btn-logout")?.addEventListener("click", () => {
    clearSession();
    toast("Ate logo! 👋");
    window.location.hash = "#home";
});

// ============================================================
// PWA — Service Worker + install prompt
// ============================================================
function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    // SW so funciona em HTTPS ou localhost — em dev sob HTTP em IP qualquer da erro silencioso
    navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((err) => console.warn("SW register failed", err));
}

let deferredInstallPrompt = null;
function setupInstallPrompt() {
    const promptEl = $("#install-prompt");
    const btnInstall = $("#btn-install");
    const btnClose = $("#btn-install-close");

    window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        deferredInstallPrompt = e;
        // Nao mostra se usuario ja descartou nesta sessao
        if (sessionStorage.getItem("install_dismissed")) return;
        promptEl.classList.remove("hidden");
    });

    btnInstall?.addEventListener("click", async () => {
        if (!deferredInstallPrompt) return;
        deferredInstallPrompt.prompt();
        await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;
        promptEl.classList.add("hidden");
    });

    btnClose?.addEventListener("click", () => {
        promptEl.classList.add("hidden");
        sessionStorage.setItem("install_dismissed", "1");
    });

    window.addEventListener("appinstalled", () => {
        promptEl.classList.add("hidden");
        toast("Instalado! Encontre na tela inicial 🧸", "success");
    });
}

// ============================================================
// INIT
// ============================================================
window.addEventListener("DOMContentLoaded", async () => {
    refreshNavForAuth();
    // 1. Tenta resgatar token do redirect Google ANTES de roteamento
    await handleBridgeToken();
    // 2. Roteia
    handleHashChange();
    // 3. PWA
    registerServiceWorker();
    setupInstallPrompt();
});

// Refresh stats na home a cada 30s
setInterval(() => {
    if (window.location.hash === "#home" || window.location.hash === "" || window.location.hash === "#") {
        loadStats();
    }
}, 30000);
