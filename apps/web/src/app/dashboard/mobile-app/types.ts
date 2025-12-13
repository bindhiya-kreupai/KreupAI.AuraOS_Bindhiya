// Mobile App Module - Comprehensive Type Definitions

// ============================================================================
// COMMON TYPES
// ============================================================================

export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'active' | 'inactive' | 'pending' | 'archived';
export type Platform = 'ios' | 'android' | 'web';

// ============================================================================
// MOBILE APP CONFIGURATION TYPES
// ============================================================================

export interface MobileAppConfig {
  configId: string;
  appName: string;
  appVersion: string;
  minimumSupportedVersion: string;
  platforms: PlatformConfig[];
  features: FeatureFlag[];
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  forceUpdateRequired: boolean;
  updateMessage?: string;
  createdDate: Date;
  lastUpdatedDate: Date;
  lastUpdatedBy: string;
}

export interface PlatformConfig {
  platform: Platform;
  enabled: boolean;
  appStoreUrl?: string;
  bundleId: string;
  currentVersion: string;
  minimumVersion: string;
  buildNumber: number;
}

export interface FeatureFlag {
  featureId: string;
  featureName: string;
  enabled: boolean;
  platforms: Platform[];
  rolloutPercentage: number;
  targetUserGroups?: string[];
  enabledDate?: Date;
}

// ============================================================================
// PUSH NOTIFICATIONS TYPES
// ============================================================================

export interface PushNotification {
  notificationId: string;
  notificationType: NotificationType;
  title: string;
  body: string;
  priority: Priority;

  // Targeting
  targetType: 'all' | 'user' | 'group' | 'department' | 'role';
  targetIds?: string[];

  // Scheduling
  scheduledDate?: Date;
  sendImmediately: boolean;
  sentDate?: Date;

  // Platform specific
  platforms: Platform[];
  iosConfig?: IOSNotificationConfig;
  androidConfig?: AndroidNotificationConfig;

  // Content
  data?: Record<string, any>;
  imageUrl?: string;
  actionButtons?: NotificationAction[];

  // Analytics
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  openRate: number;

  // Status
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';

  createdBy: string;
  createdByName: string;
  createdDate: Date;
}

export type NotificationType =
  | 'announcement'
  | 'leave_approval'
  | 'expense_approval'
  | 'timesheet_reminder'
  | 'attendance_alert'
  | 'payslip'
  | 'birthday'
  | 'task_assignment'
  | 'event_reminder'
  | 'general';

export interface IOSNotificationConfig {
  badge?: number;
  sound?: string;
  category?: string;
  threadId?: string;
}

export interface AndroidNotificationConfig {
  channelId: string;
  sound?: string;
  icon?: string;
  color?: string;
  vibrate?: boolean;
}

export interface NotificationAction {
  actionId: string;
  actionTitle: string;
  actionType: 'open_app' | 'open_url' | 'deep_link' | 'dismiss';
  actionData?: string;
}

export interface NotificationTemplate {
  templateId: string;
  templateName: string;
  notificationType: NotificationType;
  titleTemplate: string;
  bodyTemplate: string;
  variables: string[];
  isActive: boolean;
}

// ============================================================================
// OFFLINE MODE TYPES
// ============================================================================

export interface OfflineConfig {
  configId: string;
  offlineModeEnabled: boolean;
  syncStrategy: SyncStrategy;
  maxOfflineDuration: number; // in hours
  enabledModules: OfflineModule[];
  cacheSize: number; // in MB
  autoSync: boolean;
  syncOnWifi: boolean;
  conflictResolution: ConflictResolutionStrategy;
}

export type SyncStrategy = 'immediate' | 'scheduled' | 'manual' | 'on_wifi';
export type ConflictResolutionStrategy = 'server_wins' | 'client_wins' | 'latest_wins' | 'manual';

export interface OfflineModule {
  moduleId: string;
  moduleName: string;
  enabled: boolean;
  dataTypes: string[];
  maxCacheAge: number; // in hours
}

export interface SyncStatus {
  syncId: string;
  userId: string;
  lastSyncDate?: Date;
  syncStatus: 'idle' | 'syncing' | 'completed' | 'failed';
  pendingChanges: number;
  conflictsCount: number;
  lastError?: string;
}

export interface OfflineData {
  dataId: string;
  dataType: string;
  data: any;
  createdDate: Date;
  modifiedDate: Date;
  synced: boolean;
  syncedDate?: Date;
}

// ============================================================================
// BIOMETRIC LOGIN TYPES
// ============================================================================

export interface BiometricConfig {
  configId: string;
  biometricEnabled: boolean;
  supportedMethods: BiometricMethod[];
  fallbackToPassword: boolean;
  maxAttempts: number;
  lockoutDuration: number; // in minutes
  requireBiometricOnAppLaunch: boolean;
  requireBiometricForSensitiveActions: boolean;
}

export type BiometricMethod = 'fingerprint' | 'face_id' | 'iris' | 'voice';

