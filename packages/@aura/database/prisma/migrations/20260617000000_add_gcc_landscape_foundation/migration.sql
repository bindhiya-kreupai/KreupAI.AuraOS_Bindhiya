-- ============================================================================
-- EPIC-01 (GCC Employment Landscape) — Foundation tables
-- Adds: tenant↔country binding, GCC legal entities, country reference data,
-- workforce classification, platform alert backbone, compliance risk register,
-- localization KPI snapshots, and digital-maturity scorecard.
-- ============================================================================

-- S01: per-tenant GCC country enablement
CREATE TABLE "aura_gcc_tenant_country" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "countryCode" TEXT NOT NULL,
  "isEnabled" BOOLEAN NOT NULL DEFAULT true,
  "defaultCurrency" TEXT NOT NULL,
  "defaultTimezone" TEXT NOT NULL,
  "enabledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "enabledBy" TEXT,
  "disabledAt" TIMESTAMP(3),
  "disabledBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_gcc_tenant_country_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "aura_gcc_tenant_country_tenantId_countryCode_key"
  ON "aura_gcc_tenant_country"("tenantId", "countryCode");
CREATE INDEX "aura_gcc_tenant_country_tenantId_idx" ON "aura_gcc_tenant_country"("tenantId");
CREATE INDEX "aura_gcc_tenant_country_countryCode_idx" ON "aura_gcc_tenant_country"("countryCode");
CREATE INDEX "aura_gcc_tenant_country_isEnabled_idx" ON "aura_gcc_tenant_country"("isEnabled");

-- S01: GCC legal entities (per tenant, bound to a country)
CREATE TABLE "aura_gcc_legal_entity" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "tenantCountryId" TEXT NOT NULL,
  "companyId" TEXT,
  "countryCode" TEXT NOT NULL,
  "legalName" TEXT NOT NULL,
  "registrationRef" TEXT NOT NULL,
  "registrationType" TEXT NOT NULL,
  "currency" TEXT NOT NULL,
  "timezone" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "activatedAt" TIMESTAMP(3),
  "deactivatedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_gcc_legal_entity_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "aura_gcc_legal_entity_tenantId_countryCode_registrationRef_key"
  ON "aura_gcc_legal_entity"("tenantId", "countryCode", "registrationRef");
CREATE INDEX "aura_gcc_legal_entity_tenantId_idx" ON "aura_gcc_legal_entity"("tenantId");
CREATE INDEX "aura_gcc_legal_entity_tenantCountryId_idx" ON "aura_gcc_legal_entity"("tenantCountryId");
CREATE INDEX "aura_gcc_legal_entity_companyId_idx" ON "aura_gcc_legal_entity"("companyId");
CREATE INDEX "aura_gcc_legal_entity_countryCode_idx" ON "aura_gcc_legal_entity"("countryCode");
CREATE INDEX "aura_gcc_legal_entity_isActive_idx" ON "aura_gcc_legal_entity"("isActive");

ALTER TABLE "aura_gcc_legal_entity"
  ADD CONSTRAINT "aura_gcc_legal_entity_tenantCountryId_fkey"
  FOREIGN KEY ("tenantCountryId") REFERENCES "aura_gcc_tenant_country"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- S02: versioned GCC country reference dataset
