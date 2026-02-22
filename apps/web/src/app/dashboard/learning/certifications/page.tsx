"use client";

import React, { useState, useEffect } from 'react';
import {
    Award,
    Download,
    Share2,
    Search,
    Loader2
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
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
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

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : data.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <Award className="w-12 h-12 mb-4 opacity-30" />
                    <p className="font-bold">No certifications found</p>
                    <p className="text-sm">Certifications will appear here once issued.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {data.map((cert, i) => {
                        const colors = ['text-emerald-500', 'text-indigo-500', 'text-cyan-500'];
                        const bgs = ['bg-emerald-50 dark:bg-emerald-900/10', 'bg-indigo-50 dark:bg-indigo-900/10', 'bg-cyan-50 dark:bg-cyan-900/10'];
                        const colorIdx = i % colors.length;

                        return (
                            <div key={cert.id || i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center relative overflow-hidden group">
                                <div className={`p-4 rounded-full ${bgs[colorIdx]} mb-4`}>
                                    <Award className={`w-8 h-8 ${colors[colorIdx]}`} />
                                </div>

                                <h3 className="font-bold text-lg mb-1">{cert.certificateName || cert.name}</h3>
                                <p className="text-sm text-slate-500 mb-4">
                                    Awarded to <span className="font-bold text-slate-900 dark:text-slate-100">{cert.learnerName || cert.employeeId}</span>
                                </p>

                                <div className="text-xs font-mono text-slate-400 mb-6">
                                    ID: {cert.certificateNumber || cert.certificationId || cert.id} {cert.issuedDate ? `| ${new Date(cert.issuedDate).toLocaleDateString()}` : ''}
                                </div>

                                <div className="flex gap-2 w-full">
                                    <button className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold hover:bg-slate-200 text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2">
                                        <Download className="w-4 h-4" /> PDF
                                    </button>
                                    <button className="flex-1 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 flex items-center justify-center gap-2">
                                        <Share2 className="w-4 h-4" /> Share
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

