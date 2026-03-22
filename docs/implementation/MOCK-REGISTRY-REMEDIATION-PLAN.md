# Universal Mock Registry — Remediation Plan

**Document Version**: 1.0
**Last Updated**: March 22, 2026
**Owner**: Claude (Planning Agent)
**Priority**: CRITICAL (R1 — highest risk item in the program)
**Target Completion**: Week 1

---

## 1. What It Is

Two files form the universal mock system:

**File 1**: `apps/web/src/lib/mock-registry.ts`
- A flat key-value map of 25 hardcoded mock data entries across 8 business domains
- Exports a `getMockData(pathSegments)` lookup function with exact + partial matching

**File 2**: `apps/web/src/app/api/[...route]/route.ts`
- A Next.js catch-all route handler that intercepts **every unmatched API request**
- Exports GET, POST, PUT, DELETE handlers
- **GET**: Returns mock data from registry or a 404
- **POST/PUT/DELETE**: Returns `{ success: true }` for **any path** — no registry lookup, no persistence

### Domains Covered

| Domain | Registry Keys |
|--------|--------------|
| Agriculture | `industry-agriculture/seasonal-labor/workers`, `housing/facilities`, `crop-cycles`, `analytics`, `settings` |
| Collaboration | `collaboration/whiteboards`, `kanban`, `standups` |
| Mobile App | `mobile-app/config`, `notifications`, `analytics` |
| Energy | `energy/smart-grid/meters`, `water/meters`, `renewable-assets`, `settings` |
| Master Data | `master-data/banks`, `companies`, `locations`, `departments` |
| Construction | `industry-construction/projects`, `sites` |
| Education | `industry-education/students`, `courses` |
| Automotive | `industry-automotive/vehicles` |

---

## 2. Why This Is Critical

### Risk 1: Silent Data Fabrication in Production (CRITICAL)

There is **zero environment gating**. No `NODE_ENV` check. No `process.env` check. If deployed, any API call to an unmatched route returns fake data or fake success.

### Risk 2: Unauthenticated Access (CRITICAL)

The catch-all does **not** use `withAuth`, `withEnhancedAuth`, or `authenticate`. Every other significant API route in the codebase uses authentication middleware. The catch-all creates a backdoor.

### Risk 3: Write Operations Silently Succeed (CRITICAL)

POST, PUT, and DELETE handlers return generic success for **any path** without consulting the registry or persisting anything. If a frontend form submits to a route that doesn't exist yet, the user sees "success" but no data is saved.

### Risk 4: Masking Missing API Implementations (HIGH)

These domains have **no dedicated API route handlers** — they are entirely phantom APIs served by the catch-all:
- `industry-agriculture/*` — 0 route files
- `collaboration/*` — 0 route files
- `energy/*` — 0 route files
- `industry-construction/*` — 0 route files
- `industry-education/*` — 0 route files
- `industry-automotive/*` — 0 route files

### Risk 5: 147 Frontend Files Make `fetch('/api/...')` Calls

Without a systematic audit, it is impossible to know how many features are silently running on fake data through the catch-all.

---

## 3. Recommended Approach: Convert to Explicit 501 Responses

**Option C** from three evaluated options (Remove Entirely, Gate Behind NODE_ENV, Convert to 501).

### Why Option C

1. **Production safety**: No mock data served in production. Period.
2. **Developer experience**: Clear, actionable 501 errors that name the missing API
3. **Preservation of intent**: Mock registry keys serve as a roadmap of planned APIs
4. **Incremental migration**: Real APIs automatically take priority over the catch-all
5. **Audit trail**: Structured logging of unmatched requests creates visibility

### Why Not Option A (Delete Entirely)

Would break industry vertical pages (agriculture, construction, education, automotive, energy, collaboration) with opaque 404 errors and lose the directory of intended API paths.

### Why Not Option B (Gate Behind NODE_ENV)

Preserves the illusion that features work in development. Developers may not notice they're hitting mock data.

---

## 4. Implementation Steps

### Step 1: Replace the catch-all route handler

**File**: `apps/web/src/app/api/[...route]/route.ts`

Replace the entire file:

