# Gap Analysis: EPIC-35: Compliance Calendar & Scheduling Automation

> Source epic: [EPIC-35-compliance-calendar-scheduling-automation.md](./EPIC-35-compliance-calendar-scheduling-automation.md)
> Module: platform
> Generated: 2026-06-16 · Updated: 2026-06-17 (gap closure batch)

## Summary

- Stories assessed: 10
- Implemented (pending migration / operational verification): 10

## Closure Batch — 2026-06-17

**Schema**: `20260618000000_add_compliance_calendar` — `aura_calendar_category`, `aura_recurrence_rule`, `aura_compliance_task`, `aura_holiday_calendar`, `aura_audit_plan`, `aura_audit_sample`, `aura_audit_test_result`, `aura_audit_finding`, `aura_corrective_action`, `aura_management_review`, `aura_calendar_certificate`.

**Services**: `apps/web/src/lib/services/compliance-calendar/*`

- `calendar.service.ts` — categories, recurrence rules, holiday calendar, `resolveDueDate()` with weekend + holiday shift, idempotent `generateTasks()`, complete/defer/escalate, `rederiveFutureTasks()` for automation
- `audit-plan.service.ts` — plan create/approve, RANDOM/RISK_BASED/STRATIFIED sampling, test results, findings, corrective actions with overdue escalation, management reviews
- `calendar-certificate.service.ts` — monthly dashboard + certificate generate/sign with critical-overdue gating
- `seeds.ts` — 10 category seeds + 15 recurrence-rule seeds covering payroll/WPS for all 6 GCC countries, social insurance filings, Emiratisation/Nitaqat checkpoints, file audits, HSE drills

**API**: `/api/v1/compliance-calendar/{tasks,rules,categories,holidays,audit-plan,findings,certificate,dashboard}`.

**Dashboard**: `/dashboard/compliance-calendar/` landing + `tasks`, `rules`, `audit`, `certificate` workspaces.

**Tests**: `apps/web/src/lib/services/__tests__/compliance-calendar.service.test.ts` — 14 unit tests passing.

## Storywise Gaps

### EPIC-35-S01 — Calendar objectives, governance & categories

**Status:** Implemented - pending migration
`CalendarCategory` with owner role + default cadence; 10 default categories seeded.

### EPIC-35-S02 — Recurring task scheduler (monthly/quarterly/annual)

**Status:** Implemented
`RecurrenceRule` + `ComplianceTask` + `generateTasks()` with idempotent unique-constraint behaviour. `resolveDueDate()` shifts on weekend (FRI/SAT/SUN treated as non-working) and holiday with `PREVIOUS_BUSINESS_DAY` policy.

### EPIC-35-S03 — Payroll & social-insurance filing calendars

**Status:** Implemented
Seeded `PAYROLL_CUTOFF_AE`, `WPS_SUBMIT_{AE,SA,BH,QA,OM,KW}`, `GPSSA_FILING_AE`, `GOSI_FILING_SA`, `SIO_FILING_BH`.

### EPIC-35-S04 — Visa/permit renewal & nationalization checkpoint calendars

**Status:** Implemented
Visa/permit renewals are alert-driven via `PlatformAlertService` (EPIC-01-S04). Nationalization checkpoints seeded: `EMIRATISATION_MIDYEAR_AE`, `EMIRATISATION_YEAREND_AE`, `NITAQAT_QUARTERLY_SA`.

### EPIC-35-S05 — Ramadan/holiday & insurance/benefits renewal calendars

**Status:** Implemented - pending Ramadan-calendar data
`HolidayCalendar` with `isPublic` + `isRamadan` flags; holidays added via `POST /api/v1/compliance-calendar/holidays`. Renewal calendars surface via `BENEFITS` category and lead-day alerts on recurrence rules.

### EPIC-35-S06 — HSE/training, ER & document-audit calendars

**Status:** Implemented
Seeded `FIRE_DRILL_QUARTERLY`, `FILE_AUDIT_QUARTERLY`.

### EPIC-35-S07 — Annual audit plan, sampling & testing checklist

**Status:** Implemented
`AuditPlan` create + approve, `select()` supports RANDOM, RISK_BASED, STRATIFIED. `AuditSample` + `AuditTestResult` persisted.

### EPIC-35-S08 — Findings, corrective actions & management review schedule

**Status:** Implemented
`raiseFinding()` + `raiseCorrectiveAction()` with overdue escalation (`escalateOverdueActions()`). `ManagementReview` per period with `openActionsAtTime` snapshot.

### EPIC-35-S09 — Compliance calendar automation

**Status:** Implemented - pending scheduler wiring
`generateTasks()` rolls forward N months idempotently. `escalateOverdue()` flips past-due open tasks to OVERDUE with escalation role. `rederiveFutureTasks()` recomputes due dates when holidays/rules change. Wire all three into the existing job runner for full automation.

### EPIC-35-S10 — Calendar dashboard & monthly certificate

**Status:** Implemented
`calendarCertificateService.dashboard()` returns on-time %, overdue, critical-overdue, by-category breakdown. `generate()` sets `gatingReason` when critical overdue > 0; `sign()` refuses while gated.

## Next verification

- Apply `20260618000000_add_compliance_calendar`.
- Targeted tests: `pnpm --filter web test:run src/lib/services/__tests__/compliance-calendar.service.test.ts` (14 passing, 2026-06-17).
- Type-check clean for `apps/web/src/lib/services/compliance-calendar/**`.
