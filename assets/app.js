/* === Clube das Gruas (by FreePix) - SPA consumindo a FreePix API ===
 *
 * Rede brasileira de gruas de pelucia com creditos cross-tenant.
 * Single-page app vanilla, routing por hash, consome 100% da API publica
 * https://api.freepix.net.br.
 *
 * Endpoints usados:
 *   - GET  /v1/claw/stats?tenant_key=pelucias-demo   (publico)
 *   - GET  /v1/claw/featured?tenant_key=pelucias-demo (publico)
 *   - GET  /v1/claw/gallery?tenant_key=pelucias-demo  (publico)
 *   - POST /v1/auth/register
 *   - POST /v1/auth/login
 *   - GET  /v1/wallet/accounts/pelucias-demo/{email}  (autenticado)
 */

const CONFIG = {
    API_BASE: "https://api.freepix.net.br",
    TENANT_KEY: "pelucias-demo",
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
    setTimeout(() => el.classList.remove("show"), 3000);
}

// ============================================================
// API CLIENT
// ============================================================
async function apiGet(path) {
    const url = CONFIG.API_BASE + path;
    const headers = { "Accept": "application/json" };
    const token = localStorage.getItem(CONFIG.LS_TOKEN);
    if (token) headers["Authorization"] = "Bearer " + token;
    const r = await fetch(url, { headers });
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

    $$(".nav a").forEach(a => a.classList.remove("active"));
    $$(`.nav a[data-route="${name}"]`).forEach(a => a.classList.add("active"));

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
// AUTH
// ============================================================
function currentUser() {
    const raw = localStorage.getItem(CONFIG.LS_USER);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
}
function setSession(token, user) {
    localStorage.setItem(CONFIG.LS_TOKEN, token);
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
        nav.innerHTML = `
            <a href="#conta" class="btn btn-ghost" data-route="conta">${user.email.split("@")[0]}</a>
            <a href="#conta" class="btn btn-primary" data-route="conta">Minha conta</a>
        `;
    } else {
        nav.innerHTML = `
            <a href="#login" class="btn btn-ghost" data-route="login">Entrar</a>
            <a href="#cadastro" class="btn btn-primary" data-route="cadastro">Cadastrar</a>
        `;
    }
}

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
        // Resposta de register pode vir com user e/ou token; faz login direto se nao
        const access = res.access_token || res.token;
        const user = res.user || { email: payload.email, display_name: payload.display_name };
        if (access) {
            setSession(access, user);
            toast("Conta criada! Bem-vindo 🎉", "success");
            window.location.hash = "#conta";
        } else {
            // tenta login automatico
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
// MINHA CONTA
// ============================================================
async function renderAccount(user) {
    $("#me-greeting").textContent = `Ola, ${(user.display_name || user.email.split("@")[0])}!`;
    $("#me-email").textContent = user.email;

    // Tenta buscar saldo da carteira (endpoint exige tenant secret —
    // numa demo real, isso seria proxy via backend; aqui exibimos R$ 0,00
    // se nao for possivel)
    try {
        const wallet = await apiGet(`/v1/wallet/accounts/${CONFIG.TENANT_KEY}/${encodeURIComponent(user.email)}`);
        $("#balance-amount").textContent = fmtBRL(wallet.balance_cents);
    } catch (err) {
        // Carteira ainda nao criada e normal — mostra R$ 0,00
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
// INIT
// ============================================================
window.addEventListener("DOMContentLoaded", () => {
    refreshNavForAuth();
    handleHashChange();
});

// Refresh stats e gallery na home a cada 30s (visual de "vivo")
setInterval(() => {
    if (window.location.hash === "#home" || window.location.hash === "" || window.location.hash === "#") {
        loadStats();
    }
}, 30000);
