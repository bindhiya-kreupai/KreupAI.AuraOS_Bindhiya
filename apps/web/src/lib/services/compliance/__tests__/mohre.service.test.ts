/**
 * MohreService — UAE MOHRE labour-contract / work-permit validation tests.
 */

import { describe, it, expect } from 'vitest';
import { MohreService } from '../mohre.service';

const baseConfig: any = {
  tenantId: 'tenant-1',
  clientId: 'client-1',
  clientSecret: 'secret-1',
  establishmentNumber: 'EST-MOHRE-001',
  unifiedNumber: '100200300',
  apiBaseUrl: 'https://api.mohre.gov.ae.test',
  callbackUrl: 'https://app.test/callback',
  environment: 'SANDBOX',
};

const validPayload: any = {
  employee: {
    emiratesId: '784-1990-1234567-1',
    passportNumber: 'A12345678',
    passportCountry: 'IN',
    fullNameEn: 'Rahul Kumar',
    fullNameAr: 'راهول كومار',
    dateOfBirth: '1990-05-20',
    gender: 'MALE',
    nationality: 'IN',
    occupationCode: '2421',
    educationLevel: 'BACHELOR',
  },
  contract: {
    contractType: 'LIMITED',
    startDate: '2026-07-01',
    endDate: '2028-07-01',
    probationDays: 90,
    weeklyWorkHours: 40,
    basicSalary: 8000,
    allowances: 4000,
    totalSalary: 12000,
    paymentFrequency: 'MONTHLY',
    workLocation: { emirate: 'AD', city: 'Abu Dhabi', isRemote: false },
    benefits: {
      annualLeaveDays: 30,
      sickLeaveDays: 90,
      airTicketsPerYear: 1,
      endOfServiceBenefit: true,
      medicalInsurance: true,
    },
  },
  permitType: 'STANDARD',
  isEmirati: false,
};

const service = MohreService.create(baseConfig);

describe('MohreService.create', () => {
  it('returns a constructed MohreService instance', () => {
    expect(service).toBeInstanceOf(MohreService);
  });
});

describe('MohreService.validatePermitPayload', () => {
  it('accepts a fully valid permit application', () => {
    expect(service.validatePermitPayload(validPayload)).toEqual([]);
  });

  it('rejects malformed Emirates ID', () => {
    const errors = service.validatePermitPayload({
      ...validPayload,
      employee: { ...validPayload.employee, emiratesId: '999999999' },
    });
    expect(errors.some((e) => e.field === 'employee.emiratesId')).toBe(true);
  });

  it('rejects probation > 180 days (Decree-Law 33/2021)', () => {
    const errors = service.validatePermitPayload({
      ...validPayload,
      contract: { ...validPayload.contract, probationDays: 200 },
    });
    expect(errors.some((e) => /Probation/i.test(e.error))).toBe(true);
  });

  it('rejects weekly work hours > 48', () => {
    const errors = service.validatePermitPayload({
      ...validPayload,
      contract: { ...validPayload.contract, weeklyWorkHours: 50 },
    });
    expect(errors.some((e) => /Weekly work hours/i.test(e.error))).toBe(true);
  });

  it('rejects annual leave < 30 days (Art. 29)', () => {
    const errors = service.validatePermitPayload({
      ...validPayload,
      contract: {
        ...validPayload.contract,
        benefits: { ...validPayload.contract.benefits, annualLeaveDays: 21 },
      },
    });
    expect(errors.some((e) => /Annual leave/i.test(e.error))).toBe(true);
  });

  it('rejects non-positive salary', () => {
    const errors = service.validatePermitPayload({
      ...validPayload,
      contract: { ...validPayload.contract, totalSalary: 0 },
    });
    expect(errors.some((e) => /salary/i.test(e.error))).toBe(true);
  });

  it('requires end date for LIMITED-term contracts', () => {
    const errors = service.validatePermitPayload({
      ...validPayload,
      contract: { ...validPayload.contract, endDate: undefined },
    });
    expect(errors.some((e) => e.field === 'contract.endDate')).toBe(true);
  });
});

describe('MohreService.handleError', () => {
  it('classifies retryable errors with exponential backoff', () => {
    const result = service.handleError('MH-007', 0);
    expect(result.shouldRetry).toBe(true);
    expect(result.retryAfterMs).toBe(5000);
  });

  it('classifies non-retryable errors', () => {
    const result = service.handleError('MH-005', 0);
    expect(result.shouldRetry).toBe(false);
    expect(result.errorInfo.message).toMatch(/Emiratisation/);
  });

  it('caps retries at 3 attempts', () => {
    const result = service.handleError('MH-007', 3);
    expect(result.shouldRetry).toBe(false);
  });

  it('returns bilingual message for unknown error codes', () => {
    const result = service.handleError('MH-UNKNOWN', 0);
    expect(result.errorInfo.message).toBe('Unknown MOHRE error');
    expect(result.errorInfo.messageAr).toBeDefined();
  });
});
