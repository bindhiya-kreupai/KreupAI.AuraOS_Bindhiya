'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sheet } from '@aura/ui/components/ui';
import {
  Gauge,
  Plus,
  Search,
  Edit3,
  Trash2,
  Copy,
  Eye,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Star,
  Award,
  TrendingUp,
  Target,
  Zap,
  Shield,
  Users,
  Info,
  Check,
  Layers,
  GraduationCap,
  Sparkles,
  ArrowUpRight,
  BookOpen,
  BarChart3,
  Lock,
  Unlock,
  Save,
  Loader2,
} from 'lucide-react';
import { FrameworkService } from '@/services/competency-library.service';
import type {
  CreateFrameworkInput,
  ProficiencyLevel as SharedProficiencyLevel,
  ProficiencyFramework as SharedProficiencyFramework,
} from '@/types/competency-library';

// --- TYPES ---

type LevelStatus = 'Active' | 'Draft' | 'Archived';

interface BehavioralIndicator {
  id: string;
  description: string;
  category: 'Knowledge' | 'Skills' | 'Behavior' | 'Output';
}

interface ProficiencyLevel {
  id: string;
  levelNumber: number;
  name: string;
  shortName: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
  status: LevelStatus;
  isDefault: boolean;
  expectedTimeToAchieve: string;
  behavioralIndicators: BehavioralIndicator[];
  assessmentCriteria: string[];
  developmentFocus: string[];
  typicalRoles: string[];
  nextLevelTransition: string;
}

interface ProficiencyFramework {
  id: string;
  name: string;
  description: string;
  type: 'Standard' | 'Technical' | 'Leadership' | 'Custom';
  levels: ProficiencyLevel[];
  applicableCategories: string[];
  createdDate: string;
  lastModified: string;
  owner: string;
  usageCount: number;
  isLocked: boolean;
}

interface ApiProficiencyLevel {
  id: string;
  code?: string;
  name: string;
  levelNumber: number;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
}

