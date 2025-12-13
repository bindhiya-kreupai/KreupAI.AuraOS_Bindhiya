/**
 * Finance & Budget Management Module - Services
 * API-ready service layer for financial operations
 */

import {
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
} from './types';

// Storage keys
const STORAGE_KEYS = {
  BUDGETS: 'finance_budgets',
  VARIANCE_REPORTS: 'finance_variance_reports',
  TEMPLATES: 'finance_templates',
  SCENARIOS: 'finance_scenarios',
  VENDORS: 'finance_vendors',
  CONTRACTS: 'finance_contracts',
  PETTY_CASH_FUNDS: 'finance_petty_cash_funds',
  PETTY_CASH_TRANSACTIONS: 'finance_petty_cash_transactions',
  PETTY_CASH_RECONCILIATIONS: 'finance_petty_cash_reconciliations',
  ASSETS: 'finance_assets',
  SETTINGS: 'finance_settings',
};

// ============================================================================
// Budget Service
// ============================================================================

export class BudgetService {
  static async getBudgets(): Promise<Budget[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    return stored ? JSON.parse(stored) : [];
  }

  static async getBudgetById(id: string): Promise<Budget | null> {
    const budgets = await this.getBudgets();
    return budgets.find((b) => b.id === id) || null;
  }

  static async createBudget(data: Budget): Promise<Budget> {
    const budgets = await this.getBudgets();
    budgets.push(data);
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    return data;
  }

  static async updateBudget(id: string, updates: Partial<Budget>): Promise<Budget> {
    const budgets = await this.getBudgets();
    const index = budgets.findIndex((b) => b.id === id);
    if (index === -1) throw new Error('Budget not found');
    budgets[index] = { ...budgets[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    return budgets[index];
  }

  static async deleteBudget(id: string): Promise<void> {
    const budgets = await this.getBudgets();
    const filtered = budgets.filter((b) => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(filtered));
  }

  static async approveBudget(id: string, approvedBy: string): Promise<Budget> {
    return this.updateBudget(id, {
      approvalStatus: 'approved',
      approvedBy,
      approvedDate: new Date().toISOString(),
      status: 'approved',
    });
  }

  static async rejectBudget(id: string, reason: string): Promise<Budget> {
    return this.updateBudget(id, {
      approvalStatus: 'rejected',
      rejectionReason: reason,
      status: 'rejected',
    });
  }

  static async createFromTemplate(templateId: string, budgetData: Partial<Budget>): Promise<Budget> {
    const template = await BudgetTemplateService.getTemplateById(templateId);
    if (!template) throw new Error('Template not found');

    const budget: Budget = {
      id: `budget-${Date.now()}`,
      budgetCode: `BG-${Date.now()}`,
      budgetName: budgetData.budgetName || template.templateName,
      budgetType: template.templateType,
      status: 'draft',
      description: budgetData.description || template.description,
      fiscalYear: budgetData.fiscalYear || new Date().getFullYear(),
      period: template.defaultPeriod,
      startDate: budgetData.startDate || new Date().toISOString(),
      endDate: budgetData.endDate || new Date(new Date().getFullYear(), 11, 31).toISOString(),
      department: budgetData.department,
      costCenter: budgetData.costCenter,
      project: budgetData.project,
      location: budgetData.location,
      lines: template.templateLines.map((tl, index) => ({
        id: `line-${index + 1}`,
        lineNumber: tl.lineNumber,
        category: tl.category,
        subcategory: tl.subcategory,
        description: tl.description,
        budgetAmount: tl.defaultAmount || 0,
        allocatedAmount: 0,
        committedAmount: 0,
        actualAmount: 0,
        remainingAmount: tl.defaultAmount || 0,
        notes: tl.notes,
      })),
      totalBudget: template.templateLines.reduce((sum, tl) => sum + (tl.defaultAmount || 0), 0),
      totalAllocated: 0,
      totalSpent: 0,
      totalRemaining: template.templateLines.reduce((sum, tl) => sum + (tl.defaultAmount || 0), 0),
      utilizationRate: 0,
      approvalStatus: 'pending',
      version: '1.0',
      revisionHistory: [],
      createdBy: budgetData.createdBy || 'system',
      createdByName: budgetData.createdByName || 'System',
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      tags: budgetData.tags || [],
    };

    return this.createBudget(budget);
  }
}

// ============================================================================
// Budget Variance Service
// ============================================================================

export class BudgetVarianceService {
  static async getReports(): Promise<BudgetVarianceReport[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.VARIANCE_REPORTS);
    return stored ? JSON.parse(stored) : [];
  }

  static async getReportById(id: string): Promise<BudgetVarianceReport | null> {
    const reports = await this.getReports();
    return reports.find((r) => r.id === id) || null;
  }

  static async generateVarianceReport(budgetId: string, periodEnd: string): Promise<BudgetVarianceReport> {
    const budget = await BudgetService.getBudgetById(budgetId);
    if (!budget) throw new Error('Budget not found');

    // TODO: Implement actual variance calculation logic
    const report: BudgetVarianceReport = {
      id: `report-${Date.now()}`,
      reportCode: `VR-${Date.now()}`,
      reportName: `Variance Report - ${budget.budgetName}`,
      budgetId,
      budgetName: budget.budgetName,
      reportDate: new Date().toISOString(),
      reportPeriod: {
        startDate: budget.startDate,
        endDate: periodEnd,
      },
      totalBudget: budget.totalBudget,
      totalActual: budget.totalSpent,
      totalVariance: budget.totalBudget - budget.totalSpent,
      totalVariancePercentage:
        budget.totalBudget > 0 ? ((budget.totalBudget - budget.totalSpent) / budget.totalBudget) * 100 : 0,
      favorableVariance: 0,
      unfavorableVariance: 0,
      lineVariances: [],
      categoryVariances: [],
      trends: [],
      recommendations: [],
      alerts: [],
      createdDate: new Date().toISOString(),
    };

    const reports = await this.getReports();
    reports.push(report);
    localStorage.setItem(STORAGE_KEYS.VARIANCE_REPORTS, JSON.stringify(reports));
    return report;
  }
}

// ============================================================================
// Budget Template Service
// ============================================================================

export class BudgetTemplateService {
  static async getTemplates(): Promise<BudgetTemplate[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    return stored ? JSON.parse(stored) : [];
  }

