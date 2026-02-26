/**
 * @module assessmentService
 * @description Advanced Assessment Service — technical, cognitive, personality, situational
 *              assessments; scorecards, analytics, candidate comparison (Sec 20.4)
 * @project AURA HCM Platform
 */

// ============================================================================
// TYPES
// ============================================================================

export type AssessmentType = 'technical' | 'cognitive' | 'personality' | 'situational';
export type AssessmentStatus = 'pending' | 'in_progress' | 'completed' | 'expired' | 'cancelled';
export type QuestionType =
  | 'coding'
  | 'multiple_choice'
  | 'free_text'
  | 'rating_scale'
  | 'scenario'
  | 'design';
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  correctAnswer?: string | number;
  timeLimit?: number; // seconds
  points: number;
  difficulty: DifficultyLevel;
  tags: string[];
}

export interface AssessmentTemplate {
  id: string;
  name: string;
  type: AssessmentType;
  description: string;
  durationMinutes: number;
  questions: Question[];
  totalPoints: number;
  passingScore: number; // percentage
  isPublished: boolean;
  usageCount: number;
  avgScore: number;
  completionRate: number;
  createdBy: string;
  createdAt: string;
  tags: string[];
  targetRoles: string[];
}

export interface AssessmentAssignment {
  id: string;
  candidateId: string;
  candidateName: string;
  assessmentId: string;
  assessmentName: string;
  assessmentType: AssessmentType;
  jobId: string;
  jobTitle: string;
  status: AssessmentStatus;
  assignedDate: string;
  dueDate: string;
  startedDate?: string;
  completedDate?: string;
  timeSpentMinutes?: number;
  score?: number;
  percentile?: number;
  passed?: boolean;
}

export interface QuestionResult {
  questionId: string;
  questionText: string;
  score: number;
  maxScore: number;
  timeTaken: number; // seconds
  isCorrect: boolean;
  candidateAnswer?: string;
  feedback?: string;
}

