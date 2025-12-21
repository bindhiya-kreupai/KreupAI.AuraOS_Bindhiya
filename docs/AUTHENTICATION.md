# Authentication System Documentation

## Overview

The AuraOS HCM platform implements a secure JWT-based authentication system with session management, tenant isolation, and comprehensive audit logging.

## Architecture

### Components

1. **JWT Token Management** ([apps/web/src/lib/auth/jwt.ts](../apps/web/src/lib/auth/jwt.ts))
   - Access token generation and verification
   - Refresh token support
   - Token extraction from headers

2. **Password Management** ([apps/web/src/lib/auth/password.ts](../apps/web/src/lib/auth/password.ts))
   - Bcrypt password hashing
   - Password comparison
   - Password strength validation

3. **Authentication Middleware** ([apps/web/src/lib/auth/middleware.ts](../apps/web/src/lib/auth/middleware.ts))
   - JWT verification
   - User and session validation
   - Tenant isolation enforcement
   - Request authentication wrapper

4. **Authentication Endpoints**
   - `/api/auth/login` - User login
   - `/api/auth/logout` - User logout
   - `/api/auth/refresh` - Token refresh

## Authentication Flow

### 1. Login Flow

```
Client                    API                     Database
  |                        |                          |
  |--POST /api/auth/login->|                          |
  |  {email, password}     |                          |
  |                        |--Find User-------------->|
  |                        |<-User Data---------------|
  |                        |                          |
  |                        |--Verify Password---------|
  |                        |                          |
  |                        |--Create Session--------->|
  |                        |<-Session Created---------|
  |                        |                          |
  |                        |--Update Last Login------>|
  |                        |                          |
  |                        |--Create Audit Log------->|
  |                        |                          |
  |<-{accessToken,         |                          |
  |   refreshToken,        |                          |
  |   user, session}-------|                          |
```

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "rememberMe": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "tenantId": "tenant-uuid",
      "mfaEnabled": false,
      "employee": {
        "id": "emp-uuid",
        "firstName": "John",
        "lastName": "Doe"
      }
    },
    "session": {
      "id": "session-uuid",
      "createdAt": "2025-12-20T10:00:00.000Z"
    }
  },
  "message": "Login successful"
}
```

### 2. Authenticated Request Flow

```
Client                    Middleware                Database
  |                           |                         |
  |--GET /api/resource------->|                         |
  |  Authorization: Bearer... |                         |
  |                           |                         |
  |                           |--Extract Token----------|
  |                           |--Verify Token-----------|
  |                           |                         |
  |                           |--Validate User--------->|
  |                           |<-User Data--------------|
  |                           |                         |
  |                           |--Validate Session------>|
  |                           |<-Session Data-----------|
  |                           |                         |
  |                           |--Update Session-------->|
  |                           |  lastActive             |
  |                           |                         |
  |<-Resource Data------------|                         |
```

**Request:**
```http
GET /api/competency-library/categories
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Token Refresh Flow

```
Client                    API                     Database
  |                        |                          |
  |--POST /api/auth/refresh|                          |
  |  {refreshToken}        |                          |
  |                        |--Verify Refresh Token----|
  |                        |                          |
  |                        |--Validate User---------->|
  |                        |<-User Data---------------|
  |                        |                          |
  |                        |--Validate Session------->|
  |                        |<-Session Data------------|
  |                        |                          |
  |                        |--Generate New Access-----|
  |                        |  Token                   |
  |                        |                          |
  |<-{accessToken}---------|                          |
```

**Request:**
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Token refreshed successfully"
}
```

### 4. Logout Flow

```
Client                    API                     Database
  |                        |                          |
  |--POST /api/auth/logout>|                          |
  |  Authorization: Bearer |                          |
  |                        |--Authenticate User-------|
  |                        |                          |
  |                        |--Revoke Session--------->|
  |                        |                          |
  |                        |--Create Audit Log------->|
  |                        |                          |
  |<-Success Message-------|                          |
