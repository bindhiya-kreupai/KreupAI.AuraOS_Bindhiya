-- =========================================================================
-- ENTERPRISE PRIVACY COMPLIANCE & DSAR EVALUATOR SEED SCRIPT
-- =========================================================================
-- Target Tenant: KREUP_AI
-- Purpose: Seed high-fidelity, interconnected DSAR requests (120-180),
--          remediation CAPAs, red flags, calendar events, and certificates
--          cleanly distributed across GCC/EU jurisdictions and depts.
-- Safe to rerun: Clean transaction-wrapped.
-- =========================================================================

BEGIN;

SET search_path TO auraos, public;

-- 1. RESOLVE DYNAMIC VARIABLES (TENANT & COMPLIANCE OWNER)
CREATE TEMP TABLE vars AS
SELECT 
  COALESCE((SELECT id FROM aura_tenant WHERE code = 'KREUP_AI' LIMIT 1), 'ae63d8ef-d01d-49a7-a542-b1256702765d') AS tenant_id,
  COALESCE((SELECT id FROM aura_user WHERE email LIKE '%kreup%' OR email LIKE '%admin%' LIMIT 1), 'USR-002') AS user_id;

-- 2. CLEANUP PREVIOUS SEED DATA
DELETE FROM aura_compliance_task WHERE "tenantId" = (SELECT tenant_id FROM vars) AND "createdBy" = 'SEED_BOT';
DELETE FROM aura_compliance_exception WHERE "tenantId" = (SELECT tenant_id FROM vars) AND "createdBy" = 'SEED_BOT';
DELETE FROM aura_red_flag_instance WHERE "tenantId" = (SELECT tenant_id FROM vars) AND "sourceType" = 'DSAR';
DELETE FROM aura_dsar_request WHERE "tenantId" = (SELECT tenant_id FROM vars) AND "createdBy" = 'SEED_BOT';
DELETE FROM aura_country_compliance_certificate WHERE "tenantId" = (SELECT tenant_id FROM vars) AND "createdBy" = 'SEED_BOT';

-- 3. CACHE COMPATIBLE ACTIVE EMPLOYEES
CREATE TEMP TABLE temp_emp_list AS
SELECT 
  e.id, 
  e.email, 
  e."firstName" || ' ' || e."lastName" AS name, 
  e."departmentId",
  c.country,
  row_number() OVER() AS rn
FROM aura_employee e
JOIN aura_company c ON e."companyId" = c.id
WHERE c."tenantId" = (SELECT tenant_id FROM vars) 
  AND e."isDeleted" = false;

