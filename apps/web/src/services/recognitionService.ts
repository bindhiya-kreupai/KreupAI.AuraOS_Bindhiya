import axios from 'axios';

// ============================================================================
// TYPES
// ============================================================================

export interface RecognitionSubmission {
  recipientId: string;
  message: string;
  badgeId?: string;
  points?: number;
  values: string[];
}

export interface Recognition {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar: string;
  message: string;
  badge?: Badge;
  points: number;
  values: string[];
  reactions: ReactionSummary[];
  createdAt: string;
}

export interface ReactionSummary {
  emoji: string;
  count: number;
  userIds: string[];
}

export interface LeaderboardEntry {
  rank: number;
  employeeId: string;
  name: string;
  avatar: string;
  points: number;
  recognitionsCount: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
}

export type LeaderboardPeriod = 'week' | 'month' | 'quarter' | 'year';

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// API CLIENT
// ============================================================================

const BASE_PATH = '/api/v1/recognition';

const apiClient = axios.create({
  baseURL: BASE_PATH,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

/**
 * Give recognition to an employee
 */
export async function giveRecognition(data: RecognitionSubmission): Promise<Recognition> {
  const response = await apiClient.post<Recognition>('/', data);
  return response.data;
}

/**
 * Get the recognition feed with pagination
 */
export async function getRecognitionFeed(
  params?: { page?: number; limit?: number }
): Promise<PaginatedResponse<Recognition>> {
  const response = await apiClient.get<PaginatedResponse<Recognition>>('/feed', { params });
  return response.data;
}

/**
 * Get the leaderboard for a given time period
 */
export async function getLeaderboard(
  period?: LeaderboardPeriod
): Promise<LeaderboardEntry[]> {
  const response = await apiClient.get<LeaderboardEntry[]>('/leaderboard', {
    params: period ? { period } : undefined,
  });
  return response.data;
}

/**
 * Get recognitions received by the current user
 */
export async function getMyRecognitions(): Promise<Recognition[]> {
  const response = await apiClient.get<Recognition[]>('/me');
  return response.data;
}

/**
 * Get all available badges
 */
export async function getBadges(): Promise<Badge[]> {
  const response = await apiClient.get<Badge[]>('/badges');
  return response.data;
}
