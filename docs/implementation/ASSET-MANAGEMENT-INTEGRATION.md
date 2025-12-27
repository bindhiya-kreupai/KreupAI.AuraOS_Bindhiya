# Asset Management - Backend-Frontend Integration Guide

**Date**: December 26, 2024
**Module**: Asset Management
**Status**: ✅ Fully Integrated

---

## 🔌 Integration Overview

The Asset Management module is fully wired with:
- ✅ **Backend APIs** properly authenticated with `withEnhancedAuth`
- ✅ **Service Layer** with business logic and validation
- ✅ **Database Schema** with Prisma ORM
- ✅ **Frontend UI** using DataPage component
- ✅ **Type Safety** with TypeScript strict mode

---

## 🏗️ Architecture Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE                          │
│   apps/web/src/app/(modules)/core-hr/asset-management/page.tsx  │
│                                                                   │
│   • DataPage Component Integration                               │
│   • Category Filters                                              │
│   • Dashboard Stats                                               │
│   • Alert Banners                                                 │
│   • Asset Form with 6 Sections                                   │
│   • Row Actions Menu                                              │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │ HTTP Requests (fetch)
                          │ /api/v1/assets/*
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│                       API LAYER (Next.js)                        │
│        apps/web/src/app/api/v1/assets/*/route.ts                │
│                                                                   │
│   • withEnhancedAuth Middleware                                  │
│   • Request Validation                                            │
│   • Error Handling                                                │
│   • Response Formatting                                           │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │ Service Layer Calls
                          │ AssetService.*()
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│                        SERVICE LAYER                             │
│         apps/web/src/lib/services/asset.service.ts              │
│                                                                   │
│   • Business Logic (15 Methods)                                  │
│   • Zod Validation (5 Schemas)                                   │
│   • Data Transformation                                           │
│   • Transaction Management                                        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │ Prisma Client Queries
                          │ prisma.asset.*()
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE (PostgreSQL)                       │
│      packages/@aura/database/prisma/schema.prisma               │
│                                                                   │
│   • Asset (30 fields)                                            │
│   • AssetAssignment (18 fields)                                  │
│   • AssetMaintenance (14 fields)                                 │
│   • AssetCategory (7 fields)                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

### 1. **Enhanced Auth Middleware**

Located at: `apps/web/src/lib/auth/enhanced-middleware.ts`

```typescript
export function withEnhancedAuth<T = any>(
  handler: (request: NextRequest, context: T & EnhancedAuthContext) => Promise<Response>
) {
  return async (request: NextRequest, routeContext: T) => {
    // 1. Authenticate user from JWT token
    const { context, error } = await authenticateWithPermissions(request);

    if (error) return error;

    // 2. Merge auth context with route context (params, etc.)
    const enhancedContext = {
      ...routeContext,      // { params: { id: '...' } }
      ...context!,          // { user, permissions, roles, employeeId }
    };

    // 3. Call handler with merged context
    return handler(request, enhancedContext);
  };
}
```

### 2. **Context Structure**

The `context` parameter in API handlers contains:

```typescript
interface EnhancedAuthContext {
  user: {
    userId: string;
    email: string;
    tenantId: string;
    // ... other JWT payload fields
  };
  permissions: Permission[];  // e.g., ['asset:read', 'asset:write']
  roles: string[];             // e.g., ['HR_MANAGER', 'ADMIN']
  employeeId?: string;

  // Plus Next.js route context
  params?: { id: string };     // For dynamic routes like /assets/[id]
}
```

### 3. **API Route Example**

**File**: `apps/web/src/app/api/v1/assets/[id]/route.ts`

```typescript
export const GET = withEnhancedAuth(
  async (request: NextRequest, context: any) => {
    // Access route params
    const { id } = context.params;

    // Access authenticated user
    const { user } = context;

    // Use tenantId for multi-tenant isolation
    const asset = await AssetService.findById(id, user.tenantId);

    return NextResponse.json({ success: true, data: asset });
  }
);
```

---

## 📡 API Endpoints Reference

### **Assets CRUD**

#### **GET /api/v1/assets**
**Description**: List assets with filtering and pagination

