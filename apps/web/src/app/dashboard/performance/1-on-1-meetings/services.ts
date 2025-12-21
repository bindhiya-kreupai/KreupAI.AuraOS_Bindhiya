/**
 * One-on-One Meetings Service Layer
 * Handles all API interactions and data persistence
 */

import { Meeting, FeedbackResponse, MeetingStats } from './types';
import { logger } from '@/lib/logger';

const API_BASE = '/api/meetings';
const STORAGE_KEY = 'aura_one_on_one_meetings';

// Simulated API delay for realistic UX
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * LocalStorage Helper for data persistence
 */
class StorageService {
    static save(meetings: Meeting[]): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings));
        } catch (error) {
            logger.error('Failed to save meetings to localStorage:', error);
        }
    }

    static load(): Meeting[] {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            logger.error('Failed to load meetings from localStorage:', error);
            return [];
        }
    }

    static clear(): void {
        localStorage.removeItem(STORAGE_KEY);
    }
}

/**
 * Meetings API Service
 * TODO: Replace mock implementation with real API calls
 */
export class MeetingsService {
    /**
     * Fetch all meetings from API/localStorage
     */
    static async getMeetings(): Promise<Meeting[]> {
        await delay(300); // Simulate network delay

        try {
            // TODO: Replace with real API call
            // const response = await fetch(API_BASE);
            // if (!response.ok) throw new Error('Failed to fetch meetings');
            // return response.json();

            // For now, load from localStorage
            return StorageService.load();
        } catch (error) {
            logger.error('Error fetching meetings:', error);
            throw new Error('Failed to load meetings. Please try again.');
        }
    }

    /**
     * Create a new meeting
     */
    static async createMeeting(meeting: Meeting): Promise<Meeting> {
        await delay(500);

        try {
            // TODO: Replace with real API call
            // const response = await fetch(API_BASE, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(meeting),
            // });
            // if (!response.ok) throw new Error('Failed to create meeting');
            // return response.json();

            // For now, save to localStorage
            const meetings = StorageService.load();
            meetings.push(meeting);
            StorageService.save(meetings);
            return meeting;
        } catch (error) {
            logger.error('Error creating meeting:', error);
            throw new Error('Failed to schedule meeting. Please try again.');
        }
    }

    /**
     * Update an existing meeting
     */
    static async updateMeeting(id: string, updates: Partial<Meeting>): Promise<Meeting> {
        await delay(300);

        try {
            // TODO: Replace with real API call
            // const response = await fetch(`${API_BASE}/${id}`, {
            //     method: 'PATCH',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(updates),
            // });
            // if (!response.ok) throw new Error('Failed to update meeting');
            // return response.json();

            const meetings = StorageService.load();
            const index = meetings.findIndex(m => m.id === id);
            if (index === -1) throw new Error('Meeting not found');

            meetings[index] = { ...meetings[index], ...updates };
            StorageService.save(meetings);
            return meetings[index];
        } catch (error) {
            logger.error('Error updating meeting:', error);
            throw new Error('Failed to update meeting. Please try again.');
        }
    }

    /**
     * Delete a meeting
     */
    static async deleteMeeting(id: string): Promise<void> {
        await delay(300);

        try {
            // TODO: Replace with real API call
            // const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
            // if (!response.ok) throw new Error('Failed to delete meeting');

            const meetings = StorageService.load();
            const filtered = meetings.filter(m => m.id !== id);
            StorageService.save(filtered);
        } catch (error) {
            logger.error('Error deleting meeting:', error);
            throw new Error('Failed to delete meeting. Please try again.');
        }
    }

    /**
     * Complete a meeting
     */
    static async completeMeeting(id: string): Promise<Meeting> {
        await delay(500);

        try {
            // TODO: Replace with real API call
            // const response = await fetch(`${API_BASE}/${id}/complete`, { method: 'POST' });
            // if (!response.ok) throw new Error('Failed to complete meeting');
            // return response.json();

            const meetings = StorageService.load();
            const index = meetings.findIndex(m => m.id === id);
            if (index === -1) throw new Error('Meeting not found');

            meetings[index].status = 'completed';
            meetings[index].completedAt = new Date().toISOString();
            StorageService.save(meetings);
            return meetings[index];
        } catch (error) {
            logger.error('Error completing meeting:', error);
            throw new Error('Failed to complete meeting. Please try again.');
        }
    }

    /**
     * Submit feedback for a meeting
     */
    static async submitFeedback(
        meetingId: string,
        responses: FeedbackResponse[]
    ): Promise<void> {
        await delay(500);

        try {
            // TODO: Replace with real API call
            // const response = await fetch(`${API_BASE}/${meetingId}/feedback`, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ responses }),
            // });
            // if (!response.ok) throw new Error('Failed to submit feedback');

            const meetings = StorageService.load();
            const index = meetings.findIndex(m => m.id === meetingId);
            if (index === -1) throw new Error('Meeting not found');

            meetings[index].feedbackResponses = responses;
            StorageService.save(meetings);
        } catch (error) {
            logger.error('Error submitting feedback:', error);
            throw new Error('Failed to submit feedback. Please try again.');
        }
    }

    /**
     * Get analytics and statistics
     */
    static async getAnalytics(meetings: Meeting[]): Promise<MeetingStats> {
        await delay(200);

        try {
            // TODO: Replace with real API call for server-side calculation
            // const response = await fetch(`${API_BASE}/analytics`);
            // if (!response.ok) throw new Error('Failed to fetch analytics');
            // return response.json();

            // Calculate client-side for now
            const completedMeetings = meetings.filter(m => m.status === 'completed');
            const sentimentScores = meetings.filter(m => m.sentiment).map(m => m.sentiment!);

            return {
                totalMeetings: meetings.length,
                completedMeetings: completedMeetings.length,
                averageSentiment: sentimentScores.length > 0
                    ? sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length
                    : 0,
                pendingActionItems: meetings
                    .flatMap(m => m.actionItems)
                    .filter(a => a.status !== 'completed').length,
                employeesEngaged: new Set(meetings.map(m => m.employeeId)).size,
                trendsImproving: true, // Would be calculated from historical data
            };
        } catch (error) {
            logger.error('Error fetching analytics:', error);
            throw new Error('Failed to load analytics. Please try again.');
        }
    }
}

/**
 * Export storage service for direct access if needed
 */
export { StorageService };
