-- ============================================================================
-- EPIC-24 (Health, Safety & Welfare Compliance)
-- ============================================================================

CREATE TABLE "aura_hse_risk_assessment" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "location" TEXT,
  "category" TEXT NOT NULL,
  "hazardDescription" TEXT,
  "likelihood" INTEGER NOT NULL,
  "severity" INTEGER NOT NULL,
  "inherentRisk" INTEGER NOT NULL,
  "residualRisk" INTEGER NOT NULL,
  "controlsJson" JSONB NOT NULL DEFAULT '[]',
  "reviewedAt" TIMESTAMP(3),
  "reviewedBy" TEXT,
  "nextReviewAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_hse_risk_assessment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_hse_risk_assessment_tenant"
  ON "aura_hse_risk_assessment"("tenantId");

CREATE TABLE "aura_hse_incident" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "incidentNumber" TEXT NOT NULL,
  "incidentDate" TIMESTAMP(3) NOT NULL,
  "incidentType" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "location" TEXT,
  "employeeId" TEXT,
  "contractorId" TEXT,
  "description" TEXT,
  "rootCause" TEXT,
  "correctiveActions" JSONB NOT NULL DEFAULT '[]',
  "lostTimeDays" INTEGER NOT NULL DEFAULT 0,
  "gosiNotified" BOOLEAN NOT NULL DEFAULT false,
  "authorityNotified" BOOLEAN NOT NULL DEFAULT false,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "closedAt" TIMESTAMP(3),
  "closedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_hse_incident_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_hse_incident_unique"
  ON "aura_hse_incident"("tenantId", "incidentNumber");

CREATE TABLE "aura_hse_permit_to_work" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "permitNumber" TEXT NOT NULL,
  "workType" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "startAt" TIMESTAMP(3) NOT NULL,
  "endAt" TIMESTAMP(3) NOT NULL,
  "issuerId" TEXT,
  "supervisorId" TEXT,
  "ppeChecklistJson" JSONB NOT NULL DEFAULT '[]',
  "isolationsJson" JSONB NOT NULL DEFAULT '[]',
  "ramsAttached" BOOLEAN NOT NULL DEFAULT false,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "closedAt" TIMESTAMP(3),
  "closedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_hse_permit_to_work_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_hse_permit_to_work_unique"
  ON "aura_hse_permit_to_work"("tenantId", "permitNumber");

CREATE TABLE "aura_hse_training_record" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "trainingCode" TEXT NOT NULL,
  "trainingType" TEXT NOT NULL,
  "completedAt" TIMESTAMP(3) NOT NULL,
  "validUntil" TIMESTAMP(3),
  "trainerName" TEXT,
  "certificateUrl" TEXT,
  "score" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_hse_training_record_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_hse_training_record_employee"
  ON "aura_hse_training_record"("tenantId", "employeeId");
CREATE INDEX "aura_hse_training_record_expiry"
  ON "aura_hse_training_record"("tenantId", "validUntil");

CREATE TABLE "aura_hse_certificate" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "openRiskAssessments" INTEGER NOT NULL DEFAULT 0,
  "highRiskCount" INTEGER NOT NULL DEFAULT 0,
  "incidentsOpen" INTEGER NOT NULL DEFAULT 0,
  "lostTimeIncidents" INTEGER NOT NULL DEFAULT 0,
  "fatalitiesCount" INTEGER NOT NULL DEFAULT 0,
  "permitsActive" INTEGER NOT NULL DEFAULT 0,
  "permitsOverdue" INTEGER NOT NULL DEFAULT 0,
  "trainingExpiringSoon" INTEGER NOT NULL DEFAULT 0,
  "trainingExpired" INTEGER NOT NULL DEFAULT 0,
  "ltifr" DECIMAL(8,2) NOT NULL DEFAULT 0,
  "gatingReason" TEXT,
  "attestationsJson" JSONB NOT NULL DEFAULT '[]',
  "generatedAt" TIMESTAMP(3),
  "signedAt" TIMESTAMP(3),
  "signedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_hse_certificate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_hse_certificate_unique"
  ON "aura_hse_certificate"("tenantId", "period");
