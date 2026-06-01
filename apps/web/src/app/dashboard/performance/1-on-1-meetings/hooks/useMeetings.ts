/**
 * Meetings Hook - Production Ready
 * Manages all meeting operations with loading states, error handling, and persistence
 */

import { useState, useEffect, useCallback } from 'react';
import type { Meeting, FeedbackResponse, MeetingStats } from '../types';
import { MeetingsService } from '../services';
import { generateInitialMeetings } from '../data';
import { useToast } from './useToast';

export const useMeetings = () => {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const toast = useToast();

    // Load meetings on mount
    useEffect(() => {
        const loadMeetings = async () => {
            try {
                setIsLoading(true);
                const data = await MeetingsService.getMeetings();

                // If no data in localStorage, initialize with sample data
                if (data.length === 0) {
                    const initialData = generateInitialMeetings();
                    setMeetings(initialData);
                    // Save initial data to localStorage
                    for (const meeting of initialData) {
                        await MeetingsService.createMeeting(meeting);
                    }
                } else {
                    setMeetings(data);
                }
            } catch (error: any) {
                toast.error((error as Error).message || 'Failed to load meetings');
                setMeetings(generateInitialMeetings()); // Fallback to sample data
            } finally {
                setIsLoading(false);
            }
        };

        loadMeetings();
    }, []);

    // Create meeting
    const createMeeting = useCallback(async (meeting: Meeting) => {
        try {
            setIsSaving(true);
            await MeetingsService.createMeeting(meeting);
            setMeetings(prev => [meeting, ...prev]);
            toast.success('Meeting scheduled successfully!');
            return meeting;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to create meeting');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // Update meeting
    const updateMeeting = useCallback(async (id: string, updates: Partial<Meeting>) => {
        try {
            setIsSaving(true);
            const updated = await MeetingsService.updateMeeting(id, updates);
            setMeetings(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
            toast.success('Meeting updated successfully!');
            return updated;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to update meeting');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // Delete meeting
    const deleteMeeting = useCallback(async (id: string) => {
        try {
            setIsSaving(true);
            await MeetingsService.deleteMeeting(id);
            setMeetings(prev => prev.filter(m => m.id !== id));
            toast.success('Meeting deleted successfully!');
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to delete meeting');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // Complete meeting
    const completeMeeting = useCallback(async (id: string) => {
        try {
            setIsSaving(true);
            const completed = await MeetingsService.completeMeeting(id);
            setMeetings(prev => prev.map(m =>
                m.id === id ? { ...m, status: 'completed', completedAt: new Date().toISOString() } : m
            ));
            toast.success('Meeting completed!');
            return completed;
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to complete meeting');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // Submit feedback
    const submitFeedback = useCallback(async (meetingId: string, responses: FeedbackResponse[]) => {
        try {
            setIsSaving(true);
            await MeetingsService.submitFeedback(meetingId, responses);
            setMeetings(prev => prev.map(m =>
                m.id === meetingId ? { ...m, feedbackResponses: responses } : m
            ));
            toast.success('Feedback submitted successfully!');
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to submit feedback');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // Get analytics
    const getAnalytics = useCallback(async (): Promise<MeetingStats> => {
        try {
            return await MeetingsService.getAnalytics(meetings);
        } catch (error: any) {
            toast.error((error as Error).message || 'Failed to load analytics');
            return {
                totalMeetings: 0,
                completedMeetings: 0,
                averageSentiment: 0,
                pendingActionItems: 0,
                employeesEngaged: 0,
                trendsImproving: false,
            };
        }
    }, [meetings, toast]);

    return {
        meetings,
        isLoading,
        isSaving,
        createMeeting,
        updateMeeting,
        deleteMeeting,
        completeMeeting,
        submitFeedback,
        getAnalytics,
        toast,
    };
};
