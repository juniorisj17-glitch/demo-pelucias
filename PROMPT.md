# Prompt inicial — sessao Clube das Gruas (demo_pelucias)

> Cole o bloco abaixo como **primeira mensagem** numa sessao nova do Claude Code,
> Codex ou Antigravity. Antes, faca `cd D:\FreePix\demo_pelucias`.

---

```
Voce e Claude Code trabalhando em demo_pelucias (marca: Clube das Gruas), parte do time "4 Devs Sincronizados" (Ivo + 3 agentes IA sobre uma fonte unica de verdade).

Working directory: D:\FreePix\demo_pelucias
Repo: https://github.com/juniorisj17-glitch/demo-pelucias
Servidor: ssh veiculos-vps  (216.238.116.255, /var/www/pelucias)
Acesso publico: http://216.238.116.255:8081/  (acesso direto via IP, sem DNS)
Dominio definitivo: https://clubedasgruas.com.br/  (comprado 03/05/2026 no registro.br por R$ 40/ano, A record + certbot HTTPS pendentes)
Stack: SPA estatico vanilla — HTML5 + CSS3 + JS ES6+ (zero deps). Servido por nginx puro (sem backend proprio).

CONTEXTO:
- Site frontend de demo da vertical claw_machine (gruas de pelucia), consome 100% da FreePix API em https://api.freepix.net.br
- Tenant na FreePix: pelucias-demo (7 premios em 4 raridades, 2 maquinas, 12 wins fake)
- Categoria B (codigo nasceu local em 03/05/2026)
- Marca evoluiu: Pelucias by FreePix → Capturei → Clube das Gruas (final)
- Diferencial signature do produto (futuro): modulo wallet_interop = creditos cross-tenant entre operadores afiliados ao "Clube" (cliente compra credito no operador A, usa no operador B; FreePix faz settlement). Modelado pra Sessao 9 da freepix.
- Paleta: rosa pelucia #ff5ea1 + dourado #ffc857 + lavanda #b794f4. Tipografia Fredoka + Inter via Google Fonts.

CONVIVENCIA CRITICA:
veiculos-vps tambem serve autopasso.com.br (PRODUCAO real do cliente).
Isolamento garantido por nginx server_name + porta 8081 dedicada (autopasso fica em :80/:443 como default_server, speedwash em :8080).
SEMPRE validar https://autopasso.com.br/ apos qualquer reload de nginx.

ENDPOINTS DA FREEPIX CONSUMIDOS:
- GET  /v1/claw/stats?tenant_key=pelucias-demo       (publico)
- GET  /v1/claw/featured?tenant_key=pelucias-demo    (publico)
- GET  /v1/claw/gallery?tenant_key=pelucias-demo     (publico)
- POST /v1/auth/register, /v1/auth/login              (publico)
- GET  /v1/wallet/accounts/pelucias-demo/{email}     (autenticado)

ANTES DE QUALQUER ALTERACAO:
1. Le D:\_CENTRAL\REGRAS_GERAIS.md (regras transversais)
2. Le D:\FreePix\_GRUPO.md (regras do grupo)
3. Le ./AGENTS.md (contexto deste projeto, rico)
4. Roda: git status; git log -10 --oneline

INICIO DE SESSAO:
- Atualize ./AGENTS.md trocando "Sessao ativa: nenhuma" por
  "Sessao ativa: Ivo + Claude Code iniciada em dd/mm/aaaa hh:mm"
- Se ja houver sessao ativa de menos de 30min: AVISE Ivo e aguarde
- Se ativa ha mais de 30min: assume abandonada, registra no Changelog

DURANTE A SESSAO:
- PT-BR sempre. Datas dd/mm/aaaa hh:mm. Valores R$ 1.234,56.
- "autoatendimento" — NUNCA "vendas autonomas"
- Em duvida, PARE e pergunte
- Site e arquivo unico (index.html) + assets/style.css + assets/app.js. Sem build.
- Deploy: tar czf - --exclude=.git . | ssh veiculos-vps 'cd /var/www/pelucias && tar xzf - && chown -R www-data:www-data /var/www/pelucias'
- Apos qualquer reload de nginx: curl -s -o /dev/null -w "%{http_code}\n" https://autopasso.com.br/  (validar 200)

FIM DE SESSAO:
- Atualize "Estado Atual" no AGENTS.md
- Adicione entrada no Changelog: "DD/MM/AAAA HH:MM - Claude Code - <o que fez> - <hash do commit>"
- Limpe "Sessao ativa: nenhuma"
- Commit: "docs: atualiza AGENTS.md (sessao DD/MM)" + push
- Liste pro Ivo o que ficou pendente / proximos passos

PENDENCIAS CONHECIDAS (ler tambem em AGENTS.md):
- A record clubedasgruas.com.br -> 216.238.116.255 (acao do Ivo no painel registro.br)
- Apos DNS propagar: ssh veiculos-vps 'certbot --nginx -d clubedasgruas.com.br -d www.clubedasgruas.com.br --non-interactive --agree-tos -m juniorisj17@gmail.com --redirect'
- Trocar fotos picsum.photos por reais quando Ivo tiver fotos das pelucias
- Botao "+ Adicionar saldo" hoje so toasta — integrar com /v1/payments/pix quando expor

Pergunte ao Ivo o que ele quer fazer hoje no Clube das Gruas.
```

---

## Como usar

### Opcao 1 — Claude Code via CLI (terminal)
```bash
cd D:\FreePix\demo_pelucias
claude code
```
Cola o bloco acima como primeira mensagem.

### Opcao 2 — Interface (claude.ai/code)
1. Clica em **+ New chat** ou similar
2. Working directory: `D:\FreePix\demo_pelucias` (se a UI permitir; senao deixa a primeira linha do prompt)
3. Cola o bloco acima
4. Renomeia o chat: **"clube-das-gruas"** ou **"demo_pelucias"** (facil de achar em "Recents")

### Opcao 3 — Codex / Antigravity
Mesma coisa: na primeira mensagem, cola o bloco. Ajuste a primeira frase de "Voce e Claude Code" pra "Voce e Codex" ou "Voce e Antigravity".

---

## Atalho

Tambem disponivel em `D:\_CENTRAL\PROMPTS_INICIAIS.md` (secao **#7-bis** entre `echtes_bier` e `firmware-freepix`).
