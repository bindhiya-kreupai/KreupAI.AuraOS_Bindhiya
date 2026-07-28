import { prisma } from '@aura/database';
import { recommendationScore, recommendationReason } from './ld-recommendation-rules';
import { getLearningContext } from './ld-recommendation-retrieval';
import type { LearningRecommendation, SkillGap } from './ld-recommendation-types';

export async function getRecommendations(tenantId: string, userId: string) {
  const context = await getLearningContext(tenantId, userId);
  const courses: LearningRecommendation[] = context.courses
    .map((course) => {
      const courseSkills = course.skills.map((skill) => skill.trim().toLowerCase());
      const gapSkills = courseSkills.filter((skill) => !context.knownSkills.has(skill));
      const targetsSkillGap = context.knownSkills.size > 0 && gapSkills.length > 0;
      const matchScore = recommendationScore(
        course.skills,
        context.knownSkills,
        course.enrollmentCount,
        course.rating
      );
      return {
        id: course.id,
        title: course.title,
        provider: course.instructor || 'Internal learning',
        duration: course.durationHours
          ? `${course.durationHours} hours`
          : course.duration
            ? `${course.duration} minutes`
            : 'Self-paced',
        rating: course.rating || 0,
        skills: course.skills,
        matchScore,
        reason: recommendationReason(course.skills, matchScore, targetsSkillGap),
        enrolled: context.enrolledCourseIds.has(course.id),
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
  await prisma.aIRunRecord
    .create({
      data: {
        tenantId,
        runType: 'ld_recommendation',
        output: {
          courseCount: courses.length,
          source: context.knownSkills.size
            ? 'certification_skills_and_catalog'
            : 'catalog_popularity',
        },
        completedAt: new Date(),
        createdBy: userId,
      },
    })
    .catch(() => undefined);
  return { courses, employeeId: context.employeeId };
}

export async function getSkillGaps(tenantId: string, userId: string): Promise<SkillGap[]> {
  const context = await getLearningContext(tenantId, userId);
  const skills = new Map<string, number>();
  context.courses.forEach((course) =>
    course.skills
      .filter((skill) => !context.knownSkills.has(skill.trim().toLowerCase()))
      .forEach((skill) => skills.set(skill, (skills.get(skill) || 0) + 1))
  );
  return [...skills.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill, count]) => ({
      skill,
      currentLevel: 0,
      targetLevel: Math.min(5, Math.max(1, count)),
      gap: Math.min(5, Math.max(1, count)),
    }));
}

export async function enrollInCourse(tenantId: string, userId: string, courseId: string) {
  const context = await getLearningContext(tenantId, userId);
  const course = context.courses.find((item) => item.id === courseId);
  if (!course) return { error: 'Course not found' as const };
  if (!context.employeeId) {
    const run = await prisma.aIRunRecord.create({
      data: {
        tenantId,
        runType: 'ld_enrollment_intent',
        output: { courseId, status: 'PENDING_EMPLOYEE_LINK' },
        completedAt: new Date(),
        createdBy: userId,
      },
    });
    return { intentRunId: run.id, status: 'PENDING_EMPLOYEE_LINK' };
  }
  const enrollment = await prisma.courseEnrollment.upsert({
    where: { courseId_employeeId: { courseId, employeeId: context.employeeId } },
    create: { courseId, employeeId: context.employeeId, tenantId, createdBy: userId },
    update: { isDeleted: false, status: 'enrolled', updatedBy: userId },
  });
  return { enrollmentId: enrollment.id, status: enrollment.status };
}
