/**
 * @module learningAnalyticsService
 * @description Learning Analytics Service — learning metrics, course effectiveness,
 *              ROI analysis, engagement, budget utilization, content popularity (Sec 21.6)
 * @project AURA HCM Platform
 */

// ============================================================================
// TYPES
// ============================================================================

export interface LearningMetrics {
  period: string;
  totalHoursLearned: number;
  avgHoursPerEmployee: number;
  coursesCompleted: number;
  certificationsEarned: number;
  activeLearnersCount: number;
  totalEmployees: number;
  activeLearnerRate: number;
  avgCompletionRate: number;
  avgSatisfactionScore: number;
  totalLearningInvestment: number;
  monthlyTrend: Array<{ month: string; hours: number; completions: number; activeUsers: number }>;
}

export interface CourseEffectiveness {
  courseId: string;
  courseTitle: string;
  provider: string;
  enrollments: number;
  completions: number;
  completionRate: number;
  avgScore: number;
  avgSatisfaction: number;
  avgTimeHours: number;
  dropOffRate: number;
  dropOffPoint: string;
  roi: number;
  cost: number;
  skillsImproved: string[];
  performanceImpact: number; // % improvement in performance reviews after course
}

export interface ROIAnalysis {
  totalInvestment: number;
  estimatedReturn: number;
  roi: number;
  currency: string;
  byCategory: Array<{
    category: string;
    investment: number;
    return: number;
    roi: number;
  }>;
  productivityGain: number; // percentage
  retentionImpact: number; // employees retained due to L&D
  retentionValue: number; // cost saved
  skillGapClosure: number; // percentage of skill gaps addressed
  timeToCompetency: { before: number; after: number; improvement: number }; // days
}

export interface SkillDevelopmentTrend {
  period: string;
  topSkillsGained: Array<{ skill: string; count: number; growthRate: number }>;
  skillsByDepartment: Array<{ department: string; topSkill: string; count: number }>;
  emergingSkills: string[];
  decliningSkills: string[];
  certificationsBySkill: Array<{ skill: string; count: number }>;
}

export interface LearnerEngagement {
  avgSessionMinutes: number;
  totalSessions: number;
  deviceBreakdown: Array<{ device: string; percentage: number }>;
  peakLearningHours: Array<{ hour: number; sessions: number }>;
  topDropOffReasons: string[];
  cohortCompletion: Array<{ cohort: string; completionRate: number }>;
  netPromoterScore: number;
  engagementScore: number;
}

export interface TrainingBudget {
  totalBudget: number;
  totalSpent: number;
  utilizationRate: number;
  currency: string;
  byDepartment: Array<{
    department: string;
    budget: number;
    spent: number;
    utilizationRate: number;
    employees: number;
    spentPerEmployee: number;
  }>;
  byCategory: Array<{ category: string; budget: number; spent: number }>;
  forecast: number;
}

export interface ContentPopularity {
  mostEnrolled: Array<{ courseId: string; title: string; enrollments: number; provider: string }>;
  leastEnrolled: Array<{ courseId: string; title: string; enrollments: number; provider: string }>;
  highestRated: Array<{ courseId: string; title: string; rating: number; provider: string }>;
  lowestCompleted: Array<{
    courseId: string;
    title: string;
    completionRate: number;
    provider: string;
  }>;
  byTopicTrend: Array<{ topic: string; enrollments: number; growthRate: number }>;
}

