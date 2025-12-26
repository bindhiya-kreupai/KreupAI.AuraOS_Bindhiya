/**
 * WebSocket Server
 * Real-time notification system using WebSockets
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '@/lib/logger';
import { redis } from '@/lib/cache/redis';

export interface NotificationPayload {
  type: string;
  title: string;
  message: string;
  data?: any;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  userId?: string;
  companyId?: string;
  departmentId?: string;
  createdAt: string;
}

export enum NotificationType {
  // Payroll notifications
  PAYROLL_RUN_STARTED = 'PAYROLL_RUN_STARTED',
  PAYROLL_RUN_COMPLETED = 'PAYROLL_RUN_COMPLETED',
  PAYROLL_RUN_FAILED = 'PAYROLL_RUN_FAILED',
  PAYSLIP_GENERATED = 'PAYSLIP_GENERATED',

  // Leave notifications
  LEAVE_REQUEST_SUBMITTED = 'LEAVE_REQUEST_SUBMITTED',
  LEAVE_REQUEST_APPROVED = 'LEAVE_REQUEST_APPROVED',
  LEAVE_REQUEST_REJECTED = 'LEAVE_REQUEST_REJECTED',
  LEAVE_BALANCE_LOW = 'LEAVE_BALANCE_LOW',

  // Attendance notifications
  ATTENDANCE_MARKED = 'ATTENDANCE_MARKED',
  LATE_ARRIVAL = 'LATE_ARRIVAL',
  MISSING_ATTENDANCE = 'MISSING_ATTENDANCE',
  REGULARIZATION_APPROVED = 'REGULARIZATION_APPROVED',

  // Report notifications
  REPORT_GENERATION_STARTED = 'REPORT_GENERATION_STARTED',
  REPORT_READY = 'REPORT_READY',
  REPORT_GENERATION_FAILED = 'REPORT_GENERATION_FAILED',

  // System notifications
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
  SYSTEM_UPDATE = 'SYSTEM_UPDATE',

  // Employee notifications
  EMPLOYEE_ONBOARDED = 'EMPLOYEE_ONBOARDED',
  EMPLOYEE_UPDATED = 'EMPLOYEE_UPDATED',
  EMPLOYEE_TERMINATED = 'EMPLOYEE_TERMINATED',
}

/**
 * WebSocket Server Manager
 */
export class WebSocketServer {
  private io: SocketIOServer | null = null;
  private connectedClients: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds
  private socketToUser: Map<string, string> = new Map(); // socketId -> userId

  constructor() {
    logger.info('WebSocket server instance created');
  }

