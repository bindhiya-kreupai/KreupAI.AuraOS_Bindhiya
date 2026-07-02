-- Compliance / Labor-Relations module domain models (AURA-050..060, 072).
-- Defensive CREATE TABLE IF NOT EXISTS; repo uses db-push, enums stored as TEXT.
-- Grievances/disciplinary reuse existing aura_er_* tables; frameworks reuse
-- aura_compliance_framework/control/evidence. These hold the remaining
-- Labor-Relations entities that had no backing table.

CREATE TABLE IF NOT EXISTS "aura_compliance_labor_law" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "lawCode" TEXT NOT NULL,
  "lawName" TEXT NOT NULL,
  "lawNameAr" TEXT,
  "description" TEXT,
  "jurisdiction" TEXT NOT NULL DEFAULT 'federal',
  "category" TEXT NOT NULL DEFAULT 'general',
  "effectiveDate" TIMESTAMP(3),
  "responsibleDept" TEXT,
  "status" TEXT NOT NULL DEFAULT 'compliant',
  "lastAuditDate" TIMESTAMP(3),
  "riskLevel" TEXT NOT NULL DEFAULT 'low',
  "referenceUrl" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_compliance_labor_law_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "LaborLawEntry_tenantId_idx" ON "aura_compliance_labor_law"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_compliance_record" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "recordCode" TEXT NOT NULL,
  "lawId" TEXT,
  "lawName" TEXT,
  "complianceType" TEXT NOT NULL DEFAULT 'labor_law',
  "requirement" TEXT NOT NULL,
  "dueDate" TIMESTAMP(3),
  "completedDate" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'pending_review',
  "responsiblePerson" TEXT,
  "verifiedBy" TEXT,
  "verifiedDate" TIMESTAMP(3),
  "findings" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  CONSTRAINT "aura_compliance_record_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ComplianceRecordEntry_tenantId_idx" ON "aura_compliance_record"("tenantId");
CREATE INDEX IF NOT EXISTS "ComplianceRecordEntry_law_idx" ON "aura_compliance_record"("tenantId", "lawId");

CREATE TABLE IF NOT EXISTS "aura_compliance_posh_committee" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "committeeCode" TEXT NOT NULL,
  "committeeName" TEXT NOT NULL,
  "location" TEXT,
  "establishedDate" TIMESTAMP(3),
  "members" JSONB NOT NULL DEFAULT '[]',
  "casesHandled" INTEGER NOT NULL DEFAULT 0,
  "casesResolved" INTEGER NOT NULL DEFAULT 0,
  "nextMeetingDate" TIMESTAMP(3),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  CONSTRAINT "aura_compliance_posh_committee_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "PoshCommittee_tenantId_idx" ON "aura_compliance_posh_committee"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_compliance_posh_complaint" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "complaintCode" TEXT NOT NULL,
  "complaintDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
  "complainantId" TEXT,
  "complainantName" TEXT,
  "respondentName" TEXT NOT NULL,
  "respondentDept" TEXT,
  "incidentDate" TIMESTAMP(3),
  "incidentLocation" TEXT,
  "incidentDescription" TEXT,
  "status" TEXT NOT NULL DEFAULT 'received',
  "severity" TEXT NOT NULL DEFAULT 'medium',
  "committeeId" TEXT,
  "committeeName" TEXT,
  "findings" TEXT,
  "resolutionDate" TIMESTAMP(3),
  "resolutionDetails" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  CONSTRAINT "aura_compliance_posh_complaint_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "PoshComplaint_tenantId_idx" ON "aura_compliance_posh_complaint"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_compliance_audit_entry" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "auditCode" TEXT NOT NULL,
  "auditName" TEXT NOT NULL,
  "auditType" TEXT NOT NULL DEFAULT 'internal',
  "scope" TEXT,
  "scheduledDate" TIMESTAMP(3),
  "actualStartDate" TIMESTAMP(3),
  "completionDate" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'scheduled',
  "auditors" JSONB NOT NULL DEFAULT '[]',
  "departments" JSONB NOT NULL DEFAULT '[]',
  "overallRating" TEXT,
  "complianceScore" INTEGER,
  "findingsCount" INTEGER NOT NULL DEFAULT 0,
  "criticalCount" INTEGER NOT NULL DEFAULT 0,
  "recommendations" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  CONSTRAINT "aura_compliance_audit_entry_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ComplianceAuditEntry_tenantId_idx" ON "aura_compliance_audit_entry"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_compliance_union" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "unionCode" TEXT NOT NULL,
  "unionName" TEXT NOT NULL,
  "registrationNumber" TEXT,
  "status" TEXT NOT NULL DEFAULT 'active',
  "unionType" TEXT NOT NULL DEFAULT 'local',
  "memberCount" INTEGER NOT NULL DEFAULT 0,
  "eligibleEmployees" INTEGER NOT NULL DEFAULT 0,
  "representativeName" TEXT,
  "representativeContact" TEXT,
  "officeAddress" TEXT,
  "recognitionDate" TIMESTAMP(3),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  CONSTRAINT "aura_compliance_union_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "UnionEntry_tenantId_idx" ON "aura_compliance_union"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_compliance_cba" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "agreementCode" TEXT NOT NULL,
  "agreementName" TEXT NOT NULL,
  "unionId" TEXT,
  "unionName" TEXT,
  "negotiationStartDate" TIMESTAMP(3),
  "agreementDate" TIMESTAMP(3),
  "effectiveDate" TIMESTAMP(3),
  "expiryDate" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'draft',
  "terms" JSONB NOT NULL DEFAULT '[]',
  "estimatedCost" DECIMAL(14,2),
  "currency" TEXT NOT NULL DEFAULT 'AED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  CONSTRAINT "aura_compliance_cba_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "CbaEntry_tenantId_idx" ON "aura_compliance_cba"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_compliance_whistleblower" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "reportCode" TEXT NOT NULL,
  "submittedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reporterIdentity" TEXT NOT NULL DEFAULT 'anonymous',
  "reporterName" TEXT,
  "reporterContact" TEXT,
  "allegationType" TEXT NOT NULL DEFAULT 'misconduct',
  "severity" TEXT NOT NULL DEFAULT 'medium',
  "subject" TEXT NOT NULL,
  "detailedDescription" TEXT,
  "locationOfIncident" TEXT,
  "dateOfIncident" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'received',
  "assignedInvestigator" TEXT,
  "findings" TEXT,
  "retaliationReported" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  CONSTRAINT "aura_compliance_whistleblower_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "WhistleblowerReport_tenantId_idx" ON "aura_compliance_whistleblower"("tenantId");
