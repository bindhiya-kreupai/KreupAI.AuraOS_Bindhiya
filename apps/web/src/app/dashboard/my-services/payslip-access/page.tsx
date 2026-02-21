"use client";

import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    Download,
    Eye,
    Landmark,
    TrendingUp,
    Loader2
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
import { PayslipService } from '../services';

export default function PayslipAccessPage() {
    const [fetching, setFetching] = useState(true);
    const [payslips, setPayslips] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        const fetchPayslips = async () => {
            try {
                const res = await PayslipService.getPayslips('me');
                if (res?.success && Array.isArray(res.data)) {
                    setPayslips(res.data);
                    const chart = res.data.slice(0, 6).reverse().map((s: any) => ({
                        name: s.month?.substring(0, 3) || new Date(s.payDate || s.createdAt).toLocaleDateString('en', { month: 'short' }),
                        pay: s.netPay || s.net || 0,
                    }));
                    setChartData(chart);
                }
            } catch (err) {
                console.error('Failed to fetch payslips:', err);
            } finally {
                setFetching(false);
            }
        };
        fetchPayslips();
    }, []);

    if (fetching) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    const latestPayslip = payslips[0];
    const netPay = latestPayslip?.netPay || latestPayslip?.net || 0;
    const payDate = latestPayslip?.payDate || latestPayslip?.date || '';

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
                <div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 opacity-80 mb-1">
                            <Landmark className="w-4 h-4" />
                            <span className="text-sm font-bold uppercase">Net Pay (Last Month)</span>
                        </div>
                        <div className="text-4xl font-bold">${netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        <div className="text-sm opacity-75 mt-2">{payDate ? `Disbursed on ${new Date(payDate).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'No payslip data yet'}</div>
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

                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 font-bold text-lg">
                        History
                    </div>
                    {payslips.length > 0 ? (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {payslips.map((slip: any, i: number) => {
                                const month = slip.month || new Date(slip.payDate || slip.createdAt).toLocaleDateString('en', { month: 'long', year: 'numeric' });
                                const net = slip.netPay || slip.net || 0;
                                const date = slip.payDate || slip.date || slip.createdAt;
                                return (
                                    <div key={slip.id || i} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold">
                                                {month.substring(0, 3)}
                                            </div>
                                            <div>
                                                <div className="font-bold">{month}</div>
                                                <div className="text-xs text-slate-500 flex items-center gap-2">
                                                    <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded font-bold">{slip.status || 'Paid'}</span>
                                                    <span>&#8226; {date ? new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="font-mono font-bold text-slate-700 dark:text-slate-300">
                                                ${net.toLocaleString()}
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
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-12 text-center text-slate-400">
                            <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No payslips available yet</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/50 p-4 rounded-xl flex items-start gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-600">
                    <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-bold text-amber-700 dark:text-amber-300">Tax Projection</h4>
                    <p className="text-sm text-amber-600/80 dark:text-amber-400">Based on your current earnings, your projected annual tax liability is being calculated. Consider submitting investment proofs to optimize your tax savings.</p>
                </div>
            </div>
        </div>
    );
}
