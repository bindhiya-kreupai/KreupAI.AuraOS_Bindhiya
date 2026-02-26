/**
 * @module ContentPlayer
 * @description Unified content player that orchestrates SCORM 1.2, SCORM 2004,
 *              xAPI, video, and document content with progress tracking.
 */

import { SCORM12API, type SCORM12DataModel, type PersistCallback, type LoadCallback } from '../scorm/scorm-api';
import { SCORM2004API, type SCORM2004DataModel, type PersistCallback2004, type LoadCallback2004 } from '../scorm/scorm2004-api';
import { xAPIClient, XAPI_VERBS, type xAPIAgent, type xAPIActivity, type xAPIResult } from '../xapi/xapi-client';

// ── Content Types ──────────────────────────────────────────────────────────

export type ContentType =
  | 'scorm12'
  | 'scorm2004'
  | 'xapi'
  | 'video'
  | 'document'
  | 'html'
  | 'assessment';

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'completed' | 'error';

export interface ContentProgress {
  contentId:        string;
  type:             ContentType;
  completionStatus: 'not_started' | 'in_progress' | 'completed';
  successStatus:    'unknown' | 'passed' | 'failed';
  progressPercent:  number;          // 0–100
  scoreRaw?:        number;
  scoreScaled?:     number;          // 0–1
  location?:        string;          // bookmark/lesson_location
  suspendData?:     string;
  totalTimeSeconds: number;
  lastAccessedAt:   string;
}

export interface ContentPlayerOptions {
  contentId:     string;
  learnerId:     string;
  learnerName?:  string;
  // SCORM callbacks
  onPersist12?:  PersistCallback;
  onLoad12?:     LoadCallback;
  onPersist04?:  PersistCallback2004;
  onLoad04?:     LoadCallback2004;
  // xAPI options
  xapiEndpoint?: string;
  xapiToken?:    string;
  xapiUsername?: string;
  xapiPassword?: string;
  // Generic progress callback
  onProgress?:   (progress: ContentProgress) => void;
}

// ── ContentPlayer ──────────────────────────────────────────────────────────

export class ContentPlayer {
  private _options:     ContentPlayerOptions;
  private _status:      PlaybackStatus = 'idle';
  private _contentType: ContentType | null = null;
  private _contentUrl:  string | null = null;

  // Runtime instances
  private _scorm12?:   SCORM12API;
  private _scorm2004?: SCORM2004API;
  private _xapi?:      xAPIClient;

  // Progress tracking
  private _progress: ContentProgress;
  private _startedAt: Date | null = null;
  private _sessionStartSeconds = 0;

  constructor(options: ContentPlayerOptions) {
    this._options = options;
    this._progress = {
      contentId:        options.contentId,
      type:             'html',
      completionStatus: 'not_started',
      successStatus:    'unknown',
      progressPercent:  0,
      totalTimeSeconds: 0,
      lastAccessedAt:   new Date().toISOString(),
    };
  }

  // ── Public API ─────────────────────────────────────────────────────────

  /**
   * Load content by URL and type; initialises the appropriate runtime.
   */
  async loadContent(url: string, type: ContentType): Promise<void> {
    this._status      = 'loading';
    this._contentUrl  = url;
    this._contentType = type;
    this._progress.type = type;

    await this.initializeRuntime(type);

    this._status    = 'playing';
    this._startedAt = new Date();
    this._progress.lastAccessedAt = new Date().toISOString();
  }

