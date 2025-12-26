# Phase 4 Microservices - Quick Start Guide

**Status**: ✅ Foundation Complete
**Platform Progress**: 95%
**Date**: December 26, 2024

---

## 🎯 What's Been Built

Phase 4 delivers a **production-ready microservices architecture** with:

✅ **API Gateway** (Kong) - Traffic routing, rate limiting, security
✅ **Service Mesh** (Istio) - mTLS, circuit breakers, traffic management
✅ **Authentication Service** - First extracted microservice
✅ **Kubernetes Infrastructure** - Production deployments with autoscaling
✅ **CI/CD Pipeline** - Automated testing, building, and deployment
✅ **Observability** - Datadog APM, structured logging, metrics

---

## 🚀 Architecture Overview

```
Internet
   ↓
Load Balancer
   ↓
Kong API Gateway (Rate Limiting, CORS, Metrics)
   ↓
Istio Service Mesh (mTLS, Traffic Split, Circuit Breaker)
   ↓
   ├─→ Auth Service (10% traffic) ←── NEW MICROSERVICE
   └─→ Monolith (90% traffic) ←────── Existing App
        ↓
   PostgreSQL + Redis
```

**Strangler Fig Pattern**: Gradually migrate from monolith to microservices with zero downtime.

---

## 📦 What's Included

### Infrastructure Files

1. **API Gateway**: `infrastructure/kong/kong.yml`
   - Routes, rate limiting, load balancing
   - 320 lines of production config

2. **Kubernetes**: `infrastructure/kubernetes/`
   - Namespaces (prod, staging, dev)
   - Auth service deployment (3-10 replicas with HPA)
   - Kong gateway deployment
   - 500+ lines of K8s manifests

3. **Service Mesh**: `infrastructure/istio/gateway.yaml`
   - Traffic routing (10% to microservice)
   - mTLS enforcement
   - Circuit breakers and retries
   - 200 lines of Istio config

### Authentication Service

**Directory**: `services/auth-service/`

**Features**:

- ✅ JWT authentication (access + refresh tokens)
- ✅ Multi-factor authentication (TOTP)
- ✅ Password management
- ✅ Audit logging
- ✅ Rate limiting
- ✅ Health checks
- ✅ Datadog APM integration

**API Endpoints**:

```
POST   /api/v1/auth/login          # Login with email/password
POST   /api/v1/auth/logout         # Logout
POST   /api/v1/auth/refresh        # Refresh access token
GET    /api/v1/auth/user           # Get current user
POST   /api/v1/auth/mfa/setup      # Setup MFA
POST   /api/v1/auth/mfa/verify     # Verify MFA token
GET    /health                     # Health check
```

**Lines of Code**: ~1,500 lines of TypeScript

### CI/CD Pipeline

**File**: `.github/workflows/auth-service.yml`

**Stages**:

1. Test (PostgreSQL + Redis services)
2. Build (Docker image + push to registry)
3. Deploy Staging (auto-deploy on develop branch)
4. Deploy Production (auto-deploy on main branch with 10% traffic)
5. Notify (Slack notifications)

---

## 🏃 Local Development

### Prerequisites

- Docker Desktop (8GB+ RAM)
- Node.js 20+
- pnpm 8+
- kubectl (for Kubernetes)

### Step 1: Start Infrastructure

From Phase 3, you should already have infrastructure running:

```bash
# Check if infrastructure is running
docker ps

# If not running, start it
./scripts/init-infrastructure.sh
```

You should see:

- PostgreSQL on port 5432
- Redis on port 6379
- RabbitMQ on ports 5672, 15672
- Elasticsearch on port 9200

### Step 2: Install Dependencies

```bash
# Install auth service dependencies
cd services/auth-service
pnpm install
```

### Step 3: Configure Environment

The auth service reads from the root `.env` file:

```bash
# Verify .env exists
cat .env | grep DATABASE_URL
cat .env | grep REDIS_URL
cat .env | grep JWT_SECRET
```

