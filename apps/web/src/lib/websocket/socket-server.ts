/**
 * WebSocket Server Setup
 * Server-side Socket.IO configuration for real-time events
 */

import { SOCKET_EVENTS, type SocketEventPayload } from './socket-events';

interface ServerSocketConfig {
  port?: number;
  cors?: {
    origin: string | string[];
    credentials?: boolean;
  };
  path?: string;
}

interface ConnectedClient {
  id: string;
  userId: string;
  tenantId: string;
  connectedAt: Date;
  rooms: string[];
}

const connectedClients = new Map<string, ConnectedClient>();

export function createSocketServer(config: ServerSocketConfig = {}) {
  const {
    port = parseInt(process.env.WS_PORT || '3001'),
    cors = { origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', credentials: true },
    path = '/ws',
  } = config;

  // Server setup stub - in production would use socket.io Server
  const server = {
    port,
    cors,
    path,
    clients: connectedClients,

    onConnection(handler: (client: ConnectedClient) => void) {
      console.log(`[WebSocket] Server listening on port ${port}${path}`);
      return handler;
    },

    onDisconnect(handler: (clientId: string) => void) {
      return handler;
    },

    broadcast(event: string, payload: unknown, room?: string) {
      const targets = room
        ? Array.from(connectedClients.values()).filter((c) => c.rooms.includes(room))
        : Array.from(connectedClients.values());
      console.log(`[WebSocket] Broadcasting ${event} to ${targets.length} clients`);
    },

    emitToUser(userId: string, event: string, payload: unknown) {
      const client = Array.from(connectedClients.values()).find((c) => c.userId === userId);
      if (client) {
        console.log(`[WebSocket] Emitting ${event} to user ${userId}`);
      }
    },

    emitToTenant(tenantId: string, event: string, payload: unknown) {
      const clients = Array.from(connectedClients.values()).filter((c) => c.tenantId === tenantId);
      console.log(`[WebSocket] Emitting ${event} to ${clients.length} clients in tenant ${tenantId}`);
    },
  };

  return server;
}

// Event emitter helpers for use in API routes
export function emitNotification(userId: string, notification: SocketEventPayload['notification.new']) {
  console.log(`[WebSocket] Notification for ${userId}:`, notification.title);
}

export function emitApprovalPending(userId: string, approval: SocketEventPayload['approval.pending']) {
  console.log(`[WebSocket] Approval pending for ${userId}:`, approval.type);
}

export function emitApprovalCompleted(userId: string, approval: SocketEventPayload['approval.completed']) {
  console.log(`[WebSocket] Approval ${approval.decision} for ${userId}`);
}

export function emitAttendanceUpdate(tenantId: string, update: SocketEventPayload['attendance.update']) {
  console.log(`[WebSocket] Attendance update in tenant ${tenantId}:`, update.action);
}

export function emitLeaveStatusChange(userId: string, leave: SocketEventPayload['leave.status_change']) {
  console.log(`[WebSocket] Leave ${leave.status} for ${userId}`);
}

export function emitPresenceUpdate(tenantId: string, presence: SocketEventPayload['presence.update']) {
  console.log(`[WebSocket] Presence ${presence.status} for ${presence.userId} in ${tenantId}`);
}

export type SocketServer = ReturnType<typeof createSocketServer>;
