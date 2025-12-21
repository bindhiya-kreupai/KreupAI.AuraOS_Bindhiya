# Database Indexes Documentation

## Current State Analysis

### Existing Indexes
The schema currently has **NO explicit `@@index` directives**. Only the following automatic indexes exist:

#### 1. Primary Keys (@id)
All models have UUID primary keys which are automatically indexed by PostgreSQL.

#### 2. Unique Constraints (@unique, @@unique)
The following unique constraints create implicit indexes:

**Tenant & Organization:**
- `Tenant.code` - @unique
- `Company.(tenantId, code)` - @@unique
- `Department.(companyId, code)` - @@unique
- `CostCenter.code` - @unique

**Location Master:**
- `Country.isoCode` - @unique

**Employee:**
- `Employee.userId` - @unique
- `Employee.employeeCode` - @unique
- `Employee.email` - @unique

**User & Auth:**
- `User.email` - @unique

**Master Data:**
- Multiple code fields across various models

#### 3. Foreign Keys
Foreign keys automatically get indexes in PostgreSQL for referential integrity.

## 🔴 CRITICAL: Missing Indexes

Based on typical query patterns in an HRMS system, the following indexes are **critically missing**:

### High Priority (Immediate Performance Impact)

#### 1. Tenant Isolation Queries
**Problem**: Every multi-tenant query filters by `tenantId`
```typescript
// Common pattern across all services
where: { tenantId: user.tenantId }
```

**Required Indexes:**
```prisma
model Company {
  // ... existing fields
  @@index([tenantId]) // CRITICAL for tenant isolation
}

model User {
  // ... existing fields
  @@index([tenantId]) // CRITICAL for listing users by tenant
  @@index([email, tenantId]) // For auth + tenant validation
}
```

#### 2. Employee Search & Filtering
**Problem**: HR dashboards frequently search/filter employees
```typescript
// Common queries
where: {
  companyId: companyId,
  departmentId: departmentId,
  status: "Active"
}
```

**Required Indexes:**
```prisma
model Employee {
  // ... existing fields
  @@index([companyId]) // List employees by company
  @@index([departmentId]) // List employees by department
  @@index([managerId]) // Direct reports queries
  @@index([locationId]) // Employees by location
  @@index([companyId, departmentId]) // Composite for filtered lists
  @@index([companyId, status]) // Active employees per company
  @@index([hireDate]) // Seniority/tenure queries
  @@index([exitDate]) // Turnover analytics
}
```

#### 3. User Authentication & Session Management
**Problem**: Auth queries are frequent and performance-critical
```typescript
// Every login/request validation
where: { email: email }
where: { userId: userId, expiresAt: { gt: now } }
```

**Required Indexes:**
```prisma
model Session {
  // ... existing fields
  @@index([userId]) // User's active sessions
  @@index([token]) // Session token lookup
  @@index([expiresAt]) // Cleanup expired sessions
  @@index([userId, expiresAt]) // Active sessions for user
}
```

#### 4. Audit Log Queries
**Problem**: Audit logs grow rapidly and are queried for compliance
```typescript
// Common audit queries
where: {
  userId: userId,
  createdAt: { gte: startDate, lte: endDate }
}
```

**Required Indexes:**
```prisma
model AuditLog {
  // ... existing fields
  @@index([userId]) // User activity history
  @@index([createdAt]) // Time-based queries
  @@index([action]) // Filter by action type
  @@index([module]) // Module-specific audits
  @@index([userId, createdAt]) // User activity over time
}
```

### Medium Priority (Query Optimization)

#### 5. Hierarchical Queries
```prisma
model Department {
  // ... existing fields
  @@index([parentId]) // Org chart queries
  @@index([costCenterId]) // Cost center reports
}
```

#### 6. Location & Address Lookups
```prisma
model State {
  @@index([countryId]) // States in country
}

model City {
  @@index([stateId]) // Cities in state
}

model Address {
  @@index([cityId])
  @@index([stateId])
  @@index([countryId])
  @@index([postalCode]) // ZIP code lookups
}

model Location {
  @@index([companyId]) // Company locations
  @@index([type]) // Filter by location type
}
```

#### 7. Job Architecture
```prisma
model JobFamily {
  @@index([functionId]) // Families in function
}

model JobProfile {
  @@index([familyId]) // Profiles in family
  @@index([gradeId]) // Profiles by grade
  @@index([status]) // Active profiles only
}
```

#### 8. Competency Library
```prisma
model Competency {
  @@index([categoryId]) // Competencies by category
  @@index([type]) // Filter by type
}

model CompetencyFramework {
  @@index([industryType]) // Industry-specific frameworks
  @@index([isActive]) // Active frameworks
}

model Assessment {
  @@index([employeeId]) // Employee assessments
  @@index([frameworkId]) // Assessments by framework
  @@index([assessedDate]) // Recent assessments
  @@index([status]) // Completed/pending assessments
}
```

### Low Priority (Nice to Have)

#### 9. Timestamp Queries
```prisma
// Add to models with frequent time-range queries
@@index([createdAt])
@@index([updatedAt])
```

#### 10. Soft Delete Patterns
```prisma
// Models with status/active flags
@@index([status])
@@index([isActive])
```

## Recommended Index Additions

### Phase 1: Critical Performance (Immediate)
Create a new migration with these indexes:

