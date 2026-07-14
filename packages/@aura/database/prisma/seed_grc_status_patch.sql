-- =========================================================================
-- GRC Status Patch — Realistic status distribution for KPI cards
-- Run AFTER seed_grc_audit_register.sql
-- =========================================================================

BEGIN;

SET search_path TO auraos, public;

CREATE TEMP TABLE vars AS
SELECT COALESCE(
  (SELECT id FROM aura_tenant WHERE code = 'KREUP_AI' LIMIT 1),
  'ae63d8ef-d01d-49a7-a542-b1256702765d'
) AS tenant_id;

-- ── ER domain: 28 COMPLIANT, 5 NON_COMPLIANT, 2 IN_PROGRESS, 1 WAIVED ──────
UPDATE aura_compliance_audit_checklist_item
SET status = 'COMPLIANT', "completedAt" = NOW() - INTERVAL '5 days', "completedBy" = 'COMPLIANCE_OFFICER'
WHERE "tenantId" = (SELECT tenant_id FROM vars)
  AND "domainCode" = 'ER'
  AND "itemCode" IN (
    'ER-CHK-01','ER-CHK-02','ER-CHK-03','ER-CHK-04','ER-CHK-05','ER-CHK-06',
    'ER-CHK-07','ER-CHK-08','ER-CHK-09','ER-CHK-10','ER-CHK-11','ER-CHK-12',
    'ER-CHK-13','ER-CHK-14','ER-CHK-15','ER-CHK-16','ER-CHK-17','ER-CHK-18',
    'ER-CHK-19','ER-CHK-20','ER-CHK-21','ER-CHK-22','ER-CHK-23','ER-CHK-24',
    'ER-CHK-25','ER-CHK-26','ER-CHK-27','ER-CHK-28'
  );

UPDATE aura_compliance_audit_checklist_item
SET status = 'NON_COMPLIANT'
WHERE "tenantId" = (SELECT tenant_id FROM vars)
  AND "domainCode" = 'ER'
  AND "itemCode" IN ('ER-CHK-29','ER-CHK-30','ER-CHK-31','ER-CHK-32','ER-CHK-33');

UPDATE aura_compliance_audit_checklist_item
SET status = 'IN_PROGRESS'
WHERE "tenantId" = (SELECT tenant_id FROM vars)
  AND "domainCode" = 'ER'
  AND "itemCode" IN ('ER-CHK-34','ER-CHK-35');

UPDATE aura_compliance_audit_checklist_item
SET status = 'WAIVED', notes = 'Waived pending policy review'
WHERE "tenantId" = (SELECT tenant_id FROM vars)
  AND "domainCode" = 'ER'
  AND "itemCode" = 'ER-CHK-36';

-- ── DISCIPLINARY: 24 COMPLIANT, 7 NON_COMPLIANT, 3 IN_PROGRESS, 2 WAIVED ───
UPDATE aura_compliance_audit_checklist_item
SET status = 'COMPLIANT', "completedAt" = NOW() - INTERVAL '3 days', "completedBy" = 'COMPLIANCE_OFFICER'
WHERE "tenantId" = (SELECT tenant_id FROM vars)
  AND "domainCode" = 'DISCIPLINARY'
  AND "itemCode" IN (
    'DISCIPLINARY-CHK-01','DISCIPLINARY-CHK-02','DISCIPLINARY-CHK-03','DISCIPLINARY-CHK-04',
    'DISCIPLINARY-CHK-05','DISCIPLINARY-CHK-06','DISCIPLINARY-CHK-07','DISCIPLINARY-CHK-08',
    'DISCIPLINARY-CHK-09','DISCIPLINARY-CHK-10','DISCIPLINARY-CHK-11','DISCIPLINARY-CHK-12',
    'DISCIPLINARY-CHK-13','DISCIPLINARY-CHK-14','DISCIPLINARY-CHK-15','DISCIPLINARY-CHK-16',
    'DISCIPLINARY-CHK-17','DISCIPLINARY-CHK-18','DISCIPLINARY-CHK-19','DISCIPLINARY-CHK-20',
    'DISCIPLINARY-CHK-21','DISCIPLINARY-CHK-22','DISCIPLINARY-CHK-23','DISCIPLINARY-CHK-24'
  );

