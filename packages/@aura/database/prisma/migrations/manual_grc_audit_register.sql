-- Manual GRC Audit Register Migration
-- Execution target: Neon Console in Transaction Mode

BEGIN;

CREATE TABLE IF NOT EXISTS "aura_compliance_audit_checklist_item" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "domainCode" TEXT NOT NULL,
  "categoryCode" TEXT NOT NULL,
  "itemCode" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "expectedBehavior" TEXT,
  "evidenceRequirement" TEXT,
  "ownerRole" TEXT,
  "isMandatory" BOOLEAN NOT NULL DEFAULT false,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "owner" TEXT,
  "dueDate" TIMESTAMP(3),
  "evidenceUrl" TEXT,
  "notes" TEXT,
  "completedAt" TIMESTAMP(3),
  "completedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_compliance_audit_checklist_item_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "aura_compliance_audit_checklist_item_unique" ON "aura_compliance_audit_checklist_item"("tenantId", "domainCode", "itemCode");
CREATE INDEX IF NOT EXISTS "idx_compliance_audit_checklist_item_tenant" ON "aura_compliance_audit_checklist_item"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_compliance_risk_register_entry" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "domainCode" TEXT NOT NULL,
  "riskCode" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT,
  "likelihood" INTEGER NOT NULL,
  "impact" INTEGER NOT NULL,
  "score" INTEGER NOT NULL,
  "band" TEXT NOT NULL,
  "ownerRole" TEXT,
  "controlRef" TEXT,
  "mitigationPlan" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "reviewedAt" TIMESTAMP(3),
  "reviewedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_compliance_risk_register_entry_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "aura_compliance_risk_register_entry_unique" ON "aura_compliance_risk_register_entry"("tenantId", "domainCode", "riskCode");
CREATE INDEX IF NOT EXISTS "idx_compliance_risk_register_entry_tenant" ON "aura_compliance_risk_register_entry"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_compliance_register_evidence" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "fileSize" INTEGER NOT NULL,
  "uploadedBy" TEXT,
  "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "verifiedBy" TEXT,
  "verifiedAt" TIMESTAMP(3),
  "acceptedStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "checksum" TEXT,
  "version" INTEGER NOT NULL DEFAULT 1,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_compliance_register_evidence_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "idx_compliance_register_evidence_tenant" ON "aura_compliance_register_evidence"("tenantId");
CREATE INDEX IF NOT EXISTS "idx_compliance_register_evidence_target" ON "aura_compliance_register_evidence"("targetType", "targetId");

CREATE TABLE IF NOT EXISTS "aura_compliance_register_timeline" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "userId" TEXT,
  "userName" TEXT,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_compliance_register_timeline_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "idx_compliance_register_timeline_tenant" ON "aura_compliance_register_timeline"("tenantId");
CREATE INDEX IF NOT EXISTS "idx_compliance_register_timeline_target" ON "aura_compliance_register_timeline"("targetType", "targetId");

COMMIT;
