/**
 * Leave Service
 * Handles leave requests and balances
 */

import { apiService } from './api.service';
import { LeaveRequest, LeaveBalance, LeaveType, LeaveStatus } from '@/types';

interface ApplyLeaveRequest {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  attachments?: string[];
  halfDay?: 'first_half' | 'second_half';
}

interface LeaveResponse {
  success: boolean;
  data: LeaveRequest;
  message: string;
}

class LeaveService {
  /**
   * Get leave balances
   */
  async getBalances(): Promise<LeaveBalance[]> {
    const response = await apiService.get<{ data: LeaveBalance[] }>('/leave/balances');
    return response.data;
  }

  /**
   * Apply for leave
   */
  async applyLeave(data: ApplyLeaveRequest): Promise<LeaveResponse> {
    return apiService.post<LeaveResponse>('/leave/apply', data);
  }

  /**
   * Get leave requests
   */
  async getRequests(params?: {
    status?: LeaveStatus;
    year?: number;
    page?: number;
    limit?: number;
  }): Promise<{
    data: LeaveRequest[];
    total: number;
    page: number;
    pages: number;
  }> {
    return apiService.get('/leave/requests', params);
  }

  /**
   * Get leave request by ID
   */
  async getRequest(requestId: string): Promise<LeaveRequest> {
    return apiService.get(`/leave/requests/${requestId}`);
  }

  /**
   * Cancel leave request
   */
  async cancelRequest(requestId: string, reason?: string): Promise<LeaveResponse> {
    return apiService.post(`/leave/requests/${requestId}/cancel`, { reason });
  }

  /**
   * Get pending approvals (for managers)
   */
  async getPendingApprovals(): Promise<LeaveRequest[]> {
    const response = await apiService.get<{ data: LeaveRequest[] }>('/leave/approvals/pending');
    return response.data;
  }

  /**
   * Approve leave request (for managers)
   */
  async approveRequest(requestId: string, comments?: string): Promise<LeaveResponse> {
    return apiService.post(`/leave/approvals/${requestId}/approve`, { comments });
  }

  /**
   * Reject leave request (for managers)
   */
  async rejectRequest(requestId: string, reason: string): Promise<LeaveResponse> {
    return apiService.post(`/leave/approvals/${requestId}/reject`, { reason });
  }

  /**
   * Get upcoming holidays
   */
  async getHolidays(year?: number): Promise<{
    holidays: {
      date: string;
      name: string;
      nameAr?: string;
      type: 'public' | 'company' | 'optional';
    }[];
  }> {
    return apiService.get('/leave/holidays', { year: year || new Date().getFullYear() });
  }

  /**
   * Get leave policy
   */
  async getPolicy(): Promise<{
    policies: {
      leaveType: LeaveType;
      entitlement: number;
      carryForward: number;
      maxConsecutive: number;
      noticePeriod: number;
      requiresApproval: boolean;
      requiresProof: boolean;
    }[];
  }> {
    return apiService.get('/leave/policy');
  }

  /**
   * Check leave availability
   */
  async checkAvailability(data: {
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
  }): Promise<{
    available: boolean;
    days: number;
    conflicts?: string[];
    balanceAfter: number;
  }> {
    return apiService.post('/leave/check-availability', data);
  }
}

export const leaveService = new LeaveService();
