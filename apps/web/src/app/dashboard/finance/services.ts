/**
 * Finance & Budget Management Module - Services
 * API-ready service layer for financial operations
 */

import { APIClient } from '@/lib/api-client';
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
} from './types';

// ============================================================================
// Budget Service
// ============================================================================

export interface BudgetSummary {
  totalBudgets: number;
  activeBudgets: number;
  totalBudgetAmount: number;
  totalSpent: number;
  totalRemaining: number;
}

const EMPTY_BUDGET_SUMMARY: BudgetSummary = {
  totalBudgets: 0,
  activeBudgets: 0,
  totalBudgetAmount: 0,
  totalSpent: 0,
  totalRemaining: 0,
};

export class BudgetService {
  private static endpoint = '/finance/budgets';

  static async getBudgets(): Promise<Budget[]> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint);
      return APIClient.unwrapList<Budget>(response, 'budgets');
    } catch (error: any) {
      return [];
    }
  }

  /**
   * Returns the tenant-scoped budget rollup computed server-side by the
   * budgets endpoint (`summary` block). Falls back to zeros on failure.
   */
  static async getBudgetSummary(): Promise<BudgetSummary> {
    try {
      const response = await APIClient.get<{ summary?: Partial<BudgetSummary> }>(this.endpoint);
      const s = response?.summary;
      if (!s) return { ...EMPTY_BUDGET_SUMMARY };
      return {
        totalBudgets: Number(s.totalBudgets || 0),
        activeBudgets: Number(s.activeBudgets || 0),
        totalBudgetAmount: Number(s.totalBudgetAmount || 0),
        totalSpent: Number(s.totalSpent || 0),
        totalRemaining: Number(s.totalRemaining || 0),
      };
    } catch (error: any) {
      return { ...EMPTY_BUDGET_SUMMARY };
    }
  }

  static async getBudgetById(id: string): Promise<Budget | null> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/${id}`);
      return APIClient.unwrapItem<Budget>(response, 'budget');
    } catch (error: any) {
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

  static async createFromTemplate(
    templateId: string,
    budgetData: Partial<Budget>
  ): Promise<Budget> {
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
      const response = await APIClient.get<unknown>(this.endpoint);
      return APIClient.unwrapList<BudgetVarianceReport>(response, 'reports');
    } catch (error: any) {
      return [];
    }
  }

  static async getReportById(id: string): Promise<BudgetVarianceReport | null> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/${id}`);
      return APIClient.unwrapItem<BudgetVarianceReport>(response, 'report');
    } catch (error: any) {
      return null;
    }
  }

  static async generateVarianceReport(
    budgetId: string,
    periodEnd: string
  ): Promise<BudgetVarianceReport> {
    const response = await APIClient.post<{ report: BudgetVarianceReport }>(
      `${this.endpoint}/generate`,
      {
        budgetId,
        periodEnd,
      }
    );
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
      const response = await APIClient.get<unknown>(this.endpoint);
      return APIClient.unwrapList<BudgetTemplate>(response, 'templates');
    } catch (error: any) {
      return [];
    }
  }

  static async getTemplateById(id: string): Promise<BudgetTemplate | null> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/${id}`);
      return APIClient.unwrapItem<BudgetTemplate>(response, 'template');
    } catch (error: any) {
      return null;
    }
  }

  static async createTemplate(data: BudgetTemplate): Promise<BudgetTemplate> {
    const response = await APIClient.post<{ template: BudgetTemplate }>(this.endpoint, data);
    return response.template;
  }

  static async updateTemplate(
    id: string,
    updates: Partial<BudgetTemplate>
  ): Promise<BudgetTemplate> {
    const response = await APIClient.put<{ template: BudgetTemplate }>(
      `${this.endpoint}/${id}`,
      updates
    );
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
      const response = await APIClient.get<unknown>(this.endpoint);
      return APIClient.unwrapList<BudgetScenario>(response, 'scenarios');
    } catch (error: any) {
      return [];
    }
  }

  static async getScenarioById(id: string): Promise<BudgetScenario | null> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/${id}`);
      return APIClient.unwrapItem<BudgetScenario>(response, 'scenario');
    } catch (error: any) {
      return null;
    }
  }

  static async createScenario(data: BudgetScenario): Promise<BudgetScenario> {
    const response = await APIClient.post<{ scenario: BudgetScenario }>(this.endpoint, data);
    return response.scenario;
  }

  static async updateScenario(
    id: string,
    updates: Partial<BudgetScenario>
  ): Promise<BudgetScenario> {
    const response = await APIClient.put<{ scenario: BudgetScenario }>(
      `${this.endpoint}/${id}`,
      updates
    );
    return response.scenario;
  }

  static async deleteScenario(id: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${id}`);
  }

  static async runScenario(id: string): Promise<BudgetScenario> {
    const response = await APIClient.post<{ scenario: BudgetScenario }>(
      `${this.endpoint}/${id}/run`,
      {}
    );
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
      const response = await APIClient.get<unknown>(this.endpoint);
      return APIClient.unwrapList<Vendor>(response, 'vendors');
    } catch (error: any) {
      return [];
    }
  }

  static async getVendorById(id: string): Promise<Vendor | null> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/${id}`);
      return APIClient.unwrapItem<Vendor>(response, 'vendor');
    } catch (error: any) {
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
      const response = await APIClient.get<unknown>(this.endpoint);
      return APIClient.unwrapList<VendorContract>(response, 'contracts');
    } catch (error: any) {
      return [];
    }
  }

  static async getContractById(id: string): Promise<VendorContract | null> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/${id}`);
      return APIClient.unwrapItem<VendorContract>(response, 'contract');
    } catch (error: any) {
      return null;
    }
  }

  static async createContract(data: VendorContract): Promise<VendorContract> {
    const response = await APIClient.post<{ contract: VendorContract }>(this.endpoint, data);
    return response.contract;
  }

  static async updateContract(
    id: string,
    updates: Partial<VendorContract>
  ): Promise<VendorContract> {
    const response = await APIClient.put<{ contract: VendorContract }>(
      `${this.endpoint}/${id}`,
      updates
    );
    return response.contract;
  }

  static async deleteContract(id: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${id}`);
  }

  static async recordPayment(
    contractId: string,
    scheduleId: string,
    invoiceNumber: string
  ): Promise<void> {
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
      const response = await APIClient.get<unknown>(this.endpoint);
      return APIClient.unwrapList<PettyCashFund>(response, 'funds');
    } catch (error: any) {
      return [];
    }
  }

  static async getFundById(id: string): Promise<PettyCashFund | null> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/${id}`);
      return APIClient.unwrapItem<PettyCashFund>(response, 'fund');
    } catch (error: any) {
      return null;
    }
  }

  static async createFund(data: PettyCashFund): Promise<PettyCashFund> {
    const response = await APIClient.post<{ fund: PettyCashFund }>(this.endpoint, data);
    return response.fund;
  }

  static async updateFund(id: string, updates: Partial<PettyCashFund>): Promise<PettyCashFund> {
    const response = await APIClient.put<{ fund: PettyCashFund }>(
      `${this.endpoint}/${id}`,
      updates
    );
    return response.fund;
  }

  static async getTransactions(fundId?: string): Promise<PettyCashTransaction[]> {
    try {
      const url = fundId
        ? `${this.endpoint}/transactions?fundId=${fundId}`
        : `${this.endpoint}/transactions`;
      const response = await APIClient.get<unknown>(url);
      return APIClient.unwrapList<PettyCashTransaction>(response, 'transactions');
    } catch (error: any) {
      return [];
    }
  }

  static async createTransaction(data: PettyCashTransaction): Promise<PettyCashTransaction> {
    const response = await APIClient.post<{ transaction: PettyCashTransaction }>(
      `${this.endpoint}/transactions`,
      data
    );
    return response.transaction;
  }

  static async approveTransaction(
    transactionId: string,
    approvedBy: string
  ): Promise<PettyCashTransaction> {
    const response = await APIClient.put<{ transaction: PettyCashTransaction }>(
      `${this.endpoint}/transactions/${transactionId}/approve`,
      { approvedBy }
    );
    return response.transaction;
  }

  static async getReconciliations(): Promise<PettyCashReconciliation[]> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/reconciliations`);
      return APIClient.unwrapList<PettyCashReconciliation>(response, 'reconciliations');
    } catch (error: any) {
      return [];
    }
  }

  static async createReconciliation(
    data: PettyCashReconciliation
  ): Promise<PettyCashReconciliation> {
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
      const response = await APIClient.get<unknown>(this.endpoint);
      return APIClient.unwrapList<FinancialAsset>(response, 'assets');
    } catch (error: any) {
      return [];
    }
  }

  static async getAssetById(id: string): Promise<FinancialAsset | null> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/${id}`);
      return APIClient.unwrapItem<FinancialAsset>(response, 'asset');
    } catch (error: any) {
      return null;
    }
  }

  static async createAsset(data: FinancialAsset): Promise<FinancialAsset> {
    const response = await APIClient.post<{ asset: FinancialAsset }>(this.endpoint, data);
    return response.asset;
  }

  static async updateAsset(id: string, updates: Partial<FinancialAsset>): Promise<FinancialAsset> {
    const response = await APIClient.put<{ asset: FinancialAsset }>(
      `${this.endpoint}/${id}`,
      updates
    );
    return response.asset;
  }

  static async deleteAsset(id: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${id}`);
  }

  static async calculateDepreciation(assetId: string): Promise<number> {
    const response = await APIClient.post<{ depreciation: number }>(
      `${this.endpoint}/${assetId}/depreciation`,
      {}
    );
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
    } catch (error: any) {
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
// Cost Center Service (AURA-155)
// ============================================================================

export interface CostCenterRecord {
  id: string;
  code: string;
  name: string;
  fiscalYear: number | null;
  allocatedBudget: number;
  spentBudget: number;
}

export class CostCenterService {
  private static endpoint = '/finance/cost-centers';

  static async getCostCenters(): Promise<CostCenterRecord[]> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint);
      return APIClient.unwrapList<CostCenterRecord>(response, 'costCenters');
    } catch {
      return [];
    }
  }

  static async createCostCenter(data: Partial<CostCenterRecord>): Promise<CostCenterRecord> {
    const response = await APIClient.post<{ costCenter: CostCenterRecord }>(this.endpoint, data);
    return response.costCenter;
  }
}

