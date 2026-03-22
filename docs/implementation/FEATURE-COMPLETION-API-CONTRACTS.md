# Feature Completion API Contracts

**Document Version**: 1.0  
**Last Updated**: March 22, 2026  
**Owner**: Platform Architecture Team  
**Status**: Planning Ready  
**Estimated Timeline**: 2 weeks  
**Priority**: High

---

## Quick Navigation

1. [Feature Completion Master Plan](./FEATURE-COMPLETION-MASTER-PLAN.md)
2. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)

## Overview

This document defines the contract alignment rules required to let web, mobile, and backend complete the feature-completion program against stable APIs.

---

## Objectives

1. Standardize API response shapes across critical domains.
2. Reduce web-mobile drift during feature completion.
3. Define required contracts for payroll, leave, attendance, recruitment, exports, audit, and employee history.
4. Create a contract-first basis for integration testing.

---

## Contract Design Rules

1. All responses must be tenant-scoped.
2. All errors must remain compatible with the platform's bilingual error model where applicable.
3. All list endpoints must support pagination, filtering, and sorting unless explicitly excluded.
4. All write endpoints must return enough state for UI rehydration without requiring redundant refetches where practical.
5. All enums must come from configuration or stable domain contracts, not hardcoded UI-only assumptions.

---

## Shared Response Patterns

### List Response

Required fields:
1. items
2. total
3. page
4. pageSize
5. hasNextPage

### Detail Response

Required fields:
1. id
2. domain payload
3. metadata where relevant
4. audit summary if required by admin workflows

### Mutation Response

Required fields:
1. success
2. updated resource or summary object
3. message and messageAr where the API layer requires it

---

## Required Contract Families

1. Employee and directory
2. Leave balances and requests
3. Attendance punches and daily summaries
4. Payroll runs, employee results, and payslips
5. Recruitment requisitions, candidates, interviews, and offers
6. Exports and report jobs
7. Audit search and resource history
8. Employee lifecycle timelines
9. Mobile priority screen payloads

---

## Versioning Rules

1. Avoid breaking changes during the program unless unavoidable.
2. Prefer additive changes.
3. Document every contract change in this file or linked guide.
4. Use integration tests to catch drift before merge.

---

## Validation Strategy

1. Define schema contracts for route handlers.
2. Mirror those schemas in typed frontend clients where possible.
3. Add integration tests to validate response shape and permission behavior.
4. Add mobile contract tests for priority flows.

---

## Change Control

Before changing any critical contract:
1. Confirm all consumers
2. Update schema definitions
3. Update tests
4. Update this document if the change affects shared expectations
5. Coordinate rollout order across web and mobile

---

## Success Criteria

1. Web and mobile consume aligned payloads for priority workflows.
2. Contract drift is caught by automated tests.
3. Feature-completion workstreams can progress without ad hoc API redesigns.

---

## Related Guides

1. [FEATURE-COMPLETION-MASTER-PLAN.md](./FEATURE-COMPLETION-MASTER-PLAN.md)
2. [GUIDE-CORE-SERVICE-COMPLETION.md](./GUIDE-CORE-SERVICE-COMPLETION.md)
3. [GUIDE-MOBILE-INTEGRATION-COMPLETION.md](./GUIDE-MOBILE-INTEGRATION-COMPLETION.md)
4. [FEATURE-COMPLETION-TRACKER.md](./FEATURE-COMPLETION-TRACKER.md)

---

## Footer Navigation

1. [Feature Completion Master Plan](./FEATURE-COMPLETION-MASTER-PLAN.md)
2. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
3. [Feature Completion Executive Summary](../reports/feature-completion-executive-summary.md)