"use client";

import React, { useState } from "react";
import {
  BarChart3,
  Filter,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface SkillGap {
  id: string;
  skillName: string;
  category: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  priority: "critical" | "high" | "medium" | "low";
}

interface RoleProfile {
  id: string;
  name: string;
  skills: SkillGap[];
}

const mockRoles: RoleProfile[] = [
  {
    id: "sr-engineer",
    name: "Senior Software Engineer",
    skills: [
      { id: "s1", skillName: "System Design", category: "Technical", currentLevel: 65, requiredLevel: 90, gap: 25, priority: "critical" },
      { id: "s2", skillName: "Cloud Architecture", category: "Technical", currentLevel: 55, requiredLevel: 85, gap: 30, priority: "critical" },
      { id: "s3", skillName: "Code Review", category: "Technical", currentLevel: 80, requiredLevel: 90, gap: 10, priority: "low" },
      { id: "s4", skillName: "Mentoring", category: "Leadership", currentLevel: 50, requiredLevel: 75, gap: 25, priority: "high" },
      { id: "s5", skillName: "Technical Writing", category: "Communication", currentLevel: 60, requiredLevel: 80, gap: 20, priority: "medium" },
      { id: "s6", skillName: "Agile Practices", category: "Process", currentLevel: 75, requiredLevel: 85, gap: 10, priority: "low" },
      { id: "s7", skillName: "Security Practices", category: "Technical", currentLevel: 45, requiredLevel: 80, gap: 35, priority: "critical" },
      { id: "s8", skillName: "Performance Optimization", category: "Technical", currentLevel: 70, requiredLevel: 85, gap: 15, priority: "medium" },
    ],
  },
  {
    id: "tech-lead",
    name: "Technical Lead",
    skills: [
      { id: "t1", skillName: "Architecture Design", category: "Technical", currentLevel: 70, requiredLevel: 95, gap: 25, priority: "critical" },
      { id: "t2", skillName: "Team Leadership", category: "Leadership", currentLevel: 60, requiredLevel: 90, gap: 30, priority: "critical" },
      { id: "t3", skillName: "Stakeholder Management", category: "Communication", currentLevel: 55, requiredLevel: 85, gap: 30, priority: "high" },
      { id: "t4", skillName: "Technical Strategy", category: "Strategy", currentLevel: 50, requiredLevel: 85, gap: 35, priority: "critical" },
      { id: "t5", skillName: "Project Planning", category: "Process", currentLevel: 65, requiredLevel: 80, gap: 15, priority: "medium" },
      { id: "t6", skillName: "Code Quality Standards", category: "Technical", currentLevel: 85, requiredLevel: 90, gap: 5, priority: "low" },
    ],
  },
];

const priorityConfig: Record<SkillGap["priority"], { label: string; colorClass: string; dotClass: string }> = {
  critical: { label: "Critical", colorClass: "text-coral-alert", dotClass: "bg-coral-alert" },
  high: { label: "High", colorClass: "text-amber-600 dark:text-amber-400", dotClass: "bg-amber-500" },
  medium: { label: "Medium", colorClass: "text-celestial-indigo", dotClass: "bg-celestial-indigo" },
  low: { label: "Low", colorClass: "text-aurora-green", dotClass: "bg-aurora-green" },
};

export default function SkillsGapAnalysis() {
  const [selectedRole, setSelectedRole] = useState<string>("sr-engineer");
  const [sortBy, setSortBy] = useState<"gap" | "priority" | "name">("gap");

  const currentRole = mockRoles.find((r) => r.id === selectedRole)!;

  const sortedSkills = [...currentRole.skills].sort((a, b) => {
    if (sortBy === "gap") return b.gap - a.gap;
    if (sortBy === "name") return a.skillName.localeCompare(b.skillName);
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const avgGap = Math.round(
    currentRole.skills.reduce((sum, s) => sum + s.gap, 0) / currentRole.skills.length
  );
  const criticalCount = currentRole.skills.filter((s) => s.priority === "critical").length;
  const onTrackCount = currentRole.skills.filter((s) => s.gap <= 10).length;

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-celestial-indigo" />
          <h2 className="text-xl font-semibold text-ink-black dark:text-pearl">
            Skills Gap Analysis
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="text-sm border border-cloud dark:border-nebula-purple/50 rounded-lg px-3 py-1.5 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl"
          >
            {mockRoles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gray-50 dark:bg-nebula-purple/10 rounded-lg text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-4 h-4 text-celestial-indigo" />
          </div>
          <div className="text-2xl font-bold text-ink-black dark:text-pearl">{avgGap}%</div>
          <div className="text-xs text-silver-mist">Avg Gap</div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-nebula-purple/10 rounded-lg text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <AlertTriangle className="w-4 h-4 text-coral-alert" />
          </div>
          <div className="text-2xl font-bold text-coral-alert">{criticalCount}</div>
          <div className="text-xs text-silver-mist">Critical Gaps</div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-nebula-purple/10 rounded-lg text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <CheckCircle className="w-4 h-4 text-aurora-green" />
          </div>
          <div className="text-2xl font-bold text-aurora-green">{onTrackCount}</div>
          <div className="text-xs text-silver-mist">On Track</div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-silver-mist" />
        <span className="text-xs text-silver-mist">Sort by:</span>
        {(["gap", "priority", "name"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
              sortBy === s
                ? "bg-celestial-indigo text-white"
                : "bg-gray-100 dark:bg-nebula-purple/20 text-silver-mist hover:text-ink-black dark:hover:text-pearl"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Skills Gap Chart */}
      <div className="space-y-4">
        {sortedSkills.map((skill) => {
          const config = priorityConfig[skill.priority];
          return (
            <div key={skill.id} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${config.dotClass}`} />
                  <span className="text-sm font-medium text-ink-black dark:text-pearl">
                    {skill.skillName}
                  </span>
                  <span className="text-[10px] text-silver-mist px-1.5 py-0.5 bg-gray-100 dark:bg-nebula-purple/20 rounded">
                    {skill.category}
                  </span>
                </div>
                <span className={`text-xs font-semibold ${config.colorClass}`}>
                  Gap: {skill.gap}%
                </span>
              </div>
              <div className="relative h-6 bg-gray-100 dark:bg-nebula-purple/20 rounded-full overflow-hidden">
                {/* Required level (background bar) */}
                <div
                  className="absolute top-0 left-0 h-full bg-celestial-indigo/20 rounded-full"
                  style={{ width: `${skill.requiredLevel}%` }}
                />
                {/* Current level (foreground bar) */}
                <div
                  className={`absolute top-0 left-0 h-full rounded-full transition-all ${
                    skill.gap <= 10
                      ? "bg-aurora-green"
                      : skill.gap <= 20
                      ? "bg-celestial-indigo"
                      : skill.gap <= 30
                      ? "bg-amber-500"
                      : "bg-coral-alert"
                  }`}
                  style={{ width: `${skill.currentLevel}%` }}
                />
                {/* Required level marker */}
                <div
                  className="absolute top-0 h-full w-0.5 bg-ink-black/30 dark:bg-pearl/30"
                  style={{ left: `${skill.requiredLevel}%` }}
                />
                {/* Labels inside bar */}
                <div className="absolute inset-0 flex items-center justify-between px-3">
                  <span className="text-[10px] font-bold text-white drop-shadow-sm">
                    Current: {skill.currentLevel}%
                  </span>
                  <span className="text-[10px] font-medium text-ink-black/60 dark:text-pearl/60">
                    Required: {skill.requiredLevel}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-6 pt-4 border-t border-cloud dark:border-nebula-purple/30">
        <div className="flex items-center gap-2">
          <div className="w-4 h-2 rounded-full bg-celestial-indigo" />
          <span className="text-xs text-silver-mist">Current Level</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-2 rounded-full bg-celestial-indigo/20" />
          <span className="text-xs text-silver-mist">Required Level</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-0.5 h-4 bg-ink-black/30 dark:bg-pearl/30" />
          <span className="text-xs text-silver-mist">Target</span>
        </div>
      </div>
    </div>
  );
}
