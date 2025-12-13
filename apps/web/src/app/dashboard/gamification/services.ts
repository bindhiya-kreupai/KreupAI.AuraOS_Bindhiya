/**
 * Gamification Module - Service Layer
 * API-ready services for points, badges, challenges, and rewards
 */

'use client';

import {
  PointsAccount,
  PointsTransaction,
  PointsRule,
  PointsRedemption,
  Badge,
  UserBadge,
  Challenge,
  ChallengeParticipation,
  Leaderboard,
  LeaderboardEntry,
  LevelDefinition,
  UserLevel,
  Mission,
  UserMission,
  VirtualCurrency,
  CurrencyAccount,
  CurrencyTransaction,
  Achievement,
  AchievementWall,
  GamificationAnalytics,
  GamificationSettings,
} from './types';

// ============================================================================
// Points System Service
// ============================================================================

export class PointsService {
  private static ACCOUNTS_KEY = 'gamification_points_accounts';
  private static TRANSACTIONS_KEY = 'gamification_points_transactions';
  private static RULES_KEY = 'gamification_points_rules';
  private static REDEMPTIONS_KEY = 'gamification_points_redemptions';

  // Points Accounts
  static async getAccount(userId: string): Promise<PointsAccount> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(this.ACCOUNTS_KEY);
    const accounts: PointsAccount[] = data ? JSON.parse(data) : [];

    const account = accounts.find((a) => a.userId === userId);
    if (!account) throw new Error('Points account not found');
    return account;
  }

  static async getAllAccounts(): Promise<PointsAccount[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(this.ACCOUNTS_KEY);
    return data ? JSON.parse(data) : [];
  }

  static async createAccount(account: PointsAccount): Promise<PointsAccount> {
    // TODO: Replace with actual API call
    const accounts = await this.getAllAccounts();
    const newAccount = {
      ...account,
      audit: {
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system',
      },
    };
    accounts.push(newAccount);
    localStorage.setItem(this.ACCOUNTS_KEY, JSON.stringify(accounts));
    return newAccount;
  }

  // Points Transactions
  static async getTransactions(userId?: string): Promise<PointsTransaction[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(this.TRANSACTIONS_KEY);
    const transactions: PointsTransaction[] = data ? JSON.parse(data) : [];

    if (userId) {
      return transactions.filter((t) => t.userId === userId);
    }
    return transactions;
  }

  static async awardPoints(
    userId: string,
    points: number,
    category: string,
    source: string,
    reason: string
  ): Promise<PointsTransaction> {
    // TODO: Replace with actual API call
    const account = await this.getAccount(userId);

    const transaction: PointsTransaction = {
      transactionId: `trans-${Date.now()}`,
      userId,
      userName: account.userName,
      transactionType: 'earn',
      transactionDate: new Date(),
      pointsAmount: points,
      pointsBalance: account.currentBalance + points,
      category: category as any,
      source,
      reason,
      description: reason,
      isExpired: false,
      requiresApproval: false,
      audit: {
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system',
      },
    };

    // Save transaction
    const transactions = await this.getTransactions();
    transactions.push(transaction);
    localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(transactions));

    // Update account balance
    const accounts = await this.getAllAccounts();
    const accountIndex = accounts.findIndex((a) => a.userId === userId);
    if (accountIndex >= 0) {
      accounts[accountIndex].currentBalance += points;
      accounts[accountIndex].totalPoints += points;
      accounts[accountIndex].lifetimePoints += points;
      accounts[accountIndex].lastEarnedDate = new Date();
      accounts[accountIndex].totalTransactions++;
      localStorage.setItem(this.ACCOUNTS_KEY, JSON.stringify(accounts));
    }

    return transaction;
  }

  static async redeemPoints(
    userId: string,
    points: number,
    reason: string
  ): Promise<PointsTransaction> {
    // TODO: Replace with actual API call
    const account = await this.getAccount(userId);

    if (account.currentBalance < points) {
      throw new Error('Insufficient points balance');
    }

    const transaction: PointsTransaction = {
      transactionId: `trans-${Date.now()}`,
      userId,
      userName: account.userName,
      transactionType: 'redeem',
      transactionDate: new Date(),
      pointsAmount: -points,
      pointsBalance: account.currentBalance - points,
      category: 'other',
      source: 'redemption',
      reason,
      description: reason,
      isExpired: false,
      requiresApproval: false,
      audit: {
        createdAt: new Date(),
        createdBy: userId,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    };

    // Save transaction
    const transactions = await this.getTransactions();
    transactions.push(transaction);
    localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(transactions));

    // Update account balance
    const accounts = await this.getAllAccounts();
    const accountIndex = accounts.findIndex((a) => a.userId === userId);
    if (accountIndex >= 0) {
      accounts[accountIndex].currentBalance -= points;
      accounts[accountIndex].lastRedeemedDate = new Date();
      accounts[accountIndex].totalTransactions++;
      localStorage.setItem(this.ACCOUNTS_KEY, JSON.stringify(accounts));
    }

    return transaction;
  }

  // Points Rules
  static async getRules(): Promise<PointsRule[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(this.RULES_KEY);
    return data ? JSON.parse(data) : [];
  }

  static async createRule(rule: PointsRule): Promise<PointsRule> {
    // TODO: Replace with actual API call
    const rules = await this.getRules();
    const newRule = {
      ...rule,
      audit: {
        createdAt: new Date(),
        createdBy: 'current-user',
        updatedAt: new Date(),
        updatedBy: 'current-user',
      },
    };
    rules.push(newRule);
    localStorage.setItem(this.RULES_KEY, JSON.stringify(rules));
    return newRule;
  }

  static async updateRule(ruleId: string, updates: Partial<PointsRule>): Promise<PointsRule> {
    // TODO: Replace with actual API call
    const rules = await this.getRules();
    const index = rules.findIndex((r) => r.ruleId === ruleId);
    if (index === -1) throw new Error('Points rule not found');

    const updated = {
      ...rules[index],
      ...updates,
      audit: {
        ...rules[index].audit,
        updatedAt: new Date(),
        updatedBy: 'current-user',
      },
    };
    rules[index] = updated;
    localStorage.setItem(this.RULES_KEY, JSON.stringify(rules));
    return updated;
  }

  static async deleteRule(ruleId: string): Promise<void> {
    // TODO: Replace with actual API call
    const rules = await this.getRules();
    const filtered = rules.filter((r) => r.ruleId !== ruleId);
    localStorage.setItem(this.RULES_KEY, JSON.stringify(filtered));
  }
}

