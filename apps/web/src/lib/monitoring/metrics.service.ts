/**
 * Metrics Service using @aura/monitoring
 * Wrapper for tracking business and technical metrics
 */

import { MetricsCollector } from '@aura/monitoring';
import { logger } from '@/lib/logger';

/**
 * Metrics Service
 */
export class MetricsService {
  private collector = new MetricsCollector();

  /**
   * Track API request
   */
  trackAPIRequest(
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number
  ): void {
    this.collector.recordAPILatency(endpoint, method, duration, statusCode);
  }

  /**
   * Track database query
   */
  trackDatabaseQuery(query: string, duration: number): void {
    this.collector.recordDBQueryTime(query, duration);
  }

  /**
   * Track cache access
   */
  trackCacheAccess(hit: boolean, key: string): void {
    this.collector.recordCacheAccess(hit, key);
  }

  /**
   * Track business metrics
   */
  trackBusinessMetric(metric: string, value: number = 1, tags?: Record<string, string>): void {
    this.collector.recordBusinessEvent(metric, value, tags);
  }

  /**
   * Track employee created
   */
  trackEmployeeCreated(tenantId: string): void {
    this.collector.increment('aura.business.employees.created', 1, { tenantId });
  }

  /**
   * Track payroll processed
   */
  trackPayrollProcessed(tenantId: string, count: number): void {
    this.collector.increment('aura.business.payroll.processed', count, { tenantId });
  }

  /**
   * Track leave approved
   */
  trackLeaveApproved(tenantId: string): void {
    this.collector.increment('aura.business.leaves.approved', 1, { tenantId });
  }

  /**
   * Track document uploaded
   */
  trackDocumentUploaded(tenantId: string, type: string): void {
    this.collector.increment('aura.business.documents.uploaded', 1, { tenantId, type });
  }
}

// Export singleton instance
export const metricsService = new MetricsService();
