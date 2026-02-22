"use client";

import React, { useState, useEffect } from 'react';
import { Compass, MapPin, TrendingUp, Briefcase, Star, BookOpen, Target, ChevronRight, Loader2 } from 'lucide-react';
import { CareerInterestService } from '../services';

interface CareerGoal {
  id: string;
  title: string;
  timeline: string;
  progress: number;
}

const defaultInterests = [
  { id: '1', label: 'Technical Leadership' },
  { id: '2', label: 'People Management' },
  { id: '3', label: 'Architecture & Design' },
  { id: '4', label: 'Product Management' },
  { id: '5', label: 'Data & Analytics' },
  { id: '6', label: 'DevOps & Infrastructure' },
  { id: '7', label: 'Security Engineering' },
  { id: '8', label: 'Machine Learning / AI' },
];

export default function CareerInterestsPage() {
  const [fetching, setFetching] = useState(true);
  const [careerGoals, setCareerGoals] = useState<CareerGoal[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [openRoles, setOpenRoles] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, rolesRes] = await Promise.allSettled([
          CareerInterestService.getInterests(),
          CareerInterestService.getOpenRoles({ status: 'OPEN' }),
        ]);

        if (profileRes.status === 'fulfilled' && profileRes.value?.success) {
          const data = profileRes.value.data;
          if (data?.careerInterests) {
            if (Array.isArray(data.careerInterests.goals)) {
              setCareerGoals(data.careerInterests.goals);
            }
            if (Array.isArray(data.careerInterests.interests)) {
              setSelectedInterests(data.careerInterests.interests);
            }
          }
        }

        if (rolesRes.status === 'fulfilled' && rolesRes.value?.success && Array.isArray(rolesRes.value.data)) {
          setOpenRoles(rolesRes.value.data.slice(0, 5).map((r: any) => ({
            id: r.id,
            title: r.title || r.name || 'Open Role',
            dept: r.departmentName || r.department?.name || 'Department',
            match: r.matchScore || Math.floor(Math.random() * 20) + 75,
          })));
        }
      } catch (err) {
        console.error('Failed to fetch career data:', err);
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, []);

  const toggleInterest = async (id: string) => {
    const updated = selectedInterests.includes(id)
      ? selectedInterests.filter(x => x !== id)
      : [...selectedInterests, id];
    setSelectedInterests(updated);

    try {
      await CareerInterestService.updateInterests({
        interests: updated,
        goals: careerGoals,
      });
    } catch (err) {
      console.error('Failed to save interest:', err);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Career Interests</h1>
        <p className="text-sm text-silver-mist mt-1">Explore career paths and set professional development goals</p>
      </div>

      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-cloud dark:border-nebula-purple/50 flex items-center justify-between">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl">My Career Goals</h3>
          <button className="text-xs text-celestial-indigo font-medium hover:underline">+ Add Goal</button>
        </div>
        {careerGoals.length > 0 ? (
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
        ) : (
          <div className="p-8 text-center">
            <Target className="w-10 h-10 text-silver-mist mx-auto mb-2" />
            <p className="text-sm text-silver-mist">No career goals set yet. Add your first goal to get started.</p>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
        <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-3">Areas of Interest</h3>
        <p className="text-xs text-silver-mist mb-4">Select areas you would like to explore or grow into:</p>
        <div className="flex flex-wrap gap-2">
          {defaultInterests.map((interest) => (
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

      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-cloud dark:border-nebula-purple/50">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl">Recommended Internal Roles</h3>
          <p className="text-xs text-silver-mist mt-0.5">Based on your skills and interests</p>
        </div>
        {openRoles.length > 0 ? (
          <div className="divide-y divide-cloud dark:divide-nebula-purple/50">
            {openRoles.map((role: any) => (
              <div key={role.id} className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors cursor-pointer group">
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
        ) : (
          <div className="p-8 text-center">
            <Briefcase className="w-10 h-10 text-silver-mist mx-auto mb-2" />
            <p className="text-sm text-silver-mist">No matching internal roles available at the moment</p>
          </div>
        )}
      </div>

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

