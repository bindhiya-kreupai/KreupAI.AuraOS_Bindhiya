'use client';

import React from 'react';
import { Heart, Sun, Moon, BookOpen, Users, Loader2 } from 'lucide-react';
import { useRemoteWork } from '@/app/dashboard/remote-work/hooks/useRemoteWork';

export default function WellbeingSupportPage() {
  const { employees, loading, error } = useRemoteWork();

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-6rem)] items-center justify-center text-rose-500 font-bold">
        Error: {error}
      </div>
    );
  }

  // Aggregating wellbeing metrics from employees
  const supportNeededCount = employees.filter((e) => e.wellbeing.supportNeeded).length;
  const highBurnoutCount = employees.filter((e) => e.wellbeing.burnoutRisk === 'high').length;

  return (
    <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500" />
            Well-being Support
          </h1>
          <p className="text-slate-500 text-sm">Mental health resources and daily check-ins.</p>
        </div>
        {(supportNeededCount > 0 || highBurnoutCount > 0) && (
          <div className="bg-rose-50 dark:bg-rose-900/20 px-4 py-2 rounded-xl text-rose-700 dark:text-rose-400 text-sm font-bold border border-rose-100 dark:border-rose-800/30 flex items-center gap-2">
            <Heart className="w-4 h-4 animate-pulse" /> {supportNeededCount} Team members need
            support
          </div>
        )}
      </div>

      {/* Daily Check-in */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
        <div className="inline-flex items-center justify-center p-3 bg-rose-50 dark:bg-rose-900/20 rounded-full mb-4">
          <Sun className="w-6 h-6 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">How are you feeling today?</h2>
        <p className="text-slate-500 mb-8 max-w-sm mx-auto text-sm">
          Your response is private and helps us understand overall team sentiment.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          {['🤩 Great', '🙂 Good', '😐 Okay', '😫 Stressed', '🤒 Unwell'].map((mood, i) => (
            <button
              key={i}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl font-bold text-sm hover:border-indigo-500 hover:text-indigo-600 transition-all transform hover:-translate-y-1"
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      <h3 className="font-bold text-lg pt-4">Resources</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-teal-400 to-emerald-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
            <Moon className="w-6 h-6 text-white" />
          </div>
          <h4 className="font-bold text-xl mb-2">Meditation App</h4>
          <p className="text-emerald-50 text-sm mb-4">Premium subscription included.</p>
          <button className="px-4 py-2 bg-white text-emerald-600 rounded-lg text-xs font-bold">
            Access Now
          </button>
        </div>

        <div className="bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h4 className="font-bold text-xl mb-2">Counseling</h4>
          <p className="text-indigo-50 text-sm mb-4">Confidential 1:1 sessions.</p>
          <button className="px-4 py-2 bg-white text-indigo-600 rounded-lg text-xs font-bold">
            Book Slot
          </button>
        </div>

        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h4 className="font-bold text-xl mb-2">Reading List</h4>
          <p className="text-orange-50 text-sm mb-4">Curated books on balance.</p>
          <button className="px-4 py-2 bg-white text-orange-600 rounded-lg text-xs font-bold">
            Browse Library
          </button>
        </div>
      </div>
    </div>
  );
}
