#!/usr/bin/env bash
#
# apply-backlog-migrations.sh
# ---------------------------------------------------------------------------
# Applies ONLY the additive migrations created by the pending-tasks backlog
# completion (2026-07-01 / 2026-07-02). Every statement in these migrations is
# `CREATE TABLE / ADD COLUMN / CREATE INDEX ... IF NOT EXISTS` — there are NO
# DROP / TRUNCATE / DELETE / CREATE TYPE statements, so this is safe to run
# against a database with existing data and is idempotent (safe to re-run).
#
# It intentionally does NOT use `prisma db push` (which diffs schema<->DB and
# could propose destructive drops given known schema drift) and does NOT use
# `prisma migrate deploy` (the deployed DB was built with db push, so it has no
# migration baseline). It applies each new migration SQL file directly.
#
# Usage:
#   DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public" \
#     bash scripts/apply-backlog-migrations.sh
# ---------------------------------------------------------------------------
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: DATABASE_URL is not set. Export it first (do NOT commit real secrets)." >&2
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MIGDIR="$REPO_ROOT/packages/@aura/database/prisma/migrations"
SCHEMA="$REPO_ROOT/packages/@aura/database/prisma/schema.prisma"

# The 24 additive migrations from the backlog effort, in chronological order.
MIGS=$(ls "$MIGDIR" | grep -E '^2026070[12]' | sort)

echo "About to apply $(echo "$MIGS" | wc -l | tr -d ' ') additive migrations."
echo "Target host: $(echo "$DATABASE_URL" | sed -E 's#.*@([^/:]+).*#\1#')"
echo

# Safety gate: refuse if any target migration contains a destructive statement.
if grep -rilE 'DROP TABLE|DROP COLUMN|DROP CONSTRAINT|TRUNCATE|DELETE FROM|CREATE TYPE|ALTER TYPE' \
     $(for m in $MIGS; do echo "$MIGDIR/$m/migration.sql"; done) >/dev/null 2>&1; then
  echo "ABORT: a destructive/enum statement was found in a target migration. Review before applying." >&2
  exit 1
fi

for m in $MIGS; do
  f="$MIGDIR/$m/migration.sql"
  [[ -f "$f" ]] || continue
  echo ">> applying $m"
  # prisma db execute honors the ?schema= param and the datasource block.
  pnpm --dir "$REPO_ROOT/packages/@aura/database" exec prisma db execute \
    --schema "$SCHEMA" --file "$f"
done

echo
echo "All additive migrations applied. Regenerating Prisma client..."
pnpm --dir "$REPO_ROOT/packages/@aura/database" exec prisma generate >/dev/null
echo "Done. No existing tables/columns were dropped (additive-only, IF NOT EXISTS)."
