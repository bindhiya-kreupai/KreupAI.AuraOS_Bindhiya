"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Users,
    Briefcase,
    Calendar,
    TrendingUp,
    Clock,
    AlertCircle,
    FileText,
    DollarSign,
    Shield,
    Activity,
    UserPlus,
    CheckCircle,
    BookOpen,
    AlertTriangle,
    FileWarning,
    Zap,
    Search,
    Loader2
} from 'lucide-react';
import { DraggableWidgetGrid } from '@/components/dashboard/DraggableWidgetGrid';
import { WidgetConfigPanel } from '@/components/dashboard/WidgetConfigPanel';
import { AIInsightsPanel } from '@/components/dashboard/AIInsightsPanel';
import { GlobalSearchCommand } from '@/components/search/GlobalSearchCommand';

interface OverviewData {
    totalEmployees: number;
    onLeaveToday: number;
    newJoiners: number;
    attritionRate: string;
    openPositions: number;
    activeCandidates: number;
    pendingApprovals: number;
    pendingLeaves: number;
    // Recruitment
    interviewsToday: number;
    offerAcceptanceRate: string;
    // Compliance
    expiringDocuments: number;
    pendingAudits: number;
    complianceScore: number;
    // Finance & Performance
    payrollStatus: string;
    pendingClaims: number;
    reviewsDue: number;
    trainingCompletion: string;
}

