"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    Map,
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
    Briefcase,
    Building2,
    Star,
    Target,
    Award,
    TrendingUp,
    Layers,
    Settings,
    Download,
    Upload,
    MoreHorizontal,
    Check,
    X,
    Info,
    Link2,
    Unlink,
    BarChart3,
    Code,
    Heart,
    Zap,
    Shield,
    GraduationCap,
    Crown,
    ArrowRight,
    Sparkles,
    Grid3X3,
    Save,
    Loader2,
} from 'lucide-react';
import { Sheet } from '@aura/ui/components/ui';
import { JobRoleService } from '@/services/competency-library.service';
import { logger } from '@/lib/logger';

// --- TYPES ---

type CompetencyCategory = 'Technical' | 'Leadership' | 'Behavioral' | 'Functional' | 'Core';
type RequirementLevel = 'Required' | 'Preferred' | 'Optional';
type ProficiencyLevel = 1 | 2 | 3 | 4 | 5;

interface MappedCompetency {
    id: string;
    competencyId: string;
    competencyName: string;
    category: CompetencyCategory;
    requiredLevel: ProficiencyLevel;
    requirementType: RequirementLevel;
    weight: number; // Percentage weight for role fitness
    notes?: string;
}

interface JobRole {
    id: string;
    title: string;
    code: string;
    department: string;
    level: string;
    family: string;
    description: string;
    headcount: number;
    status: 'Active' | 'Draft' | 'Archived';
    mappedCompetencies: MappedCompetency[];
    lastUpdated: string;
    owner: string;
}

interface Department {
    id: string;
    name: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
}

// --- MOCK DATA ---

