import { prisma } from '@aura/database';

export type ReviewRating = {
  employeeId: string;
  rating: number;
  completedAt: Date;
};

export async function retrievePerformanceReviews(tenantId: string, teamId?: string) {
  let employeeIds: string[] | undefined;
  if (teamId) {
    const employees = await prisma.employee.findMany({
      where: {
        departmentId: teamId,
        isDeleted: false,
        company: { tenantId, isDeleted: false },
      },
      select: { id: true },
    });
    employeeIds = employees.map((employee) => employee.id);
    if (!employeeIds.length) return [];
  }

  const reviews = await prisma.performanceReview.findMany({
    where: {
      tenantId,
      isDeleted: false,
      ...(employeeIds ? { employeeId: { in: employeeIds } } : {}),
    },
    select: {
      employeeId: true,
      selfRating: true,
      managerRating: true,
      finalRating: true,
      completedAt: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: 'asc' },
  });

  return reviews
    .map((review): ReviewRating | null => {
      const rating = review.finalRating ?? review.managerRating ?? review.selfRating;
      if (rating === null) return null;
      return {
        employeeId: review.employeeId,
        rating,
        completedAt: review.completedAt ?? review.updatedAt,
      };
    })
    .filter((review): review is ReviewRating => review !== null);
}