// ============================================================================
// Petty Cash Policy Service (AURA-157)
// ============================================================================

export interface PettyCashPolicy {
  id: string;
  policyType: 'approval' | 'category' | 'spending_limit';
  name: string;
  description?: string | null;
  threshold?: number | null;
  approverRole?: string | null;
  monthlyLimit?: number | null;
  requireReceipt: boolean;
  active: boolean;
  config?: Record<string, unknown> | null;
}

export class PettyCashPolicyService {
  private static endpoint = '/finance/petty-cash/policies';

  static async getPolicies(policyType?: string): Promise<PettyCashPolicy[]> {
    try {
      const url = policyType ? `${this.endpoint}?policyType=${policyType}` : this.endpoint;
      const response = await APIClient.get<unknown>(url);
      return APIClient.unwrapList<PettyCashPolicy>(response, 'policies');
    } catch {
      return [];
    }
  }

  static async createPolicy(data: Partial<PettyCashPolicy>): Promise<PettyCashPolicy> {
    const response = await APIClient.post<{ policy: PettyCashPolicy }>(this.endpoint, data);
    return response.policy;
  }

  static async updatePolicy(
    id: string,
    updates: Partial<PettyCashPolicy>
  ): Promise<PettyCashPolicy> {
    const response = await APIClient.put<{ policy: PettyCashPolicy }>(
      `${this.endpoint}/${id}`,
      updates
    );
    return response.policy;
  }

