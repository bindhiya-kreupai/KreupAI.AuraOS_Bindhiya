/**
 * Authentication Routes
 */

import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { MFAService } from '../services/mfa.service';

const authService = new AuthService();
const tokenService = new TokenService();
const mfaService = new MFAService();

// Validation Schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  tenantId: z.string().uuid(),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

const mfaVerifySchema = z.object({
  userId: z.string().uuid(),
  token: z.string().length(6),
  tempToken: z.string(),
});

const mfaSetupSchema = z.object({
  userId: z.string().uuid(),
});

export async function authRoutes(server: FastifyInstance) {
  // Login endpoint
  server.post('/login', async (request, reply) => {
    try {
      const body = loginSchema.parse(request.body);

      const result = await authService.login(
        body.email,
        body.password,
        body.tenantId
      );

      if (result.requiresMFA) {
        return reply.status(200).send({
          requiresMFA: true,
          tempToken: result.tempToken,
          userId: result.userId,
        });
      }

      return reply.status(200).send({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
        user: result.user,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Validation Error',
          details: error.errors,
        });
      }

      if (error instanceof Error && error.message === 'Invalid credentials') {
        return reply.status(401).send({
          error: 'Authentication Failed',
          message: 'Invalid email or password',
        });
      }

      throw error;
    }
  });

  // Refresh token endpoint
  server.post('/refresh', async (request, reply) => {
    try {
      const body = refreshSchema.parse(request.body);

      const result = await tokenService.refreshAccessToken(body.refreshToken);

      return reply.status(200).send({
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Validation Error',
          details: error.errors,
        });
      }

      if (error instanceof Error && error.message === 'Invalid refresh token') {
        return reply.status(401).send({
          error: 'Authentication Failed',
          message: 'Invalid or expired refresh token',
        });
      }

      throw error;
    }
  });

  // Logout endpoint
  server.post('/logout', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return reply.status(401).send({
          error: 'Authentication Required',
          message: 'Missing or invalid authorization header',
        });
      }

      const token = authHeader.substring(7);
      await tokenService.revokeToken(token);

      return reply.status(200).send({
        message: 'Logged out successfully',
      });
    } catch (error) {
      throw error;
    }
  });

  // Get current user endpoint
  server.get('/user', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return reply.status(401).send({
          error: 'Authentication Required',
          message: 'Missing or invalid authorization header',
        });
      }

      const token = authHeader.substring(7);
      const user = await tokenService.verifyToken(token);

      return reply.status(200).send({
        user,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid token') {
        return reply.status(401).send({
          error: 'Authentication Failed',
          message: 'Invalid or expired token',
        });
      }

      throw error;
    }
  });

  // MFA Setup endpoint
  server.post('/mfa/setup', async (request, reply) => {
    try {
      const body = mfaSetupSchema.parse(request.body);

      const result = await mfaService.setupMFA(body.userId);

      return reply.status(200).send({
        secret: result.secret,
        qrCode: result.qrCode,
        backupCodes: result.backupCodes,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Validation Error',
          details: error.errors,
        });
      }

      throw error;
    }
  });

  // MFA Verify endpoint
  server.post('/mfa/verify', async (request, reply) => {
    try {
      const body = mfaVerifySchema.parse(request.body);

      const result = await mfaService.verifyMFA(
        body.userId,
        body.token,
        body.tempToken
      );

      if (!result.valid) {
        return reply.status(401).send({
          error: 'MFA Verification Failed',
          message: 'Invalid MFA token',
        });
      }

      return reply.status(200).send({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
        user: result.user,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Validation Error',
          details: error.errors,
        });
      }

      throw error;
    }
  });

  // OAuth2 callback endpoint (placeholder)
  server.post('/oauth/:provider', async (request, reply) => {
    const { provider } = request.params as { provider: string };

    return reply.status(501).send({
      message: `OAuth2 ${provider} integration coming soon`,
    });
  });

  // SAML login endpoint (placeholder)
  server.post('/saml/login', async (request, reply) => {
    return reply.status(501).send({
      message: 'SAML integration coming soon',
    });
  });
}
