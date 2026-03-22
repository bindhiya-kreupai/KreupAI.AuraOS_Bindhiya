# Recruitment Completion Guide

**Document Version**: 1.0  
**Last Updated**: March 22, 2026  
**Owner**: Talent Engineering Team  
**Status**: Implementation Planning Ready  
**Estimated Timeline**: 2 weeks  
**Priority**: High

---

## Quick Navigation

1. [Feature Completion Master Plan](./FEATURE-COMPLETION-MASTER-PLAN.md)
2. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
3. [Feature Completion API Contracts](./FEATURE-COMPLETION-API-CONTRACTS.md)

## Overview

This guide completes the recruitment domain by replacing mock pipeline behavior with authoritative candidate, interview, offer, and analytics workflows.

### Current Evidence

Representative mock-backed path:
- [../../apps/web/src/services/recruitmentService.ts](../../apps/web/src/services/recruitmentService.ts)

Related analysis:
- [../hr-gap-analysis/02-DETAILED-GAP-ANALYSIS.md](../hr-gap-analysis/02-DETAILED-GAP-ANALYSIS.md)

---

## Objective

Make recruitment operational end to end, from requisition and application intake through interviews, offers, and analytics.

---

## Functional Scope

1. Job requisitions and postings
2. Candidate applications
3. Candidate pipeline stages
4. Interview scheduling
5. Scorecards and feedback
6. Offer management
7. Resume ingestion boundary
8. Recruitment analytics

---

## Week-by-Week Plan

### Week 1: Core Candidate Pipeline

Deliverables:
1. Requisition and posting persistence
2. Candidate model and application intake
3. Stage transition logic
4. Candidate list and detail APIs
5. Interview scheduling foundation

### Week 2: Completion and Hardening

Deliverables:
1. Interview feedback and scorecards
2. Offer lifecycle
3. Resume ingestion service boundary
4. Recruitment analytics endpoints
5. QA sign-off

---

## Domain Model Requirements

### Requisition

1. Department and hiring owner
2. Open positions
3. Status
4. Approval state
5. Job metadata

### Candidate

1. Application source
2. Current stage
3. Resume reference
4. Contact data
5. Notes and tags
6. Interview history
7. Offer state

### Interview

1. Type
2. Schedule
3. Interviewers
4. Feedback entries
5. Outcome

### Offer

1. Drafted date
2. Compensation snapshot
3. Expiry
4. Acceptance or rejection status

---

## Key Workflows

### Candidate Progression

1. Create application
2. Assign stage
3. Move through defined stage transitions
4. Capture owner and action history
5. Emit audit and analytics events

### Interview Scheduling

1. Select candidate and stage
2. Validate interviewer availability
3. Persist schedule
4. Notify participants
5. Store feedback after completion

### Offer Lifecycle

1. Generate offer record
2. Persist compensation snapshot
3. Track sent, accepted, declined, expired
4. Link accepted offer to downstream onboarding

---

## Resume Ingestion Strategy

1. Keep parser integration behind a service boundary
2. Store original file reference and parsed output separately
3. Make parser provider replaceable
4. Treat parser errors as recoverable
5. Do not block candidate creation on parser completion unless explicitly required

---

## Analytics Requirements

1. Applications by source
2. Time to hire
3. Stage conversion rates
4. Open positions by department
5. Interview throughput
6. Offer acceptance rate

---

## Testing Strategy

### Unit Tests
1. Stage transition rules
2. Offer status changes
3. Scoring logic
4. Analytics calculations

### Integration Tests
1. Candidate creation and progression
2. Interview scheduling and feedback
3. Offer create and acceptance flows
4. Tenant-scoped data access

### End-to-End Tests
1. Create requisition to offer journey
2. Candidate application to feedback journey

---

## Success Criteria

1. Candidate pipeline state is durable and auditable.
2. Interviews and scorecards are stored and retrievable.
3. Offers move through a real lifecycle.
4. Recruitment analytics are query-backed.
5. No production recruitment path depends on static mock datasets.

---

## Exit Gate

This guide is complete when:
1. Recruitment screens operate on real requisition and candidate data
2. Scheduling, feedback, and offer flows persist correctly
3. Resume ingestion is integrated through a stable service boundary

---

## Related Guides

1. [Feature Completion Master Plan](./FEATURE-COMPLETION-MASTER-PLAN.md)
2. [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
3. [Feature Completion API Contracts](./FEATURE-COMPLETION-API-CONTRACTS.md)
4. [Export and Reporting Completion Guide](./GUIDE-EXPORT-REPORTING-COMPLETION.md)