  static async getTemplateById(id: string): Promise<BudgetTemplate | null> {
    const templates = await this.getTemplates();
    return templates.find((t) => t.id === id) || null;
  }

  static async createTemplate(data: BudgetTemplate): Promise<BudgetTemplate> {
    const templates = await this.getTemplates();
    templates.push(data);
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
    return data;
  }

  static async updateTemplate(id: string, updates: Partial<BudgetTemplate>): Promise<BudgetTemplate> {
    const templates = await this.getTemplates();
    const index = templates.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Template not found');
    templates[index] = { ...templates[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
    return templates[index];
  }

  static async deleteTemplate(id: string): Promise<void> {
    const templates = await this.getTemplates();
    const filtered = templates.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(filtered));
  }
}

// ============================================================================
// Budget Scenario Service
// ============================================================================

export class BudgetScenarioService {
  static async getScenarios(): Promise<BudgetScenario[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.SCENARIOS);
    return stored ? JSON.parse(stored) : [];
  }

  static async getScenarioById(id: string): Promise<BudgetScenario | null> {
    const scenarios = await this.getScenarios();
    return scenarios.find((s) => s.id === id) || null;
  }

  static async createScenario(data: BudgetScenario): Promise<BudgetScenario> {
    const scenarios = await this.getScenarios();
    scenarios.push(data);
    localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify(scenarios));
    return data;
  }

  static async updateScenario(id: string, updates: Partial<BudgetScenario>): Promise<BudgetScenario> {
    const scenarios = await this.getScenarios();
    const index = scenarios.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Scenario not found');
    scenarios[index] = { ...scenarios[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify(scenarios));
    return scenarios[index];
  }

  static async deleteScenario(id: string): Promise<void> {
    const scenarios = await this.getScenarios();
    const filtered = scenarios.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify(filtered));
  }

  static async runScenario(id: string): Promise<BudgetScenario> {
    // TODO: Implement scenario calculation logic
    return this.updateScenario(id, { status: 'approved' });
  }
}

// ============================================================================
// Vendor Service
// ============================================================================

export class VendorService {
  static async getVendors(): Promise<Vendor[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.VENDORS);
    return stored ? JSON.parse(stored) : [];
  }

  static async getVendorById(id: string): Promise<Vendor | null> {
    const vendors = await this.getVendors();
    return vendors.find((v) => v.id === id) || null;
  }

  static async createVendor(data: Vendor): Promise<Vendor> {
    const vendors = await this.getVendors();
    vendors.push(data);
    localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(vendors));
    return data;
  }

  static async updateVendor(id: string, updates: Partial<Vendor>): Promise<Vendor> {
    const vendors = await this.getVendors();
    const index = vendors.findIndex((v) => v.id === id);
    if (index === -1) throw new Error('Vendor not found');
    vendors[index] = { ...vendors[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(vendors));
    return vendors[index];
  }

  static async deleteVendor(id: string): Promise<void> {
    const vendors = await this.getVendors();
    const filtered = vendors.filter((v) => v.id !== id);
    localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(filtered));
  }

  static async approveVendor(id: string, approvedBy: string): Promise<Vendor> {
    return this.updateVendor(id, {
      approvalStatus: 'approved',
      approvedBy,
      approvedDate: new Date().toISOString(),
      status: 'active',
    });
  }

  static async rejectVendor(id: string): Promise<Vendor> {
    return this.updateVendor(id, {
      approvalStatus: 'rejected',
      status: 'inactive',
    });
  }
}

// ============================================================================
// Vendor Contract Service
// ============================================================================

export class VendorContractService {
  static async getContracts(): Promise<VendorContract[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.CONTRACTS);
    return stored ? JSON.parse(stored) : [];
  }

  static async getContractById(id: string): Promise<VendorContract | null> {
    const contracts = await this.getContracts();
    return contracts.find((c) => c.id === id) || null;
  }

  static async createContract(data: VendorContract): Promise<VendorContract> {
    const contracts = await this.getContracts();
    contracts.push(data);
    localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts));
    return data;
  }

  static async updateContract(id: string, updates: Partial<VendorContract>): Promise<VendorContract> {
    const contracts = await this.getContracts();
    const index = contracts.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Contract not found');
    contracts[index] = { ...contracts[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts));
    return contracts[index];
  }

  static async deleteContract(id: string): Promise<void> {
    const contracts = await this.getContracts();
    const filtered = contracts.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(filtered));
  }

  static async recordPayment(contractId: string, scheduleId: string, invoiceNumber: string): Promise<void> {
    const contract = await this.getContractById(contractId);
    if (!contract) throw new Error('Contract not found');

    const schedule = contract.paymentSchedule?.find((s) => s.id === scheduleId);
    if (!schedule) throw new Error('Payment schedule not found');

    schedule.paid = true;
    schedule.paidDate = new Date().toISOString();
    schedule.invoiceNumber = invoiceNumber;

    const totalPaid = contract.paymentSchedule?.filter((s) => s.paid).reduce((sum, s) => sum + s.amount, 0) || 0;

    await this.updateContract(contractId, {
      paymentSchedule: contract.paymentSchedule,
      totalSpent: totalPaid,
      remainingValue: contract.totalContractValue - totalPaid,
      utilizationRate: (totalPaid / contract.totalContractValue) * 100,
    });
  }
}

// ============================================================================
// Petty Cash Service
// ============================================================================

export class PettyCashService {
  static async getFunds(): Promise<PettyCashFund[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.PETTY_CASH_FUNDS);
    return stored ? JSON.parse(stored) : [];
  }

  static async getFundById(id: string): Promise<PettyCashFund | null> {
    const funds = await this.getFunds();
    return funds.find((f) => f.id === id) || null;
  }

  static async createFund(data: PettyCashFund): Promise<PettyCashFund> {
    const funds = await this.getFunds();
    funds.push(data);
    localStorage.setItem(STORAGE_KEYS.PETTY_CASH_FUNDS, JSON.stringify(funds));
    return data;
  }

  static async updateFund(id: string, updates: Partial<PettyCashFund>): Promise<PettyCashFund> {
    const funds = await this.getFunds();
    const index = funds.findIndex((f) => f.id === id);
    if (index === -1) throw new Error('Fund not found');
    funds[index] = { ...funds[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.PETTY_CASH_FUNDS, JSON.stringify(funds));
    return funds[index];
  }

  static async getTransactions(fundId?: string): Promise<PettyCashTransaction[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.PETTY_CASH_TRANSACTIONS);
    const transactions = stored ? JSON.parse(stored) : [];
    return fundId ? transactions.filter((t: PettyCashTransaction) => t.fundId === fundId) : transactions;
  }

  static async createTransaction(data: PettyCashTransaction): Promise<PettyCashTransaction> {
    const transactions = await this.getTransactions();
    transactions.push(data);
    localStorage.setItem(STORAGE_KEYS.PETTY_CASH_TRANSACTIONS, JSON.stringify(transactions));

    // Update fund balance
    const fund = await this.getFundById(data.fundId);
    if (fund) {
      let newBalance = fund.currentBalance;

      switch (data.transactionType) {
        case 'disbursement':
          newBalance -= data.amount;
          break;
        case 'replenishment':
          newBalance += data.amount;
          break;
        case 'return':
          newBalance += data.amount;
          break;
        case 'adjustment':
          newBalance += data.amount; // Can be positive or negative
          break;
      }

      await this.updateFund(data.fundId, {
        currentBalance: newBalance,
        totalDisbursed:
          data.transactionType === 'disbursement' ? fund.totalDisbursed + data.amount : fund.totalDisbursed,
        totalReplenished:
          data.transactionType === 'replenishment' ? fund.totalReplenished + data.amount : fund.totalReplenished,
      });
    }

    return data;
  }

  static async approveTransaction(transactionId: string, approvedBy: string): Promise<PettyCashTransaction> {
    const transactions = await this.getTransactions();
    const index = transactions.findIndex((t) => t.id === transactionId);
    if (index === -1) throw new Error('Transaction not found');

    transactions[index] = {
      ...transactions[index],
      approvalStatus: 'approved',
      approvedBy,
      approvedDate: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.PETTY_CASH_TRANSACTIONS, JSON.stringify(transactions));
    return transactions[index];
  }

  static async getReconciliations(): Promise<PettyCashReconciliation[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.PETTY_CASH_RECONCILIATIONS);
    return stored ? JSON.parse(stored) : [];
  }

  static async createReconciliation(data: PettyCashReconciliation): Promise<PettyCashReconciliation> {
    const reconciliations = await this.getReconciliations();
    reconciliations.push(data);
    localStorage.setItem(STORAGE_KEYS.PETTY_CASH_RECONCILIATIONS, JSON.stringify(reconciliations));

    // Update fund last reconciled date
    await this.updateFund(data.fundId, {
      lastReconciledDate: data.reconciliationDate,
      lastReconciledBy: data.reconciledBy,
    });

    return data;
  }
}

// ============================================================================
// Financial Asset Service
// ============================================================================

