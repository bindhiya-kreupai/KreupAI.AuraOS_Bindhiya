/**
 * Smoke Test: Health Check Endpoint
 *
 * These tests verify that the application is running and
 * all critical services are operational after deployment.
 *
 * Smoke tests should:
 * - Run fast (< 30 seconds total)
 * - Test only critical paths
 * - Validate service availability
 * - Catch deployment issues early
 */

import { describe, it, expect } from 'vitest';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';

describe('Smoke Test: Health Check', () => {
  it('should respond to health check endpoint', async () => {
    const response = await fetch(`${API_BASE_URL}/api/health`);

    expect(response.status).toBe(200);

    const data = await response.json();

    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('timestamp');
  });

  it('should report healthy status', async () => {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const data = await response.json();

    expect(data.status).toBe('healthy');
  });

  it('should validate database connectivity', async () => {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const data = await response.json();

    expect(data.checks).toHaveProperty('database');
    expect(data.checks.database.status).toBe('healthy');
  });

  it('should validate Redis connectivity', async () => {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const data = await response.json();

    expect(data.checks).toHaveProperty('cache');
    expect(data.checks.cache.status).toBe('healthy');
  });

  it('should complete health check in under 5 seconds', async () => {
    const startTime = Date.now();

    const response = await fetch(`${API_BASE_URL}/api/health`);

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(5000);
  });

  it('should return valid JSON response', async () => {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const contentType = response.headers.get('content-type');

    expect(contentType).toContain('application/json');

    const data = await response.json();
    expect(data).toBeDefined();
  });

  it('should include environment information', async () => {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const data = await response.json();

    expect(data).toHaveProperty('environment');
    expect(['development', 'staging', 'production']).toContain(data.environment);
  });

  it('should validate messaging service availability', async () => {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const data = await response.json();

    if (data.checks.messaging) {
      expect(['healthy', 'degraded']).toContain(data.checks.messaging.status);
    }
  });

  it('should validate search service availability', async () => {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const data = await response.json();

    if (data.checks.search) {
      expect(['healthy', 'degraded']).toContain(data.checks.search.status);
    }
  });

  it('should handle errors gracefully', async () => {
    // Test with invalid endpoint
    const response = await fetch(`${API_BASE_URL}/api/health/invalid`);

    // Should return 404, not crash
    expect([404, 405]).toContain(response.status);
  });
});
