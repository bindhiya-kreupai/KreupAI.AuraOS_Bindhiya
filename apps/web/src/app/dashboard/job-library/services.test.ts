import { describe, it, expect, vi, beforeEach } from 'vitest';
import { APIClient } from '@/lib/api-client';
import type * as ApiClientModule from '@/lib/api-client';
import {
  JobCatalogService,
  JobFamilyService,
  JobFunctionService,
  JobEvaluationService,
  JobPostingTemplateService,
  MarketPricingService,
} from './services';

// Keep the REAL unwrapList / unwrapItem envelope logic; only stub the HTTP verbs.
vi.mock('@/lib/api-client', async () => {
  const actual = await vi.importActual<typeof ApiClientModule>('@/lib/api-client');
  const Real = actual.APIClient;
  return {
    APIClient: {
      unwrapList: Real.unwrapList.bind(Real),
      unwrapItem: Real.unwrapItem.bind(Real),
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  };
});

const mockGet = APIClient.get as unknown as ReturnType<typeof vi.fn>;
const mockPost = APIClient.post as unknown as ReturnType<typeof vi.fn>;
const mockPut = APIClient.put as unknown as ReturnType<typeof vi.fn>;
const mockDelete = APIClient.delete as unknown as ReturnType<typeof vi.fn>;

describe('job-library services — envelope unwrapping & endpoints', () => {
  beforeEach(() => vi.clearAllMocks());

  it('JobCatalogService.list unwraps { data: { items: [] } } to a plain array', async () => {
    mockGet.mockResolvedValueOnce({
      success: true,
      data: { items: [{ id: 'j1', code: 'ENG-1', title: 'Engineer' }], total: 1 },
    });
    const jobs = await JobCatalogService.list({ search: 'eng' });
    expect(Array.isArray(jobs)).toBe(true);
    expect(jobs).toHaveLength(1);
    expect(jobs[0].code).toBe('ENG-1');
    expect(mockGet).toHaveBeenCalledWith('/job-library/catalog', { search: 'eng' });
  });

  it('JobCatalogService.create posts to /job-library/catalog and unwraps item', async () => {
    mockPost.mockResolvedValueOnce({ success: true, data: { id: 'j9', title: 'New' } });
    const created = await JobCatalogService.create({
      code: 'C1',
      title: 'New',
      familyId: 'f1',
    });
    expect(created?.id).toBe('j9');
    expect(mockPost).toHaveBeenCalledWith('/job-library/catalog', {
      code: 'C1',
      title: 'New',
      familyId: 'f1',
    });
  });

  it('JobCatalogService.remove sends the id to DELETE', async () => {
    mockDelete.mockResolvedValueOnce({ success: true });
    await JobCatalogService.remove('j1');
    expect(mockDelete).toHaveBeenCalledWith('/job-library/catalog', { id: 'j1' });
  });

  it('JobFamilyService.list unwraps items array', async () => {
    mockGet.mockResolvedValueOnce({
      success: true,
      data: { items: [{ id: 'f1', name: 'Engineering', roleCount: 3 }] },
    });
    const families = await JobFamilyService.list();
    expect(families).toHaveLength(1);
    expect(families[0].roleCount).toBe(3);
  });

  it('JobFunctionService.list hits /job-library/functions', async () => {
    mockGet.mockResolvedValueOnce({ success: true, data: { items: [] } });
    const fns = await JobFunctionService.list();
    expect(fns).toEqual([]);
    expect(mockGet).toHaveBeenCalledWith('/job-library/functions');
  });

  it('JobEvaluationService.board returns a safe default when data is null', async () => {
    mockGet.mockResolvedValueOnce({ success: true, data: null });
    const board = await JobEvaluationService.board();
    expect(board.pending).toEqual([]);
    expect(board.completed).toEqual([]);
    expect(board.distribution).toEqual([]);
  });

  it('JobEvaluationService.complete sends the complete action payload', async () => {
    mockPut.mockResolvedValueOnce({ success: true, data: { id: 'e1', status: 'completed' } });
    const result = await JobEvaluationService.complete('e1', 450, 'L5', 'ok');
    expect(result?.status).toBe('completed');
    expect(mockPut).toHaveBeenCalledWith('/job-library/evaluations', {
      id: 'e1',
      action: 'complete',
      score: 450,
      assignedGrade: 'L5',
      notes: 'ok',
    });
  });

  it('JobPostingTemplateService.use sends the use action', async () => {
    mockPut.mockResolvedValueOnce({ success: true, data: { id: 't1', usageCount: 5 } });
    const tmpl = await JobPostingTemplateService.use('t1');
    expect(tmpl?.usageCount).toBe(5);
    expect(mockPut).toHaveBeenCalledWith('/job-library/posting-templates', {
      id: 't1',
      action: 'use',
    });
  });

  it('MarketPricingService.board returns a safe default when data is null', async () => {
    mockGet.mockResolvedValueOnce({ success: true, data: null });
    const board = await MarketPricingService.board();
    expect(board.items).toEqual([]);
    expect(board.strategy).toBeNull();
    expect(board.filters.regions).toEqual([]);
  });

  it('MarketPricingService.setStrategy sends the strategy action', async () => {
    mockPut.mockResolvedValueOnce({
      success: true,
      data: { id: 's1', targetPercentile: 65, scope: 'Tech' },
    });
    const strategy = await MarketPricingService.setStrategy({
      targetPercentile: 65,
      scope: 'Tech',
    });
    expect(strategy?.targetPercentile).toBe(65);
    expect(mockPut).toHaveBeenCalledWith('/job-library/market-pricing', {
      action: 'strategy',
      targetPercentile: 65,
      scope: 'Tech',
    });
  });
});
