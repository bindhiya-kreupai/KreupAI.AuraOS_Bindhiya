# AuraOS HCM API Documentation

## Overview

The AuraOS HCM API provides comprehensive endpoints for managing all aspects of Human Capital Management including employees, payroll, leave, attendance, and more.

**Base URL**: `https://api.auraos.com/api/v1`

**API Version**: v1.0.0

---

## Table of Contents

1. [Authentication](#authentication)
2. [Rate Limiting](#rate-limiting)
3. [Request/Response Format](#requestresponse-format)
4. [Error Handling](#error-handling)
5. [Pagination](#pagination)
6. [Caching](#caching)
7. [API Modules](#api-modules)
8. [Code Examples](#code-examples)
9. [SDKs](#sdks)
10. [Interactive Documentation](#interactive-documentation)

---

## Authentication

All API requests require authentication using Bearer tokens (JWT).

### Obtaining an Access Token

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@company.com",
  "password": "your_password"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "...",
    "expiresIn": 3600
  }
}
```

### Using the Access Token

Include the token in the `Authorization` header:

```http
GET /employees
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Refresh

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

---

## Rate Limiting

To ensure fair usage and system stability, the API enforces rate limits:

- **Per User**: 1000 requests per hour
- **Burst**: 100 requests per minute

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

When rate limit is exceeded:

```json
{
  "success": false,
  "error": {
    "code": "E1003",
    "message": "Rate limit exceeded. Please try again later.",
    "details": {
      "retryAfter": 3600
    }
  }
}
```

---

## Request/Response Format

### Standard Response Format

All API responses follow a consistent structure:

```typescript
{
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
    details?: object;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
    requestId: string;
    apiVersion: string;
  };
}
```

### Success Response Example

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "employeeCode": "EMP001",
    "firstName": "John",
    "lastName": "Doe"
  },
  "meta": {
    "timestamp": "2024-12-26T10:30:00Z",
    "requestId": "req-123",
    "apiVersion": "v1"
  }
}
```

### Error Response Example

```json
{
  "success": false,
  "error": {
    "code": "E3001",
    "message": "Employee not found",
    "details": {
      "employeeId": "invalid-id"
    }
  },
  "meta": {
    "timestamp": "2024-12-26T10:30:00Z",
    "requestId": "req-124",
    "apiVersion": "v1"
  }
}
```

---

## Error Handling

### Error Code Taxonomy

| Code Range | Category | Description |
|------------|----------|-------------|
| E1xxx | Authentication | Token invalid, expired, or missing |
| E2xxx | Validation | Request validation failed |
| E3xxx | Resource | Resource not found or conflict |
| E4xxx | Business Logic | Business rule violation |
| E5xxx | System | Internal server error |

### Common Error Codes

| Code | Message | HTTP Status |
|------|---------|-------------|
| E1001 | Authentication required | 401 |
| E1002 | Invalid or expired token | 401 |
| E1003 | Rate limit exceeded | 429 |
| E2001 | Validation failed | 400 |
| E3001 | Resource not found | 404 |
| E3002 | Resource already exists | 409 |
| E4001 | Insufficient permissions | 403 |
| E5001 | Internal server error | 500 |

---

## Pagination

List endpoints support pagination using query parameters:

### Parameters

- `page`: Page number (default: 1, min: 1)
- `limit`: Results per page (default: 20, min: 1, max: 100)

### Example Request

```http
GET /employees?page=2&limit=50
```

### Example Response

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "pagination": {
      "page": 2,
      "limit": 50,
      "total": 523,
      "totalPages": 11
    },
    "timestamp": "2024-12-26T10:30:00Z",
    "requestId": "req-125",
    "apiVersion": "v1"
  }
}
```

---

## Caching

GET endpoints return cache-related headers:

```http
X-Cache: HIT | MISS
X-Cache-Key: api:/employees?page=1
X-Response-Time: 45ms
X-Performance-Level: FAST
```

### Cache Behavior

- **Cache Duration**: Varies by endpoint (5 minutes to 24 hours)
- **Cache Invalidation**: Automatic on POST, PUT, DELETE operations
- **Cache Control**: `Cache-Control: public, max-age=300` (for cacheable responses)

---

## API Modules

### 1. Employee Management

**Base Path**: `/employees`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/employees` | List all employees (paginated) |
| POST | `/employees` | Create new employee |
| GET | `/employees/{id}` | Get employee by ID |
| PUT | `/employees/{id}` | Update employee |
| DELETE | `/employees/{id}` | Delete employee (soft) |
| GET | `/employees/{id}/employment-history` | Get employment history |
| GET | `/employees/{id}/org-chart` | Get employee's org chart |

### 2. Organization Management

**Departments** (`/departments`):
- GET `/departments` - List departments
- POST `/departments` - Create department
- GET `/departments/{id}` - Get department
- PUT `/departments/{id}` - Update department
- DELETE `/departments/{id}` - Delete department

**Positions** (`/positions`):
- Similar CRUD operations

**Cost Centers** (`/cost-centers`):
- Similar CRUD operations

**Org Chart** (`/org-chart`):
- GET `/org-chart` - Get company-wide organizational chart

### 3. Payroll Processing

**Base Path**: `/payroll`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payroll/run` | Initiate async payroll run |
| GET | `/payroll/status/{runId}` | Get payroll run status |
| POST | `/payroll/approve/{runId}` | Approve payroll |
| GET | `/payroll/history` | Get payroll history |

**Payslips** (`/payslips`):
- GET `/payslips/{employeeId}` - Get employee's payslips
- GET `/payslips/detail/{id}` - Get detailed payslip

**Statutory** (`/statutory`):
- GET `/statutory/pf/returns` - PF returns (India)
- GET `/statutory/esi/returns` - ESI returns (India)
- GET `/statutory/pt/calculations` - PT calculations (India)

### 4. Leave Management

**Base Path**: `/leave`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/leave/policies` | List/Create leave policies |
| POST | `/leave/apply` | Submit leave application |
| PUT | `/leave/requests/{id}/approve` | Approve leave |
| PUT | `/leave/requests/{id}/reject` | Reject leave |
| GET | `/leave/balance/{employeeId}` | Get leave balance |
| GET | `/leave/calendar` | Get leave calendar |
| POST | `/leave/encash` | Submit encashment request |

### 5. Attendance Tracking

**Base Path**: `/attendance`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/attendance/clock-in` | Clock in |
| POST | `/attendance/clock-out` | Clock out |
| POST | `/attendance/regularize` | Request regularization |
| GET | `/attendance/report` | Get attendance report |
| GET | `/attendance/anomalies` | Get anomaly detection |
| POST | `/attendance/bulk-import` | Bulk import attendance |

### 6. Shift Management

**Base Path**: `/shifts`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/shifts` | List/Create shifts |
| GET/PUT/DELETE | `/shifts/{id}` | CRUD operations |
| POST | `/shifts/assign` | Assign shift to employees |
| GET | `/shifts/roster` | Get shift roster |

### 7. System Monitoring

**Base Path**: `/system`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/system/performance` | Get performance metrics |
| GET | `/system/jobs` | Get job queue status |

---

## Code Examples

### JavaScript/TypeScript

```typescript
// Using fetch
const response = await fetch('https://api.auraos.com/api/v1/employees', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
});

const data = await response.json();
console.log(data);

// Create employee
const newEmployee = await fetch('https://api.auraos.com/api/v1/employees', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    employeeCode: 'EMP001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    companyId: 'company-123',
  }),
});
```

### cURL

```bash
# List employees
curl -X GET "https://api.auraos.com/api/v1/employees?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"

# Create employee
curl -X POST "https://api.auraos.com/api/v1/employees" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeCode": "EMP001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@company.com",
    "companyId": "company-123"
  }'

# Run payroll (async)
curl -X POST "https://api.auraos.com/api/v1/payroll/run" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "tenant-123",
    "companyId": "company-123",
    "month": "2024-12",
    "countryCode": "IN"
  }'
```

### Python

```python
import requests

base_url = "https://api.auraos.com/api/v1"
headers = {
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json"
}

# List employees
response = requests.get(
    f"{base_url}/employees",
    headers=headers,
    params={"page": 1, "limit": 20}
)

employees = response.json()
print(employees)

# Create employee
new_employee = requests.post(
    f"{base_url}/employees",
    headers=headers,
    json={
        "employeeCode": "EMP001",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@company.com",
        "companyId": "company-123"
    }
)
```

---

## SDKs

Official SDKs are available for:

- **JavaScript/TypeScript**: `npm install @auraos/sdk`
- **Python**: `pip install auraos-sdk`
- **Java**: Maven/Gradle available
- **C#**: NuGet package available

### TypeScript SDK Example

```typescript
import { AuraOSClient } from '@auraos/sdk';

const client = new AuraOSClient({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.auraos.com/api/v1',
});

// List employees
const employees = await client.employees.list({
  page: 1,
  limit: 20,
});

// Create employee
const newEmployee = await client.employees.create({
  employeeCode: 'EMP001',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@company.com',
  companyId: 'company-123',
});

// Run payroll
const payrollRun = await client.payroll.run({
  companyId: 'company-123',
  month: '2024-12',
  countryCode: 'IN',
});
```

---

## Interactive Documentation

### Swagger UI

Access the interactive API explorer at:

**URL**: `https://api.auraos.com/docs`

Features:
- Try API endpoints directly from browser
- View request/response schemas
- See example responses
- Test authentication

### Postman Collection

Import our Postman collection:

**Collection URL**: `https://api.auraos.com/api/v1/docs/postman.json`

---

## Versioning

The API uses URL-based versioning:

- Current version: `/api/v1/*`
- When v2 is released: `/api/v2/*`
- v1 will be supported for 12 months after v2 release

### Deprecation Policy

- Deprecated endpoints will return `Deprecated: true` header
- 6-month notice before removal
- Migration guides provided

---

## Support

- **Documentation**: https://docs.auraos.com
- **API Status**: https://status.auraos.com
- **Support Email**: api-support@auraos.com
- **Developer Forum**: https://community.auraos.com

---

## Changelog

### v1.0.0 (2024-12-26)

- Initial API release
- 49 endpoints across 7 modules
- Complete HR, Payroll, Leave, and Attendance management
- Async processing support
- Performance monitoring
- Comprehensive error handling

---

**Last Updated**: December 26, 2024
