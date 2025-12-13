// Expense Management Services
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

const STORAGE_KEYS = {
  EXPENSE_REPORTS: 'expense_reports',
  EXPENSE_ITEMS: 'expense_items',
  CATEGORIES: 'expense_categories',
  POLICIES: 'expense_policies',
  APPROVALS: 'expense_approvals',
  REIMBURSEMENTS: 'expense_reimbursements',
  CORPORATE_CARDS: 'expense_corporate_cards',
  BUDGETS: 'expense_budgets',
  METRICS: 'expense_metrics',
  SETTINGS: 'expense_settings',
  AUDIT_LOGS: 'expense_audit_logs',
  COMMENTS: 'expense_comments',
};

export class ExpenseReportService {
  static async getReports(filters?: { employeeId?: string; status?: string; departmentId?: string }): Promise<ExpenseReport[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSE_REPORTS);
    let reports: ExpenseReport[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.employeeId) reports = reports.filter(r => r.employeeId === filters.employeeId);
      if (filters.status) reports = reports.filter(r => r.status === filters.status);
      if (filters.departmentId) reports = reports.filter(r => r.departmentId === filters.departmentId);
    }

    return reports;
  }

  static async getReportById(id: string): Promise<ExpenseReport | null> {
    const reports = await this.getReports();
    return reports.find(r => r.id === id) || null;
  }

  static async createReport(report: ExpenseReport): Promise<ExpenseReport> {
    // TODO: Replace with actual API call
    const reports = await this.getReports();
    reports.push(report);
    localStorage.setItem(STORAGE_KEYS.EXPENSE_REPORTS, JSON.stringify(reports));

    await this.addAuditLog({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: report.createdBy,
      userName: report.employeeName,
      action: 'created',
      details: `Created expense report ${report.reportCode}`
    });

    return report;
  }

  static async updateReport(id: string, updates: Partial<ExpenseReport>): Promise<ExpenseReport> {
    // TODO: Replace with actual API call
    const reports = await this.getReports();
    const index = reports.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Expense report not found');

    const oldReport = reports[index];
    reports[index] = { ...oldReport, ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.EXPENSE_REPORTS, JSON.stringify(reports));

    return reports[index];
  }

  static async deleteReport(id: string): Promise<void> {
    // TODO: Replace with actual API call
    const report = await this.getReportById(id);
    if (!report) throw new Error('Expense report not found');

    if (report.status !== 'draft') {
      throw new Error('Only draft reports can be deleted');
    }

    const reports = await this.getReports();
    const filtered = reports.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.EXPENSE_REPORTS, JSON.stringify(filtered));
  }

  static async submitReport(id: string): Promise<ExpenseReport> {
    const report = await this.getReportById(id);
    if (!report) throw new Error('Expense report not found');

    if (report.items.length === 0) {
      throw new Error('Cannot submit empty expense report');
    }

    // Check for policy violations
    const violations = await this.checkPolicyViolations(report);
    const criticalViolations = violations.filter(v => v.severity === 'high' && !v.isOverridable);

    if (criticalViolations.length > 0) {
      throw new Error('Report has critical policy violations that must be resolved');
    }

    // Initialize approval chain
    const approvalChain = await this.initializeApprovalChain(report);

    const updated = await this.updateReport(id, {
      status: 'submitted',
      submittedDate: new Date().toISOString(),
      approvalChain,
      currentApproverId: approvalChain[0]?.approverId,
      currentApproverName: approvalChain[0]?.approverName
    });

    await this.addAuditLog({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: report.employeeId,
      userName: report.employeeName,
      action: 'submitted',
      details: `Submitted expense report ${report.reportCode} for approval`
    });

    return updated;
  }

  static async approveReport(id: string, approverId: string, approverName: string, approverTitle: string, level: number, comments?: string): Promise<ExpenseReport> {
    const report = await this.getReportById(id);
    if (!report) throw new Error('Expense report not found');

    const approval: ExpenseApproval = {
      id: `approval-${Date.now()}`,
      expenseReportId: id,
      approverId,
      approverName,
      approverTitle,
      approverLevel: level,
      status: 'approved',
      approvedAmount: report.totalAmount,
      approvedDate: new Date().toISOString(),
      comments
    };

    const approvalChain = [...report.approvalChain, approval];
    const nextApproval = approvalChain.find(a => a.status === 'pending');

    let status = report.status;
    let approvedDate: string | undefined;

    if (!nextApproval) {
      // All approvals complete
      status = 'approved';
      approvedDate = new Date().toISOString();

      // Create reimbursement if needed
      if (report.reimbursableAmount > 0) {
        await ReimbursementService.createReimbursement({
          id: `reimb-${Date.now()}`,
          expenseReportId: id,
          amount: report.reimbursableAmount,
          currency: report.currency,
          status: 'pending',
          paymentMethod: 'direct_deposit'
        });
      }
    }

    const updated = await this.updateReport(id, {
      status,
      approvalChain,
      approvedDate,
      currentApproverId: nextApproval?.approverId,
      currentApproverName: nextApproval?.approverName
    });

    await this.addAuditLog({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: approverId,
      userName: approverName,
      action: 'approved',
      details: `Approved expense report ${report.reportCode} (Level ${level})`
    });

    return updated;
  }

  static async rejectReport(id: string, approverId: string, approverName: string, reason: string): Promise<ExpenseReport> {
    const report = await this.getReportById(id);
    if (!report) throw new Error('Expense report not found');

    const updated = await this.updateReport(id, {
      status: 'rejected',
      rejectedReason: reason
    });

    await this.addAuditLog({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: approverId,
      userName: approverName,
      action: 'rejected',
      details: `Rejected expense report ${report.reportCode}: ${reason}`
    });

    return updated;
  }

  static async addItem(reportId: string, item: ExpenseItem): Promise<ExpenseReport> {
    const report = await this.getReportById(reportId);
    if (!report) throw new Error('Expense report not found');

    if (report.status !== 'draft') {
      throw new Error('Cannot add items to submitted reports');
    }

    report.items.push(item);
    this.recalculateTotals(report);

    return this.updateReport(reportId, report);
  }

  static async removeItem(reportId: string, itemId: string): Promise<ExpenseReport> {
    const report = await this.getReportById(reportId);
    if (!report) throw new Error('Expense report not found');

    if (report.status !== 'draft') {
      throw new Error('Cannot remove items from submitted reports');
    }

    report.items = report.items.filter(i => i.id !== itemId);
    this.recalculateTotals(report);

    return this.updateReport(reportId, report);
  }

  private static recalculateTotals(report: ExpenseReport): void {
    report.totalAmount = report.items.reduce((sum, item) => sum + item.amountInBaseCurrency, 0);
    report.reimbursableAmount = report.items
      .filter(i => i.isReimbursable && i.paymentMethod === 'personal_card')
      .reduce((sum, item) => sum + item.amountInBaseCurrency, 0);
    report.corporateCardAmount = report.items
      .filter(i => i.paymentMethod === 'corporate_card')
      .reduce((sum, item) => sum + item.amountInBaseCurrency, 0);
  }

  private static async checkPolicyViolations(report: ExpenseReport): Promise<PolicyViolation[]> {
    // TODO: Implement actual policy checking
    const violations: PolicyViolation[] = [];

    for (const item of report.items) {
      // Check for missing receipts
      if (!item.receipt && item.amount > 25) {
        violations.push({
          id: `violation-${Date.now()}`,
          policyId: 'policy-receipt',
          policyName: 'Receipt Requirement',
          violationType: 'missing_receipt',
          description: `Receipt required for expenses over $25`,
          severity: 'medium',
          isOverridable: true
        });
      }
    }

    return violations;
  }

  private static async initializeApprovalChain(report: ExpenseReport): Promise<ExpenseApproval[]> {
    // TODO: Build approval chain based on policy and amount
    const chain: ExpenseApproval[] = [];

    // Manager approval
    chain.push({
      id: `approval-mgr-${Date.now()}`,
      expenseReportId: report.id,
      approverId: report.managerId,
      approverName: report.managerName,
      approverTitle: 'Manager',
      approverLevel: 1,
      status: 'pending'
    });

    // Finance approval for amounts over threshold
    if (report.totalAmount > 1000) {
      chain.push({
        id: `approval-fin-${Date.now()}`,
        expenseReportId: report.id,
        approverId: 'finance-001',
        approverName: 'Finance Team',
        approverTitle: 'Finance Approver',
        approverLevel: 2,
        status: 'pending'
      });
    }

    return chain;
  }

  private static async addAuditLog(log: ExpenseAuditLog): Promise<void> {
    const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    const logs: ExpenseAuditLog[] = data ? JSON.parse(data) : [];
    logs.push(log);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  }
}

