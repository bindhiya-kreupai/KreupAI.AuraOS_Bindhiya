"use client";

import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    Plus,
    CreditCard,
    Calendar,
    ChevronDown,
    PiggyBank,
    TrendingUp,
    AlertCircle,
    ArrowRight,
    CheckCircle2
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip
} from 'recharts';
import { LoanService } from '../services';

// --- MOCK DATA ---

interface Loan {
    id: string;
    type: 'Personal Loan' | 'Salary Advance' | 'Vehicle Loan';
    amount: number;
    balance: number;
    tenure: number; // months
    paidTenure: number;
    emi: number;
    status: 'Active' | 'Closed' | 'Pending';
    nextEmiDate: string;
}

const ACTIVE_LOANS: Loan[] = [
    {
        id: 'L-1024',
        type: 'Personal Loan',
        amount: 5000,
        balance: 2750,
        tenure: 12,
        paidTenure: 5,
        emi: 450,
        status: 'Active',
        nextEmiDate: 'Dec 28, 2024'
    },
    {
        id: 'L-1025',
        type: 'Salary Advance',
        amount: 1000,
        balance: 1000,
        tenure: 1,
        paidTenure: 0,
        emi: 1000,
        status: 'Pending',
        nextEmiDate: 'Jan 28, 2025'
    }
];

const EMI_SCHEDULE = [
    { date: 'Dec 28, 2024', amount: 450, status: 'Upcoming', loanId: 'L-1024' },
    { date: 'Nov 28, 2024', amount: 450, status: 'Paid', loanId: 'L-1024' },
    { date: 'Oct 28, 2024', amount: 450, status: 'Paid', loanId: 'L-1024' },
    { date: 'Sep 28, 2024', amount: 450, status: 'Paid', loanId: 'L-1024' },
    { date: 'Aug 28, 2024', amount: 450, status: 'Paid', loanId: 'L-1024' },
];

const REQUEST_TYPES = [
    { label: 'Personal Loan', max: '$10,000', interest: '5% p.a.' },
    { label: 'Salary Advance', max: '1 Month Salary', interest: '0%' },
    { label: 'Vehicle Loan', max: '$20,000', interest: '7% p.a.' },
];

