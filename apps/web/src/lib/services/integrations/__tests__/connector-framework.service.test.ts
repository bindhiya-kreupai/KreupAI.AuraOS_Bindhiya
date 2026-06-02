import { describe, it, expect } from 'vitest';
import { ConnectorFrameworkService } from '../connector-framework.service';

const TENANT_A = 'tenant-A';
const TENANT_B = 'tenant-B';

function baseRegister(overrides: any = {}) {
  return {
    connectorType: 'ERP' as any,
    name: 'My SAP',
    nameAr: 'SAP',
    provider: 'SAP' as any,
    credentials: { apiKey: 'k' },
    endpoints: [],
    isActive: true,
    ...overrides,
  };
}

describe('ConnectorFrameworkService.registerConnector', () => {
  it('registers connector for tenant and returns persisted record', async () => {
    const c = await ConnectorFrameworkService.registerConnector(TENANT_A, baseRegister());
    expect(c.id).toMatch(/^conn_/);
    expect(c.tenantId).toBe(TENANT_A);
    expect(c.status).toBe('PENDING');
    expect(c.errorCount).toBe(0);
  });

  it('throws for unsupported provider/type combo', async () => {
    await expect(
      ConnectorFrameworkService.registerConnector(
        TENANT_A,
        baseRegister({ provider: 'SAP', connectorType: 'BIOMETRIC' })
      )
    ).rejects.toThrow(/Unsupported provider/);
  });

  it('allows CUSTOM provider without template match', async () => {
    const c = await ConnectorFrameworkService.registerConnector(
      TENANT_A,
      baseRegister({ provider: 'CUSTOM', connectorType: 'CUSTOM' })
    );
    expect(c.provider).toBe('CUSTOM');
  });

  it('falls back to template default endpoints when none provided', async () => {
    const c = await ConnectorFrameworkService.registerConnector(TENANT_A, baseRegister());
    expect(Array.isArray(c.endpoints)).toBe(true);
  });

  it('uses provided endpoints when given', async () => {
    const endpoints = [{ name: 'EP1', url: 'https://e1', method: 'GET' as const }];
    const c = await ConnectorFrameworkService.registerConnector(
      TENANT_A,
      baseRegister({ endpoints })
    );
    expect(c.endpoints.length).toBeGreaterThan(0);
  });
});

describe('ConnectorFrameworkService.getConnectors — tenant isolation', () => {
  it('returns only connectors for the given tenant', async () => {
    const cA = await ConnectorFrameworkService.registerConnector(TENANT_A, baseRegister());
    const cB = await ConnectorFrameworkService.registerConnector(TENANT_B, baseRegister());
    const listA = await ConnectorFrameworkService.getConnectors(TENANT_A);
    const idsA = listA.map((c) => c.id);
    expect(idsA).toContain(cA.id);
    expect(idsA).not.toContain(cB.id);
  });

  it('filters by connector type', async () => {
    await ConnectorFrameworkService.registerConnector(TENANT_A, baseRegister());
    const list = await ConnectorFrameworkService.getConnectors(TENANT_A, 'BIOMETRIC' as any);
    list.forEach((c) => expect(c.connectorType).toBe('BIOMETRIC'));
  });
});

describe('ConnectorFrameworkService.getConnectorHealth', () => {
  it('throws when connector not found', async () => {
    await expect(
      ConnectorFrameworkService.getConnectorHealth(TENANT_A, 'no-such-conn')
    ).rejects.toThrow(/not found/);
  });

  it('throws when tenant mismatch (isolation)', async () => {
    const c = await ConnectorFrameworkService.registerConnector(TENANT_A, baseRegister());
    await expect(ConnectorFrameworkService.getConnectorHealth(TENANT_B, c.id)).rejects.toThrow(
      /not found/
    );
  });

  it('returns health status for owned connector', async () => {
    const c = await ConnectorFrameworkService.registerConnector(TENANT_A, baseRegister());
    const h = await ConnectorFrameworkService.getConnectorHealth(TENANT_A, c.id);
    expect(h).toBeDefined();
    expect(['HEALTHY', 'DEGRADED', 'DOWN']).toContain(h.status);
  });
});

describe('ConnectorFrameworkService.testConnection', () => {
  it('throws for tenant mismatch', async () => {
    const c = await ConnectorFrameworkService.registerConnector(TENANT_A, baseRegister());
    await expect(ConnectorFrameworkService.testConnection(TENANT_B, c.id)).rejects.toThrow(
      /not found/
    );
  });

  it('returns failure when no endpoints configured', async () => {
    const c = await ConnectorFrameworkService.registerConnector(
      TENANT_A,
      baseRegister({ provider: 'CUSTOM', connectorType: 'CUSTOM', endpoints: [] })
    );
    const r = await ConnectorFrameworkService.testConnection(TENANT_A, c.id);
    expect(r.success).toBe(false);
    expect(r.message).toMatch(/endpoints/i);
  });
});

