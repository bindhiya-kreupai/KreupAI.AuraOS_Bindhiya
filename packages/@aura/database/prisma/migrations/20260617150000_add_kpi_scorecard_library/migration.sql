-- ============================================================================
-- EPIC-38 (Compliance KPI & Scorecard Library)
-- ============================================================================

CREATE TABLE "aura_kpi_definition" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "formula" TEXT NOT NULL,
  "dataSource" TEXT NOT NULL,
  "lineage" JSONB NOT NULL DEFAULT '{}',
  "unit" TEXT NOT NULL,
  "frequency" TEXT NOT NULL,
  "direction" TEXT NOT NULL,
  "ownerRole" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "approvedAt" TIMESTAMP(3),
  "approvedBy" TEXT,
  "reviewDueAt" TIMESTAMP(3),
  "supersededBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_kpi_definition_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_kpi_definition_unique" ON "aura_kpi_definition"("tenantId", "code", "version");
CREATE INDEX "aura_kpi_definition_tenantId_idx" ON "aura_kpi_definition"("tenantId");
CREATE INDEX "aura_kpi_definition_domain_idx" ON "aura_kpi_definition"("domain");
CREATE INDEX "aura_kpi_definition_status_idx" ON "aura_kpi_definition"("status");

CREATE TABLE "aura_kpi_threshold" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "kpiCode" TEXT NOT NULL,
  "countryCode" TEXT,
  "greenMin" DECIMAL(10,4),
  "greenMax" DECIMAL(10,4),
  "amberMin" DECIMAL(10,4),
  "amberMax" DECIMAL(10,4),
  "redMin" DECIMAL(10,4),
  "redMax" DECIMAL(10,4),
  "statutoryRef" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_kpi_threshold_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_kpi_threshold_unique"
  ON "aura_kpi_threshold"("tenantId", "kpiCode", "countryCode");
CREATE INDEX "aura_kpi_threshold_kpiCode_idx" ON "aura_kpi_threshold"("kpiCode");

CREATE TABLE "aura_kpi_value" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "kpiCode" TEXT NOT NULL,
  "countryCode" TEXT,
  "legalEntityId" TEXT,
  "period" TEXT NOT NULL,
  "value" DECIMAL(14,4) NOT NULL,
  "ragStatus" TEXT,
  "statutoryBreach" BOOLEAN NOT NULL DEFAULT false,
  "dataQualityPass" BOOLEAN NOT NULL DEFAULT false,
  "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "inputsJson" JSONB NOT NULL DEFAULT '{}',
  CONSTRAINT "aura_kpi_value_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_kpi_value_unique"
  ON "aura_kpi_value"("tenantId", "kpiCode", "countryCode", "legalEntityId", "period");
CREATE INDEX "aura_kpi_value_tenantId_idx" ON "aura_kpi_value"("tenantId");
CREATE INDEX "aura_kpi_value_period_idx" ON "aura_kpi_value"("period");
CREATE INDEX "aura_kpi_value_ragStatus_idx" ON "aura_kpi_value"("ragStatus");

CREATE TABLE "aura_kpi_data_quality_check" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "kpiCode" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "checkName" TEXT NOT NULL,
  "passed" BOOLEAN NOT NULL,
  "message" TEXT,
  "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_kpi_data_quality_check_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_kpi_dq_lookup_idx" ON "aura_kpi_data_quality_check"("tenantId", "kpiCode", "period");

CREATE TABLE "aura_kpi_scorecard_weight" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "weight" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_kpi_scorecard_weight_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_kpi_scorecard_weight_unique" ON "aura_kpi_scorecard_weight"("tenantId", "domain");

CREATE TABLE "aura_kpi_certificate" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "kpisComputed" INTEGER NOT NULL DEFAULT 0,
  "dqFailures" INTEGER NOT NULL DEFAULT 0,
  "redKpis" INTEGER NOT NULL DEFAULT 0,
  "actionedRedKpis" INTEGER NOT NULL DEFAULT 0,
  "gatingReason" TEXT,
  "attestationsJson" JSONB NOT NULL DEFAULT '[]',
  "generatedAt" TIMESTAMP(3),
  "signedAt" TIMESTAMP(3),
  "signedBy" TEXT,
  "pdfUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_kpi_certificate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_kpi_certificate_unique" ON "aura_kpi_certificate"("tenantId", "period");
CREATE INDEX "aura_kpi_certificate_status_idx" ON "aura_kpi_certificate"("status");
