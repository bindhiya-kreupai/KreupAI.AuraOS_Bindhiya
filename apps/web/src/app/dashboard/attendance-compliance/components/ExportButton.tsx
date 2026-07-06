import * as React from 'react';
import { Download, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

interface ExportButtonProps {
  entity: 'policies' | 'consents' | 'fraud-flags' | 'certificates';
  filter?: Record<string, any>;
  selectedIds?: string[];
  className?: string;
}

export function ExportButton({
  entity,
  filter = {},
  selectedIds = [],
  className = '',
}: ExportButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [exporting, setExporting] = React.useState<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (format: 'xlsx' | 'csv') => {
    setExporting(format);
    setOpen(false);
    try {
      const params = new URLSearchParams();
      params.set('entity', entity);
      params.set('format', format);

      // Add all active filters
      for (const [k, v] of Object.entries(filter)) {
        if (v !== undefined && v !== null && v !== '') {
          params.set(k, String(v));
        }
      }

      // Add selected IDs if any
      if (selectedIds.length > 0) {
        params.set('ids', selectedIds.join(','));
      }

      const res = await fetch(`/api/v1/attendance-compliance/export?${params.toString()}`);
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const contentDisposition = res.headers.get('content-disposition');
      let filename = `attendance_${entity}_export.${format}`;
      if (contentDisposition) {
        const matches = /filename="([^"]+)"/.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Data exported successfully as ${format.toUpperCase()}`);
    } catch (e: any) {
      console.error(e);
      toast.error('Failed to export data');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={exporting !== null}
        className={`inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50 ${className}`}
      >
        <Download className="h-4 w-4" />
        {exporting ? `Exporting...` : `Export`}
        <ChevronDown className="h-4 w-4 text-slate-450" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5 focus:outline-none z-50 animate-fade-in-up">
          <button
            onClick={() => handleExport('xlsx')}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span className="font-semibold">Excel Spreadsheet (.xlsx)</span>
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span className="font-semibold">CSV Flat File (.csv)</span>
          </button>
        </div>
      )}
    </div>
  );
}
