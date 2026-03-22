# Export & Reporting Completion — Claude Planning Document

**Document Version**: 1.0
**Last Updated**: March 22, 2026
**Owner**: Claude (Planning Agent)
**Status**: Planning Complete — Ready for Copilot Handoff
**Workstream**: Export & Reporting Completion (Week 14)
**Priority**: High

---

## Quick Navigation

1. [Feature Completion Master Plan](./FEATURE-COMPLETION-MASTER-PLAN.md)
2. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
3. [Export and Reporting Completion Guide](./GUIDE-EXPORT-REPORTING-COMPLETION.md)

---

## Executive Assessment

**Verdict: Strong infrastructure, weak data layer.** The async job pipeline (BullMQ worker + Redis + DistributedScheduler), Prisma models (ReportDefinition, ReportExecution, AnalyticsCache), and 15+ API routes all exist. The gap is concentrated in **4 TODO stubs**: mock data fetchers, Excel/PDF generators, and file upload to object storage.

### What Exists

| Layer | Count | Status |
|-------|-------|--------|
| Prisma models | 3 (ReportDefinition, ReportExecution, AnalyticsCache) | REAL |
| API routes | 15+ report/export endpoints | REAL — auth, validation, audit middleware |
| Async worker | BullMQ report generation worker (193 lines) | REAL — creates/updates ReportExecution in DB |
| Cron job | Daily report generation at 02:00 | REAL — distributed lock-safe |
| Export service | `export.service.ts` (458 lines) | PARTIAL — CSV/JSON work, Excel/PDF are TODO stubs |
| Report templates | 15+ definitions (HR, Payroll, Attendance, Compliance) | REAL — metadata only |
| Frontend report service | `reportGenerationService.ts` (867 lines) | MOCK fallback — mock history, mock schedules |
| Statutory reports | `statutory-report-service.ts` (521 lines) | MOCK data — UAE/KSA/India report generation returns hardcoded data |
| Dashboard pages | 14+ report/analytics pages | UI complete |
| Libraries | exceljs v4.4.0, pdfkit v0.14.0 | INSTALLED but not imported/used |

### What Needs Work

1. **Data fetchers** — `fetchEmployeeData()`, `fetchAttendanceData()`, `fetchPayrollData()` return mock arrays (100/500/100 rows). Must be replaced with Prisma queries.
2. **Excel generation** — `generateExcel()` returns JSON buffer with TODO comment. exceljs is installed but not imported.
3. **PDF generation** — `generatePDF()` returns JSON buffer with TODO comment. pdfkit is installed but not imported.
4. **File upload** — `uploadFile()` returns mock URL `https://storage.auraos.com/exports/{fileId}`. Must connect to S3/Azure/MinIO.
5. **Frontend service** — `reportGenerationService.ts` has `MOCK_HISTORY` (3 items) and `MOCK_SCHEDULED` (2 items) arrays.
6. **Frontend report service** — `reportService.ts` (105 lines) falls back to mock on API failure.

---

## Scope Confirmation

### In-Scope (Week 14)

1. Replace mock data fetchers with Prisma queries (employees, attendance, payroll, leave)
2. Integrate exceljs for real Excel workbook generation
3. Integrate pdfkit for real PDF document generation
4. Implement file upload to object storage (MinIO/S3 — whichever is configured)
5. Remove mock arrays from `reportGenerationService.ts`
6. Verify async job lifecycle (request → queue → generate → upload → status → download)
7. Verify export audit trail integration

### Deferred (Not Week 14)

1. Statutory report data wiring (depends on Payroll Engine, Weeks 9-11)
2. Advanced PDF formatting (branded payslips, letterheads)
3. Multi-sheet Excel with charts
4. Report scheduling UI refinement
5. Report access control (shared reports, team-level permissions)
6. Performance optimization for very large exports (100K+ rows)
7. Custom report builder query engine (drag-and-drop)

---

## Critical Findings

### Finding 1: Data Fetcher Stubs

`apps/web/src/lib/export/export.service.ts` contains three key stubs:

| Method | Current Behavior | Required |
|--------|-----------------|----------|
| `exportEmployees()` | Returns 100 mock employee objects | `prisma.employee.findMany({ where: { tenantId }, select: columns })` |
| `exportAttendance()` | Returns 500 mock attendance records | `prisma.attendanceRecord.findMany({ where: { tenantId, date range } })` |
| `exportPayroll()` | Returns 100 mock payroll records | `prisma.payrollRun.findMany({ where: { tenantId, period } })` |

These fetchers are called by the BullMQ worker, so fixing them immediately makes the entire async pipeline functional.

### Finding 2: Installed But Unused Libraries

```
exceljs: "^4.4.0"  — installed in package.json, NOT imported anywhere
pdfkit:  "^0.14.0"  — installed in package.json, NOT imported anywhere
```

