import { prisma } from '@aura/database';
import { emptyNlpInsightsDashboard } from './nlp-insights-fallback';
import { analyzeText } from './nlp-insights-rules';
import { retrieveContinuousFeedback, retrieveFeedbackById } from './nlp-insights-retrieval';
import type { FeedbackInsight, NlpInsightsDashboard, SentimentTopic } from './nlp-insights-types';

function weekLabel(date: Date) {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  return start.toISOString().slice(0, 10);
}

export function analyzeNlpText(text: string) {
  return { text: text.slice(0, 500), ...analyzeText(text), analyzedAt: new Date().toISOString() };
}

export async function getFeedbackAnalysis(tenantId: string, feedbackId: string) {
  const feedback = await retrieveFeedbackById(tenantId, feedbackId);
  if (!feedback) return null;
  return {
    id: feedback.id,
    text: feedback.message.slice(0, 500),
    createdAt: feedback.createdAt.toISOString(),
    type: feedback.type,
    ...analyzeText(feedback.message),
  };
}

export async function getNlpInsightsDashboard(
  tenantId: string,
  opts?: { userId?: string; persist?: boolean }
): Promise<NlpInsightsDashboard> {
  const started = Date.now();
  const feedback = await retrieveContinuousFeedback(tenantId);
  if (!feedback.length) return emptyNlpInsightsDashboard();

  const analyzed: FeedbackInsight[] = feedback.map((item) => ({
    id: item.id,
    text: item.message.slice(0, 240),
    createdAt: item.createdAt.toISOString(),
    ...analyzeText(item.message),
  }));
  const counts = analyzed.reduce(
    (acc, item) => ({
      ...acc,
      [item.sentiment.toLowerCase()]:
        acc[item.sentiment.toLowerCase() as 'positive' | 'negative' | 'neutral'] + 1,
    }),
    { positive: 0, negative: 0, neutral: 0 }
  );
  const averageScore = analyzed.reduce((sum, item) => sum + item.score, 0) / analyzed.length;
  const topicData = new Map<string, { count: number; score: number }>();
  for (const item of analyzed) {
    for (const topic of item.topics) {
      const existing = topicData.get(topic) || { count: 0, score: 0 };
      topicData.set(topic, { count: existing.count + 1, score: existing.score + item.score });
    }
  }
  const topTopics: SentimentTopic[] = [...topicData.entries()]
    .map(([name, value]) => {
      const score = value.score / value.count;
      const sentiment: SentimentTopic['sentiment'] =
        score >= 0.2 ? 'POSITIVE' : score <= -0.2 ? 'NEGATIVE' : 'NEUTRAL';
      return { name, count: value.count, score: Math.round(score * 100) / 100, sentiment };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  const trendMap = new Map<string, { positive: number; negative: number; neutral: number }>();
  for (const item of feedback) {
    const result = analyzeText(item.message);
    const period = weekLabel(item.createdAt);
    const value = trendMap.get(period) || { positive: 0, negative: 0, neutral: 0 };
    value[result.sentiment.toLowerCase() as 'positive' | 'negative' | 'neutral']++;
    trendMap.set(period, value);
  }
  const trends = [...trendMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, values]) => ({ period, ...values }));
  const newest = trends.at(-1);
  const previous = trends.at(-2);
  const net = (item?: { positive: number; negative: number }) =>
    (item?.positive || 0) - (item?.negative || 0);
  const trend =
    net(newest) > net(previous)
      ? 'IMPROVING'
      : net(newest) < net(previous)
        ? 'DECLINING'
        : 'STABLE';
  const overallSentiment =
    averageScore >= 0.2 ? 'POSITIVE' : averageScore <= -0.2 ? 'NEGATIVE' : 'NEUTRAL';
  const dashboard: NlpInsightsDashboard = {
    summary: {
      overallSentiment,
      averageScore: Math.round(averageScore * 100) / 100,
      responseCount: analyzed.length,
      trend,
      ...counts,
      lastRunAt: new Date().toISOString(),
    },
    topTopics,
    recentFeedback: analyzed.slice(0, 10),
    trends,
  };
  if (opts?.persist !== false) {
    try {
      await prisma.aIRunRecord.create({
        data: {
          tenantId,
          runType: 'nlp_insights',
          output: {
            responseCount: analyzed.length,
            averageScore: dashboard.summary.averageScore,
            topTopics,
          },
          completedAt: new Date(),
          durationMs: Date.now() - started,
          createdBy: opts?.userId || 'system',
        },
      });
    } catch (error) {
      console.warn('[nlp-insights] persist skipped', error);
    }
  }
  return dashboard;
}