// ============================================================================
// Badges Service
// ============================================================================

export class BadgesService {
  private static BADGES_KEY = 'gamification_badges';
  private static USER_BADGES_KEY = 'gamification_user_badges';

  static async getBadges(): Promise<Badge[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(this.BADGES_KEY);
    return data ? JSON.parse(data) : [];
  }

  static async getBadgeById(badgeId: string): Promise<Badge> {
    // TODO: Replace with actual API call
    const badges = await this.getBadges();
    const badge = badges.find((b) => b.badgeId === badgeId);
    if (!badge) throw new Error('Badge not found');
    return badge;
  }

  static async createBadge(badge: Badge): Promise<Badge> {
    // TODO: Replace with actual API call
    const badges = await this.getBadges();
    const newBadge = {
      ...badge,
      audit: {
        createdAt: new Date(),
        createdBy: 'current-user',
        updatedAt: new Date(),
        updatedBy: 'current-user',
      },
    };
    badges.push(newBadge);
    localStorage.setItem(this.BADGES_KEY, JSON.stringify(badges));
    return newBadge;
  }

  static async updateBadge(badgeId: string, updates: Partial<Badge>): Promise<Badge> {
    // TODO: Replace with actual API call
    const badges = await this.getBadges();
    const index = badges.findIndex((b) => b.badgeId === badgeId);
    if (index === -1) throw new Error('Badge not found');

    const updated = {
      ...badges[index],
      ...updates,
      audit: {
        ...badges[index].audit,
        updatedAt: new Date(),
        updatedBy: 'current-user',
      },
    };
    badges[index] = updated;
    localStorage.setItem(this.BADGES_KEY, JSON.stringify(badges));
    return updated;
  }

