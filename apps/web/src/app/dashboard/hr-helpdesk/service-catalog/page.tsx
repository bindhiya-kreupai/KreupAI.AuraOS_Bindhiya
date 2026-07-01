'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Briefcase, Search, ChevronRight, Loader2, AlertCircle, Plus } from 'lucide-react';
import { CatalogApi, ServiceRequestsApi, type CatalogItemDTO } from '../services';

type Feedback = { kind: 'success' | 'error'; message: string };

export default function ServiceCatalogPage() {
  const [items, setItems] = useState<CatalogItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await CatalogApi.list();
      setItems(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load the service catalog.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    if (!feedback) {
      return;
    }
    const timer = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return items;
    }
    return items.filter((item) => {
      const haystack = `${item.title} ${item.description ?? ''} ${item.category}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [items, searchTerm]);

  const handleRequest = useCallback(
    async (item: CatalogItemDTO) => {
      setRequestingId(item.id);
      setFeedback(null);
      try {
        await ServiceRequestsApi.create({ service: item.title, catalogItemId: item.id });
        setFeedback({ kind: 'success', message: `Request submitted for "${item.title}".` });
        await loadCatalog();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to submit the request.';
        setFeedback({ kind: 'error', message });
      } finally {
        setRequestingId(null);
      }
    },
    [loadCatalog]
  );

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-500" />
            Service Catalog
          </h1>
          <p className="text-slate-500 text-sm">Browse and request HR services.</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search services..."
            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {feedback ? (
        <div
          className={`shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm ${
            feedback.kind === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
          }`}
          role="status"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {feedback.message}
        </div>
      ) : null}

      {error ? (
        <div
          className="shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl border bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={() => void loadCatalog()}
            className="font-bold underline underline-offset-2 hover:no-underline"
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading service catalog...
          </div>
        ) : null}

        {!loading && !error && filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-slate-500">
            <Briefcase className="w-10 h-10 text-slate-300 dark:text-slate-700" />
            <p className="font-semibold">No services found</p>
            <p className="text-sm">
              {searchTerm.trim()
                ? 'Try a different search term.'
                : 'No catalog items are available yet.'}
            </p>
          </div>
        ) : null}

        {!loading && filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredItems.map((item) => {
              const isRequesting = requestingId === item.id;
              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all flex flex-col"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <span className="inline-flex self-start items-center px-2 py-0.5 mb-2 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {item.category}
                  </span>
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  {item.description ? (
                    <p className="text-sm text-slate-500 mb-4 flex-1">{item.description}</p>
                  ) : (
                    <div className="flex-1" />
                  )}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                    <span>SLA: {item.slaHours}h</span>
                    <span>{item.requestCount} requests</span>
                  </div>
                  <button
                    type="button"
                    disabled={isRequesting}
                    onClick={() => void handleRequest(item)}
                    className="mt-auto inline-flex items-center justify-center gap-1 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRequesting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Request Service
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
