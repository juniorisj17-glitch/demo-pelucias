# AGENTS.md — demo_pelucias (Clube das Gruas)

> Lido por: Claude Code, Codex, Antigravity e Ivo.
> Hierarquia: `D:\_CENTRAL\REGRAS_GERAIS.md` < `D:\FreePix\_GRUPO.md` < ESTE ARQUIVO.

---

## Identidade

- **Nome:** demo_pelucias (marca: **Clube das Gruas**)
- **Grupo:** FreePix (vertical claw_machine — gruas de pelucia)
- **Repo GitHub:** https://github.com/juniorisj17-glitch/demo-pelucias
- **Pasta local:** `D:\FreePix\demo_pelucias`
- **Categoria (Fase 3):** B — site frontend criado em 03/05/2026, codigo nasceu local e foi pro GitHub.
- **Stack:** SPA estatico vanilla — HTML5 + CSS3 + JavaScript ES6+ (zero dependencies). Tipografia: Fredoka + Inter via Google Fonts. Servido por nginx puro (sem backend proprio — consome FreePix API).

## Descricao

**Clube das Gruas** e a marca de uma rede brasileira de gruas de pelucia (claw machines) com PIX em 2 segundos, cashback 5%, galeria publica de ganhadores e (futuro) creditos cross-tenant via modulo `wallet_interop`.

Este projeto e o **site frontend de demonstracao** — vitrine pra clientes/operadores potenciais, mas tambem **codigo template** que outros sites do mesmo padrao podem espelhar. Consome 100% da `https://api.freepix.net.br/` (API publica).

Usa o tenant `pelucias-demo` na FreePix (provisionado em prod com 7 premios em 4 raridades, 2 maquinas, 12 wins fake com fotos `picsum.photos`).

## Endpoints da FreePix consumidos

| Endpoint | Auth | Funcao |
|---|---|---|
| `GET /v1/claw/stats?tenant_key=pelucias-demo` | publico | Stats da barra superior (refresh 30s) |
| `GET /v1/claw/featured?tenant_key=pelucias-demo` | publico | Maquinas com premios raros disponiveis |
| `GET /v1/claw/gallery?tenant_key=pelucias-demo` | publico | Galeria de ganhadores |
| `POST /v1/auth/register` | publico | Cadastro de cliente final |
| `POST /v1/auth/login` | publico | Login + token JWT |
| `GET /v1/wallet/accounts/pelucias-demo/{email}` | autenticado | Saldo do usuario |

Configuracao em `assets/app.js`:
```js
const CONFIG = {
    API_BASE: "https://api.freepix.net.br",
    TENANT_KEY: "pelucias-demo",
    LS_TOKEN: "pelucias_demo_token",
    LS_USER: "pelucias_demo_user",
};
```

## Servidor de producao

- **SSH alias:** `veiculos-vps` (216.238.116.255 — mesmo VPS do AutoPasso e Speedwash)
- **Comando:** `ssh veiculos-vps`
- **Pasta no servidor:** `/var/www/pelucias/` (owner: `www-data`)
- **Nginx config:** `/etc/nginx/sites-enabled/pelucias-freepix`
- **Acesso publico:**
  - **`http://216.238.116.255:8081/`** (acesso direto via IP, sem DNS — atual)
  - `http://clubedasgruas.com.br/` (aguardando A record no registro.br)
  - `http://www.clubedasgruas.com.br/` (idem)
  - `http://pelucias.freepix.net.br/` (alias temporario de teste, idem)
- **HTTPS:** pendente — depende de A record + `certbot --nginx -d clubedasgruas.com.br -d www.clubedasgruas.com.br --non-interactive --agree-tos -m juniorisj17@gmail.com --redirect`

> **Convivencia com autopasso:** `veiculos-vps` tambem serve `autopasso.com.br` (producao real do cliente). Isolamento garantido por `server_name` distintos no nginx + porta 8081 dedicada (autopasso fica em :80/:443 como `default_server`). **Validar `https://autopasso.com.br/` apos qualquer reload de nginx.**

## Dominio

- **Comprado pelo Ivo em 03/05/2026 16:45** no registro.br: `clubedasgruas.com.br` (R$ 40/ano, plano 1 ano).
- Pedido `46665474` / Fatura `48133262` (CNPJ 51.830.571/0001-94).
- **Pendencia de DNS:** criar A records no registro.br:
  ```
  Tipo: A   Nome: @     Valor: 216.238.116.255   TTL: 300
  Tipo: A   Nome: www   Valor: 216.238.116.255   TTL: 300
  ```
  Apos propagar, rodar certbot pra HTTPS.

## Estado Atual

