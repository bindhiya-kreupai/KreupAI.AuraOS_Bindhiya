/**
 * usePayroll Hook - Production Ready
 * Manages all payroll operations with loading states, error handling, and persistence
 */

import { useState, useEffect, useCallback } from 'react';
import type {
    PayrollRun,
    Payslip,
    EmployeeSalary,
    TaxDeclaration,
    ReimbursementClaim,
    EmployeeLoan,
    Bonus,
    PayrollSettings,
    PayrollStats,
} from '../types';
import {
    PayrollRunService,
    PayslipService,
    EmployeeSalaryService,
    TaxDeclarationService,
    ReimbursementService,
    LoanService,
    BonusService,
    PayrollSettingsService,
    PayrollAnalyticsService,
} from '../services';
import {
    generateSampleEmployeeSalaries,
    generateSamplePayrollRuns,
    generateSampleTaxDeclarations,
    generateSampleReimbursements,
    generateSampleLoans,
    generateSampleBonuses,
    generateSampleSettings,
} from '../data';
import { useToast } from './useToast';

export const usePayroll = () => {
    // ========================================================================
    // STATE
    // ========================================================================

    const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
    const [payslips, setPayslips] = useState<Payslip[]>([]);
    const [employeeSalaries, setEmployeeSalaries] = useState<EmployeeSalary[]>([]);
    const [taxDeclarations, setTaxDeclarations] = useState<TaxDeclaration[]>([]);
    const [reimbursements, setReimbursements] = useState<ReimbursementClaim[]>([]);
    const [loans, setLoans] = useState<EmployeeLoan[]>([]);
    const [bonuses, setBonuses] = useState<Bonus[]>([]);
    const [settings, setSettings] = useState<PayrollSettings | null>(null);
    const [stats, setStats] = useState<PayrollStats | null>(null);

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
                runsData,
                salariesData,
                declarationsData,
                reimbursementsData,
                loansData,
                bonusesData,
                settingsData,
            ] = await Promise.all([
                PayrollRunService.getPayrollRuns(),
                EmployeeSalaryService.getEmployeeSalaries(),
                TaxDeclarationService.getTaxDeclarations(),
                ReimbursementService.getClaims(),
                LoanService.getLoans(),
                BonusService.getBonuses(),
                PayrollSettingsService.getSettings(),
            ]);

            // Initialize with sample data if empty
            if (salariesData.length === 0) {
                const sampleSalaries = generateSampleEmployeeSalaries();
                setEmployeeSalaries(sampleSalaries);
                for (const salary of sampleSalaries) {
                    await EmployeeSalaryService.updateEmployeeSalary(salary.employeeId, salary);
                }
            } else {
                setEmployeeSalaries(salariesData);
            }

            if (runsData.length === 0) {
                const sampleRuns = generateSamplePayrollRuns();
                setPayrollRuns(sampleRuns);
                for (const run of sampleRuns) {
                    await PayrollRunService.createPayrollRun(run);
                }
            } else {
                setPayrollRuns(runsData);
            }

            if (declarationsData.length === 0) {
                const sampleDeclarations = generateSampleTaxDeclarations();
                setTaxDeclarations(sampleDeclarations);
                for (const declaration of sampleDeclarations) {
                    await TaxDeclarationService.saveDeclaration(declaration);
                }
            } else {
                setTaxDeclarations(declarationsData);
            }

            if (reimbursementsData.length === 0) {
                const sampleReimbursements = generateSampleReimbursements();
                setReimbursements(sampleReimbursements);
                for (const reimb of sampleReimbursements) {
                    await ReimbursementService.createClaim(reimb);
                }
            } else {
                setReimbursements(reimbursementsData);
            }

            if (loansData.length === 0) {
                const sampleLoans = generateSampleLoans();
                setLoans(sampleLoans);
                for (const loan of sampleLoans) {
                    await LoanService.createLoan(loan);
                }
            } else {
                setLoans(loansData);
            }

            if (bonusesData.length === 0) {
                const sampleBonuses = generateSampleBonuses();
                setBonuses(sampleBonuses);
                for (const bonus of sampleBonuses) {
                    await BonusService.createBonus(bonus);
                }
            } else {
                setBonuses(bonusesData);
            }

            if (!settingsData) {
                const sampleSettings = generateSampleSettings();
                setSettings(sampleSettings);
                await PayrollSettingsService.updateSettings(sampleSettings);
            } else {
                setSettings(settingsData);
            }

            // Load stats
            const statsData = await PayrollAnalyticsService.getStats();
            setStats(statsData);

        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to load payroll data');
        } finally {
            setIsLoading(false);
        }
    };

    // ========================================================================
    // PAYROLL RUNS
    // ========================================================================

    const getPayrollRun = useCallback(async (id: string): Promise<PayrollRun | null> => {
        try {
            return await PayrollRunService.getPayrollRun(id);
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to load payroll run');
            return null;
        }
    }, [toast]);

    const createPayrollRun = useCallback(async (run: PayrollRun) => {
        try {
            setIsSaving(true);
            await PayrollRunService.createPayrollRun(run);
            setPayrollRuns(prev => [run, ...prev]);
            toast.success('Payroll run created successfully!');
            return run;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to create payroll run');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const updatePayrollRun = useCallback(async (id: string, updates: Partial<PayrollRun>) => {
        try {
            setIsSaving(true);
            const updated = await PayrollRunService.updatePayrollRun(id, updates);
            setPayrollRuns(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
            toast.success('Payroll run updated successfully!');
            return updated;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to update payroll run');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const deletePayrollRun = useCallback(async (id: string) => {
        try {
            setIsSaving(true);
            await PayrollRunService.deletePayrollRun(id);
            setPayrollRuns(prev => prev.filter(r => r.id !== id));
            toast.success('Payroll run deleted successfully!');
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to delete payroll run');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const processPayrollStep = useCallback(async (id: string, step: PayrollRun['currentStep']) => {
        try {
            setIsSaving(true);
            const updated = await PayrollRunService.processStep(id, step);
            setPayrollRuns(prev => prev.map(r => r.id === id ? updated : r));
            toast.success(`Moved to ${step.replace('_', ' ')} step`);
            return updated;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to process payroll step');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const approvePayroll = useCallback(async (id: string, approvedBy: string) => {
        try {
            setIsSaving(true);
            const updated = await PayrollRunService.approvePayroll(id, approvedBy);
            setPayrollRuns(prev => prev.map(r => r.id === id ? updated : r));
            toast.success('Payroll approved and ready for disbursement!');
            return updated;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to approve payroll');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // ========================================================================
    // PAYSLIPS
    // ========================================================================

    const getPayslips = useCallback(async (employeeId?: string): Promise<Payslip[]> => {
        try {
            return await PayslipService.getPayslips(employeeId);
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to load payslips');
            return [];
        }
    }, [toast]);

    const downloadPayslip = useCallback(async (id: string) => {
        try {
            const blob = await PayslipService.downloadPayslip(id);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `payslip_${id}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Payslip downloaded successfully!');
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to download payslip');
            throw error;
        }
    }, [toast]);

    // ========================================================================
    // EMPLOYEE SALARIES
    // ========================================================================

    const updateEmployeeSalary = useCallback(async (employeeId: string, updates: Partial<EmployeeSalary>) => {
        try {
            setIsSaving(true);
            const updated = await EmployeeSalaryService.updateEmployeeSalary(employeeId, updates);
            setEmployeeSalaries(prev => prev.map(s => s.employeeId === employeeId ? { ...s, ...updates } : s));
            toast.success('Salary updated successfully!');
            return updated;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to update salary');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // ========================================================================
    // TAX DECLARATIONS
    // ========================================================================

    const saveTaxDeclaration = useCallback(async (declaration: TaxDeclaration) => {
        try {
            setIsSaving(true);
            const saved = await TaxDeclarationService.saveDeclaration(declaration);
            setTaxDeclarations(prev => {
                const index = prev.findIndex(d => d.id === declaration.id);
                if (index >= 0) {
                    return prev.map(d => d.id === declaration.id ? saved : d);
                }
                return [saved, ...prev];
            });
            toast.success('Tax declaration saved successfully!');
            return saved;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to save tax declaration');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const uploadTaxProof = useCallback(async (declarationId: string, categoryId: string, file: File) => {
        try {
            setIsSaving(true);
            const url = await TaxDeclarationService.uploadProof(declarationId, categoryId, file);
            toast.success('Tax proof uploaded successfully!');
            return url;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to upload tax proof');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // ========================================================================
    // REIMBURSEMENTS
    // ========================================================================

    const createReimbursement = useCallback(async (claim: ReimbursementClaim) => {
        try {
            setIsSaving(true);
            await ReimbursementService.createClaim(claim);
            setReimbursements(prev => [claim, ...prev]);
            toast.success('Reimbursement claim submitted successfully!');
            return claim;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to create reimbursement claim');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const updateReimbursementStatus = useCallback(async (
        id: string,
        status: ReimbursementClaim['status'],
        approver?: string,
        rejectionReason?: string
    ) => {
        try {
            setIsSaving(true);
            const updated = await ReimbursementService.updateClaimStatus(id, status, approver, rejectionReason);
            setReimbursements(prev => prev.map(r => r.id === id ? updated : r));
            toast.success(`Claim ${status} successfully!`);
            return updated;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to update claim status');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // ========================================================================
    // LOANS
    // ========================================================================

    const createLoan = useCallback(async (loan: EmployeeLoan) => {
        try {
            setIsSaving(true);
            await LoanService.createLoan(loan);
            setLoans(prev => [loan, ...prev]);
            toast.success('Loan created successfully!');
            return loan;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to create loan');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const updateLoan = useCallback(async (id: string, updates: Partial<EmployeeLoan>) => {
        try {
            setIsSaving(true);
            const updated = await LoanService.updateLoan(id, updates);
            setLoans(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
            toast.success('Loan updated successfully!');
            return updated;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to update loan');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // ========================================================================
    // BONUSES
    // ========================================================================

    const createBonus = useCallback(async (bonus: Bonus) => {
        try {
            setIsSaving(true);
            await BonusService.createBonus(bonus);
            setBonuses(prev => [bonus, ...prev]);
            toast.success('Bonus created successfully!');
            return bonus;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to create bonus');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const updateBonusStatus = useCallback(async (id: string, status: Bonus['status'], approvedBy?: string) => {
        try {
            setIsSaving(true);
            const updated = await BonusService.updateBonusStatus(id, status, approvedBy);
            setBonuses(prev => prev.map(b => b.id === id ? updated : b));
            toast.success(`Bonus ${status} successfully!`);
            return updated;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to update bonus status');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // ========================================================================
    // SETTINGS
    // ========================================================================

    const updateSettings = useCallback(async (newSettings: PayrollSettings) => {
        try {
            setIsSaving(true);
            const updated = await PayrollSettingsService.updateSettings(newSettings);
            setSettings(updated);
            toast.success('Payroll settings updated successfully!');
            return updated;
        } catch (error: any) {
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
            const statsData = await PayrollAnalyticsService.getStats();
            setStats(statsData);
            return statsData;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to load statistics');
            return null;
        }
    }, [toast]);

    // ========================================================================
    // RETURN API
    // ========================================================================

    return {
        // State
        payrollRuns,
        payslips,
        employeeSalaries,
        taxDeclarations,
        reimbursements,
        loans,
        bonuses,
        settings,
        stats,
        isLoading,
        isSaving,

        // Payroll Runs
        getPayrollRun,
        createPayrollRun,
        updatePayrollRun,
        deletePayrollRun,
        processPayrollStep,
        approvePayroll,

        // Payslips
        getPayslips,
        downloadPayslip,

        // Employee Salaries
        updateEmployeeSalary,

        // Tax Declarations
        saveTaxDeclaration,
        uploadTaxProof,

        // Reimbursements
        createReimbursement,
        updateReimbursementStatus,

        // Loans
        createLoan,
        updateLoan,

        // Bonuses
        createBonus,
        updateBonusStatus,

        // Settings
        updateSettings,

        // Analytics
        refreshStats,

        // Toast
        toast,
    };
};
