'use client';

import React from 'react';
import { Award, BookOpen, Plane, Clock, UserCheck } from 'lucide-react';

export default function PilotTrainingPage() {
  return (
    <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            Pilot Training & Standards
          </h1>
          <p className="text-slate-500 text-sm">
            Simulator checks, type ratings, and license currency.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-xl text-sm font-bold border border-amber-100 dark:border-amber-800/30">
          <UserCheck className="w-4 h-4" /> 100% Compliance
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
        {/* Cert Tracking */}
        <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
          <h3 className="font-bold text-lg mb-2">Flight Crew Qualifications</h3>
          {[
            {
              name: 'Capt. Maverick',
              rank: 'Captain',
              types: 'A380, B787',
              medical: 'Valid (Dec 25)',
              sim: 'Passed (Oct)',
            },
            {
              name: 'FO Goose',
              rank: 'First Officer',
              types: 'A320',
              medical: 'Valid (Nov 25)',
              sim: 'Due Next Month',
              warning: true,
            },
            {
              name: 'Capt. Sully',
              rank: 'Senior Captain',
              types: 'A320, A350',
              medical: 'Valid (Jan 26)',
              sim: 'Passed (Nov)',
            },
            {
              name: 'SO Skywalker',
              rank: 'Second Officer',
              types: 'B787',
              medical: 'Valid (Feb 26)',
              sim: 'Passed (Sep)',
            },
          ].map((p, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 border-2 border-amber-100 dark:border-amber-900/30">
                  {p.name.split(' ').length > 1 ? p.name.split(' ')[1][0] : p.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">{p.name}</h3>
                  <div className="text-xs text-slate-500 font-bold mb-1">{p.rank}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <Plane className="w-3 h-3" /> Types: {p.types}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div
                    className={`text-xs font-bold ${p.warning ? 'text-amber-500' : 'text-emerald-500'}`}
                  >
                    {p.sim}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase">Sim Check</div>
                </div>
                <div className="text-right border-l border-slate-100 dark:border-slate-800 pl-4">
                  <div className="text-xs font-bold text-emerald-500">{p.medical}</div>
                  <div className="text-[10px] text-slate-400 uppercase">Class 1 Medical</div>
                </div>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Simulator Schedule */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" /> Simulator Booking
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-sm">Sim Bay 1 (A380)</h4>
                  <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-bold">
                    Booked
                  </span>
                </div>
                <p className="text-xs text-slate-500">09:00 - 13:00 • Crew: Capt. Maverick</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-sm">Sim Bay 2 (B787)</h4>
                  <span className="text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded font-bold">
                    Maint
                  </span>
                </div>
                <p className="text-xs text-slate-500">Offline until 14:00</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-sm">Review Room</h4>
                  <span className="text-[10px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded font-bold">
                    Avail
                  </span>
                </div>
                <button className="w-full mt-2 text-xs font-bold text-indigo-500 hover:underline text-left">
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
