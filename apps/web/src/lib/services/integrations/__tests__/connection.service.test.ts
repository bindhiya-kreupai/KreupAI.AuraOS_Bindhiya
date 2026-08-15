import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IntegrationConnectionService } from '../connection.service';

const mockDb: Record<string, any[]> = {
  integrationConnection: [],
  integrationSyncJob: [],
  integrationLog: [],
  webhook: [],
};

vi.mock('@aura/database', () => ({
  prisma: {
    integrationConnection: {
      findUnique: vi.fn(({ where }: any) => {
        const row = mockDb.integrationConnection.find((r) => r.id === where.id);
        return Promise.resolve(row ?? null);
      }),
      findMany: vi.fn(({ where }: any) => {
        let rows = [...mockDb.integrationConnection];
        if (where?.tenantId) rows = rows.filter((r) => r.tenantId === where.tenantId);
        if (where?.status) rows = rows.filter((r) => r.status === where.status);
        if (where?.isDeleted !== undefined)
          rows = rows.filter((r) => r.isDeleted === where.isDeleted);
        return Promise.resolve(rows);
      }),
      create: vi.fn(({ data }: any) => {
        const row = {
          id: `conn_${Date.now()}`,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
        };
        mockDb.integrationConnection.push(row);
        return Promise.resolve(row);
      }),
      update: vi.fn(({ where, data }: any) => {
        const idx = mockDb.integrationConnection.findIndex((r) => r.id === where.id);
        if (idx === -1) throw new Error('Record not found');
        mockDb.integrationConnection[idx] = {
          ...mockDb.integrationConnection[idx],
          ...data,
          updatedAt: new Date(),
        };
        return Promise.resolve(mockDb.integrationConnection[idx]);
      }),
      upsert: vi.fn(({ create, update }: any) => {
        const existing = mockDb.integrationConnection.find(
          (r) => r.tenantId === create.tenantId && r.integrationId === create.integrationId
        );
        if (existing) {
          Object.assign(existing, update, { updatedAt: new Date() });
          return Promise.resolve(existing);
        }
        const row = {
          id: `conn_${Date.now()}`,
          ...create,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
        };
        mockDb.integrationConnection.push(row);
        return Promise.resolve(row);
      }),
    },
    integrationSyncJob: {
      findUnique: vi.fn(() => Promise.resolve(null)),
      findMany: vi.fn(() => Promise.resolve([])),
      create: vi.fn(({ data }: any) => {
        const row = {
          id: `sync_${Date.now()}`,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
          progress: 0,
          recordsProcessed: 0,
          recordsCreated: 0,
          recordsUpdated: 0,
          recordsFailed: 0,
        };
        mockDb.integrationSyncJob.push(row);
        return Promise.resolve(row);
      }),
    },
    integrationLog: {
      findMany: vi.fn(() => Promise.resolve([])),
      create: vi.fn(({ data }: any) => {
        const row = {
          id: `log_${Date.now()}`,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
        };
        mockDb.integrationLog.push(row);
        return Promise.resolve(row);
      }),
    },
    webhook: {
      findUnique: vi.fn(() => Promise.resolve(null)),
      findMany: vi.fn(() => Promise.resolve([])),
      create: vi.fn(({ data }: any) => {
        const row = {
          id: `wh_${Date.now()}`,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
        };
        mockDb.webhook.push(row);
        return Promise.resolve(row);
      }),
    },
  },
  Prisma: {
    DbNull: 'DbNull',
  },
}));

beforeEach(() => {
  Object.values(mockDb).forEach((arr) => arr.splice(0));
});

describe('IntegrationConnectionService.connectIntegration', () => {
  it('throws when integration not found', async () => {
    await expect(
      IntegrationConnectionService.connectIntegration(
        'tenant-1',
        'int_nonexistent',
        {},
        {},
        'user-1'
      )
    ).rejects.toThrow(/not found/);
  });

  it('connects a real integration from the registry', async () => {
    const conn = await IntegrationConnectionService.connectIntegration(
      'tenant-1',
      'int_sap_hcm',
      { companyId: 'CO-123', apiUrl: 'https://api.sap.example' },
      { username: 'u', password: 'p' },
      'user-1'
    );
    expect(conn.tenantId).toBe('tenant-1');
    expect(conn.integrationId).toBe('int_sap_hcm');
    expect(conn.connectedBy).toBe('user-1');
    expect(['CONNECTED', 'ERROR']).toContain(conn.status);
    expect(conn.credentials.encryptedData).toBeTruthy();
  });

  it('throws when required configuration field is missing', async () => {
    await expect(
      IntegrationConnectionService.connectIntegration(
        'tenant-1',
        'int_sap_hcm',
        {}, // missing companyId
        {},
        'user-1'
      )
    ).rejects.toThrow(/required/i);
  });
});

