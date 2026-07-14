BEGIN;

-- =============================================================================
-- 1. SEED COMPLIANCE CATEGORIES (IDEMPOTENT)
-- =============================================================================
INSERT INTO auraos.aura_calendar_category (
  id, "tenantId", code, name, "ownerRole", "defaultCadence", description, "isActive", "createdAt", "updatedAt"
)
VALUES
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'PAYROLL', 'Payroll Cut-off', 'PAYROLL_OFFICER', 'MONTHLY', 'Monthly payroll cut-off and checking', true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'WPS', 'Wage Protection System', 'PAYROLL_OFFICER', 'MONTHLY', 'Wage Protection System statutory bank transfer checks', true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'GPSSA', 'GPSSA Pension Filing', 'PAYROLL_OFFICER', 'MONTHLY', 'GPSSA pension contribution filing (UAE)', true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'GOSI', 'GOSI Pension Filing', 'PAYROLL_OFFICER', 'MONTHLY', 'GOSI pension contribution filing (KSA/Bahrain)', true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'EOSB', 'EOSB Liabilities Auditing', 'PAYROLL_OFFICER', 'SEMI_ANNUAL', 'End of Service Benefits liability check', true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'VISA_RENEWAL', 'Visa Renewals', 'PRO_OFFICER', 'MONTHLY', 'Employee residency visa renewals compliance checks', true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'LABOUR_CARD', 'Labour Card Renewals', 'PRO_OFFICER', 'MONTHLY', 'Statutory Ministry of Labour card renewals audit', true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'MEDICAL_INSURANCE', 'Medical Insurance Renewal', 'HR_ADMIN', 'ANNUAL', 'Staff medical health insurance policy review', true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'MEDICAL_FITNESS', 'Medical Fitness Checks', 'PRO_OFFICER', 'MONTHLY', 'Medical fitness tests for work permissions', true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'CONTRACT_RENEWAL', 'Contract Renewals', 'HR_ADMIN', 'ANNUAL', 'Employment contract renewals checks', true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'ATTENDANCE_AUDIT', 'Attendance Compliance Audit', 'INTERNAL_AUDITOR', 'QUARTERLY', 'Timesheet and shift compliance reviews', true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'LEAVE_LIABILITY', 'Leave Liability Review', 'PAYROLL_OFFICER', 'QUARTERLY', 'Accrued leaves financial liability audit', true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'DOCUMENT_RETENTION', 'Document Retention Compliance', 'INTERNAL_AUDITOR', 'ANNUAL', 'Checking storage and purge periods for physical records', true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'EMPLOYEE_FILE_AUDIT', 'Employee File Audit', 'INTERNAL_AUDITOR', 'ANNUAL', 'Auditing physical and electronic personnel folders', true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'ACCOMMODATION_INSPECTION', 'Accommodation Inspection', 'HR_ADMIN', 'QUARTERLY', 'Compliance checks of employee housing sites', true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'BENEFITS', 'Benefits Compliance', 'HR_ADMIN', 'ANNUAL', 'Allowance and benefits equity checks', true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'BAHRAINIZATION', 'Bahrainization Audit', 'HR_MANAGER', 'QUARTERLY', 'Bahrain nationalization percentage checking', true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'EMIRATISATION', 'Emiratisation Compliance', 'HR_MANAGER', 'QUARTERLY', 'UAE Emiratisation localization quota review', true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'HSE', 'Health & Safety Audits', 'HR_ADMIN', 'QUARTERLY', 'Fire drills and workspace safety inspections', true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'TRAINING', 'Training Compliance', 'HR_ADMIN', 'ANNUAL', 'Mandatory safety and operational training compliance logs', true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'DATA_PRIVACY', 'Data Privacy Audits', 'INTERNAL_AUDITOR', 'ANNUAL', 'Auditing employee personal data processing systems', true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'INTERNAL_AUDIT', 'Internal HR Audits', 'INTERNAL_AUDITOR', 'QUARTERLY', 'Standard internal HR workflow mock audits', true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'ANNUAL_AUDIT', 'Annual HR Audits', 'INTERNAL_AUDITOR', 'ANNUAL', 'Comprehensive year-end audit of HR operational structures', true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'MONTHLY_CERTIFICATE', 'Monthly Compliance Certification', 'COMPLIANCE_OFFICER', 'MONTHLY', 'Authorized signing of monthly legal certificate', true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'QUARTERLY_REVIEW', 'Quarterly Compliance Review', 'COMPLIANCE_OFFICER', 'QUARTERLY', 'Reviews of quarterly statutory records', true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'GOVERNMENT_REPORTING', 'Government Reporting', 'PRO_OFFICER', 'QUARTERLY', 'Reports to local ministries and authorities', true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'LABOUR_INSPECTION', 'Labour Inspection Preparation', 'COMPLIANCE_OFFICER', 'ANNUAL', 'Preparedness checks for ministry audits', true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'MOHRE', 'MOHRE Compliance Checks', 'PRO_OFFICER', 'MONTHLY', 'MOHRE quotas and quota audits (UAE)', true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'LMRA', 'LMRA Compliance Checks', 'PRO_OFFICER', 'MONTHLY', 'LMRA permits and portal checks (Bahrain)', true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'SOCIAL_INSURANCE', 'Social Insurance Filings', 'PAYROLL_OFFICER', 'MONTHLY', 'Pensions and social insurance checks', true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'IMMIGRATION', 'Immigration Compliance', 'PRO_OFFICER', 'MONTHLY', 'Work permit and visa compliance audits', true, now(), now())
ON CONFLICT ("tenantId", code) DO NOTHING;

