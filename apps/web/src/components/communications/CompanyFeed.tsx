/**
 * @module CompanyFeed
 * @description Internal company social feed — channel sidebar, posts, reactions,
 *              inline comments, polls, create post form (Sec 13.3)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Plus,
  Send,
  ChevronDown,
  ChevronUp,
  Hash,
  Pin,
  BarChart2,
  Image,
  X,
} from 'lucide-react';
import {
  CommunicationsService,
  type Channel,
  type Post,
  type ReactionType,
} from '@/services/communicationsService';

// ── Avatar ─────────────────────────────────────────────────────────────────────

function Avatar({ initials, size = 'sm' }: { initials: string; size?: 'sm' | 'md' }) {
  const sizeClasses = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm' };
  const colors = [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-violet-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-cyan-500',
  ];
  const colorIdx = initials.charCodeAt(0) % colors.length;
  return (
    <div
      className={`${sizeClasses[size]} ${colors[colorIdx]} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}
    >
      {initials}
    </div>
  );
}

// ── Reaction Bar ───────────────────────────────────────────────────────────────

const REACTION_EMOJIS: ReactionType[] = ['👍', '❤️', '🎉', '😂', '💡'];

function ReactionBar({
  reactions,
  onReact,
}: {
  reactions: Post['reactions'];
  onReact: (emoji: ReactionType) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {reactions.map((r) => (
        <button
          key={r.emoji}
          onClick={() => onReact(r.emoji as ReactionType)}
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-all ${
            r.hasReacted
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>{r.emoji}</span>
          <span className="font-medium">{r.count}</span>
        </button>
      ))}
      <div className="relative">
        <button
          onClick={() => setShowPicker((v) => !v)}
          className="w-7 h-7 rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50 flex items-center justify-center text-base transition-colors"
        >
          +
        </button>
        {showPicker && (
          <div className="absolute bottom-8 left-0 bg-white border border-slate-200 rounded-xl shadow-lg p-2 flex gap-1 z-10">
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onReact(emoji);
                  setShowPicker(false);
                }}
                className="text-xl hover:scale-125 transition-transform p-1"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Post Card ─────────────────────────────────────────────────────────────────

function PostCard({
  post,
  onReact,
  onComment,
}: {
  post: Post;
  onReact: (postId: string, emoji: ReactionType) => void;
  onComment: (postId: string, body: string) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pollVoted, setPollVoted] = useState<string | null>(null);

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    await onComment(post.id, commentText.trim());
    setCommentText('');
    setSubmitting(false);
  };

  const totalPollVotes = post.pollOptions?.reduce((s, o) => s + o.votes, 0) ?? 0;

  return (
    <div
      className={`bg-white border rounded-xl p-4 ${post.pinned ? 'border-blue-300 ring-1 ring-blue-200' : 'border-slate-200'}`}
    >
      {post.pinned && (
        <div className="flex items-center gap-1 text-xs text-blue-600 mb-2">
          <Pin className="w-3 h-3" />
          Pinned
        </div>
      )}
      <div className="flex items-start gap-3">
        <Avatar initials={post.authorAvatar} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-semibold text-sm text-slate-800">{post.authorName}</span>
            <span className="text-xs text-slate-400">{post.authorRole}</span>
            <span className="text-xs text-slate-300">·</span>
            <span className="text-xs text-slate-400">
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          <div className="mt-1.5 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {post.body}
          </div>

          {post.imageEmoji && (
            <div className="mt-2 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl h-28 flex items-center justify-center text-5xl">
              {post.imageEmoji}
            </div>
          )}

          {/* Poll */}
          {post.pollOptions && (
            <div className="mt-3 space-y-2">
              {post.pollOptions.map((opt) => {
                const pct = totalPollVotes > 0 ? (opt.votes / totalPollVotes) * 100 : 0;
                const isVoted = pollVoted === opt.option;
                return (
                  <button
                    key={opt.option}
                    onClick={() => !pollVoted && setPollVoted(opt.option)}
                    disabled={!!pollVoted}
                    className={`w-full text-left rounded-lg border transition-all overflow-hidden ${
                      isVoted ? 'border-blue-500' : 'border-slate-200 hover:border-slate-300'
                    } ${pollVoted ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="relative px-3 py-2">
                      {pollVoted && (
                        <div
                          className={`absolute inset-0 rounded-lg ${isVoted ? 'bg-blue-50' : 'bg-slate-50'}`}
                          style={{ width: `${pct}%` }}
                        />
                      )}
                      <div className="relative flex items-center justify-between">
                        <span className="text-sm text-slate-700">{opt.option}</span>
                        {pollVoted && (
                          <span className="text-xs font-medium text-slate-500">
                            {pct.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
              <p className="text-xs text-slate-400">{totalPollVotes} votes</p>
            </div>
          )}

          {/* Reaction bar */}
          <div className="mt-3">
            <ReactionBar reactions={post.reactions} onReact={(emoji) => onReact(post.id, emoji)} />
          </div>

          {/* Comments toggle */}
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => setShowComments((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
              {showComments ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          </div>

          {/* Comment thread */}
          {showComments && (
            <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2">
                  <Avatar initials={comment.authorAvatar} size="sm" />
                  <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold text-slate-700">
                        {comment.authorName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(comment.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{comment.body}</p>
                  </div>
                </div>
              ))}

              {/* Add comment */}
              <div className="flex items-start gap-2">
                <Avatar initials="CU" size="sm" />
                <div className="flex-1 flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleComment();
                      }
                    }}
                    placeholder="Write a comment..."
                    className="flex-1 bg-transparent text-xs text-slate-700 focus:outline-none"
                  />
                  <button
                    onClick={handleComment}
                    disabled={!commentText.trim() || submitting}
                    className="text-blue-600 hover:text-blue-700 disabled:opacity-40 transition-colors"
                  >
                    {submitting ? (
                      <div className="animate-spin w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Create Post Form ───────────────────────────────────────────────────────────

function CreatePostForm({
  channelId,
  onPost,
}: {
  channelId: string;
  onPost: (post: Post) => void;
}) {
  const [body, setBody] = useState('');
  const [imageEmoji, setImageEmoji] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pollMode, setPollMode] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [submitting, setSubmitting] = useState(false);

  const MEDIA_EMOJIS = ['📊', '🚀', '💡', '🎉', '📅', '🏆', '🎓', '💻', '🌟', '📈', '🤝', '🔥'];

  const addPollOption = () => setPollOptions((prev) => [...prev, '']);
  const updatePollOption = (idx: number, val: string) => {
    const opts = [...pollOptions];
    opts[idx] = val;
    setPollOptions(opts);
  };
  const removePollOption = (idx: number) =>
    setPollOptions((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!body.trim()) return;
    setSubmitting(true);
    const post = await CommunicationsService.createPost(channelId, {
      body: body.trim(),
      imageEmoji: imageEmoji || undefined,
      pollOptions: pollMode ? pollOptions.filter(Boolean) : undefined,
    });
    setBody('');
    setImageEmoji('');
    setPollMode(false);
    setPollOptions(['', '']);
    setSubmitting(false);
    onPost(post);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <Avatar initials="CU" size="md" />
        <div className="flex-1">
          <textarea
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share something with the team..."
            className="w-full text-sm text-slate-700 bg-transparent focus:outline-none resize-none"
          />

          {imageEmoji && (
            <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl h-20 flex items-center justify-center text-4xl mt-2 group">
              {imageEmoji}
              <button
                onClick={() => setImageEmoji('')}
                className="absolute top-2 right-2 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Poll options */}
          {pollMode && (
            <div className="space-y-2 mt-2 p-3 bg-slate-50 rounded-xl">
              <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <BarChart2 className="w-3.5 h-3.5" />
                Poll Options
              </p>
              {pollOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    value={opt}
                    onChange={(e) => updatePollOption(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}...`}
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                  {idx > 1 && (
                    <button
                      onClick={() => removePollOption(idx)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {pollOptions.length < 5 && (
                <button
                  onClick={addPollOption}
                  className="text-xs text-blue-600 flex items-center gap-1 hover:text-blue-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add option
                </button>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              {/* Image/emoji */}
              <div className="relative">
                <button
                  onClick={() => setShowEmojiPicker((v) => !v)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Add image"
                >
                  <Image className="w-4 h-4" />
                </button>
                {showEmojiPicker && (
                  <div className="absolute top-8 left-0 z-10 bg-white border border-slate-200 rounded-xl shadow-lg p-3 grid grid-cols-6 gap-1">
                    {MEDIA_EMOJIS.map((e) => (
                      <button
                        key={e}
                        onClick={() => {
                          setImageEmoji(e);
                          setShowEmojiPicker(false);
                        }}
                        className="text-xl p-1 hover:bg-slate-100 rounded-lg"
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Poll */}
              <button
                onClick={() => setPollMode((v) => !v)}
                className={`p-1.5 rounded-lg transition-colors ${pollMode ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                title="Add poll"
              >
                <BarChart2 className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!body.trim() || submitting}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? (
                <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface CompanyFeedProps {
  defaultChannelId?: string;
}

export default function CompanyFeed({ defaultChannelId = 'ch-001' }: CompanyFeedProps) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState(defaultChannelId);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);

  const activeChannel = channels.find((c) => c.id === activeChannelId);

  useEffect(() => {
    CommunicationsService.getChannels().then((data) => {
      setChannels(data);
      setLoadingChannels(false);
    });
  }, []);

  useEffect(() => {
    setLoadingPosts(true);
    CommunicationsService.getChannelPosts(activeChannelId).then((data) => {
      setPosts(data);
      setLoadingPosts(false);
    });
  }, [activeChannelId]);

  const handleReact = async (postId: string, emoji: ReactionType) => {
    const updated = await CommunicationsService.reactToPost(postId, emoji);
    setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
  };

  const handleComment = async (postId: string, body: string) => {
    const updated = await CommunicationsService.commentOnPost(postId, body);
    setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
  };

  const handleNewPost = (post: Post) => {
    setPosts((prev) => [post, ...prev]);
  };

  return (
    <div className="flex h-full">
      {/* Channel sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform md:relative md:translate-x-0 md:z-auto md:block
        ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">Channels</h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="md:hidden text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {loadingChannels ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => {
                    setActiveChannelId(channel.id);
                    setShowSidebar(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                    activeChannelId === channel.id
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base">{channel.emoji}</span>
                  <span className="flex-1 text-left truncate">{channel.name}</span>
                  {channel.unreadCount > 0 && (
                    <span className="text-xs bg-blue-600 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                      {channel.unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile backdrop */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Main feed */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-4">
          {/* Channel header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSidebar(true)}
                className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Hash className="w-4 h-4" />
              </button>
              {activeChannel && (
                <>
                  <span className="text-xl">{activeChannel.emoji}</span>
                  <div>
                    <h1 className="font-bold text-slate-900">{activeChannel.name}</h1>
                    <p className="text-xs text-slate-400">
                      {activeChannel.description} · {activeChannel.memberCount} members
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Create post */}
          <CreatePostForm channelId={activeChannelId} onPost={handleNewPost} />

          {/* Posts */}
          {loadingPosts ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse"
                >
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-1/3" />
                      <div className="h-3 bg-slate-100 rounded w-full" />
                      <div className="h-3 bg-slate-100 rounded w-3/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No posts yet. Be the first to post!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onReact={handleReact}
                  onComment={handleComment}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