describe('IntegrationConnectionService.testConnection', () => {
  it('returns success + latency', async () => {
    const r = await IntegrationConnectionService.testConnection({
      id: 'c1',
      tenantId: 't',
      integrationId: 'i',
      integrationName: 'X',
      status: 'CONNECTED',
      configuration: {},
      credentials: { encryptedData: '', encryptionVersion: 'v1' },
      fieldMappings: [],
      syncEnabled: false,
      healthStatus: 'HEALTHY',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(r.success).toBe(true);
    expect(r.latency).toBeGreaterThanOrEqual(0);
  });
});

describe('IntegrationConnectionService.disconnectIntegration', () => {
  it('returns a DISCONNECTED record with timestamp', async () => {
    const conn = await IntegrationConnectionService.connectIntegration(
      'tenant-1',
      'int_sap_hcm',
      { companyId: 'CO-123', apiUrl: 'https://api' },
      {},
      'user-1'
    );
    const r = await IntegrationConnectionService.disconnectIntegration(conn.id, 'user-1');
    expect(r.id).toBe(conn.id);
    expect(r.status).toBe('DISCONNECTED');
    expect(r.disconnectedAt).toBeInstanceOf(Date);
  });
});

describe('IntegrationConnectionService.updateConfiguration', () => {
  it('returns updated configuration', async () => {
    const conn = await IntegrationConnectionService.connectIntegration(
      'tenant-1',
      'int_sap_hcm',
      { companyId: 'CO-123', apiUrl: 'https://api' },
      {},
      'user-1'
    );
    const r = await IntegrationConnectionService.updateConfiguration(conn.id, { foo: 'bar' });
    expect(r.configuration).toEqual({ foo: 'bar' });
    expect(r.status).toBe('CONNECTED');
  });
});

describe('IntegrationConnectionService.encryption round-trip', () => {
  it('decryptCredentials reverses encryption', async () => {
    const original = { apiKey: 'secret', userId: 42 };
    const conn = await IntegrationConnectionService.connectIntegration(
      'tenant-1',
      'int_sap_hcm',
      { companyId: 'X', apiUrl: 'https://api' },
      original,
      'user-1'
    );
    const decrypted = await IntegrationConnectionService.decryptCredentials(conn.credentials);
    expect(decrypted).toEqual(original);
  });
});

describe('IntegrationConnectionService.sync jobs', () => {
  let connectionId: string;

  beforeEach(async () => {
    const conn = await IntegrationConnectionService.connectIntegration(
      'tenant-1',
      'int_sap_hcm',
      { companyId: 'CO-123', apiUrl: 'https://api' },
      {},
      'user-1'
    );
    connectionId = conn.id;
  });

  it('startSyncJob returns a QUEUED job with defaults', async () => {
    const job = await IntegrationConnectionService.startSyncJob(connectionId, 'EMPLOYEE');
    expect(job.connectionId).toBe(connectionId);
    expect(job.entity).toBe('EMPLOYEE');
    expect(job.type).toBe('INCREMENTAL');
    expect(job.triggeredBy).toBe('MANUAL');
    expect(job.status).toBe('QUEUED');
    expect(job.progress).toBe(0);
  });

  it('startSyncJob respects custom type + triggeredBy', async () => {
    const job = await IntegrationConnectionService.startSyncJob(
      connectionId,
      'PAYROLL',
      'FULL',
      'SCHEDULED',
      'system'
    );
    expect(job.type).toBe('FULL');
    expect(job.triggeredBy).toBe('SCHEDULED');
    expect(job.triggeredByUser).toBe('system');
  });

  it('action is derived from entity (lowercase)', async () => {
    const job = await IntegrationConnectionService.startSyncJob(connectionId, 'EMPLOYEE');
    expect(job.action).toBe('sync_employee');
  });

  it('getSyncJobStatus returns null for unknown job', async () => {
    expect(await IntegrationConnectionService.getSyncJobStatus('nope')).toBeNull();
  });

  it('getSyncHistory returns empty array', async () => {
    expect(await IntegrationConnectionService.getSyncHistory(connectionId)).toEqual([]);
  });
});

describe('IntegrationConnectionService.tenant lookups', () => {
  it('getTenantConnections returns array (stub)', async () => {
    expect(await IntegrationConnectionService.getTenantConnections('tenant-1')).toEqual([]);
  });

  it('getTenantConnections accepts status filter', async () => {
    expect(
      await IntegrationConnectionService.getTenantConnections('tenant-1', 'CONNECTED')
    ).toEqual([]);
  });

  it('getConnectionById returns null when missing', async () => {
    expect(await IntegrationConnectionService.getConnectionById('conn-1')).toBeNull();
  });
});

describe('IntegrationConnectionService.webhooks', () => {
  let connectionId: string;

  beforeEach(async () => {
    const conn = await IntegrationConnectionService.connectIntegration(
      'tenant-1',
      'int_sap_hcm',
      { companyId: 'CO-123', apiUrl: 'https://api' },
      {},
      'user-1'
    );
    connectionId = conn.id;
  });

  it('createWebhook returns a populated WebhookConfig', async () => {
    const wh = await IntegrationConnectionService.createWebhook(connectionId, {
      name: 'My Webhook',
      nameAr: 'My Webhook',
      description: 'A test webhook',
      direction: 'OUTBOUND',
      outboundUrl: 'https://example.com/wh',
      outboundEvents: ['EMPLOYEE_CREATED'],
      enabled: true,
      retryEnabled: true,
      maxRetries: 3,
      retryDelay: 60,
    } as any);
    expect(wh.connectionId).toBe(connectionId);
    expect(wh.successCount).toBe(0);
    expect(wh.failureCount).toBe(0);
  });

  it('getWebhooks returns empty array initially', async () => {
    expect(await IntegrationConnectionService.getWebhooks(connectionId)).toEqual([]);
  });

  it('processInboundWebhook returns success', async () => {
    const r = await IntegrationConnectionService.processInboundWebhook('wh-1', { foo: 1 }, {});
    expect(r.success).toBe(true);
    expect(r.message).toBeTruthy();
  });

  it('sendOutboundWebhook returns a PENDING delivery', async () => {
    const wh = { id: 'wh-1' } as any;
    const d = await IntegrationConnectionService.sendOutboundWebhook(wh, 'EMPLOYEE_CREATED', {});
    expect(d.webhookId).toBe('wh-1');
    expect(d.event).toBe('EMPLOYEE_CREATED');
    expect(d.status).toBe('PENDING');
    expect(d.attempts).toEqual([]);
  });
});

describe('IntegrationConnectionService.logging', () => {
  it('logActivity stamps id + timestamp', async () => {
    const log = await IntegrationConnectionService.logActivity({
      tenantId: 't',
      integrationId: 'i',
      connectionId: 'c',
      direction: 'OUTBOUND',
      method: 'POST',
      endpoint: '/api/test',
      statusCode: 200,
      responseTime: 100,
      action: 'SYNC',
      entity: 'Employee',
      success: true,
    });
    expect(log.id).toBeDefined();
    expect(log.timestamp).toBeInstanceOf(Date);
  });

  it('getLogs returns empty array', async () => {
    expect(await IntegrationConnectionService.getLogs('conn-1')).toEqual([]);
    expect(
      await IntegrationConnectionService.getLogs('conn-1', { success: true, limit: 10 })
    ).toEqual([]);
  });
});

describe('IntegrationConnectionService.getHealthMetrics', () => {
  it('returns UNKNOWN for missing connection', async () => {
    const r = await IntegrationConnectionService.getHealthMetrics('conn-1');
    expect(r.status).toBe('UNKNOWN');
    expect(r.uptime).toBe(0);
    expect(r.successRate).toBe(0);
    expect(r.avgResponseTime).toBe(0);
  });

  it('returns metrics for an existing connection', async () => {
    const conn = await IntegrationConnectionService.connectIntegration(
      'tenant-1',
      'int_sap_hcm',
      { companyId: 'CO-123', apiUrl: 'https://api' },
      {},
      'user-1'
    );
    const r = await IntegrationConnectionService.getHealthMetrics(conn.id);
    expect(r.status).toBe('HEALTHY');
    expect(r.uptime).toBe(100);
    expect(r.successRate).toBe(100);
  });
});