-- =============================================================================
-- 2. SEED RECURRENCE RULES (40–60 ENGINE RULES)
-- =============================================================================
INSERT INTO auraos.aura_recurrence_rule (
  id, "tenantId", code, name, "categoryCode", "countryCode", "legalEntityId",
  cadence, "dayOfMonth", "monthOfYear", weekday, "ownerRole", "escalationRole",
  "leadDays", "tierAlerts", "templateJson", "isActive", "shiftOnHoliday", "createdAt", "updatedAt"
)
VALUES
  -- UAE Rules
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_PAYROLL_UAE', 'UAE Monthly Payroll Cut-off', 'PAYROLL', 'AE', (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'MONTHLY', 25, NULL, NULL, 'PAYROLL_OFFICER', 'HR_MANAGER', 7, '[5, 2, 1]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_WPS_UAE', 'UAE Wage Protection System Filing', 'WPS', 'AE', (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'MONTHLY', 28, NULL, NULL, 'PAYROLL_OFFICER', 'COMPLIANCE_OFFICER', 5, '[3, 1]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_GPSSA_UAE', 'UAE GPSSA Pension Filing', 'GPSSA', 'AE', (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'MONTHLY', 15, NULL, NULL, 'PAYROLL_OFFICER', 'HR_MANAGER', 10, '[5, 2]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_MOHRE_QUOTA_UAE', 'UAE MOHRE Quota Compliance Review', 'MOHRE', 'AE', (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'QUARTERLY', 30, NULL, NULL, 'PRO_OFFICER', 'HR_MANAGER', 15, '[10, 5]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_EMIRATISATION_TARGET', 'UAE Emiratisation Localization Target', 'EMIRATISATION', 'AE', (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'QUARTERLY', 30, NULL, NULL, 'HR_MANAGER', 'COMPLIANCE_OFFICER', 30, '[15, 5]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_VISA_RENEWAL_UAE', 'UAE Employee Visa Renewals Check', 'VISA_RENEWAL', 'AE', (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'MONTHLY', 1, NULL, NULL, 'PRO_OFFICER', 'HR_MANAGER', 30, '[20, 10, 5]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_LABOUR_CARD_UAE', 'UAE Labour Card Audit Checks', 'LABOUR_CARD', 'AE', (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'MONTHLY', 5, NULL, NULL, 'PRO_OFFICER', 'HR_MANAGER', 10, '[5, 2]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_MOHRE_PORTAL', 'MOHRE Portal Quotas & Audits check', 'MOHRE', 'AE', (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'MONTHLY', 15, NULL, NULL, 'PRO_OFFICER', 'HR_MANAGER', 10, '[5, 2]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_MEDICAL_FITNESS_AE', 'UAE DHA Residency Medical fitness checks', 'MEDICAL_FITNESS', 'AE', (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'MONTHLY', 15, NULL, NULL, 'PRO_OFFICER', 'HR_MANAGER', 10, '[5, 2]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),

  -- Saudi Arabia Rules
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_PAYROLL_SA', 'KSA Monthly Payroll Cut-off', 'PAYROLL', 'SA', COALESCE((SELECT id FROM auraos.aura_company ORDER BY id OFFSET 1 LIMIT 1), (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1)), 'MONTHLY', 25, NULL, NULL, 'PAYROLL_OFFICER', 'HR_MANAGER', 7, '[5, 2, 1]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_WPS_KSA', 'KSA Mudad WPS Submission', 'WPS', 'SA', COALESCE((SELECT id FROM auraos.aura_company ORDER BY id OFFSET 1 LIMIT 1), (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1)), 'MONTHLY', 28, NULL, NULL, 'PAYROLL_OFFICER', 'COMPLIANCE_OFFICER', 5, '[3, 1]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_GOSI_KSA', 'KSA GOSI Contribution Filing', 'GOSI', 'SA', COALESCE((SELECT id FROM auraos.aura_company ORDER BY id OFFSET 1 LIMIT 1), (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1)), 'MONTHLY', 15, NULL, NULL, 'PAYROLL_OFFICER', 'HR_MANAGER', 10, '[5, 2]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_VISA_RENEWAL_KSA', 'KSA Muqeem Visa Renewals Check', 'VISA_RENEWAL', 'SA', COALESCE((SELECT id FROM auraos.aura_company ORDER BY id OFFSET 1 LIMIT 1), (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1)), 'MONTHLY', 1, NULL, NULL, 'PRO_OFFICER', 'HR_MANAGER', 30, '[20, 10, 5]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_SADAD_FEE_KSA', 'KSA Sadad visa fee audit', 'IMMIGRATION', 'SA', COALESCE((SELECT id FROM auraos.aura_company ORDER BY id OFFSET 1 LIMIT 1), (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1)), 'MONTHLY', 20, NULL, NULL, 'PRO_OFFICER', 'HR_MANAGER', 10, '[5, 2]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),

  -- Bahrain Rules
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_PAYROLL_BH', 'Bahrain Monthly Payroll Cut-off', 'PAYROLL', 'BH', COALESCE((SELECT id FROM auraos.aura_company ORDER BY id OFFSET 2 LIMIT 1), (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1)), 'MONTHLY', 25, NULL, NULL, 'PAYROLL_OFFICER', 'HR_MANAGER', 7, '[5, 2, 1]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_WPS_BH', 'Bahrain Sijilat WPS Submission', 'WPS', 'BH', COALESCE((SELECT id FROM auraos.aura_company ORDER BY id OFFSET 2 LIMIT 1), (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1)), 'MONTHLY', 28, NULL, NULL, 'PAYROLL_OFFICER', 'COMPLIANCE_OFFICER', 5, '[3, 1]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_GOSI_BH', 'Bahrain GOSI Contribution Filing', 'GOSI', 'BH', COALESCE((SELECT id FROM auraos.aura_company ORDER BY id OFFSET 2 LIMIT 1), (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1)), 'MONTHLY', 15, NULL, NULL, 'PAYROLL_OFFICER', 'HR_MANAGER', 10, '[5, 2]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_BAHRAINIZATION_TARGET', 'Bahrainization Localization Target', 'BAHRAINIZATION', 'BH', COALESCE((SELECT id FROM auraos.aura_company ORDER BY id OFFSET 2 LIMIT 1), (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1)), 'QUARTERLY', 30, NULL, NULL, 'HR_MANAGER', 'COMPLIANCE_OFFICER', 15, '[10, 5]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_VISA_RENEWAL_BH', 'Bahrain LMRA Work Permit Renewals', 'VISA_RENEWAL', 'BH', COALESCE((SELECT id FROM auraos.aura_company ORDER BY id OFFSET 2 LIMIT 1), (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1)), 'MONTHLY', 1, NULL, NULL, 'PRO_OFFICER', 'HR_MANAGER', 30, '[20, 10, 5]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_LMRA_PORTAL', 'LMRA portal permits audits check', 'LMRA', 'BH', COALESCE((SELECT id FROM auraos.aura_company ORDER BY id OFFSET 2 LIMIT 1), (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1)), 'MONTHLY', 15, NULL, NULL, 'PRO_OFFICER', 'HR_MANAGER', 10, '[5, 2]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),

  -- Qatar Rules
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_PAYROLL_QA', 'Qatar Monthly Payroll Cut-off', 'PAYROLL', 'QA', (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'MONTHLY', 25, NULL, NULL, 'PAYROLL_OFFICER', 'HR_MANAGER', 7, '[5, 2, 1]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_WPS_QA', 'Qatar WPS bank transfer check', 'WPS', 'QA', (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'MONTHLY', 28, NULL, NULL, 'PAYROLL_OFFICER', 'COMPLIANCE_OFFICER', 5, '[3, 1]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_GOSI_QA', 'Qatar Social Insurance pension filing', 'SOCIAL_INSURANCE', 'QA', (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'MONTHLY', 15, NULL, NULL, 'PAYROLL_OFFICER', 'HR_MANAGER', 10, '[5, 2]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_VISA_RENEWAL_QA', 'Qatar Residency Visa renewals check', 'VISA_RENEWAL', 'QA', (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'MONTHLY', 1, NULL, NULL, 'PRO_OFFICER', 'HR_MANAGER', 30, '[20, 10, 5]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),

  -- Kuwait Rules
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_PAYROLL_KW', 'Kuwait Monthly Payroll Cut-off', 'PAYROLL', 'KW', (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'MONTHLY', 25, NULL, NULL, 'PAYROLL_OFFICER', 'HR_MANAGER', 7, '[5, 2, 1]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_WPS_KW', 'Kuwait WPS bank transfer check', 'WPS', 'KW', (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'MONTHLY', 28, NULL, NULL, 'PAYROLL_OFFICER', 'COMPLIANCE_OFFICER', 5, '[3, 1]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_GOSI_KW', 'Kuwait PIFSS pension filing', 'SOCIAL_INSURANCE', 'KW', (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'MONTHLY', 15, NULL, NULL, 'PAYROLL_OFFICER', 'HR_MANAGER', 10, '[5, 2]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_VISA_RENEWAL_KW', 'Kuwait Civil ID & Visa renewals check', 'VISA_RENEWAL', 'KW', (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'MONTHLY', 1, NULL, NULL, 'PRO_OFFICER', 'HR_MANAGER', 30, '[20, 10, 5]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),

  -- Oman Rules
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_PAYROLL_OM', 'Oman Monthly Payroll Cut-off', 'PAYROLL', 'OM', (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'MONTHLY', 25, NULL, NULL, 'PAYROLL_OFFICER', 'HR_MANAGER', 7, '[5, 2, 1]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_WPS_OM', 'Oman WPS bank transfer check', 'WPS', 'OM', (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'MONTHLY', 28, NULL, NULL, 'PAYROLL_OFFICER', 'COMPLIANCE_OFFICER', 5, '[3, 1]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_GOSI_OM', 'Oman PASI Pension contribution filing', 'SOCIAL_INSURANCE', 'OM', (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'MONTHLY', 15, NULL, NULL, 'PAYROLL_OFFICER', 'HR_MANAGER', 10, '[5, 2]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_VISA_RENEWAL_OM', 'Oman Residency Visa renewals check', 'VISA_RENEWAL', 'OM', (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'MONTHLY', 1, NULL, NULL, 'PRO_OFFICER', 'HR_MANAGER', 30, '[20, 10, 5]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),

  -- GCC-Wide Shared Rules
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_EOSB_AUDIT', 'End of Service Benefits liability audit', 'EOSB', NULL, (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'SEMI_ANNUAL', 30, NULL, NULL, 'PAYROLL_OFFICER', 'HR_MANAGER', 15, '[10, 5]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_MEDICAL_INSURANCE_GCC', 'Annual Staff Medical Insurance Scheme Renewal', 'MEDICAL_INSURANCE', NULL, (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'ANNUAL', 1, 1, NULL, 'HR_ADMIN', 'HR_MANAGER', 60, '[30, 15, 5]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_CONTRACT_RENEWAL_GCC', 'Employment Contracts Renewal Checks', 'CONTRACT_RENEWAL', NULL, (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'ANNUAL', 31, 12, NULL, 'HR_ADMIN', 'HR_MANAGER', 30, '[15, 5]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_ATTENDANCE_AUDIT_GCC', 'Timesheets & Shifts compliance reviews', 'ATTENDANCE_AUDIT', NULL, (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'QUARTERLY', 30, NULL, NULL, 'INTERNAL_AUDITOR', 'COMPLIANCE_OFFICER', 10, '[5, 2]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_LEAVE_LIABILITY_GCC', 'Accrued leaves financial audit', 'LEAVE_LIABILITY', NULL, (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'QUARTERLY', 30, NULL, NULL, 'PAYROLL_OFFICER', 'HR_MANAGER', 15, '[10, 5]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_DOCUMENT_RETENTION_GCC', 'Document Purge and Retention reviews', 'DOCUMENT_RETENTION', NULL, (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'ANNUAL', 30, 6, NULL, 'INTERNAL_AUDITOR', 'COMPLIANCE_OFFICER', 20, '[10, 5]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_EMPLOYEE_FILE_GCC', 'Personnel folders compliance audit', 'EMPLOYEE_FILE_AUDIT', NULL, (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'ANNUAL', 31, 12, NULL, 'INTERNAL_AUDITOR', 'HR_MANAGER', 30, '[15, 5]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_ACCOMMODATION_INSPECTION_GCC', 'Labour Accommodation Compliance Inspections', 'ACCOMMODATION_INSPECTION', NULL, (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'QUARTERLY', 15, NULL, NULL, 'HR_ADMIN', 'HR_MANAGER', 15, '[10, 5]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_BENEFITS_AUDIT', 'Allowances and benefits equity checks', 'BENEFITS', NULL, (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'ANNUAL', 30, 6, NULL, 'HR_ADMIN', 'HR_MANAGER', 30, '[15, 5]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_HSE_AUDIT_GCC', 'Fire Safety & Workspace Safety Audits', 'HSE', NULL, (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'QUARTERLY', 15, NULL, NULL, 'HR_ADMIN', 'HR_MANAGER', 15, '[10, 5]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_TRAINING_COMPLIANCE_GCC', 'Workspace safety training logs check', 'TRAINING', NULL, (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'ANNUAL', 31, 12, NULL, 'HR_ADMIN', 'HR_MANAGER', 30, '[15, 5]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_DATA_PRIVACY_GCC', 'Employee Data Privacy checks (PDPL/GDPR)', 'DATA_PRIVACY', NULL, (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'ANNUAL', 30, 6, NULL, 'INTERNAL_AUDITOR', 'COMPLIANCE_OFFICER', 20, '[10, 5]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_INTERNAL_AUDIT_GCC', 'Internal HR Mock Inspection', 'INTERNAL_AUDIT', NULL, (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'QUARTERLY', 15, NULL, NULL, 'INTERNAL_AUDITOR', 'COMPLIANCE_OFFICER', 15, '[10, 5]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_ANNUAL_AUDIT_GCC', 'Year-End Comprehensive Operations audit', 'ANNUAL_AUDIT', NULL, (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'ANNUAL', 31, 12, NULL, 'INTERNAL_AUDITOR', 'COMPLIANCE_OFFICER', 45, '[30, 15, 5]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_CERTIFICATE_GCC', 'Monthly HR Certification Sign-offs', 'MONTHLY_CERTIFICATE', NULL, (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'MONTHLY', 30, NULL, NULL, 'COMPLIANCE_OFFICER', 'EXECUTIVE_LEADERSHIP', 5, '[3, 1]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_QUARTERLY_REVIEW_GCC', 'Quarterly Compliance Board reviews', 'QUARTERLY_REVIEW', NULL, (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'QUARTERLY', 30, NULL, NULL, 'COMPLIANCE_OFFICER', 'EXECUTIVE_LEADERSHIP', 15, '[10, 5]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_GOVERNMENT_REPORTING_GCC', 'GCC Local ministries reporting deadlines', 'GOVERNMENT_REPORTING', NULL, (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'QUARTERLY', 28, NULL, NULL, 'PRO_OFFICER', 'COMPLIANCE_OFFICER', 15, '[10, 5]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_LABOUR_INSPECTION_GCC', 'Labour Ministry Inspection preparedness checklist', 'LABOUR_INSPECTION', NULL, (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'ANNUAL', 30, 9, NULL, 'COMPLIANCE_OFFICER', 'EXECUTIVE_LEADERSHIP', 30, '[15, 5]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 'RULE_IMMIGRATION_PORTAL', 'GCC Residence Visa Quotas audit', 'IMMIGRATION', NULL, (SELECT id FROM auraos.aura_company ORDER BY id LIMIT 1), 'MONTHLY', 20, NULL, NULL, 'PRO_OFFICER', 'COMPLIANCE_OFFICER', 10, '[5, 2]'::jsonb, '{}'::jsonb, true, 'PREVIOUS_BUSINESS_DAY', now(), now())
ON CONFLICT ("tenantId", code) DO NOTHING;

