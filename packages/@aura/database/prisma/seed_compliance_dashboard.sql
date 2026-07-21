-- =========================================================================
-- ENTERPRISE COMPLIANCE RISK HEATMAP & EXECUTIVE DASHBOARD SEED SCRIPT
-- =========================================================================
-- Target Tenant: KREUP_AI
-- Purpose: Seed high-fidelity compliance risk records (300-600) and CAPAs
--          cleanly distributed across GCC countries, domains, and depts.
-- Safe to rerun: Idempotent and transaction-wrapped.
-- =========================================================================

SET search_path TO auraos, public;

-- STATEMENT

-- 1. RESOLVE DYNAMIC VARIABLES (TENANT & COMPLIANCE OWNER)
CREATE TEMP TABLE vars AS
SELECT 
  COALESCE((SELECT id FROM aura_tenant WHERE code = 'KREUP_AI' LIMIT 1), 'ae63d8ef-d01d-49a7-a542-b1256702765d') AS tenant_id,
  COALESCE((SELECT id FROM aura_user WHERE email LIKE '%kreup%' OR email LIKE '%admin%' LIMIT 1), 'USR-002') AS user_id;

-- STATEMENT

-- 2. CLEANUP PREVIOUS SEED DATA FOR COMPLIANCE DASHBOARD
DELETE FROM aura_compliance_exception WHERE "tenantId" = (SELECT tenant_id FROM vars) AND "sourceType" = 'RED_FLAG';

-- STATEMENT

DELETE FROM aura_red_flag_instance WHERE "tenantId" = (SELECT tenant_id FROM vars) AND "sourceType" = 'SEED';

-- STATEMENT

