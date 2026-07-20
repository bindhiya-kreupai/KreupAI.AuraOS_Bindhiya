'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Users2, Users, CalendarDays, Briefcase, ArrowRight, Loader2 } from 'lucide-react';
import { AlumniDirectoryService, EventsService, JobsService } from './services';

interface HubStats {
  totalAlumni: number;
  activeAlumni: number;
  upcomingEvents: number;
  activeJobs: number;
}

const FEATURES = [
  {
    label: 'Alumni Directory',
    href: '/dashboard/alumni-network/alumni-directory',
    icon: Users,
    description: 'Find and connect with former colleagues across the network.',
  },
  {
    label: 'Events & Reunions',
    href: '/dashboard/alumni-network/events-reunions',
    icon: CalendarDays,
    description: 'Discover upcoming gatherings and RSVP to reunions.',
  },
  {
    label: 'Alumni Jobs',
    href: '/dashboard/alumni-network/alumni-jobs',
    icon: Briefcase,
    description: 'Browse and share exclusive opportunities with alumni.',
  },
];

export default function AlumniNetworkPage() {
  const [stats, setStats] = useState<HubStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [directory, events, jobs] = await Promise.all([
        AlumniDirectoryService.getAlumniDirectory().catch(() => null),
        EventsService.getAllEvents().catch(() => []),
        JobsService.getAllJobs().catch(() => []),
      ]);
      const now = Date.now();
      setStats({
        totalAlumni: directory?.totalAlumni ?? 0,
        activeAlumni: directory?.activeAlumni ?? 0,
        upcomingEvents: (events || []).filter(
          (e) => new Date(e.eventDate).getTime() >= now && e.eventStatus !== 'cancelled'
        ).length,
        activeJobs: (jobs || []).filter((j) => j.jobStatus === 'active').length,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const statCards = [
    { label: 'Total Alumni', value: stats?.totalAlumni ?? 0, icon: Users },
    { label: 'Active Alumni', value: stats?.activeAlumni ?? 0, icon: Users2 },
    { label: 'Upcoming Events', value: stats?.upcomingEvents ?? 0, icon: CalendarDays },
    { label: 'Active Jobs', value: stats?.activeJobs ?? 0, icon: Briefcase },
  ];

  return (
    <div className="space-y-8 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100 overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users2 className="w-8 h-8 text-indigo-500" />
            Alumni Network
          </h1>
          <p className="text-slate-500 text-lg mt-1">
            Stay connected with former employees, manage reunions, and share opportunities.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{card.label}</span>
              <card.icon className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="mt-2 text-3xl font-bold">
              {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-300" /> : card.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg transition-all flex flex-col"
          >
            <div className="mb-4 w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
              <feature.icon className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
            </div>
            <h3 className="font-bold text-lg mb-2 group-hover:text-indigo-600 transition-colors">
              {feature.label}
            </h3>
            <p className="text-sm text-slate-500 mb-6 flex-1">{feature.description}</p>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-400 group-hover:text-indigo-600">
              Open Module <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