- ✅ Site SPA criado em 03/05/2026 ~15:50, marca inicial "Pelucias by FreePix" → "Capturei" → **"Clube das Gruas"** (nome final).
- ✅ Repo GitHub publico inicializado (commit `850ba5c` initial → `65098e8` Clube das Gruas rebrand).
- ✅ Tenant `pelucias-demo` provisionado em prod com 7 premios, 2 maquinas, 12 wins fake.
- ✅ Deployed em `veiculos-vps` em `/var/www/pelucias/` na **porta 8081** (isolada do autopasso na :80).
- ✅ Nginx aceita `clubedasgruas.com.br` + `www.clubedasgruas.com.br` + `pelucias.freepix.net.br` + qualquer Host na :8081.
- ✅ Dominio `clubedasgruas.com.br` comprado (03/05/2026, R$ 40/ano).
- 🟡 **A record DNS pendente** — Ivo precisa criar no painel registro.br.
- 🟡 **HTTPS pendente** — depende do A record (certbot automatico apos propagacao).
- 🟡 Modulo `wallet_interop` (creditos cross-tenant) planejado para Sessao 9 da FreePix — sera o diferencial do Clube das Gruas (cliente compra credito no operador A e usa no operador B).

## Sessao ativa

`Sessao ativa: nenhuma`

> Antes de comecar trabalho neste projeto, preencher: `Sessao ativa: <nome do agente> iniciada em <dd/mm/aaaa hh:mm>`. Ao terminar, voltar para `nenhuma` e atualizar Changelog.

## Pendencias para a proxima sessao

1. **Criar A record `clubedasgruas.com.br` → 216.238.116.255** no registro.br (acao do Ivo).
2. **Rodar certbot** apos DNS propagar:
   ```bash
   ssh veiculos-vps 'certbot --nginx -d clubedasgruas.com.br -d www.clubedasgruas.com.br --non-interactive --agree-tos -m juniorisj17@gmail.com --redirect'
   ```
3. **Sessao 8 da FreePix (proxima):** MQTT consumer + ESP32 firmware (auth no mosquitto, worker subscrevendo `freepix/+/event/+`, esboco firmware).
4. **Sessao 9 da FreePix (futura):** modulo `wallet_interop` — feature signature do Clube das Gruas. Modelos `InteropMembership`, `InteropTransfer`, `SettlementBatch`. Categoria `network`. Ledger por tenant + settlement mensal entre operadores afiliados.
5. **Trocar fotos `picsum.photos` por reais** quando tiver fotos das pelucias do Ivo.
6. **Adicionar PIX top-up** (botao "+ Adicionar saldo" hoje so toasta — integrar com `/v1/payments/pix` quando expor).

## Como rodar localmente

```bash
cd D:\FreePix\demo_pelucias
python -m http.server 5500
# abre http://localhost:5500
```

Edicao: o site e arquivo unico (`index.html`) + `assets/style.css` + `assets/app.js`. Nao tem build.

## Como deployar

```bash
# 1. Deploy via tar
tar czf - --exclude=.git . | ssh veiculos-vps 'cd /var/www/pelucias && tar xzf - && chown -R www-data:www-data /var/www/pelucias'

# 2. Smoke
curl -s -o /dev/null -w "%{http_code}\n" http://216.238.116.255:8081/
curl -s -o /dev/null -w "%{http_code}\n" https://autopasso.com.br/   # validar autopasso intacto
```

## Changelog

- **03/05/2026 15:50** - Claude Code - Setup inicial: SPA HTML+CSS+JS criado em `D:\FreePix\demo_pelucias\`, paleta rosa+dourado divertida (Fredoka+Inter), 6 routes (home/maquinas/galeria/como-funciona/cadastro/login/conta), consumindo `/v1/claw/*` + `/v1/auth/*` + `/v1/wallet/*`. Repo `https://github.com/juniorisj17-glitch/demo-pelucias` criado e push inicial. Tenant `pelucias-demo` provisionado em prod (commit `850ba5c`).
- **03/05/2026 16:30** - Claude Code - Deploy em `veiculos-vps` (`/var/www/pelucias/`) servindo via nginx em `pelucias.freepix.net.br`. Rebrand Pelucias → Capturei (commit `45553e2`). `capturei.com.br` tomado, achadas alternativas `.app.br` LIVRE e `.com.br` outras opcoes.
- **03/05/2026 16:45** - Ivo - Comprou `clubedasgruas.com.br` no registro.br (R$ 40/ano). Pedido `46665474`.
- **03/05/2026 16:50** - Claude Code - Rebrand Capturei → **Clube das Gruas** (commit `65098e8`). Nginx aceita `clubedasgruas.com.br` + `www` + `pelucias.freepix.net.br`. Validado `autopasso.com.br` intacto.
- **03/05/2026 17:00** - Claude Code - Adicionado listener nginx em **porta 8081** (isolada do autopasso na :80). ufw allow 8081/tcp. Acesso publico via `http://216.238.116.255:8081/` (sem DNS). Latencia 92ms.
- **03/05/2026 17:15** - Claude Code - Estrutura padrao do grupo aplicada: `AGENTS.md`/`CLAUDE.md`/`.secrets/servers.md` criados, `.gitignore` ganhou `.secrets/`, `D:\_CENTRAL\PROMPTS_INICIAIS.md` ganhou prompt #14, `D:\_CENTRAL\MASTER.md` registra o projeto.
