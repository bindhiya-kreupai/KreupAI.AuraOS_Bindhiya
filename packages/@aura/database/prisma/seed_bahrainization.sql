-- =========================================================================
-- ENTERPRISE BAHRAINIZATION COMPLIANCE SEED SCRIPT
-- =========================================================================
-- Target Tenant: KREUP_AI
-- Purpose: Seed high-fidelity Bahrainization compliance targets, configs,
--          hires, SIO/wage evidence, and snapshot history.
-- Safe to rerun: Clears existing Bahrainization data for KREUP_AI before seeding
-- =========================================================================

BEGIN;

SET search_path TO auraos, public;

-- 1. RESOLVE DYNAMIC VARIABLES (TENANT & COMPANY & AUDIT USER)
CREATE TEMP TABLE vars AS
SELECT 
  COALESCE((SELECT id FROM aura_tenant WHERE code = 'KREUP_AI' LIMIT 1), 'ae63d8ef-d01d-49a7-a542-b1256702765d') AS tenant_id,
  COALESCE((SELECT id FROM aura_user WHERE email LIKE '%kreup%' LIMIT 1), 'system_manager') AS user_id;

-- 2. CLEANUP PREVIOUS SEED DATA
DELETE FROM aura_bahrainization_snapshot WHERE "tenantId" = (SELECT tenant_id FROM vars);
DELETE FROM aura_bahrainization_certificate WHERE "tenantId" = (SELECT tenant_id FROM vars);
DELETE FROM aura_bahrainization_hire WHERE "tenantId" = (SELECT tenant_id FROM vars);
DELETE FROM aura_bahrainization_config WHERE "tenantId" = (SELECT tenant_id FROM vars);
DELETE FROM aura_bahrainization_target WHERE "tenantId" = (SELECT tenant_id FROM vars);

-- 3. CREATE TEMPORARY TABLES FOR MASTER RELATIONSHIPS
CREATE TEMP TABLE temp_companies AS
SELECT id AS company_id, name AS company_name, code AS company_code
FROM aura_company
WHERE "tenantId" = (SELECT tenant_id FROM vars) AND "isDeleted" = false;

-- 4. SEED DEFALT TARGETS (with effective dating)
-- Historical Targets (2024-01-01 to 2025-12-31)
INSERT INTO aura_bahrainization_target (
  id, "tenantId", sector, "sizeBracket", "targetRatioPct", "tenderEligibilityMinPct",
  "effectiveFrom", "effectiveTo", status, basis, "createdAt", "updatedAt", "isDeleted"
)
SELECT 
  gen_random_uuid(), (SELECT tenant_id FROM vars), s.sector, sz.size_bracket, 
  -- Historical was 1-2pp lower
  CASE 
    WHEN s.sector = 'PRIVATE' THEN 
      CASE 
        WHEN sz.size_bracket = 'SMALL' THEN 8.00
        WHEN sz.size_bracket = 'MEDIUM' THEN 13.00
        WHEN sz.size_bracket = 'LARGE' THEN 18.00
        ELSE 23.00
      END
    WHEN s.sector = 'PUBLIC' THEN 45.00
    WHEN s.sector = 'SEMI_GOVT' THEN 25.00
    ELSE 75.00
  END,
  CASE WHEN s.sector = 'MINISTRY' THEN 75.00 ELSE 50.00 END,
  '2024-01-01 00:00:00'::timestamp, '2025-12-31 23:59:59'::timestamp, 'ARCHIVED',
  'Historical LMRA targets for ' || s.sector || ' sector', NOW(), NOW(), false
FROM 
  (SELECT unnest(ARRAY['PRIVATE', 'PUBLIC', 'SEMI_GOVT', 'MINISTRY']) AS sector) s,
  (SELECT unnest(ARRAY['SMALL', 'MEDIUM', 'LARGE', 'GIANT']) AS size_bracket) sz;

