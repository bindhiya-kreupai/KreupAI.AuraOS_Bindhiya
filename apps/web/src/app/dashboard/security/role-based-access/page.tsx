"use client";

import React, { useState, useEffect } from 'react';
import {
    Users,
    Shield,
    Plus,
    Edit3
} from 'lucide-react';
import { RoleService } from '@/app/dashboard/security/services';

const PERMISSIONS = [
    { module: 'Employee Directory', read: true, write: true, delete: true },
    { module: 'Payroll Processing', read: true, write: true, delete: false },
    { module: 'Leave Management', read: true, write: true, delete: false },
    { module: 'System Settings', read: true, write: false, delete: false },
    { module: 'Audit Logs', read: true, write: false, delete: false },
];

export default function RoleBasedAccessPage() {
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await RoleService.getAll();
            if (result.length > 0) {
                setRoles(result);
                setSelectedRole(result[0]);
            } else {
                // Fallback mock data
                const mockRoles = [
                    { id: 1, roleName: 'Super Admin', assignedUsers: 3, description: 'Full system access', isSystem: true },
                    { id: 2, roleName: 'HR Manager', assignedUsers: 12, description: 'Access to HR & Payroll modules', isSystem: false },
                    { id: 3, roleName: 'Finance Lead', assignedUsers: 4, description: 'Payroll & Expense management', isSystem: false },
                    { id: 4, roleName: 'Employee', assignedUsers: 420, description: 'Self-service portal access only', isSystem: true },
                ];
                setRoles(mockRoles);
                setSelectedRole(mockRoles[0]);
            }
        } catch (error) {
            // Silent error handling
        } finally {
            setLoading(false);
        }
    };

    if (loading || !selectedRole) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        Role-based Access Control (RBAC)
                    </h1>
                    <p className="text-slate-500 text-sm">Manage user roles and define granular permission sets.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 hover:bg-indigo-700 transition-all">
                    <Plus className="w-4 h-4" /> Create Custom Role
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
                {/* Role List */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col overflow-hidden">
                    <h3 className="font-bold text-sm mb-4 text-slate-400 uppercase tracking-wider">System Roles</h3>
                    <div className="space-y-2 overflow-y-auto pr-2">
                        {roles.map((role) => (
                            <button
                                key={role.id}
                                onClick={() => setSelectedRole(role)}
                                className={`w-full text-left p-4 rounded-xl border transition-all group relative ${selectedRole.id === role.id
                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 ring-1 ring-indigo-200 dark:ring-indigo-800'
                                        : 'bg-slate-50 dark:bg-slate-800/50 border-transparent hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`font-bold ${selectedRole.id === role.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {role.roleName}
                                    </span>
                                    {role.isSystem && (
                                        <Shield className="w-3 h-3 text-slate-400" />
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-1">{role.description}</p>
                                <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                    <div className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                                        {role.assignedUsers} Users
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Permission Matrix */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                {selectedRole.roleName}
                                <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 font-normal">
                                    {selectedRole.isSystem ? 'System Managed' : 'Custom'}
                                </span>
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">{selectedRole.description}</p>
                        </div>
                        {!selectedRole.isSystem && (
                            <button className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors">
                                <Edit3 className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="overflow-y-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                    <th className="py-3 font-bold w-1/2">Module / Feature</th>
                                    <th className="py-3 font-bold text-center w-20">Read</th>
                                    <th className="py-3 font-bold text-center w-20">Write</th>
                                    <th className="py-3 font-bold text-center w-20">Delete</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {PERMISSIONS.map((perm, i) => (
                                    <tr key={i} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="py-4 font-medium text-slate-700 dark:text-slate-300 pl-2">{perm.module}</td>
                                        <td className="py-4 text-center">
                                            <div className={`w-8 h-5 mx-auto rounded-full flex items-center p-0.5 cursor-pointer transition-colors ${perm.read ? 'bg-emerald-500 justify-end' : 'bg-slate-200 dark:bg-slate-700 justify-start'}`}>
                                                <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                            </div>
                                        </td>
                                        <td className="py-4 text-center">
                                            <div className={`w-8 h-5 mx-auto rounded-full flex items-center p-0.5 cursor-pointer transition-colors ${perm.write ? 'bg-emerald-500 justify-end' : 'bg-slate-200 dark:bg-slate-700 justify-start'}`}>
                                                <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                            </div>
                                        </td>
                                        <td className="py-4 text-center">
                                            <div className={`w-8 h-5 mx-auto rounded-full flex items-center p-0.5 cursor-pointer transition-colors ${perm.delete ? 'bg-emerald-500 justify-end' : 'bg-slate-200 dark:bg-slate-700 justify-start'}`}>
                                                <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

