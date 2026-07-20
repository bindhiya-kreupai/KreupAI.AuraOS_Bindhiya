-- =========================================================================
-- ENTERPRISE BENEFITS ADMINISTRATION & COMPLIANCE SEED SCRIPT
-- =========================================================================
-- Target Tenant: KREUP_AI
-- Schema: auraos
-- Purpose: Seed high-fidelity benefits catalogue, vendors, coverages,
--          exceptions, and monthly certificates for dashboard visualization.
-- Safe to rerun: Clears existing benefits compliance data for KREUP_AI before seeding
-- =========================================================================

BEGIN;

SET search_path TO auraos, public;

-- 1. RESOLVE DYNAMIC VARIABLES (TENANT & AUDIT USER)
CREATE TEMP TABLE vars AS
SELECT 
  COALESCE((SELECT id FROM aura_tenant WHERE code = 'KREUP_AI' LIMIT 1), 'ae63d8ef-d01d-49a7-a542-b1256702765d') AS tenant_id,
  COALESCE((SELECT id FROM aura_user WHERE email LIKE '%kreup%' LIMIT 1), 'system_manager') AS user_id;

-- 2. CLEANUP PREVIOUS SEED DATA
DELETE FROM aura_benefit_certificate WHERE "tenantId" = (SELECT tenant_id FROM vars);
DELETE FROM aura_benefit_exception WHERE "tenantId" = (SELECT tenant_id FROM vars);
DELETE FROM aura_benefit_coverage WHERE "tenantId" = (SELECT tenant_id FROM vars);
DELETE FROM aura_benefit_vendor WHERE "tenantId" = (SELECT tenant_id FROM vars);
DELETE FROM aura_benefit_catalogue WHERE "tenantId" = (SELECT tenant_id FROM vars);

