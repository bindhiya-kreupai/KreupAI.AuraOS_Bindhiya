"use client";

import React, { useState } from 'react';
import { Search, MapPin, Clock, Building2, ChevronRight } from 'lucide-react';

interface InternalJob {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Project';
  postedDays: number;
  matchScore: number;
  description: string;
}

const jobs: InternalJob[] = [
  { id: '1', title: 'Senior Product Manager', department: 'Product', location: 'Remote', type: 'Full-time', postedDays: 3, matchScore: 92, description: 'Lead product strategy for our enterprise platform.' },
  { id: '2', title: 'Engineering Team Lead', department: 'Engineering', location: 'New York', type: 'Full-time', postedDays: 5, matchScore: 87, description: 'Manage a team of 8 engineers building core services.' },
  { id: '3', title: 'Data Science Lead', department: 'Analytics', location: 'London', type: 'Full-time', postedDays: 1, matchScore: 75, description: 'Drive ML initiatives for workforce analytics.' },
  { id: '4', title: 'UX Research Project', department: 'Design', location: 'Remote', type: 'Project', postedDays: 7, matchScore: 68, description: '6-month project to redesign onboarding flow.' },
  { id: '5', title: 'HR Business Partner', department: 'HR', location: 'Chicago', type: 'Full-time', postedDays: 2, matchScore: 60, description: 'Partner with engineering to drive people strategy.' },
];

export function InternalJobMarketplace() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');

  const filtered = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.department.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || job.department.toLowerCase() === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
          <input
            type="text"
            placeholder="Search internal opportunities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-lg text-ink-black dark:text-pearl placeholder:text-silver-mist outline-none focus:border-celestial-indigo"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-lg text-ink-black dark:text-pearl outline-none"
        >
          <option value="all">All Departments</option>
          <option value="engineering">Engineering</option>
          <option value="product">Product</option>
          <option value="design">Design</option>
          <option value="hr">HR</option>
          <option value="analytics">Analytics</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((job) => (
          <div
            key={job.id}
            className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 hover:border-celestial-indigo/50 transition-colors group cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm text-ink-black dark:text-pearl group-hover:text-celestial-indigo transition-colors">
                    {job.title}
                  </h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    job.matchScore >= 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-silver-mist'
                  }`}>
                    {job.matchScore}% match
                  </span>
                </div>
                <p className="text-xs text-silver-mist mb-2">{job.description}</p>
                <div className="flex items-center gap-4 text-xs text-silver-mist">
                  <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{job.department}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.postedDays}d ago</span>
                  <span className="px-2 py-0.5 bg-celestial-indigo/10 text-celestial-indigo rounded-full text-[10px] font-medium">{job.type}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-silver-mist group-hover:text-celestial-indigo transition-colors mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
