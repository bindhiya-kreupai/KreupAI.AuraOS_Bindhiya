/**
 * @module SCORMPlayer
 * @description iframe-based SCORM / xAPI content player with:
 *   - SCORM 1.2 and 2004 API injection into iframe window
 *   - Progress bar synced with cmi.progress_measure / lesson_location
 *   - Score display from cmi.core.score.raw
 *   - Completion status indicator
 *   - Bookmark / resume support
 *   - Full screen toggle
 *   - Exit / suspend button with data save
 */

'use client';

import React, { useState, useRef, useEffect, useCallback, type FC } from 'react';
import {
  Maximize2,
  Minimize2,
  Bookmark,
  BookmarkCheck,
  LogOut,
  RefreshCw,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  ChevronRight,
  Loader2,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

export type SCORMVersion = 'scorm12' | 'scorm2004' | 'xapi';

export interface SCORMPlayerProps {
  /** Unique content/course identifier */
  contentId: string;
  /** URL of the SCORM package entry point (e.g. index_lms.html) */
  contentUrl: string;
  /** SCORM version */
  version?: SCORMVersion;
  /** Learner info */
  learnerId?: string;
  learnerName?: string;
  /** Previously saved data model (for resume) */
  savedData?: Record<string, string>;
  /** Called with serialized data model on every commit */
  onCommit?: (data: Record<string, string>) => void;
  /** Called when content is fully completed */
  onComplete?: (data: { score?: number; status: string }) => void;
  /** Called when player is closed/suspended */
  onClose?: () => void;
  /** Title shown in header */
  title?: string;
}

interface PlayerState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  completionStatus: 'not_started' | 'in_progress' | 'completed' | 'passed' | 'failed';
  progressPercent: number;
  scoreRaw: number | null;
  location: string;
  isFullscreen: boolean;
  isBookmarked: boolean;
  elapsedSeconds: number;
  errorMessage: string | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function statusColor(status: PlayerState['completionStatus']): string {
  switch (status) {
    case 'completed':
    case 'passed':
      return 'text-emerald-600 bg-emerald-50';
    case 'failed':
      return 'text-red-600 bg-red-50';
    case 'in_progress':
      return 'text-blue-600 bg-blue-50';
    default:
      return 'text-slate-500 bg-slate-100';
  }
}

function statusLabel(status: PlayerState['completionStatus']): string {
  const map: Record<PlayerState['completionStatus'], string> = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    completed: 'Completed',
    passed: 'Passed',
    failed: 'Failed',
  };
  return map[status];
}

// ── SCORM 1.2 Data Model (injected into iframe) ────────────────────────────

function buildSCORM12API(
  initialData: Record<string, string>,
  onCommit: (data: Record<string, string>) => void
): object {
  const dataModel: Record<string, string> = {
    'cmi.core.student_id': 'learner',
    'cmi.core.student_name': 'Learner',
    'cmi.core.lesson_location': '',
    'cmi.core.credit': 'credit',
    'cmi.core.lesson_status': 'not attempted',
    'cmi.core.entry': 'ab-initio',
    'cmi.core.score.raw': '',
    'cmi.core.score.max': '100',
    'cmi.core.score.min': '0',
    'cmi.core.total_time': '0000:00:00',
    'cmi.core.lesson_mode': 'normal',
    'cmi.core.exit': '',
    'cmi.core.session_time': '0000:00:00',
    'cmi.suspend_data': '',
    'cmi.launch_data': '',
    'cmi.comments': '',
    'cmi.comments_from_lms': '',
    ...initialData,
  };

  if (dataModel['cmi.core.lesson_location']) {
    dataModel['cmi.core.entry'] = 'resume';
  }

  const readOnly = new Set([
    'cmi.core.student_id',
    'cmi.core.student_name',
    'cmi.core.credit',
    'cmi.core.entry',
    'cmi.core.lesson_mode',
    'cmi.core.total_time',
    'cmi.launch_data',
    'cmi.comments_from_lms',
  ]);

  let _initialized = false;
  let _lastError = '0';

  return {
    LMSInitialize: (_: string) => {
      _initialized = true;
      _lastError = '0';
      return 'true';
    },
    LMSFinish: (_: string) => {
      onCommit({ ...dataModel });
      _initialized = false;
      _lastError = '0';
      return 'true';
    },
    LMSGetValue: (element: string) => {
      if (!_initialized) {
        _lastError = '301';
        return '';
      }
      _lastError = '0';
      return dataModel[element] ?? '';
    },
    LMSSetValue: (element: string, value: string) => {
      if (!_initialized) {
        _lastError = '301';
        return 'false';
      }
      if (readOnly.has(element)) {
        _lastError = '403';
        return 'false';
      }
      dataModel[element] = value;
      _lastError = '0';
      return 'true';
    },
    LMSCommit: (_: string) => {
      if (!_initialized) {
        _lastError = '301';
        return 'false';
      }
      onCommit({ ...dataModel });
      _lastError = '0';
      return 'true';
    },
    LMSGetLastError: () => _lastError,
    LMSGetErrorString: (c: string) => `Error ${c}`,
    LMSGetDiagnostic: (c: string) => `Diagnostic: ${c}`,
  };
}

