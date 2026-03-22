/**
 * @file AuditService Unit Tests
 * @description Verifies PostgreSQL persistence, field mapping, tenant scoping,
 *              search/pagination, resource trails, compliance reports, and cleanup lifecycle.
 * @gate Gate 2A criterion 12
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditService, AuditAction, AuditSeverity } from '../audit.service';

// ── Mocks ────────────────────────────────────────────────────────────────────

// Mock Prisma
const mockAuditLog = {
  create: vi.fn(),
  findMany: vi.fn(),
  count: vi.fn(),
  groupBy: vi.fn(),
  deleteMany: vi.fn(),
};

const mockAuditLogArchive = {
  createMany: vi.fn(),
};

const mockTransaction = vi.fn((fn: any) =>
  fn({
    auditLogArchive: mockAuditLogArchive,
    auditLog: { deleteMany: mockAuditLog.deleteMany },
  })
);

vi.mock('@aura/database', () => ({
  prisma: {
    auditLog: {
      create: (...args: any[]) => mockAuditLog.create(...args),
      findMany: (...args: any[]) => mockAuditLog.findMany(...args),
      count: (...args: any[]) => mockAuditLog.count(...args),
      groupBy: (...args: any[]) => mockAuditLog.groupBy(...args),
      deleteMany: (...args: any[]) => mockAuditLog.deleteMany(...args),
    },
    auditLogArchive: {
      createMany: (...args: any[]) => mockAuditLogArchive.createMany(...args),
    },
    $transaction: (...args: any[]) => mockTransaction(...args),
  },
}));

// Mock Redis
vi.mock('../../cache/redis', () => ({
  redis: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
  },
}));

// Mock Logger
vi.mock('../../logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

function baseEntry() {
  return {
    action: AuditAction.EMPLOYEE_CREATED,
    severity: AuditSeverity.LOW,
    userId: 'user-1',
    userEmail: 'user@example.com',
    tenantId: 'tenant-1',
    companyId: 'company-1',
    resourceType: 'employee',
    resourceId: 'emp-123',
    success: true,
  };
}

function mockPrismaRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'audit-id-1',
    tenantId: 'tenant-1',
    companyId: 'company-1',
    userId: 'user-1',
    userEmail: 'user@example.com',
    action: 'EMPLOYEE_CREATED',
    severity: 'LOW',
    resourceType: 'employee',
    resourceId: 'emp-123',
    entityType: 'employee',
    entityId: 'emp-123',
    success: true,
    errorMessage: null,
    beforeValues: null,
    afterValues: null,
    ipAddress: null,
    userAgent: null,
    metadata: null,
    timestamp: new Date('2026-03-22T12:00:00Z'),
    createdBy: null,
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuditService();
    mockAuditLog.create.mockResolvedValue({ id: 'audit-id-1' });
  });

  // ── 1. PostgreSQL Persistence ───────────────────────────────────────────

  describe('log()', () => {
    it('persists audit entry to PostgreSQL via prisma.auditLog.create', async () => {
      const entry = baseEntry();
      const id = await service.log(entry);

      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(mockAuditLog.create).toHaveBeenCalledTimes(1);

      const createCall = mockAuditLog.create.mock.calls[0][0];
      expect(createCall.data).toMatchObject({
        tenantId: 'tenant-1',
        companyId: 'company-1',
        userId: 'user-1',
        userEmail: 'user@example.com',
        action: AuditAction.EMPLOYEE_CREATED,
        resourceType: 'employee',
        resourceId: 'emp-123',
        success: true,
      });
    });

    it('maps fields correctly to Prisma schema columns', async () => {
      const entry = {
        ...baseEntry(),
        changes: { before: { name: 'Old' }, after: { name: 'New' } },
        metadata: { ipAddress: '10.0.0.1', userAgent: 'Test/1.0' },
      };

      await service.log(entry);

      const data = mockAuditLog.create.mock.calls[0][0].data;
      expect(data.beforeValues).toEqual({ name: 'Old' });
      expect(data.afterValues).toEqual({ name: 'New' });
      expect(data.ipAddress).toBe('10.0.0.1');
      expect(data.userAgent).toBe('Test/1.0');
      expect(data.metadata).toMatchObject({ ipAddress: '10.0.0.1', userAgent: 'Test/1.0' });
    });

    it('writes backward-compatible entityType and entityId fields', async () => {
      await service.log(baseEntry());

      const data = mockAuditLog.create.mock.calls[0][0].data;
      expect(data.entityType).toBe('employee');
      expect(data.entityId).toBe('emp-123');
    });

    it('handles null optional fields gracefully', async () => {
      const entry = {
        action: AuditAction.USER_LOGIN,
        severity: AuditSeverity.MEDIUM,
        userId: 'user-1',
        userEmail: 'user@example.com',
        tenantId: 'tenant-1',
        companyId: '',
        resourceType: 'authentication',
        success: true,
      };

      await service.log(entry);

      const data = mockAuditLog.create.mock.calls[0][0].data;
      expect(data.resourceId).toBeNull();
      expect(data.errorMessage).toBeNull();
      expect(data.entityId).toBeNull();
    });

    it('records failure with success=false and errorMessage', async () => {
      const entry = {
        ...baseEntry(),
        success: false,
        errorMessage: 'Duplicate employee code',
      };

      await service.log(entry);

      const data = mockAuditLog.create.mock.calls[0][0].data;
      expect(data.success).toBe(false);
      expect(data.errorMessage).toBe('Duplicate employee code');
    });

    it('generates a timestamp on every log call', async () => {
      await service.log(baseEntry());

      const data = mockAuditLog.create.mock.calls[0][0].data;
      expect(data.timestamp).toBeInstanceOf(Date);
    });

    it('does not break when Redis fails (fire-and-forget)', async () => {
      const { redis } = await import('../../cache/redis');
      (redis.get as any).mockRejectedValueOnce(new Error('Redis down'));

      const id = await service.log(baseEntry());
      expect(id).toBeDefined();
      expect(mockAuditLog.create).toHaveBeenCalledTimes(1);
    });
  });

  // ── 2. Domain-Specific Loggers ──────────────────────────────────────────

  describe('logEmployeeAction()', () => {
    it('sets resourceType to employee and derives severity', async () => {
      await service.logEmployeeAction(AuditAction.EMPLOYEE_DELETED, {
        userId: 'u1',
        userEmail: 'u1@test.com',
        tenantId: 't1',
        companyId: 'c1',
        employeeId: 'e1',
      });

      const data = mockAuditLog.create.mock.calls[0][0].data;
      expect(data.resourceType).toBe('employee');
      expect(data.resourceId).toBe('e1');
      // EMPLOYEE_DELETED is in criticalActions → CRITICAL
      expect(data.severity).toBe(AuditSeverity.CRITICAL);
    });
  });

  describe('logAuthAction()', () => {
    it('sets severity HIGH for failed auth, MEDIUM for success', async () => {
      await service.logAuthAction(AuditAction.USER_LOGIN, {
        userId: 'u1',
        userEmail: 'u@test.com',
        tenantId: 't1',
        companyId: 'c1',
        success: false,
        errorMessage: 'Invalid password',
      });

      const data = mockAuditLog.create.mock.calls[0][0].data;
      expect(data.severity).toBe(AuditSeverity.HIGH);
      expect(data.success).toBe(false);
      expect(data.errorMessage).toBe('Invalid password');
    });
  });

  // ── 3. Search & Pagination ──────────────────────────────────────────────

  describe('search()', () => {
    it('returns paginated results in shared list response shape', async () => {
      const rows = [mockPrismaRow(), mockPrismaRow({ id: 'audit-id-2' })];
      mockAuditLog.findMany.mockResolvedValue(rows);
      mockAuditLog.count.mockResolvedValue(50);

      const result = await service.search({ tenantId: 'tenant-1', page: 1, limit: 20 });

      expect(result).toMatchObject({
        items: expect.any(Array),
        total: 50,
        page: 1,
        pageSize: 20,
        hasNextPage: true,
      });
      expect(result.items).toHaveLength(2);
    });

    it('scopes all queries by tenantId', async () => {
      mockAuditLog.findMany.mockResolvedValue([]);
      mockAuditLog.count.mockResolvedValue(0);

      await service.search({ tenantId: 'tenant-xyz' });

      const findManyCall = mockAuditLog.findMany.mock.calls[0][0];
      expect(findManyCall.where.tenantId).toBe('tenant-xyz');

      const countCall = mockAuditLog.count.mock.calls[0][0];
      expect(countCall.where.tenantId).toBe('tenant-xyz');
    });

    it('applies date range filters correctly', async () => {
      mockAuditLog.findMany.mockResolvedValue([]);
      mockAuditLog.count.mockResolvedValue(0);

      await service.search({
        tenantId: 'tenant-1',
        startDate: '2026-01-01',
        endDate: '2026-03-31',
      });

      const where = mockAuditLog.findMany.mock.calls[0][0].where;
      expect(where.timestamp.gte).toEqual(new Date('2026-01-01'));
      expect(where.timestamp.lte).toEqual(new Date('2026-03-31'));
    });

    it('returns hasNextPage=false on last page', async () => {
      mockAuditLog.findMany.mockResolvedValue([mockPrismaRow()]);
      mockAuditLog.count.mockResolvedValue(1);

      const result = await service.search({ tenantId: 'tenant-1', page: 1, limit: 20 });
      expect(result.hasNextPage).toBe(false);
    });
  });

  // ── 4. Resource Audit Trail ─────────────────────────────────────────────

  describe('getResourceAuditTrail()', () => {
    it('queries by tenantId + resourceType + resourceId', async () => {
      mockAuditLog.findMany.mockResolvedValue([mockPrismaRow()]);

      const trail = await service.getResourceAuditTrail('tenant-1', 'employee', 'emp-123');

      expect(trail).toHaveLength(1);
      const call = mockAuditLog.findMany.mock.calls[0][0];
      expect(call.where).toMatchObject({
        tenantId: 'tenant-1',
        resourceType: 'employee',
        resourceId: 'emp-123',
      });
      expect(call.orderBy).toEqual({ timestamp: 'desc' });
    });

    it('defaults to limit 50', async () => {
      mockAuditLog.findMany.mockResolvedValue([]);
      await service.getResourceAuditTrail('t1', 'employee', 'e1');

      const call = mockAuditLog.findMany.mock.calls[0][0];
      expect(call.take).toBe(50);
    });
  });

  // ── 5. User Activity ───────────────────────────────────────────────────

  describe('getUserActivity()', () => {
    it('queries by tenantId + userId', async () => {
      mockAuditLog.findMany.mockResolvedValue([mockPrismaRow()]);

      const result = await service.getUserActivity('tenant-1', 'user-1');

      expect(result).toHaveLength(1);
      const call = mockAuditLog.findMany.mock.calls[0][0];
      expect(call.where.tenantId).toBe('tenant-1');
      expect(call.where.userId).toBe('user-1');
    });

    it('applies optional date range', async () => {
      mockAuditLog.findMany.mockResolvedValue([]);

      await service.getUserActivity('t1', 'u1', {
        startDate: '2026-01-01',
        endDate: '2026-03-31',
      });

      const where = mockAuditLog.findMany.mock.calls[0][0].where;
      expect(where.timestamp.gte).toEqual(new Date('2026-01-01'));
      expect(where.timestamp.lte).toEqual(new Date('2026-03-31'));
    });
  });

  // ── 6. Compliance Report ───────────────────────────────────────────────

  describe('generateComplianceReport()', () => {
    it('returns aggregated data with real counts', async () => {
      mockAuditLog.count
        .mockResolvedValueOnce(100) // totalActions
        .mockResolvedValueOnce(5);  // failedActions

      mockAuditLog.groupBy
        .mockResolvedValueOnce([
          { action: 'EMPLOYEE_CREATED', _count: { action: 40 } },
          { action: 'USER_LOGIN', _count: { action: 60 } },
        ])
        .mockResolvedValueOnce([
          { severity: 'LOW', _count: { severity: 70 } },
          { severity: 'HIGH', _count: { severity: 30 } },
        ])
        .mockResolvedValueOnce([
          { userId: 'u1', userEmail: 'u1@test.com', _count: { userId: 50 } },
          { userId: 'u2', userEmail: 'u2@test.com', _count: { userId: 30 } },
        ]);

      const report = await service.generateComplianceReport(
        'tenant-1',
        '2026-01-01',
        '2026-03-31'
      );

      expect(report.totalActions).toBe(100);
      expect(report.failedActions).toBe(5);
      expect(report.actionsByType).toEqual({
        EMPLOYEE_CREATED: 40,
        USER_LOGIN: 60,
      });
      expect(report.actionsBySeverity).toEqual({
        LOW: 70,
        HIGH: 30,
      });
      expect(report.topUsers).toHaveLength(2);
      expect(report.topUsers[0]).toMatchObject({
        userId: 'u1',
        userEmail: 'u1@test.com',
        actionCount: 50,
      });
    });

    it('scopes compliance report by tenantId and date range', async () => {
      mockAuditLog.count.mockResolvedValue(0);
      mockAuditLog.groupBy.mockResolvedValue([]);

      await service.generateComplianceReport('tenant-abc', '2026-01-01', '2026-03-31');

      // All 5 parallel calls should include tenant and date filter
      for (const call of mockAuditLog.count.mock.calls) {
        expect(call[0].where.tenantId).toBe('tenant-abc');
        expect(call[0].where.timestamp.gte).toEqual(new Date('2026-01-01'));
      }
    });
  });

  // ── 7. Cleanup Lifecycle ───────────────────────────────────────────────

  describe('cleanup()', () => {
    it('archives records to AuditLogArchive before deleting', async () => {
      const oldRows = [
        mockPrismaRow({ id: 'old-1' }),
        mockPrismaRow({ id: 'old-2' }),
      ];
      mockAuditLog.findMany.mockResolvedValue(oldRows);
      mockAuditLogArchive.createMany.mockResolvedValue({ count: 2 });
      mockAuditLog.deleteMany.mockResolvedValue({ count: 2 });

      const count = await service.cleanup();

      expect(count).toBe(2);
      expect(mockAuditLogArchive.createMany).toHaveBeenCalledTimes(1);
      expect(mockAuditLog.deleteMany).toHaveBeenCalledTimes(1);

      // Verify archive data matches source
      const archiveData = mockAuditLogArchive.createMany.mock.calls[0][0].data;
      expect(archiveData).toHaveLength(2);
      expect(archiveData[0].id).toBe('old-1');

      // Verify delete targets the same IDs
      const deleteWhere = mockAuditLog.deleteMany.mock.calls[0][0].where;
      expect(deleteWhere.id.in).toEqual(['old-1', 'old-2']);
    });

    it('runs archive and delete in a transaction', async () => {
      mockAuditLog.findMany.mockResolvedValue([mockPrismaRow()]);
      mockAuditLogArchive.createMany.mockResolvedValue({ count: 1 });
      mockAuditLog.deleteMany.mockResolvedValue({ count: 1 });

      await service.cleanup();

      expect(mockTransaction).toHaveBeenCalledTimes(1);
    });

    it('returns 0 when no records to archive', async () => {
      mockAuditLog.findMany.mockResolvedValue([]);

      const count = await service.cleanup();
      expect(count).toBe(0);
      expect(mockTransaction).not.toHaveBeenCalled();
    });
  });

  // ── 8. Field Mapping ───────────────────────────────────────────────────

  describe('mapRowToEntry (via search)', () => {
    it('maps Prisma row fields to AuditLogEntry interface', async () => {
      const row = mockPrismaRow({
        beforeValues: { salary: 50000 },
        afterValues: { salary: 60000 },
        ipAddress: '10.0.0.1',
        userAgent: 'Chrome/120',
        metadata: { location: 'HQ' },
      });
      mockAuditLog.findMany.mockResolvedValue([row]);
      mockAuditLog.count.mockResolvedValue(1);

      const result = await service.search({ tenantId: 'tenant-1' });
      const entry = result.items[0];

      expect(entry.id).toBe('audit-id-1');
      expect(entry.action).toBe(AuditAction.EMPLOYEE_CREATED);
      expect(entry.severity).toBe(AuditSeverity.LOW);
      expect(entry.tenantId).toBe('tenant-1');
      expect(entry.resourceType).toBe('employee');
      expect(entry.resourceId).toBe('emp-123');
      expect(entry.changes?.before).toEqual({ salary: 50000 });
      expect(entry.changes?.after).toEqual({ salary: 60000 });
      expect(entry.metadata?.ipAddress).toBe('10.0.0.1');
      expect(entry.metadata?.userAgent).toBe('Chrome/120');
      expect(entry.metadata?.location).toBe('HQ');
      expect(entry.timestamp).toBe('2026-03-22T12:00:00.000Z');
      expect(entry.success).toBe(true);
    });

    it('falls back to entityType/entityId when resourceType/resourceId null', async () => {
      const row = mockPrismaRow({
        resourceType: null,
        resourceId: null,
        entityType: 'payroll',
        entityId: 'pr-456',
      });
      mockAuditLog.findMany.mockResolvedValue([row]);
      mockAuditLog.count.mockResolvedValue(1);

      const result = await service.search({ tenantId: 'tenant-1' });
      const entry = result.items[0];

      expect(entry.resourceType).toBe('payroll');
      expect(entry.resourceId).toBe('pr-456');
    });
  });
});
