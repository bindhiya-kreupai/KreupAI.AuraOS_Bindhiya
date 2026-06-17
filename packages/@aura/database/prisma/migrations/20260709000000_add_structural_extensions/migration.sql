-- ============================================================================
-- Themes J + K — Org/payroll structural + misc closures.
--   J: JobFamily, JobProfile, SalaryGradeBand, DelegationOfAuthority,
--      PayrollCalendarControl, PayrollVarianceEntry.
--   K: FatigueRule, OvertimeFraudFlag, EosSioFundingLink, ReturnToWorkPlan,
--      HolidayCalendarChangeRequest, RedundancyBatch,
--      SeparationRetentionPolicy, DocumentPhysicalLocation,
--      AuditFindingRiskLink.
--
-- Service-only closures (no schema change): 11-S05 unified wage-file
-- generator (orchestrates per-country services), 25-S04 informal grievance
-- mediation state, 30-S07 classification-based record RBAC, 31-S04 country
-- rollup, 31-S14 dashboard RBAC.
-- ============================================================================

-- Note: aura_job_family + aura_job_profile already exist in the deployed
-- schema (declared earlier). EPIC-09-S06 closure reuses them via a new
-- API surface in org-compliance, no new tables needed for job architecture.

CREATE TABLE "aura_salary_grade_band" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "gradeCode" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "country" TEXT,
  "currency" TEXT NOT NULL DEFAULT 'AED',
  "minSalary" DECIMAL(18,2) NOT NULL,
  "midSalary" DECIMAL(18,2) NOT NULL,
  "maxSalary" DECIMAL(18,2) NOT NULL,
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveTo" TIMESTAMP(3),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_salary_grade_band_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_salary_grade_band_unique"
  ON "aura_salary_grade_band"("tenantId", "gradeCode", "country", "effectiveFrom");

CREATE TABLE "aura_delegation_of_authority" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "actionCode" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "level" INTEGER NOT NULL,
  "minRole" TEXT NOT NULL,
  "thresholdAmount" DECIMAL(18,2),
  "currency" TEXT,
  "country" TEXT,
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveTo" TIMESTAMP(3),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_delegation_of_authority_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_delegation_of_authority_unique"
  ON "aura_delegation_of_authority"("tenantId", "domain", "actionCode", "level", "effectiveFrom");

CREATE TABLE "aura_payroll_calendar_control" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "periodCode" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "periodEnd" TIMESTAMP(3) NOT NULL,
  "cutoffAt" TIMESTAMP(3) NOT NULL,
  "lockAt" TIMESTAMP(3) NOT NULL,
  "payAt" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "lockedBy" TEXT,
  "lockedAt" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_payroll_calendar_control_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_payroll_calendar_control_unique"
  ON "aura_payroll_calendar_control"("tenantId", "country", "periodCode");

CREATE TABLE "aura_payroll_variance_entry" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "payrollRunId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "varianceCode" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "expectedAmount" DECIMAL(18,2) NOT NULL,
  "actualAmount" DECIMAL(18,2) NOT NULL,
  "variancePct" DECIMAL(8,2),
  "rootCause" TEXT,
  "actionPlan" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_payroll_variance_entry_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_payroll_variance_entry_unique"
  ON "aura_payroll_variance_entry"("tenantId", "payrollRunId", "varianceCode");

CREATE TABLE "aura_fatigue_rule" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "ruleCode" TEXT NOT NULL,
  "country" TEXT,
  "maxConsecutiveDays" INTEGER NOT NULL DEFAULT 6,
  "minRestHoursBetweenShifts" INTEGER NOT NULL DEFAULT 11,
  "maxWeeklyHours" INTEGER NOT NULL DEFAULT 48,
  "appliesTo" TEXT NOT NULL DEFAULT 'ALL',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_fatigue_rule_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_fatigue_rule_unique" ON "aura_fatigue_rule"("tenantId", "ruleCode");

