export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',

  // Notifications
  NOTIFICATION_NEW: 'notification.new',
  NOTIFICATION_READ: 'notification.read',

  // Approvals
  APPROVAL_PENDING: 'approval.pending',
  APPROVAL_COMPLETED: 'approval.completed',

  // Attendance
  ATTENDANCE_UPDATE: 'attendance.update',
  ATTENDANCE_CLOCK_IN: 'attendance.clock_in',
  ATTENDANCE_CLOCK_OUT: 'attendance.clock_out',

  // Leave
  LEAVE_STATUS_CHANGE: 'leave.status_change',
  LEAVE_REQUESTED: 'leave.requested',

  // Chat
  CHAT_MESSAGE: 'chat.message',
  CHAT_TYPING: 'chat.typing',

  // Presence
  PRESENCE_UPDATE: 'presence.update',
  PRESENCE_ONLINE: 'presence.online',
  PRESENCE_OFFLINE: 'presence.offline',

  // System
  SYSTEM_MAINTENANCE: 'system.maintenance',
  SYSTEM_UPDATE: 'system.update',
} as const;

export type SocketEventName = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];

export type NotificationPayload = {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'approval';
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
};

export type ApprovalPayload = {
  id: string;
  type: 'leave' | 'expense' | 'timesheet' | 'requisition' | 'document';
  title: string;
  requestedBy: string;
  priority: 'low' | 'medium' | 'high';
};

export type AttendancePayload = {
  employeeId: string;
  employeeName: string;
  action: 'clock_in' | 'clock_out';
  timestamp: string;
  location?: string;
};

export type LeaveStatusPayload = {
  leaveId: string;
  employeeId: string;
  employeeName: string;
  status: 'approved' | 'rejected' | 'cancelled';
  leaveType: string;
  startDate: string;
  endDate: string;
};

export type ChatMessagePayload = {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  channelId?: string;
  timestamp: string;
};

export type PresencePayload = {
  userId: string;
  userName: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen?: string;
};

export type SocketEventPayload = {
  [SOCKET_EVENTS.NOTIFICATION_NEW]: NotificationPayload;
  [SOCKET_EVENTS.APPROVAL_PENDING]: ApprovalPayload;
  [SOCKET_EVENTS.APPROVAL_COMPLETED]: ApprovalPayload & { decision: 'approved' | 'rejected' };
  [SOCKET_EVENTS.ATTENDANCE_UPDATE]: AttendancePayload;
  [SOCKET_EVENTS.LEAVE_STATUS_CHANGE]: LeaveStatusPayload;
  [SOCKET_EVENTS.CHAT_MESSAGE]: ChatMessagePayload;
  [SOCKET_EVENTS.PRESENCE_UPDATE]: PresencePayload;
};
