/**
 * AI Workflow Generator — generate workflow from natural language prompt.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { generateWorkflowFromPrompt, getWorkflowAIConfig } from '@/lib/ai/workflow-generator-ai';
import { stepsToCanvas } from '@/lib/ai/workflow-generator-layout';

export async function GET() {
  const config = getWorkflowAIConfig();
  return NextResponse.json({
    success: true,
    data: config,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prompt = String(body.prompt || '').trim();
    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'prompt is required', errorAr: 'الوصف مطلوب' },
        { status: 400 }
      );
    }

    // Design-only generation — no permission gate (matches /api/ai/coaching chat).
    const generation = await generateWorkflowFromPrompt(prompt);
    const canvas = stepsToCanvas(generation.steps);

    return NextResponse.json({
      success: true,
      data: {
        ...generation,
        nodes: canvas.nodes,
        edges: canvas.edges,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[workflow/generate] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate workflow' },
      { status: 500 }
    );
  }
}
