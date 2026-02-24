# Phase 3 Infrastructure Integration Guide

**Document Version**: 1.0
**Date**: January 22, 2026
**Status**: Integration Required
**Estimated Timeline**: 2 weeks
**Priority**: 🔴 CRITICAL

---

## Overview

This guide provides step-by-step instructions to integrate Phase 3 infrastructure packages into the main AuraOS application. All packages are complete and production-ready but currently not integrated.

**Packages to Integrate**:
1. @aura/messaging (RabbitMQ)
2. @aura/search (Elasticsearch)
3. @aura/auth (OAuth2/SAML/MFA)
4. @aura/monitoring (APM)
5. @aura/events (Event Bus)

---

## Prerequisites

### Verify Package Existence
```bash
# Verify all packages exist
ls -la packages/@aura/messaging
ls -la packages/@aura/search
ls -la packages/@aura/monitoring
ls -la packages/@aura/auth
ls -la packages/@aura/events

# All should show complete package structures
```

### Infrastructure Services Running
```bash
# Start infrastructure services
./scripts/init-infrastructure.sh

# Or manually
docker-compose -f docker-compose.infrastructure.yml up -d

# Verify services
docker-compose -f docker-compose.infrastructure.yml ps

# Expected output:
# - postgres (5432)
# - redis (6379)
# - rabbitmq (5672, 15672)
# - elasticsearch (9200)
# - kibana (5601)
```

---

## Day 1: Add Package Dependencies

### Step 1: Update apps/web/package.json

**File**: `apps/web/package.json`

```json
{
  "dependencies": {
    "@aura/config": "workspace:*",
    "@aura/database": "workspace:^",
    "@aura/types": "workspace:*",
    "@aura/ui": "workspace:*",

    // ADD THESE:
    "@aura/messaging": "workspace:*",
    "@aura/search": "workspace:*",
    "@aura/monitoring": "workspace:*",
    "@aura/auth": "workspace:*",
    "@aura/events": "workspace:*"
  }
}
```

### Step 2: Install Dependencies

```bash
cd apps/web/
pnpm install

# Verify packages are linked
ls -la node_modules/@aura/
# Should show: messaging, search, monitoring, auth, events
```

### Step 3: Verify Imports

**File**: `apps/web/src/test-imports.ts` (create temporarily)

```typescript
// Test all package imports
import { getQueueManager, QUEUES } from '@aura/messaging';
import { getSearchClient } from '@aura/search';
import { initializeAPM, trackMetric } from '@aura/monitoring';
import { createGoogleProvider, createSAMLProvider } from '@aura/auth';
import { getEventBus, createEmployeeCreatedEvent } from '@aura/events';

console.log('✅ All packages importable');

// Delete this file after verification
```

```bash
npx tsx apps/web/src/test-imports.ts
# Expected: ✅ All packages importable
```

---

## Days 2-3: Integrate Messaging (@aura/messaging)

### Current State
**File**: `apps/web/src/lib/queue/rabbitmq.ts`
- Custom RabbitMQ implementation (200+ lines)
- Needs to be replaced with @aura/messaging

### Step 1: Create New Queue Service Using Package

**File**: `apps/web/src/lib/queue/messaging.service.ts` (NEW)

