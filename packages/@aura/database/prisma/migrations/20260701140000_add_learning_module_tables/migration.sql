-- Learning module: external training, budgets, knowledge articles, training feedback.
-- Defensive CREATE TABLE IF NOT EXISTS (repo uses db-push; enums stored as TEXT).

CREATE TABLE IF NOT EXISTS "aura_external_training" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "provider" TEXT,
  "category" TEXT,
  "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3),
  "cost" DOUBLE PRECISION,
  "currency" TEXT NOT NULL DEFAULT 'AED',
  "status" TEXT NOT NULL DEFAULT 'pending',
  "certificateUrl" TEXT,
  "notes" TEXT,
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP(3),
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_external_training_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ExternalTraining_tenantId_idx" ON "aura_external_training"("tenantId");
CREATE INDEX IF NOT EXISTS "ExternalTraining_employeeId_idx" ON "aura_external_training"("employeeId");
CREATE INDEX IF NOT EXISTS "ExternalTraining_status_idx" ON "aura_external_training"("status");

CREATE TABLE IF NOT EXISTS "aura_training_budget" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "fiscalYear" TEXT NOT NULL,
  "departmentId" TEXT,
  "departmentName" TEXT,
  "allocated" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "spent" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "committed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'AED',
  "notes" TEXT,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_training_budget_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "TrainingBudget_tenantId_idx" ON "aura_training_budget"("tenantId");
CREATE INDEX IF NOT EXISTS "TrainingBudget_fiscalYear_idx" ON "aura_training_budget"("fiscalYear");

CREATE TABLE IF NOT EXISTS "aura_knowledge_article" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "summary" TEXT,
  "categoryId" TEXT,
  "category" TEXT,
  "tags" TEXT[],
  "authorId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'published',
  "viewCount" INTEGER NOT NULL DEFAULT 0,
  "likeCount" INTEGER NOT NULL DEFAULT 0,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_knowledge_article_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "KnowledgeArticle_tenantId_idx" ON "aura_knowledge_article"("tenantId");
CREATE INDEX IF NOT EXISTS "KnowledgeArticle_categoryId_idx" ON "aura_knowledge_article"("categoryId");

CREATE TABLE IF NOT EXISTS "aura_training_feedback" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "courseId" TEXT,
  "sessionId" TEXT,
  "learnerId" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "comments" TEXT,
  "wouldRecommend" BOOLEAN,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_training_feedback_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "TrainingFeedback_tenantId_idx" ON "aura_training_feedback"("tenantId");
CREATE INDEX IF NOT EXISTS "TrainingFeedback_courseId_idx" ON "aura_training_feedback"("courseId");
CREATE INDEX IF NOT EXISTS "TrainingFeedback_learnerId_idx" ON "aura_training_feedback"("learnerId");
