import React from 'react';
import { FileText, Scale, AlertTriangle, ShieldCheck } from 'lucide-react';

const sections = [
    {
        icon: Scale,
        title: "1. Acceptance of Terms",
        content: "By accessing and using AuraOS, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site."
    },
    {
        icon: FileText,
        title: "2. Use License",
        content: "Permission is granted to temporarily download one copy of the materials (information or software) on AuraOS's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title."
    },
    {
        icon: AlertTriangle,
        title: "3. Disclaimer",
        content: "The materials on AuraOS's website are provided on an 'as is' basis. AuraOS makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property."
    },
    {
        icon: ShieldCheck,
        title: "4. Limitations",
        content: "In no event shall AuraOS or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on AuraOS's website."
    }
];

export default function TermsPage() {
    return (
        <div className="bg-pearl dark:bg-deep-cosmos min-h-screen">
            {/* Header */}
            <section className="pt-32 pb-16 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-celestial-indigo/5 to-transparent dark:from-celestial-indigo/10" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-celestial-indigo/10 mb-6">
                        <FileText className="w-8 h-8 text-celestial-indigo" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-ink-black dark:text-pearl mb-4">
                        Terms of Service
                    </h1>
                    <p className="text-twilight dark:text-silver-mist">
                        Last updated: December 7, 2025
                    </p>
                </div>
            </section>

            {/* Content Cards */}
            <section className="pb-24 px-4">
                <div className="max-w-4xl mx-auto space-y-6">
                    {sections.map((section, i) => (
                        <div
                            key={i}
                            className="bg-white dark:bg-stellar-blue/5 rounded-2xl border border-cloud dark:border-nebula-purple p-8 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-celestial-indigo/10 rounded-xl shrink-0">
                                    <section.icon className="w-6 h-6 text-celestial-indigo" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-ink-black dark:text-pearl mb-3">
                                        {section.title}
                                    </h2>
                                    <p className="text-twilight dark:text-silver-mist leading-relaxed">
                                        {section.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Contact Section */}
            <section className="bg-ink-black dark:bg-white/5 py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h3 className="text-xl font-semibold text-white mb-4">Questions about our terms?</h3>
                    <p className="text-white/60 mb-6">Contact our legal team for clarification.</p>
                    <a
                        href="mailto:legal@auraos.com"
                        className="inline-flex items-center gap-2 text-celestial-indigo hover:text-celestial-indigo/80 font-medium"
                    >
                        legal@auraos.com
                    </a>
                </div>
            </section>
        </div>
    );
}
