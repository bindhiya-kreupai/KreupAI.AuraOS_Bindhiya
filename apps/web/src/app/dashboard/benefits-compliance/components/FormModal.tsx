import * as React from 'react';
import { X } from 'lucide-react';

interface FormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  submitText?: string;
  cancelText?: string;
  children: React.ReactNode;
}

export function FormModal({
  open,
  onOpenChange,
  title,
  onSubmit,
  submitText = 'Save',
  cancelText = 'Cancel',
  children,
}: FormModalProps) {
  const [submitting, setSubmitting] = React.useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(e);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl transform overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all max-h-[90vh] flex flex-col scale-98 hover:scale-100 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
          <div className="flex-1 p-6 space-y-4">{children}</div>

          {/* Footer */}
          <div className="flex justify-end border-t border-slate-100 px-6 py-4 bg-slate-50 gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={() => onOpenChange(false)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
