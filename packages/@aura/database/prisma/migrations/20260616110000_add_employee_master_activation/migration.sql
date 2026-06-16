CREATE TABLE "aura_employee_number_sequence" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "prefix" TEXT NOT NULL,
  "nextNumber" INTEGER NOT NULL DEFAULT 1,
  "padding" INTEGER NOT NULL DEFAULT 5,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_employee_number_sequence_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "aura_employee_master_data_draft" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "onboardingInstanceId" TEXT,
  "offerId" TEXT,
  "employeeId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "masterData" JSONB NOT NULL,
  "validationSnapshot" JSONB NOT NULL,
  "duplicateSnapshot" JSONB,
  "submittedBy" TEXT,
  "submittedAt" TIMESTAMP(3),
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP(3),
  "activatedBy" TEXT,
  "activatedAt" TIMESTAMP(3),
  "rejectionReason" TEXT,
  "createdBy" TEXT NOT NULL,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "aura_employee_master_data_draft_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "aura_employee_identification" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "countryCode" TEXT NOT NULL,
  "identifierType" TEXT NOT NULL,
  "identifierValue" TEXT NOT NULL,
  "issueDate" TIMESTAMP(3),
  "expiryDate" TIMESTAMP(3),
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "sourceDraftId" TEXT,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "aura_employee_identification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "aura_employee_lifecycle_event" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "publishedAt" TIMESTAMP(3),
  "failedAt" TIMESTAMP(3),
  "errorMessage" TEXT,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_employee_lifecycle_event_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "aura_employee_number_sequence_tenantId_companyId_key" ON "aura_employee_number_sequence"("tenantId", "companyId");
CREATE INDEX "aura_employee_number_sequence_tenantId_idx" ON "aura_employee_number_sequence"("tenantId");
CREATE INDEX "aura_employee_number_sequence_companyId_idx" ON "aura_employee_number_sequence"("companyId");

CREATE INDEX "aura_employee_master_data_draft_tenantId_idx" ON "aura_employee_master_data_draft"("tenantId");
CREATE INDEX "aura_employee_master_data_draft_onboardingInstanceId_idx" ON "aura_employee_master_data_draft"("onboardingInstanceId");
CREATE INDEX "aura_employee_master_data_draft_offerId_idx" ON "aura_employee_master_data_draft"("offerId");
CREATE INDEX "aura_employee_master_data_draft_employeeId_idx" ON "aura_employee_master_data_draft"("employeeId");
CREATE INDEX "aura_employee_master_data_draft_status_idx" ON "aura_employee_master_data_draft"("status");

CREATE UNIQUE INDEX "aura_employee_identification_tenantId_identifierType_identifierValue_key" ON "aura_employee_identification"("tenantId", "identifierType", "identifierValue");
CREATE INDEX "aura_employee_identification_tenantId_idx" ON "aura_employee_identification"("tenantId");
CREATE INDEX "aura_employee_identification_employeeId_idx" ON "aura_employee_identification"("employeeId");
CREATE INDEX "aura_employee_identification_countryCode_idx" ON "aura_employee_identification"("countryCode");
CREATE INDEX "aura_employee_identification_identifierType_idx" ON "aura_employee_identification"("identifierType");

CREATE INDEX "aura_employee_lifecycle_event_tenantId_idx" ON "aura_employee_lifecycle_event"("tenantId");
CREATE INDEX "aura_employee_lifecycle_event_employeeId_idx" ON "aura_employee_lifecycle_event"("employeeId");
CREATE INDEX "aura_employee_lifecycle_event_eventType_idx" ON "aura_employee_lifecycle_event"("eventType");
CREATE INDEX "aura_employee_lifecycle_event_status_idx" ON "aura_employee_lifecycle_event"("status");