  static async deleteBadge(badgeId: string): Promise<void> {
    // TODO: Replace with actual API call
    const badges = await this.getBadges();
    const filtered = badges.filter((b) => b.badgeId !== badgeId);
    localStorage.setItem(this.BADGES_KEY, JSON.stringify(filtered));
  }

  // User Badges
  static async getUserBadges(userId?: string): Promise<UserBadge[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(this.USER_BADGES_KEY);
    const userBadges: UserBadge[] = data ? JSON.parse(data) : [];

    if (userId) {
      return userBadges.filter((ub) => ub.userId === userId);
    }
    return userBadges;
  }

  static async awardBadge(
    userId: string,
    userName: string,
    badgeId: string,
    reason?: string
  ): Promise<UserBadge> {
    // TODO: Replace with actual API call
    const badge = await this.getBadgeById(badgeId);

    const userBadge: UserBadge = {
      userBadgeId: `ub-${Date.now()}`,
      userId,
      userName,
      badgeId,
      badge,
      awardedDate: new Date(),
      reason,
      status: 'active',
      isPinned: false,
      displayOnProfile: true,
      shareOnFeed: true,
      earnCount: 1,
      firstEarned: new Date(),
      audit: {
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system',
      },
    };

    const userBadges = await this.getUserBadges();
    userBadges.push(userBadge);
    localStorage.setItem(this.USER_BADGES_KEY, JSON.stringify(userBadges));

    // Update badge statistics
    const badges = await this.getBadges();
    const badgeIndex = badges.findIndex((b) => b.badgeId === badgeId);
    if (badgeIndex >= 0) {
      badges[badgeIndex].totalAwarded++;
      localStorage.setItem(this.BADGES_KEY, JSON.stringify(badges));
    }

    // Award points if applicable
    if (badge.pointsAwarded > 0) {
      await PointsService.awardPoints(
        userId,
        badge.pointsAwarded,
        'recognition',
        'badge_earned',
        `Earned badge: ${badge.badgeName}`
      );
    }

    return userBadge;
  }

  static async revokeBadge(userBadgeId: string, reason: string): Promise<UserBadge> {
    // TODO: Replace with actual API call
    const userBadges = await this.getUserBadges();
    const index = userBadges.findIndex((ub) => ub.userBadgeId === userBadgeId);
    if (index === -1) throw new Error('User badge not found');

    userBadges[index].status = 'revoked';
    userBadges[index].revokedDate = new Date();
    userBadges[index].revokedReason = reason;
    localStorage.setItem(this.USER_BADGES_KEY, JSON.stringify(userBadges));

    return userBadges[index];
  }
}

// ============================================================================
// Challenges Service
// ============================================================================

export class ChallengesService {
  private static CHALLENGES_KEY = 'gamification_challenges';
  private static PARTICIPATION_KEY = 'gamification_challenge_participation';

  static async getChallenges(): Promise<Challenge[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(this.CHALLENGES_KEY);
    return data ? JSON.parse(data) : [];
  }

  static async getChallengeById(challengeId: string): Promise<Challenge> {
    // TODO: Replace with actual API call
    const challenges = await this.getChallenges();
    const challenge = challenges.find((c) => c.challengeId === challengeId);
    if (!challenge) throw new Error('Challenge not found');
    return challenge;
  }

  static async createChallenge(challenge: Challenge): Promise<Challenge> {
    // TODO: Replace with actual API call
    const challenges = await this.getChallenges();
    const newChallenge = {
      ...challenge,
      audit: {
        createdAt: new Date(),
        createdBy: 'current-user',
        updatedAt: new Date(),
        updatedBy: 'current-user',
      },
    };
    challenges.push(newChallenge);
    localStorage.setItem(this.CHALLENGES_KEY, JSON.stringify(challenges));
    return newChallenge;
  }

