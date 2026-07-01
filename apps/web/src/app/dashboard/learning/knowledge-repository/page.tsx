'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Library, FileText, Video, Eye, Loader2, X } from 'lucide-react';
import { KnowledgeBaseService } from '../services';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

interface Article {
  id?: string;
  title?: string;
  content?: string;
  summary?: string;
  category?: string;
  categoryName?: string;
  viewCount?: number;
}

export default function KnowledgeRepositoryPage() {
  const toast = useToast();
  const [data, setData] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Article | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await KnowledgeBaseService.getKnowledgeArticles();
      setData(result as Article[]);
    } catch (err) {
      console.error('Error loading knowledge articles:', err);
      toast.error('Failed to load knowledge articles. Please try again.');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Library className="w-6 h-6 text-indigo-500" />
            Knowledge Repository
          </h1>
          <p className="text-slate-500 text-sm">
            Central library for training materials and documentation.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <Library className="w-12 h-12 mb-4 opacity-30" />
          <p className="font-bold">No knowledge articles found</p>
          <p className="text-sm">Articles and resources will appear here once created.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 overflow-y-auto">
          {data.map((article, i) => {
            const catLabel = article.category || article.categoryName || 'Article';
            const isVideo = catLabel.toLowerCase().includes('video');
            const IconComponent = isVideo ? Video : FileText;
            const color = isVideo ? 'text-indigo-500' : 'text-rose-500';

            return (
              <div
                key={article.id || i}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <IconComponent className={`w-8 h-8 ${color}`} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setActive(article)}
                    title="View article"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
                <h4 className="font-bold text-sm mb-1 truncate" title={article.title}>
                  {article.title}
                </h4>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{catLabel}</span>
                  <span>{article.viewCount || 0} views</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {active && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-xl">{active.title}</h3>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {active.summary && (
              <p className="text-sm text-slate-500 italic mb-4">{active.summary}</p>
            )}
            <div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap">
              {active.content || 'No content available.'}
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
}
