# Infrastructure Setup Guide

This guide walks you through setting up the complete AuraOS infrastructure for local development.

## Prerequisites

- Docker Desktop installed and running
- Node.js 20+ installed
- pnpm installed (`npm install -g pnpm`)
- Git installed
- 8GB+ RAM available for Docker

## Quick Start (5 minutes)

```bash
# 1. Clone repository (if not already done)
git clone <repository-url>
cd KreupAI.AuraOS

# 2. Install dependencies
pnpm install

# 3. Copy environment file
cp .env.example .env

# 4. Start infrastructure services
./scripts/init-infrastructure.sh

# 5. Run database migrations
pnpm prisma migrate dev

# 6. Generate Prisma client
pnpm prisma generate

# 7. Start development server
pnpm dev
```

Your app will be available at http://localhost:3006

## Infrastructure Services

### 1. PostgreSQL Database

**Connection Details:**
- Host: `localhost`
- Port: `5432`
- Database: `auraos_dev`
- Username: `auraos`
- Password: `auraos_dev_2024`

**Access via Adminer:**
- URL: http://localhost:8080
- System: PostgreSQL
- Server: `postgres`
- Username: `auraos`
- Password: `auraos_dev_2024`
- Database: `auraos_dev`

**Commands:**
```bash
# Connect via psql
psql -h localhost -p 5432 -U auraos -d auraos_dev

# Run migrations
pnpm prisma migrate dev

# Reset database
pnpm prisma migrate reset

# Open Prisma Studio
pnpm prisma studio
```

---

### 2. Redis Cache

**Connection Details:**
- Host: `localhost`
- Port: `6379`
- Password: `auraos_redis_2024`

**Commands:**
```bash
# Connect via redis-cli
docker exec -it auraos-redis redis-cli -a auraos_redis_2024

# Common commands
SET key "value"
GET key
KEYS *
FLUSHALL
```

**Usage in Code:**
```typescript
import { createClient } from 'redis';

const redis = createClient({
  url: 'redis://localhost:6379',
  password: 'auraos_redis_2024'
});

await redis.connect();
await redis.set('key', 'value');
const value = await redis.get('key');
```

---

### 3. RabbitMQ Message Queue

**Connection Details:**
- AMQP Port: `5672`
- Management UI: http://localhost:15672
- Username: `auraos`
- Password: `auraos_rabbit_2024`
- Virtual Host: `/auraos`

**Management UI Features:**
- View queues and exchanges
- Monitor message rates
- Inspect messages
- View connections and channels

**Usage in Code:**
```typescript
import { getQueueManager } from '@aura/messaging';
import { EmailQueueService } from '@aura/messaging';

// Initialize
const queueManager = getQueueManager();
await queueManager.connect();

// Queue an email
const emailService = new EmailQueueService();
await emailService.queueWelcomeEmail(
  'tenant-123',
  'user@example.com',
  'John Doe',
  'temp-password'
);
```

---

### 4. Elasticsearch + Kibana

**Elasticsearch:**
- URL: http://localhost:9200
- No authentication in development

**Kibana:**
- URL: http://localhost:5601
- Dev Tools: http://localhost:5601/app/dev_tools#/console

**Useful Kibana Features:**
- Dev Tools Console for testing queries
- Index Management
- Discover for exploring data
- Dashboard for visualizations

**Usage in Code:**
```typescript
import { getSearchClient } from '@aura/search';

const searchClient = getSearchClient();
await searchClient.connect();

// Index a document
await searchClient.indexDocument('aura_employees', 'emp-123', {
  tenantId: 'tenant-123',
  employeeId: 'emp-123',
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  department: 'Engineering'
});

// Search
const results = await searchClient.search('aura_employees', {
  tenantId: 'tenant-123',
  query: 'john',
  size: 10
});
```

---

## Service Management

### Start All Services

```bash
./scripts/init-infrastructure.sh
```

### Stop All Services

```bash
docker-compose -f docker-compose.infrastructure.yml down
```

### Stop and Remove Volumes (Clean Slate)

