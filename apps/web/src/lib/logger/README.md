# Logging and Error Handling

## Overview

AuraOS uses **Pino** for high-performance structured logging and custom error classes for predictable error handling.

## Logger Setup

### Basic Usage

```typescript
import logger from '@/lib/logger';

// Simple logging
logger.info('User logged in');
logger.error('Database connection failed');
logger.warn('API rate limit approaching');
logger.debug('Processing request');

// Structured logging
logger.info({ userId: '123', action: 'login' }, 'User authenticated');
logger.error({ error, userId: '123' }, 'Failed to process payment');
```

### Child Loggers

Create contextual loggers for services:

```typescript
import { createLogger } from '@/lib/logger';

const serviceLogger = createLogger({ service: 'UserService' });
serviceLogger.info({ userId: '123' }, 'User created');
// Output: {"service":"UserService","userId":"123","msg":"User created"}
```

### Log Levels

- **trace**: Very detailed debugging (rarely used)
- **debug**: Detailed debugging information (development only)
- **info**: General informational messages
- **warn**: Warning messages for potentially harmful situations
- **error**: Error messages for serious problems
- **fatal**: Critical errors that may cause application termination

### Environment Configuration

Set log level via environment variable:

```bash
# Development (verbose)
LOG_LEVEL=debug

# Production (minimal)
LOG_LEVEL=info
```

## Specialized Logging Functions

### 1. HTTP Request Logging

```typescript
import { logRequest } from '@/lib/logger';

logRequest('GET', '/api/users', 200, 45, 'user-123');
// Logs: GET /api/users 200 - 45ms
```

### 2. Database Query Logging

```typescript
import { logQuery } from '@/lib/logger';

logQuery('SELECT * FROM users WHERE id = ?', 1250, 'user', 'findUnique');
// Automatically warns if query > 1000ms
```

### 3. Service Error Logging

```typescript
import { logServiceError } from '@/lib/logger';

logServiceError('UserService', 'createUser', error, { userId: '123' });
// Logs: UserService.createUser failed: User already exists
```

### 4. Authentication Events

```typescript
import { logAuthEvent } from '@/lib/logger';

logAuthEvent('login', 'user-123', 'john@example.com', '192.168.1.1');
logAuthEvent('failed-login', undefined, 'john@example.com', '192.168.1.1', 'Invalid password');
logAuthEvent('mfa-enabled', 'user-123', 'john@example.com');
```

### 5. Audit Trail

```typescript
import { logAudit } from '@/lib/logger';

logAudit('CREATE', 'User Management', 'admin-123', 'Created user john@example.com', 'user-456', '192.168.1.1');
```

### 6. Performance Metrics

```typescript
import { logMetric } from '@/lib/logger';

logMetric('api_response_time', 450, 'ms', { endpoint: '/api/users', method: 'GET' });
logMetric('database_connections', 25, 'count');
logMetric('memory_usage', 512000000, 'bytes');
```

### 7. Business Events

```typescript
import { logBusinessEvent } from '@/lib/logger';

logBusinessEvent('user_registered', { userId: '123', plan: 'enterprise' });
logBusinessEvent('license_allocated', { licenseId: 'lic-456', userId: '123' });
```

## Error Classes

### Custom Error Hierarchy

```typescript
import {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError,
  TenantIsolationError,
  BusinessRuleError,
} from '@/lib/errors';
```

### Error Usage Examples

#### 1. Validation Error

```typescript
if (!email || !password) {
  throw new ValidationError('Email and password are required', {
    fields: ['email', 'password'],
  });
}
```

#### 2. Authentication Error

```typescript
if (!validPassword) {
  throw new AuthenticationError('Invalid credentials', {
    email,
    attempt: loginAttempts,
  });
}
```

#### 3. Authorization Error

```typescript
if (!hasPermission(user, 'users:delete')) {
  throw new AuthorizationError('Insufficient permissions to delete users', {
    userId: user.id,
    requiredPermission: 'users:delete',
  });
}
```

#### 4. Not Found Error

```typescript
if (!user) {
  throw new NotFoundError('User', { userId });
}
```

#### 5. Conflict Error

```typescript
if (existingUser) {
  throw new ConflictError('User with this email already exists', {
    email,
  });
}
```

#### 6. Business Rule Error

```typescript
if (license.used > license.total) {
  throw new BusinessRuleError('Used licenses cannot exceed total licenses', {
    licenseId: license.id,
    used: license.used,
    total: license.total,
  });
}
```

#### 7. Database Error

```typescript
try {
  await prisma.user.create({ data });
} catch (error) {
  throw new DatabaseError('Failed to create user', { error });
}
```

### Error Properties

All custom errors include:

```typescript
{
  message: string;        // Human-readable error message
  statusCode: number;     // HTTP status code (400, 401, 403, 404, etc.)
  code: string;          // Machine-readable error code
  isOperational: boolean; // true if expected error, false if programming error
  context?: object;      // Additional error context
  stack?: string;        // Stack trace (development only)
}
```

## API Route Error Handling

