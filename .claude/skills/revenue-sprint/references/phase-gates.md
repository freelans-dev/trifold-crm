# Phase Gates — Revenue Sprint

Cada fase tem critérios obrigatórios para avançar. Não é permitido pular fases.

## Review → Identify
- [ ] Métricas de todas as plataformas relevantes coletadas
- [ ] `review_data` salvo no sprint com snapshot de métricas
- [ ] Deltas calculados contra baseline (sprint anterior ou targets)

## Identify → Propose
- [ ] Pelo menos 1 gap identificado com severidade atribuída
- [ ] Cada gap tem: descrição, plataforma, métrica, delta, severidade
- [ ] `gaps_identified` salvo no sprint

## Propose → Decide
- [ ] Pelo menos 1 ação proposta para cada gap
- [ ] Cada ação tem: descrição, agente owner, prioridade, esforço, ICE score
- [ ] `proposed_actions` salvo no sprint

## Decide → Execute
- [ ] Pelo menos 1 ação aprovada pelo usuário
- [ ] Decisions criadas no banco para ações aprovadas
- [ ] Sprint actions criadas com status 'pending'
- [ ] `decisions_made` atualizado no sprint

## Execute → Measure
- [ ] Todas as sprint actions com status final (completed/blocked/cancelled)
- [ ] `execution_notes` preenchidas com observações
- [ ] Nenhuma ação em status 'pending' ou 'in_progress'

## Measure → Closed
- [ ] Nova coleta de métricas realizada
- [ ] Comparação com baseline documentada
- [ ] `outcome_summary` escrito com resultados
- [ ] Decisions completadas com `actual_outcome` registrado
- [ ] Playbook updates propostos para estratégias bem-sucedidas
- [ ] `measure_data` salvo no sprint
