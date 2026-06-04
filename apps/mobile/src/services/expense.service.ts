/**
 * Expense Service (mobile)
 * Bridges to /api/v1/compensation/expense-claims for both employee submission
 * and manager approval workflows (§15.2 mobile happy path).
 */

import { apiService } from './api.service';

export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';

export type ExpenseCategory =
  | 'TRAVEL'
  | 'MEALS'
  | 'ACCOMMODATION'
  | 'OFFICE'
  | 'TRAINING'
  | 'OTHER';

export interface Expense {
  id: string;
  employeeId: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  date: string;
  receiptUrl?: string | null;
  status: ExpenseStatus;
  approvedBy?: string | null;
  approvedAt?: string | null;
  paidAt?: string | null;
  rejectionReason?: string | null;
}

class ExpenseService {
  async list(params?: {
    status?: ExpenseStatus;
    employeeId?: string;
    category?: ExpenseCategory;
  }): Promise<Expense[]> {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.employeeId) q.set('employeeId', params.employeeId);
    if (params?.category) q.set('category', params.category);
    const response = await apiService.get<{ data: Expense[] }>(
      `/compensation/expense-claims?${q.toString()}`
    );
    return response.data;
  }

  async submit(input: {
    title: string;
    description?: string;
    amount: number;
    currency?: string;
    category: ExpenseCategory;
    date: string;
    receiptUrl?: string;
  }): Promise<Expense> {
    const response = await apiService.post<{ data: Expense }>(
      `/compensation/expense-claims`,
      input
    );
    return response.data;
  }

  async approve(id: string): Promise<Expense> {
    const response = await apiService.put<{ data: Expense }>(`/compensation/expense-claims`, {
      id,
      status: 'APPROVED',
    });
    return response.data;
  }

  async reject(id: string, reason: string): Promise<Expense> {
    const response = await apiService.put<{ data: Expense }>(`/compensation/expense-claims`, {
      id,
      status: 'REJECTED',
      rejectionReason: reason,
    });
    return response.data;
  }
}

export const expenseService = new ExpenseService();
