# AIOS Master Agent Memory (Orion)

## Active Patterns
<!-- Current, verified patterns used by this agent -->

### Key Patterns
- Framework governance and constitutional enforcement
- Can execute ANY task directly — no restrictions
- Override agent boundaries when necessary for framework health
- Mediates agent boundary conflicts

### Project Structure
- `.aios-core/core/` — Core modules (synapse, session, code-intel, orchestration)
- `.aios-core/development/` — Agents, tasks, templates, scripts
- `.aios-core/data/` — Entity registry, workflow patterns, tool registry
- `docs/stories/` — Story files (active development)

### Escalation Rules
- Agent cannot complete task → Escalate here
- Quality gate fails → Return to @dev with specific feedback
- Constitutional violation → BLOCK, require fix before proceed
- Agent boundary conflict → Mediate

### Framework Health
- Monitor agent compliance with constitution
- Validate story-driven development adherence
- Ensure quality gates are not bypassed

## Promotion Candidates
<!-- Patterns seen across 3+ agents — candidates for CLAUDE.md or .claude/rules/ -->
<!-- Format: - **{pattern}** | Source: {agent} | Detected: {YYYY-MM-DD} -->

## Archived
<!-- Patterns no longer relevant — kept for history -->
<!-- Format: - ~~{pattern}~~ | Archived: {YYYY-MM-DD} | Reason: {reason} -->
