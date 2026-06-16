-- ============================================================================
-- EPIC-13 (GOSI Compliance, KSA Social Insurance)
-- ============================================================================

CREATE TABLE "aura_gosi_establishment" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "legalEntityId" TEXT,
  "gosiNumber" TEXT NOT NULL,
  "establishmentName" TEXT NOT NULL,
  "isInScope" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_gosi_establishment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_gosi_establishment_unique"
  ON "aura_gosi_establishment"("tenantId", "gosiNumber");

CREATE TABLE "aura_gosi_branch_config" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "branch" TEXT NOT NULL,
  "appliesTo" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_gosi_branch_config_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_gosi_branch_config_unique"
  ON "aura_gosi_branch_config"("tenantId", "branch");

CREATE TABLE "aura_gosi_contribution_rate" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "branch" TEXT NOT NULL,
  "nationalityClass" TEXT NOT NULL,
  "employerPct" DECIMAL(7,4) NOT NULL,
  "employeePct" DECIMAL(7,4) NOT NULL,
  "wageFloor" DECIMAL(14,2),
  "wageCeiling" DECIMAL(14,2),
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveTo" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "citation" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdBy" TEXT,
  CONSTRAINT "aura_gosi_contribution_rate_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_gosi_contribution_rate_lookup_idx"
  ON "aura_gosi_contribution_rate"("tenantId", "branch", "nationalityClass", "effectiveFrom");
CREATE INDEX "aura_gosi_contribution_rate_status_idx" ON "aura_gosi_contribution_rate"("status");

CREATE TABLE "aura_gosi_employee_registration" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "establishmentId" TEXT NOT NULL,
  "nationalityClass" TEXT NOT NULL,
  "gosiPersonalNumber" TEXT,
  "registrationDate" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "deregistrationDate" TIMESTAMP(3),
  "deregistrationReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_gosi_employee_registration_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_gosi_employee_registration_unique"
  ON "aura_gosi_employee_registration"("tenantId", "employeeId");
CREATE INDEX "aura_gosi_employee_registration_status_idx" ON "aura_gosi_employee_registration"("status");

CREATE TABLE "aura_gosi_contribution_wage" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "basicWage" DECIMAL(14,2) NOT NULL,
  "housingAllowance" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "otherAllowances" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "contributionWage" DECIMAL(14,2) NOT NULL,
  "salaryStructureRef" TEXT,
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "salaryChangeId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_gosi_contribution_wage_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_gosi_contribution_wage_unique"
  ON "aura_gosi_contribution_wage"("tenantId", "employeeId", "period");
CREATE INDEX "aura_gosi_contribution_wage_period_idx" ON "aura_gosi_contribution_wage"("period");

CREATE TABLE "aura_gosi_contribution" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "establishmentId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "nationalityClass" TEXT NOT NULL,
  "contributionWage" DECIMAL(14,2) NOT NULL,
  "annuitiesEmployer" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "annuitiesEmployee" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "ohEmployer" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "totalEmployer" DECIMAL(14,2) NOT NULL,
  "totalEmployee" DECIMAL(14,2) NOT NULL,
  "rateRefs" JSONB NOT NULL DEFAULT '{}',
  "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_gosi_contribution_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_gosi_contribution_unique"
  ON "aura_gosi_contribution"("tenantId", "employeeId", "period");
CREATE INDEX "aura_gosi_contribution_period_idx" ON "aura_gosi_contribution"("period");

CREATE TABLE "aura_gosi_period_submission" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "establishmentId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "totalEmployees" INTEGER NOT NULL DEFAULT 0,
  "totalEmployerAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "totalEmployeeAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "filePath" TEXT,
  "fileHash" TEXT,
  "dueDate" TIMESTAMP(3),
  "submittedAt" TIMESTAMP(3),
  "acknowledgedAt" TIMESTAMP(3),
  "ackReference" TEXT,
  "errors" JSONB NOT NULL DEFAULT '[]',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_gosi_period_submission_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_gosi_period_submission_unique"
  ON "aura_gosi_period_submission"("tenantId", "establishmentId", "period");

CREATE TABLE "aura_gosi_variance" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT,
  "establishmentId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "expected" DECIMAL(14,2),
  "actual" DECIMAL(14,2),
  "difference" DECIMAL(14,2),
  "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
  "ownerRole" TEXT NOT NULL DEFAULT 'PAYROLL_OFFICER',
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_gosi_variance_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_gosi_variance_tenantId_idx" ON "aura_gosi_variance"("tenantId");
CREATE INDEX "aura_gosi_variance_period_idx" ON "aura_gosi_variance"("period");
CREATE INDEX "aura_gosi_variance_status_idx" ON "aura_gosi_variance"("status");

CREATE TABLE "aura_gosi_certificate" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "submissionsCount" INTEGER NOT NULL DEFAULT 0,
  "openVariancesCount" INTEGER NOT NULL DEFAULT 0,
  "criticalVariancesCount" INTEGER NOT NULL DEFAULT 0,
  "lateSubmissionsCount" INTEGER NOT NULL DEFAULT 0,
  "gatingReason" TEXT,
  "attestationsJson" JSONB NOT NULL DEFAULT '[]',
  "generatedAt" TIMESTAMP(3),
  "signedAt" TIMESTAMP(3),
  "signedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_gosi_certificate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_gosi_certificate_unique"
  ON "aura_gosi_certificate"("tenantId", "period");

CREATE TABLE "aura_gosi_event" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "period" TEXT,
  "payload" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_gosi_event_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_gosi_event_tenantId_idx" ON "aura_gosi_event"("tenantId");
CREATE INDEX "aura_gosi_event_employeeId_idx" ON "aura_gosi_event"("employeeId");
CREATE INDEX "aura_gosi_event_eventType_idx" ON "aura_gosi_event"("eventType");