CREATE TABLE "aura_gcc_country_profile" (
  "id" TEXT NOT NULL,
  "countryCode" TEXT NOT NULL,
  "weekendPattern" TEXT NOT NULL,
  "statutoryCurrency" TEXT NOT NULL,
  "labourAuthority" TEXT NOT NULL,
  "socialInsuranceAuthority" TEXT NOT NULL,
  "nationalizationProgramme" TEXT NOT NULL,
  "expatProfile" TEXT NOT NULL,
  "marketNotes" TEXT NOT NULL,
  "authoritiesJson" JSONB NOT NULL DEFAULT '{}',
  "version" INTEGER NOT NULL DEFAULT 1,
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveTo" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_gcc_country_profile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "aura_gcc_country_profile_countryCode_version_key"
  ON "aura_gcc_country_profile"("countryCode", "version");
CREATE INDEX "aura_gcc_country_profile_countryCode_idx" ON "aura_gcc_country_profile"("countryCode");
CREATE INDEX "aura_gcc_country_profile_effectiveFrom_idx" ON "aura_gcc_country_profile"("effectiveFrom");
CREATE INDEX "aura_gcc_country_profile_status_idx" ON "aura_gcc_country_profile"("status");

-- S03: per-employee versioned workforce classification
CREATE TABLE "aura_workforce_classification" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "nationality" TEXT NOT NULL,
  "countryOfEmployment" TEXT NOT NULL,
  "isGccNational" BOOLEAN NOT NULL DEFAULT false,
  "workforceClass" TEXT NOT NULL,
  "isEmiratisationEligible" BOOLEAN NOT NULL DEFAULT false,
  "isCrossGccUnified" BOOLEAN NOT NULL DEFAULT false,
  "classificationVersion" INTEGER NOT NULL DEFAULT 1,
  "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "effectiveTo" TIMESTAMP(3),
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_workforce_classification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "aura_workforce_classification_tenantId_idx" ON "aura_workforce_classification"("tenantId");
CREATE INDEX "aura_workforce_classification_employeeId_idx" ON "aura_workforce_classification"("employeeId");
CREATE INDEX "aura_workforce_classification_countryOfEmployment_idx" ON "aura_workforce_classification"("countryOfEmployment");
CREATE INDEX "aura_workforce_classification_workforceClass_idx" ON "aura_workforce_classification"("workforceClass");
CREATE INDEX "aura_workforce_classification_effectiveFrom_idx" ON "aura_workforce_classification"("effectiveFrom");

-- S04: platform alert rules + instances
CREATE TABLE "aura_platform_alert_rule" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "eventType" TEXT NOT NULL,
  "countryScope" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "entityScope" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "thresholds" JSONB NOT NULL,
  "recipientRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "channels" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_platform_alert_rule_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "aura_platform_alert_rule_tenantId_code_key"
  ON "aura_platform_alert_rule"("tenantId", "code");
CREATE INDEX "aura_platform_alert_rule_tenantId_idx" ON "aura_platform_alert_rule"("tenantId");
CREATE INDEX "aura_platform_alert_rule_eventType_idx" ON "aura_platform_alert_rule"("eventType");
CREATE INDEX "aura_platform_alert_rule_isActive_idx" ON "aura_platform_alert_rule"("isActive");

CREATE TABLE "aura_platform_alert_instance" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "alertRuleId" TEXT NOT NULL,
  "thresholdDays" INTEGER NOT NULL,
  "resourceType" TEXT,
  "resourceId" TEXT,
  "triggeredFor" TIMESTAMP(3) NOT NULL,
  "firedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "channel" TEXT NOT NULL,
  "recipientRole" TEXT,
  "recipientUserId" TEXT,
  "payload" JSONB NOT NULL DEFAULT '{}',
  "status" TEXT NOT NULL DEFAULT 'FIRED',
  "errorMessage" TEXT,
  CONSTRAINT "aura_platform_alert_instance_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "aura_platform_alert_instance_rule_threshold_resource_key"
  ON "aura_platform_alert_instance"("alertRuleId", "thresholdDays", "resourceType", "resourceId");
CREATE INDEX "aura_platform_alert_instance_tenantId_idx" ON "aura_platform_alert_instance"("tenantId");
CREATE INDEX "aura_platform_alert_instance_alertRuleId_idx" ON "aura_platform_alert_instance"("alertRuleId");
CREATE INDEX "aura_platform_alert_instance_firedAt_idx" ON "aura_platform_alert_instance"("firedAt");
CREATE INDEX "aura_platform_alert_instance_status_idx" ON "aura_platform_alert_instance"("status");

ALTER TABLE "aura_platform_alert_instance"
  ADD CONSTRAINT "aura_platform_alert_instance_alertRuleId_fkey"
  FOREIGN KEY ("alertRuleId") REFERENCES "aura_platform_alert_rule"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- S05: GCC persona scope (extends existing Role with country/entity scope)
CREATE TABLE "aura_gcc_role_scope" (
  "id" TEXT NOT NULL,
  "userRoleId" TEXT NOT NULL,
  "countryCode" TEXT,
  "legalEntityId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  CONSTRAINT "aura_gcc_role_scope_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "aura_gcc_role_scope_userRoleId_countryCode_legalEntityId_key"
  ON "aura_gcc_role_scope"("userRoleId", "countryCode", "legalEntityId");
CREATE INDEX "aura_gcc_role_scope_userRoleId_idx" ON "aura_gcc_role_scope"("userRoleId");
CREATE INDEX "aura_gcc_role_scope_countryCode_idx" ON "aura_gcc_role_scope"("countryCode");
CREATE INDEX "aura_gcc_role_scope_legalEntityId_idx" ON "aura_gcc_role_scope"("legalEntityId");

-- S06: compliance risk register
CREATE TABLE "aura_compliance_risk_register" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "riskCode" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "likelihood" INTEGER NOT NULL,
  "impact" INTEGER NOT NULL,
  "score" INTEGER NOT NULL,
  "rating" TEXT NOT NULL,
  "ownerRole" TEXT NOT NULL,
  "countryScope" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "entityScope" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "mitigation" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "reviewDueAt" TIMESTAMP(3),
  "lastReviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_compliance_risk_register_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "aura_compliance_risk_register_tenantId_riskCode_key"
  ON "aura_compliance_risk_register"("tenantId", "riskCode");
CREATE INDEX "aura_compliance_risk_register_tenantId_idx" ON "aura_compliance_risk_register"("tenantId");
CREATE INDEX "aura_compliance_risk_register_rating_idx" ON "aura_compliance_risk_register"("rating");
CREATE INDEX "aura_compliance_risk_register_status_idx" ON "aura_compliance_risk_register"("status");
CREATE INDEX "aura_compliance_risk_register_category_idx" ON "aura_compliance_risk_register"("category");

-- S07: localization target + KPI snapshots
CREATE TABLE "aura_localization_target" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "countryCode" TEXT NOT NULL,
  "legalEntityId" TEXT,
  "targetPct" DECIMAL(5,2) NOT NULL,
  "amberThreshold" DECIMAL(5,2) NOT NULL,
  "redThreshold" DECIMAL(5,2) NOT NULL,
  "programme" TEXT,
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveTo" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_localization_target_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "aura_localization_target_unique_key"
  ON "aura_localization_target"("tenantId", "countryCode", "legalEntityId", "effectiveFrom");
CREATE INDEX "aura_localization_target_tenantId_idx" ON "aura_localization_target"("tenantId");
CREATE INDEX "aura_localization_target_countryCode_idx" ON "aura_localization_target"("countryCode");

CREATE TABLE "aura_workforce_kpi_snapshot" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "countryCode" TEXT,
  "legalEntityId" TEXT,
  "snapshotDate" TIMESTAMP(3) NOT NULL,
  "totalHeadcount" INTEGER NOT NULL,
  "nationalCount" INTEGER NOT NULL,
  "gccOtherCount" INTEGER NOT NULL,
  "expatCount" INTEGER NOT NULL,
  "nationalPct" DECIMAL(5,2) NOT NULL,
  "targetPct" DECIMAL(5,2),
  "ragStatus" TEXT,
  "metricsJson" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_workforce_kpi_snapshot_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "aura_workforce_kpi_snapshot_unique_key"
  ON "aura_workforce_kpi_snapshot"("tenantId", "countryCode", "legalEntityId", "snapshotDate");
CREATE INDEX "aura_workforce_kpi_snapshot_tenantId_idx" ON "aura_workforce_kpi_snapshot"("tenantId");
CREATE INDEX "aura_workforce_kpi_snapshot_snapshotDate_idx" ON "aura_workforce_kpi_snapshot"("snapshotDate");
CREATE INDEX "aura_workforce_kpi_snapshot_countryCode_idx" ON "aura_workforce_kpi_snapshot"("countryCode");

-- S09: digital maturity domains + snapshots
CREATE TABLE "aura_digital_maturity_domain" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "ordering" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_digital_maturity_domain_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "aura_digital_maturity_domain_code_key"
  ON "aura_digital_maturity_domain"("code");

CREATE TABLE "aura_digital_maturity_snapshot" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "domainId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "currentLevel" INTEGER NOT NULL,
  "targetLevel" INTEGER NOT NULL,
  "gap" INTEGER NOT NULL,
  "notes" TEXT,
  "isImprovementPriority" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_digital_maturity_snapshot_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "aura_digital_maturity_snapshot_unique_key"
  ON "aura_digital_maturity_snapshot"("tenantId", "domainId", "period");
CREATE INDEX "aura_digital_maturity_snapshot_tenantId_idx" ON "aura_digital_maturity_snapshot"("tenantId");
CREATE INDEX "aura_digital_maturity_snapshot_period_idx" ON "aura_digital_maturity_snapshot"("period");

ALTER TABLE "aura_digital_maturity_snapshot"
  ADD CONSTRAINT "aura_digital_maturity_snapshot_domainId_fkey"
  FOREIGN KEY ("domainId") REFERENCES "aura_digital_maturity_domain"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
