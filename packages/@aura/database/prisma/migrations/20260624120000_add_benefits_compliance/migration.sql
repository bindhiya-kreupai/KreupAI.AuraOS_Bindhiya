-- ============================================================================
-- EPIC-22 (Employee Benefits Compliance — catalogue + enrollment + vendor +
-- certificate)
-- ============================================================================

CREATE TABLE "aura_benefit_catalogue" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "benefitCode" TEXT NOT NULL,
  "benefitType" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "countryCode" TEXT,
  "isMandatory" BOOLEAN NOT NULL DEFAULT false,
  "minGrade" TEXT,
  "valuationBasis" TEXT NOT NULL DEFAULT 'FIXED',
  "annualValue" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'AED',
  "frequencyMonths" INTEGER NOT NULL DEFAULT 12,
  "dependantsAllowed" BOOLEAN NOT NULL DEFAULT false,
  "vendorRequired" BOOLEAN NOT NULL DEFAULT false,
  "policyJson" JSONB NOT NULL DEFAULT '{}',
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveTo" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_benefit_catalogue_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_benefit_catalogue_unique"
  ON "aura_benefit_catalogue"("tenantId", "benefitCode", "effectiveFrom");

CREATE TABLE "aura_benefit_vendor" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "vendorType" TEXT NOT NULL,
  "country" TEXT,
  "contactEmail" TEXT,
  "contactPhone" TEXT,
  "contractRef" TEXT,
  "contractStart" TIMESTAMP(3),
  "contractEnd" TIMESTAMP(3),
  "dpaSigned" BOOLEAN NOT NULL DEFAULT false,
  "dpaSignedAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_benefit_vendor_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_benefit_vendor_tenant"
  ON "aura_benefit_vendor"("tenantId");

CREATE TABLE "aura_benefit_coverage" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "benefitCatalogueId" TEXT NOT NULL,
  "vendorId" TEXT,
  "policyNumber" TEXT,
  "startedAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "lastRenewedAt" TIMESTAMP(3),
  "actualAnnualValue" DECIMAL(14,2),
  "currency" TEXT NOT NULL DEFAULT 'AED',
  "dependantsCount" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "lastAccruedAt" TIMESTAMP(3),
  "accruedBalance" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "metadataJson" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_benefit_coverage_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_benefit_coverage_unique"
  ON "aura_benefit_coverage"("tenantId", "employeeId", "benefitCatalogueId", "startedAt");
CREATE INDEX "aura_benefit_coverage_expiry"
  ON "aura_benefit_coverage"("tenantId", "expiresAt");

CREATE TABLE "aura_benefit_exception" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "benefitCode" TEXT NOT NULL,
  "exceptionType" TEXT NOT NULL,
  "reason" TEXT,
  "raisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "raisedBy" TEXT,
  "approverId" TEXT,
  "approvedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_benefit_exception_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_benefit_exception_employee"
  ON "aura_benefit_exception"("tenantId", "employeeId");

CREATE TABLE "aura_benefit_certificate" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "activeEnrollments" INTEGER NOT NULL DEFAULT 0,
  "mandatoryCoverGapCount" INTEGER NOT NULL DEFAULT 0,
  "expiringSoonCount" INTEGER NOT NULL DEFAULT 0,
  "expiredCount" INTEGER NOT NULL DEFAULT 0,
  "openExceptionsCount" INTEGER NOT NULL DEFAULT 0,
  "vendorsWithoutDpa" INTEGER NOT NULL DEFAULT 0,
  "totalAccruedLiability" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'AED',
  "gatingReason" TEXT,
  "attestationsJson" JSONB NOT NULL DEFAULT '[]',
  "generatedAt" TIMESTAMP(3),
  "signedAt" TIMESTAMP(3),
  "signedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_benefit_certificate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_benefit_certificate_unique"
  ON "aura_benefit_certificate"("tenantId", "period");
