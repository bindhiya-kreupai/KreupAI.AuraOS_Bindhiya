// Employee Recognition & Rewards Services - API Integrated
import { APIClient } from '@/lib/api-client';
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

export class RecognitionService {
  private static endpoint = '/recognition';

  static async getRecognitions(filters?: { senderId?: string; recipientId?: string; status?: string; programId?: string }): Promise<Recognition[]> {
    try {
      const response = await APIClient.get<{ recognitions?: Recognition[] }>(this.endpoint, filters);
      return response.recognitions || [];
    } catch (error) {
            return [];
    }
  }

  static async getRecognitionById(id: string): Promise<Recognition | null> {
    try {
      const response = await APIClient.get<{ recognition?: Recognition }>(`${this.endpoint}/${id}`);
      return response.recognition || null;
    } catch (error) {
            return null;
    }
  }

  static async createRecognition(recognition: Recognition): Promise<Recognition> {
    const response = await APIClient.post<{ recognition: Recognition }>(this.endpoint, recognition);
    return response.recognition;
  }

  static async updateRecognition(id: string, updates: Partial<Recognition>): Promise<Recognition> {
    const response = await APIClient.put<{ recognition: Recognition }>(`${this.endpoint}/${id}`, updates);
    return response.recognition;
  }

  static async deleteRecognition(id: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${id}`);
  }

  static async approveRecognition(id: string, approverId: string, approverName: string): Promise<Recognition> {
    const response = await APIClient.post<{ recognition: Recognition }>(`${this.endpoint}/${id}/approve`, { approverId, approverName });
    return response.recognition;
  }

  static async declineRecognition(id: string, reason: string): Promise<Recognition> {
    const response = await APIClient.post<{ recognition: Recognition }>(`${this.endpoint}/${id}/decline`, { reason });
    return response.recognition;
  }

  static async publishRecognition(id: string): Promise<Recognition> {
    const response = await APIClient.post<{ recognition: Recognition }>(`${this.endpoint}/${id}/publish`);
    return response.recognition;
  }

  static async addReaction(recognitionId: string, reaction: any): Promise<Recognition> {
    const response = await APIClient.post<{ recognition: Recognition }>(`${this.endpoint}/${recognitionId}/reactions`, reaction);
    return response.recognition;
  }

  static async addComment(recognitionId: string, comment: any): Promise<Recognition> {
    const response = await APIClient.post<{ recognition: Recognition }>(`${this.endpoint}/${recognitionId}/comments`, comment);
    return response.recognition;
  }

  static async incrementViewCount(id: string): Promise<void> {
    try {
      await APIClient.post(`${this.endpoint}/${id}/view`);
    } catch (error) {
          }
  }
}

export class BadgeService {
  private static endpoint = '/recognition/badges';

  static async getBadges(filters?: { category?: string; level?: string; isActive?: boolean }): Promise<Badge[]> {
    try {
      const response = await APIClient.get<{ badges?: Badge[] }>(this.endpoint, filters);
      return response.badges || [];
    } catch (error) {
            return [];
    }
  }

  static async createBadge(badge: Badge): Promise<Badge> {
    const response = await APIClient.post<{ badge: Badge }>(this.endpoint, badge);
    return response.badge;
  }

  static async updateBadge(id: string, updates: Partial<Badge>): Promise<Badge> {
    const response = await APIClient.put<{ badge: Badge }>(`${this.endpoint}/${id}`, updates);
    return response.badge;
  }

  static async deleteBadge(id: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${id}`);
  }

  static async getEmployeeBadges(employeeId?: string): Promise<EmployeeBadge[]> {
    try {
      const response = await APIClient.get<{ employeeBadges?: EmployeeBadge[] }>(`${this.endpoint}/employee`, { employeeId });
      return response.employeeBadges || [];
    } catch (error) {
            return [];
    }
  }

  static async awardBadge(employeeId: string, employeeName: string, badgeId: string, awardedBy: string, awardedByName: string, recognitionId?: string): Promise<EmployeeBadge> {
    const response = await APIClient.post<{ employeeBadge: EmployeeBadge }>(`${this.endpoint}/award`, {
      employeeId,
      employeeName,
      badgeId,
      awardedBy,
      awardedByName,
      recognitionId
    });
    return response.employeeBadge;
  }

  static async toggleBadgeDisplay(employeeBadgeId: string): Promise<EmployeeBadge> {
    const response = await APIClient.post<{ employeeBadge: EmployeeBadge }>(`${this.endpoint}/employee/${employeeBadgeId}/toggle-display`);
    return response.employeeBadge;
  }
}

