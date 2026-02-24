/**
 * Smoke Test: Critical API Endpoints
 *
 * Tests that critical API endpoints are responding correctly
 * after deployment. These tests validate:
 * - Endpoint availability
 * - Response format
 * - Error handling
 * - Basic authentication flow
 */

import { describe, it, expect } from 'vitest';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';

describe('Smoke Test: Critical API Endpoints', () => {
  describe('Authentication Endpoints', () => {
    it('should respond to login endpoint', async () => {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'test123',
        }),
      });

      // Should return 401 (not authenticated) or 400 (validation error)
      // Not 500 (server error) or timeout
      expect([400, 401]).toContain(response.status);
    });

    it('should respond to CSRF token endpoint', async () => {
      const response = await fetch(`${API_BASE_URL}/api/auth/csrf-token`);

      // Should return 401 (no session) or 200 (valid session)
      // Not 500 (server error)
      expect([200, 401]).toContain(response.status);
    });

    it('should respond to logout endpoint', async () => {
      const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
      });

      // Should handle logout gracefully even without session
      expect([200, 401]).toContain(response.status);
    });
  });

  describe('Employee Management Endpoints', () => {
    it('should respond to employees list endpoint', async () => {
      const response = await fetch(`${API_BASE_URL}/api/employees`);

      // Should return 401 (authentication required)
      // Not 500 (server error)
      expect(response.status).toBe(401);
    });

    it('should return proper error format', async () => {
      const response = await fetch(`${API_BASE_URL}/api/employees`);

      expect(response.headers.get('content-type')).toContain('application/json');

      const data = await response.json();

      expect(data).toHaveProperty('success');
      expect(data.success).toBe(false);
      expect(data).toHaveProperty('error');
      expect(data.error).toHaveProperty('code');
      expect(data.error).toHaveProperty('message');
    });
  });

  describe('Leave Management Endpoints', () => {
    it('should respond to leave applications endpoint', async () => {
      const response = await fetch(`${API_BASE_URL}/api/leave/applications`);

      // Should return 401 (authentication required)
      expect(response.status).toBe(401);
    });

    it('should respond to leave policies endpoint', async () => {
      const response = await fetch(`${API_BASE_URL}/api/leave/policies`);

      // Should return 401 (authentication required)
      expect(response.status).toBe(401);
    });
  });

  describe('Attendance Endpoints', () => {
    it('should respond to attendance records endpoint', async () => {
      const response = await fetch(`${API_BASE_URL}/api/attendance/records`);

      // Should return 401 (authentication required)
      expect(response.status).toBe(401);
    });
  });

  describe('Payroll Endpoints', () => {
    it('should respond to payroll runs endpoint', async () => {
      const response = await fetch(`${API_BASE_URL}/api/payroll/runs`);

      // Should return 401 (authentication required)
      expect(response.status).toBe(401);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const response = await fetch(`${API_BASE_URL}/api/nonexistent-endpoint`);

      expect(response.status).toBe(404);
    });

    it('should handle malformed requests gracefully', async () => {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json {',
      });

      // Should return 400 (bad request), not 500 (server error)
      expect([400, 422]).toContain(response.status);
    });

    it('should handle missing Content-Type header', async () => {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'test' }),
      });

      // Should not crash, should return proper error
      expect([400, 401, 415]).toContain(response.status);
    });
  });

  describe('Response Performance', () => {
    it('should respond to API requests within reasonable time', async () => {
      const startTime = Date.now();

      const response = await fetch(`${API_BASE_URL}/api/health`);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(3000); // 3 seconds
    });

    it('should handle concurrent requests', async () => {
      const requests = Array.from({ length: 10 }, () =>
        fetch(`${API_BASE_URL}/api/health`)
      );

      const responses = await Promise.all(requests);

      // All requests should succeed
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });
    });
  });
});
