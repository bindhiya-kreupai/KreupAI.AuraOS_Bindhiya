"use client";

import React, { useState, useEffect } from 'react';
import {
    Lightbulb,
    ThumbsUp,
    MessageSquare,
    Plus,
    Award,
    CheckCircle2,
    X,
    ChevronUp,
    ChevronDown,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { InnovationService } from '../services';

export default function InnovationBoxPage() {
    const [ideas, setIdeas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Trending');
    const [showSubmitModal, setShowSubmitModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const ideasData = await InnovationService.getIdeas();
            setIdeas(Array.isArray(ideasData) ? ideasData : []);
        } catch {
        } finally {
            setLoading(false);
        }
    };

    const handleVote = (id: number) => {
        setIdeas(prev => prev.map(idea => {
            if (idea.id === id) {
                return {
                    ...idea,
                    votes: idea.userVoted ? (idea.votes || 1) - 1 : (idea.votes || 0) + 1,
                    userVoted: !idea.userVoted
                };
            }
            return idea;
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Lightbulb className="w-6 h-6 text-amber-500" />
                        Innovation Box
                    </h1>
                    <p className="text-silver-mist text-sm">Share ideas, vote on improvements, and shape the company future.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowSubmitModal(true)}
                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        <Plus className="w-4 h-4" /> Submit Idea
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0 overflow-hidden">
                <div className="lg:col-span-2 flex flex-col h-full overflow-hidden space-y-4">
                    <div className="flex gap-2 overflow-x-auto pb-2 shrink-0">
                        {['Trending', 'Newest', 'Top All Time', 'Implemented'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border
                                    ${filter === f
                                        ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
                                        : 'bg-white dark:bg-stellar-blue text-slate-500 border-cloud dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}
                                `}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="overflow-y-auto space-y-4 pr-2 pb-20">
                        {ideas.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                <Lightbulb className="w-12 h-12 mb-4 opacity-50" />
                                <p className="font-medium">No ideas submitted yet.</p>
                                <p className="text-sm">Be the first to submit an idea!</p>
                            </div>
                        ) : (
                            ideas.map((idea: any) => (
                                <div key={idea.id} className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 hover:shadow-md transition-all flex gap-4">
                                    <div className="flex flex-col items-center gap-1">
                                        <button
                                            onClick={() => handleVote(idea.id)}
                                            className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${idea.userVoted ? 'text-indigo-500' : 'text-slate-400'}`}
                                        >
                                            <ChevronUp className="w-6 h-6" />
                                        </button>
                                        <span className={`text-lg font-bold ${idea.userVoted ? 'text-indigo-500' : 'text-slate-600 dark:text-slate-300'}`}>{idea.votes || 0}</span>
                                        <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400">
                                            <ChevronDown className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-bold text-ink-black dark:text-pearl">{idea.title}</h3>
                                            {idea.status && (
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide
                                                    ${idea.status === 'Approved' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                                        idea.status === 'Under Review' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' :
                                                            'bg-slate-100 text-slate-600'}
                                                `}>
                                                    {idea.status}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                                            {idea.description}
                                        </p>

                                        <div className="flex items-center justify-between text-xs text-silver-mist">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">
                                                        {(idea.author || 'A').charAt(0)}
                                                    </div>
                                                    <span className="font-bold">{idea.author || 'Anonymous'}</span>
                                                    {idea.department && (
                                                        <>
                                                            <span className="opacity-50">-</span>
                                                            <span>{idea.department}</span>
                                                        </>
                                                    )}
                                                </div>
                                                {idea.date && <span>{idea.date}</span>}
                                            </div>
                                            <div className="flex items-center gap-2 hover:text-indigo-500 cursor-pointer transition-colors">
                                                <MessageSquare className="w-4 h-4" />
                                                <span className="font-bold">{idea.comments || 0} Comments</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6 flex flex-col h-full">
                    <div className="grid grid-cols-2 gap-4 shrink-0">
                        <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-4 rounded-2xl text-white shadow-lg">
                            <div className="flex items-center gap-2 mb-2 opacity-90">
                                <Lightbulb className="w-4 h-4" /> Total Ideas
                            </div>
                            <div className="text-2xl font-bold">{ideas.length}</div>
                        </div>
                        <div className="bg-white dark:bg-stellar-blue p-4 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                            <div className="flex items-center gap-2 mb-2 text-silver-mist text-xs font-bold uppercase">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Implemented
                            </div>
                            <div className="text-2xl font-bold text-ink-black dark:text-pearl">{ideas.filter((i: any) => i.status === 'Implemented').length}</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex-1">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-6 flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-500" /> Top Innovators
                        </h3>
                        <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
                            Leaderboard will populate as ideas are submitted and voted on.
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showSubmitModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-white/80 dark:bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white dark:bg-stellar-blue w-full max-w-lg rounded-2xl border border-cloud dark:border-slate-800 shadow-2xl p-6 relative"
                        >
                            <button
                                onClick={() => setShowSubmitModal(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h2 className="text-xl font-bold text-ink-black dark:text-pearl mb-1">Submit an Idea</h2>
                            <p className="text-sm text-silver-mist mb-6">Have a suggestion? Let us know how we can improve.</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">Title</label>
                                    <input type="text" placeholder="e.g., Automated Coffee Machine" className="w-full p-3 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Category</label>
                                        <select className="w-full p-3 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none">
                                            <option>Process Improvement</option>
                                            <option>Workplace Culture</option>
                                            <option>Cost Saving</option>
                                            <option>Product Feature</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Impact</label>
                                        <select className="w-full p-3 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none">
                                            <option>High</option>
                                            <option>Medium</option>
                                            <option>Low</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">Description</label>
                                    <textarea rows={4} placeholder="Describe your idea based on the problem and solution..." className="w-full p-3 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"></textarea>
                                </div>
                                <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex gap-3 items-start">
                                    <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-700 dark:text-amber-400">
                                        <strong>Tip:</strong> Great ideas are specific, measurable, and actionable. Explain how your idea benefits the company or employees.
                                    </p>
                                </div>
                            </div>

                            <button className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl mt-6 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
                                <Plus className="w-4 h-4" /> Submit for Review
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