export class ExpenseItemService {
  static async getItems(reportId?: string): Promise<ExpenseItem[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSE_ITEMS);
    let items: ExpenseItem[] = data ? JSON.parse(data) : [];

    if (reportId) {
      items = items.filter(i => i.expenseReportId === reportId);
    }

    return items;
  }

  static async createItem(item: ExpenseItem): Promise<ExpenseItem> {
    // TODO: Replace with actual API call
    const items = await this.getItems();
    items.push(item);
    localStorage.setItem(STORAGE_KEYS.EXPENSE_ITEMS, JSON.stringify(items));
    return item;
  }

  static async updateItem(id: string, updates: Partial<ExpenseItem>): Promise<ExpenseItem> {
    // TODO: Replace with actual API call
    const items = await this.getItems();
    const index = items.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Expense item not found');

    items[index] = { ...items[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.EXPENSE_ITEMS, JSON.stringify(items));
    return items[index];
  }

  static async deleteItem(id: string): Promise<void> {
    // TODO: Replace with actual API call
    const items = await this.getItems();
    const filtered = items.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.EXPENSE_ITEMS, JSON.stringify(filtered));
  }

  static async splitItem(id: string, amounts: number[]): Promise<ExpenseItem[]> {
    const item = (await this.getItems()).find(i => i.id === id);
    if (!item) throw new Error('Expense item not found');

    const totalSplit = amounts.reduce((sum, amt) => sum + amt, 0);
    if (Math.abs(totalSplit - item.amount) > 0.01) {
      throw new Error('Split amounts must equal original amount');
    }

    const splitItems: ExpenseItem[] = amounts.map((amt, index) => ({
      ...item,
      id: `${item.id}-split-${index}`,
      amount: amt,
      amountInBaseCurrency: amt * (item.exchangeRate || 1),
      description: `${item.description} (Split ${index + 1}/${amounts.length})`
    }));

    // Delete original and create split items
    await this.deleteItem(id);
    for (const splitItem of splitItems) {
      await this.createItem(splitItem);
    }

    return splitItems;
  }
}