  static async updateChallenge(challengeId: string, updates: Partial<Challenge>): Promise<Challenge> {
    // TODO: Replace with actual API call
    const challenges = await this.getChallenges();
    const index = challenges.findIndex((c) => c.challengeId === challengeId);
    if (index === -1) throw new Error('Challenge not found');

    const updated = {
      ...challenges[index],
      ...updates,
      audit: {
        ...challenges[index].audit,
        updatedAt: new Date(),
        updatedBy: 'current-user',
      },
    };
    challenges[index] = updated;
    localStorage.setItem(this.CHALLENGES_KEY, JSON.stringify(challenges));
    return updated;
  }

  static async deleteChallenge(challengeId: string): Promise<void> {
    // TODO: Replace with actual API call
    const challenges = await this.getChallenges();
    const filtered = challenges.filter((c) => c.challengeId !== challengeId);
    localStorage.setItem(this.CHALLENGES_KEY, JSON.stringify(filtered));
  }

  // Challenge Participation
  static async getParticipation(challengeId?: string, userId?: string): Promise<ChallengeParticipation[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(this.PARTICIPATION_KEY);
    let participations: ChallengeParticipation[] = data ? JSON.parse(data) : [];

    if (challengeId) {
      participations = participations.filter((p) => p.challengeId === challengeId);
    }
    if (userId) {
      participations = participations.filter((p) => p.userId === userId);
    }
    return participations;
  }

  static async joinChallenge(userId: string, userName: string, challengeId: string): Promise<ChallengeParticipation> {
    // TODO: Replace with actual API call
    const challenge = await this.getChallengeById(challengeId);

    const participation: ChallengeParticipation = {
      participationId: `part-${Date.now()}`,
      challengeId,
      challenge,
      userId,
      userName,
      registrationDate: new Date(),
      status: 'active',
      currentValue: 0,
      targetValue: challenge.targetValue,
      progress: 0,
      milestonesAchieved: [],
      lastActivityDate: new Date(),
      totalActivities: 0,
      activities: [],
      isCompleted: false,
      isWinner: false,
      currentStreak: 0,
      longestStreak: 0,
      audit: {
        createdAt: new Date(),
        createdBy: userId,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    };

    const participations = await this.getParticipation();
    participations.push(participation);
    localStorage.setItem(this.PARTICIPATION_KEY, JSON.stringify(participations));

    // Update challenge statistics
    const challenges = await this.getChallenges();
    const challengeIndex = challenges.findIndex((c) => c.challengeId === challengeId);
    if (challengeIndex >= 0) {
      challenges[challengeIndex].totalParticipants++;
      challenges[challengeIndex].activeParticipants++;
      localStorage.setItem(this.CHALLENGES_KEY, JSON.stringify(challenges));
    }

    return participation;
  }

  static async updateProgress(
    participationId: string,
    value: number,
    activityType: string
  ): Promise<ChallengeParticipation> {
    // TODO: Replace with actual API call
    const participations = await this.getParticipation();
    const index = participations.findIndex((p) => p.participationId === participationId);
    if (index === -1) throw new Error('Participation not found');

    const participation = participations[index];
    participation.currentValue += value;
    participation.progress = (participation.currentValue / participation.targetValue) * 100;
    participation.lastActivityDate = new Date();
    participation.totalActivities++;

    // Add activity
    participation.activities.push({
      activityId: `activity-${Date.now()}`,
      activityDate: new Date(),
      activityType,
      value,
      isVerified: true,
    });

    // Check for completion
    if (participation.currentValue >= participation.targetValue && !participation.isCompleted) {
      participation.isCompleted = true;
      participation.completionDate = new Date();
      participation.status = 'completed';

      // Award points
      await PointsService.awardPoints(
        participation.userId,
        participation.challenge.pointsReward,
        participation.challenge.category,
        'challenge_completed',
        `Completed challenge: ${participation.challenge.challengeName}`
      );

      // Award badges if applicable
      for (const badgeId of participation.challenge.badgeRewards) {
        await BadgesService.awardBadge(
          participation.userId,
          participation.userName,
          badgeId,
          `Completed challenge: ${participation.challenge.challengeName}`
        );
      }
    }

    localStorage.setItem(this.PARTICIPATION_KEY, JSON.stringify(participations));
    return participation;
  }
}

// ============================================================================
// Leaderboards Service
// ============================================================================

export class LeaderboardsService {
  private static LEADERBOARDS_KEY = 'gamification_leaderboards';

