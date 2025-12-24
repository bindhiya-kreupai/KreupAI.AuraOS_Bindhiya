/**
 * Services Index
 * Export all services
 */

// Core API
export { apiService } from './api.service';

// Authentication
export { authService } from './auth.service';

// Employee Features
export { attendanceService } from './attendance.service';
export { leaveService } from './leave.service';
export { payrollService } from './payroll.service';

// Location & Notifications (Phase 2)
export { locationService } from './location.service';
export { notificationService } from './notification.service';

// Re-export types
export type {
  Coordinates,
  GeofenceRegion,
  LocationResult,
  GeofenceStatus,
} from './location.service';

export type {
  PushNotificationToken,
  NotificationPayload,
  NotificationChannel,
  NotificationCategory,
  LocalNotification,
} from './notification.service';
