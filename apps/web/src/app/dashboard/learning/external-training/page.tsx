"use client";

import React, { useState, useEffect } from 'react';
import {
    Globe,
    UploadCloud,
    FileText,
    Loader2
} from 'lucide-react';
import { ExternalTrainingService } from '../services';

export default function ExternalTrainingPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await ExternalTrainingService.getExternalTraining();
                setData(result);
            } catch (error: any) {
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
                        <Globe className="w-6 h-6 text-indigo-500" />
                        External Training
                    </h1>
                    <p className="text-slate-500 text-sm">Manage certifications and training from external providers.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <UploadCloud className="w-4 h-4" /> Submit Certificate
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : data.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <Globe className="w-12 h-12 mb-4 opacity-30" />
                    <p className="font-bold">No external training records</p>
                    <p className="text-sm">External certifications will appear here once submitted.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {data.map((cert, i) => (
                        <div key={cert.id || i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                    cert.approvalStatus === 'approved' || cert.completionStatus === 'completed'
                                        ? 'bg-emerald-100 text-emerald-600'
                                        : 'bg-amber-100 text-amber-600'
                                }`}>{cert.approvalStatus || cert.completionStatus || 'Pending'}</span>
                            </div>
                            <h4 className="font-bold text-lg mb-1">{cert.title}</h4>
                            <p className="text-sm text-slate-500 mb-4">{cert.provider}</p>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-sm">
                                <div className="flex justify-between mb-1">
                                    <span className="text-slate-500">Employee:</span>
                                    <span className="font-bold">{cert.learnerName || cert.learnerId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Completed:</span>
                                    <span>{cert.completionDate ? new Date(cert.completionDate).toLocaleDateString() : cert.endDate ? new Date(cert.endDate).toLocaleDateString() : '-'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

