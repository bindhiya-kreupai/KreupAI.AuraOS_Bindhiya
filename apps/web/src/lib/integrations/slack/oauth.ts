function requireSlackConfig() {
  const missing: string[] = [];
  if (!process.env.SLACK_CLIENT_ID) missing.push('SLACK_CLIENT_ID');
  if (!process.env.SLACK_CLIENT_SECRET) missing.push('SLACK_CLIENT_SECRET');
  if (!process.env.SLACK_REDIRECT_URI) missing.push('SLACK_REDIRECT_URI');
  if (missing.length > 0) {
    throw new Error(`Slack integration is not configured. Missing env vars: ${missing.join(', ')}`);
  }
  return {
    clientId: process.env.SLACK_CLIENT_ID!,
    clientSecret: process.env.SLACK_CLIENT_SECRET!,
    redirectUri: process.env.SLACK_REDIRECT_URI!,
  };
}

const SCOPES = ['channels:read', 'chat:write', 'users:read', 'users:read.email', 'team:read'].join(
  ','
);

export function getSlackAuthUrl(state: string): string {
  const cfg = requireSlackConfig();
  const params = new URLSearchParams({
    client_id: cfg.clientId,
    scope: SCOPES,
    redirect_uri: cfg.redirectUri,
    state,
  });
  return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
}

export async function exchangeSlackCode(
  code: string
): Promise<{ accessToken: string; teamId: string; teamName: string }> {
  const cfg = requireSlackConfig();
  const response = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      code,
      redirect_uri: cfg.redirectUri,
    }),
  });
  const data = await response.json();
  if (!data.ok) throw new Error(data.error || 'Slack OAuth failed');
  return { accessToken: data.access_token, teamId: data.team.id, teamName: data.team.name };
}
