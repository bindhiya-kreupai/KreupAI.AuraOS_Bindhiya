/**
 * Employee Wellness Module - Services
 * API-ready service layer for wellness operations
 */

import {
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

// Storage keys
const STORAGE_KEYS = {
  PROGRAMS: 'wellness_programs',
  ENROLLMENTS: 'wellness_enrollments',
  MENTAL_SERVICES: 'wellness_mental_services',
  MENTAL_SESSIONS: 'wellness_mental_sessions',
  HRA: 'wellness_hra',
  HRA_RESPONSES: 'wellness_hra_responses',
  CHALLENGES: 'wellness_challenges',
  PARTICIPANTS: 'wellness_participants',
  TEAMS: 'wellness_teams',
  POINTS: 'wellness_points',
  TRANSACTIONS: 'wellness_transactions',
  REDEMPTIONS: 'wellness_redemptions',
  REWARDS_CATALOG: 'wellness_rewards_catalog',
  GYM_MEMBERSHIPS: 'wellness_gym_memberships',
  GYM_PROVIDERS: 'wellness_gym_providers',
  SETTINGS: 'wellness_settings',
};

// ============================================================================
// Health Programs Service
// ============================================================================

export class HealthProgramService {
  static async getPrograms(): Promise<HealthProgram[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.PROGRAMS);
    return stored ? JSON.parse(stored) : [];
  }

  static async getProgramById(id: string): Promise<HealthProgram | null> {
    const programs = await this.getPrograms();
    return programs.find((p) => p.id === id) || null;
  }

  static async createProgram(data: HealthProgram): Promise<HealthProgram> {
    const programs = await this.getPrograms();
    programs.push(data);
    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));
    return data;
  }

  static async updateProgram(id: string, updates: Partial<HealthProgram>): Promise<HealthProgram> {
    const programs = await this.getPrograms();
    const index = programs.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Program not found');
    programs[index] = { ...programs[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));
    return programs[index];
  }

  static async deleteProgram(id: string): Promise<void> {
    const programs = await this.getPrograms();
    const filtered = programs.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(filtered));
  }

  static async enrollEmployee(
    programId: string,
    employeeId: string,
    employeeName: string
  ): Promise<ProgramEnrollment> {
    const program = await this.getProgramById(programId);
    if (!program) throw new Error('Program not found');

    const enrollment: ProgramEnrollment = {
      id: `enroll-${Date.now()}`,
      programId,
      employeeId,
      employeeName,
      enrollmentDate: new Date().toISOString(),
      status: 'enrolled',
      progress: 0,
      pointsEarned: 0,
    };

    const enrollments = await this.getEnrollments();
    enrollments.push(enrollment);
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(enrollments));

    // Update program participant count
    await this.updateProgram(programId, {
      currentParticipants: program.currentParticipants + 1,
    });

    return enrollment;
  }

  static async getEnrollments(programId?: string): Promise<ProgramEnrollment[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.ENROLLMENTS);
    const enrollments = stored ? JSON.parse(stored) : [];
    return programId ? enrollments.filter((e: ProgramEnrollment) => e.programId === programId) : enrollments;
  }

  static async updateEnrollment(id: string, updates: Partial<ProgramEnrollment>): Promise<ProgramEnrollment> {
    const enrollments = await this.getEnrollments();
    const index = enrollments.findIndex((e) => e.id === id);
    if (index === -1) throw new Error('Enrollment not found');
    enrollments[index] = { ...enrollments[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(enrollments));
    return enrollments[index];
  }
}

// ============================================================================
// Mental Health Service
// ============================================================================

