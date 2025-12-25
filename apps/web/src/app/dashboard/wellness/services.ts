/**
 * Employee Wellness Module - Services
 * API-ready service layer for wellness operations
 */

import { APIClient } from '@/lib/api-client';
import type {
  HealthProgram,
  ProgramEnrollment,
  MentalHealthService,
  MentalHealthSession,
  HealthRiskAssessment,
  HRAResponse,
  WellnessChallenge,
  ChallengeParticipant,
  ChallengeTeam,
  WellnessPoints,
  PointsTransaction,
  RewardsRedemption,
  RewardsCatalog,
  GymMembership,
  GymProvider,
  WellnessMetrics,
  WellnessSettings,
} from './types';

// ============================================================================
// Health Programs Service
// ============================================================================

export class HealthProgramService {
  private static endpoint = '/wellness/programs';

  static async getPrograms(): Promise<HealthProgram[]> {
    try {
      return await APIClient.get<HealthProgram[]>(this.endpoint);
    } catch {
            throw error;
    }
  }

  static async getProgramById(id: string): Promise<HealthProgram | null> {
    try {
      return await APIClient.get<HealthProgram>(`${this.endpoint}/${id}`);
    } catch {
            return null;
    }
  }

  static async createProgram(data: HealthProgram): Promise<HealthProgram> {
    try {
      return await APIClient.post<HealthProgram>(this.endpoint, data);
    } catch {
            throw error;
    }
  }

  static async updateProgram(id: string, updates: Partial<HealthProgram>): Promise<HealthProgram> {
    try {
      return await APIClient.put<HealthProgram>(`${this.endpoint}/${id}`, updates);
    } catch {
            throw error;
    }
  }

  static async deleteProgram(id: string): Promise<void> {
    try {
      await APIClient.delete<void>(`${this.endpoint}/${id}`);
    } catch {
            throw error;
    }
  }

  static async enrollEmployee(
    programId: string,
    employeeId: string,
    employeeName: string
  ): Promise<ProgramEnrollment> {
    try {
      return await APIClient.post<ProgramEnrollment>(`${this.endpoint}/${programId}/enroll`, {
        employeeId,
        employeeName,
      });
    } catch {
            throw error;
    }
  }

  static async getEnrollments(programId?: string): Promise<ProgramEnrollment[]> {
    try {
      const params = programId ? { programId } : undefined;
      return await APIClient.get<ProgramEnrollment[]>(`${this.endpoint}/enrollments`, params);
    } catch {
            throw error;
    }
  }

  static async updateEnrollment(id: string, updates: Partial<ProgramEnrollment>): Promise<ProgramEnrollment> {
    try {
      return await APIClient.put<ProgramEnrollment>(`${this.endpoint}/enrollments/${id}`, updates);
    } catch {
            throw error;
    }
  }
}

// ============================================================================
// Mental Health Service
// ============================================================================

export class MentalHealthServiceLayer {
  private static endpoint = '/wellness/mental-health';

  static async getServices(): Promise<MentalHealthService[]> {
    try {
      return await APIClient.get<MentalHealthService[]>(this.endpoint);
    } catch {
            throw error;
    }
  }

  static async getServiceById(id: string): Promise<MentalHealthService | null> {
    try {
      return await APIClient.get<MentalHealthService>(`${this.endpoint}/${id}`);
    } catch {
            return null;
    }
  }

  static async createService(data: MentalHealthService): Promise<MentalHealthService> {
    try {
      return await APIClient.post<MentalHealthService>(this.endpoint, data);
    } catch {
            throw error;
    }
  }

  static async updateService(id: string, updates: Partial<MentalHealthService>): Promise<MentalHealthService> {
    try {
      return await APIClient.put<MentalHealthService>(`${this.endpoint}/${id}`, updates);
    } catch {
            throw error;
    }
  }

  static async getSessions(serviceId?: string): Promise<MentalHealthSession[]> {
    try {
      const params = serviceId ? { serviceId } : undefined;
      return await APIClient.get<MentalHealthSession[]>(`${this.endpoint}/sessions`, params);
    } catch {
            throw error;
    }
  }

