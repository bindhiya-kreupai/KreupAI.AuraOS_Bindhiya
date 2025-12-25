"use client";

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, UserCheck, Eye, EyeOff } from 'lucide-react';
import { ReportSecurityService } from '../services';

const ROLES = [
    { id: 1, name: 'Super Admin', access: 'Full Access', users: 3 },
    { id: 2, name: 'HR Manager', access: 'Restricted (HR Only)', users: 12 },
    { id: 3, name: 'Team Lead', access: 'Team View Only', users: 45 },
    { id: 4, name: 'Employee', access: 'Self View Only', users: 1200 },
];

export default function ReportSecurityPage() {
    const [security, setSecurity] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSecurity();
    }, []);

    const fetchSecurity = async () => {
        try {
            const data = await ReportSecurityService.getReportSecurity('default');
            setSecurity(data);
        } catch (error) {
            console.error('Error fetching report security:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-8 min-h-screen">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
                    <ShieldCheck className="w-8 h-8 text-indigo-500" />
                    Report Security
                </h1>
                <p className="text-slate-500 mt-2 text-lg">Manage access permissions, PI masking, and data sensitivity levels.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Role Access Matrix */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Lock className="w-5 h-5 text-indigo-500" /> Role-Based Access Control
                    </h3>
                    <div className="space-y-4">
                        {ROLES.map((role) => (
                            <div key={role.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-slate-100">{role.name}</div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                        <UserCheck className="w-3 h-3" /> {role.users} Users assigned
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{role.access}</div>
                                    <button className="text-xs text-indigo-600 font-bold hover:underline mt-1">Edit Permissions</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Data Sensitivity Settings */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <EyeOff className="w-5 h-5 text-indigo-500" /> Data Masking & PII Protection
                    </h3>
                    <div className="space-y-4">
                        {[
                            { name: 'National ID / SSN', status: 'Masked (***-**-1234)' },
                            { name: 'Salary Data', status: 'Hidden for non-HR' },
                            { name: 'Home Address', status: 'Visible to Manager' },
                            { name: 'Bank Details', status: 'Totally Restricted' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                                <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400">
                                    {item.status}
                                </span>
                            </div>
                        ))}
                    </div>
                    <button className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold py-3 rounded-xl transition-colors">
                        Manage Data Policies
                    </button>
                </div>
            </div>
        </div>
    );
}
