# Story 1.1 — Setup Repositorio GitHub

## Contexto
Pre-requisito absoluto. Sem repositorio nao existe projeto. O Trifold CRM segue a mesma estrutura monorepo do agente-linda (Turborepo), adaptada para o dominio imobiliario. O repo precisa estar na org `freelans-dev` como privado, com CI/CD via Vercel pronto desde o dia 1.

## Acceptance Criteria
- [x] AC1: Repositorio `trifold-crm` criado na org `freelans-dev` no GitHub como publico (https://github.com/freelans-dev/trifold-crm)
- [x] AC2: Monorepo inicializado com Turborepo contendo 5 packages: `web`, `ai`, `db`, `bot`, `shared`
- [x] AC3: `packages/web` inicializado com Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- [x] AC4: `packages/ai` inicializado com estrutura para Claude client (Anthropic SDK), prompts, guardrails, RAG
- [x] AC5: `packages/db` inicializado com Supabase client (@supabase/supabase-js), types gerados, migrations
- [x] AC6: `packages/bot` inicializado com estrutura para WhatsApp Cloud API adapter (e Telegram fallback)
- [x] AC7: `packages/shared` inicializado com types, utils e constants compartilhados
- [x] AC8: `turbo.json` configurado com pipelines: `build`, `dev`, `lint`, `type-check`
- [x] AC9: `.gitignore` inclui `node_modules`, `.env*`, `.next`, `dist`
- [x] AC10: Root `package.json` com scripts `dev`, `build`, `lint`, `type-check`
- [x] AC11: `pnpm-workspace.yaml` configurado para os 5 packages
- [x] AC12: Primeiro commit e push feito com sucesso para `main`

## Detalhes Tecnicos

### Estrutura de diretorios a criar:
```
trifold-crm/
├── packages/
│   ├── web/          # Next.js 15+ App Router
│   ├── ai/           # Claude client, prompts, RAG
│   ├── db/           # Supabase client, migrations, types
│   ├── bot/          # WhatsApp Cloud API / Telegram adapter
│   └── shared/       # Types, utils, constants
├── supabase/         # Migrations, seed data
├── docs/             # (ja existe)
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.json     # Base TS config
└── .gitignore
```

### Referencia agente-linda:
- Copiar e adaptar estrutura de `~/agente-linda/` (mesmo monorepo pattern)
- `turbo.json`, `pnpm-workspace.yaml`, `tsconfig.json` base podem ser copiados diretamente
- `packages/web` segue mesmo setup: Next.js + Tailwind + shadcn/ui

### Packages iniciais por workspace:
- **web**: `next`, `react`, `react-dom`, `tailwindcss`, `@radix-ui/*`, `lucide-react`, `clsx`, `tailwind-merge`
- **ai**: `@anthropic-ai/sdk`
- **db**: `@supabase/supabase-js`, `@supabase/ssr`
- **bot**: (vazio por enquanto, dependencias adicionadas na story 3.8)
- **shared**: apenas TypeScript, sem dependencias externas

## Dependencias
- Depende de: nenhuma (primeiro item)
- Bloqueia: TODAS as outras stories

## Estimativa
M (Media) — 2-3 horas

## File List

### Created/Modified
- `turbo.json` — Configuracao de pipelines do Turborepo
- `pnpm-workspace.yaml` — Workspace dos 5 packages
- `package.json` — Root package com scripts dev/build/lint/type-check
- `tsconfig.json` — Base TypeScript config
- `.gitignore` — Inclui node_modules, .env*, .next, dist
- `packages/web/` — Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- `packages/ai/` — Estrutura para Claude client (Anthropic SDK), prompts, guardrails, RAG
- `packages/db/` — Supabase client (@supabase/supabase-js), types, migrations
- `packages/bot/` — Estrutura para adapters de mensageria
- `packages/shared/` — Types, utils e constants compartilhados