**Query Parameters**:
- `category` - Filter by category (COMPUTER, FURNITURE, etc.)
- `status` - Filter by status (AVAILABLE, ASSIGNED, etc.)
- `locationId` - Filter by location
- `condition` - Filter by condition
- `search` - Search in code, name, serial number
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `sortBy` - Sort field (default: createdAt)
- `sortOrder` - Sort direction (asc/desc, default: desc)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "assetCode": "AST-001",
      "assetName": "MacBook Pro 16\"",
      "category": "COMPUTER",
      "status": "AVAILABLE",
      // ... other fields
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    },
    "timestamp": "2024-12-26T...",
    "requestId": "uuid",
    "apiVersion": "v1"
  }
}
```

#### **POST /api/v1/assets**
**Description**: Create new asset

**Request Body**:
```json
{
  "assetCode": "AST-001",
  "assetName": "MacBook Pro 16\"",
  "category": "COMPUTER",
  "assetType": "Laptop",
  "description": "M3 Max, 64GB RAM",
  "serialNumber": "C02XY123456",
  "purchaseDate": "2024-01-15",
  "purchasePrice": 3499.99,
  "depreciationRate": 33.33,
  "warrantyEndDate": "2027-01-15"
}
```

#### **GET /api/v1/assets/:id**
**Description**: Get asset by ID with full details including assignments and maintenance

#### **PUT /api/v1/assets/:id**
**Description**: Update asset (partial update supported)

#### **DELETE /api/v1/assets/:id**
**Description**: Soft delete asset (sets status to DISPOSED)

### **Asset Operations**

#### **POST /api/v1/assets/:id/assign**
**Description**: Assign asset to employee

**Request Body**:
```json
{
  "employeeId": "emp-uuid",
  "expectedReturnDate": "2025-12-31",
  "conditionAtAssignment": "EXCELLENT",
  "assignmentNotes": "For remote work setup"
}
```

**Note**: `assignedBy` is automatically set from authenticated user

#### **GET /api/v1/assets/:id/history**
**Description**: Get complete assignment history for an asset

#### **GET /api/v1/assets/dashboard**
**Description**: Get dashboard statistics

**Response**:
```json
{
  "success": true,
  "data": {
    "total": 150,
    "available": 45,
    "assigned": 92,
    "inRepair": 8,
    "retired": 5,
    "categoryBreakdown": [
      { "category": "COMPUTER", "_count": 85 },
      { "category": "FURNITURE", "_count": 30 }
    ],
    "upcomingMaintenance": 5,
    "expiringWarranty": 3
  }
}
```

### **Assignment Management**

#### **POST /api/v1/asset-assignments/:id/return**
**Description**: Process asset return

**Request Body**:
```json
{
  "conditionAtReturn": "GOOD",
  "returnNotes": "Minor scratches on bottom case"
}
```

**Note**: `returnedBy` is automatically set from authenticated user

### **Maintenance Management**

#### **GET /api/v1/asset-maintenance**
**Description**: Get upcoming maintenance records

**Query Parameters**:
- `daysAhead` - Number of days to look ahead (default: 30)

#### **POST /api/v1/asset-maintenance**
**Description**: Schedule new maintenance

**Request Body**:
```json
{
  "assetId": "asset-uuid",
  "maintenanceType": "PREVENTIVE",
  "description": "Annual hardware inspection",
  "scheduledDate": "2025-01-15",
  "serviceProvider": "Apple Authorized Service",
  "cost": 299.99
}
```

#### **POST /api/v1/asset-maintenance/:id/complete**
**Description**: Mark maintenance as completed

**Request Body**:
```json
{
  "cost": 349.99  // Optional: update final cost
}
```

---

## 🎨 Frontend Integration

### **DataPage Component Usage**

The Asset Management UI uses the `DataPage` component from `@aura/ui`:

```typescript
<DataPage<Asset>
  title="Asset Management"
  description="Track and manage company assets..."
  icon={Monitor}
  apiEndpoint="/api/v1/assets"
  columns={columns}
  renderForm={renderForm}
  rowActions={rowActions}
  searchPlaceholder="Search by asset code, name, serial number..."
  filterOptions={{
    category: selectedCategory || undefined,
  }}
  onDataChange={fetchDashboardStats}
  enableExport
  exportFilename="assets"
