"use client";

import React, { useState, useEffect } from "react";
import {
  History,
  Calendar,
  MessageSquare,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
} from "lucide-react";

interface MeetingRecord {
  id: string;
  date: string;
  duration: string;
  attendee: string;
  keyTopics: string[];
  totalActionItems: number;
  completedActionItems: number;
  summary: string;
}

interface ApiOneOnOne {
  id: string;
  managerId: string;
  managerName: string;
  reportId: string;
  reportName: string;
  frequency: string;
  nextMeeting: string;
  duration: number;
  status: string;
  agendaItems: string[];
  lastMeetingNotes?: string;
}

interface MeetingHistoryProps {
  oneOnOnes?: ApiOneOnOne[];
}

function mapApiToHistory(items: ApiOneOnOne[]): MeetingRecord[] {
  return items.map((item) => ({
    id: item.id,
    date: new Date(item.nextMeeting).toISOString().split("T")[0],
    duration: `${item.duration} min`,
    attendee: item.reportName,
    keyTopics: item.agendaItems || [],
    totalActionItems: item.agendaItems?.length || 0,
    completedActionItems: item.status === "completed" ? (item.agendaItems?.length || 0) : 0,
    summary: item.lastMeetingNotes || `${item.frequency} meeting with ${item.reportName}.`,
  }));
}

export default function MeetingHistory({ oneOnOnes }: MeetingHistoryProps) {
  const [history, setHistory] = useState<MeetingRecord[]>([]);
  const [loading, setLoading] = useState(!oneOnOnes);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (oneOnOnes) {
      setHistory(mapApiToHistory(oneOnOnes));
      setLoading(false);
      return;
    }

    // Fallback
    fetch("/api/v1/performance/one-on-ones")
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.data?.oneOnOnes) {
          setHistory(mapApiToHistory(result.data.oneOnOnes));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [oneOnOnes]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getCompletionRate = (completed: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const getCompletionColor = (rate: number): string => {
    if (rate >= 80) return "text-aurora-green";
    if (rate >= 50) return "text-celestial-indigo";
    return "text-coral-alert";
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-lg ml-12" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50">
      <div className="flex items-center gap-3 mb-6">
        <History className="w-6 h-6 text-celestial-indigo" />
        <h2 className="text-xl font-semibold text-ink-black dark:text-pearl">
          Meeting History
        </h2>
        <span className="ml-auto text-sm text-silver-mist">
          {history.length} meetings
        </span>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-silver-mist">No meeting history yet.</p>
        </div>
      ) : (
        /* Timeline */
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-4 bottom-4 w-px bg-cloud dark:bg-nebula-purple/50" />

          <div className="space-y-4">
            {history.map((meeting) => {
              const completionRate = getCompletionRate(
                meeting.completedActionItems,
                meeting.totalActionItems
              );
              const isExpanded = expandedId === meeting.id;

              return (
                <div key={meeting.id} className="relative pl-12">
                  {/* Timeline dot */}
                  <div className="absolute left-3 top-4 w-3 h-3 rounded-full bg-celestial-indigo border-2 border-white dark:border-stellar-blue" />

                  <div
                    className={`p-4 rounded-lg border border-cloud dark:border-nebula-purple/50 cursor-pointer transition-colors ${
                      isExpanded
                        ? "bg-cloud/20 dark:bg-nebula-purple/10"
                        : "hover:bg-cloud/10 dark:hover:bg-nebula-purple/5"
                    }`}
                    onClick={() => toggleExpand(meeting.id)}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-silver-mist" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-silver-mist" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-silver-mist" />
                          <span className="text-sm font-medium text-ink-black dark:text-pearl">
                            {new Date(meeting.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-silver-mist" />
                          <span className="text-xs text-silver-mist">{meeting.duration}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          className={`w-4 h-4 ${getCompletionColor(completionRate)}`}
                        />
                        <span
                          className={`text-sm font-medium ${getCompletionColor(completionRate)}`}
                        >
                          {completionRate}%
                        </span>
                      </div>
                    </div>

                    {/* Topics */}
                    <div className="flex flex-wrap gap-2 ml-8">
                      {meeting.keyTopics.map((topic, index) => (
                        <span
                          key={index}
                          className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-celestial-indigo/10 text-celestial-indigo"
                        >
                          <MessageSquare className="w-3 h-3" />
                          {topic}
                        </span>
                      ))}
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-4 ml-8 pt-3 border-t border-cloud dark:border-nebula-purple/50">
                        <p className="text-sm text-ink-black dark:text-pearl mb-3">
                          {meeting.summary}
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-silver-mist">Action Items:</span>
                            <span className="text-xs font-medium text-ink-black dark:text-pearl">
                              {meeting.completedActionItems}/{meeting.totalActionItems} completed
                            </span>
                          </div>
                          {/* Progress bar */}
                          <div className="flex-1 max-w-[200px] h-2 bg-cloud dark:bg-nebula-purple/20 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                completionRate >= 80
                                  ? "bg-aurora-green"
                                  : completionRate >= 50
                                  ? "bg-celestial-indigo"
                                  : "bg-coral-alert"
                              }`}
                              style={{ width: `${completionRate}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
