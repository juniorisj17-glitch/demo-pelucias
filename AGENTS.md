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
- ✅ **PWA mobile-first (03/05/2026 17:30):** site agora e PWA instalavel — `manifest.json`, `assets/icon.svg` (ursinho desenhado em paths SVG, gradient rosa→lavanda→dourado), `sw.js` (cache-first do shell). CSS reescrito mobile-first com bottom-nav fixa (Inicio/Maquinas/Galeria/Conta), tap targets ≥44px, inputs 16px (evita zoom iOS), safe-area-inset-bottom. Tablet/desktop via `@media (min-width: 720px / 1024px)` — bottom-nav some, top-nav reaparece.
- ✅ **Login social (03/05/2026 17:30):** botoes "Continuar com Google/Facebook/Apple" nas paginas cadastro+login. Google funcional via redirect a `/v1/auth/google/start?tenant_key=pelucias-demo&site_slug=clubedasgruas&return_url=...`; callback retorna `?token=<bridge>` na URL, front troca via `/v1/auth/bridge/exchange` e popula sessao. Facebook+Apple com badge "Em breve" (disabled), aguardando credenciais. **"Esqueci minha senha"** funcional via modal → POST `/v1/auth/password/forgot`.
- 🟡 **A record DNS pendente** — Ivo precisa criar no painel registro.br.
- 🟡 **HTTPS pendente** — depende do A record (certbot automatico apos propagacao). Service Worker so registra em HTTPS (Chrome/Firefox); funciona em localhost mas no acesso por IP HTTP nao instala — apos certbot a PWA fica completa.
- ✅ **CORS na FreePix API resolvido (03/05/2026 17:38, Ivo):** `api.freepix.net.br` agora reflete origin dinamicamente (`access-control-allow-origin: <origin>`), `allow-credentials: true`, `allow-methods: GET, POST, PUT, PATCH, DELETE, OPTIONS`, `allow-headers: authorization`, `max-age: 600`, header `vary: Origin`. Stats/featured/gallery e `bridge/exchange` validados via curl. Site no preview consumiu API end-to-end: 12 premios, 5 raros, 8 nas ultimas 24h, 2 maquinas, 8 cards na galeria.
- ✅ **Google OAuth backend pronto:** `/v1/auth/google/start` retorna 302 pra `accounts.google.com/o/oauth2/v2/auth` com `client_id=852198674773-...apps.googleusercontent.com` configurado. Falta apenas teste end-to-end manual no browser real (preview tool bloqueia navegacao top-level por JS).
- ✅ **HTTPS em https://clubedasgruas.com.br (04/05/2026):** Ivo criou A records no registro.br (`@` raiz e `www` → 216.238.116.255; modo basico do registro.br nao aceita wildcard `*` — pra escalar a Fase 1 com subdominios `<empresa>.clubedasgruas.com.br`, vai precisar migrar DNS pra Cloudflare ou criar A record manual por empresa). Cert Let's Encrypt emitido via `certbot --nginx --redirect` (HTTP-01 challenge), valido ate 02/08/2026, renovacao automatica configurada. Certbot quebrou acesso direto IP:8081 ao colocar `return 404` no bloco HTTP — corrigido editando manualmente `/etc/nginx/sites-available/pelucias-freepix`: redirect HTTPS so pros dominios oficiais (`if ($host = ...)`), demais hosts (IP, `pelucias.freepix.net.br`) servem normal. Backup do nginx config em `pelucias-freepix.bak.20260504-precert`. Smoke final: https://clubedasgruas (200), https://www.clubedasgruas (200), http→https (301), IP:8081 (200), autopasso.com.br (200 intacto).
- ✅ **Login Google retorna JWT explicito (04/05/2026):** corrigido o problema do link "🛠️ Admin" nao aparecer apos login Google. Backend `freepix` ([platform_auth.py:845](D:/FreePix/freepix/platform_auth.py:845) - `bridge_exchange`) agora cria session + emite `access_token` JWT alem de devolver os dados do user — front guarda no `LS_TOKEN`, `fetchMe()` consegue chamar `/v1/auth/me` com Bearer (sem depender de cookies HttpOnly cross-origin que browsers bloqueiam). Front `demo_pelucias` (`handleBridgeToken`) atualizado pra ler `res.access_token`. SW v5 → v6.
- ✅ **Fotos picsum filtradas + landing operador B2B (04/05/2026):** seeds antigos do tenant `pelucias-demo` apontam pra `picsum.photos` (fotos aleatorias sem relacao com pelucias). Helper `isPlaceholderPhoto()` e `safePhotoUrl()` no front filtram qualquer URL de picsum/placeholder e caem pro fallback estilizado: gradient bonito por raridade (comum=rosa+dourado, raro=lavanda, lendario=dourado, exclusivo=rosa pink) + emoji XL (96px no featured, 64px na galeria) com sombra. Featured cards animam com hover scale+rotate. **Nova rota `#operador`** (landing B2B pra dono de grua que quer aderir): hero escuro/dourado com 🧸 watermark, 6 cards de beneficios (PIX 2s, painel admin, galeria como marketing, comandos remotos, cashback, wallet_interop "em breve"), 4 passos pra entrar (fala WhatsApp → conecta placa → cola QR → painel), pricing transparente (R$ 180 ESP32 + 7% sobre PIX/cartao + sem fidelidade), CTAs WhatsApp (`wa.me/5554993793621?text=...`). Link "Pra operadores" no topbar e footer. SW v4 → v5.
- ✅ **Secao "Como jogar" didatica na home (04/05/2026):** inspirada no padrao do `aguapetrus.com.br` (3 passos curtos numerados). Posicionada entre o hero e a section "Maquinas com pelucias raras". 3 cards: **(1) Escaneie o QR da grua** 📷 — "Aponte a camera no QR colado na maquina, abre direto nessa grua, sem instalar nada"; **(2) Adicione saldo na hora** 💸 — "PIX em 2s ou cartao, R$ 5 = 1 partida 60s, saldo nunca expira, cashback 5%"; **(3) Confirme e jogue** 🎰 — "Toque em Jogar, grua libera automatica, 60s pra capturar, selfie vira manchete na galeria". Visual: numero em circulo gradient rosa, emoji 56px, top border gradient rainbow, hover lift. Layout mobile-first: 1 coluna empilhada; tablet+: 3 colunas lado a lado. CTAs no fim: "Cadastrar gratis" + "Mais detalhes" (link pra `#como-funciona`). SW v3 → v4.
- ✅ **MVP do painel admin (03/05/2026 18:10):** rota `#admin` no proprio SPA, gateada por role. Link "🛠️ Admin" no topbar so aparece se `/v1/auth/me` retornar `memberships[]` com `tenant_key=pelucias-demo` e `role in (admin, manager, owner)`. 3 estados: **noauth** (nao logado) → "Entre primeiro" + CTA login; **noaccess** (logado mas sem role) → "Sem permissao"; **dashboard** (admin) → painel com 4 KPIs (`/v1/claw/stats`), lista de maquinas (`/v1/map/points` cruzado com `/v1/claw/featured`), 8 wins recentes (`/v1/claw/gallery`), catalog de 17 modulos FreePix (`/v1/system/modules` com badges Ativo/Beta/Disponivel/Planejado), e 6 cards de roadmap honestos pra features que dependem de backend novo (controle financeiro por origem PIX/credito/moeda/dinheiro, comandos remotos, caixa fisico, horarios, operadores delegados, estoque por maquina). `fetchMe()` cache em memoria, invalidado em login/logout. Validado os 3 cenarios via mock no preview. SW v2 → v3 pra invalidar shell.
- ✅ **Admin do tenant promovido (03/05/2026 18:00):** `juniorisj17@gmail.com` (user_id=1, conta ja existia) elevado a `role=admin` no tenant `pelucias-demo` via `POST /v1/auth/admin/grant-tenant-role` com master secret. Pode logar via Google OAuth ou email+senha — qualquer endpoint do FreePix que valida `TenantMembership.role` agora reconhece como admin. Quando o painel admin for construido, basta checar `/v1/auth/me` -> `memberships[].role` pra liberar acesso.
- ✅ **Mapa de gruas (03/05/2026 17:55):** rota `#mapa` substitui `#maquinas` na bottom-nav e topbar. Leaflet 1.9.4 via CDN unpkg (com SRI integrity), tiles OpenStreetMap (sem chave/billing), DivIcon customizado (pin gota com emoji 🎰, cores verde/vermelho/cinza por status), popup com `name + status badge + endereco + premio raro disponivel`. `loadMap()` faz fetch paralelo `/v1/map/points?tenant_key=pelucias-demo&mappable_only=true` + `/v1/claw/featured?...&limit=50` e cruza por `device_id`. **Fallback:** se API retornar 0 pontos (estado atual — tenant nao tem `OperationalPoint` cadastrado), exibe 5 pontos demo (Shopping Iguatemi SP/POA, Morumbi, Center Norte, BarraShopping RJ) com banner dourado "📍 Mostrando localizacoes de demonstracao". Auto-fitBounds, scrollWheelZoom desabilitado (UX mobile), `invalidateSize()` ao trocar de viewport. SW cache version bumped v1 → v2 pra forçar invalidacao em prod.
- 🟡 Modulo `wallet_interop` (creditos cross-tenant) planejado para Sessao 9 da FreePix — sera o diferencial do Clube das Gruas (cliente compra credito no operador A e usa no operador B).

