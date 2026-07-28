import type { JobBoardAdapter, JobBoardPostRequest, JobBoardPostResult } from './job-boards-types';

export const supportedBoards = ['linkedin', 'indeed', 'bayt', 'gulftalent'];
export const liveModeUnavailable = () => process.env.JOB_BOARD_LIVE === 'true';

class SandboxJobBoardAdapter implements JobBoardAdapter {
  constructor(readonly platform: string) {}

  async post(job: JobBoardPostRequest): Promise<JobBoardPostResult> {
    if (liveModeUnavailable()) return { platform: this.platform, status: 'unavailable' };
    return {
      platform: this.platform,
      status: 'published',
      url: `sandbox://${this.platform}/postings/${encodeURIComponent(job.title)}-${crypto.randomUUID()}`,
    };
  }

  async sync() {
    return { syncedCount: 0, newApplications: 0, updatedApplications: 0 };
  }
}

export function getBoardAdapter(platform: string): JobBoardAdapter {
  return new SandboxJobBoardAdapter(platform);
}
