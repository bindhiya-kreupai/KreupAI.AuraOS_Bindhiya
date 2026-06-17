-- ============================================================================
-- EPIC-08 (Employee Records Management compliance: mandatory document
-- matrix, completeness score, audit checklist, risk register, certificate)
-- ============================================================================

CREATE TABLE "aura_records_document_matrix" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "documentCode" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "isMandatory" BOOLEAN NOT NULL DEFAULT true,
  "appliesWhen" TEXT,
  "retentionYears" INTEGER NOT NULL DEFAULT 7,
  "renewalCadenceMonths" INTEGER,
  "sensitivity" TEXT NOT NULL DEFAULT 'CONFIDENTIAL',
  "regulatorRef" TEXT,
  "notes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_records_document_matrix_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_records_document_matrix_unique"
  ON "aura_records_document_matrix"("tenantId", "country", "documentCode");

CREATE TABLE "aura_records_completeness_snapshot" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "country" TEXT,
  "mandatoryTotal" INTEGER NOT NULL DEFAULT 0,
  "mandatoryPresent" INTEGER NOT NULL DEFAULT 0,
  "mandatoryMissing" INTEGER NOT NULL DEFAULT 0,
  "expiringWithin30" INTEGER NOT NULL DEFAULT 0,
  "expired" INTEGER NOT NULL DEFAULT 0,
  "score" DECIMAL(5, 2) NOT NULL DEFAULT 0,
  "band" TEXT NOT NULL DEFAULT 'AMBER',
  "missingCodes" JSONB NOT NULL DEFAULT '[]',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_records_completeness_snapshot_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_records_completeness_snapshot_unique"
  ON "aura_records_completeness_snapshot"("tenantId", "period", "employeeId");
CREATE INDEX "aura_records_completeness_snapshot_band"
  ON "aura_records_completeness_snapshot"("tenantId", "period", "band");

CREATE TABLE "aura_records_audit_checklist_item" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "itemCode" TEXT NOT NULL,
  "label" TEXT NOT NULL,
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
  CONSTRAINT "aura_records_audit_checklist_item_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_records_audit_checklist_item_unique"
  ON "aura_records_audit_checklist_item"("tenantId", "itemCode");

CREATE TABLE "aura_records_risk_entry" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "riskCode" TEXT NOT NULL,
  "title" TEXT NOT NULL,
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
  CONSTRAINT "aura_records_risk_entry_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_records_risk_entry_unique"
  ON "aura_records_risk_entry"("tenantId", "riskCode");

CREATE TABLE "aura_records_compliance_certificate" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "employeesEvaluated" INTEGER NOT NULL DEFAULT 0,
  "averageScore" DECIMAL(5, 2) NOT NULL DEFAULT 0,
  "greenEmployees" INTEGER NOT NULL DEFAULT 0,
  "amberEmployees" INTEGER NOT NULL DEFAULT 0,
  "redEmployees" INTEGER NOT NULL DEFAULT 0,
  "mandatoryMissingTotal" INTEGER NOT NULL DEFAULT 0,
  "expiredDocsTotal" INTEGER NOT NULL DEFAULT 0,
  "checklistFailing" INTEGER NOT NULL DEFAULT 0,
  "checklistOverdue" INTEGER NOT NULL DEFAULT 0,
  "criticalRisksOpen" INTEGER NOT NULL DEFAULT 0,
  "metricsJson" JSONB NOT NULL DEFAULT '{}',
  "gatingReason" TEXT,
  "attestationsJson" JSONB NOT NULL DEFAULT '[]',
  "generatedAt" TIMESTAMP(3),
  "signedAt" TIMESTAMP(3),
  "signedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_records_compliance_certificate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_records_compliance_certificate_unique"
  ON "aura_records_compliance_certificate"("tenantId", "period");
