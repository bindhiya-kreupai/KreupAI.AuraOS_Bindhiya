"use client";

import React, { useState } from "react";
import {
  Clock,
  Calendar,
  FileText,
  Mail,
  Plus,
  X,
  ChevronDown,
  Bell,
  Download,
} from "lucide-react";

interface ScheduleConfig {
  id: string;
  reportName: string;
  frequency: "daily" | "weekly" | "monthly";
  time: string;
  dayOfWeek?: string;
  dayOfMonth?: number;
  format: "pdf" | "excel" | "csv";
  recipients: string[];
  isActive: boolean;
  lastRun?: string;
  nextRun: string;
}

const mockSchedules: ScheduleConfig[] = [
  {
    id: "sched-001",
    reportName: "Weekly Attendance Summary",
    frequency: "weekly",
    time: "08:00",
    dayOfWeek: "Monday",
    format: "pdf",
    recipients: ["hr@company.com", "manager@company.com"],
    isActive: true,
    lastRun: "2026-01-20T08:00:00Z",
    nextRun: "2026-01-27T08:00:00Z",
  },
  {
    id: "sched-002",
    reportName: "Monthly Payroll Report",
    frequency: "monthly",
    time: "06:00",
    dayOfMonth: 1,
    format: "excel",
    recipients: ["finance@company.com", "hr@company.com"],
    isActive: true,
    lastRun: "2026-01-01T06:00:00Z",
    nextRun: "2026-02-01T06:00:00Z",
  },
  {
    id: "sched-003",
    reportName: "Daily Time Exceptions",
    frequency: "daily",
    time: "18:00",
    format: "csv",
    recipients: ["supervisor@company.com"],
    isActive: true,
    lastRun: "2026-01-22T18:00:00Z",
    nextRun: "2026-01-23T18:00:00Z",
  },
  {
    id: "sched-004",
    reportName: "Quarterly Compliance Audit",
    frequency: "monthly",
    time: "09:00",
    dayOfMonth: 15,
    format: "pdf",
    recipients: ["compliance@company.com", "legal@company.com"],
    isActive: false,
    lastRun: "2025-12-15T09:00:00Z",
    nextRun: "2026-01-15T09:00:00Z",
  },
];

