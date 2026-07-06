'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { LayoutTemplate, Download, Eye, Loader2, X } from 'lucide-react';
import { BudgetTemplateService, BudgetService } from '../../services';
import { ToastContainer, useToast } from '../../components/Toast';

export default function BudgetTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState<any | null>(null);
  const [usingId, setUsingId] = useState<string | null>(null);
  const { toasts, showToast, dismissToast } = useToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const result = await BudgetTemplateService.getTemplates();
      setTemplates(result);
    } catch {
      showToast('error', 'Failed to load budget templates.');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUse = async (template: any) => {
    setUsingId(template.id);
    try {
      await BudgetService.createFromTemplate(template.id, {
        budgetName: `${template.templateName} Budget`,
      });
      showToast('success', 'Budget created from template.');
      await load();
    } catch {
      showToast('error', 'Failed to create budget from template.');
    } finally {
      setUsingId(null);
    }
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={dismissToast} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6 text-indigo-500" />
            Budget Templates
          </h1>
          <p className="text-slate-500 text-sm">
            Standardized templates for departmental forecasting.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
            <LayoutTemplate className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-lg mb-1">No templates yet</h3>
          <p className="text-sm text-slate-500 max-w-sm">
            Budget templates you create will appear here for standardized departmental forecasting.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {templates.map((tmpl, i) => (
            <div
              key={tmpl.id || i}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center mb-4 text-indigo-600">
                <LayoutTemplate className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">{tmpl.templateName}</h3>
              <p className="text-sm text-slate-500 mb-4 min-h-[40px]">{tmpl.description}</p>

              <div className="flex flex-wrap gap-2 mb-6 text-xs">
                {tmpl.templateType && (
                  <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                    {tmpl.templateType}
                  </span>
                )}
                {tmpl.defaultPeriod && (
                  <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                    {tmpl.defaultPeriod}
                  </span>
                )}
                {typeof tmpl.usageCount === 'number' && (
                  <span className="px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 font-medium">
                    Used {tmpl.usageCount}x
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(tmpl)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-200"
                >
                  <Eye className="w-4 h-4" /> Preview
                </button>
                <button
                  type="button"
                  onClick={() => handleUse(tmpl)}
                  disabled={usingId === tmpl.id}
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {usingId === tmpl.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Use
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {previewTemplate && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <LayoutTemplate className="w-5 h-5 text-indigo-500" />
                {previewTemplate.templateName}
              </h2>
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {previewTemplate.description && (
                <p className="text-sm text-slate-500">{previewTemplate.description}</p>
              )}

              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-slate-400 font-medium">Type</dt>
                  <dd className="font-semibold">{previewTemplate.templateType || '—'}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Default Period</dt>
                  <dd className="font-semibold">{previewTemplate.defaultPeriod || '—'}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Default Currency</dt>
                  <dd className="font-semibold">{previewTemplate.defaultCurrency || '—'}</dd>
                </div>
              </dl>

              {Array.isArray(previewTemplate.templateLines) &&
                previewTemplate.templateLines.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold mb-2">Template Lines</h3>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800">
                      {previewTemplate.templateLines.map((line: any, idx: number) => (
                        <div
                          key={line.id || idx}
                          className="flex items-center justify-between p-3 text-sm"
                        >
                          <div>
                            <p className="font-medium">
                              {line.category || line.description || `Line ${idx + 1}`}
                            </p>
                            {line.subcategory && (
                              <p className="text-xs text-slate-400">{line.subcategory}</p>
                            )}
                          </div>
                          {typeof line.defaultAmount === 'number' && (
                            <span className="text-slate-500 font-medium">{line.defaultAmount}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            <div className="flex justify-end gap-2 p-6 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-200"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const tmpl = previewTemplate;
                  setPreviewTemplate(null);
                  handleUse(tmpl);
                }}
                disabled={usingId === previewTemplate.id}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" /> Use Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
