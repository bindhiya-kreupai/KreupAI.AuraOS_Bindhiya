-- ============================================================================
-- EPIC-25 + EPIC-26 (Employee Relations: Grievance + Disciplinary)
-- ============================================================================

CREATE TABLE "aura_er_grievance_case" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "caseNumber" TEXT NOT NULL,
  "channel" TEXT NOT NULL,
  "grievanceType" TEXT NOT NULL,
  "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
  "subject" TEXT NOT NULL,
  "description" TEXT,
  "complainantId" TEXT,
  "respondentId" TEXT,
  "isWhistleblower" BOOLEAN NOT NULL DEFAULT false,
  "country" TEXT,
  "assigneeId" TEXT,
  "raisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "slaDays" INTEGER NOT NULL DEFAULT 30,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "outcome" TEXT,
  "resolvedAt" TIMESTAMP(3),
  "resolvedBy" TEXT,
  "labourAuthorityRef" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_er_grievance_case_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_er_grievance_case_unique"
  ON "aura_er_grievance_case"("tenantId", "caseNumber");
CREATE INDEX "aura_er_grievance_case_status"
  ON "aura_er_grievance_case"("tenantId", "status");

CREATE TABLE "aura_er_disciplinary_action" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "actionNumber" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "linkedGrievanceId" TEXT,
  "misconductType" TEXT NOT NULL,
  "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
  "actionType" TEXT NOT NULL,
  "warningCount" INTEGER NOT NULL DEFAULT 0,
  "suspensionDays" INTEGER NOT NULL DEFAULT 0,
  "salaryDeductionDays" INTEGER NOT NULL DEFAULT 0,
  "salaryDeductionPct" DECIMAL(5,2) NOT NULL DEFAULT 0,
  "hearingHeld" BOOLEAN NOT NULL DEFAULT false,
  "hearingDate" TIMESTAMP(3),
  "responseRecorded" BOOLEAN NOT NULL DEFAULT false,
  "evidenceCount" INTEGER NOT NULL DEFAULT 0,
  "country" TEXT,
  "issuedBy" TEXT,
  "issuedAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "effectiveFrom" TIMESTAMP(3),
  "effectiveTo" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_er_disciplinary_action_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_er_disciplinary_action_unique"
  ON "aura_er_disciplinary_action"("tenantId", "actionNumber");
CREATE INDEX "aura_er_disciplinary_action_employee"
  ON "aura_er_disciplinary_action"("tenantId", "employeeId");

CREATE TABLE "aura_er_investigation" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "investigationNumber" TEXT NOT NULL,
  "grievanceCaseId" TEXT,
  "disciplinaryActionId" TEXT,
  "investigatorId" TEXT,
  "scope" TEXT,
  "interviewCount" INTEGER NOT NULL DEFAULT 0,
  "evidenceCount" INTEGER NOT NULL DEFAULT 0,
  "findings" TEXT,
  "recommendation" TEXT,
  "startedAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_er_investigation_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_er_investigation_unique"
  ON "aura_er_investigation"("tenantId", "investigationNumber");

CREATE TABLE "aura_er_appeal" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "appealNumber" TEXT NOT NULL,
  "subjectType" TEXT NOT NULL,
  "subjectId" TEXT NOT NULL,
  "appellantId" TEXT NOT NULL,
  "reason" TEXT,
  "filedAt" TIMESTAMP(3) NOT NULL,
  "decisionDueAt" TIMESTAMP(3),
  "outcome" TEXT,
  "decidedAt" TIMESTAMP(3),
  "decidedBy" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_er_appeal_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_er_appeal_unique"
  ON "aura_er_appeal"("tenantId", "appealNumber");

CREATE TABLE "aura_er_certificate" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "grievancesOpened" INTEGER NOT NULL DEFAULT 0,
  "grievancesClosed" INTEGER NOT NULL DEFAULT 0,
  "grievancesSlaBreached" INTEGER NOT NULL DEFAULT 0,
  "highSeverityOpen" INTEGER NOT NULL DEFAULT 0,
  "disciplinaryActionsIssued" INTEGER NOT NULL DEFAULT 0,
  "actionsWithoutHearing" INTEGER NOT NULL DEFAULT 0,
  "appealsOpen" INTEGER NOT NULL DEFAULT 0,
  "labourAuthorityReferrals" INTEGER NOT NULL DEFAULT 0,
  "retaliationFlags" INTEGER NOT NULL DEFAULT 0,
  "gatingReason" TEXT,
  "attestationsJson" JSONB NOT NULL DEFAULT '[]',
  "generatedAt" TIMESTAMP(3),
  "signedAt" TIMESTAMP(3),
  "signedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_er_certificate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_er_certificate_unique"
  ON "aura_er_certificate"("tenantId", "period");