```typescript
import { getQueueManager, QUEUES, EmailQueueService } from '@aura/messaging';

/**
 * Initialize messaging infrastructure
 */
export async function initializeMessaging() {
  const queueManager = getQueueManager();

  try {
    await queueManager.connect();
    console.log('✅ RabbitMQ connected via @aura/messaging');

    // Set up queue subscriptions
    await setupQueueSubscribers();

    return queueManager;
  } catch (error) {
    console.error('❌ Failed to initialize messaging:', error);
    throw error;
  }
}

/**
 * Set up queue message handlers
 */
async function setupQueueSubscribers() {
  const queueManager = getQueueManager();

  // Email notifications handler
  await queueManager.subscribe(
    QUEUES.EMAIL_NOTIFICATIONS.name,
    async (message) => {
      console.log('Processing email:', message);
      // TODO: Implement email sending logic
      // await sendEmail(message);
    }
  );

  // Payroll processing handler
  await queueManager.subscribe(
    QUEUES.PAYROLL_PROCESSING.name,
    async (message) => {
      console.log('Processing payroll:', message);
      // TODO: Implement payroll processing
      // await processPayroll(message);
    }
  );

  // Add more handlers as needed
  console.log('✅ Queue subscribers configured');
}

/**
 * Publish email notification to queue
 */
export async function queueEmail(params: {
  tenantId: string;
  to: string;
  subject: string;
  body: string;
  type?: string;
}) {
  const queueManager = getQueueManager();

  await queueManager.publish(QUEUES.EMAIL_NOTIFICATIONS.name, {
    tenantId: params.tenantId,
    to: params.to,
    subject: params.subject,
    body: params.body,
    type: params.type || 'generic',
    timestamp: new Date().toISOString(),
  });

  console.log(`✅ Email queued for ${params.to}`);
}

/**
 * Publish payroll processing job to queue
 */
export async function queuePayrollProcessing(params: {
  tenantId: string;
  payrollId: string;
  month: string;
  year: number;
}) {
  const queueManager = getQueueManager();

  await queueManager.publish(QUEUES.PAYROLL_PROCESSING.name, {
    tenantId: params.tenantId,
    payrollId: params.payrollId,
    month: params.month,
    year: params.year,
    timestamp: new Date().toISOString(),
  });

  console.log(`✅ Payroll processing queued: ${params.payrollId}`);
}

/**
 * Graceful shutdown
 */
export async function shutdownMessaging() {
  const queueManager = getQueueManager();
  await queueManager.disconnect();
  console.log('✅ Messaging shut down gracefully');
}
```

### Step 2: Initialize in App Startup

**File**: `apps/web/src/app/layout.tsx` or `apps/web/src/middleware.ts`

```typescript
import { initializeMessaging, shutdownMessaging } from '@/lib/queue/messaging.service';

// On app startup (e.g., in layout.tsx or custom server)
if (typeof window === 'undefined') {
  // Server-side only
  initializeMessaging().catch((error) => {
    console.error('Failed to start messaging:', error);
  });

  // Handle graceful shutdown
  process.on('SIGTERM', async () => {
    await shutdownMessaging();
    process.exit(0);
  });
}
```

### Step 3: Replace Existing Usage

Find and replace all occurrences:

```typescript
// OLD (apps/web/src/lib/queue/rabbitmq.ts):
import { RabbitMQConnection } from '@/lib/queue/rabbitmq';
const rabbitmq = new RabbitMQConnection();
await rabbitmq.connect();
await rabbitmq.publishToQueue('EMAIL_QUEUE', message);

// NEW:
import { queueEmail } from '@/lib/queue/messaging.service';
await queueEmail({
  tenantId: 'tenant-123',
  to: 'user@example.com',
  subject: 'Welcome',
  body: 'Welcome message',
});
```

### Step 4: Test Integration

```bash
# Start app
pnpm dev

# Check RabbitMQ management UI
open http://localhost:15672
# Username: auraos
# Password: auraos_rabbit_2024

# Verify queues are created and messages are flowing
```

### Step 5: Clean Up Old Code

```bash
# After successful testing, remove old implementations
rm apps/web/src/lib/queue/rabbitmq.ts
rm apps/web/src/lib/queue/old-queue.service.ts  # if exists

git add .
git commit -m "refactor: Integrate @aura/messaging package for RabbitMQ operations"
```

---

## Days 4-5: Integrate Search (@aura/search)

### Step 1: Initialize Elasticsearch Client

**File**: `apps/web/src/lib/search/search.service.ts` (NEW)

