-- ====================================================================
-- SEED SCRIPT: HR Document Retention & Audit Compliance Module
-- Designed for Neon SQL Console (Transaction Mode)
-- Idempotent, production-quality, and fully database-consistent.
-- ====================================================================

BEGIN;

DO $$
DECLARE
  v_tenant_id TEXT;
  v_company_id TEXT;
  v_department_id TEXT;
  v_location_id TEXT;
  v_job_profile_id TEXT;
  v_grade_id TEXT;
  v_status_id TEXT;
  v_type_id TEXT;
  v_user_id TEXT;
  v_emp_count INT;
  
  -- Compliance and hold pointers
  v_temp_emp_id TEXT;
  v_hold_id TEXT;
  v_hold_emp_id TEXT;
  v_hold_released_id TEXT;
  v_disposal_id TEXT;
  v_audit_id TEXT;
  v_audit_closed_id TEXT;
  v_audit_in_progress_id TEXT;
  
  -- Target ranges for docs
  v_issued_at TIMESTAMP;
  v_expires_at TIMESTAMP;
  v_retention_until TIMESTAMP;
  v_doc_status VARCHAR;
  v_hold_to_apply TEXT;
  v_doc_title VARCHAR;
  v_doc_dept VARCHAR;
  v_country_code VARCHAR;
  v_doc_count INT := 0;
  
  -- Document JSON collectors
  v_pending_docs_json JSON;
  v_approved_docs_json JSON;
  v_executed_docs_json JSON;
  v_blocked_docs_json JSON;
  
  -- Monthly certificate timeline variables
  v_target_date TIMESTAMP;
  v_period_str VARCHAR;
  
  -- Employee cursor
  c_emp CURSOR FOR SELECT id, "companyId", "departmentId" FROM aura_employee LIMIT 40;
  r_emp RECORD;