-- Current Targets (2026-01-01 to 2026-12-31)
INSERT INTO aura_bahrainization_target (
  id, "tenantId", sector, "sizeBracket", "targetRatioPct", "tenderEligibilityMinPct",
  "effectiveFrom", "effectiveTo", status, basis, "createdAt", "updatedAt", "isDeleted"
)
SELECT 
  gen_random_uuid(), (SELECT tenant_id FROM vars), s.sector, sz.size_bracket, 
  CASE 
    WHEN s.sector = 'PRIVATE' THEN 
      CASE 
        WHEN sz.size_bracket = 'SMALL' THEN 10.00
        WHEN sz.size_bracket = 'MEDIUM' THEN 15.00
        WHEN sz.size_bracket = 'LARGE' THEN 20.00
        ELSE 25.00
      END
    WHEN s.sector = 'PUBLIC' THEN 50.00
    WHEN s.sector = 'SEMI_GOVT' THEN 30.00
    ELSE 80.00
  END,
  CASE WHEN s.sector = 'MINISTRY' THEN 80.00 ELSE 50.00 END,
  '2026-01-01 00:00:00'::timestamp, '2026-12-31 23:59:59'::timestamp, 'ACTIVE',
  'Current baseline target under Bahrain Nationalization Compliance framework', NOW(), NOW(), false
FROM 
  (SELECT unnest(ARRAY['PRIVATE', 'PUBLIC', 'SEMI_GOVT', 'MINISTRY']) AS sector) s,
  (SELECT unnest(ARRAY['SMALL', 'MEDIUM', 'LARGE', 'GIANT']) AS size_bracket) sz;

-- Planned Future Targets (2027-01-01 onwards)
INSERT INTO aura_bahrainization_target (
  id, "tenantId", sector, "sizeBracket", "targetRatioPct", "tenderEligibilityMinPct",
  "effectiveFrom", "effectiveTo", status, basis, "createdAt", "updatedAt", "isDeleted"
)
SELECT 
  gen_random_uuid(), (SELECT tenant_id FROM vars), s.sector, sz.size_bracket, 
  -- Planned 2pp increase
  CASE 
    WHEN s.sector = 'PRIVATE' THEN 
      CASE 
        WHEN sz.size_bracket = 'SMALL' THEN 12.00
        WHEN sz.size_bracket = 'MEDIUM' THEN 17.00
        WHEN sz.size_bracket = 'LARGE' THEN 22.00
        ELSE 27.00
      END
    WHEN s.sector = 'PUBLIC' THEN 55.00
    WHEN s.sector = 'SEMI_GOVT' THEN 35.00
    ELSE 85.00
  END,
  CASE WHEN s.sector = 'MINISTRY' THEN 85.00 ELSE 50.00 END,
  '2027-01-01 00:00:00'::timestamp, NULL, 'ACTIVE',
  'Planned escalation of nationalization ratio per sector', NOW(), NOW(), false
FROM 
  (SELECT unnest(ARRAY['PRIVATE', 'PUBLIC', 'SEMI_GOVT', 'MINISTRY']) AS sector) s,
  (SELECT unnest(ARRAY['SMALL', 'MEDIUM', 'LARGE', 'GIANT']) AS size_bracket) sz;


-- 5. SEED CONFIGURATIONS (Establishment Scope)
-- Company linked configs (7 companies)
INSERT INTO aura_bahrainization_config (
  id, "tenantId", "legalEntityId", "establishmentName", sector, "sizeBracket", 
  "bahrainiHeadcount", "totalHeadcount", "lmraEstablishmentId", "isInScope", 
  "isGovernmentTenderEligible", "createdAt", "updatedAt", "createdBy", "updatedBy", "isDeleted"
)
SELECT 
  gen_random_uuid(),
  (SELECT tenant_id FROM vars),
  c.company_id,
  c.company_name,
  CASE 
    WHEN c.company_code = 'KREUP_GLOBAL' THEN 'PRIVATE'
    WHEN c.company_code = 'KREUP_INDIA' THEN 'PRIVATE'
    WHEN c.company_code = 'MS' THEN 'PRIVATE'
    WHEN c.company_code = 'AMZ-1' THEN 'PRIVATE'
    WHEN c.company_code = 'AOS' THEN 'PRIVATE'
    WHEN c.company_code = 'SRFB' THEN 'PUBLIC'
    ELSE 'SEMI_GOVT'
  END,
  CASE 
    WHEN c.company_code = 'KREUP_GLOBAL' THEN 'LARGE'
    WHEN c.company_code = 'KREUP_INDIA' THEN 'GIANT'
    WHEN c.company_code = 'MS' THEN 'MEDIUM'
    WHEN c.company_code = 'AMZ-1' THEN 'LARGE'
    WHEN c.company_code = 'AOS' THEN 'SMALL'
    WHEN c.company_code = 'SRFB' THEN 'MEDIUM'
    ELSE 'LARGE'
  END,
  CASE 
    WHEN c.company_code = 'KREUP_GLOBAL' THEN 110
    WHEN c.company_code = 'KREUP_INDIA' THEN 0
    WHEN c.company_code = 'MS' THEN 14
    WHEN c.company_code = 'AMZ-1' THEN 22
    WHEN c.company_code = 'AOS' THEN 1
    WHEN c.company_code = 'SRFB' THEN 55
    ELSE 25
  END,
  CASE 
    WHEN c.company_code = 'KREUP_GLOBAL' THEN 500
    WHEN c.company_code = 'KREUP_INDIA' THEN 2000
    WHEN c.company_code = 'MS' THEN 80
    WHEN c.company_code = 'AMZ-1' THEN 150
    WHEN c.company_code = 'AOS' THEN 12
    WHEN c.company_code = 'SRFB' THEN 90
    ELSE 120
  END,
  'LMRA-' || c.company_code || '-123',
  true,
  CASE 
    WHEN c.company_code = 'SRFB' THEN true 
    ELSE false
  END,
  NOW(),
  NOW(),
  (SELECT user_id FROM vars),
  (SELECT user_id FROM vars),
  false
