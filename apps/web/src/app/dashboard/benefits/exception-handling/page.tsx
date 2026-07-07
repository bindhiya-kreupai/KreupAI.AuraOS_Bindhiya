'use client';

import React, { useState, useEffect } from 'react';
import { Gavel, Check, X, MessageSquare, Loader2 } from 'lucide-react';
import { QualifyingEventService } from '../services';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

type ModalMode = 'reject' | 'message';

export default function ExceptionHandlingPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [modalEvent, setModalEvent] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toasts, removeToast, success, error: toastError } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await QualifyingEventService.getEvents();
      setEvents(response.data || []);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActioningId(id);
    try {
      const response = await QualifyingEventService.reviewEvent(id, 'approve');
      if (response.success) {
        success('Event approved successfully.');
        await fetchEvents();
      } else {
        toastError('Failed to approve event.');
      }
    } catch (err: any) {
      console.error('Error approving event:', err);
      toastError('Failed to approve event.');
    } finally {
      setActioningId(null);
    }
  };

  const openModal = (mode: ModalMode, req: any) => {
    setModalMode(mode);
    setModalEvent(req);
    setNotes('');
  };

  const closeModal = () => {
    setModalMode(null);
    setModalEvent(null);
    setNotes('');
  };

  const handleModalSubmit = async () => {
    if (!modalEvent || !modalMode) return;
    const action = modalMode === 'reject' ? 'reject' : 'message';
    setSubmitting(true);
    try {
      const response = await QualifyingEventService.reviewEvent(
        modalEvent.id,
        action,
        notes.trim() || undefined
      );
      if (response.success) {
        success(
          action === 'reject' ? 'Event rejected successfully.' : 'Message saved successfully.'
        );
        closeModal();
        await fetchEvents();
      } else {
        toastError(action === 'reject' ? 'Failed to reject event.' : 'Failed to save message.');
      }
    } catch (err: any) {
      console.error('Error submitting review:', err);
      toastError('Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  const getUser = (req: any) => req.user || req.employeeName || 'Unknown';
  const getType = (req: any) => {
    const t = req.type || req.eventType || 'Unknown';
    return t.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
  };
  const getReason = (req: any) => req.reason || req.description || 'No reason provided';
  const getStatus = (req: any) => {
    const s = req.status || 'pending';
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  };
  const getId = (req: any) => (req.id ? req.id.substring(0, 8) : 'N/A');
  const getDate = (req: any) => {
    const d = req.date || req.reportedDate || req.createdAt;
    if (!d) return 'Unknown';
    const date = new Date(d);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gavel className="w-6 h-6 text-indigo-500" />
            Exception Requests
          </h1>
          <p className="text-slate-500 text-sm">
            Review appeals for late enrollment or special coverage.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 overflow-y-auto pb-20">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <Gavel className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="font-bold text-lg text-slate-600 dark:text-slate-300">
              No Exception Requests
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mt-1">
              There are no qualifying events or exception requests to review at this time.
            </p>
          </div>
        ) : (
          events.map((req, i) => {
            const status = getStatus(req);
            const isActioning = actioningId === req.id;

            return (
              <div
                key={req.id || i}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row gap-3"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                    {getUser(req).charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{getType(req)}</h3>
                      <span className="text-xs text-slate-400">&#8226; {getId(req)}</span>
                    </div>
                    <div className="text-sm font-bold text-indigo-600 mb-2">{getUser(req)}</div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700 italic">
                      &quot;{getReason(req)}&quot;
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-between items-end border-l border-slate-100 dark:border-slate-800 pl-6 min-w-[150px]">
                  <span className="text-xs text-slate-400 font-bold">{getDate(req)}</span>

                  {status === 'Pending' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(req.id)}
                        disabled={isActioning}
                        className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 border border-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Approve"
                      >
                        {isActioning ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Check className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => openModal('reject', req)}
                        disabled={isActioning}
                        className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 border border-rose-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Reject"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openModal('message', req)}
                        disabled={isActioning}
                        className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Message"
                      >
                        <MessageSquare className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                                        ${
                                          status === 'Approved' || status === 'Verified'
                                            ? 'bg-emerald-100 text-emerald-600'
                                            : status === 'Rejected' ||
                                                status === 'Denied' ||
                                                status === 'Expired'
                                              ? 'bg-rose-100 text-rose-600'
                                              : 'bg-amber-100 text-amber-600'
                                        }`}
                    >
                      {status}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reject / Message Modal */}
      {modalMode && modalEvent ? (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">
                {modalMode === 'reject' ? 'Reject Exception Request' : 'Send Message'}
              </h3>
              <button
                onClick={closeModal}
                disabled={submitting}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-50"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-500 mb-3">
              {modalMode === 'reject'
                ? 'Optionally provide a reason for rejecting this request.'
                : 'Send a note regarding this qualifying event.'}
            </p>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder={modalMode === 'reject' ? 'Reason (optional)…' : 'Your message…'}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={closeModal}
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                disabled={submitting || (modalMode === 'message' && !notes.trim())}
                className={`px-4 py-2 rounded-lg text-sm font-bold text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed
                                    ${modalMode === 'reject' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {modalMode === 'reject' ? 'Reject' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
