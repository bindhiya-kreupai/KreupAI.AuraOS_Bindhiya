-- Audit & Security module tables (backlog AURA-264..281).
-- Deployed via db-push; all defensive CREATE TABLE IF NOT EXISTS (no Prisma enums).

CREATE TABLE IF NOT EXISTS "aura_compliance_framework" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "description" TEXT,
  "version" TEXT NOT NULL DEFAULT '1.0',
  "status" TEXT NOT NULL DEFAULT 'in-progress',
  "readinessScore" INTEGER NOT NULL DEFAULT 0,
  "certificationDate" TIMESTAMP(3),
  "certificationExpiry" TIMESTAMP(3),
  "nextAuditDate" TIMESTAMP(3),
  "auditor" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_compliance_framework_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "aura_compliance_framework_tenantId_code_key" ON "aura_compliance_framework"("tenantId", "code");
CREATE INDEX IF NOT EXISTS "aura_compliance_framework_tenantId_idx" ON "aura_compliance_framework"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_compliance_control" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "frameworkId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'partial',
  "ownerId" TEXT,
  "ownerName" TEXT,
  "riskLevel" TEXT NOT NULL DEFAULT 'medium',
  "lastTested" TIMESTAMP(3),
  "nextTestDue" TIMESTAMP(3),
  "remediationPlan" TEXT,
  "relatedControls" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_compliance_control_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "aura_compliance_control_tenantId_idx" ON "aura_compliance_control"("tenantId");
CREATE INDEX IF NOT EXISTS "aura_compliance_control_frameworkId_idx" ON "aura_compliance_control"("frameworkId");

CREATE TABLE IF NOT EXISTS "aura_compliance_evidence" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "controlId" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "fileType" TEXT NOT NULL,
  "fileSize" INTEGER NOT NULL DEFAULT 0,
  "fileUrl" TEXT,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "uploadedBy" TEXT,
  "effectiveDate" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "verifiedBy" TEXT,
  "verifiedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_compliance_evidence_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "aura_compliance_evidence_tenantId_idx" ON "aura_compliance_evidence"("tenantId");
CREATE INDEX IF NOT EXISTS "aura_compliance_evidence_controlId_idx" ON "aura_compliance_evidence"("controlId");

CREATE TABLE IF NOT EXISTS "aura_compliance_test" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "controlId" TEXT NOT NULL,
  "testName" TEXT NOT NULL,
  "result" TEXT NOT NULL,
  "details" TEXT,
  "remediationRequired" TEXT,
  "duration" INTEGER NOT NULL DEFAULT 0,
  "runBy" TEXT,
  "runAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_compliance_test_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "aura_compliance_test_tenantId_idx" ON "aura_compliance_test"("tenantId");
CREATE INDEX IF NOT EXISTS "aura_compliance_test_controlId_idx" ON "aura_compliance_test"("controlId");

CREATE TABLE IF NOT EXISTS "aura_compliance_timeline_event" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "frameworkId" TEXT,
  "frameworkName" TEXT,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "date" TIMESTAMP(3) NOT NULL,
  "priority" TEXT NOT NULL DEFAULT 'medium',
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_compliance_timeline_event_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "aura_compliance_timeline_event_tenantId_idx" ON "aura_compliance_timeline_event"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_sod_rule" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL DEFAULT 'general',
  "riskLevel" TEXT NOT NULL DEFAULT 'medium',
  "conflictingRoles" JSONB NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_sod_rule_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "aura_sod_rule_tenantId_idx" ON "aura_sod_rule"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_sod_violation" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "ruleId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "userName" TEXT,
  "conflictA" TEXT NOT NULL,
  "conflictB" TEXT NOT NULL,
  "riskLevel" TEXT NOT NULL DEFAULT 'medium',
  "status" TEXT NOT NULL DEFAULT 'open',
  "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3),
  "resolvedBy" TEXT,
  "resolution" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_sod_violation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "aura_sod_violation_tenantId_idx" ON "aura_sod_violation"("tenantId");
CREATE INDEX IF NOT EXISTS "aura_sod_violation_ruleId_idx" ON "aura_sod_violation"("ruleId");

CREATE TABLE IF NOT EXISTS "aura_access_review_campaign" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "scope" TEXT NOT NULL DEFAULT 'all',
  "status" TEXT NOT NULL DEFAULT 'draft',
  "dueDate" TIMESTAMP(3),
  "reviewerId" TEXT,
  "reviewerName" TEXT,
  "totalItems" INTEGER NOT NULL DEFAULT 0,
  "reviewedItems" INTEGER NOT NULL DEFAULT 0,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_access_review_campaign_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "aura_access_review_campaign_tenantId_idx" ON "aura_access_review_campaign"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_access_review_item" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "campaignId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "userName" TEXT,
  "roleName" TEXT NOT NULL,
  "resource" TEXT,
  "decision" TEXT NOT NULL DEFAULT 'pending',
  "comment" TEXT,
  "reviewedBy" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_access_review_item_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "aura_access_review_item_tenantId_idx" ON "aura_access_review_item"("tenantId");
