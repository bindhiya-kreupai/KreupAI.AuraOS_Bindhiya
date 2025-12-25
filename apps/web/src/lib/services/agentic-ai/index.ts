/**
 * Agentic AI Module
 * Phase 4 Sprint 31-32: Autonomous AI Agents
 *
 * Exports:
 * - Types and interfaces
 * - Agent Framework (core infrastructure)
 * - HR Agent (leave, attendance, payroll)
 * - Recruitment Agent (screening, scheduling)
 * - Analytics Agent (insights, reports)
 */

// Types
export * from './types';

// Core Framework
export { AgentFrameworkService } from './agent-framework.service';

// Specialized Agents
export { HRAgentService } from './hr-agent.service';
export { RecruitmentAgentService } from './recruitment-agent.service';
export { AnalyticsAgentService } from './analytics-agent.service';

/**
 * Initialize all agents
 */
export function initializeAgents(): void {
  // Agents auto-initialize on import, but this function
  // can be called explicitly to ensure all agents are ready
  }
