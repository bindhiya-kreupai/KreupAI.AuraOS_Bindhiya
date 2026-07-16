-- =========================================================================
-- ENTERPRISE ATTENDANCE COMPLIANCE SEED SCRIPT
-- =========================================================================
-- Target Tenant: KREUP_AI
-- Purpose: Seed high-fidelity GCC-compliant operational attendance history
-- Safe to rerun: Clears existing attendance data for KREUP_AI before seeding
-- =========================================================================

BEGIN;

SET search_path TO auraos, public;

-- 1. RESOLVE DYNAMIC VARIABLES (TENANT & COMPANY & AUDIT USER)
CREATE TEMP TABLE vars AS
SELECT 
  COALESCE((SELECT id FROM aura_tenant WHERE code = 'KREUP_AI' LIMIT 1), 'ae63d8ef-d01d-49a7-a542-b1256702765d') AS tenant_id,
  COALESCE((SELECT id FROM aura_user WHERE email LIKE '%kreup%' LIMIT 1), 'system_manager') AS user_id;

-- 2. CLEANUP PREVIOUS SEED DATA
DELETE FROM aura_attendance_punch WHERE "tenantId" = (SELECT tenant_id FROM vars);
DELETE FROM aura_attendance_record WHERE "tenantId" = (SELECT tenant_id FROM vars);
DELETE FROM aura_attendance_fraud_flag WHERE "tenantId" = (SELECT tenant_id FROM vars);
DELETE FROM aura_attendance_consent WHERE "tenantId" = (SELECT tenant_id FROM vars);
DELETE FROM aura_attendance_regularization WHERE "tenantId" = (SELECT tenant_id FROM vars);
DELETE FROM aura_attendance_certificate WHERE "tenantId" = (SELECT tenant_id FROM vars);
DELETE FROM aura_attendance_policy WHERE "tenantId" = (SELECT tenant_id FROM vars);

-- 3. CREATE TEMPORARY TABLES FOR MASTER RELATIONSHIPS
CREATE TEMP TABLE temp_active_employees AS
SELECT e.id AS employee_id, c.id AS company_id, e."employeeCode", c.country
FROM aura_employee e
JOIN aura_company c ON e."companyId" = c.id
WHERE c."tenantId" = (SELECT tenant_id FROM vars)
  AND e."isDeleted" = false
LIMIT 30;

-- 4. SEED SHIFTS (if not already seeded)
INSERT INTO aura_shift (
    id, "tenantId", code, name, description, "startTime", "endTime", 
    "graceInMinutes", "graceOutMinutes", "breakDuration", "isPaidBreak", 
    "workHours", "weekendDays", "overtimeAllowed", "maxOvertimeHours", 
    "isFlexible", "flexWindow", "isActive", "isDefault", "createdAt", "updatedAt"
)
SELECT 
    gen_random_uuid(), 
    tenant_id, 
    'DAY', 
    'Standard Day Shift', 
    'Standard office hours 9am to 6pm', 
    '09:00', 
    '18:00', 
    15, 
    15, 
    60, 
    true, 
    8.0, 
    ARRAY['Saturday', 'Sunday'], 
    true, 
    2.0, 
    false, 
    0, 
    true, 
    true, 
    NOW(), 
    NOW()
FROM vars
ON CONFLICT ("tenantId", code) DO NOTHING;

INSERT INTO aura_shift (
    id, "tenantId", code, name, description, "startTime", "endTime", 
    "graceInMinutes", "graceOutMinutes", "breakDuration", "isPaidBreak", 
    "workHours", "weekendDays", "overtimeAllowed", "maxOvertimeHours", 
    "isFlexible", "flexWindow", "isActive", "isDefault", "createdAt", "updatedAt"
)
SELECT 
    gen_random_uuid(), 
    tenant_id, 
    'NIGHT', 
    'Standard Night Shift', 
    'Night operations shift 10pm to 7am', 
    '22:00', 
    '07:00', 
    15, 
    15, 
    60, 
    true, 
    8.0, 
    ARRAY['Friday', 'Saturday'], 
    true, 
    2.0, 
    false, 
    0, 
    true, 
    false, 
    NOW(), 
    NOW()
FROM vars
ON CONFLICT ("tenantId", code) DO NOTHING;

