/**
 * @module learningCatalogService
 * @description Learning & Development Catalog Service — course catalog, enrollments,
 *              progress tracking, learning paths, skill gap analysis, and analytics (Sec 21.1–21.2)
 * @project AURA HCM Platform
 */

import { APIClient } from '@/lib/api-client';

// ============================================================================
// TYPES
// ============================================================================

export type CourseFormat = 'video' | 'scorm' | 'document' | 'workshop' | 'webinar' | 'assessment';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseCategory =
  | 'technical'
  | 'leadership'
  | 'compliance'
  | 'soft_skills'
  | 'product'
  | 'sales'
  | 'hr'
  | 'finance'
  | 'data_analytics'
  | 'security';
export type EnrollmentStatus =
  | 'not_enrolled'
  | 'enrolled'
  | 'in_progress'
  | 'completed'
  | 'dropped';
export type SkillLevel = 0 | 1 | 2 | 3 | 4 | 5;
export type GapPriority = 'critical' | 'moderate' | 'on_track';

export interface CourseModule {
  id: string;
  title: string;
  duration: number;
  type: CourseFormat;
  order: number;
  isCompleted: boolean;
  completedDate?: string;
}

export interface CourseReview {
  id: string;
  reviewerName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  date: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  format: CourseFormat;
  level: CourseLevel;
  duration: number;
  thumbnailEmoji: string;
  instructor: string;
  provider: string;
  rating: number;
  ratingCount: number;
  enrollmentCount: number;
  tags: string[];
  skills: string[];
  prerequisites: string[];
  modules: CourseModule[];
  reviews: CourseReview[];
  isActive: boolean;
  isFeatured: boolean;
  enrollmentStatus: EnrollmentStatus;
  progress: number;
  lastAccessedDate?: string;
  completedDate?: string;
  enrolledDate?: string;
  requiresApproval: boolean;
  certificateOnCompletion: boolean;
  publishedDate: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  targetRole: string;
  level: CourseLevel;
  courses: {
    courseId: string;
    title: string;
    duration: number;
    isRequired: boolean;
    order: number;
  }[];
  totalDuration: number;
  skills: string[];
  estimatedWeeks: number;
  enrollmentCount: number;
  completionRate: number;
  thumbnailEmoji: string;
  certificateTitle: string;
  isEnrolled: boolean;
  progress: number;
}

export interface SkillData {
  id: string;
  name: string;
  category: string;
  requiredLevel: SkillLevel;
  currentLevel: SkillLevel;
  gap: number;
  priority: GapPriority;
  recommendedCourseId?: string;
  recommendedCourseTitle?: string;
}

export interface SkillGapData {
  employeeId: string;
  employeeName: string;
  role: string;
  department: string;
  skills: SkillData[];
  overallGapScore: number;
  criticalGapsCount: number;
  moderateGapsCount: number;
  onTrackCount: number;
  lastUpdated: string;
}

export interface LearningAnalytics {
  totalCourses: number;
  totalEnrollments: number;
  completionRate: number;
  averageRating: number;
  hoursLearnedThisMonth: number;
  hoursLearnedTotal: number;
  learningStreak: number;
  achievementBadges: string[];
  popularCourses: { courseId: string; title: string; enrollments: number }[];
  departmentActivity: { department: string; hours: number; completions: number }[];
  completionsByCategory: { category: CourseCategory; count: number; rate: number }[];
  monthlyActivity: { month: string; enrollments: number; completions: number; hours: number }[];
}

