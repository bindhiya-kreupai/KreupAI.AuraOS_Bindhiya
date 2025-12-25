"use client";

import React, { useState, useEffect } from 'react';
import {
    DatabaseZap,
    UploadCloud,
    DownloadCloud,
    Filter,
    Check,
    X,
    RotateCw
} from 'lucide-react';
import { TrainingDatasetService, TrainingExampleService } from '../services';

export default function TrainingDataPage() {
    const [datasets, setDatasets] = useState<any[]>([]);
    const [examples, setExamples] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [datasetsData, examplesData] = await Promise.all([
                TrainingDatasetService.getAllDatasets(),
                TrainingExampleService.getAllExamples()
            ]);
            if (datasetsData.length > 0) {
                setDatasets(datasetsData);
            }
            if (examplesData.length > 0) {
                setExamples(examplesData);
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
                        <DatabaseZap className="w-6 h-6 text-indigo-500" />
                        Training Data
                    </h1>
                    <p className="text-slate-500 text-sm">Review utterances and improve bot accuracy.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                        <UploadCloud className="w-4 h-4" /> Import
                    </button>
                    <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all">
                        <RotateCw className="w-4 h-4" /> Retrain Model
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full min-h-0">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold">Unclassified Utterances (Review Queue)</h3>
                    <button className="text-slate-500 hover:text-indigo-600 transition-colors">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-0">
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {[
                            { text: "I need to take tomorrow off", pred: "#ApplyLeave", conf: 89 },
                            { text: "What's the wifi password?", pred: "#Unknown", conf: 12 },
                            { text: "My paycheck seems wrong", pred: "#PayrollIssue", conf: 76 },
                            { text: "Can I bring my dog to work?", pred: "#AskPolicy", conf: 65 },
                            { text: "Update my emergency contact", pred: "#UpdateProfile", conf: 92 },
                            { text: "How do I claim dental?", pred: "#BenefitsClaim", conf: 81 },
                        ].map((item, i) => (
                            <div key={i} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-4">
                                <div className="flex-1">
                                    <p className="font-medium text-slate-800 dark:text-slate-200">"{item.text}"</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-slate-500">Predicted:</span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded
                                            ${item.conf > 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {item.pred} ({item.conf}%)
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors" title="Confirm Intent">
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors" title="Reject/Reclassify">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
