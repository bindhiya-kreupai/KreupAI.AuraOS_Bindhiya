/**
 * Agentic AI API Routes
 * Phase 4 Sprint 31-32: Agent Endpoints
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import {
  AgentFrameworkService,
  HRAgentService,
  RecruitmentAgentService,
  AnalyticsAgentService,
  AgentType,
} from '@/lib/services/agentic-ai';

/**
 * GET /api/agents
 * Get all available agents
 */
export async function GET(request: NextRequest) {
  try {
    const agents = AgentFrameworkService.getAllAgents();

    return NextResponse.json({
      success: true,
      data: agents.map(agent => ({
        id: agent.id,
        type: agent.type,
        name: agent.name,
        description: agent.description,
        capabilities: agent.capabilities.map(c => ({
          id: c.id,
          name: c.name,
          description: c.description,
        })),
        isActive: agent.isActive,
      })),
    });
  } catch {
        return NextResponse.json(
      { success: false, error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}
