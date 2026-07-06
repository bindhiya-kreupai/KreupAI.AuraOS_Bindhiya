/**
 * @module CompetencyLibraryService
 * @description Frontend service for Competency Library APIs.
 *
 * NOTE: This service performs real network calls only. It NEVER returns
 * embedded mock data. On failure it surfaces the error honestly so the UI
 * can render an error state instead of silently masking integration failures.
 */

import logger from '@/lib/logger';
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
  CreateDevelopmentPlanInput,
} from '@/types/competency-library';

// Base API URL
const API_BASE = '/api/competency-library';

/**
 * Generic JSON fetch that surfaces failures honestly.
 * Returns `{ success: false, error }` on any transport or HTTP error and
 * NEVER substitutes mock data.
 */
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    let json: any = null;
    try {
      json = await res.json();
    } catch {
      json = null;
    }

    if (!res.ok) {
      const error = json?.error || json?.message || `Request failed with status ${res.status}`;
      logger.warn(`[CompetencyService] API error ${res.status} for ${endpoint}: ${error}`);
      return { success: false, error };
    }

    // Endpoints already return { success, data, ... }. Preserve that shape.
    if (json && typeof json === 'object' && 'success' in json) {
      return json as ApiResponse<T>;
    }
    return { success: true, data: json as T };
  } catch (error: any) {
    logger.warn({ error }, `[CompetencyService] Fetch failed for: ${endpoint}`);
    return { success: false, error: error?.message || 'Network request failed' };
  }
}

/** Coerce an ApiResponse (array payload) into the shared paginated shape. */
function toPaginated<T>(
  result: ApiResponse<T[]> & Partial<PaginatedResponse<T>>,
  page: number,
  pageSize: number
): PaginatedResponse<T> {
  const data = result.data || [];
  return {
    success: result.success,
    data,
    total: result.total ?? data.length,
    page: result.page ?? page,
    pageSize: result.pageSize ?? pageSize,
    totalPages: result.totalPages ?? 1,
  };
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

    const result = await apiFetch<Competency[]>(`/competencies?${queryParams.toString()}`);
    return toPaginated(result, params?.page || 1, params?.pageSize || 50);
  },

  async getById(id: string): Promise<ApiResponse<Competency>> {
    return apiFetch(`/competencies/${id}`);
  },

  async create(data: CreateCompetencyInput): Promise<ApiResponse<Competency>> {
    return apiFetch('/competencies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<Competency>): Promise<ApiResponse<Competency>> {
    return apiFetch(`/competencies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiFetch(`/competencies/${id}`, { method: 'DELETE' });
  },
};

// ============================================================================
// CATEGORIES SERVICE
// ============================================================================

export const CategoryService = {
  async getAll(): Promise<ApiResponse<CompetencyCategory[]>> {
    return apiFetch('/categories');
  },

  async create(data: Partial<CompetencyCategory>): Promise<ApiResponse<CompetencyCategory>> {
    return apiFetch('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============================================================================
// PROFICIENCY FRAMEWORK SERVICE
// ============================================================================

export const FrameworkService = {
  async getAll(): Promise<ApiResponse<ProficiencyFramework[]>> {
    return apiFetch('/frameworks');
  },

  async getById(id: string): Promise<ApiResponse<ProficiencyFramework>> {
    return apiFetch(`/frameworks/${id}`);
  },

  async create(data: CreateFrameworkInput): Promise<ApiResponse<ProficiencyFramework>> {
    return apiFetch('/frameworks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(
    id: string,
    data: Partial<ProficiencyFramework>
  ): Promise<ApiResponse<ProficiencyFramework>> {
    return apiFetch(`/frameworks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiFetch(`/frameworks/${id}`, { method: 'DELETE' });
  },
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

    return apiFetch(`/job-roles?${queryParams.toString()}`);
  },

  async getById(id: string): Promise<ApiResponse<JobRole>> {
    return apiFetch(`/job-roles/${id}`);
  },

  async create(data: Partial<JobRole>): Promise<ApiResponse<JobRole>> {
    return apiFetch('/job-roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<JobRole>): Promise<ApiResponse<JobRole>> {
    return apiFetch(`/job-roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiFetch(`/job-roles/${id}`, { method: 'DELETE' });
  },
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

    const result = await apiFetch<SkillAssessment[]>(`/assessments?${queryParams.toString()}`);
    return toPaginated(result, 1, 50);
  },

  async getById(id: string): Promise<ApiResponse<SkillAssessment>> {
    return apiFetch(`/assessments/${id}`);
  },

  async create(data: CreateAssessmentInput): Promise<ApiResponse<SkillAssessment>> {
    return apiFetch('/assessments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<SkillAssessment>): Promise<ApiResponse<SkillAssessment>> {
    return apiFetch(`/assessments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiFetch(`/assessments/${id}`, { method: 'DELETE' });
  },

  async getResults(id: string, assessorId?: string): Promise<ApiResponse<any[]>> {
    const query = assessorId ? `?assessorId=${encodeURIComponent(assessorId)}` : '';
    return apiFetch(`/assessments/${id}/results${query}`);
  },

  async submitResults(
    id: string,
    results: any[],
    context?: { assessorId?: string; assessorType?: string }
  ): Promise<ApiResponse<any>> {
    return apiFetch(`/assessments/${id}/results`, {
      method: 'POST',
      body: JSON.stringify({ results, ...context }),
    });
  },
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

    return apiFetch(`/gap-analysis?${queryParams.toString()}`);
  },

  async getById(id: string): Promise<ApiResponse<GapAnalysis>> {
    return apiFetch(`/gap-analysis/${id}`);
  },

  async create(data: Partial<GapAnalysis>): Promise<ApiResponse<GapAnalysis>> {
    return apiFetch('/gap-analysis', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<GapAnalysis>): Promise<ApiResponse<GapAnalysis>> {
    return apiFetch(`/gap-analysis/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiFetch(`/gap-analysis/${id}`, { method: 'DELETE' });
  },
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

    return apiFetch(`/development-plans?${queryParams.toString()}`);
  },

  async getById(id: string): Promise<ApiResponse<DevelopmentPlan>> {
    return apiFetch(`/development-plans/${id}`);
  },

  async create(data: CreateDevelopmentPlanInput): Promise<ApiResponse<DevelopmentPlan>> {
    return apiFetch('/development-plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<DevelopmentPlan>): Promise<ApiResponse<DevelopmentPlan>> {
    return apiFetch(`/development-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiFetch(`/development-plans/${id}`, { method: 'DELETE' });
  },
};

// Export all services
export default {
  competencies: CompetencyService,
  categories: CategoryService,
  frameworks: FrameworkService,
  jobRoles: JobRoleService,
  assessments: AssessmentService,
  gapAnalysis: GapAnalysisService,
  developmentPlans: DevelopmentPlanService,
};
