/**
 * QiwaService — Saudi Qiwa portal contract validation tests.
 */

import { describe, it, expect } from 'vitest';
import { QiwaService } from '../qiwa.service';

const baseConfig: any = {
  unifiedNumber: '7000001234',
  establishmentNumber: 'EST-123',
  apiKey: 'test-key',
  apiBaseUrl: 'https://api.qiwa.test',
  environment: 'SANDBOX',
};

const validPayload: any = {
  employee: {
    iqamaNumber: '2123456789',
    fullName: 'Ahmed',
    nationality: 'SA',
  },
  contract: {
    type: 'INDEFINITE',
    probationDays: 90,
    workHoursPerDay: 8,
    workDaysPerWeek: 5,
    noticePeriodDays: 60,
  },
  compensation: {
    basicSalary: 5000,
    totalSalary: 8000,
    currency: 'SAR',
  },
  benefits: {
    annualLeaveDays: 21,
    sickLeaveDays: 30,
    gosiRegistration: true,
  },
};

const service = QiwaService.create(baseConfig);

describe('QiwaService.create', () => {
  it('returns a constructed QiwaService instance', () => {
    expect(service).toBeInstanceOf(QiwaService);
  });
});

describe('QiwaService.validateContractPayload', () => {
  it('accepts a fully valid contract', () => {
    const errors = service.validateContractPayload(validPayload);
    expect(errors).toEqual([]);
  });

  it('rejects malformed Iqama (must start with 1 or 2)', () => {
    const errors = service.validateContractPayload({
      ...validPayload,
      employee: { ...validPayload.employee, iqamaNumber: '9999999999' },
    });
    expect(errors.some((e) => e.field === 'employee.iqamaNumber')).toBe(true);
  });

  it('rejects probation > 180 days', () => {
    const errors = service.validateContractPayload({
      ...validPayload,
      contract: { ...validPayload.contract, probationDays: 200 },
    });
    expect(errors.some((e) => /probation/i.test(e.error))).toBe(true);
  });

  it('rejects work hours > 8/day', () => {
    const errors = service.validateContractPayload({
      ...validPayload,
      contract: { ...validPayload.contract, workHoursPerDay: 10 },
    });
    expect(errors.some((e) => /work hours/i.test(e.error))).toBe(true);
  });

  it('rejects annual leave < 21 days', () => {
    const errors = service.validateContractPayload({
      ...validPayload,
      benefits: { ...validPayload.benefits, annualLeaveDays: 14 },
    });
    expect(errors.some((e) => /annual leave/i.test(e.error))).toBe(true);
  });

  it('rejects non-positive salary', () => {
    const errors = service.validateContractPayload({
      ...validPayload,
      compensation: { ...validPayload.compensation, totalSalary: 0 },
    });
    expect(errors.some((e) => /salary must be positive/i.test(e.error))).toBe(true);
  });

  it('rejects basic salary < 50% of total (GOSI)', () => {
    const errors = service.validateContractPayload({
      ...validPayload,
      compensation: { basicSalary: 2000, totalSalary: 10000, currency: 'SAR' },
    });
    expect(errors.some((e) => /50%/i.test(e.error))).toBe(true);
  });

  it('requires GOSI registration', () => {
    const errors = service.validateContractPayload({
      ...validPayload,
      benefits: { ...validPayload.benefits, gosiRegistration: false },
    });
    expect(errors.some((e) => /GOSI/i.test(e.error))).toBe(true);
  });

  it('requires endDate for DEFINITE contracts', () => {
    const errors = service.validateContractPayload({
      ...validPayload,
      contract: { ...validPayload.contract, type: 'DEFINITE', endDate: undefined },
    });
    expect(errors.some((e) => /end date/i.test(e.error))).toBe(true);
  });

  it('requires ≥60-day notice for INDEFINITE contracts', () => {
    const errors = service.validateContractPayload({
      ...validPayload,
      contract: { ...validPayload.contract, type: 'INDEFINITE', noticePeriodDays: 30 },
    });
    expect(errors.some((e) => /notice/i.test(e.error))).toBe(true);
  });
});
