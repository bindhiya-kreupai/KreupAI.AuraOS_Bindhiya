"use client";

import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    Star,
    Loader2
} from 'lucide-react';
import { TrainingFeedbackService } from '../services';

export default function TrainingFeedbackPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await TrainingFeedbackService.getTrainingFeedback();
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

    const avgRating = data.length > 0
        ? Math.round(data.reduce((sum, r) => sum + (r.overallRating || 0), 0) / data.length * 10) / 10
        : 0;

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-indigo-500" />
                        Training Feedback
                    </h1>
                    <p className="text-slate-500 text-sm">Analyze course ratings and qualitative feedback.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 lg:col-span-3 flex items-center justify-around text-center">
                        <div>
                            <div className="text-4xl font-bold text-indigo-600 mb-1">{avgRating || '-'}</div>
                            <div className="flex justify-center text-amber-400 mb-1">
                                {[1,2,3,4,5].map(n => (
                                    <Star key={n} className={`w-4 h-4 ${n <= Math.round(avgRating) ? 'fill-current' : 'opacity-50'}`} />
                                ))}
                            </div>
                            <div className="text-xs text-slate-500 font-bold uppercase">Avg Rating</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-slate-700 dark:text-slate-300 mb-1">{data.length}</div>
                            <div className="text-xs text-slate-500 font-bold uppercase">Total Reviews</div>
                        </div>
                    </div>

                    {data.length === 0 ? (
                        <div className="lg:col-span-3 flex flex-col items-center justify-center h-40 text-slate-400">
                            <MessageSquare className="w-10 h-10 mb-2 opacity-30" />
                            <p className="text-sm">No feedback submitted yet</p>
                        </div>
                    ) : (
                        <div className="lg:col-span-3 space-y-4">
                            {data.map((review, i) => (
                                <div key={review.id || i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-bold text-lg">{review.courseTitle || review.courseId}</h4>
                                            <div className="text-xs text-slate-500">by {review.learnerName || review.learnerId} {review.submittedDate ? `| ${new Date(review.submittedDate).toLocaleDateString()}` : ''}</div>
                                        </div>
                                        <div className="flex gap-1 text-amber-500">
                                            {[...Array(review.overallRating || 0)].map((_, k) => <Star key={k} className="w-4 h-4 fill-current" />)}
                                        </div>
                                    </div>
                                    {review.strengths && <p className="text-slate-600 dark:text-slate-300 text-sm italic">"{review.strengths}"</p>}
                                    {review.improvements && <p className="text-slate-500 text-xs mt-1">Improvements: {review.improvements}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
