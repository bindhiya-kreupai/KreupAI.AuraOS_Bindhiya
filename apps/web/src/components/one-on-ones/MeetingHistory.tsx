/**
 * @module MeetingHistory
 * @description Past meetings timeline with notes, action items, and sentiment
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  History,
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  CheckCircle2,
  Smile,
  Meh,
  Frown,
  Star,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { OneOnOneMeeting, MeetingType } from '@/services/oneOnOneService';
import { MEETING_TYPE_LABELS, MEETING_TYPE_COLORS } from '@/services/oneOnOneService';

interface MeetingHistoryProps {
  meetings: OneOnOneMeeting[];
  onSelect: (meeting: OneOnOneMeeting) => void;
}

const SENTIMENT_ICONS: Record<number, { icon: LucideIcon; label: string; color: string }> = {
  1: { icon: Frown, label: 'Difficult', color: 'text-coral-alert' },
  2: { icon: Frown, label: 'Below Average', color: 'text-sunset-amber' },
  3: { icon: Meh, label: 'Neutral', color: 'text-silver-mist' },
  4: { icon: Smile, label: 'Positive', color: 'text-celestial-indigo' },
  5: { icon: Star, label: 'Excellent', color: 'text-neural-mint' },
};

export const MeetingHistory: React.FC<MeetingHistoryProps> = ({ meetings, onSelect }) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<MeetingType | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = meetings;
    if (typeFilter !== 'all') {
      result = result.filter((m) => m.type === typeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.employeeName.toLowerCase().includes(q) ||
          m.notes.toLowerCase().includes(q) ||
          m.agendaItems.some((a) => a.text.toLowerCase().includes(q))
      );
    }
    return result;
  }, [meetings, typeFilter, search]);

  // Group by month
  const grouped = useMemo(() => {
    const groups: Record<string, OneOnOneMeeting[]> = {};
    filtered.forEach((m) => {
      const key = new Date(m.scheduledDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      });
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    });
    return groups;
  }, [filtered]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="space-y-4">
      {/* Header with search & filter */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <History className="w-4 h-4 text-nebula-purple" />
          Meeting History ({meetings.length})
        </h3>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="w-3 h-3 text-silver-mist absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search meetings..."
            className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
          />
        </div>
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as MeetingType | 'all')}
            className="appearance-none pl-7 pr-6 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
          >
            <option value="all">All Types</option>
            {(Object.keys(MEETING_TYPE_LABELS) as MeetingType[]).map((type) => (
              <option key={type} value={type}>
                {MEETING_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          <Filter className="w-3 h-3 text-silver-mist absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Timeline */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-8">
          <History className="w-8 h-8 text-silver-mist/30 mx-auto mb-2" />
          <p className="text-xs text-silver-mist">No completed meetings found.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([month, mtgs]) => (
            <div key={month}>
              <h4 className="text-[10px] font-bold text-silver-mist uppercase tracking-wider mb-2 px-1">
                {month}
              </h4>
              <div className="space-y-2 relative">
                {/* Timeline line */}
                <div className="absolute left-[18px] top-4 bottom-4 w-px bg-cloud dark:bg-nebula-purple/20" />

                {mtgs.map((meeting) => {
                  const isExpanded = expandedId === meeting.id;
                  const sentimentConfig = meeting.sentiment
                    ? SENTIMENT_ICONS[meeting.sentiment]
                    : null;
                  const SentimentIcon = sentimentConfig?.icon;
                  const discussedCount = meeting.agendaItems.filter((a) => a.isDiscussed).length;
                  const completedActions = meeting.actionItems.filter(
                    (a) => a.status === 'completed'
                  ).length;

                  return (
                    <div key={meeting.id} className="relative pl-10">
                      {/* Timeline dot */}
                      <div
                        className={`absolute left-3 top-4 w-3 h-3 rounded-full border-2 ${
                          meeting.status === 'cancelled'
                            ? 'bg-coral-alert/20 border-coral-alert'
                            : 'bg-neural-mint/20 border-neural-mint'
                        }`}
                      />

                      <div
                        className={`rounded-xl border transition-all cursor-pointer ${
                          isExpanded
                            ? 'border-celestial-indigo/30 bg-white dark:bg-stellar-blue shadow-sm'
                            : 'border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue hover:border-celestial-indigo/20'
                        }`}
                      >
                        {/* Summary row */}
                        <div
                          className="flex items-center gap-3 p-3"
                          onClick={() => setExpandedId(isExpanded ? null : meeting.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-semibold text-ink-black dark:text-pearl truncate">
                                {meeting.employeeName}
                              </span>
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${MEETING_TYPE_COLORS[meeting.type]}`}
                              >
                                {MEETING_TYPE_LABELS[meeting.type]}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-silver-mist">
                              <span className="flex items-center gap-0.5">
                                <Calendar className="w-2.5 h-2.5" />{' '}
                                {formatDate(meeting.scheduledDate)}
                              </span>
                              <span className="flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" />{' '}
                                {formatTime(meeting.scheduledDate)}
                              </span>
                              <span className="flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5" /> {meeting.location}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {SentimentIcon && (
                              <SentimentIcon className={`w-4 h-4 ${sentimentConfig.color}`} />
                            )}
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 text-silver-mist" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-silver-mist" />
                            )}
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="px-3 pb-3 space-y-3 border-t border-cloud/50 dark:border-nebula-purple/10 pt-3">
                            {/* Agenda items */}
                            {meeting.agendaItems.length > 0 && (
                              <div>
                                <h5 className="text-[10px] font-semibold text-silver-mist mb-1.5">
                                  Agenda ({discussedCount}/{meeting.agendaItems.length} discussed)
                                </h5>
                                <div className="space-y-1">
                                  {meeting.agendaItems.map((item) => (
                                    <div key={item.id} className="flex items-start gap-2 pl-1">
                                      {item.isDiscussed ? (
                                        <CheckCircle2 className="w-3 h-3 text-neural-mint mt-0.5 shrink-0" />
                                      ) : (
                                        <div className="w-3 h-3 rounded-full border border-silver-mist/40 mt-0.5 shrink-0" />
                                      )}
                                      <div>
                                        <p
                                          className={`text-[11px] ${item.isDiscussed ? 'text-ink-black dark:text-pearl' : 'text-silver-mist'}`}
                                        >
                                          {item.text}
                                        </p>
                                        {item.notes && (
                                          <p className="text-[10px] text-silver-mist/70 italic mt-0.5">
                                            {item.notes}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Notes */}
                            {meeting.notes && (
                              <div>
                                <h5 className="text-[10px] font-semibold text-silver-mist mb-1 flex items-center gap-1">
                                  <MessageSquare className="w-2.5 h-2.5" /> Notes
                                </h5>
                                <p className="text-[11px] text-ink-black dark:text-pearl whitespace-pre-wrap bg-pearl/30 dark:bg-deep-cosmos/10 rounded-lg px-2.5 py-2">
                                  {meeting.notes}
                                </p>
                              </div>
                            )}

                            {/* Action items summary */}
                            {meeting.actionItems.length > 0 && (
                              <div>
                                <h5 className="text-[10px] font-semibold text-silver-mist mb-1 flex items-center gap-1">
                                  <CheckCircle2 className="w-2.5 h-2.5" /> Action Items (
                                  {completedActions}/{meeting.actionItems.length} done)
                                </h5>
                                <div className="space-y-1">
                                  {meeting.actionItems.map((ai) => (
                                    <div key={ai.id} className="flex items-center gap-2 pl-1">
                                      <CheckCircle2
                                        className={`w-3 h-3 shrink-0 ${ai.status === 'completed' ? 'text-neural-mint' : 'text-silver-mist/40'}`}
                                      />
                                      <span
                                        className={`text-[11px] flex-1 ${ai.status === 'completed' ? 'text-silver-mist line-through' : 'text-ink-black dark:text-pearl'}`}
                                      >
                                        {ai.description}
                                      </span>
                                      <span className="text-[9px] text-silver-mist flex items-center gap-0.5">
                                        <Users className="w-2.5 h-2.5" /> {ai.assignedToName}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Sentiment */}
                            {sentimentConfig && SentimentIcon && (
                              <div className="flex items-center gap-2 pt-1">
                                <span className="text-[10px] text-silver-mist">Sentiment:</span>
                                <SentimentIcon className={`w-4 h-4 ${sentimentConfig.color}`} />
                                <span
                                  className={`text-[10px] font-semibold ${sentimentConfig.color}`}
                                >
                                  {sentimentConfig.label}
                                </span>
                              </div>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelect(meeting);
                              }}
                              className="w-full text-[11px] text-celestial-indigo font-semibold hover:text-celestial-indigo/80 transition-colors pt-1"
                            >
                              View Full Details →
                            </button>
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

export default MeetingHistory;
