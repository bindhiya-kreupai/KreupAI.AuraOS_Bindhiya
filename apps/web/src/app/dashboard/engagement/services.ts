/**
 * Employee Engagement Module - Services
 * API-integrated service layer using APIClient
 */

import { APIClient } from '@/lib/api-client';
import type { PulseSurvey, SurveyResponse, Event, RSVP, SocialPost, Idea, CSRActivity, Newsletter, EngagementMetrics, EngagementSettings } from './types';

export class SurveyService {
  static async getSurveys(): Promise<PulseSurvey[]> {
    return APIClient.get<PulseSurvey[]>('/engagement/surveys');
  }

  static async getSurveyById(id: string): Promise<PulseSurvey | null> {
    return APIClient.get<PulseSurvey>(`/engagement/surveys/${id}`);
  }

  static async createSurvey(data: PulseSurvey): Promise<PulseSurvey> {
    return APIClient.post<PulseSurvey>('/engagement/surveys', data);
  }

  static async updateSurvey(id: string, updates: Partial<PulseSurvey>): Promise<PulseSurvey> {
    return APIClient.put<PulseSurvey>(`/engagement/surveys/${id}`, updates);
  }

  static async getResponses(surveyId?: string): Promise<SurveyResponse[]> {
    return APIClient.get<SurveyResponse[]>('/engagement/survey-responses', surveyId ? { surveyId } : undefined);
  }

  static async submitResponse(data: SurveyResponse): Promise<SurveyResponse> {
    return APIClient.post<SurveyResponse>('/engagement/survey-responses', data);
  }
}

export class EventService {
  static async getEvents(): Promise<Event[]> {
    return APIClient.get<Event[]>('/engagement/events');
  }

  static async getEventById(id: string): Promise<Event | null> {
    return APIClient.get<Event>(`/engagement/events/${id}`);
  }

  static async createEvent(data: Event): Promise<Event> {
    return APIClient.post<Event>('/engagement/events', data);
  }

  static async updateEvent(id: string, updates: Partial<Event>): Promise<Event> {
    return APIClient.put<Event>(`/engagement/events/${id}`, updates);
  }

  static async getRSVPs(eventId?: string): Promise<RSVP[]> {
    return APIClient.get<RSVP[]>('/engagement/rsvps', eventId ? { eventId } : undefined);
  }

  static async createRSVP(data: RSVP): Promise<RSVP> {
    return APIClient.post<RSVP>('/engagement/rsvps', data);
  }
}

export class SocialFeedService {
  static async getPosts(): Promise<SocialPost[]> {
    return APIClient.get<SocialPost[]>('/engagement/posts');
  }

  static async getPostById(id: string): Promise<SocialPost | null> {
    return APIClient.get<SocialPost>(`/engagement/posts/${id}`);
  }

  static async createPost(data: SocialPost): Promise<SocialPost> {
    return APIClient.post<SocialPost>('/engagement/posts', data);
  }

  static async updatePost(id: string, updates: Partial<SocialPost>): Promise<SocialPost> {
    return APIClient.put<SocialPost>(`/engagement/posts/${id}`, updates);
  }

  static async likePost(postId: string, userId: string, userName: string): Promise<void> {
    return APIClient.post<void>(`/engagement/posts/${postId}/like`, { userId, userName });
  }
}

export class InnovationService {
  static async getIdeas(): Promise<Idea[]> {
    return APIClient.get<Idea[]>('/engagement/ideas');
  }

  static async getIdeaById(id: string): Promise<Idea | null> {
    return APIClient.get<Idea>(`/engagement/ideas/${id}`);
  }

  static async createIdea(data: Idea): Promise<Idea> {
    return APIClient.post<Idea>('/engagement/ideas', data);
  }

  static async updateIdea(id: string, updates: Partial<Idea>): Promise<Idea> {
    return APIClient.put<Idea>(`/engagement/ideas/${id}`, updates);
  }

  static async voteIdea(ideaId: string, voterId: string, voterName: string, voteType: 'up' | 'down'): Promise<void> {
    return APIClient.post<void>(`/engagement/ideas/${ideaId}/vote`, { voterId, voterName, voteType });
  }
}

export class CSRService {
  static async getActivities(): Promise<CSRActivity[]> {
    return APIClient.get<CSRActivity[]>('/engagement/csr-activities');
  }

  static async getActivityById(id: string): Promise<CSRActivity | null> {
    return APIClient.get<CSRActivity>(`/engagement/csr-activities/${id}`);
  }

  static async createActivity(data: CSRActivity): Promise<CSRActivity> {
    return APIClient.post<CSRActivity>('/engagement/csr-activities', data);
  }

  static async updateActivity(id: string, updates: Partial<CSRActivity>): Promise<CSRActivity> {
    return APIClient.put<CSRActivity>(`/engagement/csr-activities/${id}`, updates);
  }
}

export class NewsletterService {
  static async getNewsletters(): Promise<Newsletter[]> {
    return APIClient.get<Newsletter[]>('/engagement/newsletters');
  }

  static async getNewsletterById(id: string): Promise<Newsletter | null> {
    return APIClient.get<Newsletter>(`/engagement/newsletters/${id}`);
  }

  static async createNewsletter(data: Newsletter): Promise<Newsletter> {
    return APIClient.post<Newsletter>('/engagement/newsletters', data);
  }

  static async updateNewsletter(id: string, updates: Partial<Newsletter>): Promise<Newsletter> {
    return APIClient.put<Newsletter>(`/engagement/newsletters/${id}`, updates);
  }
}

export class EngagementAnalyticsService {
  static async getMetrics(): Promise<EngagementMetrics> {
    return APIClient.get<EngagementMetrics>('/engagement/analytics');
  }
}

export class EngagementSettingsService {
  static async getSettings(): Promise<EngagementSettings> {
    return APIClient.get<EngagementSettings>('/engagement/settings');
  }

  static async updateSettings(updates: Partial<EngagementSettings>): Promise<EngagementSettings> {
    return APIClient.put<EngagementSettings>('/engagement/settings', updates);
  }
}
