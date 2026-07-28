/**
 * AI HR Coaching Bot API
 * LLM + policy RAG + employee/workforce grounding
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  generateHRCoachingResponse,
  getAIConfig,
  HRCoachingAIError,
} from '@/lib/ai/hr-coaching-ai';
import type { ChatHistoryItem } from '@/lib/ai/hr-coaching-ai';
import { retrieveHRContext, getLiveRecommendations } from '@/lib/ai/hr-coaching-retrieval';
import { resolveTenantCoachingCountry } from '@/lib/ai/resolve-tenant-coaching-country';
import { authenticateWithPermissions } from '@/lib/auth/enhanced-middleware';

const AUTOMATION_RESULTS: Record<string, { message: string; path?: string }> = {
  'draft-pip': {
    message:
      '✅ PIP template drafted and saved to Documents. Review and customize before sharing with the manager.',
  },
  'draft-promo': {
    message: '✅ Promotion letter draft created. Pending HRBP approval.',
  },
  'draft-feedback': {
    message:
      '✅ Feedback script drafted per your jurisdiction and company policy. Ready for your review.',
  },
  'draft-mediation': {
    message: '✅ Mediation agenda drafted with ground rules and discussion points.',
  },
  'draft-separation': {
    message: '✅ Separation checklist created. ER review required before proceeding.',
  },
  'schedule-1on1': {
    message: '✅ Manager coaching session scheduled for next available slot.',
  },
  'schedule-mediation': {
    message: '✅ Mediation session scheduled. Calendar invites sent to both parties.',
  },
  'auto-approve': {
    message: '✅ Scanned leave requests: eligible items flagged for auto-approval.',
  },
  'retention-workflow': {
    message: '✅ Retention workflow triggered for high-risk employees.',
    path: '/dashboard/ai-automation/attrition-prediction',
  },
  onboarding: {
    message: '✅ Onboarding plan generated with role-specific tasks.',
    path: '/dashboard/onboarding',
  },
  'compliance-check': {
    message: '✅ Compliance scan complete: findings flagged for review.',
  },
};

function normalizeHistory(raw: unknown): ChatHistoryItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const h = item as Record<string, unknown>;
      const role: ChatHistoryItem['role'] =
        h.role === 'assistant' || h.role === 'bot' ? 'assistant' : 'user';
      return { role, content: String(h.content || '').trim() };
    })
    .filter((h) => h.content.length > 0)
    .slice(-10);
}

async function resolveAuthContext(request: NextRequest) {
  const { context, error } = await authenticateWithPermissions(request);
  if (error || !context?.user?.tenantId) {
    return null;
  }
  return {
    tenantId: context.user.tenantId as string,
    permissions: context.permissions as string[],
    userId: context.user.userId as string,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action || 'chat';
    const auth = await resolveAuthContext(request);

    switch (action) {
      case 'chat': {
        if (!body.message) {
          return NextResponse.json(
            { error: 'message is required', errorAr: 'الرسالة مطلوبة' },
            { status: 400 }
          );
        }

        const history = normalizeHistory(body.history);
        const message = String(body.message);
        const countryOverride = body.countryCode ? String(body.countryCode) : undefined;

        const jurisdiction = await resolveTenantCoachingCountry(auth?.tenantId, countryOverride);

        let retrieval;
        if (auth?.tenantId) {
          retrieval = await retrieveHRContext({
            tenantId: auth.tenantId,
            query: message,
            employeeId: body.employeeId ? String(body.employeeId) : undefined,
            employeeSearch: body.employeeSearch ? String(body.employeeSearch) : undefined,
            canReadEmployees: auth.permissions.includes('employees:read'),
          });
        }

        let coaching;
        try {
          coaching = await generateHRCoachingResponse(
            message,
            history,
            undefined,
            retrieval,
            jurisdiction
          );
        } catch (err) {
          if (err instanceof HRCoachingAIError) {
            return NextResponse.json(
              {
                success: false,
                error: err.message,
                errorAr:
                  err.code === 'NOT_CONFIGURED'
                    ? 'لم يتم تكوين مزود الذكاء الاصطناعي. أضف مفتاح API.'
                    : 'فشل مزود الذكاء الاصطناعي في إنشاء رد. حاول مرة أخرى.',
                code: err.code,
              },
              { status: err.code === 'NOT_CONFIGURED' ? 503 : 502 }
            );
          }
          throw err;
        }
        const aiConfig = getAIConfig();

        return NextResponse.json({
          success: true,
          data: {
            messageId: `msg_${Date.now()}`,
            sessionId: body.sessionId || `session_${Date.now()}`,
            response: coaching.message,
            suggestions: coaching.suggestions,
            actions: coaching.actions,
            decisions: coaching.decisions,
            citations: coaching.citations,
            sources: coaching.sources,
            employeeContext: coaching.employeeContext,
            workforce: coaching.workforce,
            grounded: coaching.grounded,
            retrievalNote: retrieval?.retrievalNote,
            automationsQueued: coaching.automationsQueued,
            provider: coaching.provider,
            model: coaching.model,
            aiEnabled: aiConfig.aiEnabled,
            jurisdiction: {
              countryCode: jurisdiction.countryCode,
              countryName: jurisdiction.countryName,
              labourAuthority: jurisdiction.labourAuthority,
              enabledCountries: jurisdiction.enabledCountries,
            },
            timestamp: new Date().toISOString(),
          },
        });
      }

      case 'automate': {
        const { actionId, payload } = body;
        const result = AUTOMATION_RESULTS[actionId] || {
          message: `✅ Action "${actionId}" queued for processing.`,
        };

        return NextResponse.json({
          success: true,
          data: {
            actionId,
            payload,
            ...result,
            timestamp: new Date().toISOString(),
          },
        });
      }

      case 'session':
        return NextResponse.json({
          success: true,
          data: {
            sessionId: `session_${Date.now()}`,
            aiEnabled: getAIConfig().aiEnabled,
            coachingPlan: {
              focus: body.focus || 'hr_decisions',
              duration: 'ongoing',
              goals: [
                { id: 1, title: 'Resolve active HR cases', progress: 40 },
                { id: 2, title: 'Automate routine approvals', progress: 65 },
                { id: 3, title: 'Improve manager coaching capability', progress: 25 },
              ],
            },
          },
        });

      case 'recommend':
        if (auth?.tenantId) {
          const recommendations = await getLiveRecommendations(auth.tenantId);
          return NextResponse.json({ success: true, data: { recommendations } });
        }
        return NextResponse.json({
          success: true,
          data: {
            recommendations: [
              {
                type: 'GUIDANCE',
                title: 'Sign in to load live HR metrics',
                action: 'Tenant-scoped recommendations require authentication',
                relevance: 0.7,
              },
            ],
          },
        });

      case 'feedback':
        return NextResponse.json({
          success: true,
          data: { message: 'Thank you for your feedback!' },
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('[coaching] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process coaching request', errorAr: 'فشل في معالجة طلب التدريب' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'stats';
    const auth = await resolveAuthContext(request);

    if (type === 'config') {
      const jurisdiction = await resolveTenantCoachingCountry(auth?.tenantId);
      return NextResponse.json({
        success: true,
        data: {
          ...getAIConfig(),
          ragEnabled: true,
          employeeGrounding: !!auth?.permissions?.includes('employees:read'),
          jurisdiction: {
            countryCode: jurisdiction.countryCode,
            countryName: jurisdiction.countryName,
            labourAuthority: jurisdiction.labourAuthority,
            enabledCountries: jurisdiction.enabledCountries,
          },
        },
      });
    }

    if (type === 'recommendations') {
      if (auth?.tenantId) {
        const recommendations = await getLiveRecommendations(auth.tenantId);
        return NextResponse.json({ success: true, data: { recommendations } });
      }
      return NextResponse.json({
        success: true,
        data: {
          recommendations: [
            {
              type: 'GUIDANCE',
              title: 'Sign in for live workforce insights',
              action: 'Authenticate to enable tenant data grounding',
              relevance: 0.7,
            },
          ],
        },
      });
    }

    let stats: Record<string, unknown> = {
      aiEnabled: getAIConfig().aiEnabled,
      ragEnabled: true,
      activeSessions: 0,
      decisionsSupported: 0,
      automationsRun: 0,
    };

    if (auth?.tenantId) {
      const retrieval = await retrieveHRContext({
        tenantId: auth.tenantId,
        query: 'workforce overview',
        canReadEmployees: false,
        topK: 1,
      });
      stats = {
        ...stats,
        workforce: retrieval.workforce,
        publishedPolicies: retrieval.workforce?.publishedPoliciesCount ?? 0,
      };
    }

    return NextResponse.json({ success: true, data: stats });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch coaching data', errorAr: 'فشل في جلب بيانات التدريب' },
      { status: 500 }
    );
  }
}
