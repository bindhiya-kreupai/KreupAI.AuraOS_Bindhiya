-- ============================================================================
-- EPIC-03 + EPIC-04 + EPIC-05 (Workforce Planning, Recruitment, Offer
-- Management compliance overlay: audit checklist, risk register, monthly cert)
-- ============================================================================

CREATE TABLE "aura_ta_audit_checklist_item" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "itemCode" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "stage" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "country" TEXT,
  "expectation" TEXT,
  "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
  "lastReviewedAt" TIMESTAMP(3),
  "lastReviewedBy" TEXT,
  "lastResult" TEXT,
  "notes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_ta_audit_checklist_item_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_ta_audit_checklist_item_unique"
  ON "aura_ta_audit_checklist_item"("tenantId", "itemCode");
CREATE INDEX "aura_ta_audit_checklist_item_stage"
  ON "aura_ta_audit_checklist_item"("tenantId", "stage");

CREATE TABLE "aura_ta_risk_entry" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "riskCode" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "stage" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "country" TEXT,
  "likelihood" INTEGER NOT NULL,
  "impact" INTEGER NOT NULL,
  "score" INTEGER NOT NULL,
  "band" TEXT NOT NULL,
  "ownerId" TEXT,
  "mitigation" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_ta_risk_entry_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_ta_risk_entry_unique"
  ON "aura_ta_risk_entry"("tenantId", "riskCode");

CREATE TABLE "aura_ta_compliance_certificate" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "checklistTotal" INTEGER NOT NULL DEFAULT 0,
  "checklistFailing" INTEGER NOT NULL DEFAULT 0,
  "checklistOverdue" INTEGER NOT NULL DEFAULT 0,
  "criticalRisksOpen" INTEGER NOT NULL DEFAULT 0,
  "stagesCovered" INTEGER NOT NULL DEFAULT 0,
  "stageBreakdownJson" JSONB NOT NULL DEFAULT '[]',
  "metricsJson" JSONB NOT NULL DEFAULT '{}',
  "gatingReason" TEXT,
  "attestationsJson" JSONB NOT NULL DEFAULT '[]',
  "generatedAt" TIMESTAMP(3),
  "signedAt" TIMESTAMP(3),
  "signedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_ta_compliance_certificate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_ta_compliance_certificate_unique"
  ON "aura_ta_compliance_certificate"("tenantId", "period");
