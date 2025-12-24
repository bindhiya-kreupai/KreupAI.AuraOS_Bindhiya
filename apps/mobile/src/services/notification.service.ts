/**
 * Push Notification Service
 * FCM (Firebase Cloud Messaging) and APNS integration
 *
 * Features:
 * - Push notification registration
 * - Local notifications
 * - Notification channels (Android)
 * - Deep linking from notifications
 * - Badge management
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { apiService } from './api.service';

// ============================================================================
// TYPES
// ============================================================================

export interface PushNotificationToken {
  token: string;
  type: 'expo' | 'fcm' | 'apns';
  platform: 'ios' | 'android';
  deviceId?: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: boolean;
  badge?: number;
  categoryId?: string;
}

export interface NotificationChannel {
  id: string;
  name: string;
  description?: string;
  importance?: Notifications.AndroidImportance;
  sound?: boolean;
  vibration?: boolean;
  lightColor?: string;
}

export type NotificationCategory =
  | 'LEAVE_REQUEST'
  | 'LEAVE_APPROVED'
  | 'LEAVE_REJECTED'
  | 'ATTENDANCE_REMINDER'
  | 'PAYSLIP_AVAILABLE'
  | 'APPROVAL_PENDING'
  | 'ANNOUNCEMENT'
  | 'GENERAL';

export interface LocalNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  trigger?: {
    seconds?: number;
    date?: Date;
    repeats?: boolean;
  };
}

// ============================================================================
// NOTIFICATION CHANNELS (Android)
// ============================================================================

const NOTIFICATION_CHANNELS: NotificationChannel[] = [
  {
    id: 'leave',
    name: 'Leave Notifications',
    description: 'Leave requests and approvals',
    importance: Notifications.AndroidImportance.HIGH,
    sound: true,
    vibration: true,
  },
  {
    id: 'attendance',
    name: 'Attendance Notifications',
    description: 'Check-in/out reminders and alerts',
    importance: Notifications.AndroidImportance.HIGH,
    sound: true,
    vibration: true,
  },
  {
    id: 'payroll',
    name: 'Payroll Notifications',
    description: 'Payslip and salary notifications',
    importance: Notifications.AndroidImportance.HIGH,
    sound: true,
    vibration: true,
  },
  {
    id: 'approvals',
    name: 'Approval Notifications',
    description: 'Pending approvals for managers',
    importance: Notifications.AndroidImportance.HIGH,
    sound: true,
    vibration: true,
  },
  {
    id: 'announcements',
    name: 'Company Announcements',
    description: 'Company-wide announcements',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: true,
    vibration: false,
  },
  {
    id: 'general',
    name: 'General Notifications',
    description: 'Other notifications',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: true,
    vibration: false,
  },
];

// ============================================================================
// NOTIFICATION SERVICE
// ============================================================================

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;
  private lastNotificationReceivedHandler: ((notification: Notifications.Notification) => void) | null = null;
  private lastNotificationResponseHandler: ((response: Notifications.NotificationResponse) => void) | null = null;

  /**
   * Initialize notifications
   * Call this early in app startup
   */
  async initialize(): Promise<void> {
    // Configure notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Set up Android channels
    if (Platform.OS === 'android') {
      await this.setupAndroidChannels();
    }
  }

  /**
   * Request notification permissions and register for push
   */
  async registerForPushNotifications(): Promise<PushNotificationToken | null> {
    try {
      if (!Device.isDevice) {
        console.log('Push notifications require a physical device');
        return null;
      }

      // Check/request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Push notification permission not granted');
        return null;
      }

      // Get Expo push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const tokenResponse = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      this.expoPushToken = tokenResponse.data;

      // Also get device push token (FCM/APNS)
      const deviceToken = await Notifications.getDevicePushTokenAsync();

      const tokenData: PushNotificationToken = {
        token: this.expoPushToken,
        type: 'expo',
        platform: Platform.OS as 'ios' | 'android',
        deviceId: deviceToken.data,
      };

      // Register token with backend
      await this.registerTokenWithBackend(tokenData);

      return tokenData;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  /**
   * Register push token with backend
   */
  private async registerTokenWithBackend(token: PushNotificationToken): Promise<void> {
    try {
      await apiService.post('/notifications/register-device', {
        pushToken: token.token,
        deviceToken: token.deviceId,
        platform: token.platform,
        tokenType: token.type,
      });
    } catch (error) {
      console.error('Error registering token with backend:', error);
    }
  }

  /**
   * Set up Android notification channels
   */
  private async setupAndroidChannels(): Promise<void> {
    for (const channel of NOTIFICATION_CHANNELS) {
      await Notifications.setNotificationChannelAsync(channel.id, {
        name: channel.name,
        description: channel.description,
        importance: channel.importance || Notifications.AndroidImportance.DEFAULT,
        sound: channel.sound ? 'default' : undefined,
        vibrationPattern: channel.vibration ? [0, 250, 250, 250] : undefined,
        lightColor: channel.lightColor || '#0066FF',
      });
    }
  }

  /**
   * Add listener for received notifications (foreground)
   */
  addNotificationReceivedListener(
    handler: (notification: Notifications.Notification) => void
  ): void {
    this.lastNotificationReceivedHandler = handler;
    this.notificationListener = Notifications.addNotificationReceivedListener(handler);
  }

  /**
   * Add listener for notification responses (user tapped)
   */
  addNotificationResponseListener(
    handler: (response: Notifications.NotificationResponse) => void
  ): void {
    this.lastNotificationResponseHandler = handler;
    this.responseListener = Notifications.addNotificationResponseReceivedListener(handler);
  }

  /**
   * Remove notification listeners
   */
  removeListeners(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
      this.notificationListener = null;
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
      this.responseListener = null;
    }
  }

  /**
   * Schedule local notification
   */
  async scheduleLocalNotification(
    notification: LocalNotification
  ): Promise<string> {
    const trigger = notification.trigger?.date
      ? { date: notification.trigger.date }
      : notification.trigger?.seconds
      ? { seconds: notification.trigger.seconds, repeats: notification.trigger.repeats }
      : null;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data,
        sound: true,
      },
      trigger,
    });

    return id;
  }

  /**
   * Show immediate local notification
   */
  async showLocalNotification(payload: NotificationPayload): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: payload.title,
        body: payload.body,
        data: payload.data,
        sound: payload.sound !== false,
        badge: payload.badge,
      },
      trigger: null, // Immediate
    });
  }

  /**
   * Cancel scheduled notification
   */
  async cancelNotification(id: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(id);
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Get badge count
   */
  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  /**
   * Clear badge
   */
  async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }

  /**
   * Get push token
   */
  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Get channel for notification category
   */
  getChannelForCategory(category: NotificationCategory): string {
    const channelMap: Record<NotificationCategory, string> = {
      LEAVE_REQUEST: 'leave',
      LEAVE_APPROVED: 'leave',
      LEAVE_REJECTED: 'leave',
      ATTENDANCE_REMINDER: 'attendance',
      PAYSLIP_AVAILABLE: 'payroll',
      APPROVAL_PENDING: 'approvals',
      ANNOUNCEMENT: 'announcements',
      GENERAL: 'general',
    };
    return channelMap[category] || 'general';
  }

  /**
   * Schedule attendance reminder
   */
  async scheduleAttendanceReminder(
    time: { hour: number; minute: number },
    weekdays: number[] = [1, 2, 3, 4, 5] // Monday to Friday
  ): Promise<string[]> {
    const ids: string[] = [];

    for (const weekday of weekdays) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Attendance Reminder',
          body: "Don't forget to check in!",
          data: { type: 'ATTENDANCE_REMINDER' },
          sound: true,
        },
        trigger: {
          weekday,
          hour: time.hour,
          minute: time.minute,
          repeats: true,
        },
      });
      ids.push(id);
    }

    return ids;
  }

  /**
   * Dismiss all notifications
   */
  async dismissAllNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
  }

  /**
   * Unregister device from push notifications
   */
  async unregisterDevice(): Promise<void> {
    try {
      if (this.expoPushToken) {
        await apiService.post('/notifications/unregister-device', {
          pushToken: this.expoPushToken,
        });
      }
      this.expoPushToken = null;
    } catch (error) {
      console.error('Error unregistering device:', error);
    }
  }
}

export const notificationService = new NotificationService();
