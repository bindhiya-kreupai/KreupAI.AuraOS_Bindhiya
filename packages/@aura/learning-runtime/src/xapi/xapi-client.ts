/**
 * @module xAPIClient
 * @description Experience API (xAPI / Tin Can) client for sending statements
 *              to a Learning Record Store (LRS) and managing state documents.
 */

import { v4 as uuidv4 } from 'uuid';

// ── xAPI Types ─────────────────────────────────────────────────────────────

export interface xAPIAgent {
  objectType?: 'Agent' | 'Group';
  name?: string;
  mbox?: string;            // mailto:email
  mbox_sha1sum?: string;
  openid?: string;
  account?: {
    homePage: string;
    name: string;
  };
}

export interface xAPIVerb {
  id: string;               // IRI
  display: Record<string, string>; // lang-tag → label
}

export interface xAPIActivity {
  objectType?: 'Activity';
  id: string;               // IRI
  definition?: {
    name?: Record<string, string>;
    description?: Record<string, string>;
    type?: string;
    moreInfo?: string;
    extensions?: Record<string, unknown>;
  };
}

export interface xAPIResult {
  score?: {
    scaled?: number;        // [-1, 1]
    raw?: number;
    min?: number;
    max?: number;
  };
  success?: boolean;
  completion?: boolean;
  response?: string;
  duration?: string;        // ISO 8601 duration
  extensions?: Record<string, unknown>;
}

export interface xAPIContext {
  registration?: string;    // UUID
  instructor?: xAPIAgent;
  team?: xAPIAgent;
  contextActivities?: {
    parent?: xAPIActivity[];
    grouping?: xAPIActivity[];
    category?: xAPIActivity[];
    other?: xAPIActivity[];
  };
  language?: string;
  statement?: { objectType: 'StatementRef'; id: string };
  extensions?: Record<string, unknown>;
}

export interface xAPIStatement {
  id?: string;              // UUID
  actor: xAPIAgent;
  verb: xAPIVerb;
  object: xAPIActivity;
  result?: xAPIResult;
  context?: xAPIContext;
  timestamp?: string;       // ISO 8601
  stored?: string;
  authority?: xAPIAgent;
  version?: string;
}

export interface xAPIStatementsResponse {
  statements: xAPIStatement[];
  more?: string;
}

export interface xAPIStatementQuery {
  agent?: xAPIAgent;
  verb?: string;
  activity?: string;
  registration?: string;
  since?: string;
  until?: string;
  limit?: number;
  ascending?: boolean;
}

// ── Common xAPI Verbs (ADL vocabulary) ────────────────────────────────────

export const XAPI_VERBS = {
  attempted: {
    id:      'http://adlnet.gov/expapi/verbs/attempted',
    display: { 'en-US': 'attempted' },
  },
  completed: {
    id:      'http://adlnet.gov/expapi/verbs/completed',
    display: { 'en-US': 'completed' },
  },
  passed: {
    id:      'http://adlnet.gov/expapi/verbs/passed',
    display: { 'en-US': 'passed' },
  },
  failed: {
    id:      'http://adlnet.gov/expapi/verbs/failed',
    display: { 'en-US': 'failed' },
  },
  experienced: {
    id:      'http://adlnet.gov/expapi/verbs/experienced',
    display: { 'en-US': 'experienced' },
  },
  interacted: {
    id:      'http://adlnet.gov/expapi/verbs/interacted',
    display: { 'en-US': 'interacted' },
  },
  progressed: {
    id:      'http://adlnet.gov/expapi/verbs/progressed',
    display: { 'en-US': 'progressed' },
  },
  launched: {
    id:      'http://adlnet.gov/expapi/verbs/launched',
    display: { 'en-US': 'launched' },
  },
  answered: {
    id:      'http://adlnet.gov/expapi/verbs/answered',
    display: { 'en-US': 'answered' },
  },
} as const satisfies Record<string, xAPIVerb>;

// ── xAPI Client ────────────────────────────────────────────────────────────

export interface xAPIClientConfig {
  endpoint: string;         // LRS endpoint URL
  username?: string;        // Basic auth username
  password?: string;        // Basic auth password
  token?: string;           // Bearer token (alternative to basic auth)
  version?: string;         // xAPI version, default '1.0.3'
  timeout?: number;         // Request timeout ms, default 10000
}

export class xAPIClient {
  private readonly _endpoint: string;
  private readonly _headers: Record<string, string>;
  private readonly _timeout: number;
  private readonly _version: string;

  constructor(config: xAPIClientConfig) {
    this._endpoint = config.endpoint.replace(/\/$/, '');
    this._version  = config.version ?? '1.0.3';
    this._timeout  = config.timeout ?? 10_000;

    this._headers = {
      'Content-Type': 'application/json',
      'X-Experience-API-Version': this._version,
    };

    if (config.token) {
      this._headers['Authorization'] = `Bearer ${config.token}`;
    } else if (config.username && config.password) {
      const encoded = Buffer.from(`${config.username}:${config.password}`).toString('base64');
      this._headers['Authorization'] = `Basic ${encoded}`;
    }
  }