-- =============================================================================
-- 3. SEED COMPLIANCE TASKS (250–400 TASKS, IDEMPOTENT GENERATION)
-- =============================================================================
WITH date_series AS (
  SELECT generate_series(
    '2025-11-01'::date,
    '2026-07-01'::date,
    '1 month'::interval
  ) AS s_date
),
tasks_expanded AS (
  SELECT
    gen_random_uuid() AS id,
    r."tenantId" AS tenant_id,
    r.code AS rule_code,
    r."categoryCode" AS category_code,
    r."countryCode" AS country_code,
    r."legalEntityId" AS legal_entity_id,
    r."ownerRole" AS owner_role,
    r."escalationRole" AS escalation_role,
    -- Construct descriptive enterprise subjects
    CASE
      WHEN r.code = 'RULE_PAYROLL_UAE' THEN 'UAE Monthly Payroll Cut-off for ' || trim(to_char(d.s_date, 'Month YYYY'))
      WHEN r.code = 'RULE_WPS_UAE' THEN 'UAE WPS Bank File Submission for ' || trim(to_char(d.s_date, 'Month YYYY'))
      WHEN r.code = 'RULE_GPSSA_UAE' THEN 'UAE GPSSA Pension Filing for ' || trim(to_char(d.s_date, 'Month YYYY'))
      WHEN r.code = 'RULE_PAYROLL_SA' THEN 'KSA Payroll Bank Transfers for ' || trim(to_char(d.s_date, 'Month YYYY'))
      WHEN r.code = 'RULE_WPS_KSA' THEN 'KSA Mudad WPS Registry Check for ' || trim(to_char(d.s_date, 'Month YYYY'))
      WHEN r.code = 'RULE_GOSI_KSA' THEN 'KSA GOSI Pension filing for ' || trim(to_char(d.s_date, 'Month YYYY'))
      ELSE REPLACE(REPLACE(r.code, 'RULE_', ''), '_', ' ') || ' for ' || trim(to_char(d.s_date, 'Month YYYY'))
    END AS subject,
    -- Dates calculations
    (date_trunc('month', d.s_date) + (COALESCE(r."dayOfMonth", 1) - 1) * INTERVAL '1 day')::timestamp AS orig_due_date,
    date_trunc('month', d.s_date)::timestamp AS scheduled_for,
    -- Determine deterministic status based on hash codes
    CASE
      -- Future months:
      WHEN d.s_date > '2026-07-13'::date THEN
        CASE WHEN (abs(hashtext(r.code)) % 20) = 0 THEN 'DEFERRED' ELSE 'OPEN' END
      -- Current month:
      WHEN d.s_date >= '2026-07-01'::date AND d.s_date <= '2026-07-31'::date THEN
        CASE 
          WHEN (abs(hashtext(r.code)) % 10) IN (0, 1, 2) THEN 'COMPLETED'
          WHEN (abs(hashtext(r.code)) % 10) = 3 THEN 'DEFERRED'
          WHEN (abs(hashtext(r.code)) % 10) = 4 THEN 'OVERDUE'
          ELSE 'OPEN'
        END
      -- Past months:
      ELSE
        CASE 
          WHEN (abs(hashtext(r.code)) % 10) IN (0,1,2,3,4,5,6,7) THEN 'COMPLETED'
          WHEN (abs(hashtext(r.code)) % 10) = 8 THEN 'DEFERRED'
          ELSE 'OVERDUE'
        END
    END AS final_status,
    abs(hashtext(r.code)) AS code_hash
  FROM auraos.aura_recurrence_rule r
  CROSS JOIN date_series d
  WHERE 
    r.cadence = 'MONTHLY'
    OR (r.cadence = 'QUARTERLY' AND EXTRACT(MONTH FROM d.s_date)::int IN (3, 6, 9, 12))
    OR (r.cadence = 'SEMI_ANNUAL' AND EXTRACT(MONTH FROM d.s_date)::int IN (6, 12))
    OR (r.cadence = 'ANNUAL' AND EXTRACT(MONTH FROM d.s_date)::int = 12)
)
INSERT INTO auraos.aura_compliance_task (
  id, "tenantId", "ruleCode", "categoryCode", "countryCode", "legalEntityId",
  subject, "ownerRole", "ownerUserId", "dueDate", "scheduledFor", "originalDueDate",
  status, "completedAt", "completedBy", "evidenceUrl", "escalatedAt", "escalatedToRole",
  "deferReason", metadata, "createdAt", "updatedAt"
)
SELECT
  id,
  tenant_id,
  rule_code,
  category_code,
  country_code,
  legal_entity_id,
  subject,
  owner_role,
  (SELECT id FROM auraos.aura_user WHERE "tenantId" = tenant_id LIMIT 1),
  -- dueDate adjusted if deferred
  CASE 
    WHEN final_status = 'DEFERRED' THEN (orig_due_date + INTERVAL '10 days')::timestamp
    ELSE orig_due_date
  END,
  scheduled_for,
  orig_due_date,
  final_status,
  -- completedAt
  CASE WHEN final_status = 'COMPLETED' THEN (orig_due_date - INTERVAL '1 day')::timestamp ELSE NULL END,
  -- completedBy
  CASE WHEN final_status = 'COMPLETED' THEN 'admin@kreupai.com' ELSE NULL END,
  -- evidenceUrl
  CASE WHEN final_status = 'COMPLETED' THEN 'https://authority.gov.ae/evidence/receipt_' || id::text || '.pdf' ELSE NULL END,
  -- escalatedAt
  CASE WHEN final_status = 'OVERDUE' THEN (orig_due_date + INTERVAL '2 days')::timestamp ELSE NULL END,
  -- escalatedToRole
  CASE WHEN final_status = 'OVERDUE' THEN COALESCE(escalation_role, 'COMPLIANCE_OFFICER') ELSE NULL END,
  -- deferReason
  CASE WHEN final_status = 'DEFERRED' THEN 'Grace extension pending government portal renewal updates' ELSE NULL END,
  -- metadata
  CASE 
    WHEN final_status = 'OVERDUE' THEN 
      CASE 
        WHEN (code_hash % 3) = 0 THEN '{"escalationStage": "First Reminder"}'::jsonb
        WHEN (code_hash % 3) = 1 THEN '{"escalationStage": "Second Reminder"}'::jsonb
        ELSE '{"escalationStage": "Escalated"}'::jsonb
      END
    ELSE '{}'::jsonb
  END,
  now(),
  now()
