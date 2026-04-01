# Story 1.4 — Environment Variables

## Contexto
Todas as APIs externas (Supabase, Anthropic, Meta Cloud API) precisam de credenciais configuradas. O `.env.example` serve como documentacao viva das variaveis necessarias. As variaveis precisam estar tanto no `.env.local` (dev) quanto na Vercel (producao). Sem isso, nenhuma integracao funciona.

## Acceptance Criteria
- [ ] AC1: `.env.example` criado na raiz com TODAS as variaveis necessarias (sem valores reais)
- [ ] AC2: `.env.local` criado localmente com valores reais de dev/staging
- [ ] AC3: Variaveis Supabase configuradas: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] AC4: Variavel Anthropic configurada: `ANTHROPIC_API_KEY`
- [ ] AC5: Variaveis Meta/WhatsApp Cloud API configuradas (mesmo que vazias por enquanto): `META_WHATSAPP_PHONE_NUMBER_ID`, `META_WHATSAPP_ACCESS_TOKEN`, `META_WHATSAPP_VERIFY_TOKEN`, `META_WABA_ID`
- [ ] AC6: Variavel Telegram fallback: `TELEGRAM_BOT_TOKEN` (para caso de fallback)
- [ ] AC7: Variaveis utilitarias: `NEXT_PUBLIC_APP_URL`, `NODE_ENV`
- [ ] AC8: `packages/db/src/client.ts` le variaveis Supabase e exporta client configurado
- [ ] AC9: `packages/ai/src/client.ts` le variavel Anthropic e exporta client configurado
- [ ] AC10: Variaveis de producao configuradas no dashboard Vercel
- [ ] AC11: `.gitignore` confirma que `.env.local` e `.env` NAO sao commitados

## Detalhes Tecnicos

### Arquivo `.env.example`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic (Claude)
ANTHROPIC_API_KEY=

# Meta WhatsApp Cloud API
META_WHATSAPP_PHONE_NUMBER_ID=
META_WHATSAPP_ACCESS_TOKEN=
META_WHATSAPP_VERIFY_TOKEN=
META_WABA_ID=
META_APP_SECRET=

# Telegram (fallback)
TELEGRAM_BOT_TOKEN=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Arquivos a criar/modificar:
- `.env.example` (raiz)
- `packages/db/src/client.ts` — Supabase client com env vars
- `packages/ai/src/client.ts` — Anthropic client com env vars

### Referencia agente-linda:
- Adaptar de `~/agente-linda/.env.example`
- Adaptar clients de `~/agente-linda/packages/db/src/client.ts` e `~/agente-linda/packages/ai/src/client.ts`

## Dependencias
- Depende de: 1.1 (repo), 1.2 (Supabase criado com URL e keys)
- Bloqueia: 1.6 (auth precisa do Supabase client), todo Bloco 3 (AI client)

## Estimativa
P (Pequena) — 1 hora
