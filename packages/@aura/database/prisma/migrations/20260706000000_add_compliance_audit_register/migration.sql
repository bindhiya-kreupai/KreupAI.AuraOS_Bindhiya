-- ============================================================================
-- Theme C — Audit checklist + risk matrix register companion for ER,
-- Disciplinary, Separation, EOSB, and Visa-Exit (EPIC-25-S12,
-- EPIC-26-S11, EPIC-27-S17, EPIC-28-S14, EPIC-29-S15).
--
-- Generic two-table register shared across all 5 domains via a
-- `domainCode` discriminator. The pattern mirrors `OrgAuditChecklistItem`
-- and `RecordsAuditChecklistItem` already shipped for those epics, but
-- exposes a single workspace + service rather than 5 copies.
-- ============================================================================

CREATE TABLE "aura_compliance_audit_checklist_item" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "domainCode" TEXT NOT NULL,
  "categoryCode" TEXT NOT NULL,
  "itemCode" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "expectedBehavior" TEXT,
  "evidenceRequirement" TEXT,
  "owner" TEXT,
  "ownerRole" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "isMandatory" BOOLEAN NOT NULL DEFAULT true,
  "dueDate" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "completedBy" TEXT,
  "evidenceUrl" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_compliance_audit_checklist_item_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_compliance_audit_checklist_item_unique"
  ON "aura_compliance_audit_checklist_item"("tenantId", "domainCode", "itemCode");
CREATE INDEX "aura_compliance_audit_checklist_item_status"
  ON "aura_compliance_audit_checklist_item"("tenantId", "domainCode", "status");

CREATE TABLE "aura_compliance_risk_register_entry" (
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
  "owner" TEXT,
  "ownerRole" TEXT,
  "controlRef" TEXT,
  "mitigationPlan" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "reviewedAt" TIMESTAMP(3),
  "reviewedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_compliance_risk_register_entry_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "aura_compliance_risk_register_entry_unique"
  ON "aura_compliance_risk_register_entry"("tenantId", "domainCode", "riskCode");
CREATE INDEX "aura_compliance_risk_register_entry_band"
  ON "aura_compliance_risk_register_entry"("tenantId", "domainCode", "band", "status");