CREATE INDEX IF NOT EXISTS "WhistleblowerReport_code_idx" ON "aura_compliance_whistleblower"("tenantId", "reportCode");

CREATE TABLE IF NOT EXISTS "aura_compliance_arbitration" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "arbitrationCode" TEXT NOT NULL,
  "caseTitle" TEXT NOT NULL,
  "disputeType" TEXT NOT NULL DEFAULT 'labor',
  "filingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "claimantName" TEXT NOT NULL,
  "claimantType" TEXT NOT NULL DEFAULT 'employee',
  "respondentName" TEXT NOT NULL,
  "respondentType" TEXT NOT NULL DEFAULT 'company',
  "disputeDescription" TEXT,
  "claimAmount" DECIMAL(14,2),
  "currency" TEXT NOT NULL DEFAULT 'AED',
  "arbitratorName" TEXT,
  "status" TEXT NOT NULL DEFAULT 'filed',
  "venue" TEXT,
  "awardSummary" TEXT,
  "awardInFavorOf" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  CONSTRAINT "aura_compliance_arbitration_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ArbitrationCase_tenantId_idx" ON "aura_compliance_arbitration"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_compliance_strike" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "strikeCode" TEXT NOT NULL,
  "strikeName" TEXT NOT NULL,
  "unionId" TEXT,
  "unionName" TEXT,
  "noticeDate" TIMESTAMP(3),
  "proposedStartDate" TIMESTAMP(3),
  "actualStartDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'notice_received',
  "strikeType" TEXT NOT NULL DEFAULT 'full',
  "affectedDepartments" JSONB NOT NULL DEFAULT '[]',
  "affectedEmployeeCount" INTEGER NOT NULL DEFAULT 0,
  "responseMode" TEXT NOT NULL DEFAULT 'standby',
  "resolutionDate" TIMESTAMP(3),
  "resolutionTerms" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  CONSTRAINT "aura_compliance_strike_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "StrikeEntry_tenantId_idx" ON "aura_compliance_strike"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_compliance_communication_log" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "communicationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "communicationType" TEXT NOT NULL DEFAULT 'meeting',
  "category" TEXT NOT NULL DEFAULT 'union',
  "subject" TEXT NOT NULL,
  "summary" TEXT,
  "fromParty" TEXT,
  "toParty" TEXT,
  "relatedEntityId" TEXT,
  "attachments" JSONB NOT NULL DEFAULT '[]',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  CONSTRAINT "aura_compliance_communication_log_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ComplianceCommunicationLog_tenantId_idx" ON "aura_compliance_communication_log"("tenantId");
CREATE INDEX IF NOT EXISTS "ComplianceCommunicationLog_category_idx" ON "aura_compliance_communication_log"("tenantId", "category");

CREATE TABLE IF NOT EXISTS "aura_compliance_setting" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "settings" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedBy" TEXT,
  CONSTRAINT "aura_compliance_setting_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ComplianceSettingEntry_tenant_unique" ON "aura_compliance_setting"("tenantId");
