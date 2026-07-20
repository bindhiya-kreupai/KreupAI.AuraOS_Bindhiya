/**
 * Employee Engagement Module - Services
 * API-integrated service layer using APIClient.
 *
 * The engagement API surface returns the shared wrapped envelope
 * `{ success, data, meta }`. All list/item reads go through
 * `APIClient.unwrapList` / `APIClient.unwrapItem` so callers always
 * receive plain arrays / objects regardless of envelope shape.
 */

import { APIClient } from '@/lib/api-client';
import type {
  PulseSurvey,
  SurveyResponse,
  Event,
  RSVP,
  SocialPost,
  Idea,
  CSRActivity,
  Newsletter,
  EngagementMetrics,
  EngagementSettings,
} from './types';

export interface Classified {
  id: string;
  title: string;
  description?: string;
  category?: string;
  price?: number;
  currency?: string;
  condition?: string;
  status?: string;
  sellerId?: string;
  sellerName?: string;
  imageUrl?: string;
  createdAt?: string;
}

export interface Reward {
  id: string;
  title: string;
  description?: string;
  category?: string;
  pointsCost?: number;
  stock?: number;
  imageUrl?: string;
  isActive?: boolean;
}

export interface Referral {
  id: string;
  referrerId?: string;
  candidateName: string;
  candidateEmail?: string;
  role?: string;
  status?: string;
  bonusAmount?: number;
  currency?: string;
  referralCode?: string;
  createdAt?: string;
}

export class SurveyService {
  static async getSurveys(): Promise<PulseSurvey[]> {
    return APIClient.unwrapList<PulseSurvey>(await APIClient.get('/engagement/surveys'));
  }

  static async getSurveyById(id: string): Promise<PulseSurvey | null> {
    return APIClient.unwrapItem<PulseSurvey>(await APIClient.get(`/engagement/surveys/${id}`));
  }

  static async createSurvey(data: Partial<PulseSurvey>): Promise<PulseSurvey | null> {
    return APIClient.unwrapItem<PulseSurvey>(await APIClient.post('/engagement/surveys', data));
  }

  static async updateSurvey(
    id: string,
    updates: Partial<PulseSurvey>
  ): Promise<PulseSurvey | null> {
    return APIClient.unwrapItem<PulseSurvey>(
      await APIClient.put(`/engagement/surveys/${id}`, updates)
    );
  }

  static async getResponses(surveyId?: string): Promise<SurveyResponse[]> {
    return APIClient.unwrapList<SurveyResponse>(
      await APIClient.get('/engagement/survey-responses', surveyId ? { surveyId } : undefined)
    );
  }

  static async submitResponse(data: {
    surveyId: string;
    answers: unknown;
    isAnonymous?: boolean;
    sentiment?: number;
  }): Promise<SurveyResponse | null> {
    return APIClient.unwrapItem<SurveyResponse>(
      await APIClient.post('/engagement/survey-responses', data)
    );
  }
}

export class EventService {
  static async getEvents(): Promise<Event[]> {
    return APIClient.unwrapList<Event>(await APIClient.get('/engagement/events'));
  }

  static async getEventById(id: string): Promise<Event | null> {
    return APIClient.unwrapItem<Event>(await APIClient.get(`/engagement/events/${id}`));
  }

  static async createEvent(data: Partial<Event>): Promise<Event | null> {
    return APIClient.unwrapItem<Event>(await APIClient.post('/engagement/events', data));
  }

  static async updateEvent(id: string, updates: Partial<Event>): Promise<Event | null> {
    return APIClient.unwrapItem<Event>(await APIClient.put(`/engagement/events/${id}`, updates));
  }

  static async getRSVPs(eventId?: string): Promise<RSVP[]> {
    return APIClient.unwrapList<RSVP>(
      await APIClient.get('/engagement/rsvps', eventId ? { eventId } : undefined)
    );
  }

  static async createRSVP(data: { eventId: string; status: string }): Promise<RSVP | null> {
    return APIClient.unwrapItem<RSVP>(await APIClient.post('/engagement/rsvps', data));
  }
}

export class SocialFeedService {
  static async getPosts(): Promise<SocialPost[]> {
    return APIClient.unwrapList<SocialPost>(await APIClient.get('/engagement/posts'));
  }

  static async getPostById(id: string): Promise<SocialPost | null> {
    return APIClient.unwrapItem<SocialPost>(await APIClient.get(`/engagement/posts/${id}`));
  }

  static async createPost(
    data: Partial<SocialPost> & Record<string, unknown>
  ): Promise<SocialPost | null> {
    return APIClient.unwrapItem<SocialPost>(await APIClient.post('/engagement/posts', data));
  }

  static async updatePost(id: string, updates: Partial<SocialPost>): Promise<SocialPost | null> {
    return APIClient.unwrapItem<SocialPost>(
      await APIClient.put(`/engagement/posts/${id}`, updates)
    );
  }

  static async likePost(postId: string): Promise<void> {
    await APIClient.post(`/engagement/posts/${postId}/like`, {});
  }
}

export class InnovationService {
  static async getIdeas(): Promise<Idea[]> {
    return APIClient.unwrapList<Idea>(await APIClient.get('/engagement/ideas'));
  }

