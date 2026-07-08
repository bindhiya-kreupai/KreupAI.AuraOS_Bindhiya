BEGIN;

CREATE TABLE IF NOT EXISTS auraos.aura_logistics_warehouse_staffing (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  shift TEXT NOT NULL,
  time TEXT NOT NULL,
  staff INTEGER NOT NULL,
  required INTEGER NOT NULL,
  status TEXT NOT NULL,
  productivity INTEGER,
  target INTEGER,
  role TEXT,
  schedule TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMIT;