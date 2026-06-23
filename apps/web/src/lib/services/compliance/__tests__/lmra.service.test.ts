/**
 * LmraService — Bahrain LMRA work-permit validation tests.
 */

import { describe, it, expect } from 'vitest';
import { LmraService } from '../lmra.service';

const baseConfig: any = {
  tenantId: 'tenant-1',
  clientId: 'client-1',
  clientSecret: 'secret-1',
  employerCode: 'LMRA-EMP-001',
  apiBaseUrl: 'https://api.lmra.bh.test',
  callbackUrl: 'https://app.test/callback',
  environment: 'SANDBOX',
};

const validPayload: any = {
  employee: {
    cpr: '900123456',
    passportNumber: 'B12345678',
    passportCountry: 'IN',
    fullNameEn: 'Ali Khan',
    fullNameAr: 'علي خان',
    dateOfBirth: '1985-03-15',
    gender: 'MALE',
    nationality: 'IN',
    occupationCode: '7411',
    isBahraini: false,
  },
  permitType: 'NEW_EXPATRIATE',
  durationMonths: 24,
  jobTitleEn: 'Electrician',
  jobTitleAr: 'كهربائي',
  basicSalary: 200,
  totalSalary: 350,
  workLocation: { governorate: 'Manama', area: 'Hoora' },
  sector: 'CONSTRUCTION',
};

const service = LmraService.create(baseConfig);

describe('LmraService.create', () => {
  it('returns a constructed LmraService instance', () => {
    expect(service).toBeInstanceOf(LmraService);
  });
});

describe('LmraService.validatePermitPayload', () => {
  it('accepts a fully valid permit application', () => {
    expect(service.validatePermitPayload(validPayload)).toEqual([]);
  });

  it('rejects malformed CPR (must be 9 digits)', () => {
    const errors = service.validatePermitPayload({
      ...validPayload,
      employee: { ...validPayload.employee, cpr: '12345' },
    });
    expect(errors.some((e) => e.field === 'employee.cpr')).toBe(true);
  });

  it('rejects duration other than 12 or 24 months', () => {
    const errors = service.validatePermitPayload({
      ...validPayload,
      durationMonths: 36 as any,
    });
    expect(errors.some((e) => e.field === 'durationMonths')).toBe(true);
  });

  it('rejects non-positive salary', () => {
    const errors = service.validatePermitPayload({
      ...validPayload,
      totalSalary: 0,
    });
    expect(errors.some((e) => /salary/i.test(e.error))).toBe(true);
  });

  it('rejects basic salary > total salary', () => {
    const errors = service.validatePermitPayload({
      ...validPayload,
      basicSalary: 500,
      totalSalary: 300,
    });
    expect(errors.some((e) => /Basic salary/i.test(e.error))).toBe(true);
  });

  it('rejects NEW_EXPATRIATE permit for Bahraini nationals', () => {
    const errors = service.validatePermitPayload({
      ...validPayload,
      employee: { ...validPayload.employee, isBahraini: true },
    });
    expect(errors.some((e) => /Bahraini/i.test(e.error))).toBe(true);
  });
});

describe('LmraService.handleError', () => {
  it('classifies retryable errors with exponential backoff', () => {
    const result = service.handleError('LM-007', 0);
    expect(result.shouldRetry).toBe(true);
    expect(result.retryAfterMs).toBe(5000);
  });

  it('classifies non-retryable Bahrainisation quota error', () => {
    const result = service.handleError('LM-004', 0);
    expect(result.shouldRetry).toBe(false);
    expect(result.errorInfo.message).toMatch(/Bahrainisation/);
  });

  it('caps retries at 3 attempts', () => {
    const result = service.handleError('LM-007', 3);
    expect(result.shouldRetry).toBe(false);
  });

  it('uses exponential backoff (5s, 15s, 45s)', () => {
    expect(service.handleError('LM-007', 0).retryAfterMs).toBe(5000);
    expect(service.handleError('LM-007', 1).retryAfterMs).toBe(15000);
    expect(service.handleError('LM-007', 2).retryAfterMs).toBe(45000);
  });

  it('returns bilingual message for unknown error codes', () => {
    const result = service.handleError('LM-UNKNOWN', 0);
    expect(result.errorInfo.message).toBe('Unknown LMRA error');
    expect(result.errorInfo.messageAr).toBeDefined();
  });
});
