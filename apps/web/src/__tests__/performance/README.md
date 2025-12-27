# Performance Testing Suite

Comprehensive performance testing suite for AuraOS HCM Platform using k6.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Test Suites](#test-suites)
- [Running Tests](#running-tests)
- [Test Profiles](#test-profiles)
- [Metrics and Thresholds](#metrics-and-thresholds)
- [CI/CD Integration](#cicd-integration)
- [Performance Baselines](#performance-baselines)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This performance testing suite provides comprehensive load, stress, spike, and regression testing for the AuraOS HCM platform. It uses **k6** - a modern load testing tool that makes performance testing easy and productive.

### Test Coverage

- **Baseline Tests**: Establish performance baselines for all major APIs
- **Load Tests**: Test system behavior under expected load
- **Stress Tests**: Identify system breaking points
- **Spike Tests**: Test sudden traffic spikes
- **Regression Tests**: Detect performance regressions across releases

### Key Features

- ✅ Multiple load profiles (smoke, load, stress, spike, soak)
- ✅ Realistic user scenarios with think time
- ✅ Comprehensive metrics and custom thresholds
- ✅ Automated setup and teardown
- ✅ Performance regression tracking
- ✅ Detailed HTML and JSON reports
- ✅ CI/CD integration ready

## 📦 Prerequisites

### Required Software

1. **k6** - Load testing tool
   ```bash
   # macOS
   brew install k6

   # Windows (using Chocolatey)
   choco install k6

   # Linux
   sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
   echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
   sudo apt-get update
   sudo apt-get install k6
   ```

2. **Node.js** - For test data generation helpers
3. **Running AuraOS instance** - Tests require live backend

### Environment Setup

Create a `.env.performance` file:

```env
# API Configuration
BASE_URL=http://localhost:3006
API_URL=http://localhost:3006/api/v1

# Test Users (should exist in database)
ADMIN_EMAIL=admin@e2etest.com
ADMIN_PASSWORD=Test@1234
MANAGER_EMAIL=manager@e2etest.com
MANAGER_PASSWORD=Test@1234
USER_EMAIL=user@e2etest.com
USER_PASSWORD=Test@1234

# Database (for setup/teardown)
TEST_DATABASE_URL=postgresql://user:password@localhost:5432/auraos_test

# Performance Settings
VUS=10
DURATION=5m
THINK_TIME_MIN=1
THINK_TIME_MAX=3
```

## 🚀 Installation

1. **Install k6** (see prerequisites)

2. **Verify installation**:
   ```bash
   k6 version
   ```

3. **Set up test database**:
   ```bash
   # Ensure test users exist
   pnpm prisma db seed
   ```

## 📊 Test Suites

### 1. Baseline Tests

**File**: `tests/baseline.test.js`

Establishes performance baselines for all major API endpoints using the smoke profile (1 user, 30 seconds).

```bash
k6 run tests/baseline.test.js
```

**Tests**:
- ✅ Authentication (login)
- ✅ Employee list, get, create, update, delete
- ✅ Payroll list, process
- ✅ Reports list, generate
- ✅ Leave applications list
- ✅ Dashboard

**Thresholds**:
- Login: p95 < 300ms
- Employee list: p95 < 400ms
- Dashboard: p95 < 600ms

### 2. Employee Load Tests

**File**: `tests/employee-load.test.js`

Comprehensive load tests for Employee Management APIs with realistic usage patterns.

```bash
k6 run tests/employee-load.test.js
```

**Scenarios**:
- 100% - List employees (various filters)
- 100% - Get single employee
- 100% - Search employees
- 30% - Create employee
- 20% - Update employee
- 10% - Batch operations

**Load Profile**: Ramps 0 → 10 → 50 users over 16 minutes

**Thresholds**:
- List: p95 < 400ms
- Get: p95 < 300ms
- Create: p95 < 500ms
- Search: p95 < 600ms

### 3. Payroll Load Tests

**File**: `tests/payroll-load.test.js`

Load tests for Payroll processing operations.

```bash
k6 run tests/payroll-load.test.js
```

**Scenarios**:
- List payslips with filters
- Get single payslip
- Download payslip PDF
- Process payroll (10% of iterations - heavy operation)
- Statutory compliance (PF, ESI)
- Batch operations

**Thresholds**:
- List payslips: p95 < 500ms
- Get payslip: p95 < 400ms
- Download PDF: p95 < 2000ms
- Process payroll: p95 < 5000ms

### 4. Regression Tests

**File**: `tests/regression.test.js`

Performance regression suite that compares against baseline metrics.

```bash
k6 run --env VERSION=v1.2.0 tests/regression.test.js
```

**Features**:
- Tracks custom metrics for all critical endpoints
- Compares against baseline (10% tolerance)
- Generates regression report JSON
- Exports metrics for trending

**Output**: `regression-report-{timestamp}.json`

### 5. Stress Tests

**File**: `tests/stress.test.js`

Tests system behavior under extreme load to identify breaking points.

```bash
k6 run tests/stress.test.js
```

**Load Profile**: Ramps 0 → 50 → 100 → 150 → 200 users over 20 minutes

**Monitors**:
- Error rate at different load levels
- Response time degradation
- System recovery after load reduction
- Breaking point identification

**Thresholds**:
- Error rate < 5%
- p95 response time < 2000ms
- Success rate > 90%

### 6. Spike Tests

**File**: `tests/spike.test.js`

Tests system response to sudden traffic spikes.

```bash
k6 run tests/spike.test.js
```

**Load Profile**: 10 users → sudden spike to 100 users → back to 10

**Monitors**:
- Peak response time during spike
- Recovery response time after spike
- Degradation factor (peak/recovery)
- Auto-scaling effectiveness

**Thresholds**:
- Peak p95 < 2000ms
- Recovery p95 < 600ms
- Error rate < 3%

## 🔧 Running Tests

### Basic Usage

```bash
# Run baseline tests
k6 run tests/baseline.test.js

# Run with custom VUs and duration
k6 run --vus 20 --duration 10m tests/employee-load.test.js

# Run with environment variables
k6 run --env BASE_URL=https://staging.auraos.com tests/baseline.test.js

# Run with specific profile
k6 run --env PROFILE=stress tests/employee-load.test.js
```

### Advanced Usage

```bash
# Run with detailed output
k6 run --out json=results.json tests/baseline.test.js

# Generate HTML report (requires k6-reporter)
k6 run --out json=results.json tests/baseline.test.js
k6-reporter results.json

# Run with custom thresholds
k6 run --env THRESHOLD_P95=300 tests/employee-load.test.js

# Run regression test with baseline comparison
k6 run --env BASELINE_FILE=baseline-v1.0.0.json --env VERSION=v1.1.0 tests/regression.test.js

# Run in quiet mode (only errors)
k6 run --quiet tests/baseline.test.js

# Run with distributed execution (cloud)
k6 cloud tests/employee-load.test.js
```

### Running All Tests

```bash
# Run all test suites sequentially
./run-all-tests.sh

# Or manually:
k6 run tests/baseline.test.js
k6 run tests/employee-load.test.js
k6 run tests/payroll-load.test.js
k6 run tests/regression.test.js
k6 run tests/stress.test.js
k6 run tests/spike.test.js
```

## 📈 Test Profiles

All test suites support multiple load profiles defined in `k6.config.js`:

### 1. Smoke Profile

**Purpose**: Quick validation that system works under minimal load

```javascript
{
  executor: 'constant-vus',
  vus: 1,
  duration: '30s'
}
```

**Usage**: `k6 run --env PROFILE=smoke tests/baseline.test.js`

### 2. Load Profile (Default)

**Purpose**: Test system under expected production load

```javascript
{
  executor: 'ramping-vus',
  stages: [
    { duration: '2m', target: 10 },   // Ramp up
    { duration: '5m', target: 10 },   // Stay at 10
    { duration: '2m', target: 50 },   // Ramp to 50
    { duration: '5m', target: 50 },   // Stay at 50
    { duration: '2m', target: 0 }     // Ramp down
  ]
}
```

**Usage**: `k6 run tests/employee-load.test.js`

### 3. Stress Profile

**Purpose**: Identify breaking point by gradually increasing load beyond capacity

```javascript
{
  executor: 'ramping-vus',
  stages: [
    { duration: '2m', target: 50 },
    { duration: '5m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 150 },
    { duration: '5m', target: 150 },
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '5m', target: 0 }
  ]
}
```

**Usage**: `k6 run tests/stress.test.js`

### 4. Spike Profile

**Purpose**: Test sudden traffic spikes (e.g., viral content, flash sales)

```javascript
{
  executor: 'ramping-vus',
  stages: [
    { duration: '30s', target: 10 },   // Baseline
    { duration: '30s', target: 100 },  // Sudden spike!
    { duration: '2m', target: 100 },   // Hold spike
    { duration: '30s', target: 10 },   // Spike over
    { duration: '2m', target: 10 }     // Recovery
  ]
}
```

**Usage**: `k6 run tests/spike.test.js`

### 5. Soak Profile

**Purpose**: Test system stability over extended period (memory leaks, resource exhaustion)

```javascript
{
  executor: 'constant-vus',
  vus: 50,
  duration: '1h'
}
```

**Usage**: `k6 run --env PROFILE=soak tests/employee-load.test.js`

### 6. Breakpoint Profile

**Purpose**: Find exact breaking point with gradual increment

```javascript
{
  executor: 'ramping-arrival-rate',
  startRate: 10,
  timeUnit: '1s',
  preAllocatedVUs: 500,
  stages: [
    { duration: '2h', target: 500 }  // Gradually increase to 500 req/sec
  ]
}
```

**Usage**: `k6 run --env PROFILE=breakpoint tests/employee-load.test.js`

## 📊 Metrics and Thresholds

### Default Metrics

k6 automatically collects these metrics:

| Metric | Description |
|--------|-------------|
| `http_req_duration` | Total request duration (sending + waiting + receiving) |
| `http_req_waiting` | Time to first byte (TTFB) |
| `http_req_sending` | Time spent sending data |
| `http_req_receiving` | Time spent receiving data |
| `http_req_blocked` | Time blocked before request (DNS, TCP, TLS) |
| `http_req_connecting` | Time spent establishing TCP connection |
| `http_req_tls_handshaking` | Time spent in TLS handshake |
| `http_req_failed` | Rate of failed requests |
| `http_reqs` | Total number of requests |
| `vus` | Current number of active virtual users |
| `vus_max` | Max VUs during test |
| `iterations` | Total iterations completed |

### Custom Metrics

Our test suite adds custom metrics:

```javascript
// Regression testing
regression_auth_login
regression_employee_list
regression_employee_get
regression_payslip_list
// ... etc

// Stress testing
stress_errors
stress_success_rate
stress_response_time

// Spike testing
spike_errors
spike_success_rate
spike_peak_response_time
spike_recovery_response_time
```

### Thresholds

Thresholds define pass/fail criteria. Default thresholds from `k6.config.js`:

```javascript
{
  // General thresholds
  http_req_duration: ['p(95)<500'],          // 95% of requests < 500ms
  'http_req_duration{endpoint:login}': ['p(95)<300'],
  'http_req_duration{endpoint:employees}': ['p(95)<400'],
  http_req_failed: ['rate<0.01'],            // Error rate < 1%
  http_reqs: ['count>100'],                  // Minimum request count

  // Endpoint-specific thresholds
  'http_req_duration{endpoint:employees_list}': ['p(95)<400'],
  'http_req_duration{endpoint:employees_create}': ['p(95)<500'],
  'http_req_duration{endpoint:payroll_process}': ['p(95)<5000'],
}
```

### SLA Definitions

Performance SLAs from `k6.config.js`:

```javascript
sla: {
  login: {
    p50: 100,  // 50% of logins < 100ms
    p95: 300,  // 95% of logins < 300ms
    p99: 500   // 99% of logins < 500ms
  },
  employees: {
    list: { p50: 150, p95: 400, p99: 600 },
    get: { p50: 100, p95: 300, p99: 500 },
    create: { p50: 200, p95: 500, p99: 800 },
    update: { p50: 200, p95: 500, p99: 800 },
    delete: { p50: 150, p95: 400, p99: 600 }
  },
  payroll: {
    list: { p50: 200, p95: 500, p99: 800 },
    get: { p50: 150, p95: 400, p99: 600 },
    process: { p50: 2000, p95: 5000, p99: 8000 },
    download: { p50: 800, p95: 2000, p99: 3000 }
  },
  reports: {
    list: { p50: 150, p95: 400, p99: 600 },
    generate: { p50: 500, p95: 1000, p99: 2000 }
  }
}
```

## 🔄 CI/CD Integration

### GitHub Actions

Create `.github/workflows/performance-tests.yml`:

```yaml
name: Performance Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * *'  # Run nightly at 2 AM

jobs:
  performance:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Install k6
        run: |
          sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: pnpm install

      - name: Start application
        run: |
          pnpm dev &
          sleep 30  # Wait for server to start

      - name: Run baseline tests
        run: k6 run --out json=baseline-results.json apps/web/src/__tests__/performance/tests/baseline.test.js

      - name: Run load tests
        run: k6 run --out json=load-results.json apps/web/src/__tests__/performance/tests/employee-load.test.js

      - name: Run regression tests
        run: k6 run --env VERSION=${{ github.sha }} --out json=regression-results.json apps/web/src/__tests__/performance/tests/regression.test.js

      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: performance-results
          path: |
            baseline-results.json
            load-results.json
            regression-results.json

      - name: Comment PR with results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            // Parse results and comment on PR
            // Implementation details...
```

### GitLab CI

Create `.gitlab-ci.yml`:

```yaml
performance:
  stage: test
  image: loadimpact/k6:latest
  services:
    - postgres:15
  script:
    - k6 run apps/web/src/__tests__/performance/tests/baseline.test.js
    - k6 run apps/web/src/__tests__/performance/tests/employee-load.test.js
  artifacts:
    paths:
      - '*.json'
    expire_in: 1 week
  only:
    - main
    - develop
```

## 📉 Performance Baselines

### Recording Baselines

After a release, record baseline metrics:

```bash
# Run regression test and save as baseline
k6 run --env VERSION=v1.0.0 --out json=baseline-v1.0.0.json tests/regression.test.js

# Store baseline in version control
mv regression-report-*.json baselines/baseline-v1.0.0.json
```

### Comparing Against Baselines

```bash
# Compare current version against baseline
k6 run --env BASELINE_FILE=baselines/baseline-v1.0.0.json --env VERSION=v1.1.0 tests/regression.test.js
```

### Baseline Storage

Store baselines in `apps/web/src/__tests__/performance/baselines/`:

```
baselines/
├── baseline-v1.0.0.json
├── baseline-v1.1.0.json
├── baseline-v1.2.0.json
└── README.md
```

## 🐛 Troubleshooting

### Issue: k6 command not found

**Solution**:
```bash
# Verify installation
which k6

# If not installed, follow installation instructions
brew install k6  # macOS
```

### Issue: Connection refused

**Problem**: Application not running or wrong URL

**Solution**:
```bash
# Verify application is running
curl http://localhost:3006/api/health

# Check .env.performance for correct URLs
cat .env.performance

# Start application if needed
pnpm dev
```

### Issue: Authentication failures

**Problem**: Test users don't exist or wrong credentials

**Solution**:
```bash
# Seed test database
pnpm prisma db seed

# Verify test users exist
psql -d auraos_test -c "SELECT email FROM \"User\" WHERE email LIKE '%e2etest.com';"

# Check credentials in k6.config.js match seeded users
```

### Issue: High error rates

**Problem**: System cannot handle load

**Solutions**:
1. **Reduce load**: Use smoke profile first
   ```bash
   k6 run --env PROFILE=smoke tests/baseline.test.js
   ```

2. **Check system resources**:
   ```bash
   # CPU, memory, disk
   top
   df -h
   ```

3. **Review application logs**:
   ```bash
   tail -f logs/app.log
   ```

4. **Check database connections**:
   ```bash
   # PostgreSQL
   SELECT count(*) FROM pg_stat_activity;
   ```

### Issue: Inconsistent results

**Problem**: Test results vary significantly between runs

**Solutions**:
1. **Use soak test** to identify stability issues:
   ```bash
   k6 run --env PROFILE=soak tests/employee-load.test.js
   ```

2. **Ensure consistent environment**:
   - Same data in database
   - No other load on system
   - Network conditions stable

3. **Increase test duration** for more stable averages:
   ```bash
   k6 run --duration 10m tests/baseline.test.js
   ```

### Issue: Slow test execution

**Problem**: Tests taking too long

**Solutions**:
1. **Reduce VUs or duration**:
   ```bash
   k6 run --vus 5 --duration 2m tests/employee-load.test.js
   ```

2. **Use smoke profile** for quick validation:
   ```bash
   k6 run --env PROFILE=smoke tests/baseline.test.js
   ```

3. **Run specific test groups** instead of full suite

## 📚 Additional Resources

- [k6 Documentation](https://k6.io/docs/)
- [k6 Examples](https://k6.io/docs/examples/)
- [Performance Testing Best Practices](https://k6.io/docs/testing-guides/running-large-tests/)
- [k6 Cloud](https://k6.io/cloud/)

## 🤝 Contributing

When adding new performance tests:

1. Follow existing test structure
2. Use helper functions from `utils/helpers.js`
3. Define appropriate thresholds
4. Include setup/teardown for data cleanup
5. Add documentation to this README
6. Test locally before committing

## 📝 License

Part of AuraOS HCM Platform - Internal Use Only
