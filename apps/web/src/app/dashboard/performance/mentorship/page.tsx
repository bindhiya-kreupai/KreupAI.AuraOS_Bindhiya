"use client";

import React, { useState, useEffect } from 'react';
import { DevelopmentPlanService } from '../core/services';
import {
    Users,
    UserPlus,
    MessageCircle,
    Calendar,
    CheckCircle2,
    Search,
    Filter,
    MoreVertical,
    Loader2
} from 'lucide-react';

interface MentorshipProgram {
    id: string;
    name: string;
    activePairs: number;
    duration: string;
    status: string;
}

interface MentorPair {
    id: string;
    mentor: string;
    mentee: string;
    program: string;
    lastSession: string;
    progress: number;
}

export default function MentorshipPage() {
    const [activeTab, setActiveTab] = useState<'Overview' | 'Pairs'>('Overview');
    const [loading, setLoading] = useState(true);
    const [programs, setPrograms] = useState<MentorshipProgram[]>([]);
    const [pairs, setPairs] = useState<MentorPair[]>([]);

    useEffect(() => {
        async function loadData() {
            try {
                const plans = await DevelopmentPlanService.getPlans();
                // Derive mentorship programs from development plans that have mentoring type
                const mentorPlans = plans.filter((p: any) =>
                    p.type === 'mentoring' || p.category === 'mentorship' || p.title?.toLowerCase().includes('mentor')
                );

                // Group plans into programs
                const programMap = new Map<string, any>();
                mentorPlans.forEach((p: any) => {
                    const programName = p.title || p.name || 'Mentorship Program';
                    if (!programMap.has(programName)) {
                        programMap.set(programName, {
                            id: p.id,
                            name: programName,
                            activePairs: 0,
                            duration: p.timeline || 'Ongoing',
                            status: p.status === 'active' ? 'Active' : p.status === 'draft' ? 'Draft' : 'Completed',
                        });
                    }
                    programMap.get(programName)!.activePairs += 1;
                });

                setPrograms(Array.from(programMap.values()));

                // Derive pairs from mentor plans
                const derivedPairs: MentorPair[] = mentorPlans.map((p: any) => ({
                    id: p.id,
                    mentor: p.mentorName || 'Assigned Mentor',
                    mentee: p.targetName || `Employee ${p.targetId?.slice(-4) || ''}`,
                    program: p.title || 'Mentorship Program',
                    lastSession: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'N/A',
                    progress: p.progress || 0,
                }));
                setPairs(derivedPairs);
            } catch (error) {
                console.error('Failed to load mentorship data:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        Mentorship Programs
                    </h1>
                    <p className="text-slate-500 text-sm">Facilitate professional growth through structured guidance.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                    <UserPlus className="w-4 h-4" /> New Program
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 w-fit">
                {['Overview', 'Pairs'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all
                            ${activeTab === tab
                                ? 'bg-white dark:bg-stellar-blue text-indigo-600 dark:text-indigo-400 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}
                        `}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto pb-20">
                {activeTab === 'Overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {programs.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-400">
                                <Users className="w-12 h-12 mb-3 opacity-30" />
                                <p className="font-bold text-lg">No mentorship programs yet</p>
                                <p className="text-sm mt-1">Create a new program to get started</p>
                            </div>
                        ) : programs.map(prog => (
                            <div key={prog.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                        ${prog.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}
                                    `}>
                                        {prog.status}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg mb-2">{prog.name}</h3>
                                <div className="space-y-2 mb-6 text-sm text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4" /> {prog.activePairs} Active Pairs
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> {prog.duration}
                                    </div>
                                </div>
                                <button className="w-full py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    Manage Program
                                </button>
                            </div>
                        ))}
                    </div>
                )}



                {activeTab === 'Pairs' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        {pairs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                <Users className="w-12 h-12 mb-3 opacity-30" />
                                <p className="font-bold text-lg">No mentor pairs yet</p>
                                <p className="text-sm mt-1">Create mentorship programs to establish pairs</p>
                            </div>
                        ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="p-4">Mentor</th>
                                    <th className="p-4">Mentee</th>
                                    <th className="p-4">Program</th>
                                    <th className="p-4">Progress</th>
                                    <th className="p-4">Last Session</th>
                                    <th className="p-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {pairs.map(pair => (
                                    <tr key={pair.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4 font-bold text-indigo-600 dark:text-indigo-400">{pair.mentor}</td>
                                        <td className="p-4 font-bold text-slate-700 dark:text-slate-300">{pair.mentee}</td>
                                        <td className="p-4 text-slate-500">{pair.program}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 w-32">
                                                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pair.progress}%` }}></div>
                                                </div>
                                                <span className="text-xs text-slate-500">{pair.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-400 text-xs">{pair.lastSession}</td>
                                        <td className="p-4 text-right">
                                            <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

