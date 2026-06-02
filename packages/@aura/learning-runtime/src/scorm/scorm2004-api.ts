/**
 * @module SCORM2004API
 * @description SCORM 2004 3rd/4th Edition API implementation.
 *              Implements the full RTE API surface that SCORM 2004 packages
 *              call via window.API_1484_11.
 */

// ── SCORM 2004 Error Codes ─────────────────────────────────────────────────

export const SCORM2004_ERROR_CODES = {
  NO_ERROR:                   '0',
  GENERAL_EXCEPTION:          '101',
  GENERAL_INIT_FAILURE:       '102',
  ALREADY_INITIALIZED:        '103',
  CONTENT_INSTANCE_TERMINATED:'104',
  GENERAL_TERMINATION_FAILURE:'111',
  TERMINATION_BEFORE_INIT:    '112',
  TERMINATION_AFTER_TERM:     '113',
  RETRIEVE_BEFORE_INIT:       '122',
  RETRIEVE_AFTER_TERM:        '123',
  STORE_BEFORE_INIT:          '132',
  STORE_AFTER_TERM:           '133',
  COMMIT_BEFORE_INIT:         '142',
  COMMIT_AFTER_TERM:          '143',
  GENERAL_ARGUMENT_ERROR:     '201',
  GENERAL_GET_FAILURE:        '301',
  GENERAL_SET_FAILURE:        '351',
  GENERAL_COMMIT_FAILURE:     '391',
  UNDEFINED_DATA_MODEL:       '401',
  UNIMPLEMENTED_ELEMENT:      '402',
  NOT_INITIALIZED_ELEMENT:    '403',
  READ_ONLY_ELEMENT:          '404',
  WRITE_ONLY_ELEMENT:         '405',
  TYPE_MISMATCH:              '406',
  VALUE_OUT_OF_RANGE:         '407',
  DEPENDENCY_NOT_ESTABLISHED: '408',
} as const;

export type SCORM2004ErrorCode =
  (typeof SCORM2004_ERROR_CODES)[keyof typeof SCORM2004_ERROR_CODES];

// ── Data Model Types ───────────────────────────────────────────────────────

export type CompletionStatus = 'completed' | 'incomplete' | 'not attempted' | 'unknown';
export type SuccessStatus    = 'passed' | 'failed' | 'unknown';
export type InteractionType  =
  | 'true-false'
  | 'choice'
  | 'fill-in'
  | 'long-fill-in'
  | 'matching'
  | 'performance'
  | 'sequencing'
  | 'likert'
  | 'numeric'
  | 'other';

export interface SCORM2004DataModel {
  // Learner info
  'cmi.learner_id':             string;
  'cmi.learner_name':           string;
  // Completion
  'cmi.completion_status':      CompletionStatus;
  'cmi.completion_threshold':   string;
  'cmi.progress_measure':       string;
  // Success / Score
  'cmi.success_status':         SuccessStatus;
  'cmi.score.scaled':           string;
  'cmi.score.raw':              string;
  'cmi.score.max':              string;
  'cmi.score.min':              string;
  // Location & data
  'cmi.location':               string;
  'cmi.suspend_data':           string;
  'cmi.launch_data':            string;
  // Time
  'cmi.total_time':             string;
  'cmi.session_time':           string;
  // Mode / credit
  'cmi.mode':                   'browse' | 'normal' | 'review';
  'cmi.credit':                 'credit' | 'no-credit';
  'cmi.entry':                  'ab-initio' | 'resume' | '';
  // Comments
  'cmi.comments_from_learner._count': string;
  'cmi.comments_from_lms._count':     string;
  // Interactions
  'cmi.interactions._count':    string;
  // Objectives
  'cmi.objectives._count':      string;
  [key: string]: string;
}

export type PersistCallback2004 = (data: Partial<SCORM2004DataModel>) => Promise<void>;
export type LoadCallback2004    = () => Promise<Partial<SCORM2004DataModel>>;

// ── SCORM 2004 API Class ───────────────────────────────────────────────────

export class SCORM2004API {
  private _initialized = false;
  private _terminated  = false;
  private _lastError: SCORM2004ErrorCode = SCORM2004_ERROR_CODES.NO_ERROR;
  private _dataModel: SCORM2004DataModel;
  private _persistCallback?: PersistCallback2004;
  private _loadCallback?: LoadCallback2004;

