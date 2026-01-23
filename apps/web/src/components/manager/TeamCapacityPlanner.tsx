"use client";

import React, { useState } from "react";
import {
  Users,
  Calendar,
  Briefcase,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  availability: number;
  currentWorkload: number;
  upcomingLeaves: { startDate: string; endDate: string; type: string }[];
  projects: { name: string; allocation: number }[];
}

const mockTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Sarah Chen",
    role: "Senior Developer",
    availability: 85,
    currentWorkload: 90,
    upcomingLeaves: [
      { startDate: "2026-02-10", endDate: "2026-02-14", type: "Vacation" },
    ],
    projects: [
      { name: "Core Platform", allocation: 60 },
      { name: "API Redesign", allocation: 30 },
    ],
  },
  {
    id: "2",
    name: "James Wilson",
    role: "Product Designer",
    availability: 100,
    currentWorkload: 70,
    upcomingLeaves: [],
    projects: [
      { name: "Dashboard Redesign", allocation: 50 },
      { name: "Mobile App", allocation: 20 },
    ],
  },
  {
    id: "3",
    name: "Maria Rodriguez",
    role: "QA Engineer",
    availability: 60,
    currentWorkload: 95,
    upcomingLeaves: [
      { startDate: "2026-01-27", endDate: "2026-01-28", type: "Personal" },
      { startDate: "2026-02-20", endDate: "2026-02-25", type: "Vacation" },
    ],
    projects: [
      { name: "Core Platform", allocation: 40 },
      { name: "Dashboard Redesign", allocation: 30 },
      { name: "Mobile App", allocation: 25 },
    ],
  },
  {
    id: "4",
    name: "Alex Thompson",
    role: "Frontend Developer",
    availability: 100,
    currentWorkload: 55,
    upcomingLeaves: [],
    projects: [
      { name: "Dashboard Redesign", allocation: 45 },
      { name: "Component Library", allocation: 10 },
    ],
  },
  {
    id: "5",
    name: "Priya Patel",
    role: "DevOps Engineer",
    availability: 80,
    currentWorkload: 75,
    upcomingLeaves: [
      { startDate: "2026-02-03", endDate: "2026-02-04", type: "Sick" },
    ],
    projects: [
      { name: "Infrastructure", allocation: 50 },
      { name: "CI/CD Pipeline", allocation: 25 },
    ],
  },
  {
    id: "6",
    name: "David Kim",
    role: "Backend Developer",
    availability: 90,
    currentWorkload: 80,
    upcomingLeaves: [
      { startDate: "2026-03-01", endDate: "2026-03-05", type: "Vacation" },
    ],
    projects: [
      { name: "API Redesign", allocation: 55 },
      { name: "Core Platform", allocation: 25 },
    ],
  },
];

