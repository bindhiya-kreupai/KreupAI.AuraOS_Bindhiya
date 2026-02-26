/**
 * @module redis-adapter
 * @description Socket.IO Redis adapter for horizontal scaling.
 *
 * When multiple notification-service instances are running, Socket.IO events
 * emitted on instance A must reach clients connected to instance B.  The Redis
 * pub/sub adapter bridges these instances.
 *
 * Usage:
 *   import { applyRedisAdapter } from './redis-adapter';
 *   const io = new Server(httpServer, { ... });
 *   await applyRedisAdapter(io);
 */

import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';

function buildRedisClient(label: string): Redis {
  const client = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null, // Required for pub/sub clients
    enableReadyCheck: false,
    lazyConnect: true,
  });

  client.on('connect', () =>
    console.log(`[RedisAdapter] ${label} client connected`)
  );
  client.on('error', (err) =>
    console.error(`[RedisAdapter] ${label} client error:`, err.message)
  );

  return client;
}

/**
 * Apply the @socket.io/redis-adapter to an existing Socket.IO server.
 * Creates two dedicated Redis clients (pub + sub) as required by the adapter.
 *
 * @param io - The Socket.IO Server instance to configure.
 * @returns   The pub/sub Redis clients (for optional cleanup on shutdown).
 */
export async function applyRedisAdapter(
  io: Server
): Promise<{ pubClient: Redis; subClient: Redis }> {
  const pubClient = buildRedisClient('pub');
  const subClient = pubClient.duplicate();

  try {
    await Promise.all([pubClient.connect(), subClient.connect()]);
  } catch (err) {
    console.error('[RedisAdapter] Failed to connect Redis clients:', err);
    // Non-fatal in development — fall back to in-memory adapter
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[RedisAdapter] Falling back to in-memory adapter (single-instance mode)');
      return { pubClient, subClient };
    }
    throw err;
  }

  io.adapter(createAdapter(pubClient, subClient));
  console.log('[RedisAdapter] Redis adapter applied — multi-instance mode active');

  return { pubClient, subClient };
}
