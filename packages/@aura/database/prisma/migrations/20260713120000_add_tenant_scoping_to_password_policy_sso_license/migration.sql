-- Add tenantId column to PasswordPolicy, SSOConfig, and License.
-- All steps are additive-only: no rows are deleted or modified except to set tenantId.

-- 1. Add nullable tenantId columns
ALTER TABLE "aura_password_policy" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "aura_sso_config" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "aura_license" ADD COLUMN "tenantId" TEXT;

-- 2. Backfill all existing rows to the single tenant (safe: no data loss)
UPDATE "aura_password_policy" SET "tenantId" = 'ae63d8ef-d01d-49a7-a542-b1256702765d' WHERE "tenantId" IS NULL;
UPDATE "aura_sso_config" SET "tenantId" = 'ae63d8ef-d01d-49a7-a542-b1256702765d' WHERE "tenantId" IS NULL;
UPDATE "aura_license" SET "tenantId" = 'ae63d8ef-d01d-49a7-a542-b1256702765d' WHERE "tenantId" IS NULL;

-- 3. Make tenantId NOT NULL after backfill
ALTER TABLE "aura_password_policy" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "aura_sso_config" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "aura_license" ALTER COLUMN "tenantId" SET NOT NULL;

-- 4. Add foreign key constraints
ALTER TABLE "aura_password_policy" ADD CONSTRAINT "PasswordPolicy_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "aura_tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "aura_sso_config" ADD CONSTRAINT "SSOConfig_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "aura_tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "aura_license" ADD CONSTRAINT "License_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "aura_tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 5. Add indexes for tenant-scoped queries
CREATE INDEX "PasswordPolicy_tenantId_idx" ON "aura_password_policy"("tenantId");
CREATE INDEX "SSOConfig_tenantId_idx" ON "aura_sso_config"("tenantId");
CREATE INDEX "License_tenantId_idx" ON "aura_license"("tenantId");

-- 6. License: add tenant-scoped unique constraint on name
ALTER TABLE "aura_license" ADD CONSTRAINT "License_tenantId_name_key" UNIQUE ("tenantId", "name");