const frequencies = ["daily", "weekly", "monthly"] as const;
const formats = ["pdf", "excel", "csv"] as const;
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function ReportScheduler() {
  const [schedules, setSchedules] = useState<ScheduleConfig[]>(mockSchedules);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newRecipient, setNewRecipient] = useState("");
  const [newSchedule, setNewSchedule] = useState<Partial<ScheduleConfig>>({
    frequency: "weekly",
    time: "08:00",
    dayOfWeek: "Monday",
    format: "pdf",
    recipients: [],
  });

  const toggleSchedule = (id: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const addRecipient = () => {
    if (newRecipient && newRecipient.includes("@")) {
      setNewSchedule({
        ...newSchedule,
        recipients: [...(newSchedule.recipients || []), newRecipient],
      });
      setNewRecipient("");
    }
  };

  const removeRecipient = (email: string) => {
    setNewSchedule({
      ...newSchedule,
      recipients: (newSchedule.recipients || []).filter((r) => r !== email),
    });
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "pdf":
        return <FileText className="w-3.5 h-3.5 text-coral-alert" />;
      case "excel":
        return <FileText className="w-3.5 h-3.5 text-aurora-green" />;
      case "csv":
        return <FileText className="w-3.5 h-3.5 text-celestial-indigo" />;
      default:
        return <FileText className="w-3.5 h-3.5" />;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-celestial-indigo/10 rounded-lg">
            <Clock className="w-5 h-5 text-celestial-indigo" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">
              Report Scheduler
            </h2>
            <p className="text-sm text-silver-mist">
              Configure automated report generation and delivery
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-celestial-indigo text-white rounded-lg hover:bg-celestial-indigo/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Schedule
        </button>
      </div>

      {/* New Schedule Form */}
      {showNewForm && (
        <div className="mb-6 p-4 border border-celestial-indigo/20 bg-celestial-indigo/5 rounded-lg">
          <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-4">
            New Report Schedule
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-ink-black dark:text-pearl block mb-1.5">
                Report Name
              </label>
              <input
                type="text"
                placeholder="Enter report name"
                className="w-full px-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-black dark:text-pearl block mb-1.5">
                Frequency
              </label>
              <select
                value={newSchedule.frequency}
                onChange={(e) => setNewSchedule({ ...newSchedule, frequency: e.target.value as ScheduleConfig["frequency"] })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl"
              >
                {frequencies.map((f) => (
                  <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-ink-black dark:text-pearl block mb-1.5">
                Time
              </label>
              <input
                type="time"
                value={newSchedule.time}
                onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl"
              />
            </div>
            {newSchedule.frequency === "weekly" && (
              <div>
                <label className="text-xs font-medium text-ink-black dark:text-pearl block mb-1.5">
                  Day of Week
                </label>
                <select
                  value={newSchedule.dayOfWeek}
                  onChange={(e) => setNewSchedule({ ...newSchedule, dayOfWeek: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl"
                >
                  {daysOfWeek.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            )}
            {newSchedule.frequency === "monthly" && (
              <div>
                <label className="text-xs font-medium text-ink-black dark:text-pearl block mb-1.5">
                  Day of Month
                </label>
                <input
                  type="number"
                  min={1}
                  max={28}
                  value={newSchedule.dayOfMonth || 1}
                  onChange={(e) => setNewSchedule({ ...newSchedule, dayOfMonth: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-ink-black dark:text-pearl block mb-1.5">
                Format
              </label>
              <select
                value={newSchedule.format}
                onChange={(e) => setNewSchedule({ ...newSchedule, format: e.target.value as ScheduleConfig["format"] })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl"
              >
                {formats.map((f) => (
                  <option key={f} value={f}>{f.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-ink-black dark:text-pearl block mb-1.5">
                Recipients
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="email"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  placeholder="email@company.com"
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl"
                  onKeyDown={(e) => e.key === "Enter" && addRecipient()}
                />
                <button
                  onClick={addRecipient}
                  className="px-3 py-2 text-sm bg-celestial-indigo text-white rounded-lg hover:bg-celestial-indigo/90"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(newSchedule.recipients || []).map((email) => (
                  <span
                    key={email}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-celestial-indigo/10 text-celestial-indigo rounded-full"
                  >
                    <Mail className="w-3 h-3" />
                    {email}
                    <button onClick={() => removeRecipient(email)}>
                      <X className="w-3 h-3 hover:text-coral-alert" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowNewForm(false)}
              className="px-3 py-2 text-sm border border-cloud dark:border-nebula-purple/50 rounded-lg text-ink-black dark:text-pearl"
            >
              Cancel
            </button>
            <button className="px-4 py-2 text-sm bg-celestial-indigo text-white rounded-lg hover:bg-celestial-indigo/90">
              Create Schedule
            </button>
          </div>
        </div>
      )}

      {/* Existing Schedules */}
      <div className="space-y-3">
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="p-4 rounded-lg border border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo/30 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-celestial-indigo/10 rounded-lg mt-0.5">
                  <Bell className="w-4 h-4 text-celestial-indigo" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-ink-black dark:text-pearl">
                    {schedule.reportName}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-silver-mist">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {schedule.frequency === "daily" && "Every day"}
                      {schedule.frequency === "weekly" && `Every ${schedule.dayOfWeek}`}
                      {schedule.frequency === "monthly" && `Day ${schedule.dayOfMonth} of month`}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {schedule.time}
                    </span>
                    <span className="flex items-center gap-1">
                      {getFormatIcon(schedule.format)}
                      {schedule.format.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {schedule.recipients.map((r) => (
                      <span
                        key={r}
                        className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-nebula-purple/10 text-silver-mist rounded-full"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    {schedule.lastRun && (
                      <span className="text-silver-mist">
                        Last: {formatDate(schedule.lastRun)}
                      </span>
                    )}
                    <span className="text-celestial-indigo">
                      Next: {formatDate(schedule.nextRun)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-1.5 text-silver-mist hover:text-celestial-indigo rounded transition-colors">
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleSchedule(schedule.id)}
                  className={`w-9 h-5 rounded-full relative transition-colors ${
                    schedule.isActive ? "bg-aurora-green" : "bg-gray-300 dark:bg-nebula-purple/50"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                      schedule.isActive ? "left-4" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