FROM tasks_expanded
ON CONFLICT ("tenantId", "ruleCode", "scheduledFor", "legalEntityId") DO NOTHING;

-- =============================================================================
-- 4. SEED AUDIT PLANS (5-10 PLANS COVERING 2025, 2026, 2027)
-- =============================================================================
INSERT INTO auraos.aura_audit_plan (
  id, "tenantId", year, title, scope, "areasJson", "ownerRole", status, "approvedAt", "approvedBy", "createdAt", "updatedAt"
)
VALUES
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 2023, 'Annual HR Operations Audit 2023', 'Historical audit checking payroll registers, bank files, and general ledger reconciliation.', '["PAYROLL", "WPS"]'::jsonb, 'INTERNAL_AUDITOR', 'COMPLETED', '2023-01-12 09:00:00'::timestamp, 'admin@kreupai.com', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 2024, 'Annual HR Statutory Pension Audit 2024', 'Historical GOSI and GPSSA contribution audits across UAE and Saudi Arabia.', '["PAYROLL", "WPS", "SOCIAL_INSURANCE"]'::jsonb, 'INTERNAL_AUDITOR', 'COMPLETED', '2024-01-15 09:30:00'::timestamp, 'admin@kreupai.com', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 2025, 'Annual GCC Compliance Audit 2025', 'Audit of all regional payroll calculations, Mudad WPS, GOSI, and LMRA residency clearances.', '["PAYROLL", "WPS", "SOCIAL_INSURANCE", "IMMIGRATION"]'::jsonb, 'INTERNAL_AUDITOR', 'COMPLETED', '2025-01-10 09:00:00'::timestamp, 'admin@kreupai.com', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 2026, 'Annual HR Compliance Operations Audit 2026', 'Audit of nationalization percentage compliance, worker lodging standards, and training hours.', '["PAYROLL", "WPS", "SOCIAL_INSURANCE", "NATIONALIZATION", "HSE"]'::jsonb, 'INTERNAL_AUDITOR', 'APPROVED', '2026-01-05 10:00:00'::timestamp, 'admin@kreupai.com', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 2027, 'Annual HR Operations Strategic Plan 2027', 'Auditing benefits structures, allowances audits, and personnel-file compliance.', '["PAYROLL", "WPS", "SOCIAL_INSURANCE", "IMMIGRATION", "BENEFITS"]'::jsonb, 'INTERNAL_AUDITOR', 'DRAFT', NULL, NULL, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 2028, 'Proposed Audits Framework 2028', 'Yearly audit proposal checking HSE and fire preparedness.', '["PAYROLL", "WPS", "HSE"]'::jsonb, 'INTERNAL_AUDITOR', 'DRAFT', NULL, NULL, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), 2029, 'Proposed Audits Framework 2029', 'Yearly audit proposal checks on residency quotas.', '["PAYROLL", "IMMIGRATION"]'::jsonb, 'INTERNAL_AUDITOR', 'DRAFT', NULL, NULL, now(), now())
ON CONFLICT ("tenantId", year) DO NOTHING;

