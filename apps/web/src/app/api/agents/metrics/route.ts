/**
 * Agent Metrics API Routes
 * Phase 4 Sprint 31-32: Agent Performance Metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { AgentFrameworkService, AgentType } from '@/lib/services/agentic-ai';

/**
 * GET /api/agents/metrics
 * Get agent performance metrics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const agentType = searchParams.get('agentType') as AgentType;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!tenantId || !agentType) {
      return NextResponse.json(
        { success: false, error: 'Missing required query params: tenantId, agentType' },
        { status: 400 }
      );
    }

    const validTypes: AgentType[] = ['HR_AGENT', 'RECRUITMENT_AGENT', 'ANALYTICS_AGENT'];
    if (!validTypes.includes(agentType)) {
      return NextResponse.json(
        { success: false, error: `Invalid agent type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const period = {
      start: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: endDate ? new Date(endDate) : new Date(),
    };

    const metrics = await AgentFrameworkService.getMetrics(agentType, tenantId, period);

    return NextResponse.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Error fetching agent metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
