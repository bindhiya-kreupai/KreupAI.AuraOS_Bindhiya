"use client";

import React, { useState, useEffect } from 'react';
import {
    PenTool,
    Plus,
    BarChart,
    Loader2
} from 'lucide-react';
import { AssessmentService } from '../services';

export default function AssessmentEnginePage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await AssessmentService.getAssessments();
                setData(result);
            } catch (error) {
                console.error('Error:', error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <PenTool className="w-6 h-6 text-indigo-500" />
                        Assessment Engine
                    </h1>
                    <p className="text-slate-500 text-sm">Create quizzes, exams, and evaluate performance.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Create Assessment
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : data.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <PenTool className="w-12 h-12 mb-4 opacity-30" />
                    <p className="font-bold">No assessments created</p>
                    <p className="text-sm">Create your first assessment to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.map((quiz, i) => {
                        const questionsCount = Array.isArray(quiz.questions) ? quiz.questions.length : 0;
                        const isActive = quiz.isPublished || quiz.isActive;

                        return (
                            <div key={quiz.id || i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'
                                    }`}>{isActive ? 'Active' : 'Draft'}</span>
                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400">
                                        <BarChart className="w-4 h-4" />
                                    </button>
                                </div>
                                <h3 className="font-bold text-lg mb-2">{quiz.title}</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm text-slate-500 mb-6">
                                    <div>Questions: <b className="text-slate-900 dark:text-slate-100">{questionsCount}</b></div>
                                    <div>Time Limit: <b className="text-slate-900 dark:text-slate-100">{quiz.timeLimit || quiz.duration || '-'}m</b></div>
                                    <div>Max Attempts: <b className="text-slate-900 dark:text-slate-100">{quiz.maxAttempts || '-'}</b></div>
                                    <div>Pass Score: <b className="text-slate-900 dark:text-slate-100">{quiz.passingScore || '-'}%</b></div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="flex-1 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800">Preview</button>
                                    <button className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700">Edit</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
