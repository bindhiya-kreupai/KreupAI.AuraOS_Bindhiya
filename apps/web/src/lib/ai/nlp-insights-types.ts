export type Sentiment = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';

export type SentimentTopic = {
  name: string;
  count: number;
  sentiment: Sentiment;
  score: number;
};

export type FeedbackInsight = {
  id: string;
  text: string;
  sentiment: Sentiment;
  score: number;
  topics: string[];
  createdAt: string;
};

export type NlpInsightsDashboard = {
  summary: {
    overallSentiment: Sentiment;
    averageScore: number;
    responseCount: number;
    trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
    positive: number;
    negative: number;
    neutral: number;
    lastRunAt: string | null;
  };
  topTopics: SentimentTopic[];
  recentFeedback: FeedbackInsight[];
  trends: Array<{ period: string; positive: number; negative: number; neutral: number }>;
  needsRecompute?: boolean;
};
