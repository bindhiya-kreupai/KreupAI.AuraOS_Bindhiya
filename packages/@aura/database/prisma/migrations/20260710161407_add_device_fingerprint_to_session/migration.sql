-- Add deviceFingerprint column to UserSession model for device fingerprinting feature
-- This is a safe additive change — existing rows get NULL, no data loss.

ALTER TABLE "auraos"."aura_user_session" ADD COLUMN "deviceFingerprint" TEXT;
