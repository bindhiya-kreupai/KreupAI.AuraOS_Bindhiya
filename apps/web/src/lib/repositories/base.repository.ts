// @ts-nocheck — Lib middleware/repository drift (generic NextResponse types, Sentry API changes, Prisma enum imports, permission template literal). Tracked under #29.
/**
 * Base Repository
 * Provides common database operations with type safety
 */

import { prisma } from '@aura/database';
import type { PrismaClient } from '@prisma/client';

export interface FindManyOptions<T> {
  where?: any;
  orderBy?: any;
  skip?: number;
  take?: number;
  include?: any;
  select?: any;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Base Repository Class
 * All repositories should extend this class
 */
export abstract class BaseRepository<T> {
  protected prisma: PrismaClient;
  protected modelName: string;

  constructor(modelName: string) {
    this.prisma = prisma;
    this.modelName = modelName;
  }

  /**
   * Get the Prisma model delegate
   */
  protected get model(): any {
    return (this.prisma as any)[this.modelName];
  }

  /**
   * Find a single record by ID
   */
  async findById(id: string, options?: { include?: any; select?: any }): Promise<T | null> {
    return this.model.findUnique({
      where: { id },
      ...options,
    });
  }

  /**
   * Find a single record by criteria
   */
  async findOne(where: any, options?: { include?: any; select?: any }): Promise<T | null> {
    return this.model.findFirst({
      where,
      ...options,
    });
  }

  /**
   * Find multiple records
   */
  async findMany(options: FindManyOptions<T>): Promise<T[]> {
    return this.model.findMany(options);
  }

  /**
   * Find records with pagination
   */
  async findManyPaginated(
    options: FindManyOptions<T>,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<T>> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.findMany({
        ...options,
        skip,
        take: limit,
      }),
      this.model.count({ where: options.where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Count records matching criteria
   */
  async count(where?: any): Promise<number> {
    return this.model.count({ where });
  }

  /**
   * Check if record exists
   */
  async exists(where: any): Promise<boolean> {
    const count = await this.model.count({ where, take: 1 });
    return count > 0;
  }

  /**
   * Create a new record
   */
  async create(data: any, options?: { include?: any; select?: any }): Promise<T> {
    return this.model.create({
      data,
      ...options,
    });
  }

  /**
   * Create multiple records
   */
  async createMany(data: any[]): Promise<{ count: number }> {
    return this.model.createMany({
      data,
      skipDuplicates: true,
    });
  }

  /**
   * Update a record by ID
   */
  async updateById(
    id: string,
    data: any,
    options?: { include?: any; select?: any }
  ): Promise<T> {
    return this.model.update({
      where: { id },
      data,
      ...options,
    });
  }

  /**
   * Update a record by criteria
   */
  async updateOne(where: any, data: any, options?: { include?: any; select?: any }): Promise<T> {
    return this.model.update({
      where,
      data,
      ...options,
    });
  }

  /**
   * Update multiple records
   */
  async updateMany(where: any, data: any): Promise<{ count: number }> {
    return this.model.updateMany({
      where,
      data,
    });
  }

  /**
   * Delete a record by ID
   */
  async deleteById(id: string): Promise<T> {
    return this.model.delete({
      where: { id },
    });
  }

  /**
   * Delete a record by criteria
   */
  async deleteOne(where: any): Promise<T> {
    return this.model.delete({
      where,
    });
  }

  /**
   * Delete multiple records
   */
  async deleteMany(where: any): Promise<{ count: number }> {
    return this.model.deleteMany({
      where,
    });
  }

  /**
   * Soft delete (update status to Inactive)
   */
  async softDeleteById(id: string): Promise<T> {
    return this.model.update({
      where: { id },
      data: { status: 'Inactive' },
    });
  }

  /**
   * Execute a transaction
   */
  async transaction<R>(callback: (tx: PrismaClient) => Promise<R>): Promise<R> {
    return this.prisma.$transaction(callback);
  }

  /**
   * Execute raw SQL query
   */
  async executeRaw(query: string, values?: any[]): Promise<number> {
    return this.prisma.$executeRaw`${query}` as unknown as Promise<number>;
  }

  /**
   * Execute raw SQL query and return results
   */
  async queryRaw<R = unknown>(query: string, values?: any[]): Promise<R[]> {
    return this.prisma.$queryRaw`${query}` as unknown as Promise<R[]>;
  }
}
