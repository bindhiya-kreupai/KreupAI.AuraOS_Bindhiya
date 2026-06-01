/**
 * Agentic AI API Routes
 * Phase 4 Sprint 31-32: Agent Endpoints
 */

import type { NextRequest } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { AgentFrameworkService } from '@/lib/services/agentic-ai';

/**
 * GET /api/agents
 * Get all available agents (auth: agents:read)
 *
 * Lists agent capabilities and configuration. Authenticated to prevent
 * unauthenticated discovery of available AI capabilities.
 */
export const GET = createProtectedRoute(
  async (_request: NextRequest, _ctx) => {
    const agents = AgentFrameworkService.getAllAgents();
    return {
      success: true,
      data: agents.map((agent) => ({
        id: agent.id,
        type: agent.type,
        name: agent.name,
        description: agent.description,
        capabilities: agent.capabilities.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description,
        })),
        isActive: agent.isActive,
      })),
    };
  },
  {
    requiredPermissions: ['agents:read'],
    rateLimit: 'API_USER',
  }
);
