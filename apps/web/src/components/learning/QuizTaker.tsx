"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Send,
  Flag,
  Link2,
} from "lucide-react";

interface QuizOption {
  id: string;
  text: string;
}

interface MatchItem {
  id: string;
  left: string;
  right: string;
}

interface QuizQuestion {
  id: string;
  type: "multiple-choice" | "true-false" | "short-answer" | "matching";
  text: string;
  options: QuizOption[];
  points: number;
  matchItems?: MatchItem[];
}

interface QuizData {
  id: string;
  title: string;
  totalQuestions: number;
  timeLimit: number;
  questions: QuizQuestion[];
}

const mockQuiz: QuizData = {
  id: "quiz-001",
  title: "Module 7: Regression Analysis Quiz",
  totalQuestions: 6,
  timeLimit: 1800,
  questions: [
    {
      id: "q-001",
      type: "multiple-choice",
      text: "Which of the following is the correct formula for the coefficient of determination (R squared)?",
      options: [
        { id: "o-1", text: "R squared = 1 - (SS_res / SS_tot)" },
        { id: "o-2", text: "R squared = SS_res / SS_tot" },
        { id: "o-3", text: "R squared = SS_reg / SS_res" },
        { id: "o-4", text: "R squared = 1 - (SS_tot / SS_res)" },
      ],
      points: 10,
    },
    {
      id: "q-002",
      type: "true-false",
      text: "A high R squared value always indicates that the regression model is a good fit for predicting future data.",
      options: [
        { id: "o-5", text: "True" },
        { id: "o-6", text: "False" },
      ],
      points: 5,
    },
    {
      id: "q-003",
      type: "multiple-choice",
      text: "In multiple linear regression, what does multicollinearity refer to?",
      options: [
        { id: "o-7", text: "High correlation between the response and predictor variables" },
        { id: "o-8", text: "High correlation among predictor variables" },
        { id: "o-9", text: "Non-linear relationship between variables" },
        { id: "o-10", text: "Heteroscedasticity in residuals" },
      ],
      points: 10,
    },
    {
      id: "q-004",
      type: "short-answer",
      text: "What is the name of the technique used to prevent overfitting by adding a penalty term to the loss function in regression?",
      options: [],
      points: 10,
    },
    {
      id: "q-005",
      type: "multiple-choice",
      text: "Which assumption is NOT required for ordinary least squares (OLS) regression?",
      options: [
        { id: "o-11", text: "Linearity" },
        { id: "o-12", text: "Homoscedasticity" },
        { id: "o-13", text: "Normal distribution of predictors" },
        { id: "o-14", text: "Independence of errors" },
      ],
      points: 10,
    },
    {
      id: "q-006",
      type: "matching",
      text: "Match each regression technique with its primary use case:",
      options: [],
      points: 15,
      matchItems: [
        { id: "m-1", left: "Linear Regression", right: "Continuous outcome prediction" },
        { id: "m-2", left: "Logistic Regression", right: "Binary classification" },
        { id: "m-3", left: "Ridge Regression", right: "Handling multicollinearity" },
        { id: "m-4", left: "Lasso Regression", right: "Feature selection" },
      ],
    },
  ],
};

