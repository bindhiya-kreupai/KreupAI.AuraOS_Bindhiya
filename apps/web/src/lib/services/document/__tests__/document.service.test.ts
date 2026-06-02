/**
 * DocumentService — unit tests against the actual API.
 * Targets `src/lib/services/document.service.ts`.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@aura/database', () => {
  const make = () => ({
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    updateMany: vi.fn(),
  });
  return {
    prisma: {
      employeeDocument: make(),
    },
  };
});

import { DocumentService } from '../../document.service';
import { prisma } from '@aura/database';

const TENANT_A = 'tenant-A';
const TENANT_B = 'tenant-B';

const baseDoc: any = {
  id: 'doc-1',
  tenantId: TENANT_A,
  employeeId: 'emp-1',
  category: 'PASSPORT',
  documentName: 'Passport',
  fileName: 'passport.pdf',
  documentNumber: 'P12345',
  fileUrl: 'https://storage/passport.pdf',
  expiryDate: new Date('2030-12-31'),
  isVerified: false,
  isExpired: false,
  status: 'ACTIVE',
  version: 1,
};

describe('DocumentService.findAll', () => {
  beforeEach(() => vi.clearAllMocks());

  it('filters by tenant + employee + category + paginates', async () => {
    (prisma.employeeDocument.count as any).mockResolvedValue(2);
    (prisma.employeeDocument.findMany as any).mockResolvedValue([baseDoc]);

    const result = await DocumentService.findAll({
      tenantId: TENANT_A,
      employeeId: 'emp-1',
      category: 'PASSPORT',
      page: 1,
      limit: 10,
    });

    const where = (prisma.employeeDocument.findMany as any).mock.calls[0][0].where;
    expect(where.tenantId).toBe(TENANT_A);
    expect(where.employeeId).toBe('emp-1');
    expect(where.category).toBe('PASSPORT');
    expect(where.status).toBe('ACTIVE');
    expect(result.pagination.total).toBe(2);
  });

  it('builds OR search clause', async () => {
    (prisma.employeeDocument.count as any).mockResolvedValue(0);
    (prisma.employeeDocument.findMany as any).mockResolvedValue([]);

    await DocumentService.findAll({
      tenantId: TENANT_A,
      search: 'passport',
    });

    const where = (prisma.employeeDocument.findMany as any).mock.calls[0][0].where;
    expect(where.OR).toHaveLength(3);
  });

  it('honors expiringIn window filter', async () => {
    (prisma.employeeDocument.count as any).mockResolvedValue(0);
    (prisma.employeeDocument.findMany as any).mockResolvedValue([]);

    await DocumentService.findAll({
      tenantId: TENANT_A,
      expiringIn: 60,
    });

    const where = (prisma.employeeDocument.findMany as any).mock.calls[0][0].where;
    expect(where.expiryDate.lte).toBeInstanceOf(Date);
    expect(where.expiryDate.gte).toBeInstanceOf(Date);
    expect(where.isExpired).toBe(false);
  });
});

describe('DocumentService.findById — tenant isolation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('scopes by tenantId + id', async () => {
    (prisma.employeeDocument.findFirst as any).mockResolvedValue(baseDoc);

    await DocumentService.findById('doc-1', TENANT_A);

    expect(prisma.employeeDocument.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'doc-1', tenantId: TENANT_A } })
    );
  });

  it('throws when another tenant tries to read', async () => {
    (prisma.employeeDocument.findFirst as any).mockResolvedValue(null);

    await expect(DocumentService.findById('doc-1', TENANT_B)).rejects.toThrow('Document not found');
  });
});

describe('DocumentService.verify', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sets isVerified flag and verifiedBy', async () => {
    (prisma.employeeDocument.findFirst as any).mockResolvedValue(baseDoc);
    (prisma.employeeDocument.update as any).mockResolvedValue({});

    await DocumentService.verify('doc-1', TENANT_A, 'verifier-1');

    const updateData = (prisma.employeeDocument.update as any).mock.calls[0][0].data;
    expect(updateData.isVerified).toBe(true);
    expect(updateData.verifiedBy).toBe('verifier-1');
    expect(updateData.verifiedAt).toBeInstanceOf(Date);
  });

  it('throws when document not found', async () => {
    (prisma.employeeDocument.findFirst as any).mockResolvedValue(null);

    await expect(
      DocumentService.verify('missing', TENANT_A, 'verifier-1')
    ).rejects.toThrow('Document not found');
  });
});

describe('DocumentService.delete — soft delete', () => {
  beforeEach(() => vi.clearAllMocks());

  it('throws when document not found', async () => {
    (prisma.employeeDocument.findFirst as any).mockResolvedValue(null);

    await expect(
      DocumentService.delete('missing', TENANT_A)
    ).rejects.toThrow('Document not found');
  });

  it('soft-deletes (status=DELETED) when found', async () => {
    (prisma.employeeDocument.findFirst as any).mockResolvedValue(baseDoc);
    (prisma.employeeDocument.update as any).mockResolvedValue({});

    const result = await DocumentService.delete('doc-1', TENANT_A);

    expect(prisma.employeeDocument.delete).not.toHaveBeenCalled();
    const updateCall = (prisma.employeeDocument.update as any).mock.calls[0][0];
    expect(updateCall.data.status).toBe('DELETED');
    expect(result).toEqual({ success: true });
  });
});

describe('DocumentService.getExpiringDocuments', () => {
  beforeEach(() => vi.clearAllMocks());

  it('queries documents expiring within N days', async () => {
    (prisma.employeeDocument.findMany as any).mockResolvedValue([baseDoc]);

    await DocumentService.getExpiringDocuments(TENANT_A, 30);

    const call = (prisma.employeeDocument.findMany as any).mock.calls[0][0];
    expect(call.where.tenantId).toBe(TENANT_A);
    expect(call.where.expiryDate.lte).toBeInstanceOf(Date);
    expect(call.where.isExpired).toBe(false);
    expect(call.where.status).toBe('ACTIVE');
  });

  it('defaults to 30-day window when not specified', async () => {
    (prisma.employeeDocument.findMany as any).mockResolvedValue([]);

    await DocumentService.getExpiringDocuments(TENANT_A);

    expect(prisma.employeeDocument.findMany).toHaveBeenCalled();
  });
});

describe('DocumentService.getByCategory', () => {
  beforeEach(() => vi.clearAllMocks());

  it('filters by tenant + category + status=ACTIVE', async () => {
    (prisma.employeeDocument.findMany as any).mockResolvedValue([baseDoc]);

    await DocumentService.getByCategory(TENANT_A, 'PASSPORT');

    const where = (prisma.employeeDocument.findMany as any).mock.calls[0][0].where;
    expect(where.tenantId).toBe(TENANT_A);
    expect(where.category).toBe('PASSPORT');
    expect(where.status).toBe('ACTIVE');
  });
});

describe('DocumentService.updateExpiredFlags', () => {
  beforeEach(() => vi.clearAllMocks());

  it('flips isExpired=true for docs past expiryDate', async () => {
    (prisma.employeeDocument.updateMany as any).mockResolvedValue({ count: 3 });

    await DocumentService.updateExpiredFlags(TENANT_A);

    const call = (prisma.employeeDocument.updateMany as any).mock.calls[0][0];
    expect(call.where.tenantId).toBe(TENANT_A);
    expect(call.where.expiryDate.lt).toBeInstanceOf(Date);
    expect(call.where.isExpired).toBe(false);
    expect(call.data.isExpired).toBe(true);
  });
});
