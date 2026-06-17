-- ============================================================================
-- Bank Payment File register + GL Posting ledger for payroll settlements.
-- Backs the EPIC-10 PayrollComplianceCertificate counters:
--   - bankFileMismatches: count(BankPaymentFile WHERE status='MISMATCH')
--   - glPostingsMissing : APPROVED/LOCKED runs with no GlPosting row
-- ============================================================================

CREATE TABLE "aura_bank_payment_file" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "payrollPeriod" TEXT NOT NULL,
  "payrollRunId" TEXT,
  "bankCode" TEXT NOT NULL,
  "fileFormat" TEXT NOT NULL DEFAULT 'SIF',
  "fileReference" TEXT,
  "currency" TEXT NOT NULL DEFAULT 'AED',
  "totalAmount" DECIMAL(18, 2) NOT NULL DEFAULT 0,
  "recordCount" INTEGER NOT NULL DEFAULT 0,
  "matchedCount" INTEGER NOT NULL DEFAULT 0,
  "mismatchCount" INTEGER NOT NULL DEFAULT 0,
  "submittedAt" TIMESTAMP(3),
  "submittedBy" TEXT,
  "acknowledgedAt" TIMESTAMP(3),
  "rejectedReason" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "metadataJson" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_bank_payment_file_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_bank_payment_file_period"
  ON "aura_bank_payment_file"("tenantId", "payrollPeriod", "status");
CREATE INDEX "aura_bank_payment_file_run"
  ON "aura_bank_payment_file"("tenantId", "payrollRunId");

CREATE TABLE "aura_gl_posting" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "payrollRunId" TEXT NOT NULL,
  "payrollPeriod" TEXT NOT NULL,
  "journalRef" TEXT,
  "accountCode" TEXT NOT NULL,
  "costCenter" TEXT,
  "debit" DECIMAL(18, 2) NOT NULL DEFAULT 0,
  "credit" DECIMAL(18, 2) NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'AED',
  "narration" TEXT,
  "postedAt" TIMESTAMP(3),
  "postedBy" TEXT,
  "reversedAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "metadataJson" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_gl_posting_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_gl_posting_run"
  ON "aura_gl_posting"("tenantId", "payrollRunId");
CREATE INDEX "aura_gl_posting_period"
  ON "aura_gl_posting"("tenantId", "payrollPeriod", "status");