### Method 1: Manual Error Handling

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { NotFoundError, ValidationError } from '@/lib/errors';
import { handleError } from '@/lib/middleware/error-handler';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(userId);

    if (!user) {
      throw new NotFoundError('User', { userId });
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    return handleError(error);
  }
}
```

### Method 2: Using Error Handler Wrapper

```typescript
import { withErrorHandling } from '@/lib/middleware/error-handler';

export const GET = withErrorHandling(async (request: NextRequest) => {
  const user = await getUser(userId);

  if (!user) {
    throw new NotFoundError('User', { userId });
  }

  return NextResponse.json({ data: user });
});
```

### Method 3: With Request Logging

```typescript
import { withErrorHandlingAndLogging } from '@/lib/middleware/error-handler';

export const GET = withErrorHandlingAndLogging(async (request: NextRequest) => {
  // Automatically logs request/response
  const user = await getUser(userId);
  return NextResponse.json({ data: user });
});
```

## Service Layer Integration

Services automatically log operations:

```typescript
export class UserService extends BaseService {
  constructor() {
    super('UserService'); // Creates logger with service context
  }

  async createUser(input) {
    try {
      const user = await this.prisma.user.create({ data: input });

      this.logger.info({ userId: user.id }, 'User created successfully');

      return { success: true, data: user };
    } catch (error) {
      this.logger.error({ error, input }, 'Failed to create user');
      return { success: false, error: 'Failed to create user' };
    }
  }
}
```

## Security Features

### 1. Sensitive Data Redaction

Pino automatically redacts sensitive fields:

```typescript
logger.info({
  user: {
    email: 'john@example.com',
    password: 'secret123', // Automatically redacted
    token: 'abc123',      // Automatically redacted
  }
});

// Output: { user: { email: 'john@example.com' } }
```

**Redacted fields:**
- `password`
- `token`
- `accessToken`
- `refreshToken`
- `apiKey`
- `secret`
- `authorization`
- `cookie`

### 2. Production vs Development

**Development:**
- Pretty-printed logs with colors
- Full stack traces
- Debug level logging

**Production:**
- JSON structured logs
- Error messages without stack traces
- Info level logging

## Log Output Examples

### Development Output

```
[14:23:45.123] INFO (UserService): User created successfully
    userId: "user-123"
    email: "john@example.com"

[14:23:46.456] ERROR (UserService): Failed to create user
    error: {
      "name": "DatabaseError",
      "message": "Connection timeout"
    }
```

### Production Output

```json
{"level":30,"time":"2025-12-20T14:23:45.123Z","service":"UserService","userId":"user-123","email":"john@example.com","msg":"User created successfully"}
{"level":50,"time":"2025-12-20T14:23:46.456Z","service":"UserService","error":{"name":"DatabaseError","message":"Connection timeout"},"msg":"Failed to create user"}
```

## Best Practices

### 1. Always Include Context

```typescript
// Bad
logger.error('Failed');

// Good
logger.error({ error, userId, operation: 'createUser' }, 'Failed to create user');
```

### 2. Use Appropriate Log Levels

```typescript
logger.debug('Request payload', { payload }); // Development debugging
logger.info('User logged in', { userId });     // Normal operations
logger.warn('Rate limit at 80%', { limit });   // Potential issues
logger.error('Database error', { error });     // Actual errors
```

### 3. Structured Data Over String Interpolation

```typescript
// Bad
logger.info(`User ${userId} created at ${timestamp}`);

// Good
logger.info({ userId, timestamp }, 'User created');
```

### 4. Log Business Events

```typescript
// Important business events
logBusinessEvent('subscription_upgraded', {
  userId,
  fromPlan: 'basic',
  toPlan: 'enterprise',
  revenue: 299,
});
```

### 5. Monitor Performance

```typescript
const startTime = Date.now();
const result = await expensiveOperation();
const duration = Date.now() - startTime;

if (duration > 1000) {
  logger.warn({ duration, operation: 'expensiveOperation' }, 'Slow operation detected');
}
```

## Integration with Monitoring Services

### Send Logs to External Services

```typescript
// Example: Send errors to Sentry
if (error.statusCode >= 500) {
  Sentry.captureException(error, {
    contexts: {
      error: error.context,
    },
  });
}
```

### Example Pino Transports (package.json)

```json
{
  "dependencies": {
    "pino": "^8.x",
    "pino-pretty": "^10.x",
    "@logtail/pino": "^0.4.x",      // For Logtail
    "pino-sentry": "^0.14.x"         // For Sentry
  }
}
```

## Query Log Analysis

Find slow queries:

```bash
# Development logs
grep "Slow query" logs/app.log

# Production logs (JSON)
cat logs/app.log | jq 'select(.type == "slow-query") | {query, duration}'
```

## Environment Variables

```bash
# .env
LOG_LEVEL=info              # trace, debug, info, warn, error, fatal
NODE_ENV=production         # Affects log formatting
VERCEL_GIT_COMMIT_SHA=abc   # Included in log metadata
```

## Files Structure

```
apps/web/src/lib/
├── logger/
│   ├── index.ts           # Main logger configuration
│   └── README.md          # This file
├── errors/
│   └── index.ts           # Custom error classes
└── middleware/
    └── error-handler.ts   # Error handling middleware
```
