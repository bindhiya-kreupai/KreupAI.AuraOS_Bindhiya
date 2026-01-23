"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Repeat,
  FileText,
  User,
  Save,
  X,
} from "lucide-react";

interface Employee {
  id: string;
  name: string;
  role: string;
}

interface ScheduleFormData {
  employeeId: string;
  date: string;
  time: string;
  recurring: "none" | "weekly" | "biweekly" | "monthly";
  agendaTemplate: string;
  notes: string;
}

const mockEmployees: Employee[] = [
  { id: "1", name: "Sarah Chen", role: "Senior Developer" },
  { id: "2", name: "James Wilson", role: "Product Designer" },
  { id: "3", name: "Maria Rodriguez", role: "QA Engineer" },
  { id: "4", name: "Alex Thompson", role: "Frontend Developer" },
  { id: "5", name: "Priya Patel", role: "DevOps Engineer" },
  { id: "6", name: "David Kim", role: "Backend Developer" },
];

const agendaTemplates = [
  { id: "weekly", name: "Weekly Check-in" },
  { id: "career", name: "Career Development" },
  { id: "performance", name: "Performance Review" },
  { id: "project", name: "Project Update" },
  { id: "custom", name: "Custom Agenda" },
];

export default function MeetingScheduler() {
  const [formData, setFormData] = useState<ScheduleFormData>({
    employeeId: "",
    date: "",
    time: "",
    recurring: "none",
    agendaTemplate: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ScheduleFormData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ScheduleFormData, string>> = {};
    if (!formData.employeeId) newErrors.employeeId = "Please select an employee";
    if (!formData.date) newErrors.date = "Please select a date";
    if (!formData.time) newErrors.time = "Please select a time";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      console.log("Scheduling meeting:", formData);
      setFormData({
        employeeId: "",
        date: "",
        time: "",
        recurring: "none",
        agendaTemplate: "",
        notes: "",
      });
      setErrors({});
    }
  };

  const handleReset = () => {
    setFormData({
      employeeId: "",
      date: "",
      time: "",
      recurring: "none",
      agendaTemplate: "",
      notes: "",
    });
    setErrors({});
  };

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-6 h-6 text-celestial-indigo" />
        <h2 className="text-xl font-semibold text-ink-black dark:text-pearl">
          Schedule 1:1 Meeting
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-ink-black dark:text-pearl mb-2">
            <User className="w-4 h-4 text-silver-mist" />
            Select Employee
          </label>
          <select
            value={formData.employeeId}
            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
            className="w-full px-4 py-2.5 text-sm border border-cloud dark:border-nebula-purple/50 rounded-lg bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50"
          >
            <option value="">Choose an employee...</option>
            {mockEmployees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} - {emp.role}
              </option>
            ))}
          </select>
          {errors.employeeId && (
            <p className="mt-1 text-xs text-coral-alert">{errors.employeeId}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-ink-black dark:text-pearl mb-2">
              <Calendar className="w-4 h-4 text-silver-mist" />
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2.5 text-sm border border-cloud dark:border-nebula-purple/50 rounded-lg bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50"
            />
            {errors.date && (
              <p className="mt-1 text-xs text-coral-alert">{errors.date}</p>
            )}
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-ink-black dark:text-pearl mb-2">
              <Clock className="w-4 h-4 text-silver-mist" />
              Time
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-4 py-2.5 text-sm border border-cloud dark:border-nebula-purple/50 rounded-lg bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50"
            />
            {errors.time && (
              <p className="mt-1 text-xs text-coral-alert">{errors.time}</p>
            )}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-ink-black dark:text-pearl mb-2">
            <Repeat className="w-4 h-4 text-silver-mist" />
            Recurring Schedule
          </label>
          <div className="flex flex-wrap gap-2">
            {(["none", "weekly", "biweekly", "monthly"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFormData({ ...formData, recurring: option })}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                  formData.recurring === option
                    ? "border-celestial-indigo bg-celestial-indigo/10 text-celestial-indigo font-medium"
                    : "border-cloud dark:border-nebula-purple/50 text-ink-black dark:text-pearl hover:border-celestial-indigo/50"
                }`}
              >
                {option === "none"
                  ? "One-time"
                  : option === "biweekly"
                  ? "Bi-weekly"
                  : option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-ink-black dark:text-pearl mb-2">
            <FileText className="w-4 h-4 text-silver-mist" />
            Agenda Template
          </label>
          <select
            value={formData.agendaTemplate}
            onChange={(e) => setFormData({ ...formData, agendaTemplate: e.target.value })}
            className="w-full px-4 py-2.5 text-sm border border-cloud dark:border-nebula-purple/50 rounded-lg bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50"
          >
            <option value="">No template (blank agenda)</option>
            {agendaTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-ink-black dark:text-pearl mb-2 block">
            Pre-meeting Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            placeholder="Add any notes or topics you would like to discuss..."
            className="w-full px-4 py-2.5 text-sm border border-cloud dark:border-nebula-purple/50 rounded-lg bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 resize-none"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-celestial-indigo rounded-lg hover:opacity-90 transition-opacity"
          >
            <Save className="w-4 h-4" />
            Schedule Meeting
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-silver-mist border border-cloud dark:border-nebula-purple/50 rounded-lg hover:text-ink-black dark:hover:text-pearl transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
