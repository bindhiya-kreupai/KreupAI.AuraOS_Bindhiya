"use client";

import React, { useState } from "react";
import {
  Award,
  Heart,
  ThumbsUp,
  PartyPopper,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export interface PraiseReaction {
  emoji: string;
  count: number;
  reacted: boolean;
}

export interface PraiseCard {
  id: string;
  sender: string;
  senderAvatar: string;
  receiver: string;
  receiverAvatar: string;
  message: string;
  coreValue: string;
  timestamp: string;
  reactions: PraiseReaction[];
}

const coreValueBadges: Record<string, { colorClass: string; icon: React.ReactNode }> = {
  Innovation: {
    colorClass: "bg-celestial-indigo/10 text-celestial-indigo border-celestial-indigo/20",
    icon: <Sparkles className="w-3 h-3" />,
  },
  Teamwork: {
    colorClass: "bg-aurora-green/10 text-aurora-green border-aurora-green/20",
    icon: <Heart className="w-3 h-3" />,
  },
  Excellence: {
    colorClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-700/30",
    icon: <Award className="w-3 h-3" />,
  },
  Leadership: {
    colorClass: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-700/30",
    icon: <ThumbsUp className="w-3 h-3" />,
  },
  Growth: {
    colorClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700/30",
    icon: <PartyPopper className="w-3 h-3" />,
  },
};

const mockPraises: PraiseCard[] = [
  {
    id: "1",
    sender: "Alice Chen",
    senderAvatar: "AC",
    receiver: "Marcus Johnson",
    receiverAvatar: "MJ",
    message:
      "Incredible work on the product launch! Your ability to coordinate across 5 different teams and keep everyone on track was truly outstanding.",
    coreValue: "Leadership",
    timestamp: "2026-01-23T08:30:00",
    reactions: [
      { emoji: "fire", count: 12, reacted: false },
      { emoji: "clap", count: 8, reacted: true },
      { emoji: "heart", count: 5, reacted: false },
    ],
  },
  {
    id: "2",
    sender: "David Park",
    senderAvatar: "DP",
    receiver: "Sarah Williams",
    receiverAvatar: "SW",
    message:
      "The new design system components are beautiful and so well-documented. You have raised the bar for our entire UI/UX practice.",
    coreValue: "Excellence",
    timestamp: "2026-01-22T15:00:00",
    reactions: [
      { emoji: "fire", count: 6, reacted: true },
      { emoji: "clap", count: 15, reacted: false },
      { emoji: "heart", count: 9, reacted: false },
    ],
  },
  {
    id: "3",
    sender: "Elena Rodriguez",
    senderAvatar: "ER",
    receiver: "Priya Sharma",
    receiverAvatar: "PS",
    message:
      "Your automated testing framework has already caught 3 critical bugs before they hit production. An amazing contribution to our quality culture!",
    coreValue: "Innovation",
    timestamp: "2026-01-22T11:20:00",
    reactions: [
      { emoji: "fire", count: 20, reacted: false },
      { emoji: "clap", count: 11, reacted: true },
      { emoji: "heart", count: 7, reacted: false },
    ],
  },
  {
    id: "4",
    sender: "Marcus Johnson",
    senderAvatar: "MJ",
    receiver: "Elena Rodriguez",
    receiverAvatar: "ER",
    message:
      "Thank you for jumping in to help the junior developers during crunch time. Your patience and willingness to teach is what makes this team great.",
    coreValue: "Teamwork",
    timestamp: "2026-01-21T16:45:00",
    reactions: [
      { emoji: "fire", count: 4, reacted: false },
      { emoji: "clap", count: 9, reacted: false },
      { emoji: "heart", count: 14, reacted: true },
    ],
  },
  {
    id: "5",
    sender: "Sarah Williams",
    senderAvatar: "SW",
    receiver: "David Park",
    receiverAvatar: "DP",
    message:
      "Your initiative to learn Rust and prototype the new microservice showed incredible growth mindset. The performance benchmarks are impressive!",
    coreValue: "Growth",
    timestamp: "2026-01-21T09:30:00",
    reactions: [
      { emoji: "fire", count: 8, reacted: true },
      { emoji: "clap", count: 6, reacted: false },
      { emoji: "heart", count: 3, reacted: false },
    ],
  },
];

const emojiMap: Record<string, string> = {
  fire: "\uD83D\uDD25",
  clap: "\uD83D\uDC4F",
  heart: "\u2764\uFE0F",
};

export function PraiseWall() {
  const [reactions, setReactions] = useState<
    Record<string, PraiseReaction[]>
  >(
    Object.fromEntries(mockPraises.map((p) => [p.id, [...p.reactions]]))
  );

  const handleReaction = (praiseId: string, reactionIdx: number) => {
    setReactions((prev) => {
      const updated = { ...prev };
      const praiseReactions = [...updated[praiseId]];
      const reaction = { ...praiseReactions[reactionIdx] };
      if (reaction.reacted) {
        reaction.count -= 1;
        reaction.reacted = false;
      } else {
        reaction.count += 1;
        reaction.reacted = true;
      }
      praiseReactions[reactionIdx] = reaction;
      updated[praiseId] = praiseReactions;
      return updated;
    });
  };

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Award className="w-6 h-6 text-celestial-indigo" />
        <h2 className="text-xl font-semibold text-ink-black dark:text-pearl">
          Praise Wall
        </h2>
        <span className="ml-auto text-xs text-silver-mist">
          {mockPraises.length} recognitions this week
        </span>
      </div>

      <div className="space-y-4">
        {mockPraises.map((praise) => {
          const badge = coreValueBadges[praise.coreValue] || coreValueBadges["Innovation"];
          const praiseReactions = reactions[praise.id] || praise.reactions;

          return (
            <div
              key={praise.id}
              className="p-4 bg-slate-50 dark:bg-deep-cosmos rounded-lg border border-cloud dark:border-nebula-purple/50 hover:shadow-md transition-shadow"
            >
              {/* Sender -> Receiver */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-xs font-semibold text-celestial-indigo">
                  {praise.senderAvatar}
                </div>
                <span className="text-sm font-medium text-ink-black dark:text-pearl">
                  {praise.sender}
                </span>
                <ArrowRight className="w-3 h-3 text-silver-mist" />
                <div className="w-8 h-8 rounded-full bg-aurora-green/10 flex items-center justify-center text-xs font-semibold text-aurora-green">
                  {praise.receiverAvatar}
                </div>
                <span className="text-sm font-medium text-ink-black dark:text-pearl">
                  {praise.receiver}
                </span>
                <span className="ml-auto text-[10px] text-silver-mist">
                  {new Date(praise.timestamp).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              {/* Message */}
              <p className="text-sm text-ink-black/80 dark:text-pearl/80 leading-relaxed mb-3">
                {praise.message}
              </p>

              {/* Core Value Badge & Reactions */}
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badge.colorClass}`}
                >
                  {badge.icon}
                  {praise.coreValue}
                </span>

                <div className="flex items-center gap-1.5">
                  {praiseReactions.map((reaction, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleReaction(praise.id, idx)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
                        reaction.reacted
                          ? "bg-celestial-indigo/10 border border-celestial-indigo/30 text-celestial-indigo"
                          : "bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 text-silver-mist hover:border-celestial-indigo/30"
                      }`}
                    >
                      <span>{emojiMap[reaction.emoji] || reaction.emoji}</span>
                      <span className="font-medium">{reaction.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
