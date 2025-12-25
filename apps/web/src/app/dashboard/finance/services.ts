/**
 * Finance & Budget Management Module - Services
 * API-ready service layer for financial operations
 */

import { APIClient } from '@/lib/api-client';
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

// ============================================================================
// Budget Service
// ============================================================================

export class BudgetService {
  private static endpoint = '/finance/budgets';

  static async getBudgets(): Promise<Budget[]> {
    try {
      const response = await APIClient.get<{ budgets?: Budget[] }>(this.endpoint);
      return response.budgets || [];
    } catch (error) {
      console.error('Error fetching budgets:', error);
      return [];
    }
  }

  static async getBudgetById(id: string): Promise<Budget | null> {
    try {
      const response = await APIClient.get<{ budget?: Budget }>(`${this.endpoint}/${id}`);
      return response.budget || null;
    } catch (error) {
      console.error('Error fetching budget:', error);
      return null;
    }
  }

  static async createBudget(data: Budget): Promise<Budget> {
    const response = await APIClient.post<{ budget: Budget }>(this.endpoint, data);
    return response.budget;
  }

  static async updateBudget(id: string, updates: Partial<Budget>): Promise<Budget> {
    const response = await APIClient.put<{ budget: Budget }>(`${this.endpoint}/${id}`, updates);
    return response.budget;
  }

  static async deleteBudget(id: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${id}`);
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
    const response = await APIClient.post<{ budget: Budget }>(`${this.endpoint}/from-template`, {
      templateId,
      budgetData,
    });
    return response.budget;
  }
}

// ============================================================================
// Budget Variance Service
// ============================================================================

export class BudgetVarianceService {
  private static endpoint = '/finance/variance-reports';

  static async getReports(): Promise<BudgetVarianceReport[]> {
    try {
      const response = await APIClient.get<{ reports?: BudgetVarianceReport[] }>(this.endpoint);
      return response.reports || [];
    } catch (error) {
      console.error('Error fetching variance reports:', error);
      return [];
    }
  }

  static async getReportById(id: string): Promise<BudgetVarianceReport | null> {
    try {
      const response = await APIClient.get<{ report?: BudgetVarianceReport }>(`${this.endpoint}/${id}`);
      return response.report || null;
    } catch (error) {
      console.error('Error fetching variance report:', error);
      return null;
    }
  }

  static async generateVarianceReport(budgetId: string, periodEnd: string): Promise<BudgetVarianceReport> {
    const response = await APIClient.post<{ report: BudgetVarianceReport }>(`${this.endpoint}/generate`, {
      budgetId,
      periodEnd,
    });
    return response.report;
  }
}

// ============================================================================
// Budget Template Service
// ============================================================================

export class BudgetTemplateService {
  private static endpoint = '/finance/templates';

  static async getTemplates(): Promise<BudgetTemplate[]> {
    try {
      const response = await APIClient.get<{ templates?: BudgetTemplate[] }>(this.endpoint);
      return response.templates || [];
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  }

  static async getTemplateById(id: string): Promise<BudgetTemplate | null> {
    try {
      const response = await APIClient.get<{ template?: BudgetTemplate }>(`${this.endpoint}/${id}`);
      return response.template || null;
    } catch (error) {
      console.error('Error fetching template:', error);
      return null;
    }
  }

  static async createTemplate(data: BudgetTemplate): Promise<BudgetTemplate> {
    const response = await APIClient.post<{ template: BudgetTemplate }>(this.endpoint, data);
    return response.template;
  }

  static async updateTemplate(id: string, updates: Partial<BudgetTemplate>): Promise<BudgetTemplate> {
    const response = await APIClient.put<{ template: BudgetTemplate }>(`${this.endpoint}/${id}`, updates);
    return response.template;
  }

  static async deleteTemplate(id: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${id}`);
  }
}

// ============================================================================
// Budget Scenario Service
// ============================================================================

export class BudgetScenarioService {
  private static endpoint = '/finance/scenarios';

  static async getScenarios(): Promise<BudgetScenario[]> {
    try {
      const response = await APIClient.get<{ scenarios?: BudgetScenario[] }>(this.endpoint);
      return response.scenarios || [];
    } catch (error) {
      console.error('Error fetching scenarios:', error);
      return [];
    }
  }

  static async getScenarioById(id: string): Promise<BudgetScenario | null> {
    try {
      const response = await APIClient.get<{ scenario?: BudgetScenario }>(`${this.endpoint}/${id}`);
      return response.scenario || null;
    } catch (error) {
      console.error('Error fetching scenario:', error);
      return null;
    }
  }

  static async createScenario(data: BudgetScenario): Promise<BudgetScenario> {
    const response = await APIClient.post<{ scenario: BudgetScenario }>(this.endpoint, data);
    return response.scenario;
  }

  static async updateScenario(id: string, updates: Partial<BudgetScenario>): Promise<BudgetScenario> {
    const response = await APIClient.put<{ scenario: BudgetScenario }>(`${this.endpoint}/${id}`, updates);
    return response.scenario;
  }

