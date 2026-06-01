/**
 * Okta OAuth2 Authentication
 * Initiates Okta OAuth2 flow using @aura/auth
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOktaProvider } from '@aura/auth';
import { logger } from '@/lib/logger';

/**
 * GET /api/auth/oauth/okta
 * Redirect user to Okta OAuth2 authorization page
 */
export async function GET(request: NextRequest) {
  try {
    // Create Okta OAuth2 provider
    const provider = createOktaProvider();

    // Generate state for CSRF protection
    const state = crypto.randomUUID();

    // Store state in session/cookie for verification
    // TODO: Store state in session for verification in callback

    // Get authorization URL
    const authUrl = provider.getAuthorizationUrl(state);

    logger.info('Redirecting to Okta OAuth2 authorization');

    // Redirect to Okta
    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    logger.error({ error }, 'Error initiating Okta OAuth2 flow');

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initiate Okta authentication',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