export class ExpenseCategoryService {
  static async getCategories(filters?: { isActive?: boolean; parentId?: string }): Promise<ExpenseCategory[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    let categories: ExpenseCategory[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.isActive !== undefined) categories = categories.filter(c => c.isActive === filters.isActive);
      if (filters.parentId) categories = categories.filter(c => c.parentCategoryId === filters.parentId);
    }

    return categories;
  }

  static async createCategory(category: ExpenseCategory): Promise<ExpenseCategory> {
    // TODO: Replace with actual API call
    const categories = await this.getCategories();
    categories.push(category);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    return category;
  }

  static async updateCategory(id: string, updates: Partial<ExpenseCategory>): Promise<ExpenseCategory> {
    // TODO: Replace with actual API call
    const categories = await this.getCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Category not found');

    categories[index] = { ...categories[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    return categories[index];
  }

  static async deleteCategory(id: string): Promise<void> {
    // TODO: Replace with actual API call
    const categories = await this.getCategories();
    const filtered = categories.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(filtered));
  }
}

export class ExpensePolicyService {
  static async getPolicies(filters?: { isActive?: boolean }): Promise<ExpensePolicy[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.POLICIES);
    let policies: ExpensePolicy[] = data ? JSON.parse(data) : [];

    if (filters?.isActive !== undefined) {
      policies = policies.filter(p => p.isActive === filters.isActive);
    }

