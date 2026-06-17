-- ============================================================================
-- EPIC-18 (Bahrainization Compliance, Bahrain nationalization)
-- ============================================================================

CREATE TABLE "aura_bahrainization_config" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "legalEntityId" TEXT,
  "establishmentName" TEXT NOT NULL,
  "sector" TEXT NOT NULL,
  "sizeBracket" TEXT NOT NULL,
  "bahrainiHeadcount" INTEGER NOT NULL DEFAULT 0,
  "totalHeadcount" INTEGER NOT NULL DEFAULT 0,
  "lmraEstablishmentId" TEXT,
  "isInScope" BOOLEAN NOT NULL DEFAULT true,
  "isGovernmentTenderEligible" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_bahrainization_config_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_bahrainization_config_unique"
  ON "aura_bahrainization_config"("tenantId", "legalEntityId");

CREATE TABLE "aura_bahrainization_target" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "sector" TEXT NOT NULL,
  "sizeBracket" TEXT NOT NULL,
  "targetRatioPct" DECIMAL(5,2) NOT NULL,
  "tenderEligibilityMinPct" DECIMAL(5,2),
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveTo" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "basis" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_bahrainization_target_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_bahrainization_target_unique"
  ON "aura_bahrainization_target"("tenantId", "sector", "sizeBracket", "effectiveFrom");

CREATE TABLE "aura_bahrainization_hire" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "legalEntityId" TEXT,
  "employeeId" TEXT NOT NULL,
  "hireDate" TIMESTAMP(3) NOT NULL,
  "jobLevel" TEXT,
  "isBahraini" BOOLEAN NOT NULL DEFAULT true,
  "cprNumber" TEXT,
  "sioRegistered" BOOLEAN NOT NULL DEFAULT false,
  "wageEvidenceLinked" BOOLEAN NOT NULL DEFAULT false,
  "tamkeenSupported" BOOLEAN NOT NULL DEFAULT false,
  "artificialRiskScore" INTEGER NOT NULL DEFAULT 0,
  "artificialRiskFlags" JSONB NOT NULL DEFAULT '[]',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_bahrainization_hire_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_bahrainization_hire_unique"
  ON "aura_bahrainization_hire"("tenantId", "employeeId");

CREATE TABLE "aura_bahrainization_snapshot" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "legalEntityId" TEXT,
  "snapshotDate" TIMESTAMP(3) NOT NULL,
  "bahrainiHeadcount" INTEGER NOT NULL,
  "totalHeadcount" INTEGER NOT NULL,
  "ratioPct" DECIMAL(5,2) NOT NULL,
  "targetRatioPct" DECIMAL(5,2) NOT NULL,
  "gapPct" DECIMAL(6,2) NOT NULL,
  "ragStatus" TEXT NOT NULL,
  "missedHires" INTEGER NOT NULL DEFAULT 0,
  "lmraGated" BOOLEAN NOT NULL DEFAULT false,
  "tenderEligible" BOOLEAN NOT NULL DEFAULT false,
  "evidenceJson" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_bahrainization_snapshot_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_bahrainization_snapshot_unique"
  ON "aura_bahrainization_snapshot"("tenantId", "legalEntityId", "snapshotDate");

CREATE TABLE "aura_bahrainization_certificate" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "entitiesInScope" INTEGER NOT NULL DEFAULT 0,
  "entitiesAtTarget" INTEGER NOT NULL DEFAULT 0,
  "entitiesLmraGated" INTEGER NOT NULL DEFAULT 0,
  "entitiesTenderEligible" INTEGER NOT NULL DEFAULT 0,
  "totalMissedHires" INTEGER NOT NULL DEFAULT 0,
  "artificialRiskCount" INTEGER NOT NULL DEFAULT 0,
  "gatingReason" TEXT,
  "attestationsJson" JSONB NOT NULL DEFAULT '[]',
  "generatedAt" TIMESTAMP(3),
  "signedAt" TIMESTAMP(3),
  "signedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_bahrainization_certificate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_bahrainization_certificate_unique"
  ON "aura_bahrainization_certificate"("tenantId", "period");
