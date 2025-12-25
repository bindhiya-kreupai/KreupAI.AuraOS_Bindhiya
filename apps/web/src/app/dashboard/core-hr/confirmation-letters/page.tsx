"use client";

import React, { useState, useEffect } from 'react';
import {
    FileCheck,
    Send,
    Download,
    Eye
} from 'lucide-react';
import { ConfirmationLetterService } from '../services';

export default function ConfirmationLettersPage() {
    const [confirmationLetters, setConfirmationLetters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConfirmationLetters();
    }, []);

    const fetchConfirmationLetters = async () => {
        try {
            const data = await ConfirmationLetterService.getAllConfirmationLetters();
            setConfirmationLetters(data);
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    const [pending, setPending] = useState([
        { id: 1, name: 'Michael Chen', date: 'Confirmed on Dec 01', status: 'Pending Issue' }
    ]);

    const handleIssue = (id: number) => {
        alert("Letter generated and sent to employee via email.");
        setPending(prev => prev.filter(p => p.id !== id));
    };

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileCheck className="w-6 h-6 text-emerald-500" />
                        Confirmation Letters
                    </h1>
                    <p className="text-slate-500 text-sm">Issue official confirmation letters post-probation.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Issue */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="font-bold text-lg mb-4">Ready for Issuance</h3>
                    {pending.length > 0 ? (
                        <div className="space-y-4">
                            {pending.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div>
                                        <div className="font-bold">{item.name}</div>
                                        <div className="text-xs text-slate-500">{item.date}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500" title="Preview">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleIssue(item.id)}
                                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-1"
                                        >
                                            <Send className="w-3 h-3" /> Issue Letter
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-400">
                            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No pending letters to issue.</p>
                        </div>
                    )}
                </div>

                {/* History */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="font-bold text-lg mb-4">Recently Issued</h3>
                    <div className="space-y-3">
                        {[
                            { name: 'Sarah Williams', date: 'Issued Nov 15, 2023' },
                            { name: 'David Miller', date: 'Issued Oct 30, 2023' },
                        ].map((row, i) => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                                        <FileCheck className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">{row.name}</div>
                                        <div className="text-xs text-slate-500">{row.date}</div>
                                    </div>
                                </div>
                                <button className="text-indigo-600 text-xs font-bold hover:underline flex items-center gap-1">
                                    <Download className="w-3 h-3" /> PDF
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function CheckCircle2(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg> }
