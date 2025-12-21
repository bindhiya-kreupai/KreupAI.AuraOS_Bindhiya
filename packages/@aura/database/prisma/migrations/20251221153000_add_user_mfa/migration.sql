-- Add User Multi-Factor Authentication (MFA) System
-- This migration creates the UserMFA table for storing user-specific MFA settings

-- Create UserMFA table
CREATE TABLE IF NOT EXISTS "UserMFA" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totpSecret" TEXT,
    "backupCodes" JSONB,
    "phoneNumber" TEXT,
    "method" TEXT NOT NULL DEFAULT 'totp',
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMFA_pkey" PRIMARY KEY ("id")
);

-- Create unique index on userId (one MFA config per user)
CREATE UNIQUE INDEX IF NOT EXISTS "UserMFA_userId_key" ON "UserMFA"("userId");

-- Create index for query performance
CREATE INDEX IF NOT EXISTS "UserMFA_userId_idx" ON "UserMFA"("userId");

-- Add foreign key constraint
ALTER TABLE "UserMFA" ADD CONSTRAINT "UserMFA_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