export interface InstructorRating {
  instructorId: string;
  name: string;
  isInternal: boolean;
  coursesCount: number;
  totalStudents: number;
  avgRating: number;
  completionRate: number;
  nps: number;
  topCourse: string;
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
  period?: 'monthly' | 'quarterly' | 'yearly';
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_METRICS: LearningMetrics = {
  period: 'Q1 2026',
  totalHoursLearned: 12847,
  avgHoursPerEmployee: 44.7,
  coursesCompleted: 1842,
  certificationsEarned: 127,
  activeLearnersCount: 234,
  totalEmployees: 287,
  activeLearnerRate: 81.5,
  avgCompletionRate: 73.4,
  avgSatisfactionScore: 4.3,
  totalLearningInvestment: 124000,
  monthlyTrend: [
    { month: 'Mar 2025', hours: 820, completions: 112, activeUsers: 142 },
    { month: 'Apr 2025', hours: 940, completions: 128, activeUsers: 158 },
    { month: 'May 2025', hours: 1080, completions: 145, activeUsers: 172 },
    { month: 'Jun 2025', hours: 980, completions: 134, activeUsers: 165 },
    { month: 'Jul 2025', hours: 870, completions: 119, activeUsers: 148 },
    { month: 'Aug 2025', hours: 920, completions: 125, activeUsers: 155 },
    { month: 'Sep 2025', hours: 1100, completions: 152, activeUsers: 178 },
    { month: 'Oct 2025', hours: 1250, completions: 168, activeUsers: 192 },
    { month: 'Nov 2025', hours: 1180, completions: 158, activeUsers: 184 },
    { month: 'Dec 2025', hours: 1020, completions: 138, activeUsers: 167 },
    { month: 'Jan 2026', hours: 1340, completions: 178, activeUsers: 208 },
    { month: 'Feb 2026', hours: 1345, completions: 185, activeUsers: 234 },
  ],
};

const MOCK_COURSE_EFFECTIVENESS: CourseEffectiveness[] = [
  {
    courseId: 'ec-001',
    courseTitle: 'Machine Learning Specialization',
    provider: 'Coursera',
    enrollments: 48,
    completions: 31,
    completionRate: 64.6,
    avgScore: 82,
    avgSatisfaction: 4.7,
    avgTimeHours: 89,
    dropOffRate: 35.4,
    dropOffPoint: 'Week 4',
    roi: 340,
    cost: 4800,
    skillsImproved: ['Python', 'ML Models', 'Deep Learning'],
    performanceImpact: 18,
  },
  {
    courseId: 'ec-003',
    courseTitle: 'React — The Complete Guide',
    provider: 'Udemy',
    enrollments: 87,
    completions: 71,
    completionRate: 81.6,
    avgScore: 88,
    avgSatisfaction: 4.8,
    avgTimeHours: 65,
    dropOffRate: 18.4,
    dropOffPoint: 'Section 12',
    roi: 520,
    cost: 0,
    skillsImproved: ['React', 'JavaScript', 'TypeScript'],
    performanceImpact: 22,
  },
  {
    courseId: 'ec-005',
    courseTitle: 'Transitioning to People Manager',
    provider: 'LinkedIn Learning',
    enrollments: 24,
    completions: 23,
    completionRate: 95.8,
    avgScore: 91,
    avgSatisfaction: 4.9,
    avgTimeHours: 8,
    dropOffRate: 4.2,
    dropOffPoint: 'N/A',
    roi: 780,
    cost: 0,
    skillsImproved: ['Leadership', 'Coaching', 'Feedback'],
    performanceImpact: 31,
  },
  {
    courseId: 'ec-004',
    courseTitle: 'AWS Solutions Architect',
    provider: 'Udemy',
    enrollments: 64,
    completions: 48,
    completionRate: 75.0,
    avgScore: 79,
    avgSatisfaction: 4.6,
    avgTimeHours: 54,
    dropOffRate: 25.0,
    dropOffPoint: 'Module 8',
    roi: 620,
    cost: 0,
    skillsImproved: ['AWS', 'Cloud Architecture', 'Networking'],
    performanceImpact: 25,
  },
  {
    courseId: 'ec-015',
    courseTitle: 'Communication Foundations',
    provider: 'LinkedIn Learning',
    enrollments: 124,
    completions: 118,
    completionRate: 95.2,
    avgScore: 88,
    avgSatisfaction: 4.8,
    avgTimeHours: 3,
    dropOffRate: 4.8,
    dropOffPoint: 'N/A',
    roi: 890,
    cost: 0,
    skillsImproved: ['Communication', 'Presentation', 'Writing'],
    performanceImpact: 28,
  },
  {
    courseId: 'ec-020',
    courseTitle: 'Google Project Management Certificate',
    provider: 'Coursera',
    enrollments: 34,
    completions: 22,
    completionRate: 64.7,
    avgScore: 84,
    avgSatisfaction: 4.5,
    avgTimeHours: 182,
    dropOffRate: 35.3,
    dropOffPoint: 'Course 4',
    roi: 280,
    cost: 3400,
    skillsImproved: ['Project Management', 'Agile', 'Risk Management'],
    performanceImpact: 20,
  },
];

const MOCK_ROI: ROIAnalysis = {
  totalInvestment: 124000,
  estimatedReturn: 520000,
  roi: 319.4,
  currency: 'USD',
  byCategory: [
    { category: 'Technical Skills', investment: 58000, return: 270000, roi: 365.5 },
    { category: 'Leadership', investment: 28000, return: 145000, roi: 417.9 },
    { category: 'Soft Skills', investment: 18000, return: 62000, roi: 244.4 },
    { category: 'Compliance', investment: 12000, return: 28000, roi: 133.3 },
    { category: 'Domain Knowledge', investment: 8000, return: 15000, roi: 87.5 },
  ],
  productivityGain: 14.2,
  retentionImpact: 12,
  retentionValue: 192000,
  skillGapClosure: 67.3,
  timeToCompetency: { before: 82, after: 58, improvement: 29.3 },
};

const MOCK_SKILL_TREND: SkillDevelopmentTrend = {
  period: 'Q1 2026',
  topSkillsGained: [
    { skill: 'Python', count: 124, growthRate: 28 },
    { skill: 'Machine Learning', count: 87, growthRate: 45 },
    { skill: 'Cloud Architecture', count: 74, growthRate: 32 },
    { skill: 'React', count: 71, growthRate: 18 },
    { skill: 'Data Analysis', count: 68, growthRate: 22 },
    { skill: 'Leadership', count: 65, growthRate: 15 },
    { skill: 'Communication', count: 118, growthRate: 12 },
    { skill: 'Project Management', count: 52, growthRate: 35 },
  ],
  skillsByDepartment: [
    { department: 'Engineering', topSkill: 'Machine Learning', count: 48 },
    { department: 'Data', topSkill: 'Python', count: 34 },
    { department: 'Product', topSkill: 'Agile', count: 28 },
    { department: 'Sales', topSkill: 'Communication', count: 42 },
    { department: 'HR', topSkill: 'Leadership', count: 22 },
  ],
  emergingSkills: [
    'Generative AI',
    'LLM Fine-tuning',
    'FinOps',
    'Platform Engineering',
    'AI Ethics',
  ],
  decliningSkills: ['Legacy Java', 'Waterfall PM', 'Flash Development'],
  certificationsBySkill: [
    { skill: 'Cloud', count: 48 },
    { skill: 'Project Management', count: 22 },
    { skill: 'Data Science', count: 18 },
    { skill: 'Security', count: 14 },
  ],
};

const MOCK_ENGAGEMENT: LearnerEngagement = {
  avgSessionMinutes: 28,
  totalSessions: 4821,
  deviceBreakdown: [
    { device: 'Desktop', percentage: 68 },
    { device: 'Mobile', percentage: 24 },
    { device: 'Tablet', percentage: 8 },
  ],
  peakLearningHours: [
    { hour: 9, sessions: 420 },
    { hour: 10, sessions: 680 },
    { hour: 11, sessions: 540 },
    { hour: 12, sessions: 290 },
    { hour: 14, sessions: 610 },
    { hour: 15, sessions: 580 },
    { hour: 16, sessions: 420 },
    { hour: 17, sessions: 340 },
  ],
  topDropOffReasons: [
    'Course too long',
    'Content not relevant',
    'Time constraints',
    'Technical issues',
  ],
  cohortCompletion: [
    { cohort: 'New Hires (Q4 2025)', completionRate: 88 },
    { cohort: 'Managers (Q1 2026)', completionRate: 72 },
    { cohort: 'Engineers (Q1 2026)', completionRate: 68 },
  ],
  netPromoterScore: 42,
  engagementScore: 74,
};

const MOCK_BUDGET: TrainingBudget = {
  totalBudget: 180000,
  totalSpent: 124000,
  utilizationRate: 68.9,
  currency: 'USD',
  byDepartment: [
    {
      department: 'Engineering',
      budget: 60000,
      spent: 47200,
      utilizationRate: 78.7,
      employees: 89,
      spentPerEmployee: 530,
    },
    {
      department: 'Data',
      budget: 25000,
      spent: 22400,
      utilizationRate: 89.6,
      employees: 24,
      spentPerEmployee: 933,
    },
    {
      department: 'Product',
      budget: 20000,
      spent: 14800,
      utilizationRate: 74,
      employees: 32,
      spentPerEmployee: 463,
    },
    {
      department: 'Sales',
      budget: 28000,
      spent: 18400,
      utilizationRate: 65.7,
      employees: 48,
      spentPerEmployee: 383,
    },
    {
      department: 'HR',
      budget: 15000,
      spent: 10200,
      utilizationRate: 68,
      employees: 22,
      spentPerEmployee: 464,
    },
    {
      department: 'Finance',
      budget: 12000,
      spent: 6800,
      utilizationRate: 56.7,
      employees: 18,
      spentPerEmployee: 378,
    },
    {
      department: 'Operations',
      budget: 20000,
      spent: 4200,
      utilizationRate: 21,
      employees: 54,
      spentPerEmployee: 78,
    },
  ],
  byCategory: [
    { category: 'External Platforms', budget: 80000, spent: 75200 },
    { category: 'Certifications', budget: 40000, spent: 28400 },
    { category: 'Conferences', budget: 30000, spent: 12800 },
    { category: 'Internal Programs', budget: 30000, spent: 7600 },
  ],
  forecast: 148000,
};

const MOCK_INSTRUCTORS: InstructorRating[] = [
  {
    instructorId: 'inst-001',
    name: 'Emily Park',
    isInternal: true,
    coursesCount: 3,
    totalStudents: 148,
    avgRating: 4.9,
    completionRate: 92,
    nps: 68,
    topCourse: 'HR Analytics Fundamentals',
  },
  {
    instructorId: 'inst-002',
    name: 'Carlos Mendez',
    isInternal: true,
    coursesCount: 2,
    totalStudents: 87,
    avgRating: 4.8,
    completionRate: 88,
    nps: 61,
    topCourse: 'Python for HR Professionals',
  },
  {
    instructorId: 'inst-003',
    name: 'Andrew Ng',
    isInternal: false,
    coursesCount: 1,
    totalStudents: 48,
    avgRating: 4.9,
    completionRate: 64,
    nps: 72,
    topCourse: 'Machine Learning Specialization',
  },
  {
    instructorId: 'inst-004',
    name: 'Maximilian Schwarzmüller',
    isInternal: false,
    coursesCount: 2,
    totalStudents: 184,
    avgRating: 4.8,
    completionRate: 81,
    nps: 65,
    topCourse: 'React — The Complete Guide',
  },
];

// ============================================================================
// SERVICE
// ============================================================================

export class LearningAnalyticsService {
  /** Get aggregated learning metrics */
  static async getLearningMetrics(_dateRange?: DateRangeParams): Promise<LearningMetrics> {
    await new Promise((r) => setTimeout(r, 400));
    return { ...MOCK_METRICS };
  }

