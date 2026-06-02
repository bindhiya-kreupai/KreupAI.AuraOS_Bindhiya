"use client";

import React, { useState, useEffect } from 'react';
import {
    ShieldAlert,
    MessageSquare,
    Clock,
    CheckCircle,
    Plus,
    FileText,
    MoreHorizontal,
    Search,
    Filter,
    AlertTriangle,
    Lock,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GrievanceService } from '../services';

const CATEGORIES = [
    'Harassment & Discrimination',
    'Payroll Discrepancy',
    'Workplace Safety',
    'Managerial Issues',
    'Policy Violation',
    'Other'
];

export default function GrievancePage() {
    const [fetching, setFetching] = useState(true);
    const [grievances, setGrievances] = useState<any[]>([]);
    const [selectedCase, setSelectedCase] = useState<any>(null);
    const [isRaisingNew, setIsRaisingNew] = useState(false);
    const [severity, setSeverity] = useState('Low');
    const [submitting, setSubmitting] = useState(false);
    const [newForm, setNewForm] = useState({ category: CATEGORIES[0], subject: '', description: '' });

    useEffect(() => {
        const fetchGrievances = async () => {
            try {
                const res = await GrievanceService.getGrievances();
                if (res?.success && Array.isArray(res.data)) {
                    setGrievances(res.data.map((g: any) => ({
                        id: g.id || g.grievanceId || `GRV-${Date.now()}`,
                        category: g.category || 'General',
                        subject: g.subject || g.title || 'Grievance',
                        date: g.createdAt ? new Date(g.createdAt).toISOString().split('T')[0] : '',
                        status: g.status || 'Open',
                        severity: g.severity || 'Low',
                        description: g.description || '',
                        updates: g.updates || g.timeline || [],
                    })));
                }
            } catch (err: any) {
                console.error('Failed to fetch grievances:', err);
            } finally {
                setFetching(false);
            }
        };
        fetchGrievances();
    }, []);

    const handleSubmitGrievance = async () => {
        if (!newForm.subject || !newForm.description) return;
        setSubmitting(true);
        try {
            const res = await GrievanceService.submitGrievance({
                category: newForm.category,
                subject: newForm.subject,
                description: newForm.description,
                severity,
            });
            if (res?.success && res.data) {
                setGrievances(prev => [{
                    id: res.data.id || `GRV-${Date.now()}`,
                    category: newForm.category,
                    subject: newForm.subject,
                    date: new Date().toISOString().split('T')[0],
                    status: 'Open',
                    severity,
                    description: newForm.description,
                    updates: [{ date: new Date().toLocaleString(), author: 'You', text: 'Ticket raised.' }],
                }, ...prev]);
                setIsRaisingNew(false);
                setNewForm({ category: CATEGORIES[0], subject: '', description: '' });
                setSeverity('Low');
            }
        } catch (err: any) {
            console.error('Failed to submit grievance:', err);
            alert('Failed to submit grievance. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col gap-3">
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-rose-500" />
                        Grievance Redressal
                    </h1>
                    <p className="text-silver-mist text-sm">Confidential channel for reporting and resolving workplace issues.</p>
                </div>
                <button
                    onClick={() => setIsRaisingNew(true)}
                    className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-lg shadow-rose-500/20"
                >
                    <Plus className="w-4 h-4" /> Raise Grievance
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
                <div className="lg:col-span-1 bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-cloud dark:border-nebula-purple/20 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search cases..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-sm focus:ring-2 focus:ring-rose-500/50"
                            />
                        </div>
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {grievances.length > 0 ? (
                            grievances.map((item: any) => (
                                <div
                                    key={item.id}
                                    onClick={() => { setSelectedCase(item); setIsRaisingNew(false); }}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${selectedCase?.id === item.id
                                            ? 'bg-rose-50 border-rose-200 dark:bg-rose-900/10 dark:border-rose-500/30 ring-1 ring-rose-500/50'
                                            : 'bg-white dark:bg-stellar-blue border-cloud dark:border-nebula-purple/20 hover:border-rose-200'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-mono text-slate-400">#{item.id}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide
                                            ${item.status === 'Resolved'
                                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                                                : 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                                            }`}
                                        >
                                            {item.status}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-ink-black dark:text-pearl text-sm line-clamp-1 mb-1">{item.subject}</h3>
                                    <div className="flex items-center gap-2 text-xs text-silver-mist">
                                        <span className="flex items-center gap-1">
                                            <AlertTriangle className={`w-3 h-3 ${item.severity === 'High' ? 'text-rose-500' : 'text-slate-400'}`} />
                                            {item.severity} Priority
                                        </span>
                                        <span>&#8226;</span>
                                        <span>{item.date}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-400">
                                <ShieldAlert className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No grievances filed yet</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 flex flex-col overflow-hidden relative">
                    <AnimatePresence mode="wait">
                        {isRaisingNew ? (
                            <motion.div
                                key="new-form"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="flex-1 p-8 overflow-y-auto"
                            >
                                <div className="max-w-xl mx-auto space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-bold flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-rose-500" /> New Grievance
                                        </h2>
                                        <button onClick={() => setIsRaisingNew(false)} className="text-sm text-slate-500 hover:text-slate-700">Cancel</button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Category</label>
                                            <select
                                                value={newForm.category}
                                                onChange={e => setNewForm(prev => ({ ...prev, category: e.target.value }))}
                                                className="w-full p-2.5 rounded-lg border border-cloud dark:border-slate-700 bg-transparent"
                                            >
                                                {CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">Subject</label>
                                            <input
                                                type="text"
                                                value={newForm.subject}
                                                onChange={e => setNewForm(prev => ({ ...prev, subject: e.target.value }))}
                                                className="w-full p-2.5 rounded-lg border border-cloud dark:border-slate-700 bg-transparent"
                                                placeholder="Brief summary of the issue"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">Description</label>
                                            <textarea
                                                rows={5}
                                                value={newForm.description}
                                                onChange={e => setNewForm(prev => ({ ...prev, description: e.target.value }))}
                                                className="w-full p-2.5 rounded-lg border border-cloud dark:border-slate-700 bg-transparent"
                                                placeholder="Provide detailed information regarding the incident or issue..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Severity Level</label>
                                                <div className="flex gap-2">
                                                    {['Low', 'Medium', 'High'].map(lvl => (
                                                        <button
                                                            key={lvl}
                                                            onClick={() => setSeverity(lvl)}
                                                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors
                                                                ${severity === lvl
                                                                    ? 'bg-slate-800 text-white border-slate-800'
                                                                    : 'border-cloud hover:bg-slate-50'
                                                                }`}
                                                        >
                                                            {lvl}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-end">
                                                <div className="flex items-center gap-2 text-sm text-slate-500 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg border border-amber-200/50">
                                                    <Lock className="w-4 h-4 text-amber-500" />
                                                    Confidential Submission
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        <button
                                            onClick={handleSubmitGrievance}
                                            disabled={submitting}
                                            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-2.5 rounded-lg font-bold shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
                                        >
                                            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                            Submit Grievance
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : selectedCase ? (
                            <motion.div
                                key="detail-view"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col h-full"
                            >
                                <div className="p-6 border-b border-cloud dark:border-nebula-purple/20 bg-slate-50/50 dark:bg-slate-900/50">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-mono text-slate-400">#{selectedCase.id}</span>
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                    {selectedCase.category}
                                                </span>
                                            </div>
                                            <h2 className="text-xl font-bold text-ink-black dark:text-pearl">{selectedCase.subject}</h2>
                                        </div>
                                        <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg">
                                            <MoreHorizontal className="w-5 h-5 text-slate-500" />
                                        </button>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                                        {selectedCase.description}
                                    </p>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-stellar-blue">
                                    <h3 className="text-sm font-bold text-silver-mist uppercase mb-6 flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> Activity History
                                    </h3>
                                    {selectedCase.updates && selectedCase.updates.length > 0 ? (
                                        <div className="space-y-8 pl-2">
                                            {selectedCase.updates.map((update: any, idx: number) => (
                                                <div key={idx} className="relative pl-8 border-l-2 border-slate-200 dark:border-slate-700 last:border-l-0">
                                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-stellar-blue"></div>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-ink-black dark:text-pearl">{update.author || 'System'}</span>
                                                            <span className="text-xs text-slate-400">{update.date || ''}</span>
                                                        </div>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg rounded-tl-none border border-cloud dark:border-slate-800 mt-1">
                                                            {update.text || update.message || ''}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400">No activity history yet.</p>
                                    )}
                                </div>

                                <div className="p-4 border-t border-cloud dark:border-nebula-purple/20 bg-slate-50 dark:bg-slate-900">
                                    <div className="flex gap-3">
                                        <div className="flex-1 relative">
                                            <textarea
                                                rows={2}
                                                className="w-full pl-4 pr-12 py-3 rounded-xl border border-cloud dark:border-slate-700 bg-white dark:bg-stellar-blue text-sm focus:ring-2 focus:ring-rose-500/50 resize-none"
                                                placeholder="Type a reply or added details..."
                                            />
                                            <button className="absolute right-3 bottom-3 p-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors">
                                                <MessageSquare className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                    <ShieldAlert className="w-10 h-10 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300 mb-2">Select a Case</h3>
                                <p className="text-sm max-w-xs">View details of your raised grievances or create a new ticket to report an issue.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

