"use client";

import React, { useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Copy,
  Plus,
  GripVertical,
  Users,
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface ShiftBlock {
  id: string;
  memberId: string;
  day: number;
  startHour: number;
  endHour: number;
  type: "morning" | "afternoon" | "night" | "flexible";
  label: string;
}

const mockMembers: TeamMember[] = [
  { id: "m-001", name: "Sarah Chen", role: "Team Lead", avatar: "SC" },
  { id: "m-002", name: "James Wilson", role: "Developer", avatar: "JW" },
  { id: "m-003", name: "Priya Sharma", role: "Designer", avatar: "PS" },
  { id: "m-004", name: "Marcus Lee", role: "QA Engineer", avatar: "ML" },
  { id: "m-005", name: "Anna Kowalski", role: "Support", avatar: "AK" },
];

const mockShifts: ShiftBlock[] = [
  { id: "s-001", memberId: "m-001", day: 0, startHour: 9, endHour: 17, type: "morning", label: "9AM-5PM" },
  { id: "s-002", memberId: "m-001", day: 1, startHour: 9, endHour: 17, type: "morning", label: "9AM-5PM" },
  { id: "s-003", memberId: "m-001", day: 2, startHour: 9, endHour: 17, type: "morning", label: "9AM-5PM" },
  { id: "s-004", memberId: "m-001", day: 3, startHour: 9, endHour: 17, type: "morning", label: "9AM-5PM" },
  { id: "s-005", memberId: "m-001", day: 4, startHour: 9, endHour: 17, type: "morning", label: "9AM-5PM" },
  { id: "s-006", memberId: "m-002", day: 0, startHour: 10, endHour: 18, type: "morning", label: "10AM-6PM" },
  { id: "s-007", memberId: "m-002", day: 1, startHour: 10, endHour: 18, type: "morning", label: "10AM-6PM" },
  { id: "s-008", memberId: "m-002", day: 2, startHour: 14, endHour: 22, type: "afternoon", label: "2PM-10PM" },
  { id: "s-009", memberId: "m-002", day: 3, startHour: 10, endHour: 18, type: "morning", label: "10AM-6PM" },
  { id: "s-010", memberId: "m-002", day: 4, startHour: 10, endHour: 18, type: "morning", label: "10AM-6PM" },
  { id: "s-011", memberId: "m-003", day: 0, startHour: 8, endHour: 16, type: "morning", label: "8AM-4PM" },
  { id: "s-012", memberId: "m-003", day: 1, startHour: 8, endHour: 16, type: "morning", label: "8AM-4PM" },
  { id: "s-013", memberId: "m-003", day: 3, startHour: 8, endHour: 16, type: "morning", label: "8AM-4PM" },
  { id: "s-014", memberId: "m-003", day: 4, startHour: 8, endHour: 16, type: "morning", label: "8AM-4PM" },
  { id: "s-015", memberId: "m-004", day: 1, startHour: 22, endHour: 6, type: "night", label: "10PM-6AM" },
  { id: "s-016", memberId: "m-004", day: 2, startHour: 22, endHour: 6, type: "night", label: "10PM-6AM" },
  { id: "s-017", memberId: "m-004", day: 3, startHour: 22, endHour: 6, type: "night", label: "10PM-6AM" },
  { id: "s-018", memberId: "m-004", day: 4, startHour: 22, endHour: 6, type: "night", label: "10PM-6AM" },
  { id: "s-019", memberId: "m-005", day: 0, startHour: 9, endHour: 13, type: "flexible", label: "9AM-1PM" },
  { id: "s-020", memberId: "m-005", day: 2, startHour: 9, endHour: 13, type: "flexible", label: "9AM-1PM" },
  { id: "s-021", memberId: "m-005", day: 4, startHour: 9, endHour: 13, type: "flexible", label: "9AM-1PM" },
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const shiftColors: Record<ShiftBlock["type"], string> = {
  morning: "bg-celestial-indigo/20 border-celestial-indigo/40 text-celestial-indigo",
  afternoon: "bg-sunset-amber/20 border-sunset-amber/40 text-sunset-amber",
  night: "bg-purple-200 dark:bg-purple-900/30 border-purple-400 dark:border-purple-500/40 text-purple-700 dark:text-purple-300",
  flexible: "bg-aurora-green/20 border-aurora-green/40 text-aurora-green",
};

export default function VisualScheduleBuilder() {
  const [currentWeek] = useState("Jan 20 - Jan 26, 2026");
  const [dragOver, setDragOver] = useState<{ memberId: string; day: number } | null>(null);

  const getShiftsForCell = (memberId: string, day: number) => {
    return mockShifts.filter((s) => s.memberId === memberId && s.day === day);
  };

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-celestial-indigo/10 rounded-lg">
            <Calendar className="w-5 h-5 text-celestial-indigo" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">
              Visual Schedule Builder
            </h2>
            <p className="text-sm text-silver-mist">
              Drag and drop shift assignments
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-cloud dark:border-nebula-purple/50 rounded-lg text-ink-black dark:text-pearl hover:border-celestial-indigo/30 transition-colors">
            <Copy className="w-4 h-4" />
            Copy Week
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm bg-celestial-indigo text-white rounded-lg hover:bg-celestial-indigo/90 transition-colors">
            <Plus className="w-4 h-4" />
            Add Shift
          </button>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-nebula-purple/10 text-silver-mist">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-medium text-ink-black dark:text-pearl">
          {currentWeek}
        </span>
        <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-nebula-purple/10 text-silver-mist">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-celestial-indigo/20 border border-celestial-indigo/40" />
          <span className="text-silver-mist">Morning</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-sunset-amber/20 border border-sunset-amber/40" />
          <span className="text-silver-mist">Afternoon</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-purple-200 border border-purple-400" />
          <span className="text-silver-mist">Night</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-aurora-green/20 border border-aurora-green/40" />
          <span className="text-silver-mist">Flexible</span>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header Row */}
          <div className="grid grid-cols-8 gap-px bg-cloud dark:bg-nebula-purple/30 rounded-t-lg overflow-hidden">
            <div className="bg-gray-50 dark:bg-stellar-blue/80 p-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-silver-mist" />
              <span className="text-xs font-semibold text-silver-mist">Team</span>
            </div>
            {days.map((day, i) => (
              <div
                key={day}
                className="bg-gray-50 dark:bg-stellar-blue/80 p-3 text-center"
              >
                <span className="text-xs font-semibold text-ink-black dark:text-pearl">
                  {day}
                </span>
                <p className="text-xs text-silver-mist">{20 + i}</p>
              </div>
            ))}
          </div>

          {/* Member Rows */}
          <div className="border border-cloud dark:border-nebula-purple/50 rounded-b-lg overflow-hidden">
            {mockMembers.map((member) => (
              <div
                key={member.id}
                className="grid grid-cols-8 gap-px bg-cloud dark:bg-nebula-purple/30"
              >
                {/* Member Info */}
                <div className="bg-white dark:bg-stellar-blue p-3 flex items-center gap-2">
                  <GripVertical className="w-3 h-3 text-silver-mist cursor-grab" />
                  <div className="w-7 h-7 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-xs font-medium text-celestial-indigo">
                    {member.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-ink-black dark:text-pearl truncate">
                      {member.name}
                    </p>
                    <p className="text-[10px] text-silver-mist">{member.role}</p>
                  </div>
                </div>

                {/* Day Cells */}
                {days.map((_, dayIndex) => {
                  const shifts = getShiftsForCell(member.id, dayIndex);
                  const isDragOver =
                    dragOver?.memberId === member.id && dragOver?.day === dayIndex;
                  return (
                    <div
                      key={dayIndex}
                      className={`bg-white dark:bg-stellar-blue p-1.5 min-h-[60px] transition-colors ${
                        isDragOver ? "bg-celestial-indigo/5" : ""
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver({ memberId: member.id, day: dayIndex });
                      }}
                      onDragLeave={() => setDragOver(null)}
                      onDrop={() => setDragOver(null)}
                    >
                      {shifts.map((shift) => (
                        <div
                          key={shift.id}
                          draggable
                          className={`p-1.5 rounded text-[10px] font-medium border cursor-grab active:cursor-grabbing ${
                            shiftColors[shift.type]
                          }`}
                        >
                          {shift.label}
                        </div>
                      ))}
                      {shifts.length === 0 && (
                        <div className="h-full min-h-[40px] flex items-center justify-center">
                          <Plus className="w-3.5 h-3.5 text-gray-300 dark:text-nebula-purple/30 opacity-0 hover:opacity-100 transition-opacity cursor-pointer" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
