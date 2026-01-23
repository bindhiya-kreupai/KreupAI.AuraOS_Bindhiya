"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

type SlotStatus = "available" | "busy" | "selected";

interface DaySlots {
  day: string;
  date: string;
  slots: { time: string; status: SlotStatus }[];
}

const timeLabels = ["9:00", "9:30", "10:00", "10:30", "11:00", "11:30", "12:00", "1:00", "1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30", "5:00"];

const mockWeek: DaySlots[] = [
  { day: "Mon", date: "Jan 20", slots: timeLabels.map((time, i) => ({ time, status: (i % 3 === 0 ? "busy" : "available") as SlotStatus })) },
  { day: "Tue", date: "Jan 21", slots: timeLabels.map((time, i) => ({ time, status: (i % 4 === 1 ? "busy" : "available") as SlotStatus })) },
  { day: "Wed", date: "Jan 22", slots: timeLabels.map((time, i) => ({ time, status: (i % 5 === 2 ? "busy" : "available") as SlotStatus })) },
  { day: "Thu", date: "Jan 23", slots: timeLabels.map((time, i) => ({ time, status: (i % 3 === 2 ? "busy" : "available") as SlotStatus })) },
  { day: "Fri", date: "Jan 24", slots: timeLabels.map((time, i) => ({ time, status: (i % 4 === 0 ? "busy" : "available") as SlotStatus })) },
];

export default function CalendarSlotPicker() {
  const [weekData] = useState<DaySlots[]>(mockWeek);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());

  const toggleSlot = (dayIdx: number, slotIdx: number) => {
    const slot = weekData[dayIdx].slots[slotIdx];
    if (slot.status === "busy") return;
    const key = `${dayIdx}-${slotIdx}`;
    setSelectedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-celestial-indigo" />
          <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">Week View</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-lg border border-cloud dark:border-nebula-purple/50 text-silver-mist hover:text-ink-black dark:hover:text-pearl">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-ink-black dark:text-pearl">Jan 20 - 24, 2026</span>
          <button className="p-1.5 rounded-lg border border-cloud dark:border-nebula-purple/50 text-silver-mist hover:text-ink-black dark:hover:text-pearl">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs text-silver-mist">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700" />
          Available
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" />
          Busy
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-celestial-indigo border border-celestial-indigo" />
          Selected
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Day Headers */}
          <div className="grid grid-cols-[60px_repeat(5,1fr)] gap-1 mb-1">
            <div />
            {weekData.map((day) => (
              <div key={day.day} className="text-center">
                <p className="text-xs font-semibold text-ink-black dark:text-pearl">{day.day}</p>
                <p className="text-xs text-silver-mist">{day.date}</p>
              </div>
            ))}
          </div>

          {/* Time Rows */}
          {timeLabels.map((time, tIdx) => (
            <div key={time} className="grid grid-cols-[60px_repeat(5,1fr)] gap-1 mb-1">
              <div className="flex items-center justify-end pr-2">
                <span className="text-xs text-silver-mist">{time}</span>
              </div>
              {weekData.map((day, dIdx) => {
                const slot = day.slots[tIdx];
                const key = `${dIdx}-${tIdx}`;
                const isSelected = selectedSlots.has(key);
                return (
                  <button
                    key={key}
                    disabled={slot.status === "busy"}
                    onClick={() => toggleSlot(dIdx, tIdx)}
                    className={`h-7 rounded transition-colors ${
                      isSelected
                        ? "bg-celestial-indigo"
                        : slot.status === "busy"
                        ? "bg-gray-200 dark:bg-gray-700 cursor-not-allowed"
                        : "bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 cursor-pointer"
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {selectedSlots.size > 0 && (
        <div className="mt-4 pt-4 border-t border-cloud dark:border-nebula-purple/50">
          <p className="text-sm text-ink-black dark:text-pearl">
            <span className="font-medium">{selectedSlots.size}</span> slot(s) selected
          </p>
          <button className="mt-2 px-4 py-2 rounded-lg bg-celestial-indigo text-white text-sm font-medium hover:opacity-90 transition-opacity">
            Confirm Selection
          </button>
        </div>
      )}
    </div>
  );
}
