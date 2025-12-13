import React from 'react';
import { Button } from '@aura/ui/components/ui/button';
import { Check } from 'lucide-react';

const plans = [
    {
        name: "Starter",
        price: "$8",
        period: "/user/mo",
        desc: "Essential HR tools for small growing teams.",
        features: ["Core HR & Employee Database", "Time & Attendance", "Basic Payroll Integration", "Mobile App Access", "Self-Service Portal"],
        cta: "Start Free Trial",
        popular: false
    },
    {
        name: "Professional",
        price: "$15",
        period: "/user/mo",
        desc: "Advanced automation and analytics for scaling companies.",
        features: ["Everything in Starter", "Performance Management", "Recruitment (ATS)", "AI Resume Screening", "Custom Reports", "Slack/Teams Integration"],
        cta: "Get Started",
        popular: true
    },
    {
        name: "Enterprise",
        price: "Custom",
        period: "",
        desc: "Full-platform power for complex localized organizations.",
        features: ["Everything in Professional", "Global Payroll & Compliance", "Succession Planning", "Org Design Modeling", "Dedicated Success Manager", "SLA & 99.99% Uptime"],
        cta: "Contact Sales",
        popular: false
    }
];

export default function PricingPage() {
    return (
        <div className="bg-pearl dark:bg-deep-cosmos min-h-screen pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-ink-black dark:text-pearl mb-6">Simple, transparent pricing</h1>
                    <p className="text-xl text-twilight dark:text-silver-mist">No hidden implementation fees. Cancel anytime.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, i) => (
                        <div key={i} className={`relative rounded-2xl p-8 flex flex-col ${plan.popular ? 'bg-white dark:bg-deep-cosmos border-2 border-celestial-indigo shadow-2xl scale-105 z-10' : 'bg-pearl dark:bg-stellar-blue/10 border border-cloud dark:border-nebula-purple'}`}>
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-celestial-indigo text-white px-4 py-1 rounded-full text-sm font-semibold tracking-wide">
                                    MOST POPULAR
                                </div>
                            )}
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-ink-black dark:text-pearl mb-2">{plan.name}</h3>
                                <p className="text-twilight dark:text-silver-mist text-sm min-h-[40px]">{plan.desc}</p>
                            </div>
                            <div className="mb-8">
                                <span className="text-4xl font-bold text-ink-black dark:text-pearl">{plan.price}</span>
                                <span className="text-twilight dark:text-silver-mist">{plan.period}</span>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature, f) => (
                                    <li key={f} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-celestial-indigo shrink-0" />
                                        <span className="text-sm text-ink-black dark:text-pearl">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button className={`w-full rounded-full h-12 ${plan.popular ? 'bg-celestial-indigo hover:bg-celestial-indigo/90 text-white' : 'bg-white dark:bg-stellar-blue/20 text-ink-black dark:text-pearl border border-cloud hover:bg-cloud/50'}`}>
                                {plan.cta}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