  static async getIdeaById(id: string): Promise<Idea | null> {
    return APIClient.unwrapItem<Idea>(await APIClient.get(`/engagement/ideas/${id}`));
  }

  static async createIdea(data: {
    title: string;
    description?: string;
    category?: string;
    department?: string;
  }): Promise<Idea | null> {
    return APIClient.unwrapItem<Idea>(await APIClient.post('/engagement/ideas', data));
  }

  static async updateIdea(id: string, updates: Partial<Idea>): Promise<Idea | null> {
    return APIClient.unwrapItem<Idea>(await APIClient.put(`/engagement/ideas/${id}`, updates));
  }

  static async voteIdea(ideaId: string, voteType: 'up' | 'down' = 'up'): Promise<Idea | null> {
    return APIClient.unwrapItem<Idea>(
      await APIClient.post(`/engagement/ideas/${ideaId}/vote`, { voteType })
    );
  }
}

export class CSRService {
  static async getActivities(): Promise<CSRActivity[]> {
    return APIClient.unwrapList<CSRActivity>(await APIClient.get('/engagement/csr-activities'));
  }

  static async getActivityById(id: string): Promise<CSRActivity | null> {
    return APIClient.unwrapItem<CSRActivity>(
      await APIClient.get(`/engagement/csr-activities/${id}`)
    );
  }

  static async createActivity(data: Partial<CSRActivity>): Promise<CSRActivity | null> {
    return APIClient.unwrapItem<CSRActivity>(
      await APIClient.post('/engagement/csr-activities', data)
    );
  }

  static async updateActivity(
    id: string,
    updates: Partial<CSRActivity>
  ): Promise<CSRActivity | null> {
    return APIClient.unwrapItem<CSRActivity>(
      await APIClient.put(`/engagement/csr-activities/${id}`, updates)
    );
  }

  static async volunteer(id: string): Promise<CSRActivity | null> {
    return APIClient.unwrapItem<CSRActivity>(
      await APIClient.post(`/engagement/csr-activities/${id}/volunteer`, {})
    );
  }
}

export class NewsletterService {
  static async getNewsletters(): Promise<Newsletter[]> {
    return APIClient.unwrapList<Newsletter>(await APIClient.get('/engagement/newsletters'));
  }

  static async getNewsletterById(id: string): Promise<Newsletter | null> {
    return APIClient.unwrapItem<Newsletter>(await APIClient.get(`/engagement/newsletters/${id}`));
  }

  static async createNewsletter(data: Partial<Newsletter>): Promise<Newsletter | null> {
    return APIClient.unwrapItem<Newsletter>(await APIClient.post('/engagement/newsletters', data));
  }

  static async updateNewsletter(
    id: string,
    updates: Partial<Newsletter>
  ): Promise<Newsletter | null> {
    return APIClient.unwrapItem<Newsletter>(
      await APIClient.put(`/engagement/newsletters/${id}`, updates)
    );
  }
}

export class ClassifiedService {
  static async getClassifieds(): Promise<Classified[]> {
    return APIClient.unwrapList<Classified>(await APIClient.get('/engagement/classifieds'));
  }

  static async createClassified(data: Partial<Classified>): Promise<Classified | null> {
    return APIClient.unwrapItem<Classified>(await APIClient.post('/engagement/classifieds', data));
  }
}

export class RewardService {
  static async getRewards(): Promise<Reward[]> {
    return APIClient.unwrapList<Reward>(await APIClient.get('/engagement/rewards'));
  }

  static async getBalance(): Promise<{ balance: number }> {
    const res = await APIClient.get('/engagement/rewards/balance');
    const item = APIClient.unwrapItem<{ balance: number }>(res);
    return item ?? { balance: 0 };
  }

  static async redeem(rewardId: string): Promise<{ balance: number } | null> {
    return APIClient.unwrapItem<{ balance: number }>(
      await APIClient.post(`/engagement/rewards/${rewardId}/redeem`, {})
    );
  }
}

export class ReferralService {
  static async getReferrals(): Promise<Referral[]> {
    return APIClient.unwrapList<Referral>(await APIClient.get('/engagement/referrals'));
  }

  static async createReferral(data: Partial<Referral>): Promise<Referral | null> {
    return APIClient.unwrapItem<Referral>(await APIClient.post('/engagement/referrals', data));
  }
}

export class EngagementAnalyticsService {
  static async getMetrics(timeRange?: string): Promise<EngagementMetrics | null> {
    return APIClient.unwrapItem<EngagementMetrics>(
      await APIClient.get('/engagement/analytics', timeRange ? { timeRange } : undefined)
    );
  }
}

export class EngagementSettingsService {
  static async getSettings(): Promise<EngagementSettings | null> {
    return APIClient.unwrapItem<EngagementSettings>(await APIClient.get('/engagement/settings'));
  }

  static async updateSettings(
    updates: Partial<EngagementSettings>
  ): Promise<EngagementSettings | null> {
    return APIClient.unwrapItem<EngagementSettings>(
      await APIClient.put('/engagement/settings', updates)
    );
  }
}
