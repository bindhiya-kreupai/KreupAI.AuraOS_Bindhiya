/**
 * @module useApprovals
 * @description React hooks for Unified Approval Center state management
 * @project AURA HCM Platform
 */

'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { ApprovalService, type ApprovalRequest } from '@/services/approvalService';

export function useApprovals() {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Load data
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const data = await ApprovalService.getRequests();
      if (!cancelled) {
        setRequests(data);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Derived data
  const pending = useMemo(() => requests.filter((r) => r.status === 'pending'), [requests]);
  const completed = useMemo(() => requests.filter((r) => r.status !== 'pending'), [requests]);

  const summary = useMemo(() => {
    const p = pending;
    return {
      leave: p.filter((r) => r.type === 'leave').length,
      expense: p.filter((r) => r.type === 'expense').length,
      timesheet: p.filter((r) => r.type === 'timesheet').length,
      requisition: p.filter((r) => r.type === 'requisition').length,
      document: p.filter((r) => r.type === 'document').length,
      total: p.length,
    };
  }, [pending]);

  // Actions
  const approve = useCallback(async (id: string, remarks?: string) => {
    const updated = await ApprovalService.approve(id, remarks);
    setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const reject = useCallback(async (id: string, remarks: string) => {
    const updated = await ApprovalService.reject(id, remarks);
    setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const escalate = useCallback(async (id: string, remarks?: string) => {
    const updated = await ApprovalService.escalate(id, remarks);
    setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
  }, []);

  const bulkApprove = useCallback(
    async (remarks?: string) => {
      const ids = Array.from(selectedIds);
      await ApprovalService.bulkApprove(ids, remarks);
      const data = await ApprovalService.getRequests();
      setRequests(data);
      setSelectedIds(new Set());
    },
    [selectedIds]
  );

  const bulkReject = useCallback(
    async (remarks: string) => {
      const ids = Array.from(selectedIds);
      await ApprovalService.bulkReject(ids, remarks);
      const data = await ApprovalService.getRequests();
      setRequests(data);
      setSelectedIds(new Set());
    },
    [selectedIds]
  );

  const addComment = useCallback(async (id: string, text: string) => {
    await ApprovalService.addComment(id, text);
    const data = await ApprovalService.getRequests();
    setRequests(data);
  }, []);

  // Selection
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return {
    requests,
    loading,
    pending,
    completed,
    summary,
    selectedIds,
    approve,
    reject,
    escalate,
    bulkApprove,
    bulkReject,
    addComment,
    toggleSelect,
    selectAll,
    clearSelection,
  };
}