  static async createSession(data: MentalHealthSession): Promise<MentalHealthSession> {
    try {
      return await APIClient.post<MentalHealthSession>(`${this.endpoint}/sessions`, data);
    } catch {
            throw error;
    }
  }

  static async updateSession(id: string, updates: Partial<MentalHealthSession>): Promise<MentalHealthSession> {
    try {
      return await APIClient.put<MentalHealthSession>(`${this.endpoint}/sessions/${id}`, updates);
    } catch {
            throw error;
    }
  }

  static async confirmAttendance(sessionId: string): Promise<void> {
    try {
      await APIClient.post<void>(`${this.endpoint}/sessions/${sessionId}/confirm-attendance`);
    } catch {
            throw error;
    }
  }
}

// ============================================================================
// HRA Service
// ============================================================================

export class HRAService {
  private static endpoint = '/wellness/hra';

  static async getAssessments(): Promise<HealthRiskAssessment[]> {
    try {
      return await APIClient.get<HealthRiskAssessment[]>(this.endpoint);
    } catch {
            throw error;
    }
  }

  static async getAssessmentById(id: string): Promise<HealthRiskAssessment | null> {
    try {
      return await APIClient.get<HealthRiskAssessment>(`${this.endpoint}/${id}`);
    } catch {
            return null;
    }
  }

  static async createAssessment(data: HealthRiskAssessment): Promise<HealthRiskAssessment> {
    try {
      return await APIClient.post<HealthRiskAssessment>(this.endpoint, data);
    } catch {
            throw error;
    }
  }

  static async updateAssessment(id: string, updates: Partial<HealthRiskAssessment>): Promise<HealthRiskAssessment> {
    try {
      return await APIClient.put<HealthRiskAssessment>(`${this.endpoint}/${id}`, updates);
    } catch {
            throw error;
    }
  }

  static async getResponses(hraId?: string): Promise<HRAResponse[]> {
    try {
      const params = hraId ? { hraId } : undefined;
      return await APIClient.get<HRAResponse[]>(`${this.endpoint}/responses`, params);
    } catch {
            throw error;
    }
  }

  static async submitResponse(data: HRAResponse): Promise<HRAResponse> {
    try {
      return await APIClient.post<HRAResponse>(`${this.endpoint}/responses`, data);
    } catch {
            throw error;
    }
  }

  static async updateResponse(id: string, updates: Partial<HRAResponse>): Promise<HRAResponse> {
    try {
      return await APIClient.put<HRAResponse>(`${this.endpoint}/responses/${id}`, updates);
    } catch {
            throw error;
    }
  }

  static async calculateRiskScore(responses: Record<string, any>, hra: HealthRiskAssessment): Promise<number> {
    try {
      return await APIClient.post<number>(`${this.endpoint}/calculate-risk`, { responses, hra });
    } catch {
            throw error;
    }
  }
}

// ============================================================================
// Wellness Challenges Service
// ============================================================================

export class ChallengeService {
  private static endpoint = '/wellness/challenges';

  static async getChallenges(): Promise<WellnessChallenge[]> {
    try {
      return await APIClient.get<WellnessChallenge[]>(this.endpoint);
    } catch {
            throw error;
    }
  }

  static async getChallengeById(id: string): Promise<WellnessChallenge | null> {
    try {
      return await APIClient.get<WellnessChallenge>(`${this.endpoint}/${id}`);
    } catch {
            return null;
    }
  }

  static async createChallenge(data: WellnessChallenge): Promise<WellnessChallenge> {
    try {
      return await APIClient.post<WellnessChallenge>(this.endpoint, data);
    } catch {
            throw error;
    }
  }

  static async updateChallenge(id: string, updates: Partial<WellnessChallenge>): Promise<WellnessChallenge> {
    try {
      return await APIClient.put<WellnessChallenge>(`${this.endpoint}/${id}`, updates);
    } catch {
            throw error;
    }
  }

  static async registerParticipant(
    challengeId: string,
    employeeId: string,
    employeeName: string,
    teamId?: string
  ): Promise<ChallengeParticipant> {
    try {
      return await APIClient.post<ChallengeParticipant>(`${this.endpoint}/${challengeId}/register`, {
        employeeId,
        employeeName,
        teamId,
      });
    } catch {
            throw error;
    }
  }

