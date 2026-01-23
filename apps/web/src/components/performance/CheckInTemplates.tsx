"use client";

import React, { useState } from "react";
import {
  ClipboardList,
  Calendar,
  Compass,
  Target,
  Heart,
  Plus,
  Trash2,
  GripVertical,
  Edit3,
  Check,
  X,
} from "lucide-react";

interface TemplateQuestion {
  id: string;
  text: string;
}

interface CheckInTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  iconColorClass: string;
  questions: TemplateQuestion[];
  frequency: string;
}

const initialTemplates: CheckInTemplate[] = [
  {
    id: "weekly",
    name: "Weekly Status",
    description: "Regular weekly check-in to track progress and blockers",
    icon: <Calendar className="w-5 h-5" />,
    iconColorClass: "text-celestial-indigo bg-celestial-indigo/10",
    frequency: "Weekly",
    questions: [
      { id: "w1", text: "What did you accomplish this week?" },
      { id: "w2", text: "What are your top priorities for next week?" },
      { id: "w3", text: "Are there any blockers or challenges?" },
      { id: "w4", text: "Do you need any support or resources?" },
      { id: "w5", text: "Rate your productivity this week (1-10)" },
    ],
  },
  {
    id: "career",
    name: "Career Discussion",
    description: "Deep-dive into career aspirations and development",
    icon: <Compass className="w-5 h-5" />,
    iconColorClass: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20",
    frequency: "Quarterly",
    questions: [
      { id: "c1", text: "Where do you see yourself in 2 years?" },
      { id: "c2", text: "What skills would you like to develop?" },
      { id: "c3", text: "Are there projects or roles you are interested in?" },
      { id: "c4", text: "How can your manager better support your growth?" },
      { id: "c5", text: "What accomplishments are you most proud of recently?" },
    ],
  },
  {
    id: "goal",
    name: "Goal Review",
    description: "Review and adjust current goals and OKRs",
    icon: <Target className="w-5 h-5" />,
    iconColorClass: "text-aurora-green bg-aurora-green/10",
    frequency: "Bi-weekly",
    questions: [
      { id: "g1", text: "What progress have you made on your current goals?" },
      { id: "g2", text: "Are your goals still relevant and achievable?" },
      { id: "g3", text: "Do any goals need to be adjusted or reprioritized?" },
      { id: "g4", text: "What is one key result you are focused on this cycle?" },
      { id: "g5", text: "How aligned do you feel with team objectives?" },
    ],
  },
  {
    id: "wellbeing",
    name: "Wellbeing Check",
    description: "Check in on overall wellbeing and work-life balance",
    icon: <Heart className="w-5 h-5" />,
    iconColorClass: "text-coral-alert bg-coral-alert/10",
    frequency: "Monthly",
    questions: [
      { id: "h1", text: "How would you rate your overall wellbeing (1-10)?" },
      { id: "h2", text: "How is your current workload?" },
      { id: "h3", text: "Are you maintaining a healthy work-life balance?" },
      { id: "h4", text: "What is one thing that would improve your day-to-day?" },
      { id: "h5", text: "Do you feel recognized for your contributions?" },
    ],
  },
];

export default function CheckInTemplates() {
  const [templates, setTemplates] = useState<CheckInTemplate[]>(initialTemplates);
  const [activeTemplate, setActiveTemplate] = useState<string>("weekly");
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [newQuestion, setNewQuestion] = useState("");

  const currentTemplate = templates.find((t) => t.id === activeTemplate)!;

  const handleEditQuestion = (questionId: string, currentText: string) => {
    setEditingQuestion(questionId);
    setEditText(currentText);
  };

  const handleSaveEdit = (templateId: string, questionId: string) => {
    if (!editText.trim()) return;
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === templateId
          ? {
              ...t,
              questions: t.questions.map((q) =>
                q.id === questionId ? { ...q, text: editText.trim() } : q
              ),
            }
          : t
      )
    );
    setEditingQuestion(null);
    setEditText("");
  };

  const handleDeleteQuestion = (templateId: string, questionId: string) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === templateId
          ? { ...t, questions: t.questions.filter((q) => q.id !== questionId) }
          : t
      )
    );
  };

  const handleAddQuestion = (templateId: string) => {
    if (!newQuestion.trim()) return;
    const id = `new_${Date.now()}`;
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === templateId
          ? { ...t, questions: [...t.questions, { id, text: newQuestion.trim() }] }
          : t
      )
    );
    setNewQuestion("");
  };

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <ClipboardList className="w-6 h-6 text-celestial-indigo" />
        <h2 className="text-xl font-semibold text-ink-black dark:text-pearl">
          Check-In Templates
        </h2>
      </div>

      {/* Template Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => setActiveTemplate(template.id)}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
              activeTemplate === template.id
                ? "border-celestial-indigo bg-celestial-indigo/5"
                : "border-cloud dark:border-nebula-purple/50 hover:border-gray-300 dark:hover:border-nebula-purple"
            }`}
          >
            <div className={`p-2 rounded-lg ${template.iconColorClass}`}>
              {template.icon}
            </div>
            <span className="text-xs font-medium text-ink-black dark:text-pearl text-center">
              {template.name}
            </span>
            <span className="text-[10px] text-silver-mist">{template.frequency}</span>
          </button>
        ))}
      </div>

      {/* Active Template Details */}
      <div className="border border-cloud dark:border-nebula-purple/50 rounded-lg p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-ink-black dark:text-pearl">
              {currentTemplate.name}
            </h3>
            <p className="text-sm text-silver-mist mt-1">
              {currentTemplate.description}
            </p>
          </div>
          <span className="px-2 py-1 bg-celestial-indigo/10 text-celestial-indigo text-xs font-medium rounded-full">
            {currentTemplate.frequency}
          </span>
        </div>

        {/* Questions List */}
        <div className="space-y-3 mb-4">
          {currentTemplate.questions.map((question, idx) => (
            <div
              key={question.id}
              className="flex items-center gap-3 group p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-nebula-purple/10 transition-colors"
            >
              <GripVertical className="w-4 h-4 text-silver-mist/50 cursor-grab" />
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-celestial-indigo/10 text-celestial-indigo text-xs font-bold">
                {idx + 1}
              </span>

              {editingQuestion === question.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-sm border border-celestial-indigo rounded-md bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveEdit(currentTemplate.id, question.id)}
                    className="p-1 text-aurora-green hover:bg-aurora-green/10 rounded"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingQuestion(null)}
                    className="p-1 text-coral-alert hover:bg-coral-alert/10 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="flex-1 text-sm text-ink-black dark:text-pearl">
                    {question.text}
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    <button
                      onClick={() => handleEditQuestion(question.id, question.text)}
                      className="p-1 text-silver-mist hover:text-celestial-indigo hover:bg-celestial-indigo/10 rounded"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(currentTemplate.id, question.id)}
                      className="p-1 text-silver-mist hover:text-coral-alert hover:bg-coral-alert/10 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Add New Question */}
        <div className="flex items-center gap-2 pt-3 border-t border-cloud dark:border-nebula-purple/30">
          <Plus className="w-4 h-4 text-silver-mist" />
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddQuestion(currentTemplate.id);
            }}
            placeholder="Add a new question..."
            className="flex-1 px-3 py-2 text-sm bg-transparent text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none"
          />
          <button
            onClick={() => handleAddQuestion(currentTemplate.id)}
            disabled={!newQuestion.trim()}
            className="px-3 py-1.5 text-xs font-medium text-celestial-indigo hover:bg-celestial-indigo/10 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
