-- Migration: Transform old Role table to new RBAC system
-- This migration:
-- 1. Creates new RBAC tables (Permission, RolePermission, UserRole)
-- 2. Transforms existing Role table structure
-- 3. Preserves existing data where possible

-- Step 1: Create Permission table
CREATE TABLE IF NOT EXISTS "Permission" (
    "id" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- Step 2: Create indexes for Permission
CREATE UNIQUE INDEX IF NOT EXISTS "Permission_resource_action_key" ON "Permission"("resource", "action");
CREATE INDEX IF NOT EXISTS "Permission_resource_idx" ON "Permission"("resource");

-- Step 3: Backup existing Role table data
CREATE TEMPORARY TABLE "RoleBackup" AS SELECT * FROM "Role";

-- Step 4: Drop old Role table constraints and indexes
DROP INDEX IF EXISTS "Role_name_key";
ALTER TABLE "Role" DROP CONSTRAINT IF EXISTS "Role_pkey";

-- Step 5: Add new columns to Role table
ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "code" TEXT;
ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "isSystem" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Step 6: Migrate existing data - convert old roles to new structure
UPDATE "Role"
SET
  "code" = UPPER(REPLACE(REPLACE("name", ' ', '_'), '-', '_')),
  "isActive" = CASE WHEN "status" = 'Active' THEN true ELSE false END,
  "isSystem" = true  -- Mark migrated roles as system roles
WHERE "code" IS NULL;

-- Step 7: Remove old columns
ALTER TABLE "Role" DROP COLUMN IF EXISTS "usersCount";
ALTER TABLE "Role" DROP COLUMN IF EXISTS "status";

-- Step 8: Add primary key back
ALTER TABLE "Role" ADD CONSTRAINT "Role_pkey" PRIMARY KEY ("id");

-- Step 9: Add new indexes for Role
CREATE UNIQUE INDEX IF NOT EXISTS "Role_tenantId_code_key" ON "Role"("tenantId", "code");
CREATE INDEX IF NOT EXISTS "Role_tenantId_idx" ON "Role"("tenantId");
CREATE INDEX IF NOT EXISTS "Role_code_idx" ON "Role"("code");
CREATE INDEX IF NOT EXISTS "Role_isActive_idx" ON "Role"("isActive");

-- Step 10: Add foreign key for tenantId
ALTER TABLE "Role" ADD CONSTRAINT "Role_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 11: Create RolePermission junction table
CREATE TABLE IF NOT EXISTS "RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- Step 12: Create indexes for RolePermission
CREATE UNIQUE INDEX IF NOT EXISTS "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");
CREATE INDEX IF NOT EXISTS "RolePermission_roleId_idx" ON "RolePermission"("roleId");
CREATE INDEX IF NOT EXISTS "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- Step 13: Add foreign keys for RolePermission
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 14: Create UserRole junction table
CREATE TABLE IF NOT EXISTS "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "assignedBy" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- Step 15: Create indexes for UserRole
CREATE UNIQUE INDEX IF NOT EXISTS "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");
CREATE INDEX IF NOT EXISTS "UserRole_userId_idx" ON "UserRole"("userId");
CREATE INDEX IF NOT EXISTS "UserRole_roleId_idx" ON "UserRole"("roleId");
CREATE INDEX IF NOT EXISTS "UserRole_tenantId_idx" ON "UserRole"("tenantId");
CREATE INDEX IF NOT EXISTS "UserRole_expiresAt_idx" ON "UserRole"("expiresAt");

-- Step 16: Add foreign keys for UserRole
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Migration complete
-- Note: After this migration, run the seed-roles.ts script to populate permissions and create tenant-specific roles
