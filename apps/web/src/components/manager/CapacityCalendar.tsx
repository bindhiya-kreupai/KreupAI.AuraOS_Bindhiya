"use client";

import React, { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

type AvailabilityStatus = "available" | "partial" | "unavailable";

interface TeamMemberAvailability {
  id: string;
  name: string;
  availability: Record<string, AvailabilityStatus>;
}

const generateWeekDates = (startDate: Date): string[] => {
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date.toISOString().split("T")[0]);
  }
  return dates;
};

const generateMonthDates = (year: number, month: number): string[] => {
  const dates: string[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    dates.push(new Date(year, month, i).toISOString().split("T")[0]);
  }
  return dates;
};

const mockTeamMembers: TeamMemberAvailability[] = [
  {
    id: "1",
    name: "Sarah Chen",
    availability: {
      "2026-01-19": "available",
      "2026-01-20": "available",
      "2026-01-21": "partial",
      "2026-01-22": "available",
      "2026-01-23": "available",
      "2026-01-24": "unavailable",
      "2026-01-25": "unavailable",
    },
  },
  {
    id: "2",
    name: "James Wilson",
    availability: {
      "2026-01-19": "available",
      "2026-01-20": "partial",
      "2026-01-21": "available",
      "2026-01-22": "partial",
      "2026-01-23": "available",
      "2026-01-24": "unavailable",
      "2026-01-25": "unavailable",
    },
  },
  {
    id: "3",
    name: "Maria Garcia",
    availability: {
      "2026-01-19": "unavailable",
      "2026-01-20": "unavailable",
      "2026-01-21": "available",
      "2026-01-22": "available",
      "2026-01-23": "available",
      "2026-01-24": "unavailable",
      "2026-01-25": "unavailable",
    },
  },
  {
    id: "4",
    name: "David Kim",
    availability: {
      "2026-01-19": "available",
      "2026-01-20": "available",
      "2026-01-21": "available",
      "2026-01-22": "available",
      "2026-01-23": "partial",
      "2026-01-24": "unavailable",
      "2026-01-25": "unavailable",
    },
  },
  {
    id: "5",
    name: "Alex Thompson",
    availability: {
      "2026-01-19": "partial",
      "2026-01-20": "available",
      "2026-01-21": "unavailable",
      "2026-01-22": "available",
      "2026-01-23": "available",
      "2026-01-24": "unavailable",
      "2026-01-25": "unavailable",
    },
  },
];

const statusColors: Record<AvailabilityStatus, string> = {
  available: "bg-green-400 dark:bg-green-500",
  partial: "bg-yellow-400 dark:bg-yellow-500",
  unavailable: "bg-red-400 dark:bg-red-500",
};

const statusLabels: Record<AvailabilityStatus, string> = {
  available: "Available",
  partial: "Partial",
  unavailable: "Unavailable",
};

export function CapacityCalendar() {
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 19));

  const dates =
    viewMode === "week"
      ? generateWeekDates(currentDate)
      : generateMonthDates(currentDate.getFullYear(), currentDate.getMonth());

  const navigateBack = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const navigateForward = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    if (viewMode === "week") {
      return {
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        date: date.getDate().toString(),
      };
    }
    return {
      day: date.getDate().toString(),
      date: "",
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">Team Capacity Calendar</h2>
          <p className="text-sm text-silver-mist mt-1">View team availability at a glance.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-cloud dark:border-nebula-purple/50 overflow-hidden">
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === "week"
                  ? "bg-celestial-indigo text-white"
                  : "bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === "month"
                  ? "bg-celestial-indigo text-white"
                  : "bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl"
              }`}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={navigateBack}
          className="p-2 rounded-lg border border-cloud dark:border-nebula-purple/50 hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-ink-black dark:text-pearl" />
        </button>
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-celestial-indigo" />
          <span className="text-sm font-medium text-ink-black dark:text-pearl">
            {viewMode === "week"
              ? `Week of ${currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
              : currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
        </div>
        <button
          onClick={navigateForward}
          className="p-2 rounded-lg border border-cloud dark:border-nebula-purple/50 hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-ink-black dark:text-pearl" />
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4">
        {(["available", "partial", "unavailable"] as const).map((status) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${statusColors[status]}`} />
            <span className="text-xs text-silver-mist">{statusLabels[status]}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-deep-cosmos">
                <th className="text-left text-xs font-medium text-silver-mist px-4 py-3 sticky left-0 bg-slate-50 dark:bg-deep-cosmos z-10 min-w-[140px]">
                  Team Member
                </th>
                {dates.slice(0, viewMode === "week" ? 7 : 31).map((date) => {
                  const header = formatDateHeader(date);
                  return (
                    <th key={date} className="text-center text-xs font-medium text-silver-mist px-1 py-2 min-w-[40px]">
                      <div>{header.day}</div>
                      {header.date && <div className="text-ink-black dark:text-pearl">{header.date}</div>}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-cloud dark:divide-nebula-purple/50">
              {mockTeamMembers.map((member) => (
                <tr key={member.id}>
                  <td className="px-4 py-3 text-sm font-medium text-ink-black dark:text-pearl sticky left-0 bg-white dark:bg-stellar-blue z-10">
                    {member.name}
                  </td>
                  {dates.slice(0, viewMode === "week" ? 7 : 31).map((date) => {
                    const status = member.availability[date] || "available";
                    return (
                      <td key={date} className="px-1 py-3 text-center">
                        <div
                          className={`w-6 h-6 rounded mx-auto ${statusColors[status]}`}
                          title={`${member.name}: ${statusLabels[status]} on ${date}`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
