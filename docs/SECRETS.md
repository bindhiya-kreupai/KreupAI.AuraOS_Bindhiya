# AuraOS — Secrets Management Runbook

**Purpose:** how AuraOS stores, retrieves, and rotates secrets. Authoritative source for the secrets-management policy.

**Audience:** engineers writing code that reads secrets; operators who rotate them; reviewers gating PRs that touch secret-handling code.

---

## TL;DR

| Environment              | Where secrets live                                 | How code reads them                                |
| ------------------------ | -------------------------------------------------- | -------------------------------------------------- |
| **Local dev**            | `apps/web/.env.local` (gitignored)                 | `process.env.X` via the zod-validated `env` module |
| **CI**                   | GitHub Actions repository secrets                  | injected as `env:` on the workflow step            |
| **Staging / Production** | AWS Secrets Manager (or Vault — provider-agnostic) | `SecretsManager.get('KEY')` from `@aura/secrets`   |

**Never commit secrets to git.** Pre-commit hook scans for them
(`scripts/scan-staged-for-secrets.sh`). Templates with placeholders live
at `.env.example` and `.env.production.example`.

---

## Rotation policy

| Secret class                                         | Rotation cadence                                  | Owned by |
| ---------------------------------------------------- | ------------------------------------------------- | -------- |
| Database passwords (Supabase / Postgres)             | Every 90 days OR immediately on exposure          | Platform |
| JWT_SECRET / JWT_REFRESH_SECRET                      | Every 90 days; emergency on any auth incident     | Platform |
| MFA_ENCRYPTION_KEY / SSN_ENCRYPTION_KEY              | Every 365 days (re-encryption migration required) | Security |
| OAuth client secrets (Azure / Google / Okta)         | Every 365 days OR provider notification           | Platform |
| SAML SP private key                                  | Every 730 days OR IdP request                     | Security |
| Infra service passwords (Redis / RabbitMQ / Elastic) | Every 180 days                                    | Platform |
| Sentry DSN / Datadog API key                         | Annual review (low-value rotation target)         | Platform |

**Emergency rotation triggers** (any one is sufficient):

- Suspected leak (audit log shows unusual access)
- Provider notification of compromise
- Repo audit finds secret in committed file
- Employee with secrets access departs the org

For an emergency, follow [docs/runbooks/ROLLBACK.md](runbooks/ROLLBACK.md) for app-side and the per-provider sections below.

---

## Per-provider rotation runbooks

### Supabase / Postgres `DATABASE_URL`

```bash
# 1. Generate new password in Supabase dashboard
#    Settings -> Database -> Reset password

# 2. Stage the new connection string in AWS Secrets Manager
aws secretsmanager update-secret \
  --secret-id /aura/production/DATABASE_URL \
  --secret-string "postgresql://USER:NEW_PASS@HOST:6543/DB?sslmode=require&pgbouncer=true&connection_limit=1"

# 3. Trigger a rolling restart of all services so they pick up the new value
kubectl rollout restart deployment/aura-web -n aura-system
kubectl rollout restart deployment/auth-service -n aura-system
# ... repeat for all services

# 4. Verify nothing is using the old password
#    Review Supabase logs for the next 30 minutes for connection failures

# 5. Audit access logs since the previous rotation
#    Supabase -> Settings -> Database -> Logs
```

### JWT_SECRET

Critical: rotating invalidates every active access token. Refresh tokens stored in Redis stay valid because they're checked against the DB; only access-token verification breaks. UX impact: brief 401 spike as clients refresh tokens.

```bash
# 1. Generate new secret (NEVER reuse rotated values)
openssl rand -base64 64

# 2. Update in AWS Secrets Manager
aws secretsmanager update-secret \
  --secret-id /aura/production/JWT_SECRET \
  --secret-string "$(openssl rand -base64 64)"

# 3. Rolling restart of all services that verify JWTs
kubectl rollout restart deployment/aura-web -n aura-system
kubectl rollout restart deployment/auth-service -n aura-system

# 4. Monitor 401 rate for 15 minutes — should normalise within 2-3 minutes
```

For the **HS256 → RS256 migration** (recommended, deferred): generate
an RSA key pair, sign with private, verify with public, distribute
public to all services. Eliminates the "every service has a copy of
the signing secret" problem.

### MFA_ENCRYPTION_KEY (re-encryption migration)

The hardest rotation. Existing TOTP secrets are encrypted with the
current key; rotating breaks every user's MFA unless you re-encrypt.

```ts
// scripts/rotate-mfa-encryption-key.ts (one-time migration)
import { prisma } from '@aura/database';
import * as crypto from 'crypto';

async function reencrypt(oldKey: string, newKey: string) {
  const all = await prisma.userMFA.findMany({
    where: { totpSecret: { not: null } },
    select: { id: true, totpSecret: true },
  });
  for (const row of all) {
    const plaintext = decrypt(row.totpSecret!, oldKey);
    const reencrypted = encrypt(plaintext, newKey);
    await prisma.userMFA.update({
      where: { id: row.id },
      data: { totpSecret: reencrypted },
    });
  }
}
```

Run BEFORE flipping the env var; document the cutover in
`docs/runbooks/ROLLBACK.md`.

### OAuth client secrets