  static async getLeaderboards(): Promise<Leaderboard[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(this.LEADERBOARDS_KEY);
    return data ? JSON.parse(data) : [];
  }

  static async getLeaderboardById(leaderboardId: string): Promise<Leaderboard> {
    // TODO: Replace with actual API call
    const leaderboards = await this.getLeaderboards();
    const leaderboard = leaderboards.find((l) => l.leaderboardId === leaderboardId);
    if (!leaderboard) throw new Error('Leaderboard not found');
    return leaderboard;
  }

  static async createLeaderboard(leaderboard: Leaderboard): Promise<Leaderboard> {
    // TODO: Replace with actual API call
    const leaderboards = await this.getLeaderboards();
    const newLeaderboard = {
      ...leaderboard,
      audit: {
        createdAt: new Date(),
        createdBy: 'current-user',
        updatedAt: new Date(),
        updatedBy: 'current-user',
      },
    };
    leaderboards.push(newLeaderboard);
    localStorage.setItem(this.LEADERBOARDS_KEY, JSON.stringify(leaderboards));
    return newLeaderboard;
  }

  static async updateRankings(leaderboardId: string): Promise<Leaderboard> {
    // TODO: Replace with actual API call
    const leaderboard = await this.getLeaderboardById(leaderboardId);

    // Get all points accounts and calculate rankings
    const accounts = await PointsService.getAllAccounts();

    const rankings: LeaderboardEntry[] = accounts
      .map((account, index) => ({
        rank: index + 1,
        userId: account.userId,
        userName: account.userName,
        department: account.department,
        score: account.totalPoints,
        scoreChange: 0,
        badges: 0,
        challenges: 0,
      }))
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({ ...entry, rank: index + 1 }))
      .slice(0, leaderboard.displayLimit);

    leaderboard.rankings = rankings;
    leaderboard.lastUpdated = new Date();

    const leaderboards = await this.getLeaderboards();
    const index = leaderboards.findIndex((l) => l.leaderboardId === leaderboardId);
    if (index >= 0) {
      leaderboards[index] = leaderboard;
      localStorage.setItem(this.LEADERBOARDS_KEY, JSON.stringify(leaderboards));
    }

    return leaderboard;
  }
}

// ============================================================================
// Levels Service
// ============================================================================

export class LevelsService {
  private static LEVELS_KEY = 'gamification_levels';
  private static USER_LEVELS_KEY = 'gamification_user_levels';

  static async getLevelDefinitions(): Promise<LevelDefinition[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(this.LEVELS_KEY);
    return data ? JSON.parse(data) : [];
  }

  static async getUserLevel(userId: string): Promise<UserLevel> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(this.USER_LEVELS_KEY);
    const userLevels: UserLevel[] = data ? JSON.parse(data) : [];

    const userLevel = userLevels.find((ul) => ul.userId === userId);
    if (!userLevel) throw new Error('User level not found');
    return userLevel;
  }

  static async calculateLevel(userId: string): Promise<UserLevel> {
    // TODO: Replace with actual API call
    const account = await PointsService.getAccount(userId);
    const levels = await this.getLevelDefinitions();

    // Find appropriate level based on points
    let currentLevel = levels[0];
    for (const level of levels) {
      if (account.totalPoints >= level.pointsRequired) {
        currentLevel = level;
      } else {
        break;
      }
    }

    const nextLevel = levels.find((l) => l.level === currentLevel.level + 1);
    const pointsToNext = nextLevel ? nextLevel.pointsRequired - account.totalPoints : 0;

    const userLevel: UserLevel = {
      userId,
      userName: account.userName,
      currentLevel: currentLevel.level,
      currentTier: currentLevel.tier,
      levelDefinition: currentLevel,
      totalPoints: account.totalPoints,
      pointsInCurrentLevel: account.totalPoints - currentLevel.pointsRequired,
      pointsToNextLevel: pointsToNext,
      levelProgress: nextLevel
        ? ((account.totalPoints - currentLevel.pointsRequired) / (nextLevel.pointsRequired - currentLevel.pointsRequired)) * 100
        : 100,
      levelHistory: [],
      tierHistory: [],
      highestLevelAchieved: currentLevel.level,
      highestTierAchieved: currentLevel.tier,
      averagePointsPerDay: 0,
      audit: {
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system',
      },
    };

    return userLevel;
  }
}