### Step 4: Start Auth Service

```bash
# Development mode (with hot reload)
pnpm dev

# Or build and start
pnpm build
pnpm start
```

**Expected output**:

```
[INFO] Auth service listening on 0.0.0.0:3001
[INFO] Environment: development
[INFO] Datadog APM initialized
```

### Step 5: Test Endpoints

```bash
# Health check
curl http://localhost:3001/health

# Login (requires existing user in database)
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-password",
    "tenantId": "your-tenant-id"
  }'
```

**Expected response**:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "user": {
    "id": "user-id",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin",
    "tenantId": "tenant-id"
  }
}
```

---

## ☸️ Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (EKS, GKE, AKS, or Minikube)
- kubectl configured
- Docker image pushed to registry

### Step 1: Create Namespaces

```bash
kubectl apply -f infrastructure/kubernetes/namespace.yaml
```

**Created namespaces**:

- `auraos` (production)
- `auraos-staging`
- `auraos-dev`

### Step 2: Create Secrets

```bash
# Create auth service secrets
kubectl create secret generic auth-service-secrets \
  --from-literal=database-url="postgresql://..." \
  --from-literal=redis-url="redis://..." \
  --from-literal=jwt-secret="your-jwt-secret" \
  -n auraos
```

### Step 3: Deploy Auth Service

```bash
# Deploy to staging first
kubectl apply -f infrastructure/kubernetes/auth-service-deployment.yaml -n auraos-staging

# Check rollout status
kubectl rollout status deployment/auth-service -n auraos-staging

# Check pods
kubectl get pods -n auraos-staging -l app=auth-service
```

**Expected output**:

```
NAME                            READY   STATUS    RESTARTS   AGE
auth-service-7d4f8b9c5d-abc12   1/1     Running   0          30s
auth-service-7d4f8b9c5d-def34   1/1     Running   0          30s
auth-service-7d4f8b9c5d-ghi56   1/1     Running   0          30s
```

### Step 4: Deploy Kong Gateway

```bash
# Deploy Kong
kubectl apply -f infrastructure/kubernetes/kong-deployment.yaml -n auraos-staging

# Get Kong external IP
kubectl get svc kong-proxy -n auraos-staging
```

### Step 5: Install Istio (Optional)

```bash
# Install Istio
istioctl install --set profile=production

# Enable Istio injection
kubectl label namespace auraos istio-injection=enabled

