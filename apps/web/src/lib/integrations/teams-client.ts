/**
 * Microsoft Teams / Microsoft Graph API client wrapper using native fetch.
 * No external SDK required.
 *
 * Required environment variables:
 *   MS_CLIENT_ID      - Azure AD application (client) ID
 *   MS_CLIENT_SECRET  - Azure AD client secret
 *   MS_TENANT_ID      - Azure AD tenant ID
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface TeamsMessageBody {
  contentType: 'html' | 'text';
  content: string;
}

export interface TeamsMessage {
  id?: string;
  body: TeamsMessageBody;
  createdDateTime?: string;
  from?: { user: { displayName: string; id: string } };
}

export interface TeamsMember {
  id: string;
  displayName: string;
  email?: string;
  roles?: string[];
}

export interface MeetingCreateData {
  subject: string;
  startDateTime: string; // ISO 8601
  endDateTime: string; // ISO 8601
  attendees?: Array<{ emailAddress: { address: string; name?: string } }>;
  isOnlineMeeting?: boolean;
  onlineMeetingProvider?: 'teamsForBusiness';
  location?: { displayName: string };
  body?: TeamsMessageBody;
}

export interface Meeting {
  id: string;
  subject: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  joinUrl?: string;
  onlineMeeting?: { joinUrl: string };
  attendees?: Array<{
    emailAddress: { address: string; name: string };
    status: { response: string };
  }>;
  webLink?: string;
}

export interface TeamsApiResponse<T = unknown> {
  ok: boolean;
  error?: string;
  data?: T;
}

export interface TeamsError extends Error {
  code: string;
  statusCode?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Token cache (in-memory, per process)
// ─────────────────────────────────────────────────────────────────────────────

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0';

function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

function createError(code: string, message: string, statusCode?: number): TeamsError {
  const err = new Error(message) as TeamsError;
  err.code = code;
  err.statusCode = statusCode;
  return err;
}

function getConfig(): { clientId: string; clientSecret: string; tenantId: string } {
  const clientId = process.env.MS_CLIENT_ID;
  const clientSecret = process.env.MS_CLIENT_SECRET;
  const tenantId = process.env.MS_TENANT_ID;

  if (!clientId || !clientSecret || !tenantId) {
    throw createError(
      'MISSING_CONFIG',
      'MS_CLIENT_ID, MS_CLIENT_SECRET, and MS_TENANT_ID environment variables are required'
    );
  }
  return { clientId, clientSecret, tenantId };
}

/**
 * Obtain an access token using the client credentials flow.
 * Caches the token until it expires.
 */
async function getAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) {
    return tokenCache.accessToken;
  }

  const { clientId, clientSecret, tenantId } = getConfig();

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'https://graph.microsoft.com/.default',
  });

  const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (!response.ok) {
    const text = await response.text();
    throw createError('TOKEN_ERROR', `Failed to obtain access token: ${text}`, response.status);
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return tokenCache.accessToken;
}

async function graphRequest<T>(
  path: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  payload?: unknown
): Promise<T> {
  if (isDevelopment()) {
    console.warn(`[TeamsClient][DEV] ${method} ${path}`, payload ?? '');
    return {} as T;
  }

  const token = await getAccessToken();

  const init: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  if (payload !== undefined) {
    init.body = JSON.stringify(payload);
  }

  const response = await fetch(`${GRAPH_API_BASE}${path}`, init);

  if (!response.ok) {
    let errorMessage = `Graph API error: ${response.status} ${response.statusText}`;
    try {
      const errBody = (await response.json()) as { error?: { message?: string } };
      if (errBody.error?.message) errorMessage = errBody.error.message;
    } catch {
      // ignore JSON parse error
    }
    throw createError('GRAPH_API_ERROR', errorMessage, response.status);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send a message to a Teams channel.
 *
 * @param teamId    - The Teams group/team ID
 * @param channelId - The channel ID within the team
 * @param content   - HTML or plain text content
 */
export async function sendTeamsMessage(
  teamId: string,
  channelId: string,
  content: string,
  contentType: 'html' | 'text' = 'html'
): Promise<TeamsApiResponse<TeamsMessage>> {
  const payload = { body: { contentType, content } };
  const result = await graphRequest<TeamsMessage>(
    `/teams/${teamId}/channels/${channelId}/messages`,
    'POST',
    payload
  );
  return { ok: true, data: result };
}

/**
 * List all members of a team.
 */
export async function getTeamMembers(
  teamId: string
): Promise<TeamsApiResponse<{ members: TeamsMember[] }>> {
  const result = await graphRequest<{ value: TeamsMember[] }>(`/teams/${teamId}/members`);
  return { ok: true, data: { members: result.value ?? [] } };
}

/**
 * Schedule an online meeting (Teams meeting) for the signed-in user.
 * Uses /me/events on behalf of the calling user (delegated flow).
 *
 * Note: For app-only (client credentials), use /users/{userId}/events.
 */
export async function createMeeting(
  data: MeetingCreateData,
  userId?: string
): Promise<TeamsApiResponse<Meeting>> {
  const userPath = userId ? `/users/${userId}` : '/me';
  const payload = {
    subject: data.subject,
    start: { dateTime: data.startDateTime, timeZone: 'UTC' },
    end: { dateTime: data.endDateTime, timeZone: 'UTC' },
    attendees: data.attendees ?? [],
    isOnlineMeeting: data.isOnlineMeeting ?? true,
    onlineMeetingProvider: data.onlineMeetingProvider ?? 'teamsForBusiness',
    ...(data.location && { location: data.location }),
    ...(data.body && { body: data.body }),
  };

  const result = await graphRequest<Meeting>(`${userPath}/events`, 'POST', payload);
  return { ok: true, data: result };
}

/**
 * List all Teams the app has access to.
 */
export async function listTeams(): Promise<
  TeamsApiResponse<{ id: string; displayName: string }[]>
> {
  const result = await graphRequest<{ value: { id: string; displayName: string }[] }>(
    "/groups?$filter=resourceProvisioningOptions/Any(x:x eq 'Team')"
  );
  return { ok: true, data: result.value ?? [] };
}

/**
 * List channels within a team.
 */
export async function listChannels(
  teamId: string
): Promise<TeamsApiResponse<{ id: string; displayName: string; description?: string }[]>> {
  const result = await graphRequest<{
    value: { id: string; displayName: string; description?: string }[];
  }>(`/teams/${teamId}/channels`);
  return { ok: true, data: result.value ?? [] };
}

// ─────────────────────────────────────────────────────────────────────────────
// Default export
// ─────────────────────────────────────────────────────────────────────────────

const teamsClient = {
  sendTeamsMessage,
  getTeamMembers,
  createMeeting,
  listTeams,
  listChannels,
};

export default teamsClient;