```typescript
import { getSearchClient } from '@aura/search';

/**
 * Initialize Elasticsearch
 */
export async function initializeSearch() {
  const searchClient = getSearchClient();

  try {
    await searchClient.connect();
    console.log('✅ Elasticsearch connected');

    // Create indices if they don't exist
    await searchClient.initializeIndices();
    console.log('✅ Search indices initialized');

    return searchClient;
  } catch (error) {
    console.error('❌ Failed to initialize search:', error);
    throw error;
  }
}

/**
 * Index an employee in Elasticsearch
 */
export async function indexEmployee(employee: {
  tenantId: string;
  employeeId: string;
  employeeNumber: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  designation: string;
  skills?: string[];
  location?: string;
}) {
  const searchClient = getSearchClient();

  await searchClient.indexDocument('aura_employees', employee.employeeId, {
    tenantId: employee.tenantId,
    employeeId: employee.employeeId,
    employeeNumber: employee.employeeNumber,
    fullName: employee.fullName,
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    phone: employee.phone,
    department: employee.department,
    designation: employee.designation,
    skills: employee.skills || [],
    location: employee.location,
    indexedAt: new Date().toISOString(),
  });

  console.log(`✅ Indexed employee: ${employee.fullName}`);
}

/**
 * Search employees
 */
export async function searchEmployees(params: {
  tenantId: string;
  query: string;
  page?: number;
  size?: number;
  filters?: {
    department?: string;
    location?: string;
    designation?: string;
  };
}) {
  const searchClient = getSearchClient();
  const { tenantId, query, page = 1, size = 20, filters = {} } = params;

  const must: any[] = [
    { term: { tenantId } },
  ];

  if (query) {
    must.push({
      multi_match: {
        query,
        fields: ['fullName^3', 'email^2', 'employeeNumber^2', 'skills'],
        fuzziness: 'AUTO',
      },
    });
  }

  if (filters.department) {
    must.push({ term: { 'department.keyword': filters.department } });
  }

  if (filters.location) {
    must.push({ term: { 'location.keyword': filters.location } });
  }

  if (filters.designation) {
    must.push({ term: { 'designation.keyword': filters.designation } });
  }

  const result = await searchClient.search('aura_employees', {
    tenantId,
    query: {
      bool: { must },
    },
    from: (page - 1) * size,
    size,
    sort: [{ '_score': 'desc' }],
  });

  return {
    employees: result.hits,
    total: result.total,
    page,
    size,
  };
}

/**
 * Autocomplete employee names
 */
export async function autocompleteEmployees(params: {
  tenantId: string;
  query: string;
  limit?: number;
}) {
  const searchClient = getSearchClient();
  const { tenantId, query, limit = 10 } = params;

  const result = await searchClient.search('aura_employees', {
    tenantId,
    query: {
      bool: {
        must: [
          { term: { tenantId } },
          {
            multi_match: {
              query,
              fields: ['fullName', 'email'],
              type: 'phrase_prefix',
            },
          },
        ],
      },
    },
    size: limit,
  });

  return result.hits.map((hit: any) => ({
    id: hit.employeeId,
    label: hit.fullName,
    email: hit.email,
  }));
}
```

### Step 2: Index Existing Employees

**File**: `apps/web/src/scripts/index-employees.ts` (NEW)

```typescript
import { prisma } from '@aura/database';
import { indexEmployee } from '@/lib/search/search.service';

/**
 * Bulk index all existing employees
 */
async function indexAllEmployees() {
  console.log('🔄 Starting employee indexing...');

  const employees = await prisma.employee.findMany({
    include: {
      department: true,
      position: true,
    },
  });

  let indexed = 0;
  for (const employee of employees) {
    await indexEmployee({
      tenantId: employee.tenantId,
      employeeId: employee.id,
      employeeNumber: employee.employeeCode,
      fullName: `${employee.firstName} ${employee.lastName}`,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone || undefined,
      department: employee.department?.name || 'Unknown',
      designation: employee.position?.title || 'Unknown',
      skills: [], // TODO: Add skills from profile
      location: undefined, // TODO: Add location
    });

    indexed++;
    if (indexed % 100 === 0) {
      console.log(`✅ Indexed ${indexed}/${employees.length} employees`);
    }
  }

  console.log(`🎉 Completed indexing ${indexed} employees`);
}

// Run if executed directly
if (require.main === module) {
  indexAllEmployees()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Indexing failed:', error);
      process.exit(1);
    });
}
```

