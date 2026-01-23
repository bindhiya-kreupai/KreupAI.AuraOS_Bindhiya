"use client";

import React, { useState } from 'react';
import {
  Calendar, Plus, Clock, User, FileText, ChevronRight,
  CheckCircle, Circle, MessageSquare, Video
} from 'lucide-react';

interface Meeting {
  id: string;
  employee: string;
  avatar: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'missed';
  notesCount: number;
  actionItems: number;
  actionItemsDone: number;
}

const mockMeetings: Meeting[] = [
  { id: '1', employee: 'Emily Davis', avatar: 'ED', date: 'Jan 24, 2025', time: '10:00 AM', status: 'upcoming', notesCount: 0, actionItems: 3, actionItemsDone: 1 },
  { id: '2', employee: 'Raj Patel', avatar: 'RP', date: 'Jan 24, 2025', time: '02:00 PM', status: 'upcoming', notesCount: 0, actionItems: 2, actionItemsDone: 0 },
  { id: '3', employee: 'Anna Lee', avatar: 'AL', date: 'Jan 17, 2025', time: '10:00 AM', status: 'completed', notesCount: 5, actionItems: 4, actionItemsDone: 4 },
  { id: '4', employee: 'Mike Chen', avatar: 'MC', date: 'Jan 17, 2025', time: '03:00 PM', status: 'completed', notesCount: 3, actionItems: 2, actionItemsDone: 1 },
  { id: '5', employee: 'Sarah Johnson', avatar: 'SJ', date: 'Jan 10, 2025', time: '11:00 AM', status: 'completed', notesCount: 4, actionItems: 3, actionItemsDone: 3 },
];

const agendaTemplates = [
  'Weekly Check-in',
  'Career Development',
  'Performance Review',
  'Project Update',
  'Goal Setting',
];

export default function OneOnOnesPage() {
  const [view, setView] = useState<'upcoming' | 'history'>('upcoming');

  const upcomingMeetings = mockMeetings.filter((m) => m.status === 'upcoming');
  const pastMeetings = mockMeetings.filter((m) => m.status !== 'upcoming');

  const displayedMeetings = view === 'upcoming' ? upcomingMeetings : pastMeetings;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">One-on-Ones</h1>
          <p className="text-sm text-silver-mist mt-1">Track meetings, notes, and action items with your direct reports</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-celestial-indigo text-white rounded-lg font-medium text-sm hover:bg-celestial-indigo/90 transition-colors">
          <Plus className="w-4 h-4" /> Schedule New
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Upcoming</p>
          <p className="text-2xl font-bold text-celestial-indigo mt-1">{upcomingMeetings.length}</p>
          <p className="text-[10px] text-silver-mist">This week</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Completion Rate</p>
          <p className="text-2xl font-bold text-neural-mint mt-1">94%</p>
          <p className="text-[10px] text-silver-mist">Last 30 days</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Open Action Items</p>
          <p className="text-2xl font-bold text-sunset-amber mt-1">5</p>
          <p className="text-[10px] text-silver-mist">Across all reports</p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setView('upcoming')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            view === 'upcoming' ? 'bg-celestial-indigo text-white' : 'text-silver-mist hover:bg-slate-100 dark:hover:bg-deep-cosmos'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setView('history')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            view === 'history' ? 'bg-celestial-indigo text-white' : 'text-silver-mist hover:bg-slate-100 dark:hover:bg-deep-cosmos'
          }`}
        >
          History
        </button>
      </div>

      {/* Meetings List */}
      <div className="space-y-3">
        {displayedMeetings.map((meeting) => (
          <div key={meeting.id} className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-celestial-indigo/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-celestial-indigo">{meeting.avatar}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-ink-black dark:text-pearl">{meeting.employee}</p>
                  {meeting.status === 'upcoming' && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full font-medium">Upcoming</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-silver-mist">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {meeting.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {meeting.time}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-silver-mist">
                {meeting.notesCount > 0 && (
                  <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {meeting.notesCount}</span>
                )}
                <span className="flex items-center gap-1">
                  {meeting.actionItemsDone === meeting.actionItems ? (
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Circle className="w-3 h-3" />
                  )}
                  {meeting.actionItemsDone}/{meeting.actionItems}
                </span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Agenda Templates */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
        <h3 className="text-sm font-bold text-ink-black dark:text-pearl mb-3">Agenda Templates</h3>
        <div className="flex flex-wrap gap-2">
          {agendaTemplates.map((template) => (
            <button key={template} className="px-3 py-1.5 text-xs font-medium bg-slate-50 dark:bg-deep-cosmos text-silver-mist rounded-lg hover:bg-celestial-indigo/10 hover:text-celestial-indigo transition-colors">
              {template}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
