/**
 * @module PathBuilder
 * @description Admin path builder — create/edit learning paths with
 *              course sequencing, prerequisites, and metadata
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Plus,
  X,
  Save,
  Trash2,
  ChevronDown,
  ChevronUp,
  Settings,
  BookOpen,
  Video,
  FileText,
  HelpCircle,
  Wrench,
  Users,
  Zap,
} from 'lucide-react';
import type { PathLevel, CourseType } from '@/services/learningService';

// ── Types ────────────────────────────────────────────────────────────────────────

interface BuilderCourse {
  id: string;
  title: string;
  description: string;
  type: CourseType;
  duration: number;
  isRequired: boolean;
  prerequisites: string[];
  provider: string;
}

export interface PathBuilderProps {
  onSave: (data: {
    title: string;
    description: string;
    level: PathLevel;
    category: string;
    skills: string[];
    courses: BuilderCourse[];
  }) => void;
  onCancel: () => void;
}

// ── Config ───────────────────────────────────────────────────────────────────────

const COURSE_TYPE_OPTIONS: { key: CourseType; label: string; icon: LucideIcon }[] = [
  { key: 'video', label: 'Video', icon: Video },
  { key: 'article', label: 'Article', icon: FileText },
  { key: 'quiz', label: 'Quiz', icon: HelpCircle },
  { key: 'project', label: 'Project', icon: Wrench },
  { key: 'workshop', label: 'Workshop', icon: Users },
  { key: 'interactive', label: 'Interactive', icon: Zap },
];

const LEVEL_OPTIONS: { key: PathLevel; label: string }[] = [
  { key: 'beginner', label: 'Beginner' },
  { key: 'intermediate', label: 'Intermediate' },
  { key: 'advanced', label: 'Advanced' },
  { key: 'expert', label: 'Expert' },
];

const CATEGORY_OPTIONS = [
  'Engineering',
  'Leadership',
  'Data',
  'Design',
  'Product',
  'Security',
  'DevOps',
  'Other',
];

// ── Component ────────────────────────────────────────────────────────────────────

export const PathBuilder: React.FC<PathBuilderProps> = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState<PathLevel>('intermediate');
  const [category, setCategory] = useState('Engineering');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [courses, setCourses] = useState<BuilderCourse[]>([]);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  const addSkill = useCallback(() => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills((prev) => [...prev, s]);
      setSkillInput('');
    }
  }, [skillInput, skills]);

  const removeSkill = useCallback((skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  }, []);

  const addCourse = useCallback(() => {
    const newCourse: BuilderCourse = {
      id: `bc-${Date.now()}`,
      title: '',
      description: '',
      type: 'video',
      duration: 4,
      isRequired: true,
      prerequisites: [],
      provider: '',
    };
    setCourses((prev) => [...prev, newCourse]);
    setExpandedCourse(newCourse.id);
  }, []);

  const updateCourse = useCallback((id: string, updates: Partial<BuilderCourse>) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const removeCourse = useCallback((id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    // Clean up prerequisites references
    setCourses((prev) =>
      prev.map((c) => ({
        ...c,
        prerequisites: c.prerequisites.filter((pid) => pid !== id),
      }))
    );
  }, []);

  const moveCourse = useCallback((idx: number, direction: 'up' | 'down') => {
    setCourses((prev) => {
      const arr = [...prev];
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= arr.length) return arr;
      const temp = arr[idx];
      arr[idx] = arr[swapIdx];
      arr[swapIdx] = temp;
      return arr;
    });
  }, []);

  const togglePrerequisite = useCallback((courseId: string, prereqId: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        const has = c.prerequisites.includes(prereqId);
        return {
          ...c,
          prerequisites: has
            ? c.prerequisites.filter((p) => p !== prereqId)
            : [...c.prerequisites, prereqId],
        };
      })
    );
  }, []);

  const canSave =
    title.trim().length > 0 &&
    courses.length > 0 &&
    courses.every((c) => c.title.trim().length > 0);
  const totalDuration = courses.reduce((s, c) => s + c.duration, 0);

  const handleSave = useCallback(() => {
    if (!canSave) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      level,
      category,
      skills,
      courses,
    });
  }, [canSave, title, description, level, category, skills, courses, onSave]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="rounded-xl border border-celestial-indigo/20 bg-celestial-indigo/5 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-ink-black dark:text-pearl flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5 text-celestial-indigo" /> Create Learning Path
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={onCancel}
              className="px-3 py-1 rounded-lg text-[9px] font-bold border border-cloud dark:border-nebula-purple/20 text-ink-black dark:text-pearl hover:bg-pearl/50 dark:hover:bg-deep-cosmos/20 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="flex items-center gap-1 px-3 py-1 rounded-lg text-[9px] font-bold bg-celestial-indigo text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              <Save className="w-3 h-3" /> Save Path
            </button>
          </div>
        </div>

        {/* Title & Description */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Path title..."
          className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue text-[11px] font-bold text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what learners will achieve..."
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue text-[9px] text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo resize-none transition-colors"
        />

        {/* Level & Category */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-[8px] text-silver-mist">Level:</span>
            {LEVEL_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setLevel(opt.key)}
                className={`px-2 py-1 rounded text-[8px] font-bold transition-colors ${
                  level === opt.key
                    ? 'bg-celestial-indigo/10 text-celestial-indigo'
                    : 'text-silver-mist'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-2 py-1 rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue text-[9px] text-ink-black dark:text-pearl outline-none"
          >
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <span className="text-[8px] text-silver-mist ml-auto">
            Total: {totalDuration}h • {courses.length} courses
          </span>
        </div>

        {/* Skills */}
        <div>
          <div className="flex items-center gap-1 mb-1 flex-wrap">
            {skills.map((skill) => (
              <span
                key={skill}
                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[7px] font-bold bg-celestial-indigo/10 text-celestial-indigo"
              >
                {skill}
                <button onClick={() => removeSkill(skill)}>
                  <X className="w-2 h-2" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSkill()}
              placeholder="Add skill..."
              className="flex-1 px-2 py-1 rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue text-[8px] text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
            />
            <button
              onClick={addSkill}
              className="p-1 rounded-lg bg-celestial-indigo/10 text-celestial-indigo hover:bg-celestial-indigo/20 transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Course List */}
      <div className="space-y-2">
        {courses.map((course, idx) => {
          const isExpanded = expandedCourse === course.id;
          const TypeIcon = COURSE_TYPE_OPTIONS.find((t) => t.key === course.type)?.icon || BookOpen;

          return (
            <div
              key={course.id}
              className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden"
            >
              {/* Course row */}
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveCourse(idx, 'up')}
                    disabled={idx === 0}
                    className="text-silver-mist/40 hover:text-silver-mist disabled:opacity-30"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => moveCourse(idx, 'down')}
                    disabled={idx === courses.length - 1}
                    className="text-silver-mist/40 hover:text-silver-mist disabled:opacity-30"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-[9px] font-bold text-silver-mist w-5">{idx + 1}</span>
                <TypeIcon className="w-3.5 h-3.5 text-celestial-indigo shrink-0" />
                <p className="flex-1 text-[10px] font-bold text-ink-black dark:text-pearl truncate">
                  {course.title || 'Untitled Course'}
                </p>
                <span className="text-[7px] text-silver-mist">{course.duration}h</span>
                {course.isRequired && (
                  <span className="px-1 py-0.5 rounded text-[6px] font-bold bg-coral-alert/10 text-coral-alert">
                    REQ
                  </span>
                )}
                <button onClick={() => setExpandedCourse(isExpanded ? null : course.id)}>
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3 text-silver-mist" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-silver-mist" />
                  )}
                </button>
                <button
                  onClick={() => removeCourse(course.id)}
                  className="p-0.5 rounded hover:bg-coral-alert/10 transition-colors"
                >
                  <Trash2 className="w-3 h-3 text-coral-alert/60" />
                </button>
              </div>

              {/* Expanded Edit */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-cloud/50 dark:border-nebula-purple/10 space-y-2">
                  <input
                    type="text"
                    value={course.title}
                    onChange={(e) => updateCourse(course.id, { title: e.target.value })}
                    placeholder="Course title..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue text-[10px] font-bold text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
                  />
                  <textarea
                    value={course.description}
                    onChange={(e) => updateCourse(course.id, { description: e.target.value })}
                    placeholder="Course description..."
                    rows={2}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue text-[8px] text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo resize-none transition-colors"
                  />
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Type */}
                    <div className="flex items-center gap-1">
                      <span className="text-[7px] text-silver-mist">Type:</span>
                      {COURSE_TYPE_OPTIONS.map((opt) => {
                        const OptIcon = opt.icon;
                        return (
                          <button
                            key={opt.key}
                            onClick={() => updateCourse(course.id, { type: opt.key })}
                            className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-bold transition-colors ${
                              course.type === opt.key
                                ? 'bg-celestial-indigo/10 text-celestial-indigo'
                                : 'text-silver-mist'
                            }`}
                          >
                            <OptIcon className="w-2.5 h-2.5" />
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Duration */}
                    <div className="flex items-center gap-1">
                      <span className="text-[7px] text-silver-mist">Hours:</span>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={course.duration}
                        onChange={(e) =>
                          updateCourse(course.id, { duration: parseInt(e.target.value) || 1 })
                        }
                        className="w-14 px-2 py-1 rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue text-[9px] text-ink-black dark:text-pearl outline-none"
                      />
                    </div>
                    {/* Provider */}
                    <div className="flex items-center gap-1 flex-1">
                      <span className="text-[7px] text-silver-mist">Provider:</span>
                      <input
                        type="text"
                        value={course.provider}
                        onChange={(e) => updateCourse(course.id, { provider: e.target.value })}
                        placeholder="Provider..."
                        className="flex-1 px-2 py-1 rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue text-[8px] text-ink-black dark:text-pearl outline-none"
                      />
                    </div>
                    {/* Required toggle */}
                    <button
                      onClick={() => updateCourse(course.id, { isRequired: !course.isRequired })}
                      className={`px-2 py-1 rounded text-[7px] font-bold transition-colors ${
                        course.isRequired
                          ? 'bg-coral-alert/10 text-coral-alert'
                          : 'bg-cloud/50 text-silver-mist'
                      }`}
                    >
                      {course.isRequired ? 'Required' : 'Optional'}
                    </button>
                  </div>

                  {/* Prerequisites */}
                  {idx > 0 && (
                    <div>
                      <span className="text-[7px] text-silver-mist block mb-1">Prerequisites:</span>
                      <div className="flex items-center gap-1 flex-wrap">
                        {courses.slice(0, idx).map((prev) => (
                          <button
                            key={prev.id}
                            onClick={() => togglePrerequisite(course.id, prev.id)}
                            className={`px-1.5 py-0.5 rounded text-[7px] font-bold transition-colors ${
                              course.prerequisites.includes(prev.id)
                                ? 'bg-celestial-indigo/10 text-celestial-indigo'
                                : 'bg-cloud/50 dark:bg-nebula-purple/10 text-silver-mist'
                            }`}
                          >
                            {prev.title || `Course ${courses.indexOf(prev) + 1}`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Course Button */}
      <button
        onClick={addCourse}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-dashed border-cloud dark:border-nebula-purple/20 text-[9px] font-bold text-celestial-indigo hover:border-celestial-indigo/40 hover:bg-celestial-indigo/5 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> Add Course
      </button>
    </div>
  );
};

export default PathBuilder;
