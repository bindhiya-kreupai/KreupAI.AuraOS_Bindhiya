BEGIN;

CREATE TABLE IF NOT EXISTS auraos.aura_automotive_sales_commission (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  rank INTEGER NOT NULL,
  salesperson TEXT NOT NULL,
  units_sold INTEGER NOT NULL,
  gross_profit INTEGER NOT NULL,
  commission INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMIT;