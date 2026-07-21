import { prisma } from '@aura/database';

export async function getEmailParsingSummary(tenantId: string) {
  const runs = await prisma.aIRunRecord.findMany({
    where: { tenantId, runType: 'email_parse', isDeleted: false },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: { id: true, output: true, createdAt: true },
  });
  const categories: Record<string, number> = {};
  for (const run of runs) {
    const category = (run.output as { category?: string }).category || 'OTHER';
    categories[category] = (categories[category] || 0) + 1;
  }
  return { runs, categories };
}
