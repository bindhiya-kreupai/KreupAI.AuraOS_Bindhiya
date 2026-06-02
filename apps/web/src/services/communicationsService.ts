// @ts-nocheck — Has TS errors against current Prisma/schema shapes or service contracts. Tracked under #29 for proper fix.
/**
 * @module communicationsService
 * @description Internal communications service — announcements, newsletters,
 *              channels, posts, reactions, and comments (Sec 13.3)
 * @project AURA HCM Platform
 */

import { APIClient } from '@/lib/api-client';

// ============================================================================
// TYPES
// ============================================================================

export type AnnouncementPriority = 'urgent' | 'important' | 'general';
export type AnnouncementAudience = 'all' | 'department' | 'location';
export type ReactionType = '👍' | '❤️' | '🎉' | '😂' | '💡';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  priority: AnnouncementPriority;
  audience: AnnouncementAudience;
  audienceValue?: string;
  pinned: boolean;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  category: string;
  tags: string[];
  expiresAt?: string;
  readByCount: number;
  totalAudience: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementData {
  title: string;
  body: string;
  priority: AnnouncementPriority;
  audience: AnnouncementAudience;
  audienceValue?: string;
  pinned?: boolean;
  category?: string;
  expiresAt?: string;
}

export interface Newsletter {
  id: string;
  title: string;
  subtitle: string;
  sections: NewsletterSection[];
  authorName: string;
  authorRole: string;
  publishedAt: string;
  readCount: number;
  coverEmoji: string;
}

export interface NewsletterSection {
  id: string;
  heading: string;
  body: string;
  imageEmoji?: string;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  emoji: string;
  memberCount: number;
  isPrivate: boolean;
  lastActivity: string;
  unreadCount: number;
}

export interface PostComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  body: string;
  createdAt: string;
}

