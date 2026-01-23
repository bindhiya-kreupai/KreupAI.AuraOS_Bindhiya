"use client";

import React, { useState } from "react";
import { BarChart3, Users, Clock, Layers } from "lucide-react";

interface WorkloadItem {
  id: string;
  name: string;
  role: string;
  assignedHours: number;
  maxHours: number;
  tasks: number;
  projects: string[];
}

const mockWorkload: WorkloadItem[] = [
  {
    id: "1",
    name: "Sarah Chen",
    role: "Sr. Engineer",
    assignedHours: 36,
    maxHours: 40,
    tasks: 8,
    projects: ["Platform Core", "API Gateway"],
  },
  {
    id: "2",
    name: "James Wilson",
    role: "Engineer II",
    assignedHours: 32,
    maxHours: 40,
    tasks: 6,
    projects: ["Dashboard UI", "Auth Service"],
  },
  {
    id: "3",
    name: "Maria Garcia",
    role: "Sr. Engineer",
    assignedHours: 44,
    maxHours: 40,
    tasks: 11,
    projects: ["Platform Core", "Data Pipeline", "Monitoring"],
  },
  {
    id: "4",
    name: "David Kim",
    role: "Engineer III",
    assignedHours: 28,
    maxHours: 40,
    tasks: 5,
    projects: ["Dashboard UI"],
  },
  {
    id: "5",
    name: "Alex Thompson",
    role: "Engineer I",
    assignedHours: 38,
    maxHours: 40,
    tasks: 7,
    projects: ["Auth Service", "Testing Framework"],
  },
  {
    id: "6",
    name: "Rachel Lee",
    role: "Designer",
    assignedHours: 24,
    maxHours: 40,
    tasks: 4,
    projects: ["Dashboard UI", "Design System"],
  },
  {
    id: "7",
    name: "Tom Harris",
    role: "QA Engineer",
    assignedHours: 42,
    maxHours: 40,
    tasks: 9,
    projects: ["Platform Core", "API Gateway", "Auth Service"],
  },
];

type SortBy = "name" | "hours" | "tasks";

export function WorkloadDistribution() {
  const [sortBy, setSortBy] = useState<SortBy>("hours");

  const sortedWorkload = [...mockWorkload].sort((a, b) => {
    switch (sortBy) {
      case "hours":
        return b.assignedHours - a.assignedHours;
      case "tasks":
        return b.tasks - a.tasks;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const maxHoursInTeam = Math.max(...mockWorkload.map((m) => m.assignedHours));
  const totalHours = mockWorkload.reduce((s, m) => s + m.assignedHours, 0);
  const totalTasks = mockWorkload.reduce((s, m) => s + m.tasks, 0);
  const avgHours = totalHours / mockWorkload.length;

  const getBarWidth = (hours: number) => {
    return (hours / maxHoursInTeam) * 100;
  };

  const getBarColor = (hours: number, maxHours: number) => {
    const ratio = hours / maxHours;
    if (ratio > 1) return "bg-red-500";
    if (ratio >= 0.8) return "bg-yellow-500";
    return "bg-celestial-indigo";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">Workload Distribution</h2>
          <p className="text-sm text-silver-mist mt-1">
            Team workload breakdown by assigned hours and tasks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-silver-mist">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-2 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/20"
          >
            <option value="hours">Hours</option>
            <option value="tasks">Tasks</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist uppercase font-medium">Team Size</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">{mockWorkload.length}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist uppercase font-medium">Total Hours</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">{totalHours}h</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist uppercase font-medium">Total Tasks</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">{totalTasks}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist uppercase font-medium">Avg Hours</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">{avgHours.toFixed(1)}h</p>
        </div>
      </div>

      {/* Horizontal Bar Chart */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-cloud dark:border-nebula-purple/50 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-celestial-indigo" />
          <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">Hours Distribution</h3>
        </div>
        <div className="divide-y divide-cloud dark:divide-nebula-purple/50">
          {sortedWorkload.map((member) => (
            <div key={member.id} className="px-4 py-4">
              <div className="flex items-center gap-4">
                {/* Name Column */}
                <div className="w-36 flex-shrink-0">
                  <h4 className="text-sm font-medium text-ink-black dark:text-pearl truncate">{member.name}</h4>
                  <p className="text-xs text-silver-mist">{member.role}</p>
                </div>

                {/* Bar */}
                <div className="flex-1">
                  <div className="relative w-full h-7 rounded-lg bg-slate-50 dark:bg-deep-cosmos overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-lg ${getBarColor(member.assignedHours, member.maxHours)} transition-all flex items-center justify-end pr-2`}
                      style={{ width: `${getBarWidth(member.assignedHours)}%` }}
                    >
                      <span className="text-xs font-semibold text-white">{member.assignedHours}h</span>
                    </div>
                    {/* Capacity line */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-ink-black/30 dark:bg-pearl/30"
                      style={{ left: `${getBarWidth(member.maxHours)}%` }}
                      title={`Capacity: ${member.maxHours}h`}
                    />
                  </div>
                </div>

                {/* Tasks & Projects */}
                <div className="w-28 flex-shrink-0 text-right">
                  <p className="text-xs font-medium text-ink-black dark:text-pearl">{member.tasks} tasks</p>
                  <p className="text-xs text-silver-mist">{member.projects.length} projects</p>
                </div>
              </div>

              {/* Projects */}
              <div className="mt-2 ml-40 flex flex-wrap gap-1">
                {member.projects.map((project) => (
                  <span
                    key={project}
                    className="text-xs px-2 py-0.5 rounded-full bg-slate-50 dark:bg-deep-cosmos text-celestial-indigo font-medium"
                  >
                    {project}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-celestial-indigo" />
          <span className="text-xs text-silver-mist">&lt; 80% capacity</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-yellow-500" />
          <span className="text-xs text-silver-mist">80-100% capacity</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span className="text-xs text-silver-mist">&gt; 100% (overloaded)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-0.5 h-3 bg-ink-black/30 dark:bg-pearl/30" />
          <span className="text-xs text-silver-mist">Capacity line</span>
        </div>
      </div>
    </div>
  );
}
