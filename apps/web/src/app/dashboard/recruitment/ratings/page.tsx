"use client";

import React, { useState, useEffect } from 'react';
import { InterviewFeedbackService, InterviewService } from '../services';
import type { Interview, InterviewFeedback } from '../types';
import {
    Star,
    ThumbsUp,
    ThumbsDown,
    Loader2
} from 'lucide-react';

type ReviewRow = {
    id: string;
    candidate: string;
    role: string;
    reviewer: string;
    rating: number;
    feedback: string;
    recommendation: 'Hire' | 'Hold' | 'Reject';
    date: string;
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

function getRecommendationLabel(recommendation: InterviewFeedback['recommendation']): ReviewRow['recommendation'] {
    if (recommendation === 'hire') {
        return 'Hire';
    }

    if (recommendation === 'no_hire') {
        return 'Reject';
    }

    return 'Hold';
}

function getReviewComment(feedback: InterviewFeedback): string {
    if (feedback.notes?.trim()) {
        return feedback.notes;
    }

    const detail = [feedback.strengths, feedback.concerns].filter(Boolean).join(' ');
    return detail || 'No detailed feedback provided.';
}

function mapReviewRow(interview: Interview, feedback: InterviewFeedback): ReviewRow {
    return {
        id: feedback.id,
        candidate: interview.candidateName || 'Candidate',
        role: interview.jobTitle || String(interview.type || 'Interview').replace(/_/g, ' '),
        reviewer: feedback.interviewerName || interview.interviewers[0]?.name || 'Interviewer',
        rating: getNumericRating(feedback),
        feedback: getReviewComment(feedback),
        recommendation: getRecommendationLabel(feedback.recommendation),
        date: feedback.submittedDate ? new Date(feedback.submittedDate).toLocaleDateString() : '',
    };
}

export default function InterviewRatingsPage() {
    const [reviews, setReviews] = useState<ReviewRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const interviews = await InterviewService.getInterviews();
            const feedbackLists = await Promise.all(
                interviews.map(async interview => ({
                    interview,
                    feedback: await InterviewFeedbackService.getFeedback(interview.id),
                }))
            );

            setReviews(
                feedbackLists.flatMap(({ interview, feedback }) =>
                    feedback.map(item => mapReviewRow(interview, item))
                )
            );
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const averageScore = reviews.length > 0
        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
        : '0.0';
    const hireRecommendations = reviews.filter(review => review.recommendation === 'Hire').length;
    const rejectionCount = reviews.filter(review => review.recommendation === 'Reject').length;
    const submittedReviews = reviews.length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-silver-mist font-medium">Loading ratings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Star className="w-6 h-6 text-indigo-500" />
                        Interviewer Ratings
                    </h1>
                    <p className="text-slate-500 text-sm">Consolidated feedback and scorecards from interview panels.</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 shrink-0">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                    <div className="text-3xl font-black text-indigo-500 mb-1">{averageScore}</div>
                    <div className="text-xs font-bold text-slate-500">Avg. Candidate Score</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                    <div className="text-3xl font-black text-emerald-500 mb-1">{hireRecommendations}</div>
                    <div className="text-xs font-bold text-slate-500">Positive Recommends</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                    <div className="text-3xl font-black text-rose-500 mb-1">{rejectionCount}</div>
                    <div className="text-xs font-bold text-slate-500">Rejections</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                    <div className="text-3xl font-black text-amber-500 mb-1">{submittedReviews}</div>
                    <div className="text-xs font-bold text-slate-500">Submitted Reviews</div>
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
                    {reviews.length === 0 && (
                        <div className="p-12 text-center text-slate-400">
                            <Star className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">No interview ratings available yet.</p>
                        </div>
                    )}
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

