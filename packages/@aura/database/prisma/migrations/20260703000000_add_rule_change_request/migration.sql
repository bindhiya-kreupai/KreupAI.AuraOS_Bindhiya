-- ============================================================================
-- EPIC-02-S02 (Country rule pack change governance — maker-checker,
-- versioning, rationale + source reference required, rollback action).
--
-- Adds aura_rule_change_request: every DRAFT pack publish / RETIRE goes
-- through a request that enforces preparer != approver and captures
-- rationale + sourceReference. Rollback is recorded as a separate action
-- type on the same table so the audit history stays single-table.
-- ============================================================================

CREATE TABLE "aura_rule_change_request" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "rulePackId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
  "rationale" TEXT NOT NULL,
  "sourceReference" TEXT NOT NULL,
  "diffSummary" JSONB,
  "effectiveFrom" TIMESTAMP(3),
  "requestedBy" TEXT NOT NULL,
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP(3),
  "rejectedBy" TEXT,
  "rejectedAt" TIMESTAMP(3),
  "rejectionReason" TEXT,
  "rolledBackBy" TEXT,
  "rolledBackAt" TIMESTAMP(3),
  "rollbackReason" TEXT,
  "previousVersion" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "aura_rule_change_request_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "aura_rule_change_request_tenant_status"
  ON "aura_rule_change_request"("tenantId", "status");
CREATE INDEX "aura_rule_change_request_pack"
  ON "aura_rule_change_request"("rulePackId");
CREATE INDEX "aura_rule_change_request_action"
  ON "aura_rule_change_request"("tenantId", "action", "status");
