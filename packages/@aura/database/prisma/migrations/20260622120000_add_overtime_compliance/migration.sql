-- ============================================================================
-- EPIC-12 (Overtime Compliance — eligibility, types, approval, attendance,
-- calculation, country-specific controls, Ramadan, holiday work, comp-off,
-- budget control, fatigue/HSE, fraud, payroll integration, certificate)
-- ============================================================================

CREATE TABLE "aura_ot_policy" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "grade" TEXT,
  "isEligible" BOOLEAN NOT NULL DEFAULT true,
  "standardDailyHours" DECIMAL(5,2) NOT NULL DEFAULT 8,
  "standardWeeklyHours" DECIMAL(5,2) NOT NULL DEFAULT 48,
  "maxDailyOtHours" DECIMAL(5,2) NOT NULL DEFAULT 2,
  "maxMonthlyOtHours" DECIMAL(6,2) NOT NULL DEFAULT 40,
  "requiresPreApproval" BOOLEAN NOT NULL DEFAULT true,
  "allowsCompOff" BOOLEAN NOT NULL DEFAULT true,
  "ramadanDailyHours" DECIMAL(5,2) NOT NULL DEFAULT 6,
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveTo" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_ot_policy_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_ot_policy_unique"
  ON "aura_ot_policy"("tenantId", "country", "grade", "effectiveFrom");

CREATE TABLE "aura_ot_rate_card" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "otType" TEXT NOT NULL,
  "multiplier" DECIMAL(5,2) NOT NULL,
  "basis" TEXT NOT NULL DEFAULT 'BASIC',
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveTo" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_ot_rate_card_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_ot_rate_card_unique"
  ON "aura_ot_rate_card"("tenantId", "country", "otType", "effectiveFrom");

CREATE TABLE "aura_ot_request" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "requestDate" TIMESTAMP(3) NOT NULL,
  "plannedHours" DECIMAL(5,2) NOT NULL,
  "otType" TEXT NOT NULL,
  "reason" TEXT,
  "costCenterId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "approverId" TEXT,
  "approvedAt" TIMESTAMP(3),
  "rejectionReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_ot_request_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_ot_request_employee_date"
  ON "aura_ot_request"("tenantId", "employeeId", "requestDate");

CREATE TABLE "aura_ot_actual" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "otDate" TIMESTAMP(3) NOT NULL,
  "otType" TEXT NOT NULL,
  "actualHours" DECIMAL(5,2) NOT NULL,
  "multiplier" DECIMAL(5,2),
  "hourlyRate" DECIMAL(12,4),
  "computedAmount" DECIMAL(12,2),
  "currency" TEXT NOT NULL DEFAULT 'AED',
  "requestId" TEXT,
  "fraudScore" INTEGER NOT NULL DEFAULT 0,
  "fraudFlags" JSONB NOT NULL DEFAULT '[]',
  "compOffHoursGranted" DECIMAL(5,2) NOT NULL DEFAULT 0,
  "payrollPosted" BOOLEAN NOT NULL DEFAULT false,
  "payrollPostedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_ot_actual_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_ot_actual_unique"
  ON "aura_ot_actual"("tenantId", "employeeId", "otDate", "otType");

CREATE TABLE "aura_ot_budget" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "costCenterId" TEXT,
  "country" TEXT,
  "budgetHours" DECIMAL(8,2) NOT NULL,
  "budgetAmount" DECIMAL(14,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'AED',
  "actualHours" DECIMAL(8,2) NOT NULL DEFAULT 0,
  "actualAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_ot_budget_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_ot_budget_unique"
  ON "aura_ot_budget"("tenantId", "period", "costCenterId");

CREATE TABLE "aura_ot_certificate" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "totalHours" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "totalAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'AED',
  "exceedsCount" INTEGER NOT NULL DEFAULT 0,
  "fraudCount" INTEGER NOT NULL DEFAULT 0,
  "budgetBreachCount" INTEGER NOT NULL DEFAULT 0,
  "gatingReason" TEXT,
  "attestationsJson" JSONB NOT NULL DEFAULT '[]',
  "generatedAt" TIMESTAMP(3),
  "signedAt" TIMESTAMP(3),
  "signedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_ot_certificate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_ot_certificate_unique"
  ON "aura_ot_certificate"("tenantId", "period");
