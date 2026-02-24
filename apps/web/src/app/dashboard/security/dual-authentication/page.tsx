"use client";

import React from 'react';
import {
    ShieldCheck,
    Smartphone,
    Mail,
    Key,
    UserCheck,
    AlertTriangle,
    Save
} from 'lucide-react';

export default function DualAuthenticationPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-emerald-500" />
                        Dual Authentication (MFA)
                    </h1>
                    <p className="text-slate-500 text-sm">Configure multi-factor authentication policies for your organization.</p>
                </div>
                <button className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 hover:bg-emerald-700 transition-all">
                    <Save className="w-4 h-4" /> Save Policies
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0 overflow-y-auto pb-20">

                {/* Method Configuration */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Primary Methods */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Key className="w-5 h-5 text-slate-400" /> Allowed MFA Methods
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="border border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-xl relative group cursor-pointer transition-all">
                                <div className="absolute top-4 right-4 text-emerald-600">
                                    <div className="w-5 h-5 rounded-full border-2 border-emerald-500 flex items-center justify-center">
                                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-3">
                                    <Smartphone className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-slate-800 dark:text-slate-100">Authenticator App</h4>
                                <p className="text-xs text-slate-500 mt-1">Google Auth, Microsoft Auth, Authy</p>
                            </div>

                            <div className="border border-slate-200 dark:border-slate-800 p-4 rounded-xl relative group cursor-pointer hover:border-slate-300 transition-all">
                                <div className="absolute top-4 right-4 text-slate-300">
                                    <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
                                </div>
                                <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center mb-3">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-slate-800 dark:text-slate-100">Email OTP</h4>
                                <p className="text-xs text-slate-500 mt-1">One-time code sent to email</p>
                            </div>
                        </div>
                    </div>

                    {/* Policy Rules */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-slate-400" /> Enforcement Rules
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div>
                                    <h5 className="font-bold text-sm text-slate-700 dark:text-slate-200">Enforce for Administrators</h5>
                                    <p className="text-xs text-slate-500">Require MFA for Super Admins & HR Managers</p>
                                </div>
                                <div className="w-12 h-6 bg-emerald-500 rounded-full flex items-center px-1 justify-end cursor-pointer">
                                    <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div>
                                    <h5 className="font-bold text-sm text-slate-700 dark:text-slate-200">Enforce for All Employees</h5>
                                    <p className="text-xs text-slate-500">Require MFA for everyone (Recommended)</p>
                                </div>
                                <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center px-1 justify-start cursor-pointer">
                                    <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div>
                                    <h5 className="font-bold text-sm text-slate-700 dark:text-slate-200">Remember Device</h5>
                                    <p className="text-xs text-slate-500">Skip MFA for trusted devices for 30 days</p>
                                </div>
                                <div className="w-12 h-6 bg-emerald-500 rounded-full flex items-center px-1 justify-end cursor-pointer">
                                    <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Card */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-indigo-600 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-1">MFA Adoption</h3>
                            <p className="text-indigo-200 text-xs mb-6">Percentage of users with MFA enabled</p>

                            <div className="flex items-end justify-between mb-2">
                                <span className="text-4xl font-bold">84%</span>
                                <span className="text-sm font-bold bg-indigo-500/50 px-2 py-1 rounded">+2% this week</span>
                            </div>
                            <div className="w-full bg-indigo-900/50 h-2 rounded-full overflow-hidden">
                                <div className="bg-white h-full w-[84%] rounded-full"></div>
                            </div>
                        </div>
                        <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-sm mb-4 text-slate-500 uppercase tracking-wider">At Risk Users</h3>
                        <div className="space-y-3">
                            {[
                                { name: 'Sarah Connor', role: 'HR Manager', issue: 'MFA Disabled' },
                                { name: 'John Doe', role: 'Finance', issue: 'Old Method' },
                            ].map((u, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-100 dark:border-rose-900/20">
                                    <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                                        <AlertTriangle className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{u.name}</div>
                                        <div className="text-[10px] text-rose-500 font-bold">{u.issue}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 text-xs font-bold text-indigo-600 hover:underline">View All Users</button>
                    </div>
                </div>

            </div>
        </div>
    );
}