  /**
   * Initialise the appropriate runtime API for the given content type.
   * Exposed separately so callers can wire up window.API / window.API_1484_11
   * before injecting into an iframe.
   */
  async initializeRuntime(type: ContentType): Promise<SCORM12API | SCORM2004API | xAPIClient | null> {
    switch (type) {
      case 'scorm12': {
        this._scorm12 = new SCORM12API({
          studentId:   this._options.learnerId,
          studentName: this._options.learnerName,
          persist:     this._options.onPersist12,
          load:        this._options.onLoad12,
        });
        this._scorm12.LMSInitialize('');
        return this._scorm12;
      }

      case 'scorm2004': {
        this._scorm2004 = new SCORM2004API({
          learnerId:   this._options.learnerId,
          learnerName: this._options.learnerName,
          persist:     this._options.onPersist04,
          load:        this._options.onLoad04,
        });
        this._scorm2004.Initialize('');
        return this._scorm2004;
      }

      case 'xapi': {
        if (!this._options.xapiEndpoint) {
          throw new Error('xAPI endpoint required for xAPI content type');
        }
        this._xapi = new xAPIClient({
          endpoint: this._options.xapiEndpoint,
          token:    this._options.xapiToken,
          username: this._options.xapiUsername,
          password: this._options.xapiPassword,
        });

        // Send "launched" statement
        const actor    = this._buildActor();
        const activity = this._buildActivity();
        await this._xapi.track(actor, XAPI_VERBS.launched, activity).catch(() => { /* non-fatal */ });
        return this._xapi;
      }

      default:
        // video / document / html / assessment — no special runtime
        return null;
    }
  }

  /**
   * Update progress from runtime data. Call periodically or on API Commit.
   */
  trackProgress(data: Partial<{
    progressPercent: number;
    location:        string;
    suspendData:     string;
    scoreRaw:        number;
    scoreScaled:     number;
    completionStatus: ContentProgress['completionStatus'];
    successStatus:    ContentProgress['successStatus'];
  }>): void {
    if (data.progressPercent  !== undefined) this._progress.progressPercent  = data.progressPercent;
    if (data.location         !== undefined) this._progress.location         = data.location;
    if (data.suspendData      !== undefined) this._progress.suspendData      = data.suspendData;
    if (data.scoreRaw         !== undefined) this._progress.scoreRaw         = data.scoreRaw;
    if (data.scoreScaled      !== undefined) this._progress.scoreScaled      = data.scoreScaled;
    if (data.completionStatus !== undefined) this._progress.completionStatus = data.completionStatus;
    if (data.successStatus    !== undefined) this._progress.successStatus    = data.successStatus;

    // Sync from SCORM runtimes if running
    this._syncFromRuntime();

    this._progress.lastAccessedAt = new Date().toISOString();
    this._options.onProgress?.(this.getProgressSnapshot());
  }

  /**
   * Returns true when the content is considered complete.
   */
  getCompletionStatus(): boolean {
    return this._progress.completionStatus === 'completed';
  }

  /**
   * Pause playback and commit runtime state.
   */
  async suspend(): Promise<void> {
    this._updateSessionTime();

    if (this._scorm12) {
      this._scorm12.LMSSetValue('cmi.core.exit', 'suspend');
      this._scorm12.LMSCommit('');
    }

    if (this._scorm2004) {
      this._scorm2004.Commit('');
    }

    if (this._xapi) {
      const actor    = this._buildActor();
      const activity = this._buildActivity();
      await this._xapi.track(actor, XAPI_VERBS.experienced, activity, {
        duration: this._secondsToISO8601(this._progress.totalTimeSeconds),
      }).catch(() => { /* non-fatal */ });
    }

    this._status = 'paused';
  }

  /**
   * Finish the content session and terminate the runtime.
   */
  async finish(): Promise<ContentProgress> {
    this._updateSessionTime();
    this._syncFromRuntime();

    if (this._scorm12) {
      this._scorm12.LMSSetValue('cmi.core.exit', 'logout');
      this._scorm12.LMSFinish('');
    }

    if (this._scorm2004) {
      this._scorm2004.Terminate('');
    }

    if (this._xapi) {
      const actor    = this._buildActor();
      const activity = this._buildActivity();
      const verb     = this.getCompletionStatus() ? XAPI_VERBS.completed : XAPI_VERBS.experienced;
      const result: xAPIResult = {
        completion: this.getCompletionStatus(),
        duration:   this._secondsToISO8601(this._progress.totalTimeSeconds),
      };
      if (this._progress.scoreScaled !== undefined) {
        result.score = { scaled: this._progress.scoreScaled, raw: this._progress.scoreRaw };
      }
      if (this._progress.successStatus !== 'unknown') {
        result.success = this._progress.successStatus === 'passed';
      }
      await this._xapi.track(actor, verb, activity, result).catch(() => { /* non-fatal */ });
    }

    this._status = 'completed';
    return this.getProgressSnapshot();
  }