Per-provider — see [Phase 0 issue #22](https://github.com/KreupAI-Technologies/KreupAI.AuraOS/issues/22) for the step-by-step at each provider's admin console.

### SAML SP private key

Per [Phase 0 issue #23](https://github.com/KreupAI-Technologies/KreupAI.AuraOS/issues/23).

---

## How code reads secrets

### Local development

```ts
// apps/web/src/lib/whatever.ts
import { env } from '@/lib/config/env';

const apiKey = env.SENTRY_DSN; // validated, type-safe
```

The `env` module (apps/web/src/lib/config/env.ts) parses `process.env`
with a zod schema at startup and throws if anything required is missing.
The schema also enforces production-only requirements (REDIS_URL,
SENTRY_DSN, etc. mandatory in `NODE_ENV=production`).

#### Workspace-root `.env` propagation to `services/*` (issue #51)

The Fastify services in `services/*` boot in their own processes and do
not inherit the workspace-root `.env` automatically. Each service's
`dev` script in `package.json` uses tsx's `--env-file` flag to load the
root `.env` explicitly:

```json
"dev": "tsx watch --env-file=../../.env src/index.ts"
```

This means a single shared `JWT_SECRET` (and any other workspace-level
vars) propagates to every service when you run `pnpm dev`. Per-service
overrides live in `services/<name>/.env.production.example`.

Each service still fails fast at boot if a required value is missing —
e.g. `services/auth-service/src/config.ts` throws on a missing
`JWT_SECRET` rather than starting with an insecure default.

### Production (long-form)

```ts
import { SecretsManager } from '@aura/secrets';

const secrets = new SecretsManager({
  provider: 'aws-ssm',
  awsRegion: 'me-central-1',
  awsPathPrefix: '/aura/production/',
});

const dbUrl = await secrets.get('DATABASE_URL');
```

The `@aura/secrets` package supports three providers:

- `env` — reads from `process.env` (default, local dev)
- `aws-ssm` — AWS Systems Manager Parameter Store
- `vault` — HashiCorp Vault

When you need to add another provider (Doppler, 1Password CLI, etc.),
implement the `SecretProvider` interface in `packages/@aura/secrets/src/`.

---

## How NOT to handle secrets

These patterns are explicit anti-patterns; CI will block them and PR reviewers will request changes.

- ❌ `const SECRET = process.env.X || 'default-value';`
  Fall back to throw, not to a hardcoded default. Default values become production secrets.

- ❌ Committing a `.env` file with real values.
  Templates only (`.env.example`, `.env.production.example`).

- ❌ Putting a secret in a `console.log` or `console.error`.
  Pino's redact list (`apps/web/src/lib/logger/index.ts`) catches the common keys, but log custom fields with care.

- ❌ Storing a secret in a JWT payload claim.
  JWTs are base64, not encrypted. Treat the whole payload as public.

- ❌ Returning a secret in an API response, even to authenticated callers.
  Render the necessary derived value (e.g. an OTP code) and discard the source.

- ❌ Using a single secret for multiple environments.
  Each environment (dev, staging, prod) gets its own secrets. A leak in dev should not compromise prod.

---

## Pre-commit secret scanner

Every `git commit` runs `scripts/scan-staged-for-secrets.sh`, which scans the staged diff for known secret patterns (JWT-shaped strings, AWS access keys, private keys, GitHub PATs, Slack tokens, embedded DB passwords). It explicitly tolerates the placeholders the templates use (`REPLACE_WITH_*`, `your-*-here`, `change-this-in-production`).

If a real secret slips through:

1. Rotate the secret IMMEDIATELY (don't wait for review)
2. Remove from staged content
3. Consider history scrub (see [Phase 0 issue #25](https://github.com/KreupAI-Technologies/KreupAI.AuraOS/issues/25))
4. Document the near-miss in the team channel — process improvement

To bypass intentionally (rare; documented why in commit message):

```bash
git commit --no-verify
```

---

## CI / staging / prod secret loading

| Env                   | Source                                            | Loaded by                  |
| --------------------- | ------------------------------------------------- | -------------------------- |
| GitHub Actions CI     | `secrets.*` in workflow YAML                      | `env:` step config         |
| Staging Kubernetes    | AWS Secrets Manager via External Secrets Operator | Auto-synced to k8s Secrets |
| Production Kubernetes | Same as staging, different SSM path prefix        | Same                       |

The k8s manifests at `k8s/base/secrets.yaml` reference Secret resources, not the secret values themselves. The actual values arrive via External Secrets Operator pulling from SSM. **Never put secret values in the YAML.**

---

## Architecture decision record

| Decision                    | Choice                                           | Date                              | Rationale                                                                                                                                                                  |
| --------------------------- | ------------------------------------------------ | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default provider            | `env` for dev, `aws-ssm` for prod                | 2026-06-01                        | AWS Secrets Manager is already in use elsewhere in the org; one fewer system to operate vs Vault                                                                           |
| Symmetric vs asymmetric JWT | HS256 today; RS256 deferred                      | 2026-06-01                        | RS256 avoids the "every verifier has a copy of the signing key" risk but adds key-distribution complexity. Deferred until SSO/cross-domain auth becomes a hard requirement |
| Secret scanner              | Homegrown bash + grep                            | 2026-06-01                        | Zero-dependency, no binary install needed. Trade-off: lower fidelity than gitleaks. CI can run gitleaks as a parallel job later                                            |
| In-history scrub            | Lightweight ignore-only, not filter-repo rewrite | 2026-06-01 (pending #25 approval) | Force-push to main has high blast radius. Lightweight scrub is fully reversible and stops future regressions                                                               |

---

## Related

- [Phase 0 milestone](https://github.com/KreupAI-Technologies/KreupAI.AuraOS/milestone/1)
- [docs/runbooks/ROLLBACK.md](runbooks/ROLLBACK.md) — emergency rollback procedures
- `packages/@aura/secrets/` — the secrets-manager implementation
- `apps/web/src/lib/config/env.ts` — startup env validation
- `.env.production.example` — production env template
