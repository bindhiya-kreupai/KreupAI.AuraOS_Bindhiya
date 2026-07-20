import { describe, it, expect, vi, beforeEach } from 'vitest';
import { APIClient } from '@/lib/api-client';
import type * as ApiClientModule from '@/lib/api-client';
import {
  GradeService,
  BonusService,
  ArrearsService,
  MarketBenchmarkService,
  CompensationAnalyticsService,
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

describe('compensation services — envelope unwrapping', () => {
  beforeEach(() => vi.clearAllMocks());

  it('GradeService.getGrades unwraps { success, data: [] } to a plain array', async () => {
    mockGet.mockResolvedValueOnce({
      success: true,
      data: [
        { id: 'g1', gradeCode: 'G1', gradeName: 'Grade 1', level: 1 },
        { id: 'g2', gradeCode: 'G2', gradeName: 'Grade 2', level: 2 },
      ],
    });
    const grades = await GradeService.getGrades();
    expect(Array.isArray(grades)).toBe(true);
    expect(grades).toHaveLength(2);
    expect(grades[0].gradeCode).toBe('G1');
  });

  it('returns [] (not the envelope object) when data is missing', async () => {
    mockGet.mockResolvedValueOnce({ success: true, data: null });
    const grades = await GradeService.getGrades();
    expect(grades).toEqual([]);
  });

  it('GradeService.createGrade unwraps the created item', async () => {
    mockPost.mockResolvedValueOnce({
      success: true,
      data: { id: 'g9', gradeCode: 'G9', gradeName: 'New', level: 9 },
    });
    const created = await GradeService.createGrade({ gradeCode: 'G9', gradeName: 'New', level: 9 });
    expect(created?.id).toBe('g9');
    expect(mockPost).toHaveBeenCalledWith('/compensation/grades', {
      gradeCode: 'G9',
      gradeName: 'New',
      level: 9,
    });
  });

  it('BonusService.getPayouts reads from /compensation/bonuses', async () => {
    mockGet.mockResolvedValueOnce({ success: true, data: [{ id: 'b1', amount: 100 }] });
    const payouts = await BonusService.getPayouts();
    expect(mockGet).toHaveBeenCalledWith('/compensation/bonuses');
    expect(payouts).toHaveLength(1);
  });

  it('BonusService.releasePayout sends the processed/approved transition', async () => {
    mockPut.mockResolvedValueOnce({ success: true, data: { id: 'b1', isProcessed: true } });
    await BonusService.releasePayout('b1');
    expect(mockPut).toHaveBeenCalledWith('/compensation/bonuses', {
      id: 'b1',
      isProcessed: true,
      approvalStatus: 'APPROVED',
    });
  });

  it('ArrearsService.runCalculation posts the calculate action', async () => {
    mockPut.mockResolvedValueOnce({ success: true, data: { id: 'a1', status: 'submitted' } });
    const res = await ArrearsService.runCalculation('a1');
    expect(mockPut).toHaveBeenCalledWith('/compensation/arrears-requests', {
      id: 'a1',
      action: 'calculate',
    });
    expect(res?.status).toBe('submitted');
  });

  it('MarketBenchmarkService.getBenchmarks passes the search param through', async () => {
    mockGet.mockResolvedValueOnce({ success: true, data: [] });
    await MarketBenchmarkService.getBenchmarks('engineer');
    expect(mockGet).toHaveBeenCalledWith('/compensation/market-benchmarks', {
      search: 'engineer',
    });
  });

  it('CompensationAnalyticsService.getMetrics unwraps the object payload', async () => {
    mockGet.mockResolvedValueOnce({
      success: true,
      data: { totalEmployees: 42, totalCompensationCost: 1000 },
    });
    const metrics = await CompensationAnalyticsService.getMetrics();
    expect(metrics?.totalEmployees).toBe(42);
  });
});
