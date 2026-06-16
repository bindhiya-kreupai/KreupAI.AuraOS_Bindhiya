CREATE TABLE "aura_onboarding_governance_template" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "countryCode" TEXT NOT NULL,
  "legalEntityId" TEXT,
  "employmentType" TEXT,
  "version" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "stageConfig" JSONB NOT NULL,
  "checklistTemplate" JSONB,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "aura_onboarding_governance_template_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "aura_onboarding_case" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "offerId" TEXT,
  "onboardingInstanceId" TEXT,
  "employeeId" TEXT,
  "candidateName" TEXT,
  "candidateEmail" TEXT,
  "countryCode" TEXT NOT NULL,
  "legalEntityId" TEXT NOT NULL,
  "employmentType" TEXT NOT NULL,
  "targetJoinDate" TIMESTAMP(3) NOT NULL,
  "currentStage" TEXT NOT NULL DEFAULT 'PRE_JOINING',
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "stageOwnerRole" TEXT NOT NULL,
  "escalationRole" TEXT,
  "governanceTemplateId" TEXT,
  "governanceVersion" TEXT,
  "governanceSnapshot" JSONB NOT NULL,
  "checklistSnapshot" JSONB,
  "blockingItems" JSONB NOT NULL DEFAULT '[]',
  "slaDueAt" TIMESTAMP(3),
  "escalatedAt" TIMESTAMP(3),
  "escalatedToRole" TEXT,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "aura_onboarding_case_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "aura_onboarding_stage_history" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "caseId" TEXT NOT NULL,
  "fromStage" TEXT,
  "toStage" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "reason" TEXT,
  "blockingItems" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_onboarding_stage_history_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "aura_onboarding_governance_template_tenantId_countryCode_legalEntityId_employmentType_version_key" ON "aura_onboarding_governance_template"("tenantId", "countryCode", "legalEntityId", "employmentType", "version");
CREATE INDEX "aura_onboarding_governance_template_tenantId_idx" ON "aura_onboarding_governance_template"("tenantId");
CREATE INDEX "aura_onboarding_governance_template_countryCode_idx" ON "aura_onboarding_governance_template"("countryCode");
CREATE INDEX "aura_onboarding_governance_template_legalEntityId_idx" ON "aura_onboarding_governance_template"("legalEntityId");
CREATE INDEX "aura_onboarding_governance_template_employmentType_idx" ON "aura_onboarding_governance_template"("employmentType");
CREATE INDEX "aura_onboarding_governance_template_status_idx" ON "aura_onboarding_governance_template"("status");

CREATE UNIQUE INDEX "aura_onboarding_case_tenantId_offerId_key" ON "aura_onboarding_case"("tenantId", "offerId");
CREATE INDEX "aura_onboarding_case_tenantId_idx" ON "aura_onboarding_case"("tenantId");
CREATE INDEX "aura_onboarding_case_offerId_idx" ON "aura_onboarding_case"("offerId");
CREATE INDEX "aura_onboarding_case_employeeId_idx" ON "aura_onboarding_case"("employeeId");
CREATE INDEX "aura_onboarding_case_countryCode_idx" ON "aura_onboarding_case"("countryCode");
CREATE INDEX "aura_onboarding_case_legalEntityId_idx" ON "aura_onboarding_case"("legalEntityId");
CREATE INDEX "aura_onboarding_case_currentStage_idx" ON "aura_onboarding_case"("currentStage");
CREATE INDEX "aura_onboarding_case_status_idx" ON "aura_onboarding_case"("status");
CREATE INDEX "aura_onboarding_case_slaDueAt_idx" ON "aura_onboarding_case"("slaDueAt");

CREATE INDEX "aura_onboarding_stage_history_tenantId_idx" ON "aura_onboarding_stage_history"("tenantId");
CREATE INDEX "aura_onboarding_stage_history_caseId_idx" ON "aura_onboarding_stage_history"("caseId");
CREATE INDEX "aura_onboarding_stage_history_toStage_idx" ON "aura_onboarding_stage_history"("toStage");
CREATE INDEX "aura_onboarding_stage_history_createdAt_idx" ON "aura_onboarding_stage_history"("createdAt");

ALTER TABLE "aura_onboarding_stage_history"
  ADD CONSTRAINT "aura_onboarding_stage_history_caseId_fkey"
  FOREIGN KEY ("caseId") REFERENCES "aura_onboarding_case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
