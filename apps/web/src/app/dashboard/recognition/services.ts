// Employee Recognition & Rewards Services
import type {
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
  RecognitionSettings
} from './types';

const STORAGE_KEYS = {
  RECOGNITIONS: 'recognitions',
  BADGES: 'badges',
  EMPLOYEE_BADGES: 'employee_badges',
  CATALOG: 'rewards_catalog',
  REDEMPTIONS: 'redemptions',
  POINTS: 'points_transactions',
  EMPLOYEE_POINTS: 'employee_points',
  PROGRAMS: 'recognition_programs',
  NOMINATIONS: 'nominations',
  AWARDS: 'awards',
  LEADERBOARDS: 'leaderboards',
  METRICS: 'recognition_metrics',
  SETTINGS: 'recognition_settings',
};

export class RecognitionService {
  static async getRecognitions(filters?: { senderId?: string; recipientId?: string; status?: string; programId?: string }): Promise<Recognition[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.RECOGNITIONS);
    let recognitions: Recognition[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.senderId) recognitions = recognitions.filter(r => r.senderId === filters.senderId);
      if (filters.recipientId) recognitions = recognitions.filter(r => r.recipientId === filters.recipientId);
      if (filters.status) recognitions = recognitions.filter(r => r.status === filters.status);
      if (filters.programId) recognitions = recognitions.filter(r => r.programId === filters.programId);
    }

    return recognitions;
  }

  static async getRecognitionById(id: string): Promise<Recognition | null> {
    const recognitions = await this.getRecognitions();
    return recognitions.find(r => r.id === id) || null;
  }

  static async createRecognition(recognition: Recognition): Promise<Recognition> {
    // TODO: Replace with actual API call
    const recognitions = await this.getRecognitions();
    recognitions.push(recognition);
    localStorage.setItem(STORAGE_KEYS.RECOGNITIONS, JSON.stringify(recognitions));

    // Award points to recipient
    if (recognition.totalPointsAwarded > 0) {
      await PointsService.addPoints(
        recognition.recipientId,
        recognition.recipientName,
        recognition.totalPointsAwarded,
        'recognition',
        recognition.id,
        `Recognition: ${recognition.title}`
      );
    }

    // Award badges if any
    for (const badgeId of recognition.badges) {
      await BadgeService.awardBadge(
        recognition.recipientId,
        recognition.recipientName,
        badgeId,
        recognition.senderId,
        recognition.senderName,
        recognition.id
      );
    }

    return recognition;
  }

  static async updateRecognition(id: string, updates: Partial<Recognition>): Promise<Recognition> {
    // TODO: Replace with actual API call
    const recognitions = await this.getRecognitions();
    const index = recognitions.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Recognition not found');

    recognitions[index] = { ...recognitions[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.RECOGNITIONS, JSON.stringify(recognitions));

    return recognitions[index];
  }

  static async deleteRecognition(id: string): Promise<void> {
    // TODO: Replace with actual API call
    const recognition = await this.getRecognitionById(id);
    if (!recognition) throw new Error('Recognition not found');

    if (recognition.status !== 'draft') {
      throw new Error('Only draft recognitions can be deleted');
    }

    const recognitions = await this.getRecognitions();
    const filtered = recognitions.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.RECOGNITIONS, JSON.stringify(filtered));
  }

  static async approveRecognition(id: string, approverId: string, approverName: string): Promise<Recognition> {
    const recognition = await this.getRecognitionById(id);
    if (!recognition) throw new Error('Recognition not found');

    const updated = await this.updateRecognition(id, {
      status: 'approved',
      approvedBy: approverId,
      approvedByName: approverName,
      approvedDate: new Date().toISOString(),
      isPublished: true,
      publishedDate: new Date().toISOString()
    });

    // Award points if not already awarded
    if (recognition.totalPointsAwarded > 0 && recognition.status === 'pending_approval') {
      await PointsService.addPoints(
        recognition.recipientId,
        recognition.recipientName,
        recognition.totalPointsAwarded,
        'recognition',
        recognition.id,
        `Recognition: ${recognition.title}`
      );
    }

    return updated;
  }

  static async declineRecognition(id: string, reason: string): Promise<Recognition> {
    return this.updateRecognition(id, {
      status: 'declined',
      declinedReason: reason
    });
  }

  static async publishRecognition(id: string): Promise<Recognition> {
    return this.updateRecognition(id, {
      isPublished: true,
      publishedDate: new Date().toISOString(),
      status: 'published'
    });
  }

  static async addReaction(recognitionId: string, reaction: any): Promise<Recognition> {
    const recognition = await this.getRecognitionById(recognitionId);
    if (!recognition) throw new Error('Recognition not found');

    // Remove existing reaction from same user if present
    recognition.reactions = recognition.reactions.filter(r => r.userId !== reaction.userId);
    recognition.reactions.push(reaction);

    return this.updateRecognition(recognitionId, { reactions: recognition.reactions });
  }

  static async addComment(recognitionId: string, comment: any): Promise<Recognition> {
    const recognition = await this.getRecognitionById(recognitionId);
    if (!recognition) throw new Error('Recognition not found');

    recognition.comments.push(comment);
    return this.updateRecognition(recognitionId, { comments: recognition.comments });
  }

  static async incrementViewCount(id: string): Promise<void> {
    const recognition = await this.getRecognitionById(id);
    if (recognition) {
      await this.updateRecognition(id, { viewCount: recognition.viewCount + 1 });
    }
  }
}

