"use client";

import React from 'react';
import {
    Sparkles,
    Map,
    Compass,
    Save
} from 'lucide-react';

export default function AspirationsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-indigo-500" />
                        Career Aspirations
                    </h1>
                    <p className="text-slate-500 text-sm">Define your long-term vision and preferences.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all">
                    <Save className="w-4 h-4" /> Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <Compass className="w-5 h-5 text-indigo-500" /> Direction
                    </h3>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Primary Career Path Interest
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button className="p-4 border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-left">
                                    <div className="font-bold text-indigo-700 dark:text-indigo-300">Individual Contributor</div>
                                    <div className="text-xs text-indigo-600/70 mt-1">Specialized technical focus</div>
                                </button>
                                <button className="p-4 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-left">
                                    <div className="font-bold text-slate-700 dark:text-slate-300">People Management</div>
                                    <div className="text-xs text-slate-500 mt-1">Leadership and team growth</div>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Willingness to Relocate
                            </label>
                            <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500">
                                <option>Yes, globally</option>
                                <option>Yes, within country</option>
                                <option>No, prefer current location</option>
                                <option>Remote only</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Interested Departments (Select top 3)
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {['Product', 'Engineering', 'Design', 'Marketing', 'Sales', 'Data Science'].map(dept => (
                                    <button key={dept} className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors
                                        ${dept === 'Engineering' || dept === 'Product'
                                            ? 'bg-indigo-600 text-white border-indigo-600'
                                            : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 hover:border-indigo-500'}`}>
                                        {dept}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <Map className="w-5 h-5 text-rose-500" /> 5-Year Vision
                    </h3>

                    <div className="space-y-4">
                        <textarea
                            className="w-full h-40 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            placeholder="Describe where you see yourself in 5 years..."
                            defaultValue="I aim to be leading a team of senior engineers working on high-scale distributed systems. I want to transition from purely technical execution to architectural strategy and team mentorship."
                        ></textarea>

                        <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl">
                            <h4 className="font-bold text-indigo-700 dark:text-indigo-300 text-sm mb-2">AI Coach Suggestion</h4>
                            <p className="text-sm text-indigo-600/80">
                                Based on your vision, consider taking the "Engineering Leadership 101" course and requesting a mentorship session with the VP of Engineering.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
