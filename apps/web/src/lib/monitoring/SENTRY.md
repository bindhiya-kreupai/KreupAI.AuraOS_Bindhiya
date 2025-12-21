# Sentry Error Tracking Documentation

## Overview

Sentry is integrated into AuraOS to provide real-time error tracking, performance monitoring, and user analytics. This helps identify and fix issues quickly in production.

## Features

- ✅ **Client-Side Error Tracking** - Track JavaScript errors in the browser
- ✅ **Server-Side Error Tracking** - Track Node.js errors in API routes
- ✅ **Edge Runtime Support** - Track errors in Edge functions
- ✅ **Performance Monitoring** - Track slow API endpoints and queries
- ✅ **User Context** - Associate errors with specific users and tenants
- ✅ **Breadcrumbs** - See the path users took before an error
- ✅ **Session Replay** - Watch video replays of user sessions (when errors occur)
- ✅ **Custom Context** - Add business-specific metadata to errors
- ✅ **Source Maps** - See original TypeScript code in stack traces

## Setup

### 1. Create Sentry Account

1. Go to [sentry.io](https://sentry.io)
2. Create an account or sign in
3. Create a new project (Next.js)
4. Copy your DSN (Data Source Name)

### 2. Configure Environment Variables

Add to your `.env` file:

```bash
# Server-side DSN (keep secret)
SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/7890123

# Client-side DSN (public)
NEXT_PUBLIC_SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/7890123

# Environment
SENTRY_ENVIRONMENT=production
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production

# For CI/CD (uploading source maps)
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
```

### 3. Configuration Files

The following files configure Sentry:

- `sentry.client.config.ts` - Client-side configuration
- `sentry.server.config.ts` - Server-side configuration
- `sentry.edge.config.ts` - Edge runtime configuration

These files are automatically loaded by Next.js when the app starts.

## Usage

### Basic Error Tracking

```typescript
import { captureException, captureMessage } from '@/lib/monitoring/sentry';

try {
  // Your code
  throw new Error('Something went wrong');
} catch (error) {
  // Capture the error
  captureException(error as Error, {
    operation: 'user-registration',
    userId: user.id,
  });

  // Show error to user
  return { error: 'Failed to register user' };
}
```

### Tracking API Errors

```typescript
import { trackAPIError } from '@/lib/monitoring/sentry';

export async function POST(request: NextRequest) {
  try {
    // Your API logic
  } catch (error) {
    trackAPIError(
      error as Error,
      '/api/users',
      'POST',
      500,
      user.id
    );

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Setting User Context

```typescript
import { setUser, clearUser } from '@/lib/monitoring/sentry';

// After successful login
setUser({
  id: user.id,
  email: user.email,
  username: user.email,
  tenantId: user.tenantId,
});

// On logout
clearUser();
```

### Adding Breadcrumbs

Breadcrumbs help you understand what happened before an error:

```typescript
import { addBreadcrumb } from '@/lib/monitoring/sentry';

// Track user actions
addBreadcrumb('User clicked submit button', 'user-action', 'info');

// Track API calls
addBreadcrumb(
  'Fetching user data',
  'api',
  'info',
  {
    endpoint: '/api/users/123',
    method: 'GET',
  }
);

// Track state changes
addBreadcrumb(
  'Form validation failed',
  'validation',
  'warning',
  {
    errors: ['Email is required', 'Password too short'],
  }
);
```

### Tracking Database Errors

```typescript
import { trackDatabaseError } from '@/lib/monitoring/sentry';

try {
  const users = await prisma.user.findMany({
    where: { tenantId: 'tenant-1' },
  });
} catch (error) {
  trackDatabaseError(
    error as Error,
    'SELECT * FROM User WHERE tenantId = ?',
    { tenantId: 'tenant-1' }
  );
  throw error;
}
```

### Tracking Tenant Isolation Violations

```typescript
import { trackTenantViolation } from '@/lib/monitoring/sentry';

if (resourceTenantId !== userTenantId) {
  trackTenantViolation(
    userId,
    userTenantId,
    resourceTenantId,
    'User',
    resourceId
  );

  throw new TenantIsolationError('Access denied');
}
```

### Tracking Performance

```typescript
import { trackPerformance } from '@/lib/monitoring/sentry';

const startTime = Date.now();

// Your slow operation
await processLargeDataset();

const duration = Date.now() - startTime;

trackPerformance('data-processing', duration, {
  recordCount: 10000,
  processingType: 'batch',
});
```

### Wrapping Functions with Error Tracking

```typescript
import { withErrorTracking } from '@/lib/monitoring/sentry';

const processPayment = withErrorTracking(
  async (orderId: string, amount: number) => {
    // Your payment logic
    await stripe.charges.create({ amount, ... });
  },
  {
    name: 'payment-processing',
    tags: { operation: 'payment' },
    context: { service: 'stripe' },
  }
);

// Errors in this function will automatically be tracked
await processPayment('order-123', 5000);
```

### Tracking Business Metrics

```typescript
import { trackBusinessMetric } from '@/lib/monitoring/sentry';

// Track signups
trackBusinessMetric({
  name: 'user-signup',
  value: 1,
  tags: {
    plan: 'professional',
    source: 'organic',
  },
});

// Track revenue
trackBusinessMetric({
  name: 'revenue',
  value: 99.99,
  unit: 'usd',
  tags: {
    product: 'subscription',
  },
});
```

## Integration with Existing Code

### Service Layer Integration

Update your base service to automatically track errors:

```typescript
// lib/services/base.service.ts
import { captureException } from '@/lib/monitoring/sentry';

export class BaseService {
  protected handleError(error: Error, operation: string, context?: any): ServiceResponse {
    // Log to Sentry
    captureException(error, {
      service: this.serviceName,
      operation,
      ...context,
    });

    // Log locally
    this.logger.error({ error, operation, context }, 'Service error');

    return {
      success: false,
      error: 'An error occurred',
    };
  }
}
```

### Middleware Integration

Track errors in authentication middleware:

```typescript
// lib/auth/middleware.ts
import { trackAuthError } from '@/lib/monitoring/sentry';

export async function withAuth(handler: Handler) {
  try {
    const token = extractToken(request);
    const user = await verifyToken(token);

    return await handler(request, { user });
  } catch (error) {
    trackAuthError(error as Error, email, 'token-verification-failed');
    return unauthorized();
  }
}
```

### Tenant Isolation Integration

Already integrated! See [lib/middleware/tenant-isolation.ts](../middleware/tenant-isolation.ts):

```typescript
import { trackTenantViolation } from '@/lib/monitoring/sentry';

export function validateTenantAccess(...) {
  if (resourceTenantId !== userTenantId) {
    trackTenantViolation(...);
    throw new TenantIsolationError('Access denied');
  }
}
```

## Best Practices

### 1. Don't Track Expected Errors

```typescript
// ❌ BAD - Don't track validation errors
if (!email) {
  captureException(new Error('Email required')); // Too noisy!
  return { error: 'Email required' };
}

// ✅ GOOD - Only track unexpected errors
try {
  await sendEmail(email);
} catch (error) {
  captureException(error); // This is unexpected and should be tracked
  return { error: 'Failed to send email' };
}
```

### 2. Add Meaningful Context

```typescript
// ❌ BAD - Generic error with no context
captureException(error);

// ✅ GOOD - Rich context for debugging
captureException(error, {
  operation: 'user-registration',
  userId: user.id,
  tenantId: user.tenantId,
  step: 'email-verification',
  provider: 'sendgrid',
});
```

### 3. Use Appropriate Severity Levels

```typescript
// Info - General information
captureMessage('User logged in', 'info');

// Warning - Something unusual but not an error
captureMessage('Slow database query detected', 'warning', {
  duration: 5000,
  query: 'SELECT ...',
});

// Error - Something went wrong
captureMessage('Payment processing failed', 'error');

// Fatal - Critical system failure
captureMessage('Database connection lost', 'fatal');
```

### 4. Filter Sensitive Data

The configuration files already filter sensitive data:

```typescript
// sentry.server.config.ts
beforeSend(event, hint) {
  // Remove sensitive headers
  if (event.request?.headers) {
    delete event.request.headers['authorization'];
    delete event.request.headers['cookie'];
  }

  return event;
}
```

### 5. Set User Context Early

```typescript
// In API middleware or authentication
export async function withEnhancedAuth(handler: Handler) {
  const user = await verifyToken(token);

  // Set user context for all subsequent errors
  setUser({
    id: user.id,
    email: user.email,
    tenantId: user.tenantId,
  });

  return await handler(request, { user });
}
```

## Source Maps

Source maps allow you to see original TypeScript code in Sentry stack traces.

### Automatic Upload (Vercel)

If deploying to Vercel, source maps are automatically uploaded. Just set:

```bash
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

### Manual Upload (Other Platforms)

```bash
# Install Sentry CLI
npm install -g @sentry/cli

# Upload source maps after build
sentry-cli releases files <release-version> upload-sourcemaps .next/static/chunks/

# Associate commits
sentry-cli releases set-commits <release-version> --auto
```

## Alerting

Configure alerts in Sentry dashboard:

### Critical Alerts (Immediate Notification)

- Tenant isolation violations
- Authentication failures (>10 per minute)
- Database connection failures
- Payment processing errors

### Warning Alerts (Daily Digest)

- Slow API endpoints (>2 seconds)
- High error rate (>1% of requests)
- Deprecated API usage

### Info Alerts (Weekly Report)

- New error types introduced
- Error trends over time
- User-reported issues

## Monitoring Dashboard

Key metrics to monitor in Sentry:

1. **Error Rate**: Errors per minute/hour
2. **Affected Users**: How many users are impacted
3. **Error Distribution**: Which endpoints/features have most errors
4. **Performance**: Slowest API endpoints
5. **User Sessions**: Session replays for debugging

## Testing

### Test Sentry Integration

```typescript
// Create a test endpoint to verify Sentry is working
// apps/web/src/app/api/test-sentry/route.ts

export async function GET() {
  throw new Error('This is a test error for Sentry');
}
```

Visit `/api/test-sentry` and check your Sentry dashboard.

### Test in Development

By default, Sentry doesn't send events in development (see `beforeSend` in config files). To test locally:

1. Temporarily comment out the development filter in `sentry.*.config.ts`
2. Trigger an error
3. Check your Sentry dashboard
4. Re-enable the filter

## Performance Impact

Sentry is designed to have minimal performance impact:

- **Client-side**: <5KB gzipped
- **Server-side**: <1ms overhead per request
- **Sampling**: 10% in production (configurable via `tracesSampleRate`)

## Cost Optimization

Sentry pricing is based on events and transactions. To optimize costs:

### 1. Filter Noisy Errors

```typescript
// sentry.*.config.ts
ignoreErrors: [
  'NetworkError',
  'Failed to fetch',
  'ResizeObserver loop',
  // Add other expected errors
],
```

### 2. Reduce Sampling Rate

```typescript
// Lower sample rate in production
tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
```

### 3. Use Error Grouping

Sentry automatically groups similar errors. Configure fingerprinting for better grouping:

```typescript
beforeSend(event, hint) {
  // Custom fingerprinting
  if (event.exception?.values?.[0]?.type === 'DatabaseError') {
    event.fingerprint = ['database-error', event.exception.values[0].value];
  }
  return event;
}
```

## Troubleshooting

### Errors Not Appearing in Sentry

1. Check environment variables are set correctly
2. Verify DSN is valid
3. Check `beforeSend` isn't filtering the error
4. Ensure you're not in development mode (errors are filtered by default)
5. Check network tab for failed Sentry requests

### Too Many Events

1. Increase error filtering (see `ignoreErrors` in config)
2. Lower sample rate
3. Fix recurring errors instead of ignoring them

### Missing Source Maps

1. Ensure `SENTRY_AUTH_TOKEN` is set
2. Check build logs for source map upload
3. Verify release name matches between code and uploads

## Security

### Environment Variables

- `SENTRY_DSN`: Can be public (client-side)
- `NEXT_PUBLIC_SENTRY_DSN`: Public (client-side)
- `SENTRY_AUTH_TOKEN`: Keep secret (CI/CD only)

### Data Privacy

Sentry automatically scrubs sensitive data:
- Passwords
- Credit card numbers
- Social security numbers
- API keys

Additional scrubbing is configured in `beforeSend`.

### Compliance

- **GDPR**: Sentry is GDPR compliant. Configure data retention in project settings.
- **HIPAA**: Sentry offers HIPAA-compliant hosting (Enterprise plan)
- **SOC 2**: Sentry is SOC 2 Type II certified

## Resources

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Best Practices](https://docs.sentry.io/platforms/javascript/best-practices/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Session Replay](https://docs.sentry.io/product/session-replay/)