-- 5. SEED SHIFT ASSIGNMENTS
INSERT INTO aura_shift_assignment (
    id, "tenantId", "employeeId", "shiftId", "effectiveFrom", "isActive", "createdAt", "updatedAt"
)
SELECT 
    gen_random_uuid(),
    (SELECT tenant_id FROM vars),
    employee_id,
    (SELECT id FROM aura_shift WHERE "tenantId" = (SELECT tenant_id FROM vars) AND code = 'DAY' LIMIT 1),
    '2026-01-01'::timestamp,
    true,
    NOW(),
    NOW()
FROM temp_active_employees;

-- 6. SEED ATTENDANCE POLICIES (GCC Country Specific)
INSERT INTO aura_attendance_policy (
    id, "tenantId", country, grade, "isEligible", "lateToleranceMin", 
    "earlyDepartureToleranceMin", "missingPunchSlaHours", "regularizationSlaDays", 
    "absconding3DayThreshold", "ramadanReducedHours", "remoteWorkAllowed", 
    "fraudGeofenceRadiusM", "biometricRequired", "effectiveFrom", status, "createdAt", "updatedAt"
)
SELECT gen_random_uuid(), tenant_id, 'UAE', NULL, true, 15, 15, 24, 3, true, 6.00, true, 200, false, '2026-01-01'::timestamp, 'ACTIVE', NOW(), NOW() FROM vars
ON CONFLICT ("tenantId", country, grade, "effectiveFrom") DO NOTHING;

INSERT INTO aura_attendance_policy (
    id, "tenantId", country, grade, "isEligible", "lateToleranceMin", 
    "earlyDepartureToleranceMin", "missingPunchSlaHours", "regularizationSlaDays", 
    "absconding3DayThreshold", "ramadanReducedHours", "remoteWorkAllowed", 
    "fraudGeofenceRadiusM", "biometricRequired", "effectiveFrom", status, "createdAt", "updatedAt"
)
SELECT gen_random_uuid(), tenant_id, 'India', NULL, true, 10, 10, 24, 3, true, 8.00, true, 150, false, '2026-01-01'::timestamp, 'ACTIVE', NOW(), NOW() FROM vars
ON CONFLICT ("tenantId", country, grade, "effectiveFrom") DO NOTHING;

INSERT INTO aura_attendance_policy (
    id, "tenantId", country, grade, "isEligible", "lateToleranceMin", 
    "earlyDepartureToleranceMin", "missingPunchSlaHours", "regularizationSlaDays", 
    "absconding3DayThreshold", "ramadanReducedHours", "remoteWorkAllowed", 
    "fraudGeofenceRadiusM", "biometricRequired", "effectiveFrom", status, "createdAt", "updatedAt"
)
SELECT gen_random_uuid(), tenant_id, 'Saudi Arabia', NULL, true, 15, 15, 48, 5, true, 6.00, false, 250, true, '2026-01-01'::timestamp, 'ACTIVE', NOW(), NOW() FROM vars
ON CONFLICT ("tenantId", country, grade, "effectiveFrom") DO NOTHING;

INSERT INTO aura_attendance_policy (
    id, "tenantId", country, grade, "isEligible", "lateToleranceMin", 
    "earlyDepartureToleranceMin", "missingPunchSlaHours", "regularizationSlaDays", 
    "absconding3DayThreshold", "ramadanReducedHours", "remoteWorkAllowed", 
    "fraudGeofenceRadiusM", "biometricRequired", "effectiveFrom", status, "createdAt", "updatedAt"
)
SELECT gen_random_uuid(), tenant_id, 'GLOBAL', NULL, true, 10, 10, 24, 3, true, 8.00, true, 200, false, '2026-01-01'::timestamp, 'ACTIVE', NOW(), NOW() FROM vars
ON CONFLICT ("tenantId", country, grade, "effectiveFrom") DO NOTHING;

-- 7. SEED ATTENDANCE CONSENTS
INSERT INTO aura_attendance_consent (
    id, "tenantId", "employeeId", "consentType", "grantedAt", "revokedAt", "evidenceUrl", "createdAt", "updatedAt"
)
SELECT 
    gen_random_uuid(),
    (SELECT tenant_id FROM vars),
    employee_id,
    'BIOMETRIC',
    CASE WHEN (row_number() OVER ()) % 10 != 0 THEN NOW() - INTERVAL '3 months' ELSE NULL END,
    NULL,
    CASE WHEN (row_number() OVER ()) % 10 != 0 THEN 'https://s3.amazonaws.com/auraos/consents/biometric_' || employee_id || '.pdf' ELSE NULL END,
    NOW(),
    NOW()
