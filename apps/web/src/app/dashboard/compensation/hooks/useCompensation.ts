/**
 * Compensation Management Module - Custom Hook
 * Business logic for compensation, grades, increments, bonuses, stocks, and loans
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  SalaryComponent,
  Grade,
  SalaryBand,
  SalaryStructure,
  EmployeeCompensation,
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
  CompensationMetrics,
  CompensationSettings
} from '../types';
import {
  SalaryComponentService,
  SalaryStructureService,
  EmployeeCompensationService,
  GradeService,
  IncrementCycleService,
  IncrementProposalService,
  BonusService,
  StockGrantService,
  LoanService,
  ArrearsService,
  TotalRewardsService,
  MarketBenchmarkService,
  CompensationAnalyticsService,
  CompensationSettingsService
} from '../services';
import {
  sampleComponents,
  sampleGrades,
  sampleBands,
  sampleStructures,
  sampleEmployeeCompensation,
  sampleIncrementCycle,
  sampleIncrementProposals,
  sampleBonusScheme,
  sampleBonusPayouts,
  sampleStockGrant,
  sampleLoanScheme,
  sampleEmployeeLoan,
  sampleArrearsRequest,
  sampleTotalRewards,
  sampleMarketBenchmark,
  sampleMetrics,
  sampleSettings
} from '../data';

interface UseCompensationReturn {
  // State
  components: SalaryComponent[];
  grades: Grade[];
  structures: SalaryStructure[];
  employeeCompensations: EmployeeCompensation[];
  incrementCycles: IncrementCycle[];
  incrementProposals: IncrementProposal[];
  bonusSchemes: BonusScheme[];
  bonusPayouts: BonusPayout[];
  stockGrants: StockGrant[];
  loanSchemes: LoanScheme[];
  employeeLoans: EmployeeLoan[];
  arrearsRequests: ArrearsRequest[];
  totalRewardsStatements: TotalRewardsStatement[];
  marketBenchmarks: MarketBenchmark[];
  metrics: CompensationMetrics | null;
  settings: CompensationSettings | null;

  // Loading & Error
  loading: boolean;
  error: string | null;

  // Salary Component Methods
  getComponents: () => Promise<SalaryComponent[]>;
  getComponentById: (id: string) => Promise<SalaryComponent | null>;
  createComponent: (data: SalaryComponent) => Promise<SalaryComponent>;
  updateComponent: (id: string, updates: Partial<SalaryComponent>) => Promise<void>;
  deleteComponent: (id: string) => Promise<void>;

  // Grade Methods
  getGrades: () => Promise<Grade[]>;
  getGradeById: (id: string) => Promise<Grade | null>;
  createGrade: (data: Grade) => Promise<Grade>;
  updateGrade: (id: string, updates: Partial<Grade>) => Promise<void>;
  deleteGrade: (id: string) => Promise<void>;

  // Salary Structure Methods
  getStructures: () => Promise<SalaryStructure[]>;
  getStructureById: (id: string) => Promise<SalaryStructure | null>;
  createStructure: (data: SalaryStructure) => Promise<SalaryStructure>;
  updateStructure: (id: string, updates: Partial<SalaryStructure>) => Promise<void>;
  deleteStructure: (id: string) => Promise<void>;
  cloneStructure: (id: string, newName: string) => Promise<SalaryStructure>;

  // Employee Compensation Methods
  getEmployeeCompensations: () => Promise<EmployeeCompensation[]>;
  getCompensationById: (id: string) => Promise<EmployeeCompensation | null>;
  getCompensationByEmployeeId: (employeeId: string) => Promise<EmployeeCompensation | null>;
  createCompensation: (data: EmployeeCompensation) => Promise<EmployeeCompensation>;
  updateCompensation: (id: string, updates: Partial<EmployeeCompensation>) => Promise<void>;
  reviseCompensation: (id: string, newSalary: number, effectiveDate: string, reason: string) => Promise<void>;

  // Increment Cycle Methods
  getIncrementCycles: () => Promise<IncrementCycle[]>;
  getIncrementCycleById: (id: string) => Promise<IncrementCycle | null>;
  createIncrementCycle: (data: IncrementCycle) => Promise<IncrementCycle>;
  updateIncrementCycle: (id: string, updates: Partial<IncrementCycle>) => Promise<void>;
  approveIncrementCycle: (id: string) => Promise<void>;
  processIncrementCycle: (id: string) => Promise<void>;

  // Increment Proposal Methods
  getIncrementProposals: () => Promise<IncrementProposal[]>;
  getProposalById: (id: string) => Promise<IncrementProposal | null>;
  getProposalsByCycle: (cycleId: string) => Promise<IncrementProposal[]>;
  createIncrementProposal: (data: IncrementProposal) => Promise<IncrementProposal>;
  updateIncrementProposal: (id: string, updates: Partial<IncrementProposal>) => Promise<void>;
  approveIncrementProposal: (id: string, approvedBy: string) => Promise<void>;
  rejectIncrementProposal: (id: string, reason: string) => Promise<void>;

  // Bonus Methods
  getBonusSchemes: () => Promise<BonusScheme[]>;
  getBonusSchemeById: (id: string) => Promise<BonusScheme | null>;
  createBonusScheme: (data: BonusScheme) => Promise<BonusScheme>;
  updateBonusScheme: (id: string, updates: Partial<BonusScheme>) => Promise<void>;
  getBonusPayouts: () => Promise<BonusPayout[]>;
  createBonusPayout: (data: BonusPayout) => Promise<BonusPayout>;
  approveBonusPayout: (id: string, approvedBy: string) => Promise<void>;

  // Stock Grant Methods
  getStockGrants: () => Promise<StockGrant[]>;
  getGrantById: (id: string) => Promise<StockGrant | null>;
  getGrantsByEmployee: (employeeId: string) => Promise<StockGrant[]>;
  createStockGrant: (data: StockGrant) => Promise<StockGrant>;
  updateStockGrant: (id: string, updates: Partial<StockGrant>) => Promise<void>;

  // Loan Methods
  getLoanSchemes: () => Promise<LoanScheme[]>;
  getLoanSchemeById: (id: string) => Promise<LoanScheme | null>;
  createLoanScheme: (data: LoanScheme) => Promise<LoanScheme>;
  getEmployeeLoans: () => Promise<EmployeeLoan[]>;
  getLoanById: (id: string) => Promise<EmployeeLoan | null>;
  getLoansByEmployee: (employeeId: string) => Promise<EmployeeLoan[]>;
  createEmployeeLoan: (data: EmployeeLoan) => Promise<EmployeeLoan>;
  approveLoan: (id: string, approvedBy: string) => Promise<void>;

  // Arrears Methods
  getArrearsRequests: () => Promise<ArrearsRequest[]>;
  getArrearsById: (id: string) => Promise<ArrearsRequest | null>;
  createArrearsRequest: (data: ArrearsRequest) => Promise<ArrearsRequest>;
  approveArrearsRequest: (id: string, approvedBy: string) => Promise<void>;

  // Total Rewards Methods
  getTotalRewardsStatements: () => Promise<TotalRewardsStatement[]>;
  getRewardsStatementById: (id: string) => Promise<TotalRewardsStatement | null>;
  getRewardsStatementByEmployee: (employeeId: string, fiscalYear: string) => Promise<TotalRewardsStatement | null>;
  generateRewardsStatement: (employeeId: string, fiscalYear: string) => Promise<TotalRewardsStatement>;

  // Market Benchmark Methods
  getMarketBenchmarks: () => Promise<MarketBenchmark[]>;
  getBenchmarkById: (id: string) => Promise<MarketBenchmark | null>;
  createMarketBenchmark: (data: MarketBenchmark) => Promise<MarketBenchmark>;

  // Analytics Methods
  getMetrics: () => Promise<CompensationMetrics>;
  refreshMetrics: () => Promise<void>;

  // Settings Methods
  getSettings: () => Promise<CompensationSettings>;
  updateSettings: (updates: Partial<CompensationSettings>) => Promise<void>;

  // Utility Methods
  refreshData: () => Promise<void>;
}

export function useCompensation(): UseCompensationReturn {
  // State Management
  const [components, setComponents] = useState<SalaryComponent[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [employeeCompensations, setEmployeeCompensations] = useState<EmployeeCompensation[]>([]);
  const [incrementCycles, setIncrementCycles] = useState<IncrementCycle[]>([]);
  const [incrementProposals, setIncrementProposals] = useState<IncrementProposal[]>([]);
  const [bonusSchemes, setBonusSchemes] = useState<BonusScheme[]>([]);
  const [bonusPayouts, setBonusPayouts] = useState<BonusPayout[]>([]);
  const [stockGrants, setStockGrants] = useState<StockGrant[]>([]);
  const [loanSchemes, setLoanSchemes] = useState<LoanScheme[]>([]);
  const [employeeLoans, setEmployeeLoans] = useState<EmployeeLoan[]>([]);
  const [arrearsRequests, setArrearsRequests] = useState<ArrearsRequest[]>([]);
  const [totalRewardsStatements, setTotalRewardsStatements] = useState<TotalRewardsStatement[]>([]);
  const [marketBenchmarks, setMarketBenchmarks] = useState<MarketBenchmark[]>([]);
  const [metrics, setMetrics] = useState<CompensationMetrics | null>(null);
  const [settings, setSettings] = useState<CompensationSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize data
  const initializeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize with sample data if localStorage is empty
      const storedComponents = await SalaryComponentService.getComponents();
      if (storedComponents.length === 0) {
        for (const component of sampleComponents) {
          await SalaryComponentService.createComponent(component);
        }
      }

      const storedGrades = await GradeService.getGrades();
      if (storedGrades.length === 0) {
        for (const grade of sampleGrades) {
          await GradeService.createGrade(grade);
        }
      }

      // Load all data
      setComponents(await SalaryComponentService.getComponents());
      setGrades(await GradeService.getGrades());
      setStructures(await SalaryStructureService.getStructures());
      setEmployeeCompensations(await EmployeeCompensationService.getCompensations());
      setIncrementCycles(await IncrementCycleService.getCycles());
      setIncrementProposals(await IncrementProposalService.getProposals());
      setBonusSchemes(await BonusService.getSchemes());
      setBonusPayouts(await BonusService.getPayouts());
      setStockGrants(await StockGrantService.getGrants());
      setLoanSchemes(await LoanService.getSchemes());
      setEmployeeLoans(await LoanService.getLoans());
      setArrearsRequests(await ArrearsService.getRequests());
      setTotalRewardsStatements(await TotalRewardsService.getStatements());
      setMarketBenchmarks(await MarketBenchmarkService.getBenchmarks());
      setMetrics(await CompensationAnalyticsService.getMetrics());
      setSettings(await CompensationSettingsService.getSettings());

    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to load compensation data');
      console.error('Error initializing compensation data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Salary Component Methods
  const getComponents = async (): Promise<SalaryComponent[]> => {
    try {
      const data = await SalaryComponentService.getComponents();
      setComponents(data);
      return data;
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to get components');
      return [];
    }
  };

  const getComponentById = async (id: string): Promise<SalaryComponent | null> => {
    try {
      return await SalaryComponentService.getComponentById(id);
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to get component');
      return null;
    }
  };

  const createComponent = async (data: SalaryComponent): Promise<SalaryComponent> => {
    try {
      setLoading(true);
      const created = await SalaryComponentService.createComponent(data);
      setComponents(await SalaryComponentService.getComponents());
      return created;
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to create component');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateComponent = async (id: string, updates: Partial<SalaryComponent>): Promise<void> => {
    try {
      setLoading(true);
      await SalaryComponentService.updateComponent(id, updates);
      setComponents(await SalaryComponentService.getComponents());
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to update component');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteComponent = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      await SalaryComponentService.deleteComponent(id);
      setComponents(await SalaryComponentService.getComponents());
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to delete component');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Grade Methods
  const getGrades = async (): Promise<Grade[]> => {
    try {
      const data = await GradeService.getGrades();
      setGrades(data);
      return data;
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to get grades');
      return [];
    }
  };

  const getGradeById = async (id: string): Promise<Grade | null> => {
    try {
      return await GradeService.getGradeById(id);
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to get grade');
      return null;
    }
  };

  const createGrade = async (data: Grade): Promise<Grade> => {
    try {
      setLoading(true);
      const created = await GradeService.createGrade(data);
      setGrades(await GradeService.getGrades());
      return created;
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to create grade');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateGrade = async (id: string, updates: Partial<Grade>): Promise<void> => {
    try {
      setLoading(true);
      await GradeService.updateGrade(id, updates);
      setGrades(await GradeService.getGrades());
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to update grade');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteGrade = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      await GradeService.deleteGrade(id);
      setGrades(await GradeService.getGrades());
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to delete grade');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Salary Structure Methods
  const getStructures = async (): Promise<SalaryStructure[]> => {
    try {
      const data = await SalaryStructureService.getStructures();
      setStructures(data);
      return data;
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to get structures');
      return [];
    }
  };

  const getStructureById = async (id: string): Promise<SalaryStructure | null> => {
    try {
      return await SalaryStructureService.getStructureById(id);
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to get structure');
      return null;
    }
  };

  const createStructure = async (data: SalaryStructure): Promise<SalaryStructure> => {
    try {
      setLoading(true);
      const created = await SalaryStructureService.createStructure(data);
      setStructures(await SalaryStructureService.getStructures());
      return created;
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to create structure');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateStructure = async (id: string, updates: Partial<SalaryStructure>): Promise<void> => {
    try {
      setLoading(true);
      await SalaryStructureService.updateStructure(id, updates);
      setStructures(await SalaryStructureService.getStructures());
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to update structure');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteStructure = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      await SalaryStructureService.deleteStructure(id);
      setStructures(await SalaryStructureService.getStructures());
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to delete structure');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cloneStructure = async (id: string, newName: string): Promise<SalaryStructure> => {
    try {
      setLoading(true);
      const cloned = await SalaryStructureService.cloneStructure(id, newName);
      setStructures(await SalaryStructureService.getStructures());
      return cloned;
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to clone structure');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Employee Compensation Methods
  const getEmployeeCompensations = async (): Promise<EmployeeCompensation[]> => {
    try {
      const data = await EmployeeCompensationService.getCompensations();
      setEmployeeCompensations(data);
      return data;
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to get employee compensations');
      return [];
    }
  };

  const getCompensationById = async (id: string): Promise<EmployeeCompensation | null> => {
    try {
      return await EmployeeCompensationService.getCompensationById(id);
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to get compensation');
      return null;
    }
  };

  const getCompensationByEmployeeId = async (employeeId: string): Promise<EmployeeCompensation | null> => {
    try {
      return await EmployeeCompensationService.getByEmployeeId(employeeId);
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to get employee compensation');
      return null;
    }
  };

  const createCompensation = async (data: EmployeeCompensation): Promise<EmployeeCompensation> => {
    try {
      setLoading(true);
      const created = await EmployeeCompensationService.createCompensation(data);
      setEmployeeCompensations(await EmployeeCompensationService.getCompensations());
      return created;
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to create compensation');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCompensation = async (id: string, updates: Partial<EmployeeCompensation>): Promise<void> => {
    try {
      setLoading(true);
      await EmployeeCompensationService.updateCompensation(id, updates);
      setEmployeeCompensations(await EmployeeCompensationService.getCompensations());
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to update compensation');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const reviseCompensation = async (id: string, newSalary: number, effectiveDate: string, reason: string): Promise<void> => {
    try {
      setLoading(true);
      await EmployeeCompensationService.reviseCompensation(id, newSalary, effectiveDate, reason);
      setEmployeeCompensations(await EmployeeCompensationService.getCompensations());
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to revise compensation');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Increment Cycle Methods
  const getIncrementCycles = async (): Promise<IncrementCycle[]> => {
    try {
      const data = await IncrementCycleService.getCycles();
      setIncrementCycles(data);
      return data;
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to get increment cycles');
      return [];
    }
  };

  const getIncrementCycleById = async (id: string): Promise<IncrementCycle | null> => {
    try {
      return await IncrementCycleService.getCycleById(id);
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to get increment cycle');
      return null;
    }
  };

  const createIncrementCycle = async (data: IncrementCycle): Promise<IncrementCycle> => {
    try {
      setLoading(true);
      const created = await IncrementCycleService.createCycle(data);
      setIncrementCycles(await IncrementCycleService.getCycles());
      return created;
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to create increment cycle');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateIncrementCycle = async (id: string, updates: Partial<IncrementCycle>): Promise<void> => {
    try {
      setLoading(true);
      await IncrementCycleService.updateCycle(id, updates);
      setIncrementCycles(await IncrementCycleService.getCycles());
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to update increment cycle');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const approveIncrementCycle = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      await IncrementCycleService.approveCycle(id);
      setIncrementCycles(await IncrementCycleService.getCycles());
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to approve increment cycle');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const processIncrementCycle = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      await IncrementCycleService.processCycle(id);
      setIncrementCycles(await IncrementCycleService.getCycles());
      setEmployeeCompensations(await EmployeeCompensationService.getCompensations());
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to process increment cycle');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Increment Proposal Methods
  const getIncrementProposals = async (): Promise<IncrementProposal[]> => {
    try {
      const data = await IncrementProposalService.getProposals();
      setIncrementProposals(data);
      return data;
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to get increment proposals');
      return [];
    }
  };

  const getProposalById = async (id: string): Promise<IncrementProposal | null> => {
    try {
      return await IncrementProposalService.getProposalById(id);
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to get proposal');
      return null;
    }
  };

  const getProposalsByCycle = async (cycleId: string): Promise<IncrementProposal[]> => {
    try {
      const all = await IncrementProposalService.getProposals();
      return all.filter(p => p.cycleId === cycleId);
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to get proposals by cycle');
      return [];
    }
  };

  const createIncrementProposal = async (data: IncrementProposal): Promise<IncrementProposal> => {
    try {
      setLoading(true);
      const created = await IncrementProposalService.createProposal(data);
      setIncrementProposals(await IncrementProposalService.getProposals());
      return created;
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to create increment proposal');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateIncrementProposal = async (id: string, updates: Partial<IncrementProposal>): Promise<void> => {
    try {
      setLoading(true);
      await IncrementProposalService.updateProposal(id, updates);
      setIncrementProposals(await IncrementProposalService.getProposals());
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to update increment proposal');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const approveIncrementProposal = async (id: string, approvedBy: string): Promise<void> => {
    try {
      setLoading(true);
      await IncrementProposalService.approveProposal(id, approvedBy);
      setIncrementProposals(await IncrementProposalService.getProposals());
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to approve increment proposal');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const rejectIncrementProposal = async (id: string, reason: string): Promise<void> => {
    try {
      setLoading(true);
      await IncrementProposalService.rejectProposal(id, reason);
      setIncrementProposals(await IncrementProposalService.getProposals());
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to reject increment proposal');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Bonus Methods
  const getBonusSchemes = async (): Promise<BonusScheme[]> => {
    try {
      const data = await BonusService.getSchemes();
      setBonusSchemes(data);
      return data;
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to get bonus schemes');
      return [];
    }
  };

  const getBonusSchemeById = async (id: string): Promise<BonusScheme | null> => {
    try {
      return await BonusService.getSchemeById(id);
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to get bonus scheme');
      return null;
    }
  };

  const createBonusScheme = async (data: BonusScheme): Promise<BonusScheme> => {
    try {
      setLoading(true);
      const created = await BonusService.createScheme(data);
      setBonusSchemes(await BonusService.getSchemes());
      return created;
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to create bonus scheme');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateBonusScheme = async (id: string, updates: Partial<BonusScheme>): Promise<void> => {
    try {
      setLoading(true);
      await BonusService.updateScheme(id, updates);
      setBonusSchemes(await BonusService.getSchemes());
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to update bonus scheme');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getBonusPayouts = async (): Promise<BonusPayout[]> => {
    try {
      const data = await BonusService.getPayouts();
      setBonusPayouts(data);
      return data;
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to get bonus payouts');
      return [];
    }
  };

  const createBonusPayout = async (data: BonusPayout): Promise<BonusPayout> => {
    try {
      setLoading(true);
      const created = await BonusService.createPayout(data);
      setBonusPayouts(await BonusService.getPayouts());
      return created;
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to create bonus payout');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const approveBonusPayout = async (id: string, approvedBy: string): Promise<void> => {
    try {
      setLoading(true);
      await BonusService.approvePayout(id, approvedBy);
      setBonusPayouts(await BonusService.getPayouts());
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to approve bonus payout');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Stock Grant Methods
  const getStockGrants = async (): Promise<StockGrant[]> => {
    try {
      const data = await StockGrantService.getGrants();
      setStockGrants(data);
      return data;
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to get stock grants');
      return [];
    }
  };

  const getGrantById = async (id: string): Promise<StockGrant | null> => {
    try {
      return await StockGrantService.getGrantById(id);
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to get stock grant');
      return null;
    }
  };

  const getGrantsByEmployee = async (employeeId: string): Promise<StockGrant[]> => {
    try {
      return await StockGrantService.getGrantsByEmployee(employeeId);
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to get employee stock grants');
      return [];
    }
  };

  const createStockGrant = async (data: StockGrant): Promise<StockGrant> => {
    try {
      setLoading(true);
      const created = await StockGrantService.createGrant(data);
      setStockGrants(await StockGrantService.getGrants());
      return created;
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to create stock grant');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateStockGrant = async (id: string, updates: Partial<StockGrant>): Promise<void> => {
    try {
      setLoading(true);
      await StockGrantService.updateGrant(id, updates);
      setStockGrants(await StockGrantService.getGrants());
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to update stock grant');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Loan Methods
  const getLoanSchemes = async (): Promise<LoanScheme[]> => {
    try {
      const data = await LoanService.getSchemes();
      setLoanSchemes(data);
      return data;
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to get loan schemes');
      return [];
    }
  };

  const getLoanSchemeById = async (id: string): Promise<LoanScheme | null> => {
    try {
      return await LoanService.getSchemeById(id);
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to get loan scheme');
      return null;
    }
  };

  const createLoanScheme = async (data: LoanScheme): Promise<LoanScheme> => {
    try {
      setLoading(true);
      const created = await LoanService.createScheme(data);
      setLoanSchemes(await LoanService.getSchemes());
      return created;
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to create loan scheme');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeLoans = async (): Promise<EmployeeLoan[]> => {
    try {
      const data = await LoanService.getLoans();
      setEmployeeLoans(data);
      return data;
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to get employee loans');
      return [];
    }
  };

  const getLoanById = async (id: string): Promise<EmployeeLoan | null> => {
    try {
      return await LoanService.getLoanById(id);
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to get loan');
      return null;
    }
  };

  const getLoansByEmployee = async (employeeId: string): Promise<EmployeeLoan[]> => {
    try {
      return await LoanService.getLoansByEmployee(employeeId);
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to get employee loans');
      return [];
    }
  };

  const createEmployeeLoan = async (data: EmployeeLoan): Promise<EmployeeLoan> => {
    try {
      setLoading(true);
      const created = await LoanService.createLoan(data);
      setEmployeeLoans(await LoanService.getLoans());
      return created;
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to create employee loan');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const approveLoan = async (id: string, approvedBy: string): Promise<void> => {
    try {
      setLoading(true);
      await LoanService.approveLoan(id, approvedBy);
      setEmployeeLoans(await LoanService.getLoans());
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to approve loan');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Arrears Methods
  const getArrearsRequests = async (): Promise<ArrearsRequest[]> => {
    try {
      const data = await ArrearsService.getRequests();
      setArrearsRequests(data);
      return data;
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to get arrears requests');
      return [];
    }
  };

  const getArrearsById = async (id: string): Promise<ArrearsRequest | null> => {
    try {
      return await ArrearsService.getRequestById(id);
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to get arrears request');
      return null;
    }
  };

  const createArrearsRequest = async (data: ArrearsRequest): Promise<ArrearsRequest> => {
    try {
      setLoading(true);
      const created = await ArrearsService.createRequest(data);
      setArrearsRequests(await ArrearsService.getRequests());
      return created;
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to create arrears request');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const approveArrearsRequest = async (id: string, approvedBy: string): Promise<void> => {
    try {
      setLoading(true);
      await ArrearsService.approveRequest(id, approvedBy);
      setArrearsRequests(await ArrearsService.getRequests());
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to approve arrears request');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Total Rewards Methods
  const getTotalRewardsStatements = async (): Promise<TotalRewardsStatement[]> => {
    try {
      const data = await TotalRewardsService.getStatements();
      setTotalRewardsStatements(data);
      return data;
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to get total rewards statements');
      return [];
    }
  };

  const getRewardsStatementById = async (id: string): Promise<TotalRewardsStatement | null> => {
    try {
      return await TotalRewardsService.getStatementById(id);
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to get rewards statement');
      return null;
    }
  };

  const getRewardsStatementByEmployee = async (employeeId: string, fiscalYear: string): Promise<TotalRewardsStatement | null> => {
    try {
      return await TotalRewardsService.getStatementByEmployee(employeeId, fiscalYear);
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to get employee rewards statement');
      return null;
    }
  };

  const generateRewardsStatement = async (employeeId: string, fiscalYear: string): Promise<TotalRewardsStatement> => {
    try {
      setLoading(true);
      const generated = await TotalRewardsService.generateStatement(employeeId, fiscalYear);
      setTotalRewardsStatements(await TotalRewardsService.getStatements());
      return generated;
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to generate rewards statement');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Market Benchmark Methods
  const getMarketBenchmarks = async (): Promise<MarketBenchmark[]> => {
    try {
      const data = await MarketBenchmarkService.getBenchmarks();
      setMarketBenchmarks(data);
      return data;
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to get market benchmarks');
      return [];
    }
  };

  const getBenchmarkById = async (id: string): Promise<MarketBenchmark | null> => {
    try {
      return await MarketBenchmarkService.getBenchmarks(id);
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to get market benchmark');
      return null;
    }
  };

  const createMarketBenchmark = async (data: MarketBenchmark): Promise<MarketBenchmark> => {
    try {
      setLoading(true);
      const created = await MarketBenchmarkService.createBenchmark(data);
      setMarketBenchmarks(await MarketBenchmarkService.getBenchmarks());
      return created;
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to create market benchmark');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Analytics Methods
  const getMetrics = async (): Promise<CompensationMetrics> => {
    try {
      const data = await CompensationAnalyticsService.getMetrics();
      setMetrics(data);
      return data;
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to get metrics');
      throw error;
    }
  };

  const refreshMetrics = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await CompensationAnalyticsService.getMetrics();
      setMetrics(data);
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to refresh metrics');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Settings Methods
  const getSettings = async (): Promise<CompensationSettings> => {
    try {
      const data = await CompensationSettingsService.getSettings();
      setSettings(data);
      return data;
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to get settings');
      throw error;
    }
  };

  const updateSettings = async (updates: Partial<CompensationSettings>): Promise<void> => {
    try {
      setLoading(true);
      await CompensationSettingsService.updateSettings(updates);
      setSettings(await CompensationSettingsService.getSettings());
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to update settings');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Utility Methods
  const refreshData = async (): Promise<void> => {
    await initializeData();
  };

  return {
    // State
    components,
    grades,
    structures,
    employeeCompensations,
    incrementCycles,
    incrementProposals,
    bonusSchemes,
    bonusPayouts,
    stockGrants,
    loanSchemes,
    employeeLoans,
    arrearsRequests,
    totalRewardsStatements,
    marketBenchmarks,
    metrics,
    settings,
    loading,
    error,

    // Component Methods
    getComponents,
    getComponentById,
    createComponent,
    updateComponent,
    deleteComponent,

    // Grade Methods
    getGrades,
    getGradeById,
    createGrade,
    updateGrade,
    deleteGrade,

    // Structure Methods
    getStructures,
    getStructureById,
    createStructure,
    updateStructure,
    deleteStructure,
    cloneStructure,

    // Employee Compensation Methods
    getEmployeeCompensations,
    getCompensationById,
    getCompensationByEmployeeId,
    createCompensation,
    updateCompensation,
    reviseCompensation,

    // Increment Cycle Methods
    getIncrementCycles,
    getIncrementCycleById,
    createIncrementCycle,
    updateIncrementCycle,
    approveIncrementCycle,
    processIncrementCycle,

    // Increment Proposal Methods
    getIncrementProposals,
    getProposalById,
    getProposalsByCycle,
    createIncrementProposal,
    updateIncrementProposal,
    approveIncrementProposal,
    rejectIncrementProposal,

    // Bonus Methods
    getBonusSchemes,
    getBonusSchemeById,
    createBonusScheme,
    updateBonusScheme,
    getBonusPayouts,
    createBonusPayout,
    approveBonusPayout,

    // Stock Grant Methods
    getStockGrants,
    getGrantById,
    getGrantsByEmployee,
    createStockGrant,
    updateStockGrant,

    // Loan Methods
    getLoanSchemes,
    getLoanSchemeById,
    createLoanScheme,
    getEmployeeLoans,
    getLoanById,
    getLoansByEmployee,
    createEmployeeLoan,
    approveLoan,

    // Arrears Methods
    getArrearsRequests,
    getArrearsById,
    createArrearsRequest,
    approveArrearsRequest,

    // Total Rewards Methods
    getTotalRewardsStatements,
    getRewardsStatementById,
    getRewardsStatementByEmployee,
    generateRewardsStatement,

    // Market Benchmark Methods
    getMarketBenchmarks,
    getBenchmarkById,
    createMarketBenchmark,

    // Analytics Methods
    getMetrics,
    refreshMetrics,

    // Settings Methods
    getSettings,
    updateSettings,

    // Utility Methods
    refreshData
  };
}