// ── SCORM 2004 API (injected into iframe) ──────────────────────────────────

function buildSCORM2004API(
  initialData: Record<string, string>,
  onCommit: (data: Record<string, string>) => void
): object {
  const dataModel: Record<string, string> = {
    'cmi.learner_id': 'learner',
    'cmi.learner_name': 'Learner',
    'cmi.completion_status': 'not attempted',
    'cmi.success_status': 'unknown',
    'cmi.score.scaled': '',
    'cmi.score.raw': '',
    'cmi.score.max': '100',
    'cmi.score.min': '0',
    'cmi.location': '',
    'cmi.suspend_data': '',
    'cmi.progress_measure': '0',
    'cmi.total_time': 'PT0S',
    'cmi.session_time': 'PT0S',
    'cmi.mode': 'normal',
    'cmi.credit': 'credit',
    'cmi.entry': 'ab-initio',
    ...initialData,
  };

  if (dataModel['cmi.location']) {
    dataModel['cmi.entry'] = 'resume';
  }

  let _initialized = false;
  let _terminated = false;
  let _lastError = '0';

  return {
    Initialize: (_: string) => {
      _initialized = true;
      _terminated = false;
      _lastError = '0';
      return 'true';
    },
    Terminate: (_: string) => {
      onCommit({ ...dataModel });
      _initialized = false;
      _terminated = true;
      _lastError = '0';
      return 'true';
    },
    GetValue: (element: string) => {
      if (!_initialized) {
        _lastError = _terminated ? '123' : '122';
        return '';
      }
      _lastError = '0';
      return dataModel[element] ?? '';
    },
    SetValue: (element: string, value: string) => {
      if (!_initialized) {
        _lastError = _terminated ? '133' : '132';
        return 'false';
      }
      dataModel[element] = value;
      _lastError = '0';
      return 'true';
    },
    Commit: (_: string) => {
      if (!_initialized) {
        _lastError = '142';
        return 'false';
      }
      onCommit({ ...dataModel });
      _lastError = '0';
      return 'true';
    },
    GetLastError: () => _lastError,
    GetErrorString: (c: string) => `Error ${c}`,
    GetDiagnostic: (c: string) => `Diagnostic: ${c}`,
  };
}

// ── Component ──────────────────────────────────────────────────────────────