  /** Get effectiveness data for a specific course */
  static async getCourseEffectiveness(courseId: string): Promise<CourseEffectiveness | null> {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_COURSE_EFFECTIVENESS.find((c) => c.courseId === courseId) ?? null;
  }

  /** Get all course effectiveness data */
  static async getAllCourseEffectiveness(): Promise<CourseEffectiveness[]> {
    await new Promise((r) => setTimeout(r, 350));
    return [...MOCK_COURSE_EFFECTIVENESS];
  }

  /** Get ROI analysis */
  static async getROIAnalysis(): Promise<ROIAnalysis> {
    await new Promise((r) => setTimeout(r, 400));
    return { ...MOCK_ROI };
  }

  /** Get skill development trends */
  static async getSkillDevelopmentTrend(_departmentId?: string): Promise<SkillDevelopmentTrend> {
    await new Promise((r) => setTimeout(r, 350));
    return { ...MOCK_SKILL_TREND };
  }

  /** Get learner engagement metrics */
  static async getLearnerEngagement(): Promise<LearnerEngagement> {
    await new Promise((r) => setTimeout(r, 300));
    return { ...MOCK_ENGAGEMENT };
  }

  /** Get training budget utilization */
  static async getTrainingBudgetUtilization(): Promise<TrainingBudget> {
    await new Promise((r) => setTimeout(r, 350));
    return { ...MOCK_BUDGET };
  }