  static async getParticipants(challengeId?: string): Promise<ChallengeParticipant[]> {
    try {
      const params = challengeId ? { challengeId } : undefined;
      return await APIClient.get<ChallengeParticipant[]>(`${this.endpoint}/participants`, params);
    } catch {
            throw error;
    }
  }

  static async updateParticipant(id: string, updates: Partial<ChallengeParticipant>): Promise<ChallengeParticipant> {
    try {
      return await APIClient.put<ChallengeParticipant>(`${this.endpoint}/participants/${id}`, updates);
    } catch {
            throw error;
    }
  }

  static async createTeam(challengeId: string, data: ChallengeTeam): Promise<ChallengeTeam> {
    try {
      return await APIClient.post<ChallengeTeam>(`${this.endpoint}/${challengeId}/teams`, data);
    } catch {
            throw error;
    }
  }

  static async getTeams(challengeId?: string): Promise<ChallengeTeam[]> {
    try {
      const params = challengeId ? { challengeId } : undefined;
      return await APIClient.get<ChallengeTeam[]>(`${this.endpoint}/teams`, params);
    } catch {
            throw error;
    }
  }

  static async updateTeam(id: string, updates: Partial<ChallengeTeam>): Promise<ChallengeTeam> {
    try {
      return await APIClient.put<ChallengeTeam>(`${this.endpoint}/teams/${id}`, updates);
    } catch {
            throw error;
    }
  }

  static async logProgress(participantId: string, value: number, date: string, notes?: string): Promise<void> {
    try {
      await APIClient.post<void>(`${this.endpoint}/participants/${participantId}/progress`, {
        value,
        date,
        notes,
      });
    } catch {
            throw error;
    }
  }
}

// ============================================================================
// Wellness Points Service
// ============================================================================

export class WellnessPointsService {
  private static endpoint = '/wellness/points';

  static async getPoints(employeeId: string): Promise<WellnessPoints | null> {
    try {
      return await APIClient.get<WellnessPoints>(`${this.endpoint}/${employeeId}`);
    } catch {
            return null;
    }
  }

  static async initializePoints(employeeId: string, employeeName: string): Promise<WellnessPoints> {
    try {
      return await APIClient.post<WellnessPoints>(this.endpoint, {
        employeeId,
        employeeName,
      });
    } catch {
            throw error;
    }
  }

  static async awardPoints(
    employeeId: string,
    points: number,
    source: string,
    sourceId: string,
    description: string,
    expiryDate?: string
  ): Promise<PointsTransaction> {
    try {
      return await APIClient.post<PointsTransaction>(`${this.endpoint}/${employeeId}/award`, {
        points,
        source,
        sourceId,
        description,
        expiryDate,
      });
    } catch {
            throw error;
    }
  }

  static async getTransactions(employeeId?: string): Promise<PointsTransaction[]> {
    try {
      const params = employeeId ? { employeeId } : undefined;
      return await APIClient.get<PointsTransaction[]>(`${this.endpoint}/transactions`, params);
    } catch {
            throw error;
    }
  }

  static async redeemPoints(employeeId: string, points: number, rewardId: string, rewardName: string): Promise<void> {
    try {
      await APIClient.post<void>(`${this.endpoint}/${employeeId}/redeem`, {
        points,
        rewardId,
        rewardName,
      });
    } catch {
            throw error;
    }
  }
}

// ============================================================================
// Rewards Service
// ============================================================================

export class RewardsService {
  private static endpoint = '/wellness/rewards';

  static async getCatalog(): Promise<RewardsCatalog[]> {
    try {
      return await APIClient.get<RewardsCatalog[]>(this.endpoint);
    } catch {
            throw error;
    }
  }

  static async getRewardById(id: string): Promise<RewardsCatalog | null> {
    try {
      return await APIClient.get<RewardsCatalog>(`${this.endpoint}/${id}`);
    } catch {
            return null;
    }
  }

  static async createReward(data: RewardsCatalog): Promise<RewardsCatalog> {
    try {
      return await APIClient.post<RewardsCatalog>(this.endpoint, data);
    } catch {
            throw error;
    }
  }

