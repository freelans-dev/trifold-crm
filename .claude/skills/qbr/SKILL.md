---
name: qbr
description: |
  Quarterly Business Review cross-plataforma para o Sales Hub War Room.
  Consolida métricas, decisões, sprints e playbooks em análise trimestral abrangente.
  Gera scorecards por plataforma, analisa qualidade de decisões e compara benchmarks SaaS.
  Triggers: 'QBR', 'quarterly review', 'revisão trimestral', 'scorecard', 'benchmarks',
  'quarterly business review', 'análise trimestral', 'review do trimestre'.
model: sonnet
arguments:
  - name: command
    description: "Comando: generate, scorecard, benchmarks, decisions-review"
    required: true
  - name: quarter
    description: "Trimestre alvo: Q1, Q2, Q3, Q4 (default: trimestre atual)"
    required: false
  - name: year
    description: "Ano: 2025, 2026, etc (default: ano atual)"
    required: false
  - name: platform
    description: "Plataforma específica para scorecard (default: todas)"
    required: false
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
memory: project
---

# Quarterly Business Review (QBR)

## Propósito

Consolidar o desempenho trimestral de todas as plataformas do portfólio em uma análise estruturada que:
- Compara performance vs targets e benchmarks SaaS
- Avalia qualidade das decisões tomadas
- Mede efetividade dos sprints de revenue
- Identifica padrões cross-plataforma
- Define prioridades para o próximo trimestre

## Comandos

### `/qbr generate [quarter] [year]`

Gera o QBR completo do trimestre.

**Fluxo:**
1. Buscar dados do trimestre via API:
   - `GET /api/decisions?status=completed&created_after={start}&created_before={end}`
   - `GET /api/playbooks` (todas plataformas)
   - `GET /api/sprints?period_start_after={start}&period_end_before={end}`
2. Buscar métricas de cada plataforma
3. Preencher template QBR (ver `references/qbr-template.md`)
4. Calcular scores e comparar com benchmarks (ver `references/saas-benchmarks.md`)
5. Gerar análise cross-plataforma
6. Propor Top 3 prioridades por plataforma para próximo Q

**Output:** Documento markdown completo com 7 seções.

### `/qbr scorecard [platform]`

Gera scorecard rápido de uma plataforma específica.

**Métricas do scorecard:**

| Categoria | Métricas |
|-----------|----------|
| Revenue | MRR, MRR growth %, NRR |
| Users | Total, novos/mês, churn rate |
| Conversão | Trial→Paid %, upgrade rate |
| Decisões | Total Q, hit rate, avg confidence |
| Sprints | Completados, ações concluídas % |
| Playbooks | Versões criadas, evolução |

**Scoring:** Cada métrica recebe nota 1-5 vs benchmark do estágio.

### `/qbr benchmarks`

Exibe benchmarks SaaS por estágio para referência rápida.

**Fonte:** `references/saas-benchmarks.md`

Mostrar tabela comparativa:
- Benchmarks do estágio atual de cada plataforma
- Delta vs performance real
- Áreas acima/abaixo do benchmark

### `/qbr decisions-review [platform]`

Analisa qualidade das decisões do trimestre.

**Análise inclui:**

1. **Hit Rate** — % decisões completed com outcome positivo
   - `Exceeded` ou `Met` = hit
   - `Partial`, `Missed`, `Abandoned` = miss

2. **Calibração** — Confidence vs outcome real
   - High confidence + hit = bem calibrado
   - High confidence + miss = overconfident
   - Low confidence + hit = underconfident

3. **Velocidade** — Tempo médio proposed → completed

4. **Por Categoria** — Breakdown de hit rate por category (pricing, acquisition, etc.)

5. **Por Agente** — Qual agente originou decisões com melhor hit rate

## Integração com Sales Hub

### APIs utilizadas

```
GET  /api/decisions      — Decisões do trimestre
GET  /api/playbooks      — Playbooks e versões
GET  /api/sprints        — Sprints do trimestre
GET  /api/sprints/actions — Ações dos sprints
```

### Plataformas do portfólio

| Plataforma | Slug |
|------------|------|
| Dijior | `dijior` |
| AlunoPRO | `alunopro` |
| Litix | `litix` |
| Agente Linda | `linda` |
| Markuva | `markuva` |
| Freelans | `freelans` |

## Estrutura do QBR

O QBR completo tem 7 seções (ver `references/qbr-template.md`):

1. **Executive Summary** — Visão geral do portfólio
2. **Platform Scorecards** — Métricas detalhadas por plataforma
3. **Decision Quality** — Análise de acurácia e calibração
4. **Sprint Effectiveness** — Gaps fechados, velocidade, completion rate
5. **Cross-Platform Patterns** — Temas e padrões comuns
6. **Benchmark Comparison** — Performance vs benchmarks SaaS por estágio
7. **Next Quarter Priorities** — Top 3 por plataforma + portfólio

## Regras

1. **Dados reais** — Nunca inventar métricas. Se não houver dados, marcar como "N/A" e recomendar instrumentação.
2. **Comparação honesta** — Benchmarks servem como referência, não como julgamento. Contextualizar.
3. **Acionável** — Toda seção deve terminar com insight acionável ou recomendação.
4. **Cross-platform** — Sempre buscar padrões entre plataformas. Aprendizados de uma podem servir a outra.
5. **Versionamento** — Salvar QBR gerado como playbook version para histórico.
