'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckSquare,
  Clock,
  FileText,
  Laptop,
  Loader2,
  PackageOpen,
  User,
  Utensils,
} from 'lucide-react';
import { PreBoardingService } from '../services';

type DisplayTask = {
  id: string | number;
  category: string;
  title: string;
  status: 'Completed' | 'Pending';
  dueDate: string;
  icon: typeof FileText;
};

type ManagerContact = {
  name: string;
  role: string;
  email?: string;
  phone?: string;
  avatar: string;
};

const ICON_BY_CATEGORY: Record<string, typeof FileText> = {
  documentation: FileText,
  documents: FileText,
  equipment: Laptop,
  administrative: User,
  social: Utensils,
};

function pickDate(pkg: any): Date | null {
  const candidates = [
    pkg?.startDate,
    pkg?.firstDayInfo?.date,
    pkg?.firstDayInfo?.startDate,
    pkg?.expectedStartDate,
    pkg?.firstDay,
    pkg?.firstDayDate,
  ].filter(Boolean);
  for (const c of candidates) {
    const d = new Date(c);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

function daysBetween(target: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const t = new Date(target);
  t.setHours(0, 0, 0, 0);
  return Math.round((t.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function pickHiringManager(pkg: any): ManagerContact | null {
  const contacts: any[] = Array.isArray(pkg?.contacts) ? pkg.contacts : [];
  const manager = contacts.find((c) => {
    const role = String(c.role || c.contactType || '').toLowerCase();
    return role.includes('manager') || role === 'hiring_manager' || role === 'hr';
  });
  if (!manager) return null;
  const name = manager.name || manager.fullName || 'Hiring Manager';
  return {
    name,
    role: manager.role || manager.contactType || 'Manager',
    email: manager.email,
    phone: manager.phone,
    avatar: name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase(),
  };
}

export default function PreBoardingPage() {
  const [pkg, setPkg] = useState<any | null>(null);
  const [tasks, setTasks] = useState<DisplayTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const packages = await PreBoardingService.getPackages();
        if (packages.length > 0) {
          const p = packages[0] as any;
          setPkg(p);
          const transformed: DisplayTask[] = (p.tasks || []).map((task: any, index: number) => ({
            id: task.id || index,
            category: task.category || 'Documents',
            title: task.taskName || task.title || 'Task',
            status: task.status === 'completed' ? 'Completed' : 'Pending',
            dueDate: task.dueDate
              ? new Date(task.dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              : '',
            icon: ICON_BY_CATEGORY[(task.category || '').toLowerCase()] || FileText,
          }));
          setTasks(transformed);
        }
      } catch (error: any) {
        console.error('Error fetching pre-boarding data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const startDate = useMemo(() => pickDate(pkg), [pkg]);
  const daysToJoin = startDate ? daysBetween(startDate) : null;
  const manager = useMemo(() => pickHiringManager(pkg), [pkg]);

  const stats = {
    daysToJoin,
    completedTasks: tasks.filter((t) => t.status === 'Completed').length,
    totalTasks: tasks.length,
  };

  const toggleTask = (id: string | number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' } : t
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm text-slate-500 font-medium">Loading pre-boarding checklist…</p>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="flex flex-col items-center gap-3 text-center">
          <PackageOpen className="w-12 h-12 text-slate-300 dark:text-slate-600" />
          <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">
            No Pre-boarding Tasks
          </h3>
          <p className="text-sm text-slate-500">
            Pre-boarding tasks will appear here once an onboarding instance is created.
          </p>
        </div>
      </div>
    );
  }

  const daysCopy =
    daysToJoin === null
      ? 'Start date not set'
      : daysToJoin < 0
        ? `Started ${Math.abs(daysToJoin)} day${daysToJoin === -1 ? '' : 's'} ago`
        : daysToJoin === 0
          ? 'Starts today'
          : `${daysToJoin} day${daysToJoin === 1 ? '' : 's'} until start date`;

  return (
    <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-500" />
            Pre-boarding Checklist
          </h1>
          <p className="text-slate-500 text-sm">Complete these items before your first day.</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-xl text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-100 dark:border-indigo-800">
          <Clock className="w-4 h-4" />
          <span>{daysCopy}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold mb-2">
                {daysToJoin === null
                  ? 'Welcome'
                  : daysToJoin <= 0
                    ? 'Welcome aboard!'
                    : `${daysToJoin} Day${daysToJoin === 1 ? '' : 's'} to Go!`}
              </h2>
              <p className="opacity-90">
                {stats.totalTasks - stats.completedTasks > 0
                  ? `Complete ${stats.totalTasks - stats.completedTasks} more task${stats.totalTasks - stats.completedTasks === 1 ? '' : 's'} to be fully ready.`
                  : 'All pre-boarding tasks complete — you’re ready!'}
                {startDate && (
                  <span className="ml-2 inline-flex items-center gap-1 opacity-80">
                    <Calendar className="w-4 h-4" />
                    {startDate.toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white/20 p-4 rounded-xl backdrop-blur-sm">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {stats.totalTasks > 0
                    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
                    : 0}
                  %
                </div>
                <div className="text-xs opacity-75 uppercase font-bold">Ready</div>
              </div>
              <div className="w-16 h-16 relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    className="opacity-30"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={175.93}
                    strokeDashoffset={
                      175.93 *
                      (1 - (stats.totalTasks > 0 ? stats.completedTasks / stats.totalTasks : 0))
                    }
                    className="text-white"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2">Your Tasks</h3>
              <span className="text-xs font-bold text-slate-400 uppercase">
                {stats.completedTasks}/{stats.totalTasks} Done
              </span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`p-4 flex items-center gap-3 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30 ${
                    task.status === 'Completed' ? 'opacity-60' : ''
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      task.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <task.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div
                      className={`font-bold text-sm ${
                        task.status === 'Completed' ? 'line-through decoration-slate-400' : ''
                      }`}
                    >
                      {task.title}
                    </div>
                    <div className="text-xs text-slate-500">
                      Due: {task.dueDate}
                      {task.category && ` • ${task.category}`}
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                      task.status === 'Completed'
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300'
                    }`}
                  >
                    {task.status === 'Completed' && <CheckSquare className="w-4 h-4" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <h4 className="font-bold text-amber-900 dark:text-amber-100 text-sm mb-1">
                  Reminder
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  Please complete all mandatory pre-boarding tasks before your start date.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-500" /> Hiring Manager
            </h4>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                {manager?.avatar || '—'}
              </div>
              <div>
                <div className="font-bold text-sm">{manager?.name || 'Manager not assigned'}</div>
                <div className="text-xs text-slate-500">{manager?.role || 'Will be assigned'}</div>
              </div>
            </div>
            {manager?.email ? (
              <a
                href={`mailto:${manager.email}`}
                className="block text-center w-full py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors text-sm"
              >
                Contact Manager
              </a>
            ) : (
              <button
                disabled
                className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold rounded-lg cursor-not-allowed text-sm"
              >
                Contact details pending
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