export default function TeamCapacityPlanner() {
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  const getWorkloadColor = (workload: number): string => {
    if (workload >= 90) return "bg-coral-alert";
    if (workload >= 70) return "bg-celestial-indigo";
    return "bg-aurora-green";
  };

  const getWorkloadTextColor = (workload: number): string => {
    if (workload >= 90) return "text-coral-alert";
    if (workload >= 70) return "text-celestial-indigo";
    return "text-aurora-green";
  };

  const getAvailabilityBadge = (availability: number) => {
    if (availability >= 90)
      return (
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-aurora-green/10 text-aurora-green">
          Fully Available
        </span>
      );
    if (availability >= 70)
      return (
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-celestial-indigo/10 text-celestial-indigo">
          Mostly Available
        </span>
      );
    return (
      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-coral-alert/10 text-coral-alert">
        Limited
      </span>
    );
  };

  const avgAvailability = Math.round(
    mockTeamMembers.reduce((sum, m) => sum + m.availability, 0) / mockTeamMembers.length
  );
  const avgWorkload = Math.round(
    mockTeamMembers.reduce((sum, m) => sum + m.currentWorkload, 0) / mockTeamMembers.length
  );
  const overloadedCount = mockTeamMembers.filter((m) => m.currentWorkload >= 90).length;

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6 text-celestial-indigo" />
        <h2 className="text-xl font-semibold text-ink-black dark:text-pearl">
          Team Capacity Planner
        </h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg border border-cloud dark:border-nebula-purple/50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs font-medium text-silver-mist">Avg. Availability</span>
          </div>
          <p className="text-2xl font-bold text-ink-black dark:text-pearl">{avgAvailability}%</p>
        </div>
        <div className="p-4 rounded-lg border border-cloud dark:border-nebula-purple/50">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs font-medium text-silver-mist">Avg. Workload</span>
          </div>
          <p className="text-2xl font-bold text-ink-black dark:text-pearl">{avgWorkload}%</p>
        </div>
        <div className="p-4 rounded-lg border border-cloud dark:border-nebula-purple/50">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-coral-alert" />
            <span className="text-xs font-medium text-silver-mist">Overloaded</span>
          </div>
          <p className="text-2xl font-bold text-coral-alert">{overloadedCount}</p>
        </div>
      </div>

      {/* Team Members */}
      <div className="space-y-3">
        {mockTeamMembers.map((member) => {
          const isExpanded = expandedMember === member.id;

          return (
            <div
              key={member.id}
              className="rounded-lg border border-cloud dark:border-nebula-purple/50 overflow-hidden"
            >
              {/* Member Row */}
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-cloud/20 dark:hover:bg-nebula-purple/10 transition-colors"
                onClick={() => setExpandedMember(isExpanded ? null : member.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-ink-black dark:text-pearl truncate">
                      {member.name}
                    </p>
                    {getAvailabilityBadge(member.availability)}
                  </div>
                  <p className="text-xs text-silver-mist">{member.role}</p>
                </div>

                {/* Workload Bar */}
                <div className="flex items-center gap-3 w-48">
                  <div className="flex-1 h-2 bg-cloud dark:bg-nebula-purple/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getWorkloadColor(member.currentWorkload)}`}
                      style={{ width: `${member.currentWorkload}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium w-10 text-right ${getWorkloadTextColor(member.currentWorkload)}`}>
                    {member.currentWorkload}%
                  </span>
                </div>

                {/* Upcoming Leaves */}
                <div className="flex items-center gap-1 w-24">
                  <Calendar className="w-3 h-3 text-silver-mist" />
                  <span className="text-xs text-silver-mist">
                    {member.upcomingLeaves.length} leave{member.upcomingLeaves.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-silver-mist" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-silver-mist" />
                )}
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-cloud dark:border-nebula-purple/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Projects */}
                    <div>
                      <h4 className="text-xs font-medium text-silver-mist mb-2 uppercase tracking-wider">
                        Project Allocations
                      </h4>
                      <div className="space-y-2">
                        {member.projects.map((project, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-xs text-ink-black dark:text-pearl">
                              {project.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-cloud dark:bg-nebula-purple/20 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-celestial-indigo rounded-full"
                                  style={{ width: `${project.allocation}%` }}
                                />
                              </div>
                              <span className="text-xs text-silver-mist w-8 text-right">
                                {project.allocation}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Leaves */}
                    <div>
                      <h4 className="text-xs font-medium text-silver-mist mb-2 uppercase tracking-wider">
                        Upcoming Leaves
                      </h4>
                      {member.upcomingLeaves.length > 0 ? (
                        <div className="space-y-2">
                          {member.upcomingLeaves.map((leave, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between text-xs"
                            >
                              <span className="text-ink-black dark:text-pearl">
                                {new Date(leave.startDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}{" "}
                                -{" "}
                                {new Date(leave.endDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-celestial-indigo/10 text-celestial-indigo">
                                {leave.type}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-silver-mist">No upcoming leaves</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
