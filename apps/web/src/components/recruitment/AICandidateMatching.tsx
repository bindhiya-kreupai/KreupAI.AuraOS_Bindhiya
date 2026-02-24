/**
 * @module AICandidateMatching
 * @description AI-powered candidate matching dashboard showing ranked candidates
 *              with match scores, skill breakdowns, pros/cons, and interview suggestions
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Brain,
  Target,
  ChevronDown,
  ChevronUp,
  Search,
  Briefcase,
  GraduationCap,
  Wrench,
  Users,
  Heart,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Award,
  ArrowUpDown,
  BarChart3,
  Mail,
  Phone,
  MapPin,
  Calendar,
  MessageSquare,
  Eye,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Sparkles,
  Globe,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────────

type Recommendation = 'STRONG_YES' | 'YES' | 'MAYBE' | 'NO';

type SortField = 'ranking' | 'matchScore' | 'skillMatch' | 'experienceMatch' | 'name';

interface MatchCategoryDetail {
  category: string;
  weight: number;
  score: number;
  matches: string[];
  gaps: string[];
}

interface RankedCandidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  currentRole: string;
  currentCompany: string;
  experienceYears: number;
  education: string;
  appliedDate: string;
  avatarInitials: string;
  matchScore: number;
  ranking: number;
  skillMatch: number;
  experienceMatch: number;
  educationMatch: number;
  cultureFit: number;
  matchDetails: MatchCategoryDetail[];
  pros: string[];
  cons: string[];
  recommendation: Recommendation;
  interviewQuestions: string[];
  topSkills: string[];
  missingSkills: string[];
}

interface JobContext {
  id: string;
  title: string;
  department: string;
  location: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceMin: number;
  experienceMax: number;
  education: string;
}

interface AICandidateMatchingProps {
  candidates: RankedCandidate[];
  job: JobContext;
}

// ── Config ───────────────────────────────────────────────────────────────────────

const RECOMMENDATION_CONFIG: Record<
  Recommendation,
  { label: string; color: string; bg: string; icon: LucideIcon; border: string }
> = {
  STRONG_YES: {
    label: 'Strong Yes',
    color: 'text-neural-mint',
    bg: 'bg-neural-mint/10',
    icon: CheckCircle2,
    border: 'border-neural-mint/30',
  },
  YES: {
    label: 'Yes',
    color: 'text-celestial-indigo',
    bg: 'bg-celestial-indigo/10',
    icon: ThumbsUp,
    border: 'border-celestial-indigo/30',
  },
  MAYBE: {
    label: 'Maybe',
    color: 'text-sunset-amber',
    bg: 'bg-sunset-amber/10',
    icon: HelpCircle,
    border: 'border-sunset-amber/30',
  },
  NO: {
    label: 'No',
    color: 'text-coral-alert',
    bg: 'bg-coral-alert/10',
    icon: ThumbsDown,
    border: 'border-coral-alert/30',
  },
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'Required Skills': Wrench,
  'Preferred Skills': Zap,
  Experience: Briefcase,
  Education: GraduationCap,
  Certifications: Award,
  'Culture Fit': Heart,
  Languages: Globe,
};

// ── Helpers ──────────────────────────────────────────────────────────────────────

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-neural-mint';
  if (score >= 60) return 'text-celestial-indigo';
  if (score >= 40) return 'text-sunset-amber';
  return 'text-coral-alert';
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-neural-mint';
  if (score >= 60) return 'bg-celestial-indigo';
  if (score >= 40) return 'bg-sunset-amber';
  return 'bg-coral-alert';
}

function getScoreRingColor(score: number): string {
  if (score >= 80) return '#00D4AA';
  if (score >= 60) return '#4B3BF5';
  if (score >= 40) return '#F59E0B';
  return '#EF4444';
}

function getRankBadge(rank: number): { bg: string; text: string } {
  if (rank === 1)
    return { bg: 'bg-gradient-to-r from-yellow-400 to-amber-500', text: 'text-white' };
  if (rank === 2) return { bg: 'bg-gradient-to-r from-slate-300 to-slate-400', text: 'text-white' };
  if (rank === 3) return { bg: 'bg-gradient-to-r from-amber-600 to-amber-700', text: 'text-white' };
  return { bg: 'bg-cloud dark:bg-nebula-purple/20', text: 'text-silver-mist' };
}

// ── Mock Data ────────────────────────────────────────────────────────────────────

export const MOCK_JOB: JobContext = {
  id: 'job-sse-1',
  title: 'Senior Software Engineer',
  department: 'Engineering',
  location: 'San Francisco, CA',
  requiredSkills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Kubernetes'],
  preferredSkills: ['GraphQL', 'Redis', 'Terraform', 'Python'],
  experienceMin: 5,
  experienceMax: 10,
  education: "Bachelor's in Computer Science",
};

export const MOCK_CANDIDATES: RankedCandidate[] = [
  {
    id: 'mc-1',
    name: 'Sarah Chen',
    email: 'sarah.chen@email.com',
    phone: '+1 (415) 555-0192',
    location: 'San Francisco, CA',
    currentRole: 'Staff Engineer',
    currentCompany: 'TechCorp Inc.',
    experienceYears: 8,
    education: 'M.S. Computer Science, Stanford',
    appliedDate: '2026-02-15',
    avatarInitials: 'SC',
    matchScore: 94,
    ranking: 1,
    skillMatch: 96,
    experienceMatch: 92,
    educationMatch: 100,
    cultureFit: 88,
    matchDetails: [
      {
        category: 'Required Skills',
        weight: 0.3,
        score: 96,
        matches: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Kubernetes'],
        gaps: [],
      },
      {
        category: 'Preferred Skills',
        weight: 0.15,
        score: 75,
        matches: ['GraphQL', 'Redis', 'Python'],
        gaps: ['Terraform'],
      },
      {
        category: 'Experience',
        weight: 0.25,
        score: 92,
        matches: ['8 years total', 'Distributed systems at scale', 'Led teams of 5+'],
        gaps: [],
      },
      {
        category: 'Education',
        weight: 0.15,
        score: 100,
        matches: ['M.S. Computer Science, Stanford'],
        gaps: [],
      },
      {
        category: 'Culture Fit',
        weight: 0.15,
        score: 88,
        matches: ['Open source contributor', 'Mentoring experience', 'Conference speaker'],
        gaps: [],
      },
    ],
    pros: [
      'Expert in all required technologies',
      '8 years of relevant experience',
      'Strong leadership and mentoring background',
      'Distributed systems expertise',
    ],
    cons: ['No Terraform experience', 'May be overqualified for some tasks'],
    recommendation: 'STRONG_YES',
    interviewQuestions: [
      'Describe your experience scaling microservices with Kubernetes.',
      'How do you approach mentoring junior engineers?',
      'Walk us through a distributed systems challenge you solved.',
    ],
    topSkills: ['TypeScript', 'React', 'Kubernetes', 'GraphQL', 'PostgreSQL'],
    missingSkills: ['Terraform'],
  },
  {
    id: 'mc-2',
    name: 'Marcus Johnson',
    email: 'marcus.j@outlook.com',
    phone: '+1 (212) 555-0847',
    location: 'New York, NY (Open to relocation)',
    currentRole: 'Senior Software Engineer',
    currentCompany: 'FinTech Solutions',
    experienceYears: 6,
    education: 'B.S. Computer Science, MIT',
    appliedDate: '2026-02-17',
    avatarInitials: 'MJ',
    matchScore: 85,
    ranking: 2,
    skillMatch: 88,
    experienceMatch: 84,
    educationMatch: 90,
    cultureFit: 78,
    matchDetails: [
      {
        category: 'Required Skills',
        weight: 0.3,
        score: 88,
        matches: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
        gaps: ['Kubernetes (learning)'],
      },
      {
        category: 'Preferred Skills',
        weight: 0.15,
        score: 50,
        matches: ['Redis', 'Python'],
        gaps: ['GraphQL', 'Terraform'],
      },
      {
        category: 'Experience',
        weight: 0.25,
        score: 84,
        matches: ['6 years total', 'Financial systems', 'API design'],
        gaps: ['No team lead experience'],
      },
      {
        category: 'Education',
        weight: 0.15,
        score: 90,
        matches: ['B.S. Computer Science, MIT'],
        gaps: [],
      },
      {
        category: 'Culture Fit',
        weight: 0.15,
        score: 78,
        matches: ['Hackathon winner', 'Blog author'],
        gaps: ['No mentoring experience listed'],
      },
    ],
    pros: [
      'Strong in 4 of 5 required skills',
      'MIT CS degree',
      'FinTech domain expertise',
      'Active in tech community',
    ],
    cons: [
      'Kubernetes experience is limited',
      'No team leadership experience',
      'May require relocation support',
    ],
    recommendation: 'YES',
    interviewQuestions: [
      'How are you progressing with Kubernetes? What projects have you used it in?',
      'Tell us about your API design philosophy.',
      'How would you handle the transition to a leadership role?',
    ],
    topSkills: ['TypeScript', 'React', 'Node.js', 'Redis', 'Python'],
    missingSkills: ['Kubernetes', 'GraphQL', 'Terraform'],
  },
  {
    id: 'mc-3',
    name: 'Priya Patel',
    email: 'priya.p@gmail.com',
    phone: '+1 (650) 555-0391',
    location: 'San Jose, CA',
    currentRole: 'Software Engineer II',
    currentCompany: 'CloudBase',
    experienceYears: 4,
    education: 'B.S. Computer Engineering, UC Berkeley',
    appliedDate: '2026-02-18',
    avatarInitials: 'PP',
    matchScore: 72,
    ranking: 3,
    skillMatch: 76,
    experienceMatch: 64,
    educationMatch: 85,
    cultureFit: 72,
    matchDetails: [
      {
        category: 'Required Skills',
        weight: 0.3,
        score: 80,
        matches: ['TypeScript', 'React', 'Node.js', 'Kubernetes'],
        gaps: ['PostgreSQL (uses MySQL)'],
      },
      {
        category: 'Preferred Skills',
        weight: 0.15,
        score: 50,
        matches: ['Terraform', 'Python'],
        gaps: ['GraphQL', 'Redis'],
      },
      {
        category: 'Experience',
        weight: 0.25,
        score: 64,
        matches: ['4 years total', 'Cloud-native development'],
        gaps: ['Below 5-year minimum', 'No senior-level experience'],
      },
      {
        category: 'Education',
        weight: 0.15,
        score: 85,
        matches: ['B.S. Computer Engineering, UC Berkeley'],
        gaps: [],
      },
      {
        category: 'Culture Fit',
        weight: 0.15,
        score: 72,
        matches: ['Open source projects', 'Women in Tech advocate'],
        gaps: [],
      },
    ],
    pros: [
      'Strong cloud-native and Kubernetes experience',
      'Terraform knowledge (preferred skill)',
      'Local candidate — no relocation needed',
      'High growth trajectory',
    ],
    cons: [
      '1 year below minimum experience requirement',
      'No PostgreSQL experience (uses MySQL)',
      'Has not held a senior-level title yet',
    ],
    recommendation: 'MAYBE',
    interviewQuestions: [
      'How quickly could you ramp up on PostgreSQL coming from MySQL?',
      'What senior-level responsibilities have you taken on?',
      'Describe a complex Kubernetes deployment you managed.',
    ],
    topSkills: ['TypeScript', 'React', 'Kubernetes', 'Terraform', 'Python'],
    missingSkills: ['PostgreSQL', 'GraphQL', 'Redis'],
  },
  {
    id: 'mc-4',
    name: 'David Kim',
    email: 'dkim@tech.io',
    phone: '+1 (408) 555-0935',
    location: 'Seattle, WA',
    currentRole: 'Senior Full-Stack Developer',
    currentCompany: 'DataStream',
    experienceYears: 7,
    education: 'M.S. Software Engineering, CMU',
    appliedDate: '2026-02-19',
    avatarInitials: 'DK',
    matchScore: 81,
    ranking: 4,
    skillMatch: 84,
    experienceMatch: 80,
    educationMatch: 95,
    cultureFit: 70,
    matchDetails: [
      {
        category: 'Required Skills',
        weight: 0.3,
        score: 84,
        matches: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
        gaps: ['Kubernetes (Docker only)'],
      },
      {
        category: 'Preferred Skills',
        weight: 0.15,
        score: 75,
        matches: ['GraphQL', 'Redis', 'Python'],
        gaps: ['Terraform'],
      },
      {
        category: 'Experience',
        weight: 0.25,
        score: 80,
        matches: ['7 years total', 'Full-stack depth', 'Data pipeline experience'],
        gaps: ['No infrastructure/DevOps experience'],
      },
      {
        category: 'Education',
        weight: 0.15,
        score: 95,
        matches: ['M.S. Software Engineering, CMU'],
        gaps: [],
      },
      {
        category: 'Culture Fit',
        weight: 0.15,
        score: 70,
        matches: ['Patent holder', 'Technical writer'],
        gaps: ['No mentoring listed'],
      },
    ],
    pros: [
      'Excellent full-stack depth',
      'CMU masters degree',
      'Strong in GraphQL and Redis',
      'Data pipeline expertise',
    ],
    cons: [
      'No Kubernetes experience — only Docker',
      'Would need relocation from Seattle',
      'No infrastructure/DevOps background',
    ],
    recommendation: 'YES',
    interviewQuestions: [
      'How would you bridge the gap from Docker to Kubernetes?',
      'Tell us about your data pipeline architecture experience.',
      'How do you stay current with infrastructure tooling?',
    ],
    topSkills: ['TypeScript', 'React', 'GraphQL', 'PostgreSQL', 'Node.js'],
    missingSkills: ['Kubernetes', 'Terraform'],
  },
  {
    id: 'mc-5',
    name: 'Elena Rodriguez',
    email: 'elena.r@yahoo.com',
    phone: '+1 (310) 555-0618',
    location: 'Los Angeles, CA',
    currentRole: 'Frontend Developer',
    currentCompany: 'MediaPlex',
    experienceYears: 3,
    education: 'B.A. Information Systems, UCLA',
    appliedDate: '2026-02-20',
    avatarInitials: 'ER',
    matchScore: 42,
    ranking: 5,
    skillMatch: 48,
    experienceMatch: 32,
    educationMatch: 60,
    cultureFit: 55,
    matchDetails: [
      {
        category: 'Required Skills',
        weight: 0.3,
        score: 52,
        matches: ['TypeScript', 'React'],
        gaps: ['Node.js (frontend only)', 'PostgreSQL', 'Kubernetes'],
      },
      {
        category: 'Preferred Skills',
        weight: 0.15,
        score: 25,
        matches: ['Python (basic)'],
        gaps: ['GraphQL', 'Redis', 'Terraform'],
      },
      {
        category: 'Experience',
        weight: 0.25,
        score: 32,
        matches: ['3 years frontend experience'],
        gaps: ['2 years below minimum', 'No backend experience', 'No infrastructure experience'],
      },
      {
        category: 'Education',
        weight: 0.15,
        score: 60,
        matches: ['B.A. Information Systems, UCLA'],
        gaps: ['Not a CS/Engineering degree'],
      },
      {
        category: 'Culture Fit',
        weight: 0.15,
        score: 55,
        matches: ['Design community active'],
        gaps: ['No engineering community involvement'],
      },
    ],
    pros: [
      'Strong React and TypeScript skills',
      'UCLA graduate',
      'Creative problem-solving background',
    ],
    cons: [
      'Only 3 years of experience (minimum is 5)',
      'Frontend-only — no backend or infrastructure skills',
      'Missing 3 of 5 required skills',
      'Would need significant ramp-up time',
    ],
    recommendation: 'NO',
    interviewQuestions: [
      'What backend technologies have you explored outside of work?',
      'How would you plan to bridge the full-stack gap?',
    ],
    topSkills: ['TypeScript', 'React', 'CSS', 'Figma'],
    missingSkills: ['Node.js', 'PostgreSQL', 'Kubernetes', 'GraphQL', 'Redis', 'Terraform'],
  },
  {
    id: 'mc-6',
    name: 'Alex Turner',
    email: 'alex.t@protonmail.com',
    phone: '+1 (503) 555-0742',
    location: 'Portland, OR (Remote preferred)',
    currentRole: 'Lead Engineer',
    currentCompany: 'ScaleUp',
    experienceYears: 9,
    education: 'B.S. Computer Science, Georgia Tech',
    appliedDate: '2026-02-21',
    avatarInitials: 'AT',
    matchScore: 88,
    ranking: 3,
    skillMatch: 92,
    experienceMatch: 88,
    educationMatch: 85,
    cultureFit: 82,
    matchDetails: [
      {
        category: 'Required Skills',
        weight: 0.3,
        score: 92,
        matches: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Kubernetes'],
        gaps: [],
      },
      {
        category: 'Preferred Skills',
        weight: 0.15,
        score: 100,
        matches: ['GraphQL', 'Redis', 'Terraform', 'Python'],
        gaps: [],
      },
      {
        category: 'Experience',
        weight: 0.25,
        score: 88,
        matches: ['9 years total', 'Led engineering teams', 'Built CI/CD from scratch'],
        gaps: [],
      },
      {
        category: 'Education',
        weight: 0.15,
        score: 85,
        matches: ['B.S. Computer Science, Georgia Tech'],
        gaps: [],
      },
      {
        category: 'Culture Fit',
        weight: 0.15,
        score: 82,
        matches: ['Tech talks', 'Open source maintainer'],
        gaps: ['Prefers remote — may conflict with hybrid expectations'],
      },
    ],
    pros: [
      'All required AND preferred skills matched',
      '9 years of deep engineering experience',
      'Leadership and CI/CD expertise',
      'Open source maintainer',
    ],
    cons: [
      'Strongly prefers remote work',
      'Based in Portland — relocation unlikely',
      'Salary expectations may be high given lead-level experience',
    ],
    recommendation: 'STRONG_YES',
    interviewQuestions: [
      'How do you feel about a hybrid work arrangement?',
      'Tell us about your experience building CI/CD pipelines.',
      'What keeps you engaged as a hands-on engineer vs. moving to management?',
    ],
    topSkills: ['TypeScript', 'React', 'Kubernetes', 'Terraform', 'GraphQL'],
    missingSkills: [],
  },
];

// ── Component ────────────────────────────────────────────────────────────────────

export const AICandidateMatching: React.FC<AICandidateMatchingProps> = ({
  candidates: initialCandidates,
  job,
}) => {
  const [candidates] = useState(initialCandidates);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendationFilter, setRecommendationFilter] = useState<'all' | Recommendation>('all');
  const [sortField, setSortField] = useState<SortField>('ranking');
  const [sortAsc, setSortAsc] = useState(true);
  const [activeDetailTab, setActiveDetailTab] = useState<'breakdown' | 'pros_cons' | 'questions'>(
    'breakdown'
  );

  // Sort & Filter
  const processed = useMemo(() => {
    let list = [...candidates];

    // Filter by recommendation
    if (recommendationFilter !== 'all') {
      list = list.filter((c) => c.recommendation === recommendationFilter);
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.currentRole.toLowerCase().includes(q) ||
          c.currentCompany.toLowerCase().includes(q) ||
          c.topSkills.some((s) => s.toLowerCase().includes(q))
      );
    }

    // Sort
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'ranking':
          cmp = a.ranking - b.ranking;
          break;
        case 'matchScore':
          cmp = b.matchScore - a.matchScore;
          break;
        case 'skillMatch':
          cmp = b.skillMatch - a.skillMatch;
          break;
        case 'experienceMatch':
          cmp = b.experienceMatch - a.experienceMatch;
          break;
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
      }
      return sortAsc ? cmp : -cmp;
    });

    return list;
  }, [candidates, recommendationFilter, searchQuery, sortField, sortAsc]);

  // Stats
  const stats = useMemo(() => {
    const total = candidates.length;
    const strongYes = candidates.filter((c) => c.recommendation === 'STRONG_YES').length;
    const yes = candidates.filter((c) => c.recommendation === 'YES').length;
    const maybe = candidates.filter((c) => c.recommendation === 'MAYBE').length;
    const no = candidates.filter((c) => c.recommendation === 'NO').length;
    const avgScore =
      total > 0 ? Math.round(candidates.reduce((s, c) => s + c.matchScore, 0) / total) : 0;
    return { total, strongYes, yes, maybe, no, avgScore };
  }, [candidates]);

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortAsc((p) => !p);
      } else {
        setSortField(field);
        setSortAsc(field === 'ranking' || field === 'name');
      }
    },
    [sortField]
  );

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    setActiveDetailTab('breakdown');
  }, []);

  // ── Score Ring SVG ────────────────────────────────────────────────────────
  const ScoreRing: React.FC<{ score: number; size?: number }> = ({ score, size = 48 }) => {
    const r = (size - 6) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    return (
      <svg width={size} height={size} className="shrink-0">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          className="text-cloud dark:text-nebula-purple/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={getScoreRingColor(score)}
          strokeWidth={3}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="central"
          className={`text-[11px] font-black ${getScoreColor(score)}`}
          fill="currentColor"
        >
          {score}
        </text>
      </svg>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Job Context Banner */}
      <div className="rounded-xl border border-celestial-indigo/20 bg-celestial-indigo/5 p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-celestial-indigo/10 flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-celestial-indigo" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-ink-black dark:text-pearl">{job.title}</p>
          <p className="text-[8px] text-silver-mist">
            {job.department} · {job.location} · {job.experienceMin}–{job.experienceMax} years
          </p>
          <div className="flex flex-wrap gap-1 mt-1">
            {job.requiredSkills.map((s) => (
              <span
                key={s}
                className="px-1.5 py-0.5 rounded text-[7px] font-bold bg-celestial-indigo/10 text-celestial-indigo"
              >
                {s}
              </span>
            ))}
            {job.preferredSkills.map((s) => (
              <span
                key={s}
                className="px-1.5 py-0.5 rounded text-[7px] font-medium bg-cloud/50 dark:bg-nebula-purple/10 text-silver-mist"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="text-center shrink-0">
          <p className="text-[20px] font-black text-celestial-indigo">{stats.total}</p>
          <p className="text-[7px] text-silver-mist font-semibold">Candidates</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          {
            label: 'Avg Score',
            value: `${stats.avgScore}%`,
            icon: BarChart3,
            color: 'text-celestial-indigo',
            bg: 'bg-celestial-indigo/10',
          },
          {
            label: 'Strong Yes',
            value: stats.strongYes,
            icon: CheckCircle2,
            color: 'text-neural-mint',
            bg: 'bg-neural-mint/10',
          },
          {
            label: 'Yes',
            value: stats.yes,
            icon: ThumbsUp,
            color: 'text-celestial-indigo',
            bg: 'bg-celestial-indigo/10',
          },
          {
            label: 'Maybe',
            value: stats.maybe,
            icon: HelpCircle,
            color: 'text-sunset-amber',
            bg: 'bg-sunset-amber/10',
          },
          {
            label: 'No',
            value: stats.no,
            icon: ThumbsDown,
            color: 'text-coral-alert',
            bg: 'bg-coral-alert/10',
          },
        ].map((stat) => {
          const StatIcon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-2.5 text-center"
            >
              <div
                className={`w-7 h-7 mx-auto rounded-lg ${stat.bg} flex items-center justify-center mb-1`}
              >
                <StatIcon className={`w-3.5 h-3.5 ${stat.color}`} />
              </div>
              <p className="text-[14px] font-black text-ink-black dark:text-pearl">{stat.value}</p>
              <p className="text-[7px] text-silver-mist font-semibold">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-silver-mist" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, role, company, or skill..."
            className="w-full pl-8 pr-3 py-2 text-[10px] rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-deep-cosmos text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-1 focus:ring-celestial-indigo"
          />
        </div>
        <div className="flex items-center gap-1">
          {(['all', 'STRONG_YES', 'YES', 'MAYBE', 'NO'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setRecommendationFilter(f)}
              className={`px-2 py-1 rounded-md text-[8px] font-bold transition-colors ${
                recommendationFilter === f
                  ? f === 'all'
                    ? 'bg-celestial-indigo text-white'
                    : `${RECOMMENDATION_CONFIG[f].bg} ${RECOMMENDATION_CONFIG[f].color}`
                  : 'text-silver-mist hover:bg-cloud/50 dark:hover:bg-nebula-purple/10'
              }`}
            >
              {f === 'all' ? 'All' : RECOMMENDATION_CONFIG[f].label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-1 text-[8px] text-silver-mist">
        <ArrowUpDown className="w-3 h-3" />
        <span className="font-semibold">Sort:</span>
        {[
          { field: 'ranking' as SortField, label: 'Rank' },
          { field: 'matchScore' as SortField, label: 'Score' },
          { field: 'skillMatch' as SortField, label: 'Skills' },
          { field: 'experienceMatch' as SortField, label: 'Experience' },
          { field: 'name' as SortField, label: 'Name' },
        ].map((s) => (
          <button
            key={s.field}
            onClick={() => handleSort(s.field)}
            className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition-colors ${
              sortField === s.field
                ? 'bg-celestial-indigo/10 text-celestial-indigo'
                : 'hover:text-ink-black dark:hover:text-pearl'
            }`}
          >
            {s.label}
            {sortField === s.field && (sortAsc ? ' ↑' : ' ↓')}
          </button>
        ))}
      </div>

      {/* Candidate List */}
      <div className="space-y-2">
        {processed.length === 0 ? (
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-8 text-center">
            <Users className="w-10 h-10 mx-auto text-silver-mist/40 mb-2" />
            <p className="text-[11px] font-semibold text-silver-mist">
              No candidates match filters
            </p>
          </div>
        ) : (
          processed.map((candidate) => {
            const isExpanded = expandedId === candidate.id;
            const recConfig = RECOMMENDATION_CONFIG[candidate.recommendation];
            const RecIcon = recConfig.icon;
            const rankBadge = getRankBadge(candidate.ranking);

            return (
              <div
                key={candidate.id}
                className={`rounded-xl border bg-white dark:bg-stellar-blue overflow-hidden transition-colors ${
                  isExpanded ? `${recConfig.border}` : 'border-cloud dark:border-nebula-purple/20'
                }`}
              >
                {/* Candidate Row */}
                <button
                  onClick={() => toggleExpand(candidate.id)}
                  className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-cloud/20 dark:hover:bg-nebula-purple/5 transition-colors"
                >
                  {/* Rank Badge */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${rankBadge.bg} ${rankBadge.text}`}
                  >
                    #{candidate.ranking}
                  </div>

                  {/* Score Ring */}
                  <ScoreRing score={candidate.matchScore} />

                  {/* Candidate Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-ink-black dark:text-pearl">
                        {candidate.name}
                      </span>
                      <span
                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-bold ${recConfig.bg} ${recConfig.color}`}
                      >
                        <RecIcon className="w-2.5 h-2.5" />
                        {recConfig.label}
                      </span>
                    </div>
                    <p className="text-[9px] text-silver-mist">
                      {candidate.currentRole} at {candidate.currentCompany} ·{' '}
                      {candidate.experienceYears}y · {candidate.location}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {candidate.topSkills.slice(0, 5).map((sk) => (
                        <span
                          key={sk}
                          className={`px-1 py-0.5 rounded text-[7px] font-semibold ${
                            job.requiredSkills.includes(sk)
                              ? 'bg-neural-mint/10 text-neural-mint'
                              : job.preferredSkills.includes(sk)
                                ? 'bg-celestial-indigo/10 text-celestial-indigo'
                                : 'bg-cloud/50 dark:bg-nebula-purple/10 text-silver-mist'
                          }`}
                        >
                          {sk}
                        </span>
                      ))}
                      {candidate.missingSkills.length > 0 && (
                        <span className="px-1 py-0.5 rounded text-[7px] font-semibold bg-coral-alert/10 text-coral-alert">
                          -{candidate.missingSkills.length} missing
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score Bars */}
                  <div className="hidden sm:flex items-center gap-3 shrink-0">
                    {[
                      { label: 'Skills', val: candidate.skillMatch },
                      { label: 'Exp', val: candidate.experienceMatch },
                      { label: 'Edu', val: candidate.educationMatch },
                      { label: 'Fit', val: candidate.cultureFit },
                    ].map((b) => (
                      <div key={b.label} className="text-center w-10">
                        <div className="h-1.5 w-full rounded-full bg-cloud dark:bg-nebula-purple/20 mb-0.5">
                          <div
                            className={`h-full rounded-full ${getScoreBg(b.val)}`}
                            style={{ width: `${b.val}%` }}
                          />
                        </div>
                        <p className="text-[7px] text-silver-mist">{b.label}</p>
                      </div>
                    ))}
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-silver-mist shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-silver-mist shrink-0" />
                  )}
                </button>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="border-t border-cloud dark:border-nebula-purple/20 p-4 space-y-3">
                    {/* Contact Info */}
                    <div className="flex flex-wrap items-center gap-3 text-[8px] text-silver-mist">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {candidate.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {candidate.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {candidate.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" />
                        {candidate.education}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Applied{' '}
                        {new Date(candidate.appliedDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Detail Tabs */}
                    <div className="flex rounded-lg border border-cloud dark:border-nebula-purple/20 overflow-hidden">
                      {[
                        { key: 'breakdown' as const, label: 'Score Breakdown', icon: BarChart3 },
                        { key: 'pros_cons' as const, label: 'Pros & Cons', icon: Target },
                        {
                          key: 'questions' as const,
                          label: 'Interview Questions',
                          icon: MessageSquare,
                        },
                      ].map((tab) => {
                        const TabIcon = tab.icon;
                        return (
                          <button
                            key={tab.key}
                            onClick={() => setActiveDetailTab(tab.key)}
                            className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[8px] font-bold transition-colors ${
                              activeDetailTab === tab.key
                                ? 'text-celestial-indigo bg-celestial-indigo/5 border-b-2 border-celestial-indigo'
                                : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
                            }`}
                          >
                            <TabIcon className="w-3 h-3" />
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Breakdown Tab */}
                    {activeDetailTab === 'breakdown' && (
                      <div className="space-y-2">
                        {candidate.matchDetails.map((cat) => {
                          const CatIcon = CATEGORY_ICONS[cat.category] || Target;
                          return (
                            <div
                              key={cat.category}
                              className="rounded-lg border border-cloud dark:border-nebula-purple/20 p-2.5"
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-1.5">
                                  <CatIcon className={`w-3.5 h-3.5 ${getScoreColor(cat.score)}`} />
                                  <span className="text-[9px] font-bold text-ink-black dark:text-pearl">
                                    {cat.category}
                                  </span>
                                  <span className="text-[7px] text-silver-mist">
                                    ({Math.round(cat.weight * 100)}% weight)
                                  </span>
                                </div>
                                <span
                                  className={`text-[11px] font-black ${getScoreColor(cat.score)}`}
                                >
                                  {cat.score}%
                                </span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-cloud dark:bg-nebula-purple/20 mb-1.5">
                                <div
                                  className={`h-full rounded-full transition-all ${getScoreBg(cat.score)}`}
                                  style={{ width: `${cat.score}%` }}
                                />
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {cat.matches.map((m) => (
                                  <span
                                    key={m}
                                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-semibold bg-neural-mint/10 text-neural-mint"
                                  >
                                    <CheckCircle2 className="w-2 h-2" />
                                    {m}
                                  </span>
                                ))}
                                {cat.gaps.map((g) => (
                                  <span
                                    key={g}
                                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-semibold bg-coral-alert/10 text-coral-alert"
                                  >
                                    <XCircle className="w-2 h-2" />
                                    {g}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Pros & Cons Tab */}
                    {activeDetailTab === 'pros_cons' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <p className="text-[9px] font-bold text-neural-mint flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" /> Strengths
                          </p>
                          {candidate.pros.map((p, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-1.5 px-2 py-1.5 rounded-lg bg-neural-mint/5 border border-neural-mint/10"
                            >
                              <CheckCircle2 className="w-3 h-3 text-neural-mint mt-0.5 shrink-0" />
                              <span className="text-[9px] text-ink-black dark:text-pearl">{p}</span>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-[9px] font-bold text-coral-alert flex items-center gap-1">
                            <TrendingDown className="w-3.5 h-3.5" /> Concerns
                          </p>
                          {candidate.cons.map((c, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-1.5 px-2 py-1.5 rounded-lg bg-coral-alert/5 border border-coral-alert/10"
                            >
                              <AlertTriangle className="w-3 h-3 text-coral-alert mt-0.5 shrink-0" />
                              <span className="text-[9px] text-ink-black dark:text-pearl">{c}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Interview Questions Tab */}
                    {activeDetailTab === 'questions' && (
                      <div className="space-y-1.5">
                        <p className="text-[9px] text-silver-mist flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-celestial-indigo" />
                          AI-suggested interview questions based on candidate gaps and strengths
                        </p>
                        {candidate.interviewQuestions.map((q, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/20 bg-cloud/20 dark:bg-nebula-purple/5"
                          >
                            <span className="w-5 h-5 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-[8px] font-bold text-celestial-indigo shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <p className="text-[9px] text-ink-black dark:text-pearl">{q}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-bold bg-celestial-indigo text-white hover:opacity-90 transition-opacity">
                        <Calendar className="w-3 h-3" /> Schedule Interview
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-bold border border-cloud dark:border-nebula-purple/20 text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors">
                        <Mail className="w-3 h-3" /> Send Message
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-bold border border-cloud dark:border-nebula-purple/20 text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors">
                        <Eye className="w-3 h-3" /> View Full Profile
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* AI Confidence Note */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-celestial-indigo/5 border border-celestial-indigo/10">
        <Brain className="w-4 h-4 text-celestial-indigo shrink-0" />
        <p className="text-[8px] text-silver-mist">
          Scores are generated by AURA AI based on resume analysis, skill matching, and job
          requirement alignment. Rankings should be used as a guide alongside human judgment.
        </p>
      </div>
    </div>
  );
};

export default AICandidateMatching;
