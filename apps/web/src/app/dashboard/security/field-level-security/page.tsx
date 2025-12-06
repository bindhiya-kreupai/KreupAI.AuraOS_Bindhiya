"use client";

import React from 'react';
import {
    Eye,
    EyeOff,
    Lock,
    Unlock,
    Shield,
    Users,
    Table
} from 'lucide-react';

export default function FieldSecurityPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Lock className="w-6 h-6 text-rose-500" />
                        Field Level Security
                    </h1>
                    <p className="text-slate-500 text-sm">Control visibility and edit permissions for sensitive data fields (PII).</p>
                </div>
                <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 px-4 py-2 rounded-xl text-sm font-bold border border-rose-100 dark:border-rose-800/30">
                    <Shield className="w-4 h-4" /> 12 Protected Fields
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Role List */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-500" /> Select Role
                    </h3>
                    <div className="space-y-2">
                        {['Super Admin', 'HR Manager', 'Finance Manager', 'Line Manager', 'Employee (Self)'].map((r, i) => (
                            <button key={i} className={`w-full text-left p-3 rounded-lg text-sm font-bold flex justify-between items-center ${i === 1 ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 border border-indigo-100 dark:border-indigo-800' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'}`}>
                                {r}
                                {i === 1 && <span className="text-[10px] bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 px-2 rounded">Editing</span>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Field Matrix */}
                <div className="lg:col-span-2 overflow-y-auto pb-20">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                            <Table className="w-5 h-5 text-slate-400" />
                            Permissions for: <span className="text-indigo-500">HR Manager</span>
                        </h3>

                        <div className="space-y-6">
                            {/* Section */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">Personal Information (PII)</h4>
                                <div className="space-y-3">
                                    {[
                                        { field: 'National ID / SSN', read: true, edit: false, mask: true },
                                        { field: 'Date of Birth', read: true, edit: true, mask: false },
                                        { field: 'Home Address', read: true, edit: true, mask: false },
                                        { field: 'Personal Email', read: true, edit: true, mask: false },
                                    ].map((f, i) => (
                                        <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg">
                                            <div className="font-bold text-slate-700 dark:text-slate-300 text-sm">{f.field}</div>
                                            <div className="flex gap-4">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 w-20">
                                                    {f.read ? <Eye className="w-4 h-4 text-emerald-500" /> : <EyeOff className="w-4 h-4 text-slate-300" />}
                                                    {f.read ? 'View' : 'Hidden'}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 w-20">
                                                    {f.edit ? <Unlock className="w-4 h-4 text-emerald-500" /> : <Lock className="w-4 h-4 text-rose-500" />}
                                                    {f.edit ? 'Edit' : 'Locked'}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 w-20">
                                                    <div className={`w-8 h-4 rounded-full relative ${f.mask ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${f.mask ? 'left-4' : 'left-0.5'}`}></div>
                                                    </div>
                                                    Mask
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Section */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">Financial Data</h4>
                                <div className="space-y-3">
                                    {[
                                        { field: 'Basic Salary', read: true, edit: false, mask: false },
                                        { field: 'Bank Account No.', read: true, edit: true, mask: true },
                                        { field: 'Tax ID', read: true, edit: false, mask: true },
                                        { field: 'Stock Options', read: false, edit: false, mask: true },
                                    ].map((f, i) => (
                                        <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg">
                                            <div className="font-bold text-slate-700 dark:text-slate-300 text-sm">{f.field}</div>
                                            <div className="flex gap-4">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 w-20">
                                                    {f.read ? <Eye className="w-4 h-4 text-emerald-500" /> : <EyeOff className="w-4 h-4 text-slate-300" />}
                                                    {f.read ? 'View' : 'Hidden'}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 w-20">
                                                    {f.edit ? <Unlock className="w-4 h-4 text-emerald-500" /> : <Lock className="w-4 h-4 text-rose-500" />}
                                                    {f.edit ? 'Edit' : 'Locked'}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 w-20">
                                                    <div className={`w-8 h-4 rounded-full relative ${f.mask ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${f.mask ? 'left-4' : 'left-0.5'}`}></div>
                                                    </div>
                                                    Mask
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
