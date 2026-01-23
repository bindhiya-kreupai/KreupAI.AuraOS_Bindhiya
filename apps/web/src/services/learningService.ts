import axios from 'axios';

// ============================================================================
// TYPES
// ============================================================================

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type ModuleType = 'video' | 'quiz' | 'reading' | 'assignment';

export type AssessmentType = 'quiz' | 'assignment' | 'certification';

export interface PathModule {
  id: string;
  title: string;
  type: ModuleType;
  duration: number;
  completed?: boolean;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  modules: PathModule[];
  enrollmentCount: number;
  rating: number;
  difficulty: Difficulty;
}

export interface Enrollment {
  id: string;
  pathId: string;
  userId: string;
  enrolledAt: string;
  status: string;
}

export interface ProgressUpdate {
  pathId: string;
  moduleId: string;
  completed: boolean;
  timeSpent?: number;
}

export interface LearningProgress {
  pathId: string;
  pathTitle: string;
  completedModules: number;
  totalModules: number;
  percentComplete: number;
  lastAccessedAt: string;
}

export interface LearningRecommendation {
  path: LearningPath;
  reason: string;
  matchScore: number;
}

export interface Assessment {
  id: string;
  title: string;
  questionCount: number;
  duration: number;
  passingScore: number;
  attempts: number;
  type: AssessmentType;
}

export interface AssessmentAnswer {
  questionId: string;
  answer: string | string[];
}

export interface AssessmentResult {
  score: number;
  passed: boolean;
  feedback?: string;
  certificateId?: string;
}

export interface Certificate {
  id: string;
  pathId: string;
  userId: string;
  issuedAt: string;
  url: string;
}

export interface MentorMatch {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorAvatar?: string;
  expertise: string[];
  matchScore: number;
  availability: string;
}

export interface MentorshipRequest {
  id: string;
  mentorId: string;
  menteeId: string;
  message: string;
  status: string;
  createdAt: string;
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

export interface LearningPathParams {
  category?: string;
  page?: number;
}

// ============================================================================
// API CLIENT
// ============================================================================

const BASE_PATH = '/api/v1/learning';

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
 * Get available learning paths with optional category filter and pagination
 */
export async function getLearningPaths(params?: LearningPathParams): Promise<PaginatedResponse<LearningPath>> {
  const response = await apiClient.get<PaginatedResponse<LearningPath>>('/paths', { params });
  return response.data;
}

/**
 * Get detailed information about a specific learning path
 */
export async function getPathDetails(pathId: string): Promise<LearningPath> {
  const response = await apiClient.get<LearningPath>(`/paths/${pathId}`);
  return response.data;
}

/**
 * Enroll the current user in a learning path
 */
export async function enrollInPath(pathId: string): Promise<Enrollment> {
  const response = await apiClient.post<Enrollment>(`/paths/${pathId}/enroll`);
  return response.data;
}

/**
 * Track progress on a module within a learning path
 */
export async function trackProgress(data: ProgressUpdate): Promise<void> {
  await apiClient.post('/progress', data);
}

/**
 * Get learning progress for the current user, optionally filtered by path
 */
export async function getProgress(pathId?: string): Promise<LearningProgress[]> {
  const params = pathId ? { pathId } : undefined;
  const response = await apiClient.get<LearningProgress[]>('/progress', { params });
  return response.data;
}

/**
 * Get personalized learning path recommendations
 */
export async function getRecommendations(): Promise<LearningRecommendation[]> {
  const response = await apiClient.get<LearningRecommendation[]>('/recommendations');
  return response.data;
}

/**
 * Get assessments, optionally filtered by learning path
 */
export async function getAssessments(pathId?: string): Promise<Assessment[]> {
  const params = pathId ? { pathId } : undefined;
  const response = await apiClient.get<Assessment[]>('/assessments', { params });
  return response.data;
}

/**
 * Submit answers for an assessment
 */
export async function submitAssessment(assessmentId: string, answers: AssessmentAnswer[]): Promise<AssessmentResult> {
  const response = await apiClient.post<AssessmentResult>(`/assessments/${assessmentId}/submit`, { answers });
  return response.data;
}

/**
 * Generate a certificate for a completed learning path
 */
export async function generateCertificate(pathId: string): Promise<Certificate> {
  const response = await apiClient.post<Certificate>(`/paths/${pathId}/certificate`);
  return response.data;
}

/**
 * Get mentorship matches for the current user
 */
export async function getMentorshipMatches(): Promise<MentorMatch[]> {
  const response = await apiClient.get<MentorMatch[]>('/mentors/matches');
  return response.data;
}

/**
 * Request a mentor with a personalized message
 */
export async function requestMentor(mentorId: string, message: string): Promise<MentorshipRequest> {
  const response = await apiClient.post<MentorshipRequest>(`/mentors/${mentorId}/request`, { message });
  return response.data;
}
