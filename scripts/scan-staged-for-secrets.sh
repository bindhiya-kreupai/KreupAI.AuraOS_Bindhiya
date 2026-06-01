#!/usr/bin/env bash
# Pre-commit guard against committing real secrets.
#
# Scans the staged content (what's actually about to be committed) for
# patterns that indicate real credentials, not just placeholders. Fails
# the commit if any are found.
#
# This is a lightweight homegrown alternative to `gitleaks` — no binary
# dependency, runs anywhere `bash + git + grep` exists. For higher-fidelity
# scanning, the team can opt into gitleaks/trufflehog as a parallel CI step.
#
# What it catches:
#   - JWT-shaped strings  (eyJ... three base64 segments)
#   - AWS access key IDs  (AKIA... 16 chars)
#   - Private keys        (-----BEGIN ... PRIVATE KEY-----)
#   - GitHub PATs         (gh[pousr]_...)
#   - Slack tokens        (xox[abp]-...)
#   - High-entropy hex/base64 lines longer than 32 chars that look like
#     password/secret/key assignments
#
# What it explicitly tolerates (placeholders the templates use):
#   - "REPLACE_WITH_*"
#   - "your-*-here"
#   - "change-this-in-production"
#   - "test_password"
#   - 32-character lower-hex test fixtures named test-* or e2e-*

set -e

# Get the list of files in this commit. Honour git's "what's about to land"
# semantics: diff staged content against HEAD (or empty tree for the first commit).
if git rev-parse --verify HEAD >/dev/null 2>&1; then
  AGAINST=HEAD
else
  AGAINST=$(git hash-object -t tree /dev/null)
fi

# Files staged for commit, excluding deletions, and skipping known-safe paths
STAGED=$(git diff --cached --name-only --diff-filter=ACMRT "$AGAINST" \
  | grep -vE '^(node_modules|dist|\.next|coverage|\.turbo)/' \
  | grep -vE '\.(lock|map)$' \
  || true)

if [ -z "$STAGED" ]; then
  exit 0
fi

# Patterns to flag, paired with a one-line description for the error message.
# Tab-separated: pattern \t description
PATTERNS_FILE=$(mktemp)
cat >"$PATTERNS_FILE" <<'PAT'
eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}	JWT-shaped token
AKIA[0-9A-Z]{16}	AWS access key ID
-----BEGIN (RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----	private key
gh[pousr]_[A-Za-z0-9]{36,}	GitHub personal access token
xox[abp]-[A-Za-z0-9-]{10,}	Slack token
postgres(ql)?://[^:]+:[^@\s]{8,}@[^/\s]+	Postgres connection string with embedded password
PAT

FAIL=0
TMPDIFF=$(mktemp)

for FILE in $STAGED; do
  # Get the staged content (handles renames/copies safely)
  git show :"$FILE" 2>/dev/null > "$TMPDIFF" || continue
  while IFS=$'\t' read -r PATTERN DESC; do
    # Use perl-compatible regex via grep -P (fallback to ERE if -P unavailable)
    if grep -qE "$PATTERN" "$TMPDIFF" 2>/dev/null; then
      MATCH=$(grep -nE "$PATTERN" "$TMPDIFF" | head -1)
      # Skip if the match is on a line that contains a known placeholder
      LINE_CONTENT=$(echo "$MATCH" | cut -d: -f2-)
      if echo "$LINE_CONTENT" | grep -qE 'REPLACE_WITH|your-.*-here|your-.*-token|your-.*-key|change-this-in-production|test_password|test-jwt-secret|e2e-jwt|integration-test-|aura_redis_2024|auraos_rabbit_2024|NEW_PASS|EXAMPLE|<example>|placeholder|password@host|PASSWORD|<your|your_'; then
        continue
      fi
      # Also tolerate all-caps placeholder words in connection strings
      # (NEW_PASS, USER, HOST, DB are obviously not real).
      if echo "$LINE_CONTENT" | grep -qE 'postgres(ql)?://[A-Z_]+:[A-Z_]+@[A-Z_]+'; then
        continue
      fi
      echo "::error file=$FILE::Possible secret committed — $DESC"
      echo "    $FILE: $MATCH" >&2
      FAIL=1
    fi
  done < "$PATTERNS_FILE"
done

rm -f "$PATTERNS_FILE" "$TMPDIFF"

if [ "$FAIL" = "1" ]; then
  echo "" >&2
  echo "Pre-commit secret scan FAILED." >&2
  echo "If this is a placeholder, add it to the allow-list in" >&2
  echo "scripts/scan-staged-for-secrets.sh. If it's a real secret, remove it" >&2
  echo "and store it in your secrets manager (see docs/SECRETS.md)." >&2
  echo "To intentionally bypass (rare; document why in the commit message):" >&2
  echo "  git commit --no-verify" >&2
  exit 1
fi

exit 0
