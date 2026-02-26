/**
 * @module TicketDetail
 * @description IT ticket detail view — header, conversation thread, comment form,
 *              status actions, assigned agent info, activity timeline (Sec 17.3)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  CheckCircle,
  RotateCcw,
  TrendingUp,
  User,
  Bot,
  Send,
  Paperclip,
  ChevronLeft,
  AlertCircle,
  History,
} from 'lucide-react';
import {
  HelpdeskService,
  TICKET_STATUS_META,
  TICKET_PRIORITY_SLA,
  type SupportTicket,
  type TicketStatus,
} from '@/services/helpdeskService';

// ── SLA Timer ─────────────────────────────────────────────────────────────────

function SLABadge({ deadline, status }: { deadline: string; status: TicketStatus }) {
  const now = Date.now();
  const end = new Date(deadline).getTime();
  const diff = end - now;
  const isResolved = ['resolved', 'closed'].includes(status);

  if (isResolved) return <span className="text-xs text-gray-400">SLA met</span>;

  const h = Math.floor(Math.abs(diff) / 3600000);
  const m = Math.floor((Math.abs(diff) % 3600000) / 60000);
  const isBreached = diff < 0;
  const isWarning = diff > 0 && diff < 2 * 3600000;

  return (
    <span
      className={`text-xs font-medium flex items-center gap-1 px-2 py-1 rounded-full ${
        isBreached
          ? 'bg-red-50 text-red-600'
          : isWarning
            ? 'bg-amber-50 text-amber-600'
            : 'bg-gray-50 text-gray-600'
      }`}
    >
      <Clock className="w-3 h-3" />
      {isBreached ? 'Breached' : `${h}h ${m}m left`}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface TicketDetailProps {
  ticketId: string;
  onBack?: () => void;
}

export function TicketDetail({ ticketId, onBack }: TicketDetailProps) {
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [resolution, setResolution] = useState('');
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [showReopenForm, setShowReopenForm] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [activeTab, setActiveTab] = useState<'conversation' | 'timeline'>('conversation');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const t = await HelpdeskService.getTicket(ticketId);
      setTicket(t);
      setLoading(false);
    };
    load();
  }, [ticketId]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.comments]);

  const handleSendComment = async () => {
    if (!newMessage.trim() || !ticket) return;
    setSending(true);
    const updated = await HelpdeskService.addComment(ticket.id, newMessage.trim());
    setTicket(updated);
    setNewMessage('');
    setSending(false);
  };

  const handleResolve = async () => {
    if (!ticket || !resolution.trim()) return;
    const updated = await HelpdeskService.resolveTicket(ticket.id, resolution.trim());
    setTicket(updated);
    setShowResolveForm(false);
    setResolution('');
  };

  const handleReopen = async () => {
    if (!ticket || !reopenReason.trim()) return;
    const updated = await HelpdeskService.reopenTicket(ticket.id, reopenReason.trim());
    setTicket(updated);
    setShowReopenForm(false);
    setReopenReason('');
  };

  if (loading || !ticket) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  const statusMeta = TICKET_STATUS_META[ticket.status];
  const priorityMeta = TICKET_PRIORITY_SLA[ticket.priority];
  const canResolve = ['open', 'in_progress', 'pending_user', 'reopened'].includes(ticket.status);
  const canReopen = ['resolved', 'closed'].includes(ticket.status);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        {onBack && (
          <button onClick={onBack} className="flex items-center gap-1 text-sm text-indigo-600 mb-3">
            <ChevronLeft className="w-4 h-4" />
            Back to Helpdesk
          </button>
        )}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400 font-mono">{ticket.ticketNumber}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusMeta.bgColor} ${statusMeta.color}`}
              >
                {statusMeta.label}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityMeta.bgColor} ${priorityMeta.color}`}
              >
                {priorityMeta.label}
              </span>
            </div>
            <h1 className="text-lg font-bold text-gray-900 mt-1 leading-tight">{ticket.subject}</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Created {new Date(ticket.createdAt).toLocaleDateString()} ·{' '}
              {ticket.assignedAgentName ? `Assigned to ${ticket.assignedAgentName}` : 'Unassigned'}
            </p>
          </div>
          <SLABadge deadline={ticket.slaDeadline} status={ticket.status} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-3">
          {(['conversation', 'timeline'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {tab === 'conversation' ? 'Conversation' : 'Timeline'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'conversation' && (
          <>
            {/* Original description */}
            <div className="bg-white rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-semibold text-sm text-gray-800">{ticket.employeeName}</span>
                <span className="text-xs text-gray-400">
                  {new Date(ticket.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{ticket.description}</p>
            </div>

            {/* Comments Thread */}
            {ticket.comments.map((comment) => {
              const isAgent = comment.authorRole === 'agent';
              return (
                <div
                  key={comment.id}
                  className={`flex ${isAgent ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 ${isAgent ? 'bg-white' : 'bg-indigo-600 text-white'}`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      {isAgent ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-3 h-3 text-emerald-600" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-indigo-300 flex items-center justify-center flex-shrink-0">
                          <User className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <span
                        className={`text-xs font-semibold ${isAgent ? 'text-gray-700' : 'text-indigo-100'}`}
                      >
                        {comment.authorName}
                      </span>
                      <span className={`text-xs ${isAgent ? 'text-gray-400' : 'text-indigo-200'}`}>
                        {new Date(comment.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p
                      className={`text-sm leading-relaxed ${isAgent ? 'text-gray-700' : 'text-white'}`}
                    >
                      {comment.message}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Resolution if resolved */}
            {ticket.resolution && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="font-semibold text-sm text-emerald-700">Ticket Resolved</span>
                </div>
                <p className="text-sm text-emerald-700">{ticket.resolution}</p>
              </div>
            )}

            <div ref={chatBottomRef} />
          </>
        )}

        {activeTab === 'timeline' && (
          <div className="bg-white rounded-2xl p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-500" />
              Activity Log
            </h3>
            <div className="relative pl-5 space-y-4">
              <div className="absolute left-2 top-2 bottom-0 w-0.5 bg-gray-100" />
              {ticket.activityLog.map((log) => (
                <div key={log.id} className="relative">
                  <div className="absolute -left-3 w-3 h-3 rounded-full bg-indigo-200 border-2 border-white" />
                  <p className="text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-700 mt-0.5">
                    <span className="font-medium">{log.actorName}:</span> {log.description}
                    {log.toValue && (
                      <span className="text-indigo-600 font-medium"> → {log.toValue}</span>
                    )}
                  </p>
                </div>
              ))}
              {ticket.activityLog.length === 0 && (
                <p className="text-sm text-gray-400">No activity recorded yet.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions Bar */}
      <div className="bg-white border-t border-gray-100 p-4 space-y-3">
        {/* Status Actions */}
        <div className="flex gap-2">
          {canResolve && (
            <button
              onClick={() => setShowResolveForm(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold hover:bg-emerald-100 transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Resolve
            </button>
          )}
          {canReopen && (
            <button
              onClick={() => setShowReopenForm(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-700 rounded-xl text-xs font-semibold hover:bg-amber-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reopen
            </button>
          )}
          {canResolve && (
            <button className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors">
              <TrendingUp className="w-3.5 h-3.5" />
              Escalate
            </button>
          )}
        </div>

        {/* Comment Input */}
        {canResolve && (
          <div className="flex gap-2">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendComment()}
              placeholder="Add a comment..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-400">
              <Paperclip className="w-4 h-4" />
            </button>
            <button
              onClick={handleSendComment}
              disabled={!newMessage.trim() || sending}
              className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Resolve Modal */}
      {showResolveForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 p-4">
          <div className="bg-white rounded-2xl w-full p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <h3 className="font-semibold text-gray-900">Resolve Ticket</h3>
            </div>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Describe the resolution..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300 mb-3"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowResolveForm(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={!resolution.trim()}
                className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold disabled:opacity-40"
              >
                Resolve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reopen Modal */}
      {showReopenForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 p-4">
          <div className="bg-white rounded-2xl w-full p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-gray-900">Reopen Ticket</h3>
            </div>
            <textarea
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="Why is the issue not resolved?"
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-300 mb-3"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowReopenForm(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReopen}
                disabled={!reopenReason.trim()}
                className="flex-1 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-semibold disabled:opacity-40"
              >
                Reopen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TicketDetail;
