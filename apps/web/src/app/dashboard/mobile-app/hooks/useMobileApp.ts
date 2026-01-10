'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  MobileAppConfigService,
  PushNotificationService,
  OfflineModeService,
  BiometricService,
  GPSAttendanceService,
  MobileApprovalsService,
  DocumentUploadService,
  MobileTimesheetsService,
  QuickActionsService,
  VoiceCommandsService,
  MobileAnalyticsService,
  ChatService,
  MobileProfileService,
  MobileSettingsService,
} from '../services';
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
  ChatConversation,
  ChatMessage,
  MobileUserProfile,
  MobileAppSettings,
} from '../types';

interface UseMobileAppReturn {
  // App Config State
  appConfig: MobileAppConfig | null;
  configLoading: boolean;

  // Push Notifications State
  notifications: PushNotification[];
  notificationTemplates: NotificationTemplate[];
  notificationsLoading: boolean;
  notificationsError: string | null;

  // Offline Mode State
  offlineConfig: OfflineConfig | null;
  syncStatus: SyncStatus | null;
  offlineLoading: boolean;

  // Biometric State
  biometricConfig: BiometricConfig | null;
  biometricEnrollments: BiometricEnrollment[];
  biometricLoading: boolean;

  // GPS Attendance State
  gpsConfig: GPSAttendanceConfig | null;
  checkIns: GPSCheckIn[];
  gpsLoading: boolean;

  // Approvals State
  approvals: MobileApproval[];
  approvalsLoading: boolean;
  approvalsError: string | null;

  // Documents State
  documentConfig: DocumentUploadConfig | null;
  uploadedDocuments: UploadedDocument[];
  documentsLoading: boolean;

  // Timesheets State
  timesheets: MobileTimesheet[];
  timesheetsLoading: boolean;

  // Quick Actions State
  quickActions: QuickAction[];
  quickActionsLoading: boolean;

  // Voice Commands State
  voiceConfig: VoiceCommandConfig | null;
  voiceInteractions: VoiceInteraction[];
  voiceLoading: boolean;

  // Analytics State
  analytics: MobileAnalytics | null;
  analyticsLoading: boolean;

  // Chat State
  conversations: ChatConversation[];
  chatLoading: boolean;

  // Profile State
  userProfile: MobileUserProfile | null;
  profileLoading: boolean;

  // Settings State
  settings: MobileAppSettings | null;
  settingsLoading: boolean;

  // App Config Methods
  fetchAppConfig: () => Promise<void>;
  updateAppConfig: (updates: Partial<MobileAppConfig>) => Promise<MobileAppConfig>;
  enableMaintenanceMode: (message: string) => Promise<MobileAppConfig>;
  disableMaintenanceMode: () => Promise<MobileAppConfig>;
  forceUpdate: (message: string) => Promise<MobileAppConfig>;

  // Push Notification Methods
  fetchNotifications: () => Promise<void>;
  createNotification: (notification: Partial<PushNotification>) => Promise<PushNotification>;
  sendNotification: (notificationId: string) => Promise<PushNotification>;
  deleteNotification: (notificationId: string) => Promise<void>;
  fetchTemplates: () => Promise<void>;
  createTemplate: (template: Partial<NotificationTemplate>) => Promise<NotificationTemplate>;

  // Offline Mode Methods
  fetchOfflineConfig: () => Promise<void>;
  updateOfflineConfig: (updates: Partial<OfflineConfig>) => Promise<OfflineConfig>;
  fetchSyncStatus: () => Promise<void>;
  syncData: () => Promise<SyncStatus>;

  // Biometric Methods
  fetchBiometricConfig: () => Promise<void>;
  updateBiometricConfig: (updates: Partial<BiometricConfig>) => Promise<BiometricConfig>;
  fetchBiometricEnrollments: () => Promise<void>;
  enrollBiometric: (enrollment: Partial<BiometricEnrollment>) => Promise<BiometricEnrollment>;
  revokeBiometric: (enrollmentId: string, reason: string) => Promise<BiometricEnrollment>;

  // GPS Attendance Methods
  fetchGPSConfig: () => Promise<void>;
  updateGPSConfig: (updates: Partial<GPSAttendanceConfig>) => Promise<GPSAttendanceConfig>;
  fetchCheckIns: () => Promise<void>;
  recordCheckIn: (checkIn: Partial<GPSCheckIn>) => Promise<GPSCheckIn>;

