/**
 * @module QuizTaker
 * @description Quiz-taking interface — timed quiz with multiple choice,
 *              true/false, short answer, and matching question types,
 *              navigation, progress, and submit with scoring
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Flag,
  AlertTriangle,
  Send,
  ArrowLeftRight,
  AlignLeft,
  ToggleLeft,
  X,
} from 'lucide-react';
import type { QuizQuestion, QuizQuestionType, QuizSettings } from './QuizBuilder';

// ── Types ────────────────────────────────────────────────────────────────────────

export interface QuizAnswer {
  questionId: string;
  selectedOptionId?: string;
  textAnswer?: string;
  matchingAnswers?: Record<string, string>;
  isFlagged: boolean;
}

export interface QuizSubmission {
  quizId: string;
  answers: QuizAnswer[];
  startedAt: string;
  submittedAt: string;
  timeSpent: number;
}

export interface QuizTakerProps {
  settings: QuizSettings;
  questions: QuizQuestion[];
  onSubmit: (submission: QuizSubmission) => void;
  onCancel?: () => void;
}

// ── Config ───────────────────────────────────────────────────────────────────────

const QUESTION_TYPE_ICON: Record<QuizQuestionType, React.ReactNode> = {
  multiple_choice: <CheckCircle2 className="w-3 h-3" />,
  true_false: <ToggleLeft className="w-3 h-3" />,
  short_answer: <AlignLeft className="w-3 h-3" />,
  matching: <ArrowLeftRight className="w-3 h-3" />,
};

const QUESTION_TYPE_LABEL: Record<QuizQuestionType, string> = {
  multiple_choice: 'Multiple Choice',
  true_false: 'True / False',
  short_answer: 'Short Answer',
  matching: 'Matching',
};

// ── Mock Data ────────────────────────────────────────────────────────────────────

export const MOCK_QUIZ_SETTINGS: QuizSettings = {
  title: 'TypeScript Fundamentals Assessment',
  description:
    'Test your understanding of TypeScript core concepts including types, generics, and utility types.',
  courseId: 'c-2',
  duration: 20,
  passingScore: 70,
  maxAttempts: 3,
  isRandomized: false,
  showCorrectAnswers: true,
  allowReview: true,
};

export const MOCK_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'mq-1',
    type: 'multiple_choice',
    text: 'Which of the following correctly defines a generic function in TypeScript?',
    points: 10,
    options: [
      { id: 'mq1-a', text: 'function identity<T>(arg: T): T { return arg; }', isCorrect: true },
      { id: 'mq1-b', text: 'function identity(arg: any): any { return arg; }', isCorrect: false },
      { id: 'mq1-c', text: 'function identity<T>(arg: T): void { return arg; }', isCorrect: false },
      { id: 'mq1-d', text: 'function identity(T arg): T { return arg; }', isCorrect: false },
    ],
    matchingPairs: [],
    correctAnswer: '',
    explanation:
      'Generic functions use angle brackets <T> to define a type parameter that can be used for argument and return types.',
    order: 1,
  },
  {
    id: 'mq-2',
    type: 'true_false',
    text: 'In TypeScript, the `unknown` type is assignable to any other type without a type assertion.',
    points: 5,
    options: [
      { id: 'mq2-a', text: 'True', isCorrect: false },
      { id: 'mq2-b', text: 'False', isCorrect: true },
    ],
    matchingPairs: [],
    correctAnswer: 'false',
    explanation:
      'Unlike `any`, `unknown` requires type narrowing or assertion before it can be assigned to another type.',
    order: 2,
  },
  {
    id: 'mq-3',
    type: 'short_answer',
    text: 'What TypeScript utility type makes all properties of a type optional?',
    points: 10,
    options: [],
    matchingPairs: [],
    correctAnswer: 'Partial, partial, Partial<T>',
    explanation: 'Partial<T> constructs a type with all properties of T set to optional.',
    order: 3,
  },
  {
    id: 'mq-4',
    type: 'matching',
    text: 'Match each TypeScript concept with its correct description:',
    points: 20,
    options: [],
    matchingPairs: [
      { id: 'mp-1', left: 'interface', right: 'Defines a contract for object shape' },
      { id: 'mp-2', left: 'enum', right: 'Set of named constants' },
      { id: 'mp-3', left: 'tuple', right: 'Fixed-length typed array' },
      { id: 'mp-4', left: 'union', right: 'Type that can be one of several types' },
    ],
    correctAnswer: '',
    explanation: 'These are fundamental TypeScript constructs used for type definition and safety.',
    order: 4,
  },
  {
    id: 'mq-5',
    type: 'multiple_choice',
    text: 'What is the output type of `keyof { name: string; age: number }`?',
    points: 10,
    options: [
      { id: 'mq5-a', text: '"name" | "age"', isCorrect: true },
      { id: 'mq5-b', text: 'string | number', isCorrect: false },
      { id: 'mq5-c', text: 'string', isCorrect: false },
      { id: 'mq5-d', text: '["name", "age"]', isCorrect: false },
    ],
    matchingPairs: [],
    correctAnswer: '',
    explanation:
      '`keyof` produces a union of literal types representing the keys of the object type.',
    order: 5,
  },
  {
    id: 'mq-6',
    type: 'true_false',
    text: 'TypeScript interfaces can extend multiple interfaces at once.',
    points: 5,
    options: [
      { id: 'mq6-a', text: 'True', isCorrect: true },
      { id: 'mq6-b', text: 'False', isCorrect: false },
    ],
    matchingPairs: [],
    correctAnswer: 'true',
    explanation: 'Interfaces support multiple inheritance: `interface C extends A, B { }`.',
    order: 6,
  },
  {
    id: 'mq-7',
    type: 'short_answer',
    text: 'What keyword is used to narrow types in a conditional type expression?',
    points: 10,
    options: [],
    matchingPairs: [],
    correctAnswer: 'infer, extends infer',
    explanation:
      'The `infer` keyword within conditional types allows inferring a type variable from a pattern match.',
    order: 7,
  },
  {
    id: 'mq-8',
    type: 'multiple_choice',
    text: 'Which access modifier makes a class property accessible only within the same class?',
    points: 10,
    options: [
      { id: 'mq8-a', text: 'private', isCorrect: true },
      { id: 'mq8-b', text: 'protected', isCorrect: false },
      { id: 'mq8-c', text: 'readonly', isCorrect: false },
      { id: 'mq8-d', text: 'internal', isCorrect: false },
    ],
    matchingPairs: [],
    correctAnswer: '',
    explanation:
      '`private` restricts access to the declaring class only. `protected` also allows subclasses.',
    order: 8,
  },
];

// ── Helper ───────────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Component ────────────────────────────────────────────────────────────────────

export const QuizTaker: React.FC<QuizTakerProps> = ({
  settings,
  questions: rawQuestions,
  onSubmit,
  onCancel,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuizAnswer>>({});
  const [timeLeft, setTimeLeft] = useState(settings.duration * 60);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const startedAtRef = useRef(new Date().toISOString());

  const questions = useMemo(
    () => (settings.isRandomized ? shuffleArray(rawQuestions) : rawQuestions),
    [rawQuestions, settings.isRandomized]
  );

  // Shuffled right-side options for matching questions
  const shuffledMatching = useMemo(() => {
    const map: Record<string, string[]> = {};
    questions.forEach((q) => {
      if (q.type === 'matching') {
        map[q.id] = shuffleArray(q.matchingPairs.map((p) => p.right));
      }
    });
    return map;
  }, [questions]);

  const currentQ = questions[currentIdx];

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Auto-submit on time out
  useEffect(() => {
    if (timeLeft === 0) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const getAnswer = useCallback(
    (qId: string): QuizAnswer => {
      return answers[qId] || { questionId: qId, isFlagged: false };
    },
    [answers]
  );

  const setAnswer = useCallback((qId: string, update: Partial<QuizAnswer>) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: { ...(prev[qId] || { questionId: qId, isFlagged: false }), ...update },
    }));
  }, []);

  const toggleFlag = useCallback(
    (qId: string) => {
      setAnswer(qId, { isFlagged: !getAnswer(qId).isFlagged });
    },
    [setAnswer, getAnswer]
  );

  const isAnswered = useCallback(
    (qId: string): boolean => {
      const a = answers[qId];
      if (!a) return false;
      const q = questions.find((qq) => qq.id === qId);
      if (!q) return false;
      if (q.type === 'multiple_choice' || q.type === 'true_false') return !!a.selectedOptionId;
      if (q.type === 'short_answer') return !!a.textAnswer?.trim();
      if (q.type === 'matching')
        return (
          !!a.matchingAnswers && Object.keys(a.matchingAnswers).length === q.matchingPairs.length
        );
      return false;
    },
    [answers, questions]
  );

  const answeredCount = useMemo(
    () => questions.filter((q) => isAnswered(q.id)).length,
    [questions, isAnswered]
  );
  const flaggedCount = useMemo(
    () => Object.values(answers).filter((a) => a.isFlagged).length,
    [answers]
  );

  const handleSubmit = useCallback(() => {
    const submission: QuizSubmission = {
      quizId: settings.courseId,
      answers: questions.map((q) => getAnswer(q.id)),
      startedAt: startedAtRef.current,
      submittedAt: new Date().toISOString(),
      timeSpent: settings.duration * 60 - timeLeft,
    };
    onSubmit(submission);
  }, [settings, questions, getAnswer, timeLeft, onSubmit]);

  const timerWarning = timeLeft < 60;
  const timerUrgent = timeLeft < 30;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-ink-black dark:text-pearl truncate">
              {settings.title}
            </p>
            <p className="text-[8px] text-silver-mist mt-0.5">
              {answeredCount}/{questions.length} answered •{' '}
              {flaggedCount > 0 ? `${flaggedCount} flagged • ` : ''}
              Passing: {settings.passingScore}%
            </p>
          </div>
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-black ${
              timerUrgent
                ? 'bg-coral-alert/10 text-coral-alert animate-pulse'
                : timerWarning
                  ? 'bg-sunset-amber/10 text-sunset-amber'
                  : 'bg-celestial-indigo/10 text-celestial-indigo'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-2 h-1.5 w-full rounded-full bg-cloud dark:bg-nebula-purple/20">
          <div
            className="h-full rounded-full bg-celestial-indigo transition-all"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Navigation Mini-map */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue px-3 py-2">
        <div className="flex items-center gap-1 flex-wrap">
          {questions.map((q, idx) => {
            const answered = isAnswered(q.id);
            const flagged = getAnswer(q.id).isFlagged;
            const isCurrent = idx === currentIdx;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(idx)}
                className={`w-6 h-6 rounded text-[8px] font-bold relative transition-colors ${
                  isCurrent
                    ? 'bg-celestial-indigo text-white'
                    : answered
                      ? 'bg-neural-mint/20 text-neural-mint border border-neural-mint/30'
                      : 'bg-cloud/50 dark:bg-nebula-purple/10 text-silver-mist border border-cloud dark:border-nebula-purple/20'
                }`}
              >
                {idx + 1}
                {flagged && (
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-sunset-amber" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Question */}
      {currentQ && (
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden">
          {/* Question Header */}
          <div className="px-3 py-2.5 border-b border-cloud/50 dark:border-nebula-purple/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-silver-mist">
                Q{currentIdx + 1}/{questions.length}
              </span>
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[7px] font-bold bg-celestial-indigo/10 text-celestial-indigo">
                {QUESTION_TYPE_ICON[currentQ.type]} {QUESTION_TYPE_LABEL[currentQ.type]}
              </span>
              <span className="text-[8px] font-bold text-sunset-amber">{currentQ.points} pts</span>
            </div>
            <button
              onClick={() => toggleFlag(currentQ.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-bold transition-colors ${
                getAnswer(currentQ.id).isFlagged
                  ? 'bg-sunset-amber/10 text-sunset-amber'
                  : 'text-silver-mist hover:text-sunset-amber'
              }`}
            >
              <Flag className="w-3 h-3" /> {getAnswer(currentQ.id).isFlagged ? 'Flagged' : 'Flag'}
            </button>
          </div>

          {/* Question Body */}
          <div className="p-4">
            <p className="text-[11px] font-bold text-ink-black dark:text-pearl leading-relaxed mb-4">
              {currentQ.text}
            </p>

            {/* Multiple Choice */}
            {currentQ.type === 'multiple_choice' && (
              <div className="space-y-2">
                {currentQ.options.map((opt, oi) => {
                  const isSelected = getAnswer(currentQ.id).selectedOptionId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setAnswer(currentQ.id, { selectedOptionId: opt.id })}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                        isSelected
                          ? 'bg-celestial-indigo/10 border-2 border-celestial-indigo'
                          : 'bg-pearl/30 dark:bg-deep-cosmos/20 border-2 border-cloud dark:border-nebula-purple/20 hover:border-celestial-indigo/50'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'border-celestial-indigo bg-celestial-indigo'
                            : 'border-cloud dark:border-nebula-purple/30'
                        }`}
                      >
                        {isSelected ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <span className="text-[8px] font-bold text-silver-mist">
                            {String.fromCharCode(65 + oi)}
                          </span>
                        )}
                      </span>
                      <span
                        className={`text-[10px] ${isSelected ? 'font-bold text-celestial-indigo' : 'text-ink-black dark:text-pearl'}`}
                      >
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* True / False */}
            {currentQ.type === 'true_false' && (
              <div className="flex items-center gap-3">
                {currentQ.options.map((opt) => {
                  const isSelected = getAnswer(currentQ.id).selectedOptionId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setAnswer(currentQ.id, { selectedOptionId: opt.id })}
                      className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-[12px] font-bold transition-colors ${
                        isSelected
                          ? 'bg-celestial-indigo/10 border-2 border-celestial-indigo text-celestial-indigo'
                          : 'bg-pearl/30 dark:bg-deep-cosmos/20 border-2 border-cloud dark:border-nebula-purple/20 text-ink-black dark:text-pearl hover:border-celestial-indigo/50'
                      }`}
                    >
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Circle className="w-4 h-4 text-silver-mist" />
                      )}
                      {opt.text}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Short Answer */}
            {currentQ.type === 'short_answer' && (
              <div>
                <input
                  value={getAnswer(currentQ.id).textAnswer || ''}
                  onChange={(e) => setAnswer(currentQ.id, { textAnswer: e.target.value })}
                  placeholder="Type your answer here..."
                  className="w-full px-3 py-2.5 rounded-xl text-[10px] border-2 border-cloud dark:border-nebula-purple/20 bg-pearl/30 dark:bg-deep-cosmos/20 text-ink-black dark:text-pearl placeholder:text-silver-mist/50 focus:outline-none focus:border-celestial-indigo"
                />
                <p className="text-[7px] text-silver-mist mt-1">
                  Enter your answer. Case-insensitive matching will be used.
                </p>
              </div>
            )}

            {/* Matching */}
            {currentQ.type === 'matching' && (
              <div>
                <p className="text-[8px] text-silver-mist mb-2">
                  Select the correct match for each item on the left:
                </p>
                <div className="space-y-2">
                  {currentQ.matchingPairs.map((pair) => {
                    const currentMatch = getAnswer(currentQ.id).matchingAnswers?.[pair.id] || '';
                    const rightOptions =
                      shuffledMatching[currentQ.id] || currentQ.matchingPairs.map((p) => p.right);
                    return (
                      <div key={pair.id} className="flex items-center gap-2">
                        <div className="flex-1 px-3 py-2 rounded-lg bg-celestial-indigo/5 border border-celestial-indigo/20">
                          <p className="text-[9px] font-bold text-ink-black dark:text-pearl">
                            {pair.left}
                          </p>
                        </div>
                        <ArrowLeftRight className="w-3 h-3 text-silver-mist shrink-0" />
                        <select
                          value={currentMatch}
                          onChange={(e) => {
                            const prev = getAnswer(currentQ.id).matchingAnswers || {};
                            setAnswer(currentQ.id, {
                              matchingAnswers: { ...prev, [pair.id]: e.target.value },
                            });
                          }}
                          className="flex-1 px-2.5 py-2 rounded-lg text-[9px] border border-cloud dark:border-nebula-purple/20 bg-pearl/30 dark:bg-deep-cosmos/20 text-ink-black dark:text-pearl focus:outline-none focus:ring-1 focus:ring-celestial-indigo"
                        >
                          <option value="">Select match...</option>
                          {rightOptions.map((r, ri) => (
                            <option key={ri} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
          disabled={currentIdx === 0}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-[9px] font-bold border border-cloud dark:border-nebula-purple/20 text-ink-black dark:text-pearl hover:bg-cloud/50 dark:hover:bg-nebula-purple/10 transition-colors disabled:opacity-30"
        >
          <ChevronLeft className="w-3 h-3" /> Previous
        </button>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-[9px] font-bold text-silver-mist hover:text-coral-alert transition-colors"
            >
              <X className="w-3 h-3" /> Cancel
            </button>
          )}
          <button
            onClick={() => setShowSubmitConfirm(true)}
            className="flex items-center gap-1 px-4 py-2 rounded-xl text-[9px] font-bold bg-neural-mint text-white hover:opacity-90 transition-opacity"
          >
            <Send className="w-3 h-3" /> Submit Quiz
          </button>
        </div>

        <button
          onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
          disabled={currentIdx === questions.length - 1}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-[9px] font-bold border border-cloud dark:border-nebula-purple/20 text-ink-black dark:text-pearl hover:bg-cloud/50 dark:hover:bg-nebula-purple/10 transition-colors disabled:opacity-30"
        >
          Next <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/20 p-5 max-w-sm w-full mx-4 shadow-xl">
            <div className="text-center mb-4">
              <Send className="w-8 h-8 mx-auto mb-2 text-celestial-indigo" />
              <p className="text-[12px] font-bold text-ink-black dark:text-pearl">Submit Quiz?</p>
              <p className="text-[9px] text-silver-mist mt-1">
                You have answered {answeredCount} of {questions.length} questions.
                {flaggedCount > 0 && ` ${flaggedCount} questions are flagged for review.`}
              </p>
            </div>

            {answeredCount < questions.length && (
              <div className="rounded-xl bg-sunset-amber/5 border border-sunset-amber/20 p-2.5 mb-3 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-sunset-amber shrink-0 mt-0.5" />
                <p className="text-[8px] text-sunset-amber">
                  {questions.length - answeredCount} question(s) are unanswered. Unanswered
                  questions will receive 0 points.
                </p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 py-2 rounded-xl text-[10px] font-bold border border-cloud dark:border-nebula-purple/20 text-ink-black dark:text-pearl hover:bg-cloud/50 dark:hover:bg-nebula-purple/10 transition-colors"
              >
                Continue Quiz
              </button>
              <button
                onClick={() => {
                  setShowSubmitConfirm(false);
                  handleSubmit();
                }}
                className="flex-1 py-2 rounded-xl text-[10px] font-bold bg-celestial-indigo text-white hover:opacity-90 transition-opacity"
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizTaker;
