import React from 'react';
import { Users, Rocket, Target, Heart, Globe, Award } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@aura/ui/components/ui/button';

const values = [
    {
        icon: Users,
        title: "People First",
        desc: "We build technology that amplifies human potential, not replaces it."
    },
    {
        icon: Target,
        title: "Relentless Focus",
        desc: "Every feature we ship solves a real problem for real teams."
    },
    {
        icon: Heart,
        title: "Empathy at Scale",
        desc: "Great HR tech should feel personal, even at 10,000 employees."
    },
    {
        icon: Rocket,
        title: "Move Fast",
        desc: "We ship weekly. Our customers see value in weeks, not quarters."
    }
];

const leadership = [
    { name: "Alex Chen", role: "CEO & Co-founder", avatar: "AC" },
    { name: "Priya Sharma", role: "CTO & Co-founder", avatar: "PS" },
    { name: "Marcus Williams", role: "VP of Product", avatar: "MW" },
    { name: "Sarah Kim", role: "VP of Engineering", avatar: "SK" },
];

export default function AboutPage() {
    return (
        <div className="bg-pearl dark:bg-deep-cosmos min-h-screen">
            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-celestial-indigo/5 to-transparent dark:from-celestial-indigo/10" />
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <span className="text-celestial-indigo font-semibold tracking-wider text-sm uppercase mb-4 block">About AuraOS</span>
                    <h1 className="text-4xl md:text-6xl font-display font-bold text-ink-black dark:text-pearl mb-8 leading-tight">
                        We're building the operating <br className="hidden md:block" />system for work
                    </h1>
                    <p className="text-xl text-twilight dark:text-silver-mist max-w-2xl mx-auto leading-relaxed">
                        AuraOS is the world's first agentic HCM platform, using AI to help organizations unlock the full potential of their people.
                    </p>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="bg-ink-black dark:bg-white/5 py-16">
                <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { val: "2023", label: "Founded" },
                        { val: "500+", label: "Customers" },
                        { val: "45", label: "Countries" },
                        { val: "120", label: "Team Members" },
                    ].map((stat, i) => (
                        <div key={i}>
                            <div className="text-4xl font-bold text-white mb-2">{stat.val}</div>
                            <div className="text-sm text-white/60 uppercase tracking-wider">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Our Story */}
            <section className="py-24 px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-display font-bold text-ink-black dark:text-pearl mb-12 text-center">Our Story</h2>
                    <div className="prose prose-lg dark:prose-invert mx-auto text-twilight dark:text-silver-mist">
                        <p>
                            We started AuraOS in 2023 with a simple observation: the tools companies use to manage their most valuable asset—their people—are fragmented, outdated, and often infuriating to use.
                        </p>
                        <p>
                            Our founders, having spent years building enterprise software at leading tech companies, believed there had to be a better way. What if HR software could be as intuitive as consumer apps? What if AI could handle the busywork so HR teams could focus on what matters—their people?
                        </p>
                        <p>
                            Today, AuraOS processes millions of data points daily, helping HR leaders make smarter decisions and employees have better work experiences. We're just getting started.
                        </p>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-24 px-4 bg-white dark:bg-stellar-blue/5">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-display font-bold text-ink-black dark:text-pearl mb-16 text-center">What We Believe</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, i) => (
                            <div key={i} className="p-6 rounded-2xl border border-cloud dark:border-nebula-purple bg-pearl dark:bg-deep-cosmos hover:shadow-lg transition-shadow group">
                                <div className="w-12 h-12 rounded-xl bg-celestial-indigo/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <value.icon className="w-6 h-6 text-celestial-indigo" />
                                </div>
                                <h3 className="text-lg font-bold text-ink-black dark:text-pearl mb-2">{value.title}</h3>
                                <p className="text-sm text-twilight dark:text-silver-mist leading-relaxed">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Leadership */}
            <section className="py-24 px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-display font-bold text-ink-black dark:text-pearl mb-16 text-center">Leadership</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {leadership.map((person, i) => (
                            <div key={i} className="text-center group">
                                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-celestial-indigo to-quantum-rose flex items-center justify-center mb-4 text-white text-2xl font-bold group-hover:scale-105 transition-transform">
                                    {person.avatar}
                                </div>
                                <h3 className="font-semibold text-ink-black dark:text-pearl">{person.name}</h3>
                                <p className="text-sm text-twilight dark:text-silver-mist">{person.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Investors/Backed By */}
            <section className="py-24 px-4 bg-ink-black dark:bg-white/5">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-2xl font-display font-bold text-white mb-8">Backed by the best</h2>
                    <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
                        {["Sequoia", "Accel", "a16z", "Index"].map((investor, i) => (
                            <span key={i} className="text-2xl font-bold text-white tracking-tight">{investor}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <Globe className="w-12 h-12 text-celestial-indigo mx-auto mb-6" />
                    <h2 className="text-3xl font-display font-bold text-ink-black dark:text-pearl mb-6">Join our mission</h2>
                    <p className="text-lg text-twilight dark:text-silver-mist mb-8">
                        We're hiring across engineering, product, design, and go-to-market. Come build the future of work with us.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                        <Link href="/contact">
                            <Button className="h-12 px-8 rounded-full bg-celestial-indigo hover:bg-celestial-indigo/90 text-white">
                                Get in Touch
                            </Button>
                        </Link>
                        <Link href="/auth/register">
                            <Button variant="outline" className="h-12 px-8 rounded-full border-cloud dark:border-nebula-purple">
                                Start Free Trial
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

