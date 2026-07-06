import * as React from 'react';
import { X, Calendar, User, Clock } from 'lucide-react';

interface DetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  data: Record<string, unknown> | null;
  fields: Array<{
    key: string;
    label: string;
    render?: (val: unknown) => React.ReactNode;
  }>;
  renderExtra?: (data: Record<string, unknown>) => React.ReactNode;
}

export function DetailsModal({
  open,
  onOpenChange,
  title,
  data,
  fields,
  renderExtra,
}: DetailsModalProps) {
  if (!open || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all max-h-[90vh] flex flex-col scale-100 duration-300 my-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((f) => {
              const val = data[f.key];
              const rendered = f.render ? f.render(val) : val != null ? String(val) : '—';
              return (
                <div key={f.key} className="border-b border-slate-50 pb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    {f.label}
                  </span>
                  <div className="mt-1 text-sm font-medium text-slate-800">{rendered}</div>
                </div>
              );
            })}
          </div>

          {renderExtra && <div className="border-t border-slate-100 pt-4">{renderExtra(data)}</div>}

          {/* Audit Metadata */}
          <div className="rounded-xl bg-slate-50 p-4 text-xs text-slate-500 border border-slate-100 space-y-2">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider">Audit History</h4>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  Created:{' '}
                  {data.createdAt ? new Date(data.createdAt as string).toLocaleString() : '—'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>Created By: {(data.createdBy as string) ?? 'System'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  Last Updated:{' '}
                  {data.updatedAt ? new Date(data.updatedAt as string).toLocaleString() : '—'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>Updated By: {(data.updatedBy as string) ?? 'System'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-100 px-6 py-4 bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
