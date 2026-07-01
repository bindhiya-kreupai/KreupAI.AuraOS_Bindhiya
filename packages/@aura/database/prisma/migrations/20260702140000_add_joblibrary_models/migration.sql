-- Job Library module domain models (AURA-163, 164, 165).
-- Defensive CREATE TABLE IF NOT EXISTS; repo uses db-push, enums stored as TEXT.
-- Catalog + families reuse existing JobProfile / JobFamily / JobFunction tables;
-- these tables hold the Job-Library-owned entities that had no backing table.

CREATE TABLE IF NOT EXISTS "aura_job_evaluation" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "jobTitle" TEXT NOT NULL,
  "jobProfileId" TEXT,
  "familyName" TEXT,
  "method" TEXT NOT NULL DEFAULT 'point_factor',
  "status" TEXT NOT NULL DEFAULT 'pending',
  "score" INTEGER,
  "assignedGrade" TEXT,
  "evaluatorId" TEXT,
  "evaluatorName" TEXT,
  "factors" JSONB,
  "notes" TEXT,
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_job_evaluation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "JobEvaluation_tenantId_idx" ON "aura_job_evaluation"("tenantId");
CREATE INDEX IF NOT EXISTS "JobEvaluation_tenant_status_idx" ON "aura_job_evaluation"("tenantId", "status");

CREATE TABLE IF NOT EXISTS "aura_job_posting_template" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'general',
  "sections" JSONB NOT NULL DEFAULT '[]',
  "body" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "usageCount" INTEGER NOT NULL DEFAULT 0,
  "lastUsedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_job_posting_template_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "JobPostingTemplate_tenantId_idx" ON "aura_job_posting_template"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_job_market_pricing" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "jobTitle" TEXT NOT NULL,
  "gradeLabel" TEXT,
  "region" TEXT NOT NULL DEFAULT 'Global',
  "industry" TEXT NOT NULL DEFAULT 'Technology',
  "companySize" TEXT,
  "marketMin" DECIMAL(14,2) NOT NULL,
  "marketMid" DECIMAL(14,2) NOT NULL,
  "marketMax" DECIMAL(14,2) NOT NULL,
  "internalMedian" DECIMAL(14,2),
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "marketTrend" TEXT NOT NULL DEFAULT 'stable',
  "source" TEXT,
  "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_job_market_pricing_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "JobMarketPricing_tenantId_idx" ON "aura_job_market_pricing"("tenantId");
CREATE INDEX IF NOT EXISTS "JobMarketPricing_tenant_region_idx" ON "aura_job_market_pricing"("tenantId", "region");

CREATE TABLE IF NOT EXISTS "aura_job_compensation_strategy" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "targetPercentile" INTEGER NOT NULL DEFAULT 50,
  "scope" TEXT NOT NULL DEFAULT 'All roles',
  "description" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedBy" TEXT,
  CONSTRAINT "aura_job_compensation_strategy_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "JobCompensationStrategy_tenantId_key" ON "aura_job_compensation_strategy"("tenantId");
