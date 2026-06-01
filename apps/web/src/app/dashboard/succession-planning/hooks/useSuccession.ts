/**
 * Succession Planning Module - Business Logic Hook
 * 
 * Comprehensive hook providing:
 * - State management for all succession planning entities
 * - CRUD operations (30+ methods)
 * - Loading states and error handling
 * - Toast notifications
 * - Business logic for succession planning workflows
 */

import { useState, useEffect, useCallback } from 'react';
import type {
    CriticalPosition,
    SuccessionCandidate,
    SuccessionPool,
    DevelopmentPlan,
    TalentReview,
    CareerPath,
    EmergencySuccession,
    SuccessionMetrics,
    SuccessionRiskAnalysis,
    SuccessionSettings,
    DevelopmentActivity,
    ReadinessLevel} from '../types';
import {
    Toast,
    CandidateStatus
} from '../types';
import {
    CriticalPositionService,
    SuccessionCandidateService,
    SuccessionPoolService,
    DevelopmentPlanService,
    TalentReviewService,
    CareerPathService,
    EmergencySuccessionService,
    SuccessionAnalyticsService,
    SuccessionSettingsService,
} from '../services';
import { useToast } from './useToast';

export const useSuccession = () => {
    // State
    const [criticalPositions, setCriticalPositions] = useState<CriticalPosition[]>([]);
    const [candidates, setCandidates] = useState<SuccessionCandidate[]>([]);
    const [pools, setPools] = useState<SuccessionPool[]>([]);
    const [developmentPlans, setDevelopmentPlans] = useState<DevelopmentPlan[]>([]);
    const [talentReviews, setTalentReviews] = useState<TalentReview[]>([]);
    const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
    const [emergencyPlans, setEmergencyPlans] = useState<EmergencySuccession[]>([]);
    const [metrics, setMetrics] = useState<SuccessionMetrics | null>(null);
    const [riskAnalysis, setRiskAnalysis] = useState<SuccessionRiskAnalysis[]>([]);
    const [settings, setSettings] = useState<SuccessionSettings | null>(null);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const toast = useToast();

    // Load all data on mount
    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        try {
            setIsLoading(true);
            const [
                positionsData,
                candidatesData,
                poolsData,
                plansData,
                reviewsData,
                pathsData,
                emergencyData,
                metricsData,
                riskData,
                settingsData,
            ] = await Promise.all([
                CriticalPositionService.getPositions(),
                SuccessionCandidateService.getCandidates(),
                SuccessionPoolService.getPools(),
                DevelopmentPlanService.getPlans(),
                TalentReviewService.getReviews(),
                CareerPathService.getPaths(),
                EmergencySuccessionService.getPlans(),
                SuccessionAnalyticsService.getMetrics(),
                SuccessionAnalyticsService.getRiskAnalysis(),
                SuccessionSettingsService.getSettings(),
            ]);

            setCriticalPositions(positionsData);
            setCandidates(candidatesData);
            setPools(poolsData);
            setDevelopmentPlans(plansData);
            setTalentReviews(reviewsData);
            setCareerPaths(pathsData);
            setEmergencyPlans(emergencyData);
            setMetrics(metricsData);
            setRiskAnalysis(riskData);
            setSettings(settingsData);
        } catch (error) {
            toast.error('Failed to load succession planning data');
            console.error('Load error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Critical Positions
    const createCriticalPosition = useCallback(async (data: CriticalPosition) => {
        try {
            setIsSaving(true);
            const created = await CriticalPositionService.createPosition(data);
            setCriticalPositions(prev => [...prev, created]);
            toast.success('Critical position created successfully');
            return created;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to create position');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const updateCriticalPosition = useCallback(async (id: string, updates: Partial<CriticalPosition>) => {
        try {
            setIsSaving(true);
            const updated = await CriticalPositionService.updatePosition(id, updates);
            setCriticalPositions(prev => prev.map(p => p.id === id ? updated : p));
            toast.success('Critical position updated successfully');
            return updated;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to update position');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const deleteCriticalPosition = useCallback(async (id: string) => {
        try {
            setIsSaving(true);
            await CriticalPositionService.deletePosition(id);
            setCriticalPositions(prev => prev.filter(p => p.id !== id));
            toast.success('Critical position deleted successfully');
        } catch (error) {
            toast.error((error as Error).message || 'Failed to delete position');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // Succession Candidates
    const createCandidate = useCallback(async (data: SuccessionCandidate) => {
        try {
            setIsSaving(true);
            const created = await SuccessionCandidateService.createCandidate(data);
            setCandidates(prev => [...prev, created]);
            
            // Refresh metrics after adding candidate
            const updatedMetrics = await SuccessionAnalyticsService.getMetrics();
            setMetrics(updatedMetrics);
            
            toast.success('Succession candidate added successfully');
            return created;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to create candidate');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const updateCandidate = useCallback(async (id: string, updates: Partial<SuccessionCandidate>) => {
        try {
            setIsSaving(true);
            const updated = await SuccessionCandidateService.updateCandidate(id, updates);
            setCandidates(prev => prev.map(c => c.id === id ? updated : c));
            toast.success('Candidate updated successfully');
            return updated;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to update candidate');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const approveCandidate = useCallback(async (id: string, approvedBy: string) => {
        try {
            setIsSaving(true);
            const approved = await SuccessionCandidateService.approveCandidate(id, approvedBy);
            setCandidates(prev => prev.map(c => c.id === id ? approved : c));
            
            // Refresh metrics
            const updatedMetrics = await SuccessionAnalyticsService.getMetrics();
            setMetrics(updatedMetrics);
            
            toast.success('Candidate approved successfully');
            return approved;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to approve candidate');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const updateReadinessLevel = useCallback(async (id: string, readinessLevel: ReadinessLevel, readinessDate?: string) => {
        try {
            setIsSaving(true);
            const updated = await SuccessionCandidateService.updateReadinessLevel(id, readinessLevel, readinessDate);
            setCandidates(prev => prev.map(c => c.id === id ? updated : c));
            
            // Refresh metrics
            const updatedMetrics = await SuccessionAnalyticsService.getMetrics();
            setMetrics(updatedMetrics);
            
            toast.success('Readiness level updated successfully');
            return updated;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to update readiness level');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const deleteCandidate = useCallback(async (id: string) => {
        try {
            setIsSaving(true);
            await SuccessionCandidateService.getCandidates(id);
            setCandidates(prev => prev.filter(c => c.id !== id));
            
            // Refresh metrics
            const updatedMetrics = await SuccessionAnalyticsService.getMetrics();
            setMetrics(updatedMetrics);
            
            toast.success('Candidate removed successfully');
        } catch (error) {
            toast.error((error as Error).message || 'Failed to delete candidate');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // Succession Pools
    const createPool = useCallback(async (data: SuccessionPool) => {
        try {
            setIsSaving(true);
            const created = await SuccessionPoolService.createPool(data);
            setPools(prev => [...prev, created]);
            toast.success('Succession pool created successfully');
            return created;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to create pool');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const updatePool = useCallback(async (id: string, updates: Partial<SuccessionPool>) => {
        try {
            setIsSaving(true);
            const updated = await SuccessionPoolService.updatePool(id, updates);
            setPools(prev => prev.map(p => p.id === id ? updated : p));
            toast.success('Pool updated successfully');
            return updated;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to update pool');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const addCandidateToPool = useCallback(async (poolId: string, candidateId: string) => {
        try {
            setIsSaving(true);
            const updated = await SuccessionPoolService.addCandidate(poolId, candidateId);
            setPools(prev => prev.map(p => p.id === poolId ? updated : p));
            toast.success('Candidate added to pool');
            return updated;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to add candidate to pool');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const removeCandidateFromPool = useCallback(async (poolId: string, candidateId: string) => {
        try {
            setIsSaving(true);
            const updated = await SuccessionPoolService.removeCandidate(poolId, candidateId);
            setPools(prev => prev.map(p => p.id === poolId ? updated : p));
            toast.success('Candidate removed from pool');
            return updated;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to remove candidate from pool');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const deletePool = useCallback(async (id: string) => {
        try {
            setIsSaving(true);
            await SuccessionPoolService.deletePool(id);
            setPools(prev => prev.filter(p => p.id !== id));
            toast.success('Pool deleted successfully');
        } catch (error) {
            toast.error((error as Error).message || 'Failed to delete pool');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // Development Plans
    const createDevelopmentPlan = useCallback(async (data: DevelopmentPlan) => {
        try {
            setIsSaving(true);
            const created = await DevelopmentPlanService.createPlan(data);
            setDevelopmentPlans(prev => [...prev, created]);
            toast.success('Development plan created successfully');
            return created;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to create development plan');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const updateDevelopmentPlan = useCallback(async (id: string, updates: Partial<DevelopmentPlan>) => {
        try {
            setIsSaving(true);
            const updated = await DevelopmentPlanService.updatePlan(id, updates);
            setDevelopmentPlans(prev => prev.map(p => p.id === id ? updated : p));
            toast.success('Development plan updated successfully');
            return updated;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to update development plan');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const addDevelopmentActivity = useCallback(async (planId: string, activity: DevelopmentActivity) => {
        try {
            setIsSaving(true);
            const updated = await DevelopmentPlanService.addActivity(planId, activity);
            setDevelopmentPlans(prev => prev.map(p => p.id === planId ? updated : p));
            toast.success('Activity added successfully');
            return updated;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to add activity');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const updateActivityProgress = useCallback(async (planId: string, activityId: string, progress: number) => {
        try {
            setIsSaving(true);
            const updated = await DevelopmentPlanService.updateActivityProgress(planId, activityId, progress);
            setDevelopmentPlans(prev => prev.map(p => p.id === planId ? updated : p));
            toast.success('Activity progress updated');
            return updated;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to update activity progress');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const deleteDevelopmentPlan = useCallback(async (id: string) => {
        try {
            setIsSaving(true);
            await DevelopmentPlanService.deletePlan(id);
            setDevelopmentPlans(prev => prev.filter(p => p.id !== id));
            toast.success('Development plan deleted successfully');
        } catch (error) {
            toast.error((error as Error).message || 'Failed to delete development plan');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // Talent Reviews
    const createTalentReview = useCallback(async (data: TalentReview) => {
        try {
            setIsSaving(true);
            const created = await TalentReviewService.createReview(data);
            setTalentReviews(prev => [...prev, created]);
            toast.success('Talent review created successfully');
            return created;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to create talent review');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const updateTalentReview = useCallback(async (id: string, updates: Partial<TalentReview>) => {
        try {
            setIsSaving(true);
            const updated = await TalentReviewService.updateReview(id, updates);
            setTalentReviews(prev => prev.map(r => r.id === id ? updated : r));
            toast.success('Talent review updated successfully');
            return updated;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to update talent review');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const completeTalentReview = useCallback(async (id: string) => {
        try {
            setIsSaving(true);
            const completed = await TalentReviewService.completeReview(id);
            setTalentReviews(prev => prev.map(r => r.id === id ? completed : r));
            toast.success('Talent review completed successfully');
            return completed;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to complete talent review');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const deleteTalentReview = useCallback(async (id: string) => {
        try {
            setIsSaving(true);
            await TalentReviewService.deleteReview(id);
            setTalentReviews(prev => prev.filter(r => r.id !== id));
            toast.success('Talent review deleted successfully');
        } catch (error) {
            toast.error((error as Error).message || 'Failed to delete talent review');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // Career Paths
    const createCareerPath = useCallback(async (data: CareerPath) => {
        try {
            setIsSaving(true);
            const created = await CareerPathService.createPath(data);
            setCareerPaths(prev => [...prev, created]);
            toast.success('Career path created successfully');
            return created;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to create career path');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const updateCareerPath = useCallback(async (id: string, updates: Partial<CareerPath>) => {
        try {
            setIsSaving(true);
            const updated = await CareerPathService.updatePath(id, updates);
            setCareerPaths(prev => prev.map(p => p.id === id ? updated : p));
            toast.success('Career path updated successfully');
            return updated;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to update career path');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const deleteCareerPath = useCallback(async (id: string) => {
        try {
            setIsSaving(true);
            await CareerPathService.deletePath(id);
            setCareerPaths(prev => prev.filter(p => p.id !== id));
            toast.success('Career path deleted successfully');
        } catch (error) {
            toast.error((error as Error).message || 'Failed to delete career path');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // Emergency Succession Plans
    const createEmergencyPlan = useCallback(async (data: EmergencySuccession) => {
        try {
            setIsSaving(true);
            const created = await EmergencySuccessionService.createPlan(data);
            setEmergencyPlans(prev => [...prev, created]);
            toast.success('Emergency succession plan created successfully');
            return created;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to create emergency plan');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const updateEmergencyPlan = useCallback(async (id: string, updates: Partial<EmergencySuccession>) => {
        try {
            setIsSaving(true);
            const updated = await EmergencySuccessionService.updatePlan(id, updates);
            setEmergencyPlans(prev => prev.map(p => p.id === id ? updated : p));
            toast.success('Emergency plan updated successfully');
            return updated;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to update emergency plan');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const testEmergencyPlan = useCallback(async (id: string) => {
        try {
            setIsSaving(true);
            const tested = await EmergencySuccessionService.testPlan(id);
            setEmergencyPlans(prev => prev.map(p => p.id === id ? tested : p));
            toast.success('Emergency plan test recorded successfully');
            return tested;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to test emergency plan');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const deleteEmergencyPlan = useCallback(async (id: string) => {
        try {
            setIsSaving(true);
            await EmergencySuccessionService.deletePlan(id);
            setEmergencyPlans(prev => prev.filter(p => p.id !== id));
            toast.success('Emergency plan deleted successfully');
        } catch (error) {
            toast.error((error as Error).message || 'Failed to delete emergency plan');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // Analytics and Settings
    const refreshMetrics = useCallback(async () => {
        try {
            const updatedMetrics = await SuccessionAnalyticsService.getMetrics();
            setMetrics(updatedMetrics);
        } catch (error) {
            toast.error('Failed to refresh metrics');
            throw error;
        }
    }, [toast]);

    const refreshRiskAnalysis = useCallback(async () => {
        try {
            const updatedRisk = await SuccessionAnalyticsService.getRiskAnalysis();
            setRiskAnalysis(updatedRisk);
        } catch (error) {
            toast.error('Failed to refresh risk analysis');
            throw error;
        }
    }, [toast]);

    const updateSettings = useCallback(async (updates: Partial<SuccessionSettings>) => {
        try {
            setIsSaving(true);
            const updated = await SuccessionSettingsService.updateSettings(updates);
            setSettings(updated);
            toast.success('Settings updated successfully');
            return updated;
        } catch (error) {
            toast.error((error as Error).message || 'Failed to update settings');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // Utility methods
    const getCandidatesForPosition = useCallback((positionId: string) => {
        return candidates.filter(c => c.targetPositionId === positionId);
    }, [candidates]);

    const getReadyCandidates = useCallback(() => {
        return candidates.filter(c => 
            c.status === 'ready' && 
            (c.readinessLevel === 'ready_now' || c.readinessLevel === 'ready_1_year')
        );
    }, [candidates]);

    const getHighRiskPositions = useCallback(() => {
        return criticalPositions.filter(p => p.vacancyRisk === 'high');
    }, [criticalPositions]);

    const getActiveDevelopmentPlans = useCallback(() => {
        return developmentPlans.filter(p => p.status === 'active');
    }, [developmentPlans]);

    return {
        // State
        criticalPositions,
        candidates,
        pools,
        developmentPlans,
        talentReviews,
        careerPaths,
        emergencyPlans,
        metrics,
        riskAnalysis,
        settings,
        isLoading,
        isSaving,

        // Critical Position methods
        createCriticalPosition,
        updateCriticalPosition,
        deleteCriticalPosition,

        // Candidate methods
        createCandidate,
        updateCandidate,
        approveCandidate,
        updateReadinessLevel,
        deleteCandidate,

        // Pool methods
        createPool,
        updatePool,
        addCandidateToPool,
        removeCandidateFromPool,
        deletePool,

        // Development Plan methods
        createDevelopmentPlan,
        updateDevelopmentPlan,
        addDevelopmentActivity,
        updateActivityProgress,
        deleteDevelopmentPlan,

        // Talent Review methods
        createTalentReview,
        updateTalentReview,
        completeTalentReview,
        deleteTalentReview,

        // Career Path methods
        createCareerPath,
        updateCareerPath,
        deleteCareerPath,

        // Emergency Plan methods
        createEmergencyPlan,
        updateEmergencyPlan,
        testEmergencyPlan,
        deleteEmergencyPlan,

        // Analytics methods
        refreshMetrics,
        refreshRiskAnalysis,
        updateSettings,

        // Utility methods
        getCandidatesForPosition,
        getReadyCandidates,
        getHighRiskPositions,
        getActiveDevelopmentPlans,

        // Reload all data
        loadAllData,
    };
};
