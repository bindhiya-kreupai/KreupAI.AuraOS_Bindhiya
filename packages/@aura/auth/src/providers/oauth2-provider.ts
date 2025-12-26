/**
 * OAuth2 Authentication Provider
 * Supports Google, Microsoft, Okta
 *
 * @module @aura/auth
 */

export interface OAuth2Config {
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  redirectUri: string;
  scope: string[];
}

export interface OAuth2User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  emailVerified: boolean;
}

export interface OAuth2Tokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
  scope?: string;
}

export class OAuth2Provider {
  constructor(
    private provider: string,
    private config: OAuth2Config
  ) {}

  /**
   * Generate authorization URL
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scope.join(' '),
      state,
      access_type: 'offline',
      prompt: 'consent',
    });

    return `${this.config.authorizationUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<OAuth2Tokens> {
    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to exchange code for tokens: ${error}`);
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      scope: data.scope,
    };
  }

  /**
   * Get user information using access token
   */
  async getUserInfo(accessToken: string): Promise<OAuth2User> {
    const response = await fetch(this.config.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    const data = await response.json();

    // Normalize user data based on provider
    return this.normalizeUserInfo(data);
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<OAuth2Tokens> {
    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
    };
  }

  /**
   * Normalize user info from different providers
   */
  private normalizeUserInfo(data: any): OAuth2User {
    switch (this.provider) {
      case 'google':
        return {
          id: data.sub,
          email: data.email,
          name: data.name,
          picture: data.picture,
          emailVerified: data.email_verified,
        };

      case 'microsoft':
        return {
          id: data.id || data.oid,
          email: data.email || data.userPrincipalName,
          name: data.displayName,
          picture: data.picture,
          emailVerified: true,
        };

      case 'okta':
        return {
          id: data.sub,
          email: data.email,
          name: data.name,
          picture: data.picture,
          emailVerified: data.email_verified,
        };

      default:
        throw new Error(`Unknown provider: ${this.provider}`);
    }
  }
}

/**
 * Google OAuth2 Provider
 */
export function createGoogleProvider(): OAuth2Provider {
  return new OAuth2Provider('google', {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`,
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
  });
}

/**
 * Microsoft OAuth2 Provider
 */
export function createMicrosoftProvider(): OAuth2Provider {
  const tenantId = process.env.AZURE_AD_TENANT_ID || 'common';

  return new OAuth2Provider('microsoft', {
    clientId: process.env.AZURE_AD_CLIENT_ID!,
    clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
    authorizationUrl: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`,
    tokenUrl: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/microsoft`,
    scope: ['openid', 'profile', 'email', 'User.Read'],
  });
}

/**
 * Okta OAuth2 Provider
 */
export function createOktaProvider(): OAuth2Provider {
  const domain = process.env.OKTA_DOMAIN;

  if (!domain) {
    throw new Error('OKTA_DOMAIN environment variable is required');
  }

  return new OAuth2Provider('okta', {
    clientId: process.env.OKTA_CLIENT_ID!,
    clientSecret: process.env.OKTA_CLIENT_SECRET!,
    authorizationUrl: `https://${domain}/oauth2/v1/authorize`,
    tokenUrl: `https://${domain}/oauth2/v1/token`,
    userInfoUrl: `https://${domain}/oauth2/v1/userinfo`,
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/okta`,
    scope: ['openid', 'profile', 'email'],
  });
}
