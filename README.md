# Clube das Gruas — by FreePix — site demo

> Site de demonstracao de uma rede de **gruas de pelucia** consumindo 100% da [FreePix API](https://api.freepix.net.br/).

Demonstra o **modulo `claw_machine`** + **autenticacao** + **wallet** da plataforma FreePix em um site real.

## Como rodar localmente

E SPA estatico (HTML + CSS + JS vanilla, sem build). Qualquer servidor estatico serve.

```bash
cd D:\FreePix\demo_pelucias
python -m http.server 5500
```

Abre [`http://localhost:5500`](http://localhost:5500).

## O que esta vivo na demo

- ✅ **Stats em tempo real** (barra superior puxa `/v1/claw/stats`)
- ✅ **Maquinas com premios raros agora** (`/v1/claw/featured`)
- ✅ **Galeria publica de ganhadores** com fotos (`/v1/claw/gallery`, 12 wins seedados)
- ✅ **Cadastro real** via `POST /v1/auth/register`
- ✅ **Login real** via `POST /v1/auth/login`
- ✅ **Minha conta** com saldo da carteira (`/v1/wallet/accounts/...`)
- 🟡 PIX top-up (botao "Adicionar saldo") — em desenvolvimento

## Arquitetura

```
[Browser]
   │
   │  fetch(API_BASE + path)
   ▼
[https://api.freepix.net.br]
   │
   ├── /v1/auth/{register,login}        — cadastro + login do cliente final
   ├── /v1/claw/stats                   — numeros publicos
   ├── /v1/claw/featured                — maquinas com raros
   ├── /v1/claw/gallery                 — galeria de ganhadores
   ├── /v1/wallet/accounts/...          — saldo
   └── (futuro) /v1/payments/pix        — top-up PIX
```

Tenant: `pelucias-demo` (criado em prod).

## Hospedagem em produ&ccedil;&atilde;o

Como e SPA estatico, **qualquer CDN gratuito serve**:

### Cloudflare Pages
1. Conecta esse repo ao Cloudflare Pages
2. Build command: vazio
3. Output directory: `/`
4. Custom domain (opcional): `pelucias.freepix.net.br`

### Vercel
```bash
npx vercel deploy --prod
```

### Netlify (drag-and-drop)
Vai em [netlify.com/drop](https://app.netlify.com/drop) e arrasta a pasta inteira.

### Local + ngrok (pra demo rapida)
```bash
python -m http.server 5500 &
ngrok http 5500
```

## Configuracao

Editar `assets/app.js`:

```js
const CONFIG = {
    API_BASE: "https://api.freepix.net.br",   // pode trocar pra outra instancia
    TENANT_KEY: "pelucias-demo",              // tenant_key na FreePix
    LS_TOKEN: "pelucias_demo_token",
    LS_USER: "pelucias_demo_user",
};
```

## Estrutura

```
demo_pelucias/
├── index.html          SPA com 6 routes (home, maquinas, galeria, como-funciona, cadastro, login, conta)
├── assets/
│   ├── style.css       Paleta rosa+dourado divertida (vibe pelucia)
│   └── app.js          Routing por hash + API client + auth
└── README.md
```

## Paleta visual

Diferente da FreePix corporate (azul/dourado profissional), aqui usamos:

- **Rosa pelucia** `#ff5ea1` (primary)
- **Dourado** `#ffc857` (accent)
- **Lavanda** `#b794f4` (secondary)
- **Creme quente** `#fff8f3` (bg)
- **Tipografia** Fredoka (display, friendly) + Inter (body)

E proposital: **cada vertical pode ter sua identidade**, todos consumindo a mesma API.

## Demonstrando ao cliente

1. **"Stats em tempo real"** → barra superior. Volta a cada 30s.
2. **"Maquinas com raros"** → home, alimentado pelo `/v1/claw/featured`.
3. **"Galeria publica"** → home + pagina dedicada, fotos reais.
4. **"Cadastrar gratis"** → POST /v1/auth/register de verdade.
5. **"Minha conta"** → mostra saldo wallet, prova que e um sistema integrado.

## Como popular dados de outro tenant

Se for fazer demo pra outro cliente real:

```bash
# 1. Cria tenant novo
curl -X POST -H "X-Freepix-Master: $MASTER" -H "Content-Type: application/json" \
  -d '{"tenant_key":"meucliente","name":"Clube das Gruas Cliente X"}' \
  https://api.freepix.net.br/v1/tenants

# 2. Edita assets/app.js -> CONFIG.TENANT_KEY = "meucliente"

# 3. Provisiona modulos + premios + wins via scripts (veja
#    /opt/freepix_api/seed_demo_pelucias.py no servidor pra exemplo)
```

---

© 2026 · Clube das Gruas — by FreePix · Powered by [api.freepix.net.br](https://api.freepix.net.br)