export class RedemptionService {
  private static endpoint = '/recognition/redemptions';

  static async getCatalogItems(filters?: { category?: string; isAvailable?: boolean }): Promise<RewardsCatalog[]> {
    try {
      const response = await APIClient.get<{ items?: RewardsCatalog[] }>('/recognition/catalog', filters);
      return response.items || [];
    } catch (error) {
            return [];
    }
  }

  static async createCatalogItem(item: RewardsCatalog): Promise<RewardsCatalog> {
    const response = await APIClient.post<{ item: RewardsCatalog }>('/recognition/catalog', item);
    return response.item;
  }

  static async updateCatalogItem(id: string, updates: Partial<RewardsCatalog>): Promise<RewardsCatalog> {
    const response = await APIClient.put<{ item: RewardsCatalog }>(`/recognition/catalog/${id}`, updates);
    return response.item;
  }

  static async deleteCatalogItem(id: string): Promise<void> {
    await APIClient.delete(`/recognition/catalog/${id}`);
  }

  static async getRedemptions(filters?: { employeeId?: string; status?: string }): Promise<Redemption[]> {
    try {
      const response = await APIClient.get<{ redemptions?: Redemption[] }>(this.endpoint, filters);
      return response.redemptions || [];
    } catch (error) {
            return [];
    }
  }

  static async createRedemption(redemption: Redemption): Promise<Redemption> {
    const response = await APIClient.post<{ redemption: Redemption }>(this.endpoint, redemption);
    return response.redemption;
  }

  static async updateRedemption(id: string, updates: Partial<Redemption>): Promise<Redemption> {
    const response = await APIClient.put<{ redemption: Redemption }>(`${this.endpoint}/${id}`, updates);
    return response.redemption;
  }

  static async cancelRedemption(id: string, cancelledBy: string, reason: string): Promise<Redemption> {
    const response = await APIClient.post<{ redemption: Redemption }>(`${this.endpoint}/${id}/cancel`, { cancelledBy, reason });
    return response.redemption;
  }

  static async processRedemption(id: string, processedBy: string): Promise<Redemption> {
    const response = await APIClient.post<{ redemption: Redemption }>(`${this.endpoint}/${id}/process`, { processedBy });
    return response.redemption;
  }

  static async shipRedemption(id: string, trackingNumber: string, estimatedDelivery: string): Promise<Redemption> {
    const response = await APIClient.post<{ redemption: Redemption }>(`${this.endpoint}/${id}/ship`, { trackingNumber, estimatedDelivery });
    return response.redemption;
  }

  static async deliverRedemption(id: string): Promise<Redemption> {
    const response = await APIClient.post<{ redemption: Redemption }>(`${this.endpoint}/${id}/deliver`);
    return response.redemption;
  }
}

export class PointsService {
  private static endpoint = '/recognition/points';

  static async getEmployeePoints(employeeId: string): Promise<EmployeePoints> {
    try {
      const response = await APIClient.get<{ employeePoints?: EmployeePoints }>(`${this.endpoint}/employee/${employeeId}`);
      return response.employeePoints || {
        employeeId,
        employeeName: '',
        currentBalance: 0,
        lifetimeEarned: 0,
        lifetimeRedeemed: 0,
        expiringSoon: 0,
        transactions: []
      };
    } catch (error) {
            throw error;
    }
  }