## Sessao ativa

`Sessao ativa: nenhuma`

> Antes de comecar trabalho neste projeto, preencher: `Sessao ativa: <nome do agente> iniciada em <dd/mm/aaaa hh:mm>`. Ao terminar, voltar para `nenhuma` e atualizar Changelog.

## Roadmap de producao (alinhado com Ivo em 04/05/2026)

### Visao do produto

**Plataforma SaaS multi-tenant whitelabel pra rede de auto-atendimento.** Cada **empresa** (operador) tem **sua pagina personalizada** com **seus usuarios**, **suas promocoes**, **seu cashback**, **seu preco de jogada**. O **cliente final e da plataforma** (nao da empresa) — Joao se cadastra uma vez (Google/email+senha) e pode ser cliente de N empresas do Clube simultaneamente, com saldo separado em cada (ja modelado: `WalletAccount` por user × tenant).

### Decisoes do Ivo

1. **Pagamento:** Mercado Pago **via API FreePix** (PIX + cartao salvo + boleto + assinatura recorrente). Front nunca chama MP direto.
2. **Cobranca Clube:** Mensalidade por maquina + pacotes pra empresa grande + taxa pequena sobre transacoes PIX/cartao (moeda/dinheiro fisico sem taxa). **Numeros ainda nao definidos** — modelar `OperatorSubscription` parametrizavel.
3. **Hardware:** nao expor valor publicamente. Conversa por WhatsApp caso a caso.
4. **Whitelabel:** subdominio gratis automatico — `<nome-empresa>.clubedasgruas.com.br`. Wildcard cert quando chegar Fase 1.

