/**
 * @module ApprovalHistory
 * @description Past approval decisions with timeline and filtering
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  History,
  Check,
  X,
  ArrowUpRight,
  Calendar,
  Search,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ApprovalRequest, ApprovalType } from '@/services/approvalService';
import { APPROVAL_TYPE_CONFIG, STATUS_CONFIG } from '@/services/approvalService';

interface ApprovalHistoryProps {
  requests: ApprovalRequest[];
}

const ACTION_ICONS: Record<string, { icon: LucideIcon; color: string }> = {
  approved: { icon: Check, color: 'text-neural-mint' },
  rejected: { icon: X, color: 'text-coral-alert' },
  escalated: { icon: ArrowUpRight, color: 'text-nebula-purple' },
  submitted: { icon: Calendar, color: 'text-celestial-indigo' },
  commented: { icon: MessageSquare, color: 'text-silver-mist' },
  withdrawn: { icon: X, color: 'text-silver-mist' },
};

export const ApprovalHistory: React.FC<ApprovalHistoryProps> = ({ requests }) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ApprovalType | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = requests
      .filter((r) => r.status !== 'pending')
      .sort((a, b) => {
        const aDate = a.history[a.history.length - 1]?.date || a.requestDate;
        const bDate = b.history[b.history.length - 1]?.date || b.requestDate;
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      });

    if (typeFilter !== 'all') {
      result = result.filter((r) => r.type === typeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.requestedByName.toLowerCase().includes(q) ||
          r.requestedByDept.toLowerCase().includes(q)
      );
    }
    return result;
  }, [requests, typeFilter, search]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, ApprovalRequest[]> = {};
    filtered.forEach((r) => {
      const lastAction = r.history[r.history.length - 1];
      const dateKey = lastAction
        ? new Date(lastAction.date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })
        : new Date(r.requestDate).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(r);
    });
    return groups;
  }, [filtered]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <History className="w-4 h-4 text-nebula-purple" />
          Decision History ({filtered.length})
        </h3>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="w-3 h-3 text-silver-mist absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search history..."
            className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
          />
        </div>
        <div className="flex items-center gap-1">
          {(['all', 'leave', 'expense', 'timesheet', 'requisition', 'document'] as const).map(
            (t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`text-[10px] px-2 py-1 rounded-lg border transition-colors ${
                  typeFilter === t
                    ? 'border-celestial-indigo bg-celestial-indigo/10 text-celestial-indigo font-semibold'
                    : 'border-cloud dark:border-nebula-purple/30 text-silver-mist'
                }`}
              >
                {t === 'all' ? 'All' : APPROVAL_TYPE_CONFIG[t].label.split(' ')[0]}
              </button>
            )
          )}
        </div>
      </div>

      {/* Timeline */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-10">
          <History className="w-8 h-8 text-silver-mist/20 mx-auto mb-2" />
          <p className="text-xs text-silver-mist">No past decisions found.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([dateLabel, items]) => (
            <div key={dateLabel}>
              <h4 className="text-[10px] font-bold text-silver-mist uppercase tracking-wider mb-2 px-1">
                {dateLabel}
              </h4>
              <div className="space-y-1.5 relative">
                <div className="absolute left-[14px] top-3 bottom-3 w-px bg-cloud dark:bg-nebula-purple/20" />

                {items.map((req) => {
                  const isExpanded = expandedId === req.id;
                  const statusConfig = STATUS_CONFIG[req.status];
                  const typeConfig = APPROVAL_TYPE_CONFIG[req.type];
                  const lastAction = req.history[req.history.length - 1];
                  const actionConfig = lastAction
                    ? ACTION_ICONS[lastAction.action] || ACTION_ICONS.submitted
                    : ACTION_ICONS.submitted;
                  const ActionIcon = actionConfig.icon;

                  return (
                    <div key={req.id} className="relative pl-8">
                      {/* Timeline dot */}
                      <div
                        className={`absolute left-2 top-3 w-2.5 h-2.5 rounded-full border-2 ${
                          req.status === 'approved'
                            ? 'bg-neural-mint/20 border-neural-mint'
                            : req.status === 'rejected'
                              ? 'bg-coral-alert/20 border-coral-alert'
                              : 'bg-silver-mist/20 border-silver-mist'
                        }`}
                      />

                      <div
                        className={`rounded-xl border transition-colors ${
                          isExpanded
                            ? 'border-celestial-indigo/20'
                            : 'border-cloud dark:border-nebula-purple/20'
                        } bg-white dark:bg-stellar-blue`}
                      >
                        <div
                          className="flex items-center gap-3 p-2.5 cursor-pointer"
                          onClick={() => setExpandedId(isExpanded ? null : req.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[11px] font-semibold text-ink-black dark:text-pearl truncate">
                                {req.title}
                              </span>
                              <span
                                className={`text-[8px] px-1 py-0.5 rounded-full font-semibold ${typeConfig.color} ${typeConfig.bgColor}`}
                              >
                                {typeConfig.label.split(' ')[0]}
                              </span>
                              <span
                                className={`text-[8px] px-1 py-0.5 rounded-full font-semibold ${statusConfig.color} ${statusConfig.bgColor}`}
                              >
                                {statusConfig.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[9px] text-silver-mist">
                              <span>{req.requestedByName}</span>
                              <span>·</span>
                              <span>{req.requestedByDept}</span>
                              {lastAction && (
                                <>
                                  <span>·</span>
                                  <span className="flex items-center gap-0.5">
                                    <ActionIcon className={`w-2.5 h-2.5 ${actionConfig.color}`} />
                                    {lastAction.byName}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3 text-silver-mist shrink-0" />
                          ) : (
                            <ChevronDown className="w-3 h-3 text-silver-mist shrink-0" />
                          )}
                        </div>

                        {isExpanded && (
                          <div className="px-2.5 pb-2.5 border-t border-cloud/50 dark:border-nebula-purple/10 pt-2.5 space-y-2">
                            {/* Action history */}
                            <div className="space-y-1">
                              {req.history.map((h) => {
                                const hConfig = ACTION_ICONS[h.action] || ACTION_ICONS.submitted;
                                const HIcon = hConfig.icon;
                                return (
                                  <div key={h.id} className="flex items-start gap-2">
                                    <HIcon className={`w-3 h-3 mt-0.5 shrink-0 ${hConfig.color}`} />
                                    <div>
                                      <p className="text-[10px] text-ink-black dark:text-pearl">
                                        <span className="font-semibold">{h.byName}</span> {h.action}
                                        {h.level ? ` (Level ${h.level})` : ''}
                                      </p>
                                      {h.remarks && (
                                        <p className="text-[9px] text-silver-mist italic">
                                          {h.remarks}
                                        </p>
                                      )}
                                      <p className="text-[8px] text-silver-mist/60">
                                        {new Date(h.date).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          hour: 'numeric',
                                          minute: '2-digit',
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Comments */}
                            {req.comments.length > 0 && (
                              <div className="space-y-1">
                                {req.comments.map((c) => (
                                  <div
                                    key={c.id}
                                    className="px-2 py-1.5 rounded-lg bg-pearl/20 dark:bg-deep-cosmos/10 text-[10px]"
                                  >
                                    <span className="font-semibold text-ink-black dark:text-pearl">
                                      {c.byName}:
                                    </span>{' '}
                                    <span className="text-ink-black dark:text-pearl">{c.text}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApprovalHistory;
