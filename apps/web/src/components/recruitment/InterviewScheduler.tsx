/**
 * @module InterviewScheduler
 * @description Main interview scheduler with candidate selection, time slot picker,
 *              interviewer assignment, calendar integration, and confirmation workflow
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  CalendarDays,
  Users,
  Send,
  ChevronRight,
  ChevronLeft,
  Clock,
  Video,
  MapPin,
  Briefcase,
  CheckCircle2,
  Wifi,
  Link2,
} from 'lucide-react';
import { CalendarSlotPicker } from './CalendarSlotPicker';
import type { SlotData } from './CalendarSlotPicker';
import { InterviewerAvailability } from './InterviewerAvailability';
import type { InterviewerData } from './InterviewerAvailability';
import { InterviewConfirmation } from './InterviewConfirmation';
import type { ConfirmationData } from './InterviewConfirmation';

// ── Types ────────────────────────────────────────────────────────────────────────

type SchedulerStep = 'details' | 'slot' | 'interviewers' | 'confirm';

interface InterviewTypeOption {
  value: string;
  label: string;
  icon: LucideIcon;
  defaultDuration: number;
}

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
}

// ── Constants ────────────────────────────────────────────────────────────────────

const INTERVIEW_TYPES: InterviewTypeOption[] = [
  { value: 'phone_screen', label: 'Phone Screen', icon: Clock, defaultDuration: 30 },
  { value: 'technical', label: 'Technical', icon: Briefcase, defaultDuration: 60 },
  { value: 'behavioral', label: 'Behavioral', icon: Users, defaultDuration: 45 },
  { value: 'panel', label: 'Panel', icon: Users, defaultDuration: 60 },
  { value: 'cultural_fit', label: 'Culture Fit', icon: Users, defaultDuration: 45 },
  { value: 'final_round', label: 'Final Round', icon: CheckCircle2, defaultDuration: 60 },
];

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

const STEPS: { key: SchedulerStep; label: string; icon: LucideIcon }[] = [
  { key: 'details', label: 'Details', icon: Briefcase },
  { key: 'slot', label: 'Time Slot', icon: CalendarDays },
  { key: 'interviewers', label: 'Interviewers', icon: Users },
  { key: 'confirm', label: 'Confirm', icon: Send },
];

// ── Mock Data ────────────────────────────────────────────────────────────────────

const generateSlots = (weekOffset: number): SlotData[] => {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7) + weekOffset * 7);

  const slots: SlotData[] = [];
  const _days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  for (let d = 0; d < 5; d++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + d);
    const dateStr = date.toISOString().split('T')[0];

    for (const hour of [9, 10, 11, 12, 13, 14, 15, 16, 17]) {
      const seed = (d * 100 + hour * 7 + weekOffset * 31) % 100;
      const available = seed > 20;
      const score = available
        ? Math.min(100, Math.max(20, 90 - seed + (hour >= 10 && hour <= 14 ? 20 : 0)))
        : 0;
      const interviewerCount = available ? Math.max(1, Math.floor((100 - seed) / 25)) : 0;
      const sources: Array<'google' | 'outlook' | 'manual'> = ['google', 'outlook', 'manual'];

      slots.push({
        id: `slot-${dateStr}-${hour}`,
        date: dateStr,
        hour,
        minute: 0,
        available,
        score,
        interviewerCount,
        conflicts: seed > 70 ? ['Interviewer at capacity'] : [],
        calendarSource: available ? sources[seed % 3] : undefined,
      });
    }
  }
  return slots;
};

const MOCK_INTERVIEWERS: InterviewerData[] = [
  {
    id: 'int-001',
    name: 'Alice Chen',
    email: 'alice@company.com',
    avatar: 'AC',
    role: 'Engineering Manager',
    department: 'Engineering',
    skills: ['React', 'TypeScript', 'System Design', 'Leadership'],
    interviewsToday: 1,
    maxInterviewsPerDay: 3,
    calendarConnected: true,
    calendarProvider: 'google',
    timezone: 'America/Los_Angeles',
    slots: generateInterviewerSlots('int-001', true),
  },
  {
    id: 'int-002',
    name: 'Bob Patel',
    email: 'bob@company.com',
    avatar: 'BP',
    role: 'Senior Developer',
    department: 'Engineering',
    skills: ['Node.js', 'AWS', 'Python', 'Microservices'],
    interviewsToday: 2,
    maxInterviewsPerDay: 3,
    calendarConnected: true,
    calendarProvider: 'outlook',
    timezone: 'America/New_York',
    slots: generateInterviewerSlots('int-002', true),
  },
  {
    id: 'int-003',
    name: 'Carol James',
    email: 'carol@company.com',
    avatar: 'CJ',
    role: 'HR Business Partner',
    department: 'HR',
    skills: ['Behavioral Assessment', 'Culture Fit', 'Competency Framework'],
    interviewsToday: 0,
    maxInterviewsPerDay: 4,
    calendarConnected: true,
    calendarProvider: 'google',
    timezone: 'America/Los_Angeles',
    slots: generateInterviewerSlots('int-003', true),
  },
  {
    id: 'int-004',
    name: 'David Kim',
    email: 'david@company.com',
    avatar: 'DK',
    role: 'Tech Lead',
    department: 'Engineering',
    skills: ['React', 'GraphQL', 'Docker', 'Kubernetes', 'CI/CD'],
    interviewsToday: 1,
    maxInterviewsPerDay: 2,
    calendarConnected: false,
    timezone: 'America/Chicago',
    slots: generateInterviewerSlots('int-004', false),
  },
  {
    id: 'int-005',
    name: 'Eva Martinez',
    email: 'eva@company.com',
    avatar: 'EM',
    role: 'Product Manager',
    department: 'Product',
    skills: ['Product Strategy', 'Agile', 'User Research', 'Roadmapping'],
    interviewsToday: 2,
    maxInterviewsPerDay: 3,
    calendarConnected: true,
    calendarProvider: 'outlook',
    timezone: 'America/Los_Angeles',
    slots: generateInterviewerSlots('int-005', true),
  },
];

function generateInterviewerSlots(id: string, _connected: boolean): InterviewerData['slots'] {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const slots: InterviewerData['slots'] = [];
  const seed = id.charCodeAt(4) || 0;

  for (let w = 0; w < 3; w++) {
    for (let d = 0; d < 5; d++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + d + w * 7);
      const dateStr = date.toISOString().split('T')[0];

      for (const hour of [9, 10, 11, 12, 13, 14, 15, 16, 17]) {
        const hash = (seed * 13 + d * 7 + hour * 3 + w * 11) % 100;
        const available = hash > 30;
        slots.push({
          date: dateStr,
          hour,
          available,
          reason: available ? undefined : hash > 60 ? 'In meeting' : 'On leave',
        });
      }
    }
  }
  return slots;
}

// ── StatCard ─────────────────────────────────────────────────────────────────────

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue">
    <div className={`p-1.5 rounded-lg ${color}`}>
      <Icon className="w-3.5 h-3.5" />
    </div>
    <div>
      <p className="text-lg font-bold text-ink-black dark:text-pearl leading-none">{value}</p>
      <p className="text-[9px] text-silver-mist">{label}</p>
    </div>
  </div>
);

// ── Format Helper ────────────────────────────────────────────────────────────────

const formatHour = (h: number): string => {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hr}:00 ${ampm}`;
};

const addMinutes = (hour: number, mins: number): string => {
  const totalMins = hour * 60 + mins;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return m === 0 ? `${hr}:00 ${ampm}` : `${hr}:${m.toString().padStart(2, '0')} ${ampm}`;
};

// ── Main Component ───────────────────────────────────────────────────────────────

export const InterviewScheduler: React.FC = () => {
  const [step, setStep] = useState<SchedulerStep>('details');
  const [weekOffset, setWeekOffset] = useState(0);

  // Form state
  const [candidateName, setCandidateName] = useState('Sarah Johnson');
  const [candidateEmail, setCandidateEmail] = useState('sarah.johnson@email.com');
  const [jobTitle, setJobTitle] = useState('Senior Full-Stack Engineer');
  const [interviewType, setInterviewType] = useState('technical');
  const [duration, setDuration] = useState(60);
  const [locationType, setLocationType] = useState<'video' | 'onsite'>('video');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/abc-defg-hij');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  // Selection state
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedInterviewerIds, setSelectedInterviewerIds] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState(false);

  const slots = useMemo(() => generateSlots(weekOffset), [weekOffset]);

  const selectedSlot = useMemo(
    () => slots.find((s) => s.id === selectedSlotId) || null,
    [slots, selectedSlotId]
  );

  const connectedCalendars = useMemo(
    () => MOCK_INTERVIEWERS.filter((i) => i.calendarConnected).length,
    []
  );

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleToggleInterviewer = useCallback((id: string) => {
    setSelectedInterviewerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const canProceed = useMemo(() => {
    switch (step) {
      case 'details':
        return candidateName.trim() && candidateEmail.trim() && jobTitle.trim() && interviewType;
      case 'slot':
        return selectedSlotId !== null;
      case 'interviewers':
        return selectedInterviewerIds.length > 0;
      case 'confirm':
        return true;
      default:
        return false;
    }
  }, [
    step,
    candidateName,
    candidateEmail,
    jobTitle,
    interviewType,
    selectedSlotId,
    selectedInterviewerIds,
  ]);

  const nextStep = useCallback(() => {
    const idx = STEPS.findIndex((s) => s.key === step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].key);
  }, [step]);

  const prevStep = useCallback(() => {
    const idx = STEPS.findIndex((s) => s.key === step);
    if (idx > 0) setStep(STEPS[idx - 1].key);
  }, [step]);

  const handleSendConfirmation = useCallback(() => {
    setConfirmed(true);
  }, []);

  const handleEdit = useCallback(() => {
    setStep('details');
    setConfirmed(false);
  }, []);

  // ── Build Confirmation Data ────────────────────────────────────────────────

  const confirmationData: ConfirmationData | null = useMemo(() => {
    if (!selectedSlot) return null;
    const selInterviewers = MOCK_INTERVIEWERS.filter((i) => selectedInterviewerIds.includes(i.id));
    return {
      candidateName,
      candidateEmail,
      jobTitle,
      interviewType: INTERVIEW_TYPES.find((t) => t.value === interviewType)?.label || interviewType,
      date: selectedSlot.date,
      startTime: formatHour(selectedSlot.hour),
      endTime: addMinutes(selectedSlot.hour, duration),
      duration,
      timezone: 'America/Los_Angeles',
      location: locationType === 'onsite' ? location : undefined,
      meetingLink: locationType === 'video' ? meetingLink : undefined,
      interviewers: selInterviewers.map((i) => ({ name: i.name, email: i.email, role: i.role })),
      notes: notes || undefined,
      calendarProvider: selInterviewers.find((i) => i.calendarProvider)?.calendarProvider,
    };
  }, [
    selectedSlot,
    selectedInterviewerIds,
    candidateName,
    candidateEmail,
    jobTitle,
    interviewType,
    duration,
    locationType,
    location,
    meetingLink,
    notes,
  ]);

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={CalendarDays}
          label="Available Slots"
          value={slots.filter((s) => s.available).length}
          color="bg-celestial-indigo/10 text-celestial-indigo"
        />
        <StatCard
          icon={Users}
          label="Interviewers"
          value={MOCK_INTERVIEWERS.length}
          color="bg-neural-mint/10 text-neural-mint"
        />
        <StatCard
          icon={Wifi}
          label="Calendars Connected"
          value={connectedCalendars}
          color="bg-sunset-amber/10 text-sunset-amber"
        />
        <StatCard
          icon={Clock}
          label="Avg Scheduling"
          value="< 2 min"
          color="bg-nebula-purple/10 text-nebula-purple"
        />
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => {
          const isActive = s.key === step;
          const isDone = i < stepIndex;
          return (
            <React.Fragment key={s.key}>
              {i > 0 && (
                <div
                  className={`flex-1 h-px ${isDone ? 'bg-celestial-indigo' : 'bg-cloud dark:bg-nebula-purple/20'}`}
                />
              )}
              <button
                onClick={() => {
                  if (isDone) setStep(s.key);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
                  isActive
                    ? 'bg-celestial-indigo text-white'
                    : isDone
                      ? 'bg-celestial-indigo/10 text-celestial-indigo cursor-pointer'
                      : 'bg-pearl dark:bg-deep-cosmos text-silver-mist'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-3 h-3" /> : <s.icon className="w-3 h-3" />}
                {s.label}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Success Message */}
      {confirmed && (
        <div className="rounded-xl border border-neural-mint/30 bg-neural-mint/5 p-4 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-neural-mint mx-auto" />
          <p className="text-sm font-bold text-neural-mint">Interview Scheduled Successfully!</p>
          <p className="text-[10px] text-silver-mist">
            Confirmation email and calendar invites have been sent to all participants.
          </p>
          <button
            onClick={() => {
              setConfirmed(false);
              setStep('details');
              setSelectedSlotId(null);
              setSelectedInterviewerIds([]);
            }}
            className="text-[11px] font-semibold text-celestial-indigo hover:text-celestial-indigo/80 transition-colors"
          >
            Schedule Another Interview
          </button>
        </div>
      )}

      {/* Step Content */}
      {!confirmed && (
        <>
          {step === 'details' && (
            <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4 space-y-4">
              <p className="text-sm font-bold text-ink-black dark:text-pearl">Interview Details</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  label="Candidate Name"
                  value={candidateName}
                  onChange={setCandidateName}
                  placeholder="Full name"
                />
                <FormField
                  label="Candidate Email"
                  value={candidateEmail}
                  onChange={setCandidateEmail}
                  placeholder="email@example.com"
                  type="email"
                />
                <FormField
                  label="Job Title"
                  value={jobTitle}
                  onChange={setJobTitle}
                  placeholder="Position title"
                />

                {/* Interview Type */}
                <div>
                  <label className="text-[10px] font-semibold text-silver-mist block mb-1">
                    Interview Type
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {INTERVIEW_TYPES.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => {
                          setInterviewType(t.value);
                          setDuration(t.defaultDuration);
                        }}
                        className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-[10px] font-semibold transition-colors ${
                          interviewType === t.value
                            ? 'border-celestial-indigo bg-celestial-indigo/10 text-celestial-indigo'
                            : 'border-cloud dark:border-nebula-purple/30 text-silver-mist hover:text-ink-black dark:hover:text-pearl'
                        }`}
                      >
                        <t.icon className="w-3 h-3" />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Duration */}
                <div>
                  <label className="text-[10px] font-semibold text-silver-mist block mb-1">
                    Duration
                  </label>
                  <div className="flex gap-1">
                    {DURATION_OPTIONS.map((d) => (
                      <button
                        key={d}
                        onClick={() => setDuration(d)}
                        className={`flex-1 py-1.5 rounded-lg border text-[10px] font-semibold transition-colors ${
                          duration === d
                            ? 'border-celestial-indigo bg-celestial-indigo/10 text-celestial-indigo'
                            : 'border-cloud dark:border-nebula-purple/30 text-silver-mist'
                        }`}
                      >
                        {d}m
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location Type */}
                <div>
                  <label className="text-[10px] font-semibold text-silver-mist block mb-1">
                    Format
                  </label>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setLocationType('video')}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border text-[10px] font-semibold transition-colors ${
                        locationType === 'video'
                          ? 'border-celestial-indigo bg-celestial-indigo/10 text-celestial-indigo'
                          : 'border-cloud dark:border-nebula-purple/30 text-silver-mist'
                      }`}
                    >
                      <Video className="w-3 h-3" /> Video
                    </button>
                    <button
                      onClick={() => setLocationType('onsite')}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border text-[10px] font-semibold transition-colors ${
                        locationType === 'onsite'
                          ? 'border-celestial-indigo bg-celestial-indigo/10 text-celestial-indigo'
                          : 'border-cloud dark:border-nebula-purple/30 text-silver-mist'
                      }`}
                    >
                      <MapPin className="w-3 h-3" /> On-site
                    </button>
                  </div>
                </div>

                {/* Link/Location */}
                <div>
                  {locationType === 'video' ? (
                    <FormField
                      label="Meeting Link"
                      value={meetingLink}
                      onChange={setMeetingLink}
                      placeholder="https://..."
                      icon={Link2}
                    />
                  ) : (
                    <FormField
                      label="Location"
                      value={location}
                      onChange={setLocation}
                      placeholder="Office address"
                      icon={MapPin}
                    />
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[10px] font-semibold text-silver-mist block mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions for the candidate..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors resize-none"
                />
              </div>
            </div>
          )}

          {step === 'slot' && (
            <CalendarSlotPicker
              slots={slots}
              selectedSlotId={selectedSlotId}
              onSelectSlot={(s) => setSelectedSlotId(s.id)}
              weekOffset={weekOffset}
              onWeekChange={setWeekOffset}
              duration={duration}
            />
          )}

          {step === 'interviewers' && selectedSlot && (
            <InterviewerAvailability
              interviewers={MOCK_INTERVIEWERS}
              selectedDate={selectedSlot.date}
              selectedHour={selectedSlot.hour}
              selectedInterviewerIds={selectedInterviewerIds}
              onToggleInterviewer={handleToggleInterviewer}
            />
          )}

          {step === 'confirm' && confirmationData && (
            <InterviewConfirmation
              data={confirmationData}
              onSendConfirmation={handleSendConfirmation}
              onEdit={handleEdit}
            />
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={stepIndex === 0}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-[11px] font-semibold text-silver-mist hover:text-ink-black dark:hover:text-pearl disabled:opacity-30 disabled:cursor-not-allowed border border-cloud dark:border-nebula-purple/30 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>

            {stepIndex < STEPS.length - 1 && (
              <button
                onClick={nextStep}
                disabled={!canProceed}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-[11px] font-bold bg-celestial-indigo text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// ── Form Field ───────────────────────────────────────────────────────────────────

const FormField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  icon?: LucideIcon;
}> = ({ label, value, onChange, placeholder, type = 'text', icon: Icon }) => (
  <div>
    <label className="text-[10px] font-semibold text-silver-mist block mb-1">{label}</label>
    <div className="relative">
      {Icon && (
        <Icon className="w-3 h-3 text-silver-mist absolute left-2.5 top-1/2 -translate-y-1/2" />
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full ${Icon ? 'pl-7' : 'pl-3'} pr-3 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors`}
      />
    </div>
  </div>
);

export default InterviewScheduler;