const SCORMPlayer: FC<SCORMPlayerProps> = ({
  contentId,
  contentUrl,
  version = 'scorm12',
  learnerId = 'learner_001',
  learnerName = 'Learner',
  savedData = {},
  onCommit,
  onComplete,
  onClose,
  title = 'Course Content',
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [state, setState] = useState<PlayerState>({
    status: 'loading',
    completionStatus: 'not_started',
    progressPercent: 0,
    scoreRaw: null,
    location: savedData['cmi.core.lesson_location'] ?? savedData['cmi.location'] ?? '',
    isFullscreen: false,
    isBookmarked: Boolean(savedData['cmi.core.lesson_location'] || savedData['cmi.location']),
    elapsedSeconds: 0,
    errorMessage: null,
  });

  // Latest data model snapshot for reading progress
  const dataModelRef = useRef<Record<string, string>>(savedData);

  // ── Commit handler (called by SCORM API on Commit/Finish) ──────────────

  const handleCommit = useCallback(
    (data: Record<string, string>) => {
      dataModelRef.current = data;

      // Read progress from data model
      let completionStatus: PlayerState['completionStatus'] = state.completionStatus;
      let progressPercent = state.progressPercent;
      let scoreRaw: number | null = state.scoreRaw;
      let location = state.location;

      if (version === 'scorm12') {
        const ls = data['cmi.core.lesson_status'];
        if (ls === 'completed' || ls === 'passed') completionStatus = ls as 'completed' | 'passed';
        else if (ls === 'failed') completionStatus = 'failed';
        else if (ls === 'incomplete' || ls === 'browsed') completionStatus = 'in_progress';

        const rawScore = data['cmi.core.score.raw'];
        if (rawScore) scoreRaw = parseFloat(rawScore);

        location = data['cmi.core.lesson_location'] ?? '';
      } else {
        const cs = data['cmi.completion_status'];
        if (cs === 'completed') completionStatus = 'completed';
        else if (cs === 'incomplete') completionStatus = 'in_progress';

        const ss = data['cmi.success_status'];
        if (ss === 'passed') completionStatus = 'passed';
        else if (ss === 'failed') completionStatus = 'failed';

        const pm = data['cmi.progress_measure'];
        if (pm) progressPercent = Math.round(parseFloat(pm) * 100);

        const sr = data['cmi.score.raw'];
        if (sr) scoreRaw = parseFloat(sr);

        location = data['cmi.location'] ?? '';
      }

      setState((prev) => ({
        ...prev,
        completionStatus,
        progressPercent,
        scoreRaw,
        location,
        isBookmarked: Boolean(location),
      }));

      onCommit?.(data);

      if (completionStatus === 'completed' || completionStatus === 'passed') {
        onComplete?.({ score: scoreRaw ?? undefined, status: completionStatus });
      }
    },
    [
      version,
      state.completionStatus,
      state.progressPercent,
      state.scoreRaw,
      state.location,
      onCommit,
      onComplete,
    ]
  );

  // ── Inject SCORM API into iframe ───────────────────────────────────────

  const injectAPI = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    const iWin = iframe.contentWindow as Window & Record<string, unknown>;

    const enrichedData: Record<string, string> = {
      ...savedData,
      'cmi.core.student_id': learnerId,
      'cmi.core.student_name': learnerName,
      'cmi.learner_id': learnerId,
      'cmi.learner_name': learnerName,
    };

    if (version === 'scorm12') {
      iWin['API'] = buildSCORM12API(enrichedData, handleCommit);
    } else if (version === 'scorm2004') {
      iWin['API_1484_11'] = buildSCORM2004API(enrichedData, handleCommit);
    }
    // xAPI: content uses fetch directly, no window API needed
  }, [version, learnerId, learnerName, savedData, handleCommit]);

  // ── Fullscreen ─────────────────────────────────────────────────────────

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement && containerRef.current) {
      await containerRef.current.requestFullscreen();
      setState((prev) => ({ ...prev, isFullscreen: true }));
    } else {
      await document.exitFullscreen();
      setState((prev) => ({ ...prev, isFullscreen: false }));
    }
  }, []);

  // ── Suspend / close ────────────────────────────────────────────────────

  const handleSuspend = useCallback(() => {
    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
      const iWin = iframe.contentWindow as Window & Record<string, unknown>;
      // Trigger LMSFinish/Terminate so content saves state
      try {
        if (version === 'scorm12') {
          (iWin['API'] as Record<string, (a: string) => void>)?.LMSFinish?.('');
        } else if (version === 'scorm2004') {
          (iWin['API_1484_11'] as Record<string, (a: string) => void>)?.Terminate?.('');
        }
      } catch {
        /* may fail for cross-origin */
      }
    }
    onClose?.();
  }, [version, onClose]);

  // ── Reload ─────────────────────────────────────────────────────────────

  const handleReload = useCallback(() => {
    setState((prev) => ({ ...prev, status: 'loading', errorMessage: null }));
    if (iframeRef.current) {
      iframeRef.current.src = contentUrl;
    }
  }, [contentUrl]);

  // ── Effects ────────────────────────────────────────────────────────────

  // Elapsed timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setState((prev) => ({ ...prev, elapsedSeconds: prev.elapsedSeconds + 1 }));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const handler = () => {
      setState((prev) => ({
        ...prev,
        isFullscreen: Boolean(document.fullscreenElement),
      }));
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────

  const {
    status,
    completionStatus,
    progressPercent,
    scoreRaw,
    isFullscreen,
    elapsedSeconds,
    errorMessage,
  } = state;

  return (
    <div
      ref={containerRef}
      className={`flex flex-col bg-slate-900 ${isFullscreen ? 'fixed inset-0 z-50' : 'rounded-xl overflow-hidden shadow-2xl'}`}
      style={{ height: isFullscreen ? '100vh' : '680px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 flex-shrink-0">
        {/* Left: title + status */}
        <div className="flex items-center gap-3 min-w-0">
          <Activity className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span className="text-sm font-medium text-white truncate">{title}</span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor(completionStatus)}`}
          >
            {statusColor(completionStatus).includes('emerald') ? (
              <CheckCircle2 className="w-3 h-3 inline mr-1" />
            ) : completionStatus === 'failed' ? (
              <XCircle className="w-3 h-3 inline mr-1" />
            ) : null}
            {statusLabel(completionStatus)}
          </span>
        </div>

        {/* Center: progress bar */}
        <div className="hidden md:flex items-center gap-3 flex-1 mx-6 max-w-sm">
          <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs text-slate-400 w-8 text-right">{progressPercent}%</span>
        </div>

        {/* Right: metrics + actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Score */}
          {scoreRaw !== null && (
            <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-400 font-medium">{Math.round(scoreRaw)}</span>
              <span>/100</span>
            </div>
          )}

          {/* Elapsed time */}
          <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          {/* Bookmark indicator */}
          <button
            title={state.isBookmarked ? 'Bookmarked (will resume)' : 'No bookmark yet'}
            className="p-1.5 rounded hover:bg-slate-700 transition-colors"
          >
            {state.isBookmarked ? (
              <BookmarkCheck className="w-4 h-4 text-blue-400" />
            ) : (
              <Bookmark className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Reload */}
          <button
            onClick={handleReload}
            title="Reload content"
            className="p-1.5 rounded hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-slate-400" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            className="p-1.5 rounded hover:bg-slate-700 transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-slate-400" />
            ) : (
              <Maximize2 className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Exit / suspend */}
          <button
            onClick={handleSuspend}
            title="Save progress and exit"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors ml-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </div>

      {/* Progress bar (mobile) */}
      <div className="md:hidden h-1 bg-slate-700 flex-shrink-0">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* iframe container */}
      <div className="relative flex-1 overflow-hidden">
        {/* Loading overlay */}
        {status === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10">
            <Loader2 className="w-10 h-10 text-blue-400 animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Loading content…</p>
          </div>
        )}

        {/* Error overlay */}
        {status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10">
            <XCircle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-white font-medium mb-2">Failed to load content</p>
            <p className="text-slate-400 text-sm mb-4">{errorMessage ?? 'Unknown error'}</p>
            <button
              onClick={handleReload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        )}

        {/* Completion overlay */}
        {(completionStatus === 'completed' || completionStatus === 'passed') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm z-20">
            <div className="text-center p-8 bg-slate-800 rounded-2xl shadow-xl max-w-sm mx-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                {completionStatus === 'passed' ? 'Course Passed!' : 'Course Completed!'}
              </h3>
              {scoreRaw !== null && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span className="text-2xl font-bold text-amber-400">{Math.round(scoreRaw)}%</span>
                </div>
              )}
              <p className="text-slate-400 text-sm mb-6">
                Time spent: {formatTime(elapsedSeconds)}
              </p>
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors mx-auto"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* SCORM iframe */}
        <iframe
          ref={iframeRef}
          src={contentUrl}
          title={title}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
          onLoad={() => {
            injectAPI();
            setState((prev) => ({ ...prev, status: 'ready' }));
          }}
          onError={() => {
            setState((prev) => ({
              ...prev,
              status: 'error',
              errorMessage: 'The content URL could not be loaded.',
            }));
          }}
        />
      </div>

      {/* Footer status bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-800 border-t border-slate-700 flex-shrink-0">
        <div className="text-xs text-slate-500">
          Content ID: <span className="text-slate-400 font-mono">{contentId}</span>
        </div>
        <div className="text-xs text-slate-500">
          Runtime: <span className="text-slate-400 uppercase">{version}</span>
        </div>
        <div className="text-xs text-slate-500">
          {state.location ? (
            <>
              Bookmark: <span className="text-blue-400 font-mono">{state.location}</span>
            </>
          ) : (
            'No bookmark'
          )}
        </div>
      </div>
    </div>
  );
};

export default SCORMPlayer;
