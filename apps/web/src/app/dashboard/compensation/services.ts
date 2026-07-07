/**
 * Compensation Module - Service Layer
 *
 * API-integrated service classes using APIClient.
 *
 * NOTE: every compensation API route returns the wrapped envelope
 *   { success: true, data: <payload> }
 * so each method unwraps via APIClient.unwrapList / unwrapItem before handing
 * data to pages. Pages can therefore treat results as plain arrays / objects.
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
    const res = await APIClient.get('/compensation/salary-components');
    return APIClient.unwrapList<SalaryComponent>(res, 'components');
  }

  static async getComponentById(id: string): Promise<SalaryComponent | null> {
    const res = await APIClient.get(`/compensation/salary-components/${id}`);
    return APIClient.unwrapItem<SalaryComponent>(res);
  }

  static async createComponent(data: Partial<SalaryComponent>): Promise<SalaryComponent | null> {
    const res = await APIClient.post('/compensation/salary-components', data);
    return APIClient.unwrapItem<SalaryComponent>(res);
  }

  static async updateComponent(
    id: string,
    updates: Partial<SalaryComponent>
  ): Promise<SalaryComponent | null> {
    const res = await APIClient.put('/compensation/salary-components', { id, ...updates });
    return APIClient.unwrapItem<SalaryComponent>(res);
  }

  static async deleteComponent(id: string): Promise<void> {
    await APIClient.delete('/compensation/salary-components', { id });
  }
}

export class SalaryStructureService {
  static async getStructures(): Promise<SalaryStructure[]> {
    const res = await APIClient.get('/compensation/salary-structures');
    return APIClient.unwrapList<SalaryStructure>(res, 'structures');
  }

  static async createStructure(data: Partial<SalaryStructure>): Promise<SalaryStructure | null> {
    const res = await APIClient.post('/compensation/salary-structures', data);
    return APIClient.unwrapItem<SalaryStructure>(res);
  }

  static async updateStructure(
    id: string,
    updates: Partial<SalaryStructure>
  ): Promise<SalaryStructure | null> {
    const res = await APIClient.put('/compensation/salary-structures', { id, ...updates });
    return APIClient.unwrapItem<SalaryStructure>(res);
  }
}

export class EmployeeCompensationService {
  static async getCompensations(): Promise<EmployeeCompensation[]> {
    const res = await APIClient.get('/compensation/employee-compensation');
    return APIClient.unwrapList<EmployeeCompensation>(res, 'compensations');
  }

  static async getByEmployeeId(employeeId: string): Promise<EmployeeCompensation | null> {
    const res = await APIClient.get('/compensation/employee-compensation', { employeeId });
    const list = APIClient.unwrapList<EmployeeCompensation>(res, 'compensations');
    return list[0] ?? null;
  }

  static async createCompensation(
    data: Partial<EmployeeCompensation>
  ): Promise<EmployeeCompensation | null> {
    const res = await APIClient.post('/compensation/employee-compensation', data);
    return APIClient.unwrapItem<EmployeeCompensation>(res);
  }

  static async updateCompensation(
    id: string,
    updates: Partial<EmployeeCompensation>
  ): Promise<EmployeeCompensation | null> {
    const res = await APIClient.put('/compensation/employee-compensation', { id, ...updates });
    return APIClient.unwrapItem<EmployeeCompensation>(res);
  }

  static async reviseCompensation(
    employeeId: string,
    newSalary: number,
    effectiveFrom: string,
    reason: string
  ): Promise<EmployeeCompensation | null> {
    const res = await APIClient.post('/compensation/employee-compensation', {
      employeeId,
      annualCTC: newSalary,
      annualGross: newSalary,
      annualBasic: Math.round(newSalary * 0.5),
      effectiveFrom,
      remarks: reason,
      isActive: true,
    });
    return APIClient.unwrapItem<EmployeeCompensation>(res);
  }
}

export class GradeService {
  static async getGrades(): Promise<Grade[]> {
    const res = await APIClient.get('/compensation/grades');
    return APIClient.unwrapList<Grade>(res, 'grades');
  }

  static async createGrade(data: Partial<Grade>): Promise<Grade | null> {
    const res = await APIClient.post('/compensation/grades', data);
    return APIClient.unwrapItem<Grade>(res);
  }

  static async updateGrade(id: string, updates: Partial<Grade>): Promise<Grade | null> {
    const res = await APIClient.put('/compensation/grades', { id, ...updates });
    return APIClient.unwrapItem<Grade>(res);
  }

  static async deleteGrade(id: string): Promise<void> {
    await APIClient.delete('/compensation/grades', { id });
  }
}

export class IncrementCycleService {
  static async getCycles(): Promise<IncrementCycle[]> {
    const res = await APIClient.get('/compensation/increment-cycles');
    return APIClient.unwrapList<IncrementCycle>(res, 'cycles');
  }

  static async createCycle(data: Partial<IncrementCycle>): Promise<IncrementCycle | null> {
    const res = await APIClient.post('/compensation/increment-cycles', data);
    return APIClient.unwrapItem<IncrementCycle>(res);
  }

  static async updateCycle(
    id: string,
    updates: Partial<IncrementCycle>
  ): Promise<IncrementCycle | null> {
    const res = await APIClient.put('/compensation/increment-cycles', { id, ...updates });
    return APIClient.unwrapItem<IncrementCycle>(res);
  }
}

export class IncrementProposalService {
  static async getProposals(cycleId?: string): Promise<IncrementProposal[]> {
    const res = await APIClient.get(
      '/compensation/increment-proposals',
      cycleId ? { cycleId } : undefined
    );
    return APIClient.unwrapList<IncrementProposal>(res, 'proposals');
  }

  static async createProposal(data: Partial<IncrementProposal>): Promise<IncrementProposal | null> {
    const res = await APIClient.post('/compensation/increment-proposals', data);
    return APIClient.unwrapItem<IncrementProposal>(res);
  }

  static async updateProposal(
    id: string,
    updates: Partial<IncrementProposal>
  ): Promise<IncrementProposal | null> {
    const res = await APIClient.put('/compensation/increment-proposals', { id, ...updates });
    return APIClient.unwrapItem<IncrementProposal>(res);
  }
}

export class BonusService {
  static async getSchemes(): Promise<BonusScheme[]> {
    const res = await APIClient.get('/compensation/bonus-schemes');
    return APIClient.unwrapList<BonusScheme>(res, 'schemes');
  }

  static async createScheme(data: Partial<BonusScheme>): Promise<BonusScheme | null> {
    const res = await APIClient.post('/compensation/bonus-schemes', data);
    return APIClient.unwrapItem<BonusScheme>(res);
  }

  static async updateScheme(
    id: string,
    updates: Partial<BonusScheme>
  ): Promise<BonusScheme | null> {
    const res = await APIClient.put('/compensation/bonus-schemes', { id, ...updates });
    return APIClient.unwrapItem<BonusScheme>(res);
  }

  static async getPayouts(): Promise<BonusPayout[]> {
    const res = await APIClient.get('/compensation/bonuses');
    return APIClient.unwrapList<BonusPayout>(res, 'payouts');
  }

  static async createPayout(data: Partial<BonusPayout>): Promise<BonusPayout | null> {
    const res = await APIClient.post('/compensation/bonuses', data);
    return APIClient.unwrapItem<BonusPayout>(res);
  }

  static async releasePayout(id: string): Promise<BonusPayout | null> {
    const res = await APIClient.put('/compensation/bonuses', {
      id,
      isProcessed: true,
      approvalStatus: 'APPROVED',
    });
    return APIClient.unwrapItem<BonusPayout>(res);
  }
}

export class StockGrantService {
  static async getGrants(): Promise<StockGrant[]> {
    const res = await APIClient.get('/compensation/stock-grants');
    return APIClient.unwrapList<StockGrant>(res, 'grants');
  }

  static async createGrant(data: Partial<StockGrant>): Promise<StockGrant | null> {
    const res = await APIClient.post('/compensation/stock-grants', data);
    return APIClient.unwrapItem<StockGrant>(res);
  }

  static async updateGrant(id: string, updates: Partial<StockGrant>): Promise<StockGrant | null> {
    const res = await APIClient.put('/compensation/stock-grants', { id, ...updates });
    return APIClient.unwrapItem<StockGrant>(res);
  }
}

export class LoanService {
  static async getSchemes(): Promise<LoanScheme[]> {
    const res = await APIClient.get('/compensation/loan-schemes');
    return APIClient.unwrapList<LoanScheme>(res, 'schemes');
  }

  static async createScheme(data: Partial<LoanScheme>): Promise<LoanScheme | null> {
    const res = await APIClient.post('/compensation/loan-schemes', data);
    return APIClient.unwrapItem<LoanScheme>(res);
  }

  static async getLoans(): Promise<EmployeeLoan[]> {
    const res = await APIClient.get('/compensation/employee-loans');
    return APIClient.unwrapList<EmployeeLoan>(res, 'loans');
  }

  static async createLoan(data: Partial<EmployeeLoan>): Promise<EmployeeLoan | null> {
    const res = await APIClient.post('/compensation/employee-loans', data);
    return APIClient.unwrapItem<EmployeeLoan>(res);
  }

  static async updateLoan(
    id: string,
    updates: Partial<EmployeeLoan>
  ): Promise<EmployeeLoan | null> {
    const res = await APIClient.put('/compensation/employee-loans', { id, ...updates });
    return APIClient.unwrapItem<EmployeeLoan>(res);
  }
}

export class ArrearsService {
  static async getRequests(): Promise<ArrearsRequest[]> {
    const res = await APIClient.get('/compensation/arrears-requests');
    return APIClient.unwrapList<ArrearsRequest>(res, 'requests');
  }

  static async createRequest(data: Partial<ArrearsRequest>): Promise<ArrearsRequest | null> {
    const res = await APIClient.post('/compensation/arrears-requests', data);
    return APIClient.unwrapItem<ArrearsRequest>(res);
  }

  static async runCalculation(id: string): Promise<ArrearsRequest | null> {
    const res = await APIClient.put('/compensation/arrears-requests', { id, action: 'calculate' });
    return APIClient.unwrapItem<ArrearsRequest>(res);
  }

  static async updateRequest(
    id: string,
    updates: Partial<ArrearsRequest>
  ): Promise<ArrearsRequest | null> {
    const res = await APIClient.put('/compensation/arrears-requests', { id, ...updates });
    return APIClient.unwrapItem<ArrearsRequest>(res);
  }
}

export class TotalRewardsService {
  static async getStatements(): Promise<TotalRewardsStatement[]> {
    const res = await APIClient.get('/compensation/total-rewards');
    return APIClient.unwrapList<TotalRewardsStatement>(res, 'statements');
  }

  static async generateStatement(
    employeeId: string,
    fiscalYear: string
  ): Promise<TotalRewardsStatement | null> {
    const res = await APIClient.post('/compensation/total-rewards', { employeeId, fiscalYear });
    return APIClient.unwrapItem<TotalRewardsStatement>(res);
  }
}

export class MarketBenchmarkService {
  static async getBenchmarks(search?: string): Promise<MarketBenchmark[]> {
    const res = await APIClient.get(
      '/compensation/market-benchmarks',
      search ? { search } : undefined
    );
    return APIClient.unwrapList<MarketBenchmark>(res, 'benchmarks');
  }

  static async createBenchmark(data: Partial<MarketBenchmark>): Promise<MarketBenchmark | null> {
    const res = await APIClient.post('/compensation/market-benchmarks', data);
    return APIClient.unwrapItem<MarketBenchmark>(res);
  }
}

export class BudgetSimulationService {
  static async getSimulations(): Promise<BudgetSimulation[]> {
    const res = await APIClient.get('/compensation/budget-simulations');
    return APIClient.unwrapList<BudgetSimulation>(res, 'simulations');
  }

  static async createSimulation(data: Partial<BudgetSimulation>): Promise<BudgetSimulation | null> {
    const res = await APIClient.post('/compensation/budget-simulations', data);
    return APIClient.unwrapItem<BudgetSimulation>(res);
  }
}

export class CompensationAnalyticsService {
  static async getMetrics(): Promise<CompensationMetrics | null> {
    const res = await APIClient.get('/compensation/analytics');
    return APIClient.unwrapItem<CompensationMetrics>(res);
  }
}

export class CompensationSettingsService {
  static async getSettings(): Promise<CompensationSettings | null> {
    const res = await APIClient.get('/compensation/settings');
    return APIClient.unwrapItem<CompensationSettings>(res);
  }

  static async updateSettings(
    updates: Partial<CompensationSettings>
  ): Promise<CompensationSettings | null> {
    const res = await APIClient.put('/compensation/settings', updates);
    return APIClient.unwrapItem<CompensationSettings>(res);
  }
}
