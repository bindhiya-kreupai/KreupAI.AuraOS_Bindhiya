'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Award, Heart, MessageCircle, Share2, Loader2, X, Send } from 'lucide-react';
import { SocialFeedService } from '../services';

const CORE_VALUES = ['Teamwork', 'Innovation', 'Integrity', 'Excellence', 'Customer Focus'];

export default function RecognitionWallPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ receiverId: '', message: '', coreValue: 'Teamwork' });
  const [submitting, setSubmitting] = useState(false);
  const [likeBusy, setLikeBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await SocialFeedService.getPosts();
      setPosts(data.filter((p: any) => p.type === 'recognition'));
    } catch {
      setToast({ type: 'error', msg: 'Failed to load recognitions.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleGiveKudos = async () => {
    if (!form.receiverId.trim() || !form.message.trim()) {
      showToast('error', 'Recipient and message are required.');
      return;
    }
    try {
      setSubmitting(true);
      await SocialFeedService.createPost({
        type: 'recognition',
        receiverId: form.receiverId.trim(),
        content: form.message.trim(),
        coreValue: form.coreValue,
      } as any);
      showToast('success', 'Kudos given!');
      setForm({ receiverId: '', message: '', coreValue: 'Teamwork' });
      setShowModal(false);
      await fetchData();
    } catch {
      showToast('error', 'Failed to give kudos.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      setLikeBusy(postId);
      await SocialFeedService.likePost(postId);
      await fetchData();
    } catch {
      showToast('error', 'Failed to like.');
    } finally {
      setLikeBusy(null);
    }
  };

  const likeCount = (post: any): number => {
    if (Array.isArray(post.likes)) return post.likes.length;
    const reactions = post.reactions as { likes?: unknown[] } | undefined;
    return Array.isArray(reactions?.likes) ? reactions!.likes!.length : post.points || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {toast && (
        <div
          className={`absolute top-2 right-2 z-[60] px-4 py-2 rounded-lg text-sm font-bold text-white shadow-lg ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.msg}
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-500" />
            Recognition Wall
          </h1>
          <p className="text-slate-500 text-sm">Celebrate wins and appreciate your colleagues.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2"
        >
          <Award className="w-4 h-4" /> Give Kudos
        </button>
      </div>

      <div className="max-w-2xl mx-auto space-y-4 w-full">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Award className="w-12 h-12 mb-4 opacity-50" />
            <p className="font-medium">No recognitions yet.</p>
            <p className="text-sm">Be the first to recognize a colleague!</p>
          </div>
        ) : (
          posts.map((post: any, i: number) => (
            <div
              key={post.id || i}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-500">
                  {(post.authorName || 'U').charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold flex items-center gap-1">
                    {post.authorName || 'Team Member'}{' '}
                    <span className="text-slate-400 font-normal">recognized</span>{' '}
                    {post.receiverId || 'a colleague'}
                  </div>
                  <div className="text-xs text-slate-500">{post.createdDate || ''}</div>
                </div>
              </div>

              <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                {post.content || post.message || ''}
              </p>

              {post.coreValue && (
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded">
                    #{post.coreValue}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleLike(post.id)}
                  disabled={likeBusy === post.id}
                  className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-rose-500 transition-colors group disabled:opacity-60"
                >
                  <Heart className="w-5 h-5 group-hover:fill-current" /> {likeCount(post)}
                </button>
                <button className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-500 transition-colors">
                  <MessageCircle className="w-5 h-5" /> {(post.comments || []).length} Comments
                </button>
                <button
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && navigator.clipboard) {
                      navigator.clipboard.writeText(post.content || '');
                      showToast('success', 'Copied to clipboard.');
                    }
                  }}
                  className="text-slate-400 hover:text-indigo-500"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-1">Give Kudos</h2>
            <p className="text-sm text-slate-500 mb-6">
              Recognize a colleague for their great work.
            </p>

            <label className="text-xs font-bold text-slate-500 mb-1 block">
              Recipient (Employee ID)
            </label>
            <input
              type="text"
              value={form.receiverId}
              onChange={(e) => setForm({ ...form, receiverId: e.target.value })}
              placeholder="e.g. emp-123"
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 mb-4"
            />

            <label className="text-xs font-bold text-slate-500 mb-1 block">Core Value</label>
            <select
              value={form.coreValue}
              onChange={(e) => setForm({ ...form, coreValue: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none mb-4"
            >
              {CORE_VALUES.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>

            <label className="text-xs font-bold text-slate-500 mb-1 block">Message</label>
            <textarea
              rows={3}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Say thanks..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 mb-4"
            />

            <button
              onClick={handleGiveKudos}
              disabled={submitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Give Kudos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
