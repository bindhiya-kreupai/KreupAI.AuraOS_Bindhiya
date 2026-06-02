/**
 * Leave Management Service Layer
 * Production-ready service layer with API integration using APIClient
 */

import { APIClient } from '@/lib/api-client';
import type {
  LeaveType,
  LeavePolicy,
  LeaveBalance,
  LeaveRequest,
  Holiday,
  LeaveEncashment,
  CompOff,
  CarryForward,
  LeaveStats,
  LeaveSettings,
} from './types';
import { HolidayCalendar } from './types';

// ============================================================================
// LEGACY CODE (COMMENTED OUT - NO LONGER NEEDED)
// ============================================================================

// const API_BASE = '/api/leave';
// const STORAGE_KEYS = { ... };
// const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
// class StorageService { ... }

// ============================================================================
// LEAVE TYPES SERVICE
// ============================================================================

export class LeaveTypeService {
  /**
   * Get all leave types
   */
  static async getLeaveTypes(): Promise<LeaveType[]> {
    try {
      const response = await APIClient.get<unknown>('/leave/types');
      return APIClient.unwrapList<LeaveType>(response, 'types');
    } catch (error: any) {
      return [];
    }
  }

  /**
   * Get single leave type
   */
  static async getLeaveType(id: string): Promise<LeaveType | null> {
    try {
      const response = await APIClient.get<unknown>(`/leave/types/${id}`);
      return APIClient.unwrapItem<LeaveType>(response, 'type');
    } catch (error: any) {
      return null;
    }
  }

  /**
   * Create leave type
   */
  static async createLeaveType(leaveType: LeaveType): Promise<LeaveType> {
    const response = await APIClient.post<{ type?: LeaveType; leaveType?: LeaveType }>(
      '/leave/types',
      leaveType
    );
    return response.type || response.leaveType || leaveType;
  }

  /**
   * Update leave type
   */
  static async updateLeaveType(id: string, updates: Partial<LeaveType>): Promise<LeaveType> {
    const response = await APIClient.put<{ type?: LeaveType; leaveType?: LeaveType }>(
      `/leave/types/${id}`,
      updates
    );
    return response.type || response.leaveType || ({ ...updates, id } as LeaveType);
  }

  /**
   * Delete leave type
   */
  static async deleteLeaveType(id: string): Promise<void> {
    await APIClient.delete(`/leave/types/${id}`);
  }
}

// ============================================================================
// LEAVE POLICY SERVICE
// ============================================================================

export class LeavePolicyService {
  /**
   * Get all leave policies
   */
  static async getPolicies(): Promise<LeavePolicy[]> {
    try {
      const response = await APIClient.get<unknown>('/leave/policy');
      return APIClient.unwrapList<LeavePolicy>(response, 'policies');
    } catch (error: any) {
      return [];
    }
  }

  /**
   * Create leave policy
   */
  static async createPolicy(policy: LeavePolicy): Promise<LeavePolicy> {
    const response = await APIClient.post<{ policy?: LeavePolicy; leavePolicy?: LeavePolicy }>(
      '/leave/policy',
      policy
    );
    return response.policy || response.leavePolicy || policy;
  }

  /**
   * Update leave policy
   */
  static async updatePolicy(id: string, updates: Partial<LeavePolicy>): Promise<LeavePolicy> {
    const response = await APIClient.put<{ policy?: LeavePolicy; leavePolicy?: LeavePolicy }>(
      `/leave/policy/${id}`,
      updates
    );
    return response.policy || response.leavePolicy || ({ ...updates, id } as LeavePolicy);
  }
}

// ============================================================================
// LEAVE BALANCE SERVICE
// ============================================================================

export class LeaveBalanceService {
  /**
   * Get leave balances (optionally filtered by employee)
   */
  static async getBalances(employeeId?: string): Promise<LeaveBalance[]> {
    try {
      const url = employeeId ? `/leave/balance?employeeId=${employeeId}` : '/leave/balance';
      const response = await APIClient.get<unknown>(url);
      return APIClient.unwrapList<LeaveBalance>(response, 'balances');
    } catch (error: any) {
      return [];
    }
  }