export class FinancialAssetService {
  static async getAssets(): Promise<FinancialAsset[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.ASSETS);
    return stored ? JSON.parse(stored) : [];
  }

  static async getAssetById(id: string): Promise<FinancialAsset | null> {
    const assets = await this.getAssets();
    return assets.find((a) => a.id === id) || null;
  }

  static async createAsset(data: FinancialAsset): Promise<FinancialAsset> {
    const assets = await this.getAssets();
    assets.push(data);
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
    return data;
  }

  static async updateAsset(id: string, updates: Partial<FinancialAsset>): Promise<FinancialAsset> {
    const assets = await this.getAssets();
    const index = assets.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Asset not found');
    assets[index] = { ...assets[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
    return assets[index];
  }

  static async deleteAsset(id: string): Promise<void> {
    const assets = await this.getAssets();
    const filtered = assets.filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(filtered));
  }

  static async calculateDepreciation(assetId: string): Promise<number> {
    const asset = await this.getAssetById(assetId);
    if (!asset) throw new Error('Asset not found');

    if (asset.depreciationMethod === 'none') return 0;

    const purchaseDate = new Date(asset.purchaseDate);
    const today = new Date();
    const yearsElapsed = (today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

    let depreciation = 0;

    if (asset.depreciationMethod === 'straight_line') {
      const annualDepreciation = (asset.purchasePrice - asset.salvageValue) / asset.usefulLife;
      depreciation = Math.min(annualDepreciation * yearsElapsed, asset.purchasePrice - asset.salvageValue);
    } else if (asset.depreciationMethod === 'declining_balance') {
      const depreciationRate = 2 / asset.usefulLife; // Double declining balance
      let currentValue = asset.purchasePrice;
      for (let year = 0; year < Math.floor(yearsElapsed); year++) {
        const yearlyDepreciation = currentValue * depreciationRate;
        depreciation += yearlyDepreciation;
        currentValue -= yearlyDepreciation;
      }
    }

    await this.updateAsset(assetId, {
      accumulatedDepreciation: depreciation,
      currentValue: asset.purchasePrice - depreciation,
    });

    return depreciation;
  }
}

// ============================================================================
// Analytics Service
// ============================================================================

export class FinanceAnalyticsService {
  static async getMetrics(): Promise<FinanceMetrics> {
    const budgets = await BudgetService.getBudgets();
    const vendors = await VendorService.getVendors();
    const contracts = await VendorContractService.getContracts();
    const funds = await PettyCashService.getFunds();
    const assets = await FinancialAssetService.getAssets();

    const activeBudgets = budgets.filter((b) => b.status === 'active' || b.status === 'approved');
    const activeVendors = vendors.filter((v) => v.status === 'active');
    const activeContracts = contracts.filter((c) => c.status === 'active');
    const activeFunds = funds.filter((f) => f.status === 'active');

    return {
      totalBudgets: budgets.length,
      activeBudgets: activeBudgets.length,
      totalBudgetAmount: budgets.reduce((sum, b) => sum + b.totalBudget, 0),
      totalSpent: budgets.reduce((sum, b) => sum + b.totalSpent, 0),
      totalRemaining: budgets.reduce((sum, b) => sum + b.totalRemaining, 0),
      averageUtilization:
        activeBudgets.length > 0 ? activeBudgets.reduce((sum, b) => sum + b.utilizationRate, 0) / activeBudgets.length : 0,

      favorableVariances: 0,
      unfavorableVariances: 0,
      criticalVariances: 0,
      averageVariancePercentage: 0,

      totalVendors: vendors.length,
      activeVendors: activeVendors.length,
      totalVendorSpend: vendors.reduce((sum, v) => sum + v.totalSpend, 0),
      averageVendorRating:
        activeVendors.length > 0
          ? activeVendors.reduce((sum, v) => sum + v.performanceRating, 0) / activeVendors.length
          : 0,
      vendorsAwaitingApproval: vendors.filter((v) => v.approvalStatus === 'pending').length,

      activeContracts: activeContracts.length,
      totalContractValue: contracts.reduce((sum, c) => sum + c.totalContractValue, 0),
      contractsExpiringSoon: contracts.filter((c) => {
        const endDate = new Date(c.endDate);
        const today = new Date();
        const daysUntilExpiry = (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
      }).length,
      averageContractUtilization:
        activeContracts.length > 0
          ? activeContracts.reduce((sum, c) => sum + c.utilizationRate, 0) / activeContracts.length
          : 0,

      activePettyCashFunds: activeFunds.length,
      totalPettyCashBalance: funds.reduce((sum, f) => sum + f.currentBalance, 0),
      pendingReconciliations: 0,
      pettyCashUtilization: 0,

      totalAssets: assets.length,
      totalAssetValue: assets.reduce((sum, a) => sum + a.currentValue, 0),
      totalDepreciation: assets.reduce((sum, a) => sum + a.accumulatedDepreciation, 0),
      assetsUnderMaintenance: assets.filter((a) => a.status === 'under_repair').length,

      budgetTrends: [],
      spendingTrends: [],

      lastUpdated: new Date().toISOString(),
    };
  }
}

// ============================================================================
// Settings Service
// ============================================================================

export class FinanceSettingsService {
  static async getSettings(): Promise<FinanceSettings> {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (stored) return JSON.parse(stored);

    const defaultSettings: FinanceSettings = {
      defaultCurrency: 'USD',
      fiscalYearStart: '01-01',
      budgetPeriod: 'annual',

      requireBudgetApproval: true,
      budgetVarianceThreshold: 10,
      allowOverspending: false,
      overspendingApprovalRequired: true,

      requireVendorApproval: true,
      vendorBackgroundCheckRequired: true,
      minimumInsuranceCoverage: 1000000,
      contractRenewalNoticeDays: 60,

      defaultPettyCashLimit: 5000,
      defaultTransactionLimit: 500,
      requirePettyCashReceipt: true,
      pettyCashApprovalThreshold: 200,
      reconciliationFrequency: 'monthly',

      defaultDepreciationMethod: 'straight_line',
      defaultUsefulLife: 5,
      assetCapitalizationThreshold: 5000,
      requireAssetTag: true,

      enableNotifications: true,
      notifyBudgetThreshold: true,
      notifyContractExpiry: true,
      notifyVendorDocExpiry: true,
      notifyPettyCashLow: true,

      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
    return defaultSettings;
  }

  static async updateSettings(updates: Partial<FinanceSettings>): Promise<FinanceSettings> {
    const settings = await this.getSettings();
    const updated = { ...settings, ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }
}