/>
```

### **Key Features**

1. **Automatic CRUD Operations**
   - DataPage handles Create, Read, Update, Delete
   - Built-in modal dialogs
   - Form validation
   - Error handling

2. **Data Fetching**
   - Automatic API calls to `apiEndpoint`
   - Pagination support
   - Search and filter
   - Real-time updates

3. **Export Functionality**
   - CSV, Excel, JSON formats
   - Configurable filename
   - Filtered data export

4. **Custom Rendering**
   - `columns` array for table display
   - `renderForm` function for create/edit form
   - `rowActions` function for contextual actions

### **Dashboard Integration**

The dashboard fetches stats separately:

```typescript
const fetchDashboardStats = async () => {
  const response = await fetch('/api/v1/assets/dashboard');
  const result = await response.json();
  if (result.success) {
    setDashboardStats(result.data);
  }
};

useEffect(() => {
  fetchDashboardStats();
}, []);
```

This is called:
- On component mount
- After any data change (via `onDataChange` prop)

---

## 🔄 Data Flow Examples

### **Example 1: Creating an Asset**

1. **User Action**: Clicks "Add New" button
2. **UI**: Opens modal with form
3. **User**: Fills in asset details and clicks "Save"
4. **Frontend**:
   ```typescript
   const response = await fetch('/api/v1/assets', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(formData)
   });
   ```
5. **API Middleware**: `withEnhancedAuth` validates JWT token
6. **API Route**: Extracts `tenantId` from user context
7. **Service Layer**: Validates with Zod schema
8. **Service Layer**: Checks for duplicate `assetCode`
9. **Service Layer**: Creates asset in database
10. **API Route**: Returns success response
11. **Frontend**: Closes modal, refreshes table, shows success toast
12. **Frontend**: Calls `fetchDashboardStats()` to update stats

### **Example 2: Assigning an Asset**

1. **User Action**: Clicks "Assign to Employee" from row actions
2. **UI**: Opens assignment modal
3. **User**: Selects employee and fills details
4. **Frontend**:
   ```typescript
   const response = await fetch(`/api/v1/assets/${assetId}/assign`, {
     method: 'POST',
     body: JSON.stringify({
       employeeId: selectedEmployeeId,
       conditionAtAssignment: 'EXCELLENT',
       assignmentNotes: '...'
     })
   });
   ```
5. **API Middleware**: Validates auth, extracts `user.userId`
6. **API Route**: Adds `assignedBy: user.userId` to request
7. **Service Layer**: Validates asset is AVAILABLE
8. **Service Layer**: Creates assignment in transaction
9. **Service Layer**: Updates asset status to ASSIGNED
10. **Service Layer**: Sets `currentEmployeeId` and `currentAssignedAt`
11. **API Route**: Returns assignment record
12. **Frontend**: Updates table, shows success message

### **Example 3: Dashboard Stats Loading**

1. **Component Mount**: `useEffect` triggers
2. **Frontend**:
   ```typescript
   fetch('/api/v1/assets/dashboard')
   ```
3. **API Middleware**: Validates authentication
4. **Service Layer**: Calls `getDashboardStats(tenantId)`
5. **Service Layer**: Runs 8 parallel queries:
   - Count total assets
   - Count by status (AVAILABLE, ASSIGNED, IN_REPAIR, RETIRED)
   - Group by category
   - Count upcoming maintenance (next 7 days)
   - Count expiring warranties (next 30 days)
6. **API Route**: Returns aggregated stats
7. **Frontend**: Updates state, displays stat cards and alerts

---

## 🛡️ Security & Multi-Tenancy

### **Tenant Isolation**

Every API call enforces tenant isolation:

```typescript
// ✅ CORRECT: Uses tenantId from authenticated user
const assets = await prisma.asset.findMany({
  where: { tenantId: user.tenantId }
});

// ❌ WRONG: Missing tenantId filter
const assets = await prisma.asset.findMany();
```

### **User Context**

Authenticated user info is available in all API routes:

```typescript
const { user } = context;

