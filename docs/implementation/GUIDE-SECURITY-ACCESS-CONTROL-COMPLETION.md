# Security & Access Control Completion Guide

**Document Version**: 1.0
**Last Updated**: July 12, 2026
**Owner**: Platform Engineering Team
**Status**: Planning Ready — includes an unverified-scope item requiring a security review before implementation
**Estimated Timeline**: 7 phases
**Priority**: Critical (compliance-claim risk)

---

## Quick Navigation

1. [Feature Completion Master Plan](./FEATURE-COMPLETION-MASTER-PLAN.md)
2. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
3. [Audit and Compliance Completion Guide](./GUIDE-AUDIT-COMPLIANCE-COMPLETION.md) — covers Audit Logs, Compliance Tracker, Data Retention, Policy Management; **this guide covers the remaining Compliance & Security scope**: Access Control and Data Security
4. Source requirements: [docs/marketing/FEATURES-GUIDE.md](../marketing/FEATURES-GUIDE.md), Section 13 "Compliance & Security"

## Overview

`docs/marketing/FEATURES-GUIDE.md` Section 13 groups four sub-domains: Access Control, Audit & Compliance, Data Security, and Certifications. Audit & Compliance is already scoped by the [Audit and Compliance Completion Guide](./GUIDE-AUDIT-COMPLIANCE-COMPLETION.md). This guide completes the remaining three: **Access Control**, **Data Security**, and the evidence-mapping work needed to support **Certifications** claims.

### Current Evidence

Confirmed via `docs/qa-reports/MODULES-SUMMARY-REPORT.md`: Security & Access Control is **70% complete, Quality Score 7.5/10** — "Some advanced features mocked. No AI-powered security."

What already exists and is real:

- Role-based access schema: `Role`, `UserRole`, `Permission`, `RolePermission` in `packages/@aura/database/prisma/schema.prisma` (lines ~490-580)
- MFA service and UI: [../../apps/web/src/services/auth/mfa.service.ts](../../apps/web/src/services/auth/mfa.service.ts), [../../apps/web/src/components/security/MFASetup.tsx](../../apps/web/src/components/security/MFASetup.tsx), with existing test coverage in `apps/web/src/__tests__/security/mfa-flow.test.ts`
- Enhanced auth middleware with permission + role resolution: [../../apps/web/src/lib/auth/enhanced-middleware.ts](../../apps/web/src/lib/auth/enhanced-middleware.ts)

What is confirmed a stub:

- SSO: [../../apps/web/src/app/api/sso-config/route.ts](../../apps/web/src/app/api/sso-config/route.ts) exists as a route but no SAML/OAuth provider integration was found in the codebase search for this guide

What is **unverified** (no code evidence found in this repo search — requires direct confirmation before scoping, not an assumption of greenfield):

