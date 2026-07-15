-- =========================================================================
-- GRC COMPLIANCE AUDIT REGISTER SEED DATA
-- =========================================================================

BEGIN;

SET search_path TO auraos, public;

-- 1. DEFINE VARIABLES TEMPORARY TABLE
CREATE TEMP TABLE vars AS
SELECT 
  COALESCE((SELECT id FROM aura_tenant WHERE code = 'KREUP_AI' LIMIT 1), 'ae63d8ef-d01d-49a7-a542-b1256702765d') AS tenant_id,
  COALESCE((SELECT id FROM aura_user WHERE email LIKE '%admin%' OR email LIKE '%kreup%' LIMIT 1), 'USR-002') AS user_id;

-- 2. CLEANUP EXISTING REGISTER RECORDS
DELETE FROM aura_compliance_register_timeline WHERE "tenantId" = (SELECT tenant_id FROM vars);
DELETE FROM aura_compliance_register_evidence WHERE "tenantId" = (SELECT tenant_id FROM vars);
DELETE FROM aura_compliance_corrective_action WHERE "tenantId" = (SELECT tenant_id FROM vars);
DELETE FROM aura_compliance_risk_register_entry WHERE "tenantId" = (SELECT tenant_id FROM vars);
DELETE FROM aura_compliance_audit_checklist_item WHERE "tenantId" = (SELECT tenant_id FROM vars);

