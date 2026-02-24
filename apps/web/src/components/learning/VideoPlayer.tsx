/**
 * @module VideoPlayer
 * @description Custom learning video player with progress tracking,
 *              bookmarks/notes at timestamps, resume from last position,
 *              and playback speed control (HTML5 video API)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Bookmark,
  BookmarkCheck,
  MessageSquare,
  Clock,
  Trash2,
  Plus,
  Send,
  RotateCcw,
  Gauge,
  X,
  FileText,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────────

export interface VideoBookmark {
  id: string;
  timestamp: number;
  label: string;
  note?: string;
  color: string;
  createdAt: string;
}

export interface VideoNote {
  id: string;
  timestamp: number;
  content: string;
  createdAt: string;
}

export interface VideoProgressState {
  lastPosition: number;
  percentComplete: number;
  totalWatched: number;
  completedAt?: string;
  playbackSpeed: number;
}

export interface VideoData {
  id: string;
  title: string;
  description: string;
  duration: number;
  courseTitle?: string;
  instructor?: string;
}

export interface VideoPlayerProps {
  video: VideoData;
  bookmarks?: VideoBookmark[];
  notes?: VideoNote[];
  progress?: VideoProgressState;
  onProgressUpdate?: (progress: VideoProgressState) => void;
  onBookmarkAdd?: (bookmark: VideoBookmark) => void;
  onBookmarkRemove?: (id: string) => void;
  onNoteAdd?: (note: VideoNote) => void;
  onNoteRemove?: (id: string) => void;
}

// ── Config ───────────────────────────────────────────────────────────────────────

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const BOOKMARK_COLORS = [
  { value: '#6366f1', label: 'Indigo' },
  { value: '#00D4AA', label: 'Mint' },
  { value: '#FFB547', label: 'Amber' },
  { value: '#E91E8C', label: 'Rose' },
  { value: '#FF5744', label: 'Coral' },
];

const SKIP_SECONDS = 10;

// ── Mock Data ────────────────────────────────────────────────────────────────────

export const MOCK_VIDEO: VideoData = {
  id: 'vid-1',
  title: 'System Design Fundamentals: Distributed Caching',
  description:
    'Learn the principles of distributed caching systems including Redis, Memcached, and CDN caching strategies. This module covers cache invalidation patterns, consistency models, and real-world architecture examples.',
  duration: 2580,
  courseTitle: 'System Design for Engineers',
  instructor: 'Alex Xu',
};

export const MOCK_BOOKMARKS: VideoBookmark[] = [
  {
    id: 'bm-1',
    timestamp: 120,
    label: 'Cache invalidation patterns',
    color: '#6366f1',
    createdAt: '2026-02-20T10:00:00',
  },
  {
    id: 'bm-2',
    timestamp: 540,
    label: 'Redis vs Memcached comparison',
    note: 'Good comparison table — review before exam',
    color: '#00D4AA',
    createdAt: '2026-02-20T10:15:00',
  },
  {
    id: 'bm-3',
    timestamp: 1200,
    label: 'Write-through vs Write-behind',
    color: '#FFB547',
    createdAt: '2026-02-20T10:30:00',
  },
  {
    id: 'bm-4',
    timestamp: 1980,
    label: 'CDN architecture at scale',
    note: 'Netflix case study — great example for the capstone',
    color: '#E91E8C',
    createdAt: '2026-02-20T10:45:00',
  },
];

export const MOCK_NOTES: VideoNote[] = [
  {
    id: 'nt-1',
    timestamp: 180,
    content:
      'Three cache invalidation strategies: TTL-based, event-driven, and version-based. TTL is simplest but can serve stale data.',
    createdAt: '2026-02-20T10:05:00',
  },
  {
    id: 'nt-2',
    timestamp: 780,
    content:
      "Redis supports data structures (lists, sets, sorted sets) which makes it more versatile for complex caching patterns vs Memcached's simple key-value.",
    createdAt: '2026-02-20T10:20:00',
  },
  {
    id: 'nt-3',
    timestamp: 1500,
    content:
      'Write-behind (write-back) is risky but offers better performance. Use it when eventual consistency is acceptable and you have a reliable queue.',
    createdAt: '2026-02-20T10:35:00',
  },
];

export const MOCK_PROGRESS: VideoProgressState = {
  lastPosition: 825,
  percentComplete: 32,
  totalWatched: 825,
  playbackSpeed: 1,
};

// ── Helpers ──────────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatTimeShort(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ── Component ────────────────────────────────────────────────────────────────────

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  bookmarks: initialBookmarks = MOCK_BOOKMARKS,
  notes: initialNotes = MOCK_NOTES,
  progress: initialProgress = MOCK_PROGRESS,
  onProgressUpdate,
  onBookmarkAdd,
  onBookmarkRemove,
  onNoteAdd,
  onNoteRemove,
}) => {
  // Player state (simulated — no real video element for demo)
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialProgress.lastPosition);
  const [isMuted, setIsMuted] = useState(false);
  const [_volume, _setVolume] = useState(80);
  const [playbackSpeed, setPlaybackSpeed] = useState(initialProgress.playbackSpeed);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Progress state
  const [highWaterMark, setHighWaterMark] = useState(initialProgress.totalWatched);
  const [percentComplete, setPercentComplete] = useState(initialProgress.percentComplete);

  // Bookmarks & Notes
  const [bookmarks, setBookmarks] = useState<VideoBookmark[]>(initialBookmarks);
  const [notes, setNotes] = useState<VideoNote[]>(initialNotes);
  const [showBookmarkForm, setShowBookmarkForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [newBookmarkLabel, setNewBookmarkLabel] = useState('');
  const [newBookmarkNote, setNewBookmarkNote] = useState('');
  const [newBookmarkColor, setNewBookmarkColor] = useState(BOOKMARK_COLORS[0].value);
  const [newNoteContent, setNewNoteContent] = useState('');

  // UI state
  const [activePanel, setActivePanel] = useState<'bookmarks' | 'notes' | null>('bookmarks');
  const [showResumeToast, setShowResumeToast] = useState(initialProgress.lastPosition > 10);

  // Simulated playback via interval
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + playbackSpeed;
          if (next >= video.duration) {
            setIsPlaying(false);
            setPercentComplete(100);
            return video.duration;
          }
          // Update high water mark
          if (next > highWaterMark) {
            setHighWaterMark(next);
            const pct = Math.round((next / video.duration) * 100);
            setPercentComplete(pct);
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, playbackSpeed, video.duration, highWaterMark]);

  // Progress callback
  useEffect(() => {
    onProgressUpdate?.({
      lastPosition: currentTime,
      percentComplete,
      totalWatched: highWaterMark,
      playbackSpeed,
      completedAt: percentComplete >= 100 ? new Date().toISOString() : undefined,
    });
  }, [currentTime, percentComplete, highWaterMark, playbackSpeed, onProgressUpdate]);

  const togglePlay = useCallback(() => setIsPlaying((p) => !p), []);

  const seek = useCallback(
    (time: number) => {
      const clamped = Math.max(0, Math.min(time, video.duration));
      setCurrentTime(clamped);
    },
    [video.duration]
  );

  const skipForward = useCallback(() => seek(currentTime + SKIP_SECONDS), [currentTime, seek]);
  const skipBackward = useCallback(() => seek(currentTime - SKIP_SECONDS), [currentTime, seek]);

  const handleSeekBar = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      seek(ratio * video.duration);
    },
    [video.duration, seek]
  );

  const resumeFromLast = useCallback(() => {
    seek(initialProgress.lastPosition);
    setShowResumeToast(false);
  }, [initialProgress.lastPosition, seek]);

  const startFromBeginning = useCallback(() => {
    seek(0);
    setShowResumeToast(false);
  }, [seek]);

  // Bookmarks
  const addBookmark = useCallback(() => {
    if (!newBookmarkLabel.trim()) return;
    const bm: VideoBookmark = {
      id: `bm-${Date.now()}`,
      timestamp: currentTime,
      label: newBookmarkLabel.trim(),
      note: newBookmarkNote.trim() || undefined,
      color: newBookmarkColor,
      createdAt: new Date().toISOString(),
    };
    setBookmarks((prev) => [...prev, bm].sort((a, b) => a.timestamp - b.timestamp));
    onBookmarkAdd?.(bm);
    setNewBookmarkLabel('');
    setNewBookmarkNote('');
    setShowBookmarkForm(false);
  }, [currentTime, newBookmarkLabel, newBookmarkNote, newBookmarkColor, onBookmarkAdd]);

  const removeBookmark = useCallback(
    (id: string) => {
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
      onBookmarkRemove?.(id);
    },
    [onBookmarkRemove]
  );

  // Notes
  const addNote = useCallback(() => {
    if (!newNoteContent.trim()) return;
    const nt: VideoNote = {
      id: `nt-${Date.now()}`,
      timestamp: currentTime,
      content: newNoteContent.trim(),
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [...prev, nt].sort((a, b) => a.timestamp - b.timestamp));
    onNoteAdd?.(nt);
    setNewNoteContent('');
    setShowNoteForm(false);
  }, [currentTime, newNoteContent, onNoteAdd]);

  const removeNote = useCallback(
    (id: string) => {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      onNoteRemove?.(id);
    },
    [onNoteRemove]
  );

  const progressPct = video.duration > 0 ? (currentTime / video.duration) * 100 : 0;
  const watchedPct = video.duration > 0 ? (highWaterMark / video.duration) * 100 : 0;

  return (
    <div className="space-y-3">
      {/* Video Area */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-black overflow-hidden relative">
        {/* Simulated video display */}
        <div className="aspect-video bg-gradient-to-br from-deep-cosmos to-stellar-blue flex items-center justify-center relative">
          {/* Course info overlay */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
              <button onClick={togglePlay}>
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-white" />
                ) : (
                  <Play className="w-8 h-8 text-white ml-1" />
                )}
              </button>
            </div>
            <p className="text-[12px] font-bold text-white">{video.title}</p>
            {video.instructor && (
              <p className="text-[9px] text-white/60 mt-1">by {video.instructor}</p>
            )}
            {!isPlaying && (
              <p className="text-[8px] text-white/40 mt-2">
                {formatTime(currentTime)} / {formatTime(video.duration)}
              </p>
            )}
          </div>

          {/* Resume Toast */}
          {showResumeToast && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/80 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/10">
              <RotateCcw className="w-4 h-4 text-celestial-indigo" />
              <div>
                <p className="text-[9px] font-bold text-white">
                  Resume from {formatTime(initialProgress.lastPosition)}?
                </p>
                <p className="text-[7px] text-white/50">
                  You were {initialProgress.percentComplete}% through
                </p>
              </div>
              <button
                onClick={resumeFromLast}
                className="px-2.5 py-1 rounded-lg text-[8px] font-bold bg-celestial-indigo text-white hover:opacity-90 transition-opacity"
              >
                Resume
              </button>
              <button
                onClick={startFromBeginning}
                className="px-2.5 py-1 rounded-lg text-[8px] font-bold border border-white/20 text-white/70 hover:text-white transition-colors"
              >
                Start Over
              </button>
              <button
                onClick={() => setShowResumeToast(false)}
                className="text-white/40 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Bookmark markers on timeline area (top edge) */}
          <div className="absolute bottom-0 left-0 right-0">
            {/* Progress + Seek Bar */}
            <div className="relative h-6 cursor-pointer group" onClick={handleSeekBar}>
              {/* Watched range (lighter) */}
              <div className="absolute bottom-0 left-0 right-0 h-1 group-hover:h-2 transition-all bg-white/10">
                <div
                  className="absolute h-full bg-white/20 rounded-r"
                  style={{ width: `${watchedPct}%` }}
                />
                <div
                  className="absolute h-full bg-celestial-indigo rounded-r"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {/* Bookmark markers */}
              {bookmarks.map((bm) => {
                const pos = (bm.timestamp / video.duration) * 100;
                return (
                  <div
                    key={bm.id}
                    className="absolute bottom-0 w-1.5 h-3 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
                    style={{ left: `${pos}%`, backgroundColor: bm.color }}
                    title={`${formatTimeShort(bm.timestamp)} — ${bm.label}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      seek(bm.timestamp);
                    }}
                  />
                );
              })}

              {/* Playhead */}
              <div
                className="absolute bottom-[-2px] w-3 h-3 rounded-full bg-celestial-indigo border-2 border-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `calc(${progressPct}% - 6px)` }}
              />
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex items-center gap-2 px-3 py-2 bg-black/90">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="text-white hover:text-celestial-indigo transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Skip */}
          <button
            onClick={skipBackward}
            className="text-white/60 hover:text-white transition-colors"
            title={`-${SKIP_SECONDS}s`}
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={skipForward}
            className="text-white/60 hover:text-white transition-colors"
            title={`+${SKIP_SECONDS}s`}
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {/* Time */}
          <span className="text-[9px] text-white/70 font-mono">
            {formatTime(currentTime)} / {formatTime(video.duration)}
          </span>

          <div className="flex-1" />

          {/* Speed Control */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu((p) => !p)}
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold text-white/70 hover:text-white transition-colors"
            >
              <Gauge className="w-3 h-3" />
              {playbackSpeed}x
            </button>
            {showSpeedMenu && (
              <div className="absolute bottom-full right-0 mb-1 bg-black/95 border border-white/10 rounded-lg py-1 min-w-[80px] z-10">
                {PLAYBACK_SPEEDS.map((speed) => (
                  <button
                    key={speed}
                    onClick={() => {
                      setPlaybackSpeed(speed);
                      setShowSpeedMenu(false);
                    }}
                    className={`w-full px-3 py-1 text-left text-[8px] font-bold transition-colors ${
                      playbackSpeed === speed
                        ? 'text-celestial-indigo bg-celestial-indigo/10'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {speed}x {speed === 1 && '(Normal)'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Volume */}
          <button
            onClick={() => setIsMuted((p) => !p)}
            className="text-white/60 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Bookmark button */}
          <button
            onClick={() => {
              setShowBookmarkForm((p) => !p);
              setShowNoteForm(false);
            }}
            className={`transition-colors ${showBookmarkForm ? 'text-celestial-indigo' : 'text-white/60 hover:text-white'}`}
            title="Add Bookmark"
          >
            <Bookmark className="w-3.5 h-3.5" />
          </button>

          {/* Note button */}
          <button
            onClick={() => {
              setShowNoteForm((p) => !p);
              setShowBookmarkForm(false);
            }}
            className={`transition-colors ${showNoteForm ? 'text-celestial-indigo' : 'text-white/60 hover:text-white'}`}
            title="Add Note"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={() => setIsFullscreen((p) => !p)}
            className="text-white/60 hover:text-white transition-colors"
          >
            {isFullscreen ? (
              <Minimize className="w-3.5 h-3.5" />
            ) : (
              <Maximize className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Inline Add Forms */}
      {showBookmarkForm && (
        <div className="rounded-xl border border-celestial-indigo/20 bg-celestial-indigo/5 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-bold text-ink-black dark:text-pearl flex items-center gap-1">
              <BookmarkCheck className="w-3 h-3 text-celestial-indigo" />
              Add Bookmark at {formatTime(currentTime)}
            </p>
            <button onClick={() => setShowBookmarkForm(false)}>
              <X className="w-3 h-3 text-silver-mist" />
            </button>
          </div>
          <input
            type="text"
            value={newBookmarkLabel}
            onChange={(e) => setNewBookmarkLabel(e.target.value)}
            placeholder="Bookmark label..."
            className="w-full px-2.5 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue text-[9px] text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
          />
          <input
            type="text"
            value={newBookmarkNote}
            onChange={(e) => setNewBookmarkNote(e.target.value)}
            placeholder="Optional note..."
            className="w-full px-2.5 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue text-[9px] text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
          />
          <div className="flex items-center gap-2">
            <span className="text-[7px] text-silver-mist">Color:</span>
            {BOOKMARK_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setNewBookmarkColor(c.value)}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  newBookmarkColor === c.value
                    ? 'border-ink-black dark:border-pearl scale-110'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: c.value }}
                title={c.label}
              />
            ))}
            <div className="flex-1" />
            <button
              onClick={addBookmark}
              disabled={!newBookmarkLabel.trim()}
              className="flex items-center gap-1 px-3 py-1 rounded-lg text-[8px] font-bold bg-celestial-indigo text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
        </div>
      )}

      {showNoteForm && (
        <div className="rounded-xl border border-nebula-purple/20 bg-nebula-purple/5 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-bold text-ink-black dark:text-pearl flex items-center gap-1">
              <FileText className="w-3 h-3 text-nebula-purple" />
              Add Note at {formatTime(currentTime)}
            </p>
            <button onClick={() => setShowNoteForm(false)}>
              <X className="w-3 h-3 text-silver-mist" />
            </button>
          </div>
          <textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Write your note..."
            rows={3}
            className="w-full px-2.5 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue text-[9px] text-ink-black dark:text-pearl outline-none focus:border-nebula-purple resize-none transition-colors"
          />
          <div className="flex justify-end">
            <button
              onClick={addNote}
              disabled={!newNoteContent.trim()}
              className="flex items-center gap-1 px-3 py-1 rounded-lg text-[8px] font-bold bg-nebula-purple text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              <Send className="w-3 h-3" /> Save Note
            </button>
          </div>
        </div>
      )}

      {/* Progress Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-2.5 text-center">
          <Clock className="w-3.5 h-3.5 mx-auto mb-1 text-celestial-indigo" />
          <p className="text-[12px] font-black text-ink-black dark:text-pearl">
            {percentComplete}%
          </p>
          <p className="text-[7px] text-silver-mist font-bold">Watched</p>
        </div>
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-2.5 text-center">
          <Gauge className="w-3.5 h-3.5 mx-auto mb-1 text-sunset-amber" />
          <p className="text-[12px] font-black text-ink-black dark:text-pearl">{playbackSpeed}x</p>
          <p className="text-[7px] text-silver-mist font-bold">Speed</p>
        </div>
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-2.5 text-center">
          <Bookmark className="w-3.5 h-3.5 mx-auto mb-1 text-quantum-rose" />
          <p className="text-[12px] font-black text-ink-black dark:text-pearl">
            {bookmarks.length}
          </p>
          <p className="text-[7px] text-silver-mist font-bold">Bookmarks</p>
        </div>
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-2.5 text-center">
          <FileText className="w-3.5 h-3.5 mx-auto mb-1 text-nebula-purple" />
          <p className="text-[12px] font-black text-ink-black dark:text-pearl">{notes.length}</p>
          <p className="text-[7px] text-silver-mist font-bold">Notes</p>
        </div>
      </div>

      {/* Panel Tabs */}
      <div className="flex rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden">
        <button
          onClick={() => setActivePanel(activePanel === 'bookmarks' ? null : 'bookmarks')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[9px] font-bold transition-colors ${
            activePanel === 'bookmarks'
              ? 'text-celestial-indigo bg-celestial-indigo/5 border-b-2 border-celestial-indigo'
              : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
          }`}
        >
          <Bookmark className="w-3 h-3" /> Bookmarks ({bookmarks.length})
        </button>
        <button
          onClick={() => setActivePanel(activePanel === 'notes' ? null : 'notes')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[9px] font-bold transition-colors ${
            activePanel === 'notes'
              ? 'text-nebula-purple bg-nebula-purple/5 border-b-2 border-nebula-purple'
              : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
          }`}
        >
          <MessageSquare className="w-3 h-3" /> Notes ({notes.length})
        </button>
      </div>

      {/* Bookmarks Panel */}
      {activePanel === 'bookmarks' && (
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden">
          {bookmarks.length === 0 ? (
            <div className="p-6 text-center">
              <Bookmark className="w-6 h-6 mx-auto text-silver-mist/30 mb-1" />
              <p className="text-[9px] text-silver-mist">
                No bookmarks yet. Click the bookmark icon to add one.
              </p>
            </div>
          ) : (
            bookmarks.map((bm) => (
              <div
                key={bm.id}
                className="flex items-start gap-2.5 px-3 py-2.5 border-b border-cloud/50 dark:border-nebula-purple/10 last:border-b-0 hover:bg-cloud/20 dark:hover:bg-nebula-purple/5 transition-colors"
              >
                <div
                  className="w-1 h-full min-h-[24px] rounded-full shrink-0"
                  style={{ backgroundColor: bm.color }}
                />
                <button
                  onClick={() => seek(bm.timestamp)}
                  className="text-[8px] font-mono font-bold text-celestial-indigo hover:underline shrink-0 mt-0.5"
                >
                  {formatTimeShort(bm.timestamp)}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-bold text-ink-black dark:text-pearl">{bm.label}</p>
                  {bm.note && <p className="text-[8px] text-silver-mist mt-0.5">{bm.note}</p>}
                </div>
                <button
                  onClick={() => removeBookmark(bm.id)}
                  className="p-0.5 rounded hover:bg-coral-alert/10 transition-colors shrink-0"
                >
                  <Trash2 className="w-3 h-3 text-coral-alert/40 hover:text-coral-alert" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Notes Panel */}
      {activePanel === 'notes' && (
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden">
          {notes.length === 0 ? (
            <div className="p-6 text-center">
              <MessageSquare className="w-6 h-6 mx-auto text-silver-mist/30 mb-1" />
              <p className="text-[9px] text-silver-mist">
                No notes yet. Click the note icon to add one.
              </p>
            </div>
          ) : (
            notes.map((nt) => (
              <div
                key={nt.id}
                className="flex items-start gap-2.5 px-3 py-2.5 border-b border-cloud/50 dark:border-nebula-purple/10 last:border-b-0"
              >
                <button
                  onClick={() => seek(nt.timestamp)}
                  className="text-[8px] font-mono font-bold text-nebula-purple hover:underline shrink-0 mt-0.5"
                >
                  {formatTimeShort(nt.timestamp)}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] text-ink-black dark:text-pearl leading-relaxed">
                    {nt.content}
                  </p>
                  <p className="text-[7px] text-silver-mist mt-0.5">
                    {new Date(nt.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <button
                  onClick={() => removeNote(nt.id)}
                  className="p-0.5 rounded hover:bg-coral-alert/10 transition-colors shrink-0"
                >
                  <Trash2 className="w-3 h-3 text-coral-alert/40 hover:text-coral-alert" />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
