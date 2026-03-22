'use client';

import React from 'react';
import { cn } from '@aura/ui/utils';
import { FileText, Monitor, CreditCard, HelpCircle, Search, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { SharedServiceRequestService } from '@/app/dashboard/core-hr/services';
import { SharedServiceRequest } from '@/app/dashboard/core-hr/types';
import { formatDistanceToNow } from 'date-fns';

const SERVICE_CATEGORIES = [
    {
        title: 'Document Services',
        description: 'Employment letters, Experience certificates, NOCs.',
        icon: FileText,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        count: '24'
    },
    {
        title: 'IT & Asset Support',
        description: 'Hardware requests, Software access, Device repair.',
        icon: Monitor,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        count: '12'
    },
    {
        title: 'Employee ID & Access',
        description: 'Badge replacement, Security access, Parking permits.',
        icon: CreditCard,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        count: '5'
    },
    {
        title: 'HR Helpdesk',
        description: 'Policy clarification, Payroll queries, General support.',
        icon: HelpCircle,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        count: '18'
    },
];

export default function SharedServicesPage() {
    const [requests, setRequests] = React.useState<SharedServiceRequest[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        async function loadRequests() {
            const data = await SharedServiceRequestService.getAllRequests();
            setRequests(data);
            setIsLoading(false);
        }
        loadRequests();
    }, []);

    const getStatusStyles = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
            case 'approved': return 'bg-emerald-100 text-emerald-700';
            case 'pending':
            case 'open': return 'bg-amber-100 text-amber-700';
            case 'in_review':
            case 'in_progress': return 'bg-blue-100 text-blue-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
            case 'approved': return <CheckCircle2 className="w-5 h-5" />;
            case 'pending':
            case 'open': return <Clock className="w-5 h-5" />;
            default: return <AlertCircle className="w-5 h-5" />;
        }
    };
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl tracking-tight">Global Shared Services Hub</h1>
                    <p className="text-silver-mist text-sm">Centralized fulfillment center for all administrative and operational HR requests.</p>
                </div>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
                    <input
                        type="text"
                        placeholder="Search for a service or track request..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-indigo-500/20"
                    />
                </div>
            </div>

            {/* Service Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {SERVICE_CATEGORIES.map((cat) => (
                    <button
                        key={cat.title}
                        className="group text-left p-6 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
                    >
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", cat.bg)}>
                            <cat.icon className={cn("w-6 h-6", cat.color)} />
                        </div>
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-1 group-hover:text-indigo-600 transition-colors">{cat.title}</h3>
                        <p className="text-xs text-silver-mist leading-relaxed mb-4">{cat.description}</p>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-silver-mist uppercase tracking-widest">{cat.count} AVAILABLE</span>
                            <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Requests Table */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-silver-mist uppercase tracking-widest">Active Requests Tracking</h2>
                        <button className="text-xs font-semibold text-indigo-600 hover:underline">View All My Requests</button>
                    </div>
                    <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-2xl overflow-hidden shadow-sm">
                        <div className="divide-y divide-cloud dark:divide-nebula-purple/20">
                            {isLoading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 animate-pulse">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800" />
                                            <div>
                                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24 mb-2" />
                                                <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded w-32" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : requests.map((req) => (
                                <div key={req.requestId} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center",
                                            req.status === 'completed' || req.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                                                req.status === 'open' || req.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                                        )}>
                                            {getStatusIcon(req.status)}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-ink-black dark:text-pearl">{req.subject}</h4>
                                            <p className="text-[10px] font-medium text-silver-mist">{req.requestId} • {req.category.toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={cn(
                                            "text-[10px] font-extrabold uppercase px-2 py-1 rounded-full inline-block mb-1",
                                            getStatusStyles(req.status)
                                        )}>
                                            {req.status.replace('_', ' ')}
                                        </div>
                                        <p className="text-[10px] text-silver-mist">{formatDistanceToNow(new Date(req.createdDate))} ago</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Global SLA Health */}
                <div className="space-y-4">
                    <h2 className="text-sm font-bold text-silver-mist uppercase tracking-widest">Service Health (SLA)</h2>
                    <div className="p-6 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl shadow-xl shadow-indigo-600/20 text-white">
                        <div className="mb-6">
                            <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-1 text-center">Average Resolution Time</p>
                            <div className="text-4xl font-extrabold text-center tracking-tighter">4.2 <span className="text-lg">Hours</span></div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-end text-[10px] font-bold opacity-80 uppercase tracking-widest">
                                <span>Group Efficiency</span>
                                <span>94%</span>
                            </div>
                            <div className="h-1.5 w-full bg-indigo-900/40 rounded-full overflow-hidden">
                                <div className="h-full bg-white rounded-full w-[94%]" />
                            </div>
                            <p className="text-[10px] text-indigo-100 italic text-center">Performance is 15% better than last week.</p>
                        </div>
                    </div>
                    <div className="p-4 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-2xl shadow-sm">
                        <h4 className="text-xs font-bold text-ink-black dark:text-pearl mb-3">Live Jurisdictional Status</h4>
                        <div className="space-y-4">
                            {['UAE', 'KSA', 'India'].map(country => (
                                <div key={country} className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-silver-mist">{country} Compliance</span>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Synced</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
