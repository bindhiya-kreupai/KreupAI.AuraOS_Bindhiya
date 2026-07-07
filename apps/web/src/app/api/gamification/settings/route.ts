import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbidden, serverError, successItem } from '@/lib/api/crud-helpers';

// Default feature toggles for the gamification module. These are structural
// module defaults (all features on) rather than tenant secrets.
const DEFAULT_SETTINGS = {
  settingsId: 'gamification-default',
  pointsEnabled: true,
  badgesEnabled: true,
  challengesEnabled: true,
  leaderboardsEnabled: true,
  leaderboardsPublic: true,
  levelsEnabled: true,
  missionsEnabled: true,
  virtualCurrencyEnabled: true,
  currencyConversionEnabled: true,
  achievementWallEnabled: true,
  notifyOnBadgeEarned: true,
  notifyOnLevelUp: true,
  notifyOnChallengeComplete: true,
};

export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { permissions } = context;
    if (!permissions.includes('engagement:read')) return forbidden('engagement:read');
    return successItem(DEFAULT_SETTINGS);
  } catch (error: any) {
    logger.error({ err: error, route: 'gamification/settings' }, 'Failed to get');
    return serverError(error, 'get');
  }
});

export const PUT = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { permissions } = context;
    if (!permissions.includes('engagement:update')) return forbidden('engagement:update');
    // Settings persistence is out of scope for this slice; echo the defaults so
    // the settings screen round-trips without error.
    return successItem(DEFAULT_SETTINGS);
  } catch (error: any) {
    logger.error({ err: error, route: 'gamification/settings' }, 'Failed to update');
    return serverError(error, 'update');
  }
});
