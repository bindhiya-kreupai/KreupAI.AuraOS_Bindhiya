/**
 * Google APIs client wrapper using native fetch.
 * Covers: Google Calendar, Gmail, Google Drive.
 * No external SDK required — uses Google REST APIs with OAuth2 refresh tokens.
 *
 * Required environment variables:
 *   GOOGLE_CLIENT_ID      - OAuth2 client ID
 *   GOOGLE_CLIENT_SECRET  - OAuth2 client secret
 *   GOOGLE_REFRESH_TOKEN  - Long-lived refresh token for the service account / user
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface DateRange {
  start: string; // ISO 8601 datetime string
  end: string; // ISO 8601 datetime string
}

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime: string; timeZone?: string } | { date: string };
  end: { dateTime: string; timeZone?: string } | { date: string };
  attendees?: Array<{ email: string; displayName?: string; responseStatus?: string }>;
  conferenceData?: {
    createRequest?: { requestId: string; conferenceSolutionKey: { type: string } };
    entryPoints?: Array<{ entryPointType: string; uri: string; label?: string }>;
  };
  htmlLink?: string;
  status?: string;
  organizer?: { email: string; displayName?: string };
}

export interface GmailMessage {
  id?: string;
  threadId?: string;
  labelIds?: string[];
  snippet?: string;
  raw?: string;
}

export interface DriveFile {
  id?: string;
  name: string;
  mimeType?: string;
  webViewLink?: string;
  webContentLink?: string;
  size?: string;
  parents?: string[];
}

export interface GoogleApiResponse<T = unknown> {
  ok: boolean;
  error?: string;
  data?: T;
}

export interface GoogleError extends Error {
  code: string;
  statusCode?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Token management
// ─────────────────────────────────────────────────────────────────────────────

interface AccessTokenCache {
  accessToken: string;
  expiresAt: number;
}

let tokenCache: AccessTokenCache | null = null;

function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

function createError(code: string, message: string, statusCode?: number): GoogleError {
  const err = new Error(message) as GoogleError;
  err.code = code;
  err.statusCode = statusCode;
  return err;
}

function getConfig(): { clientId: string; clientSecret: string; refreshToken: string } {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw createError(
      'MISSING_CONFIG',
      'GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN environment variables are required'
    );
  }
  return { clientId, clientSecret, refreshToken };
}

/**
 * Obtain a short-lived access token from the refresh token.
 * Caches it in memory until expiry.
 */
async function getAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) {
    return tokenCache.accessToken;
  }

  const { clientId, clientSecret, refreshToken } = getConfig();

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (!response.ok) {
    const text = await response.text();
    throw createError(
      'TOKEN_REFRESH_ERROR',
      `Failed to refresh Google token: ${text}`,
      response.status
    );
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return tokenCache.accessToken;
}

async function googleRequest<T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  payload?: unknown,
  extraHeaders?: Record<string, string>
): Promise<T> {
  if (isDevelopment()) {
    console.warn(`[GoogleClient][DEV] ${method} ${url}`, payload ?? '');
    return {} as T;
  }

  const token = await getAccessToken();

  const init: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
  };

  if (payload !== undefined) {
    init.body = JSON.stringify(payload);
  }

  const response = await fetch(url, init);

  if (!response.ok) {
    let errorMessage = `Google API error: ${response.status} ${response.statusText}`;
    try {
      const errBody = (await response.json()) as { error?: { message?: string } };
      if (errBody.error?.message) errorMessage = errBody.error.message;
    } catch {
      // ignore
    }
    throw createError('GOOGLE_API_ERROR', errorMessage, response.status);
  }

  if (response.status === 204) return {} as T;
  return response.json() as Promise<T>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Google Calendar
// ─────────────────────────────────────────────────────────────────────────────

/**
 * List events from a Google Calendar within a date range.
 */