console.log(user.userId);    // UUID of current user
console.log(user.tenantId);  // UUID of user's tenant
console.log(user.email);     // User's email
console.log(context.roles);  // ['HR_MANAGER', 'ADMIN']
console.log(context.employeeId);  // UUID (if user is employee)
```

### **Permission Checking**

While not implemented in current Asset APIs, permissions are available:

```typescript
const { permissions } = context;

if (!permissions.includes('asset:write')) {
  return NextResponse.json(
    { success: false, error: { code: 'E4001', message: 'Forbidden' }},
    { status: 403 }
  );
}
```

---

## 🧪 Testing the Integration

### **1. Test Authentication**

Try accessing without auth token:
```bash
curl http://localhost:3000/api/v1/assets
# Expected: 401 Unauthorized
```

### **2. Test Asset Creation**

```bash
curl -X POST http://localhost:3000/api/v1/assets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assetCode": "AST-TEST-001",
    "assetName": "Test Laptop",
    "category": "COMPUTER",
    "assetType": "Laptop",
    "purchasePrice": 1500
  }'
```

### **3. Test Asset Listing**

```bash
curl http://localhost:3000/api/v1/assets?category=COMPUTER&page=1&limit=10 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **4. Test Dashboard Stats**

```bash
curl http://localhost:3000/api/v1/assets/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **5. Test Asset Assignment**

```bash
curl -X POST http://localhost:3000/api/v1/assets/ASSET_ID/assign \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMPLOYEE_UUID",
    "conditionAtAssignment": "EXCELLENT"
  }'
```

---

## 🐛 Common Issues & Solutions

### **Issue 1: "User not found" Error**

**Cause**: JWT token is valid but user doesn't exist in database

**Solution**: Ensure user is properly seeded or created during registration

### **Issue 2: Context is undefined**

**Cause**: Not using `withEnhancedAuth` wrapper

**Solution**:
```typescript
// ❌ WRONG
export async function GET(request: NextRequest) {
  // context not available
}

// ✅ CORRECT
export const GET = withEnhancedAuth(
  async (request: NextRequest, context: any) => {
    // context available
  }
);
```

### **Issue 3: Params not accessible**

**Cause**: Incorrect destructuring

**Solution**:
```typescript
// ❌ WRONG
async (request, { params }) => {
  const { user } = (request as any).context;  // Won't work
}

// ✅ CORRECT
async (request, context) => {
  const { id } = context.params;
  const { user } = context;
}
```

### **Issue 4: Tenant isolation not working**

**Cause**: Missing `tenantId` in query

**Solution**: Always use `user.tenantId` from context:
```typescript
const assets = await AssetService.findAll({
  tenantId: user.tenantId,  // ✅ Required
  // ... other filters
});
```

---

## ✅ Integration Checklist

- [x] All API routes use `withEnhancedAuth` middleware
- [x] Context properly destructured (params + user)
- [x] TenantId enforced in all database queries
- [x] Service layer validates all inputs with Zod
- [x] Error responses follow standard format
- [x] Success responses include meta information
- [x] Frontend DataPage configured correctly
- [x] Dashboard stats endpoint created
- [x] Export functionality enabled
- [x] Row actions menu functional
- [x] Form validation working
- [x] Real-time updates after data changes

---

## 📚 Related Files

**Backend**:
- [Enhanced Middleware](../../apps/web/src/lib/auth/enhanced-middleware.ts) - Auth wrapper
- [Asset Service](../../apps/web/src/lib/services/asset.service.ts) - Business logic
- [Asset APIs](../../apps/web/src/app/api/v1/assets/) - REST endpoints
- [Prisma Schema](../../packages/@aura/database/prisma/schema.prisma) - Database models

**Frontend**:
- [Asset Management Page](../../apps/web/src/app/(modules)/core-hr/asset-management/page.tsx) - UI
- [DataPage Component](../../packages/@aura/ui/src/components/data-page.tsx) - CRUD wrapper

**Documentation**:
- [Implementation Plan](./ASSET-MANAGEMENT-IMPLEMENTATION.md) - Planning doc
- [Completion Report](./ASSET-MANAGEMENT-COMPLETION.md) - Summary

---

**Status**: ✅ **Fully Integrated and Tested**
**Date**: December 26, 2024
**Backend-Frontend Wiring**: Complete
