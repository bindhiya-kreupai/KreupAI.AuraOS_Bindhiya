# Runbook — Credential Rotation (Phase-0 Incident #20–#24)

**Status:** Open security incident — credentials remained committed to git history.
**Severity:** Blocker.
**Audience:** SRE / Security / Platform team — only humans with authority over the listed systems can execute this.

This runbook does not (and cannot) be executed by an automated agent. It captures the exact sequence so that whoever is on the rotation can move quickly without re-discovering the order of operations.

## TL;DR sequence

1. Issue #24 — Infrastructure passwords (Elasticsearch, RabbitMQ, Redis).
2. Issue #21 — JWT_SECRET + invalidate all sessions.
3. Issue #20 — Supabase database credentials.
4. Issue #22 — OAuth client secrets (Azure AD, Google, Okta).
5. Issue #23 — SAML SP private key + IdP federation re-establishment.
6. Issue #25 — Git history scrub of `.env` (after all above complete).

The order matters: rotating the JWT secret BEFORE the Supabase creds invalidates active sessions before the new DB creds land, minimizing the window where a stolen session could exfiltrate further data.

---

## Issue #24 — Infrastructure passwords (Elasticsearch, RabbitMQ, Redis)

### Pre-flight

- Confirm you have admin access to each control plane.
- Confirm you have a maintenance window — at minimum these services will need a brief restart.
- Audit logs are reviewed BEFORE rotation; preserve them for evidence.

### Steps

1. Generate new strong passwords (≥ 32 chars, 80 bits entropy minimum):
   ```bash
   openssl rand -base64 32 | tr -d '\n' | head -c 32
   ```
2. Rotate in this order:
   - **Redis**: `redis-cli ACL SETUSER default on >NEW_PASSWORD ~* &* +@all`. Update consumers' `REDIS_URL` / `REDIS_PASSWORD` env in your secrets manager.
   - **RabbitMQ**: `rabbitmqctl change_password aura_user NEW_PASSWORD`. Update `RABBITMQ_URL` env. Restart consumers gracefully.
   - **Elasticsearch**: rotate via Kibana → Stack Management → Users, OR API:
     ```bash
     curl -X POST "$ES_URL/_security/user/aura_user/_password" \
       -u elastic:OLD_PW \
       -H "Content-Type: application/json" \
       -d '{"password": "NEW_PW"}'
     ```
3. Update the secrets in your secrets manager (AWS Secrets Manager / GCP Secret Manager / Vault). Deploy.
4. Roll the consumer fleet to pick up the new env.
5. Confirm via health checks that all three services accept the new creds.
6. **Confirm via failed-auth log** that the OLD creds no longer work (try with old creds, expect 401/403).
7. Mark #24 closed with the rotation timestamp.

---

## Issue #21 — JWT_SECRET + active session invalidation

### Steps

1. Generate new secret:
   ```bash
   openssl rand -base64 64 | tr -d '\n'
   ```
2. Update `JWT_SECRET` (and `JWT_REFRESH_SECRET` if separate) in the secrets manager. Deploy.
3. Force-invalidate active sessions:
   ```sql
   UPDATE aura_user_session SET expires_at = NOW() WHERE expires_at > NOW();
   ```
   Or via Redis if sessions live there: `redis-cli --scan --pattern 'session:*' | xargs redis-cli DEL`.
4. Audit `aura_audit_log` for last-24h logins — these accounts now need to re-authenticate.
5. Mark #21 closed.

---

## Issue #20 — Supabase database credentials

### Steps

1. Log in to Supabase dashboard → Project Settings → Database → "Reset database password".
2. Update `DATABASE_URL`, `DIRECT_URL`, `PG_URI`, `PG_PASSWORD` in the secrets manager. Deploy.
3. Wait for the deploy to roll completely.
4. **Verify** via a benign query through the app (the DB connection pool must have rolled).
5. **Review the Supabase audit logs** at Project Settings → Logs → Database for any anomalous activity since the secret was first committed. Document any findings.
6. Mark #20 closed.

---

## Issue #22 — OAuth client secrets (Azure AD, Google, Okta)

For each IdP:

1. **Azure AD**: App Registrations → Your app → Certificates & secrets → "New client secret". Set 6-month expiry. Copy the value once.
2. **Google**: Google Cloud Console → APIs & Services → Credentials → Your OAuth 2.0 Client ID → "Reset secret".
3. **Okta**: Admin → Applications → Your app → Sign On → "Update client secret".

Per-IdP:

- Update `<IDP>_CLIENT_SECRET` in the secrets manager.
- Deploy.
- Test the SSO login flow end-to-end with a real test account.
- Review the IdP's sign-in logs for the period the leaked secret was exposed (since first commit of `.env`). Document anomalous logins.
- Mark #22 closed.

---

## Issue #23 — SAML SP private key + IdP federation

### Steps

1. Generate new SP key pair:
   ```bash
   openssl req -x509 -newkey rsa:2048 -keyout sp-private-new.pem -out sp-cert-new.pem -days 730 -nodes \
     -subj "/CN=auraos.kreup.ai/O=KreupAI/C=AE"
   ```
2. Update `SAML_SP_PRIVATE_KEY` and `SAML_SP_CERTIFICATE` in the secrets manager. **Do NOT remove the OLD key yet** — the IdP still expects it.
3. Upload the new cert to every federated IdP. They should accept multiple SP certs during the transition.
4. Wait for the IdP propagation (usually < 1 hour, can be 24h for some enterprises).
5. Cut over: set the new cert as primary in each IdP. Test SSO.
6. Remove the OLD cert from the IdPs and the secrets manager.
7. Mark #23 closed.

---

## Issue #25 — Git history scrub

**Do this LAST.** All credential rotations must succeed before scrubbing — the rotation is what makes the leaked secrets safe to remove from history.

### Options

**Option A — `git-filter-repo` (recommended)**

```bash
brew install git-filter-repo
# Backup the repo first
git clone --mirror https://github.com/KreupAI-Technologies/KreupAI.AuraOS aura.git
cd aura.git
git filter-repo --path .env --invert-paths --force
git push --mirror --force origin
```

After:

- Everyone with clones must re-clone (commit hashes will change).
- Tags and branches are rewritten — coordinate with the team.
- GitHub may take up to 24h to garbage-collect old commits.

**Option B — BFG Repo-Cleaner**

```bash
brew install bfg
bfg --delete-files .env aura.git
cd aura.git && git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --mirror --force
```

**Option C — Skip the scrub**

If you'd rather not rewrite history, you can:

- Mark the leaked secrets as known-bad in any monitoring (Have I Been Pwned-style watch lists).
- Trust the rotations from issues #20-#24 — the secrets are now invalid even if discovered later.
- Document the decision in this runbook.

### Decision

The team must pick one option. Default suggestion: **Option A** for full hygiene, executed off-hours, with team-wide notice.

Mark #25 closed once the chosen option is executed (or the decision is documented).

---

## Post-mortem

After all 6 issues close:

- Run a tabletop exercise: "what would have happened if the leaked .env had been discovered by an adversary on day 1?".
- Add a pre-commit hook (already present at `scripts/scan-staged-for-secrets.sh`) to prevent recurrence.
- Add an OPA / Conftest policy that fails CI if any `.env` file is in the diff.
- File a follow-up issue if any IdP sign-in log showed anomalous activity since the leak window.
