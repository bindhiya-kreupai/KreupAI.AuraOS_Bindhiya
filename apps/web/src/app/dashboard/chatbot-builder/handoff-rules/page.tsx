"use client";

import React, { useState, useEffect } from 'react';
import {
    ArrowRightLeft,
    Plus,
    UserPlus,
    Clock,
    ThumbsDown
} from 'lucide-react';
import { HandoffRuleService } from '../services';

export default function HandoffRulesPage() {
    const [rules, setRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await HandoffRuleService.getAllRules();
            if (result.length > 0) {
                setRules(result);
            }
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ArrowRightLeft className="w-6 h-6 text-indigo-500" />
                        Handoff Rules
                    </h1>
                    <p className="text-slate-500 text-sm">Configure when to transfer chats to human agents.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all">
                    <Plus className="w-4 h-4" /> Add Rule
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {[
                    { name: 'Negative Sentiment', condition: 'Sentiment Score < 0.3', action: 'Route to Support Tier 2', icon: ThumbsDown, active: true },
                    { name: 'Unknown Intent Loop', condition: 'Fallback Triggered > 2 times', action: 'Route to General Support', icon: UserPlus, active: true },
                    { name: 'VIP Employee', condition: 'User Role == "Executive"', action: 'Route to Priority Queue', icon: UserPlus, active: true },
                    { name: 'Off-hours Policy', condition: 'Time is outside 9am-6pm', action: 'Create Ticket (No Handoff)', icon: Clock, active: false },
                ].map((rule, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl">
                                <rule.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{rule.name}</h3>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1 text-sm">
                                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-mono text-slate-600 dark:text-slate-400">
                                        If {rule.condition}
                                    </span>
                                    <ArrowRightLeft className="w-4 h-4 text-slate-400 hidden sm:block" />
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                        {rule.action}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${rule.active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${rule.active ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
