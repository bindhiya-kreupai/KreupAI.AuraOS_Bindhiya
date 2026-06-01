# AuraOS — Production Rollback Runbook

**Purpose:** how to safely back out of a bad deploy. Read this before you
need it. The middle of an incident is the wrong time to learn the rollback
procedure for the first time.

**Scope:** the web app + 8 Fastify services + Prisma migrations. Does NOT
cover database disaster recovery (separate runbook).

---

## When to roll back

In rough order of urgency:

1. **5xx error rate spike** (Sentry / Datadog) immediately after deploy
2. **`/api/readyz` returning 503** on >25% of pods after the rollout has
   stabilized
3. **Payroll, attendance, or audit-log writes failing** — these have
   regulatory exposure and never wait
4. **Customer-reported regression** that re-deploying with a fix would take
   longer than 30 minutes
5. **Migration succeeded but introduced data corruption** — see the
   migration-specific section below; the app rollback alone won't help

If in doubt, **roll back first, investigate later**. Forward-fix only when
the issue is small enough to ship a patch within the same window the
rollback would take.

---

## Pre-flight (do these BEFORE every production deploy)

These are the cheap insurances that let the rollback below actually work.

- [ ] **Snapshot the database.** Supabase: Settings → Database → Point-in-Time
      Recovery is sufficient for the standard plan. Self-hosted PG:
      `pg_dump --format=custom --no-owner --no-privileges $DATABASE_URL > snap-$(date -u +%Y%m%dT%H%M%SZ).dump`
      Upload to the deploy artifacts bucket and note the snapshot identifier
      in the deploy Slack message.
- [ ] **Capture the current image SHA.** The previous-stable image tag is
      what you'll roll back to. Pin it explicitly:
      `kubectl get deployment aura-web -n aura-system -o jsonpath='{.spec.template.spec.containers[0].image}' > .last-stable-image`
- [ ] **Capture the migration head.** `pnpm --filter @aura/database exec prisma migrate status` — note the last applied migration.
- [ ] **Dry-run new migrations.** `pnpm --filter @aura/database exec prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-migrations prisma/migrations --script` — review the SQL. If it includes `DROP COLUMN`, `DROP TABLE`, or `ALTER TYPE ... DROP`, treat as **destructive** and escalate before proceeding.

If you skipped any of these and the deploy goes bad, you will be improvising. Don't.

---

## Path A — App-only rollback (no migration involved)

Use when the bad deploy did NOT include a database migration, OR the
migration is forward-compatible with the previous app version.

```bash
# 1. Roll back to the previous image (k8s does the right thing here)
kubectl rollout undo deployment/aura-web -n aura-system

# 2. Wait for the rollout
kubectl rollout status deployment/aura-web -n aura-system --timeout=5m

# 3. Verify readyz
kubectl get pods -n aura-system -l app=aura-web
# Each pod should have READY 1/1; if not, check kubectl logs

# 4. End-to-end smoke
curl -fsS https://app.auraos.example.com/api/healthz
curl -fsS https://app.auraos.example.com/api/readyz | jq .status   # expect "ready"
```

If you also need to roll back a Fastify service, swap `aura-web` for the
service name (`auth-service`, `payroll-service`, etc.).

**Total expected time:** 3–7 minutes.

**Communicate immediately:**

- Post in `#prod-deploys` Slack: `Rolled back aura-web to <SHA>. Reason: <one-line summary>.`
- Acknowledge any active PagerDuty incident with `rolling back` status.

---

## Path B — Migration rollback (forward-only migrations)

Prisma migrations are forward-only by design. The "rollback" is **a new
forward migration that undoes the previous one**.

DO NOT delete or edit a migration file that has already been applied to
production. That breaks Prisma's migration ledger across every environment
that has the deleted file's entry in `_prisma_migrations`.

```bash
# 1. App rollback first (Path A above) so the OLD app version is running
#    against the NEW schema. This works IF the new schema is a superset of
#    the old one (added columns, added tables — usually fine). It does NOT
#    work if the migration dropped columns or constraints the old code
#    depends on.

# 2. Author a forward-fix migration that REVERSES the destructive change.
#    Branch off main, work locally:
pnpm --filter @aura/database exec prisma migrate dev --name revert_<original_migration_name>

# 3. Get the reverse migration through the same review + CD pipeline that
#    the original went through. Squash-merge to main → CD applies it.

# 4. Verify schema matches the old app expectation:
pnpm --filter @aura/database exec prisma migrate status
```

