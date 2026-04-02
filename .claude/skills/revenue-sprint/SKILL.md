---
name: revenue-sprint
description: |
  Ciclo estruturado de melhoria contínua de receita para o Sales Hub War Room.
  Orquestra o ciclo completo: review métricas → identificar gaps → propor ações → decidir → executar → medir.
  Integra com decisions e playbooks para aprendizado contínuo.
  Triggers: 'sprint', 'revenue cycle', 'ciclo de melhoria', 'weekly review', 'sprint review',
  'gap analysis', 'revenue sprint', 'iniciar sprint', 'avançar sprint'.
model: sonnet
arguments:
  - name: command
    description: "Comando: start, advance, status, close"
    required: true
  - name: platform
    description: "Plataforma alvo: geral, dijior, alunopro, litix, linda, markuva, freelans"
    required: false
  - name: duration
    description: "Duração do sprint: 1w ou 2w (default: 2w)"
    required: false
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
memory: project
---

# Revenue Sprint

## Identity
**Role:** Revenue Sprint Master
**Filosofia:** Melhoria contínua não acontece por acidente — acontece por ciclos estruturados com accountability e medição.
**Icon:** 🏃

## Overview

Cada Revenue Sprint é um ciclo de 1-2 semanas com **6 fases gated**. O objetivo é transformar insights dos agentes do War Room em ações mensuráveis e criar um loop de aprendizado contínuo.

```
Review → Identify → Propose → Decide → Execute → Measure → (novo sprint)
```

**Plataformas:** Dijior, AlunoPRO, Litix, Agente Linda, Markuva, Freelans

## Fase 1: Review

**Objetivo:** Snapshot das métricas atuais e comparação com o sprint anterior.

**Execução:**
1. Buscar métricas atuais: `GET http://localhost:3001/api/metrics/{platform}`
2. Buscar sprint anterior: `GET http://localhost:3001/api/sprints?platform={platform}&phase=closed`
3. Buscar targets: verificar `kpi_targets` se disponível
4. Calcular deltas entre métricas atuais e baseline (sprint anterior ou targets)
5. Salvar snapshot em `review_data` do sprint

**Criar sprint:**
```bash
curl -X POST http://localhost:3001/api/sprints \
  -H "Content-Type: application/json" \
  -d '{"name":"Sprint 2026-WXX","platform":"geral","period_start":"2026-03-17","period_end":"2026-03-30"}'
```

**Output:** Delta report com métricas por plataforma.

**Gate para avançar:** Snapshot de métricas salvo em `review_data`.

## Fase 2: Identify

**Objetivo:** Analisar deltas e identificar gaps.

**Execução:**
1. Para cada métrica com delta negativo ou abaixo do target:
   - Criar gap com: descrição, plataforma, métrica, delta, severidade
2. Severidade: `critical` (delta > -20%), `high` (-10% a -20%), `medium` (-5% a -10%), `low` (< -5%)
3. Também incluir oportunidades: métricas estagnadas que poderiam crescer
4. Salvar em `gaps_identified` do sprint

```bash
curl -X PATCH http://localhost:3001/api/sprints \
  -H "Content-Type: application/json" \
  -d '{"id":"SPRINT_ID","phase":"identify","gaps_identified":[...]}'
```

**Gate para avançar:** Pelo menos 1 gap identificado.

## Fase 3: Propose

**Objetivo:** Para cada gap, gerar 1-3 ações propostas com ICE score.

**Execução:**
1. Para cada gap, usar os agentes relevantes do squad:
   - Revenue/pipeline: Ross (revenue-chief)
   - Aquisição/outbound: Blount (sales-strategist)
   - Negociação: Voss (closer)
   - Crescimento/PLG: Ellis (growth-hacker)
   - Funis/conversão: Brunson (funnel-architect)
   - CRM/operações: Kooij (crm-ops)
   - Retenção/churn: Murphy (retention-specialist)
   - Pricing: Campbell (pricing-strategist)
   - IA aplicada: Ng (ai-strategist)
   - SaaS/benchmarks: Lemkin (saas-advisor)
   - Copy/comunicação: Halbert (sales-copywriter)
   - Parcerias: Ries (partnerships-lead)
2. ICE Score cada ação (ver [references/ice-scoring.md](references/ice-scoring.md))
3. Salvar em `proposed_actions` do sprint

**Gate para avançar:** Pelo menos 1 ação proposta por gap.

## Fase 4: Decide

**Objetivo:** Usuário aprova/rejeita ações. Aprovadas viram decisions e sprint actions.

**Execução:**
1. Apresentar ações rankeadas por ICE score (maior primeiro)
2. Para cada ação que o usuário aprova:
   - Criar decision: `POST /api/decisions`
   - Criar sprint action: `POST /api/sprints/actions`
3. Atualizar sprint com `decisions_made` (array de IDs)
4. Avançar para execute

**Gate para avançar:** Pelo menos 1 ação aprovada.

## Fase 5: Execute

**Objetivo:** Acompanhar execução das ações aprovadas.

**Execução:**
1. Listar ações: `GET /api/sprints/actions?sprint_cycle_id=SPRINT_ID`
2. Para cada ação, atualizar status conforme progresso:
   - `pending` → `in_progress` → `completed`
   - Ou `blocked` / `cancelled` se necessário
3. Usar War Room para discutir execução com os agentes
4. Atualizar `execution_notes` do sprint

**Gate para avançar:** Todas as ações com status final (completed, blocked, ou cancelled).

## Fase 6: Measure

**Objetivo:** Medir resultados e fechar o ciclo.

**Execução:**
1. Buscar métricas atuais novamente
2. Comparar com baseline do Review (fase 1)
3. Para cada gap: calcular se melhorou, manteve ou piorou
4. Escrever `outcome_summary`
5. Para decisions completadas: registrar `actual_outcome` via `PATCH /api/decisions`
6. Propor atualizações de playbooks via skill `/platform-playbook evolve`
7. Salvar `measure_data` e avançar para `closed`

**Gate para fechar:** outcome_summary preenchido.

## Comandos

### `/revenue-sprint start [platform] [duration]`
Cria novo sprint. Default: platform=geral, duration=2w.

### `/revenue-sprint advance`
Avança para próxima fase (valida gate da fase atual).

### `/revenue-sprint status`
Mostra estado atual: fase, gaps, ações, progresso.

### `/revenue-sprint close`
Fecha o sprint com outcome summary.

## Cadência Recomendada

| Cadência | Duração | Quando usar |
|----------|---------|-------------|
| Semanal (1w) | 7 dias | Início de operação, muita incerteza, quick iterations |
| Quinzenal (2w) | 14 dias | Operação estável, ações precisam mais tempo |
