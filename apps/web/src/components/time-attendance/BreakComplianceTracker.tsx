"use client";

import React, { useState } from "react";
import {
  Coffee,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Users,
  TrendingUp,
  Shield,
} from "lucide-react";

interface ShiftBreakPolicy {
  shiftDuration: string;
  mandatedBreaks: { type: string; duration: number }[];
}

interface EmployeeBreakRecord {
  id: string;
  name: string;
  shift: string;
  mandatedMinutes: number;
  actualMinutes: number;
  breaksTaken: { type: string; start: string; end: string; duration: number }[];
  status: "compliant" | "warning" | "violation";
}

interface ComplianceStats {
  overallPercentage: number;
  totalEmployees: number;
  compliant: number;
  warnings: number;
  violations: number;
}

const mockPolicies: ShiftBreakPolicy[] = [
  {
    shiftDuration: "8 hours",
    mandatedBreaks: [
      { type: "Lunch", duration: 30 },
      { type: "Short Break", duration: 15 },
      { type: "Short Break", duration: 15 },
    ],
  },
  {
    shiftDuration: "10 hours",
    mandatedBreaks: [
      { type: "Lunch", duration: 45 },
      { type: "Short Break", duration: 15 },
      { type: "Short Break", duration: 15 },
      { type: "Short Break", duration: 15 },
    ],
  },
];

const mockRecords: EmployeeBreakRecord[] = [
  {
    id: "e-001",
    name: "Sarah Chen",
    shift: "9:00 AM - 5:00 PM",
    mandatedMinutes: 60,
    actualMinutes: 62,
    breaksTaken: [
      { type: "Short Break", start: "10:30", end: "10:45", duration: 15 },
      { type: "Lunch", start: "12:30", end: "13:02", duration: 32 },
      { type: "Short Break", start: "15:00", end: "15:15", duration: 15 },
    ],
    status: "compliant",
  },
  {
    id: "e-002",
    name: "James Wilson",
    shift: "10:00 AM - 6:00 PM",
    mandatedMinutes: 60,
    actualMinutes: 45,
    breaksTaken: [
      { type: "Short Break", start: "11:30", end: "11:45", duration: 15 },
      { type: "Lunch", start: "13:00", end: "13:30", duration: 30 },
    ],
    status: "warning",
  },
  {
    id: "e-003",
    name: "Priya Sharma",
    shift: "8:00 AM - 4:00 PM",
    mandatedMinutes: 60,
    actualMinutes: 65,
    breaksTaken: [
      { type: "Short Break", start: "09:45", end: "10:00", duration: 15 },
      { type: "Lunch", start: "12:00", end: "12:35", duration: 35 },
      { type: "Short Break", start: "14:30", end: "14:45", duration: 15 },
    ],
    status: "compliant",
  },
  {
    id: "e-004",
    name: "Marcus Lee",
    shift: "10:00 PM - 6:00 AM",
    mandatedMinutes: 60,
    actualMinutes: 20,
    breaksTaken: [
      { type: "Short Break", start: "01:00", end: "01:20", duration: 20 },
    ],
    status: "violation",
  },
  {
    id: "e-005",
    name: "Anna Kowalski",
    shift: "9:00 AM - 5:00 PM",
    mandatedMinutes: 60,
    actualMinutes: 55,
    breaksTaken: [
      { type: "Short Break", start: "10:15", end: "10:25", duration: 10 },
      { type: "Lunch", start: "12:45", end: "13:15", duration: 30 },
      { type: "Short Break", start: "15:30", end: "15:45", duration: 15 },
    ],
    status: "warning",
  },
];

const mockStats: ComplianceStats = {
  overallPercentage: 78,
  totalEmployees: 280,
  compliant: 218,
  warnings: 42,
  violations: 20,
};

