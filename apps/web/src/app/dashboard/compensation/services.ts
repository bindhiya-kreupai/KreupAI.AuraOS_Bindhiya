/**
 * Compensation Module - Service Layer
 *
 * API-integrated service classes using APIClient
 */

import { APIClient } from '@/lib/api-client';
import type {
  SalaryComponent,
  SalaryStructure,
  EmployeeCompensation,
  Grade,
  IncrementCycle,
  IncrementProposal,
  BonusScheme,
  BonusPayout,
  StockGrant,
  LoanScheme,
  EmployeeLoan,
  ArrearsRequest,
  TotalRewardsStatement,
  MarketBenchmark,
  BudgetSimulation,
  CompensationMetrics,
  CompensationSettings,
} from './types';

export class SalaryComponentService {
  static async getComponents(): Promise<SalaryComponent[]> {
    const res = await APIClient.get<unknown>('/compensation/salary-components');
    return APIClient.unwrapList<SalaryComponent>(res);
  }

  static async getComponentById(id: string): Promise<SalaryComponent | null> {
    const res = await APIClient.get<unknown>(`/compensation/salary-components/${id}`);
    return APIClient.unwrapItem<SalaryComponent>(res);
  }

  static async createComponent(data: SalaryComponent): Promise<SalaryComponent> {
    const res = await APIClient.post<unknown>('/compensation/salary-components', data);
    return APIClient.unwrapItem<SalaryComponent>(res) || data;
  }

  static async updateComponent(
    id: string,
    updates: Partial<SalaryComponent>
  ): Promise<SalaryComponent> {
    const res = await APIClient.put<unknown>('/compensation/salary-components', { id, ...updates });
    return APIClient.unwrapItem<SalaryComponent>(res) || (updates as SalaryComponent);
  }

  static async deleteComponent(id: string): Promise<void> {
    await APIClient.delete('/compensation/salary-components', { id });
  }
}

