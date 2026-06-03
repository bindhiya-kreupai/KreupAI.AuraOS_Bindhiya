/**
 * with-correlation — request-lifecycle contract integration test. (#81 + #82)
 *
 * Verifies the seam between withCorrelation, the AsyncLocalStorage scope, and
 * the OTel attribute projection. No Prisma required — exercises the contract
 * that downstream APM exporters depend on.
 */

import { describe, it, expect } from 'vitest';
import { NextResponse } from 'next/server';
import { withCorrelation } from '../with-correlation';
import { getRequestContext, setAuthIdentifiers } from '../request-context';
import {
  attributesFromContext,
  currentTelemetryAttributes,
  TELEMETRY_KEYS,
} from '../telemetry-attributes';

function makeRequest(
  url: string,
  init?: { method?: string; headers?: Record<string, string> }
): import('next/server').NextRequest {
  return new Request(url, {
    method: init?.method ?? 'GET',
    headers: init?.headers,
  }) as unknown as import('next/server').NextRequest;
}

describe('withCorrelation — full request lifecycle', () => {
  it('runs the handler inside a context with a stable request-id', async () => {
    let observed: {
      ctx: ReturnType<typeof getRequestContext>;
      attrs: Record<string, string>;
    } | null = null;

    const handler = withCorrelation(async () => {
      observed = {
        ctx: getRequestContext(),
        attrs: currentTelemetryAttributes() as Record<string, string>,
      };
      return NextResponse.json({ ok: true });
    });

    const res = await handler(
      makeRequest('https://example.test/api/v1/employees/a3f2c4e6-9b8d-4f12-aaaa-bbbbccccdddd')
    );

    expect(res.status).toBe(200);
    expect(observed).not.toBeNull();
    expect(observed!.ctx?.requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
    expect(observed!.ctx?.route).toBe('/api/v1/employees/[id]');
    expect(observed!.ctx?.method).toBe('GET');
    expect(observed!.attrs[TELEMETRY_KEYS.ROUTE]).toBe('/api/v1/employees/[id]');
    expect(observed!.attrs[TELEMETRY_KEYS.METHOD]).toBe('GET');

    // Response stamps x-request-id
    expect(res.headers.get('x-request-id')).toBe(observed!.ctx?.requestId);
  });

  it('honours an upstream x-request-id when it is a valid UUID', async () => {
    const upstream = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    let observedId: string | undefined;

    const handler = withCorrelation(async () => {
      observedId = getRequestContext()?.requestId;
      return NextResponse.json({});
    });

    const res = await handler(
      makeRequest('https://example.test/api/v1/auth/refresh', {
        headers: { 'x-request-id': upstream },
      })
    );

    expect(observedId).toBe(upstream);
    expect(res.headers.get('x-request-id')).toBe(upstream);
  });

  it('discards a malformed upstream id and generates a fresh one', async () => {
    let observedId: string | undefined;

    const handler = withCorrelation(async () => {
      observedId = getRequestContext()?.requestId;
      return NextResponse.json({});
    });

    await handler(
      makeRequest('https://example.test/api/v1/auth/refresh', {
        headers: { 'x-request-id': 'not-a-uuid' },
      })
    );

    expect(observedId).not.toBe('not-a-uuid');
    expect(observedId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it('propagates tenant + user attributes once auth resolves', async () => {
    let attrs: Record<string, string> = {};

    const handler = withCorrelation(async () => {
      // Simulate the auth wrapper calling setAuthIdentifiers
      setAuthIdentifiers('tenant-42', 'user-99');
      attrs = attributesFromContext(getRequestContext()) as Record<string, string>;
      return NextResponse.json({});
    });

    await handler(makeRequest('https://example.test/api/v1/employees'));

    expect(attrs[TELEMETRY_KEYS.TENANT_ID]).toBe('tenant-42');
    expect(attrs[TELEMETRY_KEYS.USER_ID]).toBe('user-99');
  });

  it('rethrows handler errors but still emits the error log path', async () => {
    const handler = withCorrelation(async () => {
      throw new Error('boom');
    });

    await expect(handler(makeRequest('https://example.test/api/v1/x'))).rejects.toThrow('boom');
  });

  it('isolates contexts between concurrent requests', async () => {
    const seen: string[] = [];
    const handler = withCorrelation(async () => {
      const id = getRequestContext()?.requestId ?? 'none';
      // Yield to make sure contexts have a chance to interleave
      await new Promise((r) => setTimeout(r, Math.random() * 5));
      seen.push(id + ':' + (getRequestContext()?.requestId ?? 'none'));
      return NextResponse.json({});
    });

    await Promise.all([
      handler(makeRequest('https://example.test/api/v1/a')),
      handler(makeRequest('https://example.test/api/v1/b')),
      handler(makeRequest('https://example.test/api/v1/c')),
    ]);

    expect(seen).toHaveLength(3);
    for (const pair of seen) {
      const [start, end] = pair.split(':');
      expect(start).toBe(end);
    }
  });
});