export interface AssessmentResult {
  assignmentId: string;
  candidateId: string;
  candidateName: string;
  assessmentId: string;
  assessmentName: string;
  assessmentType: AssessmentType;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  percentile: number;
  timeTakenMinutes: number;
  completedDate: string;
  questionResults: QuestionResult[];
  dimensionScores: Array<{ dimension: string; score: number; maxScore: number }>;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface Scorecard {
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  overallScore: number;
  assessments: Array<{
    assessmentId: string;
    assessmentName: string;
    type: AssessmentType;
    score: number;
    percentile: number;
    passed: boolean;
    completedDate: string;
  }>;
  dimensionBreakdown: Array<{
    dimension: string;
    score: number;
    benchmark: number;
  }>;
  recommendation: 'strong_hire' | 'hire' | 'maybe' | 'no_hire';
  notes: string;
}

export interface AssessmentAnalytics {
  totalAssigned: number;
  completed: number;
  completionRate: number;
  avgScore: number;
  passRate: number;
  avgTimeMinutes: number;
  scoreDistribution: Array<{ range: string; count: number }>;
  byType: Array<{
    type: AssessmentType;
    assigned: number;
    completed: number;
    avgScore: number;
    passRate: number;
  }>;
  topPerformers: Array<{
    candidateId: string;
    candidateName: string;
    score: number;
    percentile: number;
  }>;
  predictiveValidity: number; // correlation between assessment score and job performance
}

export interface CreateAssessmentData {
  name: string;
  type: AssessmentType;
  description: string;
  durationMinutes: number;
  questions: Omit<Question, 'id'>[];
  passingScore: number;
  targetRoles: string[];
  tags: string[];
}

export interface ComparisonData {
  candidateIds: string[];
  dimensions: string[];
  candidates: Array<{
    candidateId: string;
    candidateName: string;
    scores: Record<string, number>;
    overallScore: number;
    recommendation: string;
  }>;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_TEMPLATES: AssessmentTemplate[] = [
  {
    id: 'at-001',
    name: 'Full-Stack Engineering Assessment',
    type: 'technical',
    description:
      'Comprehensive technical assessment covering algorithms, system design, and full-stack concepts.',
    durationMinutes: 90,
    totalPoints: 100,
    passingScore: 70,
    isPublished: true,
    usageCount: 142,
    avgScore: 68.4,
    completionRate: 87.3,
    createdBy: 'Emily Park',
    createdAt: '2025-06-01',
    tags: ['JavaScript', 'React', 'Node.js', 'SQL', 'System Design'],
    targetRoles: ['Software Engineer', 'Full-Stack Developer'],
    questions: [
      {
        id: 'q-001',
        type: 'coding',
        text: 'Implement a function to find the longest palindromic substring in a given string.',
        points: 20,
        difficulty: 'medium',
        timeLimit: 1200,
        tags: ['algorithms', 'strings'],
      },
      {
        id: 'q-002',
        type: 'design',
        text: 'Design a URL shortening service like bit.ly. Include API design, database schema, and scalability considerations.',
        points: 25,
        difficulty: 'hard',
        timeLimit: 1800,
        tags: ['system design', 'scalability'],
      },
      {
        id: 'q-003',
        type: 'multiple_choice',
        text: 'Which of the following React hooks is used to memoize a value?',
        options: ['useEffect', 'useMemo', 'useCallback', 'useRef'],
        correctAnswer: 'useMemo',
        points: 10,
        difficulty: 'easy',
        tags: ['React', 'hooks'],
      },
      {
        id: 'q-004',
        type: 'coding',
        text: 'Write a SQL query to find the second highest salary from an Employee table.',
        points: 15,
        difficulty: 'medium',
        timeLimit: 600,
        tags: ['SQL', 'databases'],
      },
      {
        id: 'q-005',
        type: 'free_text',
        text: 'Explain the differences between SQL and NoSQL databases and when you would choose each.',
        points: 30,
        difficulty: 'medium',
        tags: ['databases'],
      },
    ],
  },
  {
    id: 'at-002',
    name: 'Cognitive Ability Assessment',
    type: 'cognitive',
    description: 'Measures logical reasoning, numerical aptitude, and verbal comprehension.',
    durationMinutes: 45,
    totalPoints: 60,
    passingScore: 65,
    isPublished: true,
    usageCount: 287,
    avgScore: 71.2,
    completionRate: 92.1,
    createdBy: 'Dr. Sarah Kim',
    createdAt: '2025-03-15',
    tags: ['Logic', 'Numerical', 'Verbal', 'Reasoning'],
    targetRoles: ['All'],
    questions: [
      {
        id: 'q-010',
        type: 'multiple_choice',
        text: 'If A > B and B > C, which statement is necessarily true?',
        options: ['A > C', 'C > A', 'A = C', 'None of the above'],
        correctAnswer: 'A > C',
        points: 10,
        difficulty: 'easy',
        tags: ['logic'],
      },
      {
        id: 'q-011',
        type: 'multiple_choice',
        text: "A company's revenue grew 15% to $92M. What was the original revenue?",
        options: ['$78M', '$80M', '$82M', '$84M'],
        correctAnswer: '$80M',
        points: 15,
        difficulty: 'medium',
        tags: ['numerical'],
      },
      {
        id: 'q-012',
        type: 'multiple_choice',
        text: 'Choose the word most similar in meaning to "Ephemeral":',
        options: ['Permanent', 'Transient', 'Robust', 'Substantial'],
        correctAnswer: 'Transient',
        points: 10,
        difficulty: 'medium',
        tags: ['verbal'],
      },
    ],
  },
  {
    id: 'at-003',
    name: 'Big Five Personality Assessment',
    type: 'personality',
    description:
      'Measures personality traits: Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism.',
    durationMinutes: 30,
    totalPoints: 100,
    passingScore: 0,
    isPublished: true,
    usageCount: 198,
    avgScore: 68.0,
    completionRate: 95.4,
    createdBy: 'Dr. Maya Patel',
    createdAt: '2025-01-10',
    tags: ['Big Five', 'OCEAN', 'Personality'],
    targetRoles: ['Manager', 'Team Lead', 'Customer Success'],
    questions: [
      {
        id: 'q-020',
        type: 'rating_scale',
        text: 'I enjoy being the center of attention at social events.',
        points: 4,
        difficulty: 'easy',
        tags: ['extraversion'],
      },
      {
        id: 'q-021',
        type: 'rating_scale',
        text: 'I always come prepared and organized to meetings.',
        points: 4,
        difficulty: 'easy',
        tags: ['conscientiousness'],
      },
      {
        id: 'q-022',
        type: 'rating_scale',
        text: "I find it easy to empathize with others' feelings.",
        points: 4,
        difficulty: 'easy',
        tags: ['agreeableness'],
      },
      {
        id: 'q-023',
        type: 'rating_scale',
        text: 'I enjoy exploring new ideas and intellectual challenges.',
        points: 4,
        difficulty: 'easy',
        tags: ['openness'],
      },
    ],
  },
  {
    id: 'at-004',
    name: 'Situational Judgment Test — Management',
    type: 'situational',
    description:
      'Workplace scenarios testing decision-making, leadership, and conflict resolution.',
    durationMinutes: 40,
    totalPoints: 80,
    passingScore: 60,
    isPublished: true,
    usageCount: 67,
    avgScore: 64.8,
    completionRate: 88.9,
    createdBy: 'Emily Park',
    createdAt: '2025-08-20',
    tags: ['Leadership', 'Decision Making', 'Conflict Resolution'],
    targetRoles: ['Manager', 'Team Lead', 'VP'],
    questions: [
      {
        id: 'q-030',
        type: 'scenario',
        text: 'A high-performing team member starts missing deadlines and seems disengaged. What is your first action?',
        options: [
          'Escalate to HR immediately',
          "Have a private 1:1 to understand what's happening",
          'Assign their work to others',
          'Give a formal warning',
        ],
        correctAnswer: "Have a private 1:1 to understand what's happening",
        points: 20,
        difficulty: 'medium',
        tags: ['leadership', 'empathy'],
      },
      {
        id: 'q-031',
        type: 'scenario',
        text: 'Two team members have a disagreement about the technical approach for a project. How do you resolve it?',
        options: [
          "Choose one person's approach",
          'Let them fight it out',
          'Facilitate a structured discussion with data-driven decision criteria',
          'Involve senior management',
        ],
        correctAnswer: 'Facilitate a structured discussion with data-driven decision criteria',
        points: 20,
        difficulty: 'medium',
        tags: ['conflict resolution'],
      },
    ],
  },
  {
    id: 'at-005',
    name: 'Data Science Technical Screen',
    type: 'technical',
    description:
      'Covers statistics, machine learning concepts, Python, SQL, and data visualization.',
    durationMinutes: 75,
    totalPoints: 100,
    passingScore: 72,
    isPublished: true,
    usageCount: 89,
    avgScore: 65.1,
    completionRate: 83.2,
    createdBy: 'Carlos Mendez',
    createdAt: '2025-09-01',
    tags: ['Python', 'Statistics', 'ML', 'SQL', 'Data Viz'],
    targetRoles: ['Data Scientist', 'ML Engineer', 'Data Analyst'],
    questions: [
      {
        id: 'q-040',
        type: 'coding',
        text: 'Write a Python function to calculate the precision and recall for a binary classifier.',
        points: 20,
        difficulty: 'medium',
        timeLimit: 900,
        tags: ['statistics', 'Python'],
      },
      {
        id: 'q-041',
        type: 'multiple_choice',
        text: 'Which technique helps prevent overfitting in neural networks?',
        options: ['Data augmentation', 'Dropout', 'Batch normalization', 'All of the above'],
        correctAnswer: 'All of the above',
        points: 10,
        difficulty: 'medium',
        tags: ['deep learning'],
      },
    ],
  },
];

const MOCK_ASSIGNMENTS: AssessmentAssignment[] = [
  {
    id: 'asgn-001',
    candidateId: 'cand-001',
    candidateName: 'Michael Torres',
    assessmentId: 'at-001',
    assessmentName: 'Full-Stack Engineering Assessment',
    assessmentType: 'technical',
    jobId: 'job-001',
    jobTitle: 'Senior Software Engineer',
    status: 'completed',
    assignedDate: '2026-02-01',
    dueDate: '2026-02-08',
    startedDate: '2026-02-03',
    completedDate: '2026-02-03',
    timeSpentMinutes: 82,
    score: 78,
    percentile: 74,
    passed: true,
  },
  {
    id: 'asgn-002',
    candidateId: 'cand-001',
    candidateName: 'Michael Torres',
    assessmentId: 'at-002',
    assessmentName: 'Cognitive Ability Assessment',
    assessmentType: 'cognitive',
    jobId: 'job-001',
    jobTitle: 'Senior Software Engineer',
    status: 'completed',
    assignedDate: '2026-02-01',
    dueDate: '2026-02-08',
    startedDate: '2026-02-04',
    completedDate: '2026-02-04',
    timeSpentMinutes: 44,
    score: 82,
    percentile: 86,
    passed: true,
  },
  {
    id: 'asgn-003',
    candidateId: 'cand-002',
    candidateName: 'Priya Patel',
    assessmentId: 'at-005',
    assessmentName: 'Data Science Technical Screen',
    assessmentType: 'technical',
    jobId: 'job-003',
    jobTitle: 'Data Scientist',
    status: 'in_progress',
    assignedDate: '2026-02-10',
    dueDate: '2026-02-17',
    startedDate: '2026-02-14',
  },
  {
    id: 'asgn-004',
    candidateId: 'cand-003',
    candidateName: 'David Kim',
    assessmentId: 'at-001',
    assessmentName: 'Full-Stack Engineering Assessment',
    assessmentType: 'technical',
    jobId: 'job-001',
    jobTitle: 'Senior Software Engineer',
    status: 'pending',
    assignedDate: '2026-02-15',
    dueDate: '2026-02-22',
  },
  {
    id: 'asgn-005',
    candidateId: 'cand-004',
    candidateName: 'Lisa Wang',
    assessmentId: 'at-003',
    assessmentName: 'Big Five Personality Assessment',
    assessmentType: 'personality',
    jobId: 'job-002',
    jobTitle: 'Product Manager',
    status: 'completed',
    assignedDate: '2026-01-20',
    dueDate: '2026-01-27',
    completedDate: '2026-01-22',
    timeSpentMinutes: 28,
    score: 76,
    percentile: 68,
    passed: true,
  },
  {
    id: 'asgn-006',
    candidateId: 'cand-004',
    candidateName: 'Lisa Wang',
    assessmentId: 'at-004',
    assessmentName: 'Situational Judgment Test — Management',
    assessmentType: 'situational',
    jobId: 'job-002',
    jobTitle: 'Product Manager',
    status: 'completed',
    assignedDate: '2026-01-20',
    dueDate: '2026-01-27',
    completedDate: '2026-01-23',
    timeSpentMinutes: 38,
    score: 70,
    percentile: 72,
    passed: true,
  },
  {
    id: 'asgn-007',
    candidateId: 'cand-005',
    candidateName: 'Aisha Johnson',
    assessmentId: 'at-002',
    assessmentName: 'Cognitive Ability Assessment',
    assessmentType: 'cognitive',
    jobId: 'job-001',
    jobTitle: 'Senior Software Engineer',
    status: 'expired',
    assignedDate: '2026-01-10',
    dueDate: '2026-01-17',
  },
];

const MOCK_RESULTS: AssessmentResult[] = [
  {
    assignmentId: 'asgn-001',
    candidateId: 'cand-001',
    candidateName: 'Michael Torres',
    assessmentId: 'at-001',
    assessmentName: 'Full-Stack Engineering Assessment',
    assessmentType: 'technical',
    score: 78,
    maxScore: 100,
    percentage: 78,
    passed: true,
    percentile: 74,
    timeTakenMinutes: 82,
    completedDate: '2026-02-03',
    questionResults: [
      {
        questionId: 'q-001',
        questionText: 'Palindromic substring',
        score: 18,
        maxScore: 20,
        timeTaken: 980,
        isCorrect: true,
      },
      {
        questionId: 'q-002',
        questionText: 'System design',
        score: 19,
        maxScore: 25,
        timeTaken: 1650,
        isCorrect: true,
      },
      {
        questionId: 'q-003',
        questionText: 'React useMemo',
        score: 10,
        maxScore: 10,
        timeTaken: 45,
        isCorrect: true,
      },
      {
        questionId: 'q-004',
        questionText: 'SQL second highest salary',
        score: 12,
        maxScore: 15,
        timeTaken: 480,
        isCorrect: true,
      },
      {
        questionId: 'q-005',
        questionText: 'SQL vs NoSQL',
        score: 19,
        maxScore: 30,
        timeTaken: 720,
        isCorrect: true,
      },
    ],
    dimensionScores: [
      { dimension: 'Algorithms', score: 18, maxScore: 20 },
      { dimension: 'System Design', score: 19, maxScore: 25 },
      { dimension: 'Frontend', score: 10, maxScore: 10 },
      { dimension: 'Database', score: 31, maxScore: 45 },
    ],
    feedback:
      'Strong performance in algorithms and frontend. Database and system design show good foundational knowledge with room to grow.',
    strengths: ['Algorithm implementation', 'React knowledge', 'Code clarity'],
    improvements: ['SQL advanced queries', 'Scalability concepts', 'Database optimization'],
  },
];

const MOCK_SCORECARDS: Scorecard[] = [
  {
    candidateId: 'cand-001',
    candidateName: 'Michael Torres',
    jobId: 'job-001',
    jobTitle: 'Senior Software Engineer',
    overallScore: 80,
    assessments: [
      {
        assessmentId: 'at-001',
        assessmentName: 'Technical Assessment',
        type: 'technical',
        score: 78,
        percentile: 74,
        passed: true,
        completedDate: '2026-02-03',
      },
      {
        assessmentId: 'at-002',
        assessmentName: 'Cognitive Assessment',
        type: 'cognitive',
        score: 82,
        percentile: 86,
        passed: true,
        completedDate: '2026-02-04',
      },
    ],
    dimensionBreakdown: [
      { dimension: 'Technical Skills', score: 78, benchmark: 72 },
      { dimension: 'Problem Solving', score: 82, benchmark: 70 },
      { dimension: 'Communication', score: 75, benchmark: 68 },
      { dimension: 'Cultural Fit', score: 80, benchmark: 75 },
      { dimension: 'Leadership Potential', score: 72, benchmark: 65 },
    ],
    recommendation: 'hire',
    notes: 'Strong technical and cognitive performance. Recommended for next interview stage.',
  },
  {
    candidateId: 'cand-004',
    candidateName: 'Lisa Wang',
    jobId: 'job-002',
    jobTitle: 'Product Manager',
    overallScore: 74,
    assessments: [
      {
        assessmentId: 'at-003',
        assessmentName: 'Personality Assessment',
        type: 'personality',
        score: 76,
        percentile: 68,
        passed: true,
        completedDate: '2026-01-22',
      },
      {
        assessmentId: 'at-004',
        assessmentName: 'Situational Judgment',
        type: 'situational',
        score: 70,
        percentile: 72,
        passed: true,
        completedDate: '2026-01-23',
      },
    ],
    dimensionBreakdown: [
      { dimension: 'Leadership', score: 74, benchmark: 72 },
      { dimension: 'Strategic Thinking', score: 78, benchmark: 74 },
      { dimension: 'Collaboration', score: 82, benchmark: 70 },
      { dimension: 'Customer Focus', score: 76, benchmark: 72 },
      { dimension: 'Data-Driven Decisions', score: 68, benchmark: 70 },
    ],
    recommendation: 'hire',
    notes: 'Good personality and situational judgment scores. Move to final round.',
  },
];

const MOCK_ANALYTICS: AssessmentAnalytics = {
  totalAssigned: 87,
  completed: 64,
  completionRate: 73.6,
  avgScore: 68.4,
  passRate: 71.9,
  avgTimeMinutes: 52,
  scoreDistribution: [
    { range: '0-20', count: 2 },
    { range: '21-40', count: 5 },
    { range: '41-60', count: 12 },
    { range: '61-70', count: 18 },
    { range: '71-80', count: 17 },
    { range: '81-90', count: 7 },
    { range: '91-100', count: 3 },
  ],
  byType: [
    { type: 'technical', assigned: 42, completed: 30, avgScore: 66.2, passRate: 66.7 },
    { type: 'cognitive', assigned: 22, completed: 18, avgScore: 71.4, passRate: 83.3 },
    { type: 'personality', assigned: 15, completed: 14, avgScore: 68.0, passRate: 100 },
    { type: 'situational', assigned: 8, completed: 2, avgScore: 64.8, passRate: 100 },
  ],
  topPerformers: [
    { candidateId: 'cand-001', candidateName: 'Michael Torres', score: 80, percentile: 92 },
    { candidateId: 'cand-004', candidateName: 'Lisa Wang', score: 76, percentile: 87 },
    { candidateId: 'cand-006', candidateName: 'Jin Park', score: 74, percentile: 84 },
  ],
  predictiveValidity: 0.67,
};

// ============================================================================
// SERVICE
// ============================================================================

export class AssessmentService {
  /** Get all assessment templates */
  static async getAssessmentTemplates(): Promise<AssessmentTemplate[]> {
    await new Promise((r) => setTimeout(r, 300));
    return [...MOCK_TEMPLATES];
  }

