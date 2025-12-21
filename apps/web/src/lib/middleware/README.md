# Middleware Documentation

## Rate Limiting

### Overview

The rate limiting middleware implements a **token bucket algorithm** to protect APIs from abuse and ensure fair resource allocation.

### Features

- ✅ **Token Bucket Algorithm**: Smooth rate limiting with burst handling
- ✅ **In-Memory Storage**: No external dependencies (Redis optional)
- ✅ **Configurable Limits**: Per-endpoint customization
- ✅ **Automatic Cleanup**: Memory-efficient with periodic cleanup
- ✅ **Rate Limit Headers**: Standard HTTP headers for clients
- ✅ **Preset Limiters**: Ready-to-use configurations

### Basic Usage

```typescript
import { rateLimit } from '@/lib/middleware/rate-limit';

// Apply rate limiting to endpoint
export const POST = rateLimit()(async (request) => {
  // Your endpoint logic
  return NextResponse.json({ data: 'success' });
});
```

### Preset Rate Limiters

#### 1. Strict Rate Limit
For sensitive operations (login, password reset):
- **5 requests per 15 minutes**

```typescript
import { strictRateLimit } from '@/lib/middleware/rate-limit';

export const POST = strictRateLimit(async (request) => {
  // Password reset logic
  return NextResponse.json({ success: true });
});
```

#### 2. Auth Rate Limit
For authentication endpoints:
- **10 requests per 5 minutes**

```typescript
import { authRateLimit } from '@/lib/middleware/rate-limit';

export const POST = authRateLimit(async (request) => {
  // Login logic
  return NextResponse.json({ accessToken });
});
```

#### 3. API Rate Limit
For general API endpoints:
- **100 requests per 15 minutes**

```typescript
import { apiRateLimit } from '@/lib/middleware/rate-limit';

export const GET = apiRateLimit(async (request) => {
  // Fetch data
  return NextResponse.json({ data });
});
```

#### 4. Read Rate Limit
For read-only endpoints:
- **300 requests per 15 minutes**

```typescript
import { readRateLimit } from '@/lib/middleware/rate-limit';

export const GET = readRateLimit(async (request) => {
  // Fetch public data
  return NextResponse.json({ data });
});
```

### Custom Configuration

```typescript
import { rateLimit } from '@/lib/middleware/rate-limit';

export const POST = rateLimit({
  max: 50,                    // Max 50 requests
  windowMs: 60 * 1000,        // Per 1 minute
  message: 'Too many uploads', // Custom error message
})(async (request) => {
  return NextResponse.json({ success: true });
});
```

### Advanced Options

```typescript
export const POST = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000,

  // Custom key generator (default: IP + user ID)
  keyGenerator: (request) => {
    return request.headers.get('x-api-key') || 'anonymous';
  },

  // Skip rate limiting for certain requests
  skip: (request) => {
    return request.headers.get('x-admin-override') === 'true';
  },

  // Custom handler when limit is reached
  onLimitReached: (request, key) => {
    console.log(`Rate limit exceeded for ${key}`);
    // Send alert, log to monitoring service, etc.
  },
})(async (request) => {
  return NextResponse.json({ data: 'success' });
});
```

### Rate Limit Headers

Successful responses include these headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 2025-12-20T14:45:00.000Z
```

Rate-limited responses (429):

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 900
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0

{
  "success": false,
  "error": {
    "message": "Too many requests, please try again later",
    "code": "RATE_LIMIT_EXCEEDED",
    "retryAfter": 900
  }
}
```

### Configuration

Set default limits in environment variables:

```bash
# .env
RATE_LIMIT_MAX=100           # Max requests per window
RATE_LIMIT_WINDOW=900000     # Window in milliseconds (15 minutes)
```

### How It Works

#### Token Bucket Algorithm

1. **Initial State**: Each client starts with a bucket full of tokens (max limit)
2. **Request**: Each request consumes 1 token
3. **Refill**: Tokens are continuously refilled at a constant rate
4. **Limit**: Requests fail when no tokens are available

**Example** (10 requests per minute):
```
Initial: 10 tokens
After 1 req: 9 tokens
After 6 seconds: 10 tokens (refilled 1 token)
After 10 reqs in 5 sec: 0 tokens → 429 error
After 60 seconds: 10 tokens (fully refilled)
```

### Key Generation

Default key format:
```
IP address: "192.168.1.1"
Authenticated: "192.168.1.1:user-123"
```

Custom keys:
```typescript
keyGenerator: (request) => {
  // Per API key
  return request.headers.get('x-api-key');

  // Per tenant
  return request.headers.get('x-tenant-id');

  // Per user email
  const user = getUserFromRequest(request);
  return user.email;
}
```

### Memory Management

The middleware automatically cleans up old entries every 5 minutes to prevent memory leaks.

**Estimated Memory Usage:**
- ~100 bytes per unique client
- 10,000 clients ≈ 1 MB
- 100,000 clients ≈ 10 MB

### Combining with Other Middleware

```typescript
import { authRateLimit } from '@/lib/middleware/rate-limit';
import { withErrorHandling } from '@/lib/middleware/error-handler';
import { withEnhancedAuth } from '@/lib/auth';

// Stack multiple middleware
export const POST = authRateLimit(
  withErrorHandling(
    withEnhancedAuth(async (request, { user }) => {
      return NextResponse.json({ data: user });
    })
  )
);
```

### Administrative Functions

