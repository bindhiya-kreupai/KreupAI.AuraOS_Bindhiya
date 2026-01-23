"use client";

import React, { useState } from "react";
import { Users, ChevronLeft, ChevronRight } from "lucide-react";

interface TimeBlock {
  start: string;
  end: string;
  status: "free" | "busy";
  label?: string;
}

interface InterviewerSchedule {
  id: string;
  name: string;
  role: string;
  initials: string;
  blocks: TimeBlock[];
}

const mockInterviewers: InterviewerSchedule[] = [
  {
    id: "1",
    name: "John Smith",
    role: "Engineering Manager",
    initials: "JS",
    blocks: [
      { start: "9:00", end: "10:00", status: "free" },
      { start: "10:00", end: "11:00", status: "busy", label: "Sprint Planning" },
      { start: "11:00", end: "12:00", status: "free" },
      { start: "1:00", end: "2:00", status: "free" },
      { start: "2:00", end: "3:00", status: "busy", label: "1:1 Meeting" },
      { start: "3:00", end: "5:00", status: "free" },
    ],
  },
  {
    id: "2",
    name: "Emily Chen",
    role: "Senior Engineer",
    initials: "EC",
    blocks: [
      { start: "9:00", end: "10:30", status: "busy", label: "Code Review" },
      { start: "10:30", end: "12:00", status: "free" },
      { start: "1:00", end: "3:00", status: "free" },
      { start: "3:00", end: "4:00", status: "busy", label: "Team Sync" },
      { start: "4:00", end: "5:00", status: "free" },
    ],
  },
  {
    id: "3",
    name: "Michael Brown",
    role: "Tech Lead",
    initials: "MB",
    blocks: [
      { start: "9:00", end: "11:00", status: "free" },
      { start: "11:00", end: "12:00", status: "busy", label: "Architecture Review" },
      { start: "1:00", end: "2:30", status: "free" },
      { start: "2:30", end: "3:30", status: "busy", label: "Design Discussion" },
      { start: "3:30", end: "5:00", status: "free" },
    ],
  },
  {
    id: "4",
    name: "Lisa Park",
    role: "Staff Engineer",
    initials: "LP",
    blocks: [
      { start: "9:00", end: "9:30", status: "busy", label: "Standup" },
      { start: "9:30", end: "12:00", status: "free" },
      { start: "1:00", end: "2:00", status: "busy", label: "Mentoring" },
      { start: "2:00", end: "5:00", status: "free" },
    ],
  },
];

export default function InterviewerAvailability() {
  const [selectedDay] = useState("Thursday, Jan 23, 2026");

  return (
    <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-celestial-indigo" />
          <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">Interviewer Availability</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1 rounded border border-cloud dark:border-nebula-purple/50 text-silver-mist hover:text-ink-black dark:hover:text-pearl">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-ink-black dark:text-pearl">{selectedDay}</span>
          <button className="p-1 rounded border border-cloud dark:border-nebula-purple/50 text-silver-mist hover:text-ink-black dark:hover:text-pearl">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs text-silver-mist">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-8 rounded bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700" />
          Free
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-8 rounded bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" />
          Busy
        </div>
      </div>

      {/* Interviewer List */}
      <div className="space-y-4">
        {mockInterviewers.map((interviewer) => (
          <div key={interviewer.id} className="p-4 rounded-lg border border-cloud dark:border-nebula-purple/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-xs font-bold text-celestial-indigo">
                {interviewer.initials}
              </div>
              <div>
                <p className="text-sm font-medium text-ink-black dark:text-pearl">{interviewer.name}</p>
                <p className="text-xs text-silver-mist">{interviewer.role}</p>
              </div>
            </div>
            {/* Time Blocks */}
            <div className="flex gap-1 flex-wrap">
              {interviewer.blocks.map((block, idx) => (
                <div
                  key={idx}
                  className={`flex-1 min-w-[80px] px-2 py-1.5 rounded text-center ${
                    block.status === "free"
                      ? "bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700"
                      : "bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <p className={`text-xs font-medium ${
                    block.status === "free" ? "text-green-700 dark:text-green-400" : "text-gray-600 dark:text-gray-300"
                  }`}>
                    {block.start} - {block.end}
                  </p>
                  {block.label && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{block.label}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
