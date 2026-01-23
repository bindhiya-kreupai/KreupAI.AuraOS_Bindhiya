"use client";

import React, { useState } from "react";
import {
  Award,
  Heart,
  MessageCircle,
  Share2,
  Clock,
  Star,
  Zap,
  Shield,
  Users,
  Sparkles,
} from "lucide-react";

interface CoreValue {
  name: string;
  icon: React.ReactNode;
  colorClass: string;
}

interface RecognitionPost {
  id: string;
  giver: string;
  giverAvatar: string;
  recipient: string;
  recipientAvatar: string;
  coreValue: CoreValue;
  message: string;
  reactions: number;
  comments: number;
  timestamp: string;
  hasReacted: boolean;
}

const coreValues: Record<string, CoreValue> = {
  innovation: {
    name: "Innovation",
    icon: <Sparkles className="w-3.5 h-3.5" />,
    colorClass: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  },
  teamwork: {
    name: "Teamwork",
    icon: <Users className="w-3.5 h-3.5" />,
    colorClass: "bg-celestial-indigo/10 text-celestial-indigo",
  },
  excellence: {
    name: "Excellence",
    icon: <Star className="w-3.5 h-3.5" />,
    colorClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  },
  integrity: {
    name: "Integrity",
    icon: <Shield className="w-3.5 h-3.5" />,
    colorClass: "bg-aurora-green/10 text-aurora-green",
  },
  speed: {
    name: "Speed",
    icon: <Zap className="w-3.5 h-3.5" />,
    colorClass: "bg-coral-alert/10 text-coral-alert",
  },
};

const mockPosts: RecognitionPost[] = [
  {
    id: "1",
    giver: "Alice Chen",
    giverAvatar: "AC",
    recipient: "Marcus Johnson",
    recipientAvatar: "MJ",
    coreValue: coreValues.teamwork,
    message:
      "Thank you for jumping in to help the onboarding team when they were short-staffed. Your willingness to go above and beyond really made a difference!",
    reactions: 24,
    comments: 5,
    timestamp: "2 hours ago",
    hasReacted: false,
  },
  {
    id: "2",
    giver: "Sarah Williams",
    giverAvatar: "SW",
    recipient: "Elena Rodriguez",
    recipientAvatar: "ER",
    coreValue: coreValues.innovation,
    message:
      "Your creative approach to solving the caching problem saved us weeks of development time. The solution was elegant and performant!",
    reactions: 31,
    comments: 8,
    timestamp: "5 hours ago",
    hasReacted: true,
  },
  {
    id: "3",
    giver: "David Park",
    giverAvatar: "DP",
    recipient: "Priya Sharma",
    recipientAvatar: "PS",
    coreValue: coreValues.excellence,
    message:
      "The test coverage you achieved on the payment module is outstanding. Your attention to edge cases prevented several potential issues in production.",
    reactions: 18,
    comments: 3,
    timestamp: "1 day ago",
    hasReacted: false,
  },
  {
    id: "4",
    giver: "Elena Rodriguez",
    giverAvatar: "ER",
    recipient: "David Park",
    recipientAvatar: "DP",
    coreValue: coreValues.speed,
    message:
      "Incredible turnaround on the hotfix yesterday. You diagnosed the issue, wrote the fix, and got it deployed within 45 minutes. True incident response hero!",
    reactions: 42,
    comments: 12,
    timestamp: "1 day ago",
    hasReacted: true,
  },
  {
    id: "5",
    giver: "Marcus Johnson",
    giverAvatar: "MJ",
    recipient: "Alice Chen",
    recipientAvatar: "AC",
    coreValue: coreValues.integrity,
    message:
      "Thank you for flagging the data privacy concern before the feature shipped. Your commitment to doing the right thing protects our users and our company.",
    reactions: 56,
    comments: 15,
    timestamp: "2 days ago",
    hasReacted: false,
  },
];

export default function RecognitionWall() {
  const [posts, setPosts] = useState<RecognitionPost[]>(mockPosts);

  const toggleReaction = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              hasReacted: !post.hasReacted,
              reactions: post.hasReacted ? post.reactions - 1 : post.reactions + 1,
            }
          : post
      )
    );
  };

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Award className="w-6 h-6 text-celestial-indigo" />
        <h2 className="text-xl font-semibold text-ink-black dark:text-pearl">
          Recognition Wall
        </h2>
      </div>

      {/* Feed */}
      <div className="space-y-5">
        {posts.map((post) => (
          <div
            key={post.id}
            className="border border-cloud dark:border-nebula-purple/50 rounded-lg p-5 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-sm font-bold text-celestial-indigo">
                  {post.giverAvatar}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-semibold text-ink-black dark:text-pearl">
                      {post.giver}
                    </span>
                    <span className="text-xs text-silver-mist">recognized</span>
                    <span className="text-sm font-semibold text-ink-black dark:text-pearl">
                      {post.recipient}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-silver-mist" />
                    <span className="text-xs text-silver-mist">{post.timestamp}</span>
                  </div>
                </div>
              </div>
              {/* Core Value Badge */}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${post.coreValue.colorClass}`}
              >
                {post.coreValue.icon}
                {post.coreValue.name}
              </span>
            </div>

            {/* Message */}
            <p className="text-sm text-ink-black/80 dark:text-pearl/80 leading-relaxed mb-4">
              {post.message}
            </p>

            {/* Recipient highlight */}
            <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 dark:bg-nebula-purple/10 rounded-md">
              <div className="w-7 h-7 rounded-full bg-aurora-green/10 flex items-center justify-center text-xs font-bold text-aurora-green">
                {post.recipientAvatar}
              </div>
              <span className="text-xs font-medium text-ink-black dark:text-pearl">
                {post.recipient}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-3 border-t border-cloud dark:border-nebula-purple/30">
              <button
                onClick={() => toggleReaction(post.id)}
                className={`flex items-center gap-1.5 text-sm transition-colors ${
                  post.hasReacted
                    ? "text-coral-alert"
                    : "text-silver-mist hover:text-coral-alert"
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${post.hasReacted ? "fill-current" : ""}`}
                />
                <span>{post.reactions}</span>
              </button>
              <button className="flex items-center gap-1.5 text-sm text-silver-mist hover:text-celestial-indigo transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span>{post.comments}</span>
              </button>
              <button className="flex items-center gap-1.5 text-sm text-silver-mist hover:text-celestial-indigo transition-colors ml-auto">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