export class MentalHealthServiceLayer {
  static async getServices(): Promise<MentalHealthService[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.MENTAL_SERVICES);
    return stored ? JSON.parse(stored) : [];
  }

  static async getServiceById(id: string): Promise<MentalHealthService | null> {
    const services = await this.getServices();
    return services.find((s) => s.id === id) || null;
  }

  static async createService(data: MentalHealthService): Promise<MentalHealthService> {
    const services = await this.getServices();
    services.push(data);
    localStorage.setItem(STORAGE_KEYS.MENTAL_SERVICES, JSON.stringify(services));
    return data;
  }

  static async updateService(id: string, updates: Partial<MentalHealthService>): Promise<MentalHealthService> {
    const services = await this.getServices();
    const index = services.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Service not found');
    services[index] = { ...services[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.MENTAL_SERVICES, JSON.stringify(services));
    return services[index];
  }

  static async getSessions(serviceId?: string): Promise<MentalHealthSession[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.MENTAL_SESSIONS);
    const sessions = stored ? JSON.parse(stored) : [];
    return serviceId ? sessions.filter((s: MentalHealthSession) => s.serviceId === serviceId) : sessions;
  }

  static async createSession(data: MentalHealthSession): Promise<MentalHealthSession> {
    const sessions = await this.getSessions();
    sessions.push(data);
    localStorage.setItem(STORAGE_KEYS.MENTAL_SESSIONS, JSON.stringify(sessions));
    return data;
  }

  static async updateSession(id: string, updates: Partial<MentalHealthSession>): Promise<MentalHealthSession> {
    const sessions = await this.getSessions();
    const index = sessions.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Session not found');
    sessions[index] = { ...sessions[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.MENTAL_SESSIONS, JSON.stringify(sessions));
    return sessions[index];
  }

  static async confirmAttendance(sessionId: string): Promise<void> {
    await this.updateSession(sessionId, {
      attendanceConfirmed: true,
      status: 'completed',
    });
  }
}

// ============================================================================
// HRA Service
// ============================================================================

export class HRAService {
  static async getAssessments(): Promise<HealthRiskAssessment[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.HRA);
    return stored ? JSON.parse(stored) : [];
  }

  static async getAssessmentById(id: string): Promise<HealthRiskAssessment | null> {
    const assessments = await this.getAssessments();
    return assessments.find((a) => a.id === id) || null;
  }

  static async createAssessment(data: HealthRiskAssessment): Promise<HealthRiskAssessment> {
    const assessments = await this.getAssessments();
    assessments.push(data);
    localStorage.setItem(STORAGE_KEYS.HRA, JSON.stringify(assessments));
    return data;
  }

  static async updateAssessment(id: string, updates: Partial<HealthRiskAssessment>): Promise<HealthRiskAssessment> {
    const assessments = await this.getAssessments();
    const index = assessments.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Assessment not found');
    assessments[index] = { ...assessments[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.HRA, JSON.stringify(assessments));
    return assessments[index];
  }

  static async getResponses(hraId?: string): Promise<HRAResponse[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.HRA_RESPONSES);
    const responses = stored ? JSON.parse(stored) : [];
    return hraId ? responses.filter((r: HRAResponse) => r.hraId === hraId) : responses;
  }

  static async submitResponse(data: HRAResponse): Promise<HRAResponse> {
    const responses = await this.getResponses();
    responses.push(data);
    localStorage.setItem(STORAGE_KEYS.HRA_RESPONSES, JSON.stringify(responses));

    // Update HRA stats
    const hra = await this.getAssessmentById(data.hraId);
    if (hra) {
      await this.updateAssessment(data.hraId, {
        totalResponses: hra.totalResponses + 1,
      });
    }

    return data;
  }

  static async updateResponse(id: string, updates: Partial<HRAResponse>): Promise<HRAResponse> {
    const responses = await this.getResponses();
    const index = responses.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Response not found');
    responses[index] = { ...responses[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.HRA_RESPONSES, JSON.stringify(responses));
    return responses[index];
  }

  static async calculateRiskScore(responses: Record<string, any>, hra: HealthRiskAssessment): Promise<number> {
    // TODO: Implement actual risk scoring algorithm based on hra.scoringAlgorithm
    // This is a placeholder implementation
    return Math.floor(Math.random() * 100);
  }
}

// ============================================================================
// Wellness Challenges Service
// ============================================================================

