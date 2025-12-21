# AuraOS HCM API Documentation

**Version:** 1.0.0
**Base URL:** `/api`
**Authentication:** Bearer Token (JWT)

## Table of Contents

1. [Authentication](#authentication)
2. [Companies API](#companies-api)
3. [Departments API](#departments-api)
4. [Users API](#users-api)
5. [Roles API](#roles-api)
6. [Employees API](#employees-api)
7. [Error Responses](#error-responses)
8. [Rate Limiting](#rate-limiting)
9. [Pagination](#pagination)

---

## Authentication

All API endpoints require authentication using JWT Bearer tokens unless otherwise specified.

### Headers

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Authentication Endpoints

#### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "tenantId": "uuid"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "tenantId": "uuid"
  }
}
```

#### POST /api/auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST /api/auth/logout
Logout and invalidate tokens.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK):**
```json
{
  "success": true
}
```

---

## Companies API

### GET /api/companies
List all companies with filtering and pagination.

**Required Permission:** `companies:read`

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)
- `search` (string, optional): Search by name, code, or email
- `status` (string, optional): Filter by status (Active, Inactive, Suspended)
- `industry` (string, optional): Filter by industry
- `country` (string, optional): Filter by country
- `sortBy` (string, optional): Sort field (name, code, createdAt)
- `sortOrder` (string, optional): Sort order (asc, desc)

**Response (200 OK):**
```json
{
  "companies": [
    {
      "id": "uuid",
      "name": "Acme Corporation",
      "code": "ACME",
      "email": "info@acme.com",
      "phoneNumber": "+1234567890",
      "address": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "country": "USA",
      "zipCode": "94102",
      "industry": "Technology",
      "status": "Active",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "_count": {
        "employees": 150,
        "departments": 10
      }
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

### POST /api/companies
Create a new company.

**Required Permission:** `companies:create`

**Request Body:**
```json
{
  "name": "Acme Corporation",
  "code": "ACME",
  "email": "info@acme.com",
  "phoneNumber": "+1234567890",
  "address": "123 Main St",
  "city": "San Francisco",
  "state": "CA",
  "country": "USA",
  "zipCode": "94102",
  "industry": "Technology",
  "website": "https://acme.com",
  "description": "Leading technology company"
}
```

**Validation Rules:**
- `name`: Required, 2-100 characters
- `code`: Required, uppercase alphanumeric + underscores only, unique per tenant
- `email`: Valid email format
- `phoneNumber`: Valid phone format

**Response (201 Created):**
```json
{
  "id": "uuid",
  "name": "Acme Corporation",
  "code": "ACME",
  "status": "Active",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### GET /api/companies/[id]
Get company by ID.

**Required Permission:** `companies:read`

**Response (200 OK):**
```json
{
  "id": "uuid",
  "name": "Acme Corporation",
  "code": "ACME",
  "email": "info@acme.com",
  "phoneNumber": "+1234567890",
  "address": "123 Main St",
  "city": "San Francisco",
  "state": "CA",
  "country": "USA",
  "zipCode": "94102",
  "industry": "Technology",
  "website": "https://acme.com",
  "description": "Leading technology company",
  "status": "Active",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "_count": {
    "employees": 150,
    "departments": 10
  }
}
```

### PATCH /api/companies/[id]
Update company.

**Required Permission:** `companies:update`

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "newemail@acme.com",
  "industry": "Healthcare"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "name": "Updated Name",
  "email": "newemail@acme.com",
  "industry": "Healthcare",
  "updatedAt": "2024-01-02T00:00:00Z"
}
```

### DELETE /api/companies/[id]
Soft delete company.

**Required Permission:** `companies:delete`

**Query Parameters:**
- `force` (boolean, optional): Force delete even if has dependencies

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Company deleted successfully"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Cannot delete company with active employees or departments"
}
```

### POST /api/companies/[id]/activate
Activate a company.

**Required Permission:** `companies:update`

**Response (200 OK):**
```json
{
  "id": "uuid",
  "name": "Acme Corporation",
  "status": "Active",
  "updatedAt": "2024-01-02T00:00:00Z"
}
```

### POST /api/companies/[id]/suspend
Suspend a company.

**Required Permission:** `companies:update`

**Request Body:**
```json
{
  "reason": "Non-compliance with policies"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "name": "Acme Corporation",
  "status": "Suspended",
  "updatedAt": "2024-01-02T00:00:00Z"
}
```

### GET /api/companies/stats
Get company statistics.

**Required Permission:** `companies:read`

**Response (200 OK):**
```json
{
  "totalCompanies": 50,
  "activeCompanies": 45,
  "inactiveCompanies": 3,
  "suspendedCompanies": 2,
  "companiesByIndustry": {
    "Technology": 20,
    "Healthcare": 15,
    "Finance": 10,
    "Retail": 5
  },
  "companiesByCountry": {
    "USA": 30,
    "UK": 15,
    "Canada": 5
  },
  "totalEmployees": 5000,
  "totalDepartments": 200
}
```

---

## Departments API

### GET /api/departments
List all departments with filtering and pagination.

**Required Permission:** `departments:read`

**Query Parameters:**
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `search` (string, optional): Search by name or code
- `companyId` (string, optional): Filter by company
- `parentId` (string, optional): Filter by parent department
- `status` (string, optional): Filter by status
- `sortBy` (string, optional): Sort field
- `sortOrder` (string, optional): Sort order

**Response (200 OK):**
```json
{
  "departments": [
    {
      "id": "uuid",
      "name": "Engineering",
      "code": "ENG",
      "description": "Engineering department",
      "companyId": "uuid",
      "parentId": null,
      "status": "Active",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "_count": {
        "employees": 50,
        "childDepartments": 3
      }
    }
  ],
  "pagination": {
    "total": 20,
    "page": 1,
    "limit": 10,
    "pages": 2
  }
}
```

### POST /api/departments
Create a new department.

**Required Permission:** `departments:create`

**Request Body:**
```json
{
  "name": "Engineering",
  "code": "ENG",
  "description": "Engineering department",
  "companyId": "uuid",
  "parentId": "uuid"
}
```

**Validation Rules:**
- `name`: Required, 2-100 characters
- `code`: Required, uppercase alphanumeric + underscores, unique per company
- `companyId`: Required, valid company UUID
- `parentId`: Optional, valid department UUID (no circular references)

**Response (201 Created):**
```json
{
  "id": "uuid",
  "name": "Engineering",
  "code": "ENG",
  "companyId": "uuid",
  "parentId": "uuid",
  "status": "Active",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### GET /api/departments/[id]
Get department by ID.

**Required Permission:** `departments:read`

**Response (200 OK):**
```json
{
  "id": "uuid",
  "name": "Engineering",
  "code": "ENG",
  "description": "Engineering department",
  "companyId": "uuid",
  "parentId": null,
  "status": "Active",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "company": {
    "id": "uuid",
    "name": "Acme Corporation"
  },
  "parentDepartment": null,
  "_count": {
    "employees": 50,
    "childDepartments": 3
  }
}
```

### PATCH /api/departments/[id]
Update department.

**Required Permission:** `departments:update`

**Request Body:**
```json
{
  "name": "Updated Engineering",
  "description": "Updated description",
  "parentId": "new-parent-uuid"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "name": "Updated Engineering",
  "description": "Updated description",
  "updatedAt": "2024-01-02T00:00:00Z"
}
```

### DELETE /api/departments/[id]
Soft delete department.

**Required Permission:** `departments:delete`

**Query Parameters:**
- `force` (boolean, optional): Force delete even if has dependencies

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Department deleted successfully"
}
```

### GET /api/departments/hierarchy
Get department hierarchy tree.

**Required Permission:** `departments:read`

**Query Parameters:**
- `companyId` (string, optional): Filter by company

**Response (200 OK):**
```json
{
  "departments": [
    {
      "id": "uuid",
      "name": "Engineering",
      "code": "ENG",
      "parentId": null,
      "_count": {
        "employees": 50
      },
      "childDepartments": [
        {
          "id": "uuid",
          "name": "Frontend",
          "code": "FE",
          "parentId": "parent-uuid",
          "_count": {
            "employees": 20
          },
          "childDepartments": []
        },
        {
          "id": "uuid",
          "name": "Backend",
          "code": "BE",
          "parentId": "parent-uuid",
          "_count": {
            "employees": 30
          },
          "childDepartments": []
        }
      ]
    }
  ]
}
```

### GET /api/departments/stats
Get department statistics.

**Required Permission:** `departments:read`

**Response (200 OK):**
```json
{
  "totalDepartments": 50,
  "activeDepartments": 45,
  "inactiveDepartments": 5,
  "departmentsByCompany": {
    "company-uuid-1": 20,
    "company-uuid-2": 15,
    "company-uuid-3": 15
  },
  "totalEmployees": 1000,
  "averageEmployeesPerDepartment": 20
}
```

---

## Users API

### GET /api/users
List all users with filtering and pagination.

**Required Permission:** `users:read`

**Query Parameters:**
- `page`, `limit`, `search`, `status`, `sortBy`, `sortOrder`

**Response (200 OK):**
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "status": "Active",
      "emailVerified": true,
      "mfaEnabled": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "lastLoginAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

### POST /api/users
Create a new user.

**Required Permission:** `users:create`

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "email": "newuser@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "status": "Active",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### GET /api/users/[id]
Get user by ID.

**Required Permission:** `users:read`

### PATCH /api/users/[id]
Update user.

**Required Permission:** `users:update`

### DELETE /api/users/[id]
Soft delete user.

**Required Permission:** `users:delete`

---

## Roles API

### GET /api/roles
List all roles.

**Required Permission:** `roles:read`

### POST /api/roles
Create a new role.

**Required Permission:** `roles:create`

### GET /api/roles/[id]
Get role by ID.

**Required Permission:** `roles:read`

### PATCH /api/roles/[id]
Update role.

**Required Permission:** `roles:update`

### DELETE /api/roles/[id]
Delete role.

**Required Permission:** `roles:delete`

### POST /api/roles/[id]/permissions
Assign permissions to role.

**Required Permission:** `roles:update`

### DELETE /api/roles/[id]/permissions/[permissionId]
Remove permission from role.

**Required Permission:** `roles:update`

---

## Employees API

### GET /api/employees
List all employees.

**Required Permission:** `employees:read`

### POST /api/employees
Create a new employee.

**Required Permission:** `employees:create`

### GET /api/employees/[id]
Get employee by ID.

**Required Permission:** `employees:read`

### PATCH /api/employees/[id]
Update employee.

**Required Permission:** `employees:update`

### DELETE /api/employees/[id]
Delete employee.

**Required Permission:** `employees:delete`

---

## Error Responses

All error responses follow a consistent format:

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": {
    "email": "Invalid email format",
    "code": "Must be uppercase alphanumeric"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required",
  "message": "No valid authentication token provided"
}
```

### 403 Forbidden
```json
{
  "error": "Permission denied",
  "message": "User lacks required permission: companies:create"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found",
  "message": "Company with ID '123' not found"
}
```

### 409 Conflict
```json
{
  "error": "Resource conflict",
  "message": "Company with code 'ACME' already exists"
}
```

### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again in 60 seconds.",
  "retryAfter": 60
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

Rate limits are applied per user and endpoint type:

| Limit Type | Requests | Window |
|------------|----------|--------|
| API_USER | 100 | 1 minute |
| API_ADMIN | 200 | 1 minute |
| AUTH | 10 | 1 minute |

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## Pagination

All list endpoints support pagination with consistent parameters:

**Request:**
```
GET /api/companies?page=2&limit=20
```

**Response:**
```json
{
  "companies": [...],
  "pagination": {
    "total": 150,
    "page": 2,
    "limit": 20,
    "pages": 8,
    "hasNext": true,
    "hasPrev": true
  }
}
```

**Default Values:**
- `page`: 1
- `limit`: 10
- `maxLimit`: 100

---

## Tenant Isolation

All API requests are automatically scoped to the authenticated user's tenant. Users cannot access or modify data from other tenants.

**Automatic Tenant Filtering:**
- All queries include `tenantId` filter
- All creates include `tenantId` assignment
- All updates verify `tenantId` match
- Cross-tenant access returns 404 Not Found

---

## Security

### Authentication
- JWT tokens with 15-minute expiration
- Refresh tokens with 7-day expiration
- Secure password hashing with bcrypt
- MFA support (TOTP)

### Authorization
- Role-Based Access Control (RBAC)
- 40+ granular permissions
- Tenant-level role isolation
- System vs tenant roles

### Data Protection
- SQL injection prevention (Prisma ORM)
- XSS prevention (input sanitization)
- CSRF protection
- Rate limiting
- Complete audit logging

---

## Changelog

### Version 1.0.0 (2024-01-01)
- Initial release
- Companies CRUD operations
- Departments CRUD operations with hierarchy
- Users and Roles management
- Employee management
- Multi-tenant architecture
- RBAC implementation
- Complete API security

---

## Support

For API support, please contact: support@auraos.com

API Documentation Last Updated: 2024-01-15
