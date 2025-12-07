"use client";

import React from 'react';
import {
    UserCheck,
    Save,
    Send,
    Star
} from 'lucide-react';

export default function SelfAssessmentPage() {
    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <UserCheck className="w-6 h-6 text-indigo-500" />
                        Self Assessment
                    </h1>
                    <p className="text-slate-500 text-sm">Reflect on your achievements and areas for growth.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                        <Save className="w-4 h-4" /> Save Draft
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2">
                        <Send className="w-4 h-4" /> Submit
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                    <h3 className="font-bold text-lg mb-2 text-indigo-900 dark:text-indigo-100">Annual Review 2025</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Please complete your self-evaluation highlighting key projects, challenges overcome, and skill acquisition.</p>
                </div>

                {/* Questions */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <label className="block font-bold mb-2">1. What were your key achievements this year?</label>
                        <textarea className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="Describe your major accomplishments..."></textarea>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <label className="block font-bold mb-2">2. Which areas do you believe you need to improve?</label>
                        <textarea className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="Identify areas for development..."></textarea>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <label className="block font-bold mb-4">3. How would you rate your overall performance?</label>
                        <div className="flex gap-4">
                            {[1, 2, 3, 4, 5].map((rating) => (
                                <button key={rating} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-indigo-50 hover:border-indigo-500 hover:text-indigo-600 transition-all focus:ring-2 focus:ring-indigo-500">
                                    <div className="text-2xl mb-1">{rating}</div>
                                    <div className="flex justify-center"><Star className="w-4 h-4 fill-current text-slate-300" /></div>
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs text-slate-400 mt-2 px-2">
                            <span>Needs Improvement</span>
                            <span>Exceeds Expectations</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