  // Approvals Methods
  fetchApprovals: () => Promise<void>;
  approveRequest: (approvalId: string, comments?: string) => Promise<MobileApproval>;
  rejectRequest: (approvalId: string, comments: string) => Promise<MobileApproval>;

  // Documents Methods
  fetchDocumentConfig: () => Promise<void>;
  uploadDocument: (document: Partial<UploadedDocument>) => Promise<UploadedDocument>;
  fetchUploadedDocuments: () => Promise<void>;

  // Timesheets Methods
  fetchTimesheets: () => Promise<void>;
  submitTimesheet: (timesheetId: string) => Promise<MobileTimesheet>;

  // Quick Actions Methods
  fetchQuickActions: () => Promise<void>;
  updateQuickAction: (actionId: string, updates: Partial<QuickAction>) => Promise<QuickAction>;

  // Voice Commands Methods
  fetchVoiceConfig: () => Promise<void>;
  recordVoiceInteraction: (interaction: Partial<VoiceInteraction>) => Promise<VoiceInteraction>;
  fetchVoiceInteractions: () => Promise<void>;

  // Analytics Methods
  fetchAnalytics: () => Promise<void>;

  // Chat Methods
  fetchConversations: () => Promise<void>;
  sendMessage: (message: Partial<ChatMessage>) => Promise<ChatMessage>;

  // Profile Methods
  fetchUserProfile: () => Promise<void>;
  updateUserProfile: (updates: Partial<MobileUserProfile>) => Promise<MobileUserProfile>;

  // Settings Methods
  fetchSettings: () => Promise<void>;
  updateSettings: (updates: Partial<MobileAppSettings>) => Promise<MobileAppSettings>;

  // Utility Methods
  clearErrors: () => void;
}

