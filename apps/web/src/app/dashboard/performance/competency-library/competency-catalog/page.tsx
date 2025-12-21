"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Sheet } from '@aura/ui/components/ui';
import {
    BookMarked,
    Search,
    Filter,
    Plus,
    ChevronDown,
    ChevronUp,
    ChevronRight,
    BrainCircuit,
    Users,
    Briefcase,
    Star,
    LayoutGrid,
    Code,
    Heart,
    Lightbulb,
    MessageSquare,
    Shield,
    Zap,
    Target,
    Award,
    TrendingUp,
    Settings,
    Eye,
    Edit3,
    Copy,
    Trash2,
    MoreHorizontal,
    Download,
    Upload,
    Layers,
    Grid3X3,
    List,
    SlidersHorizontal,
    Check,
    X,
    Info,
    Save,
    Loader2
} from 'lucide-react';
import { CompetencyService, CategoryService } from '@/services/competency-library.service';
import { logger } from '@/lib/logger';

// --- TYPES ---

type CompetencyCategory = 'Technical' | 'Leadership' | 'Behavioral' | 'Functional' | 'Core';
type ProficiencyLevel = 'Foundational' | 'Developing' | 'Proficient' | 'Advanced' | 'Expert';
type CompetencyStatus = 'Active' | 'Draft' | 'Archived' | 'Under Review';

interface ProficiencyDescriptor {
    level: ProficiencyLevel;
    levelNumber: number;
    description: string;
    behaviors: string[];
}

interface Competency {
    id: string;
    code: string;
    name: string;
    category: CompetencyCategory;
    subcategory: string;
    description: string;
    status: CompetencyStatus;
    version: string;
    lastUpdated: string;
    owner: string;
    applicableRoles: string[];
    proficiencyLevels: ProficiencyDescriptor[];
    relatedCompetencies: string[];
    assessmentCriteria: string[];
    developmentResources: {
        title: string;
        type: string;
        url?: string;
    }[];
    usageCount: number;
}

// --- MOCK DATA ---

