"use client";

import React, { useState } from 'react';
import { Compass, MapPin, TrendingUp, Briefcase, Star, BookOpen, Target, ChevronRight } from 'lucide-react';

interface CareerGoal {
  id: string;
  title: string;
  timeline: string;
  progress: number;
}

const careerGoals: CareerGoal[] = [
  { id: '1', title: 'Transition to Staff Engineer', timeline: '12-18 months', progress: 45 },
  { id: '2', title: 'Lead a cross-functional project', timeline: '6 months', progress: 70 },
  { id: '3', title: 'Develop mentoring skills', timeline: 'Ongoing', progress: 30 },
];

const interests = [
  { id: '1', label: 'Technical Leadership', selected: true },
  { id: '2', label: 'People Management', selected: false },
  { id: '3', label: 'Architecture & Design', selected: true },
  { id: '4', label: 'Product Management', selected: false },
  { id: '5', label: 'Data & Analytics', selected: true },
  { id: '6', label: 'DevOps & Infrastructure', selected: false },
  { id: '7', label: 'Security Engineering', selected: false },
  { id: '8', label: 'Machine Learning / AI', selected: true },
];

const openRoles = [
  { id: '1', title: 'Staff Engineer - Platform', dept: 'Engineering', match: 92 },
  { id: '2', title: 'Tech Lead - Data Pipeline', dept: 'Data Engineering', match: 85 },
  { id: '3', title: 'Senior Architect', dept: 'Architecture', match: 78 },
];

export default function CareerInterestsPage() {
  const [selectedInterests, setSelectedInterests] = useState(
    interests.filter(i => i.selected).map(i => i.id)
  );

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Career Interests</h1>
        <p className="text-sm text-silver-mist mt-1">Explore career paths and set professional development goals</p>
      </div>

      {/* Career Goals */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-cloud dark:border-nebula-purple/50 flex items-center justify-between">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl">My Career Goals</h3>
          <button className="text-xs text-celestial-indigo font-medium hover:underline">+ Add Goal</button>
        </div>
        <div className="divide-y divide-cloud dark:divide-nebula-purple/50">
          {careerGoals.map((goal) => (
            <div key={goal.id} className="px-5 py-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-celestial-indigo" />
                  <p className="text-sm font-medium text-ink-black dark:text-pearl">{goal.title}</p>
                </div>
                <span className="text-xs text-silver-mist">{goal.timeline}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-slate-100 dark:bg-deep-cosmos rounded-full overflow-hidden">
                  <div className="h-full bg-celestial-indigo rounded-full" style={{ width: `${goal.progress}%` }} />
                </div>
                <span className="text-xs font-medium text-celestial-indigo">{goal.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interest Tags */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
        <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-3">Areas of Interest</h3>
        <p className="text-xs text-silver-mist mb-4">Select areas you would like to explore or grow into:</p>
        <div className="flex flex-wrap gap-2">
          {interests.map((interest) => (
            <button
              key={interest.id}
              onClick={() => toggleInterest(interest.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedInterests.includes(interest.id)
                  ? 'bg-celestial-indigo text-white'
                  : 'bg-slate-100 dark:bg-deep-cosmos text-silver-mist hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {interest.label}
            </button>
          ))}
        </div>
      </div>

      {/* Internal Mobility */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-cloud dark:border-nebula-purple/50">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl">Recommended Internal Roles</h3>
          <p className="text-xs text-silver-mist mt-0.5">Based on your skills and interests</p>
        </div>
        <div className="divide-y divide-cloud dark:divide-nebula-purple/50">
          {openRoles.map((role) => (
            <div key={role.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors cursor-pointer group">
              <div className="p-2.5 rounded-lg bg-celestial-indigo/10">
                <Briefcase className="w-5 h-5 text-celestial-indigo" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink-black dark:text-pearl">{role.title}</p>
                <p className="text-xs text-silver-mist">{role.dept}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${role.match >= 90 ? 'text-emerald-600' : role.match >= 80 ? 'text-celestial-indigo' : 'text-sunset-amber'}`}>
                  {role.match}% match
                </span>
                <ChevronRight className="w-4 h-4 text-silver-mist opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skill Development */}
      <div className="bg-gradient-to-r from-celestial-indigo/5 to-purple-500/5 dark:from-celestial-indigo/10 dark:to-purple-500/10 border border-celestial-indigo/20 rounded-lg p-4 flex items-start gap-3">
        <BookOpen className="w-4 h-4 text-celestial-indigo mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs font-medium text-celestial-indigo">Skill Development Tip</p>
          <p className="text-xs text-celestial-indigo/70 mt-0.5">
            Based on your career goals, we recommend focusing on system design and technical communication skills. Check out the Learning Paths for curated courses.
          </p>
        </div>
      </div>
    </div>
  );
}
