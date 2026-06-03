/**
 * Telemetry attribute projection — pure tests. (#82)
 */

import { describe, it, expect } from 'vitest';
import {
  attributesFromContext,
  currentTelemetryAttributes,
  pickAllowed,
  TELEMETRY_KEYS,
} from '../telemetry-attributes';
import { runWithRequestContext } from '../request-context';

describe('attributesFromContext', () => {
  it('returns empty object for null context', () => {
    expect(attributesFromContext(null)).toEqual({});
  });

  it('projects a full context to the canonical attribute shape', () => {
    const attrs = attributesFromContext({
      requestId: 'req-1',
      tenantId: 't-1',
      userId: 'u-1',
      route: '/api/v1/employees/[id]',
      method: 'GET',
      startedAtMs: 0,
    });
    expect(attrs).toEqual({
      [TELEMETRY_KEYS.REQUEST_ID]: 'req-1',
      [TELEMETRY_KEYS.ROUTE]: '/api/v1/employees/[id]',
      [TELEMETRY_KEYS.METHOD]: 'GET',
      [TELEMETRY_KEYS.TENANT_ID]: 't-1',
      [TELEMETRY_KEYS.USER_ID]: 'u-1',
    });
  });

  it('omits undefined optional fields', () => {
    const attrs = attributesFromContext({
      requestId: 'req-1',
      startedAtMs: 0,
    });
    expect(attrs).toEqual({ [TELEMETRY_KEYS.REQUEST_ID]: 'req-1' });
    expect(attrs).not.toHaveProperty(TELEMETRY_KEYS.TENANT_ID);
  });
});

describe('currentTelemetryAttributes', () => {
  it('reads from the active scope', async () => {
    const attrs = await runWithRequestContext(
      {
        requestId: 'r-1',
        tenantId: 't-1',
        userId: 'u-1',
        route: '/x',
        method: 'POST',
        startedAtMs: 0,
      },
      async () => currentTelemetryAttributes()
    );
    expect(attrs[TELEMETRY_KEYS.TENANT_ID]).toBe('t-1');
    expect(attrs[TELEMETRY_KEYS.ROUTE]).toBe('/x');
  });

  it('returns empty object outside a scope', () => {
    expect(currentTelemetryAttributes()).toEqual({});
  });
});

describe('pickAllowed', () => {
  it('filters to the default allow-list', () => {
    const filtered = pickAllowed({
      [TELEMETRY_KEYS.TENANT_ID]: 't-1',
      ['custom.weird.key']: 'noise',
    } as never);
    expect(filtered).toEqual({ [TELEMETRY_KEYS.TENANT_ID]: 't-1' });
  });

  it('honours a custom allow-list', () => {
    const filtered = pickAllowed(
      {
        [TELEMETRY_KEYS.TENANT_ID]: 't-1',
        [TELEMETRY_KEYS.USER_ID]: 'u-1',
      },
      [TELEMETRY_KEYS.TENANT_ID]
    );
    expect(filtered).toEqual({ [TELEMETRY_KEYS.TENANT_ID]: 't-1' });
    expect(filtered).not.toHaveProperty(TELEMETRY_KEYS.USER_ID);
  });

  it('skips undefined values', () => {
    expect(
      pickAllowed({
        [TELEMETRY_KEYS.TENANT_ID]: undefined,
        [TELEMETRY_KEYS.USER_ID]: 'u-1',
      })
    ).toEqual({ [TELEMETRY_KEYS.USER_ID]: 'u-1' });
  });
});
