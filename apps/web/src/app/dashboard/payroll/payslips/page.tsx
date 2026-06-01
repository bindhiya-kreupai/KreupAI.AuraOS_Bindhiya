"use client";

import React, { useState, useEffect } from 'react';
import {
    Download,
    Eye,
    Calendar,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Building2,
    Briefcase,
    Printer,
    Share2,
    ChevronDown,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    Legend
} from 'recharts';
import { PayslipService } from '../services';
import type { Payslip } from '../types';

const CHART_COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function PayslipsPage() {
    const [payslips, setPayslips] = useState<Payslip[]>([]);
    const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await PayslipService.getPayslips();
            setPayslips(result);
            if (result.length > 0) {
                setSelectedPayslip(result[0]);
            }
        } catch (error: any) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-silver-mist font-medium">Loading payslips...</p>
                </div>
            </div>
        );
    }

    if (payslips.length === 0 || !selectedPayslip) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-3 text-center">
                    <DollarSign className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                    <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">No Payslips Available</h3>
                    <p className="text-sm text-silver-mist max-w-md">Payslips will appear here once payroll has been processed.</p>
                </div>
            </div>
        );
    }

    const chartData = selectedPayslip.earnings.map((e, i) => ({
        name: e.componentName,
        value: e.amount,
        color: CHART_COLORS[i % CHART_COLORS.length],
    }));

    const totalEarnings = selectedPayslip.totalEarnings;
    const totalDeductions = selectedPayslip.totalDeductions;

    return (
        <div className="max-w-6xl mx-auto space-y-4 pb-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-emerald-500" />
                        My Payslips
                    </h1>
                    <p className="text-silver-mist text-sm">View, download, and manage your salary documents.</p>
                </div>
                <div className="flex gap-2 relative">
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="px-4 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-lg text-sm font-medium hover:bg-cloud/50 transition-colors flex items-center gap-2 w-48 justify-between"
                    >
                        <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-silver-mist" /> {selectedPayslip.monthName}</span>
                        <ChevronDown className="w-4 h-4 text-silver-mist" />
                    </button>
                    <button className="px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" /> Download PDF
                    </button>

                    {/* History Dropdown */}
                    {showHistory && (
                        <div className="absolute top-full mt-2 w-full md:w-64 right-0 z-50 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-xl overflow-hidden py-1">
                            {payslips.map(slip => (
                                <button
                                    key={slip.id}
                                    onClick={() => { setSelectedPayslip(slip); setShowHistory(false); }}
                                    className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-deep-cosmos/50 flex items-center justify-between group"
                                >
                                    <div>
                                        <div className="text-sm font-bold text-ink-black dark:text-pearl">{slip.monthName}</div>
                                        <div className="text-xs text-silver-mist">{slip.paymentDate || slip.generatedAt}</div>
                                    </div>
                                    <div className="text-xs font-bold text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                                        {slip.paymentStatus}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Breakdown Chart */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4">Salary Distribution</h3>
                        <div className="h-64 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-xs text-silver-mist uppercase">Gross</span>
                                <span className="text-xl font-bold text-ink-black dark:text-pearl">${totalEarnings.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="space-y-2 mt-2">
                            {chartData.map(item => (
                                <div key={item.name} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                                    </div>
                                    <span className="font-medium text-ink-black dark:text-pearl">${item.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                        <h3 className="text-emerald-100 font-medium text-sm mb-1 uppercase tracking-wider">Net Payable</h3>
                        <div className="text-4xl font-bold mb-4">${selectedPayslip.netPay.toLocaleString()}</div>
                        <div className="flex justify-between items-end">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-emerald-100 opacity-80">Status</span>
                                <span className="text-sm font-semibold capitalize">{selectedPayslip.paymentStatus}</span>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Digital Payslip */}
                <div className="lg:col-span-2 bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-cloud dark:border-nebula-purple/20 flex justify-between items-start bg-slate-50 dark:bg-slate-900/30">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-celestial-indigo text-white rounded-lg flex items-center justify-center">
                                <Building2 className="w-7 h-7" />
                            </div>
                            <div>
                                <h2 className="font-bold text-lg text-ink-black dark:text-pearl">KreupAI Technologies</h2>
                                <p className="text-xs text-silver-mist">Dubai Internet City, Building 3, UAE</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h3 className="font-bold text-ink-black dark:text-pearl text-lg uppercase tracking-wide opacity-50">Payslip</h3>
                            <p className="text-sm text-silver-mist font-medium">{selectedPayslip.monthName}</p>
                        </div>
                    </div>

                    <div className="p-8 space-y-8 flex-1 bg-white dark:bg-stellar-blue text-sm">
                        {/* Employee Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
                            <div>
                                <div className="text-xs text-silver-mist uppercase mb-1">Employee Name</div>
                                <div className="font-bold text-ink-black dark:text-pearl">{selectedPayslip.employeeName}</div>
                            </div>
                            <div>
                                <div className="text-xs text-silver-mist uppercase mb-1">Employee ID</div>
                                <div className="font-bold text-ink-black dark:text-pearl">{selectedPayslip.employeeCode}</div>
                            </div>
                            <div>
                                <div className="text-xs text-silver-mist uppercase mb-1">Designation</div>
                                <div className="font-bold text-ink-black dark:text-pearl">{selectedPayslip.designation}</div>
                            </div>
                            <div>
                                <div className="text-xs text-silver-mist uppercase mb-1">Department</div>
                                <div className="font-bold text-ink-black dark:text-pearl">{selectedPayslip.department}</div>
                            </div>
                            <div>
                                <div className="text-xs text-silver-mist uppercase mb-1">Pay Period</div>
                                <div className="font-bold text-ink-black dark:text-pearl">{selectedPayslip.payPeriodStart} - {selectedPayslip.payPeriodEnd}</div>
                            </div>
                            <div>
                                <div className="text-xs text-silver-mist uppercase mb-1">Days Payable</div>
                                <div className="font-bold text-ink-black dark:text-pearl">{selectedPayslip.paidDays}</div>
                            </div>
                            <div>
                                <div className="text-xs text-silver-mist uppercase mb-1">Bank Account</div>
                                <div className="font-bold text-ink-black dark:text-pearl">{selectedPayslip.accountNumber}</div>
                            </div>
                            <div>
                                <div className="text-xs text-silver-mist uppercase mb-1">PAN / Tax ID</div>
                                <div className="font-bold text-ink-black dark:text-pearl">{selectedPayslip.panNumber}</div>
                            </div>
                        </div>

                        {/* Salary Table */}
                        <div className="border border-cloud dark:border-nebula-purple/50 rounded-lg overflow-hidden">
                            <div className="grid grid-cols-2 bg-slate-100 dark:bg-deep-cosmos border-b border-cloud dark:border-nebula-purple/20">
                                <div className="p-3 font-semibold text-center border-r border-cloud dark:border-nebula-purple/20 text-emerald-600">EARNINGS</div>
                                <div className="p-3 font-semibold text-center text-red-500">DEDUCTIONS</div>
                            </div>
                            <div className="grid grid-cols-2">
                                <div className="border-r border-cloud dark:border-nebula-purple/20 p-4 space-y-3">
                                    {selectedPayslip.earnings.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                                            <span>{item.componentName}</span>
                                            <span className="font-medium">${item.amount.toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div className="pt-4 mt-4 border-t border-cloud dark:border-nebula-purple/20 flex justify-between items-center font-bold text-ink-black dark:text-pearl">
                                        <span>Total Earnings</span>
                                        <span>${totalEarnings.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="p-4 space-y-3">
                                    {selectedPayslip.deductions.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                                            <span>{item.componentName}</span>
                                            <span className="font-medium">${item.amount.toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div className="pt-4 mt-4 border-t border-cloud dark:border-nebula-purple/20 flex justify-between items-center font-bold text-ink-black dark:text-pearl">
                                        <span>Total Deductions</span>
                                        <span>${totalDeductions.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Net Pay Line */}
                        <div className="bg-slate-50 dark:bg-deep-cosmos/30 p-4 rounded-lg flex justify-between items-center border border-cloud dark:border-nebula-purple/20 border-dashed">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-silver-mist uppercase tracking-wide">Net Pay (In Words)</span>
                                <span className="text-sm font-medium text-ink-black dark:text-pearl italic">{selectedPayslip.netPayInWords || `$${selectedPayslip.netPay.toLocaleString()}`}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-bold text-silver-mist uppercase tracking-wide block">Net Pay</span>
                                <span className="text-2xl font-black text-ink-black dark:text-pearl">${selectedPayslip.netPay.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="text-center text-xs text-silver-mist pt-4">
                            This is a system-generated payslip and does not require a signature.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

