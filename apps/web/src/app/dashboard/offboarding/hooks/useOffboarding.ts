'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  ResignationLetter,
  TerminationNotice,
  OffboardingInstance,
  KnowledgeTransfer,
  ExitInterview,
  ExitSurvey,
  FinalSettlement,
  AlumniRecord,
  OffboardingMetrics,
  OffboardingSettings,
  KnowledgeTransferSession,
} from '../types';
import {
  ResignationService,
  TerminationService,
  OffboardingInstanceService,
  OffboardingTaskService,
  EquipmentReturnService,
  AccessRevocationService,
  ClearanceService,
  KnowledgeTransferService,
  ExitInterviewService,
  ExitSurveyService,
  FinalSettlementService,
  AlumniService,
  OffboardingAnalyticsService,
  OffboardingSettingsService,
} from '../services';
import { useToast } from '@aura/ui';

export const useOffboarding = () => {
  // State
  const [resignations, setResignations] = useState<ResignationLetter[]>([]);
  const [terminations, setTerminations] = useState<TerminationNotice[]>([]);
  const [instances, setInstances] = useState<OffboardingInstance[]>([]);
  const [knowledgeTransfers, setKnowledgeTransfers] = useState<KnowledgeTransfer[]>([]);
  const [exitInterviews, setExitInterviews] = useState<ExitInterview[]>([]);
  const [exitSurveys, setExitSurveys] = useState<ExitSurvey[]>([]);
  const [finalSettlements, setFinalSettlements] = useState<FinalSettlement[]>([]);
  const [alumni, setAlumni] = useState<AlumniRecord[]>([]);
  const [metrics, setMetrics] = useState<OffboardingMetrics | null>(null);
  const [settings, setSettings] = useState<OffboardingSettings | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toast = useToast();

  // Data loading
  const loadResignations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ResignationService.getResignations();
      setResignations(data);
    } catch (error: any) {
      const message = (error as Error).message || 'Failed to load resignations';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadTerminations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await TerminationService.getTerminations();
      setTerminations(data);
    } catch (error: any) {
      const message = (error as Error).message || 'Failed to load terminations';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadInstances = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await OffboardingInstanceService.getInstances();
      setInstances(data);
    } catch (error: any) {
      const message = (error as Error).message || 'Failed to load offboarding instances';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadKnowledgeTransfers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await KnowledgeTransferService.getKnowledgeTransfers();
      setKnowledgeTransfers(data);
    } catch (error: any) {
      const message = (error as Error).message || 'Failed to load knowledge transfers';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadExitInterviews = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ExitInterviewService.getExitInterviews();
      setExitInterviews(data);
    } catch (error: any) {
      const message = (error as Error).message || 'Failed to load exit interviews';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadExitSurveys = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ExitSurveyService.getExitSurveys();
      setExitSurveys(data);
    } catch (error: any) {
      const message = (error as Error).message || 'Failed to load exit surveys';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadFinalSettlements = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await FinalSettlementService.getFinalSettlements();
      setFinalSettlements(data);
    } catch (error: any) {
      const message = (error as Error).message || 'Failed to load final settlements';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadAlumni = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await AlumniService.getAlumni();
      setAlumni(data);
    } catch (error: any) {
      const message = (error as Error).message || 'Failed to load alumni';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await OffboardingAnalyticsService.getMetrics();
      setMetrics(data);
    } catch (error: any) {
      const message = (error as Error).message || 'Failed to load metrics';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await OffboardingSettingsService.getSettings();
      setSettings(data);
    } catch (error: any) {
      const message = (error as Error).message || 'Failed to load settings';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadAllData = useCallback(async () => {
    await Promise.all([
      loadResignations(),
      loadTerminations(),
      loadInstances(),
      loadKnowledgeTransfers(),
      loadExitInterviews(),
      loadExitSurveys(),
      loadFinalSettlements(),
      loadAlumni(),
      loadMetrics(),
      loadSettings(),
    ]);
  }, [
    loadResignations,
    loadTerminations,
    loadInstances,
    loadKnowledgeTransfers,
    loadExitInterviews,
    loadExitSurveys,
    loadFinalSettlements,
    loadAlumni,
    loadMetrics,
    loadSettings,
  ]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Resignation methods
  const submitResignation = useCallback(
    async (resignation: ResignationLetter) => {
      try {
        setIsSaving(true);
        const created = await ResignationService.submitResignation(resignation);
        setResignations((prev) => [...prev, created]);
        toast.success('Resignation submitted successfully');
        return created;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to submit resignation';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  const acceptResignation = useCallback(
    async (id: string, acceptedBy: string) => {
      try {
        setIsSaving(true);
        const updated = await ResignationService.acceptResignation(id, acceptedBy);
        setResignations((prev) => prev.map((r) => (r.id === id ? updated : r)));
        await loadMetrics();
        toast.success('Resignation accepted');
        return updated;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to accept resignation';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast, loadMetrics]
  );

  const makeCounterOffer = useCallback(
    async (id: string, reviewedBy: string, counterOfferDetails: string) => {
      try {
        setIsSaving(true);
        const updated = await ResignationService.makeCounterOffer(id, reviewedBy, counterOfferDetails);
        setResignations((prev) => prev.map((r) => (r.id === id ? updated : r)));
        toast.success('Counter offer made');
        return updated;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to make counter offer';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  const withdrawResignation = useCallback(
    async (id: string, reason: string) => {
      try {
        setIsSaving(true);
        const updated = await ResignationService.withdrawResignation(id, reason);
        setResignations((prev) => prev.map((r) => (r.id === id ? updated : r)));
        toast.success('Resignation withdrawn');
        return updated;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to withdraw resignation';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  // Termination methods
  const createTermination = useCallback(
    async (termination: TerminationNotice) => {
      try {
        setIsSaving(true);
        const created = await TerminationService.createTermination(termination);
        setTerminations((prev) => [...prev, created]);
        toast.success('Termination notice created');
        return created;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to create termination';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  // Offboarding instance methods
  const createInstance = useCallback(
    async (instance: OffboardingInstance) => {
      try {
        setIsSaving(true);
        const created = await OffboardingInstanceService.createInstance(instance);
        setInstances((prev) => [...prev, created]);
        await loadMetrics();
        toast.success('Offboarding instance created');
        return created;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to create instance';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast, loadMetrics]
  );

  const updateInstance = useCallback(
    async (id: string, updates: Partial<OffboardingInstance>) => {
      try {
        setIsSaving(true);
        const updated = await OffboardingInstanceService.updateInstance(id, updates);
        setInstances((prev) => prev.map((i) => (i.id === id ? updated : i)));
        toast.success('Instance updated');
        return updated;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to update instance';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  const startOffboarding = useCallback(
    async (id: string) => {
      try {
        setIsSaving(true);
        const started = await OffboardingInstanceService.startOffboarding(id);
        setInstances((prev) => prev.map((i) => (i.id === id ? started : i)));
        await loadMetrics();
        toast.success('Offboarding started');
        return started;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to start offboarding';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast, loadMetrics]
  );

  const completeOffboarding = useCallback(
    async (id: string) => {
      try {
        setIsSaving(true);
        const completed = await OffboardingInstanceService.completeOffboarding(id);
        setInstances((prev) => prev.map((i) => (i.id === id ? completed : i)));
        await loadMetrics();
        toast.success('Offboarding completed');
        return completed;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to complete offboarding';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast, loadMetrics]
  );

  const cancelOffboarding = useCallback(
    async (id: string, reason: string) => {
      try {
        setIsSaving(true);
        const cancelled = await OffboardingInstanceService.cancelOffboarding(id, reason);
        setInstances((prev) => prev.map((i) => (i.id === id ? cancelled : i)));
        await loadMetrics();
        toast.success('Offboarding cancelled');
        return cancelled;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to cancel offboarding';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast, loadMetrics]
  );

  // Task methods
  const updateTaskStatus = useCallback(
    async (
      instanceId: string,
      taskId: string,
      status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled' | 'not_applicable',
      completedBy?: string
    ) => {
      try {
        setIsSaving(true);
        const updated = await OffboardingTaskService.updateTaskStatus(instanceId, taskId, status, completedBy);
        setInstances((prev) => prev.map((i) => (i.id === instanceId ? updated : i)));
        await loadMetrics();
        toast.success('Task status updated');
        return updated;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to update task status';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast, loadMetrics]
  );

  // Equipment return methods
  const markEquipmentReturned = useCallback(
    async (
      instanceId: string,
      equipmentId: string,
      receivedBy: string,
      condition: 'good' | 'fair' | 'damaged' | 'lost',
      conditionNotes?: string
    ) => {
      try {
        setIsSaving(true);
        const updated = await EquipmentReturnService.markReturned(instanceId, equipmentId, receivedBy, condition, conditionNotes);
        setInstances((prev) => prev.map((i) => (i.id === instanceId ? updated : i)));
        toast.success('Equipment return recorded');
        return updated;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to record equipment return';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  // Access revocation methods
  const revokeAccess = useCallback(
    async (instanceId: string, accessId: string, revokedBy: string) => {
      try {
        setIsSaving(true);
        const updated = await AccessRevocationService.revokeAccess(instanceId, accessId, revokedBy);
        setInstances((prev) => prev.map((i) => (i.id === instanceId ? updated : i)));
        toast.success('Access revoked');
        return updated;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to revoke access';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  // Clearance methods
  const clearDepartment = useCallback(
    async (instanceId: string, clearanceId: string, clearedBy: string, comments?: string) => {
      try {
        setIsSaving(true);
        const updated = await ClearanceService.clearDepartment(instanceId, clearanceId, clearedBy, comments);
        setInstances((prev) => prev.map((i) => (i.id === instanceId ? updated : i)));
        toast.success('Department clearance completed');
        return updated;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to clear department';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  // Knowledge transfer methods
  const createKnowledgeTransfer = useCallback(
    async (transfer: KnowledgeTransfer) => {
      try {
        setIsSaving(true);
        const created = await KnowledgeTransferService.createKnowledgeTransfer(transfer);
        setKnowledgeTransfers((prev) => [...prev, created]);
        toast.success('Knowledge transfer created');
        return created;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to create knowledge transfer';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  const addKnowledgeTransferSession = useCallback(
    async (id: string, session: KnowledgeTransferSession) => {
      try {
        setIsSaving(true);
        const updated = await KnowledgeTransferService.addSession(id, session);
        setKnowledgeTransfers((prev) => prev.map((t) => (t.id === id ? updated : t)));
        toast.success('Knowledge transfer session added');
        return updated;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to add session';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  // Exit interview methods
  const createExitInterview = useCallback(
    async (interview: ExitInterview) => {
      try {
        setIsSaving(true);
        const created = await ExitInterviewService.createExitInterview(interview);
        setExitInterviews((prev) => [...prev, created]);
        toast.success('Exit interview scheduled');
        return created;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to create exit interview';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  const completeExitInterview = useCallback(
    async (id: string, conductedBy: string) => {
      try {
        setIsSaving(true);
        const completed = await ExitInterviewService.completeInterview(id, conductedBy);
        setExitInterviews((prev) => prev.map((i) => (i.id === id ? completed : i)));
        toast.success('Exit interview completed');
        return completed;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to complete exit interview';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  // Exit survey methods
  const submitExitSurvey = useCallback(
    async (
      id: string,
      answers: ExitSurvey['questions'],
      overallRating?: number,
      wouldReturn?: boolean,
      wouldRecommend?: boolean,
      comments?: string
    ) => {
      try {
        setIsSaving(true);
        const submitted = await ExitSurveyService.submitSurvey(id, answers, overallRating, wouldReturn, wouldRecommend, comments);
        setExitSurveys((prev) => prev.map((s) => (s.id === id ? submitted : s)));
        await loadMetrics();
        toast.success('Exit survey submitted');
        return submitted;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to submit exit survey';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast, loadMetrics]
  );

  // Final settlement methods
  const createFinalSettlement = useCallback(
    async (settlement: FinalSettlement) => {
      try {
        setIsSaving(true);
        const created = await FinalSettlementService.createFinalSettlement(settlement);
        setFinalSettlements((prev) => [...prev, created]);
        toast.success('Final settlement created');
        return created;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to create final settlement';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  const approveSettlement = useCallback(
    async (id: string, approvedBy: string) => {
      try {
        setIsSaving(true);
        const approved = await FinalSettlementService.approveSettlement(id, approvedBy);
        setFinalSettlements((prev) => prev.map((s) => (s.id === id ? approved : s)));
        toast.success('Final settlement approved');
        return approved;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to approve settlement';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  const markSettlementPaid = useCallback(
    async (id: string, paidBy: string, paymentReference: string) => {
      try {
        setIsSaving(true);
        const paid = await FinalSettlementService.markPaid(id, paidBy, paymentReference);
        setFinalSettlements((prev) => prev.map((s) => (s.id === id ? paid : s)));
        toast.success('Final settlement marked as paid');
        return paid;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to mark settlement as paid';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  // Alumni methods
  const createAlumniRecord = useCallback(
    async (record: AlumniRecord) => {
      try {
        setIsSaving(true);
        const created = await AlumniService.createAlumniRecord(record);
        setAlumni((prev) => [...prev, created]);
        toast.success('Alumni record created');
        return created;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to create alumni record';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  const updateAlumniRecord = useCallback(
    async (id: string, updates: Partial<AlumniRecord>) => {
      try {
        setIsSaving(true);
        const updated = await AlumniService.updateAlumniRecord(id, updates);
        setAlumni((prev) => prev.map((a) => (a.id === id ? updated : a)));
        toast.success('Alumni record updated');
        return updated;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to update alumni record';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  // Settings methods
  const updateSettings = useCallback(
    async (updates: Partial<OffboardingSettings>) => {
      try {
        setIsSaving(true);
        const updated = await OffboardingSettingsService.updateSettings(updates);
        setSettings(updated);
        toast.success('Settings updated');
        return updated;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to update settings';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  // Return
  return {
    // State
    resignations,
    terminations,
    instances,
    knowledgeTransfers,
    exitInterviews,
    exitSurveys,
    finalSettlements,
    alumni,
    metrics,
    settings,
    isLoading,
    isSaving,
    error,

    // Data loading
    loadResignations,
    loadTerminations,
    loadInstances,
    loadKnowledgeTransfers,
    loadExitInterviews,
    loadExitSurveys,
    loadFinalSettlements,
    loadAlumni,
    loadMetrics,
    loadSettings,
    loadAllData,

    // Resignation
    submitResignation,
    acceptResignation,
    makeCounterOffer,
    withdrawResignation,

    // Termination
    createTermination,

    // Offboarding instance
    createInstance,
    updateInstance,
    startOffboarding,
    completeOffboarding,
    cancelOffboarding,

    // Task
    updateTaskStatus,

    // Equipment
    markEquipmentReturned,

    // Access
    revokeAccess,

    // Clearance
    clearDepartment,

    // Knowledge transfer
    createKnowledgeTransfer,
    addKnowledgeTransferSession,

    // Exit interview
    createExitInterview,
    completeExitInterview,

    // Exit survey
    submitExitSurvey,

    // Final settlement
    createFinalSettlement,
    approveSettlement,
    markSettlementPaid,

    // Alumni
    createAlumniRecord,
    updateAlumniRecord,

    // Settings
    updateSettings,
  };
};