CREATE TABLE "aura_overtime_fraud_flag" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "evidencePeriod" TEXT NOT NULL,
  "signal" TEXT NOT NULL,
  "details" TEXT,
  "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
  "isResolved" BOOLEAN NOT NULL DEFAULT false,
  "resolvedBy" TEXT,
  "resolvedAt" TIMESTAMP(3),
  "resolutionReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_overtime_fraud_flag_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_overtime_fraud_flag_signal"
  ON "aura_overtime_fraud_flag"("tenantId", "signal", "isResolved");

CREATE TABLE "aura_eos_sio_funding_link" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "schemeCode" TEXT NOT NULL,
  "fundingAccountRef" TEXT,
  "balance" DECIMAL(18,2),
  "currency" TEXT NOT NULL DEFAULT 'BHD',
  "lastReconciledAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_eos_sio_funding_link_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_eos_sio_funding_link_unique"
  ON "aura_eos_sio_funding_link"("tenantId", "employeeId", "schemeCode");

CREATE TABLE "aura_return_to_work_plan" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "leaveCaseId" TEXT,
  "leaveCode" TEXT NOT NULL,
  "expectedReturnDate" TIMESTAMP(3) NOT NULL,
  "actualReturnDate" TIMESTAMP(3),
  "fitnessClearance" BOOLEAN NOT NULL DEFAULT false,
  "phasedReturnPct" INTEGER,
  "accommodationsJson" JSONB,
  "managerSignedAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'PLANNED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_return_to_work_plan_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_return_to_work_plan_employee"
  ON "aura_return_to_work_plan"("tenantId", "employeeId");

CREATE TABLE "aura_holiday_calendar_change_request" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "calendarCode" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "changeType" TEXT NOT NULL,
  "changeJson" JSONB NOT NULL,
  "rationale" TEXT NOT NULL,
  "regulatorRef" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
  "requestedBy" TEXT NOT NULL,
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP(3),
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_holiday_calendar_change_request_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_holiday_calendar_change_request_status"
  ON "aura_holiday_calendar_change_request"("tenantId", "status");

CREATE TABLE "aura_redundancy_batch" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "batchCode" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "scope" TEXT NOT NULL,
  "selectionCriteriaJson" JSONB,
  "impactedHeadcount" INTEGER NOT NULL DEFAULT 0,
  "consultationStartAt" TIMESTAMP(3),
  "consultationEndAt" TIMESTAMP(3),
  "noticeDate" TIMESTAMP(3),
  "effectiveDate" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'PLANNING',
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_redundancy_batch_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_redundancy_batch_unique"
  ON "aura_redundancy_batch"("tenantId", "batchCode");

CREATE TABLE "aura_separation_retention_policy" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "country" TEXT,
  "recordType" TEXT NOT NULL,
  "retentionYears" INTEGER NOT NULL,
  "classification" TEXT NOT NULL DEFAULT 'CONFIDENTIAL',
  "disposalMethod" TEXT NOT NULL DEFAULT 'SECURE_SHRED',
  "legalBasis" TEXT,
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveTo" TIMESTAMP(3),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_separation_retention_policy_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_separation_retention_policy_unique"
  ON "aura_separation_retention_policy"("tenantId", "country", "recordType", "effectiveFrom");

CREATE TABLE "aura_document_physical_location" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "documentRef" TEXT NOT NULL,
  "warehouseCode" TEXT NOT NULL,
  "boxCode" TEXT,
  "shelfCode" TEXT,
  "fileCode" TEXT,
  "status" TEXT NOT NULL DEFAULT 'STORED',
  "checkedOutBy" TEXT,
  "checkedOutAt" TIMESTAMP(3),
  "returnedAt" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_document_physical_location_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_document_physical_location_unique"
  ON "aura_document_physical_location"("tenantId", "documentRef");
CREATE INDEX "aura_document_physical_location_warehouse"
  ON "aura_document_physical_location"("tenantId", "warehouseCode");

CREATE TABLE "aura_audit_finding_risk_link" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "findingRef" TEXT NOT NULL,
  "domainCode" TEXT NOT NULL,
  "riskCode" TEXT NOT NULL,
  "linkType" TEXT NOT NULL DEFAULT 'CAUSED_BY',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_audit_finding_risk_link_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_audit_finding_risk_link_unique"
  ON "aura_audit_finding_risk_link"("tenantId", "findingRef", "domainCode", "riskCode");
