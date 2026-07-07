-- Global Mobility: relocation packages and expat tax profiles.
-- Defensive (safe on db-push shaped DBs). Enums stored as TEXT.

CREATE TABLE IF NOT EXISTS "aura_relocation_package" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "employeeName" TEXT NOT NULL,
  "tier" TEXT NOT NULL DEFAULT 'standard',
  "originLocation" TEXT NOT NULL,
  "destination" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'INITIATED',
  "budgetAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "spentAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "startDate" TIMESTAMP(3),
  "targetDate" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "satisfaction" INTEGER,
  "notes" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_relocation_package_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "aura_relocation_package_tenantId_idx" ON "aura_relocation_package"("tenantId");
CREATE INDEX IF NOT EXISTS "aura_relocation_package_employeeId_idx" ON "aura_relocation_package"("employeeId");
CREATE INDEX IF NOT EXISTS "aura_relocation_package_status_idx" ON "aura_relocation_package"("status");

CREATE TABLE IF NOT EXISTS "aura_expat_tax_profile" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "employeeName" TEXT NOT NULL,
  "homeCountry" TEXT NOT NULL,
  "hostCountry" TEXT NOT NULL,
  "taxYear" INTEGER NOT NULL,
  "baseSalary" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "hypoTax" DECIMAL(15,2),
  "hostTax" DECIMAL(15,2),
  "companyCost" DECIMAL(15,2),
  "equalizationType" TEXT NOT NULL DEFAULT 'gross_up',
  "filingStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "filingType" TEXT,
  "filingDueDate" TIMESTAMP(3),
  "filedAt" TIMESTAMP(3),
  "notes" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_expat_tax_profile_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "aura_expat_tax_profile_tenantId_idx" ON "aura_expat_tax_profile"("tenantId");
CREATE INDEX IF NOT EXISTS "aura_expat_tax_profile_employeeId_idx" ON "aura_expat_tax_profile"("employeeId");
CREATE INDEX IF NOT EXISTS "aura_expat_tax_profile_filingStatus_idx" ON "aura_expat_tax_profile"("filingStatus");
