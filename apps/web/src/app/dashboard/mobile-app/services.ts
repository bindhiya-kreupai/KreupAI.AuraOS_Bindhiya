/**
 * Mobile App Module - Service Layer
 * API-ready service layer for mobile application management
 */

import { APIClient } from '@/lib/api-client';
import type {
  MobileAppConfig,
  PushNotification,
  NotificationTemplate,
  OfflineConfig,
  SyncStatus,
  BiometricConfig,
  BiometricEnrollment,
  GPSAttendanceConfig,
  GPSCheckIn,
  MobileApproval,
  DocumentUploadConfig,
  UploadedDocument,
  MobileTimesheet,
  QuickAction,
  VoiceCommandConfig,
  VoiceInteraction,
  MobileAnalytics,
  UserSession,
  ChatConversation,
  ChatMessage,
  MobileUserProfile,
  MobileAppSettings,
  Platform,
  NotificationType,
  ApprovalType,
} from './types';

// ============================================================================
// APP CONFIGURATION SERVICE
// ============================================================================

export class MobileAppConfigService {
  private static endpoint = '/mobile-app/config';

  static async getConfig(): Promise<MobileAppConfig> {
    try {
      const response = await APIClient.get<{ config?: MobileAppConfig }>(this.endpoint);
      return response.config || ({} as MobileAppConfig);
    } catch (error) {
      console.error('Error fetching mobile app config:', error);
      return {} as MobileAppConfig;
    }
  }

  static async updateConfig(updates: Partial<MobileAppConfig>): Promise<MobileAppConfig> {
    try {
      const response = await APIClient.put<{ config: MobileAppConfig }>(this.endpoint, updates);
      return response.config;
    } catch (error) {
      console.error('Error updating mobile app config:', error);
      throw error;
    }
  }

  static async enableMaintenanceMode(message: string): Promise<MobileAppConfig> {
    return this.updateConfig({ maintenanceMode: true, maintenanceMessage: message });
  }

  static async disableMaintenanceMode(): Promise<MobileAppConfig> {
    return this.updateConfig({ maintenanceMode: false, maintenanceMessage: undefined });
  }

  static async forceUpdate(message: string): Promise<MobileAppConfig> {
    return this.updateConfig({ forceUpdateRequired: true, updateMessage: message });
  }
}

// ============================================================================
// PUSH NOTIFICATIONS SERVICE
// ============================================================================

export class PushNotificationService {
  private static endpoint = '/mobile-app/notifications';
  private static templatesEndpoint = '/mobile-app/notification-templates';

