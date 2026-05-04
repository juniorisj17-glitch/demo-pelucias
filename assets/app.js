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
    // Tenant detectado dinamicamente em loadSiteConfig (whitelabel):
    // — subdominio do clubedasgruas.com.br (ex: alice-pelucias.clubedasgruas.com.br)
    // — querystring `?tenant=<slug>` (uso em dev / sem DNS proprio)
    // — default `pelucias-demo` (Clube das Gruas raiz)
    TENANT_KEY: "pelucias-demo",
    SITE_SLUG: "clubedasgruas",
    LS_TOKEN: "pelucias_demo_token",
    LS_USER: "pelucias_demo_user",
};

// Defaults ricos do site quando o backend ainda nao retornou config
// (ou tenant invalido). Garantem que a pagina renderize bonita
// no fallback.
const DEFAULT_TEXTS = {
    brand_emoji: "🧸",
    brand_tag: "rede de pelucias · by FreePix",
    hero_eyebrow: "🎯 Clube das Gruas",
    hero_title_1: "Pegou, ganhou.",
    hero_title_grad: "Pague com PIX em 2 segundos.",
    hero_paragraph: "Cadastre-se gratis, jogue por <strong>R$ 5,00</strong>, e quando capturar — voce vira manchete da nossa galeria publica.",
    hero_badges: ["PIX em 2s", "Ursos lendarios", "Cashback 5%", "Galeria publica"],
    hero_emojis: ["🧸", "🐻", "🦄", "🐱", "⭐"],
    prize_price_cents: 500,
    cashback_percent: 5,
    footer_tagline: "Rede de gruas de pelucia com PIX. Operada com a plataforma FreePix de autoatendimento. Pegou, ganhou.",
};

// ============================================================
// WHITELABEL — detecta tenant + carrega config + aplica visual
// ============================================================
function detectTenantKey() {
    // 1. ?tenant=<slug> tem prioridade (uso em dev / preview)
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("tenant");
    if (fromQuery) return fromQuery.trim().toLowerCase();

    // 2. Subdominio de clubedasgruas.com.br (sub.clubedasgruas.com.br)
    const host = window.location.hostname;
    if (host.endsWith(".clubedasgruas.com.br")) {
        const sub = host.replace(/\.clubedasgruas\.com\.br$/, "");
        // Ignora "www" e dominios uteis (api, etc)
        if (sub && !["www", "api", "admin"].includes(sub)) {
            return sub;
        }
    }

    // 3. Default: Clube das Gruas raiz
    return "pelucias-demo";
}

function applySiteConfig(cfg) {
    // Mescla com defaults pra nunca quebrar layout
    const t = Object.assign({}, DEFAULT_TEXTS, cfg.texts || {});

    // Cor primaria (CSS var) — ajusta a paleta inteira
    if (cfg.primary_color) {
        document.documentElement.style.setProperty("--pink", cfg.primary_color);
    }

    // Branding
    document.title = `${cfg.name || "Clube das Gruas"} · ${t.hero_title_1} ${t.hero_title_grad}`;
    setText(".brand-emoji", t.brand_emoji);
    setText(".brand strong", cfg.name || "Clube das Gruas");
    setText(".brand-tag", t.brand_tag);

    // Hero
    setText(".hero .eyebrow", t.hero_eyebrow);
    const heroH1 = document.querySelector(".hero h1");
    if (heroH1) heroH1.innerHTML = `${t.hero_title_1} <span class="grad">${t.hero_title_grad}</span>`;
    const heroP = document.querySelector(".hero-copy > p");
    if (heroP) {
        heroP.innerHTML = `${t.hero_paragraph} Ja entregamos <strong id="hero-stat-prizes">centenas</strong> de premios.`;
    }

    // Hero badges
    const badgesContainer = document.querySelector(".hero-badges");
    if (badgesContainer && Array.isArray(t.hero_badges)) {
        badgesContainer.innerHTML = t.hero_badges
            .map((label, i) => `<span class="badge${i % 2 ? " gold" : ""}">${label}</span>`)
            .join("");
    }

    // Hero emojis (5 ursinhos)
    if (Array.isArray(t.hero_emojis)) {
        document.querySelectorAll(".bear-card").forEach((el, i) => {
            if (t.hero_emojis[i]) el.textContent = t.hero_emojis[i];
        });
    }

    // Footer
    setText(".footer-content > div:first-child strong", `${t.brand_emoji} ${cfg.name || "Clube das Gruas"}`);
    setText(".footer-content > div:first-child p", t.footer_tagline);

    // Marca tenant atual no DOM (pra debug)
    document.documentElement.dataset.tenant = cfg.tenant_key || "?";
}

