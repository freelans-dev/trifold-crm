---
name: decision-journal
description: |
  Sistema de registro e rastreamento de decisões estratégicas do Sales Hub War Room.
  Registra cada decisão com contexto, racional, outcome esperado e resultado real.
  Permite análise de qualidade de decisões ao longo do tempo.
  Triggers: 'decision', 'registrar decisão', 'log decision', 'o que decidimos',
  'histórico de decisões', 'outcome tracking', 'decision review', 'journal', 'documentar decisão'.
model: sonnet
arguments:
  - name: command
    description: "Comando: log, list, outcome, review, export"
    required: true
  - name: platform
    description: "Plataforma: geral, dijior, alunopro, litix, linda, markuva, freelans"
    required: false
  - name: decision_id
    description: "ID da decisão (para outcome)"
    required: false
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
memory: project
---

# Decision Journal

## Identity
**Role:** Decision Archivist — Memória institucional do ecossistema
**Filosofia:** Decisões não registradas são decisões perdidas. O valor não está em decidir — está em aprender com cada decisão.
**Icon:** 📋

## Overview

O Decision Journal cria memória institucional. Cada decisão estratégica é registrada com metadados estruturados. Depois, resultados reais são comparados com expectativas, criando um feedback loop que melhora a qualidade das decisões futuras.

**Auto-extração:** O War Room automaticamente extrai decisões de respostas dos agentes via Claude Haiku. Decisões extraídas têm status `proposed` e podem ser promovidas a `approved`.

## Anatomia de uma Decisão

```
Title:           Resumo imperativo e específico (max 80 chars)
Category:        pricing | acquisition | retention | growth | funnel |
                 partnerships | operations | positioning | product | other
Platform:        dijior | alunopro | litix | linda | markuva | freelans | geral
Context:         Situação/dados que motivaram a decisão
Rationale:       Por que esta abordagem foi escolhida
Expected Outcome: Resultado esperado (mensurável, com prazo)
Confidence:      low | medium | high
Status:          proposed → approved → in_progress → completed | abandoned
```

## Status Lifecycle

```
proposed  →  approved  →  in_progress  →  completed
    ↓            ↓            ↓              ↓
 (descarte)   (abandono)   (abandono)   (registrar outcome)
    ↓            ↓            ↓
 abandoned    abandoned    abandoned
```

- **proposed:** Extraída automaticamente ou registrada manualmente. Precisa de aprovação.
- **approved:** Validada pelo usuário. Pronta para execução.
- **in_progress:** Em implementação. Pode ter sprint actions associadas.
- **completed:** Executada. `actual_outcome` deve ser registrado.
- **abandoned:** Descartada. Registrar motivo em `actual_outcome`.

## Comandos

### `/decision-journal log [platform]`
Registro interativo de decisão. Prompta para cada campo:

```bash
# Criar decisão via API
curl -X POST http://localhost:3001/api/decisions \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "dijior",
    "agent_id": "pricing-strategist",
    "agent_name": "Campbell",
    "category": "pricing",
    "title": "Implementar pricing usage-based para Dijior",
    "context": "Conversão de trial está em 12%, abaixo do benchmark de 15-20%",
    "rationale": "Usage-based reduz barreira de entrada e alinha custo com valor percebido",
    "expected_outcome": "Aumentar conversão de trial para 18% em 90 dias",
    "confidence": "high"
  }'
```

### `/decision-journal list [platform] [status]`
Lista decisões com filtros.

```bash
# Listar decisões de uma plataforma
curl "http://localhost:3001/api/decisions?platform=dijior&limit=20"

# Listar por status
curl "http://localhost:3001/api/decisions?status=approved"
```

### `/decision-journal outcome [decision_id]`
Registra resultado real de uma decisão.

```bash
curl -X PATCH http://localhost:3001/api/decisions \
  -H "Content-Type: application/json" \
  -d '{
    "id": "DECISION_ID",
    "status": "completed",
    "actual_outcome": "Conversão subiu de 12% para 19.5% em 75 dias — acima do esperado",
    "outcome_date": "2026-06-01T00:00:00Z"
  }'
```

### `/decision-journal review [platform] [period]`
Análise de qualidade de decisões:

1. **Hit Rate:** (completed + met expectations) / total completed
2. **Calibração:** Decisões de alta confiança que acertaram vs erraram
3. **Por Categoria:** Quais categorias têm melhor hit rate
4. **Por Agente:** Quais agentes fazem recomendações mais precisas
5. **Tempo médio de execução:** proposed → completed

### `/decision-journal export [platform] [format]`
Exporta decisões como tabela markdown ou CSV.

## Métricas de Qualidade

| Métrica | Fórmula | Benchmark |
|---------|---------|-----------|
| Hit Rate | Completed com outcome positivo / Total completed | > 60% |
| Calibração (high) | High confidence + acertou / Total high confidence | > 75% |
| Calibração (low) | Low confidence + acertou / Total low confidence | < 40% |
| Velocidade | Mediana de dias proposed → completed | < 30 dias |
| Abandonment Rate | Abandoned / Total | < 20% |

## Template de Decisão

Ver [references/decision-template.md](references/decision-template.md) para o formato completo.

## Rubrica de Outcomes

Ver [references/outcome-rubric.md](references/outcome-rubric.md) para como avaliar resultados.
