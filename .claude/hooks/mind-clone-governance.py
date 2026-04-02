#!/usr/bin/env python3
"""
Hook: Mind Clone Governance

REGRA 1: Agents baseados em pessoas reais (mind clones) DEVEM passar pelo
pipeline de extração de DNA antes de serem criados.

REGRA 2: A fase de Synthesis em outputs/minds/{slug}/synthesis/ é BLOQUEADA
até que o checkpoint humano L6-L8 seja aprovado, evidenciado pelo arquivo
outputs/minds/{slug}/analysis/identity-core-approved.yaml.

NÃO BLOQUEIA (Regra 1):
- Orchestrators (nome contém 'chief', 'orchestrator', 'chair')
- Tool agents (nome contém 'validator', 'calculator', 'generator')
- Process agents (nome contém 'architect', 'mapper', 'designer')
- Edição de arquivo existente (apenas criação é bloqueada)

Exit Codes:
- 0: Permitido
- 2: Bloqueado (mind clone sem DNA, ou synthesis sem checkpoint aprovado)
"""

import json
import sys
import os
import re
from pathlib import Path

# =============================================================================
# CONFIGURAÇÃO
# =============================================================================

# Padrões que indicam que NÃO é um mind clone (agents funcionais)
FUNCTIONAL_AGENT_PATTERNS = [
    # Orchestrators
    r'.*-chief$',
    r'.*-orchestrator$',
    r'.*-chair$',
    r'^orchestrator$',

    # Tool agents
    r'.*-validator$',
    r'.*-calculator$',
    r'.*-generator$',
    r'.*-extractor$',
    r'.*-analyzer$',

    # Process agents
    r'.*-architect$',
    r'.*-mapper$',
    r'.*-designer$',
    r'.*-engineer$',

    # Generic functional
    r'^tools?-.*',
    r'^process-.*',
    r'^workflow-.*',
]

# Locais onde DNA pode estar
DNA_LOCATIONS = [
    "squads/{pack}/data/minds/{agent_id}_dna.yaml",
    "squads/{pack}/data/minds/{agent_id}_dna.md",
    "squads/{pack}/data/{agent_id}-dna.yaml",
    "outputs/minds/{agent_id}/",
]

# =============================================================================
# LÓGICA: REGRA 1 — Mind Clone DNA Check
# =============================================================================

def get_project_root():
    """Obtém o root do projeto via variável de ambiente ou cwd."""
    return os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())

def extract_agent_info(file_path: str) -> tuple:
    """Extrai pack_name e agent_id do path."""
    match = re.match(r'.*/squads/([^/]+)/agents/([^/]+)\.md$', file_path)
    if match:
        return match.group(1), match.group(2)
    return None, None

def is_functional_agent(agent_id: str) -> bool:
    """Verifica se o agent é funcional (não é mind clone)."""
    for pattern in FUNCTIONAL_AGENT_PATTERNS:
        if re.match(pattern, agent_id, re.IGNORECASE):
            return True
    return False

def has_dna_extracted(project_root: str, pack_name: str, agent_id: str) -> tuple:
    """Verifica se existe DNA extraído para o agent."""
    for location_template in DNA_LOCATIONS:
        location = location_template.format(pack=pack_name, agent_id=agent_id)
        full_path = os.path.join(project_root, location)

        if location.endswith('/'):
            if os.path.isdir(full_path):
                return True, full_path
        elif os.path.isfile(full_path):
            return True, full_path

    return False, None

def file_already_exists(file_path: str) -> bool:
    """Verifica se o arquivo já existe (edit vs create)."""
    return os.path.isfile(file_path)

# =============================================================================
# LÓGICA: REGRA 2 — Synthesis Checkpoint Gate (L6-L8)
# =============================================================================

def extract_slug_from_synthesis_path(file_path: str) -> str | None:
    """Extrai slug de outputs/minds/{slug}/synthesis/... path."""
    match = re.search(r'/outputs/minds/([^/]+)/synthesis/', file_path)
    if match:
        return match.group(1)
    return None

def has_identity_checkpoint_approval(project_root: str, slug: str) -> bool:
    """
    Verifica se o checkpoint humano L6-L8 foi aprovado.
    Evidência: existência de outputs/minds/{slug}/analysis/identity-core-approved.yaml
    """
    approval_path = os.path.join(
        project_root,
        f"outputs/minds/{slug}/analysis/identity-core-approved.yaml"
    )
    return os.path.isfile(approval_path)

