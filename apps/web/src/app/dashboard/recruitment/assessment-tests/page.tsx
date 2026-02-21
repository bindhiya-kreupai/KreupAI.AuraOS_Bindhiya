"use client";

import React, { useState, useEffect } from 'react';
import { CandidateApplicationService } from '../services';
import {
    BrainCircuit,
    Plus,
    Clock,
    CheckCircle2,
    BarChart3,
    MoreVertical,
    FileCode,
    Users,
    Loader2
} from 'lucide-react';

export default function AssessmentsPage() {
    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            setLoading(true);
            // Assessment tests are derived from application data
            // In the future, a dedicated assessment model could be added
            const data = await CandidateApplicationService.getApplications();
            // Transform applications into a summary of assessment activity
            // Group by distinct stages that represent assessments
            const assessmentCandidates = data.filter((app: any) =>
                app.currentStage === 'assessment' || app.currentStage === 'screening'
            );

            // Create a synthetic list of tests from the data
            const testSummary: any[] = [];
            if (assessmentCandidates.length > 0) {
                testSummary.push({
                    id: 'test-screening',
                    name: 'Candidate Screening Assessment',
                    type: 'MCQ',
                    duration: '30 mins',
                    candidates: assessmentCandidates.filter((a: any) => a.currentStage === 'screening').length,
                    status: 'Active',
                });
                testSummary.push({
                    id: 'test-technical',
                    name: 'Technical Assessment',
                    type: 'Coding',
                    duration: '60 mins',
                    candidates: assessmentCandidates.filter((a: any) => a.currentStage === 'assessment').length,
                    status: 'Active',
                });
            }

            setTests(testSummary);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-silver-mist font-medium">Loading assessments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BrainCircuit className="w-6 h-6 text-indigo-500" />
                        Assessment Tests
                    </h1>
                    <p className="text-slate-500 text-sm">Create and manage skill evaluations for candidates.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                    <Plus className="w-4 h-4" /> Create Test
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-20">
                {tests.map(test => (
                    <div key={test.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all groupe">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                                ${test.type === 'Coding' ? 'bg-indigo-100 text-indigo-600' :
                                    test.type === 'MCQ' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}
                            `}>
                                {test.type === 'Coding' && <FileCode className="w-6 h-6" />}
                                {test.type === 'MCQ' && <CheckCircle2 className="w-6 h-6" />}
                                {test.type === 'Submission' && <BrainCircuit className="w-6 h-6" />}
                            </div>
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </div>

                        <h3 className="font-bold text-lg mb-2">{test.name}</h3>

                        <div className="space-y-2 mb-6">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Clock className="w-4 h-4" /> {test.duration}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Users className="w-4 h-4" /> {test.candidates} Candidates
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                ${test.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}
                             `}>
                                {test.status}
                            </div>
                            <button className="text-sm font-bold text-indigo-500 flex items-center gap-1 hover:underline">
                                View Analytics <BarChart3 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {tests.length === 0 && (
                    <div className="col-span-full text-center py-12">
                        <BrainCircuit className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 mb-2">No assessments yet</h3>
                        <p className="text-sm text-slate-400 dark:text-slate-500">Create your first assessment test to evaluate candidates.</p>
                    </div>
                )}

                {/* New Test Card */}
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all cursor-pointer min-h-[250px]">
                    <Plus className="w-8 h-8 mb-2" />
                    <span className="font-bold">New Assessment</span>
                </div>
            </div>
        </div>
    );
}
