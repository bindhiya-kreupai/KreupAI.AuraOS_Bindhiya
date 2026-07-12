BEGIN;

CREATE TABLE IF NOT EXISTS auraos.aura_automotive_part_stock (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  part TEXT NOT NULL,
  category TEXT NOT NULL,
  stock INTEGER NOT NULL,
  min_stock INTEGER NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auraos.aura_automotive_part_requisition (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  technician TEXT NOT NULL,
  bay TEXT NOT NULL,
  item TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMIT;