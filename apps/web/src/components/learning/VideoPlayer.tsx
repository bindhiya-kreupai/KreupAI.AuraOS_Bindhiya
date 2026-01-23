"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Bookmark,
  BookmarkCheck,
  SkipBack,
  SkipForward,
  Settings,
} from "lucide-react";

interface VideoBookmark {
  id: string;
  timestamp: number;
  label: string;
}

interface VideoPlayerProps {
  videoUrl?: string;
  title?: string;
  lastPosition?: number;
}

const mockBookmarks: VideoBookmark[] = [
  { id: "bm-1", timestamp: 120, label: "Key Concept: Regression" },
  { id: "bm-2", timestamp: 540, label: "Example: Linear Model" },
  { id: "bm-3", timestamp: 890, label: "Practice Exercise Start" },
];

const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export default function VideoPlayer({
  videoUrl = "/videos/sample-lesson.mp4",
  title = "Predictive Modeling with Regression - Lesson 3",
  lastPosition = 324,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(lastPosition);
  const [duration] = useState(1200);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [bookmarks, setBookmarks] = useState<VideoBookmark[]>(mockBookmarks);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(lastPosition > 0);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return prev + playbackSpeed;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, duration]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      setCurrentTime(Math.floor(percent * duration));
    }
  };

  const handleBookmark = () => {
    if (!isBookmarked) {
      const newBookmark: VideoBookmark = {
        id: `bm-${Date.now()}`,
        timestamp: currentTime,
        label: `Bookmark at ${formatTime(currentTime)}`,
      };
      setBookmarks((prev) => [...prev, newBookmark]);
    }
    setIsBookmarked(!isBookmarked);
  };

  const handleResume = (resume: boolean) => {
    if (!resume) {
      setCurrentTime(0);
    }
    setShowResumePrompt(false);
    setIsPlaying(true);
  };

  const progressPercent = (currentTime / duration) * 100;

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold text-ink-black dark:text-pearl mb-4">
          {title}
        </h2>

        {/* Video Display Area */}
        <div className="relative rounded-xl overflow-hidden bg-black aspect-video mb-2">
          <div className="absolute inset-0 flex items-center justify-center">
            {showResumePrompt ? (
              <div className="bg-black/80 rounded-xl p-6 text-center">
                <p className="text-pearl text-sm mb-3">
                  Resume from {formatTime(lastPosition)}?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleResume(true)}
                    className="px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90"
                  >
                    Resume
                  </button>
                  <button
                    onClick={() => handleResume(false)}
                    className="px-4 py-2 border border-cloud text-pearl rounded-lg text-sm font-medium hover:bg-white/10"
                  >
                    Start Over
                  </button>
                </div>
              </div>
            ) : !isPlaying ? (
              <button
                onClick={() => setIsPlaying(true)}
                className="w-16 h-16 rounded-full bg-celestial-indigo/80 flex items-center justify-center hover:bg-celestial-indigo transition-colors"
              >
                <Play className="w-8 h-8 text-white ml-1" />
              </button>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-t from-ink-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => setIsPlaying(false)}
                  className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center"
                >
                  <Pause className="w-8 h-8 text-white" />
                </button>
              </div>
            )}
          </div>

          {/* Bookmark indicators */}
          <div className="absolute bottom-12 left-0 right-0 px-4">
            {bookmarks.map((bm) => (
              <div
                key={bm.id}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full -translate-x-1/2"
                style={{ left: `${(bm.timestamp / duration) * 100}%` }}
                title={bm.label}
              />
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="rounded-b-xl border border-cloud dark:border-nebula-purple/50 p-4">
          {/* Progress Bar */}
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="w-full h-2 rounded-full bg-cloud dark:bg-nebula-purple/30 cursor-pointer mb-4 relative group"
          >
            <div
              className="h-full rounded-full bg-celestial-indigo transition-all"
              style={{ width: `${progressPercent}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-celestial-indigo border-2 border-white shadow opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                className="text-silver-mist hover:text-ink-black dark:hover:text-pearl"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-full bg-celestial-indigo text-white flex items-center justify-center hover:bg-celestial-indigo/90"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>

              <button
                onClick={() => setCurrentTime(Math.min(duration, currentTime + 10))}
                className="text-silver-mist hover:text-ink-black dark:hover:text-pearl"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              <span className="text-sm text-silver-mist ml-2">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Volume */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-silver-mist hover:text-ink-black dark:hover:text-pearl"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(Number(e.target.value));
                    setIsMuted(false);
                  }}
                  className="w-20 h-1 accent-celestial-indigo"
                />
              </div>

              {/* Speed Control */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="flex items-center gap-1 text-sm text-silver-mist hover:text-ink-black dark:hover:text-pearl"
                >
                  <Settings className="w-4 h-4" />
                  <span>{playbackSpeed}x</span>
                </button>
                {showSpeedMenu && (
                  <div className="absolute bottom-8 right-0 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue shadow-lg py-1 z-10">
                    {speedOptions.map((speed) => (
                      <button
                        key={speed}
                        onClick={() => {
                          setPlaybackSpeed(speed);
                          setShowSpeedMenu(false);
                        }}
                        className={`block w-full text-left px-4 py-1.5 text-sm ${
                          speed === playbackSpeed
                            ? "text-celestial-indigo font-medium"
                            : "text-ink-black dark:text-pearl"
                        } hover:bg-cloud dark:hover:bg-nebula-purple/20`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Bookmark */}
              <button
                onClick={handleBookmark}
                className={`${
                  isBookmarked
                    ? "text-yellow-500"
                    : "text-silver-mist hover:text-ink-black dark:hover:text-pearl"
                }`}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-5 h-5" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </button>

              {/* Fullscreen */}
              <button className="text-silver-mist hover:text-ink-black dark:hover:text-pearl">
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bookmarks List */}
        {bookmarks.length > 0 && (
          <div className="mt-4 rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
            <h3 className="text-sm font-medium text-ink-black dark:text-pearl mb-3">
              Bookmarks
            </h3>
            <div className="space-y-2">
              {bookmarks.map((bm) => (
                <button
                  key={bm.id}
                  onClick={() => setCurrentTime(bm.timestamp)}
                  className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg hover:bg-cloud dark:hover:bg-nebula-purple/20"
                >
                  <Bookmark className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-ink-black dark:text-pearl">
                    {bm.label}
                  </span>
                  <span className="text-xs text-silver-mist ml-auto">
                    {formatTime(bm.timestamp)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
