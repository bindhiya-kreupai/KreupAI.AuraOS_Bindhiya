"use client";

import React from "react";
import { User, Clock, AlertTriangle } from "lucide-react";

interface TeamMemberCapacity {
  id: string;
  name: string;
  role: string;
  totalHours: number;
  assignedHours: number;
  utilization: number;
}

const mockCapacityData: TeamMemberCapacity[] = [
  { id: "1", name: "Sarah Chen", role: "Sr. Engineer", totalHours: 40, assignedHours: 36, utilization: 90 },
  { id: "2", name: "James Wilson", role: "Engineer II", totalHours: 40, assignedHours: 32, utilization: 80 },
  { id: "3", name: "Maria Garcia", role: "Sr. Engineer", totalHours: 40, assignedHours: 44, utilization: 110 },
  { id: "4", name: "David Kim", role: "Engineer III", totalHours: 40, assignedHours: 28, utilization: 70 },
  { id: "5", name: "Alex Thompson", role: "Engineer I", totalHours: 40, assignedHours: 38, utilization: 95 },
  { id: "6", name: "Rachel Lee", role: "Designer", totalHours: 40, assignedHours: 24, utilization: 60 },
  { id: "7", name: "Tom Harris", role: "QA Engineer", totalHours: 40, assignedHours: 42, utilization: 105 },
];

const getBarColor = (utilization: number): string => {
  if (utilization > 100) return "bg-red-500";
  if (utilization >= 80) return "bg-yellow-500";
  return "bg-green-500";
};

const getStatusLabel = (utilization: number): string => {
  if (utilization > 100) return "Overloaded";
  if (utilization >= 80) return "Near Capacity";
  return "Available";
};

const getStatusColor = (utilization: number): string => {
  if (utilization > 100) return "text-red-500";
  if (utilization >= 80) return "text-yellow-600 dark:text-yellow-400";
  return "text-green-600 dark:text-green-400";
};

export function CapacityBar() {
  const avgUtilization =
    mockCapacityData.reduce((s, m) => s + m.utilization, 0) / mockCapacityData.length;
  const overloaded = mockCapacityData.filter((m) => m.utilization > 100).length;
  const available = mockCapacityData.filter((m) => m.utilization < 80).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">Team Utilization</h2>
        <p className="text-sm text-silver-mist mt-1">Individual capacity utilization per team member.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist uppercase font-medium">Avg Utilization</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">{avgUtilization.toFixed(0)}%</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-xs text-silver-mist uppercase font-medium">Overloaded</span>
          </div>
          <p className="text-xl font-bold text-red-500">{overloaded}</p>
          <p className="text-xs text-silver-mist">team members</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-green-500" />
            <span className="text-xs text-silver-mist uppercase font-medium">Available</span>
          </div>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">{available}</p>
          <p className="text-xs text-silver-mist">team members</p>
        </div>
      </div>

      {/* Capacity Bars */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-cloud dark:border-nebula-purple/50">
          <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">Individual Utilization</h3>
        </div>
        <div className="divide-y divide-cloud dark:divide-nebula-purple/50">
          {mockCapacityData.map((member) => (
            <div key={member.id} className="px-4 py-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-deep-cosmos flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-celestial-indigo" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-ink-black dark:text-pearl">{member.name}</h4>
                    <p className="text-xs text-silver-mist">{member.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-silver-mist">
                      {member.assignedHours}h / {member.totalHours}h
                    </span>
                    <span className={`text-xs font-semibold ${getStatusColor(member.utilization)}`}>
                      {member.utilization}%
                    </span>
                  </div>
                  <span className={`text-xs ${getStatusColor(member.utilization)}`}>
                    {getStatusLabel(member.utilization)}
                  </span>
                </div>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-50 dark:bg-deep-cosmos overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${getBarColor(member.utilization)}`}
                  style={{ width: `${Math.min(member.utilization, 100)}%` }}
                />
              </div>
              {member.utilization > 100 && (
                <div className="mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                  <span className="text-xs text-red-500">
                    {member.assignedHours - member.totalHours}h over capacity
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Color Legend */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span className="text-xs text-silver-mist">&lt; 80% (Available)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-yellow-500" />
          <span className="text-xs text-silver-mist">80-100% (Near Capacity)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span className="text-xs text-silver-mist">&gt; 100% (Overloaded)</span>
        </div>
      </div>
    </div>
  );
}