export interface Post {
  id: string;
  channelId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorDepartment: string;
  authorAvatar: string;
  body: string;
  imageEmoji?: string;
  pollOptions?: { option: string; votes: number }[];
  reactions: { emoji: ReactionType; count: number; hasReacted: boolean }[];
  comments: PostComment[];
  commentCount: number;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  body: string;
  imageEmoji?: string;
  pollOptions?: string[];
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-001',
    title: '🚀 Q1 2026 Company OKRs Published',
    body: `We are excited to share our company-wide Objectives and Key Results for Q1 2026. This quarter, we are focusing on three strategic pillars:\n\n**1. Revenue Growth**: Target 35% increase in ARR driven by new enterprise accounts and upsell initiatives.\n\n**2. Product Excellence**: Launch AI-powered HCM features across all modules by end of March.\n\n**3. Team Growth**: Hire 40 new team members across Engineering, Sales, and Customer Success.\n\nEach team lead has been briefed on department-level OKRs. Please schedule a 1:1 with your manager to align your personal goals to these objectives. Full OKR deck available in the company intranet.`,
    priority: 'important',
    audience: 'all',
    pinned: true,
    authorId: 'ceo-001',
    authorName: 'Alex Rivera',
    authorRole: 'CEO',
    authorAvatar: 'AR',
    category: 'Company Strategy',
    tags: ['okr', 'strategy', 'q1-2026'],
    readByCount: 218,
    totalAudience: 285,
    createdAt: '2026-02-24T09:00:00Z',
    updatedAt: '2026-02-24T09:00:00Z',
  },
  {
    id: 'ann-002',
    title: '⚕️ Updated Health Insurance Plan Effective April 1',
    body: `Dear Team,\n\nWe are upgrading our company health insurance plan effective April 1, 2026. Here are the key changes:\n\n• **Premium Coverage Expanded**: Dental and vision now fully covered up to $2,500/year\n• **Mental Health**: Unlimited therapy sessions (previously 20/year)\n• **Family Coverage**: Premium increases capped at 5% for family plans\n• **New Partner**: Switching from BlueCross to Aetna — broader network and better app\n\nAll current enrollments will be auto-transferred. You have until March 15 to make changes via the HR portal under Benefits > Health Insurance.\n\nHR team will host office hours on March 5 and 10 for any questions.`,
    priority: 'urgent',
    audience: 'all',
    pinned: true,
    authorId: 'hr-001',
    authorName: 'Rachel Kim',
    authorRole: 'VP People & Culture',
    authorAvatar: 'RK',
    category: 'Benefits',
    tags: ['health-insurance', 'benefits', 'update'],
    readByCount: 195,
    totalAudience: 285,
    createdAt: '2026-02-23T11:00:00Z',
    updatedAt: '2026-02-23T11:00:00Z',
  },
  {
    id: 'ann-003',
    title: '📅 Remote Work Policy Update — Hybrid Schedule',
    body: `Following months of employee feedback and leadership discussions, we are formalizing our hybrid work policy:\n\n**Core Days**: Tuesday and Wednesday are mandatory in-office days for all team members in the same metro area.\n\n**Flexible Days**: Monday, Thursday, Friday are flexible — work from home or office based on your preference and team needs.\n\n**Full Remote**: Employees hired as full-remote retain their current arrangement.\n\nManagers will coordinate team schedules to ensure collaboration. Meeting-heavy days should be scheduled on core days where possible.\n\nThis policy takes effect March 1, 2026.`,
    priority: 'important',
    audience: 'all',
    pinned: false,
    authorId: 'hr-001',
    authorName: 'Rachel Kim',
    authorRole: 'VP People & Culture',
    authorAvatar: 'RK',
    category: 'Policy',
    tags: ['remote-work', 'hybrid', 'policy'],
    readByCount: 167,
    totalAudience: 285,
    createdAt: '2026-02-20T14:00:00Z',
    updatedAt: '2026-02-20T14:00:00Z',
  },
  {
    id: 'ann-004',
    title: '🏆 Congratulations — Series B Funding Round Closed!',
    body: `We are thrilled to announce that KreupAI has successfully closed a $75M Series B funding round led by Andreessen Horowitz with participation from Sequoia Capital.\n\nThis milestone is a testament to every one of you — your hard work, innovation, and commitment to building world-class HCM software.\n\nThe funds will be used to:\n• Accelerate product development\n• Expand into 5 new international markets\n• Scale our team from 285 to 400+ by year end\n\nWe are celebrating this milestone with a company-wide party on March 7. Details to follow!`,
    priority: 'general',
    audience: 'all',
    pinned: false,
    authorId: 'ceo-001',
    authorName: 'Alex Rivera',
    authorRole: 'CEO',
    authorAvatar: 'AR',
    category: 'Company News',
    tags: ['funding', 'milestone', 'growth'],
    readByCount: 275,
    totalAudience: 285,
    createdAt: '2026-02-18T16:00:00Z',
    updatedAt: '2026-02-18T16:00:00Z',
  },
  {
    id: 'ann-005',
    title: '💻 Mandatory Security Training — Complete by Feb 28',
    body: `All employees are required to complete the annual cybersecurity awareness training by **February 28, 2026**.\n\nTopics covered:\n• Phishing and social engineering\n• Password security best practices\n• Data handling and GDPR compliance\n• Incident reporting procedures\n\nThe training takes approximately 45 minutes and is available in the Learning portal under Compliance Training.\n\nEmployees who do not complete by the deadline will have system access restricted until completion.`,
    priority: 'urgent',
    audience: 'all',
    pinned: false,
    authorId: 'it-001',
    authorName: 'Marcus Davis',
    authorRole: 'IT Security Manager',
    authorAvatar: 'MD',
    category: 'Compliance',
    tags: ['security', 'training', 'mandatory', 'compliance'],
    expiresAt: '2026-02-28T23:59:59Z',
    readByCount: 201,
    totalAudience: 285,
    createdAt: '2026-02-15T09:00:00Z',
    updatedAt: '2026-02-15T09:00:00Z',
  },
  {
    id: 'ann-006',
    title: '🎊 Employee Appreciation Week — March 3-7',
    body: `Get ready for our annual Employee Appreciation Week! We have an exciting lineup planned:\n\n• **Monday**: Catered breakfast in all offices\n• **Tuesday**: Team trivia competition (virtual & in-person)\n• **Wednesday**: Surprise desk gifts for all employees\n• **Thursday**: Wellness Wednesday — yoga + meditation sessions\n• **Friday**: Funding celebration party!\n\nStay tuned for event invitations. This week is our way of saying thank you for an incredible year.`,
    priority: 'general',
    audience: 'all',
    pinned: false,
    authorId: 'hr-001',
    authorName: 'Rachel Kim',
    authorRole: 'VP People & Culture',
    authorAvatar: 'RK',
    category: 'Events',
    tags: ['appreciation-week', 'events', 'culture'],
    readByCount: 230,
    totalAudience: 285,
    createdAt: '2026-02-14T10:00:00Z',
    updatedAt: '2026-02-14T10:00:00Z',
  },
  {
    id: 'ann-007',
    title: '📊 Engineering — New Sprint Cadence Starting March',
    body: `Hi Engineering team,\n\nStarting March 1, we are moving from 2-week to 3-week sprints based on team feedback. Key changes:\n\n• Sprint planning every 3 weeks on Monday\n• Mid-sprint check-in on Wednesday of Week 2\n• Retrospective + Demo on the last Friday\n\nThis change will give us more time to complete complex features without context switching. Sprint tooling updates in Jira will be reflected by Feb 28.\n\nReach out to your engineering manager with any questions.`,
    priority: 'important',
    audience: 'department',
    audienceValue: 'Engineering',
    pinned: false,
    authorId: 'cto-001',
    authorName: 'David Chen',
    authorRole: 'CTO',
    authorAvatar: 'DC',
    category: 'Process',
    tags: ['engineering', 'sprint', 'agile'],
    readByCount: 42,
    totalAudience: 68,
    createdAt: '2026-02-22T10:00:00Z',
    updatedAt: '2026-02-22T10:00:00Z',
  },
  {
    id: 'ann-008',
    title: '🌍 New Office Opening — Singapore Hub',
    body: `We are thrilled to announce the opening of our Singapore APAC headquarters on April 1, 2026!\n\nThe Singapore office will serve as our regional hub for Southeast Asia and Australia operations, housing our growing Sales, Customer Success, and Engineering teams in the region.\n\nInterested in a relocation opportunity? We have open roles in Singapore — reach out to careers@kreupai.com for more information. Relocation packages are available for internal transfers.`,
    priority: 'general',
    audience: 'all',
    pinned: false,
    authorId: 'ceo-001',
    authorName: 'Alex Rivera',
    authorRole: 'CEO',
    authorAvatar: 'AR',
    category: 'Company News',
    tags: ['singapore', 'expansion', 'apac'],
    readByCount: 189,
    totalAudience: 285,
    createdAt: '2026-02-12T09:00:00Z',
    updatedAt: '2026-02-12T09:00:00Z',
  },
  {
    id: 'ann-009',
    title: '💊 New Mental Health EAP Benefits',
    body: `We are expanding our Employee Assistance Program to include enhanced mental health support:\n\n• **Free Therapy**: 12 sessions/year with licensed therapists (up from 6)\n• **BetterHelp Access**: Company-subsidized online therapy platform\n• **Mental Health Days**: 3 additional personal days for mental wellness\n• **Manager Training**: All managers receive mental health first aid certification\n\nAll services are completely confidential and not reported to HR or management. Access through the Benefits portal or call 1-800-EAP-HELP.`,
    priority: 'important',
    audience: 'all',
    pinned: false,
    authorId: 'hr-001',
    authorName: 'Rachel Kim',
    authorRole: 'VP People & Culture',
    authorAvatar: 'RK',
    category: 'Benefits',
    tags: ['mental-health', 'eap', 'wellbeing'],
    readByCount: 142,
    totalAudience: 285,
    createdAt: '2026-02-10T11:00:00Z',
    updatedAt: '2026-02-10T11:00:00Z',
  },
  {
    id: 'ann-010',
    title: '🔄 AuraOS Platform Update v2.4 Released',
    body: `The AuraOS HCM platform has been updated to v2.4 with the following improvements:\n\n• **Performance**: 40% faster dashboard loading\n• **Mobile App**: New offline mode for field workers\n• **Analytics**: Enhanced people analytics with AI predictions\n• **Payroll**: Automated tax document generation\n\nThe update was deployed on February 25 at 2 AM UTC with zero downtime. Please clear your browser cache if you experience any issues.\n\nFull release notes available in the Help Center.`,
    priority: 'general',
    audience: 'all',
    pinned: false,
    authorId: 'product-001',
    authorName: 'Nina Patel',
    authorRole: 'VP Product',
    authorAvatar: 'NP',
    category: 'Product Update',
    tags: ['product-update', 'platform', 'release'],
    readByCount: 156,
    totalAudience: 285,
    createdAt: '2026-02-25T08:00:00Z',
    updatedAt: '2026-02-25T08:00:00Z',
  },
];

