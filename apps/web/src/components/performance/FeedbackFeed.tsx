"use client";

import React from "react";
import {
  Activity,
  ThumbsUp,
  AlertCircle,
  Lightbulb,
  Clock,
} from "lucide-react";

type FeedbackType = "praise" | "constructive" | "suggestion";

export interface FeedbackFeedItem {
  id: string;
  sender: string;
  senderAvatar: string;
  message: string;
  timestamp: string;
  type: FeedbackType;
}

const mockFeedItems: FeedbackFeedItem[] = [
  {
    id: "1",
    sender: "Alice Chen",
    senderAvatar: "AC",
    message:
      "Great job on the product launch! Your coordination across teams was exceptional and kept everyone aligned.",
    timestamp: "2026-01-23T09:15:00",
    type: "praise",
  },
  {
    id: "2",
    sender: "Marcus Johnson",
    senderAvatar: "MJ",
    message:
      "Consider breaking down your presentations into shorter segments. The audience engagement dropped during the longer sections.",
    timestamp: "2026-01-22T16:30:00",
    type: "constructive",
  },
  {
    id: "3",
    sender: "Sarah Williams",
    senderAvatar: "SW",
    message:
      "It might help to create a shared glossary for the team. New members often struggle with our domain-specific terminology.",
    timestamp: "2026-01-22T11:45:00",
    type: "suggestion",
  },
  {
    id: "4",
    sender: "Elena Rodriguez",
    senderAvatar: "ER",
    message:
      "Your mentorship during the onboarding process made a huge difference. The new hire felt supported from day one.",
    timestamp: "2026-01-21T14:20:00",
    type: "praise",
  },
  {
    id: "5",
    sender: "David Park",
    senderAvatar: "DP",
    message:
      "The test coverage on the last PR was below our team standard. Please ensure critical paths are covered before requesting reviews.",
    timestamp: "2026-01-21T09:00:00",
    type: "constructive",
  },
  {
    id: "6",
    sender: "Priya Sharma",
    senderAvatar: "PS",
    message:
      "Have you considered using async standups for the remote team members in different time zones? It could improve participation.",
    timestamp: "2026-01-20T15:10:00",
    type: "suggestion",
  },
];

const typeConfig: Record<
  FeedbackType,
  { label: string; icon: React.ReactNode; colorClass: string; dotClass: string }
> = {
  praise: {
    label: "Praise",
    icon: <ThumbsUp className="w-3 h-3" />,
    colorClass: "bg-aurora-green/10 text-aurora-green",
    dotClass: "bg-aurora-green",
  },
  constructive: {
    label: "Constructive",
    icon: <AlertCircle className="w-3 h-3" />,
    colorClass:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    dotClass: "bg-amber-500",
  },
  suggestion: {
    label: "Suggestion",
    icon: <Lightbulb className="w-3 h-3" />,
    colorClass: "bg-celestial-indigo/10 text-celestial-indigo",
    dotClass: "bg-celestial-indigo",
  },
};

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function FeedbackFeed() {
  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="w-6 h-6 text-celestial-indigo" />
        <h2 className="text-xl font-semibold text-ink-black dark:text-pearl">
          Feedback Activity
        </h2>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[18px] top-2 bottom-2 w-px bg-cloud dark:bg-nebula-purple/50" />

        <div className="space-y-5">
          {mockFeedItems.map((item) => {
            const config = typeConfig[item.type];
            return (
              <div key={item.id} className="relative flex gap-4">
                {/* Timeline dot */}
                <div className="relative z-10 flex-shrink-0">
                  <div
                    className={`w-[10px] h-[10px] rounded-full mt-4 ml-[13px] ${config.dotClass} ring-4 ring-white dark:ring-stellar-blue`}
                  />
                </div>

                {/* Card */}
                <div className="flex-1 bg-slate-50 dark:bg-deep-cosmos rounded-lg p-4 border border-cloud dark:border-nebula-purple/50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-xs font-semibold text-celestial-indigo">
                        {item.senderAvatar}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-ink-black dark:text-pearl">
                          {item.sender}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-silver-mist">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(item.timestamp)}
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
                  <p className="text-sm text-ink-black/80 dark:text-pearl/80 leading-relaxed ml-11">
                    {item.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
