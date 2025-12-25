// AI Automation Module - Custom React Hook
// Manages state and business logic for AI/ML operations

'use client';

import { useState, useEffect } from 'react';
import {
  OrgHealthPrediction,
  CoachingSession,
  GeneratedWorkflow,
  ResumeScreening,
  AttritionPrediction,
  LeaveForecast,
  DetectedAnomaly,
  ChatbotConversation,
  InterviewSchedule,
  AIAutomationSettings,
  Toast,
} from '../types';
import {
  OrgHealthPredictorService,
  AICoachingBotService,
  WorkflowGeneratorService,
  ResumeScreeningService,
  AttritionPredictionService,
  LeaveForecastingService,
  AnomalyDetectionService,
  ChatbotService,
  InterviewSchedulingService,
  AIAutomationSettingsService,
} from '../services';
import {
  sampleOrgHealthPredictions,
  sampleCoachingSessions,
  sampleResumeScreenings,
  sampleAttritionPredictions,
  sampleDetectedAnomalies,
  sampleInterviewSchedules,
  sampleAIAutomationSettings,
} from '../data';

export const useAIAutomation = () => {
  // ============================================================================
  // STATE
  // ============================================================================

  // Org Health
  const [orgHealthPredictions, setOrgHealthPredictions] = useState<OrgHealthPrediction[]>([]);
  const [latestOrgHealth, setLatestOrgHealth] = useState<OrgHealthPrediction | null>(null);

  // Coaching
  const [coachingSessions, setCoachingSessions] = useState<CoachingSession[]>([]);
  const [activeCoachingSession, setActiveCoachingSession] = useState<CoachingSession | null>(null);

  // Workflows
  const [generatedWorkflows, setGeneratedWorkflows] = useState<GeneratedWorkflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<GeneratedWorkflow | null>(null);

  // Resume Screening
  const [resumeScreenings, setResumeScreenings] = useState<ResumeScreening[]>([]);

  // Attrition
  const [attritionPredictions, setAttritionPredictions] = useState<AttritionPrediction[]>([]);
  const [highRiskEmployees, setHighRiskEmployees] = useState<AttritionPrediction[]>([]);

  // Leave Forecasting
  const [leaveForecasts, setLeaveForecasts] = useState<LeaveForecast[]>([]);

  // Anomaly Detection
  const [detectedAnomalies, setDetectedAnomalies] = useState<DetectedAnomaly[]>([]);
  const [activeAnomalies, setActiveAnomalies] = useState<DetectedAnomaly[]>([]);

  // Chatbot
  const [chatbotConversations, setChatbotConversations] = useState<ChatbotConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatbotConversation | null>(null);

  // Interview Scheduling
  const [interviewSchedules, setInterviewSchedules] = useState<InterviewSchedule[]>([]);

  // Settings
  const [settings, setSettings] = useState<AIAutomationSettings | null>(null);

  // UI State
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const existingPredictions = await OrgHealthPredictorService.getAllPredictions();
      if (existingPredictions.length === 0) {
        localStorage.setItem('ai_org_health_predictions', JSON.stringify(sampleOrgHealthPredictions));
        localStorage.setItem('ai_coaching_sessions', JSON.stringify(sampleCoachingSessions));
        localStorage.setItem('ai_resume_screenings', JSON.stringify(sampleResumeScreenings));
        localStorage.setItem('ai_attrition_predictions', JSON.stringify(sampleAttritionPredictions));
        localStorage.setItem('ai_detected_anomalies', JSON.stringify(sampleDetectedAnomalies));
        localStorage.setItem('ai_interview_schedules', JSON.stringify(sampleInterviewSchedules));
      }

      await Promise.all([
        loadOrgHealthPredictions(),
        loadCoachingSessions(),
        loadGeneratedWorkflows(),
        loadResumeScreenings(),
        loadAttritionPredictions(),
        loadLeaveForecasts(),
        loadDetectedAnomalies(),
        loadChatbotConversations(),
        loadInterviewSchedules(),
        loadSettings(),
      ]);
    } catch {
      console.error('Error loading initial data:', error);
      addToast({ type: 'error', message: 'Failed to load AI automation data' });
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // ORG HEALTH PREDICTOR OPERATIONS
  // ============================================================================

  const loadOrgHealthPredictions = async () => {
    try {
      const predictions = await OrgHealthPredictorService.getAllPredictions();
      setOrgHealthPredictions(predictions);
      const latest = await OrgHealthPredictorService.getLatestPrediction();
      setLatestOrgHealth(latest);
    } catch {
      console.error('Error loading org health predictions:', error);
      addToast({ type: 'error', message: 'Failed to load org health predictions' });
    }
  };

  const generateOrgHealthPrediction = async () => {
    setLoading(true);
    try {
      const prediction = await OrgHealthPredictorService.generatePrediction();
      await loadOrgHealthPredictions();
      addToast({ type: 'success', message: 'Org health prediction generated successfully' });
      return prediction;
    } catch {
      console.error('Error generating prediction:', error);
      addToast({ type: 'error', message: 'Failed to generate prediction' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // AI COACHING BOT OPERATIONS
  // ============================================================================

  const loadCoachingSessions = async () => {
    try {
      const sessions = await AICoachingBotService.getAllSessions();
      setCoachingSessions(sessions);
    } catch {
      console.error('Error loading coaching sessions:', error);
      addToast({ type: 'error', message: 'Failed to load coaching sessions' });
    }
  };

  const startCoachingSession = async (employeeId: string, employeeName: string, sessionType: any) => {
    setLoading(true);
    try {
      const session = await AICoachingBotService.startSession({ employeeId, employeeName, sessionType });
      setActiveCoachingSession(session);
      await loadCoachingSessions();
      addToast({ type: 'success', message: 'Coaching session started' });
      return session;
    } catch {
      console.error('Error starting session:', error);
      addToast({ type: 'error', message: 'Failed to start coaching session' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendCoachingMessage = async (sessionId: string, message: string, sender: 'user' | 'bot') => {
    try {
      const updated = await AICoachingBotService.sendMessage(sessionId, message, sender);
      setActiveCoachingSession(updated);
      await loadCoachingSessions();
      return updated;
    } catch {
      console.error('Error sending message:', error);
      addToast({ type: 'error', message: 'Failed to send message' });
      throw error;
    }
  };

  const endCoachingSession = async (sessionId: string) => {
    setLoading(true);
    try {
      await AICoachingBotService.endSession(sessionId);
      setActiveCoachingSession(null);
      await loadCoachingSessions();
      addToast({ type: 'success', message: 'Coaching session ended' });
    } catch {
      console.error('Error ending session:', error);
      addToast({ type: 'error', message: 'Failed to end session' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // WORKFLOW GENERATOR OPERATIONS
  // ============================================================================

  const loadGeneratedWorkflows = async () => {
    try {
      const workflows = await WorkflowGeneratorService.getAllWorkflows();
      setGeneratedWorkflows(workflows);
    } catch {
      console.error('Error loading workflows:', error);
      addToast({ type: 'error', message: 'Failed to load workflows' });
    }
  };

  const generateWorkflow = async (description: string) => {
    setLoading(true);
    try {
      const workflow = await WorkflowGeneratorService.generateWorkflow(description);
      await loadGeneratedWorkflows();
      addToast({ type: 'success', message: 'Workflow generated successfully' });
      return workflow;
    } catch {
      console.error('Error generating workflow:', error);
      addToast({ type: 'error', message: 'Failed to generate workflow' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deployWorkflow = async (workflowId: string) => {
    setLoading(true);
    try {
      await WorkflowGeneratorService.deployWorkflow(workflowId);
      await loadGeneratedWorkflows();
      addToast({ type: 'success', message: 'Workflow deployed successfully' });
    } catch {
      console.error('Error deploying workflow:', error);
      addToast({ type: 'error', message: 'Failed to deploy workflow' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // RESUME SCREENING OPERATIONS
  // ============================================================================

  const loadResumeScreenings = async () => {
    try {
      const screenings = await ResumeScreeningService.getAllScreenings();
      setResumeScreenings(screenings);
    } catch {
      console.error('Error loading screenings:', error);
      addToast({ type: 'error', message: 'Failed to load resume screenings' });
    }
  };

  const screenResume = async (screeningData: any) => {
    setLoading(true);
    try {
      const screening = await ResumeScreeningService.screenResume(screeningData);
      await loadResumeScreenings();
      addToast({ type: 'success', message: 'Resume screened successfully' });
      return screening;
    } catch {
      console.error('Error screening resume:', error);
      addToast({ type: 'error', message: 'Failed to screen resume' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // ATTRITION PREDICTION OPERATIONS
  // ============================================================================

  const loadAttritionPredictions = async () => {
    try {
      const predictions = await AttritionPredictionService.getAllPredictions();
      setAttritionPredictions(predictions);
      const highRisk = await AttritionPredictionService.getHighRiskEmployees();
      setHighRiskEmployees(highRisk);
    } catch {
      console.error('Error loading attrition predictions:', error);
      addToast({ type: 'error', message: 'Failed to load attrition predictions' });
    }
  };

  const predictAttrition = async (employeeId: string) => {
    setLoading(true);
    try {
      const prediction = await AttritionPredictionService.predictAttrition(employeeId);
      await loadAttritionPredictions();
      addToast({ type: 'success', message: 'Attrition prediction generated' });
      return prediction;
    } catch {
      console.error('Error predicting attrition:', error);
      addToast({ type: 'error', message: 'Failed to predict attrition' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // LEAVE FORECASTING OPERATIONS
  // ============================================================================

  const loadLeaveForecasts = async () => {
    try {
      const forecasts = await LeaveForecastingService.getAllForecasts();
      setLeaveForecasts(forecasts);
    } catch {
      console.error('Error loading leave forecasts:', error);
      addToast({ type: 'error', message: 'Failed to load leave forecasts' });
    }
  };

  const generateLeaveForecast = async (startDate: Date, endDate: Date, department?: string) => {
    setLoading(true);
    try {
      const forecast = await LeaveForecastingService.generateForecast(startDate, endDate, department);
      await loadLeaveForecasts();
      addToast({ type: 'success', message: 'Leave forecast generated' });
      return forecast;
    } catch {
      console.error('Error generating forecast:', error);
      addToast({ type: 'error', message: 'Failed to generate leave forecast' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // ANOMALY DETECTION OPERATIONS
  // ============================================================================

  const loadDetectedAnomalies = async () => {
    try {
      const anomalies = await AnomalyDetectionService.getAllAnomalies();
      setDetectedAnomalies(anomalies);
      const active = await AnomalyDetectionService.getActiveAnomalies();
      setActiveAnomalies(active);
    } catch {
      console.error('Error loading anomalies:', error);
      addToast({ type: 'error', message: 'Failed to load anomalies' });
    }
  };

  const updateAnomaly = async (anomalyId: string, updates: any) => {
    setLoading(true);
    try {
      await AnomalyDetectionService.updateAnomaly(anomalyId, updates);
      await loadDetectedAnomalies();
      addToast({ type: 'success', message: 'Anomaly updated successfully' });
    } catch {
      console.error('Error updating anomaly:', error);
      addToast({ type: 'error', message: 'Failed to update anomaly' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // CHATBOT OPERATIONS
  // ============================================================================

  const loadChatbotConversations = async () => {
    try {
      const conversations = await ChatbotService.getAllConversations();
      setChatbotConversations(conversations);
    } catch {
      console.error('Error loading conversations:', error);
      addToast({ type: 'error', message: 'Failed to load chatbot conversations' });
    }
  };

  const startChatbotConversation = async (employeeId: string, employeeName: string) => {
    setLoading(true);
    try {
      const conversation = await ChatbotService.startConversation(employeeId, employeeName);
      setActiveConversation(conversation);
      await loadChatbotConversations();
      return conversation;
    } catch {
      console.error('Error starting conversation:', error);
      addToast({ type: 'error', message: 'Failed to start conversation' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendChatbotMessage = async (conversationId: string, message: string, sender: 'user' | 'bot') => {
    try {
      const updated = await ChatbotService.sendChatMessage(conversationId, message, sender);
      setActiveConversation(updated);
      await loadChatbotConversations();
      return updated;
    } catch {
      console.error('Error sending message:', error);
      addToast({ type: 'error', message: 'Failed to send message' });
      throw error;
    }
  };

  // ============================================================================
  // INTERVIEW SCHEDULING OPERATIONS
  // ============================================================================

  const loadInterviewSchedules = async () => {
    try {
      const schedules = await InterviewSchedulingService.getAllSchedules();
      setInterviewSchedules(schedules);
    } catch {
      console.error('Error loading interview schedules:', error);
      addToast({ type: 'error', message: 'Failed to load interview schedules' });
    }
  };

  const createInterviewSchedule = async (scheduleData: any) => {
    setLoading(true);
    try {
      const schedule = await InterviewSchedulingService.createSchedule(scheduleData);
      await loadInterviewSchedules();
      addToast({ type: 'success', message: 'Interview schedule created' });
      return schedule;
    } catch {
      console.error('Error creating schedule:', error);
      addToast({ type: 'error', message: 'Failed to create interview schedule' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const confirmInterviewSchedule = async (scheduleId: string, slotId: string) => {
    setLoading(true);
    try {
      await InterviewSchedulingService.confirmSchedule(scheduleId, slotId);
      await loadInterviewSchedules();
      addToast({ type: 'success', message: 'Interview confirmed' });
    } catch {
      console.error('Error confirming schedule:', error);
      addToast({ type: 'error', message: 'Failed to confirm interview' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // SETTINGS OPERATIONS
  // ============================================================================

  const loadSettings = async () => {
    try {
      const settingsData = await AIAutomationSettingsService.getSettings();
      setSettings(settingsData);
    } catch {
      console.error('Error loading settings:', error);
      addToast({ type: 'error', message: 'Failed to load settings' });
    }
  };

  const updateSettings = async (updates: Partial<AIAutomationSettings>) => {
    setLoading(true);
    try {
      const updated = await AIAutomationSettingsService.updateSettings(updates);
      setSettings(updated);
      addToast({ type: 'success', message: 'Settings updated successfully' });
      return updated;
    } catch {
      console.error('Error updating settings:', error);
      addToast({ type: 'error', message: 'Failed to update settings' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // TOAST OPERATIONS
  // ============================================================================

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // State
    orgHealthPredictions,
    latestOrgHealth,
    coachingSessions,
    activeCoachingSession,
    setActiveCoachingSession,
    generatedWorkflows,
    selectedWorkflow,
    setSelectedWorkflow,
    resumeScreenings,
    attritionPredictions,
    highRiskEmployees,
    leaveForecasts,
    detectedAnomalies,
    activeAnomalies,
    chatbotConversations,
    activeConversation,
    setActiveConversation,
    interviewSchedules,
    settings,
    loading,
    toasts,

    // Operations
    loadOrgHealthPredictions,
    generateOrgHealthPrediction,
    loadCoachingSessions,
    startCoachingSession,
    sendCoachingMessage,
    endCoachingSession,
    loadGeneratedWorkflows,
    generateWorkflow,
    deployWorkflow,
    loadResumeScreenings,
    screenResume,
    loadAttritionPredictions,
    predictAttrition,
    loadLeaveForecasts,
    generateLeaveForecast,
    loadDetectedAnomalies,
    updateAnomaly,
    loadChatbotConversations,
    startChatbotConversation,
    sendChatbotMessage,
    loadInterviewSchedules,
    createInterviewSchedule,
    confirmInterviewSchedule,
    loadSettings,
    updateSettings,
    addToast,
    removeToast,
  };
};
