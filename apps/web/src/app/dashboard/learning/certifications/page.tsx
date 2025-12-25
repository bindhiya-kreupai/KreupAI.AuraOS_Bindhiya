"use client";

import React, { useState, useEffect } from 'react';
import {
    Award,
    Download,
    Share2,
    Search
} from 'lucide-react';
import { CertificationService } from '../services';

export default function CertificationsPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await CertificationService.getCertifications();
                setData(result);
            } catch (error) {
            console.error('Error:', error);
                                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Award className="w-6 h-6 text-indigo-500" />
                        Certifications
                    </h1>
                    <p className="text-slate-500 text-sm">View and manage earned certificates.</p>
                </div>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search employee or cert..."
                        className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { title: 'Certified Safety Officer', recipient: 'David Lee', date: 'Oct 15, 2024', id: 'CERT-8842', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
                    { title: 'Project Management Pro', recipient: 'Alice Johnson', date: 'Sep 22, 2024', id: 'CERT-9921', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/10' },
                    { title: 'Advanced React Developer', recipient: 'Charlie Brown', date: 'Oct 01, 2024', id: 'CERT-1234', color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/10' },
                ].map((cert, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center relative overflow-hidden group">
                        <div className={`absolute top-0 left-0 w-full h-2 ${cert.bg.replace('bg-', 'bg-gradient-to-r from-transparent via-').replace('/10', '')} to-transparent`}></div>

                        <div className={`p-4 rounded-full ${cert.bg} mb-4`}>
                            <Award className={`w-8 h-8 ${cert.color}`} />
                        </div>

                        <h3 className="font-bold text-lg mb-1">{cert.title}</h3>
                        <p className="text-sm text-slate-500 mb-4">Awarded to <span className="font-bold text-slate-900 dark:text-slate-100">{cert.recipient}</span></p>

                        <div className="text-xs font-mono text-slate-400 mb-6">ID: {cert.id} • {cert.date}</div>

                        <div className="flex gap-2 w-full">
                            <button className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold hover:bg-slate-200 text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2">
                                <Download className="w-4 h-4" /> PDF
                            </button>
                            <button className="flex-1 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 flex items-center justify-center gap-2">
                                <Share2 className="w-4 h-4" /> Share
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
