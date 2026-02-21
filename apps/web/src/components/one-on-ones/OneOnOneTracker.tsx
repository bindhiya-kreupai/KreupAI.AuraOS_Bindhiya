"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Plus,
  Search,
} from "lucide-react";

interface OneOnOneMeeting {
  id: string;
  employeeName: string;
  employeeRole: string;
  lastMeeting: string;
  nextScheduled: string;
  actionItemsCount: number;
  completedItems: number;
  status: "upcoming" | "overdue" | "completed";
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

interface OneOnOneTrackerProps {
  oneOnOnes?: ApiOneOnOne[];
}

function mapApiToMeeting(item: ApiOneOnOne): OneOnOneMeeting {
  const now = new Date();
  const nextDate = new Date(item.nextMeeting);
  let status: OneOnOneMeeting["status"] = "upcoming";
  if (item.status === "completed") status = "completed";
  else if (nextDate < now) status = "overdue";

  return {
    id: item.id,
    employeeName: item.reportName,
    employeeRole: `${item.frequency} meeting`,
    lastMeeting: new Date(
      nextDate.getTime() - (item.frequency === "weekly" ? 7 : 14) * 24 * 60 * 60 * 1000
    ).toISOString().split("T")[0],
    nextScheduled: nextDate.toISOString().split("T")[0],
    actionItemsCount: item.agendaItems?.length || 0,
    completedItems: 0,
    status,
  };
}

type SortField = "employeeName" | "lastMeeting" | "nextScheduled" | "actionItemsCount";

export default function OneOnOneTracker({ oneOnOnes }: OneOnOneTrackerProps) {
  const [meetings, setMeetings] = useState<OneOnOneMeeting[]>([]);
  const [loading, setLoading] = useState(!oneOnOnes);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("nextScheduled");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterStatus, setFilterStatus] = useState<"all" | "upcoming" | "overdue" | "completed">("all");

  useEffect(() => {
    if (oneOnOnes) {
      setMeetings(oneOnOnes.map(mapApiToMeeting));
      setLoading(false);
      return;
    }

    // Fallback: fetch data directly if no props provided
    fetch("/api/v1/performance/one-on-ones")
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.data?.oneOnOnes) {
          setMeetings(result.data.oneOnOnes.map(mapApiToMeeting));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [oneOnOnes]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredMeetings = meetings
    .filter((meeting) => {
      const matchesSearch =
        meeting.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meeting.employeeRole.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "all" || meeting.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const modifier = sortDirection === "asc" ? 1 : -1;
      if (sortField === "employeeName") {
        return a.employeeName.localeCompare(b.employeeName) * modifier;
      }
      if (sortField === "actionItemsCount") {
        return (a.actionItemsCount - b.actionItemsCount) * modifier;
      }
      return (new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime()) * modifier;
    });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="inline w-4 h-4" />
    ) : (
      <ChevronDown className="inline w-4 h-4" />
    );
  };

  const getStatusBadge = (status: OneOnOneMeeting["status"]) => {
    switch (status) {
      case "upcoming":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-celestial-indigo/10 text-celestial-indigo">
            Upcoming
          </span>
        );
      case "overdue":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-coral-alert/10 text-coral-alert">
            Overdue
          </span>
        );
      case "completed":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-aurora-green/10 text-aurora-green">
            Completed
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-6" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-celestial-indigo" />
          <h2 className="text-xl font-semibold text-ink-black dark:text-pearl">
            1:1 Meeting Tracker
          </h2>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-celestial-indigo rounded-lg hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          Schedule 1:1
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
          <input
            type="text"
            placeholder="Search by name or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-cloud dark:border-nebula-purple/50 rounded-lg bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
          className="px-3 py-2 text-sm border border-cloud dark:border-nebula-purple/50 rounded-lg bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50"
        >
          <option value="all">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="overdue">Overdue</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cloud dark:border-nebula-purple/50">
              <th
                className="text-left py-3 px-4 font-medium text-silver-mist cursor-pointer hover:text-ink-black dark:hover:text-pearl"
                onClick={() => handleSort("employeeName")}
              >
                Employee <SortIcon field="employeeName" />
              </th>
              <th
                className="text-left py-3 px-4 font-medium text-silver-mist cursor-pointer hover:text-ink-black dark:hover:text-pearl"
                onClick={() => handleSort("lastMeeting")}
              >
                Last Meeting <SortIcon field="lastMeeting" />
              </th>
              <th
                className="text-left py-3 px-4 font-medium text-silver-mist cursor-pointer hover:text-ink-black dark:hover:text-pearl"
                onClick={() => handleSort("nextScheduled")}
              >
                Next Scheduled <SortIcon field="nextScheduled" />
              </th>
              <th
                className="text-left py-3 px-4 font-medium text-silver-mist cursor-pointer hover:text-ink-black dark:hover:text-pearl"
                onClick={() => handleSort("actionItemsCount")}
              >
                Action Items <SortIcon field="actionItemsCount" />
              </th>
              <th className="text-left py-3 px-4 font-medium text-silver-mist">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredMeetings.map((meeting) => (
              <tr
                key={meeting.id}
                className="border-b border-cloud dark:border-nebula-purple/50 hover:bg-cloud/30 dark:hover:bg-nebula-purple/10 transition-colors"
              >
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium text-ink-black dark:text-pearl">
                      {meeting.employeeName}
                    </p>
                    <p className="text-xs text-silver-mist">{meeting.employeeRole}</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2 text-ink-black dark:text-pearl">
                    <Calendar className="w-4 h-4 text-silver-mist" />
                    {new Date(meeting.lastMeeting).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2 text-ink-black dark:text-pearl">
                    <Clock className="w-4 h-4 text-silver-mist" />
                    {new Date(meeting.nextScheduled).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-aurora-green" />
                    <span className="text-ink-black dark:text-pearl">
                      {meeting.completedItems}/{meeting.actionItemsCount}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">{getStatusBadge(meeting.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredMeetings.length === 0 && (
        <div className="text-center py-8">
          <p className="text-silver-mist">No meetings found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
