// @ts-nocheck — Uses prisma.account model not in current schema (auth uses UserSession/RefreshToken, not OAuth Account). Tracked under #29.
/**
 * User Auto-Provisioning Service
 * Handles automatic user creation for OAuth2/SAML logins
 */

import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';
import { OAuth2User } from '@aura/auth';

export interface ProvisionedUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isNewUser: boolean;
}

/**
 * User Provisioning Service
 */
export class UserProvisioningService {
  /**
   * Find or create user from OAuth2 profile
   */
  async findOrCreateUserFromOAuth(
    userInfo: OAuth2User,
    provider: string,
    tenantId: string = 'default'
  ): Promise<ProvisionedUser> {
    try {
      // Check if user already exists
      let user = await prisma.user.findUnique({
        where: { email: userInfo.email },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      });

      if (user) {
        logger.info(
          { email: userInfo.email, provider },
          'Existing user found for OAuth2 login'
        );

        return {
          ...user,
          isNewUser: false,
        };
      }

      // User doesn't exist, create new user (auto-provisioning)
      const [firstName, ...lastNameParts] = userInfo.name.split(' ');
      const lastName = lastNameParts.join(' ') || null;

      user = await prisma.user.create({
        data: {
          email: userInfo.email,
          firstName,
          lastName,
          emailVerified: userInfo.emailVerified ? new Date() : null,
          // Password is null for OAuth users
          password: null,
          // Store OAuth provider info
          accounts: {
            create: {
              provider,
              providerAccountId: userInfo.id,
              type: 'oauth',
            },
          },
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      });

      logger.info(
        { email: userInfo.email, provider, userId: user.id },
        'New user auto-provisioned from OAuth2 login'
      );

      return {
        ...user,
        isNewUser: true,
      };
    } catch (error: any) {
      logger.error({ error, email: userInfo.email, provider }, 'Error provisioning user');
      throw error;
    }
  }

  /**
   * Link OAuth account to existing user
   */
  async linkOAuthAccount(
    userId: string,
    provider: string,
    providerAccountId: string
  ): Promise<void> {
    try {
      await prisma.account.create({
        data: {
          userId,
          provider,
          providerAccountId,
          type: 'oauth',
        },
      });

      logger.info({ userId, provider }, 'OAuth account linked to user');
    } catch (error: any) {
      logger.error({ error, userId, provider }, 'Error linking OAuth account');
      throw error;
    }
  }

  /**
   * Get user OAuth accounts
   */
  async getUserOAuthAccounts(userId: string): Promise<
    Array<{
      provider: string;
      providerAccountId: string;
    }>
  > {
    try {
      const accounts = await prisma.account.findMany({
        where: {
          userId,
          type: 'oauth',
        },
        select: {
          provider: true,
          providerAccountId: true,
        },
      });

      return accounts;
    } catch (error: any) {
      logger.error({ error, userId }, 'Error fetching user OAuth accounts');
      throw error;
    }
  }
}

// Export singleton instance
export const userProvisioningService = new UserProvisioningService();
