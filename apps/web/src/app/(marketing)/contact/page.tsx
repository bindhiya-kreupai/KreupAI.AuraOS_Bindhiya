import React from 'react';
import { Button } from '@aura/ui/components/ui/button';

export default function ContactPage() {
    return (
        <div className="bg-pearl dark:bg-deep-cosmos min-h-screen pt-32 pb-24 flex items-center justify-center">
            <div className="max-w-5xl w-full mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-16">
                <div>
                    <h1 className="text-4xl font-display font-bold text-ink-black dark:text-pearl mb-6">Let's talk</h1>
                    <p className="text-lg text-twilight dark:text-silver-mist mb-8">
                        Have questions about AuraOS? Interested in a custom demo? Our team is ready to help.
                    </p>

                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-ink-black dark:text-pearl">Sales</h3>
                            <a href="mailto:sales@aurahcm.com" className="text-celestial-indigo hover:underline">sales@aurahcm.com</a>
                        </div>
                        <div>
                            <h3 className="font-semibold text-ink-black dark:text-pearl">Support</h3>
                            <a href="mailto:support@aurahcm.com" className="text-celestial-indigo hover:underline">support@aurahcm.com</a>
                        </div>
                        <div>
                            <h3 className="font-semibold text-ink-black dark:text-pearl">Headquarters</h3>
                            <p className="text-twilight dark:text-silver-mist">
                                405 Lexington Ave<br />
                                New York, NY 10174
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-stellar-blue/5 p-8 rounded-2xl border border-cloud dark:border-nebula-purple shadow-sm">
                    <form className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-ink-black dark:text-pearl">First Name</label>
                                <input type="text" className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple bg-transparent focus:outline-none focus:ring-2 focus:ring-celestial-indigo" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-ink-black dark:text-pearl">Last Name</label>
                                <input type="text" className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple bg-transparent focus:outline-none focus:ring-2 focus:ring-celestial-indigo" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-ink-black dark:text-pearl">Work Email</label>
                            <input type="email" className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple bg-transparent focus:outline-none focus:ring-2 focus:ring-celestial-indigo" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-ink-black dark:text-pearl">Company Size</label>
                            <select className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple bg-transparent focus:outline-none focus:ring-2 focus:ring-celestial-indigo">
                                <option>1 - 50 employees</option>
                                <option>51 - 200 employees</option>
                                <option>201 - 1,000 employees</option>
                                <option>1,000+ employees</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-ink-black dark:text-pearl">Message</label>
                            <textarea rows={4} className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple bg-transparent focus:outline-none focus:ring-2 focus:ring-celestial-indigo" />
                        </div>
                        <Button className="w-full bg-celestial-indigo hover:bg-celestial-indigo/90 text-white rounded-lg h-11">
                            Send Message
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
