/**
 * API Version Middleware Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  getApiVersion,
  isValidVersion,
  isDeprecatedVersion,
  getSunsetDate,
  getVersionHeaders,
  DEFAULT_API_VERSION,
  LATEST_API_VERSION,
} from '@/lib/middleware/api-version';

describe('API Versioning', () => {
  describe('getApiVersion', () => {
    it('should extract version from URL path', () => {
      const request = new NextRequest('http://localhost:3006/api/v1/users');
      const version = getApiVersion(request);
      expect(version).toBe('v1');
    });

    it('should extract version from Accept-Version header', () => {
      const request = new NextRequest('http://localhost:3006/api/users', {
        headers: { 'Accept-Version': 'v1' },
      });
      const version = getApiVersion(request);
      expect(version).toBe('v1');
    });

    it('should extract version from query parameter', () => {
      const request = new NextRequest('http://localhost:3006/api/users?version=v1');
      const version = getApiVersion(request);
      expect(version).toBe('v1');
    });

    it('should prioritize URL path over header', () => {
      const request = new NextRequest('http://localhost:3006/api/v1/users', {
        headers: { 'Accept-Version': 'v2' },
      });
      const version = getApiVersion(request);
      expect(version).toBe('v1');
    });

    it('should prioritize header over query parameter', () => {
      const request = new NextRequest('http://localhost:3006/api/users?version=v2', {
        headers: { 'Accept-Version': 'v1' },
      });
      const version = getApiVersion(request);
      expect(version).toBe('v1');
    });

    it('should return default version when none specified', () => {
      const request = new NextRequest('http://localhost:3006/api/users');
      const version = getApiVersion(request);
      expect(version).toBe(DEFAULT_API_VERSION);
    });

    it('should return default version for invalid URL version', () => {
      const request = new NextRequest('http://localhost:3006/api/v99/users');
      const version = getApiVersion(request);
      expect(version).toBe(DEFAULT_API_VERSION);
    });

    it('should return default version for invalid header version', () => {
      const request = new NextRequest('http://localhost:3006/api/users', {
        headers: { 'Accept-Version': 'invalid' },
      });
      const version = getApiVersion(request);
      expect(version).toBe(DEFAULT_API_VERSION);
    });
  });

  describe('isValidVersion', () => {
    it('should validate v1', () => {
      expect(isValidVersion('v1')).toBe(true);
    });

    it('should reject invalid versions', () => {
      expect(isValidVersion('v99')).toBe(false);
      expect(isValidVersion('v0')).toBe(false);
      expect(isValidVersion('1')).toBe(false);
      expect(isValidVersion('')).toBe(false);
      expect(isValidVersion('invalid')).toBe(false);
    });
  });

  describe('isDeprecatedVersion', () => {
    it('should return false for v1 (not deprecated)', () => {
      expect(isDeprecatedVersion('v1')).toBe(false);
    });

    // Add tests when versions are deprecated
    // it('should return true for deprecated versions', () => {
    //   expect(isDeprecatedVersion('v0')).toBe(true);
    // });
  });

  describe('getSunsetDate', () => {
    it('should return null for non-deprecated versions', () => {
      expect(getSunsetDate('v1')).toBeNull();
    });

    // Add tests when versions are deprecated
    // it('should return sunset date for deprecated versions', () => {
    //   expect(getSunsetDate('v0')).toBe('2025-12-31');
    // });
  });

  describe('getVersionHeaders', () => {
    it('should include X-API-Version header', () => {
      const headers = getVersionHeaders('v1');
      expect(headers['X-API-Version']).toBe('v1');
    });

    it('should not include deprecation headers for active version', () => {
      const headers = getVersionHeaders('v1');
      expect(headers['X-API-Deprecated']).toBeUndefined();
      expect(headers['Sunset']).toBeUndefined();
      expect(headers['Deprecation']).toBeUndefined();
    });

    // Add tests when versions are deprecated
    // it('should include deprecation headers for deprecated version', () => {
    //   const headers = getVersionHeaders('v0');
    //   expect(headers['X-API-Deprecated']).toBe('true');
    //   expect(headers['Sunset']).toBe('2025-12-31');
    //   expect(headers['Deprecation']).toBeTruthy();
    // });
  });

  describe('Version Constants', () => {
    it('should have valid DEFAULT_API_VERSION', () => {
      expect(DEFAULT_API_VERSION).toBe('v1');
      expect(isValidVersion(DEFAULT_API_VERSION)).toBe(true);
    });

    it('should have valid LATEST_API_VERSION', () => {
      expect(LATEST_API_VERSION).toBe('v1');
      expect(isValidVersion(LATEST_API_VERSION)).toBe(true);
    });

    it('should have default and latest as the same version', () => {
      expect(DEFAULT_API_VERSION).toBe(LATEST_API_VERSION);
    });
  });

  describe('URL Path Parsing', () => {
    it('should handle complex paths', () => {
      const request = new NextRequest('http://localhost:3006/api/v1/users/123/licenses');
      const version = getApiVersion(request);
      expect(version).toBe('v1');
    });

    it('should handle query parameters in URL', () => {
      const request = new NextRequest('http://localhost:3006/api/v1/users?search=test&page=2');
      const version = getApiVersion(request);
      expect(version).toBe('v1');
    });

    it('should not extract version from middle of path', () => {
      const request = new NextRequest('http://localhost:3006/api/users/v1/something');
      const version = getApiVersion(request);
      expect(version).toBe(DEFAULT_API_VERSION);
    });

    it('should handle trailing slashes', () => {
      const request = new NextRequest('http://localhost:3006/api/v1/users/');
      const version = getApiVersion(request);
      expect(version).toBe('v1');
    });
  });

  describe('Header Parsing', () => {
    it('should be case-sensitive for version value', () => {
      const request = new NextRequest('http://localhost:3006/api/users', {
        headers: { 'Accept-Version': 'V1' },
      });
      const version = getApiVersion(request);
      expect(version).toBe(DEFAULT_API_VERSION); // V1 is invalid, should default
    });

    it('should handle missing header gracefully', () => {
      const request = new NextRequest('http://localhost:3006/api/users', {
        headers: {},
      });
      const version = getApiVersion(request);
      expect(version).toBe(DEFAULT_API_VERSION);
    });
  });

  describe('Query Parameter Parsing', () => {
    it('should handle empty version parameter', () => {
      const request = new NextRequest('http://localhost:3006/api/users?version=');
      const version = getApiVersion(request);
      expect(version).toBe(DEFAULT_API_VERSION);
    });

    it('should handle multiple version parameters (uses first)', () => {
      const request = new NextRequest('http://localhost:3006/api/users?version=v1&version=v2');
      const version = getApiVersion(request);
      expect(version).toBe('v1');
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed URLs gracefully', () => {
      const request = new NextRequest('http://localhost:3006/api//v1//users');
      const version = getApiVersion(request);
      expect(version).toBe('v1');
    });

    it('should handle non-api paths', () => {
      const request = new NextRequest('http://localhost:3006/dashboard/v1/users');
      const version = getApiVersion(request);
      expect(version).toBe(DEFAULT_API_VERSION);
    });

    it('should handle root API path', () => {
      const request = new NextRequest('http://localhost:3006/api/v1');
      const version = getApiVersion(request);
      expect(version).toBe('v1');
    });
  });
});
