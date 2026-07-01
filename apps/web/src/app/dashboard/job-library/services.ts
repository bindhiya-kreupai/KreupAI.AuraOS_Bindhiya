/**
 * Job Library Module — Service Layer.
 *
 * API-integrated service classes using APIClient. Every job-library API route
 * returns the wrapped envelope { success: true, data: <payload> }, so each
 * method unwraps via APIClient.unwrapList / unwrapItem before handing data to
 * pages. Pages can therefore treat results as plain arrays / objects.
 */

import { APIClient } from '@/lib/api-client';
import type {
  JobCatalogRow,
  JobFamily,
  JobFunction,
  EvaluationBoard,
  JobEvaluation,
  JobPostingTemplate,
  MarketPricingBoard,
  MarketPricingRow,
  CompensationStrategy,
} from './types';

/**
 * Extract the `data` payload from a wrapped envelope. Unlike APIClient.unwrapItem
 * this returns null when `data` is explicitly null, so composite board payloads
 * can fall back to a safe default instead of leaking the raw envelope.
 */
function unwrapData<T>(res: unknown): T | null {
  if (res == null || typeof res !== 'object') return null;
  const obj = res as Record<string, unknown>;
  if ('data' in obj) return (obj.data as T | null) ?? null;
  return obj as T;
}

export interface CatalogFilters {
  search?: string;
  status?: string;
  familyId?: string;
}

export class JobCatalogService {
  static async list(filters?: CatalogFilters): Promise<JobCatalogRow[]> {
    const res = await APIClient.get('/job-library/catalog', filters);
    return APIClient.unwrapList<JobCatalogRow>(res, 'items');
  }

  static async create(data: {
    code: string;
    title: string;
    familyId: string;
    gradeId?: string;
    description?: string;
    status?: string;
  }): Promise<JobCatalogRow | null> {
    const res = await APIClient.post('/job-library/catalog', data);
    return APIClient.unwrapItem<JobCatalogRow>(res);
  }

  static async update(
    id: string,
    updates: Partial<{
      code: string;
      title: string;
      familyId: string;
      gradeId: string;
      description: string;
      status: string;
    }>
  ): Promise<JobCatalogRow | null> {
    const res = await APIClient.put('/job-library/catalog', { id, ...updates });
    return APIClient.unwrapItem<JobCatalogRow>(res);
  }

  static async remove(id: string): Promise<void> {
    await APIClient.delete('/job-library/catalog', { id });
  }
}

export class JobFamilyService {
  static async list(search?: string): Promise<JobFamily[]> {
    const res = await APIClient.get('/job-library/families', search ? { search } : undefined);
    return APIClient.unwrapList<JobFamily>(res, 'items');
  }

  static async create(data: {
    code: string;
    name: string;
    functionId: string;
  }): Promise<JobFamily | null> {
    const res = await APIClient.post('/job-library/families', data);
    return APIClient.unwrapItem<JobFamily>(res);
  }

  static async update(
    id: string,
    updates: Partial<{ code: string; name: string; functionId: string }>
  ): Promise<JobFamily | null> {
    const res = await APIClient.put('/job-library/families', { id, ...updates });
    return APIClient.unwrapItem<JobFamily>(res);
  }
}

export class JobFunctionService {
  static async list(): Promise<JobFunction[]> {
    const res = await APIClient.get('/job-library/functions');
    return APIClient.unwrapList<JobFunction>(res, 'items');
  }
}

export class JobEvaluationService {
  static async board(): Promise<EvaluationBoard> {
    const res = await APIClient.get('/job-library/evaluations');
    const data = unwrapData<EvaluationBoard>(res);
    return data ?? { pending: [], completed: [], distribution: [], total: 0 };
  }

  static async create(data: {
    jobTitle: string;
    familyName?: string;
    method?: string;
    jobProfileId?: string;
  }): Promise<JobEvaluation | null> {
    const res = await APIClient.post('/job-library/evaluations', data);
    return APIClient.unwrapItem<JobEvaluation>(res);
  }

  static async start(id: string): Promise<JobEvaluation | null> {
    const res = await APIClient.put('/job-library/evaluations', { id, action: 'start' });
    return APIClient.unwrapItem<JobEvaluation>(res);
  }

  static async complete(
    id: string,
    score: number,
    assignedGrade: string,
    notes?: string
  ): Promise<JobEvaluation | null> {
    const res = await APIClient.put('/job-library/evaluations', {
      id,
      action: 'complete',
      score,
      assignedGrade,
      notes,
    });
    return APIClient.unwrapItem<JobEvaluation>(res);
  }
}

export class JobPostingTemplateService {
  static async list(search?: string): Promise<JobPostingTemplate[]> {
    const res = await APIClient.get(
      '/job-library/posting-templates',
      search ? { search } : undefined
    );
    return APIClient.unwrapList<JobPostingTemplate>(res, 'items');
  }

  static async create(data: {
    name: string;
    category?: string;
    sections?: string[];
    body?: string;
  }): Promise<JobPostingTemplate | null> {
    const res = await APIClient.post('/job-library/posting-templates', data);
    return APIClient.unwrapItem<JobPostingTemplate>(res);
  }

  static async update(
    id: string,
    updates: Partial<{ name: string; category: string; sections: string[]; body: string }>
  ): Promise<JobPostingTemplate | null> {
    const res = await APIClient.put('/job-library/posting-templates', { id, ...updates });
    return APIClient.unwrapItem<JobPostingTemplate>(res);
  }

  static async use(id: string): Promise<JobPostingTemplate | null> {
    const res = await APIClient.put('/job-library/posting-templates', { id, action: 'use' });
    return APIClient.unwrapItem<JobPostingTemplate>(res);
  }

  static async remove(id: string): Promise<void> {
    await APIClient.delete('/job-library/posting-templates', { id });
  }
}

export interface MarketPricingFilters {
  region?: string;
  industry?: string;
  companySize?: string;
  search?: string;
}

export class MarketPricingService {
  static async board(filters?: MarketPricingFilters): Promise<MarketPricingBoard> {
    const res = await APIClient.get('/job-library/market-pricing', filters);
    const data = unwrapData<MarketPricingBoard>(res);
    return data ?? { items: [], strategy: null, filters: { regions: [], industries: [] } };
  }

  static async createBenchmark(data: {
    jobTitle: string;
    gradeLabel?: string;
    region?: string;
    industry?: string;
    companySize?: string;
    marketMin: number;
    marketMid: number;
    marketMax: number;
    internalMedian?: number;
    marketTrend?: string;
  }): Promise<MarketPricingRow | null> {
    const res = await APIClient.post('/job-library/market-pricing', data);
    return APIClient.unwrapItem<MarketPricingRow>(res);
  }

  static async setStrategy(data: {
    targetPercentile: number;
    scope?: string;
    description?: string;
  }): Promise<CompensationStrategy | null> {
    const res = await APIClient.put('/job-library/market-pricing', { action: 'strategy', ...data });
    return APIClient.unwrapItem<CompensationStrategy>(res);
  }
}
