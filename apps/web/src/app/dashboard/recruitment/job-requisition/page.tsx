"use client";

import React, { useState, useEffect } from 'react';
import {
    Briefcase,
    Plus,
    Users,
    Clock,
    CheckCircle2,
    AlertCircle,
    MoreHorizontal,
    Search,
    Filter,
    ArrowUpRight,
    MapPin,
    DollarSign,
    Calendar
} from 'lucide-react';
import { JobRequisitionService } from '../services';

// --- MOCK DATA ---

interface JobRequisition {
    id: string;
    title: string;
    department: string;
    location: string;
    type: 'Full-time' | 'Contract' | 'Internship';
    salaryRange: string;
    status: 'Draft' | 'Pending Approval' | 'Open' | 'Frozen' | 'Closed';
    priority: 'High' | 'Medium' | 'Low';
    hiringManager: string;
    postedDate?: string;
    stats: {
        applied: number;
        screening: number;
        interview: number;
        offer: number;
    };
}

const REQUISITIONS: JobRequisition[] = [
    {
        id: 'REQ-101',
        title: 'Senior Frontend Engineer',
        department: 'Engineering',
        location: 'Remote (US)',
        type: 'Full-time',
        salaryRange: '$140k - $160k',
        status: 'Open',
        priority: 'High',
        hiringManager: 'Sarah Jenkins',
        postedDate: '2 days ago',
        stats: { applied: 45, screening: 12, interview: 4, offer: 0 }
    },
    {
        id: 'REQ-102',
        title: 'Product Marketing Manager',
        department: 'Marketing',
        location: 'New York, NY',
        type: 'Full-time',
        salaryRange: '$110k - $130k',
        status: 'Open',
        priority: 'Medium',
        hiringManager: 'David Chen',
        postedDate: '1 week ago',
        stats: { applied: 89, screening: 24, interview: 8, offer: 1 }
    },
    {
        id: 'REQ-103',
        title: 'UX Researcher',
        department: 'Design',
        location: 'London, UK',
        type: 'Contract',
        salaryRange: '£60k - £80k',
        status: 'Pending Approval',
        priority: 'Medium',
        hiringManager: 'Linda Martinez',
        stats: { applied: 0, screening: 0, interview: 0, offer: 0 }
    },
    {
        id: 'REQ-104',
        title: 'Sales Development Rep',
        department: 'Sales',
        location: 'San Francisco, CA',
        type: 'Full-time',
        salaryRange: '$60k - $80k + Comm',
        status: 'Draft',
        priority: 'Low',
        hiringManager: 'Mike Ross',
        stats: { applied: 0, screening: 0, interview: 0, offer: 0 }
    }
];

