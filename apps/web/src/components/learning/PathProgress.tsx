"use client";

import React from "react";
import {
  CheckCircle2,
  Circle,
  PlayCircle,
  Clock,
  Trophy,
  ChevronRight,
} from "lucide-react";

interface Module {
  id: string;
  title: string;
  duration: string;
  status: "completed" | "in-progress" | "upcoming";
  completedAt?: string;
}

interface PathProgressData {
  pathId: string;
  pathTitle: string;
  totalModules: number;
  completedModules: number;
  currentModule: Module;
  nextModule: Module;
  modules: Module[];
  overallProgress: number;
  estimatedTimeRemaining: string;
  startedAt: string;
}

const mockProgress: PathProgressData = {
  pathId: "lp-002",
  pathTitle: "Advanced Data Analytics",
  totalModules: 14,
  completedModules: 6,
  currentModule: {
    id: "m-007",
    title: "Predictive Modeling with Regression",
    duration: "1h 45m",
    status: "in-progress",
  },
  nextModule: {
    id: "m-008",
    title: "Classification Algorithms",
    duration: "2h 10m",
    status: "upcoming",
  },
  modules: [
    { id: "m-001", title: "Introduction to Data Analytics", duration: "45m", status: "completed", completedAt: "2025-12-01" },
    { id: "m-002", title: "Data Cleaning & Preparation", duration: "1h 30m", status: "completed", completedAt: "2025-12-03" },
    { id: "m-003", title: "Exploratory Data Analysis", duration: "2h", status: "completed", completedAt: "2025-12-06" },
    { id: "m-004", title: "Statistical Foundations", duration: "1h 50m", status: "completed", completedAt: "2025-12-10" },
    { id: "m-005", title: "Data Visualization Techniques", duration: "1h 20m", status: "completed", completedAt: "2025-12-14" },
    { id: "m-006", title: "Advanced Visualization with D3", duration: "2h", status: "completed", completedAt: "2025-12-18" },
    { id: "m-007", title: "Predictive Modeling with Regression", duration: "1h 45m", status: "in-progress" },
    { id: "m-008", title: "Classification Algorithms", duration: "2h 10m", status: "upcoming" },
    { id: "m-009", title: "Clustering & Segmentation", duration: "1h 30m", status: "upcoming" },
    { id: "m-010", title: "Time Series Analysis", duration: "2h", status: "upcoming" },
    { id: "m-011", title: "Natural Language Processing", duration: "1h 50m", status: "upcoming" },
    { id: "m-012", title: "Model Evaluation & Tuning", duration: "1h 40m", status: "upcoming" },
    { id: "m-013", title: "Deploying Analytics Solutions", duration: "2h", status: "upcoming" },
    { id: "m-014", title: "Capstone Project", duration: "4h", status: "upcoming" },
  ],
  overallProgress: 43,
  estimatedTimeRemaining: "18h 45m",
  startedAt: "2025-12-01",
};

export default function PathProgress() {
  const progress = mockProgress;

  const getModuleIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-aurora-green" />;
      case "in-progress":
        return <PlayCircle className="w-5 h-5 text-celestial-indigo" />;
      default:
        return <Circle className="w-5 h-5 text-silver-mist" />;
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">
            {progress.pathTitle}
          </h1>
          <p className="text-silver-mist mt-1">
            Started on {progress.startedAt}
          </p>
        </div>

        {/* Overall Progress */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-ink-black dark:text-pearl">
              Overall Progress
            </span>
            <span className="text-sm font-bold text-celestial-indigo">
              {progress.overallProgress}%
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-cloud dark:bg-nebula-purple/30">
            <div
              className="h-full rounded-full bg-gradient-to-r from-celestial-indigo to-aurora-green transition-all"
              style={{ width: `${progress.overallProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-3 text-sm text-silver-mist">
            <span>
              {progress.completedModules} of {progress.totalModules} modules completed
            </span>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{progress.estimatedTimeRemaining} remaining</span>
            </div>
          </div>
        </div>

        {/* Current & Next Module */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl border border-celestial-indigo/30 bg-celestial-indigo/5 p-5">
            <div className="flex items-center gap-2 mb-2">
              <PlayCircle className="w-5 h-5 text-celestial-indigo" />
              <span className="text-xs font-medium text-celestial-indigo uppercase tracking-wide">
                Current Module
              </span>
            </div>
            <h3 className="text-base font-semibold text-ink-black dark:text-pearl">
              {progress.currentModule.title}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-sm text-silver-mist">
              <Clock className="w-4 h-4" />
              <span>{progress.currentModule.duration}</span>
            </div>
            <button className="mt-3 flex items-center gap-1 text-sm font-medium text-celestial-indigo hover:underline">
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Circle className="w-5 h-5 text-silver-mist" />
              <span className="text-xs font-medium text-silver-mist uppercase tracking-wide">
                Next Up
              </span>
            </div>
            <h3 className="text-base font-semibold text-ink-black dark:text-pearl">
              {progress.nextModule.title}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-sm text-silver-mist">
              <Clock className="w-4 h-4" />
              <span>{progress.nextModule.duration}</span>
            </div>
          </div>
        </div>

        {/* Modules List */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
          <div className="p-4 border-b border-cloud dark:border-nebula-purple/50">
            <h2 className="text-lg font-semibold text-ink-black dark:text-pearl flex items-center gap-2">
              <Trophy className="w-5 h-5 text-celestial-indigo" />
              All Modules
            </h2>
          </div>
          <div className="divide-y divide-cloud dark:divide-nebula-purple/50">
            {progress.modules.map((module, index) => (
              <div
                key={module.id}
                className={`flex items-center gap-4 px-5 py-3 ${
                  module.status === "in-progress" ? "bg-celestial-indigo/5" : ""
                }`}
              >
                <span className="text-sm text-silver-mist w-6">
                  {index + 1}.
                </span>
                {getModuleIcon(module.status)}
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      module.status === "completed"
                        ? "text-silver-mist line-through"
                        : "text-ink-black dark:text-pearl"
                    }`}
                  >
                    {module.title}
                  </p>
                </div>
                <span className="text-xs text-silver-mist">
                  {module.duration}
                </span>
                {module.completedAt && (
                  <span className="text-xs text-aurora-green">
                    {module.completedAt}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
