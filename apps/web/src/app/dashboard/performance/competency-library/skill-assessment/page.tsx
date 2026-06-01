"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    ClipboardCheck,
    Plus,
    Search,
    Filter,
    Edit3,
    Eye,
    Copy,
    Trash2,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    Users,
    User,
    Calendar,
    Clock,
    Target,
    Award,
    TrendingUp,
    TrendingDown,
    Minus,
    BarChart3,
    Play,
    Pause,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Send,
    Download,
    Upload,
    RefreshCw,
    Star,
    MessageSquare,
    FileText,
    Sparkles,
    BrainCircuit,
    Zap,
    Shield,
    Code,
    Heart,
    Crown,
    Briefcase,
    MoreHorizontal,
    ArrowUpRight,
    ArrowDownRight,
    Check,
    X,
    Info,
    UserCheck,
    UserX,
    Timer,
    Percent,
    Save,
    UserPlus,
    Loader2,
} from 'lucide-react';
import { Sheet } from '@aura/ui/components/ui';
import { AssessmentService } from '@/services/competency-library.service';

// --- TYPES ---

type AssessmentStatus = 'Not Started' | 'In Progress' | 'Pending Review' | 'Completed' | 'Expired';
type AssessmentType = 'Self' | 'Manager' | '360' | 'Peer' | 'Technical';
type CompetencyCategory = 'Technical' | 'Leadership' | 'Behavioral' | 'Functional' | 'Core';
type ProficiencyLevel = 0 | 1 | 2 | 3 | 4 | 5;

interface CompetencyRating {
    competencyId: string;
    competencyName: string;
    category: CompetencyCategory;
    selfRating: ProficiencyLevel;
    managerRating?: ProficiencyLevel;
    peerRating?: ProficiencyLevel;
    targetLevel: ProficiencyLevel;
    gap: number;
    trend: 'up' | 'down' | 'stable';
    evidence?: string;
    feedback?: string;
}

interface Assessment {
    id: string;
    employeeId: string;
    employeeName: string;
    employeeRole: string;
    employeeDepartment: string;
    employeeAvatar?: string;
    assessmentType: AssessmentType;
    cycleId: string;
    cycleName: string;
    status: AssessmentStatus;
    dueDate: string;
    startedDate?: string;
    completedDate?: string;
    progress: number;
    totalCompetencies: number;
    completedCompetencies: number;
    overallScore?: number;
    ratings: CompetencyRating[];
    assessors?: {
        id: string;
        name: string;
        role: string;
        status: 'Pending' | 'Completed';
    }[];
}

interface AssessmentCycle {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: 'Active' | 'Upcoming' | 'Completed';
    totalAssessments: number;
    completedAssessments: number;
}

// --- MOCK DATA ---

