/**
 * Application Performance Monitoring (APM) Integration
 *
 * Provides real-time performance monitoring, transaction tracing,
 * and error tracking for the AuraOS application.
 *
 * Supported APM Providers:
 * - New Relic
 * - Datadog
 * - Elastic APM
 * - Custom implementation
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { logger } from '../logger';

/**
 * APM Configuration
 */
interface APMConfig {
  enabled: boolean;
  provider: 'newrelic' | 'datadog' | 'elastic' | 'custom' | 'none';
  serviceName: string;
  environment: string;
  sampleRate: number; // 0.0 to 1.0
  captureBody: boolean;
  captureHeaders: boolean;
  slowTransactionThreshold: number; // milliseconds
  verySlowTransactionThreshold: number; // milliseconds
}

const config: APMConfig = {
  enabled: process.env.APM_ENABLED === 'true',
  provider: (process.env.APM_PROVIDER as APMConfig['provider']) || 'custom',
  serviceName: process.env.APM_SERVICE_NAME || 'auraos-web',
  environment: process.env.NODE_ENV || 'development',
  sampleRate: parseFloat(process.env.APM_SAMPLE_RATE || '1.0'),
  captureBody: process.env.APM_CAPTURE_BODY !== 'false',
  captureHeaders: process.env.APM_CAPTURE_HEADERS !== 'false',
  slowTransactionThreshold: parseInt(process.env.APM_SLOW_THRESHOLD || '500', 10),
  verySlowTransactionThreshold: parseInt(process.env.APM_VERY_SLOW_THRESHOLD || '2000', 10)
};

/**
 * Transaction metadata
 */
export interface Transaction {
  id: string;
  name: string;
  type: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  result?: 'success' | 'error';
  statusCode?: number;
  method?: string;
  path?: string;
  userId?: string;
  tenantId?: string;
  metadata?: Record<string, any>;
  spans: Span[];
  errors: Error[];
}

/**
 * Span (sub-operation) metadata
 */
export interface Span {
  id: string;
  name: string;
  type: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  parentId?: string;
  metadata?: Record<string, any>;
}

/**
 * APM Manager - Core performance monitoring
 */
export class APMManager {
  private static instance: APMManager;
  private transactions: Map<string, Transaction> = new Map();
  private currentTransaction: Transaction | null = null;

  private constructor() {
    this.initialize();
  }

  static getInstance(): APMManager {
    if (!APMManager.instance) {
      APMManager.instance = new APMManager();
    }
    return APMManager.instance;
  }

  /**
   * Initialize APM provider
   */
  private initialize() {
    if (!config.enabled) {
      logger.info('APM monitoring is disabled');
      return;
    }

    logger.info({ provider: config.provider }, 'Initializing APM provider');

    switch (config.provider) {
      case 'newrelic':
        this.initializeNewRelic();
        break;
      case 'datadog':
        this.initializeDatadog();
        break;
      case 'elastic':
        this.initializeElastic();
        break;
      case 'custom':
        this.initializeCustom();
        break;
      default:
        logger.warn('No APM provider configured');
    }
  }

  /**
   * Initialize New Relic APM
   */
  private initializeNewRelic() {
    try {
      // New Relic auto-instruments when newrelic module is required
      // Typically done in instrumentation.ts or server startup
      if (process.env.NEW_RELIC_LICENSE_KEY) {
        logger.info('New Relic APM initialized');
      } else {
        logger.warn('NEW_RELIC_LICENSE_KEY not found');
      }
    } catch {
      logger.error({ error }, 'Failed to initialize New Relic');
    }
  }

  /**
   * Initialize Datadog APM
   */
  private initializeDatadog() {
    try {
      // Datadog tracer initialization
      if (process.env.DD_API_KEY) {
        logger.info('Datadog APM initialized');
      } else {
        logger.warn('DD_API_KEY not found');
      }
    } catch {
      logger.error({ error }, 'Failed to initialize Datadog');
    }
  }