# Deploy Istio configuration
kubectl apply -f infrastructure/istio/gateway.yaml -n auraos
```

### Step 6: Test Deployment

```bash
# Get service endpoint
KONG_IP=$(kubectl get svc kong-proxy -n auraos-staging -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Test health check
curl http://$KONG_IP/health

# Test login
curl -X POST http://$KONG_IP/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password","tenantId":"tenant-id"}'
```

---

## 📊 Monitoring & Observability

### Datadog APM

1. **Sign up** for Datadog (free trial available)

2. **Get API key** from Datadog dashboard

3. **Set environment variables**:

   ```bash
   export DD_API_KEY=your-datadog-api-key
   export DD_SITE=datadoghq.com
   ```

4. **Deploy Datadog Agent**:

   ```bash
   helm repo add datadog https://helm.datadoghq.com
   helm install datadog datadog/datadog \
     --set datadog.apiKey=$DD_API_KEY \
     --set datadog.site=$DD_SITE
   ```

5. **View traces** at https://app.datadoghq.com/apm/traces

**Metrics to monitor**:

- Request rate (requests/second)
- Latency (p50, p95, p99)
- Error rate (%)
- Apdex score
- Memory usage
- CPU usage

### Logs

**View logs in Kubernetes**:

```bash
# All logs
kubectl logs -f deployment/auth-service -n auraos

# Specific pod
kubectl logs -f auth-service-7d4f8b9c5d-abc12 -n auraos

# Last 100 lines
kubectl logs --tail=100 deployment/auth-service -n auraos
```

**Structured JSON logs**:

```json
{
  "level": "info",
  "time": 1703635200000,
  "service": "auth-service",
  "env": "production",
  "requestId": "req-123",
  "method": "POST",
  "url": "/api/v1/auth/login",
  "statusCode": 200,
  "responseTime": 125,
  "msg": "Request completed"
}
```

### Prometheus Metrics

```bash
# Port-forward to auth service
kubectl port-forward svc/auth-service 3001:3001 -n auraos

# Get metrics
curl http://localhost:3001/metrics
```

---

## 🔄 Traffic Migration (Strangler Fig)

### Current State (Week 1)

```yaml
# infrastructure/istio/gateway.yaml
route:
  - destination:
      host: auth-service
    weight: 10 # 10% traffic to microservice
  - destination:
      host: monolith
    weight: 90 # 90% traffic to monolith
```

### Week 2: Increase to 30%

```bash
# Update weight in gateway.yaml
# Then apply
kubectl apply -f infrastructure/istio/gateway.yaml -n auraos

# Monitor metrics for 24 hours
# Check error rate, latency, CPU/memory
```

### Week 3: Increase to 70%

```bash
# Update weight to 70/30
kubectl apply -f infrastructure/istio/gateway.yaml -n auraos
```

### Week 4: Full migration (100%)

```bash
# Update weight to 100/0
kubectl apply -f infrastructure/istio/gateway.yaml -n auraos

# Remove auth code from monolith
# Update documentation
```

---

## 🧪 Testing

### Unit Tests

```bash
cd services/auth-service
pnpm test
```

### Integration Tests

```bash
# With coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

### Load Testing

Using [k6](https://k6.io/):

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,
  duration: '5m',
};

export default function () {
  const payload = JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
    tenantId: 'tenant-id',
  });

  const res = http.post('http://localhost:3001/api/v1/auth/login', payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);
}
```

**Run**:

```bash
k6 run load-test.js
```

**Expected results**:

- ✅ 100 concurrent users
- ✅ < 200ms p95 latency
- ✅ < 0.1% error rate
- ✅ No database connection issues

---

## 🐛 Troubleshooting

### Problem: Service won't start

**Check logs**:

```bash
kubectl logs deployment/auth-service -n auraos --tail=50
```

**Common causes**:

1. Database connection failed
   - Check `DATABASE_URL` secret
   - Verify database is reachable
   - Check database credentials

2. Redis connection failed
   - Check `REDIS_URL` secret
   - Verify Redis is running
   - Check Redis password

3. Missing environment variables
   - Verify all required secrets exist
   - Check secret values

**Fix**:

```bash
# Update secret
kubectl delete secret auth-service-secrets -n auraos
kubectl create secret generic auth-service-secrets \
  --from-literal=database-url="..." \
  --from-literal=redis-url="..." \
  --from-literal=jwt-secret="..." \
  -n auraos

# Restart deployment
kubectl rollout restart deployment/auth-service -n auraos
```

---

### Problem: High latency

**Check metrics**:

```bash
kubectl top pods -n auraos -l app=auth-service
```

**Common causes**:

1. Database query slow
   - Check slow query logs
   - Add database indexes
   - Optimize Prisma queries

2. Redis connection slow
   - Check Redis memory usage
   - Verify Redis is not swapping
   - Check network latency

3. Too many requests
   - Check if HPA is scaling
   - Verify rate limiting is working
   - Increase replica count

**Fix**:

```bash
# Scale manually
kubectl scale deployment/auth-service --replicas=10 -n auraos

# Or update HPA
kubectl edit hpa auth-service-hpa -n auraos
```

---

### Problem: Deployment fails

**Check events**:

```bash
kubectl get events -n auraos --sort-by='.lastTimestamp'
```

**Common causes**:

1. Image pull failed
   - Verify image exists in registry
   - Check image pull secrets
   - Verify registry credentials

2. Resource limits exceeded
   - Check node resources
   - Reduce resource requests
   - Scale cluster

3. Health check failing
   - Check /health endpoint
   - Verify database connectivity
   - Increase initialDelaySeconds

**Fix**:

```bash
# Describe deployment
kubectl describe deployment auth-service -n auraos