    return policies;
  }

  static async createPolicy(policy: ExpensePolicy): Promise<ExpensePolicy> {
    // TODO: Replace with actual API call
    const policies = await this.getPolicies();
    policies.push(policy);
    localStorage.setItem(STORAGE_KEYS.POLICIES, JSON.stringify(policies));
    return policy;
  }

  static async updatePolicy(id: string, updates: Partial<ExpensePolicy>): Promise<ExpensePolicy> {
    // TODO: Replace with actual API call
    const policies = await this.getPolicies();
    const index = policies.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Policy not found');

    policies[index] = { ...policies[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.POLICIES, JSON.stringify(policies));
    return policies[index];
  }

  static async validateExpense(expense: ExpenseItem, policy: ExpensePolicy): Promise<PolicyViolation[]> {
    // TODO: Implement actual policy validation
    const violations: PolicyViolation[] = [];

    for (const rule of policy.rules) {
      if (rule.ruleType === 'amount_limit' && rule.threshold && expense.amount > rule.threshold) {
        violations.push({
          id: `violation-${Date.now()}`,
          policyId: policy.id,
          policyName: policy.policyName,
          violationType: 'amount_exceeded',
          description: rule.message,
          severity: 'high',
          requiredAction: rule.action,
          isOverridable: !rule.isEnforced
        });
      }
    }

    return violations;
  }
}

export class ReimbursementService {
  static async getReimbursements(filters?: { status?: string; employeeId?: string }): Promise<ReimbursementInfo[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.REIMBURSEMENTS);
    let reimbursements: ReimbursementInfo[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.status) reimbursements = reimbursements.filter(r => r.status === filters.status);
    }

    return reimbursements;
  }

  static async createReimbursement(reimbursement: ReimbursementInfo): Promise<ReimbursementInfo> {
    // TODO: Replace with actual API call
    const reimbursements = await this.getReimbursements();
    reimbursements.push(reimbursement);
    localStorage.setItem(STORAGE_KEYS.REIMBURSEMENTS, JSON.stringify(reimbursements));
    return reimbursement;
  }

  static async processReimbursement(id: string, processedBy: string): Promise<ReimbursementInfo> {
    // TODO: Replace with actual API call
    const reimbursements = await this.getReimbursements();
    const index = reimbursements.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Reimbursement not found');

    reimbursements[index] = {
      ...reimbursements[index],
      status: 'processing',
      processedBy,
      processedDate: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEYS.REIMBURSEMENTS, JSON.stringify(reimbursements));
    return reimbursements[index];
  }

  static async markAsPaid(id: string, paymentReference: string): Promise<ReimbursementInfo> {
    // TODO: Replace with actual API call
    const reimbursements = await this.getReimbursements();
    const index = reimbursements.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Reimbursement not found');

    reimbursements[index] = {
      ...reimbursements[index],
      status: 'paid',
      actualPaymentDate: new Date().toISOString(),
      paymentReference
    };

    localStorage.setItem(STORAGE_KEYS.REIMBURSEMENTS, JSON.stringify(reimbursements));

    // Update expense report status
    const reportId = reimbursements[index].expenseReportId;
    await ExpenseReportService.updateReport(reportId, { status: 'paid', paidDate: new Date().toISOString() });

    return reimbursements[index];
  }
}

export class CorporateCardService {
  static async getCards(filters?: { employeeId?: string; status?: string }): Promise<CorporateCard[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.CORPORATE_CARDS);
    let cards: CorporateCard[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.employeeId) cards = cards.filter(c => c.employeeId === filters.employeeId);
      if (filters.status) cards = cards.filter(c => c.status === filters.status);
    }

    return cards;
  }

  static async createCard(card: CorporateCard): Promise<CorporateCard> {
    // TODO: Replace with actual API call
    const cards = await this.getCards();
    cards.push(card);
    localStorage.setItem(STORAGE_KEYS.CORPORATE_CARDS, JSON.stringify(cards));
    return card;
  }

  static async updateCard(id: string, updates: Partial<CorporateCard>): Promise<CorporateCard> {
    // TODO: Replace with actual API call
    const cards = await this.getCards();
    const index = cards.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Card not found');

    cards[index] = { ...cards[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.CORPORATE_CARDS, JSON.stringify(cards));
    return cards[index];
  }

  static async suspendCard(id: string, reason: string): Promise<CorporateCard> {
    return this.updateCard(id, { status: 'suspended', notes: reason });
  }

  static async cancelCard(id: string, reason: string): Promise<CorporateCard> {
    return this.updateCard(id, { status: 'cancelled', notes: reason });
  }
}

