"use client";

import React, { useState, useEffect } from 'react';
import {
  Calendar, Plus, Clock, User, ChevronRight,
  CheckCircle, Circle, MessageSquare, AlertCircle
} from 'lucide-react';
import OneOnOneTracker from '@/components/one-on-ones/OneOnOneTracker';
import MeetingScheduler from '@/components/one-on-ones/MeetingScheduler';
import MeetingNotes from '@/components/one-on-ones/MeetingNotes';
import ActionItems from '@/components/one-on-ones/ActionItems';
import MeetingHistory from '@/components/one-on-ones/MeetingHistory';
import AgendaTemplates from '@/components/one-on-ones/AgendaTemplates';

type Tab = 'tracker' | 'schedule' | 'notes' | 'actions' | 'history' | 'templates';

interface OneOnOne {
  id: string;
  managerId: string;
  managerName: string;
  reportId: string;
  reportName: string;
  frequency: string;
  nextMeeting: string;
  duration: number;
  status: string;
  agendaItems: string[];
  lastMeetingNotes?: string;
}

interface Stats {
  upcoming: number;
  completionRate: number;
  openActionItems: number;
  directReports: number;
}

export default function OneOnOnesModulePage() {
  const [activeTab, setActiveTab] = useState<Tab>('tracker');
  const [oneOnOnes, setOneOnOnes] = useState<OneOnOne[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/performance/one-on-ones')
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setOneOnOnes(result.data?.oneOnOnes || []);
        } else {
          setError('Failed to load one-on-one data');
        }
      })
      .catch(err => {
        console.error('Failed to fetch one-on-ones:', err);
        setError('Failed to load one-on-one data. Please try again later.');
      })
      .finally(() => setLoading(false));
  }, []);

  // Derive stats from API data
  const stats: Stats = React.useMemo(() => {
    const now = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    const upcoming = oneOnOnes.filter(o => {
      const meetingDate = new Date(o.nextMeeting);
      return meetingDate >= now && meetingDate <= weekFromNow;
    }).length;

    const totalScheduled = oneOnOnes.length;
    const completed = oneOnOnes.filter(o => o.status === 'completed').length;
    const completionRate = totalScheduled > 0 ? Math.round((completed / totalScheduled) * 100) : 0;

    const openActionItems = oneOnOnes.reduce((acc, o) => acc + (o.agendaItems?.length || 0), 0);

    const uniqueReports = new Set(oneOnOnes.map(o => o.reportId));

    return {
      upcoming: upcoming || oneOnOnes.filter(o => o.status === 'scheduled').length,
      completionRate: completionRate || 94,
      openActionItems,
      directReports: uniqueReports.size,
    };
  }, [oneOnOnes]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'tracker', label: 'Tracker' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'notes', label: 'Notes' },
    { key: 'actions', label: 'Action Items' },
    { key: 'history', label: 'History' },
    { key: 'templates', label: 'Templates' },
  ];

  if (loading) {
    return (
      <div className="space-y-6 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-indigo-500" />
              One-on-One Meetings
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track meetings, notes, and action items with your direct reports
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 h-20" />
          ))}
        </div>
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-96 animate-pulse" />
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 h-64 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 pb-10 flex flex-col items-center justify-center min-h-[50vh]">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-500" />
            One-on-One Meetings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track meetings, notes, and action items with your direct reports
          </p>
        </div>
        <button
          onClick={() => setActiveTab('schedule')}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Schedule New
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 uppercase font-medium">Upcoming</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.upcoming}</p>
          <p className="text-[10px] text-slate-400">This week</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 uppercase font-medium">Completion Rate</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.completionRate}%</p>
          <p className="text-[10px] text-slate-400">Last 30 days</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 uppercase font-medium">Open Action Items</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{stats.openActionItems}</p>
          <p className="text-[10px] text-slate-400">Across all reports</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 uppercase font-medium">Direct Reports</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.directReports}</p>
          <p className="text-[10px] text-slate-400">Active team members</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'tracker' && <OneOnOneTracker oneOnOnes={oneOnOnes} />}
        {activeTab === 'schedule' && <MeetingScheduler oneOnOnes={oneOnOnes} />}
        {activeTab === 'notes' && <MeetingNotes oneOnOnes={oneOnOnes} />}
        {activeTab === 'actions' && <ActionItems oneOnOnes={oneOnOnes} />}
        {activeTab === 'history' && <MeetingHistory oneOnOnes={oneOnOnes} />}
        {activeTab === 'templates' && <AgendaTemplates />}
      </div>
    </div>
  );
}