  static async deletePolicy(id: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${id}`);
  }
}

// ============================================================================
// Finance CSV export helper (AURA-160)
// ============================================================================

/**
 * Builds a CSV from an array of records and triggers a browser download.
 * Columns are the union of keys of the supplied rows (or an explicit list).
 * Real client-side export — no server round-trip required.
 */
export function exportToCsv(
  filename: string,
  rows: Array<Record<string, unknown>>,
  columns?: string[]
): void {
  if (typeof window === 'undefined') return;
  const cols = columns ?? Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const escape = (val: unknown): string => {
    if (val == null) return '';
    const s = typeof val === 'object' ? JSON.stringify(val) : String(val);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = cols.join(',');
  const body = rows.map((r) => cols.map((c) => escape(r[c])).join(',')).join('\n');
  const csv = `${header}\n${body}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================================
// Settings Service
// ============================================================================

export class FinanceSettingsService {
  private static endpoint = '/finance/settings';

  static async getSettings(): Promise<FinanceSettings | null> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint);
      return APIClient.unwrapItem<FinanceSettings>(response, 'settings');
    } catch (error: any) {
      return null;
    }
  }

  static async updateSettings(updates: Partial<FinanceSettings>): Promise<FinanceSettings> {
    const response = await APIClient.put<{ settings: FinanceSettings }>(this.endpoint, updates);
    return response.settings;
  }
}
