'use client';

import React, { useState } from 'react';
import { VideoInterviewRoom } from '@/components/recruitment/VideoInterviewRoom';
import type { InterviewContext } from '@/components/recruitment/VideoInterviewRoom';
import { InterviewRecording, MOCK_RECORDING } from '@/components/recruitment/InterviewRecording';

const MOCK_CONTEXT: InterviewContext = {
  candidateName: 'Sarah Johnson',
  jobTitle: 'Senior Software Engineer',
  interviewType: 'Technical Interview',
  scheduledDuration: 60,
  interviewId: 'int-001',
};

export default function VideoInterviewPage() {
  const [view, setView] = useState<'room' | 'recording'>('room');
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setView('room')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            view === 'room'
              ? 'bg-celestial-indigo text-white'
              : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl border border-cloud dark:border-nebula-purple/30'
          }`}
        >
          Live Room
        </button>
        <button
          onClick={() => setView('recording')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            view === 'recording'
              ? 'bg-celestial-indigo text-white'
              : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl border border-cloud dark:border-nebula-purple/30'
          }`}
        >
          Recording Playback
        </button>
      </div>

      {view === 'room' && (
        <VideoInterviewRoom
          context={MOCK_CONTEXT}
          onEndCall={() => setView('recording')}
          onStartRecording={() => setIsRecording(true)}
          onStopRecording={() => setIsRecording(false)}
          isRecording={isRecording}
        />
      )}
      {view === 'recording' && <InterviewRecording recording={MOCK_RECORDING} />}
    </div>
  );
}
