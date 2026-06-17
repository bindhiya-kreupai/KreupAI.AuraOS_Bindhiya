# Gap Analysis: EPIC-27: Chapter 27 – Termination and Separation Compliance

> **⚠️ STALE — superseded 2026-06-17.** This epic-level gap file predates the GCC compliance batched commits. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list across all 38 epics (~14% of stories are true gaps; the rest are shipped). This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-27-chapter-27-termination-and-separation-comp.md](./EPIC-27-chapter-27-termination-and-separation-comp.md)
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This storywise gap review compares each GCC compliance user story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based and should be treated as a triage signal, not proof that all acceptance criteria are satisfied. Planning/report documents are listed separately when they match the story.

## Summary

- Stories assessed: 21
- Missing: 13
- Partial: 8

## Epic Goal

Deliver an end-to-end AuraOS Separation module that manages every exit type (resignation, employer termination, mutual, redundancy, non-renewal, probation, abandonment, death in service) with correct notice-period, garden-leave, exit-clearance, final-settlement, EOSB, leave-encashment and recoveries handling. It orchestrates downstream closures—visa/work-permit cancellation, social insurance, benefits, IT/data-access—plus handover and exit interview, fully country-configured for UAE, KSA, Bahrain, Qatar, Oman and Kuwait with a defensible audit trail.

## Storywise Gaps

### EPIC-27-S01 — Separation Governance, Policy & Types Framework

**Status:** Missing
**Covers:** 27.1, 27.2, 27.3, 27.4, 27.5
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-27-S02 — Resignation Compliance

**Status:** Missing
**Covers:** 27.6
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-27-S03 — Employer Termination

**Status:** Missing
**Covers:** 27.7
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-27-S04 — Mutual Separation & Settlement Agreement

**Status:** Missing
**Covers:** 27.8
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-27-S05 — Redundancy & Restructuring

**Status:** Missing
**Covers:** 27.9
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-27-S06 — Non-Renewal of Fixed-Term Contract & Probation Termination

**Status:** Missing
**Covers:** 27.10, 27.11
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-27-S07 — Abandonment / Absconding / Unauthorized Absence

**Status:** Missing
**Covers:** 27.12
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-27-S08 — Notice Period Compliance & Garden Leave

**Status:** Partial
**Covers:** 27.13, 27.14
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/app/(modules)/leave/calendar/holidays/page.tsx
- apps/web/src/app/(modules)/leave/holiday-management/page.tsx
- apps/web/src/app/api/leave/holidays/route.ts
- apps/web/src/app/dashboard/leave/holiday-management/page.tsx
- apps/mobile/src/screens/leave/ApplyLeaveScreen.tsx
- apps/mobile/src/screens/leave/LeaveApprovalsScreen.tsx

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-LEAVE-ENGINE-COMPLETION.md
- docs/implementation/LEAVE-ENGINE-PLANNING.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-27-S09 — Exit Clearance Orchestration

**Status:** Partial
**Covers:** 27.15
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/app/api/v1/exits/[id]/clearances/[clearanceId]/complete/route.ts
- apps/web/src/app/api/v1/exits/[id]/clearances/route.ts
- apps/web/src/app/api/v1/hr/exits/[id]/clearance/route.ts
- apps/web/src/components/hr/ExitClearanceTracker.tsx

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-27-S10 — Final Settlement, EOSB Linkage, Leave Encashment & Recoveries

**Status:** Partial
**Covers:** 27.16, 27.17, 27.18, 27.19
**Acceptance criteria count:** 6 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/app/(modules)/leave/balances/encashment/page.tsx
- apps/web/src/app/(modules)/leave/leave-encashment/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/settlement-simulation/page.tsx
- apps/web/src/app/api/leave/encashment/route.ts
- apps/web/src/app/api/v1/leave-encashments/[id]/approve/route.ts
- apps/web/src/app/api/v1/leave-encashments/route.ts

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-LEAVE-ENGINE-COMPLETION.md
- docs/implementation/LEAVE-ENGINE-PLANNING.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-27-S11 — Visa, Work Permit & Immigration Closure

**Status:** Partial
**Covers:** 27.20
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/app/dashboard/mobility/visa-immigration/page.tsx
- apps/web/src/app/api/v1/visa-permits/[id]/renewals/route.ts
- apps/web/src/app/api/v1/visa-permits/[id]/route.ts
- apps/web/src/app/api/v1/visa-permits/expiring/route.ts
- apps/web/src/app/api/v1/visa-permits/renewals/[renewalId]/transition/route.ts
- apps/web/src/app/api/v1/visa-permits/route.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-27-S12 — Social Insurance & Benefits Closure

**Status:** Partial
**Covers:** 27.21, 27.22
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/components/benefits/PensionEOSBDashboard.tsx
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx
- apps/mobile/src/screens/benefits/ClaimDetailsScreen.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-27-S13 — IT & Data Access Closure

**Status:** Missing
**Covers:** 27.23
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-27-S14 — Handover Management & Exit Interview

**Status:** Partial
**Covers:** 27.24, 27.25
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/app/api/offboarding/exit-interviews/route.ts
- apps/web/src/app/dashboard/offboarding/exit-interview/page.tsx

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-27-S15 — Death in Service

**Status:** Missing
**Covers:** 27.26
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-27-S16 — Separation Data Privacy

**Status:** Missing
**Covers:** 27.27
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-27-S17 — Separation Audit Checklist & Risk Matrix

**Status:** Partial
**Covers:** 27.28, 27.30
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/**tests**/security/dependency-audit.test.ts
- apps/web/src/app/(modules)/audit-security/page.tsx
- apps/web/src/app/(modules)/workflow-engine/audit-log/page.tsx
- apps/web/src/app/api/audit-logs/route.ts
- apps/web/src/app/api/security/audit-logs/route.ts
- apps/web/src/app/api/v1/admin/audit-log/export/route.ts

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; verify evidence capture, retention, and immutable audit.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-27-S18 — Separation KPIs, Dashboard & Automation Design

**Status:** Missing
**Covers:** 27.29, 27.31, 27.32
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests; verify query-backed dashboard/reporting.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-27-S19 — Monthly Separation Compliance Pack

**Status:** Missing
**Covers:** 27.33
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-27-S20 — Sample Separation Request/Approval Form, Exit Clearance & Final Settlement Checklists

**Status:** Partial
**Covers:** 27.34, 27.35, 27.36
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/app/api/offboarding/final-settlements/route.ts
- apps/web/src/app/api/v1/exits/[id]/clearances/[clearanceId]/complete/route.ts
- apps/web/src/app/api/v1/exits/[id]/clearances/route.ts
- apps/web/src/app/api/v1/hr/exits/[id]/clearance/route.ts
- apps/web/src/components/hr/ExitClearanceTracker.tsx

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; verify workflow approvals and audit events.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-27-S21 — Key Takeaways & Separation Knowledge Reference

**Status:** Missing
**Covers:** 27.37
**Acceptance criteria count:** 5 · **Task count:** 4

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.
