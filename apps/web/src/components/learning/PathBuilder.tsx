"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  BookOpen,
  Settings,
  Save,
  Link,
  Clock,
  CheckSquare,
  AlertCircle,
} from "lucide-react";

interface CourseModule {
  id: string;
  title: string;
  type: "course" | "quiz" | "assignment" | "video";
  duration: string;
  required: boolean;
  prerequisites: string[];
}

interface CompletionCriteria {
  minModulesCompleted: number;
  minScorePercentage: number;
  requireAllRequired: boolean;
  maxTimeToComplete: number;
  certificateOnCompletion: boolean;
}

interface LearningPathConfig {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  modules: CourseModule[];
  completionCriteria: CompletionCriteria;
}

const mockPathConfig: LearningPathConfig = {
  id: "lp-builder-001",
  title: "Full-Stack Development Bootcamp",
  description: "Comprehensive learning path covering frontend, backend, and DevOps fundamentals for aspiring full-stack developers.",
  category: "Technical",
  difficulty: "Intermediate",
  modules: [
    {
      id: "mod-001",
      title: "HTML & CSS Fundamentals",
      type: "course",
      duration: "4 hours",
      required: true,
      prerequisites: [],
    },
    {
      id: "mod-002",
      title: "JavaScript Essentials",
      type: "course",
      duration: "6 hours",
      required: true,
      prerequisites: ["mod-001"],
    },
    {
      id: "mod-003",
      title: "Frontend Basics Quiz",
      type: "quiz",
      duration: "30 min",
      required: true,
      prerequisites: ["mod-001", "mod-002"],
    },
    {
      id: "mod-004",
      title: "React Framework Deep Dive",
      type: "course",
      duration: "8 hours",
      required: true,
      prerequisites: ["mod-002"],
    },
    {
      id: "mod-005",
      title: "Node.js & Express Backend",
      type: "course",
      duration: "6 hours",
      required: true,
      prerequisites: ["mod-002"],
    },
    {
      id: "mod-006",
      title: "Build a REST API - Assignment",
      type: "assignment",
      duration: "3 hours",
      required: false,
      prerequisites: ["mod-005"],
    },
    {
      id: "mod-007",
      title: "Database Design with PostgreSQL",
      type: "course",
      duration: "5 hours",
      required: true,
      prerequisites: ["mod-005"],
    },
    {
      id: "mod-008",
      title: "DevOps & Deployment Overview",
      type: "video",
      duration: "2 hours",
      required: false,
      prerequisites: [],
    },
  ],
  completionCriteria: {
    minModulesCompleted: 6,
    minScorePercentage: 70,
    requireAllRequired: true,
    maxTimeToComplete: 90,
    certificateOnCompletion: true,
  },
};

const availableModules: CourseModule[] = [
  {
    id: "avail-001",
    title: "TypeScript Advanced Patterns",
    type: "course",
    duration: "5 hours",
    required: false,
    prerequisites: [],
  },
  {
    id: "avail-002",
    title: "Testing with Jest & React Testing Library",
    type: "course",
    duration: "4 hours",
    required: false,
    prerequisites: [],
  },
  {
    id: "avail-003",
    title: "CI/CD Pipeline Setup",
    type: "video",
    duration: "1.5 hours",
    required: false,
    prerequisites: [],
  },
  {
    id: "avail-004",
    title: "Final Capstone Project",
    type: "assignment",
    duration: "10 hours",
    required: false,
    prerequisites: [],
  },
];

const moduleTypeColors: Record<string, string> = {
  course: "bg-celestial-indigo/10 text-celestial-indigo",
  quiz: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600",
  assignment: "bg-aurora-green/10 text-aurora-green",
  video: "bg-purple-50 dark:bg-purple-900/20 text-purple-600",
};