  // ── Statements API ─────────────────────────────────────────────────────

  /**
   * Send a single xAPI statement to the LRS.
   * Automatically assigns a UUID and timestamp if not provided.
   */
  async sendStatement(statement: xAPIStatement): Promise<string> {
    const payload: xAPIStatement = {
      id:        statement.id        ?? uuidv4(),
      timestamp: statement.timestamp ?? new Date().toISOString(),
      version:   statement.version   ?? this._version,
      ...statement,
    };

    const response = await this._request('PUT', `/statements?statementId=${payload.id}`, payload);
    return payload.id!;
  }

  /**
   * Send multiple xAPI statements in a single batch.
   */
  async sendStatements(statements: xAPIStatement[]): Promise<string[]> {
    const payload = statements.map((s) => ({
      id:        s.id        ?? uuidv4(),
      timestamp: s.timestamp ?? new Date().toISOString(),
      version:   s.version   ?? this._version,
      ...s,
    }));

    await this._request('POST', '/statements', payload);
    return payload.map((s) => s.id!);
  }

  /**
   * Query statements from the LRS.
   */
  async getStatements(query: xAPIStatementQuery = {}): Promise<xAPIStatementsResponse> {
    const params = new URLSearchParams();

    if (query.agent)        params.set('agent', JSON.stringify(query.agent));
    if (query.verb)         params.set('verb', query.verb);
    if (query.activity)     params.set('activity', query.activity);
    if (query.registration) params.set('registration', query.registration);
    if (query.since)        params.set('since', query.since);
    if (query.until)        params.set('until', query.until);
    if (query.limit)        params.set('limit', String(query.limit));
    if (query.ascending)    params.set('ascending', String(query.ascending));

    const qs = params.toString();
    const path = `/statements${qs ? `?${qs}` : ''}`;
    return this._request<xAPIStatementsResponse>('GET', path);
  }

  // ── State API ──────────────────────────────────────────────────────────

  /**
   * Retrieve a state document from the LRS.
   */
  async getState<T = unknown>(
    activityId: string,
    agent: xAPIAgent,
    stateId: string,
    registration?: string,
  ): Promise<T | null> {
    const params = new URLSearchParams({
      activityId,
      agent: JSON.stringify(agent),
      stateId,
    });
    if (registration) params.set('registration', registration);

    try {
      return await this._request<T>('GET', `/activities/state?${params.toString()}`);
    } catch {
      return null;
    }
  }

  /**
   * Store a state document to the LRS.
   */
  async setState<T = unknown>(
    activityId: string,
    agent: xAPIAgent,
    stateId: string,
    state: T,
    registration?: string,
  ): Promise<void> {
    const params = new URLSearchParams({
      activityId,
      agent: JSON.stringify(agent),
      stateId,
    });
    if (registration) params.set('registration', registration);

    await this._request('PUT', `/activities/state?${params.toString()}`, state);
  }

  /**
   * Delete a state document from the LRS.
   */
  async deleteState(
    activityId: string,
    agent: xAPIAgent,
    stateId: string,
    registration?: string,
  ): Promise<void> {
    const params = new URLSearchParams({
      activityId,
      agent: JSON.stringify(agent),
      stateId,
    });
    if (registration) params.set('registration', registration);

    await this._request('DELETE', `/activities/state?${params.toString()}`);
  }

  // ── Statement Builder ──────────────────────────────────────────────────

  /**
   * Convenience builder for well-formed xAPI statements.
   */
  buildStatement(
    actor:   xAPIAgent,
    verb:    xAPIVerb,
    object:  xAPIActivity,
    result?: xAPIResult,
    context?: xAPIContext,
  ): xAPIStatement {
    const statement: xAPIStatement = {
      id:        uuidv4(),
      timestamp: new Date().toISOString(),
      actor,
      verb,
      object:    { objectType: 'Activity', ...object },
    };

    if (result)  statement.result  = result;
    if (context) statement.context = context;

    return statement;
  }

  /**
   * Build and immediately send a statement.
   */
  async track(
    actor:   xAPIAgent,
    verb:    xAPIVerb,
    object:  xAPIActivity,
    result?: xAPIResult,
    context?: xAPIContext,
  ): Promise<string> {
    const statement = this.buildStatement(actor, verb, object, result, context);
    return this.sendStatement(statement);
  }

  // ── Private HTTP helper ────────────────────────────────────────────────

  private async _request<T = unknown>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const controller = new AbortController();
    const timer      = setTimeout(() => controller.abort(), this._timeout);

    try {
      const resp = await fetch(`${this._endpoint}${path}`, {
        method,
        headers: this._headers,
        body:    body !== undefined ? JSON.stringify(body) : undefined,
        signal:  controller.signal,
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        throw new Error(`xAPI LRS error ${resp.status}: ${text}`);
      }

      const contentType = resp.headers.get('content-type') ?? '';
      if (contentType.includes('application/json') && resp.status !== 204) {
        return resp.json() as Promise<T>;
      }

      return undefined as unknown as T;
    } finally {
      clearTimeout(timer);
    }
  }
}