UPDATE aura_compliance_audit_checklist_item
SET status = 'NON_COMPLIANT'
WHERE "tenantId" = (SELECT tenant_id FROM vars)
  AND "domainCode" = 'DISCIPLINARY'
  AND "itemCode" IN (
    'DISCIPLINARY-CHK-25','DISCIPLINARY-CHK-26','DISCIPLINARY-CHK-27',
    'DISCIPLINARY-CHK-28','DISCIPLINARY-CHK-29','DISCIPLINARY-CHK-30','DISCIPLINARY-CHK-31'
  );

UPDATE aura_compliance_audit_checklist_item
SET status = 'IN_PROGRESS'
WHERE "tenantId" = (SELECT tenant_id FROM vars)
  AND "domainCode" = 'DISCIPLINARY'
  AND "itemCode" IN ('DISCIPLINARY-CHK-32','DISCIPLINARY-CHK-33','DISCIPLINARY-CHK-34');

UPDATE aura_compliance_audit_checklist_item
SET status = 'WAIVED', notes = 'Waived by Legal — country-specific exemption'
WHERE "tenantId" = (SELECT tenant_id FROM vars)
  AND "domainCode" = 'DISCIPLINARY'
  AND "itemCode" IN ('DISCIPLINARY-CHK-35','DISCIPLINARY-CHK-36');

-- ── SEPARATION: 15 COMPLIANT, 12 NON_COMPLIANT, 6 IN_PROGRESS, 3 WAIVED ────
UPDATE aura_compliance_audit_checklist_item
SET status = 'COMPLIANT', "completedAt" = NOW() - INTERVAL '7 days', "completedBy" = 'HR_MANAGER'
WHERE "tenantId" = (SELECT tenant_id FROM vars)
  AND "domainCode" = 'SEPARATION'
  AND "itemCode" IN (
    'SEPARATION-CHK-01','SEPARATION-CHK-02','SEPARATION-CHK-03','SEPARATION-CHK-04',
    'SEPARATION-CHK-05','SEPARATION-CHK-06','SEPARATION-CHK-07','SEPARATION-CHK-08',
    'SEPARATION-CHK-09','SEPARATION-CHK-10','SEPARATION-CHK-11','SEPARATION-CHK-12',
    'SEPARATION-CHK-13','SEPARATION-CHK-14','SEPARATION-CHK-15'
  );

UPDATE aura_compliance_audit_checklist_item
SET status = 'NON_COMPLIANT'
WHERE "tenantId" = (SELECT tenant_id FROM vars)
  AND "domainCode" = 'SEPARATION'
  AND "itemCode" IN (
    'SEPARATION-CHK-16','SEPARATION-CHK-17','SEPARATION-CHK-18','SEPARATION-CHK-19',
    'SEPARATION-CHK-20','SEPARATION-CHK-21','SEPARATION-CHK-22','SEPARATION-CHK-23',
    'SEPARATION-CHK-24','SEPARATION-CHK-25','SEPARATION-CHK-26','SEPARATION-CHK-27'
  );

UPDATE aura_compliance_audit_checklist_item
SET status = 'IN_PROGRESS'
WHERE "tenantId" = (SELECT tenant_id FROM vars)
  AND "domainCode" = 'SEPARATION'
  AND "itemCode" IN (
    'SEPARATION-CHK-28','SEPARATION-CHK-29','SEPARATION-CHK-30',
    'SEPARATION-CHK-31','SEPARATION-CHK-32','SEPARATION-CHK-33'
  );

UPDATE aura_compliance_audit_checklist_item
SET status = 'WAIVED', notes = 'Waived — employee resigned before handover window'
WHERE "tenantId" = (SELECT tenant_id FROM vars)
  AND "domainCode" = 'SEPARATION'
  AND "itemCode" IN ('SEPARATION-CHK-34','SEPARATION-CHK-35','SEPARATION-CHK-36');

