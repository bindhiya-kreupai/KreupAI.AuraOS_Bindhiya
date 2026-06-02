"use client";

import React, { useState, useEffect } from 'react';
import {
    Users,
    CheckCircle2,
    XCircle,
    Clock,
    MoreHorizontal,
    MessageSquare,
    Phone,
    Mail,
    Calendar,
    Briefcase,
    TrendingUp,
    AlertCircle,
    ThumbsUp,
    Smile,
    Loader2
} from 'lucide-react';

interface TeamMember {
  id: string;
  employeeCode: string;
  employeeName: string;
  designation: string;
  department: string;
  email: string;
  status: string;
  location: string;
  performanceRating: number;
  attendanceRate: number;
  engagementScore: number;
}

interface TeamMetrics {
  totalHeadcount: number;
  activeEmployees: number;
  averageAttendance: number;
  averagePerformanceRating: number;
  pendingLeaveRequests: number;
  newJoiners: number;
}

interface Approval {
  requestId: string;
  requestType: string;
  requestTitle: string;
  requestDate: string;
  requestedByName: string;
  approvalStatus: string;
  details: any;
}

export default function TeamManagerPage() {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [metrics, setMetrics] = useState<TeamMetrics | null>(null);
    const [approvals, setApprovals] = useState<Approval[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function fetchData() {
            try {
                const [teamRes, approvalsRes] = await Promise.allSettled([
                    fetch('/api/manager/team'),
                    fetch('/api/manager/approvals'),
                ]);

                if (teamRes.status === 'fulfilled' && teamRes.value.ok) {
                    const data = await teamRes.value.json();
                    setTeamMembers(data.members || []);
                    setMetrics(data.metrics || null);
                }

                if (approvalsRes.status === 'fulfilled' && approvalsRes.value.ok) {
                    const data = await approvalsRes.value.json();
                    setApprovals(data.approvals || []);
                }
            } catch (err: any) {
                console.error('Failed to fetch team data:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const filteredMembers = teamMembers.filter(m =>
        m.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.designation.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2);

    const getStatusColor = (status: string) => {
        if (status === 'active') return 'bg-emerald-500';
        if (status === 'probation') return 'bg-amber-500';
        return 'bg-slate-400';
    };

    const getApprovalTypeColor = (type: string) => {
        if (type === 'leave') return 'bg-amber-50 text-amber-600 border-amber-200';
        if (type === 'overtime') return 'bg-indigo-50 text-indigo-600 border-indigo-200';
        if (type === 'exit') return 'bg-rose-50 text-rose-600 border-rose-200';
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                <span className="ml-2 text-sm text-silver-mist">Loading team data...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        Team Hub{metrics ? `: ${metrics.totalHeadcount} Members` : ''}
                    </h1>
                    <p className="text-silver-mist text-sm">Manage your direct reports, approvals, and team health.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20">
                        <Briefcase className="w-4 h-4" /> Team Settings
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0 overflow-y-auto lg:overflow-visible">
                <div className="lg:col-span-2 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-4 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                            <div className="flex items-center gap-2 text-silver-mist text-xs font-bold uppercase mb-1">
                                <Clock className="w-3 h-3" /> Attendance
                            </div>
                            <div className="text-xl font-bold text-ink-black dark:text-pearl">{metrics?.averageAttendance || 0}%</div>
                        </div>
                        <div className="p-4 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                            <div className="flex items-center gap-2 text-silver-mist text-xs font-bold uppercase mb-1">
                                <TrendingUp className="w-3 h-3" /> Performance
                            </div>
                            <div className="text-xl font-bold text-emerald-500">{metrics?.averagePerformanceRating || 0}/5</div>
                        </div>
                        <div className="p-4 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                            <div className="flex items-center gap-2 text-silver-mist text-xs font-bold uppercase mb-1">
                                <Users className="w-3 h-3" /> Active
                            </div>
                            <div className="text-xl font-bold text-indigo-500">{metrics?.activeEmployees || 0}</div>
                        </div>
                        <div className="p-4 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                            <div className="flex items-center gap-2 text-silver-mist text-xs font-bold uppercase mb-1">
                                <AlertCircle className="w-3 h-3" /> New Joiners
                            </div>
                            <div className="text-xl font-bold text-amber-500">{metrics?.newJoiners || 0}</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                                <Users className="w-5 h-5 text-indigo-500" /> Direct Reports ({filteredMembers.length})
                            </h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Search team..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-slate-800 rounded-lg text-sm outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>
                        </div>

                        {filteredMembers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-2" />
                                <p className="text-sm font-medium text-slate-500">No team members found</p>
                                <p className="text-xs text-slate-400">
                                    {searchQuery ? 'Try a different search term' : 'No direct reports assigned yet'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {filteredMembers.map(member => (
                                    <div key={member.id} className="p-4 border border-cloud dark:border-slate-800 rounded-xl hover:border-indigo-300 transition-all hover:shadow-md bg-white dark:bg-slate-900/40 group">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                                                        {getInitials(member.employeeName)}
                                                    </div>
                                                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${getStatusColor(member.status)}`}></span>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-ink-black dark:text-pearl">{member.employeeName}</div>
                                                    <div className="text-xs text-silver-mist">{member.designation}</div>
                                                </div>
                                            </div>
                                            <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                                            <span className="flex items-center gap-1">
                                                <TrendingUp className="w-3 h-3 text-emerald-500" /> {member.performanceRating}/5
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Briefcase className="w-3 h-3 text-indigo-500" /> {member.location || member.department}
                                            </span>
                                        </div>

                                        <div className="flex gap-2">
                                            <button className="flex-1 py-1.5 flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-400 transition-colors">
                                                <MessageSquare className="w-3 h-3" /> Message
                                            </button>
                                            <button className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-500">
                                                <Phone className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-1 bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Pending Approvals
                        </h3>
                        <span className="bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 text-xs font-bold px-2 py-1 rounded-full">{approvals.length}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                        {approvals.map(approval => (
                            <div key={approval.requestId} className="p-4 rounded-xl border border-cloud dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 hover:border-indigo-300 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getApprovalTypeColor(approval.requestType)}`}>
                                        {approval.requestType}
                                    </span>
                                    <span className="text-[10px] text-silver-mist">{new Date(approval.requestDate).toLocaleDateString()}</span>
                                </div>

                                <h4 className="font-bold text-sm text-ink-black dark:text-pearl mb-1">
                                    {approval.requestedByName}
                                </h4>
                                <p className="text-xs text-silver-mist mb-3">{approval.requestTitle}</p>

                                <div className="flex gap-2">
                                    <button className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Approve
                                    </button>
                                    <button className="flex-1 py-1.5 bg-white dark:bg-slate-800 border border-cloud dark:border-slate-700 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 rounded-lg text-xs font-bold transition-colors text-slate-500 flex items-center justify-center gap-1">
                                        <XCircle className="w-3 h-3" /> Reject
                                    </button>
                                </div>
                            </div>
                        ))}

                        {approvals.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-48 text-center opacity-50">
                                <CheckCircle2 className="w-12 h-12 text-slate-300 mb-2" />
                                <div className="text-sm font-bold text-slate-500">All caught up!</div>
                                <div className="text-xs text-slate-400">No pending approvals</div>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-cloud dark:border-slate-800 text-center">
                        <button className="text-xs font-bold text-indigo-500 hover:underline">
                            View Approval History
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

