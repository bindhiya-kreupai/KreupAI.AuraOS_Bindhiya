/**
 * @module QuizAssessmentPage
 * @description ESS quiz & assessment page — build, take, and review quizzes
 *              with multiple question types and scoring
 * @route /dashboard/quiz-assessment
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Pencil, Play, BarChart3, BookOpen } from 'lucide-react';
import { QuizBuilder } from '@/components/learning/QuizBuilder';
import type { QuizSettings, QuizQuestion } from '@/components/learning/QuizBuilder';
import {
  QuizTaker,
  MOCK_QUIZ_SETTINGS,
  MOCK_QUIZ_QUESTIONS,
} from '@/components/learning/QuizTaker';
import type { QuizSubmission } from '@/components/learning/QuizTaker';
import { QuizResults, MOCK_QUIZ_RESULT, scoreQuiz } from '@/components/learning/QuizResults';

type ViewMode = 'menu' | 'builder' | 'taker' | 'results';

export default function QuizAssessmentPage() {
  const [view, setView] = useState<ViewMode>('menu');
  const [quizSettings, setQuizSettings] = useState<QuizSettings>(MOCK_QUIZ_SETTINGS);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(MOCK_QUIZ_QUESTIONS);
  const [resultData, setResultData] = useState(MOCK_QUIZ_RESULT);
  const [attemptNum, setAttemptNum] = useState(1);

  const handleBuilderSave = useCallback((settings: QuizSettings, questions: QuizQuestion[]) => {
    setQuizSettings(settings);
    setQuizQuestions(questions);
    setView('menu');
  }, []);

  const handleBuilderPreview = useCallback((settings: QuizSettings, questions: QuizQuestion[]) => {
    setQuizSettings(settings);
    setQuizQuestions(questions);
    setView('taker');
  }, []);

  const handleSubmit = useCallback(
    (submission: QuizSubmission) => {
      const result = scoreQuiz(quizSettings, quizQuestions, submission, attemptNum);
      setResultData(result);
      setAttemptNum((prev) => prev + 1);
      setView('results');
    },
    [quizSettings, quizQuestions, attemptNum]
  );

  const handleRetry = useCallback(() => {
    setView('taker');
  }, []);

  if (view === 'builder') {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <QuizBuilder onSave={handleBuilderSave} onPreview={handleBuilderPreview} />
      </div>
    );
  }

  if (view === 'taker') {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <QuizTaker
          settings={quizSettings}
          questions={quizQuestions}
          onSubmit={handleSubmit}
          onCancel={() => setView('menu')}
        />
      </div>
    );
  }

  if (view === 'results') {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <QuizResults
          result={resultData}
          onRetry={handleRetry}
          onBack={() => setView('menu')}
          onViewCourse={() => setView('menu')}
        />
      </div>
    );
  }

  // Menu View
  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4">
      <div>
        <p className="text-[14px] font-bold text-ink-black dark:text-pearl">
          Quiz & Assessment Center
        </p>
        <p className="text-[9px] text-silver-mist">Build, take, and review assessments</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => setView('builder')}
          className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-5 text-center hover:border-celestial-indigo transition-colors group"
        >
          <Pencil className="w-8 h-8 mx-auto mb-2 text-celestial-indigo group-hover:scale-110 transition-transform" />
          <p className="text-[11px] font-bold text-ink-black dark:text-pearl">Build Quiz</p>
          <p className="text-[8px] text-silver-mist mt-1">
            Create a new quiz with multiple question types
          </p>
        </button>

        <button
          onClick={() => setView('taker')}
          className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-5 text-center hover:border-neural-mint transition-colors group"
        >
          <Play className="w-8 h-8 mx-auto mb-2 text-neural-mint group-hover:scale-110 transition-transform" />
          <p className="text-[11px] font-bold text-ink-black dark:text-pearl">Take Quiz</p>
          <p className="text-[8px] text-silver-mist mt-1">
            Start the TypeScript Fundamentals assessment
          </p>
        </button>

        <button
          onClick={() => setView('results')}
          className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-5 text-center hover:border-sunset-amber transition-colors group"
        >
          <BarChart3 className="w-8 h-8 mx-auto mb-2 text-sunset-amber group-hover:scale-110 transition-transform" />
          <p className="text-[11px] font-bold text-ink-black dark:text-pearl">View Results</p>
          <p className="text-[8px] text-silver-mist mt-1">Review your latest quiz attempt</p>
        </button>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-3">
        <p className="text-[10px] font-bold text-ink-black dark:text-pearl mb-2 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-celestial-indigo" /> Available Assessments
        </p>
        <div className="space-y-1.5">
          {[
            {
              title: 'TypeScript Fundamentals Assessment',
              questions: 8,
              duration: 20,
              passing: 70,
              attempts: '1/3',
              status: 'available',
            },
            {
              title: 'React Advanced Patterns Quiz',
              questions: 12,
              duration: 30,
              passing: 75,
              attempts: '0/3',
              status: 'available',
            },
            {
              title: 'System Design Checkpoint',
              questions: 5,
              duration: 45,
              passing: 60,
              attempts: '2/3',
              status: 'completed',
            },
          ].map((quiz, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-2.5 py-2 rounded-lg bg-pearl/30 dark:bg-deep-cosmos/10"
            >
              <div
                className={`w-2 h-2 rounded-full shrink-0 ${quiz.status === 'completed' ? 'bg-neural-mint' : 'bg-celestial-indigo'}`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold text-ink-black dark:text-pearl truncate">
                  {quiz.title}
                </p>
                <p className="text-[7px] text-silver-mist">
                  {quiz.questions} questions • {quiz.duration}min • Pass: {quiz.passing}%
                </p>
              </div>
              <span className="text-[7px] font-bold text-silver-mist shrink-0">
                {quiz.attempts}
              </span>
              {quiz.status === 'available' ? (
                <button
                  onClick={() => setView('taker')}
                  className="px-2 py-1 rounded-lg text-[8px] font-bold bg-celestial-indigo text-white hover:opacity-90 transition-opacity shrink-0"
                >
                  Start
                </button>
              ) : (
                <button
                  onClick={() => setView('results')}
                  className="px-2 py-1 rounded-lg text-[8px] font-bold border border-cloud dark:border-nebula-purple/20 text-silver-mist hover:text-celestial-indigo transition-colors shrink-0"
                >
                  Review
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
