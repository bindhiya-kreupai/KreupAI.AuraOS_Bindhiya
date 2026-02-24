/**
 * @module CheckInTemplates
 * @description Performance check-in template library for recurring 1:1s,
 *              weekly syncs, career conversations, and review prep
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutTemplate,
  Calendar,
  Target,
  TrendingUp,
  MessageSquare,
  Users,
  Sparkles,
  Copy,
  Check,
  Clock,
  Star,
  ChevronDown,
  ChevronUp,
  Search,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────────

type CheckInFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
type TemplateCategory =
  | 'weekly_sync'
  | 'career_dev'
  | 'performance_review'
  | 'project_check'
  | 'wellbeing'
  | 'onboarding';

interface TemplateQuestion {
  id: string;
  text: string;
  hint?: string;
  isRequired: boolean;
}

export interface CheckInTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  frequency: CheckInFrequency;
  questions: TemplateQuestion[];
  estimatedDuration: number;
  usageCount: number;
  rating: number;
  isSystem: boolean;
  isSaved: boolean;
  createdBy?: string;
  tags: string[];
}

export interface CheckInTemplatesProps {
  templates: CheckInTemplate[];
  onUseTemplate?: (template: CheckInTemplate) => void;
}

// ── Config ───────────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
  TemplateCategory,
  { label: string; icon: LucideIcon; color: string; bg: string }
> = {
  weekly_sync: {
    label: 'Weekly Sync',
    icon: Calendar,
    color: 'text-celestial-indigo',
    bg: 'bg-celestial-indigo/10',
  },
  career_dev: {
    label: 'Career Dev',
    icon: TrendingUp,
    color: 'text-neural-mint',
    bg: 'bg-neural-mint/10',
  },
  performance_review: {
    label: 'Review Prep',
    icon: Target,
    color: 'text-sunset-amber',
    bg: 'bg-sunset-amber/10',
  },
  project_check: {
    label: 'Project Check',
    icon: MessageSquare,
    color: 'text-nebula-purple',
    bg: 'bg-nebula-purple/10',
  },
  wellbeing: {
    label: 'Wellbeing',
    icon: Sparkles,
    color: 'text-quantum-rose',
    bg: 'bg-quantum-rose/10',
  },
  onboarding: {
    label: 'Onboarding',
    icon: Users,
    color: 'text-celestial-indigo',
    bg: 'bg-celestial-indigo/10',
  },
};

const FREQUENCY_LABELS: Record<CheckInFrequency, string> = {
  weekly: 'Weekly',
  biweekly: 'Bi-weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
};

// ── Mock Data ────────────────────────────────────────────────────────────────────

export const MOCK_CHECKIN_TEMPLATES: CheckInTemplate[] = [
  {
    id: 'ct-1',
    name: 'Weekly Team Sync',
    description:
      'Standard weekly check-in covering wins, blockers, and priorities for the coming week.',
    category: 'weekly_sync',
    frequency: 'weekly',
    questions: [
      {
        id: 'q1',
        text: 'What were your top accomplishments this week?',
        hint: 'List 2-3 key wins',
        isRequired: true,
      },
      {
        id: 'q2',
        text: 'Are you blocked on anything right now?',
        hint: 'Technical, process, or people blockers',
        isRequired: true,
      },
      {
        id: 'q3',
        text: 'What are your top priorities for next week?',
        hint: 'Top 3 focus areas',
        isRequired: true,
      },
      { id: 'q4', text: 'Is there anything I can help unblock for you?', isRequired: false },
      {
        id: 'q5',
        text: 'How are you feeling about your workload? (1-5)',
        hint: '1=Overwhelmed, 5=Comfortable',
        isRequired: false,
      },
    ],
    estimatedDuration: 20,
    usageCount: 342,
    rating: 4.7,
    isSystem: true,
    isSaved: true,
    tags: ['popular', 'engineering'],
  },
  {
    id: 'ct-2',
    name: 'Career Growth Conversation',
    description:
      'Deep-dive into career aspirations, skill development, and growth trajectory planning.',
    category: 'career_dev',
    frequency: 'monthly',
    questions: [
      {
        id: 'q1',
        text: 'How do you feel about your career progress over the past month?',
        isRequired: true,
      },
      { id: 'q2', text: 'What skills are you most excited to develop?', isRequired: true },
      {
        id: 'q3',
        text: 'Where do you see yourself in 6-12 months?',
        hint: 'Role, responsibilities, skills',
        isRequired: true,
      },
      {
        id: 'q4',
        text: "Are there projects or stretch assignments you'd like to take on?",
        isRequired: false,
      },
      {
        id: 'q5',
        text: 'What learning resources would be most helpful right now?',
        isRequired: false,
      },
      {
        id: 'q6',
        text: 'Is there anything blocking your growth that we should address?',
        isRequired: true,
      },
    ],
    estimatedDuration: 45,
    usageCount: 156,
    rating: 4.9,
    isSystem: true,
    isSaved: false,
    tags: ['career', 'growth'],
  },
  {
    id: 'ct-3',
    name: 'Quarterly Performance Review Prep',
    description:
      'Structured preparation template for quarterly performance conversations with goal alignment.',
    category: 'performance_review',
    frequency: 'quarterly',
    questions: [
      {
        id: 'q1',
        text: 'Review your goals from last quarter. What progress was made?',
        isRequired: true,
      },
      {
        id: 'q2',
        text: 'Which goals were fully achieved? Which need more time?',
        isRequired: true,
      },
      {
        id: 'q3',
        text: 'What impact did your work have on team/company objectives?',
        isRequired: true,
      },
      {
        id: 'q4',
        text: 'What feedback have you received from peers this quarter?',
        isRequired: false,
      },
      {
        id: 'q5',
        text: 'What are your proposed goals for next quarter?',
        hint: 'Aligned with team OKRs',
        isRequired: true,
      },
      { id: 'q6', text: 'What support do you need to achieve these goals?', isRequired: false },
      { id: 'q7', text: 'Any concerns about role, team, or company direction?', isRequired: false },
    ],
    estimatedDuration: 60,
    usageCount: 89,
    rating: 4.6,
    isSystem: true,
    isSaved: true,
    tags: ['quarterly', 'goals', 'OKRs'],
  },
  {
    id: 'ct-4',
    name: 'Project Pulse Check',
    description: 'Quick project-focused check-in for active sprints and deliverables.',
    category: 'project_check',
    frequency: 'weekly',
    questions: [
      {
        id: 'q1',
        text: 'Current status on your main deliverables?',
        hint: 'On track / At risk / Behind',
        isRequired: true,
      },
      { id: 'q2', text: 'Any dependencies or risks emerging?', isRequired: true },
      { id: 'q3', text: 'Do you need any additional resources or support?', isRequired: false },
      { id: 'q4', text: 'What decisions need to be made this week?', isRequired: false },
    ],
    estimatedDuration: 15,
    usageCount: 224,
    rating: 4.4,
    isSystem: true,
    isSaved: false,
    tags: ['agile', 'sprint'],
  },
  {
    id: 'ct-5',
    name: 'Wellbeing & Energy Check',
    description:
      'Holistic check-in focused on work-life balance, energy levels, and team dynamics.',
    category: 'wellbeing',
    frequency: 'biweekly',
    questions: [
      { id: 'q1', text: 'How would you rate your energy level this week? (1-5)', isRequired: true },
      { id: 'q2', text: 'Are you getting enough focus time for deep work?', isRequired: true },
      { id: 'q3', text: 'How is your work-life balance feeling?', isRequired: true },
      { id: 'q4', text: 'Is there anything causing unnecessary stress?', isRequired: false },
      { id: 'q5', text: "What's one thing that would improve your day-to-day?", isRequired: false },
    ],
    estimatedDuration: 25,
    usageCount: 178,
    rating: 4.8,
    isSystem: true,
    isSaved: false,
    tags: ['wellbeing', 'balance'],
  },
  {
    id: 'ct-6',
    name: '30-60-90 Day Onboarding',
    description: 'Structured check-in template for new hire onboarding milestones.',
    category: 'onboarding',
    frequency: 'monthly',
    questions: [
      {
        id: 'q1',
        text: 'What have you learned about the team and product so far?',
        isRequired: true,
      },
      { id: 'q2', text: 'Do you have clarity on your role expectations?', isRequired: true },
      { id: 'q3', text: 'Who have you connected with on the team?', isRequired: false },
      { id: 'q4', text: 'What tools or access do you still need?', isRequired: true },
      { id: 'q5', text: 'What questions or concerns do you have?', isRequired: false },
      { id: 'q6', text: 'Rate your onboarding experience so far (1-5)', isRequired: true },
    ],
    estimatedDuration: 30,
    usageCount: 67,
    rating: 4.5,
    isSystem: true,
    isSaved: false,
    tags: ['onboarding', 'new-hire'],
  },
];

// ── Component ────────────────────────────────────────────────────────────────────

export const CheckInTemplates: React.FC<CheckInTemplatesProps> = ({ templates, onUseTemplate }) => {
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    return new Set(templates.filter((t) => t.isSaved).map((t) => t.id));
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set<TemplateCategory>();
    templates.forEach((t) => set.add(t.category));
    return Array.from(set);
  }, [templates]);

  const filtered = useMemo(() => {
    let list = templates;
    if (categoryFilter !== 'all') {
      list = list.filter((t) => t.category === categoryFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return list;
  }, [templates, categoryFilter, searchQuery]);

  const toggleSaved = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleCopy = useCallback((tpl: CheckInTemplate) => {
    const text = tpl.questions
      .map((q, i) => `${i + 1}. ${q.text}${q.hint ? ` (${q.hint})` : ''}`)
      .join('\n');
    navigator.clipboard.writeText(`${tpl.name}\n\n${text}`).catch(() => {});
    setCopiedId(tpl.id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  return (
    <div className="space-y-3">
      {/* Search & Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-3 h-3 text-silver-mist absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue text-[10px] text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
          />
        </div>
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-2 py-1.5 rounded-lg text-[8px] font-bold transition-colors ${
            categoryFilter === 'all'
              ? 'bg-celestial-indigo/10 text-celestial-indigo'
              : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
          }`}
        >
          All ({templates.length})
        </button>
        {categories.map((cat) => {
          const cfg = CATEGORY_CONFIG[cat];
          const CatIcon = cfg.icon;
          const count = templates.filter((t) => t.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`flex items-center gap-0.5 px-2 py-1.5 rounded-lg text-[8px] font-bold transition-colors ${
                categoryFilter === cat
                  ? `${cfg.bg} ${cfg.color}`
                  : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
              }`}
            >
              <CatIcon className="w-2.5 h-2.5" />
              {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Template Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {filtered.map((tpl) => {
          const catCfg = CATEGORY_CONFIG[tpl.category];
          const CatIcon = catCfg.icon;
          const isExpanded = expandedId === tpl.id;
          const isSaved = savedIds.has(tpl.id);
          const isCopied = copiedId === tpl.id;

          return (
            <div
              key={tpl.id}
              className={`rounded-xl border overflow-hidden transition-colors ${
                isSaved
                  ? 'border-celestial-indigo/20 bg-white dark:bg-stellar-blue'
                  : 'border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue'
              }`}
            >
              {/* Card Header */}
              <div className="p-3">
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${catCfg.bg}`}
                  >
                    <CatIcon className={`w-4 h-4 ${catCfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[10px] font-bold text-ink-black dark:text-pearl truncate">
                        {tpl.name}
                      </p>
                      {tpl.isSystem && (
                        <span className="px-1 py-0.5 rounded text-[6px] font-bold bg-celestial-indigo/10 text-celestial-indigo shrink-0">
                          SYSTEM
                        </span>
                      )}
                    </div>
                    <p className="text-[8px] text-silver-mist mt-0.5 line-clamp-2">
                      {tpl.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span
                        className={`px-1 py-0.5 rounded text-[7px] font-bold ${catCfg.color} ${catCfg.bg}`}
                      >
                        {catCfg.label}
                      </span>
                      <span className="text-[7px] text-silver-mist flex items-center gap-0.5">
                        <Clock className="w-2 h-2" /> {tpl.estimatedDuration}min
                      </span>
                      <span className="text-[7px] text-silver-mist">
                        {FREQUENCY_LABELS[tpl.frequency]}
                      </span>
                      <span className="text-[7px] text-silver-mist">
                        {tpl.questions.length} questions
                      </span>
                      <span className="text-[7px] text-sunset-amber flex items-center gap-0.5 font-bold">
                        <Star className="w-2 h-2 fill-current" /> {tpl.rating}
                      </span>
                      <span className="text-[7px] text-silver-mist">{tpl.usageCount} uses</span>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-1 mt-1">
                      {tpl.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-1 py-0.5 rounded text-[6px] font-bold bg-cloud/50 dark:bg-nebula-purple/10 text-silver-mist"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Save toggle */}
                  <button
                    onClick={() => toggleSaved(tpl.id)}
                    className="p-1 shrink-0"
                    title={isSaved ? 'Unsave' : 'Save'}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-4 h-4 text-celestial-indigo" />
                    ) : (
                      <Bookmark className="w-4 h-4 text-silver-mist hover:text-celestial-indigo transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expand/Collapse Questions */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : tpl.id)}
                className="w-full flex items-center justify-center gap-1 py-1.5 text-[8px] font-bold text-celestial-indigo hover:bg-celestial-indigo/5 transition-colors border-t border-cloud/50 dark:border-nebula-purple/10"
              >
                {isExpanded ? (
                  <>
                    Hide Questions <ChevronUp className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    Preview Questions <ChevronDown className="w-3 h-3" />
                  </>
                )}
              </button>

              {/* Expanded Questions */}
              {isExpanded && (
                <div className="px-3 pb-3 space-y-1.5 border-t border-cloud/50 dark:border-nebula-purple/10 pt-2">
                  {tpl.questions.map((q, idx) => (
                    <div key={q.id} className="flex items-start gap-2">
                      <span className="text-[8px] text-silver-mist/60 w-4 shrink-0 mt-0.5">
                        {idx + 1}.
                      </span>
                      <div className="flex-1">
                        <p className="text-[9px] text-ink-black dark:text-pearl">
                          {q.text}
                          {q.isRequired && <span className="text-coral-alert ml-0.5">*</span>}
                        </p>
                        {q.hint && (
                          <p className="text-[7px] text-silver-mist italic mt-0.5">{q.hint}</p>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-cloud/30 dark:border-nebula-purple/10">
                    <button
                      onClick={() => onUseTemplate?.(tpl)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-bold bg-celestial-indigo text-white hover:opacity-90 transition-opacity"
                    >
                      <Check className="w-3 h-3" /> Use Template
                    </button>
                    <button
                      onClick={() => handleCopy(tpl)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-bold border border-cloud dark:border-nebula-purple/20 text-ink-black dark:text-pearl hover:bg-pearl/50 dark:hover:bg-deep-cosmos/20 transition-colors"
                    >
                      {isCopied ? (
                        <Check className="w-3 h-3 text-neural-mint" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      {isCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-6 text-center">
          <LayoutTemplate className="w-8 h-8 mx-auto text-silver-mist/30 mb-2" />
          <p className="text-[10px] text-silver-mist">No templates match your search</p>
        </div>
      )}
    </div>
  );
};

export default CheckInTemplates;
