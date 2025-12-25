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
        return APIClient.get<SalaryComponent[]>('/compensation/salary-components');
    }

    static async getComponentById(id: string): Promise<SalaryComponent | null> {
        return APIClient.get<SalaryComponent>(`/compensation/salary-components/${id}`);
    }

    static async createComponent(data: SalaryComponent): Promise<SalaryComponent> {
        return APIClient.post<SalaryComponent>('/compensation/salary-components', data);
    }

    static async updateComponent(id: string, updates: Partial<SalaryComponent>): Promise<SalaryComponent> {
        return APIClient.put<SalaryComponent>(`/compensation/salary-components/${id}`, updates);
    }

    static async deleteComponent(id: string): Promise<void> {
        return APIClient.delete(`/compensation/salary-components/${id}`);
    }
}

export class SalaryStructureService {
    static async getStructures(): Promise<SalaryStructure[]> {
        return APIClient.get<SalaryStructure[]>('/compensation/salary-structures');
    }

    static async getStructureById(id: string): Promise<SalaryStructure | null> {
        return APIClient.get<SalaryStructure>(`/compensation/salary-structures/${id}`);
    }

    static async createStructure(data: SalaryStructure): Promise<SalaryStructure> {
        return APIClient.post<SalaryStructure>('/compensation/salary-structures', data);
    }

    static async updateStructure(id: string, updates: Partial<SalaryStructure>): Promise<SalaryStructure> {
        return APIClient.put<SalaryStructure>(`/compensation/salary-structures/${id}`, updates);
    }

    static async deleteStructure(id: string): Promise<void> {
        return APIClient.delete(`/compensation/salary-structures/${id}`);
    }

    static async cloneStructure(id: string, newName: string): Promise<SalaryStructure> {
        return APIClient.post<SalaryStructure>(`/compensation/salary-structures/${id}/clone`, { newName });
    }
}

export class EmployeeCompensationService {
    static async getCompensations(): Promise<EmployeeCompensation[]> {
        return APIClient.get<EmployeeCompensation[]>('/compensation/employee-compensation');
    }

    static async getCompensationById(id: string): Promise<EmployeeCompensation | null> {
        return APIClient.get<EmployeeCompensation>(`/compensation/employee-compensation/${id}`);
    }

    static async getByEmployeeId(employeeId: string): Promise<EmployeeCompensation | null> {
        return APIClient.get<EmployeeCompensation>(`/compensation/employee-compensation/employee/${employeeId}`);
    }

    static async createCompensation(data: EmployeeCompensation): Promise<EmployeeCompensation> {
        return APIClient.post<EmployeeCompensation>('/compensation/employee-compensation', data);
    }

    static async updateCompensation(id: string, updates: Partial<EmployeeCompensation>): Promise<EmployeeCompensation> {
        return APIClient.put<EmployeeCompensation>(`/compensation/employee-compensation/${id}`, updates);
    }

    static async reviseCompensation(
        employeeId: string,
        newSalary: number,
        effectiveFrom: string,
        reason: string
    ): Promise<EmployeeCompensation> {
        return APIClient.post<EmployeeCompensation>('/compensation/employee-compensation/revise', {
            employeeId,
            newSalary,
            effectiveFrom,
            reason,
        });
    }
}

export class GradeService {
    static async getGrades(): Promise<Grade[]> {
        return APIClient.get<Grade[]>('/compensation/grades');
    }

    static async getGradeById(id: string): Promise<Grade | null> {
        return APIClient.get<Grade>(`/compensation/grades/${id}`);
    }

    static async createGrade(data: Grade): Promise<Grade> {
        return APIClient.post<Grade>('/compensation/grades', data);
    }

    static async updateGrade(id: string, updates: Partial<Grade>): Promise<Grade> {
        return APIClient.put<Grade>(`/compensation/grades/${id}`, updates);
    }

    static async deleteGrade(id: string): Promise<void> {
        return APIClient.delete(`/compensation/grades/${id}`);
    }
}

export class IncrementCycleService {
    static async getCycles(): Promise<IncrementCycle[]> {
        return APIClient.get<IncrementCycle[]>('/compensation/increment-cycles');
    }

    static async getCycleById(id: string): Promise<IncrementCycle | null> {
        return APIClient.get<IncrementCycle>(`/compensation/increment-cycles/${id}`);
    }

