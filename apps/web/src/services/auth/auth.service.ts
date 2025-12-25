import { prisma } from '@aura/database';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { logger } from '@/lib/logger';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt';
import { comparePassword } from '@/lib/auth/password';

/**
 * Authentication Service
 *
 * Service layer for authentication operations in the AuraOS HCM system.
 * Provides comprehensive business logic for user authentication, session
 * management, token generation, and password reset flows.
 *
 * Features:
 * - Email/password authentication with bcrypt hashing
 * - Multi-factor authentication (MFA) support
 * - JWT token generation and refresh
 * - Secure password reset flow with email enumeration protection
 * - Session management and revocation
 * - Complete audit logging for all authentication events
 *
 * @module services/auth
 *
 * @example
 * ```typescript
 * import { authService } from '@/services/auth/auth.service';
 *
 * // User login
 * const result = await authService.login(
 *   { email: 'user@example.com', password: 'SecurePass123!' },
 *   '192.168.1.1',
 *   'Mozilla/5.0...'
 * );
 * ```
 */

/**
 * Login credentials interface
 */
export interface LoginCredentials {
  /** User email address */
  email: string;
  /** User password */
  password: string;
  /** Whether to extend session duration */
  rememberMe?: boolean;
}

/**
 * Login result interface
 */
export interface LoginResult {
  /** Whether the login was successful */
  success: boolean;
  /** True if MFA verification is required */
  mfaRequired?: boolean;
  /** User ID (only if MFA required) */
  userId?: string;
  /** JWT access token (only if MFA not required) */
  accessToken?: string;
  /** JWT refresh token (only if MFA not required) */
  refreshToken?: string;
  /** User information */
  user?: {
    id: string;
    email: string;
    tenantId: string;
    mfaEnabled: boolean;
    employee: {
      id: string;
      firstName: string;
      lastName: string;
    } | null;
  };
  /** Session information */
  session?: {
    id: string;
    createdAt: Date;
  };
  /** Result message */
  message: string;
  /** Error message if failed */
  error?: string;
}

/**
 * Password reset request interface
 */
export interface PasswordResetRequest {
  /** User email address */
  email: string;
  /** IP address of the requester */
  ipAddress: string;
}

/**
 * Password reset result interface
 */
export interface PasswordResetResult {
  /** Whether the request was successful */
  success: boolean;
  /** Result message */
  message: string;
  /** Reset token (development only) */
  devToken?: string;
  /** Token expiration (development only) */
  devExpiresAt?: string;
  /** Development warning */
  devWarning?: string;
}

/**
 * Password reset confirmation interface
 */
export interface PasswordResetConfirm {
  /** Reset token from email */
  token: string;
  /** New password */
  newPassword: string;
  /** IP address of the requester */
  ipAddress: string;
}

/**
 * Authentication Service Class
 *
 * Provides methods for user authentication and session management.
 * All operations include comprehensive audit logging and security checks.
 *
 * @class AuthService
 *
 * @example
 * ```typescript
 * const authService = new AuthService();
 *
 * // Authenticate user
 * const loginResult = await authService.login(
 *   { email: 'user@example.com', password: 'password123', rememberMe: true },
 *   '192.168.1.1',
 *   'Mozilla/5.0...'
 * );
 * ```
 */