The `generateExcel()` and `generatePDF()` methods contain TODO comments referencing these libraries but currently return `Buffer.from(JSON.stringify(data))` — a JSON buffer pretending to be Excel/PDF.

### Finding 3: Functional Async Pipeline

The BullMQ report generation worker is already **correctly wired to the database**:
1. Creates `ReportExecution` with status `RUNNING`
2. Executes generation
3. Updates to `COMPLETED` with `executionTime`, `filePath`, `fileSize`
4. Caches in `AnalyticsCache` (24h TTL)

This means fixing the data fetchers + file generators + upload makes the entire pipeline work end-to-end.

### Finding 4: CSV Generation Already Works

`generateCSV()` in export.service.ts is a real implementation — it builds proper CSV strings with headers and row data. Only Excel and PDF need implementation.

---

## File/Module Impact Map

### Must-Change Files

| File | Change | LOC Est. |
|------|--------|----------|
| `apps/web/src/lib/export/export.service.ts` | Replace mock fetchers with Prisma queries, implement generateExcel(), generatePDF(), uploadFile() | ~250 lines changed |
| `apps/web/src/services/reportGenerationService.ts` | Remove MOCK_HISTORY, MOCK_SCHEDULED, PREVIEW_DATA arrays; wire to real API | ~100 lines changed |
| `apps/web/src/services/reportService.ts` | Remove mock fallback in catch blocks | ~20 lines changed |

### Verify-Only Files

| File | Verify |
|------|--------|
| `services/analytics-service/src/reportGenerationWorker.ts` | Worker processes jobs and updates DB correctly |
| `services/analytics-service/src/reportService.ts` | Base report engine generates correct shapes |
| `services/scheduling-service/src/scheduler/cron-registry.ts` | Daily report job fires and creates executions |
| All `/api/v1/reports/*` routes | Endpoints return real data after fetcher fix |
| All `/api/v1/export/*` routes | Export flow works end-to-end |

### No-Change Files

| File | Reason |
|------|--------|
| `packages/@aura/database/prisma/schema.prisma` | Zero schema changes needed |
| All dashboard report pages (14+) | UI already complete |

---

## Acceptance Criteria

### AC-1: Authoritative Data Queries
Export fetchers query real Prisma models scoped by tenantId. Employee, attendance, payroll, and leave exports return persistent data, not mock arrays.

### AC-2: Real Excel Files
`generateExcel()` produces valid .xlsx files using exceljs with proper headers, data rows, and formatting.

### AC-3: Real PDF Files
`generatePDF()` produces valid .pdf files using pdfkit with structured content (tables, headers, metadata).

### AC-4: Object Storage Upload
`uploadFile()` writes generated files to configured object storage (MinIO/S3) and returns a signed/accessible download URL.

### AC-5: Async Job Lifecycle
A report request flows through: request → BullMQ queue → worker generates → uploads to storage → updates ReportExecution status to COMPLETED → download available.

### AC-6: Frontend Mock Removal
`reportGenerationService.ts` does not return MOCK_HISTORY or MOCK_SCHEDULED. All report history and schedules come from API.

### AC-7: Export Audit Trail
Every export request creates an audit entry with requester, entity type, record count, and timestamp.

---

## Test Strategy

### Unit Tests (6 tests)

| # | Test | Target |
|---|------|--------|
| U1 | CSV generation produces valid CSV with correct headers and row count | generateCSV() |
| U2 | Excel generation produces valid .xlsx buffer (parseable by exceljs) | generateExcel() |
| U3 | PDF generation produces valid PDF buffer (magic bytes %PDF-) | generatePDF() |
| U4 | Employee query builder includes tenantId and selected columns | exportEmployees() |
| U5 | Attendance query builder respects date range filters | exportAttendance() |
| U6 | Payroll query builder respects period filter | exportPayroll() |

### Integration Tests (5 tests)

| # | Test | Target |
|---|------|--------|
| I1 | Full async export: request → queue → generate → upload → download | End-to-end pipeline |
| I2 | Export request without permissions returns 403 | Permission check |
| I3 | Large export (1000+ rows) completes within timeout | Performance |
| I4 | Concurrent exports don't interfere with each other | Isolation |
| I5 | Export creates audit log entry with correct metadata | Audit integration |

### Performance Tests (3 tests)

| # | Test | Target |
|---|------|--------|
| P1 | Employee export with 5000 rows completes in <30s | Scalability |
| P2 | Attendance export for full month (10K records) produces correct file | Volume |
| P3 | Payroll export for 1000 employees generates valid Excel | Volume + format |

---

## Risks

