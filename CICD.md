# CI/CD Pipeline Documentation

Complete guide for the Continuous Integration and Continuous Deployment pipeline for AuraOS.

## Table of Contents

- [Overview](#overview)
- [Pipeline Architecture](#pipeline-architecture)
- [Workflows](#workflows)
- [Setup Instructions](#setup-instructions)
- [Environment Configuration](#environment-configuration)
- [Deployment Strategies](#deployment-strategies)
- [Security](#security)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Overview

AuraOS uses **GitHub Actions** for CI/CD with the following pipelines:

1. **CI Pipeline** - Automated testing and validation on every push/PR
2. **CD Pipeline** - Automated deployment to staging and production
3. **Release Pipeline** - Automated release creation and changelog generation
4. **Security Pipeline** - CodeQL analysis and dependency scanning

### Key Features

- ✅ Automated testing (unit + integration)
- ✅ Lint and format checking
- ✅ Security scanning (CodeQL + dependency review)
- ✅ Docker image building and pushing
- ✅ Automated deployments to staging/production
- ✅ Database migrations
- ✅ Health checks
- ✅ Slack notifications
- ✅ Rollback capabilities

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CODE PUSH / PR                           │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼─────┐  ┌──────▼──────┐  ┌────▼────────┐
│    Lint     │  │   Security  │  │  Unit Tests │
│  & Format   │  │    Audit    │  │             │
└───────┬─────┘  └──────┬──────┘  └────┬────────┘
        │               │               │
        └───────────────┼───────────────┘
                        │
                ┌───────▼────────┐
                │ Integration    │
                │     Tests      │
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │  Build Check   │
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │ Docker Build   │
                └───────┬────────┘
                        │
                   [CI PASSED]
                        │
        ┌───────────────┼───────────────┐
        │               │               │
   [main branch]   [release/*]      [v*.*.* tag]
        │               │               │
┌───────▼─────┐  ┌──────▼──────┐  ┌────▼────────┐
│   Deploy    │  │   Deploy    │  │   Deploy    │
│  to Staging │  │ to Staging  │  │to Production│
└───────┬─────┘  └──────┬──────┘  └────┬────────┘
        │               │               │
┌───────▼─────┐         │        ┌────▼────────┐
│Smoke Tests  │         │        │   Release   │
└─────────────┘         │        │   Notes     │
                        │        └─────────────┘
                        │
                   [DEPLOYED]
```

## Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Jobs:**

#### Lint & Format Check
- Runs ESLint
- TypeScript type checking
- Code formatting verification

#### Unit Tests
- Runs Vitest unit tests
- Generates coverage reports
- Uploads to Codecov

#### Integration Tests
- Spins up PostgreSQL and Redis services
- Runs database migrations
- Executes integration test suite
- Reports coverage

#### Security Audit
- `pnpm audit` for dependency vulnerabilities
- Tenant isolation audit
- Security best practices check

#### Build Verification
- Builds Next.js application
- Verifies build succeeds
- Checks bundle size

#### Docker Build Test
- Builds Docker image
- Verifies image creation
- Uses layer caching

**Duration:** ~10-15 minutes

**Example:**
```bash
# CI runs automatically on push
git push origin feature-branch
# View results at: https://github.com/org/repo/actions
```

### 2. CD Workflow (`.github/workflows/cd.yml`)

**Triggers:**
- Push to `main` branch → Deploy to staging
- Push tags matching `v*.*.*` → Deploy to production

**Jobs:**

#### Build & Push Docker Image
- Multi-stage Docker build
- Pushes to GitHub Container Registry (ghcr.io)
- Creates image attestations
- Tags: branch name, SHA, semver

#### Deploy to Staging
- Pulls latest Docker image
- Updates running containers
- Runs database migrations
- Health check verification
- Slack notification

#### Deploy to Production
- **Requires:** Git tag (e.g., `v1.0.0`)
- Pulls latest Docker image
- Blue-green deployment
- Database migrations
- Health checks
- Creates GitHub release
- Slack notification

#### Smoke Tests
- Runs critical path tests against staging
- Verifies API endpoints
- Checks authentication flows

**Duration:** ~15-25 minutes

**Example:**
```bash
# Deploy to staging
git push origin main

# Deploy to production
git tag v1.0.0
git push origin v1.0.0
```

### 3. Release Workflow (`.github/workflows/release.yml`)

**Triggers:**
- Push tags matching `v*.*.*`

**Jobs:**
- Generates changelog from git commits
- Creates GitHub release
- Marks pre-releases (alpha, beta, rc)
- Notifies team via Slack

**Example:**
```bash
# Create release
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0
```

### 4. CodeQL Analysis (`.github/workflows/codeql.yml`)

**Triggers:**
- Push to `main` or `develop`
- Pull requests
- Scheduled: Daily at 2 AM UTC

**Jobs:**
- Static code analysis
- Security vulnerability detection
- Code quality checks
- SARIF upload to GitHub Security

### 5. Dependency Review (`.github/workflows/dependency-review.yml`)

**Triggers:**
- Pull requests only

**Jobs:**
- Reviews new dependencies
- Checks for known vulnerabilities
- Comments on PR with findings
- Fails on moderate+ severity issues

## Setup Instructions

### 1. Enable GitHub Actions

```bash
# Ensure GitHub Actions is enabled in repository settings
# Settings → Actions → General → Allow all actions
```

### 2. Configure Secrets

Navigate to: **Settings → Secrets and variables → Actions**

**Required Secrets:**

```bash
# Container Registry
GITHUB_TOKEN  # Auto-provided by GitHub

# Deployment
STAGING_HOST=staging.auraos.com
STAGING_USER=deploy
STAGING_SSH_KEY=<private-key>

PRODUCTION_HOST=auraos.com
PRODUCTION_USER=deploy
PRODUCTION_SSH_KEY=<private-key>

# AWS (if using AWS deployment)
AWS_ACCESS_KEY_ID=<access-key>
AWS_SECRET_ACCESS_KEY=<secret-key>
AWS_REGION=us-east-1

# Kubernetes (if using K8s)
KUBECONFIG_STAGING=<staging-kubeconfig-base64>
KUBECONFIG_PRODUCTION=<production-kubeconfig-base64>

# Notifications
SLACK_WEBHOOK=https://hooks.slack.com/services/...

# Optional: Codecov
CODECOV_TOKEN=<codecov-token>
```

**Required Variables:**

```bash
# Deployment target: docker-compose, kubernetes, or aws
DEPLOY_TARGET=docker-compose

# Run migrations on deployment
RUN_MIGRATIONS=true
```

### 3. Configure Branch Protection

Navigate to: **Settings → Branches → Branch protection rules**

**For `main` branch:**
- Require pull request reviews
- Require status checks to pass before merging:
  - ✅ Lint & Format Check
  - ✅ Unit Tests
  - ✅ Integration Tests
  - ✅ Build Verification
  - ✅ Docker Build Test
- Require branches to be up to date
- Include administrators

### 4. Set Up Environments

Navigate to: **Settings → Environments**

**Create environments:**

#### Staging Environment
- **Name:** staging
- **Protection rules:**
  - Required reviewers: 0 (auto-deploy)
- **Environment variables:**
  ```
  URL: https://staging.auraos.com
  ```

#### Production Environment
- **Name:** production
- **Protection rules:**
  - Required reviewers: 2
  - Wait timer: 5 minutes
- **Environment variables:**
  ```
  URL: https://auraos.com
  ```

## Environment Configuration

### Environment Files

Each environment needs proper configuration:

#### Staging (`.env.staging`)
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://staging.auraos.com

DATABASE_URL=postgresql://...staging-db...
REDIS_URL=redis://...staging-redis...

SENTRY_ENVIRONMENT=staging
LOG_LEVEL=debug

# Enable additional logging
RUN_MIGRATIONS=true
SEED_DATABASE=false
```

#### Production (`.env.production`)
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://auraos.com

DATABASE_URL=postgresql://...production-db...
REDIS_URL=redis://...production-redis...

SENTRY_ENVIRONMENT=production
LOG_LEVEL=warn

RUN_MIGRATIONS=true
SEED_DATABASE=false
```

### Database Migrations

Migrations run automatically on deployment if `RUN_MIGRATIONS=true`:

```yaml
- name: Run database migrations
  run: docker compose exec web pnpm --filter @aura/database prisma migrate deploy
```

**Manual migration:**
```bash
# SSH into server
ssh deploy@staging.auraos.com

# Run migrations
cd /opt/auraos
docker compose exec web pnpm --filter @aura/database prisma migrate deploy
```

## Deployment Strategies

### Strategy 1: Docker Compose (Default)

**Best for:**
- Small to medium deployments
- Single server or small cluster
- Cost-effective solutions

**Deployment process:**
```yaml
steps:
  - SSH into server
  - Pull latest Docker image
  - Update containers with zero-downtime
  - Run migrations
  - Health check
```

**Server setup:**
```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com | sh

# Clone repository
git clone https://github.com/org/auraos.git /opt/auraos

# Set up environment
cd /opt/auraos
cp docker/.env.docker .env
nano .env  # Configure

# Initial deployment
docker compose up -d
```

### Strategy 2: Kubernetes

**Best for:**
- Large-scale deployments
- High availability requirements
- Auto-scaling needs

**Deployment process:**
```yaml
steps:
  - Update deployment image
  - Rolling update with zero-downtime
  - Wait for rollout completion
  - Run migrations as Job
  - Health check
```

**Kubernetes manifests:** (See `k8s/` directory)

### Strategy 3: AWS ECS/Fargate

**Best for:**
- AWS-native deployments
- Serverless container hosting
- Managed infrastructure

**Deployment process:**
```yaml
steps:
  - Push image to ECR
  - Update ECS task definition
  - Rolling update service
  - Run migrations via ECS task
  - Health check
```

## Security

### Secrets Management

**Never commit secrets to git!**

```bash
# ✅ Good: Use GitHub Secrets
${{ secrets.DATABASE_URL }}

# ❌ Bad: Hardcode in workflow
DATABASE_URL=postgresql://user:password@...
```

### Docker Image Security

Images are scanned for vulnerabilities:

```yaml
- name: Scan Docker image
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
    format: 'sarif'
    output: 'trivy-results.sarif'
```

### Dependency Scanning

Automated via:
- `pnpm audit` in CI
- Dependabot (GitHub)
- Dependency Review action (PRs)

### CodeQL Analysis

Advanced security scanning:
- Runs on every push
- Scheduled daily scans
- Results in Security tab

## Monitoring

### GitHub Actions Dashboard

View pipeline status:
```
https://github.com/ORG/REPO/actions
```

### Deployment Notifications

Slack notifications for:
- ✅ Successful deployments
- ❌ Failed deployments
- ⚠️ Failed smoke tests

### Metrics to Monitor

1. **Pipeline Success Rate**
   - Target: >95%
   - Alert if: <90%

2. **Deployment Frequency**
   - Target: Multiple per day
   - Track: Main branch commits

3. **Mean Time to Recovery (MTTR)**
   - Target: <30 minutes
   - Track: Time from failure to fix

4. **Build Duration**
   - CI: <15 minutes
   - CD: <25 minutes
   - Alert if exceeding

## Troubleshooting

### Common Issues

#### 1. CI Pipeline Failing

**Symptom:** Tests pass locally but fail in CI

**Solutions:**
```bash
# Check Node version matches CI
node --version  # Should be 20.x

# Run tests with CI environment
NODE_ENV=test pnpm test

# Check for race conditions
pnpm test --run  # Disable watch mode
```

#### 2. Docker Build Fails

**Symptom:** "No space left on device"

**Solutions:**
```bash
# Clean up Docker cache
docker builder prune -a

# Increase GitHub Actions runner disk space
# (Contact GitHub support if persistent)
```

#### 3. Deployment Fails

**Symptom:** Health check fails after deployment

**Solutions:**
```bash
# SSH into server
ssh deploy@staging.auraos.com

# Check logs
cd /opt/auraos
docker compose logs -f web

# Verify environment
docker compose exec web printenv

# Check database connection
docker compose exec web pnpm --filter @aura/database prisma db push --skip-generate
```

#### 4. Migration Fails

**Symptom:** Database migration error during deployment

**Solutions:**
```bash
# Check migration status
docker compose exec web pnpm --filter @aura/database prisma migrate status

# Resolve migration
docker compose exec web pnpm --filter @aura/database prisma migrate resolve

# Re-run deployment
```

### Rollback Procedures

#### Rollback Docker Compose Deployment

```bash
# SSH into server
ssh deploy@production.auraos.com

# Pull previous image version
cd /opt/auraos
docker compose pull web:previous-tag

# Update and restart
docker compose up -d --no-deps web

# Verify
curl https://auraos.com/api/health
```

#### Rollback Kubernetes Deployment

```bash
# View rollout history
kubectl rollout history deployment/auraos-web -n production

# Rollback to previous
kubectl rollout undo deployment/auraos-web -n production

# Or rollback to specific revision
kubectl rollout undo deployment/auraos-web -n production --to-revision=5
```

### Debug Mode

Enable verbose logging in workflows:

```yaml
- name: Debug
  run: |
    set -x  # Enable debug output
    # Your commands here
  env:
    ACTIONS_STEP_DEBUG: true
```

## Best Practices

### 1. Fast Feedback

- Keep CI pipeline under 15 minutes
- Run tests in parallel
- Use caching aggressively

### 2. Fail Fast

- Run fastest checks first (lint before tests)
- Cancel in-progress runs on new push
- Set appropriate timeouts

### 3. Secure by Default

- Use secrets for all sensitive data
- Scan dependencies automatically
- Review security alerts promptly

### 4. Automated Testing

- Maintain >80% code coverage
- Include integration tests
- Run smoke tests post-deployment

### 5. Clear Documentation

- Document all secrets required
- Maintain runbooks for common issues
- Keep this guide updated

## Workflow Triggers Reference

```yaml
# On push to specific branches
on:
  push:
    branches: [main, develop]

# On pull request
on:
  pull_request:
    branches: [main]

# On tag push
on:
  push:
    tags: ['v*.*.*']

# Scheduled (cron)
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM

# Manual trigger
on:
  workflow_dispatch:
```

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**Last Updated:** December 21, 2025
**Maintained by:** DevOps Team
