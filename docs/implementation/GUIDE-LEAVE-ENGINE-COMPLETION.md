# Leave Engine Completion Guide

**Document Version**: 1.0  
**Last Updated**: March 22, 2026  
**Owner**: HR Platform Team  
**Status**: Implementation Planning Ready  
**Estimated Timeline**: 2 weeks  
**Priority**: Critical

---

## Quick Navigation

1. [Feature Completion Master Plan](./FEATURE-COMPLETION-MASTER-PLAN.md)
2. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
3. [Feature Completion API Contracts](./FEATURE-COMPLETION-API-CONTRACTS.md)

## Overview

This guide completes the leave engine by connecting accrual, carry-forward, encashment, and balance deductions to durable data models.

### Current Evidence

Representative incomplete path:
- [../../apps/web/src/lib/services/leave/leave-accrual.service.ts](../../apps/web/src/lib/services/leave/leave-accrual.service.ts)

Related analysis:
- [../hr-gap-analysis/02-DETAILED-GAP-ANALYSIS.md](../hr-gap-analysis/02-DETAILED-GAP-ANALYSIS.md)

---

## Objective

Make leave balance behavior deterministic and policy-driven through an authoritative ledger and processing jobs.

---

## Functional Scope

1. Leave policy model normalization
2. Monthly accrual processing
3. Leave balance ledger
4. Carry-forward and expiry
5. Encashment
6. Negative balance policy support where allowed
7. Balance deductions on approved leave
8. Reversal logic on cancellation or rejection
9. Country and policy-specific rules

---

## Target Data Model

### Leave Policy

Required concepts:
1. Leave type
2. Accrual frequency
3. Eligibility rules
4. Carry-forward rules
5. Expiry rules
6. Encashment rules
7. Negative balance rules
8. Country overrides

### Leave Balance Ledger

Required transaction types:
1. Opening balance
2. Accrual
3. Carry-forward
4. Encashment
5. Approved leave deduction
6. Reversal
7. Admin adjustment
8. Expiry or lapse

### Derived Balance

Balances should be derived from transactions, not maintained only as mutable counters.

---

## Week-by-Week Plan

### Week 1: Policy and Ledger Foundation

Deliverables:
1. Final policy model
2. Ledger schema
3. Balance derivation logic
4. Employee policy resolution
5. Accrual calculation engine

### Week 2: Transactional Workflows

Deliverables:
1. Monthly accrual job
2. Carry-forward processor
3. Approval-linked deductions
4. Reversal logic
5. Reconciliation tools
6. QA fixture suite

---

## Processing Rules

### Accrual

1. Evaluate employee eligibility
2. Resolve the correct leave policy
3. Compute accrual amount
4. Post ledger transaction
5. Store processing metadata and date

### Leave Request Approval

1. Validate policy and available balance
2. Reserve or deduct balance based on workflow design
3. Post deduction transaction on approval
4. Reverse balance on cancellation or rejection where needed
5. Emit audit events

### Year-End Carry-Forward

1. Calculate unused eligible balance
2. Apply max carry-forward limits
3. Post carry-forward and expiry transactions
4. Create visibility into the next year balance state

---

## Policy Edge Cases

1. Probation restrictions
2. Country-specific maternity and special leave
3. Partial-day leave
4. Negative balance with payroll deduction
5. Sandwich rules where configured
6. Medical document requirements
7. Leave encashment on exit

---

## Testing Strategy

### Unit Tests
1. Policy resolution
2. Accrual calculation
3. Carry-forward logic
4. Deduction and reversal rules

### Integration Tests
1. Approval to balance deduction
2. Cancellation to reversal
3. Year-end carry-forward execution
4. Multi-tenant policy isolation

### Reconciliation Tests
1. Balance rebuilt from ledger equals exposed balance
2. Accrual and deduction sequences are deterministic
3. Historical policy changes do not corrupt previous results

---

## Success Criteria

1. Leave balances are derived from stored transactions.
2. Accrual runs persist durable ledger entries.
3. Approved leave requests affect balances correctly.
4. Carry-forward and expiry are automated.
5. Reconciliation can rebuild a user balance from history.

---

## Exit Gate

This guide is complete when:
1. Leave balances are authoritative and reproducible
2. No leave accrual production path returns stubbed values
3. Approval and cancellation workflows are fully integrated with balance updates

---

## Related Guides

1. [Feature Completion Master Plan](./FEATURE-COMPLETION-MASTER-PLAN.md)
2. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
3. [Attendance Completion Guide](./GUIDE-ATTENDANCE-COMPLETION.md)
4. [Payroll Engine Completion Guide](./GUIDE-PAYROLL-ENGINE-COMPLETION.md)