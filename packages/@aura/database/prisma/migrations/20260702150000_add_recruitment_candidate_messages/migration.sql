-- Recruitment Components Module (AURA-252): candidate communication log.
-- Defensive CREATE TABLE IF NOT EXISTS; repo uses db-push, enums stored as TEXT.
-- Backs the Candidate Communication Hub messaging API.

CREATE TABLE IF NOT EXISTS "aura_candidate_message" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "candidateId" TEXT NOT NULL,
  "applicationId" TEXT,
  "channel" TEXT NOT NULL DEFAULT 'email',
  "direction" TEXT NOT NULL DEFAULT 'outbound',
  "status" TEXT NOT NULL DEFAULT 'sent',
  "subject" TEXT,
  "body" TEXT NOT NULL,
  "sender" TEXT,
  "senderRole" TEXT,
  "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_candidate_message_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CandidateMessage_tenantId_idx" ON "aura_candidate_message"("tenantId");
CREATE INDEX IF NOT EXISTS "CandidateMessage_tenant_candidate_idx" ON "aura_candidate_message"("tenantId", "candidateId");
