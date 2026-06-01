# Attendance Configuration Persistence — Schema Design

**Issue:** [#35](https://github.com/KreupAI-Technologies/KreupAI.AuraOS/issues/35)
**Status:** design proposal — needs HR + Workforce-Backend approval before migration is authored
**Author:** Claude (initial draft 2026-06-01)

This document proposes the 10 Prisma models needed to back the attendance
configuration routes that currently return mock data
([apps/web/src/app/api/attendance/{...}](../../apps/web/src/app/api/attendance/)).
The schema is deliberately reviewed BEFORE coding to avoid rework on
production migrations.

---

## Decisions needed before migration

1. **Per-company vs per-tenant scoping.** All proposed models include
   both `tenantId` and `companyId` (nullable). If a tenant operates
   one company per environment, `companyId` is redundant — confirm.
2. **JSON `config` blob vs. typed columns.** Proposed models use a
   single `config Json` for policy details. Pros: schema-stable as
   business rules evolve. Cons: no DB-level validation, harder
   reporting queries. Alternative: 10 fully-typed schemas. Pick one
   convention for all 10 — mixing produces inconsistent API surfaces.
3. **Soft delete vs hard delete.** Convention in the rest of the
   schema is soft delete (`isDeleted`, `deletedAt`). Following that
   here.
4. **Audit trail.** Each policy change should generate an `AuditLog`
   entry. Wire via `withAudit` middleware (already adopted across the
   v1 routes in PR #53/#59) — no schema work needed.
5. **Versioning.** Add `version Int @default(1)` for optimistic
   locking? Necessary if two admins can edit the same policy
   concurrently. Recommend YES.

---

## Common columns (every model)

```prisma
id          String    @id @default(uuid())
tenantId    String
companyId   String?       // null = applies to all companies in tenant
name        String
description String?
isActive    Boolean   @default(true)
version     Int       @default(1)
config      Json          // domain-specific policy details

createdAt   DateTime  @default(now())
updatedAt   DateTime  @updatedAt
createdBy   String
updatedBy   String

isDeleted   Boolean   @default(false)
deletedAt   DateTime?

@@index([tenantId])
@@index([tenantId, companyId, isActive])
@@unique([tenantId, name])  // policy names unique per tenant
```

---

## Model 1 — `TimeRoundingRule`

Route: `apps/web/src/app/api/attendance/time-rounding/route.ts`

```prisma
model TimeRoundingRule {
  // ... common columns ...
  applicableTo String   // 'ALL' | 'DEPARTMENT' | 'DESIGNATION' | 'CUSTOM'
  // config Json contains:
  //   { checkInRounding: 'NONE' | 'NEAREST' | 'UP' | 'DOWN',
  //     checkOutRounding: 'NONE' | 'NEAREST' | 'UP' | 'DOWN',
  //     roundingInterval: number,
  //     graceMinutes: number?,
  //     applyToCheckIn: boolean,
  //     applyToCheckOut: boolean,
  //     departments?: string[],
  //     designations?: string[] }

  @@map("aura_time_rounding_rule")
}
```

## Model 2 — `RosterConfig`

Route: `apps/web/src/app/api/attendance/roster/route.ts`

```prisma
model RosterConfig {
  // ... common columns ...
  // config Json contains:
  //   { rosterType: 'FIXED' | 'ROTATIONAL' | 'FLEXIBLE',
  //     weekStartsOn: 0..6,
  //     shifts: [{ shiftId, daysOfWeek[], hours: { start, end } }],
  //     rotationPattern?: string }

  @@map("aura_roster_config")
}
```

## Model 3 — `WorkFromHomePolicy`

Route: `apps/web/src/app/api/attendance/work-from-home/route.ts`

```prisma
model WorkFromHomePolicy {
  // ... common columns ...
  // config Json contains:
  //   { maxDaysPerMonth: number,
  //     maxConsecutiveDays: number,
  //     requiresApproval: boolean,
  //     approverChain: 'MANAGER' | 'HR' | 'BOTH',
  //     allowedDepartments?: string[],
  //     allowedRoles?: string[] }

  @@map("aura_wfh_policy")
}
```

## Model 4 — `ShiftSwapPolicy` + `ShiftSwapRequest`

Route: `apps/web/src/app/api/attendance/shift-swap/route.ts`

This route conflates POLICY (configuration) with REQUEST (entity). Split
into two:

```prisma
model ShiftSwapPolicy {
  // ... common columns ...
  // config Json contains:
  //   { advanceNoticeHours: number,
  //     requiresManagerApproval: boolean,
  //     maxSwapsPerMonth: number,
  //     allowedShiftTypes?: string[] }

  @@map("aura_shift_swap_policy")
}

model ShiftSwapRequest {
  id              String   @id @default(uuid())
  tenantId        String
  requestingEmpId String
  targetEmpId     String
  originalShiftDate DateTime
  newShiftDate    DateTime
  status          String   // 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
  reason          String?
  approverId      String?
  approvedAt      DateTime?
  rejectedReason  String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([tenantId, status])
  @@index([requestingEmpId])
  @@map("aura_shift_swap_request")
}
```

## Model 5 — `AttendanceRule`

Route: `apps/web/src/app/api/attendance/rules/route.ts`

```prisma
model AttendanceRule {
  // ... common columns ...
  ruleType String  // 'LATE_THRESHOLD' | 'EARLY_LEAVE' | 'OVERTIME' | etc.
  // config Json contains rule-specific config

  @@index([tenantId, ruleType])
  @@map("aura_attendance_rule")
}
```

## Model 6 — `GeofenceConfig`

Route: `apps/web/src/app/api/attendance/geo-fencing/route.ts`

```prisma
model GeofenceConfig {
  // ... common columns ...
  fenceType    String   // 'OFFICE' | 'BRANCH' | 'SITE' | 'CUSTOM'
  latitude     Float
  longitude    Float
  radiusMeters Int
  address      String?
  strictMode   Boolean  @default(false)
  // config Json contains optional fields:
  //   { allowedEmployees?: string[],
  //     allowedDepartments?: string[],
  //     allowedDesignations?: string[] }

  @@index([tenantId, isActive])
  @@map("aura_geofence_config")
}
```

## Model 7 — `IpRestriction`

Route: `apps/web/src/app/api/attendance/ip-restriction/route.ts`

```prisma
model IpRestriction {
  // ... common columns ...
  restrictionType String   // 'WHITELIST' | 'BLACKLIST'
  strictMode      Boolean  @default(false)
  // config Json contains:
  //   { ipAddresses: string[],
  //     ipRanges?: { start: string, end: string }[],
  //     applicableTo: 'ALL' | 'DEPARTMENT' | 'DESIGNATION' | 'CUSTOM',
  //     departments?: string[],
  //     designations?: string[] }

  @@map("aura_ip_restriction")
}
```

## Model 8 — `CompOffPolicy`

Route: `apps/web/src/app/api/attendance/comp-off/route.ts`

```prisma
model CompOffPolicy {
  // ... common columns ...
  // config Json contains:
  //   { earnsCompOffOn: 'WEEKEND' | 'HOLIDAY' | 'BOTH',
  //     minHoursForCompOff: number,
  //     maxAccumulation: number,
  //     expiryDays: number,
  //     requiresApproval: boolean }

  @@map("aura_comp_off_policy")
}
```

## Model 9 — `PunchRule`

Route: `apps/web/src/app/api/attendance/punch-rules/route.ts`

```prisma
model PunchRule {
  // ... common columns ...
  // config Json contains:
  //   { punchType: 'BIOMETRIC' | 'MOBILE' | 'WEB' | 'BADGE' | 'MIXED',
  //     allowedMethods: string[],
  //     requirePhoto: boolean,
  //     requireGeoLocation: boolean,
  //     maxPunchesPerDay: number }

  @@map("aura_punch_rule")
}
```

## Model 10 — `FieldForceConfig`

Route: `apps/web/src/app/api/attendance/field-force/route.ts`

```prisma
model FieldForceConfig {
  // ... common columns ...
  // config Json contains:
  //   { trackingMode: 'CONTINUOUS' | 'CHECK_IN_OUT' | 'PERIODIC',
  //     periodicIntervalMinutes?: number,
  //     allowedRegions?: { name, lat, lng, radius }[],
  //     requirePhotoOnCheckIn: boolean,
  //     allowOfflineMode: boolean }

  @@map("aura_field_force_config")
}
```

---

## Migration plan

After approval of the design above:

```bash
# 1. Add the 10 models to packages/@aura/database/prisma/schema.prisma
#    (single edit, all models go in the "Attendance Configuration" section)

# 2. Generate the migration
cd packages/@aura/database
pnpm prisma migrate dev --name add_attendance_configuration_models

# 3. Apply against the dev DB (CI will apply to staging/prod)
pnpm prisma migrate deploy

# 4. Regenerate Prisma client
pnpm prisma generate
```

The migration is purely additive — no destructive operations, so the
Phase 3 migration-safety gate (#43) won't trip.

---

## Route wiring template

After migration, each route is mechanical to wire. Template using
`TimeRoundingRule` as example:

```ts
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth, withAudit } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';

const ConfigSchema = z.object({
  checkInRounding: z.enum(['NONE', 'NEAREST', 'UP', 'DOWN']),
  checkOutRounding: z.enum(['NONE', 'NEAREST', 'UP', 'DOWN']),
  roundingInterval: z.number().int().positive(),
  // ... other fields ...
});

const TimeRoundingSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  applicableTo: z.enum(['ALL', 'DEPARTMENT', 'DESIGNATION', 'CUSTOM']),
  isActive: z.boolean().default(true),
  config: ConfigSchema,
});

// GET
export const GET = withEnhancedAuth(async (request, { user, permissions }) => {
  if (!permissions.includes('attendance:read')) return forbidden();
  const rules = await prisma.timeRoundingRule.findMany({
    where: { tenantId: user.tenantId, isDeleted: false },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ success: true, data: rules });
});

// POST (similar for PUT/DELETE) — wrap with withAudit
```

Per-route effort: ~30 min once the migration lands.
Total wiring time: ~5-8 hours across all 10 routes.

---

## Integration test pattern

Each route needs a test file at
`apps/web/src/app/api/attendance/<route>/__tests__/<route>.integration.test.ts`
using the [Phase 4 vitest.integration.config.ts](../../apps/web/vitest.integration.config.ts).

Pattern:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/__tests__/setup.integration';

describe('POST /api/attendance/time-rounding', () => {
  beforeEach(async () => {
    await prisma.timeRoundingRule.deleteMany();
  });

  it('persists a new rule with tenant scoping', async () => { ... });
  it('rejects cross-tenant reads', async () => { ... });
  it('returns 403 without attendance:write permission', async () => { ... });
  it('upserts policies with optimistic locking on version', async () => { ... });
});
```

---

## Effort estimate

| Step                                     | Time                                        |
| ---------------------------------------- | ------------------------------------------- |
| Schema design approval                   | 1 stakeholder review cycle                  |
| Migration authoring                      | 0.5 day                                     |
| Apply against dev + verify Prisma client | 0.5 day                                     |
| Wire 10 routes to Prisma                 | 1-1.5 days                                  |
| Integration tests (10 × ~4 cases)        | 1-2 days                                    |
| QA against real frontend                 | 0.5 day                                     |
| **Total**                                | **~5 working days** once design is approved |
