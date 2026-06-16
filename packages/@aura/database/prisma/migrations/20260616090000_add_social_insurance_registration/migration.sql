CREATE TABLE "aura_social_insurance_registration" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "onboardingInstanceId" TEXT,
    "countryCode" TEXT NOT NULL,
    "nationality" TEXT,
    "authority" TEXT NOT NULL,
    "scheme" TEXT NOT NULL,
    "contributionWage" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "registrationReference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "mandatory" BOOLEAN NOT NULL DEFAULT true,
    "deadlineAt" TIMESTAMP(3) NOT NULL,
    "registeredAt" TIMESTAMP(3),
    "ruleVersion" TEXT NOT NULL,
    "ruleSnapshot" JSONB,
    "notes" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aura_social_insurance_registration_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "aura_social_insurance_registration_tenantId_employeeId_authority_scheme_key"
    ON "aura_social_insurance_registration"("tenantId", "employeeId", "authority", "scheme");

CREATE INDEX "aura_social_insurance_registration_tenantId_employeeId_idx"
    ON "aura_social_insurance_registration"("tenantId", "employeeId");

CREATE INDEX "aura_social_insurance_registration_tenantId_status_idx"
    ON "aura_social_insurance_registration"("tenantId", "status");

CREATE INDEX "aura_social_insurance_registration_tenantId_deadlineAt_idx"
    ON "aura_social_insurance_registration"("tenantId", "deadlineAt");

CREATE INDEX "aura_social_insurance_registration_countryCode_authority_idx"
    ON "aura_social_insurance_registration"("countryCode", "authority");
