/**
 * AssetService — unit tests against the actual API.
 * Targets `src/lib/services/asset.service.ts`.
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
  const mockPrisma = {
    asset: make(),
    assetAssignment: make(),
    assetMaintenance: make(),
  };
  // asset.service.ts does `new PrismaClient()` at module load. The mock
  // needs to be a constructable class, not a plain function.
  return {
    prisma: mockPrisma,
    PrismaClient: class {
      constructor() {
        Object.assign(this, mockPrisma);
      }
    },
  };
});

import { AssetService } from '../asset.service';
import { prisma } from '@aura/database';

const TENANT_A = 'tenant-A';
const TENANT_B = 'tenant-B';

const baseAsset: any = {
  id: 'asset-1',
  tenantId: TENANT_A,
  assetCode: 'LAPTOP-001',
  assetName: 'MacBook Pro 16',
  category: 'LAPTOP',
  status: 'AVAILABLE',
  condition: 'EXCELLENT',
  locationId: 'loc-1',
  serialNumber: 'C02XX12345',
  purchaseDate: new Date('2024-01-15'),
  purchasePrice: 3000,
  warrantyExpiryDate: new Date('2027-01-15'),
};

describe('AssetService.findAll', () => {
  beforeEach(() => vi.clearAllMocks());

  it('filters by tenant + category + status + locationId', async () => {
    (prisma.asset.count as any).mockResolvedValue(0);
    (prisma.asset.findMany as any).mockResolvedValue([]);

    await AssetService.findAll({
      tenantId: TENANT_A,
      category: 'LAPTOP',
      status: 'AVAILABLE',
      locationId: 'loc-1',
    });

    const where = (prisma.asset.findMany as any).mock.calls[0][0].where;
    expect(where.tenantId).toBe(TENANT_A);
    expect(where.category).toBe('LAPTOP');
    expect(where.status).toBe('AVAILABLE');
    expect(where.locationId).toBe('loc-1');
  });

  it('builds a 4-field OR clause for search', async () => {
    (prisma.asset.count as any).mockResolvedValue(0);
    (prisma.asset.findMany as any).mockResolvedValue([]);

    await AssetService.findAll({
      tenantId: TENANT_A,
      search: 'macbook',
    });

    const where = (prisma.asset.findMany as any).mock.calls[0][0].where;
    expect(where.OR).toHaveLength(4);
    expect(where.OR.map((c: any) => Object.keys(c)[0])).toEqual([
      'assetCode',
      'assetName',
      'serialNumber',
      'description',
    ]);
  });

  it('paginates correctly', async () => {
    (prisma.asset.count as any).mockResolvedValue(45);
    (prisma.asset.findMany as any).mockResolvedValue([]);

    const result = await AssetService.findAll({
      tenantId: TENANT_A,
      page: 2,
      limit: 10,
    });

    expect(result.pagination.total).toBe(45);
    expect(result.pagination.totalPages).toBe(5);
    expect(prisma.asset.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    );
  });
});

describe('AssetService.findById — tenant isolation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('scopes by tenantId + id', async () => {
    (prisma.asset.findFirst as any).mockResolvedValue(baseAsset);

    await AssetService.findById('asset-1', TENANT_A);

    expect(prisma.asset.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'asset-1', tenantId: TENANT_A } })
    );
  });

  it('returns null when tenant mismatch', async () => {
    (prisma.asset.findFirst as any).mockResolvedValue(null);

    const result = await AssetService.findById('asset-1', TENANT_B);

    expect(result).toBeNull();
  });
});

describe('AssetService.create', () => {
  beforeEach(() => vi.clearAllMocks());

  const dto = {
    tenantId: TENANT_A,
    assetCode: 'LAPTOP-001',
    assetName: 'MacBook Pro 16',
    category: 'COMPUTER',
    status: 'AVAILABLE',
    condition: 'EXCELLENT',
    locationId: 'loc-1',
  };

  it('refuses when asset code already exists', async () => {
    (prisma.asset.findUnique as any).mockResolvedValue(baseAsset);

    await expect(AssetService.create(dto as any)).rejects.toThrow();
    expect(prisma.asset.create).not.toHaveBeenCalled();
  });

  it('rejects invalid DTO via zod', async () => {
    await expect(AssetService.create({} as any)).rejects.toThrow();
    expect(prisma.asset.create).not.toHaveBeenCalled();
  });
});

describe('AssetService.getAssignmentHistory', () => {
  beforeEach(() => vi.clearAllMocks());

  it('queries assignments for the asset, scoped by tenant', async () => {
    (prisma.assetAssignment.findMany as any).mockResolvedValue([]);

    await AssetService.getAssignmentHistory('asset-1', TENANT_A);

    const where = (prisma.assetAssignment.findMany as any).mock.calls[0][0].where;
    expect(where.assetId).toBe('asset-1');
    expect(where.tenantId).toBe(TENANT_A);
  });
});
