/**
 * StatutoryReportService — registry + transition tests.
 *
 * These tests don't touch Prisma. They verify the registry exposes the
 * expected report specs and that the SUBMISSION_ALLOWED state machine
 * enforces the contract that closes #85 (no placeholder MoHRE refs).
 */

import { describe, it, expect, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  listSpecs,
  StatutoryReportService,
  InvalidReportTransitionError,
} from '../statutory-report.service';

const svc = new StatutoryReportService();

describe('Statutory report registry', () => {
  it('exposes the 24 statutory generators plus 6 GCC compliance certificate exports (30 total)', () => {
    const codes = listSpecs()
      .map((s) => s.code)
      .sort();
    expect(codes).toEqual([
      'HRMS_CONFIG_SNAPSHOT',
      'IMMIGRATION_COMPLIANCE_CERT',
      'IND_BONUS_ACT',
      'IND_ESI_MONTHLY',
      'IND_ESI_RETURN',
      'IND_FORM_12BA',
      'IND_FORM_16',
      'IND_FORM_24Q',
      'IND_FORM_D_BONUS',
      'IND_GRATUITY_PROVISION',
      'IND_LWF',
      'IND_PF_ECR',
      'IND_PT_CHALLAN',
      'IND_TDS_QUARTERLY',
      'KSA_GOSI_MONTHLY',
      'KSA_GOSI_RECON',
      'KSA_HRSD_LABOUR',
      'KSA_MUDAD',
      'KSA_NITAQAT',
      'KSA_SAUDIZATION',
      'ORG_COMPLIANCE_CERT',
      'PAYROLL_COMPLIANCE_CERT',
      'RECORDS_COMPLIANCE_CERT',
      'TA_COMPLIANCE_CERT',
      'UAE_DEWS',
      'UAE_EMIRATISATION',
      'UAE_EOSB_PROVISION',
      'UAE_MOHRE',
      'UAE_PASI',
      'UAE_WPS_RECON',
    ]);
  });

  it('filters by country code', () => {
    const ae = svc
      .listSpecs({ countryCode: 'AE' })
      .map((s) => s.code)
      .sort();
    expect(ae).toEqual([
      'HRMS_CONFIG_SNAPSHOT',
      'IMMIGRATION_COMPLIANCE_CERT',
      'ORG_COMPLIANCE_CERT',
      'PAYROLL_COMPLIANCE_CERT',
      'RECORDS_COMPLIANCE_CERT',
      'TA_COMPLIANCE_CERT',
      'UAE_DEWS',
      'UAE_EMIRATISATION',
      'UAE_EOSB_PROVISION',
      'UAE_MOHRE',
      'UAE_PASI',
      'UAE_WPS_RECON',
    ]);

    const sa = svc
      .listSpecs({ countryCode: 'SA' })
      .map((s) => s.code)
      .sort();
    expect(sa).toEqual([
      'HRMS_CONFIG_SNAPSHOT',
      'IMMIGRATION_COMPLIANCE_CERT',
      'KSA_GOSI_MONTHLY',
      'KSA_GOSI_RECON',
      'KSA_HRSD_LABOUR',
      'KSA_MUDAD',
      'KSA_NITAQAT',
      'KSA_SAUDIZATION',
      'ORG_COMPLIANCE_CERT',
      'PAYROLL_COMPLIANCE_CERT',
      'RECORDS_COMPLIANCE_CERT',
      'TA_COMPLIANCE_CERT',
    ]);

    const ind = svc
      .listSpecs({ countryCode: 'IN' })
      .map((s) => s.code)
      .sort();
    expect(ind).toEqual([
      'HRMS_CONFIG_SNAPSHOT',
      'IND_BONUS_ACT',
      'IND_ESI_MONTHLY',
      'IND_ESI_RETURN',
      'IND_FORM_12BA',
      'IND_FORM_16',
      'IND_FORM_24Q',
      'IND_FORM_D_BONUS',
      'IND_GRATUITY_PROVISION',
      'IND_LWF',
      'IND_PF_ECR',
      'IND_PT_CHALLAN',
      'IND_TDS_QUARTERLY',
      'ORG_COMPLIANCE_CERT',
      'PAYROLL_COMPLIANCE_CERT',
      'RECORDS_COMPLIANCE_CERT',
      'TA_COMPLIANCE_CERT',
    ]);
    // IMMIGRATION_COMPLIANCE_CERT is GCC-only (no IN in its countryCode CSV).
    expect(ind).not.toContain('IMMIGRATION_COMPLIANCE_CERT');
  });

  it('all 6 GCC compliance certificate exports are registered with the expected formats', () => {
    const codeToFormat = new Map(listSpecs().map((s) => [s.code, s.format]));
    expect(codeToFormat.get('PAYROLL_COMPLIANCE_CERT')).toBe('pdf');
    expect(codeToFormat.get('ORG_COMPLIANCE_CERT')).toBe('pdf');
    expect(codeToFormat.get('RECORDS_COMPLIANCE_CERT')).toBe('pdf');
    expect(codeToFormat.get('TA_COMPLIANCE_CERT')).toBe('pdf');
    expect(codeToFormat.get('IMMIGRATION_COMPLIANCE_CERT')).toBe('pdf');
    expect(codeToFormat.get('HRMS_CONFIG_SNAPSHOT')).toBe('csv');
  });

  it('returns specs without the generate function (safe to serialize)', () => {
    const specs = svc.listSpecs();
    for (const spec of specs) {
      expect(spec).not.toHaveProperty('generate');
      expect(spec).toHaveProperty('code');
      expect(spec).toHaveProperty('countryCode');
      expect(spec).toHaveProperty('format');
    }
  });
});

