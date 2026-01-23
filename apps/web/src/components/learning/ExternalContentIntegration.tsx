"use client";

import React from 'react';
import { ExternalLink, CheckCircle, Clock, BookOpen } from 'lucide-react';

interface ExternalCourse {
  id: string;
  title: string;
  provider: 'LinkedIn Learning' | 'Udemy' | 'Coursera';
  duration: string;
  status: 'completed' | 'in_progress' | 'not_started';
  url: string;
  completedDate?: string;
}

const courses: ExternalCourse[] = [
  { id: '1', title: 'Advanced React Patterns', provider: 'LinkedIn Learning', duration: '4h 30m', status: 'completed', url: '#', completedDate: '2025-01-10' },
  { id: '2', title: 'Machine Learning A-Z', provider: 'Udemy', duration: '44h', status: 'in_progress', url: '#' },
  { id: '3', title: 'Google Cloud Professional Certificate', provider: 'Coursera', duration: '120h', status: 'in_progress', url: '#' },
  { id: '4', title: 'Leadership Communication', provider: 'LinkedIn Learning', duration: '2h 15m', status: 'not_started', url: '#' },
  { id: '5', title: 'Python for Data Science', provider: 'Udemy', duration: '36h', status: 'not_started', url: '#' },
];

const providerColors: Record<string, string> = {
  'LinkedIn Learning': 'bg-blue-50 text-blue-600 dark:bg-blue-900/20',
  'Udemy': 'bg-purple-50 text-purple-600 dark:bg-purple-900/20',
  'Coursera': 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20',
};

const statusConfig = {
  completed: { icon: CheckCircle, color: 'text-emerald-500', label: 'Completed' },
  in_progress: { icon: Clock, color: 'text-sunset-amber', label: 'In Progress' },
  not_started: { icon: BookOpen, color: 'text-silver-mist', label: 'Not Started' },
};

export function ExternalContentIntegration() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm text-ink-black dark:text-pearl">External Learning</h3>
        <div className="flex items-center gap-2 text-xs text-silver-mist">
          <span>{courses.filter((c) => c.status === 'completed').length}/{courses.length} completed</span>
        </div>
      </div>

      <div className="space-y-2">
        {courses.map((course) => {
          const status = statusConfig[course.status];
          const StatusIcon = status.icon;
          return (
            <div key={course.id} className="bg-white dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 p-3 flex items-center justify-between group">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 rounded-lg bg-celestial-indigo/10 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-celestial-indigo" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink-black dark:text-pearl">{course.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${providerColors[course.provider]}`}>{course.provider}</span>
                    <span className="text-xs text-silver-mist">{course.duration}</span>
                    {course.completedDate && <span className="text-xs text-silver-mist">Completed {course.completedDate}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`flex items-center gap-1 text-xs font-medium ${status.color}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {status.label}
                </span>
                <a href={course.url} className="p-1.5 text-silver-mist hover:text-celestial-indigo opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
