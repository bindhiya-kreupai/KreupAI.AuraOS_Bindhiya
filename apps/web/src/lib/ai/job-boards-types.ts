export type JobBoard = {
  platform: string;
  name: string;
  connected: boolean;
  status: string;
  mode: 'sandbox' | 'live-unavailable';
};
export type BoardPosting = {
  id: string;
  title: string;
  status: string;
  platforms: { platform: string; status: string; url?: string }[];
};

export type JobBoardPostRequest = {
  title: string;
  department?: string;
  location?: string;
  type?: string;
};

export type JobBoardPostResult = {
  platform: string;
  status: 'published' | 'unavailable';
  url?: string;
};

export interface JobBoardAdapter {
  readonly platform: string;
  post(job: JobBoardPostRequest): Promise<JobBoardPostResult>;
  sync(): Promise<{ syncedCount: number; newApplications: number; updatedApplications: number }>;
}
