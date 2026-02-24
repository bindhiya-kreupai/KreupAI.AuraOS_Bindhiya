# Auth Service Traffic Migration Guide (10% → 100%)

**Document Version**: 1.0
**Last Updated**: January 22, 2026
**Owner**: Platform Engineering Team
**Status**: Implementation Ready
**Estimated Timeline**: 2 weeks
**Impact**: 1% of platform completion (95% → 96%)

---

## Table of Contents

1. [Overview](#overview)
2. [Current State](#current-state)
3. [Migration Strategy](#migration-strategy)
4. [Prerequisites](#prerequisites)
5. [Traffic Migration Phases](#traffic-migration-phases)
6. [Monitoring & Validation](#monitoring--validation)
7. [Rollback Procedures](#rollback-procedures)
8. [Client SDK Updates](#client-sdk-updates)
9. [Monolith Cleanup](#monolith-cleanup)
10. [Success Criteria](#success-criteria)

---

## Overview

### Objective
Gradually increase traffic to the Auth Service microservice from current 10% to 100%, ensuring zero downtime and maintaining all SLA commitments.

### Current Performance
- **Response Time (p95)**: 45ms (Target: <100ms) ✅
- **Availability**: 99.97% (Target: 99.95%) ✅
- **Error Rate**: 0.03% (Target: <0.1%) ✅
- **Current Traffic**: 10% of all authentication requests
- **Tests**: 600+ unit tests, 285 security tests

### Migration Timeline
```
Week 1: 10% → 50% → 70% (5 days, careful monitoring)
Week 2: 70% → 90% → 100% (5 days, final validation)
```

---

## Current State

### Auth Service Architecture

**Service Location**: `services/auth-service/`

**Deployed Components**:
- ✅ Fastify API server (port 3001)
- ✅ PostgreSQL database (separate from monolith)
- ✅ Redis cache (session management)
- ✅ Kong API Gateway routing (10% traffic)
- ✅ Istio service mesh integration
- ✅ Datadog APM monitoring

**API Endpoints** (9 endpoints):
```
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
POST   /api/v1/auth/register
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
GET    /api/v1/auth/verify-email
POST   /api/v1/auth/resend-verification
GET    /api/v1/auth/me
```

**Database Tables** (7 tables):
- `users`
- `sessions`
- `refresh_tokens`
- `password_resets`
- `email_verifications`
- `login_attempts`
- `audit_logs`

---

## Migration Strategy

### Strangler Fig Pattern
We use the Strangler Fig pattern to gradually route traffic from the monolith to the microservice:

```
Kong API Gateway
    ├─ 10% → Auth Service (current)
    └─ 90% → Monolith

    ↓ Phase 1 (Day 1-2)

    ├─ 50% → Auth Service
    └─ 50% → Monolith

    ↓ Phase 2 (Day 3-4)

    ├─ 70% → Auth Service
    └─ 30% → Monolith

    ↓ Phase 3 (Day 5-7)

    ├─ 90% → Auth Service
    └─ 10% → Monolith

    ↓ Phase 4 (Day 8-10)

    └─ 100% → Auth Service (complete)
```

### Feature Flags Configuration

**Kong Configuration**: `kong/routes/auth.yaml`

```yaml
# Current configuration (10% traffic)
routes:
  - name: auth-service-route
    paths:
      - /api/v1/auth
    strip_path: false
    plugins:
      - name: rate-limiting
        config:
          minute: 100
          policy: local
      - name: request-transformer
        config:
          add:
            headers:
              - X-Service-Version:microservice
    # Traffic splitting
    service:
      name: auth-upstream

upstreams:
  - name: auth-upstream
    targets:
      - target: auth-service.default.svc.cluster.local:3001
        weight: 10  # 10% traffic
      - target: monolith.default.svc.cluster.local:3000
        weight: 90  # 90% traffic
```

---

## Prerequisites

### Before Starting Migration

**1. Verify Service Health** ✅
```bash
# Check Auth Service health
curl https://api.auraos.com/api/v1/auth/health
# Expected: {"status":"healthy","version":"1.0.0"}

# Check Kubernetes pods
kubectl get pods -n default -l app=auth-service
# Expected: All pods Running

# Check service metrics
kubectl top pods -n default -l app=auth-service
# Expected: CPU < 70%, Memory < 80%
```

**2. Verify Database Replication** ✅
```bash
# Check database sync status
psql -h auth-db.postgres -U admin -d auth_production -c \
  "SELECT NOW() - pg_last_xact_replay_timestamp() AS replication_delay;"
# Expected: < 5 seconds

# Verify read replica
psql -h auth-db-replica.postgres -U admin -d auth_production -c \
  "SELECT COUNT(*) FROM users;"
# Expected: Same count as primary
```

**3. Verify Monitoring Dashboards** ✅
- Datadog: https://app.datadoghq.com/dashboard/auth-service
- Grafana: https://grafana.auraos.com/d/auth-service
- Kong Analytics: https://kong.auraos.com/analytics

**4. Prepare Rollback Plan** ✅
- Keep Kong configuration backup
- Document current traffic weights
- Ensure monolith auth code is still functional

**5. Notify Stakeholders** ✅
- Engineering team
- DevOps team
- Product team
- Customer support team

---

## Traffic Migration Phases

### Phase 1: 10% → 50% (Day 1-2)

**Objective**: Double traffic to validate performance under moderate load

**Implementation Steps**:

1. **Update Kong Configuration**:
```bash
cd kong/

# Backup current configuration
kubectl get configmap kong-config -n kong -o yaml > kong-config-backup-10pct.yaml

# Edit configuration
kubectl edit configmap kong-config -n kong

# Update weights
# auth-service.default.svc.cluster.local:3001 weight: 50
# monolith.default.svc.cluster.local:3000 weight: 50

# Apply changes
kubectl rollout restart deployment kong -n kong

# Verify
kubectl get configmap kong-config -n kong -o yaml | grep -A5 auth-upstream
```

2. **Monitor for 24 Hours**:
```bash
# Watch error rates
watch -n 5 'curl -s https://api.auraos.com/metrics | grep auth_error_rate'

# Watch response times
watch -n 5 'curl -s https://api.auraos.com/metrics | grep auth_response_time_p95'

# Watch pod resource usage
watch -n 10 'kubectl top pods -n default -l app=auth-service'
```

**Validation Criteria**:
- ✅ Error rate < 0.1%
- ✅ p95 response time < 100ms
- ✅ CPU usage < 70%
- ✅ Memory usage < 80%
- ✅ No customer complaints

**If Issues Occur**:
- Roll back to 10% immediately (see [Rollback Procedures](#rollback-procedures))
- Investigate logs: `kubectl logs -n default -l app=auth-service --tail=1000`
- Check Datadog APM traces

---

### Phase 2: 50% → 70% (Day 3-4)

**Objective**: Increase to majority traffic while maintaining performance

**Implementation Steps**:

1. **Verify Phase 1 Success**:
```bash
# Check 24-hour metrics
curl -s https://api.auraos.com/metrics/auth/summary?window=24h

# Expected output:
# {
#   "error_rate": 0.02,
#   "p95_latency": 47,
#   "availability": 99.98,
#   "total_requests": 5000000
# }
```

2. **Update Traffic to 70%**:
```bash
# Update Kong configuration
kubectl edit configmap kong-config -n kong

# Update weights
# auth-service: weight: 70
# monolith: weight: 30

# Apply
kubectl rollout restart deployment kong -n kong
```

3. **Monitor for 24 Hours**:
- Same monitoring procedures as Phase 1
- Pay special attention to database connection pool
- Monitor Redis cache hit rates

**Validation Criteria**:
- ✅ Error rate < 0.1%
- ✅ p95 response time < 100ms
- ✅ Database connections < 80% of pool
- ✅ Redis hit rate > 90%

---

### Phase 3: 70% → 90% (Day 5-7)

**Objective**: Near-complete migration with minimal monolith dependency

**Implementation Steps**:

1. **Verify Phase 2 Success**:
```bash
curl -s https://api.auraos.com/metrics/auth/summary?window=24h
```

2. **Update Traffic to 90%**:
```bash
kubectl edit configmap kong-config -n kong
# auth-service: weight: 90
# monolith: weight: 10

kubectl rollout restart deployment kong -n kong
```

3. **Extended Monitoring (48 Hours)**:
- Monitor peak traffic hours
- Validate weekend traffic patterns
- Check for any edge cases hitting monolith

**Validation Criteria**:
- ✅ All previous criteria maintained
- ✅ No database replication lag
- ✅ Successful load test at 100% capacity

---

### Phase 4: 90% → 100% (Day 8-10)

**Objective**: Complete migration, remove monolith dependency

**Implementation Steps**:

1. **Pre-Migration Checks**:
```bash
# Run comprehensive health check
npm run health:check:full

# Run load test
k6 run tests/load/auth-100pct.js

# Expected: All tests pass, p95 < 100ms at 100% load
```

2. **Final Traffic Switch to 100%**:
```bash
kubectl edit configmap kong-config -n kong

# Update to 100% auth-service
upstreams:
  - name: auth-upstream
    targets:
      - target: auth-service.default.svc.cluster.local:3001
        weight: 100
      # Remove monolith target

kubectl rollout restart deployment kong -n kong
```

3. **Validation Period (48 Hours)**:
- Monitor continuously for 48 hours
- Validate all authentication flows
- Check all client integrations
- Monitor error logs closely

**Success Criteria**:
- ✅ Zero authentication failures
- ✅ All metrics within SLA
- ✅ No customer impact
- ✅ No rollback required for 48 hours

---

## Monitoring & Validation

### Key Metrics to Monitor

**1. Response Time Metrics**:
```bash
# Datadog query
avg:trace.fastify.request.duration{service:auth-service,env:production}.p95

# Target: < 100ms
# Alert: > 150ms for 5 minutes
```

**2. Error Rate Metrics**:
```bash
# Datadog query
sum:trace.fastify.request.errors{service:auth-service}/sum:trace.fastify.request.hits{service:auth-service}

# Target: < 0.1%
# Alert: > 0.5% for 2 minutes
```

**3. Availability Metrics**:
```bash
# Uptime check
curl -f https://api.auraos.com/api/v1/auth/health || echo "DOWN"

# Target: 99.95%
# Alert: < 99.9% over 5 minutes
```

**4. Resource Metrics**:
```bash
# CPU usage
kubectl top pods -n default -l app=auth-service

# Target: < 70%
# Alert: > 85% for 5 minutes

# Memory usage
# Target: < 80%
# Alert: > 90% for 3 minutes
```

### Datadog Dashboard Widgets

**Create monitoring dashboard**: `docs/monitoring/auth-migration-dashboard.json`

Key widgets:
1. **Traffic Split**: Pie chart showing auth-service vs monolith traffic
2. **Error Rate**: Timeseries of error rate over time
3. **Response Time**: Heatmap of p50, p75, p95, p99 latencies
4. **Database Connections**: Gauge showing connection pool usage
5. **Redis Hit Rate**: Percentage of cache hits vs misses
6. **Pod Resource Usage**: CPU and memory usage per pod

### Alert Configuration

**Critical Alerts** (PagerDuty):
```yaml
# .datadog/alerts/auth-service-critical.yaml
alerts:
  - name: "Auth Service Error Rate Critical"
    query: "sum:trace.fastify.request.errors{service:auth-service}/sum:trace.fastify.request.hits{service:auth-service} > 0.5"
    message: "Auth service error rate above 0.5%. Investigate immediately."
    priority: P1
    notify:
      - "@pagerduty-platform-engineering"
      - "@slack-engineering-critical"

  - name: "Auth Service Response Time Critical"
    query: "avg:trace.fastify.request.duration{service:auth-service}.p95 > 200"
    message: "Auth service p95 latency above 200ms. Performance degradation."
    priority: P1
    notify:
      - "@pagerduty-platform-engineering"
```

**Warning Alerts** (Slack):
```yaml
  - name: "Auth Service Error Rate Warning"
    query: "sum:trace.fastify.request.errors{service:auth-service}/sum:trace.fastify.request.hits{service:auth-service} > 0.2"
    message: "Auth service error rate elevated (>0.2%). Monitor closely."
    priority: P2
    notify:
      - "@slack-engineering-alerts"
```

---

## Rollback Procedures

### When to Rollback

**Immediate Rollback Required**:
- ❌ Error rate > 1%
- ❌ p95 latency > 300ms
- ❌ Service availability < 99%
- ❌ Database connection failures
- ❌ Multiple customer complaints

**Consider Rollback**:
- ⚠️ Error rate > 0.5%
- ⚠️ p95 latency > 150ms
- ⚠️ Sustained high resource usage
- ⚠️ Unusual error patterns in logs

### Rollback Procedure

**Step 1: Immediate Traffic Reduction**
```bash
# Rollback to previous traffic percentage
# Example: From 70% back to 50%

kubectl edit configmap kong-config -n kong

# Restore previous weights from backup
# auth-service: weight: 50  (or 10, depending on phase)
# monolith: weight: 50  (or 90)

kubectl rollout restart deployment kong -n kong

# Verify rollback
kubectl get configmap kong-config -n kong -o yaml | grep -A5 auth-upstream
```

**Step 2: Verify Rollback Success**
```bash
# Check traffic distribution
curl -s https://api.auraos.com/metrics/auth/traffic-split

# Expected: Traffic back to previous percentages

# Monitor error rate
watch -n 5 'curl -s https://api.auraos.com/metrics | grep auth_error_rate'
```

**Step 3: Investigate Root Cause**
```bash
# Check recent logs
kubectl logs -n default -l app=auth-service --tail=1000 --since=30m

# Check Datadog traces for errors
# Navigate to: https://app.datadoghq.com/apm/traces?service=auth-service&status=error

# Check database status
psql -h auth-db.postgres -U admin -d auth_production -c \
  "SELECT * FROM pg_stat_activity WHERE state != 'idle';"

# Check Redis status
redis-cli -h auth-redis.default.svc.cluster.local INFO stats
```

**Step 4: Fix and Re-attempt**
- Address root cause
- Test fix in staging environment
- Schedule new migration attempt
- Communicate timeline to stakeholders

### Complete Rollback to Monolith

**If critical issues require reverting to 100% monolith**:

```bash
# Emergency rollback script
cd scripts/

./rollback-auth-to-monolith.sh

# This script:
# 1. Updates Kong to route 100% to monolith
# 2. Scales down auth-service pods
# 3. Notifies team via Slack/PagerDuty
# 4. Creates incident report
```

**Post-Rollback**:
- Create incident report
- Schedule post-mortem meeting
- Document lessons learned
- Plan corrective actions

---

## Client SDK Updates

### Overview

After achieving 100% traffic migration, update client SDKs to point directly to auth-service URLs (optional, for optimization).

### Current Client SDKs

**JavaScript/TypeScript SDK**: `packages/@aura/client-sdk/`
```typescript
// Current configuration (uses Kong gateway)
export const AuthClient = {
  baseURL: 'https://api.auraos.com/api/v1/auth',
  // Kong handles routing to auth-service
};
```

**Mobile SDKs**:
- iOS: `clients/ios-sdk/AuraAuth/`
- Android: `clients/android-sdk/com.auraos.auth/`

### Update Procedure (Optional)

**Only perform if you want to bypass Kong for auth service**:

1. **Update SDK configuration**:
```typescript
// packages/@aura/client-sdk/src/config.ts

export const AuthClient = {
  // Option 1: Direct to microservice (bypasses Kong)
  baseURL: 'https://auth.auraos.com/api/v1/auth',

  // Option 2: Keep using Kong (recommended)
  baseURL: 'https://api.auraos.com/api/v1/auth',
};

// Recommended: Keep using Kong for:
// - Rate limiting
// - Request transformation
// - Centralized monitoring
// - Easier service migration in future
```

2. **Version bump and release**:
```bash
cd packages/@aura/client-sdk/

# Bump version
npm version patch

# Publish to npm
npm publish

# Tag release
git tag -a @aura/client-sdk@1.2.1 -m "Update auth service URL"
git push origin @aura/client-sdk@1.2.1
```

3. **Update dependent applications**:
```bash
# Web application
cd apps/web/
npm install @aura/client-sdk@latest

# Mobile apps - update in their respective package managers
```

### Backward Compatibility

**Ensure backward compatibility**:
- Old SDKs continue working with Kong routing
- No breaking changes to authentication flow
- Gradual SDK adoption by clients

---

## Monolith Cleanup

### After 48 Hours at 100% Traffic

**Objective**: Remove authentication code from monolith to complete extraction

### Code Removal Checklist

**1. Identify Monolith Auth Code**:
```bash
# Location: apps/web/src/lib/auth/

apps/web/src/lib/auth/
├── auth.service.ts          # ⚠️ REMOVE
├── session.service.ts       # ⚠️ REMOVE
├── password.service.ts      # ⚠️ REMOVE
├── jwt.service.ts          # ⚠️ REMOVE
├── middleware/
│   └── auth.middleware.ts  # ⚠️ REMOVE
└── validators/
    └── auth.validators.ts  # ⚠️ REMOVE
```

**2. Update Monolith to Proxy Auth Requests**:

Instead of removing completely, update monolith to proxy all auth requests to microservice:

```typescript
// apps/web/src/lib/auth/auth.service.ts

// OLD CODE (remove after verification):
export class AuthService {
  async login(email: string, password: string) {
    // Local authentication logic
    // ...
  }
}

// NEW CODE (proxy to microservice):
export class AuthService {
  private authServiceURL = process.env.AUTH_SERVICE_URL || 'http://auth-service.default.svc.cluster.local:3001';

  async login(email: string, password: string) {
    // Proxy to microservice
    const response = await fetch(`${this.authServiceURL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    return response.json();
  }

  // Repeat for all auth methods...
}
```

**3. Remove Unused Database Tables** (CAREFUL):

```sql
-- ⚠️ ONLY run after verifying auth-service is stable at 100% for 30+ days

-- Backup first
pg_dump -h monolith-db -U admin -d monolith_production -t users -t sessions > backup-auth-tables.sql

-- Drop tables (CAUTION)
-- DROP TABLE IF EXISTS monolith_production.users;
-- DROP TABLE IF EXISTS monolith_production.sessions;
-- DROP TABLE IF EXISTS monolith_production.refresh_tokens;

-- Recommended: Archive tables instead of dropping
ALTER TABLE users RENAME TO users_archived;
ALTER TABLE sessions RENAME TO sessions_archived;
```

**4. Update Dependencies**:
```bash
cd apps/web/

# Remove auth-related dependencies no longer needed
npm uninstall bcryptjs jsonwebtoken passport

# Update package.json
git add package.json package-lock.json
git commit -m "chore: Remove auth dependencies after microservice migration"
```

**5. Update Documentation**:
```bash
# Update architecture docs
docs/architecture/SYSTEM-ARCHITECTURE.md
# Remove monolith auth section
# Add reference to auth-service

# Update API docs
docs/api/AUTHENTICATION.md
# Update to reference auth-service endpoints
```

**6. Clean Up Tests**:
```bash
# Remove monolith auth tests
rm -rf apps/web/src/__tests__/auth/

# Tests now live in auth-service repository
# Location: services/auth-service/src/__tests__/
```

### Verification After Cleanup

**Run comprehensive tests**:
```bash
# Build monolith to ensure no broken imports
cd apps/web/
npm run build

# Run remaining tests
npm test

# Check for any remaining auth references
grep -r "import.*auth" src/ | grep -v "auth-service"
```

**Deploy cleaned monolith**:
```bash
# Deploy to staging first
kubectl apply -f k8s/staging/monolith-deployment.yaml

# Verify staging works
npm run test:e2e:staging

# Deploy to production
kubectl apply -f k8s/production/monolith-deployment.yaml
```

---

## Success Criteria

### Phase Completion Checklist

**Phase 1 (10% → 50%)**:
- [ ] Traffic successfully increased to 50%
- [ ] Error rate < 0.1% for 24 hours
- [ ] p95 latency < 100ms
- [ ] No rollback required
- [ ] Datadog dashboard shows healthy metrics

**Phase 2 (50% → 70%)**:
- [ ] Traffic successfully increased to 70%
- [ ] All Phase 1 criteria maintained
- [ ] Database connections stable
- [ ] Redis cache performing well

**Phase 3 (70% → 90%)**:
- [ ] Traffic successfully increased to 90%
- [ ] All previous criteria maintained
- [ ] Extended monitoring successful (48 hours)
- [ ] Load test at 100% capacity passed

**Phase 4 (90% → 100%)**:
- [ ] Traffic at 100% to auth-service
- [ ] Monolith routing removed from Kong
- [ ] All metrics within SLA for 48 hours
- [ ] Zero customer-reported issues
- [ ] Complete validation testing passed

**Final Cleanup**:
- [ ] Monolith auth code updated/removed
- [ ] Unused database tables archived
- [ ] Documentation updated
- [ ] Client SDKs updated (if needed)
- [ ] Post-migration report completed

### Final Validation Tests

**Run comprehensive test suite**:
```bash
# Health check
curl https://api.auraos.com/api/v1/auth/health

# Smoke tests
npm run test:e2e:auth

# Load test at 100% capacity
k6 run tests/load/auth-100pct.js --duration 30m

# Security scan
npm run test:security:auth

# Performance benchmark
npm run benchmark:auth
```

**Expected Results**:
- ✅ All tests pass
- ✅ p95 latency: 45-50ms
- ✅ Error rate: < 0.05%
- ✅ Availability: > 99.95%
- ✅ No security vulnerabilities
- ✅ Performance within benchmarks

---

## Post-Migration Report

### Document Completion

After successful 100% migration, create a post-migration report:

**File**: `docs/reports/AUTH-SERVICE-MIGRATION-COMPLETE.md`

**Include**:
- Migration timeline (actual vs planned)
- Metrics during each phase
- Issues encountered and resolutions
- Performance comparison (before/after)
- Lessons learned
- Recommendations for future migrations

**Share with**:
- Engineering team
- Product team
- Executive team
- Archive for future reference

---

## Troubleshooting

### Common Issues and Solutions

**Issue 1: High Error Rate During Migration**

**Symptoms**:
- Error rate spikes above 0.5%
- Datadog shows 500 errors

**Investigation**:
```bash
# Check auth-service logs
kubectl logs -n default -l app=auth-service --tail=100 | grep ERROR

# Check database connections
psql -h auth-db.postgres -U admin -d auth_production -c \
  "SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active';"

# Check for specific error patterns
kubectl logs -n default -l app=auth-service | grep -A5 "Error:"
```

**Solution**:
- Increase database connection pool: `DB_POOL_MAX=50`
- Scale up auth-service pods: `kubectl scale deployment auth-service --replicas=6`
- Check for slow queries in database logs

---

**Issue 2: Increased Latency**

**Symptoms**:
- p95 latency > 100ms
- Slow response times reported by users

**Investigation**:
```bash
# Check Datadog APM traces
# Navigate to slowest traces

# Check database query performance
psql -h auth-db.postgres -U admin -d auth_production -c \
  "SELECT * FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;"

# Check Redis latency
redis-cli -h auth-redis.default.svc.cluster.local --latency
```

**Solution**:
- Add database indexes for slow queries
- Increase Redis cache TTL for frequently accessed data
- Review and optimize slow API endpoints
- Consider database read replicas for read-heavy queries

---

**Issue 3: Database Replication Lag**

**Symptoms**:
- Replication delay > 5 seconds
- Inconsistent data between replicas

**Investigation**:
```bash
# Check replication status
psql -h auth-db.postgres -U admin -d auth_production -c \
  "SELECT NOW() - pg_last_xact_replay_timestamp() AS replication_delay;"

# Check replication slots
psql -h auth-db.postgres -U admin -d auth_production -c \
  "SELECT * FROM pg_replication_slots;"
```

**Solution**:
- Reduce write load during migration
- Increase WAL sender processes
- Check network connectivity between primary and replica
- Consider upgrading database instance size

---

## Support and Escalation

### Contact Information

**Platform Engineering Team**:
- Slack: `#platform-engineering`
- Email: platform-eng@kreupai.com
- PagerDuty: `@platform-engineering`

**On-Call Engineer**:
- PagerDuty: Trigger incident with severity P1
- Slack: `@platform-oncall`

**Escalation Path**:
1. Platform Engineer (immediate response)
2. Engineering Manager (within 15 minutes)
3. CTO (for critical incidents)

---

## Appendix

### A. Kong Configuration Files

**Location**: `kong/routes/auth.yaml`

**Backup procedure**:
```bash
# Before each phase
kubectl get configmap kong-config -n kong -o yaml > kong-config-backup-$(date +%Y%m%d-%H%M%S).yaml
```

### B. Useful Commands

```bash
# Check current traffic split
kubectl get configmap kong-config -n kong -o yaml | grep -A10 auth-upstream

# View auth-service logs
kubectl logs -n default -l app=auth-service --tail=100 -f

# Check pod health
kubectl get pods -n default -l app=auth-service -o wide

# Execute SQL query
psql -h auth-db.postgres -U admin -d auth_production -c "SELECT COUNT(*) FROM users;"

# Check Redis cache
redis-cli -h auth-redis.default.svc.cluster.local INFO stats

# Restart auth-service pods
kubectl rollout restart deployment auth-service -n default
```

### C. Monitoring Queries

**Datadog Queries**:
```
# Error rate
sum:trace.fastify.request.errors{service:auth-service}/sum:trace.fastify.request.hits{service:auth-service}

# p95 latency
avg:trace.fastify.request.duration{service:auth-service}.p95

# Request count
sum:trace.fastify.request.hits{service:auth-service}.as_count()

# CPU usage
avg:system.cpu.usage{service:auth-service}

# Memory usage
avg:system.mem.used{service:auth-service}/avg:system.mem.total{service:auth-service}
```

---

**End of Guide**

**Next Steps**: Once this guide is successfully completed, proceed with [Employee Service Implementation Guide](./GUIDE-EMPLOYEE-SERVICE.md).

**Platform Progress**: 95% → 96% ✅
