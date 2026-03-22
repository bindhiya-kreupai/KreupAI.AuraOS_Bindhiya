# Mobile Integration Completion Guide

**Document Version**: 1.0  
**Last Updated**: March 22, 2026  
**Owner**: Mobile Platform Team  
**Status**: Implementation Planning Ready  
**Estimated Timeline**: 2 weeks  
**Priority**: High

---

## Quick Navigation

1. [Feature Completion Master Plan](./FEATURE-COMPLETION-MASTER-PLAN.md)
2. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
3. [Feature Completion API Contracts](./FEATURE-COMPLETION-API-CONTRACTS.md)

## Overview

This guide replaces priority mobile mock screens with real, tenant-scoped API-backed flows.

### Current Evidence

Representative mock-backed screens:
- [../../apps/mobile/src/screens/Paystubs.tsx](../../apps/mobile/src/screens/Paystubs.tsx)
- [../../apps/mobile/src/screens/Directory.tsx](../../apps/mobile/src/screens/Directory.tsx)
- [../../apps/mobile/src/screens/Approvals.tsx](../../apps/mobile/src/screens/Approvals.tsx)
- [../../apps/mobile/src/screens/notifications/NotificationsScreen.tsx](../../apps/mobile/src/screens/notifications/NotificationsScreen.tsx)
- [../../apps/mobile/src/screens/performance/PerformanceScreen.tsx](../../apps/mobile/src/screens/performance/PerformanceScreen.tsx)

---

## Objective

Move the mobile app from prototype state to operational integration for priority employee workflows.

---

## Priority Flows

1. Authentication and session continuity
2. Paystubs
3. Directory
4. Approvals
5. Notifications
6. Performance summary
7. Attendance and leave where already available

---

## Week-by-Week Plan

### Week 1: Contracts and Core Screens

Deliverables:
1. Shared mobile API contract map
2. Token refresh and session handling
3. Paystubs integration
4. Directory integration
5. Approvals integration

### Week 2: Remaining Screens and Hardening

Deliverables:
1. Notifications integration
2. Performance integration
3. Error handling and retry patterns
4. Mobile QA suite
5. Crash and monitoring hooks

---

## Integration Rules

1. Reuse authoritative web APIs where feasible.
2. Do not create mobile-only business logic if the web backend already provides the workflow.
3. Keep response mapping minimal and stable.
4. Use secure token storage and refresh handling.
5. Remove hardcoded arrays from priority screens.

---

## Required API Contracts

### Authentication
1. Login
2. Refresh
3. Logout
4. Session expiry handling

### Employee Data
1. Profile summary
2. Directory search
3. Performance summary

### Workflow Data
1. Approvals list and action APIs
2. Notifications list and mark-read APIs
3. Paystubs list and detail APIs

---

## Error Handling Requirements

1. Distinguish auth failure from empty state
2. Support pull-to-refresh with real refetch
3. Show offline or network-retry states
4. Prevent silent fallback to static mock data
5. Log mobile API failures to monitoring

---

## QA Strategy

### Integration Tests
1. Login and refresh
2. Paystubs retrieval
3. Directory search
4. Approval action flow
5. Notification sync

### Manual Regression
1. Expired session behavior
2. Multi-tenant user visibility
3. Slow network handling
4. Empty-state correctness

### Release Validation
1. Verify screen-level parity against web APIs
2. Confirm no priority screen reads from hardcoded mock arrays
3. Confirm analytics and crash hooks are working

---

## Success Criteria

1. Priority mobile screens load real tenant-scoped data.
2. Mobile write actions persist through the same backend as web.
3. Sessions are handled safely with refresh support.
4. Mock screen arrays are removed from priority production paths.
5. QA passes for key employee journeys.

---

## Exit Gate

This guide is complete when:
1. Priority mobile screens are API-backed
2. Session handling is production-safe
3. Mobile regression passes for all priority flows

---

## Related Guides

1. [Feature Completion Master Plan](./FEATURE-COMPLETION-MASTER-PLAN.md)
2. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
3. [Feature Completion API Contracts](./FEATURE-COMPLETION-API-CONTRACTS.md)
4. [Feature Completion Executive Summary](../reports/feature-completion-executive-summary.md)