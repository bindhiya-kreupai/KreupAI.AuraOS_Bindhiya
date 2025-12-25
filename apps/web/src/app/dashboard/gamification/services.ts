/**
 * Gamification Module - Service Layer
 * API-integrated service layer using APIClient
 */

'use client';

import { APIClient } from '@/lib/api-client';
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
  CurrencyAccount,
  CurrencyTransaction,
  Achievement,
  GamificationAnalytics,
  GamificationSettings} from './types';
import {
  PointsRedemption,
  LeaderboardEntry,
  AchievementWall
} from './types';

// ============================================================================
// Points System Service
// ============================================================================

export class PointsService {
  private static readonly ENDPOINT = '/gamification/points';

  // Points Accounts
  static async getAccount(userId: string): Promise<PointsAccount> {
    return APIClient.get<PointsAccount>(`${this.ENDPOINT}/accounts/${userId}`);
  }

  static async getAllAccounts(): Promise<PointsAccount[]> {
    return APIClient.get<PointsAccount[]>(`${this.ENDPOINT}/accounts`);
  }

  static async createAccount(account: PointsAccount): Promise<PointsAccount> {
    return APIClient.post<PointsAccount>(`${this.ENDPOINT}/accounts`, account);
  }

  // Points Transactions
  static async getTransactions(userId?: string): Promise<PointsTransaction[]> {
    return APIClient.get<PointsTransaction[]>(`${this.ENDPOINT}/transactions`, userId ? { userId } : undefined);
  }

  static async awardPoints(
    userId: string,
    points: number,
    category: string,
    source: string,
    reason: string
  ): Promise<PointsTransaction> {
    return APIClient.post<PointsTransaction>(`${this.ENDPOINT}/transactions/award`, {
      userId,
      points,
      category,
      source,
      reason,
    });
  }

  static async redeemPoints(
    userId: string,
    points: number,
    reason: string
  ): Promise<PointsTransaction> {
    return APIClient.post<PointsTransaction>(`${this.ENDPOINT}/transactions/redeem`, {
      userId,
      points,
      reason,
    });
  }

  // Points Rules
  static async getRules(): Promise<PointsRule[]> {
    return APIClient.get<PointsRule[]>(`${this.ENDPOINT}/rules`);
  }

  static async createRule(rule: PointsRule): Promise<PointsRule> {
    return APIClient.post<PointsRule>(`${this.ENDPOINT}/rules`, rule);
  }

  static async updateRule(ruleId: string, updates: Partial<PointsRule>): Promise<PointsRule> {
    return APIClient.put<PointsRule>(`${this.ENDPOINT}/rules/${ruleId}`, updates);
  }

  static async deleteRule(ruleId: string): Promise<void> {
    return APIClient.delete(`${this.ENDPOINT}/rules/${ruleId}`);
  }
}

// ============================================================================
// Badges Service
// ============================================================================

export class BadgesService {
  private static readonly ENDPOINT = '/gamification/badges';

  static async getBadges(): Promise<Badge[]> {
    return APIClient.get<Badge[]>(`${this.ENDPOINT}`);
  }

  static async getBadgeById(badgeId: string): Promise<Badge> {
    return APIClient.get<Badge>(`${this.ENDPOINT}/${badgeId}`);
  }

  static async createBadge(badge: Badge): Promise<Badge> {
    return APIClient.post<Badge>(`${this.ENDPOINT}`, badge);
  }

  static async updateBadge(badgeId: string, updates: Partial<Badge>): Promise<Badge> {
    return APIClient.put<Badge>(`${this.ENDPOINT}/${badgeId}`, updates);
  }

  static async deleteBadge(badgeId: string): Promise<void> {
    return APIClient.delete(`${this.ENDPOINT}/${badgeId}`);
  }

  // User Badges
  static async getUserBadges(userId?: string): Promise<UserBadge[]> {
    return APIClient.get<UserBadge[]>(`${this.ENDPOINT}/users`, userId ? { userId } : undefined);
  }

