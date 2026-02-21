"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Clock,
  Layers,
  BarChart2,
  Search,
  Filter,
  ChevronRight,
} from "lucide-react";

interface LearningPath {
  id: string;
  title: string;
  description: string;
  duration: string;
  modulesCount: number;
  difficulty: string;
  category: string;
  enrolled: boolean;
  enrolledCount: number;
  rating: number;
  thumbnail: string;
}

const difficultyColor: Record<string, string> = {
  beginner: "text-aurora-green",
  Beginner: "text-aurora-green",
  intermediate: "text-yellow-500",
  Intermediate: "text-yellow-500",
  advanced: "text-red-500",
  Advanced: "text-red-500",
};

export default function LearningPaths() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("All");
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/learning/paths')
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data) {
          const mappedPaths: LearningPath[] = result.data.map((p: Record<string, unknown>) => ({
            id: p.id as string,
            title: p.title as string,
            description: p.description as string,
            duration: (p.duration as string) || 'N/A',
            modulesCount: (p.modulesCount as number) || 0,
            difficulty: ((p.level || p.difficulty || 'beginner') as string),
            category: (p.category as string) || 'General',
            enrolled: false,
            enrolledCount: (p.enrolledCount as number) || 0,
            rating: (p.rating as number) || 0,
            thumbnail: (p.thumbnail as string) || '',
          }));
          setPaths(mappedPaths);
        } else {
          setError('Failed to load learning paths');
        }
      })
      .catch((err) => {
        console.error('LearningPaths fetch error:', err);
        setError('Failed to load learning paths');
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredPaths = paths.filter((path) => {
    const matchesSearch =
      path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      path.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty =
      filterDifficulty === "All" || path.difficulty.toLowerCase() === filterDifficulty.toLowerCase();
    return matchesSearch && matchesDifficulty;
  });

  const handleEnroll = (id: string) => {
    fetch(`/api/v1/learning/paths/${id}/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hoursPerWeek: 5 }),
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setPaths((prev) =>
            prev.map((p) => (p.id === id ? { ...p, enrolled: true } : p))
          );
        }
      })
      .catch(console.error);
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen">
        <div className="mb-6">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-2 animate-pulse" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-72 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden animate-pulse">
              <div className="h-32 bg-slate-200 dark:bg-slate-700" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32" />
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-48" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">
          Learning Path Catalog
        </h1>
        <p className="text-silver-mist mt-1">
          Explore curated learning paths to advance your career
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
          <input
            type="text"
            placeholder="Search learning paths..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-2 focus:ring-celestial-indigo"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-silver-mist" />
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo"
          >
            <option value="All">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPaths.map((path) => (
          <div
            key={path.id}
            className="rounded-xl border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="h-32 bg-gradient-to-br from-celestial-indigo/20 to-nebula-purple/20 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-celestial-indigo" />
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-celestial-indigo/10 text-celestial-indigo">
                  {path.category}
                </span>
                <span className={`text-xs font-medium ${difficultyColor[path.difficulty] || 'text-silver-mist'}`}>
                  {path.difficulty.charAt(0).toUpperCase() + path.difficulty.slice(1)}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-ink-black dark:text-pearl mt-2">
                {path.title}
              </h3>
              <p className="text-sm text-silver-mist mt-1 line-clamp-2">
                {path.description}
              </p>

              <div className="flex items-center gap-4 mt-4 text-sm text-silver-mist">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{path.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Layers className="w-4 h-4" />
                  <span>{path.modulesCount} modules</span>
                </div>
                <div className="flex items-center gap-1">
                  <BarChart2 className="w-4 h-4" />
                  <span>{path.enrolledCount}</span>
                </div>
              </div>

              <button
                onClick={() => handleEnroll(path.id)}
                disabled={path.enrolled}
                className={`mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  path.enrolled
                    ? "bg-aurora-green/10 text-aurora-green cursor-default"
                    : "bg-celestial-indigo text-white hover:bg-celestial-indigo/90"
                }`}
              >
                {path.enrolled ? (
                  "Enrolled"
                ) : (
                  <>
                    Enroll Now <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
        {filteredPaths.length === 0 && (
          <div className="col-span-full text-center py-12 text-sm text-silver-mist">
            No learning paths found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
}
