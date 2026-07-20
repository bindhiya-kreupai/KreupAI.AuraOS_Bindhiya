import { prisma } from '@aura/database';

export async function getLearningContext(tenantId: string, userId: string) {
  const [courses, employee] = await Promise.all([
    prisma.course.findMany({
      where: {
        tenantId,
        isDeleted: false,
        status: { in: ['published', 'active', 'PUBLISHED', 'ACTIVE'] },
      },
      orderBy: [{ enrollmentCount: 'desc' }, { rating: 'desc' }],
      take: 30,
    }),
    prisma.employee.findFirst({
      where: { userId, company: { tenantId }, isDeleted: false },
      select: { id: true },
    }),
  ]);
  const [enrollments, certifications] = employee
    ? await Promise.all([
        prisma.courseEnrollment.findMany({
          where: { tenantId, employeeId: employee.id, isDeleted: false },
          select: { courseId: true },
        }),
        prisma.certification.findMany({
          where: {
            tenantId,
            employeeId: employee.id,
            isDeleted: false,
            status: { in: ['active', 'ACTIVE'] },
          },
          select: { skills: true },
        }),
      ])
    : [[], []];
  const knownSkills = new Set(
    certifications.flatMap((certificate) =>
      certificate.skills.map((skill) => skill.trim().toLowerCase())
    )
  );
  return {
    courses,
    employeeId: employee?.id,
    enrolledCourseIds: new Set(enrollments.map((entry) => entry.courseId)),
    knownSkills,
  };
}