  static async awardBadge(
    userId: string,
    userName: string,
    badgeId: string,
    reason?: string
  ): Promise<UserBadge> {
    return APIClient.post<UserBadge>(`${this.ENDPOINT}/award`, {
      userId,
      userName,
      badgeId,
      reason,
    });
  }

  static async revokeBadge(userBadgeId: string, reason: string): Promise<UserBadge> {
    return APIClient.post<UserBadge>(`${this.ENDPOINT}/revoke`, {
      userBadgeId,
      reason,
    });
  }
}

// ============================================================================
// Challenges Service
// ============================================================================

export class ChallengesService {
  private static readonly ENDPOINT = '/gamification/challenges';

  static async getChallenges(): Promise<Challenge[]> {
    return APIClient.get<Challenge[]>(`${this.ENDPOINT}`);
  }

  static async getChallengeById(challengeId: string): Promise<Challenge> {
    return APIClient.get<Challenge>(`${this.ENDPOINT}/${challengeId}`);
  }

  static async createChallenge(challenge: Challenge): Promise<Challenge> {
    return APIClient.post<Challenge>(`${this.ENDPOINT}`, challenge);
  }

  static async updateChallenge(challengeId: string, updates: Partial<Challenge>): Promise<Challenge> {
    return APIClient.put<Challenge>(`${this.ENDPOINT}/${challengeId}`, updates);
  }

  static async deleteChallenge(challengeId: string): Promise<void> {
    return APIClient.delete(`${this.ENDPOINT}/${challengeId}`);
  }

  // Challenge Participation
  static async getParticipation(challengeId?: string, userId?: string): Promise<ChallengeParticipation[]> {
    const filters: any = {};
    if (challengeId) filters.challengeId = challengeId;
    if (userId) filters.userId = userId;
    return APIClient.get<ChallengeParticipation[]>(`${this.ENDPOINT}/participation`, Object.keys(filters).length > 0 ? filters : undefined);
  }

  static async joinChallenge(userId: string, userName: string, challengeId: string): Promise<ChallengeParticipation> {
    return APIClient.post<ChallengeParticipation>(`${this.ENDPOINT}/join`, {
      userId,
      userName,
      challengeId,
    });
  }

  static async updateProgress(
    participationId: string,
    value: number,
    activityType: string
  ): Promise<ChallengeParticipation> {
    return APIClient.post<ChallengeParticipation>(`${this.ENDPOINT}/participation/${participationId}/progress`, {
      value,
      activityType,
    });
  }
}

// ============================================================================
// Leaderboards Service
// ============================================================================

export class LeaderboardsService {
  private static readonly ENDPOINT = '/gamification/leaderboards';

  static async getLeaderboards(): Promise<Leaderboard[]> {
    return APIClient.get<Leaderboard[]>(`${this.ENDPOINT}`);
  }

  static async getLeaderboardById(leaderboardId: string): Promise<Leaderboard> {
    return APIClient.get<Leaderboard>(`${this.ENDPOINT}/${leaderboardId}`);
  }

  static async createLeaderboard(leaderboard: Leaderboard): Promise<Leaderboard> {
    return APIClient.post<Leaderboard>(`${this.ENDPOINT}`, leaderboard);
  }

  static async updateRankings(leaderboardId: string): Promise<Leaderboard> {
    return APIClient.post<Leaderboard>(`${this.ENDPOINT}/${leaderboardId}/update-rankings`, {});
  }
}

// ============================================================================
// Levels Service
// ============================================================================

export class LevelsService {
  private static readonly ENDPOINT = '/gamification/levels';

  static async getLevelDefinitions(): Promise<LevelDefinition[]> {
    return APIClient.get<LevelDefinition[]>(`${this.ENDPOINT}/definitions`);
  }

  static async getUserLevel(userId: string): Promise<UserLevel> {
    return APIClient.get<UserLevel>(`${this.ENDPOINT}/users/${userId}`);
  }

