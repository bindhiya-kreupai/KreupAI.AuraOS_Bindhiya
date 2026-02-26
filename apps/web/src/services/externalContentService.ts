/**
 * @module externalContentService
 * @description External Content Service — multi-provider integration (Coursera, Udemy,
 *              LinkedIn Learning, YouTube), import, sync, license tracking (Sec 21.4)
 * @project AURA HCM Platform
 */

// ============================================================================
// TYPES
// ============================================================================

export type ContentProvider =
  | 'coursera'
  | 'udemy'
  | 'linkedin_learning'
  | 'youtube'
  | 'pluralsight'
  | 'internal';
export type SyncStatus = 'synced' | 'syncing' | 'error' | 'never';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
export type ImportStatus = 'imported' | 'pending' | 'failed';

export interface ProviderConfig {
  id: ContentProvider;
  name: string;
  logo: string;
  color: string;
  isConnected: boolean;
  totalCourses: number;
  licenseCount: number;
  licenseUsed: number;
  monthlyFee: number;
  currency: string;
  syncStatus: SyncStatus;
  lastSynced?: string;
  features: string[];
}

export interface ExternalCourse {
  id: string;
  externalId: string;
  provider: ContentProvider;
  title: string;
  description: string;
  instructor: string;
  instructorBio?: string;
  level: CourseLevel;
  durationHours: number;
  language: string;
  rating: number;
  ratingCount: number;
  enrolledCount: number;
  topics: string[];
  skills: string[];
  price?: number;
  currency?: string;
  isFree: boolean;
  thumbnailEmoji: string;
  url: string;
  importStatus?: ImportStatus;
  isImported: boolean;
  lastUpdated: string;
  certificate: boolean;
}

export interface ExternalEnrollment {
  id: string;
  employeeId: string;
  employeeName: string;
  courseId: string;
  courseTitle: string;
  provider: ContentProvider;
  enrolledDate: string;
  completedDate?: string;
  progress: number;
  score?: number;
  certificateUrl?: string;
  timeSpentHours: number;
}

export interface LicenseUsage {
  provider: ContentProvider;
  providerName: string;
  totalLicenses: number;
  usedLicenses: number;
  utilizationRate: number;
  monthlyFee: number;
  costPerActiveUser: number;
  expiryDate: string;
  topCourses: Array<{ courseId: string; title: string; enrollments: number }>;
  byDepartment: Array<{ department: string; licenses: number }>;
}

export interface SearchFilters {
  query?: string;
  provider?: ContentProvider | 'all';
  topic?: string;
  level?: CourseLevel | 'all';
  durationMax?: number;
  isFree?: boolean;
  language?: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_PROVIDERS: ProviderConfig[] = [
  {
    id: 'coursera',
    name: 'Coursera',
    logo: '🎓',
    color: '#0056D2',
    isConnected: true,
    totalCourses: 6400,
    licenseCount: 200,
    licenseUsed: 142,
    monthlyFee: 3200,
    currency: 'USD',
    syncStatus: 'synced',
    lastSynced: '2026-02-24T08:00:00Z',
    features: ['University courses', 'Certificates', 'Degrees', 'Projects'],
  },
  {
    id: 'udemy',
    name: 'Udemy Business',
    logo: '🟣',
    color: '#A435F0',
    isConnected: true,
    totalCourses: 12000,
    licenseCount: 500,
    licenseUsed: 387,
    monthlyFee: 1800,
    currency: 'USD',
    syncStatus: 'synced',
    lastSynced: '2026-02-24T06:30:00Z',
    features: ['Practical courses', 'Tech focus', 'Lifetime access', 'Wide variety'],
  },
  {
    id: 'linkedin_learning',
    name: 'LinkedIn Learning',
    logo: '🔵',
    color: '#0A66C2',
    isConnected: true,
    totalCourses: 16000,
    licenseCount: 400,
    licenseUsed: 284,
    monthlyFee: 2400,
    currency: 'USD',
    syncStatus: 'syncing',
    lastSynced: '2026-02-23T22:00:00Z',
    features: [
      'Professional skills',
      'Leadership',
      'LinkedIn profile integration',
      'Learning paths',
    ],
  },
  {
    id: 'youtube',
    name: 'YouTube Learning',
    logo: '🔴',
    color: '#FF0000',
    isConnected: true,
    totalCourses: 0,
    licenseCount: 0,
    licenseUsed: 0,
    monthlyFee: 0,
    currency: 'USD',
    syncStatus: 'synced',
    lastSynced: '2026-02-24T09:00:00Z',
    features: ['Free content', 'Video format', 'Wide variety', 'Community'],
  },
  {
    id: 'pluralsight',
    name: 'Pluralsight',
    logo: '🟤',
    color: '#EE4A0A',
    isConnected: false,
    totalCourses: 7000,
    licenseCount: 0,
    licenseUsed: 0,
    monthlyFee: 2100,
    currency: 'USD',
    syncStatus: 'never',
    features: ['Tech skills', 'Assessments', 'Paths', 'Labs'],
  },
];

const MOCK_EXTERNAL_COURSES: ExternalCourse[] = [
  {
    id: 'ec-001',
    externalId: 'coursera-ml-stanford',
    provider: 'coursera',
    title: 'Machine Learning Specialization',
    description:
      'The Machine Learning Specialization from DeepLearning.AI and Stanford University is a foundational online program built for aspiring ML engineers.',
    instructor: 'Andrew Ng',
    level: 'intermediate',
    durationHours: 87,
    language: 'English',
    rating: 4.9,
    ratingCount: 125000,
    enrolledCount: 4800000,
    topics: ['Machine Learning', 'AI', 'Deep Learning'],
    skills: ['Python', 'TensorFlow', 'Neural Networks', 'Regression', 'Classification'],
    isFree: false,
    price: 49,
    currency: 'USD',
    thumbnailEmoji: '🤖',
    url: 'https://coursera.org',
    isImported: true,
    importStatus: 'imported',
    lastUpdated: '2026-01-15',
    certificate: true,
  },
  {
    id: 'ec-002',
    externalId: 'coursera-data-science',
    provider: 'coursera',
    title: 'IBM Data Science Professional Certificate',
    description:
      'Kickstart your career in data science & ML with this hands-on certification program.',
    instructor: 'Joseph Santarcangelo',
    level: 'beginner',
    durationHours: 95,
    language: 'English',
    rating: 4.6,
    ratingCount: 85000,
    enrolledCount: 2100000,
    topics: ['Data Science', 'Python', 'SQL', 'Machine Learning'],
    skills: ['Python', 'SQL', 'Data Analysis', 'Machine Learning'],
    isFree: false,
    price: 49,
    currency: 'USD',
    thumbnailEmoji: '📊',
    url: 'https://coursera.org',
    isImported: false,
    lastUpdated: '2026-01-10',
    certificate: true,
  },
  {
    id: 'ec-003',
    externalId: 'udemy-react-complete',
    provider: 'udemy',
    title: 'React — The Complete Guide (incl. React Router & Redux)',
    description:
      'Dive in and learn React.js from scratch. This course takes you on a fun-filled journey using React!',
    instructor: 'Maximilian Schwarzmüller',
    level: 'beginner',
    durationHours: 68,
    language: 'English',
    rating: 4.8,
    ratingCount: 195000,
    enrolledCount: 950000,
    topics: ['React', 'JavaScript', 'Frontend'],
    skills: ['React', 'Redux', 'JavaScript', 'TypeScript', 'Hooks'],
    isFree: false,
    price: 0,
    currency: 'USD',
    thumbnailEmoji: '⚛️',
    url: 'https://udemy.com',
    isImported: true,
    importStatus: 'imported',
    lastUpdated: '2026-01-20',
    certificate: true,
  },
  {
    id: 'ec-004',
    externalId: 'udemy-aws-saa',
    provider: 'udemy',
    title: 'AWS Solutions Architect Associate 2026',
    description:
      'Pass the AWS Certified Solutions Architect Associate exam with the most comprehensive course available.',
    instructor: 'Stephane Maarek',
    level: 'intermediate',
    durationHours: 52,
    language: 'English',
    rating: 4.7,
    ratingCount: 142000,
    enrolledCount: 730000,
    topics: ['AWS', 'Cloud', 'DevOps'],
    skills: ['AWS', 'Cloud Architecture', 'EC2', 'S3', 'VPC'],
    isFree: false,
    price: 0,
    currency: 'USD',
    thumbnailEmoji: '☁️',
    url: 'https://udemy.com',
    isImported: false,
    lastUpdated: '2026-02-01',
    certificate: true,
  },
  {
    id: 'ec-005',
    externalId: 'linkedin-leadership',
    provider: 'linkedin_learning',
    title: 'Transitioning to People Manager',
    description:
      'Discover your management style, learn essential management skills, and develop the tools you need to build a high-performing team.',
    instructor: 'Suzanne Bates',
    level: 'intermediate',
    durationHours: 8,
    language: 'English',
    rating: 4.5,
    ratingCount: 12000,
    enrolledCount: 420000,
    topics: ['Leadership', 'Management', 'People Skills'],
    skills: ['People Management', 'Coaching', 'Feedback', 'Performance Management'],
    isFree: false,
    price: 0,
    currency: 'USD',
    thumbnailEmoji: '👥',
    url: 'https://linkedin.com/learning',
    isImported: true,
    importStatus: 'imported',
    lastUpdated: '2025-12-01',
    certificate: true,
  },
  {
    id: 'ec-006',
    externalId: 'linkedin-agile',
    provider: 'linkedin_learning',
    title: 'Agile Foundations',
    description:
      'Learn Agile methodology from the basics to advanced concepts, including Scrum, Kanban, and SAFe.',
    instructor: 'Doug Rose',
    level: 'beginner',
    durationHours: 6,
    language: 'English',
    rating: 4.6,
    ratingCount: 18500,
    enrolledCount: 640000,
    topics: ['Agile', 'Scrum', 'Project Management'],
    skills: ['Agile', 'Scrum', 'Kanban', 'Sprint Planning'],
    isFree: false,
    price: 0,
    currency: 'USD',
    thumbnailEmoji: '🔄',
    url: 'https://linkedin.com/learning',
    isImported: false,
    lastUpdated: '2026-01-05',
    certificate: true,
  },
  {
    id: 'ec-007',
    externalId: 'youtube-python-yt',
    provider: 'youtube',
    title: 'Python for Everybody (Full Course)',
    description:
      'Complete Python tutorial covering all fundamentals from variables to OOP, file handling, and databases.',
    instructor: 'Dr. Chuck (freeCodeCamp)',
    level: 'beginner',
    durationHours: 14,
    language: 'English',
    rating: 4.9,
    ratingCount: 45000,
    enrolledCount: 8200000,
    topics: ['Python', 'Programming'],
    skills: ['Python', 'Databases', 'Web Scraping', 'OOP'],
    isFree: true,
    thumbnailEmoji: '🐍',
    url: 'https://youtube.com',
    isImported: false,
    lastUpdated: '2025-09-01',
    certificate: false,
  },
  {
    id: 'ec-008',
    externalId: 'youtube-figma-yt',
    provider: 'youtube',
    title: 'Full Figma Design Course',
    description:
      'Learn Figma from beginner to advanced — UI design, components, prototyping, and dev handoff.',
    instructor: 'Flux Academy',
    level: 'all_levels',
    durationHours: 8,
    language: 'English',
    rating: 4.7,
    ratingCount: 8200,
    enrolledCount: 1200000,
    topics: ['Design', 'Figma', 'UI/UX'],
    skills: ['Figma', 'UI Design', 'Prototyping', 'Design Systems'],
    isFree: true,
    thumbnailEmoji: '🎨',
    url: 'https://youtube.com',
    isImported: false,
    lastUpdated: '2025-10-15',
    certificate: false,
  },
  {
    id: 'ec-009',
    externalId: 'coursera-gcp',
    provider: 'coursera',
    title: 'Google Cloud Professional Data Engineer',
    description: 'Prepare for the Google Cloud Professional Data Engineer certification exam.',
    instructor: 'Google Cloud Training',
    level: 'advanced',
    durationHours: 120,
    language: 'English',
    rating: 4.7,
    ratingCount: 28000,
    enrolledCount: 480000,
    topics: ['Google Cloud', 'Data Engineering', 'BigQuery'],
    skills: ['GCP', 'BigQuery', 'Dataflow', 'Data Pipelines'],
    isFree: false,
    price: 49,
    currency: 'USD',
    thumbnailEmoji: '🌩️',
    url: 'https://coursera.org',
    isImported: false,
    lastUpdated: '2025-11-20',
    certificate: true,
  },
  {
    id: 'ec-010',
    externalId: 'udemy-docker-k8s',
    provider: 'udemy',
    title: 'Docker and Kubernetes: The Complete Guide',
    description:
      'Build, test, and deploy Docker applications with Kubernetes while learning production best practices.',
    instructor: 'Stephen Grider',
    level: 'intermediate',
    durationHours: 22,
    language: 'English',
    rating: 4.7,
    ratingCount: 68000,
    enrolledCount: 320000,
    topics: ['Docker', 'Kubernetes', 'DevOps'],
    skills: ['Docker', 'Kubernetes', 'CI/CD', 'Container Orchestration'],
    isFree: false,
    price: 0,
    currency: 'USD',
    thumbnailEmoji: '🐳',
    url: 'https://udemy.com',
    isImported: true,
    importStatus: 'imported',
    lastUpdated: '2026-01-25',
    certificate: true,
  },
  {
    id: 'ec-011',
    externalId: 'linkedin-excel',
    provider: 'linkedin_learning',
    title: 'Excel Essential Training',
    description:
      'Master Microsoft Excel from basics to advanced features including pivot tables, charts, and macros.',
    instructor: 'Dennis Taylor',
    level: 'beginner',
    durationHours: 10,
    language: 'English',
    rating: 4.7,
    ratingCount: 22000,
    enrolledCount: 1800000,
    topics: ['Excel', 'Productivity', 'Data Analysis'],
    skills: ['Excel', 'Pivot Tables', 'VLOOKUP', 'Data Analysis'],
    isFree: false,
    price: 0,
    currency: 'USD',
    thumbnailEmoji: '📈',
    url: 'https://linkedin.com/learning',
    isImported: false,
    lastUpdated: '2026-01-10',
    certificate: true,
  },
  {
    id: 'ec-012',
    externalId: 'coursera-strategy',
    provider: 'coursera',
    title: 'Business Strategy Specialization',
    description:
      'Develop a comprehensive strategy skill set covering competitive positioning, disruption, and execution.',
    instructor: 'Michael Lenox',
    level: 'intermediate',
    durationHours: 60,
    language: 'English',
    rating: 4.6,
    ratingCount: 32000,
    enrolledCount: 620000,
    topics: ['Strategy', 'Business', 'Leadership'],
    skills: ['Strategic Thinking', 'Competitive Analysis', 'Business Planning', 'Innovation'],
    isFree: false,
    price: 49,
    currency: 'USD',
    thumbnailEmoji: '♟️',
    url: 'https://coursera.org',
    isImported: false,
    lastUpdated: '2025-12-15',
    certificate: true,
  },
  {
    id: 'ec-013',
    externalId: 'udemy-python-ds',
    provider: 'udemy',
    title: 'Python for Data Science and Machine Learning Bootcamp',
    description:
      'Become a certified data scientist with Python — pandas, numpy, matplotlib, scikit-learn, and more.',
    instructor: 'Jose Portilla',
    level: 'intermediate',
    durationHours: 26,
    language: 'English',
    rating: 4.7,
    ratingCount: 120000,
    enrolledCount: 840000,
    topics: ['Python', 'Data Science', 'Machine Learning'],
    skills: ['Python', 'Pandas', 'Scikit-learn', 'Data Visualization'],
    isFree: false,
    price: 0,
    currency: 'USD',
    thumbnailEmoji: '🔬',
    url: 'https://udemy.com',
    isImported: false,
    lastUpdated: '2026-01-30',
    certificate: true,
  },
  {
    id: 'ec-014',
    externalId: 'youtube-sql-yt',
    provider: 'youtube',
    title: 'SQL Tutorial — Full Database Course',
    description:
      'Complete SQL tutorial covering all major database concepts from beginner to advanced.',
    instructor: 'freeCodeCamp',
    level: 'beginner',
    durationHours: 4,
    language: 'English',
    rating: 4.8,
    ratingCount: 28000,
    enrolledCount: 6800000,
    topics: ['SQL', 'Databases'],
    skills: ['SQL', 'MySQL', 'Database Design', 'Queries'],
    isFree: true,
    thumbnailEmoji: '🗄️',
    url: 'https://youtube.com',
    isImported: false,
    lastUpdated: '2025-06-01',
    certificate: false,
  },
  {
    id: 'ec-015',
    externalId: 'linkedin-communication',
    provider: 'linkedin_learning',
    title: 'Communication Foundations',
    description:
      'Improve your verbal and written communication skills for greater impact in the workplace.',
    instructor: 'Tatiana Kolovou',
    level: 'beginner',
    durationHours: 3,
    language: 'English',
    rating: 4.8,
    ratingCount: 45000,
    enrolledCount: 2100000,
    topics: ['Communication', 'Soft Skills', 'Leadership'],
    skills: ['Communication', 'Presentation', 'Business Writing', 'Active Listening'],
    isFree: false,
    price: 0,
    currency: 'USD',
    thumbnailEmoji: '💬',
    url: 'https://linkedin.com/learning',
    isImported: true,
    importStatus: 'imported',
    lastUpdated: '2025-12-20',
    certificate: true,
  },
  {
    id: 'ec-016',
    externalId: 'coursera-hr-analytics',
    provider: 'coursera',
    title: 'People Analytics',
    description:
      'Learn how to apply analytics to improve talent management, workforce planning, and HR effectiveness.',
    instructor: 'Matthew Bidwell',
    level: 'intermediate',
    durationHours: 40,
    language: 'English',
    rating: 4.7,
    ratingCount: 18000,
    enrolledCount: 280000,
    topics: ['HR Analytics', 'People Analytics', 'Data'],
    skills: ['People Analytics', 'Workforce Planning', 'HR Strategy', 'Statistics'],
    isFree: false,
    price: 49,
    currency: 'USD',
    thumbnailEmoji: '👤',
    url: 'https://coursera.org',
    isImported: false,
    lastUpdated: '2025-11-01',
    certificate: true,
  },
  {
    id: 'ec-017',
    externalId: 'udemy-typescript',
    provider: 'udemy',
    title: 'Understanding TypeScript — 2026 Edition',
    description:
      'Boost your JavaScript projects with TypeScript: learn all about types, ES6+, decorators, generics and much more.',
    instructor: 'Maximilian Schwarzmüller',
    level: 'intermediate',
    durationHours: 22,
    language: 'English',
    rating: 4.7,
    ratingCount: 82000,
    enrolledCount: 410000,
    topics: ['TypeScript', 'JavaScript', 'Frontend'],
    skills: ['TypeScript', 'JavaScript', 'Generics', 'Decorators'],
    isFree: false,
    price: 0,
    currency: 'USD',
    thumbnailEmoji: '📘',
    url: 'https://udemy.com',
    isImported: false,
    lastUpdated: '2026-02-10',
    certificate: true,
  },
  {
    id: 'ec-018',
    externalId: 'linkedin-dei',
    provider: 'linkedin_learning',
    title: 'Diversity, Inclusion, and Belonging',
    description:
      'Learn about diversity, inclusion, and belonging — how to champion them in your organization.',
    instructor: 'Pat Wadors',
    level: 'all_levels',
    durationHours: 6,
    language: 'English',
    rating: 4.8,
    ratingCount: 32000,
    enrolledCount: 780000,
    topics: ['DEI', 'Inclusion', 'HR'],
    skills: ['Inclusive Leadership', 'Allyship', 'Unconscious Bias', 'DEI Strategy'],
    isFree: false,
    price: 0,
    currency: 'USD',
    thumbnailEmoji: '🌍',
    url: 'https://linkedin.com/learning',
    isImported: false,
    lastUpdated: '2025-12-10',
    certificate: true,
  },
  {
    id: 'ec-019',
    externalId: 'youtube-terraform-yt',
    provider: 'youtube',
    title: 'Terraform Full Course',
    description:
      'Complete Terraform course from fundamentals to advanced topics including AWS, Azure, and GCP provisioning.',
    instructor: 'TechWorld with Nana',
    level: 'intermediate',
    durationHours: 6,
    language: 'English',
    rating: 4.8,
    ratingCount: 15000,
    enrolledCount: 1100000,
    topics: ['Terraform', 'Infrastructure as Code', 'DevOps'],
    skills: ['Terraform', 'Infrastructure as Code', 'AWS', 'GCP'],
    isFree: true,
    thumbnailEmoji: '🏗️',
    url: 'https://youtube.com',
    isImported: false,
    lastUpdated: '2025-08-15',
    certificate: false,
  },
  {
    id: 'ec-020',
    externalId: 'coursera-pm',
    provider: 'coursera',
    title: 'Google Project Management Professional Certificate',
    description:
      'Get the foundational skills that any project manager needs to succeed, from Google.',
    instructor: 'Google',
    level: 'beginner',
    durationHours: 180,
    language: 'English',
    rating: 4.8,
    ratingCount: 98000,
    enrolledCount: 1800000,
    topics: ['Project Management', 'Agile', 'Communication'],
    skills: ['Project Management', 'Agile', 'Risk Management', 'Stakeholder Management'],
    isFree: false,
    price: 49,
    currency: 'USD',
    thumbnailEmoji: '📋',
    url: 'https://coursera.org',
    isImported: false,
    lastUpdated: '2026-02-05',
    certificate: true,
  },
];

const MOCK_ENROLLMENTS: ExternalEnrollment[] = [
  {
    id: 'ee-001',
    employeeId: 'emp-001',
    employeeName: 'Sarah Chen',
    courseId: 'ec-001',
    courseTitle: 'Machine Learning Specialization',
    provider: 'coursera',
    enrolledDate: '2025-11-01',
    completedDate: '2026-01-15',
    progress: 100,
    score: 94,
    timeSpentHours: 82,
  },
  {
    id: 'ee-002',
    employeeId: 'emp-001',
    employeeName: 'Sarah Chen',
    courseId: 'ec-003',
    courseTitle: 'React — The Complete Guide',
    provider: 'udemy',
    enrolledDate: '2026-01-10',
    progress: 65,
    timeSpentHours: 44,
  },
  {
    id: 'ee-003',
    employeeId: 'emp-002',
    employeeName: 'James Liu',
    courseId: 'ec-005',
    courseTitle: 'Transitioning to People Manager',
    provider: 'linkedin_learning',
    enrolledDate: '2026-01-20',
    completedDate: '2026-02-01',
    progress: 100,
    score: 88,
    timeSpentHours: 8,
  },
];

const MOCK_LICENSE_USAGE: LicenseUsage[] = [
  {
    provider: 'coursera',
    providerName: 'Coursera',
    totalLicenses: 200,
    usedLicenses: 142,
    utilizationRate: 71,
    monthlyFee: 3200,
    costPerActiveUser: 22.5,
    expiryDate: '2026-12-31',
    topCourses: [
      { courseId: 'ec-001', title: 'Machine Learning Specialization', enrollments: 48 },
      { courseId: 'ec-020', title: 'Google PM Certificate', enrollments: 34 },
    ],
    byDepartment: [
      { department: 'Engineering', licenses: 65 },
      { department: 'Data', licenses: 42 },
      { department: 'Product', licenses: 35 },
    ],
  },
  {
    provider: 'udemy',
    providerName: 'Udemy Business',
    totalLicenses: 500,
    usedLicenses: 387,
    utilizationRate: 77.4,
    monthlyFee: 1800,
    costPerActiveUser: 4.65,
    expiryDate: '2026-06-30',
    topCourses: [
      { courseId: 'ec-003', title: 'React — The Complete Guide', enrollments: 87 },
      { courseId: 'ec-004', title: 'AWS Solutions Architect', enrollments: 64 },
    ],
    byDepartment: [
      { department: 'Engineering', licenses: 180 },
      { department: 'Product', licenses: 82 },
      { department: 'Operations', licenses: 70 },
    ],
  },
  {
    provider: 'linkedin_learning',
    providerName: 'LinkedIn Learning',
    totalLicenses: 400,
    usedLicenses: 284,
    utilizationRate: 71,
    monthlyFee: 2400,
    costPerActiveUser: 8.45,
    expiryDate: '2026-09-30',
    topCourses: [
      { courseId: 'ec-015', title: 'Communication Foundations', enrollments: 124 },
      { courseId: 'ec-006', title: 'Agile Foundations', enrollments: 98 },
    ],
    byDepartment: [{ department: 'All', licenses: 284 }],
  },
];

// ============================================================================
// SERVICE
// ============================================================================

export class ExternalContentService {
  /** Get all content provider configurations */
  static async getContentProviders(): Promise<ProviderConfig[]> {
    await new Promise((r) => setTimeout(r, 300));
    return [...MOCK_PROVIDERS];
  }

