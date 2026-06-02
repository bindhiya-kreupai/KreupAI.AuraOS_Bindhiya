"use client";

import React, { useState } from 'react';
import {
    Shield,
    Plus,
    Save,
    Check,
    X,
    ChevronDown,
    Users,
    Lock,
    Eye,
    FileEdit,
    Trash2,
    CheckSquare,
    Download
} from 'lucide-react';

// --- MOCK DATA ---

const ROLES = ['Super Admin', 'HR Admin', 'Manager', 'Employee', 'Recruiter'];

const MODULES = [
    'Employee Records',
    'Leave',
    'Attendance',
    'Payroll',
    'Recruitment',
    'Performance',
    'Benefits',
    'Reports',
];

const PERMISSION_TYPES = ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Export'];

const PERMISSION_ICONS: Record<string, any> = {
    View: Eye,
    Create: Plus,
    Edit: FileEdit,
    Delete: Trash2,
    Approve: CheckSquare,
    Export: Download,
};

// Default permissions per role
const DEFAULT_PERMISSIONS: Record<string, Record<string, boolean[]>> = {
    'Super Admin': {
        'Employee Records': [true, true, true, true, true, true],
        Leave: [true, true, true, true, true, true],
        Attendance: [true, true, true, true, true, true],
        Payroll: [true, true, true, true, true, true],
        Recruitment: [true, true, true, true, true, true],
        Performance: [true, true, true, true, true, true],
        Benefits: [true, true, true, true, true, true],
        Reports: [true, true, true, true, true, true],
    },
    'HR Admin': {
        'Employee Records': [true, true, true, true, true, true],
        Leave: [true, true, true, false, true, true],
        Attendance: [true, true, true, false, true, true],
        Payroll: [true, true, true, false, true, true],
        Recruitment: [true, true, true, true, true, true],
        Performance: [true, true, true, false, true, true],
        Benefits: [true, true, true, true, true, true],
        Reports: [true, true, false, false, false, true],
    },
    Manager: {
        'Employee Records': [true, false, true, false, false, true],
        Leave: [true, false, false, false, true, true],
        Attendance: [true, false, true, false, true, true],
        Payroll: [false, false, false, false, false, false],
        Recruitment: [true, true, true, false, true, false],
        Performance: [true, true, true, false, true, true],
        Benefits: [true, false, false, false, false, false],
        Reports: [true, false, false, false, false, true],
    },
    Employee: {
        'Employee Records': [true, false, false, false, false, false],
        Leave: [true, true, true, true, false, false],
        Attendance: [true, false, false, false, false, false],
        Payroll: [true, false, false, false, false, false],
        Recruitment: [false, false, false, false, false, false],
        Performance: [true, false, false, false, false, false],
        Benefits: [true, false, false, false, false, false],
        Reports: [false, false, false, false, false, false],
    },
    Recruiter: {
        'Employee Records': [true, false, false, false, false, false],
        Leave: [true, true, true, true, false, false],
        Attendance: [true, false, false, false, false, false],
        Payroll: [false, false, false, false, false, false],
        Recruitment: [true, true, true, true, true, true],
        Performance: [true, false, false, false, false, false],
        Benefits: [false, false, false, false, false, false],
        Reports: [true, false, false, false, false, true],
    },
};

export default function PermissionsPage() {
    const [selectedRole, setSelectedRole] = useState('Super Admin');
    const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);
    const [showDropdown, setShowDropdown] = useState(false);
    const [saved, setSaved] = useState(false);

    const togglePermission = (module: string, permIndex: number) => {
        setPermissions(prev => {
            const updated = { ...prev };
            const rolePerms = { ...updated[selectedRole] };
            const modulePerms = [...rolePerms[module]];
            modulePerms[permIndex] = !modulePerms[permIndex];
            rolePerms[module] = modulePerms;
            updated[selectedRole] = rolePerms;
            return updated;
        });
        setSaved(false);
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Shield className="w-6 h-6 text-celestial-indigo" />
                        Permission Matrix
                    </h1>
                    <p className="text-silver-mist text-sm">Configure module-level access permissions for each role.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-deep-cosmos transition-colors flex items-center gap-2 text-ink-black dark:text-pearl">
                        <Plus className="w-4 h-4" />
                        Add Custom Role
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors flex items-center gap-2"
                    >
                        {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {saved ? 'Saved!' : 'Save Permissions'}
                    </button>
                </div>
            </div>

            {/* Role Selector */}
            <div className="relative w-64">
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-lg text-sm font-medium text-ink-black dark:text-pearl flex items-center justify-between hover:bg-gray-50 dark:hover:bg-deep-cosmos transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-celestial-indigo" />
                        {selectedRole}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-silver-mist transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-lg shadow-lg z-10 overflow-hidden">
                        {ROLES.map(role => (
                            <button
                                key={role}
                                onClick={() => { setSelectedRole(role); setShowDropdown(false); }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-deep-cosmos transition-colors ${role === selectedRole ? 'bg-gray-50 dark:bg-deep-cosmos text-celestial-indigo font-medium' : 'text-ink-black dark:text-pearl'}`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Permission Matrix Table */}
            <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/30 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-cloud dark:border-nebula-purple/30">
                                <th className="text-left py-3 px-4 font-semibold text-ink-black dark:text-pearl w-48">
                                    <div className="flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-celestial-indigo" />
                                        Module
                                    </div>
                                </th>
                                {PERMISSION_TYPES.map(perm => {
                                    const Icon = PERMISSION_ICONS[perm];
                                    return (
                                        <th key={perm} className="text-center py-3 px-3 font-semibold text-ink-black dark:text-pearl">
                                            <div className="flex flex-col items-center gap-1">
                                                <Icon className="w-3.5 h-3.5 text-silver-mist" />
                                                <span className="text-xs">{perm}</span>
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {MODULES.map(module => (
                                <tr key={module} className="border-b border-cloud dark:border-nebula-purple/30 last:border-0 hover:bg-gray-50 dark:hover:bg-deep-cosmos/50 transition-colors">
                                    <td className="py-3 px-4 font-medium text-ink-black dark:text-pearl">{module}</td>
                                    {permissions[selectedRole][module].map((enabled, idx) => (
                                        <td key={idx} className="py-3 px-3 text-center">
                                            <button
                                                onClick={() => togglePermission(module, idx)}
                                                className={`w-8 h-5 rounded-full relative transition-colors ${enabled ? 'bg-celestial-indigo' : 'bg-gray-200 dark:bg-gray-700'}`}
                                            >
                                                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${enabled ? 'left-3.5' : 'left-0.5'}`} />
                                            </button>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-xs text-silver-mist">
                <div className="flex items-center gap-1.5">
                    <div className="w-6 h-3 rounded-full bg-celestial-indigo" />
                    <span>Enabled</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-6 h-3 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <span>Disabled</span>
                </div>
            </div>
        </div>
    );
}