export class BadgeService {
  static async getBadges(filters?: { category?: string; level?: string; isActive?: boolean }): Promise<Badge[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.BADGES);
    let badges: Badge[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.category) badges = badges.filter(b => b.category === filters.category);
      if (filters.level) badges = badges.filter(b => b.level === filters.level);
      if (filters.isActive !== undefined) badges = badges.filter(b => b.isActive === filters.isActive);
    }

    return badges;
  }

  static async createBadge(badge: Badge): Promise<Badge> {
    // TODO: Replace with actual API call
    const badges = await this.getBadges();
    badges.push(badge);
    localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(badges));
    return badge;
  }

  static async updateBadge(id: string, updates: Partial<Badge>): Promise<Badge> {
    // TODO: Replace with actual API call
    const badges = await this.getBadges();
    const index = badges.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Badge not found');

    badges[index] = { ...badges[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(badges));
    return badges[index];
  }

  static async deleteBadge(id: string): Promise<void> {
    // TODO: Replace with actual API call
    const badges = await this.getBadges();
    const filtered = badges.filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(filtered));
  }

  static async getEmployeeBadges(employeeId?: string): Promise<EmployeeBadge[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEE_BADGES);
    let employeeBadges: EmployeeBadge[] = data ? JSON.parse(data) : [];

    if (employeeId) {
      employeeBadges = employeeBadges.filter(eb => eb.employeeId === employeeId);
    }

    return employeeBadges;
  }

  static async awardBadge(employeeId: string, employeeName: string, badgeId: string, awardedBy: string, awardedByName: string, recognitionId?: string): Promise<EmployeeBadge> {
    // TODO: Replace with actual API call
    const badge = (await this.getBadges()).find(b => b.id === badgeId);
    if (!badge) throw new Error('Badge not found');

    const employeeBadge: EmployeeBadge = {
      id: `eb-${Date.now()}`,
      employeeId,
      employeeName,
      badgeId,
      badgeName: badge.badgeName,
      badgeLevel: badge.level,
      awardedBy,
      awardedByName,
      awardedDate: new Date().toISOString(),
      recognitionId,
      displayOnProfile: true
    };

    const employeeBadges = await this.getEmployeeBadges();
    employeeBadges.push(employeeBadge);
    localStorage.setItem(STORAGE_KEYS.EMPLOYEE_BADGES, JSON.stringify(employeeBadges));

    // Update badge total awarded count
    await this.updateBadge(badgeId, { totalAwarded: badge.totalAwarded + 1 });

    return employeeBadge;
  }

  static async toggleBadgeDisplay(employeeBadgeId: string): Promise<EmployeeBadge> {
    // TODO: Replace with actual API call
    const employeeBadges = await this.getEmployeeBadges();
    const index = employeeBadges.findIndex(eb => eb.id === employeeBadgeId);
    if (index === -1) throw new Error('Employee badge not found');

    employeeBadges[index].displayOnProfile = !employeeBadges[index].displayOnProfile;
    localStorage.setItem(STORAGE_KEYS.EMPLOYEE_BADGES, JSON.stringify(employeeBadges));
    return employeeBadges[index];
  }
}

