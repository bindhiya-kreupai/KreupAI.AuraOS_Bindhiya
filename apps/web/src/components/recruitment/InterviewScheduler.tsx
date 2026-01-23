"use client";

import React, { useState } from "react";
import { Calendar, Clock, User, Users, Briefcase } from "lucide-react";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface Interviewer {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface SchedulerData {
  candidateName: string;
  position: string;
  interviewType: string;
  timeSlots: TimeSlot[];
  interviewers: Interviewer[];
}

const mockData: SchedulerData = {
  candidateName: "Sarah Johnson",
  position: "Senior Full-Stack Engineer",
  interviewType: "Technical Round 2",
  timeSlots: [
    { time: "9:00 AM", available: true },
    { time: "9:30 AM", available: true },
    { time: "10:00 AM", available: false },
    { time: "10:30 AM", available: true },
    { time: "11:00 AM", available: true },
    { time: "11:30 AM", available: false },
    { time: "1:00 PM", available: true },
    { time: "1:30 PM", available: true },
    { time: "2:00 PM", available: true },
    { time: "2:30 PM", available: false },
    { time: "3:00 PM", available: true },
    { time: "3:30 PM", available: true },
  ],
  interviewers: [
    { id: "1", name: "John Smith", role: "Engineering Manager", avatar: "JS" },
    { id: "2", name: "Emily Chen", role: "Senior Engineer", avatar: "EC" },
    { id: "3", name: "Michael Brown", role: "Tech Lead", avatar: "MB" },
    { id: "4", name: "Lisa Park", role: "Staff Engineer", avatar: "LP" },
  ],
};

export default function InterviewScheduler() {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedInterviewers, setSelectedInterviewers] = useState<string[]>([]);
  const { candidateName, position, interviewType, timeSlots, interviewers } = mockData;

  const toggleInterviewer = (id: string) => {
    setSelectedInterviewers((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-5 w-5 text-celestial-indigo" />
        <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">Interview Scheduler</h2>
      </div>

      {/* Candidate Info */}
      <div className="mb-6 p-4 rounded-lg border border-cloud dark:border-nebula-purple/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-celestial-indigo/10 flex items-center justify-center">
            <User className="h-5 w-5 text-celestial-indigo" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-black dark:text-pearl">{candidateName}</p>
            <div className="flex items-center gap-2 text-xs text-silver-mist">
              <Briefcase className="h-3 w-3" />
              {position}
            </div>
          </div>
          <span className="ml-auto px-2.5 py-1 rounded-full text-xs font-medium bg-celestial-indigo/10 text-celestial-indigo">
            {interviewType}
          </span>
        </div>
      </div>

      {/* Time Slots Grid */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-ink-black dark:text-pearl mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-celestial-indigo" />
          Available Time Slots - Today
        </h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {timeSlots.map((slot) => (
            <button
              key={slot.time}
              disabled={!slot.available}
              onClick={() => setSelectedSlot(slot.time)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                !slot.available
                  ? "bg-gray-100 dark:bg-gray-800 text-silver-mist cursor-not-allowed"
                  : selectedSlot === slot.time
                  ? "bg-celestial-indigo text-white"
                  : "border border-cloud dark:border-nebula-purple/50 text-ink-black dark:text-pearl hover:border-celestial-indigo"
              }`}
            >
              {slot.time}
            </button>
          ))}
        </div>
      </div>

      {/* Interviewer Selection */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-ink-black dark:text-pearl mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-celestial-indigo" />
          Select Interviewers
        </h4>
        <div className="space-y-2">
          {interviewers.map((interviewer) => (
            <label
              key={interviewer.id}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedInterviewers.includes(interviewer.id)
                  ? "border-celestial-indigo bg-celestial-indigo/5"
                  : "border-cloud dark:border-nebula-purple/50"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedInterviewers.includes(interviewer.id)}
                onChange={() => toggleInterviewer(interviewer.id)}
                className="sr-only"
              />
              <div className="h-8 w-8 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-xs font-bold text-celestial-indigo">
                {interviewer.avatar}
              </div>
              <div>
                <p className="text-sm font-medium text-ink-black dark:text-pearl">{interviewer.name}</p>
                <p className="text-xs text-silver-mist">{interviewer.role}</p>
              </div>
              {selectedInterviewers.includes(interviewer.id) && (
                <div className="ml-auto h-5 w-5 rounded-full bg-celestial-indigo flex items-center justify-center">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Schedule Button */}
      <button
        disabled={!selectedSlot || selectedInterviewers.length === 0}
        className="w-full py-2.5 rounded-lg bg-celestial-indigo text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        Schedule Interview
      </button>
    </div>
  );
}
