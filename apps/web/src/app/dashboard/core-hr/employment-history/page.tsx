"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    History,
    Calendar,
    ArrowUpCircle,
    ArrowDownCircle,
    MapPin,
    Briefcase,
    UserMinus,
    RefreshCw,
    DollarSign,
    FileText,
    type LucideIcon
} from 'lucide-react';
import { EmploymentHistoryService } from '../services';

interface ChangeTypeConfig {
    label: string;
    icon: LucideIcon;
    borderColor: string;
    textColor: string;
}

const changeTypeMap: Record<string, ChangeTypeConfig> = {
    PROMOTION: {
        label: 'Promotion',
        icon: ArrowUpCircle,
        borderColor: 'border-emerald-500',
        textColor: 'text-emerald-600',
    },
    promotion: {
        label: 'Promotion',
        icon: ArrowUpCircle,
        borderColor: 'border-emerald-500',
        textColor: 'text-emerald-600',
    },
    TRANSFER: {
        label: 'Transfer',
        icon: MapPin,
        borderColor: 'border-indigo-500',
        textColor: 'text-indigo-600',
    },
    transfer: {
        label: 'Transfer',
        icon: MapPin,
        borderColor: 'border-indigo-500',
        textColor: 'text-indigo-600',
    },
    LATERAL_MOVE: {
        label: 'Lateral Move',
        icon: RefreshCw,
        borderColor: 'border-blue-500',
        textColor: 'text-blue-600',
    },
    NEW_HIRE: {
        label: 'New Hire',
        icon: Briefcase,
        borderColor: 'border-slate-400',
        textColor: 'text-slate-500',
    },
    hire: {
        label: 'New Hire',
        icon: Briefcase,
        borderColor: 'border-slate-400',
        textColor: 'text-slate-500',
    },
    DEMOTION: {
        label: 'Demotion',
        icon: ArrowDownCircle,
        borderColor: 'border-amber-500',
        textColor: 'text-amber-600',
    },
    demotion: {
        label: 'Demotion',
        icon: ArrowDownCircle,
        borderColor: 'border-amber-500',
        textColor: 'text-amber-600',
    },
    TERMINATION: {
        label: 'Termination',
        icon: UserMinus,
        borderColor: 'border-red-500',
        textColor: 'text-red-600',
    },
    termination: {
        label: 'Termination',
        icon: UserMinus,
        borderColor: 'border-red-500',
        textColor: 'text-red-600',
    },
    REHIRE: {
        label: 'Rehire',
        icon: RefreshCw,
        borderColor: 'border-teal-500',
        textColor: 'text-teal-600',
    },
    SALARY_CHANGE: {
        label: 'Salary Change',
        icon: DollarSign,
        borderColor: 'border-violet-500',
        textColor: 'text-violet-600',
    },
    salary_change: {
        label: 'Salary Change',
        icon: DollarSign,
        borderColor: 'border-violet-500',
        textColor: 'text-violet-600',
    },
    TITLE_CHANGE: {
        label: 'Title Change',
        icon: FileText,
        borderColor: 'border-cyan-500',
        textColor: 'text-cyan-600',
    },
    title_change: {
        label: 'Title Change',
        icon: FileText,
        borderColor: 'border-cyan-500',
        textColor: 'text-cyan-600',
    },
};

const defaultConfig: ChangeTypeConfig = {
    label: 'Change',
    icon: History,
    borderColor: 'border-slate-400',
    textColor: 'text-slate-500',
};

function getConfig(changeType: string): ChangeTypeConfig {
    return changeTypeMap[changeType] || defaultConfig;
}

