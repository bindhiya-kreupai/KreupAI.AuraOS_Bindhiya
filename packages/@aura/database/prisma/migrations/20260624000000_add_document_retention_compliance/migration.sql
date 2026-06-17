-- ============================================================================
-- EPIC-30 (Document Retention & HR Audit Compliance)
-- ============================================================================

CREATE TABLE "aura_doc_retention_schedule" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "countryCode" TEXT,
  "recordType" TEXT NOT NULL,
  "retentionYears" INTEGER NOT NULL,
  "basis" TEXT,
  "classification" TEXT NOT NULL DEFAULT 'INTERNAL',
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveTo" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_doc_retention_schedule_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_doc_retention_schedule_unique"
  ON "aura_doc_retention_schedule"("tenantId", "countryCode", "recordType", "effectiveFrom");

CREATE TABLE "aura_hr_document" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT,
  "recordType" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "fileUrl" TEXT,
  "classification" TEXT NOT NULL DEFAULT 'INTERNAL',
  "issuedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "retentionUntil" TIMESTAMP(3),
  "litigationHoldId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "disposedAt" TIMESTAMP(3),
  "disposedBy" TEXT,
  "disposalReason" TEXT,
  "metadataJson" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_hr_document_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_hr_document_employee"
  ON "aura_hr_document"("tenantId", "employeeId");
CREATE INDEX "aura_hr_document_type"
  ON "aura_hr_document"("tenantId", "recordType");
CREATE INDEX "aura_hr_document_expiry"
  ON "aura_hr_document"("tenantId", "expiresAt");

CREATE TABLE "aura_doc_litigation_hold" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "caseNumber" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "scopeFilter" JSONB NOT NULL DEFAULT '{}',
  "startedAt" TIMESTAMP(3) NOT NULL,
  "startedBy" TEXT,
  "endedAt" TIMESTAMP(3),
  "endedBy" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "heldDocCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_doc_litigation_hold_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_doc_litigation_hold_unique"
  ON "aura_doc_litigation_hold"("tenantId", "caseNumber");

CREATE TABLE "aura_doc_disposal_request" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "documentIds" JSONB NOT NULL DEFAULT '[]',
  "reason" TEXT NOT NULL,
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "requestedBy" TEXT,
  "approverId" TEXT,
  "approvedAt" TIMESTAMP(3),
  "executedAt" TIMESTAMP(3),
  "executedBy" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "blockedReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_doc_disposal_request_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "aura_hr_audit_cycle" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "scopeJson" JSONB NOT NULL DEFAULT '{}',
  "sampleSize" INTEGER NOT NULL DEFAULT 0,
  "startedAt" TIMESTAMP(3) NOT NULL,
  "closedAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "findingsCount" INTEGER NOT NULL DEFAULT 0,
  "findingsClosedCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_hr_audit_cycle_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "aura_hr_audit_finding" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "auditCycleId" TEXT NOT NULL,
  "documentId" TEXT,
  "employeeId" TEXT,
  "severity" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "remediation" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "raisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "closedAt" TIMESTAMP(3),
  "closedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_hr_audit_finding_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_hr_audit_finding_cycle"
  ON "aura_hr_audit_finding"("tenantId", "auditCycleId");

CREATE TABLE "aura_doc_compliance_certificate" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "activeDocs" INTEGER NOT NULL DEFAULT 0,
  "expiringSoonCount" INTEGER NOT NULL DEFAULT 0,
  "expiredCount" INTEGER NOT NULL DEFAULT 0,
  "litigationHoldCount" INTEGER NOT NULL DEFAULT 0,
  "pendingDisposalCount" INTEGER NOT NULL DEFAULT 0,
  "openFindingsCount" INTEGER NOT NULL DEFAULT 0,
  "criticalFindingsCount" INTEGER NOT NULL DEFAULT 0,
  "gatingReason" TEXT,
  "attestationsJson" JSONB NOT NULL DEFAULT '[]',
  "generatedAt" TIMESTAMP(3),
  "signedAt" TIMESTAMP(3),
  "signedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_doc_compliance_certificate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_doc_compliance_certificate_unique"
  ON "aura_doc_compliance_certificate"("tenantId", "period");
