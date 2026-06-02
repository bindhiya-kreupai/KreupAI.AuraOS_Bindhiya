# Test Coverage Handoff Plan — #49

**Owner**: Copilot (per CLAUDE.md, Claude does NOT implement large-volume tests)
**Scope**: Establish minimum test coverage for core service domains
**Target**: 70% line coverage, 60% branch coverage, platform-wide
**Audit reference**: Issue #49 (finding H11)

---

## Current state (2026-06-02, measured)

```
Existing test files: 27 across 12 domains
Passing: 11 files / 427 tests
Failing: 16 files / 44 tests (drift with @ts-nocheck'd services)
```

Coverage thresholds are now enforced **per-domain** via `apps/web/vitest.config.mts`. The per-domain floors are the **commitment line** — each domain rises as Copilot delivers a handoff packet.

| Domain | Lines today | Funcs today | Floor in CI | Target |
|---|---|---|---|---|
| `audit/` | **87%** | **88%** | 85% | 90% |
| `services/organization/` | **98%** | **100%** | 90% | 95% |
| `services/payroll/` | **71%** | **82%** | 65% | 80% |
| `services/recruitment/` | **56%** | **59%** | 50% | 70% |
| `services/compliance/` | **30%** | **29%** | 25% | 70% |
| `services/employment-history.service.ts` | 5% | 100% | — | 70% |
| `services/employee/` | 2% | 0% | — | 70% |
| `services/leave/` | 0% | 0% | — | 70% |
| `services/attendance/` | 0% | 0% | — | 70% |
| `services/analytics/` | 0% | 0% | — | 70% |
| `services/reporting/` | 0% | 0% | — | 70% |
| `services/document/` | 0% | 0% | — | 70% |
| `services/dashboard/` | 0% | 0% | — | 70% |
| `services/ess/` | 0% | 0% | — | 70% |
| `services/ai/` | 0% | 0% | — | 70% |
| `services/agentic-ai/` | 0% | 0% | — | 70% |
| `services/integrations/` | 0% | 0% | — | 70% |
| `services/industry/` | 0% | 0% | — | 70% |
| `services/i18n/` | 0% | 0% | — | 70% |
| `services/engagement/` | 0% | 0% | — | 70% |
| `services/enterprise/` | 0% | 0% | — | 70% |
| `services/india-statutory/` | 0% | 0% | — | 70% |
| Loose service files (`notification.service.ts`, `master-data.service.ts`, `id-card.service.ts`, `confirmation.service.ts`, `letter.service.ts`, `life-event.service.ts`, `exit.service.ts`, `probation.service.ts`, `license.service.ts`) | 0% | 0% | — | 70% |

**Note**: domains with 0% coverage do NOT have a CI floor yet — adding a floor for a domain that has no tests would fail CI. As soon as the first test lands for a domain, add the glob to `vitest.config.mts` `thresholds` (with the measured floor minus 5% for headroom).

---

## Per-domain handoff packets

Sized so each packet is **~1 week of Copilot work** including read, plan, write, fix.

### Packet 1 — Payroll (HIGHEST PRIORITY)

**Why first**: money + multi-country compliance (KSA GOSI, India IT, UAE WPS).

**Existing tests**: payroll.service.test.ts, salary-components.test.ts, payslip-pdf.service.test.ts, tax.service.test.ts (4 files, ~50 tests; 6 failing).

**Tasks**:
1. Fix the 6 failing tests in `payroll/__tests__/payroll.service.test.ts` and `salary-components.test.ts` (KSA GOSI for non-Saudi, India HRA exemption, basic salary pro-ration, percentage-based components).
2. Add unit tests for:
   - `payroll.service.ts` — `calculatePayrollRun`, `generatePayslips`, `approvePayrollRun`, `cancelPayrollRun`, status transitions (DRAFT→CALCULATED→APPROVED→PAID).
   - `bank-file.service.ts` — WPS SIF format for UAE, MoHRE submission state.
   - `garnishment.service.ts` — court-order priority, max-deduction caps.
   - `arrears.service.ts` — retroactive recalculation across closed periods.
   - `tax-calculation.service.ts` — India FY transitions, KSA Zakat, slab edge cases.
3. Cross-tenant bleed: every payrollRun query must include `tenantId`. Add a test that proves a second-tenant context cannot read tenant-A payroll runs.
4. Workflow happy-path: full `DRAFT → CALCULATED → APPROVED → PAID` flow with audit log assertions.
5. Negative paths: insufficient permissions, locked period, mismatched currency.

**Coverage target after packet**: 50%
**Floor in vitest.config (raise to)**: `lines: 50, functions: 50, branches: 40`