describe('GCC compliance certificate export generators', () => {
  const ctx = {
    tenantId: 'tenant-1',
    periodStart: new Date('2026-06-01'),
    periodEnd: new Date('2026-06-30'),
    generatedById: 'user-1',
  };

  it('IMMIGRATION_COMPLIANCE_CERT surfaces gating reason as warning', async () => {
    const spec = listSpecs().find((s) => s.code === 'IMMIGRATION_COMPLIANCE_CERT');
    expect(spec).toBeDefined();
    (prisma as any).immigrationComplianceCertificate = {
      findFirst: vi.fn().mockResolvedValue({
        countriesCovered: 6,
        expiredDocsTotal: 2,
        alerts7dOpen: 3,
        alerts30dOpen: 5,
        alerts60dOpen: 8,
        transfersOpenOverdue: 1,
        checklistTotal: 12,
        checklistFailing: 1,
        checklistOverdue: 0,
        criticalRisksOpen: 1,
        gatingReason: '2 expired mandatory document(s); 3 renewal alert(s) inside 7-day window',
      }),
    };
    const payload = await spec!.generate(ctx);
    expect(payload.lines.find((l: any) => l.metric === 'expiredDocsTotal')?.value).toBe(2);
    expect(payload.warnings).toEqual([
      'GATED: 2 expired mandatory document(s); 3 renewal alert(s) inside 7-day window',
    ]);
  });

  it('PAYROLL_COMPLIANCE_CERT emits all 11 governance metrics', async () => {
    const spec = listSpecs().find((s) => s.code === 'PAYROLL_COMPLIANCE_CERT');
    (prisma as any).payrollComplianceCertificate = {
      findFirst: vi.fn().mockResolvedValue({
        runsCount: 3,
        runsApproved: 3,
        runsLocked: 3,
        runsMakerCheckerBreaches: 0,
        openFindingsCritical: 0,
        openFindingsHigh: 0,
        criticalRisksOpen: 0,
        controlsOverdue: 0,
        reconciliationVariancePct: 0.12,
        bankFileMismatches: 0,
        glPostingsMissing: 0,
        gatingReason: null,
      }),
    };
    const payload = await spec!.generate(ctx);
    expect(payload.lines).toHaveLength(11);
    expect(payload.warnings).toEqual([]);
  });

  it('HRMS_CONFIG_SNAPSHOT tolerates missing tables and emits zero-filled snapshot', async () => {
    const spec = listSpecs().find((s) => s.code === 'HRMS_CONFIG_SNAPSHOT');
    (prisma as any).countryRuleSet = { findMany: vi.fn().mockResolvedValue([]) };
    (prisma as any).approvalWorkflowTemplate = { findMany: vi.fn().mockResolvedValue([]) };
    (prisma as any).notificationRule = { findMany: vi.fn().mockResolvedValue([]) };
    (prisma as any).auditTrailSetting = { findMany: vi.fn().mockResolvedValue([]) };
    const payload = await spec!.generate(ctx);
    expect(payload.lines.find((l: any) => l.metric === 'ruleSets.total')?.value).toBe(0);
    expect(payload.lines.find((l: any) => l.metric === 'auditSettings.domainsCovered')?.value).toBe(
      0
    );
  });

  it('RECORDS_COMPLIANCE_CERT populates employeeCount total from cert.employeesEvaluated', async () => {
    const spec = listSpecs().find((s) => s.code === 'RECORDS_COMPLIANCE_CERT');
    (prisma as any).recordsComplianceCertificate = {
      findFirst: vi.fn().mockResolvedValue({
        employeesEvaluated: 142,
        averageScore: 87,
        greenEmployees: 100,
        amberEmployees: 30,
        redEmployees: 12,
        mandatoryMissingTotal: 22,
        expiredDocsTotal: 3,
        checklistFailing: 0,
        checklistOverdue: 0,
        criticalRisksOpen: 0,
        gatingReason: null,
      }),
    };
    const payload = await spec!.generate(ctx);
    expect(payload.totals.employeeCount).toBe(142);
  });
});

describe('Statutory report submission contract (#85)', () => {
  /**
   * markSubmitted relies on the SUBMISSION_ALLOWED table to gate transitions.
   * We can't drive the full flow without Prisma here, but the class exposes
   * enough to verify the InvalidReportTransitionError shape and the
   * placeholder-reference guard logic via the error message contract.
   */
  it('exports InvalidReportTransitionError as a real Error subclass', () => {
    const err = new InvalidReportTransitionError('DRAFT', 'ACKNOWLEDGED');
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('InvalidReportTransitionError');
    expect(err.message).toMatch(/DRAFT/);
    expect(err.message).toMatch(/ACKNOWLEDGED/);
  });

  it('rejects placeholder submission references shorter than 3 chars', async () => {
    // markSubmitted exits before any Prisma call when ref is too short.
    // The thrown Error message is the contract that callers (route + UI)
    // surface to MoHRE/GOSI/EPFO operators.
    await expect(
      svc.markSubmitted('any-id', 'any-tenant', 'any-actor', '', undefined)
    ).rejects.toThrow();
    await expect(
      svc.markSubmitted('any-id', 'any-tenant', 'any-actor', 'x', undefined)
    ).rejects.toThrow(/real authority-issued/);
  });
});