interface ApiProficiencyFramework {
  id: string;
  code?: string;
  name: string;
  description?: string | null;
  type?: string;
  isDefault?: boolean;
  status?: string;
  levels?: ApiProficiencyLevel[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface FrameworkMutationPayload {
  create: CreateFrameworkInput;
  update: Partial<SharedProficiencyFramework>;
}

type SharedFrameworkType = CreateFrameworkInput['type'];

const toSharedFrameworkType = (
  type: ProficiencyFramework['type'] | undefined
): SharedFrameworkType => {
  if (type === 'Standard') {
    return 'Standard';
  }

  return 'Custom';
};

const buildFrameworkCode = (name: string) => {
  const normalized = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 20);

  return normalized ? `FW-${normalized}` : `FW-${Date.now()}`;
};

const buildMutationLevels = (
  frameworkId: string | undefined,
  levels: ProficiencyLevel[] | undefined
): SharedProficiencyLevel[] => {
  return (levels || []).map((level) => ({
    id: level.id,
    frameworkId: frameworkId || '',
    code: level.shortName || `L${level.levelNumber}`,
    name: level.name,
    levelNumber: level.levelNumber,
    description: level.description,
    color: level.color,
    icon: typeof level.icon === 'string' ? level.icon : undefined,
  }));
};

const buildFrameworkPayload = (
  framework: Partial<ProficiencyFramework>
): FrameworkMutationPayload => {
  const levels = buildMutationLevels(framework.id, framework.levels);
  const type = toSharedFrameworkType(framework.type);

  return {
    create: {
      code: buildFrameworkCode(framework.name || ''),
      name: framework.name || '',
      description: framework.description || '',
      type,
      levels: levels.map((level) => ({
        code: level.code,
        name: level.name,
        levelNumber: level.levelNumber,
        description: level.description,
        color: level.color,
        icon: level.icon,
      })),
    },
    update: {
      name: framework.name || '',
      description: framework.description || '',
      type,
      status: framework.isLocked ? 'Archived' : 'Active',
      levels,
    },
  };
};

const getFrameworkType = (
  framework: Pick<ApiProficiencyFramework, 'type' | 'name' | 'description'>
): ProficiencyFramework['type'] => {
  if (
    framework.type === 'Standard' ||
    framework.type === 'Technical' ||
    framework.type === 'Leadership' ||
    framework.type === 'Custom'
  ) {
    return framework.type;
  }

  const typeHint =
    `${framework.type || ''} ${framework.name} ${framework.description || ''}`.toLowerCase();
  if (typeHint.includes('technical') || typeHint.includes('engineering')) {
    return 'Technical';
  }
  if (typeHint.includes('leadership') || typeHint.includes('management')) {
    return 'Leadership';
  }

  return framework.type === 'Industry' ? 'Custom' : 'Standard';
};

const getLevelShortName = (frameworkType: ProficiencyFramework['type'], levelNumber: number) => {
  if (frameworkType === 'Technical') return `T${levelNumber}`;
  if (frameworkType === 'Leadership') return `M${levelNumber}`;
  return `L${levelNumber}`;
};

const getLevelExpectedTime = (levelNumber: number) => {
  const timeByLevel: Record<number, string> = {
    1: '0-6 months',
    2: '6-18 months',
    3: '18-36 months',
    4: '3-5 years',
    5: '5+ years',
  };

  return timeByLevel[levelNumber] || 'Varies by role';
};

const getLevelVisuals = (levelNumber: number) => {
  switch (levelNumber) {
    case 1:
      return {
        color: 'text-slate-600',
        bgColor: 'bg-slate-100 dark:bg-slate-800',
        borderColor: 'border-slate-300 dark:border-slate-600',
        icon: <GraduationCap className="w-5 h-5" />,
      };
    case 2:
      return {
        color: 'text-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        borderColor: 'border-blue-300 dark:border-blue-700',
        icon: <TrendingUp className="w-5 h-5" />,
      };
    case 3:
      return {
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
        borderColor: 'border-indigo-300 dark:border-indigo-700',
        icon: <Target className="w-5 h-5" />,
      };
    case 4:
      return {
        color: 'text-purple-600',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        borderColor: 'border-purple-300 dark:border-purple-700',
        icon: <Award className="w-5 h-5" />,
      };
    default:
      return {
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
        borderColor: 'border-emerald-300 dark:border-emerald-700',
        icon: <Sparkles className="w-5 h-5" />,
      };
  }
};

const mapLevelFromApi = (
  frameworkType: ProficiencyFramework['type'],
  frameworkStatus: string | undefined,
  level: ApiProficiencyLevel
): ProficiencyLevel => {
  const visuals = getLevelVisuals(level.levelNumber);
  const normalizedStatus: LevelStatus =
    frameworkStatus === 'Archived' ? 'Archived' : frameworkStatus === 'Draft' ? 'Draft' : 'Active';

  return {
    id: level.id,
    levelNumber: level.levelNumber,
    name: level.name,
    shortName: level.code || getLevelShortName(frameworkType, level.levelNumber),
    description: level.description || 'No description provided yet.',
    color: visuals.color,
    bgColor: visuals.bgColor,
    borderColor: visuals.borderColor,
    icon: visuals.icon,
    status: normalizedStatus,
    isDefault: level.levelNumber === 1,
    expectedTimeToAchieve: getLevelExpectedTime(level.levelNumber),
    behavioralIndicators: [],
    assessmentCriteria: [],
    developmentFocus: [],
    typicalRoles: [],
    nextLevelTransition: '',
  };
};

const mapFrameworkFromApi = (framework: ApiProficiencyFramework): ProficiencyFramework => {
  const type = getFrameworkType(framework);
  const levels = (framework.levels || [])
    .slice()
    .sort((left, right) => left.levelNumber - right.levelNumber)
    .map((level) => mapLevelFromApi(type, framework.status, level));

  return {
    id: framework.id,
    name: framework.name,
    description: framework.description || 'No framework description provided yet.',
    type,
    levels,
    applicableCategories: [type],
    createdDate: framework.createdAt ? new Date(framework.createdAt).toISOString() : '',
    lastModified: framework.updatedAt ? new Date(framework.updatedAt).toISOString() : '',
    owner: framework.isDefault ? 'System framework' : 'Custom framework',
    usageCount: 0,
    isLocked: Boolean(framework.isDefault),
  };
};

const mapFrameworksFromApi = (
  frameworks: ApiProficiencyFramework[] | undefined
): ProficiencyFramework[] => {
  if (!frameworks?.length) {
    return [];
  }

  return frameworks.map(mapFrameworkFromApi);
};

// --- COMPONENTS ---

const StatusBadge: React.FC<{ status: LevelStatus }> = ({ status }) => {
  const styles: Record<LevelStatus, string> = {
    Active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    Draft: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    Archived: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${styles[status]}`}>
      {status}
    </span>
  );
};

const FrameworkTypeBadge: React.FC<{ type: ProficiencyFramework['type'] }> = ({ type }) => {
  const styles: Record<ProficiencyFramework['type'], string> = {
    Standard: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    Technical: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Leadership: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    Custom: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${styles[type]}`}>
      {type}
    </span>
  );
};

