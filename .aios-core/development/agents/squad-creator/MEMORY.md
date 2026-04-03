# Squad Creator Agent Memory

## Active Patterns
<!-- Current, verified patterns used by this agent -->

### Key Patterns
- Creates and manages squad compositions from agent registry
- Squad definitions stored in `squads/` directory
- Validates agent availability before squad assembly
- Loads agent registry and squad manifest on demand (lazy)

### Project Structure
- `.aios-core/development/agents/` — Agent persona definitions
- `.aios-core/data/entity-registry.yaml` — Full agent/entity registry
- `squads/` — Squad definitions and configurations

### Squad Conventions
- Each squad has a manifest YAML with member agents and responsibilities
- Squads are project-scoped (L4 layer)
- Squad templates available in `.aios-core/development/templates/`

## Promotion Candidates
<!-- Patterns seen across 3+ agents — candidates for CLAUDE.md or .claude/rules/ -->
<!-- Format: - **{pattern}** | Source: {agent} | Detected: {YYYY-MM-DD} -->

## Archived
<!-- Patterns no longer relevant — kept for history -->
<!-- Format: - ~~{pattern}~~ | Archived: {YYYY-MM-DD} | Reason: {reason} -->
