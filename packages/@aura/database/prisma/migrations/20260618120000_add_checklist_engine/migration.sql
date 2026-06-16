-- ============================================================================
-- EPIC-37 (Compliance Checklist & Red-Flag Engine)
-- ============================================================================

CREATE TABLE "aura_checklist_template" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "appendixRef" TEXT,
  "description" TEXT NOT NULL,
  "ownerRole" TEXT NOT NULL,
  "approverRole" TEXT NOT NULL,
  "scope" JSONB NOT NULL DEFAULT '{}',
  "version" INTEGER NOT NULL DEFAULT 1,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "reviewCadence" TEXT NOT NULL DEFAULT 'ANNUAL',
  "approvedAt" TIMESTAMP(3),
  "approvedBy" TEXT,
  "supersededBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_checklist_template_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_checklist_template_unique" ON "aura_checklist_template"("tenantId", "code", "version");
CREATE INDEX "aura_checklist_template_domain_idx" ON "aura_checklist_template"("domain");
CREATE INDEX "aura_checklist_template_status_idx" ON "aura_checklist_template"("status");

CREATE TABLE "aura_checklist_item" (
  "id" TEXT NOT NULL,
  "templateId" TEXT NOT NULL,
  "ordering" INTEGER NOT NULL,
  "code" TEXT NOT NULL,
  "controlObjective" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "evidenceRequired" BOOLEAN NOT NULL DEFAULT true,
  "isMandatory" BOOLEAN NOT NULL DEFAULT true,
  "weighting" INTEGER NOT NULL DEFAULT 1,
  "redFlagRuleCode" TEXT,
  CONSTRAINT "aura_checklist_item_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_checklist_item_unique" ON "aura_checklist_item"("templateId", "code");
CREATE INDEX "aura_checklist_item_templateId_idx" ON "aura_checklist_item"("templateId");
ALTER TABLE "aura_checklist_item"
  ADD CONSTRAINT "aura_checklist_item_templateId_fkey"
  FOREIGN KEY ("templateId") REFERENCES "aura_checklist_template"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "aura_red_flag_rule" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "expression" TEXT NOT NULL,
  "thresholdJson" JSONB NOT NULL DEFAULT '{}',
  "countryCode" TEXT,
  "severity" TEXT NOT NULL DEFAULT 'HIGH',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_red_flag_rule_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_red_flag_rule_unique" ON "aura_red_flag_rule"("tenantId", "code");
CREATE INDEX "aura_red_flag_rule_domain_idx" ON "aura_red_flag_rule"("domain");

CREATE TABLE "aura_checklist_run" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "templateId" TEXT NOT NULL,
  "templateCode" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "countryCode" TEXT,
  "legalEntityId" TEXT,
  "employeeId" TEXT,
  "ownerRole" TEXT NOT NULL,
  "preparerId" TEXT,
  "approverId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "totalItems" INTEGER NOT NULL DEFAULT 0,
  "compliantItems" INTEGER NOT NULL DEFAULT 0,
  "nonCompliantItems" INTEGER NOT NULL DEFAULT 0,
  "naItems" INTEGER NOT NULL DEFAULT 0,
  "weightedScore" DECIMAL(6,2),
  "submittedAt" TIMESTAMP(3),
  "approvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_checklist_run_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_checklist_run_tenant_idx" ON "aura_checklist_run"("tenantId");
CREATE INDEX "aura_checklist_run_period_idx" ON "aura_checklist_run"("period");
CREATE INDEX "aura_checklist_run_status_idx" ON "aura_checklist_run"("status");
CREATE INDEX "aura_checklist_run_template_idx" ON "aura_checklist_run"("templateId");
CREATE UNIQUE INDEX "aura_checklist_run_unique"
  ON "aura_checklist_run"("tenantId", "templateCode", "period", "legalEntityId", "employeeId");
ALTER TABLE "aura_checklist_run"
  ADD CONSTRAINT "aura_checklist_run_templateId_fkey"
  FOREIGN KEY ("templateId") REFERENCES "aura_checklist_template"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "aura_checklist_run_item" (
  "id" TEXT NOT NULL,
  "runId" TEXT NOT NULL,
  "itemCode" TEXT NOT NULL,
  "controlObjective" TEXT NOT NULL,
  "weighting" INTEGER NOT NULL DEFAULT 1,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "evidenceUrl" TEXT,
  "reason" TEXT,
  "reviewerId" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "autoEvaluated" BOOLEAN NOT NULL DEFAULT false,
  "redFlagId" TEXT,
  CONSTRAINT "aura_checklist_run_item_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_checklist_run_item_unique" ON "aura_checklist_run_item"("runId", "itemCode");
CREATE INDEX "aura_checklist_run_item_runId_idx" ON "aura_checklist_run_item"("runId");
CREATE INDEX "aura_checklist_run_item_status_idx" ON "aura_checklist_run_item"("status");
ALTER TABLE "aura_checklist_run_item"
  ADD CONSTRAINT "aura_checklist_run_item_runId_fkey"
  FOREIGN KEY ("runId") REFERENCES "aura_checklist_run"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "aura_red_flag_instance" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "ruleCode" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "sourceType" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  "checklistRunId" TEXT,
  "details" JSONB NOT NULL DEFAULT '{}',
  "raisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "clearedAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  CONSTRAINT "aura_red_flag_instance_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_red_flag_instance_unique"
  ON "aura_red_flag_instance"("tenantId", "ruleCode", "sourceType", "sourceId", "raisedAt");
CREATE INDEX "aura_red_flag_instance_tenantId_idx" ON "aura_red_flag_instance"("tenantId");
CREATE INDEX "aura_red_flag_instance_severity_idx" ON "aura_red_flag_instance"("severity");
CREATE INDEX "aura_red_flag_instance_status_idx" ON "aura_red_flag_instance"("status");

CREATE TABLE "aura_compliance_exception" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "registerCode" TEXT NOT NULL,
  "sourceType" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "ownerRole" TEXT NOT NULL,
  "ownerUserId" TEXT,
  "dueDate" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "closedAt" TIMESTAMP(3),
  "redFlagId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_compliance_exception_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_compliance_exception_tenantId_idx" ON "aura_compliance_exception"("tenantId");
CREATE INDEX "aura_compliance_exception_domain_idx" ON "aura_compliance_exception"("domain");
CREATE INDEX "aura_compliance_exception_status_idx" ON "aura_compliance_exception"("status");
CREATE INDEX "aura_compliance_exception_registerCode_idx" ON "aura_compliance_exception"("registerCode");

CREATE TABLE "aura_checklist_certificate" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "scope" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "runsExecuted" INTEGER NOT NULL DEFAULT 0,
  "criticalRedFlags" INTEGER NOT NULL DEFAULT 0,
  "openCriticalExceptions" INTEGER NOT NULL DEFAULT 0,
  "gatingReason" TEXT,
  "attestationsJson" JSONB NOT NULL DEFAULT '[]',
  "generatedAt" TIMESTAMP(3),
  "signedAt" TIMESTAMP(3),
  "signedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_checklist_certificate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_checklist_certificate_unique"
  ON "aura_checklist_certificate"("tenantId", "scope", "period");
CREATE INDEX "aura_checklist_certificate_status_idx" ON "aura_checklist_certificate"("status");
