#!/bin/bash
# Install AIOS Git Hooks
# Version: 2.0

set -e

echo "🔧 Installing AIOS Git Hooks..."

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
HOOKS_DIR="$PROJECT_ROOT/.git/hooks"

# Ensure hooks directory exists
if [ ! -d "$HOOKS_DIR" ]; then
    echo "❌ Error: .git/hooks directory not found"
    echo "Are you in a git repository?"
    exit 1
fi

# Install pre-commit hook (version metadata validation)
echo "Installing pre-commit hook (version metadata check)..."
ln -sf ../../.claude/hooks/pre-commit-version-check.sh "$HOOKS_DIR/pre-commit"
chmod +x "$HOOKS_DIR/pre-commit"

echo "✅ Pre-commit hook installed"

# Make all hooks executable
chmod +x "$SCRIPT_DIR"/*.sh 2>/dev/null || true
chmod +x "$SCRIPT_DIR"/*.py 2>/dev/null || true

echo ""
echo "✅ All hooks installed successfully!"
echo ""
echo "Installed hooks:"
echo "  - pre-commit: version metadata validation"
echo ""
echo "To test:"
echo "  .claude/hooks/pre-commit-version-check.sh"
echo ""
echo "To uninstall:"
echo "  rm .git/hooks/pre-commit"
