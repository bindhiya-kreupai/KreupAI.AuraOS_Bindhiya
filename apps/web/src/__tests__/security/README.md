# Security Testing Suite

Comprehensive security testing suite for AuraOS HCM Platform covering OWASP Top 10 vulnerabilities, dependency scanning, and automated security testing.

## 📋 Table of Contents

- [Overview](#overview)
- [Test Coverage](#test-coverage)
- [Tools Used](#tools-used)
- [Running Tests](#running-tests)
- [OWASP ZAP Scanning](#owasp-zap-scanning)
- [Dependency Scanning](#dependency-scanning)
- [Snyk Integration](#snyk-integration)
- [CI/CD Integration](#cicd-integration)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This security testing suite provides automated security testing for the AuraOS HCM platform, covering:

- **OWASP Top 10** vulnerabilities
- **SQL Injection** testing
- **Cross-Site Scripting (XSS)** testing
- **Dependency vulnerabilities** scanning
- **License compliance** checking
- **Static Application Security Testing (SAST)**
- **Dynamic Application Security Testing (DAST)**

### Security Testing Philosophy

1. **Defense in Depth**: Multiple layers of security testing
2. **Shift Left**: Security testing early in development
3. **Automation First**: Automated security scans on every commit
4. **Continuous Monitoring**: Ongoing security monitoring in production
5. **Zero Trust**: Assume breach, verify everything

## 📊 Test Coverage

### 1. SQL Injection Tests

**File**: [sql-injection.test.ts](sql-injection.test.ts:1)

Tests SQL injection vulnerabilities across all API endpoints:

✅ **Classic SQL Injection**
- `' OR '1'='1`
- `admin' --`
- `' OR 1=1--`

✅ **Union-based SQL Injection**
- `' UNION SELECT NULL--`
- `' UNION ALL SELECT NULL, NULL--`

✅ **Blind SQL Injection**
- Boolean-based
- Time-based (`SLEEP`, `pg_sleep`)

✅ **Error-based SQL Injection**
- Database error disclosure
- Stack trace leakage

✅ **Second-order SQL Injection**
- Stored malicious data execution

**Endpoints Tested**:
- Employee API (list, get, create, update, delete, search)
- Authentication API (login)
- Payroll API (payslips, filters)
- Reports API (filters)
- Leave Management API (filters)

### 2. XSS Tests

**File**: [xss.test.ts](xss.test.ts:1)

Tests Cross-Site Scripting vulnerabilities:

✅ **Reflected XSS**
- Search parameters
- URL query parameters
- Error messages

✅ **Stored XSS**
- Employee data fields
- Rich text content
- User-generated content

✅ **DOM-based XSS**
- Hash fragments
- `innerHTML` operations
- Client-side JavaScript execution

✅ **XSS Attack Vectors**:
- Script tags: `<script>alert(1)</script>`
- Event handlers: `<img src=x onerror=alert(1)>`
- JavaScript protocol: `javascript:alert(1)`
- SVG-based: `<svg onload=alert(1)>`
- HTML5 tags: `<details ontoggle=alert(1)>`

✅ **Security Headers**
- Content-Security-Policy (CSP)
- X-Content-Type-Options
- X-Frame-Options

### 3. OWASP ZAP Scanning

**File**: [zap-config.yaml](zap-config.yaml:1)
**Runner**: [run-zap-scan.sh](run-zap-scan.sh:1)

Automated security scanning with OWASP ZAP:

✅ **Spider & Discovery**
- Traditional spider
- AJAX spider for SPAs
- API endpoint discovery

✅ **Passive Scanning**
- 50+ passive scan rules
- No attack traffic
- Safe for production

✅ **Active Scanning**
- SQL Injection testing
- XSS testing
- Path Traversal
- Command Injection
- CSRF testing

✅ **Scan Types**:
- **Baseline**: Quick passive scan (~5 min)
- **Full**: Complete active scan (~30 min)
- **API**: API-focused scan (~15 min)
- **Automation**: Custom automation framework

### 4. Dependency Scanning

**File**: [dependency-scan.sh](dependency-scan.sh:1)

Comprehensive dependency security scanning:

✅ **npm audit**: Built-in npm vulnerability scanner
✅ **pnpm audit**: Workspace-aware vulnerability scanner
✅ **Snyk**: Advanced vulnerability detection
✅ **retire.js**: JavaScript library vulnerability scanner
✅ **License compliance**: Detect problematic licenses

**Scans for**:
- Known vulnerabilities (CVEs)
- Outdated dependencies
- License violations
- Malicious packages

### 5. Snyk Integration

**File**: [.snyk](../../../../../../.snyk:1)

Advanced security platform integration:

✅ **Vulnerability Scanning**: Dependency vulnerability detection
✅ **SAST (Static Analysis)**: Code security analysis
✅ **License Compliance**: License policy enforcement
✅ **Container Scanning**: Docker image scanning
✅ **IaC Scanning**: Infrastructure as Code security

## 🛠️ Tools Used

### Primary Tools

| Tool | Purpose | Version |
|------|---------|---------|
| **OWASP ZAP** | DAST, Active/Passive scanning | 2.14+ |
| **Playwright** | E2E security testing | 1.48+ |
| **Snyk** | Dependency & SAST | Latest |
| **npm audit** | Built-in vulnerability scanner | - |
| **retire.js** | JS library scanner | Latest |

### Supporting Tools

- **Docker**: For ZAP containerized scanning
- **jq**: JSON parsing for reports
- **license-checker**: License compliance

## 🚀 Running Tests

### Prerequisites

```bash
# Install dependencies
pnpm install

# Install Playwright browsers
npx playwright install

# Install Docker (for ZAP)
# macOS: brew install docker
# Ubuntu: apt-get install docker.io

# Install Snyk (optional)
npm install -g snyk

# Authenticate Snyk
snyk auth
```

### Run SQL Injection Tests

```bash
# Start application first
pnpm dev

# Run SQL injection tests
npx playwright test apps/web/src/__tests__/security/sql-injection.test.ts

# Run with UI mode
npx playwright test apps/web/src/__tests__/security/sql-injection.test.ts --ui

# Run specific test
npx playwright test apps/web/src/__tests__/security/sql-injection.test.ts -g "should prevent SQL injection in employee search"
```

### Run XSS Tests

```bash
# Start application
pnpm dev

# Run XSS tests
npx playwright test apps/web/src/__tests__/security/xss.test.ts

# Run with headed browser (see what's happening)
npx playwright test apps/web/src/__tests__/security/xss.test.ts --headed

# Run and generate report
npx playwright test apps/web/src/__tests__/security/xss.test.ts --reporter=html
```

### Run OWASP ZAP Scan

```bash
# Navigate to security tests directory
cd apps/web/src/__tests__/security

# Run baseline scan (recommended for first run)
./run-zap-scan.sh baseline http://localhost:3006

# Run full active scan
./run-zap-scan.sh full http://localhost:3006

# Run API-focused scan
./run-zap-scan.sh api http://localhost:3006/api/v1

# Run with automation framework
./run-zap-scan.sh automation http://localhost:3006
```

**Scan Duration**:
- Baseline: ~5 minutes
- Full: ~30 minutes
- API: ~15 minutes
- Automation: ~20 minutes

### Run Dependency Scan

```bash
# Navigate to security tests directory
cd apps/web/src/__tests__/security

# Run full dependency scan
./dependency-scan.sh

# Run with auto-fix
./dependency-scan.sh --fix

# Run production dependencies only
./dependency-scan.sh --production

# Fail on high severity
./dependency-scan.sh --fail-on high

# Run with JSON output
./dependency-scan.sh --json --fail-on critical
```

### Run All Security Tests

```bash
# From project root
cd apps/web/src/__tests__/security

# 1. Start application
cd ../../../../../
pnpm dev &

# 2. Wait for startup
sleep 30

# 3. Run dependency scan
cd apps/web/src/__tests__/security
./dependency-scan.sh

# 4. Run SQL injection tests
cd ../../../../../
npx playwright test apps/web/src/__tests__/security/sql-injection.test.ts

# 5. Run XSS tests
npx playwright test apps/web/src/__tests__/security/xss.test.ts

# 6. Run OWASP ZAP scan
cd apps/web/src/__tests__/security
./run-zap-scan.sh baseline http://localhost:3006
```

## 🔍 OWASP ZAP Scanning

### Configuration

ZAP configuration is in [zap-config.yaml](zap-config.yaml:1):

```yaml
env:
  contexts:
    - name: "AuraOS-Context"
      urls:
        - "http://localhost:3006"
      authentication:
        method: "json"
        parameters:
          loginUrl: "http://localhost:3006/api/v1/auth/login"
```

### Scan Types Explained

#### 1. Baseline Scan

**Best for**: Quick validation, CI/CD pipelines

- Passive scanning only
- No attacks against the application
- Safe to run against production
- Detects low-hanging fruit

```bash
./run-zap-scan.sh baseline http://localhost:3006
```

#### 2. Full Scan

**Best for**: Comprehensive testing, pre-release validation

- Active + Passive scanning
- Attacks the application
- NOT safe for production
- Detects deep vulnerabilities

```bash
./run-zap-scan.sh full http://localhost:3006
```

#### 3. API Scan

**Best for**: API-focused applications, microservices

- Optimized for REST APIs
- OpenAPI/Swagger aware
- Tests API endpoints specifically

```bash
./run-zap-scan.sh api http://localhost:3006/api/v1
```

#### 4. Automation Framework

**Best for**: Custom scanning requirements

- Uses automation framework
- Customizable via YAML
- Fine-grained control

```bash
./run-zap-scan.sh automation http://localhost:3006
```

### Reading ZAP Reports

Reports are generated in `reports/{timestamp}/`:

- **HTML Report**: Human-readable, detailed findings
- **JSON Report**: Machine-readable, for CI/CD integration
- **Markdown Report**: GitHub/GitLab compatible
- **XML Report**: SARIF format for GitHub Code Scanning

**Alert Levels**:
- 🔴 **High**: Critical vulnerabilities, fix immediately
- 🟡 **Medium**: Important issues, fix soon
- 🟢 **Low**: Minor issues, fix when convenient
- 🔵 **Informational**: Best practice recommendations

## 📦 Dependency Scanning

### npm audit

Built-in npm vulnerability scanner:

```bash
# Basic audit
pnpm audit

# Production only
pnpm audit --prod

# Fix automatically
pnpm audit fix

# Force fix (may introduce breaking changes)
pnpm audit fix --force
```

### Snyk

Advanced vulnerability detection:

```bash
# Test for vulnerabilities
snyk test

# Test all projects in monorepo
snyk test --all-projects

# Monitor project
snyk monitor

# Test code (SAST)
snyk code test

# Test container
snyk container test node:18-alpine
```

### retire.js

JavaScript library vulnerability scanner:

```bash
# Install
npm install -g retire

# Scan current directory
retire --path .

# JSON output
retire --outputformat json --outputpath report.json
```

### License Compliance

Check for problematic licenses:

```bash
# Install
npm install -g license-checker

# Check licenses
license-checker

# JSON output
license-checker --json

# Exclude specific licenses
license-checker --exclude 'MIT, ISC, Apache-2.0'
```

## 🔗 Snyk Integration

### Setup

1. **Create Snyk account**: https://snyk.io/
2. **Authenticate CLI**:
   ```bash
   npm install -g snyk
   snyk auth
   ```
3. **Set GitHub Secret**: Add `SNYK_TOKEN` to GitHub secrets

### Configuration

Configuration is in [.snyk](../../../../../../.snyk:1):

```yaml
# Fail conditions
failOn:
  severity: high
  exploitable: true

# License policy
license:
  disallowed:
    - GPL
    - AGPL
    - LGPL
```

### Usage

```bash
# Test current project
snyk test

# Fix vulnerabilities
snyk wizard

# Monitor project
snyk monitor

# Test code
snyk code test

# Generate report
snyk test --json > snyk-report.json
```

## 🔄 CI/CD Integration

### GitHub Actions

Workflow file: [.github/workflows/security-tests.yml](../../../../../../.github/workflows/security-tests.yml:1)

**Triggers**:
- ✅ Push to `main`/`develop`
- ✅ Pull requests
- ✅ Daily at 2 AM UTC
- ✅ Manual dispatch

**Jobs**:
1. **dependency-scan**: npm audit + Snyk
2. **sql-injection-tests**: Playwright SQL injection tests
3. **xss-tests**: Playwright XSS tests
4. **owasp-zap-scan**: ZAP baseline scan
5. **security-summary**: Aggregate results

### GitLab CI

Example `.gitlab-ci.yml`:

```yaml
security:
  stage: test
  image: node:18
  services:
    - postgres:15
  script:
    - pnpm install
    - pnpm audit --prod
    - npx playwright install
    - pnpm dev &
    - sleep 30
    - npx playwright test apps/web/src/__tests__/security/
  artifacts:
    reports:
      junit: playwright-report/results.xml
```

## 🔐 Security Best Practices

### Input Validation

✅ **Validate all user input**
```typescript
// Good
const schema = z.object({
  email: z.string().email(),
  name: z.string().max(100),
});

// Bad
const { email, name } = req.body; // No validation
```

✅ **Use parameterized queries**
```typescript
// Good - Prisma automatically parameterizes
await prisma.user.findMany({
  where: { email: userEmail }
});

// Bad - String concatenation
const query = `SELECT * FROM users WHERE email = '${userEmail}'`;
```

### Output Encoding

✅ **Escape HTML output**
```typescript
// Good
return <div>{escapeHtml(userInput)}</div>;

// Bad
return <div dangerouslySetInnerHTML={{ __html: userInput }} />;
```

✅ **Set proper Content-Type headers**
```typescript
// Good
res.setHeader('Content-Type', 'application/json; charset=utf-8');
res.setHeader('X-Content-Type-Options', 'nosniff');
```

### Authentication & Authorization

✅ **Use strong authentication**
- bcrypt with salt rounds ≥ 10
- JWT with secure secrets
- Multi-factor authentication (MFA)

✅ **Implement proper authorization**
```typescript
// Check user permissions before action
if (!user.hasPermission('employee:delete')) {
  throw new UnauthorizedError();
}
```

### Secure Headers

✅ **Essential security headers**:
```typescript
// Content-Security-Policy
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"], // Remove unsafe-inline in production
    styleSrc: ["'self'", "'unsafe-inline'"],
  }
}));

// X-Frame-Options
app.use(helmet.frameguard({ action: 'deny' }));

// Strict-Transport-Security
app.use(helmet.hsts({
  maxAge: 31536000,
  includeSubDomains: true,
  preload: true
}));
```

### Dependency Management

✅ **Keep dependencies updated**
```bash
# Check for updates
pnpm outdated

# Update dependencies
pnpm update

# Audit regularly
pnpm audit
```

✅ **Use exact versions in production**
```json
{
  "dependencies": {
    "express": "4.18.2", // Exact version, not ^4.18.2
  }
}
```

## 🐛 Troubleshooting

### Issue: ZAP scan fails to authenticate

**Solution**:
1. Check credentials in `zap-config.yaml`
2. Verify login endpoint is correct
3. Test login manually with curl
4. Check authentication method (cookie vs. token)

### Issue: High false positive rate in ZAP

**Solution**:
1. Use baseline scan for first run
2. Review findings and mark false positives
3. Update `zap-config.yaml` to ignore known false positives
4. Use context-based scanning for better accuracy

### Issue: npm audit shows vulnerabilities in dev dependencies

**Solution**:
```bash
# Only audit production dependencies
pnpm audit --prod

# Or explicitly exclude dev
pnpm audit --production
```

### Issue: Snyk requires authentication

**Solution**:
```bash
# Authenticate Snyk
snyk auth

# Or use token from environment
export SNYK_TOKEN=your-token
snyk test
```

### Issue: Playwright tests timing out

**Solution**:
```typescript
// Increase test timeout
test.setTimeout(60000); // 60 seconds

// Or in config
export default defineConfig({
  timeout: 60000,
});
```

### Issue: Security tests failing in CI

**Common causes**:
1. Application not fully started
2. Database not seeded
3. Environment variables missing
4. Network connectivity issues

**Solution**:
```bash
# Add health check before tests
curl --retry 10 --retry-delay 3 http://localhost:3006/api/health

# Or use wait-on
npx wait-on http://localhost:3006
```

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP ZAP Documentation](https://www.zaproxy.org/docs/)
- [Snyk Documentation](https://docs.snyk.io/)
- [Playwright Security Testing](https://playwright.dev/docs/test-annotations)
- [SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)

## 📝 License

Part of AuraOS HCM Platform - Internal Use Only
