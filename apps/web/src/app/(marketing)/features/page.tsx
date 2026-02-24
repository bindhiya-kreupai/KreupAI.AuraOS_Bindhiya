import React from 'react';
import {
    Users,
    FileText,
    Calendar,
    BarChart3,
    ShieldCheck,
    Globe,
    Zap,
    MessageSquare,
    Briefcase,
    Award
} from 'lucide-react';
import { Button } from '@aura/ui/components/ui/button';
import Link from 'next/link';

const features = [
    {
        title: "Smart Recruitment",
        icon: Users,
        desc: "AI-driven ATS that parses resumes, ranks candidates, and automates interview scheduling.",
        color: "text-blue-500",
        bg: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
        title: "Seamless Onboarding",
        icon: FileText,
        desc: "Digital paperwork, automated provisioning, and personalized induction journeys for new hires.",
        color: "text-green-500",
        bg: "bg-green-50 dark:bg-green-900/20"
    },
    {
        title: "Core HR & Database",
        icon: Briefcase,
        desc: "Centralized system of record for employee data, documents, and organizational structures.",
        color: "text-purple-500",
        bg: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
        title: "Time & Attendance",
        icon: Calendar,
        desc: "Geo-fenced mobile clock-in, shift management, and automated timesheet processing.",
        color: "text-orange-500",
        bg: "bg-orange-50 dark:bg-orange-900/20"
    },
    {
        title: "Payroll & Benefits",
        icon: Award,
        desc: "Multi-country payroll processing, tax compliance, and flexible benefits administration.",
        color: "text-pink-500",
        bg: "bg-pink-50 dark:bg-pink-900/20"
    },
    {
        title: "Performance Mgmt",
        icon: BarChart3,
        desc: "OKRs, 360-degree feedback, and continuous coaching conversations.",
        color: "text-yellow-500",
        bg: "bg-yellow-50 dark:bg-yellow-900/20"
    },
    {
        title: "Employee Engagement",
        icon: MessageSquare,
        desc: "Pulse surveys, recognition walls, and internal social networks to boost morale.",
        color: "text-teal-500",
        bg: "bg-teal-50 dark:bg-teal-900/20"
    },
    {
        title: "People Analytics",
        icon: Zap,
        desc: "Real-time dashboards predicting attrition, analyzing pay equity, and forecasting costs.",
        color: "text-indigo-500",
        bg: "bg-indigo-50 dark:bg-indigo-900/20"
    },
    {
        title: "Global Compliance",
        icon: Globe,
        desc: "Built-in labor law compliance for over 150 countries with auto-updates.",
        color: "text-cyan-500",
        bg: "bg-cyan-50 dark:bg-cyan-900/20"
    },
    {
        title: "Enterprise Security",
        icon: ShieldCheck,
        desc: "Role-based access control, audit logs, and GDPR/SOC2 compliance out of the box.",
        color: "text-slate-500",
        bg: "bg-slate-50 dark:bg-slate-900/20"
    }
];

export default function FeaturesPage() {
    return (
        <div className="bg-pearl dark:bg-deep-cosmos min-h-screen pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-ink-black dark:text-pearl mb-6">
                        A complete operating system for your workforce
                    </h1>
                    <p className="text-xl text-twilight dark:text-silver-mist">
                        Replace your fragmented stack of HR tools with one unified platform that does it all.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, i) => (
                        <div key={i} className="group p-8 rounded-2xl bg-white dark:bg-stellar-blue/5 border border-cloud dark:border-nebula-purple hover:border-celestial-indigo hover:shadow-lg transition-all">
                            <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <feature.icon className={`w-6 h-6 ${feature.color}`} />
                            </div>
                            <h3 className="text-xl font-bold text-ink-black dark:text-pearl mb-3">{feature.title}</h3>
                            <p className="text-twilight dark:text-silver-mist leading-relaxed">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-24 text-center bg-ink-black dark:bg-white/5 rounded-3xl p-12 relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold text-white mb-6">Ready to see it in action?</h2>
                        <div className="flex flex-col sm:flex-row justify-center gap-3">
                            <Link href="/auth/register">
                                <Button className="h-12 px-8 rounded-full bg-celestial-indigo hover:bg-celestial-indigo/90 text-white text-base">
                                    Start Free Trial
                                </Button>
                            </Link>
                            <Link href="/contact">
                                <Button variant="outline" className="h-12 px-8 rounded-full border-white/20 text-white hover:bg-white/10 text-base bg-transparent">
                                    Book a Demo
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="absolute top-0 left-0 w-full h-full opacity-30">
                        <div className="absolute right-0 bottom-0 w-96 h-96 bg-purple-600 rounded-full blur-[100px]" />
                        <div className="absolute left-0 top-0 w-96 h-96 bg-blue-600 rounded-full blur-[100px]" />
                    </div>
                </div>
            </div>
        </div>
    );
}

