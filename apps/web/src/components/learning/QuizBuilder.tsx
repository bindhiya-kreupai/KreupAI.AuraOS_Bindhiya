"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  GripVertical,
  Save,
  Settings,
  HelpCircle,
  ToggleLeft,
  Type,
  Link2,
} from "lucide-react";

type QuestionType = "multiple-choice" | "true-false" | "short-answer" | "matching";

interface AnswerOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface MatchPair {
  id: string;
  left: string;
  right: string;
}

interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options: AnswerOption[];
  correctAnswer: string;
  points: number;
  matchPairs?: MatchPair[];
}

interface QuizConfig {
  title: string;
  description: string;
  passingScore: number;
  timeLimit: number;
  shuffleQuestions: boolean;
  showResults: boolean;
}

const initialConfig: QuizConfig = {
  title: "Module 7: Regression Analysis Quiz",
  description: "Test your understanding of regression modeling concepts",
  passingScore: 70,
  timeLimit: 30,
  shuffleQuestions: true,
  showResults: true,
};

const initialQuestions: Question[] = [
  {
    id: "q-001",
    type: "multiple-choice",
    text: "Which of the following is the correct formula for the coefficient of determination?",
    options: [
      { id: "o-1", text: "R squared = 1 - (SS_res / SS_tot)", isCorrect: true },
      { id: "o-2", text: "R squared = SS_res / SS_tot", isCorrect: false },
      { id: "o-3", text: "R squared = SS_reg / SS_res", isCorrect: false },
      { id: "o-4", text: "R squared = 1 - (SS_tot / SS_res)", isCorrect: false },
    ],
    correctAnswer: "o-1",
    points: 10,
  },
  {
    id: "q-002",
    type: "true-false",
    text: "A high R squared value always indicates that the model is a good fit for the data.",
    options: [
      { id: "o-5", text: "True", isCorrect: false },
      { id: "o-6", text: "False", isCorrect: true },
    ],
    correctAnswer: "o-6",
    points: 5,
  },
  {
    id: "q-003",
    type: "short-answer",
    text: "What is the term for when predictor variables in a regression are highly correlated with each other?",
    options: [],
    correctAnswer: "multicollinearity",
    points: 10,
  },
  {
    id: "q-004",
    type: "matching",
    text: "Match each regression technique with its primary use case:",
    options: [],
    correctAnswer: "",
    points: 15,
    matchPairs: [
      { id: "mp-1", left: "Linear Regression", right: "Continuous outcome prediction" },
      { id: "mp-2", left: "Logistic Regression", right: "Binary classification" },
      { id: "mp-3", left: "Ridge Regression", right: "Handling multicollinearity" },
      { id: "mp-4", left: "Lasso Regression", right: "Feature selection" },
    ],
  },
];

