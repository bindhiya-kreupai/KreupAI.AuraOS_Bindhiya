# Security Remediation Plan - AuraOS HCM

Comprehensive security remediation guide based on automated security test findings and OWASP Top 10 best practices.

## 📋 Executive Summary

This document provides a complete security remediation plan for the AuraOS HCM platform, organized by severity and category. Each finding includes:
- **Vulnerability Description**
- **Risk Level** (Critical/High/Medium/Low)
- **Affected Components**
- **Remediation Steps**
- **Verification Method**
- **Timeline**

## 🎯 Remediation Priority Matrix

| Priority | Severity | Timeline | Findings |
|----------|----------|----------|----------|
| P0 | Critical | 24-48 hours | Authentication bypass, SQL injection, RCE |
| P1 | High | 1 week | XSS, CSRF, Broken access control |
| P2 | Medium | 2 weeks | Information disclosure, weak crypto |
| P3 | Low | 1 month | Security headers, best practices |

---

## 🔴 CRITICAL PRIORITY (P0) - Fix Immediately

### 1. SQL Injection Vulnerabilities

**Risk Level**: 🔴 Critical (CVSS 9.8)

**Description**: Application may be vulnerable to SQL injection attacks where user input is concatenated directly into SQL queries.

**Affected Components**:
- Employee search functionality
- Payroll queries
- Leave management filters
- Attendance reports

**Current Vulnerability**:
```typescript
// ❌ VULNERABLE CODE
const query = `SELECT * FROM employees WHERE name LIKE '%${searchTerm}%'`;
db.execute(query);
```

**Remediation**:
```typescript
// ✅ SECURE CODE - Use parameterized queries
const query = `SELECT * FROM employees WHERE name LIKE ?`;
db.execute(query, [`%${searchTerm}%`]);

// OR with Prisma (recommended)
const employees = await prisma.employee.findMany({
  where: {
    name: {
      contains: searchTerm,
      mode: 'insensitive'
    }
  }
});
```

**Verification**:
- Run: `npx playwright test apps/web/src/__tests__/security/injection-attacks.test.ts -g "SQL injection"`
- Test with payloads: `' OR '1'='1`, `'; DROP TABLE employees--`
- Verify all queries use parameterized statements

**Timeline**: 24 hours

---

### 2. Authentication Bypass

**Risk Level**: 🔴 Critical (CVSS 9.1)

**Description**: Weak authentication mechanisms may allow attackers to bypass login.

**Affected Components**:
- Login endpoint (`/api/auth/login`)
- JWT token validation
- Session management

**Current Vulnerabilities**:
- Weak password requirements
- No account lockout
- Predictable session tokens
- Missing JWT signature validation

**Remediation**:

```typescript
// ✅ Password complexity requirements
import { z } from 'zod';

const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Must contain uppercase letter')
  .regex(/[a-z]/, 'Must contain lowercase letter')
  .regex(/[0-9]/, 'Must contain number')
  .regex(/[^A-Za-z0-9]/, 'Must contain special character');

// ✅ Account lockout
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

async function checkLoginAttempts(email: string): Promise<void> {
  const attempts = await getLoginAttempts(email);

  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    const lockoutUntil = await getLockoutTime(email);
    if (Date.now() < lockoutUntil) {
      throw new Error('Account locked due to too many failed attempts');
    }
  }
}

// ✅ Secure JWT validation
import jwt from 'jsonwebtoken';

function validateToken(token: string): any {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!, {
      algorithms: ['HS256'],
      issuer: 'auraos',
      audience: 'auraos-api'
    });
  } catch (error) {
    throw new Error('Invalid token');
  }
}
```

**Verification**:
- Run: `npx playwright test apps/web/src/__tests__/security/auth-security.test.ts`
- Test weak passwords are rejected
- Test account locks after 5 failed attempts
- Test invalid JWT tokens are rejected

**Timeline**: 48 hours