FROM temp_active_employees;

INSERT INTO aura_attendance_consent (
    id, "tenantId", "employeeId", "consentType", "grantedAt", "revokedAt", "evidenceUrl", "createdAt", "updatedAt"
)
SELECT 
    gen_random_uuid(),
    (SELECT tenant_id FROM vars),
    employee_id,
    'GEOLOCATION',
    CASE WHEN (row_number() OVER ()) % 8 != 0 THEN NOW() - INTERVAL '3 months' ELSE NULL END,
    CASE WHEN (row_number() OVER ()) % 15 = 0 THEN NOW() - INTERVAL '1 month' ELSE NULL END,
    CASE WHEN (row_number() OVER ()) % 8 != 0 THEN 'https://s3.amazonaws.com/auraos/consents/geo_' || employee_id || '.pdf' ELSE NULL END,
    NOW(),
    NOW()
FROM temp_active_employees;

-- 8. GENERATE ATTENDANCE BASE STATISTICS
CREATE TEMP TABLE temp_date_series AS
SELECT date::date
FROM generate_series('2026-06-01'::date, '2026-08-20'::date, '1 day'::interval) date
WHERE extract(isodow from date) < 6; -- Weekdays (Mon-Fri) only

CREATE TEMP TABLE temp_attendance_base AS
SELECT 
    gen_random_uuid() AS record_id,
    employee_id,
    date,
    -- Determine status: 92% PRESENT, 8% ABSENT
    CASE 
        WHEN (random() * 100)::int < 8 THEN 'ABSENT'
        ELSE 'PRESENT'
    END AS status,
    -- Determine check-in times
    -- Standard Day starts at 09:00:00. Late is check_in > 09:15:00.
    CASE 
        WHEN (random() * 100)::int < 6 THEN '09:00:00'::time + (random() * '90 minutes'::interval + '16 minutes'::interval)
        ELSE '09:00:00'::time + (random() * '30 minutes'::interval - '15 minutes'::interval)
    END AS check_in_time,
    -- Standard Day ends at 18:00:00. Early check-out is < 17:45:00.
    CASE 
        WHEN (random() * 100)::int < 4 THEN '18:00:00'::time - (random() * '180 minutes'::interval + '15 minutes'::interval)
        ELSE '18:00:00'::time + (random() * '45 minutes'::interval - '15 minutes'::interval)
    END AS check_out_time
FROM temp_active_employees
CROSS JOIN temp_date_series;

-- 9. SEED ATTENDANCE RECORDS (SUMMARIES)
INSERT INTO aura_attendance_record (
    id, "tenantId", "employeeId", date, "shiftId", "shiftStartTime", "shiftEndTime",
    "clockIn", "clockOut", "workHours", "breakHours", "overtimeHours", status,
    "isLate", "isEarlyOut", "isRegularized", "regularizationId", "approvalStatus",
    "approvedBy", "approvedAt", remarks, "createdAt", "updatedAt"
)
SELECT 
    record_id,
    (SELECT tenant_id FROM vars) AS tenantId,
    employee_id,
    date::timestamp,
    (SELECT id FROM aura_shift WHERE "tenantId" = (SELECT tenant_id FROM vars) AND code = 'DAY' LIMIT 1) AS shiftId,
    (date + '09:00:00'::time)::timestamp AS shiftStartTime,
    (date + '18:00:00'::time)::timestamp AS shiftEndTime,
    CASE WHEN status = 'PRESENT' THEN (date + check_in_time)::timestamp ELSE NULL END AS clockIn,
    CASE WHEN status = 'PRESENT' THEN (date + check_out_time)::timestamp ELSE NULL END AS clockOut,
    CASE WHEN status = 'PRESENT' THEN EXTRACT(EPOCH FROM (check_out_time - check_in_time)) / 3600.0 ELSE 0.0 END AS workHours,
    1.0 AS breakHours,
    CASE WHEN status = 'PRESENT' AND (EXTRACT(EPOCH FROM (check_out_time - check_in_time)) / 3600.0) > 9.0 
         THEN (EXTRACT(EPOCH FROM (check_out_time - check_in_time)) / 3600.0) - 9.0 
         ELSE 0.0 END AS overtimeHours,
    status,
    CASE WHEN status = 'PRESENT' AND check_in_time > '09:15:00'::time THEN true ELSE false END AS isLate,
    CASE WHEN status = 'PRESENT' AND check_out_time < '17:45:00'::time THEN true ELSE false END AS isEarlyOut,
    false AS isRegularized,
    NULL AS regularizationId,
    'APPROVED' AS approvalStatus,
    NULL AS approvedBy,
    NULL AS approvedAt,
    NULL AS remarks,
    NOW(),
    NOW()
