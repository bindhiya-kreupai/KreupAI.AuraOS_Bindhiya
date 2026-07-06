'use client';

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
  Loader2,
} from 'lucide-react';
import { CompetencyService, CategoryService } from '@/services/competency-library.service';
import type { CompetencyCategory as ApiCategory } from '@/types/competency-library';

// Icon lookup so API-driven categories retain their visual treatment.
const CATEGORY_ICONS: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
  Technical: {
    icon: <Code className="w-4 h-4" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  Leadership: {
    icon: <Users className="w-4 h-4" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
  },
  Behavioral: {
    icon: <Heart className="w-4 h-4" />,
    color: 'text-rose-600',
    bgColor: 'bg-rose-100 dark:bg-rose-900/30',
  },
  Functional: {
    icon: <Briefcase className="w-4 h-4" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  Core: {
    icon: <Star className="w-4 h-4" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
};
const DEFAULT_CATEGORY_ICON = {
  icon: <Layers className="w-4 h-4" />,
  color: 'text-slate-600',
  bgColor: 'bg-slate-100 dark:bg-slate-800',
};

const categoryVisual = (name?: string) => (name && CATEGORY_ICONS[name]) || DEFAULT_CATEGORY_ICON;

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
  categoryId?: string;
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

// --- COMPONENTS ---

const StatusBadge: React.FC<{ status: CompetencyStatus }> = ({ status }) => {
  const styles: Record<CompetencyStatus, string> = {
    Active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    Draft: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    Archived: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'Under Review': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${styles[status]}`}>
      {status}
    </span>
  );
};

const ProficiencyCard: React.FC<{ proficiency: ProficiencyDescriptor }> = ({ proficiency }) => {
  const levelColors: Record<number, { border: string; bg: string; text: string }> = {
    1: {
      border: 'border-slate-200 dark:border-slate-700',
      bg: 'bg-slate-50 dark:bg-slate-900/50',
      text: 'text-slate-500',
    },
    2: {
      border: 'border-blue-200 dark:border-blue-800',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600',
    },
    3: {
      border: 'border-indigo-200 dark:border-indigo-800',
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      text: 'text-indigo-600',
    },
    4: {
      border: 'border-purple-200 dark:border-purple-800',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-600',
    },
    5: {
      border: 'border-emerald-200 dark:border-emerald-800',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-600',
    },
  };

  const colors = levelColors[proficiency.levelNumber];

  return (
    <div className={`p-4 rounded-xl border ${colors.border} ${colors.bg}`}>
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${colors.text} bg-white dark:bg-slate-800 border ${colors.border}`}
        >
          {proficiency.levelNumber}
        </div>
        <span className={`text-xs font-bold uppercase ${colors.text}`}>{proficiency.level}</span>
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
        {proficiency.description}
      </p>
      <div className="space-y-1.5">
        {proficiency.behaviors.map((behavior, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400"
          >
            <Check className="w-3 h-3 mt-0.5 text-emerald-500 shrink-0" />
            <span>{behavior}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Normalize an API competency row (category as nested object + categoryId)
// into the local label-based shape this page renders.
function normalizeCompetency(row: any, categoryNameById: Record<string, string>): Competency {
  const categoryName = row?.category?.name || categoryNameById[row?.categoryId] || 'Core';
  return {
    ...row,
    category: categoryName as CompetencyCategory,
    categoryId: row?.categoryId,
    subcategory: row?.subcategory?.name || row?.subcategory || '',
    applicableRoles: row?.applicableRoles || [],
    proficiencyLevels: row?.proficiencyLevels || row?.proficiencyDescriptors || [],
    relatedCompetencies: row?.relatedCompetencies || [],
    assessmentCriteria: (row?.assessmentCriteria || []).map((c: any) =>
      typeof c === 'string' ? c : c.criteria
    ),
    developmentResources: row?.developmentResources || [],
    lastUpdated: row?.updatedAt || row?.lastUpdated || new Date().toISOString(),
    usageCount: row?.usageCount ?? 0,
  } as Competency;
}

export default function CompetencyCatalogPage() {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  // Holds a category id (UUID) or 'All'. The API expects categoryId.
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedStatus, setSelectedStatus] = useState<CompetencyStatus | 'All'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'updated'>('name');
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCompetency, setEditingCompetency] = useState<Partial<Competency> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const categoryNameById = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories]
  );
  const categoryIdByName = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.name, c.id])),
    [categories]
  );

  // Load categories from the CategoryService so filter pills and the form
  // use real category IDs (the API expects a UUID, not a name).
  useEffect(() => {
    let active = true;
    CategoryService.getAll().then((res) => {
      if (active && res.success && res.data) setCategories(res.data);
    });
    return () => {
      active = false;
    };
  }, []);

  // Fetch competencies from API on mount / filter change.
  const fetchCompetencies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (selectedCategory !== 'All') params.categoryId = selectedCategory;
      if (selectedStatus !== 'All') params.status = selectedStatus;
      if (searchQuery) params.search = searchQuery;

      const result = await CompetencyService.getAll(params);
      if (result.success) {
        setCompetencies(result.data.map((r) => normalizeCompetency(r, categoryNameById)));
      } else {
        setError(result.error || 'Failed to load competencies.');
        setCompetencies([]);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load competencies.');
      setCompetencies([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedStatus, searchQuery, categoryNameById]);

  useEffect(() => {
    fetchCompetencies();
  }, [fetchCompetencies]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
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
    usageCount: 0,
  };

  const handleAddCompetency = () => {
    setEditingCompetency(defaultCompetency);
    setIsSheetOpen(true);
  };

  const handleEditCompetency = (comp: Competency) => {
    setEditingCompetency(comp);
    setIsSheetOpen(true);
  };

  // Build the API payload from the label-based form model, translating the
  // category label to its real categoryId (UUID) that the API requires.
  const toApiPayload = (comp: Partial<Competency>) => {
    const categoryId = (comp as any).categoryId || categoryIdByName[comp.category as string];
    return {
      code: comp.code,
      name: comp.name,
      categoryId,
      description: comp.description,
      status: comp.status,
      version: comp.version,
      owner: comp.owner,
      applicableRoles: comp.applicableRoles || [],
      assessmentCriteria: (comp.assessmentCriteria || []).map((criteria) => ({ criteria })),
    };
  };

  const handleSaveCompetency = async () => {
    if (!editingCompetency) return;

    const payload = toApiPayload(editingCompetency);
    if (!payload.categoryId) {
      setError('Please select a valid category before saving.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const result = editingCompetency.id
        ? await CompetencyService.update(editingCompetency.id, payload as any)
        : await CompetencyService.create(payload as any);

      if (result.success) {
        setIsSheetOpen(false);
        setEditingCompetency(null);
        await fetchCompetencies();
      } else {
        setError(result.error || 'Failed to save competency.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to save competency.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCompetency = async (id: string) => {
    setConfirmDeleteId(null);
    setError(null);
    try {
      const result = await CompetencyService.delete(id);
      if (result.success) {
        await fetchCompetencies();
      } else {
        setError(result.error || 'Failed to delete competency.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to delete competency.');
    }
  };

  const handleExport = () => {
    // Create CSV content
    const headers = [
      'Code',
      'Name',
      'Category',
      'Subcategory',
      'Description',
      'Status',
      'Version',
      'Owner',
    ];
    const rows = competencies.map((c) => [
      c.code,
      c.name,
      c.category,
      c.subcategory,
      c.description,
      c.status,
      c.version,
      c.owner,
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'competencies.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Parse a simple CSV import (Code,Name,Category,Subcategory,Description,Status,Version,Owner)
  // and create each row via the API, then refresh.
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setError(null);
      try {
        const text = await file.text();
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          setError('CSV file has no data rows.');
          return;
        }
        const parseRow = (line: string) =>
          line.match(/(".*?"|[^,]+)(?=,|$)/g)?.map((c) => c.replace(/^"|"$/g, '').trim()) || [];

        const rows = lines.slice(1).map(parseRow);
        let created = 0;
        let failed = 0;
        for (const cols of rows) {
          const [code, name, categoryName, , description, status, version, owner] = cols;
          const categoryId = categoryIdByName[categoryName];
          if (!name || !categoryId) {
            failed += 1;
            continue;
          }
          const res = await CompetencyService.create({
            code,
            name,
            categoryId,
            description,
            status: status || 'Draft',
            version: version || '1.0',
            owner,
          } as any);
          if (res.success) {
            created += 1;
          } else {
            failed += 1;
          }
        }
        await fetchCompetencies();
        if (failed > 0) {
          setError(
            `Imported ${created} competencies. ${failed} row(s) were skipped (missing name or unknown category).`
          );
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to import competencies.');
      }
    };
    input.click();
  };

  const handleFieldChange = (field: keyof Competency, value: any) => {
    setEditingCompetency((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  // The API already applies category/status/search filters server-side.
  // Only client-side sorting is applied here.
  const filteredCompetencies = useMemo(() => {
    const result = [...competencies].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'usage') return b.usageCount - a.usageCount;
      if (sortBy === 'updated')
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      return 0;
    });
    return result;
  }, [sortBy, competencies]);

  const getCategoryStyle = (category: CompetencyCategory) => categoryVisual(category);

  return (
    <div className="space-y-4 pb-6">
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-bold mb-2">Delete competency?</h2>
            <p className="text-sm text-slate-500 mb-6">
              This will permanently remove the competency. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCompetency(confirmDeleteId)}
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
            <BookMarked className="w-6 h-6 text-celestial-indigo" />
            Competency Catalog
          </h1>
          <p className="text-silver-mist text-sm">
            Browse and manage the complete library of organizational competencies and proficiency
            frameworks.
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-ink-black dark:text-pearl">
                {competencies.length}
              </div>
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
              <div className="text-2xl font-bold text-ink-black dark:text-pearl">
                {competencies.filter((c) => c.status === 'Active').length}
              </div>
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
              <div className="text-2xl font-bold text-ink-black dark:text-pearl">
                {Array.from(new Set(competencies.map((c) => c.category))).length}
              </div>
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
              <div className="text-2xl font-bold text-ink-black dark:text-pearl">
                {competencies.length > 0
                  ? Math.round(
                      competencies.reduce((acc, c) => acc + c.usageCount, 0) / competencies.length
                    )
                  : 0}
              </div>
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
        {categories.map((cat) => {
          const visual = categoryVisual(cat.name);
          const active = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                active
                  ? `${visual.bgColor} ${visual.color} ring-2 ring-offset-2 ring-current`
                  : 'bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 text-slate-600 dark:text-slate-300 hover:border-celestial-indigo/50'
              }`}
            >
              {visual.icon}
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          {error}
        </div>
      )}

      {/* Search & Filters Bar */}
      <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
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
          {isLoading ? (
            'Loading...'
          ) : (
            <>
              Showing{' '}
              <span className="font-bold text-ink-black dark:text-pearl">
                {filteredCompetencies.length}
              </span>{' '}
              competencies
            </>
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
          {filteredCompetencies.map((comp) => {
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
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 p-2.5 rounded-xl shrink-0 ${catStyle.bgColor} ${catStyle.color}`}
                      >
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
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
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
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(comp.id);
                          }}
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCompetency(comp);
                          }}
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(comp.id);
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

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-cloud dark:border-nebula-purple/20 bg-slate-50 dark:bg-deep-cosmos/30 animate-in slide-in-from-top-2 duration-200">
                    {/* Proficiency Levels */}
                    <div className="p-6">
                      <h4 className="font-bold text-sm text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500" />
                        Proficiency Framework
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        {(comp.proficiencyLevels || []).map((level) => (
                          <ProficiencyCard key={level.levelNumber} proficiency={level} />
                        ))}
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="border-t border-cloud dark:border-nebula-purple/20 p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300"
                              >
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
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500 uppercase">
                            Related:
                          </span>
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
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span>
                            Owner:{' '}
                            <span className="font-medium text-slate-600 dark:text-slate-300">
                              {comp.owner}
                            </span>
                          </span>
                          <span>
                            Updated:{' '}
                            <span className="font-medium text-slate-600 dark:text-slate-300">
                              {new Date(comp.lastUpdated).toLocaleDateString()}
                            </span>
                          </span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCompetencies.map((comp) => {
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
          <h3 className="text-lg font-bold text-ink-black dark:text-pearl mb-2">
            No competencies found
          </h3>
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
        onClose={() => {
          setIsSheetOpen(false);
          setEditingCompetency(null);
        }}
        title={editingCompetency?.id ? 'Edit Competency' : 'New Competency'}
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsSheetOpen(false);
                setEditingCompetency(null);
              }}
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
              {isSaving
                ? 'Saving...'
                : editingCompetency?.id
                  ? 'Save Changes'
                  : 'Create Competency'}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                    Code *
                  </label>
                  <input
                    type="text"
                    value={editingCompetency.code || ''}
                    onChange={(e) => handleFieldChange('code', e.target.value)}
                    placeholder="e.g., TECH-001"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                    Version
                  </label>
                  <input
                    type="text"
                    value={editingCompetency.version || '1.0'}
                    onChange={(e) => handleFieldChange('version', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Name *
                </label>
                <input
                  type="text"
                  value={editingCompetency.name || ''}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="Enter competency name"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={
                      (editingCompetency as any).categoryId ||
                      categoryIdByName[editingCompetency.category as string] ||
                      ''
                    }
                    onChange={(e) => {
                      const id = e.target.value;
                      setEditingCompetency((prev) =>
                        prev
                          ? {
                              ...prev,
                              categoryId: id,
                              category: (categoryNameById[id] || 'Core') as CompetencyCategory,
                            }
                          : null
                      );
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                  >
                    <option value="">Select a category…</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                    Subcategory
                  </label>
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
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Description *
                </label>
                <textarea
                  value={editingCompetency.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Describe the competency..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                    Status
                  </label>
                  <select
                    value={editingCompetency.status || 'Draft'}
                    onChange={(e) =>
                      handleFieldChange('status', e.target.value as CompetencyStatus)
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Active">Active</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                    Owner
                  </label>
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
                  onChange={(e) =>
                    handleFieldChange(
                      'applicableRoles',
                      e.target.value
                        .split(',')
                        .map((r) => r.trim())
                        .filter(Boolean)
                    )
                  }
                  placeholder="Enter roles separated by commas (e.g., Software Engineer, Tech Lead)"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Separate multiple roles with commas
                </p>
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
                  onChange={(e) =>
                    handleFieldChange(
                      'assessmentCriteria',
                      e.target.value.split('\n').filter(Boolean)
                    )
                  }
                  placeholder="Enter each criterion on a new line"
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl resize-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Enter each criterion on a separate line
                </p>
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
                  onChange={(e) =>
                    handleFieldChange(
                      'relatedCompetencies',
                      e.target.value
                        .split(',')
                        .map((r) => r.trim())
                        .filter(Boolean)
                    )
                  }
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
