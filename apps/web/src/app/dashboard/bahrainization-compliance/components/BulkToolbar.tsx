import * as React from 'react';
import { Archive, Trash2, RotateCcw, X } from 'lucide-react';
import { toast } from 'sonner';
import { ExportButton } from './ExportButton';

type BahrainizationEntity = 'config' | 'targets' | 'hires' | 'snapshots' | 'certificate';

interface BulkToolbarProps {
  selectedIds: string[];
  onClear: () => void;
  entity: BahrainizationEntity;
  filter?: Record<string, string | number | boolean | undefined>;
  onActionComplete: () => void;
  showArchive?: boolean;
  showRestore?: boolean;
  showDelete?: boolean;
}

export function BulkToolbar({
  selectedIds,
  onClear,
  entity,
  filter = {},
  onActionComplete,
  showArchive = true,
  showRestore = false,
  showDelete = true,
}: BulkToolbarProps) {
  const [busyAction, setBusyAction] = React.useState<string | null>(null);

  if (selectedIds.length === 0) return null;

  const handleBulkAction = async (action: 'bulk-archive' | 'bulk-restore' | 'bulk-delete') => {
    if (action === 'bulk-delete') {
      const confirmed = window.confirm(
        `Permanently delete ${selectedIds.length} record(s)? This cannot be undone.`
      );
      if (!confirmed) return;
    }
    setBusyAction(action);
    try {
      const res = await fetch(`/api/v1/bahrainization-compliance/${entity}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids: selectedIds }),
      });
      const data = (await res.json()) as { success: boolean; error?: { message?: string } };
      if (data.success) {
        toast.success(`${selectedIds.length} record(s) ${action.replace('bulk-', '')}d`);
        onActionComplete();
        onClear();
      } else {
        toast.error(data.error?.message ?? 'Failed to execute bulk action');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error executing bulk action');
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between gap-4 rounded-2xl bg-slate-900 border border-slate-800 px-6 py-4 shadow-2xl min-w-[500px] max-w-2xl text-white select-none">
      <div className="flex items-center gap-3 border-r border-slate-800 pr-4">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-sky-400">
          {selectedIds.length}
        </span>
        <span className="text-sm font-medium text-slate-300">Selected</span>
      </div>

      <div className="flex flex-1 items-center gap-2">
        {showArchive && (
          <button
            type="button"
            disabled={busyAction !== null}
            onClick={() => handleBulkAction('bulk-archive')}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-medium text-white transition-all disabled:opacity-50"
          >
            <Archive className="h-3.5 w-3.5" />
            {busyAction === 'bulk-archive' ? 'Archiving...' : 'Archive'}
          </button>
        )}

        {showRestore && (
          <button
            type="button"
            disabled={busyAction !== null}
            onClick={() => handleBulkAction('bulk-restore')}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-medium text-white transition-all disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {busyAction === 'bulk-restore' ? 'Restoring...' : 'Restore'}
          </button>
        )}

        {showDelete && (
          <button
            type="button"
            disabled={busyAction !== null}
            onClick={() => handleBulkAction('bulk-delete')}
            className="flex items-center gap-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/40 px-3.5 py-2 text-xs font-medium text-rose-300 transition-all disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5 text-rose-400" />
            {busyAction === 'bulk-delete' ? 'Deleting...' : 'Delete'}
          </button>
        )}

        <ExportButton
          entity={entity}
          filter={filter}
          selectedIds={selectedIds}
          className="!border-slate-800 !bg-slate-800 !text-white hover:!bg-slate-700 !py-2 !px-3.5"
        />
      </div>

      <button
        type="button"
        onClick={onClear}
        className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