```

## Security Features

### 1. Password Security
- **Hashing**: Bcrypt with 10 salt rounds
- **Strength Requirements**:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character

### 2. JWT Security
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Token Types**:
  - Access Token: Short-lived (default 24h)
  - Refresh Token: Long-lived (default 7d)
- **Payload**:
  ```typescript
  {
    userId: string;
    email: string;
    tenantId: string;
    sessionId?: string;
    type: 'access' | 'refresh';
    iat: number;  // Issued at
    exp: number;  // Expiration
  }
  ```

### 3. Session Management
- Each login creates a new session record
- Sessions track:
  - IP address
  - Device information
  - Browser
  - Last active timestamp
  - Status (Active, Idle, Revoked)
- Sessions can be revoked on logout
- Session validation on every authenticated request

### 4. Tenant Isolation
- Every user belongs to a tenant
- JWT payload includes `tenantId`
- Middleware validates tenant access
- Cross-tenant data access is prevented

### 5. Audit Logging
- All authentication events are logged:
  - LOGIN
  - LOGOUT
  - TOKEN_REFRESH
  - FAILED_LOGIN_ATTEMPT
- Audit logs include:
  - User ID
  - Action
  - Module
  - Details
  - IP address
  - Timestamp

## Usage Guide

### Protecting API Routes

#### Method 1: Using `withAuth` Wrapper

```typescript
// apps/web/src/app/api/protected-resource/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const GET = withAuth(async (request: NextRequest, { user }) => {
  // User is automatically authenticated and available in context
  const resources = await prisma.resource.findMany({
    where: { tenantId: user.tenantId }, // Automatic tenant isolation
  });

  return NextResponse.json({
    success: true,
    data: resources,
  });
});
```

#### Method 2: Manual Authentication

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { user, error } = await authenticate(request);

  if (error) {
    return error;
  }

  // User is authenticated, proceed with logic
  // ...
}
```

### Enforcing Tenant Isolation

```typescript
import { requireTenantAccess } from '@/lib/auth';

export const GET = withAuth(async (request: NextRequest, { user, params }) => {
  const resource = await prisma.resource.findUnique({
    where: { id: params.id },
  });

  if (!resource) {
    return NextResponse.json(
      { success: false, error: 'Resource not found' },
      { status: 404 }
    );
  }

  // Validate tenant access
  const accessError = requireTenantAccess(user.tenantId, resource.tenantId);
  if (accessError) {
    return accessError;
  }

  return NextResponse.json({ success: true, data: resource });
});
```

## Environment Variables

Required environment variables in `.env`:

```bash
# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_EXPIRES_IN="7d"

# Database
DATABASE_URL="postgresql://..."
```

See [.env.example](../.env.example) for complete configuration.

## Error Handling

### Common Error Responses

#### 401 Unauthorized
```json
{
  "success": false,
  "error": "No authentication token provided"
}
```

```json
{
  "success": false,
  "error": "Token has expired"
}
```

```json
{
  "success": false,
  "error": "Invalid token"
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "error": "User account is not active"
}
```

```json
{
  "success": false,
  "error": "Access denied: Tenant mismatch"
}
```

## Best Practices

### 1. Token Storage (Client-Side)
- Store access token in memory (React state/context)
- Store refresh token in httpOnly cookie (more secure)
- Never store tokens in localStorage (XSS vulnerability)

### 2. Token Refresh Strategy
- Implement automatic token refresh before expiration
- Use refresh token to obtain new access token
- Handle token expiration gracefully

```typescript
// Example: Axios interceptor for automatic token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newAccessToken = await refreshAccessToken();
      originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
      return axios(originalRequest);
    }

    return Promise.reject(error);
  }
);
```

### 3. Session Management
- Implement session timeout for idle users
- Allow users to view and revoke active sessions
- Limit concurrent sessions per user (optional)

### 4. Security Hardening
- Use HTTPS in production
- Implement rate limiting on auth endpoints
- Add CAPTCHA for failed login attempts
- Enable MFA for sensitive accounts
- Rotate JWT secrets periodically
- Set appropriate CORS policies

## Testing

### Manual Testing with cURL

#### Login
```bash
curl -X POST http://localhost:3006/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

#### Authenticated Request
```bash
curl -X GET http://localhost:3006/api/competency-library/categories \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Refresh Token
```bash
curl -X POST http://localhost:3006/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

#### Logout
```bash
curl -X POST http://localhost:3006/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Troubleshooting

### Issue: "Invalid token"
- **Cause**: Token is malformed or signature doesn't match
- **Solution**: Verify JWT_SECRET is correct in environment

### Issue: "Token has expired"
- **Cause**: Access token lifetime exceeded
- **Solution**: Use refresh token to obtain new access token

### Issue: "User account is not active"
- **Cause**: User status is not "Active" in database
- **Solution**: Update user status or contact administrator

### Issue: "Session is not active"
- **Cause**: Session was revoked or expired
- **Solution**: Re-authenticate via login

## Future Enhancements

- [ ] Multi-Factor Authentication (MFA)
- [ ] OAuth 2.0 / OIDC integration
- [ ] SAML SSO support
- [ ] Biometric authentication
- [ ] Device fingerprinting
- [ ] Anomaly detection
- [ ] Password-less authentication
- [ ] Session concurrency limits

## Related Documentation

- [API Documentation](./API.md)
- [Database Schema](./DATABASE.md)
- [Security Guidelines](./SECURITY.md)
- [Deployment Guide](./DEPLOYMENT.md)
