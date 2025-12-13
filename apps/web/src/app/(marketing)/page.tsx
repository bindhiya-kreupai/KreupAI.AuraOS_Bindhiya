'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@aura/ui/components/ui/button';
import {
    ArrowRight,
    CheckCircle,
    BarChart3,
    Users,
    Zap,
    Shield,
    Globe,
    Home,
    Briefcase,
    Clock,
    TrendingUp,
    Bell,
    Search,
    ChevronRight
} from 'lucide-react';

// Interactive Dashboard Preview Component
function DashboardPreview() {
    const [activeTab, setActiveTab] = useState('overview');

    const sidebarItems = [
        { id: 'overview', icon: Home, label: 'Overview' },
        { id: 'employees', icon: Users, label: 'Employees' },
        { id: 'time', icon: Clock, label: 'Time & Attendance' },
        { id: 'performance', icon: TrendingUp, label: 'Performance' },
    ];

    const stats = [
        { label: 'Total Employees', value: '2,847', change: '+12%', color: 'text-green-500' },
        { label: 'Open Positions', value: '23', change: '+5', color: 'text-blue-500' },
        { label: 'Avg. Tenure', value: '3.2 yrs', change: '+0.4', color: 'text-purple-500' },
        { label: 'Engagement Score', value: '87%', change: '+3%', color: 'text-green-500' },
    ];

    const employees = [
        { name: 'Sarah Chen', role: 'Engineering Manager', dept: 'Engineering', status: 'Active' },
        { name: 'Marcus Williams', role: 'Sr. Designer', dept: 'Product', status: 'Active' },
        { name: 'Priya Patel', role: 'HR Business Partner', dept: 'People Ops', status: 'On Leave' },
    ];

    return (
        <div className="w-full h-full flex bg-white dark:bg-slate-900 rounded-lg overflow-hidden text-left text-sm">
            {/* Mini Sidebar */}
            <div className="w-48 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-3 hidden md:block">
                <div className="flex items-center gap-2 mb-6 px-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-celestial-indigo to-quantum-rose flex items-center justify-center">
                        <span className="text-white text-xs font-bold">A</span>
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-white text-sm">AuraOS</span>
                </div>
                <nav className="space-y-1">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === item.id
                                ? 'bg-celestial-indigo text-white'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Bar */}
                <div className="h-10 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4">
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 w-48">
                        <Search className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-400">Search...</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Bell className="w-4 h-4 text-slate-400" />
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-celestial-indigo to-quantum-rose" />
                    </div>
                </div>

                {/* Dashboard Content */}
                <div className="flex-1 p-4 overflow-hidden">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Dashboard Overview</h2>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                        {stats.map((stat, i) => (
                            <div key={i} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                                <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                                <p className="text-xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
                                <p className={`text-xs ${stat.color}`}>{stat.change}</p>
                            </div>
                        ))}
                    </div>

                    {/* Chart Mockup & Employee List */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Chart */}
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-200">Headcount Trend</span>
                                <span className="text-xs text-slate-400">Last 6 months</span>
                            </div>
                            <div className="flex items-end gap-2 h-24">
                                {[40, 55, 45, 60, 75, 90].map((h, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 bg-gradient-to-t from-celestial-indigo to-celestial-indigo/50 rounded-t transition-all hover:opacity-80"
                                        style={{ height: `${h}%` }}
                                    />
                                ))}
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-slate-400">
                                <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                            </div>
                        </div>

                        {/* Employee List */}
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-200">Recent Employees</span>
                                <span className="text-xs text-celestial-indigo cursor-pointer flex items-center gap-1">View all <ChevronRight className="w-3 h-3" /></span>
                            </div>
                            <div className="space-y-3">
                                {employees.map((emp, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-medium">
                                            {emp.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-slate-800 dark:text-white truncate">{emp.name}</p>
                                            <p className="text-xs text-slate-400 truncate">{emp.role}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${emp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {emp.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LandingPage() {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-700" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-celestial-indigo/10 text-celestial-indigo dark:text-quantum-rose text-sm font-medium mb-8">
                        <span className="bg-celestial-indigo text-white text-xs px-2 py-0.5 rounded-full">New</span>
                        <span>Experience the Future of Work</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-display font-bold text-ink-black dark:text-pearl mb-8 tracking-tight">
                        The Intelligence Around <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-celestial-indigo via-purple-500 to-quantum-rose">
                            Your Workforce
                        </span>
                    </h1>

                    <p className="text-xl text-twilight dark:text-silver-mist max-w-2xl mx-auto mb-12 leading-relaxed">
                        AuraOS is the first truly agentic HCM platform. Automate 80% of HR tasks, predict attrition, and empower your people with AI-driven insights.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/auth/register">
                            <Button size="lg" className="bg-celestial-indigo hover:bg-celestial-indigo/90 text-white rounded-full px-8 h-12 text-base shadow-lg shadow-celestial-indigo/25">
                                Start Free Trial
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <Link href="/features">
                            <Button variant="outline" size="lg" className="rounded-full px-8 h-12 text-base border-2 hover:bg-pearl dark:hover:bg-stellar-blue">
                                View Demo
                            </Button>
                        </Link>
                    </div>

                    {/* Interactive Dashboard Preview */}
                    <div className="mt-20 relative mx-auto max-w-5xl rounded-2xl border-4 border-cloud dark:border-nebula-purple bg-white dark:bg-deep-cosmos shadow-2xl overflow-hidden aspect-[16/9]">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 dark:to-black/40 pointer-events-none z-10" />
                        <DashboardPreview />
                    </div>
                </div>
            </section>

            {/* Feature Grid */}
            <section className="py-24 bg-white dark:bg-deep-cosmos">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-display font-bold text-ink-black dark:text-pearl mb-4">
                            Everything you need to run a modern workforce
                        </h2>
                        <p className="text-twilight dark:text-silver-mist max-w-2xl mx-auto">
                            From core HR to advanced AI analytics, AuraOS unifies every aspect of human capital management into one seamless operating system.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Zap,
                                title: "AI & Automation",
                                desc: "Automate routine tasks, screen resumes, and answer employee queries with our advanced AI agents."
                            },
                            {
                                icon: Users,
                                title: "Core HR & Payroll",
                                desc: "Manage the entire employee lifecycle with global compliance, automated payroll, and document management."
                            },
                            {
                                icon: BarChart3,
                                title: "People Analytics",
                                desc: "Real-time insights into attrition, performance, and engagement to make data-driven decisions."
                            },
                            {
                                icon: Globe,
                                title: "Global Mobility",
                                desc: "Seamlessly manage a distributed workforce with multi-currency, multi-language, and tax compliance support."
                            },
                            {
                                icon: Shield,
                                title: "Enterprise Security",
                                desc: "Bank-grade security with role-based access control, audit logs, and GDPR/SOC2 compliance."
                            },
                            {
                                icon: CheckCircle,
                                title: "Talent Management",
                                desc: "From recruitment to succession planning, nurture your top talent and build high-performing teams."
                            }
                        ].map((feature, i) => (
                            <div key={i} className="p-8 rounded-2xl bg-pearl dark:bg-stellar-blue/20 border border-cloud dark:border-nebula-purple hover:border-celestial-indigo/50 transition-colors group">
                                <div className="w-12 h-12 rounded-lg bg-white dark:bg-deep-cosmos flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                    <feature.icon className="w-6 h-6 text-celestial-indigo" />
                                </div>
                                <h3 className="text-xl font-semibold text-ink-black dark:text-pearl mb-3">{feature.title}</h3>
                                <p className="text-twilight dark:text-silver-mist leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>



            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-celestial-indigo to-quantum-rose opacity-90" />
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                    <h2 className="text-4xl font-display font-bold mb-6">Ready to transform your workforce?</h2>
                    <p className="text-white/80 text-xl mb-10 max-w-2xl mx-auto">
                        Join thousands of forward-thinking companies using AuraOS to build better workplaces.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/auth/register">
                            <Button size="lg" className="bg-white text-celestial-indigo hover:bg-white/90 rounded-full px-8 h-12 text-base">
                                Get Started for Free
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 rounded-full px-8 h-12 text-base bg-transparent">
                                Contact Sales
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