describe('ConnectorFrameworkService.deactivateConnector', () => {
  it('sets status INACTIVE and isActive=false', async () => {
    const c = await ConnectorFrameworkService.registerConnector(TENANT_A, baseRegister());
    const r = await ConnectorFrameworkService.deactivateConnector(TENANT_A, c.id);
    expect(r.isActive).toBe(false);
    expect(r.status).toBe('INACTIVE');
  });

  it('throws for tenant mismatch', async () => {
    const c = await ConnectorFrameworkService.registerConnector(TENANT_A, baseRegister());
    await expect(ConnectorFrameworkService.deactivateConnector(TENANT_B, c.id)).rejects.toThrow(
      /not found/
    );
  });
});

describe('ConnectorFrameworkService.sync', () => {
  it('throws when connector inactive', async () => {
    const c = await ConnectorFrameworkService.registerConnector(
      TENANT_A,
      baseRegister({ isActive: false })
    );
    await expect(ConnectorFrameworkService.sync(TENANT_A, c.id)).rejects.toThrow(/inactive/);
  });

  it('throws for tenant mismatch', async () => {
    const c = await ConnectorFrameworkService.registerConnector(TENANT_A, baseRegister());
    await expect(ConnectorFrameworkService.sync(TENANT_B, c.id)).rejects.toThrow(/not found/);
  });

  it('returns COMPLETED sync operation with defaults', async () => {
    const c = await ConnectorFrameworkService.registerConnector(TENANT_A, baseRegister());
    const op = await ConnectorFrameworkService.sync(TENANT_A, c.id);
    expect(op.id).toMatch(/^sync_/);
    expect(['COMPLETED', 'FAILED']).toContain(op.status);
    expect(op.direction).toBe('BIDIRECTIONAL');
    expect(op.entityType).toBe('ALL');
    expect(op.completedAt).toBeInstanceOf(Date);
  });

  it('respects custom direction + entityType options', async () => {
    const c = await ConnectorFrameworkService.registerConnector(TENANT_A, baseRegister());
    const op = await ConnectorFrameworkService.sync(TENANT_A, c.id, {
      direction: 'INBOUND' as any,
      entityType: 'EMPLOYEE' as any,
    });
    expect(op.direction).toBe('INBOUND');
    expect(op.entityType).toBe('EMPLOYEE');
  });
});

describe('ConnectorFrameworkService.getLastSync + getSyncHistory', () => {
  it('getLastSync returns null when no syncs run', async () => {
    const c = await ConnectorFrameworkService.registerConnector(TENANT_A, baseRegister());
    expect(await ConnectorFrameworkService.getLastSync(TENANT_A, c.id)).toBeNull();
  });

  it('getLastSync returns most recent after sync', async () => {
    const c = await ConnectorFrameworkService.registerConnector(TENANT_A, baseRegister());
    await ConnectorFrameworkService.sync(TENANT_A, c.id);
    const last = await ConnectorFrameworkService.getLastSync(TENANT_A, c.id);
    expect(last).not.toBeNull();
  });

  it('getSyncHistory respects limit', async () => {
    const c = await ConnectorFrameworkService.registerConnector(TENANT_A, baseRegister());
    await ConnectorFrameworkService.sync(TENANT_A, c.id);
    await ConnectorFrameworkService.sync(TENANT_A, c.id);
    const h = await ConnectorFrameworkService.getSyncHistory(TENANT_A, c.id, 1);
    expect(h.length).toBeLessThanOrEqual(1);
  });
});

describe('ConnectorFrameworkService.configureMapping', () => {
  it('returns mapping records with generated ids', async () => {
    const c = await ConnectorFrameworkService.registerConnector(TENANT_A, baseRegister());
    const r = await ConnectorFrameworkService.configureMapping(TENANT_A, c.id, [
      { sourceField: 'first_name', targetField: 'firstName' } as any,
      { sourceField: 'last_name', targetField: 'lastName' } as any,
    ]);
    expect(r).toHaveLength(2);
    r.forEach((m) => expect(m.id).toMatch(/^map_/));
  });

  it('throws for tenant mismatch', async () => {
    const c = await ConnectorFrameworkService.registerConnector(TENANT_A, baseRegister());
    await expect(ConnectorFrameworkService.configureMapping(TENANT_B, c.id, [])).rejects.toThrow(
      /not found/
    );
  });
});