export class RedemptionService {
  static async getCatalogItems(filters?: { category?: string; isAvailable?: boolean }): Promise<RewardsCatalog[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.CATALOG);
    let items: RewardsCatalog[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.category) items = items.filter(i => i.category === filters.category);
      if (filters.isAvailable !== undefined) items = items.filter(i => i.isAvailable === filters.isAvailable);
    }

    return items;
  }

  static async createCatalogItem(item: RewardsCatalog): Promise<RewardsCatalog> {
    // TODO: Replace with actual API call
    const items = await this.getCatalogItems();
    items.push(item);
    localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(items));
    return item;
  }

  static async updateCatalogItem(id: string, updates: Partial<RewardsCatalog>): Promise<RewardsCatalog> {
    // TODO: Replace with actual API call
    const items = await this.getCatalogItems();
    const index = items.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Catalog item not found');

    items[index] = { ...items[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(items));
    return items[index];
  }

  static async deleteCatalogItem(id: string): Promise<void> {
    // TODO: Replace with actual API call
    const items = await this.getCatalogItems();
    const filtered = items.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(filtered));
  }

  static async getRedemptions(filters?: { employeeId?: string; status?: string }): Promise<Redemption[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.REDEMPTIONS);
    let redemptions: Redemption[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.employeeId) redemptions = redemptions.filter(r => r.employeeId === filters.employeeId);
      if (filters.status) redemptions = redemptions.filter(r => r.status === filters.status);
    }

    return redemptions;
  }

  static async createRedemption(redemption: Redemption): Promise<Redemption> {
    // TODO: Replace with actual API call

    // Check if employee has enough points
    const employeePoints = await PointsService.getEmployeePoints(redemption.employeeId);
    if (employeePoints.currentBalance < redemption.totalPointsCost) {
      throw new Error('Insufficient points balance');
    }

    // Check catalog item availability
    const catalogItem = (await this.getCatalogItems()).find(i => i.id === redemption.catalogItemId);
    if (!catalogItem || !catalogItem.isAvailable) {
      throw new Error('Catalog item is not available');
    }

    if (catalogItem.stockQuantity !== undefined && catalogItem.stockQuantity < redemption.quantity) {
      throw new Error('Insufficient stock');
    }

    const redemptions = await this.getRedemptions();
    redemptions.push(redemption);
    localStorage.setItem(STORAGE_KEYS.REDEMPTIONS, JSON.stringify(redemptions));

    // Deduct points
    await PointsService.addPoints(
      redemption.employeeId,
      redemption.employeeName,
      -redemption.totalPointsCost,
      'redeemed',
      redemption.id,
      `Redeemed: ${redemption.catalogItemName}`
    );

    // Update catalog stock
    if (catalogItem.stockQuantity !== undefined) {
      await this.updateCatalogItem(catalogItem.id, {
        stockQuantity: catalogItem.stockQuantity - redemption.quantity,
        totalRedeemed: catalogItem.totalRedeemed + redemption.quantity
      });
    }

    return redemption;
  }

  static async updateRedemption(id: string, updates: Partial<Redemption>): Promise<Redemption> {
    // TODO: Replace with actual API call
    const redemptions = await this.getRedemptions();
    const index = redemptions.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Redemption not found');

    redemptions[index] = { ...redemptions[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.REDEMPTIONS, JSON.stringify(redemptions));
    return redemptions[index];
  }

  static async cancelRedemption(id: string, cancelledBy: string, reason: string): Promise<Redemption> {
    const redemption = await this.getRedemptions().then(r => r.find(rd => rd.id === id));
    if (!redemption) throw new Error('Redemption not found');

    if (redemption.status !== 'pending' && redemption.status !== 'processing') {
      throw new Error('Can only cancel pending or processing redemptions');
    }

    // Refund points
    await PointsService.addPoints(
      redemption.employeeId,
      redemption.employeeName,
      redemption.totalPointsCost,
      'adjustment',
      redemption.id,
      `Refund: ${redemption.catalogItemName}`
    );

    return this.updateRedemption(id, {
      status: 'cancelled',
      cancelledBy,
      cancelledDate: new Date().toISOString(),
      cancellationReason: reason
    });
  }

  static async processRedemption(id: string, processedBy: string): Promise<Redemption> {
    return this.updateRedemption(id, {
      status: 'processing',
      processedBy,
      processedDate: new Date().toISOString()
    });
  }

  static async shipRedemption(id: string, trackingNumber: string, estimatedDelivery: string): Promise<Redemption> {
    return this.updateRedemption(id, {
      status: 'shipped',
      trackingNumber,
      estimatedDelivery
    });
  }

  static async deliverRedemption(id: string): Promise<Redemption> {
    return this.updateRedemption(id, {
      status: 'delivered',
      actualDelivery: new Date().toISOString()
    });
  }
}