FROM temp_companies c;

-- 13 Standalone Branch Configurations (legalEntityId = NULL)
INSERT INTO aura_bahrainization_config (
  id, "tenantId", "legalEntityId", "establishmentName", sector, "sizeBracket", 
  "bahrainiHeadcount", "totalHeadcount", "lmraEstablishmentId", "isInScope", 
  "isGovernmentTenderEligible", "createdAt", "updatedAt", "createdBy", "updatedBy", "isDeleted"
)
VALUES
  (gen_random_uuid(), (SELECT tenant_id FROM vars), NULL, 'KreupAI Bahrain Branch (Finance)', 'PRIVATE', 'SMALL', 3, 20, 'LMRA-KBB-FIN-01', true, false, NOW(), NOW(), 'system', 'system', false),
  (gen_random_uuid(), (SELECT tenant_id FROM vars), NULL, 'KreupAI Bahrain Branch (Sales)', 'PRIVATE', 'SMALL', 1, 15, 'LMRA-KBB-SAL-02', true, false, NOW(), NOW(), 'system', 'system', false),
  (gen_random_uuid(), (SELECT tenant_id FROM vars), NULL, 'AuraOS Bahrain Tech Hub', 'PRIVATE', 'MEDIUM', 16, 95, 'LMRA-AOS-TECH-03', true, false, NOW(), NOW(), 'system', 'system', false),
  (gen_random_uuid(), (SELECT tenant_id FROM vars), NULL, 'Al-Manama Digital Operations', 'PRIVATE', 'MEDIUM', 15, 100, 'LMRA-AMDO-04', true, false, NOW(), NOW(), 'system', 'system', false),
  (gen_random_uuid(), (SELECT tenant_id FROM vars), NULL, 'Muharraq HR Services', 'PRIVATE', 'SMALL', 2, 10, 'LMRA-MHRS-05', true, false, NOW(), NOW(), 'system', 'system', false),
  (gen_random_uuid(), (SELECT tenant_id FROM vars), NULL, 'Riffa Consulting Establishment', 'PRIVATE', 'SMALL', 4, 30, 'LMRA-RCE-06', true, false, NOW(), NOW(), 'system', 'system', false),
  (gen_random_uuid(), (SELECT tenant_id FROM vars), NULL, 'Isa Town Support Centre', 'PRIVATE', 'SMALL', 3, 25, 'LMRA-ITSC-07', true, false, NOW(), NOW(), 'system', 'system', false),
  (gen_random_uuid(), (SELECT tenant_id FROM vars), NULL, 'Sitra Engineering Group', 'PRIVATE', 'LARGE', 42, 200, 'LMRA-SEG-08', true, false, NOW(), NOW(), 'system', 'system', false),
  (gen_random_uuid(), (SELECT tenant_id FROM vars), NULL, 'Hidd Logistical Base', 'PRIVATE', 'LARGE', 35, 180, 'LMRA-HLB-09', true, false, NOW(), NOW(), 'system', 'system', false),
  (gen_random_uuid(), (SELECT tenant_id FROM vars), NULL, 'KreupAI Ministries Support Unit', 'MINISTRY', 'MEDIUM', 65, 80, 'LMRA-KMSU-10', true, true, NOW(), NOW(), 'system', 'system', false),
  (gen_random_uuid(), (SELECT tenant_id FROM vars), NULL, 'Bahrain National Operations', 'SEMI_GOVT', 'LARGE', 40, 110, 'LMRA-BNO-11', true, false, NOW(), NOW(), 'system', 'system', false),
  (gen_random_uuid(), (SELECT tenant_id FROM vars), NULL, 'KreupAI Public Sector Division', 'PUBLIC', 'MEDIUM', 52, 100, 'LMRA-KPSD-12', true, true, NOW(), NOW(), 'system', 'system', false),
  (gen_random_uuid(), (SELECT tenant_id FROM vars), NULL, 'KreupAI Logistics WLL', 'PRIVATE', 'GIANT', 180, 800, 'LMRA-KLW-13', true, false, NOW(), NOW(), 'system', 'system', false);


