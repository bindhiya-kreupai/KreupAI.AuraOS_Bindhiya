/**
 * OAuth2 State Management Service
 * Handles CSRF protection for OAuth2 flows
 */

import { redis } from '@/lib/cache/redis';
import { logger } from '@/lib/logger';

const STATE_PREFIX = 'oauth:state:';
const STATE_TTL = 600; // 10 minutes

export interface OAuth2StateData {
  state: string;
  provider: string;
  redirectUrl?: string;
  tenantId?: string;
  createdAt: string;
}

/**
 * OAuth2 State Service
 */
export class OAuth2StateService {
  /**
   * Generate and store OAuth2 state
   */
  async generateState(
    provider: string,
    redirectUrl?: string,
    tenantId?: string
  ): Promise<string> {
    const state = crypto.randomUUID();

    const stateData: OAuth2StateData = {
      state,
      provider,
      redirectUrl,
      tenantId,
      createdAt: new Date().toISOString(),
    };

    const key = `${STATE_PREFIX}${state}`;
    await redis.set(key, stateData, STATE_TTL);

    logger.info({ provider, state }, 'OAuth2 state generated');

    return state;
  }

  /**
   * Verify OAuth2 state
   */
  async verifyState(state: string, provider: string): Promise<OAuth2StateData | null> {
    if (!state) {
      logger.error('No state provided for verification');
      return null;
    }

    const key = `${STATE_PREFIX}${state}`;
    const stateData = await redis.get<OAuth2StateData>(key);

    if (!stateData) {
      logger.error({ state, provider }, 'OAuth2 state not found or expired');
      return null;
    }

    if (stateData.provider !== provider) {
      logger.error(
        { state, expected: provider, actual: stateData.provider },
        'OAuth2 state provider mismatch'
      );
      return null;
    }

    // Delete state after verification (one-time use)
    await redis.delete(key);

    logger.info({ provider, state }, 'OAuth2 state verified successfully');

    return stateData;
  }

  /**
   * Delete OAuth2 state
   */
  async deleteState(state: string): Promise<void> {
    const key = `${STATE_PREFIX}${state}`;
    await redis.delete(key);
  }
}

// Export singleton instance
export const oauth2StateService = new OAuth2StateService();