const COMPETENCY_CATEGORIES: { label: CompetencyCategory; icon: React.ReactNode; color: string; bgColor: string }[] = [
    { label: 'Technical', icon: <Code className="w-4 h-4" />, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Leadership', icon: <Users className="w-4 h-4" />, color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
    { label: 'Behavioral', icon: <Heart className="w-4 h-4" />, color: 'text-rose-600', bgColor: 'bg-rose-100 dark:bg-rose-900/30' },
    { label: 'Functional', icon: <Briefcase className="w-4 h-4" />, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
    { label: 'Core', icon: <Star className="w-4 h-4" />, color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
];

const COMPETENCIES: Competency[] = [
    {
        id: 'COMP-001',
        code: 'TECH-001',
        name: 'Software Development',
        category: 'Technical',
        subcategory: 'Engineering',
        description: 'The ability to design, develop, test, and maintain software applications using modern programming languages, frameworks, and best practices.',
        status: 'Active',
        version: '2.1',
        lastUpdated: '2025-11-15',
        owner: 'Engineering Excellence Team',
        applicableRoles: ['Software Engineer', 'Senior Engineer', 'Tech Lead', 'Staff Engineer', 'Principal Engineer'],
        proficiencyLevels: [
            {
                level: 'Foundational',
                levelNumber: 1,
                description: 'Understands basic programming concepts and can write simple code with guidance.',
                behaviors: [
                    'Writes basic code following established patterns',
                    'Understands fundamental data structures',
                    'Can debug simple issues with support',
                    'Follows coding standards and guidelines'
                ]
            },
            {
                level: 'Developing',
                levelNumber: 2,
                description: 'Independently develops features with moderate complexity and participates in code reviews.',
                behaviors: [
                    'Implements features with minimal guidance',
                    'Writes unit tests for own code',
                    'Participates actively in code reviews',
                    'Understands and applies design patterns'
                ]
            },
            {
                level: 'Proficient',
                levelNumber: 3,
                description: 'Designs and implements complex features, mentors junior developers, and contributes to technical decisions.',
                behaviors: [
                    'Designs modular, maintainable solutions',
                    'Leads code reviews and provides constructive feedback',
                    'Mentors junior team members',
                    'Contributes to architecture decisions'
                ]
            },
            {
                level: 'Advanced',
                levelNumber: 4,
                description: 'Leads technical initiatives, defines best practices, and influences engineering culture.',
                behaviors: [
                    'Defines and evolves coding standards',
                    'Designs systems for scalability and performance',
                    'Leads cross-team technical initiatives',
                    'Evaluates and introduces new technologies'
                ]
            },
            {
                level: 'Expert',
                levelNumber: 5,
                description: 'Sets technical direction for the organization, drives innovation, and is recognized as a thought leader.',
                behaviors: [
                    'Shapes organization-wide technical strategy',
                    'Pioneers innovative solutions to complex problems',
                    'Mentors senior engineers across teams',
                    'Represents company in external technical forums'
                ]
            }
        ],
        relatedCompetencies: ['System Design', 'Code Quality', 'DevOps'],
        assessmentCriteria: [
            'Code quality and maintainability',
            'Technical problem-solving ability',
            'Knowledge of best practices',
            'Contribution to team productivity'
        ],
        developmentResources: [
            { title: 'Clean Code by Robert Martin', type: 'Book' },
            { title: 'System Design Primer', type: 'Course', url: 'https://example.com' },
            { title: 'Internal Engineering Bootcamp', type: 'Training' }
        ],
        usageCount: 156
    },
    {
        id: 'COMP-002',
        code: 'LEAD-001',
        name: 'Strategic Thinking',
        category: 'Leadership',
        subcategory: 'Executive',
        description: 'The ability to analyze complex situations, anticipate future trends, and develop long-term strategies that align with organizational goals.',
        status: 'Active',
        version: '1.3',
        lastUpdated: '2025-10-22',
        owner: 'Leadership Development',
        applicableRoles: ['Manager', 'Senior Manager', 'Director', 'VP', 'C-Suite'],
        proficiencyLevels: [
            {
                level: 'Foundational',
                levelNumber: 1,
                description: 'Understands organizational strategy and aligns daily work with team objectives.',
                behaviors: [
                    'Connects daily tasks to team goals',
                    'Understands basic business metrics',
                    'Follows strategic direction set by leadership',
                    'Identifies opportunities for improvement'
                ]
            },
            {
                level: 'Developing',
                levelNumber: 2,
                description: 'Contributes to team strategy and anticipates challenges in own area of responsibility.',
                behaviors: [
                    'Develops short-term plans for team',
                    'Analyzes data to inform decisions',
                    'Anticipates obstacles and plans mitigations',
                    'Collaborates cross-functionally on initiatives'
                ]
            },
            {
                level: 'Proficient',
                levelNumber: 3,
                description: 'Develops departmental strategies and balances short-term execution with long-term vision.',
                behaviors: [
                    'Creates and communicates department strategy',
                    'Balances competing priorities effectively',
                    'Identifies emerging trends and opportunities',
                    'Builds strategic partnerships'
                ]
            },
            {
                level: 'Advanced',
                levelNumber: 4,
                description: 'Shapes cross-functional strategies and drives organizational transformation initiatives.',
                behaviors: [
                    'Leads strategic planning processes',
                    'Drives organizational change initiatives',
                    'Influences executive-level decisions',
                    'Develops innovative business models'
                ]
            },
            {
                level: 'Expert',
                levelNumber: 5,
                description: 'Defines organizational vision, drives market positioning, and influences industry direction.',
                behaviors: [
                    'Sets organizational vision and direction',
                    'Anticipates market disruptions',
                    'Shapes industry standards and practices',
                    'Builds sustainable competitive advantages'
                ]
            }
        ],
        relatedCompetencies: ['Business Acumen', 'Decision Making', 'Change Leadership'],
        assessmentCriteria: [
            'Quality of strategic plans developed',
            'Ability to anticipate market changes',
            'Success of strategic initiatives',
            'Alignment of team with organizational goals'
        ],
        developmentResources: [
            { title: 'Good Strategy Bad Strategy', type: 'Book' },
            { title: 'Strategic Leadership Workshop', type: 'Training' },
            { title: 'Executive Coaching Program', type: 'Mentoring' }
        ],
        usageCount: 89
    },
    {
        id: 'COMP-003',
        code: 'BEHV-001',
        name: 'Effective Communication',
        category: 'Behavioral',
        subcategory: 'Interpersonal',
        description: 'The ability to convey information clearly, listen actively, and adapt communication style to diverse audiences and situations.',
        status: 'Active',
        version: '2.0',
        lastUpdated: '2025-09-18',
        owner: 'People & Culture',
        applicableRoles: ['All Roles'],
        proficiencyLevels: [
            {
                level: 'Foundational',
                levelNumber: 1,
                description: 'Communicates basic information clearly in routine situations.',
                behaviors: [
                    'Expresses ideas clearly in writing and verbally',
                    'Listens actively and asks clarifying questions',
                    'Uses appropriate tone and language',
                    'Responds to messages in a timely manner'
                ]
            },
            {
                level: 'Developing',
                levelNumber: 2,
                description: 'Adapts communication to different audiences and handles moderately complex discussions.',
                behaviors: [
                    'Tailors message to audience needs',
                    'Facilitates productive team meetings',
                    'Provides clear status updates and reports',
                    'Navigates difficult conversations constructively'
                ]
            },
            {
                level: 'Proficient',
                levelNumber: 3,
                description: 'Influences through persuasive communication and builds alignment across stakeholders.',
                behaviors: [
                    'Presents complex ideas compellingly',
                    'Builds consensus across diverse groups',
                    'Coaches others on communication skills',
                    'Creates impactful presentations and documents'
                ]
            },
            {
                level: 'Advanced',
                levelNumber: 4,
                description: 'Drives organizational communication and shapes culture through storytelling.',
                behaviors: [
                    'Crafts and delivers executive communications',
                    'Inspires and motivates through storytelling',
                    'Handles crisis communications effectively',
                    'Represents organization to external stakeholders'
                ]
            },
            {
                level: 'Expert',
                levelNumber: 5,
                description: 'Shapes industry narratives and is recognized as a thought leader and spokesperson.',
                behaviors: [
                    'Represents organization at industry events',
                    'Builds thought leadership through content',
                    'Influences public perception and policy',
                    'Mentors executives on communication'
                ]
            }
        ],
        relatedCompetencies: ['Active Listening', 'Presentation Skills', 'Written Communication'],
        assessmentCriteria: [
            'Clarity and effectiveness of communications',
            'Stakeholder feedback on communication',
            'Success in influencing and persuading',
            'Quality of written and verbal deliverables'
        ],
        developmentResources: [
            { title: 'Crucial Conversations', type: 'Book' },
            { title: 'Executive Presence Workshop', type: 'Training' },
            { title: 'Toastmasters', type: 'Practice Group' }
        ],
        usageCount: 234
    },
    {
        id: 'COMP-004',
        code: 'FUNC-001',
        name: 'Project Management',
        category: 'Functional',
        subcategory: 'Operations',
        description: 'The ability to plan, execute, and deliver projects on time and within scope, managing resources, risks, and stakeholder expectations effectively.',
        status: 'Active',
        version: '1.5',
        lastUpdated: '2025-08-30',
        owner: 'PMO',
        applicableRoles: ['Project Manager', 'Program Manager', 'Product Manager', 'Team Lead'],
        proficiencyLevels: [
            {
                level: 'Foundational',
                levelNumber: 1,
                description: 'Understands project management basics and can manage simple tasks and timelines.',
                behaviors: [
                    'Creates basic project plans and timelines',
                    'Tracks task progress and updates status',
                    'Coordinates with team members on deliverables',
                    'Escalates issues and blockers appropriately'
                ]
            },
            {
                level: 'Developing',
                levelNumber: 2,
                description: 'Manages small to medium projects independently with standard complexity.',
                behaviors: [
                    'Develops detailed project schedules',
                    'Identifies and mitigates common risks',
                    'Manages project budgets effectively',
                    'Communicates regularly with stakeholders'
                ]
            },
            {
                level: 'Proficient',
                levelNumber: 3,
                description: 'Leads complex projects with multiple workstreams and cross-functional teams.',
                behaviors: [
                    'Manages complex project dependencies',
                    'Leads cross-functional project teams',
                    'Develops comprehensive risk management plans',
                    'Optimizes resource allocation'
                ]
            },
            {
                level: 'Advanced',
                levelNumber: 4,
                description: 'Manages programs and portfolios, establishing project management standards.',
                behaviors: [
                    'Manages portfolio of interdependent projects',
                    'Defines and implements PM standards',
                    'Mentors project managers',
                    'Drives organizational project governance'
                ]
            },
            {
                level: 'Expert',
                levelNumber: 5,
                description: 'Shapes project management strategy and drives enterprise-level transformation programs.',
                behaviors: [
                    'Leads enterprise-wide transformation programs',
                    'Shapes organizational PM methodology',
                    'Influences industry PM practices',
                    'Builds high-performing PM organizations'
                ]
            }
        ],
        relatedCompetencies: ['Stakeholder Management', 'Risk Management', 'Resource Planning'],
        assessmentCriteria: [
            'On-time and on-budget delivery',
            'Stakeholder satisfaction scores',
            'Quality of project deliverables',
            'Team engagement and retention'
        ],
        developmentResources: [
            { title: 'PMP Certification', type: 'Certification' },
            { title: 'Agile Project Management', type: 'Course' },
            { title: 'Project Management Fundamentals', type: 'Training' }
        ],
        usageCount: 178
    },
    {
        id: 'COMP-005',
        code: 'CORE-001',
        name: 'Customer Focus',
        category: 'Core',
        subcategory: 'Values',
        description: 'The commitment to understanding and meeting customer needs, delivering exceptional experiences, and building lasting relationships.',
        status: 'Active',
        version: '1.2',
        lastUpdated: '2025-07-14',
        owner: 'Customer Success',
        applicableRoles: ['All Roles'],
        proficiencyLevels: [
            {
                level: 'Foundational',
                levelNumber: 1,
                description: 'Understands customer needs and responds to requests professionally.',
                behaviors: [
                    'Responds promptly to customer inquiries',
                    'Shows empathy and understanding',
                    'Follows customer service protocols',
                    'Escalates complex issues appropriately'
                ]
            },
            {
                level: 'Developing',
                levelNumber: 2,
                description: 'Anticipates customer needs and proactively provides solutions.',
                behaviors: [
                    'Identifies customer pain points',
                    'Suggests improvements based on feedback',
                    'Goes beyond minimum requirements',
                    'Builds rapport with customers'
                ]
            },
            {
                level: 'Proficient',
                levelNumber: 3,
                description: 'Drives customer satisfaction initiatives and resolves complex customer challenges.',
                behaviors: [
                    'Leads customer experience improvements',
                    'Resolves escalated customer issues',
                    'Develops customer success strategies',
                    'Builds strong customer relationships'
                ]
            },
            {
                level: 'Advanced',
                levelNumber: 4,
                description: 'Shapes customer experience strategy and drives customer-centric culture.',
                behaviors: [
                    'Defines customer experience vision',
                    'Drives organizational customer focus',
                    'Develops strategic customer partnerships',
                    'Champions voice of customer programs'
                ]
            },
            {
                level: 'Expert',
                levelNumber: 5,
                description: 'Sets industry standards for customer experience and builds customer-centric organizations.',
                behaviors: [
                    'Shapes industry customer experience standards',
                    'Builds world-class customer organizations',
                    'Innovates customer engagement models',
                    'Serves as trusted advisor to key accounts'
                ]
            }
        ],
        relatedCompetencies: ['Problem Solving', 'Empathy', 'Service Excellence'],
        assessmentCriteria: [
            'Customer satisfaction scores',
            'Net Promoter Score impact',
            'Customer retention metrics',
            'Quality of customer interactions'
        ],
        developmentResources: [
            { title: 'Customer Success Management', type: 'Course' },
            { title: 'Design Thinking for CX', type: 'Workshop' },
            { title: 'Voice of Customer Analysis', type: 'Training' }
        ],
        usageCount: 312
    },
    {
        id: 'COMP-006',
        code: 'TECH-002',
        name: 'Data Analysis',
        category: 'Technical',
        subcategory: 'Analytics',
        description: 'The ability to collect, process, analyze, and interpret data to derive insights and support data-driven decision making.',
        status: 'Active',
        version: '1.8',
        lastUpdated: '2025-11-01',
        owner: 'Data & Analytics',
        applicableRoles: ['Data Analyst', 'Business Analyst', 'Product Manager', 'Data Scientist'],
        proficiencyLevels: [
            {
                level: 'Foundational',
                levelNumber: 1,
                description: 'Understands basic data concepts and can perform simple data queries.',
                behaviors: [
                    'Writes basic SQL queries',
                    'Creates simple charts and visualizations',
                    'Understands data quality principles',
                    'Uses spreadsheets for analysis'
                ]
            },
            {
                level: 'Developing',
                levelNumber: 2,
                description: 'Conducts independent analysis and creates reports that inform decisions.',
                behaviors: [
                    'Performs exploratory data analysis',
                    'Builds dashboards and reports',
                    'Identifies trends and patterns',
                    'Validates data quality'
                ]
            },
            {
                level: 'Proficient',
                levelNumber: 3,
                description: 'Leads analytics projects and translates complex data into actionable insights.',
                behaviors: [
                    'Designs analytics solutions',
                    'Performs advanced statistical analysis',
                    'Presents insights to stakeholders',
                    'Mentors junior analysts'
                ]
            },
            {
                level: 'Advanced',
                levelNumber: 4,
                description: 'Defines analytics strategy and builds advanced analytical capabilities.',
                behaviors: [
                    'Develops analytics roadmaps',
                    'Implements predictive models',
                    'Establishes data governance practices',
                    'Drives data-driven culture'
                ]
            },
            {
                level: 'Expert',
                levelNumber: 5,
                description: 'Pioneers advanced analytics methodologies and shapes organizational data strategy.',
                behaviors: [
                    'Defines enterprise data strategy',
                    'Innovates analytical approaches',
                    'Leads industry analytics initiatives',
                    'Builds world-class analytics teams'
                ]
            }
        ],
        relatedCompetencies: ['Statistical Analysis', 'Data Visualization', 'Business Intelligence'],
        assessmentCriteria: [
            'Quality of insights generated',
            'Impact on business decisions',
            'Technical proficiency with tools',
            'Stakeholder satisfaction'
        ],
        developmentResources: [
            { title: 'SQL for Data Analysis', type: 'Course' },
            { title: 'Python for Data Science', type: 'Course' },
            { title: 'Tableau Certification', type: 'Certification' }
        ],
        usageCount: 145
    },
    {
        id: 'COMP-007',
        code: 'LEAD-002',
        name: 'Team Leadership',
        category: 'Leadership',
        subcategory: 'People Management',
        description: 'The ability to inspire, develop, and guide team members to achieve shared goals while fostering a positive and productive work environment.',
        status: 'Active',
        version: '2.2',
        lastUpdated: '2025-10-10',
        owner: 'Leadership Development',
        applicableRoles: ['Team Lead', 'Manager', 'Senior Manager', 'Director'],
        proficiencyLevels: [
            {
                level: 'Foundational',
                levelNumber: 1,
                description: 'Supports team operations and helps coordinate team activities.',
                behaviors: [
                    'Assists with team coordination',
                    'Supports onboarding of new members',
                    'Helps maintain team documentation',
                    'Participates in team meetings actively'
                ]
            },
            {
                level: 'Developing',
                levelNumber: 2,
                description: 'Leads small teams or projects with guidance from senior leadership.',
                behaviors: [
                    'Sets clear expectations for team members',
                    'Provides regular feedback and recognition',
                    'Facilitates team collaboration',
                    'Addresses minor conflicts constructively'
                ]
            },
            {
                level: 'Proficient',
                levelNumber: 3,
                description: 'Manages teams independently, developing talent and driving performance.',
                behaviors: [
                    'Develops and executes team strategy',
                    'Conducts effective performance reviews',
                    'Builds high-performing teams',
                    'Creates inclusive team culture'
                ]
            },
            {
                level: 'Advanced',
                levelNumber: 4,
                description: 'Leads multiple teams or large organizations, developing other leaders.',
                behaviors: [
                    'Develops leadership pipeline',
                    'Drives organizational change',
                    'Manages complex stakeholder relationships',
                    'Shapes department culture'
                ]
            },
            {
                level: 'Expert',
                levelNumber: 5,
                description: 'Shapes organizational leadership philosophy and develops executive talent.',
                behaviors: [
                    'Defines leadership development strategy',
                    'Mentors senior leaders',
                    'Shapes organizational culture',
                    'Represents company as employer brand'
                ]
            }
        ],
        relatedCompetencies: ['Coaching', 'Performance Management', 'Conflict Resolution'],
        assessmentCriteria: [
            'Team engagement scores',
            'Team performance metrics',
            'Talent retention rates',
            '360-degree feedback scores'
        ],
        developmentResources: [
            { title: 'First-Time Manager Program', type: 'Training' },
            { title: 'Leadership Coaching', type: 'Mentoring' },
            { title: 'Radical Candor', type: 'Book' }
        ],
        usageCount: 267
    },
    {
        id: 'COMP-008',
        code: 'BEHV-002',
        name: 'Problem Solving',
        category: 'Behavioral',
        subcategory: 'Cognitive',
        description: 'The ability to identify, analyze, and solve complex problems using logical reasoning, creativity, and structured approaches.',
        status: 'Active',
        version: '1.4',
        lastUpdated: '2025-09-05',
        owner: 'People & Culture',
        applicableRoles: ['All Roles'],
        proficiencyLevels: [
            {
                level: 'Foundational',
                levelNumber: 1,
                description: 'Solves routine problems using established methods and guidance.',
                behaviors: [
                    'Identifies basic problems correctly',
                    'Applies standard solutions',
                    'Asks for help when stuck',
                    'Documents problems and solutions'
                ]
            },
            {
                level: 'Developing',
                levelNumber: 2,
                description: 'Analyzes problems independently and develops effective solutions.',
                behaviors: [
                    'Breaks down complex problems',
                    'Evaluates multiple solutions',
                    'Implements solutions effectively',
                    'Learns from outcomes'
                ]
            },
            {
                level: 'Proficient',
                levelNumber: 3,
                description: 'Solves complex, multi-faceted problems and guides others in problem-solving.',
                behaviors: [
                    'Applies structured problem-solving frameworks',
                    'Facilitates problem-solving sessions',
                    'Anticipates downstream impacts',
                    'Creates reusable solutions'
                ]
            },
            {
                level: 'Advanced',
                levelNumber: 4,
                description: 'Addresses strategic problems and develops organizational problem-solving capabilities.',
                behaviors: [
                    'Solves ambiguous, strategic problems',
                    'Develops problem-solving methodologies',
                    'Builds problem-solving culture',
                    'Coaches others on complex problems'
                ]
            },
            {
                level: 'Expert',
                levelNumber: 5,
                description: 'Pioneers innovative approaches to systemic challenges and shapes industry solutions.',
                behaviors: [
                    'Addresses industry-wide challenges',
                    'Innovates problem-solving approaches',
                    'Shapes organizational problem-solving culture',
                    'Mentors on strategic problem resolution'
                ]
            }
        ],
        relatedCompetencies: ['Critical Thinking', 'Decision Making', 'Analytical Skills'],
        assessmentCriteria: [
            'Quality of solutions developed',
            'Speed of problem resolution',
            'Innovation in approaches',
            'Peer feedback on collaboration'
        ],
        developmentResources: [
            { title: 'Design Thinking Workshop', type: 'Workshop' },
            { title: 'Six Sigma Green Belt', type: 'Certification' },
            { title: 'Systems Thinking Course', type: 'Course' }
        ],
        usageCount: 198
    }
];

// --- COMPONENTS ---

const StatusBadge: React.FC<{ status: CompetencyStatus }> = ({ status }) => {
    const styles: Record<CompetencyStatus, string> = {
        'Active': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        'Draft': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
        'Archived': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        'Under Review': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    };

    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${styles[status]}`}>
            {status}
        </span>
    );
};

const ProficiencyCard: React.FC<{ proficiency: ProficiencyDescriptor }> = ({ proficiency }) => {
    const levelColors: Record<number, { border: string; bg: string; text: string }> = {
        1: { border: 'border-slate-200 dark:border-slate-700', bg: 'bg-slate-50 dark:bg-slate-900/50', text: 'text-slate-500' },
        2: { border: 'border-blue-200 dark:border-blue-800', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600' },
        3: { border: 'border-indigo-200 dark:border-indigo-800', bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600' },
        4: { border: 'border-purple-200 dark:border-purple-800', bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600' },
        5: { border: 'border-emerald-200 dark:border-emerald-800', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600' }
    };

    const colors = levelColors[proficiency.levelNumber];

    return (
        <div className={`p-4 rounded-xl border ${colors.border} ${colors.bg}`}>
            <div className="flex items-center gap-2 mb-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${colors.text} bg-white dark:bg-slate-800 border ${colors.border}`}>
                    {proficiency.levelNumber}
                </div>
                <span className={`text-xs font-bold uppercase ${colors.text}`}>
                    {proficiency.level}
                </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                {proficiency.description}
            </p>
            <div className="space-y-1.5">
                {proficiency.behaviors.map((behavior, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <Check className="w-3 h-3 mt-0.5 text-emerald-500 shrink-0" />
                        <span>{behavior}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function CompetencyCatalogPage() {
    const [expandedIds, setExpandedIds] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<CompetencyCategory | 'All'>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [selectedStatus, setSelectedStatus] = useState<CompetencyStatus | 'All'>('All');
    const [sortBy, setSortBy] = useState<'name' | 'usage' | 'updated'>('name');
    const [competencies, setCompetencies] = useState<Competency[]>([]);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingCompetency, setEditingCompetency] = useState<Partial<Competency> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch competencies from API on mount
    const fetchCompetencies = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: any = {};
            if (selectedCategory !== 'All') params.categoryId = selectedCategory;
            if (selectedStatus !== 'All') params.status = selectedStatus;
            if (searchQuery) params.search = searchQuery;
            
            const result = await CompetencyService.getAll(params);
            if (result.success) {
                // Cast data to local type since service uses shared types
                setCompetencies(result.data as any);
            }
        } catch (error) {
            logger.error('Failed to fetch competencies:', error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedCategory, selectedStatus, searchQuery]);

    useEffect(() => {
        fetchCompetencies();
    }, [fetchCompetencies]);

    const toggleExpand = (id: string) => {
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    // Default new competency template
    const defaultCompetency: Partial<Competency> = {
        name: '',
        code: '',
        category: 'Technical',
        subcategory: '',
        description: '',
        status: 'Draft',
        version: '1.0',
        owner: '',
        applicableRoles: [],
        proficiencyLevels: [
            { level: 'Foundational', levelNumber: 1, description: '', behaviors: [''] },
            { level: 'Developing', levelNumber: 2, description: '', behaviors: [''] },
            { level: 'Proficient', levelNumber: 3, description: '', behaviors: [''] },
            { level: 'Advanced', levelNumber: 4, description: '', behaviors: [''] },
            { level: 'Expert', levelNumber: 5, description: '', behaviors: [''] },
        ],
        relatedCompetencies: [],
        assessmentCriteria: [''],
        developmentResources: [],
        usageCount: 0
    };

    const handleAddCompetency = () => {
        setEditingCompetency(defaultCompetency);
        setIsSheetOpen(true);
    };

    const handleEditCompetency = (comp: Competency) => {
        setEditingCompetency(comp);
        setIsSheetOpen(true);
    };

    const handleSaveCompetency = async () => {
        if (!editingCompetency) return;
        
        setIsSaving(true);
        try {
            if (editingCompetency.id) {
                // Update existing via API
                const result = await CompetencyService.update(editingCompetency.id, editingCompetency as any);
                if (result.success && result.data) {
                    setCompetencies(prev => prev.map(c => 
                        c.id === editingCompetency.id ? (result.data as any) : c
                    ));
                }
            } else {
                // Create new via API
                const result = await CompetencyService.create(editingCompetency as any);
                if (result.success && result.data) {
                    setCompetencies(prev => [...prev, result.data as any]);
                }
            }
            
            setIsSheetOpen(false);
            setEditingCompetency(null);
        } catch (error) {
            logger.error('Failed to save competency:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteCompetency = async (id: string) => {
        if (confirm('Are you sure you want to delete this competency?')) {
            try {
                const result = await CompetencyService.delete(id);
                if (result.success) {
                    setCompetencies(prev => prev.filter(c => c.id !== id));
                }
            } catch (error) {
                logger.error('Failed to delete competency:', error);
            }
        }
    };

    const handleExport = () => {
        // Create CSV content
        const headers = ['Code', 'Name', 'Category', 'Subcategory', 'Description', 'Status', 'Version', 'Owner'];
        const rows = competencies.map(c => [
            c.code, c.name, c.category, c.subcategory, c.description, c.status, c.version, c.owner
        ]);
        const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        
        // Download
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'competencies.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,.xlsx,.xls';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                // In a real implementation, parse the file and add competencies
                alert(`Import functionality: Selected file "${file.name}". Full implementation would parse and import competencies.`);
            }
        };
        input.click();
    };

    const handleFieldChange = (field: keyof Competency, value: any) => {
        setEditingCompetency(prev => prev ? { ...prev, [field]: value } : null);
    };

    const filteredCompetencies = useMemo(() => {
        let result = competencies;

        if (selectedCategory !== 'All') {
            result = result.filter(c => c.category === selectedCategory);
        }

        if (selectedStatus !== 'All') {
            result = result.filter(c => c.status === selectedStatus);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(c =>
                c.name.toLowerCase().includes(query) ||
                c.description.toLowerCase().includes(query) ||
                c.code.toLowerCase().includes(query) ||
                c.subcategory.toLowerCase().includes(query)
            );
        }

        // Sort
        result = [...result].sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'usage') return b.usageCount - a.usageCount;
            if (sortBy === 'updated') return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
            return 0;
        });

        return result;
    }, [selectedCategory, selectedStatus, searchQuery, sortBy, competencies]);

    const getCategoryStyle = (category: CompetencyCategory) => {
        const cat = COMPETENCY_CATEGORIES.find(c => c.label === category);
        return cat || COMPETENCY_CATEGORIES[0];
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <BookMarked className="w-6 h-6 text-celestial-indigo" />
                        Competency Catalog
                    </h1>
                    <p className="text-silver-mist text-sm">
                        Browse and manage the complete library of organizational competencies and proficiency frameworks.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleImport}
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors"
                    >
                        <Upload className="w-4 h-4" /> Import
                    </button>
                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors"
                    >
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button 
                        onClick={handleAddCompetency}
                        className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors shadow-lg shadow-celestial-indigo/20"
                    >
                        <Plus className="w-4 h-4" /> Add Competency
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-ink-black dark:text-pearl">{competencies.length}</div>
                            <div className="text-xs text-silver-mist uppercase font-bold">Total Competencies</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
                            <Check className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-ink-black dark:text-pearl">{competencies.filter(c => c.status === 'Active').length}</div>
                            <div className="text-xs text-silver-mist uppercase font-bold">Active</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                            <Grid3X3 className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-ink-black dark:text-pearl">{Array.from(new Set(competencies.map(c => c.category))).length}</div>
                            <div className="text-xs text-silver-mist uppercase font-bold">Categories</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-ink-black dark:text-pearl">{competencies.length > 0 ? Math.round(competencies.reduce((acc, c) => acc + c.usageCount, 0) / competencies.length) : 0}</div>
                            <div className="text-xs text-silver-mist uppercase font-bold">Avg. Usage</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-3">
                <button
                    onClick={() => setSelectedCategory('All')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        selectedCategory === 'All'
                            ? 'bg-celestial-indigo text-white shadow-lg shadow-celestial-indigo/20'
                            : 'bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 text-slate-600 dark:text-slate-300 hover:border-celestial-indigo/50'
                    }`}
                >
                    All Categories
                </button>
                {COMPETENCY_CATEGORIES.map(cat => (
                    <button
                        key={cat.label}
                        onClick={() => setSelectedCategory(cat.label)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            selectedCategory === cat.label
                                ? `${cat.bgColor} ${cat.color} ring-2 ring-offset-2 ring-current`
                                : 'bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 text-slate-600 dark:text-slate-300 hover:border-celestial-indigo/50'
                        }`}
                    >
                        {cat.icon}
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Search & Filters Bar */}
            <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
                        <input
                            type="text"
                            placeholder="Search competencies by name, code, or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value as CompetencyStatus | 'All')}
                            className="px-3 py-2.5 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                        >
                            <option value="All">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Draft">Draft</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Archived">Archived</option>
                        </select>
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'name' | 'usage' | 'updated')}
                            className="px-3 py-2.5 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                        >
                            <option value="name">Sort by Name</option>
                            <option value="usage">Sort by Usage</option>
                            <option value="updated">Sort by Updated</option>
                        </select>
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-colors ${
                                viewMode === 'list'
                                    ? 'bg-white dark:bg-slate-700 shadow-sm text-celestial-indigo'
                                    : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-colors ${
                                viewMode === 'grid'
                                    ? 'bg-white dark:bg-slate-700 shadow-sm text-celestial-indigo'
                                    : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-silver-mist">
                    {isLoading ? 'Loading...' : (
                        <>Showing <span className="font-bold text-ink-black dark:text-pearl">{filteredCompetencies.length}</span> competencies</>
                    )}
                </p>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 p-12 text-center">
                    <Loader2 className="w-8 h-8 text-celestial-indigo animate-spin mx-auto mb-4" />
                    <p className="text-sm text-silver-mist">Loading competencies...</p>
                </div>
            )}

            {/* Competency List */}
            {!isLoading && viewMode === 'list' ? (
                <div className="space-y-4">
                    {filteredCompetencies.map(comp => {
                        const isExpanded = expandedIds.includes(comp.id);
                        const catStyle = getCategoryStyle(comp.category);

                        return (
                            <div
                                key={comp.id}
                                className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden transition-all duration-300"
                            >
                                {/* Header Row */}
                                <div
                                    className="p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-deep-cosmos/50 transition-colors"
                                    onClick={() => toggleExpand(comp.id)}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className={`mt-1 p-2.5 rounded-xl shrink-0 ${catStyle.bgColor} ${catStyle.color}`}>
                                                {catStyle.icon}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                                        {comp.code}
                                                    </span>
                                                    <h3 className="text-lg font-bold text-ink-black dark:text-pearl">
                                                        {comp.name}
                                                    </h3>
                                                    <StatusBadge status={comp.status} />
                                                </div>
                                                <p className="text-sm text-silver-mist line-clamp-2">{comp.description}</p>
                                                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        {(comp.applicableRoles || []).length} roles
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Layers className="w-3 h-3" />
                                                        {(comp.proficiencyLevels || []).length} levels
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <TrendingUp className="w-3 h-3" />
                                                        {comp.usageCount} uses
                                                    </span>
                                                    <span>v{comp.version}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="hidden md:flex items-center gap-1">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); toggleExpand(comp.id); }}
                                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleEditCompetency(comp); }}
                                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteCompetency(comp.id); }}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="text-slate-400">
                                                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="border-t border-cloud dark:border-nebula-purple/20 bg-slate-50 dark:bg-deep-cosmos/30 animate-in slide-in-from-top-2 duration-200">
                                        {/* Proficiency Levels */}
                                        <div className="p-6">
                                            <h4 className="font-bold text-sm text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                                                <Star className="w-4 h-4 text-amber-500" />
                                                Proficiency Framework
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                                {(comp.proficiencyLevels || []).map(level => (
                                                    <ProficiencyCard key={level.levelNumber} proficiency={level} />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Additional Details */}
                                        <div className="border-t border-cloud dark:border-nebula-purple/20 p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {/* Applicable Roles */}
                                                <div>
                                                    <h5 className="font-bold text-xs text-slate-500 uppercase mb-3 flex items-center gap-2">
                                                        <Users className="w-4 h-4" /> Applicable Roles
                                                    </h5>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(comp.applicableRoles || []).map((role, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="px-2 py-1 bg-white dark:bg-stellar-blue border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300"
                                                            >
                                                                {role}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Assessment Criteria */}
                                                <div>
                                                    <h5 className="font-bold text-xs text-slate-500 uppercase mb-3 flex items-center gap-2">
                                                        <Target className="w-4 h-4" /> Assessment Criteria
                                                    </h5>
                                                    <ul className="space-y-2">
                                                        {(comp.assessmentCriteria || []).map((criterion, idx) => (
                                                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                                                                <ChevronRight className="w-3 h-3 mt-0.5 text-celestial-indigo shrink-0" />
                                                                {criterion}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Development Resources */}
                                                <div>
                                                    <h5 className="font-bold text-xs text-slate-500 uppercase mb-3 flex items-center gap-2">
                                                        <Lightbulb className="w-4 h-4" /> Development Resources
                                                    </h5>
                                                    <ul className="space-y-2">
                                                        {(comp.developmentResources || []).map((resource, idx) => (
                                                            <li
                                                                key={idx}
                                                                className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-stellar-blue border border-slate-200 dark:border-slate-700 rounded-lg"
                                                            >
                                                                <div>
                                                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                                                                        {resource.title}
                                                                    </span>
                                                                    <span className="ml-2 text-[10px] font-bold uppercase text-slate-400">
                                                                        {resource.type}
                                                                    </span>
                                                                </div>
                                                                {resource.url && (
                                                                    <ChevronRight className="w-3 h-3 text-slate-400" />
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Related Competencies & Meta */}
                                        <div className="border-t border-cloud dark:border-nebula-purple/20 p-6">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-500 uppercase">Related:</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(comp.relatedCompetencies || []).map((rel, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="px-2 py-1 bg-celestial-indigo/10 text-celestial-indigo rounded-lg text-xs font-medium cursor-pointer hover:bg-celestial-indigo/20 transition-colors"
                                                            >
                                                                {rel}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-slate-400">
                                                    <span>Owner: <span className="font-medium text-slate-600 dark:text-slate-300">{comp.owner}</span></span>
                                                    <span>Updated: <span className="font-medium text-slate-600 dark:text-slate-300">{new Date(comp.lastUpdated).toLocaleDateString()}</span></span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : !isLoading ? (
                /* Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCompetencies.map(comp => {
                        const catStyle = getCategoryStyle(comp.category);

                        return (
                            <div
                                key={comp.id}
                                className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm p-6 hover:shadow-md hover:border-celestial-indigo/30 transition-all cursor-pointer group"
                                onClick={() => toggleExpand(comp.id)}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-2.5 rounded-xl ${catStyle.bgColor} ${catStyle.color}`}>
                                        {catStyle.icon}
                                    </div>
                                    <StatusBadge status={comp.status} />
                                </div>

                                <span className="text-[10px] font-mono font-bold text-slate-400">{comp.code}</span>
                                <h3 className="text-lg font-bold text-ink-black dark:text-pearl mt-1 mb-2 group-hover:text-celestial-indigo transition-colors">
                                    {comp.name}
                                </h3>
                                <p className="text-sm text-silver-mist line-clamp-3 mb-4">{comp.description}</p>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Layers className="w-3 h-3" />
                                            {(comp.proficiencyLevels || []).length}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" />
                                            {comp.usageCount}
                                        </span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-celestial-indigo group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : null}

            {/* Empty State */}
            {!isLoading && filteredCompetencies.length === 0 && (
                <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-ink-black dark:text-pearl mb-2">No competencies found</h3>
                    <p className="text-sm text-silver-mist mb-6">
                        Try adjusting your search or filter criteria to find what you're looking for.
                    </p>
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory('All');
                            setSelectedStatus('All');
                        }}
                        className="px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            )}

            {/* Add/Edit Competency Sheet */}
            <Sheet
                isOpen={isSheetOpen}
                onClose={() => { setIsSheetOpen(false); setEditingCompetency(null); }}
                title={editingCompetency?.id ? 'Edit Competency' : 'New Competency'}
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => { setIsSheetOpen(false); setEditingCompetency(null); }}
                            disabled={isSaving}
                            className="px-4 py-2 text-sm font-medium text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveCompetency}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo hover:bg-celestial-indigo/90 text-white rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50"
                        >
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {isSaving ? 'Saving...' : (editingCompetency?.id ? 'Save Changes' : 'Create Competency')}
                        </button>
                    </div>
                }
            >
                {editingCompetency && (
                    <div className="space-y-5">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h4 className="font-bold text-sm text-ink-black dark:text-pearl flex items-center gap-2 pb-2 border-b border-cloud dark:border-nebula-purple/30">
                                <Info className="w-4 h-4 text-celestial-indigo" />
                                Basic Information
                            </h4>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Code *</label>
                                    <input
                                        type="text"
                                        value={editingCompetency.code || ''}
                                        onChange={(e) => handleFieldChange('code', e.target.value)}
                                        placeholder="e.g., TECH-001"
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Version</label>
                                    <input
                                        type="text"
                                        value={editingCompetency.version || '1.0'}
                                        onChange={(e) => handleFieldChange('version', e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Name *</label>
                                <input
                                    type="text"
                                    value={editingCompetency.name || ''}
                                    onChange={(e) => handleFieldChange('name', e.target.value)}
                                    placeholder="Enter competency name"
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Category *</label>
                                    <select
                                        value={editingCompetency.category || 'Technical'}
                                        onChange={(e) => handleFieldChange('category', e.target.value as CompetencyCategory)}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                                    >
                                        {COMPETENCY_CATEGORIES.map(cat => (
                                            <option key={cat.label} value={cat.label}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Subcategory</label>
                                    <input
                                        type="text"
                                        value={editingCompetency.subcategory || ''}
                                        onChange={(e) => handleFieldChange('subcategory', e.target.value)}
                                        placeholder="e.g., Engineering"
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Description *</label>
                                <textarea
                                    value={editingCompetency.description || ''}
                                    onChange={(e) => handleFieldChange('description', e.target.value)}
                                    placeholder="Describe the competency..."
                                    rows={3}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Status</label>
                                    <select
                                        value={editingCompetency.status || 'Draft'}
                                        onChange={(e) => handleFieldChange('status', e.target.value as CompetencyStatus)}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                                    >
                                        <option value="Draft">Draft</option>
                                        <option value="Under Review">Under Review</option>
                                        <option value="Active">Active</option>
                                        <option value="Archived">Archived</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Owner</label>
                                    <input
                                        type="text"
                                        value={editingCompetency.owner || ''}
                                        onChange={(e) => handleFieldChange('owner', e.target.value)}
                                        placeholder="e.g., Engineering Team"
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Applicable Roles */}
                        <div className="space-y-3">
                            <h4 className="font-bold text-sm text-ink-black dark:text-pearl flex items-center gap-2 pb-2 border-b border-cloud dark:border-nebula-purple/30">
                                <Users className="w-4 h-4 text-celestial-indigo" />
                                Applicable Roles
                            </h4>
                            <div>
                                <input
                                    type="text"
                                    value={(editingCompetency.applicableRoles || []).join(', ')}
                                    onChange={(e) => handleFieldChange('applicableRoles', e.target.value.split(',').map(r => r.trim()).filter(Boolean))}
                                    placeholder="Enter roles separated by commas (e.g., Software Engineer, Tech Lead)"
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">Separate multiple roles with commas</p>
                            </div>
                        </div>

                        {/* Assessment Criteria */}
                        <div className="space-y-3">
                            <h4 className="font-bold text-sm text-ink-black dark:text-pearl flex items-center gap-2 pb-2 border-b border-cloud dark:border-nebula-purple/30">
                                <Target className="w-4 h-4 text-celestial-indigo" />
                                Assessment Criteria
                            </h4>
                            <div>
                                <textarea
                                    value={(editingCompetency.assessmentCriteria || []).join('\n')}
                                    onChange={(e) => handleFieldChange('assessmentCriteria', e.target.value.split('\n').filter(Boolean))}
                                    placeholder="Enter each criterion on a new line"
                                    rows={4}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl resize-none"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">Enter each criterion on a separate line</p>
                            </div>
                        </div>

                        {/* Related Competencies */}
                        <div className="space-y-3">
                            <h4 className="font-bold text-sm text-ink-black dark:text-pearl flex items-center gap-2 pb-2 border-b border-cloud dark:border-nebula-purple/30">
                                <Layers className="w-4 h-4 text-celestial-indigo" />
                                Related Competencies
                            </h4>
                            <div>
                                <input
                                    type="text"
                                    value={(editingCompetency.relatedCompetencies || []).join(', ')}
                                    onChange={(e) => handleFieldChange('relatedCompetencies', e.target.value.split(',').map(r => r.trim()).filter(Boolean))}
                                    placeholder="Enter related competencies separated by commas"
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </Sheet>
        </div>
    );
}
