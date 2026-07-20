-- Clearance templates: reusable checklist of clearance items applied per exit.
CREATE TABLE IF NOT EXISTS "aura_clearance_template" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "department" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_clearance_template_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "aura_clearance_template_tenantId_idx" ON "aura_clearance_template"("tenantId");