-- 6. SEED BAHRAINI HIRES REGISTER
-- Discovers existing active employees and records them in hires table
INSERT INTO aura_bahrainization_hire (
  id, "tenantId", "legalEntityId", "employeeId", "hireDate", "jobLevel", 
  "isBahraini", "cprNumber", "sioRegistered", "wageEvidenceLinked", 
  "tamkeenSupported", "artificialRiskScore", "artificialRiskFlags", 
  "createdAt", "updatedAt", "createdBy", "updatedBy", "isDeleted"
)
SELECT 
  gen_random_uuid(),
  (SELECT tenant_id FROM vars),
  e."companyId",
  e.id,
  e."joiningDate",
  CASE 
    WHEN (row_number() OVER ()) % 4 = 0 THEN 'SENIOR_MANAGER'
    WHEN (row_number() OVER ()) % 4 = 1 THEN 'MANAGER'
    WHEN (row_number() OVER ()) % 4 = 2 THEN 'SPECIALIST'
    ELSE 'ASSOCIATE'
  END,
  -- Every 2nd employee is marked as Bahraini
  CASE WHEN (row_number() OVER ()) % 2 = 0 THEN true ELSE false END,
  -- Generate 9-digit CPR number
  '9901' || LPAD(CAST((row_number() OVER ()) AS text), 5, '0'),
  -- SIO registration (mostly true for Bahrainis, false for others)
  CASE WHEN (row_number() OVER ()) % 2 = 0 AND (row_number() OVER ()) % 3 != 0 THEN true ELSE false END,
  -- Wage evidence (mostly true for Bahrainis, false for others)
  CASE WHEN (row_number() OVER ()) % 2 = 0 AND (row_number() OVER ()) % 4 != 0 THEN true ELSE false END,
  -- Tamkeen support (some Bahrainis)
  CASE WHEN (row_number() OVER ()) % 2 = 0 AND (row_number() OVER ()) % 5 = 0 THEN true ELSE false END,
  0,
  '[]'::jsonb,
  NOW(),
  NOW(),
  (SELECT user_id FROM vars),
  (SELECT user_id FROM vars),
  false
FROM aura_employee e
WHERE e."companyId" IN (SELECT company_id FROM temp_companies);

-- Update risk scores and flags for realistic distribution
UPDATE aura_bahrainization_hire
SET 
  "artificialRiskScore" = CASE
    WHEN "isBahraini" = false THEN 0
    WHEN "sioRegistered" = true AND "wageEvidenceLinked" = true AND "tamkeenSupported" = true THEN 5
    WHEN "sioRegistered" = true AND "wageEvidenceLinked" = true THEN 15
    WHEN "sioRegistered" = true AND "wageEvidenceLinked" = false THEN 80
    WHEN "sioRegistered" = false AND "wageEvidenceLinked" = true THEN 75
    ELSE 95
  END,
  "artificialRiskFlags" = CASE
    WHEN "isBahraini" = false THEN '[]'::jsonb
    WHEN "sioRegistered" = true AND "wageEvidenceLinked" = true THEN '[]'::jsonb
    WHEN "sioRegistered" = true AND "wageEvidenceLinked" = false THEN '["MISSING_PAYROLL_EVIDENCE"]'::jsonb
    WHEN "sioRegistered" = false AND "wageEvidenceLinked" = true THEN '["SIO_NOT_REGISTERED"]'::jsonb
    ELSE '["SIO_NOT_REGISTERED", "MISSING_PAYROLL_EVIDENCE"]'::jsonb
  END
WHERE "tenantId" = (SELECT tenant_id FROM vars);


-- 7. SEED SNAPSHOTS (Time-series data for trend charts)
-- Generates last 12 months snapshot dates
CREATE TEMP TABLE temp_months AS
SELECT (date_trunc('month', d) + interval '1 month - 1 day')::date AS snapshot_date
FROM generate_series('2025-08-01'::date, '2026-07-01'::date, '1 month'::interval) d;

