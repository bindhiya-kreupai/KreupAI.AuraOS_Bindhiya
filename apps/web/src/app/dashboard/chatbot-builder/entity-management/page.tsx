"use client";

import React from 'react';
import {
    Database,
    Plus,
    Search,
    Edit2,
    Trash2
} from 'lucide-react';

export default function EntityManagementPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Database className="w-6 h-6 text-indigo-500" />
                        Entity Management
                    </h1>
                    <p className="text-slate-500 text-sm">Define business objects for the bot to recognize.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all">
                    <Plus className="w-4 h-4" /> New Entity
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search entities..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Entity Name</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Values</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {[
                                { name: '@LeaveType', type: 'List', values: ['Sick', 'Vacation', 'Casual'] },
                                { name: '@Department', type: 'List', values: ['HR', 'IT', 'Finance', 'Sales'] },
                                { name: '@DateRange', type: 'System', values: ['Today', 'Tomorrow', 'Next Week'] },
                                { name: '@EmployeeID', type: 'Regex', values: ['EMP-[0-9]{4}'] },
                            ].map((entity, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400">
                                        {entity.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500">
                                            {entity.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 truncate max-w-xs block">
                                        {entity.values.join(', ')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg text-indigo-500">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-rose-500">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
