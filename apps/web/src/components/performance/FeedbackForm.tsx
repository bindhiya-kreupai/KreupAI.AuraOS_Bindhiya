"use client";

import React, { useState } from "react";
import {
  Send,
  ThumbsUp,
  AlertCircle,
  Lightbulb,
  EyeOff,
  Eye,
  User,
  ChevronDown,
} from "lucide-react";

type FeedbackType = "praise" | "constructive" | "suggestion";

interface Employee {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

const mockEmployees: Employee[] = [
  { id: "1", name: "Alice Chen", role: "Senior Engineer", avatar: "AC" },
  { id: "2", name: "Marcus Johnson", role: "Product Manager", avatar: "MJ" },
  { id: "3", name: "Sarah Williams", role: "UX Designer", avatar: "SW" },
  { id: "4", name: "Elena Rodriguez", role: "Tech Lead", avatar: "ER" },
  { id: "5", name: "David Park", role: "Backend Engineer", avatar: "DP" },
  { id: "6", name: "Priya Sharma", role: "QA Engineer", avatar: "PS" },
];

const feedbackTypes: {
  key: FeedbackType;
  label: string;
  description: string;
  icon: React.ReactNode;
  colorClass: string;
}[] = [
  {
    key: "praise",
    label: "Praise",
    description: "Recognize great work",
    icon: <ThumbsUp className="w-5 h-5" />,
    colorClass:
      "border-aurora-green text-aurora-green bg-aurora-green/5 hover:bg-aurora-green/10",
  },
  {
    key: "constructive",
    label: "Constructive",
    description: "Help them grow",
    icon: <AlertCircle className="w-5 h-5" />,
    colorClass:
      "border-amber-500 text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/10 dark:hover:bg-amber-900/20 dark:text-amber-400",
  },
  {
    key: "suggestion",
    label: "Suggestion",
    description: "Share an idea",
    icon: <Lightbulb className="w-5 h-5" />,
    colorClass:
      "border-celestial-indigo text-celestial-indigo bg-celestial-indigo/5 hover:bg-celestial-indigo/10",
  },
];

export default function FeedbackForm() {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const selectedEmp = mockEmployees.find((e) => e.id === selectedEmployee);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || !feedbackType || !message.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSelectedEmployee("");
      setFeedbackType(null);
      setMessage("");
      setIsAnonymous(false);
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-aurora-green/10 flex items-center justify-center mb-4">
            <ThumbsUp className="w-8 h-8 text-aurora-green" />
          </div>
          <h3 className="text-lg font-semibold text-ink-black dark:text-pearl mb-2">
            Feedback Sent!
          </h3>
          <p className="text-sm text-silver-mist">
            Your feedback has been delivered{isAnonymous ? " anonymously" : ""}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Send className="w-6 h-6 text-celestial-indigo" />
        <h2 className="text-xl font-semibold text-ink-black dark:text-pearl">
          Give Feedback
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee Selection */}
        <div>
          <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-2">
            Select Employee
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between px-4 py-3 border border-cloud dark:border-nebula-purple/50 rounded-lg text-left bg-white dark:bg-stellar-blue hover:border-celestial-indigo transition-colors"
            >
              {selectedEmp ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-xs font-semibold text-celestial-indigo">
                    {selectedEmp.avatar}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-ink-black dark:text-pearl">
                      {selectedEmp.name}
                    </span>
                    <span className="text-xs text-silver-mist ml-2">
                      {selectedEmp.role}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-silver-mist">
                  <User className="w-4 h-4" />
                  <span className="text-sm">Choose a colleague...</span>
                </div>
              )}
              <ChevronDown className="w-4 h-4 text-silver-mist" />
            </button>

            {showDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {mockEmployees.map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => {
                      setSelectedEmployee(emp.id);
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-nebula-purple/20 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-xs font-semibold text-celestial-indigo">
                      {emp.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-ink-black dark:text-pearl">
                        {emp.name}
                      </div>
                      <div className="text-xs text-silver-mist">{emp.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Feedback Type */}
        <div>
          <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-2">
            Feedback Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            {feedbackTypes.map((type) => (
              <button
                key={type.key}
                type="button"
                onClick={() => setFeedbackType(type.key)}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  feedbackType === type.key
                    ? type.colorClass
                    : "border-cloud dark:border-nebula-purple/50 text-silver-mist hover:border-gray-300 dark:hover:border-nebula-purple"
                }`}
              >
                {type.icon}
                <span className="text-sm font-medium">{type.label}</span>
                <span className="text-xs opacity-70">{type.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-2">
            Your Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share specific, actionable feedback..."
            rows={4}
            className="w-full px-4 py-3 border border-cloud dark:border-nebula-purple/50 rounded-lg bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-2 focus:ring-celestial-indigo/30 focus:border-celestial-indigo resize-none"
          />
          <p className="text-xs text-silver-mist mt-1">
            {message.length}/500 characters
          </p>
        </div>

        {/* Anonymous Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-nebula-purple/10 rounded-lg">
          <div className="flex items-center gap-3">
            {isAnonymous ? (
              <EyeOff className="w-5 h-5 text-celestial-indigo" />
            ) : (
              <Eye className="w-5 h-5 text-silver-mist" />
            )}
            <div>
              <span className="text-sm font-medium text-ink-black dark:text-pearl">
                Send Anonymously
              </span>
              <p className="text-xs text-silver-mist">
                Your identity will be hidden from the recipient
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              isAnonymous ? "bg-celestial-indigo" : "bg-gray-300 dark:bg-nebula-purple/40"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                isAnonymous ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!selectedEmployee || !feedbackType || !message.trim()}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-celestial-indigo text-white rounded-lg font-medium hover:bg-celestial-indigo/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Send className="w-4 h-4" />
          Send Feedback
        </button>
      </form>
    </div>
  );
}