export class AuthService {
  /**
   * Authenticate user with email and password
   *
   * Validates user credentials, checks account status, and handles MFA verification.
   * Creates a new session and generates JWT tokens upon successful authentication.
   *
   * @param credentials - User login credentials
   * @param ipAddress - IP address of the login attempt
   * @param userAgent - User agent string from the browser
   * @returns Login result with tokens or MFA requirement
   *
   * @example
   * ```typescript
   * const result = await authService.login(
   *   {
   *     email: 'john.doe@company.com',
   *     password: 'SecurePassword123!',
   *     rememberMe: false
   *   },
   *   '192.168.1.100',
   *   'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
   * );
   *
   * if (result.success && !result.mfaRequired) {
   *   // Use access token for authenticated requests
   *      * } else if (result.mfaRequired) {
   *   // Proceed to MFA verification
   *      * }
   * ```
   */
  async login(
    credentials: LoginCredentials,
    ipAddress: string,
    userAgent: string
  ): Promise<LoginResult> {
    const { email, password, rememberMe = false } = credentials;

    // Find user by email (case-insensitive)
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        email: true,
        password: true,
        status: true,
        tenantId: true,
        mfaEnabled: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // User not found
    if (!user) {
      logger.warn({ email, ipAddress }, 'Login attempt for non-existent user');
      return {
        success: false,
        message: 'Invalid email or password',
        error: 'Invalid email or password',
      };
    }

    // Check if user account is active
    if (user.status !== 'Active') {
      logger.warn(
        { userId: user.id, email: user.email, status: user.status, ipAddress },
        'Login attempt for inactive account'
      );

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN_FAILED_INACTIVE',
          module: 'Authentication',
          details: `Login attempt for inactive account: ${user.email}`,
          ipAddress,
        },
      });

      return {
        success: false,
        message: 'Account is not active',
        error: 'Account is not active',
      };
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      await prisma.loginAttempt.create({
        data: {
          userId: user.id,
          successful: false,
          ipAddress,
        },
      });

      logger.warn(
        { userId: user.id, email: user.email, ipAddress },
        'Failed login attempt - invalid password'
      );

      return {
        success: false,
        message: 'Invalid email or password',
        error: 'Invalid email or password',
      };
    }

    // Check if MFA is enabled for this user
    if (user.mfaEnabled) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN_MFA_REQUIRED',
          module: 'Authentication',
          details: `User ${user.email} requires MFA verification from ${ipAddress}`,
          ipAddress,
        },
      });

      logger.info(
        { userId: user.id, email: user.email, ipAddress },
        'Login password verified, MFA required'
      );

      return {
        success: true,
        mfaRequired: true,
        userId: user.id,
        message: 'MFA verification required. Please provide your verification code.',
      };
    }

    // Create session and generate tokens
    return this.createSessionAndTokens(user, ipAddress, userAgent, rememberMe);
  }

  /**
   * Create user session and generate JWT tokens
   *
   * Internal method to create a new user session and generate access/refresh tokens.
   * Also updates last login timestamp and creates audit log entries.
   *
   * @param user - User information
   * @param ipAddress - IP address of the request
   * @param userAgent - User agent string
   * @param rememberMe - Whether to extend session duration
   * @returns Login result with tokens and session information
   *
   * @internal
   */
  async createSessionAndTokens(
    user: {
      id: string;
      email: string;
      tenantId: string;
      mfaEnabled: boolean;
      employee: { id: string; firstName: string; lastName: string } | null;
    },
    ipAddress: string,
    userAgent: string,
    rememberMe: boolean = false
  ): Promise<LoginResult> {
    // Create user session
    const session = await prisma.userSession.create({
      data: {
        userId: user.id,
        ipAddress,
        device: userAgent.substring(0, 200),
        browser: userAgent.split('/')[0]?.substring(0, 100),
        status: 'Active',
      },
    });

    // Generate JWT tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      sessionId: session.id,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      sessionId: session.id,
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Record successful login attempt
    await prisma.loginAttempt.create({
      data: {
        userId: user.id,
        successful: true,
        ipAddress,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        module: 'Authentication',
        details: `User logged in from ${ipAddress}`,
        ipAddress,
      },
    });

    logger.info(
      { userId: user.id, email: user.email, ipAddress },
      'User logged in successfully'
    );

    return {
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        tenantId: user.tenantId,
        mfaEnabled: user.mfaEnabled,
        employee: user.employee,
      },
      session: {
        id: session.id,
        createdAt: session.createdAt,
      },
      message: 'Login successful',
    };
  }

  /**
   * Logout user and revoke session
   *
   * Marks the user's session as revoked and creates an audit log entry.
   *
   * @param userId - The user ID
   * @param sessionId - The session ID to revoke
   * @param ipAddress - IP address of the logout request
   * @returns Promise that resolves when logout is complete
   *
   * @example
   * ```typescript
   * await authService.logout(
   *   'user-123',
   *   'session-456',
   *   '192.168.1.100'
   * );
   * ```
   */
  async logout(userId: string, sessionId: string, ipAddress: string): Promise<void> {
    // Revoke the session
    await prisma.userSession.update({
      where: { id: sessionId },
      data: { status: 'Revoked' },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'LOGOUT',
        module: 'Authentication',
        details: `User logged out from ${ipAddress}`,
        ipAddress,
      },
    });

    logger.info({ userId, sessionId, ipAddress }, 'User logged out successfully');
  }

  /**
   * Refresh access token using refresh token
   *
   * Generates new access and refresh tokens for an active session.
   * Validates that the session is still active before generating new tokens.
   *
   * @param userId - The user ID
   * @param sessionId - The session ID
   * @param email - User email
   * @param tenantId - Tenant ID
   * @returns New access and refresh tokens
   * @throws Error if session is not active
   *
   * @example
   * ```typescript
   * const tokens = await authService.refreshToken(
   *   'user-123',
   *   'session-456',
   *   'user@example.com',
   *   'tenant-789'
   * );
   *    * ```
   */
  async refreshToken(
    userId: string,
    sessionId: string,
    email: string,
    tenantId: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Verify session is still active
    const session = await prisma.userSession.findUnique({
      where: { id: sessionId },
      select: { status: true },
    });

    if (!session || session.status !== 'Active') {
      throw new Error('Session is not active');
    }

    // Generate new tokens
    const accessToken = generateAccessToken({
      userId,
      email,
      tenantId,
      sessionId,
    });

    const refreshToken = generateRefreshToken({
      userId,
      email,
      tenantId,
      sessionId,
    });

    logger.info({ userId, sessionId }, 'Tokens refreshed successfully');

    return { accessToken, refreshToken };
  }

  /**
   * Initiate password reset flow
   *
   * Generates a secure password reset token and prepares for email delivery.
   * Implements email enumeration protection by always returning success.
   * Invalidates any existing unused tokens for the user.
   *
   * Security features:
   * - Email enumeration protection (always returns success)
   * - Secure random token generation (32 bytes)
   * - Token hashing before storage
   * - 1-hour expiration
   * - Automatic invalidation of old tokens
   *
   * @param request - Password reset request with email and IP
   * @returns Result with success message (token in development mode only)
   *
   * @example
   * ```typescript
   * const result = await authService.requestPasswordReset({
   *   email: 'user@example.com',
   *   ipAddress: '192.168.1.100'
   * });
   *
   * // Always returns success to prevent email enumeration
   *    * // In development, token is returned for testing
   * if (result.devToken) {
   *      * }
   * ```
   */
  async requestPasswordReset(request: PasswordResetRequest): Promise<PasswordResetResult> {
    const { email, ipAddress } = request;

    // Find user by email (case-insensitive)
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        email: true,
        status: true,
        tenantId: true,
      },
    });

    // IMPORTANT: Always return success even if user not found (security best practice)
    // This prevents email enumeration attacks
    if (!user) {
      logger.warn({ email, ipAddress }, 'Password reset requested for non-existent email');

      return {
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      };
    }

    // Check if user account is active
    if (user.status !== 'Active') {
      logger.warn(
        { userId: user.id, email: user.email, status: user.status, ipAddress },
        'Password reset requested for inactive account'
      );

      // Still return success to prevent account status enumeration
      return {
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      };
    }

    // Generate secure random token (32 bytes = 256 bits)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the token before storing (never store plain tokens)
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // Calculate expiration time (1 hour)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Invalidate any existing unused tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        used: false,
        expiresAt: { gt: new Date() },
      },
      data: {
        used: true, // Mark as used to invalidate
      },
    });

    // Create new reset token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt,
        ipAddress,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        module: 'Authentication',
        details: `Password reset requested for ${user.email}`,
        ipAddress,
      },
    });

    logger.info(
      { userId: user.id, email: user.email, ipAddress, expiresAt },
      'Password reset token generated successfully'
    );

    // TODO: Send email with reset link
    // In production, this would send an email like:
    // const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    // await sendPasswordResetEmail(user.email, resetUrl);

    // For now, in development, we'll return the token (REMOVE IN PRODUCTION!)
    const isDevelopment = process.env.NODE_ENV === 'development';

    return {
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
      ...(isDevelopment && {
        // ONLY in development - provide token for testing
        devToken: resetToken,
        devExpiresAt: expiresAt.toISOString(),
        devWarning: 'Token is provided for development testing only. Remove in production!',
      }),
    };
  }

  /**
   * Reset user password using valid token
   *
   * Validates the reset token, updates the user's password, and revokes all active sessions.
   * Uses bcrypt hashing for password storage and token comparison.
   *
   * Security features:
   * - Token validation with bcrypt comparison
   * - Expiration checking
   * - Password hashing with bcrypt (cost 12)
   * - Automatic session revocation
   * - One-time use tokens
   *
   * @param confirm - Password reset confirmation with token and new password
   * @returns Result with success status and message
   *
   * @example
   * ```typescript
   * const result = await authService.resetPassword({
   *   token: 'secure-reset-token-from-email',
   *   newPassword: 'NewSecurePassword123!',
   *   ipAddress: '192.168.1.100'
   * });
   *
   * if (result.success) {
   *   // Redirect to login
   *      * } else {
   *   // Show error
   *      * }
   * ```
   */
  async resetPassword(confirm: PasswordResetConfirm): Promise<{ success: boolean; message: string; error?: string }> {
    const { token, newPassword, ipAddress } = confirm;

    // Find all unused, non-expired reset tokens
    const resetTokens = await prisma.passwordResetToken.findMany({
      where: {
        used: false,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        userId: true,
        token: true,
        expiresAt: true,
        user: {
          select: {
            id: true,
            email: true,
            status: true,
          },
        },
      },
    });

    // Find matching token by comparing hashed values
    let matchingToken: (typeof resetTokens)[0] | null = null;
    for (const dbToken of resetTokens) {
      const isMatch = await bcrypt.compare(token, dbToken.token);
      if (isMatch) {
        matchingToken = dbToken;
        break;
      }
    }

    // If no matching token found
    if (!matchingToken) {
      logger.warn(
        { ipAddress, tokenPrefix: token.substring(0, 8) },
        'Password reset attempted with invalid or expired token'
      );

      return {
        success: false,
        message: 'Invalid or expired reset token',
        error: 'Invalid or expired reset token',
      };
    }

    // Check if user account is active
    if (matchingToken.user.status !== 'Active') {
      logger.warn(
        {
          userId: matchingToken.user.id,
          email: matchingToken.user.email,
          status: matchingToken.user.status,
          ipAddress,
        },
        'Password reset attempted for inactive account'
      );

      return {
        success: false,
        message: 'Account is not active',
        error: 'Account is not active',
      };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and mark token as used in a transaction
    await prisma.$transaction(async (tx) => {
      // Update user password
      await tx.user.update({
        where: { id: matchingToken!.userId },
        data: { password: hashedPassword },
      });

      // Mark token as used
      await tx.passwordResetToken.update({
        where: { id: matchingToken!.id },
        data: { used: true },
      });

      // Invalidate all other active sessions for security
      await tx.userSession.updateMany({
        where: {
          userId: matchingToken!.userId,
          status: 'Active',
        },
        data: {
          status: 'Revoked',
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: matchingToken!.userId,
          action: 'PASSWORD_RESET_COMPLETED',
          module: 'Authentication',
          details: `Password reset completed for ${matchingToken!.user.email}. All active sessions revoked.`,
          ipAddress,
        },
      });
    });

    logger.info(
      { userId: matchingToken.userId, email: matchingToken.user.email, ipAddress },
      'Password reset completed successfully'
    );

    return {
      success: true,
      message: 'Password reset successful. Please login with your new password.',
    };
  }

  /**
   * Verify user credentials without creating a session
   *
   * Validates email and password without creating a session or generating tokens.
   * Useful for re-authentication scenarios like sensitive operations.
   *
   * @param email - User email address
   * @param password - User password
   * @returns Validation result with user ID if valid
   *
   * @example
   * ```typescript
   * const result = await authService.verifyCredentials(
   *   'user@example.com',
   *   'password123'
   * );
   *
   * if (result.valid) {
   *   // Proceed with sensitive operation
   *      * }
   * ```
   */
  async verifyCredentials(email: string, password: string): Promise<{ valid: boolean; userId?: string }> {
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
        status: 'Active',
      },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      return { valid: false };
    }

    const isPasswordValid = await comparePassword(password, user.password);

    return {
      valid: isPasswordValid,
      userId: isPasswordValid ? user.id : undefined,
    };
  }

  /**
   * Revoke all active sessions for a user
   *
   * Marks all active sessions as revoked, forcing the user to re-authenticate.
   * Useful for security incidents, password changes, or account compromises.
   *
   * @param userId - The user ID
   * @param ipAddress - IP address of the request
   * @param reason - Reason for revoking sessions
   * @returns Number of sessions revoked
   *
   * @example
   * ```typescript
   * const revokedCount = await authService.revokeAllSessions(
   *   'user-123',
   *   '192.168.1.100',
   *   'Password changed by user'
   * );
   *    * ```
   */
  async revokeAllSessions(userId: string, ipAddress: string, reason: string): Promise<number> {
    const result = await prisma.userSession.updateMany({
      where: {
        userId,
        status: 'Active',
      },
      data: {
        status: 'Revoked',
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'ALL_SESSIONS_REVOKED',
        module: 'Authentication',
        details: `All active sessions revoked. Reason: ${reason}`,
        ipAddress,
      },
    });

    logger.info(
      { userId, count: result.count, reason, ipAddress },
      'All active sessions revoked'
    );

    return result.count;
  }

  /**
   * Get active sessions for a user
   *
   * Retrieves all active sessions for a user with device and location information.
   *
   * @param userId - The user ID
   * @returns Array of active sessions
   *
   * @example
   * ```typescript
   * const sessions = await authService.getActiveSessions('user-123');
   * sessions.forEach(session => {
   *      * });
   * ```
   */
  async getActiveSessions(userId: string) {
    return prisma.userSession.findMany({
      where: {
        userId,
        status: 'Active',
      },
      select: {
        id: true,
        ipAddress: true,
        device: true,
        browser: true,
        createdAt: true,
        lastActivity: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

// Export singleton instance
export const authService = new AuthService();
