/**
 * @module ActionItems
 * @description Action items tracker for one-on-one meetings with priority and status
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { MeetingActionItem, ActionStatus, Priority } from '@/services/oneOnOneService';
import { PRIORITY_COLORS } from '@/services/oneOnOneService';

interface ActionItemsProps {
  items: MeetingActionItem[];
  meetingId: string;
  onAdd: (
    meetingId: string,
    item: Omit<MeetingActionItem, 'id' | 'meetingId' | 'completedAt'>
  ) => void;
  onUpdate: (meetingId: string, itemId: string, updates: Partial<MeetingActionItem>) => void;
  readonly?: boolean;
}

const STATUS_CONFIG: Record<ActionStatus, { icon: LucideIcon; label: string; color: string }> = {
  pending: { icon: Circle, label: 'Pending', color: 'text-silver-mist' },
  in_progress: { icon: Clock, label: 'In Progress', color: 'text-celestial-indigo' },
  completed: { icon: CheckCircle2, label: 'Completed', color: 'text-neural-mint' },
};

const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const ActionItems: React.FC<ActionItemsProps> = ({
  items,
  meetingId,
  onAdd,
  onUpdate,
  readonly = false,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    description: '',
    assignedTo: '',
    assignedToName: '',
    dueDate: '',
    priority: 'medium' as Priority,
    status: 'pending' as ActionStatus,
  });

  const handleAdd = useCallback(() => {
    if (!newItem.description.trim() || !newItem.assignedToName.trim() || !newItem.dueDate) return;
    onAdd(meetingId, {
      description: newItem.description.trim(),
      assignedTo: newItem.assignedTo || `emp-${Date.now()}`,
      assignedToName: newItem.assignedToName.trim(),
      dueDate: newItem.dueDate,
      priority: newItem.priority,
      status: 'pending',
    });
    setNewItem({
      description: '',
      assignedTo: '',
      assignedToName: '',
      dueDate: '',
      priority: 'medium',
      status: 'pending',
    });
    setShowAddForm(false);
  }, [newItem, meetingId, onAdd]);

  const cycleStatus = useCallback(
    (item: MeetingActionItem) => {
      if (readonly) return;
      const order: ActionStatus[] = ['pending', 'in_progress', 'completed'];
      const nextIdx = (order.indexOf(item.status) + 1) % order.length;
      onUpdate(meetingId, item.id, { status: order[nextIdx] });
    },
    [readonly, meetingId, onUpdate]
  );

  const pendingCount = items.filter((i) => i.status === 'pending').length;
  const inProgressCount = items.filter((i) => i.status === 'in_progress').length;
  const completedCount = items.filter((i) => i.status === 'completed').length;

  const isOverdue = (dueDate: string, status: ActionStatus) => {
    if (status === 'completed') return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-3">
      {/* Summary bar */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-ink-black dark:text-pearl flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-neural-mint" />
          Action Items ({items.length})
        </h4>
        <div className="flex items-center gap-2 text-[10px]">
          {pendingCount > 0 && (
            <span className="flex items-center gap-1 text-silver-mist">
              <Circle className="w-2.5 h-2.5" /> {pendingCount}
            </span>
          )}
          {inProgressCount > 0 && (
            <span className="flex items-center gap-1 text-celestial-indigo">
              <Clock className="w-2.5 h-2.5" /> {inProgressCount}
            </span>
          )}
          {completedCount > 0 && (
            <span className="flex items-center gap-1 text-neural-mint">
              <CheckCircle2 className="w-2.5 h-2.5" /> {completedCount}
            </span>
          )}
        </div>
      </div>

      {/* Items list */}
      <div className="space-y-1.5">
        {items.map((item) => {
          const config = STATUS_CONFIG[item.status];
          const StatusIcon = config.icon;
          const overdue = isOverdue(item.dueDate, item.status);
          const isExpanded = expandedId === item.id;

          return (
            <div
              key={item.id}
              className={`rounded-xl border transition-colors ${
                item.status === 'completed'
                  ? 'border-neural-mint/20 bg-neural-mint/5 dark:bg-neural-mint/5'
                  : overdue
                    ? 'border-coral-alert/30 bg-coral-alert/5 dark:bg-coral-alert/5'
                    : 'border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue'
              }`}
            >
              <div className="flex items-start gap-2.5 p-3">
                <button
                  onClick={() => cycleStatus(item)}
                  disabled={readonly}
                  className={`mt-0.5 shrink-0 transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer hover:opacity-70'}`}
                  title={`Status: ${config.label}. Click to cycle.`}
                >
                  <StatusIcon className={`w-4 h-4 ${config.color}`} />
                </button>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs ${item.status === 'completed' ? 'text-silver-mist line-through' : 'text-ink-black dark:text-pearl'}`}
                  >
                    {item.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="flex items-center gap-0.5 text-[9px] text-silver-mist">
                      <User className="w-2.5 h-2.5" /> {item.assignedToName}
                    </span>
                    <span
                      className={`flex items-center gap-0.5 text-[9px] ${overdue ? 'text-coral-alert font-semibold' : 'text-silver-mist'}`}
                    >
                      <Calendar className="w-2.5 h-2.5" />
                      {new Date(item.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                      {overdue && ' (overdue)'}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${PRIORITY_COLORS[item.priority]}`}
                    >
                      {PRIORITY_LABELS[item.priority]}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="p-0.5 rounded hover:bg-pearl dark:hover:bg-deep-cosmos shrink-0"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3 text-silver-mist" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-silver-mist" />
                  )}
                </button>
              </div>

              {/* Expanded details */}
              {isExpanded && !readonly && (
                <div className="px-3 pb-3 pl-9 space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-silver-mist w-14">Status:</label>
                    <div className="flex items-center gap-1">
                      {(['pending', 'in_progress', 'completed'] as ActionStatus[]).map((s) => {
                        const sc = STATUS_CONFIG[s];
                        return (
                          <button
                            key={s}
                            onClick={() => onUpdate(meetingId, item.id, { status: s })}
                            className={`text-[9px] px-2 py-0.5 rounded-full border transition-colors ${
                              item.status === s
                                ? 'border-celestial-indigo bg-celestial-indigo/10 text-celestial-indigo'
                                : 'border-cloud dark:border-nebula-purple/30 text-silver-mist hover:border-celestial-indigo/40'
                            }`}
                          >
                            {sc.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-silver-mist w-14">Priority:</label>
                    <div className="flex items-center gap-1">
                      {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                        <button
                          key={p}
                          onClick={() => onUpdate(meetingId, item.id, { priority: p })}
                          className={`text-[9px] px-2 py-0.5 rounded-full border transition-colors ${
                            item.priority === p
                              ? `border-current ${PRIORITY_COLORS[p]}`
                              : 'border-cloud dark:border-nebula-purple/30 text-silver-mist hover:border-celestial-indigo/40'
                          }`}
                        >
                          {PRIORITY_LABELS[p]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-silver-mist w-14">Due:</label>
                    <input
                      type="date"
                      value={item.dueDate}
                      onChange={(e) => onUpdate(meetingId, item.id, { dueDate: e.target.value })}
                      className="px-2 py-0.5 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-[10px] text-ink-black dark:text-pearl outline-none"
                    />
                  </div>
                  {item.completedAt && (
                    <p className="text-[9px] text-neural-mint pl-14">
                      Completed{' '}
                      {new Date(item.completedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {items.length === 0 && (
          <p className="text-[11px] text-silver-mist text-center py-4 italic">
            No action items yet.
          </p>
        )}
      </div>

      {/* Add new action item */}
      {!readonly && (
        <>
          {showAddForm ? (
            <div className="rounded-xl border border-celestial-indigo/30 bg-celestial-indigo/5 dark:bg-celestial-indigo/5 p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <h5 className="text-[11px] font-bold text-ink-black dark:text-pearl">
                  New Action Item
                </h5>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-0.5 rounded hover:bg-pearl dark:hover:bg-deep-cosmos"
                >
                  <X className="w-3 h-3 text-silver-mist" />
                </button>
              </div>
              <input
                type="text"
                value={newItem.description}
                onChange={(e) => setNewItem((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Action item description..."
                className="w-full px-2.5 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newItem.assignedToName}
                  onChange={(e) =>
                    setNewItem((prev) => ({ ...prev, assignedToName: e.target.value }))
                  }
                  placeholder="Assigned to..."
                  className="px-2.5 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
                />
                <input
                  type="date"
                  value={newItem.dueDate}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, dueDate: e.target.value }))}
                  className="px-2.5 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-silver-mist">Priority:</span>
                {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setNewItem((prev) => ({ ...prev, priority: p }))}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                      newItem.priority === p
                        ? `border-current ${PRIORITY_COLORS[p]}`
                        : 'border-cloud dark:border-nebula-purple/30 text-silver-mist'
                    }`}
                  >
                    {PRIORITY_LABELS[p]}
                  </button>
                ))}
              </div>
              <button
                onClick={handleAdd}
                disabled={
                  !newItem.description.trim() || !newItem.assignedToName.trim() || !newItem.dueDate
                }
                className="w-full flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-celestial-indigo text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                <Plus className="w-3 h-3" /> Add Action Item
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1 text-[11px] text-celestial-indigo hover:text-celestial-indigo/80 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add action item
            </button>
          )}
        </>
      )}

      {/* Overdue warning */}
      {items.some((i) => isOverdue(i.dueDate, i.status)) && (
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-coral-alert/10 border border-coral-alert/20">
          <AlertTriangle className="w-3.5 h-3.5 text-coral-alert shrink-0" />
          <p className="text-[10px] text-coral-alert font-medium">
            {items.filter((i) => isOverdue(i.dueDate, i.status)).length} action item(s) overdue
          </p>
        </div>
      )}
    </div>
  );
};

export default ActionItems;
