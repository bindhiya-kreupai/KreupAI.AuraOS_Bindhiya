// Expense Management Services
import { APIClient } from '@/lib/api-client';
import type {
  ExpenseReport,
  ExpenseItem,
  ExpenseCategory,
  ExpensePolicy,
  ExpenseApproval,
  ReimbursementInfo,
  CorporateCard,
  ExpenseBudget,
  ExpenseMetrics,
  ExpenseSettings,
  PolicyViolation,
  ExpenseAttachment,
  ExpenseAuditLog,
  ExpenseComment
} from './types';

export class ExpenseReportService {
  static async getReports(filters?: { employeeId?: string; status?: string; departmentId?: string }): Promise<ExpenseReport[]> {
    return APIClient.get<ExpenseReport[]>('/expenses/reports', filters);
  }

  static async getReportById(id: string): Promise<ExpenseReport | null> {
    return APIClient.get<ExpenseReport | null>(`/expenses/reports/${id}`);
  }

  static async createReport(report: ExpenseReport): Promise<ExpenseReport> {
    return APIClient.post<ExpenseReport>('/expenses/reports', report);
  }

  static async updateReport(id: string, updates: Partial<ExpenseReport>): Promise<ExpenseReport> {
    return APIClient.put<ExpenseReport>(`/expenses/reports/${id}`, updates);
  }

  static async deleteReport(id: string): Promise<void> {
    return APIClient.delete<void>(`/expenses/reports/${id}`);
  }

  static async submitReport(id: string): Promise<ExpenseReport> {
    return APIClient.post<ExpenseReport>(`/expenses/reports/${id}/submit`, {});
  }

  static async approveReport(id: string, approverId: string, approverName: string, approverTitle: string, level: number, comments?: string): Promise<ExpenseReport> {
    return APIClient.post<ExpenseReport>(`/expenses/reports/${id}/approve`, {
      approverId,
      approverName,
      approverTitle,
      level,
      comments
    });
  }

  static async rejectReport(id: string, approverId: string, approverName: string, reason: string): Promise<ExpenseReport> {
    return APIClient.post<ExpenseReport>(`/expenses/reports/${id}/reject`, {
      approverId,
      approverName,
      reason
    });
  }

  static async addItem(reportId: string, item: ExpenseItem): Promise<ExpenseReport> {
    return APIClient.post<ExpenseReport>(`/expenses/reports/${reportId}/items`, item);
  }

  static async removeItem(reportId: string, itemId: string): Promise<ExpenseReport> {
    return APIClient.delete<ExpenseReport>(`/expenses/reports/${reportId}/items/${itemId}`);
  }
}

export class ExpenseItemService {
  static async getItems(reportId?: string): Promise<ExpenseItem[]> {
    return APIClient.get<ExpenseItem[]>('/expenses/items', reportId ? { reportId } : undefined);
  }

  static async createItem(item: ExpenseItem): Promise<ExpenseItem> {
    return APIClient.post<ExpenseItem>('/expenses/items', item);
  }

  static async updateItem(id: string, updates: Partial<ExpenseItem>): Promise<ExpenseItem> {
    return APIClient.put<ExpenseItem>(`/expenses/items/${id}`, updates);
  }

  static async deleteItem(id: string): Promise<void> {
    return APIClient.delete<void>(`/expenses/items/${id}`);
  }

  static async splitItem(id: string, amounts: number[]): Promise<ExpenseItem[]> {
    return APIClient.post<ExpenseItem[]>(`/expenses/items/${id}/split`, { amounts });
  }
}

export class ExpenseCategoryService {
  static async getCategories(filters?: { isActive?: boolean; parentId?: string }): Promise<ExpenseCategory[]> {
    return APIClient.get<ExpenseCategory[]>('/expenses/categories', filters);
  }

  static async createCategory(category: ExpenseCategory): Promise<ExpenseCategory> {
    return APIClient.post<ExpenseCategory>('/expenses/categories', category);
  }

  static async updateCategory(id: string, updates: Partial<ExpenseCategory>): Promise<ExpenseCategory> {
    return APIClient.put<ExpenseCategory>(`/expenses/categories/${id}`, updates);
  }

  static async deleteCategory(id: string): Promise<void> {
    return APIClient.delete<void>(`/expenses/categories/${id}`);
  }
}

export class ExpensePolicyService {
  static async getPolicies(filters?: { isActive?: boolean }): Promise<ExpensePolicy[]> {
    return APIClient.get<ExpensePolicy[]>('/expenses/policies', filters);
  }

