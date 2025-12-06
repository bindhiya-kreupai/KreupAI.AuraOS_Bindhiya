"use client";

import React, { useState } from 'react';
import {
    Bot,
    Sparkles,
    Settings,
    MessageSquare,
    Zap,
    Cpu,
    Shield
} from 'lucide-react';

export default function AICopilotPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Bot className="w-6 h-6 text-indigo-500" />
                        AI Copilot Settings
                    </h1>
                    <p className="text-slate-500 text-sm">Configure the behavior, intelligence, and permissions of Aura AI.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold uppercase">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        System Active
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0">
                {/* Configuration Panel */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-indigo-500" /> Model Configuration
                    </h3>

                    <div className="space-y-6">
                        <div>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Primary Model</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {['GPT-4o', 'Claude 3.5 Sonnet', 'Gemini Ultra 1.5'].map(m => (
                                    <div key={m} className={`p-4 rounded-xl border-2 cursor-pointer flex flex-col items-center justify-center text-center gap-2 transition-all
                                        ${m.includes('Gemini') ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-indigo-300'}
                                    `}>
                                        <Bot className={`w-6 h-6 ${m.includes('Gemini') ? 'text-indigo-600' : 'text-slate-400'}`} />
                                        <span className={`text-xs font-bold ${m.includes('Gemini') ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-500'}`}>{m}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Personality & Tone</label>
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                                <div className="flex justify-between text-xs text-slate-500 font-bold mb-2">
                                    <span>Concise</span>
                                    <span>Balanced</span>
                                    <span>Creative</span>
                                </div>
                                <input type="range" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">System Prompt Override</label>
                            <textarea
                                className="w-full h-32 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:outline-none focus:border-indigo-500"
                                defaultValue="You are Aura, an advanced HR assistant. Prioritize empathy and accuracy in all responses..."
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Capabilities & Privacy */}
                <div className="space-y-6">
                    {/* Capabilities */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-500" /> Enabled Capabilities
                        </h3>
                        <div className="space-y-3">
                            {[
                                { name: 'Resume Parsing', desc: 'Auto-extract skills from CVs', active: true },
                                { name: 'Sentiment Analysis', desc: 'Detect mood in feedback', active: true },
                                { name: 'Policy Q&A', desc: 'Answer employee queries from handbook', active: true },
                                { name: 'Code Generation', desc: 'Write SQL/Scripts for analytics', active: false },
                            ].map((cap, i) => (
                                <div key={i} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cap.active ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                            <Zap className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{cap.name}</div>
                                            <div className="text-xs text-slate-400">{cap.desc}</div>
                                        </div>
                                    </div>
                                    <div className={`w-10 h-5 rounded-full relative cursor-pointer ${cap.active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${cap.active ? 'left-6' : 'left-1'}`}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Safety */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-rose-500" /> Safety & PII
                        </h3>
                        <div className="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800 rounded-xl mb-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-rose-900 dark:text-rose-400 text-sm">PII Redaction Active</h4>
                                    <p className="text-xs text-rose-800 dark:text-rose-500 mt-1">
                                        Names, SSNs, and phone numbers are automatically masked before sending to the LLM.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700">
                            View Redaction Rules
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { AlertCircle } from 'lucide-react';
