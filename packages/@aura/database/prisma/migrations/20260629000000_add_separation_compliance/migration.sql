-- ============================================================================
-- EPIC-27 (Termination & Separation Compliance)
-- ============================================================================

CREATE TABLE "aura_separation_case" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "caseNumber" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "separationType" TEXT NOT NULL,
  "reason" TEXT,
  "noticeRequiredDays" INTEGER NOT NULL DEFAULT 30,
  "noticeServedDays" INTEGER NOT NULL DEFAULT 0,
  "noticeBuyout" BOOLEAN NOT NULL DEFAULT false,
  "noticeBuyoutAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "gardenLeave" BOOLEAN NOT NULL DEFAULT false,
  "abandonmentDays" INTEGER NOT NULL DEFAULT 0,
  "lastWorkingDate" TIMESTAMP(3),
  "submittedAt" TIMESTAMP(3),
  "approvedAt" TIMESTAMP(3),
  "approverId" TEXT,
  "settlementAgreementSigned" BOOLEAN NOT NULL DEFAULT false,
  "settlementAmount" DECIMAL(14,2),
  "eosbCalculationId" TEXT,
  "visaExitCaseId" TEXT,
  "siClosureRef" TEXT,
  "itAccessRevoked" BOOLEAN NOT NULL DEFAULT false,
  "itAccessRevokedAt" TIMESTAMP(3),
  "deathInService" BOOLEAN NOT NULL DEFAULT false,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_separation_case_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_separation_case_unique"
  ON "aura_separation_case"("tenantId", "caseNumber");
CREATE INDEX "aura_separation_case_employee"
  ON "aura_separation_case"("tenantId", "employeeId");

CREATE TABLE "aura_separation_clearance" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "caseId" TEXT NOT NULL,
  "department" TEXT NOT NULL,
  "checklistJson" JSONB NOT NULL DEFAULT '[]',
  "completedItems" INTEGER NOT NULL DEFAULT 0,
  "totalItems" INTEGER NOT NULL DEFAULT 0,
  "ownerId" TEXT,
  "clearedAt" TIMESTAMP(3),
  "clearedBy" TEXT,
  "blockerNotes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_separation_clearance_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_separation_clearance_unique"
  ON "aura_separation_clearance"("tenantId", "caseId", "department");

CREATE TABLE "aura_separation_handover" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "caseId" TEXT NOT NULL,
  "itemDescription" TEXT NOT NULL,
  "itemType" TEXT NOT NULL,
  "successorId" TEXT,
  "completedAt" TIMESTAMP(3),
  "completedBy" TEXT,
  "evidenceUrl" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_separation_handover_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_separation_handover_case"
  ON "aura_separation_handover"("tenantId", "caseId");

CREATE TABLE "aura_separation_exit_interview" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "caseId" TEXT NOT NULL,
  "conductedAt" TIMESTAMP(3),
  "conductedBy" TEXT,
  "satisfactionScore" INTEGER,
  "reasonCode" TEXT,
  "reasonDetail" TEXT,
  "willingToRehire" BOOLEAN,
  "feedbackJson" JSONB NOT NULL DEFAULT '{}',
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_separation_exit_interview_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_separation_exit_interview_unique"
  ON "aura_separation_exit_interview"("tenantId", "caseId");

CREATE TABLE "aura_separation_certificate" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "casesOpened" INTEGER NOT NULL DEFAULT 0,
  "casesClosed" INTEGER NOT NULL DEFAULT 0,
  "casesByType" JSONB NOT NULL DEFAULT '{}',
  "averageNoticeServed" DECIMAL(6,2) NOT NULL DEFAULT 0,
  "abandonmentCases" INTEGER NOT NULL DEFAULT 0,
  "clearancesPending" INTEGER NOT NULL DEFAULT 0,
  "handoverPending" INTEGER NOT NULL DEFAULT 0,
  "exitInterviewMissing" INTEGER NOT NULL DEFAULT 0,
  "itAccessOpenAfterClose" INTEGER NOT NULL DEFAULT 0,
  "deathInServiceCount" INTEGER NOT NULL DEFAULT 0,
  "gatingReason" TEXT,
  "attestationsJson" JSONB NOT NULL DEFAULT '[]',
  "generatedAt" TIMESTAMP(3),
  "signedAt" TIMESTAMP(3),
  "signedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_separation_certificate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_separation_certificate_unique"
  ON "aura_separation_certificate"("tenantId", "period");
