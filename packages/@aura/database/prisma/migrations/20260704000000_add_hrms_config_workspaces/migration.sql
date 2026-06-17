-- ============================================================================
-- EPIC-34 HRMS Configuration — 25 remaining workspaces (S01, S03–S20, S24–S29).
--
-- One generic config registry (aura_hrms_config_object) with scope-resolution
-- (GLOBAL → COUNTRY → LEGAL_ENTITY → DOMAIN), version + effective-dated
-- lifecycle (DRAFT → PENDING_APPROVAL → ACTIVE → RETIRED), and maker-checker.
-- Each per-domain workspace (LEAVE, ATTENDANCE, PAYROLL, BENEFITS, HSE, etc.)
-- is a thin service layer over this registry; the registry points to the
-- existing per-domain models via (targetModel, targetRecordId) refs.
--
-- Plus four discrete companions:
--   * aura_hrms_config_certificate     — monthly + go-live sign-off
--   * aura_hrms_implementation_checklist — S27 control sheet
--   * aura_hrms_config_connector       — S25 integration endpoints + secrets
--   * aura_hrms_config_migration       — S26 data-migration plans + runs
-- ============================================================================

CREATE TABLE "aura_hrms_config_object" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "domainCode" TEXT NOT NULL,
  "objectType" TEXT NOT NULL,
  "objectKey" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "scope" TEXT NOT NULL DEFAULT 'GLOBAL',
  "scopeRef" TEXT,
  "country" TEXT,
  "legalEntityId" TEXT,
  "version" INTEGER NOT NULL DEFAULT 1,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveTo" TIMESTAMP(3),
  "payload" JSONB NOT NULL,
  "targetModel" TEXT,
  "targetRecordId" TEXT,
  "rationale" TEXT,
  "sourceReference" TEXT,
  "requestedBy" TEXT NOT NULL,
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP(3),
  "retiredBy" TEXT,
  "retiredAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_hrms_config_object_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_hrms_config_object_unique"
  ON "aura_hrms_config_object"("tenantId", "domainCode", "objectKey", "version");
CREATE INDEX "aura_hrms_config_object_status"
  ON "aura_hrms_config_object"("tenantId", "domainCode", "status");
CREATE INDEX "aura_hrms_config_object_scope"
  ON "aura_hrms_config_object"("tenantId", "scope", "scopeRef");
CREATE INDEX "aura_hrms_config_object_effective"
  ON "aura_hrms_config_object"("tenantId", "domainCode", "effectiveFrom", "effectiveTo");

CREATE TABLE "aura_hrms_config_certificate" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "certificateType" TEXT NOT NULL DEFAULT 'MONTHLY',
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "domainsCovered" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "totalConfigObjects" INTEGER NOT NULL DEFAULT 0,
  "activeConfigObjects" INTEGER NOT NULL DEFAULT 0,
  "pendingApprovalCount" INTEGER NOT NULL DEFAULT 0,
  "openImplementationItems" INTEGER NOT NULL DEFAULT 0,
  "failingConnectors" INTEGER NOT NULL DEFAULT 0,
  "failingMigrations" INTEGER NOT NULL DEFAULT 0,
  "gatingReason" TEXT,
  "signedBy" TEXT,
  "signedAt" TIMESTAMP(3),
  "attestationsJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_hrms_config_certificate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_hrms_config_certificate_unique"
  ON "aura_hrms_config_certificate"("tenantId", "period", "certificateType");
CREATE INDEX "aura_hrms_config_certificate_status"
  ON "aura_hrms_config_certificate"("tenantId", "status");

CREATE TABLE "aura_hrms_implementation_checklist" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "phase" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "owner" TEXT,
  "ownerRole" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "isMandatory" BOOLEAN NOT NULL DEFAULT true,
  "dueDate" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "completedBy" TEXT,
  "evidenceUrl" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_hrms_implementation_checklist_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_hrms_implementation_checklist_unique"
  ON "aura_hrms_implementation_checklist"("tenantId", "code");
CREATE INDEX "aura_hrms_implementation_checklist_phase"
  ON "aura_hrms_implementation_checklist"("tenantId", "phase", "status");

CREATE TABLE "aura_hrms_config_connector" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "connectorCode" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "direction" TEXT NOT NULL DEFAULT 'OUTBOUND',
  "endpointUrl" TEXT,
  "authType" TEXT NOT NULL DEFAULT 'NONE',
  "secretRef" TEXT,
  "configJson" JSONB,
  "lastRotatedAt" TIMESTAMP(3),
  "rotationDueAt" TIMESTAMP(3),
  "lastHealthCheckAt" TIMESTAMP(3),
  "lastHealthStatus" TEXT,
  "lastHealthMessage" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_hrms_config_connector_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_hrms_config_connector_unique"
  ON "aura_hrms_config_connector"("tenantId", "connectorCode");
CREATE INDEX "aura_hrms_config_connector_health"
  ON "aura_hrms_config_connector"("tenantId", "lastHealthStatus");

CREATE TABLE "aura_hrms_config_migration" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "planCode" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "domainCode" TEXT NOT NULL,
  "sourceSystem" TEXT NOT NULL,
  "targetEntity" TEXT NOT NULL,
  "expectedRows" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'PLANNED',
  "lastRunAt" TIMESTAMP(3),
  "lastRunResult" TEXT,
  "lastRunInserted" INTEGER NOT NULL DEFAULT 0,
  "lastRunUpdated" INTEGER NOT NULL DEFAULT 0,
  "lastRunSkipped" INTEGER NOT NULL DEFAULT 0,
  "lastRunErrors" INTEGER NOT NULL DEFAULT 0,
  "validationsPassed" BOOLEAN NOT NULL DEFAULT false,
  "validationsJson" JSONB,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_hrms_config_migration_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_hrms_config_migration_unique"
  ON "aura_hrms_config_migration"("tenantId", "planCode");
CREATE INDEX "aura_hrms_config_migration_status"
  ON "aura_hrms_config_migration"("tenantId", "status");
