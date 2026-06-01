-- Phase 2 #36 — Aviation industry settings + EmployeeComplianceDetails.sector
-- Additive only (one ALTER TABLE ADD COLUMN that's nullable + one new table)

-- -----------------------------------------------------------------------------
-- 1. Add `sector` column to aura_employee_compliance_details
--    Nullable so existing rows backfill to NULL — service layer reads NULL
--    as "sector not applicable / not configured for this employee's country"
-- -----------------------------------------------------------------------------
ALTER TABLE "aura_employee_compliance_details"
  ADD COLUMN "sector" TEXT;

-- Index for Kuwait PIFSS lookup pattern (countryCode + sector)
CREATE INDEX "aura_employee_compliance_details_countryCode_sector_idx"
  ON "aura_employee_compliance_details"("countryCode", "sector");

-- -----------------------------------------------------------------------------
-- 2. IndustryAviationSettings table
-- -----------------------------------------------------------------------------
CREATE TABLE "aura_industry_aviation_settings" (
  "id"                            TEXT NOT NULL,
  "tenantId"                      TEXT NOT NULL,
  "companyId"                     TEXT,
  "airlineCode"                   TEXT NOT NULL,
  "iataCode"                      TEXT,
  "icaoCode"                      TEXT,
  "dutyTimeRegulation"            TEXT,
  "fleetConfig"                   JSONB,
  "pilotLicenseRenewalNoticeDays" INTEGER NOT NULL DEFAULT 30,
  "medicalCertRenewalNoticeDays"  INTEGER NOT NULL DEFAULT 45,
  "isActive"                      BOOLEAN NOT NULL DEFAULT true,
  "version"                       INTEGER NOT NULL DEFAULT 1,
  "createdAt"                     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"                     TIMESTAMP(3) NOT NULL,
  "createdBy"                     TEXT NOT NULL,
  "updatedBy"                     TEXT NOT NULL,
  "isDeleted"                     BOOLEAN NOT NULL DEFAULT false,
  "deletedAt"                     TIMESTAMP(3),
  CONSTRAINT "aura_industry_aviation_settings_pkey" PRIMARY KEY ("id")
);

-- One settings row per (tenantId, companyId) pair. companyId NULL means
-- "tenant-wide default". The unique index ensures upsert semantics work.
CREATE UNIQUE INDEX "aura_industry_aviation_settings_tenantId_companyId_key"
  ON "aura_industry_aviation_settings"("tenantId", "companyId");

CREATE INDEX "aura_industry_aviation_settings_tenantId_idx"
  ON "aura_industry_aviation_settings"("tenantId");
