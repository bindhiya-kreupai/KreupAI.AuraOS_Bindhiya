CREATE TABLE "aura_onboarding_guidance_content" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "contentKey" TEXT NOT NULL,
  "countryCode" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "title" TEXT NOT NULL,
  "introduction" TEXT NOT NULL,
  "objectives" JSONB NOT NULL,
  "keyTakeaways" JSONB NOT NULL,
  "obligations" JSONB,
  "publishedAt" TIMESTAMP(3),
  "archivedAt" TIMESTAMP(3),
  "createdBy" TEXT NOT NULL,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "aura_onboarding_guidance_content_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "aura_onboarding_guidance_view_log" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "contentId" TEXT NOT NULL,
  "contentKey" TEXT NOT NULL,
  "countryCode" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "onboardingCaseId" TEXT,
  "userId" TEXT,
  "stage" TEXT,
  "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_onboarding_guidance_view_log_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "aura_onboarding_guidance_content_tenantId_contentKey_countryCode_version_key" ON "aura_onboarding_guidance_content"("tenantId", "contentKey", "countryCode", "version");
CREATE INDEX "aura_onboarding_guidance_content_tenantId_idx" ON "aura_onboarding_guidance_content"("tenantId");
CREATE INDEX "aura_onboarding_guidance_content_contentKey_idx" ON "aura_onboarding_guidance_content"("contentKey");
CREATE INDEX "aura_onboarding_guidance_content_countryCode_idx" ON "aura_onboarding_guidance_content"("countryCode");
CREATE INDEX "aura_onboarding_guidance_content_status_idx" ON "aura_onboarding_guidance_content"("status");

CREATE INDEX "aura_onboarding_guidance_view_log_tenantId_idx" ON "aura_onboarding_guidance_view_log"("tenantId");
CREATE INDEX "aura_onboarding_guidance_view_log_contentId_idx" ON "aura_onboarding_guidance_view_log"("contentId");
CREATE INDEX "aura_onboarding_guidance_view_log_contentKey_idx" ON "aura_onboarding_guidance_view_log"("contentKey");
CREATE INDEX "aura_onboarding_guidance_view_log_countryCode_idx" ON "aura_onboarding_guidance_view_log"("countryCode");
CREATE INDEX "aura_onboarding_guidance_view_log_onboardingCaseId_idx" ON "aura_onboarding_guidance_view_log"("onboardingCaseId");
CREATE INDEX "aura_onboarding_guidance_view_log_userId_idx" ON "aura_onboarding_guidance_view_log"("userId");