FROM temp_attendance_base;

-- 10. SEED ATTENDANCE PUNCHES (RAW SIGNAL EVIDENCE LOGS)
-- CLOCK_IN Punches
INSERT INTO aura_attendance_punch (
    id, "tenantId", "employeeId", "punchDate", "punchTime", "punchType", location, device, "ipAddress", photo, notes, "isVerified", "verifiedBy", "verifiedAt", "isRegularized", "regularizedBy", "regularizationReason", "createdAt", "updatedAt"
)
SELECT 
    gen_random_uuid(),
    (SELECT tenant_id FROM vars),
    employee_id,
    date::timestamp,
    (date + check_in_time)::timestamp,
    'CLOCK_IN',
    'Office Headquarters',
    'T-MAX 900',
    '192.168.10.15',
    NULL,
    NULL,
    true,
    (SELECT user_id FROM vars),
    NOW(),
    false,
    NULL,
    NULL,
    NOW(),
    NOW()
FROM temp_attendance_base
WHERE status = 'PRESENT';

-- CLOCK_OUT Punches
INSERT INTO aura_attendance_punch (
    id, "tenantId", "employeeId", "punchDate", "punchTime", "punchType", location, device, "ipAddress", photo, notes, "isVerified", "verifiedBy", "verifiedAt", "isRegularized", "regularizedBy", "regularizationReason", "createdAt", "updatedAt"
)
SELECT 
    gen_random_uuid(),
    (SELECT tenant_id FROM vars),
    employee_id,
    date::timestamp,
    (date + check_out_time)::timestamp,
    'CLOCK_OUT',
    'Office Headquarters',
    'T-MAX 900',
    '192.168.10.15',
    NULL,
    NULL,
    true,
    (SELECT user_id FROM vars),
    NOW(),
    false,
    NULL,
    NULL,
    NOW(),
    NOW()
FROM temp_attendance_base
WHERE status = 'PRESENT';

-- 11. SEED REGULARIZATION REQUESTS
CREATE TEMP TABLE temp_regularizations_base AS
SELECT 
    record_id,
    employee_id,
    date,
    status,
    check_in_time,
    check_out_time,
    row_number() OVER () as row_num
FROM temp_attendance_base
WHERE status = 'ABSENT' OR check_in_time > '09:15:00'::time OR check_out_time < '17:45:00'::time
LIMIT 120;

INSERT INTO aura_attendance_regularization (
    id, "tenantId", "employeeId", date, "regularizationType", "requestedClockIn", "requestedClockOut", reason, status, "approvedBy", "approvedAt", "rejectionReason", "createdAt", "updatedAt"
)
SELECT 
    gen_random_uuid() AS id,
    (SELECT tenant_id FROM vars) AS tenantId,
    employee_id,
    date::timestamp,
    CASE WHEN status = 'ABSENT' THEN 'MISSING_PUNCH' ELSE 'LATE_CORRECTION' END AS regularizationType,
    (date + '09:00:00'::time)::timestamp AS requestedClockIn,
    (date + '18:00:00'::time)::timestamp AS requestedClockOut,
    'Onsite client meetings. Forgot badge or device punch out.',
    CASE 
        WHEN row_num % 3 = 0 THEN 'PENDING'
        WHEN row_num % 3 = 1 THEN 'REJECTED'
        ELSE 'APPROVED'
    END AS status,
    CASE WHEN row_num % 3 != 0 THEN (SELECT user_id FROM vars) ELSE NULL END AS approvedBy,
    CASE WHEN row_num % 3 != 0 THEN NOW() - INTERVAL '1 day' ELSE NULL END AS approvedAt,
    CASE WHEN row_num % 3 = 1 THEN 'Please attach manager authorization note or calendar proof' ELSE NULL END AS rejectionReason,
    NOW(),
    NOW()