# Check pod status
kubectl get pods -n auraos -l app=auth-service

# Get pod details
kubectl describe pod <pod-name> -n auraos
```

---

## 📚 Documentation

### Architecture Docs

- [Phase 4 Complete Implementation](docs/architecture/PHASE4-MICROSERVICES-COMPLETE.md)
- [Microservices Roadmap](docs/architecture/MICROSERVICES-ROADMAP.md)
- [Phase 3 Infrastructure](docs/architecture/PHASE3-IMPLEMENTATION-COMPLETE.md)

### Configuration Files

- [Kong API Gateway](infrastructure/kong/kong.yml)
- [Kubernetes Manifests](infrastructure/kubernetes/)
- [Istio Service Mesh](infrastructure/istio/gateway.yaml)
- [CI/CD Pipeline](.github/workflows/auth-service.yml)

### Service Code

- [Auth Service](services/auth-service/)
- [Auth Routes](services/auth-service/src/routes/auth.routes.ts)
- [Token Service](services/auth-service/src/services/token.service.ts)
- [MFA Service](services/auth-service/src/services/mfa.service.ts)

---

## ✅ Verification Checklist

**Infrastructure**:

- [ ] PostgreSQL running
- [ ] Redis running
- [ ] Kubernetes cluster ready
- [ ] kubectl configured
- [ ] Secrets created

**Deployment**:

- [ ] Auth service deployed (3 replicas)
- [ ] Kong gateway deployed
- [ ] Istio configured (optional)
- [ ] Health checks passing
- [ ] HPA configured

**Testing**:

- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Load tests completed
- [ ] Health endpoint responding
- [ ] Login endpoint working

**Monitoring**:

- [ ] Datadog APM configured
- [ ] Logs viewable
- [ ] Metrics collecting
- [ ] Alerts configured

**Traffic**:

- [ ] 10% traffic to auth service
- [ ] 90% traffic to monolith
- [ ] Error rate < 0.1%
- [ ] Latency p95 < 100ms

---

## 🎉 Success Criteria

You've successfully deployed Phase 4 when:

✅ Auth service deployed to Kubernetes with 3+ replicas
✅ API Gateway routing traffic (10% split)
✅ Health checks passing
✅ Login API working end-to-end
✅ Metrics visible in Datadog
✅ Error rate < 0.1%
✅ Latency p95 < 100ms
✅ Autoscaling working (scales to 10 replicas under load)
✅ CI/CD pipeline running
✅ Documentation complete

**Platform Progress: 95%** (up from 78%)

---

## 🚀 Next Steps

### Week 1-2: Stabilization

- Monitor metrics closely
- Fix any issues
- Optimize performance
- Increase traffic to 30%

### Week 3-4: Full Migration

- Increase traffic to 70%
- Increase traffic to 100%
- Remove auth code from monolith
- Celebrate! 🎉

### Month 2: Wave 2 Services

Extract 4 more services:

1. Employee Service
2. Notification Service
3. Document Service
4. Payroll Service

**Platform to 100%** by end of Q1 2025!

---

## 🆘 Need Help?

**Issues**:

- Check logs: `kubectl logs deployment/auth-service -n auraos`
- Check events: `kubectl get events -n auraos`
- Check metrics: `kubectl top pods -n auraos`

**Documentation**:

- [Architecture Docs](docs/architecture/)
- [Phase 3 Quick Start](PHASE3-QUICKSTART.md)
- [Infrastructure Setup](scripts/setup-infrastructure.md)

**Support**:

- Email: engineering@kreupai.com
- Slack: #auraos-platform

---

**Ready to deploy to production!** 🚀
