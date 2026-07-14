'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';

interface ProfileField {
  label: string;
  completed: boolean;
  category: string;
}

function buildProfileFields(data: Record<string, unknown>): ProfileField[] {
  return [
    { label: 'First Name', completed: !!data.firstName, category: 'Basic' },
    { label: 'Last Name', completed: !!data.lastName, category: 'Basic' },
    { label: 'Job Title', completed: !!data.jobTitle, category: 'Basic' },
    { label: 'Department', completed: !!data.department, category: 'Basic' },
    { label: 'Personal Email', completed: !!data.personalEmail, category: 'Contact' },
    { label: 'Mobile Phone', completed: !!data.mobilePhone, category: 'Contact' },
    { label: 'Address', completed: !!data.address, category: 'Contact' },
    { label: 'City', completed: !!data.city, category: 'Contact' },
    { label: 'Country', completed: !!data.country, category: 'Contact' },
    { label: 'Date of Birth', completed: !!data.dateOfBirth, category: 'Personal' },
    {
      label: 'Gender',
      completed: !!data.gender && data.gender !== 'prefer_not_to_say',
      category: 'Personal',
    },
    { label: 'Nationality', completed: !!data.nationality, category: 'Personal' },
    { label: 'Profile Photo', completed: !!data.profilePhoto, category: 'Profile' },
  ];
}

export default function ProfileCompletenessIndicator() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-services', 'profile'],
    queryFn: async () => {
      const res = await fetch('/api/my-services/profile');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      return json.success ? json.data : null;
    },
    staleTime: 30_000,
  });

  const profileFields = data ? buildProfileFields(data) : [];
  const completedCount = profileFields.filter((f) => f.completed).length;
  const totalCount = profileFields.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const categories = Array.from(new Set(profileFields.map((f) => f.category)));

  const getProgressColor = (pct: number) => {
    if (pct >= 80) return 'bg-green-500';
    if (pct >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getStatusColor = (pct: number) => {
    if (pct >= 80) return 'text-green-600 dark:text-green-400';
    if (pct >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
          Profile Completeness
        </h3>
        <span className={`text-2xl font-bold ${getStatusColor(percentage)}`}>{percentage}%</span>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getProgressColor(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-slate-400 mb-6">
        {completedCount} of {totalCount} fields completed
      </p>

      {/* Category Breakdown */}
      <div className="space-y-4">
        {categories.map((category) => {
          const fields = profileFields.filter((f) => f.category === category);
          const catCompleted = fields.filter((f) => f.completed).length;
          const catTotal = fields.length;

          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  {category}
                </span>
                <span className="text-xs text-slate-400">
                  {catCompleted}/{catTotal}
                </span>
              </div>
              <div className="space-y-1.5">
                {fields.map((field) => (
                  <div key={field.label} className="flex items-center gap-2 text-sm">
                    {field.completed ? (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                    )}
                    <span
                      className={
                        field.completed
                          ? 'text-slate-600 dark:text-slate-400'
                          : 'text-slate-900 dark:text-slate-100 font-medium'
                      }
                    >
                      {field.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Incomplete Warning */}
      {percentage < 100 && (
        <div className="mt-6 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800/30 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Complete your profile to unlock all features and ensure accurate payroll processing.
          </p>
        </div>
      )}
    </div>
  );
}
