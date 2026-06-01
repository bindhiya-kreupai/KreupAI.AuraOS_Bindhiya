import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

/**
 * GET /api/v1/admin/ai-config
 * Retrieve the current AI Copilot configuration
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  const { user, permissions } = context;
  if (!permissions.includes('admin/ai-config:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing admin/ai-config:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  const _tenantId = user.tenantId;

  try {
    // In production this would read from a database or config store.
    // For now we return a sensible default that the admin page can load and modify.
    const config = {
      primaryModel: 'claude-3.5-sonnet',
      availableModels: [
        { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', status: 'available' },
        {
          id: 'claude-3.5-sonnet',
          name: 'Claude 3.5 Sonnet',
          provider: 'Anthropic',
          status: 'available',
        },
        {
          id: 'gemini-ultra-1.5',
          name: 'Gemini Ultra 1.5',
          provider: 'Google',
          status: 'available',
        },
      ],
      personalityTone: 50, // 0 = concise, 50 = balanced, 100 = creative
      systemPrompt:
        'You are Aura, an advanced HR assistant. Prioritize empathy and accuracy in all responses...',
      capabilities: [
        {
          id: 'resume-parsing',
          name: 'Resume Parsing',
          desc: 'Auto-extract skills from CVs',
          active: true,
        },
        {
          id: 'sentiment-analysis',
          name: 'Sentiment Analysis',
          desc: 'Detect mood in feedback',
          active: true,
        },
        {
          id: 'policy-qa',
          name: 'Policy Q&A',
          desc: 'Answer employee queries from handbook',
          active: true,
        },
        {
          id: 'code-generation',
          name: 'Code Generation',
          desc: 'Write SQL/Scripts for analytics',
          active: false,
        },
      ],
      safety: {
        piiRedactionActive: true,
        redactedFields: ['Names', 'SSNs', 'Phone numbers'],
      },
      systemStatus: 'active', // 'active' | 'maintenance' | 'disabled'
      lastUpdatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: config });
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch AI configuration' },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/v1/admin/ai-config
 * Update the AI Copilot configuration
 */
export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  const { user, permissions } = context;
  if (!permissions.includes('admin/ai-config:update')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing admin/ai-config:update permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  const _tenantId = user.tenantId;

  try {
    const body = await request.json();

    // In production this would persist to a database.
    // For now echo back the updated config with a fresh timestamp.
    const updatedConfig = {
      ...body,
      lastUpdatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: updatedConfig,
      message: 'AI configuration updated successfully',
    });
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update AI configuration' },
      { status: 500 }
    );
  }
});
