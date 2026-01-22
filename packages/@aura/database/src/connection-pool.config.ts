/**
 * Database Connection Pool Configuration
 * Optimizes PostgreSQL connection pooling for production environments
 */

import { Prisma, PrismaClient } from '@prisma/client';

export interface ConnectionPoolConfig {
  // Maximum number of connections in the pool
  connectionLimit?: number;

  // Maximum time to wait for a connection (seconds)
  poolTimeout?: number;

  // Connection idle timeout (seconds)
  idleTimeout?: number;

  // Maximum connection lifetime (seconds)
  maxLifetime?: number;
}

/**
 * Get optimal connection pool configuration based on environment
 */
export function getConnectionPoolConfig(): ConnectionPoolConfig {
  const nodeEnv = process.env.NODE_ENV || 'development';

  // Production configuration
  if (nodeEnv === 'production') {
    return {
      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '20', 10),
      poolTimeout: parseInt(process.env.DB_POOL_TIMEOUT || '10', 10),
      idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30', 10),
      maxLifetime: parseInt(process.env.DB_MAX_LIFETIME || '1800', 10), // 30 minutes
    };
  }

  // Staging configuration
  if (nodeEnv === 'staging') {
    return {
      connectionLimit: 15,
      poolTimeout: 10,
      idleTimeout: 30,
      maxLifetime: 1800,
    };
  }

  // Development configuration (more lenient)
  return {
    connectionLimit: 10,
    poolTimeout: 20,
    idleTimeout: 60,
    maxLifetime: 3600,
  };
}

/**
 * Build DATABASE_URL with connection pool parameters
 */
export function buildDatabaseUrl(baseUrl?: string): string {
  const url = baseUrl || process.env.DATABASE_URL;

  if (!url) {
    throw new Error('DATABASE_URL is not defined');
  }

  const config = getConnectionPoolConfig();

  // Parse existing URL
  const urlObj = new URL(url);

  // Add/update connection pool parameters
  urlObj.searchParams.set('connection_limit', config.connectionLimit!.toString());
  urlObj.searchParams.set('pool_timeout', config.poolTimeout!.toString());

  // Add SSL mode if in production
  if (process.env.NODE_ENV === 'production') {
    if (!urlObj.searchParams.has('sslmode')) {
      urlObj.searchParams.set('sslmode', 'require');
    }
  }

  // Add schema if not present
  if (!urlObj.searchParams.has('schema')) {
    urlObj.searchParams.set('schema', 'public');
  }

  return urlObj.toString();
}

/**
 * Prisma Client configuration with connection pooling
 */
export function createPrismaClient(options?: {
  log?: Prisma.LogLevel[];
  errorFormat?: Prisma.ErrorFormat;
}): PrismaClient {
  const config = getConnectionPoolConfig();

  const client = new PrismaClient({
    datasources: {
      db: {
        url: buildDatabaseUrl(),
      },
    },
    log: options?.log || (process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']),
    errorFormat: options?.errorFormat || 'pretty',
  });

  // Log connection pool configuration on initialization
  console.log('📊 Database Connection Pool Configuration:');
  console.log(`   Connection Limit: ${config.connectionLimit}`);
  console.log(`   Pool Timeout: ${config.poolTimeout}s`);
  console.log(`   Idle Timeout: ${config.idleTimeout}s`);
  console.log(`   Max Lifetime: ${config.maxLifetime}s`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);

  return client;
}

/**
 * Recommended PgBouncer configuration for production
 *
 * Save this as pgbouncer.ini:
 *
 * [databases]
 * auraos = host=localhost port=5432 dbname=auraos
 *
 * [pgbouncer]
 * listen_addr = 127.0.0.1
 * listen_port = 6432
 * auth_type = md5
 * auth_file = /etc/pgbouncer/userlist.txt
 * pool_mode = transaction
 * max_client_conn = 1000
 * default_pool_size = 20
 * min_pool_size = 5
 * reserve_pool_size = 5
 * reserve_pool_timeout = 3
 * max_db_connections = 50
 * max_user_connections = 50
 * server_lifetime = 3600
 * server_idle_timeout = 600
 * server_connect_timeout = 15
 * server_login_retry = 15
 * query_timeout = 0
 * query_wait_timeout = 120
 * client_idle_timeout = 0
 * client_login_timeout = 60
 * idle_transaction_timeout = 0
 * log_connections = 1
 * log_disconnections = 1
 * log_pooler_errors = 1
 *
 * Then update DATABASE_URL to point to PgBouncer:
 * DATABASE_URL=postgresql://user:password@localhost:6432/auraos
 */

/**
 * Health check for database connection pool
 */
export async function checkConnectionPool(client: PrismaClient): Promise<{
  healthy: boolean;
  activeConnections?: number;
  error?: string;
}> {
  try {
    // Simple query to test connection
    await client.$queryRaw`SELECT 1`;

    // Get connection pool stats (if available)
    // Note: This requires pg_stat_statements extension
    try {
      const stats = await client.$queryRaw<
        Array<{ count: number }>
      >`SELECT count(*) as count FROM pg_stat_activity WHERE datname = current_database()`;

      return {
        healthy: true,
        activeConnections: Number(stats[0].count),
      };
    } catch {
      // If stats not available, just return healthy
      return {
        healthy: true,
      };
    }
  } catch (error: any) {
    return {
      healthy: false,
      error: error.message,
    };
  }
}

/**
 * Graceful shutdown for connection pool
 */
export async function shutdownConnectionPool(client: PrismaClient): Promise<void> {
  console.log('🔌 Closing database connection pool...');

  try {
    await client.$disconnect();
    console.log('✅ Database connection pool closed successfully');
  } catch (error) {
    console.error('❌ Error closing database connection pool:', error);
    throw error;
  }
}

/**
 * Monitor connection pool usage
 * Call this periodically to log connection pool statistics
 */
export async function monitorConnectionPool(client: PrismaClient): Promise<void> {
  try {
    const stats = await client.$queryRaw<
      Array<{
        total: number;
        active: number;
        idle: number;
        waiting: number;
      }>
    >`
      SELECT
        count(*) as total,
        count(*) FILTER (WHERE state = 'active') as active,
        count(*) FILTER (WHERE state = 'idle') as idle,
        count(*) FILTER (WHERE wait_event_type IS NOT NULL) as waiting
      FROM pg_stat_activity
      WHERE datname = current_database()
    `;

    const stat = stats[0];

    console.log('📊 Connection Pool Stats:');
    console.log(`   Total: ${stat.total}`);
    console.log(`   Active: ${stat.active}`);
    console.log(`   Idle: ${stat.idle}`);
    console.log(`   Waiting: ${stat.waiting}`);

    // Warn if we're approaching the connection limit
    const config = getConnectionPoolConfig();
    if (stat.total >= config.connectionLimit! * 0.8) {
      console.warn(
        `⚠️  Connection pool usage is high (${stat.total}/${config.connectionLimit})`
      );
    }
  } catch (error) {
    console.error('Error monitoring connection pool:', error);
  }
}
