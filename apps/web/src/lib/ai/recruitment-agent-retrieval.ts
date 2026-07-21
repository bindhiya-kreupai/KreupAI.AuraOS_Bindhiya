import { prisma } from '@aura/database';
import type { RecruitmentRetrievalContext } from './recruitment-agent-types';

export async function loadRecruitmentRetrievalContext(
  _tenantId: string
): Promise<RecruitmentRetrievalContext> {
  const jobs = await prisma.jobPosting
    .findMany({
      where: { status: { in: ['OPEN', 'Open', 'Published', 'ACTIVE'] }, isDeleted: false },
      take: 20,
      select: { id: true, title: true, department: true, status: true },
    })
    .catch(() => []);

  const applications = await prisma.candidateApplication
    .findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        status: true,
        candidate: { select: { firstName: true, lastName: true } },
      },
      take: 500,
    })
    .catch(() => []);

  const byStage: Record<string, number> = {};
  for (const a of applications) {
    const stage = a.status || 'applied';
    byStage[stage] = (byStage[stage] || 0) + 1;
  }

  const interviews = await prisma.interview
    .findMany({
      where: { scheduledDate: { gte: new Date() }, isDeleted: false },
      orderBy: { scheduledDate: 'asc' },
      take: 10,
      include: {
        application: {
          include: { candidate: { select: { firstName: true, lastName: true } } },
        },
      },
    })
    .catch(() => []);

  return {
    openPositions: jobs.map((j) => ({
      id: j.id,
      title: j.title,
      department: j.department || 'General',
      status: j.status,
    })),
    pipelineStats: { total: applications.length, byStage },
    upcomingInterviews: interviews.map((i) => ({
      id: i.id,
      candidate: i.application?.candidate
        ? `${i.application.candidate.firstName} ${i.application.candidate.lastName}`
        : 'Candidate',
      date: i.scheduledDate?.toISOString() || '',
      type: i.type || 'INTERVIEW',
    })),
  };
}
