-- Create integration connection tables
-- This migration adds the IntegrationConnection, IntegrationSyncJob, and IntegrationLog models

-- Create aura_integration_connection table
CREATE TABLE "auraos"."aura_integration_connection" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "integrationName" TEXT NOT NULL,
    "provider" TEXT,
    "category" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "configuration" JSONB,
    "credentials" JSONB,
    "fieldMappings" JSONB,
    "syncEnabled" BOOLEAN NOT NULL DEFAULT false,
    "syncFrequency" TEXT,
    "lastSyncAt" TIMESTAMPTZ,
    "nextSyncAt" TIMESTAMPTZ,
    "connectedAt" TIMESTAMPTZ,
    "connectedBy" TEXT,
    "disconnectedAt" TIMESTAMPTZ,
    "disconnectedBy" TEXT,
    "healthStatus" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "lastHealthCheck" TIMESTAMPTZ,
    "errorMessage" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMPTZ,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "IntegrationConnection_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "IntegrationConnection_tenantId_integrationId_key" UNIQUE ("tenantId", "integrationId")
);

-- Indexes for aura_integration_connection
CREATE INDEX "IntegrationConnection_status_idx" ON "auraos"."aura_integration_connection" ("status");
CREATE INDEX "IntegrationConnection_tenantId_idx" ON "auraos"."aura_integration_connection" ("tenantId");
CREATE INDEX "IntegrationConnection_provider_idx" ON "auraos"."aura_integration_connection" ("provider");
CREATE INDEX "IntegrationConnection_isActive_idx" ON "auraos"."aura_integration_connection" ("isActive");

-- Create aura_integration_sync_job table
CREATE TABLE "auraos"."aura_integration_sync_job" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INCREMENTAL',
    "direction" TEXT NOT NULL DEFAULT 'BIDIRECTIONAL',
    "entity" TEXT NOT NULL,
    "action" TEXT,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "recordsProcessed" INTEGER NOT NULL DEFAULT 0,
    "recordsCreated" INTEGER NOT NULL DEFAULT 0,
    "recordsUpdated" INTEGER NOT NULL DEFAULT 0,
    "recordsFailed" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB,
    "scheduledAt" TIMESTAMPTZ,
    "startedAt" TIMESTAMPTZ,
    "completedAt" TIMESTAMPTZ,
    "duration" INTEGER,
    "triggeredBy" TEXT NOT NULL DEFAULT 'MANUAL',
    "triggeredByUser" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMPTZ,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "IntegrationSyncJob_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "IntegrationSyncJob_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "auraos"."aura_integration_connection"("id") ON DELETE CASCADE
);

-- Indexes for aura_integration_sync_job
CREATE INDEX "IntegrationSyncJob_status_idx" ON "auraos"."aura_integration_sync_job" ("status");
CREATE INDEX "IntegrationSyncJob_connectionId_idx" ON "auraos"."aura_integration_sync_job" ("connectionId");
CREATE INDEX "IntegrationSyncJob_tenantId_idx" ON "auraos"."aura_integration_sync_job" ("tenantId");

-- Create aura_integration_log table
CREATE TABLE "auraos"."aura_integration_log" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "requestHeaders" JSONB,
    "requestBody" TEXT,
    "statusCode" INTEGER NOT NULL,
    "responseHeaders" JSONB,
    "responseBody" TEXT,
    "responseTime" INTEGER NOT NULL,
    "action" TEXT,
    "entity" TEXT,
    "recordId" TEXT,
    "syncJobId" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMPTZ,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "IntegrationLog_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "IntegrationLog_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "auraos"."aura_integration_connection"("id") ON DELETE CASCADE
);

-- Indexes for aura_integration_log
CREATE INDEX "IntegrationLog_timestamp_idx" ON "auraos"."aura_integration_log" ("timestamp");
CREATE INDEX "IntegrationLog_connectionId_idx" ON "auraos"."aura_integration_log" ("connectionId");
CREATE INDEX "IntegrationLog_success_idx" ON "auraos"."aura_integration_log" ("success");
CREATE INDEX "IntegrationLog_tenantId_idx" ON "auraos"."aura_integration_log" ("tenantId");