FROM temp_regularizations_base;

-- Update records that have been APPROVED for regularization to synchronize data
UPDATE aura_attendance_record r
SET 
    "isRegularized" = true,
    "clockIn" = (r.date + '09:00:00'::time)::timestamp,
    "clockOut" = (r.date + '18:00:00'::time)::timestamp,
    "workHours" = 8.0,
    status = 'PRESENT',
    "isLate" = false,
    "isEarlyOut" = false,
    "regularizationId" = reg.id,
    "approvalStatus" = 'APPROVED',
    "approvedBy" = reg."approvedBy",
    "approvedAt" = reg."approvedAt"
FROM aura_attendance_regularization reg
WHERE r."employeeId" = reg."employeeId" 
  AND r.date = reg.date
  AND reg.status = 'APPROVED';

-- 12. SEED FRAUD FLAGS REGISTER
CREATE TEMP TABLE temp_fraud_base AS
SELECT 
    employee_id,
    date,
    row_number() OVER () as row_num
FROM temp_attendance_base
WHERE status = 'PRESENT'
LIMIT 90;

INSERT INTO aura_attendance_fraud_flag (
    id, "tenantId", "employeeId", "punchDate", "flagType", severity, score, "evidenceJson", status, "resolvedAt", "resolvedBy", "resolutionNotes", "createdAt", "updatedAt"
)
SELECT 
    gen_random_uuid(),
    (SELECT tenant_id FROM vars),
    employee_id,
    date::timestamp,
    CASE 
        WHEN row_num % 5 = 0 THEN 'BUDDY_PUNCHING'
        WHEN row_num % 5 = 1 THEN 'GEOFENCE_MISMATCH'
        WHEN row_num % 5 = 2 THEN 'SHARING_IP'
        WHEN row_num % 5 = 3 THEN 'TIME_DRIFT'
        ELSE 'GHOST_PRESENCE'
    END AS flagType,
    CASE 
        WHEN row_num % 4 = 0 THEN 'LOW'
        WHEN row_num % 4 = 1 THEN 'MEDIUM'
        WHEN row_num % 4 = 2 THEN 'HIGH'
        ELSE 'CRITICAL'
    END AS severity,
    CASE 
        WHEN row_num % 4 = 0 THEN 25
        WHEN row_num % 4 = 1 THEN 50
        WHEN row_num % 4 = 2 THEN 75
        ELSE 95
    END AS score,
    CASE 
        WHEN row_num % 5 = 0 THEN '{"suspectedEmployee": "EMP-002", "deviceId": "DEV-32", "confidence": "high"}'::jsonb
        WHEN row_num % 5 = 1 THEN '{"distanceMeters": 350, "geofenceRadius": 200, "lat": 25.2048, "lng": 55.2708}'::jsonb
        WHEN row_num % 5 = 2 THEN '{"sharedIp": "194.120.45.15", "concurrentUsers": 6}'::jsonb
        WHEN row_num % 5 = 3 THEN '{"deviceTimeDriftSeconds": 150}'::jsonb
        ELSE '{"heartbeatMissing": true, "durationMinutes": 480}'::jsonb
    END AS evidenceJson,
    CASE 
        WHEN row_num % 3 = 0 THEN 'OPEN'
        ELSE 'RESOLVED'
    END AS status,
    CASE WHEN row_num % 3 != 0 THEN NOW() - INTERVAL '2 days' ELSE NULL END AS resolvedAt,
    CASE WHEN row_num % 3 != 0 THEN (SELECT user_id FROM vars) ELSE NULL END AS resolvedBy,
    CASE WHEN row_num % 3 != 0 THEN 'Resolved. Geolocation mismatch justified due to corporate sales travel.' ELSE NULL END AS resolutionNotes,
    NOW(),
    NOW()
FROM temp_fraud_base;

