/**
 * useLeave Hook Tests - Production Ready
 * Comprehensive test coverage for leave management operations
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLeave } from './useLeave';
import type {
    LeaveType,
    LeavePolicy,
    LeaveBalance,
    LeaveRequest,
    Holiday,
    LeaveEncashment,
    CompOff,
    CarryForward,
    LeaveSettings,
} from '../types';

// ============================================================================
// MOCKS
// ============================================================================

// Mock all leave services
vi.mock('../services', () => ({
    LeaveTypeService: {
        getLeaveTypes: vi.fn(() => Promise.resolve([])),
        createLeaveType: vi.fn((data) => Promise.resolve(data)),
        updateLeaveType: vi.fn((id, data) => Promise.resolve({ id, ...data })),
        deleteLeaveType: vi.fn(() => Promise.resolve()),
    },
    LeavePolicyService: {
        getPolicies: vi.fn(() => Promise.resolve([])),
        createPolicy: vi.fn((data) => Promise.resolve(data)),
        updatePolicy: vi.fn((id, data) => Promise.resolve({ id, ...data })),
    },
    LeaveBalanceService: {
        getBalances: vi.fn(() => Promise.resolve([])),
        updateBalance: vi.fn((id, data) => Promise.resolve({ id, ...data })),
        processAccrual: vi.fn((empId, typeId, days) => Promise.resolve({ employeeId: empId, leaveTypeId: typeId, accrued: days })),
    },
    LeaveRequestService: {
        getRequests: vi.fn(() => Promise.resolve([])),
        createRequest: vi.fn((data) => Promise.resolve(data)),
        approveRequest: vi.fn((id, approverId, name, comments) => Promise.resolve({ id, status: 'approved', approverId, approverName: name })),
        rejectRequest: vi.fn((id, approverId, name, comments) => Promise.resolve({ id, status: 'rejected', approverId, approverName: name })),
        cancelRequest: vi.fn((id, cancelledBy, reason) => Promise.resolve({ id, status: 'cancelled', cancelledBy, cancelReason: reason })),
    },
    HolidayService: {
        getHolidays: vi.fn(() => Promise.resolve([])),
        createHoliday: vi.fn((data) => Promise.resolve(data)),
        updateHoliday: vi.fn((id, data) => Promise.resolve({ id, ...data })),
        deleteHoliday: vi.fn(() => Promise.resolve()),
    },
    EncashmentService: {
        getEncashments: vi.fn(() => Promise.resolve([])),
        createEncashment: vi.fn((data) => Promise.resolve(data)),
        updateEncashmentStatus: vi.fn((id, status, approvedBy) => Promise.resolve({ id, status, approvedBy })),
    },
    CompOffService: {
        getCompOffs: vi.fn(() => Promise.resolve([])),
        createCompOff: vi.fn((data) => Promise.resolve(data)),
        updateCompOffStatus: vi.fn((id, status, approvedBy) => Promise.resolve({ id, status, approvedBy })),
    },
    CarryForwardService: {
        getCarryForwards: vi.fn(() => Promise.resolve([])),
        processCarryForward: vi.fn((data) => Promise.resolve(data)),
    },
    LeaveSettingsService: {
        getSettings: vi.fn(() => Promise.resolve(null)),
        updateSettings: vi.fn((data) => Promise.resolve(data)),
    },
    LeaveAnalyticsService: {
        getStats: vi.fn(() => Promise.resolve({
            totalEmployees: 150,
            totalLeavesTaken: 450,
            pendingRequests: 25,
            mostUsedLeaveType: 'Casual Leave',
        })),
    },
}));

// Mock sample data generators
vi.mock('../data', () => ({
    generateSampleLeaveTypes: vi.fn(() => []),
    generateSamplePolicies: vi.fn(() => []),
    generateSampleBalances: vi.fn(() => []),
    generateSampleRequests: vi.fn(() => []),
    generateSampleHolidays: vi.fn(() => []),
    generateSampleCompOffs: vi.fn(() => []),
    generateSampleEncashments: vi.fn(() => []),
    generateSampleCarryForwards: vi.fn(() => []),
    generateSampleSettings: vi.fn(() => ({
        id: 'settings-001',
        accrualEnabled: true,
        carryForwardEnabled: true,
        maxCarryForwardDays: 10,
    })),
}));

// Mock useToast hook
const mockToast = {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
};

vi.mock('./useToast', () => ({
    useToast: () => mockToast,
}));

// Import services and generators for assertions
import {
    LeaveTypeService,
    LeavePolicyService,
    LeaveBalanceService,
    LeaveRequestService,
    HolidayService,
    EncashmentService,
    CompOffService,
    CarryForwardService,
    LeaveSettingsService,
    LeaveAnalyticsService,
} from '../services';

import {
    generateSampleLeaveTypes,
    generateSamplePolicies,
    generateSampleBalances,
    generateSampleRequests,
    generateSampleHolidays,
    generateSampleCompOffs,
    generateSampleEncashments,
    generateSampleCarryForwards,
    generateSampleSettings,
} from '../data';

// ============================================================================
// TEST DATA
// ============================================================================

const mockLeaveType: LeaveType = {
    id: 'lt-001',
    name: 'Casual Leave',
    code: 'CL',
    color: '#3B82F6',
    maxDays: 12,
    carryForward: true,
    encashable: false,
    requiresApproval: true,
};

const mockLeaveBalance: LeaveBalance = {
    id: 'lb-001',
    employeeId: 'emp-001',
    leaveTypeId: 'lt-001',
    allocated: 12,
    availed: 3,
    pending: 0,
    availableBalance: 9,
};

const mockLeaveRequest: LeaveRequest = {
    id: 'lr-001',
    employeeId: 'emp-001',
    employeeName: 'John Doe',
    leaveTypeId: 'lt-001',
    leaveTypeName: 'Casual Leave',
    fromDate: '2024-06-01',
    toDate: '2024-06-03',
    totalDays: 3,
    status: 'pending_l1',
    reason: 'Personal work',
    appliedOn: '2024-05-20T10:00:00Z',
};

const mockHoliday: Holiday = {
    id: 'hol-001',
    name: 'Independence Day',
    date: '2024-08-15',
    type: 'national',
    isOptional: false,
    applicableLocations: ['all'],
};

describe('useLeave', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    describe('Initialization', () => {
        it('initializes with loading state', () => {
            vi.mocked(LeaveTypeService.getLeaveTypes).mockImplementation(
                () => new Promise(() => {}) // Never resolves
            );

            const { result } = renderHook(() => useLeave());

            expect(result.current.isLoading).toBe(true);
            expect(result.current.leaveTypes).toEqual([]);
        });

        it('loads all leave data on mount', async () => {
            const mockTypes = [mockLeaveType];
            vi.mocked(LeaveTypeService.getLeaveTypes).mockResolvedValue(mockTypes);

            const { result } = renderHook(() => useLeave());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.leaveTypes).toEqual(mockTypes);
            expect(result.current.stats).toBeDefined();
        });

        it('initializes with sample data when no data exists', async () => {
            const sampleTypes = [mockLeaveType];
            vi.mocked(LeaveTypeService.getLeaveTypes).mockResolvedValue([]);
            vi.mocked(generateSampleLeaveTypes).mockReturnValue(sampleTypes);

            const { result } = renderHook(() => useLeave());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.leaveTypes).toEqual(sampleTypes);
        });

        it('handles initialization errors gracefully', async () => {
            const error = new Error('Network error');
            vi.mocked(LeaveTypeService.getLeaveTypes).mockRejectedValue(error);

            const { result } = renderHook(() => useLeave());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(mockToast.error).toHaveBeenCalledWith('Network error');
        });
    });

    // ========================================================================
    // LEAVE TYPES
    // ========================================================================

    describe('Leave Type Operations', () => {
        it('creates leave type successfully', async () => {
            vi.mocked(LeaveTypeService.getLeaveTypes).mockResolvedValue([]);

            const { result } = renderHook(() => useLeave());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await act(async () => {
                await result.current.createLeaveType(mockLeaveType);
            });

            expect(LeaveTypeService.createLeaveType).toHaveBeenCalledWith(mockLeaveType);
            expect(result.current.leaveTypes).toContainEqual(mockLeaveType);
            expect(mockToast.success).toHaveBeenCalledWith('Leave type created successfully!');
        });

        it('updates leave type successfully', async () => {
            vi.mocked(LeaveTypeService.getLeaveTypes).mockResolvedValue([mockLeaveType]);

            const { result } = renderHook(() => useLeave());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            const updates = { maxDays: 15 };

            await act(async () => {
                await result.current.updateLeaveType('lt-001', updates);
            });

            expect(LeaveTypeService.updateLeaveType).toHaveBeenCalledWith('lt-001', updates);
            expect(mockToast.success).toHaveBeenCalledWith('Leave type updated successfully!');
        });

        it('deletes leave type successfully', async () => {
            vi.mocked(LeaveTypeService.getLeaveTypes).mockResolvedValue([mockLeaveType]);

            const { result } = renderHook(() => useLeave());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await act(async () => {
                await result.current.deleteLeaveType('lt-001');
            });

            expect(LeaveTypeService.deleteLeaveType).toHaveBeenCalledWith('lt-001');
            expect(result.current.leaveTypes).not.toContainEqual(mockLeaveType);
            expect(mockToast.success).toHaveBeenCalledWith('Leave type deleted successfully!');
        });

        it('handles leave type creation error', async () => {
            const error = new Error('Creation failed');
            vi.mocked(LeaveTypeService.getLeaveTypes).mockResolvedValue([]);
            vi.mocked(LeaveTypeService.createLeaveType).mockRejectedValue(error);

            const { result } = renderHook(() => useLeave());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await expect(async () => {
                await act(async () => {
                    await result.current.createLeaveType(mockLeaveType);
                });
            }).rejects.toThrow('Creation failed');

            expect(mockToast.error).toHaveBeenCalledWith('Creation failed');
        });
    });

    // ========================================================================
    // LEAVE POLICIES
    // ========================================================================

    describe('Leave Policy Operations', () => {
        it('creates policy successfully', async () => {
            const mockPolicy: LeavePolicy = {
                id: 'pol-001',
                name: 'Standard Policy',
                leaveTypes: [mockLeaveType],
                accrualRate: 1,
                applicableToAllEmployees: true,
            };

            vi.mocked(LeavePolicyService.getPolicies).mockResolvedValue([]);

            const { result } = renderHook(() => useLeave());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await act(async () => {
                await result.current.createPolicy(mockPolicy);
            });

            expect(LeavePolicyService.createPolicy).toHaveBeenCalledWith(mockPolicy);
            expect(result.current.policies).toContainEqual(mockPolicy);
            expect(mockToast.success).toHaveBeenCalledWith('Leave policy created successfully!');
        });

        it('updates policy successfully', async () => {
            const mockPolicy = {
                id: 'pol-001',
                name: 'Standard Policy',
                accrualRate: 1,
            };

            vi.mocked(LeavePolicyService.getPolicies).mockResolvedValue([mockPolicy]);

            const { result } = renderHook(() => useLeave());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            const updates = { accrualRate: 1.5 };

            await act(async () => {
                await result.current.updatePolicy('pol-001', updates);
            });

            expect(LeavePolicyService.updatePolicy).toHaveBeenCalledWith('pol-001', updates);
            expect(mockToast.success).toHaveBeenCalledWith('Leave policy updated successfully!');
        });
    });

    // ========================================================================
    // LEAVE BALANCES
    // ========================================================================

    describe('Leave Balance Operations', () => {
        it('gets employee balances', async () => {
            const balances = [mockLeaveBalance];
            vi.mocked(LeaveBalanceService.getBalances).mockResolvedValue(balances);

            const { result } = renderHook(() => useLeave());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            let employeeBalances;
            await act(async () => {
                employeeBalances = await result.current.getEmployeeBalances('emp-001');
            });

            expect(LeaveBalanceService.getBalances).toHaveBeenCalledWith('emp-001');
            expect(employeeBalances).toEqual(balances);
        });

        it('updates balance successfully', async () => {
            vi.mocked(LeaveBalanceService.getBalances).mockResolvedValue([mockLeaveBalance]);

            const { result } = renderHook(() => useLeave());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            const updates = { availed: 5, availableBalance: 7 };

            await act(async () => {
                await result.current.updateBalance('lb-001', updates);
            });

            expect(LeaveBalanceService.updateBalance).toHaveBeenCalledWith('lb-001', updates);
            expect(mockToast.success).toHaveBeenCalledWith('Balance updated successfully!');
        });

        it('processes accrual successfully', async () => {
            vi.mocked(LeaveBalanceService.getBalances).mockResolvedValue([mockLeaveBalance]);

            const { result } = renderHook(() => useLeave());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await act(async () => {
                await result.current.processAccrual('emp-001', 'lt-001', 2);
            });

            expect(LeaveBalanceService.processAccrual).toHaveBeenCalledWith('emp-001', 'lt-001', 2);
            expect(mockToast.success).toHaveBeenCalledWith('Accrued 2 days successfully!');
        });
    });

    // ========================================================================
    // LEAVE REQUESTS
    // ========================================================================

    describe('Leave Request Operations', () => {
        it('gets employee requests', async () => {
            const requests = [mockLeaveRequest];
            vi.mocked(LeaveRequestService.getRequests).mockResolvedValue(requests);

            const { result } = renderHook(() => useLeave());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            let employeeRequests;
            await act(async () => {
                employeeRequests = await result.current.getEmployeeRequests('emp-001');
            });

            expect(LeaveRequestService.getRequests).toHaveBeenCalledWith({ employeeId: 'emp-001' });
            expect(employeeRequests).toEqual(requests);
        });

        it('gets pending requests', async () => {
            const requests = [
                { ...mockLeaveRequest, status: 'pending_l1' },
                { ...mockLeaveRequest, id: 'lr-002', status: 'approved' },
                { ...mockLeaveRequest, id: 'lr-003', status: 'pending_l2' },
            ];
            vi.mocked(LeaveRequestService.getRequests).mockResolvedValue(requests);

            const { result } = renderHook(() => useLeave());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            let pendingRequests;
            await act(async () => {
                pendingRequests = await result.current.getPendingRequests();
            });

            expect(pendingRequests).toHaveLength(2);
            expect(pendingRequests?.every(r => r.status.includes('pending'))).toBe(true);
        });

        it('creates request successfully', async () => {
            vi.mocked(LeaveRequestService.getRequests).mockResolvedValue([]);

            const { result } = renderHook(() => useLeave());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await act(async () => {
                await result.current.createRequest(mockLeaveRequest);
            });

            expect(LeaveRequestService.createRequest).toHaveBeenCalledWith(mockLeaveRequest);
            expect(result.current.requests).toContainEqual(mockLeaveRequest);
            expect(mockToast.success).toHaveBeenCalledWith('Leave request submitted successfully!');
        });

        it('approves request successfully', async () => {
            const requestWithBalance = { ...mockLeaveRequest, status: 'approved' as const };
            vi.mocked(LeaveRequestService.getRequests).mockResolvedValue([mockLeaveRequest]);
            vi.mocked(LeaveBalanceService.getBalances).mockResolvedValue([mockLeaveBalance]);
            vi.mocked(LeaveRequestService.approveRequest).mockResolvedValue(requestWithBalance);

            const { result } = renderHook(() => useLeave());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await act(async () => {
                await result.current.approveRequest('lr-001', 'mgr-001', 'Manager Name', 'Approved');
            });

            expect(LeaveRequestService.approveRequest).toHaveBeenCalledWith('lr-001', 'mgr-001', 'Manager Name', 'Approved');
            expect(mockToast.success).toHaveBeenCalledWith('Leave request approved successfully!');
        });

        it('rejects request successfully', async () => {
            const rejectedRequest = { ...mockLeaveRequest, status: 'rejected' as const };
            vi.mocked(LeaveRequestService.getRequests).mockResolvedValue([mockLeaveRequest]);
            vi.mocked(LeaveBalanceService.getBalances).mockResolvedValue([mockLeaveBalance]);
            vi.mocked(LeaveRequestService.rejectRequest).mockResolvedValue(rejectedRequest);

            const { result } = renderHook(() => useLeave());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await act(async () => {
                await result.current.rejectRequest('lr-001', 'mgr-001', 'Manager Name', 'Not enough coverage');
            });

            expect(LeaveRequestService.rejectRequest).toHaveBeenCalledWith('lr-001', 'mgr-001', 'Manager Name', 'Not enough coverage');
            expect(mockToast.success).toHaveBeenCalledWith('Leave request rejected');
        });

        it('cancels request successfully', async () => {
            const cancelledRequest = { ...mockLeaveRequest, status: 'cancelled' as const };
            vi.mocked(LeaveRequestService.cancelRequest).mockResolvedValue(cancelledRequest);

            const { result } = renderHook(() => useLeave());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await act(async () => {
                await result.current.cancelRequest('lr-001', 'emp-001', 'Plans changed');
            });

            expect(LeaveRequestService.cancelRequest).toHaveBeenCalledWith('lr-001', 'emp-001', 'Plans changed');
            expect(mockToast.success).toHaveBeenCalledWith('Leave request cancelled');
        });
    });

    // ========================================================================
    // HOLIDAYS
    // ========================================================================

    describe('Holiday Operations', () => {
        it('creates holiday successfully', async () => {
            vi.mocked(HolidayService.getHolidays).mockResolvedValue([]);

            const { result } = renderHook(() => useLeave());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await act(async () => {
                await result.current.createHoliday(mockHoliday);
            });

            expect(HolidayService.createHoliday).toHaveBeenCalledWith(mockHoliday);
            expect(result.current.holidays).toContainEqual(mockHoliday);
            expect(mockToast.success).toHaveBeenCalledWith('Holiday created successfully!');
        });

        it('updates holiday successfully', async () => {
            vi.mocked(HolidayService.getHolidays).mockResolvedValue([mockHoliday]);

            const { result } = renderHook(() => useLeave());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            const updates = { isOptional: true };

            await act(async () => {
                await result.current.updateHoliday('hol-001', updates);
            });

            expect(HolidayService.updateHoliday).toHaveBeenCalledWith('hol-001', updates);
            expect(mockToast.success).toHaveBeenCalledWith('Holiday updated successfully!');
        });

        it('deletes holiday successfully', async () => {
            vi.mocked(HolidayService.getHolidays).mockResolvedValue([mockHoliday]);

            const { result } = renderHook(() => useLeave());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await act(async () => {
                await result.current.deleteHoliday('hol-001');
            });

            expect(HolidayService.deleteHoliday).toHaveBeenCalledWith('hol-001');
            expect(result.current.holidays).not.toContainEqual(mockHoliday);
            expect(mockToast.success).toHaveBeenCalledWith('Holiday deleted successfully!');
        });
    });

    // ========================================================================
    // ENCASHMENTS
    // ========================================================================

    describe('Encashment Operations', () => {
        it('creates encashment successfully', async () => {
            const mockEncashment: LeaveEncashment = {
                id: 'enc-001',
                employeeId: 'emp-001',
                leaveTypeId: 'lt-001',
                days: 5,
                amount: 15000,
                status: 'pending',
                requestedOn: '2024-05-20T10:00:00Z',
            };

            vi.mocked(EncashmentService.getEncashments).mockResolvedValue([]);

            const { result } = renderHook(() => useLeave());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await act(async () => {
                await result.current.createEncashment(mockEncashment);
            });

            expect(EncashmentService.createEncashment).toHaveBeenCalledWith(mockEncashment);
            expect(result.current.encashments).toContainEqual(mockEncashment);
            expect(mockToast.success).toHaveBeenCalledWith('Encashment request submitted successfully!');
        });

        it('updates encashment status successfully', async () => {
            const mockEncashment = {
                id: 'enc-001',
                status: 'pending',
            };

            vi.mocked(EncashmentService.getEncashments).mockResolvedValue([mockEncashment]);

            const { result } = renderHook(() => useLeave());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await act(async () => {
                await result.current.updateEncashmentStatus('enc-001', 'approved', 'admin-001');
            });

            expect(EncashmentService.updateEncashmentStatus).toHaveBeenCalledWith('enc-001', 'approved', 'admin-001');
            expect(mockToast.success).toHaveBeenCalledWith('Encashment approved successfully!');
        });
    });

    // ========================================================================
    // COMP-OFFS
    // ========================================================================

    describe('Comp-Off Operations', () => {
        it('creates comp-off successfully', async () => {
            const mockCompOff: CompOff = {
                id: 'co-001',
                employeeId: 'emp-001',
                workedOn: '2024-05-19',
                reason: 'Weekend work for project deadline',
                status: 'pending',
                requestedOn: '2024-05-20T10:00:00Z',
            };

            vi.mocked(CompOffService.getCompOffs).mockResolvedValue([]);

            const { result } = renderHook(() => useLeave());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await act(async () => {
                await result.current.createCompOff(mockCompOff);
            });

            expect(CompOffService.createCompOff).toHaveBeenCalledWith(mockCompOff);
            expect(result.current.compOffs).toContainEqual(mockCompOff);
            expect(mockToast.success).toHaveBeenCalledWith('Comp-off request submitted successfully!');
        });

        it('updates comp-off status successfully', async () => {
            const mockCompOff = { id: 'co-001', status: 'pending' };

            vi.mocked(CompOffService.getCompOffs).mockResolvedValue([mockCompOff]);

            const { result } = renderHook(() => useLeave());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await act(async () => {
                await result.current.updateCompOffStatus('co-001', 'approved', 'mgr-001');
            });

            expect(CompOffService.updateCompOffStatus).toHaveBeenCalledWith('co-001', 'approved', 'mgr-001');
            expect(mockToast.success).toHaveBeenCalledWith('Comp-off approved successfully!');
        });
    });

    // ========================================================================
    // CARRY FORWARD
    // ========================================================================

    describe('Carry Forward Operations', () => {
        it('processes carry forward successfully', async () => {
            const mockCarryForward: CarryForward = {
                id: 'cf-001',
                employeeId: 'emp-001',
                leaveTypeId: 'lt-001',
                fromYear: 2023,
                toYear: 2024,
                eligibleDays: 10,
                carriedDays: 8,
                processedOn: '2024-01-01T10:00:00Z',
            };

            vi.mocked(CarryForwardService.getCarryForwards).mockResolvedValue([]);

            const { result } = renderHook(() => useLeave());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await act(async () => {
                await result.current.processCarryForward(mockCarryForward);
            });

            expect(CarryForwardService.processCarryForward).toHaveBeenCalledWith(mockCarryForward);
            expect(result.current.carryForwards).toContainEqual(mockCarryForward);
            expect(mockToast.success).toHaveBeenCalledWith('Carry forward processed successfully!');
        });
    });

    // ========================================================================
    // SETTINGS
    // ========================================================================

    describe('Settings Operations', () => {
        it('updates settings successfully', async () => {
            const newSettings: LeaveSettings = {
                id: 'settings-001',
                accrualEnabled: true,
                carryForwardEnabled: true,
                maxCarryForwardDays: 15,
            };

            vi.mocked(LeaveSettingsService.updateSettings).mockResolvedValue(newSettings);

            const { result } = renderHook(() => useLeave());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await act(async () => {
                await result.current.updateSettings(newSettings);
            });

            expect(LeaveSettingsService.updateSettings).toHaveBeenCalledWith(newSettings);
            expect(result.current.settings).toEqual(newSettings);
            expect(mockToast.success).toHaveBeenCalledWith('Leave settings updated successfully!');
        });
    });

    // ========================================================================
    // ANALYTICS
    // ========================================================================

    describe('Analytics Operations', () => {
        it('refreshes statistics successfully', async () => {
            const mockStats = {
                totalEmployees: 150,
                totalLeavesTaken: 450,
                pendingRequests: 25,
                mostUsedLeaveType: 'Casual Leave',
            };

            vi.mocked(LeaveAnalyticsService.getStats).mockResolvedValue(mockStats);

            const { result } = renderHook(() => useLeave());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            let stats;
            await act(async () => {
                stats = await result.current.refreshStats();
            });

            expect(LeaveAnalyticsService.getStats).toHaveBeenCalled();
            expect(stats).toEqual(mockStats);
            expect(result.current.stats).toEqual(mockStats);
        });

        it('handles stats refresh error gracefully', async () => {
            const error = new Error('Stats fetch failed');
            vi.mocked(LeaveAnalyticsService.getStats).mockRejectedValueOnce(error);

            const { result } = renderHook(() => useLeave());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            let stats;
            await act(async () => {
                stats = await result.current.refreshStats();
            });

            expect(stats).toBeNull();
            expect(mockToast.error).toHaveBeenCalledWith('Stats fetch failed');
        });
    });

    // ========================================================================
    // LOADING STATES
    // ========================================================================

    describe('Loading States', () => {
        it('sets isSaving to true during save operations', async () => {
            let resolveSave: (value: any) => void;
            const savePromise = new Promise((resolve) => {
                resolveSave = resolve;
            });

            vi.mocked(LeaveTypeService.getLeaveTypes).mockResolvedValue([]);
            vi.mocked(LeaveTypeService.createLeaveType).mockReturnValue(savePromise as any);

            const { result } = renderHook(() => useLeave());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            act(() => {
                result.current.createLeaveType(mockLeaveType);
            });

            expect(result.current.isSaving).toBe(true);

            await act(async () => {
                resolveSave!(undefined);
                await savePromise;
            });

            expect(result.current.isSaving).toBe(false);
        });

        it('resets isSaving after error', async () => {
            const error = new Error('Save failed');
            vi.mocked(LeaveTypeService.getLeaveTypes).mockResolvedValue([]);
            vi.mocked(LeaveTypeService.createLeaveType).mockRejectedValue(error);

            const { result } = renderHook(() => useLeave());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await expect(async () => {
                await act(async () => {
                    await result.current.createLeaveType(mockLeaveType);
                });
            }).rejects.toThrow();

            expect(result.current.isSaving).toBe(false);
        });
    });

    // ========================================================================
    // EDGE CASES
    // ========================================================================

    describe('Edge Cases', () => {
        it('handles empty employee balances', async () => {
            vi.mocked(LeaveBalanceService.getBalances).mockResolvedValue([]);

            const { result } = renderHook(() => useLeave());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            let balances;
            await act(async () => {
                balances = await result.current.getEmployeeBalances('emp-001');
            });

            expect(balances).toEqual([]);
        });

        it('handles concurrent operations', async () => {
            vi.mocked(LeaveTypeService.getLeaveTypes).mockResolvedValue([]);
            vi.mocked(HolidayService.getHolidays).mockResolvedValue([]);

            const { result } = renderHook(() => useLeave());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await act(async () => {
                await Promise.all([
                    result.current.createLeaveType(mockLeaveType),
                    result.current.createHoliday(mockHoliday),
                ]);
            });

            expect(result.current.leaveTypes).toContainEqual(mockLeaveType);
            expect(result.current.holidays).toContainEqual(mockHoliday);
        });

        it('updates balance when approving request', async () => {
            const approvedRequest = { ...mockLeaveRequest, status: 'approved' as const };
            vi.mocked(LeaveRequestService.getRequests).mockResolvedValue([mockLeaveRequest]);
            vi.mocked(LeaveBalanceService.getBalances).mockResolvedValue([mockLeaveBalance]);
            vi.mocked(LeaveRequestService.approveRequest).mockResolvedValue(approvedRequest);

            const { result } = renderHook(() => useLeave());
            await waitFor(() => expect(result.current.isLoading).toBe(false));

            await act(async () => {
                await result.current.approveRequest('lr-001', 'mgr-001', 'Manager', 'Approved');
            });

            // Balance should be updated
            expect(LeaveBalanceService.updateBalance).toHaveBeenCalled();
        });
    });
});
