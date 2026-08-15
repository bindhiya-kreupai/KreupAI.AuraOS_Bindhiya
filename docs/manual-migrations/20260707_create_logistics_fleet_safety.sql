BEGIN;

CREATE TABLE IF NOT EXISTS auraos.aura_logistics_fleet_safety (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event TEXT NOT NULL,
  driver TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  severity TEXT NOT NULL,
  score INTEGER,
  trend TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMIT;