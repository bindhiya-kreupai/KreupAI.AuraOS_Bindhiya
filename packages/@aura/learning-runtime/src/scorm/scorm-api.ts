/**
 * @module SCORM12API
 * @description SCORM 1.2 API implementation for LMS integration.
 *              Implements the full SCORM 1.2 JavaScript API surface that
 *              content packages call via window.API.
 */

// ── SCORM 1.2 Error Codes ──────────────────────────────────────────────────

export const SCORM12_ERROR_CODES = {
  NO_ERROR: '0',
  GENERAL_EXCEPTION: '101',
  SERVER_BUSY: '102',
  INVALID_ARGUMENT: '201',
  ELEMENT_CANNOT_HAVE_CHILDREN: '202',
  ELEMENT_NOT_AN_ARRAY: '203',
  NOT_INITIALIZED: '301',
  NOT_IMPLEMENTED: '401',
  INVALID_SET_VALUE: '402',
  ELEMENT_IS_READ_ONLY: '403',
  ELEMENT_IS_WRITE_ONLY: '404',
  INCORRECT_DATA_TYPE: '405',
} as const;

// ── Data Model Types ───────────────────────────────────────────────────────

export type LessonStatus =
  | 'passed'
  | 'completed'
  | 'failed'
  | 'incomplete'
  | 'browsed'
  | 'not attempted';

export interface SCORM12DataModel {
  'cmi.core.student_id': string;
  'cmi.core.student_name': string;
  'cmi.core.lesson_location': string;
  'cmi.core.credit': 'credit' | 'no-credit';
  'cmi.core.lesson_status': LessonStatus;
  'cmi.core.entry': 'ab-initio' | 'resume' | '';
  'cmi.core.score.raw': string;
  'cmi.core.score.max': string;
  'cmi.core.score.min': string;
  'cmi.core.total_time': string;
  'cmi.core.lesson_mode': 'browse' | 'normal' | 'review';
  'cmi.core.exit': 'time-out' | 'suspend' | 'logout' | '';
  'cmi.core.session_time': string;
  'cmi.suspend_data': string;
  'cmi.launch_data': string;
  'cmi.comments': string;
  'cmi.comments_from_lms': string;
  [key: string]: string;
}

// ── Persistence Callback ───────────────────────────────────────────────────

export type PersistCallback = (data: Partial<SCORM12DataModel>) => Promise<void>;
export type LoadCallback    = () => Promise<Partial<SCORM12DataModel>>;

// ── SCORM 1.2 API Class ────────────────────────────────────────────────────

export class SCORM12API {
  private _initialized = false;
  private _finished    = false;
  private _lastError   = SCORM12_ERROR_CODES.NO_ERROR;
  private _dataModel: SCORM12DataModel;
  private _persistCallback?: PersistCallback;
  private _loadCallback?: LoadCallback;

  /** Read-only CMI elements */
  private readonly _readOnly = new Set([
    'cmi.core.student_id',
    'cmi.core.student_name',
    'cmi.core.credit',
    'cmi.core.entry',
    'cmi.core.lesson_mode',
    'cmi.core.total_time',
    'cmi.launch_data',
    'cmi.comments_from_lms',
  ]);

  /** Write-only CMI elements */
  private readonly _writeOnly = new Set([
    'cmi.core.exit',
    'cmi.core.session_time',
  ]);

  constructor(options?: {
    studentId?: string;
    studentName?: string;
    launchData?: string;
    persist?: PersistCallback;
    load?: LoadCallback;
  }) {
    this._dataModel = {
      'cmi.core.student_id':       options?.studentId   ?? 'student_001',
      'cmi.core.student_name':     options?.studentName ?? 'Learner, Default',
      'cmi.core.lesson_location':  '',
      'cmi.core.credit':           'credit',
      'cmi.core.lesson_status':    'not attempted',
      'cmi.core.entry':            'ab-initio',
      'cmi.core.score.raw':        '',
      'cmi.core.score.max':        '100',
      'cmi.core.score.min':        '0',
      'cmi.core.total_time':       '0000:00:00',
      'cmi.core.lesson_mode':      'normal',
      'cmi.core.exit':             '',
      'cmi.core.session_time':     '0000:00:00',
      'cmi.suspend_data':          '',
      'cmi.launch_data':           options?.launchData ?? '',
      'cmi.comments':              '',
      'cmi.comments_from_lms':     '',
    };

    this._persistCallback = options?.persist;
    this._loadCallback    = options?.load;
  }

  // ── SCORM 1.2 API Methods ──────────────────────────────────────────────

  LMSInitialize(_param: string = ''): string {
    if (this._initialized) {
      this._lastError = SCORM12_ERROR_CODES.GENERAL_EXCEPTION;
      return 'false';
    }

    // Load persisted data if callback available
    if (this._loadCallback) {
      this._loadCallback()
        .then((data) => {
          Object.assign(this._dataModel, data);
          // If we have previous location data, set entry to resume
          if (this._dataModel['cmi.core.lesson_location']) {
            this._dataModel['cmi.core.entry'] = 'resume';
          }
        })
        .catch(() => {
          // Silently handle load errors — start fresh
        });
    }

    this._initialized = true;
    this._finished    = false;
    this._lastError   = SCORM12_ERROR_CODES.NO_ERROR;
    return 'true';
  }

  LMSFinish(_param: string = ''): string {
    if (!this._initialized) {
      this._lastError = SCORM12_ERROR_CODES.NOT_INITIALIZED;
      return 'false';
    }

    // Accumulate session time into total time
    this._accumulateTime();

    this._initialized = false;
    this._finished    = true;
    this._lastError   = SCORM12_ERROR_CODES.NO_ERROR;

    // Persist final state
    this._persist();
    return 'true';
  }

  LMSGetValue(element: string): string {
    if (!this._initialized) {
      this._lastError = SCORM12_ERROR_CODES.NOT_INITIALIZED;
      return '';
    }

    if (this._writeOnly.has(element)) {
      this._lastError = SCORM12_ERROR_CODES.ELEMENT_IS_WRITE_ONLY;
      return '';
    }

    if (!(element in this._dataModel)) {
      this._lastError = SCORM12_ERROR_CODES.INVALID_ARGUMENT;
      return '';
    }

    this._lastError = SCORM12_ERROR_CODES.NO_ERROR;
    return this._dataModel[element] ?? '';
  }

  LMSSetValue(element: string, value: string): string {
    if (!this._initialized) {
      this._lastError = SCORM12_ERROR_CODES.NOT_INITIALIZED;
      return 'false';
    }

    if (this._readOnly.has(element)) {
      this._lastError = SCORM12_ERROR_CODES.ELEMENT_IS_READ_ONLY;
      return 'false';
    }

    // Validate lesson_status values
    if (element === 'cmi.core.lesson_status') {
      const valid: LessonStatus[] = [
        'passed', 'completed', 'failed', 'incomplete', 'browsed', 'not attempted',
      ];
      if (!valid.includes(value as LessonStatus)) {
        this._lastError = SCORM12_ERROR_CODES.INCORRECT_DATA_TYPE;
        return 'false';
      }
    }

    this._dataModel[element] = value;
    this._lastError = SCORM12_ERROR_CODES.NO_ERROR;
    return 'true';
  }

  LMSCommit(_param: string = ''): string {
    if (!this._initialized) {
      this._lastError = SCORM12_ERROR_CODES.NOT_INITIALIZED;
      return 'false';
    }

    this._persist();
    this._lastError = SCORM12_ERROR_CODES.NO_ERROR;
    return 'true';
  }

  LMSGetLastError(): string {
    return this._lastError;
  }

  LMSGetErrorString(errorCode: string): string {
    const messages: Record<string, string> = {
      '0':   'No error',
      '101': 'General exception',
      '102': 'Server busy',
      '201': 'Invalid argument error',
      '202': 'Element cannot have children',
      '203': 'Element not an array; cannot have count',
      '301': 'Not initialized',
      '401': 'Not implemented error',
      '402': 'Invalid set value; element is a keyword',
      '403': 'Element is read only',
      '404': 'Element is write only',
      '405': 'Incorrect data type',
    };
    return messages[errorCode] ?? 'Unknown error';
  }

  LMSGetDiagnostic(errorCode: string): string {
    return `Diagnostic: ${this.LMSGetErrorString(errorCode)} (code: ${errorCode})`;
  }

  // ── Public helpers ─────────────────────────────────────────────────────

  /** Retrieve the full current data model snapshot */
  getDataModel(): Partial<SCORM12DataModel> {
    return { ...this._dataModel };
  }

  /** Check initialisation state */
  isInitialized(): boolean {
    return this._initialized;
  }

  // ── Private helpers ────────────────────────────────────────────────────

  private _persist(): void {
    if (this._persistCallback) {
      this._persistCallback({ ...this._dataModel }).catch((err) => {
        console.error('[SCORM12] Persist error:', err);
      });
    }
  }

  /** Convert SCORM time string (HHHH:MM:SS.ss) to seconds */
  private _timeToSeconds(timeStr: string): number {
    if (!timeStr || timeStr === '0000:00:00') return 0;
    const parts = timeStr.split(':');
    const hours   = parseInt(parts[0] ?? '0', 10);
    const minutes = parseInt(parts[1] ?? '0', 10);
    const seconds = parseFloat(parts[2] ?? '0');
    return hours * 3600 + minutes * 60 + seconds;
  }

  /** Convert seconds to SCORM time string */
  private _secondsToTime(totalSeconds: number): string {
    const hours   = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs    = Math.floor(totalSeconds % 60);
    return `${String(hours).padStart(4, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  private _accumulateTime(): void {
    const total   = this._timeToSeconds(this._dataModel['cmi.core.total_time']);
    const session = this._timeToSeconds(this._dataModel['cmi.core.session_time']);
    this._dataModel['cmi.core.total_time'] = this._secondsToTime(total + session);
    this._dataModel['cmi.core.session_time'] = '0000:00:00';
  }
}
