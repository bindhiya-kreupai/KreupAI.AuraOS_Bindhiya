-- ============================================================================
-- EPIC-32 (HR Policies Compliance — layered over existing PolicyDocument +
-- PolicyAcknowledgement; adds exception register, scheduled reviews, and
-- monthly certificate)
-- ============================================================================

CREATE TABLE "aura_hr_policy_exception" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "policyId" TEXT NOT NULL,
  "employeeId" TEXT,
  "scopeLabel" TEXT,
  "reason" TEXT NOT NULL,
  "raisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "raisedBy" TEXT,
  "approverId" TEXT,
  "approvedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_hr_policy_exception_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_hr_policy_exception_policy"
  ON "aura_hr_policy_exception"("tenantId", "policyId");

CREATE TABLE "aura_hr_policy_review" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "policyId" TEXT NOT NULL,
  "dueAt" TIMESTAMP(3) NOT NULL,
  "intervalMonths" INTEGER NOT NULL DEFAULT 12,
  "lastReviewedAt" TIMESTAMP(3),
  "lastReviewedBy" TEXT,
  "reviewerNotes" TEXT,
  "outcome" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_hr_policy_review_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_hr_policy_review_unique"
  ON "aura_hr_policy_review"("tenantId", "policyId");

CREATE TABLE "aura_hr_policy_certificate" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "publishedCount" INTEGER NOT NULL DEFAULT 0,
  "draftCount" INTEGER NOT NULL DEFAULT 0,
  "overdueReviewsCount" INTEGER NOT NULL DEFAULT 0,
  "pendingExceptionsCount" INTEGER NOT NULL DEFAULT 0,
  "ackCoveragePct" DECIMAL(5,2) NOT NULL DEFAULT 0,
  "ackBelowThresholdCount" INTEGER NOT NULL DEFAULT 0,
  "gatingReason" TEXT,
  "attestationsJson" JSONB NOT NULL DEFAULT '[]',
  "generatedAt" TIMESTAMP(3),
  "signedAt" TIMESTAMP(3),
  "signedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_hr_policy_certificate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_hr_policy_certificate_unique"
  ON "aura_hr_policy_certificate"("tenantId", "period");
