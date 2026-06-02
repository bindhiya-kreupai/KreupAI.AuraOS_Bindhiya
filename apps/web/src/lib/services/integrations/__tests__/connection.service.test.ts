import { describe, it, expect } from 'vitest';
import { IntegrationConnectionService } from '../connection.service';

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
    const r = await IntegrationConnectionService.disconnectIntegration('conn-1', 'user-1');
    expect(r.id).toBe('conn-1');
    expect(r.status).toBe('DISCONNECTED');
    expect(r.disconnectedAt).toBeInstanceOf(Date);
  });
});

describe('IntegrationConnectionService.updateConfiguration', () => {
  it('returns updated configuration', async () => {
    const r = await IntegrationConnectionService.updateConfiguration('conn-1', { foo: 'bar' });
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
  it('startSyncJob returns a QUEUED job with defaults', async () => {
    const job = await IntegrationConnectionService.startSyncJob('conn-1', 'EMPLOYEE');
    expect(job.connectionId).toBe('conn-1');
    expect(job.entity).toBe('EMPLOYEE');
    expect(job.type).toBe('INCREMENTAL');
    expect(job.triggeredBy).toBe('MANUAL');
    expect(job.status).toBe('QUEUED');
    expect(job.progress).toBe(0);
  });

  it('startSyncJob respects custom type + triggeredBy', async () => {
    const job = await IntegrationConnectionService.startSyncJob(
      'conn-1',
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
    const job = await IntegrationConnectionService.startSyncJob('conn-1', 'EMPLOYEE');
    expect(job.action).toBe('sync_employee');
  });

  it('getSyncJobStatus returns null for unknown job', async () => {
    expect(await IntegrationConnectionService.getSyncJobStatus('nope')).toBeNull();
  });

  it('getSyncHistory returns empty array (stub)', async () => {
    expect(await IntegrationConnectionService.getSyncHistory('conn-1')).toEqual([]);
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
  it('createWebhook returns a populated WebhookConfig', async () => {
    const wh = await IntegrationConnectionService.createWebhook('conn-1', {
      name: 'My Webhook',
      url: 'https://example.com/wh',
      events: ['EMPLOYEE_CREATED'],
      enabled: true,
      authentication: { type: 'NONE' },
      retryPolicy: {
        maxAttempts: 3,
        initialDelayMs: 1000,
        backoffMultiplier: 2,
        maxDelayMs: 60000,
      },
    } as any);
    expect(wh.id).toMatch(/^wh_/);
    expect(wh.connectionId).toBe('conn-1');
    expect(wh.successCount).toBe(0);
    expect(wh.failureCount).toBe(0);
  });

  it('getWebhooks returns empty (stub)', async () => {
    expect(await IntegrationConnectionService.getWebhooks('conn-1')).toEqual([]);
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
      level: 'INFO',
      action: 'SYNC',
      message: 'started',
      success: true,
    } as any);
    expect(log.id).toMatch(/^log_/);
    expect(log.timestamp).toBeInstanceOf(Date);
  });

  it('getLogs returns array (stub)', async () => {
    expect(await IntegrationConnectionService.getLogs('conn-1')).toEqual([]);
    expect(
      await IntegrationConnectionService.getLogs('conn-1', { success: true, limit: 10 })
    ).toEqual([]);
  });
});

describe('IntegrationConnectionService.getHealthMetrics', () => {
  it('returns health metrics with sensible defaults', async () => {
    const r = await IntegrationConnectionService.getHealthMetrics('conn-1');
    expect(r.status).toBe('HEALTHY');
    expect(r.uptime).toBeGreaterThan(0);
    expect(r.successRate).toBeGreaterThan(0);
    expect(r.avgResponseTime).toBeGreaterThan(0);
    expect(r.lastSuccess).toBeInstanceOf(Date);
  });
});