  static async addPoints(employeeId: string, employeeName: string, points: number, transactionType: any, sourceId: string, description: string): Promise<PointsTransaction> {
    const response = await APIClient.post<{ transaction: PointsTransaction }>(this.endpoint, {
      employeeId,
      employeeName,
      points,
      transactionType,
      sourceId,
      description
    });
    return response.transaction;
  }

  static async getAllEmployeePoints(): Promise<EmployeePoints[]> {
    try {
      const response = await APIClient.get<{ employeePoints?: EmployeePoints[] }>(`${this.endpoint}/all`);
      return response.employeePoints || [];
    } catch (error) {
            return [];
    }
  }

  static async getTransactions(employeeId?: string): Promise<PointsTransaction[]> {
    try {
      const response = await APIClient.get<{ transactions?: PointsTransaction[] }>(`${this.endpoint}/transactions`, { employeeId });
      return response.transactions || [];
    } catch (error) {
            return [];
    }
  }
}

export class RecognitionProgramService {
  private static endpoint = '/recognition/programs';

  static async getPrograms(filters?: { status?: string; isActive?: boolean }): Promise<RecognitionProgram[]> {
    try {
      const response = await APIClient.get<{ programs?: RecognitionProgram[] }>(this.endpoint, filters);
      return response.programs || [];
    } catch (error) {
            return [];
    }
  }

  static async createProgram(program: RecognitionProgram): Promise<RecognitionProgram> {
    const response = await APIClient.post<{ program: RecognitionProgram }>(this.endpoint, program);
    return response.program;
  }

  static async updateProgram(id: string, updates: Partial<RecognitionProgram>): Promise<RecognitionProgram> {
    const response = await APIClient.put<{ program: RecognitionProgram }>(`${this.endpoint}/${id}`, updates);
    return response.program;
  }

  static async deleteProgram(id: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${id}`);
  }

  static async activateProgram(id: string): Promise<RecognitionProgram> {
    const response = await APIClient.post<{ program: RecognitionProgram }>(`${this.endpoint}/${id}/activate`);
    return response.program;
  }

  static async pauseProgram(id: string): Promise<RecognitionProgram> {
    const response = await APIClient.post<{ program: RecognitionProgram }>(`${this.endpoint}/${id}/pause`);
    return response.program;
  }

  static async endProgram(id: string): Promise<RecognitionProgram> {
    const response = await APIClient.post<{ program: RecognitionProgram }>(`${this.endpoint}/${id}/end`);
    return response.program;
  }
}

export class RecognitionAnalyticsService {
  private static endpoint = '/recognition/analytics';

  static async getMetrics(): Promise<RecognitionMetrics> {
    try {
      const response = await APIClient.get<{ metrics?: RecognitionMetrics }>(this.endpoint);
      return response.metrics || {
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
    } catch (error) {
            throw error;
    }
  }

  static async getLeaderboard(type: string, period: string): Promise<RecognitionLeaderboard> {
    try {
      const response = await APIClient.get<{ leaderboard?: RecognitionLeaderboard }>(`${this.endpoint}/leaderboard`, { type, period });
      return response.leaderboard || {
        id: `lb-${Date.now()}`,
        leaderboardType: type as any,
        period: period as any,
        rankings: [],
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
            throw error;
    }
  }
}

export class RecognitionSettingsService {
  private static endpoint = '/recognition/settings';

  static async getSettings(): Promise<RecognitionSettings> {
    try {
      const response = await APIClient.get<{ settings?: RecognitionSettings }>(this.endpoint);
      return response.settings || {
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
    } catch (error) {
            throw error;
    }
  }

  static async updateSettings(updates: Partial<RecognitionSettings>): Promise<RecognitionSettings> {
    const response = await APIClient.put<{ settings: RecognitionSettings }>(this.endpoint, updates);
    return response.settings;
  }
}
