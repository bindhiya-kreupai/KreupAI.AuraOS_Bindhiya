"use client";

import React, { useState, useEffect } from 'react';
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
    MoreHorizontal,
    Loader2
} from 'lucide-react';
import { OffboardingInstanceService } from '../services';

interface ClearanceItem {
    id: string;
    department: string;
    description: string;
    status: string;
    clearedBy?: string | null;
    clearedAt?: string | null;
    notes?: string | null;
}

interface ExitingEmployee {
    id: string;
    employeeName: string;
    positionTitle: string;
    departmentName: string;
    lastWorkingDate: string;
    status: string;
    progress: number;
    clearances: ClearanceItem[];
    employeeEmail?: string;
}

export default function OffboardingPage() {
    const [employees, setEmployees] = useState<ExitingEmployee[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const instances = await OffboardingInstanceService.getInstances();
                const mapped: ExitingEmployee[] = instances.map((inst: any) => ({
                    id: inst.id,
                    employeeName: inst.employeeName || 'Unknown Employee',
                    positionTitle: inst.positionTitle || inst.offboardingType || '',
                    departmentName: inst.departmentName || '',
                    lastWorkingDate: inst.lastWorkingDate
                        ? new Date(inst.lastWorkingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '',
                    status: inst.status || 'pending',
                    progress: inst.progress || 0,
                    clearances: (inst.clearances || []).map((c: any) => ({
                        id: c.id,
                        department: c.department || '',
                        description: c.description || '',
                        status: c.status || 'pending',
                        clearedBy: c.clearedBy,
                        clearedAt: c.clearedAt,
                        notes: c.notes,
                    })),
                    employeeEmail: inst.employeeEmail || '',
                }));
                setEmployees(mapped);
                if (mapped.length > 0) {
                    setSelectedEmployeeId(mapped[0].id);
                }
            } catch (error: any) {
                console.error('Error fetching offboarding instances:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-silver-mist font-medium">Loading offboarding data...</p>
                </div>
            </div>
        );
    }

    const selectedEmployee = employees.find(e => e.id === selectedEmployeeId) || employees[0];

    const getDaysLeft = (lastWorkingDate: string) => {
        const lwd = new Date(lastWorkingDate);
        const now = new Date();
        const diff = Math.ceil((lwd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return Math.max(0, diff);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-100 text-amber-700';
            case 'in_progress': return 'bg-blue-100 text-blue-700';
            case 'approved': return 'bg-purple-100 text-purple-700';
            case 'completed': return 'bg-emerald-100 text-emerald-700';
            case 'cancelled': return 'bg-slate-100 text-slate-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'Resignation Submitted';
            case 'in_progress': return 'Notice Period';
            case 'approved': return 'Clearance Pending';
            case 'completed': return 'Released';
            case 'cancelled': return 'Cancelled';
            default: return status;
        }
    };

    const getDeptIcon = (dept: string) => {
        const d = dept.toLowerCase();
        if (d.includes('it') || d.includes('tech')) return <Laptop className="w-4 h-4" />;
        if (d.includes('finance') || d.includes('account')) return <CreditCard className="w-4 h-4" />;
        if (d.includes('admin') || d.includes('facility')) return <Key className="w-4 h-4" />;
        return <FileSignature className="w-4 h-4" />;
    };

    const getClearanceStatusLabel = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved': return 'Cleared';
            case 'pending': return 'Pending';
            case 'rejected': return 'Rejected';
            default: return status;
        }
    };

    const pendingClearances = selectedEmployee?.clearances.filter(c => c.status.toLowerCase() !== 'approved') || [];

    return (
        <div className="space-y-4 pb-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
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

            {employees.length === 0 ? (
                <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm p-12 text-center">
                    <DoorOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-ink-black dark:text-pearl mb-2">No Active Offboarding</h3>
                    <p className="text-sm text-silver-mist">There are no employees currently going through the offboarding process.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    {/* List of Exiting Employees */}
                    <div className="lg:col-span-1 bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden flex flex-col h-[600px]">
                        <div className="p-4 border-b border-cloud dark:border-nebula-purple/20">
                            <h3 className="font-bold text-ink-black dark:text-pearl">Exiting Employees</h3>
                        </div>
                        <div className="overflow-y-auto flex-1 p-2 space-y-2">
                            {employees.map(emp => (
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
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-amber-400 flex items-center justify-center text-white font-bold text-sm">
                                                {emp.employeeName.charAt(0)}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-0.5">
                                                <div className="w-3 h-3 bg-amber-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-sm text-ink-black dark:text-pearl truncate">{emp.employeeName}</div>
                                            <div className="text-xs text-silver-mist truncate">{emp.positionTitle}</div>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 text-silver-mist ${selectedEmployeeId === emp.id ? 'opacity-100' : 'opacity-0'}`} />
                                    </div>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusColor(emp.status)}`}>
                                            {getStatusLabel(emp.status)}
                                        </span>
                                        <span className="text-[10px] text-rose-500 font-medium flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {getDaysLeft(emp.lastWorkingDate)} days left
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Details View */}
                    {selectedEmployee && (
                        <div className="lg:col-span-2 space-y-4">
                            {/* Employee Card */}
                            <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl -mr-10 -mt-10" />

                                <div className="flex justify-between items-start relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-400 to-amber-400 flex items-center justify-center text-white font-bold text-xl shadow-sm">
                                            {selectedEmployee.employeeName.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-ink-black dark:text-pearl">{selectedEmployee.employeeName}</h2>
                                            <div className="text-sm text-silver-mist flex items-center gap-2 mt-1">
                                                <span>{selectedEmployee.positionTitle}</span>
                                                {selectedEmployee.departmentName && (
                                                    <>
                                                        <span>-</span>
                                                        <span>{selectedEmployee.departmentName}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-silver-mist uppercase tracking-wider font-bold">Last Working Day</div>
                                        <div className="text-lg font-bold text-rose-500">{selectedEmployee.lastWorkingDate}</div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-8">
                                    <div className="flex justify-between text-xs font-bold text-silver-mist mb-2">
                                        <span>Offboarding Progress</span>
                                        <span>{selectedEmployee.progress}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-rose-400 to-amber-400 rounded-full transition-all duration-500"
                                            style={{ width: `${selectedEmployee.progress}%` }}
                                        />
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

                                {selectedEmployee.clearances.length === 0 ? (
                                    <div className="p-8 text-center text-sm text-silver-mist">
                                        No clearance items found for this employee.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-cloud dark:divide-nebula-purple/20">
                                        {selectedEmployee.clearances.map(task => {
                                            const isCleared = task.status.toLowerCase() === 'approved';
                                            return (
                                                <div key={task.id} className="p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-deep-cosmos/50 transition-colors group">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isCleared
                                                            ? 'bg-emerald-100 text-emerald-600'
                                                            : 'bg-slate-100 text-slate-500'
                                                        }`}>
                                                        {getDeptIcon(task.department)}
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className={`text-sm font-medium ${isCleared ? 'line-through text-silver-mist' : 'text-ink-black dark:text-pearl'}`}>
                                                            {task.description}
                                                        </div>
                                                        <div className="text-[10px] text-silver-mist uppercase tracking-wide font-bold mt-0.5">
                                                            {task.department} Department
                                                        </div>
                                                    </div>

                                                    <div>
                                                        {!isCleared && (
                                                            <button className="px-3 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors">
                                                                Mark Clear
                                                            </button>
                                                        )}
                                                        {isCleared && (
                                                            <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
                                                                <CheckSquare className="w-3 h-3" /> {getClearanceStatusLabel(task.status)}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <button className="p-1 text-silver-mist hover:bg-slate-200 rounded opacity-0 group-hover:opacity-100 transition-all">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Pending Actions */}
                                {pendingClearances.length > 0 && (
                                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border-t border-amber-100 dark:border-amber-900/30 flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 text-amber-500" />
                                        <div className="flex-1">
                                            <div className="text-xs font-bold text-amber-800 dark:text-amber-200">Pending Actions</div>
                                            <div className="text-[10px] text-amber-700 dark:text-amber-300">
                                                {pendingClearances.length} Clearance item{pendingClearances.length !== 1 ? 's' : ''} remaining. Full & Final settlement is blocked.
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

