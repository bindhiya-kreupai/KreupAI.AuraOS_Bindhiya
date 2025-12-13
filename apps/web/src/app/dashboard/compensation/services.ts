/**
 * Compensation Module - Service Layer
 *
 * API-ready service classes with localStorage persistence
 * 14 service classes covering all compensation management needs
 */

import {
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

const STORAGE_KEYS = {
    SALARY_COMPONENTS: 'compensation_salary_components',
    SALARY_STRUCTURES: 'compensation_salary_structures',
    EMPLOYEE_COMPENSATION: 'compensation_employee_compensation',
    GRADES: 'compensation_grades',
    INCREMENT_CYCLES: 'compensation_increment_cycles',
    INCREMENT_PROPOSALS: 'compensation_increment_proposals',
    BONUS_SCHEMES: 'compensation_bonus_schemes',
    BONUS_PAYOUTS: 'compensation_bonus_payouts',
    STOCK_GRANTS: 'compensation_stock_grants',
    LOAN_SCHEMES: 'compensation_loan_schemes',
    EMPLOYEE_LOANS: 'compensation_employee_loans',
    ARREARS_REQUESTS: 'compensation_arrears_requests',
    TOTAL_REWARDS: 'compensation_total_rewards',
    MARKET_BENCHMARKS: 'compensation_market_benchmarks',
    BUDGET_SIMULATIONS: 'compensation_budget_simulations',
    SETTINGS: 'compensation_settings',
};

// TODO: Replace localStorage with actual API calls

export class SalaryComponentService {
    static async getComponents(): Promise<SalaryComponent[]> {
        const stored = localStorage.getItem(STORAGE_KEYS.SALARY_COMPONENTS);
        return stored ? JSON.parse(stored) : [];
    }

    static async getComponentById(id: string): Promise<SalaryComponent | null> {
        const components = await this.getComponents();
        return components.find(c => c.id === id) || null;
    }

    static async createComponent(data: SalaryComponent): Promise<SalaryComponent> {
        const components = await this.getComponents();
        components.push({ ...data, updatedAt: new Date().toISOString() });
        localStorage.setItem(STORAGE_KEYS.SALARY_COMPONENTS, JSON.stringify(components));
        return data;
    }

    static async updateComponent(id: string, updates: Partial<SalaryComponent>): Promise<SalaryComponent> {
        const components = await this.getComponents();
        const index = components.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Component not found');

        components[index] = { ...components[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.SALARY_COMPONENTS, JSON.stringify(components));
        return components[index];
    }

    static async deleteComponent(id: string): Promise<void> {
        const components = await this.getComponents();
        const filtered = components.filter(c => c.id !== id);
        localStorage.setItem(STORAGE_KEYS.SALARY_COMPONENTS, JSON.stringify(filtered));
    }
}

export class SalaryStructureService {
    static async getStructures(): Promise<SalaryStructure[]> {
        const stored = localStorage.getItem(STORAGE_KEYS.SALARY_STRUCTURES);
        return stored ? JSON.parse(stored) : [];
    }

    static async getStructureById(id: string): Promise<SalaryStructure | null> {
        const structures = await this.getStructures();
        return structures.find(s => s.id === id) || null;
    }

    static async createStructure(data: SalaryStructure): Promise<SalaryStructure> {
        const structures = await this.getStructures();
        structures.push({ ...data, updatedAt: new Date().toISOString() });
        localStorage.setItem(STORAGE_KEYS.SALARY_STRUCTURES, JSON.stringify(structures));
        return data;
    }

    static async updateStructure(id: string, updates: Partial<SalaryStructure>): Promise<SalaryStructure> {
        const structures = await this.getStructures();
        const index = structures.findIndex(s => s.id === id);
        if (index === -1) throw new Error('Structure not found');

        structures[index] = { ...structures[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.SALARY_STRUCTURES, JSON.stringify(structures));
        return structures[index];
    }

    static async deleteStructure(id: string): Promise<void> {
        const structures = await this.getStructures();
        const filtered = structures.filter(s => s.id !== id);
        localStorage.setItem(STORAGE_KEYS.SALARY_STRUCTURES, JSON.stringify(filtered));
    }

    static async cloneStructure(id: string, newName: string): Promise<SalaryStructure> {
        const structure = await this.getStructureById(id);
        if (!structure) throw new Error('Structure not found');

        const newStructure: SalaryStructure = {
            ...structure,
            id: `struct_${Date.now()}`,
            structureCode: `${structure.structureCode}_COPY`,
            structureName: newName,
            isTemplate: true,
            applicableCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        return this.createStructure(newStructure);
    }
}

export class EmployeeCompensationService {
    static async getCompensations(): Promise<EmployeeCompensation[]> {
        const stored = localStorage.getItem(STORAGE_KEYS.EMPLOYEE_COMPENSATION);
        return stored ? JSON.parse(stored) : [];
    }

    static async getCompensationById(id: string): Promise<EmployeeCompensation | null> {
        const compensations = await this.getCompensations();
        return compensations.find(c => c.id === id) || null;
    }

    static async getByEmployeeId(employeeId: string): Promise<EmployeeCompensation | null> {
        const compensations = await this.getCompensations();
        return compensations.find(c => c.employeeId === employeeId && c.isActive) || null;
    }

    static async createCompensation(data: EmployeeCompensation): Promise<EmployeeCompensation> {
        const compensations = await this.getCompensations();
        compensations.push({ ...data, updatedAt: new Date().toISOString() });
        localStorage.setItem(STORAGE_KEYS.EMPLOYEE_COMPENSATION, JSON.stringify(compensations));
        return data;
    }

    static async updateCompensation(id: string, updates: Partial<EmployeeCompensation>): Promise<EmployeeCompensation> {
        const compensations = await this.getCompensations();
        const index = compensations.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Compensation not found');

        compensations[index] = { ...compensations[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.EMPLOYEE_COMPENSATION, JSON.stringify(compensations));
        return compensations[index];
    }

    static async reviseCompensation(
        employeeId: string,
        newSalary: number,
        effectiveFrom: string,
        reason: string
    ): Promise<EmployeeCompensation> {
        // End current compensation
        const current = await this.getByEmployeeId(employeeId);
        if (current) {
            await this.updateCompensation(current.id, {
                isActive: false,
                effectiveTo: effectiveFrom,
            });
        }

        // Create new compensation record
        const newCompensation: EmployeeCompensation = {
            ...current!,
            id: `comp_${Date.now()}`,
            annualCTC: newSalary,
            monthlyCTC: newSalary / 12,
            effectiveFrom,
            effectiveTo: undefined,
            isActive: true,
            lastRevisionDate: effectiveFrom,
            notes: reason,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        return this.createCompensation(newCompensation);
    }
}

export class GradeService {
    static async getGrades(): Promise<Grade[]> {
        const stored = localStorage.getItem(STORAGE_KEYS.GRADES);
        return stored ? JSON.parse(stored) : [];
    }

    static async getGradeById(id: string): Promise<Grade | null> {
        const grades = await this.getGrades();
        return grades.find(g => g.id === id) || null;
    }

    static async createGrade(data: Grade): Promise<Grade> {
        const grades = await this.getGrades();
        grades.push({ ...data, updatedAt: new Date().toISOString() });
        localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(grades));
        return data;
    }

    static async updateGrade(id: string, updates: Partial<Grade>): Promise<Grade> {
        const grades = await this.getGrades();
        const index = grades.findIndex(g => g.id === id);
        if (index === -1) throw new Error('Grade not found');

        grades[index] = { ...grades[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(grades));
        return grades[index];
    }

    static async deleteGrade(id: string): Promise<void> {
        const grades = await this.getGrades();
        const filtered = grades.filter(g => g.id !== id);
        localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(filtered));
    }
}

export class IncrementCycleService {
    static async getCycles(): Promise<IncrementCycle[]> {
        const stored = localStorage.getItem(STORAGE_KEYS.INCREMENT_CYCLES);
        return stored ? JSON.parse(stored) : [];
    }

    static async getCycleById(id: string): Promise<IncrementCycle | null> {
        const cycles = await this.getCycles();
        return cycles.find(c => c.id === id) || null;
    }

    static async createCycle(data: IncrementCycle): Promise<IncrementCycle> {
        const cycles = await this.getCycles();
        cycles.push({ ...data, updatedAt: new Date().toISOString() });
        localStorage.setItem(STORAGE_KEYS.INCREMENT_CYCLES, JSON.stringify(cycles));
        return data;
    }

    static async updateCycle(id: string, updates: Partial<IncrementCycle>): Promise<IncrementCycle> {
        const cycles = await this.getCycles();
        const index = cycles.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Cycle not found');

        cycles[index] = { ...cycles[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.INCREMENT_CYCLES, JSON.stringify(cycles));
        return cycles[index];
    }

    static async approveCycle(id: string): Promise<IncrementCycle> {
        return this.updateCycle(id, {
            status: 'approved',
            updatedAt: new Date().toISOString(),
        });
    }

    static async processCycle(id: string): Promise<IncrementCycle> {
        const cycle = await this.getCycleById(id);
        if (!cycle || cycle.status !== 'approved') {
            throw new Error('Cycle must be approved before processing');
        }

        return this.updateCycle(id, {
            status: 'processed',
            processedDate: new Date().toISOString(),
        });
    }
}

export class IncrementProposalService {
    static async getProposals(): Promise<IncrementProposal[]> {
        const stored = localStorage.getItem(STORAGE_KEYS.INCREMENT_PROPOSALS);
        return stored ? JSON.parse(stored) : [];
    }

    static async getProposalById(id: string): Promise<IncrementProposal | null> {
        const proposals = await this.getProposals();
        return proposals.find(p => p.id === id) || null;
    }

    static async createProposal(data: IncrementProposal): Promise<IncrementProposal> {
        const proposals = await this.getProposals();
        proposals.push({ ...data, updatedAt: new Date().toISOString() });
        localStorage.setItem(STORAGE_KEYS.INCREMENT_PROPOSALS, JSON.stringify(proposals));
        return data;
    }

    static async updateProposal(id: string, updates: Partial<IncrementProposal>): Promise<IncrementProposal> {
        const proposals = await this.getProposals();
        const index = proposals.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Proposal not found');

        proposals[index] = { ...proposals[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.INCREMENT_PROPOSALS, JSON.stringify(proposals));
        return proposals[index];
    }

    static async approveProposal(id: string, approvedBy: string): Promise<IncrementProposal> {
        return this.updateProposal(id, {
            status: 'approved',
            approvedBy,
            approvedDate: new Date().toISOString(),
        });
    }
}

export class BonusService {
    static async getSchemes(): Promise<BonusScheme[]> {
        const stored = localStorage.getItem(STORAGE_KEYS.BONUS_SCHEMES);
        return stored ? JSON.parse(stored) : [];
    }

    static async getSchemeById(id: string): Promise<BonusScheme | null> {
        const schemes = await this.getSchemes();
        return schemes.find(s => s.id === id) || null;
    }

    static async createScheme(data: BonusScheme): Promise<BonusScheme> {
        const schemes = await this.getSchemes();
        schemes.push({ ...data, updatedAt: new Date().toISOString() });
        localStorage.setItem(STORAGE_KEYS.BONUS_SCHEMES, JSON.stringify(schemes));
        return data;
    }

    static async updateScheme(id: string, updates: Partial<BonusScheme>): Promise<BonusScheme> {
        const schemes = await this.getSchemes();
        const index = schemes.findIndex(s => s.id === id);
        if (index === -1) throw new Error('Scheme not found');

        schemes[index] = { ...schemes[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.BONUS_SCHEMES, JSON.stringify(schemes));
        return schemes[index];
    }

    static async getPayouts(): Promise<BonusPayout[]> {
        const stored = localStorage.getItem(STORAGE_KEYS.BONUS_PAYOUTS);
        return stored ? JSON.parse(stored) : [];
    }

    static async createPayout(data: BonusPayout): Promise<BonusPayout> {
        const payouts = await this.getPayouts();
        payouts.push({ ...data, updatedAt: new Date().toISOString() });
        localStorage.setItem(STORAGE_KEYS.BONUS_PAYOUTS, JSON.stringify(payouts));
        return data;
    }

    static async updatePayout(id: string, updates: Partial<BonusPayout>): Promise<BonusPayout> {
        const payouts = await this.getPayouts();
        const index = payouts.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Payout not found');

        payouts[index] = { ...payouts[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.BONUS_PAYOUTS, JSON.stringify(payouts));
        return payouts[index];
    }

    static async approvePayout(id: string, approvedBy: string): Promise<BonusPayout> {
        return this.updatePayout(id, {
            status: 'approved',
            approvedBy,
            approvedDate: new Date().toISOString(),
        });
    }
}

export class StockGrantService {
    static async getGrants(): Promise<StockGrant[]> {
        const stored = localStorage.getItem(STORAGE_KEYS.STOCK_GRANTS);
        return stored ? JSON.parse(stored) : [];
    }

    static async getGrantById(id: string): Promise<StockGrant | null> {
        const grants = await this.getGrants();
        return grants.find(g => g.id === id) || null;
    }

    static async createGrant(data: StockGrant): Promise<StockGrant> {
        const grants = await this.getGrants();
        grants.push({ ...data, updatedAt: new Date().toISOString() });
        localStorage.setItem(STORAGE_KEYS.STOCK_GRANTS, JSON.stringify(grants));
        return data;
    }

    static async updateGrant(id: string, updates: Partial<StockGrant>): Promise<StockGrant> {
        const grants = await this.getGrants();
        const index = grants.findIndex(g => g.id === id);
        if (index === -1) throw new Error('Grant not found');

        grants[index] = { ...grants[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.STOCK_GRANTS, JSON.stringify(grants));
        return grants[index];
    }

    static async vestUnits(grantId: string, units: number): Promise<StockGrant> {
        const grant = await this.getGrantById(grantId);
        if (!grant) throw new Error('Grant not found');

        return this.updateGrant(grantId, {
            vestedUnits: grant.vestedUnits + units,
            unvestedUnits: grant.unvestedUnits - units,
            status: grant.unvestedUnits - units === 0 ? 'vested' : 'vesting',
        });
    }
}

export class LoanService {
    static async getSchemes(): Promise<LoanScheme[]> {
        const stored = localStorage.getItem(STORAGE_KEYS.LOAN_SCHEMES);
        return stored ? JSON.parse(stored) : [];
    }

    static async getSchemeById(id: string): Promise<LoanScheme | null> {
        const schemes = await this.getSchemes();
        return schemes.find(s => s.id === id) || null;
    }

    static async createScheme(data: LoanScheme): Promise<LoanScheme> {
        const schemes = await this.getSchemes();
        schemes.push({ ...data, updatedAt: new Date().toISOString() });
        localStorage.setItem(STORAGE_KEYS.LOAN_SCHEMES, JSON.stringify(schemes));
        return data;
    }

    static async getLoans(): Promise<EmployeeLoan[]> {
        const stored = localStorage.getItem(STORAGE_KEYS.EMPLOYEE_LOANS);
        return stored ? JSON.parse(stored) : [];
    }

    static async getLoanById(id: string): Promise<EmployeeLoan | null> {
        const loans = await this.getLoans();
        return loans.find(l => l.id === id) || null;
    }

    static async createLoan(data: EmployeeLoan): Promise<EmployeeLoan> {
        const loans = await this.getLoans();
        loans.push({ ...data, updatedAt: new Date().toISOString() });
        localStorage.setItem(STORAGE_KEYS.EMPLOYEE_LOANS, JSON.stringify(loans));
        return data;
    }

    static async updateLoan(id: string, updates: Partial<EmployeeLoan>): Promise<EmployeeLoan> {
        const loans = await this.getLoans();
        const index = loans.findIndex(l => l.id === id);
        if (index === -1) throw new Error('Loan not found');

        loans[index] = { ...loans[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.EMPLOYEE_LOANS, JSON.stringify(loans));
        return loans[index];
    }

    static async approveLoan(id: string, approvedBy: string): Promise<EmployeeLoan> {
        return this.updateLoan(id, {
            status: 'approved',
            approvedBy,
            approvedDate: new Date().toISOString(),
        });
    }
}

export class ArrearsService {
    static async getRequests(): Promise<ArrearsRequest[]> {
        const stored = localStorage.getItem(STORAGE_KEYS.ARREARS_REQUESTS);
        return stored ? JSON.parse(stored) : [];
    }

    static async getRequestById(id: string): Promise<ArrearsRequest | null> {
        const requests = await this.getRequests();
        return requests.find(r => r.id === id) || null;
    }

    static async createRequest(data: ArrearsRequest): Promise<ArrearsRequest> {
        const requests = await this.getRequests();
        requests.push({ ...data, updatedAt: new Date().toISOString() });
        localStorage.setItem(STORAGE_KEYS.ARREARS_REQUESTS, JSON.stringify(requests));
        return data;
    }

    static async updateRequest(id: string, updates: Partial<ArrearsRequest>): Promise<ArrearsRequest> {
        const requests = await this.getRequests();
        const index = requests.findIndex(r => r.id === id);
        if (index === -1) throw new Error('Request not found');

        requests[index] = { ...requests[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.ARREARS_REQUESTS, JSON.stringify(requests));
        return requests[index];
    }

    static async approveRequest(id: string, approvedBy: string): Promise<ArrearsRequest> {
        return this.updateRequest(id, {
            status: 'approved',
            approvedBy,
            approvedDate: new Date().toISOString(),
        });
    }
}

export class TotalRewardsService {
    static async getStatements(): Promise<TotalRewardsStatement[]> {
        const stored = localStorage.getItem(STORAGE_KEYS.TOTAL_REWARDS);
        return stored ? JSON.parse(stored) : [];
    }

    static async getStatementById(id: string): Promise<TotalRewardsStatement | null> {
        const statements = await this.getStatements();
        return statements.find(s => s.id === id) || null;
    }

    static async generateStatement(employeeId: string, fiscalYear: string): Promise<TotalRewardsStatement> {
        const statement: TotalRewardsStatement = {
            id: `reward_${Date.now()}`,
            employeeId,
            employeeName: '',
            employeeCode: '',
            fiscalYear,
            generatedDate: new Date().toISOString(),
            directCompensation: {
                baseSalary: 0,
                allowances: 0,
                bonus: 0,
                incentives: 0,
                overtime: 0,
                total: 0,
            },
            benefits: {
                healthInsurance: 0,
                lifeInsurance: 0,
                retirementContributions: 0,
                paidTimeOff: 0,
                otherBenefits: 0,
                total: 0,
            },
            stockCompensation: {
                stockGrantsValue: 0,
                vestedValue: 0,
                unvestedValue: 0,
                total: 0,
            },
            otherCompensation: {
                loans: 0,
                advances: 0,
                reimbursements: 0,
                perquisites: 0,
                total: 0,
            },
            totalRewards: 0,
            currency: 'USD',
            createdAt: new Date().toISOString(),
        };

        const statements = await this.getStatements();
        statements.push(statement);
        localStorage.setItem(STORAGE_KEYS.TOTAL_REWARDS, JSON.stringify(statements));
        return statement;
    }
}

export class MarketBenchmarkService {
    static async getBenchmarks(): Promise<MarketBenchmark[]> {
        const stored = localStorage.getItem(STORAGE_KEYS.MARKET_BENCHMARKS);
        return stored ? JSON.parse(stored) : [];
    }

    static async createBenchmark(data: MarketBenchmark): Promise<MarketBenchmark> {
        const benchmarks = await this.getBenchmarks();
        benchmarks.push({ ...data, updatedAt: new Date().toISOString() });
        localStorage.setItem(STORAGE_KEYS.MARKET_BENCHMARKS, JSON.stringify(benchmarks));
        return data;
    }
}

export class BudgetSimulationService {
    static async getSimulations(): Promise<BudgetSimulation[]> {
        const stored = localStorage.getItem(STORAGE_KEYS.BUDGET_SIMULATIONS);
        return stored ? JSON.parse(stored) : [];
    }

    static async createSimulation(data: BudgetSimulation): Promise<BudgetSimulation> {
        const simulations = await this.getSimulations();
        simulations.push({ ...data, updatedAt: new Date().toISOString() });
        localStorage.setItem(STORAGE_KEYS.BUDGET_SIMULATIONS, JSON.stringify(simulations));
        return data;
    }
}

export class CompensationAnalyticsService {
    static async getMetrics(): Promise<CompensationMetrics> {
        const compensations = await EmployeeCompensationService.getCompensations();
        const active = compensations.filter(c => c.isActive);

        const totalCost = active.reduce((sum, c) => sum + c.annualCTC, 0);
        const salaries = active.map(c => c.annualCTC).sort((a, b) => a - b);
        const median = salaries[Math.floor(salaries.length / 2)] || 0;

        return {
            totalEmployees: active.length,
            totalCompensationCost: totalCost,
            averageCompensation: active.length > 0 ? totalCost / active.length : 0,
            medianCompensation: median,
            compensationByGrade: [],
            compensationByDepartment: [],
            payEquityMetrics: {
                genderPayGap: 0,
                ethnicityPayGap: 0,
                ageGroupAnalysis: [],
                compaRatioDistribution: {
                    belowRange: 0,
                    lowerQuartile: 0,
                    midRange: 0,
                    upperQuartile: 0,
                    aboveRange: 0,
                },
            },
            incrementMetrics: {
                totalIncrements: 0,
                totalIncrementsAmount: 0,
                averageIncrementPercentage: 0,
                incrementsByType: {},
                incrementsByGrade: {},
            },
            bonusMetrics: {
                totalBonuses: 0,
                totalBonusAmount: 0,
                averageBonusPercentage: 0,
                bonusByType: {},
                bonusByGrade: {},
            },
            stockMetrics: {
                totalGrants: 0,
                totalGrantValue: 0,
                totalVestedValue: 0,
                unvestedValue: 0,
                exercisedValue: 0,
            },
            loanMetrics: {
                totalLoans: 0,
                totalLoanAmount: 0,
                activeLoans: 0,
                outstandingAmount: 0,
                repaymentRate: 0,
            },
        };
    }
}

export class CompensationSettingsService {
    static async getSettings(): Promise<CompensationSettings> {
        const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (stored) return JSON.parse(stored);

        const defaults: CompensationSettings = {
            currency: 'USD',
            fiscalYearStart: '01-01',
            fiscalYearEnd: '12-31',
            defaultPayFrequency: 'monthly',
            incrementCycleFrequency: 'annual',
            incrementReviewMonth: 4,
            bonusReviewMonth: 12,
            enableMarketBenchmarking: true,
            enableStockGrants: true,
            enableLoans: true,
            autoNotifications: {
                incrementCycleStart: true,
                incrementProposalSubmitted: true,
                incrementApproved: true,
                bonusProcessed: true,
                stockGrantVested: true,
                loanDisbursed: true,
                emiDue: true,
                salaryRevisionDue: true,
            },
        };

        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaults));
        return defaults;
    }

    static async updateSettings(updates: Partial<CompensationSettings>): Promise<CompensationSettings> {
        const current = await this.getSettings();
        const updated = { ...current, ...updates };
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
        return updated;
    }
}