export async function getCalendarEvents(
  calendarId: string,
  dateRange: DateRange,
  maxResults = 100
): Promise<GoogleApiResponse<{ events: CalendarEvent[]; nextPageToken?: string }>> {
  const params = new URLSearchParams({
    timeMin: dateRange.start,
    timeMax: dateRange.end,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: String(maxResults),
  });

  const result = await googleRequest<{ items: CalendarEvent[]; nextPageToken?: string }>(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`
  );

  return { ok: true, data: { events: result.items ?? [], nextPageToken: result.nextPageToken } };
}

/**
 * Create a new event on a Google Calendar.
 */
export async function createCalendarEvent(
  calendarId: string,
  event: CalendarEvent,
  addGoogleMeet = false
): Promise<GoogleApiResponse<CalendarEvent>> {
  const params = addGoogleMeet ? '?conferenceDataVersion=1' : '';
  const payload = addGoogleMeet
    ? {
        ...event,
        conferenceData: {
          createRequest: {
            requestId: `auraos-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      }
    : event;

  const result = await googleRequest<CalendarEvent>(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events${params}`,
    'POST',
    payload
  );

  return { ok: true, data: result };
}

/**
 * Delete a calendar event.
 */
export async function deleteCalendarEvent(
  calendarId: string,
  eventId: string
): Promise<GoogleApiResponse<void>> {
  await googleRequest<void>(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
    'DELETE'
  );
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Gmail
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send an email via the Gmail API.
 * Uses RFC 2822 raw message encoding.
 */
export async function sendEmail(
  to: string,
  subject: string,
  body: string,
  from?: string,
  isHtml = true
): Promise<GoogleApiResponse<GmailMessage>> {
  const contentType = isHtml ? 'text/html' : 'text/plain';
  const fromHeader = from ? `From: ${from}\r\n` : '';
  const rawMessage = `${fromHeader}To: ${to}\r\nSubject: ${subject}\r\nContent-Type: ${contentType}; charset=utf-8\r\n\r\n${body}`;
  const encoded = Buffer.from(rawMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const result = await googleRequest<GmailMessage>(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    'POST',
    { raw: encoded }
  );

  return { ok: true, data: result };
}

// ─────────────────────────────────────────────────────────────────────────────
// Google Drive
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Upload a file to Google Drive using multipart upload.
 */
export async function uploadToDrive(
  file: {
    name: string;
    content: Buffer | Uint8Array;
    mimeType: string;
  },
  folderId?: string
): Promise<GoogleApiResponse<DriveFile>> {
  if (isDevelopment()) {
    console.warn(`[GoogleClient][DEV] uploadToDrive`, { name: file.name, folderId });
    return { ok: true, data: { id: 'mock-id', name: file.name } };
  }

  const token = await getAccessToken();

  const metadata: Record<string, unknown> = { name: file.name, mimeType: file.mimeType };
  if (folderId) metadata.parents = [folderId];

  const boundary = `auraos_boundary_${Date.now()}`;
  const metaPart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`;
  const filePart = `--${boundary}\r\nContent-Type: ${file.mimeType}\r\n\r\n`;
  const closing = `\r\n--${boundary}--`;

  const body = Buffer.concat([
    Buffer.from(metaPart),
    Buffer.from(filePart),
    Buffer.from(file.content),
    Buffer.from(closing),
  ]);

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,webContentLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary="${boundary}"`,
        'Content-Length': String(body.length),
      },
      body,
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw createError('DRIVE_UPLOAD_ERROR', `Drive upload failed: ${text}`, response.status);
  }

  const result = (await response.json()) as DriveFile;
  return { ok: true, data: result };
}

/**
 * List files in a Drive folder.
 */
export async function listDriveFiles(
  folderId?: string,
  pageSize = 50
): Promise<GoogleApiResponse<DriveFile[]>> {
  const query = folderId ? `'${folderId}' in parents and trashed = false` : 'trashed = false';
  const params = new URLSearchParams({
    q: query,
    pageSize: String(pageSize),
    fields: 'files(id,name,mimeType,webViewLink,webContentLink,size)',
  });

  const result = await googleRequest<{ files: DriveFile[] }>(
    `https://www.googleapis.com/drive/v3/files?${params}`
  );

  return { ok: true, data: result.files ?? [] };
}

// ─────────────────────────────────────────────────────────────────────────────
// Default export
// ─────────────────────────────────────────────────────────────────────────────

const googleClient = {
  getCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent,
  sendEmail,
  uploadToDrive,
  listDriveFiles,
};

export default googleClient;
