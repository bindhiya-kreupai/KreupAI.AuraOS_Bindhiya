-- ============================================================================
-- EPIC-31 (Executive HR Compliance Dashboard, KPI Rollup & Corrective Actions)
-- ============================================================================

CREATE TABLE "aura_compliance_kpi_snapshot" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "score" DECIMAL(5,2) NOT NULL DEFAULT 0,
  "ragStatus" TEXT NOT NULL DEFAULT 'GREEN',
  "openIssues" INTEGER NOT NULL DEFAULT 0,
  "blockingIssues" INTEGER NOT NULL DEFAULT 0,
  "certificateStatus" TEXT,
  "certificateGatingReason" TEXT,
  "metricsJson" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_compliance_kpi_snapshot_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_compliance_kpi_snapshot_unique"
  ON "aura_compliance_kpi_snapshot"("tenantId", "period", "domain");

CREATE TABLE "aura_compliance_risk_entry" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "country" TEXT,
  "likelihood" INTEGER NOT NULL,
  "impact" INTEGER NOT NULL,
  "score" INTEGER NOT NULL,
  "band" TEXT NOT NULL,
  "ownerId" TEXT,
  "lastReviewedAt" TIMESTAMP(3),
  "nextReviewAt" TIMESTAMP(3),
  "mitigationNotes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_compliance_risk_entry_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_compliance_risk_entry_tenant"
  ON "aura_compliance_risk_entry"("tenantId");

CREATE TABLE "aura_compliance_corrective_action" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "actionNumber" TEXT NOT NULL,
  "sourceDomain" TEXT NOT NULL,
  "sourceRef" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "rootCause" TEXT,
  "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
  "ownerId" TEXT,
  "raisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "raisedBy" TEXT,
  "dueAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "completedBy" TEXT,
  "verificationNotes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_compliance_corrective_action_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_compliance_corrective_action_unique"
  ON "aura_compliance_corrective_action"("tenantId", "actionNumber");

CREATE TABLE "aura_compliance_review_calendar_item" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "category" TEXT,
  "ownerId" TEXT,
  "dueAt" TIMESTAMP(3) NOT NULL,
  "frequency" TEXT NOT NULL DEFAULT 'MONTHLY',
  "lastCompletedAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_compliance_review_calendar_item_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_compliance_review_calendar_item_tenant"
  ON "aura_compliance_review_calendar_item"("tenantId", "dueAt");

CREATE TABLE "aura_executive_compliance_certificate" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "domainCount" INTEGER NOT NULL DEFAULT 0,
  "greenDomains" INTEGER NOT NULL DEFAULT 0,
  "amberDomains" INTEGER NOT NULL DEFAULT 0,
  "redDomains" INTEGER NOT NULL DEFAULT 0,
  "blockingIssuesTotal" INTEGER NOT NULL DEFAULT 0,
  "criticalRisksOpen" INTEGER NOT NULL DEFAULT 0,
  "correctiveActionsOpen" INTEGER NOT NULL DEFAULT 0,
  "correctiveActionsOverdue" INTEGER NOT NULL DEFAULT 0,
  "reviewItemsOverdue" INTEGER NOT NULL DEFAULT 0,
  "averageScore" DECIMAL(5,2) NOT NULL DEFAULT 0,
  "domainBreakdownJson" JSONB NOT NULL DEFAULT '[]',
  "gatingReason" TEXT,
  "attestationsJson" JSONB NOT NULL DEFAULT '[]',
  "generatedAt" TIMESTAMP(3),
  "signedAt" TIMESTAMP(3),
  "signedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_executive_compliance_certificate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_executive_compliance_certificate_unique"
  ON "aura_executive_compliance_certificate"("tenantId", "period");
