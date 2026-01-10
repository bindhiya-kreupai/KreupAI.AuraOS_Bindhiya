'use client';

import React from 'react';
import { Coffee, Gamepad2, Music, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { useRemoteWork } from '@/app/dashboard/remote-work/hooks/useRemoteWork';

export default function VirtualTeamBuildingPage() {
  const { loading, error } = useRemoteWork();

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
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

  return (
    <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Coffee className="w-6 h-6 text-indigo-500" />
            Virtual Team Building
          </h1>
          <p className="text-slate-500 text-sm">
            Events and activities to keep the team connected.
          </p>
        </div>
      </div>

      {/* Hero Event */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl h-64 bg-slate-900 group">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10"></div>
        {/* Mock Image Placeholder using CSS pattern */}
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900 via-indigo-900 to-slate-900"></div>

        <div className="absolute bottom-0 left-0 p-8 z-20 w-full">
          <div className="flex justify-between items-end">
            <div>
              <span className="inline-block px-3 py-1 bg-amber-500 text-white rounded-lg text-xs font-bold mb-3 shadow-lg">
                This Friday
              </span>
              <h2 className="text-4xl font-black text-white mb-2">Global Trivia Night 🌍</h2>
              <p className="text-slate-300 max-w-md">
                Join us for a battle of wits! Teams will be randomized to encourage cross-department
                mingling.
              </p>
            </div>
            <button className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold shadow-lg hover:bg-slate-100 transition-colors flex items-center gap-2">
              RSVP Now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <h3 className="font-bold text-lg pt-4">More Activities</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: 'Among Us Tournament',
            type: 'Gaming',
            time: 'Wed, 5:00 PM',
            icon: Gamepad2,
            color: 'bg-rose-500',
          },
          {
            title: 'Lo-Fi Listening Party',
            type: 'Chill',
            time: 'Mon, 9:00 AM',
            icon: Music,
            color: 'bg-indigo-500',
          },
          {
            title: 'Virtual Coffee Roulette',
            type: 'Networking',
            time: 'Tue, 10:00 AM',
            icon: Coffee,
            color: 'bg-emerald-500',
          },
        ].map((event, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:scale-[1.02] transition-transform cursor-pointer"
          >
            <div
              className={`w-12 h-12 rounded-2xl ${event.color} flex items-center justify-center text-white mb-4 shadow-lg`}
            >
              <event.icon className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-lg mb-1">{event.title}</h4>
            <div className="text-sm text-slate-500 mb-4">{event.type}</div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
              <Calendar className="w-3 h-3" /> {event.time}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-3xl text-center border border-indigo-100 dark:border-indigo-900/50">
        <h3 className="font-bold text-lg mb-2 text-indigo-900 dark:text-indigo-300">
          Have an idea?
        </h3>
        <p className="text-sm text-indigo-700 dark:text-indigo-400 mb-6 max-w-xs mx-auto">
          Suggest the next team building activity! We love trying new things.
        </p>
        <button className="px-6 py-2 border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl hover:bg-indigo-500 hover:text-white transition-all">
          Submit Suggestion
        </button>
      </div>
    </div>
  );
}