  /**
   * Initialize Elastic APM
   */
  private initializeElastic() {
    try {
      if (process.env.ELASTIC_APM_SERVER_URL) {
        logger.info('Elastic APM initialized');
      } else {
        logger.warn('ELASTIC_APM_SERVER_URL not found');
      }
    } catch {
      logger.error({ error }, 'Failed to initialize Elastic APM');
    }
  }

  /**
   * Initialize Custom APM (in-house monitoring)
   */
  private initializeCustom() {
    logger.info('Custom APM initialized');
  }

  /**
   * Start a new transaction
   */
  startTransaction(name: string, type: string = 'request'): Transaction {
    const transaction: Transaction = {
      id: this.generateId(),
      name,
      type,
      startTime: Date.now(),
      spans: [],
      errors: []
    };

    this.transactions.set(transaction.id, transaction);
    this.currentTransaction = transaction;

    logger.debug({ transactionId: transaction.id, name, type }, 'Transaction started');

    return transaction;
  }

  /**
   * End current transaction
   */
  endTransaction(result: 'success' | 'error' = 'success', statusCode?: number) {
    if (!this.currentTransaction) return;

    const transaction = this.currentTransaction;
    transaction.endTime = Date.now();
    transaction.duration = transaction.endTime - transaction.startTime;
    transaction.result = result;
    transaction.statusCode = statusCode;

    // Log slow transactions
    if (transaction.duration > config.slowTransactionThreshold) {
      const level = transaction.duration > config.verySlowTransactionThreshold ? 'warn' : 'info';

      logger[level]({
        transactionId: transaction.id,
        name: transaction.name,
        duration: transaction.duration,
        statusCode: transaction.statusCode,
        result: transaction.result
      }, 'Slow transaction detected');
    }

    // Send to APM provider
    this.sendTransaction(transaction);

    // Cleanup
    this.currentTransaction = null;
    this.transactions.delete(transaction.id);
  }

  /**
   * Start a span (sub-operation)
   */
  startSpan(name: string, type: string = 'db.query'): Span {
    const span: Span = {
      id: this.generateId(),
      name,
      type,
      startTime: Date.now(),
      parentId: this.currentTransaction?.id
    };

    if (this.currentTransaction) {
      this.currentTransaction.spans.push(span);
    }

    logger.debug({ spanId: span.id, name, type }, 'Span started');

    return span;
  }

  /**
   * End a span
   */
  endSpan(span: Span) {
    span.endTime = Date.now();
    span.duration = span.endTime - span.startTime;

    logger.debug({ spanId: span.id, duration: span.duration }, 'Span ended');
  }

  /**
   * Record an error in the current transaction
   */
  recordError(error: Error) {
    if (this.currentTransaction) {
      this.currentTransaction.errors.push(error);
    }

    logger.error({ error, transactionId: this.currentTransaction?.id }, 'Error in transaction');
  }

  /**
   * Set transaction metadata
   */
  setTransactionMetadata(metadata: Record<string, any>) {
    if (this.currentTransaction) {
      this.currentTransaction.metadata = {
        ...this.currentTransaction.metadata,
        ...metadata
      };
    }
  }

  /**
   * Set custom attributes
   */
  setCustomAttributes(attributes: Record<string, any>) {
    if (this.currentTransaction) {
      this.currentTransaction.metadata = {
        ...this.currentTransaction.metadata,
        customAttributes: {
          ...(this.currentTransaction.metadata?.customAttributes || {}),
          ...attributes
        }
      };
    }
  }

  /**
   * Send transaction to APM provider
   */
  private async sendTransaction(transaction: Transaction) {
    if (!config.enabled) return;

    // Sample rate check
    if (Math.random() > config.sampleRate) {
      logger.debug({ transactionId: transaction.id }, 'Transaction sampled out');
      return;
    }

    switch (config.provider) {
      case 'custom':
        await this.sendToCustomAPM(transaction);
        break;
      // Other providers are auto-instrumented
      default:
        logger.debug({ transactionId: transaction.id }, 'Transaction auto-instrumented');
    }
  }

