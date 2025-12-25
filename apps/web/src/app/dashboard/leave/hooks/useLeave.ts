/**
 * useLeave Hook - Production Ready
 * Manages all leave operations with loading states, error handling, and persistence
 */

import { useState, useEffect, useCallback } from 'react';
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
    LeaveStats,
} from '../types';
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
import { useToast } from './useToast';

export const useLeave = () => {
    // ========================================================================
    // STATE
    // ========================================================================

    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [policies, setPolicies] = useState<LeavePolicy[]>([]);
    const [balances, setBalances] = useState<LeaveBalance[]>([]);
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [encashments, setEncashments] = useState<LeaveEncashment[]>([]);
    const [compOffs, setCompOffs] = useState<CompOff[]>([]);
    const [carryForwards, setCarryForwards] = useState<CarryForward[]>([]);
    const [settings, setSettings] = useState<LeaveSettings | null>(null);
    const [stats, setStats] = useState<LeaveStats | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const toast = useToast();

    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        try {
            setIsLoading(true);

            // Load all data in parallel
            const [
                typesData,
                policiesData,
                balancesData,
                requestsData,
                holidaysData,
                encashmentsData,
                compOffsData,
                carryForwardsData,
                settingsData,
            ] = await Promise.all([
                LeaveTypeService.getLeaveTypes(),
                LeavePolicyService.getPolicies(),
                LeaveBalanceService.getBalances(),
                LeaveRequestService.getRequests(),
                HolidayService.getHolidays(),
                EncashmentService.getEncashments(),
                CompOffService.getCompOffs(),
                CarryForwardService.getCarryForwards(),
                LeaveSettingsService.getSettings(),
            ]);

            // Initialize with sample data if empty
            if (typesData.length === 0) {
                const sampleTypes = generateSampleLeaveTypes();
                setLeaveTypes(sampleTypes);
                for (const type of sampleTypes) {
                    await LeaveTypeService.createLeaveType(type);
                }
            } else {
                setLeaveTypes(typesData);
            }

            if (policiesData.length === 0) {
                const samplePolicies = generateSamplePolicies();
                setPolicies(samplePolicies);
                for (const policy of samplePolicies) {
                    await LeavePolicyService.createPolicy(policy);
                }
            } else {
                setPolicies(policiesData);
            }

            if (balancesData.length === 0) {
                const sampleBalances = generateSampleBalances();
                setBalances(sampleBalances);
                for (const balance of sampleBalances) {
                    await LeaveBalanceService.updateBalance(balance.id, balance);
                }
            } else {
                setBalances(balancesData);
            }

            if (requestsData.length === 0) {
                const sampleRequests = generateSampleRequests();
                setRequests(sampleRequests);
                for (const request of sampleRequests) {
                    await LeaveRequestService.createRequest(request);
                }
            } else {
                setRequests(requestsData);
            }

            if (holidaysData.length === 0) {
                const sampleHolidays = generateSampleHolidays();
                setHolidays(sampleHolidays);
                for (const holiday of sampleHolidays) {
                    await HolidayService.createHoliday(holiday);
                }
            } else {
                setHolidays(holidaysData);
            }

            if (encashmentsData.length === 0) {
                const sampleEncashments = generateSampleEncashments();
                setEncashments(sampleEncashments);
                for (const encashment of sampleEncashments) {
                    await EncashmentService.createEncashment(encashment);
                }
            } else {
                setEncashments(encashmentsData);
            }

            if (compOffsData.length === 0) {
                const sampleCompOffs = generateSampleCompOffs();
                setCompOffs(sampleCompOffs);
                for (const compOff of sampleCompOffs) {
                    await CompOffService.createCompOff(compOff);
                }
            } else {
                setCompOffs(compOffsData);
            }

            if (carryForwardsData.length === 0) {
                const sampleCarryForwards = generateSampleCarryForwards();
                setCarryForwards(sampleCarryForwards);
                for (const cf of sampleCarryForwards) {
                    await CarryForwardService.processCarryForward(cf);
                }
            } else {
                setCarryForwards(carryForwardsData);
            }

            if (!settingsData) {
                const sampleSettings = generateSampleSettings();
                setSettings(sampleSettings);
                await LeaveSettingsService.updateSettings(sampleSettings);
            } else {
                setSettings(settingsData);
            }

            // Load stats
            const statsData = await LeaveAnalyticsService.getStats();
            setStats(statsData);

        } catch {
            toast.error((error as Error).message || 'Failed to load leave data');
        } finally {
            setIsLoading(false);
        }
    };

    // ========================================================================
    // LEAVE TYPES
    // ========================================================================

    const createLeaveType = useCallback(async (leaveType: LeaveType) => {
        try {
            setIsSaving(true);
            await LeaveTypeService.createLeaveType(leaveType);
            setLeaveTypes(prev => [leaveType, ...prev]);
            toast.success('Leave type created successfully!');
            return leaveType;
        } catch {
            toast.error((error as Error).message || 'Failed to create leave type');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const updateLeaveType = useCallback(async (id: string, updates: Partial<LeaveType>) => {
        try {
            setIsSaving(true);
            const updated = await LeaveTypeService.updateLeaveType(id, updates);
            setLeaveTypes(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
            toast.success('Leave type updated successfully!');
            return updated;
        } catch {
            toast.error((error as Error).message || 'Failed to update leave type');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const deleteLeaveType = useCallback(async (id: string) => {
        try {
            setIsSaving(true);
            await LeaveTypeService.deleteLeaveType(id);
            setLeaveTypes(prev => prev.filter(t => t.id !== id));
            toast.success('Leave type deleted successfully!');
        } catch {
            toast.error((error as Error).message || 'Failed to delete leave type');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // ========================================================================
    // LEAVE POLICIES
    // ========================================================================

    const createPolicy = useCallback(async (policy: LeavePolicy) => {
        try {
            setIsSaving(true);
            await LeavePolicyService.createPolicy(policy);
            setPolicies(prev => [policy, ...prev]);
            toast.success('Leave policy created successfully!');
            return policy;
        } catch {
            toast.error((error as Error).message || 'Failed to create policy');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const updatePolicy = useCallback(async (id: string, updates: Partial<LeavePolicy>) => {
        try {
            setIsSaving(true);
            const updated = await LeavePolicyService.updatePolicy(id, updates);
            setPolicies(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
            toast.success('Leave policy updated successfully!');
            return updated;
        } catch {
            toast.error((error as Error).message || 'Failed to update policy');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // ========================================================================
    // LEAVE BALANCES
    // ========================================================================

    const getEmployeeBalances = useCallback(async (employeeId: string): Promise<LeaveBalance[]> => {
        try {
            return await LeaveBalanceService.getBalances(employeeId);
        } catch {
            toast.error((error as Error).message || 'Failed to load balances');
            return [];
        }
    }, [toast]);

    const updateBalance = useCallback(async (id: string, updates: Partial<LeaveBalance>) => {
        try {
            setIsSaving(true);
            const updated = await LeaveBalanceService.updateBalance(id, updates);
            setBalances(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
            toast.success('Balance updated successfully!');
            return updated;
        } catch {
            toast.error((error as Error).message || 'Failed to update balance');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const processAccrual = useCallback(async (employeeId: string, leaveTypeId: string, accrualDays: number) => {
        try {
            setIsSaving(true);
            const updated = await LeaveBalanceService.processAccrual(employeeId, leaveTypeId, accrualDays);
            setBalances(prev => prev.map(b =>
                b.employeeId === employeeId && b.leaveTypeId === leaveTypeId ? updated : b
            ));
            toast.success(`Accrued ${accrualDays} days successfully!`);
            return updated;
        } catch {
            toast.error((error as Error).message || 'Failed to process accrual');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // ========================================================================
    // LEAVE REQUESTS
    // ========================================================================

    const getEmployeeRequests = useCallback(async (employeeId: string): Promise<LeaveRequest[]> => {
        try {
            return await LeaveRequestService.getRequests({ employeeId });
        } catch {
            toast.error((error as Error).message || 'Failed to load requests');
            return [];
        }
    }, [toast]);

    const getPendingRequests = useCallback(async (): Promise<LeaveRequest[]> => {
        try {
            const allRequests = await LeaveRequestService.getRequests();
            return allRequests.filter(r => r.status.includes('pending'));
        } catch {
            toast.error((error as Error).message || 'Failed to load pending requests');
            return [];
        }
    }, [toast]);

    const createRequest = useCallback(async (request: LeaveRequest) => {
        try {
            setIsSaving(true);
            await LeaveRequestService.createRequest(request);
            setRequests(prev => [request, ...prev]);
            toast.success('Leave request submitted successfully!');
            return request;
        } catch {
            toast.error((error as Error).message || 'Failed to create request');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const approveRequest = useCallback(async (id: string, approverId: string, approverName: string, comments?: string) => {
        try {
            setIsSaving(true);
            const updated = await LeaveRequestService.approveRequest(id, approverId, approverName, comments);
            setRequests(prev => prev.map(r => r.id === id ? updated : r));

            // Update balance if fully approved
            if (updated.status === 'approved') {
                const balance = balances.find(b =>
                    b.employeeId === updated.employeeId &&
                    b.leaveTypeId === updated.leaveTypeId
                );
                if (balance) {
                    await updateBalance(balance.id, {
                        availed: balance.availed + updated.totalDays,
                        pending: balance.pending - updated.totalDays,
                        availableBalance: balance.availableBalance - updated.totalDays,
                    });
                }
            }

            toast.success('Leave request approved successfully!');
            return updated;
        } catch {
            toast.error((error as Error).message || 'Failed to approve request');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast, balances, updateBalance]);

    const rejectRequest = useCallback(async (id: string, approverId: string, approverName: string, comments: string) => {
        try {
            setIsSaving(true);
            const updated = await LeaveRequestService.rejectRequest(id, approverId, approverName, comments);
            setRequests(prev => prev.map(r => r.id === id ? updated : r));

            // Update balance - remove from pending
            const request = requests.find(r => r.id === id);
            if (request) {
                const balance = balances.find(b =>
                    b.employeeId === request.employeeId &&
                    b.leaveTypeId === request.leaveTypeId
                );
                if (balance) {
                    await updateBalance(balance.id, {
                        pending: balance.pending - request.totalDays,
                        availableBalance: balance.availableBalance + request.totalDays,
                    });
                }
            }

            toast.success('Leave request rejected');
            return updated;
        } catch {
            toast.error((error as Error).message || 'Failed to reject request');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast, requests, balances, updateBalance]);

    const cancelRequest = useCallback(async (id: string, cancelledBy: string, reason: string) => {
        try {
            setIsSaving(true);
            const updated = await LeaveRequestService.cancelRequest(id, cancelledBy, reason);
            setRequests(prev => prev.map(r => r.id === id ? updated : r));
            toast.success('Leave request cancelled');
            return updated;
        } catch {
            toast.error((error as Error).message || 'Failed to cancel request');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // ========================================================================
    // HOLIDAYS
    // ========================================================================

    const createHoliday = useCallback(async (holiday: Holiday) => {
        try {
            setIsSaving(true);
            await HolidayService.createHoliday(holiday);
            setHolidays(prev => [holiday, ...prev]);
            toast.success('Holiday created successfully!');
            return holiday;
        } catch {
            toast.error((error as Error).message || 'Failed to create holiday');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const updateHoliday = useCallback(async (id: string, updates: Partial<Holiday>) => {
        try {
            setIsSaving(true);
            const updated = await HolidayService.updateHoliday(id, updates);
            setHolidays(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
            toast.success('Holiday updated successfully!');
            return updated;
        } catch {
            toast.error((error as Error).message || 'Failed to update holiday');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const deleteHoliday = useCallback(async (id: string) => {
        try {
            setIsSaving(true);
            await HolidayService.deleteHoliday(id);
            setHolidays(prev => prev.filter(h => h.id !== id));
            toast.success('Holiday deleted successfully!');
        } catch {
            toast.error((error as Error).message || 'Failed to delete holiday');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // ========================================================================
    // ENCASHMENTS
    // ========================================================================

    const createEncashment = useCallback(async (encashment: LeaveEncashment) => {
        try {
            setIsSaving(true);
            await EncashmentService.createEncashment(encashment);
            setEncashments(prev => [encashment, ...prev]);
            toast.success('Encashment request submitted successfully!');
            return encashment;
        } catch {
            toast.error((error as Error).message || 'Failed to create encashment');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const updateEncashmentStatus = useCallback(async (id: string, status: LeaveEncashment['status'], approvedBy?: string) => {
        try {
            setIsSaving(true);
            const updated = await EncashmentService.updateEncashmentStatus(id, status, approvedBy);
            setEncashments(prev => prev.map(e => e.id === id ? updated : e));
            toast.success(`Encashment ${status} successfully!`);
            return updated;
        } catch {
            toast.error((error as Error).message || 'Failed to update encashment');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // ========================================================================
    // COMP-OFFS
    // ========================================================================

    const createCompOff = useCallback(async (compOff: CompOff) => {
        try {
            setIsSaving(true);
            await CompOffService.createCompOff(compOff);
            setCompOffs(prev => [compOff, ...prev]);
            toast.success('Comp-off request submitted successfully!');
            return compOff;
        } catch {
            toast.error((error as Error).message || 'Failed to create comp-off');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const updateCompOffStatus = useCallback(async (id: string, status: CompOff['status'], approvedBy?: string) => {
        try {
            setIsSaving(true);
            const updated = await CompOffService.updateCompOffStatus(id, status, approvedBy);
            setCompOffs(prev => prev.map(c => c.id === id ? updated : c));
            toast.success(`Comp-off ${status} successfully!`);
            return updated;
        } catch {
            toast.error((error as Error).message || 'Failed to update comp-off');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // ========================================================================
    // CARRY FORWARD
    // ========================================================================

    const processCarryForward = useCallback(async (carryForward: CarryForward) => {
        try {
            setIsSaving(true);
            await CarryForwardService.processCarryForward(carryForward);
            setCarryForwards(prev => [carryForward, ...prev]);
            toast.success('Carry forward processed successfully!');
            return carryForward;
        } catch {
            toast.error((error as Error).message || 'Failed to process carry forward');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // ========================================================================
    // SETTINGS
    // ========================================================================

    const updateSettings = useCallback(async (newSettings: LeaveSettings) => {
        try {
            setIsSaving(true);
            const updated = await LeaveSettingsService.updateSettings(newSettings);
            setSettings(updated);
            toast.success('Leave settings updated successfully!');
            return updated;
        } catch {
            toast.error((error as Error).message || 'Failed to update settings');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // ========================================================================
    // ANALYTICS
    // ========================================================================

    const refreshStats = useCallback(async () => {
        try {
            const statsData = await LeaveAnalyticsService.getStats();
            setStats(statsData);
            return statsData;
        } catch {
            toast.error((error as Error).message || 'Failed to load statistics');
            return null;
        }
    }, [toast]);

    // ========================================================================
    // RETURN API
    // ========================================================================

    return {
        // State
        leaveTypes,
        policies,
        balances,
        requests,
        holidays,
        encashments,
        compOffs,
        carryForwards,
        settings,
        stats,
        isLoading,
        isSaving,

        // Leave Types
        createLeaveType,
        updateLeaveType,
        deleteLeaveType,

        // Policies
        createPolicy,
        updatePolicy,

        // Balances
        getEmployeeBalances,
        updateBalance,
        processAccrual,

        // Requests
        getEmployeeRequests,
        getPendingRequests,
        createRequest,
        approveRequest,
        rejectRequest,
        cancelRequest,

        // Holidays
        createHoliday,
        updateHoliday,
        deleteHoliday,

        // Encashments
        createEncashment,
        updateEncashmentStatus,

        // Comp-offs
        createCompOff,
        updateCompOffStatus,

        // Carry Forward
        processCarryForward,

        // Settings
        updateSettings,

        // Analytics
        refreshStats,

        // Toast
        toast,
    };
};