---

### 3. NoSQL Injection

**Risk Level**: 🔴 Critical (CVSS 8.5)

**Description**: MongoDB queries vulnerable to operator injection.

**Current Vulnerability**:
```typescript
// ❌ VULNERABLE CODE
const user = await db.users.findOne({
  email: req.body.email,
  password: req.body.password
});
```

**Attack Payload**:
```json
{
  "email": {"$ne": null},
  "password": {"$ne": null}
}
```

**Remediation**:
```typescript
// ✅ SECURE CODE - Validate and sanitize input
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const validated = loginSchema.parse(req.body);

const user = await db.users.findOne({
  email: validated.email,
  password: await hash(validated.password)
});
```

**Verification**:
- Run: `npx playwright test apps/web/src/__tests__/security/injection-attacks.test.ts -g "NoSQL"`
- Test with operator payloads: `{"$ne": null}`, `{"$gt": ""}`

**Timeline**: 24 hours

---

### 4. Remote Code Execution (Command Injection)

**Risk Level**: 🔴 Critical (CVSS 9.8)

**Description**: User input passed to shell commands without sanitization.

**Affected Components**:
- File upload processing
- Report generation
- Data export

**Current Vulnerability**:
```typescript
// ❌ VULNERABLE CODE
import { exec } from 'child_process';

exec(`convert ${filename} output.pdf`, (error, stdout) => {
  // ...
});
```

**Remediation**:
```typescript
// ✅ SECURE CODE - Use safer alternatives
import { spawn } from 'child_process';

// Use spawn with argument array (no shell interpretation)
const convert = spawn('convert', [filename, 'output.pdf']);

// OR better: Use libraries instead of shell commands
import sharp from 'sharp';

await sharp(filename)
  .toFormat('pdf')
  .toFile('output.pdf');

// ✅ If shell commands are necessary, validate input strictly
const SAFE_FILENAME_REGEX = /^[a-zA-Z0-9_\-\.]+$/;

if (!SAFE_FILENAME_REGEX.test(filename)) {
  throw new Error('Invalid filename');
}
```

**Verification**:
- Run: `npx playwright test apps/web/src/__tests__/security/injection-attacks.test.ts -g "Command injection"`
- Test with payloads: `; rm -rf /`, `| cat /etc/passwd`

**Timeline**: 48 hours

---

## 🟠 HIGH PRIORITY (P1) - Fix Within 1 Week

### 5. Cross-Site Scripting (XSS)

**Risk Level**: 🟠 High (CVSS 7.5)

**Types**:
- Reflected XSS
- Stored XSS
- DOM-based XSS

**Affected Components**:
- Employee profile display
- Leave comments
- Announcement boards
- Search results

**Remediation**:

```typescript
// ✅ Server-side: Sanitize input
import DOMPurify from 'isomorphic-dompurify';

function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  });
}

// ✅ Client-side: Use React's built-in XSS protection
function EmployeeProfile({ employee }: Props) {
  return (
    <div>
      {/* ✅ SAFE - React escapes by default */}
      <h1>{employee.name}</h1>

      {/* ❌ DANGEROUS - Only use for trusted content */}
      <div dangerouslySetInnerHTML={{ __html: employee.bio }} />

      {/* ✅ SAFE - Sanitize before rendering */}
      <div dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(employee.bio)
      }} />
    </div>
  );
}

// ✅ Content Security Policy header
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://api.auraos.com"
  );
  next();
});
```

**Verification**:
- Run: `npx playwright test apps/web/src/__tests__/security/xss-csrf.test.ts -g "XSS"`
- Test with payloads: `<script>alert('XSS')</script>`, `<img src=x onerror=alert(1)>`

**Timeline**: 5 days

---

### 6. Cross-Site Request Forgery (CSRF)

**Risk Level**: 🟠 High (CVSS 6.5)

**Description**: State-changing operations lack CSRF protection.