```typescript
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const isDev = process.env.NODE_ENV === 'development';

/**
 * Catch-all route handler for unmatched API paths.
 *
 * PRODUCTION: Returns 501 Not Implemented. Never serves mock data.
 * DEVELOPMENT: Returns 501 Not Implemented with diagnostic information.
 */
function buildErrorResponse(method: string, routePath: string[]) {
  const path = `/api/${routePath.join('/')}`;
  const timestamp = new Date().toISOString();

  const body: Record<string, unknown> = {
    error: 'Not Implemented',
    message: `API endpoint not implemented: ${method} ${path}`,
    messageAr: `نقطة نهاية API غير مطبقة: ${method} ${path}`,
    status: 501,
    path,
    method,
    timestamp,
  };

  if (isDev) {
    body.hint = 'This path has no dedicated route handler. Create a route.ts file in the corresponding app/api/ directory.';
  }

  // Structured logging
  console.warn(JSON.stringify({
    level: 'warn',
    msg: `Unimplemented API hit: ${method} ${path}`,
    method,
    path,
    timestamp,
    environment: process.env.NODE_ENV,
  }));

  return NextResponse.json(body, { status: 501 });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { route: string[] } }
) {
  return buildErrorResponse('GET', params.route);
}

export async function POST(
  _request: NextRequest,
  { params }: { params: { route: string[] } }
) {
  return buildErrorResponse('POST', params.route);
}

export async function PUT(
  _request: NextRequest,
  { params }: { params: { route: string[] } }
) {
  return buildErrorResponse('PUT', params.route);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { route: string[] } }
) {
  return buildErrorResponse('DELETE', params.route);
}

export async function PATCH(
  _request: NextRequest,
  { params }: { params: { route: string[] } }
) {
  return buildErrorResponse('PATCH', params.route);
}
```

### Step 2: Deprecate the mock registry

**File**: `apps/web/src/lib/mock-registry.ts`

Add deprecation header. Rename export to `mockRegistryReference`. Remove `getMockData` function export. Keep all existing entries as documentation of intended API paths.

### Step 3: Verify no other files import from mock-registry

Already verified: the only consumer of `getMockData` is the catch-all route itself. No cascade needed.

---

## 5. Impact Assessment

### Paths That Will Return 501 Instead of Mock Data

| Path Pattern | Current Behavior | New Behavior |
|---|---|---|
| `/api/industry-agriculture/*` | Hardcoded workers/facilities | 501 Not Implemented |
| `/api/collaboration/*` | Hardcoded whiteboards/kanban | 501 Not Implemented |
| `/api/mobile-app/config` | Hardcoded app config | 501 Not Implemented |
| `/api/mobile-app/analytics` | Hardcoded user stats | 501 Not Implemented |
| `/api/energy/*` | Hardcoded meter readings | 501 Not Implemented |
| `/api/industry-construction/*` | Hardcoded project data | 501 Not Implemented |
| `/api/industry-education/*` | Hardcoded student data | 501 Not Implemented |
| `/api/industry-automotive/*` | Hardcoded vehicle data | 501 Not Implemented |
| ANY POST/PUT/DELETE to unmatched path | `{ success: true }` | 501 Not Implemented |

### Paths NOT Affected

- `/api/master-data/*` — dedicated handlers exist and take priority
- `/api/mobile-app/notifications` — dedicated handler exists
- All other routes with explicit `route.ts` files

---

## 6. Files to Modify

| Action | File | Change |
|--------|------|--------|
| MODIFY | `apps/web/src/app/api/[...route]/route.ts` | Replace: mock serving → 501 responses + structured logging |
| MODIFY | `apps/web/src/lib/mock-registry.ts` | Deprecate: rename export, remove `getMockData`, add deprecation notice |
| MODIFY | `docs/implementation/MOCK-INVENTORY.md` | Update burn-down to mark registry as remediated |

No new files. No files deleted. No cascade risk.

---

## 7. Acceptance Criteria

1. The catch-all route returns HTTP 501 for all methods (GET/POST/PUT/DELETE/PATCH)
2. Response body includes `error`, `message`, `messageAr`, `status`, `path`, `method`, `timestamp`
3. In development mode, response includes `hint` field
4. Structured JSON logging emitted for every unmatched request
5. `mock-registry.ts` exports no active `getMockData` function
6. No other file in the codebase imports `getMockData`

---

## Related Documents

- [Mock Inventory](./MOCK-INVENTORY.md) — Full inventory of 420+ mock patterns across 182 files
- [Claude Planning Packet](./CLAUDE-PLANNING-PACKET.md) — Risk R1
- [Feature Completion Tracker](./FEATURE-COMPLETION-TRACKER.md)
