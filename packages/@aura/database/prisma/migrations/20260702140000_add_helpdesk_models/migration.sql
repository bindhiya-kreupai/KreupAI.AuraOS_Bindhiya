-- HR Helpdesk module domain models (AURA-135..148).
-- Defensive CREATE TABLE IF NOT EXISTS; repo uses db-push, enums stored as TEXT.
-- HelpdeskTicket / HelpdeskSLA already exist; these cover the previously
-- unpersisted helpdesk entities.

CREATE TABLE IF NOT EXISTS "aura_helpdesk_knowledge_article" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT,
  "content" TEXT,
  "category" TEXT NOT NULL DEFAULT 'general',
  "tags" JSONB,
  "status" TEXT NOT NULL DEFAULT 'published',
  "visibility" TEXT NOT NULL DEFAULT 'internal',
  "views" INTEGER NOT NULL DEFAULT 0,
  "helpful" INTEGER NOT NULL DEFAULT 0,
  "notHelpful" INTEGER NOT NULL DEFAULT 0,
  "readMinutes" INTEGER NOT NULL DEFAULT 3,
  "author" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_helpdesk_knowledge_article_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "HelpdeskKnowledgeArticle_tenantId_idx" ON "aura_helpdesk_knowledge_article"("tenantId");
CREATE INDEX IF NOT EXISTS "HelpdeskKnowledgeArticle_tenant_cat_idx" ON "aura_helpdesk_knowledge_article"("tenantId", "category");

CREATE TABLE IF NOT EXISTS "aura_helpdesk_service_request" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "requestNumber" TEXT NOT NULL,
  "service" TEXT NOT NULL,
  "catalogItemId" TEXT,
  "description" TEXT,
  "requesterId" TEXT NOT NULL,
  "currentStage" TEXT,
  "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
  "estCompletion" TIMESTAMP(3),
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_helpdesk_service_request_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "HelpdeskServiceRequest_number_uq" ON "aura_helpdesk_service_request"("tenantId", "requestNumber");
CREATE INDEX IF NOT EXISTS "HelpdeskServiceRequest_tenantId_idx" ON "aura_helpdesk_service_request"("tenantId");
CREATE INDEX IF NOT EXISTS "HelpdeskServiceRequest_tenant_req_idx" ON "aura_helpdesk_service_request"("tenantId", "requesterId");

CREATE TABLE IF NOT EXISTS "aura_helpdesk_catalog_item" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL DEFAULT 'general',
  "iconKey" TEXT,
  "slaHours" INTEGER NOT NULL DEFAULT 24,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "requestCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_helpdesk_catalog_item_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "HelpdeskCatalogItem_tenantId_idx" ON "aura_helpdesk_catalog_item"("tenantId");
CREATE INDEX IF NOT EXISTS "HelpdeskCatalogItem_tenant_cat_idx" ON "aura_helpdesk_catalog_item"("tenantId", "category");

CREATE TABLE IF NOT EXISTS "aura_helpdesk_case" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "caseNumber" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL DEFAULT 'general',
  "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "stage" TEXT,
  "assigneeId" TEXT,
  "reporterId" TEXT,
  "isConfidential" BOOLEAN NOT NULL DEFAULT false,
  "closedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_helpdesk_case_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "HelpdeskCase_number_uq" ON "aura_helpdesk_case"("tenantId", "caseNumber");
CREATE INDEX IF NOT EXISTS "HelpdeskCase_tenantId_idx" ON "aura_helpdesk_case"("tenantId");
CREATE INDEX IF NOT EXISTS "HelpdeskCase_tenant_status_idx" ON "aura_helpdesk_case"("tenantId", "status");

CREATE TABLE IF NOT EXISTS "aura_helpdesk_case_note" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "caseId" TEXT NOT NULL,
  "authorId" TEXT,
  "authorName" TEXT,
  "noteType" TEXT NOT NULL DEFAULT 'internal',
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_helpdesk_case_note_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "HelpdeskCaseNote_tenant_case_idx" ON "aura_helpdesk_case_note"("tenantId", "caseId");