def is_synthesis_write(file_path: str) -> bool:
    """Detecta escrita na fase de synthesis da pipeline clone-mind."""
    return "/outputs/minds/" in file_path and "/synthesis/" in file_path

# =============================================================================
# MAIN
# =============================================================================

def main():
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        sys.exit(0)

    tool_name = input_data.get("tool_name", "")
    tool_input = input_data.get("tool_input", {})

    if tool_name not in ["Write", "Edit"]:
        sys.exit(0)

    file_path = tool_input.get("file_path", "")
    if not file_path:
        sys.exit(0)

    project_root = get_project_root()

    # ── REGRA 2: Synthesis Checkpoint Gate ────────────────────────────────────
    if is_synthesis_write(file_path):
        slug = extract_slug_from_synthesis_path(file_path)
        if slug:
            if not has_identity_checkpoint_approval(project_root, slug):
                error_message = f"""
╔══════════════════════════════════════════════════════════════════════════════╗
║  🔴 MIND CLONE GOVERNANCE: Checkpoint L6-L8 não aprovado                    ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  Mind: {slug:<60} ║
║                                                                              ║
║  BLOQUEADO: Tentativa de escrever na fase Synthesis sem aprovação            ║
║  humana do Identity Core (camadas L6-L8).                                   ║
║                                                                              ║
║  O pipeline clone-mind EXIGE que o humano valide e aprove:                  ║
║    L6 - Hierarquia de Valores                                                ║
║    L7 - Obsessões identificadas                                              ║
║    L8 - Contradições produtivas                                              ║
║                                                                              ║
║  ARQUIVO AUSENTE:                                                            ║
║    outputs/minds/{slug}/analysis/identity-core-approved.yaml
║                                                                              ║
║  AÇÃO REQUERIDA:                                                             ║
║    1. Apresente identity-core.yaml ao usuário para revisão                  ║
║    2. Use AskUserQuestion com opções: APPROVE / REVISE / ABORT               ║
║    3. Se APPROVE: escreva identity-core-approved.yaml com timestamp          ║
║    4. Só então continue para Phase 3 (Synthesis)                            ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""
                print(error_message, file=sys.stderr)
                sys.exit(2)
        sys.exit(0)

    # ── REGRA 1: Mind Clone DNA Check ─────────────────────────────────────────
    if "/squads/" not in file_path or "/agents/" not in file_path:
        sys.exit(0)

    if not file_path.endswith(".md"):
        sys.exit(0)

    pack_name, agent_id = extract_agent_info(file_path)
    if not pack_name or not agent_id:
        sys.exit(0)

    if file_already_exists(file_path):
        sys.exit(0)

    if is_functional_agent(agent_id):
        sys.exit(0)

    has_dna, dna_path = has_dna_extracted(project_root, pack_name, agent_id)

    if has_dna:
        sys.exit(0)

    # BLOQUEAR: Tentando criar mind clone sem DNA
    error_message = f"""
╔══════════════════════════════════════════════════════════════════════════════╗
║  🧬 MIND CLONE GOVERNANCE: DNA não encontrado                                 ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  Agent: {agent_id:<60} ║
║  Pack:  {pack_name:<60} ║
║                                                                              ║
║  PROBLEMA: Este parece ser um MIND CLONE (baseado em pessoa real),           ║
║            mas não foi encontrado DNA extraído.                              ║
║                                                                              ║
║  Mind clones DEVEM passar pelo pipeline de extração:                         ║
║  1. *collect-sources  → Coletar fontes (livros, entrevistas, artigos)        ║
║  2. *extract-voice-dna → Extrair padrões linguísticos                        ║
║  3. *extract-thinking-dna → Extrair frameworks e heurísticas                 ║
║  4. *create-agent → Criar agent a partir do DNA                              ║
║                                                                              ║
║  LOCAIS VERIFICADOS:                                                         ║
║  • squads/{pack_name}/data/minds/{agent_id}_dna.yaml
║  • squads/{pack_name}/data/minds/{agent_id}_dna.md
║  • outputs/minds/{agent_id}/
║                                                                              ║
║  SOLUÇÕES:                                                                   ║
║  1. Execute o pipeline de clone: /squad-creator → *collect-sources           ║
║  2. OU se é agent FUNCIONAL, renomeie com sufixo:                            ║
║     -chief, -orchestrator, -validator, -architect, etc.                      ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""
    print(error_message, file=sys.stderr)
    sys.exit(2)

if __name__ == "__main__":
    main()
