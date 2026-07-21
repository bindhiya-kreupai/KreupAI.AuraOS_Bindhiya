import { prisma } from '@aura/database';
import { getBoardRuns } from './job-boards-retrieval';
import { getBoardAdapter, liveModeUnavailable, supportedBoards } from './job-boards-rules';

export async function getJobBoardDashboard(tenantId: string) {
  const rows = await getBoardRuns(tenantId);
  const postings = rows.map((r) => ({ id: r.id, ...(r.output as object) }));
  const boards = supportedBoards.map((platform) => ({
    platform,
    name: platform[0].toUpperCase() + platform.slice(1),
    connected: !liveModeUnavailable(),
    status: liveModeUnavailable() ? 'CREDENTIALS_REQUIRED' : 'SANDBOX',
    mode: liveModeUnavailable() ? 'live-unavailable' : 'sandbox',
    stats: {
      activeJobs: postings.filter((p: any) =>
        p.platforms?.some((x: any) => x.platform === platform)
      ).length,
      applications: 0,
      views: 0,
    },
  }));
  return { boards, postings, liveModeUnavailable: liveModeUnavailable() };
}
export async function postToJobBoards(
  tenantId: string,
  userId: string,
  jobData: Record<string, unknown>,
  requestedBoards: unknown
) {
  const boards = (Array.isArray(requestedBoards) ? requestedBoards : [])
    .map(String)
    .filter((b) => supportedBoards.includes(b));
  const job = {
    title: String(jobData.title || 'Untitled job'),
    department: String(jobData.department || ''),
    location: String(jobData.location || ''),
    type: String(jobData.type || ''),
  };
  const platforms = await Promise.all(
    boards.map((platform) => getBoardAdapter(platform).post(job))
  );
  const output = {
    ...job,
    status: liveModeUnavailable() ? 'pending_credentials' : 'published',
    publishedAt: new Date().toISOString(),
    applications: 0,
    views: 0,
    platforms,
  };
  const row = await prisma.aIRunRecord
    .create({
      data: {
        tenantId,
        runType: 'job_board_posting',
        inputContext: { jobData, boards } as object,
        output,
        completedAt: new Date(),
        createdBy: userId,
      },
    })
    .catch(() => null);
  return {
    postingId: row?.id ?? null,
    results: platforms,
    liveModeUnavailable: liveModeUnavailable(),
  };
}

export async function syncJobBoards() {
  const results = await Promise.all(
    supportedBoards.map(async (platform) => ({
      platform,
      ...(await getBoardAdapter(platform).sync()),
    }))
  );
  return {
    syncedBoards: results.map(({ platform }) => platform),
    syncedCount: results.reduce((total, result) => total + result.syncedCount, 0),
    newApplications: results.reduce((total, result) => total + result.newApplications, 0),
    updatedApplications: results.reduce((total, result) => total + result.updatedApplications, 0),
    lastSyncTime: new Date().toISOString(),
    message: liveModeUnavailable()
      ? 'Live sync is unavailable until board credentials are configured.'
      : 'Sandbox sync completed.',
  };
}
