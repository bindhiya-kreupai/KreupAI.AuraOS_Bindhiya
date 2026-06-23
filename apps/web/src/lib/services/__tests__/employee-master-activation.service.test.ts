import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import { employeeMasterActivationService } from '../employee-master-activation.service';

const prismaMock = prisma as any;

const masterData = {
  identity: {
    firstName: 'Sara',
    lastName: 'Al Mansoori',
    email: 'sara.al.mansoori@example.com',
    nationality: 'AE',
    isLocalNational: true,
    identifiers: [{ type: 'EMIRATES_ID', value: '784-1990-1234567-1', isPrimary: true }],
  },
  job: {
    companyId: 'company-1',
    departmentId: 'dept-1',
    locationId: 'loc-1',
    jobProfileId: 'job-1',
    gradeId: 'grade-1',
    typeId: 'type-1',
    joiningDate: '2026-06-01T00:00:00.000Z',
  },
  contract: {
    contractType: 'INDEFINITE',
    contractStartDate: '2026-06-01T00:00:00.000Z',
  },
  compliance: {
    countryCode: 'AE',
    bankName: 'Emirates Bank',
    bankAccountNumber: '123456789',
    bankIBAN: 'AE070331234567890123456',
    bankRoutingCode: '033',
    labourCardNumber: 'LC-12345',
    emiratesId: '784-1990-1234567-1',
    socialInsuranceEligible: true,
  },
  compensation: {
    basicSalary: 20000,
    houseRentAllowance: 5000,
    transportAllowance: 1000,
    otherAllowances: [],
    grossSalary: 30000,
    ctc: 360000,
    payFrequency: 'MONTHLY',
  },
};

const submittedDraft = {
  id: 'draft-1',
  tenantId: 'tenant-1',
  status: 'SUBMITTED',
  masterData,
  validationSnapshot: { valid: true, missing: [] },
  duplicateSnapshot: { blocking: [] },
  createdBy: 'maker-1',
  submittedBy: 'maker-1',
};

describe('EmployeeMasterActivationService', () => {
  beforeEach(() => {
    prismaMock.$transaction = vi.fn(async (callback: any) => callback(prismaMock));
    prismaMock.company = {
      findFirst: vi
        .fn()
        .mockResolvedValue({ id: 'company-1', tenantId: 'tenant-1', code: 'UAEHQ' }),
    };
    prismaMock.employeeMasterDataDraft = {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(submittedDraft),
      create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'draft-1', ...data })),
      update: vi.fn().mockImplementation(async ({ data }: any) => ({
        ...submittedDraft,
        ...data,
      })),
    };
    prismaMock.employeeIdentification = {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'ident-1', ...data })),
    };
    prismaMock.employeeComplianceDetails = {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 'compliance-1' }),
    };
    prismaMock.employeeDocument = {
      findFirst: vi.fn().mockResolvedValue(null),
    };
    prismaMock.employee = {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'emp-1', ...data })),
    };
    prismaMock.employeeStatus = {
      findFirst: vi.fn().mockResolvedValue({ id: 'status-active', code: 'ACTIVE' }),
    };
    prismaMock.employeeSalaryStructure = {
      create: vi.fn().mockResolvedValue({ id: 'salary-1' }),
    };
    prismaMock.employeeNumberSequence = {
      upsert: vi.fn().mockResolvedValue({
        id: 'seq-1',
        tenantId: 'tenant-1',
        companyId: 'company-1',
        prefix: 'UAEHQ',
        nextNumber: 7,
        padding: 5,
      }),
      update: vi.fn().mockResolvedValue({ id: 'seq-1', nextNumber: 8 }),
    };
    prismaMock.employeeLifecycleEvent = {
      create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'event-1', ...data })),
    };
    prismaMock.auditLog = {
      create: vi.fn().mockResolvedValue({ id: 'audit-1' }),
    };
  });

  it('stores missing country-mandatory fields in the draft validation snapshot', async () => {
    const incomplete = {
      ...masterData,
      identity: { ...masterData.identity, identifiers: [] },
      compliance: { ...masterData.compliance, bankIBAN: null, emiratesId: null },
    };

    const draft = await employeeMasterActivationService.createDraft(incomplete, {
      tenantId: 'tenant-1',
      userId: 'maker-1',
    });

    expect(draft.validationSnapshot.missing).toContain('compliance.bankIBAN');
    expect(draft.validationSnapshot.missing).toContain('identity.identifiers.EMIRATES_ID');
    expect(draft.validationSnapshot.valid).toBe(false);
  });

  it('rejects maker-checker approval by the preparer', async () => {
    await expect(
      employeeMasterActivationService.approve('draft-1', {
        tenantId: 'tenant-1',
        userId: 'maker-1',
      })
    ).rejects.toThrow('approver must be different');
  });

  it('blocks submission when a duplicate active identifier exists', async () => {
    prismaMock.employeeMasterDataDraft.findFirst.mockResolvedValue({
      ...submittedDraft,
      status: 'DRAFT',
    });
    prismaMock.employeeIdentification.findFirst.mockResolvedValue({
      id: 'ident-existing',
      employeeId: 'emp-existing',
    });

    await expect(
      employeeMasterActivationService.submit('draft-1', {
        tenantId: 'tenant-1',
        userId: 'maker-1',
      })
    ).rejects.toThrow('Duplicate employee identifier found');
  });

  it('activates an approved draft, generates the employee number, creates master records, and emits employee.activated', async () => {
    prismaMock.employeeMasterDataDraft.findFirst.mockResolvedValue({
      ...submittedDraft,
      status: 'APPROVED',
      approvedBy: 'checker-1',
      approvedAt: new Date('2026-06-01T00:00:00.000Z'),
    });

    const result = await employeeMasterActivationService.activate('draft-1', {
      tenantId: 'tenant-1',
      userId: 'checker-1',
    });

    expect(result.employee).toMatchObject({
      id: 'emp-1',
      employeeCode: 'UAEHQ00007',
      firstName: 'Sara',
      statusId: 'status-active',
    });
    expect(prismaMock.employeeComplianceDetails.create).toHaveBeenCalled();
    expect(prismaMock.employeeSalaryStructure.create).toHaveBeenCalled();
    expect(prismaMock.employeeIdentification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          employeeId: 'emp-1',
          identifierType: 'EMIRATES_ID',
        }),
      })
    );
    expect(prismaMock.employeeLifecycleEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          employeeId: 'emp-1',
          eventType: 'employee.activated',
          status: 'PENDING',
        }),
      })
    );
    expect(prismaMock.auditLog.create).toHaveBeenCalled();
  });
});
