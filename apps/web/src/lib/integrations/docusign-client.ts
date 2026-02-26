/**
 * DocuSign eSignature REST API client wrapper using native fetch.
 * No external SDK required.
 *
 * Required environment variables:
 *   DOCUSIGN_ACCOUNT_ID    - DocuSign account ID (GUID)
 *   DOCUSIGN_BASE_URL      - e.g. https://na4.docusign.net
 *   DOCUSIGN_ACCESS_TOKEN  - OAuth2 access token (or use refresh flow)
 *
 * Optional for refresh token flow:
 *   DOCUSIGN_INTEGRATION_KEY   - OAuth2 integration (client) key
 *   DOCUSIGN_SECRET_KEY        - OAuth2 secret key
 *   DOCUSIGN_REFRESH_TOKEN     - Refresh token for obtaining new access tokens
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface EnvelopeRecipientSigner {
  email: string;
  name: string;
  recipientId: string;
  routingOrder?: string;
  tabs?: EnvelopeTabs;
}

export interface EnvelopeTabs {
  signHereTabs?: Array<{
    documentId: string;
    pageNumber: string;
    xPosition: string;
    yPosition: string;
  }>;
  dateSignedTabs?: Array<{
    documentId: string;
    pageNumber: string;
    xPosition: string;
    yPosition: string;
  }>;
  textTabs?: Array<{
    documentId: string;
    pageNumber: string;
    xPosition: string;
    yPosition: string;
    tabLabel: string;
    value?: string;
  }>;
}

export interface EnvelopeDocument {
  documentBase64: string; // Base64-encoded PDF or doc
  documentId: string;
  fileExtension?: string; // pdf, docx, etc.
  name: string;
}

export interface EnvelopeCreateData {
  emailSubject: string;
  emailBlurb?: string;
  documents: EnvelopeDocument[];
  signers: EnvelopeRecipientSigner[];
  status: 'sent' | 'created'; // 'sent' to immediately send, 'created' as draft
  brandId?: string;
  expirationDate?: string; // ISO 8601
}

export interface EnvelopeStatus {
  envelopeId: string;
  status: 'sent' | 'delivered' | 'signed' | 'completed' | 'declined' | 'voided' | 'created';
  emailSubject: string;
  createdDateTime: string;
  sentDateTime?: string;
  completedDateTime?: string;
  declinedDateTime?: string;
  voidedDateTime?: string;
  voidedReason?: string;
  purgeState?: string;
  recipients?: {
    signers?: Array<{
      recipientId: string;
      name: string;
      email: string;
      status: string;
      signedDateTime?: string;
    }>;
  };
}

export interface TemplateCreateData {
  name: string;
  description?: string;
  documents: EnvelopeDocument[];
  signers?: EnvelopeRecipientSigner[];
  emailSubject?: string;
  shared?: boolean;
}

export interface Template {
  templateId: string;
  name: string;
  description?: string;
  created?: string;
  lastModified?: string;
  shared?: boolean;
  owner?: { email: string; name: string };
}

export interface DocuSignApiResponse<T = unknown> {
  ok: boolean;
  error?: string;
  data?: T;
}

export interface DocuSignError extends Error {
  code: string;
  statusCode?: number;
  errorCode?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Token management
// ─────────────────────────────────────────────────────────────────────────────

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

function createError(
  code: string,
  message: string,
  statusCode?: number,
  errorCode?: string
): DocuSignError {
  const err = new Error(message) as DocuSignError;
  err.code = code;
  err.statusCode = statusCode;
  err.errorCode = errorCode;
  return err;
}

function getConfig(): { accountId: string; baseUrl: string } {
  const accountId = process.env.DOCUSIGN_ACCOUNT_ID;
  const baseUrl = process.env.DOCUSIGN_BASE_URL;

  if (!accountId || !baseUrl) {
    throw createError(
      'MISSING_CONFIG',
      'DOCUSIGN_ACCOUNT_ID and DOCUSIGN_BASE_URL environment variables are required'
    );
  }
  return { accountId, baseUrl: baseUrl.replace(/\/$/, '') };
}

/**
 * Get an access token.
 * Tries to use the static DOCUSIGN_ACCESS_TOKEN first.
 * Falls back to refresh token flow if DOCUSIGN_REFRESH_TOKEN is set.
 */
