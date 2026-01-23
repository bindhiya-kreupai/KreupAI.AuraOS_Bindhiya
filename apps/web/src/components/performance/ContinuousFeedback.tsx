"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  ArrowUpRight,
  ArrowDownLeft,
  List,
  ThumbsUp,
  Lightbulb,
  AlertCircle,
  Clock,
} from "lucide-react";

type FeedbackType = "praise" | "constructive" | "suggestion";

interface FeedbackItem {
  id: string;
  sender: string;
  senderAvatar: string;
  receiver: string;
  receiverAvatar: string;
  type: FeedbackType;
  date: string;
  content: string;
  isAnonymous: boolean;
}

const mockFeedback: FeedbackItem[] = [
  {
    id: "1",
    sender: "Alice Chen",
    senderAvatar: "AC",
    receiver: "You",
    receiverAvatar: "YO",
    type: "praise",
    date: "2026-01-22",
    content:
      "Excellent job leading the sprint retrospective. Your facilitation skills have improved dramatically and the team really appreciated the structured approach.",
    isAnonymous: false,
  },
  {
    id: "2",
    sender: "You",
    senderAvatar: "YO",
    receiver: "Marcus Johnson",
    receiverAvatar: "MJ",
    type: "constructive",
    date: "2026-01-21",
    content:
      "Consider adding more context to your PR descriptions. It would help reviewers understand the reasoning behind architectural decisions.",
    isAnonymous: false,
  },
  {
    id: "3",
    sender: "Anonymous",
    senderAvatar: "??",
    receiver: "You",
    receiverAvatar: "YO",
    type: "suggestion",
    date: "2026-01-20",
    content:
      "It might be beneficial to schedule dedicated focus time blocks. Your availability for pairing sessions could be more predictable.",
    isAnonymous: true,
  },
  {
    id: "4",
    sender: "Sarah Williams",
    senderAvatar: "SW",
    receiver: "You",
    receiverAvatar: "YO",
    type: "praise",
    date: "2026-01-19",
    content:
      "Thank you for mentoring the new intern. Your patience and clarity in explaining complex concepts is truly admirable.",
    isAnonymous: false,
  },
  {
    id: "5",
    sender: "You",
    senderAvatar: "YO",
    receiver: "Elena Rodriguez",
    receiverAvatar: "ER",
    type: "praise",
    date: "2026-01-18",
    content:
      "Your documentation for the API redesign was incredibly thorough. It saved the entire team hours of onboarding time.",
    isAnonymous: false,
  },
  {
    id: "6",
    sender: "David Park",
    senderAvatar: "DP",
    receiver: "You",
    receiverAvatar: "YO",
    type: "constructive",
    date: "2026-01-17",
    content:
      "During code reviews, try to balance critical feedback with acknowledgment of what was done well. It helps maintain motivation.",
    isAnonymous: false,
  },
];

type TabKey = "received" | "given" | "all";

const typeConfig: Record<
  FeedbackType,
  { label: string; icon: React.ReactNode; colorClass: string }
> = {
  praise: {
    label: "Praise",
    icon: <ThumbsUp className="w-3 h-3" />,
    colorClass: "bg-aurora-green/10 text-aurora-green",
  },
  constructive: {
    label: "Constructive",
    icon: <AlertCircle className="w-3 h-3" />,
    colorClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  suggestion: {
    label: "Suggestion",
    icon: <Lightbulb className="w-3 h-3" />,
    colorClass: "bg-celestial-indigo/10 text-celestial-indigo",
  },
};

export default function ContinuousFeedback() {
  const [activeTab, setActiveTab] = useState<TabKey>("received");

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "received", label: "Received", icon: <ArrowDownLeft className="w-4 h-4" /> },
    { key: "given", label: "Given", icon: <ArrowUpRight className="w-4 h-4" /> },
    { key: "all", label: "All", icon: <List className="w-4 h-4" /> },
  ];

  const filteredFeedback = mockFeedback.filter((item) => {
    if (activeTab === "received") return item.receiver === "You";
    if (activeTab === "given") return item.sender === "You";
    return true;
  });

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-6 h-6 text-celestial-indigo" />
        <h2 className="text-xl font-semibold text-ink-black dark:text-pearl">
          Continuous Feedback
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-nebula-purple/20 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center ${
              activeTab === tab.key
                ? "bg-white dark:bg-stellar-blue text-celestial-indigo shadow-sm"
                : "text-silver-mist hover:text-ink-black dark:hover:text-pearl"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Feedback Cards */}
      <div className="space-y-4">
        {filteredFeedback.map((item) => {
          const config = typeConfig[item.type];
          return (
            <div
              key={item.id}
              className="border border-cloud dark:border-nebula-purple/50 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-xs font-semibold text-celestial-indigo">
                    {item.isAnonymous && item.sender === "Anonymous"
                      ? "??"
                      : item.senderAvatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ink-black dark:text-pearl">
                        {item.sender}
                      </span>
                      <ArrowUpRight className="w-3 h-3 text-silver-mist" />
                      <span className="text-sm font-medium text-ink-black dark:text-pearl">
                        {item.receiver}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-silver-mist mt-0.5">
                      <Clock className="w-3 h-3" />
                      {item.date}
                    </div>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.colorClass}`}
                >
                  {config.icon}
                  {config.label}
                </span>
              </div>
              <p className="text-sm text-ink-black/80 dark:text-pearl/80 leading-relaxed">
                {item.content}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
