-- ============================================================================
-- Themes G + H — HSE sub-domains + visa-exit deep gaps.
--
-- G (HSE sub-domains): HseSafetyOfficer, HseHeatStressRule, HseToolboxTalk,
--   HseEmergencyDrill, HseFirstAidStation, HseWelfareInspection. Closes
--   EPIC-24-S02 / S04 / S07 / S11 / S12 / S14.
--
-- H (visa-exit deep gaps): VisaExitDependent (per-dependent register
--   for cascade), VisaExitBenefitsClosure (insurance/accommodation/EOS
--   cascade tracker), VisaExitCommTemplate (employee comms templates).
--   The TRANSFER scenario PRO action set is seeded via service code,
--   no new table needed.
-- ============================================================================

CREATE TABLE "aura_hse_safety_officer" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "siteId" TEXT,
  "employeeId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'SAFETY_OFFICER',
  "certificationCode" TEXT,
  "certificationIssuedAt" TIMESTAMP(3),
  "certificationExpiresAt" TIMESTAMP(3),
  "scope" TEXT NOT NULL DEFAULT 'SITE',
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_hse_safety_officer_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_hse_safety_officer_unique"
  ON "aura_hse_safety_officer"("tenantId", "employeeId", "scope");
CREATE INDEX "aura_hse_safety_officer_site"
  ON "aura_hse_safety_officer"("tenantId", "siteId", "status");

CREATE TABLE "aura_hse_heat_stress_rule" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "month" INTEGER NOT NULL,
  "noOutdoorWorkFromHour" INTEGER NOT NULL,
  "noOutdoorWorkToHour" INTEGER NOT NULL,
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveTo" TIMESTAMP(3),
  "regulatorRef" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_hse_heat_stress_rule_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_hse_heat_stress_rule_unique"
  ON "aura_hse_heat_stress_rule"("tenantId", "country", "month", "effectiveFrom");

CREATE TABLE "aura_hse_toolbox_talk" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "siteId" TEXT,
  "talkCode" TEXT NOT NULL,
  "topic" TEXT NOT NULL,
  "deliveredAt" TIMESTAMP(3) NOT NULL,
  "deliveredBy" TEXT,
  "attendeeCount" INTEGER NOT NULL DEFAULT 0,
  "attendeesJson" JSONB,
  "summary" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_hse_toolbox_talk_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_hse_toolbox_talk_site"
  ON "aura_hse_toolbox_talk"("tenantId", "siteId", "deliveredAt");

CREATE TABLE "aura_hse_emergency_drill" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "drillCode" TEXT NOT NULL,
  "drillType" TEXT NOT NULL,
  "scheduledAt" TIMESTAMP(3) NOT NULL,
  "conductedAt" TIMESTAMP(3),
  "evacuationTimeSeconds" INTEGER,
  "participantCount" INTEGER NOT NULL DEFAULT 0,
  "findingsJson" JSONB,
  "result" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_hse_emergency_drill_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_hse_emergency_drill_unique"
  ON "aura_hse_emergency_drill"("tenantId", "siteId", "drillCode");

CREATE TABLE "aura_hse_first_aid_station" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "stationCode" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "certifiedFirstAiderCount" INTEGER NOT NULL DEFAULT 0,
  "lastRestockedAt" TIMESTAMP(3),
  "lastInspectionAt" TIMESTAMP(3),
  "lastInspectionResult" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_hse_first_aid_station_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_hse_first_aid_station_unique"
  ON "aura_hse_first_aid_station"("tenantId", "siteId", "stationCode");

CREATE TABLE "aura_hse_welfare_inspection" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "inspectionCode" TEXT NOT NULL,
  "scope" TEXT NOT NULL,
  "inspectedAt" TIMESTAMP(3) NOT NULL,
  "inspectedBy" TEXT,
  "findingsJson" JSONB,
  "criticalFindings" INTEGER NOT NULL DEFAULT 0,
  "result" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_hse_welfare_inspection_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_hse_welfare_inspection_unique"
  ON "aura_hse_welfare_inspection"("tenantId", "siteId", "inspectionCode");

CREATE TABLE "aura_visa_exit_dependent" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "visaExitCaseId" TEXT NOT NULL,
  "dependentName" TEXT NOT NULL,
  "relationship" TEXT NOT NULL,
  "visaNumber" TEXT,
  "cancellationStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "cancelledAt" TIMESTAMP(3),
  "evidenceUrl" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_visa_exit_dependent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_visa_exit_dependent_case"
  ON "aura_visa_exit_dependent"("tenantId", "visaExitCaseId");

CREATE TABLE "aura_visa_exit_benefits_closure" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "visaExitCaseId" TEXT NOT NULL,
  "benefitCategory" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "closedAt" TIMESTAMP(3),
  "closedBy" TEXT,
  "amountSettled" DECIMAL(18,2),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_visa_exit_benefits_closure_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_visa_exit_benefits_closure_unique"
  ON "aura_visa_exit_benefits_closure"("tenantId", "visaExitCaseId", "benefitCategory");

CREATE TABLE "aura_visa_exit_comm_template" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "templateCode" TEXT NOT NULL,
  "trigger" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "channelsJson" JSONB,
  "subjectEn" TEXT,
  "subjectAr" TEXT,
  "bodyEn" TEXT,
  "bodyAr" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_visa_exit_comm_template_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_visa_exit_comm_template_unique"
  ON "aura_visa_exit_comm_template"("tenantId", "templateCode");
