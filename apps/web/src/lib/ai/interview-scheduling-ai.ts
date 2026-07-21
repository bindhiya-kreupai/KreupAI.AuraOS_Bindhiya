import { prisma } from '@aura/database';
import { suggestInterviewSlots } from './interview-scheduling-rules';
import { recentInterviewProposals } from './interview-scheduling-retrieval';

export async function getInterviewSchedules(tenantId: string) {
  const rows = await recentInterviewProposals(tenantId);
  const proposals = rows.map((row) => ({ id: row.id, ...(row.output as object) }));
  return {
    proposals,
    upcomingInterviews: proposals.filter((p: any) => p.status === 'COMMITTED').length,
  };
}

export async function getSuggestedInterviewSlots(tenantId: string, duration = 60) {
  const prior = await recentInterviewProposals(tenantId);
  const reservedSlots = prior.flatMap((row) => {
    const output = row.output as {
      status?: string;
      slots?: Array<{ start?: string; end?: string }>;
    };
    return output.status === 'COMMITTED' && Array.isArray(output.slots) ? output.slots : [];
  });
  return suggestInterviewSlots(duration, reservedSlots);
}

export async function createInterviewProposal(
  tenantId: string,
  userId: string,
  input: { candidateId: string; interviewers?: string[]; duration?: number }
) {
  const proposal = {
    candidateId: input.candidateId,
    interviewers: input.interviewers || [],
    slots: await getSuggestedInterviewSlots(tenantId, input.duration || 60),
    status: 'PROPOSED' as const,
  };
  const row = await prisma.aIRunRecord
    .create({
      data: {
        tenantId,
        runType: 'interview_scheduling',
        inputContext: input as object,
        output: proposal,
        completedAt: new Date(),
        createdBy: userId,
      },
    })
    .catch(() => null);
  return { id: row?.id ?? null, ...proposal };
}
export async function confirmInterviewProposal(
  tenantId: string,
  userId: string,
  proposalId: string
) {
  const row = await prisma.aIRunRecord.findFirst({
    where: { id: proposalId, tenantId, runType: 'interview_scheduling', isDeleted: false },
  });
  if (!row) return null;
  const output = {
    ...(row.output as object),
    status: 'COMMITTED',
    committedAt: new Date().toISOString(),
  };
  await prisma.aIRunRecord.update({
    where: { id: row.id },
    data: { output, updatedBy: userId, completedAt: new Date() },
  });
  return { id: row.id, ...output };
}