export class SalaryStructureService {
  static async getStructures(): Promise<SalaryStructure[]> {
    try {
      const res = await APIClient.get<unknown>('/master-data/salary-structures');
      return APIClient.unwrapList<SalaryStructure>(res);
    } catch {
      return [
        {
          id: 'struct-1',
          structureCode: 'STD_COMP',
          structureName: 'Standard Executive Package',
          description: 'Base + allowances structure',
          gradeId: 'grade-1',
          gradeName: 'Grade 1',
          effectiveFrom: new Date().toISOString(),
          currency: 'USD',
          payFrequency: 'monthly',
          components: [],
          isTemplate: true,
          isActive: true,
          applicableCount: 5,
          createdBy: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }
  }

  static async getStructureById(id: string): Promise<SalaryStructure | null> {
    try {
      const res = await APIClient.get<unknown>(`/master-data/salary-structures/${id}`);
      return APIClient.unwrapItem<SalaryStructure>(res);
    } catch {
      return null;
    }
  }

  static async createStructure(data: SalaryStructure): Promise<SalaryStructure> {
    const res = await APIClient.post<unknown>('/master-data/salary-structures', data);
    return APIClient.unwrapItem<SalaryStructure>(res) || data;
  }

  static async updateStructure(
    id: string,
    updates: Partial<SalaryStructure>
  ): Promise<SalaryStructure> {
    const res = await APIClient.put<unknown>(`/master-data/salary-structures/${id}`, updates);
    return APIClient.unwrapItem<SalaryStructure>(res) || (updates as SalaryStructure);
  }

  static async deleteStructure(id: string): Promise<void> {
    await APIClient.delete(`/master-data/salary-structures/${id}`);
  }

  static async cloneStructure(id: string, newName: string): Promise<SalaryStructure> {
    const res = await APIClient.post<unknown>(`/master-data/salary-structures/${id}/clone`, {
      newName,
    });
    return APIClient.unwrapItem<SalaryStructure>(res) || ({} as SalaryStructure);
  }
}

export class EmployeeCompensationService {
  static async getCompensations(): Promise<EmployeeCompensation[]> {
    const res = await APIClient.get<unknown>('/compensation/employee-compensation');
    return APIClient.unwrapList<EmployeeCompensation>(res);
  }

  static async getCompensationById(id: string): Promise<EmployeeCompensation | null> {
    const res = await APIClient.get<unknown>(`/compensation/employee-compensation/${id}`);
    return APIClient.unwrapItem<EmployeeCompensation>(res);
  }

  static async getByEmployeeId(employeeId: string): Promise<EmployeeCompensation | null> {
    const res = await APIClient.get<unknown>(
      `/compensation/employee-compensation/employee/${employeeId}`
    );
    return APIClient.unwrapItem<EmployeeCompensation>(res);
  }

  static async createCompensation(data: EmployeeCompensation): Promise<EmployeeCompensation> {
    const res = await APIClient.post<unknown>('/compensation/employee-compensation', data);
    return APIClient.unwrapItem<EmployeeCompensation>(res) || data;
  }

  static async updateCompensation(
    id: string,
    updates: Partial<EmployeeCompensation>
  ): Promise<EmployeeCompensation> {
    const res = await APIClient.put<unknown>('/compensation/employee-compensation', {
      id,
      ...updates,
    });
    return APIClient.unwrapItem<EmployeeCompensation>(res) || (updates as EmployeeCompensation);
  }

  static async reviseCompensation(
    employeeId: string,
    newSalary: number,
    effectiveFrom: string,
    reason: string
  ): Promise<EmployeeCompensation> {
    const res = await APIClient.post<unknown>('/compensation/employee-compensation/revise', {
      employeeId,
      newSalary,
      effectiveFrom,
      reason,
    });
    return APIClient.unwrapItem<EmployeeCompensation>(res) || ({} as EmployeeCompensation);
  }

  static async deleteCompensation(id: string): Promise<void> {
    await APIClient.delete(`/compensation/employee-compensation?id=${id}`);
  }
}

export class GradeService {
  static async getGrades(): Promise<Grade[]> {
    const res = await APIClient.get<unknown>('/compensation/grades');
    return APIClient.unwrapList<Grade>(res);
  }

  static async getGradeById(id: string): Promise<Grade | null> {
    const res = await APIClient.get<unknown>(`/compensation/grades/${id}`);
    return APIClient.unwrapItem<Grade>(res);
  }

  static async createGrade(data: Grade): Promise<Grade> {
    const res = await APIClient.post<unknown>('/compensation/grades', data);
    return APIClient.unwrapItem<Grade>(res) || data;
  }

  static async updateGrade(id: string, updates: Partial<Grade>): Promise<Grade> {
    const res = await APIClient.put<unknown>('/compensation/grades', { id, ...updates });
    return APIClient.unwrapItem<Grade>(res) || (updates as Grade);
  }

  static async deleteGrade(id: string): Promise<void> {
    await APIClient.delete('/compensation/grades', { id });
  }
}

export class IncrementCycleService {
  static async getCycles(): Promise<IncrementCycle[]> {
    const res = await APIClient.get<unknown>('/compensation/increment-cycles');
    return APIClient.unwrapList<IncrementCycle>(res);
  }

  static async getCycleById(id: string): Promise<IncrementCycle | null> {
    const res = await APIClient.get<unknown>(`/compensation/increment-cycles/${id}`);
    return APIClient.unwrapItem<IncrementCycle>(res);
  }

  static async createCycle(data: IncrementCycle): Promise<IncrementCycle> {
    const res = await APIClient.post<unknown>('/compensation/increment-cycles', data);
    return APIClient.unwrapItem<IncrementCycle>(res) || data;
  }

  static async updateCycle(id: string, updates: Partial<IncrementCycle>): Promise<IncrementCycle> {
    const res = await APIClient.put<unknown>(`/compensation/increment-cycles/${id}`, updates);
    return APIClient.unwrapItem<IncrementCycle>(res) || (updates as IncrementCycle);
  }

  static async approveCycle(id: string): Promise<IncrementCycle> {
    const res = await APIClient.post<unknown>(`/compensation/increment-cycles/${id}/approve`, {});
    return APIClient.unwrapItem<IncrementCycle>(res) || ({} as IncrementCycle);
  }

  static async processCycle(id: string): Promise<IncrementCycle> {
    const res = await APIClient.post<unknown>(`/compensation/increment-cycles/${id}/process`, {});
    return APIClient.unwrapItem<IncrementCycle>(res) || ({} as IncrementCycle);
  }
}

export class IncrementProposalService {
  static async getProposals(): Promise<IncrementProposal[]> {
    const res = await APIClient.get<unknown>('/compensation/increment-proposals');
    return APIClient.unwrapList<IncrementProposal>(res);
  }

  static async getProposalById(id: string): Promise<IncrementProposal | null> {
    const res = await APIClient.get<unknown>(`/compensation/increment-proposals/${id}`);
    return APIClient.unwrapItem<IncrementProposal>(res);
  }

  static async createProposal(data: IncrementProposal): Promise<IncrementProposal> {
    const res = await APIClient.post<unknown>('/compensation/increment-proposals', data);
    return APIClient.unwrapItem<IncrementProposal>(res) || data;
  }

  static async updateProposal(
    id: string,
    updates: Partial<IncrementProposal>
  ): Promise<IncrementProposal> {
    const res = await APIClient.put<unknown>(`/compensation/increment-proposals/${id}`, updates);
    return APIClient.unwrapItem<IncrementProposal>(res) || (updates as IncrementProposal);
  }

  static async approveProposal(id: string, approvedBy: string): Promise<IncrementProposal> {
    const res = await APIClient.post<unknown>(`/compensation/increment-proposals/${id}/approve`, {
      approvedBy,
    });
    return APIClient.unwrapItem<IncrementProposal>(res) || ({} as IncrementProposal);
  }
}

export class BonusService {
  static async getSchemes(): Promise<BonusScheme[]> {
    const res = await APIClient.get<unknown>('/compensation/bonuses');
    return APIClient.unwrapList<BonusScheme>(res);
  }

  static async getSchemeById(id: string): Promise<BonusScheme | null> {
    const res = await APIClient.get<unknown>(`/compensation/bonuses/${id}`);
    return APIClient.unwrapItem<BonusScheme>(res);
  }

  static async createScheme(data: BonusScheme): Promise<BonusScheme> {
    const res = await APIClient.post<unknown>('/compensation/bonuses', data);
    return APIClient.unwrapItem<BonusScheme>(res) || data;
  }

  static async updateScheme(id: string, updates: Partial<BonusScheme>): Promise<BonusScheme> {
    const res = await APIClient.put<unknown>('/compensation/bonuses', { id, ...updates });
    return APIClient.unwrapItem<BonusScheme>(res) || (updates as BonusScheme);
  }

  static async getPayouts(): Promise<BonusPayout[]> {
    const res = await APIClient.get<unknown>('/compensation/bonuses');
    return APIClient.unwrapList<BonusPayout>(res);
  }

  static async createPayout(data: BonusPayout): Promise<BonusPayout> {
    const res = await APIClient.post<unknown>('/compensation/bonuses', data);
    return APIClient.unwrapItem<BonusPayout>(res) || data;
  }

  static async updatePayout(id: string, updates: Partial<BonusPayout>): Promise<BonusPayout> {
    const res = await APIClient.put<unknown>('/compensation/bonuses', { id, ...updates });
    return APIClient.unwrapItem<BonusPayout>(res) || (updates as BonusPayout);
  }

  static async approvePayout(id: string, approvedBy: string): Promise<BonusPayout> {
    const res = await APIClient.put<unknown>('/compensation/bonuses', {
      id,
      approvedBy,
      approvalStatus: 'APPROVED',
    });
    return APIClient.unwrapItem<BonusPayout>(res) || ({} as BonusPayout);
  }
}

export class StockGrantService {
  static async getGrants(): Promise<StockGrant[]> {
    const res = await APIClient.get<unknown>('/compensation/stock-grants');
    return APIClient.unwrapList<StockGrant>(res);
  }

  static async getGrantById(id: string): Promise<StockGrant | null> {
    const res = await APIClient.get<unknown>(`/compensation/stock-grants/${id}`);
    return APIClient.unwrapItem<StockGrant>(res);
  }

  static async createGrant(data: StockGrant): Promise<StockGrant> {
    const res = await APIClient.post<unknown>('/compensation/stock-grants', data);
    return APIClient.unwrapItem<StockGrant>(res) || data;
  }

  static async updateGrant(id: string, updates: Partial<StockGrant>): Promise<StockGrant> {
    const res = await APIClient.put<unknown>(`/compensation/stock-grants/${id}`, updates);
    return APIClient.unwrapItem<StockGrant>(res) || (updates as StockGrant);
  }

  static async vestUnits(grantId: string, units: number): Promise<StockGrant> {
    const res = await APIClient.post<unknown>(`/compensation/stock-grants/${grantId}/vest`, {
      units,
    });
    return APIClient.unwrapItem<StockGrant>(res) || ({} as StockGrant);
  }
}

export class LoanService {
  static async getSchemes(): Promise<LoanScheme[]> {
    const res = await APIClient.get<unknown>('/compensation/loan-schemes');
    return APIClient.unwrapList<LoanScheme>(res);
  }

  static async getSchemeById(id: string): Promise<LoanScheme | null> {
    const res = await APIClient.get<unknown>(`/compensation/loan-schemes/${id}`);
    return APIClient.unwrapItem<LoanScheme>(res);
  }

  static async createScheme(data: LoanScheme): Promise<LoanScheme> {
    const res = await APIClient.post<unknown>('/compensation/loan-schemes', data);
    return APIClient.unwrapItem<LoanScheme>(res) || data;
  }

  static async updateScheme(id: string, updates: Partial<LoanScheme>): Promise<LoanScheme> {
    const res = await APIClient.put<unknown>(`/compensation/loan-schemes/${id}`, updates);
    return APIClient.unwrapItem<LoanScheme>(res) || (updates as LoanScheme);
  }

  static async getLoans(): Promise<EmployeeLoan[]> {
    const res = await APIClient.get<unknown>('/compensation/employee-loans');
    return APIClient.unwrapList<EmployeeLoan>(res);
  }

  static async getLoanById(id: string): Promise<EmployeeLoan | null> {
    const res = await APIClient.get<unknown>(`/compensation/employee-loans/${id}`);
    return APIClient.unwrapItem<EmployeeLoan>(res);
  }

  static async createLoan(data: EmployeeLoan): Promise<EmployeeLoan> {
    const res = await APIClient.post<unknown>('/compensation/employee-loans', data);
    return APIClient.unwrapItem<EmployeeLoan>(res) || data;
  }

  static async updateLoan(id: string, updates: Partial<EmployeeLoan>): Promise<EmployeeLoan> {
    const res = await APIClient.put<unknown>(`/compensation/employee-loans/${id}`, updates);
    return APIClient.unwrapItem<EmployeeLoan>(res) || (updates as EmployeeLoan);
  }

  static async approveLoan(id: string, approvedBy: string): Promise<EmployeeLoan> {
    const res = await APIClient.post<unknown>(`/compensation/employee-loans/${id}/approve`, {
      approvedBy,
    });
    return APIClient.unwrapItem<EmployeeLoan>(res) || ({} as EmployeeLoan);
  }
}

export class ArrearsService {
  static async getRequests(): Promise<ArrearsRequest[]> {
    const res = await APIClient.get<unknown>('/compensation/arrears-requests');
    return APIClient.unwrapList<ArrearsRequest>(res);
  }

  static async getRequestById(id: string): Promise<ArrearsRequest | null> {
    const res = await APIClient.get<unknown>(`/compensation/arrears-requests/${id}`);
    return APIClient.unwrapItem<ArrearsRequest>(res);
  }

  static async createRequest(data: ArrearsRequest): Promise<ArrearsRequest> {
    const res = await APIClient.post<unknown>('/compensation/arrears-requests', data);
    return APIClient.unwrapItem<ArrearsRequest>(res) || data;
  }

  static async updateRequest(
    id: string,
    updates: Partial<ArrearsRequest>
  ): Promise<ArrearsRequest> {
    const res = await APIClient.put<unknown>(`/compensation/arrears-requests/${id}`, updates);
    return APIClient.unwrapItem<ArrearsRequest>(res) || (updates as ArrearsRequest);
  }

  static async approveRequest(id: string, approvedBy: string): Promise<ArrearsRequest> {
    const res = await APIClient.post<unknown>(`/compensation/arrears-requests/${id}/approve`, {
      approvedBy,
    });
    return APIClient.unwrapItem<ArrearsRequest>(res) || ({} as ArrearsRequest);
  }
}

export class TotalRewardsService {
  static async getStatements(): Promise<TotalRewardsStatement[]> {
    const res = await APIClient.get<unknown>('/compensation/total-rewards');
    return APIClient.unwrapList<TotalRewardsStatement>(res);
  }

  static async getStatementById(id: string): Promise<TotalRewardsStatement | null> {
    const res = await APIClient.get<unknown>(`/compensation/total-rewards/${id}`);
    return APIClient.unwrapItem<TotalRewardsStatement>(res);
  }

  static async generateStatement(
    employeeId: string,
    fiscalYear: string
  ): Promise<TotalRewardsStatement> {
    const res = await APIClient.post<unknown>('/compensation/total-rewards/generate', {
      employeeId,
      fiscalYear,
    });
    return APIClient.unwrapItem<TotalRewardsStatement>(res) || ({} as TotalRewardsStatement);
  }
}

export class MarketBenchmarkService {
  static async getBenchmarks(): Promise<MarketBenchmark[]> {
    const res = await APIClient.get<unknown>('/compensation/market-benchmarks');
    return APIClient.unwrapList<MarketBenchmark>(res);
  }

  static async createBenchmark(data: MarketBenchmark): Promise<MarketBenchmark> {
    const res = await APIClient.post<unknown>('/compensation/market-benchmarks', data);
    return APIClient.unwrapItem<MarketBenchmark>(res) || data;
  }
}

export class BudgetSimulationService {
  static async getSimulations(): Promise<BudgetSimulation[]> {
    const res = await APIClient.get<unknown>('/compensation/budget-simulations');
    return APIClient.unwrapList<BudgetSimulation>(res);
  }

  static async createSimulation(data: BudgetSimulation): Promise<BudgetSimulation> {
    const res = await APIClient.post<unknown>('/compensation/budget-simulations', data);
    return APIClient.unwrapItem<BudgetSimulation>(res) || data;
  }
}

export class CompensationAnalyticsService {
  static async getMetrics(): Promise<CompensationMetrics> {
    const res = await APIClient.get<unknown>('/compensation/analytics');
    return APIClient.unwrapItem<CompensationMetrics>(res) || ({} as CompensationMetrics);
  }
}

export class CompensationSettingsService {
  static async getSettings(): Promise<CompensationSettings> {
    const res = await APIClient.get<unknown>('/compensation/settings');
    return APIClient.unwrapItem<CompensationSettings>(res) || ({} as CompensationSettings);
  }

  static async updateSettings(
    updates: Partial<CompensationSettings>
  ): Promise<CompensationSettings> {
    const res = await APIClient.put<unknown>('/compensation/settings', updates);
    return APIClient.unwrapItem<CompensationSettings>(res) || ({} as CompensationSettings);
  }
}