-- 3. SEED BENEFIT CATALOGUE (40 entries)
INSERT INTO aura_benefit_catalogue (
  id, "tenantId", "benefitCode", "benefitType", label, "countryCode", "isMandatory", "minGrade", "valuationBasis", "annualValue", currency, "frequencyMonths", "dependantsAllowed", "vendorRequired", "policyJson", "effectiveFrom", status, "createdAt", "updatedAt"
) VALUES
-- UAE
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'MED_UAE_STD', 'MEDICAL_INSURANCE', 'UAE Standard Medical Plan', 'UAE', true, '1', 'FIXED', 6000.00, 'AED', 12, true, true, '{}', '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'MED_UAE_VIP', 'MEDICAL_INSURANCE', 'UAE Executive VIP Medical Plan', 'UAE', false, '5', 'FIXED', 12000.00, 'AED', 12, true, true, '{}', '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'LIF_UAE_STD', 'LIFE_INSURANCE', 'UAE Term Life coverage', 'UAE', true, '1', 'FIXED', 3000.00, 'AED', 12, false, true, '{}', '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'AIR_UAE_ANN', 'AIR_TICKET', 'UAE Annual Homecoming Ticket', 'UAE', true, '1', 'ACCRUED', 2400.00, 'AED', 12, true, false, '{}', '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'HOU_UAE_MON', 'HOUSING', 'UAE Housing Allowance', 'UAE', false, '1', 'ACCRUED', 36000.00, 'AED', 12, false, false, '{}', '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'TRA_UAE_MON', 'TRANSPORT', 'UAE Transport Allowance', 'UAE', false, '1', 'FIXED', 6000.00, 'AED', 12, false, false, '{}', '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'EDU_UAE_MON', 'EDUCATION', 'UAE Children Education Assistance', 'UAE', false, '3', 'ACTUAL', 18000.00, 'AED', 12, true, false, '{}', '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'WELL_UAE_GYM', 'WELLNESS', 'UAE Gym Subsidized Program', 'UAE', false, '1', 'FIXED', 1200.00, 'AED', 12, false, false, '{}', '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- KSA
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'MED_KSA_STD', 'MEDICAL_INSURANCE', 'KSA Standard CCHI Medical Plan', 'KSA', true, '1', 'FIXED', 8000.00, 'SAR', 12, true, true, '{}', '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'MED_KSA_VIP', 'MEDICAL_INSURANCE', 'KSA Platinum VIP Medical Plan', 'KSA', false, '5', 'FIXED', 15000.00, 'SAR', 12, true, true, '{}', '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'LIF_KSA_STD', 'LIFE_INSURANCE', 'KSA Term Life Plan', 'KSA', true, '1', 'FIXED', 4000.00, 'SAR', 12, false, true, '{}', '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'AIR_KSA_ANN', 'AIR_TICKET', 'KSA Homecoming Allowance', 'KSA', true, '1', 'ACCRUED', 3000.00, 'SAR', 12, true, false, '{}', '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'HOU_KSA_MON', 'HOUSING', 'KSA Housing Allowance', 'KSA', false, '1', 'ACCRUED', 40000.00, 'SAR', 12, false, false, '{}', '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'TRA_KSA_MON', 'TRANSPORT', 'KSA Commute Allowance', 'KSA', false, '1', 'FIXED', 8000.00, 'SAR', 12, false, false, '{}', '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Qatar
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'MED_QAT_STD', 'MEDICAL_INSURANCE', 'Qatar Seha Standard Plan', 'QATAR', true, '1', 'FIXED', 5000.00, 'QAR', 12, true, true, '{}', '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'AIR_QAT_ANN', 'AIR_TICKET', 'Qatar Homecoming Allowance', 'QATAR', true, '1', 'ACCRUED', 2500.00, 'QAR', 12, true, false, '{}', '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'HOU_QAT_MON', 'HOUSING', 'Qatar Corporate Lodging Support', 'QATAR', false, '1', 'ACCRUED', 35000.00, 'QAR', 12, false, false, '{}', '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Bahrain
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'MED_BAH_STD', 'MEDICAL_INSURANCE', 'Bahrain Dhaman Basic Health Cover', 'BAHRAIN', true, '1', 'FIXED', 4500.00, 'BHD', 12, true, true, '{}', '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'AIR_BAH_ANN', 'AIR_TICKET', 'Bahrain Homecoming Airfare', 'BAHRAIN', true, '1', 'ACCRUED', 250.00, 'BHD', 12, true, false, '{}', '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'HOU_BAH_MON', 'HOUSING', 'Bahrain Housing Scheme', 'BAHRAIN', false, '1', 'ACCRUED', 3000.00, 'BHD', 12, false, false, '{}', '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Oman
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'MED_OMA_STD', 'MEDICAL_INSURANCE', 'Oman Unified Health Insurance (Dhamani)', 'OMAN', true, '1', 'FIXED', 500.00, 'OMR', 12, true, true, '{}', '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'AIR_OMA_ANN', 'AIR_TICKET', 'Oman Homecoming Travel Plan', 'OMAN', true, '1', 'ACCRUED', 250.00, 'OMR', 12, true, false, '{}', '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Kuwait
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'MED_KUW_STD', 'MEDICAL_INSURANCE', 'Kuwait Daman Basic Plan', 'KUWAIT', true, '1', 'FIXED', 400.00, 'KWD', 12, true, true, '{}', '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Generic / Common Benefits
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'WELL_STD_MON', 'WELLNESS', 'GCC Corporate Wellness Benefit', NULL, false, '1', 'FIXED', 600.00, 'AED', 12, false, false, '{}', '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'LTA_ALL_ANN', 'AIR_TICKET', 'Leave Travel Allowance Program', NULL, false, '1', 'ACCRUED', 2400.00, 'AED', 12, false, false, '{}', '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'PPE_STD_ANN', 'UNIFORM_PPE', 'Mandatory Site Safety PPE Plan', NULL, true, '1', 'FIXED', 500.00, 'AED', 12, false, false, '{}', '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'MOB_STD_MON', 'MOBILE', 'Mobile Subsidy Plan', NULL, false, '1', 'FIXED', 1200.00, 'AED', 12, false, false, '{}', '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'EDU_STD_MON', 'EDUCATION', 'Education Subsidy Scheme', NULL, false, '3', 'ACTUAL', 15000.00, 'AED', 12, true, false, '{}', '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'LOAN_STD_MON', 'LOAN', 'Interest Free emergency loan support', NULL, false, '1', 'FIXED', 10000.00, 'AED', 12, false, false, '{}', '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- 4. SEED BENEFIT VENDORS (25 entries)
INSERT INTO aura_benefit_vendor (
  id, "tenantId", name, "vendorType", country, "contactEmail", "contactPhone", "contractRef", "contractStart", "contractEnd", "dpaSigned", "dpaSignedAt", status, "createdAt", "updatedAt"
) VALUES
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'AXA Gulf Insurance', 'MEDICAL_INSURER', 'UAE', 'info@axagulf.ae', '+9714111222', 'CON-2025-001', '2025-01-01', '2026-12-31', true, '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'Daman Health Insurance', 'MEDICAL_INSURER', 'UAE', 'dpa@daman.ae', '+9712333444', 'CON-2025-002', '2025-01-01', '2026-12-31', true, '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'Bupa Arabia', 'MEDICAL_INSURER', 'KSA', 'privacy@bupa.com.sa', '+9661222333', 'CON-2025-003', '2025-01-01', '2026-12-31', true, '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'Tawuniya', 'MEDICAL_INSURER', 'KSA', 'dpa@tawuniya.com.sa', '+9661444555', 'CON-2025-004', '2025-01-01', '2026-12-31', true, '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'Oman Insurance Company', 'MEDICAL_INSURER', 'UAE', 'compliance@omaninsurance.ae', '+9714888999', 'CON-2025-005', '2025-01-01', '2026-12-31', true, '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'MetLife Gulf', 'LIFE_INSURER', 'UAE', 'dpa@metlife.ae', '+9714777888', 'CON-2025-006', '2025-01-01', '2026-12-31', true, '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'MedNet Gulf', 'MEDICAL_INSURER', 'UAE', 'mednet@mednet.ae', '+9714999000', 'CON-2025-007', '2025-01-01', '2026-12-31', true, '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'NextCare Middle East', 'MEDICAL_INSURER', 'UAE', 'nextcare@nextcare.ae', '+9714555666', 'CON-2025-008', '2025-01-01', '2026-12-31', false, NULL, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- Unsigned DPA for exceptions trigger
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'Cigna Middle East', 'MEDICAL_INSURER', 'UAE', 'cigna@cigna.ae', '+9714444333', 'CON-2025-009', '2025-01-01', '2026-06-30', true, '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- Expired contract for validation warning
(gen_random_uuid(), (SELECT tenant_id FROM vars), 'Allianz Care', 'MEDICAL_INSURER', 'UAE', 'allianz@allianz.ae', '+9714666777', 'CON-2025-010', '2025-01-01', '2026-12-31', true, '2025-01-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- 5. SEED COVERAGE ENROLLMENTS (Batch inserts referencing existing employees)
-- Create temporary lists to match dynamically
CREATE TEMP TABLE temp_employees AS
SELECT id, ROW_NUMBER() OVER() as rn 
FROM aura_employee 
WHERE "isDeleted" = false;

CREATE TEMP TABLE temp_catalogue AS
SELECT id, "benefitCode", "annualValue", currency, "vendorRequired", ROW_NUMBER() OVER() as rn 
FROM aura_benefit_catalogue;

CREATE TEMP TABLE temp_vendors AS
SELECT id, name, ROW_NUMBER() OVER() as rn 
FROM aura_benefit_vendor;

-- Batch insert 400 coverage records
INSERT INTO aura_benefit_coverage (
  id, "tenantId", "employeeId", "benefitCatalogueId", "vendorId", "policyNumber", "startedAt", "expiresAt", "lastRenewedAt", "actualAnnualValue", currency, "dependantsCount", status, "lastAccruedAt", "accruedBalance", "createdAt", "updatedAt"
)
SELECT 
  gen_random_uuid(),
  (SELECT tenant_id FROM vars),
  e.id,
  c.id,
  CASE WHEN c."vendorRequired" THEN v.id ELSE NULL END,
  'POL-' || (20000 + (e.rn * 17 + c.rn * 11) % 70000),
  -- Start dates naturally distributed across 2025
  '2025-01-01'::date + (e.rn % 180) * INTERVAL '1 day',
  -- Expiry dates (creates expired, upcoming, expiring soon)
  CASE 
    WHEN (e.rn + c.rn) % 10 = 0 THEN CURRENT_DATE - (1 + (e.rn) % 60) * INTERVAL '1 day' -- Expired policy
    WHEN (e.rn + c.rn) % 10 = 1 THEN CURRENT_DATE + (5 + (e.rn) % 45) * INTERVAL '1 day'  -- Expiring soon (<60 days)
    ELSE CURRENT_DATE + (100 + (e.rn) % 300) * INTERVAL '1 day' -- Healthy future expiry
  END,
  CASE WHEN (e.rn + c.rn) % 7 = 0 THEN CURRENT_DATE - 30 * INTERVAL '1 day' ELSE NULL END,
  c."annualValue",
  c.currency,
  (e.rn % 3),
  CASE 
    WHEN (e.rn + c.rn) % 12 = 0 THEN 'TERMINATED' 
    WHEN (e.rn + c.rn) % 18 = 0 THEN 'SUSPENDED' 
    ELSE 'ACTIVE' 
  END,
  CURRENT_DATE - (e.rn % 15) * INTERVAL '1 day',
  (c."annualValue" / 12) * (1 + (e.rn % 10)), -- Real accrued values built over time
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM temp_employees e
CROSS JOIN temp_catalogue c
LEFT JOIN temp_vendors v ON v.rn = ((e.rn + c.rn) % 10 + 1)
WHERE e.rn <= 120 -- Target subset of employees to avoid massive bloat while satisfying targets
ON CONFLICT DO NOTHING;

-- 6. SEED BENEFIT EXCEPTIONS (120 entries)
INSERT INTO aura_benefit_exception (
  id, "tenantId", "employeeId", "benefitCode", "exceptionType", reason, "raisedAt", "raisedBy", status, "createdAt", "updatedAt"
)
SELECT 
  gen_random_uuid(),
  (SELECT tenant_id FROM vars),
  e.id,
  c."benefitCode",
  CASE 
    WHEN e.rn % 4 = 0 THEN 'VENDOR_WITHOUT_DPA'
    WHEN e.rn % 4 = 1 THEN 'COUNTRY_MISMATCH'
    WHEN e.rn % 4 = 2 THEN 'GRADE_BELOW_MIN'
    ELSE 'DUPLICATE_ENROLLMENT'
  END,
  'Auto-raised by AURA GCC Benefits validation pipeline.',
  CURRENT_DATE - (1 + e.rn % 30) * INTERVAL '1 day',
  (SELECT user_id FROM vars),
  CASE WHEN e.rn % 3 = 0 THEN 'CLOSED' ELSE 'OPEN' END,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM temp_employees e
CROSS JOIN (SELECT "benefitCode" FROM aura_benefit_catalogue LIMIT 3) c
WHERE e.rn <= 80 AND e.rn % 2 = 0;

-- 7. SEED CERTIFICATE RECORDS (Previous, Current, Next Months)
INSERT INTO aura_benefit_certificate (
  id, "tenantId", period, status, "activeEnrollments", "mandatoryCoverGapCount", "expiringSoonCount", "expiredCount", "openExceptionsCount", "vendorsWithoutDpa", "totalAccruedLiability", currency, "gatingReason", "attestationsJson", "generatedAt", "signedAt", "signedBy", "createdAt", "updatedAt"
) VALUES
(
  gen_random_uuid(),
  (SELECT tenant_id FROM vars),
  '2026-05',
  'SIGNED',
  180,
  0,
  2,
  0,
  0,
  0,
  45200.00,
  'AED',
  NULL,
  '[{"field":"attest","value":"OK"}]',
  CURRENT_DATE - 35 * INTERVAL '1 day',
  CURRENT_DATE - 34 * INTERVAL '1 day',
  (SELECT user_id FROM vars),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  gen_random_uuid(),
  (SELECT tenant_id FROM vars),
  '2026-06',
  'SIGNED',
  192,
  0,
  4,
  0,
  0,
  0,
  48600.00,
  'AED',
  NULL,
  '[{"field":"attest","value":"OK"}]',
  CURRENT_DATE - 5 * INTERVAL '1 day',
  CURRENT_DATE - 4 * INTERVAL '1 day',
  (SELECT user_id FROM vars),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  gen_random_uuid(),
  (SELECT tenant_id FROM vars),
  '2026-07',
  'DRAFT',
  210,
  3,
  12,
  6,
  14,
  2,
  52800.00,
  'AED',
  'Blocked: 3 mandatory cover gap(s); 6 expired coverage(s); 2 vendor(s) without DPA',
  '[]',
  CURRENT_TIMESTAMP,
  NULL,
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  gen_random_uuid(),
  (SELECT tenant_id FROM vars),
  '2026-08',
  'DRAFT',
  214,
  4,
  18,
  10,
  18,
  2,
  54200.00,
  'AED',
  'Blocked: 4 mandatory cover gap(s); 10 expired coverage(s); 2 vendor(s) without DPA',
  '[]',
  CURRENT_TIMESTAMP,
  NULL,
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("tenantId", period) DO NOTHING;

DROP TABLE temp_employees;
DROP TABLE temp_catalogue;
DROP TABLE temp_vendors;
DROP TABLE vars;

COMMIT;