export interface BiometricEnrollment {
  enrollmentId: string;
  userId: string;
  userName: string;
  device: DeviceInfo;
  biometricMethod: BiometricMethod;
  enrolledDate: Date;
  lastUsedDate?: Date;
  isActive: boolean;
  revokedDate?: Date;
  revokedReason?: string;
}

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  platform: Platform;
  osVersion: string;
  appVersion: string;
  model: string;
  manufacturer?: string;
}

// ============================================================================
// GPS ATTENDANCE TYPES
// ============================================================================

export interface GPSAttendanceConfig {
  configId: string;
  gpsEnabled: boolean;
  requireGPS: boolean;
  geofencingEnabled: boolean;
  locations: GPSLocation[];
  accuracyThreshold: number; // in meters
  mockLocationDetection: boolean;
  allowCheckInOutsideGeofence: boolean;
}

export interface GPSLocation {
  locationId: string;
  locationName: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  isActive: boolean;
}

export interface GPSCheckIn {
  checkInId: string;
  userId: string;
  userName: string;
  checkInType: 'check_in' | 'check_out';
  timestamp: Date;
  location: GPSCoordinates;
  nearestLocation?: GPSLocation;
  distanceFromLocation?: number;
  insideGeofence: boolean;
  accuracy: number;
  isMockLocation: boolean;
  device: DeviceInfo;
  photoUrl?: string;
}

export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  speed?: number;
  bearing?: number;
}

// ============================================================================
// MOBILE APPROVALS TYPES
// ============================================================================

export interface MobileApproval {
  approvalId: string;
  approvalType: ApprovalType;
  requestId: string;
  requestTitle: string;
  requestedBy: string;
  requestedByName: string;
  requestedByPhoto?: string;
  requestDate: Date;

  priority: Priority;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';

  // Approval details
  approverId: string;
  approverName: string;
  dueDate?: Date;

  // Summary info
  summary: string;
  amount?: number;
  currency?: string;
  duration?: string;

  // Actions
  canApprove: boolean;
  canReject: boolean;
  canEscalate: boolean;
  requiresComment: boolean;

  // Workflow
  workflowStage: number;
  totalStages: number;

  // Response
  responseDate?: Date;
  responseComments?: string;

  // Metadata
  metadata?: Record<string, any>;
}

export type ApprovalType =
  | 'leave'
  | 'expense'
  | 'timesheet'
  | 'requisition'
  | 'travel'
  | 'overtime'
  | 'asset_request'
  | 'policy_exception';

// ============================================================================
// DOCUMENT UPLOAD TYPES
// ============================================================================

export interface DocumentUploadConfig {
  configId: string;
  maxFileSize: number; // in MB
  allowedFileTypes: string[];
  compressionEnabled: boolean;
  compressionQuality: number;
  uploadOnWifiOnly: boolean;
  enableOCR: boolean;
}

export interface UploadedDocument {
  documentId: string;
  documentName: string;
  documentType: string;
  fileSize: number;
  fileType: string;

  uploadedBy: string;
  uploadedByName: string;
  uploadedDate: Date;

  uploadStatus: 'uploading' | 'completed' | 'failed';
  uploadProgress: number;

  localPath?: string;
  serverPath?: string;
  thumbnailUrl?: string;

  compressed: boolean;
  originalSize?: number;

  ocrProcessed: boolean;
  extractedText?: string;

  metadata?: Record<string, any>;
}

// ============================================================================
// MOBILE TIMESHEETS TYPES
// ============================================================================

export interface MobileTimesheet {
  timesheetId: string;
  userId: string;
  userName: string;
  periodStart: Date;
  periodEnd: Date;

  status: 'draft' | 'submitted' | 'approved' | 'rejected';

  entries: TimesheetEntry[];
  totalHours: number;
  regularHours: number;
  overtimeHours: number;

  submittedDate?: Date;
  approvedBy?: string;
  approvedDate?: Date;

  canEdit: boolean;
  canSubmit: boolean;
}

export interface TimesheetEntry {
  entryId: string;
  date: Date;
  projectId?: string;
  projectName?: string;
  taskId?: string;
  taskName?: string;
  hours: number;
  isOvertime: boolean;
  description?: string;
  location?: GPSCoordinates;
}

// ============================================================================
// QUICK ACTIONS TYPES
// ============================================================================

export interface QuickAction {
  actionId: string;
  actionName: string;
  actionType: QuickActionType;
  icon: string;
  color: string;
  enabled: boolean;
  requiresAuth: boolean;
  targetScreen?: string;
  deepLink?: string;
  order: number;
  platforms: Platform[];
  requiredPermissions?: string[];
}

export type QuickActionType =
  | 'check_in'
  | 'check_out'
  | 'apply_leave'
  | 'expense_claim'
  | 'view_payslip'
  | 'timesheet'
  | 'directory'
  | 'approvals'
  | 'help_desk'
  | 'custom';

// ============================================================================
// VOICE COMMANDS TYPES
// ============================================================================