  static async deleteScenario(id: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${id}`);
  }

  static async runScenario(id: string): Promise<BudgetScenario> {
    const response = await APIClient.post<{ scenario: BudgetScenario }>(`${this.endpoint}/${id}/run`, {});
    return response.scenario;
  }
}

// ============================================================================
// Vendor Service
// ============================================================================

export class VendorService {
  private static endpoint = '/finance/vendors';

  static async getVendors(): Promise<Vendor[]> {
    try {
      const response = await APIClient.get<{ vendors?: Vendor[] }>(this.endpoint);
      return response.vendors || [];
    } catch (error) {
      console.error('Error fetching vendors:', error);
      return [];
    }
  }

  static async getVendorById(id: string): Promise<Vendor | null> {
    try {
      const response = await APIClient.get<{ vendor?: Vendor }>(`${this.endpoint}/${id}`);
      return response.vendor || null;
    } catch (error) {
      console.error('Error fetching vendor:', error);
      return null;
    }
  }

  static async createVendor(data: Vendor): Promise<Vendor> {
    const response = await APIClient.post<{ vendor: Vendor }>(this.endpoint, data);
    return response.vendor;
  }

  static async updateVendor(id: string, updates: Partial<Vendor>): Promise<Vendor> {
    const response = await APIClient.put<{ vendor: Vendor }>(`${this.endpoint}/${id}`, updates);
    return response.vendor;
  }

  static async deleteVendor(id: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${id}`);
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
  private static endpoint = '/finance/contracts';

  static async getContracts(): Promise<VendorContract[]> {
    try {
      const response = await APIClient.get<{ contracts?: VendorContract[] }>(this.endpoint);
      return response.contracts || [];
    } catch (error) {
      console.error('Error fetching contracts:', error);
      return [];
    }
  }

  static async getContractById(id: string): Promise<VendorContract | null> {
    try {
      const response = await APIClient.get<{ contract?: VendorContract }>(`${this.endpoint}/${id}`);
      return response.contract || null;
    } catch (error) {
      console.error('Error fetching contract:', error);
      return null;
    }
  }

  static async createContract(data: VendorContract): Promise<VendorContract> {
    const response = await APIClient.post<{ contract: VendorContract }>(this.endpoint, data);
    return response.contract;
  }

  static async updateContract(id: string, updates: Partial<VendorContract>): Promise<VendorContract> {
    const response = await APIClient.put<{ contract: VendorContract }>(`${this.endpoint}/${id}`, updates);
    return response.contract;
  }

  static async deleteContract(id: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${id}`);
  }

  static async recordPayment(contractId: string, scheduleId: string, invoiceNumber: string): Promise<void> {
    await APIClient.post(`${this.endpoint}/${contractId}/payment`, {
      scheduleId,
      invoiceNumber,
    });
  }
}

// ============================================================================
// Petty Cash Service
// ============================================================================

export class PettyCashService {
  private static endpoint = '/finance/petty-cash';

  static async getFunds(): Promise<PettyCashFund[]> {
    try {
      const response = await APIClient.get<{ funds?: PettyCashFund[] }>(this.endpoint);
      return response.funds || [];
    } catch (error) {
      console.error('Error fetching petty cash funds:', error);
      return [];
    }
  }

  static async getFundById(id: string): Promise<PettyCashFund | null> {
    try {
      const response = await APIClient.get<{ fund?: PettyCashFund }>(`${this.endpoint}/${id}`);
      return response.fund || null;
    } catch (error) {
      console.error('Error fetching petty cash fund:', error);
      return null;
    }
  }

  static async createFund(data: PettyCashFund): Promise<PettyCashFund> {
    const response = await APIClient.post<{ fund: PettyCashFund }>(this.endpoint, data);
    return response.fund;
  }

  static async updateFund(id: string, updates: Partial<PettyCashFund>): Promise<PettyCashFund> {
    const response = await APIClient.put<{ fund: PettyCashFund }>(`${this.endpoint}/${id}`, updates);
    return response.fund;
  }

  static async getTransactions(fundId?: string): Promise<PettyCashTransaction[]> {
    try {
      const url = fundId ? `${this.endpoint}/transactions?fundId=${fundId}` : `${this.endpoint}/transactions`;
      const response = await APIClient.get<{ transactions?: PettyCashTransaction[] }>(url);
      return response.transactions || [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  static async createTransaction(data: PettyCashTransaction): Promise<PettyCashTransaction> {
    const response = await APIClient.post<{ transaction: PettyCashTransaction }>(`${this.endpoint}/transactions`, data);
    return response.transaction;
  }

  static async approveTransaction(transactionId: string, approvedBy: string): Promise<PettyCashTransaction> {
    const response = await APIClient.put<{ transaction: PettyCashTransaction }>(
      `${this.endpoint}/transactions/${transactionId}/approve`,
      { approvedBy }
    );
    return response.transaction;
  }

  static async getReconciliations(): Promise<PettyCashReconciliation[]> {
    try {
      const response = await APIClient.get<{ reconciliations?: PettyCashReconciliation[] }>(
        `${this.endpoint}/reconciliations`
      );
      return response.reconciliations || [];
    } catch (error) {
      console.error('Error fetching reconciliations:', error);
      return [];
    }
  }

  static async createReconciliation(data: PettyCashReconciliation): Promise<PettyCashReconciliation> {
    const response = await APIClient.post<{ reconciliation: PettyCashReconciliation }>(
      `${this.endpoint}/reconciliations`,
      data
    );
    return response.reconciliation;
  }
}

// ============================================================================
// Financial Asset Service
// ============================================================================

export class FinancialAssetService {
  private static endpoint = '/finance/assets';

  static async getAssets(): Promise<FinancialAsset[]> {
    try {
      const response = await APIClient.get<{ assets?: FinancialAsset[] }>(this.endpoint);
      return response.assets || [];
    } catch (error) {
      console.error('Error fetching assets:', error);
      return [];
    }
  }

  static async getAssetById(id: string): Promise<FinancialAsset | null> {
    try {
      const response = await APIClient.get<{ asset?: FinancialAsset }>(`${this.endpoint}/${id}`);
      return response.asset || null;
    } catch (error) {
      console.error('Error fetching asset:', error);
      return null;
    }
  }

  static async createAsset(data: FinancialAsset): Promise<FinancialAsset> {
    const response = await APIClient.post<{ asset: FinancialAsset }>(this.endpoint, data);
    return response.asset;
  }

  static async updateAsset(id: string, updates: Partial<FinancialAsset>): Promise<FinancialAsset> {
    const response = await APIClient.put<{ asset: FinancialAsset }>(`${this.endpoint}/${id}`, updates);
    return response.asset;
  }

  static async deleteAsset(id: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${id}`);
  }

  static async calculateDepreciation(assetId: string): Promise<number> {
    const response = await APIClient.post<{ depreciation: number }>(`${this.endpoint}/${assetId}/depreciation`, {});
    return response.depreciation;
  }
}

