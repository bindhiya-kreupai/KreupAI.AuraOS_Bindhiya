"use client";

import React, { useState } from "react";
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
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  enrolled: boolean;
  enrolledCount: number;
  thumbnail: string;
}

const mockPaths: LearningPath[] = [
  {
    id: "lp-001",
    title: "Leadership Fundamentals",
    description: "Build essential leadership skills including communication, delegation, and team management for new and aspiring managers.",
    duration: "12 hours",
    modulesCount: 8,
    difficulty: "Beginner",
    category: "Leadership",
    enrolled: false,
    enrolledCount: 342,
    thumbnail: "/images/leadership.jpg",
  },
  {
    id: "lp-002",
    title: "Advanced Data Analytics",
    description: "Master data visualization, statistical analysis, and predictive modeling techniques using modern tools and frameworks.",
    duration: "24 hours",
    modulesCount: 14,
    difficulty: "Advanced",
    category: "Technical",
    enrolled: true,
    enrolledCount: 189,
    thumbnail: "/images/analytics.jpg",
  },
  {
    id: "lp-003",
    title: "Project Management Professional",
    description: "Comprehensive preparation for PMP certification covering all knowledge areas and process groups.",
    duration: "36 hours",
    modulesCount: 20,
    difficulty: "Intermediate",
    category: "Management",
    enrolled: false,
    enrolledCount: 567,
    thumbnail: "/images/pm.jpg",
  },
  {
    id: "lp-004",
    title: "Effective Communication",
    description: "Enhance your verbal and written communication skills for professional settings, presentations, and stakeholder management.",
    duration: "8 hours",
    modulesCount: 6,
    difficulty: "Beginner",
    category: "Soft Skills",
    enrolled: false,
    enrolledCount: 723,
    thumbnail: "/images/communication.jpg",
  },
  {
    id: "lp-005",
    title: "Cloud Architecture Mastery",
    description: "Design and implement scalable cloud solutions using AWS, Azure, and GCP with best practices for security and cost optimization.",
    duration: "40 hours",
    modulesCount: 18,
    difficulty: "Advanced",
    category: "Technical",
    enrolled: false,
    enrolledCount: 156,
    thumbnail: "/images/cloud.jpg",
  },
  {
    id: "lp-006",
    title: "Agile & Scrum Essentials",
    description: "Learn agile methodologies, scrum framework, sprint planning, and retrospective facilitation techniques.",
    duration: "16 hours",
    modulesCount: 10,
    difficulty: "Intermediate",
    category: "Management",
    enrolled: true,
    enrolledCount: 412,
    thumbnail: "/images/agile.jpg",
  },
];

const difficultyColor: Record<string, string> = {
  Beginner: "text-aurora-green",
  Intermediate: "text-yellow-500",
  Advanced: "text-red-500",
};

export default function LearningPaths() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("All");
  const [paths, setPaths] = useState<LearningPath[]>(mockPaths);

  const filteredPaths = paths.filter((path) => {
    const matchesSearch =
      path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      path.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty =
      filterDifficulty === "All" || path.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const handleEnroll = (id: string) => {
    setPaths((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enrolled: true } : p))
    );
  };

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
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
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
                <span className={`text-xs font-medium ${difficultyColor[path.difficulty]}`}>
                  {path.difficulty}
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
      </div>
    </div>
  );
}
