"use client";

import React, { useState, useEffect } from 'react';
import {
    BrainCircuit,
    Plus,
    MessageSquare,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { IntentService } from '../services';

export default function IntentLibraryPage() {
    const [intents, setIntents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await IntentService.getAllIntents();
            if (result.length > 0) {
                setIntents(result);
            }
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BrainCircuit className="w-6 h-6 text-indigo-500" />
                        Intent Library
                    </h1>
                    <p className="text-slate-500 text-sm">Manage what the users want to do.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all">
                    <Plus className="w-4 h-4" /> Create Intent
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pb-20">
                {[
                    { name: '#ApplyLeave', confidence: 98, phrases: 45, status: 'Active', desc: 'User wants to submit a leave request' },
                    { name: '#CheckBalance', confidence: 95, phrases: 32, status: 'Active', desc: 'User queries leave or salary balance' },
                    { name: '#ResetPassword', confidence: 99, phrases: 60, status: 'Active', desc: 'IT support for password reset' },
                    { name: '#UpdateProfile', confidence: 85, phrases: 12, status: 'Needs Training', desc: 'Change address or contact info' },
                    { name: '#AskPolicy', confidence: 90, phrases: 28, status: 'Active', desc: 'General HR policy questions' },
                    { name: '#ReportIncident', confidence: 88, phrases: 15, status: 'Active', desc: 'Safety or harassment reporting' }
                ].map((intent, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-indigo-500 transition-all group cursor-pointer">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                                    {intent.name}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">{intent.desc}</p>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1
                                ${intent.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {intent.status === 'Active' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                {intent.status}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <MessageSquare className="w-4 h-4" />
                                <span className="font-bold">{intent.phrases}</span> phrases
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <BrainCircuit className="w-4 h-4" />
                                <span className="font-bold">{intent.confidence}%</span> accuracy
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

