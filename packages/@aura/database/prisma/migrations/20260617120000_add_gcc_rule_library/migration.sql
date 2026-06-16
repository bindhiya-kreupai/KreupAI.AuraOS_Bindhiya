-- ============================================================================
-- EPIC-36 (GCC Country Compliance Library & Rule Config)
-- ============================================================================

CREATE TABLE "aura_compliance_theme" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "domains" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_compliance_theme_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_compliance_theme_code_key" ON "aura_compliance_theme"("code");

CREATE TABLE "aura_country_rule_pack" (
  "id" TEXT NOT NULL,
  "countryCode" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveTo" TIMESTAMP(3),
  "registeredAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_country_rule_pack_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_country_rule_pack_country_version_key" ON "aura_country_rule_pack"("countryCode", "version");
CREATE INDEX "aura_country_rule_pack_status_idx" ON "aura_country_rule_pack"("status");
CREATE INDEX "aura_country_rule_pack_effectiveFrom_idx" ON "aura_country_rule_pack"("effectiveFrom");

CREATE TABLE "aura_country_rule" (
  "id" TEXT NOT NULL,
  "rulePackId" TEXT NOT NULL,
  "countryCode" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "ruleKey" TEXT NOT NULL,
  "value" JSONB NOT NULL,
  "formula" TEXT,
  "authority" TEXT,
  "citation" TEXT,
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveTo" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_country_rule_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_country_rule_pack_domain_key_unique" ON "aura_country_rule"("rulePackId", "domain", "ruleKey");
CREATE INDEX "aura_country_rule_countryCode_idx" ON "aura_country_rule"("countryCode");
CREATE INDEX "aura_country_rule_domain_idx" ON "aura_country_rule"("domain");
CREATE INDEX "aura_country_rule_ruleKey_idx" ON "aura_country_rule"("ruleKey");
ALTER TABLE "aura_country_rule"
  ADD CONSTRAINT "aura_country_rule_rulePackId_fkey"
  FOREIGN KEY ("rulePackId") REFERENCES "aura_country_rule_pack"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "aura_country_risk_matrix" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "countryCode" TEXT NOT NULL,
  "riskCode" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "likelihood" INTEGER NOT NULL,
  "impact" INTEGER NOT NULL,
  "score" INTEGER NOT NULL,
  "rating" TEXT NOT NULL,
  "ownerRole" TEXT NOT NULL,
  "controlRef" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "remediationDueAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_country_risk_matrix_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_country_risk_matrix_unique"
  ON "aura_country_risk_matrix"("tenantId", "countryCode", "riskCode");
CREATE INDEX "aura_country_risk_matrix_tenantId_idx" ON "aura_country_risk_matrix"("tenantId");
CREATE INDEX "aura_country_risk_matrix_countryCode_idx" ON "aura_country_risk_matrix"("countryCode");
CREATE INDEX "aura_country_risk_matrix_rating_idx" ON "aura_country_risk_matrix"("rating");
CREATE INDEX "aura_country_risk_matrix_status_idx" ON "aura_country_risk_matrix"("status");

CREATE TABLE "aura_country_audit_checklist" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "countryCode" TEXT NOT NULL,
  "checklistCode" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "items" JSONB NOT NULL,
  "redFlagDefinitions" JSONB NOT NULL DEFAULT '[]',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_country_audit_checklist_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_country_audit_checklist_unique"
  ON "aura_country_audit_checklist"("tenantId", "countryCode", "checklistCode");
CREATE INDEX "aura_country_audit_checklist_countryCode_idx"
  ON "aura_country_audit_checklist"("countryCode");

CREATE TABLE "aura_country_compliance_certificate" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "countryCode" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "domainStatus" JSONB NOT NULL,
  "criticalOpenRisks" INTEGER NOT NULL DEFAULT 0,
  "gatingReason" TEXT,
  "attestationsJson" JSONB NOT NULL DEFAULT '[]',
  "generatedAt" TIMESTAMP(3),
  "signedAt" TIMESTAMP(3),
  "signedBy" TEXT,
  "pdfUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_country_compliance_certificate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_country_compliance_certificate_unique"
  ON "aura_country_compliance_certificate"("tenantId", "countryCode", "period");
CREATE INDEX "aura_country_compliance_certificate_period_idx"
  ON "aura_country_compliance_certificate"("period");
CREATE INDEX "aura_country_compliance_certificate_status_idx"
  ON "aura_country_compliance_certificate"("status");
