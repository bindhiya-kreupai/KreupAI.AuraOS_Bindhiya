# Export and Reporting Completion Guide

**Document Version**: 1.0  
**Last Updated**: March 22, 2026  
**Owner**: Platform Backend Team  
**Status**: Implementation Planning Ready  
**Estimated Timeline**: 1 week  
**Priority**: High

---

## Quick Navigation

1. [Feature Completion Master Plan](./FEATURE-COMPLETION-MASTER-PLAN.md)
2. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
3. [Feature Completion API Contracts](./FEATURE-COMPLETION-API-CONTRACTS.md)

## Overview

This guide completes export and reporting functionality by replacing placeholder generators and mock fetchers with query-backed outputs and real file delivery.

### Current Evidence

Representative incomplete paths:
- [../../apps/web/src/lib/export/export.service.ts](../../apps/web/src/lib/export/export.service.ts)
- [../../apps/web/src/lib/services/reporting/report.service.ts](../../apps/web/src/lib/services/reporting/report.service.ts)

---

## Objective

Enable authoritative, secure, auditable export and reporting for payroll, attendance, employee, and other core domains.

---

## Functional Scope

1. Query-backed exports
2. Report execution
3. Async processing for large jobs
4. CSV generation
5. Excel generation
6. PDF generation
7. Object storage delivery
8. Export history and permissions
9. Audit integration

---

## One-Week Plan

### Days 1-2: Query and Job Layer

Deliverables:
1. Replace mock fetchers with authoritative query builders
2. Define report parameter schemas
3. Add async job lifecycle for heavy reports

### Days 3-4: File Generation

Deliverables:
1. Real CSV and JSON generators
2. Real Excel generator
3. Real PDF generator
4. Error handling and retry flow

### Days 5-7: Delivery and Verification

Deliverables:
1. Object storage integration
2. Export metadata persistence
3. Download and permission checks
4. Audit logging
5. QA verification

---

## Required Architecture

### Export Request Lifecycle

1. Receive request
2. Validate permissions and tenant scope
3. Validate parameters
4. Build authoritative query
5. Execute synchronously or enqueue async job
6. Generate file
7. Upload to object storage
8. Persist metadata
9. Expose status and download endpoint
10. Emit audit event

---

## Format Support

### CSV
Use for:
1. Tabular exports
2. Large data sets
3. Simple interoperability

### Excel
Use for:
1. Business reporting
2. Multi-sheet reports
3. Formatted operational outputs

### PDF
Use for:
1. Human-readable formal documents
2. Payslips and formal reports
3. Auditor-ready views

---

## Security Rules

1. Export only tenant-scoped data
2. Validate user permissions per entity
3. Use signed or protected download access
4. Track requester, request time, and record count
5. Expire temporary download URLs where applicable

---

## Testing Strategy

### Unit Tests
1. Column selection
2. Format-specific generation
3. File metadata computation

### Integration Tests
1. Query-backed export execution
2. Async job completion
3. Upload and download flow
4. Permission failures

### Performance Tests
1. Large employee export
2. Attendance export for a full month
3. Payroll export for a high-volume tenant

---

## Success Criteria

1. Exports are built from authoritative queries.
2. Excel and PDF use production file generators.
3. Files are uploaded to real object storage.
4. Export history is persisted.
5. Export actions are auditable.

---

## Exit Gate

This guide is complete when:
1. No production export or report path uses mock data
2. Large jobs run asynchronously with visible status
3. Files are securely stored and retrievable

---

## Related Guides

1. [Feature Completion Master Plan](./FEATURE-COMPLETION-MASTER-PLAN.md)
2. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
3. [Audit and Compliance Completion Guide](./GUIDE-AUDIT-COMPLIANCE-COMPLETION.md)
4. [Recruitment Completion Guide](./GUIDE-RECRUITMENT-COMPLETION.md)