# Gap Analysis: EPIC-07: Chapter 7 – Immigration & Work Authorization Compliance

> **⚠️ STALE — superseded 2026-06-17.** This epic-level gap file predates the GCC compliance batched commits. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list across all 38 epics (~14% of stories are true gaps; the rest are shipped). This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-07-chapter-7-immigration-work-authorization-c.md](./EPIC-07-chapter-7-immigration-work-authorization-c.md)
> Module: Immigration
> Generated: 2026-06-16

## Assessment Method

This storywise gap review compares each GCC compliance user story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based and should be treated as a triage signal, not proof that all acceptance criteria are satisfied. Planning/report documents are listed separately when they match the story.

## Summary

- Stories assessed: 15
- Partial: 15

## Epic Goal

Deliver an AuraOS immigration command centre that manages the full work-authorization lifecycle for every GCC country — entry permit, work permit/labour card, residence visa, Emirates ID/Iqama/CPR/QID, and dependent visas — from issuance through renewal, transfer, cancellation and exit. The system drives PRO workflows, enforces job-title/occupation and work-location rules, maintains a complete document register, and fires 60/30/7-day expiry alerts so the workforce stays legally authorised at all times.

## Storywise Gaps

### EPIC-07-S01 — Immigration purpose, lifecycle & policy context content

**Status:** Partial
**Covers:** 7.1, 7.2, 7.3, 7.19
**Acceptance criteria count:** 4 · **Task count:** 5

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

### EPIC-07-S02 — Key immigration document model & status engine

**Status:** Partial
**Covers:** 7.4
**Acceptance criteria count:** 6 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/app/dashboard/mobility/visa-immigration/page.tsx
- apps/web/src/app/api/v1/visa-permits/[id]/renewals/route.ts
- apps/web/src/app/api/v1/visa-permits/[id]/route.ts
- apps/web/src/app/api/v1/visa-permits/expiring/route.ts
- apps/web/src/app/api/v1/visa-permits/renewals/[renewalId]/transition/route.ts
- apps/web/src/app/api/v1/visa-permits/route.ts

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-DOCUMENT-SERVICE.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; verify evidence capture, retention, and immutable audit.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-07-S03 — Country-wise immigration & work authorization framework (rule engine)

**Status:** Partial
**Covers:** 7.5
**Acceptance criteria count:** 6 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/app/dashboard/mobility/visa-immigration/page.tsx
- apps/web/src/app/api/v1/visa-permits/[id]/renewals/route.ts
- apps/web/src/app/api/v1/visa-permits/[id]/route.ts
- apps/web/src/app/api/v1/visa-permits/expiring/route.ts
- apps/web/src/app/api/v1/visa-permits/renewals/[renewalId]/transition/route.ts
- apps/web/src/app/api/v1/visa-permits/route.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-07-S04 — Job title & occupation classification compliance

**Status:** Partial
**Covers:** 7.6
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

### EPIC-07-S05 — Work location compliance

**Status:** Partial
**Covers:** 7.7
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

### EPIC-07-S06 — Employee transfer & mobility management

**Status:** Partial
**Covers:** 7.8
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/app/dashboard/mobility/visa-immigration/page.tsx
- apps/web/src/app/dashboard/mobility/immigration/page.tsx
- apps/web/src/app/api/v1/visa-permits/[id]/renewals/route.ts
- apps/web/src/app/api/v1/visa-permits/[id]/route.ts
- apps/web/src/app/api/v1/visa-permits/expiring/route.ts
- apps/web/src/app/api/v1/visa-permits/renewals/[renewalId]/transition/route.ts

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-07-S07 — Dependents & family visa support

**Status:** Partial
**Covers:** 7.9
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

### EPIC-07-S08 — Renewal management with 60/30/7-day alerts

**Status:** Partial
**Covers:** 7.10
**Acceptance criteria count:** 6 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/app/api/v1/visa-permits/[id]/renewals/route.ts
- apps/web/src/app/api/v1/visa-permits/renewals/[renewalId]/transition/route.ts
- apps/web/src/app/dashboard/mobility/visa-immigration/page.tsx
- apps/web/src/app/api/v1/visa-permits/[id]/route.ts
- apps/web/src/app/api/v1/visa-permits/expiring/route.ts
- apps/web/src/app/api/v1/visa-permits/route.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-07-S09 — Cancellation & exit immigration compliance

