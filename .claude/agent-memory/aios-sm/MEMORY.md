# SM Agent Memory — River

## Project Context
- Platform: Plataforma de Avaliação Imobiliária (Real Estate Valuation SaaS)
- Stack: Next.js 16+ / Supabase (PostgreSQL + PostGIS) / Stripe / Resend / Vercel
- PRD: `docs/prd/prd.md` | Architecture: `docs/architecture/plataforma-avaliacao-imobiliaria.md`
- Stories location: `docs/stories/active/`
- Epic overview: `docs/stories/epics/mvp-epic-overview.md`

## MVP Stories Created (2026-03-11)
17 stories for 4 epics. All in `docs/stories/active/`:
- Epic 1 (Foundation): story-1.1, 1.2, 1.3, 1.4
- Epic 2 (Valuation Engine): story-2.1, 2.2, 2.3, 2.4, 2.5
- Epic 3 (Dashboard): story-3.1, 3.2, 3.3, 3.4
- Epic 4 (Monetization): story-4.1, 4.2, 4.3, 4.4

## Critical Domain Rules (always check in story drafts)
1. CNAI number mandatory for NBR 14653 report generation (COFECI Resolução 1066/2007)
2. Ross-Heidecke table: 51 rows, 8 conservation columns, age_ratio_pct 0–100 in 2% steps
3. Legal disclaimer REQUIRED on /resultado pages (architecture section 6.4 exact wording)
4. LGPD consent: checkbox required + lgpd_consent_at timestamp on lead creation
5. Public valuation links NEVER gated by subscription (/avaliar/{slug} always works)
6. Progressive radius: 2km → 5km → 10km for comparable search
7. Offer discount: listing prices × 0.90, ITBI (is_transaction=true) × 1.0

## Patterns Confirmed
- Story executor assignments: @dev for frontend/API, @data-engineer for schema/migrations, @devops for infra
- CodeRabbit integration is ENABLED (core-config.yaml: coderabbit_integration.enabled: true)
- Testing framework: Vitest (unit) + Playwright (E2E) — NOT Jest
- Supabase client: createBrowserClient (client) vs createServerClient (server) — always distinguish
- Always use service_role key for public-facing inserts that bypass RLS
- All imports must be absolute using @/ alias (per CLAUDE.md)