-- Delete old child records associated with 2025/2026 plans to enforce clean idempotency
DELETE FROM auraos.aura_corrective_action 
WHERE "findingId" IN (
  SELECT id FROM auraos.aura_audit_finding 
  WHERE "auditPlanId" IN (SELECT id FROM auraos.aura_audit_plan WHERE year IN (2025, 2026))
);

DELETE FROM auraos.aura_audit_finding 
WHERE "auditPlanId" IN (SELECT id FROM auraos.aura_audit_plan WHERE year IN (2025, 2026));

DELETE FROM auraos.aura_audit_test_result 
WHERE "auditPlanId" IN (SELECT id FROM auraos.aura_audit_plan WHERE year IN (2025, 2026));

DELETE FROM auraos.aura_audit_sample 
WHERE "auditPlanId" IN (SELECT id FROM auraos.aura_audit_plan WHERE year IN (2025, 2026));

-- =============================================================================
-- 5. SEED STATISTICAL AUDIT SAMPLES FOR 2026 APPROVED PLAN
-- =============================================================================
INSERT INTO auraos.aura_audit_sample (
  id, "tenantId", "auditPlanId", area, method, "populationSize", "sampleSize", "selectionsJson", "createdAt", "updatedAt"
)
SELECT
  gen_random_uuid(),
  p."tenantId",
  p.id,
  area_name,
  'RANDOM',
  (SELECT COUNT(*) FROM auraos.aura_employee),
  5,
  COALESCE(
    (
      SELECT json_agg(json_build_object('id', id, 'name', "firstName" || ' ' || "lastName" || ' (' || "employeeCode" || ')'))::jsonb
      FROM (
        SELECT id, "firstName", "lastName", "employeeCode" FROM auraos.aura_employee LIMIT 5
      ) sub
    ),
    '[]'::jsonb
  ),
  now(),
  now()