export interface VoiceCommandConfig {
  configId: string;
  voiceEnabled: boolean;
  supportedLanguages: string[];
  wakeWord?: string;
  confidenceThreshold: number;
  enabledCommands: VoiceCommand[];
}

export interface VoiceCommand {
  commandId: string;
  commandName: string;
  commandPhrases: string[];
  action: string;
  parameters?: Record<string, any>;
  requiresConfirmation: boolean;
  enabled: boolean;
}

export interface VoiceInteraction {
  interactionId: string;
  userId: string;
  timestamp: Date;
  recognizedText: string;
  confidence: number;
  matchedCommand?: VoiceCommand;
  executed: boolean;
  result?: string;
  error?: string;
}

// ============================================================================
// MOBILE ANALYTICS TYPES
// ============================================================================

export interface MobileAnalytics {
  // Usage metrics
  totalUsers: number;
  activeUsers: number;
  dailyActiveUsers: number;
  monthlyActiveUsers: number;

  // Platform distribution
  platformDistribution: { platform: Platform; count: number; percentage: number }[];

  // Version distribution
  versionDistribution: { version: string; count: number; percentage: number }[];

  // Feature usage
  featureUsage: { feature: string; usageCount: number; uniqueUsers: number }[];

  // Performance metrics
  averageSessionDuration: number;
  crashRate: number;
  appLoadTime: number;
  apiResponseTime: number;

  // Engagement
  pushNotificationOpenRate: number;
  biometricAdoptionRate: number;
  offlineModeUsage: number;

  // Popular actions
  topQuickActions: { action: string; count: number }[];

  // Error metrics
  errorRate: number;
  topErrors: { error: string; count: number }[];
}

export interface UserSession {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  platform: Platform;
  appVersion: string;
  device: DeviceInfo;
  actionsPerformed: SessionAction[];
  crashOccurred: boolean;
  crashDetails?: string;
}

export interface SessionAction {
  actionId: string;
  actionName: string;
  timestamp: Date;
  screen: string;
  duration?: number;
}

// ============================================================================
// CHAT MESSAGING TYPES
// ============================================================================

export interface ChatConfig {
  configId: string;
  chatEnabled: boolean;
  allowDirectMessages: boolean;
  allowGroupChats: boolean;
  allowFileSharing: boolean;
  maxGroupSize: number;
  messageRetentionDays: number;
  enableReadReceipts: boolean;
  enableTypingIndicators: boolean;
  enablePushNotifications: boolean;
}

export interface ChatConversation {
  conversationId: string;
  conversationType: 'direct' | 'group';
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  createdDate: Date;
  lastActivityDate: Date;
}

export interface ChatParticipant {
  userId: string;
  userName: string;
  userPhoto?: string;
  isOnline: boolean;
  lastSeen?: Date;
  role?: 'admin' | 'member';
}

export interface ChatMessage {
  messageId: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  messageType: 'text' | 'file' | 'image' | 'voice' | 'location';
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  location?: GPSCoordinates;
  timestamp: Date;
  isEdited: boolean;
  editedDate?: Date;
  readBy: string[];
  deliveredTo: string[];
  replyTo?: string;
}

// ============================================================================
// PROFILE MANAGEMENT TYPES
// ============================================================================

export interface MobileUserProfile {
  userId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  profilePhoto?: string;

  // Organization info
  designation: string;
  department: string;
  location: string;
  manager?: string;
  managerName?: string;

  // App preferences
  preferences: MobilePreferences;

  // Notification settings
  notificationSettings: NotificationSettings;

  // Privacy settings
  privacySettings: PrivacySettings;

  // Device info
  registeredDevices: DeviceInfo[];
}

export interface MobilePreferences {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  biometricEnabled: boolean;
  offlineModeEnabled: boolean;
  dataUsageMode: 'unrestricted' | 'wifi_only' | 'low_data';
  defaultView: string;
  quickActions: string[];
}

export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  notificationTypes: Record<NotificationType, boolean>;
  quietHoursEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export interface PrivacySettings {
  profileVisibility: 'everyone' | 'colleagues' | 'private';
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  allowDirectMessages: boolean;
  shareLocation: boolean;
}

// ============================================================================
// SETTINGS TYPES
// ============================================================================

export interface MobileAppSettings {
  settingsId: string;

  appConfig: MobileAppConfig;
  pushNotificationConfig: {
    enabled: boolean;
    providers: { provider: string; apiKey: string }[];
    dailyLimit: number;
  };
  offlineConfig: OfflineConfig;
  biometricConfig: BiometricConfig;
  gpsAttendanceConfig: GPSAttendanceConfig;
  documentUploadConfig: DocumentUploadConfig;
  voiceCommandConfig: VoiceCommandConfig;
  chatConfig: ChatConfig;

  securitySettings: {
    sessionTimeout: number;
    requirePasswordChange: boolean;
    passwordChangeDays: number;
    allowScreenshots: boolean;
    allowCopyPaste: boolean;
    requireDeviceEncryption: boolean;
  };

  lastUpdatedDate: Date;
  lastUpdatedBy: string;
  lastUpdatedByName: string;
}
