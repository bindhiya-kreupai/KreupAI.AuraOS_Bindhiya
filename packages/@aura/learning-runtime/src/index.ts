/**
 * @package @aura/learning-runtime
 * @description SCORM 1.2 / SCORM 2004 / xAPI learning runtime engine for AuraOS.
 */

// SCORM 1.2
export {
  SCORM12API,
  SCORM12_ERROR_CODES,
  type SCORM12DataModel,
  type LessonStatus,
  type PersistCallback,
  type LoadCallback,
} from './scorm/scorm-api';

// SCORM 2004
export {
  SCORM2004API,
  SCORM2004_ERROR_CODES,
  type SCORM2004DataModel,
  type CompletionStatus,
  type SuccessStatus,
  type InteractionType,
  type PersistCallback2004,
  type LoadCallback2004,
} from './scorm/scorm2004-api';

// xAPI
export {
  xAPIClient,
  XAPI_VERBS,
  type xAPIStatement,
  type xAPIAgent,
  type xAPIVerb,
  type xAPIActivity,
  type xAPIResult,
  type xAPIContext,
  type xAPIStatementsResponse,
  type xAPIStatementQuery,
  type xAPIClientConfig,
} from './xapi/xapi-client';

// Content Player
export {
  ContentPlayer,
  type ContentType,
  type PlaybackStatus,
  type ContentProgress,
  type ContentPlayerOptions,
} from './player/content-player';