**Affected Components**:
- All POST/PUT/DELETE endpoints
- Form submissions
- AJAX requests

**Remediation**:

```typescript
// ✅ CSRF Token Generation (Backend)
import csrf from 'csurf';

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  }
});

app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.post('/api/employees', csrfProtection, async (req, res) => {
  // CSRF token validated automatically
  // ...
});

// ✅ CSRF Token Usage (Frontend)
import { useState, useEffect } from 'react';

function useCSRFToken() {
  const [token, setToken] = useState('');

  useEffect(() => {
    fetch('/api/csrf-token')
      .then(res => res.json())
      .then(data => setToken(data.csrfToken));
  }, []);

  return token;
}

// In component
const csrfToken = useCSRFToken();

async function createEmployee(data: EmployeeData) {
  await fetch('/api/employees', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken
    },
    body: JSON.stringify(data)
  });
}

// ✅ Alternative: SameSite cookies
app.use(session({
  cookie: {
    sameSite: 'strict',
    secure: true,
    httpOnly: true
  }
}));
```

**Verification**:
- Run: `npx playwright test apps/web/src/__tests__/security/xss-csrf.test.ts -g "CSRF"`
- Test requests without CSRF token are rejected
- Test forged requests from different origin fail

**Timeline**: 4 days

---

### 7. Broken Access Control

**Risk Level**: 🟠 High (CVSS 8.2)

**Description**: Insufficient authorization checks allow privilege escalation.

