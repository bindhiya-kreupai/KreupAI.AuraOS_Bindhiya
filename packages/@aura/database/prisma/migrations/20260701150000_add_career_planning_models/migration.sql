-- Career Planning module domain models (AURA-301).
-- Defensive CREATE TABLE IF NOT EXISTS; repo uses db-push, enums stored as TEXT.

CREATE TABLE IF NOT EXISTS "aura_career_entity" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "employeeId" TEXT,
  "status" TEXT,
  "department" TEXT,
  "data" JSONB NOT NULL,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_career_entity_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "CareerEntity_tenantId_idx" ON "aura_career_entity"("tenantId");
CREATE INDEX IF NOT EXISTS "CareerEntity_tenant_kind_idx" ON "aura_career_entity"("tenantId", "kind");
CREATE INDEX IF NOT EXISTS "CareerEntity_tenant_kind_employee_idx" ON "aura_career_entity"("tenantId", "kind", "employeeId");
CREATE INDEX IF NOT EXISTS "CareerEntity_tenant_kind_status_idx" ON "aura_career_entity"("tenantId", "kind", "status");

CREATE TABLE IF NOT EXISTS "aura_career_setting" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "data" JSONB NOT NULL,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_career_setting_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "aura_career_setting_tenantId_key" ON "aura_career_setting"("tenantId");

-- Store the employee's ESS career interests (self-service marketplace profile).
ALTER TABLE "aura_employee" ADD COLUMN IF NOT EXISTS "careerInterests" JSONB;
