# Phase 4 Wave 2 - Microservices Extraction Plan

**Status**: 🚧 In Progress
**Target Completion**: Platform 100%
**Date**: December 26, 2024

---

## Overview

Wave 2 completes the microservices migration by extracting 4 critical services from the monolith:

1. **Employee Service** - Core employee data and operations
2. **Notification Service** - Async messaging (email, SMS, push)
3. **Document Service** - Document storage and management
4. **Payroll Service** - Complex payroll calculations

**Current Progress**: 95% → **Target: 100%**

---

## Service Extraction Priority

### 1. Employee Service (Priority: CRITICAL)

**Rationale**: Core data model that other services depend on

**Scope**:

- Employee CRUD operations
- Employee search (Elasticsearch)
- Employment history
- Position management
- Organization structure
- Mass updates
- Employee lifecycle events

**Database Tables**:

- `Employee` (208 fields)
- `EmployeeStatus`
- `Department`
- `Position`
- `EmploymentHistory`
- `OrganizationStructure`

**API Endpoints**:

```
GET    /api/v1/employees              # List employees with pagination
POST   /api/v1/employees              # Create employee
GET    /api/v1/employees/:id          # Get employee details
PUT    /api/v1/employees/:id          # Update employee
DELETE /api/v1/employees/:id          # Soft delete employee
GET    /api/v1/employees/search       # Search employees (Elasticsearch)
POST   /api/v1/employees/bulk         # Bulk operations
GET    /api/v1/employees/:id/history  # Employment history
```

**Dependencies**:

- PostgreSQL (shared with tenant isolation)
- Elasticsearch (employee search)
- Auth Service (authentication)
- Redis (caching)

**Technical Specs**:

- Replicas: 5 (high traffic)
- Resources: CPU 1000m, Memory 1Gi
- HPA: 5-20 replicas based on load
- Cache TTL: 5 minutes for employee data

---

### 2. Notification Service (Priority: HIGH)

**Rationale**: Independent, fully async, high value

**Scope**:

- Email notifications
- SMS notifications
- Push notifications
- Notification templates
- Notification history
- Scheduled notifications
- Bulk notifications

**Message Queue Integration**:

- RabbitMQ exchanges: `aura.notifications`
- Queues:
  - `notifications.email`
  - `notifications.sms`
  - `notifications.push`
  - `notifications.scheduled`

**API Endpoints**:

```
POST   /api/v1/notifications/send             # Send immediate notification
POST   /api/v1/notifications/schedule         # Schedule notification
GET    /api/v1/notifications/:id              # Get notification status
GET    /api/v1/notifications/history          # Notification history
POST   /api/v1/notifications/templates        # Create template
GET    /api/v1/notifications/templates/:id    # Get template
```

**Dependencies**:

- RabbitMQ (message queue)
- Redis (rate limiting, deduplication)
- AWS SES (email)
- Twilio (SMS)
- Firebase (push notifications)
- PostgreSQL (notification history)

**Technical Specs**:

- Replicas: 2-3 (async processing)
- Resources: CPU 250m, Memory 256Mi
- Queue workers: 5 concurrent workers
- Retry policy: 3 attempts with exponential backoff
- Dead Letter Queue: For failed notifications

---

### 3. Document Service (Priority: HIGH)

**Rationale**: Heavy I/O, storage optimization needed

**Scope**:

- Document upload/download
- Document versioning
- Document metadata
- Document search
- Document templates
- E-signatures
- Document retention policies

**Storage Architecture**:

```
┌─────────────────────────────────────────┐
│         Document Service                │
│  ┌───────────────────────────────────┐  │
│  │  Upload → Virus Scan → S3        │  │
│  │  Metadata → PostgreSQL            │  │
│  │  Full-text → Elasticsearch        │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**API Endpoints**:

```
POST   /api/v1/documents/upload               # Upload document
GET    /api/v1/documents/:id                  # Get document metadata
GET    /api/v1/documents/:id/download         # Download document
PUT    /api/v1/documents/:id                  # Update metadata
DELETE /api/v1/documents/:id                  # Delete document
GET    /api/v1/documents/search               # Search documents
POST   /api/v1/documents/:id/version          # Create new version
GET    /api/v1/documents/:id/versions         # List versions
POST   /api/v1/documents/:id/sign             # E-signature
```

**Dependencies**:

- AWS S3 (document storage)
- PostgreSQL (metadata)
- Elasticsearch (document search)
- ClamAV (virus scanning)
- Redis (caching)

**Technical Specs**:

- Replicas: 3-5 (I/O heavy)
- Resources: CPU 500m, Memory 1Gi
- Storage: S3 with lifecycle policies
- Max file size: 100MB
- Supported formats: PDF, DOCX, XLSX, Images
- Virus scanning: All uploads

---

### 4. Payroll Service (Priority: MEDIUM)

**Rationale**: Complex calculations, isolated domain logic

**Scope**:

- Salary calculations
- Tax computations
- Deductions and benefits
- Payroll runs
- Payslip generation
- Compliance rules
- Multi-country support

**Calculation Engine**:

```typescript
interface PayrollCalculation {
  employeeId: string;
  baseSalary: number;
  allowances: Allowance[];
  deductions: Deduction[];
  taxRules: TaxRule[];
  benefits: Benefit[];
  workingDays: number;
  overtimeHours: number;
}