INSERT INTO aura_bahrainization_snapshot (
  id, "tenantId", "legalEntityId", "snapshotDate", "bahrainiHeadcount", "totalHeadcount",
  "ratioPct", "targetRatioPct", "gapPct", "ragStatus", "missedHires", "lmraGated",
  "tenderEligible", "evidenceJson", "createdAt", "updatedAt", "createdBy", "updatedBy", "isDeleted"
)
SELECT 
  gen_random_uuid(),
  cfg."tenantId",
  cfg."legalEntityId",
  m.snapshot_date::timestamp,
  -- Bahraini headcount fluctuates slightly by month
  GREATEST(1, cfg."bahrainiHeadcount" + CAST(extract(month from m.snapshot_date) AS int) % 3 - 1),
  -- Total headcount fluctuates slightly by month
  GREATEST(5, cfg."totalHeadcount" + CAST(extract(month from m.snapshot_date) AS int) * 2 - 12),
  0.0, 0.0, 0.0, 'RED', 0, false, false,
  '{}'::jsonb,
  NOW(), NOW(),
  (SELECT user_id FROM vars),
  (SELECT user_id FROM vars),
  false
FROM aura_bahrainization_config cfg
CROSS JOIN temp_months m
WHERE cfg."tenantId" = (SELECT tenant_id FROM vars);

-- Update snapshots target percentages using config fields
UPDATE aura_bahrainization_snapshot s
SET
  "targetRatioPct" = CASE 
    WHEN c.sector = 'PUBLIC' THEN 50.0
    WHEN c.sector = 'SEMI_GOVT' THEN 30.0
    WHEN c.sector = 'MINISTRY' THEN 80.0
    ELSE 
      CASE 
        WHEN c."sizeBracket" = 'SMALL' THEN 10.0
        WHEN c."sizeBracket" = 'MEDIUM' THEN 15.0
        WHEN c."sizeBracket" = 'LARGE' THEN 20.0
        ELSE 25.0
      END
  END
FROM aura_bahrainization_config c
WHERE (s."legalEntityId" = c."legalEntityId" OR (s."legalEntityId" IS NULL AND c."legalEntityId" IS NULL))
  AND s."tenantId" = (SELECT tenant_id FROM vars)
  AND c."tenantId" = (SELECT tenant_id FROM vars);

-- Calculate snapshot ratios, gaps, RAG, and gating reasons
UPDATE aura_bahrainization_snapshot
SET
  "ratioPct" = ROUND(("bahrainiHeadcount"::decimal / "totalHeadcount") * 100, 2),
  "evidenceJson" = jsonb_build_object(
    'sioCount', "bahrainiHeadcount",
    'payrollCount', "bahrainiHeadcount" - 1,
    'tamkeenCount', CEIL("bahrainiHeadcount" * 0.3)
  )
WHERE "tenantId" = (SELECT tenant_id FROM vars);

UPDATE aura_bahrainization_snapshot
SET
  "gapPct" = "ratioPct" - "targetRatioPct",
  "ragStatus" = CASE 
    WHEN ("ratioPct" - "targetRatioPct") >= 0 THEN 'GREEN'
    WHEN ("ratioPct" - "targetRatioPct") >= -2.0 THEN 'AMBER'
    ELSE 'RED'
  END,
  "missedHires" = CASE 
    WHEN ("ratioPct" - "targetRatioPct") < 0 THEN CEIL(("targetRatioPct" * "totalHeadcount" / 100.0) - "bahrainiHeadcount")
    ELSE 0
  END,
  "lmraGated" = CASE WHEN ("ratioPct" - "targetRatioPct") < -2.0 THEN true ELSE false END,
  "tenderEligible" = CASE WHEN "ratioPct" >= 50.0 THEN true ELSE false END
WHERE "tenantId" = (SELECT tenant_id FROM vars);


