-- ============================================================================
-- EPIC-09 (Organization & Position Management compliance: audit checklist,
-- position control / headcount-budget, vacancy management, monthly cert)
-- ============================================================================

CREATE TABLE "aura_org_audit_checklist_item" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "itemCode" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "country" TEXT,
  "expectation" TEXT,
  "evidence" TEXT,
  "owner" TEXT,
  "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
  "lastReviewedAt" TIMESTAMP(3),
  "lastReviewedBy" TEXT,
  "lastResult" TEXT,
  "notes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_org_audit_checklist_item_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_org_audit_checklist_item_unique"
  ON "aura_org_audit_checklist_item"("tenantId", "itemCode");

CREATE TABLE "aura_org_position_control" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "departmentId" TEXT,
  "positionId" TEXT,
  "country" TEXT,
  "budgetedHeadcount" INTEGER NOT NULL DEFAULT 0,
  "approvedHeadcount" INTEGER NOT NULL DEFAULT 0,
  "filledHeadcount" INTEGER NOT NULL DEFAULT 0,
  "vacantHeadcount" INTEGER NOT NULL DEFAULT 0,
  "overhireCount" INTEGER NOT NULL DEFAULT 0,
  "frozenCount" INTEGER NOT NULL DEFAULT 0,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_org_position_control_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_org_position_control_unique"
  ON "aura_org_position_control"("tenantId", "period", "departmentId", "positionId");

CREATE TABLE "aura_org_vacancy" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "vacancyNumber" TEXT NOT NULL,
  "positionId" TEXT,
  "departmentId" TEXT,
  "country" TEXT,
  "raisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "approvedAt" TIMESTAMP(3),
  "approvedBy" TEXT,
  "filledAt" TIMESTAMP(3),
  "candidateId" TEXT,
  "agingDays" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_org_vacancy_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_org_vacancy_unique"
  ON "aura_org_vacancy"("tenantId", "vacancyNumber");
CREATE INDEX "aura_org_vacancy_status"
  ON "aura_org_vacancy"("tenantId", "status");

CREATE TABLE "aura_org_compliance_certificate" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "checklistTotal" INTEGER NOT NULL DEFAULT 0,
  "checklistFailing" INTEGER NOT NULL DEFAULT 0,
  "checklistOverdue" INTEGER NOT NULL DEFAULT 0,
  "overhireTotal" INTEGER NOT NULL DEFAULT 0,
  "frozenTotal" INTEGER NOT NULL DEFAULT 0,
  "vacanciesOpen" INTEGER NOT NULL DEFAULT 0,
  "vacanciesAgedOver90" INTEGER NOT NULL DEFAULT 0,
  "unapprovedVacancies" INTEGER NOT NULL DEFAULT 0,
  "departmentsCovered" INTEGER NOT NULL DEFAULT 0,
  "metricsJson" JSONB NOT NULL DEFAULT '{}',
  "gatingReason" TEXT,
  "attestationsJson" JSONB NOT NULL DEFAULT '[]',
  "generatedAt" TIMESTAMP(3),
  "signedAt" TIMESTAMP(3),
  "signedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_org_compliance_certificate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_org_compliance_certificate_unique"
  ON "aura_org_compliance_certificate"("tenantId", "period");
