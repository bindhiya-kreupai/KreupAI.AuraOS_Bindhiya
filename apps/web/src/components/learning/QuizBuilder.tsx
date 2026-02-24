/**
 * @module QuizBuilder
 * @description Admin quiz/assessment builder — create quizzes with multiple
 *              question types, set scoring rules, pass/fail threshold, and
 *              configure quiz settings
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback } from 'react';
import {
  Plus,
  Trash2,
  GripVertical,
  CheckCircle2,
  Circle,
  ToggleLeft,
  AlignLeft,
  ArrowLeftRight,
  Settings,
  Save,
  Eye,
  ChevronDown,
  ChevronUp,
  Copy,
  AlertTriangle,
  BookOpen,
  Clock,
  Target,
  Award,
  RotateCcw,
  Shuffle,
  HelpCircle,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────────

export type QuizQuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'matching';

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  text: string;
  points: number;
  options: QuizOption[];
  matchingPairs: MatchingPair[];
  correctAnswer: string;
  explanation: string;
  order: number;
}

export interface QuizSettings {
  title: string;
  description: string;
  courseId: string;
  duration: number;
  passingScore: number;
  maxAttempts: number;
  isRandomized: boolean;
  showCorrectAnswers: boolean;
  allowReview: boolean;
}

export interface QuizBuilderProps {
  onSave?: (settings: QuizSettings, questions: QuizQuestion[]) => void;
  onPreview?: (settings: QuizSettings, questions: QuizQuestion[]) => void;
}

// ── Config ───────────────────────────────────────────────────────────────────────

const QUESTION_TYPE_CONFIG: Record<
  QuizQuestionType,
  { label: string; icon: React.ReactNode; description: string }
> = {
  multiple_choice: {
    label: 'Multiple Choice',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    description: 'Select one or more correct answers',
  },
  true_false: {
    label: 'True / False',
    icon: <ToggleLeft className="w-3.5 h-3.5" />,
    description: 'Binary true or false question',
  },
  short_answer: {
    label: 'Short Answer',
    icon: <AlignLeft className="w-3.5 h-3.5" />,
    description: 'Free-text response with keyword matching',
  },
  matching: {
    label: 'Matching',
    icon: <ArrowLeftRight className="w-3.5 h-3.5" />,
    description: 'Match items from two columns',
  },
};

const DEFAULT_SETTINGS: QuizSettings = {
  title: '',
  description: '',
  courseId: '',
  duration: 30,
  passingScore: 70,
  maxAttempts: 3,
  isRandomized: false,
  showCorrectAnswers: true,
  allowReview: true,
};

const makeId = () => `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const makeOptId = () => `opt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const makePairId = () => `mp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// ── Component ────────────────────────────────────────────────────────────────────

export const QuizBuilder: React.FC<QuizBuilderProps> = ({ onSave, onPreview }) => {
  const [settings, setSettings] = useState<QuizSettings>(DEFAULT_SETTINGS);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(true);
  const [addingType, setAddingType] = useState<QuizQuestionType | null>(null);

  const totalPoints = questions.reduce((s, q) => s + q.points, 0);

  const addQuestion = useCallback(
    (type: QuizQuestionType) => {
      const newQ: QuizQuestion = {
        id: makeId(),
        type,
        text: '',
        points: 10,
        options:
          type === 'multiple_choice'
            ? [
                { id: makeOptId(), text: '', isCorrect: true },
                { id: makeOptId(), text: '', isCorrect: false },
                { id: makeOptId(), text: '', isCorrect: false },
                { id: makeOptId(), text: '', isCorrect: false },
              ]
            : type === 'true_false'
              ? [
                  { id: makeOptId(), text: 'True', isCorrect: true },
                  { id: makeOptId(), text: 'False', isCorrect: false },
                ]
              : [],
        matchingPairs:
          type === 'matching'
            ? [
                { id: makePairId(), left: '', right: '' },
                { id: makePairId(), left: '', right: '' },
                { id: makePairId(), left: '', right: '' },
              ]
            : [],
        correctAnswer: type === 'true_false' ? 'true' : '',
        explanation: '',
        order: questions.length + 1,
      };
      setQuestions((prev) => [...prev, newQ]);
      setExpandedQuestion(newQ.id);
      setAddingType(null);
    },
    [questions.length]
  );

  const updateQuestion = useCallback((id: string, updates: Partial<QuizQuestion>) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  }, []);

  const removeQuestion = useCallback(
    (id: string) => {
      setQuestions((prev) =>
        prev.filter((q) => q.id !== id).map((q, i) => ({ ...q, order: i + 1 }))
      );
      if (expandedQuestion === id) setExpandedQuestion(null);
    },
    [expandedQuestion]
  );

  const duplicateQuestion = useCallback((id: string) => {
    setQuestions((prev) => {
      const src = prev.find((q) => q.id === id);
      if (!src) return prev;
      const dup: QuizQuestion = {
        ...src,
        id: makeId(),
        order: prev.length + 1,
        options: src.options.map((o) => ({ ...o, id: makeOptId() })),
        matchingPairs: src.matchingPairs.map((p) => ({ ...p, id: makePairId() })),
      };
      return [...prev, dup];
    });
  }, []);

  const moveQuestion = useCallback((id: string, dir: -1 | 1) => {
    setQuestions((prev) => {
      const idx = prev.findIndex((q) => q.id === id);
      if (idx < 0) return prev;
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr.map((q, i) => ({ ...q, order: i + 1 }));
    });
  }, []);

  const addOption = useCallback((qId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? { ...q, options: [...q.options, { id: makeOptId(), text: '', isCorrect: false }] }
          : q
      )
    );
  }, []);

  const updateOption = useCallback((qId: string, optId: string, updates: Partial<QuizOption>) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? { ...q, options: q.options.map((o) => (o.id === optId ? { ...o, ...updates } : o)) }
          : q
      )
    );
  }, []);

  const removeOption = useCallback((qId: string, optId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId ? { ...q, options: q.options.filter((o) => o.id !== optId) } : q
      )
    );
  }, []);

  const setCorrectOption = useCallback((qId: string, optId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? { ...q, options: q.options.map((o) => ({ ...o, isCorrect: o.id === optId })) }
          : q
      )
    );
  }, []);

  const addMatchingPair = useCallback((qId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? { ...q, matchingPairs: [...q.matchingPairs, { id: makePairId(), left: '', right: '' }] }
          : q
      )
    );
  }, []);

  const updateMatchingPair = useCallback(
    (qId: string, pairId: string, updates: Partial<MatchingPair>) => {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === qId
            ? {
                ...q,
                matchingPairs: q.matchingPairs.map((p) =>
                  p.id === pairId ? { ...p, ...updates } : p
                ),
              }
            : q
        )
      );
    },
    []
  );

  const removeMatchingPair = useCallback((qId: string, pairId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId ? { ...q, matchingPairs: q.matchingPairs.filter((p) => p.id !== pairId) } : q
      )
    );
  }, []);

  const isValid =
    settings.title.trim() !== '' &&
    questions.length > 0 &&
    questions.every((q) => {
      if (!q.text.trim()) return false;
      if (q.type === 'multiple_choice')
        return (
          q.options.length >= 2 &&
          q.options.some((o) => o.isCorrect) &&
          q.options.every((o) => o.text.trim())
        );
      if (q.type === 'true_false') return true;
      if (q.type === 'short_answer') return q.correctAnswer.trim() !== '';
      if (q.type === 'matching')
        return (
          q.matchingPairs.length >= 2 &&
          q.matchingPairs.every((p) => p.left.trim() && p.right.trim())
        );
      return false;
    });

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[12px] font-bold text-ink-black dark:text-pearl">Quiz Builder</p>
          <p className="text-[8px] text-silver-mist">
            Create assessments with multiple question types
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onPreview && (
            <button
              onClick={() => onPreview(settings, questions)}
              disabled={!isValid}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-bold border border-cloud dark:border-nebula-purple/20 text-ink-black dark:text-pearl hover:bg-cloud/50 dark:hover:bg-nebula-purple/10 transition-colors disabled:opacity-40"
            >
              <Eye className="w-3 h-3" /> Preview
            </button>
          )}
          {onSave && (
            <button
              onClick={() => onSave(settings, questions)}
              disabled={!isValid}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-bold bg-celestial-indigo text-white hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              <Save className="w-3 h-3" /> Save Quiz
            </button>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-2">
        {[
          {
            icon: <HelpCircle className="w-3.5 h-3.5 text-celestial-indigo" />,
            value: questions.length,
            label: 'Questions',
          },
          {
            icon: <Target className="w-3.5 h-3.5 text-neural-mint" />,
            value: totalPoints,
            label: 'Total Points',
          },
          {
            icon: <Clock className="w-3.5 h-3.5 text-sunset-amber" />,
            value: `${settings.duration}m`,
            label: 'Duration',
          },
          {
            icon: <Award className="w-3.5 h-3.5 text-quantum-rose" />,
            value: `${settings.passingScore}%`,
            label: 'Pass Score',
          },
        ].map((s, i) => (
          <div
            key={i}
            className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-2 text-center"
          >
            <div className="flex justify-center mb-0.5">{s.icon}</div>
            <p className="text-[12px] font-black text-ink-black dark:text-pearl">{s.value}</p>
            <p className="text-[7px] text-silver-mist font-bold">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quiz Settings */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full flex items-center justify-between px-3 py-2.5"
        >
          <p className="text-[10px] font-bold text-ink-black dark:text-pearl flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5 text-silver-mist" /> Quiz Settings
          </p>
          {showSettings ? (
            <ChevronUp className="w-3.5 h-3.5 text-silver-mist" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-silver-mist" />
          )}
        </button>

        {showSettings && (
          <div className="px-3 pb-3 space-y-2 border-t border-cloud/50 dark:border-nebula-purple/10 pt-2">
            <div>
              <label className="text-[8px] font-bold text-silver-mist block mb-0.5">
                Quiz Title *
              </label>
              <input
                value={settings.title}
                onChange={(e) => setSettings((s) => ({ ...s, title: e.target.value }))}
                placeholder="e.g., TypeScript Fundamentals Quiz"
                className="w-full px-2.5 py-1.5 rounded-lg text-[9px] border border-cloud dark:border-nebula-purple/20 bg-pearl/30 dark:bg-deep-cosmos/20 text-ink-black dark:text-pearl placeholder:text-silver-mist/50 focus:outline-none focus:ring-1 focus:ring-celestial-indigo"
              />
            </div>
            <div>
              <label className="text-[8px] font-bold text-silver-mist block mb-0.5">
                Description
              </label>
              <textarea
                value={settings.description}
                onChange={(e) => setSettings((s) => ({ ...s, description: e.target.value }))}
                placeholder="Brief description of the quiz..."
                rows={2}
                className="w-full px-2.5 py-1.5 rounded-lg text-[9px] border border-cloud dark:border-nebula-purple/20 bg-pearl/30 dark:bg-deep-cosmos/20 text-ink-black dark:text-pearl placeholder:text-silver-mist/50 focus:outline-none focus:ring-1 focus:ring-celestial-indigo resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[8px] font-bold text-silver-mist block mb-0.5">
                  Duration (min)
                </label>
                <input
                  type="number"
                  value={settings.duration}
                  onChange={(e) => setSettings((s) => ({ ...s, duration: Number(e.target.value) }))}
                  min={1}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[9px] border border-cloud dark:border-nebula-purple/20 bg-pearl/30 dark:bg-deep-cosmos/20 text-ink-black dark:text-pearl focus:outline-none focus:ring-1 focus:ring-celestial-indigo"
                />
              </div>
              <div>
                <label className="text-[8px] font-bold text-silver-mist block mb-0.5">
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  value={settings.passingScore}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, passingScore: Number(e.target.value) }))
                  }
                  min={0}
                  max={100}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[9px] border border-cloud dark:border-nebula-purple/20 bg-pearl/30 dark:bg-deep-cosmos/20 text-ink-black dark:text-pearl focus:outline-none focus:ring-1 focus:ring-celestial-indigo"
                />
              </div>
              <div>
                <label className="text-[8px] font-bold text-silver-mist block mb-0.5">
                  Max Attempts
                </label>
                <input
                  type="number"
                  value={settings.maxAttempts}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, maxAttempts: Number(e.target.value) }))
                  }
                  min={1}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[9px] border border-cloud dark:border-nebula-purple/20 bg-pearl/30 dark:bg-deep-cosmos/20 text-ink-black dark:text-pearl focus:outline-none focus:ring-1 focus:ring-celestial-indigo"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-1">
              {[
                {
                  key: 'isRandomized' as const,
                  label: 'Randomize Questions',
                  icon: <Shuffle className="w-3 h-3" />,
                },
                {
                  key: 'showCorrectAnswers' as const,
                  label: 'Show Correct Answers',
                  icon: <CheckCircle2 className="w-3 h-3" />,
                },
                {
                  key: 'allowReview' as const,
                  label: 'Allow Review',
                  icon: <RotateCcw className="w-3 h-3" />,
                },
              ].map((toggle) => (
                <button
                  key={toggle.key}
                  onClick={() => setSettings((s) => ({ ...s, [toggle.key]: !s[toggle.key] }))}
                  className={`flex items-center gap-1 text-[8px] font-bold transition-colors ${settings[toggle.key] ? 'text-celestial-indigo' : 'text-silver-mist'}`}
                >
                  {toggle.icon}
                  <span>{toggle.label}</span>
                  <div
                    className={`w-6 h-3 rounded-full transition-colors ${settings[toggle.key] ? 'bg-celestial-indigo' : 'bg-cloud dark:bg-nebula-purple/20'}`}
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-full bg-white mt-[1px] transition-transform ${settings[toggle.key] ? 'translate-x-3' : 'translate-x-[1px]'}`}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-ink-black dark:text-pearl flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-celestial-indigo" /> Questions ({questions.length})
        </p>

        {questions.length === 0 && (
          <div className="rounded-xl border border-dashed border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-6 text-center">
            <HelpCircle className="w-8 h-8 mx-auto mb-2 text-silver-mist/30" />
            <p className="text-[10px] font-bold text-silver-mist">No questions yet</p>
            <p className="text-[8px] text-silver-mist/70">
              Add your first question using the buttons below
            </p>
          </div>
        )}

        {questions.map((question) => {
          const isExpanded = expandedQuestion === question.id;
          const typeCfg = QUESTION_TYPE_CONFIG[question.type];

          return (
            <div
              key={question.id}
              className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden"
            >
              {/* Question Header */}
              <button
                onClick={() => setExpandedQuestion(isExpanded ? null : question.id)}
                className="w-full flex items-center gap-2 px-3 py-2.5"
              >
                <GripVertical className="w-3 h-3 text-silver-mist/40 shrink-0" />
                <span className="text-[9px] font-bold text-silver-mist w-5 shrink-0">
                  Q{question.order}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[7px] font-bold bg-celestial-indigo/10 text-celestial-indigo shrink-0`}
                >
                  {typeCfg.label}
                </span>
                <p className="text-[9px] text-ink-black dark:text-pearl truncate flex-1 text-left">
                  {question.text || 'Untitled question...'}
                </p>
                <span className="text-[8px] font-bold text-sunset-amber shrink-0">
                  {question.points} pts
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-3 h-3 text-silver-mist" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-silver-mist" />
                )}
              </button>

              {/* Expanded Editor */}
              {isExpanded && (
                <div className="px-3 pb-3 space-y-2 border-t border-cloud/50 dark:border-nebula-purple/10 pt-2">
                  {/* Question Text */}
                  <div>
                    <label className="text-[8px] font-bold text-silver-mist block mb-0.5">
                      Question Text *
                    </label>
                    <textarea
                      value={question.text}
                      onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                      placeholder="Enter your question..."
                      rows={2}
                      className="w-full px-2.5 py-1.5 rounded-lg text-[9px] border border-cloud dark:border-nebula-purple/20 bg-pearl/30 dark:bg-deep-cosmos/20 text-ink-black dark:text-pearl placeholder:text-silver-mist/50 focus:outline-none focus:ring-1 focus:ring-celestial-indigo resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] font-bold text-silver-mist block mb-0.5">
                        Points
                      </label>
                      <input
                        type="number"
                        value={question.points}
                        onChange={(e) =>
                          updateQuestion(question.id, { points: Number(e.target.value) })
                        }
                        min={1}
                        className="w-full px-2.5 py-1.5 rounded-lg text-[9px] border border-cloud dark:border-nebula-purple/20 bg-pearl/30 dark:bg-deep-cosmos/20 text-ink-black dark:text-pearl focus:outline-none focus:ring-1 focus:ring-celestial-indigo"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-bold text-silver-mist block mb-0.5">
                        Explanation (shown after submit)
                      </label>
                      <input
                        value={question.explanation}
                        onChange={(e) =>
                          updateQuestion(question.id, { explanation: e.target.value })
                        }
                        placeholder="Why this answer is correct..."
                        className="w-full px-2.5 py-1.5 rounded-lg text-[9px] border border-cloud dark:border-nebula-purple/20 bg-pearl/30 dark:bg-deep-cosmos/20 text-ink-black dark:text-pearl placeholder:text-silver-mist/50 focus:outline-none focus:ring-1 focus:ring-celestial-indigo"
                      />
                    </div>
                  </div>

                  {/* Multiple Choice Options */}
                  {question.type === 'multiple_choice' && (
                    <div>
                      <label className="text-[8px] font-bold text-silver-mist block mb-1">
                        Answer Options * (click radio to set correct)
                      </label>
                      <div className="space-y-1.5">
                        {question.options.map((opt, oi) => (
                          <div key={opt.id} className="flex items-center gap-2">
                            <button
                              onClick={() => setCorrectOption(question.id, opt.id)}
                              className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                                opt.isCorrect
                                  ? 'border-neural-mint bg-neural-mint/10'
                                  : 'border-cloud dark:border-nebula-purple/20'
                              }`}
                            >
                              {opt.isCorrect && (
                                <div className="w-2 h-2 rounded-full bg-neural-mint" />
                              )}
                            </button>
                            <input
                              value={opt.text}
                              onChange={(e) =>
                                updateOption(question.id, opt.id, { text: e.target.value })
                              }
                              placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                              className="flex-1 px-2.5 py-1 rounded-lg text-[9px] border border-cloud dark:border-nebula-purple/20 bg-pearl/30 dark:bg-deep-cosmos/20 text-ink-black dark:text-pearl placeholder:text-silver-mist/50 focus:outline-none focus:ring-1 focus:ring-celestial-indigo"
                            />
                            {question.options.length > 2 && (
                              <button
                                onClick={() => removeOption(question.id, opt.id)}
                                className="p-0.5 text-silver-mist hover:text-coral-alert transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      {question.options.length < 6 && (
                        <button
                          onClick={() => addOption(question.id)}
                          className="mt-1.5 flex items-center gap-1 text-[8px] font-bold text-celestial-indigo hover:opacity-70 transition-opacity"
                        >
                          <Plus className="w-3 h-3" /> Add Option
                        </button>
                      )}
                    </div>
                  )}

                  {/* True/False */}
                  {question.type === 'true_false' && (
                    <div>
                      <label className="text-[8px] font-bold text-silver-mist block mb-1">
                        Correct Answer *
                      </label>
                      <div className="flex items-center gap-3">
                        {['true', 'false'].map((val) => (
                          <button
                            key={val}
                            onClick={() => {
                              updateQuestion(question.id, { correctAnswer: val });
                              const opts = question.options.map((o) => ({
                                ...o,
                                isCorrect: o.text.toLowerCase() === val,
                              }));
                              updateQuestion(question.id, { options: opts, correctAnswer: val });
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold border transition-colors ${
                              question.correctAnswer === val
                                ? 'border-celestial-indigo bg-celestial-indigo/10 text-celestial-indigo'
                                : 'border-cloud dark:border-nebula-purple/20 text-silver-mist'
                            }`}
                          >
                            {question.correctAnswer === val ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <Circle className="w-3 h-3" />
                            )}
                            {val === 'true' ? 'True' : 'False'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Short Answer */}
                  {question.type === 'short_answer' && (
                    <div>
                      <label className="text-[8px] font-bold text-silver-mist block mb-0.5">
                        Accepted Answer(s) * (comma-separated for multiple accepted)
                      </label>
                      <input
                        value={question.correctAnswer}
                        onChange={(e) =>
                          updateQuestion(question.id, { correctAnswer: e.target.value })
                        }
                        placeholder="e.g., TypeScript, typescript, TS"
                        className="w-full px-2.5 py-1.5 rounded-lg text-[9px] border border-cloud dark:border-nebula-purple/20 bg-pearl/30 dark:bg-deep-cosmos/20 text-ink-black dark:text-pearl placeholder:text-silver-mist/50 focus:outline-none focus:ring-1 focus:ring-celestial-indigo"
                      />
                      <p className="text-[7px] text-silver-mist mt-0.5">
                        Case-insensitive matching. Separate multiple accepted answers with commas.
                      </p>
                    </div>
                  )}

                  {/* Matching */}
                  {question.type === 'matching' && (
                    <div>
                      <label className="text-[8px] font-bold text-silver-mist block mb-1">
                        Matching Pairs * (left ↔ right)
                      </label>
                      <div className="space-y-1.5">
                        {question.matchingPairs.map((pair, pi) => (
                          <div key={pair.id} className="flex items-center gap-2">
                            <span className="text-[8px] font-bold text-silver-mist w-4 shrink-0">
                              {pi + 1}.
                            </span>
                            <input
                              value={pair.left}
                              onChange={(e) =>
                                updateMatchingPair(question.id, pair.id, { left: e.target.value })
                              }
                              placeholder="Left item"
                              className="flex-1 px-2.5 py-1 rounded-lg text-[9px] border border-cloud dark:border-nebula-purple/20 bg-pearl/30 dark:bg-deep-cosmos/20 text-ink-black dark:text-pearl placeholder:text-silver-mist/50 focus:outline-none focus:ring-1 focus:ring-celestial-indigo"
                            />
                            <ArrowLeftRight className="w-3 h-3 text-silver-mist shrink-0" />
                            <input
                              value={pair.right}
                              onChange={(e) =>
                                updateMatchingPair(question.id, pair.id, { right: e.target.value })
                              }
                              placeholder="Right item"
                              className="flex-1 px-2.5 py-1 rounded-lg text-[9px] border border-cloud dark:border-nebula-purple/20 bg-pearl/30 dark:bg-deep-cosmos/20 text-ink-black dark:text-pearl placeholder:text-silver-mist/50 focus:outline-none focus:ring-1 focus:ring-celestial-indigo"
                            />
                            {question.matchingPairs.length > 2 && (
                              <button
                                onClick={() => removeMatchingPair(question.id, pair.id)}
                                className="p-0.5 text-silver-mist hover:text-coral-alert transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      {question.matchingPairs.length < 8 && (
                        <button
                          onClick={() => addMatchingPair(question.id)}
                          className="mt-1.5 flex items-center gap-1 text-[8px] font-bold text-celestial-indigo hover:opacity-70 transition-opacity"
                        >
                          <Plus className="w-3 h-3" /> Add Pair
                        </button>
                      )}
                    </div>
                  )}

                  {/* Question Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-cloud/50 dark:border-nebula-purple/10">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => moveQuestion(question.id, -1)}
                        disabled={question.order === 1}
                        className="p-1 rounded text-silver-mist hover:text-celestial-indigo disabled:opacity-30 transition-colors"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => moveQuestion(question.id, 1)}
                        disabled={question.order === questions.length}
                        className="p-1 rounded text-silver-mist hover:text-celestial-indigo disabled:opacity-30 transition-colors"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => duplicateQuestion(question.id)}
                        className="flex items-center gap-1 text-[8px] font-bold text-silver-mist hover:text-celestial-indigo transition-colors"
                      >
                        <Copy className="w-3 h-3" /> Duplicate
                      </button>
                      <button
                        onClick={() => removeQuestion(question.id)}
                        className="flex items-center gap-1 text-[8px] font-bold text-silver-mist hover:text-coral-alert transition-colors"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Question */}
      <div className="rounded-xl border border-dashed border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-3">
        {addingType === null ? (
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-[8px] font-bold text-silver-mist mr-1">Add Question:</span>
            {(Object.keys(QUESTION_TYPE_CONFIG) as QuizQuestionType[]).map((type) => {
              const cfg = QUESTION_TYPE_CONFIG[type];
              return (
                <button
                  key={type}
                  onClick={() => addQuestion(type)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[8px] font-bold border border-cloud dark:border-nebula-purple/20 text-ink-black dark:text-pearl hover:border-celestial-indigo hover:text-celestial-indigo transition-colors"
                >
                  {cfg.icon} {cfg.label}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-[9px] font-bold text-ink-black dark:text-pearl mb-2">
              Select question type
            </p>
            <div className="flex items-center justify-center gap-2">
              {(Object.keys(QUESTION_TYPE_CONFIG) as QuizQuestionType[]).map((type) => {
                const cfg = QUESTION_TYPE_CONFIG[type];
                return (
                  <button
                    key={type}
                    onClick={() => addQuestion(type)}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-[8px] font-bold border transition-colors ${
                      addingType === type
                        ? 'border-celestial-indigo bg-celestial-indigo/10 text-celestial-indigo'
                        : 'border-cloud dark:border-nebula-purple/20 text-ink-black dark:text-pearl hover:border-celestial-indigo'
                    }`}
                  >
                    {cfg.icon}
                    <span>{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Validation Warnings */}
      {questions.length > 0 && !isValid && (
        <div className="rounded-xl border border-sunset-amber/30 bg-sunset-amber/5 p-2.5 flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-sunset-amber shrink-0 mt-0.5" />
          <div>
            <p className="text-[9px] font-bold text-sunset-amber">Incomplete quiz</p>
            <ul className="text-[8px] text-silver-mist mt-0.5 space-y-0.5">
              {!settings.title.trim() && <li>• Quiz title is required</li>}
              {questions.filter((q) => !q.text.trim()).length > 0 && (
                <li>• Some questions are missing text</li>
              )}
              {questions.filter(
                (q) => q.type === 'multiple_choice' && !q.options.some((o) => o.isCorrect)
              ).length > 0 && <li>• Some multiple choice questions need a correct answer</li>}
              {questions.filter((q) => q.type === 'short_answer' && !q.correctAnswer.trim())
                .length > 0 && <li>• Some short answer questions need accepted answers</li>}
              {questions.filter(
                (q) =>
                  q.type === 'matching' &&
                  q.matchingPairs.some((p) => !p.left.trim() || !p.right.trim())
              ).length > 0 && <li>• Some matching pairs are incomplete</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizBuilder;