  /**
   * Send to custom APM backend
   */
  private async sendToCustomAPM(transaction: Transaction) {
    try {
      // Store in database or send to external service
      logger.info({
        transactionId: transaction.id,
        name: transaction.name,
        duration: transaction.duration,
        result: transaction.result,
        spanCount: transaction.spans.length,
        errorCount: transaction.errors.length
      }, 'APM transaction recorded');

      // TODO: Implement actual storage/transmission
      // Example: await fetch('/api/monitoring/apm', { method: 'POST', body: JSON.stringify(transaction) });
    } catch {
      logger.error({ error }, 'Failed to send APM transaction');
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Get current transaction
   */
  getCurrentTransaction(): Transaction | null {
    return this.currentTransaction;
  }

  /**
   * Check if APM is enabled
   */
  isEnabled(): boolean {
    return config.enabled;
  }

  /**
   * Get APM configuration
   */
  getConfig(): APMConfig {
    return { ...config };
  }
}

/**
 * APM Middleware for Next.js API routes
 */
export function withAPM<T = any>(
  handler: (request: NextRequest, context: any) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest, context: any): Promise<NextResponse<T>> => {
    const apm = APMManager.getInstance();

    if (!apm.isEnabled()) {
      return handler(request, context);
    }

    // Extract route information
    const method = request.method;
    const path = new URL(request.url).pathname;
    const transactionName = `${method} ${path}`;

    // Start transaction
    const transaction = apm.startTransaction(transactionName, 'http.request');

    // Set transaction metadata
    transaction.method = method;
    transaction.path = path;

    // Capture headers if enabled
    if (config.captureHeaders) {
      const headers: Record<string, string> = {};
      request.headers.forEach((value, key) => {
        if (!key.toLowerCase().includes('authorization') && !key.toLowerCase().includes('cookie')) {
          headers[key] = value;
        }
      });
      apm.setTransactionMetadata({ headers });
    }

    // Capture user context if available
    const userId = request.headers.get('x-user-id');
    const tenantId = request.headers.get('x-tenant-id');
    if (userId) transaction.userId = userId;
    if (tenantId) transaction.tenantId = tenantId;

    try {
      // Execute handler
      const response = await handler(request, context);

      // End transaction
      apm.endTransaction('success', response.status);

      // Add APM headers to response
      const enhancedResponse = new NextResponse(response.body, response);
      enhancedResponse.headers.set('X-Transaction-ID', transaction.id);
      if (transaction.duration) {
        enhancedResponse.headers.set('X-Response-Time', `${transaction.duration}ms`);
      }

      return enhancedResponse;
    } catch {
      // Record error
      apm.recordError(error as Error);
      apm.endTransaction('error', 500);

      throw error;
    }
  };
}

/**
 * Decorator for database operations
 */
export async function traceDatabase<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const apm = APMManager.getInstance();

  if (!apm.isEnabled()) {
    return fn();
  }

  const span = apm.startSpan(operation, 'db.query');

  try {
    const result = await fn();
    apm.endSpan(span);
    return result;
  } catch {
    apm.endSpan(span);
    apm.recordError(error as Error);
    throw error;
  }
}

/**
 * Decorator for external HTTP calls
 */
export async function traceHTTP<T>(
  url: string,
  fn: () => Promise<T>
): Promise<T> {
  const apm = APMManager.getInstance();

  if (!apm.isEnabled()) {
    return fn();
  }

  const span = apm.startSpan(`HTTP ${url}`, 'external.http');
  span.metadata = { url };

  try {
    const result = await fn();
    apm.endSpan(span);
    return result;
  } catch {
    apm.endSpan(span);
    apm.recordError(error as Error);
    throw error;
  }
}

/**
 * Decorator for custom operations
 */
export async function trace<T>(
  name: string,
  type: string,
  fn: () => Promise<T>
): Promise<T> {
  const apm = APMManager.getInstance();

  if (!apm.isEnabled()) {
    return fn();
  }

  const span = apm.startSpan(name, type);

  try {
    const result = await fn();
    apm.endSpan(span);
    return result;
  } catch {
    apm.endSpan(span);
    apm.recordError(error as Error);
    throw error;
  }
}

/**
 * Get APM singleton instance
 */
export const apm = APMManager.getInstance();

/**
 * Export configuration
 */
export { config as apmConfig };
