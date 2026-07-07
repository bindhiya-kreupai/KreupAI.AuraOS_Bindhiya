'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  FileText,
  ChevronRight,
  Star,
  HelpCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { KnowledgeApi, type KnowledgeArticleDTO } from '../services';

export default function KnowledgeBasePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState<KnowledgeArticleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setArticles(await KnowledgeApi.list());
    } catch {
      setError('Failed to load knowledge base articles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Live search against the API when the term is non-trivial.
  useEffect(() => {
    const term = searchTerm.trim();
    if (term.length < 2) return;
    const handle = setTimeout(async () => {
      try {
        setArticles(await KnowledgeApi.search(term));
      } catch {
        setError('Search failed');
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of articles) map.set(a.category, (map.get(a.category) ?? 0) + 1);
    return Array.from(map.entries()).map(([title, count]) => ({ title, count }));
  }, [articles]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return articles;
    return articles.filter(
      (a) => a.title.toLowerCase().includes(term) || (a.category ?? '').toLowerCase().includes(term)
    );
  }, [articles, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-6">
      <div className="bg-indigo-600 relative overflow-hidden rounded-b-3xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="max-w-4xl mx-auto px-6 py-16 relative z-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How can we help you today?
          </h1>
          <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
            Search our knowledge base for answers about payroll, benefits, IT, and more.
          </p>
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="e.g. How to apply for leave?"
              className="w-full pl-12 pr-4 py-4 rounded-xl shadow-lg border-2 border-transparent focus:border-indigo-300 focus:outline-none text-slate-900 placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-20">
        {error && (
          <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-sm font-medium">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <>
            {categories.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
                {categories.map((category) => (
                  <button
                    key={category.title}
                    type="button"
                    onClick={() => setSearchTerm(category.title)}
                    className="text-left bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 hover:-translate-y-1 transition-transform group"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2 group-hover:text-indigo-600 transition-colors">
                      {category.title}
                    </h3>
                    <div className="flex items-center text-xs font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">
                      {category.count} Articles <ChevronRight className="w-3 h-3 ml-1" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 mb-6">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    Popular Articles
                  </h2>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700 overflow-hidden">
                  {filtered.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-400">No articles found.</div>
                  ) : (
                    filtered.map((article) => (
                      <div
                        key={article.id}
                        className="p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-start gap-3"
                      >
                        <div className="mt-1 p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-500">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900 dark:text-slate-100">
                            {article.title}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                            <span>{article.category}</span>
                            <span>•</span>
                            <span>{article.readMinutes} min read</span>
                            <span>•</span>
                            <span>{article.views} views</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300" />
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">
                    Still need help?
                  </h3>
                  <p className="text-sm text-slate-500 mb-6">
                    Can&apos;t find what you&apos;re looking for? Raise a ticket and our HR team
                    will get back to you.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard/hr-helpdesk/tickets')}
                    className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
                  >
                    Create Support Ticket
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
