'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  BookOpen,
  ClipboardList,
  Clock,
  Trophy,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import type {
  TrainingContent,
  TrainingSection,
  QuizQuestion,
} from '@/services/complianceTrainingService';
import { ComplianceTrainingService } from '@/services/complianceTrainingService';

// ── Video player placeholder ──────────────────────────────────────────────────

function VideoPlayer({ section }: { section: TrainingSection }) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  // Simulate video progress
  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          setPlaying(false);
          return 100;
        }
        return p + (100 / (section.duration * 60)) * 2;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [playing, section.duration]);

  return (
    <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-video w-full">
      {/* Placeholder background */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="text-center">
          <Play className="w-16 h-16 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">{section.title}</p>
          <p className="text-slate-500 text-xs mt-1">Duration: {section.duration} minutes</p>
        </div>
      </div>

      {/* Controls overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        {/* Progress bar */}
        <div className="w-full h-1 bg-white/20 rounded-full mb-3 cursor-pointer">
          <div
            className="h-full bg-indigo-400 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPlaying((p) => !p)}
            className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
          >
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMuted((m) => !m)}
            className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <span className="text-white text-xs ml-1">
            {Math.floor((progress / 100) * section.duration)}:
            {String(Math.floor(((progress / 100) * section.duration * 60) % 60)).padStart(2, '0')} /{' '}
            {section.duration}:00
          </span>
          <button className="ml-auto w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white">
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Slides player ─────────────────────────────────────────────────────────────

function SlidesPlayer({ section }: { section: TrainingSection }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = section.slides ?? [];
  const totalSlides = slides.length;

  if (totalSlides === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-50 dark:bg-slate-800 rounded-2xl">
        <div className="text-center text-slate-400">
          <BookOpen className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Slides content loading...</p>
        </div>
      </div>
    );
  }

  const slide = slides[currentSlide];

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 min-h-[300px] flex flex-col justify-center">
        <div className="text-xs text-slate-400 mb-4">
          Slide {currentSlide + 1} of {totalSlides}
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">{slide.title}</h2>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{slide.content}</p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentSlide((s) => Math.max(0, s - 1))}
          disabled={currentSlide === 0}
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm rounded-xl disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        {/* Dots */}
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? 'bg-indigo-600 w-4' : 'bg-slate-300 dark:bg-slate-600'}`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentSlide((s) => Math.min(totalSlides - 1, s + 1))}
          disabled={currentSlide === totalSlides - 1}
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm rounded-xl disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Quiz ──────────────────────────────────────────────────────────────────────

interface QuizProps {
  questions: QuizQuestion[];
  passingScore: number;
  onComplete: (score: number) => void;
}

function Quiz({ questions, passingScore, onComplete }: QuizProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);

  const handleSubmit = () => {
    const correct = questions.filter((q) => answers[q.id] === q.correctOptionId).length;
    const score = Math.round((correct / questions.length) * 100);
    setSubmitted(true);
    setTimeout(() => onComplete(score), 2000);
  };

  const allAnswered = questions.every((q) => answers[q.id]);
  const question = questions[currentQ];

  if (submitted) {
    const correct = questions.filter((q) => answers[q.id] === q.correctOptionId).length;
    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= passingScore;
    return (
      <div className="text-center py-10 space-y-4">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${passed ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}
        >
          {passed ? (
            <Trophy className="w-10 h-10 text-emerald-600" />
          ) : (
            <XCircle className="w-10 h-10 text-red-600" />
          )}
        </div>
        <div>
          <h3 className={`text-2xl font-bold ${passed ? 'text-emerald-600' : 'text-red-600'}`}>
            {score}% — {passed ? 'Passed!' : 'Not Passed'}
          </h3>
          <p className="text-slate-500 mt-1">
            {correct} of {questions.length} correct · Minimum: {passingScore}%
          </p>
          <p className="text-sm text-slate-400 mt-2">Processing your results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Question {currentQ + 1} of {questions.length}
        </span>
        <span>{Object.keys(answers).length} answered</span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all"
          style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
        <p className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-5">
          {question.question}
        </p>
        <div className="space-y-3">
          {question.options.map((opt) => (
            <label
              key={opt.id}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                answers[question.id] === opt.id
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <input
                type="radio"
                name={`q-${question.id}`}
                value={opt.id}
                className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                checked={answers[question.id] === opt.id}
                onChange={() => setAnswers((a) => ({ ...a, [question.id]: opt.id }))}
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">{opt.text}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
          disabled={currentQ === 0}
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 rounded-xl disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        {currentQ < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQ((q) => Math.min(questions.length - 1, q + 1))}
            disabled={!answers[question.id]}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" /> Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface TrainingPlayerProps {
  assignmentId: string;
  onComplete: (score: number) => void;
  onBack: () => void;
}

export function TrainingPlayer({ assignmentId, onComplete, onBack }: TrainingPlayerProps) {
  const [content, setContent] = useState<TrainingContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    ComplianceTrainingService.startTraining(assignmentId).catch(() => {});
    ComplianceTrainingService.getTrainingContent(assignmentId)
      .then(setContent)
      .finally(() => setLoading(false));
  }, [assignmentId]);

  const markSectionComplete = (sectionId: string) => {
    setCompletedSections((prev) => new Set([...prev, sectionId]));
  };

  const handleNextSection = () => {
    if (!content) return;
    const current = content.sections[currentSectionIdx];
    markSectionComplete(current.id);
    if (currentSectionIdx < content.sections.length - 1) {
      setCurrentSectionIdx((i) => i + 1);
    }
  };

  const handleQuizComplete = async (score: number) => {
    if (!content) return;
    markSectionComplete(content.sections[currentSectionIdx].id);
    await ComplianceTrainingService.completeTraining(assignmentId, score);
    onComplete(score);
  };

  if (loading || !content) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const currentSection = content.sections[currentSectionIdx];
  const overallProgress = Math.round((completedSections.size / content.sections.length) * 100);

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div className="flex items-start gap-4">
        <button
          onClick={onBack}
          className="mt-1 w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{content.title}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{content.description}</p>
        </div>
      </div>

      {/* Overall progress */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Overall Progress
          </span>
          <span className="text-sm font-bold text-indigo-600">{overallProgress}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sticky top-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Sections
            </h3>
            <div className="space-y-1">
              {content.sections.map((section, idx) => (
                <button
                  key={section.id}
                  onClick={() => setCurrentSectionIdx(idx)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                    idx === currentSectionIdx
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      completedSections.has(section.id)
                        ? 'bg-emerald-100 dark:bg-emerald-900/30'
                        : idx === currentSectionIdx
                          ? 'bg-indigo-100 dark:bg-indigo-900/30'
                          : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    {completedSections.has(section.id) ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <span className="text-xs font-semibold text-slate-500">{idx + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{section.title}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {section.duration} min
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Section header */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
              {currentSection.type === 'quiz' ? (
                <ClipboardList className="w-4 h-4 text-indigo-600" />
              ) : currentSection.type === 'video' ? (
                <Play className="w-4 h-4 text-indigo-600" />
              ) : (
                <BookOpen className="w-4 h-4 text-indigo-600" />
              )}
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {currentSection.title}
              </h2>
              <p className="text-xs text-slate-500 capitalize">
                {currentSection.type} · {currentSection.duration} min
              </p>
            </div>
          </div>

          {/* Content renderer */}
          {currentSection.type === 'video' && <VideoPlayer section={currentSection} />}
          {currentSection.type === 'slides' && <SlidesPlayer section={currentSection} />}
          {currentSection.type === 'quiz' && content.quiz && (
            <Quiz
              questions={content.quiz.questions}
              passingScore={content.quiz.passingScore}
              onComplete={handleQuizComplete}
            />
          )}

          {/* Next button (non-quiz sections) */}
          {currentSection.type !== 'quiz' && (
            <div className="flex justify-end">
              <button
                onClick={handleNextSection}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {currentSectionIdx < content.sections.length - 1 ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Mark Complete & Continue
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Mark Complete
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
