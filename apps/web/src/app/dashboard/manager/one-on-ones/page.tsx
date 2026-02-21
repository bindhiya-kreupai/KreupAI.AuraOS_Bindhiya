"use client";

import React, { useState, useEffect } from 'react';
import {
  Calendar, Plus, Clock, User, FileText, ChevronRight,
  CheckCircle, Circle, MessageSquare, Video, Loader2
} from 'lucide-react';

interface Meeting {
  id: string;
  employeeId: string;
  managerId: string;
  scheduledAt: string;
  duration: number;
  status: string;
  completedAt: string | null;
  employee?: string;
  avatar?: string;
  notesCount?: number;
  actionItemsCount?: number;
  actionItemsDone?: number;
}

const agendaTemplates = [
  'Weekly Check-in',
  'Career Development',
  'Performance Review',
  'Project Update',
  'Goal Setting',
];

export default function OneOnOnesPage() {
  const [view, setView] = useState<'upcoming' | 'history'>('upcoming');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMeetings() {
      try {
        const res = await fetch('/api/performance/one-on-one');
        if (res.ok) {
          const data = await res.json();
          setMeetings(data.meetings || []);
        }
      } catch (err) {
        console.error('Failed to fetch one-on-one meetings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMeetings();
  }, []);

  const upcomingMeetings = meetings.filter((m) => m.status === 'SCHEDULED');
  const pastMeetings = meetings.filter((m) => m.status !== 'SCHEDULED');

  const displayedMeetings = view === 'upcoming' ? upcomingMeetings : pastMeetings;

  const getInitials = (id: string) => {
    return id.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        <span className="ml-2 text-sm text-silver-mist">Loading meetings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">One-on-Ones</h1>
          <p className="text-sm text-silver-mist mt-1">Track meetings, notes, and action items with your direct reports</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-celestial-indigo text-white rounded-lg font-medium text-sm hover:bg-celestial-indigo/90 transition-colors">
          <Plus className="w-4 h-4" /> Schedule New
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Upcoming</p>
          <p className="text-2xl font-bold text-celestial-indigo mt-1">{upcomingMeetings.length}</p>
          <p className="text-[10px] text-silver-mist">Scheduled</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Completed</p>
          <p className="text-2xl font-bold text-neural-mint mt-1">{pastMeetings.filter(m => m.status === 'COMPLETED').length}</p>
          <p className="text-[10px] text-silver-mist">Total completed</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Cancelled</p>
          <p className="text-2xl font-bold text-sunset-amber mt-1">{pastMeetings.filter(m => m.status === 'CANCELLED').length}</p>
          <p className="text-[10px] text-silver-mist">Total cancelled</p>
        </div>
      </div>

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

      <div className="space-y-3">
        {displayedMeetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50">
            <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm font-medium text-slate-500">No {view === 'upcoming' ? 'upcoming' : 'past'} meetings</p>
            <p className="text-xs text-slate-400 mt-1">
              {view === 'upcoming' ? 'Schedule a new one-on-one to get started' : 'Completed meetings will appear here'}
            </p>
          </div>
        ) : (
          displayedMeetings.map((meeting) => (
            <div key={meeting.id} className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 hover:shadow-md transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-celestial-indigo/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-celestial-indigo">{getInitials(meeting.employeeId)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-ink-black dark:text-pearl">Employee: {meeting.employeeId.substring(0, 8)}...</p>
                    {meeting.status === 'SCHEDULED' && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full font-medium">Upcoming</span>
                    )}
                    {meeting.status === 'COMPLETED' && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full font-medium">Completed</span>
                    )}
                    {meeting.status === 'CANCELLED' && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full font-medium">Cancelled</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-silver-mist">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(meeting.scheduledAt)}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTime(meeting.scheduledAt)}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {meeting.duration} min</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-silver-mist">
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

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
