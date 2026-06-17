-- ============================================================================
-- EPIC-33 (HR Forms & Templates Compliance — layered over existing
-- AdminForm + FormSubmission; adds template catalogue with groups & versioning,
-- routing/approval workflow, e-signature audit, and monthly certificate)
-- ============================================================================

CREATE TABLE "aura_hr_form_template" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "templateCode" TEXT NOT NULL,
  "formGroup" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "version" TEXT NOT NULL DEFAULT '1.0',
  "schemaJson" JSONB NOT NULL DEFAULT '{}',
  "writebackTarget" TEXT,
  "isMandatory" BOOLEAN NOT NULL DEFAULT false,
  "countryCode" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "publishedAt" TIMESTAMP(3),
  "supersededById" TEXT,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_hr_form_template_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_hr_form_template_unique"
  ON "aura_hr_form_template"("tenantId", "templateCode", "version");

CREATE TABLE "aura_hr_form_routing" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "templateId" TEXT NOT NULL,
  "stageOrder" INTEGER NOT NULL,
  "stageLabel" TEXT NOT NULL,
  "approverRole" TEXT,
  "approverId" TEXT,
  "slaHours" INTEGER NOT NULL DEFAULT 48,
  "isParallel" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_hr_form_routing_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_hr_form_routing_unique"
  ON "aura_hr_form_routing"("tenantId", "templateId", "stageOrder");

CREATE TABLE "aura_hr_form_submission_state" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "templateId" TEXT NOT NULL,
  "submissionRef" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "payloadJson" JSONB NOT NULL DEFAULT '{}',
  "currentStage" INTEGER NOT NULL DEFAULT 0,
  "totalStages" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "submittedAt" TIMESTAMP(3),
  "approvedAt" TIMESTAMP(3),
  "rejectedAt" TIMESTAMP(3),
  "rejectionReason" TEXT,
  "writebackStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "writebackRef" TEXT,
  "writebackAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_hr_form_submission_state_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_hr_form_submission_state_unique"
  ON "aura_hr_form_submission_state"("tenantId", "submissionRef");
CREATE INDEX "aura_hr_form_submission_state_template"
  ON "aura_hr_form_submission_state"("tenantId", "templateId");

CREATE TABLE "aura_hr_form_signature" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "submissionStateId" TEXT NOT NULL,
  "stageOrder" INTEGER NOT NULL,
  "signerRole" TEXT,
  "signerId" TEXT NOT NULL,
  "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "action" TEXT NOT NULL,
  "comments" TEXT,
  "signatureHash" TEXT,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_hr_form_signature_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_hr_form_signature_state"
  ON "aura_hr_form_signature"("tenantId", "submissionStateId");

CREATE TABLE "aura_hr_form_certificate" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "templatesPublished" INTEGER NOT NULL DEFAULT 0,
  "submissionsTotal" INTEGER NOT NULL DEFAULT 0,
  "submissionsApproved" INTEGER NOT NULL DEFAULT 0,
  "submissionsRejected" INTEGER NOT NULL DEFAULT 0,
  "submissionsPending" INTEGER NOT NULL DEFAULT 0,
  "writebackFailures" INTEGER NOT NULL DEFAULT 0,
  "slaBreachCount" INTEGER NOT NULL DEFAULT 0,
  "gatingReason" TEXT,
  "attestationsJson" JSONB NOT NULL DEFAULT '[]',
  "generatedAt" TIMESTAMP(3),
  "signedAt" TIMESTAMP(3),
  "signedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_hr_form_certificate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_hr_form_certificate_unique"
  ON "aura_hr_form_certificate"("tenantId", "period");
