# Aviation Settings + Kuwait PIFSS Aggregation — Schema Design

**Issue:** [#36](https://github.com/KreupAI-Technologies/KreupAI.AuraOS/issues/36)
**Status:** design proposal — needs Payroll-Compliance + Industry-Vertical owners' input before migration
**Author:** Claude (initial draft 2026-06-01)

Phase 2 PR #54 wrapped the aviation settings route in 501 + auth and
annotated the Kuwait PIFSS dashboard's mock employee fixture with a
FIXME(#36). This document proposes the two persistence pieces needed
to fully close the issue.

---

## Part 1 — Aviation industry settings

### Current state

[apps/web/src/app/api/industry-aviation/settings/route.ts](../../apps/web/src/app/api/industry-aviation/settings/route.ts)
returns 501 from both GET and PUT. No backing model exists.

### Decisions needed

1. **Generic `IndustrySettings` model vs aviation-specific.**
   Other industry verticals (maritime, hospitality, retail) may need
   similar per-industry settings. A single `IndustrySettings` model
   keyed by `industryType` is more flexible but couples unrelated
   domains. Recommend industry-specific models — separate is
   cheaper than later untangling.

2. **One row per tenant vs per-company.** Aviation tenants may
   operate multiple airlines (rare but possible). Recommend
   per-company default with a tenant-level fallback.

3. **What fields beyond `airlineCode`?** The previous mock had only
   `settingsId` + `airlineCode`. Real aviation HR systems care about:
   IATA code, ICAO code, fleet type list, crew duty time
   regulations (FAA/EASA/ICAO Annex 6), pilot license tracking,
   medical-cert expiry windows, fatigue-management policies.

### Proposed model

```prisma
model IndustryAviationSettings {
  id           String @id @default(uuid())
  tenantId     String
  companyId    String?  // null = tenant-wide default

  airlineCode  String  // operational code, e.g. "KAI"
  iataCode     String? // 2-char IATA designator
  icaoCode     String? // 3-char ICAO designator

  // Duty-time regulation framework chosen
  dutyTimeRegulation String?  // 'FAA' | 'EASA' | 'ICAO' | 'CUSTOM'

  // Fleet types operated (config Json so adding/removing types is
  // not a schema change). Each entry:
  //   { type: 'NB' | 'WB' | 'REGIONAL' | 'CARGO',
  //     codes: string[],   // e.g. ['B737', 'A320']
  //     trainingDays: number }
  fleetConfig Json?

  // Crew-cert tracking windows in days before expiry
  pilotLicenseRenewalNoticeDays Int @default(30)
  medicalCertRenewalNoticeDays  Int @default(45)

  isActive     Boolean   @default(true)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  createdBy    String
  updatedBy    String
  isDeleted    Boolean   @default(false)
  deletedAt    DateTime?

  @@unique([tenantId, companyId])  // one settings row per tenant+company
  @@index([tenantId])
  @@map("aura_industry_aviation_settings")
}
```

### Route wiring after migration

```ts
export const GET = createProtectedRoute(
  async (_request, { auth }) => {
    const settings = await prisma.industryAviationSettings.findFirst({
      where: { tenantId: auth!.tenantId, isDeleted: false },
      orderBy: { companyId: 'asc' }, // company-specific overrides tenant-wide
    });
    return { success: true, data: settings ?? null };
  },
  { requiredPermissions: ['industry-aviation:read'], rateLimit: 'API_USER' }
);

export const PUT = createProtectedRoute(
  async (request, { auth }) => {
    const body = AviationSettingsSchema.parse(await request.json());
    const settings = await prisma.industryAviationSettings.upsert({
      where: {
        tenantId_companyId: { tenantId: auth!.tenantId, companyId: body.companyId ?? null },
      },
      create: {
        ...body,
        tenantId: auth!.tenantId,
        createdBy: auth!.userId,
        updatedBy: auth!.userId,
      },
      update: { ...body, updatedBy: auth!.userId },
    });
    return { success: true, data: settings };
  },
  { requiredPermissions: ['industry-aviation:write'], rateLimit: 'API_USER' }
);
```

### Effort

| Step                                     | Time                               |
| ---------------------------------------- | ---------------------------------- |
| Schema review by aviation-vertical owner | 1 cycle                            |
| Migration + Prisma generate              | 0.5 day                            |
| Wire GET/PUT to Prisma + tests           | 0.5 day                            |
| **Total**                                | **~1.5 days** once design approved |

---

## Part 2 — Kuwait PIFSS aggregation endpoint

### Current state

[apps/web/src/app/dashboard/payroll-compliance/kuwait-pifss/page.tsx](../../apps/web/src/app/dashboard/payroll-compliance/kuwait-pifss/page.tsx)
has a `FIXME(#36)` block. It hardcodes three fixture employees and posts
them to `/api/compliance/kuwait-pifss` for calculation. The calculator
backend itself is correct; the issue is upstream — the page needs real
employee data.

### Required schema change

Add a `sector` field to `EmployeeComplianceDetails`:

```prisma
// In packages/@aura/database/prisma/schema.prisma, model
// EmployeeComplianceDetails — add after `isLocalNational`:

  // Kuwait / GCC sector classification, drives PIFSS rate selection
  sector String?  // 'PRIVATE' | 'GOVERNMENT' | null (not applicable)
```

Plus an enum if we want strictness:

```prisma
enum ComplianceSector {
  PRIVATE
  GOVERNMENT
  MILITARY    // Kuwait-specific subdivision
}

// Then: sector ComplianceSector?
```

**Decision needed:** strict enum vs free-string. Other countries may
need different sector values (Saudi has its own, India doesn't use
sector for ESI). String is more flexible; enum is safer. Recommend
**string + free-form** with documented values per country in service
code.

### New aggregation endpoint

```
GET /api/v1/payroll-compliance/kuwait/eligible-employees
```

Returns the employees a tenant should run Kuwait PIFSS calculation
against. Filtered to:

- Active employment in this tenant
- Compensation record exists (basicSalary > 0)
- `EmployeeComplianceDetails.countryCode = 'KW'` OR the employee
  is GCC nationality working in Kuwait
- Compliance details has a non-null `sector`

Response shape (matches what the Kuwait PIFSS calculator API
already expects):

```ts
{
  success: true,
  data: {
    employees: Array<{
      employeeId: string,
      employeeName: string,
      nationality: string,    // ISO country code, e.g. 'KW', 'SA'
      sector: 'PRIVATE' | 'GOVERNMENT',
      basicSalary: number,
      socialAllowance: number,
    }>,
    asOfDate: string,
    eligibilityCriteria: {
      countryCode: 'KW',
      includesGccNationals: boolean,
    },
  },
}
```

### Route implementation

```ts
// apps/web/src/app/api/v1/payroll-compliance/kuwait/eligible-employees/route.ts

export const GET = withEnhancedAuth(async (request, { user, permissions }) => {
  if (!permissions.includes('payroll-compliance:read')) return forbidden();

  const employees = await prisma.employee.findMany({
    where: {
      company: { tenantId: user.tenantId },
      status: { name: 'ACTIVE' }, // adjust per status model
      complianceDetails: {
        countryCode: 'KW',
        nationality: { not: null },
        sector: { not: null },
      },
    },
    include: {
      complianceDetails: true,
      currentCompensation: true, // adjust per compensation model
    },
  });

  const data = employees
    .filter((e) => e.currentCompensation?.basicSalary && e.complianceDetails?.sector)
    .map((e) => ({
      employeeId: e.id,
      employeeName: `${e.firstName} ${e.lastName}`,
      nationality: e.complianceDetails!.nationality!,
      sector: e.complianceDetails!.sector!,
      basicSalary: e.currentCompensation!.basicSalary,
      socialAllowance: e.currentCompensation!.socialAllowance ?? 0,
    }));

  return NextResponse.json({
    success: true,
    data: {
      employees: data,
      asOfDate: new Date().toISOString(),
      eligibilityCriteria: { countryCode: 'KW', includesGccNationals: true },
    },
  });
});
```

### Dashboard page change

Replace the FIXME block in
[kuwait-pifss/page.tsx:62-84](../../apps/web/src/app/dashboard/payroll-compliance/kuwait-pifss/page.tsx)
with:

```ts
const handleCalculate = async () => {
  setLoading(true);
  try {
    // Fetch eligible employees from the tenant
    const eligibleRes = await fetch('/api/v1/payroll-compliance/kuwait/eligible-employees');
    const {
      data: { employees },
    } = await eligibleRes.json();
    if (!employees || employees.length === 0) {
      setResults([]);
      setError('No Kuwait-eligible employees configured in this tenant.');
      return;
    }

    // Calculate
    const response = await fetch('/api/compliance/kuwait-pifss', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employees,
        month: new Date().toISOString().slice(0, 7),
      }),
    });
    const data = await response.json();
    if (data.success) {
      setResults(data.data.results);
      setTotals(data.data.totals);
    }
  } catch (error) {
    console.error('Kuwait PIFSS calculation failed:', error);
  } finally {
    setLoading(false);
  }
};
```

### Effort

| Step                                                 | Time                             |
| ---------------------------------------------------- | -------------------------------- |
| Approve `sector` field shape (enum vs string)        | 1 cycle                          |
| Add column + migration + backfill                    | 0.5 day                          |
| Implement aggregation endpoint + permission key      | 0.5 day                          |
| Update dashboard page + add empty-state UI           | 0.5 day                          |
| Integration test with mixed-nationality fixture data | 0.5 day                          |
| **Total**                                            | **~2 days** once design approved |

---

## Combined effort for #35 + #36

If staffed in parallel: ~1 week to close both. If serial: ~1.5 weeks.

The schema decisions (per-tenant vs per-company, sector enum vs string,
single Json blob vs typed columns) materially affect the API surface,
so unilateral coding here would create rework risk. Holding for
stakeholder input.