  /**
   * Get employee balance for specific leave type
   */
  static async getBalance(employeeId: string, leaveTypeId: string): Promise<LeaveBalance | null> {
    try {
      const response = await APIClient.get<unknown>(`/leave/balance/${employeeId}/${leaveTypeId}`);
      return APIClient.unwrapItem<LeaveBalance>(response, 'balance');
    } catch (error: any) {
      return null;
    }
  }

  /**
   * Update leave balance (manual adjustment)
   */
  static async updateBalance(id: string, updates: Partial<LeaveBalance>): Promise<LeaveBalance> {
    const response = await APIClient.put<{ balance?: LeaveBalance; leaveBalance?: LeaveBalance }>(
      `/leave/balance/${id}`,
      updates
    );
    return response.balance || response.leaveBalance || ({ ...updates, id } as LeaveBalance);
  }

  /**
   * Process leave accrual (monthly/anniversary)
   */
  static async processAccrual(
    employeeId: string,
    leaveTypeId: string,
    accrualDays: number
  ): Promise<LeaveBalance> {
    const response = await APIClient.post<{ balance?: LeaveBalance; leaveBalance?: LeaveBalance }>(
      '/leave/accrual',
      { employeeId, leaveTypeId, accrualDays }
    );
    return response.balance || response.leaveBalance || ({} as LeaveBalance);
  }
}

// ============================================================================
// LEAVE REQUEST SERVICE
// ============================================================================

export class LeaveRequestService {
  /**
   * Get leave requests (optionally filtered by employee or status)
   */
  static async getRequests(filters?: {
    employeeId?: string;
    status?: string;
  }): Promise<LeaveRequest[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.employeeId) params.append('employeeId', filters.employeeId);
      if (filters?.status) params.append('status', filters.status);

      const url = params.toString() ? `/leave?${params}` : '/leave';
      const response = await APIClient.get<unknown>(url);
      return APIClient.unwrapList<LeaveRequest>(response, 'requests');
    } catch (error: any) {
      return [];
    }
  }

  /**
   * Get single leave request
   */
  static async getRequest(id: string): Promise<LeaveRequest | null> {
    try {
      const response = await APIClient.get<unknown>(`/leave/${id}`);
      return APIClient.unwrapItem<LeaveRequest>(response, 'request');
    } catch (error: any) {
      return null;
    }
  }

  /**
   * Create leave request
   */
  static async createRequest(request: LeaveRequest): Promise<LeaveRequest> {
    const response = await APIClient.post<{ request?: LeaveRequest; leaveRequest?: LeaveRequest }>(
      '/leave',
      request
    );
    return response.request || response.leaveRequest || request;
  }

  /**
   * Update leave request
   */
  static async updateRequest(id: string, updates: Partial<LeaveRequest>): Promise<LeaveRequest> {
    const response = await APIClient.put<{ request?: LeaveRequest; leaveRequest?: LeaveRequest }>(
      `/leave/${id}`,
      updates
    );
    return response.request || response.leaveRequest || ({ ...updates, id } as LeaveRequest);
  }

  /**
   * Approve leave request
   */
  static async approveRequest(
    id: string,
    approverId: string,
    approverName: string,
    comments?: string
  ): Promise<LeaveRequest> {
    const response = await APIClient.post<{ request?: LeaveRequest; leaveRequest?: LeaveRequest }>(
      `/leave/${id}/approve`,
      { approverId, approverName, comments }
    );
    return response.request || response.leaveRequest || ({} as LeaveRequest);
  }

  /**
   * Reject leave request
   */
  static async rejectRequest(
    id: string,
    approverId: string,
    approverName: string,
    comments: string
  ): Promise<LeaveRequest> {
    const response = await APIClient.post<{ request?: LeaveRequest; leaveRequest?: LeaveRequest }>(
      `/leave/${id}/reject`,
      { approverId, approverName, comments }
    );
    return response.request || response.leaveRequest || ({} as LeaveRequest);
  }

  /**
   * Cancel leave request
   */
  static async cancelRequest(
    id: string,
    cancelledBy: string,
    reason: string
  ): Promise<LeaveRequest> {
    const response = await APIClient.post<{ request?: LeaveRequest; leaveRequest?: LeaveRequest }>(
      `/leave/${id}/cancel`,
      { cancelledBy, reason }
    );
    return response.request || response.leaveRequest || ({} as LeaveRequest);
  }
}