    static async createCycle(data: IncrementCycle): Promise<IncrementCycle> {
        return APIClient.post<IncrementCycle>('/compensation/increment-cycles', data);
    }

    static async updateCycle(id: string, updates: Partial<IncrementCycle>): Promise<IncrementCycle> {
        return APIClient.put<IncrementCycle>(`/compensation/increment-cycles/${id}`, updates);
    }

    static async approveCycle(id: string): Promise<IncrementCycle> {
        return APIClient.post<IncrementCycle>(`/compensation/increment-cycles/${id}/approve`, {});
    }

    static async processCycle(id: string): Promise<IncrementCycle> {
        return APIClient.post<IncrementCycle>(`/compensation/increment-cycles/${id}/process`, {});
    }
}

export class IncrementProposalService {
    static async getProposals(): Promise<IncrementProposal[]> {
        return APIClient.get<IncrementProposal[]>('/compensation/increment-proposals');
    }

    static async getProposalById(id: string): Promise<IncrementProposal | null> {
        return APIClient.get<IncrementProposal>(`/compensation/increment-proposals/${id}`);
    }

    static async createProposal(data: IncrementProposal): Promise<IncrementProposal> {
        return APIClient.post<IncrementProposal>('/compensation/increment-proposals', data);
    }

    static async updateProposal(id: string, updates: Partial<IncrementProposal>): Promise<IncrementProposal> {
        return APIClient.put<IncrementProposal>(`/compensation/increment-proposals/${id}`, updates);
    }

    static async approveProposal(id: string, approvedBy: string): Promise<IncrementProposal> {
        return APIClient.post<IncrementProposal>(`/compensation/increment-proposals/${id}/approve`, { approvedBy });
    }
}

export class BonusService {
    static async getSchemes(): Promise<BonusScheme[]> {
        return APIClient.get<BonusScheme[]>('/compensation/bonus-schemes');
    }

    static async getSchemeById(id: string): Promise<BonusScheme | null> {
        return APIClient.get<BonusScheme>(`/compensation/bonus-schemes/${id}`);
    }

    static async createScheme(data: BonusScheme): Promise<BonusScheme> {
        return APIClient.post<BonusScheme>('/compensation/bonus-schemes', data);
    }

    static async updateScheme(id: string, updates: Partial<BonusScheme>): Promise<BonusScheme> {
        return APIClient.put<BonusScheme>(`/compensation/bonus-schemes/${id}`, updates);
    }

    static async getPayouts(): Promise<BonusPayout[]> {
        return APIClient.get<BonusPayout[]>('/compensation/bonus-payouts');
    }

    static async createPayout(data: BonusPayout): Promise<BonusPayout> {
        return APIClient.post<BonusPayout>('/compensation/bonus-payouts', data);
    }

    static async updatePayout(id: string, updates: Partial<BonusPayout>): Promise<BonusPayout> {
        return APIClient.put<BonusPayout>(`/compensation/bonus-payouts/${id}`, updates);
    }

    static async approvePayout(id: string, approvedBy: string): Promise<BonusPayout> {
        return APIClient.post<BonusPayout>(`/compensation/bonus-payouts/${id}/approve`, { approvedBy });
    }
}

export class StockGrantService {
    static async getGrants(): Promise<StockGrant[]> {
        return APIClient.get<StockGrant[]>('/compensation/stock-grants');
    }

    static async getGrantById(id: string): Promise<StockGrant | null> {
        return APIClient.get<StockGrant>(`/compensation/stock-grants/${id}`);
    }

    static async createGrant(data: StockGrant): Promise<StockGrant> {
        return APIClient.post<StockGrant>('/compensation/stock-grants', data);
    }

    static async updateGrant(id: string, updates: Partial<StockGrant>): Promise<StockGrant> {
        return APIClient.put<StockGrant>(`/compensation/stock-grants/${id}`, updates);
    }

    static async vestUnits(grantId: string, units: number): Promise<StockGrant> {
        return APIClient.post<StockGrant>(`/compensation/stock-grants/${grantId}/vest`, { units });
    }
}

export class LoanService {
    static async getSchemes(): Promise<LoanScheme[]> {
        return APIClient.get<LoanScheme[]>('/compensation/loan-schemes');
    }