**If the migration corrupted data** (UPDATE statements that wrote bad
values into rows you can't reconstruct), the schema reverse is not enough.
Restore from the pre-deploy snapshot (Path C).

---

## Path C — DB restore from snapshot

**Use this only when migration rollback + app rollback are insufficient.**
This is data-loss territory: anything written between the snapshot time
and now will be gone.

**Pre-conditions:**

- The pre-deploy snapshot exists (you took it in the pre-flight, right?)
- Stakeholders have been informed of the data-loss window
- You have a maintenance window or are accepting a brief read-only outage

```bash
# 1. Put the app into maintenance mode (return 503 from /api/readyz so the
#    load balancer pulls pods out of rotation). Easiest path: scale the
#    web deployment to 0, route the LB to a maintenance page.
kubectl scale deployment/aura-web -n aura-system --replicas=0

# 2. Restore the snapshot. Supabase: Settings → Database → Backups → Restore
#    to the timestamp from the deploy. Self-hosted PG:
#    pg_restore --clean --if-exists --no-owner --no-privileges \
#               --dbname=$DATABASE_URL snap-YYYYMMDDTHHMMSSZ.dump

# 3. Verify schema and a known row:
psql $DATABASE_URL -c "SELECT version FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 5"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM aura_employee"   # sanity

# 4. Bring the app back up at the rolled-back version:
kubectl scale deployment/aura-web -n aura-system --replicas=2
kubectl rollout status deployment/aura-web -n aura-system

# 5. Verify
curl -fsS https://app.auraos.example.com/api/readyz | jq .
```

**Expected time:** 15–60 minutes depending on snapshot size.

**Communicate before, during, and after:**

- Status page: "Investigating elevated error rate. Service is temporarily
  in read-only mode while we restore database state."
- After restore: "Service restored. Data written between HH:MM and HH:MM
  may have been lost; affected customers will be contacted."
- Post-mortem within 48 hours.

---

## Communication checklist (every rollback, every time)

1. **Acknowledge in PagerDuty** within 5 minutes of starting the rollback.
2. **Post in #prod-deploys**: which version → which version, why, ETA.
3. **Status page** if customer-visible: `https://status.auraos.example.com`.
4. **Tag the post-mortem owner** for any rollback that took > 15 minutes
   or involved data loss.
5. **Update the deploy log** with the rollback SHA so the next deploy
   doesn't accidentally re-introduce the bad image.

---

## After-the-fact

Within **48 hours** of any rollback, the owner of the bad deploy must:

1. Write a brief post-mortem (template in `docs/runbooks/POSTMORTEM-TEMPLATE.md`
   — TBD, tracked in #43)
2. File issues for any automation that would have caught the problem earlier
   (CI test gap, missing health-check, slow alert)
3. Confirm the bad commits are not waiting in a release branch unnoticed

---

## What not to do

- ❌ Do NOT `git revert` a migration commit and force-push. The migration
  file's entry in `_prisma_migrations` will still be on every environment
  that ran it, and now there's no source-of-truth file for what was
  applied. Author a forward-fix migration instead.
- ❌ Do NOT skip the snapshot to save 30 seconds. The pre-flight is not
  optional.
- ❌ Do NOT roll back to an image older than the previous-stable. Two
  versions back is rarely the right answer; if it is, you're already
  in a much bigger problem and should escalate.
- ❌ Do NOT silence the alerts during the rollback. Other oncalls need to
  see what you're seeing.

---

## Related issues / docs

- Production-readiness audit: [docs/reports](../reports) — once persisted
- CD pre-deploy safety steps: GitHub Actions workflow `.github/workflows/cd.yml`
- Issue [#43](https://github.com/KreupAI-Technologies/KreupAI.AuraOS/issues/43)
  — origin of this runbook
- Issue [#42](https://github.com/KreupAI-Technologies/KreupAI.AuraOS/issues/42)
  — the `/api/healthz` + `/api/readyz` endpoints referenced above