  /** Create a custom assessment */
  static async createAssessment(data: CreateAssessmentData): Promise<AssessmentTemplate> {
    await new Promise((r) => setTimeout(r, 500));
    const template: AssessmentTemplate = {
      id: `at-${Date.now()}`,
      ...data,
      totalPoints: data.questions.reduce((sum, q) => sum + q.points, 0),
      isPublished: false,
      usageCount: 0,
      avgScore: 0,
      completionRate: 0,
      createdBy: 'Current User',
      createdAt: new Date().toISOString().split('T')[0],
      questions: data.questions.map((q, i) => ({ ...q, id: `q-new-${i}` })),
    };
    return template;
  }

  /** Assign assessment to a candidate */
  static async assignAssessment(
    candidateId: string,
    assessmentId: string,
    jobId: string,
    dueDate: string
  ): Promise<AssessmentAssignment> {
    await new Promise((r) => setTimeout(r, 400));
    const template = MOCK_TEMPLATES.find((t) => t.id === assessmentId);
    return {
      id: `asgn-${Date.now()}`,
      candidateId,
      candidateName: 'Candidate',
      assessmentId,
      assessmentName: template?.name ?? 'Assessment',
      assessmentType: template?.type ?? 'technical',
      jobId,
      jobTitle: 'Target Role',
      status: 'pending',
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate,
    };
  }

