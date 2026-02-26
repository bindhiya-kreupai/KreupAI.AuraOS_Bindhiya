/**
 * Integration clients barrel export.
 * All clients use native fetch and require no external SDKs.
 *
 * Environment variables required per client:
 *
 * Slack:
 *   SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET
 *
 * Microsoft Teams / Graph:
 *   MS_CLIENT_ID, MS_CLIENT_SECRET, MS_TENANT_ID
 *
 * Google (Calendar, Gmail, Drive):
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
 *
 * DocuSign:
 *   DOCUSIGN_ACCOUNT_ID, DOCUSIGN_BASE_URL, DOCUSIGN_ACCESS_TOKEN
 *   (or DOCUSIGN_INTEGRATION_KEY + DOCUSIGN_SECRET_KEY + DOCUSIGN_REFRESH_TOKEN)
 */

// ─────────────────────────────────────────────────────────────────────────────
// Default client instances
// ─────────────────────────────────────────────────────────────────────────────

export { default as slackClient } from './slack-client';
export { default as teamsClient } from './teams-client';
export { default as googleClient } from './google-client';
export { default as docusignClient } from './docusign-client';

// ─────────────────────────────────────────────────────────────────────────────
// Named function exports — Slack
// ─────────────────────────────────────────────────────────────────────────────

export {
  sendMessage as slackSendMessage,
  getChannels as slackGetChannels,
  getUserInfo as slackGetUserInfo,
  getUserByEmail as slackGetUserByEmail,
  sendDirectMessage as slackSendDirectMessage,
} from './slack-client';

export type {
  SlackBlock,
  SlackMessage,
  SlackChannel,
  SlackUser,
  SlackApiResponse,
  SlackError,
} from './slack-client';

// ─────────────────────────────────────────────────────────────────────────────
// Named function exports — Microsoft Teams
// ─────────────────────────────────────────────────────────────────────────────

export {
  sendTeamsMessage,
  getTeamMembers,
  createMeeting,
  listTeams,
  listChannels as teamsListChannels,
} from './teams-client';

export type {
  TeamsMessage,
  TeamsMember,
  MeetingCreateData,
  Meeting,
  TeamsApiResponse,
  TeamsError,
} from './teams-client';

// ─────────────────────────────────────────────────────────────────────────────
// Named function exports — Google
// ─────────────────────────────────────────────────────────────────────────────

export {
  getCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent,
  sendEmail as googleSendEmail,
  uploadToDrive,
  listDriveFiles,
} from './google-client';

export type {
  DateRange,
  CalendarEvent,
  GmailMessage,
  DriveFile,
  GoogleApiResponse,
  GoogleError,
} from './google-client';

// ─────────────────────────────────────────────────────────────────────────────
// Named function exports — DocuSign
// ─────────────────────────────────────────────────────────────────────────────

export {
  createEnvelope,
  getEnvelopeStatus,
  downloadSignedDocument,
  createTemplate,
  listTemplates,
  voidEnvelope,
} from './docusign-client';

export type {
  EnvelopeCreateData,
  EnvelopeDocument,
  EnvelopeRecipientSigner,
  EnvelopeTabs,
  EnvelopeStatus,
  TemplateCreateData,
  Template,
  DocuSignApiResponse,
  DocuSignError,
} from './docusign-client';