export function PathBuilder() {
  const [pathConfig, setPathConfig] = useState<LearningPathConfig>(mockPathConfig);
  const [showAddModule, setShowAddModule] = useState(false);
  const [showCriteria, setShowCriteria] = useState(false);
  const [editingPrereqs, setEditingPrereqs] = useState<string | null>(null);

  const moveModule = (index: number, direction: "up" | "down") => {
    const newModules = [...pathConfig.modules];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newModules.length) return;
    [newModules[index], newModules[targetIndex]] = [newModules[targetIndex], newModules[index]];
    setPathConfig({ ...pathConfig, modules: newModules });
  };

  const removeModule = (id: string) => {
    const newModules = pathConfig.modules.filter((m) => m.id !== id);
    const updatedModules = newModules.map((m) => ({
      ...m,
      prerequisites: m.prerequisites.filter((p) => p !== id),
    }));
    setPathConfig({ ...pathConfig, modules: updatedModules });
  };

  const addModule = (module: CourseModule) => {
    const newModule = { ...module, id: `mod-${Date.now()}`, prerequisites: [] };
    setPathConfig({
      ...pathConfig,
      modules: [...pathConfig.modules, newModule],
    });
    setShowAddModule(false);
  };

  const toggleRequired = (id: string) => {
    const newModules = pathConfig.modules.map((m) =>
      m.id === id ? { ...m, required: !m.required } : m
    );
    setPathConfig({ ...pathConfig, modules: newModules });
  };

  const togglePrerequisite = (moduleId: string, prereqId: string) => {
    const newModules = pathConfig.modules.map((m) => {
      if (m.id !== moduleId) return m;
      const hasPrereq = m.prerequisites.includes(prereqId);
      return {
        ...m,
        prerequisites: hasPrereq
          ? m.prerequisites.filter((p) => p !== prereqId)
          : [...m.prerequisites, prereqId],
      };
    });
    setPathConfig({ ...pathConfig, modules: newModules });
  };

  const updateCriteria = (key: keyof CompletionCriteria, value: number | boolean) => {
    setPathConfig({
      ...pathConfig,
      completionCriteria: { ...pathConfig.completionCriteria, [key]: value },
    });
  };

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">
              Learning Path Builder
            </h1>
            <p className="text-silver-mist mt-1">
              Configure modules, prerequisites, and completion criteria
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-celestial-indigo text-white font-medium hover:bg-celestial-indigo/90 transition-colors">
            <Save className="w-4 h-4" />
            Save Path
          </button>
        </div>

        {/* Path Info */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-silver-mist uppercase tracking-wide">
                Path Title
              </label>
              <input
                type="text"
                value={pathConfig.title}
                onChange={(e) => setPathConfig({ ...pathConfig, title: e.target.value })}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-medium text-silver-mist uppercase tracking-wide">
                  Category
                </label>
                <input
                  type="text"
                  value={pathConfig.category}
                  onChange={(e) => setPathConfig({ ...pathConfig, category: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-silver-mist uppercase tracking-wide">
                  Difficulty
                </label>
                <select
                  value={pathConfig.difficulty}
                  onChange={(e) => setPathConfig({ ...pathConfig, difficulty: e.target.value as LearningPathConfig["difficulty"] })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <label className="text-xs font-medium text-silver-mist uppercase tracking-wide">
              Description
            </label>
            <textarea
              value={pathConfig.description}
              onChange={(e) => setPathConfig({ ...pathConfig, description: e.target.value })}
              rows={2}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo resize-none"
            />
          </div>
        </div>

        {/* Modules List */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 mb-6">
          <div className="flex items-center justify-between px-5 py-4 border-b border-cloud dark:border-nebula-purple/50">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-celestial-indigo" />
              <h2 className="font-semibold text-ink-black dark:text-pearl">
                Course Modules ({pathConfig.modules.length})
              </h2>
            </div>
            <button
              onClick={() => setShowAddModule(!showAddModule)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-celestial-indigo/10 text-celestial-indigo hover:bg-celestial-indigo/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Module
            </button>
          </div>

          <div className="divide-y divide-cloud dark:divide-nebula-purple/50">
            {pathConfig.modules.map((module, index) => (
              <div key={module.id} className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveModule(index, "up")}
                      disabled={index === 0}
                      className="text-silver-mist hover:text-celestial-indigo disabled:opacity-30 transition-colors"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveModule(index, "down")}
                      disabled={index === pathConfig.modules.length - 1}
                      className="text-silver-mist hover:text-celestial-indigo disabled:opacity-30 transition-colors"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  <GripVertical className="w-4 h-4 text-silver-mist" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ink-black dark:text-pearl">
                        {index + 1}. {module.title}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${moduleTypeColors[module.type]}`}>
                        {module.type}
                      </span>
                      {module.required && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500">
                          required
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-silver-mist">
                        <Clock className="w-3 h-3" /> {module.duration}
                      </span>
                      {module.prerequisites.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-silver-mist">
                          <Link className="w-3 h-3" /> {module.prerequisites.length} prerequisite(s)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleRequired(module.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        module.required
                          ? "text-celestial-indigo bg-celestial-indigo/10"
                          : "text-silver-mist hover:text-celestial-indigo hover:bg-celestial-indigo/10"
                      }`}
                      title="Toggle required"
                    >
                      <CheckSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingPrereqs(editingPrereqs === module.id ? null : module.id)}
                      className="p-1.5 rounded-lg text-silver-mist hover:text-celestial-indigo hover:bg-celestial-indigo/10 transition-colors"
                      title="Set prerequisites"
                    >
                      <Link className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeModule(module.id)}
                      className="p-1.5 rounded-lg text-silver-mist hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Remove module"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Prerequisites Editor */}
                {editingPrereqs === module.id && (
                  <div className="mt-3 ml-12 p-3 rounded-lg bg-slate-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/50">
                    <p className="text-xs font-medium text-silver-mist mb-2">
                      Select prerequisites for this module:
                    </p>
                    <div className="space-y-1.5">
                      {pathConfig.modules
                        .filter((m) => m.id !== module.id)
                        .map((m) => (
                          <label
                            key={m.id}
                            className="flex items-center gap-2 text-sm text-ink-black dark:text-pearl cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={module.prerequisites.includes(m.id)}
                              onChange={() => togglePrerequisite(module.id, m.id)}
                              className="rounded border-cloud text-celestial-indigo focus:ring-celestial-indigo"
                            />
                            {m.title}
                          </label>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add Module Panel */}
        {showAddModule && (
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5 mb-6 bg-slate-50 dark:bg-deep-cosmos">
            <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-3">
              Available Modules
            </h3>
            <div className="space-y-2">
              {availableModules.map((module) => (
                <div
                  key={module.id}
                  className="flex items-center justify-between px-4 py-3 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ink-black dark:text-pearl">
                        {module.title}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${moduleTypeColors[module.type]}`}>
                        {module.type}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-silver-mist mt-1">
                      <Clock className="w-3 h-3" /> {module.duration}
                    </span>
                  </div>
                  <button
                    onClick={() => addModule(module)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-celestial-indigo text-white hover:bg-celestial-indigo/90 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completion Criteria */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/50">
          <button
            onClick={() => setShowCriteria(!showCriteria)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-celestial-indigo" />
              <h2 className="font-semibold text-ink-black dark:text-pearl">
                Completion Criteria
              </h2>
            </div>
            {showCriteria ? (
              <ChevronUp className="w-5 h-5 text-silver-mist" />
            ) : (
              <ChevronDown className="w-5 h-5 text-silver-mist" />
            )}
          </button>

          {showCriteria && (
            <div className="px-5 pb-5 border-t border-cloud dark:border-nebula-purple/50 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-silver-mist uppercase tracking-wide">
                    Minimum Modules Completed
                  </label>
                  <input
                    type="number"
                    value={pathConfig.completionCriteria.minModulesCompleted}
                    onChange={(e) => updateCriteria("minModulesCompleted", parseInt(e.target.value))}
                    min={1}
                    max={pathConfig.modules.length}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-silver-mist uppercase tracking-wide">
                    Minimum Score Percentage
                  </label>
                  <input
                    type="number"
                    value={pathConfig.completionCriteria.minScorePercentage}
                    onChange={(e) => updateCriteria("minScorePercentage", parseInt(e.target.value))}
                    min={0}
                    max={100}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-silver-mist uppercase tracking-wide">
                    Max Days to Complete
                  </label>
                  <input
                    type="number"
                    value={pathConfig.completionCriteria.maxTimeToComplete}
                    onChange={(e) => updateCriteria("maxTimeToComplete", parseInt(e.target.value))}
                    min={1}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo"
                  />
                </div>
                <div className="flex flex-col justify-end gap-3 py-2">
                  <label className="flex items-center gap-2 text-sm text-ink-black dark:text-pearl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pathConfig.completionCriteria.requireAllRequired}
                      onChange={(e) => updateCriteria("requireAllRequired", e.target.checked)}
                      className="rounded border-cloud text-celestial-indigo focus:ring-celestial-indigo"
                    />
                    Require all mandatory modules
                  </label>
                  <label className="flex items-center gap-2 text-sm text-ink-black dark:text-pearl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pathConfig.completionCriteria.certificateOnCompletion}
                      onChange={(e) => updateCriteria("certificateOnCompletion", e.target.checked)}
                      className="rounded border-cloud text-celestial-indigo focus:ring-celestial-indigo"
                    />
                    Issue certificate on completion
                  </label>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-celestial-indigo/5 border border-celestial-indigo/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-celestial-indigo mt-0.5" />
                  <p className="text-xs text-celestial-indigo">
                    Learners must complete at least {pathConfig.completionCriteria.minModulesCompleted} modules
                    with a minimum score of {pathConfig.completionCriteria.minScorePercentage}% within{" "}
                    {pathConfig.completionCriteria.maxTimeToComplete} days to pass this learning path.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