  static async createPolicy(policy: ExpensePolicy): Promise<ExpensePolicy> {
    return APIClient.post<ExpensePolicy>('/expenses/policies', policy);
  }

  static async updatePolicy(id: string, updates: Partial<ExpensePolicy>): Promise<ExpensePolicy> {
    return APIClient.put<ExpensePolicy>(`/expenses/policies/${id}`, updates);
  }

  static async validateExpense(expense: ExpenseItem, policy: ExpensePolicy): Promise<PolicyViolation[]> {
    return APIClient.post<PolicyViolation[]>('/expenses/validate', { expense, policy });
  }
}

export class ReimbursementService {
  static async getReimbursements(filters?: { status?: string; employeeId?: string }): Promise<ReimbursementInfo[]> {
    return APIClient.get<ReimbursementInfo[]>('/expenses/reimbursements', filters);
  }

  static async createReimbursement(reimbursement: ReimbursementInfo): Promise<ReimbursementInfo> {
    return APIClient.post<ReimbursementInfo>('/expenses/reimbursements', reimbursement);
  }

  static async processReimbursement(id: string, processedBy: string): Promise<ReimbursementInfo> {
    return APIClient.post<ReimbursementInfo>(`/expenses/reimbursements/${id}/process`, { processedBy });
  }

  static async markAsPaid(id: string, paymentReference: string): Promise<ReimbursementInfo> {
    return APIClient.post<ReimbursementInfo>(`/expenses/reimbursements/${id}/paid`, { paymentReference });
  }
}

export class CorporateCardService {
  static async getCards(filters?: { employeeId?: string; status?: string }): Promise<CorporateCard[]> {
    return APIClient.get<CorporateCard[]>('/expenses/cards', filters);
  }

  static async createCard(card: CorporateCard): Promise<CorporateCard> {
    return APIClient.post<CorporateCard>('/expenses/cards', card);
  }

  static async updateCard(id: string, updates: Partial<CorporateCard>): Promise<CorporateCard> {
    return APIClient.put<CorporateCard>(`/expenses/cards/${id}`, updates);
  }

  static async suspendCard(id: string, reason: string): Promise<CorporateCard> {
    return APIClient.post<CorporateCard>(`/expenses/cards/${id}/suspend`, { reason });
  }

  static async cancelCard(id: string, reason: string): Promise<CorporateCard> {
    return APIClient.post<CorporateCard>(`/expenses/cards/${id}/cancel`, { reason });
  }
}

export class ExpenseBudgetService {
  static async getBudgets(filters?: { departmentId?: string; fiscalYear?: string }): Promise<ExpenseBudget[]> {
    return APIClient.get<ExpenseBudget[]>('/expenses/budgets', filters);
  }

  static async createBudget(budget: ExpenseBudget): Promise<ExpenseBudget> {
    return APIClient.post<ExpenseBudget>('/expenses/budgets', budget);
  }

  static async updateBudget(id: string, updates: Partial<ExpenseBudget>): Promise<ExpenseBudget> {
    return APIClient.put<ExpenseBudget>(`/expenses/budgets/${id}`, updates);
  }

  static async checkBudgetAvailability(departmentId: string, categoryId: string, amount: number): Promise<boolean> {
    return APIClient.get<boolean>('/expenses/budgets/check-availability', { departmentId, categoryId, amount });
  }
}

export class ExpenseAnalyticsService {
  static async getMetrics(): Promise<ExpenseMetrics> {
    return APIClient.get<ExpenseMetrics>('/expenses/analytics/metrics');
  }
}

export class ExpenseSettingsService {
  static async getSettings(): Promise<ExpenseSettings> {
    return APIClient.get<ExpenseSettings>('/expenses/settings');
  }

  static async updateSettings(updates: Partial<ExpenseSettings>): Promise<ExpenseSettings> {
    return APIClient.put<ExpenseSettings>('/expenses/settings', updates);
  }
}

export class ExpenseCommentService {
  static async getComments(reportId: string): Promise<ExpenseComment[]> {
    return APIClient.get<ExpenseComment[]>(`/expenses/reports/${reportId}/comments`);
  }

  static async addComment(comment: ExpenseComment): Promise<ExpenseComment> {
    return APIClient.post<ExpenseComment>(`/expenses/reports/${comment.expenseReportId}/comments`, comment);
  }
}