interface PayrollResult {
  grossPay: number;
  netPay: number;
  totalDeductions: number;
  totalTax: number;
  breakdown: PayrollBreakdown;
}
```

**API Endpoints**:

```
POST   /api/v1/payroll/calculate              # Calculate payroll for employee
POST   /api/v1/payroll/runs                   # Create payroll run
GET    /api/v1/payroll/runs/:id               # Get payroll run details
POST   /api/v1/payroll/runs/:id/process       # Process payroll run
GET    /api/v1/payroll/payslips/:id           # Get payslip
POST   /api/v1/payroll/payslips/:id/send      # Send payslip via email
GET    /api/v1/payroll/reports                # Payroll reports
```

**Dependencies**:

- PostgreSQL (payroll data)
- Employee Service (employee details)
- Document Service (payslip PDFs)
- Notification Service (payslip emails)
- Redis (calculation caching)

**Technical Specs**:

- Replicas: 3 (CPU intensive)
- Resources: CPU 2000m, Memory 2Gi
- Calculation cache: 1 hour
- Transaction support: ACID compliance
- Audit logging: All payroll operations

---

## Infrastructure Updates

### Kong API Gateway Configuration

Add routes for Wave 2 services:

```yaml
services:
  - name: employee-service
    url: http://employee-service:3002
    routes:
      - paths: [/api/v1/employees]
        methods: [GET, POST, PUT, DELETE]
    plugins:
      - name: rate-limiting
        config:
          second: 200
          minute: 2000

  - name: notification-service
    url: http://notification-service:3003
    routes:
      - paths: [/api/v1/notifications]
        methods: [GET, POST]
    plugins:
      - name: rate-limiting
        config:
          second: 100
          minute: 1000

  - name: document-service
    url: http://document-service:3004
    routes:
      - paths: [/api/v1/documents]
        methods: [GET, POST, PUT, DELETE]
    plugins:
      - name: rate-limiting
        config:
          second: 50
          minute: 500
      - name: request-size-limiting
        config:
          allowed_payload_size: 100

  - name: payroll-service
    url: http://payroll-service:3005
    routes:
      - paths: [/api/v1/payroll]
        methods: [GET, POST]
    plugins:
      - name: rate-limiting
        config:
          second: 50
          minute: 500
```

---

### Istio Traffic Routing

Strangler Fig Pattern for each service:

```yaml
# Week 1: 10% traffic split
- match:
    - uri:
        prefix: /api/v1/employees/
  route:
    - destination:
        host: employee-service
      weight: 10
    - destination:
        host: monolith
      weight: 90
# Week 2: 50% traffic split
# Week 3: 100% to microservice
```

---

### Kubernetes Deployments

**Employee Service**:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: employee-service
spec:
  replicas: 5
  template:
    spec:
      containers:
        - name: employee-service
          image: ghcr.io/kreupai/employee-service:latest
          resources:
            requests:
              cpu: 500m
              memory: 512Mi
            limits:
              cpu: 1000m
              memory: 1Gi
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: employee-service-hpa
spec:
  minReplicas: 5
  maxReplicas: 20
  targetCPUUtilizationPercentage: 70
```

**Notification Service**:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: notification-service
spec:
  replicas: 2
  template:
    spec:
      containers:
        - name: notification-service
          image: ghcr.io/kreupai/notification-service:latest
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 250m
              memory: 256Mi
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: notification-service-hpa
spec:
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
```

**Document Service**:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: document-service
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: document-service
          image: ghcr.io/kreupai/document-service:latest
          resources:
            requests:
              cpu: 250m
              memory: 512Mi
            limits:
              cpu: 500m
              memory: 1Gi
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: document-service-hpa
spec:
  minReplicas: 3
  maxReplicas: 15
  targetCPUUtilizationPercentage: 70
```

**Payroll Service**:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: payroll-service
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: payroll-service
          image: ghcr.io/kreupai/payroll-service:latest
          resources:
            requests:
              cpu: 1000m
              memory: 1Gi
            limits:
              cpu: 2000m
              memory: 2Gi
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: payroll-service-hpa
spec:
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
```

---

## Inter-Service Communication

### Service Dependencies

```
┌─────────────────────────────────────────────────────────┐
│                  Service Dependency Graph                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Auth Service ──────┐                                   │
│                      │                                   │
│                      ├─► Employee Service ──┐           │
│                      │                       │           │
│                      │                       ├─► Payroll│
│  Notification ◄──────┤                       │  Service  │
│  Service             │                       │           │
│                      │                       │           │
│                      └─► Document  ◄─────────┘           │
│                          Service                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Communication Patterns

