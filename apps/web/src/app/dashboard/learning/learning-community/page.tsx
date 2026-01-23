"use client";

import React, { useState } from 'react';
import { MessageCircle, Users, ThumbsUp, Share2, BookOpen, Award, Search, TrendingUp, Clock } from 'lucide-react';

interface Post {
  id: string;
  author: string;
  avatar: string;
  role: string;
  content: string;
  topic: string;
  likes: number;
  replies: number;
  timeAgo: string;
  pinned: boolean;
}

const posts: Post[] = [
  { id: '1', author: 'Sarah Chen', avatar: 'SC', role: 'Staff Engineer', content: 'Just completed the System Design course. Here are my top 3 takeaways for building scalable architectures...', topic: 'System Design', likes: 24, replies: 8, timeAgo: '2h ago', pinned: true },
  { id: '2', author: 'Marcus Johnson', avatar: 'MJ', role: 'Engineering Manager', content: 'Looking for study partners for the AWS Solutions Architect certification. Anyone interested in forming a study group?', topic: 'Certifications', likes: 15, replies: 12, timeAgo: '5h ago', pinned: false },
  { id: '3', author: 'Priya Sharma', avatar: 'PS', role: 'Senior Engineer', content: 'Highly recommend the "Technical Writing for Engineers" course. It completely changed how I write design docs.', topic: 'Recommendations', likes: 31, replies: 5, timeAgo: '1d ago', pinned: false },
  { id: '4', author: 'Alex Kim', avatar: 'AK', role: 'Engineer II', content: 'Has anyone taken the Kubernetes Advanced course? Looking for feedback before enrolling.', topic: 'Questions', likes: 8, replies: 6, timeAgo: '1d ago', pinned: false },
  { id: '5', author: 'Rachel Torres', avatar: 'RT', role: 'Product Manager', content: 'Sharing my notes from the Data-Driven Product Decisions workshop. Really practical frameworks!', topic: 'Resources', likes: 19, replies: 3, timeAgo: '2d ago', pinned: false },
];

const topics = ['All', 'System Design', 'Certifications', 'Recommendations', 'Questions', 'Resources', 'Study Groups'];

const leaderboard = [
  { name: 'Sarah Chen', points: 450, badges: 12 },
  { name: 'Marcus Johnson', points: 380, badges: 9 },
  { name: 'Priya Sharma', points: 320, badges: 8 },
  { name: 'You', points: 185, badges: 4 },
];

export default function LearningCommunityPage() {
  const [selectedTopic, setSelectedTopic] = useState('All');

  const filteredPosts = selectedTopic === 'All' ? posts : posts.filter(p => p.topic === selectedTopic);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Learning Community</h1>
          <p className="text-sm text-silver-mist mt-1">Share knowledge, ask questions, and learn together</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors">
          <MessageCircle className="w-4 h-4" /> New Post
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Members</p>
          <p className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">342</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Posts This Week</p>
          <p className="text-2xl font-bold text-celestial-indigo mt-1">28</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Study Groups</p>
          <p className="text-2xl font-bold text-sunset-amber mt-1">8</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Your Rank</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">#14</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-4">
          {/* Topic Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {topics.map((topic) => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedTopic === topic
                    ? 'bg-celestial-indigo text-white'
                    : 'bg-slate-100 dark:bg-deep-cosmos text-silver-mist hover:bg-slate-200'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>

          {/* Posts */}
          <div className="space-y-3">
            {filteredPosts.map((post) => (
              <div key={post.id} className={`bg-white dark:bg-stellar-blue rounded-xl border ${post.pinned ? 'border-celestial-indigo/30' : 'border-cloud dark:border-nebula-purple/50'} p-5`}>
                {post.pinned && (
                  <span className="text-[10px] text-celestial-indigo font-medium mb-2 block">📌 Pinned</span>
                )}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-celestial-indigo/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-celestial-indigo">{post.avatar}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ink-black dark:text-pearl">{post.author}</span>
                      <span className="text-[10px] text-silver-mist">{post.role}</span>
                      <span className="text-[10px] text-silver-mist">• {post.timeAgo}</span>
                    </div>
                    <p className="text-sm text-ink-black dark:text-pearl mt-1.5">{post.content}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-[10px] px-2 py-0.5 bg-celestial-indigo/10 text-celestial-indigo rounded-full font-medium">{post.topic}</span>
                      <button className="flex items-center gap-1 text-xs text-silver-mist hover:text-celestial-indigo transition-colors">
                        <ThumbsUp className="w-3.5 h-3.5" /> {post.likes}
                      </button>
                      <button className="flex items-center gap-1 text-xs text-silver-mist hover:text-celestial-indigo transition-colors">
                        <MessageCircle className="w-3.5 h-3.5" /> {post.replies}
                      </button>
                      <button className="flex items-center gap-1 text-xs text-silver-mist hover:text-celestial-indigo transition-colors">
                        <Share2 className="w-3.5 h-3.5" /> Share
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Leaderboard */}
          <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
            <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-sunset-amber" /> Top Contributors
            </h3>
            <div className="space-y-2.5">
              {leaderboard.map((user, i) => (
                <div key={user.name} className={`flex items-center gap-3 p-2 rounded-lg ${user.name === 'You' ? 'bg-celestial-indigo/5 border border-celestial-indigo/20' : ''}`}>
                  <span className="text-xs font-bold text-silver-mist w-5">#{i + 1}</span>
                  <div className="flex-1">
                    <p className={`text-xs font-medium ${user.name === 'You' ? 'text-celestial-indigo' : 'text-ink-black dark:text-pearl'}`}>{user.name}</p>
                    <p className="text-[10px] text-silver-mist">{user.points} pts • {user.badges} badges</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Study Groups */}
          <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
            <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-celestial-indigo" /> Study Groups
            </h3>
            <div className="space-y-2">
              <div className="p-2.5 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
                <p className="text-xs font-medium text-ink-black dark:text-pearl">AWS Cert Prep</p>
                <p className="text-[10px] text-silver-mist">8 members • Next: Thu 3pm</p>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
                <p className="text-xs font-medium text-ink-black dark:text-pearl">System Design Weekly</p>
                <p className="text-[10px] text-silver-mist">12 members • Next: Mon 11am</p>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
                <p className="text-xs font-medium text-ink-black dark:text-pearl">ML Paper Reading</p>
                <p className="text-[10px] text-silver-mist">6 members • Next: Fri 2pm</p>
              </div>
            </div>
            <button className="w-full mt-3 text-xs text-celestial-indigo font-medium hover:underline text-center">Browse All Groups →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
