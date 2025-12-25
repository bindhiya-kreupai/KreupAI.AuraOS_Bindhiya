import React from 'react';
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
    Award,
    Shield,
    Activity,
    UserPlus,
    CheckCircle,
    BookOpen,
    Heart,
    AlertTriangle,
    FileWarning,
    PieChart,
    Zap,
    Search
} from 'lucide-react';

export default function OverviewPage() {
    return (
        <div className="space-y-6">
            {/* Section 1: Workforce Overview */}
            <section>
                <h2 className="text-xs font-bold text-silver-mist uppercase tracking-wider mb-1 px-1">Workforce Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                    <KPICard label="Total Employees" value="1,234" change="+12%" icon={Users} color="text-celestial-indigo" />
                    <KPICard label="On Leave Today" value="12" change="-2%" icon={Calendar} color="text-neural-mint" />
                    <KPICard label="New Joiners" value="8" change="+4" icon={UserPlus} color="text-quantum-rose" />
                    <KPICard label="Attrition Rate" value="2.4%" change="-0.5%" icon={TrendingUp} color="text-sunset-amber" />
                </div>
            </section>

            {/* Section 2: Recruitment & Talent */}
            <section>
                <h2 className="text-xs font-bold text-silver-mist uppercase tracking-wider mb-1 px-1">Recruitment & Talent</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                    <KPICard label="Open Positions" value="45" change="+5%" icon={Briefcase} color="text-celestial-indigo" />
                    <KPICard label="Active Candidates" value="128" change="+15%" icon={Search} color="text-neural-mint" />
                    <KPICard label="Interviews Today" value="14" change="+2" icon={Clock} color="text-quantum-rose" />
                    <KPICard label="Offer Acceptance" value="92%" change="+1.5%" icon={CheckCircle} color="text-sunset-amber" />
                </div>
            </section>

            {/* Section 3: Compliance & Risk */}
            <section>
                <h2 className="text-xs font-bold text-silver-mist uppercase tracking-wider mb-1 px-1">Compliance & Risk</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                    <KPICard
                        label="Expiring Documents"
                        value="7"
                        change="Critical"
                        icon={FileWarning}
                        color="text-coral-alert"
                        alert
                    />
                    <KPICard label="Pending Audits" value="3" change="Due Soon" icon={Shield} color="text-sunset-amber" />
                    <KPICard label="Safety Incidents" value="0" change="Safe" icon={AlertTriangle} color="text-neural-mint" />
                    <KPICard label="Compliance Score" value="98%" change="+2%" icon={Activity} color="text-celestial-indigo" />
                </div>
            </section>

            {/* Section 4: Finance & Performance */}
            <section>
                <h2 className="text-xs font-bold text-silver-mist uppercase tracking-wider mb-1 px-1">Finance & Performance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                    <KPICard label="Payroll Status" value="Processing" change="85%" icon={DollarSign} color="text-neural-mint" />
                    <KPICard label="Pending Claims" value="24" change="$4.2k" icon={FileText} color="text-quantum-rose" />
                    <KPICard label="Reviews Due" value="15" change="Urgent" icon={Zap} color="text-sunset-amber" />
                    <KPICard label="Training Completion" value="76%" change="+5%" icon={BookOpen} color="text-celestial-indigo" />
                </div>
            </section>

            {/* Recent Activity & Quick Actions (Compact) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                {/* Activity Feed */}
                <div className="lg:col-span-2 bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
                    <h2 className="text-sm font-bold text-ink-black dark:text-pearl mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                        {[
                            { user: 'Sarah Johnson', action: 'applied for leave', time: '2 mins ago', icon: Clock },
                            { user: 'Mike Chen', action: 'completed onboarding', time: '1 hour ago', icon: Users },
                            { user: 'System', action: 'generated payroll report', time: '3 hours ago', icon: AlertCircle },
                        ].map((activity, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="p-1.5 rounded-full bg-pearl dark:bg-deep-cosmos text-silver-mist">
                                    <activity.icon className="w-3 h-3" />
                                </div>
                                <div>
                                    <p className="text-sm text-ink-black dark:text-pearl">
                                        <span className="font-semibold">{activity.user}</span> {activity.action}
                                    </p>
                                    <p className="text-xs text-silver-mist">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
                    <h2 className="text-sm font-bold text-ink-black dark:text-pearl mb-4">Quick Actions</h2>
                    <div className="space-y-2">
                        {[
                            { label: 'Add Employee', href: '/dashboard/core-hr/employee-database', color: 'text-celestial-indigo', bg: 'bg-celestial-indigo/10 hover:bg-celestial-indigo/20' },
                            { label: 'Process Payroll', href: '/dashboard/payroll/payroll-processing', color: 'text-quantum-rose', bg: 'bg-quantum-rose/10 hover:bg-quantum-rose/20' },
                            { label: 'Approve Leaves', href: '/dashboard/leave/my-leaves', color: 'text-neural-mint', bg: 'bg-neural-mint/10 hover:bg-neural-mint/20' },
                            { label: 'Create Job Post', href: '/dashboard/recruitment/job-posting', color: 'text-sunset-amber', bg: 'bg-sunset-amber/10 hover:bg-sunset-amber/20' }
                        ].map((action, i) => (
                            <Link key={i} href={action.href} className={`block w-full py-2.5 px-3 rounded-lg text-sm font-medium text-left transition-all ${action.bg} ${action.color}`}>
                                {action.label}
                            </Link>
                        ))}
                    </div>
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
                    change.startsWith('+') ? 'bg-neural-mint/10 text-neural-mint' :
                        change.startsWith('-') ? 'bg-coral-alert/10 text-coral-alert' :
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