// ============================================================================
// Missions Service
// ============================================================================

export class MissionsService {
  private static MISSIONS_KEY = 'gamification_missions';
  private static USER_MISSIONS_KEY = 'gamification_user_missions';

  static async getMissions(): Promise<Mission[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(this.MISSIONS_KEY);
    return data ? JSON.parse(data) : [];
  }

  static async getMissionById(missionId: string): Promise<Mission> {
    // TODO: Replace with actual API call
    const missions = await this.getMissions();
    const mission = missions.find((m) => m.missionId === missionId);
    if (!mission) throw new Error('Mission not found');
    return mission;
  }

  static async createMission(mission: Mission): Promise<Mission> {
    // TODO: Replace with actual API call
    const missions = await this.getMissions();
    const newMission = {
      ...mission,
      audit: {
        createdAt: new Date(),
        createdBy: 'current-user',
        updatedAt: new Date(),
        updatedBy: 'current-user',
      },
    };
    missions.push(newMission);
    localStorage.setItem(this.MISSIONS_KEY, JSON.stringify(missions));
    return newMission;
  }

  static async getUserMissions(userId?: string): Promise<UserMission[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(this.USER_MISSIONS_KEY);
    const userMissions: UserMission[] = data ? JSON.parse(data) : [];

    if (userId) {
      return userMissions.filter((um) => um.userId === userId);
    }
    return userMissions;
  }

  static async startMission(userId: string, userName: string, missionId: string): Promise<UserMission> {
    // TODO: Replace with actual API call
    const mission = await this.getMissionById(missionId);

    const userMission: UserMission = {
      userMissionId: `um-${Date.now()}`,
      userId,
      userName,
      missionId,
      mission,
      status: 'active',
      startDate: new Date(),
      totalTasks: mission.totalTasks,
      completedTasks: 0,
      progress: 0,
      taskProgress: mission.tasks.map((task) => ({
        taskId: task.taskId,
        taskName: task.taskName,
        status: 'pending',
        currentValue: 0,
        targetValue: task.targetCount || 1,
        progress: 0,
      })),
      pointsEarned: 0,
      bonusPointsEarned: 0,
      timeSpent: 0,
      completedWithinTime: false,
      attemptNumber: 1,
      audit: {
        createdAt: new Date(),
        createdBy: userId,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    };

    const userMissions = await this.getUserMissions();
    userMissions.push(userMission);
    localStorage.setItem(this.USER_MISSIONS_KEY, JSON.stringify(userMissions));

    return userMission;
  }

  static async completeMissionTask(userMissionId: string, taskId: string): Promise<UserMission> {
    // TODO: Replace with actual API call
    const userMissions = await this.getUserMissions();
    const index = userMissions.findIndex((um) => um.userMissionId === userMissionId);
    if (index === -1) throw new Error('User mission not found');

    const userMission = userMissions[index];
    const taskProgress = userMission.taskProgress.find((tp) => tp.taskId === taskId);

    if (taskProgress && taskProgress.status !== 'completed') {
      taskProgress.status = 'completed';
      taskProgress.currentValue = taskProgress.targetValue;
      taskProgress.progress = 100;
      taskProgress.completedDate = new Date();

      userMission.completedTasks++;
      userMission.progress = (userMission.completedTasks / userMission.totalTasks) * 100;

      // Check for mission completion
      if (userMission.completedTasks === userMission.totalTasks) {
        userMission.status = 'completed';
        userMission.completionDate = new Date();

        // Award points
        await PointsService.awardPoints(
          userMission.userId,
          userMission.mission.pointsReward,
          userMission.mission.category,
          'mission_completed',
          `Completed mission: ${userMission.mission.missionName}`
        );
      }
    }

    localStorage.setItem(this.USER_MISSIONS_KEY, JSON.stringify(userMissions));
    return userMission;
  }
}

// ============================================================================
// Virtual Currency Service
// ============================================================================

export class VirtualCurrencyService {
  private static CURRENCIES_KEY = 'gamification_currencies';
  private static ACCOUNTS_KEY = 'gamification_currency_accounts';
  private static TRANSACTIONS_KEY = 'gamification_currency_transactions';

