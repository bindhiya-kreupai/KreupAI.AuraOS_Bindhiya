import * as React from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface ExportButtonProps {
  data: any[];
  filename?: string;
  headers?: Array<{ label: string; key: string }>;
  className?: string;
}

export function ExportButton({
  data = [],
  filename = 'export',
  headers = [],
  className = '',
}: ExportButtonProps) {
  const handleExport = () => {
    if (!data.length) {
      toast.error('No data available to export');
      return;
    }

    try {
      let csvContent = '\uFEFF'; // Add BOM for Excel UTF-8 support

      // Headers
      const targetHeaders = headers.length
        ? headers
        : Object.keys(data[0]).map((k) => ({ label: k, key: k }));

      csvContent += targetHeaders.map((h) => `"${h.label.replace(/"/g, '""')}"`).join(',') + '\r\n';

      // Rows
      for (const row of data) {
        const line = targetHeaders
          .map((h) => {
            let val = row[h.key];
            if (val === null || val === undefined) return '""';
            if (typeof val === 'object') {
              // Flatten nested objects like department/company names
              if (val.name) val = val.name;
              else if (val.firstName) val = `${val.firstName} ${val.lastName || ''}`;
              else val = JSON.stringify(val);
            }
            return `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(',');
        csvContent += line + '\r\n';
      }

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully as CSV');
    } catch (e) {
      console.error(e);
      toast.error('Failed to export data');
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className={`inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 ${className}`}
    >
      <Download className="h-4 w-4" />
      Export CSV
    </button>
  );
}
