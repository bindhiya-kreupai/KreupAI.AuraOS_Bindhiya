"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  AlertTriangle,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Target,
} from "lucide-react";

interface QuizAnswer {
  questionId: string;
  questionText: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  points: number;
  maxPoints: number;
}

interface QuizResultData {
  id: string;
  quizTitle: string;
  courseName: string;
  scorePercentage: number;
  passingScore: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedAnswers: number;
  timeTaken: number;
  timeLimit: number;
  attemptNumber: number;
  maxAttempts: number;
  completedAt: string;
  answers: QuizAnswer[];
}

const mockResults: QuizResultData = {
  id: "result-001",
  quizTitle: "Module 7: Regression Analysis Quiz",
  courseName: "Advanced Data Analytics",
  scorePercentage: 76,
  passingScore: 70,
  passed: true,
  totalQuestions: 10,
  correctAnswers: 7,
  incorrectAnswers: 2,
  skippedAnswers: 1,
  timeTaken: 1245,
  timeLimit: 1800,
  attemptNumber: 1,
  maxAttempts: 3,
  completedAt: "2025-01-15T14:32:00Z",
  answers: [
    {
      questionId: "q-001",
      questionText: "Which of the following is the correct formula for the coefficient of determination (R squared)?",
      selectedAnswer: "R squared = 1 - (SS_res / SS_tot)",
      correctAnswer: "R squared = 1 - (SS_res / SS_tot)",
      isCorrect: true,
      points: 10,
      maxPoints: 10,
    },
    {
      questionId: "q-002",
      questionText: "A high R squared value always indicates that the regression model is a good fit for predicting future data.",
      selectedAnswer: "False",
      correctAnswer: "False",
      isCorrect: true,
      points: 5,
      maxPoints: 5,
    },
    {
      questionId: "q-003",
      questionText: "In multiple linear regression, what does multicollinearity refer to?",
      selectedAnswer: "High correlation among predictor variables",
      correctAnswer: "High correlation among predictor variables",
      isCorrect: true,
      points: 10,
      maxPoints: 10,
    },
    {
      questionId: "q-004",
      questionText: "What is the name of the technique used to prevent overfitting by adding a penalty term to the loss function?",
      selectedAnswer: "Normalization",
      correctAnswer: "Regularization",
      isCorrect: false,
      points: 0,
      maxPoints: 10,
    },
    {
      questionId: "q-005",
      questionText: "Which assumption is NOT required for ordinary least squares (OLS) regression?",
      selectedAnswer: "Normal distribution of predictors",
      correctAnswer: "Normal distribution of predictors",
      isCorrect: true,
      points: 10,
      maxPoints: 10,
    },
    {
      questionId: "q-006",
      questionText: "What is the primary purpose of residual analysis in regression?",
      selectedAnswer: "To check model assumptions",
      correctAnswer: "To check model assumptions",
      isCorrect: true,
      points: 10,
      maxPoints: 10,
    },
    {
      questionId: "q-007",
      questionText: "Which method is used to select the best subset of predictors in multiple regression?",
      selectedAnswer: "Stepwise selection",
      correctAnswer: "Stepwise selection",
      isCorrect: true,
      points: 10,
      maxPoints: 10,
    },
    {
      questionId: "q-008",
      questionText: "The Durbin-Watson test is used to detect which type of violation?",
      selectedAnswer: "Heteroscedasticity",
      correctAnswer: "Autocorrelation",
      isCorrect: false,
      points: 0,
      maxPoints: 10,
    },
    {
      questionId: "q-009",
      questionText: "In logistic regression, what link function is used?",
      selectedAnswer: "Logit function",
      correctAnswer: "Logit function",
      isCorrect: true,
      points: 10,
      maxPoints: 10,
    },
    {
      questionId: "q-010",
      questionText: "What does VIF stand for in the context of regression diagnostics?",
      selectedAnswer: "",
      correctAnswer: "Variance Inflation Factor",
      isCorrect: false,
      points: 0,
      maxPoints: 5,
    },
  ],
};