- Field-level/at-rest encryption for sensitive PII (SSN, bank account numbers)
- Data masking for non-privileged roles reading PII
- Backup & Recovery implementation (this may be infrastructure-level and outside this repo's code, e.g. managed Postgres backups)

**Compliance-claim risk**: `docs/marketing/AuraOS-Product-Brochure-Content.md` already lists SOC 2 Type II, GDPR, ISO 27001, and HIPAA readiness under Certifications. If the Data Security items above are genuinely unimplemented at the application layer, this is a stakeholder-facing risk, not just a backlog item — see Phase 6.

---

## Objective

Close the verified gaps in Access Control (MFA enforcement, Session Management, SSO), and produce a verified, evidence-backed status for Data Security before any Certifications claim is treated as supportable.

---

## Functional Scope

### Access Control

1. Role-Based Access — already largely real; verify end-to-end enforcement coverage
2. Multi-Factor Auth — service and UI exist; verify enforcement at login, not just as an optional settings toggle
3. Single Sign-On (SAML, OAuth) — currently a stub; needs real provider integration
4. Session Management — active session listing and revocation

### Data Security

1. Encryption (AES-256, TLS 1.3) — verify what already exists at infra level vs. what needs application-level column encryption for PII
2. Data Masking — sensitive field protection for non-privileged roles
3. Backup & Recovery — document and verify RPO/RTO, confirm ownership (infra vs. app)
4. Tenant Isolation — already a cross-cutting platform convention; this phase adds a formal verification pass rather than new implementation

### Certifications

1. SOC 2 Type II, GDPR, ISO 27001, HIPAA — not code deliverables; produced as a control-to-implementation-to-test evidence map once the above phases land

---

## Phased Plan

### Phase 1: Access Control Verification Pass

Deliverables:

1. Confirm `Role`/`Permission`/`RolePermission`/`UserRole` coverage across all modules referenced in the Feature Completion Tracker — identify any route still missing permission checks
2. Document current permission string conventions (`<module>:read`/`<module>:write`) as a canonical reference for all future guides

### Phase 2: MFA Enforcement

Deliverables:

1. Confirm `mfa.service.ts` is enforced at the authentication boundary (login flow), not only available as an opt-in settings screen
2. Close any gap between MFA setup UI and actual login-time verification
3. Extend `apps/web/src/__tests__/security/mfa-flow.test.ts` coverage for enforcement paths, not just setup

### Phase 3: Session Management

Deliverables:

1. Active session listing per user (device, location/IP, last active)
2. Force-revoke a session (admin and self-service)
3. Session revocation must emit an audit event

### Phase 4: Single Sign-On

Deliverables:

1. Replace the stub in `app/api/sso-config/route.ts` with real SAML/OAuth provider configuration and callback handling
2. Map SSO-authenticated identities to existing `User`/`Role` records — no parallel identity model
3. Tenant-level SSO configuration (enterprise customers typically require per-tenant IdP config)

### Phase 5: Compliance Tracker Reconciliation

Deliverables:

1. Coordinate with the [Audit and Compliance Completion Guide](./GUIDE-AUDIT-COMPLIANCE-COMPLETION.md) — the "mock compliance engine" finding there should be resolved by connecting to real regulatory checks already implemented elsewhere (WPS, GOSI, EOSB per `docs/hr-gap-analysis/05-IMPLEMENTATION-ROADMAP.md`) rather than building a second compliance engine here

### Phase 6: Data Security Verification and Gap Closure

This phase starts with a **review, not implementation**, per the Claude/Copilot split defined in `CLAUDE.md`:

Deliverables:

1. Direct confirmation (with whoever owns infra/security) of what encryption, masking, and backup capability actually exists today, at both infra and application layers
2. If gaps are confirmed:
   - Column-level encryption for defined PII fields (SSN, bank account, national ID)
   - View/query-layer masking for non-privileged roles reading PII fields
   - Documented backup RPO/RTO with verified recovery test
3. If capability already exists but is undocumented, produce the evidence documentation instead of rebuilding

### Phase 7: Certifications Evidence Mapping

Deliverables:

1. Control-to-implementation-to-test matrix for SOC 2 Type II, GDPR, ISO 27001, and HIPAA claims made in marketing materials
2. Flag any claim not yet supportable by evidence to stakeholders before external audit or customer-facing use

---

## Required Architecture

### Login + MFA + Session Lifecycle

1. Credential authentication
2. MFA challenge (if enabled for user/tenant policy) — must be enforced server-side before session issuance, not merely offered
3. Session created, tied to user/device/IP metadata
4. Role/permission resolution attached to session (existing `enhanced-middleware.ts` pattern)
5. Session listed in the user's active sessions; revocable by user or admin
6. All of the above emit audit events

### SSO Lifecycle

1. Tenant-level IdP configuration (SAML metadata or OAuth client config)
2. Redirect to IdP, receive assertion/token
3. Validate assertion; map to existing `User` record (create-on-first-login policy to be decided explicitly, not assumed)
4. Issue platform session identical in shape to password-based login (same downstream role/permission resolution)

---

## Security Rules

1. MFA verification must happen before any session/token is issued — never accept a partial-auth state as fully authenticated.
2. SSO-created sessions must carry the same tenant scoping and role resolution as password-based sessions — no shortcut path that bypasses permission checks.
3. Session revocation must be immediate (token/session invalidation, not just UI removal).
4. Any PII masking must be enforced at the query/service layer, not only hidden in the UI.
5. Access to audit data about security events (login attempts, MFA failures, session revocations) is itself access-controlled and audited, per the Audit and Compliance Completion Guide.

---

## Testing Strategy

### Unit Tests

1. MFA challenge required before session issuance
2. Permission resolution correctness for role/permission combinations
3. Data masking rule application per role

### Integration Tests

1. End-to-end login with MFA enforcement
2. SSO login flow against a test IdP
3. Session listing and forced revocation
4. Tenant isolation for all access-control routes

### Security Tests

1. Attempted bypass of MFA enforcement
2. Cross-tenant session/permission leakage
3. Unmasked PII exposure to non-privileged roles
4. Unauthorized access to security/audit event data

---

## Success Criteria

1. MFA is enforced at login for any user/tenant with MFA policy enabled — not just available as a toggle.
2. SSO is a real, working provider integration, not a stub route.
3. Session management (list + revoke) is available and audited.
4. Data Security status (encryption, masking, backup) is verified and documented — either confirmed implemented or explicitly flagged as a gap with a closure plan.
5. A certifications evidence map exists connecting each marketing claim to verified implementation and tests.

---

## Exit Gate

This guide is complete when:

1. Access Control gaps (MFA enforcement, SSO, session management) are closed and tested.
2. Data Security capability is verified — no claim is made or repeated without evidence.
3. Certifications claims in `docs/marketing/AuraOS-Product-Brochure-Content.md` are either supportable by evidence or flagged and corrected.

---

## Risks

| ID  | Risk                                                                                                                      | Impact   | Mitigation                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------- |
| S1  | Data Security (encryption/masking/backup) may be genuinely unimplemented despite existing Certifications marketing claims | Critical | Phase 6 review before any external audit or compliance claim is repeated                    |
| S2  | SSO stub may be mistaken for a working feature by sales/customers                                                         | High     | Phase 4 replaces stub with real integration; flag current state immediately to stakeholders |
| S3  | MFA may be implemented as opt-in only, giving a false sense of enforcement                                                | High     | Phase 2 explicitly verifies enforcement, not just availability                              |
| S4  | Compliance Tracker work here duplicates the Audit and Compliance Completion Guide's scope                                 | Medium   | Phase 5 explicitly coordinates rather than re-scopes                                        |

---

## Related Guides

1. [Feature Completion Master Plan](./FEATURE-COMPLETION-MASTER-PLAN.md)
2. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
3. [Audit and Compliance Completion Guide](./GUIDE-AUDIT-COMPLIANCE-COMPLETION.md)
4. [Analytics & Reporting Completion Guide](./GUIDE-ANALYTICS-REPORTING-COMPLETION.md)
