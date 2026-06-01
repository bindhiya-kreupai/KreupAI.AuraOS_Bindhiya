// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
/**
 * Benefits Management Module - Main Hook
 *
 * Comprehensive business logic hook for benefits management.
 * Manages state and operations for all benefit entities.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    BenefitPlanService,
    EnrollmentService,
    EnrollmentWindowService,
    DependentService,
    ClaimService,
    ProviderService,
    QualifyingEventService,
    PremiumService,
    EligibilityService,
    BenefitSettingsService,
    BenefitAnalyticsService,
} from '../services';
import {
    generateSampleBenefitPlans,
    generateSampleEnrollmentWindows,
    generateSampleEnrollments,
    generateSampleDependents,
    generateSampleClaims,
    generateSampleProviders,
    generateSampleQualifyingEvents,
    generateSamplePremiumDeductions,
    generateSampleSettings,
} from '../data';
import type {
    BenefitPlan,
    BenefitEnrollment,
    EnrollmentWindow,
    Dependent,
    BenefitClaim,
    HealthcareProvider,
    QualifyingEvent,
    PremiumDeduction,
    BenefitSettings,
    BenefitStats,
} from '../types';
import { useToast } from './useToast';

/**
 * Main hook for benefits management
 */
export const useBenefits = () => {
    // State
    const [benefitPlans, setBenefitPlans] = useState<BenefitPlan[]>([]);
    const [enrollments, setEnrollments] = useState<BenefitEnrollment[]>([]);
    const [enrollmentWindows, setEnrollmentWindows] = useState<EnrollmentWindow[]>([]);
    const [dependents, setDependents] = useState<Dependent[]>([]);
    const [claims, setClaims] = useState<BenefitClaim[]>([]);
    const [providers, setProviders] = useState<HealthcareProvider[]>([]);
    const [qualifyingEvents, setQualifyingEvents] = useState<QualifyingEvent[]>([]);
    const [premiumDeductions, setPremiumDeductions] = useState<PremiumDeduction[]>([]);
    const [settings, setSettings] = useState<BenefitSettings | null>(null);
    const [stats, setStats] = useState<BenefitStats | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const toast = useToast();

    // Initialize data
    useEffect(() => {
        const initializeData = async () => {
            try {
                setIsLoading(true);

                // Load or initialize data
                const [
                    plansData,
                    enrollmentsData,
                    windowsData,
                    dependentsData,
                    claimsData,
                    providersData,
                    eventsData,
                    deductionsData,
                    settingsData,
                ] = await Promise.all([
                    BenefitPlanService.getPlans(),
                    EnrollmentService.getEnrollments(),
                    EnrollmentWindowService.getWindows(),
                    DependentService.getDependents(),
                    ClaimService.getClaims(),
                    ProviderService.getProviders(),
                    QualifyingEventService.getEvents(),
                    PremiumService.getDeductions(),
                    BenefitSettingsService.getSettings(),
                ]);

                // If no data, initialize with samples
                if (plansData.length === 0) {
                    const samplePlans = generateSampleBenefitPlans();
                    for (const plan of samplePlans) {
                        await BenefitPlanService.createPlan(plan);
                    }
                    setBenefitPlans(samplePlans);
                } else {
                    setBenefitPlans(plansData);
                }

                if (windowsData.length === 0) {
                    const sampleWindows = generateSampleEnrollmentWindows();
                    for (const window of sampleWindows) {
                        await EnrollmentWindowService.createWindow(window);
                    }
                    setEnrollmentWindows(sampleWindows);
                } else {
                    setEnrollmentWindows(windowsData);
                }

                if (enrollmentsData.length === 0) {
                    const sampleEnrollments = generateSampleEnrollments();
                    for (const enrollment of sampleEnrollments) {
                        await EnrollmentService.createEnrollment(enrollment);
                    }
                    setEnrollments(sampleEnrollments);
                } else {
                    setEnrollments(enrollmentsData);
                }

                if (dependentsData.length === 0) {
                    const sampleDependents = generateSampleDependents();
                    for (const dependent of sampleDependents) {
                        await DependentService.createDependent(dependent);
                    }
                    setDependents(sampleDependents);
                } else {
                    setDependents(dependentsData);
                }

                if (claimsData.length === 0) {
                    const sampleClaims = generateSampleClaims();
                    for (const claim of sampleClaims) {
                        await ClaimService.createClaim(claim);
                    }
                    setClaims(sampleClaims);
                } else {
                    setClaims(claimsData);
                }

                if (providersData.length === 0) {
                    const sampleProviders = generateSampleProviders();
                    setProviders(sampleProviders);
                } else {
                    setProviders(providersData);
                }

                if (eventsData.length === 0) {
                    const sampleEvents = generateSampleQualifyingEvents();
                    for (const event of sampleEvents) {
                        await QualifyingEventService.createEvent(event);
                    }
                    setQualifyingEvents(sampleEvents);
                } else {
                    setQualifyingEvents(eventsData);
                }

                if (deductionsData.length === 0) {
                    const sampleDeductions = generateSamplePremiumDeductions();
                    setPremiumDeductions(sampleDeductions);
                } else {
                    setPremiumDeductions(deductionsData);
                }

                if (!settingsData) {
                    const sampleSettings = generateSampleSettings();
                    await BenefitSettingsService.updateSettings(sampleSettings);
                    setSettings(sampleSettings);
                } else {
                    setSettings(settingsData);
                }

                // Load analytics
                const statsData = await BenefitAnalyticsService.getStats();
                setStats(statsData);
            } catch (error: any) {
                console.error('Failed to initialize benefits data:', error);
                toast.error('Failed to load benefits data');
            } finally {
                setIsLoading(false);
            }
        };

        initializeData();
    }, []);

    // ========================================================================
    // BENEFIT PLANS
    // ========================================================================

    const createBenefitPlan = useCallback(async (plan: BenefitPlan) => {
        try {
            setIsSaving(true);
            const created = await BenefitPlanService.createPlan(plan);
            setBenefitPlans(prev => [...prev, created]);
            toast.success('Benefit plan created successfully!');
            return created;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to create benefit plan');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const updateBenefitPlan = useCallback(async (id: string, updates: Partial<BenefitPlan>) => {
        try {
            setIsSaving(true);
            const updated = await BenefitPlanService.updatePlan(id, updates);
            setBenefitPlans(prev => prev.map(p => p.id === id ? updated : p));
            toast.success('Benefit plan updated successfully!');
            return updated;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to update benefit plan');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const deleteBenefitPlan = useCallback(async (id: string) => {
        try {
            setIsSaving(true);
            await BenefitPlanService.deletePlan(id);
            setBenefitPlans(prev => prev.filter(p => p.id !== id));
            toast.success('Benefit plan deleted successfully!');
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to delete benefit plan');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // ========================================================================
    // ENROLLMENTS
    // ========================================================================

    const createEnrollment = useCallback(async (enrollment: BenefitEnrollment) => {
        try {
            setIsSaving(true);
            const created = await EnrollmentService.createEnrollment(enrollment);
            setEnrollments(prev => [...prev, created]);
            toast.success('Enrollment created successfully!');
            return created;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to create enrollment');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const updateEnrollment = useCallback(async (id: string, updates: Partial<BenefitEnrollment>) => {
        try {
            setIsSaving(true);
            const updated = await EnrollmentService.updateEnrollment(id, updates);
            setEnrollments(prev => prev.map(e => e.id === id ? updated : e));
            toast.success('Enrollment updated successfully!');
            return updated;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to update enrollment');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const submitEnrollment = useCallback(async (id: string) => {
        try {
            setIsSaving(true);
            const updated = await EnrollmentService.submitEnrollment(id);
            setEnrollments(prev => prev.map(e => e.id === id ? updated : e));
            toast.success('Enrollment submitted successfully!');
            return updated;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to submit enrollment');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const confirmEnrollment = useCallback(async (id: string, approvedBy: string) => {
        try {
            setIsSaving(true);
            const updated = await EnrollmentService.confirmEnrollment(id, approvedBy);
            setEnrollments(prev => prev.map(e => e.id === id ? updated : e));
            toast.success('Enrollment confirmed successfully!');
            return updated;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to confirm enrollment');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const cancelEnrollment = useCallback(async (id: string, reason?: string) => {
        try {
            setIsSaving(true);
            const updated = await EnrollmentService.cancelEnrollment(id, reason);
            setEnrollments(prev => prev.map(e => e.id === id ? updated : e));
            toast.success('Enrollment cancelled successfully!');
            return updated;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to cancel enrollment');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const getEmployeeEnrollments = useCallback(async (employeeId: string) => {
        try {
            return await EnrollmentService.getEnrollments({ employeeId });
        } catch (error: any) {
            toast.error('Failed to fetch employee enrollments');
            throw error;
        }
    }, [toast]);

    // ========================================================================
    // ENROLLMENT WINDOWS
    // ========================================================================

    const createEnrollmentWindow = useCallback(async (window: EnrollmentWindow) => {
        try {
            setIsSaving(true);
            const created = await EnrollmentWindowService.createWindow(window);
            setEnrollmentWindows(prev => [...prev, created]);
            toast.success('Enrollment window created successfully!');
            return created;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to create enrollment window');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const updateEnrollmentWindow = useCallback(async (id: string, updates: Partial<EnrollmentWindow>) => {
        try {
            setIsSaving(true);
            const updated = await EnrollmentWindowService.updateWindow(id, updates);
            setEnrollmentWindows(prev => prev.map(w => w.id === id ? updated : w));
            toast.success('Enrollment window updated successfully!');
            return updated;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to update enrollment window');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const getCurrentEnrollmentWindow = useCallback(async () => {
        try {
            return await EnrollmentWindowService.getCurrentWindow();
        } catch (error: any) {
            toast.error('Failed to fetch current enrollment window');
            return null;
        }
    }, [toast]);

    // ========================================================================
    // DEPENDENTS
    // ========================================================================

    const createDependent = useCallback(async (dependent: Dependent) => {
        try {
            setIsSaving(true);
            const created = await DependentService.createDependent(dependent);
            setDependents(prev => [...prev, created]);
            toast.success('Dependent added successfully!');
            return created;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to add dependent');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const updateDependent = useCallback(async (id: string, updates: Partial<Dependent>) => {
        try {
            setIsSaving(true);
            const updated = await DependentService.updateDependent(id, updates);
            setDependents(prev => prev.map(d => d.id === id ? updated : d));
            toast.success('Dependent updated successfully!');
            return updated;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to update dependent');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const verifyDependent = useCallback(async (id: string, verifiedBy: string) => {
        try {
            setIsSaving(true);
            const updated = await DependentService.verifyDependent(id, verifiedBy);
            setDependents(prev => prev.map(d => d.id === id ? updated : d));
            toast.success('Dependent verified successfully!');
            return updated;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to verify dependent');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const deleteDependent = useCallback(async (id: string) => {
        try {
            setIsSaving(true);
            await DependentService.deleteDependent(id);
            setDependents(prev => prev.filter(d => d.id !== id));
            toast.success('Dependent removed successfully!');
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to remove dependent');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const getEmployeeDependents = useCallback(async (employeeId: string) => {
        try {
            return await DependentService.getDependents({ employeeId });
        } catch (error: any) {
            toast.error('Failed to fetch employee dependents');
            throw error;
        }
    }, [toast]);

    // ========================================================================
    // CLAIMS
    // ========================================================================

    const createClaim = useCallback(async (claim: BenefitClaim) => {
        try {
            setIsSaving(true);
            const created = await ClaimService.createClaim(claim);
            setClaims(prev => [...prev, created]);
            toast.success('Claim submitted successfully!');
            return created;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to submit claim');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const updateClaim = useCallback(async (id: string, updates: Partial<BenefitClaim>) => {
        try {
            setIsSaving(true);
            const updated = await ClaimService.updateClaim(id, updates);
            setClaims(prev => prev.map(c => c.id === id ? updated : c));
            toast.success('Claim updated successfully!');
            return updated;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to update claim');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const approveClaim = useCallback(async (id: string, processedBy: string, approvedAmount: number) => {
        try {
            setIsSaving(true);
            const updated = await ClaimService.approveClaim(id, processedBy, approvedAmount);
            setClaims(prev => prev.map(c => c.id === id ? updated : c));
            toast.success('Claim approved successfully!');
            return updated;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to approve claim');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const denyClaim = useCallback(async (id: string, processedBy: string, reason: string) => {
        try {
            setIsSaving(true);
            const updated = await ClaimService.denyClaim(id, processedBy, reason);
            setClaims(prev => prev.map(c => c.id === id ? updated : c));
            toast.success('Claim denied');
            return updated;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to deny claim');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const getEmployeeClaims = useCallback(async (employeeId: string) => {
        try {
            return await ClaimService.getClaims({ employeeId });
        } catch (error: any) {
            toast.error('Failed to fetch employee claims');
            throw error;
        }
    }, [toast]);

    // ========================================================================
    // PROVIDERS
    // ========================================================================

    const searchProviders = useCallback(async (query: string) => {
        try {
            return await ProviderService.searchProviders(query);
        } catch (error: any) {
            toast.error('Failed to search providers');
            throw error;
        }
    }, [toast]);

    // ========================================================================
    // QUALIFYING EVENTS
    // ========================================================================

    const createQualifyingEvent = useCallback(async (event: QualifyingEvent) => {
        try {
            setIsSaving(true);
            const created = await QualifyingEventService.createEvent(event);
            setQualifyingEvents(prev => [...prev, created]);
            toast.success('Qualifying event created successfully!');
            return created;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to create qualifying event');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const verifyQualifyingEvent = useCallback(async (id: string, verifiedBy: string) => {
        try {
            setIsSaving(true);
            const updated = await QualifyingEventService.verifyEvent(id, verifiedBy);
            setQualifyingEvents(prev => prev.map(e => e.id === id ? updated : e));
            toast.success('Qualifying event verified successfully!');
            return updated;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to verify qualifying event');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // ========================================================================
    // PREMIUMS
    // ========================================================================

    const calculatePremium = useCallback(async (enrollmentId: string) => {
        try {
            return await PremiumService.calculatePremium(enrollmentId);
        } catch (error: any) {
            toast.error('Failed to calculate premium');
            throw error;
        }
    }, [toast]);

    // ========================================================================
    // ELIGIBILITY
    // ========================================================================

    const checkEligibility = useCallback(async (employeeId: string, benefitPlanId: string) => {
        try {
            return await EligibilityService.checkEligibility(employeeId, benefitPlanId);
        } catch (error: any) {
            toast.error('Failed to check eligibility');
            throw error;
        }
    }, [toast]);

    // ========================================================================
    // SETTINGS
    // ========================================================================

    const updateSettings = useCallback(async (updates: Partial<BenefitSettings>) => {
        try {
            setIsSaving(true);
            const updated = await BenefitSettingsService.updateSettings(updates);
            setSettings(updated);
            toast.success('Settings updated successfully!');
            return updated;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to update settings');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // ========================================================================
    // ANALYTICS
    // ========================================================================

    const refreshStats = useCallback(async () => {
        try {
            const statsData = await BenefitAnalyticsService.getStats();
            setStats(statsData);
            return statsData;
        } catch (error: any) {
            toast.error('Failed to refresh statistics');
            throw error;
        }
    }, [toast]);

    return {
        // State
        benefitPlans,
        enrollments,
        enrollmentWindows,
        dependents,
        claims,
        providers,
        qualifyingEvents,
        premiumDeductions,
        settings,
        stats,
        isLoading,
        isSaving,

        // Benefit Plans
        createBenefitPlan,
        updateBenefitPlan,
        deleteBenefitPlan,

        // Enrollments
        createEnrollment,
        updateEnrollment,
        submitEnrollment,
        confirmEnrollment,
        cancelEnrollment,
        getEmployeeEnrollments,

        // Enrollment Windows
        createEnrollmentWindow,
        updateEnrollmentWindow,
        getCurrentEnrollmentWindow,

        // Dependents
        createDependent,
        updateDependent,
        verifyDependent,
        deleteDependent,
        getEmployeeDependents,

        // Claims
        createClaim,
        updateClaim,
        approveClaim,
        denyClaim,
        getEmployeeClaims,

        // Providers
        searchProviders,

        // Qualifying Events
        createQualifyingEvent,
        verifyQualifyingEvent,

        // Premiums
        calculatePremium,

        // Eligibility
        checkEligibility,

        // Settings
        updateSettings,

        // Analytics
        refreshStats,
    };
};