```bash
docker-compose -f docker-compose.infrastructure.yml down -v
```

### View Service Logs

```bash
# All services
docker-compose -f docker-compose.infrastructure.yml logs -f

# Specific service
docker-compose -f docker-compose.infrastructure.yml logs -f postgres
docker-compose -f docker-compose.infrastructure.yml logs -f rabbitmq
docker-compose -f docker-compose.infrastructure.yml logs -f elasticsearch
```

### Check Service Status

```bash
docker-compose -f docker-compose.infrastructure.yml ps
```

### Restart a Service

```bash
docker-compose -f docker-compose.infrastructure.yml restart postgres
docker-compose -f docker-compose.infrastructure.yml restart rabbitmq
```

---

## Troubleshooting

### PostgreSQL Connection Issues

**Problem:** Can't connect to PostgreSQL

**Solution:**
```bash
# Check if container is running
docker ps | grep auraos-postgres

# Check logs
docker logs auraos-postgres

# Restart container
docker-compose -f docker-compose.infrastructure.yml restart postgres
```

---

### RabbitMQ Connection Issues

**Problem:** Can't connect to RabbitMQ

**Solution:**
```bash
# Check health
docker exec auraos-rabbitmq rabbitmq-diagnostics ping

# Check logs
docker logs auraos-rabbitmq

# Check if port 5672 is available
lsof -i :5672
```

---

### Elasticsearch Connection Issues

**Problem:** Elasticsearch not responding

**Solution:**
```bash
# Check cluster health
curl http://localhost:9200/_cluster/health?pretty

# Check logs
docker logs auraos-elasticsearch

# Increase Docker memory to at least 4GB
```

---

### Port Conflicts

**Problem:** Port already in use

**Solution:**
```bash
# Find process using port
lsof -i :<port_number>

# Kill process
kill -9 <PID>

# Or change port in docker-compose.infrastructure.yml
```

---

### Docker Out of Memory

**Problem:** Services crashing due to memory

**Solution:**
1. Open Docker Desktop
2. Settings → Resources
3. Increase Memory to at least 8GB
4. Apply & Restart

---

## Production Deployment

For production deployment, see:
- [AWS Deployment Guide](./deploy-aws.md)
- [Kubernetes Deployment Guide](./deploy-kubernetes.md)
- [Security Hardening Guide](./security-hardening.md)

**Key Differences:**
- Use managed services (RDS, ElastiCache, Amazon MQ, OpenSearch)
- Enable SSL/TLS for all connections
- Use secrets management (AWS Secrets Manager, Vault)
- Configure proper backup strategies
- Set up monitoring and alerting
- Enable audit logging
- Configure auto-scaling

---

## Environment Variables

See [.env.example](./.env.example) for all available configuration options.

**Critical Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `RABBITMQ_HOST` - RabbitMQ host
- `ELASTICSEARCH_NODE` - Elasticsearch URL
- `JWT_SECRET` - Must be changed in production
- `ENCRYPTION_KEY` - Must be changed in production

---

## Health Checks

```bash
# PostgreSQL
psql -h localhost -p 5432 -U auraos -d auraos_dev -c "SELECT 1"

# Redis
docker exec auraos-redis redis-cli -a auraos_redis_2024 ping

# RabbitMQ
curl -u auraos:auraos_rabbit_2024 http://localhost:15672/api/healthchecks/node

# Elasticsearch
curl http://localhost:9200/_cluster/health
```

---

## Next Steps

1. Review [Architecture Documentation](../docs/architecture/PHASE3-IMPLEMENTATION-COMPLETE.md)
2. Explore [API Documentation](../docs/API-DOCUMENTATION.md)
3. Read [Development Guide](../docs/DEVELOPMENT-GUIDE.md)
4. Check [Testing Guide](../docs/TESTING-GUIDE.md)

---

**Need Help?**

- Check logs: `docker-compose -f docker-compose.infrastructure.yml logs -f`
- Review documentation: `docs/`
- Open an issue on GitHub

**Support:**
- Email: engineering@kreupai.com
- Slack: #auraos-platform