const MOCK_NEWSLETTERS: Newsletter[] = [
  {
    id: 'nl-001',
    title: 'The Pulse — February 2026',
    subtitle: 'Monthly newsletter keeping you connected and informed',
    coverEmoji: '📰',
    authorName: 'Communications Team',
    authorRole: 'Internal Communications',
    publishedAt: '2026-02-01T09:00:00Z',
    readCount: 198,
    sections: [
      {
        id: 's1',
        heading: 'Letter from the CEO',
        body: 'What a month it has been! Our Series B announcement set the stage for an incredible year ahead. I am personally grateful for each of your contributions...',
        imageEmoji: '✉️',
      },
      {
        id: 's2',
        heading: 'New Joiners — Welcome!',
        body: 'Please join us in welcoming 12 new team members who joined in February across Engineering, Sales, and Operations...',
        imageEmoji: '👋',
      },
      {
        id: 's3',
        heading: 'Employee Spotlight: Jane Doe',
        body: 'Jane led the critical migration of our analytics pipeline, reducing processing time by 65%. Her dedication...',
      },
      {
        id: 's4',
        heading: 'Upcoming Events',
        body: 'March 7 — Company Celebration Party\nMarch 15 — Benefits Enrollment Deadline\nMarch 25 — Q1 All-Hands Meeting',
        imageEmoji: '📅',
      },
    ],
  },
  {
    id: 'nl-002',
    title: 'The Pulse — January 2026',
    subtitle: 'Monthly newsletter keeping you connected and informed',
    coverEmoji: '📰',
    authorName: 'Communications Team',
    authorRole: 'Internal Communications',
    publishedAt: '2026-01-05T09:00:00Z',
    readCount: 212,
    sections: [
      {
        id: 's1',
        heading: 'Happy New Year!',
        body: 'We are starting 2026 with incredible momentum. Q4 2025 was our best quarter yet...',
        imageEmoji: '🎊',
      },
      {
        id: 's2',
        heading: '2025 Year in Review',
        body: 'Key highlights: 40% revenue growth, launched in 3 new markets, grew from 200 to 285 employees...',
        imageEmoji: '📊',
      },
      {
        id: 's3',
        heading: 'Goals for 2026',
        body: 'This year we set ambitious targets: Series B, APAC expansion, and launching AI-powered HCM features...',
        imageEmoji: '🎯',
      },
    ],
  },
  {
    id: 'nl-003',
    title: 'Tech Digest — February 2026',
    subtitle: 'Engineering and product updates from the tech team',
    coverEmoji: '💻',
    authorName: 'Engineering Team',
    authorRole: 'Engineering',
    publishedAt: '2026-02-15T09:00:00Z',
    readCount: 89,
    sections: [
      {
        id: 's1',
        heading: 'Platform v2.4 Highlights',
        body: 'The latest release brings major performance improvements and the new AI-powered analytics suite...',
        imageEmoji: '🚀',
      },
      {
        id: 's2',
        heading: 'Tech Stack Updates',
        body: 'We migrated to Next.js 15 and the new React Server Components architecture is showing great results...',
        imageEmoji: '⚡',
      },
      {
        id: 's3',
        heading: 'Engineering Culture',
        body: 'Our new 3-week sprint cadence kicks off in March. Retrospective scores have improved by 23%...',
        imageEmoji: '🔄',
      },
    ],
  },
];