export class ChallengeService {
  static async getChallenges(): Promise<WellnessChallenge[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.CHALLENGES);
    return stored ? JSON.parse(stored) : [];
  }

  static async getChallengeById(id: string): Promise<WellnessChallenge | null> {
    const challenges = await this.getChallenges();
    return challenges.find((c) => c.id === id) || null;
  }

  static async createChallenge(data: WellnessChallenge): Promise<WellnessChallenge> {
    const challenges = await this.getChallenges();
    challenges.push(data);
    localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(challenges));
    return data;
  }

  static async updateChallenge(id: string, updates: Partial<WellnessChallenge>): Promise<WellnessChallenge> {
    const challenges = await this.getChallenges();
    const index = challenges.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Challenge not found');
    challenges[index] = { ...challenges[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(challenges));
    return challenges[index];
  }

  static async registerParticipant(
    challengeId: string,
    employeeId: string,
    employeeName: string,
    teamId?: string
  ): Promise<ChallengeParticipant> {
    const challenge = await this.getChallengeById(challengeId);
    if (!challenge) throw new Error('Challenge not found');

    const participant: ChallengeParticipant = {
      id: `part-${Date.now()}`,
      challengeId,
      employeeId,
      employeeName,
      teamId,
      registrationDate: new Date().toISOString(),
      status: 'registered',
      currentProgress: 0,
      dailyProgress: [],
      pointsEarned: 0,
      badgesEarned: [],
      milestonesReached: [],
      postsCount: 0,
      likesReceived: 0,
    };

    const participants = await this.getParticipants();
    participants.push(participant);
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));

    // Update challenge participant count
    await this.updateChallenge(challengeId, {
      totalParticipants: challenge.totalParticipants + 1,
    });

    return participant;
  }

  static async getParticipants(challengeId?: string): Promise<ChallengeParticipant[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
    const participants = stored ? JSON.parse(stored) : [];
    return challengeId ? participants.filter((p: ChallengeParticipant) => p.challengeId === challengeId) : participants;
  }

  static async updateParticipant(id: string, updates: Partial<ChallengeParticipant>): Promise<ChallengeParticipant> {
    const participants = await this.getParticipants();
    const index = participants.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Participant not found');
    participants[index] = { ...participants[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));
    return participants[index];
  }

  static async createTeam(challengeId: string, data: ChallengeTeam): Promise<ChallengeTeam> {
    const teams = await this.getTeams();
    teams.push(data);
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    return data;
  }

  static async getTeams(challengeId?: string): Promise<ChallengeTeam[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.TEAMS);
    const teams = stored ? JSON.parse(stored) : [];
    return teams; // Could filter by challengeId if team model includes it
  }

  static async updateTeam(id: string, updates: Partial<ChallengeTeam>): Promise<ChallengeTeam> {
    const teams = await this.getTeams();
    const index = teams.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Team not found');
    teams[index] = { ...teams[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    return teams[index];
  }

  static async logProgress(participantId: string, value: number, date: string, notes?: string): Promise<void> {
    const participants = await this.getParticipants();
    const participant = participants.find((p) => p.id === participantId);
    if (!participant) throw new Error('Participant not found');

    const dailyProgress = participant.dailyProgress || [];
    dailyProgress.push({
      date,
      value,
      notes,
      verified: false,
    });

    const totalProgress = dailyProgress.reduce((sum, p) => sum + p.value, 0);

    await this.updateParticipant(participantId, {
      dailyProgress,
      currentProgress: totalProgress,
      lastActivityDate: new Date().toISOString(),
      status: 'active',
    });
  }
}

// ============================================================================
// Wellness Points Service
// ============================================================================

export class WellnessPointsService {
  static async getPoints(employeeId: string): Promise<WellnessPoints | null> {
    const stored = localStorage.getItem(STORAGE_KEYS.POINTS);
    const allPoints: WellnessPoints[] = stored ? JSON.parse(stored) : [];
    return allPoints.find((p) => p.employeeId === employeeId) || null;
  }

  static async initializePoints(employeeId: string, employeeName: string): Promise<WellnessPoints> {
    const points: WellnessPoints = {
      employeeId,
      employeeName,
      totalPointsEarned: 0,
      totalPointsRedeemed: 0,
      currentBalance: 0,
      pointsExpiringSoon: 0,
      transactions: [],
      currentTier: {
        tierId: 'tier-1',
        tierName: 'Bronze',
        tierLevel: 1,
        minPoints: 0,
        maxPoints: 999,
        benefits: [],
        badgeUrl: '',
        color: '#CD7F32',
      },
      activitiesCompleted: 0,
      challengesCompleted: 0,
      programsCompleted: 0,
      lastUpdated: new Date().toISOString(),
    };

    const stored = localStorage.getItem(STORAGE_KEYS.POINTS);
    const allPoints: WellnessPoints[] = stored ? JSON.parse(stored) : [];
    allPoints.push(points);
    localStorage.setItem(STORAGE_KEYS.POINTS, JSON.stringify(allPoints));
    return points;
  }

  static async awardPoints(
    employeeId: string,
    points: number,
    source: string,
    sourceId: string,
    description: string,
    expiryDate?: string
  ): Promise<PointsTransaction> {
    let employeePoints = await this.getPoints(employeeId);
    if (!employeePoints) {
      employeePoints = await this.initializePoints(employeeId, 'Employee');
    }

    const transaction: PointsTransaction = {
      id: `txn-${Date.now()}`,
      transactionDate: new Date().toISOString(),
      type: 'earned',
      points,
      source,
      sourceId,
      description,
      balance: employeePoints.currentBalance + points,
      expiryDate,
    };

    const transactions = await this.getTransactions(employeeId);
    transactions.push(transaction);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));

    // Update balance
    const updatedPoints = {
      ...employeePoints,
      totalPointsEarned: employeePoints.totalPointsEarned + points,
      currentBalance: employeePoints.currentBalance + points,
      transactions,
      lastUpdated: new Date().toISOString(),
    };

    const stored = localStorage.getItem(STORAGE_KEYS.POINTS);
    const allPoints: WellnessPoints[] = stored ? JSON.parse(stored) : [];
    const index = allPoints.findIndex((p) => p.employeeId === employeeId);
    if (index !== -1) {
      allPoints[index] = updatedPoints;
      localStorage.setItem(STORAGE_KEYS.POINTS, JSON.stringify(allPoints));
    }

    return transaction;
  }

  static async getTransactions(employeeId?: string): Promise<PointsTransaction[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    const transactions = stored ? JSON.parse(stored) : [];
    if (!employeeId) return transactions;

    const points = await this.getPoints(employeeId);
    return points?.transactions || [];
  }

  static async redeemPoints(employeeId: string, points: number, rewardId: string, rewardName: string): Promise<void> {
    const employeePoints = await this.getPoints(employeeId);
    if (!employeePoints) throw new Error('Employee points not found');
    if (employeePoints.currentBalance < points) throw new Error('Insufficient points');

    const transaction: PointsTransaction = {
      id: `txn-${Date.now()}`,
      transactionDate: new Date().toISOString(),
      type: 'redeemed',
      points: -points,
      source: 'rewards',
      sourceId: rewardId,
      description: `Redeemed for ${rewardName}`,
      balance: employeePoints.currentBalance - points,
    };

    const transactions = await this.getTransactions(employeeId);
    transactions.push(transaction);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));

    // Update balance
    const updatedPoints = {
      ...employeePoints,
      totalPointsRedeemed: employeePoints.totalPointsRedeemed + points,
      currentBalance: employeePoints.currentBalance - points,
      transactions,
      lastUpdated: new Date().toISOString(),
    };

    const stored = localStorage.getItem(STORAGE_KEYS.POINTS);
    const allPoints: WellnessPoints[] = stored ? JSON.parse(stored) : [];
    const index = allPoints.findIndex((p) => p.employeeId === employeeId);
    if (index !== -1) {
      allPoints[index] = updatedPoints;
      localStorage.setItem(STORAGE_KEYS.POINTS, JSON.stringify(allPoints));
    }
  }
}