  /** Get content popularity data */
  static async getContentPopularity(): Promise<ContentPopularity> {
    await new Promise((r) => setTimeout(r, 300));
    const sorted = [...MOCK_COURSE_EFFECTIVENESS].sort((a, b) => b.enrollments - a.enrollments);
    return {
      mostEnrolled: sorted
        .slice(0, 5)
        .map((c) => ({
          courseId: c.courseId,
          title: c.courseTitle,
          enrollments: c.enrollments,
          provider: c.provider,
        })),
      leastEnrolled: [...sorted]
        .reverse()
        .slice(0, 3)
        .map((c) => ({
          courseId: c.courseId,
          title: c.courseTitle,
          enrollments: c.enrollments,
          provider: c.provider,
        })),
      highestRated: [...MOCK_COURSE_EFFECTIVENESS]
        .sort((a, b) => b.avgSatisfaction - a.avgSatisfaction)
        .slice(0, 5)
        .map((c) => ({
          courseId: c.courseId,
          title: c.courseTitle,
          rating: c.avgSatisfaction,
          provider: c.provider,
        })),
      lowestCompleted: [...MOCK_COURSE_EFFECTIVENESS]
        .sort((a, b) => a.completionRate - b.completionRate)
        .slice(0, 3)
        .map((c) => ({
          courseId: c.courseId,
          title: c.courseTitle,
          completionRate: c.completionRate,
          provider: c.provider,
        })),
      byTopicTrend: MOCK_SKILL_TREND.topSkillsGained
        .slice(0, 6)
        .map((s) => ({ topic: s.skill, enrollments: s.count * 3, growthRate: s.growthRate })),
    };
  }

  /** Get instructor performance ratings */
  static async getInstructorRatings(): Promise<InstructorRating[]> {
    await new Promise((r) => setTimeout(r, 300));
    return [...MOCK_INSTRUCTORS];
  }
}
