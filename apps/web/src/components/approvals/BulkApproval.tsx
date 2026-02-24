/**
 * @module BulkApproval
 * @description Bulk approve/reject toolbar for selected approval requests
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Check, X, CheckCheck, AlertTriangle } from 'lucide-react';

interface BulkApprovalProps {
  selectedCount: number;
  totalPending: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkApprove: (remarks?: string) => void;
  onBulkReject: (remarks: string) => void;
}

export const BulkApproval: React.FC<BulkApprovalProps> = ({
  selectedCount,
  totalPending,
  onSelectAll,
  onClearSelection,
  onBulkApprove,
  onBulkReject,
}) => {
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [approveRemarks, setApproveRemarks] = useState('');
  const [showApproveRemarks, setShowApproveRemarks] = useState(false);

  const handleBulkApprove = useCallback(() => {
    onBulkApprove(approveRemarks.trim() || undefined);
    setApproveRemarks('');
    setShowApproveRemarks(false);
  }, [approveRemarks, onBulkApprove]);

  const handleBulkReject = useCallback(() => {
    if (!rejectReason.trim()) return;
    onBulkReject(rejectReason.trim());
    setRejectReason('');
    setShowRejectInput(false);
  }, [rejectReason, onBulkReject]);

  if (selectedCount === 0) return null;

  return (
    <div className="sticky top-0 z-10 rounded-xl border border-celestial-indigo/30 bg-celestial-indigo/5 dark:bg-celestial-indigo/5 backdrop-blur-sm p-3 shadow-sm">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Selection info */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <CheckCheck className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs font-bold text-celestial-indigo">{selectedCount}</span>
            <span className="text-[10px] text-silver-mist">of {totalPending} selected</span>
          </div>
          <button
            onClick={selectedCount === totalPending ? onClearSelection : onSelectAll}
            className="text-[10px] text-celestial-indigo hover:text-celestial-indigo/80 underline transition-colors"
          >
            {selectedCount === totalPending ? 'Deselect all' : 'Select all'}
          </button>
        </div>

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {showApproveRemarks ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={approveRemarks}
                onChange={(e) => setApproveRemarks(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBulkApprove()}
                placeholder="Remarks (optional)..."
                className="px-2.5 py-1.5 rounded-lg border border-neural-mint/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-neural-mint transition-colors w-44"
                autoFocus
              />
              <button
                onClick={handleBulkApprove}
                className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-neural-mint text-white hover:opacity-90 transition-opacity"
              >
                Approve {selectedCount}
              </button>
              <button
                onClick={() => setShowApproveRemarks(false)}
                className="text-[10px] text-silver-mist"
              >
                Cancel
              </button>
            </div>
          ) : showRejectInput ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBulkReject()}
                placeholder="Rejection reason (required)..."
                className="px-2.5 py-1.5 rounded-lg border border-coral-alert/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-coral-alert transition-colors w-52"
                autoFocus
              />
              <button
                onClick={handleBulkReject}
                disabled={!rejectReason.trim()}
                className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-coral-alert text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                Reject {selectedCount}
              </button>
              <button
                onClick={() => setShowRejectInput(false)}
                className="text-[10px] text-silver-mist"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowApproveRemarks(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-neural-mint text-white hover:opacity-90 transition-opacity"
              >
                <Check className="w-3 h-3" /> Approve ({selectedCount})
              </button>
              <button
                onClick={() => setShowRejectInput(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-coral-alert text-white hover:opacity-90 transition-opacity"
              >
                <X className="w-3 h-3" /> Reject ({selectedCount})
              </button>
              <button
                onClick={onClearSelection}
                className="text-[10px] text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Warning for multiple selections */}
      {selectedCount > 3 && (
        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-sunset-amber">
          <AlertTriangle className="w-3 h-3" />
          Bulk action will apply to all {selectedCount} selected requests. Please review carefully.
        </div>
      )}
    </div>
  );
};

export default BulkApproval;