**Status:** Partial
**Covers:** 7.11
**Acceptance criteria count:** 6 · **Task count:** 6

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

### EPIC-07-S10 — Immigration document register (configurable register + export)

**Status:** Partial
**Covers:** 7.12
**Acceptance criteria count:** 5 · **Task count:** 4

**Existing implementation evidence**

- apps/web/src/app/dashboard/mobility/visa-immigration/page.tsx
- apps/web/src/app/api/v1/visa-permits/[id]/renewals/route.ts
- apps/web/src/app/api/v1/visa-permits/[id]/route.ts
- apps/web/src/app/api/v1/visa-permits/expiring/route.ts
- apps/web/src/app/api/v1/visa-permits/renewals/[renewalId]/transition/route.ts
- apps/web/src/app/api/v1/visa-permits/route.ts

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-DOCUMENT-SERVICE.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; verify evidence capture, retention, and immutable audit.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-07-S11 — Immigration audit checklist & work authorization checklist

**Status:** Partial
**Covers:** 7.13, 7.18
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/app/dashboard/mobility/visa-immigration/page.tsx
- apps/web/src/app/(modules)/workflow-engine/audit-log/page.tsx
- apps/web/src/app/api/v1/visa-permits/[id]/renewals/route.ts
- apps/web/src/app/api/v1/visa-permits/[id]/route.ts
- apps/web/src/app/api/v1/visa-permits/expiring/route.ts
- apps/web/src/app/api/v1/visa-permits/renewals/[renewalId]/transition/route.ts

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; verify evidence capture, retention, and immutable audit.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-07-S12 — Immigration compliance KPIs & dashboard

**Status:** Partial
**Covers:** 7.14
**Acceptance criteria count:** 5 · **Task count:** 4

**Existing implementation evidence**

- apps/web/src/app/dashboard/mobility/visa-immigration/page.tsx
- apps/web/src/app/api/v1/visa-permits/[id]/renewals/route.ts
- apps/web/src/app/api/v1/visa-permits/[id]/route.ts
- apps/web/src/app/api/v1/visa-permits/expiring/route.ts
- apps/web/src/app/api/v1/visa-permits/renewals/[renewalId]/transition/route.ts
- apps/web/src/app/api/v1/visa-permits/route.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; verify query-backed dashboard/reporting.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-07-S13 — Immigration risk matrix & red-flag register

**Status:** Partial
**Covers:** 7.15
**Acceptance criteria count:** 5 · **Task count:** 5

**Existing implementation evidence**

- apps/web/src/app/dashboard/mobility/visa-immigration/page.tsx
- apps/web/src/app/api/v1/visa-permits/[id]/renewals/route.ts
- apps/web/src/app/api/v1/visa-permits/[id]/route.ts
- apps/web/src/app/api/v1/visa-permits/expiring/route.ts
- apps/web/src/app/api/v1/visa-permits/renewals/[renewalId]/transition/route.ts
- apps/web/src/app/api/v1/visa-permits/route.ts

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; verify evidence capture, retention, and immutable audit.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-07-S14 — Immigration workflow design & PRO orchestration

**Status:** Partial
**Covers:** 7.16
**Acceptance criteria count:** 5 · **Task count:** 6

**Existing implementation evidence**

- apps/web/src/app/(modules)/workflow-engine/approval-chains/page.tsx
- apps/web/src/app/api/attendance/approval-workflow/route.ts
- apps/web/src/app/dashboard/admin/workflows/approvals/page.tsx
- apps/web/src/app/dashboard/attendance/approval-workflow/page.tsx
- apps/web/src/app/dashboard/finance/budget/approval-workflow/page.tsx
- apps/web/src/app/dashboard/policy-mgmt/approval-workflow/page.tsx

**Planning / prior analysis evidence**

- None found.

**Gap to close:** confirm/add tenant-scoped schema or config; add/wire service logic; add tests; verify workflow approvals and audit events.

**Next verification:** Review the evidence files against this story’s acceptance criteria and run/author targeted tests before marking complete.

### EPIC-07-S15 — Sample Immigration Compliance Policy (configurable policy template)

**Status:** Partial
**Covers:** 7.17
**Acceptance criteria count:** 5 · **Task count:** 5

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