  static async calculateLevel(userId: string): Promise<UserLevel> {
    return APIClient.post<UserLevel>(`${this.ENDPOINT}/calculate`, { userId });
  }
}

// ============================================================================
// Missions Service
// ============================================================================

export class MissionsService {
  private static readonly ENDPOINT = '/gamification/missions';

  static async getMissions(): Promise<Mission[]> {
    return APIClient.get<Mission[]>(`${this.ENDPOINT}`);
  }

  static async getMissionById(missionId: string): Promise<Mission> {
    return APIClient.get<Mission>(`${this.ENDPOINT}/${missionId}`);
  }

  static async createMission(mission: Mission): Promise<Mission> {
    return APIClient.post<Mission>(`${this.ENDPOINT}`, mission);
  }

  static async getUserMissions(userId?: string): Promise<UserMission[]> {
    return APIClient.get<UserMission[]>(`${this.ENDPOINT}/users`, userId ? { userId } : undefined);
  }

  static async startMission(userId: string, userName: string, missionId: string): Promise<UserMission> {
    return APIClient.post<UserMission>(`${this.ENDPOINT}/start`, {
      userId,
      userName,
      missionId,
    });
  }

  static async completeMissionTask(userMissionId: string, taskId: string): Promise<UserMission> {
    return APIClient.post<UserMission>(`${this.ENDPOINT}/${userMissionId}/complete-task`, {
      taskId,
    });
  }
}

// ============================================================================
// Virtual Currency Service
// ============================================================================

export class VirtualCurrencyService {
  private static readonly ENDPOINT = '/gamification/currency';

  static async getCurrencies(): Promise<VirtualCurrency[]> {
    return APIClient.get<VirtualCurrency[]>(`${this.ENDPOINT}/currencies`);
  }

  static async getCurrencyAccount(userId: string, currencyId: string): Promise<CurrencyAccount> {
    return APIClient.get<CurrencyAccount>(`${this.ENDPOINT}/accounts/${userId}/${currencyId}`);
  }

  static async convertPointsToCurrency(
    userId: string,
    currencyId: string,
    points: number
  ): Promise<CurrencyTransaction> {
    return APIClient.post<CurrencyTransaction>(`${this.ENDPOINT}/convert`, {
      userId,
      currencyId,
      points,
    });
  }
}

// ============================================================================
// Achievement Wall Service
// ============================================================================

export class AchievementWallService {
  private static readonly ENDPOINT = '/gamification/achievements';

  static async getAchievements(userId?: string): Promise<Achievement[]> {
    return APIClient.get<Achievement[]>(`${this.ENDPOINT}`, userId ? { userId } : undefined);
  }

  static async createAchievement(achievement: Achievement): Promise<Achievement> {
    return APIClient.post<Achievement>(`${this.ENDPOINT}`, achievement);
  }

  static async likeAchievement(achievementId: string, userId: string): Promise<Achievement> {
    return APIClient.post<Achievement>(`${this.ENDPOINT}/${achievementId}/like`, { userId });
  }
}

// ============================================================================
// Analytics Service
// ============================================================================

export class GamificationAnalyticsService {
  private static readonly ENDPOINT = '/gamification/analytics';

  static async getAnalytics(period: string): Promise<GamificationAnalytics> {
    return APIClient.get<GamificationAnalytics>(`${this.ENDPOINT}`, { period });
  }
}

// ============================================================================
// Settings Service
// ============================================================================

export class GamificationSettingsService {
  private static readonly ENDPOINT = '/gamification/settings';

  static async getSettings(): Promise<GamificationSettings> {
    return APIClient.get<GamificationSettings>(`${this.ENDPOINT}`);
  }

  static async updateSettings(updates: Partial<GamificationSettings>): Promise<GamificationSettings> {
    return APIClient.put<GamificationSettings>(`${this.ENDPOINT}`, updates);
  }
}
