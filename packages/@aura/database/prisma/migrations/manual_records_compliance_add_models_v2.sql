
-- CreateTable
CREATE TABLE "records_document_matrix" (
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

    CONSTRAINT "records_document_matrix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "records_completeness_snapshot" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "country" TEXT,
    "mandatoryTotal" INTEGER NOT NULL,
    "mandatoryPresent" INTEGER NOT NULL,
    "mandatoryMissing" INTEGER NOT NULL,
    "expiringWithin30" INTEGER NOT NULL DEFAULT 0,
    "expired" INTEGER NOT NULL DEFAULT 0,
    "score" DOUBLE PRECISION NOT NULL,
    "band" TEXT NOT NULL,
    "missingCodes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "records_completeness_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "records_audit_checklist_item" (
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

    CONSTRAINT "records_audit_checklist_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "records_risk_entry" (
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

    CONSTRAINT "records_risk_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "records_compliance_certificate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "employeesEvaluated" INTEGER NOT NULL,
    "averageScore" DOUBLE PRECISION NOT NULL,
    "greenEmployees" INTEGER NOT NULL,
    "amberEmployees" INTEGER NOT NULL,
    "redEmployees" INTEGER NOT NULL,
    "mandatoryMissingTotal" INTEGER NOT NULL,
    "expiredDocsTotal" INTEGER NOT NULL,
    "checklistFailing" INTEGER NOT NULL,
    "checklistOverdue" INTEGER NOT NULL,
    "criticalRisksOpen" INTEGER NOT NULL,
    "gatingReason" TEXT,
    "metricsJson" JSONB,
    "attestationsJson" JSONB,
    "generatedAt" TIMESTAMP(3) NOT NULL,
    "signedAt" TIMESTAMP(3),
    "signedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "records_compliance_certificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "records_document_matrix_tenantId_idx" ON "records_document_matrix"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "records_document_matrix_tenantId_country_documentCode_key" ON "records_document_matrix"("tenantId", "country", "documentCode");

-- CreateIndex
CREATE INDEX "records_completeness_snapshot_tenantId_period_idx" ON "records_completeness_snapshot"("tenantId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "records_completeness_snapshot_tenantId_period_employeeId_key" ON "records_completeness_snapshot"("tenantId", "period", "employeeId");

-- CreateIndex
CREATE INDEX "records_audit_checklist_item_tenantId_idx" ON "records_audit_checklist_item"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "records_audit_checklist_item_tenantId_itemCode_key" ON "records_audit_checklist_item"("tenantId", "itemCode");

-- CreateIndex
CREATE INDEX "records_risk_entry_tenantId_idx" ON "records_risk_entry"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "records_risk_entry_tenantId_riskCode_key" ON "records_risk_entry"("tenantId", "riskCode");

-- CreateIndex
CREATE INDEX "records_compliance_certificate_tenantId_idx" ON "records_compliance_certificate"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "records_compliance_certificate_tenantId_period_key" ON "records_compliance_certificate"("tenantId", "period");

