"use client";

import React from 'react';
import {
    Award,
    AlertCircle,
    CheckCircle,
    FileText,
    GraduationCap,
    UploadCloud
} from 'lucide-react';

export default function CredentialingPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Award className="w-6 h-6 text-indigo-500" />
                        Credentialing Manager
                    </h1>
                    <p className="text-slate-500 text-sm">Track medical licenses, CME credits, and certifications.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl text-sm font-bold border border-indigo-200 dark:border-indigo-800">
                        <UploadCloud className="w-4 h-4" /> Bulk Upload
                    </button>
                    <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                        + Add Credential
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Expiring Licenses - Critical Alert */}
                <div className="lg:col-span-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-800 flex items-center justify-center text-rose-500 dark:text-rose-300">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-rose-700 dark:text-rose-400">Action Required: 5 Expiring Licenses</h3>
                            <p className="text-xs text-rose-600 dark:text-rose-500">Dr. Smith, Nurse Joy, and 3 others have licenses expiring within 30 days.</p>
                        </div>
                    </div>
                    <button className="px-4 py-2 bg-white dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-bold shadow-sm hover:shadow transition-all">
                        View List
                    </button>
                </div>

                {/* Staff List */}
                <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
                    {[
                        { name: 'Dr. Sarah Connor', role: 'Chief Surgeon', license: 'MD-29384', status: 'Valid', cme: 45, req: 50 },
                        { name: 'Dr. Gregory House', role: 'Diagnostician', license: 'MD-10293', status: 'Expiring Soon', cme: 48, req: 50 },
                        { name: 'Nurse Jackie', role: 'Head Nurse', license: 'RN-91823', status: 'Valid', cme: 20, req: 30 },
                        { name: 'Dr. Sheldon Cooper', role: 'Theoretical Physicist', license: 'PHD-11111', status: 'Expired', cme: 0, req: 0, na: true },
                    ].map((staff, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-all">
                            <div className="flex items-center gap-4 mb-4 md:mb-0">
                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                                    {staff.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{staff.name}</h3>
                                    <div className="text-xs text-slate-500 font-bold mb-1">{staff.role}</div>
                                    <div className="text-xs text-slate-400 flex items-center gap-2">
                                        <FileText className="w-3 h-3" /> License: <span className="font-mono">{staff.license}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                {!staff.na && (
                                    <div className="text-center">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">CME Credits</div>
                                        <div className="relative w-12 h-12 flex items-center justify-center">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                                                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent"
                                                    className={staff.cme >= staff.req ? "text-emerald-500" : "text-amber-500"}
                                                    strokeDasharray={125.6}
                                                    strokeDashoffset={125.6 - (125.6 * (staff.cme / staff.req))}
                                                />
                                            </svg>
                                            <span className="absolute text-xs font-bold text-slate-600 dark:text-slate-400">
                                                {Math.round((staff.cme / staff.req) * 100)}%
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                        ${staff.status === 'Valid' ? 'bg-emerald-100 text-emerald-600' :
                                            staff.status === 'Expiring Soon' ? 'bg-amber-100 text-amber-600' :
                                                'bg-rose-100 text-rose-600'}
                                    `}>
                                        {staff.status}
                                    </span>
                                    <button className="text-xs font-bold text-indigo-500 hover:underline">Manage Docs</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Requirements Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-indigo-500" /> Requirements
                        </h3>
                        <div className="space-y-4">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <h4 className="font-bold text-sm mb-1">Medical Doctor (MD)</h4>
                                <ul className="text-xs text-slate-500 space-y-1 list-disc pl-4">
                                    <li>State Medical License (2 years)</li>
                                    <li>DEA Registration (3 years)</li>
                                    <li>50 CME Credits / Year</li>
                                </ul>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <h4 className="font-bold text-sm mb-1">Registered Nurse (RN)</h4>
                                <ul className="text-xs text-slate-500 space-y-1 list-disc pl-4">
                                    <li>State Nursing License (2 years)</li>
                                    <li>BLS/ACLS Certification (2 years)</li>
                                    <li>30 CE Contact Hours / Year</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
