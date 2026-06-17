-- ============================================================================
-- EPIC-20 (Leave Management Compliance — overlay on existing LeaveType /
-- LeavePolicy / LeaveRequest / LeaveBalance / LeaveAccrual / LeaveCarryForward /
-- LeaveEncashment models)
-- ============================================================================

CREATE TABLE "aura_leave_entitlement_rule" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "leaveCode" TEXT NOT NULL,
  "annualDays" DECIMAL(6,2) NOT NULL,
  "accrualBasis" TEXT NOT NULL DEFAULT 'MONTHLY',
  "maxCarryForwardDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
  "encashableDays" DECIMAL(6,2) NOT NULL DEFAULT 0,
  "isPaid" BOOLEAN NOT NULL DEFAULT true,
  "isMedicalEvidenceRequired" BOOLEAN NOT NULL DEFAULT false,
  "minServiceMonths" INTEGER NOT NULL DEFAULT 0,
  "maxConsecutiveDays" DECIMAL(6,2) NOT NULL DEFAULT 365,
  "noticePeriodDays" INTEGER NOT NULL DEFAULT 0,
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveTo" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_leave_entitlement_rule_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_leave_entitlement_rule_unique"
  ON "aura_leave_entitlement_rule"("tenantId", "country", "leaveCode", "effectiveFrom");

CREATE TABLE "aura_leave_misuse_flag" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "leaveRequestId" TEXT,
  "flagType" TEXT NOT NULL,
  "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
  "score" INTEGER NOT NULL DEFAULT 0,
  "evidenceJson" JSONB NOT NULL DEFAULT '{}',
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "resolvedAt" TIMESTAMP(3),
  "resolvedBy" TEXT,
  "resolutionNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_leave_misuse_flag_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_leave_misuse_flag_employee"
  ON "aura_leave_misuse_flag"("tenantId", "employeeId");
CREATE INDEX "aura_leave_misuse_flag_open"
  ON "aura_leave_misuse_flag"("tenantId", "status");

CREATE TABLE "aura_leave_medical_evidence" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "leaveRequestId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "evidenceType" TEXT NOT NULL,
  "fileUrl" TEXT,
  "issuedBy" TEXT,
  "issuedAt" TIMESTAMP(3),
  "classification" TEXT NOT NULL DEFAULT 'RESTRICTED',
  "retentionUntil" TIMESTAMP(3),
  "verifiedAt" TIMESTAMP(3),
  "verifiedBy" TEXT,
  "fraudFlagged" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_leave_medical_evidence_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_leave_medical_evidence_request"
  ON "aura_leave_medical_evidence"("tenantId", "leaveRequestId");

CREATE TABLE "aura_leave_certificate" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "requestsTotal" INTEGER NOT NULL DEFAULT 0,
  "requestsApproved" INTEGER NOT NULL DEFAULT 0,
  "requestsPending" INTEGER NOT NULL DEFAULT 0,
  "encashmentsCount" INTEGER NOT NULL DEFAULT 0,
  "carryForwardsCount" INTEGER NOT NULL DEFAULT 0,
  "openMisuseFlags" INTEGER NOT NULL DEFAULT 0,
  "missingMedicalEvidenceCount" INTEGER NOT NULL DEFAULT 0,
  "unpaidLeaveDays" DECIMAL(8,2) NOT NULL DEFAULT 0,
  "gatingReason" TEXT,
  "attestationsJson" JSONB NOT NULL DEFAULT '[]',
  "generatedAt" TIMESTAMP(3),
  "signedAt" TIMESTAMP(3),
  "signedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_leave_certificate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_leave_certificate_unique"
  ON "aura_leave_certificate"("tenantId", "period");
