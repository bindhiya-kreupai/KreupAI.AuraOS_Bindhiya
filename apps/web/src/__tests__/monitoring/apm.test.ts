/**
 * APM Integration Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { APMManager, trace, traceDatabase, traceHTTP } from '@/lib/monitoring/apm';

describe('APM Manager', () => {
  let apm: APMManager;

  beforeEach(() => {
    apm = APMManager.getInstance();
  });

  describe('Transaction Management', () => {
    it('should start and end a transaction', () => {
      const transaction = apm.startTransaction('test-transaction', 'http.request');

      expect(transaction).toBeDefined();
      expect(transaction.id).toBeTruthy();
      expect(transaction.name).toBe('test-transaction');
      expect(transaction.type).toBe('http.request');
      expect(transaction.startTime).toBeTruthy();

      apm.endTransaction('success', 200);

      expect(transaction.endTime).toBeTruthy();
      expect(transaction.duration).toBeGreaterThan(0);
      expect(transaction.result).toBe('success');
      expect(transaction.statusCode).toBe(200);
    });

    it('should track current transaction', () => {
      const transaction = apm.startTransaction('current-test', 'test');
      const current = apm.getCurrentTransaction();

      expect(current).toBe(transaction);

      apm.endTransaction();

      expect(apm.getCurrentTransaction()).toBeNull();
    });

    it('should handle multiple sequential transactions', () => {
      const tx1 = apm.startTransaction('tx1', 'test');
      apm.endTransaction('success');

      const tx2 = apm.startTransaction('tx2', 'test');
      apm.endTransaction('success');

      expect(tx1.id).not.toBe(tx2.id);
    });
  });

  describe('Span Management', () => {
    it('should create spans within a transaction', () => {
      const transaction = apm.startTransaction('span-test', 'test');
      const span1 = apm.startSpan('db.query', 'database');
      const span2 = apm.startSpan('http.call', 'external');

      expect(span1.id).toBeTruthy();
      expect(span1.parentId).toBe(transaction.id);
      expect(transaction.spans).toContain(span1);
      expect(transaction.spans).toContain(span2);

      apm.endSpan(span1);
      apm.endSpan(span2);
      apm.endTransaction();

      expect(span1.duration).toBeGreaterThan(0);
      expect(span2.duration).toBeGreaterThan(0);
    });

    it('should track span metadata', () => {
      apm.startTransaction('metadata-test', 'test');
      const span = apm.startSpan('operation', 'custom');

      span.metadata = {
        query: 'SELECT * FROM users',
        params: { id: 123 }
      };

      expect(span.metadata).toEqual({
        query: 'SELECT * FROM users',
        params: { id: 123 }
      });

      apm.endSpan(span);
      apm.endTransaction();
    });
  });

  describe('Error Tracking', () => {
    it('should record errors in transaction', () => {
      const transaction = apm.startTransaction('error-test', 'test');
      const error = new Error('Test error');

      apm.recordError(error);

      expect(transaction.errors).toContain(error);
      expect(transaction.errors.length).toBe(1);

      apm.endTransaction('error', 500);
    });

    it('should track multiple errors', () => {
      const transaction = apm.startTransaction('multi-error-test', 'test');

      apm.recordError(new Error('Error 1'));
      apm.recordError(new Error('Error 2'));
      apm.recordError(new Error('Error 3'));

      expect(transaction.errors.length).toBe(3);

      apm.endTransaction('error');
    });
  });

  describe('Custom Attributes', () => {
    it('should set transaction metadata', () => {
      const transaction = apm.startTransaction('metadata-test', 'test');

      apm.setTransactionMetadata({
        userId: 'user-123',
        tenantId: 'tenant-456'
      });

      expect(transaction.metadata).toEqual({
        userId: 'user-123',
        tenantId: 'tenant-456'
      });

      apm.endTransaction();
    });

    it('should set custom attributes', () => {
      const transaction = apm.startTransaction('attributes-test', 'test');

      apm.setCustomAttributes({
        feature: 'payments',
        version: '2.0'
      });

      expect(transaction.metadata?.customAttributes).toEqual({
        feature: 'payments',
        version: '2.0'
      });

      apm.endTransaction();
    });

    it('should merge custom attributes', () => {
      const transaction = apm.startTransaction('merge-test', 'test');

      apm.setCustomAttributes({ attr1: 'value1' });
      apm.setCustomAttributes({ attr2: 'value2' });

      expect(transaction.metadata?.customAttributes).toEqual({
        attr1: 'value1',
        attr2: 'value2'
      });

      apm.endTransaction();
    });
  });

  describe('Configuration', () => {
    it('should return APM configuration', () => {
      const config = apm.getConfig();

      expect(config).toBeDefined();
      expect(config).toHaveProperty('enabled');
      expect(config).toHaveProperty('provider');
      expect(config).toHaveProperty('serviceName');
      expect(config).toHaveProperty('environment');
      expect(config).toHaveProperty('sampleRate');
    });

    it('should check if APM is enabled', () => {
      const enabled = apm.isEnabled();
      expect(typeof enabled).toBe('boolean');
    });
  });
});

describe('APM Trace Utilities', () => {
  describe('trace()', () => {
    it('should trace a custom operation', async () => {
      const result = await trace('test-operation', 'custom', async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'success';
      });

      expect(result).toBe('success');
    });

    it('should handle errors in traced operations', async () => {
      await expect(
        trace('error-operation', 'custom', async () => {
          throw new Error('Test error');
        })
      ).rejects.toThrow('Test error');
    });

    it('should work when APM is disabled', async () => {
      // Should not throw even if APM is disabled
      const result = await trace('disabled-test', 'custom', async () => {
        return 42;
      });

      expect(result).toBe(42);
    });
  });

  describe('traceDatabase()', () => {
    it('should trace database operations', async () => {
      const result = await traceDatabase('SELECT * FROM users', async () => {
        await new Promise(resolve => setTimeout(resolve, 5));
        return [{ id: 1, name: 'User 1' }];
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ id: 1, name: 'User 1' });
    });

    it('should handle database errors', async () => {
      await expect(
        traceDatabase('SELECT * FROM invalid', async () => {
          throw new Error('Database error');
        })
      ).rejects.toThrow('Database error');
    });
  });

  describe('traceHTTP()', () => {
    it('should trace HTTP calls', async () => {
      const result = await traceHTTP('https://api.example.com/data', async () => {
        await new Promise(resolve => setTimeout(resolve, 5));
        return { data: 'response' };
      });

      expect(result).toEqual({ data: 'response' });
    });

    it('should handle HTTP errors', async () => {
      await expect(
        traceHTTP('https://api.example.com/fail', async () => {
          throw new Error('HTTP error');
        })
      ).rejects.toThrow('HTTP error');
    });
  });
});

describe('APM Performance', () => {
  it('should have minimal overhead', async () => {
    const apm = APMManager.getInstance();

    // Measure overhead
    const start = Date.now();

    apm.startTransaction('performance-test', 'test');
    const span = apm.startSpan('operation', 'test');
    apm.endSpan(span);
    apm.endTransaction();

    const overhead = Date.now() - start;

    // Should be less than 5ms
    expect(overhead).toBeLessThan(5);
  });

  it('should handle high-frequency operations', async () => {
    const apm = APMManager.getInstance();
    const iterations = 1000;

    const start = Date.now();

    for (let i = 0; i < iterations; i++) {
      apm.startTransaction(`test-${i}`, 'test');
      apm.endTransaction();
    }

    const duration = Date.now() - start;
    const avgPerOp = duration / iterations;

    // Should average less than 1ms per operation
    expect(avgPerOp).toBeLessThan(1);
  });
});

describe('APM Integration Scenarios', () => {
  it('should track a complete API request flow', async () => {
    const apm = APMManager.getInstance();

    // Start request transaction
    const transaction = apm.startTransaction('GET /api/users', 'http.request');
    transaction.method = 'GET';
    transaction.path = '/api/users';

    // Database query span
    const dbSpan = apm.startSpan('User.findMany', 'db.query');
    await new Promise(resolve => setTimeout(resolve, 20));
    apm.endSpan(dbSpan);

    // External API call span
    const httpSpan = apm.startSpan('GET https://api.external.com', 'external.http');
    await new Promise(resolve => setTimeout(resolve, 50));
    apm.endSpan(httpSpan);

    // Add metadata
    apm.setCustomAttributes({
      userId: 'user-123',
      resultCount: 10
    });

    // End transaction
    apm.endTransaction('success', 200);

    expect(transaction.duration).toBeGreaterThan(70);
    expect(transaction.spans).toHaveLength(2);
    expect(transaction.result).toBe('success');
    expect(transaction.statusCode).toBe(200);
  });

  it('should handle nested spans', async () => {
    const apm = APMManager.getInstance();

    apm.startTransaction('nested-test', 'test');

    // Parent operation
    const parentSpan = apm.startSpan('parent-operation', 'custom');

    // Child operation 1
    const child1 = apm.startSpan('child-1', 'custom');
    await new Promise(resolve => setTimeout(resolve, 10));
    apm.endSpan(child1);

    // Child operation 2
    const child2 = apm.startSpan('child-2', 'custom');
    await new Promise(resolve => setTimeout(resolve, 15));
    apm.endSpan(child2);

    apm.endSpan(parentSpan);
    apm.endTransaction();

    const transaction = apm.getCurrentTransaction();
    // Transaction ended, should be null
    expect(transaction).toBeNull();
  });
});
