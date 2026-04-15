/**
 * @module socket-server
 * @description Socket.IO server for real-time notification delivery in AuraOS.
 *
 * Architecture:
 *   - Namespace: /notifications
 *   - Rooms:     user:{userId}  (each authenticated user joins their own room)
 *   - Events emitted to clients:
 *       notification:new          — new notification payload
 *       notification:read         — a notification was marked read
 *       notification:count-update — unread count changed
 *
 * JWT Authentication:
 *   Clients must pass a valid JWT as the socket handshake auth token:
 *     const socket = io('/notifications', { auth: { token: '<jwt>' } });
 *
 * Integration with notification-orchestrator:
 *   Call setSocketServer(notificationNamespace) after initialization so the
 *   orchestrator can call io.to(`user:${userId}`).emit('notification:new', ...).
 */

import { Server as HttpServer } from 'http';
import { Server, Socket, Namespace } from 'socket.io';
import jwt from 'jsonwebtoken';
import { setSocketServer } from '../services/notification-orchestrator';
import { applyRedisAdapter } from './redis-adapter';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SocketUser {
  userId: string;
  tenantId?: string;
  email?: string;
  roles?: string[];
}

declare module 'socket.io' {
  interface Socket {
    user?: SocketUser;
  }
}

// ── JWT verification ──────────────────────────────────────────────────────────

if (!process.env.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set. Refusing to start with an insecure default.');
}
const JWT_SECRET = process.env.JWT_SECRET;

function verifyToken(token: string): SocketUser {
  const decoded = jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
  const userId =
    (decoded.sub as string) ||
    (decoded.userId as string) ||
    (decoded.id as string);

  if (!userId) throw new Error('Token missing user identifier');

  return {
    userId,
    tenantId: decoded.tenantId as string | undefined,
    email: decoded.email as string | undefined,
    roles: decoded.roles as string[] | undefined,
  };
}

// ── Socket.IO initialization ──────────────────────────────────────────────────

let _io: Server | null = null;
let _namespace: Namespace | null = null;

// Tracks connected sockets per user (for presence/count)
const connectedSockets = new Map<string, Set<string>>();

/**
 * Initialize the Socket.IO server, attach JWT middleware, and wire rooms.
 *
 * @param httpServer - The Node.js HTTP server created alongside Fastify.
 * @param enableRedis - Whether to apply the Redis adapter (default: true in production).
 * @returns The Socket.IO Namespace (/notifications).
 */
export async function initSocketServer(
  httpServer: HttpServer,
  enableRedis = process.env.NODE_ENV === 'production'
): Promise<Namespace> {
  _io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/socket.io',
    pingTimeout: 30_000,
    pingInterval: 10_000,
    transports: ['websocket', 'polling'],
  });

  // Apply Redis adapter for horizontal scaling in production
  if (enableRedis) {
    try {
      await applyRedisAdapter(_io);
    } catch (err) {
      console.warn('[SocketServer] Redis adapter failed, continuing with in-memory:', err);
    }
  }

  // Create /notifications namespace
  _namespace = _io.of('/notifications');

  // ── JWT authentication middleware ──────────────────────────────────────────

  _namespace.use((socket: Socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers.authorization?.replace('Bearer ', ''));

    if (!token) {
      return next(new Error('Authentication token is required'));
    }

    try {
      socket.user = verifyToken(token);
      next();
    } catch (err) {
      const error = new Error('Invalid or expired authentication token');
      (error as NodeJS.ErrnoException).code = 'UNAUTHORIZED';
      next(error);
    }
  });

  // ── Connection handler ─────────────────────────────────────────────────────

  _namespace.on('connection', (socket: Socket) => {
    const user = socket.user!;
    const userRoom = `user:${user.userId}`;
    const tenantRoom = user.tenantId ? `tenant:${user.tenantId}` : null;

    // Join personal and tenant rooms
    socket.join(userRoom);
    if (tenantRoom) socket.join(tenantRoom);

    // Track connected sockets per user
    if (!connectedSockets.has(user.userId)) {
      connectedSockets.set(user.userId, new Set());
    }
    connectedSockets.get(user.userId)!.add(socket.id);

    console.log(
      `[SocketServer] User connected | userId=${user.userId} socketId=${socket.id} room=${userRoom}`
    );

    // Emit a welcome event with connection confirmation
    socket.emit('connected', {
      socketId: socket.id,
      userId: user.userId,
      rooms: [userRoom, ...(tenantRoom ? [tenantRoom] : [])],
      timestamp: new Date().toISOString(),
    });

    // ── Client events ──────────────────────────────────────────────────────

    // Client marks a notification as read and broadcasts count update
    socket.on('notification:mark-read', (data: { notificationId: string }) => {
      if (!data?.notificationId) return;
      // Broadcast to all user's connected devices
      _namespace!.to(userRoom).emit('notification:read', {
        notificationId: data.notificationId,
        readAt: new Date().toISOString(),
      });
    });

    // Client requests current unread count (they can also GET /api/v1/notifications/unread-count)
    socket.on('notification:get-count', () => {
      // The HTTP API handles the actual DB query; emit a placeholder here
      socket.emit('notification:count-update', { count: 0, userId: user.userId });
    });

    // ── Disconnect ──────────────────────────────────────────────────────────

    socket.on('disconnect', (reason) => {
      const userSockets = connectedSockets.get(user.userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          connectedSockets.delete(user.userId);
        }
      }

      console.log(
        `[SocketServer] User disconnected | userId=${user.userId} socketId=${socket.id} reason=${reason}`
      );
    });

    socket.on('error', (err) => {
      console.error(`[SocketServer] Socket error | userId=${user.userId} socketId=${socket.id}`, err);
    });
  });

  // Wire namespace into the notification orchestrator so it can call
  // _namespace.to(`user:${userId}`).emit(...)
  setSocketServer({
    to: (room: string) => ({
      emit: (event: string, data: unknown) => {
        _namespace!.to(room).emit(event, data);
      },
    }),
  });

  console.log('[SocketServer] Socket.IO server initialized on namespace /notifications');
  return _namespace;
}

// ── Utility helpers ───────────────────────────────────────────────────────────

/**
 * Emit a new notification event to a specific user's room.
 * Can be called from HTTP route handlers after persisting to DB.
 */
export function emitNewNotification(
  userId: string,
  notification: Record<string, unknown>
): void {
  if (!_namespace) {
    console.warn('[SocketServer] Namespace not initialized — cannot emit notification');
    return;
  }
  _namespace.to(`user:${userId}`).emit('notification:new', {
    ...notification,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Emit an unread count update to a specific user.
 */
export function emitUnreadCount(userId: string, count: number): void {
  if (!_namespace) return;
  _namespace.to(`user:${userId}`).emit('notification:count-update', {
    userId,
    count,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Check if a user has any active socket connections (presence).
 */
export function isUserOnline(userId: string): boolean {
  return (connectedSockets.get(userId)?.size ?? 0) > 0;
}

/**
 * Get total connected socket count (for metrics).
 */
export function getConnectedCount(): number {
  let total = 0;
  connectedSockets.forEach((sockets) => { total += sockets.size; });
  return total;
}

/**
 * Return the Socket.IO server instance (for testing or advanced usage).
 */
export function getSocketServer(): Server | null {
  return _io;
}