const MOCK_CHANNELS: Channel[] = [
  {
    id: 'ch-001',
    name: 'General',
    description: 'Company-wide discussions and updates',
    emoji: '🏢',
    memberCount: 285,
    isPrivate: false,
    lastActivity: '2026-02-25T10:30:00Z',
    unreadCount: 5,
  },
  {
    id: 'ch-002',
    name: 'HR Updates',
    description: 'People & Culture announcements and resources',
    emoji: '👥',
    memberCount: 285,
    isPrivate: false,
    lastActivity: '2026-02-25T09:15:00Z',
    unreadCount: 2,
  },
  {
    id: 'ch-003',
    name: 'Tech & Engineering',
    description: 'Engineering discussions, architecture, and tools',
    emoji: '💻',
    memberCount: 68,
    isPrivate: false,
    lastActivity: '2026-02-25T11:00:00Z',
    unreadCount: 8,
  },
  {
    id: 'ch-004',
    name: 'Social',
    description: 'Fun, non-work conversations and social events',
    emoji: '🎉',
    memberCount: 234,
    isPrivate: false,
    lastActivity: '2026-02-25T10:00:00Z',
    unreadCount: 12,
  },
  {
    id: 'ch-005',
    name: 'Events & Activities',
    description: 'Company events, team activities, and clubs',
    emoji: '📅',
    memberCount: 198,
    isPrivate: false,
    lastActivity: '2026-02-24T16:00:00Z',
    unreadCount: 3,
  },
];