export default function QuizBuilder() {
  const [config, setConfig] = useState<QuizConfig>(initialConfig);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [activeTab, setActiveTab] = useState<"questions" | "settings">("questions");

  const addQuestion = (type: QuestionType) => {
    const now = Date.now();
    const newQuestion: Question = {
      id: `q-${now}`,
      type,
      text: "",
      options:
        type === "multiple-choice"
          ? [
              { id: `o-${now}-1`, text: "", isCorrect: false },
              { id: `o-${now}-2`, text: "", isCorrect: false },
              { id: `o-${now}-3`, text: "", isCorrect: false },
              { id: `o-${now}-4`, text: "", isCorrect: false },
            ]
          : type === "true-false"
          ? [
              { id: `o-${now}-1`, text: "True", isCorrect: false },
              { id: `o-${now}-2`, text: "False", isCorrect: false },
            ]
          : [],
      correctAnswer: "",
      points: type === "matching" ? 15 : 10,
      matchPairs:
        type === "matching"
          ? [
              { id: `mp-${now}-1`, left: "", right: "" },
              { id: `mp-${now}-2`, left: "", right: "" },
              { id: `mp-${now}-3`, left: "", right: "" },
            ]
          : undefined,
    };
    setQuestions((prev) => [...prev, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const updateQuestionText = (id: string, text: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, text } : q))
    );
  };

  const updateOptionText = (questionId: string, optionId: string, text: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((o) =>
                o.id === optionId ? { ...o, text } : o
              ),
            }
          : q
      )
    );
  };

  const setCorrectAnswer = (questionId: string, optionId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              correctAnswer: optionId,
              options: q.options.map((o) => ({
                ...o,
                isCorrect: o.id === optionId,
              })),
            }
          : q
      )
    );
  };

  const updateShortAnswer = (questionId: string, answer: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, correctAnswer: answer } : q
      )
    );
  };

  const updateMatchPair = (questionId: string, pairId: string, side: "left" | "right", value: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              matchPairs: q.matchPairs?.map((mp) =>
                mp.id === pairId ? { ...mp, [side]: value } : mp
              ),
            }
          : q
      )
    );
  };

  const addMatchPair = (questionId: string) => {
    const id = `mp-${Date.now()}`;
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, matchPairs: [...(q.matchPairs || []), { id, left: "", right: "" }] }
          : q
      )
    );
  };

  const removeMatchPair = (questionId: string, pairId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, matchPairs: q.matchPairs?.filter((mp) => mp.id !== pairId) }
          : q
      )
    );
  };

  const updatePoints = (id: string, points: number) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, points } : q))
    );
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  const getTypeIcon = (type: QuestionType) => {
    switch (type) {
      case "multiple-choice":
        return <HelpCircle className="w-4 h-4" />;
      case "true-false":
        return <ToggleLeft className="w-4 h-4" />;
      case "short-answer":
        return <Type className="w-4 h-4" />;
      case "matching":
        return <Link2 className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">
              Quiz Builder
            </h1>
            <p className="text-silver-mist mt-1">
              Create and configure quiz assessments
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo text-white rounded-lg font-medium hover:bg-celestial-indigo/90">
            <Save className="w-4 h-4" />
            Save Quiz
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-cloud dark:border-nebula-purple/50 mb-6">
          <button
            onClick={() => setActiveTab("questions")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "questions"
                ? "border-celestial-indigo text-celestial-indigo"
                : "border-transparent text-silver-mist hover:text-ink-black dark:hover:text-pearl"
            }`}
          >
            Questions ({questions.length})
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "settings"
                ? "border-celestial-indigo text-celestial-indigo"
                : "border-transparent text-silver-mist hover:text-ink-black dark:hover:text-pearl"
            }`}
          >
            <span className="flex items-center gap-1">
              <Settings className="w-4 h-4" /> Settings
            </span>
          </button>
        </div>

        {activeTab === "settings" && (
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-1">
                Quiz Title
              </label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl focus:ring-2 focus:ring-celestial-indigo focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-1">
                Description
              </label>
              <textarea
                value={config.description}
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl focus:ring-2 focus:ring-celestial-indigo focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-1">
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={config.passingScore}
                  onChange={(e) =>
                    setConfig({ ...config, passingScore: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl focus:ring-2 focus:ring-celestial-indigo focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-1">
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  value={config.timeLimit}
                  onChange={(e) =>
                    setConfig({ ...config, timeLimit: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl focus:ring-2 focus:ring-celestial-indigo focus:outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-black dark:text-pearl">
                Shuffle Questions
              </span>
              <button
                onClick={() =>
                  setConfig({ ...config, shuffleQuestions: !config.shuffleQuestions })
                }
                className={`w-10 h-6 rounded-full transition-colors ${
                  config.shuffleQuestions ? "bg-celestial-indigo" : "bg-cloud dark:bg-nebula-purple/50"
                } relative`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    config.shuffleQuestions ? "left-5" : "left-1"
                  }`}
                />
              </button>
            </div>
            <div className="pt-2 border-t border-cloud dark:border-nebula-purple/50">
              <p className="text-sm text-silver-mist">
                Total Points: <span className="font-bold text-ink-black dark:text-pearl">{totalPoints}</span> | Passing:{" "}
                <span className="font-bold text-aurora-green">
                  {Math.ceil(totalPoints * (config.passingScore / 100))} pts
                </span>
              </p>
            </div>
          </div>
        )}

        {activeTab === "questions" && (
          <>
            {/* Add Question Buttons */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => addQuestion("multiple-choice")}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 text-ink-black dark:text-pearl hover:bg-cloud dark:hover:bg-nebula-purple/20"
              >
                <Plus className="w-4 h-4" /> Multiple Choice
              </button>
              <button
                onClick={() => addQuestion("true-false")}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 text-ink-black dark:text-pearl hover:bg-cloud dark:hover:bg-nebula-purple/20"
              >
                <Plus className="w-4 h-4" /> True/False
              </button>
              <button
                onClick={() => addQuestion("short-answer")}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 text-ink-black dark:text-pearl hover:bg-cloud dark:hover:bg-nebula-purple/20"
              >
                <Plus className="w-4 h-4" /> Short Answer
              </button>
              <button
                onClick={() => addQuestion("matching")}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 text-ink-black dark:text-pearl hover:bg-cloud dark:hover:bg-nebula-purple/20"
              >
                <Plus className="w-4 h-4" /> Matching
              </button>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <GripVertical className="w-4 h-4 text-silver-mist cursor-grab" />
                    <span className="text-sm font-medium text-silver-mist">
                      Q{index + 1}
                    </span>
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-celestial-indigo/10 text-celestial-indigo">
                      {getTypeIcon(question.type)}
                      {question.type.replace("-", " ")}
                    </span>
                    <div className="ml-auto flex items-center gap-3">
                      <input
                        type="number"
                        value={question.points}
                        onChange={(e) =>
                          updatePoints(question.id, Number(e.target.value))
                        }
                        className="w-16 px-2 py-1 text-sm rounded border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl text-center"
                        min="1"
                      />
                      <span className="text-xs text-silver-mist">pts</span>
                      <button
                        onClick={() => removeQuestion(question.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={question.text}
                    onChange={(e) => updateQuestionText(question.id, e.target.value)}
                    placeholder="Enter question text..."
                    rows={2}
                    className="w-full px-3 py-2 mb-3 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl placeholder:text-silver-mist focus:ring-2 focus:ring-celestial-indigo focus:outline-none"
                  />

                  {(question.type === "multiple-choice" ||
                    question.type === "true-false") && (
                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <div key={option.id} className="flex items-center gap-3">
                          <button
                            onClick={() => setCorrectAnswer(question.id, option.id)}
                            className="flex-shrink-0"
                          >
                            {option.isCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-aurora-green" />
                            ) : (
                              <Circle className="w-5 h-5 text-silver-mist" />
                            )}
                          </button>
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) =>
                              updateOptionText(question.id, option.id, e.target.value)
                            }
                            placeholder="Option text..."
                            className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl placeholder:text-silver-mist focus:ring-2 focus:ring-celestial-indigo focus:outline-none"
                            readOnly={question.type === "true-false"}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === "short-answer" && (
                    <div>
                      <label className="block text-xs text-silver-mist mb-1">
                        Correct Answer (case-insensitive)
                      </label>
                      <input
                        type="text"
                        value={question.correctAnswer}
                        onChange={(e) =>
                          updateShortAnswer(question.id, e.target.value)
                        }
                        placeholder="Enter correct answer..."
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-aurora-green/50 bg-aurora-green/5 text-ink-black dark:text-pearl placeholder:text-silver-mist focus:ring-2 focus:ring-aurora-green focus:outline-none"
                      />
                    </div>
                  )}

                  {question.type === "matching" && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-silver-mist flex-1 pl-2">Term</span>
                        <span className="text-xs font-medium text-silver-mist flex-1 pl-2">Match</span>
                        <span className="w-8" />
                      </div>
                      <div className="space-y-2">
                        {question.matchPairs?.map((pair) => (
                          <div key={pair.id} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={pair.left}
                              onChange={(e) =>
                                updateMatchPair(question.id, pair.id, "left", e.target.value)
                              }
                              placeholder="Left term..."
                              className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl placeholder:text-silver-mist focus:ring-2 focus:ring-celestial-indigo focus:outline-none"
                            />
                            <Link2 className="w-4 h-4 text-celestial-indigo flex-shrink-0" />
                            <input
                              type="text"
                              value={pair.right}
                              onChange={(e) =>
                                updateMatchPair(question.id, pair.id, "right", e.target.value)
                              }
                              placeholder="Right match..."
                              className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-aurora-green/50 bg-aurora-green/5 text-ink-black dark:text-pearl placeholder:text-silver-mist focus:ring-2 focus:ring-aurora-green focus:outline-none"
                            />
                            <button
                              onClick={() => removeMatchPair(question.id, pair.id)}
                              className="text-red-400 hover:text-red-600 flex-shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => addMatchPair(question.id)}
                        className="mt-2 flex items-center gap-1 text-xs text-celestial-indigo hover:text-celestial-indigo/80"
                      >
                        <Plus className="w-3 h-3" /> Add Pair
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
