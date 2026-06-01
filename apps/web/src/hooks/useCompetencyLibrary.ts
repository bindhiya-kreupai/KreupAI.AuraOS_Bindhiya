/**
 * @module useCompetencyLibrary
 * @description React hooks for Competency Library data fetching and state management
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    CompetencyService,
    CategoryService,
    FrameworkService,
    JobRoleService,
    AssessmentService,
    GapAnalysisService,
    DevelopmentPlanService
} from '@/services/competency-library.service';
import type {
    Competency,
    CompetencyCategory,
    ProficiencyFramework,
    JobRole,
    SkillAssessment,
    GapAnalysis,
    DevelopmentPlan
} from '@/types/competency-library';

// Generic hook for data fetching with loading and error states
function useAsyncData<T>(
    fetchFn: () => Promise<{ success: boolean; data?: T; error?: string }>,
    deps: any[] = []
) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchFn();
            if (result.success && result.data) {
                setData(result.data);
            } else {
                setError(result.error || 'Failed to fetch data');
            }
        } catch (error: any) {
            setError(error instanceof Error ? error.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [fetchFn, ...deps]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { data, loading, error, refetch };
}

// ============================================================================
// COMPETENCY HOOKS
// ============================================================================

export function useCompetencies(params?: {
    categoryId?: string;
    status?: string;
    search?: string;
}) {
    const [competencies, setCompetencies] = useState<Competency[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);

    const fetchCompetencies = useCallback(async () => {
        setLoading(true);
        try {
            const result = await CompetencyService.getAll(params);
            if (result.success) {
                setCompetencies(result.data);
                setTotal(result.total);
            } else {
                setError('Failed to fetch competencies');
            }
        } catch (error: any) {
            setError(error instanceof Error ? error.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [params?.categoryId, params?.status, params?.search]);

    useEffect(() => {
        fetchCompetencies();
    }, [fetchCompetencies]);

    return { competencies, loading, error, total, refetch: fetchCompetencies };
}

export function useCompetency(id: string) {
    return useAsyncData(
        () => CompetencyService.getById(id),
        [id]
    );
}

// ============================================================================
// CATEGORY HOOKS
// ============================================================================

export function useCategories() {
    const { data, loading, error, refetch } = useAsyncData<CompetencyCategory[]>(
        CategoryService.getAll
    );
    return { categories: data || [], loading, error, refetch };
}

// ============================================================================
// FRAMEWORK HOOKS
// ============================================================================

export function useFrameworks() {
    const { data, loading, error, refetch } = useAsyncData<ProficiencyFramework[]>(
        FrameworkService.getAll
    );
    return { frameworks: data || [], loading, error, refetch };
}

export function useFramework(id: string) {
    return useAsyncData(
        () => FrameworkService.getById(id),
        [id]
    );
}

// ============================================================================
// JOB ROLE HOOKS
// ============================================================================

export function useJobRoles(params?: {
    departmentId?: string;
    level?: string;
    search?: string;
}) {
    const { data, loading, error, refetch } = useAsyncData<JobRole[]>(
        () => JobRoleService.getAll(params),
        [params?.departmentId, params?.level, params?.search]
    );
    return { jobRoles: data || [], loading, error, refetch };
}

export function useJobRole(id: string) {
    return useAsyncData(
        () => JobRoleService.getById(id),
        [id]
    );
}

// ============================================================================
// ASSESSMENT HOOKS
// ============================================================================

export function useAssessments(params?: {
    type?: string;
    status?: string;
    employeeId?: string;
    cycleId?: string;
}) {
    const [assessments, setAssessments] = useState<SkillAssessment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAssessments = useCallback(async () => {
        setLoading(true);
        try {
            const result = await AssessmentService.getAll(params);
            if (result.success) {
                setAssessments(result.data);
            } else {
                setError('Failed to fetch assessments');
            }
        } catch (error: any) {
            setError(error instanceof Error ? error.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [params?.type, params?.status, params?.employeeId, params?.cycleId]);

    useEffect(() => {
        fetchAssessments();
    }, [fetchAssessments]);

    return { assessments, loading, error, refetch: fetchAssessments };
}

export function useAssessment(id: string) {
    return useAsyncData(
        () => AssessmentService.getById(id),
        [id]
    );
}

// ============================================================================
// GAP ANALYSIS HOOKS
// ============================================================================

export function useGapAnalyses(params?: {
    type?: string;
    targetType?: string;
    targetId?: string;
    status?: string;
}) {
    const { data, loading, error, refetch } = useAsyncData<GapAnalysis[]>(
        () => GapAnalysisService.getAll(params),
        [params?.type, params?.targetType, params?.targetId, params?.status]
    );
    return { gapAnalyses: data || [], loading, error, refetch };
}

export function useGapAnalysis(id: string) {
    return useAsyncData(
        () => GapAnalysisService.getById(id),
        [id]
    );
}

// ============================================================================
// DEVELOPMENT PLAN HOOKS
// ============================================================================

export function useDevelopmentPlans(params?: {
    type?: string;
    targetType?: string;
    targetId?: string;
    status?: string;
}) {
    const { data, loading, error, refetch } = useAsyncData<DevelopmentPlan[]>(
        () => DevelopmentPlanService.getAll(params),
        [params?.type, params?.targetType, params?.targetId, params?.status]
    );
    return { developmentPlans: data || [], loading, error, refetch };
}

export function useDevelopmentPlan(id: string) {
    return useAsyncData(
        () => DevelopmentPlanService.getById(id),
        [id]
    );
}

// ============================================================================
// COMBINED HOOK FOR ALL DATA
// ============================================================================

export function useCompetencyLibraryData() {
    const { categories, loading: catLoading } = useCategories();
    const { frameworks, loading: fwLoading } = useFrameworks();
    const { competencies, loading: compLoading } = useCompetencies();

    return {
        categories,
        frameworks,
        competencies,
        loading: catLoading || fwLoading || compLoading
    };
}
