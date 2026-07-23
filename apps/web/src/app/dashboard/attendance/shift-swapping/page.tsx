'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Repeat,
  Calendar,
  ArrowRightLeft,
  Clock,
  User,
  CheckCircle2,
  Search,
  Filter,
  ArrowRight,
  MapPin,
  XCircle,
  History,
  Send,
  Inbox,
  X,
  Loader2,
} from 'lucide-react';
import { ShiftSwapService } from '../services';
import { useCurrentUser } from '@/lib/auth/AuthProvider';
import { useI18n } from '@/lib/i18n/I18nProvider';

interface Shift {
  id: string;
  shiftId: string;
  date: string;
  time: string;
  type: 'Morning' | 'Evening' | 'Night';
  location: string;
  status: 'Scheduled' | 'Swap Requested' | 'Swapped';
}

interface MarketShift {
  id: string;
  requestorId?: string;
  swapWithId?: string;
  offeredBy: {
    name: string;
    role: string;
    avatar: string;
  };
  date: string;
  time: string;
  type: 'Morning' | 'Evening' | 'Night';
  reason: string;
}

interface SwapRequest {
  id: string;
  requestorId: string;
  requestorName?: string;
  swapWithId: string;
  swapWithName?: string;
  requestorDate: string;
  requestorShiftId: string;
  swapWithDate: string;
  swapWithShiftId: string;
  reason: string;
  status: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  PENDING: { label: 'Pending', bg: 'bg-amber-100 dark:bg-amber-900/20', text: 'text-amber-600' },
  APPROVED_BY_PEER: {
    label: 'Peer Approved',
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    text: 'text-blue-600',
  },
  APPROVED_BY_MANAGER: {
    label: 'Manager Approved',
    bg: 'bg-indigo-100 dark:bg-indigo-900/20',
    text: 'text-indigo-600',
  },
  COMPLETED: {
    label: 'Completed',
    bg: 'bg-emerald-100 dark:bg-emerald-900/20',
    text: 'text-emerald-600',
  },
  REJECTED: { label: 'Rejected', bg: 'bg-rose-100 dark:bg-rose-900/20', text: 'text-rose-600' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500' },
};

export default function ShiftSwappingPage() {
  const { user, loading: authLoading } = useCurrentUser();
  const { t, isRTL } = useI18n();
  const [activeTab, setActiveTab] = useState<'My Shifts' | 'Marketplace'>('My Shifts');
  const [myShifts, setMyShifts] = useState<Shift[]>([]);
  const [marketplace, setMarketplace] = useState<MarketShift[]>([]);
  const [swapRequests, setSwapRequests] = useState<{
    outgoing: SwapRequest[];
    incoming: SwapRequest[];
  }>({
    outgoing: [],
    incoming: [],
  });
  const [marketplaceFilter, setMarketplaceFilter] = useState<'all' | 'Morning' | 'Evening'>('all');
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(
    null
  );
  const [showSwapDialog, setShowSwapDialog] = useState(false);
  const [swapDialogShift, setSwapDialogShift] = useState<Shift | null>(null);
  const [swapWithInput, setSwapWithInput] = useState('');
  const [swapReason, setSwapReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const shiftsWithStatus = useMemo(() => {
    return myShifts.map((shift) => {
      const matchedSwap = swapRequests.outgoing.find(
        (swap) => swap.requestorShiftId === shift.shiftId && swap.status === 'PENDING'
      );
      return {
        ...shift,
        status: matchedSwap ? ('Swap Requested' as const) : ('Scheduled' as const),
      };
    });
  }, [myShifts, swapRequests]);

  useEffect(() => {
    if (!statusMsg) return;
    const t = setTimeout(() => setStatusMsg(null), 4000);
    return () => clearTimeout(t);
  }, [statusMsg]);

  useEffect(() => {
    if (authLoading) return;
    fetchAllData();
  }, [authLoading, user?.employeeId]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [shiftsResult, marketplaceResult, swapsResult] = await Promise.all([
        user?.employeeId ? ShiftSwapService.getMyShifts(user.employeeId) : Promise.resolve([]),
        ShiftSwapService.getMarketplace(),
        user?.employeeId
          ? ShiftSwapService.getMySwaps(user.employeeId)
          : Promise.resolve({ outgoing: [], incoming: [] }),
      ]);
      setMyShifts((shiftsResult || []) as any);
      // Filter marketplace to remove swaps involving the current user
      const filteredMarketplace = (marketplaceResult || []).filter(
        (item: any) => item.requestorId !== user?.employeeId
      );
      setMarketplace(filteredMarketplace as any);
      setSwapRequests(swapsResult);
    } catch (error: any) {
      setStatusMsg({ kind: 'error', text: error?.message || 'Failed to load data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSwap = (shift: Shift) => {
    setSwapDialogShift(shift);
    setSwapWithInput('');
    setSwapReason('');
    setShowSwapDialog(true);
  };

  const handleSubmitSwapRequest = async () => {
    if (!user?.employeeId || !swapDialogShift || !swapWithInput.trim()) {
      setStatusMsg({ kind: 'error', text: 'Please enter a colleague employee ID.' });
      return;
    }
    if (swapWithInput.trim() === user.employeeId) {
      setStatusMsg({ kind: 'error', text: 'You cannot swap with yourself.' });
      return;
    }
    setSubmitting(true);
    setStatusMsg(null);
    try {
      await ShiftSwapService.requestSwap({
        fromEmployeeId: user.employeeId,
        swapWithId: swapWithInput.trim(),
        requestorShiftId: swapDialogShift.shiftId,
        swapWithShiftId: swapDialogShift.shiftId,
        requestorDate: swapDialogShift.date,
        swapWithDate: swapDialogShift.date,
        reason: swapReason.trim() || 'Shift swap request',
      });
      setShowSwapDialog(false);
      setSwapDialogShift(null);
      await fetchAllData();
      setStatusMsg({ kind: 'success', text: 'Swap request submitted.' });
    } catch (error: any) {
      setStatusMsg({ kind: 'error', text: error?.message || 'Failed to request swap.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSwap = async (swapId: string) => {
    if (!user?.employeeId) {
      setStatusMsg({ kind: 'error', text: 'Session not loaded.' });
      return;
    }
    setStatusMsg(null);
    try {
      await ShiftSwapService.cancelSwap(swapId, user.employeeId);
      await fetchAllData();
      setStatusMsg({ kind: 'success', text: 'Swap request cancelled.' });
    } catch (error: any) {
      setStatusMsg({ kind: 'error', text: error?.message || 'Failed to cancel swap.' });
    }
  };

  const handleAcceptSwap = async (marketplaceId: string) => {
    if (!user?.employeeId) {
      setStatusMsg({ kind: 'error', text: 'Your session is still loading. Please retry.' });
      return;
    }
    setLoading(true);
    setStatusMsg(null);
    try {
      await ShiftSwapService.acceptSwap(marketplaceId, user.employeeId);
      await fetchAllData();
      setStatusMsg({ kind: 'success', text: 'Swap accepted.' });
    } catch (error: any) {
      setStatusMsg({ kind: 'error', text: error?.message || 'Failed to accept swap.' });
    } finally {
      setLoading(false);
    }
  };

  const activeSwaps = swapRequests.outgoing.filter(
    (s) => s.status === 'PENDING' || s.status === 'APPROVED_BY_PEER'
  );
  const historySwaps = swapRequests.outgoing.filter(
    (s) => s.status === 'COMPLETED' || s.status === 'REJECTED' || s.status === 'CANCELLED'
  );

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="space-y-4 pb-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-silver-mist" aria-label="Breadcrumb">
        <Link href="/dashboard/attendance" className="hover:text-indigo-500 transition-colors">
          Attendance
        </Link>
        <span>/</span>
        <Link
          href="/dashboard/attendance/shift-management"
          className="hover:text-indigo-500 transition-colors"
        >
          {t('shiftManagement.title')}
        </Link>
        <span>/</span>
        <span className="text-ink-black dark:text-pearl font-medium">
          {t('shiftManagement.tabs.swaps')}
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <ArrowRightLeft className="w-6 h-6 text-celestial-indigo" />
            {t('shiftManagement.tabs.swaps')}
          </h1>
          <p className="text-silver-mist text-sm">
            Trade shifts with colleagues to manage your schedule flexibility.
          </p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {['My Shifts', 'Marketplace'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${
                activeTab === tab
                  ? 'bg-white dark:bg-stellar-blue text-celestial-indigo shadow-sm'
                  : 'text-slate-500 hover:text-ink-black dark:hover:text-pearl'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {statusMsg && (
        <div
          className={`rounded-lg border px-4 py-2 text-sm ${
            statusMsg.kind === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-200'
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      {activeTab === 'My Shifts' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Swap Requests Status Section */}
          {(swapRequests.outgoing.length > 0 || swapRequests.incoming.length > 0) && (
            <div className="space-y-3">
              {/* Outgoing - My Swap Requests */}
              {activeSwaps.length > 0 && (
                <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Send className="w-4 h-4 text-celestial-indigo" />
                    <h3 className="font-bold text-sm text-ink-black dark:text-pearl">
                      My Swap Requests
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {activeSwaps.map((swap) => {
                      const sc = STATUS_CONFIG[swap.status] || STATUS_CONFIG.PENDING;
                      return (
                        <div
                          key={swap.id}
                          className="flex items-center justify-between bg-slate-50 dark:bg-deep-cosmos/30 rounded-xl px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-silver-mist" />
                            <div>
                              <div className="text-sm font-medium text-ink-black dark:text-pearl">
                                Swap on {new Date(swap.requestorDate).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-silver-mist">
                                {swap.swapWithName ? `with ${swap.swapWithName}` : 'Awaiting peer'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${sc.bg} ${sc.text}`}
                            >
                              {sc.label}
                            </span>
                            {swap.status === 'PENDING' && (
                              <button
                                onClick={() => handleCancelSwap(swap.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                                title="Cancel swap request"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Incoming - Swap Requests For Me */}
              {swapRequests.incoming.filter((s) => s.status === 'PENDING').length > 0 && (
                <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Inbox className="w-4 h-4 text-amber-500" />
                    <h3 className="font-bold text-sm text-ink-black dark:text-pearl">
                      Swap Requests for Me
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {swapRequests.incoming
                      .filter((s) => s.status === 'PENDING')
                      .map((swap) => (
                        <div
                          key={swap.id}
                          className="flex items-center justify-between bg-slate-50 dark:bg-deep-cosmos/30 rounded-xl px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-celestial-indigo" />
                            <div>
                              <div className="text-sm font-medium text-ink-black dark:text-pearl">
                                {swap.requestorName || 'A colleague'} wants to swap
                              </div>
                              <div className="text-xs text-silver-mist">
                                {new Date(swap.requestorDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-600">
                              Pending
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Assigned Shifts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {loading ? (
              <div className="col-span-full p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2 text-slate-500">Loading shifts...</p>
              </div>
            ) : myShifts.length === 0 ? (
              <div className="col-span-full p-8 text-center text-slate-400">No shifts assigned</div>
            ) : (
              shiftsWithStatus.map((shift) => (
                <div
                  key={shift.id}
                  className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm relative group"
                >
                  {shift.status === 'Swap Requested' && (
                    <div className="absolute top-4 right-4 bg-amber-100 dark:bg-amber-900/20 text-amber-600 text-[10px] font-bold uppercase px-2 py-1 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Pending
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`p-3 rounded-xl ${
                        shift.type === 'Morning'
                          ? 'bg-orange-100 text-orange-600'
                          : shift.type === 'Evening'
                            ? 'bg-indigo-100 text-indigo-600'
                            : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-ink-black dark:text-pearl">
                        {shift.type} Shift
                      </div>
                      <div className="text-xs text-silver-mist">{shift.date}</div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <Clock className="w-4 h-4 text-silver-mist" />
                      {shift.time}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <MapPin className="w-4 h-4 text-silver-mist" />
                      {shift.location}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRequestSwap(shift)}
                    disabled={shift.status !== 'Scheduled' || loading}
                    className={`w-full py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 ${
                      shift.status === 'Scheduled'
                        ? 'border border-celestial-indigo text-celestial-indigo hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    {shift.status === 'Scheduled' ? 'Request Swap' : 'Swap Pending'}
                  </button>
                </div>
              ))
            )}

            {/* View Full Roster */}
            {!loading && (
              <Link
                href="/dashboard/attendance/roster-assignment"
                className="border-2 border-dashed border-cloud dark:border-nebula-purple/30 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-400 hover:border-celestial-indigo/50 hover:bg-slate-50 dark:hover:bg-deep-cosmos/30 hover:text-celestial-indigo transition-all cursor-pointer"
              >
                <Calendar className="w-8 h-8 mb-2 opacity-50" />
                <div className="font-bold text-sm">View Full Roster</div>
              </Link>
            )}
          </div>

          {/* Swap History */}
          {historySwaps.length > 0 && (
            <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-silver-mist" />
                <h3 className="font-bold text-sm text-ink-black dark:text-pearl">Swap History</h3>
              </div>
              <div className="space-y-2">
                {historySwaps.slice(0, 5).map((swap) => {
                  const sc = STATUS_CONFIG[swap.status] || STATUS_CONFIG.CANCELLED;
                  return (
                    <div
                      key={swap.id}
                      className="flex items-center justify-between bg-slate-50 dark:bg-deep-cosmos/30 rounded-xl px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <Repeat className="w-4 h-4 text-silver-mist" />
                        <div>
                          <div className="text-sm text-ink-black dark:text-pearl">
                            {new Date(swap.requestorDate).toLocaleDateString()}
                            {swap.swapWithName ? ` → ${swap.swapWithName}` : ''}
                          </div>
                          <div className="text-xs text-silver-mist">{swap.reason}</div>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${sc.bg} ${sc.text}`}
                      >
                        {sc.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'Marketplace' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Filters */}
          <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
            {[
              { key: 'all' as const, label: 'All Shifts' },
              { key: 'Morning' as const, label: 'Morning Only' },
              { key: 'Evening' as const, label: 'Evening Only' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setMarketplaceFilter(f.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  marketplaceFilter === f.key
                    ? 'bg-celestial-indigo text-white'
                    : 'bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2 text-slate-500">Loading marketplace...</p>
              </div>
            ) : marketplace.filter(
                (item) => marketplaceFilter === 'all' || item.type === marketplaceFilter
              ).length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                {marketplace.length === 0
                  ? 'No shifts available in the marketplace'
                  : 'No shifts match the selected filter'}
              </div>
            ) : (
              marketplace
                .filter((item) => marketplaceFilter === 'all' || item.type === marketplaceFilter)
                .map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex flex-col md:flex-row items-center gap-3 group hover:border-celestial-indigo/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`w-12 h-12 rounded-full ${item.offeredBy.avatar} flex items-center justify-center text-white font-bold text-lg shadow-md`}
                      >
                        {item.offeredBy.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-ink-black dark:text-pearl">
                            {item.offeredBy.name}
                          </h3>
                          <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                            {item.offeredBy.role}
                          </span>
                        </div>
                        <div className="text-sm text-silver-mist mt-1">
                          is offering a{' '}
                          <span className="font-bold text-celestial-indigo">{item.type} Shift</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 border-l border-r border-cloud dark:border-nebula-purple/20 px-0 md:px-6 w-full md:w-auto flex flex-col gap-2">
                      <div className="flex items-center gap-3 text-sm text-ink-black dark:text-pearl font-medium">
                        <Calendar className="w-4 h-4 text-celestial-indigo" />
                        {item.date}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-ink-black dark:text-pearl font-medium">
                        <Clock className="w-4 h-4 text-celestial-indigo" />
                        {item.time}
                      </div>
                    </div>

                    <div className="w-full md:w-auto flex flex-col items-end gap-2">
                      <div className="text-xs text-rose-500 font-medium italic mb-1">
                        &ldquo;{item.reason}&rdquo;
                      </div>
                      <button
                        onClick={() => handleAcceptSwap(item.id)}
                        disabled={loading}
                        className="px-6 py-2.5 bg-celestial-indigo text-white rounded-xl text-sm font-bold shadow-lg shadow-celestial-indigo/20 hover:scale-105 transition-transform w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Accept Swap
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}
      {/* Request Swap Dialog */}
      {showSwapDialog && swapDialogShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-stellar-blue rounded-2xl shadow-2xl border border-cloud dark:border-nebula-purple/50 w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-ink-black dark:text-pearl">
                Request Shift Swap
              </h3>
              <button
                onClick={() => setShowSwapDialog(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-ink-black hover:bg-slate-100 dark:hover:text-pearl dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-deep-cosmos/30 rounded-xl p-3">
                <div className="text-xs text-silver-mist mb-1">Your Shift</div>
                <div className="font-medium text-ink-black dark:text-pearl">
                  {swapDialogShift.type} Shift — {swapDialogShift.date}
                </div>
                <div className="text-sm text-silver-mist">{swapDialogShift.time}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-1.5">
                  Colleague Employee ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={swapWithInput}
                  onChange={(e) => setSwapWithInput(e.target.value)}
                  placeholder="e.g. EMP-0042"
                  className="w-full px-3 py-2.5 rounded-xl border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-deep-cosmos text-ink-black dark:text-pearl text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 focus:border-celestial-indigo"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-1.5">
                  Reason
                </label>
                <textarea
                  value={swapReason}
                  onChange={(e) => setSwapReason(e.target.value)}
                  placeholder="Why do you want to swap this shift?"
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-deep-cosmos text-ink-black dark:text-pearl text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 focus:border-celestial-indigo resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowSwapDialog(false)}
                  className="flex-1 py-2.5 rounded-xl border border-cloud dark:border-nebula-purple/50 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitSwapRequest}
                  disabled={submitting || !swapWithInput.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-celestial-indigo text-white text-sm font-bold hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <ArrowRightLeft className="w-4 h-4" />
                      Submit Request
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