### Conceito-chave: cliente compartilhado entre empresas

- `PlatformUser` global (1 conta por email)
- `TenantMembership` por (user, tenant) — Joao vira "end_user" em N empresas
- `WalletAccount` por (user × tenant × moeda) — saldos separados
- Cada empresa configura seu cashback %, suas promocoes, seu preco da jogada
- Cliente recebe notificacao via canal preferido (email/WhatsApp) por empresa que ele segue

### Fase 1 — Whitelabel + ESP32 MQTT MVP (proxima, 2-3 sessoes)

**Objetivo:** primeiro operador pagante real consegue subir uma grua e ganhar dinheiro.

- Backend `freepix`: 
  - `WalletEntry.source_kind` (PIX/cartao/moeda/dinheiro) + MQTT consumer (Sessao 8 da freepix ja planejada)
  - Comandos remotos basicos (give_credit + on/off) via MQTT publish
  - Endpoint `/v1/sites/{slug}/config` retorna logo, cor, fotos, preco da jogada, cashback %
  - `OperatorSubscription` parametrizavel
- Backend `freepix` + MP: integracao Mercado Pago (assinatura cartao recorrente + PIX dinamico)
- Firmware ESP32: cliente MQTT basico (sub `freepix/{cp_code}/cmd/*`, pub heartbeat + pulse + status)
- Front `demo_pelucias`: refatorar pra ler `/v1/sites/{slug}/config` e renderizar logo/cor/fotos/preco/cashback do tenant. Site vira whitelabel real.
- Front: cadastro de empresa-operadora (admin) → tenant criado + subdominio funcional
- Front admin: cadastro de maquina (associar MAC → empresa → loja), restock, ver pulso ao vivo

