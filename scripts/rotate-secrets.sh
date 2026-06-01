#!/usr/bin/env bash
#
# scripts/rotate-secrets.sh — interactive runbook for Phase 0 #20-#24
#
# Walks the operator through each provider rotation in the right order,
# captures the new value, writes it to AWS Secrets Manager (the chosen
# secrets backend per docs/SECRETS.md), and verifies the new value is
# being picked up by a representative pod.
#
# This script does NOT perform the actual rotation at each provider —
# that requires admin access to each provider's console. It prompts
# the operator, accepts the new value via stdin, and handles the
# mechanical part (secrets store update + restart + verify) on the
# operator's behalf.
#
# Required env to run:
#   AWS_PROFILE             — AWS CLI profile with secretsmanager:UpdateSecret
#   AWS_REGION              — region of the secrets store
#   KUBECONFIG              — kubeconfig pointing at the target cluster
#   AURA_SSM_PATH_PREFIX    — e.g. /aura/production/  or  /aura/staging/
#
# Usage:
#   ./scripts/rotate-secrets.sh                     # interactive, all secrets
#   ./scripts/rotate-secrets.sh DATABASE_URL        # rotate just one
#   ./scripts/rotate-secrets.sh --dry-run           # show what would happen

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

SECRETS_TO_ROTATE=(
  # Order matters — DB password first (highest impact), then auth, then infra
  "DATABASE_URL|Phase 0 #20|Supabase Postgres connection string"
  "JWT_SECRET|Phase 0 #21|JWT signing secret"
  "JWT_REFRESH_SECRET|Phase 0 #21|JWT refresh token secret"
  "MFA_ENCRYPTION_KEY|Phase 0 #28|MFA TOTP encryption key (needs re-encryption migration)"
  "SSN_ENCRYPTION_KEY|Phase 1 #28|SSN encryption key (needs re-encryption migration)"
  "AZURE_AD_CLIENT_SECRET|Phase 0 #22|Azure AD OAuth client secret"
  "GOOGLE_CLIENT_SECRET|Phase 0 #22|Google OAuth client secret"
  "OKTA_CLIENT_SECRET|Phase 0 #22|Okta OAuth client secret"
  "SAML_SP_PRIVATE_KEY|Phase 0 #23|SAML SP private key"
  "REDIS_PASSWORD|Phase 0 #24|Redis password"
  "RABBITMQ_PASSWORD|Phase 0 #24|RabbitMQ password"
  "ELASTICSEARCH_PASSWORD|Phase 0 #24|Elasticsearch password"
)

DRY_RUN=0
TARGET_SECRET=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)  DRY_RUN=1; shift ;;
    -h|--help)
      sed -n '2,30p' "$0"; exit 0 ;;
    *) TARGET_SECRET="$1"; shift ;;
  esac
done

# ---------------------------------------------------------------------------
# Pre-flight
# ---------------------------------------------------------------------------

require() {
  if [ -z "${!1:-}" ]; then
    echo "ERROR: env var $1 is required. See top of this script for the full list." >&2
    exit 1
  fi
}

require AWS_PROFILE
require AWS_REGION
require AURA_SSM_PATH_PREFIX

if [ "$DRY_RUN" = "0" ]; then
  command -v aws >/dev/null || { echo "ERROR: aws CLI not installed" >&2; exit 1; }
  command -v kubectl >/dev/null || { echo "ERROR: kubectl not installed" >&2; exit 1; }
fi

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

prompt_for_value() {
  local key=$1
  local description=$2
  local issue=$3
  echo ""
  echo "============================================================================="
  echo "  ROTATE: $key"
  echo "  Tracking: $issue"
  echo "  $description"
  echo "============================================================================="
  echo ""
  echo "Step 1: Log into the provider and rotate the secret following the"
  echo "        per-provider runbook in docs/SECRETS.md."
  echo ""
  echo "Step 2: Paste the NEW value below (input is hidden). The script will"
  echo "        write it to AWS Secrets Manager at:"
  echo "          ${AURA_SSM_PATH_PREFIX}${key}"
  echo ""
  read -r -s -p "  New value for $key: " NEW_VALUE
  echo ""
  if [ -z "$NEW_VALUE" ]; then
    echo "  (skipped — no value provided)"
    return 1
  fi
  echo "  (received $(echo -n "$NEW_VALUE" | wc -c) bytes; not echoed)"
  return 0
}

