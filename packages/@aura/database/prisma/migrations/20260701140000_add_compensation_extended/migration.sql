-- Compensation Module extended models (AURA-019..026).
-- Defensive CREATE TABLE IF NOT EXISTS (repo uses db-push; enums stored as TEXT).

CREATE TABLE IF NOT EXISTS "aura_increment_proposal" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "cycleId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "currentSalary" DECIMAL(18,2) NOT NULL,
  "proposedSalary" DECIMAL(18,2) NOT NULL,
  "incrementAmount" DECIMAL(18,2) NOT NULL,
  "incrementPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "incrementType" TEXT NOT NULL DEFAULT 'merit',
  "effectiveDate" TIMESTAMP(3),
  "performanceRating" TEXT,
  "justification" TEXT,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "submittedBy" TEXT,
  "submittedDate" TIMESTAMP(3),
  "approvedBy" TEXT,
  "approvedDate" TIMESTAMP(3),
  "rejectionReason" TEXT,
  "processedDate" TIMESTAMP(3),
  "notes" TEXT,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_increment_proposal_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IncrementProposal_tenantId_idx" ON "aura_increment_proposal"("tenantId");
CREATE INDEX IF NOT EXISTS "IncrementProposal_cycleId_idx" ON "aura_increment_proposal"("cycleId");
CREATE INDEX IF NOT EXISTS "IncrementProposal_employeeId_idx" ON "aura_increment_proposal"("employeeId");
CREATE INDEX IF NOT EXISTS "IncrementProposal_status_idx" ON "aura_increment_proposal"("status");

CREATE TABLE IF NOT EXISTS "aura_bonus_scheme" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "schemeCode" TEXT NOT NULL,
  "schemeName" TEXT NOT NULL,
  "bonusType" TEXT NOT NULL DEFAULT 'performance',
  "description" TEXT,
  "fiscalYear" TEXT,
  "eligibilityCriteria" JSONB,
  "payoutCriteria" JSONB,
  "budgetAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "payoutDate" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'draft',
  "isRecurring" BOOLEAN NOT NULL DEFAULT false,
  "frequency" TEXT,
  "applicableGrades" JSONB,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_bonus_scheme_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "BonusScheme_tenantId_idx" ON "aura_bonus_scheme"("tenantId");
CREATE INDEX IF NOT EXISTS "BonusScheme_status_idx" ON "aura_bonus_scheme"("status");

CREATE TABLE IF NOT EXISTS "aura_stock_grant" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "grantCode" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "stockType" TEXT NOT NULL DEFAULT 'RSU',
  "grantDate" TIMESTAMP(3) NOT NULL,
  "numberOfUnits" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "grantPrice" DECIMAL(18,4) NOT NULL DEFAULT 0,
  "fairMarketValue" DECIMAL(18,4) NOT NULL DEFAULT 0,
  "totalValue" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "vestingSchedule" TEXT NOT NULL DEFAULT 'graded',
  "vestingStartDate" TIMESTAMP(3),
  "vestingEndDate" TIMESTAMP(3),
  "vestingPeriodYears" DOUBLE PRECISION NOT NULL DEFAULT 4,
  "cliffPeriodMonths" INTEGER,
  "vestingScheduleDetails" JSONB,
  "exercisePrice" DECIMAL(18,4),
  "expirationDate" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'granted',
  "vestedUnits" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "unvestedUnits" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "exercisedUnits" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "forfeitedUnits" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "reason" TEXT,
  "grantedBy" TEXT,
  "approvedBy" TEXT,
  "notes" TEXT,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_stock_grant_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "StockGrant_tenantId_idx" ON "aura_stock_grant"("tenantId");
CREATE INDEX IF NOT EXISTS "StockGrant_employeeId_idx" ON "aura_stock_grant"("employeeId");
CREATE INDEX IF NOT EXISTS "StockGrant_status_idx" ON "aura_stock_grant"("status");

CREATE TABLE IF NOT EXISTS "aura_loan_scheme" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "schemeCode" TEXT NOT NULL,
  "schemeName" TEXT NOT NULL,
  "loanType" TEXT NOT NULL DEFAULT 'personal',
  "description" TEXT,
  "maxAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "minAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "maxTenureMonths" INTEGER NOT NULL DEFAULT 12,
  "minTenureMonths" INTEGER NOT NULL DEFAULT 1,
  "interestRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "isInterestBearing" BOOLEAN NOT NULL DEFAULT false,
  "eligibilityCriteria" JSONB,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_loan_scheme_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "LoanScheme_tenantId_idx" ON "aura_loan_scheme"("tenantId");
CREATE INDEX IF NOT EXISTS "LoanScheme_isActive_idx" ON "aura_loan_scheme"("isActive");

