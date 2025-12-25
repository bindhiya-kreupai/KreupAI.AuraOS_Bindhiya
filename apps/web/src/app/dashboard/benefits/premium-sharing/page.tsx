"use client";

import React, { useState, useEffect } from 'react';
import {
    PieChart,
    Coins,
    Percent,
    ArrowUpRight
} from 'lucide-react';
import { PremiumService } from '../services';

export default function PremiumSharingPage() {
    const [deductions, setDeductions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDeductions();
    }, []);

    const fetchDeductions = async () => {
        try {
            setLoading(true);
            const data = await PremiumService.getDeductions({ employeeId: 'EMP-001' });
            if (data.length === 0) {
                setDeductions(mockDeductions);
            } else {
                setDeductions(data);
            }
        } catch (error) {
            console.error('Error:', error);
                        setDeductions(mockDeductions);
        } finally {
            setLoading(false);
        }
    };

    const mockDeductions = [
        { plan: 'Health Insurance (Premium)', total: '$1,200', employer: 80, employee: 20 },
        { plan: 'Dental Plan', total: '$150', employer: 50, employee: 50 },
        { plan: 'Vision Plan', total: '$50', employer: 100, employee: 0 },
        { plan: 'Life Insurance', total: '$80', employer: 100, employee: 0 },
        { plan: 'Dependents Coverage', total: '$400', employer: 0, employee: 100 },
    ];

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Coins className="w-6 h-6 text-indigo-500" />
                        Premium Sharing
                    </h1>
                    <p className="text-slate-500 text-sm">Configure employer vs. employee contribution ratios.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-20">
                {loading ? (
                    <div className="col-span-full flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : deductions.map((item, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{item.plan}</h3>
                            <div className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs font-bold text-slate-500">
                                Total: {item.total}/mo
                            </div>
                        </div>

                        <div className="h-4 flex rounded-full overflow-hidden mb-4">
                            <div
                                style={{ width: `${item.employer}%` }}
                                className="bg-indigo-500 h-full relative group"
                                title={`Employer: ${item.employer}%`}
                            ></div>
                            <div
                                style={{ width: `${item.employee}%` }}
                                className="bg-rose-400 h-full relative"
                                title={`Employee: ${item.employee}%`}
                            ></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="block text-xs text-slate-400 font-bold uppercase mb-1">Employer Pays</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{item.employer}%</span>
                                </div>
                            </div>
                            <div>
                                <span className="block text-xs text-slate-400 font-bold uppercase mb-1">Employee Pays</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                                    <span className="text-xl font-bold text-rose-500">{item.employee}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
