"use client";

import React, { useState } from "react";
import {
  Award,
  User,
  ChevronDown,
  Star,
  Zap,
  Shield,
  Users,
  Sparkles,
  Heart,
  Send,
  Plus,
  Minus,
} from "lucide-react";

interface Employee {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface CoreValueOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  colorClass: string;
}

interface BadgeOption {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

const mockEmployees: Employee[] = [
  { id: "1", name: "Alice Chen", role: "Senior Engineer", avatar: "AC" },
  { id: "2", name: "Marcus Johnson", role: "Product Manager", avatar: "MJ" },
  { id: "3", name: "Sarah Williams", role: "UX Designer", avatar: "SW" },
  { id: "4", name: "Elena Rodriguez", role: "Tech Lead", avatar: "ER" },
  { id: "5", name: "David Park", role: "Backend Engineer", avatar: "DP" },
  { id: "6", name: "Priya Sharma", role: "QA Engineer", avatar: "PS" },
];

const coreValueOptions: CoreValueOption[] = [
  {
    id: "innovation",
    name: "Innovation",
    icon: <Sparkles className="w-4 h-4" />,
    colorClass: "border-purple-500 text-purple-600 bg-purple-50 dark:bg-purple-900/10 dark:text-purple-400",
  },
  {
    id: "teamwork",
    name: "Teamwork",
    icon: <Users className="w-4 h-4" />,
    colorClass: "border-celestial-indigo text-celestial-indigo bg-celestial-indigo/5",
  },
  {
    id: "excellence",
    name: "Excellence",
    icon: <Star className="w-4 h-4" />,
    colorClass: "border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-900/10 dark:text-amber-400",
  },
  {
    id: "integrity",
    name: "Integrity",
    icon: <Shield className="w-4 h-4" />,
    colorClass: "border-aurora-green text-aurora-green bg-aurora-green/5",
  },
  {
    id: "speed",
    name: "Speed",
    icon: <Zap className="w-4 h-4" />,
    colorClass: "border-coral-alert text-coral-alert bg-coral-alert/5",
  },
  {
    id: "customer",
    name: "Customer Focus",
    icon: <Heart className="w-4 h-4" />,
    colorClass: "border-pink-500 text-pink-600 bg-pink-50 dark:bg-pink-900/10 dark:text-pink-400",
  },
];

const badgeOptions: BadgeOption[] = [
  { id: "team-player", name: "Team Player", emoji: "\u{1F91D}", description: "Goes above and beyond for teammates" },
  { id: "innovator", name: "Innovator", emoji: "\u{1F4A1}", description: "Brings creative solutions" },
  { id: "mentor", name: "Mentor", emoji: "\u{1F393}", description: "Guides and teaches others" },
  { id: "rockstar", name: "Rockstar", emoji: "\u{1F31F}", description: "Outstanding performance" },
  { id: "problem-solver", name: "Problem Solver", emoji: "\u{1F527}", description: "Tackles tough challenges" },
  { id: "customer-champion", name: "Customer Champion", emoji: "\u{1F451}", description: "Puts customers first" },
];

export default function GiveRecognition() {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [message, setMessage] = useState("");
  const [points, setPoints] = useState(10);
  const [selectedBadge, setSelectedBadge] = useState<string>("");
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const selectedEmp = mockEmployees.find((e) => e.id === selectedEmployee);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || !selectedValue || !message.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSelectedEmployee("");
      setSelectedValue("");
      setMessage("");
      setPoints(10);
      setSelectedBadge("");
    }, 2500);
  };

  if (submitted) {
    return (
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-aurora-green/10 flex items-center justify-center mb-4">
            <Award className="w-8 h-8 text-aurora-green" />
          </div>
          <h3 className="text-lg font-semibold text-ink-black dark:text-pearl mb-2">
            Recognition Sent!
          </h3>
          <p className="text-sm text-silver-mist">
            Your recognition has been posted to the wall.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Award className="w-6 h-6 text-celestial-indigo" />
        <h2 className="text-xl font-semibold text-ink-black dark:text-pearl">
          Give Recognition
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Recipient Selection */}
        <div>
          <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-2">
            Who are you recognizing?
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmployeeDropdown(!showEmployeeDropdown)}
              className="w-full flex items-center justify-between px-4 py-3 border border-cloud dark:border-nebula-purple/50 rounded-lg bg-white dark:bg-stellar-blue hover:border-celestial-indigo transition-colors text-left"
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
                    <span className="text-xs text-silver-mist ml-2">{selectedEmp.role}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-silver-mist">
                  <User className="w-4 h-4" />
                  <span className="text-sm">Select a colleague...</span>
                </div>
              )}
              <ChevronDown className="w-4 h-4 text-silver-mist" />
            </button>
            {showEmployeeDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {mockEmployees.map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => {
                      setSelectedEmployee(emp.id);
                      setShowEmployeeDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-nebula-purple/20 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-xs font-semibold text-celestial-indigo">
                      {emp.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-ink-black dark:text-pearl">{emp.name}</div>
                      <div className="text-xs text-silver-mist">{emp.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Core Value */}
        <div>
          <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-2">
            Core Value
          </label>
          <div className="grid grid-cols-3 gap-2">
            {coreValueOptions.map((value) => (
              <button
                key={value.id}
                type="button"
                onClick={() => setSelectedValue(value.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 transition-all text-sm ${
                  selectedValue === value.id
                    ? value.colorClass
                    : "border-cloud dark:border-nebula-purple/50 text-silver-mist hover:border-gray-300"
                }`}
              >
                {value.icon}
                <span className="font-medium text-xs">{value.name}</span>
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
            placeholder="Share what they did and why it matters..."
            rows={3}
            className="w-full px-4 py-3 border border-cloud dark:border-nebula-purple/50 rounded-lg bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-2 focus:ring-celestial-indigo/30 focus:border-celestial-indigo resize-none"
          />
        </div>

        {/* Points */}
        <div>
          <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-2">
            Points to Award
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setPoints(Math.max(5, points - 5))}
              className="p-2 rounded-lg border border-cloud dark:border-nebula-purple/50 hover:bg-gray-50 dark:hover:bg-nebula-purple/20 transition-colors"
            >
              <Minus className="w-4 h-4 text-silver-mist" />
            </button>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              <span className="text-2xl font-bold text-ink-black dark:text-pearl">
                {points}
              </span>
              <span className="text-sm text-silver-mist">points</span>
            </div>
            <button
              type="button"
              onClick={() => setPoints(Math.min(100, points + 5))}
              className="p-2 rounded-lg border border-cloud dark:border-nebula-purple/50 hover:bg-gray-50 dark:hover:bg-nebula-purple/20 transition-colors"
            >
              <Plus className="w-4 h-4 text-silver-mist" />
            </button>
          </div>
        </div>

        {/* Badge Selection (Optional) */}
        <div>
          <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-2">
            Award a Badge <span className="text-silver-mist font-normal">(optional)</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {badgeOptions.map((badge) => (
              <button
                key={badge.id}
                type="button"
                onClick={() => setSelectedBadge(selectedBadge === badge.id ? "" : badge.id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                  selectedBadge === badge.id
                    ? "border-celestial-indigo bg-celestial-indigo/5"
                    : "border-cloud dark:border-nebula-purple/50 hover:border-gray-300"
                }`}
              >
                <span className="text-xl">{badge.emoji}</span>
                <span className="text-[10px] font-medium text-ink-black dark:text-pearl text-center">
                  {badge.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!selectedEmployee || !selectedValue || !message.trim()}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-celestial-indigo text-white rounded-lg font-medium hover:bg-celestial-indigo/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Send className="w-4 h-4" />
          Send Recognition
        </button>
      </form>
    </div>
  );
}
