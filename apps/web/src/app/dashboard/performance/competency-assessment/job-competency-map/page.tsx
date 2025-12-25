"use client";

import React, { useState, useEffect } from 'react';
import { CompetencyService } from '../../core/services';
import {
    Briefcase,
    Link,
    Search,
    ChevronRight,
    Plus
} from 'lucide-react';

export default function JobCompetencyMapPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Link className="w-6 h-6 text-indigo-500" />
                        Job-Competency Mapping
                    </h1>
                    <p className="text-slate-500 text-sm">Link competencies to specific job roles to define expectations.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all">
                    Map New Role
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Roles List */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search roles..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm outline-none"
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2">
                        {['Senior Product Manager', 'Software Engineer II', 'UX Designer', 'Sales Director', 'HR Business Partner'].map((role, i) => (
                            <div key={i} className={`p-3 rounded-xl cursor-pointer flex items-center justify-between group
                                ${i === 1 ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}
                            `}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${i === 1 ? 'bg-indigo-200 dark:bg-indigo-800' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                        <Briefcase className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-sm">{role}</span>
                                </div>
                                <ChevronRight className={`w-4 h-4 ${i === 1 ? 'opacity-100 text-indigo-500' : 'opacity-0 group-hover:opacity-50'}`} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mapping Details */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-y-auto">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-bold">Software Engineer II</h2>
                            <p className="text-sm text-slate-500">Engineering Department • Job Code: SE-002</p>
                        </div>
                        <button className="text-sm font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                            <Plus className="w-4 h-4" /> Add Competency
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Technical Section */}
                        <div>
                            <h3 className="font-bold text-sm text-slate-500 uppercase mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 bg-cyan-500 rounded-full"></span> Technical Competencies
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { name: 'Java Programming', req: 'L3 (Advanced)', importance: 'Critical' },
                                    { name: 'System Architecture', req: 'L2 (Intermediate)', importance: 'High' },
                                    { name: 'Cloud Infrastructure (AWS)', req: 'L2 (Intermediate)', importance: 'Medium' }
                                ].map((row, i) => (
                                    <MappingCard key={i} data={row} />
                                ))}
                            </div>
                        </div>

                        {/* Behavioral Section */}
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <h3 className="font-bold text-sm text-slate-500 uppercase mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 bg-purple-500 rounded-full"></span> Behavioral Competencies
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { name: 'Problem Solving', req: 'L4 (Master)', importance: 'Critical' },
                                    { name: 'Team Collaboration', req: 'L3 (Advanced)', importance: 'High' },
                                ].map((row, i) => (
                                    <MappingCard key={i} data={row} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MappingCard({ data }: { data: any }) {
    return (
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <div>
                <div className="font-bold text-slate-800 dark:text-slate-200">{data.name}</div>
                <div className="text-xs text-slate-500 mt-1">Target: <span className="font-bold text-indigo-600 dark:text-indigo-400">{data.req}</span></div>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-bold 
                ${data.importance === 'Critical' ? 'bg-rose-100 text-rose-700' :
                    data.importance === 'High' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-200 text-slate-600'}
            `}>
                {data.importance}
            </span>
        </div>
    );
}
