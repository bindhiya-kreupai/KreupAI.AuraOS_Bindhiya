import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'user-001';

  const progress = {
    userId,
    overallStats: {
      totalPathsEnrolled: 3,
      pathsCompleted: 1,
      pathsInProgress: 2,
      totalHoursSpent: 54,
      averageScore: 87,
      streak: 12,
      lastActivity: '2026-01-22T16:45:00Z',
    },
    activePaths: [
      {
        pathId: 'lp-001',
        title: 'Leadership Essentials',
        progress: 62,
        currentModule: 'mod-005',
        currentModuleTitle: 'Conflict Resolution',
        hoursSpent: 26,
        lastAccessed: '2026-01-22T16:45:00Z',
        estimatedCompletion: '2026-02-28T00:00:00Z',
        nextDeadline: '2026-01-30T23:59:59Z',
      },
      {
        pathId: 'lp-002',
        title: 'Data Analytics Fundamentals',
        progress: 35,
        currentModule: 'mod-003',
        currentModuleTitle: 'Data Visualization',
        hoursSpent: 12,
        lastAccessed: '2026-01-21T10:20:00Z',
        estimatedCompletion: '2026-03-15T00:00:00Z',
        nextDeadline: '2026-02-05T23:59:59Z',
      },
    ],
    completedPaths: [
      {
        pathId: 'lp-003',
        title: 'Compliance & Ethics Training',
        completedAt: '2025-11-20T14:30:00Z',
        score: 92,
        certificateId: 'cert-001',
        hoursSpent: 16,
      },
    ],
    weeklyActivity: [
      { week: '2026-W01', hours: 4.5, modulesCompleted: 2 },
      { week: '2026-W02', hours: 6.0, modulesCompleted: 3 },
      { week: '2026-W03', hours: 5.5, modulesCompleted: 2 },
      { week: '2026-W04', hours: 3.0, modulesCompleted: 1 },
    ],
  };

  return NextResponse.json({ success: true, data: progress });
}
