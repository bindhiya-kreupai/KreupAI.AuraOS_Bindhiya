-- DEI (Diversity, Equity & Inclusion) module domain models (AURA-195..206, 327..329).
-- Defensive CREATE TABLE IF NOT EXISTS; repo uses db-push, enums stored as TEXT.
-- Diversity metrics and pay-equity are derived at query time from Employee data;
-- these tables hold the DEI-owned persisted entities.

CREATE TABLE IF NOT EXISTS "aura_dei_survey" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "titleAr" TEXT,
  "description" TEXT,
  "surveyType" TEXT NOT NULL DEFAULT 'pulse_check',
  "status" TEXT NOT NULL DEFAULT 'draft',
  "isAnonymous" BOOLEAN NOT NULL DEFAULT true,
  "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3),
  "targetCount" INTEGER NOT NULL DEFAULT 0,
  "responseCount" INTEGER NOT NULL DEFAULT 0,
  "sentimentScore" DECIMAL(4,2),
  "questions" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  CONSTRAINT "aura_dei_survey_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "DeiSurvey_tenantId_idx" ON "aura_dei_survey"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_dei_erg" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "nameAr" TEXT,
  "category" TEXT NOT NULL DEFAULT 'cultural',
  "description" TEXT,
  "colorClass" TEXT,
  "memberCount" INTEGER NOT NULL DEFAULT 0,
  "nextEvent" TEXT,
  "nextEventAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  CONSTRAINT "aura_dei_erg_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "DeiErg_tenantId_idx" ON "aura_dei_erg"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_dei_erg_membership" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "ergId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'member',
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_dei_erg_membership_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "DeiErgMembership_uq" ON "aura_dei_erg_membership"("tenantId", "ergId", "employeeId");
CREATE INDEX IF NOT EXISTS "DeiErgMembership_tenant_erg_idx" ON "aura_dei_erg_membership"("tenantId", "ergId");

CREATE TABLE IF NOT EXISTS "aura_dei_goal" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "titleAr" TEXT,
  "description" TEXT,
  "category" TEXT NOT NULL DEFAULT 'representation',
  "targetValue" DECIMAL(12,2) NOT NULL,
  "currentValue" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "unit" TEXT NOT NULL DEFAULT '%',
  "status" TEXT NOT NULL DEFAULT 'on_track',
  "startDate" TIMESTAMP(3),
  "targetDate" TIMESTAMP(3),
  "owner" TEXT,
  "keyResults" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  CONSTRAINT "aura_dei_goal_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "DeiGoal_tenantId_idx" ON "aura_dei_goal"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_dei_bias_training" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "titleAr" TEXT,
  "description" TEXT,
  "category" TEXT NOT NULL DEFAULT 'unconscious_bias',
  "durationMins" INTEGER NOT NULL DEFAULT 30,
  "isMandatory" BOOLEAN NOT NULL DEFAULT false,
  "thumbClass" TEXT,
  "status" TEXT NOT NULL DEFAULT 'published',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  CONSTRAINT "aura_dei_bias_training_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "DeiBiasTraining_tenantId_idx" ON "aura_dei_bias_training"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_dei_training_enrollment" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "trainingId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'not_started',
  "progress" INTEGER NOT NULL DEFAULT 0,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_dei_training_enrollment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "DeiTrainingEnrollment_uq" ON "aura_dei_training_enrollment"("tenantId", "trainingId", "employeeId");
CREATE INDEX IF NOT EXISTS "DeiTrainingEnrollment_tenant_emp_idx" ON "aura_dei_training_enrollment"("tenantId", "employeeId");

CREATE TABLE IF NOT EXISTS "aura_dei_accessibility_request" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "requestType" TEXT NOT NULL DEFAULT 'physical',
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "reviewedBy" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "reviewNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_dei_accessibility_request_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "DeiAccessibilityRequest_tenantId_idx" ON "aura_dei_accessibility_request"("tenantId");
