-- AlterTable: Add nullable tenantId to ShiftType
ALTER TABLE "aura_shift_type" ADD COLUMN "tenantId" TEXT;

-- Backfill: Assign all existing shift types to the default tenant
UPDATE "aura_shift_type" SET "tenantId" = 'ae63d8ef-d01d-49a7-a542-b1256702765d' WHERE "tenantId" IS NULL;

-- AlterTable: Set tenantId NOT NULL
ALTER TABLE "aura_shift_type" ALTER COLUMN "tenantId" SET NOT NULL;

-- Drop the existing unique index on code (name is ShiftType_code_key, not aura_shift_type_code_key)
DROP INDEX IF EXISTS "ShiftType_code_key";

-- CreateIndex: Compound unique constraint on (tenantId, code)
CREATE UNIQUE INDEX "ShiftType_tenantId_code_key" ON "aura_shift_type"("tenantId", "code");

-- CreateIndex: Index for tenant scoping
CREATE INDEX "ShiftType_tenantId_idx" ON "aura_shift_type"("tenantId");

-- AddForeignKey: FK to Tenant
ALTER TABLE "aura_shift_type" ADD CONSTRAINT "ShiftType_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "aura_tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
