# Docker Deployment Guide

Complete guide for deploying AuraOS using Docker and Docker Compose.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Services](#services)
- [Development](#development)
- [Production](#production)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Overview

AuraOS uses a multi-container Docker setup with:

- **Web Application** (Next.js) - Main application server
- **PostgreSQL** - Primary database
- **Redis** - Caching layer
- **Nginx** (Optional) - Reverse proxy for production
- **PgAdmin** (Optional) - Database management tool
- **Redis Commander** (Optional) - Redis management tool

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Nginx (Optional)                      │
│              Reverse Proxy + SSL Termination            │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  Next.js Application                     │
│                  (Port 3000)                             │
└───────────┬─────────────────────┬───────────────────────┘
            │                     │
    ┌───────▼────────┐    ┌──────▼─────────┐
    │   PostgreSQL   │    │     Redis      │
    │   (Port 5432)  │    │  (Port 6379)   │
    └────────────────┘    └────────────────┘
```

## Prerequisites

### Required

- **Docker**: Version 20.10+ ([Install Docker](https://docs.docker.com/get-docker/))
- **Docker Compose**: Version 2.0+ ([Install Docker Compose](https://docs.docker.com/compose/install/))
- **Minimum Resources**:
  - 4GB RAM
  - 2 CPU cores
  - 10GB disk space

### Recommended (Production)

- 8GB+ RAM
- 4+ CPU cores
- 50GB+ SSD storage
- Dedicated server or VPS

### Verify Installation

```bash
# Check Docker version
docker --version
# Docker version 24.0.0 or higher

# Check Docker Compose version
docker compose version
# Docker Compose version v2.20.0 or higher

# Check Docker is running
docker ps
```

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/your-org/auraos.git
cd auraos
```

### 2. Configure Environment

```bash
# Copy environment template
cp docker/.env.docker .env

# Edit environment variables
nano .env
```

**Minimum Required Changes:**
```bash
# Update these values in .env
POSTGRES_PASSWORD=your_secure_password_here
REDIS_PASSWORD=your_secure_redis_password_here
JWT_SECRET=your_very_long_random_secret_at_least_32_characters
```

### 3. Start Services

```bash
# Build and start all services
docker compose up -d

# View logs
docker compose logs -f

# Check service status
docker compose ps
```

### 4. Verify Deployment

```bash
# Check health
curl http://localhost:3000/api/health

# Expected response:
# {
#   "status": "healthy",
#   "checks": {
#     "database": { "status": "healthy" },
#     "cache": { "status": "healthy" }
#   }
# }
```

### 5. Access Application

- **Web Application**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/api/health

## Configuration

### Environment Variables

See [docker/.env.docker](docker/.env.docker) for complete configuration template.

#### Critical Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@postgres:5432/dbname
POSTGRES_PASSWORD=secure_password

# Redis
REDIS_URL=redis://:password@redis:6379
REDIS_PASSWORD=secure_password

# Authentication
JWT_SECRET=minimum_32_character_random_string
JWT_EXPIRES_IN=1h

# Application
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

#### Optional Variables

```bash
# Monitoring
SENTRY_DSN=https://...
LOG_LEVEL=info

# Startup
RUN_MIGRATIONS=true
SEED_DATABASE=false

# Feature Flags
ENABLE_SIGNUP=false
ENABLE_MFA=true
```

### Port Mappings

Default ports (customize in `.env`):

| Service          | Internal | External | Environment Variable      |
|------------------|----------|----------|---------------------------|
| Web Application  | 3000     | 3000     | `WEB_PORT`                |
| PostgreSQL       | 5432     | 5432     | `POSTGRES_PORT`           |
| Redis            | 6379     | 6379     | `REDIS_PORT`              |
| Nginx HTTP       | 80       | 80       | `NGINX_HTTP_PORT`         |
| Nginx HTTPS      | 443      | 443      | `NGINX_HTTPS_PORT`        |
| PgAdmin          | 80       | 5050     | `PGADMIN_PORT`            |
| Redis Commander  | 8081     | 8081     | `REDIS_COMMANDER_PORT`    |

## Services

### Web Application

The main Next.js application server.

**Features:**
- Multi-stage build for optimization
- Non-root user for security
- Automatic database migrations
- Health checks
- Graceful shutdown

**Start/Stop:**
```bash
# Start
docker compose up -d web

# Stop
docker compose stop web

# Restart
docker compose restart web

# View logs
docker compose logs -f web
```

### PostgreSQL Database

Primary data storage.

**Data Persistence:**
```bash
# Data stored in named volume
docker volume ls | grep postgres

# Backup database
docker compose exec postgres pg_dump -U auraos auraos > backup.sql

# Restore database
docker compose exec -T postgres psql -U auraos auraos < backup.sql
```

**Access Database:**
```bash
# Connect to PostgreSQL
docker compose exec postgres psql -U auraos -d auraos

# Or use PgAdmin (development)
docker compose --profile dev up -d pgadmin
# Access at http://localhost:5050
```

### Redis Cache

Caching and session storage.

**Data Persistence:**
```bash
# Data stored in named volume with AOF
docker volume ls | grep redis

# Flush all cache
docker compose exec redis redis-cli -a your_redis_password FLUSHALL

# Monitor Redis
docker compose exec redis redis-cli -a your_redis_password MONITOR
```

**Access Redis:**
```bash
# Connect to Redis CLI
docker compose exec redis redis-cli -a your_redis_password

# Or use Redis Commander (development)
docker compose --profile dev up -d redis-commander
# Access at http://localhost:8081
```

### Nginx (Production)

Reverse proxy with SSL termination.

**Enable Nginx:**
```bash
# Start with Nginx profile
docker compose --profile production up -d
```

**SSL Certificates:**
```bash
# Mount your SSL certificates
mkdir -p docker/nginx/ssl
cp your-cert.pem docker/nginx/ssl/fullchain.pem
cp your-key.pem docker/nginx/ssl/privkey.pem

# Restart nginx
docker compose restart nginx
```

## Development

### Development Mode

Run with development tools:

```bash
# Start all services including dev tools
docker compose --profile dev up -d

# Services available:
# - Web: http://localhost:3000
# - PgAdmin: http://localhost:5050
# - Redis Commander: http://localhost:8081
```

### Hot Reload

For development with hot-reload, uncomment volume mounts in `docker-compose.yml`:

```yaml
services:
  web:
    volumes:
      - ./apps/web:/app/apps/web
      - /app/apps/web/node_modules
      - /app/apps/web/.next
```

Then restart:
```bash
docker compose up -d web
```

### Running Commands

```bash
# Run Prisma migrations
docker compose exec web pnpm --filter @aura/database prisma migrate dev

# Run database seed
docker compose exec web pnpm --filter @aura/database prisma db seed

# Open Prisma Studio
docker compose exec web pnpm --filter @aura/database prisma studio

# Run tests
docker compose exec web pnpm --filter web test

# Generate Prisma client
docker compose exec web pnpm --filter @aura/database prisma generate
```

### Development Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "docker:dev": "docker compose --profile dev up -d",
    "docker:logs": "docker compose logs -f",
    "docker:down": "docker compose down",
    "docker:clean": "docker compose down -v"
  }
}
```

## Production

### Production Deployment

#### 1. Prepare Environment

```bash
# Create production .env
cp docker/.env.docker .env.production

# Update with production values
nano .env.production
```

**Critical Production Settings:**
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Strong passwords
POSTGRES_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)

# Disable dev features
ENABLE_SIGNUP=false
SEED_DATABASE=false

# Enable monitoring
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=warn
```

#### 2. Build Images

```bash
# Build production images
docker compose -f docker-compose.yml --env-file .env.production build

# Or pull pre-built images
# docker pull your-registry/auraos:latest
```

#### 3. Deploy

```bash
# Start with production profile
docker compose \
  -f docker-compose.yml \
  --env-file .env.production \
  --profile production \
  up -d

# Verify
docker compose ps
docker compose logs -f web
```

#### 4. SSL Setup

```bash
# Option 1: Let's Encrypt with Certbot
docker run -it --rm \
  -v $(pwd)/docker/nginx/ssl:/etc/letsencrypt \
  certbot/certbot certonly \
  --webroot -w /var/www/certbot \
  -d your-domain.com

# Option 2: Upload existing certificates
cp fullchain.pem docker/nginx/ssl/
cp privkey.pem docker/nginx/ssl/

# Restart nginx
docker compose restart nginx
```

### Scaling

#### Horizontal Scaling

```bash
# Scale web application
docker compose up -d --scale web=3

# Update nginx upstream in nginx.conf
upstream auraos_backend {
    least_conn;
    server web_1:3000;
    server web_2:3000;
    server web_3:3000;
}
```

#### Resource Limits

Add to `docker-compose.yml`:

```yaml
services:
  web:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### High Availability

#### Database Replication

```yaml
services:
  postgres-replica:
    image: postgres:16-alpine
    environment:
      POSTGRES_REPLICATION_MODE: slave
      POSTGRES_MASTER_SERVICE: postgres
    # Configure replication
```

#### Redis Cluster

```yaml
services:
  redis-1:
    image: redis:7-alpine
    command: redis-server --cluster-enabled yes

  redis-2:
    image: redis:7-alpine
    command: redis-server --cluster-enabled yes
```

## Monitoring

### Health Checks

```bash
# Check all services
curl http://localhost:3000/api/health

# Check specific service
docker compose exec web curl localhost:3000/api/health

# View health status
docker compose ps
```

### Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f web

# Last 100 lines
docker compose logs --tail=100 web

# Since timestamp
docker compose logs --since=2023-01-01T00:00:00 web
```

### Resource Usage

```bash
# View resource usage
docker stats

# Specific container
docker stats auraos-web

# Export metrics
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

### Query Performance

```bash
# Access monitoring endpoint (requires auth)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/monitoring/queries
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in .env
WEB_PORT=3001
```

#### 2. Database Connection Failed

```bash
# Check if PostgreSQL is running
docker compose ps postgres

# Check logs
docker compose logs postgres

# Restart database
docker compose restart postgres

# Verify connection
docker compose exec postgres pg_isready -U auraos
```

#### 3. Redis Connection Failed

```bash
# Check if Redis is running
docker compose ps redis

# Test connection
docker compose exec redis redis-cli -a $REDIS_PASSWORD ping
# Expected: PONG

# Restart Redis
docker compose restart redis
```

#### 4. Build Failures

```bash
# Clear Docker build cache
docker builder prune -a

# Rebuild from scratch
docker compose build --no-cache

# Check disk space
df -h
```

#### 5. Migration Failures

```bash
# Run migrations manually
docker compose exec web \
  pnpm --filter @aura/database prisma migrate deploy

# Reset database (CAUTION: deletes data)
docker compose exec web \
  pnpm --filter @aura/database prisma migrate reset
```

#### 6. Permission Issues

```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Fix Docker socket permissions
sudo chmod 666 /var/run/docker.sock
```

### Debug Mode

Enable debug logging:

```bash
# Set in .env
LOG_LEVEL=debug
NODE_ENV=development

# Restart
docker compose restart web

# View detailed logs
docker compose logs -f web
```

### Shell Access

```bash
# Access container shell
docker compose exec web sh

# Run commands inside container
docker compose exec web pnpm --filter web test
docker compose exec web node --version
docker compose exec web prisma --version
```

## Best Practices

### Security

1. **Use Strong Secrets**
   ```bash
   # Generate secure secrets
   JWT_SECRET=$(openssl rand -base64 64)
   POSTGRES_PASSWORD=$(openssl rand -base64 32)
   ```

2. **Don't Commit Secrets**
   ```bash
   # Add to .gitignore
   .env
   .env.local
   .env.production
   ```

3. **Use Non-Root User**
   - Already configured in Dockerfile
   - Runs as user `nextjs` (uid 1001)

4. **Enable SSL**
   - Use Nginx with SSL certificates
   - Force HTTPS redirects

5. **Limit Network Exposure**
   ```yaml
   services:
     postgres:
       ports:
         - "127.0.0.1:5432:5432"  # Only localhost
   ```

### Performance

1. **Use Multi-Stage Builds**
   - Already implemented in Dockerfile
   - Reduces image size by ~70%

2. **Layer Caching**
   ```dockerfile
   # Copy package files first (cached)
   COPY package.json pnpm-lock.yaml ./
   RUN pnpm install

   # Then copy source (invalidates less often)
   COPY . .
   ```

3. **Resource Limits**
   ```yaml
   deploy:
     resources:
       limits:
         memory: 2G
         cpus: '2'
   ```

4. **Use .dockerignore**
   - Exclude unnecessary files
   - Speeds up builds

### Maintenance

1. **Regular Backups**
   ```bash
   # Automated backup script
   #!/bin/bash
   docker compose exec postgres pg_dump -U auraos auraos \
     | gzip > backup-$(date +%Y%m%d).sql.gz
   ```

2. **Update Images**
   ```bash
   # Pull latest images
   docker compose pull

   # Rebuild and restart
   docker compose up -d --build
   ```

3. **Clean Up**
   ```bash
   # Remove unused images
   docker image prune -a

   # Remove unused volumes
   docker volume prune

   # Remove unused networks
   docker network prune
   ```

4. **Monitor Disk Usage**
   ```bash
   # Check Docker disk usage
   docker system df

   # Detailed usage
   docker system df -v
   ```

### CI/CD Integration

```yaml
# .github/workflows/docker.yml
name: Docker Build and Push

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: docker compose build

      - name: Run tests
        run: docker compose run web pnpm test

      - name: Push to registry
        run: docker compose push
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Docker Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)

---

**Last Updated:** December 21, 2025
**Docker Version:** 24.0+
**Docker Compose Version:** 2.20+
