CREATE TABLE "aura_employee_payroll_profile" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "payrollConfigId" TEXT,
  "countryCode" TEXT NOT NULL,
  "onboardingInstanceId" TEXT,
  "salaryStructureId" TEXT,
  "salaryComponents" JSONB NOT NULL,
  "bankName" TEXT,
  "bankAccountNumber" TEXT,
  "bankIBAN" TEXT,
  "bankRoutingCode" TEXT,
  "wpsAgentCode" TEXT,
  "wpsEmployerCode" TEXT,
  "wpsPersonCode" TEXT,
  "labourCardNumber" TEXT,
  "costCenterCode" TEXT,
  "prorationBasis" TEXT NOT NULL DEFAULT 'CALENDAR_DAYS',
  "joiningDate" TIMESTAMP(3) NOT NULL,
  "firstPayrollMonth" TEXT NOT NULL,
  "firstPeriodStart" TIMESTAMP(3) NOT NULL,
  "firstPeriodEnd" TIMESTAMP(3) NOT NULL,
  "firstPeriodPaidDays" DECIMAL(8,2) NOT NULL,
  "firstPeriodCalendarDays" INTEGER NOT NULL,
  "firstPeriodProrationFactor" DECIMAL(8,6) NOT NULL,
  "firstPeriodGrossProrated" DECIMAL(12,2) NOT NULL,
  "firstPayDueAt" TIMESTAMP(3) NOT NULL,
  "readinessStatus" TEXT NOT NULL DEFAULT 'BLOCKED',
  "blockReasons" JSONB NOT NULL,
  "alertReasons" JSONB,
  "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP(3),
  "createdBy" TEXT NOT NULL,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "aura_employee_payroll_profile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "aura_employee_payroll_profile_tenantId_employeeId_key" ON "aura_employee_payroll_profile"("tenantId", "employeeId");
CREATE INDEX "aura_employee_payroll_profile_tenantId_idx" ON "aura_employee_payroll_profile"("tenantId");
CREATE INDEX "aura_employee_payroll_profile_employeeId_idx" ON "aura_employee_payroll_profile"("employeeId");
CREATE INDEX "aura_employee_payroll_profile_companyId_idx" ON "aura_employee_payroll_profile"("companyId");
CREATE INDEX "aura_employee_payroll_profile_countryCode_idx" ON "aura_employee_payroll_profile"("countryCode");
CREATE INDEX "aura_employee_payroll_profile_readinessStatus_idx" ON "aura_employee_payroll_profile"("readinessStatus");
CREATE INDEX "aura_employee_payroll_profile_firstPayrollMonth_idx" ON "aura_employee_payroll_profile"("firstPayrollMonth");
