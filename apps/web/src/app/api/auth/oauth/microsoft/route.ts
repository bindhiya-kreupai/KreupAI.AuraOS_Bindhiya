/**
 * Microsoft OAuth2 Authentication
 * Initiates Microsoft OAuth2 flow using @aura/auth
 */

import { NextRequest, NextResponse } from 'next/server';
import { createMicrosoftProvider } from '@aura/auth';
import { oauth2StateService } from '@/lib/auth/oauth-state.service';
import { logger } from '@/lib/logger';

/**
 * GET /api/auth/oauth/microsoft
 * Redirect user to Microsoft OAuth2 authorization page
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const redirectUrl = searchParams.get('redirect') || '/dashboard';

    // Create Microsoft OAuth2 provider
    const provider = createMicrosoftProvider();

    // Generate and store state for CSRF protection
    const state = await oauth2StateService.generateState('microsoft', redirectUrl);

    // Get authorization URL
    const authUrl = provider.getAuthorizationUrl(state);

    logger.info('Redirecting to Microsoft OAuth2 authorization');

    // Redirect to Microsoft
    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    logger.error({ error }, 'Error initiating Microsoft OAuth2 flow');

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initiate Microsoft authentication',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