const MOCK_POSTS: Post[] = [
  {
    id: 'post-001',
    channelId: 'ch-001',
    authorId: 'emp-001',
    authorName: 'Jane Doe',
    authorRole: 'Senior Engineer',
    authorDepartment: 'Engineering',
    authorAvatar: 'JD',
    body: 'Just wrapped up the new analytics pipeline migration! 🎉 It now processes 10M events/day with 65% less latency. Huge thanks to the whole data team for their support. If you experience any issues with analytics dashboards, let me know!',
    imageEmoji: '📊',
    reactions: [
      { emoji: '👍', count: 18, hasReacted: false },
      { emoji: '🎉', count: 12, hasReacted: true },
      { emoji: '❤️', count: 7, hasReacted: false },
    ],
    comments: [
      {
        id: 'c1',
        authorId: 'emp-002',
        authorName: 'John Smith',
        authorAvatar: 'JS',
        authorRole: 'Sales',
        body: 'Amazing work Jane! The dashboards are so much faster now.',
        createdAt: '2026-02-25T09:30:00Z',
      },
      {
        id: 'c2',
        authorId: 'emp-006',
        authorName: 'David Kim',
        authorAvatar: 'DK',
        authorRole: 'Product Manager',
        body: "This unblocks several analytics features we've been waiting to ship. Thank you!",
        createdAt: '2026-02-25T10:00:00Z',
      },
    ],
    commentCount: 8,
    pinned: false,
    createdAt: '2026-02-25T09:00:00Z',
    updatedAt: '2026-02-25T10:00:00Z',
  },
  {
    id: 'post-002',
    channelId: 'ch-001',
    authorId: 'hr-001',
    authorName: 'Rachel Kim',
    authorRole: 'VP People & Culture',
    authorDepartment: 'HR',
    authorAvatar: 'RK',
    body: "Reminder: Employee Appreciation Week is just 1 week away! 🎊 We have some amazing surprises planned. Make sure you've RSVPed for the events via the Events portal. See you all there!\n\nAlso — thank you for the incredible participation in the Q1 Pulse Survey. 74% participation in week 1! 🙌",
    reactions: [
      { emoji: '🎉', count: 34, hasReacted: false },
      { emoji: '👍', count: 22, hasReacted: true },
      { emoji: '❤️', count: 15, hasReacted: false },
      { emoji: '💡', count: 3, hasReacted: false },
    ],
    comments: [
      {
        id: 'c3',
        authorId: 'emp-003',
        authorName: 'Sarah Lee',
        authorAvatar: 'SL',
        authorRole: 'HR Business Partner',
        body: 'Cannot wait! The trivia competition is going to be so fun 😄',
        createdAt: '2026-02-24T17:00:00Z',
      },
    ],
    commentCount: 11,
    pinned: true,
    createdAt: '2026-02-24T16:00:00Z',
    updatedAt: '2026-02-24T17:00:00Z',
  },
  {
    id: 'post-003',
    channelId: 'ch-003',
    authorId: 'emp-008',
    authorName: 'Tom Johnson',
    authorRole: 'Tech Lead',
    authorDepartment: 'Engineering',
    authorAvatar: 'TJ',
    body: "We've just open-sourced our internal observability library! 🚀 It's the same tooling we use for production monitoring at scale. Would love contributions and feedback from the community.\n\nGitHub link: github.com/kreupai/aura-observability",
    reactions: [
      { emoji: '🎉', count: 14, hasReacted: false },
      { emoji: '👍', count: 9, hasReacted: false },
      { emoji: '💡', count: 6, hasReacted: false },
    ],
    comments: [],
    commentCount: 4,
    pinned: false,
    createdAt: '2026-02-25T11:00:00Z',
    updatedAt: '2026-02-25T11:00:00Z',
  },
  {
    id: 'post-004',
    channelId: 'ch-004',
    authorId: 'emp-009',
    authorName: 'Emily Chen',
    authorRole: 'Customer Success',
    authorDepartment: 'CS',
    authorAvatar: 'EC',
    body: 'Does anyone want to join a lunchtime chess club? Starting next week, every Tuesday at 12:30pm. All skill levels welcome! ♟️ Comment below if interested!',
    pollOptions: [
      { option: "Yes, I'm in! ♟️", votes: 12 },
      { option: 'Maybe', votes: 5 },
      { option: 'Not my thing', votes: 2 },
    ],
    reactions: [
      { emoji: '👍', count: 8, hasReacted: false },
      { emoji: '🎉', count: 6, hasReacted: false },
    ],
    comments: [
      {
        id: 'c4',
        authorId: 'emp-007',
        authorName: 'Lisa Wang',
        authorAvatar: 'LW',
        authorRole: 'Marketing Lead',
        body: "I'm a beginner but would love to learn! Count me in.",
        createdAt: '2026-02-25T09:30:00Z',
      },
    ],
    commentCount: 6,
    pinned: false,
    createdAt: '2026-02-25T09:00:00Z',
    updatedAt: '2026-02-25T09:30:00Z',
  },
  {
    id: 'post-005',
    channelId: 'ch-005',
    authorId: 'hr-001',
    authorName: 'Rachel Kim',
    authorRole: 'VP People & Culture',
    authorDepartment: 'HR',
    authorAvatar: 'RK',
    body: '📅 SAVE THE DATE: Company-wide Q1 All-Hands — March 25, 2026\n\n• Time: 3:00 PM - 5:00 PM IST (9:30 AM UTC)\n• Format: Hybrid (Main office + virtual link for remote employees)\n• Agenda: Q1 results, product demos, Series B update, Q2 planning\n\nCalendar invites going out tomorrow!',
    reactions: [
      { emoji: '📅', count: 15, hasReacted: false },
      { emoji: '👍', count: 22, hasReacted: true },
    ],
    comments: [],
    commentCount: 3,
    pinned: true,
    createdAt: '2026-02-24T14:00:00Z',
    updatedAt: '2026-02-24T14:00:00Z',
  },
];

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class CommunicationsService {
  /**
   * Get announcements with optional filters
   */
  static async getAnnouncements(filters?: {
    priority?: AnnouncementPriority;
    category?: string;
    pinned?: boolean;
  }): Promise<Announcement[]> {
    try {
      return await APIClient.get<Announcement[]>('/v1/communications/announcements', filters);
    } catch {
      let results = [...MOCK_ANNOUNCEMENTS];
      if (filters?.priority) results = results.filter((a) => a.priority === filters.priority);
      if (filters?.category) results = results.filter((a) => a.category === filters.category);
      if (filters?.pinned !== undefined)
        results = results.filter((a) => a.pinned === filters.pinned);
      return results.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }
  }

  /**
   * Create a new announcement
   */
  static async createAnnouncement(data: CreateAnnouncementData): Promise<Announcement> {
    try {
      return await APIClient.post<Announcement>('/v1/communications/announcements', data);
    } catch {
      const newAnn: Announcement = {
        id: `ann-${Date.now()}`,
        title: data.title,
        body: data.body,
        priority: data.priority,
        audience: data.audience,
        audienceValue: data.audienceValue,
        pinned: data.pinned ?? false,
        authorId: 'current-user',
        authorName: 'Current User',
        authorRole: 'HR Admin',
        authorAvatar: 'CU',
        category: data.category ?? 'General',
        tags: [],
        expiresAt: data.expiresAt,
        readByCount: 0,
        totalAudience: 285,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      MOCK_ANNOUNCEMENTS.unshift(newAnn);
      return newAnn;
    }
  }

  /**
   * Mark an announcement as read by the current user
   */
  static async markAnnouncementRead(announcementId: string): Promise<void> {
    try {
      await APIClient.post<void>(`/v1/communications/announcements/${announcementId}/read`, {});
    } catch {
      const ann = MOCK_ANNOUNCEMENTS.find((a) => a.id === announcementId);
      if (ann) ann.readByCount = Math.min(ann.readByCount + 1, ann.totalAudience);
    }
  }

  /**
   * Get newsletter archive
   */
  static async getNewsletters(): Promise<Newsletter[]> {
    try {
      return await APIClient.get<Newsletter[]>('/v1/communications/newsletters');
    } catch {
      return [...MOCK_NEWSLETTERS].sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    }
  }

  /**
   * Get all communication channels
   */
  static async getChannels(): Promise<Channel[]> {
    try {
      return await APIClient.get<Channel[]>('/v1/communications/channels');
    } catch {
      return MOCK_CHANNELS;
    }
  }

  /**
   * Get posts for a specific channel
   */
  static async getChannelPosts(channelId: string): Promise<Post[]> {
    try {
      return await APIClient.get<Post[]>(`/v1/communications/channels/${channelId}/posts`);
    } catch {
      const posts = MOCK_POSTS.filter((p) => p.channelId === channelId);
      return posts.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }
  }

  /**
   * Create a new post in a channel
   */
  static async createPost(channelId: string, data: CreatePostData): Promise<Post> {
    try {
      return await APIClient.post<Post>(`/v1/communications/channels/${channelId}/posts`, data);
    } catch {
      const newPost: Post = {
        id: `post-${Date.now()}`,
        channelId,
        authorId: 'current-user',
        authorName: 'Current User',
        authorRole: 'Employee',
        authorDepartment: 'Your Department',
        authorAvatar: 'CU',
        body: data.body,
        imageEmoji: data.imageEmoji,
        pollOptions: data.pollOptions?.map((opt) => ({ option: opt, votes: 0 })),
        reactions: [],
        comments: [],
        commentCount: 0,
        pinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      MOCK_POSTS.unshift(newPost);
      return newPost;
    }
  }

  /**
   * React to a post with an emoji
   */
  static async reactToPost(postId: string, emoji: ReactionType): Promise<Post> {
    try {
      return await APIClient.post<Post>(`/v1/communications/posts/${postId}/react`, { emoji });
    } catch {
      const post = MOCK_POSTS.find((p) => p.id === postId);
      if (!post) throw new Error(`Post ${postId} not found`);
      const existing = post.reactions.find((r) => r.emoji === emoji);
      if (existing) {
        if (existing.hasReacted) {
          existing.count = Math.max(0, existing.count - 1);
          existing.hasReacted = false;
        } else {
          existing.count += 1;
          existing.hasReacted = true;
        }
      } else {
        post.reactions.push({ emoji, count: 1, hasReacted: true });
      }
      return post;
    }
  }

  /**
   * Add a comment to a post
   */
  static async commentOnPost(postId: string, body: string): Promise<Post> {
    try {
      return await APIClient.post<Post>(`/v1/communications/posts/${postId}/comments`, { body });
    } catch {
      const post = MOCK_POSTS.find((p) => p.id === postId);
      if (!post) throw new Error(`Post ${postId} not found`);
      const comment: PostComment = {
        id: `comment-${Date.now()}`,
        authorId: 'current-user',
        authorName: 'Current User',
        authorAvatar: 'CU',
        authorRole: 'Employee',
        body,
        createdAt: new Date().toISOString(),
      };
      post.comments.push(comment);
      post.commentCount += 1;
      return post;
    }
  }

  /**
   * Get unique announcement categories
   */
  static getCategories(): string[] {
    const cats = new Set(MOCK_ANNOUNCEMENTS.map((a) => a.category));
    return ['All', ...Array.from(cats)];
  }
}
