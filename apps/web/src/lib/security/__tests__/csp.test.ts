import { describe, it, expect } from 'vitest';
import { generateNonce, buildCspHeader } from '../csp';
import { middleware } from '@/middleware';
import { NextRequest } from 'next/server';

describe('AOS-SEC-008 — Content Security Policy Hardening Tests', () => {
  it('generateNonce creates a unique base64 nonce string', () => {
    const nonce1 = generateNonce();
    const nonce2 = generateNonce();

    expect(nonce1).toBeDefined();
    expect(typeof nonce1).toBe('string');
    expect(nonce1.length).toBeGreaterThan(10);
    expect(nonce1).not.toBe(nonce2);
  });

  it('buildCspHeader for PRODUCTION omits unsafe-eval and unsafe-inline for script-src', () => {
    const nonce = 'test-nonce-12345';
    const csp = buildCspHeader(nonce, true);

    // Production CSP mandates
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).not.toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).toContain(`script-src 'self' 'nonce-${nonce}'`);
    expect(csp).toContain("frame-ancestors 'none'");
  });

  it('buildCspHeader for DEVELOPMENT includes unsafe-eval and unsafe-inline for HMR compatibility', () => {
    const nonce = 'test-nonce-67890';
    const csp = buildCspHeader(nonce, false);

    expect(csp).toContain("'unsafe-eval'");
    expect(csp).toContain("'unsafe-inline'");
    expect(csp).toContain(`script-src 'self' 'nonce-${nonce}'`);
  });

  it('middleware attaches Content-Security-Policy and x-nonce headers to request & response', () => {
    const req = new NextRequest('http://localhost:3000/dashboard');
    const res = middleware(req);

    const cspHeader = res.headers.get('Content-Security-Policy');
    const nonceHeader = res.headers.get('x-nonce');
    const requestIdHeader = res.headers.get('X-Request-Id');

    expect(cspHeader).toBeDefined();
    expect(cspHeader).toContain('script-src');
    expect(nonceHeader).toBeDefined();
    expect(nonceHeader?.length).toBeGreaterThan(10);
    expect(requestIdHeader).toBeDefined();
  });
});
