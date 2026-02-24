import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';

// GET - Fetch feedback for onboarding instances (stored as notes/JSON on instances)
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user }) => {
    try {
      const tenantId = user.tenantId;
      const { searchParams } = new URL(request.url);
      const instanceId = searchParams.get('instanceId');

      const where: Record<string, unknown> = { tenantId };
      if (instanceId) where.id = instanceId;

      // Fetch instances that have notes (used as feedback storage)
      const instances = await prisma.onboardingInstance.findMany({
        where: {
          ...where,
          notes: { not: null },
        },
        select: {
          id: true,
          employeeId: true,
          notes: true,
          currentPhase: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Parse feedback from instance notes
      const feedback = instances
        .map((instance) => {
          try {
            const parsed = JSON.parse(instance.notes || '{}');
            if (parsed.feedback && Array.isArray(parsed.feedback)) {
              return parsed.feedback.map((f: Record<string, unknown>) => ({
                ...f,
                onboardingId: instance.id,
                employeeId: instance.employeeId,
              }));
            }
            return [];
          } catch {
            // Notes are not JSON feedback, skip
            return [];
          }
        })
        .flat();

      return NextResponse.json({ feedback }, { status: 200 });
    } catch (error) {
      console.error('Error fetching feedback:', error);
      return NextResponse.json(
        { error: 'Failed to fetch feedback' },
        { status: 500 }
      );
    }
  }
);

// POST - Submit feedback for an onboarding instance
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

      // Append feedback to the instance notes as JSON
      let existingNotes: Record<string, unknown> = {};
      try {
        existingNotes = JSON.parse(instance.notes || '{}');
      } catch {
        existingNotes = { originalNotes: instance.notes };
      }

      const feedbackEntry = {
        id: `feedback-${Date.now()}`,
        feedbackType: body.feedbackType || 'new_hire',
        providedDate: new Date().toISOString(),
        providedBy: user.userId,
        providedByName: body.providedByName || '',
        phase: body.phase || instance.currentPhase || 'first_week',
        overallRating: body.overallRating || 0,
        experienceRating: body.experienceRating || 0,
        supportRating: body.supportRating || 0,
        clarityRating: body.clarityRating || 0,
        readinessRating: body.readinessRating || 0,
        strengths: body.strengths || [],
        improvements: body.improvements || [],
        challenges: body.challenges || [],
        recommendations: body.recommendations || [],
        comments: body.comments || '',
        isAnonymous: body.isAnonymous || false,
      };

      const feedbackList = Array.isArray(existingNotes.feedback)
        ? [...existingNotes.feedback, feedbackEntry]
        : [feedbackEntry];

      await prisma.onboardingInstance.update({
        where: { id: body.instanceId },
        data: {
          notes: JSON.stringify({ ...existingNotes, feedback: feedbackList }),
        },
      });

      return NextResponse.json({ feedback: feedbackEntry }, { status: 201 });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return NextResponse.json(
        { error: 'Failed to submit feedback' },
        { status: 500 }
      );
    }
  }
);

// PUT - Update feedback
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user }) => {
    try {
      const tenantId = user.tenantId;
      const body = await request.json();

      if (!body.instanceId || !body.feedbackId) {
        return NextResponse.json(
          { error: 'Instance ID and Feedback ID are required' },
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
          { error: 'No feedback found for this instance' },
          { status: 404 }
        );
      }

      const feedbackList = Array.isArray(existingNotes.feedback)
        ? existingNotes.feedback.map((f: Record<string, unknown>) =>
            f.id === body.feedbackId ? { ...f, ...body.updates } : f
          )
        : [];

      await prisma.onboardingInstance.update({
        where: { id: body.instanceId },
        data: {
          notes: JSON.stringify({ ...existingNotes, feedback: feedbackList }),
        },
      });

      const updatedFeedback = feedbackList.find(
        (f: Record<string, unknown>) => f.id === body.feedbackId
      );

      return NextResponse.json({ feedback: updatedFeedback }, { status: 200 });
    } catch (error) {
      console.error('Error updating feedback:', error);
      return NextResponse.json(
        { error: 'Failed to update feedback' },
        { status: 500 }
      );
    }
  }
);
