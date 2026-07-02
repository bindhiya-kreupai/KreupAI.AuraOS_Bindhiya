'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GoalTemplateService, type GoalTemplate } from '../../core/services';
import { Target, BookOpen, Search, Copy, Tag, Star, Loader2 } from 'lucide-react';

export default function GoalLibraryPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<GoalTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [usingId, setUsingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const items = await GoalTemplateService.list();
      setTemplates(items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of templates) counts.set(t.category, (counts.get(t.category) || 0) + 1);
    return [
      { name: 'All', count: templates.length },
      ...Array.from(counts.entries()).map(([name, count]) => ({ name, count })),
    ];
  }, [templates]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return templates.filter((t) => {
      const matchCat = selectedCategory === 'All' || t.category === selectedCategory;
      const matchQ =
        !q ||
        t.title.toLowerCase().includes(q) ||
        (t.metric || '').toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q));
      return matchCat && matchQ;
    });
  }, [templates, search, selectedCategory]);

  const handleUse = async (template: GoalTemplate) => {
    setUsingId(template.id);
    try {
      await GoalTemplateService.use(template.id);
      setTemplates((prev) =>
        prev.map((t) => (t.id === template.id ? { ...t, usageCount: t.usageCount + 1 } : t))
      );
      router.push(
        `/dashboard/performance/goal-setting?templateTitle=${encodeURIComponent(template.title)}`
      );
    } catch {
      setUsingId(null);
    }
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-500" />
            Goal Library
          </h1>
          <p className="text-slate-500 text-sm">
            Reusable KPI templates and objective inspirations.
          </p>
        </div>
      </div>

      <div className="flex h-full min-h-0 gap-3 overflow-hidden">
        {/* Sidebar Categories */}
        <div className="w-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-bold text-sm text-slate-500 uppercase tracking-wider">
            Categories
          </div>
          <div className="p-2 space-y-1 overflow-y-auto">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`w-full text-left p-3 rounded-xl flex items-center justify-between group transition-colors ${
                  selectedCategory === cat.name
                    ? 'bg-indigo-50 dark:bg-indigo-500/10'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {cat.name}
                </span>
                <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500">
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Search Bar */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search goals by title, KPI, or tag..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm outline-none"
              />
            </div>
          </div>

          {/* Goal List */}
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <BookOpen className="w-12 h-12 mb-3 opacity-30" />
                <p className="font-bold text-lg">No goal templates yet</p>
                <p className="text-sm mt-1">
                  Your HR administrator can add reusable KPI templates here.
                </p>
              </div>
            ) : (
              filtered.map((goal) => (
                <div
                  key={goal.id}
                  className="p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group last:border-0 relative"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-indigo-600 dark:text-indigo-400">
                      {goal.title}
                    </h3>
                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {goal.usageCount} used
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    {goal.metric && (
                      <div className="flex items-center gap-1 text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                        <Target className="w-4 h-4 text-rose-500" />
                        <span className="font-mono text-slate-600 dark:text-slate-300">
                          {goal.metric}
                          {goal.suggestedTarget ? `: ${goal.suggestedTarget}` : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Tag className="w-3 h-3" />
                    <span>{goal.category}</span>
                  </div>

                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleUse(goal)}
                      disabled={usingId === goal.id}
                      className="flex items-center gap-2 bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md hover:bg-indigo-600 disabled:opacity-50"
                    >
                      {usingId === goal.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}{' '}
                      Use this Goal
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
