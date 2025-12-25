"use client";

import React, { useState, useEffect } from 'react';
import {
    Map,
    Building2,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react';
import { PayrollRunService } from '../services';

export default function MultiStatePayrollPage() {
    const [payrollRuns, setPayrollRuns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await PayrollRunService.getPayrollRuns();
            if (result.length > 0) {
                setPayrollRuns(result);
            }
        } catch {
                    } finally {
            setLoading(false);
        }
    };
    const states = [
        { name: 'California', taxId: 'CA-55291', status: 'Compliant', employees: 85 },
        { name: 'New York', taxId: 'NY-11202', status: 'Action Needed', employees: 42, alert: 'Tax rate update pending' },
        { name: 'Texas', taxId: 'TX-00291', status: 'Compliant', employees: 31 }
    ];

    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Map className="w-6 h-6 text-indigo-500" />
                        Multi-State Payroll
                    </h1>
                    <p className="text-slate-500 text-sm">Manage tax compliances across different operational jurisdictions.</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2">
                    Add New State
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visual Map (Mock) */}
                <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl min-h-[300px] flex items-center justify-center border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                    <div className="text-slate-400 text-sm font-bold">Interactive Map Visualization Component</div>
                </div>

                {/* State List */}
                <div className="space-y-4">
                    {states.map((state, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">{state.name}</h4>
                                    <div className="text-xs text-slate-500">Tax ID: {state.taxId} • {state.employees} Employees</div>
                                    {state.alert && (
                                        <div className="flex items-center gap-1 text-xs text-rose-600 font-bold mt-1">
                                            <AlertTriangle className="w-3 h-3" /> {state.alert}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${state.status === 'Compliant' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                    }`}>
                                    {state.status === 'Compliant' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                    {state.status}
                                </div>
                                <div className="mt-2">
                                    <button className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Manage Rules</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