export default function BreakComplianceTracker() {
  const [records] = useState<EmployeeBreakRecord[]>(mockRecords);
  const [stats] = useState<ComplianceStats>(mockStats);
  const [policies] = useState<ShiftBreakPolicy[]>(mockPolicies);

  const getStatusConfig = (status: EmployeeBreakRecord["status"]) => {
    switch (status) {
      case "compliant":
        return {
          icon: <CheckCircle2 className="w-4 h-4" />,
          color: "text-aurora-green",
          bg: "bg-aurora-green/10",
          label: "Compliant",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          color: "text-sunset-amber",
          bg: "bg-sunset-amber/10",
          label: "Warning",
        };
      case "violation":
        return {
          icon: <XCircle className="w-4 h-4" />,
          color: "text-coral-alert",
          bg: "bg-coral-alert/10",
          label: "Violation",
        };
    }
  };

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-celestial-indigo/10 rounded-lg">
            <Coffee className="w-5 h-5 text-celestial-indigo" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">
              Break Compliance Tracker
            </h2>
            <p className="text-sm text-silver-mist">
              Monitor mandated break adherence
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-celestial-indigo/5 border border-celestial-indigo/20">
          <Shield className="w-4 h-4 text-celestial-indigo" />
          <span className="text-sm font-medium text-celestial-indigo">
            {stats.overallPercentage}% Compliance
          </span>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-3 rounded-lg border border-cloud dark:border-nebula-purple/50">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist">Total</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">
            {stats.totalEmployees}
          </p>
        </div>
        <div className="p-3 rounded-lg border border-cloud dark:border-nebula-purple/50">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-aurora-green" />
            <span className="text-xs text-silver-mist">Compliant</span>
          </div>
          <p className="text-xl font-bold text-aurora-green">{stats.compliant}</p>
        </div>
        <div className="p-3 rounded-lg border border-cloud dark:border-nebula-purple/50">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-sunset-amber" />
            <span className="text-xs text-silver-mist">Warnings</span>
          </div>
          <p className="text-xl font-bold text-sunset-amber">{stats.warnings}</p>
        </div>
        <div className="p-3 rounded-lg border border-cloud dark:border-nebula-purple/50">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-coral-alert" />
            <span className="text-xs text-silver-mist">Violations</span>
          </div>
          <p className="text-xl font-bold text-coral-alert">{stats.violations}</p>
        </div>
      </div>

      {/* Compliance Percentage Bar */}
      <div className="mb-6 p-3 rounded-lg border border-cloud dark:border-nebula-purple/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-ink-black dark:text-pearl">
            Overall Compliance Rate
          </span>
          <span className="text-xs text-silver-mist flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-aurora-green" />
            +2.3% vs last week
          </span>
        </div>
        <div className="h-3 bg-gray-100 dark:bg-nebula-purple/20 rounded-full overflow-hidden">
          <div className="h-full flex">
            <div
              className="bg-aurora-green h-full"
              style={{ width: `${(stats.compliant / stats.totalEmployees) * 100}%` }}
            />
            <div
              className="bg-sunset-amber h-full"
              style={{ width: `${(stats.warnings / stats.totalEmployees) * 100}%` }}
            />
            <div
              className="bg-coral-alert h-full"
              style={{ width: `${(stats.violations / stats.totalEmployees) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Break Policy Reference */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-3">
          Break Policies
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {policies.map((policy, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg border border-cloud dark:border-nebula-purple/50"
            >
              <p className="text-xs font-medium text-ink-black dark:text-pearl mb-2">
                {policy.shiftDuration} shift
              </p>
              <div className="space-y-1">
                {policy.mandatedBreaks.map((brk, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-silver-mist">{brk.type}</span>
                    <span className="text-ink-black dark:text-pearl font-medium">
                      {brk.duration} min
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Employee Records */}
      <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-3">
        Today&#39;s Break Records
      </h3>
      <div className="space-y-2">
        {records.map((record) => {
          const statusConfig = getStatusConfig(record.status);
          const compliancePercent = Math.min(
            100,
            Math.round((record.actualMinutes / record.mandatedMinutes) * 100)
          );
          return (
            <div
              key={record.id}
              className="p-3 rounded-lg border border-cloud dark:border-nebula-purple/50"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-xs font-medium text-celestial-indigo">
                    {record.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-black dark:text-pearl">
                      {record.name}
                    </p>
                    <p className="text-xs text-silver-mist flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {record.shift}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-silver-mist">
                      {record.actualMinutes}/{record.mandatedMinutes} min
                    </p>
                    <div className="w-20 h-1.5 bg-gray-100 dark:bg-nebula-purple/20 rounded-full mt-1">
                      <div
                        className={`h-full rounded-full ${
                          record.status === "compliant"
                            ? "bg-aurora-green"
                            : record.status === "warning"
                            ? "bg-sunset-amber"
                            : "bg-coral-alert"
                        }`}
                        style={{ width: `${compliancePercent}%` }}
                      />
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${statusConfig.color} ${statusConfig.bg}`}>
                    {statusConfig.icon}
                    <span className="font-medium">{statusConfig.label}</span>
                  </div>
                </div>
              </div>
              {record.status === "violation" && (
                <div className="mt-2 p-2 rounded bg-coral-alert/5 border border-coral-alert/20 text-xs text-coral-alert flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Missing mandated break(s). Only {record.breaksTaken.length} of required breaks taken.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
