"use client";

import React, { useState } from "react";
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

const mockMeetings: OneOnOneMeeting[] = [
  {
    id: "1",
    employeeName: "Sarah Chen",
    employeeRole: "Senior Developer",
    lastMeeting: "2026-01-20",
    nextScheduled: "2026-01-27",
    actionItemsCount: 3,
    completedItems: 1,
    status: "upcoming",
  },
  {
    id: "2",
    employeeName: "James Wilson",
    employeeRole: "Product Designer",
    lastMeeting: "2026-01-18",
    nextScheduled: "2026-01-25",
    actionItemsCount: 5,
    completedItems: 3,
    status: "upcoming",
  },
  {
    id: "3",
    employeeName: "Maria Rodriguez",
    employeeRole: "QA Engineer",
    lastMeeting: "2026-01-15",
    nextScheduled: "2026-01-22",
    actionItemsCount: 2,
    completedItems: 0,
    status: "overdue",
  },
  {
    id: "4",
    employeeName: "Alex Thompson",
    employeeRole: "Frontend Developer",
    lastMeeting: "2026-01-19",
    nextScheduled: "2026-01-26",
    actionItemsCount: 4,
    completedItems: 4,
    status: "upcoming",
  },
  {
    id: "5",
    employeeName: "Priya Patel",
    employeeRole: "DevOps Engineer",
    lastMeeting: "2026-01-10",
    nextScheduled: "2026-01-24",
    actionItemsCount: 6,
    completedItems: 5,
    status: "upcoming",
  },
  {
    id: "6",
    employeeName: "David Kim",
    employeeRole: "Backend Developer",
    lastMeeting: "2026-01-13",
    nextScheduled: "2026-01-20",
    actionItemsCount: 3,
    completedItems: 3,
    status: "completed",
  },
];

type SortField = "employeeName" | "lastMeeting" | "nextScheduled" | "actionItemsCount";

export default function OneOnOneTracker() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("nextScheduled");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterStatus, setFilterStatus] = useState<"all" | "upcoming" | "overdue" | "completed">("all");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredMeetings = mockMeetings
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