### Fase 2 — Cobranca recorrente + impressao (1-2 sessoes)

**Objetivo:** Clube cobra do operador automatico; operador imprime QR pra colar na grua.

- Backend: `OperatorSubscription` ativa cobranca recorrente via MP (cartao salvo)
- Backend: registro de boleto via MP
- Front admin: tela "minha mensalidade", historico, salvar cartao
- Front: gerar QR code da loja em PDF imprimivel (logo + URL `<empresa>.clubedasgruas.com.br/loja/{slug}`)
- Front: imprimir QR PIX recebimento (MP QR copia-e-cola)
- Backend: notificar cliente (email/WhatsApp) quando empresa que ele segue cria promocao

### Fase 3 — Caixa fisico + repasse Clube (2 sessoes)

**Objetivo:** auditoria completa do dinheiro; settlement Clube ↔ operador automatico.

- Backend: `CashCount` (contagem manual dinheiro/moeda) + endpoint reconciliacao com pulso ESP32
- Backend: modulo `wallet_interop` (signature) — settlement mensal Clube ↔ operador, taxa configuravel
- Backend: modelo `Promotion` (codigo desconto, "primeira jogada R$ 1", happy hour, etc)
- Front admin: tela "fechar caixa" (contagem manual + diff pulso)
- Front admin: extrato com filtro por origem (PIX/cartao/moeda/dinheiro)
- Front admin: gerenciar promocoes do tenant

### Fase 4 — Operadores delegados + horarios + relatorios (1-2 sessoes)

**Objetivo:** lojas grandes (10 maquinas em 4 enderecos) operam com varios funcionarios.

- Backend: hierarquia operador → loja → maquina → operador delegado com permissao especifica (`MerchantMembership` ja existe)
- Backend: `OperatingHours` por maquina (auto-off fora do horario)
- Front admin: gestao de usuarios delegados, atribuicao de maquinas, dashboard hierarquico
- Front admin: relatorios BI (faturamento por loja, premios entregues, churn, etc)

### Bloqueador atual