### Packet 2 — Attendance

**Why second**: time + GPS fraud + WPS feeds (downstream of payroll).

**Existing tests**: attendance.service.test.ts, shift-management.service.test.ts (2 files, ~40 tests; 4 failing).

**Tasks**:
1. Fix the 4 failing tests.
2. Add unit tests for:
   - `gps-geofence.service.ts` — Haversine distance, polygon hit, spoofing detection.
   - `roster-management.service.ts` — auto-generation, swap requests, conflict detection.
   - `regularization.service.ts` — request states, approval delegation.
   - `time-tracking.service.ts` — punch in/out, late mark calculation.
   - `overtime.service.ts` — OT caps by country, multiplier rules.
3. Cross-tenant bleed: attendance records, roster, regularization requests.
4. Integration test: GPS punch → fraud detection → manager approval → payroll feed.

**Coverage target**: 50% / Floor raise to 45%

### Packet 3 — Leave

**Why**: accrual correctness, carry-forward.

**Existing**: leave.service.test.ts, leave-accrual.service.test.ts (2 files, ~30 tests; 2 failing).

**Tasks**:
1. Fix 2 failing tests.
2. Unit coverage for `leave-encashment.service.ts`, `holiday-calendar.service.ts`, `comp-off.service.ts`, `policy.service.ts` (probation rules, sandwich-leave handling).
3. Cross-tenant bleed: leave types, leave balances, holiday calendars.
4. Integration: apply → approve → balance deduct → carry-forward year-end.

**Coverage target**: 60% / Floor raise to 50%

### Packet 4 — Recruitment

**Why**: PII handling + offer state.

**Existing**: resume-parser.service.test.ts (1 file, ~15 tests; 2 failing).

**Tasks**:
1. Fix 2 failing resume-parser tests.
2. Unit coverage for `career-portal.service.ts`, `interview-scheduler.service.ts`, `job-board-integration.service.ts`, `offer.service.ts` (offer letter generation, joining-bonus rules).
3. Cross-tenant bleed: candidates, jobs, applications.
4. PII test: verify resume parser scrubs SSN/NINumber from logs and audit trails.

**Coverage target**: 40% / Floor raise to 30%

### Packet 5 — Employee

**Why**: lifecycle history + change events.

**Existing**: employee.service.test.ts (1 file, ~15 tests; 1 failing).

**Tasks**:
1. Fix 1 failing test.
2. Unit coverage for `employment-history.service.ts` (already has a test file), `life-event.service.ts`, `exit.service.ts`, `confirmation.service.ts`, `probation.service.ts`.
3. Cross-tenant bleed: employee records, employment history, documents.
4. Integration: hire → confirm → promote → exit timeline.

**Coverage target**: 50% / Floor raise to 40%

### Subsequent packets (next quarter)

- Packet 6: `compliance/` — raise to 70% (already at ~30% floor)
- Packet 7: `analytics/`, `reporting/` — measure executive dashboards
- Packet 8: `ai/`, `agentic-ai/` — mock LLM responses; mostly contract tests
- Packet 9: `ess/`, `i18n/` — fixture-driven
- Packet 10: `integrations/`, `industry/` — contract tests against connector stubs

---

## Ratchet workflow

For each packet:

1. Write the tests, get them passing.
2. Run `pnpm exec vitest run --coverage` and read the per-domain numbers.
3. Edit `apps/web/vitest.config.mts` and **raise the floor** for that domain to the new value.
4. Commit both in the same PR. CI rejects any future drop below the new floor.

**Never lower a floor** without explicit justification in the PR body (a failing test in main is a separate issue, not a reason to lower coverage gates).

---

## CI integration

Already wired. The `lint` job in `.github/workflows/ci.yml` runs `pnpm type-check` (via the typecheck ratchet, #29z). Coverage runs via the unit-tests job — when the per-domain thresholds in vitest.config are raised, CI starts enforcing them.

For a fast iteration loop locally:

```bash
# Single domain
pnpm --filter web exec vitest run src/lib/services/payroll --coverage

# All currently-covered domains  
pnpm --filter web exec vitest run src/lib/services --coverage
```

---

## Acceptance criteria for closing #49

- [ ] Each of the top-5 priority domains has ≥30% line coverage (4 are at floor; payroll at 25 needs to hit 30)
- [ ] Cross-tenant bleed tests exist for every priority domain
- [ ] Coverage trend is visible (already wired via Codecov action in `pr-checks.yml`)
- [ ] At least one happy-path integration test per domain (DRAFT → ... → DONE workflow)

When the above are met, #49 closes. Subsequent packets (raising to 70%) tracked separately.
