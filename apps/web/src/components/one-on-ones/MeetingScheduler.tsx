/**
 * @module MeetingScheduler
 * @description Schedule new one-on-one meetings with agenda template selection
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback } from 'react';
import {
  CalendarPlus,
  Clock,
  MapPin,
  Users,
  Repeat,
  FileText,
  X,
  Check,
  ChevronRight,
} from 'lucide-react';
import type {
  MeetingType,
  AgendaTemplate,
  AgendaItem,
  OneOnOneMeeting,
} from '@/services/oneOnOneService';
import { MEETING_TYPE_LABELS, MEETING_TYPE_COLORS } from '@/services/oneOnOneService';

interface MeetingSchedulerProps {
  templates: AgendaTemplate[];
  onSchedule: (
    data: Omit<OneOnOneMeeting, 'id' | 'actionItems' | 'notes' | 'status'>
  ) => Promise<OneOnOneMeeting>;
  onCancel: () => void;
}

interface FormData {
  employeeId: string;
  employeeName: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  type: MeetingType;
  location: string;
  recurring: null | { frequency: 'weekly' | 'biweekly' | 'monthly'; dayOfWeek: number };
  agendaItems: AgendaItem[];
}

const DURATION_OPTIONS = [15, 30, 45, 60];

const TEAM_MEMBERS = [
  { id: 'emp-101', name: 'Alex Rivera' },
  { id: 'emp-102', name: 'Priya Sharma' },
  { id: 'emp-103', name: 'Marcus Johnson' },
  { id: 'emp-104', name: 'Emily Watson' },
  { id: 'emp-105', name: 'David Kim' },
];

export const MeetingScheduler: React.FC<MeetingSchedulerProps> = ({
  templates,
  onSchedule,
  onCancel,
}) => {
  const [step, setStep] = useState<'details' | 'agenda' | 'confirm'>('details');
  const [submitting, setSubmitting] = useState(false);
  const [newAgendaText, setNewAgendaText] = useState('');
  const [form, setForm] = useState<FormData>({
    employeeId: '',
    employeeName: '',
    scheduledDate: '',
    scheduledTime: '10:00',
    duration: 30,
    type: 'weekly_sync',
    location: '',
    recurring: null,
    agendaItems: [],
  });

  const updateForm = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const selectEmployee = useCallback((emp: { id: string; name: string }) => {
    setForm((prev) => ({ ...prev, employeeId: emp.id, employeeName: emp.name }));
  }, []);

  const applyTemplate = useCallback((template: AgendaTemplate) => {
    const items: AgendaItem[] = template.items.map((text, i) => ({
      id: `new-${Date.now()}-${i}`,
      text,
      isDiscussed: false,
      notes: '',
      addedBy: 'manager' as const,
    }));
    setForm((prev) => ({ ...prev, type: template.type, agendaItems: items }));
  }, []);

  const addAgendaItem = useCallback(() => {
    if (!newAgendaText.trim()) return;
    const item: AgendaItem = {
      id: `new-${Date.now()}`,
      text: newAgendaText.trim(),
      isDiscussed: false,
      notes: '',
      addedBy: 'manager',
    };
    setForm((prev) => ({ ...prev, agendaItems: [...prev.agendaItems, item] }));
    setNewAgendaText('');
  }, [newAgendaText]);

  const removeAgendaItem = useCallback((id: string) => {
    setForm((prev) => ({ ...prev, agendaItems: prev.agendaItems.filter((a) => a.id !== id) }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!form.employeeId || !form.scheduledDate) return;
    setSubmitting(true);
    try {
      await onSchedule({
        employeeId: form.employeeId,
        employeeName: form.employeeName,
        managerId: 'mgr-001',
        managerName: 'Sarah Chen',
        scheduledDate: `${form.scheduledDate}T${form.scheduledTime}:00`,
        duration: form.duration,
        type: form.type,
        location: form.location || 'Zoom',
        agendaItems: form.agendaItems,
        recurring: form.recurring || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }, [form, onSchedule]);

  const canProceedDetails = form.employeeId && form.scheduledDate && form.scheduledTime;

  return (
    <div className="rounded-2xl border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cloud dark:border-nebula-purple/20 bg-pearl/30 dark:bg-deep-cosmos/20">
        <h3 className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <CalendarPlus className="w-4 h-4 text-celestial-indigo" />
          Schedule One-on-One
        </h3>
        <button
          onClick={onCancel}
          className="p-1 rounded-lg hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
        >
          <X className="w-4 h-4 text-silver-mist" />
        </button>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-cloud/50 dark:border-nebula-purple/10">
        {(['details', 'agenda', 'confirm'] as const).map((s, idx) => (
          <React.Fragment key={s}>
            {idx > 0 && <ChevronRight className="w-3 h-3 text-silver-mist/40" />}
            <button
              onClick={() => {
                if (s === 'details') setStep('details');
                else if (s === 'agenda' && canProceedDetails) setStep('agenda');
                else if (s === 'confirm' && canProceedDetails) setStep('confirm');
              }}
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-full transition-colors ${
                step === s
                  ? 'bg-celestial-indigo/10 text-celestial-indigo'
                  : 'text-silver-mist hover:text-twilight dark:hover:text-pearl'
              }`}
            >
              {s === 'details' ? 'Details' : s === 'agenda' ? 'Agenda' : 'Confirm'}
            </button>
          </React.Fragment>
        ))}
      </div>

      <div className="p-4 space-y-4">
        {/* Step 1: Details */}
        {step === 'details' && (
          <>
            {/* Team member */}
            <div>
              <label className="text-[10px] font-semibold text-silver-mist mb-1.5 flex items-center gap-1">
                <Users className="w-3 h-3" /> Team Member
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TEAM_MEMBERS.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => selectEmployee(emp)}
                    className={`text-[11px] px-3 py-1.5 rounded-lg border transition-colors ${
                      form.employeeId === emp.id
                        ? 'border-celestial-indigo bg-celestial-indigo/10 text-celestial-indigo font-semibold'
                        : 'border-cloud dark:border-nebula-purple/30 text-ink-black dark:text-pearl hover:border-celestial-indigo/40'
                    }`}
                  >
                    {emp.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Meeting type */}
            <div>
              <label className="text-[10px] font-semibold text-silver-mist mb-1.5 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Meeting Type
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(MEETING_TYPE_LABELS) as MeetingType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => updateForm('type', type)}
                    className={`text-[11px] px-3 py-1.5 rounded-lg border transition-colors ${
                      form.type === type
                        ? `border-current ${MEETING_TYPE_COLORS[type]} font-semibold`
                        : 'border-cloud dark:border-nebula-purple/30 text-ink-black dark:text-pearl hover:border-celestial-indigo/40'
                    }`}
                  >
                    {MEETING_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>

            {/* Date, time, duration */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-silver-mist mb-1 flex items-center gap-1">
                  <CalendarPlus className="w-3 h-3" /> Date
                </label>
                <input
                  type="date"
                  value={form.scheduledDate}
                  onChange={(e) => updateForm('scheduledDate', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-silver-mist mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Time
                </label>
                <input
                  type="time"
                  value={form.scheduledTime}
                  onChange={(e) => updateForm('scheduledTime', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-silver-mist mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Duration
                </label>
                <div className="flex gap-1">
                  {DURATION_OPTIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => updateForm('duration', d)}
                      className={`flex-1 text-[10px] py-1.5 rounded-lg border transition-colors ${
                        form.duration === d
                          ? 'border-celestial-indigo bg-celestial-indigo/10 text-celestial-indigo font-semibold'
                          : 'border-cloud dark:border-nebula-purple/30 text-silver-mist hover:border-celestial-indigo/40'
                      }`}
                    >
                      {d}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="text-[10px] font-semibold text-silver-mist mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Location
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => updateForm('location', e.target.value)}
                placeholder="Zoom, Conference Room, etc."
                className="w-full px-2.5 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
              />
            </div>

            {/* Recurring */}
            <div>
              <label className="text-[10px] font-semibold text-silver-mist mb-1.5 flex items-center gap-1">
                <Repeat className="w-3 h-3" /> Recurring
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => updateForm('recurring', null)}
                  className={`text-[11px] px-3 py-1.5 rounded-lg border transition-colors ${
                    !form.recurring
                      ? 'border-celestial-indigo bg-celestial-indigo/10 text-celestial-indigo font-semibold'
                      : 'border-cloud dark:border-nebula-purple/30 text-silver-mist'
                  }`}
                >
                  One-time
                </button>
                {(['weekly', 'biweekly', 'monthly'] as const).map((freq) => (
                  <button
                    key={freq}
                    onClick={() =>
                      updateForm('recurring', {
                        frequency: freq,
                        dayOfWeek: new Date(form.scheduledDate || Date.now()).getDay(),
                      })
                    }
                    className={`text-[11px] px-3 py-1.5 rounded-lg border transition-colors capitalize ${
                      form.recurring?.frequency === freq
                        ? 'border-celestial-indigo bg-celestial-indigo/10 text-celestial-indigo font-semibold'
                        : 'border-cloud dark:border-nebula-purple/30 text-silver-mist'
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep('agenda')}
              disabled={!canProceedDetails}
              className="w-full flex items-center justify-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-celestial-indigo text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              Next: Set Agenda <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {/* Step 2: Agenda */}
        {step === 'agenda' && (
          <>
            {/* Templates */}
            <div>
              <label className="text-[10px] font-semibold text-silver-mist mb-1.5">
                Apply Template
              </label>
              <div className="flex flex-wrap gap-1.5">
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => applyTemplate(tpl)}
                    className="text-[11px] px-3 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 text-ink-black dark:text-pearl hover:border-celestial-indigo/40 hover:bg-celestial-indigo/5 transition-colors"
                  >
                    {tpl.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Agenda items */}
            <div className="space-y-1.5">
              {form.agendaItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/20 bg-pearl/20 dark:bg-deep-cosmos/10"
                >
                  <span className="text-[10px] text-silver-mist/60 w-4">{idx + 1}.</span>
                  <span className="text-xs text-ink-black dark:text-pearl flex-1">{item.text}</span>
                  <button
                    onClick={() => removeAgendaItem(item.id)}
                    className="p-0.5 rounded hover:bg-pearl dark:hover:bg-deep-cosmos"
                  >
                    <X className="w-3 h-3 text-silver-mist" />
                  </button>
                </div>
              ))}
              {form.agendaItems.length === 0 && (
                <p className="text-[11px] text-silver-mist text-center py-3 italic">
                  No agenda items. Select a template or add items manually.
                </p>
              )}
            </div>

            {/* Add custom item */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newAgendaText}
                onChange={(e) => setNewAgendaText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addAgendaItem()}
                placeholder="Add agenda item..."
                className="flex-1 px-2.5 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
              />
              <button
                onClick={addAgendaItem}
                className="p-1.5 rounded-lg bg-celestial-indigo/10 text-celestial-indigo hover:bg-celestial-indigo/20 transition-colors"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setStep('details')}
                className="flex-1 px-4 py-2 rounded-xl text-xs font-semibold border border-cloud dark:border-nebula-purple/30 text-ink-black dark:text-pearl hover:bg-pearl/50 dark:hover:bg-deep-cosmos/20 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep('confirm')}
                className="flex-1 flex items-center justify-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-celestial-indigo text-white hover:opacity-90 transition-opacity"
              >
                Review <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}

        {/* Step 3: Confirm */}
        {step === 'confirm' && (
          <>
            <div className="space-y-3">
              <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-pearl/20 dark:bg-deep-cosmos/10 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-silver-mist">Team Member</span>
                  <span className="text-xs font-semibold text-ink-black dark:text-pearl">
                    {form.employeeName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-silver-mist">Type</span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${MEETING_TYPE_COLORS[form.type]}`}
                  >
                    {MEETING_TYPE_LABELS[form.type]}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-silver-mist">Date & Time</span>
                  <span className="text-xs text-ink-black dark:text-pearl">
                    {form.scheduledDate &&
                      new Date(`${form.scheduledDate}T${form.scheduledTime}`).toLocaleDateString(
                        'en-US',
                        { weekday: 'short', month: 'short', day: 'numeric' }
                      )}{' '}
                    {form.scheduledTime}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-silver-mist">Duration</span>
                  <span className="text-xs text-ink-black dark:text-pearl">
                    {form.duration} minutes
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-silver-mist">Location</span>
                  <span className="text-xs text-ink-black dark:text-pearl">
                    {form.location || 'Zoom'}
                  </span>
                </div>
                {form.recurring && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-silver-mist">Recurring</span>
                    <span className="text-xs text-ink-black dark:text-pearl capitalize">
                      {form.recurring.frequency}
                    </span>
                  </div>
                )}
              </div>

              {form.agendaItems.length > 0 && (
                <div>
                  <h5 className="text-[10px] font-semibold text-silver-mist mb-1">
                    Agenda ({form.agendaItems.length} items)
                  </h5>
                  <div className="space-y-1">
                    {form.agendaItems.map((item, idx) => (
                      <p key={item.id} className="text-[11px] text-ink-black dark:text-pearl pl-2">
                        {idx + 1}. {item.text}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setStep('agenda')}
                className="flex-1 px-4 py-2 rounded-xl text-xs font-semibold border border-cloud dark:border-nebula-purple/30 text-ink-black dark:text-pearl hover:bg-pearl/50 dark:hover:bg-deep-cosmos/20 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-neural-mint text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                <Check className="w-3.5 h-3.5" />
                {submitting ? 'Scheduling...' : 'Schedule Meeting'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MeetingScheduler;
