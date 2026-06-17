-- ============================================================================
-- EPIC-34 (HRMS Configuration for GCC Compliance — versioned rule sets,
-- approval workflow templates, notification rules, audit-trail settings)
-- ============================================================================

CREATE TABLE "aura_country_rule_set" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveTo" TIMESTAMP(3),
  "rulesJson" JSONB NOT NULL DEFAULT '{}',
  "publishedAt" TIMESTAMP(3),
  "publishedBy" TEXT,
  "supersededById" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_country_rule_set_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_country_rule_set_unique"
  ON "aura_country_rule_set"("tenantId", "country", "domain", "version");

CREATE TABLE "aura_approval_workflow_template" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "templateCode" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "country" TEXT,
  "stagesJson" JSONB NOT NULL DEFAULT '[]',
  "escalationHours" INTEGER NOT NULL DEFAULT 24,
  "autoApproveWhen" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_approval_workflow_template_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_approval_workflow_template_unique"
  ON "aura_approval_workflow_template"("tenantId", "templateCode");

CREATE TABLE "aura_notification_rule" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "ruleCode" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "trigger" TEXT NOT NULL,
  "channelsJson" JSONB NOT NULL DEFAULT '[]',
  "recipientRoles" JSONB NOT NULL DEFAULT '[]',
  "templateText" TEXT,
  "templateTextAr" TEXT,
  "severity" TEXT NOT NULL DEFAULT 'INFO',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_notification_rule_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_notification_rule_unique"
  ON "aura_notification_rule"("tenantId", "ruleCode");

CREATE TABLE "aura_audit_trail_setting" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "captureReads" BOOLEAN NOT NULL DEFAULT false,
  "captureWrites" BOOLEAN NOT NULL DEFAULT true,
  "captureExports" BOOLEAN NOT NULL DEFAULT true,
  "retentionYears" INTEGER NOT NULL DEFAULT 7,
  "piiClassification" TEXT NOT NULL DEFAULT 'CONFIDENTIAL',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_audit_trail_setting_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_audit_trail_setting_unique"
  ON "aura_audit_trail_setting"("tenantId", "domain");