  private readonly _readOnly = new Set([
    'cmi.learner_id',
    'cmi.learner_name',
    'cmi.credit',
    'cmi.entry',
    'cmi.mode',
    'cmi.total_time',
    'cmi.launch_data',
    'cmi.completion_threshold',
    'cmi.comments_from_lms._count',
    'cmi.interactions._count',
    'cmi.objectives._count',
  ]);

  private readonly _writeOnly = new Set([
    'cmi.session_time',
  ]);

  constructor(options?: {
    learnerId?: string;
    learnerName?: string;
    launchData?: string;
    completionThreshold?: string;
    persist?: PersistCallback2004;
    load?: LoadCallback2004;
  }) {
    this._dataModel = {
      'cmi.learner_id':              options?.learnerId          ?? 'learner_001',
      'cmi.learner_name':            options?.learnerName        ?? 'Default Learner',
      'cmi.completion_status':       'not attempted',
      'cmi.completion_threshold':    options?.completionThreshold ?? '1.0',
      'cmi.progress_measure':        '0',
      'cmi.success_status':          'unknown',
      'cmi.score.scaled':            '',
      'cmi.score.raw':               '',
      'cmi.score.max':               '100',
      'cmi.score.min':               '0',
      'cmi.location':                '',
      'cmi.suspend_data':            '',
      'cmi.launch_data':             options?.launchData ?? '',
      'cmi.total_time':              'PT0S',
      'cmi.session_time':            'PT0S',
      'cmi.mode':                    'normal',
      'cmi.credit':                  'credit',
      'cmi.entry':                   'ab-initio',
      'cmi.comments_from_learner._count': '0',
      'cmi.comments_from_lms._count':     '0',
      'cmi.interactions._count':     '0',
      'cmi.objectives._count':       '0',
    };

    this._persistCallback = options?.persist;
    this._loadCallback    = options?.load;
  }

  // ── SCORM 2004 API Methods ─────────────────────────────────────────────

  Initialize(_param: string = ''): string {
    if (this._initialized) {
      this._lastError = SCORM2004_ERROR_CODES.ALREADY_INITIALIZED;
      return 'false';
    }
    if (this._terminated) {
      this._lastError = SCORM2004_ERROR_CODES.CONTENT_INSTANCE_TERMINATED;
      return 'false';
    }

    if (this._loadCallback) {
      this._loadCallback()
        .then((data) => {
          Object.assign(this._dataModel, data);
          if (this._dataModel['cmi.location']) {
            this._dataModel['cmi.entry'] = 'resume';
          }
        })
        .catch(() => { /* start fresh */ });
    }

    this._initialized = true;
    this._terminated  = false;
    this._lastError   = SCORM2004_ERROR_CODES.NO_ERROR;
    return 'true';
  }

  Terminate(_param: string = ''): string {
    if (!this._initialized) {
      this._lastError = SCORM2004_ERROR_CODES.TERMINATION_BEFORE_INIT;
      return 'false';
    }
    if (this._terminated) {
      this._lastError = SCORM2004_ERROR_CODES.TERMINATION_AFTER_TERM;
      return 'false';
    }

    // Accumulate session time
    this._accumulateTime();

    this._initialized = false;
    this._terminated  = true;
    this._lastError   = SCORM2004_ERROR_CODES.NO_ERROR;
    this._persist();
    return 'true';
  }

  GetValue(element: string): string {
    if (!this._initialized) {
      this._lastError = this._terminated
        ? SCORM2004_ERROR_CODES.RETRIEVE_AFTER_TERM
        : SCORM2004_ERROR_CODES.RETRIEVE_BEFORE_INIT;
      return '';
    }

    if (this._writeOnly.has(element)) {
      this._lastError = SCORM2004_ERROR_CODES.WRITE_ONLY_ELEMENT;
      return '';
    }

    if (!(element in this._dataModel)) {
      this._lastError = SCORM2004_ERROR_CODES.UNDEFINED_DATA_MODEL;
      return '';
    }

    this._lastError = SCORM2004_ERROR_CODES.NO_ERROR;
    return this._dataModel[element] ?? '';
  }

  SetValue(element: string, value: string): string {
    if (!this._initialized) {
      this._lastError = this._terminated
        ? SCORM2004_ERROR_CODES.STORE_AFTER_TERM
        : SCORM2004_ERROR_CODES.STORE_BEFORE_INIT;
      return 'false';
    }

    if (this._readOnly.has(element)) {
      this._lastError = SCORM2004_ERROR_CODES.READ_ONLY_ELEMENT;
      return 'false';
    }

    // Validate enum fields
    if (element === 'cmi.completion_status') {
      const valid: CompletionStatus[] = ['completed', 'incomplete', 'not attempted', 'unknown'];
      if (!valid.includes(value as CompletionStatus)) {
        this._lastError = SCORM2004_ERROR_CODES.TYPE_MISMATCH;
        return 'false';
      }
    }

    if (element === 'cmi.success_status') {
      const valid: SuccessStatus[] = ['passed', 'failed', 'unknown'];
      if (!valid.includes(value as SuccessStatus)) {
        this._lastError = SCORM2004_ERROR_CODES.TYPE_MISMATCH;
        return 'false';
      }
    }

    if (element === 'cmi.score.scaled' || element === 'cmi.progress_measure') {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0 || num > 1) {
        this._lastError = SCORM2004_ERROR_CODES.VALUE_OUT_OF_RANGE;
        return 'false';
      }
    }

    this._dataModel[element] = value;
    this._lastError = SCORM2004_ERROR_CODES.NO_ERROR;
    return 'true';
  }

  Commit(_param: string = ''): string {
    if (!this._initialized) {
      this._lastError = this._terminated
        ? SCORM2004_ERROR_CODES.COMMIT_AFTER_TERM
        : SCORM2004_ERROR_CODES.COMMIT_BEFORE_INIT;
      return 'false';
    }

    this._persist();
    this._lastError = SCORM2004_ERROR_CODES.NO_ERROR;
    return 'true';
  }

  GetLastError(): string {
    return this._lastError;
  }

  GetErrorString(errorCode: string): string {
    const messages: Record<string, string> = {
      '0':   'No error',
      '101': 'General exception',
      '102': 'General initialization failure',
      '103': 'Already initialized',
      '104': 'Content instance terminated',
      '111': 'General termination failure',
      '112': 'Termination before initialization',
      '113': 'Termination after termination',
      '122': 'Retrieve data before initialization',
      '123': 'Retrieve data after termination',
      '132': 'Store data before initialization',
      '133': 'Store data after termination',
      '142': 'Commit before initialization',
      '143': 'Commit after termination',
      '201': 'General argument error',
      '301': 'General get failure',
      '351': 'General set failure',
      '391': 'General commit failure',
      '401': 'Undefined data model element',
      '402': 'Unimplemented data model element',
      '403': 'Data model element value not initialized',
      '404': 'Data model element is read only',
      '405': 'Data model element is write only',
      '406': 'Data model element type mismatch',
      '407': 'Data model element value out of range',
      '408': 'Data model dependency not established',
    };
    return messages[errorCode] ?? 'Unknown error';
  }

  GetDiagnostic(errorCode: string): string {
    return `Diagnostic: ${this.GetErrorString(errorCode)} (code: ${errorCode}, initialized: ${this._initialized})`;
  }

  // ── Public helpers ─────────────────────────────────────────────────────

  getDataModel(): Partial<SCORM2004DataModel> {
    return { ...this._dataModel };
  }

  isInitialized(): boolean {
    return this._initialized;
  }

  isTerminated(): boolean {
    return this._terminated;
  }

  // ── Private helpers ────────────────────────────────────────────────────

  private _persist(): void {
    if (this._persistCallback) {
      this._persistCallback({ ...this._dataModel }).catch((err) => {
        console.error('[SCORM2004] Persist error:', err);
      });
    }
  }

  /** Parse ISO 8601 duration (PTxHxMxS) to seconds */
  private _iso8601ToSeconds(duration: string): number {
    if (!duration || duration === 'PT0S') return 0;
    const match = duration.match(/PT(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?/);
    if (!match) return 0;
    const hours   = parseFloat(match[1] ?? '0');
    const minutes = parseFloat(match[2] ?? '0');
    const seconds = parseFloat(match[3] ?? '0');
    return hours * 3600 + minutes * 60 + seconds;
  }

  /** Convert seconds to ISO 8601 duration */
  private _secondsToISO8601(totalSeconds: number): string {
    const hours   = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs    = totalSeconds % 60;
    let result = 'PT';
    if (hours)   result += `${hours}H`;
    if (minutes) result += `${minutes}M`;
    if (secs || (!hours && !minutes)) result += `${secs}S`;
    return result;
  }

  private _accumulateTime(): void {
    const total   = this._iso8601ToSeconds(this._dataModel['cmi.total_time']);
    const session = this._iso8601ToSeconds(this._dataModel['cmi.session_time']);
    this._dataModel['cmi.total_time']    = this._secondsToISO8601(total + session);
    this._dataModel['cmi.session_time']  = 'PT0S';
  }
}
