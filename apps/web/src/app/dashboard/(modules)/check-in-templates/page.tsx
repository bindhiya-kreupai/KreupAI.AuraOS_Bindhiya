'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { LayoutTemplate, FileText, Megaphone, Loader2, ArrowRight } from 'lucide-react';
import { CheckInTemplates } from '@/components/performance/CheckInTemplates';
import type { CheckInTemplate } from '@/components/performance/CheckInTemplates';
import {
  CheckInTemplateService,
  type CheckInTemplateRecord,
} from '@/services/checkInTemplateService';

const TABS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: 'templates', label: 'Check-In Templates', icon: LayoutTemplate },
  { key: 'notes', label: '1:1 Notes', icon: FileText },
  { key: 'praise', label: 'Praise Wall', icon: Megaphone },
];

const CATEGORY_MAP: Record<string, CheckInTemplate['category']> = {
  one_on_one: 'weekly_sync',
  weekly_checkin: 'weekly_sync',
  monthly_review: 'career_dev',
  quarterly: 'performance_review',
};

const CADENCE_MAP: Record<string, CheckInTemplate['frequency']> = {
  weekly: 'weekly',
  biweekly: 'biweekly',
  monthly: 'monthly',
  quarterly: 'quarterly',
};

// Adapt a persisted record to the display component's richer shape.
function toDisplay(r: CheckInTemplateRecord): CheckInTemplate {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? '',
    category: CATEGORY_MAP[r.category] ?? 'weekly_sync',
    frequency: CADENCE_MAP[r.cadence] ?? 'weekly',
    questions: (r.questions || []).map((q, i) => ({
      id: q.id ?? `q${i + 1}`,
      text: q.text,
      hint: q.hint,
      isRequired: q.isRequired ?? false,
    })),
    estimatedDuration: Math.max(15, (r.questions?.length ?? 0) * 5),
    usageCount: r.usageCount,
    rating: 0,
    isSystem: r.isDefault,
    isSaved: false,
    tags: [],
  };
}

export default function CheckInTemplatesPage() {
  const [activeTab, setActiveTab] = useState('templates');
  const [templates, setTemplates] = useState<CheckInTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await CheckInTemplateService.list();
      setTemplates(rows.map(toDisplay));
    } catch {
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'templates') load();
  }, [activeTab, load]);

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), 4000);
    return () => clearTimeout(t);
  }, [status]);

  const handleUseTemplate = useCallback(
    async (template: CheckInTemplate) => {
      try {
        await CheckInTemplateService.use(template.id);
        setStatus(`Started a check-in from "${template.name}".`);
        await load();
      } catch {
        setStatus('Could not use template. Please try again.');
      }
    },
    [load]
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <LayoutTemplate className="w-5 h-5 text-celestial-indigo" />
        <div>
          <p className="text-sm font-bold text-ink-black dark:text-pearl">
            Check-In Templates & 1:1 Notes
          </p>
          <p className="text-[9px] text-silver-mist">
            Templates for recurring check-ins, shared meeting notes, and public praise
          </p>
        </div>
      </div>

      {status && (
        <div className="rounded-lg border border-neural-mint/40 bg-neural-mint/10 px-3 py-2 text-[10px] font-semibold text-neural-mint">
          {status}
        </div>
      )}

      {/* Tabs */}
      <div className="flex rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden">
        {TABS.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-bold transition-colors ${
                activeTab === tab.key
                  ? 'text-celestial-indigo bg-celestial-indigo/5 border-b-2 border-celestial-indigo'
                  : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
              }`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'templates' &&
        (loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-celestial-indigo" />
          </div>
        ) : (
          <CheckInTemplates templates={templates} onUseTemplate={handleUseTemplate} />
        ))}

      {activeTab === 'notes' && (
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-8 text-center space-y-3">
          <FileText className="w-10 h-10 mx-auto text-celestial-indigo/60" />
          <p className="text-sm font-bold text-ink-black dark:text-pearl">1:1 Meeting Notes</p>
          <p className="text-xs text-silver-mist max-w-md mx-auto">
            1:1 notes and action items are managed in the dedicated 1-on-1 Meetings workspace,
            backed by the meetings API.
          </p>
          <Link
            href="/dashboard/performance/1-on-1-meetings"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-celestial-indigo text-white hover:opacity-90 transition-opacity"
          >
            Open 1-on-1 Meetings <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {activeTab === 'praise' && (
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-8 text-center space-y-3">
          <Megaphone className="w-10 h-10 mx-auto text-celestial-indigo/60" />
          <p className="text-sm font-bold text-ink-black dark:text-pearl">Praise & Recognition</p>
          <p className="text-xs text-silver-mist max-w-md mx-auto">
            Public recognition posts, reactions, and the leaderboard live on the Recognition Wall,
            backed by the feedback API.
          </p>
          <Link
            href="/dashboard/performance/recognition-wall"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-celestial-indigo text-white hover:opacity-90 transition-opacity"
          >
            Open Recognition Wall <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
