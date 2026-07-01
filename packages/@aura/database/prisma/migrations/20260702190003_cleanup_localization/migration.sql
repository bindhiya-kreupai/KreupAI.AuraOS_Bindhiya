-- Localization cleanup domain models (AURA-606, AURA-610).
-- Defensive CREATE TABLE IF NOT EXISTS; repo uses db-push, enums stored as TEXT.

-- AURA-606: Corporate bank accounts used by the Bank Integration Accounts tab.
CREATE TABLE IF NOT EXISTS "aura_corporate_bank_account" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "accountName" TEXT NOT NULL,
  "bankName" TEXT NOT NULL,
  "accountNumber" TEXT NOT NULL,
  "ifscCode" TEXT,
  "swiftCode" TEXT,
  "iban" TEXT,
  "branchName" TEXT,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "disbursementFormat" TEXT NOT NULL DEFAULT 'NEFT',
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "status" TEXT NOT NULL DEFAULT 'active',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_corporate_bank_account_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CorporateBankAccount_tenantId_idx"
  ON "aura_corporate_bank_account" ("tenantId");
CREATE INDEX IF NOT EXISTS "CorporateBankAccount_tenantId_status_idx"
  ON "aura_corporate_bank_account" ("tenantId", "status");

-- AURA-610: Archive of generated statutory government filings.
CREATE TABLE IF NOT EXISTS "aura_government_report_archive" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "countryName" TEXT,
  "reportType" TEXT NOT NULL,
  "authority" TEXT,
  "frequency" TEXT,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'generated',
  "fileRef" TEXT,
  "notes" TEXT,
  "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  CONSTRAINT "aura_government_report_archive_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "GovernmentReportArchive_tenantId_idx"
  ON "aura_government_report_archive" ("tenantId");
CREATE INDEX IF NOT EXISTS "GovernmentReportArchive_tenantId_country_idx"
  ON "aura_government_report_archive" ("tenantId", "country");
