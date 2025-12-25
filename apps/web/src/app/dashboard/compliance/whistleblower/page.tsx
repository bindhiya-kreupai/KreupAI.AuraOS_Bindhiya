"use client";

import React, { useState, useEffect } from 'react';
import {
    Ear,
    MessageSquare,
    Shield,
    Lock,
    Send,
    Info
} from 'lucide-react';
import { WhistleblowerService } from '../services';

export default function WhistleblowerPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const data = await WhistleblowerService.getReports();
            setReports(data);
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Ear className="w-6 h-6 text-indigo-500" />
                        Whistleblower Portal
                    </h1>
                    <p className="text-slate-500 text-sm">Anonymous reporting for ethics violations and fraud.</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">
                {/* Reporting Form */}
                <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 overflow-y-auto">
                    <div className="max-w-2xl mx-auto">
                        <div className="mb-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 flex gap-4">
                            <Shield className="w-8 h-8 text-indigo-600 shrink-0" />
                            <div>
                                <h3 className="font-bold text-indigo-900 dark:text-indigo-300">Your Identity is Protected</h3>
                                <p className="text-sm text-indigo-800 dark:text-indigo-400 mt-1">
                                    We use end-to-end encryption. You can choose to remain 100% anonymous. No IP logs are stored.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Category</label>
                                <select className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none">
                                    <option>Financial Fraud / Embezzlement</option>
                                    <option>Data Privacy Breach</option>
                                    <option>Conflict of Interest</option>
                                    <option>Unfair Bias / Discrimination</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Details</label>
                                <textarea
                                    className="w-full h-40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none resize-none"
                                    placeholder="Describe the incident. Provide dates, names, and specifics if possible..."
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Evidence (Optional)</label>
                                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                                    <Lock className="w-6 h-6 mb-2" />
                                    <span className="text-sm">Drag & drop files securely</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <button className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2">
                                    <Send className="w-4 h-4" /> Submit Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="w-full lg:w-80 shrink-0 space-y-6">
                    <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Info className="w-5 h-5" /> What happens next?
                        </h3>
                        <ol className="list-decimal list-inside space-y-3 text-sm opacity-90 marker:font-bold">
                            <li>Report is encrypted & sent to Ethics Committee.</li>
                            <li>A unique Case ID is generated for you.</li>
                            <li>You can use this ID to track status or chat anonymously later.</li>
                            <li>Investigation begins within 48 hours.</li>
                        </ol>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold mb-4">Track Existing Report</h3>
                        <input
                            type="text"
                            placeholder="Enter Case ID (e.g. WH-2910)"
                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border border-slate-200 dark:border-slate-700 mb-2 outline-none"
                        />
                        <button className="w-full py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-sm rounded-xl">
                            Access Status
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
