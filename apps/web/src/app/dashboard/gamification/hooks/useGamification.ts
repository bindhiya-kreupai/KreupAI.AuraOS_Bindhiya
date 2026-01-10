/**
 * Gamification Module - Custom Hook
 * Centralized state management and business logic for gamification
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  PointsAccount,
  PointsTransaction,
  PointsRule,
  Badge,
  UserBadge,
  Challenge,
  ChallengeParticipation,
  Leaderboard,
  LevelDefinition,
  UserLevel,
  Mission,
  UserMission,
  VirtualCurrency,
  Achievement,
  GamificationAnalytics,
  GamificationSettings} from '../types';
import {
  CurrencyAccount
} from '../types';
import {
  PointsService,
  BadgesService,
  ChallengesService,
  LeaderboardsService,
  LevelsService,
  MissionsService,
  VirtualCurrencyService,
  AchievementWallService,
  GamificationAnalyticsService,
  GamificationSettingsService,
} from '../services';

export interface UseGamificationReturn {
  // Points System
  pointsAccount: PointsAccount | null;
  pointsTransactions: PointsTransaction[];
  pointsRules: PointsRule[];
  awardPoints: (userId: string, points: number, category: string, source: string, reason: string) => Promise<PointsTransaction>;
  redeemPoints: (userId: string, points: number, reason: string) => Promise<PointsTransaction>;
  createPointsRule: (rule: PointsRule) => Promise<PointsRule>;
  updatePointsRule: (ruleId: string, updates: Partial<PointsRule>) => Promise<PointsRule>;
  deletePointsRule: (ruleId: string) => Promise<void>;

  // Badges
  badges: Badge[];
  userBadges: UserBadge[];
  getBadgeById: (badgeId: string) => Promise<Badge>;
  createBadge: (badge: Badge) => Promise<Badge>;
  updateBadge: (badgeId: string, updates: Partial<Badge>) => Promise<Badge>;
  deleteBadge: (badgeId: string) => Promise<void>;
  awardBadge: (userId: string, userName: string, badgeId: string, reason?: string) => Promise<UserBadge>;
  revokeBadge: (userBadgeId: string, reason: string) => Promise<UserBadge>;

  // Challenges
  challenges: Challenge[];
  challengeParticipation: ChallengeParticipation[];
  getChallengeById: (challengeId: string) => Promise<Challenge>;
  createChallenge: (challenge: Challenge) => Promise<Challenge>;
  updateChallenge: (challengeId: string, updates: Partial<Challenge>) => Promise<Challenge>;
  deleteChallenge: (challengeId: string) => Promise<void>;
  joinChallenge: (userId: string, userName: string, challengeId: string) => Promise<ChallengeParticipation>;
  updateChallengeProgress: (participationId: string, value: number, activityType: string) => Promise<ChallengeParticipation>;

  // Leaderboards
  leaderboards: Leaderboard[];
  getLeaderboardById: (leaderboardId: string) => Promise<Leaderboard>;
  createLeaderboard: (leaderboard: Leaderboard) => Promise<Leaderboard>;
  updateLeaderboardRankings: (leaderboardId: string) => Promise<Leaderboard>;

  // Levels
  levelDefinitions: LevelDefinition[];
  userLevel: UserLevel | null;
  calculateUserLevel: (userId: string) => Promise<UserLevel>;

  // Missions
  missions: Mission[];
  userMissions: UserMission[];
  getMissionById: (missionId: string) => Promise<Mission>;
  createMission: (mission: Mission) => Promise<Mission>;
  startMission: (userId: string, userName: string, missionId: string) => Promise<UserMission>;
  completeMissionTask: (userMissionId: string, taskId: string) => Promise<UserMission>;

  // Virtual Currency
  currencies: VirtualCurrency[];
  convertPointsToCurrency: (userId: string, currencyId: string, points: number) => Promise<any>;

  // Achievement Wall
  achievements: Achievement[];
  createAchievement: (achievement: Achievement) => Promise<Achievement>;
  likeAchievement: (achievementId: string, userId: string) => Promise<Achievement>;

  // Analytics & Settings
  analytics: GamificationAnalytics | null;
  settings: GamificationSettings | null;
  updateSettings: (updates: Partial<GamificationSettings>) => Promise<GamificationSettings>;

  // Global State
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export function useGamification(userId: string = 'user-001'): UseGamificationReturn {
  // State
  const [pointsAccount, setPointsAccount] = useState<PointsAccount | null>(null);
  const [pointsTransactions, setPointsTransactions] = useState<PointsTransaction[]>([]);
  const [pointsRules, setPointsRules] = useState<PointsRule[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [challengeParticipation, setChallengeParticipation] = useState<ChallengeParticipation[]>([]);
  const [leaderboards, setLeaderboards] = useState<Leaderboard[]>([]);
  const [levelDefinitions, setLevelDefinitions] = useState<LevelDefinition[]>([]);
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [userMissions, setUserMissions] = useState<UserMission[]>([]);
  const [currencies, setCurrencies] = useState<VirtualCurrency[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [analytics, setAnalytics] = useState<GamificationAnalytics | null>(null);
  const [settings, setSettings] = useState<GamificationSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Data
  const initializeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        accountData,
        transactionsData,
        rulesData,
        badgesData,
        userBadgesData,
        challengesData,
        participationData,
        leaderboardsData,
        levelsData,
        userLevelData,
        missionsData,
        userMissionsData,
        currenciesData,
        achievementsData,
        analyticsData,
        settingsData,
      ] = await Promise.all([
        PointsService.getAccount(userId),
        PointsService.getTransactions(userId),
        PointsService.getRules(),
        BadgesService.getBadges(),
        BadgesService.getUserBadges(userId),
        ChallengesService.getChallenges(),
        ChallengesService.getParticipation(undefined, userId),
        LeaderboardsService.getLeaderboards(),
        LevelsService.getLevelDefinitions(),
        LevelsService.getUserLevel(userId),
        MissionsService.getMissions(),
        MissionsService.getUserMissions(userId),
        VirtualCurrencyService.getCurrencies(),
        AchievementWallService.getAchievements(userId),
        GamificationAnalyticsService.getAnalytics('monthly'),
        GamificationSettingsService.getSettings(),
      ]);

      setPointsAccount(accountData);
      setPointsTransactions(transactionsData);
      setPointsRules(rulesData);
      setBadges(badgesData);
      setUserBadges(userBadgesData);
      setChallenges(challengesData);
      setChallengeParticipation(participationData);
      setLeaderboards(leaderboardsData);
      setLevelDefinitions(levelsData);
      setUserLevel(userLevelData);
      setMissions(missionsData);
      setUserMissions(userMissionsData);
      setCurrencies(currenciesData);
      setAchievements(achievementsData);
      setAnalytics(analyticsData);
      setSettings(settingsData);
    } catch (error) {
      setError(err instanceof Error ? err.message : 'Failed to load gamification data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // ============================================================================
  // Points System Methods
  // ============================================================================

  const awardPoints = async (
    userId: string,
    points: number,
    category: string,
    source: string,
    reason: string
  ): Promise<PointsTransaction> => {
    const transaction = await PointsService.awardPoints(userId, points, category, source, reason);
    setPointsTransactions([transaction, ...pointsTransactions]);

    // Refresh account
    const account = await PointsService.getAccount(userId);
    setPointsAccount(account);

    return transaction;
  };

  const redeemPoints = async (userId: string, points: number, reason: string): Promise<PointsTransaction> => {
    const transaction = await PointsService.redeemPoints(userId, points, reason);
    setPointsTransactions([transaction, ...pointsTransactions]);

    // Refresh account
    const account = await PointsService.getAccount(userId);
    setPointsAccount(account);

    return transaction;
  };

  const createPointsRule = async (rule: PointsRule): Promise<PointsRule> => {
    const created = await PointsService.createRule(rule);
    setPointsRules([...pointsRules, created]);
    return created;
  };

  const updatePointsRule = async (ruleId: string, updates: Partial<PointsRule>): Promise<PointsRule> => {
    const updated = await PointsService.updateRule(ruleId, updates);
    setPointsRules(pointsRules.map((r) => (r.ruleId === ruleId ? updated : r)));
    return updated;
  };

  const deletePointsRule = async (ruleId: string): Promise<void> => {
    await PointsService.deleteRule(ruleId);
    setPointsRules(pointsRules.filter((r) => r.ruleId !== ruleId));
  };

  // ============================================================================
  // Badges Methods
  // ============================================================================

  const getBadgeById = async (badgeId: string): Promise<Badge> => {
    return BadgesService.getBadgeById(badgeId);
  };

  const createBadge = async (badge: Badge): Promise<Badge> => {
    const created = await BadgesService.createBadge(badge);
    setBadges([...badges, created]);
    return created;
  };

  const updateBadge = async (badgeId: string, updates: Partial<Badge>): Promise<Badge> => {
    const updated = await BadgesService.updateBadge(badgeId, updates);
    setBadges(badges.map((b) => (b.badgeId === badgeId ? updated : b)));
    return updated;
  };

  const deleteBadge = async (badgeId: string): Promise<void> => {
    await BadgesService.deleteBadge(badgeId);
    setBadges(badges.filter((b) => b.badgeId !== badgeId));
  };

  const awardBadge = async (userId: string, userName: string, badgeId: string, reason?: string): Promise<UserBadge> => {
    const userBadge = await BadgesService.awardBadge(userId, userName, badgeId, reason);
    setUserBadges([...userBadges, userBadge]);

    // Refresh points account if points were awarded
    const account = await PointsService.getAccount(userId);
    setPointsAccount(account);

    return userBadge;
  };

  const revokeBadge = async (userBadgeId: string, reason: string): Promise<UserBadge> => {
    const revoked = await BadgesService.revokeBadge(userBadgeId, reason);
    setUserBadges(userBadges.map((ub) => (ub.userBadgeId === userBadgeId ? revoked : ub)));
    return revoked;
  };

  // ============================================================================
  // Challenges Methods
  // ============================================================================

  const getChallengeById = async (challengeId: string): Promise<Challenge> => {
    return ChallengesService.getChallengeById(challengeId);
  };

  const createChallenge = async (challenge: Challenge): Promise<Challenge> => {
    const created = await ChallengesService.createChallenge(challenge);
    setChallenges([...challenges, created]);
    return created;
  };

  const updateChallenge = async (challengeId: string, updates: Partial<Challenge>): Promise<Challenge> => {
    const updated = await ChallengesService.updateChallenge(challengeId, updates);
    setChallenges(challenges.map((c) => (c.challengeId === challengeId ? updated : c)));
    return updated;
  };

  const deleteChallenge = async (challengeId: string): Promise<void> => {
    await ChallengesService.deleteChallenge(challengeId);
    setChallenges(challenges.filter((c) => c.challengeId !== challengeId));
  };

  const joinChallenge = async (userId: string, userName: string, challengeId: string): Promise<ChallengeParticipation> => {
    const participation = await ChallengesService.joinChallenge(userId, userName, challengeId);
    setChallengeParticipation([...challengeParticipation, participation]);
    return participation;
  };

  const updateChallengeProgress = async (
    participationId: string,
    value: number,
    activityType: string
  ): Promise<ChallengeParticipation> => {
    const updated = await ChallengesService.updateProgress(participationId, value, activityType);
    setChallengeParticipation(challengeParticipation.map((p) => (p.participationId === participationId ? updated : p)));

    // Refresh points account if challenge was completed
    const account = await PointsService.getAccount(userId);
    setPointsAccount(account);

    return updated;
  };

  // ============================================================================
  // Leaderboards Methods
  // ============================================================================

  const getLeaderboardById = async (leaderboardId: string): Promise<Leaderboard> => {
    return LeaderboardsService.getLeaderboardById(leaderboardId);
  };

  const createLeaderboard = async (leaderboard: Leaderboard): Promise<Leaderboard> => {
    const created = await LeaderboardsService.createLeaderboard(leaderboard);
    setLeaderboards([...leaderboards, created]);
    return created;
  };

  const updateLeaderboardRankings = async (leaderboardId: string): Promise<Leaderboard> => {
    const updated = await LeaderboardsService.updateRankings(leaderboardId);
    setLeaderboards(leaderboards.map((l) => (l.leaderboardId === leaderboardId ? updated : l)));
    return updated;
  };

  // ============================================================================
  // Levels Methods
  // ============================================================================

  const calculateUserLevel = async (userId: string): Promise<UserLevel> => {
    const level = await LevelsService.calculateLevel(userId);
    setUserLevel(level);
    return level;
  };

  // ============================================================================
  // Missions Methods
  // ============================================================================

  const getMissionById = async (missionId: string): Promise<Mission> => {
    return MissionsService.getMissionById(missionId);
  };

  const createMission = async (mission: Mission): Promise<Mission> => {
    const created = await MissionsService.createMission(mission);
    setMissions([...missions, created]);
    return created;
  };

  const startMission = async (userId: string, userName: string, missionId: string): Promise<UserMission> => {
    const userMission = await MissionsService.startMission(userId, userName, missionId);
    setUserMissions([...userMissions, userMission]);
    return userMission;
  };

  const completeMissionTask = async (userMissionId: string, taskId: string): Promise<UserMission> => {
    const updated = await MissionsService.completeMissionTask(userMissionId, taskId);
    setUserMissions(userMissions.map((um) => (um.userMissionId === userMissionId ? updated : um)));

    // Refresh points account if mission was completed
    const account = await PointsService.getAccount(userId);
    setPointsAccount(account);

    return updated;
  };

  // ============================================================================
  // Virtual Currency Methods
  // ============================================================================

  const convertPointsToCurrency = async (userId: string, currencyId: string, points: number): Promise<any> => {
    const transaction = await VirtualCurrencyService.convertPointsToCurrency(userId, currencyId, points);

    // Refresh points account
    const account = await PointsService.getAccount(userId);
    setPointsAccount(account);

    return transaction;
  };

  // ============================================================================
  // Achievement Wall Methods
  // ============================================================================

  const createAchievement = async (achievement: Achievement): Promise<Achievement> => {
    const created = await AchievementWallService.createAchievement(achievement);
    setAchievements([created, ...achievements]);
    return created;
  };

  const likeAchievement = async (achievementId: string, userId: string): Promise<Achievement> => {
    const liked = await AchievementWallService.likeAchievement(achievementId, userId);
    setAchievements(achievements.map((a) => (a.achievementId === achievementId ? liked : a)));
    return liked;
  };

  // ============================================================================
  // Settings Methods
  // ============================================================================

  const updateSettings = async (updates: Partial<GamificationSettings>): Promise<GamificationSettings> => {
    const updated = await GamificationSettingsService.updateSettings(updates);
    setSettings(updated);
    return updated;
  };

  return {
    // Points System
    pointsAccount,
    pointsTransactions,
    pointsRules,
    awardPoints,
    redeemPoints,
    createPointsRule,
    updatePointsRule,
    deletePointsRule,

    // Badges
    badges,
    userBadges,
    getBadgeById,
    createBadge,
    updateBadge,
    deleteBadge,
    awardBadge,
    revokeBadge,

    // Challenges
    challenges,
    challengeParticipation,
    getChallengeById,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    joinChallenge,
    updateChallengeProgress,

    // Leaderboards
    leaderboards,
    getLeaderboardById,
    createLeaderboard,
    updateLeaderboardRankings,

    // Levels
    levelDefinitions,
    userLevel,
    calculateUserLevel,

    // Missions
    missions,
    userMissions,
    getMissionById,
    createMission,
    startMission,
    completeMissionTask,

    // Virtual Currency
    currencies,
    convertPointsToCurrency,

    // Achievement Wall
    achievements,
    createAchievement,
    likeAchievement,

    // Global
    analytics,
    settings,
    updateSettings,
    loading,
    error,
    refreshData: initializeData,
  };
}
