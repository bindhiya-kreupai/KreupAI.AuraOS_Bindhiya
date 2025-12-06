"use client";

import React, { useState } from 'react';
import {
    DoorOpen,
    Calendar,
    CheckSquare,
    AlertCircle,
    UserX,
    Laptop,
    CreditCard,
    Key,
    FileSignature,
    ChevronRight,
    Clock,
    MoreHorizontal
} from 'lucide-react';

// --- MOCK DATA ---

interface ExitTask {
    id: string;
    title: string;
    department: 'IT' | 'Finance' | 'Admin' | 'HR';
    status: 'Pending' | 'Completed' | 'Waived';
    assignee?: string;
}

interface ExitingEmployee {
    id: string;
    name: string;
    role: string;
    department: string;
    lastWorkingDay: string;
    daysLeft: number;
    avatar: string;
    status: 'Resignation Submitted' | 'Notice Period' | 'Clearance Pending' | 'F&F Processing' | 'Released';
    tasks: ExitTask[];
}

const EXITING_EMPLOYEES: ExitingEmployee[] = [
    {
        id: '1',
        name: 'James Wilson',
        role: 'Sr. Product Manager',
        department: 'Product',
        lastWorkingDay: 'Oct 30, 2024',
        daysLeft: 5,
        avatar: 'https://i.pravatar.cc/150?u=EMP010',
        status: 'Clearance Pending',
        tasks: [
            { id: 't1', title: 'Return MacBook Pro', department: 'IT', status: 'Pending' },
            { id: 't2', title: 'Clear Travel Advances', department: 'Finance', status: 'Completed' },
            { id: 't3', title: 'Handover Access Card', department: 'Admin', status: 'Pending' },
            { id: 't4', title: 'Exit Interview', department: 'HR', status: 'Pending' }
        ]
    },
    {
        id: '2',
        name: 'Linda Martinez',
        role: 'UX Designer',
        department: 'Design',
        lastWorkingDay: 'Nov 15, 2024',
        daysLeft: 21,
        avatar: 'https://i.pravatar.cc/150?u=EMP011',
        status: 'Notice Period',
        tasks: [
            { id: 't5', title: 'Return Monitor', department: 'IT', status: 'Pending' },
            { id: 't6', title: 'Knowledge Transfer', department: 'HR', status: 'Pending' }
        ]
    }
];

