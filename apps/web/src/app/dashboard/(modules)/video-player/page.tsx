/**
 * @module VideoPlayerPage
 * @description ESS learning video player with tracking, bookmarks, notes,
 *              resume, and playback speed control
 * @route /dashboard/video-player
 * @project AURA HCM Platform
 */

'use client';

import React from 'react';
import {
  VideoPlayer,
  MOCK_VIDEO,
  MOCK_BOOKMARKS,
  MOCK_NOTES,
  MOCK_PROGRESS,
} from '@/components/learning/VideoPlayer';

export default function VideoPlayerPage() {
  return (
    <div className="p-4 max-w-5xl mx-auto">
      <VideoPlayer
        video={MOCK_VIDEO}
        bookmarks={MOCK_BOOKMARKS}
        notes={MOCK_NOTES}
        progress={MOCK_PROGRESS}
      />
    </div>
  );
}
