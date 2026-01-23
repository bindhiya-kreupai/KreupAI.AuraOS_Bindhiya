import axios from 'axios';

// ============================================================================
// TYPES
// ============================================================================

export type FeedbackType = 'praise' | 'constructive' | 'suggestion';

export interface FeedbackSubmission {
  recipientId: string;
  type: FeedbackType;
  message: string;
  isAnonymous?: boolean;
  values?: string[];
}

export interface Feedback {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  type: FeedbackType;
  message: string;
  isAnonymous: boolean;
  values: string[];
  createdAt: string;
}

export interface FilterParams {
  type?: FeedbackType;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

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

const BASE_PATH = '/api/v1/feedback';

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
 * Submit new feedback to a recipient
 */
export async function submitFeedback(data: FeedbackSubmission): Promise<Feedback> {
  const response = await apiClient.post<Feedback>('/', data);
  return response.data;
}

/**
 * Get feedback received by the current user
 */
export async function getReceivedFeedback(params?: FilterParams): Promise<Feedback[]> {
  const response = await apiClient.get<Feedback[]>('/received', { params });
  return response.data;
}

/**
 * Get feedback given by the current user
 */
export async function getGivenFeedback(params?: FilterParams): Promise<Feedback[]> {
  const response = await apiClient.get<Feedback[]>('/given', { params });
  return response.data;
}

/**
 * Get all feedback with pagination and filtering (admin/manager)
 */
export async function getAllFeedback(params?: FilterParams): Promise<PaginatedResponse<Feedback>> {
  const response = await apiClient.get<PaginatedResponse<Feedback>>('/', { params });
  return response.data;
}

/**
 * Submit a recognition for a colleague (combines feedback with recognition)
 */
export async function submitRecognition(data: {
  recipientId: string;
  message: string;
  values?: string[];
  badgeId?: string;
}): Promise<Feedback> {
  const response = await apiClient.post<Feedback>('/recognition', data);
  return response.data;
}
