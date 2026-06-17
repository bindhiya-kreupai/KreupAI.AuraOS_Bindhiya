-- ============================================================================
-- EPIC-10 (Payroll Governance, Maker-Checker, Period-Lock, Reconciliation,
-- GL/Bank-File Audit, Multi-Country, Risk Matrix, Monthly Certificate)
-- ============================================================================

CREATE TABLE "aura_payroll_governance_control" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "controlCode" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "country" TEXT,
  "description" TEXT,
  "requiredEvidence" TEXT,
  "owner" TEXT,
  "frequency" TEXT NOT NULL DEFAULT 'MONTHLY',
  "lastReviewedAt" TIMESTAMP(3),
  "lastReviewedBy" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_payroll_governance_control_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_payroll_governance_control_unique"
  ON "aura_payroll_governance_control"("tenantId", "controlCode");

CREATE TABLE "aura_payroll_audit_finding" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "findingNumber" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "country" TEXT,
  "category" TEXT NOT NULL,
  "controlCode" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
  "evidence" TEXT,
  "ownerId" TEXT,
  "dueAt" TIMESTAMP(3),
  "remediation" TEXT,
  "remediatedAt" TIMESTAMP(3),
  "remediatedBy" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_payroll_audit_finding_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_payroll_audit_finding_unique"
  ON "aura_payroll_audit_finding"("tenantId", "findingNumber");
CREATE INDEX "aura_payroll_audit_finding_period"
  ON "aura_payroll_audit_finding"("tenantId", "period");

CREATE TABLE "aura_payroll_risk_entry" (
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
  "controlCode" TEXT,
  "ownerId" TEXT,
  "lastReviewedAt" TIMESTAMP(3),
  "mitigation" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_payroll_risk_entry_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_payroll_risk_entry_unique"
  ON "aura_payroll_risk_entry"("tenantId", "riskCode");

CREATE TABLE "aura_payroll_compliance_certificate" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "runsCount" INTEGER NOT NULL DEFAULT 0,
  "runsLocked" INTEGER NOT NULL DEFAULT 0,
  "runsApproved" INTEGER NOT NULL DEFAULT 0,
  "runsMakerCheckerBreaches" INTEGER NOT NULL DEFAULT 0,
  "openFindingsCritical" INTEGER NOT NULL DEFAULT 0,
  "openFindingsHigh" INTEGER NOT NULL DEFAULT 0,
  "criticalRisksOpen" INTEGER NOT NULL DEFAULT 0,
  "controlsOverdue" INTEGER NOT NULL DEFAULT 0,
  "reconciliationVariancePct" DECIMAL(8, 4) NOT NULL DEFAULT 0,
  "bankFileMismatches" INTEGER NOT NULL DEFAULT 0,
  "glPostingsMissing" INTEGER NOT NULL DEFAULT 0,
  "metricsJson" JSONB NOT NULL DEFAULT '{}',
  "gatingReason" TEXT,
  "attestationsJson" JSONB NOT NULL DEFAULT '[]',
  "generatedAt" TIMESTAMP(3),
  "signedAt" TIMESTAMP(3),
  "signedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_payroll_compliance_certificate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_payroll_compliance_certificate_unique"
  ON "aura_payroll_compliance_certificate"("tenantId", "period");
