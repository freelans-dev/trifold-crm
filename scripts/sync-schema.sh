#!/usr/bin/env bash
set -euo pipefail

# Schema sync script for Trifold CRM
# Runs supabase db push against staging and/or production environments.
#
# Usage:
#   ./scripts/sync-schema.sh --env staging
#   ./scripts/sync-schema.sh --env prod
#   ./scripts/sync-schema.sh --env both

ENV_TARGET=""

usage() {
  echo "Usage: $0 --env <staging|prod|both>"
  echo ""
  echo "Options:"
  echo "  --env staging   Push migrations to staging only"
  echo "  --env prod      Push migrations to production only"
  echo "  --env both      Push migrations to staging then production"
  exit 1
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --env)
      ENV_TARGET="$2"
      shift 2
      ;;
    -h|--help)
      usage
      ;;
    *)
      echo "Unknown option: $1"
      usage
      ;;
  esac
done

if [[ -z "$ENV_TARGET" ]]; then
  echo "Error: --env flag is required."
  usage
fi

if [[ "$ENV_TARGET" != "staging" && "$ENV_TARGET" != "prod" && "$ENV_TARGET" != "both" ]]; then
  echo "Error: --env must be one of: staging, prod, both"
  usage
fi

push_to_env() {
  local env_name="$1"
  local db_url_var="SUPABASE_DB_URL_${env_name^^}"
  local db_url="${!db_url_var:-}"

  if [[ -z "$db_url" ]]; then
    echo "Error: $db_url_var is not set. Export it before running this script."
    echo "  export $db_url_var=postgresql://..."
    exit 1
  fi

  echo "============================================"
  echo "  Pushing migrations to: $env_name"
  echo "============================================"
  echo ""

  echo "Pending migrations:"
  supabase db push --db-url "$db_url" --dry-run 2>&1 || true
  echo ""

  read -rp "Apply migrations to $env_name? (y/N): " confirm
  if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo "Skipped $env_name."
    return
  fi

  supabase db push --db-url "$db_url"
  echo ""
  echo "Migrations applied to $env_name successfully."
  echo ""
}

case "$ENV_TARGET" in
  staging)
    push_to_env "staging"
    ;;
  prod)
    push_to_env "prod"
    ;;
  both)
    push_to_env "staging"
    push_to_env "prod"
    ;;
esac

echo "Done."
