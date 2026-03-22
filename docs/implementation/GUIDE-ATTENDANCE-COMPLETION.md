# Attendance Completion Guide

**Document Version**: 1.0  
**Last Updated**: March 22, 2026  
**Owner**: Workforce Engineering Team  
**Status**: Implementation Planning Ready  
**Estimated Timeline**: 2 weeks  
**Priority**: High

---

## Quick Navigation

1. [Feature Completion Master Plan](./FEATURE-COMPLETION-MASTER-PLAN.md)
2. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
3. [Feature Completion API Contracts](./FEATURE-COMPLETION-API-CONTRACTS.md)

## Overview

This guide completes attendance by replacing mock attendance logic with persisted punches, daily calculations, regularization workflows, biometric ingestion, and transactional shift-swaps.

### Current Evidence

Representative incomplete paths:
- [../../apps/web/src/services/attendanceService.ts](../../apps/web/src/services/attendanceService.ts)
- [../../apps/web/src/services/biometricService.ts](../../apps/web/src/services/biometricService.ts)
- [../../apps/web/src/lib/services/shift-management.service.ts](../../apps/web/src/lib/services/shift-management.service.ts)

---

## Objective

Deliver a reliable attendance platform that can support web, mobile, biometric, and manager workflows.

---

## Functional Scope

1. Punch persistence
2. Daily attendance calculation
3. Regularization requests and approvals
4. Overtime computation
5. Biometric ingestion
6. Geo-validation support where applicable
7. Shift swap completion
8. Attendance anomalies and summaries

---

## Target Architecture

### Data Inputs

1. Employee
2. Shift assignment
3. Punch events
4. Approved regularization requests
5. Biometric device data
6. Holiday and leave status

### Derived Outputs

1. Daily attendance record
2. Overtime totals
3. Anomaly records
4. Team attendance summary
5. Attendance history views

---

## Week-by-Week Plan

### Week 1: Attendance Core

Deliverables:
1. Punch persistence model
2. Clock-in and clock-out API
3. Daily attendance processor
4. Regularization workflow
5. Attendance summary endpoints

### Week 2: Advanced Completion

Deliverables:
1. Biometric ingestion flow
2. Overtime computation
3. Shift swap roster transaction
4. Anomaly detection
5. QA verification

---

## Core Workflows

### Punch Capture

1. Receive clock event
2. Validate employee and tenant
3. Validate input method
4. Persist punch
5. Trigger daily attendance recalculation

### Daily Attendance Calculation

1. Group punches by employee and day
2. Resolve assigned shift
3. Determine first valid in and last valid out
4. Compute net hours and overtime
5. Detect lateness, missing punch, or short hours
6. Persist daily attendance result

### Regularization

1. Employee submits correction request
2. Manager reviews request
3. Approved changes update daily attendance
4. Audit event captures original and corrected values

### Shift Swap

1. Validate both employees and assignments
2. Enforce peer and manager approvals
3. Update roster assignments transactionally
4. Mark swap request complete only after roster change succeeds

---

## Biometric Ingestion Design

1. Device event intake endpoint
2. Device-to-employee mapping
3. Deduplication rules
4. Retry-safe ingestion
5. Reconciliation for missed or delayed events

---

## Testing Strategy

### Unit Tests
1. Punch parsing
2. Daily attendance calculations
3. Overtime logic
4. Shift swap validation rules

### Integration Tests
1. Clock-in and clock-out persistence
2. Regularization approval flow
3. Biometric event ingestion
4. Shift swap transaction success and failure

### Operational Tests
1. Duplicate device events
2. Missing punch scenarios
3. Delayed biometric submissions
4. High-volume punch load

---

## Success Criteria

1. Attendance derives from persisted punch data.
2. Shift swaps update roster data, not only request status.
3. Regularization modifies authoritative attendance records.
4. Biometric input is ingested and reconciled.
5. Team summaries and anomalies are generated from real attendance data.

---

## Exit Gate

This guide is complete when:
1. No attendance production path depends on mock arrays
2. Shift swap completion updates roster assignments
3. Daily attendance, overtime, and anomalies are operational

---

## Related Guides

1. [Feature Completion Master Plan](./FEATURE-COMPLETION-MASTER-PLAN.md)
2. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
3. [Leave Engine Completion Guide](./GUIDE-LEAVE-ENGINE-COMPLETION.md)
4. [Payroll Engine Completion Guide](./GUIDE-PAYROLL-ENGINE-COMPLETION.md)