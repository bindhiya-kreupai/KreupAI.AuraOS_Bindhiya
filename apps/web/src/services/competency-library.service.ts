/**
 * @module CompetencyLibraryService
 * @description Frontend service for Competency Library APIs with mock data fallback
 */

import type {
    Competency,
    CompetencyCategory,
    ProficiencyFramework,
    JobRole,
    SkillAssessment,
    GapAnalysis,
    DevelopmentPlan,
    ApiResponse,
    PaginatedResponse,
    CreateCompetencyInput,
    CreateFrameworkInput,
    CreateAssessmentInput,
    CreateDevelopmentPlanInput
} from '@/types/competency-library';

// Base API URL
const API_BASE = '/api/competency-library';

// Helper to check if API is available
let apiAvailable: boolean | null = null;

async function checkApiAvailability(): Promise<boolean> {
    if (apiAvailable !== null) return apiAvailable;
    
    try {
        const res = await fetch(`${API_BASE}/categories`, { 
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        apiAvailable = res.ok;
    } catch {
        apiAvailable = false;
    }
    
    return apiAvailable;
}

// Generic fetch with fallback
async function fetchWithFallback<T>(
    endpoint: string,
    fallbackData: T,
    options?: RequestInit
): Promise<ApiResponse<T>> {
    try {
        const isAvailable = await checkApiAvailability();
        
        if (!isAvailable) {
            console.log(`[CompetencyService] API unavailable, using mock data for: ${endpoint}`);
            return { success: true, data: fallbackData };
        }

        const res = await fetch(`${API_BASE}${endpoint}`, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });

        if (!res.ok) {
            console.warn(`[CompetencyService] API error ${res.status}, using mock data for: ${endpoint}`);
            return { success: true, data: fallbackData };
        }

        return await res.json();
    } catch (error) {
        console.warn(`[CompetencyService] Fetch failed, using mock data for: ${endpoint}`, error);
        return { success: true, data: fallbackData };
    }
}

// ============================================================================
// COMPETENCY CATALOG SERVICE
// ============================================================================

export const CompetencyService = {
    async getAll(params?: {
        categoryId?: string;
        status?: string;
        search?: string;
        page?: number;
        pageSize?: number;
    }): Promise<PaginatedResponse<Competency>> {
        const queryParams = new URLSearchParams();
        if (params?.categoryId) queryParams.set('categoryId', params.categoryId);
        if (params?.status) queryParams.set('status', params.status);
        if (params?.search) queryParams.set('search', params.search);
        if (params?.page) queryParams.set('page', params.page.toString());
        if (params?.pageSize) queryParams.set('pageSize', params.pageSize.toString());

        const endpoint = `/competencies?${queryParams.toString()}`;
        const result = await fetchWithFallback<Competency[]>(
            endpoint,
            MOCK_COMPETENCIES
        );

        return {
            success: result.success,
            data: result.data || [],
            total: (result.data || []).length,
            page: params?.page || 1,
            pageSize: params?.pageSize || 50,
            totalPages: 1
        };
    },

    async getById(id: string): Promise<ApiResponse<Competency>> {
        const mockCompetency = MOCK_COMPETENCIES.find(c => c.id === id) || MOCK_COMPETENCIES[0];
        return fetchWithFallback(`/competencies/${id}`, mockCompetency);
    },

    async create(data: CreateCompetencyInput): Promise<ApiResponse<Competency>> {
        return fetchWithFallback('/competencies', null as any, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async update(id: string, data: Partial<Competency>): Promise<ApiResponse<Competency>> {
        return fetchWithFallback(`/competencies/${id}`, null as any, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async delete(id: string): Promise<ApiResponse<void>> {
        return fetchWithFallback(`/competencies/${id}`, undefined, {
            method: 'DELETE'
        });
    }
};

// ============================================================================
// CATEGORIES SERVICE
// ============================================================================

export const CategoryService = {
    async getAll(): Promise<ApiResponse<CompetencyCategory[]>> {
        return fetchWithFallback('/categories', MOCK_CATEGORIES);
    },

    async create(data: Partial<CompetencyCategory>): Promise<ApiResponse<CompetencyCategory>> {
        return fetchWithFallback('/categories', null as any, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
};

// ============================================================================
// PROFICIENCY FRAMEWORK SERVICE
// ============================================================================

export const FrameworkService = {
    async getAll(): Promise<ApiResponse<ProficiencyFramework[]>> {
        return fetchWithFallback('/frameworks', MOCK_FRAMEWORKS);
    },

    async getById(id: string): Promise<ApiResponse<ProficiencyFramework>> {
        const mockFramework = MOCK_FRAMEWORKS.find(f => f.id === id) || MOCK_FRAMEWORKS[0];
        return fetchWithFallback(`/frameworks/${id}`, mockFramework);
    },

    async create(data: CreateFrameworkInput): Promise<ApiResponse<ProficiencyFramework>> {
        return fetchWithFallback('/frameworks', null as any, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async update(id: string, data: Partial<ProficiencyFramework>): Promise<ApiResponse<ProficiencyFramework>> {
        return fetchWithFallback(`/frameworks/${id}`, null as any, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async delete(id: string): Promise<ApiResponse<void>> {
        return fetchWithFallback(`/frameworks/${id}`, undefined, {
            method: 'DELETE'
        });
    }
};

// ============================================================================
// JOB ROLE SERVICE
// ============================================================================

export const JobRoleService = {
    async getAll(params?: {
        departmentId?: string;
        level?: string;
        search?: string;
    }): Promise<ApiResponse<JobRole[]>> {
        const queryParams = new URLSearchParams();
        if (params?.departmentId) queryParams.set('departmentId', params.departmentId);
        if (params?.level) queryParams.set('level', params.level);
        if (params?.search) queryParams.set('search', params.search);

        return fetchWithFallback(`/job-roles?${queryParams.toString()}`, MOCK_JOB_ROLES);
    },

    async getById(id: string): Promise<ApiResponse<JobRole>> {
        const mockRole = MOCK_JOB_ROLES.find(r => r.id === id) || MOCK_JOB_ROLES[0];
        return fetchWithFallback(`/job-roles/${id}`, mockRole);
    },

    async create(data: Partial<JobRole>): Promise<ApiResponse<JobRole>> {
        return fetchWithFallback('/job-roles', null as any, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async update(id: string, data: Partial<JobRole>): Promise<ApiResponse<JobRole>> {
        return fetchWithFallback(`/job-roles/${id}`, null as any, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async delete(id: string): Promise<ApiResponse<void>> {
        return fetchWithFallback(`/job-roles/${id}`, undefined, {
            method: 'DELETE'
        });
    }
};

// ============================================================================
// SKILL ASSESSMENT SERVICE
// ============================================================================

export const AssessmentService = {
    async getAll(params?: {
        type?: string;
        status?: string;
        employeeId?: string;
        cycleId?: string;
    }): Promise<PaginatedResponse<SkillAssessment>> {
        const queryParams = new URLSearchParams();
        if (params?.type) queryParams.set('type', params.type);
        if (params?.status) queryParams.set('status', params.status);
        if (params?.employeeId) queryParams.set('employeeId', params.employeeId);
        if (params?.cycleId) queryParams.set('cycleId', params.cycleId);

        const result = await fetchWithFallback<SkillAssessment[]>(
            `/assessments?${queryParams.toString()}`,
            MOCK_ASSESSMENTS
        );

        return {
            success: result.success,
            data: result.data || [],
            total: (result.data || []).length,
            page: 1,
            pageSize: 50,
            totalPages: 1
        };
    },

    async getById(id: string): Promise<ApiResponse<SkillAssessment>> {
        const mockAssessment = MOCK_ASSESSMENTS.find(a => a.id === id) || MOCK_ASSESSMENTS[0];
        return fetchWithFallback(`/assessments/${id}`, mockAssessment);
    },

    async create(data: CreateAssessmentInput): Promise<ApiResponse<SkillAssessment>> {
        return fetchWithFallback('/assessments', null as any, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async update(id: string, data: Partial<SkillAssessment>): Promise<ApiResponse<SkillAssessment>> {
        return fetchWithFallback(`/assessments/${id}`, null as any, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async delete(id: string): Promise<ApiResponse<void>> {
        return fetchWithFallback(`/assessments/${id}`, undefined, {
            method: 'DELETE'
        });
    },

    async submitResults(id: string, results: any[]): Promise<ApiResponse<any>> {
        return fetchWithFallback(`/assessments/${id}/results`, null as any, {
            method: 'POST',
            body: JSON.stringify({ results })
        });
    }
};

// ============================================================================
// GAP ANALYSIS SERVICE
// ============================================================================

export const GapAnalysisService = {
    async getAll(params?: {
        type?: string;
        targetType?: string;
        targetId?: string;
        status?: string;
    }): Promise<ApiResponse<GapAnalysis[]>> {
        const queryParams = new URLSearchParams();
        if (params?.type) queryParams.set('type', params.type);
        if (params?.targetType) queryParams.set('targetType', params.targetType);
        if (params?.targetId) queryParams.set('targetId', params.targetId);
        if (params?.status) queryParams.set('status', params.status);

        return fetchWithFallback(`/gap-analysis?${queryParams.toString()}`, MOCK_GAP_ANALYSES);
    },

    async getById(id: string): Promise<ApiResponse<GapAnalysis>> {
        const mockAnalysis = MOCK_GAP_ANALYSES.find(g => g.id === id) || MOCK_GAP_ANALYSES[0];
        return fetchWithFallback(`/gap-analysis/${id}`, mockAnalysis);
    },

    async create(data: Partial<GapAnalysis>): Promise<ApiResponse<GapAnalysis>> {
        return fetchWithFallback('/gap-analysis', null as any, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async update(id: string, data: Partial<GapAnalysis>): Promise<ApiResponse<GapAnalysis>> {
        return fetchWithFallback(`/gap-analysis/${id}`, null as any, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async delete(id: string): Promise<ApiResponse<void>> {
        return fetchWithFallback(`/gap-analysis/${id}`, undefined, {
            method: 'DELETE'
        });
    }
};

// ============================================================================
// DEVELOPMENT PLAN SERVICE
// ============================================================================

export const DevelopmentPlanService = {
    async getAll(params?: {
        type?: string;
        targetType?: string;
        targetId?: string;
        status?: string;
    }): Promise<ApiResponse<DevelopmentPlan[]>> {
        const queryParams = new URLSearchParams();
        if (params?.type) queryParams.set('type', params.type);
        if (params?.targetType) queryParams.set('targetType', params.targetType);
        if (params?.targetId) queryParams.set('targetId', params.targetId);
        if (params?.status) queryParams.set('status', params.status);

        return fetchWithFallback(`/development-plans?${queryParams.toString()}`, MOCK_DEVELOPMENT_PLANS);
    },

    async getById(id: string): Promise<ApiResponse<DevelopmentPlan>> {
        const mockPlan = MOCK_DEVELOPMENT_PLANS.find(p => p.id === id) || MOCK_DEVELOPMENT_PLANS[0];
        return fetchWithFallback(`/development-plans/${id}`, mockPlan);
    },

    async create(data: CreateDevelopmentPlanInput): Promise<ApiResponse<DevelopmentPlan>> {
        return fetchWithFallback('/development-plans', null as any, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async update(id: string, data: Partial<DevelopmentPlan>): Promise<ApiResponse<DevelopmentPlan>> {
        return fetchWithFallback(`/development-plans/${id}`, null as any, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async delete(id: string): Promise<ApiResponse<void>> {
        return fetchWithFallback(`/development-plans/${id}`, undefined, {
            method: 'DELETE'
        });
    }
};

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_CATEGORIES: CompetencyCategory[] = [
    { id: 'cat-1', code: 'TECHNICAL', name: 'Technical', description: 'Technical skills and expertise', icon: 'Code', color: '#3B82F6', sortOrder: 1, status: 'Active' },
    { id: 'cat-2', code: 'LEADERSHIP', name: 'Leadership', description: 'Leadership competencies', icon: 'Users', color: '#F59E0B', sortOrder: 2, status: 'Active' },
    { id: 'cat-3', code: 'BEHAVIORAL', name: 'Behavioral', description: 'Behavioral competencies', icon: 'Heart', color: '#F43F5E', sortOrder: 3, status: 'Active' },
    { id: 'cat-4', code: 'FUNCTIONAL', name: 'Functional', description: 'Functional competencies', icon: 'Briefcase', color: '#8B5CF6', sortOrder: 4, status: 'Active' },
    { id: 'cat-5', code: 'CORE', name: 'Core', description: 'Core competencies', icon: 'Star', color: '#10B981', sortOrder: 5, status: 'Active' }
];

const MOCK_FRAMEWORKS: ProficiencyFramework[] = [
    {
        id: 'fw-1',
        code: 'STANDARD_5',
        name: 'Standard 5-Level Framework',
        description: 'Default organizational proficiency framework',
        type: 'Standard',
        isDefault: true,
        status: 'Active',
        levels: [
            { id: 'l1', frameworkId: 'fw-1', code: 'L1', name: 'Foundational', levelNumber: 1, description: 'Basic understanding', color: '#EF4444' },
            { id: 'l2', frameworkId: 'fw-1', code: 'L2', name: 'Developing', levelNumber: 2, description: 'Growing capability', color: '#F59E0B' },
            { id: 'l3', frameworkId: 'fw-1', code: 'L3', name: 'Proficient', levelNumber: 3, description: 'Solid working knowledge', color: '#10B981' },
            { id: 'l4', frameworkId: 'fw-1', code: 'L4', name: 'Advanced', levelNumber: 4, description: 'Deep expertise', color: '#3B82F6' },
            { id: 'l5', frameworkId: 'fw-1', code: 'L5', name: 'Expert', levelNumber: 5, description: 'Recognized authority', color: '#8B5CF6' }
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
    },
    {
        id: 'fw-2',
        code: 'TECHNICAL_6',
        name: 'Technical Proficiency Scale',
        description: 'Enhanced 6-level scale for technical competencies',
        type: 'Custom',
        isDefault: false,
        status: 'Active',
        levels: [
            { id: 't1', frameworkId: 'fw-2', code: 'T1', name: 'Novice', levelNumber: 1, description: 'New to technology', color: '#EF4444' },
            { id: 't2', frameworkId: 'fw-2', code: 'T2', name: 'Beginner', levelNumber: 2, description: 'Basic tasks with help', color: '#F97316' },
            { id: 't3', frameworkId: 'fw-2', code: 'T3', name: 'Competent', levelNumber: 3, description: 'Handles typical scenarios', color: '#EAB308' },
            { id: 't4', frameworkId: 'fw-2', code: 'T4', name: 'Proficient', levelNumber: 4, description: 'Deep understanding', color: '#10B981' },
            { id: 't5', frameworkId: 'fw-2', code: 'T5', name: 'Expert', levelNumber: 5, description: 'Solves novel problems', color: '#3B82F6' },
            { id: 't6', frameworkId: 'fw-2', code: 'T6', name: 'Master', levelNumber: 6, description: 'Industry authority', color: '#8B5CF6' }
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
    }
];

const MOCK_COMPETENCIES: Competency[] = [
    {
        id: 'comp-1',
        code: 'TECH-001',
        name: 'Software Development',
        categoryId: 'cat-1',
        category: MOCK_CATEGORIES[0],
        description: 'Design, develop, test, and maintain software applications',
        status: 'Active',
        version: '2.1',
        owner: 'Engineering Excellence Team',
        usageCount: 156,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-11-15')
    },
    {
        id: 'comp-2',
        code: 'TECH-002',
        name: 'Cloud Architecture',
        categoryId: 'cat-1',
        category: MOCK_CATEGORIES[0],
        description: 'Designing scalable cloud solutions',
        status: 'Active',
        version: '1.5',
        owner: 'Cloud CoE',
        usageCount: 89,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-10-20')
    },
    {
        id: 'comp-3',
        code: 'LEAD-001',
        name: 'Strategic Thinking',
        categoryId: 'cat-2',
        category: MOCK_CATEGORIES[1],
        description: 'Long-term thinking and strategy development',
        status: 'Active',
        version: '1.7',
        owner: 'Leadership Development',
        usageCount: 134,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-09-10')
    },
    {
        id: 'comp-4',
        code: 'BEHV-001',
        name: 'Communication',
        categoryId: 'cat-3',
        category: MOCK_CATEGORIES[2],
        description: 'Effective verbal and written communication',
        status: 'Active',
        version: '2.2',
        owner: 'HR L&D',
        usageCount: 267,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-08-15')
    },
    {
        id: 'comp-5',
        code: 'CORE-001',
        name: 'Problem Solving',
        categoryId: 'cat-5',
        category: MOCK_CATEGORIES[4],
        description: 'Analyzing and solving complex problems',
        status: 'Active',
        version: '2.0',
        owner: 'HR L&D',
        usageCount: 312,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-07-20')
    }
];

const MOCK_JOB_ROLES: JobRole[] = [
    {
        id: 'jr-1',
        code: 'JR-SWE-1',
        name: 'Software Engineer I',
        departmentId: 'Engineering',
        description: 'Entry-level software engineering role',
        level: 'Entry',
        status: 'Active',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
    },
    {
        id: 'jr-2',
        code: 'JR-SSE',
        name: 'Senior Software Engineer',
        departmentId: 'Engineering',
        description: 'Senior engineering role',
        level: 'Senior',
        status: 'Active',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
    },
    {
        id: 'jr-3',
        code: 'JR-EM',
        name: 'Engineering Manager',
        departmentId: 'Engineering',
        description: 'People management role',
        level: 'Lead',
        status: 'Active',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
    },
    {
        id: 'jr-4',
        code: 'JR-PM',
        name: 'Product Manager',
        departmentId: 'Product',
        description: 'Product management role',
        level: 'Mid',
        status: 'Active',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
    }
];

const MOCK_ASSESSMENTS: SkillAssessment[] = [
    {
        id: 'sa-1',
        code: 'SA-2025-Q4-001',
        name: 'Q4 2025 Engineering Skills Assessment',
        description: 'Quarterly skills assessment',
        type: 'Self',
        status: 'In Progress',
        cycleId: '2025-Q4',
        startDate: new Date('2025-10-01'),
        endDate: new Date('2025-12-31'),
        createdBy: 'system',
        createdAt: new Date('2025-10-01'),
        updatedAt: new Date('2025-10-01')
    },
    {
        id: 'sa-2',
        code: 'SA-2025-Q4-002',
        name: 'Sarah Chen - Annual 360 Review',
        description: '360-degree feedback assessment',
        type: '360',
        status: 'In Progress',
        cycleId: '2025-Annual',
        startDate: new Date('2025-11-01'),
        endDate: new Date('2025-12-15'),
        createdBy: 'hr-admin',
        createdAt: new Date('2025-11-01'),
        updatedAt: new Date('2025-11-01')
    },
    {
        id: 'sa-3',
        code: 'SA-2025-Q3-001',
        name: 'Q3 2025 Product Team Assessment',
        description: 'Product team competency assessment',
        type: 'Self',
        status: 'Completed',
        cycleId: '2025-Q3',
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-09-30'),
        completedAt: new Date('2025-09-28'),
        createdBy: 'system',
        createdAt: new Date('2025-07-01'),
        updatedAt: new Date('2025-09-28')
    }
];

const MOCK_GAP_ANALYSES: GapAnalysis[] = [
    {
        id: 'ga-1',
        code: 'GA-2025-001',
        name: 'Engineering Department Gap Analysis Q4 2025',
        type: 'Department',
        targetType: 'Department',
        targetId: 'engineering',
        status: 'Active',
        analysisDate: new Date('2025-10-15'),
        createdBy: 'hr-admin',
        createdAt: new Date('2025-10-15'),
        updatedAt: new Date('2025-10-15')
    },
    {
        id: 'ga-2',
        code: 'GA-2025-002',
        name: 'John Smith - Individual Assessment',
        type: 'Individual',
        targetType: 'Employee',
        targetId: 'emp-001',
        status: 'Active',
        analysisDate: new Date('2025-11-01'),
        createdBy: 'manager-001',
        createdAt: new Date('2025-11-01'),
        updatedAt: new Date('2025-11-01')
    }
];

const MOCK_DEVELOPMENT_PLANS: DevelopmentPlan[] = [
    {
        id: 'dp-1',
        code: 'DP-2025-001',
        name: 'Engineering Excellence Development Program',
        description: 'Comprehensive development plan for engineering',
        type: 'Department',
        targetType: 'Department',
        targetId: 'engineering',
        status: 'Active',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-06-30'),
        budget: 50000,
        createdBy: 'hr-admin',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
    },
    {
        id: 'dp-2',
        code: 'DP-2025-002',
        name: 'John Smith Career Development Plan',
        description: 'Individual development plan',
        type: 'Individual',
        targetType: 'Employee',
        targetId: 'emp-001',
        status: 'In Progress',
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-07-15'),
        budget: 5000,
        createdBy: 'manager-001',
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-01-15')
    }
];

// Export all services
export default {
    competencies: CompetencyService,
    categories: CategoryService,
    frameworks: FrameworkService,
    jobRoles: JobRoleService,
    assessments: AssessmentService,
    gapAnalysis: GapAnalysisService,
    developmentPlans: DevelopmentPlanService
};