  /** Get all assignments with optional filters */
  static async getAssignments(filters?: {
    candidateId?: string;
    status?: AssessmentStatus;
  }): Promise<AssessmentAssignment[]> {
    await new Promise((r) => setTimeout(r, 300));
    let result = [...MOCK_ASSIGNMENTS];
    if (filters?.candidateId) result = result.filter((a) => a.candidateId === filters.candidateId);
    if (filters?.status) result = result.filter((a) => a.status === filters.status);
    return result;
  }

  /** Get assessment results for a candidate */
  static async getAssessmentResults(candidateId: string): Promise<AssessmentResult[]> {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_RESULTS.filter((r) => r.candidateId === candidateId);
  }

  /** Get unified scorecard for a candidate */
  static async getCandidateScorecard(candidateId: string): Promise<Scorecard | null> {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_SCORECARDS.find((s) => s.candidateId === candidateId) ?? null;
  }

  /** Get assessment analytics */
  static async getAssessmentAnalytics(): Promise<AssessmentAnalytics> {
    await new Promise((r) => setTimeout(r, 350));
    return { ...MOCK_ANALYTICS };
  }

  /** Compare candidates side-by-side */
  static async compareCandidates(candidateIds: string[]): Promise<ComparisonData> {
    await new Promise((r) => setTimeout(r, 400));
    const dimensions = [
      'Technical Skills',
      'Problem Solving',
      'Communication',
      'Cultural Fit',
      'Leadership Potential',
    ];
    const candidates = MOCK_SCORECARDS.filter((s) => candidateIds.includes(s.candidateId)).map(
      (sc) => ({
        candidateId: sc.candidateId,
        candidateName: sc.candidateName,
        scores: Object.fromEntries(sc.dimensionBreakdown.map((d) => [d.dimension, d.score])),
        overallScore: sc.overallScore,
        recommendation: sc.recommendation,
      })
    );
    return { candidateIds, dimensions, candidates };
  }

  /** Update pass/fail threshold */
  static async updatePassingScore(
    _assessmentId: string,
    _passingScore: number
  ): Promise<{ success: boolean }> {
    await new Promise((r) => setTimeout(r, 200));
    return { success: true };
  }
}
