# Payroll Engine Completion Guide

**Document Version**: 1.0  
**Last Updated**: March 22, 2026  
**Owner**: Payroll Engineering Team  
**Status**: Implementation Planning Ready  
**Estimated Timeline**: 3 weeks  
**Priority**: Critical

---

## Quick Navigation

1. [Feature Completion Master Plan](./FEATURE-COMPLETION-MASTER-PLAN.md)
2. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
3. [Feature Completion API Contracts](./FEATURE-COMPLETION-API-CONTRACTS.md)

## Overview

This guide completes the payroll engine by replacing placeholder calculation logic with a deterministic, auditable, country-aware payroll pipeline.

### Current Evidence

Representative incomplete paths:
- [../../apps/web/src/lib/queue/jobs/payroll.job.ts](../../apps/web/src/lib/queue/jobs/payroll.job.ts)
- [../hr-gap-analysis/02-DETAILED-GAP-ANALYSIS.md](../hr-gap-analysis/02-DETAILED-GAP-ANALYSIS.md)

---

## Objective

Build a real payroll engine that:
1. Uses authoritative employee, attendance, leave, overtime, and compensation data
2. Persists employee-level calculation outputs
3. Supports statutory logic for initial release countries
4. Produces payslips, approval workflows, and reconciliation outputs

---

## Initial Country Scope

1. UAE
2. Saudi Arabia
3. India

Future countries must be added through strategy modules, not scattered conditional logic.

---

## Core Payroll Architecture

### Inputs

1. Employee profile
2. Salary structure
3. Recurring allowances and deductions
4. Attendance and overtime
5. Approved leave effects
6. One-time adjustments
7. Country configuration
8. Tax and statutory rules

### Processing Stages

1. Input validation
2. Base pay computation
3. Allowance computation
4. Overtime and attendance impact
5. Leave deductions or salary impact
6. Statutory deductions
7. Employer contribution computation
8. Net pay computation
9. Validation and rounding
10. Result persistence
11. Approval readiness
12. Payslip generation

---

## Week-by-Week Plan

### Week 1: Core Engine and Persistence

Deliverables:
1. Payroll run lifecycle model
2. Employee calculation persistence
3. Input assembler
4. Deterministic calculation pipeline
5. Draft and calculated run states

### Week 2: Statutory Logic and Payslips

Deliverables:
1. UAE rules
2. KSA rules
3. Payslip rendering pipeline
4. Payroll approval workflow
5. Payroll audit integration

### Week 3: India Logic and Hardening

Deliverables:
1. India rules
2. Reconciliation reports
3. Fixture validation suite
4. Error handling and retry controls
5. Release readiness sign-off

---

## Domain Model Requirements

### Payroll Run

Required fields:
1. Tenant and company context
2. Period
3. Run status
4. Totals
5. Approval metadata
6. Error summary
7. Creation and completion timestamps

### Employee Payroll Result

Required fields:
1. Employee identifier
2. Input snapshot reference
3. Earnings breakdown
4. Deductions breakdown
5. Employer contributions
6. Net pay
7. Calculation notes or trace
8. Currency
9. Status

### Payslip

Required fields:
1. Employee and employer metadata
2. Period
3. Earnings and deductions
4. Net pay
5. Payment method
6. Compliance notes
7. Generated file reference

---

## Country-Specific Modules

### UAE

Required capabilities:
1. Housing and transport allowance support
2. Overtime rates
3. End-of-service alignment support where applicable
4. WPS-ready output preparation

### KSA

Required capabilities:
1. GOSI calculations
2. Saudization-related configuration hooks if needed
3. Mudad or WPS-aligned output preparation
4. Local compliance validations

### India

Required capabilities:
1. PF
2. ESI
3. Professional Tax
4. TDS
5. Form generation support boundary for future rollout

---

## Quality Rules

1. Use decimal-safe arithmetic only.
2. Never compute from UI-supplied amounts if authoritative data exists in storage.
3. Preserve a calculation trace for support and auditability.
4. Require approval states before finalization.
5. Lock finalized payroll runs against uncontrolled mutation.

---

## Testing Strategy

### Unit Tests
1. Calculation engine stages
2. Country rule modules
3. Rounding and precision behavior
4. Error cases

### Integration Tests
1. Payroll run creation
2. Employee result persistence
3. Payslip generation
4. Approval transitions
5. Audit logging

### Validation Fixtures
1. UAE fixture set
2. KSA fixture set
3. India fixture set
4. Edge cases for overtime, unpaid leave, and one-time adjustments

---

## Reconciliation Requirements

Each payroll run must produce:
1. Employee-level reconciliation
2. Aggregate reconciliation
3. Earnings and deductions summaries
4. Statutory output summaries
5. Exception list for failed calculations

---

## Success Criteria

1. Payroll runs no longer rely on mock employee data.
2. Employee calculations are stored and reproducible.
3. Supported country rules are validated by fixtures.
4. Payslips are generated from persisted payroll results.
5. Approval, audit, and reconciliation flows are operational.

---

## Exit Gate

This guide is complete when:
1. UAE, KSA, and India baseline payroll are operational
2. No payroll production path uses placeholder calculation logic
3. Payroll runs, approvals, and payslips pass full validation

---

## Related Guides

1. [Feature Completion Master Plan](./FEATURE-COMPLETION-MASTER-PLAN.md)
2. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
3. [Leave Engine Completion Guide](./GUIDE-LEAVE-ENGINE-COMPLETION.md)
4. [Attendance Completion Guide](./GUIDE-ATTENDANCE-COMPLETION.md)