    static async getSchemeById(id: string): Promise<LoanScheme | null> {
        return APIClient.get<LoanScheme>(`/compensation/loan-schemes/${id}`);
    }

    static async createScheme(data: LoanScheme): Promise<LoanScheme> {
        return APIClient.post<LoanScheme>('/compensation/loan-schemes', data);
    }

    static async getLoans(): Promise<EmployeeLoan[]> {
        return APIClient.get<EmployeeLoan[]>('/compensation/employee-loans');
    }

    static async getLoanById(id: string): Promise<EmployeeLoan | null> {
        return APIClient.get<EmployeeLoan>(`/compensation/employee-loans/${id}`);
    }

    static async createLoan(data: EmployeeLoan): Promise<EmployeeLoan> {
        return APIClient.post<EmployeeLoan>('/compensation/employee-loans', data);
    }

    static async updateLoan(id: string, updates: Partial<EmployeeLoan>): Promise<EmployeeLoan> {
        return APIClient.put<EmployeeLoan>(`/compensation/employee-loans/${id}`, updates);
    }

    static async approveLoan(id: string, approvedBy: string): Promise<EmployeeLoan> {
        return APIClient.post<EmployeeLoan>(`/compensation/employee-loans/${id}/approve`, { approvedBy });
    }
}

export class ArrearsService {
    static async getRequests(): Promise<ArrearsRequest[]> {
        return APIClient.get<ArrearsRequest[]>('/compensation/arrears-requests');
    }

    static async getRequestById(id: string): Promise<ArrearsRequest | null> {
        return APIClient.get<ArrearsRequest>(`/compensation/arrears-requests/${id}`);
    }

    static async createRequest(data: ArrearsRequest): Promise<ArrearsRequest> {
        return APIClient.post<ArrearsRequest>('/compensation/arrears-requests', data);
    }

    static async updateRequest(id: string, updates: Partial<ArrearsRequest>): Promise<ArrearsRequest> {
        return APIClient.put<ArrearsRequest>(`/compensation/arrears-requests/${id}`, updates);
    }

    static async approveRequest(id: string, approvedBy: string): Promise<ArrearsRequest> {
        return APIClient.post<ArrearsRequest>(`/compensation/arrears-requests/${id}/approve`, { approvedBy });
    }
}

export class TotalRewardsService {
    static async getStatements(): Promise<TotalRewardsStatement[]> {
        return APIClient.get<TotalRewardsStatement[]>('/compensation/total-rewards');
    }

    static async getStatementById(id: string): Promise<TotalRewardsStatement | null> {
        return APIClient.get<TotalRewardsStatement>(`/compensation/total-rewards/${id}`);
    }

    static async generateStatement(employeeId: string, fiscalYear: string): Promise<TotalRewardsStatement> {
        return APIClient.post<TotalRewardsStatement>('/compensation/total-rewards/generate', { employeeId, fiscalYear });
    }
}

export class MarketBenchmarkService {
    static async getBenchmarks(): Promise<MarketBenchmark[]> {
        return APIClient.get<MarketBenchmark[]>('/compensation/market-benchmarks');
    }

    static async createBenchmark(data: MarketBenchmark): Promise<MarketBenchmark> {
        return APIClient.post<MarketBenchmark>('/compensation/market-benchmarks', data);
    }
}

export class BudgetSimulationService {
    static async getSimulations(): Promise<BudgetSimulation[]> {
        return APIClient.get<BudgetSimulation[]>('/compensation/budget-simulations');
    }

    static async createSimulation(data: BudgetSimulation): Promise<BudgetSimulation> {
        return APIClient.post<BudgetSimulation>('/compensation/budget-simulations', data);
    }
}

export class CompensationAnalyticsService {
    static async getMetrics(): Promise<CompensationMetrics> {
        return APIClient.get<CompensationMetrics>('/compensation/analytics');
    }
}

export class CompensationSettingsService {
    static async getSettings(): Promise<CompensationSettings> {
        return APIClient.get<CompensationSettings>('/compensation/settings');
    }

    static async updateSettings(updates: Partial<CompensationSettings>): Promise<CompensationSettings> {
        return APIClient.put<CompensationSettings>('/compensation/settings', updates);
    }
}
