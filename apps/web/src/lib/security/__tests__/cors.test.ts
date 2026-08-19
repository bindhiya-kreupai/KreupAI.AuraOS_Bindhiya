import { describe, it, expect, vi } from 'vitest';
import { isValidCorsOrigin, parseAndValidateCorsOrigins } from '../cors';

describe('AOS-SEC-009 — CORS Allowed Origins Validation Tests', () => {
  it('isValidCorsOrigin validates correct scheme + host + optional port origins', () => {
    expect(isValidCorsOrigin('https://app.domain.com')).toBe(true);
    expect(isValidCorsOrigin('https://admin.domain.com')).toBe(true);
    expect(isValidCorsOrigin('http://localhost:3000')).toBe(true);
    expect(isValidCorsOrigin('https://portal.company.org:8443')).toBe(true);
  });

  it('isValidCorsOrigin rejects wildcards (*)', () => {
    expect(isValidCorsOrigin('*')).toBe(false);
    expect(isValidCorsOrigin('https://*.domain.com')).toBe(false);
  });

  it('isValidCorsOrigin rejects entries with trailing slashes or paths', () => {
    expect(isValidCorsOrigin('https://app.domain.com/')).toBe(false);
    expect(isValidCorsOrigin('https://app.domain.com/api/v1')).toBe(false);
    expect(isValidCorsOrigin('http://localhost:3000/dashboard')).toBe(false);
  });

  it('isValidCorsOrigin rejects invalid schemes and non-URL strings', () => {
    expect(isValidCorsOrigin('ftp://app.domain.com')).toBe(false);
    expect(isValidCorsOrigin('invalid-url-string')).toBe(false);
    expect(isValidCorsOrigin('')).toBe(false);
  });

  it('parseAndValidateCorsOrigins filters invalid entries and logs warnings', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const rawInput = 'https://app.domain.com, *, https://domain.com/path, https://admin.domain.com';
    const valid = parseAndValidateCorsOrigins(rawInput);

    expect(valid).toEqual(['https://app.domain.com', 'https://admin.domain.com']);
    expect(consoleWarnSpy).toHaveBeenCalledTimes(2);

    consoleWarnSpy.mockRestore();
  });
});
