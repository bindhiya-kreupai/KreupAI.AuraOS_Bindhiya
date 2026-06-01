/**
 * Performance Review Module - Main Hook
 * Comprehensive business logic hook for performance management
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    PerformanceReviewService, ReviewCycleService, GoalService,
    CompetencyService, DevelopmentPlanService, PerformanceAnalyticsService
} from '../services';
import {
    generateSampleReviewCycles, generateSampleReviews, generateSampleGoals,
    generateSampleCompetencies, generateSampleDevelopmentPlans
} from '../data';
import type { PerformanceReview, ReviewCycle, Goal, Competency, DevelopmentPlan, PerformanceStats } from '../types';
import { useToast } from './useToast';

export const usePerformance = () => {
    const [reviews, setReviews] = useState<PerformanceReview[]>([]);
    const [cycles, setCycles] = useState<ReviewCycle[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [competencies, setCompetencies] = useState<Competency[]>([]);
    const [devPlans, setDevPlans] = useState<DevelopmentPlan[]>([]);
    const [stats, setStats] = useState<PerformanceStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const toast = useToast();

    useEffect(() => {
        const initializeData = async () => {
            try {
                setIsLoading(true);
                const [reviewsData, cyclesData, goalsData, competenciesData, plansData] = await Promise.all([
                    PerformanceReviewService.getReviews(),
                    ReviewCycleService.getCycles(),
                    GoalService.getGoals(),
                    CompetencyService.getCompetencies(),
                    DevelopmentPlanService.getPlans(),
                ]);

                if (cyclesData.length === 0) {
                    const sampleCycles = generateSampleReviewCycles();
                    for (const cycle of sampleCycles) await ReviewCycleService.createCycle(cycle);
                    setCycles(sampleCycles);
                } else setCycles(cyclesData);

                if (reviewsData.length === 0) {
                    const sampleReviews = generateSampleReviews();
                    for (const review of sampleReviews) await PerformanceReviewService.createReview(review);
                    setReviews(sampleReviews);
                } else setReviews(reviewsData);

                if (goalsData.length === 0) {
                    const sampleGoals = generateSampleGoals();
                    for (const goal of sampleGoals) await GoalService.createGoal(goal);
                    setGoals(sampleGoals);
                } else setGoals(goalsData);

                if (competenciesData.length === 0) {
                    const sampleCompetencies = generateSampleCompetencies();
                    for (const competency of sampleCompetencies) await CompetencyService.createCompetency(competency);
                    setCompetencies(sampleCompetencies);
                } else setCompetencies(competenciesData);

                if (plansData.length === 0) {
                    const samplePlans = generateSampleDevelopmentPlans();
                    for (const plan of samplePlans) await DevelopmentPlanService.createPlan(plan);
                    setDevPlans(samplePlans);
                } else setDevPlans(plansData);

                const statsData = await PerformanceAnalyticsService.getStats();
                setStats(statsData);
            } catch (error: any) {
                console.error('Failed to initialize performance data:', error);
                toast.error('Failed to load performance data');
            } finally {
                setIsLoading(false);
            }
        };
        initializeData();
    }, []);

    const createReview = useCallback(async (review: PerformanceReview) => {
        try {
            setIsSaving(true);
            const created = await PerformanceReviewService.createReview(review);
            setReviews(prev => [...prev, created]);
            toast.success('Performance review created successfully!');
            return created;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to create review');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const updateReview = useCallback(async (id: string, updates: Partial<PerformanceReview>) => {
        try {
            setIsSaving(true);
            const updated = await PerformanceReviewService.updateReview(id, updates);
            setReviews(prev => prev.map(r => r.id === id ? updated : r));
            toast.success('Review updated successfully!');
            return updated;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to update review');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const submitReview = useCallback(async (id: string) => {
        try {
            setIsSaving(true);
            const updated = await PerformanceReviewService.submitReview(id);
            setReviews(prev => prev.map(r => r.id === id ? updated : r));
            toast.success('Review submitted successfully!');
            return updated;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to submit review');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const createGoal = useCallback(async (goal: Goal) => {
        try {
            setIsSaving(true);
            const created = await GoalService.createGoal(goal);
            setGoals(prev => [...prev, created]);
            toast.success('Goal created successfully!');
            return created;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to create goal');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const updateGoal = useCallback(async (id: string, updates: Partial<Goal>) => {
        try {
            setIsSaving(true);
            const updated = await GoalService.updateGoal(id, updates);
            setGoals(prev => prev.map(g => g.id === id ? updated : g));
            toast.success('Goal updated successfully!');
            return updated;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to update goal');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const createDevelopmentPlan = useCallback(async (plan: DevelopmentPlan) => {
        try {
            setIsSaving(true);
            const created = await DevelopmentPlanService.createPlan(plan);
            setDevPlans(prev => [...prev, created]);
            toast.success('Development plan created successfully!');
            return created;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to create development plan');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const refreshStats = useCallback(async () => {
        try {
            const statsData = await PerformanceAnalyticsService.getStats();
            setStats(statsData);
            return statsData;
        } catch (error: any) {
            toast.error('Failed to refresh statistics');
            throw error;
        }
    }, [toast]);

    return {
        reviews, cycles, goals, competencies, devPlans, stats,
        isLoading, isSaving,
        createReview, updateReview, submitReview,
        createGoal, updateGoal,
        createDevelopmentPlan,
        refreshStats,
    };
};