const CategoryBadge: React.FC<{ category: BehavioralIndicator['category'] }> = ({ category }) => {
  const styles: Record<BehavioralIndicator['category'], string> = {
    Knowledge: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20',
    Skills: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20',
    Behavior: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20',
    Output: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20',
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${styles[category]}`}>
      {category}
    </span>
  );
};

const LevelCard: React.FC<{ level: ProficiencyLevel; showDetails: boolean }> = ({
  level,
  showDetails,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`rounded-xl border-2 ${level.borderColor} ${level.bgColor} overflow-hidden transition-all duration-300`}
    >
      {/* Level Header */}
      <div className="p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-white dark:bg-slate-800 ${level.color} shadow-sm`}>
              {level.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold ${level.color}`}>
                  {level.shortName}
                </span>
                <h4 className="font-bold text-ink-black dark:text-pearl">{level.name}</h4>
                <StatusBadge status={level.status} />
              </div>
              <p className="text-xs text-silver-mist mt-1">{level.expectedTimeToAchieve}</p>
            </div>
          </div>
          <div className="text-slate-400">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
          {level.description}
        </p>
      </div>

      {/* Expanded Details */}
      {expanded && showDetails && (
        <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-white/50 dark:bg-slate-900/50 space-y-4 animate-in slide-in-from-top-2 duration-200">
          {/* Behavioral Indicators */}
          <div>
            <h5 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
              <Target className="w-3 h-3" /> Behavioral Indicators
            </h5>
            <div className="space-y-2">
              {(level.behavioralIndicators || []).map((indicator) => (
                <div
                  key={indicator.id}
                  className="flex items-start gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                >
                  <Check className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-xs text-slate-600 dark:text-slate-300 flex-1">
                    {indicator.description}
                  </span>
                  <CategoryBadge category={indicator.category} />
                </div>
              ))}
            </div>
          </div>

          {/* Assessment Criteria */}
          <div>
            <h5 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
              <BarChart3 className="w-3 h-3" /> Assessment Criteria
            </h5>
            <ul className="space-y-1">
              {(level.assessmentCriteria || []).map((criterion, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300"
                >
                  <ChevronRight className="w-3 h-3 text-celestial-indigo mt-0.5 shrink-0" />
                  {criterion}
                </li>
              ))}
            </ul>
          </div>

          {/* Development Focus */}
          <div>
            <h5 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> Development Focus
            </h5>
            <div className="flex flex-wrap gap-2">
              {(level.developmentFocus || []).map((focus, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-celestial-indigo/10 text-celestial-indigo rounded-lg text-xs font-medium"
                >
                  {focus}
                </span>
              ))}
            </div>
          </div>

          {/* Typical Roles */}
          <div>
            <h5 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
              <Users className="w-3 h-3" /> Typical Roles
            </h5>
            <div className="flex flex-wrap gap-2">
              {(level.typicalRoles || []).map((role, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>

          {/* Next Level Transition */}
          <div className="p-3 bg-gradient-to-r from-celestial-indigo/10 to-purple-500/10 rounded-lg border border-celestial-indigo/20">
            <h5 className="text-xs font-bold text-celestial-indigo uppercase mb-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> Transition to Next Level
            </h5>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {level.nextLevelTransition}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default function ProficiencyLevelsPage() {
  const [expandedFrameworks, setExpandedFrameworks] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ProficiencyFramework['type'] | 'All'>('All');
  const [showLevelDetails, setShowLevelDetails] = useState(true);
  const [frameworks, setFrameworks] = useState<ProficiencyFramework[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingFramework, setEditingFramework] = useState<Partial<ProficiencyFramework> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Fetch frameworks from API on mount
  const fetchFrameworks = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await FrameworkService.getAll();
      if (result.success) {
        const mappedFrameworks = mapFrameworksFromApi(
          result.data as ApiProficiencyFramework[] | undefined
        );
        setFrameworks(mappedFrameworks);
        setExpandedFrameworks(mappedFrameworks[0] ? [mappedFrameworks[0].id] : []);
      }
    } catch (error: any) {
      console.error('Failed to fetch frameworks:', error);
      setFrameworks([]);
      setExpandedFrameworks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFrameworks();
  }, [fetchFrameworks]);

  const toggleFramework = (id: string) => {
    setExpandedFrameworks((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Default new framework template
  const defaultFramework: Partial<ProficiencyFramework> = {
    name: '',
    description: '',
    type: 'Custom',
    applicableCategories: [],
    owner: '',
    usageCount: 0,
    isLocked: false,
    levels: [
      {
        id: 'NEW-LVL-1',
        levelNumber: 1,
        name: 'Foundational',
        shortName: 'L1',
        description: '',
        color: 'text-slate-600',
        bgColor: 'bg-slate-100 dark:bg-slate-800',
        borderColor: 'border-slate-300 dark:border-slate-600',
        icon: <GraduationCap className="w-5 h-5" />,
        status: 'Active',
        isDefault: true,
        expectedTimeToAchieve: '0-6 months',
        behavioralIndicators: [],
        assessmentCriteria: [],
        developmentFocus: [],
        typicalRoles: [],
        nextLevelTransition: '',
      },
      {
        id: 'NEW-LVL-2',
        levelNumber: 2,
        name: 'Developing',
        shortName: 'L2',
        description: '',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        borderColor: 'border-blue-300 dark:border-blue-700',
        icon: <TrendingUp className="w-5 h-5" />,
        status: 'Active',
        isDefault: true,
        expectedTimeToAchieve: '6-18 months',
        behavioralIndicators: [],
        assessmentCriteria: [],
        developmentFocus: [],
        typicalRoles: [],
        nextLevelTransition: '',
      },
      {
        id: 'NEW-LVL-3',
        levelNumber: 3,
        name: 'Proficient',
        shortName: 'L3',
        description: '',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
        borderColor: 'border-indigo-300 dark:border-indigo-700',
        icon: <Target className="w-5 h-5" />,
        status: 'Active',
        isDefault: true,
        expectedTimeToAchieve: '18-36 months',
        behavioralIndicators: [],
        assessmentCriteria: [],
        developmentFocus: [],
        typicalRoles: [],
        nextLevelTransition: '',
      },
      {
        id: 'NEW-LVL-4',
        levelNumber: 4,
        name: 'Advanced',
        shortName: 'L4',
        description: '',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        borderColor: 'border-purple-300 dark:border-purple-700',
        icon: <Award className="w-5 h-5" />,
        status: 'Active',
        isDefault: true,
        expectedTimeToAchieve: '3-5 years',
        behavioralIndicators: [],
        assessmentCriteria: [],
        developmentFocus: [],
        typicalRoles: [],
        nextLevelTransition: '',
      },
      {
        id: 'NEW-LVL-5',
        levelNumber: 5,
        name: 'Expert',
        shortName: 'L5',
        description: '',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
        borderColor: 'border-emerald-300 dark:border-emerald-700',
        icon: <Sparkles className="w-5 h-5" />,
        status: 'Active',
        isDefault: true,
        expectedTimeToAchieve: '5+ years',
        behavioralIndicators: [],
        assessmentCriteria: [],
        developmentFocus: [],
        typicalRoles: [],
        nextLevelTransition: '',
      },
    ],
  };

  const handleCreateFramework = () => {
    setEditingFramework(defaultFramework);
    setIsSheetOpen(true);
  };

  const handleEditFramework = (framework: ProficiencyFramework) => {
    setEditingFramework(framework);
    setIsSheetOpen(true);
  };

  const handleSaveFramework = async () => {
    if (!editingFramework) return;

    setIsSaving(true);
    try {
      const payload = buildFrameworkPayload(editingFramework);
      if (editingFramework.id) {
        // Update existing via API
        const result = await FrameworkService.update(editingFramework.id, payload.update);
        if (result.success && result.data) {
          const mappedFramework = mapFrameworkFromApi(result.data as ApiProficiencyFramework);
          setFrameworks((prev) =>
            prev.map((f) => (f.id === editingFramework.id ? mappedFramework : f))
          );
        }
      } else {
        // Create new via API
        const result = await FrameworkService.create(payload.create);
        if (result.success && result.data) {
          const mappedFramework = mapFrameworkFromApi(result.data as ApiProficiencyFramework);
          setFrameworks((prev) => [...prev, mappedFramework]);
          setExpandedFrameworks((prev) => [...prev, mappedFramework.id]);
        }
      }

      setIsSheetOpen(false);
      setEditingFramework(null);
    } catch (error: any) {
      console.error('Error:', error);
      console.error('Failed to save framework:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const requestDeleteFramework = (id: string) => {
    const framework = frameworks.find((f) => f.id === id);
    if (framework?.isLocked) {
      setNotice('This framework is locked and cannot be deleted.');
      return;
    }
    setConfirmDeleteId(id);
  };

  const handleDeleteFramework = async (id: string) => {
    setConfirmDeleteId(null);
    try {
      const result = await FrameworkService.delete(id);
      if (result.success) {
        setFrameworks((prev) => prev.filter((f) => f.id !== id));
      }
    } catch (error: any) {
      setNotice('Failed to delete framework. Please try again.');
    }
  };

  const handleFieldChange = (
    field: keyof ProficiencyFramework,
    value: ProficiencyFramework[keyof ProficiencyFramework]
  ) => {
    setEditingFramework((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleLevelChange = (
    levelIndex: number,
    field: keyof ProficiencyLevel,
    value: ProficiencyLevel[keyof ProficiencyLevel]
  ) => {
    if (!editingFramework?.levels) return;
    const newLevels = [...editingFramework.levels];
    newLevels[levelIndex] = { ...newLevels[levelIndex], [field]: value };
    setEditingFramework((prev) => (prev ? { ...prev, levels: newLevels } : null));
  };

  const filteredFrameworks = frameworks.filter((fw) => {
    if (selectedType !== 'All' && fw.type !== selectedType) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        fw.name.toLowerCase().includes(query) ||
        fw.description.toLowerCase().includes(query) ||
        fw.levels.some((l) => l.name.toLowerCase().includes(query))
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-6">
      {notice && (
        <div className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-xs underline">
            Dismiss
          </button>
        </div>
      )}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-bold mb-2">Delete framework?</h2>
            <p className="text-sm text-slate-500 mb-6">
              This will permanently remove the proficiency framework. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteFramework(confirmDeleteId)}
                className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <Gauge className="w-6 h-6 text-celestial-indigo" />
            Proficiency Levels
          </h1>
          <p className="text-silver-mist text-sm">
            Define and manage proficiency frameworks that measure competency progression across your
            organization.
          </p>
        </div>
        <button
          onClick={handleCreateFramework}
          className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors shadow-lg shadow-celestial-indigo/20"
        >
          <Plus className="w-4 h-4" /> Create Framework
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-ink-black dark:text-pearl">
                {frameworks.length}
              </div>
              <div className="text-xs text-silver-mist uppercase font-bold">Frameworks</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-ink-black dark:text-pearl">
                {frameworks.reduce((acc, fw) => acc + fw.levels.length, 0)}
              </div>
              <div className="text-xs text-silver-mist uppercase font-bold">Total Levels</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-ink-black dark:text-pearl">
                {frameworks.filter((fw) => fw.levels.every((l) => l.status === 'Active')).length}
              </div>
              <div className="text-xs text-silver-mist uppercase font-bold">Active</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-ink-black dark:text-pearl">
                {frameworks.reduce((acc, fw) => acc + fw.usageCount, 0)}
              </div>
              <div className="text-xs text-silver-mist uppercase font-bold">Total Usage</div>
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
              placeholder="Search frameworks or levels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            {(['All', 'Standard', 'Technical', 'Leadership', 'Custom'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                  selectedType === type
                    ? 'bg-celestial-indigo text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Toggle Details */}
          <button
            onClick={() => setShowLevelDetails(!showLevelDetails)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
              showLevelDetails
                ? 'bg-celestial-indigo/10 text-celestial-indigo'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Eye className="w-4 h-4" />
            {showLevelDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
      </div>

      {/* Frameworks List */}
      {isLoading ? (
        <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-celestial-indigo animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-ink-black dark:text-pearl mb-2">
            Loading frameworks
          </h3>
          <p className="text-sm text-silver-mist">Fetching live proficiency framework data.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFrameworks.map((framework) => {
            const isExpanded = expandedFrameworks.includes(framework.id);

            return (
              <div
                key={framework.id}
                className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden"
              >
                {/* Framework Header */}
                <div
                  className="p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-deep-cosmos/50 transition-colors"
                  onClick={() => toggleFramework(framework.id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h2 className="text-xl font-bold text-ink-black dark:text-pearl">
                          {framework.name}
                        </h2>
                        <FrameworkTypeBadge type={framework.type} />
                        {framework.isLocked && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full text-[10px] font-bold">
                            <Lock className="w-3 h-3" /> Locked
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-silver-mist">{framework.description}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          {framework.levels.length} levels
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {framework.usageCount} competencies using
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {framework.owner}
                        </span>
                        {framework.lastModified && (
                          <span>
                            Updated: {new Date(framework.lastModified).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Level Preview */}
                      <div className="hidden md:flex items-center gap-1">
                        {framework.levels.map((level) => (
                          <div
                            key={level.id}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${level.bgColor} ${level.color}`}
                            title={level.name}
                          >
                            {level.levelNumber}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditFramework(framework);
                          }}
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); /* Copy functionality */
                          }}
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            requestDeleteFramework(framework.id);
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-slate-400">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Levels */}
                {isExpanded && (
                  <div className="border-t border-cloud dark:border-nebula-purple/20 p-6 bg-slate-50 dark:bg-deep-cosmos/30 animate-in slide-in-from-top-2 duration-200">
                    {/* Applicable Categories */}
                    <div className="mb-6">
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">
                        Applicable Categories
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(framework.applicableCategories || []).map((cat, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-white dark:bg-stellar-blue border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Progression Visual */}
                    <div className="mb-6">
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">
                        Progression Path
                      </h4>
                      <div className="flex items-center justify-between relative">
                        {/* Connection Line */}
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-slate-300 via-indigo-400 to-emerald-400 rounded-full -translate-y-1/2 z-0" />

                        {framework.levels.map((level) => (
                          <div key={level.id} className="relative z-10 flex flex-col items-center">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center ${level.bgColor} ${level.color} border-4 border-white dark:border-slate-900 shadow-lg`}
                            >
                              {level.icon}
                            </div>
                            <span className="text-xs font-bold text-ink-black dark:text-pearl mt-2">
                              {level.shortName}
                            </span>
                            <span className="text-[10px] text-silver-mist">{level.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Level Cards */}
                    <div className="space-y-3">
                      {framework.levels.map((level) => (
                        <LevelCard key={level.id} level={level} showDetails={showLevelDetails} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredFrameworks.length === 0 && (
        <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-ink-black dark:text-pearl mb-2">
            No frameworks found
          </h3>
          <p className="text-sm text-silver-mist mb-6">
            Try adjusting your search or filter criteria.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedType('All');
            }}
            className="px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl shadow-lg border border-indigo-500/30 text-white">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-white/10 rounded-xl">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">Understanding Proficiency Frameworks</h3>
            <p className="text-sm opacity-90 leading-relaxed">
              Proficiency frameworks define the progression path for competencies. Each level
              includes behavioral indicators, assessment criteria, and development resources. The{' '}
              <strong>Standard framework</strong> applies to most competencies, while{' '}
              <strong>Technical</strong> and <strong>Leadership</strong> frameworks are optimized
              for their respective domains.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
                Learn More
              </button>
              <button className="px-4 py-2 bg-white text-indigo-600 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors">
                Framework Guide
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Framework Sheet */}
      <Sheet
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setEditingFramework(null);
        }}
        title={editingFramework?.id ? 'Edit Framework' : 'Create Proficiency Framework'}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsSheetOpen(false);
                setEditingFramework(null);
              }}
              className="px-4 py-2 text-sm font-medium text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveFramework}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo hover:bg-celestial-indigo/90 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all shadow-sm"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? 'Saving...' : editingFramework?.id ? 'Save Changes' : 'Create Framework'}
            </button>
          </div>
        }
      >
        {editingFramework && (
          <div className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-ink-black dark:text-pearl flex items-center gap-2 pb-2 border-b border-cloud dark:border-nebula-purple/30">
                <Info className="w-4 h-4 text-celestial-indigo" />
                Basic Information
              </h4>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Framework Name *
                </label>
                <input
                  type="text"
                  value={editingFramework.name || ''}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="e.g., Technical Skills Framework"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Description *
                </label>
                <textarea
                  value={editingFramework.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Describe the purpose and scope of this proficiency framework..."
                  rows={3}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                    Type *
                  </label>
                  <select
                    value={editingFramework.type || 'Custom'}
                    onChange={(e) =>
                      handleFieldChange('type', e.target.value as ProficiencyFramework['type'])
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Technical">Technical</option>
                    <option value="Leadership">Leadership</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                    Owner
                  </label>
                  <input
                    type="text"
                    value={editingFramework.owner || ''}
                    onChange={(e) => handleFieldChange('owner', e.target.value)}
                    placeholder="e.g., People & Culture"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Applicable Categories
                </label>
                <input
                  type="text"
                  value={(editingFramework.applicableCategories || []).join(', ')}
                  onChange={(e) =>
                    handleFieldChange(
                      'applicableCategories',
                      e.target.value
                        .split(',')
                        .map((c) => c.trim())
                        .filter(Boolean)
                    )
                  }
                  placeholder="e.g., Technical, Functional, Leadership (comma separated)"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                />
                <p className="text-[10px] text-slate-400 mt-1">Separate categories with commas</p>
              </div>
            </div>

            {/* Proficiency Levels */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-ink-black dark:text-pearl flex items-center gap-2 pb-2 border-b border-cloud dark:border-nebula-purple/30">
                <Layers className="w-4 h-4 text-celestial-indigo" />
                Proficiency Levels ({editingFramework.levels?.length || 0})
              </h4>

              <div className="space-y-4">
                {editingFramework.levels?.map((level, index) => (
                  <div
                    key={level.id}
                    className={`p-4 rounded-xl border ${level.borderColor} ${level.bgColor}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${level.bgColor} ${level.color} font-bold text-sm border-2 border-white dark:border-slate-800`}
                      >
                        {level.levelNumber}
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={level.name}
                          onChange={(e) => handleLevelChange(index, 'name', e.target.value)}
                          placeholder="Level Name"
                          className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                        />
                        <input
                          type="text"
                          value={level.shortName}
                          onChange={(e) => handleLevelChange(index, 'shortName', e.target.value)}
                          placeholder="Short Name (e.g., L1)"
                          className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                        />
                      </div>
                    </div>
                    <textarea
                      value={level.description}
                      onChange={(e) => handleLevelChange(index, 'description', e.target.value)}
                      placeholder="Describe what this proficiency level represents..."
                      rows={2}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl resize-none mb-3"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          Expected Time
                        </label>
                        <input
                          type="text"
                          value={level.expectedTimeToAchieve}
                          onChange={(e) =>
                            handleLevelChange(index, 'expectedTimeToAchieve', e.target.value)
                          }
                          placeholder="e.g., 0-6 months"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          Typical Roles
                        </label>
                        <input
                          type="text"
                          value={(level.typicalRoles || []).join(', ')}
                          onChange={(e) =>
                            handleLevelChange(
                              index,
                              'typicalRoles',
                              e.target.value
                                .split(',')
                                .map((r) => r.trim())
                                .filter(Boolean)
                            )
                          }
                          placeholder="e.g., Junior, Associate"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lock Setting */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                {editingFramework.isLocked ? (
                  <Lock className="w-5 h-5 text-amber-500" />
                ) : (
                  <Unlock className="w-5 h-5 text-emerald-500" />
                )}
                <div>
                  <span className="text-sm font-medium text-ink-black dark:text-pearl">
                    Lock Framework
                  </span>
                  <p className="text-xs text-silver-mist">Prevent edits and deletions</p>
                </div>
              </div>
              <button
                onClick={() => handleFieldChange('isLocked', !editingFramework.isLocked)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  editingFramework.isLocked ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    editingFramework.isLocked ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
