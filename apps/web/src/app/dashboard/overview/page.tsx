import React from 'react';
import {
    Users,
    Briefcase,
    Calendar,
    TrendingUp,
    Clock,
    AlertCircle
} from 'lucide-react';

export default function OverviewPage() {
    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div>
                <h1 className="text-3xl font-display font-bold text-ink-black dark:text-pearl mb-2">
                    Good Morning, Admin
                </h1>
                <p className="text-twilight dark:text-silver-mist">
                    Here's what's happening in your organization today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Employees', value: '1,234', change: '+12%', icon: Users, color: 'text-celestial-indigo' },
                    { label: 'Open Positions', value: '45', change: '+5%', icon: Briefcase, color: 'text-quantum-rose' },
                    { label: 'On Leave Today', value: '12', change: '-2%', icon: Calendar, color: 'text-neural-mint' },
                    { label: 'Attrition Rate', value: '2.4%', change: '-0.5%', icon: TrendingUp, color: 'text-sunset-amber' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-pearl dark:bg-deep-cosmos ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-neural-mint' : 'text-coral-alert'}`}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-ink-black dark:text-pearl mb-1">{stat.value}</h3>
                        <p className="text-sm text-silver-mist">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Activity Feed */}
                <div className="lg:col-span-2 bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50">
                    <h2 className="text-lg font-bold text-ink-black dark:text-pearl mb-6">Recent Activity</h2>
                    <div className="space-y-6">
                        {[
                            { user: 'Sarah Johnson', action: 'applied for leave', time: '2 mins ago', icon: Clock },
                            { user: 'Mike Chen', action: 'completed onboarding', time: '1 hour ago', icon: Users },
                            { user: 'System', action: 'generated payroll report', time: '3 hours ago', icon: AlertCircle },
                        ].map((activity, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <div className="p-2 rounded-full bg-pearl dark:bg-deep-cosmos text-silver-mist">
                                    <activity.icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm text-ink-black dark:text-pearl">
                                        <span className="font-semibold">{activity.user}</span> {activity.action}
                                    </p>
                                    <p className="text-xs text-silver-mist mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-celestial-indigo to-quantum-rose p-6 rounded-2xl text-white">
                    <h2 className="text-lg font-bold mb-6">Quick Actions</h2>
                    <div className="space-y-3">
                        {['Add Employee', 'Process Payroll', 'Approve Leaves', 'Create Job Post'].map((action, i) => (
                            <button key={i} className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-sm font-medium text-left transition-colors">
                                {action}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
