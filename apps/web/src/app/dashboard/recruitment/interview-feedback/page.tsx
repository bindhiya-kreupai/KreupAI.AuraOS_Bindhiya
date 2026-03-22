"use client";

import React, { useState, useEffect } from 'react';
import { InterviewFeedbackService, InterviewService } from '../services';
import type { Interview, InterviewFeedback } from '../types';
import {
    MessageCircle,
    Star,
    ThumbsUp,
    ThumbsDown,
    User,
    Clock,
    Loader2
} from 'lucide-react';

type FeedbackEntry = {
    interview: Interview;
    feedback: InterviewFeedback;
};

function getNumericRating(feedback: InterviewFeedback): number {
    const values = [
        feedback.technicalSkills,
        feedback.communicationSkills,
        feedback.problemSolving,
        feedback.cultureFit,
    ].filter((value): value is number => typeof value === 'number' && !Number.isNaN(value));

    if (values.length === 0) {
        if (feedback.recommendation === 'hire') {
            return 4;
        }

        if (feedback.recommendation === 'no_hire') {
            return 2;
        }

        return 0;
    }

    return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

function getRecommendationLabel(recommendation: InterviewFeedback['recommendation']): 'Hire' | 'Hold' | 'Reject' {
    if (recommendation === 'hire') {
        return 'Hire';
    }

    if (recommendation === 'no_hire') {
        return 'Reject';
    }

    return 'Hold';
}

function getFeedbackComment(feedback: InterviewFeedback): string {
    if (feedback.notes?.trim()) {
        return feedback.notes;
    }

    const detail = [feedback.strengths, feedback.concerns].filter(Boolean).join(' ');
    return detail || 'No feedback comments provided yet.';
}

function formatInterviewType(type: Interview['type']): string {
    return String(type || 'Interview')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, character => character.toUpperCase());
}

export default function InterviewFeedbackPage() {
    const [entries, setEntries] = useState<FeedbackEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInterviewsWithFeedback();
    }, []);

    const fetchInterviewsWithFeedback = async () => {
        try {
            setLoading(true);
            const interviews = await InterviewService.getInterviews();
            const feedbackLists = await Promise.all(
                interviews.map(async interview => ({
                    interview,
                    feedback: await InterviewFeedbackService.getFeedback(interview.id),
                }))
            );

            setEntries(
                feedbackLists.flatMap(({ interview, feedback }) =>
                    feedback.map(item => ({ interview, feedback: item }))
                )
            );
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
                    <p className="text-sm text-silver-mist font-medium">Loading feedback...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
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
                <div className="lg:col-span-2 space-y-4">
                    {entries.length === 0 && (
                        <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                            <MessageCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 mb-2">No feedback yet</h3>
                            <p className="text-sm text-slate-400 dark:text-slate-500">Interview feedback will appear here after interviews are completed.</p>
                        </div>
                    )}
                    {entries.map(({ interview, feedback }, index) => {
                        const candidateName = interview.candidateName || `Interview ${index + 1}`;
                        const role = interview.jobTitle || formatInterviewType(interview.type);
                        const interviewerName = feedback.interviewerName || interview.interviewers[0]?.name || 'Unknown';
                        const rating = getNumericRating(feedback);
                        const recommendation = getRecommendationLabel(feedback.recommendation);
                        const comment = getFeedbackComment(feedback);
                        const time = feedback.submittedDate
                            ? new Date(feedback.submittedDate).toLocaleDateString()
                            : interview.scheduledDate
                                ? new Date(interview.scheduledDate).toLocaleDateString()
                                : '';

                        return (
                            <div key={feedback.id || interview.id || index} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-3">
                                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-500 text-lg">
                                            {candidateName.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{candidateName}</h3>
                                            <div className="text-xs text-slate-500 flex items-center gap-2">
                                                <span>{role}</span>
                                                <span>•</span>
                                                <span className="text-indigo-500 font-bold">{formatInterviewType(interview.type)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${recommendation === 'Hire' ? 'bg-emerald-100 text-emerald-600' :
                                            recommendation === 'Hold' ? 'bg-amber-100 text-amber-600' :
                                                recommendation === 'Reject' ? 'bg-rose-100 text-rose-600' :
                                                    'bg-slate-100 text-slate-500'
                                        }`}>
                                        {recommendation === 'Hire' ? <ThumbsUp className="w-3 h-3" /> : recommendation === 'Reject' ? <ThumbsDown className="w-3 h-3" /> : null}
                                        {recommendation}
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mb-4">
                                    <div className="flex gap-1 mb-2">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star key={star} className={`w-4 h-4 ${star <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                                        ))}
                                    </div>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 italic">&quot;{comment}&quot;</p>
                                </div>

                                <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                                    <div className="flex items-center gap-2">
                                        <User className="w-3 h-3" /> {interviewerName}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3 h-3" /> {time}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Filters */}
                <div className="space-y-4">
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

