const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID || '';
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET || '';
const SLACK_REDIRECT_URI = process.env.SLACK_REDIRECT_URI || '';

const SCOPES = [
  'channels:read',
  'chat:write',
  'users:read',
  'users:read.email',
  'team:read',
].join(',');

export function getSlackAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: SLACK_CLIENT_ID,
    scope: SCOPES,
    redirect_uri: SLACK_REDIRECT_URI,
    state,
  });
  return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
}

export async function exchangeSlackCode(code: string): Promise<{ accessToken: string; teamId: string; teamName: string }> {
  const response = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: SLACK_CLIENT_ID,
      client_secret: SLACK_CLIENT_SECRET,
      code,
      redirect_uri: SLACK_REDIRECT_URI,
    }),
  });
  const data = await response.json();
  if (!data.ok) throw new Error(data.error || 'Slack OAuth failed');
  return { accessToken: data.access_token, teamId: data.team.id, teamName: data.team.name };
}