function setText(sel, value) {
    if (value === undefined || value === null) return;
    document.querySelectorAll(sel).forEach(el => { el.textContent = value; });
}

async function loadSiteConfig() {
    const tenantKey = detectTenantKey();
    CONFIG.TENANT_KEY = tenantKey;
    try {
        const cfg = await apiGet(`/v1/public/tenants/${encodeURIComponent(tenantKey)}/site-config`);
        // Garante TENANT_KEY do servidor (caso o subdominio mapeie pra slug diferente)
        if (cfg.tenant_key) CONFIG.TENANT_KEY = cfg.tenant_key;
        applySiteConfig(cfg);
        return cfg;
    } catch (err) {
        console.warn(`site-config nao encontrado pra "${tenantKey}", usando defaults`, err);
        // Aplica defaults visuais
        applySiteConfig({ name: "Clube das Gruas", texts: DEFAULT_TEXTS });
        return null;
    }
}

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

// Filtro: ignoramos URLs do picsum.photos (fotos aleatorias dos seeds antigos
// — nao tem nada a ver com pelucias). Cai pro fallback de gradient + emoji.
function isPlaceholderPhoto(url) {
    if (!url) return true;
    return /picsum\.photos|placeholder|placehold/i.test(url);
}
function safePhotoUrl(url) {
    return isPlaceholderPhoto(url) ? "" : url;
}

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
    } else if (name === "mapa") {
        loadMap();
    } else if (name === "galeria") {
        currentGalleryOffset = 0;
        loadGallery("full-gallery", 24, false);
    } else if (name === "conta") {
        const user = currentUser();
        if (!user) { window.location.hash = "#login"; return; }
        renderAccount(user);
    } else if (name === "admin") {
        loadAdmin();
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
            const photo = safePhotoUrl(p.image_url);
            const imageStyle = photo ? `background-image:url('${photo}')` : "";
            return `
                <div class="featured-card">
                    <span class="rarity-tag ${p.rarity}">${RARITY_LABEL[p.rarity] || p.rarity}</span>
                    <div class="prize-image rarity-${p.rarity}" style="${imageStyle}">${photo ? "" : emoji}</div>
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
// MAP — Leaflet com fallback de pontos demo
// ============================================================
const DEMO_POINTS = [
    { name: "Shopping Iguatemi SP", latitude: -23.5891, longitude: -46.6841, status: "online",
      address: "Av. Brigadeiro Faria Lima, 2232 — Jardim Paulistano, SP", external_ref: null },
    { name: "Shopping Morumbi", latitude: -23.6234, longitude: -46.6987, status: "offline",
      address: "Av. Roque Petroni Junior, 1089 — Brooklin, SP", external_ref: null },
    { name: "Shopping Iguatemi Porto Alegre", latitude: -30.0192, longitude: -51.1855, status: "online",
      address: "Av. Joao Wallig, 1800 — Passo dArAreia, Porto Alegre/RS", external_ref: null },
    { name: "Shopping Center Norte", latitude: -23.5096, longitude: -46.6188, status: "pending",
      address: "Travessa Casalbuono, 120 — Vila Guilherme, SP", external_ref: null },
    { name: "BarraShopping RJ", latitude: -22.9989, longitude: -43.3597, status: "online",
      address: "Av. das Americas, 4666 — Barra da Tijuca, RJ", external_ref: null },
];

let mapInstance = null;
let mapMarkers = [];

function classifyStatus(p) {
    if (p.status === "online") return "online";
    if (p.device_ready === true) return "online";
    if (p.status === "offline") return "offline";
    if (p.status === "active" && p.payment_ready === true) return "online";
    return "pending";
}

function statusLabel(status) {
    if (status === "online") return "Online · jogando agora";
    if (status === "offline") return "Offline";
    return "Em breve";
}

async function loadMap() {
    const overlay = $("#map-overlay");
    const banner = $("#map-demo-banner");
    overlay?.classList.remove("hidden");

    // Fetch pontos + featured (pra cruzar premio raro por device_id)
    let points = [];
    const featuredByDeviceId = {};
    try {
        const [pointsRes, featuredRes] = await Promise.all([
            apiGet(`/v1/map/points?tenant_key=${CONFIG.TENANT_KEY}&mappable_only=true`),
            apiGet(`/v1/claw/featured?tenant_key=${CONFIG.TENANT_KEY}&limit=50`).catch(() => ({ machines: [] })),
        ]);
        points = pointsRes.points || [];
        for (const m of (featuredRes.machines || [])) {
            featuredByDeviceId[m.device_id] = m;
        }
    } catch (e) {
        console.warn("map fetch failed", e);
    }

    // Fallback: se API nao tem pontos cadastrados, mostra os 5 demo (shoppings BR)
    let usedDemo = false;
    if (points.length === 0) {
        points = DEMO_POINTS;
        usedDemo = true;
    }
    banner?.classList.toggle("hidden", !usedDemo);

    // Espera Leaflet carregar (defer no <head>) — tenta de novo se ainda nao
    if (typeof L === "undefined") {
        setTimeout(loadMap, 300);
        return;
    }

    // Inicializa o map UMA vez (se chamado de novo, so re-renderiza markers)
    if (!mapInstance) {
        mapInstance = L.map("map-container", {
            zoomControl: true,
            scrollWheelZoom: false, // evita o user travar no scroll vertical em mobile
            tap: true,
        }).setView([-15.78, -47.93], 4);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(mapInstance);
    }

    // Limpa markers anteriores
    for (const m of mapMarkers) m.remove();
    mapMarkers = [];

    // Adiciona markers
    const bounds = [];
    for (const p of points) {
        const status = classifyStatus(p);
        const icon = L.divIcon({
            className: "",
            html: `<div class="machine-pin ${status}"><span class="pin-emoji">🎰</span></div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 36],
            popupAnchor: [0, -32],
        });

        // Cruza com /v1/claw/featured pra mostrar o premio raro disponivel
        const deviceId = p.external_ref ? parseInt(p.external_ref, 10) : null;
        const featured = deviceId && featuredByDeviceId[deviceId];
        const prizeHtml = featured && featured.rare_prize ? `
            <div class="pop-prize">
                <span class="pop-prize-emoji">${RARITY_EMOJI[featured.rare_prize.rarity] || "🧸"}</span>
                <span><strong>${featured.rare_prize.name}</strong> · ${featured.rare_prize.remaining} restante${featured.rare_prize.remaining > 1 ? "s" : ""}</span>
            </div>` : "";

        const popupHtml = `
            <div class="popup-machine">
                <h4>${p.name}</h4>
                <span class="pop-status ${status}">${statusLabel(status)}</span>
                ${p.address ? `<div class="pop-address">📍 ${p.address}</div>` : ""}
                ${prizeHtml}
            </div>`;

        const marker = L.marker([p.latitude, p.longitude], { icon }).bindPopup(popupHtml);
        marker.addTo(mapInstance);
        mapMarkers.push(marker);
        bounds.push([p.latitude, p.longitude]);
    }

    if (bounds.length === 1) {
        mapInstance.setView(bounds[0], 14);
    } else if (bounds.length > 1) {
        mapInstance.fitBounds(bounds, { padding: [40, 40] });
    }

    // Recalcula tamanho — necessario quando a rota saiu de hidden ha pouco
    setTimeout(() => mapInstance?.invalidateSize(), 120);

    overlay?.classList.add("hidden");
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
            const photo = safePhotoUrl(w.photo_url || w.prize.image_url);
            const photoStyle = photo ? `background-image:url('${photo}')` : "";
            return `
                <div class="gallery-card">
                    <div class="photo rarity-${w.prize.rarity}" style="${photoStyle}">${photo ? "" : emoji}</div>
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
    meCache = null;
    refreshNavForAuth();
    refreshAdminLink();
}
function clearSession() {
    localStorage.removeItem(CONFIG.LS_TOKEN);
    localStorage.removeItem(CONFIG.LS_USER);
    meCache = null;
    refreshNavForAuth();
    refreshAdminLink();
}
function refreshNavForAuth() {
    const user = currentUser();
    const nav = $("#nav-actions");
    const adminLinkHtml = `<a href="#admin" class="btn btn-admin hidden" data-route="admin" id="nav-admin-link" title="Painel admin">🛠️ Admin</a>`;
    if (user) {
        const shortName = (user.display_name || user.email.split("@")[0]).slice(0, 18);
        nav.innerHTML = `
            ${adminLinkHtml}
            <a href="#conta" class="btn btn-ghost" data-route="conta">${shortName}</a>
            <a href="#conta" class="btn btn-primary" data-route="conta">Minha conta</a>
        `;
    } else {
        nav.innerHTML = `
            ${adminLinkHtml}
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

        // Backend agora devolve access_token explicito — guardamos como Bearer
        // pra chamadas autenticadas (cookies HttpOnly cross-origin nao chegam ate aqui).
        setSession(res.access_token || null, {
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
// ADMIN — gating + dashboard
// ============================================================
let meCache = null;
const ADMIN_ROLES = ["admin", "manager", "owner"];

async function fetchMe({ force = false } = {}) {
    if (meCache && !force) return meCache;
    const token = localStorage.getItem(CONFIG.LS_TOKEN);
    if (!token && !currentUser()) return null;
    try {
        const me = await apiGet("/v1/auth/me", { withCredentials: true });
        meCache = me.user || me;
        return meCache;
    } catch (e) {
        console.warn("/v1/auth/me failed", e);
        return null;
    }
}

function isAdminOf(me, tenantKey) {
    if (!me || !Array.isArray(me.memberships)) return false;
    return me.memberships.some(m =>
        m.tenant_key === tenantKey && ADMIN_ROLES.includes(m.role) && m.status === "active",
    );
}

async function refreshAdminLink() {
    const link = $("#nav-admin-link");
    if (!link) return;
    const user = currentUser();
    if (!user) { link.classList.add("hidden"); return; }
    const me = await fetchMe();
    if (isAdminOf(me, CONFIG.TENANT_KEY)) {
        link.classList.remove("hidden");
    } else {
        link.classList.add("hidden");
    }
}

const MODULE_LABELS = {
    wallet: { emoji: "💰", name: "Carteira digital" },
    cashback: { emoji: "🎁", name: "Cashback" },
    scheduling: { emoji: "📅", name: "Agendamento" },
    whatsapp_alerts: { emoji: "💬", name: "Alertas WhatsApp" },
    claw_machine: { emoji: "🎰", name: "Gruas de pelucia" },
    ocpp_charging: { emoji: "⚡", name: "Carregadores EV (OCPP)" },
    payments_pix: { emoji: "🇧🇷", name: "Pagamentos PIX" },
    payments_card: { emoji: "💳", name: "Pagamentos Cartao" },
    notifications: { emoji: "🔔", name: "Notificacoes" },
    reports_basic: { emoji: "📊", name: "Relatorios basicos" },
    remote_commands: { emoji: "📡", name: "Comandos remotos" },
    wallet_interop: { emoji: "🔗", name: "Creditos cross-tenant" },
};

function showAdminGate(which) {
    ["loading", "noauth", "noaccess", "dashboard"].forEach(g => {
        const el = $(`#admin-gate-${g}`) || $("#admin-dashboard");
        if (g === "dashboard") {
            $("#admin-dashboard").classList.toggle("hidden", which !== "dashboard");
        } else if (el) {
            el.classList.toggle("hidden", which !== g);
        }
    });
}

async function loadAdmin() {
    showAdminGate("loading");

    const user = currentUser();
    if (!user) { showAdminGate("noauth"); return; }

    const me = await fetchMe({ force: true });
    if (!me) { showAdminGate("noauth"); return; }
    if (!isAdminOf(me, CONFIG.TENANT_KEY)) { showAdminGate("noaccess"); return; }

    showAdminGate("dashboard");
    $("#admin-greeting").textContent = `do operador, ${me.display_name || me.email.split("@")[0]}`;
    $("#admin-email").textContent = `${me.email} · admin de ${CONFIG.TENANT_KEY}`;

    // Carrega tudo em paralelo
    const [statsRes, pointsRes, featuredRes, galleryRes, modulesRes] = await Promise.allSettled([
        apiGet(`/v1/claw/stats?tenant_key=${CONFIG.TENANT_KEY}`),
        apiGet(`/v1/map/points?tenant_key=${CONFIG.TENANT_KEY}&mappable_only=false`),
        apiGet(`/v1/claw/featured?tenant_key=${CONFIG.TENANT_KEY}&limit=50`),
        apiGet(`/v1/claw/gallery?tenant_key=${CONFIG.TENANT_KEY}&limit=8`),
        apiGet(`/v1/system/modules`).catch(() => apiGet(`/v1/modules`)),
    ]);

    // KPIs
    if (statsRes.status === "fulfilled") {
        const s = statsRes.value;
        $("#adm-kpi-total").textContent = s.total_prizes_won ?? "—";
        $("#adm-kpi-rare").textContent = s.rare_prizes_won ?? "—";
        $("#adm-kpi-24h").textContent = s.last_24h_wins ?? "—";
        $("#adm-kpi-machines").textContent = s.active_machines_with_inventory ?? "—";
    }

    // Maquinas (cruza com featured pra mostrar premio raro)
    const machinesEl = $("#admin-machines");
    if (pointsRes.status === "fulfilled") {
        const points = pointsRes.value.points || [];
        const featuredByDeviceId = {};
        if (featuredRes.status === "fulfilled") {
            for (const m of (featuredRes.value.machines || [])) {
                featuredByDeviceId[m.device_id] = m;
            }
        }
        const devicePoints = points.filter(p => p.kind === "device" || p.kind === "operational");
        if (devicePoints.length === 0) {
            machinesEl.innerHTML = `<div class="empty">Nenhuma maquina cadastrada com localizacao no tenant <code>${CONFIG.TENANT_KEY}</code>. Cadastre via <code>POST /v1/operational-points</code>.</div>`;
        } else {
            machinesEl.innerHTML = devicePoints.map(p => {
                const status = classifyStatus(p);
                const deviceId = p.external_ref ? parseInt(p.external_ref, 10) : null;
                const featured = deviceId && featuredByDeviceId[deviceId];
                const prizeHtml = featured && featured.rare_prize ? `
                    <div class="am-prize">${RARITY_EMOJI[featured.rare_prize.rarity] || "🧸"} ${featured.rare_prize.name} · ${featured.rare_prize.remaining} disp.</div>` : "";
                return `
                    <div class="admin-machine-row">
                        <span class="am-emoji">🎰</span>
                        <div class="am-info">
                            <div class="am-name">${p.name}</div>
                            ${p.address ? `<div class="am-address">📍 ${p.address}</div>` : ""}
                            ${prizeHtml}
                        </div>
                        <span class="am-status ${status}">${statusLabel(status)}</span>
                    </div>
                `;
            }).join("");
        }
    } else {
        machinesEl.innerHTML = '<div class="empty">Erro carregando maquinas.</div>';
    }

    // Wins recentes
    const winsEl = $("#admin-wins");
    if (galleryRes.status === "fulfilled") {
        const items = galleryRes.value.items || [];
        winsEl.innerHTML = items.length === 0 ? '<div class="empty">Nenhum premio entregue ainda.</div>' :
            items.map(w => {
                const emoji = RARITY_EMOJI[w.prize.rarity] || "🧸";
                const photo = safePhotoUrl(w.photo_url || w.prize.image_url);
                const photoStyle = photo ? `background-image:url('${photo}')` : "";
                return `
                    <div class="gallery-card">
                        <div class="photo rarity-${w.prize.rarity}" style="${photoStyle}">${photo ? "" : emoji}</div>
                        <div class="winner-name">${w.user_display_name || "Anonimo"}<span class="rarity-pill ${w.prize.rarity}">${RARITY_LABEL[w.prize.rarity] || w.prize.rarity}</span></div>
                        <div class="prize-name">${w.prize.name}</div>
                        <div class="when">${fmtDate(w.won_at)} · ${w.machine.label}</div>
                    </div>
                `;
            }).join("");
    } else {
        winsEl.innerHTML = '<div class="empty">Erro carregando wins.</div>';
    }

    // Modulos FreePix do catalog
    const modulesEl = $("#admin-modules");
    if (modulesRes.status === "fulfilled") {
        const list = modulesRes.value.modules || modulesRes.value.items || modulesRes.value || [];
        if (!Array.isArray(list) || list.length === 0) {
            modulesEl.innerHTML = '<div class="empty">Lista de modulos indisponivel no momento.</div>';
        } else {
            modulesEl.innerHTML = list.map(mod => {
                const key = mod.key || mod.module_key || mod.slug || "";
                const meta = MODULE_LABELS[key] || { emoji: "🧩", name: mod.name || key };
                const tagClass = (mod.status || mod.state || "available").toLowerCase();
                const tagLabel = mod.status === "active" ? "Ativo" : mod.status === "beta" ? "Beta" : mod.status === "planned" ? "Planejado" : "Disponivel";
                return `
                    <div class="module-card ${mod.status === "active" ? "active" : ""}">
                        <div>
                            <h3>${meta.emoji} ${meta.name}</h3>
                            <p>${mod.description || mod.summary || ""}</p>
                        </div>
                        <span class="module-tag ${tagClass}">${tagLabel}</span>
                    </div>
                `;
            }).join("");
        }
    } else {
        modulesEl.innerHTML = '<div class="empty">Catalog de modulos indisponivel.</div>';
    }
}

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
    // 0. WHITELABEL: detecta tenant + carrega config (cor, logo, textos)
    //    PRIMEIRO de tudo pq CONFIG.TENANT_KEY pode mudar e todas as
    //    chamadas seguintes dependem dele.
    await loadSiteConfig();
    refreshNavForAuth();
    // 1. Tenta resgatar token do redirect Google
    await handleBridgeToken();
    // 2. Roteia
    handleHashChange();
    // 3. PWA
    registerServiceWorker();
    setupInstallPrompt();
    // 4. Detecta admin em background
    refreshAdminLink();
});

// Refresh stats na home a cada 30s
setInterval(() => {
    if (window.location.hash === "#home" || window.location.hash === "" || window.location.hash === "#") {
        loadStats();
    }
}, 30000);
