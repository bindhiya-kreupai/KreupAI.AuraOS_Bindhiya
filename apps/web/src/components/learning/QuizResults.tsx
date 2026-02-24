/**
 * @module QuizResults
 * @description Quiz results view — score summary, pass/fail status,
 *              per-question review with correct answers, time stats,
 *              and attempt history
 * @project AURA HCM Platform
 */

'use client';

import React, { useMemo, useState } from 'react';
import {
  Trophy,
  XCircle,
  Clock,
  CheckCircle2,
  Circle,
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Award,
  BarChart3,
  BookOpen,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { QuizQuestion, QuizQuestionType, QuizSettings } from './QuizBuilder';
import type { QuizAnswer, QuizSubmission } from './QuizTaker';

// ── Types ────────────────────────────────────────────────────────────────────────

export interface QuestionResult {
  question: QuizQuestion;
  answer: QuizAnswer;
  isCorrect: boolean;
  pointsEarned: number;
  pointsPossible: number;
}

export interface QuizResultData {
  submission: QuizSubmission;
  settings: QuizSettings;
  questions: QuizQuestion[];
  score: number;
  totalPoints: number;
  earnedPoints: number;
  passed: boolean;
  questionResults: QuestionResult[];
  attemptNumber: number;
  attemptsRemaining: number;
}

export interface QuizResultsProps {
  result: QuizResultData;
  onRetry?: () => void;
  onBack?: () => void;
  onViewCourse?: () => void;
}

// ── Scoring Logic ────────────────────────────────────────────────────────────────

export function scoreQuiz(
  settings: QuizSettings,
  questions: QuizQuestion[],
  submission: QuizSubmission,
  attemptNumber: number
): QuizResultData {
  const questionResults: QuestionResult[] = questions.map((q) => {
    const answer = submission.answers.find((a) => a.questionId === q.id) || {
      questionId: q.id,
      isFlagged: false,
    };
    let isCorrect = false;

    if (q.type === 'multiple_choice' || q.type === 'true_false') {
      const correctOpt = q.options.find((o) => o.isCorrect);
      isCorrect = !!answer.selectedOptionId && answer.selectedOptionId === correctOpt?.id;
    } else if (q.type === 'short_answer') {
      const accepted = q.correctAnswer.split(',').map((a) => a.trim().toLowerCase());
      isCorrect = !!answer.textAnswer && accepted.includes(answer.textAnswer.trim().toLowerCase());
    } else if (q.type === 'matching') {
      if (answer.matchingAnswers) {
        isCorrect = q.matchingPairs.every(
          (pair) => answer.matchingAnswers?.[pair.id] === pair.right
        );
      }
    }

    return {
      question: q,
      answer,
      isCorrect,
      pointsEarned: isCorrect ? q.points : 0,
      pointsPossible: q.points,
    };
  });

  const totalPoints = questions.reduce((s, q) => s + q.points, 0);
  const earnedPoints = questionResults.reduce((s, r) => s + r.pointsEarned, 0);
  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

  return {
    submission,
    settings,
    questions,
    score,
    totalPoints,
    earnedPoints,
    passed: score >= settings.passingScore,
    questionResults,
    attemptNumber,
    attemptsRemaining: Math.max(0, settings.maxAttempts - attemptNumber),
  };
}

// ── Config ───────────────────────────────────────────────────────────────────────

const QUESTION_TYPE_LABEL: Record<QuizQuestionType, string> = {
  multiple_choice: 'Multiple Choice',
  true_false: 'True / False',
  short_answer: 'Short Answer',
  matching: 'Matching',
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

// ── Mock Data ────────────────────────────────────────────────────────────────────

export const MOCK_QUIZ_RESULT: QuizResultData = {
  submission: {
    quizId: 'c-2',
    answers: [
      { questionId: 'mq-1', selectedOptionId: 'mq1-a', isFlagged: false },
      { questionId: 'mq-2', selectedOptionId: 'mq2-b', isFlagged: false },
      { questionId: 'mq-3', textAnswer: 'Partial', isFlagged: false },
      {
        questionId: 'mq-4',
        matchingAnswers: {
          'mp-1': 'Defines a contract for object shape',
          'mp-2': 'Set of named constants',
          'mp-3': 'Fixed-length typed array',
          'mp-4': 'Type that can be one of several types',
        },
        isFlagged: false,
      },
      { questionId: 'mq-5', selectedOptionId: 'mq5-a', isFlagged: false },
      { questionId: 'mq-6', selectedOptionId: 'mq6-a', isFlagged: true },
      { questionId: 'mq-7', textAnswer: 'extends', isFlagged: false },
      { questionId: 'mq-8', selectedOptionId: 'mq8-b', isFlagged: false },
    ],
    startedAt: '2026-02-24T10:00:00Z',
    submittedAt: '2026-02-24T10:14:32Z',
    timeSpent: 872,
  },
  settings: {
    title: 'TypeScript Fundamentals Assessment',
    description: 'Test your understanding of TypeScript core concepts.',
    courseId: 'c-2',
    duration: 20,
    passingScore: 70,
    maxAttempts: 3,
    isRandomized: false,
    showCorrectAnswers: true,
    allowReview: true,
  },
  questions: [],
  score: 75,
  totalPoints: 80,
  earnedPoints: 60,
  passed: true,
  questionResults: [
    {
      question: {
        id: 'mq-1',
        type: 'multiple_choice',
        text: 'Which of the following correctly defines a generic function in TypeScript?',
        points: 10,
        options: [
          { id: 'mq1-a', text: 'function identity<T>(arg: T): T { return arg; }', isCorrect: true },
          {
            id: 'mq1-b',
            text: 'function identity(arg: any): any { return arg; }',
            isCorrect: false,
          },
          {
            id: 'mq1-c',
            text: 'function identity<T>(arg: T): void { return arg; }',
            isCorrect: false,
          },
          { id: 'mq1-d', text: 'function identity(T arg): T { return arg; }', isCorrect: false },
        ],
        matchingPairs: [],
        correctAnswer: '',
        explanation: 'Generic functions use angle brackets <T> to define a type parameter.',
        order: 1,
      },
      answer: { questionId: 'mq-1', selectedOptionId: 'mq1-a', isFlagged: false },
      isCorrect: true,
      pointsEarned: 10,
      pointsPossible: 10,
    },
    {
      question: {
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
        explanation: 'Unlike `any`, `unknown` requires type narrowing or assertion.',
        order: 2,
      },
      answer: { questionId: 'mq-2', selectedOptionId: 'mq2-b', isFlagged: false },
      isCorrect: true,
      pointsEarned: 5,
      pointsPossible: 5,
    },
    {
      question: {
        id: 'mq-3',
        type: 'short_answer',
        text: 'What TypeScript utility type makes all properties of a type optional?',
        points: 10,
        options: [],
        matchingPairs: [],
        correctAnswer: 'Partial, partial, Partial<T>',
        explanation: 'Partial<T> sets all properties to optional.',
        order: 3,
      },
      answer: { questionId: 'mq-3', textAnswer: 'Partial', isFlagged: false },
      isCorrect: true,
      pointsEarned: 10,
      pointsPossible: 10,
    },
    {
      question: {
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
        explanation: 'These are fundamental TypeScript constructs.',
        order: 4,
      },
      answer: {
        questionId: 'mq-4',
        matchingAnswers: {
          'mp-1': 'Defines a contract for object shape',
          'mp-2': 'Set of named constants',
          'mp-3': 'Fixed-length typed array',
          'mp-4': 'Type that can be one of several types',
        },
        isFlagged: false,
      },
      isCorrect: true,
      pointsEarned: 20,
      pointsPossible: 20,
    },
    {
      question: {
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
        explanation: '`keyof` produces a union of literal key types.',
        order: 5,
      },
      answer: { questionId: 'mq-5', selectedOptionId: 'mq5-a', isFlagged: false },
      isCorrect: true,
      pointsEarned: 10,
      pointsPossible: 10,
    },
    {
      question: {
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
        explanation: 'Interfaces support multiple inheritance.',
        order: 6,
      },
      answer: { questionId: 'mq-6', selectedOptionId: 'mq6-a', isFlagged: true },
      isCorrect: true,
      pointsEarned: 5,
      pointsPossible: 5,
    },
    {
      question: {
        id: 'mq-7',
        type: 'short_answer',
        text: 'What keyword is used to narrow types in a conditional type expression?',
        points: 10,
        options: [],
        matchingPairs: [],
        correctAnswer: 'infer, extends infer',
        explanation: 'The `infer` keyword allows type inference within conditional types.',
        order: 7,
      },
      answer: { questionId: 'mq-7', textAnswer: 'extends', isFlagged: false },
      isCorrect: false,
      pointsEarned: 0,
      pointsPossible: 10,
    },
    {
      question: {
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
        explanation: '`private` restricts access to the declaring class only.',
        order: 8,
      },
      answer: { questionId: 'mq-8', selectedOptionId: 'mq8-b', isFlagged: false },
      isCorrect: false,
      pointsEarned: 0,
      pointsPossible: 10,
    },
  ],
  attemptNumber: 1,
  attemptsRemaining: 2,
};

// ── Component ────────────────────────────────────────────────────────────────────

export const QuizResults: React.FC<QuizResultsProps> = ({
  result,
  onRetry,
  onBack,
  onViewCourse,
}) => {
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [showAnswers, setShowAnswers] = useState(result.settings.showCorrectAnswers);

  const correctCount = result.questionResults.filter((r) => r.isCorrect).length;
  const incorrectCount = result.questionResults.filter((r) => !r.isCorrect).length;
  const timeSpent = formatTime(result.submission.timeSpent);

  const byType = useMemo(() => {
    const map: Record<string, { correct: number; total: number }> = {};
    result.questionResults.forEach((r) => {
      const t = r.question.type;
      if (!map[t]) map[t] = { correct: 0, total: 0 };
      map[t].total++;
      if (r.isCorrect) map[t].correct++;
    });
    return map;
  }, [result.questionResults]);

  return (
    <div className="space-y-3">
      {/* Score Hero */}
      <div
        className={`rounded-2xl border-2 overflow-hidden ${
          result.passed
            ? 'border-neural-mint bg-neural-mint/5'
            : 'border-coral-alert bg-coral-alert/5'
        }`}
      >
        <div className="p-5 text-center">
          {result.passed ? (
            <Trophy className="w-12 h-12 mx-auto mb-2 text-neural-mint" />
          ) : (
            <XCircle className="w-12 h-12 mx-auto mb-2 text-coral-alert" />
          )}
          <p
            className={`text-[28px] font-black ${result.passed ? 'text-neural-mint' : 'text-coral-alert'}`}
          >
            {result.score}%
          </p>
          <p
            className={`text-[12px] font-bold ${result.passed ? 'text-neural-mint' : 'text-coral-alert'}`}
          >
            {result.passed ? 'Passed!' : 'Not Passed'}
          </p>
          <p className="text-[9px] text-silver-mist mt-1">
            {result.earnedPoints}/{result.totalPoints} points • Passing:{' '}
            {result.settings.passingScore}%
          </p>
          <p className="text-[8px] text-silver-mist">{result.settings.title}</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-2.5 text-center">
          <CheckCircle2 className="w-3.5 h-3.5 mx-auto mb-1 text-neural-mint" />
          <p className="text-[12px] font-black text-ink-black dark:text-pearl">{correctCount}</p>
          <p className="text-[7px] text-silver-mist font-bold">Correct</p>
        </div>
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-2.5 text-center">
          <XCircle className="w-3.5 h-3.5 mx-auto mb-1 text-coral-alert" />
          <p className="text-[12px] font-black text-ink-black dark:text-pearl">{incorrectCount}</p>
          <p className="text-[7px] text-silver-mist font-bold">Incorrect</p>
        </div>
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-2.5 text-center">
          <Clock className="w-3.5 h-3.5 mx-auto mb-1 text-celestial-indigo" />
          <p className="text-[12px] font-black text-ink-black dark:text-pearl">{timeSpent}</p>
          <p className="text-[7px] text-silver-mist font-bold">Time Spent</p>
        </div>
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-2.5 text-center">
          <RotateCcw className="w-3.5 h-3.5 mx-auto mb-1 text-sunset-amber" />
          <p className="text-[12px] font-black text-ink-black dark:text-pearl">
            {result.attemptsRemaining}
          </p>
          <p className="text-[7px] text-silver-mist font-bold">Retries Left</p>
        </div>
      </div>

      {/* Performance by Type */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-3">
        <p className="text-[10px] font-bold text-ink-black dark:text-pearl mb-2 flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-celestial-indigo" /> Performance by Question Type
        </p>
        <div className="space-y-1.5">
          {Object.entries(byType).map(([type, data]) => {
            const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
            return (
              <div key={type} className="flex items-center gap-2">
                <span className="text-[8px] font-bold text-silver-mist w-24 shrink-0">
                  {QUESTION_TYPE_LABEL[type as QuizQuestionType] || type}
                </span>
                <div className="flex-1 h-2 rounded-full bg-cloud dark:bg-nebula-purple/20">
                  <div
                    className={`h-full rounded-full transition-all ${pct >= 70 ? 'bg-neural-mint' : pct >= 40 ? 'bg-sunset-amber' : 'bg-coral-alert'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[8px] font-bold text-ink-black dark:text-pearl w-12 text-right">
                  {data.correct}/{data.total}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Question Review */}
      {result.settings.allowReview && (
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden">
          <div className="px-3 py-2.5 border-b border-cloud/50 dark:border-nebula-purple/10 flex items-center justify-between">
            <p className="text-[10px] font-bold text-ink-black dark:text-pearl flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-celestial-indigo" /> Question Review
            </p>
            {result.settings.showCorrectAnswers && (
              <button
                onClick={() => setShowAnswers(!showAnswers)}
                className="flex items-center gap-1 text-[8px] font-bold text-silver-mist hover:text-celestial-indigo transition-colors"
              >
                {showAnswers ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showAnswers ? 'Hide Answers' : 'Show Answers'}
              </button>
            )}
          </div>

          {result.questionResults.map((qr, idx) => {
            const isExpanded = expandedQ === qr.question.id;

            return (
              <div
                key={qr.question.id}
                className="border-b border-cloud/50 dark:border-nebula-purple/10 last:border-b-0"
              >
                <button
                  onClick={() => setExpandedQ(isExpanded ? null : qr.question.id)}
                  className="w-full flex items-center gap-2 px-3 py-2.5"
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      qr.isCorrect ? 'bg-neural-mint/10' : 'bg-coral-alert/10'
                    }`}
                  >
                    {qr.isCorrect ? (
                      <CheckCircle2 className="w-3 h-3 text-neural-mint" />
                    ) : (
                      <XCircle className="w-3 h-3 text-coral-alert" />
                    )}
                  </span>
                  <span className="text-[9px] font-bold text-silver-mist w-5 shrink-0">
                    Q{idx + 1}
                  </span>
                  <p className="text-[9px] text-ink-black dark:text-pearl truncate flex-1 text-left">
                    {qr.question.text}
                  </p>
                  <span
                    className={`text-[8px] font-bold shrink-0 ${qr.isCorrect ? 'text-neural-mint' : 'text-coral-alert'}`}
                  >
                    {qr.pointsEarned}/{qr.pointsPossible}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3 text-silver-mist" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-silver-mist" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3 space-y-2">
                    <p className="text-[9px] text-ink-black dark:text-pearl leading-relaxed">
                      {qr.question.text}
                    </p>

                    {/* Multiple Choice / True-False Review */}
                    {(qr.question.type === 'multiple_choice' ||
                      qr.question.type === 'true_false') && (
                      <div className="space-y-1">
                        {qr.question.options.map((opt) => {
                          const isSelected = qr.answer.selectedOptionId === opt.id;
                          const isCorrectOpt = opt.isCorrect;
                          let bg = 'bg-pearl/30 dark:bg-deep-cosmos/20';
                          let border = 'border-cloud dark:border-nebula-purple/20';
                          let textColor = 'text-ink-black dark:text-pearl';

                          if (showAnswers) {
                            if (isCorrectOpt && isSelected) {
                              bg = 'bg-neural-mint/10';
                              border = 'border-neural-mint';
                              textColor = 'text-neural-mint';
                            } else if (isCorrectOpt) {
                              bg = 'bg-neural-mint/5';
                              border = 'border-neural-mint/50';
                              textColor = 'text-neural-mint';
                            } else if (isSelected && !isCorrectOpt) {
                              bg = 'bg-coral-alert/10';
                              border = 'border-coral-alert';
                              textColor = 'text-coral-alert';
                            }
                          } else if (isSelected) {
                            bg = 'bg-celestial-indigo/10';
                            border = 'border-celestial-indigo';
                            textColor = 'text-celestial-indigo';
                          }

                          return (
                            <div
                              key={opt.id}
                              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border ${bg} ${border}`}
                            >
                              {showAnswers && isCorrectOpt && (
                                <CheckCircle2 className="w-3 h-3 text-neural-mint shrink-0" />
                              )}
                              {showAnswers && isSelected && !isCorrectOpt && (
                                <XCircle className="w-3 h-3 text-coral-alert shrink-0" />
                              )}
                              {(!showAnswers || (!isCorrectOpt && !isSelected)) && (
                                <Circle className="w-3 h-3 text-silver-mist shrink-0" />
                              )}
                              <span className={`text-[9px] ${textColor}`}>{opt.text}</span>
                              {isSelected && (
                                <span className="text-[7px] font-bold text-silver-mist ml-auto">
                                  (your answer)
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Short Answer Review */}
                    {qr.question.type === 'short_answer' && (
                      <div className="space-y-1">
                        <div
                          className={`px-2.5 py-1.5 rounded-lg border ${qr.isCorrect ? 'border-neural-mint bg-neural-mint/5' : 'border-coral-alert bg-coral-alert/5'}`}
                        >
                          <p className="text-[8px] font-bold text-silver-mist">Your answer:</p>
                          <p
                            className={`text-[9px] font-bold ${qr.isCorrect ? 'text-neural-mint' : 'text-coral-alert'}`}
                          >
                            {qr.answer.textAnswer || '(no answer)'}
                          </p>
                        </div>
                        {showAnswers && !qr.isCorrect && (
                          <div className="px-2.5 py-1.5 rounded-lg border border-neural-mint/50 bg-neural-mint/5">
                            <p className="text-[8px] font-bold text-silver-mist">
                              Accepted answers:
                            </p>
                            <p className="text-[9px] font-bold text-neural-mint">
                              {qr.question.correctAnswer}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Matching Review */}
                    {qr.question.type === 'matching' && (
                      <div className="space-y-1">
                        {qr.question.matchingPairs.map((pair) => {
                          const userMatch = qr.answer.matchingAnswers?.[pair.id] || '';
                          const isMatch = userMatch === pair.right;
                          return (
                            <div
                              key={pair.id}
                              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border ${
                                showAnswers
                                  ? isMatch
                                    ? 'border-neural-mint bg-neural-mint/5'
                                    : 'border-coral-alert bg-coral-alert/5'
                                  : 'border-cloud dark:border-nebula-purple/20 bg-pearl/30 dark:bg-deep-cosmos/20'
                              }`}
                            >
                              <span className="text-[9px] font-bold text-ink-black dark:text-pearl flex-1">
                                {pair.left}
                              </span>
                              <ArrowLeftRight className="w-3 h-3 text-silver-mist shrink-0" />
                              <span
                                className={`text-[9px] flex-1 text-right ${
                                  showAnswers
                                    ? isMatch
                                      ? 'text-neural-mint font-bold'
                                      : 'text-coral-alert font-bold'
                                    : 'text-ink-black dark:text-pearl'
                                }`}
                              >
                                {userMatch || '(not matched)'}
                              </span>
                              {showAnswers && !isMatch && (
                                <span className="text-[7px] text-neural-mint shrink-0">
                                  ({pair.right})
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Explanation */}
                    {showAnswers && qr.question.explanation && (
                      <div className="px-2.5 py-1.5 rounded-lg bg-celestial-indigo/5 border border-celestial-indigo/20">
                        <p className="text-[8px] font-bold text-celestial-indigo">Explanation</p>
                        <p className="text-[8px] text-ink-black dark:text-pearl mt-0.5">
                          {qr.question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            onClick={onBack}
            className="flex-1 py-2.5 rounded-xl text-[10px] font-bold border border-cloud dark:border-nebula-purple/20 text-ink-black dark:text-pearl hover:bg-cloud/50 dark:hover:bg-nebula-purple/10 transition-colors"
          >
            Back to Course
          </button>
        )}
        {onRetry && result.attemptsRemaining > 0 && !result.passed && (
          <button
            onClick={onRetry}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-bold bg-celestial-indigo text-white hover:opacity-90 transition-opacity"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Retry ({result.attemptsRemaining} left)
          </button>
        )}
        {result.passed && onViewCourse && (
          <button
            onClick={onViewCourse}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-bold bg-neural-mint text-white hover:opacity-90 transition-opacity"
          >
            <Award className="w-3.5 h-3.5" /> Continue Learning
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizResults;