const DEPARTMENTS: Department[] = [
    { id: 'ENG', name: 'Engineering', icon: <Code className="w-4 h-4" />, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
    { id: 'PROD', name: 'Product', icon: <Layers className="w-4 h-4" />, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
    { id: 'SALES', name: 'Sales', icon: <TrendingUp className="w-4 h-4" />, color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { id: 'HR', name: 'People & Culture', icon: <Heart className="w-4 h-4" />, color: 'text-rose-600', bgColor: 'bg-rose-100 dark:bg-rose-900/30' },
    { id: 'FIN', name: 'Finance', icon: <BarChart3 className="w-4 h-4" />, color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
    { id: 'OPS', name: 'Operations', icon: <Settings className="w-4 h-4" />, color: 'text-slate-600', bgColor: 'bg-slate-100 dark:bg-slate-800' },
];

const CATEGORY_STYLES: Record<CompetencyCategory, { icon: React.ReactNode; color: string; bgColor: string }> = {
    'Technical': { icon: <Code className="w-3.5 h-3.5" />, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
    'Leadership': { icon: <Crown className="w-3.5 h-3.5" />, color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
    'Behavioral': { icon: <Heart className="w-3.5 h-3.5" />, color: 'text-rose-600', bgColor: 'bg-rose-100 dark:bg-rose-900/30' },
    'Functional': { icon: <Briefcase className="w-3.5 h-3.5" />, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
    'Core': { icon: <Star className="w-3.5 h-3.5" />, color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
};

const LEVEL_LABELS: Record<ProficiencyLevel, { name: string; color: string; bgColor: string }> = {
    1: { name: 'Foundational', color: 'text-slate-600', bgColor: 'bg-slate-100 dark:bg-slate-800' },
    2: { name: 'Developing', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
    3: { name: 'Proficient', color: 'text-indigo-600', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30' },
    4: { name: 'Advanced', color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
    5: { name: 'Expert', color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
};

const JOB_ROLES: JobRole[] = [
    {
        id: 'JOB-001',
        title: 'Software Engineer',
        code: 'ENG-SE-001',
        department: 'Engineering',
        level: 'Individual Contributor',
        family: 'Engineering',
        description: 'Designs, develops, and maintains software applications. Collaborates with cross-functional teams to deliver high-quality solutions.',
        headcount: 45,
        status: 'Active',
        lastUpdated: '2025-11-20',
        owner: 'Engineering Excellence',
        mappedCompetencies: [
            { id: 'MC-001', competencyId: 'COMP-001', competencyName: 'Software Development', category: 'Technical', requiredLevel: 3, requirementType: 'Required', weight: 25 },
            { id: 'MC-002', competencyId: 'COMP-006', competencyName: 'Data Analysis', category: 'Technical', requiredLevel: 2, requirementType: 'Preferred', weight: 10 },
            { id: 'MC-003', competencyId: 'COMP-003', competencyName: 'Effective Communication', category: 'Behavioral', requiredLevel: 2, requirementType: 'Required', weight: 15 },
            { id: 'MC-004', competencyId: 'COMP-008', competencyName: 'Problem Solving', category: 'Behavioral', requiredLevel: 3, requirementType: 'Required', weight: 20 },
            { id: 'MC-005', competencyId: 'COMP-005', competencyName: 'Customer Focus', category: 'Core', requiredLevel: 2, requirementType: 'Required', weight: 15 },
            { id: 'MC-006', competencyId: 'COMP-004', competencyName: 'Project Management', category: 'Functional', requiredLevel: 1, requirementType: 'Optional', weight: 5 },
            { id: 'MC-007', competencyId: 'COMP-007', competencyName: 'Team Leadership', category: 'Leadership', requiredLevel: 1, requirementType: 'Optional', weight: 10 },
        ]
    },
    {
        id: 'JOB-002',
        title: 'Senior Software Engineer',
        code: 'ENG-SSE-001',
        department: 'Engineering',
        level: 'Senior Individual Contributor',
        family: 'Engineering',
        description: 'Leads technical design and implementation of complex systems. Mentors junior engineers and drives best practices.',
        headcount: 28,
        status: 'Active',
        lastUpdated: '2025-11-18',
        owner: 'Engineering Excellence',
        mappedCompetencies: [
            { id: 'MC-008', competencyId: 'COMP-001', competencyName: 'Software Development', category: 'Technical', requiredLevel: 4, requirementType: 'Required', weight: 25 },
            { id: 'MC-009', competencyId: 'COMP-006', competencyName: 'Data Analysis', category: 'Technical', requiredLevel: 3, requirementType: 'Required', weight: 10 },
            { id: 'MC-010', competencyId: 'COMP-003', competencyName: 'Effective Communication', category: 'Behavioral', requiredLevel: 3, requirementType: 'Required', weight: 15 },
            { id: 'MC-011', competencyId: 'COMP-008', competencyName: 'Problem Solving', category: 'Behavioral', requiredLevel: 4, requirementType: 'Required', weight: 15 },
            { id: 'MC-012', competencyId: 'COMP-005', competencyName: 'Customer Focus', category: 'Core', requiredLevel: 3, requirementType: 'Required', weight: 10 },
            { id: 'MC-013', competencyId: 'COMP-007', competencyName: 'Team Leadership', category: 'Leadership', requiredLevel: 2, requirementType: 'Required', weight: 15 },
            { id: 'MC-014', competencyId: 'COMP-002', competencyName: 'Strategic Thinking', category: 'Leadership', requiredLevel: 2, requirementType: 'Preferred', weight: 10 },
        ]
    },
    {
        id: 'JOB-003',
        title: 'Engineering Manager',
        code: 'ENG-EM-001',
        department: 'Engineering',
        level: 'Manager',
        family: 'Engineering',
        description: 'Manages engineering team, sets technical direction, and ensures delivery of high-quality products. Develops talent and builds team culture.',
        headcount: 12,
        status: 'Active',
        lastUpdated: '2025-11-15',
        owner: 'Engineering Excellence',
        mappedCompetencies: [
            { id: 'MC-015', competencyId: 'COMP-007', competencyName: 'Team Leadership', category: 'Leadership', requiredLevel: 4, requirementType: 'Required', weight: 25 },
            { id: 'MC-016', competencyId: 'COMP-002', competencyName: 'Strategic Thinking', category: 'Leadership', requiredLevel: 3, requirementType: 'Required', weight: 20 },
            { id: 'MC-017', competencyId: 'COMP-001', competencyName: 'Software Development', category: 'Technical', requiredLevel: 3, requirementType: 'Required', weight: 15 },
            { id: 'MC-018', competencyId: 'COMP-003', competencyName: 'Effective Communication', category: 'Behavioral', requiredLevel: 4, requirementType: 'Required', weight: 15 },
            { id: 'MC-019', competencyId: 'COMP-004', competencyName: 'Project Management', category: 'Functional', requiredLevel: 3, requirementType: 'Required', weight: 15 },
            { id: 'MC-020', competencyId: 'COMP-005', competencyName: 'Customer Focus', category: 'Core', requiredLevel: 3, requirementType: 'Required', weight: 10 },
        ]
    },
    {
        id: 'JOB-004',
        title: 'Product Manager',
        code: 'PROD-PM-001',
        department: 'Product',
        level: 'Individual Contributor',
        family: 'Product',
        description: 'Defines product vision and strategy. Works with engineering and design to deliver valuable customer experiences.',
        headcount: 18,
        status: 'Active',
        lastUpdated: '2025-11-10',
        owner: 'Product Leadership',
        mappedCompetencies: [
            { id: 'MC-021', competencyId: 'COMP-002', competencyName: 'Strategic Thinking', category: 'Leadership', requiredLevel: 3, requirementType: 'Required', weight: 25 },
            { id: 'MC-022', competencyId: 'COMP-005', competencyName: 'Customer Focus', category: 'Core', requiredLevel: 4, requirementType: 'Required', weight: 20 },
            { id: 'MC-023', competencyId: 'COMP-003', competencyName: 'Effective Communication', category: 'Behavioral', requiredLevel: 4, requirementType: 'Required', weight: 20 },
            { id: 'MC-024', competencyId: 'COMP-006', competencyName: 'Data Analysis', category: 'Technical', requiredLevel: 3, requirementType: 'Required', weight: 15 },
            { id: 'MC-025', competencyId: 'COMP-004', competencyName: 'Project Management', category: 'Functional', requiredLevel: 3, requirementType: 'Required', weight: 10 },
            { id: 'MC-026', competencyId: 'COMP-008', competencyName: 'Problem Solving', category: 'Behavioral', requiredLevel: 3, requirementType: 'Required', weight: 10 },
        ]
    },
    {
        id: 'JOB-005',
        title: 'Sales Representative',
        code: 'SALES-SR-001',
        department: 'Sales',
        level: 'Individual Contributor',
        family: 'Sales',
        description: 'Drives revenue growth by identifying opportunities, building relationships, and closing deals with customers.',
        headcount: 35,
        status: 'Active',
        lastUpdated: '2025-10-28',
        owner: 'Sales Operations',
        mappedCompetencies: [
            { id: 'MC-027', competencyId: 'COMP-003', competencyName: 'Effective Communication', category: 'Behavioral', requiredLevel: 4, requirementType: 'Required', weight: 30 },
            { id: 'MC-028', competencyId: 'COMP-005', competencyName: 'Customer Focus', category: 'Core', requiredLevel: 4, requirementType: 'Required', weight: 30 },
            { id: 'MC-029', competencyId: 'COMP-008', competencyName: 'Problem Solving', category: 'Behavioral', requiredLevel: 3, requirementType: 'Required', weight: 15 },
            { id: 'MC-030', competencyId: 'COMP-002', competencyName: 'Strategic Thinking', category: 'Leadership', requiredLevel: 2, requirementType: 'Preferred', weight: 15 },
            { id: 'MC-031', competencyId: 'COMP-006', competencyName: 'Data Analysis', category: 'Technical', requiredLevel: 2, requirementType: 'Optional', weight: 10 },
        ]
    },
    {
        id: 'JOB-006',
        title: 'HR Business Partner',
        code: 'HR-HRBP-001',
        department: 'People & Culture',
        level: 'Individual Contributor',
        family: 'Human Resources',
        description: 'Partners with business leaders to align people strategy with business objectives. Drives talent development and employee engagement.',
        headcount: 8,
        status: 'Active',
        lastUpdated: '2025-10-15',
        owner: 'People & Culture',
        mappedCompetencies: [
            { id: 'MC-032', competencyId: 'COMP-003', competencyName: 'Effective Communication', category: 'Behavioral', requiredLevel: 4, requirementType: 'Required', weight: 25 },
            { id: 'MC-033', competencyId: 'COMP-002', competencyName: 'Strategic Thinking', category: 'Leadership', requiredLevel: 3, requirementType: 'Required', weight: 20 },
            { id: 'MC-034', competencyId: 'COMP-007', competencyName: 'Team Leadership', category: 'Leadership', requiredLevel: 3, requirementType: 'Required', weight: 20 },
            { id: 'MC-035', competencyId: 'COMP-008', competencyName: 'Problem Solving', category: 'Behavioral', requiredLevel: 3, requirementType: 'Required', weight: 15 },
            { id: 'MC-036', competencyId: 'COMP-005', competencyName: 'Customer Focus', category: 'Core', requiredLevel: 3, requirementType: 'Required', weight: 10 },
            { id: 'MC-037', competencyId: 'COMP-006', competencyName: 'Data Analysis', category: 'Technical', requiredLevel: 2, requirementType: 'Preferred', weight: 10 },
        ]
    },
];

const STATS = {
    totalRoles: JOB_ROLES.length,
    totalMappings: JOB_ROLES.reduce((acc, role) => acc + role.mappedCompetencies.length, 0),
    avgCompetenciesPerRole: Math.round(JOB_ROLES.reduce((acc, role) => acc + role.mappedCompetencies.length, 0) / JOB_ROLES.length),
    totalHeadcount: JOB_ROLES.reduce((acc, role) => acc + role.headcount, 0)
};

// --- COMPONENTS ---

const RequirementBadge: React.FC<{ type: RequirementLevel }> = ({ type }) => {
    const styles: Record<RequirementLevel, string> = {
        'Required': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
        'Preferred': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        'Optional': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    };
    return (
        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${styles[type]}`}>
            {type}
        </span>
    );
};

const StatusBadge: React.FC<{ status: JobRole['status'] }> = ({ status }) => {
    const styles = {
        'Active': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        'Draft': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
        'Archived': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${styles[status]}`}>
            {status}
        </span>
    );
};

const ProficiencyIndicator: React.FC<{ level: ProficiencyLevel; showLabel?: boolean }> = ({ level, showLabel = false }) => {
    const config = LEVEL_LABELS[level];
    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(l => (
                    <div
                        key={l}
                        className={`w-2 h-5 rounded-sm ${l <= level ? config.bgColor : 'bg-slate-200 dark:bg-slate-700'}`}
                    />
                ))}
            </div>
            {showLabel && (
                <span className={`text-xs font-bold ${config.color}`}>L{level}</span>
            )}
        </div>
    );
};

const CompetencyMappingCard: React.FC<{ mapping: MappedCompetency }> = ({ mapping }) => {
    const categoryStyle = CATEGORY_STYLES[mapping.category];
    const levelConfig = LEVEL_LABELS[mapping.requiredLevel];

    return (
        <div className="p-3 bg-white dark:bg-stellar-blue rounded-xl border border-slate-200 dark:border-slate-700 hover:border-celestial-indigo/50 transition-all group">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg shrink-0 ${categoryStyle.bgColor} ${categoryStyle.color}`}>
                        {categoryStyle.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-sm text-ink-black dark:text-pearl truncate">
                                {mapping.competencyName}
                            </h4>
                            <RequirementBadge type={mapping.requirementType} />
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                            <ProficiencyIndicator level={mapping.requiredLevel} showLabel />
                            <span className="text-[10px] text-slate-400">
                                {levelConfig.name}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <div className="text-lg font-bold text-celestial-indigo">{mapping.weight}%</div>
                    <span className="text-[10px] text-slate-400 uppercase">Weight</span>
                </div>
            </div>
        </div>
    );
};

const CompetencyDistributionChart: React.FC<{ competencies: MappedCompetency[] }> = ({ competencies }) => {
    const distribution = useMemo(() => {
        const counts: Record<CompetencyCategory, number> = {
            'Technical': 0,
            'Leadership': 0,
            'Behavioral': 0,
            'Functional': 0,
            'Core': 0,
        };
        competencies.forEach(c => {
            counts[c.category] += c.weight;
        });
        return counts;
    }, [competencies]);

    const total = Object.values(distribution).reduce((a, b) => a + b, 0);

    return (
        <div className="space-y-2">
            <div className="flex h-3 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                {Object.entries(distribution).map(([category, weight]) => {
                    if (weight === 0) return null;
                    const style = CATEGORY_STYLES[category as CompetencyCategory];
                    return (
                        <div
                            key={category}
                            className={`${style.bgColor} transition-all`}
                            style={{ width: `${(weight / total) * 100}%` }}
                            title={`${category}: ${weight}%`}
                        />
                    );
                })}
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
                {Object.entries(distribution).map(([category, weight]) => {
                    if (weight === 0) return null;
                    const style = CATEGORY_STYLES[category as CompetencyCategory];
                    return (
                        <span key={category} className={`flex items-center gap-1 ${style.color}`}>
                            <span className={`w-2 h-2 rounded-full ${style.bgColor}`} />
                            {category}: {weight}%
                        </span>
                    );
                })}
            </div>
        </div>
    );
};

export default function JobCompetencyMapPage() {
    const [expandedRoles, setExpandedRoles] = useState<string[]>(['JOB-001']);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
    const [selectedLevel, setSelectedLevel] = useState<string>('All');
    const [viewMode, setViewMode] = useState<'list' | 'matrix'>('list');
    
    // Sheet state for create/edit mapping
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<JobRole | null>(null);
    const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch job roles from API on mount
    const fetchJobRoles = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: any = {};
            if (selectedDepartment !== 'All') params.departmentId = selectedDepartment;
            if (selectedLevel !== 'All') params.level = selectedLevel;
            if (searchQuery) params.search = searchQuery;
            
            const result = await JobRoleService.getAll(params);
            if (result.success && result.data) {
                // Cast data to local type since service uses shared types
                setJobRoles(result.data as any);
                // Expand first role by default
                if (result.data.length > 0) {
                    setExpandedRoles([result.data[0].id]);
                }
            }
        } catch (error) {
            logger.error('Failed to fetch job roles:', error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedDepartment, selectedLevel, searchQuery]);

    useEffect(() => {
        fetchJobRoles();
    }, [fetchJobRoles]);
    
    // Form state for new/edit mapping
    const [formData, setFormData] = useState<{
        title: string;
        code: string;
        department: string;
        level: string;
        family: string;
        description: string;
        status: 'Active' | 'Draft' | 'Archived';
        mappedCompetencies: MappedCompetency[];
    }>({
        title: '',
        code: '',
        department: '',
        level: '',
        family: '',
        description: '',
        status: 'Active',
        mappedCompetencies: [],
    });
    
    // Available competencies for selection
    const AVAILABLE_COMPETENCIES = [
        { id: 'COMP-001', name: 'Software Development', category: 'Technical' as CompetencyCategory },
        { id: 'COMP-002', name: 'Data Analysis', category: 'Technical' as CompetencyCategory },
        { id: 'COMP-003', name: 'System Design', category: 'Technical' as CompetencyCategory },
        { id: 'COMP-004', name: 'Cloud Architecture', category: 'Technical' as CompetencyCategory },
        { id: 'COMP-005', name: 'Team Leadership', category: 'Leadership' as CompetencyCategory },
        { id: 'COMP-006', name: 'Strategic Thinking', category: 'Leadership' as CompetencyCategory },
        { id: 'COMP-007', name: 'Change Management', category: 'Leadership' as CompetencyCategory },
        { id: 'COMP-008', name: 'Effective Communication', category: 'Behavioral' as CompetencyCategory },
        { id: 'COMP-009', name: 'Problem Solving', category: 'Behavioral' as CompetencyCategory },
        { id: 'COMP-010', name: 'Collaboration', category: 'Behavioral' as CompetencyCategory },
        { id: 'COMP-011', name: 'Adaptability', category: 'Behavioral' as CompetencyCategory },
        { id: 'COMP-012', name: 'Project Management', category: 'Functional' as CompetencyCategory },
        { id: 'COMP-013', name: 'Product Knowledge', category: 'Functional' as CompetencyCategory },
        { id: 'COMP-014', name: 'Customer Focus', category: 'Core' as CompetencyCategory },
        { id: 'COMP-015', name: 'Innovation', category: 'Core' as CompetencyCategory },
        { id: 'COMP-016', name: 'Results Orientation', category: 'Core' as CompetencyCategory },
    ];
    
    const handleCreateMapping = () => {
        setEditingRole(null);
        setFormData({
            title: '',
            code: `JOB-${String(jobRoles.length + 1).padStart(3, '0')}`,
            department: '',
            level: '',
            family: '',
            description: '',
            status: 'Draft',
            mappedCompetencies: [],
        });
        setIsSheetOpen(true);
    };
    
    const handleEditRole = (role: JobRole) => {
        setEditingRole(role);
        setFormData({
            title: role.title,
            code: role.code,
            department: role.department,
            level: role.level,
            family: role.family,
            description: role.description,
            status: role.status,
            mappedCompetencies: [...role.mappedCompetencies],
        });
        setIsSheetOpen(true);
    };
    
    const handleSaveMapping = async () => {
        setIsSaving(true);
        try {
            if (editingRole) {
                // Update existing via API
                const result = await JobRoleService.update(editingRole.id, formData as any);
                if (result.success && result.data) {
                    setJobRoles(prev => prev.map(r => 
                        r.id === editingRole.id ? (result.data as any) : r
                    ));
                }
            } else {
                // Create new via API
                const result = await JobRoleService.create(formData as any);
                if (result.success && result.data) {
                    setJobRoles(prev => [...prev, result.data as any]);
                }
            }
            setIsSheetOpen(false);
        } catch (error) {
            logger.error('Failed to save mapping:', error);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDeleteRole = async (roleId: string) => {
        if (confirm('Are you sure you want to delete this job role mapping?')) {
            try {
                const result = await JobRoleService.delete(roleId);
                if (result.success) {
                    setJobRoles(prev => prev.filter(r => r.id !== roleId));
                }
            } catch (error) {
                logger.error('Failed to delete role:', error);
            }
        }
    };
    
    const handleAddCompetency = () => {
        const newCompetency: MappedCompetency = {
            id: `mapping-${Date.now()}`,
            competencyId: '',
            competencyName: '',
            category: 'Core',
            requiredLevel: 3,
            requirementType: 'Required',
            weight: 0,
        };
        setFormData(prev => ({
            ...prev,
            mappedCompetencies: [...prev.mappedCompetencies, newCompetency],
        }));
    };
    
    const handleUpdateCompetency = (index: number, updates: Partial<MappedCompetency>) => {
        setFormData(prev => ({
            ...prev,
            mappedCompetencies: prev.mappedCompetencies.map((c, i) => 
                i === index ? { ...c, ...updates } : c
            ),
        }));
    };
    
    const handleRemoveCompetency = (index: number) => {
        setFormData(prev => ({
            ...prev,
            mappedCompetencies: prev.mappedCompetencies.filter((_, i) => i !== index),
        }));
    };
    
    const handleSelectCompetency = (index: number, competencyId: string) => {
        const comp = AVAILABLE_COMPETENCIES.find(c => c.id === competencyId);
        if (comp) {
            handleUpdateCompetency(index, {
                competencyId: comp.id,
                competencyName: comp.name,
                category: comp.category,
            });
        }
    };
    
    const totalWeight = formData.mappedCompetencies.reduce((sum, c) => sum + c.weight, 0);

    const toggleRole = (id: string) => {
        setExpandedRoles(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const filteredRoles = useMemo(() => {
        let result = jobRoles;

        if (selectedDepartment !== 'All') {
            result = result.filter(r => r.department === selectedDepartment);
        }

        if (selectedLevel !== 'All') {
            result = result.filter(r => r.level === selectedLevel);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(r =>
                r.title.toLowerCase().includes(query) ||
                r.code.toLowerCase().includes(query) ||
                r.description.toLowerCase().includes(query) ||
                r.mappedCompetencies.some(c => c.competencyName.toLowerCase().includes(query))
            );
        }

        return result;
    }, [selectedDepartment, selectedLevel, searchQuery]);

    const uniqueLevels = Array.from(new Set(jobRoles.map(r => r.level)));

    const getDepartmentStyle = (deptName: string) => {
        return DEPARTMENTS.find(d => d.name === deptName) || DEPARTMENTS[5];
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Map className="w-6 h-6 text-celestial-indigo" />
                        Job Competency Map
                    </h1>
                    <p className="text-silver-mist text-sm">
                        Map competencies to job roles and define required proficiency levels for each position.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors">
                        <Upload className="w-4 h-4" /> Import
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button 
                        onClick={handleCreateMapping}
                        className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors shadow-lg shadow-celestial-indigo/20"
                    >
                        <Plus className="w-4 h-4" /> Create Mapping
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
                            <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-ink-black dark:text-pearl">{STATS.totalRoles}</div>
                            <div className="text-xs text-silver-mist uppercase font-bold">Job Roles</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                            <Link2 className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-ink-black dark:text-pearl">{STATS.totalMappings}</div>
                            <div className="text-xs text-silver-mist uppercase font-bold">Total Mappings</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
                            <Target className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-ink-black dark:text-pearl">{STATS.avgCompetenciesPerRole}</div>
                            <div className="text-xs text-silver-mist uppercase font-bold">Avg per Role</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-ink-black dark:text-pearl">{STATS.totalHeadcount}</div>
                            <div className="text-xs text-silver-mist uppercase font-bold">Employees</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Department Pills */}
            <div className="flex flex-wrap items-center gap-3">
                <button
                    onClick={() => setSelectedDepartment('All')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        selectedDepartment === 'All'
                            ? 'bg-celestial-indigo text-white shadow-lg shadow-celestial-indigo/20'
                            : 'bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 text-slate-600 dark:text-slate-300 hover:border-celestial-indigo/50'
                    }`}
                >
                    All Departments
                </button>
                {DEPARTMENTS.map(dept => (
                    <button
                        key={dept.id}
                        onClick={() => setSelectedDepartment(dept.name)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            selectedDepartment === dept.name
                                ? `${dept.bgColor} ${dept.color} ring-2 ring-offset-2 ring-current`
                                : 'bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 text-slate-600 dark:text-slate-300 hover:border-celestial-indigo/50'
                        }`}
                    >
                        {dept.icon}
                        {dept.name}
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
                            placeholder="Search job roles or competencies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                        />
                    </div>

                    {/* Level Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <select
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                            className="px-3 py-2.5 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                        >
                            <option value="All">All Levels</option>
                            {uniqueLevels.map(level => (
                                <option key={level} value={level}>{level}</option>
                            ))}
                        </select>
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                                viewMode === 'list'
                                    ? 'bg-white dark:bg-slate-700 shadow-sm text-celestial-indigo'
                                    : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            <Layers className="w-3.5 h-3.5" /> List
                        </button>
                        <button
                            onClick={() => setViewMode('matrix')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                                viewMode === 'matrix'
                                    ? 'bg-white dark:bg-slate-700 shadow-sm text-celestial-indigo'
                                    : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            <Grid3X3 className="w-3.5 h-3.5" /> Matrix
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-silver-mist">
                    Showing <span className="font-bold text-ink-black dark:text-pearl">{filteredRoles.length}</span> job roles
                </p>
            </div>

            {/* Job Roles List */}
            {viewMode === 'list' ? (
                <div className="space-y-4">
                    {filteredRoles.map(role => {
                        const isExpanded = expandedRoles.includes(role.id);
                        const deptStyle = getDepartmentStyle(role.department);
                        const requiredCount = role.mappedCompetencies.filter(c => c.requirementType === 'Required').length;
                        const preferredCount = role.mappedCompetencies.filter(c => c.requirementType === 'Preferred').length;
                        const optionalCount = role.mappedCompetencies.filter(c => c.requirementType === 'Optional').length;

                        return (
                            <div
                                key={role.id}
                                className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden"
                            >
                                {/* Role Header */}
                                <div
                                    className="p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-deep-cosmos/50 transition-colors"
                                    onClick={() => toggleRole(role.id)}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-xl shrink-0 ${deptStyle.bgColor} ${deptStyle.color}`}>
                                                {deptStyle.icon}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                                        {role.code}
                                                    </span>
                                                    <h2 className="text-lg font-bold text-ink-black dark:text-pearl">{role.title}</h2>
                                                    <StatusBadge status={role.status} />
                                                </div>
                                                <p className="text-sm text-silver-mist line-clamp-2 mb-3">{role.description}</p>
                                                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <Building2 className="w-3 h-3" />
                                                        {role.department}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Award className="w-3 h-3" />
                                                        {role.level}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        {role.headcount} employees
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Link2 className="w-3 h-3" />
                                                        {role.mappedCompetencies.length} competencies
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {/* Requirement Summary */}
                                            <div className="hidden md:flex items-center gap-2">
                                                <div className="text-center px-2">
                                                    <div className="text-lg font-bold text-rose-600">{requiredCount}</div>
                                                    <div className="text-[9px] uppercase text-slate-400">Required</div>
                                                </div>
                                                <div className="text-center px-2 border-l border-slate-200 dark:border-slate-700">
                                                    <div className="text-lg font-bold text-amber-600">{preferredCount}</div>
                                                    <div className="text-[9px] uppercase text-slate-400">Preferred</div>
                                                </div>
                                                <div className="text-center px-2 border-l border-slate-200 dark:border-slate-700">
                                                    <div className="text-lg font-bold text-slate-500">{optionalCount}</div>
                                                    <div className="text-[9px] uppercase text-slate-400">Optional</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleEditRole(role); }}
                                                    className="p-2 text-slate-400 hover:text-celestial-indigo hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                    title="Edit mapping"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteRole(role.id); }}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                    title="Delete role"
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
                                    <div className="border-t border-cloud dark:border-nebula-purple/20 bg-slate-50 dark:bg-deep-cosmos/30 p-6 animate-in slide-in-from-top-2 duration-200">
                                        {/* Competency Distribution */}
                                        <div className="mb-6">
                                            <h4 className="font-bold text-sm text-ink-black dark:text-pearl mb-3 flex items-center gap-2">
                                                <BarChart3 className="w-4 h-4 text-celestial-indigo" />
                                                Competency Distribution
                                            </h4>
                                            <CompetencyDistributionChart competencies={role.mappedCompetencies} />
                                        </div>

                                        {/* Mapped Competencies */}
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-bold text-sm text-ink-black dark:text-pearl flex items-center gap-2">
                                                    <Target className="w-4 h-4 text-celestial-indigo" />
                                                    Mapped Competencies
                                                </h4>
                                                <button className="flex items-center gap-1 text-xs font-bold text-celestial-indigo hover:underline">
                                                    <Plus className="w-3 h-3" /> Add Competency
                                                </button>
                                            </div>

                                            {/* Group by Category */}
                                            {(['Technical', 'Leadership', 'Behavioral', 'Functional', 'Core'] as CompetencyCategory[]).map(category => {
                                                const categoryComps = role.mappedCompetencies.filter(c => c.category === category);
                                                if (categoryComps.length === 0) return null;
                                                const catStyle = CATEGORY_STYLES[category];

                                                return (
                                                    <div key={category} className="mb-4">
                                                        <div className={`flex items-center gap-2 mb-2 ${catStyle.color}`}>
                                                            {catStyle.icon}
                                                            <span className="text-xs font-bold uppercase">{category}</span>
                                                            <span className="text-xs text-slate-400">({categoryComps.length})</span>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                            {categoryComps.map(comp => (
                                                                <CompetencyMappingCard key={comp.id} mapping={comp} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Meta Info */}
                                        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
                                            <div className="flex items-center gap-4">
                                                <span>Owner: <span className="font-medium text-slate-600 dark:text-slate-300">{role.owner}</span></span>
                                                <span>Job Family: <span className="font-medium text-slate-600 dark:text-slate-300">{role.family}</span></span>
                                            </div>
                                            <span>Last Updated: {new Date(role.lastUpdated).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Matrix View */
                <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-deep-cosmos/50">
                                    <th className="text-left p-4 font-bold text-sm text-ink-black dark:text-pearl sticky left-0 bg-slate-50 dark:bg-deep-cosmos/50 z-10 min-w-[200px]">
                                        Job Role
                                    </th>
                                    {['Software Development', 'Data Analysis', 'Communication', 'Problem Solving', 'Customer Focus', 'Project Mgmt', 'Team Leadership', 'Strategic Thinking'].map(comp => (
                                        <th key={comp} className="text-center p-3 font-medium text-xs text-slate-500 min-w-[100px]">
                                            <div className="transform -rotate-45 origin-center whitespace-nowrap">
                                                {comp}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRoles.map((role, idx) => {
                                    const deptStyle = getDepartmentStyle(role.department);
                                    return (
                                        <tr key={role.id} className={idx % 2 === 0 ? '' : 'bg-slate-50/50 dark:bg-deep-cosmos/20'}>
                                            <td className="p-4 sticky left-0 bg-white dark:bg-stellar-blue z-10">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${deptStyle.bgColor} ${deptStyle.color}`}>
                                                        {deptStyle.icon}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm text-ink-black dark:text-pearl">{role.title}</div>
                                                        <div className="text-xs text-slate-400">{role.department}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            {['Software Development', 'Data Analysis', 'Effective Communication', 'Problem Solving', 'Customer Focus', 'Project Management', 'Team Leadership', 'Strategic Thinking'].map(compName => {
                                                const mapping = role.mappedCompetencies.find(c => c.competencyName === compName);
                                                return (
                                                    <td key={compName} className="text-center p-3">
                                                        {mapping ? (
                                                            <div className="flex flex-col items-center gap-1">
                                                                <ProficiencyIndicator level={mapping.requiredLevel} />
                                                                <span className={`text-[9px] font-bold ${
                                                                    mapping.requirementType === 'Required' ? 'text-rose-500' :
                                                                    mapping.requirementType === 'Preferred' ? 'text-amber-500' : 'text-slate-400'
                                                                }`}>
                                                                    {mapping.requirementType.charAt(0)}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-300">—</span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-deep-cosmos/30">
                        <div className="flex flex-wrap items-center gap-6 text-xs">
                            <span className="font-bold text-slate-500">Legend:</span>
                            <span className="flex items-center gap-1"><span className="text-rose-500 font-bold">R</span> = Required</span>
                            <span className="flex items-center gap-1"><span className="text-amber-500 font-bold">P</span> = Preferred</span>
                            <span className="flex items-center gap-1"><span className="text-slate-400 font-bold">O</span> = Optional</span>
                            <span className="flex items-center gap-2 ml-4">
                                <ProficiencyIndicator level={1} />
                                <span className="text-slate-400">to</span>
                                <ProficiencyIndicator level={5} />
                                <span>= Proficiency L1-L5</span>
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {filteredRoles.length === 0 && (
                <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-ink-black dark:text-pearl mb-2">No job roles found</h3>
                    <p className="text-sm text-silver-mist mb-6">
                        Try adjusting your search or filter criteria.
                    </p>
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setSelectedDepartment('All');
                            setSelectedLevel('All');
                        }}
                        className="px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            )}

            {/* Info Card */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-2xl shadow-lg border border-purple-500/30 text-white">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/10 rounded-xl">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-2">Job-Competency Mapping Best Practices</h3>
                        <ul className="text-sm opacity-90 leading-relaxed space-y-2">
                            <li className="flex items-start gap-2">
                                <Check className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>Map <strong>5-8 competencies</strong> per role for focused development.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Check className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>Include a mix of <strong>Technical, Behavioral, and Core</strong> competencies.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Check className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>Weights should <strong>total 100%</strong> for accurate fitness scoring.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Check className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>Review mappings <strong>annually</strong> to reflect evolving role requirements.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Create/Edit Mapping Sheet */}
            <Sheet
                isOpen={isSheetOpen}
                onClose={() => { setIsSheetOpen(false); setEditingRole(null); }}
                title={editingRole ? 'Edit Job-Competency Mapping' : 'Create New Job-Competency Mapping'}
                size="xl"
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => { setIsSheetOpen(false); setEditingRole(null); }}
                            className="px-4 py-2 text-sm font-medium text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveMapping}
                            disabled={!formData.title || !formData.code || !formData.department || !formData.level}
                            className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo hover:bg-celestial-indigo/90 text-white rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-4 h-4" />
                            {editingRole ? 'Update Mapping' : 'Create Mapping'}
                        </button>
                    </div>
                }
            >
                <div className="space-y-6">
                    {/* Description */}
                    <p className="text-sm text-silver-mist">
                        {editingRole 
                            ? 'Update the job role details and competency mappings.' 
                            : 'Define a new job role and map the required competencies with proficiency levels.'}
                    </p>

                    {/* Job Role Details Section */}
                    <div className="bg-slate-50 dark:bg-deep-cosmos/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-celestial-indigo" />
                            Job Role Details
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            {/* Job Title */}
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                    Job Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Software Engineer"
                                    className="w-full px-3 py-2 bg-white dark:bg-stellar-blue border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                                />
                            </div>
                            
                            {/* Job Code */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                    Job Code *
                                </label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="e.g., JOB-001"
                                    className="w-full px-3 py-2 bg-white dark:bg-stellar-blue border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl font-mono"
                                />
                            </div>
                            
                            {/* Department */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                    Department *
                                </label>
                                <select
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    className="w-full px-3 py-2 bg-white dark:bg-stellar-blue border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl cursor-pointer"
                                >
                                    <option value="">Select Department</option>
                                    {DEPARTMENTS.map(dept => (
                                        <option key={dept.id} value={dept.name}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Level */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                    Level *
                                </label>
                                <select
                                    value={formData.level}
                                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                    className="w-full px-3 py-2 bg-white dark:bg-stellar-blue border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl cursor-pointer"
                                >
                                    <option value="">Select Level</option>
                                    <option value="Entry Level">Entry Level</option>
                                    <option value="Mid Level">Mid Level</option>
                                    <option value="Senior Level">Senior Level</option>
                                    <option value="Lead">Lead</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Director">Director</option>
                                    <option value="VP">VP</option>
                                    <option value="C-Level">C-Level</option>
                                </select>
                            </div>
                            
                            {/* Job Family */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                    Job Family
                                </label>
                                <input
                                    type="text"
                                    value={formData.family}
                                    onChange={(e) => setFormData({ ...formData, family: e.target.value })}
                                    placeholder="e.g., Engineering"
                                    className="w-full px-3 py-2 bg-white dark:bg-stellar-blue border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                                />
                            </div>
                            
                            {/* Status */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Draft' | 'Archived' })}
                                    className="w-full px-3 py-2 bg-white dark:bg-stellar-blue border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl cursor-pointer"
                                >
                                    <option value="Draft">Draft</option>
                                    <option value="Active">Active</option>
                                    <option value="Archived">Archived</option>
                                </select>
                            </div>
                            
                            {/* Description */}
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe the role responsibilities and expectations..."
                                    rows={3}
                                    className="w-full px-3 py-2 bg-white dark:bg-stellar-blue border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Competency Mappings Section */}
                    <div className="bg-slate-50 dark:bg-deep-cosmos/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-sm text-ink-black dark:text-pearl flex items-center gap-2">
                                <Target className="w-4 h-4 text-celestial-indigo" />
                                Competency Mappings
                            </h3>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-bold ${totalWeight === 100 ? 'text-emerald-600' : totalWeight > 100 ? 'text-rose-600' : 'text-amber-600'}`}>
                                    Total Weight: {totalWeight}%
                                    {totalWeight !== 100 && <span className="text-slate-400 ml-1">(should be 100%)</span>}
                                </span>
                                <button
                                    onClick={handleAddCompetency}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-celestial-indigo text-white rounded-lg text-xs font-bold hover:bg-celestial-indigo/90 transition-colors"
                                >
                                    <Plus className="w-3 h-3" /> Add Competency
                                </button>
                            </div>
                        </div>
                        
                        {formData.mappedCompetencies.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No competencies mapped yet.</p>
                                <p className="text-xs">Click "Add Competency" to start mapping.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {formData.mappedCompetencies.map((mapping, index) => (
                                    <div key={mapping.id} className="bg-white dark:bg-stellar-blue p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <div className="grid grid-cols-12 gap-3 items-start">
                                            {/* Competency Select */}
                                            <div className="col-span-4">
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                                    Competency
                                                </label>
                                                <select
                                                    value={mapping.competencyId}
                                                    onChange={(e) => handleSelectCompetency(index, e.target.value)}
                                                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl cursor-pointer"
                                                >
                                                    <option value="">Select Competency</option>
                                                    {AVAILABLE_COMPETENCIES.map(comp => (
                                                        <option key={comp.id} value={comp.id}>
                                                            {comp.name} ({comp.category})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            
                                            {/* Proficiency Level */}
                                            <div className="col-span-2">
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                                    Level (1-5)
                                                </label>
                                                <select
                                                    value={mapping.requiredLevel}
                                                    onChange={(e) => handleUpdateCompetency(index, { requiredLevel: Number(e.target.value) as ProficiencyLevel })}
                                                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl cursor-pointer"
                                                >
                                                    <option value={1}>L1 - Foundational</option>
                                                    <option value={2}>L2 - Developing</option>
                                                    <option value={3}>L3 - Proficient</option>
                                                    <option value={4}>L4 - Advanced</option>
                                                    <option value={5}>L5 - Expert</option>
                                                </select>
                                            </div>
                                            
                                            {/* Requirement Type */}
                                            <div className="col-span-2">
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                                    Requirement
                                                </label>
                                                <select
                                                    value={mapping.requirementType}
                                                    onChange={(e) => handleUpdateCompetency(index, { requirementType: e.target.value as RequirementLevel })}
                                                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl cursor-pointer"
                                                >
                                                    <option value="Required">Required</option>
                                                    <option value="Preferred">Preferred</option>
                                                    <option value="Optional">Optional</option>
                                                </select>
                                            </div>
                                            
                                            {/* Weight */}
                                            <div className="col-span-2">
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                                    Weight %
                                                </label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    value={mapping.weight}
                                                    onChange={(e) => handleUpdateCompetency(index, { weight: Number(e.target.value) })}
                                                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                                                />
                                            </div>
                                            
                                            {/* Remove Button */}
                                            <div className="col-span-2 flex items-end justify-end">
                                                <button
                                                    onClick={() => handleRemoveCompetency(index)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                                    title="Remove competency"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {/* Category Badge */}
                                        {mapping.competencyName && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${CATEGORY_STYLES[mapping.category].bgColor} ${CATEGORY_STYLES[mapping.category].color}`}>
                                                    {mapping.category}
                                                </span>
                                                <span className="text-xs text-slate-400">{mapping.competencyName}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Sheet>
        </div>
    );
}
