-- ============================================================================
-- EPIC-28 (EOSB Compliance — persistence layer for accruals, finalized
-- calculations, disputes, monthly certificate; math stays in
-- compliance/eosb.service.ts)
-- ============================================================================

CREATE TABLE "aura_eosb_calculation" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "countryCode" TEXT NOT NULL,
  "joiningDate" TIMESTAMP(3) NOT NULL,
  "lastWorkingDate" TIMESTAMP(3) NOT NULL,
  "terminationType" TEXT NOT NULL,
  "basicSalary" DECIMAL(14,2) NOT NULL,
  "totalServiceYears" DECIMAL(8,4) NOT NULL,
  "totalServiceMonths" INTEGER NOT NULL,
  "unpaidLeaveDays" INTEGER NOT NULL DEFAULT 0,
  "dailyRate" DECIMAL(14,4) NOT NULL,
  "gratuityAmount" DECIMAL(14,2) NOT NULL,
  "socialInsuranceOffset" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "netPayable" DECIMAL(14,2) NOT NULL,
  "currency" TEXT NOT NULL,
  "law" TEXT,
  "formula" TEXT,
  "notesJson" JSONB NOT NULL DEFAULT '[]',
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "approvedAt" TIMESTAMP(3),
  "approvedBy" TEXT,
  "settledAt" TIMESTAMP(3),
  "paymentReference" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_eosb_calculation_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_eosb_calculation_unique"
  ON "aura_eosb_calculation"("tenantId", "employeeId", "lastWorkingDate");

CREATE TABLE "aura_eosb_accrual" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "countryCode" TEXT NOT NULL,
  "basicSalary" DECIMAL(14,2) NOT NULL,
  "serviceMonths" INTEGER NOT NULL,
  "accruedGratuity" DECIMAL(14,2) NOT NULL,
  "monthDelta" DECIMAL(14,2) NOT NULL,
  "currency" TEXT NOT NULL,
  "glPosted" BOOLEAN NOT NULL DEFAULT false,
  "glJournalRef" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_eosb_accrual_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_eosb_accrual_unique"
  ON "aura_eosb_accrual"("tenantId", "employeeId", "period");

CREATE TABLE "aura_eosb_dispute" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "calculationId" TEXT,
  "raisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "raisedBy" TEXT,
  "subject" TEXT NOT NULL,
  "claimedAmount" DECIMAL(14,2),
  "calculatedAmount" DECIMAL(14,2),
  "currency" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "resolutionNotes" TEXT,
  "resolvedAt" TIMESTAMP(3),
  "resolvedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_eosb_dispute_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_eosb_dispute_employee"
  ON "aura_eosb_dispute"("tenantId", "employeeId");

CREATE TABLE "aura_eosb_certificate" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "calcsCount" INTEGER NOT NULL DEFAULT 0,
  "calcsTotalAmount" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "accrualsCount" INTEGER NOT NULL DEFAULT 0,
  "accrualsTotalAmount" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "openDisputesCount" INTEGER NOT NULL DEFAULT 0,
  "unsettledCount" INTEGER NOT NULL DEFAULT 0,
  "gatingReason" TEXT,
  "attestationsJson" JSONB NOT NULL DEFAULT '[]',
  "generatedAt" TIMESTAMP(3),
  "signedAt" TIMESTAMP(3),
  "signedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_eosb_certificate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_eosb_certificate_unique"
  ON "aura_eosb_certificate"("tenantId", "period");
