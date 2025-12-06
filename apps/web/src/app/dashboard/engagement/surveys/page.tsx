"use client";

import React, { useState } from 'react';
import {
    PieChart,
    BarChart,
    Plus,
    MessageSquare,
    Users,
    CheckCircle2,
    Calendar,
    Settings,
    MoreVertical,
    ChevronRight,
    Edit2,
    Trash2,
    GripVertical,
    Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---

const ACTIVE_SURVEYS = [
    {
        id: 1,
        title: 'Q4 2024 eNPS Survey',
        status: 'Active',
        responses: 145,
        total: 200,
        deadline: 'Dec 15, 2024',
        color: 'bg-emerald-500'
    },
    {
        id: 2,
        title: 'Cafeteria Menu Feedback',
        status: 'Active',
        responses: 85,
        total: 500,
        deadline: 'Dec 20, 2024',
        color: 'bg-indigo-500'
    }
];

const PAST_SURVEYS = [
    { id: 101, title: 'Annual Employee Satisfaction', date: 'Oct 2024', score: '4.2/5' },
    { id: 102, title: 'Remote Work Policy Pulse', date: 'Aug 2024', score: '3.8/5' },
    { id: 103, title: 'Training Needs Assessment', date: 'Jun 2024', score: 'N/A' },
];

const QUESTION_TYPES = ['Multiple Choice', 'Text Input', 'Rating Scale', 'Checkbox'];

export default function SurveysPage() {
    const [activeTab, setActiveTab] = useState<'Overview' | 'Builder' | 'Results'>('Overview');
    const [showBuilder, setShowBuilder] = useState(false);

    // Builder State
    const [questions, setQuestions] = useState([
        { id: 1, text: 'How satisfied are you with your role?', type: 'Rating Scale' },
        { id: 2, text: 'What can we improve?', type: 'Text Input' }
    ]);
    const [newQuestionText, setNewQuestionText] = useState('');

    const addQuestion = () => {
        if (!newQuestionText.trim()) return;
        setQuestions([...questions, { id: Date.now(), text: newQuestionText, type: 'Multiple Choice' }]);
        setNewQuestionText('');
    };

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-indigo-500" />
                        Surveys & Feedback
                    </h1>
                    <p className="text-silver-mist text-sm">Measure sentiment, gather feedback, and improve culture.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setActiveTab('Builder')}
                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        <Plus className="w-4 h-4" /> Create Survey
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0 overflow-hidden">
                {/* Left: Main Content (Tabs) */}
                <div className="lg:col-span-2 flex flex-col h-full overflow-hidden space-y-6">
                    {/* Tabs */}
                    <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 w-fit">
                        {['Overview', 'Builder', 'Results'].map(tab => (
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

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto pr-2 pb-20">
                        {activeTab === 'Overview' && (
                            <div className="space-y-6">
                                {/* Active Surveys */}
                                <div className="space-y-4">
                                    <h3 className="font-bold text-ink-black dark:text-pearl">Active Surveys</h3>
                                    {ACTIVE_SURVEYS.map(survey => (
                                        <div key={survey.id} className="bg-white dark:bg-stellar-blue p-5 rounded-2xl border border-cloud dark:border-nebula-purple/50">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                                        <span className="text-xs font-bold text-emerald-500 uppercase tracking-wide">Live</span>
                                                    </div>
                                                    <h3 className="font-bold text-lg text-ink-black dark:text-pearl">{survey.title}</h3>
                                                </div>
                                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                                    <MoreVertical className="w-4 h-4 text-slate-400" />
                                                </button>
                                            </div>

                                            <div className="mb-4">
                                                <div className="flex justify-between text-xs font-bold text-silver-mist mb-1">
                                                    <span>Participation</span>
                                                    <span>{Math.round((survey.responses / survey.total) * 100)}% ({survey.responses}/{survey.total})</span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${survey.color} rounded-full transition-all duration-1000`}
                                                        style={{ width: `${(survey.responses / survey.total) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center text-xs text-silver-mist pt-4 border-t border-cloud dark:border-slate-800">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>Ends on {survey.deadline}</span>
                                                </div>
                                                <button className="font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1">
                                                    View Real-time Report <ChevronRight className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Past Surveys */}
                                <div>
                                    <h3 className="font-bold text-ink-black dark:text-pearl mb-4">Past Surveys</h3>
                                    <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
                                        {PAST_SURVEYS.map((survey, index) => (
                                            <div key={survey.id} className={`p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors
                                                ${index !== PAST_SURVEYS.length - 1 ? 'border-b border-cloud dark:border-slate-800' : ''}
                                            `}>
                                                <div>
                                                    <h4 className="font-bold text-sm text-ink-black dark:text-pearl">{survey.title}</h4>
                                                    <p className="text-xs text-silver-mist">{survey.date}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-black text-indigo-500">{survey.score}</div>
                                                    <div className="text-[10px] text-slate-400 uppercase">Avg Score</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Builder' && (
                            <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 overflow-hidden flex flex-col h-full min-h-[500px]">
                                <div className="p-4 border-b border-cloud dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
                                    <input
                                        type="text"
                                        defaultValue="Untitled Survey"
                                        className="bg-transparent text-lg font-bold outline-none text-ink-black dark:text-pearl placeholder-slate-400"
                                    />
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1.5 text-xs font-bold text-slate-500 bg-white dark:bg-slate-800 border border-cloud dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                                            Preview
                                        </button>
                                        <button className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors flex items-center gap-1">
                                            <Send className="w-3 h-3" /> Publish
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                                    <AnimatePresence>
                                        {questions.map((q, index) => (
                                            <motion.div
                                                key={q.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="bg-white dark:bg-slate-900 border border-cloud dark:border-slate-800 p-4 rounded-xl shadow-sm group relative"
                                            >
                                                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-300 cursor-grab opacity-0 group-hover:opacity-100">
                                                    <GripVertical className="w-4 h-4" />
                                                </div>
                                                <div className="pl-6 pr-8">
                                                    <div className="flex justify-between mb-2">
                                                        <span className="text-xs font-bold text-indigo-500">Question {index + 1}</span>
                                                        <select className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded outline-none border-none">
                                                            {QUESTION_TYPES.map(t => <option key={t} selected={t === q.type}>{t}</option>)}
                                                        </select>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        defaultValue={q.text}
                                                        className="w-full text-sm font-medium bg-transparent outline-none border-b border-transparent focus:border-indigo-500/50 transition-colors pb-1"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => setQuestions(questions.filter(item => item.id !== q.id))}
                                                    className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newQuestionText}
                                            onChange={(e) => setNewQuestionText(e.target.value)}
                                            placeholder="Type a new question..."
                                            className="flex-1 p-3 rounded-xl border border-cloud dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                                            onKeyDown={(e) => e.key === 'Enter' && addQuestion()}
                                        />
                                        <button
                                            onClick={addQuestion}
                                            className="px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition-colors"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Results' && (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                                    <PieChart className="w-8 h-8 text-indigo-500" />
                                </div>
                                <h3 className="font-bold text-ink-black dark:text-pearl mb-1">Select a Survey</h3>
                                <p className="text-sm text-silver-mist">Choose an active or past survey to view detailed analytics.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Insights */}
                <div className="lg:col-span-1 space-y-6 flex flex-col h-full overflow-hidden">
                    {/* Key Metrics */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm shrink-0">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <BarChart className="w-5 h-5 text-indigo-500" /> Key Insights
                        </h3>

                        <div className="space-y-4">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                                <div className="text-xs font-bold text-indigo-800 dark:text-indigo-300 mb-1">eNPS Score</div>
                                <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">+42</div>
                                <div className="text-[10px] text-indigo-700 dark:text-indigo-500 mt-1">Top 10% of industry benchmark</div>
                            </div>

                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1">Participation Rate</div>
                                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">85%</div>
                                <div className="text-[10px] text-emerald-700 dark:text-emerald-500 mt-1">↑ 5% vs last quarter</div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Poll */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex-1">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-rose-500" /> Weekly Pulse
                        </h3>
                        <p className="text-sm font-medium mb-4">"I feel my work is valued by my manager."</p>
                        <div className="space-y-2">
                            {['Strongly Agree', 'Agree', 'Neutral', 'Disagree'].map(opt => (
                                <button key={opt} className="w-full text-left p-3 rounded-xl border border-cloud dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-xs font-bold transition-all flex justify-between group">
                                    <span>{opt}</span>
                                    <span className="opacity-0 group-hover:opacity-100 text-indigo-500">Vote</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