async function getAccessToken(): Promise<string> {
  // Static token check
  const staticToken = process.env.DOCUSIGN_ACCESS_TOKEN;
  if (staticToken && (!tokenCache || tokenCache.expiresAt > Date.now() + 60_000)) {
    if (!tokenCache) {
      // Static tokens are treated as valid for 1 hour (refresh not automatic)
      tokenCache = { accessToken: staticToken, expiresAt: Date.now() + 3_600_000 };
    }
    return tokenCache.accessToken;
  }

  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) {
    return tokenCache.accessToken;
  }

  // Refresh token flow
  const refreshToken = process.env.DOCUSIGN_REFRESH_TOKEN;
  const integrationKey = process.env.DOCUSIGN_INTEGRATION_KEY;
  const secretKey = process.env.DOCUSIGN_SECRET_KEY;

  if (!refreshToken || !integrationKey || !secretKey) {
    throw createError(
      'MISSING_AUTH',
      'Either DOCUSIGN_ACCESS_TOKEN or (DOCUSIGN_REFRESH_TOKEN + DOCUSIGN_INTEGRATION_KEY + DOCUSIGN_SECRET_KEY) must be provided'
    );
  }

  const credentials = Buffer.from(`${integrationKey}:${secretKey}`).toString('base64');
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const response = await fetch('https://account.docusign.com/oauth/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw createError(
      'TOKEN_REFRESH_ERROR',
      `DocuSign token refresh failed: ${text}`,
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

async function docusignRequest<T>(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  payload?: unknown
): Promise<T> {
  if (isDevelopment()) {
    console.warn(`[DocuSignClient][DEV] ${method} ${path}`, payload ?? '');
    return {} as T;
  }

  const token = await getAccessToken();
  const { baseUrl } = getConfig();

  const init: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };

  if (payload !== undefined) {
    init.body = JSON.stringify(payload);
  }

  const response = await fetch(`${baseUrl}/restapi/v2.1${path}`, init);

  if (!response.ok) {
    let errorMessage = `DocuSign API error: ${response.status} ${response.statusText}`;
    let errorCode: string | undefined;
    try {
      const errBody = (await response.json()) as { message?: string; errorCode?: string };
      if (errBody.message) errorMessage = errBody.message;
      errorCode = errBody.errorCode;
    } catch {
      // ignore
    }
    throw createError('DOCUSIGN_API_ERROR', errorMessage, response.status, errorCode);
  }

  if (response.status === 204) return {} as T;
  return response.json() as Promise<T>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a signing envelope and optionally send it immediately.
 */
export async function createEnvelope(
  data: EnvelopeCreateData
): Promise<DocuSignApiResponse<{ envelopeId: string; status: string; uri: string }>> {
  const { accountId } = getConfig();

  const payload = {
    emailSubject: data.emailSubject,
    emailBlurb: data.emailBlurb,
    documents: data.documents,
    recipients: { signers: data.signers },
    status: data.status,
    ...(data.brandId && { brandId: data.brandId }),
    ...(data.expirationDate && { expirationDateTime: data.expirationDate }),
  };

  const result = await docusignRequest<{ envelopeId: string; status: string; uri: string }>(
    `/accounts/${accountId}/envelopes`,
    'POST',
    payload
  );

  return { ok: true, data: result };
}

/**
 * Get the status and details of an envelope.
 */
export async function getEnvelopeStatus(
  envelopeId: string
): Promise<DocuSignApiResponse<EnvelopeStatus>> {
  const { accountId } = getConfig();

  const result = await docusignRequest<EnvelopeStatus>(
    `/accounts/${accountId}/envelopes/${envelopeId}?include=recipients`
  );

  return { ok: true, data: result };
}

/**
 * Download a combined (signed) document from an envelope as a Buffer.
 */
export async function downloadSignedDocument(
  envelopeId: string,
  documentId = 'combined'
): Promise<DocuSignApiResponse<{ content: Buffer; contentType: string; filename: string }>> {
  if (isDevelopment()) {
    console.warn(`[DocuSignClient][DEV] downloadSignedDocument`, { envelopeId, documentId });
    return {
      ok: true,
      data: { content: Buffer.from(''), contentType: 'application/pdf', filename: 'mock.pdf' },
    };
  }

  const token = await getAccessToken();
  const { baseUrl, accountId } = getConfig();

  const response = await fetch(
    `${baseUrl}/restapi/v2.1/accounts/${accountId}/envelopes/${envelopeId}/documents/${documentId}`,
    {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/pdf' },
    }
  );

  if (!response.ok) {
    throw createError(
      'DOWNLOAD_ERROR',
      `Failed to download document: ${response.status}`,
      response.status
    );
  }

  const contentType = response.headers.get('Content-Type') ?? 'application/pdf';
  const disposition = response.headers.get('Content-Disposition') ?? '';
  const filenameMatch = disposition.match(/filename="?([^";]+)"?/);
  const filename = filenameMatch?.[1] ?? `envelope-${envelopeId}.pdf`;

  const arrayBuffer = await response.arrayBuffer();
  return {
    ok: true,
    data: { content: Buffer.from(arrayBuffer), contentType, filename },
  };
}

/**
 * Create a reusable signing template.
 */
export async function createTemplate(
  data: TemplateCreateData
): Promise<DocuSignApiResponse<Template>> {
  const { accountId } = getConfig();

  const payload = {
    name: data.name,
    description: data.description,
    shared: data.shared ?? false,
    documents: data.documents,
    recipients: { signers: data.signers ?? [] },
    emailSubject: data.emailSubject ?? `Please sign: ${data.name}`,
  };

  const result = await docusignRequest<Template>(
    `/accounts/${accountId}/templates`,
    'POST',
    payload
  );

  return { ok: true, data: result };
}

/**
 * List available signing templates.
 */
export async function listTemplates(
  searchText?: string,
  count = 20
): Promise<DocuSignApiResponse<Template[]>> {
  const { accountId } = getConfig();
  const params = new URLSearchParams({ count: String(count) });
  if (searchText) params.set('search_text', searchText);

  const result = await docusignRequest<{ envelopeTemplates: Template[] }>(
    `/accounts/${accountId}/templates?${params}`
  );

  return { ok: true, data: result.envelopeTemplates ?? [] };
}

/**
 * Void (cancel) an in-progress envelope.
 */
export async function voidEnvelope(
  envelopeId: string,
  voidedReason: string
): Promise<DocuSignApiResponse<void>> {
  const { accountId } = getConfig();

  await docusignRequest<void>(`/accounts/${accountId}/envelopes/${envelopeId}`, 'PUT', {
    status: 'voided',
    voidedReason,
  });

  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Default export
// ─────────────────────────────────────────────────────────────────────────────

const docusignClient = {
  createEnvelope,
  getEnvelopeStatus,
  downloadSignedDocument,
  createTemplate,
  listTemplates,
  voidEnvelope,
};

export default docusignClient;
