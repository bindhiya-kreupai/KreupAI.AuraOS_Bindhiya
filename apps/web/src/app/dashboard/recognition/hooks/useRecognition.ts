/**
 * Employee Recognition & Rewards Module - Custom Hook
 * Business logic for recognition, badges, rewards, and points management
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Recognition,
  Badge,
  EmployeeBadge,
  RewardsCatalog,
  Redemption,
  PointsTransaction,
  EmployeePoints,
  RecognitionProgram,
  Nomination,
  Award,
  RecognitionLeaderboard,
  RecognitionMetrics,
  RecognitionSettings,
  CoreValue,
  RecognitionNotification,
  RecognitionReport,
  RecognitionStatus,
  RedemptionStatus,
  RecognitionType,
  RecognitionCategory,
  RewardType,
  VisibilityType,
  ProgramStatus
} from '../types';
import {
  RecognitionService,
  BadgeService,
  RedemptionService,
  PointsService,
  RecognitionProgramService,
  RecognitionAnalyticsService,
  RecognitionSettingsService
} from '../services';
import {
  sampleRecognitions,
  sampleBadges,
  sampleEmployeeBadges,
  sampleRewardsCatalog,
  sampleRedemptions,
  samplePointsTransactions,
  sampleEmployeePoints,
  sampleRecognitionPrograms,
  sampleNominations,
  sampleAwards,
  sampleLeaderboard,
  sampleMetrics,
  sampleSettings,
  sampleCoreValues,
  sampleNotifications,
  sampleAuditLogs
} from '../data';

interface UseRecognitionReturn {
  // Recognition State
  recognitions: Recognition[];
  selectedRecognition: Recognition | null;

  // Badge State
  badges: Badge[];
  employeeBadges: EmployeeBadge[];

  // Catalog & Redemption State
  catalogItems: RewardsCatalog[];
  redemptions: Redemption[];

  // Points State
  employeePoints: EmployeePoints[];
  currentEmployeePoints: EmployeePoints | null;
  pointsTransactions: PointsTransaction[];

  // Programs & Nominations
  programs: RecognitionProgram[];
  nominations: Nomination[];
  awards: Award[];

  // Analytics & Leaderboards
  metrics: RecognitionMetrics | null;
  leaderboard: RecognitionLeaderboard | null;

  // Settings & Values
  settings: RecognitionSettings | null;
  coreValues: CoreValue[];

  // Notifications
  notifications: RecognitionNotification[];
  unreadCount: number;

  // Loading & Error States
  loading: boolean;
  error: string | null;

  // Recognition Methods
  createRecognition: (recognition: Recognition) => Promise<Recognition>;
  approveRecognition: (recognitionId: string, approverId: string, approverName: string) => Promise<void>;
  declineRecognition: (recognitionId: string, reason: string) => Promise<void>;
  publishRecognition: (recognitionId: string) => Promise<void>;
  getRecognition: (recognitionId: string) => Promise<Recognition | null>;
  getRecognitionsByEmployee: (employeeId: string) => Promise<Recognition[]>;
  getRecognitionsByType: (type: RecognitionType) => Promise<Recognition[]>;
  getRecognitionsByCategory: (category: RecognitionCategory) => Promise<Recognition[]>;
  addReaction: (recognitionId: string, userId: string, userName: string, emoji: string, reactionType: string) => Promise<void>;
  addComment: (recognitionId: string, userId: string, userName: string, comment: string, mentions: string[]) => Promise<void>;
  deleteRecognition: (recognitionId: string) => Promise<void>;

  // Badge Methods
  createBadge: (badge: Badge) => Promise<Badge>;
  awardBadge: (employeeId: string, employeeName: string, badgeId: string, awardedBy: string, awardedByName: string, recognitionId?: string, reason?: string) => Promise<EmployeeBadge>;
  getEmployeeBadges: (employeeId: string) => Promise<EmployeeBadge[]>;
  getAllBadges: () => Promise<Badge[]>;
  updateBadge: (badgeId: string, updates: Partial<Badge>) => Promise<void>;

  // Redemption Methods
  createCatalogItem: (item: RewardsCatalog) => Promise<RewardsCatalog>;
  updateCatalogItem: (itemId: string, updates: Partial<RewardsCatalog>) => Promise<void>;
  redeemReward: (redemption: Redemption) => Promise<Redemption>;
  processRedemption: (redemptionId: string, status: RedemptionStatus, processedBy: string, notes?: string) => Promise<void>;
  updateRedemptionShipping: (redemptionId: string, trackingNumber: string, estimatedDelivery: string) => Promise<void>;
  getEmployeeRedemptions: (employeeId: string) => Promise<Redemption[]>;
  cancelRedemption: (redemptionId: string, cancelledBy: string, reason: string) => Promise<void>;

  // Points Methods
  getEmployeePointsById: (employeeId: string) => Promise<EmployeePoints | null>;
  getPointsTransactions: (employeeId: string) => Promise<PointsTransaction[]>;
  addPoints: (employeeId: string, employeeName: string, points: number, source: string, relatedId?: string, description?: string) => Promise<void>;
  deductPoints: (employeeId: string, employeeName: string, points: number, source: string, relatedId?: string, description?: string) => Promise<void>;
  getPointsBalance: (employeeId: string) => Promise<number>;

  // Program Methods
  createProgram: (program: RecognitionProgram) => Promise<RecognitionProgram>;
  updateProgram: (programId: string, updates: Partial<RecognitionProgram>) => Promise<void>;
  getProgramById: (programId: string) => Promise<RecognitionProgram | null>;
  getActivePrograms: () => Promise<RecognitionProgram[]>;
  updateProgramStatus: (programId: string, status: ProgramStatus) => Promise<void>;

  // Nomination Methods
  createNomination: (nomination: Nomination) => Promise<Nomination>;
  getNominationsByProgram: (programId: string) => Promise<Nomination[]>;
  updateNominationStatus: (nominationId: string, status: string) => Promise<void>;

  // Analytics Methods
  getMetrics: () => Promise<RecognitionMetrics>;
  getLeaderboard: (type: string, period: string) => Promise<RecognitionLeaderboard>;
  generateReport: (reportType: string, filters: any) => Promise<RecognitionReport>;

  // Settings Methods
  getSettings: () => Promise<RecognitionSettings>;
  updateSettings: (updates: Partial<RecognitionSettings>) => Promise<void>;
  getCoreValues: () => Promise<CoreValue[]>;

  // Notification Methods
  getNotifications: (userId: string) => Promise<RecognitionNotification[]>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  markAllNotificationsRead: (userId: string) => Promise<void>;

  // Utility Methods
  refreshData: () => Promise<void>;
  setSelectedRecognition: (recognition: Recognition | null) => void;
  setCurrentEmployee: (employeeId: string) => Promise<void>;
}

export function useRecognition(): UseRecognitionReturn {
  // State Management
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [selectedRecognition, setSelectedRecognitionState] = useState<Recognition | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [employeeBadges, setEmployeeBadges] = useState<EmployeeBadge[]>([]);
  const [catalogItems, setCatalogItems] = useState<RewardsCatalog[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [employeePoints, setEmployeePoints] = useState<EmployeePoints[]>([]);
  const [currentEmployeePoints, setCurrentEmployeePoints] = useState<EmployeePoints | null>(null);
  const [pointsTransactions, setPointsTransactions] = useState<PointsTransaction[]>([]);
  const [programs, setPrograms] = useState<RecognitionProgram[]>([]);
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [metrics, setMetrics] = useState<RecognitionMetrics | null>(null);
  const [leaderboard, setLeaderboard] = useState<RecognitionLeaderboard | null>(null);
  const [settings, setSettings] = useState<RecognitionSettings | null>(null);
  const [coreValues, setCoreValues] = useState<CoreValue[]>([]);
  const [notifications, setNotifications] = useState<RecognitionNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize data
  const initializeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize with sample data if localStorage is empty
      const storedRecognitions = await RecognitionService.getRecognitions();
      if (storedRecognitions.length === 0) {
        for (const recognition of sampleRecognitions) {
          await RecognitionService.createRecognition(recognition);
        }
      }

      const storedBadges = await BadgeService.getBadges();
      if (storedBadges.length === 0) {
        for (const badge of sampleBadges) {
          await BadgeService.createBadge(badge);
        }
      }

      const storedCatalog = await RedemptionService.getCatalogItems();
      if (storedCatalog.length === 0) {
        for (const item of sampleRewardsCatalog) {
          await RedemptionService.createCatalogItem(item);
        }
      }

      const storedPrograms = await RecognitionProgramService.getPrograms();
      if (storedPrograms.length === 0) {
        for (const program of sampleRecognitionPrograms) {
          await RecognitionProgramService.createProgram(program);
        }
      }

      // Load all data
      setRecognitions(await RecognitionService.getRecognitions());
      setBadges(await BadgeService.getBadges());
      setEmployeeBadges(await BadgeService.getEmployeeBadges());
      setCatalogItems(await RedemptionService.getCatalogItems());
      setRedemptions(await RedemptionService.getRedemptions());
      setEmployeePoints(await PointsService.getAllEmployeePoints());
      setPrograms(await RecognitionProgramService.getPrograms());
      setMetrics(await RecognitionAnalyticsService.getMetrics());
      setSettings(await RecognitionSettingsService.getSettings());
      setCoreValues(sampleCoreValues);
      setNotifications(sampleNotifications);
      setUnreadCount(sampleNotifications.filter(n => !n.isRead).length);

    } catch {
      setError(err instanceof Error ? err.message : 'Failed to load recognition data');
      console.error('Error initializing recognition data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Recognition Methods
  const createRecognition = async (recognition: Recognition): Promise<Recognition> => {
    try {
      setLoading(true);
      setError(null);
      const created = await RecognitionService.createRecognition(recognition);
      setRecognitions(await RecognitionService.getRecognitions());
      return created;
    } catch {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create recognition';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const approveRecognition = async (recognitionId: string, approverId: string, approverName: string): Promise<void> => {
    try {
      setLoading(true);
      await RecognitionService.approveRecognition(recognitionId, approverId, approverName);
      setRecognitions(await RecognitionService.getRecognitions());
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to approve recognition');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const declineRecognition = async (recognitionId: string, reason: string): Promise<void> => {
    try {
      setLoading(true);
      await RecognitionService.declineRecognition(recognitionId, reason);
      setRecognitions(await RecognitionService.getRecognitions());
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to decline recognition');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const publishRecognition = async (recognitionId: string): Promise<void> => {
    try {
      setLoading(true);
      await RecognitionService.publishRecognition(recognitionId);
      setRecognitions(await RecognitionService.getRecognitions());
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to publish recognition');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getRecognition = async (recognitionId: string): Promise<Recognition | null> => {
    try {
      return await RecognitionService.getRecognitionById(recognitionId);
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to get recognition');
      return null;
    }
  };

  const getRecognitionsByEmployee = async (employeeId: string): Promise<Recognition[]> => {
    try {
      return await RecognitionService.getRecognitionsByEmployee(employeeId);
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to get employee recognitions');
      return [];
    }
  };

  const getRecognitionsByType = async (type: RecognitionType): Promise<Recognition[]> => {
    try {
      return await RecognitionService.getRecognitionsByType(type);
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to get recognitions by type');
      return [];
    }
  };

  const getRecognitionsByCategory = async (category: RecognitionCategory): Promise<Recognition[]> => {
    try {
      return await RecognitionService.getRecognitionsByCategory(category);
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to get recognitions by category');
      return [];
    }
  };

  const addReaction = async (
    recognitionId: string,
    userId: string,
    userName: string,
    emoji: string,
    reactionType: string
  ): Promise<void> => {
    try {
      await RecognitionService.addReaction(recognitionId, userId, userName, emoji, reactionType as any);
      setRecognitions(await RecognitionService.getRecognitions());
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to add reaction');
      throw err;
    }
  };

  const addComment = async (
    recognitionId: string,
    userId: string,
    userName: string,
    comment: string,
    mentions: string[]
  ): Promise<void> => {
    try {
      await RecognitionService.addComment(recognitionId, userId, userName, comment, mentions);
      setRecognitions(await RecognitionService.getRecognitions());
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
      throw err;
    }
  };

  const deleteRecognition = async (recognitionId: string): Promise<void> => {
    try {
      setLoading(true);
      await RecognitionService.deleteRecognition(recognitionId);
      setRecognitions(await RecognitionService.getRecognitions());
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to delete recognition');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Badge Methods
  const createBadge = async (badge: Badge): Promise<Badge> => {
    try {
      setLoading(true);
      const created = await BadgeService.createBadge(badge);
      setBadges(await BadgeService.getBadges());
      return created;
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to create badge');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const awardBadge = async (
    employeeId: string,
    employeeName: string,
    badgeId: string,
    awardedBy: string,
    awardedByName: string,
    recognitionId?: string,
    reason?: string
  ): Promise<EmployeeBadge> => {
    try {
      setLoading(true);
      const awarded = await BadgeService.awardBadge(
        employeeId,
        employeeName,
        badgeId,
        awardedBy,
        awardedByName,
        recognitionId,
        reason
      );
      setEmployeeBadges(await BadgeService.getEmployeeBadges());
      return awarded;
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to award badge');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeBadges = async (employeeId: string): Promise<EmployeeBadge[]> => {
    try {
      return await BadgeService.getEmployeeBadgesByEmployee(employeeId);
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to get employee badges');
      return [];
    }
  };

  const getAllBadges = async (): Promise<Badge[]> => {
    try {
      return await BadgeService.getBadges();
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to get badges');
      return [];
    }
  };

  const updateBadge = async (badgeId: string, updates: Partial<Badge>): Promise<void> => {
    try {
      setLoading(true);
      await BadgeService.updateBadge(badgeId, updates);
      setBadges(await BadgeService.getBadges());
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to update badge');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Redemption Methods
  const createCatalogItem = async (item: RewardsCatalog): Promise<RewardsCatalog> => {
    try {
      setLoading(true);
      const created = await RedemptionService.createCatalogItem(item);
      setCatalogItems(await RedemptionService.getCatalogItems());
      return created;
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to create catalog item');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCatalogItem = async (itemId: string, updates: Partial<RewardsCatalog>): Promise<void> => {
    try {
      setLoading(true);
      await RedemptionService.updateCatalogItem(itemId, updates);
      setCatalogItems(await RedemptionService.getCatalogItems());
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to update catalog item');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const redeemReward = async (redemption: Redemption): Promise<Redemption> => {
    try {
      setLoading(true);
      const redeemed = await RedemptionService.redeemReward(redemption);
      setRedemptions(await RedemptionService.getRedemptions());
      setEmployeePoints(await PointsService.getAllEmployeePoints());
      return redeemed;
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to redeem reward');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const processRedemption = async (
    redemptionId: string,
    status: RedemptionStatus,
    processedBy: string,
    notes?: string
  ): Promise<void> => {
    try {
      setLoading(true);
      await RedemptionService.processRedemption(redemptionId, status, processedBy, notes);
      setRedemptions(await RedemptionService.getRedemptions());
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to process redemption');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRedemptionShipping = async (
    redemptionId: string,
    trackingNumber: string,
    estimatedDelivery: string
  ): Promise<void> => {
    try {
      setLoading(true);
      await RedemptionService.updateShipping(redemptionId, trackingNumber, estimatedDelivery);
      setRedemptions(await RedemptionService.getRedemptions());
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to update shipping');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeRedemptions = async (employeeId: string): Promise<Redemption[]> => {
    try {
      return await RedemptionService.getRedemptionsByEmployee(employeeId);
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to get employee redemptions');
      return [];
    }
  };

  const cancelRedemption = async (redemptionId: string, cancelledBy: string, reason: string): Promise<void> => {
    try {
      setLoading(true);
      await RedemptionService.cancelRedemption(redemptionId, cancelledBy, reason);
      setRedemptions(await RedemptionService.getRedemptions());
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to cancel redemption');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Points Methods
  const getEmployeePointsById = async (employeeId: string): Promise<EmployeePoints | null> => {
    try {
      return await PointsService.getEmployeePoints(employeeId);
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to get employee points');
      return null;
    }
  };

  const getPointsTransactions = async (employeeId: string): Promise<PointsTransaction[]> => {
    try {
      return await PointsService.getPointsTransactions(employeeId);
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to get points transactions');
      return [];
    }
  };

  const addPoints = async (
    employeeId: string,
    employeeName: string,
    points: number,
    source: string,
    relatedId?: string,
    description?: string
  ): Promise<void> => {
    try {
      setLoading(true);
      await PointsService.addPoints(employeeId, employeeName, points, source, relatedId, description);
      setEmployeePoints(await PointsService.getAllEmployeePoints());
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to add points');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deductPoints = async (
    employeeId: string,
    employeeName: string,
    points: number,
    source: string,
    relatedId?: string,
    description?: string
  ): Promise<void> => {
    try {
      setLoading(true);
      await PointsService.deductPoints(employeeId, employeeName, points, source, relatedId, description);
      setEmployeePoints(await PointsService.getAllEmployeePoints());
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to deduct points');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPointsBalance = async (employeeId: string): Promise<number> => {
    try {
      return await PointsService.getPointsBalance(employeeId);
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to get points balance');
      return 0;
    }
  };

  // Program Methods
  const createProgram = async (program: RecognitionProgram): Promise<RecognitionProgram> => {
    try {
      setLoading(true);
      const created = await RecognitionProgramService.createProgram(program);
      setPrograms(await RecognitionProgramService.getPrograms());
      return created;
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to create program');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProgram = async (programId: string, updates: Partial<RecognitionProgram>): Promise<void> => {
    try {
      setLoading(true);
      await RecognitionProgramService.updateProgram(programId, updates);
      setPrograms(await RecognitionProgramService.getPrograms());
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to update program');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getProgramById = async (programId: string): Promise<RecognitionProgram | null> => {
    try {
      return await RecognitionProgramService.getProgramById(programId);
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to get program');
      return null;
    }
  };

  const getActivePrograms = async (): Promise<RecognitionProgram[]> => {
    try {
      return await RecognitionProgramService.getActivePrograms();
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to get active programs');
      return [];
    }
  };

  const updateProgramStatus = async (programId: string, status: ProgramStatus): Promise<void> => {
    try {
      setLoading(true);
      await RecognitionProgramService.updateProgramStatus(programId, status);
      setPrograms(await RecognitionProgramService.getPrograms());
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to update program status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Nomination Methods
  const createNomination = async (nomination: Nomination): Promise<Nomination> => {
    try {
      setLoading(true);
      // TODO: Implement nomination service
      return nomination;
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to create nomination');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getNominationsByProgram = async (programId: string): Promise<Nomination[]> => {
    try {
      // TODO: Implement nomination service
      return sampleNominations.filter(n => n.programId === programId);
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to get nominations');
      return [];
    }
  };

  const updateNominationStatus = async (nominationId: string, status: string): Promise<void> => {
    try {
      setLoading(true);
      // TODO: Implement nomination service
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to update nomination status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Analytics Methods
  const getMetrics = async (): Promise<RecognitionMetrics> => {
    try {
      const metrics = await RecognitionAnalyticsService.getMetrics();
      setMetrics(metrics);
      return metrics;
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to get metrics');
      throw err;
    }
  };

  const getLeaderboard = async (type: string, period: string): Promise<RecognitionLeaderboard> => {
    try {
      const lb = await RecognitionAnalyticsService.getLeaderboard(type as any, period as any);
      setLeaderboard(lb);
      return lb;
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to get leaderboard');
      throw err;
    }
  };

  const generateReport = async (reportType: string, filters: any): Promise<RecognitionReport> => {
    try {
      return await RecognitionAnalyticsService.generateReport(reportType as any, filters);
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
      throw err;
    }
  };

  // Settings Methods
  const getSettings = async (): Promise<RecognitionSettings> => {
    try {
      const settings = await RecognitionSettingsService.getSettings();
      setSettings(settings);
      return settings;
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to get settings');
      throw err;
    }
  };

  const updateSettings = async (updates: Partial<RecognitionSettings>): Promise<void> => {
    try {
      setLoading(true);
      await RecognitionSettingsService.updateSettings(updates);
      setSettings(await RecognitionSettingsService.getSettings());
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCoreValues = async (): Promise<CoreValue[]> => {
    try {
      return sampleCoreValues;
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to get core values');
      return [];
    }
  };

  // Notification Methods
  const getNotifications = async (userId: string): Promise<RecognitionNotification[]> => {
    try {
      return sampleNotifications.filter(n => n.recipientId === userId);
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to get notifications');
      return [];
    }
  };

  const markNotificationRead = async (notificationId: string): Promise<void> => {
    try {
      const updated = notifications.map(n =>
        n.id === notificationId ? { ...n, isRead: true, readDate: new Date().toISOString() } : n
      );
      setNotifications(updated);
      setUnreadCount(updated.filter(n => !n.isRead).length);
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to mark notification read');
      throw err;
    }
  };

  const markAllNotificationsRead = async (userId: string): Promise<void> => {
    try {
      const updated = notifications.map(n =>
        n.recipientId === userId ? { ...n, isRead: true, readDate: new Date().toISOString() } : n
      );
      setNotifications(updated);
      setUnreadCount(0);
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to mark all notifications read');
      throw err;
    }
  };

  // Utility Methods
  const refreshData = async (): Promise<void> => {
    await initializeData();
  };

  const setSelectedRecognition = (recognition: Recognition | null): void => {
    setSelectedRecognitionState(recognition);
  };

  const setCurrentEmployee = async (employeeId: string): Promise<void> => {
    try {
      const points = await PointsService.getEmployeePoints(employeeId);
      setCurrentEmployeePoints(points);
      const transactions = await PointsService.getPointsTransactions(employeeId);
      setPointsTransactions(transactions);
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to set current employee');
    }
  };

  return {
    // State
    recognitions,
    selectedRecognition,
    badges,
    employeeBadges,
    catalogItems,
    redemptions,
    employeePoints,
    currentEmployeePoints,
    pointsTransactions,
    programs,
    nominations,
    awards,
    metrics,
    leaderboard,
    settings,
    coreValues,
    notifications,
    unreadCount,
    loading,
    error,

    // Recognition Methods
    createRecognition,
    approveRecognition,
    declineRecognition,
    publishRecognition,
    getRecognition,
    getRecognitionsByEmployee,
    getRecognitionsByType,
    getRecognitionsByCategory,
    addReaction,
    addComment,
    deleteRecognition,

    // Badge Methods
    createBadge,
    awardBadge,
    getEmployeeBadges,
    getAllBadges,
    updateBadge,

    // Redemption Methods
    createCatalogItem,
    updateCatalogItem,
    redeemReward,
    processRedemption,
    updateRedemptionShipping,
    getEmployeeRedemptions,
    cancelRedemption,

    // Points Methods
    getEmployeePointsById,
    getPointsTransactions,
    addPoints,
    deductPoints,
    getPointsBalance,

    // Program Methods
    createProgram,
    updateProgram,
    getProgramById,
    getActivePrograms,
    updateProgramStatus,

    // Nomination Methods
    createNomination,
    getNominationsByProgram,
    updateNominationStatus,

    // Analytics Methods
    getMetrics,
    getLeaderboard,
    generateReport,

    // Settings Methods
    getSettings,
    updateSettings,
    getCoreValues,

    // Notification Methods
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,

    // Utility Methods
    refreshData,
    setSelectedRecognition,
    setCurrentEmployee
  };
}
