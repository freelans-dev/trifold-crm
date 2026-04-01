# Deploy Flow — Trifold CRM

## Ambientes

| Ambiente | Supabase | Canal | Branch |
|----------|----------|-------|--------|
| **Staging** | dsopqkqjkmhytudaaolv | Telegram | staging |
| **Producao** | (a criar) | WhatsApp Cloud API | main |

## Variaveis por Ambiente

### Obrigatorias (ambos)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`

### Staging only
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`

### Producao only
- `META_WHATSAPP_ACCESS_TOKEN`, `META_WHATSAPP_PHONE_NUMBER_ID`
- `META_WHATSAPP_VERIFY_TOKEN`, `META_APP_SECRET`

## Migrations

```bash
# Staging
export SUPABASE_ACCESS_TOKEN=sbp_...
./scripts/sync-schema.sh staging

# Ambos
./scripts/sync-schema.sh both
```

## Seeds

```bash
pnpm seed                              # Org, users, stages, prompts
pnpm tsx scripts/seed-properties.ts    # Vind + Yarden
pnpm tsx scripts/seed-knowledge-base.ts # FAQ (25 entries)
```

## Vercel

- Root: packages/web
- Build: `cd ../.. && pnpm turbo build --filter=@trifold/web`
- Install: `pnpm install`
