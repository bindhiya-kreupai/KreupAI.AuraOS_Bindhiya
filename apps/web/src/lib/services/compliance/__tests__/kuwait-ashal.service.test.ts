/**
 * KuwaitASHALService — payload generation + reconciliation tests.
 * Pure functions; no HTTP/Prisma calls exercised here.
 */

import { describe, it, expect } from 'vitest';
import { KuwaitASHALService } from '../kuwait-ashal.service';

const baseConfig: any = {
  tenantId: 'tenant-A',
  companyFileNumber: 'COMP-001',
  commercialLicenseNumber: 'LIC-123',
  authorizedPersonCivilId: '123456789012',
  apiKey: 'test-key',
  apiBaseUrl: 'https://api.ashal.test',
  environment: 'SANDBOX',
};

const employeeData: any = {
  employeeId: 'emp-1',
  passportNumber: 'AB123456',
  passportCountry: 'IN',
  fullNameEn: 'Raj Kumar',
  fullNameAr: 'راج كومار',
  dateOfBirth: '1990-01-01',
  gender: 'MALE',
  nationality: 'IN',
  educationLevel: 'BACHELOR',
  maritalStatus: 'MARRIED',
  civilId: '123456789012',
  occupationCode: 'OCC-001',
  occupationNameEn: 'Software Engineer',
  occupationNameAr: 'مهندس برمجيات',
  monthlySalary: 1200,
};

const permitDetails: any = {
  type: 'NEW_WORK_PERMIT',
  startDate: '2026-06-01',
  duration: 12,
  isRenewal: false,
};

const companyData: any = {
  totalEmployees: 100,
  kuwaitiPercentage: 25,
  activityCode: 'ACT-100',
};

describe('KuwaitASHALService.generatePayload', () => {
  const service = KuwaitASHALService.create(baseConfig);

  it('builds a complete ASHAL payload from inputs', () => {
    const payload = service.generatePayload(employeeData, permitDetails, companyData);

    expect(payload.employee.passportNumber).toBe('AB123456');
    expect(payload.employee.fullNameEn).toBe('Raj Kumar');
    expect(payload.job.occupationCode).toBe('OCC-001');
    expect(payload.job.monthlySalary).toBe(1200);
    expect(payload.permit.type).toBe('NEW_WORK_PERMIT');
    expect(payload.permit.requestedStartDate).toBe('2026-06-01');
  });

  it('defaults workHoursPerDay to 8 and workDaysPerWeek to 5', () => {
    const payload = service.generatePayload(employeeData, permitDetails, companyData);
    expect(payload.job.workHoursPerDay).toBe(8);
    expect(payload.job.workDaysPerWeek).toBe(5);
  });

  it('defaults sector to PRIVATE', () => {
    const payload = service.generatePayload(employeeData, permitDetails, companyData);
    expect(payload.job.sector).toBe('PRIVATE');
  });

  it('pulls sponsorCivilId from config', () => {
    const payload = service.generatePayload(employeeData, permitDetails, companyData);
    expect(payload.permit.sponsorCivilId).toBe(baseConfig.authorizedPersonCivilId);
  });

  it('pulls company numbers from config', () => {
    const payload = service.generatePayload(employeeData, permitDetails, companyData);
    expect(payload.company.fileNumber).toBe('COMP-001');
    expect(payload.company.commercialLicense).toBe('LIC-123');
    expect(payload.company.kuwaitiPercentage).toBe(25);
  });

  it('passes through optional civilId', () => {
    const payload = service.generatePayload(employeeData, permitDetails, companyData);
    expect(payload.employee.civilId).toBe('123456789012');
  });

  it('handles 24-month duration', () => {
    const payload = service.generatePayload(
      employeeData,
      { ...permitDetails, duration: 24 },
      companyData
    );
    expect(payload.permit.duration).toBe(24);
  });

  it('marks renewal correctly', () => {
    const payload = service.generatePayload(
      employeeData,
      { ...permitDetails, isRenewal: true, previousPermitNumber: 'PRM-2025-001' },
      companyData
    );
    expect(payload.permit.isRenewal).toBe(true);
    expect(payload.permit.previousPermitNumber).toBe('PRM-2025-001');
  });
});

describe('KuwaitASHALService.generateReconciliationDashboard', () => {
  const mkSubmission = (status: string, opts: any = {}): any => ({
    submissionId: opts.id || 'SUB-1',
    status,
    payload: {
      employee: { fullNameEn: opts.name || 'Test Employee' },
      permit: { type: opts.permitType || 'NEW_WORK_PERMIT' },
    },
    submittedAt: opts.submittedAt || new Date('2026-06-01'),
    responses: opts.responses || [],
    fees: opts.fees,
  });

  it('counts approved / rejected / pending', () => {
    const dashboard = KuwaitASHALService.generateReconciliationDashboard('tenant-A', '2026-06', [
      mkSubmission('APPROVED'),
      mkSubmission('PERMIT_ISSUED'),
      mkSubmission('REJECTED'),
      mkSubmission('UNDER_REVIEW'),
      mkSubmission('PAYMENT_CONFIRMED'),
    ]);

    expect(dashboard.summary.approved).toBe(2);
    expect(dashboard.summary.rejected).toBe(1);
    expect(dashboard.summary.pending).toBe(2);
    expect(dashboard.summary.totalSubmissions).toBe(5);
  });

  it('aggregates permit counts by type', () => {
    const dashboard = KuwaitASHALService.generateReconciliationDashboard('tenant-A', '2026-06', [
      mkSubmission('APPROVED', { permitType: 'NEW_WORK_PERMIT' }),
      mkSubmission('APPROVED', { permitType: 'RENEWAL' }),
      mkSubmission('APPROVED', { permitType: 'RENEWAL' }),
    ]);

    expect(dashboard.permitsByType.NEW_WORK_PERMIT).toBe(1);
    expect(dashboard.permitsByType.RENEWAL).toBe(2);
    expect(dashboard.permitsByType.TRANSFER).toBe(0);
  });

  it('aggregates fees by payment status', () => {
    const dashboard = KuwaitASHALService.generateReconciliationDashboard('tenant-A', '2026-06', [
      mkSubmission('APPROVED', { fees: { paymentStatus: 'PAID', totalFees: 100 } }),
      mkSubmission('UNDER_REVIEW', { fees: { paymentStatus: 'PENDING', totalFees: 50 } }),
    ]);

    expect(dashboard.feesSummary.totalPaid).toBe(100);
    expect(dashboard.feesSummary.totalPending).toBe(50);
    expect(dashboard.feesSummary.currency).toBe('KWD');
  });

  it('returns a 10-deep recent submissions list', () => {
    const subs = Array.from({ length: 15 }, (_, i) => mkSubmission('APPROVED', { id: `SUB-${i}` }));

    const dashboard = KuwaitASHALService.generateReconciliationDashboard('tenant-A', '2026-06', subs);

    expect(dashboard.recentSubmissions).toHaveLength(10);
  });

  it('handles empty submissions list', () => {
    const dashboard = KuwaitASHALService.generateReconciliationDashboard('tenant-A', '2026-06', []);

    expect(dashboard.summary.totalSubmissions).toBe(0);
    expect(dashboard.averageProcessingDays).toBe(0);
  });
});

describe('KuwaitASHALService.create', () => {
  it('returns a constructed service instance', () => {
    const service = KuwaitASHALService.create(baseConfig);
    expect(service).toBeInstanceOf(KuwaitASHALService);
  });
});