FROM auraos.aura_audit_plan p
CROSS JOIN (
  VALUES ('PAYROLL'), ('WPS'), ('SOCIAL_INSURANCE'), ('IMMIGRATION')
) AS areas(area_name)
WHERE p.year = 2026;

-- =============================================================================
-- 6. SEED AUDIT TEST RESULTS FOR SAMPLES
-- =============================================================================
INSERT INTO auraos.aura_audit_test_result (
  id, "tenantId", "auditPlanId", area, "testKey", "sampleId", passed, notes, "evidenceUrl", "performedBy", "performedAt", "createdAt", "updatedAt"
)
SELECT
  gen_random_uuid(),
  s."tenantId",
  s."auditPlanId",
  s.area,
  elem->>'id',
  s.id,
  (abs(hashtext(s.area || (elem->>'id'))) % 10 != 0) AS passed, -- 10% failure rate
  'Statutory payroll documents match banking WPS registries. Audit check complete.',
  'https://authority.portal.gov/receipts/proof_audit.pdf',
  'admin@kreupai.com',
  now(),
  now(),
  now()
FROM auraos.aura_audit_sample s
CROSS JOIN LATERAL jsonb_array_elements(s."selectionsJson") AS elem
WHERE s."auditPlanId" = (SELECT id FROM auraos.aura_audit_plan WHERE year = 2026 LIMIT 1);