-- ── EOSB: 18 COMPLIANT, 10 NON_COMPLIANT, 5 IN_PROGRESS, 3 WAIVED ──────────
UPDATE aura_compliance_audit_checklist_item
SET status = 'COMPLIANT', "completedAt" = NOW() - INTERVAL '10 days', "completedBy" = 'PAYROLL_MANAGER'
WHERE "tenantId" = (SELECT tenant_id FROM vars)
  AND "domainCode" = 'EOSB'
  AND "itemCode" IN (
    'EOSB-CHK-01','EOSB-CHK-02','EOSB-CHK-03','EOSB-CHK-04','EOSB-CHK-05',
    'EOSB-CHK-06','EOSB-CHK-07','EOSB-CHK-08','EOSB-CHK-09','EOSB-CHK-10',
    'EOSB-CHK-11','EOSB-CHK-12','EOSB-CHK-13','EOSB-CHK-14','EOSB-CHK-15',
    'EOSB-CHK-16','EOSB-CHK-17','EOSB-CHK-18'
  );

UPDATE aura_compliance_audit_checklist_item
SET status = 'NON_COMPLIANT'
WHERE "tenantId" = (SELECT tenant_id FROM vars)
  AND "domainCode" = 'EOSB'
  AND "itemCode" IN (
    'EOSB-CHK-19','EOSB-CHK-20','EOSB-CHK-21','EOSB-CHK-22','EOSB-CHK-23',
    'EOSB-CHK-24','EOSB-CHK-25','EOSB-CHK-26','EOSB-CHK-27','EOSB-CHK-28'
  );

UPDATE aura_compliance_audit_checklist_item
SET status = 'IN_PROGRESS'
WHERE "tenantId" = (SELECT tenant_id FROM vars)
  AND "domainCode" = 'EOSB'
  AND "itemCode" IN ('EOSB-CHK-29','EOSB-CHK-30','EOSB-CHK-31','EOSB-CHK-32','EOSB-CHK-33');

UPDATE aura_compliance_audit_checklist_item
SET status = 'WAIVED', notes = 'Waived — not applicable for contract workers'
WHERE "tenantId" = (SELECT tenant_id FROM vars)
  AND "domainCode" = 'EOSB'
  AND "itemCode" IN ('EOSB-CHK-34','EOSB-CHK-35','EOSB-CHK-36');

-- ── VISA_EXIT: 12 COMPLIANT, 14 NON_COMPLIANT, 7 IN_PROGRESS, 3 WAIVED ─────
UPDATE aura_compliance_audit_checklist_item
SET status = 'COMPLIANT', "completedAt" = NOW() - INTERVAL '2 days', "completedBy" = 'PRO_OFFICER'
WHERE "tenantId" = (SELECT tenant_id FROM vars)
  AND "domainCode" = 'VISA_EXIT'
  AND "itemCode" IN (
    'VISA_EXIT-CHK-01','VISA_EXIT-CHK-02','VISA_EXIT-CHK-03','VISA_EXIT-CHK-04',
    'VISA_EXIT-CHK-05','VISA_EXIT-CHK-06','VISA_EXIT-CHK-07','VISA_EXIT-CHK-08',
    'VISA_EXIT-CHK-09','VISA_EXIT-CHK-10','VISA_EXIT-CHK-11','VISA_EXIT-CHK-12'
  );

UPDATE aura_compliance_audit_checklist_item
SET status = 'NON_COMPLIANT'
WHERE "tenantId" = (SELECT tenant_id FROM vars)
  AND "domainCode" = 'VISA_EXIT'
  AND "itemCode" IN (
    'VISA_EXIT-CHK-13','VISA_EXIT-CHK-14','VISA_EXIT-CHK-15','VISA_EXIT-CHK-16',
    'VISA_EXIT-CHK-17','VISA_EXIT-CHK-18','VISA_EXIT-CHK-19','VISA_EXIT-CHK-20',
    'VISA_EXIT-CHK-21','VISA_EXIT-CHK-22','VISA_EXIT-CHK-23','VISA_EXIT-CHK-24',
    'VISA_EXIT-CHK-25','VISA_EXIT-CHK-26'
  );

UPDATE aura_compliance_audit_checklist_item
SET status = 'IN_PROGRESS'
WHERE "tenantId" = (SELECT tenant_id FROM vars)
  AND "domainCode" = 'VISA_EXIT'
  AND "itemCode" IN (
    'VISA_EXIT-CHK-27','VISA_EXIT-CHK-28','VISA_EXIT-CHK-29',
    'VISA_EXIT-CHK-30','VISA_EXIT-CHK-31','VISA_EXIT-CHK-32','VISA_EXIT-CHK-33'
  );

