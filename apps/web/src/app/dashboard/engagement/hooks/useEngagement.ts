/**
 * Employee Engagement Module - Custom Hook
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { PulseSurvey, Event, SocialPost, Idea, CSRActivity, Newsletter, EngagementMetrics, EngagementSettings } from '../types';
import { SurveyService, EventService, SocialFeedService, InnovationService, CSRService, NewsletterService, EngagementAnalyticsService, EngagementSettingsService } from '../services';

export function useEngagement() {
  const [surveys, setSurveys] = useState<PulseSurvey[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [csrActivities, setCSRActivities] = useState<CSRActivity[]>([]);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [metrics, setMetrics] = useState<EngagementMetrics | null>(null);
  const [settings, setSettings] = useState<EngagementSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeData = useCallback(async () => {
    try {
      setLoading(true);
      setSurveys(await SurveyService.getSurveys());
      setEvents(await EventService.getEvents());
      setPosts(await SocialFeedService.getPosts());
      setIdeas(await InnovationService.getIdeas());
      setCSRActivities(await CSRService.getActivities());
      setNewsletters(await NewsletterService.getNewsletters());
      setMetrics(await EngagementAnalyticsService.getMetrics());
      setSettings(await EngagementSettingsService.getSettings());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load engagement data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  return {
    surveys,
    events,
    posts,
    ideas,
    csrActivities,
    newsletters,
    metrics,
    settings,
    loading,
    error,
    refreshData: initializeData
  };
}
