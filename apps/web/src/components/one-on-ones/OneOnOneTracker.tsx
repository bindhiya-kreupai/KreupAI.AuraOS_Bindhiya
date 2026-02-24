/**
 * @module OneOnOneTracker
 * @description Main container for One-on-One meeting tracker with tabs for upcoming, history, and templates
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback } from 'react';
import {
  CalendarCheck,
  CalendarPlus,
  History,
  LayoutTemplate,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  MapPin,
  X,
  ArrowLeft,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useOneOnOnes } from '@/hooks/useOneOnOnes';
import type { OneOnOneMeeting, AgendaTemplate } from '@/services/oneOnOneService';
import { MEETING_TYPE_LABELS, MEETING_TYPE_COLORS } from '@/services/oneOnOneService';
import { MeetingNotes } from './MeetingNotes';
import { ActionItems } from './ActionItems';
import { MeetingScheduler } from './MeetingScheduler';
import { MeetingHistory } from './MeetingHistory';
import { AgendaTemplates } from './AgendaTemplates';

type ActiveTab = 'upcoming' | 'history' | 'templates';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
}

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

export const OneOnOneTracker: React.FC = () => {
  const {
    loading,
    templates,
    upcoming,
    completed,
    pendingActions,
    selectedMeeting,
    setSelectedMeeting,
    scheduleMeeting,
    updateMeeting,
    completeMeeting,
    addActionItem,
    updateActionItem,
  } = useOneOnOnes();

  const [activeTab, setActiveTab] = useState<ActiveTab>('upcoming');
  const [showScheduler, setShowScheduler] = useState(false);

  const handleSchedule = useCallback(
    async (data: Parameters<typeof scheduleMeeting>[0]) => {
      const meeting = await scheduleMeeting(data);
      setShowScheduler(false);
      setSelectedMeeting(meeting);
      return meeting;
    },
    [scheduleMeeting, setSelectedMeeting]
  );

  const handleComplete = useCallback(
    async (notes: string, sentiment: number) => {
      if (!selectedMeeting) return;
      await completeMeeting(selectedMeeting.id, notes, sentiment);
    },
    [selectedMeeting, completeMeeting]
  );

  const handleUpdateNotes = useCallback(
    async (notes: string) => {
      if (!selectedMeeting) return;
      await updateMeeting(selectedMeeting.id, { notes });
    },
    [selectedMeeting, updateMeeting]
  );

  const handleUpdateAgenda = useCallback(
    async (agendaItems: OneOnOneMeeting['agendaItems']) => {
      if (!selectedMeeting) return;
      await updateMeeting(selectedMeeting.id, { agendaItems });
    },
    [selectedMeeting, updateMeeting]
  );

  const handleApplyTemplate = useCallback((_template: AgendaTemplate) => {
    setShowScheduler(true);
    setActiveTab('upcoming');
  }, []);

  const overdueActions = pendingActions.filter((a) => new Date(a.dueDate) < new Date());

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin w-6 h-6 border-2 border-celestial-indigo border-t-transparent rounded-full" />
      </div>
    );
  }

  // If scheduler is open
  if (showScheduler) {
    return (
      <MeetingScheduler
        templates={templates}
        onSchedule={handleSchedule}
        onCancel={() => setShowScheduler(false)}
      />
    );
  }

  // If a meeting is selected - show detail view
  if (selectedMeeting) {
    const isReadonly =
      selectedMeeting.status === 'completed' || selectedMeeting.status === 'cancelled';
    return (
      <div className="space-y-4">
        {/* Back button */}
        <button
          onClick={() => setSelectedMeeting(null)}
          className="flex items-center gap-1 text-xs text-celestial-indigo hover:text-celestial-indigo/80 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to meetings
        </button>

        {/* Meeting header */}
        <div className="rounded-2xl border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-bold text-ink-black dark:text-pearl">
                  {selectedMeeting.employeeName}
                </h3>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${MEETING_TYPE_COLORS[selectedMeeting.type]}`}
                >
                  {MEETING_TYPE_LABELS[selectedMeeting.type]}
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${
                    selectedMeeting.status === 'completed'
                      ? 'text-neural-mint bg-neural-mint/10'
                      : selectedMeeting.status === 'cancelled'
                        ? 'text-coral-alert bg-coral-alert/10'
                        : 'text-celestial-indigo bg-celestial-indigo/10'
                  }`}
                >
                  {selectedMeeting.status.charAt(0).toUpperCase() + selectedMeeting.status.slice(1)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-silver-mist">
                <span className="flex items-center gap-0.5">
                  <Calendar className="w-2.5 h-2.5" />
                  {new Date(selectedMeeting.scheduledDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  {new Date(selectedMeeting.scheduledDate).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                  {' · '}
                  {selectedMeeting.duration}min
                </span>
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5" /> {selectedMeeting.location}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedMeeting(null)}
              className="p-1 rounded-lg hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
            >
              <X className="w-4 h-4 text-silver-mist" />
            </button>
          </div>

          {/* Notes & Agenda */}
          <MeetingNotes
            meeting={selectedMeeting}
            onUpdateNotes={handleUpdateNotes}
            onUpdateAgenda={handleUpdateAgenda}
            onComplete={handleComplete}
            readonly={isReadonly}
          />
        </div>

        {/* Action Items */}
        <div className="rounded-2xl border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue p-4">
          <ActionItems
            items={selectedMeeting.actionItems}
            meetingId={selectedMeeting.id}
            onAdd={addActionItem}
            onUpdate={updateActionItem}
            readonly={isReadonly}
          />
        </div>
      </div>
    );
  }

  // Main dashboard view
  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={CalendarCheck}
          label="Upcoming"
          value={upcoming.length}
          color="bg-celestial-indigo/10 text-celestial-indigo"
        />
        <StatCard
          icon={History}
          label="Completed"
          value={completed.length}
          color="bg-neural-mint/10 text-neural-mint"
        />
        <StatCard
          icon={CheckCircle2}
          label="Pending Actions"
          value={pendingActions.length}
          color="bg-sunset-amber/10 text-sunset-amber"
        />
        <StatCard
          icon={AlertTriangle}
          label="Overdue Actions"
          value={overdueActions.length}
          color="bg-coral-alert/10 text-coral-alert"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-pearl dark:bg-deep-cosmos rounded-xl p-0.5 border border-cloud dark:border-nebula-purple/30">
          {[
            { key: 'upcoming' as ActiveTab, label: 'Upcoming', icon: CalendarCheck },
            { key: 'history' as ActiveTab, label: 'History', icon: History },
            { key: 'templates' as ActiveTab, label: 'Templates', icon: LayoutTemplate },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-stellar-blue text-celestial-indigo shadow-sm'
                  : 'text-silver-mist hover:text-twilight dark:hover:text-pearl'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowScheduler(true)}
          className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold bg-celestial-indigo text-white hover:opacity-90 transition-opacity"
        >
          <CalendarPlus className="w-3.5 h-3.5" /> Schedule
        </button>
      </div>

      {/* Content */}
      {activeTab === 'upcoming' && (
        <div className="space-y-3">
          {upcoming.length === 0 ? (
            <div className="text-center py-10">
              <CalendarCheck className="w-10 h-10 text-silver-mist/20 mx-auto mb-3" />
              <p className="text-sm text-silver-mist mb-1">No upcoming meetings</p>
              <p className="text-[11px] text-silver-mist/60 mb-4">
                Schedule a one-on-one to get started.
              </p>
              <button
                onClick={() => setShowScheduler(true)}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-celestial-indigo text-white hover:opacity-90 transition-opacity"
              >
                <CalendarPlus className="w-3.5 h-3.5" /> Schedule Meeting
              </button>
            </div>
          ) : (
            upcoming.map((meeting) => {
              const date = new Date(meeting.scheduledDate);
              const isToday = date.toDateString() === new Date().toDateString();
              const isTomorrow =
                date.toDateString() === new Date(Date.now() + 86400000).toDateString();
              const dateLabel = isToday
                ? 'Today'
                : isTomorrow
                  ? 'Tomorrow'
                  : date.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    });

              return (
                <button
                  key={meeting.id}
                  onClick={() => setSelectedMeeting(meeting)}
                  className="w-full text-left rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue hover:border-celestial-indigo/30 transition-colors p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-[11px] font-bold text-celestial-indigo">
                        {meeting.employeeName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-ink-black dark:text-pearl">
                          {meeting.employeeName}
                        </h4>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${MEETING_TYPE_COLORS[meeting.type]}`}
                        >
                          {MEETING_TYPE_LABELS[meeting.type]}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-[11px] font-semibold ${isToday ? 'text-celestial-indigo' : 'text-ink-black dark:text-pearl'}`}
                      >
                        {dateLabel}
                      </p>
                      <p className="text-[10px] text-silver-mist">
                        {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} ·{' '}
                        {meeting.duration}min
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-silver-mist">
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5" /> {meeting.location}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Users className="w-2.5 h-2.5" /> {meeting.agendaItems.length} agenda items
                    </span>
                    {meeting.recurring && (
                      <span className="flex items-center gap-0.5 capitalize">
                        <Clock className="w-2.5 h-2.5" /> {meeting.recurring.frequency}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <MeetingHistory meetings={completed} onSelect={setSelectedMeeting} />
      )}

      {activeTab === 'templates' && (
        <AgendaTemplates templates={templates} onApply={handleApplyTemplate} />
      )}
    </div>
  );
};

export default OneOnOneTracker;
