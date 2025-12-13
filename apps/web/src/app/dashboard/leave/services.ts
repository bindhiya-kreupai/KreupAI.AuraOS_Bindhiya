/**
 * Leave Management Service Layer
 * Production-ready service layer with localStorage persistence and API-ready structure
 */

import {
    LeaveType,
    LeavePolicy,
    LeaveBalance,
    LeaveRequest,
    Holiday,
    HolidayCalendar,
    LeaveEncashment,
    CompOff,
    CarryForward,
    LeaveStats,
    LeaveSettings,
} from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

const API_BASE = '/api/leave'; // TODO: Replace with actual API endpoint
const STORAGE_KEYS = {
    LEAVE_TYPES: 'leave_types',
    LEAVE_POLICIES: 'leave_policies',
    LEAVE_BALANCES: 'leave_balances',
    LEAVE_REQUESTS: 'leave_requests',
    HOLIDAYS: 'holidays',
    HOLIDAY_CALENDARS: 'holiday_calendars',
    ENCASHMENTS: 'leave_encashments',
    COMP_OFFS: 'comp_offs',
    CARRY_FORWARDS: 'carry_forwards',
    SETTINGS: 'leave_settings',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// STORAGE SERVICE
// ============================================================================

class StorageService {
    static save<T>(key: string, data: T): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(key, JSON.stringify(data));
    }

    static load<T>(key: string): T | null {
        if (typeof window === 'undefined') return null;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    static remove(key: string): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(key);
    }
}

// ============================================================================
// LEAVE TYPES SERVICE
// ============================================================================

export class LeaveTypeService {
    /**
     * Get all leave types
     */
    static async getLeaveTypes(): Promise<LeaveType[]> {
        await delay(300);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/types`);
        // return response.json();

        const stored = StorageService.load<LeaveType[]>(STORAGE_KEYS.LEAVE_TYPES);
        return stored || [];
    }

    /**
     * Get single leave type
     */
    static async getLeaveType(id: string): Promise<LeaveType | null> {
        await delay(200);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/types/${id}`);
        // return response.json();

