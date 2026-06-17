-- ============================================================================
-- EPIC-16 (Emiratisation Compliance, UAE nationalization)
-- ============================================================================

CREATE TABLE "aura_emiratisation_config" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "legalEntityId" TEXT,
  "establishmentName" TEXT NOT NULL,
  "isInScope" BOOLEAN NOT NULL DEFAULT true,
  "skilledWorkforceCount" INTEGER NOT NULL DEFAULT 0,
  "sector" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_emiratisation_config_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_emiratisation_config_unique"
  ON "aura_emiratisation_config"("tenantId", "legalEntityId");

CREATE TABLE "aura_emiratisation_target" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "legalEntityId" TEXT,
  "year" INTEGER NOT NULL,
  "halfYearTargetPct" DECIMAL(5,2) NOT NULL,
  "yearEndTargetPct" DECIMAL(5,2) NOT NULL,
  "finePerMissedHire" DECIMAL(14,2) NOT NULL DEFAULT 7000,
  "currency" TEXT NOT NULL DEFAULT 'AED',
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveTo" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdBy" TEXT,
  CONSTRAINT "aura_emiratisation_target_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_emiratisation_target_unique"
  ON "aura_emiratisation_target"("tenantId", "legalEntityId", "year");

CREATE TABLE "aura_emiratisation_snapshot" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "legalEntityId" TEXT,
  "checkpointDate" TIMESTAMP(3) NOT NULL,
  "checkpoint" TEXT NOT NULL,
  "skilledHeadcount" INTEGER NOT NULL,
  "uaeNationalCount" INTEGER NOT NULL,
  "actualPct" DECIMAL(5,2) NOT NULL,
  "targetPct" DECIMAL(5,2) NOT NULL,
  "gapPct" DECIMAL(5,2) NOT NULL,
  "missedHires" INTEGER NOT NULL DEFAULT 0,
  "projectedFine" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "ragStatus" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_emiratisation_snapshot_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_emiratisation_snapshot_unique"
  ON "aura_emiratisation_snapshot"("tenantId", "legalEntityId", "checkpointDate");

CREATE TABLE "aura_emiratisation_hire" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "legalEntityId" TEXT,
  "employeeId" TEXT NOT NULL,
  "hireDate" TIMESTAMP(3) NOT NULL,
  "jobLevel" TEXT,
  "isSkilled" BOOLEAN NOT NULL DEFAULT true,
  "nafisReference" TEXT,
  "gpssaRegistered" BOOLEAN NOT NULL DEFAULT false,
  "wpsCovered" BOOLEAN NOT NULL DEFAULT false,
  "fakeRiskScore" INTEGER NOT NULL DEFAULT 0,
  "fakeRiskFlags" JSONB NOT NULL DEFAULT '[]',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_emiratisation_hire_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_emiratisation_hire_unique"
  ON "aura_emiratisation_hire"("tenantId", "employeeId");
CREATE INDEX "aura_emiratisation_hire_legal_entity_idx"
  ON "aura_emiratisation_hire"("legalEntityId");

CREATE TABLE "aura_emiratisation_fine" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "legalEntityId" TEXT,
  "year" INTEGER NOT NULL,
  "checkpoint" TEXT NOT NULL,
  "missedHires" INTEGER NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'AED',
  "status" TEXT NOT NULL DEFAULT 'PROJECTED',
  "incurredAt" TIMESTAMP(3),
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_emiratisation_fine_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_emiratisation_fine_tenantId_idx" ON "aura_emiratisation_fine"("tenantId");
CREATE INDEX "aura_emiratisation_fine_status_idx" ON "aura_emiratisation_fine"("status");

CREATE TABLE "aura_emiratisation_certificate" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "entitiesInScope" INTEGER NOT NULL DEFAULT 0,
  "entitiesAtTarget" INTEGER NOT NULL DEFAULT 0,
  "totalMissedHires" INTEGER NOT NULL DEFAULT 0,
  "totalProjectedFines" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "fakeRiskCount" INTEGER NOT NULL DEFAULT 0,
  "gatingReason" TEXT,
  "attestationsJson" JSONB NOT NULL DEFAULT '[]',
  "generatedAt" TIMESTAMP(3),
  "signedAt" TIMESTAMP(3),
  "signedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_emiratisation_certificate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_emiratisation_certificate_unique"
  ON "aura_emiratisation_certificate"("tenantId", "period");
