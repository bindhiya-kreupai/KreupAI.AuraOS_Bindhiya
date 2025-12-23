/**
 * Recruitment Agent API Routes
 * Phase 4 Sprint 31-32: Recruitment Agent Endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { RecruitmentAgentService } from '@/lib/services/agentic-ai';

/**
 * GET /api/agents/recruitment
 * Get Recruitment Agent capabilities and status
 */
export async function GET(request: NextRequest) {
  try {
    const definition = RecruitmentAgentService.getDefinition();

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
    console.error('Error fetching Recruitment agent:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Recruitment agent' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agents/recruitment
 * Execute Recruitment Agent action
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
      case 'SCREEN_CANDIDATES':
        if (!params?.jobId) {
          return NextResponse.json(
            { success: false, error: 'Job ID required for screening' },
            { status: 400 }
          );
        }
        result = await RecruitmentAgentService.screenCandidates(
          params.jobId,
          tenantId,
          params.criteria
        );
        break;

      case 'SHORTLIST_CANDIDATES':
        if (!params?.jobId || !params?.candidateIds) {
          return NextResponse.json(
            { success: false, error: 'Job ID and candidate IDs required' },
            { status: 400 }
          );
        }
        result = await RecruitmentAgentService.shortlistCandidates(
          params.jobId,
          tenantId,
          params.candidateIds
        );
        break;

      case 'SCHEDULE_INTERVIEW':
        if (!params?.candidateId || !params?.interviewers || !params?.duration) {
          return NextResponse.json(
            { success: false, error: 'Missing interview scheduling params' },
            { status: 400 }
          );
        }
        result = await RecruitmentAgentService.scheduleInterview(
          {
            type: 'SCHEDULE',
            candidateId: params.candidateId,
            interviewType: params.interviewType || 'TECHNICAL',
            interviewers: params.interviewers,
            preferredSlots: params.preferredSlots?.map((s: { date: string; startTime: string; endTime: string }) => ({
              date: new Date(s.date),
              startTime: s.startTime,
              endTime: s.endTime,
            })),
            duration: params.duration,
          },
          tenantId
        );
        break;

      case 'RESCHEDULE_INTERVIEW':
        if (!params?.interviewId || !params?.newSlot) {
          return NextResponse.json(
            { success: false, error: 'Interview ID and new slot required' },
            { status: 400 }
          );
        }
        result = await RecruitmentAgentService.rescheduleInterview(
          params.interviewId,
          tenantId,
          {
            date: new Date(params.newSlot.date),
            startTime: params.newSlot.startTime,
            endTime: params.newSlot.endTime,
          },
          params.reason
        );
        break;

      case 'CANCEL_INTERVIEW':
        if (!params?.interviewId || !params?.reason) {
          return NextResponse.json(
            { success: false, error: 'Interview ID and reason required' },
            { status: 400 }
          );
        }
        result = await RecruitmentAgentService.cancelInterview(
          params.interviewId,
          tenantId,
          params.reason
        );
        break;

      case 'GET_UPCOMING_INTERVIEWS':
        result = await RecruitmentAgentService.getUpcomingInterviews(
          tenantId,
          params
        );
        break;

      case 'GET_PIPELINE_STATS':
        result = await RecruitmentAgentService.getPipelineStats(
          tenantId,
          params
        );
        break;

      case 'GET_OPEN_POSITIONS':
        result = await RecruitmentAgentService.getOpenPositions(
          tenantId,
          params
        );
        break;

      case 'SEND_CANDIDATE_UPDATE':
        if (!params?.candidateId || !params?.templateType) {
          return NextResponse.json(
            { success: false, error: 'Candidate ID and template type required' },
            { status: 400 }
          );
        }
        result = await RecruitmentAgentService.sendCandidateUpdate(
          params.candidateId,
          tenantId,
          params.templateType,
          params.additionalData
        );
        break;

      case 'SEND_BULK_COMMUNICATION':
        if (!params?.candidateIds || !params?.template) {
          return NextResponse.json(
            { success: false, error: 'Candidate IDs and template required' },
            { status: 400 }
          );
        }
        result = await RecruitmentAgentService.sendBulkCommunication(
          params.candidateIds,
          tenantId,
          params.template
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
    console.error('Error executing Recruitment agent action:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to execute action'
      },
      { status: 500 }
    );
  }
}