```sql
-- Tenant isolation
CREATE INDEX "Company_tenantId_idx" ON "Company"("tenantId");
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");

-- Employee queries (most frequent)
CREATE INDEX "Employee_companyId_idx" ON "Employee"("companyId");
CREATE INDEX "Employee_departmentId_idx" ON "Employee"("departmentId");
CREATE INDEX "Employee_managerId_idx" ON "Employee"("managerId");
CREATE INDEX "Employee_companyId_status_idx" ON "Employee"("companyId", "status");

-- Auth & sessions
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
CREATE INDEX "Session_userId_expiresAt_idx" ON "Session"("userId", "expiresAt");

-- Audit logs
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");
```

### Phase 2: Query Optimization (Next Sprint)
```sql
-- Location hierarchy
CREATE INDEX "State_countryId_idx" ON "State"("countryId");
CREATE INDEX "City_stateId_idx" ON "City"("stateId");
CREATE INDEX "Address_postalCode_idx" ON "Address"("postalCode");

-- Department hierarchy
CREATE INDEX "Department_parentId_idx" ON "Department"("parentId");
CREATE INDEX "Department_costCenterId_idx" ON "Department"("costCenterId");

-- Job architecture
CREATE INDEX "JobFamily_functionId_idx" ON "JobFamily"("functionId");
CREATE INDEX "JobProfile_familyId_idx" ON "JobProfile"("familyId");
CREATE INDEX "JobProfile_gradeId_idx" ON "JobProfile"("gradeId");
```

### Phase 3: Analytics & Reporting (Future)
```sql
-- Time-series analysis
CREATE INDEX "Employee_hireDate_idx" ON "Employee"("hireDate");
CREATE INDEX "Employee_exitDate_idx" ON "Employee"("exitDate");

-- Competency analytics
CREATE INDEX "Assessment_assessedDate_idx" ON "Assessment"("assessedDate");
CREATE INDEX "Assessment_status_idx" ON "Assessment"("status");
```

## Index Maintenance Strategy

### 1. Monitor Index Usage
```sql
-- Check index usage statistics
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;

-- Find unused indexes
SELECT
    schemaname,
    tablename,
    indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname = 'public'
  AND indexrelid NOT IN (
    SELECT conindid FROM pg_constraint
  );
```

### 2. Monitor Index Size
```sql
-- Check index sizes
SELECT
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

### 3. Identify Missing Indexes
```sql
-- Find sequential scans that might benefit from indexes
SELECT
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    seq_tup_read / seq_scan as avg_seq_tup_read
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND seq_scan > 0
ORDER BY seq_tup_read DESC
LIMIT 20;
```

### 4. Reindex Strategy
```sql
-- Reindex all tables (run during maintenance window)
REINDEX DATABASE auraos;

-- Reindex specific table
REINDEX TABLE "Employee";
```

## Best Practices

### 1. Composite Index Order
- **Most selective column first**: Place columns with high cardinality first
- **Query pattern alignment**: Order should match WHERE clause order
- **Example**: `(companyId, status)` is better than `(status, companyId)` if most queries filter by company first

### 2. Partial Indexes
For queries that filter on specific values frequently:
```sql
-- Index only active employees
CREATE INDEX "Employee_active_idx" ON "Employee"(companyId)
WHERE status = 'Active';

-- Index only non-expired sessions
CREATE INDEX "Session_active_idx" ON "Session"(userId)
WHERE "expiresAt" > NOW();
```

### 3. Index Bloat Prevention
- Run `VACUUM` regularly to reclaim space
- Use `REINDEX CONCURRENTLY` in production
- Monitor index fragmentation

### 4. Avoid Over-Indexing
- Each index adds write overhead
- Limit to 5-7 indexes per table
- Combine similar indexes into composite indexes

## Performance Metrics

### Before Indexes (Expected Baseline)
- User list query (1000 records): ~200-500ms
- Employee search: ~300-800ms
- Session validation: ~50-150ms
- Audit log queries: ~1000-3000ms

### After Phase 1 Indexes (Expected)
- User list query: ~10-30ms (95% improvement)
- Employee search: ~20-50ms (93% improvement)
- Session validation: ~5-10ms (90% improvement)
- Audit log queries: ~50-150ms (95% improvement)

## Migration Script

### Creating the Migration
```bash
cd packages/@aura/database
npx prisma migrate dev --name add_performance_indexes
```

### Update schema.prisma
Add the following index declarations to the appropriate models:

```prisma
model Company {
  // ... existing fields
  @@unique([tenantId, code])
  @@index([tenantId])
}

model User {
  // ... existing fields
  @@index([tenantId])
}

model Employee {
  // ... existing fields
  @@index([companyId])
  @@index([departmentId])
  @@index([managerId])
  @@index([companyId, status])
}

model Session {
  // ... existing fields
  @@index([userId])
  @@index([expiresAt])
  @@index([userId, expiresAt])
}

model AuditLog {
  // ... existing fields
  @@index([userId])
  @@index([createdAt])
  @@index([userId, createdAt])
}
```

## Monitoring Checklist

- [ ] Set up slow query logging (queries > 100ms)
- [ ] Configure pg_stat_statements extension
- [ ] Monitor index hit ratio (target: > 99%)
- [ ] Track sequential scan ratio (target: < 5%)
- [ ] Set alerts for query performance degradation
- [ ] Weekly review of top 20 slowest queries
- [ ] Monthly index usage audit
- [ ] Quarterly reindex during maintenance window

## References

- [PostgreSQL Index Types](https://www.postgresql.org/docs/current/indexes-types.html)
- [Prisma Index Documentation](https://www.prisma.io/docs/concepts/components/prisma-schema/indexes)
- [Database Indexing Best Practices](https://use-the-index-luke.com/)
