import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';

// GET - Fetch surveys for onboarding instances (stored as JSON on instances)
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user }) => {
    try {
      const tenantId = user.tenantId;
      const { searchParams } = new URL(request.url);
      const instanceId = searchParams.get('instanceId');

      const where: Record<string, unknown> = { tenantId };
      if (instanceId) where.id = instanceId;

      const instances = await prisma.onboardingInstance.findMany({
        where,
        select: {
          id: true,
          employeeId: true,
          notes: true,
          currentPhase: true,
          program: {
            select: {
              surveySchedule: true,
            },
          },
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Parse surveys from instance notes and program survey schedules
      const surveys = instances
        .map((instance) => {
          // Get survey schedule from program
          const surveySchedule = (instance.program?.surveySchedule as unknown[]) || [];

          // Get completed surveys from notes
          let completedSurveys: Record<string, unknown>[] = [];
          try {
            const parsed = JSON.parse(instance.notes || '{}');
            if (parsed.surveys && Array.isArray(parsed.surveys)) {
              completedSurveys = parsed.surveys;
            }
          } catch {
            // Notes are not JSON, skip
          }

          // Merge schedule with completions
          return surveySchedule.map((schedule: unknown) => {
            const s = schedule as Record<string, unknown>;
            const completed = completedSurveys.find(
              (c) => c.surveyId === s.surveyId
            );
            return {
              ...(s as Record<string, unknown>),
              onboardingId: instance.id,
              employeeId: instance.employeeId,
              status: completed ? 'completed' : 'scheduled',
              completedDate: completed?.completedDate || null,
              responses: completed?.responses || [],
              overallRating: completed?.overallRating || null,
            };
          });
        })
        .flat();

      return NextResponse.json({ surveys }, { status: 200 });
    } catch (error: any) {
      console.error('Error fetching surveys:', error);
      return NextResponse.json(
        { error: 'Failed to fetch surveys' },
        { status: 500 }
      );
    }
  }
);

// POST - Submit a survey response
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user }) => {
    try {
      const tenantId = user.tenantId;
      const body = await request.json();

      if (!body.instanceId) {
        return NextResponse.json(
          { error: 'Instance ID is required' },
          { status: 400 }
        );
      }

      const instance = await prisma.onboardingInstance.findFirst({
        where: { id: body.instanceId, tenantId },
      });

      if (!instance) {
        return NextResponse.json(
          { error: 'Onboarding instance not found' },
          { status: 404 }
        );
      }

      // Append survey response to instance notes
      let existingNotes: Record<string, unknown> = {};
      try {
        existingNotes = JSON.parse(instance.notes || '{}');
      } catch {
        existingNotes = { originalNotes: instance.notes };
      }

      const surveyEntry = {
        id: `survey-${Date.now()}`,
        surveyId: body.surveyId || `survey-${Date.now()}`,
        surveyName: body.surveyName || 'Onboarding Survey',
        frequency: body.frequency || 'day_30',
        completedDate: new Date().toISOString(),
        completedBy: user.userId,
        responses: body.responses || [],
        overallRating: body.overallRating || 0,
        comments: body.comments || '',
        status: 'completed',
      };

      const surveyList = Array.isArray(existingNotes.surveys)
        ? [...existingNotes.surveys, surveyEntry]
        : [surveyEntry];

      await prisma.onboardingInstance.update({
        where: { id: body.instanceId },
        data: {
          notes: JSON.stringify({ ...existingNotes, surveys: surveyList }),
        },
      });

      return NextResponse.json({ survey: surveyEntry }, { status: 201 });
    } catch (error: any) {
      console.error('Error submitting survey:', error);
      return NextResponse.json(
        { error: 'Failed to submit survey' },
        { status: 500 }
      );
    }
  }
);

// PUT - Update a survey response
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user }) => {
    try {
      const tenantId = user.tenantId;
      const body = await request.json();

      if (!body.instanceId || !body.surveyId) {
        return NextResponse.json(
          { error: 'Instance ID and Survey ID are required' },
          { status: 400 }
        );
      }

      const instance = await prisma.onboardingInstance.findFirst({
        where: { id: body.instanceId, tenantId },
      });

      if (!instance) {
        return NextResponse.json(
          { error: 'Onboarding instance not found' },
          { status: 404 }
        );
      }

      let existingNotes: Record<string, unknown> = {};
      try {
        existingNotes = JSON.parse(instance.notes || '{}');
      } catch {
        return NextResponse.json(
          { error: 'No surveys found for this instance' },
          { status: 404 }
        );
      }

      const surveyList = Array.isArray(existingNotes.surveys)
        ? existingNotes.surveys.map((s: Record<string, unknown>) =>
            s.surveyId === body.surveyId || s.id === body.surveyId
              ? { ...s, ...body.updates }
              : s
          )
        : [];

      await prisma.onboardingInstance.update({
        where: { id: body.instanceId },
        data: {
          notes: JSON.stringify({ ...existingNotes, surveys: surveyList }),
        },
      });

      const updatedSurvey = surveyList.find(
        (s: Record<string, unknown>) =>
          s.surveyId === body.surveyId || s.id === body.surveyId
      );

      return NextResponse.json({ survey: updatedSurvey }, { status: 200 });
    } catch (error: any) {
      console.error('Error updating survey:', error);
      return NextResponse.json(
        { error: 'Failed to update survey' },
        { status: 500 }
      );
    }
  }
);