  getProgressSnapshot(): ContentProgress {
    return { ...this._progress };
  }

  getStatus(): PlaybackStatus {
    return this._status;
  }

  getRuntime(): SCORM12API | SCORM2004API | xAPIClient | null {
    return this._scorm12 ?? this._scorm2004 ?? this._xapi ?? null;
  }

  // ── Private helpers ────────────────────────────────────────────────────

  private _syncFromRuntime(): void {
    if (this._scorm12) {
      const status = this._scorm12.LMSGetValue('cmi.core.lesson_status');
      if (status === 'completed' || status === 'passed') {
        this._progress.completionStatus = 'completed';
        this._progress.successStatus    = status === 'passed' ? 'passed' : 'unknown';
      } else if (status === 'failed') {
        this._progress.successStatus = 'failed';
      } else if (status === 'incomplete' || status === 'browsed') {
        this._progress.completionStatus = 'in_progress';
      }

      const location = this._scorm12.LMSGetValue('cmi.core.lesson_location');
      if (location) this._progress.location = location;

      const suspendData = this._scorm12.LMSGetValue('cmi.suspend_data');
      if (suspendData) this._progress.suspendData = suspendData;

      const scoreRaw = this._scorm12.LMSGetValue('cmi.core.score.raw');
      if (scoreRaw) {
        this._progress.scoreRaw    = parseFloat(scoreRaw);
        this._progress.scoreScaled = this._progress.scoreRaw / 100;
      }
    }

    if (this._scorm2004) {
      const completionStatus = this._scorm2004.GetValue('cmi.completion_status');
      if (completionStatus === 'completed') {
        this._progress.completionStatus = 'completed';
      } else if (completionStatus === 'incomplete') {
        this._progress.completionStatus = 'in_progress';
      }

      const successStatus = this._scorm2004.GetValue('cmi.success_status');
      if (successStatus === 'passed' || successStatus === 'failed') {
        this._progress.successStatus = successStatus;
      }

      const progress = this._scorm2004.GetValue('cmi.progress_measure');
      if (progress) {
        this._progress.progressPercent = Math.round(parseFloat(progress) * 100);
      }

      const location = this._scorm2004.GetValue('cmi.location');
      if (location) this._progress.location = location;

      const scoreScaled = this._scorm2004.GetValue('cmi.score.scaled');
      if (scoreScaled) {
        this._progress.scoreScaled = parseFloat(scoreScaled);
        this._progress.scoreRaw    = this._progress.scoreScaled * 100;
      }
    }
  }

  private _updateSessionTime(): void {
    if (this._startedAt) {
      const elapsed = (Date.now() - this._startedAt.getTime()) / 1000;
      this._progress.totalTimeSeconds += elapsed;
      this._startedAt = new Date(); // reset for next segment
    }
  }

  private _buildActor(): xAPIAgent {
    return {
      objectType: 'Agent',
      name:       this._options.learnerName ?? this._options.learnerId,
      account: {
        homePage: typeof window !== 'undefined' ? window.location.origin : 'https://auraos.app',
        name:     this._options.learnerId,
      },
    };
  }

  private _buildActivity(): xAPIActivity {
    return {
      objectType: 'Activity',
      id: this._contentUrl ?? `https://auraos.app/content/${this._options.contentId}`,
      definition: {
        name: { 'en-US': `Content ${this._options.contentId}` },
      },
    };
  }

  private _secondsToISO8601(totalSeconds: number): string {
    const hours   = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs    = Math.round(totalSeconds % 60);
    let result    = 'PT';
    if (hours)   result += `${hours}H`;
    if (minutes) result += `${minutes}M`;
    if (secs || (!hours && !minutes)) result += `${secs}S`;
    return result;
  }
}