export interface CourseFilters {
  category?: CourseCategory;
  level?: CourseLevel;
  format?: CourseFormat;
  minDuration?: number;
  maxDuration?: number;
  search?: string;
  enrollmentStatus?: EnrollmentStatus;
  isFeatured?: boolean;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_COURSES: Course[] = [
  {
    id: 'course-001',
    title: 'React & TypeScript Fundamentals',
    description:
      'Master modern React development with TypeScript. Covers hooks, state management, component patterns, and testing best practices.',
    category: 'technical',
    format: 'video',
    level: 'intermediate',
    duration: 480,
    thumbnailEmoji: '⚛️',
    instructor: 'Sarah Mitchell',
    provider: 'AuraLearn',
    rating: 4.8,
    ratingCount: 124,
    enrollmentCount: 312,
    tags: ['react', 'typescript', 'frontend', 'javascript'],
    skills: ['React', 'TypeScript', 'Frontend Development'],
    prerequisites: ['JavaScript Basics'],
    modules: [
      {
        id: 'm1',
        title: 'TypeScript Basics',
        duration: 60,
        type: 'video',
        order: 1,
        isCompleted: true,
      },
      {
        id: 'm2',
        title: 'React Hooks Deep Dive',
        duration: 90,
        type: 'video',
        order: 2,
        isCompleted: true,
      },
      {
        id: 'm3',
        title: 'State Management Patterns',
        duration: 75,
        type: 'video',
        order: 3,
        isCompleted: false,
      },
      {
        id: 'm4',
        title: 'Testing with Jest & RTL',
        duration: 60,
        type: 'video',
        order: 4,
        isCompleted: false,
      },
      {
        id: 'm5',
        title: 'Performance Optimization',
        duration: 45,
        type: 'video',
        order: 5,
        isCompleted: false,
      },
      {
        id: 'm6',
        title: 'Final Assessment',
        duration: 30,
        type: 'assessment',
        order: 6,
        isCompleted: false,
      },
    ],
    reviews: [
      {
        id: 'r1',
        reviewerName: 'Tom J.',
        rating: 5,
        comment: 'Excellent course! Very practical.',
        date: '2026-02-10',
      },
      {
        id: 'r2',
        reviewerName: 'Anna K.',
        rating: 4,
        comment: 'Great content, could use more exercises.',
        date: '2026-02-08',
      },
    ],
    isActive: true,
    isFeatured: true,
    enrollmentStatus: 'in_progress',
    progress: 35,
    lastAccessedDate: '2026-02-24',
    enrolledDate: '2026-02-01',
    requiresApproval: false,
    certificateOnCompletion: true,
    publishedDate: '2025-11-01',
  },
  {
    id: 'course-002',
    title: 'People Management Essentials',
    description:
      'Build foundational people management skills — from goal setting and feedback to conflict resolution and team motivation.',
    category: 'leadership',
    format: 'video',
    level: 'beginner',
    duration: 300,
    thumbnailEmoji: '👥',
    instructor: 'Dr. James Foster',
    provider: 'AuraLearn',
    rating: 4.9,
    ratingCount: 89,
    enrollmentCount: 445,
    tags: ['management', 'leadership', 'team', 'feedback'],
    skills: ['People Management', 'Communication', 'Leadership'],
    prerequisites: [],
    modules: [
      {
        id: 'm1',
        title: 'The Modern Manager',
        duration: 45,
        type: 'video',
        order: 1,
        isCompleted: false,
      },
      {
        id: 'm2',
        title: 'Goal Setting & OKRs',
        duration: 60,
        type: 'video',
        order: 2,
        isCompleted: false,
      },
      {
        id: 'm3',
        title: 'Giving Effective Feedback',
        duration: 75,
        type: 'video',
        order: 3,
        isCompleted: false,
      },
      {
        id: 'm4',
        title: 'Conflict Resolution',
        duration: 60,
        type: 'video',
        order: 4,
        isCompleted: false,
      },
      {
        id: 'm5',
        title: 'Knowledge Check',
        duration: 20,
        type: 'assessment',
        order: 5,
        isCompleted: false,
      },
    ],
    reviews: [],
    isActive: true,
    isFeatured: true,
    enrollmentStatus: 'not_enrolled',
    progress: 0,
    requiresApproval: false,
    certificateOnCompletion: true,
    publishedDate: '2025-10-15',
  },
  {
    id: 'course-003',
    title: 'Data Privacy & GDPR Compliance',
    description:
      'Understand GDPR, CCPA, and data privacy obligations. Essential compliance training for all employees handling personal data.',
    category: 'compliance',
    format: 'scorm',
    level: 'beginner',
    duration: 120,
    thumbnailEmoji: '🔒',
    instructor: 'Legal & Compliance Team',
    provider: 'AuraLearn Compliance',
    rating: 4.2,
    ratingCount: 203,
    enrollmentCount: 892,
    tags: ['gdpr', 'privacy', 'compliance', 'legal'],
    skills: ['Data Privacy', 'GDPR Compliance', 'Information Security'],
    prerequisites: [],
    modules: [
      {
        id: 'm1',
        title: 'GDPR Overview',
        duration: 30,
        type: 'scorm',
        order: 1,
        isCompleted: true,
        completedDate: '2026-01-15',
      },
      {
        id: 'm2',
        title: 'Data Subject Rights',
        duration: 25,
        type: 'scorm',
        order: 2,
        isCompleted: true,
        completedDate: '2026-01-15',
      },
      {
        id: 'm3',
        title: 'Breach Response',
        duration: 25,
        type: 'scorm',
        order: 3,
        isCompleted: true,
        completedDate: '2026-01-16',
      },
      {
        id: 'm4',
        title: 'Compliance Assessment',
        duration: 20,
        type: 'assessment',
        order: 4,
        isCompleted: true,
        completedDate: '2026-01-16',
      },
    ],
    reviews: [],
    isActive: true,
    isFeatured: false,
    enrollmentStatus: 'completed',
    progress: 100,
    enrolledDate: '2026-01-10',
    completedDate: '2026-01-16',
    requiresApproval: false,
    certificateOnCompletion: true,
    publishedDate: '2025-09-01',
  },
  {
    id: 'course-004',
    title: 'Advanced SQL for Analytics',
    description:
      'Deep dive into SQL for data analytics — window functions, CTEs, performance tuning, and building analytical queries.',
    category: 'data_analytics',
    format: 'video',
    level: 'advanced',
    duration: 360,
    thumbnailEmoji: '🗄️',
    instructor: 'Chen Wei',
    provider: 'AuraLearn',
    rating: 4.7,
    ratingCount: 67,
    enrollmentCount: 178,
    tags: ['sql', 'analytics', 'database', 'data'],
    skills: ['SQL', 'Data Analysis', 'Database Management'],
    prerequisites: ['SQL Basics'],
    modules: [
      {
        id: 'm1',
        title: 'Window Functions',
        duration: 60,
        type: 'video',
        order: 1,
        isCompleted: false,
      },
      {
        id: 'm2',
        title: 'CTEs & Subqueries',
        duration: 75,
        type: 'video',
        order: 2,
        isCompleted: false,
      },
      {
        id: 'm3',
        title: 'Query Performance',
        duration: 90,
        type: 'video',
        order: 3,
        isCompleted: false,
      },
      {
        id: 'm4',
        title: 'Practical Analytics Lab',
        duration: 90,
        type: 'document',
        order: 4,
        isCompleted: false,
      },
      {
        id: 'm5',
        title: 'Capstone Assessment',
        duration: 45,
        type: 'assessment',
        order: 5,
        isCompleted: false,
      },
    ],
    reviews: [],
    isActive: true,
    isFeatured: true,
    enrollmentStatus: 'not_enrolled',
    progress: 0,
    requiresApproval: false,
    certificateOnCompletion: true,
    publishedDate: '2025-12-01',
  },
  {
    id: 'course-005',
    title: 'Workplace Harassment Prevention',
    description:
      'Mandatory annual compliance training covering harassment prevention, reporting procedures, and creating an inclusive workplace.',
    category: 'compliance',
    format: 'scorm',
    level: 'beginner',
    duration: 90,
    thumbnailEmoji: '⚖️',
    instructor: 'HR Compliance Team',
    provider: 'AuraLearn Compliance',
    rating: 4.0,
    ratingCount: 456,
    enrollmentCount: 1200,
    tags: ['compliance', 'harassment', 'dei', 'mandatory'],
    skills: ['Compliance', 'Workplace Conduct'],
    prerequisites: [],
    modules: [
      {
        id: 'm1',
        title: 'Understanding Harassment',
        duration: 25,
        type: 'scorm',
        order: 1,
        isCompleted: false,
      },
      {
        id: 'm2',
        title: 'Reporting Procedures',
        duration: 20,
        type: 'scorm',
        order: 2,
        isCompleted: false,
      },
      {
        id: 'm3',
        title: 'Bystander Intervention',
        duration: 20,
        type: 'scorm',
        order: 3,
        isCompleted: false,
      },
      {
        id: 'm4',
        title: 'Final Assessment',
        duration: 25,
        type: 'assessment',
        order: 4,
        isCompleted: false,
      },
    ],
    reviews: [],
    isActive: true,
    isFeatured: false,
    enrollmentStatus: 'enrolled',
    progress: 0,
    enrolledDate: '2026-02-15',
    requiresApproval: false,
    certificateOnCompletion: true,
    publishedDate: '2025-08-01',
  },
  {
    id: 'course-006',
    title: 'Cloud Architecture Fundamentals (AWS)',
    description:
      'Build a solid foundation in AWS cloud architecture — compute, storage, networking, security, and cost optimization.',
    category: 'technical',
    format: 'video',
    level: 'intermediate',
    duration: 600,
    thumbnailEmoji: '☁️',
    instructor: 'Raj Sharma',
    provider: 'AuraLearn Tech',
    rating: 4.6,
    ratingCount: 92,
    enrollmentCount: 234,
    tags: ['aws', 'cloud', 'architecture', 'devops'],
    skills: ['AWS', 'Cloud Architecture', 'Infrastructure'],
    prerequisites: ['Linux Basics', 'Networking Fundamentals'],
    modules: [
      {
        id: 'm1',
        title: 'AWS Core Services',
        duration: 90,
        type: 'video',
        order: 1,
        isCompleted: false,
      },
      {
        id: 'm2',
        title: 'Compute & Storage',
        duration: 120,
        type: 'video',
        order: 2,
        isCompleted: false,
      },
      {
        id: 'm3',
        title: 'Networking & Security',
        duration: 90,
        type: 'video',
        order: 3,
        isCompleted: false,
      },
      {
        id: 'm4',
        title: 'Serverless Architecture',
        duration: 75,
        type: 'video',
        order: 4,
        isCompleted: false,
      },
      {
        id: 'm5',
        title: 'Cost Optimization',
        duration: 60,
        type: 'video',
        order: 5,
        isCompleted: false,
      },
      {
        id: 'm6',
        title: 'Hands-on Lab',
        duration: 90,
        type: 'workshop',
        order: 6,
        isCompleted: false,
      },
      {
        id: 'm7',
        title: 'AWS SAA Practice Exam',
        duration: 75,
        type: 'assessment',
        order: 7,
        isCompleted: false,
      },
    ],
    reviews: [],
    isActive: true,
    isFeatured: true,
    enrollmentStatus: 'not_enrolled',
    progress: 0,
    requiresApproval: true,
    certificateOnCompletion: true,
    publishedDate: '2025-11-15',
  },
  {
    id: 'course-007',
    title: 'Effective Business Communication',
    description:
      'Enhance your written and verbal communication skills for professional contexts — emails, presentations, and difficult conversations.',
    category: 'soft_skills',
    format: 'video',
    level: 'beginner',
    duration: 200,
    thumbnailEmoji: '💬',
    instructor: 'Lisa Park',
    provider: 'AuraLearn',
    rating: 4.5,
    ratingCount: 178,
    enrollmentCount: 567,
    tags: ['communication', 'presentation', 'writing', 'soft-skills'],
    skills: ['Communication', 'Presentation Skills', 'Business Writing'],
    prerequisites: [],
    modules: [
      {
        id: 'm1',
        title: 'Professional Email Writing',
        duration: 45,
        type: 'video',
        order: 1,
        isCompleted: false,
      },
      {
        id: 'm2',
        title: 'Presentation Mastery',
        duration: 60,
        type: 'video',
        order: 2,
        isCompleted: false,
      },
      {
        id: 'm3',
        title: 'Difficult Conversations',
        duration: 50,
        type: 'video',
        order: 3,
        isCompleted: false,
      },
      {
        id: 'm4',
        title: 'Practice Scenarios',
        duration: 30,
        type: 'assessment',
        order: 4,
        isCompleted: false,
      },
    ],
    reviews: [],
    isActive: true,
    isFeatured: false,
    enrollmentStatus: 'not_enrolled',
    progress: 0,
    requiresApproval: false,
    certificateOnCompletion: false,
    publishedDate: '2025-09-15',
  },
  {
    id: 'course-008',
    title: 'Machine Learning with Python',
    description:
      'Applied ML course covering supervised learning, neural networks, model evaluation, and deployment using scikit-learn and PyTorch.',
    category: 'data_analytics',
    format: 'video',
    level: 'advanced',
    duration: 720,
    thumbnailEmoji: '🤖',
    instructor: 'Dr. Aisha Rahman',
    provider: 'AuraLearn Tech',
    rating: 4.9,
    ratingCount: 45,
    enrollmentCount: 89,
    tags: ['machine-learning', 'python', 'ai', 'deep-learning'],
    skills: ['Machine Learning', 'Python', 'PyTorch', 'scikit-learn'],
    prerequisites: ['Python Fundamentals', 'Statistics Basics'],
    modules: [],
    reviews: [],
    isActive: true,
    isFeatured: true,
    enrollmentStatus: 'not_enrolled',
    progress: 0,
    requiresApproval: true,
    certificateOnCompletion: true,
    publishedDate: '2026-01-10',
  },
  {
    id: 'course-009',
    title: 'Project Management Professional (PMP) Prep',
    description:
      'Comprehensive PMP certification preparation covering all PMBOK knowledge areas, process groups, and exam strategies.',
    category: 'soft_skills',
    format: 'video',
    level: 'intermediate',
    duration: 540,
    thumbnailEmoji: '📋',
    instructor: 'Marcus Webb',
    provider: 'AuraLearn',
    rating: 4.6,
    ratingCount: 133,
    enrollmentCount: 267,
    tags: ['pmp', 'project-management', 'certification', 'agile'],
    skills: ['Project Management', 'Agile', 'Risk Management', 'Stakeholder Management'],
    prerequisites: [],
    modules: [],
    reviews: [],
    isActive: true,
    isFeatured: false,
    enrollmentStatus: 'not_enrolled',
    progress: 0,
    requiresApproval: false,
    certificateOnCompletion: true,
    publishedDate: '2025-10-01',
  },
  {
    id: 'course-010',
    title: 'Cybersecurity Awareness',
    description:
      'Annual security awareness training covering phishing, password hygiene, social engineering, and incident reporting.',
    category: 'security',
    format: 'scorm',
    level: 'beginner',
    duration: 60,
    thumbnailEmoji: '🛡️',
    instructor: 'IT Security Team',
    provider: 'AuraLearn Compliance',
    rating: 4.1,
    ratingCount: 312,
    enrollmentCount: 1150,
    tags: ['security', 'phishing', 'compliance', 'mandatory'],
    skills: ['Cybersecurity', 'Information Security'],
    prerequisites: [],
    modules: [],
    reviews: [],
    isActive: true,
    isFeatured: false,
    enrollmentStatus: 'completed',
    progress: 100,
    completedDate: '2026-01-20',
    requiresApproval: false,
    certificateOnCompletion: true,
    publishedDate: '2025-08-01',
  },
  {
    id: 'course-011',
    title: 'Financial Modeling & Valuation',
    description:
      'Build professional-grade financial models from scratch — DCF, LBO, and M&A models with real-world case studies.',
    category: 'finance',
    format: 'video',
    level: 'advanced',
    duration: 480,
    thumbnailEmoji: '📊',
    instructor: 'Oliver Grant',
    provider: 'AuraLearn Finance',
    rating: 4.8,
    ratingCount: 56,
    enrollmentCount: 123,
    tags: ['finance', 'modeling', 'excel', 'valuation'],
    skills: ['Financial Modeling', 'Excel', 'DCF Analysis', 'Valuation'],
    prerequisites: ['Excel Fundamentals', 'Financial Accounting Basics'],
    modules: [],
    reviews: [],
    isActive: true,
    isFeatured: true,
    enrollmentStatus: 'not_enrolled',
    progress: 0,
    requiresApproval: false,
    certificateOnCompletion: true,
    publishedDate: '2025-12-15',
  },
  {
    id: 'course-012',
    title: 'Product Thinking & User Research',
    description:
      'Learn product thinking frameworks, user research methodologies, and how to translate insights into winning product decisions.',
    category: 'product',
    format: 'webinar',
    level: 'intermediate',
    duration: 240,
    thumbnailEmoji: '💡',
    instructor: 'Nadia Costa',
    provider: 'AuraLearn',
    rating: 4.7,
    ratingCount: 78,
    enrollmentCount: 189,
    tags: ['product', 'ux-research', 'user-research', 'product-thinking'],
    skills: ['Product Thinking', 'User Research', 'Product Strategy'],
    prerequisites: [],
    modules: [],
    reviews: [],
    isActive: true,
    isFeatured: false,
    enrollmentStatus: 'not_enrolled',
    progress: 0,
    requiresApproval: false,
    certificateOnCompletion: false,
    publishedDate: '2025-11-20',
  },
];

const MOCK_LEARNING_PATHS: LearningPath[] = [
  {
    id: 'path-001',
    title: 'Frontend Developer Track',
    description:
      'A curated path to becoming a professional frontend engineer — from JavaScript fundamentals to advanced React architecture.',
    targetRole: 'Senior Frontend Engineer',
    level: 'intermediate',
    courses: [
      {
        courseId: 'course-007',
        title: 'Effective Business Communication',
        duration: 200,
        isRequired: false,
        order: 0,
      },
      {
        courseId: 'course-001',
        title: 'React & TypeScript Fundamentals',
        duration: 480,
        isRequired: true,
        order: 1,
      },
      {
        courseId: 'course-006',
        title: 'Cloud Architecture Fundamentals (AWS)',
        duration: 600,
        isRequired: false,
        order: 2,
      },
    ],
    totalDuration: 1280,
    skills: ['React', 'TypeScript', 'AWS', 'Communication'],
    estimatedWeeks: 12,
    enrollmentCount: 189,
    completionRate: 42,
    thumbnailEmoji: '💻',
    certificateTitle: 'Certified Frontend Developer',
    isEnrolled: true,
    progress: 28,
  },
  {
    id: 'path-002',
    title: 'People Manager Journey',
    description:
      'Essential skills for first-time and experienced managers — from hiring and performance management to strategic leadership.',
    targetRole: 'People Manager',
    level: 'beginner',
    courses: [
      {
        courseId: 'course-002',
        title: 'People Management Essentials',
        duration: 300,
        isRequired: true,
        order: 1,
      },
      {
        courseId: 'course-007',
        title: 'Effective Business Communication',
        duration: 200,
        isRequired: true,
        order: 2,
      },
      {
        courseId: 'course-009',
        title: 'Project Management Professional (PMP) Prep',
        duration: 540,
        isRequired: false,
        order: 3,
      },
    ],
    totalDuration: 1040,
    skills: ['People Management', 'Communication', 'Project Management', 'Leadership'],
    estimatedWeeks: 10,
    enrollmentCount: 312,
    completionRate: 58,
    thumbnailEmoji: '🌟',
    certificateTitle: 'Certified People Manager',
    isEnrolled: false,
    progress: 0,
  },
  {
    id: 'path-003',
    title: 'Data Analytics Professional',
    description:
      'Go from data novice to professional analyst — SQL, Python, ML, and visualization techniques used by top data teams.',
    targetRole: 'Data Analyst / Data Scientist',
    level: 'intermediate',
    courses: [
      {
        courseId: 'course-004',
        title: 'Advanced SQL for Analytics',
        duration: 360,
        isRequired: true,
        order: 1,
      },
      {
        courseId: 'course-008',
        title: 'Machine Learning with Python',
        duration: 720,
        isRequired: false,
        order: 2,
      },
    ],
    totalDuration: 1080,
    skills: ['SQL', 'Python', 'Machine Learning', 'Data Analysis'],
    estimatedWeeks: 14,
    enrollmentCount: 145,
    completionRate: 35,
    thumbnailEmoji: '📈',
    certificateTitle: 'Certified Data Analytics Professional',
    isEnrolled: false,
    progress: 0,
  },
  {
    id: 'path-004',
    title: 'Compliance & Risk Awareness',
    description:
      'Stay compliant and protect the organization — GDPR, cybersecurity, harassment prevention, and workplace safety in one path.',
    targetRole: 'All Employees (Mandatory)',
    level: 'beginner',
    courses: [
      {
        courseId: 'course-003',
        title: 'Data Privacy & GDPR Compliance',
        duration: 120,
        isRequired: true,
        order: 1,
      },
      {
        courseId: 'course-005',
        title: 'Workplace Harassment Prevention',
        duration: 90,
        isRequired: true,
        order: 2,
      },
      {
        courseId: 'course-010',
        title: 'Cybersecurity Awareness',
        duration: 60,
        isRequired: true,
        order: 3,
      },
    ],
    totalDuration: 270,
    skills: ['Compliance', 'Data Privacy', 'Cybersecurity', 'Workplace Conduct'],
    estimatedWeeks: 2,
    enrollmentCount: 980,
    completionRate: 71,
    thumbnailEmoji: '🛡️',
    certificateTitle: 'Compliance & Risk Certified',
    isEnrolled: true,
    progress: 67,
  },
];

const MOCK_SKILL_GAP: SkillGapData = {
  employeeId: 'emp-001',
  employeeName: 'Jane Doe',
  role: 'Senior Software Engineer',
  department: 'Engineering',
  lastUpdated: '2026-02-20',
  overallGapScore: 62,
  criticalGapsCount: 2,
  moderateGapsCount: 3,
  onTrackCount: 4,
  skills: [
    {
      id: 'skill-001',
      name: 'TypeScript',
      category: 'Technical',
      requiredLevel: 4,
      currentLevel: 3,
      gap: 1,
      priority: 'moderate',
      recommendedCourseId: 'course-001',
      recommendedCourseTitle: 'React & TypeScript Fundamentals',
    },
    {
      id: 'skill-002',
      name: 'System Design',
      category: 'Technical',
      requiredLevel: 4,
      currentLevel: 2,
      gap: 2,
      priority: 'critical',
      recommendedCourseId: 'course-006',
      recommendedCourseTitle: 'Cloud Architecture Fundamentals (AWS)',
    },
    {
      id: 'skill-003',
      name: 'AWS / Cloud',
      category: 'Technical',
      requiredLevel: 3,
      currentLevel: 1,
      gap: 2,
      priority: 'critical',
      recommendedCourseId: 'course-006',
      recommendedCourseTitle: 'Cloud Architecture Fundamentals (AWS)',
    },
    {
      id: 'skill-004',
      name: 'React',
      category: 'Technical',
      requiredLevel: 5,
      currentLevel: 4,
      gap: 1,
      priority: 'moderate',
      recommendedCourseId: 'course-001',
      recommendedCourseTitle: 'React & TypeScript Fundamentals',
    },
    {
      id: 'skill-005',
      name: 'Communication',
      category: 'Soft Skills',
      requiredLevel: 4,
      currentLevel: 4,
      gap: 0,
      priority: 'on_track',
    },
    {
      id: 'skill-006',
      name: 'SQL & Data',
      category: 'Technical',
      requiredLevel: 3,
      currentLevel: 2,
      gap: 1,
      priority: 'moderate',
      recommendedCourseId: 'course-004',
      recommendedCourseTitle: 'Advanced SQL for Analytics',
    },
    {
      id: 'skill-007',
      name: 'Agile / Scrum',
      category: 'Process',
      requiredLevel: 4,
      currentLevel: 4,
      gap: 0,
      priority: 'on_track',
    },
    {
      id: 'skill-008',
      name: 'Testing',
      category: 'Technical',
      requiredLevel: 4,
      currentLevel: 3,
      gap: 1,
      priority: 'moderate',
      recommendedCourseId: 'course-001',
      recommendedCourseTitle: 'React & TypeScript Fundamentals',
    },
    {
      id: 'skill-009',
      name: 'Node.js',
      category: 'Technical',
      requiredLevel: 3,
      currentLevel: 3,
      gap: 0,
      priority: 'on_track',
    },
    {
      id: 'skill-010',
      name: 'GDPR Compliance',
      category: 'Compliance',
      requiredLevel: 2,
      currentLevel: 2,
      gap: 0,
      priority: 'on_track',
    },
  ],
};

const MOCK_ANALYTICS: LearningAnalytics = {
  totalCourses: 12,
  totalEnrollments: 4,
  completionRate: 50,
  averageRating: 4.6,
  hoursLearnedThisMonth: 14.5,
  hoursLearnedTotal: 86,
  learningStreak: 5,
  achievementBadges: ['First Course', 'Compliance Champion', 'Quick Learner'],
  popularCourses: [
    { courseId: 'course-002', title: 'People Management Essentials', enrollments: 445 },
    { courseId: 'course-003', title: 'Data Privacy & GDPR Compliance', enrollments: 892 },
    { courseId: 'course-001', title: 'React & TypeScript Fundamentals', enrollments: 312 },
  ],
  departmentActivity: [
    { department: 'Engineering', hours: 1240, completions: 89 },
    { department: 'Sales & Marketing', hours: 890, completions: 67 },
    { department: 'Human Resources', hours: 420, completions: 45 },
    { department: 'Product', hours: 560, completions: 38 },
  ],
  completionsByCategory: [
    { category: 'compliance', count: 245, rate: 88 },
    { category: 'technical', count: 134, rate: 62 },
    { category: 'leadership', count: 89, rate: 71 },
    { category: 'soft_skills', count: 156, rate: 74 },
  ],
  monthlyActivity: [
    { month: '2025-11', enrollments: 45, completions: 32, hours: 180 },
    { month: '2025-12', enrollments: 38, completions: 28, hours: 145 },
    { month: '2026-01', enrollments: 62, completions: 41, hours: 215 },
    { month: '2026-02', enrollments: 55, completions: 29, hours: 186 },
  ],
};

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class LearningCatalogService {
  /**
   * Get course catalog with filters
   */
  static async getCourses(filters?: CourseFilters): Promise<Course[]> {
    try {
      return await APIClient.get<Course[]>(
        '/v1/learning/courses',
        filters as Record<string, unknown>
      );
    } catch {
      let results = [...MOCK_COURSES];
      if (filters?.category) results = results.filter((c) => c.category === filters.category);
      if (filters?.level) results = results.filter((c) => c.level === filters.level);
      if (filters?.format) results = results.filter((c) => c.format === filters.format);
      if (filters?.minDuration) results = results.filter((c) => c.duration >= filters.minDuration!);
      if (filters?.maxDuration) results = results.filter((c) => c.duration <= filters.maxDuration!);
      if (filters?.enrollmentStatus)
        results = results.filter((c) => c.enrollmentStatus === filters.enrollmentStatus);
      if (filters?.isFeatured) results = results.filter((c) => c.isFeatured);
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        results = results.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q) ||
            c.tags.some((t) => t.includes(q)) ||
            c.skills.some((s) => s.toLowerCase().includes(q)) ||
            c.instructor.toLowerCase().includes(q)
        );
      }
      return results;
    }
  }

  /**
   * Get full course detail with modules and reviews
   */
  static async getCourseDetail(id: string): Promise<Course | null> {
    try {
      return await APIClient.get<Course>(`/v1/learning/courses/${id}`);
    } catch {
      return MOCK_COURSES.find((c) => c.id === id) ?? null;
    }
  }

  /**
   * Enroll in a course
   */
  static async enrollCourse(courseId: string, employeeId: string): Promise<Course> {
    try {
      return await APIClient.post<Course>(`/v1/learning/courses/${courseId}/enroll`, {
        employeeId,
      });
    } catch {
      const course = MOCK_COURSES.find((c) => c.id === courseId);
      if (!course) throw new Error(`Course ${courseId} not found`);
      course.enrollmentStatus = course.requiresApproval ? 'enrolled' : 'enrolled';
      course.enrolledDate = new Date().toISOString().split('T')[0];
      course.enrollmentCount += 1;
      return course;
    }
  }

  /**
   * Get employee's learning (in-progress, completed, recommended)
   */
  static async getMyLearning(employeeId: string): Promise<{
    inProgress: Course[];
    completed: Course[];
    recommended: Course[];
  }> {
    try {
      return await APIClient.get(`/v1/learning/my-learning`, { employeeId });
    } catch {
      return {
        inProgress: MOCK_COURSES.filter((c) => c.enrollmentStatus === 'in_progress'),
        completed: MOCK_COURSES.filter((c) => c.enrollmentStatus === 'completed'),
        recommended: MOCK_COURSES.filter(
          (c) => c.enrollmentStatus === 'not_enrolled' && c.isFeatured
        ).slice(0, 4),
      };
    }
  }

  /**
   * Update module progress within a course enrollment
   */
  static async updateProgress(
    enrollmentId: string,
    moduleId: string,
    progress: number
  ): Promise<{ success: boolean; overallProgress: number }> {
    try {
      return await APIClient.post(`/v1/learning/enrollments/${enrollmentId}/progress`, {
        moduleId,
        progress,
      });
    } catch {
      const course = MOCK_COURSES.find((c) => c.modules.some((m) => m.id === moduleId));
      if (course) {
        const mod = course.modules.find((m) => m.id === moduleId);
        if (mod && progress >= 100) {
          mod.isCompleted = true;
          mod.completedDate = new Date().toISOString().split('T')[0];
        }
        const completedCount = course.modules.filter((m) => m.isCompleted).length;
        course.progress = Math.round((completedCount / course.modules.length) * 100);
        if (course.progress >= 100) {
          course.enrollmentStatus = 'completed';
          course.completedDate = new Date().toISOString().split('T')[0];
        } else if (course.progress > 0) {
          course.enrollmentStatus = 'in_progress';
        }
        return { success: true, overallProgress: course.progress };
      }
      return { success: false, overallProgress: 0 };
    }
  }

  /**
   * Get learning paths (optionally filtered by role)
   */
  static async getLearningPaths(role?: string): Promise<LearningPath[]> {
    try {
      return await APIClient.get<LearningPath[]>('/v1/learning/paths', { role });
    } catch {
      if (!role) return MOCK_LEARNING_PATHS;
      return MOCK_LEARNING_PATHS.filter(
        (p) =>
          p.targetRole.toLowerCase().includes(role.toLowerCase()) || p.targetRole.includes('All')
      );
    }
  }

  /**
   * Get skill gap analysis for an employee
   */
  static async getSkillGapAnalysis(employeeId: string): Promise<SkillGapData> {
    try {
      return await APIClient.get<SkillGapData>(`/v1/learning/skill-gap/${employeeId}`);
    } catch {
      return { ...MOCK_SKILL_GAP, employeeId };
    }
  }

  /**
   * Get learning analytics dashboard data
   */
  static async getLearningAnalytics(): Promise<LearningAnalytics> {
    try {
      return await APIClient.get<LearningAnalytics>('/v1/learning/analytics');
    } catch {
      return MOCK_ANALYTICS;
    }
  }
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const COURSE_CATEGORY_META: Record<
  CourseCategory,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  technical: { label: 'Technical', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: 'Code2' },
  leadership: {
    label: 'Leadership',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    icon: 'Crown',
  },
  compliance: { label: 'Compliance', color: 'text-red-600', bgColor: 'bg-red-50', icon: 'Shield' },
  soft_skills: {
    label: 'Soft Skills',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    icon: 'Smile',
  },
  product: { label: 'Product', color: 'text-amber-600', bgColor: 'bg-amber-50', icon: 'Package' },
  sales: { label: 'Sales', color: 'text-orange-600', bgColor: 'bg-orange-50', icon: 'TrendingUp' },
  hr: { label: 'HR', color: 'text-pink-600', bgColor: 'bg-pink-50', icon: 'Users' },
  finance: { label: 'Finance', color: 'text-cyan-600', bgColor: 'bg-cyan-50', icon: 'DollarSign' },
  data_analytics: {
    label: 'Data & Analytics',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    icon: 'BarChart3',
  },
  security: { label: 'Security', color: 'text-slate-600', bgColor: 'bg-slate-50', icon: 'Lock' },
};

export const COURSE_FORMAT_META: Record<
  CourseFormat,
  { label: string; icon: string; color: string }
> = {
  video: { label: 'Video', icon: 'Play', color: 'text-red-500' },
  scorm: { label: 'SCORM', icon: 'BookOpen', color: 'text-blue-500' },
  document: { label: 'Document', icon: 'FileText', color: 'text-gray-500' },
  workshop: { label: 'Workshop', icon: 'Users', color: 'text-emerald-500' },
  webinar: { label: 'Webinar', icon: 'Video', color: 'text-violet-500' },
  assessment: { label: 'Assessment', icon: 'ClipboardCheck', color: 'text-amber-500' },
};

export const COURSE_LEVEL_META: Record<
  CourseLevel,
  { label: string; color: string; bgColor: string }
> = {
  beginner: { label: 'Beginner', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  intermediate: { label: 'Intermediate', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  advanced: { label: 'Advanced', color: 'text-red-600', bgColor: 'bg-red-50' },
};