CREATE TABLE IF NOT EXISTS "aura_helpdesk_chat_session" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "subject" TEXT,
  "requesterId" TEXT NOT NULL,
  "agentId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "closedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  CONSTRAINT "aura_helpdesk_chat_session_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "HelpdeskChatSession_tenantId_idx" ON "aura_helpdesk_chat_session"("tenantId");
CREATE INDEX IF NOT EXISTS "HelpdeskChatSession_tenant_req_idx" ON "aura_helpdesk_chat_session"("tenantId", "requesterId");

CREATE TABLE IF NOT EXISTS "aura_helpdesk_chat_message" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "senderId" TEXT NOT NULL,
  "senderType" TEXT NOT NULL DEFAULT 'requester',
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_helpdesk_chat_message_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "HelpdeskChatMessage_tenant_session_idx" ON "aura_helpdesk_chat_message"("tenantId", "sessionId");

CREATE TABLE IF NOT EXISTS "aura_helpdesk_channel" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "channelType" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "config" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DISCONNECTED',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "connectedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_helpdesk_channel_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "HelpdeskChannel_type_uq" ON "aura_helpdesk_channel"("tenantId", "channelType");
CREATE INDEX IF NOT EXISTS "HelpdeskChannel_tenantId_idx" ON "aura_helpdesk_channel"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_helpdesk_automation" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "triggerType" TEXT NOT NULL DEFAULT 'ticket_created',
  "triggerLabel" TEXT,
  "steps" JSONB,
  "stepCount" INTEGER NOT NULL DEFAULT 0,
  "executions" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "lastRunAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_helpdesk_automation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "HelpdeskAutomation_tenantId_idx" ON "aura_helpdesk_automation"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_helpdesk_automation_log" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "automationId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'SUCCESS',
  "message" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_helpdesk_automation_log_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "HelpdeskAutomationLog_tenant_auto_idx" ON "aura_helpdesk_automation_log"("tenantId", "automationId");

CREATE TABLE IF NOT EXISTS "aura_helpdesk_improvement" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "source" TEXT NOT NULL DEFAULT 'survey',
  "impact" TEXT NOT NULL DEFAULT 'Medium',
  "effort" TEXT NOT NULL DEFAULT 'Medium',
  "status" TEXT NOT NULL DEFAULT 'PLANNED',
  "feedbackQuote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_helpdesk_improvement_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "HelpdeskImprovement_tenantId_idx" ON "aura_helpdesk_improvement"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_helpdesk_ticket_comment" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "ticketId" TEXT NOT NULL,
  "authorId" TEXT,
  "authorName" TEXT,
  "commentType" TEXT NOT NULL DEFAULT 'public',
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_helpdesk_ticket_comment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "HelpdeskTicketComment_tenant_ticket_idx" ON "aura_helpdesk_ticket_comment"("tenantId", "ticketId");

CREATE TABLE IF NOT EXISTS "aura_helpdesk_canned_response" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "shortcut" TEXT,
  "content" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'general',
  "visibility" TEXT NOT NULL DEFAULT 'team',
  "usageCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_helpdesk_canned_response_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "HelpdeskCannedResponse_tenantId_idx" ON "aura_helpdesk_canned_response"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_helpdesk_escalation_matrix" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "levels" JSONB,
  "triggers" JSONB,
  "status" TEXT NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_helpdesk_escalation_matrix_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "HelpdeskEscalationMatrix_tenantId_idx" ON "aura_helpdesk_escalation_matrix"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_helpdesk_alert" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "alertType" TEXT NOT NULL DEFAULT 'sla_breach',
  "severity" TEXT NOT NULL DEFAULT 'medium',
  "title" TEXT NOT NULL,
  "message" TEXT,
  "relatedType" TEXT,
  "relatedId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'active',
  "acknowledgedBy" TEXT,
  "acknowledgedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  CONSTRAINT "aura_helpdesk_alert_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "HelpdeskAlert_tenantId_idx" ON "aura_helpdesk_alert"("tenantId");