**Issues**:
- Horizontal privilege escalation (access other users' data)
- Vertical privilege escalation (employee to admin)
- Direct object reference (IDOR)

**Remediation**:

```typescript
// ✅ Middleware for role-based access control
function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
}

// ✅ Resource ownership check
async function canAccessEmployee(userId: string, employeeId: string): Promise<boolean> {
  const user = await getUser(userId);
  const employee = await getEmployee(employeeId);

  // Admin can access all
  if (user.role === 'admin') return true;

  // Manager can access their team
  if (user.role === 'manager' && employee.managerId === userId) return true;

  // Employee can only access their own data
  if (userId === employeeId) return true;

  return false;
}

// ✅ Usage in routes
app.get('/api/employees/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (!await canAccessEmployee(userId, id)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const employee = await getEmployee(id);
  res.json(employee);
});

app.patch('/api/employees/:id/salary',
  authenticateToken,
  requireRole('admin', 'hr'),
  async (req, res) => {
    // Only admin and HR can modify salary
    // ...
  }
);
```

**Verification**:
- Run: `npx playwright test apps/web/src/__tests__/security/auth-security.test.ts -g "authorization"`
- Test employee cannot access other employees' data
- Test employee cannot modify salaries
- Test employee cannot approve their own leave

**Timeline**: 6 days

---

### 8. Sensitive Data Exposure

**Risk Level**: 🟠 High (CVSS 7.4)

**Description**: Sensitive data transmitted or stored without encryption.

**Issues**:
- Passwords not hashed properly
- PII exposed in logs
- Sensitive data in error messages
- Unencrypted data at rest

**Remediation**:

```typescript
// ✅ Password hashing with bcrypt
import bcrypt from 'bcrypt';

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12; // Increase from default 10
  return await bcrypt.hash(password, saltRounds);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// ✅ Encrypt sensitive data at rest
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decrypt(encrypted: string): string {
  const [ivHex, authTagHex, encryptedHex] = encrypted.split(':');

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// ✅ Sanitize logs
function sanitizeForLogging(data: any): any {
  const sensitive = ['password', 'token', 'ssn', 'creditCard', 'bankAccount'];

  const sanitized = { ...data };

  for (const key of Object.keys(sanitized)) {
    if (sensitive.some(s => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]';
    }
  }

  return sanitized;
}

// ✅ Mask PII in responses
function maskSSN(ssn: string): string {
  return `XXX-XX-${ssn.slice(-4)}`;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  return `${local[0]}***@${domain}`;
}
```

**Verification**:
- Run: `npx playwright test apps/web/src/__tests__/security/data-security.test.ts`
- Verify passwords are bcrypt hashed (not MD5/SHA1)
- Verify PII is encrypted in database
- Check logs don't contain sensitive data

**Timeline**: 7 days

---

## 🟡 MEDIUM PRIORITY (P2) - Fix Within 2 Weeks

### 9. Security Headers Missing

**Risk Level**: 🟡 Medium (CVSS 5.3)

**Description**: Missing or misconfigured HTTP security headers.

**Missing Headers**:
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security
- Referrer-Policy

**Remediation**:

```typescript
// ✅ Security headers middleware
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.auraos.com"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  frameguard: {
    action: 'deny'
  },
  noSniff: true,
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  }
}));

// ✅ Additional custom headers
app.use((req, res, next) => {
  res.setHeader('X-Powered-By', ''); // Remove
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});
```

**Verification**:
- Run: `npx playwright test apps/web/src/__tests__/security/vulnerability-scan.test.ts -g "headers"`
- Check all security headers are present
- Verify CSP blocks inline scripts

**Timeline**: 3 days

---

### 10. Insecure File Uploads

**Risk Level**: 🟡 Medium (CVSS 6.5)

**Description**: File upload functionality lacks proper validation.

**Issues**:
- No file type validation
- No file size limits
- No virus scanning
- Files stored in web root
- No filename sanitization

**Remediation**:

```typescript
// ✅ Secure file upload configuration
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store outside web root
    cb(null, '/var/uploads/auraos');
  },
  filename: (req, file, cb) => {
    // Use UUID to prevent path traversal
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: (req, file, cb) => {
    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'));
    }

    // Validate extension
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];

    if (!allowedExts.includes(ext)) {
      return cb(new Error('Invalid file extension'));
    }

    cb(null, true);
  }
});

// ✅ Virus scanning (using ClamAV)
import NodeClam from 'clamscan';

const clam = new NodeClam().init({
  clamdscan: {
    host: 'localhost',
    port: 3310
  }
});

async function scanFile(filePath: string): Promise<void> {
  const { isInfected, viruses } = await clam.isInfected(filePath);

  if (isInfected) {
    // Delete infected file
    await fs.unlink(filePath);
    throw new Error(`File infected with: ${viruses.join(', ')}`);
  }
}

// ✅ Usage
app.post('/api/documents/upload',
  authenticateToken,
  upload.single('file'),
  async (req, res) => {
    try {
      await scanFile(req.file!.path);

      // Save file metadata to database
      const document = await createDocument({
        userId: req.user.id,
        filename: req.file!.originalname,
        storedAs: req.file!.filename,
        mimeType: req.file!.mimetype,
        size: req.file!.size
      });

      res.json(document);
    } catch (error) {
      // Clean up file on error
      if (req.file) {
        await fs.unlink(req.file.path);
      }
      throw error;
    }
  }
);
```

**Verification**:
- Run: `npx playwright test apps/web/src/__tests__/security/data-security.test.ts -g "file upload"`
- Test executable files are rejected
- Test oversized files are rejected
- Test path traversal in filenames is prevented

**Timeline**: 5 days

---

### 11. Weak Session Management

**Risk Level**: 🟡 Medium (CVSS 5.9)

**Description**: Sessions lack proper security controls.

**Issues**:
- No session timeout
- Sessions not invalidated on logout
- Session fixation vulnerability
- Predictable session IDs

**Remediation**:

```typescript
// ✅ Secure session configuration
import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';

const redisClient = createClient();

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET!,
  name: 'auraos.sid', // Custom name (not default)
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // HTTPS only
    httpOnly: true, // No JavaScript access
    sameSite: 'strict',
    maxAge: 30 * 60 * 1000, // 30 minutes
    domain: 'auraos.com'
  },
  rolling: true // Reset expiry on each request
}));

// ✅ Session fixation prevention
app.post('/api/auth/login', async (req, res) => {
  // Validate credentials
  const user = await validateCredentials(req.body);

  // Regenerate session ID
  req.session.regenerate((err) => {
    if (err) throw err;

    req.session.userId = user.id;
    req.session.role = user.role;

    res.json({ success: true });
  });
});

// ✅ Logout - destroy session
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.clearCookie('auraos.sid');
    res.json({ success: true });
  });
});

// ✅ Concurrent session management
const MAX_SESSIONS_PER_USER = 3;

async function limitSessions(userId: string, newSessionId: string): Promise<void> {
  const sessions = await getUserSessions(userId);

  if (sessions.length >= MAX_SESSIONS_PER_USER) {
    // Remove oldest session
    await destroySession(sessions[0].id);
  }

  await saveSession(userId, newSessionId);
}
```

**Verification**:
- Run: `npx playwright test apps/web/src/__tests__/security/auth-security.test.ts -g "session"`
- Test sessions expire after timeout
- Test logout destroys session
- Test session fixation is prevented

**Timeline**: 4 days

---

## 🟢 LOW PRIORITY (P3) - Fix Within 1 Month

### 12. Information Disclosure

**Risk Level**: 🟢 Low (CVSS 3.7)

**Issues**:
- Verbose error messages in production
- Server version exposed
- Directory listing enabled
- Comments in production code

**Remediation**:

```typescript
// ✅ Generic error messages in production
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // Log full error for debugging
  logger.error(err.stack);

  // Send generic message to client
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({
      error: 'An error occurred. Please try again later.'
    });
  } else {
    // Detailed errors in development only
    res.status(500).json({
      error: err.message,
      stack: err.stack
    });
  }
});

// ✅ Remove server identification
app.disable('x-powered-by');

// ✅ Remove comments in production build
// In next.config.js or webpack config
module.exports = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config) => {
    if (process.env.NODE_ENV === 'production') {
      config.optimization.minimize = true;
    }
    return config;
  }
};
```

**Timeline**: 2 days

---

## 📊 Remediation Timeline

```
Week 1: Critical Issues (P0)
├── Day 1-2: SQL & NoSQL Injection fixes
├── Day 3-4: Authentication bypass fixes
└── Day 5-7: Command injection fixes

Week 2: High Priority (P1)
├── Day 1-3: XSS remediation
├── Day 4-5: CSRF protection
└── Day 6-7: Access control fixes

Week 3-4: Medium Priority (P2)
├── Week 3: Security headers, file uploads
└── Week 4: Session management, data encryption

Week 5: Low Priority (P3)
└── Information disclosure, best practices
```

## ✅ Verification Checklist

After implementing fixes, verify with:

```bash
# Run all security tests
npm run test:security

# Run specific vulnerability tests
npx playwright test apps/web/src/__tests__/security/injection-attacks.test.ts
npx playwright test apps/web/src/__tests__/security/xss-csrf.test.ts
npx playwright test apps/web/src/__tests__/security/auth-security.test.ts
npx playwright test apps/web/src/__tests__/security/data-security.test.ts

# Check for dependency vulnerabilities
npm audit
npm audit fix

# Run OWASP ZAP scan
docker run -t owasp/zap2docker-stable zap-baseline.py -t https://auraos.com
```

## 📈 Success Metrics

Track remediation progress:

- ✅ All P0 issues resolved: 0/4
- ✅ All P1 issues resolved: 0/4
- ✅ All P2 issues resolved: 0/3
- ✅ Security test pass rate: 0% → 100%
- ✅ Zero critical vulnerabilities in npm audit

## 📚 Additional Resources

- [OWASP Top 10 2021](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

**Document Version**: 1.0
**Last Updated**: Day 55 - Security Remediation
**Next Review**: After all fixes implemented
**Owner**: Security Team