// ============================================================================
// Rewards Service
// ============================================================================

export class RewardsService {
  static async getCatalog(): Promise<RewardsCatalog[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.REWARDS_CATALOG);
    return stored ? JSON.parse(stored) : [];
  }

  static async getRewardById(id: string): Promise<RewardsCatalog | null> {
    const catalog = await this.getCatalog();
    return catalog.find((r) => r.id === id) || null;
  }

  static async createReward(data: RewardsCatalog): Promise<RewardsCatalog> {
    const catalog = await this.getCatalog();
    catalog.push(data);
    localStorage.setItem(STORAGE_KEYS.REWARDS_CATALOG, JSON.stringify(catalog));
    return data;
  }

  static async updateReward(id: string, updates: Partial<RewardsCatalog>): Promise<RewardsCatalog> {
    const catalog = await this.getCatalog();
    const index = catalog.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Reward not found');
    catalog[index] = { ...catalog[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.REWARDS_CATALOG, JSON.stringify(catalog));
    return catalog[index];
  }

  static async redeemReward(
    employeeId: string,
    employeeName: string,
    rewardId: string
  ): Promise<RewardsRedemption> {
    const reward = await this.getRewardById(rewardId);
    if (!reward) throw new Error('Reward not found');
    if (!reward.available) throw new Error('Reward not available');

    const redemption: RewardsRedemption = {
      id: `redeem-${Date.now()}`,
      employeeId,
      employeeName,
      rewardId,
      rewardName: reward.rewardName,
      pointsRedeemed: reward.pointsCost,
      redemptionDate: new Date().toISOString(),
      status: 'pending',
      deliveryMethod: 'email',
    };

    const redemptions = await this.getRedemptions();
    redemptions.push(redemption);
    localStorage.setItem(STORAGE_KEYS.REDEMPTIONS, JSON.stringify(redemptions));

    // Deduct points
    await WellnessPointsService.redeemPoints(employeeId, reward.pointsCost, rewardId, reward.rewardName);

    return redemption;
  }

  static async getRedemptions(employeeId?: string): Promise<RewardsRedemption[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.REDEMPTIONS);
    const redemptions = stored ? JSON.parse(stored) : [];
    return employeeId ? redemptions.filter((r: RewardsRedemption) => r.employeeId === employeeId) : redemptions;
  }

  static async updateRedemption(id: string, updates: Partial<RewardsRedemption>): Promise<RewardsRedemption> {
    const redemptions = await this.getRedemptions();
    const index = redemptions.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Redemption not found');
    redemptions[index] = { ...redemptions[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.REDEMPTIONS, JSON.stringify(redemptions));
    return redemptions[index];
  }
}