  /**
   * Initialize WebSocket server
   */
  initialize(httpServer: HTTPServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      path: '/api/v1/ws',
      transports: ['websocket', 'polling'],
    });

    this.io.on('connection', (socket: Socket) => {
      this.handleConnection(socket);
    });

    logger.info('WebSocket server initialized');
  }

  /**
   * Handle client connection
   */
  private handleConnection(socket: Socket): void {
    const userId = socket.handshake.auth.userId;
    const companyId = socket.handshake.auth.companyId;

    if (!userId) {
      logger.warn({ socketId: socket.id }, 'Client connected without userId, disconnecting');
      socket.disconnect(true);
      return;
    }

    // Track connection
    if (!this.connectedClients.has(userId)) {
      this.connectedClients.set(userId, new Set());
    }
    this.connectedClients.get(userId)!.add(socket.id);
    this.socketToUser.set(socket.id, userId);

    // Join user-specific room
    socket.join(`user:${userId}`);

    // Join company-specific room if provided
    if (companyId) {
      socket.join(`company:${companyId}`);
    }

    logger.info(
      {
        socketId: socket.id,
        userId,
        companyId,
        totalConnections: this.connectedClients.get(userId)!.size,
      },
      'Client connected'
    );

    // Send connection confirmation
    socket.emit('connected', {
      message: 'Connected to AuraOS notification system',
      userId,
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    });

    // Handle custom events
    this.setupEventHandlers(socket, userId);

    // Handle disconnection
    socket.on('disconnect', () => {
      this.handleDisconnection(socket, userId);
    });
  }

  /**
   * Setup event handlers for socket
   */
  private setupEventHandlers(socket: Socket, userId: string): void {
    // Subscribe to specific notification types
    socket.on('subscribe', (data: { types: NotificationType[] }) => {
      data.types.forEach((type) => {
        socket.join(`notification:${type}`);
      });

      logger.info(
        { userId, socketId: socket.id, types: data.types },
        'Client subscribed to notification types'
      );

      socket.emit('subscribed', {
        types: data.types,
        timestamp: new Date().toISOString(),
      });
    });

    // Unsubscribe from notification types
    socket.on('unsubscribe', (data: { types: NotificationType[] }) => {
      data.types.forEach((type) => {
        socket.leave(`notification:${type}`);
      });

      logger.info(
        { userId, socketId: socket.id, types: data.types },
        'Client unsubscribed from notification types'
      );
    });

    // Mark notification as read
    socket.on('mark_read', async (data: { notificationId: string }) => {
      await this.markNotificationAsRead(userId, data.notificationId);

      socket.emit('notification_read', {
        notificationId: data.notificationId,
        timestamp: new Date().toISOString(),
      });
    });

    // Get unread count
    socket.on('get_unread_count', async () => {
      const count = await this.getUnreadCount(userId);

      socket.emit('unread_count', {
        count,
        timestamp: new Date().toISOString(),
      });
    });

    // Ping/pong for connection health check
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });
  }

  /**
   * Handle client disconnection
   */
  private handleDisconnection(socket: Socket, userId: string): void {
    // Remove from tracking
    const userSockets = this.connectedClients.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        this.connectedClients.delete(userId);
      }
    }
    this.socketToUser.delete(socket.id);

    logger.info(
      {
        socketId: socket.id,
        userId,
        remainingConnections: userSockets?.size || 0,
      },
      'Client disconnected'
    );
  }

  /**
   * Send notification to specific user
   */
  async notifyUser(userId: string, notification: NotificationPayload): Promise<void> {
    if (!this.io) {
      logger.warn('WebSocket server not initialized');
      return;
    }

    const notificationWithId = {
      id: crypto.randomUUID(),
      ...notification,
      createdAt: notification.createdAt || new Date().toISOString(),
    };

    // Store notification in Redis for persistence
    await this.storeNotification(userId, notificationWithId);

    // Emit to user's room
    this.io.to(`user:${userId}`).emit('notification', notificationWithId);

    logger.info(
      { userId, notificationType: notification.type },
      'Notification sent to user'
    );
  }

  /**
   * Send notification to all users in a company
   */
  async notifyCompany(companyId: string, notification: NotificationPayload): Promise<void> {
    if (!this.io) {
      logger.warn('WebSocket server not initialized');
      return;
    }

    const notificationWithId = {
      id: crypto.randomUUID(),
      ...notification,
      companyId,
      createdAt: notification.createdAt || new Date().toISOString(),
    };

    this.io.to(`company:${companyId}`).emit('notification', notificationWithId);

    logger.info(
      { companyId, notificationType: notification.type },
      'Notification sent to company'
    );
  }

  /**
   * Broadcast notification to specific type subscribers
   */
  async broadcast(type: NotificationType, notification: NotificationPayload): Promise<void> {
    if (!this.io) {
      logger.warn('WebSocket server not initialized');
      return;
    }

    const notificationWithId = {
      id: crypto.randomUUID(),
      ...notification,
      type,
      createdAt: notification.createdAt || new Date().toISOString(),
    };

    this.io.to(`notification:${type}`).emit('notification', notificationWithId);

    logger.info({ notificationType: type }, 'Notification broadcasted');
  }

  /**
   * Store notification in Redis
   */
  private async storeNotification(userId: string, notification: any): Promise<void> {
    const key = `notifications:${userId}`;
    const notifications = (await redis.get(key)) || [];

    notifications.unshift(notification);

    // Keep only last 100 notifications
    if (notifications.length > 100) {
      notifications.splice(100);
    }

    await redis.set(key, notifications, 604800); // 7 days TTL
  }

  /**
   * Mark notification as read
   */
  private async markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
    const key = `notifications:${userId}`;
    const notifications = (await redis.get(key)) || [];

    const notification = notifications.find((n: any) => n.id === notificationId);
    if (notification) {
      notification.read = true;
      notification.readAt = new Date().toISOString();
      await redis.set(key, notifications, 604800);
    }
  }

  /**
   * Get unread notification count
   */
  private async getUnreadCount(userId: string): Promise<number> {
    const key = `notifications:${userId}`;
    const notifications = (await redis.get(key)) || [];
    return notifications.filter((n: any) => !n.read).length;
  }

  /**
   * Get connected client count
   */
  getConnectedClientCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return this.connectedClients.has(userId);
  }

  /**
   * Get all connected users
   */
  getConnectedUsers(): string[] {
    return Array.from(this.connectedClients.keys());
  }

  /**
   * Shutdown server gracefully
   */
  async shutdown(): Promise<void> {
    if (this.io) {
      await this.io.close();
      this.connectedClients.clear();
      this.socketToUser.clear();
      logger.info('WebSocket server shut down');
    }
  }
}

// Export singleton instance
export const wsServer = new WebSocketServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  await wsServer.shutdown();
});

process.on('SIGTERM', async () => {
  await wsServer.shutdown();
});
