"use client";

import React from 'react';
import {
    DollarSign,
    Download,
    Eye,
    Landmark,
    TrendingUp
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

export default function PayslipAccessPage() {
    const payslips = [
        { month: 'November 2023', net: 4250, date: 'Nov 30, 2023', status: 'Paid' },
        { month: 'October 2023', net: 4250, date: 'Oct 31, 2023', status: 'Paid' },
        { month: 'September 2023', net: 4100, date: 'Sep 30, 2023', status: 'Paid' },
        { month: 'August 2023', net: 4250, date: 'Aug 31, 2023', status: 'Paid' },
    ];

    const chartData = [
        { name: 'Jan', pay: 4000 },
        { name: 'Feb', pay: 4000 },
        { name: 'Mar', pay: 4100 },
        { name: 'Apr', pay: 4100 },
        { name: 'May', pay: 4250 },
        { name: 'Jun', pay: 4250 },
    ];

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-emerald-500" />
                        My Payslips
                    </h1>
                    <p className="text-slate-500 text-sm">View and download your monthly salary statements.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Summary & Chart */}
                <div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 opacity-80 mb-1">
                            <Landmark className="w-4 h-4" />
                            <span className="text-sm font-bold uppercase">Net Pay (Last Month)</span>
                        </div>
                        <div className="text-4xl font-bold">$4,250.00</div>
                        <div className="text-sm opacity-75 mt-2">Disbursed on Nov 30, 2023</div>
                    </div>

                    <div className="mt-8 h-32 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorPay" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Tooltip contentStyle={{ backgroundColor: '#064e3b', border: 'none', borderRadius: '8px', color: '#fff' }} cursor={{ stroke: 'rgba(255,255,255,0.2)' }} />
                                <Area type="monotone" dataKey="pay" stroke="#ffffff" strokeWidth={2} fillOpacity={1} fill="url(#colorPay)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* List */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 font-bold text-lg">
                        History
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {payslips.map((slip, i) => (
                            <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold">
                                        {slip.month.substring(0, 3)}
                                    </div>
                                    <div>
                                        <div className="font-bold">{slip.month}</div>
                                        <div className="text-xs text-slate-500 flex items-center gap-2">
                                            <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded font-bold">{slip.status}</span>
                                            <span>• {slip.date}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="font-mono font-bold text-slate-700 dark:text-slate-300">
                                        ${slip.net.toLocaleString()}
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all" title="View">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all" title="Download PDF">
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/50 p-4 rounded-xl flex items-start gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-600">
                    <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-bold text-amber-700 dark:text-amber-300">Tax Projection</h4>
                    <p className="text-sm text-amber-600/80 dark:text-amber-400">Based on your current earnings, your projected annual tax liability is $8,450. Consider submitting investment proofs to save up to $1,200.</p>
                </div>
            </div>
        </div>
    );
}
