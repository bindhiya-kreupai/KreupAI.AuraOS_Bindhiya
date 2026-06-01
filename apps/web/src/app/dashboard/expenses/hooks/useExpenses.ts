// Expense Management Custom Hook
import { useState, useEffect, useCallback } from 'react';
import type {
  ExpenseReport,
  ExpenseItem,
  ExpenseCategory,
  ExpensePolicy,
  CorporateCard,
  ExpenseBudget,
  ExpenseMetrics,
  ExpenseSettings,
  ReimbursementInfo
} from '../types';
import {
  ExpenseReportService,
  ExpenseItemService,
  ExpenseCategoryService,
  ExpensePolicyService,
  ReimbursementService,
  CorporateCardService,
  ExpenseBudgetService,
  ExpenseAnalyticsService,
  ExpenseSettingsService
} from '../services';
import { expenseData } from '../data';
import { useToast } from '../components/Toast';

export const useExpenses = () => {
  const [reports, setReports] = useState<ExpenseReport[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [policies, setPolicies] = useState<ExpensePolicy[]>([]);
  const [corporateCards, setCorporateCards] = useState<CorporateCard[]>([]);
  const [budgets, setBudgets] = useState<ExpenseBudget[]>([]);
  const [reimbursements, setReimbursements] = useState<ReimbursementInfo[]>([]);
  const [metrics, setMetrics] = useState<ExpenseMetrics | null>(null);
  const [settings, setSettings] = useState<ExpenseSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const toast = useToast();

  // Expense Report operations
  const loadReports = useCallback(async (filters?: any) => {
    try {
      setIsLoading(true);
      const data = await ExpenseReportService.getReports(filters);
      setReports(data);
    } catch (error) {
      toast.error(`Failed to load expense reports: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createReport = useCallback(async (report: ExpenseReport) => {
    try {
      setIsSaving(true);
      const created = await ExpenseReportService.createReport(report);
      setReports(prev => [...prev, created]);
      toast.success('Expense report created successfully');
      return created;
    } catch (error) {
      toast.error(`Failed to create expense report: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const updateReport = useCallback(async (id: string, updates: Partial<ExpenseReport>) => {
    try {
      setIsSaving(true);
      const updated = await ExpenseReportService.updateReport(id, updates);
      setReports(prev => prev.map(r => r.id === id ? updated : r));
      toast.success('Expense report updated successfully');
      return updated;
    } catch (error) {
      toast.error(`Failed to update expense report: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const deleteReport = useCallback(async (id: string) => {
    try {
      setIsSaving(true);
      await ExpenseReportService.deleteReport(id);
      setReports(prev => prev.filter(r => r.id !== id));
      toast.success('Expense report deleted successfully');
    } catch (error) {
      toast.error(`Failed to delete expense report: ${(error as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const submitReport = useCallback(async (id: string) => {
    try {
      setIsSaving(true);
      const submitted = await ExpenseReportService.submitReport(id);
      setReports(prev => prev.map(r => r.id === id ? submitted : r));
      toast.success('Expense report submitted for approval');
      return submitted;
    } catch (error) {
      toast.error(`Failed to submit expense report: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const approveReport = useCallback(async (id: string, approverId: string, approverName: string, approverTitle: string, level: number, comments?: string) => {
    try {
      setIsSaving(true);
      const approved = await ExpenseReportService.approveReport(id, approverId, approverName, approverTitle, level, comments);
      setReports(prev => prev.map(r => r.id === id ? approved : r));
      toast.success('Expense report approved');
      return approved;
    } catch (error) {
      toast.error(`Failed to approve expense report: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const rejectReport = useCallback(async (id: string, approverId: string, approverName: string, reason: string) => {
    try {
      setIsSaving(true);
      const rejected = await ExpenseReportService.rejectReport(id, approverId, approverName, reason);
      setReports(prev => prev.map(r => r.id === id ? rejected : r));
      toast.success('Expense report rejected');
      return rejected;
    } catch (error) {
      toast.error(`Failed to reject expense report: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const addItem = useCallback(async (reportId: string, item: ExpenseItem) => {
    try {
      setIsSaving(true);
      const updated = await ExpenseReportService.addItem(reportId, item);
      setReports(prev => prev.map(r => r.id === reportId ? updated : r));
      toast.success('Expense item added');
      return updated;
    } catch (error) {
      toast.error(`Failed to add expense item: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const removeItem = useCallback(async (reportId: string, itemId: string) => {
    try {
      setIsSaving(true);
      const updated = await ExpenseReportService.removeItem(reportId, itemId);
      setReports(prev => prev.map(r => r.id === reportId ? updated : r));
      toast.success('Expense item removed');
      return updated;
    } catch (error) {
      toast.error(`Failed to remove expense item: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Expense Item operations
  const createItem = useCallback(async (item: ExpenseItem) => {
    try {
      setIsSaving(true);
      const created = await ExpenseItemService.createItem(item);
      toast.success('Expense item created successfully');
      return created;
    } catch (error) {
      toast.error(`Failed to create expense item: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const updateItem = useCallback(async (id: string, updates: Partial<ExpenseItem>) => {
    try {
      setIsSaving(true);
      const updated = await ExpenseItemService.updateItem(id, updates);
      toast.success('Expense item updated successfully');
      return updated;
    } catch (error) {
      toast.error(`Failed to update expense item: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const splitItem = useCallback(async (id: string, amounts: number[]) => {
    try {
      setIsSaving(true);
      const splitItems = await ExpenseItemService.splitItem(id, amounts);
      toast.success('Expense item split successfully');
      return splitItems;
    } catch (error) {
      toast.error(`Failed to split expense item: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Category operations
  const loadCategories = useCallback(async (filters?: any) => {
    try {
      const data = await ExpenseCategoryService.getCategories(filters);
      setCategories(data);
    } catch (error) {
      toast.error(`Failed to load expense categories: ${(error as Error).message}`);
    }
  }, [toast]);

  const createCategory = useCallback(async (category: ExpenseCategory) => {
    try {
      setIsSaving(true);
      const created = await ExpenseCategoryService.createCategory(category);
      setCategories(prev => [...prev, created]);
      toast.success('Expense category created successfully');
      return created;
    } catch (error) {
      toast.error(`Failed to create expense category: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const updateCategory = useCallback(async (id: string, updates: Partial<ExpenseCategory>) => {
    try {
      setIsSaving(true);
      const updated = await ExpenseCategoryService.updateCategory(id, updates);
      setCategories(prev => prev.map(c => c.id === id ? updated : c));
      toast.success('Expense category updated successfully');
      return updated;
    } catch (error) {
      toast.error(`Failed to update expense category: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      setIsSaving(true);
      await ExpenseCategoryService.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success('Expense category deleted successfully');
    } catch (error) {
      toast.error(`Failed to delete expense category: ${(error as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Policy operations
  const loadPolicies = useCallback(async (filters?: any) => {
    try {
      const data = await ExpensePolicyService.getPolicies(filters);
      setPolicies(data);
    } catch (error) {
      toast.error(`Failed to load expense policies: ${(error as Error).message}`);
    }
  }, [toast]);

  const createPolicy = useCallback(async (policy: ExpensePolicy) => {
    try {
      setIsSaving(true);
      const created = await ExpensePolicyService.createPolicy(policy);
      setPolicies(prev => [...prev, created]);
      toast.success('Expense policy created successfully');
      return created;
    } catch (error) {
      toast.error(`Failed to create expense policy: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const updatePolicy = useCallback(async (id: string, updates: Partial<ExpensePolicy>) => {
    try {
      setIsSaving(true);
      const updated = await ExpensePolicyService.updatePolicy(id, updates);
      setPolicies(prev => prev.map(p => p.id === id ? updated : p));
      toast.success('Expense policy updated successfully');
      return updated;
    } catch (error) {
      toast.error(`Failed to update expense policy: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Corporate Card operations
  const loadCorporateCards = useCallback(async (filters?: any) => {
    try {
      const data = await CorporateCardService.getCards(filters);
      setCorporateCards(data);
    } catch (error) {
      toast.error(`Failed to load corporate cards: ${(error as Error).message}`);
    }
  }, [toast]);

  const createCorporateCard = useCallback(async (card: CorporateCard) => {
    try {
      setIsSaving(true);
      const created = await CorporateCardService.createCard(card);
      setCorporateCards(prev => [...prev, created]);
      toast.success('Corporate card created successfully');
      return created;
    } catch (error) {
      toast.error(`Failed to create corporate card: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const updateCorporateCard = useCallback(async (id: string, updates: Partial<CorporateCard>) => {
    try {
      setIsSaving(true);
      const updated = await CorporateCardService.updateCard(id, updates);
      setCorporateCards(prev => prev.map(c => c.id === id ? updated : c));
      toast.success('Corporate card updated successfully');
      return updated;
    } catch (error) {
      toast.error(`Failed to update corporate card: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const suspendCard = useCallback(async (id: string, reason: string) => {
    try {
      setIsSaving(true);
      const suspended = await CorporateCardService.suspendCard(id, reason);
      setCorporateCards(prev => prev.map(c => c.id === id ? suspended : c));
      toast.success('Corporate card suspended');
      return suspended;
    } catch (error) {
      toast.error(`Failed to suspend corporate card: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const cancelCard = useCallback(async (id: string, reason: string) => {
    try {
      setIsSaving(true);
      const cancelled = await CorporateCardService.cancelCard(id, reason);
      setCorporateCards(prev => prev.map(c => c.id === id ? cancelled : c));
      toast.success('Corporate card cancelled');
      return cancelled;
    } catch (error) {
      toast.error(`Failed to cancel corporate card: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Budget operations
  const loadBudgets = useCallback(async (filters?: any) => {
    try {
      const data = await ExpenseBudgetService.getBudgets(filters);
      setBudgets(data);
    } catch (error) {
      toast.error(`Failed to load budgets: ${(error as Error).message}`);
    }
  }, [toast]);

  const createBudget = useCallback(async (budget: ExpenseBudget) => {
    try {
      setIsSaving(true);
      const created = await ExpenseBudgetService.createBudget(budget);
      setBudgets(prev => [...prev, created]);
      toast.success('Budget created successfully');
      return created;
    } catch (error) {
      toast.error(`Failed to create budget: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const updateBudget = useCallback(async (id: string, updates: Partial<ExpenseBudget>) => {
    try {
      setIsSaving(true);
      const updated = await ExpenseBudgetService.updateBudget(id, updates);
      setBudgets(prev => prev.map(b => b.id === id ? updated : b));
      toast.success('Budget updated successfully');
      return updated;
    } catch (error) {
      toast.error(`Failed to update budget: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const checkBudgetAvailability = useCallback(async (departmentId: string, categoryId: string, amount: number) => {
    try {
      const available = await ExpenseBudgetService.checkBudgetAvailability(departmentId, categoryId, amount);
      return available;
    } catch (error) {
      toast.error(`Failed to check budget availability: ${(error as Error).message}`);
      return false;
    }
  }, [toast]);

  // Reimbursement operations
  const loadReimbursements = useCallback(async (filters?: any) => {
    try {
      const data = await ReimbursementService.getReimbursements(filters);
      setReimbursements(data);
    } catch (error) {
      toast.error(`Failed to load reimbursements: ${(error as Error).message}`);
    }
  }, [toast]);

  const processReimbursement = useCallback(async (id: string, processedBy: string) => {
    try {
      setIsSaving(true);
      const processed = await ReimbursementService.processReimbursement(id, processedBy);
      setReimbursements(prev => prev.map(r => r.id === id ? processed : r));
      toast.success('Reimbursement processing started');
      return processed;
    } catch (error) {
      toast.error(`Failed to process reimbursement: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const markReimbursementPaid = useCallback(async (id: string, paymentReference: string) => {
    try {
      setIsSaving(true);
      const paid = await ReimbursementService.markAsPaid(id, paymentReference);
      setReimbursements(prev => prev.map(r => r.id === id ? paid : r));
      toast.success('Reimbursement marked as paid');
      return paid;
    } catch (error) {
      toast.error(`Failed to mark reimbursement as paid: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Analytics
  const loadMetrics = useCallback(async () => {
    try {
      const data = await ExpenseAnalyticsService.getMetrics();
      setMetrics(data);
    } catch (error) {
      toast.error(`Failed to load metrics: ${(error as Error).message}`);
    }
  }, [toast]);

  // Settings
  const loadSettings = useCallback(async () => {
    try {
      const data = await ExpenseSettingsService.getSettings();
      setSettings(data);
    } catch (error) {
      toast.error(`Failed to load settings: ${(error as Error).message}`);
    }
  }, [toast]);

  const updateSettings = useCallback(async (updates: Partial<ExpenseSettings>) => {
    try {
      setIsSaving(true);
      const updated = await ExpenseSettingsService.updateSettings(updates);
      setSettings(updated);
      toast.success('Settings updated successfully');
      return updated;
    } catch (error) {
      toast.error(`Failed to update settings: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Initialize sample data
  const initializeSampleData = useCallback(async () => {
    try {
      setIsSaving(true);

      // Create categories
      for (const category of expenseData.categories) {
        await ExpenseCategoryService.createCategory(category);
      }

      // Create policies
      for (const policy of expenseData.policies) {
        await ExpensePolicyService.createPolicy(policy);
      }

      // Create reports
      for (const report of expenseData.reports) {
        await ExpenseReportService.createReport(report);
      }

      // Create corporate cards
      for (const card of expenseData.corporateCards) {
        await CorporateCardService.createCard(card);
      }

      // Create budgets
      for (const budget of expenseData.budgets) {
        await ExpenseBudgetService.createBudget(budget);
      }

      await loadReports();
      await loadCategories();
      await loadPolicies();
      await loadCorporateCards();
      await loadBudgets();
      await loadMetrics();

      toast.success('Sample data initialized');
    } catch (error) {
      toast.error(`Failed to initialize data: ${(error as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  }, [loadReports, loadCategories, loadPolicies, loadCorporateCards, loadBudgets, loadMetrics, toast]);

  useEffect(() => {
    loadReports();
    loadCategories();
    loadPolicies();
    loadCorporateCards();
    loadBudgets();
    loadReimbursements();
    loadMetrics();
    loadSettings();
  }, []);

  return {
    // State
    reports,
    categories,
    policies,
    corporateCards,
    budgets,
    reimbursements,
    metrics,
    settings,
    isLoading,
    isSaving,
    error,

    // Expense Report operations
    loadReports,
    createReport,
    updateReport,
    deleteReport,
    submitReport,
    approveReport,
    rejectReport,
    addItem,
    removeItem,

    // Expense Item operations
    createItem,
    updateItem,
    splitItem,

    // Category operations
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,

    // Policy operations
    loadPolicies,
    createPolicy,
    updatePolicy,

    // Corporate Card operations
    loadCorporateCards,
    createCorporateCard,
    updateCorporateCard,
    suspendCard,
    cancelCard,

    // Budget operations
    loadBudgets,
    createBudget,
    updateBudget,
    checkBudgetAvailability,

    // Reimbursement operations
    loadReimbursements,
    processReimbursement,
    markReimbursementPaid,

    // Analytics & Settings
    loadMetrics,
    loadSettings,
    updateSettings,
    initializeSampleData
  };
};