-- =============================================================================
-- 7. SEED AUDIT FINDINGS FOR FAILED TESTS
-- =============================================================================
INSERT INTO auraos.aura_audit_finding (
  id, "tenantId", "auditPlanId", area, title, description, severity, status, "raisedAt", "createdAt", "updatedAt"
)
SELECT
  gen_random_uuid(),
  tr."tenantId",
  tr."auditPlanId",
  tr.area,
  'Filing mismatch in ' || tr.area || ' files for employee ' || tr."testKey",
  'Discrepancy detected between portal records and internal registers during sample check. Requires correction.',
  CASE 
    WHEN tr.area = 'PAYROLL' THEN 'HIGH'
    WHEN tr.area = 'WPS' THEN 'CRITICAL'
    ELSE 'MEDIUM'
  END,
  'OPEN',
  now(),
  now(),
  now()
FROM auraos.aura_audit_test_result tr
WHERE tr.passed = false AND tr."auditPlanId" = (SELECT id FROM auraos.aura_audit_plan WHERE year = 2026 LIMIT 1);

-- =============================================================================
-- 8. SEED CORRECTIVE ACTIONS FOR FINDINGS
-- =============================================================================
INSERT INTO auraos.aura_corrective_action (
  id, "tenantId", "findingId", description, "ownerRole", "ownerUserId", "dueDate", status, "createdAt", "updatedAt"
)
SELECT
  gen_random_uuid(),
  f."tenantId",
  f.id,
  'Re-verify bank transaction sheets and update details for ' || f.area,
  CASE WHEN f.area = 'PAYROLL' THEN 'PAYROLL_OFFICER' ELSE 'HR_MANAGER' END,
  (SELECT id FROM auraos.aura_user WHERE "tenantId" = f."tenantId" LIMIT 1),
  now() + INTERVAL '14 days',
  'OPEN',
  now(),
  now()
FROM auraos.aura_audit_finding f
WHERE f.status = 'OPEN';

-- =============================================================================
-- 9. SEED MANAGEMENT REVIEWS (SCHEDULED AND LOGGED)
-- =============================================================================
INSERT INTO auraos.aura_management_review (
  id, "tenantId", "scheduledFor", period, status, "agendaJson", "openActionsAtTime", notes, "createdAt", "updatedAt"
)
VALUES
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), '2026-05-15 11:00:00'::timestamp, '2026-05', 'COMPLETED', '["Review WPS dashboard", "Evaluate GOSI payments KSA"]'::jsonb, 0, 'All actions closed. System operates normally.', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), '2026-06-20 14:00:00'::timestamp, '2026-06', 'COMPLETED', '["Audit findings 2026", "Evaluate nationalization target rates"]'::jsonb, 3, 'Reviewed KSA localization percentages and WPS. 3 actions raised.', now(), now()),
  (gen_random_uuid(), (SELECT id FROM auraos.aura_tenant LIMIT 1), '2026-07-28 10:00:00'::timestamp, '2026-07', 'SCHEDULED', '["Review immigration permits", "WPS transaction logs check"]'::jsonb, 0, 'Scheduled upcoming statutory files review.', now(), now())
