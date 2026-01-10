/**
 * Analytics Agent API Routes
 * Phase 4 Sprint 31-32: Analytics Agent Endpoints
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { AnalyticsAgentService } from '@/lib/services/agentic-ai';
import type { InsightRequest } from '@/lib/services/agentic-ai';

/**
 * GET /api/agents/analytics
 * Get Analytics Agent capabilities and status
 */
export async function GET(request: NextRequest) {
  try {
    const definition = AnalyticsAgentService.getDefinition();

    return NextResponse.json({
      success: true,
      data: {
        id: definition.id,
        type: definition.type,
        name: definition.name,
        description: definition.description,
        capabilities: definition.capabilities,
        isActive: definition.isActive,
      },
    });
  } catch (error) {
        return NextResponse.json(
      { success: false, error: 'Failed to fetch Analytics agent' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agents/analytics
 * Execute Analytics Agent action
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, tenantId, params } = body;

    if (!action || !tenantId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: action, tenantId' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'GENERATE_INSIGHT':
        if (!params?.domain) {
          return NextResponse.json(
            { success: false, error: 'Domain required for insight generation' },
            { status: 400 }
          );
        }
        const insightRequest: InsightRequest = {
          domain: params.domain,
          question: params.question || '',
          context: params.context,
          format: params.format,
        };
        result = await AnalyticsAgentService.generateInsight(
          insightRequest,
          tenantId
        );
        break;

      case 'ANALYZE_TREND':
        if (!params?.metricId) {
          return NextResponse.json(
            { success: false, error: 'Metric ID required for trend analysis' },
            { status: 400 }
          );
        }
        const defaultPeriod = {
          start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          end: new Date(),
        };
        result = await AnalyticsAgentService.analyzeTrend(
          params.metricId,
          tenantId,
          params.period ? {
            start: new Date(params.period.start),
            end: new Date(params.period.end),
          } : defaultPeriod,
          params.granularity || 'MONTH'
        );
        break;

      case 'DETECT_ANOMALIES':
        result = await AnalyticsAgentService.detectAnomalies(
          tenantId,
          params?.domain || 'WORKFORCE'
        );
        break;

      case 'GENERATE_REPORT':
        if (!params?.reportType) {
          return NextResponse.json(
            { success: false, error: 'Report type required' },
            { status: 400 }
          );
        }
        result = await AnalyticsAgentService.generateReport(
          params.reportType,
          tenantId,
          {
            period: params.period ? {
              start: new Date(params.period.start),
              end: new Date(params.period.end),
            } : undefined,
            departments: params.departments,
            format: params.format,
          }
        );
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
        return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to execute action'
      },
      { status: 500 }
    );
  }
}