export class PointsService {
  static async getEmployeePoints(employeeId: string): Promise<EmployeePoints> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEE_POINTS);
    const allPoints: EmployeePoints[] = data ? JSON.parse(data) : [];

    let employeePoints = allPoints.find(ep => ep.employeeId === employeeId);
    if (!employeePoints) {
      employeePoints = {
        employeeId,
        employeeName: '',
        currentBalance: 0,
        lifetimeEarned: 0,
        lifetimeRedeemed: 0,
        expiringSoon: 0,
        transactions: []
      };
      allPoints.push(employeePoints);
      localStorage.setItem(STORAGE_KEYS.EMPLOYEE_POINTS, JSON.stringify(allPoints));
    }

    return employeePoints;
  }

  static async addPoints(employeeId: string, employeeName: string, points: number, transactionType: any, sourceId: string, description: string): Promise<PointsTransaction> {
    // TODO: Replace with actual API call
    const employeePoints = await this.getEmployeePoints(employeeId);

    const transaction: PointsTransaction = {
      id: `pt-${Date.now()}`,
      transactionCode: `TXN-${Date.now()}`,
      employeeId,
      employeeName,
      transactionType,
      points,
      balance: employeePoints.currentBalance + points,
      source: description,
      recognitionId: transactionType === 'recognition' || transactionType === 'earned' ? sourceId : undefined,
      redemptionId: transactionType === 'redeemed' ? sourceId : undefined,
      description,
      createdDate: new Date().toISOString()
    };

    // Update employee points
    employeePoints.currentBalance += points;
    if (points > 0) {
      employeePoints.lifetimeEarned += points;
      employeePoints.lastEarned = transaction.createdDate;
    } else {
      employeePoints.lifetimeRedeemed += Math.abs(points);
      employeePoints.lastRedeemed = transaction.createdDate;
    }
    employeePoints.transactions.push(transaction);

    // Save transaction
    const data = localStorage.getItem(STORAGE_KEYS.POINTS);
    const transactions: PointsTransaction[] = data ? JSON.parse(data) : [];
    transactions.push(transaction);
    localStorage.setItem(STORAGE_KEYS.POINTS, JSON.stringify(transactions));

    // Save updated employee points
    const allPoints = await this.getAllEmployeePoints();
    const index = allPoints.findIndex(ep => ep.employeeId === employeeId);
    if (index !== -1) {
      allPoints[index] = employeePoints;
    } else {
      allPoints.push(employeePoints);
    }
    localStorage.setItem(STORAGE_KEYS.EMPLOYEE_POINTS, JSON.stringify(allPoints));

    return transaction;
  }

  static async getAllEmployeePoints(): Promise<EmployeePoints[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEE_POINTS);
    return data ? JSON.parse(data) : [];
  }

  static async getTransactions(employeeId?: string): Promise<PointsTransaction[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.POINTS);
    let transactions: PointsTransaction[] = data ? JSON.parse(data) : [];

    if (employeeId) {
      transactions = transactions.filter(t => t.employeeId === employeeId);
    }

    return transactions;
  }
}