ON CONFLICT ("tenantId", period) DO NOTHING;

-- =============================================================================
-- 10. SEED MONTHLY COMPLIANCE CERTIFICATES (CALCULATED FROM GENERATED TASKS)
-- =============================================================================
INSERT INTO auraos.aura_calendar_certificate (
  id, "tenantId", period, status, "tasksDue", "tasksCompleted", "tasksDeferred", "tasksOverdue", "criticalOverdue", "gatingReason", "attestationsJson", "generatedAt", "signedAt", "signedBy", "createdAt", "updatedAt"
)
SELECT
  gen_random_uuid(),
  t.tenant_id,
  t.period,
  CASE 
    WHEN t.period = '2026-07' THEN 'DRAFT'
    WHEN t.overdue_count > 0 THEN 'REJECTED'
    ELSE 'SIGNED'
  END AS status,
  t.total_count,
  t.completed_count,
  t.deferred_count,
  t.overdue_count,
  t.critical_overdue,
  CASE 
    WHEN t.critical_overdue > 0 THEN 'WPS and Pension tasks are overdue'
    WHEN t.overdue_count > 0 THEN 'Statutory filing tasks overdue'
    ELSE NULL
  END AS gatingReason,
  '[]'::jsonb AS attestationsJson,
  now() AS generatedAt,
  CASE WHEN t.overdue_count = 0 AND t.period != '2026-07' THEN now() ELSE NULL END AS signedAt,
  CASE WHEN t.overdue_count = 0 AND t.period != '2026-07' THEN 'admin@kreupai.com' ELSE NULL END AS signedBy,
  now() AS createdAt,
  now() AS updatedAt
FROM (
  SELECT
    "tenantId" AS tenant_id,
    to_char("scheduledFor", 'YYYY-MM') AS period,
    COUNT(*) AS total_count,
    COUNT(*) FILTER (WHERE status = 'COMPLETED') AS completed_count,
    COUNT(*) FILTER (WHERE status = 'DEFERRED') AS deferred_count,
    COUNT(*) FILTER (WHERE status = 'OVERDUE') AS overdue_count,
    COUNT(*) FILTER (WHERE status = 'OVERDUE' AND "categoryCode" IN ('WPS', 'GPSSA', 'GOSI', 'IMMIGRATION')) AS critical_overdue
  FROM auraos.aura_compliance_task
  GROUP BY "tenantId", to_char("scheduledFor", 'YYYY-MM')
) t
ON CONFLICT ("tenantId", period) DO UPDATE
SET 
  status = EXCLUDED.status,
  "tasksDue" = EXCLUDED."tasksDue",
  "tasksCompleted" = EXCLUDED."tasksCompleted",
  "tasksDeferred" = EXCLUDED."tasksDeferred",
  "tasksOverdue" = EXCLUDED."tasksOverdue",
  "criticalOverdue" = EXCLUDED."criticalOverdue",
  "gatingReason" = EXCLUDED."gatingReason",
  "signedAt" = EXCLUDED."signedAt",
  "signedBy" = EXCLUDED."signedBy",
  "updatedAt" = now();

-- =============================================================================
-- FINAL VALIDATION AND REPORT VERIFICATION QUERIES
-- =============================================================================
SELECT 'Recurrence Rules count' AS metric, COUNT(*) AS value FROM auraos.aura_recurrence_rule
UNION ALL
SELECT 'Compliance Tasks count', COUNT(*) FROM auraos.aura_compliance_task
UNION ALL
SELECT 'Completed Tasks count', COUNT(*) FROM auraos.aura_compliance_task WHERE status = 'COMPLETED'
UNION ALL
SELECT 'Deferred Tasks count', COUNT(*) FROM auraos.aura_compliance_task WHERE status = 'DEFERRED'
UNION ALL
SELECT 'Overdue Tasks count', COUNT(*) FROM auraos.aura_compliance_task WHERE status = 'OVERDUE'
UNION ALL
SELECT 'Escalated Tasks count', COUNT(*) FROM auraos.aura_compliance_task WHERE "escalatedAt" IS NOT NULL
UNION ALL
SELECT 'Audit Plans count', COUNT(*) FROM auraos.aura_audit_plan
UNION ALL
SELECT 'Audit Samples count', COUNT(*) FROM auraos.aura_audit_sample
UNION ALL
SELECT 'Audit Findings count', COUNT(*) FROM auraos.aura_audit_finding
UNION ALL
SELECT 'Corrective Actions count', COUNT(*) FROM auraos.aura_corrective_action
UNION ALL
SELECT 'Management Reviews count', COUNT(*) FROM auraos.aura_management_review
UNION ALL
SELECT 'Certificates count', COUNT(*) FROM auraos.aura_calendar_certificate;

-- Country Distribution breakdown
SELECT "countryCode" AS country, COUNT(*) AS task_count 
FROM auraos.aura_compliance_task 
GROUP BY "countryCode" 
ORDER BY task_count DESC;

-- Category Distribution breakdown
SELECT "categoryCode" AS category, COUNT(*) AS task_count 
FROM auraos.aura_compliance_task 
GROUP BY "categoryCode" 
ORDER BY task_count DESC;

COMMIT;