UPDATE aura_compliance_audit_checklist_item
SET status = 'WAIVED', notes = 'Waived — embassy processing delay outside HR control'
WHERE "tenantId" = (SELECT tenant_id FROM vars)
  AND "domainCode" = 'VISA_EXIT'
  AND "itemCode" IN ('VISA_EXIT-CHK-34','VISA_EXIT-CHK-35','VISA_EXIT-CHK-36');

-- ── Mark mandatory (gating) controls across all domains ─────────────────────
UPDATE aura_compliance_audit_checklist_item
SET "isMandatory" = true
WHERE "tenantId" = (SELECT tenant_id FROM vars)
  AND "categoryCode" IN ('INTAKE','COMMITTEE','RESIGNATION','CALCULATION','CANCELLATION');

-- ── Set due dates so overdue items appear ────────────────────────────────────
UPDATE aura_compliance_audit_checklist_item
SET "dueDate" = NOW() - INTERVAL '15 days'
WHERE "tenantId" = (SELECT tenant_id FROM vars)
  AND status IN ('NON_COMPLIANT','IN_PROGRESS')
  AND "domainCode" IN ('SEPARATION','EOSB','VISA_EXIT');

-- ── Risk banding: ensure critical/high variety ───────────────────────────────
UPDATE aura_compliance_risk_register_entry
SET band = 'CRITICAL', score = 20, likelihood = 5, impact = 4
WHERE "tenantId" = (SELECT tenant_id FROM vars)
  AND "riskCode" IN ('ER-RSK-01','DISCIPLINARY-RSK-01','SEPARATION-RSK-01','EOSB-RSK-01','VISA_EXIT-RSK-01');

UPDATE aura_compliance_risk_register_entry
SET band = 'HIGH', score = 12, likelihood = 4, impact = 3
WHERE "tenantId" = (SELECT tenant_id FROM vars)
  AND "riskCode" IN ('ER-RSK-02','DISCIPLINARY-RSK-02','SEPARATION-RSK-02','EOSB-RSK-02','VISA_EXIT-RSK-02',
                     'ER-RSK-03','DISCIPLINARY-RSK-03','SEPARATION-RSK-03','EOSB-RSK-03','VISA_EXIT-RSK-03');

UPDATE aura_compliance_risk_register_entry
SET band = 'MEDIUM', score = 6, likelihood = 3, impact = 2
WHERE "tenantId" = (SELECT tenant_id FROM vars)
  AND "riskCode" IN ('ER-RSK-04','DISCIPLINARY-RSK-04','SEPARATION-RSK-04','EOSB-RSK-04','VISA_EXIT-RSK-04',
                     'ER-RSK-05','DISCIPLINARY-RSK-05','SEPARATION-RSK-05','EOSB-RSK-05','VISA_EXIT-RSK-05');

-- ── Mix CAPA statuses so closed count > 0 ────────────────────────────────────
UPDATE aura_compliance_corrective_action
SET status = 'CLOSED'
WHERE "tenantId" = (SELECT tenant_id FROM vars)
  AND "actionNumber" IN (
    'CAPA-20260708-001','CAPA-20260708-003','CAPA-20260708-005','CAPA-20260708-007',
    'CAPA-20260708-009','CAPA-20260708-011','CAPA-20260708-013','CAPA-20260708-015'
  );

UPDATE aura_compliance_corrective_action
SET status = 'IN_PROGRESS'
WHERE "tenantId" = (SELECT tenant_id FROM vars)
  AND "actionNumber" IN (
    'CAPA-20260708-017','CAPA-20260708-019','CAPA-20260708-021','CAPA-20260708-023',
    'CAPA-20260708-025','CAPA-20260708-027','CAPA-20260708-029','CAPA-20260708-031'
  );

UPDATE aura_compliance_corrective_action
SET status = 'PENDING_VERIFICATION'
WHERE "tenantId" = (SELECT tenant_id FROM vars)
  AND "actionNumber" IN (
    'CAPA-20260708-033','CAPA-20260708-035','CAPA-20260708-037','CAPA-20260708-039'
  );

COMMIT;
