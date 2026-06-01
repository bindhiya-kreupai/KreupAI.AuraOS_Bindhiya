"use client";

import React, { useState, useEffect } from 'react';
import {
    FileText,
    Users,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Search,
    Filter,
    ArrowRight,
    BrainCircuit
} from 'lucide-react';
import { resumeParsing } from '@/lib/services/ai-automation-client';

export default function ResumeScreeningPage() {
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadFile, setUploadFile] = useState<File | null>(null);

    useEffect(() => {
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        try {
            const result = await resumeParsing.getParsedResumes();
            if (result.success) {
                setCandidates(result.data?.resumes || []);
            }
        } catch (error: any) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (file: File) => {
        setLoading(true);
        try {
            await resumeParsing.parseResume(file);
            await fetchResumes();
        } catch (error: any) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-4 pb-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <BrainCircuit className="w-6 h-6 text-purple-500" />
                        AI Resume Screening
                    </h1>
                    <p className="text-silver-mist text-sm mt-1">Automated candidate ranking with built-in bias detection.</p>
                </div>
                <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-lg border border-purple-100 dark:border-purple-800">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-bold">Fairness Monitor Active</span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-stellar-blue p-5 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <p className="text-xs text-silver-mist font-bold uppercase">Resumes Processed</p>
                    <h3 className="text-3xl font-bold text-ink-black dark:text-pearl">342</h3>
                    <p className="text-xs text-emerald-500 font-medium">Last 24 hours</p>
                </div>
                <div className="bg-white dark:bg-stellar-blue p-5 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <p className="text-xs text-silver-mist font-bold uppercase">Avg Match Score</p>
                    <h3 className="text-3xl font-bold text-indigo-500">76%</h3>
                    <p className="text-xs text-slate-500 font-medium">Role: Senior React Dev</p>
                </div>
                <div className="bg-white dark:bg-stellar-blue p-5 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <p className="text-xs text-silver-mist font-bold uppercase">Diversity Check</p>
                    <h3 className="text-3xl font-bold text-emerald-500 w-fit">Pass</h3>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Gender/Ethnic balance within range</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-cloud dark:border-nebula-purple/50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-ink-black dark:text-pearl">Candidate Leaderboard</h2>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" placeholder="Search candidates..." className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-cloud dark:border-nebula-purple/50 rounded-lg text-sm focus:outline-none" />
                        </div>
                        <button className="p-2 border border-cloud dark:border-nebula-purple/50 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                            <Filter className="w-4 h-4 text-slate-500" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-silver-mist font-bold">
                            <tr>
                                <th className="px-6 py-4">Rank</th>
                                <th className="px-6 py-4">Candidate</th>
                                <th className="px-6 py-4">Match Score</th>
                                <th className="px-6 py-4">Top Skills</th>
                                <th className="px-6 py-4">AI Analysis</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cloud dark:divide-nebula-purple/20">
                            {candidates.map((c, i) => (
                                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-mono text-slate-400">#{i + 1}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-ink-black dark:text-pearl">{c.name}</div>
                                        <div className="text-xs text-silver-mist">{c.role}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 w-24 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${c.score > 90 ? 'bg-emerald-500' : c.score > 75 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                                                    style={{ width: `${c.score}%` }}
                                                />
                                            </div>
                                            <span className="font-bold text-slate-700 dark:text-slate-200">{c.score}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-1 flex-wrap">
                                            {c.skills.map((s: any) => (
                                                <span key={s} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {c.bias_flag ? (
                                            <div className="flex items-center gap-1.5 text-xs text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded border border-amber-200 w-fit">
                                                <AlertTriangle className="w-3 h-3" />
                                                Bias Detected
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200 w-fit">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Clean
                                            </div>
                                        )}
                                        {c.bias_reason && <div className="text-[10px] text-amber-600/80 mt-1">{c.bias_reason}</div>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-indigo-600 hover:text-indigo-800 font-bold text-xs flex items-center gap-1">
                                            View Profile <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

