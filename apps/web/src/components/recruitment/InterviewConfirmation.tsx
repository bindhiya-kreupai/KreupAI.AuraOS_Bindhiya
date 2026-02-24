/**
 * @module InterviewConfirmation
 * @description Interview confirmation preview with email template, calendar invite
 *              details, and send actions for both candidate and interviewers
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Mail,
  Calendar,
  Clock,
  MapPin,
  Video,
  User,
  Send,
  Copy,
  CheckCircle2,
  Edit3,
  Briefcase,
  Bell,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────────

export interface ConfirmationData {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  interviewType: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "10:00 AM"
  endTime: string; // e.g. "11:00 AM"
  duration: number; // minutes
  timezone: string;
  location?: string;
  meetingLink?: string;
  interviewers: { name: string; email: string; role: string }[];
  notes?: string;
  calendarProvider?: 'google' | 'outlook';
}

interface InterviewConfirmationProps {
  data: ConfirmationData;
  onSendConfirmation: () => void;
  onEdit: () => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────────

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

// ── Component ────────────────────────────────────────────────────────────────────

export const InterviewConfirmation: React.FC<InterviewConfirmationProps> = ({
  data,
  onSendConfirmation,
  onEdit,
}) => {
  const [sendToCandidate, setSendToCandidate] = useState(true);
  const [sendToInterviewers, setSendToInterviewers] = useState(true);
  const [addCalendarInvite, setAddCalendarInvite] = useState(true);
  const [copied, setCopied] = useState(false);

  const emailSubject = useMemo(() => `Interview Invitation – ${data.jobTitle}`, [data.jobTitle]);

  const emailBody = useMemo(() => {
    const lines = [
      `Dear ${data.candidateName},`,
      '',
      `We are pleased to invite you for a ${data.interviewType} interview for the position of ${data.jobTitle}.`,
      '',
      'Interview Details:',
      `• Date: ${formatDate(data.date)}`,
      `• Time: ${data.startTime} – ${data.endTime} (${data.timezone})`,
      `• Duration: ${data.duration} minutes`,
    ];

    if (data.meetingLink) {
      lines.push(`• Meeting Link: ${data.meetingLink}`);
    }
    if (data.location) {
      lines.push(`• Location: ${data.location}`);
    }

    lines.push('', 'Interview Panel:');
    data.interviewers.forEach((i) => {
      lines.push(`• ${i.name} (${i.role})`);
    });

    if (data.notes) {
      lines.push('', 'Additional Notes:', data.notes);
    }

    lines.push(
      '',
      'Please confirm your attendance by replying to this email.',
      '',
      'Best regards,',
      'AURA Recruitment Team'
    );

    return lines.join('\n');
  }, [data]);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Interview Summary Card */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-neural-mint" />
            Interview Scheduled
          </p>
          <button
            onClick={onEdit}
            className="flex items-center gap-1 text-[10px] font-semibold text-celestial-indigo hover:text-celestial-indigo/80 transition-colors"
          >
            <Edit3 className="w-3 h-3" /> Edit
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <DetailCell icon={User} label="Candidate" value={data.candidateName} />
          <DetailCell icon={Briefcase} label="Position" value={data.jobTitle} />
          <DetailCell icon={Calendar} label="Date" value={formatDate(data.date)} />
          <DetailCell icon={Clock} label="Time" value={`${data.startTime} – ${data.endTime}`} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <DetailCell icon={Clock} label="Duration" value={`${data.duration} min`} />
          <DetailCell icon={Calendar} label="Type" value={data.interviewType} />
          {data.meetingLink && <DetailCell icon={Video} label="Meeting" value="Video Call" />}
          {data.location && <DetailCell icon={MapPin} label="Location" value={data.location} />}
        </div>

        {/* Interviewers */}
        <div>
          <p className="text-[9px] font-bold text-silver-mist uppercase tracking-wider mb-1.5">
            Panel
          </p>
          <div className="flex flex-wrap gap-1.5">
            {data.interviewers.map((i, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-cloud dark:border-nebula-purple/20 bg-pearl/20 dark:bg-deep-cosmos/10"
              >
                <div className="w-5 h-5 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-[8px] font-bold text-celestial-indigo">
                  {i.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-ink-black dark:text-pearl">
                    {i.name}
                  </p>
                  <p className="text-[7px] text-silver-mist">{i.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Email Preview */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <Mail className="w-4 h-4 text-celestial-indigo" />
            Confirmation Email Preview
          </p>
          <button
            onClick={handleCopyEmail}
            className="flex items-center gap-1 text-[10px] font-semibold text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors"
          >
            {copied ? (
              <CheckCircle2 className="w-3 h-3 text-neural-mint" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        {/* Subject */}
        <div className="px-3 py-2 rounded-lg bg-pearl/30 dark:bg-deep-cosmos/10">
          <p className="text-[9px] text-silver-mist">Subject</p>
          <p className="text-[11px] font-semibold text-ink-black dark:text-pearl">{emailSubject}</p>
        </div>

        {/* Recipients */}
        <div className="flex items-center gap-3 text-[10px]">
          <span className="text-silver-mist">To:</span>
          <span className="font-semibold text-ink-black dark:text-pearl">
            {data.candidateEmail}
          </span>
          {data.interviewers.length > 0 && (
            <>
              <span className="text-silver-mist">CC:</span>
              <span className="text-ink-black dark:text-pearl">
                {data.interviewers.map((i) => i.email).join(', ')}
              </span>
            </>
          )}
        </div>

        {/* Body */}
        <div className="px-3 py-3 rounded-lg border border-cloud/50 dark:border-nebula-purple/10 bg-pearl/10 dark:bg-deep-cosmos/5 max-h-48 overflow-y-auto">
          <pre className="text-[10px] text-ink-black dark:text-pearl whitespace-pre-wrap font-sans leading-relaxed">
            {emailBody}
          </pre>
        </div>
      </div>

      {/* Send Options */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4 space-y-3">
        <p className="text-[11px] font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <Send className="w-4 h-4 text-celestial-indigo" />
          Send Options
        </p>

        <div className="space-y-2">
          <ToggleOption
            label="Send confirmation to candidate"
            description={data.candidateEmail}
            enabled={sendToCandidate}
            onToggle={() => setSendToCandidate(!sendToCandidate)}
          />
          <ToggleOption
            label="Send notification to interviewers"
            description={`${data.interviewers.length} interviewer${data.interviewers.length !== 1 ? 's' : ''}`}
            enabled={sendToInterviewers}
            onToggle={() => setSendToInterviewers(!sendToInterviewers)}
          />
          <ToggleOption
            label="Create calendar invite"
            description={
              data.calendarProvider
                ? `Via ${data.calendarProvider === 'google' ? 'Google Calendar' : 'Outlook Calendar'}`
                : 'ICS file attachment'
            }
            enabled={addCalendarInvite}
            onToggle={() => setAddCalendarInvite(!addCalendarInvite)}
          />
        </div>

        {/* Reminder note */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-celestial-indigo/5 border border-celestial-indigo/10">
          <Bell className="w-3.5 h-3.5 text-celestial-indigo shrink-0" />
          <p className="text-[9px] text-celestial-indigo">
            Automatic reminders will be sent 24 hours and 1 hour before the interview.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onSendConfirmation}
            disabled={!sendToCandidate && !sendToInterviewers}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-bold bg-celestial-indigo text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            <Send className="w-3.5 h-3.5" />
            Send Confirmation
          </button>
          <button
            onClick={onEdit}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-[11px] font-semibold text-silver-mist hover:text-ink-black dark:hover:text-pearl border border-cloud dark:border-nebula-purple/30 transition-colors"
          >
            Edit Details
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Detail Cell ──────────────────────────────────────────────────────────────────

const DetailCell: React.FC<{ icon: LucideIcon; label: string; value: string }> = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="px-2 py-1.5 rounded-lg bg-pearl/30 dark:bg-deep-cosmos/10">
    <p className="text-[8px] text-silver-mist flex items-center gap-0.5 mb-0.5">
      <Icon className="w-2.5 h-2.5" /> {label}
    </p>
    <p className="text-[10px] font-semibold text-ink-black dark:text-pearl truncate">{value}</p>
  </div>
);

// ── Toggle Option ────────────────────────────────────────────────────────────────

const ToggleOption: React.FC<{
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}> = ({ label, description, enabled, onToggle }) => (
  <button
    onClick={onToggle}
    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/20 hover:bg-pearl/20 dark:hover:bg-deep-cosmos/10 transition-colors text-left"
  >
    <div
      className={`w-8 h-4 rounded-full transition-colors relative ${
        enabled ? 'bg-celestial-indigo' : 'bg-silver-mist/30'
      }`}
    >
      <div
        className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${
          enabled ? 'translate-x-[18px]' : 'translate-x-0.5'
        }`}
      />
    </div>
    <div>
      <p className="text-[10px] font-semibold text-ink-black dark:text-pearl">{label}</p>
      <p className="text-[9px] text-silver-mist">{description}</p>
    </div>
  </button>
);

export default InterviewConfirmation;
