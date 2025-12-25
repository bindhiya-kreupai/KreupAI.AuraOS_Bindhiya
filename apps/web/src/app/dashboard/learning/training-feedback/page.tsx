"use client";

import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    Star,
    ThumbsUp,
    ThumbsDown
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sentiment Summary */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 lg:col-span-3 flex items-center justify-around text-center">
                    <div>
                        <div className="text-4xl font-bold text-indigo-600 mb-1">4.8</div>
                        <div className="flex justify-center text-amber-400 mb-1"><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current opacity-50" /></div>
                        <div className="text-xs text-slate-500 font-bold uppercase">Avg Rating</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-emerald-600 mb-1">92%</div>
                        <div className="text-xs text-slate-500 font-bold uppercase">NPS Score</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-slate-700 dark:text-slate-300 mb-1">850</div>
                        <div className="text-xs text-slate-500 font-bold uppercase">Total Reviews</div>
                    </div>
                </div>

                {/* Reviews List */}
                <div className="lg:col-span-3 space-y-4">
                    {[
                        { course: 'Advanced React Patterns', user: 'Alice Johnson', rating: 5, comment: 'Excellent course! The compound components section was a game changer.', date: '2 days ago' },
                        { course: 'Leadership 101', user: 'Bob Williams', rating: 4, comment: 'Good content, but the video audio quality could be improved.', date: '5 days ago' },
                        { course: 'Safety Compliance', user: 'Charlie Brown', rating: 3, comment: 'A bit dry, but necessary information.', date: '1 week ago' },
                    ].map((review, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold text-lg">{review.course}</h4>
                                    <div className="text-xs text-slate-500">by {review.user} • {review.date}</div>
                                </div>
                                <div className="flex gap-1 text-amber-500">
                                    {[...Array(review.rating)].map((_, k) => <Star key={k} className="w-4 h-4 fill-current" />)}
                                </div>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-sm italic">"{review.comment}"</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