  static async getCurrencies(): Promise<VirtualCurrency[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(this.CURRENCIES_KEY);
    return data ? JSON.parse(data) : [];
  }

  static async getCurrencyAccount(userId: string, currencyId: string): Promise<CurrencyAccount> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(this.ACCOUNTS_KEY);
    const accounts: CurrencyAccount[] = data ? JSON.parse(data) : [];

    const account = accounts.find((a) => a.userId === userId && a.currencyId === currencyId);
    if (!account) throw new Error('Currency account not found');
    return account;
  }

  static async convertPointsToCurrency(
    userId: string,
    currencyId: string,
    points: number
  ): Promise<CurrencyTransaction> {
    // TODO: Replace with actual API call
    const currency = (await this.getCurrencies()).find((c) => c.currencyId === currencyId);
    if (!currency) throw new Error('Currency not found');

    const currencyAmount = points * currency.conversionRate;

    // Deduct points
    await PointsService.redeemPoints(userId, points, `Converted to ${currency.currencyName}`);

    // Add currency
    const account = await this.getCurrencyAccount(userId, currencyId);
    account.currentBalance += currencyAmount;
    account.lifetimeEarned += currencyAmount;

    const transaction: CurrencyTransaction = {
      transactionId: `curr-trans-${Date.now()}`,
      accountId: account.accountId,
      userId,
      currencyId,
      transactionDate: new Date(),
      transactionType: 'conversion',
      amount: currencyAmount,
      balanceAfter: account.currentBalance,
      source: 'points_conversion',
      description: `Converted ${points} points to ${currencyAmount} ${currency.symbol}`,
      convertedFrom: {
        currency: 'points',
        amount: points,
        rate: currency.conversionRate,
      },
      audit: {
        createdAt: new Date(),
        createdBy: userId,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    };

    const transactions = await this.getTransactions();
    transactions.push(transaction);
    localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(transactions));

    return transaction;
  }

  private static async getTransactions(): Promise<CurrencyTransaction[]> {
    const data = localStorage.getItem(this.TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  }
}

// ============================================================================
// Achievement Wall Service
// ============================================================================

export class AchievementWallService {
  private static ACHIEVEMENTS_KEY = 'gamification_achievements';

  static async getAchievements(userId?: string): Promise<Achievement[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(this.ACHIEVEMENTS_KEY);
    let achievements: Achievement[] = data ? JSON.parse(data) : [];

    if (userId) {
      achievements = achievements.filter((a) => a.userId === userId || a.isPublic);
    } else {
      achievements = achievements.filter((a) => a.isPublic);
    }

    return achievements.sort((a, b) => b.achievementDate.getTime() - a.achievementDate.getTime());
  }

  static async createAchievement(achievement: Achievement): Promise<Achievement> {
    // TODO: Replace with actual API call
    const achievements = await this.getAchievements();
    const newAchievement = {
      ...achievement,
      audit: {
        createdAt: new Date(),
        createdBy: achievement.userId,
        updatedAt: new Date(),
        updatedBy: achievement.userId,
      },
    };
    achievements.push(newAchievement);
    localStorage.setItem(this.ACHIEVEMENTS_KEY, JSON.stringify(achievements));
    return newAchievement;
  }

