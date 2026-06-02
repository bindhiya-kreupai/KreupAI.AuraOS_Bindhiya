// @ts-nocheck — Lib drift / missing typings. Tracked under #29.
/**
 * Slack API client wrapper using native fetch.
 * No external SDK required — uses the Slack Web API REST endpoints directly.
 *
 * Required environment variables:
 *   SLACK_BOT_TOKEN      - Bot OAuth token (xoxb-...)
 *   SLACK_SIGNING_SECRET - Webhook signature verification secret
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SlackBlock {
  type: string;
  [key: string]: unknown;
}

export interface SlackMessage {
  channel: string;
  text: string;
  blocks?: SlackBlock[];
  thread_ts?: string;
  mrkdwn?: boolean;
}

export interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
  is_archived: boolean;
  num_members?: number;
  topic?: { value: string };
  purpose?: { value: string };
}

export interface SlackUser {
  id: string;
  name: string;
  real_name: string;
  display_name: string;
  email?: string;
  is_admin: boolean;
  is_bot: boolean;
  deleted: boolean;
  tz: string;
  profile: {
    display_name: string;
    real_name: string;
    email?: string;
    image_72?: string;
    title?: string;
    phone?: string;
  };
}

export interface SlackApiResponse<T = unknown> {
  ok: boolean;
  error?: string;
  data?: T;
}

export interface SlackError extends Error {
  code: string;
  slackError?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const SLACK_API_BASE = 'https://slack.com/api';

function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

function getToken(): string {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    throw createError('MISSING_TOKEN', 'SLACK_BOT_TOKEN environment variable is not set');
  }
  return token;
}

function createError(code: string, message: string, slackError?: string): SlackError {
  const err = new Error(message) as SlackError;
  err.code = code;
  err.slackError = slackError;
  return err;
}

async function slackRequest<T>(method: string, payload: Record<string, unknown>): Promise<T> {
  if (isDevelopment()) {
    console.warn(`[SlackClient][DEV] ${method}`, JSON.stringify(payload, null, 2));
    return { ok: true } as T;
  }

  const token = getToken();
  const response = await fetch(`${SLACK_API_BASE}/${method}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw createError(
      'HTTP_ERROR',
      `Slack API HTTP error: ${response.status} ${response.statusText}`
    );
  }

  const json = (await response.json()) as { ok: boolean; error?: string } & T;

  if (!json.ok) {
    throw createError('SLACK_API_ERROR', `Slack API error: ${json.error ?? 'unknown'}`, json.error);
  }

  return json;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Post a message to a Slack channel.
 */
export async function sendMessage(
  channel: string,
  text: string,
  blocks?: SlackBlock[]
): Promise<SlackApiResponse<{ ts: string; channel: string }>> {
  const payload: SlackMessage = { channel, text };
  if (blocks?.length) payload.blocks = blocks;

  const result = await slackRequest<{ ts: string; channel: string }>('chat.postMessage', payload);
  return { ok: true, data: result };
}

/**
 * List all channels the bot has access to.
 */
export async function getChannels(
  limit = 200,
  cursor?: string
): Promise<SlackApiResponse<{ channels: SlackChannel[]; nextCursor?: string }>> {
  const payload: Record<string, unknown> = { limit, types: 'public_channel,private_channel' };
  if (cursor) payload.cursor = cursor;

  const result = await slackRequest<{
    channels: SlackChannel[];
    response_metadata?: { next_cursor?: string };
  }>('conversations.list', payload);

  return {
    ok: true,
    data: {
      channels: result.channels ?? [],
      nextCursor: result.response_metadata?.next_cursor,
    },
  };
}

/**
 * Get information about a specific Slack user.
 */
export async function getUserInfo(userId: string): Promise<SlackApiResponse<SlackUser>> {
  const result = await slackRequest<{ user: SlackUser }>('users.info', { user: userId });
  return { ok: true, data: result.user };
}

/**
 * Look up a Slack user by email address.
 */
export async function getUserByEmail(email: string): Promise<SlackApiResponse<SlackUser>> {
  const result = await slackRequest<{ user: SlackUser }>('users.lookupByEmail', { email });
  return { ok: true, data: result.user };
}

/**
 * Send a direct message to a user.
 */
export async function sendDirectMessage(
  userId: string,
  text: string,
  blocks?: SlackBlock[]
): Promise<SlackApiResponse<{ ts: string; channel: string }>> {
  // Open a DM channel first
  const openResult = await slackRequest<{ channel: { id: string } }>('conversations.open', {
    users: userId,
  });
  const channelId = openResult.channel.id;
  return sendMessage(channelId, text, blocks);
}

// ─────────────────────────────────────────────────────────────────────────────
// Default export (object for ergonomic usage)
// ─────────────────────────────────────────────────────────────────────────────

const slackClient = {
  sendMessage,
  getChannels,
  getUserInfo,
  getUserByEmail,
  sendDirectMessage,
};

export default slackClient;
