"use client";

import React, { useState, useEffect } from 'react';
import {
    Map,
    CheckCircle2,
    Lock,
    Loader2
} from 'lucide-react';
import { LearningPathService } from '../services';

export default function LearningPathsPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await LearningPathService.getLearningPaths();
                setData(result);
            } catch (error: any) {
                console.error('Error:', error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Map className="w-6 h-6 text-indigo-500" />
                        Learning Paths
                    </h1>
                    <p className="text-slate-500 text-sm">Structured curriculums to master specific skills.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : data.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <Map className="w-12 h-12 mb-4 opacity-30" />
                    <p className="font-bold">No learning paths available</p>
                    <p className="text-sm">Learning paths will appear here once created.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {data.map((path, i) => {
                        const completed = path.completed || path.courses?.filter((c: any) => c.isCompleted) || [];
                        const totalSteps = path.steps || path.courses?.length || 5;
                        const progress = path.progress || path.completionRate || 0;
                        const currentModule = path.current || path.title;

                        return (
                            <div key={path.id || i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="font-bold text-xl">{path.title}</h3>
                                        <p className="text-sm text-slate-500">{path.description || `Current Module: ${currentModule}`}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-indigo-600">{progress}%</div>
                                        <div className="text-xs text-slate-500">Completed</div>
                                    </div>
                                </div>

                                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-8 overflow-hidden">
                                    <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                                </div>

                                <div className="flex items-center gap-2 overflow-x-auto pb-4">
                                    {Array.isArray(completed) && completed.map((step: any, j: number) => (
                                        <div key={j} className="flex-shrink-0 flex flex-col items-center gap-2 w-32">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                                <CheckCircle2 className="w-5 h-5" />
                                            </div>
                                            <span className="text-xs text-center font-medium line-clamp-2">{typeof step === 'string' ? step : step.courseTitle || step.title}</span>
                                        </div>
                                    ))}

                                    <div className="flex-shrink-0 flex flex-col items-center gap-2 w-32">
                                        <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-600 text-indigo-600 flex items-center justify-center animate-pulse">
                                            <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                                        </div>
                                        <span className="text-xs text-center font-bold text-indigo-600 line-clamp-2">{currentModule}</span>
                                    </div>

                                    {[...Array(Math.max(0, totalSteps - (Array.isArray(completed) ? completed.length : 0) - 1))].map((_, k) => (
                                        <div key={k} className="flex-shrink-0 flex flex-col items-center gap-2 w-32 opacity-40">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                                <Lock className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <span className="text-xs text-center line-clamp-2">Locked Module</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