export default function OverviewPage() {
    const [data, setData] = useState<OverviewData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOverviewData();
    }, []);

    const fetchOverviewData = async () => {
        try {
            const [realtimeRes, headcountRes, recruitmentRes, complianceRes, payrollRes, performanceRes, learningRes] = await Promise.all([
                fetch('/api/v1/analytics/real-time').then((r) => r.json()).catch(() => null),
                fetch('/api/v1/analytics/headcount').then((r) => r.json()).catch(() => null),
                fetch('/api/v1/recruitment/stats').then((r) => r.json()).catch(() => null),
                fetch('/api/v1/compliance/audit').then((r) => r.json()).catch(() => null),
                fetch('/api/v1/payroll/stats').then((r) => r.json()).catch(() => null),
                fetch('/api/v1/performance/stats').then((r) => r.json()).catch(() => null),
                fetch('/api/v1/learning/stats').then((r) => r.json()).catch(() => null),
            ]);

            const rt = realtimeRes?.data;
            const hc = headcountRes?.data;
            const rs = recruitmentRes?.data;
            const comp = complianceRes?.data;
            const pr = payrollRes?.data;
            const perf = performanceRes?.data;
            const lr = learningRes?.data;

            setData({
                totalEmployees: rt?.activeEmployees?.total ?? hc?.total ?? 0,
                onLeaveToday: rt?.todayLeaves?.total ?? 0,
                newJoiners: hc?.newHires?.thisMonth ?? 0,
                attritionRate: hc?.netGrowth?.growthRate !== undefined ? `${Math.abs(hc.netGrowth.growthRate)}%` : '0%',
                openPositions: rs?.openPositions ?? 0,
                activeCandidates: rs?.activeCandidates ?? 0,
                pendingApprovals: rt?.pendingApprovals?.total ?? 0,
                pendingLeaves: rt?.pendingApprovals?.byType?.find((t: any) => t.type === 'Leave Requests')?.count ?? 0,
                // Recruitment
                interviewsToday: rs?.interviewsToday ?? 0,
                offerAcceptanceRate: rs?.offerAcceptanceRate ? `${rs.offerAcceptanceRate}%` : '0%',
                // Compliance
                expiringDocuments: comp?.summary?.totalDeadlines ?? 0,
                pendingAudits: comp?.summary?.criticalCount ?? 0,
                complianceScore: comp?.complianceScore ?? 0,
                // Finance & Performance
                payrollStatus: pr?.status || 'Draft',
                pendingClaims: pr?.pendingClaims ?? 0,
                reviewsDue: perf?.reviewsDue ?? 0,
                trainingCompletion: lr?.completionRate ? `${lr.completionRate}%` : '0%',
            });
        } catch (error) {
            console.error('Failed to fetch overview data:', error);
            setData({
                totalEmployees: 0,
                onLeaveToday: 0,
                newJoiners: 0,
                attritionRate: '0%',
                openPositions: 0,
                activeCandidates: 0,
                pendingApprovals: 0,
                pendingLeaves: 0,
                interviewsToday: 0,
                offerAcceptanceRate: '0%',
                expiringDocuments: 0,
                pendingAudits: 0,
                complianceScore: 0,
                payrollStatus: '--',
                pendingClaims: 0,
                reviewsDue: 0,
                trainingCompletion: '0%',
            });
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num: number) => num.toLocaleString();

    return (
        <div className="space-y-6 pb-10">
            <GlobalSearchCommand />
            <WidgetConfigPanel />

            {loading && (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-celestial-indigo" />
                </div>
            )}

            <section>
                <h2 className="text-xs font-bold text-silver-mist uppercase tracking-wider mb-1 px-1">Workforce Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                    <KPICard label="Total Employees" value={data ? formatNumber(data.totalEmployees) : '--'} change={data ? `${data.newJoiners > 0 ? '+' : ''}${data.newJoiners} this month` : '--'} icon={Users} color="text-celestial-indigo" />
                    <KPICard label="On Leave Today" value={data ? String(data.onLeaveToday) : '--'} change="Today" icon={Calendar} color="text-neural-mint" />
                    <KPICard label="New Joiners" value={data ? String(data.newJoiners) : '--'} change="This month" icon={UserPlus} color="text-quantum-rose" />
                    <KPICard label="Pending Approvals" value={data ? String(data.pendingApprovals) : '--'} change={data && data.pendingLeaves > 0 ? `${data.pendingLeaves} leaves` : 'None'} icon={TrendingUp} color="text-sunset-amber" />
                </div>
            </section>

            <section>
                <h2 className="text-xs font-bold text-silver-mist uppercase tracking-wider mb-1 px-1">Recruitment & Talent</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                    <KPICard label="Open Positions" value={data ? String(data.openPositions) : '--'} change="Active" icon={Briefcase} color="text-celestial-indigo" />
                    <KPICard label="Active Candidates" value={data ? String(data.activeCandidates) : '--'} change="In pipeline" icon={Search} color="text-neural-mint" />
                    <KPICard label="Interviews Today" value={data ? String(data.interviewsToday) : '--'} change="Scheduled" icon={Clock} color="text-quantum-rose" />
                    <KPICard label="Offer Acceptance" value={data ? data.offerAcceptanceRate : '--'} change="Rate" icon={CheckCircle} color="text-sunset-amber" />
                </div>
            </section>

            <section>
                <h2 className="text-xs font-bold text-silver-mist uppercase tracking-wider mb-1 px-1">Compliance & Risk</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                    <KPICard label="Expiring Documents" value={data ? String(data.expiringDocuments) : '--'} change="Action required" icon={FileWarning} color="text-coral-alert" />
                    <KPICard label="Pending Audits" value={data ? String(data.pendingAudits) : '--'} change="Critical" icon={Shield} color="text-sunset-amber" />
                    <KPICard label="Safety Incidents" value="0" change="This month" icon={AlertTriangle} color="text-neural-mint" />
                    <KPICard label="Compliance Score" value={data ? `${data.complianceScore}%` : '--'} change="Overall" icon={Activity} color="text-celestial-indigo" />
                </div>
            </section>

            <section>
                <h2 className="text-xs font-bold text-silver-mist uppercase tracking-wider mb-1 px-1">Finance & Performance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                    <KPICard label="Payroll Status" value={data ? data.payrollStatus : '--'} change="Current month" icon={DollarSign} color="text-neural-mint" />
                    <KPICard label="Pending Claims" value={data ? String(data.pendingClaims) : '--'} change="Awaiting approval" icon={FileText} color="text-quantum-rose" />
                    <KPICard label="Reviews Due" value={data ? String(data.reviewsDue) : '--'} change="Next 30 days" icon={Zap} color="text-sunset-amber" />
                    <KPICard label="Training Completion" value={data ? data.trainingCompletion : '--'} change="Average" icon={BookOpen} color="text-celestial-indigo" />
                </div>
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                <div className="xl:col-span-3">
                    <DraggableWidgetGrid />
                </div>
                <div className="xl:col-span-1">
                    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm p-4 sticky top-4">
                        <AIInsightsPanel />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
                <h2 className="text-sm font-bold text-ink-black dark:text-pearl mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                        { label: 'Add Employee', href: '/dashboard/core-hr/employee-database', color: 'text-celestial-indigo', bg: 'bg-celestial-indigo/10 hover:bg-celestial-indigo/20' },
                        { label: 'Process Payroll', href: '/dashboard/payroll/payroll-processing', color: 'text-quantum-rose', bg: 'bg-quantum-rose/10 hover:bg-quantum-rose/20' },
                        { label: 'Approve Leaves', href: '/dashboard/leave/my-leaves', color: 'text-neural-mint', bg: 'bg-neural-mint/10 hover:bg-neural-mint/20' },
                        { label: 'Create Job Post', href: '/dashboard/recruitment/job-posting', color: 'text-sunset-amber', bg: 'bg-sunset-amber/10 hover:bg-sunset-amber/20' }
                    ].map((action, i) => (
                        <Link key={i} href={action.href} className={`block w-full py-2.5 px-3 rounded-lg text-sm font-medium text-center transition-all ${action.bg} ${action.color}`}>
                            {action.label}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

function KPICard({ label, value, change, icon: Icon, color, alert = false }: any) {
    return (
        <div className={`bg-white dark:bg-stellar-blue p-4 rounded-xl border ${alert ? 'border-coral-alert/50 bg-coral-alert/5' : 'border-cloud dark:border-nebula-purple/50'} shadow-sm hover:shadow-md transition-all group`}>
            <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-lg bg-pearl dark:bg-deep-cosmos ${color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${alert ? 'bg-coral-alert/10 text-coral-alert' :
                    typeof change === 'string' && change.startsWith('+') ? 'bg-neural-mint/10 text-neural-mint' :
                        typeof change === 'string' && change.startsWith('-') ? 'bg-coral-alert/10 text-coral-alert' :
                            'bg-pearl dark:bg-deep-cosmos text-silver-mist'
                    }`}>
                    {change}
                </span>
            </div>
            <h3 className="text-xl font-bold text-ink-black dark:text-pearl mb-0.5">{value}</h3>
            <p className="text-xs text-silver-mist font-medium">{label}</p>
        </div>
    );
}