// ============================================================================
// HOLIDAY SERVICE
// ============================================================================

export class HolidayService {
  /**
   * Get holidays (optionally filtered by year)
   */
  static async getHolidays(year?: number): Promise<Holiday[]> {
    try {
      const url = year ? `/leave/holidays?year=${year}` : '/leave/holidays';
      const response = await APIClient.get<unknown>(url);
      return APIClient.unwrapList<Holiday>(response, 'holidays');
    } catch (error: any) {
      return [];
    }
  }

  /**
   * Create holiday
   */
  static async createHoliday(holiday: Holiday): Promise<Holiday> {
    const response = await APIClient.post<{ holiday?: Holiday }>('/leave/holidays', holiday);
    return response.holiday || holiday;
  }

  /**
   * Update holiday
   */
  static async updateHoliday(id: string, updates: Partial<Holiday>): Promise<Holiday> {
    const response = await APIClient.put<{ holiday?: Holiday }>(`/leave/holidays/${id}`, updates);
    return response.holiday || ({ ...updates, id } as Holiday);
  }

  /**
   * Delete holiday
   */
  static async deleteHoliday(id: string): Promise<void> {
    await APIClient.delete(`/leave/holidays/${id}`);
  }
}

// ============================================================================
// ENCASHMENT SERVICE
// ============================================================================

export class EncashmentService {
  /**
   * Get encashment requests
   */
  static async getEncashments(employeeId?: string): Promise<LeaveEncashment[]> {
    try {
      const url = employeeId ? `/leave/encashment?employeeId=${employeeId}` : '/leave/encashment';
      const response = await APIClient.get<unknown>(url);
      return APIClient.unwrapList<LeaveEncashment>(response, 'encashments');
    } catch (error: any) {
      return [];
    }
  }

  /**
   * Create encashment request
   */
  static async createEncashment(encashment: LeaveEncashment): Promise<LeaveEncashment> {
    const response = await APIClient.post<{
      encashment?: LeaveEncashment;
      leaveEncashment?: LeaveEncashment;
    }>('/leave/encashment', encashment);
    return response.encashment || response.leaveEncashment || encashment;
  }

  /**
   * Update encashment status
   */
  static async updateEncashmentStatus(
    id: string,
    status: LeaveEncashment['status'],
    approvedBy?: string
  ): Promise<LeaveEncashment> {
    const response = await APIClient.put<{
      encashment?: LeaveEncashment;
      leaveEncashment?: LeaveEncashment;
    }>(`/leave/encashment/${id}/status`, { status, approvedBy });
    return response.encashment || response.leaveEncashment || ({} as LeaveEncashment);
  }
}

// ============================================================================
// COMP-OFF SERVICE
// ============================================================================

export class CompOffService {
  /**
   * Get comp-offs
   */
  static async getCompOffs(employeeId?: string): Promise<CompOff[]> {
    try {
      const url = employeeId ? `/leave/comp-off?employeeId=${employeeId}` : '/leave/comp-off';
      const response = await APIClient.get<unknown>(url);
      return APIClient.unwrapList<CompOff>(response, 'compOffs');
    } catch (error: any) {
      return [];
    }
  }

  /**
   * Create comp-off request
   */
  static async createCompOff(compOff: CompOff): Promise<CompOff> {
    const response = await APIClient.post<{ compOff?: CompOff; compOffRequest?: CompOff }>(
      '/leave/comp-off',
      compOff
    );
    return response.compOff || response.compOffRequest || compOff;
  }