function formatDate(dateStr: string | Date): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function buildDescription(record: any): string {
    const parts: string[] = [];

    if (record.reason) {
        parts.push(record.reason);
    }

    if (record.previousDepartment && record.newDepartment && record.previousDepartment.name !== record.newDepartment.name) {
        parts.push(`Department: ${record.previousDepartment.name} -> ${record.newDepartment.name}`);
    } else if (record.newDepartment) {
        parts.push(`Department: ${record.newDepartment.name}`);
    }

    if (record.previousJobProfile && record.newJobProfile && record.previousJobProfile.title !== record.newJobProfile.title) {
        parts.push(`Role: ${record.previousJobProfile.title} -> ${record.newJobProfile.title}`);
    } else if (record.newJobProfile) {
        parts.push(`Role: ${record.newJobProfile.title}`);
    }

    if (record.previousLocation && record.newLocation && record.previousLocation.name !== record.newLocation.name) {
        parts.push(`Location: ${record.previousLocation.name} -> ${record.newLocation.name}`);
    } else if (record.newLocation) {
        parts.push(`Location: ${record.newLocation.name}`);
    }

    if (record.previousGrade && record.newGrade && record.previousGrade.name !== record.newGrade.name) {
        parts.push(`Grade: ${record.previousGrade.name} -> ${record.newGrade.name}`);
    }

    if (record.notes) {
        parts.push(record.notes);
    }

    return parts.length > 0 ? parts.join('. ') : 'No additional details.';
}

function getDisplayTitle(record: any): string {
    // Show the new job profile title if available, else fall back to changeType label
    if (record.newJobProfile?.title) {
        return record.newJobProfile.title;
    }
    if (record.previousJobProfile?.title) {
        return record.previousJobProfile.title;
    }
    return getConfig(record.changeType).label;
}

export default function EmploymentHistoryPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const data = await EmploymentHistoryService.getAllHistory();
            setHistory(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Group history by employeeId
    const groupedHistory = useMemo(() => {
        const groups: Record<string, { employeeId: string; employeeName: string; records: any[] }> = {};
        history.forEach(record => {
            const empId = record.employeeId;
            if (!groups[empId]) {
                groups[empId] = {
                    employeeId: empId,
                    employeeName: record.employeeName || record.employee
                        ? `${record.employee?.firstName || ''} ${record.employee?.lastName || ''}`.trim()
                        : 'Unknown Employee',
                    records: [],
                };
            }
            groups[empId].records.push(record);
        });
        // Sort records within each group by effectiveDate descending
        Object.values(groups).forEach(group => {
            group.records.sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());
        });
        return Object.values(groups);
    }, [history]);

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <History className="w-6 h-6 text-indigo-500" />
                        Employment History
                    </h1>
                    <p className="text-slate-500 text-sm">Timeline of role changes, promotions, and transfers.</p>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
            )}

            {/* Empty State */}
            {!loading && history.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <History className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No employment history found</p>
                    <p className="text-sm">Data will appear here once records are added.</p>
                </div>
            )}

            {/* History Timeline */}
            {!loading && history.length > 0 && (
                <div className="overflow-y-auto pb-20 space-y-8">
                    {groupedHistory.map(group => (
                        <div key={group.employeeId} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 max-w-4xl mx-auto w-full">
                            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                        {group.employeeName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">{group.employeeName}</h2>
                                    <div className="text-slate-500">
                                        {group.records[0]?.employee?.employeeCode || group.employeeId.slice(0, 8)}
                                        {group.records[0]?.newDepartment?.name && ` \u2022 ${group.records[0].newDepartment.name}`}
                                    </div>
                                </div>
                            </div>

                            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-12">
                                {group.records.map((record, i) => {
                                    const config = getConfig(record.changeType);
                                    const IconComponent = config.icon;
                                    return (
                                        <div key={record.id || i} className="relative pl-8">
                                            <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 ${config.borderColor} ${config.textColor} z-10`}></div>

                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                                        {getDisplayTitle(record)}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                                        <Calendar className="w-4 h-4" /> {formatDate(record.effectiveDate)}
                                                        <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                                                        <span className={`font-bold ${config.textColor}`}>{config.label}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                                        {buildDescription(record)}
                                                    </p>
                                                </div>
                                                <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-800 ${config.textColor}`}>
                                                    <IconComponent className="w-6 h-6" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
