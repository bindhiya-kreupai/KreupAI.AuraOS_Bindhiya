/**
 * Legacy attrition route — proxies to the unified attrition engine.
 * Prefer `/api/ai/attrition` for new clients.
 */

import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { forbidden, parsePagination, serverError, successList } from '@/lib/api/crud-helpers';
import { canReadAiAutomation } from '@/lib/ai/ai-automation-auth';
import { getAtRiskEmployees } from '@/lib/ai/attrition-ai';
import { AT_RISK_THRESHOLD } from '@/lib/ai/attrition-rules';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions, roles } = context;
    if (!canReadAiAutomation(permissions || [], roles || [])) {
      return forbidden('ai-automation:read');
    }

    const { page, limit, skip } = parsePagination(new URL(request.url).searchParams);

    const atRisk = await getAtRiskEmployees(user.tenantId, {
      minScore: 0,
      limit: 5000,
      offset: 0,
      autoRecompute: true,
    });

    const all = atRisk.employees;
    const scored = all.map((e) => ({
      employeeId: e.employeeId,
      employeeName: e.employeeName,
      department: e.department,
      riskScore: e.riskScore,
      riskLevel: e.riskLevel,
      primaryFactor: e.primaryFactor,
      tenureYears: undefined,
      recentRecognitions: undefined,
      recentLeaveRequests: undefined,
    }));

    // Prefer high-risk first in legacy listing
    scored.sort((a, b) => b.riskScore - a.riskScore);

    await prisma.aIRunRecord.create({
      data: {
        tenantId: user.tenantId,
        runType: 'attrition_prediction',
        output: {
          scoredCount: scored.length,
          atRiskCount: scored.filter((s) => s.riskScore >= AT_RISK_THRESHOLD).length,
          source: 'legacy-ai-automation-attrition',
        } as any,
        completedAt: new Date(),
        durationMs: 0,
        createdBy: user.userId || user.id,
      },
    });

    return successList(scored.slice(skip, skip + limit), page, limit, scored.length);
  } catch (error: any) {
    return serverError(error, 'compute attrition risk');
  }
});
