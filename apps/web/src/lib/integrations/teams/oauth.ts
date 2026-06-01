function requireAzureConfig() {
  const missing: string[] = [];
  if (!process.env.AZURE_CLIENT_ID) missing.push('AZURE_CLIENT_ID');
  if (!process.env.AZURE_CLIENT_SECRET) missing.push('AZURE_CLIENT_SECRET');
  if (!process.env.AZURE_REDIRECT_URI) missing.push('AZURE_REDIRECT_URI');
  if (missing.length > 0) {
    throw new Error(
      `Microsoft Teams integration is not configured. Missing env vars: ${missing.join(', ')}`
    );
  }
  return {
    clientId: process.env.AZURE_CLIENT_ID!,
    clientSecret: process.env.AZURE_CLIENT_SECRET!,
    tenantId: process.env.AZURE_TENANT_ID || 'common',
    redirectUri: process.env.AZURE_REDIRECT_URI!,
  };
}

const SCOPES = [
  'openid',
  'profile',
  'email',
  'User.Read',
  'Team.ReadBasic.All',
  'Channel.ReadBasic.All',
  'ChannelMessage.Send',
  'Chat.ReadWrite',
].join(' ');

export function getTeamsAuthUrl(state: string): string {
  const cfg = requireAzureConfig();
  const params = new URLSearchParams({
    client_id: cfg.clientId,
    response_type: 'code',
    redirect_uri: cfg.redirectUri,
    scope: SCOPES,
    state,
    response_mode: 'query',
  });
  return `https://login.microsoftonline.com/${cfg.tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
}

export async function exchangeTeamsCode(
  code: string
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const cfg = requireAzureConfig();
  const response = await fetch(
    `https://login.microsoftonline.com/${cfg.tenantId}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
        code,
        redirect_uri: cfg.redirectUri,
        grant_type: 'authorization_code',
        scope: SCOPES,
      }),
    }
  );
  const data = await response.json();
  if (data.error) throw new Error(data.error_description || 'Azure AD OAuth failed');
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

export async function refreshTeamsToken(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const cfg = requireAzureConfig();
  const response = await fetch(
    `https://login.microsoftonline.com/${cfg.tenantId}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
        scope: SCOPES,
      }),
    }
  );
  const data = await response.json();
  if (data.error) throw new Error(data.error_description || 'Token refresh failed');
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}
