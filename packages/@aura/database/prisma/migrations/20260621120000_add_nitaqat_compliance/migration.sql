-- ============================================================================
-- EPIC-17 (Nitaqat / Saudization Compliance, KSA nationalization)
-- ============================================================================

CREATE TABLE "aura_nitaqat_config" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "legalEntityId" TEXT,
  "establishmentName" TEXT NOT NULL,
  "sector" TEXT NOT NULL,
  "sizeBracket" TEXT NOT NULL,
  "saudiHeadcount" INTEGER NOT NULL DEFAULT 0,
  "totalHeadcount" INTEGER NOT NULL DEFAULT 0,
  "qiwaNumber" TEXT,
  "isInScope" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_nitaqat_config_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_nitaqat_config_unique"
  ON "aura_nitaqat_config"("tenantId", "legalEntityId");

CREATE TABLE "aura_nitaqat_band_threshold" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "sector" TEXT NOT NULL,
  "sizeBracket" TEXT NOT NULL,
  "redMaxPct" DECIMAL(5,2) NOT NULL,
  "yellowMaxPct" DECIMAL(5,2) NOT NULL,
  "greenMaxPct" DECIMAL(5,2) NOT NULL,
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveTo" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_nitaqat_band_threshold_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_nitaqat_band_threshold_unique"
  ON "aura_nitaqat_band_threshold"("tenantId", "sector", "sizeBracket", "effectiveFrom");

CREATE TABLE "aura_nitaqat_band_snapshot" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "legalEntityId" TEXT,
  "snapshotDate" TIMESTAMP(3) NOT NULL,
  "saudiHeadcount" INTEGER NOT NULL,
  "totalHeadcount" INTEGER NOT NULL,
  "saudizationPct" DECIMAL(5,2) NOT NULL,
  "band" TEXT NOT NULL,
  "redMaxPct" DECIMAL(5,2) NOT NULL,
  "yellowMaxPct" DECIMAL(5,2) NOT NULL,
  "greenMaxPct" DECIMAL(5,2) NOT NULL,
  "platinumThresholdPct" DECIMAL(5,2),
  "ptToNextBandHires" INTEGER NOT NULL DEFAULT 0,
  "privilegesJson" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_nitaqat_band_snapshot_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_nitaqat_band_snapshot_unique"
  ON "aura_nitaqat_band_snapshot"("tenantId", "legalEntityId", "snapshotDate");

CREATE TABLE "aura_nitaqat_hire" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "legalEntityId" TEXT,
  "employeeId" TEXT NOT NULL,
  "hireDate" TIMESTAMP(3) NOT NULL,
  "qiwaContractRef" TEXT,
  "gosiRegistered" BOOLEAN NOT NULL DEFAULT false,
  "mudadCovered" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_nitaqat_hire_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_nitaqat_hire_unique"
  ON "aura_nitaqat_hire"("tenantId", "employeeId");

CREATE TABLE "aura_nitaqat_certificate" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "entitiesInScope" INTEGER NOT NULL DEFAULT 0,
  "platinumCount" INTEGER NOT NULL DEFAULT 0,
  "greenCount" INTEGER NOT NULL DEFAULT 0,
  "yellowCount" INTEGER NOT NULL DEFAULT 0,
  "redCount" INTEGER NOT NULL DEFAULT 0,
  "gatingReason" TEXT,
  "attestationsJson" JSONB NOT NULL DEFAULT '[]',
  "generatedAt" TIMESTAMP(3),
  "signedAt" TIMESTAMP(3),
  "signedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_nitaqat_certificate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_nitaqat_certificate_unique"
  ON "aura_nitaqat_certificate"("tenantId", "period");
