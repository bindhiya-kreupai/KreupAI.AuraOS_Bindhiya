/**
 * One-on-One Meetings Service Layer
 * Handles all API interactions and data persistence
 */

import { Meeting, FeedbackResponse, MeetingStats } from './types';
import { APIClient, APIError } from '@/lib/api-client';
import { logger } from '@/lib/logger';

const API_ENDPOINT = '/meetings';

/**
 * Meetings API Service
 */
export class MeetingsService {
    /**
     * Fetch all meetings
     */
    static async getMeetings(): Promise<Meeting[]> {
        try {
            return await APIClient.get<Meeting[]>(API_ENDPOINT);
        } catch (error) {
            logger.error('Error fetching meetings:', error);
            const message = error instanceof APIError
                ? `Failed to load meetings: ${error.message}`
                : 'Failed to load meetings. Please try again.';
            throw new Error(message);
        }
    }

    /**
     * Create a new meeting
     */
    static async createMeeting(meeting: Meeting): Promise<Meeting> {
        try {
            return await APIClient.post<Meeting>(API_ENDPOINT, meeting);
        } catch (error) {
            logger.error('Error creating meeting:', error);
            const message = error instanceof APIError
                ? `Failed to schedule meeting: ${error.message}`
                : 'Failed to schedule meeting. Please try again.';
            throw new Error(message);
        }
    }

    /**
     * Update an existing meeting
     */
    static async updateMeeting(id: string, updates: Partial<Meeting>): Promise<Meeting> {
        try {
            return await APIClient.patch<Meeting>(`${API_ENDPOINT}/${id}`, updates);
        } catch (error) {
            logger.error('Error updating meeting:', error);
            const message = error instanceof APIError
                ? `Failed to update meeting: ${error.message}`
                : 'Failed to update meeting. Please try again.';
            throw new Error(message);
        }
    }

    /**
     * Delete a meeting
     */
    static async deleteMeeting(id: string): Promise<void> {
        try {
            await APIClient.delete<void>(`${API_ENDPOINT}/${id}`);
        } catch (error) {
            logger.error('Error deleting meeting:', error);
            const message = error instanceof APIError
                ? `Failed to delete meeting: ${error.message}`
                : 'Failed to delete meeting. Please try again.';
            throw new Error(message);
        }
    }

    /**
     * Complete a meeting
     */
    static async completeMeeting(id: string): Promise<Meeting> {
        try {
            return await APIClient.post<Meeting>(`${API_ENDPOINT}/${id}/complete`, {});
        } catch (error) {
            logger.error('Error completing meeting:', error);
            const message = error instanceof APIError
                ? `Failed to complete meeting: ${error.message}`
                : 'Failed to complete meeting. Please try again.';
            throw new Error(message);
        }
    }

    /**
     * Submit feedback for a meeting
     */
    static async submitFeedback(
        meetingId: string,
        responses: FeedbackResponse[]
    ): Promise<void> {
        try {
            await APIClient.post<void>(
                `${API_ENDPOINT}/${meetingId}/feedback`,
                { responses }
            );
        } catch (error) {
            logger.error('Error submitting feedback:', error);
            const message = error instanceof APIError
                ? `Failed to submit feedback: ${error.message}`
                : 'Failed to submit feedback. Please try again.';
            throw new Error(message);
        }
    }

    /**
     * Get analytics and statistics
     */
    static async getAnalytics(): Promise<MeetingStats> {
        try {
            return await APIClient.get<MeetingStats>(`${API_ENDPOINT}/analytics`);
        } catch (error) {
            logger.error('Error fetching analytics:', error);
            const message = error instanceof APIError
                ? `Failed to load analytics: ${error.message}`
                : 'Failed to load analytics. Please try again.';
            throw new Error(message);
        }
    }
}
