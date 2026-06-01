// @ts-nocheck — April 2026 sprint addition with heavy Prisma drift. Tracked under #29 for proper rewrite against current schema.
/**
 * Sentiment Analysis Service
 * Phase 3: Intelligence Layer - Employee Insights
 *
 * AI-powered sentiment analysis for employee feedback,
 * survey responses, and communication patterns
 */

import type {
  SentimentResult,
  SurveyAnalysis,
  EngagementInsight,
  TopicExtraction,
} from './types';

/**
 * Sentiment keywords with scores
 */
const SENTIMENT_LEXICON: Record<string, number> = {
  // Positive words
  excellent: 1.0,
  outstanding: 1.0,
  amazing: 0.9,
  fantastic: 0.9,
  great: 0.8,
  wonderful: 0.8,
  love: 0.8,
  happy: 0.7,
  satisfied: 0.7,
  pleased: 0.7,
  good: 0.6,
  helpful: 0.6,
  supportive: 0.6,
  appreciate: 0.6,
  enjoy: 0.5,
  positive: 0.5,
  better: 0.4,
  improved: 0.4,
  nice: 0.3,
  okay: 0.1,

  // Negative words
  terrible: -1.0,
  horrible: -1.0,
  awful: -0.9,
  worst: -0.9,
  hate: -0.8,
  disappointed: -0.7,
  frustrated: -0.7,
  unhappy: -0.7,
  dissatisfied: -0.6,
  bad: -0.6,
  poor: -0.6,
  problem: -0.5,
  issue: -0.5,
  concern: -0.4,
  difficult: -0.4,
  stressful: -0.4,
  unfair: -0.5,
  toxic: -0.8,
  burnout: -0.7,
  overworked: -0.6,

  // Neutral/Modifier words
  very: 0.3, // Intensifier
  really: 0.3,
  extremely: 0.4,
  somewhat: -0.2, // Diminisher
  slightly: -0.2,
  not: -0.5, // Negator (special handling)
};

/**
 * Topic categories for HR feedback
 */
const TOPIC_KEYWORDS: Record<string, string[]> = {
  COMPENSATION: ['salary', 'pay', 'compensation', 'bonus', 'raise', 'benefits', 'package', 'increase', 'underpaid'],
  WORK_LIFE_BALANCE: ['balance', 'hours', 'overtime', 'flexible', 'remote', 'workload', 'stress', 'burnout', 'vacation', 'leave'],
  MANAGEMENT: ['manager', 'boss', 'leadership', 'supervisor', 'direction', 'guidance', 'support', 'feedback', 'communication'],
  CAREER_GROWTH: ['growth', 'promotion', 'career', 'development', 'opportunity', 'learning', 'training', 'advancement', 'skills'],
  CULTURE: ['culture', 'team', 'environment', 'colleagues', 'collaboration', 'inclusion', 'diversity', 'values', 'mission'],
  RECOGNITION: ['recognition', 'appreciation', 'valued', 'acknowledged', 'reward', 'praise', 'contribution'],
  TOOLS_RESOURCES: ['tools', 'resources', 'equipment', 'software', 'technology', 'infrastructure', 'budget'],
  COMMUNICATION: ['communication', 'transparency', 'information', 'updates', 'meetings', 'clarity'],
};

/**
 * Sentiment Analysis Service
 */