CREATE INDEX IF NOT EXISTS "aura_access_review_item_campaignId_idx" ON "aura_access_review_item"("campaignId");

CREATE TABLE IF NOT EXISTS "aura_dsar_request" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "requestType" TEXT NOT NULL,
  "subjectName" TEXT NOT NULL,
  "subjectEmail" TEXT NOT NULL,
  "subjectId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'new',
  "priority" TEXT NOT NULL DEFAULT 'medium',
  "dueDate" TIMESTAMP(3),
  "details" TEXT,
  "assignedTo" TEXT,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_dsar_request_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "aura_dsar_request_tenantId_idx" ON "aura_dsar_request"("tenantId");
CREATE INDEX IF NOT EXISTS "aura_dsar_request_tenantId_status_idx" ON "aura_dsar_request"("tenantId", "status");

CREATE TABLE IF NOT EXISTS "aura_consent_record" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "subjectId" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "granted" BOOLEAN NOT NULL DEFAULT false,
  "source" TEXT,
  "grantedAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_consent_record_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "aura_consent_record_tenantId_subjectId_category_key" ON "aura_consent_record"("tenantId", "subjectId", "category");
CREATE INDEX IF NOT EXISTS "aura_consent_record_tenantId_idx" ON "aura_consent_record"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_data_retention_policy" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "description" TEXT,
  "retentionDays" INTEGER NOT NULL DEFAULT 365,
  "action" TEXT NOT NULL DEFAULT 'archive',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "lastRunAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_data_retention_policy_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "aura_data_retention_policy_tenantId_category_key" ON "aura_data_retention_policy"("tenantId", "category");
CREATE INDEX IF NOT EXISTS "aura_data_retention_policy_tenantId_idx" ON "aura_data_retention_policy"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_field_security_rule" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "roleName" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "fieldName" TEXT NOT NULL,
  "access" TEXT NOT NULL DEFAULT 'view',
  "masked" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_field_security_rule_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "aura_field_security_rule_unique_key" ON "aura_field_security_rule"("tenantId", "roleName", "entityType", "fieldName");
CREATE INDEX IF NOT EXISTS "aura_field_security_rule_tenantId_idx" ON "aura_field_security_rule"("tenantId");
CREATE INDEX IF NOT EXISTS "aura_field_security_rule_tenantId_roleName_idx" ON "aura_field_security_rule"("tenantId", "roleName");

CREATE TABLE IF NOT EXISTS "aura_mfa_policy" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "enforced" BOOLEAN NOT NULL DEFAULT false,
  "allowedMethods" JSONB NOT NULL,
  "enforceForAdmins" BOOLEAN NOT NULL DEFAULT true,
  "enforceForAllUsers" BOOLEAN NOT NULL DEFAULT false,
  "enforceForRemote" BOOLEAN NOT NULL DEFAULT false,
  "graceperiodDays" INTEGER NOT NULL DEFAULT 7,
  "rememberDeviceDays" INTEGER NOT NULL DEFAULT 30,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_mfa_policy_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "aura_mfa_policy_tenantId_key" ON "aura_mfa_policy"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_document_access_log" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "documentId" TEXT,
  "documentName" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "userId" TEXT,
  "userName" TEXT,
  "ipAddress" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_document_access_log_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "aura_document_access_log_tenantId_idx" ON "aura_document_access_log"("tenantId");
CREATE INDEX IF NOT EXISTS "aura_document_access_log_tenantId_action_idx" ON "aura_document_access_log"("tenantId", "action");

CREATE TABLE IF NOT EXISTS "aura_security_setting" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "passwordMinLength" INTEGER NOT NULL DEFAULT 8,
  "passwordRequireUppercase" BOOLEAN NOT NULL DEFAULT true,
  "passwordRequireNumber" BOOLEAN NOT NULL DEFAULT true,
  "passwordRequireSymbol" BOOLEAN NOT NULL DEFAULT false,
  "passwordExpiryDays" INTEGER NOT NULL DEFAULT 90,
  "sessionTimeoutMinutes" INTEGER NOT NULL DEFAULT 30,
  "maxLoginAttempts" INTEGER NOT NULL DEFAULT 5,
  "lockoutDurationMinutes" INTEGER NOT NULL DEFAULT 15,
  "ipAllowlist" JSONB,
  "enforceSSO" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_security_setting_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "aura_security_setting_tenantId_key" ON "aura_security_setting"("tenantId");