-- 13. SEED MONTHLY COMPLIANCE CERTIFICATES
INSERT INTO aura_attendance_certificate (
    id, "tenantId", period, status, "punchesTotal", "missingPunchCount", "lateCount",
    "regularizationsPending", "fraudFlagsOpen", "absconding3DayCount", "consentMissingCount",
    "gatingReason", "attestationsJson", "generatedAt", "signedAt", "signedBy", "createdAt", "updatedAt"
)
SELECT 
    gen_random_uuid(),
    (SELECT tenant_id FROM vars),
    p.period,
    CASE WHEN p.period = '2026-08' THEN 'DRAFT' ELSE 'SIGNED' END AS status,
    COALESCE(punches.total, 1200) AS punchesTotal,
    COALESCE(records.missing, 10) AS missingPunchCount,
    COALESCE(records.late, 15) AS lateCount,
    COALESCE(regs.pending, 5) AS regularizationsPending,
    COALESCE(frauds.open_flags, 2) AS fraudFlagsOpen,
    COALESCE(absconds.count, 0) AS absconding3DayCount,
    COALESCE(consents.missing, 1) AS consentMissingCount,
    CASE WHEN p.period = '2026-08' AND COALESCE(frauds.open_flags, 2) > 0 THEN 'Open active fraud flags require verification' ELSE NULL END AS gatingReason,
    '[{"id": "attest_01", "label": "All device raw punches reconciled with biometric checks", "checked": true}, {"id": "attest_02", "label": "No unresolved geolocation discrepancies", "checked": true}]'::jsonb AS attestationsJson,
    NOW() - INTERVAL '1 day',
    CASE WHEN p.period != '2026-08' THEN NOW() - INTERVAL '10 hours' ELSE NULL END,
    CASE WHEN p.period != '2026-08' THEN (SELECT user_id FROM vars) ELSE NULL END,
    NOW(),
    NOW()
FROM (
    SELECT '2026-03' AS period UNION SELECT '2026-04' UNION SELECT '2026-05' UNION 
    SELECT '2026-06' UNION SELECT '2026-07' UNION SELECT '2026-08'
) p
LEFT JOIN (
    SELECT to_char("punchDate", 'YYYY-MM') AS period, count(*) AS total
    FROM aura_attendance_punch
    WHERE "tenantId" = (SELECT tenant_id FROM vars)
    GROUP BY to_char("punchDate", 'YYYY-MM')
) punches ON p.period = punches.period
LEFT JOIN (
    SELECT 
        to_char(date, 'YYYY-MM') AS period,
        count(CASE WHEN "clockIn" IS NULL AND "clockOut" IS NULL AND status = 'ABSENT' THEN 1 END) AS missing,
        count(CASE WHEN "isLate" = true THEN 1 END) AS late
    FROM aura_attendance_record
    WHERE "tenantId" = (SELECT tenant_id FROM vars)
    GROUP BY to_char(date, 'YYYY-MM')
) records ON p.period = records.period
LEFT JOIN (
    SELECT to_char(date, 'YYYY-MM') AS period, count(*) AS pending
    FROM aura_attendance_regularization
    WHERE "tenantId" = (SELECT tenant_id FROM vars) AND status = 'PENDING'
    GROUP BY to_char(date, 'YYYY-MM')
) regs ON p.period = regs.period
LEFT JOIN (
    SELECT to_char("punchDate", 'YYYY-MM') AS period, count(*) AS open_flags
    FROM aura_attendance_fraud_flag
    WHERE "tenantId" = (SELECT tenant_id FROM vars) AND status = 'OPEN'
    GROUP BY to_char("punchDate", 'YYYY-MM')
) frauds ON p.period = frauds.period
LEFT JOIN (
    SELECT '2026-07' AS period, 1 AS count UNION SELECT '2026-08' AS period, 2 AS count
) absconds ON p.period = absconds.period
LEFT JOIN (
    SELECT '2026-07' AS period, 1 AS missing UNION SELECT '2026-08' AS period, 2 AS missing
) consents ON p.period = consents.period;

-- CLEANUP TEMPORARY TABLES
DROP TABLE IF EXISTS temp_active_employees;
DROP TABLE IF EXISTS temp_date_series;
DROP TABLE IF EXISTS temp_attendance_base;
DROP TABLE IF EXISTS temp_regularizations_base;
DROP TABLE IF EXISTS temp_fraud_base;

COMMIT;