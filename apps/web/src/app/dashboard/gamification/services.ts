/**
 * Gamification Module - Service Layer
 * API-integrated service layer using APIClient.
 *
 * Routes return the platform envelope { success, data, meta }; read helpers here
 * unwrap that via APIClient.unwrapList / unwrapItem so callers receive bare
 * arrays / objects.
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
  GamificationSettings,
} from './types';

// ============================================================================
// Points System Service
// ============================================================================

export class PointsService {
  private static readonly ENDPOINT = '/gamification/points';

  // Points Accounts
  static async getAccount(userId: string): Promise<PointsAccount> {
    const res = await APIClient.get(`${this.ENDPOINT}/accounts/${userId}`);
    return APIClient.unwrapItem<PointsAccount>(res) as PointsAccount;
  }

  static async getAllAccounts(): Promise<PointsAccount[]> {
    const res = await APIClient.get(`${this.ENDPOINT}/accounts`);
    return APIClient.unwrapList<PointsAccount>(res);
  }

  // Points Transactions
  static async getTransactions(userId?: string): Promise<PointsTransaction[]> {
    const res = await APIClient.get(
      `${this.ENDPOINT}/transactions`,
      userId ? { userId } : undefined
    );
    return APIClient.unwrapList<PointsTransaction>(res);
  }

  static async awardPoints(
    userId: string,
    points: number,
    category: string,
    source: string,
    reason: string
  ): Promise<PointsTransaction> {
    const res = await APIClient.post(`${this.ENDPOINT}/transactions/award`, {
      userId,
      points,
      category,
      source,
      reason,
    });
    return APIClient.unwrapItem<PointsTransaction>(res) as PointsTransaction;
  }

  static async redeemPoints(
    userId: string,
    points: number,
    reason: string
  ): Promise<PointsTransaction> {
    const res = await APIClient.post(`${this.ENDPOINT}/transactions/redeem`, {
      userId,
      points,
      reason,
    });
    return APIClient.unwrapItem<PointsTransaction>(res) as PointsTransaction;
  }

  // Points Rules
  static async getRules(): Promise<PointsRule[]> {
    const res = await APIClient.get(`${this.ENDPOINT}/rules`);
    return APIClient.unwrapList<PointsRule>(res);
  }
}

// ============================================================================
// Badges Service
// ============================================================================

export class BadgesService {
  private static readonly ENDPOINT = '/gamification/badges';

  static async getBadges(): Promise<Badge[]> {
    const res = await APIClient.get(`${this.ENDPOINT}`);
    return APIClient.unwrapList<Badge>(res);
  }

  static async getBadgeById(badgeId: string): Promise<Badge> {
    const res = await APIClient.get(`${this.ENDPOINT}/${badgeId}`);
    return APIClient.unwrapItem<Badge>(res) as Badge;
  }

  static async createBadge(badge: Partial<Badge>): Promise<Badge> {
    const res = await APIClient.post(`${this.ENDPOINT}`, badge);
    return APIClient.unwrapItem<Badge>(res) as Badge;
  }

  // User Badges
  static async getUserBadges(userId?: string): Promise<UserBadge[]> {
    const res = await APIClient.get(`${this.ENDPOINT}/users`, userId ? { userId } : undefined);
    return APIClient.unwrapList<UserBadge>(res);
  }

  static async awardBadge(
    userId: string,
    userName: string,
    badgeId: string,
    reason?: string
  ): Promise<UserBadge> {
    const res = await APIClient.post(`${this.ENDPOINT}/award`, {
      userId,
      userName,
      badgeId,
      reason,
    });
    return APIClient.unwrapItem<UserBadge>(res) as UserBadge;
  }
}

// ============================================================================
// Challenges Service
// ============================================================================

export class ChallengesService {
  private static readonly ENDPOINT = '/gamification/challenges';

  static async getChallenges(): Promise<Challenge[]> {
    const res = await APIClient.get(`${this.ENDPOINT}`);
    return APIClient.unwrapList<Challenge>(res);
  }

  static async getChallengeById(challengeId: string): Promise<Challenge> {
    const res = await APIClient.get(`${this.ENDPOINT}/${challengeId}`);
    return APIClient.unwrapItem<Challenge>(res) as Challenge;
  }

  static async createChallenge(challenge: Partial<Challenge>): Promise<Challenge> {
    const res = await APIClient.post(`${this.ENDPOINT}`, challenge);
    return APIClient.unwrapItem<Challenge>(res) as Challenge;
  }

  // Challenge Participation
  static async getParticipation(
    challengeId?: string,
    userId?: string
  ): Promise<ChallengeParticipation[]> {
    const filters: Record<string, string> = {};
    if (challengeId) filters.challengeId = challengeId;
    if (userId) filters.userId = userId;
    const res = await APIClient.get(
      `${this.ENDPOINT}/participation`,
      Object.keys(filters).length > 0 ? filters : undefined
    );
    return APIClient.unwrapList<ChallengeParticipation>(res);
  }

  static async joinChallenge(
    userId: string,
    userName: string,
    challengeId: string
  ): Promise<ChallengeParticipation> {
    const res = await APIClient.post(`${this.ENDPOINT}/join`, {
      userId,
      userName,
      challengeId,
    });
    return APIClient.unwrapItem<ChallengeParticipation>(res) as ChallengeParticipation;
  }
}

// ============================================================================
// Leaderboards Service
// ============================================================================

export class LeaderboardsService {
  private static readonly ENDPOINT = '/gamification/leaderboards';

  static async getLeaderboards(scope?: string): Promise<Leaderboard[]> {
    const res = await APIClient.get(`${this.ENDPOINT}`, scope ? { scope } : undefined);
    return APIClient.unwrapList<Leaderboard>(res);
  }
}

// ============================================================================
// Levels Service
// ============================================================================

export class LevelsService {
  private static readonly ENDPOINT = '/gamification/levels';

  static async getLevelDefinitions(): Promise<LevelDefinition[]> {
    const res = await APIClient.get(`${this.ENDPOINT}/definitions`);
    return APIClient.unwrapList<LevelDefinition>(res);
  }

  static async getUserLevel(userId: string): Promise<UserLevel> {
    const res = await APIClient.get(`${this.ENDPOINT}/users/${userId}`);
    return APIClient.unwrapItem<UserLevel>(res) as UserLevel;
  }
}

// ============================================================================
// Missions Service
// ============================================================================

export class MissionsService {
  private static readonly ENDPOINT = '/gamification/missions';

  static async getMissions(): Promise<Mission[]> {
    const res = await APIClient.get(`${this.ENDPOINT}`);
    return APIClient.unwrapList<Mission>(res);
  }

  static async getMissionById(missionId: string): Promise<Mission> {
    const res = await APIClient.get(`${this.ENDPOINT}/${missionId}`);
    return APIClient.unwrapItem<Mission>(res) as Mission;
  }

  static async createMission(mission: Partial<Mission>): Promise<Mission> {
    const res = await APIClient.post(`${this.ENDPOINT}`, mission);
    return APIClient.unwrapItem<Mission>(res) as Mission;
  }

  static async getUserMissions(userId?: string): Promise<UserMission[]> {
    const res = await APIClient.get(`${this.ENDPOINT}/users`, userId ? { userId } : undefined);
    return APIClient.unwrapList<UserMission>(res);
  }

  static async startMission(
    userId: string,
    userName: string,
    missionId: string
  ): Promise<UserMission> {
    const res = await APIClient.post(`${this.ENDPOINT}/start`, {
      userId,
      userName,
      missionId,
    });
    return APIClient.unwrapItem<UserMission>(res) as UserMission;
  }
}

// ============================================================================
// Virtual Currency Service
// ============================================================================

export class VirtualCurrencyService {
  private static readonly ENDPOINT = '/gamification/currency';

  static async getCurrencies(): Promise<VirtualCurrency[]> {
    const res = await APIClient.get(`${this.ENDPOINT}/currencies`);
    return APIClient.unwrapList<VirtualCurrency>(res);
  }

  static async getCurrencyAccount(userId: string, currencyId: string): Promise<CurrencyAccount> {
    const res = await APIClient.get(`${this.ENDPOINT}/accounts/${userId}/${currencyId}`);
    return APIClient.unwrapItem<CurrencyAccount>(res) as CurrencyAccount;
  }

  static async convertPointsToCurrency(
    userId: string,
    currencyId: string,
    points: number
  ): Promise<CurrencyTransaction> {
    const res = await APIClient.post(`${this.ENDPOINT}/convert`, {
      userId,
      currencyId,
      points,
    });
    return APIClient.unwrapItem<CurrencyTransaction>(res) as CurrencyTransaction;
  }

  static async transfer(
    toUserId: string,
    amount: number,
    note?: string
  ): Promise<CurrencyTransaction> {
    const res = await APIClient.post(`${this.ENDPOINT}/transfer`, { toUserId, amount, note });
    return APIClient.unwrapItem<CurrencyTransaction>(res) as CurrencyTransaction;
  }

  static async cashOut(amount: number): Promise<CurrencyTransaction> {
    const res = await APIClient.post(`${this.ENDPOINT}/cashout`, { amount });
    return APIClient.unwrapItem<CurrencyTransaction>(res) as CurrencyTransaction;
  }
}

// ============================================================================
// Achievement Wall Service
// ============================================================================

export class AchievementWallService {
  private static readonly ENDPOINT = '/gamification/achievements';

  static async getAchievements(userId?: string): Promise<Achievement[]> {
    const res = await APIClient.get(`${this.ENDPOINT}`, userId ? { userId } : undefined);
    return APIClient.unwrapList<Achievement>(res);
  }
}

// ============================================================================
// Analytics Service
// ============================================================================

export class GamificationAnalyticsService {
  private static readonly ENDPOINT = '/gamification/analytics';

  static async getAnalytics(period: string): Promise<GamificationAnalytics> {
    const res = await APIClient.get(`${this.ENDPOINT}`, { period });
    return APIClient.unwrapItem<GamificationAnalytics>(res) as GamificationAnalytics;
  }
}

// ============================================================================
// Settings Service
// ============================================================================

export class GamificationSettingsService {
  private static readonly ENDPOINT = '/gamification/settings';

  static async getSettings(): Promise<GamificationSettings> {
    const res = await APIClient.get(`${this.ENDPOINT}`);
    return APIClient.unwrapItem<GamificationSettings>(res) as GamificationSettings;
  }

  static async updateSettings(
    updates: Partial<GamificationSettings>
  ): Promise<GamificationSettings> {
    const res = await APIClient.put(`${this.ENDPOINT}`, updates);
    return APIClient.unwrapItem<GamificationSettings>(res) as GamificationSettings;
  }
}
