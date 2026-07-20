import type { Sentiment } from './nlp-insights-types';

export const NLP_INSIGHTS_MODEL_VERSION = '1.0.0';
export const NLP_POSITIVE_LEXICON: Record<string, number> = {
  excellent: 1,
  great: 0.8,
  happy: 0.7,
  supportive: 0.7,
  helpful: 0.6,
  appreciate: 0.6,
  flexible: 0.5,
  growth: 0.5,
  improved: 0.4,
  good: 0.4,
};
export const NLP_NEGATIVE_LEXICON: Record<string, number> = {
  terrible: -1,
  frustrated: -0.8,
  burnout: -0.8,
  toxic: -0.8,
  unhappy: -0.7,
  stressful: -0.6,
  unfair: -0.6,
  workload: -0.5,
  problem: -0.5,
  poor: -0.5,
};
export const NLP_TOPICS: Record<string, string[]> = {
  COMPENSATION: ['salary', 'pay', 'bonus', 'benefits', 'raise'],
  WORK_LIFE_BALANCE: ['balance', 'workload', 'overtime', 'remote', 'burnout', 'leave'],
  MANAGEMENT: ['manager', 'leadership', 'supervisor', 'feedback'],
  CAREER_GROWTH: ['growth', 'promotion', 'career', 'training', 'development'],
  CULTURE: ['culture', 'team', 'collaboration', 'inclusion'],
  TOOLS_RESOURCES: ['tools', 'software', 'equipment', 'resources'],
  COMMUNICATION: ['communication', 'transparency', 'meetings', 'updates'],
};

export function analyzeText(text: string): {
  score: number;
  sentiment: Sentiment;
  topics: string[];
} {
  const words = text.toLowerCase().match(/[\p{L}\p{N}']+/gu) || [];
  let score = 0;
  let matches = 0;
  let negate = false;
  for (const word of words) {
    if (['not', 'never', 'no'].includes(word)) {
      negate = true;
      continue;
    }
    const value = NLP_POSITIVE_LEXICON[word] ?? NLP_NEGATIVE_LEXICON[word];
    if (value !== undefined) {
      score += negate ? -value * 0.5 : value;
      matches++;
      negate = false;
    }
  }
  const normalized = matches ? Math.max(-1, Math.min(1, score / matches)) : 0;
  return {
    score: Math.round(normalized * 100) / 100,
    sentiment: normalized >= 0.2 ? 'POSITIVE' : normalized <= -0.2 ? 'NEGATIVE' : 'NEUTRAL',
    topics: Object.entries(NLP_TOPICS)
      .filter(([, keywords]) => keywords.some((keyword) => text.toLowerCase().includes(keyword)))
      .map(([topic]) => topic),
  };
}