export class SentimentAnalysisService {
  /**
   * Analyze sentiment of text
   */
  static async analyzeSentiment(
    text: string,
    context?: 'SURVEY' | 'FEEDBACK' | 'REVIEW' | 'GENERAL'
  ): Promise<SentimentResult> {
    const normalizedText = text.toLowerCase();
    const words = this.tokenize(normalizedText);

    // Calculate raw sentiment score
    let sentimentScore = 0;
    let wordCount = 0;
    let intensifier = 1;
    let negator = false;

    const sentimentWords: SentimentResult['sentimentWords'] = {
      positive: [],
      negative: [],
      neutral: [],
    };

    for (let i = 0; i < words.length; i++) {
      const word = words[i];

      // Check for negators
      if (word === 'not' || word === "n't" || word === 'never' || word === 'no') {
        negator = true;
        continue;
      }

      // Check for intensifiers
      if (['very', 'really', 'extremely', 'so', 'too'].includes(word)) {
        intensifier = 1.5;
        continue;
      }

      // Check for diminishers
      if (['somewhat', 'slightly', 'bit', 'little'].includes(word)) {
        intensifier = 0.5;
        continue;
      }

      // Check sentiment lexicon
      if (SENTIMENT_LEXICON[word] !== undefined) {
        let score = SENTIMENT_LEXICON[word] * intensifier;

        // Apply negation
        if (negator) {
          score = -score * 0.5; // Negation flips but reduces intensity
          negator = false;
        }

        sentimentScore += score;
        wordCount++;

        // Categorize word
        if (score > 0) {
          sentimentWords.positive.push({ word, score });
        } else if (score < 0) {
          sentimentWords.negative.push({ word, score: Math.abs(score) });
        }

        // Reset intensifier
        intensifier = 1;
      }
    }

    // Normalize score to -1 to 1
    const normalizedScore = wordCount > 0 ? sentimentScore / wordCount : 0;

    // Determine sentiment category
    let sentiment: SentimentResult['sentiment'];
    if (normalizedScore >= 0.3) {
      sentiment = 'POSITIVE';
    } else if (normalizedScore <= -0.3) {
      sentiment = 'NEGATIVE';
    } else if (normalizedScore >= 0.1) {
      sentiment = 'SLIGHTLY_POSITIVE';
    } else if (normalizedScore <= -0.1) {
      sentiment = 'SLIGHTLY_NEGATIVE';
    } else {
      sentiment = 'NEUTRAL';
    }

    // Calculate confidence
    const confidence = Math.min(95, 50 + (wordCount * 5));

    // Extract topics
    const topics = this.extractTopics(normalizedText);

    // Identify key phrases
    const keyPhrases = this.extractKeyPhrases(text);

    return {
      text: text.substring(0, 200),
      sentiment,
      score: Math.round(normalizedScore * 100) / 100,
      normalizedScore: Math.round((normalizedScore + 1) * 50), // 0-100 scale
      confidence,
      sentimentWords,
      topics,
      keyPhrases,
      context: context || 'GENERAL',
      analyzedAt: new Date(),
    };
  }

  /**
   * Tokenize text into words
   */
  private static tokenize(text: string): string[] {
    return text
      .replace(/[^\w\s']/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 1);
  }

  /**
   * Extract topics from text
   */
  public static extractTopics(text: string): string[] {
    const topics: Set<string> = new Set();

    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          topics.add(topic);
          break;
        }
      }
    }

