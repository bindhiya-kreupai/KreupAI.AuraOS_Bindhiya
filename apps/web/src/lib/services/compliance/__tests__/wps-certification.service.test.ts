/**
 * WPSCertificationService — UAE WPS production-readiness assessment.
 * Validates employer/agent/bank credentials, SIF file structure, etc.
 */

import { describe, it, expect } from 'vitest';
import { WPSCertificationService } from '../wps-certification.service';

const validConfig: any = {
  employerCode: '1234567890123',
  wpsAgentCode: 'ENBD', // commonly registered
  bankCode: 'EBILAEAD',
  molEstablishmentId: '123456789',
};

describe('WPSCertificationService.validateCredentialExchange', () => {
  it('returns a list of CertificationCheckResult', () => {
    const results = WPSCertificationService.validateCredentialExchange(validConfig);
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });

  it('passes a valid employer code', () => {
    const results = WPSCertificationService.validateCredentialExchange(validConfig);
    const r = results.find((x) => x.checkId === 'CRED-001');
    expect(r?.status).toBe('PASS');
  });

  it('fails when employer code is non-numeric', () => {
    const results = WPSCertificationService.validateCredentialExchange({
      ...validConfig,
      employerCode: 'ABCDE12345',
    });
    const r = results.find((x) => x.checkId === 'CRED-001');
    expect(r?.status).toBe('FAIL');
  });

  it('warns when bank code is not SWIFT format', () => {
    const results = WPSCertificationService.validateCredentialExchange({
      ...validConfig,
      bankCode: 'BAD',
    });
    const r = results.find((x) => x.checkId === 'CRED-003');
    expect(['FAIL', 'WARN']).toContain(r?.status);
  });

  it('warns when MoL Establishment ID is missing', () => {
    const results = WPSCertificationService.validateCredentialExchange({
      ...validConfig,
      molEstablishmentId: '',
    });
    const r = results.find((x) => x.checkId === 'CRED-004');
    expect(['WARN', 'FAIL']).toContain(r?.status);
  });
});

describe('WPSCertificationService.validateSIFStructure', () => {
  const sifFile: any = {
    header: { totalRecords: 0, totalAmount: 0, period: '2026-06', employerCode: '123' },
    trailer: { totalRecords: 0, totalAmount: 0 },
    records: [],
  };

  it('flags missing header (SCR) record', () => {
    const results = WPSCertificationService.validateSIFStructure(sifFile, 'NOT_A_HEADER');
    const r = results.find((x) => x.checkId === 'SIF-001');
    expect(r?.status).toBe('FAIL');
  });

  it('passes when SIF starts with SCR header', () => {
    const sif = 'SCR|123|2026-06\r\nEDR|...';
    const results = WPSCertificationService.validateSIFStructure(sifFile, sif);
    const r = results.find((x) => x.checkId === 'SIF-001');
    expect(r?.status).toBe('PASS');
  });
});

describe('WPSCertificationService.validateRecordsForCertification', () => {
  it('returns an array of CertificationCheckResult', () => {
    const results = WPSCertificationService.validateRecordsForCertification([]);
    expect(Array.isArray(results)).toBe(true);
  });
});

describe('WPSCertificationService.validateRegulatoryFormat', () => {
  it('returns format-validation results', () => {
    const results = WPSCertificationService.validateRegulatoryFormat('SCR|...\r\nEDR|...');
    expect(Array.isArray(results)).toBe(true);
  });
});

describe('WPSCertificationService.runProductionDryRun', () => {
  it('returns a dry-run result structure', () => {
    const result = WPSCertificationService.runProductionDryRun(validConfig, [], 'SCR|...');
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });
});

describe('WPSCertificationService.generateBankUATChecklist', () => {
  it('returns a non-empty UAT checklist', () => {
    const checklist = WPSCertificationService.generateBankUATChecklist();
    expect(checklist.length).toBeGreaterThan(0);
  });
});