export function QuizResults() {
  const [results] = useState<QuizResultData>(mockResults);
  const [showAnswers, setShowAnswers] = useState(false);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const scoreColor = results.passed
    ? "text-aurora-green"
    : "text-red-500";

  const scoreRingColor = results.passed
    ? "border-aurora-green"
    : "border-red-500";

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">
            Quiz Results
          </h1>
          <p className="text-silver-mist mt-1">{results.quizTitle}</p>
          <p className="text-xs text-silver-mist mt-0.5">{results.courseName}</p>
        </div>

        {/* Score Card */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-6 mb-6">
          <div className="flex flex-col items-center">
            {/* Score Circle */}
            <div className={`w-32 h-32 rounded-full border-4 ${scoreRingColor} flex items-center justify-center mb-4`}>
              <div className="text-center">
                <p className={`text-3xl font-bold ${scoreColor}`}>
                  {results.scorePercentage}%
                </p>
                <p className="text-xs text-silver-mist">Score</p>
              </div>
            </div>

            {/* Pass/Fail Status */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              results.passed
                ? "bg-aurora-green/10 text-aurora-green"
                : "bg-red-50 dark:bg-red-900/20 text-red-500"
            }`}>
              {results.passed ? (
                <Trophy className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
              <span className="font-semibold text-sm">
                {results.passed ? "PASSED" : "FAILED"}
              </span>
            </div>
            <p className="text-xs text-silver-mist mt-2">
              Passing score: {results.passingScore}%
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 text-center bg-slate-50 dark:bg-deep-cosmos">
            <CheckCircle2 className="w-5 h-5 text-aurora-green mx-auto mb-1" />
            <p className="text-lg font-bold text-ink-black dark:text-pearl">
              {results.correctAnswers}
            </p>
            <p className="text-xs text-silver-mist">Correct</p>
          </div>
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 text-center bg-slate-50 dark:bg-deep-cosmos">
            <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-ink-black dark:text-pearl">
              {results.incorrectAnswers}
            </p>
            <p className="text-xs text-silver-mist">Incorrect</p>
          </div>
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 text-center bg-slate-50 dark:bg-deep-cosmos">
            <Target className="w-5 h-5 text-celestial-indigo mx-auto mb-1" />
            <p className="text-lg font-bold text-ink-black dark:text-pearl">
              {results.skippedAnswers}
            </p>
            <p className="text-xs text-silver-mist">Skipped</p>
          </div>
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 text-center bg-slate-50 dark:bg-deep-cosmos">
            <Clock className="w-5 h-5 text-celestial-indigo mx-auto mb-1" />
            <p className="text-lg font-bold text-ink-black dark:text-pearl">
              {formatTime(results.timeTaken)}
            </p>
            <p className="text-xs text-silver-mist">
              of {formatTime(results.timeLimit)}
            </p>
          </div>
        </div>

        {/* Attempt Info */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 mb-6 bg-slate-50 dark:bg-deep-cosmos">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-black dark:text-pearl font-medium">
                Attempt {results.attemptNumber} of {results.maxAttempts}
              </p>
              <p className="text-xs text-silver-mist mt-0.5">
                Completed on {new Date(results.completedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            {results.attemptNumber < results.maxAttempts && (
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-celestial-indigo text-white font-medium hover:bg-celestial-indigo/90 transition-colors">
                <RotateCcw className="w-4 h-4" />
                Retake Quiz
              </button>
            )}
          </div>
        </div>

        {/* Answers Breakdown */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
          <button
            onClick={() => setShowAnswers(!showAnswers)}
            className="w-full flex items-center justify-between px-5 py-4 text-ink-black dark:text-pearl hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors"
          >
            <span className="font-semibold text-sm">Answer Breakdown</span>
            {showAnswers ? (
              <ChevronUp className="w-5 h-5 text-silver-mist" />
            ) : (
              <ChevronDown className="w-5 h-5 text-silver-mist" />
            )}
          </button>

          {showAnswers && (
            <div className="border-t border-cloud dark:border-nebula-purple/50">
              {results.answers.map((answer, index) => (
                <div
                  key={answer.questionId}
                  className={`px-5 py-4 ${
                    index < results.answers.length - 1
                      ? "border-b border-cloud dark:border-nebula-purple/50"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {answer.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-aurora-green" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink-black dark:text-pearl">
                        {index + 1}. {answer.questionText}
                      </p>
                      <div className="mt-2 space-y-1">
                        <p className={`text-xs ${answer.isCorrect ? "text-aurora-green" : "text-red-500"}`}>
                          Your answer: {answer.selectedAnswer || "(Skipped)"}
                        </p>
                        {!answer.isCorrect && (
                          <p className="text-xs text-aurora-green">
                            Correct answer: {answer.correctAnswer}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-silver-mist mt-1">
                        {answer.points}/{answer.maxPoints} points
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