        const types = await this.getLeaveTypes();
        return types.find(type => type.id === id) || null;
    }

    /**
     * Create leave type
     */
    static async createLeaveType(leaveType: LeaveType): Promise<LeaveType> {
        await delay(300);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/types`, {
        //     method: 'POST',
        //     body: JSON.stringify(leaveType),
        // });
        // return response.json();

        const types = await this.getLeaveTypes();
        types.unshift(leaveType);
        StorageService.save(STORAGE_KEYS.LEAVE_TYPES, types);
        return leaveType;
    }

    /**
     * Update leave type
     */
    static async updateLeaveType(id: string, updates: Partial<LeaveType>): Promise<LeaveType> {
        await delay(300);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/types/${id}`, {
        //     method: 'PUT',
        //     body: JSON.stringify(updates),
        // });
        // return response.json();

        const types = await this.getLeaveTypes();
        const index = types.findIndex(type => type.id === id);
        if (index === -1) throw new Error('Leave type not found');

        types[index] = { ...types[index], ...updates, updatedAt: new Date().toISOString() };
        StorageService.save(STORAGE_KEYS.LEAVE_TYPES, types);
        return types[index];
    }

    /**
     * Delete leave type
     */
    static async deleteLeaveType(id: string): Promise<void> {
        await delay(200);
        // TODO: Replace with real API call
        // await fetch(`${API_BASE}/types/${id}`, { method: 'DELETE' });

        const types = await this.getLeaveTypes();
        const filtered = types.filter(type => type.id !== id);
        StorageService.save(STORAGE_KEYS.LEAVE_TYPES, filtered);
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
        await delay(300);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/policies`);
        // return response.json();

        const stored = StorageService.load<LeavePolicy[]>(STORAGE_KEYS.LEAVE_POLICIES);
        return stored || [];
    }

    /**
     * Create leave policy
     */
    static async createPolicy(policy: LeavePolicy): Promise<LeavePolicy> {
        await delay(300);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/policies`, {
        //     method: 'POST',
        //     body: JSON.stringify(policy),
        // });
        // return response.json();

        const policies = await this.getPolicies();
        policies.unshift(policy);
        StorageService.save(STORAGE_KEYS.LEAVE_POLICIES, policies);
        return policy;
    }

    /**
     * Update leave policy
     */
    static async updatePolicy(id: string, updates: Partial<LeavePolicy>): Promise<LeavePolicy> {
        await delay(300);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/policies/${id}`, {
        //     method: 'PUT',
        //     body: JSON.stringify(updates),
        // });
        // return response.json();

        const policies = await this.getPolicies();
        const index = policies.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Policy not found');

        policies[index] = { ...policies[index], ...updates, updatedAt: new Date().toISOString() };
        StorageService.save(STORAGE_KEYS.LEAVE_POLICIES, policies);
        return policies[index];
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
        await delay(300);
        // TODO: Replace with real API call
        // const url = employeeId ? `${API_BASE}/balances?employeeId=${employeeId}` : `${API_BASE}/balances`;
        // const response = await fetch(url);
        // return response.json();

        const stored = StorageService.load<LeaveBalance[]>(STORAGE_KEYS.LEAVE_BALANCES) || [];
        return employeeId ? stored.filter(b => b.employeeId === employeeId) : stored;
    }

    /**
     * Get employee balance for specific leave type
     */
    static async getBalance(employeeId: string, leaveTypeId: string): Promise<LeaveBalance | null> {
        await delay(200);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/balances/${employeeId}/${leaveTypeId}`);
        // return response.json();

        const balances = await this.getBalances(employeeId);
        return balances.find(b => b.leaveTypeId === leaveTypeId) || null;
    }

    /**
     * Update leave balance (manual adjustment)
     */
    static async updateBalance(id: string, updates: Partial<LeaveBalance>): Promise<LeaveBalance> {
        await delay(300);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/balances/${id}`, {
        //     method: 'PUT',
        //     body: JSON.stringify(updates),
        // });
        // return response.json();

        const balances = await this.getBalances();
        const index = balances.findIndex(b => b.id === id);
        if (index === -1) throw new Error('Balance not found');

        balances[index] = { ...balances[index], ...updates, updatedAt: new Date().toISOString() };
        StorageService.save(STORAGE_KEYS.LEAVE_BALANCES, balances);
        return balances[index];
    }

    /**
     * Process leave accrual (monthly/anniversary)
     */
    static async processAccrual(employeeId: string, leaveTypeId: string, accrualDays: number): Promise<LeaveBalance> {
        await delay(500);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/balances/accrual`, {
        //     method: 'POST',
        //     body: JSON.stringify({ employeeId, leaveTypeId, accrualDays }),
        // });
        // return response.json();

        const balance = await this.getBalance(employeeId, leaveTypeId);
        if (!balance) throw new Error('Balance not found');

        return this.updateBalance(balance.id, {
            accrued: balance.accrued + accrualDays,
            availableBalance: balance.availableBalance + accrualDays,
            lastAccrualDate: new Date().toISOString(),
        });
    }
}

// ============================================================================
// LEAVE REQUEST SERVICE
// ============================================================================

export class LeaveRequestService {
    /**
     * Get leave requests (optionally filtered by employee or status)
     */
    static async getRequests(filters?: { employeeId?: string; status?: string }): Promise<LeaveRequest[]> {
        await delay(300);
        // TODO: Replace with real API call
        // const params = new URLSearchParams(filters);
        // const response = await fetch(`${API_BASE}/requests?${params}`);
        // return response.json();

        let stored = StorageService.load<LeaveRequest[]>(STORAGE_KEYS.LEAVE_REQUESTS) || [];

        if (filters?.employeeId) {
            stored = stored.filter(r => r.employeeId === filters.employeeId);
        }
        if (filters?.status) {
            stored = stored.filter(r => r.status === filters.status);
        }

        return stored;
    }

    /**
     * Get single leave request
     */
    static async getRequest(id: string): Promise<LeaveRequest | null> {
        await delay(200);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/requests/${id}`);
        // return response.json();

        const requests = await this.getRequests();
        return requests.find(r => r.id === id) || null;
    }

    /**
     * Create leave request
     */
    static async createRequest(request: LeaveRequest): Promise<LeaveRequest> {
        await delay(300);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/requests`, {
        //     method: 'POST',
        //     body: JSON.stringify(request),
        // });
        // return response.json();

        const requests = await this.getRequests();
        requests.unshift(request);
        StorageService.save(STORAGE_KEYS.LEAVE_REQUESTS, requests);
        return request;
    }

    /**
     * Update leave request
     */
    static async updateRequest(id: string, updates: Partial<LeaveRequest>): Promise<LeaveRequest> {
        await delay(300);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/requests/${id}`, {
        //     method: 'PUT',
        //     body: JSON.stringify(updates),
        // });
        // return response.json();

        const requests = await this.getRequests();
        const index = requests.findIndex(r => r.id === id);
        if (index === -1) throw new Error('Request not found');

        requests[index] = { ...requests[index], ...updates, updatedAt: new Date().toISOString() };
        StorageService.save(STORAGE_KEYS.LEAVE_REQUESTS, requests);
        return requests[index];
    }

    /**
     * Approve leave request
     */
    static async approveRequest(id: string, approverId: string, approverName: string, comments?: string): Promise<LeaveRequest> {
        await delay(500);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/requests/${id}/approve`, {
        //     method: 'POST',
        //     body: JSON.stringify({ approverId, approverName, comments }),
        // });
        // return response.json();

        const request = await this.getRequest(id);
        if (!request) throw new Error('Request not found');

        // Update approval
        const updatedApprovals = request.approvals.map(approval =>
            approval.status === 'pending'
                ? { ...approval, status: 'approved' as const, approverId, approverName, comments, actionDate: new Date().toISOString() }
                : approval
        );

        // Check if all approvals are done
        const allApproved = updatedApprovals.every(a => a.status === 'approved');

        return this.updateRequest(id, {
            approvals: updatedApprovals,
            status: allApproved ? 'approved' : 'pending_hr_approval',
        });
    }

    /**
     * Reject leave request
     */
    static async rejectRequest(id: string, approverId: string, approverName: string, comments: string): Promise<LeaveRequest> {
        await delay(500);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/requests/${id}/reject`, {
        //     method: 'POST',
        //     body: JSON.stringify({ approverId, approverName, comments }),
        // });
        // return response.json();

        return this.updateRequest(id, {
            status: 'rejected',
            approvals: [{
                id: 'rejection',
                approverRole: 'manager',
                approverId,
                approverName,
                status: 'rejected',
                comments,
                actionDate: new Date().toISOString(),
                level: 1,
            }],
        });
    }

    /**
     * Cancel leave request
     */
    static async cancelRequest(id: string, cancelledBy: string, reason: string): Promise<LeaveRequest> {
        await delay(300);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/requests/${id}/cancel`, {
        //     method: 'POST',
        //     body: JSON.stringify({ cancelledBy, reason }),
        // });
        // return response.json();

        return this.updateRequest(id, {
            status: 'cancelled',
            cancelledBy,
            cancelledAt: new Date().toISOString(),
            cancellationReason: reason,
        });
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
        await delay(300);
        // TODO: Replace with real API call
        // const url = year ? `${API_BASE}/holidays?year=${year}` : `${API_BASE}/holidays`;
        // const response = await fetch(url);
        // return response.json();

        let stored = StorageService.load<Holiday[]>(STORAGE_KEYS.HOLIDAYS) || [];
        return year ? stored.filter(h => h.year === year) : stored;
    }

    /**
     * Create holiday
     */
    static async createHoliday(holiday: Holiday): Promise<Holiday> {
        await delay(300);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/holidays`, {
        //     method: 'POST',
        //     body: JSON.stringify(holiday),
        // });
        // return response.json();

        const holidays = await this.getHolidays();
        holidays.unshift(holiday);
        StorageService.save(STORAGE_KEYS.HOLIDAYS, holidays);
        return holiday;
    }

    /**
     * Update holiday
     */
    static async updateHoliday(id: string, updates: Partial<Holiday>): Promise<Holiday> {
        await delay(300);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/holidays/${id}`, {
        //     method: 'PUT',
        //     body: JSON.stringify(updates),
        // });
        // return response.json();

        const holidays = await this.getHolidays();
        const index = holidays.findIndex(h => h.id === id);
        if (index === -1) throw new Error('Holiday not found');

        holidays[index] = { ...holidays[index], ...updates, updatedAt: new Date().toISOString() };
        StorageService.save(STORAGE_KEYS.HOLIDAYS, holidays);
        return holidays[index];
    }

    /**
     * Delete holiday
     */
    static async deleteHoliday(id: string): Promise<void> {
        await delay(200);
        // TODO: Replace with real API call
        // await fetch(`${API_BASE}/holidays/${id}`, { method: 'DELETE' });

        const holidays = await this.getHolidays();
        const filtered = holidays.filter(h => h.id !== id);
        StorageService.save(STORAGE_KEYS.HOLIDAYS, filtered);
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
        await delay(300);
        // TODO: Replace with real API call
        // const url = employeeId ? `${API_BASE}/encashments?employeeId=${employeeId}` : `${API_BASE}/encashments`;
        // const response = await fetch(url);
        // return response.json();

        const stored = StorageService.load<LeaveEncashment[]>(STORAGE_KEYS.ENCASHMENTS) || [];
        return employeeId ? stored.filter(e => e.employeeId === employeeId) : stored;
    }

    /**
     * Create encashment request
     */
    static async createEncashment(encashment: LeaveEncashment): Promise<LeaveEncashment> {
        await delay(300);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/encashments`, {
        //     method: 'POST',
        //     body: JSON.stringify(encashment),
        // });
        // return response.json();

        const encashments = await this.getEncashments();
        encashments.unshift(encashment);
        StorageService.save(STORAGE_KEYS.ENCASHMENTS, encashments);
        return encashment;
    }

    /**
     * Update encashment status
     */
    static async updateEncashmentStatus(id: string, status: LeaveEncashment['status'], approvedBy?: string): Promise<LeaveEncashment> {
        await delay(300);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/encashments/${id}/status`, {
        //     method: 'PUT',
        //     body: JSON.stringify({ status, approvedBy }),
        // });
        // return response.json();

        const encashments = await this.getEncashments();
        const index = encashments.findIndex(e => e.id === id);
        if (index === -1) throw new Error('Encashment not found');

        encashments[index] = {
            ...encashments[index],
            status,
            approvedBy,
            approvedDate: status === 'approved' ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString(),
        };

        StorageService.save(STORAGE_KEYS.ENCASHMENTS, encashments);
        return encashments[index];
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
        await delay(300);
        // TODO: Replace with real API call
        // const url = employeeId ? `${API_BASE}/comp-offs?employeeId=${employeeId}` : `${API_BASE}/comp-offs`;
        // const response = await fetch(url);
        // return response.json();

        const stored = StorageService.load<CompOff[]>(STORAGE_KEYS.COMP_OFFS) || [];
        return employeeId ? stored.filter(c => c.employeeId === employeeId) : stored;
    }

    /**
     * Create comp-off request
     */
    static async createCompOff(compOff: CompOff): Promise<CompOff> {
        await delay(300);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/comp-offs`, {
        //     method: 'POST',
        //     body: JSON.stringify(compOff),
        // });
        // return response.json();

        const compOffs = await this.getCompOffs();
        compOffs.unshift(compOff);
        StorageService.save(STORAGE_KEYS.COMP_OFFS, compOffs);
        return compOff;
    }

    /**
     * Update comp-off status
     */
    static async updateCompOffStatus(id: string, status: CompOff['status'], approvedBy?: string): Promise<CompOff> {
        await delay(300);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/comp-offs/${id}/status`, {
        //     method: 'PUT',
        //     body: JSON.stringify({ status, approvedBy }),
        // });
        // return response.json();

        const compOffs = await this.getCompOffs();
        const index = compOffs.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Comp-off not found');

        compOffs[index] = {
            ...compOffs[index],
            status,
            approvedBy,
            approvedDate: status === 'approved' ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString(),
        };

        StorageService.save(STORAGE_KEYS.COMP_OFFS, compOffs);
        return compOffs[index];
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
        await delay(300);
        // TODO: Replace with real API call
        // const url = employeeId ? `${API_BASE}/carry-forwards?employeeId=${employeeId}` : `${API_BASE}/carry-forwards`;
        // const response = await fetch(url);
        // return response.json();

        const stored = StorageService.load<CarryForward[]>(STORAGE_KEYS.CARRY_FORWARDS) || [];
        return employeeId ? stored.filter(c => c.employeeId === employeeId) : stored;
    }

    /**
     * Process carry forward (year-end)
     */
    static async processCarryForward(carryForward: CarryForward): Promise<CarryForward> {
        await delay(500);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/carry-forwards/process`, {
        //     method: 'POST',
        //     body: JSON.stringify(carryForward),
        // });
        // return response.json();

        const carryForwards = await this.getCarryForwards();
        carryForwards.unshift(carryForward);
        StorageService.save(STORAGE_KEYS.CARRY_FORWARDS, carryForwards);
        return carryForward;
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
        await delay(200);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/settings`);
        // return response.json();

        return StorageService.load<LeaveSettings>(STORAGE_KEYS.SETTINGS);
    }

    /**
     * Update leave settings
     */
    static async updateSettings(settings: LeaveSettings): Promise<LeaveSettings> {
        await delay(300);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/settings`, {
        //     method: 'PUT',
        //     body: JSON.stringify(settings),
        // });
        // return response.json();

        StorageService.save(STORAGE_KEYS.SETTINGS, settings);
        return settings;
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
        await delay(500);
        // TODO: Replace with real API call
        // const response = await fetch(`${API_BASE}/analytics/stats`);
        // return response.json();

        // Mock stats calculation
        const requests = await LeaveRequestService.getRequests();
        const balances = await LeaveBalanceService.getBalances();

        const today = new Date().toISOString().split('T')[0];
        const onLeaveToday = requests.filter(r =>
            r.status === 'approved' &&
            r.fromDate <= today &&
            r.toDate >= today
        ).length;

        const stats: LeaveStats = {
            totalEmployees: balances.length,
            onLeaveToday,
            pendingRequests: requests.filter(r => r.status.includes('pending')).length,
            upcomingLeaves: requests.filter(r => r.status === 'approved' && r.fromDate > today).length,
            leaveTypeUsage: [],
            departmentLeaveUsage: [],
            monthlyLeaveTrend: [],
            averageLeaveBalance: balances.reduce((sum, b) => sum + b.availableBalance, 0) / (balances.length || 1),
            totalAccruedDays: balances.reduce((sum, b) => sum + b.accrued, 0),
            totalAvailedDays: balances.reduce((sum, b) => sum + b.availed, 0),
            totalLapsedDays: balances.reduce((sum, b) => sum + b.lapsed, 0),
        };

        return stats;
    }
}