    return Array.from(topics);
  }

  /**
   * Extract key phrases using simple n-gram approach
   */
  private static extractKeyPhrases(text: string): string[] {
    const phrases: string[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());

    for (const sentence of sentences) {
      const words = sentence.trim().split(/\s+/);

      // Extract bigrams and trigrams with sentiment words
      for (let i = 0; i < words.length - 1; i++) {
        const bigram = `${words[i]} ${words[i + 1]}`.toLowerCase();
        const hasSignificantWord = words.slice(i, i + 2).some(w =>
          SENTIMENT_LEXICON[w.toLowerCase()] !== undefined
        );

        if (hasSignificantWord && bigram.length > 5) {
          phrases.push(words.slice(i, i + 2).join(' '));
        }
      }
    }

    return [...new Set(phrases)].slice(0, 5);
  }

  /**
   * Analyze survey responses
   */
  static async analyzeSurvey(
    responses: Array<{
      questionId: string;
      question: string;
      answer: string | number;
      category?: string;
    }>,
    metadata?: {
      surveyType: string;
      departmentId?: string;
      anonymous: boolean;
    }
  ): Promise<SurveyAnalysis> {
    const textResponses = responses.filter(r => typeof r.answer === 'string');
    const numericResponses = responses.filter(r => typeof r.answer === 'number');

    // Analyze text responses
    const sentimentResults = await Promise.all(
      textResponses.map(r => this.analyzeSentiment(r.answer as string, 'SURVEY'))
    );

    // Calculate overall sentiment
    const avgSentimentScore = sentimentResults.length > 0
      ? sentimentResults.reduce((sum, r) => sum + r.score, 0) / sentimentResults.length
      : 0;

    // Calculate numeric averages by category
    const categoryScores: Record<string, { sum: number; count: number }> = {};
    for (const response of numericResponses) {
      const category = response.category || 'General';
      if (!categoryScores[category]) {
        categoryScores[category] = { sum: 0, count: 0 };
      }
      categoryScores[category].sum += response.answer as number;
      categoryScores[category].count++;
    }

    const categoryAverages: Record<string, number> = {};
    for (const [category, data] of Object.entries(categoryScores)) {
      categoryAverages[category] = Math.round((data.sum / data.count) * 10) / 10;
    }

    // Aggregate topics
    const topicCounts: Record<string, number> = {};
    for (const result of sentimentResults) {
      for (const topic of result.topics) {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      }
    }

    // Identify themes
    const themes = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([topic, count]) => ({
        topic,
        count,
        sentiment: this.getTopicSentiment(sentimentResults, topic),
      }));

    // Extract highlights and concerns
    const highlights = sentimentResults
      .filter(r => r.score > 0.3)
      .flatMap(r => r.keyPhrases)
      .slice(0, 5);

    const concerns = sentimentResults
      .filter(r => r.score < -0.3)
      .flatMap(r => r.keyPhrases)
      .slice(0, 5);

    // Calculate overall score (0-100)
    const numericAvg = Object.values(categoryAverages).reduce((a, b) => a + b, 0) /
      (Object.keys(categoryAverages).length || 1);
    const sentimentContribution = (avgSentimentScore + 1) * 25; // 0-50
    const numericContribution = (numericAvg / 5) * 50; // 0-50 (assuming 5-point scale)
    const overallScore = Math.round(sentimentContribution + numericContribution);

    return {
      surveyId: `survey_${Date.now()}`,
      surveyType: metadata?.surveyType || 'General',
      responseCount: responses.length,
      textResponseCount: textResponses.length,
      numericResponseCount: numericResponses.length,
      overallScore,
      overallSentiment: avgSentimentScore >= 0.2 ? 'POSITIVE' :
        avgSentimentScore <= -0.2 ? 'NEGATIVE' : 'NEUTRAL',
      categoryScores: categoryAverages,
      themes,
      highlights,
      concerns,
      recommendations: this.generateSurveyRecommendations(themes, categoryAverages),
      analyzedAt: new Date(),
    };
  }

  /**
   * Get sentiment for a specific topic
   */
  private static getTopicSentiment(
    results: SentimentResult[],
    topic: string
  ): 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' {
    const topicResults = results.filter(r => r.topics.includes(topic));
    if (topicResults.length === 0) return 'NEUTRAL';

    const avgScore = topicResults.reduce((sum, r) => sum + r.score, 0) / topicResults.length;

    if (avgScore > 0.2) return 'POSITIVE';
    if (avgScore < -0.2) return 'NEGATIVE';
    return 'NEUTRAL';
  }

  /**
   * Generate survey recommendations
   */
  private static generateSurveyRecommendations(
    themes: Array<{ topic: string; sentiment: string }>,
    categoryScores: Record<string, number>
  ): string[] {
    const recommendations: string[] = [];

    // Negative themes
    const negativeThemes = themes.filter(t => t.sentiment === 'NEGATIVE');
    for (const theme of negativeThemes.slice(0, 2)) {
      const topicLabel = theme.topic.replace('_', ' ').toLowerCase();
      recommendations.push(`Address concerns about ${topicLabel}`);
    }

    // Low scoring categories
    const lowCategories = Object.entries(categoryScores)
      .filter(([_, score]) => score < 3)
      .sort((a, b) => a[1] - b[1]);

    for (const [category, score] of lowCategories.slice(0, 2)) {
      recommendations.push(`Improve ${category} (current score: ${score}/5)`);
    }

    if (recommendations.length === 0) {
      recommendations.push('Maintain current positive trends');
      recommendations.push('Continue regular pulse surveys to monitor sentiment');
    }

    recommendations.push('Share key findings with leadership team');
    recommendations.push('Create action plans for identified areas of improvement');

    return recommendations.slice(0, 5);
  }

  /**
   * Analyze engagement trends over time
   */
  static async analyzeEngagementTrend(
    surveys: Array<{
      date: Date;
      overallScore: number;
      responseRate: number;
      categoryScores: Record<string, number>;
    }>
  ): Promise<EngagementInsight> {
    // Sort by date
    const sorted = [...surveys].sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate trend
    const scores = sorted.map(s => s.overallScore);
    const trend = this.calculateTrend(scores);

    // Calculate change
    const latestScore = scores[scores.length - 1] || 0;
    const previousScore = scores[scores.length - 2] || latestScore;
    const change = latestScore - previousScore;

    // Category trends
    const categoryTrends: Record<string, 'IMPROVING' | 'STABLE' | 'DECLINING'> = {};
    const allCategories = new Set(
      sorted.flatMap(s => Object.keys(s.categoryScores))
    );

    for (const category of allCategories) {
      const categoryScores = sorted
        .map(s => s.categoryScores[category])
        .filter(s => s !== undefined);

      categoryTrends[category] = this.calculateTrend(categoryScores);
    }

    // Response rate trend
    const responseRates = sorted.map(s => s.responseRate);
    const avgResponseRate = responseRates.reduce((a, b) => a + b, 0) / responseRates.length;

    // Predictions
    const nextScorePrediction = this.predictNextValue(scores);

    // Risk assessment
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    if (trend === 'DECLINING' && latestScore < 60) {
      riskLevel = 'HIGH';
    } else if (trend === 'DECLINING' || latestScore < 50) {
      riskLevel = 'MEDIUM';
    } else {
      riskLevel = 'LOW';
    }

    return {
      currentScore: latestScore,
      previousScore,
      change,
      changePercentage: previousScore > 0 ? Math.round((change / previousScore) * 100) : 0,
      trend,
      categoryTrends,
      surveyCount: surveys.length,
      averageResponseRate: Math.round(avgResponseRate),
      predictedNextScore: nextScorePrediction,
      riskLevel,
      insights: this.generateEngagementInsights(trend, change, categoryTrends, latestScore),
      recommendations: this.generateEngagementRecommendations(trend, categoryTrends, latestScore),
      analyzedAt: new Date(),
    };
  }

  /**
   * Calculate trend direction
   */
  private static calculateTrend(
    values: number[]
  ): 'IMPROVING' | 'STABLE' | 'DECLINING' {
    if (values.length < 2) return 'STABLE';

    // Simple linear regression slope
    const n = values.length;
    const xSum = (n * (n - 1)) / 2;
    const ySum = values.reduce((a, b) => a + b, 0);
    const xySum = values.reduce((sum, y, x) => sum + x * y, 0);
    const xxSum = values.reduce((sum, _, x) => sum + x * x, 0);

    const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);

    if (slope > 0.5) return 'IMPROVING';
    if (slope < -0.5) return 'DECLINING';
    return 'STABLE';
  }

  /**
   * Predict next value using simple moving average
   */
  private static predictNextValue(values: number[]): number {
    if (values.length < 2) return values[0] || 50;

    // Weighted moving average (recent values weighted more)
    const weights = values.map((_, i) => i + 1);
    const weightSum = weights.reduce((a, b) => a + b, 0);
    const weightedSum = values.reduce((sum, val, i) => sum + val * weights[i], 0);

    return Math.round(weightedSum / weightSum);
  }

  /**
   * Generate engagement insights
   */
  private static generateEngagementInsights(
    trend: 'IMPROVING' | 'STABLE' | 'DECLINING',
    change: number,
    categoryTrends: Record<string, string>,
    currentScore: number
  ): string[] {
    const insights: string[] = [];

    // Overall trend insight
    if (trend === 'IMPROVING') {
      insights.push(`Engagement is trending upward (+${change > 0 ? change : ''})`);
    } else if (trend === 'DECLINING') {
      insights.push(`Engagement has declined by ${Math.abs(change)} points`);
    } else {
      insights.push('Engagement levels remain stable');
    }

    // Score interpretation
    if (currentScore >= 75) {
      insights.push('Current engagement level is strong');
    } else if (currentScore >= 50) {
      insights.push('Engagement is moderate with room for improvement');
    } else {
      insights.push('Engagement is below healthy levels - action needed');
    }

    // Category-specific insights
    const improving = Object.entries(categoryTrends).filter(([_, t]) => t === 'IMPROVING');
    const declining = Object.entries(categoryTrends).filter(([_, t]) => t === 'DECLINING');

    if (improving.length > 0) {
      insights.push(`Improving areas: ${improving.slice(0, 2).map(([c]) => c).join(', ')}`);
    }
    if (declining.length > 0) {
      insights.push(`Declining areas: ${declining.slice(0, 2).map(([c]) => c).join(', ')}`);
    }

    return insights;
  }

  /**
   * Generate engagement recommendations
   */
  private static generateEngagementRecommendations(
    trend: 'IMPROVING' | 'STABLE' | 'DECLINING',
    categoryTrends: Record<string, string>,
    currentScore: number
  ): string[] {
    const recommendations: string[] = [];

    if (trend === 'DECLINING') {
      recommendations.push('Conduct focus groups to understand root causes');
      recommendations.push('Increase leadership visibility and communication');
    }

    if (currentScore < 50) {
      recommendations.push('Implement urgent engagement improvement initiatives');
      recommendations.push('Review compensation and benefits competitiveness');
    }

    const declining = Object.entries(categoryTrends).filter(([_, t]) => t === 'DECLINING');
    for (const [category] of declining.slice(0, 2)) {
      recommendations.push(`Create action plan for ${category}`);
    }

    recommendations.push('Increase frequency of pulse surveys for faster feedback');
    recommendations.push('Train managers on employee engagement best practices');

    return recommendations.slice(0, 5);
  }

  /**
   * Extract and analyze topics from multiple texts
   */
  static async extractTopics(
    texts: string[]
  ): Promise<TopicExtraction> {
    const allTopics: Record<string, { count: number; sentimentSum: number }> = {};

    for (const text of texts) {
      const result = await this.analyzeSentiment(text, 'FEEDBACK');

      for (const topic of result.topics) {
        if (!allTopics[topic]) {
          allTopics[topic] = { count: 0, sentimentSum: 0 };
        }
        allTopics[topic].count++;
        allTopics[topic].sentimentSum += result.score;
      }
    }

    // Convert to sorted array
    const topics = Object.entries(allTopics)
      .map(([topic, data]) => ({
        topic,
        count: data.count,
        percentage: Math.round((data.count / texts.length) * 100),
        averageSentiment: data.count > 0 ? data.sentimentSum / data.count : 0,
        sentiment: data.sentimentSum / data.count > 0.2 ? 'POSITIVE' as const :
          data.sentimentSum / data.count < -0.2 ? 'NEGATIVE' as const : 'NEUTRAL' as const,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalTexts: texts.length,
      uniqueTopics: topics.length,
      topics,
      topPositive: topics.filter(t => t.sentiment === 'POSITIVE').slice(0, 3),
      topNegative: topics.filter(t => t.sentiment === 'NEGATIVE').slice(0, 3),
      analyzedAt: new Date(),
    };
  }

  /**
   * Analyze feedback for action items
   */
  static async extractActionItems(
    feedbackTexts: string[]
  ): Promise<Array<{
    category: string;
    issue: string;
    frequency: number;
    urgency: 'HIGH' | 'MEDIUM' | 'LOW';
    suggestedAction: string;
  }>> {
    const issuePatterns: Record<string, { pattern: RegExp; action: string }> = {
      COMPENSATION: {
        pattern: /(?:pay|salary|compensation|bonus|raise|underpaid)/i,
        action: 'Review compensation against market rates',
      },
      WORKLOAD: {
        pattern: /(?:overwork|burnout|stress|too much|overwhelming|workload)/i,
        action: 'Assess workload distribution and hiring needs',
      },
      MANAGEMENT: {
        pattern: /(?:manager|boss|supervisor|leadership|direction|micromanag)/i,
        action: 'Provide management training and feedback mechanisms',
      },
      CAREER: {
        pattern: /(?:promotion|growth|career|opportunity|stuck|no advancement)/i,
        action: 'Develop clear career paths and development programs',
      },
      COMMUNICATION: {
        pattern: /(?:communication|transparency|inform|unclear|confusion)/i,
        action: 'Improve internal communication channels and frequency',
      },
      CULTURE: {
        pattern: /(?:culture|toxic|environment|team|colleagues|respect)/i,
        action: 'Conduct culture assessment and implement improvement initiatives',
      },
      FLEXIBILITY: {
        pattern: /(?:remote|flexible|hybrid|work from home|commute|office)/i,
        action: 'Review and update flexible work policies',
      },
      RECOGNITION: {
        pattern: /(?:recognition|appreciated|valued|ignored|contribution|credit)/i,
        action: 'Implement recognition program and manager training',
      },
    };

    const issueCounts: Record<string, { count: number; texts: string[] }> = {};

    for (const text of feedbackTexts) {
      for (const [category, { pattern }] of Object.entries(issuePatterns)) {
        if (pattern.test(text)) {
          if (!issueCounts[category]) {
            issueCounts[category] = { count: 0, texts: [] };
          }
          issueCounts[category].count++;
          issueCounts[category].texts.push(text.substring(0, 100));
        }
      }
    }

    // Convert to action items
    return Object.entries(issueCounts)
      .map(([category, data]) => ({
        category,
        issue: category.replace('_', ' ').toLowerCase(),
        frequency: data.count,
        urgency: data.count > feedbackTexts.length * 0.3 ? 'HIGH' as const :
          data.count > feedbackTexts.length * 0.1 ? 'MEDIUM' as const : 'LOW' as const,
        suggestedAction: issuePatterns[category].action,
      }))
      .sort((a, b) => b.frequency - a.frequency);
  }
}