export default function OffboardingPage() {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(EXITING_EMPLOYEES[0].id);

    const selectedEmployee = EXITING_EMPLOYEES.find(e => e.id === selectedEmployeeId) || EXITING_EMPLOYEES[0];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Resignation Submitted': return 'bg-amber-100 text-amber-700';
            case 'Notice Period': return 'bg-blue-100 text-blue-700';
            case 'Clearance Pending': return 'bg-purple-100 text-purple-700';
            case 'Released': return 'bg-emerald-100 text-emerald-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getDeptIcon = (dept: string) => {
        switch (dept) {
            case 'IT': return <Laptop className="w-4 h-4" />;
            case 'Finance': return <CreditCard className="w-4 h-4" />;
            case 'Admin': return <Key className="w-4 h-4" />;
            default: return <FileSignature className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <DoorOpen className="w-6 h-6 text-rose-500" />
                        Offboarding & Exit
                    </h1>
                    <p className="text-silver-mist text-sm">Manage resignations, clearances, and full & final settlements.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20">
                    <UserX className="w-4 h-4" /> Initiate Separation
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* List of Exiting Employees */}
                <div className="lg:col-span-1 bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden flex flex-col h-[600px]">
                    <div className="p-4 border-b border-cloud dark:border-nebula-purple/20">
                        <h3 className="font-bold text-ink-black dark:text-pearl">Exiting Employees</h3>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-2">
                        {EXITING_EMPLOYEES.map(emp => (
                            <div
                                key={emp.id}
                                onClick={() => setSelectedEmployeeId(emp.id)}
                                className={`p-3 rounded-xl cursor-pointer transition-all border ${selectedEmployeeId === emp.id
                                        ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'
                                        : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-deep-cosmos/50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img src={emp.avatar} className="w-10 h-10 rounded-full object-cover" />
                                        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-0.5">
                                            <div className="w-3 h-3 bg-amber-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-sm text-ink-black dark:text-pearl truncate">{emp.name}</div>
                                        <div className="text-xs text-silver-mist truncate">{emp.role}</div>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 text-silver-mist ${selectedEmployeeId === emp.id ? 'opacity-100' : 'opacity-0'}`} />
                                </div>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusColor(emp.status)}`}>
                                        {emp.status}
                                    </span>
                                    <span className="text-[10px] text-rose-500 font-medium flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {emp.daysLeft} days left
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Details View */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Employee Card */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl -mr-10 -mt-10" />

                        <div className="flex justify-between items-start relative z-10">
                            <div className="flex items-center gap-4">
                                <img src={selectedEmployee.avatar} className="w-16 h-16 rounded-2xl object-cover shadow-sm bg-slate-200" />
                                <div>
                                    <h2 className="text-xl font-bold text-ink-black dark:text-pearl">{selectedEmployee.name}</h2>
                                    <div className="text-sm text-silver-mist flex items-center gap-2 mt-1">
                                        <span>{selectedEmployee.role}</span>
                                        <span>•</span>
                                        <span>{selectedEmployee.department}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-silver-mist uppercase tracking-wider font-bold">Last Working Day</div>
                                <div className="text-lg font-bold text-rose-500">{selectedEmployee.lastWorkingDay}</div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-8">
                            <div className="flex justify-between text-xs font-bold text-silver-mist mb-2">
                                <span>Offboarding Progress</span>
                                <span>50%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-rose-400 to-amber-400 w-1/2 rounded-full" />
                            </div>
                        </div>
                    </div>

                    {/* Clearance Checklist */}
                    <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-cloud dark:border-nebula-purple/20 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                            <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                                <CheckSquare className="w-4 h-4 text-emerald-500" />
                                Clearance Checklist
                            </h3>
                            <button className="text-xs font-bold text-rose-500 hover:underline">Download FnF Statement</button>
                        </div>

                        <div className="divide-y divide-cloud dark:divide-nebula-purple/20">
                            {selectedEmployee.tasks.map(task => (
                                <div key={task.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-deep-cosmos/50 transition-colors group">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${task.status === 'Completed'
                                            ? 'bg-emerald-100 text-emerald-600'
                                            : 'bg-slate-100 text-slate-500'
                                        }`}>
                                        {getDeptIcon(task.department)}
                                    </div>

                                    <div className="flex-1">
                                        <div className={`text-sm font-medium ${task.status === 'Completed' ? 'line-through text-silver-mist' : 'text-ink-black dark:text-pearl'}`}>
                                            {task.title}
                                        </div>
                                        <div className="text-[10px] text-silver-mist uppercase tracking-wide font-bold mt-0.5">
                                            {task.department} Department
                                        </div>
                                    </div>

                                    <div>
                                        {task.status === 'Pending' && (
                                            <button className="px-3 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors">
                                                Mark Clear
                                            </button>
                                        )}
                                        {task.status === 'Completed' && (
                                            <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
                                                <CheckSquare className="w-3 h-3" /> Cleared
                                            </div>
                                        )}
                                    </div>

                                    <button className="p-1 text-silver-mist hover:bg-slate-200 rounded opacity-0 group-hover:opacity-100 transition-all">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* FnF Summary Preview (Mock) */}
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border-t border-amber-100 dark:border-amber-900/30 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            <div className="flex-1">
                                <div className="text-xs font-bold text-amber-800 dark:text-amber-200">Pending Actions</div>
                                <div className="text-[10px] text-amber-700 dark:text-amber-300">2 Clearance items remaining. Full & Final settlement is blocked.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
