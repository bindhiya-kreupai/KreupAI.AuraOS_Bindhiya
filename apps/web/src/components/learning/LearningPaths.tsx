/**
 * @module LearningPaths
 * @description Learning path catalog — browse, filter, and discover
 *              structured learning journeys with skill tags and ratings
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Map, Search, Star, Clock, Users, BookOpen, Award, Play } from 'lucide-react';
import type { LearningPathData, PathLevel } from '@/services/learningService';

// ── Types ────────────────────────────────────────────────────────────────────────

export interface LearningPathsProps {
  paths: LearningPathData[];
  onSelectPath: (pathId: string) => void;
  onEnroll: (pathId: string) => void;
}

// ── Config ───────────────────────────────────────────────────────────────────────

const LEVEL_CONFIG: Record<PathLevel, { label: string; color: string; bg: string }> = {
  beginner: { label: 'Beginner', color: 'text-neural-mint', bg: 'bg-neural-mint/10' },
  intermediate: {
    label: 'Intermediate',
    color: 'text-celestial-indigo',
    bg: 'bg-celestial-indigo/10',
  },
  advanced: { label: 'Advanced', color: 'text-sunset-amber', bg: 'bg-sunset-amber/10' },
  expert: { label: 'Expert', color: 'text-coral-alert', bg: 'bg-coral-alert/10' },
};

// ── Component ────────────────────────────────────────────────────────────────────

export const LearningPaths: React.FC<LearningPathsProps> = ({ paths, onSelectPath, onEnroll }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<PathLevel | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = useMemo(() => {
    const set = new Set<string>();
    paths.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, [paths]);

  const filtered = useMemo(() => {
    let list = paths;
    if (levelFilter !== 'all') list = list.filter((p) => p.level === levelFilter);
    if (categoryFilter !== 'all') list = list.filter((p) => p.category === categoryFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.skills.some((s) => s.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [paths, levelFilter, categoryFilter, searchQuery]);

  const enrolledCount = paths.filter((p) => p.isEnrolled).length;
  const completedCount = paths.filter((p) => p.enrollmentStatus === 'completed').length;

  return (
    <div className="space-y-3">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          {
            label: 'Available Paths',
            value: paths.length,
            icon: Map,
            color: 'text-celestial-indigo',
          },
          { label: 'Enrolled', value: enrolledCount, icon: BookOpen, color: 'text-sunset-amber' },
          { label: 'Completed', value: completedCount, icon: Award, color: 'text-neural-mint' },
          {
            label: 'Avg Rating',
            value: (paths.reduce((s, p) => s + p.rating, 0) / (paths.length || 1)).toFixed(1),
            icon: Star,
            color: 'text-sunset-amber',
          },
        ].map((stat) => {
          const StatIcon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-3 text-center"
            >
              <StatIcon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
              <p className={`text-[14px] font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-[7px] text-silver-mist font-bold">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-3 h-3 text-silver-mist absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search paths, skills, categories..."
            className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue text-[10px] text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
          />
        </div>

        {/* Level Filter */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setLevelFilter('all')}
            className={`px-2 py-1 rounded-md text-[8px] font-bold transition-colors ${
              levelFilter === 'all'
                ? 'bg-celestial-indigo/10 text-celestial-indigo'
                : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
            }`}
          >
            All Levels
          </button>
          {(Object.keys(LEVEL_CONFIG) as PathLevel[]).map((level) => {
            const cfg = LEVEL_CONFIG[level];
            return (
              <button
                key={level}
                onClick={() => setLevelFilter(level)}
                className={`px-2 py-1 rounded-md text-[8px] font-bold transition-colors ${
                  levelFilter === level
                    ? `${cfg.bg} ${cfg.color}`
                    : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
                }`}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-2 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue text-[9px] text-ink-black dark:text-pearl outline-none"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Path Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((path) => {
          const levelCfg = LEVEL_CONFIG[path.level];
          const completedCourses = path.courses.filter((c) => c.status === 'completed').length;

          return (
            <div
              key={path.id}
              className={`rounded-xl border overflow-hidden transition-all hover:shadow-md cursor-pointer ${
                path.isEnrolled
                  ? 'border-celestial-indigo/20 bg-white dark:bg-stellar-blue'
                  : 'border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue'
              }`}
              onClick={() => onSelectPath(path.id)}
            >
              {/* Card Header */}
              <div className="p-3">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-celestial-indigo/10 flex items-center justify-center text-xl shrink-0">
                    {path.thumbnailEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[11px] font-bold text-ink-black dark:text-pearl truncate">
                        {path.title}
                      </p>
                      {path.isEnrolled && (
                        <span className="px-1 py-0.5 rounded text-[6px] font-bold bg-celestial-indigo/10 text-celestial-indigo shrink-0">
                          ENROLLED
                        </span>
                      )}
                    </div>
                    <p className="text-[8px] text-silver-mist mt-0.5 line-clamp-2">
                      {path.description}
                    </p>

                    {/* Meta Row */}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span
                        className={`px-1 py-0.5 rounded text-[7px] font-bold ${levelCfg.color} ${levelCfg.bg}`}
                      >
                        {levelCfg.label}
                      </span>
                      <span className="text-[7px] text-silver-mist">{path.category}</span>
                      <span className="text-[7px] text-silver-mist flex items-center gap-0.5">
                        <Clock className="w-2 h-2" /> {path.totalDuration}h
                      </span>
                      <span className="text-[7px] text-silver-mist flex items-center gap-0.5">
                        <BookOpen className="w-2 h-2" /> {path.courses.length} courses
                      </span>
                      <span className="text-[7px] text-sunset-amber flex items-center gap-0.5 font-bold">
                        <Star className="w-2 h-2 fill-current" /> {path.rating}
                      </span>
                      <span className="text-[7px] text-silver-mist flex items-center gap-0.5">
                        <Users className="w-2 h-2" /> {path.enrollmentCount}
                      </span>
                    </div>

                    {/* Skills */}
                    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                      {path.skills.slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          className="px-1.5 py-0.5 rounded-full text-[6px] font-bold bg-cloud/50 dark:bg-nebula-purple/10 text-silver-mist"
                        >
                          {skill}
                        </span>
                      ))}
                      {path.skills.length > 4 && (
                        <span className="text-[7px] text-silver-mist">
                          +{path.skills.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress or Enroll */}
              {path.isEnrolled ? (
                <div className="px-3 pb-3">
                  <div className="flex items-center justify-between text-[8px] mb-1">
                    <span className="text-silver-mist">
                      {completedCourses}/{path.courses.length} courses
                    </span>
                    <span className="font-bold text-celestial-indigo">{path.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-cloud dark:bg-nebula-purple/20">
                    <div
                      className={`h-full rounded-full transition-all ${path.progress >= 100 ? 'bg-neural-mint' : 'bg-celestial-indigo'}`}
                      style={{ width: `${path.progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="px-3 pb-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEnroll(path.id);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[9px] font-bold bg-celestial-indigo text-white hover:opacity-90 transition-opacity"
                  >
                    <Play className="w-3 h-3" /> Enroll in Path
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-6 text-center">
          <Map className="w-8 h-8 mx-auto text-silver-mist/30 mb-2" />
          <p className="text-[10px] text-silver-mist">No paths match your search</p>
        </div>
      )}
    </div>
  );
};

export default LearningPaths;