#### Check Rate Limit

```typescript
import { checkRateLimit } from '@/lib/middleware/rate-limit';

// Check remaining requests for a key
const { remaining, reset } = await checkRateLimit('192.168.1.1');
console.log(`${remaining} requests remaining until ${reset}`);
```

#### Reset Rate Limit

```typescript
import { resetRateLimit } from '@/lib/middleware/rate-limit';

// Reset limit for a specific client (admin override)
await resetRateLimit('192.168.1.1:user-123');
```

### Best Practices

#### 1. Apply Stricter Limits to Sensitive Endpoints

```typescript
// ❌ Don't use same limit for all endpoints
export const POST = rateLimit()(handler);

// ✅ Use stricter limits for auth endpoints
export const POST = strictRateLimit(handler); // 5/15min for login
export const POST = apiRateLimit(handler);    // 100/15min for data
```

#### 2. Use Custom Keys for Multi-Tenant Apps

```typescript
// ✅ Rate limit per tenant
keyGenerator: (request) => {
  const tenantId = request.headers.get('x-tenant-id');
  const ip = request.headers.get('x-forwarded-for');
  return `${tenantId}:${ip}`;
}
```

#### 3. Provide Clear Error Messages

```typescript
rateLimit({
  max: 5,
  windowMs: 60000,
  message: 'Too many password reset attempts. Please try again in 1 minute.',
})
```

#### 4. Skip Rate Limiting for Internal Services

```typescript
skip: (request) => {
  // Skip for requests from internal services
  const apiKey = request.headers.get('x-api-key');
  return apiKey === process.env.INTERNAL_API_KEY;
}
```

#### 5. Log Rate Limit Violations

```typescript
onLimitReached: (request, key) => {
  logger.warn({
    key,
    url: request.url,
    userAgent: request.headers.get('user-agent'),
  }, 'Rate limit exceeded');

  // Send to monitoring service
  metrics.increment('rate_limit.exceeded', { endpoint: request.url });
}
```

### Testing

#### Test Rate Limiting

```typescript
// test/rate-limit.test.ts
import { POST } from '@/app/api/auth/login/route';

describe('Rate Limiting', () => {
  it('should allow requests within limit', async () => {
    const request = new NextRequest('http://localhost/api/auth/login');

    for (let i = 0; i < 5; i++) {
      const response = await POST(request);
      expect(response.status).toBe(200);
    }
  });

  it('should block requests exceeding limit', async () => {
    const request = new NextRequest('http://localhost/api/auth/login');

    // Make 11 requests (limit is 10)
    for (let i = 0; i < 11; i++) {
      const response = await POST(request);

      if (i < 10) {
        expect(response.status).toBe(200);
      } else {
        expect(response.status).toBe(429);
      }
    }
  });
});
```

### Production Considerations

#### 1. Use Redis for Multi-Instance Deployments

For applications running on multiple servers, use Redis instead of in-memory storage:

```typescript
// lib/middleware/rate-limit-redis.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

class RedisStore {
  async get(key: string) {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, record: any, ttl: number) {
    await redis.set(key, JSON.stringify(record), 'PX', ttl);
  }
}
```

#### 2. Monitor Rate Limit Violations

```typescript
import { logger } from '@/lib/logger';

onLimitReached: (request, key) => {
  logger.warn({
    type: 'rate-limit-exceeded',
    key,
    endpoint: request.url,
  });

  // Alert if too many violations
  if (violations > threshold) {
    sendAlert('High rate limit violations detected');
  }
}
```

#### 3. Implement Progressive Rate Limiting

```typescript
// Slower limits for repeated violations
const violations = await getViolationCount(key);

const max = violations > 5
  ? 10   // Stricter limit after violations
  : 100; // Normal limit
```

### Common Use Cases

#### 1. Login Endpoint
```typescript
export const POST = authRateLimit(loginHandler);
// 10 requests per 5 minutes
```

#### 2. Password Reset
```typescript
export const POST = strictRateLimit(passwordResetHandler);
// 5 requests per 15 minutes
```

#### 3. File Upload
```typescript
export const POST = rateLimit({
  max: 20,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many uploads, please try again later',
})(uploadHandler);
```

#### 4. Search Endpoint
```typescript
export const GET = rateLimit({
  max: 300,
  windowMs: 15 * 60 * 1000,
})(searchHandler);
```

#### 5. Public API
```typescript
export const GET = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000, // 1 hour
  keyGenerator: (req) => req.headers.get('x-api-key') || 'anonymous',
})(publicApiHandler);
```

### Troubleshooting

#### Issue: Rate limiting too aggressive

**Solution**: Increase limits or window:
```typescript
rateLimit({ max: 200, windowMs: 15 * 60 * 1000 })
```

#### Issue: Memory usage increasing

**Solution**: Check cleanup interval or use Redis

#### Issue: Users getting rate limited unexpectedly

**Check**:
1. Multiple users behind same IP (corporate network)
2. Incorrect key generation
3. Window duration too short

**Solution**: Use user-specific keys:
```typescript
keyGenerator: (request) => {
  const userId = getUserFromRequest(request);
  return userId || getIp(request);
}
```

### Migration from express-rate-limit

```typescript
// Before (Express)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use('/api/', limiter);

// After (Next.js)
import { apiRateLimit } from '@/lib/middleware/rate-limit';
export const GET = apiRateLimit(handler);
export const POST = apiRateLimit(handler);
```