// ============================================================================
// Gym Membership Service
// ============================================================================

export class GymMembershipService {
  static async getMemberships(): Promise<GymMembership[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.GYM_MEMBERSHIPS);
    return stored ? JSON.parse(stored) : [];
  }

  static async getMembershipById(id: string): Promise<GymMembership | null> {
    const memberships = await this.getMemberships();
    return memberships.find((m) => m.id === id) || null;
  }

  static async createMembership(data: GymMembership): Promise<GymMembership> {
    const memberships = await this.getMemberships();
    memberships.push(data);
    localStorage.setItem(STORAGE_KEYS.GYM_MEMBERSHIPS, JSON.stringify(memberships));
    return data;
  }

  static async updateMembership(id: string, updates: Partial<GymMembership>): Promise<GymMembership> {
    const memberships = await this.getMemberships();
    const index = memberships.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Membership not found');
    memberships[index] = { ...memberships[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.GYM_MEMBERSHIPS, JSON.stringify(memberships));
    return memberships[index];
  }

  static async getProviders(): Promise<GymProvider[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.GYM_PROVIDERS);
    return stored ? JSON.parse(stored) : [];
  }

  static async getProviderById(id: string): Promise<GymProvider | null> {
    const providers = await this.getProviders();
    return providers.find((p) => p.id === id) || null;
  }

  static async createProvider(data: GymProvider): Promise<GymProvider> {
    const providers = await this.getProviders();
    providers.push(data);
    localStorage.setItem(STORAGE_KEYS.GYM_PROVIDERS, JSON.stringify(providers));
    return data;
  }

  static async updateProvider(id: string, updates: Partial<GymProvider>): Promise<GymProvider> {
    const providers = await this.getProviders();
    const index = providers.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Provider not found');
    providers[index] = { ...providers[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.GYM_PROVIDERS, JSON.stringify(providers));
    return providers[index];
  }

  static async logVisit(membershipId: string): Promise<void> {
    const membership = await this.getMembershipById(membershipId);
    if (!membership) throw new Error('Membership not found');

    await this.updateMembership(membershipId, {
      visitsThisMonth: membership.visitsThisMonth + 1,
      totalVisits: membership.totalVisits + 1,
      lastVisitDate: new Date().toISOString(),
    });
  }
}

// ============================================================================
// Analytics Service
// ============================================================================