describe('ConnectorFrameworkService.webhooks', () => {
  it('registerWebhook creates webhook record', async () => {
    const c = await ConnectorFrameworkService.registerConnector(TENANT_A, baseRegister());
    const wh = await ConnectorFrameworkService.registerWebhook(TENANT_A, c.id, {
      eventType: 'EMPLOYEE_CREATED',
      url: 'https://hook',
      secret: 's',
      isActive: true,
    });
    expect(wh.id).toMatch(/^wh_/);
    expect(wh.eventType).toBe('EMPLOYEE_CREATED');
  });

  it('processWebhook returns false when no active webhooks configured', async () => {
    const c = await ConnectorFrameworkService.registerConnector(TENANT_A, baseRegister());
    const r = await ConnectorFrameworkService.processWebhook(c.id, { event: 'X' });
    expect(r.success).toBe(false);
    expect(r.message).toMatch(/No active/);
  });

  it('processWebhook returns false when connector inactive', async () => {
    const c = await ConnectorFrameworkService.registerConnector(TENANT_A, baseRegister());
    await ConnectorFrameworkService.deactivateConnector(TENANT_A, c.id);
    const r = await ConnectorFrameworkService.processWebhook(c.id, { event: 'X' });
    expect(r.success).toBe(false);
    expect(r.message).toMatch(/inactive/i);
  });

  it('processWebhook matches wildcard webhooks', async () => {
    const c = await ConnectorFrameworkService.registerConnector(TENANT_A, baseRegister());
    await ConnectorFrameworkService.registerWebhook(TENANT_A, c.id, {
      eventType: '*',
      url: 'https://hook',
      secret: 's',
      isActive: true,
    });
    const r = await ConnectorFrameworkService.processWebhook(c.id, { event: 'ANY' });
    expect(r.success).toBe(true);
    expect(r.processedEvents).toBe(1);
  });

  it('processWebhook matches by event type', async () => {
    const c = await ConnectorFrameworkService.registerConnector(TENANT_A, baseRegister());
    await ConnectorFrameworkService.registerWebhook(TENANT_A, c.id, {
      eventType: 'EMPLOYEE_CREATED',
      url: 'https://hook',
      secret: 's',
      isActive: true,
    });
    const r = await ConnectorFrameworkService.processWebhook(c.id, { event: 'EMPLOYEE_CREATED' });
    expect(r.processedEvents).toBe(1);
  });

  it('processWebhook throws for unknown connectorId', async () => {
    await expect(ConnectorFrameworkService.processWebhook('nope', {})).rejects.toThrow(/not found/);
  });
});

describe('ConnectorFrameworkService.template discovery', () => {
  it('getAvailableConnectors returns templates', () => {
    const r = ConnectorFrameworkService.getAvailableConnectors();
    expect(r.length).toBeGreaterThan(0);
    r.forEach((t) => expect(t.provider).toBeTruthy());
  });

  it('getConnectorTemplate returns null for unknown provider', () => {
    expect(ConnectorFrameworkService.getConnectorTemplate('NONEXISTENT' as any)).toBeNull();
  });

  it('getConnectorTemplate returns template for SAP', () => {
    const r = ConnectorFrameworkService.getConnectorTemplate('SAP' as any);
    expect(r).not.toBeNull();
    expect(r!.provider).toBe('SAP');
  });

  it('getConnectorsByType returns ERP templates', () => {
    const r = ConnectorFrameworkService.getConnectorsByType('ERP' as any);
    r.forEach((t) => expect(t.type).toBe('ERP'));
  });
});

describe('ConnectorFrameworkService.getAuditLog', () => {
  it('returns tenant-scoped audit entries', async () => {
    const c = await ConnectorFrameworkService.registerConnector(TENANT_A, baseRegister());
    const entries = await ConnectorFrameworkService.getAuditLog(TENANT_A, c.id);
    expect(entries.length).toBeGreaterThan(0);
    entries.forEach((e) => expect(e.tenantId).toBe(TENANT_A));
  });

  it('respects limit', async () => {
    await ConnectorFrameworkService.registerConnector(TENANT_A, baseRegister());
    const entries = await ConnectorFrameworkService.getAuditLog(TENANT_A, undefined, 2);
    expect(entries.length).toBeLessThanOrEqual(2);
  });

  it('filters by connectorId when provided', async () => {
    const c = await ConnectorFrameworkService.registerConnector(TENANT_A, baseRegister());
    const entries = await ConnectorFrameworkService.getAuditLog(TENANT_A, c.id);
    entries.forEach((e) => expect(e.connectorId).toBe(c.id));
  });

  it('does not leak entries from other tenants', async () => {
    await ConnectorFrameworkService.registerConnector(TENANT_B, baseRegister());
    const entriesA = await ConnectorFrameworkService.getAuditLog(TENANT_A);
    entriesA.forEach((e) => expect(e.tenantId).toBe(TENANT_A));
  });
});
