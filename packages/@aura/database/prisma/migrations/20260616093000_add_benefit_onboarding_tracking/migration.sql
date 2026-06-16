ALTER TABLE "aura_benefit_enrollment"
  ADD COLUMN "onboardingInstanceId" TEXT,
  ADD COLUMN "vendorReference" TEXT,
  ADD COLUMN "vendorEnrollmentFile" JSONB,
  ADD COLUMN "insuranceCardStatus" TEXT NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "insuranceCardIssuedAt" TIMESTAMP(3);

CREATE INDEX "aura_benefit_enrollment_insuranceCardStatus_idx" ON "aura_benefit_enrollment"("insuranceCardStatus");
CREATE INDEX "aura_benefit_enrollment_onboardingInstanceId_idx" ON "aura_benefit_enrollment"("onboardingInstanceId");