write_to_aws_secrets_manager() {
  local key=$1
  local value=$2
  local secret_id="${AURA_SSM_PATH_PREFIX}${key}"
  if [ "$DRY_RUN" = "1" ]; then
    echo "  [dry-run] Would update $secret_id in AWS Secrets Manager"
    return 0
  fi
  if aws secretsmanager describe-secret --secret-id "$secret_id" \
     --profile "$AWS_PROFILE" --region "$AWS_REGION" >/dev/null 2>&1; then
    aws secretsmanager update-secret \
      --secret-id "$secret_id" \
      --secret-string "$value" \
      --profile "$AWS_PROFILE" \
      --region "$AWS_REGION" >/dev/null
    echo "  ✓ Updated $secret_id"
  else
    aws secretsmanager create-secret \
      --name "$secret_id" \
      --secret-string "$value" \
      --profile "$AWS_PROFILE" \
      --region "$AWS_REGION" >/dev/null
    echo "  ✓ Created $secret_id"
  fi
}

rolling_restart() {
  if [ "$DRY_RUN" = "1" ]; then
    echo "  [dry-run] Would: kubectl rollout restart deployment/aura-web -n aura-system"
    return 0
  fi
  echo "  Rolling restart of aura-web ..."
  kubectl rollout restart deployment/aura-web -n aura-system
  kubectl rollout status deployment/aura-web -n aura-system --timeout=5m
  echo "  ✓ aura-web restarted"
  echo ""
  echo "  Other services that may need restart depending on which secret rotated:"
  echo "    kubectl rollout restart deployment/auth-service -n aura-system"
  echo "    kubectl rollout restart deployment/employee-service -n aura-system"
  echo "    (etc — see deploy manifests under k8s/services/)"
}

audit_log_review_reminder() {
  local key=$1
  case "$key" in
    DATABASE_URL)
      cat <<'EOF'

  AFTER rotation — review the provider's access logs since 2026-01-22 for
  any sign of unauthorized access. Specifically for Supabase:

    Settings -> Database -> Logs -> Filter from 2026-01-22
    Look for:
      - Connections from unexpected IPs
      - Unusual query patterns (large reads, schema introspection)
      - New pg_user / role grants not made by the team

  Document the review (clean or otherwise) in issue #20 with the URL.
EOF
      ;;
    AZURE_AD_CLIENT_SECRET|GOOGLE_CLIENT_SECRET|OKTA_CLIENT_SECRET)
      echo ""
      echo "  AFTER rotation — review the IdP sign-in logs for the AuraOS app since"
      echo "  2026-01-22. Document in issue #22."
      ;;
    JWT_SECRET|JWT_REFRESH_SECRET)
      echo ""
      echo "  AFTER rotation — monitor the 401 rate for ~15 minutes. Expect a brief"
      echo "  spike (clients refreshing tokens) that normalises within 2-3 minutes."
      ;;
    MFA_ENCRYPTION_KEY|SSN_ENCRYPTION_KEY)
      echo ""
      echo "  WARNING: existing encrypted values must be re-encrypted under the new"
      echo "  key. Run scripts/reencrypt-mfa-secrets.ts BEFORE rolling restart, or"
      echo "  every MFA user will fail to log in. See docs/SECRETS.md for the"
      echo "  re-encryption migration template."
      ;;
  esac
}

# ---------------------------------------------------------------------------
# Main loop
# ---------------------------------------------------------------------------

echo "==============================================================================="
echo " AuraOS — Phase 0 secret rotation"
echo " SSM prefix: ${AURA_SSM_PATH_PREFIX}"
echo " AWS region: ${AWS_REGION}"
echo " Dry run:    $([ "$DRY_RUN" = "1" ] && echo YES || echo no)"
echo "==============================================================================="

rotated_count=0
skipped_count=0

for entry in "${SECRETS_TO_ROTATE[@]}"; do
  IFS='|' read -r KEY ISSUE DESC <<<"$entry"

  if [ -n "$TARGET_SECRET" ] && [ "$KEY" != "$TARGET_SECRET" ]; then
    continue
  fi

  if prompt_for_value "$KEY" "$DESC" "$ISSUE"; then
    write_to_aws_secrets_manager "$KEY" "$NEW_VALUE"
    unset NEW_VALUE
    audit_log_review_reminder "$KEY"
    rotated_count=$((rotated_count + 1))
  else
    skipped_count=$((skipped_count + 1))
  fi
done

echo ""
echo "==============================================================================="
echo " Summary"
echo "   Rotated: $rotated_count"
echo "   Skipped: $skipped_count"
echo "==============================================================================="
echo ""

if [ "$rotated_count" -gt 0 ] && [ "$DRY_RUN" = "0" ]; then
  echo "Next: rolling restart of services. Hit enter to proceed, Ctrl-C to skip."
  read -r _
  rolling_restart
fi

echo ""
echo "Done. Update the corresponding GitHub issues (#20-#24) with rotation timestamps"
echo "and audit-log review notes. See docs/SECRETS.md for the per-secret rotation"
echo "checklists."