// ============================================================================
// Analytics Service
// ============================================================================

export class FinanceAnalyticsService {
  private static endpoint = '/finance/analytics';

  static async getMetrics(): Promise<FinanceMetrics> {
    try {
      const response = await APIClient.get<{ metrics?: FinanceMetrics }>(this.endpoint);
      if (response.metrics) {
        return response.metrics;
      }
      // Return default metrics if none available
      return {
        totalBudgets: 0,
        activeBudgets: 0,
        totalBudgetAmount: 0,
        totalSpent: 0,
        totalRemaining: 0,
        averageUtilization: 0,
        favorableVariances: 0,
        unfavorableVariances: 0,
        criticalVariances: 0,
        averageVariancePercentage: 0,
        totalVendors: 0,
        activeVendors: 0,
        totalVendorSpend: 0,
        averageVendorRating: 0,
        vendorsAwaitingApproval: 0,
        activeContracts: 0,
        totalContractValue: 0,
        contractsExpiringSoon: 0,
        averageContractUtilization: 0,
        activePettyCashFunds: 0,
        totalPettyCashBalance: 0,
        pendingReconciliations: 0,
        pettyCashUtilization: 0,
        totalAssets: 0,
        totalAssetValue: 0,
        totalDepreciation: 0,
        assetsUnderMaintenance: 0,
        budgetTrends: [],
        spendingTrends: [],
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching finance metrics:', error);
      return {
        totalBudgets: 0,
        activeBudgets: 0,
        totalBudgetAmount: 0,
        totalSpent: 0,
        totalRemaining: 0,
        averageUtilization: 0,
        favorableVariances: 0,
        unfavorableVariances: 0,
        criticalVariances: 0,
        averageVariancePercentage: 0,
        totalVendors: 0,
        activeVendors: 0,
        totalVendorSpend: 0,
        averageVendorRating: 0,
        vendorsAwaitingApproval: 0,
        activeContracts: 0,
        totalContractValue: 0,
        contractsExpiringSoon: 0,
        averageContractUtilization: 0,
        activePettyCashFunds: 0,
        totalPettyCashBalance: 0,
        pendingReconciliations: 0,
        pettyCashUtilization: 0,
        totalAssets: 0,
        totalAssetValue: 0,
        totalDepreciation: 0,
        assetsUnderMaintenance: 0,
        budgetTrends: [],
        spendingTrends: [],
        lastUpdated: new Date().toISOString(),
      };
    }
  }
}

// ============================================================================
// Settings Service
// ============================================================================

export class FinanceSettingsService {
  private static endpoint = '/finance/settings';

  static async getSettings(): Promise<FinanceSettings | null> {
    try {
      const response = await APIClient.get<{ settings?: FinanceSettings }>(this.endpoint);
      return response.settings || null;
    } catch (error) {
      console.error('Error fetching finance settings:', error);
      return null;
    }
  }

  static async updateSettings(updates: Partial<FinanceSettings>): Promise<FinanceSettings> {
    const response = await APIClient.put<{ settings: FinanceSettings }>(this.endpoint, updates);
    return response.settings;
  }
}
