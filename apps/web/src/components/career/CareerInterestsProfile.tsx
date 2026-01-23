"use client";

import React, { useState } from 'react';
import { Target, MapPin, Briefcase, Star } from 'lucide-react';

interface CareerInterest {
  id: string;
  label: string;
  selected: boolean;
}

const initialInterests: CareerInterest[] = [
  { id: '1', label: 'People Management', selected: true },
  { id: '2', label: 'Technical Leadership', selected: true },
  { id: '3', label: 'Strategy & Planning', selected: false },
  { id: '4', label: 'Product Development', selected: false },
  { id: '5', label: 'Cross-functional Projects', selected: true },
  { id: '6', label: 'International Assignments', selected: false },
  { id: '7', label: 'Mentoring & Coaching', selected: true },
  { id: '8', label: 'Innovation & R&D', selected: false },
];

export function CareerInterestsProfile() {
  const [interests, setInterests] = useState(initialInterests);
  const [preferredLocation, setPreferredLocation] = useState('Flexible');
  const [targetRole, setTargetRole] = useState('Senior Engineering Manager');

  const toggleInterest = (id: string) => {
    setInterests((prev) =>
      prev.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i))
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-celestial-indigo" />
          <h3 className="font-bold text-ink-black dark:text-pearl">Career Aspirations</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-xs font-medium text-silver-mist uppercase mb-1 block">Target Role</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
              <Briefcase className="w-4 h-4 text-celestial-indigo" />
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="bg-transparent text-sm text-ink-black dark:text-pearl outline-none flex-1"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-silver-mist uppercase mb-1 block">Preferred Location</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
              <MapPin className="w-4 h-4 text-celestial-indigo" />
              <input
                type="text"
                value={preferredLocation}
                onChange={(e) => setPreferredLocation(e.target.value)}
                className="bg-transparent text-sm text-ink-black dark:text-pearl outline-none flex-1"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-silver-mist uppercase mb-2 block">Areas of Interest</label>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <button
                key={interest.id}
                onClick={() => toggleInterest(interest.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  interest.selected
                    ? 'bg-celestial-indigo/10 text-celestial-indigo border border-celestial-indigo/30'
                    : 'bg-slate-100 dark:bg-deep-cosmos text-silver-mist border border-cloud dark:border-nebula-purple/30 hover:border-celestial-indigo/50'
                }`}
              >
                {interest.selected && <Star className="w-3 h-3 inline mr-1" />}
                {interest.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