-- 3. SEED 180 CHECKLIST ITEMS
INSERT INTO aura_compliance_audit_checklist_item (
  id, "tenantId", "domainCode", "categoryCode", "itemCode", label, "expectedBehavior", "evidenceRequirement", "ownerRole", "isMandatory", status, owner, "dueDate", "evidenceUrl", notes, "completedAt", "completedBy", "createdAt", "updatedAt", "createdBy", "updatedBy"
) VALUES
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'INTAKE', 'ER-CHK-01', 'Multi-channel grievance intake portal checked daily (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', true, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '2 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '1 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'TRIAGE', 'ER-CHK-02', 'Grievance triage severity matrix applied within 24h (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', true, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '4 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '2 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'INVESTIGATION', 'ER-CHK-03', 'Confidentiality non-disclosure statements signed by ER committee (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', true, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '6 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '3 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'DISCLOSURE', 'ER-CHK-04', 'Quarterly whistleblower policy review attestation completed (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', true, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '8 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '4 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'MEDIATION', 'ER-CHK-05', 'Escalation SLAs tracked for high-severity disputes (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', true, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '10 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '5 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'LABOR_COURT', 'ER-CHK-06', 'Employee mediation sessions scheduled and logged (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', true, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '12 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '6 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'INTAKE', 'ER-CHK-07', 'GCC labor court referral files organized and legal-reviewed (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', true, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '14 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '7 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'TRIAGE', 'ER-CHK-08', 'Whistleblower helpline test calls logs exported (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', true, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '16 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '8 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'INVESTIGATION', 'ER-CHK-09', 'Employee relations handbook acknowledgements verified (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', true, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '18 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '9 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'DISCLOSURE', 'ER-CHK-10', 'Harassment claim triage review logs submitted to Board (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', true, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '20 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '10 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'MEDIATION', 'ER-CHK-11', 'Multi-channel grievance intake portal checked daily (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', true, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '22 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '11 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'LABOR_COURT', 'ER-CHK-12', 'Grievance triage severity matrix applied within 24h (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '24 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '12 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'INTAKE', 'ER-CHK-13', 'Confidentiality non-disclosure statements signed by ER committee (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '26 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '13 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'TRIAGE', 'ER-CHK-14', 'Quarterly whistleblower policy review attestation completed (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '28 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '14 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'INVESTIGATION', 'ER-CHK-15', 'Escalation SLAs tracked for high-severity disputes (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '30 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '15 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'DISCLOSURE', 'ER-CHK-16', 'Employee mediation sessions scheduled and logged (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '32 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '16 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'MEDIATION', 'ER-CHK-17', 'GCC labor court referral files organized and legal-reviewed (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '34 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '17 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'LABOR_COURT', 'ER-CHK-18', 'Whistleblower helpline test calls logs exported (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '36 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '18 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'INTAKE', 'ER-CHK-19', 'Employee relations handbook acknowledgements verified (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '38 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '19 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'TRIAGE', 'ER-CHK-20', 'Harassment claim triage review logs submitted to Board (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '40 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '20 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'INVESTIGATION', 'ER-CHK-21', 'Multi-channel grievance intake portal checked daily (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '42 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '21 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'DISCLOSURE', 'ER-CHK-22', 'Grievance triage severity matrix applied within 24h (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '44 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '22 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'MEDIATION', 'ER-CHK-23', 'Confidentiality non-disclosure statements signed by ER committee (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '46 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '23 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'LABOR_COURT', 'ER-CHK-24', 'Quarterly whistleblower policy review attestation completed (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '48 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '24 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'INTAKE', 'ER-CHK-25', 'Escalation SLAs tracked for high-severity disputes (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '50 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '25 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'TRIAGE', 'ER-CHK-26', 'Employee mediation sessions scheduled and logged (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '52 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '26 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'INVESTIGATION', 'ER-CHK-27', 'GCC labor court referral files organized and legal-reviewed (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '54 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '27 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'DISCLOSURE', 'ER-CHK-28', 'Whistleblower helpline test calls logs exported (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '56 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '28 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'MEDIATION', 'ER-CHK-29', 'Employee relations handbook acknowledgements verified (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '58 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '29 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'LABOR_COURT', 'ER-CHK-30', 'Harassment claim triage review logs submitted to Board (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '60 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '30 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'INTAKE', 'ER-CHK-31', 'Multi-channel grievance intake portal checked daily (Scope: Audit Cycle 4)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '62 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '31 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'TRIAGE', 'ER-CHK-32', 'Grievance triage severity matrix applied within 24h (Scope: Audit Cycle 4)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '64 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '32 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'INVESTIGATION', 'ER-CHK-33', 'Confidentiality non-disclosure statements signed by ER committee (Scope: Audit Cycle 4)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '66 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '33 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'DISCLOSURE', 'ER-CHK-34', 'Quarterly whistleblower policy review attestation completed (Scope: Audit Cycle 4)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '68 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '34 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'MEDIATION', 'ER-CHK-35', 'Escalation SLAs tracked for high-severity disputes (Scope: Audit Cycle 4)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '70 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '35 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'LABOR_COURT', 'ER-CHK-36', 'Employee mediation sessions scheduled and logged (Scope: Audit Cycle 4)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '72 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '36 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'COMMITTEE', 'DISCIPLINARY-CHK-01', 'Disciplinary committee members appointed by Legal (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', true, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '2 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '1 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'WARNING', 'DISCIPLINARY-CHK-02', 'Employee hearing notifications delivered with 48h notice (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', true, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '4 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '2 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'SUSPENSION', 'DISCIPLINARY-CHK-03', 'Witness statements recorded and signed in presence of counsel (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', true, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '6 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '3 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'APPEAL', 'DISCIPLINARY-CHK-04', 'Official warning letters issued with standard code refs (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', true, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '8 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '4 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'HEARING', 'DISCIPLINARY-CHK-05', 'Suspension protocols reviewed against country regulations (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', true, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '10 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '5 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'SANCTION', 'DISCIPLINARY-CHK-06', 'Appeal hearings scheduled within the 7-day statutory window (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', true, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '12 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '6 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'COMMITTEE', 'DISCIPLINARY-CHK-07', 'Sanction logs synced with central HR payroll files (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', true, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '14 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '7 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'WARNING', 'DISCIPLINARY-CHK-08', 'Employee response letters archived in personnel dossier (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', true, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '16 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '8 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'SUSPENSION', 'DISCIPLINARY-CHK-09', 'First written warning templates updated for UAE compliance (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', true, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '18 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '9 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'APPEAL', 'DISCIPLINARY-CHK-10', 'Final termination warning board review approvals logged (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', true, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '20 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '10 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'HEARING', 'DISCIPLINARY-CHK-11', 'Disciplinary committee members appointed by Legal (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', true, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '22 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '11 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'SANCTION', 'DISCIPLINARY-CHK-12', 'Employee hearing notifications delivered with 48h notice (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '24 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '12 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'COMMITTEE', 'DISCIPLINARY-CHK-13', 'Witness statements recorded and signed in presence of counsel (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '26 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '13 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'WARNING', 'DISCIPLINARY-CHK-14', 'Official warning letters issued with standard code refs (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '28 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '14 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'SUSPENSION', 'DISCIPLINARY-CHK-15', 'Suspension protocols reviewed against country regulations (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '30 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '15 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'APPEAL', 'DISCIPLINARY-CHK-16', 'Appeal hearings scheduled within the 7-day statutory window (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '32 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '16 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'HEARING', 'DISCIPLINARY-CHK-17', 'Sanction logs synced with central HR payroll files (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '34 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '17 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'SANCTION', 'DISCIPLINARY-CHK-18', 'Employee response letters archived in personnel dossier (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '36 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '18 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'COMMITTEE', 'DISCIPLINARY-CHK-19', 'First written warning templates updated for UAE compliance (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '38 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '19 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'WARNING', 'DISCIPLINARY-CHK-20', 'Final termination warning board review approvals logged (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '40 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '20 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'SUSPENSION', 'DISCIPLINARY-CHK-21', 'Disciplinary committee members appointed by Legal (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '42 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '21 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'APPEAL', 'DISCIPLINARY-CHK-22', 'Employee hearing notifications delivered with 48h notice (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '44 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '22 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'HEARING', 'DISCIPLINARY-CHK-23', 'Witness statements recorded and signed in presence of counsel (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '46 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '23 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'SANCTION', 'DISCIPLINARY-CHK-24', 'Official warning letters issued with standard code refs (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '48 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '24 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'COMMITTEE', 'DISCIPLINARY-CHK-25', 'Suspension protocols reviewed against country regulations (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '50 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '25 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'WARNING', 'DISCIPLINARY-CHK-26', 'Appeal hearings scheduled within the 7-day statutory window (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '52 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '26 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'SUSPENSION', 'DISCIPLINARY-CHK-27', 'Sanction logs synced with central HR payroll files (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '54 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '27 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'APPEAL', 'DISCIPLINARY-CHK-28', 'Employee response letters archived in personnel dossier (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '56 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '28 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'HEARING', 'DISCIPLINARY-CHK-29', 'First written warning templates updated for UAE compliance (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '58 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '29 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'SANCTION', 'DISCIPLINARY-CHK-30', 'Final termination warning board review approvals logged (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '60 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '30 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'COMMITTEE', 'DISCIPLINARY-CHK-31', 'Disciplinary committee members appointed by Legal (Scope: Audit Cycle 4)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '62 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '31 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'WARNING', 'DISCIPLINARY-CHK-32', 'Employee hearing notifications delivered with 48h notice (Scope: Audit Cycle 4)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '64 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '32 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'SUSPENSION', 'DISCIPLINARY-CHK-33', 'Witness statements recorded and signed in presence of counsel (Scope: Audit Cycle 4)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '66 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '33 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'APPEAL', 'DISCIPLINARY-CHK-34', 'Official warning letters issued with standard code refs (Scope: Audit Cycle 4)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '68 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '34 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'HEARING', 'DISCIPLINARY-CHK-35', 'Suspension protocols reviewed against country regulations (Scope: Audit Cycle 4)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '70 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '35 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'SANCTION', 'DISCIPLINARY-CHK-36', 'Appeal hearings scheduled within the 7-day statutory window (Scope: Audit Cycle 4)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '72 days', NULL, 'Controls verified by external GRC audit.', CURRENT_TIMESTAMP - INTERVAL '36 days', (SELECT user_id FROM vars), 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'RESIGNATION', 'SEPARATION-CHK-01', 'Resignation letters registered and timestamps logged (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', true, 'OPEN', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '2 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'APPROVAL', 'SEPARATION-CHK-02', 'Exit notice period calculated and agreed in writing (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', true, 'OPEN', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '4 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'NOTICE_PERIOD', 'SEPARATION-CHK-03', 'Handover checklists completed by departing employees (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', true, 'OPEN', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '6 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'HANDOVER', 'SEPARATION-CHK-04', 'Company asset recovery checklist signed by IT and Facilities (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', true, 'OPEN', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '8 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'CLEARANCE', 'SEPARATION-CHK-05', 'Departmental exit clearance signed off in HRMS (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', true, 'OPEN', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '10 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'SETTLEMENT', 'SEPARATION-CHK-06', 'Exit interviews conducted and feedback summarized (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', true, 'OPEN', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '12 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'RESIGNATION', 'SEPARATION-CHK-07', 'Final separation payroll run variance reviewed (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', true, 'OPEN', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '14 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'APPROVAL', 'SEPARATION-CHK-08', 'Deactivation of all active system user credentials (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', true, 'OPEN', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '16 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'NOTICE_PERIOD', 'SEPARATION-CHK-09', 'Work permit cancellation requests filed in labor portal (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', true, 'OPEN', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '18 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'HANDOVER', 'SEPARATION-CHK-10', 'Social security notifications submitted within 10 days (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', true, 'OPEN', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '20 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'CLEARANCE', 'SEPARATION-CHK-11', 'Resignation letters registered and timestamps logged (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', true, 'OPEN', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '22 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'SETTLEMENT', 'SEPARATION-CHK-12', 'Exit notice period calculated and agreed in writing (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'OPEN', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '24 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'RESIGNATION', 'SEPARATION-CHK-13', 'Handover checklists completed by departing employees (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'OPEN', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '26 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'APPROVAL', 'SEPARATION-CHK-14', 'Company asset recovery checklist signed by IT and Facilities (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'OPEN', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '28 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'NOTICE_PERIOD', 'SEPARATION-CHK-15', 'Departmental exit clearance signed off in HRMS (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'OPEN', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '30 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'HANDOVER', 'SEPARATION-CHK-16', 'Exit interviews conducted and feedback summarized (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'OPEN', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '32 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'CLEARANCE', 'SEPARATION-CHK-17', 'Final separation payroll run variance reviewed (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'OPEN', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '34 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'SETTLEMENT', 'SEPARATION-CHK-18', 'Deactivation of all active system user credentials (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'OPEN', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '36 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'RESIGNATION', 'SEPARATION-CHK-19', 'Work permit cancellation requests filed in labor portal (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'OPEN', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '38 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'APPROVAL', 'SEPARATION-CHK-20', 'Social security notifications submitted within 10 days (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'OPEN', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '40 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'NOTICE_PERIOD', 'SEPARATION-CHK-21', 'Resignation letters registered and timestamps logged (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'OPEN', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '42 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'HANDOVER', 'SEPARATION-CHK-22', 'Exit notice period calculated and agreed in writing (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'OPEN', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '44 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'CLEARANCE', 'SEPARATION-CHK-23', 'Handover checklists completed by departing employees (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'OPEN', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '46 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'SETTLEMENT', 'SEPARATION-CHK-24', 'Company asset recovery checklist signed by IT and Facilities (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'OPEN', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '48 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'RESIGNATION', 'SEPARATION-CHK-25', 'Departmental exit clearance signed off in HRMS (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'OPEN', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '50 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'APPROVAL', 'SEPARATION-CHK-26', 'Exit interviews conducted and feedback summarized (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'OPEN', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '52 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'NOTICE_PERIOD', 'SEPARATION-CHK-27', 'Final separation payroll run variance reviewed (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'OPEN', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '54 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'HANDOVER', 'SEPARATION-CHK-28', 'Deactivation of all active system user credentials (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'OPEN', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '56 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'CLEARANCE', 'SEPARATION-CHK-29', 'Work permit cancellation requests filed in labor portal (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'OPEN', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '58 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'SETTLEMENT', 'SEPARATION-CHK-30', 'Social security notifications submitted within 10 days (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'OPEN', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '60 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'RESIGNATION', 'SEPARATION-CHK-31', 'Resignation letters registered and timestamps logged (Scope: Audit Cycle 4)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'OPEN', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '62 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'APPROVAL', 'SEPARATION-CHK-32', 'Exit notice period calculated and agreed in writing (Scope: Audit Cycle 4)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'OPEN', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '64 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'NOTICE_PERIOD', 'SEPARATION-CHK-33', 'Handover checklists completed by departing employees (Scope: Audit Cycle 4)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'OPEN', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '66 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'HANDOVER', 'SEPARATION-CHK-34', 'Company asset recovery checklist signed by IT and Facilities (Scope: Audit Cycle 4)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'OPEN', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '68 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'CLEARANCE', 'SEPARATION-CHK-35', 'Departmental exit clearance signed off in HRMS (Scope: Audit Cycle 4)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'OPEN', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '70 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'SETTLEMENT', 'SEPARATION-CHK-36', 'Exit interviews conducted and feedback summarized (Scope: Audit Cycle 4)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'OPEN', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '72 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'CALCULATION', 'EOSB-CHK-01', 'Gratuity calculation audited against latest labor law (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', true, 'OPEN', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '2 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'GRATUITY', 'EOSB-CHK-02', 'End-of-service settlement sheet verified by payroll specialist (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', true, 'OPEN', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '4 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'SIO_RECONCILIATION', 'EOSB-CHK-03', 'SIO / GOSI contribution accounts audited for exit clearance (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', true, 'OPEN', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '6 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'BANK_TRANSFER', 'EOSB-CHK-04', 'Outstanding company loans reconciled in final settlement (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', true, 'OPEN', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '8 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'LIQUIDITY', 'EOSB-CHK-05', 'Bank transfer details for gratuity validated (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', true, 'OPEN', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '10 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'SIGN_OFF', 'EOSB-CHK-06', 'Employee final settlement release signed and witnessed (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', true, 'OPEN', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '12 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'CALCULATION', 'EOSB-CHK-07', 'Unused leave balance proration verified and approved (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', true, 'OPEN', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '14 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'GRATUITY', 'EOSB-CHK-08', 'GCC pension scheme exit logs reconciled and archived (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', true, 'OPEN', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '16 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'SIO_RECONCILIATION', 'EOSB-CHK-09', 'Auditor clearance sign-off on EOS calculations (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', true, 'OPEN', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '18 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'BANK_TRANSFER', 'EOSB-CHK-10', 'Gratuity bank file generated and uploaded to bank portal (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', true, 'IN_PROGRESS', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '20 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'LIQUIDITY', 'EOSB-CHK-11', 'Gratuity calculation audited against latest labor law (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', true, 'IN_PROGRESS', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '22 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'SIGN_OFF', 'EOSB-CHK-12', 'End-of-service settlement sheet verified by payroll specialist (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'IN_PROGRESS', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '24 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'CALCULATION', 'EOSB-CHK-13', 'SIO / GOSI contribution accounts audited for exit clearance (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'IN_PROGRESS', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '26 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'GRATUITY', 'EOSB-CHK-14', 'Outstanding company loans reconciled in final settlement (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'IN_PROGRESS', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '28 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'SIO_RECONCILIATION', 'EOSB-CHK-15', 'Bank transfer details for gratuity validated (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'IN_PROGRESS', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '30 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'BANK_TRANSFER', 'EOSB-CHK-16', 'Employee final settlement release signed and witnessed (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'IN_PROGRESS', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '32 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'LIQUIDITY', 'EOSB-CHK-17', 'Unused leave balance proration verified and approved (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'IN_PROGRESS', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '34 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'SIGN_OFF', 'EOSB-CHK-18', 'GCC pension scheme exit logs reconciled and archived (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'IN_PROGRESS', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '36 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'CALCULATION', 'EOSB-CHK-19', 'Auditor clearance sign-off on EOS calculations (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'IN_PROGRESS', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '38 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'GRATUITY', 'EOSB-CHK-20', 'Gratuity bank file generated and uploaded to bank portal (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'IN_PROGRESS', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '40 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'SIO_RECONCILIATION', 'EOSB-CHK-21', 'Gratuity calculation audited against latest labor law (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'IN_PROGRESS', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '42 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'BANK_TRANSFER', 'EOSB-CHK-22', 'End-of-service settlement sheet verified by payroll specialist (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'IN_PROGRESS', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '44 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'LIQUIDITY', 'EOSB-CHK-23', 'SIO / GOSI contribution accounts audited for exit clearance (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'IN_PROGRESS', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '46 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'SIGN_OFF', 'EOSB-CHK-24', 'Outstanding company loans reconciled in final settlement (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'IN_PROGRESS', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '48 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'CALCULATION', 'EOSB-CHK-25', 'Bank transfer details for gratuity validated (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'IN_PROGRESS', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '50 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'GRATUITY', 'EOSB-CHK-26', 'Employee final settlement release signed and witnessed (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'IN_PROGRESS', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '52 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'SIO_RECONCILIATION', 'EOSB-CHK-27', 'Unused leave balance proration verified and approved (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'IN_PROGRESS', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '54 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'BANK_TRANSFER', 'EOSB-CHK-28', 'GCC pension scheme exit logs reconciled and archived (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'IN_PROGRESS', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '56 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'LIQUIDITY', 'EOSB-CHK-29', 'Auditor clearance sign-off on EOS calculations (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'IN_PROGRESS', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '58 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'SIGN_OFF', 'EOSB-CHK-30', 'Gratuity bank file generated and uploaded to bank portal (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'IN_PROGRESS', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '60 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'CALCULATION', 'EOSB-CHK-31', 'Gratuity calculation audited against latest labor law (Scope: Audit Cycle 4)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'IN_PROGRESS', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '62 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'GRATUITY', 'EOSB-CHK-32', 'End-of-service settlement sheet verified by payroll specialist (Scope: Audit Cycle 4)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'IN_PROGRESS', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '64 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'SIO_RECONCILIATION', 'EOSB-CHK-33', 'SIO / GOSI contribution accounts audited for exit clearance (Scope: Audit Cycle 4)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'IN_PROGRESS', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '66 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'BANK_TRANSFER', 'EOSB-CHK-34', 'Outstanding company loans reconciled in final settlement (Scope: Audit Cycle 4)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'IN_PROGRESS', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '68 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'LIQUIDITY', 'EOSB-CHK-35', 'Bank transfer details for gratuity validated (Scope: Audit Cycle 4)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'IN_PROGRESS', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '70 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'SIGN_OFF', 'EOSB-CHK-36', 'Employee final settlement release signed and witnessed (Scope: Audit Cycle 4)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'IN_PROGRESS', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '72 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'CANCELLATION', 'VISA_EXIT-CHK-01', 'Government visa cancellation requests lodged in PRO portal (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', true, 'NON_COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '2 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'EXIT_PERMIT', 'VISA_EXIT-CHK-02', 'Passport exit check verified by immigration specialist (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', true, 'NON_COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '4 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'PASSPORT_RETURN', 'VISA_EXIT-CHK-03', 'Exit permit issued for departing expat employees (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', true, 'NON_COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '6 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'DEPORTATION', 'VISA_EXIT-CHK-04', 'Medical insurance cancellation notifications dispatched (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', true, 'NON_COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '8 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'REPATRIATION', 'VISA_EXIT-CHK-05', 'Accommodation transport clearance checklist signed (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', true, 'NON_COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '10 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'MIGRATION', 'VISA_EXIT-CHK-06', 'PRO exit report uploaded with official cancellations stamps (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', true, 'NON_COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '12 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'CANCELLATION', 'VISA_EXIT-CHK-07', 'Dependent visa exit cancellations registered (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', true, 'NON_COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '14 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'EXIT_PERMIT', 'VISA_EXIT-CHK-08', 'Expired labor cards destroyed and logged for audit (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', true, 'NON_COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '16 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'PASSPORT_RETURN', 'VISA_EXIT-CHK-09', 'Immigration fines verified and paid via portal (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', true, 'NON_COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '18 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'DEPORTATION', 'VISA_EXIT-CHK-10', 'Final government visa cancellation confirmation certificate archived (Scope: Audit Cycle 1)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', true, 'NON_COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '20 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'REPATRIATION', 'VISA_EXIT-CHK-11', 'Government visa cancellation requests lodged in PRO portal (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', true, 'NON_COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '22 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'MIGRATION', 'VISA_EXIT-CHK-12', 'Passport exit check verified by immigration specialist (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'NON_COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '24 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'CANCELLATION', 'VISA_EXIT-CHK-13', 'Exit permit issued for departing expat employees (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'NON_COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '26 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'EXIT_PERMIT', 'VISA_EXIT-CHK-14', 'Medical insurance cancellation notifications dispatched (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'NON_COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '28 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'PASSPORT_RETURN', 'VISA_EXIT-CHK-15', 'Accommodation transport clearance checklist signed (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'NON_COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '30 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'DEPORTATION', 'VISA_EXIT-CHK-16', 'PRO exit report uploaded with official cancellations stamps (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'NON_COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '32 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'REPATRIATION', 'VISA_EXIT-CHK-17', 'Dependent visa exit cancellations registered (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'NON_COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '34 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'MIGRATION', 'VISA_EXIT-CHK-18', 'Expired labor cards destroyed and logged for audit (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'NON_COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '36 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'CANCELLATION', 'VISA_EXIT-CHK-19', 'Immigration fines verified and paid via portal (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'NON_COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '38 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'EXIT_PERMIT', 'VISA_EXIT-CHK-20', 'Final government visa cancellation confirmation certificate archived (Scope: Audit Cycle 2)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'NON_COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '40 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'PASSPORT_RETURN', 'VISA_EXIT-CHK-21', 'Government visa cancellation requests lodged in PRO portal (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'NON_COMPLIANT', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '42 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'DEPORTATION', 'VISA_EXIT-CHK-22', 'Passport exit check verified by immigration specialist (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'NON_COMPLIANT', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '44 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'REPATRIATION', 'VISA_EXIT-CHK-23', 'Exit permit issued for departing expat employees (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'WAIVED', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '46 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'MIGRATION', 'VISA_EXIT-CHK-24', 'Medical insurance cancellation notifications dispatched (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'WAIVED', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '48 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'CANCELLATION', 'VISA_EXIT-CHK-25', 'Accommodation transport clearance checklist signed (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'WAIVED', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '50 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'EXIT_PERMIT', 'VISA_EXIT-CHK-26', 'PRO exit report uploaded with official cancellations stamps (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'WAIVED', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '52 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'PASSPORT_RETURN', 'VISA_EXIT-CHK-27', 'Dependent visa exit cancellations registered (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'WAIVED', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '54 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'DEPORTATION', 'VISA_EXIT-CHK-28', 'Expired labor cards destroyed and logged for audit (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'WAIVED', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '56 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'REPATRIATION', 'VISA_EXIT-CHK-29', 'Immigration fines verified and paid via portal (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'WAIVED', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '58 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'MIGRATION', 'VISA_EXIT-CHK-30', 'Final government visa cancellation confirmation certificate archived (Scope: Audit Cycle 3)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'WAIVED', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '60 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'CANCELLATION', 'VISA_EXIT-CHK-31', 'Government visa cancellation requests lodged in PRO portal (Scope: Audit Cycle 4)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'WAIVED', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '62 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'EXIT_PERMIT', 'VISA_EXIT-CHK-32', 'Passport exit check verified by immigration specialist (Scope: Audit Cycle 4)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'WAIVED', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '64 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'PASSPORT_RETURN', 'VISA_EXIT-CHK-33', 'Exit permit issued for departing expat employees (Scope: Audit Cycle 4)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'WAIVED', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '66 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'DEPORTATION', 'VISA_EXIT-CHK-34', 'Medical insurance cancellation notifications dispatched (Scope: Audit Cycle 4)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'WAIVED', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '68 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'REPATRIATION', 'VISA_EXIT-CHK-35', 'Accommodation transport clearance checklist signed (Scope: Audit Cycle 4)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'HR_MANAGER', false, 'WAIVED', 
        'HR_MANAGER', CURRENT_TIMESTAMP + INTERVAL '70 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'MIGRATION', 'VISA_EXIT-CHK-36', 'PRO exit report uploaded with official cancellations stamps (Scope: Audit Cycle 4)', 
        'Expected verification and control sign-off must be recorded.', 
        'Audit files upload required.', 'COMPLIANCE_OFFICER', false, 'WAIVED', 
        'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '72 days', NULL, 'Review pending next cycle.', NULL, NULL, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      );

-- 4. SEED 90 RISK REGISTER ENTRIES
INSERT INTO aura_compliance_risk_register_entry (
  id, "tenantId", "domainCode", "riskCode", title, description, category, likelihood, impact, score, band, "ownerRole", "controlRef", "mitigationPlan", status, "reviewedAt", "reviewedBy", "createdAt", "updatedAt", "createdBy", "updatedBy"
) VALUES
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'ER-RSK-01', 'Retaliation against whistleblowers (Evaluation 1)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'ER-CHK-01', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'ER-RSK-02', 'Grievance SLA breaches on critical complaints (Evaluation 1)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'ER-CHK-02', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'ER-RSK-03', 'Leaks of confidential investigation reports (Evaluation 1)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 3, 2, 6, 'MEDIUM', 
        'COMPLIANCE_OFFICER', 'ER-CHK-03', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'ER-RSK-04', 'Unresolved labor disputes leading to strikes (Evaluation 1)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 4, 3, 12, 'HIGH', 
        'COMPLIANCE_OFFICER', 'ER-CHK-04', 'Enforce controls and perform regular audit checks.', 'MITIGATED', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'ER-RSK-05', 'Mediators conflict of interest (Evaluation 1)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'ER-CHK-05', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'ER-RSK-06', 'Unfair dismissal litigation from union employees (Evaluation 2)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 5, 4, 20, 'CRITICAL', 
        'COMPLIANCE_OFFICER', 'ER-CHK-06', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'ER-RSK-07', 'Retaliation against whistleblowers (Evaluation 2)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'ER-CHK-07', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'ER-RSK-08', 'Grievance SLA breaches on critical complaints (Evaluation 2)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 4, 3, 12, 'HIGH', 
        'COMPLIANCE_OFFICER', 'ER-CHK-08', 'Enforce controls and perform regular audit checks.', 'MITIGATED', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'ER-RSK-09', 'Leaks of confidential investigation reports (Evaluation 2)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 3, 2, 6, 'MEDIUM', 
        'COMPLIANCE_OFFICER', 'ER-CHK-09', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'ER-RSK-10', 'Unresolved labor disputes leading to strikes (Evaluation 2)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'ER-CHK-10', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'ER-RSK-11', 'Mediators conflict of interest (Evaluation 3)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'ER-CHK-11', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'ER-RSK-12', 'Unfair dismissal litigation from union employees (Evaluation 3)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 5, 4, 20, 'CRITICAL', 
        'COMPLIANCE_OFFICER', 'ER-CHK-12', 'Enforce controls and perform regular audit checks.', 'MITIGATED', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'ER-RSK-13', 'Retaliation against whistleblowers (Evaluation 3)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'ER-CHK-13', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'ER-RSK-14', 'Grievance SLA breaches on critical complaints (Evaluation 3)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'ER-CHK-14', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'ER-RSK-15', 'Leaks of confidential investigation reports (Evaluation 3)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 3, 2, 6, 'MEDIUM', 
        'COMPLIANCE_OFFICER', 'ER-CHK-15', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'ER-RSK-16', 'Unresolved labor disputes leading to strikes (Evaluation 4)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 4, 3, 12, 'HIGH', 
        'COMPLIANCE_OFFICER', 'ER-CHK-16', 'Enforce controls and perform regular audit checks.', 'MITIGATED', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'ER-RSK-17', 'Mediators conflict of interest (Evaluation 4)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'ER-CHK-17', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'ER', 'ER-RSK-18', 'Unfair dismissal litigation from union employees (Evaluation 4)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 5, 4, 20, 'CRITICAL', 
        'COMPLIANCE_OFFICER', 'ER-CHK-18', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'DISCIPLINARY-RSK-01', 'Missing disciplinary evidence in labor disputes (Evaluation 1)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'DISCIPLINARY-CHK-01', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'DISCIPLINARY-RSK-02', 'Unsigned hearing warning letters (Evaluation 1)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'DISCIPLINARY-CHK-02', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'DISCIPLINARY-RSK-03', 'Disciplinary action timing violations (Evaluation 1)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 3, 2, 6, 'MEDIUM', 
        'COMPLIANCE_OFFICER', 'DISCIPLINARY-CHK-03', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'DISCIPLINARY-RSK-04', 'Improper suspension pay cuts (Evaluation 1)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 4, 3, 12, 'HIGH', 
        'COMPLIANCE_OFFICER', 'DISCIPLINARY-CHK-04', 'Enforce controls and perform regular audit checks.', 'MITIGATED', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'DISCIPLINARY-RSK-05', 'Discrimination allegations on sanctions (Evaluation 1)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'DISCIPLINARY-CHK-05', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'DISCIPLINARY-RSK-06', 'Defamation lawsuits from warning letters (Evaluation 2)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 5, 4, 20, 'CRITICAL', 
        'COMPLIANCE_OFFICER', 'DISCIPLINARY-CHK-06', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'DISCIPLINARY-RSK-07', 'Missing disciplinary evidence in labor disputes (Evaluation 2)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'DISCIPLINARY-CHK-07', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'DISCIPLINARY-RSK-08', 'Unsigned hearing warning letters (Evaluation 2)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 4, 3, 12, 'HIGH', 
        'COMPLIANCE_OFFICER', 'DISCIPLINARY-CHK-08', 'Enforce controls and perform regular audit checks.', 'MITIGATED', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'DISCIPLINARY-RSK-09', 'Disciplinary action timing violations (Evaluation 2)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 3, 2, 6, 'MEDIUM', 
        'COMPLIANCE_OFFICER', 'DISCIPLINARY-CHK-09', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'DISCIPLINARY-RSK-10', 'Improper suspension pay cuts (Evaluation 2)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'DISCIPLINARY-CHK-10', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'DISCIPLINARY-RSK-11', 'Discrimination allegations on sanctions (Evaluation 3)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'DISCIPLINARY-CHK-11', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'DISCIPLINARY-RSK-12', 'Defamation lawsuits from warning letters (Evaluation 3)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 5, 4, 20, 'CRITICAL', 
        'COMPLIANCE_OFFICER', 'DISCIPLINARY-CHK-12', 'Enforce controls and perform regular audit checks.', 'MITIGATED', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'DISCIPLINARY-RSK-13', 'Missing disciplinary evidence in labor disputes (Evaluation 3)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'DISCIPLINARY-CHK-13', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'DISCIPLINARY-RSK-14', 'Unsigned hearing warning letters (Evaluation 3)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'DISCIPLINARY-CHK-14', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'DISCIPLINARY-RSK-15', 'Disciplinary action timing violations (Evaluation 3)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 3, 2, 6, 'MEDIUM', 
        'COMPLIANCE_OFFICER', 'DISCIPLINARY-CHK-15', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'DISCIPLINARY-RSK-16', 'Improper suspension pay cuts (Evaluation 4)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 4, 3, 12, 'HIGH', 
        'COMPLIANCE_OFFICER', 'DISCIPLINARY-CHK-16', 'Enforce controls and perform regular audit checks.', 'MITIGATED', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'DISCIPLINARY-RSK-17', 'Discrimination allegations on sanctions (Evaluation 4)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'DISCIPLINARY-CHK-17', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'DISCIPLINARY', 'DISCIPLINARY-RSK-18', 'Defamation lawsuits from warning letters (Evaluation 4)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 5, 4, 20, 'CRITICAL', 
        'COMPLIANCE_OFFICER', 'DISCIPLINARY-CHK-18', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'SEPARATION-RSK-01', 'Notice period calculations disputes (Evaluation 1)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'SEPARATION-CHK-01', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'SEPARATION-RSK-02', 'Missing manager resignation approval logs (Evaluation 1)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'SEPARATION-CHK-02', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'SEPARATION-RSK-03', 'Incomplete asset recovery leading to data leakage (Evaluation 1)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 3, 2, 6, 'MEDIUM', 
        'COMPLIANCE_OFFICER', 'SEPARATION-CHK-03', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'SEPARATION-RSK-04', 'Late notification to social security (Evaluation 1)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 4, 3, 12, 'HIGH', 
        'COMPLIANCE_OFFICER', 'SEPARATION-CHK-04', 'Enforce controls and perform regular audit checks.', 'MITIGATED', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'SEPARATION-RSK-05', 'Wrongful termination litigation (Evaluation 1)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'SEPARATION-CHK-05', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'SEPARATION-RSK-06', 'Exit survey feedback data breach (Evaluation 2)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 5, 4, 20, 'CRITICAL', 
        'COMPLIANCE_OFFICER', 'SEPARATION-CHK-06', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'SEPARATION-RSK-07', 'Notice period calculations disputes (Evaluation 2)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'SEPARATION-CHK-07', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'SEPARATION-RSK-08', 'Missing manager resignation approval logs (Evaluation 2)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 4, 3, 12, 'HIGH', 
        'COMPLIANCE_OFFICER', 'SEPARATION-CHK-08', 'Enforce controls and perform regular audit checks.', 'MITIGATED', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'SEPARATION-RSK-09', 'Incomplete asset recovery leading to data leakage (Evaluation 2)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 3, 2, 6, 'MEDIUM', 
        'COMPLIANCE_OFFICER', 'SEPARATION-CHK-09', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'SEPARATION-RSK-10', 'Late notification to social security (Evaluation 2)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'SEPARATION-CHK-10', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'SEPARATION-RSK-11', 'Wrongful termination litigation (Evaluation 3)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'SEPARATION-CHK-11', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'SEPARATION-RSK-12', 'Exit survey feedback data breach (Evaluation 3)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 5, 4, 20, 'CRITICAL', 
        'COMPLIANCE_OFFICER', 'SEPARATION-CHK-12', 'Enforce controls and perform regular audit checks.', 'MITIGATED', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'SEPARATION-RSK-13', 'Notice period calculations disputes (Evaluation 3)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'SEPARATION-CHK-13', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'SEPARATION-RSK-14', 'Missing manager resignation approval logs (Evaluation 3)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'SEPARATION-CHK-14', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'SEPARATION-RSK-15', 'Incomplete asset recovery leading to data leakage (Evaluation 3)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 3, 2, 6, 'MEDIUM', 
        'COMPLIANCE_OFFICER', 'SEPARATION-CHK-15', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'SEPARATION-RSK-16', 'Late notification to social security (Evaluation 4)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 4, 3, 12, 'HIGH', 
        'COMPLIANCE_OFFICER', 'SEPARATION-CHK-16', 'Enforce controls and perform regular audit checks.', 'MITIGATED', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'SEPARATION-RSK-17', 'Wrongful termination litigation (Evaluation 4)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'SEPARATION-CHK-17', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'SEPARATION', 'SEPARATION-RSK-18', 'Exit survey feedback data breach (Evaluation 4)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 5, 4, 20, 'CRITICAL', 
        'COMPLIANCE_OFFICER', 'SEPARATION-CHK-18', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'EOSB-RSK-01', 'Incorrect gratuity calculation formulas (Evaluation 1)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'EOSB-CHK-01', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'EOSB-RSK-02', 'Delayed gratuity bank transfers (Evaluation 1)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'EOSB-CHK-02', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'EOSB-RSK-03', 'Unreconciled payroll loans at termination (Evaluation 1)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 3, 2, 6, 'MEDIUM', 
        'COMPLIANCE_OFFICER', 'EOSB-CHK-03', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'EOSB-RSK-04', 'Late filing penalties from pension authority (Evaluation 1)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 4, 3, 12, 'HIGH', 
        'COMPLIANCE_OFFICER', 'EOSB-CHK-04', 'Enforce controls and perform regular audit checks.', 'MITIGATED', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'EOSB-RSK-05', 'Errors in leave encashment calculations (Evaluation 1)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'EOSB-CHK-05', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'EOSB-RSK-06', 'Currency exchange proration mismatches (Evaluation 2)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 5, 4, 20, 'CRITICAL', 
        'COMPLIANCE_OFFICER', 'EOSB-CHK-06', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'EOSB-RSK-07', 'Incorrect gratuity calculation formulas (Evaluation 2)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'EOSB-CHK-07', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'EOSB-RSK-08', 'Delayed gratuity bank transfers (Evaluation 2)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 4, 3, 12, 'HIGH', 
        'COMPLIANCE_OFFICER', 'EOSB-CHK-08', 'Enforce controls and perform regular audit checks.', 'MITIGATED', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'EOSB-RSK-09', 'Unreconciled payroll loans at termination (Evaluation 2)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 3, 2, 6, 'MEDIUM', 
        'COMPLIANCE_OFFICER', 'EOSB-CHK-09', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'EOSB-RSK-10', 'Late filing penalties from pension authority (Evaluation 2)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'EOSB-CHK-10', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'EOSB-RSK-11', 'Errors in leave encashment calculations (Evaluation 3)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'EOSB-CHK-11', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'EOSB-RSK-12', 'Currency exchange proration mismatches (Evaluation 3)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 5, 4, 20, 'CRITICAL', 
        'COMPLIANCE_OFFICER', 'EOSB-CHK-12', 'Enforce controls and perform regular audit checks.', 'MITIGATED', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'EOSB-RSK-13', 'Incorrect gratuity calculation formulas (Evaluation 3)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'EOSB-CHK-13', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'EOSB-RSK-14', 'Delayed gratuity bank transfers (Evaluation 3)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'EOSB-CHK-14', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'EOSB-RSK-15', 'Unreconciled payroll loans at termination (Evaluation 3)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 3, 2, 6, 'MEDIUM', 
        'COMPLIANCE_OFFICER', 'EOSB-CHK-15', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'EOSB-RSK-16', 'Late filing penalties from pension authority (Evaluation 4)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 4, 3, 12, 'HIGH', 
        'COMPLIANCE_OFFICER', 'EOSB-CHK-16', 'Enforce controls and perform regular audit checks.', 'MITIGATED', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'EOSB-RSK-17', 'Errors in leave encashment calculations (Evaluation 4)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'EOSB-CHK-17', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'EOSB', 'EOSB-RSK-18', 'Currency exchange proration mismatches (Evaluation 4)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 5, 4, 20, 'CRITICAL', 
        'COMPLIANCE_OFFICER', 'EOSB-CHK-18', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'VISA_EXIT-RSK-01', 'Visa overstay fine liabilities (Evaluation 1)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'VISA_EXIT-CHK-01', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'VISA_EXIT-RSK-02', 'Delayed visa cancellation approvals (Evaluation 1)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'VISA_EXIT-CHK-02', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'VISA_EXIT-RSK-03', 'Expatriate exit permit delays (Evaluation 1)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 3, 2, 6, 'MEDIUM', 
        'COMPLIANCE_OFFICER', 'VISA_EXIT-CHK-03', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'VISA_EXIT-RSK-04', 'Medical insurance coverage cancellation lag (Evaluation 1)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 4, 3, 12, 'HIGH', 
        'COMPLIANCE_OFFICER', 'VISA_EXIT-CHK-04', 'Enforce controls and perform regular audit checks.', 'MITIGATED', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'VISA_EXIT-RSK-05', 'Orphan dependent visa records (Evaluation 1)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'VISA_EXIT-CHK-05', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'VISA_EXIT-RSK-06', 'Regulator audits on cancelled labor cards (Evaluation 2)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 5, 4, 20, 'CRITICAL', 
        'COMPLIANCE_OFFICER', 'VISA_EXIT-CHK-06', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'VISA_EXIT-RSK-07', 'Visa overstay fine liabilities (Evaluation 2)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'VISA_EXIT-CHK-07', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'VISA_EXIT-RSK-08', 'Delayed visa cancellation approvals (Evaluation 2)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 4, 3, 12, 'HIGH', 
        'COMPLIANCE_OFFICER', 'VISA_EXIT-CHK-08', 'Enforce controls and perform regular audit checks.', 'MITIGATED', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'VISA_EXIT-RSK-09', 'Expatriate exit permit delays (Evaluation 2)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 3, 2, 6, 'MEDIUM', 
        'COMPLIANCE_OFFICER', 'VISA_EXIT-CHK-09', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'VISA_EXIT-RSK-10', 'Medical insurance coverage cancellation lag (Evaluation 2)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'VISA_EXIT-CHK-10', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'VISA_EXIT-RSK-11', 'Orphan dependent visa records (Evaluation 3)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'VISA_EXIT-CHK-11', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'VISA_EXIT-RSK-12', 'Regulator audits on cancelled labor cards (Evaluation 3)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 5, 4, 20, 'CRITICAL', 
        'COMPLIANCE_OFFICER', 'VISA_EXIT-CHK-12', 'Enforce controls and perform regular audit checks.', 'MITIGATED', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'VISA_EXIT-RSK-13', 'Visa overstay fine liabilities (Evaluation 3)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'VISA_EXIT-CHK-13', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'VISA_EXIT-RSK-14', 'Delayed visa cancellation approvals (Evaluation 3)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'VISA_EXIT-CHK-14', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'VISA_EXIT-RSK-15', 'Expatriate exit permit delays (Evaluation 3)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 3, 2, 6, 'MEDIUM', 
        'COMPLIANCE_OFFICER', 'VISA_EXIT-CHK-15', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'VISA_EXIT-RSK-16', 'Medical insurance coverage cancellation lag (Evaluation 4)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 4, 3, 12, 'HIGH', 
        'COMPLIANCE_OFFICER', 'VISA_EXIT-CHK-16', 'Enforce controls and perform regular audit checks.', 'MITIGATED', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'VISA_EXIT-RSK-17', 'Orphan dependent visa records (Evaluation 4)', 
        'Evaluation of risks related to GRC auditing scopes.', 'REGULATORY', 2, 1, 2, 'LOW', 
        'COMPLIANCE_OFFICER', 'VISA_EXIT-CHK-17', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      ),
(
        gen_random_uuid(), (SELECT tenant_id FROM vars), 'VISA_EXIT', 'VISA_EXIT-RSK-18', 'Regulator audits on cancelled labor cards (Evaluation 4)', 
        'Evaluation of risks related to GRC auditing scopes.', 'OPERATIONAL', 5, 4, 20, 'CRITICAL', 
        'COMPLIANCE_OFFICER', 'VISA_EXIT-CHK-18', 'Enforce controls and perform regular audit checks.', 'OPEN', 
        CURRENT_TIMESTAMP, (SELECT user_id FROM vars), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
      );

-- 5. SEED 80 CORRECTIVE ACTION PLANS (CAPAs)
INSERT INTO aura_compliance_corrective_action (
  id, "tenantId", "actionNumber", "sourceDomain", "sourceRef", title, description, "rootCause", severity, "ownerId", "dueAt", status, "createdAt", "updatedAt", "createdBy", "updatedBy"
) VALUES
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-001', 'DISCIPLINARY', 'DISCIPLINARY-CHK-02', 'CAPA Remediation for GRC issue DISCIPLINARY-CHK-02', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-002', 'SEPARATION', 'SEPARATION-CHK-03', 'CAPA Remediation for GRC issue SEPARATION-CHK-03', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-003', 'EOSB', 'EOSB-CHK-04', 'CAPA Remediation for GRC issue EOSB-CHK-04', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'HIGH', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-004', 'VISA_EXIT', 'VISA_EXIT-CHK-05', 'CAPA Remediation for GRC issue VISA_EXIT-CHK-05', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-005', 'ER', 'ER-CHK-06', 'CAPA Remediation for GRC issue ER-CHK-06', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'CRITICAL', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-006', 'DISCIPLINARY', 'DISCIPLINARY-CHK-07', 'CAPA Remediation for GRC issue DISCIPLINARY-CHK-07', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'HIGH', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-007', 'SEPARATION', 'SEPARATION-CHK-08', 'CAPA Remediation for GRC issue SEPARATION-CHK-08', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-008', 'EOSB', 'EOSB-CHK-09', 'CAPA Remediation for GRC issue EOSB-CHK-09', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-009', 'VISA_EXIT', 'VISA_EXIT-CHK-10', 'CAPA Remediation for GRC issue VISA_EXIT-CHK-10', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'HIGH', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-010', 'ER', 'ER-CHK-11', 'CAPA Remediation for GRC issue ER-CHK-11', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'CRITICAL', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-011', 'DISCIPLINARY', 'DISCIPLINARY-CHK-12', 'CAPA Remediation for GRC issue DISCIPLINARY-CHK-12', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-012', 'SEPARATION', 'SEPARATION-CHK-13', 'CAPA Remediation for GRC issue SEPARATION-CHK-13', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'HIGH', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-013', 'EOSB', 'EOSB-CHK-14', 'CAPA Remediation for GRC issue EOSB-CHK-14', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-014', 'VISA_EXIT', 'VISA_EXIT-CHK-15', 'CAPA Remediation for GRC issue VISA_EXIT-CHK-15', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-015', 'ER', 'ER-CHK-01', 'CAPA Remediation for GRC issue ER-CHK-01', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'HIGH', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-016', 'DISCIPLINARY', 'DISCIPLINARY-CHK-02', 'CAPA Remediation for GRC issue DISCIPLINARY-CHK-02', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-017', 'SEPARATION', 'SEPARATION-CHK-03', 'CAPA Remediation for GRC issue SEPARATION-CHK-03', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-018', 'EOSB', 'EOSB-CHK-04', 'CAPA Remediation for GRC issue EOSB-CHK-04', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'HIGH', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-019', 'VISA_EXIT', 'VISA_EXIT-CHK-05', 'CAPA Remediation for GRC issue VISA_EXIT-CHK-05', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-020', 'ER', 'ER-CHK-06', 'CAPA Remediation for GRC issue ER-CHK-06', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'CRITICAL', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-021', 'DISCIPLINARY', 'DISCIPLINARY-CHK-07', 'CAPA Remediation for GRC issue DISCIPLINARY-CHK-07', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'HIGH', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-022', 'SEPARATION', 'SEPARATION-CHK-08', 'CAPA Remediation for GRC issue SEPARATION-CHK-08', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-023', 'EOSB', 'EOSB-CHK-09', 'CAPA Remediation for GRC issue EOSB-CHK-09', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-024', 'VISA_EXIT', 'VISA_EXIT-CHK-10', 'CAPA Remediation for GRC issue VISA_EXIT-CHK-10', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'HIGH', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-025', 'ER', 'ER-CHK-11', 'CAPA Remediation for GRC issue ER-CHK-11', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'CRITICAL', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-026', 'DISCIPLINARY', 'DISCIPLINARY-CHK-12', 'CAPA Remediation for GRC issue DISCIPLINARY-CHK-12', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-027', 'SEPARATION', 'SEPARATION-CHK-13', 'CAPA Remediation for GRC issue SEPARATION-CHK-13', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'HIGH', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-028', 'EOSB', 'EOSB-CHK-14', 'CAPA Remediation for GRC issue EOSB-CHK-14', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-029', 'VISA_EXIT', 'VISA_EXIT-CHK-15', 'CAPA Remediation for GRC issue VISA_EXIT-CHK-15', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-030', 'ER', 'ER-CHK-01', 'CAPA Remediation for GRC issue ER-CHK-01', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'HIGH', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-031', 'DISCIPLINARY', 'DISCIPLINARY-CHK-02', 'CAPA Remediation for GRC issue DISCIPLINARY-CHK-02', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-032', 'SEPARATION', 'SEPARATION-CHK-03', 'CAPA Remediation for GRC issue SEPARATION-CHK-03', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-033', 'EOSB', 'EOSB-CHK-04', 'CAPA Remediation for GRC issue EOSB-CHK-04', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'HIGH', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-034', 'VISA_EXIT', 'VISA_EXIT-CHK-05', 'CAPA Remediation for GRC issue VISA_EXIT-CHK-05', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-035', 'ER', 'ER-CHK-06', 'CAPA Remediation for GRC issue ER-CHK-06', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'CRITICAL', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-036', 'DISCIPLINARY', 'DISCIPLINARY-CHK-07', 'CAPA Remediation for GRC issue DISCIPLINARY-CHK-07', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'HIGH', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-037', 'SEPARATION', 'SEPARATION-CHK-08', 'CAPA Remediation for GRC issue SEPARATION-CHK-08', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-038', 'EOSB', 'EOSB-CHK-09', 'CAPA Remediation for GRC issue EOSB-CHK-09', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-039', 'VISA_EXIT', 'VISA_EXIT-CHK-10', 'CAPA Remediation for GRC issue VISA_EXIT-CHK-10', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'HIGH', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-040', 'ER', 'ER-CHK-11', 'CAPA Remediation for GRC issue ER-CHK-11', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'CRITICAL', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-041', 'DISCIPLINARY', 'DISCIPLINARY-CHK-12', 'CAPA Remediation for GRC issue DISCIPLINARY-CHK-12', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-042', 'SEPARATION', 'SEPARATION-CHK-13', 'CAPA Remediation for GRC issue SEPARATION-CHK-13', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'HIGH', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-043', 'EOSB', 'EOSB-CHK-14', 'CAPA Remediation for GRC issue EOSB-CHK-14', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-044', 'VISA_EXIT', 'VISA_EXIT-CHK-15', 'CAPA Remediation for GRC issue VISA_EXIT-CHK-15', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-045', 'ER', 'ER-CHK-01', 'CAPA Remediation for GRC issue ER-CHK-01', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'HIGH', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-046', 'DISCIPLINARY', 'DISCIPLINARY-CHK-02', 'CAPA Remediation for GRC issue DISCIPLINARY-CHK-02', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-047', 'SEPARATION', 'SEPARATION-CHK-03', 'CAPA Remediation for GRC issue SEPARATION-CHK-03', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-048', 'EOSB', 'EOSB-CHK-04', 'CAPA Remediation for GRC issue EOSB-CHK-04', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'HIGH', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-049', 'VISA_EXIT', 'VISA_EXIT-CHK-05', 'CAPA Remediation for GRC issue VISA_EXIT-CHK-05', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-050', 'ER', 'ER-CHK-06', 'CAPA Remediation for GRC issue ER-CHK-06', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'CRITICAL', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-051', 'DISCIPLINARY', 'DISCIPLINARY-CHK-07', 'CAPA Remediation for GRC issue DISCIPLINARY-CHK-07', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'HIGH', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-052', 'SEPARATION', 'SEPARATION-CHK-08', 'CAPA Remediation for GRC issue SEPARATION-CHK-08', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-053', 'EOSB', 'EOSB-CHK-09', 'CAPA Remediation for GRC issue EOSB-CHK-09', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-054', 'VISA_EXIT', 'VISA_EXIT-CHK-10', 'CAPA Remediation for GRC issue VISA_EXIT-CHK-10', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'HIGH', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-055', 'ER', 'ER-CHK-11', 'CAPA Remediation for GRC issue ER-CHK-11', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'CRITICAL', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-056', 'DISCIPLINARY', 'DISCIPLINARY-CHK-12', 'CAPA Remediation for GRC issue DISCIPLINARY-CHK-12', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-057', 'SEPARATION', 'SEPARATION-CHK-13', 'CAPA Remediation for GRC issue SEPARATION-CHK-13', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'HIGH', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-058', 'EOSB', 'EOSB-CHK-14', 'CAPA Remediation for GRC issue EOSB-CHK-14', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-059', 'VISA_EXIT', 'VISA_EXIT-CHK-15', 'CAPA Remediation for GRC issue VISA_EXIT-CHK-15', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-060', 'ER', 'ER-CHK-01', 'CAPA Remediation for GRC issue ER-CHK-01', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'HIGH', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-061', 'DISCIPLINARY', 'DISCIPLINARY-CHK-02', 'CAPA Remediation for GRC issue DISCIPLINARY-CHK-02', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-062', 'SEPARATION', 'SEPARATION-CHK-03', 'CAPA Remediation for GRC issue SEPARATION-CHK-03', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-063', 'EOSB', 'EOSB-CHK-04', 'CAPA Remediation for GRC issue EOSB-CHK-04', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'HIGH', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-064', 'VISA_EXIT', 'VISA_EXIT-CHK-05', 'CAPA Remediation for GRC issue VISA_EXIT-CHK-05', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-065', 'ER', 'ER-CHK-06', 'CAPA Remediation for GRC issue ER-CHK-06', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'CRITICAL', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-066', 'DISCIPLINARY', 'DISCIPLINARY-CHK-07', 'CAPA Remediation for GRC issue DISCIPLINARY-CHK-07', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'HIGH', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-067', 'SEPARATION', 'SEPARATION-CHK-08', 'CAPA Remediation for GRC issue SEPARATION-CHK-08', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-068', 'EOSB', 'EOSB-CHK-09', 'CAPA Remediation for GRC issue EOSB-CHK-09', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-069', 'VISA_EXIT', 'VISA_EXIT-CHK-10', 'CAPA Remediation for GRC issue VISA_EXIT-CHK-10', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'HIGH', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-070', 'ER', 'ER-CHK-11', 'CAPA Remediation for GRC issue ER-CHK-11', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'CRITICAL', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-071', 'DISCIPLINARY', 'DISCIPLINARY-CHK-12', 'CAPA Remediation for GRC issue DISCIPLINARY-CHK-12', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-072', 'SEPARATION', 'SEPARATION-CHK-13', 'CAPA Remediation for GRC issue SEPARATION-CHK-13', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'HIGH', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-073', 'EOSB', 'EOSB-CHK-14', 'CAPA Remediation for GRC issue EOSB-CHK-14', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-074', 'VISA_EXIT', 'VISA_EXIT-CHK-15', 'CAPA Remediation for GRC issue VISA_EXIT-CHK-15', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-075', 'ER', 'ER-CHK-01', 'CAPA Remediation for GRC issue ER-CHK-01', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'HIGH', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-076', 'DISCIPLINARY', 'DISCIPLINARY-CHK-02', 'CAPA Remediation for GRC issue DISCIPLINARY-CHK-02', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-077', 'SEPARATION', 'SEPARATION-CHK-03', 'CAPA Remediation for GRC issue SEPARATION-CHK-03', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-078', 'EOSB', 'EOSB-CHK-04', 'CAPA Remediation for GRC issue EOSB-CHK-04', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'HIGH', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-079', 'VISA_EXIT', 'VISA_EXIT-CHK-05', 'CAPA Remediation for GRC issue VISA_EXIT-CHK-05', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'MEDIUM', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA-20260708-080', 'ER', 'ER-CHK-06', 'CAPA Remediation for GRC issue ER-CHK-06', 
      'Remediate control failures and enforce standard compliance policies.', 'Lack of documented verification guidelines and staff training.', 'CRITICAL', 'COMPLIANCE_OFFICER', CURRENT_TIMESTAMP + INTERVAL '30 days', 
      'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, (SELECT user_id FROM vars), (SELECT user_id FROM vars)
    );

-- 6. SEED 150 EVIDENCE RECORDS
INSERT INTO aura_compliance_register_evidence (
  id, "tenantId", "targetType", "targetId", "fileName", "fileUrl", "mimeType", "fileSize", "uploadedBy", "uploadedAt", "verifiedBy", "verifiedAt", "acceptedStatus", checksum, version, "expiresAt", "createdAt", "updatedAt"
) VALUES
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-02', 'disciplinary-chk-02_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/disciplinary-chk-02_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 100, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '1 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_1', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-003', 'capa-20260708-003_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-003_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 200, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '2 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_2', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-04', 'eosb-rsk-04_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/eosb-rsk-04_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 300, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '3 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_3', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-005', 'capa-20260708-005_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-005_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 400, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '4 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_4', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-06', 'er-chk-06_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/er-chk-06_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 500, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '5 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_5', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-07', 'disciplinary-rsk-07_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/disciplinary-rsk-07_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 600, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '6 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_6', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-08', 'separation-chk-08_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/separation-chk-08_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 700, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '7 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_7', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-009', 'capa-20260708-009_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-009_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 800, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '8 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_8', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-10', 'visa_exit-rsk-10_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/visa_exit-rsk-10_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 900, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '9 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_9', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-011', 'capa-20260708-011_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-011_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 1000, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '10 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_10', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-12', 'disciplinary-chk-12_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/disciplinary-chk-12_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 1100, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '11 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_11', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-03', 'separation-rsk-03_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/separation-rsk-03_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 1200, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '12 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_12', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-14', 'eosb-chk-14_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/eosb-chk-14_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 1300, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '13 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_13', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-015', 'capa-20260708-015_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-015_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 1400, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '14 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_14', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-06', 'er-rsk-06_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/er-rsk-06_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 1500, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '15 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_15', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-017', 'capa-20260708-017_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-017_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 1600, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '16 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_16', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-18', 'separation-chk-18_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/separation-chk-18_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 1700, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '17 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_17', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-09', 'eosb-rsk-09_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/eosb-rsk-09_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 1800, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '18 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_18', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-20', 'visa_exit-chk-20_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/visa_exit-chk-20_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 1900, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '19 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_19', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-021', 'capa-20260708-021_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-021_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 2000, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '20 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_20', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-02', 'disciplinary-rsk-02_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/disciplinary-rsk-02_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 2100, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '21 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_21', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-023', 'capa-20260708-023_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-023_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 2200, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '22 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_22', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-24', 'eosb-chk-24_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/eosb-chk-24_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 2300, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '23 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_23', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-05', 'visa_exit-rsk-05_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/visa_exit-rsk-05_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 2400, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '24 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_24', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-01', 'er-chk-01_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/er-chk-01_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 2500, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '25 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_25', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-027', 'capa-20260708-027_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-027_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 2600, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '26 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_26', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-08', 'separation-rsk-08_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/separation-rsk-08_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 2700, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '27 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_27', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-029', 'capa-20260708-029_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-029_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 2800, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '28 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_28', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-05', 'visa_exit-chk-05_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/visa_exit-chk-05_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 2900, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '29 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_29', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-01', 'er-rsk-01_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/er-rsk-01_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 3000, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '30 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_30', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-07', 'disciplinary-chk-07_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/disciplinary-chk-07_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 3100, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '31 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_31', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-033', 'capa-20260708-033_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-033_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 3200, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '32 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_32', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-04', 'eosb-rsk-04_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/eosb-rsk-04_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 3300, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '33 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_33', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-035', 'capa-20260708-035_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-035_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 3400, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '34 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_34', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-11', 'er-chk-11_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/er-chk-11_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 3500, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '35 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_35', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-07', 'disciplinary-rsk-07_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/disciplinary-rsk-07_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 3600, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '36 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_36', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-13', 'separation-chk-13_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/separation-chk-13_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 3700, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '37 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_37', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-039', 'capa-20260708-039_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-039_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 3800, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '38 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_38', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-10', 'visa_exit-rsk-10_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/visa_exit-rsk-10_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 3900, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '39 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_39', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-041', 'capa-20260708-041_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-041_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 4000, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '40 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_40', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-17', 'disciplinary-chk-17_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/disciplinary-chk-17_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 4100, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '41 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_41', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-03', 'separation-rsk-03_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/separation-rsk-03_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 4200, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '42 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_42', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-19', 'eosb-chk-19_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/eosb-chk-19_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 4300, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '43 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_43', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-045', 'capa-20260708-045_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-045_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 4400, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '44 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_44', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-06', 'er-rsk-06_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/er-rsk-06_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 4500, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '45 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_45', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-047', 'capa-20260708-047_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-047_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 4600, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '46 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_46', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-23', 'separation-chk-23_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/separation-chk-23_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 4700, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '47 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_47', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-09', 'eosb-rsk-09_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/eosb-rsk-09_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 4800, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '48 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_48', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-25', 'visa_exit-chk-25_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/visa_exit-chk-25_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 4900, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '49 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_49', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-051', 'capa-20260708-051_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-051_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 5000, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '50 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_50', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-02', 'disciplinary-rsk-02_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/disciplinary-rsk-02_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 5100, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '51 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_51', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-053', 'capa-20260708-053_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-053_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 5200, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '52 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_52', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-04', 'eosb-chk-04_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/eosb-chk-04_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 5300, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '53 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_53', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-05', 'visa_exit-rsk-05_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/visa_exit-rsk-05_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 5400, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '54 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_54', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-06', 'er-chk-06_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/er-chk-06_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 5500, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '55 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_55', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-057', 'capa-20260708-057_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-057_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 5600, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '56 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_56', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-08', 'separation-rsk-08_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/separation-rsk-08_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 5700, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '57 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_57', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-059', 'capa-20260708-059_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-059_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 5800, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '58 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_58', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-10', 'visa_exit-chk-10_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/visa_exit-chk-10_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 5900, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '59 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_59', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-01', 'er-rsk-01_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/er-rsk-01_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 6000, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '60 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_60', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-12', 'disciplinary-chk-12_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/disciplinary-chk-12_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 6100, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '61 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_61', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-003', 'capa-20260708-003_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-003_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 6200, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '62 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_62', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-04', 'eosb-rsk-04_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/eosb-rsk-04_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 6300, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '63 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_63', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-005', 'capa-20260708-005_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-005_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 6400, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '64 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_64', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-16', 'er-chk-16_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/er-chk-16_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 6500, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '65 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_65', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-07', 'disciplinary-rsk-07_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/disciplinary-rsk-07_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 6600, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '66 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_66', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-18', 'separation-chk-18_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/separation-chk-18_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 6700, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '67 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_67', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-009', 'capa-20260708-009_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-009_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 6800, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '68 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_68', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-10', 'visa_exit-rsk-10_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/visa_exit-rsk-10_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 6900, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '69 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_69', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-011', 'capa-20260708-011_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-011_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 7000, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '70 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_70', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-22', 'disciplinary-chk-22_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/disciplinary-chk-22_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 7100, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '71 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_71', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-03', 'separation-rsk-03_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/separation-rsk-03_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 7200, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '72 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_72', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-24', 'eosb-chk-24_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/eosb-chk-24_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 7300, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '73 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_73', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-015', 'capa-20260708-015_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-015_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 7400, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '74 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_74', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-06', 'er-rsk-06_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/er-rsk-06_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 7500, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '75 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_75', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-017', 'capa-20260708-017_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-017_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 7600, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '76 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_76', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-03', 'separation-chk-03_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/separation-chk-03_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 7700, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '77 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_77', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-09', 'eosb-rsk-09_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/eosb-rsk-09_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 7800, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '78 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_78', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-05', 'visa_exit-chk-05_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/visa_exit-chk-05_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 7900, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '79 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_79', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-021', 'capa-20260708-021_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-021_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 8000, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '80 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_80', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-02', 'disciplinary-rsk-02_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/disciplinary-rsk-02_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 8100, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '81 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_81', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-023', 'capa-20260708-023_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-023_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 8200, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '82 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_82', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-09', 'eosb-chk-09_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/eosb-chk-09_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 8300, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '83 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_83', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-05', 'visa_exit-rsk-05_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/visa_exit-rsk-05_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 8400, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '84 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_84', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-11', 'er-chk-11_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/er-chk-11_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 8500, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '85 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_85', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-027', 'capa-20260708-027_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-027_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 8600, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '86 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_86', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-08', 'separation-rsk-08_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/separation-rsk-08_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 8700, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '87 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_87', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-029', 'capa-20260708-029_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-029_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 8800, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '88 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_88', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-15', 'visa_exit-chk-15_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/visa_exit-chk-15_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 8900, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '89 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_89', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-01', 'er-rsk-01_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/er-rsk-01_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 9000, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '90 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_90', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-17', 'disciplinary-chk-17_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/disciplinary-chk-17_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 9100, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '91 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_91', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-033', 'capa-20260708-033_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-033_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 9200, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '92 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_92', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-04', 'eosb-rsk-04_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/eosb-rsk-04_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 9300, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '93 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_93', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-035', 'capa-20260708-035_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-035_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 9400, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '94 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_94', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-21', 'er-chk-21_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/er-chk-21_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 9500, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '95 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_95', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-07', 'disciplinary-rsk-07_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/disciplinary-rsk-07_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 9600, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '96 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_96', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-23', 'separation-chk-23_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/separation-chk-23_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 9700, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '97 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_97', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-039', 'capa-20260708-039_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-039_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 9800, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '98 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_98', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-10', 'visa_exit-rsk-10_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/visa_exit-rsk-10_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 9900, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '99 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_99', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-041', 'capa-20260708-041_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-041_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 10000, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '100 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_100', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-02', 'disciplinary-chk-02_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/disciplinary-chk-02_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 10100, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '101 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_101', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-03', 'separation-rsk-03_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/separation-rsk-03_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 10200, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '102 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_102', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-04', 'eosb-chk-04_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/eosb-chk-04_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 10300, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '103 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_103', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-045', 'capa-20260708-045_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-045_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 10400, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '104 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_104', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-06', 'er-rsk-06_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/er-rsk-06_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 10500, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '105 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_105', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-047', 'capa-20260708-047_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-047_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 10600, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '106 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_106', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-08', 'separation-chk-08_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/separation-chk-08_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 10700, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '107 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_107', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-09', 'eosb-rsk-09_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/eosb-rsk-09_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 10800, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '108 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_108', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-10', 'visa_exit-chk-10_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/visa_exit-chk-10_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 10900, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '109 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_109', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-051', 'capa-20260708-051_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-051_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 11000, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '110 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_110', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-02', 'disciplinary-rsk-02_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/disciplinary-rsk-02_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 11100, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '111 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_111', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-053', 'capa-20260708-053_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-053_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 11200, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '112 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_112', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-14', 'eosb-chk-14_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/eosb-chk-14_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 11300, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '113 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_113', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-05', 'visa_exit-rsk-05_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/visa_exit-rsk-05_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 11400, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '114 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_114', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-16', 'er-chk-16_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/er-chk-16_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 11500, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '115 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_115', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-057', 'capa-20260708-057_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-057_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 11600, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '116 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_116', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-08', 'separation-rsk-08_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/separation-rsk-08_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 11700, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '117 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_117', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-059', 'capa-20260708-059_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-059_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 11800, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '118 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_118', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-20', 'visa_exit-chk-20_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/visa_exit-chk-20_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 11900, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '119 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_119', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-01', 'er-rsk-01_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/er-rsk-01_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 12000, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '120 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_120', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-22', 'disciplinary-chk-22_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/disciplinary-chk-22_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 12100, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '121 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_121', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-003', 'capa-20260708-003_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-003_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 12200, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '122 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_122', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-04', 'eosb-rsk-04_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/eosb-rsk-04_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 12300, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '123 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_123', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-005', 'capa-20260708-005_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-005_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 12400, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '124 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_124', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-01', 'er-chk-01_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/er-chk-01_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 12500, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '125 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_125', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-07', 'disciplinary-rsk-07_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/disciplinary-rsk-07_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 12600, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '126 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_126', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-03', 'separation-chk-03_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/separation-chk-03_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 12700, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '127 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_127', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-009', 'capa-20260708-009_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-009_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 12800, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '128 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_128', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-10', 'visa_exit-rsk-10_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/visa_exit-rsk-10_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 12900, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '129 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_129', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-011', 'capa-20260708-011_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-011_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 13000, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '130 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_130', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-07', 'disciplinary-chk-07_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/disciplinary-chk-07_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 13100, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '131 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_131', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-03', 'separation-rsk-03_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/separation-rsk-03_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 13200, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '132 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_132', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-09', 'eosb-chk-09_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/eosb-chk-09_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 13300, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '133 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_133', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-015', 'capa-20260708-015_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-015_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 13400, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '134 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_134', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-06', 'er-rsk-06_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/er-rsk-06_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 13500, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '135 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_135', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-017', 'capa-20260708-017_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-017_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 13600, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '136 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_136', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-13', 'separation-chk-13_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/separation-chk-13_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 13700, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '137 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_137', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-09', 'eosb-rsk-09_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/eosb-rsk-09_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 13800, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '138 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_138', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-15', 'visa_exit-chk-15_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/visa_exit-chk-15_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 13900, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '139 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_139', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-021', 'capa-20260708-021_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-021_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 14000, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '140 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_140', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-02', 'disciplinary-rsk-02_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/disciplinary-rsk-02_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 14100, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '141 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_141', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-023', 'capa-20260708-023_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-023_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 14200, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '142 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_142', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-19', 'eosb-chk-19_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/eosb-chk-19_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 14300, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '143 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_143', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-05', 'visa_exit-rsk-05_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/visa_exit-rsk-05_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 14400, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '144 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_144', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-21', 'er-chk-21_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/er-chk-21_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 14500, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '145 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_145', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-027', 'capa-20260708-027_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-027_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 14600, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '146 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_146', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-08', 'separation-rsk-08_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/separation-rsk-08_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 14700, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '147 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_147', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-029', 'capa-20260708-029_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/capa-20260708-029_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 14800, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '148 hours', 
      NULL, NULL, 'PENDING', 'sha256_checksum_hash_148', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-25', 'visa_exit-chk-25_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/visa_exit-chk-25_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 14900, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '149 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_149', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-01', 'er-rsk-01_compliance_evidence_doc_v1.pdf', '/uploads/compliance-evidence/er-rsk-01_compliance_evidence_doc_v1.pdf', 
      'application/pdf', 204850 + 15000, (SELECT user_id FROM vars), CURRENT_TIMESTAMP - INTERVAL '150 hours', 
      (SELECT user_id FROM vars), CURRENT_TIMESTAMP, 'ACCEPTED', 'sha256_checksum_hash_150', 1, 
      CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    );

-- 7. SEED 450 AUDIT TIMELINE EVENT RECORDS
INSERT INTO aura_compliance_register_timeline (
  id, "tenantId", "targetType", "targetId", "eventType", title, description, "userId", "userName", timestamp, "createdAt"
) VALUES
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-02', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for DISCIPLINARY-CHK-02', 
      'System audit trail registered event EVIDENCE_UPLOADED for code DISCIPLINARY-CHK-02.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '1 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-003', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-003', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-003.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-04', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for EOSB-RSK-04', 
      'System audit trail registered event RISK_ACCEPTED for code EOSB-RSK-04.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '3 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-005', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-005', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-005.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '4 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-06', 'CAPA_CREATED', 'CAPA_CREATED log for ER-CHK-06', 
      'System audit trail registered event CAPA_CREATED for code ER-CHK-06.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '5 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-07', 'CAPA_CLOSED', 'CAPA_CLOSED log for DISCIPLINARY-RSK-07', 
      'System audit trail registered event CAPA_CLOSED for code DISCIPLINARY-RSK-07.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '6 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-08', 'APPROVED', 'APPROVED log for SEPARATION-CHK-08', 
      'System audit trail registered event APPROVED for code SEPARATION-CHK-08.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '7 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-009', 'CREATED', 'CREATED log for CAPA-20260708-009', 
      'System audit trail registered event CREATED for code CAPA-20260708-009.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '8 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-10', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for VISA_EXIT-RSK-10', 
      'System audit trail registered event EVIDENCE_UPLOADED for code VISA_EXIT-RSK-10.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '9 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-011', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-011', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-011.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '10 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-12', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for DISCIPLINARY-CHK-12', 
      'System audit trail registered event RISK_ACCEPTED for code DISCIPLINARY-CHK-12.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '11 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-13', 'RISK_MITIGATED', 'RISK_MITIGATED log for SEPARATION-RSK-13', 
      'System audit trail registered event RISK_MITIGATED for code SEPARATION-RSK-13.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '12 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-14', 'CAPA_CREATED', 'CAPA_CREATED log for EOSB-CHK-14', 
      'System audit trail registered event CAPA_CREATED for code EOSB-CHK-14.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '13 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-015', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-015', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-015.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '14 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-01', 'APPROVED', 'APPROVED log for ER-RSK-01', 
      'System audit trail registered event APPROVED for code ER-RSK-01.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '15 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-017', 'CREATED', 'CREATED log for CAPA-20260708-017', 
      'System audit trail registered event CREATED for code CAPA-20260708-017.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '16 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-18', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for SEPARATION-CHK-18', 
      'System audit trail registered event EVIDENCE_UPLOADED for code SEPARATION-CHK-18.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '17 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-04', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for EOSB-RSK-04', 
      'System audit trail registered event CONTROL_REVIEWED for code EOSB-RSK-04.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '18 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-20', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for VISA_EXIT-CHK-20', 
      'System audit trail registered event RISK_ACCEPTED for code VISA_EXIT-CHK-20.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '19 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-021', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-021', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-021.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '20 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-07', 'CAPA_CREATED', 'CAPA_CREATED log for DISCIPLINARY-RSK-07', 
      'System audit trail registered event CAPA_CREATED for code DISCIPLINARY-RSK-07.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '21 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-023', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-023', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-023.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '22 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-24', 'APPROVED', 'APPROVED log for EOSB-CHK-24', 
      'System audit trail registered event APPROVED for code EOSB-CHK-24.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '23 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-10', 'CREATED', 'CREATED log for VISA_EXIT-RSK-10', 
      'System audit trail registered event CREATED for code VISA_EXIT-RSK-10.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '24 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-26', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for ER-CHK-26', 
      'System audit trail registered event EVIDENCE_UPLOADED for code ER-CHK-26.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '25 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-027', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-027', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-027.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '26 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-13', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for SEPARATION-RSK-13', 
      'System audit trail registered event RISK_ACCEPTED for code SEPARATION-RSK-13.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '27 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-029', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-029', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-029.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '28 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-30', 'CAPA_CREATED', 'CAPA_CREATED log for VISA_EXIT-CHK-30', 
      'System audit trail registered event CAPA_CREATED for code VISA_EXIT-CHK-30.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '29 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-01', 'CAPA_CLOSED', 'CAPA_CLOSED log for ER-RSK-01', 
      'System audit trail registered event CAPA_CLOSED for code ER-RSK-01.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '30 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-02', 'APPROVED', 'APPROVED log for DISCIPLINARY-CHK-02', 
      'System audit trail registered event APPROVED for code DISCIPLINARY-CHK-02.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '31 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-033', 'CREATED', 'CREATED log for CAPA-20260708-033', 
      'System audit trail registered event CREATED for code CAPA-20260708-033.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '32 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-04', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for EOSB-RSK-04', 
      'System audit trail registered event EVIDENCE_UPLOADED for code EOSB-RSK-04.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '33 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-035', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-035', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-035.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '34 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-06', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for ER-CHK-06', 
      'System audit trail registered event RISK_ACCEPTED for code ER-CHK-06.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '35 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-07', 'RISK_MITIGATED', 'RISK_MITIGATED log for DISCIPLINARY-RSK-07', 
      'System audit trail registered event RISK_MITIGATED for code DISCIPLINARY-RSK-07.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '36 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-08', 'CAPA_CREATED', 'CAPA_CREATED log for SEPARATION-CHK-08', 
      'System audit trail registered event CAPA_CREATED for code SEPARATION-CHK-08.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '37 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-039', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-039', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-039.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '38 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-10', 'APPROVED', 'APPROVED log for VISA_EXIT-RSK-10', 
      'System audit trail registered event APPROVED for code VISA_EXIT-RSK-10.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '39 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-041', 'CREATED', 'CREATED log for CAPA-20260708-041', 
      'System audit trail registered event CREATED for code CAPA-20260708-041.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '40 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-12', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for DISCIPLINARY-CHK-12', 
      'System audit trail registered event EVIDENCE_UPLOADED for code DISCIPLINARY-CHK-12.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '41 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-13', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for SEPARATION-RSK-13', 
      'System audit trail registered event CONTROL_REVIEWED for code SEPARATION-RSK-13.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '42 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-14', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for EOSB-CHK-14', 
      'System audit trail registered event RISK_ACCEPTED for code EOSB-CHK-14.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '43 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-045', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-045', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-045.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '44 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-01', 'CAPA_CREATED', 'CAPA_CREATED log for ER-RSK-01', 
      'System audit trail registered event CAPA_CREATED for code ER-RSK-01.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '45 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-047', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-047', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-047.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '46 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-18', 'APPROVED', 'APPROVED log for SEPARATION-CHK-18', 
      'System audit trail registered event APPROVED for code SEPARATION-CHK-18.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '47 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-04', 'CREATED', 'CREATED log for EOSB-RSK-04', 
      'System audit trail registered event CREATED for code EOSB-RSK-04.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '48 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-20', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for VISA_EXIT-CHK-20', 
      'System audit trail registered event EVIDENCE_UPLOADED for code VISA_EXIT-CHK-20.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '49 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-051', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-051', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-051.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '50 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-07', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for DISCIPLINARY-RSK-07', 
      'System audit trail registered event RISK_ACCEPTED for code DISCIPLINARY-RSK-07.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '51 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-053', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-053', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-053.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '52 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-24', 'CAPA_CREATED', 'CAPA_CREATED log for EOSB-CHK-24', 
      'System audit trail registered event CAPA_CREATED for code EOSB-CHK-24.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '53 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-10', 'CAPA_CLOSED', 'CAPA_CLOSED log for VISA_EXIT-RSK-10', 
      'System audit trail registered event CAPA_CLOSED for code VISA_EXIT-RSK-10.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '54 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-26', 'APPROVED', 'APPROVED log for ER-CHK-26', 
      'System audit trail registered event APPROVED for code ER-CHK-26.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '55 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-057', 'CREATED', 'CREATED log for CAPA-20260708-057', 
      'System audit trail registered event CREATED for code CAPA-20260708-057.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '56 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-13', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for SEPARATION-RSK-13', 
      'System audit trail registered event EVIDENCE_UPLOADED for code SEPARATION-RSK-13.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '57 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-059', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-059', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-059.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '58 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-30', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for VISA_EXIT-CHK-30', 
      'System audit trail registered event RISK_ACCEPTED for code VISA_EXIT-CHK-30.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '59 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-01', 'RISK_MITIGATED', 'RISK_MITIGATED log for ER-RSK-01', 
      'System audit trail registered event RISK_MITIGATED for code ER-RSK-01.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '60 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-02', 'CAPA_CREATED', 'CAPA_CREATED log for DISCIPLINARY-CHK-02', 
      'System audit trail registered event CAPA_CREATED for code DISCIPLINARY-CHK-02.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '61 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-063', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-063', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-063.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '62 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-04', 'APPROVED', 'APPROVED log for EOSB-RSK-04', 
      'System audit trail registered event APPROVED for code EOSB-RSK-04.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '63 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-065', 'CREATED', 'CREATED log for CAPA-20260708-065', 
      'System audit trail registered event CREATED for code CAPA-20260708-065.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '64 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-06', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for ER-CHK-06', 
      'System audit trail registered event EVIDENCE_UPLOADED for code ER-CHK-06.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '65 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-07', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for DISCIPLINARY-RSK-07', 
      'System audit trail registered event CONTROL_REVIEWED for code DISCIPLINARY-RSK-07.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '66 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-08', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for SEPARATION-CHK-08', 
      'System audit trail registered event RISK_ACCEPTED for code SEPARATION-CHK-08.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '67 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-069', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-069', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-069.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '68 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-10', 'CAPA_CREATED', 'CAPA_CREATED log for VISA_EXIT-RSK-10', 
      'System audit trail registered event CAPA_CREATED for code VISA_EXIT-RSK-10.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '69 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-001', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-001', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-001.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '70 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-12', 'APPROVED', 'APPROVED log for DISCIPLINARY-CHK-12', 
      'System audit trail registered event APPROVED for code DISCIPLINARY-CHK-12.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '71 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-13', 'CREATED', 'CREATED log for SEPARATION-RSK-13', 
      'System audit trail registered event CREATED for code SEPARATION-RSK-13.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '72 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-14', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for EOSB-CHK-14', 
      'System audit trail registered event EVIDENCE_UPLOADED for code EOSB-CHK-14.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '73 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-005', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-005', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-005.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '74 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-01', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for ER-RSK-01', 
      'System audit trail registered event RISK_ACCEPTED for code ER-RSK-01.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '75 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-007', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-007', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-007.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '76 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-18', 'CAPA_CREATED', 'CAPA_CREATED log for SEPARATION-CHK-18', 
      'System audit trail registered event CAPA_CREATED for code SEPARATION-CHK-18.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '77 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-04', 'CAPA_CLOSED', 'CAPA_CLOSED log for EOSB-RSK-04', 
      'System audit trail registered event CAPA_CLOSED for code EOSB-RSK-04.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '78 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-20', 'APPROVED', 'APPROVED log for VISA_EXIT-CHK-20', 
      'System audit trail registered event APPROVED for code VISA_EXIT-CHK-20.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '79 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-011', 'CREATED', 'CREATED log for CAPA-20260708-011', 
      'System audit trail registered event CREATED for code CAPA-20260708-011.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '80 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-07', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for DISCIPLINARY-RSK-07', 
      'System audit trail registered event EVIDENCE_UPLOADED for code DISCIPLINARY-RSK-07.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '81 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-013', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-013', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-013.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '82 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-24', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for EOSB-CHK-24', 
      'System audit trail registered event RISK_ACCEPTED for code EOSB-CHK-24.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '83 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-10', 'RISK_MITIGATED', 'RISK_MITIGATED log for VISA_EXIT-RSK-10', 
      'System audit trail registered event RISK_MITIGATED for code VISA_EXIT-RSK-10.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '84 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-26', 'CAPA_CREATED', 'CAPA_CREATED log for ER-CHK-26', 
      'System audit trail registered event CAPA_CREATED for code ER-CHK-26.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '85 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-017', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-017', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-017.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '86 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-13', 'APPROVED', 'APPROVED log for SEPARATION-RSK-13', 
      'System audit trail registered event APPROVED for code SEPARATION-RSK-13.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '87 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-019', 'CREATED', 'CREATED log for CAPA-20260708-019', 
      'System audit trail registered event CREATED for code CAPA-20260708-019.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '88 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-30', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for VISA_EXIT-CHK-30', 
      'System audit trail registered event EVIDENCE_UPLOADED for code VISA_EXIT-CHK-30.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '89 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-01', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for ER-RSK-01', 
      'System audit trail registered event CONTROL_REVIEWED for code ER-RSK-01.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '90 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-02', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for DISCIPLINARY-CHK-02', 
      'System audit trail registered event RISK_ACCEPTED for code DISCIPLINARY-CHK-02.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '91 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-023', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-023', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-023.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '92 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-04', 'CAPA_CREATED', 'CAPA_CREATED log for EOSB-RSK-04', 
      'System audit trail registered event CAPA_CREATED for code EOSB-RSK-04.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '93 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-025', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-025', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-025.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '94 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-06', 'APPROVED', 'APPROVED log for ER-CHK-06', 
      'System audit trail registered event APPROVED for code ER-CHK-06.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '95 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-07', 'CREATED', 'CREATED log for DISCIPLINARY-RSK-07', 
      'System audit trail registered event CREATED for code DISCIPLINARY-RSK-07.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '96 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-08', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for SEPARATION-CHK-08', 
      'System audit trail registered event EVIDENCE_UPLOADED for code SEPARATION-CHK-08.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '97 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-029', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-029', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-029.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '98 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-10', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for VISA_EXIT-RSK-10', 
      'System audit trail registered event RISK_ACCEPTED for code VISA_EXIT-RSK-10.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '99 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-031', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-031', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-031.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '100 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-12', 'CAPA_CREATED', 'CAPA_CREATED log for DISCIPLINARY-CHK-12', 
      'System audit trail registered event CAPA_CREATED for code DISCIPLINARY-CHK-12.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '101 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-13', 'CAPA_CLOSED', 'CAPA_CLOSED log for SEPARATION-RSK-13', 
      'System audit trail registered event CAPA_CLOSED for code SEPARATION-RSK-13.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '102 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-14', 'APPROVED', 'APPROVED log for EOSB-CHK-14', 
      'System audit trail registered event APPROVED for code EOSB-CHK-14.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '103 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-035', 'CREATED', 'CREATED log for CAPA-20260708-035', 
      'System audit trail registered event CREATED for code CAPA-20260708-035.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '104 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-01', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for ER-RSK-01', 
      'System audit trail registered event EVIDENCE_UPLOADED for code ER-RSK-01.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '105 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-037', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-037', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-037.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '106 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-18', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for SEPARATION-CHK-18', 
      'System audit trail registered event RISK_ACCEPTED for code SEPARATION-CHK-18.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '107 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-04', 'RISK_MITIGATED', 'RISK_MITIGATED log for EOSB-RSK-04', 
      'System audit trail registered event RISK_MITIGATED for code EOSB-RSK-04.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '108 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-20', 'CAPA_CREATED', 'CAPA_CREATED log for VISA_EXIT-CHK-20', 
      'System audit trail registered event CAPA_CREATED for code VISA_EXIT-CHK-20.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '109 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-041', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-041', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-041.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '110 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-07', 'APPROVED', 'APPROVED log for DISCIPLINARY-RSK-07', 
      'System audit trail registered event APPROVED for code DISCIPLINARY-RSK-07.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '111 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-043', 'CREATED', 'CREATED log for CAPA-20260708-043', 
      'System audit trail registered event CREATED for code CAPA-20260708-043.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '112 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-24', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for EOSB-CHK-24', 
      'System audit trail registered event EVIDENCE_UPLOADED for code EOSB-CHK-24.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '113 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-10', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for VISA_EXIT-RSK-10', 
      'System audit trail registered event CONTROL_REVIEWED for code VISA_EXIT-RSK-10.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '114 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-26', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for ER-CHK-26', 
      'System audit trail registered event RISK_ACCEPTED for code ER-CHK-26.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '115 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-047', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-047', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-047.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '116 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-13', 'CAPA_CREATED', 'CAPA_CREATED log for SEPARATION-RSK-13', 
      'System audit trail registered event CAPA_CREATED for code SEPARATION-RSK-13.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '117 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-049', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-049', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-049.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '118 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-30', 'APPROVED', 'APPROVED log for VISA_EXIT-CHK-30', 
      'System audit trail registered event APPROVED for code VISA_EXIT-CHK-30.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '119 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-01', 'CREATED', 'CREATED log for ER-RSK-01', 
      'System audit trail registered event CREATED for code ER-RSK-01.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '120 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-02', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for DISCIPLINARY-CHK-02', 
      'System audit trail registered event EVIDENCE_UPLOADED for code DISCIPLINARY-CHK-02.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '121 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-053', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-053', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-053.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '122 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-04', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for EOSB-RSK-04', 
      'System audit trail registered event RISK_ACCEPTED for code EOSB-RSK-04.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '123 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-055', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-055', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-055.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '124 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-06', 'CAPA_CREATED', 'CAPA_CREATED log for ER-CHK-06', 
      'System audit trail registered event CAPA_CREATED for code ER-CHK-06.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '125 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-07', 'CAPA_CLOSED', 'CAPA_CLOSED log for DISCIPLINARY-RSK-07', 
      'System audit trail registered event CAPA_CLOSED for code DISCIPLINARY-RSK-07.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '126 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-08', 'APPROVED', 'APPROVED log for SEPARATION-CHK-08', 
      'System audit trail registered event APPROVED for code SEPARATION-CHK-08.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '127 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-059', 'CREATED', 'CREATED log for CAPA-20260708-059', 
      'System audit trail registered event CREATED for code CAPA-20260708-059.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '128 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-10', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for VISA_EXIT-RSK-10', 
      'System audit trail registered event EVIDENCE_UPLOADED for code VISA_EXIT-RSK-10.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '129 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-061', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-061', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-061.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '130 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-12', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for DISCIPLINARY-CHK-12', 
      'System audit trail registered event RISK_ACCEPTED for code DISCIPLINARY-CHK-12.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '131 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-13', 'RISK_MITIGATED', 'RISK_MITIGATED log for SEPARATION-RSK-13', 
      'System audit trail registered event RISK_MITIGATED for code SEPARATION-RSK-13.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '132 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-14', 'CAPA_CREATED', 'CAPA_CREATED log for EOSB-CHK-14', 
      'System audit trail registered event CAPA_CREATED for code EOSB-CHK-14.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '133 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-065', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-065', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-065.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '134 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-01', 'APPROVED', 'APPROVED log for ER-RSK-01', 
      'System audit trail registered event APPROVED for code ER-RSK-01.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '135 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-067', 'CREATED', 'CREATED log for CAPA-20260708-067', 
      'System audit trail registered event CREATED for code CAPA-20260708-067.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '136 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-18', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for SEPARATION-CHK-18', 
      'System audit trail registered event EVIDENCE_UPLOADED for code SEPARATION-CHK-18.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '137 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-04', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for EOSB-RSK-04', 
      'System audit trail registered event CONTROL_REVIEWED for code EOSB-RSK-04.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '138 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-20', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for VISA_EXIT-CHK-20', 
      'System audit trail registered event RISK_ACCEPTED for code VISA_EXIT-CHK-20.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '139 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-001', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-001', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-001.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '140 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-07', 'CAPA_CREATED', 'CAPA_CREATED log for DISCIPLINARY-RSK-07', 
      'System audit trail registered event CAPA_CREATED for code DISCIPLINARY-RSK-07.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '141 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-003', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-003', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-003.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '142 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-24', 'APPROVED', 'APPROVED log for EOSB-CHK-24', 
      'System audit trail registered event APPROVED for code EOSB-CHK-24.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '143 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-10', 'CREATED', 'CREATED log for VISA_EXIT-RSK-10', 
      'System audit trail registered event CREATED for code VISA_EXIT-RSK-10.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '144 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-26', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for ER-CHK-26', 
      'System audit trail registered event EVIDENCE_UPLOADED for code ER-CHK-26.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '145 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-007', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-007', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-007.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '146 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-13', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for SEPARATION-RSK-13', 
      'System audit trail registered event RISK_ACCEPTED for code SEPARATION-RSK-13.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '147 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-009', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-009', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-009.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '148 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-30', 'CAPA_CREATED', 'CAPA_CREATED log for VISA_EXIT-CHK-30', 
      'System audit trail registered event CAPA_CREATED for code VISA_EXIT-CHK-30.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '149 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-01', 'CAPA_CLOSED', 'CAPA_CLOSED log for ER-RSK-01', 
      'System audit trail registered event CAPA_CLOSED for code ER-RSK-01.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '150 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-02', 'APPROVED', 'APPROVED log for DISCIPLINARY-CHK-02', 
      'System audit trail registered event APPROVED for code DISCIPLINARY-CHK-02.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '151 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-013', 'CREATED', 'CREATED log for CAPA-20260708-013', 
      'System audit trail registered event CREATED for code CAPA-20260708-013.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '152 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-04', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for EOSB-RSK-04', 
      'System audit trail registered event EVIDENCE_UPLOADED for code EOSB-RSK-04.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '153 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-015', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-015', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-015.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '154 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-06', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for ER-CHK-06', 
      'System audit trail registered event RISK_ACCEPTED for code ER-CHK-06.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '155 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-07', 'RISK_MITIGATED', 'RISK_MITIGATED log for DISCIPLINARY-RSK-07', 
      'System audit trail registered event RISK_MITIGATED for code DISCIPLINARY-RSK-07.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '156 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-08', 'CAPA_CREATED', 'CAPA_CREATED log for SEPARATION-CHK-08', 
      'System audit trail registered event CAPA_CREATED for code SEPARATION-CHK-08.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '157 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-019', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-019', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-019.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '158 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-10', 'APPROVED', 'APPROVED log for VISA_EXIT-RSK-10', 
      'System audit trail registered event APPROVED for code VISA_EXIT-RSK-10.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '159 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-021', 'CREATED', 'CREATED log for CAPA-20260708-021', 
      'System audit trail registered event CREATED for code CAPA-20260708-021.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '160 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-12', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for DISCIPLINARY-CHK-12', 
      'System audit trail registered event EVIDENCE_UPLOADED for code DISCIPLINARY-CHK-12.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '161 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-13', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for SEPARATION-RSK-13', 
      'System audit trail registered event CONTROL_REVIEWED for code SEPARATION-RSK-13.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '162 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-14', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for EOSB-CHK-14', 
      'System audit trail registered event RISK_ACCEPTED for code EOSB-CHK-14.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '163 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-025', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-025', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-025.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '164 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-01', 'CAPA_CREATED', 'CAPA_CREATED log for ER-RSK-01', 
      'System audit trail registered event CAPA_CREATED for code ER-RSK-01.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '165 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-027', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-027', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-027.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '166 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-18', 'APPROVED', 'APPROVED log for SEPARATION-CHK-18', 
      'System audit trail registered event APPROVED for code SEPARATION-CHK-18.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '167 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-04', 'CREATED', 'CREATED log for EOSB-RSK-04', 
      'System audit trail registered event CREATED for code EOSB-RSK-04.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '168 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-20', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for VISA_EXIT-CHK-20', 
      'System audit trail registered event EVIDENCE_UPLOADED for code VISA_EXIT-CHK-20.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '169 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-031', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-031', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-031.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '170 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-07', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for DISCIPLINARY-RSK-07', 
      'System audit trail registered event RISK_ACCEPTED for code DISCIPLINARY-RSK-07.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '171 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-033', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-033', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-033.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '172 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-24', 'CAPA_CREATED', 'CAPA_CREATED log for EOSB-CHK-24', 
      'System audit trail registered event CAPA_CREATED for code EOSB-CHK-24.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '173 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-10', 'CAPA_CLOSED', 'CAPA_CLOSED log for VISA_EXIT-RSK-10', 
      'System audit trail registered event CAPA_CLOSED for code VISA_EXIT-RSK-10.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '174 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-26', 'APPROVED', 'APPROVED log for ER-CHK-26', 
      'System audit trail registered event APPROVED for code ER-CHK-26.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '175 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-037', 'CREATED', 'CREATED log for CAPA-20260708-037', 
      'System audit trail registered event CREATED for code CAPA-20260708-037.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '176 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-13', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for SEPARATION-RSK-13', 
      'System audit trail registered event EVIDENCE_UPLOADED for code SEPARATION-RSK-13.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '177 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-039', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-039', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-039.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '178 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-30', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for VISA_EXIT-CHK-30', 
      'System audit trail registered event RISK_ACCEPTED for code VISA_EXIT-CHK-30.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '179 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-01', 'RISK_MITIGATED', 'RISK_MITIGATED log for ER-RSK-01', 
      'System audit trail registered event RISK_MITIGATED for code ER-RSK-01.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '180 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-02', 'CAPA_CREATED', 'CAPA_CREATED log for DISCIPLINARY-CHK-02', 
      'System audit trail registered event CAPA_CREATED for code DISCIPLINARY-CHK-02.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '181 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-043', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-043', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-043.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '182 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-04', 'APPROVED', 'APPROVED log for EOSB-RSK-04', 
      'System audit trail registered event APPROVED for code EOSB-RSK-04.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '183 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-045', 'CREATED', 'CREATED log for CAPA-20260708-045', 
      'System audit trail registered event CREATED for code CAPA-20260708-045.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '184 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-06', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for ER-CHK-06', 
      'System audit trail registered event EVIDENCE_UPLOADED for code ER-CHK-06.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '185 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-07', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for DISCIPLINARY-RSK-07', 
      'System audit trail registered event CONTROL_REVIEWED for code DISCIPLINARY-RSK-07.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '186 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-08', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for SEPARATION-CHK-08', 
      'System audit trail registered event RISK_ACCEPTED for code SEPARATION-CHK-08.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '187 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-049', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-049', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-049.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '188 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-10', 'CAPA_CREATED', 'CAPA_CREATED log for VISA_EXIT-RSK-10', 
      'System audit trail registered event CAPA_CREATED for code VISA_EXIT-RSK-10.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '189 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-051', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-051', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-051.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '190 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-12', 'APPROVED', 'APPROVED log for DISCIPLINARY-CHK-12', 
      'System audit trail registered event APPROVED for code DISCIPLINARY-CHK-12.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '191 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-13', 'CREATED', 'CREATED log for SEPARATION-RSK-13', 
      'System audit trail registered event CREATED for code SEPARATION-RSK-13.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '192 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-14', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for EOSB-CHK-14', 
      'System audit trail registered event EVIDENCE_UPLOADED for code EOSB-CHK-14.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '193 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-055', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-055', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-055.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '194 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-01', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for ER-RSK-01', 
      'System audit trail registered event RISK_ACCEPTED for code ER-RSK-01.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '195 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-057', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-057', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-057.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '196 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-18', 'CAPA_CREATED', 'CAPA_CREATED log for SEPARATION-CHK-18', 
      'System audit trail registered event CAPA_CREATED for code SEPARATION-CHK-18.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '197 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-04', 'CAPA_CLOSED', 'CAPA_CLOSED log for EOSB-RSK-04', 
      'System audit trail registered event CAPA_CLOSED for code EOSB-RSK-04.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '198 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-20', 'APPROVED', 'APPROVED log for VISA_EXIT-CHK-20', 
      'System audit trail registered event APPROVED for code VISA_EXIT-CHK-20.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '199 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-061', 'CREATED', 'CREATED log for CAPA-20260708-061', 
      'System audit trail registered event CREATED for code CAPA-20260708-061.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '200 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-07', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for DISCIPLINARY-RSK-07', 
      'System audit trail registered event EVIDENCE_UPLOADED for code DISCIPLINARY-RSK-07.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '201 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-063', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-063', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-063.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '202 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-24', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for EOSB-CHK-24', 
      'System audit trail registered event RISK_ACCEPTED for code EOSB-CHK-24.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '203 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-10', 'RISK_MITIGATED', 'RISK_MITIGATED log for VISA_EXIT-RSK-10', 
      'System audit trail registered event RISK_MITIGATED for code VISA_EXIT-RSK-10.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '204 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-26', 'CAPA_CREATED', 'CAPA_CREATED log for ER-CHK-26', 
      'System audit trail registered event CAPA_CREATED for code ER-CHK-26.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '205 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-067', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-067', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-067.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '206 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-13', 'APPROVED', 'APPROVED log for SEPARATION-RSK-13', 
      'System audit trail registered event APPROVED for code SEPARATION-RSK-13.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '207 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-069', 'CREATED', 'CREATED log for CAPA-20260708-069', 
      'System audit trail registered event CREATED for code CAPA-20260708-069.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '208 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-30', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for VISA_EXIT-CHK-30', 
      'System audit trail registered event EVIDENCE_UPLOADED for code VISA_EXIT-CHK-30.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '209 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-01', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for ER-RSK-01', 
      'System audit trail registered event CONTROL_REVIEWED for code ER-RSK-01.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '210 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-02', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for DISCIPLINARY-CHK-02', 
      'System audit trail registered event RISK_ACCEPTED for code DISCIPLINARY-CHK-02.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '211 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-003', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-003', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-003.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '212 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-04', 'CAPA_CREATED', 'CAPA_CREATED log for EOSB-RSK-04', 
      'System audit trail registered event CAPA_CREATED for code EOSB-RSK-04.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '213 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-005', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-005', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-005.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '214 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-06', 'APPROVED', 'APPROVED log for ER-CHK-06', 
      'System audit trail registered event APPROVED for code ER-CHK-06.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '215 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-07', 'CREATED', 'CREATED log for DISCIPLINARY-RSK-07', 
      'System audit trail registered event CREATED for code DISCIPLINARY-RSK-07.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '216 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-08', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for SEPARATION-CHK-08', 
      'System audit trail registered event EVIDENCE_UPLOADED for code SEPARATION-CHK-08.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '217 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-009', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-009', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-009.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '218 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-10', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for VISA_EXIT-RSK-10', 
      'System audit trail registered event RISK_ACCEPTED for code VISA_EXIT-RSK-10.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '219 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-011', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-011', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-011.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '220 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-12', 'CAPA_CREATED', 'CAPA_CREATED log for DISCIPLINARY-CHK-12', 
      'System audit trail registered event CAPA_CREATED for code DISCIPLINARY-CHK-12.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '221 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-13', 'CAPA_CLOSED', 'CAPA_CLOSED log for SEPARATION-RSK-13', 
      'System audit trail registered event CAPA_CLOSED for code SEPARATION-RSK-13.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '222 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-14', 'APPROVED', 'APPROVED log for EOSB-CHK-14', 
      'System audit trail registered event APPROVED for code EOSB-CHK-14.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '223 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-015', 'CREATED', 'CREATED log for CAPA-20260708-015', 
      'System audit trail registered event CREATED for code CAPA-20260708-015.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '224 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-01', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for ER-RSK-01', 
      'System audit trail registered event EVIDENCE_UPLOADED for code ER-RSK-01.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '225 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-017', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-017', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-017.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '226 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-18', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for SEPARATION-CHK-18', 
      'System audit trail registered event RISK_ACCEPTED for code SEPARATION-CHK-18.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '227 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-04', 'RISK_MITIGATED', 'RISK_MITIGATED log for EOSB-RSK-04', 
      'System audit trail registered event RISK_MITIGATED for code EOSB-RSK-04.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '228 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-20', 'CAPA_CREATED', 'CAPA_CREATED log for VISA_EXIT-CHK-20', 
      'System audit trail registered event CAPA_CREATED for code VISA_EXIT-CHK-20.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '229 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-021', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-021', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-021.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '230 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-07', 'APPROVED', 'APPROVED log for DISCIPLINARY-RSK-07', 
      'System audit trail registered event APPROVED for code DISCIPLINARY-RSK-07.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '231 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-023', 'CREATED', 'CREATED log for CAPA-20260708-023', 
      'System audit trail registered event CREATED for code CAPA-20260708-023.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '232 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-24', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for EOSB-CHK-24', 
      'System audit trail registered event EVIDENCE_UPLOADED for code EOSB-CHK-24.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '233 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-10', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for VISA_EXIT-RSK-10', 
      'System audit trail registered event CONTROL_REVIEWED for code VISA_EXIT-RSK-10.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '234 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-26', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for ER-CHK-26', 
      'System audit trail registered event RISK_ACCEPTED for code ER-CHK-26.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '235 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-027', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-027', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-027.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '236 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-13', 'CAPA_CREATED', 'CAPA_CREATED log for SEPARATION-RSK-13', 
      'System audit trail registered event CAPA_CREATED for code SEPARATION-RSK-13.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '237 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-029', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-029', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-029.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '238 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-30', 'APPROVED', 'APPROVED log for VISA_EXIT-CHK-30', 
      'System audit trail registered event APPROVED for code VISA_EXIT-CHK-30.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '239 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-01', 'CREATED', 'CREATED log for ER-RSK-01', 
      'System audit trail registered event CREATED for code ER-RSK-01.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '240 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-02', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for DISCIPLINARY-CHK-02', 
      'System audit trail registered event EVIDENCE_UPLOADED for code DISCIPLINARY-CHK-02.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '241 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-033', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-033', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-033.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '242 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-04', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for EOSB-RSK-04', 
      'System audit trail registered event RISK_ACCEPTED for code EOSB-RSK-04.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '243 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-035', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-035', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-035.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '244 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-06', 'CAPA_CREATED', 'CAPA_CREATED log for ER-CHK-06', 
      'System audit trail registered event CAPA_CREATED for code ER-CHK-06.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '245 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-07', 'CAPA_CLOSED', 'CAPA_CLOSED log for DISCIPLINARY-RSK-07', 
      'System audit trail registered event CAPA_CLOSED for code DISCIPLINARY-RSK-07.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '246 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-08', 'APPROVED', 'APPROVED log for SEPARATION-CHK-08', 
      'System audit trail registered event APPROVED for code SEPARATION-CHK-08.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '247 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-039', 'CREATED', 'CREATED log for CAPA-20260708-039', 
      'System audit trail registered event CREATED for code CAPA-20260708-039.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '248 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-10', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for VISA_EXIT-RSK-10', 
      'System audit trail registered event EVIDENCE_UPLOADED for code VISA_EXIT-RSK-10.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '249 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-041', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-041', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-041.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '250 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-12', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for DISCIPLINARY-CHK-12', 
      'System audit trail registered event RISK_ACCEPTED for code DISCIPLINARY-CHK-12.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '251 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-13', 'RISK_MITIGATED', 'RISK_MITIGATED log for SEPARATION-RSK-13', 
      'System audit trail registered event RISK_MITIGATED for code SEPARATION-RSK-13.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '252 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-14', 'CAPA_CREATED', 'CAPA_CREATED log for EOSB-CHK-14', 
      'System audit trail registered event CAPA_CREATED for code EOSB-CHK-14.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '253 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-045', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-045', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-045.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '254 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-01', 'APPROVED', 'APPROVED log for ER-RSK-01', 
      'System audit trail registered event APPROVED for code ER-RSK-01.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '255 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-047', 'CREATED', 'CREATED log for CAPA-20260708-047', 
      'System audit trail registered event CREATED for code CAPA-20260708-047.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '256 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-18', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for SEPARATION-CHK-18', 
      'System audit trail registered event EVIDENCE_UPLOADED for code SEPARATION-CHK-18.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '257 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-04', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for EOSB-RSK-04', 
      'System audit trail registered event CONTROL_REVIEWED for code EOSB-RSK-04.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '258 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-20', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for VISA_EXIT-CHK-20', 
      'System audit trail registered event RISK_ACCEPTED for code VISA_EXIT-CHK-20.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '259 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-051', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-051', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-051.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '260 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-07', 'CAPA_CREATED', 'CAPA_CREATED log for DISCIPLINARY-RSK-07', 
      'System audit trail registered event CAPA_CREATED for code DISCIPLINARY-RSK-07.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '261 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-053', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-053', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-053.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '262 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-24', 'APPROVED', 'APPROVED log for EOSB-CHK-24', 
      'System audit trail registered event APPROVED for code EOSB-CHK-24.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '263 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-10', 'CREATED', 'CREATED log for VISA_EXIT-RSK-10', 
      'System audit trail registered event CREATED for code VISA_EXIT-RSK-10.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '264 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-26', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for ER-CHK-26', 
      'System audit trail registered event EVIDENCE_UPLOADED for code ER-CHK-26.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '265 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-057', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-057', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-057.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '266 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-13', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for SEPARATION-RSK-13', 
      'System audit trail registered event RISK_ACCEPTED for code SEPARATION-RSK-13.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '267 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-059', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-059', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-059.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '268 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-30', 'CAPA_CREATED', 'CAPA_CREATED log for VISA_EXIT-CHK-30', 
      'System audit trail registered event CAPA_CREATED for code VISA_EXIT-CHK-30.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '269 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-01', 'CAPA_CLOSED', 'CAPA_CLOSED log for ER-RSK-01', 
      'System audit trail registered event CAPA_CLOSED for code ER-RSK-01.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '270 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-02', 'APPROVED', 'APPROVED log for DISCIPLINARY-CHK-02', 
      'System audit trail registered event APPROVED for code DISCIPLINARY-CHK-02.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '271 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-063', 'CREATED', 'CREATED log for CAPA-20260708-063', 
      'System audit trail registered event CREATED for code CAPA-20260708-063.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '272 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-04', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for EOSB-RSK-04', 
      'System audit trail registered event EVIDENCE_UPLOADED for code EOSB-RSK-04.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '273 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-065', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-065', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-065.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '274 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-06', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for ER-CHK-06', 
      'System audit trail registered event RISK_ACCEPTED for code ER-CHK-06.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '275 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-07', 'RISK_MITIGATED', 'RISK_MITIGATED log for DISCIPLINARY-RSK-07', 
      'System audit trail registered event RISK_MITIGATED for code DISCIPLINARY-RSK-07.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '276 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-08', 'CAPA_CREATED', 'CAPA_CREATED log for SEPARATION-CHK-08', 
      'System audit trail registered event CAPA_CREATED for code SEPARATION-CHK-08.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '277 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-069', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-069', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-069.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '278 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-10', 'APPROVED', 'APPROVED log for VISA_EXIT-RSK-10', 
      'System audit trail registered event APPROVED for code VISA_EXIT-RSK-10.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '279 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-001', 'CREATED', 'CREATED log for CAPA-20260708-001', 
      'System audit trail registered event CREATED for code CAPA-20260708-001.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '280 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-12', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for DISCIPLINARY-CHK-12', 
      'System audit trail registered event EVIDENCE_UPLOADED for code DISCIPLINARY-CHK-12.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '281 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-13', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for SEPARATION-RSK-13', 
      'System audit trail registered event CONTROL_REVIEWED for code SEPARATION-RSK-13.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '282 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-14', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for EOSB-CHK-14', 
      'System audit trail registered event RISK_ACCEPTED for code EOSB-CHK-14.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '283 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-005', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-005', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-005.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '284 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-01', 'CAPA_CREATED', 'CAPA_CREATED log for ER-RSK-01', 
      'System audit trail registered event CAPA_CREATED for code ER-RSK-01.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '285 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-007', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-007', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-007.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '286 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-18', 'APPROVED', 'APPROVED log for SEPARATION-CHK-18', 
      'System audit trail registered event APPROVED for code SEPARATION-CHK-18.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '287 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-04', 'CREATED', 'CREATED log for EOSB-RSK-04', 
      'System audit trail registered event CREATED for code EOSB-RSK-04.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '288 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-20', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for VISA_EXIT-CHK-20', 
      'System audit trail registered event EVIDENCE_UPLOADED for code VISA_EXIT-CHK-20.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '289 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-011', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-011', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-011.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '290 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-07', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for DISCIPLINARY-RSK-07', 
      'System audit trail registered event RISK_ACCEPTED for code DISCIPLINARY-RSK-07.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '291 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-013', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-013', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-013.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '292 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-24', 'CAPA_CREATED', 'CAPA_CREATED log for EOSB-CHK-24', 
      'System audit trail registered event CAPA_CREATED for code EOSB-CHK-24.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '293 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-10', 'CAPA_CLOSED', 'CAPA_CLOSED log for VISA_EXIT-RSK-10', 
      'System audit trail registered event CAPA_CLOSED for code VISA_EXIT-RSK-10.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '294 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-26', 'APPROVED', 'APPROVED log for ER-CHK-26', 
      'System audit trail registered event APPROVED for code ER-CHK-26.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '295 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-017', 'CREATED', 'CREATED log for CAPA-20260708-017', 
      'System audit trail registered event CREATED for code CAPA-20260708-017.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '296 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-13', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for SEPARATION-RSK-13', 
      'System audit trail registered event EVIDENCE_UPLOADED for code SEPARATION-RSK-13.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '297 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-019', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-019', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-019.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '298 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-30', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for VISA_EXIT-CHK-30', 
      'System audit trail registered event RISK_ACCEPTED for code VISA_EXIT-CHK-30.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '299 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-01', 'RISK_MITIGATED', 'RISK_MITIGATED log for ER-RSK-01', 
      'System audit trail registered event RISK_MITIGATED for code ER-RSK-01.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '300 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-02', 'CAPA_CREATED', 'CAPA_CREATED log for DISCIPLINARY-CHK-02', 
      'System audit trail registered event CAPA_CREATED for code DISCIPLINARY-CHK-02.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '301 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-023', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-023', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-023.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '302 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-04', 'APPROVED', 'APPROVED log for EOSB-RSK-04', 
      'System audit trail registered event APPROVED for code EOSB-RSK-04.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '303 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-025', 'CREATED', 'CREATED log for CAPA-20260708-025', 
      'System audit trail registered event CREATED for code CAPA-20260708-025.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '304 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-06', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for ER-CHK-06', 
      'System audit trail registered event EVIDENCE_UPLOADED for code ER-CHK-06.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '305 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-07', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for DISCIPLINARY-RSK-07', 
      'System audit trail registered event CONTROL_REVIEWED for code DISCIPLINARY-RSK-07.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '306 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-08', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for SEPARATION-CHK-08', 
      'System audit trail registered event RISK_ACCEPTED for code SEPARATION-CHK-08.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '307 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-029', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-029', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-029.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '308 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-10', 'CAPA_CREATED', 'CAPA_CREATED log for VISA_EXIT-RSK-10', 
      'System audit trail registered event CAPA_CREATED for code VISA_EXIT-RSK-10.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '309 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-031', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-031', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-031.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '310 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-12', 'APPROVED', 'APPROVED log for DISCIPLINARY-CHK-12', 
      'System audit trail registered event APPROVED for code DISCIPLINARY-CHK-12.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '311 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-13', 'CREATED', 'CREATED log for SEPARATION-RSK-13', 
      'System audit trail registered event CREATED for code SEPARATION-RSK-13.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '312 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-14', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for EOSB-CHK-14', 
      'System audit trail registered event EVIDENCE_UPLOADED for code EOSB-CHK-14.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '313 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-035', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-035', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-035.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '314 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-01', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for ER-RSK-01', 
      'System audit trail registered event RISK_ACCEPTED for code ER-RSK-01.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '315 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-037', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-037', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-037.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '316 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-18', 'CAPA_CREATED', 'CAPA_CREATED log for SEPARATION-CHK-18', 
      'System audit trail registered event CAPA_CREATED for code SEPARATION-CHK-18.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '317 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-04', 'CAPA_CLOSED', 'CAPA_CLOSED log for EOSB-RSK-04', 
      'System audit trail registered event CAPA_CLOSED for code EOSB-RSK-04.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '318 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-20', 'APPROVED', 'APPROVED log for VISA_EXIT-CHK-20', 
      'System audit trail registered event APPROVED for code VISA_EXIT-CHK-20.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '319 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-041', 'CREATED', 'CREATED log for CAPA-20260708-041', 
      'System audit trail registered event CREATED for code CAPA-20260708-041.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '320 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-07', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for DISCIPLINARY-RSK-07', 
      'System audit trail registered event EVIDENCE_UPLOADED for code DISCIPLINARY-RSK-07.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '321 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-043', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-043', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-043.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '322 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-24', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for EOSB-CHK-24', 
      'System audit trail registered event RISK_ACCEPTED for code EOSB-CHK-24.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '323 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-10', 'RISK_MITIGATED', 'RISK_MITIGATED log for VISA_EXIT-RSK-10', 
      'System audit trail registered event RISK_MITIGATED for code VISA_EXIT-RSK-10.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '324 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-26', 'CAPA_CREATED', 'CAPA_CREATED log for ER-CHK-26', 
      'System audit trail registered event CAPA_CREATED for code ER-CHK-26.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '325 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-047', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-047', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-047.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '326 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-13', 'APPROVED', 'APPROVED log for SEPARATION-RSK-13', 
      'System audit trail registered event APPROVED for code SEPARATION-RSK-13.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '327 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-049', 'CREATED', 'CREATED log for CAPA-20260708-049', 
      'System audit trail registered event CREATED for code CAPA-20260708-049.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '328 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-30', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for VISA_EXIT-CHK-30', 
      'System audit trail registered event EVIDENCE_UPLOADED for code VISA_EXIT-CHK-30.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '329 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-01', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for ER-RSK-01', 
      'System audit trail registered event CONTROL_REVIEWED for code ER-RSK-01.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '330 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-02', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for DISCIPLINARY-CHK-02', 
      'System audit trail registered event RISK_ACCEPTED for code DISCIPLINARY-CHK-02.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '331 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-053', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-053', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-053.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '332 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-04', 'CAPA_CREATED', 'CAPA_CREATED log for EOSB-RSK-04', 
      'System audit trail registered event CAPA_CREATED for code EOSB-RSK-04.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '333 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-055', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-055', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-055.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '334 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-06', 'APPROVED', 'APPROVED log for ER-CHK-06', 
      'System audit trail registered event APPROVED for code ER-CHK-06.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '335 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-07', 'CREATED', 'CREATED log for DISCIPLINARY-RSK-07', 
      'System audit trail registered event CREATED for code DISCIPLINARY-RSK-07.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '336 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-08', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for SEPARATION-CHK-08', 
      'System audit trail registered event EVIDENCE_UPLOADED for code SEPARATION-CHK-08.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '337 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-059', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-059', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-059.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '338 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-10', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for VISA_EXIT-RSK-10', 
      'System audit trail registered event RISK_ACCEPTED for code VISA_EXIT-RSK-10.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '339 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-061', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-061', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-061.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '340 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-12', 'CAPA_CREATED', 'CAPA_CREATED log for DISCIPLINARY-CHK-12', 
      'System audit trail registered event CAPA_CREATED for code DISCIPLINARY-CHK-12.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '341 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-13', 'CAPA_CLOSED', 'CAPA_CLOSED log for SEPARATION-RSK-13', 
      'System audit trail registered event CAPA_CLOSED for code SEPARATION-RSK-13.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '342 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-14', 'APPROVED', 'APPROVED log for EOSB-CHK-14', 
      'System audit trail registered event APPROVED for code EOSB-CHK-14.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '343 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-065', 'CREATED', 'CREATED log for CAPA-20260708-065', 
      'System audit trail registered event CREATED for code CAPA-20260708-065.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '344 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-01', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for ER-RSK-01', 
      'System audit trail registered event EVIDENCE_UPLOADED for code ER-RSK-01.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '345 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-067', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-067', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-067.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '346 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-18', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for SEPARATION-CHK-18', 
      'System audit trail registered event RISK_ACCEPTED for code SEPARATION-CHK-18.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '347 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-04', 'RISK_MITIGATED', 'RISK_MITIGATED log for EOSB-RSK-04', 
      'System audit trail registered event RISK_MITIGATED for code EOSB-RSK-04.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '348 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-20', 'CAPA_CREATED', 'CAPA_CREATED log for VISA_EXIT-CHK-20', 
      'System audit trail registered event CAPA_CREATED for code VISA_EXIT-CHK-20.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '349 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-001', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-001', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-001.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '350 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-07', 'APPROVED', 'APPROVED log for DISCIPLINARY-RSK-07', 
      'System audit trail registered event APPROVED for code DISCIPLINARY-RSK-07.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '351 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-003', 'CREATED', 'CREATED log for CAPA-20260708-003', 
      'System audit trail registered event CREATED for code CAPA-20260708-003.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '352 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-24', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for EOSB-CHK-24', 
      'System audit trail registered event EVIDENCE_UPLOADED for code EOSB-CHK-24.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '353 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-10', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for VISA_EXIT-RSK-10', 
      'System audit trail registered event CONTROL_REVIEWED for code VISA_EXIT-RSK-10.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '354 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-26', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for ER-CHK-26', 
      'System audit trail registered event RISK_ACCEPTED for code ER-CHK-26.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '355 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-007', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-007', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-007.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '356 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-13', 'CAPA_CREATED', 'CAPA_CREATED log for SEPARATION-RSK-13', 
      'System audit trail registered event CAPA_CREATED for code SEPARATION-RSK-13.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '357 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-009', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-009', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-009.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '358 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-30', 'APPROVED', 'APPROVED log for VISA_EXIT-CHK-30', 
      'System audit trail registered event APPROVED for code VISA_EXIT-CHK-30.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '359 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-01', 'CREATED', 'CREATED log for ER-RSK-01', 
      'System audit trail registered event CREATED for code ER-RSK-01.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '360 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-02', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for DISCIPLINARY-CHK-02', 
      'System audit trail registered event EVIDENCE_UPLOADED for code DISCIPLINARY-CHK-02.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '361 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-013', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-013', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-013.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '362 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-04', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for EOSB-RSK-04', 
      'System audit trail registered event RISK_ACCEPTED for code EOSB-RSK-04.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '363 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-015', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-015', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-015.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '364 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-06', 'CAPA_CREATED', 'CAPA_CREATED log for ER-CHK-06', 
      'System audit trail registered event CAPA_CREATED for code ER-CHK-06.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '365 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-07', 'CAPA_CLOSED', 'CAPA_CLOSED log for DISCIPLINARY-RSK-07', 
      'System audit trail registered event CAPA_CLOSED for code DISCIPLINARY-RSK-07.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '366 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-08', 'APPROVED', 'APPROVED log for SEPARATION-CHK-08', 
      'System audit trail registered event APPROVED for code SEPARATION-CHK-08.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '367 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-019', 'CREATED', 'CREATED log for CAPA-20260708-019', 
      'System audit trail registered event CREATED for code CAPA-20260708-019.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '368 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-10', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for VISA_EXIT-RSK-10', 
      'System audit trail registered event EVIDENCE_UPLOADED for code VISA_EXIT-RSK-10.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '369 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-021', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-021', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-021.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '370 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-12', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for DISCIPLINARY-CHK-12', 
      'System audit trail registered event RISK_ACCEPTED for code DISCIPLINARY-CHK-12.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '371 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-13', 'RISK_MITIGATED', 'RISK_MITIGATED log for SEPARATION-RSK-13', 
      'System audit trail registered event RISK_MITIGATED for code SEPARATION-RSK-13.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '372 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-14', 'CAPA_CREATED', 'CAPA_CREATED log for EOSB-CHK-14', 
      'System audit trail registered event CAPA_CREATED for code EOSB-CHK-14.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '373 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-025', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-025', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-025.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '374 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-01', 'APPROVED', 'APPROVED log for ER-RSK-01', 
      'System audit trail registered event APPROVED for code ER-RSK-01.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '375 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-027', 'CREATED', 'CREATED log for CAPA-20260708-027', 
      'System audit trail registered event CREATED for code CAPA-20260708-027.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '376 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-18', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for SEPARATION-CHK-18', 
      'System audit trail registered event EVIDENCE_UPLOADED for code SEPARATION-CHK-18.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '377 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-04', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for EOSB-RSK-04', 
      'System audit trail registered event CONTROL_REVIEWED for code EOSB-RSK-04.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '378 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-20', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for VISA_EXIT-CHK-20', 
      'System audit trail registered event RISK_ACCEPTED for code VISA_EXIT-CHK-20.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '379 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-031', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-031', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-031.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '380 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-07', 'CAPA_CREATED', 'CAPA_CREATED log for DISCIPLINARY-RSK-07', 
      'System audit trail registered event CAPA_CREATED for code DISCIPLINARY-RSK-07.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '381 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-033', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-033', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-033.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '382 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-24', 'APPROVED', 'APPROVED log for EOSB-CHK-24', 
      'System audit trail registered event APPROVED for code EOSB-CHK-24.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '383 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-10', 'CREATED', 'CREATED log for VISA_EXIT-RSK-10', 
      'System audit trail registered event CREATED for code VISA_EXIT-RSK-10.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '384 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-26', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for ER-CHK-26', 
      'System audit trail registered event EVIDENCE_UPLOADED for code ER-CHK-26.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '385 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-037', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-037', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-037.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '386 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-13', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for SEPARATION-RSK-13', 
      'System audit trail registered event RISK_ACCEPTED for code SEPARATION-RSK-13.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '387 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-039', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-039', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-039.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '388 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-30', 'CAPA_CREATED', 'CAPA_CREATED log for VISA_EXIT-CHK-30', 
      'System audit trail registered event CAPA_CREATED for code VISA_EXIT-CHK-30.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '389 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-01', 'CAPA_CLOSED', 'CAPA_CLOSED log for ER-RSK-01', 
      'System audit trail registered event CAPA_CLOSED for code ER-RSK-01.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '390 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-02', 'APPROVED', 'APPROVED log for DISCIPLINARY-CHK-02', 
      'System audit trail registered event APPROVED for code DISCIPLINARY-CHK-02.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '391 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-043', 'CREATED', 'CREATED log for CAPA-20260708-043', 
      'System audit trail registered event CREATED for code CAPA-20260708-043.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '392 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-04', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for EOSB-RSK-04', 
      'System audit trail registered event EVIDENCE_UPLOADED for code EOSB-RSK-04.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '393 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-045', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-045', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-045.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '394 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-06', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for ER-CHK-06', 
      'System audit trail registered event RISK_ACCEPTED for code ER-CHK-06.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '395 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-07', 'RISK_MITIGATED', 'RISK_MITIGATED log for DISCIPLINARY-RSK-07', 
      'System audit trail registered event RISK_MITIGATED for code DISCIPLINARY-RSK-07.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '396 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-08', 'CAPA_CREATED', 'CAPA_CREATED log for SEPARATION-CHK-08', 
      'System audit trail registered event CAPA_CREATED for code SEPARATION-CHK-08.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '397 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-049', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-049', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-049.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '398 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-10', 'APPROVED', 'APPROVED log for VISA_EXIT-RSK-10', 
      'System audit trail registered event APPROVED for code VISA_EXIT-RSK-10.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '399 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-051', 'CREATED', 'CREATED log for CAPA-20260708-051', 
      'System audit trail registered event CREATED for code CAPA-20260708-051.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '400 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-12', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for DISCIPLINARY-CHK-12', 
      'System audit trail registered event EVIDENCE_UPLOADED for code DISCIPLINARY-CHK-12.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '401 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-13', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for SEPARATION-RSK-13', 
      'System audit trail registered event CONTROL_REVIEWED for code SEPARATION-RSK-13.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '402 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-14', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for EOSB-CHK-14', 
      'System audit trail registered event RISK_ACCEPTED for code EOSB-CHK-14.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '403 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-055', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-055', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-055.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '404 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-01', 'CAPA_CREATED', 'CAPA_CREATED log for ER-RSK-01', 
      'System audit trail registered event CAPA_CREATED for code ER-RSK-01.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '405 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-057', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-057', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-057.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '406 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-18', 'APPROVED', 'APPROVED log for SEPARATION-CHK-18', 
      'System audit trail registered event APPROVED for code SEPARATION-CHK-18.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '407 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-04', 'CREATED', 'CREATED log for EOSB-RSK-04', 
      'System audit trail registered event CREATED for code EOSB-RSK-04.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '408 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-20', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for VISA_EXIT-CHK-20', 
      'System audit trail registered event EVIDENCE_UPLOADED for code VISA_EXIT-CHK-20.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '409 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-061', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-061', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-061.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '410 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-07', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for DISCIPLINARY-RSK-07', 
      'System audit trail registered event RISK_ACCEPTED for code DISCIPLINARY-RSK-07.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '411 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-063', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-063', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-063.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '412 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-24', 'CAPA_CREATED', 'CAPA_CREATED log for EOSB-CHK-24', 
      'System audit trail registered event CAPA_CREATED for code EOSB-CHK-24.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '413 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-10', 'CAPA_CLOSED', 'CAPA_CLOSED log for VISA_EXIT-RSK-10', 
      'System audit trail registered event CAPA_CLOSED for code VISA_EXIT-RSK-10.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '414 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-26', 'APPROVED', 'APPROVED log for ER-CHK-26', 
      'System audit trail registered event APPROVED for code ER-CHK-26.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '415 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-067', 'CREATED', 'CREATED log for CAPA-20260708-067', 
      'System audit trail registered event CREATED for code CAPA-20260708-067.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '416 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-13', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for SEPARATION-RSK-13', 
      'System audit trail registered event EVIDENCE_UPLOADED for code SEPARATION-RSK-13.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '417 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-069', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-069', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-069.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '418 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-30', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for VISA_EXIT-CHK-30', 
      'System audit trail registered event RISK_ACCEPTED for code VISA_EXIT-CHK-30.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '419 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-01', 'RISK_MITIGATED', 'RISK_MITIGATED log for ER-RSK-01', 
      'System audit trail registered event RISK_MITIGATED for code ER-RSK-01.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '420 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-02', 'CAPA_CREATED', 'CAPA_CREATED log for DISCIPLINARY-CHK-02', 
      'System audit trail registered event CAPA_CREATED for code DISCIPLINARY-CHK-02.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '421 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-003', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-003', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-003.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '422 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-04', 'APPROVED', 'APPROVED log for EOSB-RSK-04', 
      'System audit trail registered event APPROVED for code EOSB-RSK-04.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '423 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-005', 'CREATED', 'CREATED log for CAPA-20260708-005', 
      'System audit trail registered event CREATED for code CAPA-20260708-005.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '424 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-06', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for ER-CHK-06', 
      'System audit trail registered event EVIDENCE_UPLOADED for code ER-CHK-06.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '425 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-07', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for DISCIPLINARY-RSK-07', 
      'System audit trail registered event CONTROL_REVIEWED for code DISCIPLINARY-RSK-07.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '426 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-08', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for SEPARATION-CHK-08', 
      'System audit trail registered event RISK_ACCEPTED for code SEPARATION-CHK-08.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '427 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-009', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-009', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-009.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '428 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-10', 'CAPA_CREATED', 'CAPA_CREATED log for VISA_EXIT-RSK-10', 
      'System audit trail registered event CAPA_CREATED for code VISA_EXIT-RSK-10.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '429 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-011', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-011', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-011.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '430 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'DISCIPLINARY-CHK-12', 'APPROVED', 'APPROVED log for DISCIPLINARY-CHK-12', 
      'System audit trail registered event APPROVED for code DISCIPLINARY-CHK-12.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '431 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-13', 'CREATED', 'CREATED log for SEPARATION-RSK-13', 
      'System audit trail registered event CREATED for code SEPARATION-RSK-13.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '432 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-14', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for EOSB-CHK-14', 
      'System audit trail registered event EVIDENCE_UPLOADED for code EOSB-CHK-14.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '433 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-015', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-015', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-015.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '434 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-01', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for ER-RSK-01', 
      'System audit trail registered event RISK_ACCEPTED for code ER-RSK-01.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '435 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-017', 'RISK_MITIGATED', 'RISK_MITIGATED log for CAPA-20260708-017', 
      'System audit trail registered event RISK_MITIGATED for code CAPA-20260708-017.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '436 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'SEPARATION-CHK-18', 'CAPA_CREATED', 'CAPA_CREATED log for SEPARATION-CHK-18', 
      'System audit trail registered event CAPA_CREATED for code SEPARATION-CHK-18.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '437 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'EOSB-RSK-04', 'CAPA_CLOSED', 'CAPA_CLOSED log for EOSB-RSK-04', 
      'System audit trail registered event CAPA_CLOSED for code EOSB-RSK-04.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '438 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-20', 'APPROVED', 'APPROVED log for VISA_EXIT-CHK-20', 
      'System audit trail registered event APPROVED for code VISA_EXIT-CHK-20.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '439 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-021', 'CREATED', 'CREATED log for CAPA-20260708-021', 
      'System audit trail registered event CREATED for code CAPA-20260708-021.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '440 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'DISCIPLINARY-RSK-07', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for DISCIPLINARY-RSK-07', 
      'System audit trail registered event EVIDENCE_UPLOADED for code DISCIPLINARY-RSK-07.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '441 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-023', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for CAPA-20260708-023', 
      'System audit trail registered event CONTROL_REVIEWED for code CAPA-20260708-023.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '442 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'EOSB-CHK-24', 'RISK_ACCEPTED', 'RISK_ACCEPTED log for EOSB-CHK-24', 
      'System audit trail registered event RISK_ACCEPTED for code EOSB-CHK-24.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '443 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'VISA_EXIT-RSK-10', 'RISK_MITIGATED', 'RISK_MITIGATED log for VISA_EXIT-RSK-10', 
      'System audit trail registered event RISK_MITIGATED for code VISA_EXIT-RSK-10.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '444 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'ER-CHK-26', 'CAPA_CREATED', 'CAPA_CREATED log for ER-CHK-26', 
      'System audit trail registered event CAPA_CREATED for code ER-CHK-26.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '445 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-027', 'CAPA_CLOSED', 'CAPA_CLOSED log for CAPA-20260708-027', 
      'System audit trail registered event CAPA_CLOSED for code CAPA-20260708-027.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '446 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'SEPARATION-RSK-13', 'APPROVED', 'APPROVED log for SEPARATION-RSK-13', 
      'System audit trail registered event APPROVED for code SEPARATION-RSK-13.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '447 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CAPA', 'CAPA-20260708-029', 'CREATED', 'CREATED log for CAPA-20260708-029', 
      'System audit trail registered event CREATED for code CAPA-20260708-029.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '448 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'CHECKLIST', 'VISA_EXIT-CHK-30', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPLOADED log for VISA_EXIT-CHK-30', 
      'System audit trail registered event EVIDENCE_UPLOADED for code VISA_EXIT-CHK-30.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '449 hours', CURRENT_TIMESTAMP
    ),
(
      gen_random_uuid(), (SELECT tenant_id FROM vars), 'RISK', 'ER-RSK-01', 'CONTROL_REVIEWED', 'CONTROL_REVIEWED log for ER-RSK-01', 
      'System audit trail registered event CONTROL_REVIEWED for code ER-RSK-01.', (SELECT user_id FROM vars), 'System Auditor', CURRENT_TIMESTAMP - INTERVAL '450 hours', CURRENT_TIMESTAMP
    );

COMMIT;
