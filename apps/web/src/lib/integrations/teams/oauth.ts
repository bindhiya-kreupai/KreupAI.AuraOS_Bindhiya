const AZURE_CLIENT_ID = process.env.AZURE_CLIENT_ID || '';
const AZURE_CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET || '';
const AZURE_TENANT_ID = process.env.AZURE_TENANT_ID || 'common';
const AZURE_REDIRECT_URI = process.env.AZURE_REDIRECT_URI || '';

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
  const params = new URLSearchParams({
    client_id: AZURE_CLIENT_ID,
    response_type: 'code',
    redirect_uri: AZURE_REDIRECT_URI,
    scope: SCOPES,
    state,
    response_mode: 'query',
  });
  return `https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/authorize?${params.toString()}`;
}

export async function exchangeTeamsCode(code: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const response = await fetch(`https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: AZURE_CLIENT_ID,
      client_secret: AZURE_CLIENT_SECRET,
      code,
      redirect_uri: AZURE_REDIRECT_URI,
      grant_type: 'authorization_code',
      scope: SCOPES,
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error_description || 'Azure AD OAuth failed');
  return { accessToken: data.access_token, refreshToken: data.refresh_token, expiresIn: data.expires_in };
}

export async function refreshTeamsToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const response = await fetch(`https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: AZURE_CLIENT_ID,
      client_secret: AZURE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      scope: SCOPES,
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error_description || 'Token refresh failed');
  return { accessToken: data.access_token, refreshToken: data.refresh_token, expiresIn: data.expires_in };
}