**Login admin Google em prod ainda nao confirmado funcionando** apos commits `06b11d8` (freepix) + `45217fd` (demo_pelucias). Ivo precisa testar (hard-reload em http://216.238.116.255:8081/, login Google, verificar se aparece botao "🛠️ Admin"). **Necessario antes de avancar pra Fase 1** — fundacao auth precisa estar solida.

## Pendencias para a proxima sessao

### Painel admin do operador (Ivo pediu — escopo grande, depende de backend novo)

**Visao do Ivo (resumo):** "fulano tem 10 maquinas em 4 lojas, pode delegar usuarios pra operar; controle de status, creditos remotos, mapa de horarios ligada/desligada, controle financeiro de entradas (PIX/credito/moeda/dinheiro por pulso ESP32), verificar caixa fisico, repor estoque ursos."

**Pre-requisitos no backend `freepix` (provavelmente 2-3 sessoes):**

1. **Multi-tenancy hierarquico operador → loja → maquina → operador delegado**
   - `TenantMembership` ja existe (role: admin/end_user/manager). Falta um nivel intermediario tipo "merchant_operator" com escopo por maquina especifica (`Merchant` ja existe + `MerchantMembership`).
   - Endpoint `POST /v1/merchants/{id}/operators/grant` pra delegar acesso a uma maquina especifica.
2. **Ledger financeiro com origem por pulso (PIX vs credito vs moeda vs dinheiro)**
   - `WalletEntry` ja e idempotente, mas precisa campo `source_kind` (`pix` | `card_credit` | `coin` | `bill` | `wallet_credit`) e `source_device_id`.
   - Cada pulso da ESP32 com tipo de origem vira um `WalletEntry` com `source_kind` correspondente.
3. **Sessao 8 da FreePix (ja planejada): MQTT consumer + ESP32 firmware**
   - Worker async subscrevendo `freepix/{cp_code}/event/{coin,bill,pix,card}` e roteando pra `wallet_service.credit()` ja com `source_kind`.
   - Firmware ESP32 publica pulso por sensor (acumulador moedas, validador notas, ack PIX).
4. **Comandos remotos pra claw machines (analogo ao OCPP RemoteStart):**
   - Endpoint `POST /v1/claw/machines/{device_id}/commands` com `kind=give_credit|on|off|reset`.
   - Worker MQTT publica em `freepix/{cp_code}/cmd/{kind}`.
5. **Caixa fisico (CashRegister + reconciliacao):**
   - Modelo `CashCount` (snapshot de quanto tem na maquina em moeda + cedula, com timestamp e operador que contou).
   - Endpoint `POST /v1/claw/machines/{device_id}/cash-count` pra registrar contagem.
   - Diff entre `CashCount` e soma de `WalletEntry source_kind in (coin, bill)` desde a contagem anterior.
6. **OperatingHours por maquina (horarios abertura/fechamento):**
   - Modelo `MachineSchedule` com `device_id`, `weekday`, `open_time`, `close_time`.
   - Endpoint CRUD + integracao com comandos remotos (auto-off fora do horario).
   - **Reuso possivel:** o modulo `scheduling` da Sessao 5 ja tem `Schedule`/`ScheduleSlot` mas pra reservas, nao pra horario operacional. Pode-se estender ou criar paralelo.

**Frontend (depois do backend):**

- Login admin via `/v1/auth/login` + check `TenantMembership.role in (admin, manager)` no `/v1/auth/me`. Login social Google ja funciona — admin podera entrar com Google se promover a conta dele a admin.
- Promocao a admin: `POST /v1/auth/admin/grant-tenant-role` ja existe em `platform_auth.py:896` (precisa master secret pra cross-tenant). Ivo pode usar pra promover a conta dele do `pelucias-demo`.
- Site separado ou rota protegida `#admin` no proprio `clubedasgruas.com.br` — decisao quando comecar.
- Sub-rotas: dashboard (KPIs financeiros), maquinas (lista com drilldown: status / estoque / pulso / caixa / horario), lojas, financeiro (extrato com filtro por origem PIX/credito/moeda/dinheiro), usuarios (delegar acesso por maquina), modulos FreePix ativos.

**Acao concreta possivel hoje (sem todo o backend novo):** versao MVP do admin so com o que ja existe — login + lista de maquinas (`/v1/map/points?kind=device`) + estoque por maquina (`/v1/claw/machines/{id}/inventory`) + galeria de wins + carteira do tenant (`/v1/wallet/*`). Mas o "controle financeiro por origem" e "creditos remotos" o "caixa fisico" ficam pendentes.

### Outras pendencias

1. **Teste end-to-end manual do Google OAuth no browser real** — http://216.238.116.255:8081/#cadastro → "Continuar com Google" → login real → verificar volta em `#conta`.
2. **Cadastrar 5 maquinas reais no `pelucias-demo`** via `POST /v1/operational-points` com tenant secret (substitui o fallback demo do mapa por dados reais). Pode usar o painel admin existente da FreePix em `/admin/operational-points` se exposto.
3. **Criar A record `clubedasgruas.com.br` → 216.238.116.255** no registro.br (acao do Ivo).
3. **Rodar certbot** apos DNS propagar:
   ```bash
   ssh veiculos-vps 'certbot --nginx -d clubedasgruas.com.br -d www.clubedasgruas.com.br --non-interactive --agree-tos -m juniorisj17@gmail.com --redirect'
   ```
   PWA so instala em HTTPS — o service worker fica registrado mas inativo enquanto for HTTP.
4. **Configurar credenciais Facebook + Apple OAuth** quando Ivo decidir abrir conta de developer (Meta + Apple Developer Program). Botoes ja estao no front com badge "Em breve" — basta tirar o `disabled` e ajustar o handler.
5. **Sessao 8 da FreePix (proxima):** MQTT consumer + ESP32 firmware (auth no mosquitto, worker subscrevendo `freepix/+/event/+`, esboco firmware).
6. **Sessao 9 da FreePix (futura):** modulo `wallet_interop` — feature signature do Clube das Gruas. Modelos `InteropMembership`, `InteropTransfer`, `SettlementBatch`. Categoria `network`. Ledger por tenant + settlement mensal entre operadores afiliados.
7. **Trocar fotos `picsum.photos` por reais** quando tiver fotos das pelucias do Ivo.
8. **Adicionar PIX top-up** (botao "+ Adicionar saldo" hoje so toasta — integrar com `/v1/payments/pix` quando expor).
9. **Icone iOS PNG** — hoje o `apple-touch-icon` aponta pra `assets/icon.svg`; iOS Safari pode ignorar SVG e gerar miniatura do site. Quando relevante, gerar versao PNG (180x180 ou 192x192) e apontar.

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
- **04/05/2026** - Claude Code - **HTTPS em https://clubedasgruas.com.br.** Ivo criou A records no registro.br (raiz + www). Wildcard nao foi aceito no modo basico (limitacao registro.br). Certbot Let's Encrypt rodado com sucesso (HTTP-01 + --nginx + --redirect), cert valido ate 02/08/2026 com renovacao automatica. Certbot adicionou `return 404` no bloco HTTP que quebrou acesso direto via IP:8081 — corrigido editando nginx config: redirect HTTPS so pros dominios oficiais (via `if ($host = ...)`), demais hosts servem normal. Backup em `/etc/nginx/sites-available/pelucias-freepix.bak.20260504-precert`. Smoke completo: https/200 nos 2 dominios, http→https 301, IP:8081 200 restaurado, autopasso.com.br 200 (intacto). **Bloqueador pra Fase 1.1 whitelabel via subdominio:** registro.br modo basico nao aceita `*.` — escalar exige Cloudflare ou A record manual por empresa. Pra dev imediato, uso `?tenant=<slug>` querystring.
- **04/05/2026** - Claude Code - **Roadmap de producao alinhado.** 4 fases registradas oficialmente no AGENTS.md (Whitelabel + ESP32 MQTT MVP → Cobranca recorrente + impressao → Caixa fisico + repasse Clube → Operadores delegados + horarios + relatorios). Decisoes do Ivo: pagamento Mercado Pago via API freepix; mensalidade por maquina + pacotes + taxa pequena (numeros nao fixados — modelar parametrizavel); subdominio `<empresa>.clubedasgruas.com.br` (whitelabel via wildcard cert); cliente da plataforma compartilhado entre tenants (`PlatformUser` global, membership por tenant, wallet separado — ja modelado). Tirados valores R$ 180/7% da landing operador, substituidos por "fala com a gente no WhatsApp pra fechar pacote". SW v6 → v7. Bloqueador antes da Fase 1: Ivo precisa confirmar que login admin Google em prod esta funcionando apos commits 06b11d8/45217fd.
- **04/05/2026** - Claude Code - **Login Google volta a funcionar pra admin (bridge_exchange retorna JWT).** Mudanca cross-project no `freepix` ([platform_auth.py:845](D:/FreePix/freepix/platform_auth.py:845)): bridge_exchange cria session + emite access_token JWT na resposta, alem dos dados do user. Front (`handleBridgeToken` em [app.js](assets/app.js)) usa `res.access_token` no `setSession` em vez de `null`. Resolve o problema do link "🛠️ Admin" nao aparecer apos login Google — `fetchMe()` agora consegue chamar `/v1/auth/me` com Bearer JWT real (browsers bloqueiam cookies HttpOnly cross-origin do api.freepix.net.br pro 216.238.116.255). 168/168 tests freepix passando, deploy `freepix-api.service` restartado (active, health 200), bridge/exchange invalido 400, /me 401 sem token, autopasso 200 (intacto). SW v5 → v6.
- **04/05/2026** - Claude Code - **Fotos picsum filtradas + landing operador B2B (`#operador`).** Helper `isPlaceholderPhoto()` no front detecta seeds antigos do `pelucias-demo` apontando pra `picsum.photos` e troca por fallback estilizado (gradient por raridade + emoji XL). Featured cards 96px com hover scale+rotate; gallery 64px. Nova rota `#operador` com hero escuro/dourado com 🧸 watermark gigante, 6 cards de beneficios, 4 passos de onboarding, pricing transparente (R$ 180 ESP32 + 7% PIX/cartao + sem fidelidade), 2 CTAs WhatsApp `wa.me/5554993793621`. Link "Pra operadores" no topbar e footer. SW v4 → v5. Smoke prod: demo 200, autopasso 200 (intacto).
- **04/05/2026** - Claude Code - **Secao "Como jogar" didatica na home (inspirada em aguapetrus.com.br).** 3 passos numerados QR→Saldo→Jogar entre hero e featured. Cards com numero em circulo gradient rosa, emoji 56px, top border rainbow, hover lift. Mobile-first 1 coluna; tablet+ 3 colunas. CTAs "Cadastrar gratis" + "Mais detalhes" (link #como-funciona). SW v3 → v4. Validado mobile+tablet, deploy demo 200, autopasso 200.
- **03/05/2026 18:10** - Claude Code - **MVP painel admin entregue.** Rota `#admin` no SPA com 3 gates (noauth/noaccess/dashboard) baseado em `/v1/auth/me` -> `memberships[].role`. Link "🛠️ Admin" no topbar so visivel pra admin. Dashboard: 4 KPIs reais, lista maquinas (cruza /v1/map/points com /v1/claw/featured), 8 wins recentes da galeria, catalog completo de 17 modulos FreePix, 6 cards de roadmap honestos (controle financeiro por origem, comandos remotos, caixa fisico, horarios, operadores delegados, estoque). Validado os 3 cenarios via mock no preview. Deploy via tar/ssh: demo 200, autopasso 200 (intacto), SW v3 confirmado em prod. **NAO incluido (depende de backend novo, registrado em pendencias):** ledger por origem PIX/credito/moeda/dinheiro do pulso ESP32, comandos remotos a maquina, caixa fisico, horarios programados, multi-tenancy hierarquico operador→loja→delegados.
- **03/05/2026 18:00** - Claude Code - **Admin do tenant promovido.** `juniorisj17@gmail.com` (user_id=1) elevado a `role=admin` no tenant `pelucias-demo` via `POST /v1/auth/admin/grant-tenant-role` com `X-Freepix-Secret: <FREEPIX_SHARED_SECRET>` (master). Conta ja existia (`user_created: false`). Resposta: `{status: ok, user_id: 1, email, tenant_key: pelucias-demo, role: admin}`. Master secret obtido via `ssh api-freepix 'grep ... /opt/freepix_api/.env'` em pipe (sem deixar no shell history).
- **03/05/2026 17:55** - Claude Code - **Mapa interativo das gruas (rota #mapa).** Substituiu "Maquinas" na bottom-nav e topbar (decisao do Ivo: opcao c — mapa serve como catalogo, com lista de maquinas dentro do popup). Leaflet 1.9.4 via unpkg CDN com SRI integrity, tiles OpenStreetMap (sem chave). DivIcon customizado pin gota com emoji 🎰, cores verde/vermelho/cinza por status. Popup mostra `name + status badge + endereco + premio raro disponivel` (cruzando `/v1/map/points` com `/v1/claw/featured` por device_id). Fallback elegante: como tenant `pelucias-demo` ainda nao tem `OperationalPoint` cadastrado, exibe 5 pontos demo (Iguatemi SP/POA, Morumbi, Center Norte, BarraShopping RJ) com banner dourado "Mostrando localizacoes de demonstracao". Auto-fitBounds, scrollWheelZoom desabilitado pra UX mobile, `invalidateSize()` ao trocar viewport. `sw.js` cache version v1 → v2 pra forçar invalidacao em prod. Validado no preview mobile (5 markers, 3 online + 1 offline + 1 pending) e tablet (mapa 740x701, top-nav ativo). Deploy via tar/ssh: demo 200, autopasso 200 (intacto), Leaflet+rota+SW v2 confirmados em prod. **Painel admin (escopo grande pedido pelo Ivo) registrado em detalhes nas pendencias** — depende de varios modelos novos no backend (multi-tenancy hierarquico, ledger por origem, MQTT pulso, comandos remotos, caixa fisico, horarios).
- **03/05/2026 17:42** - Claude Code - **CORS validado na FreePix API + Google OAuth backend confirmado.** Ivo liberou CORS no FastAPI da freepix; validado via curl com 3 origins (localhost:5500, 216.238.116.255:8081, e error response do bridge_exchange) — todos refletem `access-control-allow-origin` corretamente, `allow-credentials: true`, `vary: Origin`. Site no preview consumiu API end-to-end: 12 premios, 5 raros, 8 ultimas 24h, 2 maquinas, 8 cards galeria, ZERO erros no console (antes 12+ TypeError). `/v1/auth/google/start` retorna 302 pra Google com client_id configurado — login social pronto, falta so teste manual no browser do Ivo (preview tool nao permite navegacao top-level por JS pra terceiros). Sem mudanca de codigo, so doc.
- **03/05/2026 17:35** - Claude Code - **PWA mobile-first + login social.** 3 arquivos novos: `manifest.json` (display:standalone, theme #ff5ea1, icons[svg maskable]), `assets/icon.svg` (ursinho desenhado em paths SVG, gradient rosa→lavanda→dourado), `sw.js` (cache-first do shell, network-only pra api.freepix). `assets/style.css` reescrito mobile-first (605→721 linhas) com bottom-nav fixa de 4 abas, tap targets ≥44px, inputs 16px (anti-zoom iOS), safe-area-inset-bottom. `index.html` ganhou meta PWA/iOS, bottom-nav, modal "Esqueci minha senha", install-prompt, e em ambas as paginas auth: 3 botoes sociais (Google funcional + Facebook/Apple disabled "Em breve") + divider "ou" + form email+senha mantido. `assets/app.js`: handler `handleBridgeToken()` (le `?token=` do callback Google e troca via `/v1/auth/bridge/exchange`), `startGoogleOAuth()` (redirect a `/v1/auth/google/start?tenant_key=pelucias-demo&site_slug=clubedasgruas&return_url=...`), modal esqueci senha (POST `/v1/auth/password/forgot`), `registerServiceWorker()` + `setupInstallPrompt()` (beforeinstallprompt). Validado mobile (375x812) + tablet (768x1024): bottom-nav some no tablet, top-nav reaparece, modal abre/fecha, URLs OAuth corretas. Deploy via tar `tar -C /d/FreePix/demo_pelucias --exclude=./.git --exclude=./.claude --exclude=./.secrets -czf - . | ssh veiculos-vps`. Smoke: demo 200, autopasso 200 (intacto), manifest/sw/icon servidos pelo nginx. **Problema descoberto e flagged pra Sessao seguinte:** `api.freepix.net.br` nao tem CORS — todas chamadas do front falham silenciosamente, requer middleware CORS no FastAPI da freepix.
