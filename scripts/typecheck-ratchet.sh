#!/usr/bin/env bash
# Typecheck ratchet — enforce a strict ceiling on apps/web TypeScript errors.
#
# We can't yet flip `ignoreBuildErrors: false` (~473 errors remaining as of
# 2026-06-02), but we can prevent regressions. This script runs `tsc --noEmit`
# in apps/web, counts the errors, and fails if the count exceeds the baseline
# stored in apps/web/.typecheck-baseline.
#
# When a fix wave LOWERS the count, update the baseline file in the same
# commit. CI will pass at the new lower value and reject any future
# regression.
#
# Usage:
#   scripts/typecheck-ratchet.sh             # check
#   scripts/typecheck-ratchet.sh --update    # write current count to baseline
#
# Closes #29z.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP_DIR="$REPO_ROOT/apps/web"
BASELINE_FILE="$APP_DIR/.typecheck-baseline"

if [ ! -f "$BASELINE_FILE" ]; then
  echo "ERROR: baseline file not found at $BASELINE_FILE" >&2
  exit 2
fi

BASELINE=$(tr -d '[:space:]' < "$BASELINE_FILE")
if ! [[ "$BASELINE" =~ ^[0-9]+$ ]]; then
  echo "ERROR: baseline file does not contain a number: '$BASELINE'" >&2
  exit 2
fi

cd "$APP_DIR"
rm -f tsconfig.tsbuildinfo

# Count errors. Don't fail-fast on tsc — we expect errors, we just need the count.
ERR_COUNT=$(pnpm exec tsc --noEmit 2>&1 | grep -cE "^[^ ]+\([0-9]+,[0-9]+\): error TS[0-9]+" || true)

echo "TypeScript errors: $ERR_COUNT (baseline: $BASELINE)"

if [ "${1:-}" = "--update" ]; then
  echo "$ERR_COUNT" > "$BASELINE_FILE"
  echo "Updated $BASELINE_FILE -> $ERR_COUNT"
  exit 0
fi

if [ "$ERR_COUNT" -gt "$BASELINE" ]; then
  echo "" >&2
  echo "✖ TypeScript error count regressed: $ERR_COUNT > $BASELINE" >&2
  echo "" >&2
  echo "Either:" >&2
  echo "  (a) fix the new errors so the count <= $BASELINE, or" >&2
  echo "  (b) explain in the PR why the regression is intentional and" >&2
  echo "      update apps/web/.typecheck-baseline with justification." >&2
  echo "" >&2
  echo "Run \`scripts/typecheck-ratchet.sh --update\` to refresh the baseline." >&2
  exit 1
fi

if [ "$ERR_COUNT" -lt "$BASELINE" ]; then
  echo ""
  echo "✓ TypeScript error count DROPPED ($BASELINE -> $ERR_COUNT)."
  echo "  Run \`scripts/typecheck-ratchet.sh --update\` and commit the new"
  echo "  baseline so future regressions are caught at the lower number."
fi

exit 0
