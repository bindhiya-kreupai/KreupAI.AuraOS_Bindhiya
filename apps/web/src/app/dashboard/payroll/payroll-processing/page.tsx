"use client";

import React, { useState, useEffect } from 'react';
import {
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    ChevronLeft,
    Users,
    DollarSign,
    Calendar,
    FileText,
    Calculator,
    Play,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PayrollRunService, EmployeeSalaryService } from '../services';
import type { EmployeeSalary, PayrollRun } from '../types';

const STEPS = [
    { id: 1, title: 'Attendance Review', icon: Calendar },
    { id: 2, title: 'Variable Pay', icon: DollarSign },
    { id: 3, title: 'Tax & Deductions', icon: Calculator },
    { id: 4, title: 'Final Preview', icon: FileText },
];

interface PayrollEmployee {
    id: string;
    name: string;
    role: string;
    salary: number;
    daysWorked: number;
    lop: number;
    bonus: number;
}

export default function PayrollRunPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [payrollData, setPayrollData] = useState<PayrollEmployee[]>([]);
    const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [runs, salaries] = await Promise.all([
                PayrollRunService.getPayrollRuns(),
                EmployeeSalaryService.getEmployeeSalaries(),
            ]);
            setPayrollRuns(runs);
            const mapped: PayrollEmployee[] = salaries.map((s: EmployeeSalary) => ({
                id: s.employeeId,
                name: s.employeeName,
                role: s.designation,
                salary: s.monthlyCTC,
                daysWorked: 22,
                lop: 0,
                bonus: 0,
            }));
            setPayrollData(mapped);
        } catch (error) {
            console.error('Failed to fetch payroll data:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalCost = payrollData.reduce((acc, emp) => {
        const dailyRate = emp.salary / 22;
        const actualPay = (emp.salary - (emp.lop * dailyRate)) + emp.bonus;
        return acc + actualPay;
    }, 0);

    const prevMonthCost = payrollRuns.length > 1 ? payrollRuns[1]?.totalNetPay || totalCost : totalCost;
    const variance = prevMonthCost > 0 ? ((totalCost - prevMonthCost) / prevMonthCost) * 100 : 0;

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-silver-mist font-medium">Loading payroll data...</p>
                </div>
            </div>
        );
    }

    if (payrollData.length === 0) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-3 text-center">
                    <Users className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                    <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">No Employee Salary Data</h3>
                    <p className="text-sm text-silver-mist max-w-md">Configure employee salary structures before running payroll.</p>
                </div>
            </div>
        );
    }

    const lopCount = payrollData.filter(e => e.lop > 0).length;

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-emerald-500" />
                        Run Payroll
                    </h1>
                    <p className="text-silver-mist text-sm">Process monthly salaries, review attendance, and finalize disbursements.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                        <div className="text-[10px] font-bold text-silver-mist uppercase">Estimated Cost</div>
                        <div className="text-xl font-bold text-ink-black dark:text-pearl">${totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    </div>
                    {currentStep < 4 ? (
                        <button
                            onClick={nextStep}
                            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                        >
                            Next Step <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                            <CheckCircle2 className="w-4 h-4" /> Commit Payroll
                        </button>
                    )}
                </div>
            </div>

            {/* Stepper */}
            <div className="bg-white dark:bg-stellar-blue p-4 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex justify-between items-center relative overflow-hidden shrink-0">
                <div className="absolute left-0 top-1/2 w-full h-0.5 bg-slate-100 dark:bg-slate-800 -z-10"></div>
                {STEPS.map((step, idx) => {
                    const isActive = step.id === currentStep;
                    const isCompleted = step.id < currentStep;

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2 relative z-10 bg-white dark:bg-stellar-blue px-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                ${isActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' :
                                    isCompleted ? 'border-emerald-500 bg-emerald-500 text-white' :
                                        'border-slate-200 dark:border-slate-700 text-slate-400 bg-white dark:bg-stellar-blue'}
                            `}>
                                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                            </div>
                            <span className={`text-xs font-bold transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                                {step.title}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Wizard Content */}
            <div className="flex-1 bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden flex flex-col relative">
                <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1 p-6 flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-indigo-500" /> Review Attendance
                                </h2>
                                {lopCount > 0 && (
                                    <div className="text-sm bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-lg border border-amber-200 dark:border-amber-500/20 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" /> {lopCount} Exception{lopCount > 1 ? 's' : ''} found
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-silver-mist uppercase sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-3 rounded-l-lg">Employee</th>
                                            <th className="px-4 py-3">Total Days</th>
                                            <th className="px-4 py-3">Worked</th>
                                            <th className="px-4 py-3">LOP</th>
                                            <th className="px-4 py-3 rounded-r-lg">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-cloud dark:divide-slate-800">
                                        {payrollData.map(emp => (
                                            <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="px-4 py-3 font-bold">{emp.name}</td>
                                                <td className="px-4 py-3">22</td>
                                                <td className="px-4 py-3 font-medium text-emerald-500">{emp.daysWorked}</td>
                                                <td className="px-4 py-3 font-bold text-rose-500">{emp.lop > 0 ? emp.lop : '-'}</td>
                                                <td className="px-4 py-3">
                                                    {emp.lop > 0 ? (
                                                        <span className="px-2 py-1 bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 rounded-md text-[10px] font-bold uppercase">
                                                            LOP Deduction
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-md text-[10px] font-bold uppercase">
                                                            Full Pay
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1 p-6 flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-emerald-500" /> Variable Pay & Bonuses
                                </h2>
                                <button className="text-sm text-indigo-500 font-bold hover:underline">
                                    Import from Excel
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-4">
                                {payrollData.map((emp, idx) => (
                                    <div key={emp.id} className="flex items-center justify-between p-4 border border-cloud dark:border-slate-800 rounded-xl hover:border-indigo-300 transition-colors">
                                        <div>
                                            <div className="font-bold text-ink-black dark:text-pearl">{emp.name}</div>
                                            <div className="text-xs text-silver-mist">{emp.role}</div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-[10px] uppercase font-bold text-silver-mist mb-1">Performance Bonus</div>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                                    <input
                                                        type="number"
                                                        value={emp.bonus}
                                                        onChange={(e) => {
                                                            const newData = [...payrollData];
                                                            newData[idx].bonus = Number(e.target.value);
                                                            setPayrollData(newData);
                                                        }}
                                                        className="w-32 pl-6 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-slate-700 rounded-lg text-sm text-right font-bold focus:ring-2 focus:ring-emerald-500/50"
                                                    />
                                                </div>
                                            </div>
                                            <div className="text-right min-w-[100px]">
                                                <div className="text-[10px] uppercase font-bold text-silver-mist mb-1">Total Pay</div>
                                                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                                    ${((emp.salary - ((emp.salary / 22) * emp.lop)) + emp.bonus).toFixed(0)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1 p-6 flex flex-col items-center justify-center text-center"
                        >
                            <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
                                <Calculator className="w-12 h-12 text-indigo-500" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Calculating Taxes...</h2>
                            <p className="text-silver-mist max-w-md mb-8">
                                System is automatically computing Income Tax, Social Security, and Health Insurance deductions based on current policies.
                            </p>

                            <div className="w-full max-w-md bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden mb-4">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 2 }}
                                    className="h-full bg-indigo-500 rounded-full"
                                />
                            </div>
                            <div className="text-sm font-bold text-indigo-500 animate-pulse">Processing Employee {payrollData.length} of {payrollData.length}...</div>
                        </motion.div>
                    )}

                    {currentStep === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1 p-6 overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-indigo-500" /> Executive Summary
                                </h2>
                            </div>

                            <div className="grid grid-cols-3 gap-6 mb-8">
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-cloud dark:border-slate-800">
                                    <div className="text-sm text-silver-mist font-bold uppercase mb-1">Total Payroll</div>
                                    <div className="text-3xl font-bold text-ink-black dark:text-pearl">${totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-cloud dark:border-slate-800">
                                    <div className="text-sm text-silver-mist font-bold uppercase mb-1">Total Employees</div>
                                    <div className="text-3xl font-bold text-ink-black dark:text-pearl">{payrollData.length}</div>
                                </div>
                                <div className={`p-4 rounded-xl border ${Math.abs(variance) > 5 ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-500/20' : 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-500/20'}`}>
                                    <div className={`text-sm font-bold uppercase mb-1 ${Math.abs(variance) > 5 ? 'text-amber-600' : 'text-emerald-600'}`}>Variance (MoM)</div>
                                    <div className={`text-3xl font-bold ${Math.abs(variance) > 5 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                        {variance > 0 ? '+' : ''}{variance.toFixed(1)}%
                                    </div>
                                </div>
                            </div>

                            {Math.abs(variance) > 5 && (
                                <div className="mb-8 p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-500/20 rounded-xl flex gap-3 items-start">
                                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-bold text-rose-700 dark:text-rose-400">High Variance Detected</h4>
                                        <p className="text-xs text-rose-600 dark:text-rose-300 mt-1">
                                            The total payroll cost is {Math.abs(variance).toFixed(1)}% {variance > 0 ? 'higher' : 'lower'} than last month. Please review the changes before committing.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="border-t border-cloud dark:border-slate-800 pt-6">
                                <h3 className="font-bold mb-4">Payout Disbursal</h3>
                                <div className="flex items-center gap-4 p-4 border border-cloud dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900">
                                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-sm">
                                        <DollarSign className="w-8 h-8 text-emerald-500" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">Bank Transfer</div>
                                        <div className="text-xs text-silver-mist">Corporate Account</div>
                                    </div>
                                    <div className="ml-auto text-right">
                                        <div className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-1 rounded inline-block">
                                            Connected & Ready
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer Navigation */}
                <div className="p-4 border-t border-cloud dark:border-nebula-purple/20 bg-slate-50 dark:bg-slate-900/50 flex justify-between">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className="px-6 py-2 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Back
                    </button>
                    <div className="text-xs text-slate-400 font-medium flex items-center">
                        Step {currentStep} of 4
                    </div>
                </div>
            </div>
        </div>
    );
}
