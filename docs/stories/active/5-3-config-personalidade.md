# Story 5.3 — Configuracao da Personalidade Nicole

## Contexto
O admin precisa poder ajustar a personalidade e comportamento da Nicole sem mexer em codigo. Isso inclui editar o prompt principal (personalidade, tom, restricoes), guardrails ativos, e testar como a Nicole responderia. A Story 3.1 define a personalidade inicial — esta story cobre a interface admin para edita-la em producao.

## Acceptance Criteria
- [ ] AC1: Pagina `/dashboard/settings/personality` exibe o prompt atual da Nicole
- [ ] AC2: **Editor de prompt principal:** Textarea com o system prompt completo, editavel
- [ ] AC3: **Editor de guardrails:** Lista de guardrails com toggle ativo/inativo cada:
  - Nao revelar que e IA
  - Nao prometer materiais de acabamento
  - Nao simular financiamento
  - Nao enviar tabela de precos
  - Nao expor memorial descritivo
  - Redirecionar perguntas fora do escopo para visita
- [ ] AC4: **Preview de teste:** Campo para digitar pergunta de teste + botao "Testar resposta" que chama a Nicole com o prompt atual e mostra a resposta (sem salvar, sem afetar leads)
- [ ] AC5: Botao "Salvar" atualiza a tabela `agent_prompts` e `agent_config`
- [ ] AC6: Historico de versoes: ao salvar, a versao anterior e mantida (campo `version` auto-incrementa)
- [ ] AC7: Botao "Reverter para versao anterior" restaura o prompt anterior
- [ ] AC8: API routes: GET/PATCH `/api/settings/personality`, POST `/api/settings/personality/test`
- [ ] AC9: Validacao: prompt nao pode estar vazio, guardrails nao pode ter todos desativados
- [ ] AC10: Indicador visual de quando o prompt foi modificado pela ultima vez e por quem

## Detalhes Tecnicos

### Arquivos a criar:
- `packages/web/src/app/dashboard/settings/personality/page.tsx` — Pagina de config
- `packages/web/src/components/settings/prompt-editor.tsx` — Editor de prompt
- `packages/web/src/components/settings/guardrails-config.tsx` — Toggle de guardrails
- `packages/web/src/components/settings/prompt-tester.tsx` — Preview de teste
- `packages/web/src/app/api/settings/personality/route.ts` — GET, PATCH
- `packages/web/src/app/api/settings/personality/test/route.ts` — POST (testar)

### Tabelas envolvidas:
```typescript
// agent_prompts — armazena o system prompt (com versionamento)
// agent_config — armazena configuracoes (guardrails, model, etc.)
```

### Endpoint de teste:
```typescript
// POST /api/settings/personality/test
export async function POST(request: Request) {
  const { prompt, guardrails, testMessage } = await request.json();

  const response = await claude.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: buildSystemPrompt(prompt, guardrails),
    messages: [{ role: 'user', content: testMessage }],
  });

  return Response.json({
    response: response.content[0].text,
    tokens_used: response.usage.output_tokens,
  });
}
```

### Referencia agente-linda:
- Adaptar settings de `~/agente-linda/packages/web/src/app/dashboard/settings/` (se existir)
- Reusar pattern de prompt editor e tester

## Dependencias
- Depende de: 1.2 (schema agent_prompts, agent_config), 1.5 (auth admin), 3.1 (personalidade Nicole)
- Bloqueia: Nenhuma

## Estimativa
M (Media) — 2-3 horas
