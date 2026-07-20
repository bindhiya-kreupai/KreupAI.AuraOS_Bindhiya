-- Add budget fields to cost centers (defensive: safe on db-push shaped DBs)
ALTER TABLE "aura_cost_center" ADD COLUMN IF NOT EXISTS "fiscalYear" INTEGER;
ALTER TABLE "aura_cost_center" ADD COLUMN IF NOT EXISTS "allocatedBudget" DECIMAL(15,2) NOT NULL DEFAULT 0;
ALTER TABLE "aura_cost_center" ADD COLUMN IF NOT EXISTS "spentBudget" DECIMAL(15,2) NOT NULL DEFAULT 0;
