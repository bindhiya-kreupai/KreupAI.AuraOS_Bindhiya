import React from 'react';
import { Server, ShieldCheck, Zap, Globe2, Code2, Lock } from 'lucide-react';
import { Button } from '@aura/ui/components/ui/button';

export default function PlatformPage() {
    return (
        <div className="bg-pearl dark:bg-deep-cosmos min-h-screen">
            {/* Sub-hero */}
            <section className="pt-32 pb-20 px-4 text-center">
                <span className="text-celestial-indigo font-semibold tracking-wider text-sm uppercase">The AuraOS Architecture</span>
                <h1 className="mt-4 text-4xl md:text-6xl font-display font-bold text-ink-black dark:text-pearl max-w-4xl mx-auto leading-tight">
                    Built for the future of <br /> enterprise intelligence
                </h1>
            </section>

            {/* Architecture Diagram Placeholder */}
            <div className="max-w-6xl mx-auto px-4 mb-24">
                <div className="aspect-[21/9] bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 shadow-2xl flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    {/* Conceptual Nodes */}
                    <div className="relative z-10 flex gap-12 items-center">
                        <div className="p-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-center">
                            <Server className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                            <div className="text-white font-mono text-sm">Data Lake</div>
                        </div>
                        <div className="h-px w-20 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse" />
                        <div className="p-8 bg-celestial-indigo/20 backdrop-blur-md rounded-2xl border border-celestial-indigo/50 text-center shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                            <Zap className="w-12 h-12 text-celestial-indigo mx-auto mb-4" />
                            <div className="text-white font-bold text-lg">Aura Neural Engine</div>
                            <div className="text-white/60 text-xs mt-1">Real-time Inference</div>
                        </div>
                        <div className="h-px w-20 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse" />
                        <div className="p-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-center">
                            <Globe2 className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                            <div className="text-white font-mono text-sm">Global Edge</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Technical Pillars */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {[
                        {
                            icon: ShieldCheck,
                            title: "Enterprise Grade Security",
                            desc: "SOC2 Type II certified. End-to-end encryption for all data at rest and in transit. Granular field-level permission controls."
                        },
                        {
                            icon: Code2,
                            title: "API-First Design",
                            desc: "Every feature in AuraOS is accessible via our GraphQL API. Build custom workflows or integrate with your existing stack seamlessly."
                        },
                        {
                            icon: Zap,
                            title: "Real-time Processing",
                            desc: "Built on an edge-ready distributed architecture. No batch jobs over the weekend—payrolls and reports generate instantly."
                        },
                        {
                            icon: Globe2,
                            title: "Global Compliance Engine",
                            desc: "Automatically updates with local labor laws and tax regulations across 150+ countries. Stay compliant without the headache."
                        },
                        {
                            icon: Lock,
                            title: "Privacy by Design",
                            desc: "GDPR, CCPA, and HIPAA compliant. Automated data retention policies and right-to-be-forgotten workflows built-in."
                        },
                        {
                            icon: Server,
                            title: "Scalable Infrastructure",
                            desc: "Auto-scaling Kubernetes clusters ensure 99.99% uptime whether you support 500 or 500,000 employees."
                        }
                    ].map((feature, i) => (
                        <div key={i} className="flex flex-col items-start gap-4">
                            <div className="p-3 bg-cloud dark:bg-stellar-blue/10 rounded-lg">
                                <feature.icon className="w-6 h-6 text-celestial-indigo" />
                            </div>
                            <h3 className="text-xl font-bold text-ink-black dark:text-pearl">{feature.title}</h3>
                            <p className="text-twilight dark:text-silver-mist leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* API Callout */}
            <section className="bg-ink-black dark:bg-black py-24 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-display font-bold mb-6">Develop deeply integrated extensions</h2>
                        <p className="text-lg text-white/70 mb-8">
                            Our Developer Platform provides webhooks, SDKs, and a sandboxed environment to build custom apps on top of employee data securely.
                        </p>
                        <Button className="bg-white text-black hover:bg-white/90 rounded-full px-8">Read the API Docs</Button>
                    </div>
                    <div className="bg-slate-900 rounded-xl p-6 font-mono text-sm shadow-inner shadow-black/50 border border-slate-800">
                        <div className="flex gap-2 mb-4">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                        </div>
                        <div className="space-y-2 text-slate-300">
                            <p><span className="text-purple-400">const</span> <span className="text-blue-400">aura</span> = <span className="text-purple-400">new</span> AuraClient(API_KEY);</p>
                            <p>&nbsp;</p>
                            <p><span className="text-slate-500">// Fetch high-risk attrition candidates</span></p>
                            <p><span className="text-purple-400">const</span> risks = <span className="text-purple-400">await</span> aura.analytics.<span className="text-yellow-400">getFlightRisks</span>(&#123;</p>
                            <p className="pl-4">threshold: <span className="text-orange-400">0.85</span>,</p>
                            <p className="pl-4">department: <span className="text-green-400">'Engineering'</span></p>
                            <p>&#125;);</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
