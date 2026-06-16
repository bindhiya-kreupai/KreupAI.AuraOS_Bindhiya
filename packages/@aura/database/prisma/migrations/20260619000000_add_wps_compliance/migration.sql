-- ============================================================================
-- EPIC-11 (Wage Protection System Compliance)
-- ============================================================================

CREATE TABLE "aura_wps_scheme" (
  "id" TEXT NOT NULL,
  "countryCode" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "authority" TEXT NOT NULL,
  "channel" TEXT NOT NULL,
  "fileFormat" TEXT NOT NULL,
  "statutoryWindowDays" INTEGER NOT NULL,
  "mandatoryScope" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_wps_scheme_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_wps_scheme_countryCode_key" ON "aura_wps_scheme"("countryCode");

CREATE TABLE "aura_wps_establishment" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "countryCode" TEXT NOT NULL,
  "legalEntityId" TEXT,
  "employerId" TEXT NOT NULL,
  "establishmentName" TEXT NOT NULL,
  "agentBankCode" TEXT,
  "agentBankName" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_wps_establishment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_wps_establishment_unique"
  ON "aura_wps_establishment"("tenantId", "countryCode", "employerId");
CREATE INDEX "aura_wps_establishment_tenantId_idx" ON "aura_wps_establishment"("tenantId");
CREATE INDEX "aura_wps_establishment_countryCode_idx" ON "aura_wps_establishment"("countryCode");

CREATE TABLE "aura_wps_period_submission" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "countryCode" TEXT NOT NULL,
  "establishmentId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "fileFormat" TEXT NOT NULL,
  "fileContent" TEXT,
  "fileHash" TEXT,
  "totalEmployees" INTEGER NOT NULL DEFAULT 0,
  "totalAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "controlTotals" JSONB NOT NULL DEFAULT '{}',
  "dueDate" TIMESTAMP(3),
  "generatedAt" TIMESTAMP(3),
  "submittedAt" TIMESTAMP(3),
  "acknowledgedAt" TIMESTAMP(3),
  "ackReference" TEXT,
  "reconciledAt" TIMESTAMP(3),
  "reconciliationStatus" TEXT,
  "errors" JSONB NOT NULL DEFAULT '[]',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_wps_period_submission_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_wps_period_submission_unique"
  ON "aura_wps_period_submission"("tenantId", "establishmentId", "period");
CREATE INDEX "aura_wps_period_submission_tenantId_idx" ON "aura_wps_period_submission"("tenantId");
CREATE INDEX "aura_wps_period_submission_status_idx" ON "aura_wps_period_submission"("status");
CREATE INDEX "aura_wps_period_submission_period_idx" ON "aura_wps_period_submission"("period");

CREATE TABLE "aura_wps_employee_row" (
  "id" TEXT NOT NULL,
  "submissionId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "employeeCode" TEXT NOT NULL,
  "nationalId" TEXT,
  "labourCardNumber" TEXT,
  "iban" TEXT NOT NULL,
  "bankSwift" TEXT,
  "currency" TEXT NOT NULL,
  "fixedPay" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "variablePay" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "deductions" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "netPay" DECIMAL(14,2) NOT NULL,
  "daysWorked" INTEGER,
  "rowStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "rejectionCode" TEXT,
  "rejectionReason" TEXT,
  "paidAt" TIMESTAMP(3),
  CONSTRAINT "aura_wps_employee_row_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_wps_employee_row_submissionId_idx" ON "aura_wps_employee_row"("submissionId");
CREATE INDEX "aura_wps_employee_row_employeeId_idx" ON "aura_wps_employee_row"("employeeId");
CREATE INDEX "aura_wps_employee_row_rowStatus_idx" ON "aura_wps_employee_row"("rowStatus");
ALTER TABLE "aura_wps_employee_row"
  ADD CONSTRAINT "aura_wps_employee_row_submissionId_fkey"
  FOREIGN KEY ("submissionId") REFERENCES "aura_wps_period_submission"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "aura_wps_exception" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "submissionId" TEXT,
  "employeeId" TEXT,
  "code" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "ownerRole" TEXT NOT NULL,
  "dueDate" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "resolvedAt" TIMESTAMP(3),
  "resolvedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_wps_exception_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_wps_exception_tenantId_idx" ON "aura_wps_exception"("tenantId");
CREATE INDEX "aura_wps_exception_status_idx" ON "aura_wps_exception"("status");

CREATE TABLE "aura_salary_delay_flag" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "submissionId" TEXT,
  "employeeId" TEXT NOT NULL,
  "countryCode" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "creditedAt" TIMESTAMP(3),
  "daysLate" INTEGER NOT NULL,
  "severity" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "raisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3),
  CONSTRAINT "aura_salary_delay_flag_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_salary_delay_flag_unique"
  ON "aura_salary_delay_flag"("tenantId", "employeeId", "period");
CREATE INDEX "aura_salary_delay_flag_tenantId_idx" ON "aura_salary_delay_flag"("tenantId");
CREATE INDEX "aura_salary_delay_flag_severity_idx" ON "aura_salary_delay_flag"("severity");
CREATE INDEX "aura_salary_delay_flag_status_idx" ON "aura_salary_delay_flag"("status");

CREATE TABLE "aura_wps_penalty" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "countryCode" TEXT NOT NULL,
  "establishmentId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "amount" DECIMAL(14,2),
  "currency" TEXT,
  "description" TEXT NOT NULL,
  "businessImpact" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "raisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3),
  CONSTRAINT "aura_wps_penalty_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_wps_penalty_tenantId_idx" ON "aura_wps_penalty"("tenantId");
CREATE INDEX "aura_wps_penalty_status_idx" ON "aura_wps_penalty"("status");

CREATE TABLE "aura_wps_document" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "content" TEXT,
  "url" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_wps_document_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_wps_document_unique"
  ON "aura_wps_document"("tenantId", "code", "version");

CREATE TABLE "aura_wps_monthly_certificate" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "submissionsCount" INTEGER NOT NULL DEFAULT 0,
  "delayFlagsCount" INTEGER NOT NULL DEFAULT 0,
  "openExceptionsCount" INTEGER NOT NULL DEFAULT 0,
  "openPenaltiesCount" INTEGER NOT NULL DEFAULT 0,
  "gatingReason" TEXT,
  "attestationsJson" JSONB NOT NULL DEFAULT '[]',
  "generatedAt" TIMESTAMP(3),
  "signedAt" TIMESTAMP(3),
  "signedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_wps_monthly_certificate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_wps_monthly_certificate_unique"
  ON "aura_wps_monthly_certificate"("tenantId", "period");
