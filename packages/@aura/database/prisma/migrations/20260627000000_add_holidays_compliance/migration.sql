-- ============================================================================
-- EPIC-21 (Public Holidays & Religious Holidays Compliance — overlay on
-- existing Holiday + HolidayCalendar)
-- ============================================================================

CREATE TABLE "aura_holiday_pay_rule" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "holidayClass" TEXT NOT NULL,
  "baseMultiplier" DECIMAL(5,2) NOT NULL DEFAULT 1,
  "otMultiplier" DECIMAL(5,2) NOT NULL DEFAULT 2,
  "compOffDaysAccrued" DECIMAL(5,2) NOT NULL DEFAULT 1,
  "isPaid" BOOLEAN NOT NULL DEFAULT true,
  "ramadanReducedHours" DECIMAL(5,2),
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveTo" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_holiday_pay_rule_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_holiday_pay_rule_unique"
  ON "aura_holiday_pay_rule"("tenantId", "country", "holidayClass", "effectiveFrom");

CREATE TABLE "aura_holiday_work_approval" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "holidayDate" TIMESTAMP(3) NOT NULL,
  "holidayLabel" TEXT,
  "holidayClass" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "plannedHours" DECIMAL(5,2) NOT NULL,
  "reason" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "requestedBy" TEXT,
  "approverId" TEXT,
  "approvedAt" TIMESTAMP(3),
  "rejectionReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_holiday_work_approval_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_holiday_work_approval_employee"
  ON "aura_holiday_work_approval"("tenantId", "employeeId");

CREATE TABLE "aura_holiday_comp_off" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "workApprovalId" TEXT,
  "earnedDate" TIMESTAMP(3) NOT NULL,
  "daysAccrued" DECIMAL(5,2) NOT NULL,
  "daysConsumed" DECIMAL(5,2) NOT NULL DEFAULT 0,
  "expiresAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_holiday_comp_off_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_holiday_comp_off_employee"
  ON "aura_holiday_comp_off"("tenantId", "employeeId");

CREATE TABLE "aura_holiday_certificate" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "publishedHolidaysCount" INTEGER NOT NULL DEFAULT 0,
  "provisionalCount" INTEGER NOT NULL DEFAULT 0,
  "workApprovalsTotal" INTEGER NOT NULL DEFAULT 0,
  "workApprovalsPending" INTEGER NOT NULL DEFAULT 0,
  "compOffAvailableDays" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "compOffExpiringSoon" INTEGER NOT NULL DEFAULT 0,
  "unapprovedHolidayWorkCount" INTEGER NOT NULL DEFAULT 0,
  "gatingReason" TEXT,
  "attestationsJson" JSONB NOT NULL DEFAULT '[]',
  "generatedAt" TIMESTAMP(3),
  "signedAt" TIMESTAMP(3),
  "signedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_holiday_certificate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_holiday_certificate_unique"
  ON "aura_holiday_certificate"("tenantId", "period");
