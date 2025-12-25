"use client";

import React, { useState, useEffect } from 'react';
import { InterviewFeedbackService } from '../services';
import {
    Star,
    Users,
    MessageCircle,
    ThumbsUp,
    ThumbsDown,
    BarChart2,
    CheckCircle2
} from 'lucide-react';

const REVIEWS = [
    { id: 1, candidate: 'Alex Chen', role: 'Frontend Dev', reviewer: 'Sarah J.', rating: 4.5, feedback: 'Strong React knowledge. detailed answers.', recommendation: 'Hire', date: '2 hours ago' },
    { id: 2, candidate: 'Maria G.', role: 'Product Manager', reviewer: 'Mike R.', rating: 3.0, feedback: 'Good product sense but lacks technical depth.', recommendation: 'Hold', date: 'Yesterday' },
    { id: 3, candidate: 'John Doe', role: 'Backend Dev', reviewer: 'David K.', rating: 2.0, feedback: 'Struggled with system design questions.', recommendation: 'Reject', date: '2 days ago' },
];

export default function InterviewRatingsPage() {
    const [reviews, setReviews] = useState<any[]>(REVIEWS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            // Fetch all feedbacks without specific interviewId
            const data = await InterviewFeedbackService.getFeedback('');
            if (data && data.length > 0) {
                setReviews(data);
            }
        } catch {
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
                        <Star className="w-6 h-6 text-indigo-500" />
                        Interviewer Ratings
                    </h1>
                    <p className="text-slate-500 text-sm">Consolidated feedback and scorecards from interview panels.</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                    <div className="text-3xl font-black text-indigo-500 mb-1">4.2</div>
                    <div className="text-xs font-bold text-slate-500">Avg. Candidate Score</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                    <div className="text-3xl font-black text-emerald-500 mb-1">12</div>
                    <div className="text-xs font-bold text-slate-500">Positive Recommends</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                    <div className="text-3xl font-black text-rose-500 mb-1">5</div>
                    <div className="text-xs font-bold text-slate-500">Rejections</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                    <div className="text-3xl font-black text-amber-500 mb-1">85%</div>
                    <div className="text-xs font-bold text-slate-500">Panel Agreement</div>
                </div>
            </div>

            {/* Review List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex-1 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 font-bold text-slate-500 text-sm flex">
                    <div className="w-1/4">Candidate</div>
                    <div className="w-1/4">Reviewer</div>
                    <div className="w-1/4">Scorecard</div>
                    <div className="w-1/4 text-right">Recommendation</div>
                </div>

                <div className="overflow-y-auto flex-1 p-2 space-y-2">
                    {reviews.map(review => (
                        <div key={review.id} className="flex items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                            <div className="w-1/4">
                                <div className="font-bold">{review.candidate}</div>
                                <div className="text-xs text-slate-500">{review.role}</div>
                            </div>
                            <div className="w-1/4 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">
                                    {review.reviewer.substring(0, 1)}
                                </div>
                                <div>
                                    <div className="font-bold text-sm">{review.reviewer}</div>
                                    <div className="text-xs text-slate-400">{review.date}</div>
                                </div>
                            </div>
                            <div className="w-1/4">
                                <div className="flex items-center gap-1 mb-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-3 h-3 ${i < Math.floor(review.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                                    ))}
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">{review.rating}/5</span>
                                </div>
                                <div className="text-xs text-slate-500 truncate max-w-[150px] italic">"{review.feedback}"</div>
                            </div>
                            <div className="w-1/4 text-right">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1
                                    ${review.recommendation === 'Hire' ? 'bg-emerald-100 text-emerald-600' :
                                        review.recommendation === 'Hold' ? 'bg-amber-100 text-amber-600' :
                                            'bg-rose-100 text-rose-600'}
                                `}>
                                    {review.recommendation === 'Hire' && <ThumbsUp className="w-3 h-3" />}
                                    {review.recommendation === 'Reject' && <ThumbsDown className="w-3 h-3" />}
                                    {review.recommendation}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
