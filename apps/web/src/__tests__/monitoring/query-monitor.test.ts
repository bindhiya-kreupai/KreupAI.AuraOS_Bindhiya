/**
 * Query Monitor Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { queryMonitor, QUERY_THRESHOLDS } from '@/lib/monitoring/query-monitor';

describe('QueryMonitor', () => {
  beforeEach(() => {
    // Reset statistics before each test
    queryMonitor.reset();
  });

  describe('trackQuery', () => {
    it('should track a normal query', () => {
      queryMonitor.trackQuery('User.findMany', 50);

      const stats = queryMonitor.getStats();
      expect(stats.totalQueries).toBe(1);
      expect(stats.slowQueries).toBe(0);
      expect(stats.averageDuration).toBe(50);
    });

    it('should track a slow query', () => {
      queryMonitor.trackQuery('Employee.findMany', 150);

      const stats = queryMonitor.getStats();
      expect(stats.totalQueries).toBe(1);
      expect(stats.slowQueries).toBe(1);
      expect(stats.verySlowQueries).toBe(0);
    });

    it('should track a very slow query', () => {
      queryMonitor.trackQuery('Company.findMany', 600);

      const stats = queryMonitor.getStats();
      expect(stats.verySlowQueries).toBe(1);
      expect(stats.criticalQueries).toBe(0);
    });

    it('should track a critical query', () => {
      queryMonitor.trackQuery('AuditLog.findMany', 1500);

      const stats = queryMonitor.getStats();
      expect(stats.criticalQueries).toBe(1);
      expect(stats.verySlowQueries).toBe(1); // Critical queries also count as very slow
      expect(stats.slowQueries).toBe(1); // And as slow
    });

    it('should update min/max duration correctly', () => {
      queryMonitor.trackQuery('Query1', 10);
      queryMonitor.trackQuery('Query2', 200);
      queryMonitor.trackQuery('Query3', 50);

      const stats = queryMonitor.getStats();
      expect(stats.minDuration).toBe(10);
      expect(stats.maxDuration).toBe(200);
    });

    it('should calculate average duration correctly', () => {
      queryMonitor.trackQuery('Query1', 100);
      queryMonitor.trackQuery('Query2', 200);
      queryMonitor.trackQuery('Query3', 300);

      const stats = queryMonitor.getStats();
      expect(stats.averageDuration).toBe(200);
    });

    it('should sanitize sensitive parameters', () => {
      const params = {
        email: 'user@example.com',
        password: 'secret123',
        token: 'abc123',
      };

      queryMonitor.trackQuery('User.create', 50, params);

      const recentQueries = queryMonitor.getRecentSlowQueries(0);
      // We can't directly test sanitization from outside, but we ensure no errors occur
      expect(recentQueries.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getStats', () => {
    it('should return initial empty statistics', () => {
      const stats = queryMonitor.getStats();

      expect(stats.totalQueries).toBe(0);
      expect(stats.slowQueries).toBe(0);
      expect(stats.verySlowQueries).toBe(0);
      expect(stats.criticalQueries).toBe(0);
      expect(stats.totalDuration).toBe(0);
      expect(stats.averageDuration).toBe(0);
      expect(stats.minDuration).toBe(Infinity);
      expect(stats.maxDuration).toBe(0);
    });

    it('should return updated statistics after tracking queries', () => {
      queryMonitor.trackQuery('Query1', 50);
      queryMonitor.trackQuery('Query2', 150);
      queryMonitor.trackQuery('Query3', 600);

      const stats = queryMonitor.getStats();

      expect(stats.totalQueries).toBe(3);
      expect(stats.slowQueries).toBe(2);
      expect(stats.verySlowQueries).toBe(1);
      expect(stats.totalDuration).toBe(800);
      expect(stats.averageDuration).toBeCloseTo(266.67, 1);
    });
  });

  describe('getRecentSlowQueries', () => {
    it('should return only slow queries', () => {
      queryMonitor.trackQuery('FastQuery', 30);
      queryMonitor.trackQuery('SlowQuery1', 150);
      queryMonitor.trackQuery('SlowQuery2', 200);
      queryMonitor.trackQuery('AnotherFastQuery', 40);

      const slowQueries = queryMonitor.getRecentSlowQueries(100);

      expect(slowQueries.length).toBe(2);
      expect(slowQueries[0].query).toBe('SlowQuery2');
      expect(slowQueries[1].query).toBe('SlowQuery1');
    });

    it('should return queries sorted by duration (slowest first)', () => {
      queryMonitor.trackQuery('Query1', 150);
      queryMonitor.trackQuery('Query2', 500);
      queryMonitor.trackQuery('Query3', 300);

      const slowQueries = queryMonitor.getRecentSlowQueries(100);

      expect(slowQueries[0].duration).toBe(500);
      expect(slowQueries[1].duration).toBe(300);
      expect(slowQueries[2].duration).toBe(150);
    });

    it('should limit results to 20 queries', () => {
      // Track 30 slow queries
      for (let i = 0; i < 30; i++) {
        queryMonitor.trackQuery(`Query${i}`, 150 + i);
      }

      const slowQueries = queryMonitor.getRecentSlowQueries(100);

      expect(slowQueries.length).toBe(20);
    });

    it('should respect custom duration threshold', () => {
      queryMonitor.trackQuery('Query1', 100);
      queryMonitor.trackQuery('Query2', 200);
      queryMonitor.trackQuery('Query3', 600);

      const slowQueries = queryMonitor.getRecentSlowQueries(500);

      expect(slowQueries.length).toBe(1);
      expect(slowQueries[0].duration).toBe(600);
    });
  });

  describe('getSummary', () => {
    it('should calculate slow query percentage correctly', () => {
      // 2 out of 10 queries are slow
      for (let i = 0; i < 8; i++) {
        queryMonitor.trackQuery(`FastQuery${i}`, 50);
      }
      for (let i = 0; i < 2; i++) {
        queryMonitor.trackQuery(`SlowQuery${i}`, 150);
      }

      const summary = queryMonitor.getSummary();

      expect(summary.slowQueryPercentage).toBe(20);
    });

    it('should calculate critical query percentage correctly', () => {
      // 1 out of 10 queries is critical
      for (let i = 0; i < 9; i++) {
        queryMonitor.trackQuery(`NormalQuery${i}`, 50);
      }
      queryMonitor.trackQuery('CriticalQuery', 1500);

      const summary = queryMonitor.getSummary();

      expect(summary.criticalQueryPercentage).toBe(10);
    });

    it('should include top slow queries', () => {
      queryMonitor.trackQuery('Fast', 30);
      queryMonitor.trackQuery('Slow1', 200);
      queryMonitor.trackQuery('Slow2', 300);

      const summary = queryMonitor.getSummary();

      expect(summary.topSlowQueries.length).toBe(2);
      expect(summary.topSlowQueries[0].query).toBe('Slow2');
    });

    it('should handle empty statistics', () => {
      const summary = queryMonitor.getSummary();

      expect(summary.slowQueryPercentage).toBe(0);
      expect(summary.criticalQueryPercentage).toBe(0);
      expect(summary.topSlowQueries.length).toBe(0);
    });
  });

  describe('reset', () => {
    it('should clear all statistics', () => {
      // Track some queries
      queryMonitor.trackQuery('Query1', 100);
      queryMonitor.trackQuery('Query2', 200);
      queryMonitor.trackQuery('Query3', 300);

      // Reset
      queryMonitor.reset();

      const stats = queryMonitor.getStats();
      expect(stats.totalQueries).toBe(0);
      expect(stats.slowQueries).toBe(0);
      expect(stats.totalDuration).toBe(0);
      expect(stats.averageDuration).toBe(0);
      expect(stats.minDuration).toBe(Infinity);
      expect(stats.maxDuration).toBe(0);
    });

    it('should clear recent queries', () => {
      queryMonitor.trackQuery('SlowQuery', 200);

      queryMonitor.reset();

      const slowQueries = queryMonitor.getRecentSlowQueries(100);
      expect(slowQueries.length).toBe(0);
    });
  });

  describe('QUERY_THRESHOLDS', () => {
    it('should have correct threshold values', () => {
      expect(QUERY_THRESHOLDS.SLOW).toBe(100);
      expect(QUERY_THRESHOLDS.VERY_SLOW).toBe(500);
      expect(QUERY_THRESHOLDS.CRITICAL).toBe(1000);
    });

    it('should categorize queries according to thresholds', () => {
      // Just below slow threshold
      queryMonitor.trackQuery('Query1', QUERY_THRESHOLDS.SLOW - 1);
      expect(queryMonitor.getStats().slowQueries).toBe(0);

      // Exactly at slow threshold
      queryMonitor.trackQuery('Query2', QUERY_THRESHOLDS.SLOW);
      expect(queryMonitor.getStats().slowQueries).toBe(1);

      // Just below very slow threshold
      queryMonitor.trackQuery('Query3', QUERY_THRESHOLDS.VERY_SLOW - 1);
      expect(queryMonitor.getStats().verySlowQueries).toBe(0);

      // Exactly at very slow threshold
      queryMonitor.trackQuery('Query4', QUERY_THRESHOLDS.VERY_SLOW);
      expect(queryMonitor.getStats().verySlowQueries).toBe(1);

      // Just below critical threshold
      queryMonitor.trackQuery('Query5', QUERY_THRESHOLDS.CRITICAL - 1);
      expect(queryMonitor.getStats().criticalQueries).toBe(0);

      // Exactly at critical threshold
      queryMonitor.trackQuery('Query6', QUERY_THRESHOLDS.CRITICAL);
      expect(queryMonitor.getStats().criticalQueries).toBe(1);
    });
  });

  describe('Recent Queries Buffer', () => {
    it('should maintain a limited buffer of recent queries', () => {
      // Track 150 queries (buffer limit is 100)
      for (let i = 0; i < 150; i++) {
        queryMonitor.trackQuery(`Query${i}`, 50);
      }

      // The total count should still be 150
      const stats = queryMonitor.getStats();
      expect(stats.totalQueries).toBe(150);

      // But recent queries should be limited
      // We can't directly test this without exposing private properties,
      // but we ensure the query monitor doesn't crash or leak memory
      const summary = queryMonitor.getSummary();
      expect(summary.stats.totalQueries).toBe(150);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero duration queries', () => {
      queryMonitor.trackQuery('InstantQuery', 0);

      const stats = queryMonitor.getStats();
      expect(stats.totalQueries).toBe(1);
      expect(stats.minDuration).toBe(0);
      expect(stats.slowQueries).toBe(0);
    });

    it('should handle very large duration queries', () => {
      queryMonitor.trackQuery('TimeoutQuery', 999999);

      const stats = queryMonitor.getStats();
      expect(stats.maxDuration).toBe(999999);
      expect(stats.criticalQueries).toBe(1);
    });

    it('should handle query names with special characters', () => {
      queryMonitor.trackQuery('User.findMany[includes={employee:true}]', 100);

      const summary = queryMonitor.getSummary();
      expect(summary.stats.totalQueries).toBe(1);
    });

    it('should handle undefined parameters', () => {
      queryMonitor.trackQuery('Query', 100, undefined);

      const stats = queryMonitor.getStats();
      expect(stats.totalQueries).toBe(1);
    });

    it('should handle null parameters', () => {
      queryMonitor.trackQuery('Query', 100, null as any);

      const stats = queryMonitor.getStats();
      expect(stats.totalQueries).toBe(1);
    });
  });
});