  static async updateReward(id: string, updates: Partial<RewardsCatalog>): Promise<RewardsCatalog> {
    try {
      return await APIClient.put<RewardsCatalog>(`${this.endpoint}/${id}`, updates);
    } catch {
            throw error;
    }
  }

  static async redeemReward(
    employeeId: string,
    employeeName: string,
    rewardId: string
  ): Promise<RewardsRedemption> {
    try {
      return await APIClient.post<RewardsRedemption>(`${this.endpoint}/${rewardId}/redeem`, {
        employeeId,
        employeeName,
      });
    } catch {
            throw error;
    }
  }

  static async getRedemptions(employeeId?: string): Promise<RewardsRedemption[]> {
    try {
      const params = employeeId ? { employeeId } : undefined;
      return await APIClient.get<RewardsRedemption[]>(`${this.endpoint}/redemptions`, params);
    } catch {
            throw error;
    }
  }

  static async updateRedemption(id: string, updates: Partial<RewardsRedemption>): Promise<RewardsRedemption> {
    try {
      return await APIClient.put<RewardsRedemption>(`${this.endpoint}/redemptions/${id}`, updates);
    } catch {
            throw error;
    }
  }
}

// ============================================================================
// Gym Membership Service
// ============================================================================

export class GymMembershipService {
  private static endpoint = '/wellness/gym';

  static async getMemberships(): Promise<GymMembership[]> {
    try {
      return await APIClient.get<GymMembership[]>(this.endpoint);
    } catch {
            throw error;
    }
  }

  static async getMembershipById(id: string): Promise<GymMembership | null> {
    try {
      return await APIClient.get<GymMembership>(`${this.endpoint}/${id}`);
    } catch {
            return null;
    }
  }

  static async createMembership(data: GymMembership): Promise<GymMembership> {
    try {
      return await APIClient.post<GymMembership>(this.endpoint, data);
    } catch {
            throw error;
    }
  }

  static async updateMembership(id: string, updates: Partial<GymMembership>): Promise<GymMembership> {
    try {
      return await APIClient.put<GymMembership>(`${this.endpoint}/${id}`, updates);
    } catch {
            throw error;
    }
  }

  static async getProviders(): Promise<GymProvider[]> {
    try {
      return await APIClient.get<GymProvider[]>(`${this.endpoint}/providers`);
    } catch {
            throw error;
    }
  }

  static async getProviderById(id: string): Promise<GymProvider | null> {
    try {
      return await APIClient.get<GymProvider>(`${this.endpoint}/providers/${id}`);
    } catch {
            return null;
    }
  }

  static async createProvider(data: GymProvider): Promise<GymProvider> {
    try {
      return await APIClient.post<GymProvider>(`${this.endpoint}/providers`, data);
    } catch {
            throw error;
    }
  }

  static async updateProvider(id: string, updates: Partial<GymProvider>): Promise<GymProvider> {
    try {
      return await APIClient.put<GymProvider>(`${this.endpoint}/providers/${id}`, updates);
    } catch {
            throw error;
    }
  }

  static async logVisit(membershipId: string): Promise<void> {
    try {
      await APIClient.post<void>(`${this.endpoint}/${membershipId}/log-visit`);
    } catch {
            throw error;
    }
  }
}

// ============================================================================
// Analytics Service
// ============================================================================

export class WellnessAnalyticsService {
  private static endpoint = '/wellness/analytics';

  static async getMetrics(): Promise<WellnessMetrics> {
    try {
      return await APIClient.get<WellnessMetrics>(this.endpoint);
    } catch {
            throw error;
    }
  }
}

// ============================================================================
// Settings Service
// ============================================================================

export class WellnessSettingsService {
  private static endpoint = '/wellness/settings';

  static async getSettings(): Promise<WellnessSettings> {
    try {
      return await APIClient.get<WellnessSettings>(this.endpoint);
    } catch {
            throw error;
    }
  }

  static async updateSettings(updates: Partial<WellnessSettings>): Promise<WellnessSettings> {
    try {
      return await APIClient.put<WellnessSettings>(this.endpoint, updates);
    } catch {
            throw error;
    }
  }
}