export default function QuizTaker() {
  const [quiz] = useState<QuizData>(mockQuiz);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [matchAnswers, setMatchAnswers] = useState<Record<string, Record<string, string>>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimit);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [submitted]);

  const currentQuestion = quiz.questions[currentIndex];

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const selectAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const selectMatchAnswer = (questionId: string, leftId: string, rightValue: string) => {
    setMatchAnswers((prev) => ({
      ...prev,
      [questionId]: { ...(prev[questionId] || {}), [leftId]: rightValue },
    }));
    const question = quiz.questions.find((q) => q.id === questionId);
    if (question?.matchItems) {
      const updated = { ...(matchAnswers[questionId] || {}), [leftId]: rightValue };
      if (Object.keys(updated).length === question.matchItems.length) {
        setAnswers((prev) => ({ ...prev, [questionId]: JSON.stringify(updated) }));
      }
    }
  };

  const [shuffledOptions] = useState<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {};
    mockQuiz.questions.forEach((q) => {
      if (q.type === "matching" && q.matchItems) {
        map[q.id] = [...q.matchItems.map((i) => i.right)].sort(() => 0.5 - Math.random());
      }
    });
    return map;
  });

  const toggleFlag = (questionId: string) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const goNext = () => {
    if (currentIndex < quiz.totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const isLowTime = timeRemaining <= 300;

  if (submitted) {
    return (
      <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <CheckCircle2 className="w-16 h-16 text-aurora-green mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-ink-black dark:text-pearl">
            Quiz Submitted!
          </h2>
          <p className="text-silver-mist mt-2">
            You answered {answeredCount} of {quiz.totalQuestions} questions.
            Results will be available shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-bold text-ink-black dark:text-pearl">
            {quiz.title}
          </h1>
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
              isLowTime
                ? "bg-red-50 dark:bg-red-900/20 text-red-600"
                : "bg-cloud dark:bg-nebula-purple/20 text-ink-black dark:text-pearl"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="font-mono text-sm font-medium">
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        {/* Question Navigator */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {quiz.questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(i)}
              className={`w-8 h-8 rounded-lg text-sm font-medium flex items-center justify-center transition-colors ${
                i === currentIndex
                  ? "bg-celestial-indigo text-white"
                  : answers[q.id]
                  ? "bg-aurora-green/20 text-aurora-green border border-aurora-green/30"
                  : "border border-cloud dark:border-nebula-purple/50 text-ink-black dark:text-pearl"
              } ${flagged.has(q.id) ? "ring-2 ring-yellow-400" : ""}`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Question Card */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-silver-mist">
              Question {currentIndex + 1} of {quiz.totalQuestions}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-silver-mist">
                {currentQuestion.points} pts
              </span>
              <button
                onClick={() => toggleFlag(currentQuestion.id)}
                className={`${
                  flagged.has(currentQuestion.id)
                    ? "text-yellow-500"
                    : "text-silver-mist hover:text-yellow-500"
                }`}
                title="Flag for review"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-base font-medium text-ink-black dark:text-pearl mb-6">
            {currentQuestion.text}
          </p>

          {/* Answer Options */}
          {(currentQuestion.type === "multiple-choice" ||
            currentQuestion.type === "true-false") && (
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => selectAnswer(currentQuestion.id, option.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-colors ${
                    answers[currentQuestion.id] === option.id
                      ? "border-celestial-indigo bg-celestial-indigo/5"
                      : "border-cloud dark:border-nebula-purple/50 hover:bg-cloud dark:hover:bg-nebula-purple/10"
                  }`}
                >
                  {answers[currentQuestion.id] === option.id ? (
                    <CheckCircle2 className="w-5 h-5 text-celestial-indigo flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-silver-mist flex-shrink-0" />
                  )}
                  <span className="text-sm text-ink-black dark:text-pearl">
                    {option.text}
                  </span>
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === "short-answer" && (
            <input
              type="text"
              value={answers[currentQuestion.id] || ""}
              onChange={(e) => selectAnswer(currentQuestion.id, e.target.value)}
              placeholder="Type your answer..."
              className="w-full px-4 py-3 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl placeholder:text-silver-mist focus:ring-2 focus:ring-celestial-indigo focus:outline-none"
            />
          )}

          {currentQuestion.type === "matching" && currentQuestion.matchItems && (
            <div className="space-y-3">
              {currentQuestion.matchItems.map((item) => {
                const selectedValue = matchAnswers[currentQuestion.id]?.[item.id] || "";
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="flex-1 px-4 py-3 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-slate-50 dark:bg-deep-cosmos">
                      <span className="text-sm font-medium text-ink-black dark:text-pearl">
                        {item.left}
                      </span>
                    </div>
                    <Link2 className="w-4 h-4 text-celestial-indigo flex-shrink-0" />
                    <select
                      value={selectedValue}
                      onChange={(e) =>
                        selectMatchAnswer(currentQuestion.id, item.id, e.target.value)
                      }
                      className={`flex-1 px-4 py-3 rounded-lg border text-sm transition-colors focus:ring-2 focus:ring-celestial-indigo focus:outline-none ${
                        selectedValue
                          ? "border-celestial-indigo bg-celestial-indigo/5 text-ink-black dark:text-pearl"
                          : "border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-silver-mist"
                      }`}
                    >
                      <option value="">Select match...</option>
                      {(shuffledOptions[currentQuestion.id] || []).map((opt, idx) => (
                        <option key={idx} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 text-ink-black dark:text-pearl disabled:opacity-40 hover:bg-cloud dark:hover:bg-nebula-purple/20"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <div className="flex items-center gap-3">
            <span className="text-sm text-silver-mist">
              {answeredCount}/{quiz.totalQuestions} answered
            </span>
            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo text-white rounded-lg font-medium hover:bg-celestial-indigo/90"
            >
              <Send className="w-4 h-4" /> Submit
            </button>
          </div>

          <button
            onClick={goNext}
            disabled={currentIndex === quiz.totalQuestions - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 text-ink-black dark:text-pearl disabled:opacity-40 hover:bg-cloud dark:hover:bg-nebula-purple/20"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Submit Confirmation Modal */}
        {showConfirmSubmit && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6 max-w-sm mx-4">
              <AlertTriangle className="w-8 h-8 text-yellow-500 mb-3" />
              <h3 className="text-lg font-semibold text-ink-black dark:text-pearl">
                Submit Quiz?
              </h3>
              <p className="text-sm text-silver-mist mt-2">
                You have answered {answeredCount} of {quiz.totalQuestions}{" "}
                questions.{" "}
                {answeredCount < quiz.totalQuestions &&
                  "Some questions are unanswered."}
              </p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 text-ink-black dark:text-pearl hover:bg-cloud dark:hover:bg-nebula-purple/20"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setSubmitted(true)}
                  className="flex-1 px-4 py-2 bg-celestial-indigo text-white rounded-lg font-medium hover:bg-celestial-indigo/90"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