  static async getAllNotifications(): Promise<PushNotification[]> {
    try {
      const response = await APIClient.get<{ notifications?: PushNotification[] }>(this.endpoint);
      return response.notifications || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  static async getNotificationById(notificationId: string): Promise<PushNotification> {
    try {
      const response = await APIClient.get<{ notification?: PushNotification }>(`${this.endpoint}/${notificationId}`);
      return response.notification || ({} as PushNotification);
    } catch (error) {
      console.error('Error fetching notification:', error);
      throw error;
    }
  }

  static async createNotification(notification: Partial<PushNotification>): Promise<PushNotification> {
    try {
      const response = await APIClient.post<{ notification: PushNotification }>(this.endpoint, notification);
      return response.notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  static async sendNotification(notificationId: string): Promise<PushNotification> {
    try {
      const response = await APIClient.post<{ notification: PushNotification }>(`${this.endpoint}/${notificationId}/send`, {});
      return response.notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      await APIClient.delete(`${this.endpoint}/${notificationId}`);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Template methods
  static async getTemplates(): Promise<NotificationTemplate[]> {
    try {
      const response = await APIClient.get<{ templates?: NotificationTemplate[] }>(this.templatesEndpoint);
      return response.templates || [];
    } catch (error) {
      console.error('Error fetching notification templates:', error);
      return [];
    }
  }

  static async createTemplate(template: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    try {
      const response = await APIClient.post<{ template: NotificationTemplate }>(this.templatesEndpoint, template);
      return response.template;
    } catch (error) {
      console.error('Error creating notification template:', error);
      throw error;
    }
  }
}

// ============================================================================
// OFFLINE MODE SERVICE
// ============================================================================

export class OfflineModeService {
  private static configEndpoint = '/mobile-app/offline-config';
  private static syncEndpoint = '/mobile-app/sync';

  static async getConfig(): Promise<OfflineConfig> {
    try {
      const response = await APIClient.get<{ config?: OfflineConfig }>(this.configEndpoint);
      return response.config || ({} as OfflineConfig);
    } catch (error) {
      console.error('Error fetching offline config:', error);
      return {} as OfflineConfig;
    }
  }

  static async updateConfig(updates: Partial<OfflineConfig>): Promise<OfflineConfig> {
    try {
      const response = await APIClient.put<{ config: OfflineConfig }>(this.configEndpoint, updates);
      return response.config;
    } catch (error) {
      console.error('Error updating offline config:', error);
      throw error;
    }
  }

  static async getSyncStatus(): Promise<SyncStatus> {
    try {
      const response = await APIClient.get<{ status?: SyncStatus }>(`${this.syncEndpoint}/status`);
      return response.status || ({} as SyncStatus);
    } catch (error) {
      console.error('Error fetching sync status:', error);
      return {} as SyncStatus;
    }
  }

  static async syncData(): Promise<SyncStatus> {
    try {
      const response = await APIClient.post<{ status: SyncStatus }>(`${this.syncEndpoint}/sync`, {});
      return response.status;
    } catch (error) {
      console.error('Error syncing data:', error);
      throw error;
    }
  }
}

// ============================================================================
// BIOMETRIC SERVICE
// ============================================================================

export class BiometricService {
  private static configEndpoint = '/mobile-app/biometric-config';
  private static enrollmentsEndpoint = '/mobile-app/biometric-enrollments';

  static async getConfig(): Promise<BiometricConfig> {
    try {
      const response = await APIClient.get<{ config?: BiometricConfig }>(this.configEndpoint);
      return response.config || ({} as BiometricConfig);
    } catch (error) {
      console.error('Error fetching biometric config:', error);
      return {} as BiometricConfig;
    }
  }

  static async updateConfig(updates: Partial<BiometricConfig>): Promise<BiometricConfig> {
    try {
      const response = await APIClient.put<{ config: BiometricConfig }>(this.configEndpoint, updates);
      return response.config;
    } catch (error) {
      console.error('Error updating biometric config:', error);
      throw error;
    }
  }

  static async getAllEnrollments(): Promise<BiometricEnrollment[]> {
    try {
      const response = await APIClient.get<{ enrollments?: BiometricEnrollment[] }>(this.enrollmentsEndpoint);
      return response.enrollments || [];
    } catch (error) {
      console.error('Error fetching biometric enrollments:', error);
      return [];
    }
  }

  static async enrollBiometric(enrollment: Partial<BiometricEnrollment>): Promise<BiometricEnrollment> {
    try {
      const response = await APIClient.post<{ enrollment: BiometricEnrollment }>(this.enrollmentsEndpoint, enrollment);
      return response.enrollment;
    } catch (error) {
      console.error('Error enrolling biometric:', error);
      throw error;
    }
  }

  static async revokeBiometric(enrollmentId: string, reason: string): Promise<BiometricEnrollment> {
    try {
      const response = await APIClient.post<{ enrollment: BiometricEnrollment }>(`${this.enrollmentsEndpoint}/${enrollmentId}/revoke`, { reason });
      return response.enrollment;
    } catch (error) {
      console.error('Error revoking biometric:', error);
      throw error;
    }
  }
}

// ============================================================================
// GPS ATTENDANCE SERVICE
// ============================================================================

export class GPSAttendanceService {
  private static configEndpoint = '/mobile-app/gps-config';
  private static checkinsEndpoint = '/mobile-app/gps-checkins';

  static async getConfig(): Promise<GPSAttendanceConfig> {
    try {
      const response = await APIClient.get<{ config?: GPSAttendanceConfig }>(this.configEndpoint);
      return response.config || ({} as GPSAttendanceConfig);
    } catch (error) {
      console.error('Error fetching GPS config:', error);
      return {} as GPSAttendanceConfig;
    }
  }

  static async updateConfig(updates: Partial<GPSAttendanceConfig>): Promise<GPSAttendanceConfig> {
    try {
      const response = await APIClient.put<{ config: GPSAttendanceConfig }>(this.configEndpoint, updates);
      return response.config;
    } catch (error) {
      console.error('Error updating GPS config:', error);
      throw error;
    }
  }

  static async getAllCheckIns(): Promise<GPSCheckIn[]> {
    try {
      const response = await APIClient.get<{ checkins?: GPSCheckIn[] }>(this.checkinsEndpoint);
      return response.checkins || [];
    } catch (error) {
      console.error('Error fetching GPS check-ins:', error);
      return [];
    }
  }

  static async recordCheckIn(checkIn: Partial<GPSCheckIn>): Promise<GPSCheckIn> {
    try {
      const response = await APIClient.post<{ checkin: GPSCheckIn }>(this.checkinsEndpoint, checkIn);
      return response.checkin;
    } catch (error) {
      console.error('Error recording check-in:', error);
      throw error;
    }
  }
}

// ============================================================================
// MOBILE APPROVALS SERVICE
// ============================================================================

export class MobileApprovalsService {
  private static endpoint = '/mobile-app/approvals';

  static async getAllApprovals(): Promise<MobileApproval[]> {
    try {
      const response = await APIClient.get<{ approvals?: MobileApproval[] }>(this.endpoint);
      return response.approvals || [];
    } catch (error) {
      console.error('Error fetching approvals:', error);
      return [];
    }
  }

  static async getApprovalById(approvalId: string): Promise<MobileApproval> {
    try {
      const response = await APIClient.get<{ approval?: MobileApproval }>(`${this.endpoint}/${approvalId}`);
      return response.approval || ({} as MobileApproval);
    } catch (error) {
      console.error('Error fetching approval:', error);
      throw error;
    }
  }

  static async approveRequest(approvalId: string, comments?: string): Promise<MobileApproval> {
    try {
      const response = await APIClient.post<{ approval: MobileApproval }>(`${this.endpoint}/${approvalId}/approve`, { comments });
      return response.approval;
    } catch (error) {
      console.error('Error approving request:', error);
      throw error;
    }
  }

  static async rejectRequest(approvalId: string, comments: string): Promise<MobileApproval> {
    try {
      const response = await APIClient.post<{ approval: MobileApproval }>(`${this.endpoint}/${approvalId}/reject`, { comments });
      return response.approval;
    } catch (error) {
      console.error('Error rejecting request:', error);
      throw error;
    }
  }
}

// ============================================================================
// DOCUMENT UPLOAD SERVICE
// ============================================================================

export class DocumentUploadService {
  private static configEndpoint = '/mobile-app/document-upload-config';
  private static documentsEndpoint = '/mobile-app/documents';

  static async getConfig(): Promise<DocumentUploadConfig> {
    try {
      const response = await APIClient.get<{ config?: DocumentUploadConfig }>(this.configEndpoint);
      return response.config || ({} as DocumentUploadConfig);
    } catch (error) {
      console.error('Error fetching document upload config:', error);
      return {} as DocumentUploadConfig;
    }
  }

  static async uploadDocument(document: Partial<UploadedDocument>): Promise<UploadedDocument> {
    try {
      const response = await APIClient.post<{ document: UploadedDocument }>(this.documentsEndpoint, document);
      return response.document;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  static async getAllDocuments(): Promise<UploadedDocument[]> {
    try {
      const response = await APIClient.get<{ documents?: UploadedDocument[] }>(this.documentsEndpoint);
      return response.documents || [];
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  }
}

// ============================================================================
// MOBILE TIMESHEETS SERVICE
// ============================================================================

export class MobileTimesheetsService {
  private static endpoint = '/mobile-app/timesheets';

  static async getAllTimesheets(): Promise<MobileTimesheet[]> {
    try {
      const response = await APIClient.get<{ timesheets?: MobileTimesheet[] }>(this.endpoint);
      return response.timesheets || [];
    } catch (error) {
      console.error('Error fetching timesheets:', error);
      return [];
    }
  }

  static async getTimesheetById(timesheetId: string): Promise<MobileTimesheet> {
    try {
      const response = await APIClient.get<{ timesheet?: MobileTimesheet }>(`${this.endpoint}/${timesheetId}`);
      return response.timesheet || ({} as MobileTimesheet);
    } catch (error) {
      console.error('Error fetching timesheet:', error);
      throw error;
    }
  }

  static async submitTimesheet(timesheetId: string): Promise<MobileTimesheet> {
    try {
      const response = await APIClient.post<{ timesheet: MobileTimesheet }>(`${this.endpoint}/${timesheetId}/submit`, {});
      return response.timesheet;
    } catch (error) {
      console.error('Error submitting timesheet:', error);
      throw error;
    }
  }
}

// ============================================================================
// QUICK ACTIONS SERVICE
// ============================================================================

export class QuickActionsService {
  private static endpoint = '/mobile-app/quick-actions';

  static async getAllQuickActions(): Promise<QuickAction[]> {
    try {
      const response = await APIClient.get<{ actions?: QuickAction[] }>(this.endpoint);
      return response.actions || [];
    } catch (error) {
      console.error('Error fetching quick actions:', error);
      return [];
    }
  }

  static async updateQuickAction(actionId: string, updates: Partial<QuickAction>): Promise<QuickAction> {
    try {
      const response = await APIClient.put<{ action: QuickAction }>(`${this.endpoint}/${actionId}`, updates);
      return response.action;
    } catch (error) {
      console.error('Error updating quick action:', error);
      throw error;
    }
  }
}

// ============================================================================
// VOICE COMMANDS SERVICE
// ============================================================================

export class VoiceCommandsService {
  private static configEndpoint = '/mobile-app/voice-config';
  private static interactionsEndpoint = '/mobile-app/voice-interactions';

  static async getConfig(): Promise<VoiceCommandConfig> {
    try {
      const response = await APIClient.get<{ config?: VoiceCommandConfig }>(this.configEndpoint);
      return response.config || ({} as VoiceCommandConfig);
    } catch (error) {
      console.error('Error fetching voice config:', error);
      return {} as VoiceCommandConfig;
    }
  }

  static async recordInteraction(interaction: Partial<VoiceInteraction>): Promise<VoiceInteraction> {
    try {
      const response = await APIClient.post<{ interaction: VoiceInteraction }>(this.interactionsEndpoint, interaction);
      return response.interaction;
    } catch (error) {
      console.error('Error recording voice interaction:', error);
      throw error;
    }
  }

  static async getAllInteractions(): Promise<VoiceInteraction[]> {
    try {
      const response = await APIClient.get<{ interactions?: VoiceInteraction[] }>(this.interactionsEndpoint);
      return response.interactions || [];
    } catch (error) {
      console.error('Error fetching voice interactions:', error);
      return [];
    }
  }
}

// ============================================================================
// MOBILE ANALYTICS SERVICE
// ============================================================================

export class MobileAnalyticsService {
  private static endpoint = '/mobile-app/analytics';
  private static sessionsEndpoint = '/mobile-app/sessions';

  static async getAnalytics(): Promise<MobileAnalytics> {
    try {
      const response = await APIClient.get<{ analytics?: MobileAnalytics }>(this.endpoint);
      return response.analytics || ({} as MobileAnalytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return {} as MobileAnalytics;
    }
  }

  static async recordSession(session: UserSession): Promise<void> {
    try {
      await APIClient.post(this.sessionsEndpoint, session);
    } catch (error) {
      console.error('Error recording session:', error);
      throw error;
    }
  }
}

// ============================================================================
// CHAT SERVICE
// ============================================================================

export class ChatService {
  private static conversationsEndpoint = '/mobile-app/conversations';
  private static messagesEndpoint = '/mobile-app/messages';

  static async getAllConversations(): Promise<ChatConversation[]> {
    try {
      const response = await APIClient.get<{ conversations?: ChatConversation[] }>(this.conversationsEndpoint);
      return response.conversations || [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }

  static async sendMessage(message: Partial<ChatMessage>): Promise<ChatMessage> {
    try {
      const response = await APIClient.post<{ message: ChatMessage }>(this.messagesEndpoint, message);
      return response.message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  static async getAllMessages(): Promise<ChatMessage[]> {
    try {
      const response = await APIClient.get<{ messages?: ChatMessage[] }>(this.messagesEndpoint);
      return response.messages || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }
}

// ============================================================================
// PROFILE SERVICE
// ============================================================================

export class MobileProfileService {
  private static endpoint = '/mobile-app/profile';

  static async getProfile(): Promise<MobileUserProfile> {
    try {
      const response = await APIClient.get<{ profile?: MobileUserProfile }>(this.endpoint);
      return response.profile || ({} as MobileUserProfile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      return {} as MobileUserProfile;
    }
  }

  static async updateProfile(updates: Partial<MobileUserProfile>): Promise<MobileUserProfile> {
    try {
      const response = await APIClient.put<{ profile: MobileUserProfile }>(this.endpoint, updates);
      return response.profile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
}

// ============================================================================
// SETTINGS SERVICE
// ============================================================================

export class MobileSettingsService {
  private static endpoint = '/mobile-app/settings';

  static async getSettings(): Promise<MobileAppSettings> {
    try {
      const response = await APIClient.get<{ settings?: MobileAppSettings }>(this.endpoint);
      return response.settings || ({} as MobileAppSettings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      return {} as MobileAppSettings;
    }
  }

  static async updateSettings(updates: Partial<MobileAppSettings>): Promise<MobileAppSettings> {
    try {
      const response = await APIClient.put<{ settings: MobileAppSettings }>(this.endpoint, updates);
      return response.settings;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }
}