CREATE TABLE IF NOT EXISTS "aura_employee_loan" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "loanCode" TEXT NOT NULL,
  "schemeId" TEXT,
  "employeeId" TEXT NOT NULL,
  "loanType" TEXT NOT NULL DEFAULT 'personal',
  "applicationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "principalAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "interestRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "tenureMonths" INTEGER NOT NULL DEFAULT 12,
  "emiAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "totalRepayable" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "disbursementDate" TIMESTAMP(3),
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "purpose" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "outstandingPrincipal" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "outstandingInterest" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "totalOutstanding" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "principalPaid" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "interestPaid" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "totalPaid" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "emiSchedule" JSONB,
  "guarantorId" TEXT,
  "collateralDetails" TEXT,
  "submittedBy" TEXT,
  "submittedDate" TIMESTAMP(3),
  "approvedBy" TEXT,
  "approvedDate" TIMESTAMP(3),
  "rejectedBy" TEXT,
  "rejectionReason" TEXT,
  "closedDate" TIMESTAMP(3),
  "notes" TEXT,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_employee_loan_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "EmployeeLoan_tenantId_idx" ON "aura_employee_loan"("tenantId");
CREATE INDEX IF NOT EXISTS "EmployeeLoan_employeeId_idx" ON "aura_employee_loan"("employeeId");
CREATE INDEX IF NOT EXISTS "EmployeeLoan_status_idx" ON "aura_employee_loan"("status");

CREATE TABLE IF NOT EXISTS "aura_arrears_request" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "requestCode" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "arrearsType" TEXT NOT NULL DEFAULT 'salary_revision',
  "reason" TEXT,
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveTo" TIMESTAMP(3) NOT NULL,
  "oldSalary" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "newSalary" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "difference" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "numberOfMonths" INTEGER NOT NULL DEFAULT 0,
  "totalArrears" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "paymentMode" TEXT NOT NULL DEFAULT 'lumpsum',
  "numberOfInstallments" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "submittedBy" TEXT,
  "submittedDate" TIMESTAMP(3),
  "approvedBy" TEXT,
  "approvedDate" TIMESTAMP(3),
  "rejectedBy" TEXT,
  "rejectionReason" TEXT,
  "processedDate" TIMESTAMP(3),
  "paymentSchedule" JSONB,
  "notes" TEXT,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_arrears_request_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ArrearsRequest_tenantId_idx" ON "aura_arrears_request"("tenantId");
CREATE INDEX IF NOT EXISTS "ArrearsRequest_employeeId_idx" ON "aura_arrears_request"("employeeId");
CREATE INDEX IF NOT EXISTS "ArrearsRequest_status_idx" ON "aura_arrears_request"("status");

CREATE TABLE IF NOT EXISTS "aura_total_rewards_statement" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "fiscalYear" TEXT NOT NULL,
  "generatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "directCompensation" JSONB,
  "benefits" JSONB,
  "stockCompensation" JSONB,
  "otherCompensation" JSONB,
  "totalRewards" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_total_rewards_statement_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "TotalRewardsStatement_tenantId_idx" ON "aura_total_rewards_statement"("tenantId");
CREATE INDEX IF NOT EXISTS "TotalRewardsStatement_employeeId_idx" ON "aura_total_rewards_statement"("employeeId");

CREATE TABLE IF NOT EXISTS "aura_market_benchmark" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "benchmarkCode" TEXT NOT NULL,
  "jobTitle" TEXT NOT NULL,
  "jobFamily" TEXT,
  "jobLevel" TEXT,
  "geography" TEXT,
  "industry" TEXT,
  "source" TEXT NOT NULL DEFAULT 'market_survey',
  "sourceName" TEXT,
  "surveyDate" TIMESTAMP(3),
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "sampleSize" INTEGER NOT NULL DEFAULT 0,
  "percentile10" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "percentile25" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "percentile50" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "percentile75" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "percentile90" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "average" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "standardDeviation" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "effectiveFrom" TIMESTAMP(3),
  "effectiveTo" TIMESTAMP(3),
  "notes" TEXT,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_market_benchmark_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "MarketBenchmark_tenantId_idx" ON "aura_market_benchmark"("tenantId");
CREATE INDEX IF NOT EXISTS "MarketBenchmark_jobTitle_idx" ON "aura_market_benchmark"("jobTitle");

CREATE TABLE IF NOT EXISTS "aura_budget_simulation" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "simulationCode" TEXT NOT NULL,
  "simulationName" TEXT NOT NULL,
  "description" TEXT,
  "fiscalYear" TEXT,
  "scenarios" JSONB,
  "comparison" JSONB,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_budget_simulation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "BudgetSimulation_tenantId_idx" ON "aura_budget_simulation"("tenantId");
