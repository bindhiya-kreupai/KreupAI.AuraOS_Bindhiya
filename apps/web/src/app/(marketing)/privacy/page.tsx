import React from 'react';
import { ShieldCheck, Eye, Lock, Database, Mail } from 'lucide-react';

const sections = [
    {
        icon: Database,
        title: "1. Information We Collect",
        content: "We collect information you provide directly to us, such as when you create an account, update your profile, or contact customer support. This may include your name, email address, company information, and usage data to improve our services."
    },
    {
        icon: Eye,
        title: "2. How We Use Your Information",
        content: "We use the information we collect to operate, maintain, and improve our services, to communicate with you about updates and new features, to provide customer support, and to protect our users and services from abuse."
    },
    {
        icon: Lock,
        title: "3. Data Security",
        content: "We implement appropriate technical and organizational measures to protect the security of your personal information, including encryption at rest and in transit, regular security audits, and strict access controls."
    },
    {
        icon: ShieldCheck,
        title: "4. Your Rights",
        content: "You have the right to access, correct, or delete your personal data. You can export your data at any time, and we honor all GDPR and CCPA requests within the legally required timeframes."
    }
];

export default function PrivacyPage() {
    return (
        <div className="bg-pearl dark:bg-deep-cosmos min-h-screen">
            {/* Header */}
            <section className="pt-32 pb-16 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-celestial-indigo/5 to-transparent dark:from-celestial-indigo/10" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-celestial-indigo/10 mb-6">
                        <ShieldCheck className="w-8 h-8 text-celestial-indigo" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-ink-black dark:text-pearl mb-4">
                        Privacy Policy
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
                    <Mail className="w-8 h-8 text-celestial-indigo mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-4">Privacy Questions?</h3>
                    <p className="text-white/60 mb-6">Our Data Protection Officer is here to help.</p>
                    <a
                        href="mailto:privacy@auraos.com"
                        className="inline-flex items-center gap-2 text-celestial-indigo hover:text-celestial-indigo/80 font-medium"
                    >
                        privacy@auraos.com
                    </a>
                </div>
            </section>
        </div>
    );
}
