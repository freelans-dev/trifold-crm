# Agent Registry — IDE Availability

Este arquivo é a fonte da verdade sobre quais agentes estão disponíveis em cada IDE.

**Regra:** O `ideSync` copia de `.aios-core/development/agents/` para outros IDEs.
Agentes em `.claude/agents/` que NÃO estão naquele diretório são **Claude Code only**.

---

## Grupo 1 — Core AIOS (multi-IDE via ideSync)

Fonte: `.aios-core/development/agents/`
Destinos: Claude Code, Codex CLI, Gemini CLI, Cursor, GitHub Copilot

| Arquivo | Agente | Persona |
|---------|--------|---------|
| `aios-analyst.md` | `@analyst` | Alex |
| `aios-architect.md` | `@architect` | Aria |
| `aios-data-engineer.md` | `@data-engineer` | Dara |
| `aios-dev.md` | `@dev` | Dex |
| `aios-devops.md` | `@devops` | Gage |
| `aios-pm.md` | `@pm` | Morgan |
| `aios-po.md` | `@po` | Nova |
| `aios-qa.md` | `@qa` | Quinn |
| `aios-sm.md` | `@sm` | River |
| `aios-ux.md` | `@ux-expert` | Uma |

> Para adicionar um agente ao ideSync: coloque-o em `.aios-core/development/agents/`
> e rode `npm run sync:ide:claude` (ou equivalente para o IDE alvo).

---

## Grupo 2 — Chiefs de Domínio (Claude Code only)

Fonte: `.claude/agents/` — NÃO sincronizados via ideSync.
Disponíveis apenas em: **Claude Code**

| Arquivo | Agente | Conflitos de hook |
|---------|--------|------------------|
| `copy-chief.md` | `@copy-chief` | Nenhum |
| `story-chief.md` | `@story-chief` | Nenhum |
| `data-chief.md` | `@data-chief` | Nenhum |
| `design-chief.md` | `@design-chief` | Nenhum |
| `cyber-chief.md` | `@cyber-chief` | Nenhum |
| `legal-chief.md` | `@legal-chief` | Nenhum |
| `traffic-masters-chief.md` | `@traffic-masters-chief` | Nenhum |
| `tools-orchestrator.md` | `@tools-orchestrator` | Nenhum |
| `design-system.md` | `@design-system` | bypassPermissions — sem conflito (paths diferentes) |
| `db-sage.md` | `@db-sage` | bypassPermissions — resolvido (plan doc antes de migration) |

---

## Grupo 3 — Orquestração Especializada (Claude Code only)

Fonte: `.claude/agents/` — NÃO sincronizados via ideSync.
Disponíveis apenas em: **Claude Code**

| Arquivo | Agente | Notas |
|---------|--------|-------|
| `squad.md` | `@squad` | Orquestra oalanicolas + pedro-valerio + sop-extractor como subagents inline |
| `oalanicolas.md` | `@oalanicolas` | Invocado como subagent de `@squad` |
| `pedro-valerio.md` | `@pedro-valerio` | Invocado como subagent de `@squad` |
| `sop-extractor.md` | `@sop-extractor` | Invocado como subagent de `@squad` |

---

## Como promover um agente para multi-IDE

1. Copie ou mova o arquivo para `.aios-core/development/agents/`
2. Remova o arquivo de `.claude/agents/` (evitar duplicata)
3. Adicione ao `ideSync.targets` em `.aios-core/core-config.yaml` se necessário
4. Rode: `npm run sync:ide:claude && npm run validate:parity`
5. Atualize este REGISTRY

---

## Changelog

| Data | Mudança |
|------|---------|
| 2026-02-27 | Criação do REGISTRY como fonte da verdade de IDE availability |