BEGIN
  -- ==================================================================
  -- 1. PREREQUISITES BOOTSTRAP (Ensures the database can run the demo)
  -- ==================================================================
  
  -- Resolve Tenant
  SELECT id::text INTO v_tenant_id FROM aura_tenant WHERE code = 'KREUP_AI' LIMIT 1;
  IF v_tenant_id IS NULL THEN
    SELECT id::text INTO v_tenant_id FROM aura_tenant LIMIT 1;
  END IF;
  IF v_tenant_id IS NULL THEN
    v_tenant_id := gen_random_uuid()::text;
    INSERT INTO aura_tenant (id, code, name, "createdAt", "updatedAt")
    VALUES (v_tenant_id, 'KREUP_AI', 'KreupAI Technologies', NOW(), NOW());
  END IF;
  
  -- Resolve Company
  SELECT id::text INTO v_company_id FROM aura_company WHERE "tenantId" = v_tenant_id LIMIT 1;
  IF v_company_id IS NULL THEN
    v_company_id := gen_random_uuid()::text;
    INSERT INTO aura_company (id, "tenantId", code, name, status, "createdAt", "updatedAt")
    VALUES (v_company_id, v_tenant_id, 'KREUP_GLOBAL', 'KreupAI Global Corp', 'Active', NOW(), NOW());
  END IF;

  -- Resolve Department
  SELECT id::text INTO v_department_id FROM aura_department WHERE "companyId" = v_company_id LIMIT 1;
  IF v_department_id IS NULL THEN
    v_department_id := gen_random_uuid()::text;
    INSERT INTO aura_department (id, "companyId", code, name, "createdAt", "updatedAt")
    VALUES (v_department_id, v_company_id, 'DEPT_HR', 'Human Resources', NOW(), NOW());
  END IF;

  -- Resolve Location
  SELECT id::text INTO v_location_id FROM aura_location WHERE "companyId" = v_company_id LIMIT 1;
  IF v_location_id IS NULL THEN
    SELECT id::text INTO v_location_id FROM aura_location LIMIT 1;
    IF v_location_id IS NULL THEN
      v_location_id := gen_random_uuid()::text;
      INSERT INTO aura_location (id, code, name, "companyId", "createdAt", "updatedAt")
      VALUES (v_location_id, 'LOC_DXB', 'Dubai Head Office', v_company_id, NOW(), NOW());
    END IF;
  END IF;

  -- Resolve Job Profile
  SELECT id::text INTO v_job_profile_id FROM aura_job_profile LIMIT 1;
  IF v_job_profile_id IS NULL THEN
    v_job_profile_id := gen_random_uuid()::text;
    INSERT INTO aura_job_profile (id, code, title, familyId, gradeId, status, "createdAt", "updatedAt")
    VALUES (v_job_profile_id, 'JP_HR_MGR', 'HR Manager', NULL, NULL, 'Active', NOW(), NOW());
  END IF;

  -- Resolve Grade
  SELECT id::text INTO v_grade_id FROM aura_grade LIMIT 1;
  IF v_grade_id IS NULL THEN
    v_grade_id := gen_random_uuid()::text;
    INSERT INTO aura_grade (id, code, name, level, "createdAt", "updatedAt")
    VALUES (v_grade_id, 'L5', 'Manager', 5, NOW(), NOW());
  END IF;

  -- Resolve Employee Status
  SELECT id::text INTO v_status_id FROM aura_employee_status LIMIT 1;
  IF v_status_id IS NULL THEN
    v_status_id := gen_random_uuid()::text;
    INSERT INTO aura_employee_status (id, code, name, "createdAt", "updatedAt")
    VALUES (v_status_id, 'ACTIVE', 'Active', NOW(), NOW());
  END IF;

  -- Resolve Employment Type
  SELECT id::text INTO v_type_id FROM aura_employment_type LIMIT 1;
  IF v_type_id IS NULL THEN
    v_type_id := gen_random_uuid()::text;
    INSERT INTO aura_employment_type (id, code, name, "createdAt", "updatedAt")
    VALUES (v_type_id, 'FULL_TIME', 'Full Time', NOW(), NOW());
  END IF;

  -- Resolve User
  SELECT id::text INTO v_user_id FROM aura_user WHERE "tenantId" = v_tenant_id LIMIT 1;
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid()::text;
    INSERT INTO aura_user (id, email, password, "tenantId", status, "createdAt", "updatedAt")
    VALUES (v_user_id, 'governance.officer@kreup.ai', '$2b$10$xyz', v_tenant_id, 'Active', NOW(), NOW());
  END IF;

  -- Populate default employees ONLY if there are absolutely no employees in the entire database
  SELECT COUNT(*) INTO v_emp_count FROM aura_employee;
  IF v_emp_count = 0 THEN
    FOR i IN 1..20 LOOP
      INSERT INTO aura_employee (
        id, "employeeCode", "firstName", "lastName", email, "companyId", "departmentId", 
        "locationId", "jobProfileId", "gradeId", "statusId", "typeId", "joiningDate", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid()::text,
        'EMP-RETDOC-' || LPAD(i::text, 3, '0'),
        CASE WHEN i % 3 = 0 THEN 'Fatima' WHEN i % 3 = 1 THEN 'Yousef' ELSE 'Zahid' END,
        CASE WHEN i % 3 = 0 THEN 'Al-Suwaidi' WHEN i % 3 = 1 THEN 'Al-Dosari' ELSE 'Khan' END,
        'employee.' || i || '@kreup.ai',
        v_company_id,
        v_department_id,
        v_location_id,
        v_job_profile_id,
        v_grade_id,
        v_status_id,
        v_type_id,
        NOW() - (i || ' years')::INTERVAL,
        NOW(),
        NOW()
      );
    END LOOP;
  END IF;

  -- ==================================================================
  -- 2. CLEAR PREVIOUS MODULE DATA (Ensures complete idempotency)
  -- ==================================================================
  DELETE FROM aura_doc_compliance_certificate WHERE "tenantId" = v_tenant_id;
  DELETE FROM aura_hr_audit_finding WHERE "tenantId" = v_tenant_id;
  DELETE FROM aura_hr_audit_cycle WHERE "tenantId" = v_tenant_id;
  DELETE FROM aura_doc_disposal_request WHERE "tenantId" = v_tenant_id;
  DELETE FROM aura_hr_document WHERE "tenantId" = v_tenant_id;
  DELETE FROM aura_doc_litigation_hold WHERE "tenantId" = v_tenant_id;
  DELETE FROM aura_doc_retention_schedule WHERE "tenantId" = v_tenant_id;

  -- ==================================================================
  -- 3. SEED RETENTION SCHEDULES (GCC + Global Fallbacks)
  -- ==================================================================
  INSERT INTO aura_doc_retention_schedule (
    id, "tenantId", "countryCode", "recordType", "retentionYears", basis, classification, "effectiveFrom", status, "createdAt", "updatedAt"
  )
  SELECT 
    gen_random_uuid()::text,
    v_tenant_id,
    c,
    r,
    CASE 
      WHEN r = 'PENSION' THEN 15
      WHEN r = 'CONTRACT' OR r = 'EXIT' OR r = 'TAX' THEN 10
      WHEN r = 'MEDICAL' OR r = 'INSURANCE' THEN 7
      WHEN r = 'PERFORMANCE' OR r = 'CERTIFICATE' THEN 3
      ELSE 5
    END,
    c || ' Regulatory Compliance Law Basis for ' || r,
    CASE 
      WHEN r = 'MEDICAL' OR r = 'PASSPORT' OR r = 'NATIONAL_ID' THEN 'RESTRICTED'
      WHEN r = 'CONTRACT' OR r = 'PAYROLL' OR r = 'DISCIPLINARY' OR r = 'TAX' OR r = 'PENSION' THEN 'CONFIDENTIAL'
      WHEN r = 'CERTIFICATE' THEN 'PUBLIC'
      ELSE 'INTERNAL'
    END,
    NOW() - INTERVAL '3 years',
    'ACTIVE',
    NOW(),
    NOW()
  FROM (
    SELECT unnest(ARRAY['AE', 'SA', 'BH', 'QA', 'OM', 'KW', NULL]) AS c
  ) co
  CROSS JOIN (
    SELECT unnest(ARRAY['CONTRACT', 'PAYROLL', 'MEDICAL', 'PASSPORT', 'VISA', 'NATIONAL_ID', 'PERFORMANCE', 'WARNING', 'CERTIFICATE', 'LEAVE', 'EXIT', 'DISCIPLINARY', 'INSURANCE', 'TAX', 'PENSION']) AS r
  ) re;

  -- ==================================================================
  -- 4. SEED LITIGATION HOLDS
  -- ==================================================================
  
  -- Case 1: Active Corporate Tax Hold
  v_hold_id := gen_random_uuid()::text;
  INSERT INTO aura_doc_litigation_hold (
    id, "tenantId", "caseNumber", subject, "scopeFilter", "startedAt", "startedBy", status, "createdAt", "updatedAt"
  ) VALUES (
    v_hold_id,
    v_tenant_id,
    'CASE-2026-HOLD01',
    'Federal Tax Audit Investigation - FY2025',
    '{"recordType": "TAX"}'::jsonb,
    NOW() - INTERVAL '6 months',
    v_user_id,
    'ACTIVE',
    NOW(),
    NOW()
  );

  -- Resolve employee for case 2 hold
  SELECT id::text INTO v_temp_emp_id FROM aura_employee LIMIT 1;
  
  -- Case 2: Active Employee Arbitration Hold
  v_hold_emp_id := gen_random_uuid()::text;
  INSERT INTO aura_doc_litigation_hold (
    id, "tenantId", "caseNumber", subject, "scopeFilter", "startedAt", "startedBy", status, "createdAt", "updatedAt"
  ) VALUES (
    v_hold_emp_id,
    v_tenant_id,
    'CASE-2026-HOLD02',
    'Pending Employee Arbitration - Labor Dispute',
    jsonb_build_object('employeeId', v_temp_emp_id),
    NOW() - INTERVAL '2 months',
    v_user_id,
    'ACTIVE',
    NOW(),
    NOW()
  );

  -- Case 3: Concluded GDPR Audit Hold (Released)
  v_hold_released_id := gen_random_uuid()::text;
  INSERT INTO aura_doc_litigation_hold (
    id, "tenantId", "caseNumber", subject, "scopeFilter", "startedAt", "startedBy", "endedAt", "endedBy", status, "createdAt", "updatedAt"
  ) VALUES (
    v_hold_released_id,
    v_tenant_id,
    'CASE-2025-HOLD03',
    'Routine GDPR Audit Verification - Concluded',
    '{"recordType": "PASSPORT"}'::jsonb,
    NOW() - INTERVAL '1 year',
    v_user_id,
    NOW() - INTERVAL '6 months',
    v_user_id,
    'RELEASED',
    NOW(),
    NOW()
  );

  -- ==================================================================
  -- 5. SEED GOVERNED HR DOCUMENTS (Iterates through active employees)
  -- ==================================================================
  OPEN c_emp;
  LOOP
    FETCH c_emp INTO r_emp;
    EXIT WHEN NOT FOUND;
    
    -- Distribute country codes realistically
    v_country_code := CASE 
      WHEN (v_doc_count % 3) = 0 THEN 'AE'
      WHEN (v_doc_count % 3) = 1 THEN 'SA'
      ELSE 'BH'
    END;

    -- Distribute departments realistically
    v_doc_dept := CASE 
      WHEN (v_doc_count % 5) = 0 THEN 'Engineering'
      WHEN (v_doc_count % 5) = 1 THEN 'Product'
      WHEN (v_doc_count % 5) = 2 THEN 'Finance'
      WHEN (v_doc_count % 5) = 3 THEN 'Sales'
      ELSE 'HR Operations'
    END;

    -- Document 1: CONTRACT (Active & Compliant)
    v_issued_at := NOW() - INTERVAL '3 years';
    v_expires_at := NOW() + INTERVAL '5 years';
    v_retention_until := v_issued_at + INTERVAL '10 years';
    v_doc_status := 'ACTIVE';
    v_hold_to_apply := CASE WHEN r_emp.id::text = v_temp_emp_id THEN v_hold_emp_id ELSE NULL END;
    v_doc_title := 'Employment Contract - ' || r_emp.id;
    
    INSERT INTO aura_hr_document (
      id, "tenantId", "employeeId", "recordType", title, "fileUrl", classification,
      "issuedAt", "expiresAt", "retentionUntil", "litigationHoldId", status, "metadataJson", "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid()::text, v_tenant_id, r_emp.id::text, 'CONTRACT', v_doc_title,
      's3://aura-hcm-docs/production/contracts/emp_contract_' || r_emp.id || '.pdf',
      'CONFIDENTIAL', v_issued_at, v_expires_at, v_retention_until, v_hold_to_apply, v_doc_status,
      jsonb_build_object('department', v_doc_dept, 'countryCode', v_country_code), NOW(), NOW()
    );
    v_doc_count := v_doc_count + 1;

    -- Document 2: PASSPORT (Expiring Soon - 30 days)
    v_issued_at := NOW() - INTERVAL '4 years 11 months';
    v_expires_at := NOW() + INTERVAL '20 days';
    v_retention_until := v_issued_at + INTERVAL '5 years';
    v_doc_status := 'ACTIVE';
    
    INSERT INTO aura_hr_document (
      id, "tenantId", "employeeId", "recordType", title, "fileUrl", classification,
      "issuedAt", "expiresAt", "retentionUntil", "litigationHoldId", status, "metadataJson", "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid()::text, v_tenant_id, r_emp.id::text, 'PASSPORT', 'Passport Scan Copy',
      's3://aura-hcm-docs/production/identity/passport_' || r_emp.id || '.jpg',
      'RESTRICTED', v_issued_at, v_expires_at, v_retention_until, NULL, v_doc_status,
      jsonb_build_object('department', v_doc_dept, 'countryCode', v_country_code), NOW(), NOW()
    );
    v_doc_count := v_doc_count + 1;

    -- Document 3: VISA (Expiring Soon - 60 days)
    v_issued_at := NOW() - INTERVAL '1 year 11 months';
    v_expires_at := NOW() + INTERVAL '45 days';
    v_retention_until := v_issued_at + INTERVAL '5 years';
    v_doc_status := 'ACTIVE';
    
    INSERT INTO aura_hr_document (
      id, "tenantId", "employeeId", "recordType", title, "fileUrl", classification,
      "issuedAt", "expiresAt", "retentionUntil", "litigationHoldId", status, "metadataJson", "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid()::text, v_tenant_id, r_emp.id::text, 'VISA', 'Residency Permit Visa',
      's3://aura-hcm-docs/production/visas/visa_' || r_emp.id || '.pdf',
      'INTERNAL', v_issued_at, v_expires_at, v_retention_until, NULL, v_doc_status,
      jsonb_build_object('department', v_doc_dept, 'countryCode', v_country_code), NOW(), NOW()
    );
    v_doc_count := v_doc_count + 1;

    -- Document 4: NATIONAL_ID (Expiring Soon - 90 days)
    v_issued_at := NOW() - INTERVAL '1 year 10 months';
    v_expires_at := NOW() + INTERVAL '75 days';
    v_retention_until := v_issued_at + INTERVAL '5 years';
    v_doc_status := 'ACTIVE';
    
    INSERT INTO aura_hr_document (
      id, "tenantId", "employeeId", "recordType", title, "fileUrl", classification,
      "issuedAt", "expiresAt", "retentionUntil", "litigationHoldId", status, "metadataJson", "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid()::text, v_tenant_id, r_emp.id::text, 'NATIONAL_ID', 'National ID Card Scan',
      's3://aura-hcm-docs/production/national_ids/eid_' || r_emp.id || '.jpg',
      'RESTRICTED', v_issued_at, v_expires_at, v_retention_until, NULL, v_doc_status,
      jsonb_build_object('department', v_doc_dept, 'countryCode', v_country_code), NOW(), NOW()
    );
    v_doc_count := v_doc_count + 1;

    -- Document 5: WARNING (Expired / Retention Not Met)
    v_issued_at := NOW() - INTERVAL '2 years';
    v_expires_at := NOW() - INTERVAL '1 month';
    v_retention_until := v_issued_at + INTERVAL '5 years';
    v_doc_status := 'ACTIVE';
    
    INSERT INTO aura_hr_document (
      id, "tenantId", "employeeId", "recordType", title, "fileUrl", classification,
      "issuedAt", "expiresAt", "retentionUntil", "litigationHoldId", status, "metadataJson", "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid()::text, v_tenant_id, r_emp.id::text, 'WARNING', 'Official Written Warning',
      's3://aura-hcm-docs/production/disciplinary/warning_' || r_emp.id || '.pdf',
      'CONFIDENTIAL', v_issued_at, v_expires_at, v_retention_until, NULL, v_doc_status,
      jsonb_build_object('department', v_doc_dept, 'countryCode', v_country_code), NOW(), NOW()
    );
    v_doc_count := v_doc_count + 1;

    -- Document 6: TAX (Active under Active Litigation Hold)
    v_issued_at := NOW() - INTERVAL '1 year';
    v_expires_at := NULL;
    v_retention_until := v_issued_at + INTERVAL '10 years';
    v_doc_status := 'ACTIVE';
    
    INSERT INTO aura_hr_document (
      id, "tenantId", "employeeId", "recordType", title, "fileUrl", classification,
      "issuedAt", "expiresAt", "retentionUntil", "litigationHoldId", status, "metadataJson", "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid()::text, v_tenant_id, r_emp.id::text, 'TAX', 'Declaration of Tax Residence',
      's3://aura-hcm-docs/production/tax/tax_declaration_' || r_emp.id || '.pdf',
      'CONFIDENTIAL', v_issued_at, v_expires_at, v_retention_until, v_hold_id, v_doc_status,
      jsonb_build_object('department', v_doc_dept, 'countryCode', v_country_code), NOW(), NOW()
    );
    v_doc_count := v_doc_count + 1;

    -- Document 7: MEDICAL (Active & Compliant)
    v_issued_at := NOW() - INTERVAL '6 months';
    v_expires_at := NOW() + INTERVAL '6 months';
    v_retention_until := v_issued_at + INTERVAL '7 years';
    v_doc_status := 'ACTIVE';
    
    INSERT INTO aura_hr_document (
      id, "tenantId", "employeeId", "recordType", title, "fileUrl", classification,
      "issuedAt", "expiresAt", "retentionUntil", "litigationHoldId", status, "metadataJson", "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid()::text, v_tenant_id, r_emp.id::text, 'MEDICAL', 'Medical Health Checkup Report',
      's3://aura-hcm-docs/production/medical/clearance_' || r_emp.id || '.pdf',
      'RESTRICTED', v_issued_at, v_expires_at, v_retention_until, NULL, v_doc_status,
      jsonb_build_object('department', v_doc_dept, 'countryCode', v_country_code), NOW(), NOW()
    );
    v_doc_count := v_doc_count + 1;

    -- Document 8: CERTIFICATE (Exceeded Retention - Ready for Disposal)
    v_issued_at := NOW() - INTERVAL '10 years';
    v_expires_at := NOW() - INTERVAL '9 years';
    v_retention_until := v_issued_at + INTERVAL '3 years'; -- expired 7 years ago
    v_doc_status := 'ACTIVE';
    
    INSERT INTO aura_hr_document (
      id, "tenantId", "employeeId", "recordType", title, "fileUrl", classification,
      "issuedAt", "expiresAt", "retentionUntil", "litigationHoldId", status, "metadataJson", "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid()::text, v_tenant_id, r_emp.id::text, 'CERTIFICATE', 'Security Training Certificate',
      's3://aura-hcm-docs/production/certificates/training_' || r_emp.id || '.pdf',
      'PUBLIC', v_issued_at, v_expires_at, v_retention_until, NULL, v_doc_status,
      jsonb_build_object('department', v_doc_dept, 'countryCode', v_country_code), NOW(), NOW()
    );
    v_doc_count := v_doc_count + 1;

    -- Document 9: LEAVE (Archived / Soft-Deleted status)
    v_issued_at := NOW() - INTERVAL '5 years';
    v_expires_at := NOW() - INTERVAL '3 years';
    v_retention_until := v_issued_at + INTERVAL '5 years';
    v_doc_status := 'ARCHIVED';
    
    INSERT INTO aura_hr_document (
      id, "tenantId", "employeeId", "recordType", title, "fileUrl", classification,
      "issuedAt", "expiresAt", "retentionUntil", "litigationHoldId", status, "metadataJson", "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid()::text, v_tenant_id, r_emp.id::text, 'LEAVE', 'Holiday Request Log Sheet',
      's3://aura-hcm-docs/production/leaves/leave_req_' || r_emp.id || '.pdf',
      'INTERNAL', v_issued_at, v_expires_at, v_retention_until, NULL, v_doc_status,
      jsonb_build_object('department', v_doc_dept, 'countryCode', v_country_code), NOW(), NOW()
    );
    v_doc_count := v_doc_count + 1;
    
  END LOOP;
  CLOSE c_emp;

  -- Update Litigation Hold doc counts dynamically based on insertions
  UPDATE aura_doc_litigation_hold h
  SET "heldDocCount" = (
    SELECT COUNT(*) 
    FROM aura_hr_document d 
    WHERE d."litigationHoldId" = h.id AND d."tenantId" = v_tenant_id
  )
  WHERE h."tenantId" = v_tenant_id;

  -- ==================================================================
  -- 6. SEED DISPOSAL REQUESTS (Covers all lifecycle stages)
  -- ==================================================================
  
  -- Pending Disposal JSON
  SELECT json_agg(id::text) INTO v_pending_docs_json
  FROM (
    SELECT id FROM aura_hr_document 
    WHERE "recordType" = 'CERTIFICATE' AND "retentionUntil" < NOW() AND "tenantId" = v_tenant_id
    LIMIT 3
  ) temp_p;

  -- Approved Disposal JSON
  SELECT json_agg(id::text) INTO v_approved_docs_json
  FROM (
    SELECT id FROM aura_hr_document 
    WHERE "recordType" = 'CERTIFICATE' AND "retentionUntil" < NOW() AND "tenantId" = v_tenant_id
    OFFSET 3 LIMIT 2
  ) temp_a;

  -- Executed Disposal JSON
  SELECT json_agg(id::text) INTO v_executed_docs_json
  FROM (
    SELECT id FROM aura_hr_document 
    WHERE "recordType" = 'LEAVE' AND "tenantId" = v_tenant_id
    LIMIT 3
  ) temp_e;

  -- Blocked Disposal JSON (targets files with active holds)
  SELECT json_agg(id::text) INTO v_blocked_docs_json
  FROM (
    SELECT id FROM aura_hr_document 
    WHERE "litigationHoldId" IS NOT NULL AND "tenantId" = v_tenant_id
    LIMIT 2
  ) temp_b;

  -- Request 1: PENDING
  INSERT INTO aura_doc_disposal_request (
    id, "tenantId", "documentIds", reason, status, "requestedAt", "requestedBy", "createdAt", "updatedAt"
  ) VALUES (
    gen_random_uuid()::text, v_tenant_id, COALESCE(v_pending_docs_json, '[]'::json),
    'Scheduled delete for expired training records older than 3 years.',
    'PENDING', NOW() - INTERVAL '3 days', v_user_id, NOW(), NOW()
  );

  -- Request 2: APPROVED
  INSERT INTO aura_doc_disposal_request (
    id, "tenantId", "documentIds", reason, status, "requestedAt", "requestedBy", "approverId", "approvedAt", "createdAt", "updatedAt"
  ) VALUES (
    gen_random_uuid()::text, v_tenant_id, COALESCE(v_approved_docs_json, '[]'::json),
    'Manual review approved. Purging historical performance certificates.',
    'APPROVED', NOW() - INTERVAL '5 days', v_user_id, v_user_id, NOW() - INTERVAL '1 day', NOW(), NOW()
  );

  -- Request 3: EXECUTED
  v_disposal_id := gen_random_uuid()::text;
  INSERT INTO aura_doc_disposal_request (
    id, "tenantId", "documentIds", reason, status, "requestedAt", "requestedBy", "approverId", "approvedAt", "executedAt", "executedBy", "createdAt", "updatedAt"
  ) VALUES (
    v_disposal_id, v_tenant_id, COALESCE(v_executed_docs_json, '[]'::json),
    'Completed GDPR automated clean script for obsolete holiday registries.',
    'EXECUTED', NOW() - INTERVAL '20 days', v_user_id, v_user_id, NOW() - INTERVAL '15 days', NOW() - INTERVAL '12 days', v_user_id, NOW(), NOW()
  );

  -- Mark executed documents as physically disposed in Register
  UPDATE aura_hr_document
  SET status = 'DISPOSED',
      "disposedAt" = NOW() - INTERVAL '12 days',
      "disposedBy" = v_user_id,
      "disposalReason" = 'Completed GDPR automated clean script for obsolete holiday registries.'
  WHERE id::text IN (
    SELECT jsonb_array_elements_text(COALESCE(v_executed_docs_json::jsonb, '[]'::jsonb))
  ) AND "tenantId" = v_tenant_id;

  -- Request 4: BLOCKED
  INSERT INTO aura_doc_disposal_request (
    id, "tenantId", "documentIds", reason, status, "requestedAt", "requestedBy", "blockedReason", "createdAt", "updatedAt"
  ) VALUES (
    gen_random_uuid()::text, v_tenant_id, COALESCE(v_blocked_docs_json, '[]'::json),
    'Disposal clean requested on 2025 taxation files.',
    'BLOCKED', NOW() - INTERVAL '1 day', v_user_id,
    'Litigation Hold CASE-2026-HOLD01 is currently active on items within this scope.',
    NOW(), NOW()
  );

  -- ==================================================================
  -- 7. SEED AUDIT CYCLES & FINDINGS
  -- ==================================================================
  
  -- Cycle 1: CLOSED Annual Audit
  v_audit_closed_id := gen_random_uuid()::text;
  INSERT INTO aura_hr_audit_cycle (
    id, "tenantId", label, "scopeJson", "sampleSize", "startedAt", "closedAt", status, "findingsCount", "findingsClosedCount", "createdAt", "updatedAt"
  ) VALUES (
    v_audit_closed_id, v_tenant_id,
    'FY2025 Annual Data Retention Review',
    '{"country": "ALL"}'::jsonb,
    100,
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '60 days',
    'CLOSED',
    2, 2,
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '60 days'
  );

  -- Cycle 2: OPEN Quarterly Audit
  v_audit_id := gen_random_uuid()::text;
  INSERT INTO aura_hr_audit_cycle (
    id, "tenantId", label, "scopeJson", "sampleSize", "startedAt", status, "findingsCount", "findingsClosedCount", "createdAt", "updatedAt"
  ) VALUES (
    v_audit_id, v_tenant_id,
    'Q1 2026 Internal Compliance Inspection',
    '{"recordTypes": ["CONTRACT", "PASSPORT", "TAX"]}'::jsonb,
    35,
    NOW() - INTERVAL '15 days',
    'OPEN',
    4, 1,
    NOW() - INTERVAL '15 days',
    NOW()
  );

  -- Cycle 3: IN PROGRESS / OPEN GCC Spot Audit
  v_audit_in_progress_id := gen_random_uuid()::text;
  INSERT INTO aura_hr_audit_cycle (
    id, "tenantId", label, "scopeJson", "sampleSize", "startedAt", status, "findingsCount", "findingsClosedCount", "createdAt", "updatedAt"
  ) VALUES (
    v_audit_in_progress_id, v_tenant_id,
    'June 2026 GCC Spot Audit',
    '{"country": "AE"}'::jsonb,
    15,
    NOW() - INTERVAL '5 days',
    'OPEN',
    2, 0,
    NOW() - INTERVAL '5 days',
    NOW()
  );

  -- Findings for Cycle 1 (Closed)
  INSERT INTO aura_hr_audit_finding (
    id, "tenantId", "auditCycleId", "documentId", "employeeId", severity, category, title, description, remediation, status, "raisedAt", "closedAt", "closedBy", "createdAt", "updatedAt"
  ) VALUES (
    gen_random_uuid()::text, v_tenant_id, v_audit_closed_id, NULL, v_temp_emp_id,
    'MEDIUM', 'Expired Documents', 'Passport Copy Expired for Employee',
    'Passport scan copy on file has expired on 2025-11-12.',
    'CAPA-101: Employee submitted renewed passport copy. Uploaded to system.',
    'CLOSED', NOW() - INTERVAL '85 days', NOW() - INTERVAL '70 days', v_user_id, NOW(), NOW()
  ), (
    gen_random_uuid()::text, v_tenant_id, v_audit_closed_id, NULL, NULL,
    'HIGH', 'Missing Documents', 'Missing Employment Contract for UAE Local',
    'UAE National employee under review did not have a labor contract uploaded.',
    'CAPA-102: Retrieved signed contract copy from physical files and uploaded.',
    'CLOSED', NOW() - INTERVAL '80 days', NOW() - INTERVAL '65 days', v_user_id, NOW(), NOW()
  );

  -- Findings for Cycle 2 (Active)
  INSERT INTO aura_hr_audit_finding (
    id, "tenantId", "auditCycleId", "documentId", "employeeId", severity, category, title, description, remediation, status, "raisedAt", "createdAt", "updatedAt"
  ) VALUES (
    gen_random_uuid()::text, v_tenant_id, v_audit_id, NULL, NULL,
    'CRITICAL', 'Litigation Hold Violation', 'Attempted Deletion of Litigation Hold Record',
    'An automated script attempted to archive visa record while litigation hold CASE-2026-HOLD02 was active.',
    'CAPA-201: Restrict administrator delete permissions on active case scopes. Lock mechanisms verified.',
    'OPEN', NOW() - INTERVAL '10 days', NOW(), NOW()
  ), (
    gen_random_uuid()::text, v_tenant_id, v_audit_id, NULL, NULL,
    'HIGH', 'Missing Signatures', 'Missing Digital Signature on Executive Contracts',
    'Three senior executive contracts are uploaded without formal digital signature attestation.',
    'CAPA-202: Reroute executive contracts to DocuSign integration module for formal signature capture.',
    'OPEN', NOW() - INTERVAL '8 days', NOW(), NOW()
  ), (
    gen_random_uuid()::text, v_tenant_id, v_audit_id, NULL, NULL,
    'LOW', 'Missing Classification', 'Incorrect Classification Tag on Public Policy Handbook',
    'Leave handbook marked as RESTRICTED instead of PUBLIC.',
    'CAPA-203: Update handbook metadata field to PUBLIC to allow self-service accessibility.',
    'OPEN', NOW() - INTERVAL '5 days', NOW(), NOW()
  );

  INSERT INTO aura_hr_audit_finding (
    id, "tenantId", "auditCycleId", "documentId", "employeeId", severity, category, title, description, remediation, status, "raisedAt", "closedAt", "closedBy", "createdAt", "updatedAt"
  ) VALUES (
    gen_random_uuid()::text, v_tenant_id, v_audit_id, NULL, NULL,
    'MEDIUM', 'Incorrect Storage', 'Incorrect Storage Folder for Confidential Resignations',
    'Resignation letters stored in default internal folder instead of secure directory.',
    'CAPA-204: Relocated resignation folder directory and adjusted path visibility.',
    'CLOSED', NOW() - INTERVAL '12 days', NOW() - INTERVAL '5 days', v_user_id, NOW(), NOW()
  );

  -- Findings for Cycle 3 (In Progress Spot Audit)
  INSERT INTO aura_hr_audit_finding (
    id, "tenantId", "auditCycleId", "documentId", "employeeId", severity, category, title, description, remediation, status, "raisedAt", "createdAt", "updatedAt"
  ) VALUES (
    gen_random_uuid()::text, v_tenant_id, v_audit_in_progress_id, NULL, NULL,
    'MEDIUM', 'Incorrect Retention', 'Retention Over-Calculated for Training Records',
    'Training logs retention set to 10 years instead of standard 3 years.',
    'CAPA-301: Run batch update on all training logs to reduce retention timer.',
    'OPEN', NOW() - INTERVAL '4 days', NOW(), NOW()
  ), (
    gen_random_uuid()::text, v_tenant_id, v_audit_in_progress_id, NULL, NULL,
    'LOW', 'Expired Documents', 'Warning Letters Preserved Post-Expiry',
    'Archived warning letter remains in active register.',
    'CAPA-302: Move warning letters to archived directory.',
    'OPEN', NOW() - INTERVAL '3 days', NOW(), NOW()
  );

  -- Update Audit Cycle counts dynamically to match findings
  UPDATE aura_hr_audit_cycle c
  SET "findingsCount" = (
    SELECT COUNT(*) 
    FROM aura_hr_audit_finding f 
    WHERE f."auditCycleId" = c.id AND f."tenantId" = v_tenant_id
  ),
  "findingsClosedCount" = (
    SELECT COUNT(*) 
    FROM aura_hr_audit_finding f 
    WHERE f."auditCycleId" = c.id AND f.status = 'CLOSED' AND f."tenantId" = v_tenant_id
  )
  WHERE c."tenantId" = v_tenant_id;

  -- ==================================================================
  -- 8. SEED MONTHLY COMPLIANCE CERTIFICATES
  -- ==================================================================
  FOR i IN REVERSE 12..1 LOOP
    v_target_date := NOW() - (i || ' months')::INTERVAL;
    v_period_str := TO_CHAR(v_target_date, 'YYYY-MM');
    
    IF i > 3 THEN
      -- Compliant historical periods (months -12 to -4)
      INSERT INTO aura_doc_compliance_certificate (
        id, "tenantId", period, status, "activeDocs", "expiringSoonCount", "expiredCount", 
        "litigationHoldCount", "pendingDisposalCount", "openFindingsCount", "criticalFindingsCount", 
        "gatingReason", "attestationsJson", "generatedAt", "signedAt", "signedBy", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid()::text, v_tenant_id, v_period_str, 'SIGNED', 180 + (12 - i) * 8, 0, 0, 
        2, 0, 0, 0, 
        NULL, '[{"field": "integrity", "value": "CONFIRMED"}]'::jsonb, 
        v_target_date + INTERVAL '28 days', v_target_date + INTERVAL '29 days', v_user_id,
        NOW(), NOW()
      );
    ELSIF i = 3 THEN
      -- Blocked period (month -3, e.g. 2026-04)
      INSERT INTO aura_doc_compliance_certificate (
        id, "tenantId", period, status, "activeDocs", "expiringSoonCount", "expiredCount", 
        "litigationHoldCount", "pendingDisposalCount", "openFindingsCount", "criticalFindingsCount", 
        "gatingReason", "attestationsJson", "generatedAt", "signedAt", "signedBy", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid()::text, v_tenant_id, v_period_str, 'BLOCKED', 235, 12, 4, 
        3, 2, 2, 0, 
        'Blocked: 4 expired active documents must be disposed of or renewed, and 2 open findings resolved.',
        '[]'::jsonb, v_target_date + INTERVAL '28 days', NULL, NULL, NOW(), NOW()
      );
    ELSIF i = 2 THEN
      -- Blocked period (month -2, e.g. 2026-05) containing the CRITICAL finding
      INSERT INTO aura_doc_compliance_certificate (
        id, "tenantId", period, status, "activeDocs", "expiringSoonCount", "expiredCount", 
        "litigationHoldCount", "pendingDisposalCount", "openFindingsCount", "criticalFindingsCount", 
        "gatingReason", "attestationsJson", "generatedAt", "signedAt", "signedBy", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid()::text, v_tenant_id, v_period_str, 'BLOCKED', 250, 16, 6, 
        3, 3, 4, 1, 
        'Gating Blockade: 1 unresolved CRITICAL finding (Litigation Hold Violation) must be cleared prior to signature authorization.',
        '[]'::jsonb, v_target_date + INTERVAL '28 days', NULL, NULL, NOW(), NOW()
      );
    ELSE
      -- Draft periods (month -1 and current month)
      INSERT INTO aura_doc_compliance_certificate (
        id, "tenantId", period, status, "activeDocs", "expiringSoonCount", "expiredCount", 
        "litigationHoldCount", "pendingDisposalCount", "openFindingsCount", "criticalFindingsCount", 
        "gatingReason", "attestationsJson", "generatedAt", "signedAt", "signedBy", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid()::text, v_tenant_id, v_period_str, 'DRAFT', 260, 22, 10, 
        3, 5, 6, 1, 
        'Gating Blockade: Active critical findings exist in this review period.',
        '[]'::jsonb, NOW(), NULL, NULL, NOW(), NOW()
      );
    END IF;
  END LOOP;

END $$;

COMMIT;
