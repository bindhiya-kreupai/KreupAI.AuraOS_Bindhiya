CREATE TABLE "aura_country_onboarding_rule" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "countryCode" TEXT NOT NULL,
  "ruleCode" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "effectiveTo" TIMESTAMP(3),
  "ruleSet" JSONB NOT NULL,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "aura_country_onboarding_rule_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "aura_onboarding_instance"
  ADD COLUMN "countryCode" TEXT,
  ADD COLUMN "countryRuleId" TEXT,
  ADD COLUMN "countryRuleVersion" TEXT,
  ADD COLUMN "countryRuleSnapshot" JSONB;

ALTER TABLE "aura_onboarding_task"
  ADD COLUMN "ruleTaskCode" TEXT,
  ADD COLUMN "documentRequirements" JSONB,
  ADD COLUMN "downstreamTrigger" TEXT,
  ADD COLUMN "blockingStage" TEXT;

CREATE UNIQUE INDEX "aura_country_onboarding_rule_tenantId_countryCode_version_key" ON "aura_country_onboarding_rule"("tenantId", "countryCode", "version");
CREATE INDEX "aura_country_onboarding_rule_tenantId_idx" ON "aura_country_onboarding_rule"("tenantId");
CREATE INDEX "aura_country_onboarding_rule_countryCode_idx" ON "aura_country_onboarding_rule"("countryCode");
CREATE INDEX "aura_country_onboarding_rule_status_idx" ON "aura_country_onboarding_rule"("status");
CREATE INDEX "aura_country_onboarding_rule_effectiveFrom_idx" ON "aura_country_onboarding_rule"("effectiveFrom");
CREATE INDEX "aura_onboarding_instance_countryCode_idx" ON "aura_onboarding_instance"("countryCode");
CREATE INDEX "aura_onboarding_instance_countryRuleId_idx" ON "aura_onboarding_instance"("countryRuleId");
CREATE INDEX "aura_onboarding_task_ruleTaskCode_idx" ON "aura_onboarding_task"("ruleTaskCode");
