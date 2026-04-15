import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const POST = withEnhancedAuth(async (request: NextRequest, { _user }: any) => {
  const body = await request.json();

  const trackingResult = {
    eventId: 'evt-' + Date.now(),
    userId: body.userId || 'user-001',
    pathId: body.pathId || 'lp-001',
    moduleId: body.moduleId || 'mod-005',
    lessonId: body.lessonId || 'les-012',
    eventType: body.eventType || 'lesson_completed',
    timestamp: new Date().toISOString(),
    duration: body.duration || 1800,
    metadata: {
      score: body.score || null,
      attempts: body.attempts || 1,
      interactionType: body.interactionType || 'video_watched',
      completionPercentage: body.completionPercentage || 100,
    },
    updatedProgress: {
      moduleProgress: 80,
      pathProgress: 65,
      nextLesson: {
        id: 'les-013',
        title: 'Mediation Techniques',
        type: 'interactive',
      },
    },
    achievements: [
      {
        id: 'ach-005',
        title: 'Consistent Learner',
        description: 'Completed lessons for 12 consecutive days',
        awardedAt: new Date().toISOString(),
        badge: '/images/badges/consistent-learner.png',
      },
    ],
  };

  return NextResponse.json(
    { success: true, data: trackingResult, message: 'Progress event tracked successfully' },
    { status: 201 }
  );
});