export default function LoansPage() {
    const [schemes, setSchemes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await LoanService.getSchemes();
            setSchemes(data);
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    const activeLoan = ACTIVE_LOANS[0];
    const paidPercentage = ((activeLoan.amount - activeLoan.balance) / activeLoan.amount) * 100;

    // Chart Data
    const data = [
        { name: 'Paid', value: activeLoan.amount - activeLoan.balance, color: '#10b981' }, // Emerald
        { name: 'Balance', value: activeLoan.balance, color: '#e2e8f0' }, // Slate-200
    ];

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <PiggyBank className="w-6 h-6 text-celestial-indigo" />
                        Loans & Advances
                    </h1>
                    <p className="text-silver-mist text-sm">Manage your loans, track repayments, and request advances.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors shadow-lg shadow-celestial-indigo/20">
                    <Plus className="w-4 h-4" /> New Request
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Loan Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Main Card */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>

                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h2 className="text-xl font-bold text-ink-black dark:text-pearl">{activeLoan.type}</h2>
                                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase rounded">
                                        {activeLoan.status}
                                    </span>
                                </div>
                                <div className="text-sm text-silver-mist mb-6">{activeLoan.id} • Disbursed on Jul 15, 2024</div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <div className="text-xs text-silver-mist uppercase font-bold">Total Loan</div>
                                        <div className="text-lg font-bold text-ink-black dark:text-pearl">${activeLoan.amount.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-silver-mist uppercase font-bold">Outstanding</div>
                                        <div className="text-lg font-bold text-rose-500">${activeLoan.balance.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-silver-mist uppercase font-bold">Monthly EMI</div>
                                        <div className="text-lg font-bold text-ink-black dark:text-pearl">${activeLoan.emi}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-silver-mist uppercase font-bold">Tenure</div>
                                        <div className="text-lg font-bold text-ink-black dark:text-pearl">{activeLoan.paidTenure} / {activeLoan.tenure} Months</div>
                                    </div>
                                </div>
                            </div>

                            {/* Circular Progress */}
                            <div className="relative w-40 h-40 shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data}
                                            innerRadius={60}
                                            outerRadius={75}
                                            paddingAngle={0}
                                            dataKey="value"
                                            startAngle={90}
                                            endAngle={-270}
                                        >
                                            {data.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-bold text-emerald-500">{Math.round(paidPercentage)}%</span>
                                    <span className="text-[10px] text-silver-mist uppercase">Paid</span>
                                </div>
                            </div>
                        </div>

                        {/* Next EMI Alert */}
                        <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-indigo-500" />
                                <div>
                                    <div className="text-sm font-bold text-indigo-900 dark:text-indigo-100">Next Deduction: {activeLoan.nextEmiDate}</div>
                                    <div className="text-xs text-indigo-700 dark:text-indigo-300">EMI of ${activeLoan.emi} will be deducted from your salary.</div>
                                </div>
                            </div>
                            <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">View Schedule</button>
                        </div>
                    </div>

                    {/* EMI History */}
                    <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-cloud dark:border-nebula-purple/20">
                            <h3 className="font-bold text-ink-black dark:text-pearl">Repayment Schedule</h3>
                        </div>
                        <div className="divide-y divide-cloud dark:divide-nebula-purple/20">
                            {EMI_SCHEDULE.map((emi, i) => (
                                <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-deep-cosmos/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${emi.status === 'Paid'
                                                ? 'bg-emerald-100 text-emerald-600'
                                                : 'bg-slate-100 text-slate-400'
                                            }`}>
                                            {emi.status === 'Paid' ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-slate-400" />}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-ink-black dark:text-pearl">{emi.date}</div>
                                            <div className="text-xs text-silver-mist">EMI #{5 - i}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-ink-black dark:text-pearl">${emi.amount}</div>
                                        <div className={`text-[10px] font-bold uppercase ${emi.status === 'Paid' ? 'text-emerald-500' : 'text-amber-500'
                                            }`}>
                                            {emi.status}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full py-3 text-xs font-bold text-silver-mist hover:text-celestial-indigo border-t border-cloud dark:border-nebula-purple/20 transition-colors">
                            View All Transactions
                        </button>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Eligibility Card */}
                    <div className="bg-gradient-to-br from-celestial-indigo to-purple-600 p-6 rounded-2xl text-white shadow-lg">
                        <h3 className="font-bold text-lg mb-1">Eligibility Status</h3>
                        <p className="text-indigo-100 text-xs mb-4">Based on your current salary and tenure.</p>

                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-3xl font-bold">$15,000</span>
                            <span className="text-indigo-200 text-sm">Max Avail.</span>
                        </div>

                        <div className="space-y-3">
                            {REQUEST_TYPES.map((type, i) => (
                                <div key={i} className="bg-white/10 rounded-xl p-3 hover:bg-white/20 transition-colors cursor-pointer border border-white/10">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-sm">{type.label}</span>
                                        <ArrowRight className="w-4 h-4 text-indigo-200" />
                                    </div>
                                    <div className="flex justify-between text-xs text-indigo-100">
                                        <span>Max: {type.max}</span>
                                        <span>{type.interest}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pending Requests */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4">Pending Requests</h3>
                        {ACTIVE_LOANS.filter(l => l.status === 'Pending').map(loan => (
                            <div key={loan.id} className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-bold text-sm text-ink-black dark:text-pearl">{loan.type}</div>
                                    <span className="text-[10px] font-bold bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-1.5 py-0.5 rounded">Pending</span>
                                </div>
                                <div className="text-xs text-silver-mist mb-3">Requested on Dec 01</div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                    <div className="w-1/2 h-full bg-amber-500"></div>
                                </div>
                                <div className="mt-2 text-[10px] text-amber-700 dark:text-amber-400 text-center font-medium">Under Review by Finance</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
