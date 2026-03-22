# Core Service Completion Guide

**Document Version**: 1.0  
**Last Updated**: March 22, 2026  
**Owner**: Platform Engineering Team  
**Status**: Implementation Planning Ready  
**Estimated Timeline**: 4 weeks  
**Priority**: Critical

---

## Quick Navigation

1. [Feature Completion Master Plan](./FEATURE-COMPLETION-MASTER-PLAN.md)
2. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
3. [Feature Completion API Contracts](./FEATURE-COMPLETION-API-CONTRACTS.md)

## Overview

This guide closes the production-path gaps caused by mock-backed service implementations across critical HR modules.

### Objective

Replace mock-backed frontend and backend service logic with real, tenant-scoped API and database-backed implementations for business-critical modules.

### Current Evidence

Representative mock-backed or fallback-heavy service layers:
- [../../apps/web/src/services/attendanceService.ts](../../apps/web/src/services/attendanceService.ts)
- [../../apps/web/src/services/approvalService.ts](../../apps/web/src/services/approvalService.ts)
- [../../apps/web/src/services/documentService.ts](../../apps/web/src/services/documentService.ts)
- [../../apps/web/src/services/recruitmentService.ts](../../apps/web/src/services/recruitmentService.ts)
- [../../apps/web/src/services/benefitsService.ts](../../apps/web/src/services/benefitsService.ts)

---

## Scope

### In Scope

1. Employee-facing and manager-facing business-critical services
2. Frontend service replacements where production logic still uses mock datasets
3. Backend service completion for CRUD and transactional workflows
4. Shared DTO normalization for web and mobile

### Priority Modules

1. Employee
2. Directory
3. Approvals
4. Documents
5. Benefits
6. Attendance
7. Recruitment
8. Reporting support services

---

## Completion Strategy

### Step 1: Inventory and Classify

For each service:
1. Determine whether it is production-path or prototype-only
2. Identify mocked reads, mocked writes, and fallback branches
3. Classify data source as Prisma-backed, service-backed, external integration-backed, or mock-backed

### Step 2: Define Authoritative Endpoints

For each module:
1. List required APIs for list, detail, create, update, delete, and state transitions
2. Normalize response shape for both web and mobile
3. Confirm permission rules and tenant filters
4. Define search, pagination, and filtering requirements

### Step 3: Replace Read Paths

1. Replace static arrays and mocked service methods with API-backed fetches
2. Add loading, error, empty, and permission-denied states
3. Remove implicit mock fallback from production screens

### Step 4: Replace Write Paths

1. Route write operations through service layer APIs
2. Persist all state changes to the database
3. Emit audit events on critical writes
4. Validate authorization and tenant boundaries

### Step 5: Remove Fallback Logic

1. Remove mock data branches from completed modules
2. Keep explicit development fixtures only in tests and controlled preview contexts
3. Enforce release gate checks against mock usage in production paths

---

## Week-by-Week Plan

### Week 1: Inventory and Contracts

Deliverables:
1. Complete service inventory
2. Module prioritization
3. Shared DTO definitions
4. API completion matrix

### Week 2: Read Path Completion

Deliverables:
1. Employee, directory, and approvals read paths completed
2. Document and benefits read path completion
3. Frontend service replacements in critical screens

### Week 3: Write Path Completion

Deliverables:
1. Employee and profile updates persisted
2. Approval actions persisted
3. Document metadata actions persisted
4. Audit events added to write flows

### Week 4: Hardening

Deliverables:
1. Remove mock fallbacks
2. Add tests
3. Run regression on affected flows
4. Validate mobile dependency readiness

---

## Architecture Rules

1. Use the existing service layer under the web application for business logic when staying in the monolith path.
2. Use protected route wrappers consistent with surrounding code.
3. Keep validation in Zod schemas where already established.
4. Keep service responses typed and predictable.
5. Never bypass tenant filtering.

---

## Required Deliverables

1. Service inventory and readiness matrix
2. Updated API contract documentation
3. Completed read and write flows for priority modules
4. Mock removal report
5. Test coverage report

---

## Testing Strategy

### Unit Tests
1. Service functions
2. DTO mappers
3. Validation logic
4. Permission gates

### Integration Tests
1. Route-to-service-to-database persistence
2. Tenant isolation
3. Permission enforcement
4. Audit emission

### End-to-End Tests
1. Employee update journey
2. Document list and detail journey
3. Approval action journey
4. Directory search journey

---

## Success Criteria

1. No production-path critical module returns static mock data.
2. CRUD and workflow operations persist correctly.
3. Web and mobile consumers use shared contract shapes.
4. Audit events exist for critical writes.
5. Regression test suite passes for all completed modules.

---

## Risks

1. Hidden fallback logic inside service wrappers
2. Inconsistent DTOs between web and mobile
3. Missing indexes or slow queries for list endpoints

### Mitigations

1. Enforce service inventory burn-down
2. Add API contract tests
3. Profile list queries before rollout

---

## Exit Gate

This guide is complete when:
1. Priority modules are API-backed
2. No critical production path depends on mock data
3. Tests and QA sign-off are complete

---

## Related Guides

1. [Feature Completion Master Plan](./FEATURE-COMPLETION-MASTER-PLAN.md)
2. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
3. [Feature Completion API Contracts](./FEATURE-COMPLETION-API-CONTRACTS.md)
4. [Payroll Engine Completion Guide](./GUIDE-PAYROLL-ENGINE-COMPLETION.md)