export class RecognitionProgramService {
  static async getPrograms(filters?: { status?: string; isActive?: boolean }): Promise<RecognitionProgram[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.PROGRAMS);
    let programs: RecognitionProgram[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.status) programs = programs.filter(p => p.status === filters.status);
      if (filters.isActive !== undefined) programs = programs.filter(p => p.isActive === filters.isActive);
    }

    return programs;
  }

  static async createProgram(program: RecognitionProgram): Promise<RecognitionProgram> {
    // TODO: Replace with actual API call
    const programs = await this.getPrograms();
    programs.push(program);
    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));
    return program;
  }

  static async updateProgram(id: string, updates: Partial<RecognitionProgram>): Promise<RecognitionProgram> {
    // TODO: Replace with actual API call
    const programs = await this.getPrograms();
    const index = programs.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Program not found');

    programs[index] = { ...programs[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));
    return programs[index];
  }

  static async deleteProgram(id: string): Promise<void> {
    // TODO: Replace with actual API call
    const programs = await this.getPrograms();
    const filtered = programs.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(filtered));
  }

  static async activateProgram(id: string): Promise<RecognitionProgram> {
    return this.updateProgram(id, { status: 'active', isActive: true });
  }

  static async pauseProgram(id: string): Promise<RecognitionProgram> {
    return this.updateProgram(id, { status: 'paused', isActive: false });
  }

  static async endProgram(id: string): Promise<RecognitionProgram> {
    return this.updateProgram(id, { status: 'ended', isActive: false });
  }
}

export class RecognitionAnalyticsService {
  static async getMetrics(): Promise<RecognitionMetrics> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.METRICS);
    return data ? JSON.parse(data) : {
      totalRecognitions: 0,
      recognitionsThisMonth: 0,
      recognitionsThisQuarter: 0,
      recognitionsThisYear: 0,
      averageRecognitionsPerEmployee: 0,
      participationRate: 0,
      topRecipients: [],
      topSenders: [],
      recognitionsByCategory: [],
      recognitionsByType: [],
      recognitionsByDepartment: [],
      totalPointsAwarded: 0,
      totalPointsRedeemed: 0,
      totalBadgesAwarded: 0,
      uniqueBadgesAwarded: 0,
      redemptionRate: 0,
      averageRedemptionValue: 0,
      programParticipation: [],
      engagementScore: 0,
      sentimentScore: 0,
      trends: []
    };
  }

  static async getLeaderboard(type: string, period: string): Promise<RecognitionLeaderboard> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.LEADERBOARDS);
    const leaderboards: RecognitionLeaderboard[] = data ? JSON.parse(data) : [];

    return leaderboards.find(lb => lb.leaderboardType === type && lb.period === period) || {
      id: `lb-${Date.now()}`,
      leaderboardType: type as any,
      period: period as any,
      rankings: [],
      lastUpdated: new Date().toISOString()
    };
  }
}

export class RecognitionSettingsService {
  static async getSettings(): Promise<RecognitionSettings> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
      enableRecognition: true,
      enablePeerToPeer: true,
      enableManagerRecognition: true,
      enablePoints: true,
      enableBadges: true,
      enableRewards: true,
      requireApproval: false,
      approvalLevels: 1,
      defaultApprovers: [],
      allowAnonymous: false,
      enableComments: true,
      enableReactions: true,
      defaultVisibility: 'company',
      pointsPerRecognition: 100,
      maxPointsPerRecognition: 500,
      managerPointsMultiplier: 1.5,
      enablePointsExpiry: true,
      pointsExpiryMonths: 12,
      enableTiers: false,
      tiers: [],
      enableLeaderboards: true,
      publicLeaderboards: true,
      enableNominations: true,
      enableRedemption: true,
      minRedemptionPoints: 100,
      shippingEnabled: true,
      defaultCurrency: 'USD',
      fiscalYearStart: '01-01',
      enableNotifications: true,
      notifyOnRecognition: true,
      notifyOnBadge: true,
      notifyOnRedemption: true,
      enableMobileApp: true,
      enableIntegrations: false
    };
  }

  static async updateSettings(updates: Partial<RecognitionSettings>): Promise<RecognitionSettings> {
    // TODO: Replace with actual API call
    const settings = await this.getSettings();
    const updated = { ...settings, ...updates };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }
}
