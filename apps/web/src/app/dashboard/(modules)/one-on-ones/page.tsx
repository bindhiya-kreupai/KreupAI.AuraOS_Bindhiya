"use client";

import React, { useState } from 'react';
import {
  Calendar, Plus, Clock, User, ChevronRight,
  CheckCircle, Circle, MessageSquare
} from 'lucide-react';
import OneOnOneTracker from '@/components/one-on-ones/OneOnOneTracker';
import MeetingScheduler from '@/components/one-on-ones/MeetingScheduler';
import MeetingNotes from '@/components/one-on-ones/MeetingNotes';
import ActionItems from '@/components/one-on-ones/ActionItems';
import MeetingHistory from '@/components/one-on-ones/MeetingHistory';
import AgendaTemplates from '@/components/one-on-ones/AgendaTemplates';

type Tab = 'tracker' | 'schedule' | 'notes' | 'actions' | 'history' | 'templates';

export default function OneOnOnesModulePage() {
  const [activeTab, setActiveTab] = useState<Tab>('tracker');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'tracker', label: 'Tracker' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'notes', label: 'Notes' },
    { key: 'actions', label: 'Action Items' },
    { key: 'history', label: 'History' },
    { key: 'templates', label: 'Templates' },
  ];

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
          <p className="text-2xl font-bold text-indigo-600 mt-1">3</p>
          <p className="text-[10px] text-slate-400">This week</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 uppercase font-medium">Completion Rate</p>
          <p className="text-2xl font-bold text-green-600 mt-1">94%</p>
          <p className="text-[10px] text-slate-400">Last 30 days</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 uppercase font-medium">Open Action Items</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">5</p>
          <p className="text-[10px] text-slate-400">Across all reports</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 uppercase font-medium">Direct Reports</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">6</p>
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
        {activeTab === 'tracker' && <OneOnOneTracker />}
        {activeTab === 'schedule' && <MeetingScheduler />}
        {activeTab === 'notes' && <MeetingNotes />}
        {activeTab === 'actions' && <ActionItems />}
        {activeTab === 'history' && <MeetingHistory />}
        {activeTab === 'templates' && <AgendaTemplates />}
      </div>
    </div>
  );
}
