/**
 * Employee Engagement Module - Services
 * API-ready service layer for engagement operations
 */

import { PulseSurvey, SurveyResponse, Event, RSVP, SocialPost, Idea, CSRActivity, Newsletter, EngagementMetrics, EngagementSettings } from './types';

// Storage keys
const STORAGE_KEYS = {
  SURVEYS: 'engagement_surveys',
  RESPONSES: 'engagement_responses',
  EVENTS: 'engagement_events',
  RSVPS: 'engagement_rsvps',
  POSTS: 'engagement_posts',
  IDEAS: 'engagement_ideas',
  CSR: 'engagement_csr',
  NEWSLETTERS: 'engagement_newsletters',
  SETTINGS: 'engagement_settings'
};

// Survey Service
export class SurveyService {
  static async getSurveys(): Promise<PulseSurvey[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.SURVEYS);
    return stored ? JSON.parse(stored) : [];
  }

  static async getSurveyById(id: string): Promise<PulseSurvey | null> {
    const surveys = await this.getSurveys();
    return surveys.find(s => s.id === id) || null;
  }

  static async createSurvey(data: PulseSurvey): Promise<PulseSurvey> {
    const surveys = await this.getSurveys();
    surveys.push(data);
    localStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify(surveys));
    return data;
  }

  static async updateSurvey(id: string, updates: Partial<PulseSurvey>): Promise<PulseSurvey> {
    const surveys = await this.getSurveys();
    const index = surveys.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Survey not found');
    surveys[index] = { ...surveys[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify(surveys));
    return surveys[index];
  }

  static async getResponses(surveyId?: string): Promise<SurveyResponse[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.RESPONSES);
    const responses = stored ? JSON.parse(stored) : [];
    return surveyId ? responses.filter((r: SurveyResponse) => r.surveyId === surveyId) : responses;
  }

  static async submitResponse(data: SurveyResponse): Promise<SurveyResponse> {
    const responses = await this.getResponses();
    responses.push(data);
    localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(responses));
    return data;
  }
}

// Event Service
export class EventService {
  static async getEvents(): Promise<Event[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.EVENTS);
    return stored ? JSON.parse(stored) : [];
  }

  static async getEventById(id: string): Promise<Event | null> {
    const events = await this.getEvents();
    return events.find(e => e.id === id) || null;
  }

  static async createEvent(data: Event): Promise<Event> {
    const events = await this.getEvents();
    events.push(data);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    return data;
  }

  static async updateEvent(id: string, updates: Partial<Event>): Promise<Event> {
    const events = await this.getEvents();
    const index = events.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Event not found');
    events[index] = { ...events[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    return events[index];
  }

  static async getRSVPs(eventId?: string): Promise<RSVP[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.RSVPS);
    const rsvps = stored ? JSON.parse(stored) : [];
    return eventId ? rsvps.filter((r: RSVP) => r.eventId === eventId) : rsvps;
  }

  static async createRSVP(data: RSVP): Promise<RSVP> {
    const rsvps = await this.getRSVPs();
    rsvps.push(data);
    localStorage.setItem(STORAGE_KEYS.RSVPS, JSON.stringify(rsvps));
    return data;
  }
}

