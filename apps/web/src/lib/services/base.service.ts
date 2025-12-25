import { prisma } from '@aura/database';
import type { PrismaClient, Prisma } from '@prisma/client';
import { createLogger, logServiceError, logAudit } from '@/lib/logger';
import { DatabaseError } from '@/lib/errors';

/**
 * Base Service Class
 * Provides common functionality for all service classes
 */
export abstract class BaseService {
  protected prisma: PrismaClient;
  protected logger: ReturnType<typeof createLogger>;

  constructor(serviceName: string) {
    this.prisma = prisma;
    this.logger = createLogger({ service: serviceName });
  }

  /**
   * Create audit log entry
   */
  protected async createAuditLog(params: {
    userId: string;
    action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
    module: string;
    details: string;
    ipAddress?: string;
  }) {
    try {
      // Log to application logger
      logAudit(
        params.action,
        params.module,
        params.userId,
        params.details,
        undefined,
        params.ipAddress
      );

      // Create database audit log
      return await this.prisma.auditLog.create({
        data: {
          userId: params.userId,
          action: params.action,
          module: params.module,
          details: params.details,
          ipAddress: params.ipAddress || 'unknown',
        },
      });
    } catch {
      this.logger.error({ error }, 'Failed to create audit log');
      throw new DatabaseError('Failed to create audit log', { error });
    }
  }

  /**
   * Execute a transaction with automatic rollback on error
   */
  protected async executeTransaction<T>(
    operations: (tx: Prisma.TransactionClient) => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    try {
      const result = await this.prisma.$transaction(operations);
      const duration = Date.now() - startTime;

      if (duration > 1000) {
        this.logger.warn({ duration }, `Slow transaction: ${duration}ms`);
      }

      return result;
    } catch {
      const duration = Date.now() - startTime;
      this.logger.error({ error, duration }, `Transaction failed after ${duration}ms`);
      throw new DatabaseError('Transaction failed', { error });
    }
  }

  /**
   * Build pagination metadata
   */
  protected buildPaginationMeta(total: number, page: number, limit: number) {
    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Extract IP address from request headers
   */
  protected extractIpAddress(headers: Headers): string {
    return (
      headers.get('x-forwarded-for') ||
      headers.get('x-real-ip') ||
      'unknown'
    );
  }
}

/**
 * Service Response Types
 */
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface ListOptions {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  [key: string]: any;
}