| ID | Risk | Impact | Mitigation |
|----|------|--------|------------|
| ER-1 | Object storage not configured in environment | Upload fails, pipeline incomplete | Use MinIO for dev/staging; support S3 env vars for production |
| ER-2 | exceljs or pdfkit have breaking API changes since install | Generation fails | Pin exact versions; test with current installed versions |
| ER-3 | Large exports cause memory pressure | Worker OOM | Stream data in chunks; set BullMQ job timeout |
| ER-4 | Statutory report data depends on Payroll Engine (Weeks 9-11) | Statutory exports remain mock | Defer statutory report wiring; focus on core entity exports |
| ER-5 | Report cron job runs before data fetchers are fixed | Creates failed executions in DB | Deploy fetcher fix before next cron run |

---

## Copilot Handoff — Week 14

### Task 1: Replace Mock Data Fetchers with Prisma Queries
**File**: `apps/web/src/lib/export/export.service.ts`
**Action**: Replace `exportEmployees()`, `exportAttendance()`, `exportPayroll()` mock arrays with real Prisma queries. Each query must:
- Include `tenantId` in the where clause
- Accept filter parameters (date range, department, etc.)
- Use `select` to pick only requested columns
- Return data matching the existing column interface

### Task 2: Integrate exceljs for Excel Generation
**File**: `apps/web/src/lib/export/export.service.ts`
**Action**: Import exceljs. Replace the TODO stub in `generateExcel()` with:
```typescript
import ExcelJS from 'exceljs';
// Create workbook → add worksheet → set columns → addRows → writeBuffer
```
Produce valid .xlsx with headers, data rows, and auto-width columns.

### Task 3: Integrate pdfkit for PDF Generation
**File**: `apps/web/src/lib/export/export.service.ts`
**Action**: Import pdfkit. Replace the TODO stub in `generatePDF()` with:
```typescript
import PDFDocument from 'pdfkit';
// Create doc → add title → add table headers → add rows → end
```
Produce valid .pdf with title, timestamp, tabular data, and page numbers.

### Task 4: Implement File Upload to Object Storage
**File**: `apps/web/src/lib/export/export.service.ts`
**Action**: Replace mock `uploadFile()` with real S3/MinIO integration. Use the `@aws-sdk/client-s3` or MinIO client (check what's available in the project). Generate signed download URLs with expiry.

### Task 5: Remove Mock Data from Frontend Report Service
**File**: `apps/web/src/services/reportGenerationService.ts`
**Action**: Delete `MOCK_HISTORY`, `MOCK_SCHEDULED`, `PREVIEW_DATA` arrays. Wire `getReportHistory()` and `getScheduledReports()` to real API endpoints. Ensure error handling returns empty arrays on failure, not mock data.

### Task 6: Remove Mock Fallback from Report HTTP Service
**File**: `apps/web/src/services/reportService.ts`
**Action**: Remove catch blocks that return mock data. Replace with proper error propagation.

### Task 7: Verify Async Pipeline End-to-End
**Files**: `services/analytics-service/src/reportGenerationWorker.ts`, export.service.ts
**Action**: Manually test or write integration test: submit export request → verify BullMQ job created → verify worker picks up → verify file generated → verify ReportExecution updated to COMPLETED → verify download URL works.

### Task 8: Add Missing Entity Exporters
**File**: `apps/web/src/lib/export/export.service.ts`
**Action**: The service declares DEPARTMENTS, POSITIONS, LEAVE as supported entities but may not have dedicated export functions for all of them. Implement any missing entity-specific Prisma queries following the same pattern as employees/attendance/payroll.

### Task 9: Write Unit and Integration Tests
**Files**: New test files
**Action**: Implement the 6 unit tests and 5 integration tests from the Test Strategy section. Priority: U1-U3 (format validation), I1 (pipeline), I5 (audit).

---

## Architecture Notes

### Async Pipeline Flow

```
Client → POST /api/v1/export → export.service.requestExport()
  → BullMQ REPORT_GENERATION queue (priority 5, max 3 attempts)
  → reportGenerationWorker picks up job
  → Creates ReportExecution (RUNNING)
  → Calls entity-specific fetcher (Prisma query)
  → Calls format-specific generator (CSV/Excel/PDF)
  → Calls uploadFile() → object storage
  → Updates ReportExecution (COMPLETED, filePath, fileSize)
  → Caches in AnalyticsCache (24h TTL)
Client → GET /api/v1/export/[exportId] → returns status + download URL
```

This pipeline already works for CSV. Fixing Excel/PDF/upload makes it complete.

### Object Storage Decision

The project references MinIO, S3, and Azure Blob in various places. For Week 14:
- Use environment variable to select provider (e.g., `STORAGE_PROVIDER=minio|s3|azure`)
- Default to MinIO for development (already in prerequisites)
- S3-compatible API works for both MinIO and AWS S3

---

## Related Documents

1. [Feature Completion Master Plan](./FEATURE-COMPLETION-MASTER-PLAN.md)
2. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
3. [Export and Reporting Completion Guide](./GUIDE-EXPORT-REPORTING-COMPLETION.md)
4. [Audit and Compliance Completion Guide](./GUIDE-AUDIT-COMPLIANCE-COMPLETION.md)
