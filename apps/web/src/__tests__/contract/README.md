# Contract Testing & API Testing Suite

Comprehensive contract testing suite for AuraOS HCM Platform using Pact for consumer-driven contract testing, ensuring API compatibility between microservices.

## 📋 Table of Contents

- [Overview](#overview)
- [What is Contract Testing](#what-is-contract-testing)
- [Test Coverage](#test-coverage)
- [Tools Used](#tools-used)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Pact Broker](#pact-broker)
- [Publishing Contracts](#publishing-contracts)
- [Can-I-Deploy](#can-i-deploy)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This contract testing suite provides automated API contract testing for the AuraOS HCM platform microservices:

- **Consumer-Driven Contracts**: Web client defines expectations
- **Provider Verification**: Services verify they meet expectations
- **Pact Broker**: Centralized contract management
- **Can-I-Deploy**: Deployment safety checks
- **Automated CI/CD**: Contract testing in every build

### Benefits

1. **Early Detection**: Find API incompatibilities before deployment
2. **Independent Deployment**: Deploy services independently with confidence
3. **Living Documentation**: Contracts serve as up-to-date API documentation
4. **Backwards Compatibility**: Ensure new versions don't break existing clients
5. **Faster Feedback**: Test integrations without spinning up all services

## 📚 What is Contract Testing

### Consumer-Driven Contract Testing

Consumer-driven contract testing ensures that a provider service (API) meets the expectations of its consumer (client). Instead of testing the entire system integration:

1. **Consumer** defines expectations (pact) of what the provider should return
2. **Pact Broker** stores these contracts
3. **Provider** verifies it can meet these expectations
4. **Can-I-Deploy** checks if versions are compatible before deployment

### Pact vs Integration Testing

| Aspect | Integration Tests | Contract Tests |
|--------|------------------|----------------|
| Speed | Slow (requires all services) | Fast (isolated) |
| Flakiness | High (network, dependencies) | Low (isolated) |
| Feedback | Late (during integration) | Early (during development) |
| Maintenance | High (brittle) | Low (focused) |
| Coverage | Full system paths | API contracts only |

**Use both**: Contract tests for API compatibility, integration tests for business flows.

## 📊 Test Coverage

### 1. Consumer Contract Tests

**Consumer**: `web-client`
**Providers**: `employee-service`, `payroll-service`, `leave-service`, `attendance-service`

✅ **Employee API Consumer Tests** ([employee-api.consumer.test.ts](consumer/employee-api.consumer.test.ts:1))
- GET /api/v1/employees (list, pagination, filtering, search)
- GET /api/v1/employees/:id (single employee, not found)
- POST /api/v1/employees (create, validation, permissions)
- PUT /api/v1/employees/:id (update)
- DELETE /api/v1/employees/:id (delete, not found)

✅ **Payroll API Consumer Tests** ([payroll-api.consumer.test.ts](consumer/payroll-api.consumer.test.ts:1))
- GET /api/v1/payroll/payslips (list, filtering by employee/month)
- GET /api/v1/payroll/payslips/:id (single payslip)
- POST /api/v1/payroll/runs (initiate payroll, permissions)
- GET /api/v1/payroll/runs/:id (payroll run details)
- POST /api/v1/payroll/payslips/:id/download (PDF generation)

### 2. Provider Verification Tests

✅ **Employee Service Provider Tests** ([employee-api.provider.test.ts](provider/employee-api.provider.test.ts:1))
- Verifies all consumer expectations
- State handlers for test data setup
- Authentication handling
- Error response verification

### 3. Contract Specifications

All contracts use **Pact Specification V3** with:
- Type matchers (integer, string, boolean, datetime)
- Array matchers (eachLike for lists)
- Object matchers (like for objects)
- Regex matchers (for specific patterns)
- Provider states for test setup

## 🛠️ Tools Used

### Primary Tools

| Tool | Purpose | Version |
|------|---------|---------|
| **Pact** | Consumer-driven contract testing | 11.0+ |
| **Pact Broker** | Contract management & versioning | Latest |
| **@pact-foundation/pact** | Pact Node.js library | 11.0+ |
| **Jest** | Test runner | 29.0+ |

### Supporting Tools

- **Docker Compose**: Pact Broker infrastructure
- **PostgreSQL**: Pact Broker database
- **Node.js**: Runtime environment

## 🚀 Setup

### Prerequisites

```bash
# Install dependencies
pnpm install

# Install Pact CLI globally
npm install -g @pact-foundation/pact-node

# Start Pact Broker (Docker)
docker-compose -f docker-compose.pact.yml up -d
```

### Environment Variables

Create a `.env.pact` file:

```bash
# Pact Broker Configuration
PACT_BROKER_URL=http://localhost:9292
PACT_BROKER_USERNAME=pactbroker
PACT_BROKER_PASSWORD=pactbroker
PACT_BROKER_TOKEN=

# Provider Configuration
API_PORT=3006
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/auraos_test

# Git Information (for versioning)
GIT_COMMIT=$(git rev-parse --short HEAD)
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
```

### Pact Broker Setup

```bash
# Start Pact Broker with Docker Compose
docker-compose -f docker-compose.pact.yml up -d

# Wait for Pact Broker to be ready
curl --retry 10 --retry-delay 5 http://localhost:9292/diagnostic/status/heartbeat

# Access Pact Broker UI
open http://localhost:9292

# Default credentials
# Username: pactbroker
# Password: pactbroker
```

## 🧪 Running Tests

### Run Consumer Contract Tests

```bash
# Run all consumer tests
pnpm test:pact:consumer

# Run specific consumer test
pnpm test apps/web/src/__tests__/contract/consumer/employee-api.consumer.test.ts

# Run with debug logging
DEBUG=pact* pnpm test:pact:consumer
```

**What happens:**
1. Consumer tests define expected interactions
2. Pact mock server simulates provider responses
3. Consumer code makes requests to mock server
4. Pact validates requests match expectations
5. Pact files (.json) generated in `pacts/` directory

### Run Provider Verification Tests

```bash
# Start your application first
pnpm dev

# In another terminal, run provider tests
pnpm test:pact:provider

# Run specific provider test
pnpm test apps/web/src/__tests__/contract/provider/employee-api.provider.test.ts

# Run with debug logging
DEBUG=pact* pnpm test:pact:provider
```

**What happens:**
1. Provider verification reads contracts from Pact Broker
2. Sets up provider states (test data)
3. Makes real requests to running provider
4. Validates responses match consumer expectations
5. Publishes verification results to Pact Broker

### Run All Contract Tests

```bash
# Start application
pnpm dev &

# Wait for startup
sleep 30

# Run consumer tests
pnpm test:pact:consumer

# Publish contracts
./scripts/pact-publish.sh

# Run provider verification
pnpm test:pact:provider

# Check can-i-deploy
./scripts/pact-can-i-deploy.sh web-client
```

## 📦 Pact Broker

### Accessing Pact Broker

```bash
# Local URL
http://localhost:9292

# Authentication
Username: pactbroker
Password: pactbroker
```

### Pact Broker Features

✅ **Contract Storage**: Store all consumer-provider contracts
✅ **Version Management**: Track contract versions over time
✅ **Verification Results**: View provider verification status
✅ **Can-I-Deploy**: Check deployment safety
✅ **Webhooks**: Trigger CI/CD on contract changes
✅ **Network Diagram**: Visualize service dependencies
✅ **Matrix**: View compatibility matrix

### Viewing Contracts

Navigate to Pact Broker UI:

1. **Pacticipants**: All services (consumers & providers)
2. **web-client → employee-service**: View contract
3. **Latest Pact**: See latest contract version
4. **Verification Results**: Provider verification status
5. **Matrix**: Compatibility between versions

## 📤 Publishing Contracts

### Manual Publishing

```bash
# Publish consumer contracts
./scripts/pact-publish.sh [version] [branch]

# Examples
./scripts/pact-publish.sh 1.0.0 main
./scripts/pact-publish.sh $(git rev-parse --short HEAD) feature/new-api
```

### Automatic Publishing (CI)

Contracts are automatically published on:
- ✅ Push to `main` branch
- ✅ Push to `develop` branch
- ✅ After successful consumer tests

### Version Tagging

Contracts are tagged with:
- **Version**: Git commit SHA or semantic version
- **Branch**: Git branch name (e.g., `main`, `develop`)
- **Latest**: Always tagged as `latest`
- **Production**: Tagged when deployed to production

## ✅ Can-I-Deploy

### What is Can-I-Deploy?

`can-i-deploy` checks if a version is safe to deploy based on contract verification status.

**It checks:**
- Are all consumer contracts verified?
- Are all provider contracts satisfied?
- Are dependencies deployed/released?

### Running Can-I-Deploy

```bash
# Check if web-client can be deployed
./scripts/pact-can-i-deploy.sh web-client [version] [environment]

# Examples
./scripts/pact-can-i-deploy.sh web-client 1.0.0 production
./scripts/pact-can-i-deploy.sh web-client $(git rev-parse --short HEAD) staging

# Check if employee-service can be deployed
./scripts/pact-can-i-deploy.sh employee-service 1.0.0 production
```

### Interpreting Results

**✅ Safe to Deploy**:
```
✓ SAFE TO DEPLOY
web-client version 1.0.0 can be safely deployed to production
All provider contracts are verified and compatible.
```

**❌ Not Safe to Deploy**:
```
✗ NOT SAFE TO DEPLOY
web-client version 1.0.0 cannot be deployed to production

Reasons this might fail:
1. Provider has not verified the contract yet
2. Provider verification failed
3. Breaking changes in the contract
4. Provider version not deployed to environment
```

### Can-I-Deploy in CI/CD

```yaml
- name: Check deployment safety
  run: ./scripts/pact-can-i-deploy.sh web-client ${{ github.sha }} production

- name: Deploy only if safe
  if: success()
  run: ./deploy.sh
```

## 🔄 CI/CD Integration

### GitHub Actions

Workflow file: [.github/workflows/contract-tests.yml](../../../../../.github/workflows/contract-tests.yml:1)

**Jobs:**
1. **consumer-tests**: Run consumer contract tests
2. **provider-tests-employee**: Verify employee service
3. **can-i-deploy-check**: Check deployment safety
4. **contract-summary**: Generate test summary

**Triggers:**
- ✅ Push to `main`/`develop`
- ✅ Pull requests
- ✅ Manual dispatch

### Workflow Steps

```yaml
1. Consumer Tests
   ├─ Run consumer contract tests
   ├─ Generate pact files
   └─ Publish to Pact Broker

2. Provider Verification
   ├─ Download contracts from broker
   ├─ Start provider service
   ├─ Verify contracts
   └─ Publish verification results

3. Can-I-Deploy
   ├─ Check web-client compatibility
   ├─ Check employee-service compatibility
   └─ Fail if not safe to deploy
```

## 🎯 Best Practices

### Consumer Test Best Practices

✅ **Test from the consumer's perspective**
```typescript
// Good - Test what you actually need
await provider.addInteraction({
  state: 'employee with ID 1 exists',
  uponReceiving: 'a request for employee with ID 1',
  willRespondWith: {
    status: 200,
    body: {
      success: true,
      data: employeeMatchers.employee(),
    },
  },
});

// Bad - Over-specifying implementation details
willRespondWith: {
  body: {
    id: 1, // Don't hardcode specific values
    name: 'John Doe', // Use matchers instead
  },
}
```

✅ **Use matchers, not exact values**
```typescript
// Good
body: {
  id: integer(),
  name: string('John'),
  email: string('john@example.com'),
  createdAt: iso8601DateTime(),
}

// Bad
body: {
  id: 1,
  name: 'John Doe',
  email: 'john.doe@example.com',
  createdAt: '2024-01-15T10:00:00Z',
}
```

✅ **Test error scenarios**
```typescript
// Test 404 Not Found
await provider.addInteraction({
  state: 'employee with ID 999 does not exist',
  uponReceiving: 'a request for non-existent employee',
  willRespondWith: {
    status: 404,
    body: {
      success: false,
      error: {
        code: string('NOT_FOUND'),
        message: like('Employee not found'),
      },
    },
  },
});
```

✅ **Use provider states**
```typescript
// Set up data state for test
await provider.addInteraction({
  state: 'employees exist in the system', // Provider must handle this
  uponReceiving: 'a request for all employees',
  // ...
});
```

### Provider Test Best Practices

✅ **Implement state handlers**
```typescript
stateHandlers: {
  'employee with ID 1 exists': async () => {
    // Setup: Insert employee with ID 1 into database
    await db.employee.create({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      // ...
    });
  },

  'employee with ID 999 does not exist': async () => {
    // Setup: Ensure employee 999 doesn't exist
    await db.employee.deleteMany({ where: { id: 999 } });
  },
}
```

✅ **Clean up after tests**
```typescript
afterEach(async () => {
  // Clean up test data
  await db.employee.deleteMany({ where: { id: { gte: 1000 } } });
});
```

✅ **Publish verification results**
```typescript
const opts: VerifierOptions = {
  provider: 'employee-service',
  providerVersion: process.env.GIT_COMMIT,
  publishVerificationResult: process.env.CI === 'true',
  // ...
};
```

### Pact Workflow Best Practices

✅ **Development Workflow**
```bash
1. Write consumer test (define expectation)
2. Run consumer test (generates pact)
3. Implement provider endpoint
4. Run provider verification
5. Iterate until verification passes
```

✅ **Deployment Workflow**
```bash
1. Run consumer tests
2. Publish contracts to broker
3. Run provider verification
4. Check can-i-deploy
5. Deploy if safe
```

✅ **Versioning Strategy**
- Use Git commit SHA for development
- Use semantic versions for releases
- Tag with branch names
- Tag production deployments

## 🐛 Troubleshooting

### Issue: Consumer test failing

**Symptoms**: Consumer test fails with "Request did not match"

**Solution**:
```bash
# Check pact logs
cat pacts/logs/employee-api.log

# Common issues:
1. Request path doesn't match
   - Check path in withRequest matches actual request

2. Query parameters don't match
   - Ensure all query params are defined in contract

3. Headers don't match
   - Check authorization headers are set

4. Request body doesn't match
   - Validate request body structure
```

### Issue: Provider verification failing

**Symptoms**: Provider verification fails

**Solution**:
```bash
# Check what's failing
DEBUG=pact* pnpm test:pact:provider

# Common issues:
1. Provider state not set up
   - Implement state handler
   - Seed test data correctly

2. Response doesn't match contract
   - Check response structure
   - Ensure matchers are satisfied

3. Provider not running
   - Start provider: pnpm dev
   - Check port matches configuration

4. Authentication failing
   - Check request filter adds auth headers
```

### Issue: Pact Broker connection failed

**Solution**:
```bash
# Check Pact Broker is running
docker-compose -f docker-compose.pact.yml ps

# Check Pact Broker health
curl http://localhost:9292/diagnostic/status/heartbeat

# Check credentials
# Username: pactbroker
# Password: pactbroker

# Restart if needed
docker-compose -f docker-compose.pact.yml restart
```

### Issue: Can-I-Deploy failing

**Symptoms**: "Not safe to deploy" error

**Solution**:
```bash
# Check verification status in Pact Broker
open http://localhost:9292

# Common reasons:
1. Provider hasn't verified yet
   - Run provider verification: pnpm test:pact:provider

2. Verification failed
   - Fix provider to meet contract
   - Re-run verification

3. Breaking changes
   - Review contract changes
   - Update provider to support new contract

4. Version not found
   - Publish contracts: ./scripts/pact-publish.sh
   - Ensure version tags are correct
```

### Issue: Pact file not generated

**Solution**:
```bash
# Ensure test completed successfully
pnpm test:pact:consumer

# Check pacts directory
ls -la pacts/

# If empty, check:
1. Test passed all expectations
2. provider.finalize() was called
3. Write permissions to pacts/ directory

# Create pacts directory if missing
mkdir -p pacts/logs
```

### Issue: State handler not working

**Solution**:
```typescript
// Ensure state handler is registered
stateHandlers: {
  'employee with ID 1 exists': async () => {
    console.log('State: Setting up employee 1');

    // Return state details for debugging
    return {
      description: 'Employee 1 exists',
      employeeId: 1,
    };
  },
}

// Check state name matches exactly
// State in consumer test must match state handler key
```

## 📚 Additional Resources

- [Pact Documentation](https://docs.pact.io/)
- [Pact Node.js](https://github.com/pact-foundation/pact-js)
- [Pact Broker](https://docs.pact.io/pact_broker)
- [Consumer-Driven Contracts](https://martinfowler.com/articles/consumerDrivenContracts.html)
- [Pact Workshop](https://docs.pact.io/implementation_guides/javascript/readme)
- [Can-I-Deploy Guide](https://docs.pact.io/pact_broker/can_i_deploy)

## 📝 License

Part of AuraOS HCM Platform - Internal Use Only
