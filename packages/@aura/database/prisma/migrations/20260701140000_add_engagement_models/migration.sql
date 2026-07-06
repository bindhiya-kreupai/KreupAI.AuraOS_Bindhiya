-- Engagement module additional domain models (AURA-095..104).
-- Defensive CREATE TABLE IF NOT EXISTS; repo uses db-push, enums stored as TEXT.

CREATE TABLE IF NOT EXISTS "aura_engagement_survey_response" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "surveyId" TEXT NOT NULL,
  "respondentId" TEXT NOT NULL,
  "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
  "answers" JSONB NOT NULL,
  "sentiment" INTEGER,
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_engagement_survey_response_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "aura_engagement_survey_response_tenantId_idx" ON "aura_engagement_survey_response"("tenantId");
CREATE INDEX IF NOT EXISTS "aura_engagement_survey_response_surveyId_idx" ON "aura_engagement_survey_response"("surveyId");

CREATE TABLE IF NOT EXISTS "aura_engagement_rsvp" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'GOING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_engagement_rsvp_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "aura_engagement_rsvp_eventId_employeeId_key" ON "aura_engagement_rsvp"("eventId", "employeeId");
CREATE INDEX IF NOT EXISTS "aura_engagement_rsvp_tenantId_idx" ON "aura_engagement_rsvp"("tenantId");
CREATE INDEX IF NOT EXISTS "aura_engagement_rsvp_eventId_idx" ON "aura_engagement_rsvp"("eventId");

CREATE TABLE IF NOT EXISTS "aura_engagement_idea" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL DEFAULT 'OTHER',
  "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
  "submittedBy" TEXT NOT NULL,
  "authorName" TEXT,
  "department" TEXT,
  "voteCount" INTEGER NOT NULL DEFAULT 0,
  "commentCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_engagement_idea_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "aura_engagement_idea_tenantId_idx" ON "aura_engagement_idea"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_engagement_idea_vote" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "ideaId" TEXT NOT NULL,
  "voterId" TEXT NOT NULL,
  "voteType" TEXT NOT NULL DEFAULT 'up',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_engagement_idea_vote_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "aura_engagement_idea_vote_ideaId_voterId_key" ON "aura_engagement_idea_vote"("ideaId", "voterId");
CREATE INDEX IF NOT EXISTS "aura_engagement_idea_vote_tenantId_idx" ON "aura_engagement_idea_vote"("tenantId");
CREATE INDEX IF NOT EXISTS "aura_engagement_idea_vote_ideaId_idx" ON "aura_engagement_idea_vote"("ideaId");

CREATE TABLE IF NOT EXISTS "aura_engagement_csr_activity" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "cause" TEXT NOT NULL DEFAULT 'COMMUNITY',
  "activityType" TEXT NOT NULL DEFAULT 'VOLUNTEERING',
  "status" TEXT NOT NULL DEFAULT 'PLANNED',
  "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3),
  "location" TEXT,
  "volunteerSlots" INTEGER,
  "volunteersRegistered" INTEGER NOT NULL DEFAULT 0,
  "volunteerHours" INTEGER NOT NULL DEFAULT 0,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_engagement_csr_activity_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "aura_engagement_csr_activity_tenantId_idx" ON "aura_engagement_csr_activity"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_engagement_newsletter" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "excerpt" TEXT,
  "content" TEXT,
  "category" TEXT,
  "editionNumber" INTEGER NOT NULL DEFAULT 1,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "publishDate" TIMESTAMP(3),
  "coverImageUrl" TEXT,
  "editorId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_engagement_newsletter_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "aura_engagement_newsletter_tenantId_idx" ON "aura_engagement_newsletter"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_engagement_classified" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL DEFAULT 'OTHER',
  "price" DOUBLE PRECISION,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "condition" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "sellerId" TEXT NOT NULL,
  "sellerName" TEXT,
  "imageUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "aura_engagement_classified_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "aura_engagement_classified_tenantId_idx" ON "aura_engagement_classified"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_engagement_reward" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL DEFAULT 'MERCHANDISE',
  "pointsCost" INTEGER NOT NULL DEFAULT 0,
  "stock" INTEGER,
  "imageUrl" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_engagement_reward_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "aura_engagement_reward_tenantId_idx" ON "aura_engagement_reward"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_engagement_reward_redemption" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "rewardId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "pointsCost" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_engagement_reward_redemption_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "aura_engagement_reward_redemption_tenantId_idx" ON "aura_engagement_reward_redemption"("tenantId");
CREATE INDEX IF NOT EXISTS "aura_engagement_reward_redemption_employeeId_idx" ON "aura_engagement_reward_redemption"("employeeId");

CREATE TABLE IF NOT EXISTS "aura_engagement_referral" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "referrerId" TEXT NOT NULL,
  "candidateName" TEXT NOT NULL,
  "candidateEmail" TEXT,
  "role" TEXT,
  "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
  "bonusAmount" DOUBLE PRECISION,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "referralCode" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aura_engagement_referral_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "aura_engagement_referral_tenantId_idx" ON "aura_engagement_referral"("tenantId");
CREATE INDEX IF NOT EXISTS "aura_engagement_referral_referrerId_idx" ON "aura_engagement_referral"("referrerId");
