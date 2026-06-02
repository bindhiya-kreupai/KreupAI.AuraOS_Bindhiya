"use client";

import React, { useState, useEffect } from 'react';
import { MessageCircle, Users, ThumbsUp, Share2, BookOpen, Award, Loader2 } from 'lucide-react';
import { KnowledgeBaseService } from '../services';

export default function LearningCommunityPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await KnowledgeBaseService.getKnowledgeArticles();
        setArticles(result);
      } catch (error: any) {
        console.error('Error:', error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const topics = ['All', ...Array.from(new Set(articles.map((a) => a.categoryName).filter(Boolean)))];
  const filteredArticles = selectedTopic === 'All' ? articles : articles.filter((a) => a.categoryName === selectedTopic);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Learning Community</h1>
          <p className="text-sm text-silver-mist mt-1">Share knowledge, ask questions, and learn together</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors">
          <MessageCircle className="w-4 h-4" /> New Post
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Articles</p>
          <p className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">{articles.length}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Categories</p>
          <p className="text-2xl font-bold text-celestial-indigo mt-1">{topics.length - 1}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Total Views</p>
          <p className="text-2xl font-bold text-sunset-amber mt-1">{articles.reduce((s, a) => s + (a.viewCount || 0), 0)}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Total Likes</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{articles.reduce((s, a) => s + (a.likeCount || 0), 0)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 space-y-4">
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

          {filteredArticles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <MessageCircle className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">No articles in this category</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredArticles.map((article) => (
                <div key={article.id} className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-celestial-indigo/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-celestial-indigo">{(article.authorName || 'A').substring(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-ink-black dark:text-pearl">{article.authorName || 'Anonymous'}</span>
                      </div>
                      <p className="text-sm text-ink-black dark:text-pearl mt-1.5 font-bold">{article.title}</p>
                      <p className="text-xs text-silver-mist mt-1 line-clamp-2">{article.content}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-[10px] px-2 py-0.5 bg-celestial-indigo/10 text-celestial-indigo rounded-full font-medium">{article.categoryName}</span>
                        <button className="flex items-center gap-1 text-xs text-silver-mist hover:text-celestial-indigo transition-colors">
                          <ThumbsUp className="w-3.5 h-3.5" /> {article.likeCount || 0}
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
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
            <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-sunset-amber" /> Top Authors
            </h3>
            <div className="space-y-2.5">
              {Array.from(new Map(articles.filter(a => a.authorName).map(a => [a.authorName, a])).values())
                .slice(0, 5)
                .map((article: any, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg">
                    <span className="text-xs font-bold text-silver-mist w-5">#{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-ink-black dark:text-pearl">{article.authorName}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