export function useMobileApp(): UseMobileAppReturn {
  // App Config State
  const [appConfig, setAppConfig] = useState<MobileAppConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(false);

  // Push Notifications State
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [notificationTemplates, setNotificationTemplates] = useState<NotificationTemplate[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);

  // Offline Mode State
  const [offlineConfig, setOfflineConfig] = useState<OfflineConfig | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [offlineLoading, setOfflineLoading] = useState(false);

  // Biometric State
  const [biometricConfig, setBiometricConfig] = useState<BiometricConfig | null>(null);
  const [biometricEnrollments, setBiometricEnrollments] = useState<BiometricEnrollment[]>([]);
  const [biometricLoading, setBiometricLoading] = useState(false);

  // GPS Attendance State
  const [gpsConfig, setGpsConfig] = useState<GPSAttendanceConfig | null>(null);
  const [checkIns, setCheckIns] = useState<GPSCheckIn[]>([]);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Approvals State
  const [approvals, setApprovals] = useState<MobileApproval[]>([]);
  const [approvalsLoading, setApprovalsLoading] = useState(false);
  const [approvalsError, setApprovalsError] = useState<string | null>(null);

  // Documents State
  const [documentConfig, setDocumentConfig] = useState<DocumentUploadConfig | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);

  // Timesheets State
  const [timesheets, setTimesheets] = useState<MobileTimesheet[]>([]);
  const [timesheetsLoading, setTimesheetsLoading] = useState(false);

  // Quick Actions State
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [quickActionsLoading, setQuickActionsLoading] = useState(false);

  // Voice Commands State
  const [voiceConfig, setVoiceConfig] = useState<VoiceCommandConfig | null>(null);
  const [voiceInteractions, setVoiceInteractions] = useState<VoiceInteraction[]>([]);
  const [voiceLoading, setVoiceLoading] = useState(false);

  // Analytics State
  const [analytics, setAnalytics] = useState<MobileAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Chat State
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Profile State
  const [userProfile, setUserProfile] = useState<MobileUserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<MobileAppSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // App Config Methods
  const fetchAppConfig = useCallback(async () => {
    setConfigLoading(true);
    try {
      const config = await MobileAppConfigService.getConfig();
      setAppConfig(config);
    } catch (error) {
      console.error('Failed to fetch app config:', error);
    } finally {
      setConfigLoading(false);
    }
  }, []);

  const updateAppConfig = useCallback(async (updates: Partial<MobileAppConfig>) => {
    setConfigLoading(true);
    try {
      const updated = await MobileAppConfigService.updateConfig(updates);
      setAppConfig(updated);
      return updated;
    } catch (error) {
      console.error('Failed to update app config:', error);
      throw error;
    } finally {
      setConfigLoading(false);
    }
  }, []);

  const enableMaintenanceMode = useCallback(async (message: string) => {
    setConfigLoading(true);
    try {
      const updated = await MobileAppConfigService.enableMaintenanceMode(message);
      setAppConfig(updated);
      return updated;
    } catch (error) {
      console.error('Failed to enable maintenance mode:', error);
      throw error;
    } finally {
      setConfigLoading(false);
    }
  }, []);

  const disableMaintenanceMode = useCallback(async () => {
    setConfigLoading(true);
    try {
      const updated = await MobileAppConfigService.disableMaintenanceMode();
      setAppConfig(updated);
      return updated;
    } catch (error) {
      console.error('Failed to disable maintenance mode:', error);
      throw error;
    } finally {
      setConfigLoading(false);
    }
  }, []);

  const forceUpdate = useCallback(async (message: string) => {
    setConfigLoading(true);
    try {
      const updated = await MobileAppConfigService.forceUpdate(message);
      setAppConfig(updated);
      return updated;
    } catch (error) {
      console.error('Failed to force update:', error);
      throw error;
    } finally {
      setConfigLoading(false);
    }
  }, []);

  // Push Notification Methods
  const fetchNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    setNotificationsError(null);
    try {
      const data = await PushNotificationService.getAllNotifications();
      setNotifications(data);
    } catch (error) {
      setNotificationsError(error instanceof Error ? error.message : 'Failed to fetch notifications');
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  const createNotification = useCallback(async (notification: Partial<PushNotification>) => {
    setNotificationsLoading(true);
    setNotificationsError(null);
    try {
      const created = await PushNotificationService.createNotification(notification);
      setNotifications((prev) => [...prev, created]);
      return created;
    } catch (error) {
      setNotificationsError(error instanceof Error ? error.message : 'Failed to create notification');
      throw error;
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  const sendNotification = useCallback(async (notificationId: string) => {
    setNotificationsLoading(true);
    setNotificationsError(null);
    try {
      const sent = await PushNotificationService.sendNotification(notificationId);
      setNotifications((prev) => prev.map((n) => (n.notificationId === notificationId ? sent : n)));
      return sent;
    } catch (error) {
      setNotificationsError(error instanceof Error ? error.message : 'Failed to send notification');
      throw error;
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    setNotificationsLoading(true);
    setNotificationsError(null);
    try {
      await PushNotificationService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.notificationId !== notificationId));
    } catch (error) {
      setNotificationsError(error instanceof Error ? error.message : 'Failed to delete notification');
      throw error;
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      const templates = await PushNotificationService.getTemplates();
      setNotificationTemplates(templates);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  }, []);

  const createTemplate = useCallback(async (template: Partial<NotificationTemplate>) => {
    try {
      const created = await PushNotificationService.createTemplate(template);
      setNotificationTemplates((prev) => [...prev, created]);
      return created;
    } catch (error) {
      console.error('Failed to create template:', error);
      throw error;
    }
  }, []);

  // Offline Mode Methods
  const fetchOfflineConfig = useCallback(async () => {
    setOfflineLoading(true);
    try {
      const config = await OfflineModeService.getConfig();
      setOfflineConfig(config);
    } catch (error) {
      console.error('Failed to fetch offline config:', error);
    } finally {
      setOfflineLoading(false);
    }
  }, []);

  const updateOfflineConfig = useCallback(async (updates: Partial<OfflineConfig>) => {
    setOfflineLoading(true);
    try {
      const updated = await OfflineModeService.updateConfig(updates);
      setOfflineConfig(updated);
      return updated;
    } catch (error) {
      console.error('Failed to update offline config:', error);
      throw error;
    } finally {
      setOfflineLoading(false);
    }
  }, []);

  const fetchSyncStatus = useCallback(async () => {
    try {
      const status = await OfflineModeService.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Failed to fetch sync status:', error);
    }
  }, []);

  const syncData = useCallback(async () => {
    setOfflineLoading(true);
    try {
      const status = await OfflineModeService.syncData();
      setSyncStatus(status);
      return status;
    } catch (error) {
      console.error('Failed to sync data:', error);
      throw error;
    } finally {
      setOfflineLoading(false);
    }
  }, []);

  // Biometric Methods
  const fetchBiometricConfig = useCallback(async () => {
    setBiometricLoading(true);
    try {
      const config = await BiometricService.getConfig();
      setBiometricConfig(config);
    } catch (error) {
      console.error('Failed to fetch biometric config:', error);
    } finally {
      setBiometricLoading(false);
    }
  }, []);

  const updateBiometricConfig = useCallback(async (updates: Partial<BiometricConfig>) => {
    setBiometricLoading(true);
    try {
      const updated = await BiometricService.updateConfig(updates);
      setBiometricConfig(updated);
      return updated;
    } catch (error) {
      console.error('Failed to update biometric config:', error);
      throw error;
    } finally {
      setBiometricLoading(false);
    }
  }, []);

  const fetchBiometricEnrollments = useCallback(async () => {
    setBiometricLoading(true);
    try {
      const enrollments = await BiometricService.getAllEnrollments();
      setBiometricEnrollments(enrollments);
    } catch (error) {
      console.error('Failed to fetch biometric enrollments:', error);
    } finally {
      setBiometricLoading(false);
    }
  }, []);

  const enrollBiometric = useCallback(async (enrollment: Partial<BiometricEnrollment>) => {
    setBiometricLoading(true);
    try {
      const created = await BiometricService.enrollBiometric(enrollment);
      setBiometricEnrollments((prev) => [...prev, created]);
      return created;
    } catch (error) {
      console.error('Failed to enroll biometric:', error);
      throw error;
    } finally {
      setBiometricLoading(false);
    }
  }, []);

  const revokeBiometric = useCallback(async (enrollmentId: string, reason: string) => {
    setBiometricLoading(true);
    try {
      const updated = await BiometricService.revokeBiometric(enrollmentId, reason);
      setBiometricEnrollments((prev) => prev.map((e) => (e.enrollmentId === enrollmentId ? updated : e)));
      return updated;
    } catch (error) {
      console.error('Failed to revoke biometric:', error);
      throw error;
    } finally {
      setBiometricLoading(false);
    }
  }, []);

  // GPS Attendance Methods
  const fetchGPSConfig = useCallback(async () => {
    setGpsLoading(true);
    try {
      const config = await GPSAttendanceService.getConfig();
      setGpsConfig(config);
    } catch (error) {
      console.error('Failed to fetch GPS config:', error);
    } finally {
      setGpsLoading(false);
    }
  }, []);

  const updateGPSConfig = useCallback(async (updates: Partial<GPSAttendanceConfig>) => {
    setGpsLoading(true);
    try {
      const updated = await GPSAttendanceService.updateConfig(updates);
      setGpsConfig(updated);
      return updated;
    } catch (error) {
      console.error('Failed to update GPS config:', error);
      throw error;
    } finally {
      setGpsLoading(false);
    }
  }, []);

  const fetchCheckIns = useCallback(async () => {
    setGpsLoading(true);
    try {
      const data = await GPSAttendanceService.getAllCheckIns();
      setCheckIns(data);
    } catch (error) {
      console.error('Failed to fetch check-ins:', error);
    } finally {
      setGpsLoading(false);
    }
  }, []);

  const recordCheckIn = useCallback(async (checkIn: Partial<GPSCheckIn>) => {
    setGpsLoading(true);
    try {
      const created = await GPSAttendanceService.recordCheckIn(checkIn);
      setCheckIns((prev) => [...prev, created]);
      return created;
    } catch (error) {
      console.error('Failed to record check-in:', error);
      throw error;
    } finally {
      setGpsLoading(false);
    }
  }, []);

  // Approvals Methods
  const fetchApprovals = useCallback(async () => {
    setApprovalsLoading(true);
    setApprovalsError(null);
    try {
      const data = await MobileApprovalsService.getAllApprovals();
      setApprovals(data);
    } catch (error) {
      setApprovalsError(error instanceof Error ? error.message : 'Failed to fetch approvals');
    } finally {
      setApprovalsLoading(false);
    }
  }, []);

  const approveRequest = useCallback(async (approvalId: string, comments?: string) => {
    setApprovalsLoading(true);
    setApprovalsError(null);
    try {
      const updated = await MobileApprovalsService.approveRequest(approvalId, comments);
      setApprovals((prev) => prev.map((a) => (a.approvalId === approvalId ? updated : a)));
      return updated;
    } catch (error) {
      setApprovalsError(error instanceof Error ? error.message : 'Failed to approve request');
      throw error;
    } finally {
      setApprovalsLoading(false);
    }
  }, []);

  const rejectRequest = useCallback(async (approvalId: string, comments: string) => {
    setApprovalsLoading(true);
    setApprovalsError(null);
    try {
      const updated = await MobileApprovalsService.rejectRequest(approvalId, comments);
      setApprovals((prev) => prev.map((a) => (a.approvalId === approvalId ? updated : a)));
      return updated;
    } catch (error) {
      setApprovalsError(error instanceof Error ? error.message : 'Failed to reject request');
      throw error;
    } finally {
      setApprovalsLoading(false);
    }
  }, []);

  // Documents Methods
  const fetchDocumentConfig = useCallback(async () => {
    setDocumentsLoading(true);
    try {
      const config = await DocumentUploadService.getConfig();
      setDocumentConfig(config);
    } catch (error) {
      console.error('Failed to fetch document config:', error);
    } finally {
      setDocumentsLoading(false);
    }
  }, []);

  const uploadDocument = useCallback(async (document: Partial<UploadedDocument>) => {
    setDocumentsLoading(true);
    try {
      const uploaded = await DocumentUploadService.uploadDocument(document);
      setUploadedDocuments((prev) => [...prev, uploaded]);
      return uploaded;
    } catch (error) {
      console.error('Failed to upload document:', error);
      throw error;
    } finally {
      setDocumentsLoading(false);
    }
  }, []);

  const fetchUploadedDocuments = useCallback(async () => {
    setDocumentsLoading(true);
    try {
      const docs = await DocumentUploadService.getAllDocuments();
      setUploadedDocuments(docs);
    } catch (error) {
      console.error('Failed to fetch uploaded documents:', error);
    } finally {
      setDocumentsLoading(false);
    }
  }, []);

  // Timesheets Methods
  const fetchTimesheets = useCallback(async () => {
    setTimesheetsLoading(true);
    try {
      const data = await MobileTimesheetsService.getAllTimesheets();
      setTimesheets(data);
    } catch (error) {
      console.error('Failed to fetch timesheets:', error);
    } finally {
      setTimesheetsLoading(false);
    }
  }, []);

  const submitTimesheet = useCallback(async (timesheetId: string) => {
    setTimesheetsLoading(true);
    try {
      const updated = await MobileTimesheetsService.submitTimesheet(timesheetId);
      setTimesheets((prev) => prev.map((t) => (t.timesheetId === timesheetId ? updated : t)));
      return updated;
    } catch (error) {
      console.error('Failed to submit timesheet:', error);
      throw error;
    } finally {
      setTimesheetsLoading(false);
    }
  }, []);

  // Quick Actions Methods
  const fetchQuickActions = useCallback(async () => {
    setQuickActionsLoading(true);
    try {
      const actions = await QuickActionsService.getAllQuickActions();
      setQuickActions(actions);
    } catch (error) {
      console.error('Failed to fetch quick actions:', error);
    } finally {
      setQuickActionsLoading(false);
    }
  }, []);

  const updateQuickAction = useCallback(async (actionId: string, updates: Partial<QuickAction>) => {
    setQuickActionsLoading(true);
    try {
      const updated = await QuickActionsService.updateQuickAction(actionId, updates);
      setQuickActions((prev) => prev.map((a) => (a.actionId === actionId ? updated : a)));
      return updated;
    } catch (error) {
      console.error('Failed to update quick action:', error);
      throw error;
    } finally {
      setQuickActionsLoading(false);
    }
  }, []);

  // Voice Commands Methods
  const fetchVoiceConfig = useCallback(async () => {
    setVoiceLoading(true);
    try {
      const config = await VoiceCommandsService.getConfig();
      setVoiceConfig(config);
    } catch (error) {
      console.error('Failed to fetch voice config:', error);
    } finally {
      setVoiceLoading(false);
    }
  }, []);

  const recordVoiceInteraction = useCallback(async (interaction: Partial<VoiceInteraction>) => {
    setVoiceLoading(true);
    try {
      const recorded = await VoiceCommandsService.recordInteraction(interaction);
      setVoiceInteractions((prev) => [...prev, recorded]);
      return recorded;
    } catch (error) {
      console.error('Failed to record voice interaction:', error);
      throw error;
    } finally {
      setVoiceLoading(false);
    }
  }, []);

  const fetchVoiceInteractions = useCallback(async () => {
    setVoiceLoading(true);
    try {
      const interactions = await VoiceCommandsService.getAllInteractions();
      setVoiceInteractions(interactions);
    } catch (error) {
      console.error('Failed to fetch voice interactions:', error);
    } finally {
      setVoiceLoading(false);
    }
  }, []);

  // Analytics Methods
  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const data = await MobileAnalyticsService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  // Chat Methods
  const fetchConversations = useCallback(async () => {
    setChatLoading(true);
    try {
      const data = await ChatService.getAllConversations();
      setConversations(data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setChatLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (message: Partial<ChatMessage>) => {
    setChatLoading(true);
    try {
      const sent = await ChatService.sendMessage(message);
      return sent;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    } finally {
      setChatLoading(false);
    }
  }, []);

  // Profile Methods
  const fetchUserProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const profile = await MobileProfileService.getProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const updateUserProfile = useCallback(async (updates: Partial<MobileUserProfile>) => {
    setProfileLoading(true);
    try {
      const updated = await MobileProfileService.updateProfile(updates);
      setUserProfile(updated);
      return updated;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // Settings Methods
  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const data = await MobileSettingsService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (updates: Partial<MobileAppSettings>) => {
    setSettingsLoading(true);
    try {
      const updated = await MobileSettingsService.updateSettings(updates);
      setSettings(updated);
      return updated;
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  // Utility Methods
  const clearErrors = useCallback(() => {
    setNotificationsError(null);
    setApprovalsError(null);
  }, []);

  // Load initial data
  useEffect(() => {
    fetchAppConfig();
    fetchNotifications();
    fetchTemplates();
    fetchOfflineConfig();
    fetchSyncStatus();
    fetchBiometricConfig();
    fetchBiometricEnrollments();
    fetchGPSConfig();
    fetchCheckIns();
    fetchApprovals();
    fetchDocumentConfig();
    fetchUploadedDocuments();
    fetchTimesheets();
    fetchQuickActions();
    fetchVoiceConfig();
    fetchVoiceInteractions();
    fetchAnalytics();
    fetchConversations();
    fetchUserProfile();
    fetchSettings();
  }, [
    fetchAppConfig,
    fetchNotifications,
    fetchTemplates,
    fetchOfflineConfig,
    fetchSyncStatus,
    fetchBiometricConfig,
    fetchBiometricEnrollments,
    fetchGPSConfig,
    fetchCheckIns,
    fetchApprovals,
    fetchDocumentConfig,
    fetchUploadedDocuments,
    fetchTimesheets,
    fetchQuickActions,
    fetchVoiceConfig,
    fetchVoiceInteractions,
    fetchAnalytics,
    fetchConversations,
    fetchUserProfile,
    fetchSettings,
  ]);

  return {
    // State
    appConfig,
    configLoading,
    notifications,
    notificationTemplates,
    notificationsLoading,
    notificationsError,
    offlineConfig,
    syncStatus,
    offlineLoading,
    biometricConfig,
    biometricEnrollments,
    biometricLoading,
    gpsConfig,
    checkIns,
    gpsLoading,
    approvals,
    approvalsLoading,
    approvalsError,
    documentConfig,
    uploadedDocuments,
    documentsLoading,
    timesheets,
    timesheetsLoading,
    quickActions,
    quickActionsLoading,
    voiceConfig,
    voiceInteractions,
    voiceLoading,
    analytics,
    analyticsLoading,
    conversations,
    chatLoading,
    userProfile,
    profileLoading,
    settings,
    settingsLoading,

    // Methods
    fetchAppConfig,
    updateAppConfig,
    enableMaintenanceMode,
    disableMaintenanceMode,
    forceUpdate,
    fetchNotifications,
    createNotification,
    sendNotification,
    deleteNotification,
    fetchTemplates,
    createTemplate,
    fetchOfflineConfig,
    updateOfflineConfig,
    fetchSyncStatus,
    syncData,
    fetchBiometricConfig,
    updateBiometricConfig,
    fetchBiometricEnrollments,
    enrollBiometric,
    revokeBiometric,
    fetchGPSConfig,
    updateGPSConfig,
    fetchCheckIns,
    recordCheckIn,
    fetchApprovals,
    approveRequest,
    rejectRequest,
    fetchDocumentConfig,
    uploadDocument,
    fetchUploadedDocuments,
    fetchTimesheets,
    submitTimesheet,
    fetchQuickActions,
    updateQuickAction,
    fetchVoiceConfig,
    recordVoiceInteraction,
    fetchVoiceInteractions,
    fetchAnalytics,
    fetchConversations,
    sendMessage,
    fetchUserProfile,
    updateUserProfile,
    fetchSettings,
    updateSettings,
    clearErrors,
  };
}
