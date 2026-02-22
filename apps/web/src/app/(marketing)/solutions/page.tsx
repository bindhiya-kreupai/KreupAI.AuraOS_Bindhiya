import React from 'react';
import {
    Brain,
    Clock,
    Shield,
    Heart,
    TrendingUp,
    Users,
    Briefcase,
    Globe,
    Building2,
    GraduationCap,
    Stethoscope,
    ShoppingCart
} from 'lucide-react';

const solutions = [
    {
        category: "Core HR",
        description: "The foundation of your people operations.",
        items: [
            { title: "Core HR", icon: Users, desc: "Centralized employee database and lifecycle management." },
            { title: "Payroll", icon: Briefcase, desc: "Automated multi-currency global payroll processing." },
            { title: "Benefits", icon: Heart, desc: "Comprehensive benefits administration and enrollment." },
            { title: "Time & Attendance", icon: Clock, desc: "Smart rostering and biometric attendance tracking." }
        ]
    },
    {
        category: "Talent & Performance",
        description: "Grow your people and your business.",
        items: [
            { title: "Recruitment", icon: Users, desc: "AI-powered ATS with resume parsing and candidate ranking." },
            { title: "Performance", icon: TrendingUp, desc: "Continuous feedback, goals, and 360-degree reviews." },
            { title: "Learning & Development", icon: GraduationCap, desc: "LMS with personalized learning paths and certification." },
            { title: "Succession Planning", icon: Users, desc: "Identify and groom the next generation of leaders." }
        ]
    },
    {
        category: "Strategic HR",
        description: "Data-driven insights for decision makers.",
        items: [
            { title: "People Analytics", icon: Brain, desc: "Predictive insights on attrition, engagement, and costs." },
            { title: "Org Design", icon: Building2, desc: "Model and visualize organizational structures." },
            { title: "Compensation", icon: Briefcase, desc: "Salary planning and market benchmarking." },
            { title: "Compliance", icon: Shield, desc: "Ensure adherence to global labor laws and regulations." }
        ]
    }
];

const industries = [
    { title: "Healthcare", icon: Stethoscope, desc: "Credentialing, nurse rostering, and locum management." },
    { title: "Retail", icon: ShoppingCart, desc: "Seasonal hiring, commission structures, and store ops." },
    { title: "Manufacturing", icon: Building2, desc: "Shift planning, safety compliance, and union management." },
    { title: "Education", icon: GraduationCap, desc: "Faculty tenure, research grants, and academic calendars." },
    { title: "Global Business", icon: Globe, desc: "Multi-country support for distributed international teams." },
];

export default function SolutionsPage() {
    return (
        <div className="bg-pearl dark:bg-deep-cosmos min-h-screen pb-20">
            {/* Header */}
            <section className="pt-32 pb-20 px-4 text-center bg-gradient-to-b from-white to-pearl dark:from-deep-cosmos dark:to-stellar-blue/10">
                <h1 className="text-4xl md:text-6xl font-display font-bold text-ink-black dark:text-pearl mb-6">
                    Solutions for every stage of growth
                </h1>
                <p className="text-xl text-twilight dark:text-silver-mist max-w-2xl mx-auto">
                    Whether you're a scaling startup or a global enterprise, AuraOS adapts to your unique workforce needs.
                </p>
            </section>

            {/* Core Solutions Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
                {solutions.map((section, idx) => (
                    <div key={idx}>
                        <div className="mb-10 text-center md:text-left">
                            <h2 className="text-3xl font-bold text-ink-black dark:text-pearl mb-2">{section.category}</h2>
                            <p className="text-lg text-twilight dark:text-silver-mist">{section.description}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            {section.items.map((item, i) => (
                                <div key={i} className="bg-white dark:bg-stellar-blue/5 p-6 rounded-xl border border-cloud dark:border-nebula-purple hover:shadow-lg transition-shadow group">
                                    <div className="w-10 h-10 rounded-lg bg-celestial-indigo/10 dark:bg-quantum-rose/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <item.icon className="w-5 h-5 text-celestial-indigo dark:text-quantum-rose" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-ink-black dark:text-pearl mb-2">{item.title}</h3>
                                    <p className="text-sm text-twilight dark:text-silver-mist leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Industry Solutions */}
            <section className="mt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-celestial-indigo rounded-3xl p-12 md:p-20 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Tailored for your Industry</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
                            {industries.map((ind, i) => (
                                <div key={i} className="text-center group">
                                    <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                                        <ind.icon className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">{ind.title}</h3>
                                    <p className="text-sm text-white/70">{ind.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Decorative background circles */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
                </div>
            </section>
        </div>
    );
}

