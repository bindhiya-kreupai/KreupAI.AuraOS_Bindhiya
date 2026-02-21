import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';

// GET - Fetch onboarding analytics/metrics aggregated from instances and tasks
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user }) => {
    try {
      const tenantId = user.tenantId;

      // Fetch all instances for this tenant
      const instances = await prisma.onboardingInstance.findMany({
        where: { tenantId },
        include: { tasks: true },
      });

      const totalOnboardings = instances.length;
      const activeOnboardings = instances.filter(
        (i) => i.status === 'in_progress'
      ).length;
      const completedOnboardings = instances.filter(
        (i) => i.status === 'completed'
      ).length;
      const notStarted = instances.filter(
        (i) => i.status === 'not_started'
      ).length;

      // Average progress across active instances
      const activeInstances = instances.filter((i) => i.status === 'in_progress');
      const averageProgress =
        activeInstances.length > 0
          ? Math.round(
              activeInstances.reduce((sum, i) => sum + (i.progress || 0), 0) /
                activeInstances.length
            )
          : 0;

      // Average completion time for completed instances (in days)
      const completedWithDates = instances.filter(
        (i) => i.status === 'completed' && i.completionDate && i.startDate
      );
      const averageDuration =
        completedWithDates.length > 0
          ? Math.round(
              completedWithDates.reduce((sum, i) => {
                const start = new Date(i.startDate!).getTime();
                const end = new Date(i.completionDate!).getTime();
                return sum + (end - start) / (1000 * 60 * 60 * 24);
              }, 0) / completedWithDates.length
            )
          : 0;

      // Completion rate
      const completionRate =
        totalOnboardings > 0
          ? Math.round((completedOnboardings / totalOnboardings) * 100)
          : 0;

      // Task completion rates across all instances
      const allTasks = instances.flatMap((i) => i.tasks);
      const totalTasks = allTasks.length;
      const completedTasks = allTasks.filter(
        (t) => t.status === 'completed'
      ).length;
      const overdueTasks = allTasks.filter(
        (t) => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < new Date()
      ).length;
      const averageTaskCompletionRate =
        totalTasks > 0
          ? Math.round((completedTasks / totalTasks) * 100)
          : 0;

      const metrics = {
        totalOnboardings,
        activeOnboardings,
        completedOnboardings,
        notStarted,
        averageDuration,
        averageProgress,
        completionRate,
        totalTasks,
        completedTasks,
        overdueTasks,
        averageTaskCompletionRate,
        onTimeCompletionRate: completionRate,
        averageSatisfactionScore: 0,
        byPhase: [],
        byDepartment: [],
        commonChallenges: [],
        topPerformingBuddies: [],
        documentCompletionRate: 0,
        equipmentDeliveryTime: 0,
        accessProvisioningTime: 0,
        trainingCompletionRate: 0,
      };

      return NextResponse.json({ metrics }, { status: 200 });
    } catch (error) {
      console.error('Error fetching onboarding analytics:', error);
      return NextResponse.json(
        { error: 'Failed to fetch onboarding analytics' },
        { status: 500 }
      );
    }
  }
);