  static async likeAchievement(achievementId: string, userId: string): Promise<Achievement> {
    // TODO: Replace with actual API call
    const achievements = await this.getAchievements();
    const index = achievements.findIndex((a) => a.achievementId === achievementId);
    if (index === -1) throw new Error('Achievement not found');

    achievements[index].likes++;
    if (!achievements[index].celebratedBy.includes(userId)) {
      achievements[index].celebratedBy.push(userId);
    }

    localStorage.setItem(this.ACHIEVEMENTS_KEY, JSON.stringify(achievements));
    return achievements[index];
  }
}

// ============================================================================
// Analytics Service
// ============================================================================

export class GamificationAnalyticsService {
  static async getAnalytics(period: string): Promise<GamificationAnalytics> {
    // TODO: Replace with actual API call
    const accounts = await PointsService.getAllAccounts();
    const transactions = await PointsService.getTransactions();
    const badges = await BadgesService.getUserBadges();
    const challenges = await ChallengesService.getChallenges();

    return {
      period: period as any,
      periodStart: new Date(new Date().setDate(1)),
      periodEnd: new Date(),
      totalActiveUsers: accounts.length,
      newUsers: 0,
      engagementRate: 75,
      totalPointsAwarded: transactions.reduce((sum, t) => sum + (t.transactionType === 'earn' ? t.pointsAmount : 0), 0),
      totalPointsRedeemed: transactions.reduce((sum, t) => sum + (t.transactionType === 'redeem' ? Math.abs(t.pointsAmount) : 0), 0),
      averagePointsPerUser: accounts.reduce((sum, a) => sum + a.totalPoints, 0) / accounts.length || 0,
      topPointEarners: [],
      totalBadgesAwarded: badges.length,
      uniqueBadgesAwarded: new Set(badges.map((b) => b.badgeId)).size,
      topBadges: [],
      activeChallenges: challenges.filter((c) => c.status === 'active').length,
      challengeParticipationRate: 0,
      challengeCompletionRate: 0,
      topChallenges: [],
      missionsCompleted: 0,
      missionCompletionRate: 0,
      averageMissionsPerUser: 0,
      levelDistribution: [],
      averageLevel: 0,
      leaderboardViews: 0,
      leaderboardEngagement: 0,
      pointsTrend: [],
      engagementTrend: [],
    };
  }
}

// ============================================================================
// Settings Service
// ============================================================================

export class GamificationSettingsService {
  private static SETTINGS_KEY = 'gamification_settings';

  static async getSettings(): Promise<GamificationSettings> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(this.SETTINGS_KEY);
    if (data) return JSON.parse(data);

    return this.getDefaultSettings();
  }

  static async updateSettings(updates: Partial<GamificationSettings>): Promise<GamificationSettings> {
    // TODO: Replace with actual API call
    const settings = await this.getSettings();
    const updated = {
      ...settings,
      ...updates,
      audit: {
        ...settings.audit,
        updatedAt: new Date(),
        updatedBy: 'current-user',
      },
    };
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  }

  private static getDefaultSettings(): GamificationSettings {
    return {
      settingsId: 'default-settings',
      pointsEnabled: true,
      pointsExpirationEnabled: false,
      defaultExpirationDays: 365,
      pointsTransferEnabled: false,
      manualAwardsRequireApproval: true,
      badgesEnabled: true,
      badgeNominationsEnabled: true,
      badgeRevocationEnabled: false,
      challengesEnabled: true,
      teamChallengesEnabled: true,
      challengeCreationOpen: false,
      leaderboardsEnabled: true,
      leaderboardsPublic: true,
      realTimeUpdates: true,
      anonymousLeaderboard: false,
      levelsEnabled: true,
      maxLevel: 100,
      levelDowngradeEnabled: false,
      missionsEnabled: true,
      dailyMissionsEnabled: true,
      questChainsEnabled: true,
      virtualCurrencyEnabled: true,
      currencyConversionEnabled: true,
      achievementWallEnabled: true,
      achievementCommentsEnabled: true,
      achievementLikesEnabled: true,
      notifyOnBadgeEarned: true,
      notifyOnLevelUp: true,
      notifyOnChallengeComplete: true,
      notifyOnLeaderboardRank: true,
      audit: {
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system',
      },
    };
  }
}