const CATEGORY_STYLES: Record<CompetencyCategory, { icon: React.ReactNode; color: string; bgColor: string }> = {
    Technical: { icon: <Code className="w-3.5 h-3.5" />, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
    Leadership: { icon: <Crown className="w-3.5 h-3.5" />, color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
    Behavioral: { icon: <Heart className="w-3.5 h-3.5" />, color: 'text-rose-600', bgColor: 'bg-rose-100 dark:bg-rose-900/30' },
    Functional: { icon: <Briefcase className="w-3.5 h-3.5" />, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
    Core: { icon: <Star className="w-3.5 h-3.5" />, color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
};

const ASSESSMENT_CYCLES: AssessmentCycle[] = [
    { id: 'CYC-001', name: 'Q4 2025 Assessment', startDate: '2025-10-01', endDate: '2025-12-31', status: 'Active', totalAssessments: 156, completedAssessments: 89 },
    { id: 'CYC-002', name: 'Annual Review 2025', startDate: '2025-11-15', endDate: '2026-01-15', status: 'Active', totalAssessments: 312, completedAssessments: 45 },
    { id: 'CYC-003', name: 'Q1 2026 Assessment', startDate: '2026-01-01', endDate: '2026-03-31', status: 'Upcoming', totalAssessments: 0, completedAssessments: 0 },
];

const ASSESSMENTS: Assessment[] = [
    {
        id: 'ASM-001',
        employeeId: 'EMP-001',
        employeeName: 'Sarah Chen',
        employeeRole: 'Senior Software Engineer',
        employeeDepartment: 'Engineering',
        assessmentType: 'Self',
        cycleId: 'CYC-001',
        cycleName: 'Q4 2025 Assessment',
        status: 'Completed',
        dueDate: '2025-12-15',
        startedDate: '2025-11-20',
        completedDate: '2025-12-01',
        progress: 100,
        totalCompetencies: 7,
        completedCompetencies: 7,
        overallScore: 3.7,
        ratings: [
            { competencyId: 'COMP-001', competencyName: 'Software Development', category: 'Technical', selfRating: 4, managerRating: 4, targetLevel: 4, gap: 0, trend: 'stable', evidence: 'Led the migration to microservices architecture' },
            { competencyId: 'COMP-006', competencyName: 'Data Analysis', category: 'Technical', selfRating: 3, managerRating: 3, targetLevel: 3, gap: 0, trend: 'up', evidence: 'Built analytics dashboard for product metrics' },
            { competencyId: 'COMP-003', competencyName: 'Effective Communication', category: 'Behavioral', selfRating: 4, managerRating: 3, targetLevel: 3, gap: 0, trend: 'up' },
            { competencyId: 'COMP-008', competencyName: 'Problem Solving', category: 'Behavioral', selfRating: 4, managerRating: 4, targetLevel: 4, gap: 0, trend: 'stable' },
            { competencyId: 'COMP-005', competencyName: 'Customer Focus', category: 'Core', selfRating: 3, managerRating: 3, targetLevel: 3, gap: 0, trend: 'stable' },
            { competencyId: 'COMP-007', competencyName: 'Team Leadership', category: 'Leadership', selfRating: 3, managerRating: 2, targetLevel: 2, gap: 0, trend: 'up' },
            { competencyId: 'COMP-002', competencyName: 'Strategic Thinking', category: 'Leadership', selfRating: 2, managerRating: 2, targetLevel: 2, gap: 0, trend: 'stable' },
        ]
    },
    {
        id: 'ASM-002',
        employeeId: 'EMP-002',
        employeeName: 'Michael Torres',
        employeeRole: 'Product Manager',
        employeeDepartment: 'Product',
        assessmentType: '360',
        cycleId: 'CYC-001',
        cycleName: 'Q4 2025 Assessment',
        status: 'In Progress',
        dueDate: '2025-12-20',
        startedDate: '2025-12-05',
        progress: 60,
        totalCompetencies: 6,
        completedCompetencies: 4,
        ratings: [
            { competencyId: 'COMP-002', competencyName: 'Strategic Thinking', category: 'Leadership', selfRating: 4, targetLevel: 4, gap: 0, trend: 'up' },
            { competencyId: 'COMP-005', competencyName: 'Customer Focus', category: 'Core', selfRating: 4, targetLevel: 4, gap: 0, trend: 'stable' },
            { competencyId: 'COMP-003', competencyName: 'Effective Communication', category: 'Behavioral', selfRating: 4, targetLevel: 4, gap: 0, trend: 'up' },
            { competencyId: 'COMP-006', competencyName: 'Data Analysis', category: 'Technical', selfRating: 3, targetLevel: 3, gap: 0, trend: 'stable' },
            { competencyId: 'COMP-004', competencyName: 'Project Management', category: 'Functional', selfRating: 0, targetLevel: 3, gap: -3, trend: 'stable' },
            { competencyId: 'COMP-008', competencyName: 'Problem Solving', category: 'Behavioral', selfRating: 0, targetLevel: 3, gap: -3, trend: 'stable' },
        ],
        assessors: [
            { id: 'ASR-001', name: 'Jennifer Lee', role: 'Manager', status: 'Completed' },
            { id: 'ASR-002', name: 'David Kim', role: 'Peer', status: 'Completed' },
            { id: 'ASR-003', name: 'Emily Wang', role: 'Peer', status: 'Pending' },
            { id: 'ASR-004', name: 'James Wilson', role: 'Direct Report', status: 'Pending' },
        ]
    },
    {
        id: 'ASM-003',
        employeeId: 'EMP-003',
        employeeName: 'Emily Rodriguez',
        employeeRole: 'Engineering Manager',
        employeeDepartment: 'Engineering',
        assessmentType: 'Manager',
        cycleId: 'CYC-002',
        cycleName: 'Annual Review 2025',
        status: 'Pending Review',
        dueDate: '2026-01-10',
        startedDate: '2025-12-01',
        progress: 100,
        totalCompetencies: 6,
        completedCompetencies: 6,
        overallScore: 4.2,
        ratings: [
            { competencyId: 'COMP-007', competencyName: 'Team Leadership', category: 'Leadership', selfRating: 4, managerRating: 5, targetLevel: 4, gap: 1, trend: 'up' },
            { competencyId: 'COMP-002', competencyName: 'Strategic Thinking', category: 'Leadership', selfRating: 4, managerRating: 4, targetLevel: 3, gap: 1, trend: 'up' },
            { competencyId: 'COMP-001', competencyName: 'Software Development', category: 'Technical', selfRating: 3, managerRating: 4, targetLevel: 3, gap: 1, trend: 'stable' },
            { competencyId: 'COMP-003', competencyName: 'Effective Communication', category: 'Behavioral', selfRating: 4, managerRating: 4, targetLevel: 4, gap: 0, trend: 'up' },
            { competencyId: 'COMP-004', competencyName: 'Project Management', category: 'Functional', selfRating: 4, managerRating: 4, targetLevel: 3, gap: 1, trend: 'stable' },
            { competencyId: 'COMP-005', competencyName: 'Customer Focus', category: 'Core', selfRating: 3, managerRating: 3, targetLevel: 3, gap: 0, trend: 'stable' },
        ]
    },
    {
        id: 'ASM-004',
        employeeId: 'EMP-004',
        employeeName: 'David Kim',
        employeeRole: 'Software Engineer',
        employeeDepartment: 'Engineering',
        assessmentType: 'Self',
        cycleId: 'CYC-001',
        cycleName: 'Q4 2025 Assessment',
        status: 'Not Started',
        dueDate: '2025-12-18',
        progress: 0,
        totalCompetencies: 7,
        completedCompetencies: 0,
        ratings: []
    },
    {
        id: 'ASM-005',
        employeeId: 'EMP-005',
        employeeName: 'Jessica Martinez',
        employeeRole: 'Sales Representative',
        employeeDepartment: 'Sales',
        assessmentType: 'Self',
        cycleId: 'CYC-001',
        cycleName: 'Q4 2025 Assessment',
        status: 'Expired',
        dueDate: '2025-12-01',
        progress: 40,
        totalCompetencies: 5,
        completedCompetencies: 2,
        ratings: [
            { competencyId: 'COMP-003', competencyName: 'Effective Communication', category: 'Behavioral', selfRating: 4, targetLevel: 4, gap: 0, trend: 'stable' },
            { competencyId: 'COMP-005', competencyName: 'Customer Focus', category: 'Core', selfRating: 4, targetLevel: 4, gap: 0, trend: 'up' },
        ]
    },
    {
        id: 'ASM-006',
        employeeId: 'EMP-006',
        employeeName: 'Robert Chen',
        employeeRole: 'HR Business Partner',
        employeeDepartment: 'People & Culture',
        assessmentType: 'Self',
        cycleId: 'CYC-002',
        cycleName: 'Annual Review 2025',
        status: 'In Progress',
        dueDate: '2026-01-05',
        startedDate: '2025-12-10',
        progress: 33,
        totalCompetencies: 6,
        completedCompetencies: 2,
        ratings: [
            { competencyId: 'COMP-003', competencyName: 'Effective Communication', category: 'Behavioral', selfRating: 4, targetLevel: 4, gap: 0, trend: 'up' },
            { competencyId: 'COMP-002', competencyName: 'Strategic Thinking', category: 'Leadership', selfRating: 3, targetLevel: 3, gap: 0, trend: 'stable' },
        ]
    },
];

const STATS = {
    totalAssessments: ASSESSMENTS.length,
    completed: ASSESSMENTS.filter(a => a.status === 'Completed').length,
    inProgress: ASSESSMENTS.filter(a => a.status === 'In Progress').length,
    pending: ASSESSMENTS.filter(a => a.status === 'Pending Review').length,
    notStarted: ASSESSMENTS.filter(a => a.status === 'Not Started').length,
    overdue: ASSESSMENTS.filter(a => a.status === 'Expired').length,
    avgCompletion: Math.round(ASSESSMENTS.reduce((acc, a) => acc + a.progress, 0) / ASSESSMENTS.length)
};

// --- COMPONENTS ---

const StatusBadge: React.FC<{ status: AssessmentStatus }> = ({ status }) => {
    const styles: Record<AssessmentStatus, { bg: string; icon: React.ReactNode }> = {
        'Not Started': { bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', icon: <Clock className="w-3 h-3" /> },
        'In Progress': { bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: <Play className="w-3 h-3" /> },
        'Pending Review': { bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: <AlertCircle className="w-3 h-3" /> },
        Completed: { bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: <CheckCircle2 className="w-3 h-3" /> },
        Expired: { bg: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', icon: <XCircle className="w-3 h-3" /> },
    };
    const style = styles[status];
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${style.bg}`}>
            {style.icon}
            {status}
        </span>
    );
};

const AssessmentTypeBadge: React.FC<{ type: AssessmentType }> = ({ type }) => {
    const styles: Record<AssessmentType, string> = {
        Self: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
        Manager: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        360: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
        Peer: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
        Technical: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${styles[type]}`}>
            {type}
        </span>
    );
};

const ProficiencyBar: React.FC<{ value: ProficiencyLevel; target: ProficiencyLevel; showLabels?: boolean }> = ({ value, target, showLabels = false }) => {
    const getColor = (level: number, isTarget: boolean) => {
        if (isTarget) return 'bg-slate-300 dark:bg-slate-600';
        if (level === 0) return 'bg-slate-200 dark:bg-slate-700';
        if (value >= target) return 'bg-emerald-500';
        if (value >= target - 1) return 'bg-amber-500';
        return 'bg-rose-500';
    };

    return (
        <div className="space-y-1">
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(level => (
                    <div key={level} className="relative flex-1 h-2">
                        {/* Target indicator */}
                        {level <= target && (
                            <div className={`absolute inset-0 rounded-sm ${level <= target ? 'bg-slate-200 dark:bg-slate-700' : ''}`} />
                        )}
                        {/* Actual value */}
                        {level <= value && (
                            <div className={`absolute inset-0 rounded-sm ${getColor(level, false)}`} />
                        )}
                    </div>
                ))}
            </div>
            {showLabels && (
                <div className="flex justify-between text-[10px] text-slate-400">
                    <span>L{value}/5</span>
                    <span>Target: L{target}</span>
                </div>
            )}
        </div>
    );
};

const TrendIndicator: React.FC<{ trend: 'up' | 'down' | 'stable' }> = ({ trend }) => {
    if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />;
    if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5 text-rose-500" />;
    return <Minus className="w-3.5 h-3.5 text-slate-400" />;
};

const ProgressRing: React.FC<{ progress: number; size?: number; strokeWidth?: number }> = ({ 
    progress, 
    size = 48, 
    strokeWidth = 4 
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    const getColor = () => {
        if (progress === 100) return 'text-emerald-500';
        if (progress >= 60) return 'text-blue-500';
        if (progress >= 30) return 'text-amber-500';
        return 'text-rose-500';
    };

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle
                    className="text-slate-200 dark:text-slate-700"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    className={getColor()}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-ink-black dark:text-pearl">{progress}%</span>
            </div>
        </div>
    );
};

const CompetencyRatingRow: React.FC<{ rating: CompetencyRating }> = ({ rating }) => {
    const catStyle = CATEGORY_STYLES[rating.category];
    const gap = rating.selfRating - rating.targetLevel;

    return (
        <div className="p-3 bg-white dark:bg-stellar-blue rounded-xl border border-slate-200 dark:border-slate-700 hover:border-celestial-indigo/30 transition-colors">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 ${catStyle.bgColor} ${catStyle.color}`}>
                        {catStyle.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm text-ink-black dark:text-pearl truncate">
                                {rating.competencyName}
                            </h4>
                            <TrendIndicator trend={rating.trend} />
                        </div>
                        <div className="mt-2 max-w-xs">
                            <ProficiencyBar value={rating.selfRating} target={rating.targetLevel} />
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    {/* Self Rating */}
                    <div className="text-center">
                        <div className="text-lg font-bold text-ink-black dark:text-pearl">
                            {rating.selfRating || '—'}
                        </div>
                        <div className="text-[9px] uppercase text-slate-400">Self</div>
                    </div>
                    {/* Manager Rating */}
                    {rating.managerRating !== undefined && (
                        <div className="text-center border-l border-slate-200 dark:border-slate-700 pl-4">
                            <div className="text-lg font-bold text-purple-600">
                                {rating.managerRating}
                            </div>
                            <div className="text-[9px] uppercase text-slate-400">Manager</div>
                        </div>
                    )}
                    {/* Gap */}
                    <div className="text-center border-l border-slate-200 dark:border-slate-700 pl-4">
                        <div className={`text-lg font-bold ${
                            gap > 0 ? 'text-emerald-600' : gap < 0 ? 'text-rose-600' : 'text-slate-500'
                        }`}>
                            {gap > 0 ? `+${gap}` : gap}
                        </div>
                        <div className="text-[9px] uppercase text-slate-400">Gap</div>
                    </div>
                </div>
            </div>
            {rating.evidence && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2">
                        <FileText className="w-3 h-3 mt-0.5 shrink-0 text-celestial-indigo" />
                        {rating.evidence}
                    </p>
                </div>
            )}
        </div>
    );
};

export default function SkillAssessmentPage() {
    const [expandedAssessments, setExpandedAssessments] = useState<string[]>(['ASM-001']);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<AssessmentStatus | 'All'>('All');
    const [selectedType, setSelectedType] = useState<AssessmentType | 'All'>('All');
    const [selectedCycle, setSelectedCycle] = useState<string>('All');
    
    // Sheet state for new/edit assessment
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch assessments from API on mount
    const fetchAssessments = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: any = {};
            if (selectedStatus !== 'All') params.status = selectedStatus;
            if (selectedType !== 'All') params.type = selectedType;
            if (selectedCycle !== 'All') params.cycleId = selectedCycle;
            
            const result = await AssessmentService.getAll(params);
            if (result.success) {
                // Cast data to local type since service uses shared types
                setAssessments(result.data as any);
                // Expand first assessment by default
                if (result.data.length > 0) {
                    setExpandedAssessments([result.data[0].id]);
                }
            }
        } catch (error: any) {
            console.error('Error:', error);
            console.error('Failed to fetch assessments:', error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedStatus, selectedType, selectedCycle]);

    useEffect(() => {
        fetchAssessments();
    }, [fetchAssessments]);
    
    // Form state
    const [formData, setFormData] = useState<{
        employeeName: string;
        employeeRole: string;
        employeeDepartment: string;
        assessmentType: AssessmentType;
        cycleId: string;
        dueDate: string;
        competencies: { id: string; name: string; category: CompetencyCategory; targetLevel: ProficiencyLevel }[];
        assessors: { name: string; role: string; email: string }[];
        instructions: string;
    }>({
        employeeName: '',
        employeeRole: '',
        employeeDepartment: '',
        assessmentType: 'Self',
        cycleId: '',
        dueDate: '',
        competencies: [],
        assessors: [],
        instructions: '',
    });
    
    // Available employees for selection
    const EMPLOYEES = [
        { id: 'EMP-001', name: 'Sarah Chen', role: 'Senior Software Engineer', department: 'Engineering' },
        { id: 'EMP-002', name: 'Michael Torres', role: 'Product Manager', department: 'Product' },
        { id: 'EMP-003', name: 'Emily Rodriguez', role: 'Engineering Manager', department: 'Engineering' },
        { id: 'EMP-004', name: 'Alex Johnson', role: 'UX Designer', department: 'Design' },
        { id: 'EMP-005', name: 'David Kim', role: 'Data Analyst', department: 'Analytics' },
        { id: 'EMP-006', name: 'Jennifer Lee', role: 'HR Business Partner', department: 'People & Culture' },
        { id: 'EMP-007', name: 'Robert Martinez', role: 'Sales Representative', department: 'Sales' },
        { id: 'EMP-008', name: 'Lisa Wang', role: 'Financial Analyst', department: 'Finance' },
    ];
    
    // Available competencies for selection
    const AVAILABLE_COMPETENCIES = [
        { id: 'COMP-001', name: 'Software Development', category: 'Technical' as CompetencyCategory },
        { id: 'COMP-002', name: 'Strategic Thinking', category: 'Leadership' as CompetencyCategory },
        { id: 'COMP-003', name: 'Effective Communication', category: 'Behavioral' as CompetencyCategory },
        { id: 'COMP-004', name: 'Project Management', category: 'Functional' as CompetencyCategory },
        { id: 'COMP-005', name: 'Customer Focus', category: 'Core' as CompetencyCategory },
        { id: 'COMP-006', name: 'Data Analysis', category: 'Technical' as CompetencyCategory },
        { id: 'COMP-007', name: 'Team Leadership', category: 'Leadership' as CompetencyCategory },
        { id: 'COMP-008', name: 'Problem Solving', category: 'Behavioral' as CompetencyCategory },
        { id: 'COMP-009', name: 'Innovation', category: 'Core' as CompetencyCategory },
        { id: 'COMP-010', name: 'Collaboration', category: 'Behavioral' as CompetencyCategory },
        { id: 'COMP-011', name: 'Time Management', category: 'Functional' as CompetencyCategory },
        { id: 'COMP-012', name: 'Decision Making', category: 'Leadership' as CompetencyCategory },
    ];
    
    const handleNewAssessment = () => {
        setEditingAssessment(null);
        setFormData({
            employeeName: '',
            employeeRole: '',
            employeeDepartment: '',
            assessmentType: 'Self',
            cycleId: ASSESSMENT_CYCLES.find(c => c.status === 'Active')?.id || '',
            dueDate: '',
            competencies: [],
            assessors: [],
            instructions: '',
        });
        setIsSheetOpen(true);
    };
    
    const handleEditAssessment = (assessment: Assessment) => {
        setEditingAssessment(assessment);
        setFormData({
            employeeName: assessment.employeeName,
            employeeRole: assessment.employeeRole,
            employeeDepartment: assessment.employeeDepartment,
            assessmentType: assessment.assessmentType,
            cycleId: assessment.cycleId,
            dueDate: assessment.dueDate,
            competencies: assessment.ratings.map(r => ({
                id: r.competencyId,
                name: r.competencyName,
                category: r.category,
                targetLevel: r.targetLevel,
            })),
            assessors: assessment.assessors?.map(a => ({ name: a.name, role: a.role, email: '' })) || [],
            instructions: '',
        });
        setIsSheetOpen(true);
    };
    
    const handleSaveAssessment = async () => {
        setIsSaving(true);
        try {
            if (editingAssessment) {
                // Update existing via API
                const result = await AssessmentService.update(editingAssessment.id, {
                    employeeName: formData.employeeName,
                    employeeRole: formData.employeeRole,
                    employeeDepartment: formData.employeeDepartment,
                    assessmentType: formData.assessmentType,
                    cycleId: formData.cycleId,
                    dueDate: formData.dueDate,
                } as any);
                if (result.success && result.data) {
                    setAssessments(prev => prev.map(a => 
                        a.id === editingAssessment.id ? (result.data as any) : a
                    ));
                }
            } else {
                // Create new via API
                const result = await AssessmentService.create({
                    employeeId: `EMP-${String(Date.now()).slice(-3)}`,
                    employeeName: formData.employeeName,
                    employeeRole: formData.employeeRole,
                    employeeDepartment: formData.employeeDepartment,
                    assessmentType: formData.assessmentType,
                    cycleId: formData.cycleId,
                    dueDate: formData.dueDate,
                    competencies: formData.competencies,
                    assessors: formData.assessors,
                } as any);
                if (result.success && result.data) {
                    setAssessments(prev => [...prev, result.data as any]);
                }
            }
            setIsSheetOpen(false);
        } catch (error: any) {
            console.error('Error:', error);
            console.error('Failed to save assessment:', error);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDeleteAssessment = async (assessmentId: string) => {
        if (confirm('Are you sure you want to delete this assessment?')) {
            try {
                const result = await AssessmentService.delete(assessmentId);
                if (result.success) {
                    setAssessments(prev => prev.filter(a => a.id !== assessmentId));
                }
            } catch (error: any) {
            console.error('Error:', error);
                console.error('Failed to delete assessment:', error);
            }
        }
    };
    
    const handleSelectEmployee = (employeeId: string) => {
        const emp = EMPLOYEES.find(e => e.id === employeeId);
        if (emp) {
            setFormData(prev => ({
                ...prev,
                employeeName: emp.name,
                employeeRole: emp.role,
                employeeDepartment: emp.department,
            }));
        }
    };
    
    const handleAddCompetency = () => {
        setFormData(prev => ({
            ...prev,
            competencies: [...prev.competencies, { id: '', name: '', category: 'Core' as CompetencyCategory, targetLevel: 3 as ProficiencyLevel }],
        }));
    };
    
    const handleUpdateCompetency = (index: number, competencyId: string) => {
        const comp = AVAILABLE_COMPETENCIES.find(c => c.id === competencyId);
        if (comp) {
            setFormData(prev => ({
                ...prev,
                competencies: prev.competencies.map((c, i) => 
                    i === index ? { ...c, id: comp.id, name: comp.name, category: comp.category } : c
                ),
            }));
        }
    };
    
    const handleUpdateTargetLevel = (index: number, level: ProficiencyLevel) => {
        setFormData(prev => ({
            ...prev,
            competencies: prev.competencies.map((c, i) => 
                i === index ? { ...c, targetLevel: level } : c
            ),
        }));
    };
    
    const handleRemoveCompetency = (index: number) => {
        setFormData(prev => ({
            ...prev,
            competencies: prev.competencies.filter((_, i) => i !== index),
        }));
    };
    
    const handleAddAssessor = () => {
        setFormData(prev => ({
            ...prev,
            assessors: [...prev.assessors, { name: '', role: 'Peer', email: '' }],
        }));
    };
    
    const handleUpdateAssessor = (index: number, field: 'name' | 'role' | 'email', value: string) => {
        setFormData(prev => ({
            ...prev,
            assessors: prev.assessors.map((a, i) => 
                i === index ? { ...a, [field]: value } : a
            ),
        }));
    };
    
    const handleRemoveAssessor = (index: number) => {
        setFormData(prev => ({
            ...prev,
            assessors: prev.assessors.filter((_, i) => i !== index),
        }));
    };

    const toggleAssessment = (id: string) => {
        setExpandedAssessments(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const filteredAssessments = useMemo(() => {
        let result = assessments;

        if (selectedStatus !== 'All') {
            result = result.filter(a => a.status === selectedStatus);
        }

        if (selectedType !== 'All') {
            result = result.filter(a => a.assessmentType === selectedType);
        }

        if (selectedCycle !== 'All') {
            result = result.filter(a => a.cycleId === selectedCycle);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(a =>
                a.employeeName.toLowerCase().includes(query) ||
                a.employeeRole.toLowerCase().includes(query) ||
                a.employeeDepartment.toLowerCase().includes(query)
            );
        }

        return result;
    }, [selectedStatus, selectedType, selectedCycle, searchQuery]);

    const getDaysRemaining = (dueDate: string) => {
        const due = new Date(dueDate);
        const now = new Date();
        const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    return (
        <div className="space-y-4 pb-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <ClipboardCheck className="w-6 h-6 text-celestial-indigo" />
                        Skill Assessment
                    </h1>
                    <p className="text-silver-mist text-sm">
                        Evaluate competency levels through self-assessment, manager reviews, and 360-degree feedback.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors">
                        <Send className="w-4 h-4" /> Send Reminders
                    </button>
                    <button 
                        onClick={handleNewAssessment}
                        className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors shadow-lg shadow-celestial-indigo/20"
                    >
                        <Plus className="w-4 h-4" /> New Assessment
                    </button>
                </div>
            </div>

            {/* Active Cycles Banner */}
            <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-pink-500/20 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 rounded-lg">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-ink-black dark:text-pearl">Active Assessment Cycles</h3>
                            <p className="text-xs text-slate-500">{ASSESSMENT_CYCLES.filter(c => c.status === 'Active').length} active cycles in progress</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {ASSESSMENT_CYCLES.filter(c => c.status === 'Active').map(cycle => (
                            <div key={cycle.id} className="bg-white dark:bg-stellar-blue px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="text-sm font-bold text-ink-black dark:text-pearl">{cycle.name}</div>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span>{cycle.completedAssessments}/{cycle.totalAssessments}</span>
                                    <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-emerald-500 rounded-full"
                                            style={{ width: `${(cycle.completedAssessments / cycle.totalAssessments) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
                            <ClipboardCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-ink-black dark:text-pearl">{STATS.totalAssessments}</div>
                            <div className="text-[10px] text-silver-mist uppercase font-bold">Total</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-ink-black dark:text-pearl">{STATS.completed}</div>
                            <div className="text-[10px] text-silver-mist uppercase font-bold">Completed</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                            <Play className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-ink-black dark:text-pearl">{STATS.inProgress}</div>
                            <div className="text-[10px] text-silver-mist uppercase font-bold">In Progress</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-ink-black dark:text-pearl">{STATS.pending}</div>
                            <div className="text-[10px] text-silver-mist uppercase font-bold">Pending</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-lg">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-ink-black dark:text-pearl">{STATS.notStarted}</div>
                            <div className="text-[10px] text-silver-mist uppercase font-bold">Not Started</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-lg">
                            <XCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-ink-black dark:text-pearl">{STATS.overdue}</div>
                            <div className="text-[10px] text-silver-mist uppercase font-bold">Overdue</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                <div className="flex flex-col md:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
                        <input
                            type="text"
                            placeholder="Search by employee name, role, or department..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                        />
                    </div>

                    {/* Cycle Filter */}
                    <select
                        value={selectedCycle}
                        onChange={(e) => setSelectedCycle(e.target.value)}
                        className="px-3 py-2.5 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                    >
                        <option value="All">All Cycles</option>
                        {ASSESSMENT_CYCLES.map(cycle => (
                            <option key={cycle.id} value={cycle.id}>{cycle.name}</option>
                        ))}
                    </select>

                    {/* Status Filter */}
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value as AssessmentStatus | 'All')}
                        className="px-3 py-2.5 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                    >
                        <option value="All">All Status</option>
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Pending Review">Pending Review</option>
                        <option value="Completed">Completed</option>
                        <option value="Expired">Expired</option>
                    </select>

                    {/* Type Filter */}
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value as AssessmentType | 'All')}
                        className="px-3 py-2.5 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                    >
                        <option value="All">All Types</option>
                        <option value="Self">Self Assessment</option>
                        <option value="Manager">Manager Review</option>
                        <option value="360">360 Feedback</option>
                        <option value="Peer">Peer Review</option>
                        <option value="Technical">Technical</option>
                    </select>
                </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-silver-mist">
                    Showing <span className="font-bold text-ink-black dark:text-pearl">{filteredAssessments.length}</span> assessments
                </p>
            </div>

            {/* Assessments List */}
            <div className="space-y-4">
                {filteredAssessments.map(assessment => {
                    const isExpanded = expandedAssessments.includes(assessment.id);
                    const daysRemaining = getDaysRemaining(assessment.dueDate);

                    return (
                        <div
                            key={assessment.id}
                            className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden"
                        >
                            {/* Assessment Header */}
                            <div
                                className="p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-deep-cosmos/50 transition-colors"
                                onClick={() => toggleAssessment(assessment.id)}
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        {/* Avatar */}
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-celestial-indigo to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                                            {assessment.employeeName.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <h2 className="text-lg font-bold text-ink-black dark:text-pearl">{assessment.employeeName}</h2>
                                                <AssessmentTypeBadge type={assessment.assessmentType} />
                                                <StatusBadge status={assessment.status} />
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                                <span>{assessment.employeeRole}</span>
                                                <span>•</span>
                                                <span>{assessment.employeeDepartment}</span>
                                                <span>•</span>
                                                <span>{assessment.cycleName}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {/* Progress Ring */}
                                        <ProgressRing progress={assessment.progress} />

                                        {/* Due Date */}
                                        <div className="text-center">
                                            <div className={`text-sm font-bold ${
                                                assessment.status === 'Expired' ? 'text-rose-600' :
                                                daysRemaining < 0 ? 'text-rose-600' :
                                                daysRemaining <= 3 ? 'text-amber-600' : 'text-slate-600 dark:text-slate-300'
                                            }`}>
                                                {assessment.status === 'Completed' ? 'Done' :
                                                 assessment.status === 'Expired' ? 'Overdue' :
                                                 daysRemaining < 0 ? `${Math.abs(daysRemaining)}d overdue` :
                                                 daysRemaining === 0 ? 'Due today' :
                                                 `${daysRemaining}d left`}
                                            </div>
                                            <div className="text-[10px] text-slate-400">Due {new Date(assessment.dueDate).toLocaleDateString()}</div>
                                        </div>

                                        {/* Overall Score */}
                                        {assessment.overallScore && (
                                            <div className="text-center border-l border-slate-200 dark:border-slate-700 pl-4">
                                                <div className="text-2xl font-bold text-celestial-indigo">{assessment.overallScore.toFixed(1)}</div>
                                                <div className="text-[10px] text-slate-400 uppercase">Score</div>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center gap-1">
                                            {assessment.status === 'Not Started' && (
                                                <button className="p-2 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition-colors">
                                                    <Play className="w-4 h-4" />
                                                </button>
                                            )}
                                            {assessment.status === 'In Progress' && (
                                                <button className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                                <Eye className="w-4 h-4" />
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
                                <div className="border-t border-cloud dark:border-nebula-purple/20 bg-slate-50 dark:bg-deep-cosmos/30 p-6 animate-in slide-in-from-top-2 duration-200">
                                    {/* 360 Assessors (if applicable) */}
                                    {assessment.assessmentType === '360' && assessment.assessors && (
                                        <div className="mb-6">
                                            <h4 className="font-bold text-sm text-ink-black dark:text-pearl mb-3 flex items-center gap-2">
                                                <Users className="w-4 h-4 text-celestial-indigo" />
                                                Assessors ({assessment.assessors.filter(a => a.status === 'Completed').length}/{assessment.assessors.length} completed)
                                            </h4>
                                            <div className="flex flex-wrap gap-3">
                                                {assessment.assessors.map(assessor => (
                                                    <div key={assessor.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                                                        assessor.status === 'Completed' 
                                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                                                            : 'bg-white dark:bg-stellar-blue border-slate-200 dark:border-slate-700'
                                                    }`}>
                                                        {assessor.status === 'Completed' ? (
                                                            <UserCheck className="w-4 h-4 text-emerald-600" />
                                                        ) : (
                                                            <Clock className="w-4 h-4 text-slate-400" />
                                                        )}
                                                        <div>
                                                            <div className="text-sm font-medium text-ink-black dark:text-pearl">{assessor.name}</div>
                                                            <div className="text-[10px] text-slate-400">{assessor.role}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Competency Ratings */}
                                    {assessment.ratings.length > 0 ? (
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-bold text-sm text-ink-black dark:text-pearl flex items-center gap-2">
                                                    <Target className="w-4 h-4 text-celestial-indigo" />
                                                    Competency Ratings ({assessment.completedCompetencies}/{assessment.totalCompetencies})
                                                </h4>
                                                {assessment.status === 'In Progress' && (
                                                    <button className="text-xs font-bold text-celestial-indigo hover:underline flex items-center gap-1">
                                                        <Edit3 className="w-3 h-3" /> Continue Assessment
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                                {assessment.ratings.map(rating => (
                                                    <CompetencyRatingRow key={rating.competencyId} rating={rating} />
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <ClipboardCheck className="w-8 h-8 text-slate-400" />
                                            </div>
                                            <h3 className="text-lg font-bold text-ink-black dark:text-pearl mb-2">Assessment Not Started</h3>
                                            <p className="text-sm text-silver-mist mb-4">
                                                This assessment has {assessment.totalCompetencies} competencies to evaluate.
                                            </p>
                                            <button className="px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors">
                                                Start Assessment
                                            </button>
                                        </div>
                                    )}

                                    {/* Summary Stats */}
                                    {assessment.ratings.length > 0 && (
                                        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                                <div className="text-center">
                                                    <div className="text-lg font-bold text-emerald-600">
                                                        {assessment.ratings.filter(r => r.selfRating >= r.targetLevel).length}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 uppercase">At/Above Target</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-lg font-bold text-rose-600">
                                                        {assessment.ratings.filter(r => r.selfRating > 0 && r.selfRating < r.targetLevel).length}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 uppercase">Below Target</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-lg font-bold text-emerald-600">
                                                        {assessment.ratings.filter(r => r.trend === 'up').length}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 uppercase">Improving</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-lg font-bold text-slate-500">
                                                        {assessment.ratings.filter(r => r.trend === 'stable').length}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 uppercase">Stable</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-lg font-bold text-rose-600">
                                                        {assessment.ratings.filter(r => r.trend === 'down').length}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 uppercase">Declining</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Meta Info */}
                                    {(assessment.startedDate || assessment.completedDate) && (
                                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                            {assessment.startedDate && (
                                                <span>Started: {new Date(assessment.startedDate).toLocaleDateString()}</span>
                                            )}
                                            {assessment.completedDate && (
                                                <span>Completed: {new Date(assessment.completedDate).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {filteredAssessments.length === 0 && (
                <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-ink-black dark:text-pearl mb-2">No assessments found</h3>
                    <p className="text-sm text-silver-mist mb-6">
                        Try adjusting your search or filter criteria.
                    </p>
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setSelectedStatus('All');
                            setSelectedType('All');
                            setSelectedCycle('All');
                        }}
                        className="px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            )}

            {/* AI Insight Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl shadow-lg border border-indigo-500/30 text-white">
                <div className="flex items-start gap-3">
                    <div className="p-3 bg-white/10 rounded-xl">
                        <BrainCircuit className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-amber-300" />
                            <span className="text-sm font-bold uppercase opacity-80">AI Insight</span>
                        </div>
                        <h3 className="font-bold text-lg mb-2">Assessment Analytics</h3>
                        <p className="text-sm opacity-90 leading-relaxed mb-4">
                            Based on current assessment data, <strong className="text-amber-300">Technical competencies</strong> show the highest gap between self and manager ratings (avg 0.5 levels). 
                            Consider implementing more objective assessment criteria or providing calibration training for managers.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                <BarChart3 className="w-4 h-4" /> View Analytics
                            </button>
                            <button className="px-4 py-2 bg-white text-indigo-600 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors">
                                Calibration Guide
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* New/Edit Assessment Sheet */}
            <Sheet
                isOpen={isSheetOpen}
                onClose={() => { setIsSheetOpen(false); setEditingAssessment(null); }}
                title={editingAssessment ? 'Edit Assessment' : 'Create New Assessment'}
                size="xl"
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => { setIsSheetOpen(false); setEditingAssessment(null); }}
                            className="px-4 py-2 text-sm font-medium text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveAssessment}
                            disabled={!formData.employeeName || !formData.cycleId || !formData.dueDate || formData.competencies.length === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo hover:bg-celestial-indigo/90 text-white rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-4 h-4" />
                            {editingAssessment ? 'Update Assessment' : 'Create Assessment'}
                        </button>
                    </div>
                }
            >
                <div className="space-y-4">
                    {/* Description */}
                    <p className="text-sm text-silver-mist">
                        {editingAssessment 
                            ? 'Update the assessment details and competencies.' 
                            : 'Configure a new skill assessment by selecting an employee, assessment type, competencies, and assessors.'}
                    </p>

                    {/* Employee & Assessment Details Section */}
                    <div className="bg-slate-50 dark:bg-deep-cosmos/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <User className="w-4 h-4 text-celestial-indigo" />
                            Employee & Assessment Details
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-3">
                            {/* Employee Select */}
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                    Select Employee *
                                </label>
                                <select
                                    value={EMPLOYEES.find(e => e.name === formData.employeeName)?.id || ''}
                                    onChange={(e) => handleSelectEmployee(e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-stellar-blue border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl cursor-pointer"
                                >
                                    <option value="">Select an employee</option>
                                    {EMPLOYEES.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.name} - {emp.role} ({emp.department})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Display selected employee info */}
                            {formData.employeeName && (
                                <div className="col-span-2 p-3 bg-celestial-indigo/10 rounded-lg border border-celestial-indigo/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-celestial-indigo/20 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-celestial-indigo" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-ink-black dark:text-pearl">{formData.employeeName}</div>
                                            <div className="text-xs text-slate-500">{formData.employeeRole} • {formData.employeeDepartment}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Assessment Type */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                    Assessment Type *
                                </label>
                                <select
                                    value={formData.assessmentType}
                                    onChange={(e) => setFormData({ ...formData, assessmentType: e.target.value as AssessmentType })}
                                    className="w-full px-3 py-2 bg-white dark:bg-stellar-blue border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl cursor-pointer"
                                >
                                    <option value="Self">Self Assessment</option>
                                    <option value="Manager">Manager Review</option>
                                    <option value="360">360° Feedback</option>
                                    <option value="Peer">Peer Review</option>
                                    <option value="Technical">Technical Assessment</option>
                                </select>
                            </div>
                            
                            {/* Assessment Cycle */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                    Assessment Cycle *
                                </label>
                                <select
                                    value={formData.cycleId}
                                    onChange={(e) => setFormData({ ...formData, cycleId: e.target.value })}
                                    className="w-full px-3 py-2 bg-white dark:bg-stellar-blue border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl cursor-pointer"
                                >
                                    <option value="">Select Cycle</option>
                                    {ASSESSMENT_CYCLES.map(cycle => (
                                        <option key={cycle.id} value={cycle.id}>
                                            {cycle.name} ({cycle.status})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Due Date */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                    Due Date *
                                </label>
                                <input
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    className="w-full px-3 py-2 bg-white dark:bg-stellar-blue border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                                />
                            </div>
                            
                            {/* Instructions */}
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                    Instructions (Optional)
                                </label>
                                <textarea
                                    value={formData.instructions}
                                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                    placeholder="Add any specific instructions or notes for this assessment..."
                                    rows={2}
                                    className="w-full px-3 py-2 bg-white dark:bg-stellar-blue border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Competencies Section */}
                    <div className="bg-slate-50 dark:bg-deep-cosmos/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-sm text-ink-black dark:text-pearl flex items-center gap-2">
                                <Target className="w-4 h-4 text-celestial-indigo" />
                                Competencies to Assess
                            </h3>
                            <button
                                onClick={handleAddCompetency}
                                className="flex items-center gap-1 px-3 py-1.5 bg-celestial-indigo text-white rounded-lg text-xs font-bold hover:bg-celestial-indigo/90 transition-colors"
                            >
                                <Plus className="w-3 h-3" /> Add Competency
                            </button>
                        </div>
                        
                        {formData.competencies.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No competencies added yet.</p>
                                <p className="text-xs">Click "Add Competency" to select competencies for assessment.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {formData.competencies.map((comp, index) => (
                                    <div key={index} className="bg-white dark:bg-stellar-blue p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center gap-3">
                                            {/* Competency Select */}
                                            <div className="flex-1">
                                                <select
                                                    value={comp.id}
                                                    onChange={(e) => handleUpdateCompetency(index, e.target.value)}
                                                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl cursor-pointer"
                                                >
                                                    <option value="">Select Competency</option>
                                                    {AVAILABLE_COMPETENCIES.map(c => (
                                                        <option key={c.id} value={c.id}>
                                                            {c.name} ({c.category})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            
                                            {/* Target Level */}
                                            <div className="w-32">
                                                <select
                                                    value={comp.targetLevel}
                                                    onChange={(e) => handleUpdateTargetLevel(index, Number(e.target.value) as ProficiencyLevel)}
                                                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl cursor-pointer"
                                                >
                                                    <option value={1}>Target: L1</option>
                                                    <option value={2}>Target: L2</option>
                                                    <option value={3}>Target: L3</option>
                                                    <option value={4}>Target: L4</option>
                                                    <option value={5}>Target: L5</option>
                                                </select>
                                            </div>
                                            
                                            {/* Category Badge */}
                                            {comp.name && (
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded ${CATEGORY_STYLES[comp.category].bgColor} ${CATEGORY_STYLES[comp.category].color}`}>
                                                    {comp.category}
                                                </span>
                                            )}
                                            
                                            {/* Remove */}
                                            <button
                                                onClick={() => handleRemoveCompetency(index)}
                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Assessors Section (for 360 and Peer assessments) */}
                    {(formData.assessmentType === '360' || formData.assessmentType === 'Peer') && (
                        <div className="bg-slate-50 dark:bg-deep-cosmos/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-sm text-ink-black dark:text-pearl flex items-center gap-2">
                                    <Users className="w-4 h-4 text-celestial-indigo" />
                                    Assessors
                                </h3>
                                <button
                                    onClick={handleAddAssessor}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-celestial-indigo text-white rounded-lg text-xs font-bold hover:bg-celestial-indigo/90 transition-colors"
                                >
                                    <UserPlus className="w-3 h-3" /> Add Assessor
                                </button>
                            </div>
                            
                            {formData.assessors.length === 0 ? (
                                <div className="text-center py-6 text-slate-400">
                                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No assessors added yet.</p>
                                    <p className="text-xs">Add peers, managers, or direct reports for 360° feedback.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {formData.assessors.map((assessor, index) => (
                                        <div key={index} className="bg-white dark:bg-stellar-blue p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <div className="grid grid-cols-12 gap-3 items-center">
                                                {/* Name */}
                                                <div className="col-span-4">
                                                    <input
                                                        type="text"
                                                        value={assessor.name}
                                                        onChange={(e) => handleUpdateAssessor(index, 'name', e.target.value)}
                                                        placeholder="Assessor name"
                                                        className="w-full px-2 py-1.5 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                                                    />
                                                </div>
                                                
                                                {/* Role */}
                                                <div className="col-span-3">
                                                    <select
                                                        value={assessor.role}
                                                        onChange={(e) => handleUpdateAssessor(index, 'role', e.target.value)}
                                                        className="w-full px-2 py-1.5 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl cursor-pointer"
                                                    >
                                                        <option value="Manager">Manager</option>
                                                        <option value="Peer">Peer</option>
                                                        <option value="Direct Report">Direct Report</option>
                                                        <option value="Cross-functional">Cross-functional</option>
                                                    </select>
                                                </div>
                                                
                                                {/* Email */}
                                                <div className="col-span-4">
                                                    <input
                                                        type="email"
                                                        value={assessor.email}
                                                        onChange={(e) => handleUpdateAssessor(index, 'email', e.target.value)}
                                                        placeholder="email@company.com"
                                                        className="w-full px-2 py-1.5 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                                                    />
                                                </div>
                                                
                                                {/* Remove */}
                                                <div className="col-span-1 flex justify-end">
                                                    <button
                                                        onClick={() => handleRemoveAssessor(index)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Sheet>
        </div>
    );
}

