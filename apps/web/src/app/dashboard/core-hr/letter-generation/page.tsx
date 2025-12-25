"use client";

import React, { useState, useEffect } from 'react';
import {
    FileText,
    Printer,
    Send,
    Eye,
    Download
} from 'lucide-react';
import { LetterService } from '../services';

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

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">Employee</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {[
                                    { name: 'Alice Cooper', type: 'Promotion Letter', date: 'Oct 01, 2023' },
                                    { name: 'Bob Marley', type: 'Salary Revision', date: 'Apr 01, 2023' },
                                    { name: 'Charlie Puth', type: 'Confirmation Letter', date: 'Jan 15, 2023' },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{row.name}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{row.type}</td>
                                        <td className="px-6 py-4 text-slate-500">{row.date}</td>
                                        <td className="px-6 py-4 flex justify-end gap-2 text-slate-400">
                                            <button onClick={() => handleAction('Preview', row.type)} className="hover:text-indigo-600 hover:bg-slate-100 p-1 rounded transition-colors" title="View"><Eye className="w-4 h-4" /></button>
                                            <button onClick={() => handleAction('Download', row.type)} className="hover:text-indigo-600 hover:bg-slate-100 p-1 rounded transition-colors" title="Download"><Download className="w-4 h-4" /></button>
                                            <button onClick={() => handleAction('Print', row.type)} className="hover:text-indigo-600 hover:bg-slate-100 p-1 rounded transition-colors" title="Print"><Printer className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