export class WellnessAnalyticsService {
  static async getMetrics(): Promise<WellnessMetrics> {
    const programs = await HealthProgramService.getPrograms();
    const enrollments = await HealthProgramService.getEnrollments();
    const mentalSessions = await MentalHealthServiceLayer.getSessions();
    const hraResponses = await HRAService.getResponses();
    const challenges = await ChallengeService.getChallenges();
    const participants = await ChallengeService.getParticipants();
    const memberships = await GymMembershipService.getMemberships();

    // Calculate metrics
    const activePrograms = programs.filter((p) => p.status === 'active').length;
    const activeMemberships = memberships.filter((m) => m.status === 'active').length;
    const activeChallenges = challenges.filter((c) => c.status === 'active').length;

    return {
      totalPrograms: programs.length,
      activePrograms,
      totalProgramEnrollments: enrollments.length,
      averageProgramCompletionRate: 72.5,

      totalMentalHealthSessions: mentalSessions.length,
      mentalHealthUtilizationRate: 28.3,
      averageMentalHealthSatisfaction: 4.7,

      hraCompletionRate: 68.4,
      averageRiskScore: 42.5,
      highRiskEmployees: 12,
      highRiskPercentage: 8.2,
      improvementRate: 15.3,

      activeChallenges,
      challengeParticipationRate: 45.7,
      averageChallengeCompletionRate: 63.2,

      totalPointsIssued: 125000,
      totalPointsRedeemed: 78000,
      pointsRedemptionRate: 62.4,
      averagePointsPerEmployee: 850,

      activeGymMemberships: activeMemberships,
      gymUtilizationRate: 72.8,
      averageGymVisitsPerMonth: 8.5,

      overallWellnessEngagement: 56.3,
      employeeSatisfactionScore: 4.3,
      recommendationScore: 38,

      totalInvestment: 250000,
      estimatedHealthcareSavings: 425000,
      roi: 1.7,

      participationTrends: [],
      healthOutcomeTrends: [],
      engagementTrends: [],

      lastUpdated: new Date().toISOString(),
    };
  }
}

// ============================================================================
// Settings Service
// ============================================================================

export class WellnessSettingsService {
  static async getSettings(): Promise<WellnessSettings> {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (stored) return JSON.parse(stored);

    const defaultSettings: WellnessSettings = {
      enableHealthPrograms: true,
      requireProgramApproval: false,
      maxProgramsPerEmployee: 5,

      enableMentalHealth: true,
      mentalHealthConfidentiality: 'full',
      maxSessionsPerYear: 8,
      crisisHotline: '1-800-XXX-XXXX',

      enableHRA: true,
      hraFrequency: 'annual',
      hraMandatory: false,
      hraAnonymous: true,
      hraIncentivePoints: 100,

      enableChallenges: true,
      allowEmployeeCreatedChallenges: false,
      requireChallengeApproval: true,
      maxChallengesPerQuarter: 4,

      enablePointsSystem: true,
      pointsExpiryMonths: 12,
      enableTierSystem: true,
      tiers: [
        {
          tierId: 'tier-1',
          tierName: 'Bronze',
          tierLevel: 1,
          minPoints: 0,
          maxPoints: 999,
          benefits: [],
          badgeUrl: '',
          color: '#CD7F32',
        },
        {
          tierId: 'tier-2',
          tierName: 'Silver',
          tierLevel: 2,
          minPoints: 1000,
          maxPoints: 2499,
          benefits: [],
          badgeUrl: '',
          color: '#C0C0C0',
        },
        {
          tierId: 'tier-3',
          tierName: 'Gold',
          tierLevel: 3,
          minPoints: 2500,
          benefits: [],
          badgeUrl: '',
          color: '#FFD700',
        },
      ],

      enableGymSubsidy: true,
      maxGymSubsidyPerMonth: 50,
      subsidyPercentage: 50,
      requireUsageMinimum: true,
      minimumVisitsPerMonth: 4,

      enableNotifications: true,
      notifyProgramLaunch: true,
      notifyChallengeMilestones: true,
      notifyPointsExpiry: true,
      notifyNewRewards: true,

      dataRetentionMonths: 36,
      allowDataExport: true,
      requireConsent: true,

      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
    return defaultSettings;
  }

  static async updateSettings(updates: Partial<WellnessSettings>): Promise<WellnessSettings> {
    const settings = await this.getSettings();
    const updated = { ...settings, ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }
}
