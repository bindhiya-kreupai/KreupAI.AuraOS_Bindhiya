"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Link,
  Users,
  CalendarPlus,
  RefreshCw,
  CheckCircle,
  Mail,
  Video,
} from "lucide-react";

type InterviewFormat = "in-person" | "video" | "phone";

interface InterviewParticipant {
  id: string;
  name: string;
  role: string;
  email: string;
  confirmed: boolean;
}

interface InterviewDetails {
  id: string;
  title: string;
  candidateName: string;
  position: string;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  format: InterviewFormat;
  location?: string;
  meetingLink?: string;
  participants: InterviewParticipant[];
  notes?: string;
}

interface InterviewConfirmationProps {
  interview?: InterviewDetails;
  onAddToCalendar?: (id: string) => void;
  onReschedule?: (id: string) => void;
}

const mockInterview: InterviewDetails = {
  id: "int-001",
  title: "Technical Interview - Round 2",
  candidateName: "Sarah Johnson",
  position: "Senior Full-Stack Engineer",
  date: "2026-01-28",
  startTime: "10:00 AM",
  endTime: "11:00 AM",
  timezone: "PST (UTC-8)",
  format: "video",
  meetingLink: "https://meet.auraos.com/interview-abc123",
  participants: [
    {
      id: "ip-1",
      name: "Sarah Johnson",
      role: "Candidate",
      email: "sarah.johnson@email.com",
      confirmed: true,
    },
    {
      id: "ip-2",
      name: "Michael Roberts",
      role: "Hiring Manager",
      email: "m.roberts@company.com",
      confirmed: true,
    },
    {
      id: "ip-3",
      name: "Lisa Chen",
      role: "Technical Lead",
      email: "l.chen@company.com",
      confirmed: true,
    },
    {
      id: "ip-4",
      name: "James Wilson",
      role: "HR Coordinator",
      email: "j.wilson@company.com",
      confirmed: false,
    },
  ],
  notes: "Please prepare a 10-minute presentation on a recent technical project. Focus on system design decisions and trade-offs.",
};

const formatConfig: Record<InterviewFormat, { icon: typeof Video; label: string }> = {
  "in-person": { icon: MapPin, label: "In-Person" },
  video: { icon: Video, label: "Video Call" },
  phone: { icon: Mail, label: "Phone" },
};

export function InterviewConfirmation({
  interview = mockInterview,
  onAddToCalendar,
  onReschedule,
}: InterviewConfirmationProps) {
  const [calendarAdded, setCalendarAdded] = useState(false);

  const FormatIcon = formatConfig[interview.format].icon;
  const confirmedCount = interview.participants.filter((p) => p.confirmed).length;

  const handleAddToCalendar = () => {
    setCalendarAdded(true);
    onAddToCalendar?.(interview.id);
  };

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 overflow-hidden">
      {/* Confirmation Header */}
      <div className="p-5 border-b border-cloud dark:border-nebula-purple/50 bg-slate-50 dark:bg-deep-cosmos">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="text-lg font-semibold text-ink-black dark:text-pearl">
            Interview Confirmed
          </h3>
        </div>
        <p className="text-sm text-ink-black dark:text-pearl">{interview.title}</p>
        <p className="text-xs text-silver-mist mt-1">
          {interview.candidateName} - {interview.position}
        </p>
      </div>

      {/* Date and Time */}
      <div className="p-5 border-b border-cloud dark:border-nebula-purple/50">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-celestial-indigo/10 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-celestial-indigo" />
            </div>
            <div>
              <p className="text-xs text-silver-mist mb-0.5">Date</p>
              <p className="text-sm font-medium text-ink-black dark:text-pearl">
                {new Date(interview.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-celestial-indigo/10 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-celestial-indigo" />
            </div>
            <div>
              <p className="text-xs text-silver-mist mb-0.5">Time</p>
              <p className="text-sm font-medium text-ink-black dark:text-pearl">
                {interview.startTime} - {interview.endTime}
              </p>
              <p className="text-xs text-silver-mist">{interview.timezone}</p>
            </div>
          </div>
        </div>

        {/* Location / Meeting Link */}
        <div className="mt-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-celestial-indigo/10 flex items-center justify-center flex-shrink-0">
            <FormatIcon className="w-4 h-4 text-celestial-indigo" />
          </div>
          <div>
            <p className="text-xs text-silver-mist mb-0.5">
              {formatConfig[interview.format].label}
            </p>
            {interview.location && (
              <p className="text-sm font-medium text-ink-black dark:text-pearl">
                {interview.location}
              </p>
            )}
            {interview.meetingLink && (
              <a
                href={interview.meetingLink}
                className="inline-flex items-center gap-1 text-sm font-medium text-celestial-indigo hover:underline"
              >
                <Link className="w-3.5 h-3.5" />
                Join Meeting
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Participants */}
      <div className="p-5 border-b border-cloud dark:border-nebula-purple/50">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-celestial-indigo" />
          <h4 className="text-sm font-semibold text-ink-black dark:text-pearl">
            Participants
          </h4>
          <span className="ml-auto text-xs text-silver-mist">
            {confirmedCount}/{interview.participants.length} confirmed
          </span>
        </div>
        <div className="space-y-2">
          {interview.participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-deep-cosmos"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-celestial-indigo/10 flex items-center justify-center">
                  <span className="text-xs font-medium text-celestial-indigo">
                    {participant.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-ink-black dark:text-pearl">
                    {participant.name}
                  </p>
                  <p className="text-[10px] text-silver-mist">{participant.role}</p>
                </div>
              </div>
              <span
                className={`text-xs font-medium ${
                  participant.confirmed
                    ? "text-green-600 dark:text-green-400"
                    : "text-yellow-600 dark:text-yellow-400"
                }`}
              >
                {participant.confirmed ? "Confirmed" : "Pending"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      {interview.notes && (
        <div className="px-5 py-4 border-b border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist mb-1">Notes</p>
          <p className="text-sm text-ink-black dark:text-pearl">{interview.notes}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-5 flex items-center gap-3">
        <button
          onClick={handleAddToCalendar}
          disabled={calendarAdded}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
            calendarAdded
              ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 cursor-default"
              : "bg-celestial-indigo text-white hover:opacity-90"
          }`}
        >
          {calendarAdded ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Added to Calendar
            </>
          ) : (
            <>
              <CalendarPlus className="w-4 h-4" />
              Add to Calendar
            </>
          )}
        </button>
        <button
          onClick={() => onReschedule?.(interview.id)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-cloud dark:border-nebula-purple/50 text-ink-black dark:text-pearl hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Reschedule
        </button>
      </div>
    </div>
  );
}
