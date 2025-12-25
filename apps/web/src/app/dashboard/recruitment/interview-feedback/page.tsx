"use client";

import React, { useState, useEffect } from 'react';
import { InterviewFeedbackService } from '../services';
import {
    MessageCircle,
    Star,
    ThumbsUp,
    ThumbsDown,
    User,
    Calendar,
    Clock
} from 'lucide-react';

export default function InterviewFeedbackPage() {
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        try {
            // getFeedback requires an interviewId, but for listing all feedbacks
            // we'll need to get all interviews first or modify the approach
            // For now, fetching feedbacks without specific interviewId filter
            setLoading(true);
            const data = await InterviewFeedbackService.getFeedback('');
            if (data && data.length > 0) {
                setFeedbacks(data);
            }
        } catch (error) {
            console.error('Error fetching feedback:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitFeedback = async (feedbackData: any) => {
        try {
            await InterviewFeedbackService.submitFeedback(feedbackData);
            await fetchFeedback();
        } catch (error) {
            console.error('Error submitting feedback:', error);
        }
    };

    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <MessageCircle className="w-6 h-6 text-indigo-500" />
                        Interview Feedback
                    </h1>
                    <p className="text-slate-500 text-sm">Consolidated view of interviewer ratings and comments.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Feedback Stream */}
                <div className="lg:col-span-2 space-y-6">
                    {[
                        {
                            candidate: 'Liam Johnson',
                            role: 'Senior Frontend Dev',
                            interviewer: 'Alice Chen',
                            round: 'Technical Round',
                            rating: 4,
                            recommendation: 'Hire',
                            comment: 'Strong grasp of React internals and performance optimization. Solved the coding challenge efficiently. Communication was clear.',
                            time: '2 hours ago'
                        },
                        {
                            candidate: 'Sophia Williams',
                            role: 'Product Manager',
                            interviewer: 'Bob Smith',
                            round: 'Product Sense',
                            rating: 3,
                            recommendation: 'Hold',
                            comment: 'Good product intuition but struggled with the metrics question. Needs to be more data-driven.',
                            time: 'Yesterday'
                        },
                        {
                            candidate: 'Ethan Hunt',
                            role: 'Security Engineer',
                            interviewer: 'Charlie Kim',
                            round: 'System Design',
                            rating: 2,
                            recommendation: 'Reject',
                            comment: 'Failed to address key scalability concerns. Solution was too simplistic for a senior role.',
                            time: '2 days ago'
                        },
                    ].map((feedback, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-500 text-lg">
                                        {feedback.candidate.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{feedback.candidate}</h3>
                                        <div className="text-xs text-slate-500 flex items-center gap-2">
                                            <span>{feedback.role}</span>
                                            <span>•</span>
                                            <span className="text-indigo-500 font-bold">{feedback.round}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${feedback.recommendation === 'Hire' ? 'bg-emerald-100 text-emerald-600' :
                                        feedback.recommendation === 'Hold' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
                                    }`}>
                                    {feedback.recommendation === 'Hire' ? <ThumbsUp className="w-3 h-3" /> : feedback.recommendation === 'Reject' ? <ThumbsDown className="w-3 h-3" /> : null}
                                    {feedback.recommendation}
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mb-4">
                                <div className="flex gap-1 mb-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star key={star} className={`w-4 h-4 ${star <= feedback.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                                    ))}
                                </div>
                                <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{feedback.comment}"</p>
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                                <div className="flex items-center gap-2">
                                    <User className="w-3 h-3" /> {feedback.interviewer}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3 h-3" /> {feedback.time}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold mb-4">Filter Feedback</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Status</label>
                                <select className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm">
                                    <option>All Feedback</option>
                                    <option>Pending Review</option>
                                    <option>Completed</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Outcome</label>
                                <select className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm">
                                    <option>Any Recommendation</option>
                                    <option>Strong Hire</option>
                                    <option>Hire</option>
                                    <option>No Hire</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
