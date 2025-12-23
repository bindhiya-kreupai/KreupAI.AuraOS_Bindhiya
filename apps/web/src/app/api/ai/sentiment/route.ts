/**
 * Sentiment Analysis API Routes
 * Phase 3: Intelligence Layer - Employee Insights
 */

import { NextRequest, NextResponse } from 'next/server';
import { SentimentAnalysisService } from '@/lib/services/ai';

/**
 * POST /api/ai/sentiment
 * Analyze sentiment from text
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required', errorAr: 'معرف المستأجر مطلوب' },
        { status: 400 }
      );
    }

    const action = body.action || 'analyze';

    switch (action) {
      case 'analyze':
        // Analyze single text
        if (!body.text) {
          return NextResponse.json(
            { error: 'text is required', errorAr: 'النص مطلوب' },
            { status: 400 }
          );
        }

        const result = await SentimentAnalysisService.analyzeSentiment(
          body.text,
          body.context
        );

        return NextResponse.json({
          success: true,
          data: result,
        });

      case 'batch':
        // Analyze multiple texts
        if (!body.texts || !Array.isArray(body.texts)) {
          return NextResponse.json(
            { error: 'texts array is required', errorAr: 'مصفوفة النصوص مطلوبة' },
            { status: 400 }
          );
        }

        const results = await Promise.all(
          body.texts.map((text: string) =>
            SentimentAnalysisService.analyzeSentiment(text, body.context)
          )
        );

        const avgScore = results.reduce((sum: number, r: any) => sum + r.score, 0) / results.length;

        return NextResponse.json({
          success: true,
          data: {
            results,
            summary: {
              total: results.length,
              averageScore: Math.round(avgScore * 100) / 100,
              positive: results.filter((r: any) => r.score > 0.2).length,
              negative: results.filter((r: any) => r.score < -0.2).length,
              neutral: results.filter((r: any) => r.score >= -0.2 && r.score <= 0.2).length,
            },
          },
        });

      case 'survey':
        // Analyze survey responses
        if (!body.responses || !Array.isArray(body.responses)) {
          return NextResponse.json(
            { error: 'responses array is required', errorAr: 'مصفوفة الردود مطلوبة' },
            { status: 400 }
          );
        }

        const surveyAnalysis = await SentimentAnalysisService.analyzeSurvey(
          body.responses,
          body.metadata
        );

        return NextResponse.json({
          success: true,
          data: surveyAnalysis,
        });

      case 'engagement-trend':
        // Analyze engagement trends
        if (!body.surveys || !Array.isArray(body.surveys)) {
          return NextResponse.json(
            { error: 'surveys array is required', errorAr: 'مصفوفة الاستبيانات مطلوبة' },
            { status: 400 }
          );
        }

        const engagementInsight = await SentimentAnalysisService.analyzeEngagementTrend(
          body.surveys
        );

        return NextResponse.json({
          success: true,
          data: engagementInsight,
        });

      case 'extract-topics':
        // Extract topics from texts
        if (!body.texts || !Array.isArray(body.texts)) {
          return NextResponse.json(
            { error: 'texts array is required', errorAr: 'مصفوفة النصوص مطلوبة' },
            { status: 400 }
          );
        }

        const topics = await SentimentAnalysisService.extractTopics(body.texts);

        return NextResponse.json({
          success: true,
          data: topics,
        });

      case 'action-items':
        // Extract action items from feedback
        if (!body.feedbackTexts || !Array.isArray(body.feedbackTexts)) {
          return NextResponse.json(
            { error: 'feedbackTexts array is required', errorAr: 'مصفوفة نصوص التغذية الراجعة مطلوبة' },
            { status: 400 }
          );
        }

        const actionItems = await SentimentAnalysisService.extractActionItems(
          body.feedbackTexts
        );

        return NextResponse.json({
          success: true,
          data: {
            actionItems,
            summary: {
              total: actionItems.length,
              highUrgency: actionItems.filter((a: any) => a.urgency === 'HIGH').length,
              mediumUrgency: actionItems.filter((a: any) => a.urgency === 'MEDIUM').length,
              lowUrgency: actionItems.filter((a: any) => a.urgency === 'LOW').length,
            },
          },
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action', errorAr: 'إجراء غير صالح' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to analyze sentiment',
        errorAr: 'فشل في تحليل المشاعر',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/sentiment
 * Get sentiment analytics summary
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const period = searchParams.get('period') || 'month';
    const departmentId = searchParams.get('departmentId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required', errorAr: 'معرف المستأجر مطلوب' },
        { status: 400 }
      );
    }

    // In production, fetch from database
    return NextResponse.json({
      success: true,
      data: {
        tenantId,
        period,
        summary: {
          overallSentiment: 'NEUTRAL',
          averageScore: 0,
          responseCount: 0,
          trend: 'STABLE',
        },
        topTopics: [],
        recentFeedback: [],
        filters: {
          departmentId,
        },
      },
    });
  } catch (error) {
    console.error('Sentiment fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sentiment data', errorAr: 'فشل في جلب بيانات المشاعر' },
      { status: 500 }
    );
  }
}