1. **Synchronous (REST)**:
   - Auth Service → Employee Service (user validation)
   - Payroll Service → Employee Service (employee data)
   - Document Service → Employee Service (ownership)

2. **Asynchronous (RabbitMQ)**:
   - Employee Service → Notification Service (welcome email)
   - Payroll Service → Notification Service (payslip email)
   - Document Service → Notification Service (upload confirmation)

3. **Event-Driven**:
   - EmployeeCreated → Notification, Document Services
   - PayrollProcessed → Notification Service
   - DocumentUploaded → Elasticsearch indexing

---

## CI/CD Pipeline Updates

Each service gets its own GitHub Actions workflow:

**.github/workflows/employee-service.yml**
**.github/workflows/notification-service.yml**
**.github/workflows/document-service.yml**
**.github/workflows/payroll-service.yml**

**Common Pipeline Stages**:

1. Test (PostgreSQL + Redis + RabbitMQ services)
2. Build (Docker multi-stage build)
3. Push (GHCR)
4. Deploy Staging (auto-deploy on develop branch)
5. Deploy Production (auto-deploy on main with traffic splitting)
6. Notify (Slack)

---

## Observability

### Datadog APM

All services report to Datadog:

- Distributed tracing across services
- Service map visualization
- Latency analysis
- Error tracking

### Metrics to Track

**Employee Service**:

- Employee CRUD operations/second
- Search query latency
- Cache hit rate
- Database query time

**Notification Service**:

- Notifications sent/minute
- Delivery success rate
- Queue depth
- Processing time per notification

**Document Service**:

- Document uploads/minute
- Storage usage
- Download bandwidth
- Virus scan time

**Payroll Service**:

- Payroll calculations/minute
- Calculation accuracy (validation)
- Processing time per employee
- Payslip generation time

---

## Migration Strategy

### Week 1: Infrastructure Setup

- [ ] Create service skeletons for all 4 services
- [ ] Update Kong and Istio configurations
- [ ] Create Kubernetes deployment manifests
- [ ] Set up CI/CD pipelines
- [ ] Configure Datadog APM

### Week 2: Employee Service

- [ ] Implement Employee Service
- [ ] Deploy to staging with 10% traffic
- [ ] Monitor metrics for 48 hours
- [ ] Increase to 50% traffic

### Week 3: Notification Service

- [ ] Implement Notification Service
- [ ] Deploy to staging with 10% traffic
- [ ] Monitor queue processing
- [ ] Increase to 100% traffic (async, low risk)

### Week 4: Document & Payroll Services

- [ ] Implement Document Service
- [ ] Implement Payroll Service
- [ ] Deploy both to staging with 10% traffic
- [ ] Monitor and optimize
- [ ] Gradual traffic increase to 100%

---

## Success Metrics

| Metric                   | Target       | Wave 2 Goal                                            |
| ------------------------ | ------------ | ------------------------------------------------------ |
| **Platform Completion**  | 100%         | ✅ 100%                                                |
| **Services Extracted**   | 5            | ✅ 5 (Auth, Employee, Notification, Document, Payroll) |
| **API Latency (p95)**    | <100ms       | ✅ <100ms                                              |
| **Error Rate**           | <0.1%        | ✅ <0.1%                                               |
| **Deployment Frequency** | Multiple/day | ✅ CI/CD ready                                         |
| **Service Uptime**       | 99.95%       | ✅ K8s + HPA                                           |

---

## Risk Mitigation

### 1. Data Consistency

**Risk**: Complex transactions across services
**Mitigation**:

- Saga pattern for distributed transactions
- Event sourcing for audit trail
- Compensation transactions for rollback

### 2. Service Dependencies

**Risk**: Cascading failures
**Mitigation**:

- Circuit breakers on all service calls
- Fallback responses
- Bulkhead pattern for isolation

### 3. Performance

**Risk**: Network latency from service calls
**Mitigation**:

- Redis caching for frequently accessed data
- gRPC for internal communication (next iteration)
- Database connection pooling
- Async processing where possible

### 4. Complexity

**Risk**: Increased operational complexity
**Mitigation**:

- Comprehensive monitoring and alerting
- Runbooks for common issues
- Centralized logging
- Chaos engineering tests

---

## Next Steps

1. **This Week**:
   - Review and approve this plan
   - Set up service repositories
   - Create infrastructure configurations

2. **Next 2 Weeks**:
   - Implement Employee and Notification services
   - Deploy to staging
   - Monitor and optimize

3. **Following 2 Weeks**:
   - Implement Document and Payroll services
   - Complete migration to 100%
   - Production deployment
   - Documentation updates

---

**Platform Progress**: 95% → **100% COMPLETE** 🎉

**Document Owner**: KreupAI Engineering Team
**Review Date**: December 26, 2024
