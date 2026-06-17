-- ============================================================================
-- EPIC-29 (Visa / Work Permit / Immigration Exit Compliance)
-- ============================================================================

CREATE TABLE "aura_visa_exit_case" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "countryCode" TEXT NOT NULL,
  "scenario" TEXT NOT NULL,
  "visaNumber" TEXT,
  "workPermitNumber" TEXT,
  "passportNumber" TEXT,
  "lastWorkingDate" TIMESTAMP(3),
  "cancellationDate" TIMESTAMP(3),
  "graceExpiresAt" TIMESTAMP(3),
  "ownerId" TEXT,
  "proAssigneeId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "subStatus" TEXT,
  "dependentsCount" INTEGER NOT NULL DEFAULT 0,
  "ticketRequired" BOOLEAN NOT NULL DEFAULT false,
  "ticketIssued" BOOLEAN NOT NULL DEFAULT false,
  "finalSettlementId" TEXT,
  "siClosureRef" TEXT,
  "absconding" BOOLEAN NOT NULL DEFAULT false,
  "abscondingReportedAt" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_visa_exit_case_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_visa_exit_case_employee"
  ON "aura_visa_exit_case"("tenantId", "employeeId");
CREATE INDEX "aura_visa_exit_case_status"
  ON "aura_visa_exit_case"("tenantId", "status");

CREATE TABLE "aura_visa_exit_pro_action" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "caseId" TEXT NOT NULL,
  "actionCode" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "authority" TEXT,
  "assigneeId" TEXT,
  "dueDate" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "completedAt" TIMESTAMP(3),
  "completedBy" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_visa_exit_pro_action_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_visa_exit_pro_action_case"
  ON "aura_visa_exit_pro_action"("tenantId", "caseId");

CREATE TABLE "aura_visa_exit_grace" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "caseId" TEXT NOT NULL,
  "grantedAt" TIMESTAMP(3) NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "daysGranted" INTEGER NOT NULL,
  "graceType" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "extensionCount" INTEGER NOT NULL DEFAULT 0,
  "closedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_visa_exit_grace_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_visa_exit_grace_unique"
  ON "aura_visa_exit_grace"("tenantId", "caseId");

CREATE TABLE "aura_visa_exit_evidence" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "caseId" TEXT NOT NULL,
  "portal" TEXT NOT NULL,
  "referenceNumber" TEXT,
  "evidenceType" TEXT NOT NULL,
  "fileUrl" TEXT,
  "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "capturedBy" TEXT,
  "validUntil" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_visa_exit_evidence_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_visa_exit_evidence_case"
  ON "aura_visa_exit_evidence"("tenantId", "caseId");

CREATE TABLE "aura_visa_exit_certificate" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "casesOpened" INTEGER NOT NULL DEFAULT 0,
  "casesClosed" INTEGER NOT NULL DEFAULT 0,
  "casesAbsconding" INTEGER NOT NULL DEFAULT 0,
  "graceExpiringCount" INTEGER NOT NULL DEFAULT 0,
  "overduePoActions" INTEGER NOT NULL DEFAULT 0,
  "missingEvidenceCount" INTEGER NOT NULL DEFAULT 0,
  "gatingReason" TEXT,
  "attestationsJson" JSONB NOT NULL DEFAULT '[]',
  "generatedAt" TIMESTAMP(3),
  "signedAt" TIMESTAMP(3),
  "signedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_visa_exit_certificate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_visa_exit_certificate_unique"
  ON "aura_visa_exit_certificate"("tenantId", "period");