export class ExpenseBudgetService {
  static async getBudgets(filters?: { departmentId?: string; fiscalYear?: string }): Promise<ExpenseBudget[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    let budgets: ExpenseBudget[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.departmentId) budgets = budgets.filter(b => b.departmentId === filters.departmentId);
      if (filters.fiscalYear) budgets = budgets.filter(b => b.fiscalYear === filters.fiscalYear);
    }

    return budgets;
  }

  static async createBudget(budget: ExpenseBudget): Promise<ExpenseBudget> {
    // TODO: Replace with actual API call
    const budgets = await this.getBudgets();
    budgets.push(budget);
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    return budget;
  }

  static async updateBudget(id: string, updates: Partial<ExpenseBudget>): Promise<ExpenseBudget> {
    // TODO: Replace with actual API call
    const budgets = await this.getBudgets();
    const index = budgets.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Budget not found');

    budgets[index] = { ...budgets[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    return budgets[index];
  }

  static async checkBudgetAvailability(departmentId: string, categoryId: string, amount: number): Promise<boolean> {
    const budgets = await this.getBudgets({ departmentId });
    if (budgets.length === 0) return true; // No budget enforcement

    const budget = budgets[0];
    const category = budget.categories.find(c => c.categoryId === categoryId);

    if (!category) return true;

    return category.availableAmount >= amount;
  }
}

export class ExpenseAnalyticsService {
  static async getMetrics(): Promise<ExpenseMetrics> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.METRICS);
    return data ? JSON.parse(data) : {
      totalExpenses: 0,
      totalReimbursable: 0,
      totalCorporateCard: 0,
      averageExpenseAmount: 0,
      pendingApprovals: 0,
      pendingReimbursements: 0,
      totalReimbursed: 0,
      processingTime: 0,
      approvalTime: 0,
      reimbursementTime: 0,
      policyViolations: 0,
      rejectionRate: 0,
      expensesByCategory: [],
      expensesByDepartment: [],
      expensesByEmployee: [],
      expensesByMonth: [],
      topExpenseTypes: [],
      topMerchants: [],
      budgetUtilization: [],
      complianceScore: 0
    };
  }
}

export class ExpenseSettingsService {
  static async getSettings(): Promise<ExpenseSettings> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
      enableExpenseReports: true,
      enableCorporateCards: true,
      enableMileageTracking: true,
      enablePerDiem: true,
      enableMultiCurrency: false,
      baseCurrency: 'USD',
      enableReceiptOCR: true,
      enableAutoApproval: false,
      autoApprovalThreshold: 100,
      requireManagerApproval: true,
      requireFinanceApproval: true,
      financeApprovalThreshold: 1000,
      enableBudgetEnforcement: false,
      allowOverBudget: true,
      submissionDeadlineDays: 30,
      receiptRequiredThreshold: 25,
      allowPersonalExpenses: false,
      enableMobileApp: true,
      enableEmailNotifications: true,
      enablePushNotifications: true,
      defaultMileageRate: 0.67,
      defaultPerDiemRate: 75,
      taxRate: 0.0,
      fiscalYearStart: '01-01',
      reimbursementCycle: 'bi_weekly',
      paymentMethod: 'direct_deposit'
    };
  }

  static async updateSettings(updates: Partial<ExpenseSettings>): Promise<ExpenseSettings> {
    // TODO: Replace with actual API call
    const settings = await this.getSettings();
    const updated = { ...settings, ...updates };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }
}

export class ExpenseCommentService {
  static async getComments(reportId: string): Promise<ExpenseComment[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    const comments: ExpenseComment[] = data ? JSON.parse(data) : [];
    return comments.filter(c => c.expenseReportId === reportId);
  }

  static async addComment(comment: ExpenseComment): Promise<ExpenseComment> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    const comments: ExpenseComment[] = data ? JSON.parse(data) : [];
    comments.push(comment);
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
    return comment;
  }
}
