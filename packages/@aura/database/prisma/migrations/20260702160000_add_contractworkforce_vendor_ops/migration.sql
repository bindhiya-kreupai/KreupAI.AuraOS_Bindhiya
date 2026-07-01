-- Contract Workforce Module (AURA-318..AURA-325): recruitment vendor sub-domains.
-- Defensive CREATE TABLE IF NOT EXISTS; repo uses db-push, enums stored as TEXT.
-- Backs vendor compliance docs, contract types, renewals, rate cards,
-- performance reviews, invoices, and timesheets. All tenant-scoped.

CREATE TABLE IF NOT EXISTS "aura_vendor_compliance_doc" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "vendorId" TEXT NOT NULL,
  "documentType" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "documentNumber" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "issueDate" TIMESTAMP(3),
  "expiryDate" TIMESTAMP(3),
  "documentUrl" TEXT,
  "reviewedBy" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "notes" TEXT,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_vendor_compliance_doc_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "VendorComplianceDoc_tenantId_idx" ON "aura_vendor_compliance_doc"("tenantId");
CREATE INDEX IF NOT EXISTS "VendorComplianceDoc_tenant_vendor_idx" ON "aura_vendor_compliance_doc"("tenantId", "vendorId");
CREATE INDEX IF NOT EXISTS "VendorComplianceDoc_tenant_status_idx" ON "aura_vendor_compliance_doc"("tenantId", "status");

CREATE TABLE IF NOT EXISTS "aura_vendor_contract_type" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "engagementModel" TEXT NOT NULL DEFAULT 'staff_augmentation',
  "noticePeriodDays" INTEGER NOT NULL DEFAULT 30,
  "paymentTermsDays" INTEGER NOT NULL DEFAULT 30,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_vendor_contract_type_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "VendorContractType_tenant_code_key" ON "aura_vendor_contract_type"("tenantId", "code");
CREATE INDEX IF NOT EXISTS "VendorContractType_tenantId_idx" ON "aura_vendor_contract_type"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_vendor_contract_renewal" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "vendorId" TEXT NOT NULL,
  "currentEndDate" TIMESTAMP(3),
  "proposedEndDate" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'pending',
  "decision" TEXT,
  "decisionNotes" TEXT,
  "reviewedBy" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_vendor_contract_renewal_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "VendorContractRenewal_tenantId_idx" ON "aura_vendor_contract_renewal"("tenantId");
CREATE INDEX IF NOT EXISTS "VendorContractRenewal_tenant_vendor_idx" ON "aura_vendor_contract_renewal"("tenantId", "vendorId");
CREATE INDEX IF NOT EXISTS "VendorContractRenewal_tenant_status_idx" ON "aura_vendor_contract_renewal"("tenantId", "status");

CREATE TABLE IF NOT EXISTS "aura_vendor_rate_card" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "vendorId" TEXT NOT NULL,
  "roleTitle" TEXT NOT NULL,
  "experienceLevel" TEXT NOT NULL DEFAULT 'mid',
  "location" TEXT,
  "ratePeriod" TEXT NOT NULL DEFAULT 'hourly',
  "rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "effectiveFrom" TIMESTAMP(3),
  "effectiveTo" TIMESTAMP(3),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_vendor_rate_card_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "VendorRateCard_tenantId_idx" ON "aura_vendor_rate_card"("tenantId");
CREATE INDEX IF NOT EXISTS "VendorRateCard_tenant_vendor_idx" ON "aura_vendor_rate_card"("tenantId", "vendorId");

CREATE TABLE IF NOT EXISTS "aura_vendor_performance_review" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "vendorId" TEXT NOT NULL,
  "periodLabel" TEXT NOT NULL,
  "qualityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "timelinessScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "communicationScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "overallScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "reviewNotes" TEXT,
  "reviewedBy" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_vendor_performance_review_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "VendorPerformanceReview_tenantId_idx" ON "aura_vendor_performance_review"("tenantId");
CREATE INDEX IF NOT EXISTS "VendorPerformanceReview_tenant_vendor_idx" ON "aura_vendor_performance_review"("tenantId", "vendorId");

CREATE TABLE IF NOT EXISTS "aura_vendor_invoice" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "vendorId" TEXT NOT NULL,
  "invoiceNumber" TEXT NOT NULL,
  "invoiceDate" TIMESTAMP(3),
  "dueDate" TIMESTAMP(3),
  "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "status" TEXT NOT NULL DEFAULT 'pending',
  "description" TEXT,
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP(3),
  "paidAt" TIMESTAMP(3),
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_vendor_invoice_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "VendorInvoice_tenantId_idx" ON "aura_vendor_invoice"("tenantId");
CREATE INDEX IF NOT EXISTS "VendorInvoice_tenant_vendor_idx" ON "aura_vendor_invoice"("tenantId", "vendorId");
CREATE INDEX IF NOT EXISTS "VendorInvoice_tenant_status_idx" ON "aura_vendor_invoice"("tenantId", "status");

CREATE TABLE IF NOT EXISTS "aura_vendor_timesheet" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "vendorId" TEXT NOT NULL,
  "workerName" TEXT NOT NULL,
  "periodStart" TIMESTAMP(3),
  "periodEnd" TIMESTAMP(3),
  "hours" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'submitted',
  "notes" TEXT,
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP(3),
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_vendor_timesheet_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "VendorTimesheet_tenantId_idx" ON "aura_vendor_timesheet"("tenantId");
CREATE INDEX IF NOT EXISTS "VendorTimesheet_tenant_vendor_idx" ON "aura_vendor_timesheet"("tenantId", "vendorId");
CREATE INDEX IF NOT EXISTS "VendorTimesheet_tenant_status_idx" ON "aura_vendor_timesheet"("tenantId", "status");