-- 8. SEED MONTHLY CERTIFICATES
-- Add draft/signed certificates for the last 7 periods
INSERT INTO aura_bahrainization_certificate (
  id, "tenantId", period, status, "entitiesInScope", "entitiesAtTarget", 
  "entitiesLmraGated", "entitiesTenderEligible", "totalMissedHires", 
  "artificialRiskCount", "gatingReason", "attestationsJson", 
  "generatedAt", "signedAt", "signedBy", "createdAt", "updatedAt", "createdBy", "updatedBy", "isDeleted"
)
VALUES
  (
    gen_random_uuid(), (SELECT tenant_id FROM vars), '2026-01', 'SIGNED',
    20, 14, 2, 3, 15, 2, NULL,
    '[{"field":"bahrainization_data_accurate","value":"ATTESTED"},{"field":"no_ghost_employees","value":"ATTESTED"},{"field":"sio_registered_verified","value":"ATTESTED"},{"field":"wages_paid_verified","value":"ATTESTED"},{"field":"lmra_compliance_confirmed","value":"ATTESTED"}]'::jsonb,
    '2026-01-31 09:00:00'::timestamp, '2026-01-31 16:30:00'::timestamp, 'System Admin', '2026-01-31 09:00:00'::timestamp, NOW(), 'system', 'system', false
  ),
  (
    gen_random_uuid(), (SELECT tenant_id FROM vars), '2026-02', 'SIGNED',
    20, 15, 1, 3, 11, 1, NULL,
    '[{"field":"bahrainization_data_accurate","value":"ATTESTED"},{"field":"no_ghost_employees","value":"ATTESTED"},{"field":"sio_registered_verified","value":"ATTESTED"},{"field":"wages_paid_verified","value":"ATTESTED"},{"field":"lmra_compliance_confirmed","value":"ATTESTED"}]'::jsonb,
    '2026-02-28 09:00:00'::timestamp, '2026-02-28 15:45:00'::timestamp, 'System Admin', '2026-02-28 09:00:00'::timestamp, NOW(), 'system', 'system', false
  ),
  (
    gen_random_uuid(), (SELECT tenant_id FROM vars), '2026-03', 'SIGNED',
    20, 16, 1, 4, 8, 1, NULL,
    '[{"field":"bahrainization_data_accurate","value":"ATTESTED"},{"field":"no_ghost_employees","value":"ATTESTED"},{"field":"sio_registered_verified","value":"ATTESTED"},{"field":"wages_paid_verified","value":"ATTESTED"},{"field":"lmra_compliance_confirmed","value":"ATTESTED"}]'::jsonb,
    '2026-03-31 09:00:00'::timestamp, '2026-03-31 17:15:00'::timestamp, 'System Admin', '2026-03-31 09:00:00'::timestamp, NOW(), 'system', 'system', false
  ),
  (
    gen_random_uuid(), (SELECT tenant_id FROM vars), '2026-04', 'SIGNED',
    20, 16, 1, 4, 9, 2, NULL,
    '[{"field":"bahrainization_data_accurate","value":"ATTESTED"},{"field":"no_ghost_employees","value":"ATTESTED"},{"field":"sio_registered_verified","value":"ATTESTED"},{"field":"wages_paid_verified","value":"ATTESTED"},{"field":"lmra_compliance_confirmed","value":"ATTESTED"}]'::jsonb,
    '2026-04-30 09:00:00'::timestamp, '2026-04-30 16:10:00'::timestamp, 'System Admin', '2026-04-30 09:00:00'::timestamp, NOW(), 'system', 'system', false
  ),
  (
    gen_random_uuid(), (SELECT tenant_id FROM vars), '2026-05', 'SIGNED',
    20, 18, 0, 5, 2, 0, NULL,
    '[{"field":"bahrainization_data_accurate","value":"ATTESTED"},{"field":"no_ghost_employees","value":"ATTESTED"},{"field":"sio_registered_verified","value":"ATTESTED"},{"field":"wages_paid_verified","value":"ATTESTED"},{"field":"lmra_compliance_confirmed","value":"ATTESTED"}]'::jsonb,
    '2026-05-31 09:00:00'::timestamp, '2026-05-31 16:20:00'::timestamp, 'System Admin', '2026-05-31 09:00:00'::timestamp, NOW(), 'system', 'system', false
  ),
  (
    gen_random_uuid(), (SELECT tenant_id FROM vars), '2026-06', 'DRAFT',
    20, 18, 0, 5, 3, 1, NULL,
    '[]'::jsonb,
    '2026-06-30 09:00:00'::timestamp, NULL, NULL, '2026-06-30 09:00:00'::timestamp, NOW(), 'system', 'system', false
  ),
  (
    gen_random_uuid(), (SELECT tenant_id FROM vars), '2026-07', 'DRAFT',
    20, 16, 2, 3, 14, 3, 'Establishments under tenant are LMRA-gated due to compliance deficit.',
    '[]'::jsonb,
    '2026-07-05 18:00:00'::timestamp, NULL, NULL, '2026-07-05 18:00:00'::timestamp, NOW(), 'system', 'system', false
  );

COMMIT;
