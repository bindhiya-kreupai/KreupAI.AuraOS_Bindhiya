/**
 * Database Connection Pool Configuration
 *
 * Optimizes database connections for production workloads.
 * Implements connection pooling with proper limits and timeouts.
 */

import { logger } from '@/lib/logger';

/**
 * Pool configuration interface
 */
export interface PoolConfig {
  // Connection limits
  connectionLimit: number;
  minConnections: number;
  maxIdleTime: number; // milliseconds

  // Timeouts
  connectionTimeout: number; // milliseconds
  queryTimeout: number; // milliseconds
  idleTimeout: number; // milliseconds

  // Health checking
  healthCheckInterval: number; // milliseconds
  healthCheckTimeout: number; // milliseconds

  // Retry settings
  retryAttempts: number;
  retryDelay: number; // milliseconds

  // Logging
  logQueries: boolean;
  logSlowQueries: boolean;
  slowQueryThreshold: number; // milliseconds
}

/**
 * Environment-based pool configuration
 */
function getEnvironmentConfig(): Partial<PoolConfig> {
  const env = process.env.NODE_ENV || 'development';

  const configs: Record<string, Partial<PoolConfig>> = {
    development: {
      connectionLimit: 5,
      minConnections: 1,
      logQueries: true,
      logSlowQueries: true,
      slowQueryThreshold: 100
    },
    test: {
      connectionLimit: 3,
      minConnections: 1,
      logQueries: false,
      logSlowQueries: false
    },
    staging: {
      connectionLimit: 15,
      minConnections: 3,
      logQueries: false,
      logSlowQueries: true,
      slowQueryThreshold: 200
    },
    production: {
      connectionLimit: 25,
      minConnections: 5,
      logQueries: false,
      logSlowQueries: true,
      slowQueryThreshold: 500
    }
  };

  return configs[env] || configs.development;
}

/**
 * Default pool configuration
 */
const defaultConfig: PoolConfig = {
  // Connection limits - based on CPU cores and expected load
  connectionLimit: parseInt(process.env.DB_POOL_SIZE || '10', 10),
  minConnections: parseInt(process.env.DB_POOL_MIN || '2', 10),
  maxIdleTime: parseInt(process.env.DB_POOL_MAX_IDLE || '30000', 10),

  // Timeouts
  connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000', 10),
  queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000', 10),
  idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '60000', 10),

  // Health checking
  healthCheckInterval: parseInt(process.env.DB_HEALTH_CHECK_INTERVAL || '30000', 10),
  healthCheckTimeout: parseInt(process.env.DB_HEALTH_CHECK_TIMEOUT || '5000', 10),

  // Retry settings
  retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '3', 10),
  retryDelay: parseInt(process.env.DB_RETRY_DELAY || '1000', 10),

  // Logging
  logQueries: process.env.DB_LOG_QUERIES === 'true',
  logSlowQueries: process.env.DB_LOG_SLOW_QUERIES !== 'false',
  slowQueryThreshold: parseInt(process.env.DB_SLOW_QUERY_THRESHOLD || '200', 10)
};

/**
 * Get pool configuration with environment overrides
 */
export function getPoolConfig(): PoolConfig {
  const envConfig = getEnvironmentConfig();
  return { ...defaultConfig, ...envConfig };
}

/**
 * Generate Prisma datasource URL with pool parameters
 */
export function getPrismaConnectionUrl(baseUrl?: string): string {
  const url = baseUrl || process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not defined');
  }

  const config = getPoolConfig();
  const urlObj = new URL(url);

  // Add connection pool parameters
  urlObj.searchParams.set('connection_limit', config.connectionLimit.toString());
  urlObj.searchParams.set('pool_timeout', Math.floor(config.connectionTimeout / 1000).toString());

  // Add SSL for production
  if (process.env.NODE_ENV === 'production' && !urlObj.searchParams.has('sslmode')) {
    urlObj.searchParams.set('sslmode', 'require');
  }

  return urlObj.toString();
}

/**
 * Prisma configuration for connection pooling
 */
export function getPrismaConfig() {
  const config = getPoolConfig();

  return {
    datasources: {
      db: {
        url: getPrismaConnectionUrl()
      }
    },
    log: config.logQueries
      ? ['query', 'info', 'warn', 'error']
      : config.logSlowQueries
        ? ['warn', 'error']
        : ['error']
  };
}

/**
 * Pool health status
 */
export interface PoolHealth {
  isHealthy: boolean;
  activeConnections: number;
  idleConnections: number;
  waitingRequests: number;
  totalConnections: number;
  lastHealthCheck: Date;
  errors: string[];
}

/**
 * Connection pool metrics
 */
export interface PoolMetrics {
  connectionsCreated: number;
  connectionsDestroyed: number;
  connectionsReused: number;
  connectionErrors: number;
  queryCount: number;
  avgQueryTime: number;
  slowQueryCount: number;
  lastReset: Date;
}

/**
 * Pool monitoring class
 */
class PoolMonitor {
  private static instance: PoolMonitor;
  private health: PoolHealth;
  private metrics: PoolMetrics;
  private healthCheckInterval?: ReturnType<typeof setInterval>;

