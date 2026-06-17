-- ============================================================================
-- Theme B — Nationalisation overlays (EPIC-16 S06/S07/S08/S12/S13,
-- EPIC-17 S09/S11/S12/S13, EPIC-18 S07/S08/S14/S15).
--
-- Shared cross-program registry used by emiratisation-, nitaqat- and
-- bahrainization-compliance services:
--   * requisition-tag      — TA pipeline overlay (req-level national-flag)
--   * job-tag              — position / job-profile eligible-role tagging
--   * retention-event      — early-attrition / retention KPI ledger
--   * development-plan     — national L&D plan tracking
--   * artificial-risk      — fake/artificial detection signals (GPSSA × payroll × WPS)
--   * saudi-profession     — Saudi profession-localisation code table (S09 specific)
-- ============================================================================

CREATE TABLE "aura_nationalisation_requisition_tag" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "requisitionId" TEXT NOT NULL,
  "program" TEXT NOT NULL,
  "eligibility" TEXT NOT NULL DEFAULT 'PREFERRED',
  "isReservedSeat" BOOLEAN NOT NULL DEFAULT false,
  "targetShareNationals" INTEGER,
  "sourceChannel" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_nationalisation_requisition_tag_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_nationalisation_requisition_tag_unique"
  ON "aura_nationalisation_requisition_tag"("tenantId", "requisitionId", "program");
CREATE INDEX "aura_nationalisation_requisition_tag_program"
  ON "aura_nationalisation_requisition_tag"("tenantId", "program", "eligibility");

CREATE TABLE "aura_nationalisation_job_tag" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "program" TEXT NOT NULL,
  "eligibility" TEXT NOT NULL DEFAULT 'PREFERRED',
  "reservedSeats" INTEGER NOT NULL DEFAULT 0,
  "professionCode" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_nationalisation_job_tag_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_nationalisation_job_tag_unique"
  ON "aura_nationalisation_job_tag"("tenantId", "targetType", "targetId", "program");
CREATE INDEX "aura_nationalisation_job_tag_program"
  ON "aura_nationalisation_job_tag"("tenantId", "program", "eligibility");

CREATE TABLE "aura_nationalisation_retention_event" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "program" TEXT NOT NULL,
  "nationalityFlag" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "eventDate" TIMESTAMP(3) NOT NULL,
  "hireDate" TIMESTAMP(3),
  "daysFromHire" INTEGER,
  "earlyAttritionThresholdDays" INTEGER DEFAULT 365,
  "isEarlyAttrition" BOOLEAN NOT NULL DEFAULT false,
  "reasonCode" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_nationalisation_retention_event_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_nationalisation_retention_event_program"
  ON "aura_nationalisation_retention_event"("tenantId", "program", "eventType");
CREATE INDEX "aura_nationalisation_retention_event_employee"
  ON "aura_nationalisation_retention_event"("tenantId", "employeeId");
CREATE INDEX "aura_nationalisation_retention_event_early"
  ON "aura_nationalisation_retention_event"("tenantId", "program", "isEarlyAttrition");

CREATE TABLE "aura_nationalisation_development_plan" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "program" TEXT NOT NULL,
  "planCode" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PLANNED',
  "targetCompetenciesJson" JSONB,
  "milestonesJson" JSONB,
  "startDate" TIMESTAMP(3),
  "targetEndDate" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "completionPct" INTEGER NOT NULL DEFAULT 0,
  "ownerRole" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_nationalisation_development_plan_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_nationalisation_development_plan_unique"
  ON "aura_nationalisation_development_plan"("tenantId", "employeeId", "program", "planCode");
CREATE INDEX "aura_nationalisation_development_plan_status"
  ON "aura_nationalisation_development_plan"("tenantId", "program", "status");

CREATE TABLE "aura_nationalisation_artificial_risk_flag" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "program" TEXT NOT NULL,
  "evidenceMonth" TEXT NOT NULL,
  "signalsJson" JSONB NOT NULL,
  "signalCount" INTEGER NOT NULL DEFAULT 0,
  "riskBand" TEXT NOT NULL DEFAULT 'LOW',
  "isResolved" BOOLEAN NOT NULL DEFAULT false,
  "resolvedBy" TEXT,
  "resolvedAt" TIMESTAMP(3),
  "resolutionReason" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_nationalisation_artificial_risk_flag_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_nationalisation_artificial_risk_flag_unique"
  ON "aura_nationalisation_artificial_risk_flag"("tenantId", "employeeId", "program", "evidenceMonth");
CREATE INDEX "aura_nationalisation_artificial_risk_flag_band"
  ON "aura_nationalisation_artificial_risk_flag"("tenantId", "program", "riskBand", "isResolved");

CREATE TABLE "aura_saudi_profession_localization" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "isicCode" TEXT,
  "professionCode" TEXT NOT NULL,
  "professionNameEn" TEXT NOT NULL,
  "professionNameAr" TEXT,
  "reservedForSaudis" BOOLEAN NOT NULL DEFAULT false,
  "minimumNationalisationPct" INTEGER,
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveTo" TIMESTAMP(3),
  "regulatorRef" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_saudi_profession_localization_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_saudi_profession_localization_unique"
  ON "aura_saudi_profession_localization"("tenantId", "professionCode", "effectiveFrom");
CREATE INDEX "aura_saudi_profession_localization_reserved"
  ON "aura_saudi_profession_localization"("tenantId", "reservedForSaudis");
