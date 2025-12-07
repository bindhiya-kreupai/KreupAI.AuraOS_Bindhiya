"use client";

import React, { useState } from 'react';
import {
    UserCog,
    Lock,
    Edit3,
    Shield,
    AlertTriangle,
    Save
} from 'lucide-react';

export default function ProfileManagementPage() {
    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <UserCog className="w-6 h-6 text-indigo-500" />
                        Profile Management
                    </h1>
                    <p className="text-slate-500 text-sm">Control which profile information employees can edit from the mobile app.</p>
                </div>
                <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none">
                    <Save className="w-4 h-4" /> Save Permissions
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                title: 'Personal Information', fields: [
                                    { name: 'First & Last Name', access: 'read-only' },
                                    { name: 'Date of Birth', access: 'read-only' },
                                    { name: 'Marital Status', access: 'editable' },
                                    { name: 'Blood Group', access: 'editable' },
                                ]
                            },
                            {
                                title: 'Contact Details', fields: [
                                    { name: 'Personal Phone', access: 'editable' },
                                    { name: 'Work Email', access: 'read-only' },
                                    { name: 'Personal Email', access: 'editable' },
                                    { name: 'Emergency Contact', access: 'editable' },
                                ]
                            },
                            {
                                title: 'Address Information', fields: [
                                    { name: 'Current Address', access: 'editable' },
                                    { name: 'Permanent Address', access: 'editable' },
                                    { name: 'City / State', access: 'editable' },
                                    { name: 'Postal Code', access: 'editable' },
                                ]
                            },
                            {
                                title: 'Financial', fields: [
                                    { name: 'Bank Account Number', access: 'read-only' },
                                    { name: 'IFSC / Swift Code', access: 'read-only' },
                                    { name: 'Tax ID (SSN/PAN)', access: 'read-only' },
                                ]
                            },
                            {
                                title: 'Employment', fields: [
                                    { name: 'Designation', access: 'read-only' },
                                    { name: 'Department', access: 'read-only' },
                                    { name: 'Date of Joining', access: 'read-only' },
                                    { name: 'Employee ID', access: 'read-only' },
                                ]
                            },
                            {
                                title: 'Documents', fields: [
                                    { name: 'Profile Picture', access: 'editable' },
                                    { name: 'Resume / CV', access: 'editable' },
                                    { name: 'ID Proofs', access: 'read-only' },
                                ]
                            },
                        ].map((section, i) => (
                            <div key={i} className="space-y-4">
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">
                                    {section.title}
                                </h3>
                                <div className="space-y-3">
                                    {section.fields.map((field, j) => (
                                        <div key={j} className="flex items-center justify-between group">
                                            <span className="text-sm text-slate-600 dark:text-slate-400">{field.name}</span>
                                            <div className="flex gap-1">
                                                {field.access === 'read-only' ? (
                                                    <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                                        <Lock className="w-3 h-3" /> Read Only
                                                    </span>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-900/20 text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1">
                                                            <Edit3 className="w-3 h-3" /> Editable
                                                        </span>
                                                        <div className="relative inline-flex items-center cursor-pointer">
                                                            <input type="checkbox" className="sr-only peer" defaultChecked={true} />
                                                            <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-xl flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-amber-800 dark:text-amber-200">Security Note</h4>
                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 max-w-2xl">
                                Changes to sensitive fields like Bank Account Numbers or Tax IDs should trigger an approval workflow even if marked as editable here. Ensure workflows are configured in the <span className="font-bold underline cursor-pointer">Workflow Engine</span>.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
