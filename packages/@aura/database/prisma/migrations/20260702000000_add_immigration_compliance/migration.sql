-- ============================================================================
-- EPIC-07 (Immigration & Work Authorization Compliance: country
-- authorization matrix, renewal alert ladder 60/30/7-day, transfer cases,
-- audit checklist, risk register, monthly cert)
-- ============================================================================

CREATE TABLE "aura_immigration_authorization_matrix" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "documentCode" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "issuer" TEXT,
  "appliesTo" TEXT NOT NULL DEFAULT 'EMPLOYEE',
  "isMandatory" BOOLEAN NOT NULL DEFAULT true,
  "validityMonths" INTEGER,
  "renewalLeadDays" INTEGER NOT NULL DEFAULT 60,
  "regulatorRef" TEXT,
  "notes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_immigration_authorization_matrix_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_immigration_authorization_matrix_unique"
  ON "aura_immigration_authorization_matrix"("tenantId", "country", "documentCode", "appliesTo");

CREATE TABLE "aura_immigration_renewal_alert" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "subjectType" TEXT NOT NULL DEFAULT 'EMPLOYEE',
  "subjectId" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "documentCode" TEXT NOT NULL,
  "permitId" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "window" TEXT NOT NULL,
  "raisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "acknowledgedAt" TIMESTAMP(3),
  "acknowledgedBy" TEXT,
  "renewedAt" TIMESTAMP(3),
  "renewedBy" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_immigration_renewal_alert_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_immigration_renewal_alert_unique"
  ON "aura_immigration_renewal_alert"("tenantId", "subjectId", "documentCode", "expiresAt", "window");
CREATE INDEX "aura_immigration_renewal_alert_status"
  ON "aura_immigration_renewal_alert"("tenantId", "status", "window");

CREATE TABLE "aura_immigration_transfer_case" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "caseNumber" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "transferType" TEXT NOT NULL,
  "fromCountry" TEXT,
  "toCountry" TEXT,
  "fromEntity" TEXT,
  "toEntity" TEXT,
  "fromLocation" TEXT,
  "toLocation" TEXT,
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "approvedAt" TIMESTAMP(3),
  "approvedBy" TEXT,
  "completedAt" TIMESTAMP(3),
  "notes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'REQUESTED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_immigration_transfer_case_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_immigration_transfer_case_unique"
  ON "aura_immigration_transfer_case"("tenantId", "caseNumber");

CREATE TABLE "aura_immigration_audit_checklist_item" (
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
  CONSTRAINT "aura_immigration_audit_checklist_item_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_immigration_audit_checklist_item_unique"
  ON "aura_immigration_audit_checklist_item"("tenantId", "itemCode");

CREATE TABLE "aura_immigration_risk_entry" (
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
  CONSTRAINT "aura_immigration_risk_entry_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_immigration_risk_entry_unique"
  ON "aura_immigration_risk_entry"("tenantId", "riskCode");

CREATE TABLE "aura_immigration_compliance_certificate" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "expiredDocsTotal" INTEGER NOT NULL DEFAULT 0,
  "alerts7dOpen" INTEGER NOT NULL DEFAULT 0,
  "alerts30dOpen" INTEGER NOT NULL DEFAULT 0,
  "alerts60dOpen" INTEGER NOT NULL DEFAULT 0,
  "transfersOpenOverdue" INTEGER NOT NULL DEFAULT 0,
  "checklistTotal" INTEGER NOT NULL DEFAULT 0,
  "checklistFailing" INTEGER NOT NULL DEFAULT 0,
  "checklistOverdue" INTEGER NOT NULL DEFAULT 0,
  "criticalRisksOpen" INTEGER NOT NULL DEFAULT 0,
  "countriesCovered" INTEGER NOT NULL DEFAULT 0,
  "metricsJson" JSONB NOT NULL DEFAULT '{}',
  "gatingReason" TEXT,
  "attestationsJson" JSONB NOT NULL DEFAULT '[]',
  "generatedAt" TIMESTAMP(3),
  "signedAt" TIMESTAMP(3),
  "signedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_immigration_compliance_certificate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_immigration_compliance_certificate_unique"
  ON "aura_immigration_compliance_certificate"("tenantId", "period");