// Social Feed Service
export class SocialFeedService {
  static async getPosts(): Promise<SocialPost[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.POSTS);
    return stored ? JSON.parse(stored) : [];
  }

  static async getPostById(id: string): Promise<SocialPost | null> {
    const posts = await this.getPosts();
    return posts.find(p => p.id === id) || null;
  }

  static async createPost(data: SocialPost): Promise<SocialPost> {
    const posts = await this.getPosts();
    posts.push(data);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    return data;
  }

  static async updatePost(id: string, updates: Partial<SocialPost>): Promise<SocialPost> {
    const posts = await this.getPosts();
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Post not found');
    posts[index] = { ...posts[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    return posts[index];
  }

  static async likePost(postId: string, userId: string, userName: string): Promise<void> {
    const post = await this.getPostById(postId);
    if (!post) throw new Error('Post not found');
    const likes = post.likes || [];
    likes.push({ id: Date.now().toString(), userId, userName, likedDate: new Date().toISOString() });
    await this.updatePost(postId, { likes });
  }
}

// Innovation Service
export class InnovationService {
  static async getIdeas(): Promise<Idea[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.IDEAS);
    return stored ? JSON.parse(stored) : [];
  }

  static async getIdeaById(id: string): Promise<Idea | null> {
    const ideas = await this.getIdeas();
    return ideas.find(i => i.id === id) || null;
  }

  static async createIdea(data: Idea): Promise<Idea> {
    const ideas = await this.getIdeas();
    ideas.push(data);
    localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
    return data;
  }

  static async updateIdea(id: string, updates: Partial<Idea>): Promise<Idea> {
    const ideas = await this.getIdeas();
    const index = ideas.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Idea not found');
    ideas[index] = { ...ideas[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
    return ideas[index];
  }

  static async voteIdea(ideaId: string, voterId: string, voterName: string, voteType: 'up' | 'down'): Promise<void> {
    const idea = await this.getIdeaById(ideaId);
    if (!idea) throw new Error('Idea not found');
    const votes = idea.votes || [];
    votes.push({ id: Date.now().toString(), ideaId, voterId, voterName, voteDate: new Date().toISOString(), voteType });
    await this.updateIdea(ideaId, { votes, voteCount: votes.length });
  }
}

// CSR Service
export class CSRService {
  static async getActivities(): Promise<CSRActivity[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.CSR);
    return stored ? JSON.parse(stored) : [];
  }

  static async getActivityById(id: string): Promise<CSRActivity | null> {
    const activities = await this.getActivities();
    return activities.find(a => a.id === id) || null;
  }

  static async createActivity(data: CSRActivity): Promise<CSRActivity> {
    const activities = await this.getActivities();
    activities.push(data);
    localStorage.setItem(STORAGE_KEYS.CSR, JSON.stringify(activities));
    return data;
  }

  static async updateActivity(id: string, updates: Partial<CSRActivity>): Promise<CSRActivity> {
    const activities = await this.getActivities();
    const index = activities.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Activity not found');
    activities[index] = { ...activities[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.CSR, JSON.stringify(activities));
    return activities[index];
  }
}

// Newsletter Service
export class NewsletterService {
  static async getNewsletters(): Promise<Newsletter[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.NEWSLETTERS);
    return stored ? JSON.parse(stored) : [];
  }

  static async getNewsletterById(id: string): Promise<Newsletter | null> {
    const newsletters = await this.getNewsletters();
    return newsletters.find(n => n.id === id) || null;
  }

  static async createNewsletter(data: Newsletter): Promise<Newsletter> {
    const newsletters = await this.getNewsletters();
    newsletters.push(data);
    localStorage.setItem(STORAGE_KEYS.NEWSLETTERS, JSON.stringify(newsletters));
    return data;
  }

  static async updateNewsletter(id: string, updates: Partial<Newsletter>): Promise<Newsletter> {
    const newsletters = await this.getNewsletters();
    const index = newsletters.findIndex(n => n.id === id);
    if (index === -1) throw new Error('Newsletter not found');
    newsletters[index] = { ...newsletters[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.NEWSLETTERS, JSON.stringify(newsletters));
    return newsletters[index];
  }
}

// Analytics Service
export class EngagementAnalyticsService {
  static async getMetrics(): Promise<EngagementMetrics> {
    const surveys = await SurveyService.getSurveys();
    const events = await EventService.getEvents();
    const posts = await SocialFeedService.getPosts();
    const ideas = await InnovationService.getIdeas();

    return {
      overallEngagementScore: 78.5,
      activeSurveys: surveys.filter(s => s.status === 'active').length,
      surveyParticipationRate: 65.4,
      averageeSatisfaction: 4.2,
      eNPSScore: 42,
      upcomingEvents: events.filter(e => e.status === 'published' && new Date(e.startDateTime) > new Date()).length,
      eventParticipationRate: 72.3,
      averageEventRating: 4.5,
      socialPosts: posts.length,
      socialEngagementRate: 58.7,
      activeIdeas: ideas.filter(i => ['submitted', 'under_review', 'approved'].includes(i.status)).length,
      implementedIdeas: ideas.filter(i => i.status === 'implemented').length,
      ideaImplementationRate: 35.8,
      csrParticipationRate: 42.1,
      volunteerHoursThisYear: 1250,
      fundsRaisedThisYear: 45000,
      surveyTrends: [],
      departmentEngagement: [],
      engagementByCategory: [],
      lastUpdated: new Date().toISOString()
    };
  }
}

// Settings Service
export class EngagementSettingsService {
  static async getSettings(): Promise<EngagementSettings> {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (stored) return JSON.parse(stored);

    const defaultSettings: EngagementSettings = {
      enablePulseSurveys: true,
      enableEvents: true,
      enableSocialFeed: true,
      enableInnovation: true,
      enableCSR: true,
      enableRecognitionWall: true,
      enableNewsletters: true,
      surveyAnonymityDefault: true,
      surveyReminderEnabled: true,
      surveyReminderDays: 3,
      eventAutoApproval: false,
      eventCapacityManagement: true,
      socialModerationEnabled: false,
      socialModerators: [],
      ideaReviewLevels: 2,
      ideaVotingEnabled: true,
      ideaRewardsEnabled: true,
      csrHoursTracking: true,
      csrTaxDeductibleReceipts: true,
      newsletterFrequency: 'monthly',
      enableNotifications: true,
      notifyOnSurveyLaunch: true,
      notifyOnEventInvite: true,
      notifyOnSocialMention: true,
      notifyOnIdeaReview: true,
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
    return defaultSettings;
  }

  static async updateSettings(updates: Partial<EngagementSettings>): Promise<EngagementSettings> {
    const settings = await this.getSettings();
    const updated = { ...settings, ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }
}
