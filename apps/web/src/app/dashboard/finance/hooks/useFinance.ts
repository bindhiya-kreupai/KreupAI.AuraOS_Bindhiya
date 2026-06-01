/**
 * Finance & Budget Management Module - Custom Hook
 * Centralized state management and business logic
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  Budget,
  BudgetVarianceReport,
  BudgetTemplate,
  BudgetScenario,
  Vendor,
  VendorContract,
  PettyCashFund,
  PettyCashTransaction,
  PettyCashReconciliation,
  FinancialAsset,
  FinanceMetrics,
  FinanceSettings,
} from '../types';
import {
  BudgetService,
  BudgetVarianceService,
  BudgetTemplateService,
  BudgetScenarioService,
  VendorService,
  VendorContractService,
  PettyCashService,
  FinancialAssetService,
  FinanceAnalyticsService,
  FinanceSettingsService,
} from '../services';

export interface UseFinanceReturn {
  // Budgets
  budgets: Budget[];
  createBudget: (data: Budget) => Promise<Budget>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<Budget>;
  deleteBudget: (id: string) => Promise<void>;
  approveBudget: (id: string, approvedBy: string) => Promise<Budget>;
  rejectBudget: (id: string, reason: string) => Promise<Budget>;
  createFromTemplate: (templateId: string, budgetData: Partial<Budget>) => Promise<Budget>;

  // Budget Variance
  varianceReports: BudgetVarianceReport[];
  generateVarianceReport: (budgetId: string, periodEnd: string) => Promise<BudgetVarianceReport>;

  // Budget Templates
  templates: BudgetTemplate[];
  createTemplate: (data: BudgetTemplate) => Promise<BudgetTemplate>;
  updateTemplate: (id: string, updates: Partial<BudgetTemplate>) => Promise<BudgetTemplate>;
  deleteTemplate: (id: string) => Promise<void>;

  // Budget Scenarios
  scenarios: BudgetScenario[];
  createScenario: (data: BudgetScenario) => Promise<BudgetScenario>;
  updateScenario: (id: string, updates: Partial<BudgetScenario>) => Promise<BudgetScenario>;
  deleteScenario: (id: string) => Promise<void>;
  runScenario: (id: string) => Promise<BudgetScenario>;

  // Vendors
  vendors: Vendor[];
  createVendor: (data: Vendor) => Promise<Vendor>;
  updateVendor: (id: string, updates: Partial<Vendor>) => Promise<Vendor>;
  deleteVendor: (id: string) => Promise<void>;
  approveVendor: (id: string, approvedBy: string) => Promise<Vendor>;
  rejectVendor: (id: string) => Promise<Vendor>;

  // Vendor Contracts
  contracts: VendorContract[];
  createContract: (data: VendorContract) => Promise<VendorContract>;
  updateContract: (id: string, updates: Partial<VendorContract>) => Promise<VendorContract>;
  deleteContract: (id: string) => Promise<void>;
  recordPayment: (contractId: string, scheduleId: string, invoiceNumber: string) => Promise<void>;

  // Petty Cash
  pettyCashFunds: PettyCashFund[];
  pettyCashTransactions: PettyCashTransaction[];
  pettyCashReconciliations: PettyCashReconciliation[];
  createPettyCashFund: (data: PettyCashFund) => Promise<PettyCashFund>;
  updatePettyCashFund: (id: string, updates: Partial<PettyCashFund>) => Promise<PettyCashFund>;
  createPettyCashTransaction: (data: PettyCashTransaction) => Promise<PettyCashTransaction>;
  approvePettyCashTransaction: (transactionId: string, approvedBy: string) => Promise<PettyCashTransaction>;
  createPettyCashReconciliation: (data: PettyCashReconciliation) => Promise<PettyCashReconciliation>;

  // Financial Assets
  assets: FinancialAsset[];
  createAsset: (data: FinancialAsset) => Promise<FinancialAsset>;
  updateAsset: (id: string, updates: Partial<FinancialAsset>) => Promise<FinancialAsset>;
  deleteAsset: (id: string) => Promise<void>;
  calculateDepreciation: (assetId: string) => Promise<number>;

  // Analytics & Settings
  metrics: FinanceMetrics | null;
  settings: FinanceSettings | null;
  updateSettings: (updates: Partial<FinanceSettings>) => Promise<FinanceSettings>;

  // Global State
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export function useFinance(): UseFinanceReturn {
  // State
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [varianceReports, setVarianceReports] = useState<BudgetVarianceReport[]>([]);
  const [templates, setTemplates] = useState<BudgetTemplate[]>([]);
  const [scenarios, setScenarios] = useState<BudgetScenario[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [contracts, setContracts] = useState<VendorContract[]>([]);
  const [pettyCashFunds, setPettyCashFunds] = useState<PettyCashFund[]>([]);
  const [pettyCashTransactions, setPettyCashTransactions] = useState<PettyCashTransaction[]>([]);
  const [pettyCashReconciliations, setPettyCashReconciliations] = useState<PettyCashReconciliation[]>([]);
  const [assets, setAssets] = useState<FinancialAsset[]>([]);
  const [metrics, setMetrics] = useState<FinanceMetrics | null>(null);
  const [settings, setSettings] = useState<FinanceSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Data
  const initializeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        budgetsData,
        varianceData,
        templatesData,
        scenariosData,
        vendorsData,
        contractsData,
        fundsData,
        transactionsData,
        reconciliationsData,
        assetsData,
        metricsData,
        settingsData,
      ] = await Promise.all([
        BudgetService.getBudgets(),
        BudgetVarianceService.getReports(),
        BudgetTemplateService.getTemplates(),
        BudgetScenarioService.getScenarios(),
        VendorService.getVendors(),
        VendorContractService.getContracts(),
        PettyCashService.getFunds(),
        PettyCashService.getTransactions(),
        PettyCashService.getReconciliations(),
        FinancialAssetService.getAssets(),
        FinanceAnalyticsService.getMetrics(),
        FinanceSettingsService.getSettings(),
      ]);

      setBudgets(budgetsData);
      setVarianceReports(varianceData);
      setTemplates(templatesData);
      setScenarios(scenariosData);
      setVendors(vendorsData);
      setContracts(contractsData);
      setPettyCashFunds(fundsData);
      setPettyCashTransactions(transactionsData);
      setPettyCashReconciliations(reconciliationsData);
      setAssets(assetsData);
      setMetrics(metricsData);
      setSettings(settingsData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load finance data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // ============================================================================
  // Budget Methods
  // ============================================================================

  const createBudget = async (data: Budget): Promise<Budget> => {
    const budget = await BudgetService.createBudget(data);
    setBudgets([...budgets, budget]);
    return budget;
  };

  const updateBudget = async (id: string, updates: Partial<Budget>): Promise<Budget> => {
    const updated = await BudgetService.updateBudget(id, updates);
    setBudgets(budgets.map((b) => (b.id === id ? updated : b)));
    return updated;
  };

  const deleteBudget = async (id: string): Promise<void> => {
    await BudgetService.deleteBudget(id);
    setBudgets(budgets.filter((b) => b.id !== id));
  };

  const approveBudget = async (id: string, approvedBy: string): Promise<Budget> => {
    const approved = await BudgetService.approveBudget(id, approvedBy);
    setBudgets(budgets.map((b) => (b.id === id ? approved : b)));
    return approved;
  };

  const rejectBudget = async (id: string, reason: string): Promise<Budget> => {
    const rejected = await BudgetService.rejectBudget(id, reason);
    setBudgets(budgets.map((b) => (b.id === id ? rejected : b)));
    return rejected;
  };

  const createFromTemplate = async (templateId: string, budgetData: Partial<Budget>): Promise<Budget> => {
    const budget = await BudgetService.createFromTemplate(templateId, budgetData);
    setBudgets([...budgets, budget]);
    return budget;
  };

  // ============================================================================
  // Budget Variance Methods
  // ============================================================================

  const generateVarianceReport = async (budgetId: string, periodEnd: string): Promise<BudgetVarianceReport> => {
    const report = await BudgetVarianceService.generateVarianceReport(budgetId, periodEnd);
    setVarianceReports([...varianceReports, report]);
    return report;
  };

  // ============================================================================
  // Budget Template Methods
  // ============================================================================

  const createTemplate = async (data: BudgetTemplate): Promise<BudgetTemplate> => {
    const template = await BudgetTemplateService.createTemplate(data);
    setTemplates([...templates, template]);
    return template;
  };

  const updateTemplate = async (id: string, updates: Partial<BudgetTemplate>): Promise<BudgetTemplate> => {
    const updated = await BudgetTemplateService.updateTemplate(id, updates);
    setTemplates(templates.map((t) => (t.id === id ? updated : t)));
    return updated;
  };

  const deleteTemplate = async (id: string): Promise<void> => {
    await BudgetTemplateService.deleteTemplate(id);
    setTemplates(templates.filter((t) => t.id !== id));
  };

  // ============================================================================
  // Budget Scenario Methods
  // ============================================================================

  const createScenario = async (data: BudgetScenario): Promise<BudgetScenario> => {
    const scenario = await BudgetScenarioService.createScenario(data);
    setScenarios([...scenarios, scenario]);
    return scenario;
  };

  const updateScenario = async (id: string, updates: Partial<BudgetScenario>): Promise<BudgetScenario> => {
    const updated = await BudgetScenarioService.updateScenario(id, updates);
    setScenarios(scenarios.map((s) => (s.id === id ? updated : s)));
    return updated;
  };

  const deleteScenario = async (id: string): Promise<void> => {
    await BudgetScenarioService.deleteScenario(id);
    setScenarios(scenarios.filter((s) => s.id !== id));
  };

  const runScenario = async (id: string): Promise<BudgetScenario> => {
    const result = await BudgetScenarioService.runScenario(id);
    setScenarios(scenarios.map((s) => (s.id === id ? result : s)));
    return result;
  };

  // ============================================================================
  // Vendor Methods
  // ============================================================================

  const createVendor = async (data: Vendor): Promise<Vendor> => {
    const vendor = await VendorService.createVendor(data);
    setVendors([...vendors, vendor]);
    return vendor;
  };

  const updateVendor = async (id: string, updates: Partial<Vendor>): Promise<Vendor> => {
    const updated = await VendorService.updateVendor(id, updates);
    setVendors(vendors.map((v) => (v.id === id ? updated : v)));
    return updated;
  };

  const deleteVendor = async (id: string): Promise<void> => {
    await VendorService.deleteVendor(id);
    setVendors(vendors.filter((v) => v.id !== id));
  };

  const approveVendor = async (id: string, approvedBy: string): Promise<Vendor> => {
    const approved = await VendorService.approveVendor(id, approvedBy);
    setVendors(vendors.map((v) => (v.id === id ? approved : v)));
    return approved;
  };

  const rejectVendor = async (id: string): Promise<Vendor> => {
    const rejected = await VendorService.rejectVendor(id);
    setVendors(vendors.map((v) => (v.id === id ? rejected : v)));
    return rejected;
  };

  // ============================================================================
  // Vendor Contract Methods
  // ============================================================================

  const createContract = async (data: VendorContract): Promise<VendorContract> => {
    const contract = await VendorContractService.createContract(data);
    setContracts([...contracts, contract]);
    return contract;
  };

  const updateContract = async (id: string, updates: Partial<VendorContract>): Promise<VendorContract> => {
    const updated = await VendorContractService.updateContract(id, updates);
    setContracts(contracts.map((c) => (c.id === id ? updated : c)));
    return updated;
  };

  const deleteContract = async (id: string): Promise<void> => {
    await VendorContractService.deleteContract(id);
    setContracts(contracts.filter((c) => c.id !== id));
  };

  const recordPayment = async (contractId: string, scheduleId: string, invoiceNumber: string): Promise<void> => {
    await VendorContractService.recordPayment(contractId, scheduleId, invoiceNumber);
    const updatedContracts = await VendorContractService.getContracts();
    setContracts(updatedContracts);
  };

  // ============================================================================
  // Petty Cash Methods
  // ============================================================================

  const createPettyCashFund = async (data: PettyCashFund): Promise<PettyCashFund> => {
    const fund = await PettyCashService.createFund(data);
    setPettyCashFunds([...pettyCashFunds, fund]);
    return fund;
  };

  const updatePettyCashFund = async (id: string, updates: Partial<PettyCashFund>): Promise<PettyCashFund> => {
    const updated = await PettyCashService.updateFund(id, updates);
    setPettyCashFunds(pettyCashFunds.map((f) => (f.id === id ? updated : f)));
    return updated;
  };

  const createPettyCashTransaction = async (data: PettyCashTransaction): Promise<PettyCashTransaction> => {
    const transaction = await PettyCashService.createTransaction(data);
    setPettyCashTransactions([...pettyCashTransactions, transaction]);

    // Refresh funds to get updated balances
    const updatedFunds = await PettyCashService.getFunds();
    setPettyCashFunds(updatedFunds);

    return transaction;
  };

  const approvePettyCashTransaction = async (transactionId: string, approvedBy: string): Promise<PettyCashTransaction> => {
    const approved = await PettyCashService.approveTransaction(transactionId, approvedBy);
    setPettyCashTransactions(pettyCashTransactions.map((t) => (t.id === transactionId ? approved : t)));
    return approved;
  };

  const createPettyCashReconciliation = async (data: PettyCashReconciliation): Promise<PettyCashReconciliation> => {
    const reconciliation = await PettyCashService.createReconciliation(data);
    setPettyCashReconciliations([...pettyCashReconciliations, reconciliation]);

    // Refresh funds to get updated reconciliation dates
    const updatedFunds = await PettyCashService.getFunds();
    setPettyCashFunds(updatedFunds);

    return reconciliation;
  };

  // ============================================================================
  // Financial Asset Methods
  // ============================================================================

  const createAsset = async (data: FinancialAsset): Promise<FinancialAsset> => {
    const asset = await FinancialAssetService.createAsset(data);
    setAssets([...assets, asset]);
    return asset;
  };

  const updateAsset = async (id: string, updates: Partial<FinancialAsset>): Promise<FinancialAsset> => {
    const updated = await FinancialAssetService.updateAsset(id, updates);
    setAssets(assets.map((a) => (a.id === id ? updated : a)));
    return updated;
  };

  const deleteAsset = async (id: string): Promise<void> => {
    await FinancialAssetService.deleteAsset(id);
    setAssets(assets.filter((a) => a.id !== id));
  };

  const calculateDepreciation = async (assetId: string): Promise<number> => {
    const depreciation = await FinancialAssetService.calculateDepreciation(assetId);

    // Refresh assets to get updated depreciation values
    const updatedAssets = await FinancialAssetService.getAssets();
    setAssets(updatedAssets);

    return depreciation;
  };

  // ============================================================================
  // Settings Methods
  // ============================================================================

  const updateSettings = async (updates: Partial<FinanceSettings>): Promise<FinanceSettings> => {
    const updated = await FinanceSettingsService.updateSettings(updates);
    setSettings(updated);
    return updated;
  };

  return {
    // Budgets
    budgets,
    createBudget,
    updateBudget,
    deleteBudget,
    approveBudget,
    rejectBudget,
    createFromTemplate,

    // Budget Variance
    varianceReports,
    generateVarianceReport,

    // Budget Templates
    templates,
    createTemplate,
    updateTemplate,
    deleteTemplate,

    // Budget Scenarios
    scenarios,
    createScenario,
    updateScenario,
    deleteScenario,
    runScenario,

    // Vendors
    vendors,
    createVendor,
    updateVendor,
    deleteVendor,
    approveVendor,
    rejectVendor,

    // Vendor Contracts
    contracts,
    createContract,
    updateContract,
    deleteContract,
    recordPayment,

    // Petty Cash
    pettyCashFunds,
    pettyCashTransactions,
    pettyCashReconciliations,
    createPettyCashFund,
    updatePettyCashFund,
    createPettyCashTransaction,
    approvePettyCashTransaction,
    createPettyCashReconciliation,

    // Financial Assets
    assets,
    createAsset,
    updateAsset,
    deleteAsset,
    calculateDepreciation,

    // Global
    metrics,
    settings,
    updateSettings,
    loading,
    error,
    refreshData: initializeData,
  };
}
