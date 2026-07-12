-- Add tenantId and deactivatedBy FK to UserDeactivation (additive, no data loss)

-- Step 1: Add tenantId column as nullable first
ALTER TABLE aura_user_deactivation ADD COLUMN "tenantId" TEXT;

-- Step 2: Backfill tenantId from the related User record
UPDATE aura_user_deactivation ud
SET "tenantId" = u."tenantId"
FROM aura_user u
WHERE ud."userId" = u.id AND ud."tenantId" IS NULL;

-- Step 3: Add NOT NULL constraint after backfill
ALTER TABLE aura_user_deactivation ALTER COLUMN "tenantId" SET NOT NULL;

-- Step 4: Add foreign key to Tenant
ALTER TABLE aura_user_deactivation
ADD CONSTRAINT "UserDeactivation_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES aura_tenant(id) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 5: Add index on tenantId
CREATE INDEX "UserDeactivation_tenantId_idx" ON aura_user_deactivation("tenantId");

-- Step 6: Add foreign key for deactivatedBy → User (column already exists, just add FK)
ALTER TABLE aura_user_deactivation
ADD CONSTRAINT "UserDeactivation_deactivatedBy_fkey"
FOREIGN KEY ("deactivatedBy") REFERENCES aura_user(id) ON DELETE RESTRICT ON UPDATE CASCADE;