-- 3. ENSURE REGIONAL LEGAL ENTITIES EXIST FOR EACH GCC COUNTRY
-- AE
INSERT INTO aura_gcc_legal_entity (id, "tenantId", "tenantCountryId", "countryCode", "legalName", "registrationRef", "registrationType", "currency", "timezone", "isActive", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  v.tenant_id,
  tc.id,
  'AE',
  'KreupAI UAE Ltd',
  'REG-AE-001',
  'Commercial',
  'AED',
  'Asia/Dubai',
  true,
  NOW(),
  NOW()
FROM vars v
JOIN aura_gcc_tenant_country tc ON tc."tenantId" = v.tenant_id AND tc."countryCode" = 'AE'
WHERE NOT EXISTS (
  SELECT 1 FROM aura_gcc_legal_entity le 
  WHERE le."tenantId" = v.tenant_id AND le."countryCode" = 'AE'
);

-- STATEMENT

-- SA
INSERT INTO aura_gcc_legal_entity (id, "tenantId", "tenantCountryId", "countryCode", "legalName", "registrationRef", "registrationType", "currency", "timezone", "isActive", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  v.tenant_id,
  tc.id,
  'SA',
  'KreupAI Saudi Arabia LLC',
  'REG-SA-001',
  'Commercial',
  'SAR',
  'Asia/Riyadh',
  true,
  NOW(),
  NOW()
FROM vars v
JOIN aura_gcc_tenant_country tc ON tc."tenantId" = v.tenant_id AND tc."countryCode" = 'SA'
WHERE NOT EXISTS (
  SELECT 1 FROM aura_gcc_legal_entity le 
  WHERE le."tenantId" = v.tenant_id AND le."countryCode" = 'SA'
);

-- STATEMENT

-- BH
INSERT INTO aura_gcc_legal_entity (id, "tenantId", "tenantCountryId", "countryCode", "legalName", "registrationRef", "registrationType", "currency", "timezone", "isActive", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  v.tenant_id,
  tc.id,
  'BH',
  'KreupAI Bahrain SPC',
  'REG-BH-001',
  'Commercial',
  'BHD',
  'Asia/Bahrain',
  true,
  NOW(),
  NOW()
FROM vars v
JOIN aura_gcc_tenant_country tc ON tc."tenantId" = v.tenant_id AND tc."countryCode" = 'BH'
WHERE NOT EXISTS (
  SELECT 1 FROM aura_gcc_legal_entity le 
  WHERE le."tenantId" = v.tenant_id AND le."countryCode" = 'BH'
);

-- STATEMENT

-- QA
INSERT INTO aura_gcc_legal_entity (id, "tenantId", "tenantCountryId", "countryCode", "legalName", "registrationRef", "registrationType", "currency", "timezone", "isActive", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  v.tenant_id,
  tc.id,
  'QA',
  'KreupAI Qatar LLC',
  'REG-QA-001',
  'Commercial',
  'QAR',
  'Asia/Qatar',
  true,
  NOW(),
  NOW()
FROM vars v
JOIN aura_gcc_tenant_country tc ON tc."tenantId" = v.tenant_id AND tc."countryCode" = 'QA'
WHERE NOT EXISTS (
  SELECT 1 FROM aura_gcc_legal_entity le 
  WHERE le."tenantId" = v.tenant_id AND le."countryCode" = 'QA'
);

-- STATEMENT

-- KW
INSERT INTO aura_gcc_legal_entity (id, "tenantId", "tenantCountryId", "countryCode", "legalName", "registrationRef", "registrationType", "currency", "timezone", "isActive", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  v.tenant_id,
  tc.id,
  'KW',
  'KreupAI Kuwait WLL',
  'REG-KW-001',
  'Commercial',
  'KWD',
  'Asia/Kuwait',
  true,
  NOW(),
  NOW()
FROM vars v
JOIN aura_gcc_tenant_country tc ON tc."tenantId" = v.tenant_id AND tc."countryCode" = 'KW'
WHERE NOT EXISTS (
  SELECT 1 FROM aura_gcc_legal_entity le 
  WHERE le."tenantId" = v.tenant_id AND le."countryCode" = 'KW'
);

-- STATEMENT

-- OM
INSERT INTO aura_gcc_legal_entity (id, "tenantId", "tenantCountryId", "countryCode", "legalName", "registrationRef", "registrationType", "currency", "timezone", "isActive", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  v.tenant_id,
  tc.id,
  'OM',
  'KreupAI Oman LLC',
  'REG-OM-001',
  'Commercial',
  'OMR',
  'Asia/Muscat',
  true,
  NOW(),
  NOW()
FROM vars v
JOIN aura_gcc_tenant_country tc ON tc."tenantId" = v.tenant_id AND tc."countryCode" = 'OM'
WHERE NOT EXISTS (
  SELECT 1 FROM aura_gcc_legal_entity le 
  WHERE le."tenantId" = v.tenant_id AND le."countryCode" = 'OM'
);

-- STATEMENT

-- 4. SEED LOOKUP COMPLIANCE RULES
CREATE TEMP TABLE temp_rules (
  id SERIAL PRIMARY KEY,
  domain VARCHAR(50),
  rule_code VARCHAR(50),
  title VARCHAR(150),
  description TEXT
);

-- STATEMENT

INSERT INTO temp_rules (domain, rule_code, title, description) VALUES
('ATTENDANCE', 'ATT_LATE', 'Late Arrival Pattern Detected', 'Repeated late arrivals exceeding monthly allowance.'),
('ATTENDANCE', 'ATT_MISS', 'Missing Punch Records', 'Employee shift has missing in/out biometric punches.'),
('ATTENDANCE', 'ATT_ABSC', 'Absconding Pattern Alert', 'Employee absent for 3 consecutive days without approved leave.'),
('ATTENDANCE', 'ATT_OT_V', 'Overtime Compliance Violation', 'Weekly overtime hours exceed statutory limit.'),
('WPS', 'WPS_DISC', 'WPS Salary Discrepancy', 'WPS salary transfer amount does not match registered basic salary.'),
('WPS', 'WPS_VAL', 'WPS File Validation Failure', 'WPS SIF file format validation failed at banking gateway.'),
('WPS', 'WPS_LATE', 'Late Salary Processing', 'Monthly salary transfer delayed beyond the 10th of the month.'),
('BENEFITS', 'BEN_MED', 'Medical Insurance Gap', 'Employee or dependents missing valid medical insurance card.'),
('BENEFITS', 'BEN_EOSB', 'EOSB Accrual Audit Variance', 'End of Service Benefit accrual variance detected in ledger.'),
('ACCOMMODATION', 'ACC_CAP', 'Camp Over-Capacity Threshold', 'Staff accommodation camp occupancy exceeds registered permit limit.'),
('ACCOMMODATION', 'ACC_HSE', 'HSE Accommodation Audit Deficit', 'Safety inspection found deficient smoke detectors and fire hazards.'),
('EMIRATISATION', 'EM_QUOTA', 'Emiratisation Quota Under-achievement', 'Current Emirati employee count is below the MOHRE statutory target.'),
('EMIRATISATION', 'EM_NAFIS', 'Nafis Eligibility Mismatch', 'Emirati employee Nafis subsidy registration is pending or rejected.'),
('BAHRAINIZATION', 'BH_QUOTA', 'Bahraini Quota Non-compliance', 'Company has not met the LMRA Bahrainisation ratio requirements.'),
('DOCUMENT_RETENTION', 'DOC_PASS', 'Missing Passport Record', 'No active passport document uploaded to employee profile.'),
('DOCUMENT_RETENTION', 'DOC_CONT', 'Labour Contract Copy Missing', 'Signed employment contract file is missing from digital archive.'),
('PAYROLL', 'PAY_DED', 'Unauthorized Salary Deduction', 'Deduction executed without corresponding written authorization.'),
('GOSI', 'GOSI_LATE', 'GOSI Contribution Delay', 'Monthly social insurance declaration not submitted by due date.'),
('GPSSA', 'GPSSA_VAR', 'GPSSA Contribution Variance', 'Filing amount differs from registered monthly pension salary.'),
('VISA_EXIT', 'VISA_OVR', 'Visa Overstay Alert', 'Resident visa expired with no active renewal or exit stamp.'),
('IMMIGRATION', 'IMM_PERM', 'Labour Card Renewal Overdue', 'Employee work permit has expired or has not been renewed within SLA.'),
('HR_POLICIES', 'POL_ACK', 'Policy Acknowledgement Missing', 'Mandatory Code of Conduct policy remains unacknowledged by employee.'),
('TRAINING', 'TRN_HSE', 'Safety Induction Overdue', 'Employee has not completed mandatory workplace safety training.');

-- STATEMENT

-- 5. RESOLVE MASTER ORGS
CREATE TEMP TABLE temp_orgs AS
SELECT 
  (SELECT ARRAY_AGG(id) FROM aura_business_unit WHERE "isDeleted" = false) AS bu_ids,
  (SELECT ARRAY_AGG(id) FROM aura_department WHERE "isDeleted" = false) AS dept_ids,
  (SELECT ARRAY_AGG(id) FROM aura_user WHERE email LIKE '%kreup%' OR email LIKE '%admin%') AS user_ids;

-- STATEMENT

-- 6. GENERATE HIGH-FIDELITY COMPLIANCE RISKS SERIES (420 RECORDS)
CREATE TEMP TABLE temp_series AS
SELECT 
  i,
  CASE 
    WHEN i <= 168 THEN 'AE'
    WHEN i <= 252 THEN 'SA'
    WHEN i <= 315 THEN 'BH'
    WHEN i <= 357 THEN 'QA'
    WHEN i <= 391 THEN 'KW'
    ELSE 'OM'
  END AS country_code,
  CASE 
    WHEN i % 10 = 0 THEN 'CRITICAL'
    WHEN i % 10 IN (1, 2) THEN 'HIGH'
    WHEN i % 10 IN (3, 4, 5) THEN 'MEDIUM'
    ELSE 'LOW'
  END AS severity,
  CASE 
    WHEN i % 10 IN (0, 1, 2, 3) THEN 'OPEN'
    WHEN i % 10 IN (4, 5, 6) THEN 'IN_PROGRESS'
    WHEN i % 10 IN (7, 8) THEN 'RESOLVED'
    ELSE 'WAIVED'
  END AS status,
  CASE
    WHEN i % 10 = 0 THEN (i % 15) + 1
    WHEN i % 10 IN (1, 2) THEN (i % 45) + 1
    ELSE (i % 120) + 1
  END AS age_in_days
FROM generate_series(1, 420) i;

-- STATEMENT

-- 7. INSERT RED FLAGS
INSERT INTO aura_red_flag_instance (
  id, "tenantId", "ruleCode", "domain", "severity", "sourceType", "sourceId", "checklistRunId", "details", "raisedAt", "clearedAt", "status", "createdAt", "updatedAt", "createdBy", "updatedBy", "isDeleted"
)
SELECT 
  gen_random_uuid() AS id,
  v.tenant_id,
  r.rule_code,
  r.domain,
  s.severity,
  'SEED',
  'SEED-' || s.i,
  NULL,
  jsonb_build_object(
    'countryCode', s.country_code,
    'legalEntityId', (SELECT id FROM aura_gcc_legal_entity WHERE "tenantId" = v.tenant_id AND "countryCode" = s.country_code LIMIT 1),
    'businessUnitId', o.bu_ids[1 + (s.i % COALESCE(ARRAY_LENGTH(o.bu_ids, 1), 1))],
    'departmentId', o.dept_ids[1 + (s.i % COALESCE(ARRAY_LENGTH(o.dept_ids, 1), 1))],
    'location', s.country_code || ' Office HQ',
    'ownerUserId', o.user_ids[1 + (s.i % COALESCE(ARRAY_LENGTH(o.user_ids, 1), 1))],
    'label', r.title
  ),
  NOW() - (s.age_in_days || ' days')::INTERVAL,
  CASE WHEN s.status = 'RESOLVED' THEN NOW() - ((s.age_in_days / 2) || ' days')::INTERVAL ELSE NULL END,
  s.status,
  NOW() - (s.age_in_days || ' days')::INTERVAL,
  NOW(),
  'SEED_BOT',
  'SEED_BOT',
  false
FROM temp_series s
CROSS JOIN vars v
CROSS JOIN temp_orgs o
JOIN temp_rules r ON r.id = 1 + (s.i % (SELECT COUNT(*) FROM temp_rules));

-- STATEMENT

-- 8. INSERT COMPLIANCE EXCEPTIONS (CAPAs) FOR CRITICAL & HIGH SEVERITY RISKS
INSERT INTO aura_compliance_exception (
  id, "tenantId", "domain", "registerCode", "sourceType", "sourceId", "title", "description", "severity", "ownerRole", "ownerUserId", "dueDate", "status", "closedAt", "redFlagId", "createdAt", "updatedAt", "createdBy", "updatedBy", "isDeleted"
)
SELECT 
  gen_random_uuid(),
  rf."tenantId",
  rf.domain,
  'CAPA-' || rf."ruleCode",
  'RED_FLAG',
  rf.id,
  'Remediation: ' || (rf.details->>'label'),
  'Remediation plan to address ' || rf.severity || ' compliance violation ' || rf."ruleCode" || ' under ' || rf.domain || '.',
  rf.severity,
  'Compliance Officer',
  rf.details->>'ownerUserId',
  CASE 
    WHEN rf.status = 'OPEN' AND rf.severity = 'CRITICAL' THEN NOW() - '5 days'::INTERVAL
    WHEN rf.status = 'OPEN' THEN NOW() + '30 days'::INTERVAL
    ELSE NOW() - '2 days'::INTERVAL
  END,
  CASE 
    WHEN rf.status = 'RESOLVED' THEN 'RESOLVED'
    WHEN rf.status = 'WAIVED' THEN 'WAIVED'
    ELSE 'OPEN'
  END,
  CASE WHEN rf.status = 'RESOLVED' THEN NOW() ELSE NULL END,
  rf.id,
  rf."raisedAt",
  NOW(),
  'SEED_BOT',
  'SEED_BOT',
  false
FROM aura_red_flag_instance rf
WHERE rf."tenantId" = (SELECT tenant_id FROM vars)
  AND rf."sourceType" = 'SEED'
  AND rf.severity IN ('CRITICAL', 'HIGH');

-- STATEMENT

-- 9. CLEANUP TEMPORARY TABLES
DROP TABLE IF EXISTS temp_rules;

-- STATEMENT

DROP TABLE IF EXISTS temp_series;

-- STATEMENT

DROP TABLE IF EXISTS temp_orgs;

-- STATEMENT

DROP TABLE IF EXISTS vars;