```bash
# Run indexing
npx tsx apps/web/src/scripts/index-employees.ts
```

### Step 3: Add Search API Endpoint

**File**: `apps/web/src/app/api/employees/search/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { searchEmployees } from '@/lib/search/search.service';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const size = parseInt(searchParams.get('size') || '20');
    const department = searchParams.get('department') || undefined;
    const location = searchParams.get('location') || undefined;

    const results = await searchEmployees({
      tenantId: session.user.tenantId,
      query,
      page,
      size,
      filters: { department, location },
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
```

### Step 4: Add Search UI Component

**File**: `apps/web/src/components/employees/EmployeeSearch.tsx` (NEW)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@aura/ui';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

export function EmployeeSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      searchEmployees(debouncedQuery);
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  async function searchEmployees(searchQuery: string) {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/employees/search?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      setResults(data.employees || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Search employees..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        icon={<Search />}
      />

      {loading && (
        <div className="absolute top-full mt-1 w-full bg-white border rounded-md p-2">
          Loading...
        </div>
      )}

      {results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-white border rounded-md shadow-lg max-h-96 overflow-y-auto">
          {results.map((employee) => (
            <div
              key={employee.employeeId}
              className="p-3 hover:bg-gray-50 cursor-pointer"
            >
              <div className="font-medium">{employee.fullName}</div>
              <div className="text-sm text-gray-600">{employee.email}</div>
              <div className="text-xs text-gray-500">
                {employee.department} • {employee.designation}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Step 5: Auto-Index on Employee Changes

**File**: Update `apps/web/src/app/api/employees/route.ts`

```typescript
import { indexEmployee } from '@/lib/search/search.service';

export async function POST(request: Request) {
  // ... existing employee creation logic
  const employee = await prisma.employee.create({ data });

  // Index in Elasticsearch
  await indexEmployee({
    tenantId: employee.tenantId,
    employeeId: employee.id,
    // ... other fields
  }).catch((error) => {
    console.error('Failed to index employee:', error);
    // Don't fail the request if indexing fails
  });

  return NextResponse.json(employee);
}
```

---

## Days 6-8: Integrate OAuth2/SAML (@aura/auth)

### Step 1: Add OAuth2 Login Buttons

**File**: `apps/web/src/components/auth/SocialLogin.tsx` (NEW)

```typescript
'use client';

import { Button } from '@aura/ui';
import { FcGoogle } from 'react-icons/fc';
import { SiMicrosoft, SiOkta } from 'react-icons/si';

export function SocialLogin() {
  async function handleGoogleLogin() {
    window.location.href = '/api/auth/oauth/google';
  }

  async function handleMicrosoftLogin() {
    window.location.href = '/api/auth/oauth/microsoft';
  }

  async function handleOktaLogin() {
    window.location.href = '/api/auth/oauth/okta';
  }

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        className="w-full"
        onClick={handleGoogleLogin}
      >
        <FcGoogle className="mr-2 h-5 w-5" />
        Continue with Google
      </Button>

      <Button
        variant="outline"
        className="w-full"
        onClick={handleMicrosoftLogin}
      >
        <SiMicrosoft className="mr-2 h-5 w-5" />
        Continue with Microsoft
      </Button>

      <Button
        variant="outline"
        className="w-full"
        onClick={handleOktaLogin}
      >
        <SiOkta className="mr-2 h-5 w-5" />
        Continue with Okta
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>
    </div>
  );
}
```

### Step 2: Add OAuth2 Routes

**File**: `apps/web/src/app/api/auth/oauth/google/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createGoogleProvider } from '@aura/auth';

export async function GET(request: NextRequest) {
  try {
    const provider = createGoogleProvider();

    // Generate state token for CSRF protection
    const state = crypto.randomUUID();

    // Store state in session (implement your session storage)
    // await setSession('oauth_state', state);

    const authUrl = provider.getAuthorizationUrl(state);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect('/login?error=oauth_failed');
  }
}
```

**File**: `apps/web/src/app/api/auth/oauth/google/callback/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createGoogleProvider } from '@aura/auth';
import { prisma } from '@aura/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
      return NextResponse.redirect('/login?error=invalid_callback');
    }

    // Verify state token
    // const storedState = await getSession('oauth_state');
    // if (state !== storedState) {
    //   throw new Error('Invalid state');
    // }

    const provider = createGoogleProvider();

    // Exchange code for tokens
    const tokens = await provider.exchangeCodeForTokens(code);

    // Get user info
    const userInfo = await provider.getUserInfo(tokens.accessToken);

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: userInfo.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userInfo.email,
          firstName: userInfo.name.split(' ')[0],
          lastName: userInfo.name.split(' ').slice(1).join(' '),
          avatar: userInfo.picture,
          emailVerified: userInfo.emailVerified,
          authProvider: 'google',
          authProviderId: userInfo.id,
        },
      });
    }

    // Create session (implement your session logic)
    // await createSession(user);

    return NextResponse.redirect('/dashboard');
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect('/login?error=oauth_callback_failed');
  }
}
```

---

## Day 9: Integrate Monitoring (@aura/monitoring)

### Step 1: Initialize APM

**File**: `apps/web/src/lib/monitoring/apm-integration.ts` (NEW)

```typescript
import { initializeAPM, trackMetric, MetricType } from '@aura/monitoring';

/**
 * Initialize APM with Datadog
 */
export function setupAPM() {
  initializeAPM({
    serviceName: 'auraos-web',
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    datadogApiKey: process.env.DATADOG_API_KEY,
    enableProfiling: process.env.NODE_ENV === 'production',
    logLevel: process.env.LOG_LEVEL || 'info',
  });

  console.log('✅ APM initialized');
}

/**
 * Track business metrics
 */
export const Metrics = {
  trackUserLogin: (userId: string) => {
    trackMetric({
      name: 'aura.users.login',
      type: MetricType.COUNTER,
      value: 1,
      tags: { userId },
    });
  },

  trackPayrollProcessed: (payrollId: string, amount: number) => {
    trackMetric({
      name: 'aura.payroll.processed',
      type: MetricType.COUNTER,
      value: 1,
      tags: { payrollId },
    });
    trackMetric({
      name: 'aura.payroll.amount',
      type: MetricType.GAUGE,
      value: amount,
      tags: { payrollId },
    });
  },

  trackLeaveApproved: (leaveId: string) => {
    trackMetric({
      name: 'aura.leaves.approved',
      type: MetricType.COUNTER,
      value: 1,
      tags: { leaveId },
    });
  },
};
```

### Step 2: Track Metrics in Business Logic

```typescript
import { Metrics } from '@/lib/monitoring/apm-integration';

// In login handler
async function handleLogin(email: string, password: string) {
  const user = await authenticateUser(email, password);

  // Track login
  Metrics.trackUserLogin(user.id);

  return user;
}

// In payroll processing
async function processPayroll(payrollId: string) {
  const payroll = await calculatePayroll(payrollId);

  // Track payroll
  Metrics.trackPayrollProcessed(payrollId, payroll.totalAmount);

  return payroll;
}
```

---

## Day 10: Integrate Event Bus (@aura/events)

### Step 1: Initialize Event Bus

**File**: `apps/web/src/lib/events/event-integration.ts` (NEW)

```typescript
import { getEventBus, createEmployeeCreatedEvent } from '@aura/events';

/**
 * Initialize event bus and set up subscribers
 */
export function setupEventBus() {
  const eventBus = getEventBus();

  // Subscribe to EmployeeCreated events
  eventBus.subscribe('EmployeeCreated', async (event) => {
    console.log('Employee created:', event.payload);

    // Trigger downstream actions
    // - Send welcome email
    // - Create user account
    // - Index in Elasticsearch
    // - Notify managers
  });

  // Subscribe to EmployeeTerminated events
  eventBus.subscribe('EmployeeTerminated', async (event) => {
    console.log('Employee terminated:', event.payload);

    // Trigger downstream actions
    // - Disable user account
    // - Calculate final settlement
    // - Generate exit documents
    // - Remove from Elasticsearch
  });

  console.log('✅ Event bus configured');
}
```

### Step 2: Publish Events in Business Logic

```typescript
import { getEventBus, createEmployeeCreatedEvent } from '@aura/events';

async function createEmployee(data: any) {
  const employee = await prisma.employee.create({ data });

  // Publish event
  const eventBus = getEventBus();
  await eventBus.publish(
    createEmployeeCreatedEvent(
      data.tenantId,
      'system',
      {
        employeeId: employee.id,
        employeeNumber: employee.employeeCode,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        department: data.departmentId,
        designation: data.positionId,
        joinDate: employee.joinDate,
      }
    )
  );

  return employee;
}
```

---

## Testing Integration

### Test Checklist

- [ ] RabbitMQ: Queue a message and verify it's consumed
- [ ] Elasticsearch: Search for employees and verify results
- [ ] OAuth2: Login with Google and verify user creation
- [ ] APM: Verify metrics appear in Datadog dashboard
- [ ] Event Bus: Publish an event and verify subscribers receive it

### End-to-End Integration Test

```bash
# 1. Start infrastructure
./scripts/init-infrastructure.sh

# 2. Start application
pnpm dev

# 3. Test RabbitMQ
curl -X POST http://localhost:3000/api/test/queue-email

# 4. Test Elasticsearch
curl http://localhost:3000/api/employees/search?q=john

# 5. Test OAuth2
# Open http://localhost:3000/login and click Google login

# 6. Check RabbitMQ UI
open http://localhost:15672

# 7. Check Elasticsearch
curl http://localhost:9200/aura_employees/_search?pretty

# 8. Check Datadog (if configured)
# Navigate to Datadog dashboard
```

---

## Rollback Plan

If integration causes issues:

```bash
# 1. Revert package.json changes
git checkout apps/web/package.json
pnpm install

# 2. Revert new integration files
git checkout apps/web/src/lib/queue/messaging.service.ts
git checkout apps/web/src/lib/search/search.service.ts
# etc.

# 3. Restore old implementations
git checkout apps/web/src/lib/queue/rabbitmq.ts
git checkout apps/web/src/lib/monitoring/apm.ts

# 4. Restart application
pnpm dev
```

---

## Success Criteria

Integration is complete when:

- ✅ All 5 packages in apps/web/package.json
- ✅ RabbitMQ using @aura/messaging
- ✅ Employee search working via Elasticsearch
- ✅ OAuth2 login functional for at least one provider
- ✅ APM metrics being tracked
- ✅ At least one event being published and handled
- ✅ All tests passing
- ✅ No errors in production logs

---

## Next Steps

After successful integration:

1. **Phase 4 Microservices**: Begin extracting services using event bus
2. **Enhanced Search**: Add more search features (filters, facets)
3. **SAML SSO**: Configure for enterprise customers
4. **Event Store**: Move from in-memory to database-backed store
5. **Performance Tuning**: Optimize Elasticsearch queries and RabbitMQ throughput

---

**Document Owner**: Platform Engineering Team
**Status**: Ready for Implementation
**Last Updated**: January 22, 2026
