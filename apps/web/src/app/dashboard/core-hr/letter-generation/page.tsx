"use client";

import React, { useState, useEffect } from 'react';
import {
    FileText,
    Printer,
    Eye,
    Download
} from 'lucide-react';
import { LetterService } from '../services';

const letterTypeLabels: Record<string, string> = {
    employment_verification: 'Employment Verification',
    experience: 'Experience Letter',
    salary: 'Salary Letter',
    promotion: 'Promotion Letter',
    transfer: 'Transfer Letter',
    custom: 'Custom Letter',
};

export default function LetterGenerationPage() {
    const [letterRequests, setLetterRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLetterRequests();
    }, []);

    const fetchLetterRequests = async () => {
        try {
            const data = await LetterService.getAllLetterRequests();
            setLetterRequests(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (action: string, letterType: string) => {
        alert(`${action} for ${letterType}`);
    };

    const formatDate = (date: Date | string | undefined) => {
        if (!date) return '-';
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    };

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="w-6 h-6 text-indigo-500" />
                        Letter Generation
                    </h1>
                    <p className="text-slate-500 text-sm">Create and issue HR letters (Offer, Appointment, Promotion, Relieving).</p>
                </div>
                <button
                    onClick={() => handleAction('Creating', 'New Letter')}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                >
                    Create New Letter
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Templates */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="font-bold text-slate-500 text-xs uppercase">Templates</h3>
                    {['Appointment Letter', 'Promotion Letter', 'Salary Revision', 'Relieving Letter', 'Address Proof'].map((t, i) => (
                        <div
                            key={i}
                            onClick={() => handleAction('Previewing Template', t)}
                            className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all group"
                        >
                            <div className="font-bold text-sm group-hover:text-indigo-600 transition-colors">{t}</div>
                            <div className="text-xs text-slate-400 mt-1">Last edited: 2 days ago</div>
                        </div>
                    ))}
                </div>

                {/* History */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="font-bold text-lg mb-4">Issued Letters History</h3>
                    {loading && (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                        </div>
                    )}
                    {!loading && letterRequests.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                            <FileText className="w-12 h-12 mb-4 opacity-50" />
                            <p className="text-lg font-medium">No letters found</p>
                            <p className="text-sm">Letters will appear here once they are generated.</p>
                        </div>
                    )}
                    {!loading && letterRequests.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                                    <tr>
                                        <th className="px-6 py-4">Employee</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {letterRequests.map((row) => (
                                        <tr key={row.requestId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{row.employeeName}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{letterTypeLabels[row.letterType] || row.letterType}</td>
                                            <td className="px-6 py-4 text-slate-500">{formatDate(row.generatedDate || row.requestDate)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-bold px-2 py-1 rounded ${
                                                    row.status === 'issued' ? 'bg-emerald-100 text-emerald-600' :
                                                    row.status === 'approved' ? 'bg-blue-100 text-blue-600' :
                                                    row.status === 'generated' ? 'bg-amber-100 text-amber-600' :
                                                    row.status === 'rejected' ? 'bg-rose-100 text-rose-600' :
                                                    'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 flex justify-end gap-2 text-slate-400">
                                                <button onClick={() => handleAction('Preview', row.employeeName)} className="hover:text-indigo-600 hover:bg-slate-100 p-1 rounded transition-colors" title="View"><Eye className="w-4 h-4" /></button>
                                                <button onClick={() => handleAction('Download', row.employeeName)} className="hover:text-indigo-600 hover:bg-slate-100 p-1 rounded transition-colors" title="Download"><Download className="w-4 h-4" /></button>
                                                <button onClick={() => handleAction('Print', row.employeeName)} className="hover:text-indigo-600 hover:bg-slate-100 p-1 rounded transition-colors" title="Print"><Printer className="w-4 h-4" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