  /**
   * Update comp-off status
   */
  static async updateCompOffStatus(
    id: string,
    status: CompOff['status'],
    approvedBy?: string
  ): Promise<CompOff> {
    const response = await APIClient.put<{ compOff?: CompOff; compOffRequest?: CompOff }>(
      `/leave/comp-off/${id}/status`,
      { status, approvedBy }
    );
    return response.compOff || response.compOffRequest || ({} as CompOff);
  }
}

// ============================================================================
// CARRY FORWARD SERVICE
// ============================================================================

export class CarryForwardService {
  /**
   * Get carry forward records
   */
  static async getCarryForwards(employeeId?: string): Promise<CarryForward[]> {
    try {
      const url = employeeId
        ? `/leave/carry-forward?employeeId=${employeeId}`
        : '/leave/carry-forward';
      const response = await APIClient.get<unknown>(url);
      return APIClient.unwrapList<CarryForward>(response, 'carryForwards');
    } catch (error: any) {
      return [];
    }
  }

  /**
   * Process carry forward (year-end)
   */
  static async processCarryForward(carryForward: CarryForward): Promise<CarryForward> {
    const response = await APIClient.post<{ carryForward?: CarryForward; record?: CarryForward }>(
      '/leave/carry-forward',
      carryForward
    );
    return response.carryForward || response.record || carryForward;
  }
}

// ============================================================================
// SETTINGS SERVICE
// ============================================================================

export class LeaveSettingsService {
  /**
   * Get leave settings
   */
  static async getSettings(): Promise<LeaveSettings | null> {
    try {
      const response = await APIClient.get<unknown>('/leave/settings');
      return APIClient.unwrapItem<LeaveSettings>(response, 'settings');
    } catch (error: any) {
      return null;
    }
  }

  /**
   * Update leave settings
   */
  static async updateSettings(settings: LeaveSettings): Promise<LeaveSettings> {
    const response = await APIClient.put<{
      settings?: LeaveSettings;
      leaveSettings?: LeaveSettings;
    }>('/leave/settings', settings);
    return response.settings || response.leaveSettings || settings;
  }
}

// ============================================================================
// ANALYTICS SERVICE
// ============================================================================

export class LeaveAnalyticsService {
  /**
   * Get leave statistics
   */
  static async getStats(): Promise<LeaveStats> {
    try {
      const response = await APIClient.get<{ stats?: LeaveStats; analytics?: LeaveStats }>(
        '/leave/reports'
      );

      // If API returns full stats, use them
      if (response.stats || response.analytics) {
        return response.stats || response.analytics!;
      }

      // Fallback: Calculate stats from API data (same as before but using API)
      const requests = await LeaveRequestService.getRequests();
      const balances = await LeaveBalanceService.getBalances();

      const today = new Date().toISOString().split('T')[0];
      const onLeaveToday = requests.filter(
        (r) => r.status === 'approved' && r.fromDate <= today && r.toDate >= today
      ).length;

      const stats: LeaveStats = {
        totalEmployees: balances.length,
        onLeaveToday,
        pendingRequests: requests.filter((r) => r.status.includes('pending')).length,
        upcomingLeaves: requests.filter((r) => r.status === 'approved' && r.fromDate > today)
          .length,
        leaveTypeUsage: [],
        departmentLeaveUsage: [],
        monthlyLeaveTrend: [],
        averageLeaveBalance:
          balances.reduce((sum, b) => sum + b.availableBalance, 0) / (balances.length || 1),
        totalAccruedDays: balances.reduce((sum, b) => sum + b.accrued, 0),
        totalAvailedDays: balances.reduce((sum, b) => sum + b.availed, 0),
        totalLapsedDays: balances.reduce((sum, b) => sum + b.lapsed, 0),
      };

      return stats;
    } catch (error: any) {
      // Return empty stats on error
      return {
        totalEmployees: 0,
        onLeaveToday: 0,
        pendingRequests: 0,
        upcomingLeaves: 0,
        leaveTypeUsage: [],
        departmentLeaveUsage: [],
        monthlyLeaveTrend: [],
        averageLeaveBalance: 0,
        totalAccruedDays: 0,
        totalAvailedDays: 0,
        totalLapsedDays: 0,
      };
    }
  }
}