  private constructor() {
    this.health = {
      isHealthy: true,
      activeConnections: 0,
      idleConnections: 0,
      waitingRequests: 0,
      totalConnections: 0,
      lastHealthCheck: new Date(),
      errors: []
    };

    this.metrics = {
      connectionsCreated: 0,
      connectionsDestroyed: 0,
      connectionsReused: 0,
      connectionErrors: 0,
      queryCount: 0,
      avgQueryTime: 0,
      slowQueryCount: 0,
      lastReset: new Date()
    };
  }

  static getInstance(): PoolMonitor {
    if (!PoolMonitor.instance) {
      PoolMonitor.instance = new PoolMonitor();
    }
    return PoolMonitor.instance;
  }

  /**
   * Start health check monitoring
   */
  startHealthChecks(checkFn: () => Promise<boolean>): void {
    const config = getPoolConfig();

    this.healthCheckInterval = setInterval(async () => {
      try {
        const isHealthy = await checkFn();
        this.health.isHealthy = isHealthy;
        this.health.lastHealthCheck = new Date();

        if (!isHealthy) {
          this.health.errors.push(`Health check failed at ${new Date().toISOString()}`);
          if (this.health.errors.length > 10) {
            this.health.errors = this.health.errors.slice(-10);
          }
          logger.warn('Database pool health check failed');
        }
      } catch (error: any) {
        this.health.isHealthy = false;
        this.health.errors.push(`Health check error: ${(error as Error).message}`);
        logger.error({ error }, 'Database pool health check error');
      }
    }, config.healthCheckInterval);

    logger.info({ interval: config.healthCheckInterval }, 'Pool health monitoring started');
  }

  /**
   * Stop health check monitoring
   */
  stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
      logger.info('Pool health monitoring stopped');
    }
  }

  /**
   * Record connection created
   */
  recordConnectionCreated(): void {
    this.metrics.connectionsCreated++;
    this.health.totalConnections++;
    this.health.idleConnections++;
  }

  /**
   * Record connection destroyed
   */
  recordConnectionDestroyed(): void {
    this.metrics.connectionsDestroyed++;
    this.health.totalConnections = Math.max(0, this.health.totalConnections - 1);
  }

  /**
   * Record connection acquired
   */
  recordConnectionAcquired(): void {
    this.metrics.connectionsReused++;
    this.health.activeConnections++;
    this.health.idleConnections = Math.max(0, this.health.idleConnections - 1);
  }

  /**
   * Record connection released
   */
  recordConnectionReleased(): void {
    this.health.activeConnections = Math.max(0, this.health.activeConnections - 1);
    this.health.idleConnections++;
  }

  /**
   * Record connection error
   */
  recordConnectionError(error: Error): void {
    this.metrics.connectionErrors++;
    this.health.errors.push(`Connection error: ${error.message}`);
    if (this.health.errors.length > 10) {
      this.health.errors = this.health.errors.slice(-10);
    }
  }

  /**
   * Record query execution
   */
  recordQuery(duration: number): void {
    const config = getPoolConfig();

    this.metrics.queryCount++;

    // Update average query time (rolling average)
    this.metrics.avgQueryTime =
      (this.metrics.avgQueryTime * (this.metrics.queryCount - 1) + duration) /
      this.metrics.queryCount;

    if (duration > config.slowQueryThreshold) {
      this.metrics.slowQueryCount++;
    }
  }

  /**
   * Get pool health status
   */
  getHealth(): PoolHealth {
    return { ...this.health };
  }

  /**
   * Get pool metrics
   */
  getMetrics(): PoolMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      connectionsCreated: 0,
      connectionsDestroyed: 0,
      connectionsReused: 0,
      connectionErrors: 0,
      queryCount: 0,
      avgQueryTime: 0,
      slowQueryCount: 0,
      lastReset: new Date()
    };
    logger.info('Pool metrics reset');
  }
}

// Export singleton
export const poolMonitor = PoolMonitor.getInstance();

/**
 * Calculate optimal pool size based on system resources
 */
export function calculateOptimalPoolSize(): number {
  // Formula: connections = (cores * 2) + disk_spindles
  // For SSDs, effective_spindles = 1
  // Conservative estimate for cloud deployments

  const cpuCount = typeof process !== 'undefined'
    ? require('os').cpus()?.length || 4
    : 4;

  const optimalSize = (cpuCount * 2) + 1;

  // Cap at reasonable limits
  return Math.min(Math.max(optimalSize, 5), 50);
}

/**
 * Validate pool configuration
 */
export function validatePoolConfig(config: Partial<PoolConfig>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (config.connectionLimit !== undefined) {
    if (config.connectionLimit < 1) {
      errors.push('connectionLimit must be at least 1');
    }
    if (config.connectionLimit > 100) {
      errors.push('connectionLimit should not exceed 100');
    }
  }

  if (config.minConnections !== undefined && config.connectionLimit !== undefined) {
    if (config.minConnections > config.connectionLimit) {
      errors.push('minConnections cannot exceed connectionLimit');
    }
  }

  if (config.connectionTimeout !== undefined && config.connectionTimeout < 1000) {
    errors.push('connectionTimeout should be at least 1000ms');
  }

  if (config.queryTimeout !== undefined && config.queryTimeout < 1000) {
    errors.push('queryTimeout should be at least 1000ms');
  }

  return { valid: errors.length === 0, errors };
}

export default {
  getPoolConfig,
  getPrismaConnectionUrl,
  getPrismaConfig,
  poolMonitor,
  calculateOptimalPoolSize,
  validatePoolConfig
};