  /** Search external content across providers */
  static async searchExternalContent(filters: SearchFilters): Promise<ExternalCourse[]> {
    await new Promise((r) => setTimeout(r, 400));
    let result = [...MOCK_EXTERNAL_COURSES];
    if (filters.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.topics.some((t) => t.toLowerCase().includes(q)) ||
          c.skills.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (filters.provider && filters.provider !== 'all') {
      result = result.filter((c) => c.provider === filters.provider);
    }
    if (filters.level && filters.level !== 'all') {
      result = result.filter((c) => c.level === filters.level || c.level === 'all_levels');
    }
    if (filters.isFree !== undefined) {
      result = result.filter((c) => c.isFree === filters.isFree);
    }
    if (filters.durationMax) {
      result = result.filter((c) => c.durationHours <= filters.durationMax!);
    }
    return result;
  }

  /** Import a course into company catalog */
  static async importCourse(
    _externalId: string,
    _provider: ContentProvider
  ): Promise<{ success: boolean; courseId: string; message: string }> {
    await new Promise((r) => setTimeout(r, 600));
    return {
      success: true,
      courseId: `imported-${Date.now()}`,
      message: 'Course successfully imported to your company catalog.',
    };
  }

  /** Get sync status for a provider */
  static async getSyncStatus(
    provider: ContentProvider
  ): Promise<{
    provider: ContentProvider;
    status: SyncStatus;
    lastSynced?: string;
    coursesUpdated: number;
  }> {
    await new Promise((r) => setTimeout(r, 200));
    const p = MOCK_PROVIDERS.find((pr) => pr.id === provider);
    return {
      provider,
      status: p?.syncStatus ?? 'never',
      lastSynced: p?.lastSynced,
      coursesUpdated: Math.floor(Math.random() * 50),
    };
  }

  /** Get external enrollments for an employee */
  static async getExternalEnrollments(employeeId: string): Promise<ExternalEnrollment[]> {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_ENROLLMENTS.filter((e) => e.employeeId === employeeId);
  }

  /** Trigger completion sync for a provider */
  static async syncCompletions(
    _provider: ContentProvider
  ): Promise<{ synced: number; errors: number }> {
    await new Promise((r) => setTimeout(r, 1000));
    return { synced: Math.floor(Math.random() * 30) + 10, errors: Math.floor(Math.random() * 3) };
  }

  /** Get license utilization per provider */
  static async getLicenseUsage(provider?: ContentProvider): Promise<LicenseUsage[]> {
    await new Promise((r) => setTimeout(r, 300));
    if (provider) return MOCK_LICENSE_USAGE.filter((l) => l.provider === provider);
    return [...MOCK_LICENSE_USAGE];
  }
}