-- 4. ENSURE DATA PRIVACY CALENDAR CATEGORY EXISTS
INSERT INTO aura_calendar_category (id, "tenantId", code, name, "ownerRole", "defaultCadence", description, "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  v.tenant_id,
  'PRIVACY',
  'Data Privacy & Protection',
  'Compliance Manager',
  'MONTHLY',
  'Privacy obligations, DSAR reviews, and compliance tasks.',
  NOW(),
  NOW()
FROM vars v
WHERE NOT EXISTS (
  SELECT 1 FROM aura_calendar_category 
  WHERE "tenantId" = v.tenant_id AND code = 'PRIVACY'
);

-- 5. GENERATE DSAR SERIES DATASHEET (150 RECORDS)
-- Distribution: UAE 45%, Saudi 20%, Bahrain 10%, Kuwait 10%, Qatar 7%, Oman 5%, EU 3%
CREATE TEMP TABLE dsar_series AS
SELECT 
  i,
  -- Country Jurisdiction Code
  CASE 
    WHEN i <= 67 THEN 'AE' -- ~45%
    WHEN i <= 97 THEN 'SA' -- ~20%
    WHEN i <= 112 THEN 'BH' -- ~10%
    WHEN i <= 127 THEN 'KW' -- ~10%
    WHEN i <= 137 THEN 'QA' -- ~7%
    WHEN i <= 145 THEN 'OM' -- ~5%
    ELSE 'EU' -- ~3%
  END AS jurisdiction,
  -- Status flow
  CASE
    WHEN i % 10 IN (0, 1, 2, 3, 4, 5) THEN 'completed'
    WHEN i % 10 = 6 THEN 'pending'
    WHEN i % 10 = 7 THEN 'overdue'
    WHEN i % 10 = 8 THEN 'rejected'
    ELSE 'escalated'
  END AS status,
  -- Priority
  CASE 
    WHEN i % 8 = 0 THEN 'critical'
    WHEN i % 8 IN (1, 2) THEN 'high'
    WHEN i % 8 IN (3, 4) THEN 'medium'
    ELSE 'low'
  END AS priority,
  -- Timeline: past 18 months
  NOW() - (i * 3.5 || ' days')::INTERVAL AS created_at
FROM generate_series(1, 150) i;

-- 6. INSERT SUBJECT ACCESS REQUESTS (DSARs)
INSERT INTO aura_dsar_request (
  id, "tenantId", "requestType", "subjectName", "subjectEmail", "subjectId", "status", "priority", "dueDate", "details", "assignedTo", "completedAt", "createdAt", "updatedAt", "createdBy", "updatedBy", "isDeleted"
)
SELECT 
  gen_random_uuid() AS id,
  v.tenant_id,
  'access',
  COALESCE(emp.name, 'External Subject #' || s.i),
  COALESCE(emp.email, 'privacy.subject.' || s.i || '@kreupai-external.com'),
  emp.id,
  s.status,
  s.priority,
  -- SLA Window: Standard 30 Days from receipt
  s.created_at + '30 days'::INTERVAL AS dueDate,
  -- details block holds bilingual properties & metadata in string format
  jsonb_build_object(
    'jurisdiction', s.jurisdiction,
    'receivedAt', s.created_at,
    'acknowledgedAt', s.created_at + '2 days'::INTERVAL,
    'fulfilledAt', CASE WHEN s.status = 'completed' THEN s.created_at + (10 + (s.i % 24) || ' days')::INTERVAL ELSE NULL END,
    'overrideSlaDays', CASE WHEN s.i % 14 = 0 THEN 45 WHEN s.i % 20 = 0 THEN 15 ELSE NULL END
  )::text,
  v.user_id,
  -- completedAt
  CASE WHEN s.status = 'completed' THEN s.created_at + (10 + (s.i % 24) || ' days')::INTERVAL ELSE NULL END,
  s.created_at,
  NOW(),
  'SEED_BOT',
  'SEED_BOT',
  false
FROM dsar_series s
CROSS JOIN vars v
LEFT JOIN temp_emp_list emp ON emp.rn = (s.i % (SELECT COALESCE(NULLIF(COUNT(*), 0), 1) FROM temp_emp_list)) + 1;

-- 7. SEED RED FLAGS IN RISK REGISTER FOR BREACHED AND OVERDUE REQUESTS
INSERT INTO aura_red_flag_instance (
  id, "tenantId", "ruleCode", "domain", "severity", "sourceType", "sourceId", "checklistRunId", "details", "raisedAt", "clearedAt", "status", "createdAt", "updatedAt", "createdBy", "updatedBy", "isDeleted"
)
SELECT 
  gen_random_uuid(),
  dr."tenantId",
  'PRIVACY_SLA_BREACH',
  'PRIVACY',
  CASE WHEN dr.priority = 'critical' THEN 'CRITICAL' ELSE 'HIGH' END,
  'DSAR',
  dr.id,
  NULL,
  jsonb_build_object(
    'requestId', 'REQ-' || SUBSTRING(dr.id::text, 1, 6),
    'subjectName', dr."subjectName",
    'countryCode', (dr.details::jsonb)->>'jurisdiction',
    'legalEntityId', (SELECT id FROM aura_gcc_legal_entity le WHERE le."tenantId" = dr."tenantId" AND le."countryCode" = COALESCE(NULLIF((dr.details::jsonb)->>'jurisdiction', 'EU'), 'AE') LIMIT 1),
    'ownerUserId', dr."assignedTo",
    'label', 'DSAR Response SLA Delay Breach'
  ),
  dr."createdAt" + '30 days'::INTERVAL,
  CASE WHEN dr.status = 'completed' THEN dr."completedAt" ELSE NULL END,
  CASE WHEN dr.status = 'completed' THEN 'RESOLVED' ELSE 'OPEN' END,
  dr."createdAt" + '30 days'::INTERVAL,
  NOW(),
  'SEED_BOT',
  'SEED_BOT',
  false
FROM aura_dsar_request dr
WHERE dr."tenantId" = (SELECT tenant_id FROM vars)
  AND dr."createdBy" = 'SEED_BOT'
  AND (
    dr.status = 'overdue'
    OR dr.status = 'escalated'
    OR (dr.status = 'completed' AND dr."completedAt" > dr."createdAt" + '30 days'::INTERVAL)
  );

-- 8. SEED REMEDIATION CORRECTIVE ACTIONS (CAPAs)
INSERT INTO aura_compliance_exception (
  id, "tenantId", "domain", "registerCode", "sourceType", "sourceId", "title", "description", "severity", "ownerRole", "ownerUserId", "dueDate", "status", "closedAt", "redFlagId", "createdAt", "updatedAt", "createdBy", "updatedBy", "isDeleted"
)
SELECT 
  gen_random_uuid(),
  rf."tenantId",
  'PRIVACY',
  'CAPA-PRV-' || SUBSTRING(rf.id::text, 1, 6),
  'RED_FLAG',
  rf.id,
  'Remediation: Resolve DSAR Breach for ' || (rf.details->>'subjectName'),
  'Urgent corrective action requirement to disclose privacy audit log data for jurisdiction ' || (rf.details->>'countryCode') || ' before escalation to regional commissioner.',
  rf.severity,
  'Data Protection Officer',
  rf.details->>'ownerUserId',
  NOW() + '14 days'::INTERVAL,
  CASE WHEN rf.status = 'RESOLVED' THEN 'RESOLVED' ELSE 'OPEN' END,
  CASE WHEN rf.status = 'RESOLVED' THEN NOW() ELSE NULL END,
  rf.id,
  rf."raisedAt",
  NOW(),
  'SEED_BOT',
  'SEED_BOT',
  false
FROM aura_red_flag_instance rf
WHERE rf."tenantId" = (SELECT tenant_id FROM vars)
  AND rf."ruleCode" = 'PRIVACY_SLA_BREACH'
  AND rf."createdBy" = 'SEED_BOT';

-- 9. SEED COMPLIANCE CALENDAR REVIEW TASKS
INSERT INTO aura_compliance_task (
  id, "tenantId", "ruleCode", "categoryCode", "countryCode", "legalEntityId", "subject", "ownerRole", "ownerUserId", "dueDate", "scheduledFor", "originalDueDate", "status", "createdAt", "updatedAt", "createdBy", "updatedBy", "isDeleted"
)
SELECT 
  gen_random_uuid(),
  rf."tenantId",
  'PRIVACY_REVIEW_TASK',
  'PRIVACY',
  (rf.details->>'countryCode'),
  CASE WHEN (rf.details->>'legalEntityId') IS NOT NULL AND (rf.details->>'legalEntityId') <> '' THEN (rf.details->>'legalEntityId')::uuid ELSE NULL END,
  'Verify Identity / Clear Data Release for ' || (rf.details->>'subjectName'),
  'Data Protection Officer',
  (rf.details->>'ownerUserId'),
  rf."raisedAt" + '7 days'::INTERVAL,
  rf."raisedAt",
  rf."raisedAt" + '7 days'::INTERVAL,
  CASE WHEN rf.status = 'RESOLVED' THEN 'COMPLETED' ELSE 'OPEN' END,
  rf."raisedAt",
  NOW(),
  'SEED_BOT',
  'SEED_BOT',
  false
FROM aura_red_flag_instance rf
WHERE rf."tenantId" = (SELECT tenant_id FROM vars)
  AND rf."ruleCode" = 'PRIVACY_SLA_BREACH'
  AND rf."createdBy" = 'SEED_BOT'
ON CONFLICT ("tenantId", "ruleCode", "scheduledFor", "legalEntityId") DO NOTHING;

-- 10. GENERATE GCC DATA PRIVACY COMPLIANCE MONTHLY CERTIFICATES
INSERT INTO aura_country_compliance_certificate (
  id, "tenantId", "countryCode", "period", "status", "domainStatus", "criticalOpenRisks", "gatingReason", "attestationsJson", "generatedAt", "signedAt", "signedBy", "createdAt", "updatedAt", "createdBy", "updatedBy", "isDeleted"
)
SELECT 
  gen_random_uuid(),
  v.tenant_id,
  c.code,
  '2026-06',
  CASE WHEN c.code IN ('AE', 'SA') THEN 'SIGNED' ELSE 'DRAFT' END,
  jsonb_build_object('privacy', 'COMPLIANT', 'attendance', 'COMPLIANT'),
  0,
  NULL,
  '[]'::jsonb,
  NOW() - '15 days'::INTERVAL,
  CASE WHEN c.code IN ('AE', 'SA') THEN NOW() - '14 days'::INTERVAL ELSE NULL END,
  CASE WHEN c.code IN ('AE', 'SA') THEN v.user_id ELSE NULL END,
  NOW() - '15 days'::INTERVAL,
  NOW(),
  'SEED_BOT',
  'SEED_BOT',
  false
FROM (VALUES ('AE'), ('SA'), ('BH'), ('KW'), ('QA'), ('OM')) AS c(code)
CROSS JOIN vars v
ON CONFLICT ("tenantId", "countryCode", "period") DO NOTHING;

-- 11. CLEANUP TEMPORARY TABLES
DROP TABLE IF EXISTS temp_emp_list;
DROP TABLE IF EXISTS dsar_series;
DROP TABLE IF EXISTS vars;

COMMIT;
