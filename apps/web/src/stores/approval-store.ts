import { create } from 'zustand';

export type ApprovalType = 'leave' | 'expense' | 'timesheet' | 'requisition' | 'document';

export type PendingApproval = {
  id: string;
  type: ApprovalType;
  title: string;
  requestedBy: string;
  requestedAt: string;
  priority: 'low' | 'medium' | 'high';
};

type ApprovalState = {
  pendingApprovals: PendingApproval[];
  count: number;
  isLoading: boolean;
  lastRefreshed: string | null;
  setPendingApprovals: (approvals: PendingApproval[]) => void;
  addApproval: (approval: PendingApproval) => void;
  removeApproval: (id: string) => void;
  setLoading: (loading: boolean) => void;
  refresh: () => void;
};

export const useApprovalStore = create<ApprovalState>((set) => ({
  pendingApprovals: [],
  count: 0,
  isLoading: false,
  lastRefreshed: null,
  setPendingApprovals: (approvals) =>
    set({ pendingApprovals: approvals, count: approvals.length, lastRefreshed: new Date().toISOString() }),
  addApproval: (approval) =>
    set((state) => ({
      pendingApprovals: [approval, ...state.pendingApprovals],
      count: state.count + 1,
    })),
  removeApproval: (id) =>
    set((state) => ({
      pendingApprovals: state.pendingApprovals.filter((a) => a.id !== id),
      count: Math.max(0, state.count - 1),
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  refresh: () => set({ lastRefreshed: new Date().toISOString() }),
}));