export default function JobRequisitionsPage() {
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [requisitions, setRequisitions] = useState<JobRequisition[]>(REQUISITIONS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequisitions();
    }, []);

    const fetchRequisitions = async () => {
        try {
            const data = await JobRequisitionService.getRequisitions();
            if (data.length > 0) {
                setRequisitions(data);
            }
        } catch (error) {
            console.error('Error fetching requisitions:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Open': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
            case 'Pending Approval': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
            case 'Draft': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
            case 'Frozen': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
            case 'Closed': return 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'High': return <AlertCircle className="w-3 h-3 text-rose-500" />;
            case 'Medium': return <div className="w-2 h-2 rounded-full bg-amber-500" />;
            case 'Low': return <div className="w-2 h-2 rounded-full bg-blue-500" />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-celestial-indigo" />
                        Job Requisitions
                    </h1>
                    <p className="text-silver-mist text-sm">Manage hiring requests, approvals, and candidate pipelines.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors shadow-lg shadow-celestial-indigo/20">
                    <Plus className="w-4 h-4" /> Create Requisition
                </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="text-silver-mist text-xs font-bold uppercase">Total Open Roles</div>
                    <div className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">12</div>
                </div>
                <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="text-silver-mist text-xs font-bold uppercase">Pending Approval</div>
                    <div className="text-2xl font-bold text-amber-500 mt-1">3</div>
                </div>
                <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="text-silver-mist text-xs font-bold uppercase">Total Candidates</div>
                    <div className="text-2xl font-bold text-celestial-indigo mt-1">248</div>
                </div>
                <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="text-silver-mist text-xs font-bold uppercase">Offers Accepted</div>
                    <div className="text-2xl font-bold text-emerald-500 mt-1">5 <span className="text-xs text-silver-mist font-normal">this month</span></div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center bg-white dark:bg-stellar-blue p-2 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
                    <input
                        type="text"
                        placeholder="Search by title, department, or ID..."
                        className="w-full pl-9 pr-4 py-2 bg-transparent text-sm focus:outline-none"
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                    {['All', 'Open', 'Pending', 'Draft', 'Closed'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filterStatus === status
                                    ? 'bg-celestial-indigo text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                    <button className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:text-celestial-indigo">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Requisition Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                {requisitions.map(req => (
                    <div key={req.id} className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="p-5">
                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg text-ink-black dark:text-pearl group-hover:text-celestial-indigo transition-colors cursor-pointer">{req.title}</h3>
                                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                            {getPriorityIcon(req.priority)} {req.priority}
                                        </div>
                                    </div>
                                    <div className="text-xs text-silver-mist flex items-center gap-2">
                                        <span>{req.id}</span>
                                        <span>•</span>
                                        <span>{req.department}</span>
                                        <span>•</span>
                                        <span className={`px-1.5 py-0.5 rounded ${getStatusColor(req.status)} font-bold`}>{req.status}</span>
                                    </div>
                                </div>
                                <button className="text-silver-mist hover:text-ink-black dark:hover:text-pearl">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Key Details */}
                            <div className="grid grid-cols-2 gap-y-3 gap-x-6 mb-6 text-sm">
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                    <MapPin className="w-4 h-4 text-silver-mist" />
                                    {req.location}
                                </div>
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                    <DollarSign className="w-4 h-4 text-silver-mist" />
                                    {req.salaryRange}
                                </div>
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                    <Clock className="w-4 h-4 text-silver-mist" />
                                    {req.type}
                                </div>
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                    <Users className="w-4 h-4 text-silver-mist" />
                                    Hiring Mgr: {req.hiringManager}
                                </div>
                            </div>

                            {/* Pipeline Stats (Only if Open) */}
                            {req.status === 'Open' ? (
                                <div className="bg-slate-50 dark:bg-deep-cosmos/50 rounded-xl p-3 grid grid-cols-4 gap-2 text-center border border-cloud dark:border-nebula-purple/20">
                                    <div>
                                        <div className="text-lg font-bold text-ink-black dark:text-pearl">{req.stats.applied}</div>
                                        <div className="text-[10px] text-silver-mist uppercase font-semibold">Applied</div>
                                    </div>
                                    <div className="relative">
                                        <div className="text-lg font-bold text-ink-black dark:text-pearl">{req.stats.screening}</div>
                                        <div className="text-[10px] text-silver-mist uppercase font-semibold">Screening</div>
                                        <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-4 h-[1px] bg-slate-300 hidden md:block"></div>
                                    </div>
                                    <div className="relative">
                                        <div className="text-lg font-bold text-celestial-indigo">{req.stats.interview}</div>
                                        <div className="text-[10px] text-silver-mist uppercase font-semibold">Interview</div>
                                        <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-4 h-[1px] bg-slate-300 hidden md:block"></div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-emerald-500">{req.stats.offer}</div>
                                        <div className="text-[10px] text-silver-mist uppercase font-semibold">Offer</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-slate-50 dark:bg-deep-cosmos/50 rounded-xl p-3 flex items-center justify-center gap-2 text-sm text-silver-mist border border-cloud dark:border-nebula-purple/20">
                                    {req.status === 'Pending Approval' && <><Clock className="w-4 h-4" /> Awaiting Finance Approval</>}
                                    {req.status === 'Draft' && <><Briefcase className="w-4 h-4" /> Resume Editing</>}
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="border-t border-cloud dark:border-nebula-purple/20 p-3 flex justify-between items-center bg-slate-50/50 dark:bg-deep-cosmos/30 rounded-b-2xl">
                            <div className="text-xs text-silver-mist flex items-center gap-1">
                                {req.postedDate && <><Calendar className="w-3 h-3" /> Posted {req.postedDate}</>}
                                {!req.postedDate && "Not posted yet"}
                            </div>
                            <button className="text-xs font-bold text-celestial-indigo hover:underline flex items-center gap-1">
                                View Details <ArrowUpRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
