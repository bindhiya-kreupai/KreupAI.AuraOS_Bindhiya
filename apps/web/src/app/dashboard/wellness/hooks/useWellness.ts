/**
 * Employee Wellness Module - Custom Hook
 * Centralized state management and business logic
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
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
} from '../types';
import {
  HealthProgramService,
  MentalHealthServiceLayer,
  HRAService,
  ChallengeService,
  WellnessPointsService,
  RewardsService,
  GymMembershipService,
  WellnessAnalyticsService,
  WellnessSettingsService,
} from '../services';

export interface UseWellnessReturn {
  // Health Programs
  programs: HealthProgram[];
  enrollments: ProgramEnrollment[];
  createProgram: (data: HealthProgram) => Promise<HealthProgram>;
  updateProgram: (id: string, updates: Partial<HealthProgram>) => Promise<HealthProgram>;
  deleteProgram: (id: string) => Promise<void>;
  enrollInProgram: (programId: string, employeeId: string, employeeName: string) => Promise<ProgramEnrollment>;
  updateEnrollment: (id: string, updates: Partial<ProgramEnrollment>) => Promise<ProgramEnrollment>;

  // Mental Health
  mentalHealthServices: MentalHealthService[];
  mentalHealthSessions: MentalHealthSession[];
  createMentalHealthService: (data: MentalHealthService) => Promise<MentalHealthService>;
  updateMentalHealthService: (id: string, updates: Partial<MentalHealthService>) => Promise<MentalHealthService>;
  createMentalHealthSession: (data: MentalHealthSession) => Promise<MentalHealthSession>;
  updateMentalHealthSession: (id: string, updates: Partial<MentalHealthSession>) => Promise<MentalHealthSession>;
  confirmSessionAttendance: (sessionId: string) => Promise<void>;

  // HRA
  assessments: HealthRiskAssessment[];
  hraResponses: HRAResponse[];
  createAssessment: (data: HealthRiskAssessment) => Promise<HealthRiskAssessment>;
  updateAssessment: (id: string, updates: Partial<HealthRiskAssessment>) => Promise<HealthRiskAssessment>;
  submitHRAResponse: (data: HRAResponse) => Promise<HRAResponse>;
  updateHRAResponse: (id: string, updates: Partial<HRAResponse>) => Promise<HRAResponse>;

  // Challenges
  challenges: WellnessChallenge[];
  participants: ChallengeParticipant[];
  teams: ChallengeTeam[];
  createChallenge: (data: WellnessChallenge) => Promise<WellnessChallenge>;
  updateChallenge: (id: string, updates: Partial<WellnessChallenge>) => Promise<WellnessChallenge>;
  registerForChallenge: (
    challengeId: string,
    employeeId: string,
    employeeName: string,
    teamId?: string
  ) => Promise<ChallengeParticipant>;
  updateParticipant: (id: string, updates: Partial<ChallengeParticipant>) => Promise<ChallengeParticipant>;
  logChallengeProgress: (participantId: string, value: number, date: string, notes?: string) => Promise<void>;
  createTeam: (challengeId: string, data: ChallengeTeam) => Promise<ChallengeTeam>;
  updateTeam: (id: string, updates: Partial<ChallengeTeam>) => Promise<ChallengeTeam>;

  // Points & Rewards
  points: WellnessPoints | null;
  transactions: PointsTransaction[];
  rewardsCatalog: RewardsCatalog[];
  redemptions: RewardsRedemption[];
  awardPoints: (
    employeeId: string,
    points: number,
    source: string,
    sourceId: string,
    description: string,
    expiryDate?: string
  ) => Promise<PointsTransaction>;
  redeemReward: (employeeId: string, employeeName: string, rewardId: string) => Promise<RewardsRedemption>;
  createReward: (data: RewardsCatalog) => Promise<RewardsCatalog>;
  updateReward: (id: string, updates: Partial<RewardsCatalog>) => Promise<RewardsCatalog>;
  updateRedemption: (id: string, updates: Partial<RewardsRedemption>) => Promise<RewardsRedemption>;

  // Gym Memberships
  gymMemberships: GymMembership[];
  gymProviders: GymProvider[];
  createGymMembership: (data: GymMembership) => Promise<GymMembership>;
  updateGymMembership: (id: string, updates: Partial<GymMembership>) => Promise<GymMembership>;
  logGymVisit: (membershipId: string) => Promise<void>;
  createGymProvider: (data: GymProvider) => Promise<GymProvider>;
  updateGymProvider: (id: string, updates: Partial<GymProvider>) => Promise<GymProvider>;

  // Analytics & Settings
  metrics: WellnessMetrics | null;
  settings: WellnessSettings | null;
  updateSettings: (updates: Partial<WellnessSettings>) => Promise<WellnessSettings>;

  // Global State
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export function useWellness(currentEmployeeId?: string): UseWellnessReturn {
  // Health Programs State
  const [programs, setPrograms] = useState<HealthProgram[]>([]);
  const [enrollments, setEnrollments] = useState<ProgramEnrollment[]>([]);

  // Mental Health State
  const [mentalHealthServices, setMentalHealthServices] = useState<MentalHealthService[]>([]);
  const [mentalHealthSessions, setMentalHealthSessions] = useState<MentalHealthSession[]>([]);

  // HRA State
  const [assessments, setAssessments] = useState<HealthRiskAssessment[]>([]);
  const [hraResponses, setHRAResponses] = useState<HRAResponse[]>([]);

  // Challenges State
  const [challenges, setChallenges] = useState<WellnessChallenge[]>([]);
  const [participants, setParticipants] = useState<ChallengeParticipant[]>([]);
  const [teams, setTeams] = useState<ChallengeTeam[]>([]);

  // Points & Rewards State
  const [points, setPoints] = useState<WellnessPoints | null>(null);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [rewardsCatalog, setRewardsCatalog] = useState<RewardsCatalog[]>([]);
  const [redemptions, setRedemptions] = useState<RewardsRedemption[]>([]);

  // Gym State
  const [gymMemberships, setGymMemberships] = useState<GymMembership[]>([]);
  const [gymProviders, setGymProviders] = useState<GymProvider[]>([]);

  // Global State
  const [metrics, setMetrics] = useState<WellnessMetrics | null>(null);
  const [settings, setSettings] = useState<WellnessSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Data
  const initializeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        programsData,
        enrollmentsData,
        mentalServicesData,
        mentalSessionsData,
        assessmentsData,
        hraResponsesData,
        challengesData,
        participantsData,
        teamsData,
        rewardsCatalogData,
        redemptionsData,
        gymMembershipsData,
        gymProvidersData,
        metricsData,
        settingsData,
      ] = await Promise.all([
        HealthProgramService.getPrograms(),
        HealthProgramService.getEnrollments(),
        MentalHealthServiceLayer.getServices(),
        MentalHealthServiceLayer.getSessions(),
        HRAService.getAssessments(),
        HRAService.getResponses(),
        ChallengeService.getChallenges(),
        ChallengeService.getParticipants(),
        ChallengeService.getTeams(),
        RewardsService.getCatalog(),
        RewardsService.getRedemptions(),
        GymMembershipService.getMemberships(),
        GymMembershipService.getProviders(),
        WellnessAnalyticsService.getMetrics(),
        WellnessSettingsService.getSettings(),
      ]);

      setPrograms(programsData);
      setEnrollments(enrollmentsData);
      setMentalHealthServices(mentalServicesData);
      setMentalHealthSessions(mentalSessionsData);
      setAssessments(assessmentsData);
      setHRAResponses(hraResponsesData);
      setChallenges(challengesData);
      setParticipants(participantsData);
      setTeams(teamsData);
      setRewardsCatalog(rewardsCatalogData);
      setRedemptions(redemptionsData);
      setGymMemberships(gymMembershipsData);
      setGymProviders(gymProvidersData);
      setMetrics(metricsData);
      setSettings(settingsData);

      // Load employee points if employeeId provided
      if (currentEmployeeId) {
        const pointsData = await WellnessPointsService.getPoints(currentEmployeeId);
        setPoints(pointsData);
        const transactionsData = await WellnessPointsService.getTransactions(currentEmployeeId);
        setTransactions(transactionsData);
      }
    } catch (error) {
      setError(err instanceof Error ? err.message : 'Failed to load wellness data');
    } finally {
      setLoading(false);
    }
  }, [currentEmployeeId]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // ============================================================================
  // Health Programs Methods
  // ============================================================================

  const createProgram = async (data: HealthProgram): Promise<HealthProgram> => {
    const newProgram = await HealthProgramService.createProgram(data);
    setPrograms([...programs, newProgram]);
    return newProgram;
  };

  const updateProgram = async (id: string, updates: Partial<HealthProgram>): Promise<HealthProgram> => {
    const updated = await HealthProgramService.updateProgram(id, updates);
    setPrograms(programs.map((p) => (p.id === id ? updated : p)));
    return updated;
  };

  const deleteProgram = async (id: string): Promise<void> => {
    await HealthProgramService.deleteProgram(id);
    setPrograms(programs.filter((p) => p.id !== id));
  };

  const enrollInProgram = async (
    programId: string,
    employeeId: string,
    employeeName: string
  ): Promise<ProgramEnrollment> => {
    const enrollment = await HealthProgramService.enrollEmployee(programId, employeeId, employeeName);
    setEnrollments([...enrollments, enrollment]);

    // Update program participant count
    const program = programs.find((p) => p.id === programId);
    if (program) {
      setPrograms(
        programs.map((p) => (p.id === programId ? { ...p, currentParticipants: p.currentParticipants + 1 } : p))
      );
    }

    return enrollment;
  };

  const updateEnrollment = async (id: string, updates: Partial<ProgramEnrollment>): Promise<ProgramEnrollment> => {
    const updated = await HealthProgramService.updateEnrollment(id, updates);
    setEnrollments(enrollments.map((e) => (e.id === id ? updated : e)));
    return updated;
  };

  // ============================================================================
  // Mental Health Methods
  // ============================================================================

  const createMentalHealthService = async (data: MentalHealthService): Promise<MentalHealthService> => {
    const service = await MentalHealthServiceLayer.createService(data);
    setMentalHealthServices([...mentalHealthServices, service]);
    return service;
  };

  const updateMentalHealthService = async (
    id: string,
    updates: Partial<MentalHealthService>
  ): Promise<MentalHealthService> => {
    const updated = await MentalHealthServiceLayer.updateService(id, updates);
    setMentalHealthServices(mentalHealthServices.map((s) => (s.id === id ? updated : s)));
    return updated;
  };

  const createMentalHealthSession = async (data: MentalHealthSession): Promise<MentalHealthSession> => {
    const session = await MentalHealthServiceLayer.createSession(data);
    setMentalHealthSessions([...mentalHealthSessions, session]);
    return session;
  };

  const updateMentalHealthSession = async (
    id: string,
    updates: Partial<MentalHealthSession>
  ): Promise<MentalHealthSession> => {
    const updated = await MentalHealthServiceLayer.updateSession(id, updates);
    setMentalHealthSessions(mentalHealthSessions.map((s) => (s.id === id ? updated : s)));
    return updated;
  };

  const confirmSessionAttendance = async (sessionId: string): Promise<void> => {
    await MentalHealthServiceLayer.confirmAttendance(sessionId);
    setMentalHealthSessions(
      mentalHealthSessions.map((s) => (s.id === sessionId ? { ...s, attendanceConfirmed: true, status: 'completed' } : s))
    );
  };

  // ============================================================================
  // HRA Methods
  // ============================================================================

  const createAssessment = async (data: HealthRiskAssessment): Promise<HealthRiskAssessment> => {
    const assessment = await HRAService.createAssessment(data);
    setAssessments([...assessments, assessment]);
    return assessment;
  };

  const updateAssessment = async (id: string, updates: Partial<HealthRiskAssessment>): Promise<HealthRiskAssessment> => {
    const updated = await HRAService.updateAssessment(id, updates);
    setAssessments(assessments.map((a) => (a.id === id ? updated : a)));
    return updated;
  };

  const submitHRAResponse = async (data: HRAResponse): Promise<HRAResponse> => {
    const response = await HRAService.submitResponse(data);
    setHRAResponses([...hraResponses, response]);
    return response;
  };

  const updateHRAResponse = async (id: string, updates: Partial<HRAResponse>): Promise<HRAResponse> => {
    const updated = await HRAService.updateResponse(id, updates);
    setHRAResponses(hraResponses.map((r) => (r.id === id ? updated : r)));
    return updated;
  };

  // ============================================================================
  // Challenge Methods
  // ============================================================================

  const createChallenge = async (data: WellnessChallenge): Promise<WellnessChallenge> => {
    const challenge = await ChallengeService.createChallenge(data);
    setChallenges([...challenges, challenge]);
    return challenge;
  };

  const updateChallenge = async (id: string, updates: Partial<WellnessChallenge>): Promise<WellnessChallenge> => {
    const updated = await ChallengeService.updateChallenge(id, updates);
    setChallenges(challenges.map((c) => (c.id === id ? updated : c)));
    return updated;
  };

  const registerForChallenge = async (
    challengeId: string,
    employeeId: string,
    employeeName: string,
    teamId?: string
  ): Promise<ChallengeParticipant> => {
    const participant = await ChallengeService.registerParticipant(challengeId, employeeId, employeeName, teamId);
    setParticipants([...participants, participant]);
    return participant;
  };

  const updateParticipant = async (id: string, updates: Partial<ChallengeParticipant>): Promise<ChallengeParticipant> => {
    const updated = await ChallengeService.updateParticipant(id, updates);
    setParticipants(participants.map((p) => (p.id === id ? updated : p)));
    return updated;
  };

  const logChallengeProgress = async (
    participantId: string,
    value: number,
    date: string,
    notes?: string
  ): Promise<void> => {
    await ChallengeService.logProgress(participantId, value, date, notes);
    // Refresh participants to get updated progress
    const updatedParticipants = await ChallengeService.getParticipants();
    setParticipants(updatedParticipants);
  };

  const createTeam = async (challengeId: string, data: ChallengeTeam): Promise<ChallengeTeam> => {
    const team = await ChallengeService.createTeam(challengeId, data);
    setTeams([...teams, team]);
    return team;
  };

  const updateTeam = async (id: string, updates: Partial<ChallengeTeam>): Promise<ChallengeTeam> => {
    const updated = await ChallengeService.updateTeam(id, updates);
    setTeams(teams.map((t) => (t.id === id ? updated : t)));
    return updated;
  };

  // ============================================================================
  // Points & Rewards Methods
  // ============================================================================

  const awardPoints = async (
    employeeId: string,
    points: number,
    source: string,
    sourceId: string,
    description: string,
    expiryDate?: string
  ): Promise<PointsTransaction> => {
    const transaction = await WellnessPointsService.awardPoints(
      employeeId,
      points,
      source,
      sourceId,
      description,
      expiryDate
    );

    if (currentEmployeeId === employeeId) {
      setTransactions([...transactions, transaction]);
      const updatedPoints = await WellnessPointsService.getPoints(employeeId);
      setPoints(updatedPoints);
    }

    return transaction;
  };

  const redeemReward = async (
    employeeId: string,
    employeeName: string,
    rewardId: string
  ): Promise<RewardsRedemption> => {
    const redemption = await RewardsService.redeemReward(employeeId, employeeName, rewardId);
    setRedemptions([...redemptions, redemption]);

    if (currentEmployeeId === employeeId) {
      const updatedPoints = await WellnessPointsService.getPoints(employeeId);
      setPoints(updatedPoints);
      const updatedTransactions = await WellnessPointsService.getTransactions(employeeId);
      setTransactions(updatedTransactions);
    }

    return redemption;
  };

  const createReward = async (data: RewardsCatalog): Promise<RewardsCatalog> => {
    const reward = await RewardsService.createReward(data);
    setRewardsCatalog([...rewardsCatalog, reward]);
    return reward;
  };

  const updateReward = async (id: string, updates: Partial<RewardsCatalog>): Promise<RewardsCatalog> => {
    const updated = await RewardsService.updateReward(id, updates);
    setRewardsCatalog(rewardsCatalog.map((r) => (r.id === id ? updated : r)));
    return updated;
  };

  const updateRedemption = async (id: string, updates: Partial<RewardsRedemption>): Promise<RewardsRedemption> => {
    const updated = await RewardsService.updateRedemption(id, updates);
    setRedemptions(redemptions.map((r) => (r.id === id ? updated : r)));
    return updated;
  };

  // ============================================================================
  // Gym Membership Methods
  // ============================================================================

  const createGymMembership = async (data: GymMembership): Promise<GymMembership> => {
    const membership = await GymMembershipService.createMembership(data);
    setGymMemberships([...gymMemberships, membership]);
    return membership;
  };

  const updateGymMembership = async (id: string, updates: Partial<GymMembership>): Promise<GymMembership> => {
    const updated = await GymMembershipService.updateMembership(id, updates);
    setGymMemberships(gymMemberships.map((m) => (m.id === id ? updated : m)));
    return updated;
  };

  const logGymVisit = async (membershipId: string): Promise<void> => {
    await GymMembershipService.logVisit(membershipId);
    const updatedMemberships = await GymMembershipService.getMemberships();
    setGymMemberships(updatedMemberships);
  };

  const createGymProvider = async (data: GymProvider): Promise<GymProvider> => {
    const provider = await GymMembershipService.createProvider(data);
    setGymProviders([...gymProviders, provider]);
    return provider;
  };

  const updateGymProvider = async (id: string, updates: Partial<GymProvider>): Promise<GymProvider> => {
    const updated = await GymMembershipService.updateProvider(id, updates);
    setGymProviders(gymProviders.map((p) => (p.id === id ? updated : p)));
    return updated;
  };

  // ============================================================================
  // Settings Methods
  // ============================================================================

  const updateSettings = async (updates: Partial<WellnessSettings>): Promise<WellnessSettings> => {
    const updated = await WellnessSettingsService.updateSettings(updates);
    setSettings(updated);
    return updated;
  };

  return {
    // Health Programs
    programs,
    enrollments,
    createProgram,
    updateProgram,
    deleteProgram,
    enrollInProgram,
    updateEnrollment,

    // Mental Health
    mentalHealthServices,
    mentalHealthSessions,
    createMentalHealthService,
    updateMentalHealthService,
    createMentalHealthSession,
    updateMentalHealthSession,
    confirmSessionAttendance,

    // HRA
    assessments,
    hraResponses,
    createAssessment,
    updateAssessment,
    submitHRAResponse,
    updateHRAResponse,

    // Challenges
    challenges,
    participants,
    teams,
    createChallenge,
    updateChallenge,
    registerForChallenge,
    updateParticipant,
    logChallengeProgress,
    createTeam,
    updateTeam,

    // Points & Rewards
    points,
    transactions,
    rewardsCatalog,
    redemptions,
    awardPoints,
    redeemReward,
    createReward,
    updateReward,
    updateRedemption,

    // Gym
    gymMemberships,
    gymProviders,
    createGymMembership,
    updateGymMembership,
    logGymVisit,
    createGymProvider,
    updateGymProvider,

    // Global
    metrics,
    settings,
    updateSettings,
    loading,
    error,
    refreshData: initializeData,
  };
}
