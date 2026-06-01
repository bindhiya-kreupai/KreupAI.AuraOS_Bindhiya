/**
 * Company Service
 *
 * Service layer for company management operations in the AuraOS HCM system.
 * Provides comprehensive business logic for company CRUD operations with
 * tenant isolation, validation, and audit logging.
 *
 * @module services/company
 */

import type { Company, CompanyStatus } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();

/**
 * Service response wrapper
 */
interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

/**
 * Input for creating a new company
 */
export interface CreateCompanyInput {
  name: string;
  code: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  industry?: string;
  website?: string;
  taxId?: string;
  registrationNumber?: string;
  status?: CompanyStatus;
  tenantId: string;
}

/**
 * Input for updating an existing company
 */
export interface UpdateCompanyInput {
  id: string;
  name?: string;
  code?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  industry?: string;
  website?: string;
  taxId?: string;
  registrationNumber?: string;
  status?: CompanyStatus;
  tenantId: string;
}

/**
 * Input for listing companies with filters
 */
export interface ListCompaniesInput {
  tenantId: string;
  status?: CompanyStatus;
  industry?: string;
  country?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Company with relations
 */
export interface CompanyWithRelations extends Company {
  _count?: {
    employees?: number;
    departments?: number;
  };
}

/**
 * Company statistics
 */
export interface CompanyStats {
  totalCompanies: number;
  activeCompanies: number;
  inactiveCompanies: number;
  suspendedCompanies: number;
  companiesByIndustry: Record<string, number>;
  companiesByCountry: Record<string, number>;
  totalEmployees: number;
  totalDepartments: number;
}

/**
 * Company Service Class
 *
 * Provides methods for managing companies within a multi-tenant environment.
 * All operations enforce tenant isolation and maintain complete audit trails.
 *
 * @class CompanyService
 *
 * @example
 * ```typescript
 * const companyService = new CompanyService();
 *
 * // Create a new company
 * const result = await companyService.createCompany(
 *   {
 *     name: 'Acme Corporation',
 *     code: 'ACME',
 *     email: 'info@acme.com',
 *     tenantId: 'tenant-123',
 *   },
 *   'user-id',
 *   '192.168.1.1'
 * );
 * ```
 */
export class CompanyService {
  /**
   * Create a new company
   *
   * Validates that the company code is unique within the tenant and creates
   * the company with comprehensive audit logging.
   *
   * @param input - Company creation data
   * @param createdBy - User ID of the creator
   * @param ipAddress - IP address of the request
   * @returns Result object with success status and company data
   *
   * @example
   * ```typescript
   * const result = await companyService.createCompany(
   *   {
   *     name: 'Tech Solutions Inc',
   *     code: 'TECH',
   *     email: 'contact@techsolutions.com',
   *     industry: 'Technology',
   *     country: 'USA',
   *     tenantId: 'tenant-123',
   *   },
   *   'user-789',
   *   '192.168.1.1'
   * );
   * ```
   */
  async createCompany(
    input: CreateCompanyInput,
    createdBy: string,
    ipAddress: string
  ): Promise<ServiceResult<Company>> {
    try {
      // Validate required fields
      if (!input.name || !input.code || !input.tenantId) {
        return {
          success: false,
          error: 'Missing required fields: name, code, and tenantId are required',
        };
      }

      // Validate company code format (alphanumeric and underscores only)
      const codeRegex = /^[A-Z0-9_]+$/;
      if (!codeRegex.test(input.code)) {
        return {
          success: false,
          error: 'Company code must contain only uppercase letters, numbers, and underscores',
        };
      }

      // Check if company code already exists in this tenant
      const existingCompany = await prisma.company.findFirst({
        where: {
          code: input.code,
          tenantId: input.tenantId,
        },
      });

      if (existingCompany) {
        logger.warn(
          {
            code: input.code,
            tenantId: input.tenantId,
          },
          'Attempted to create company with duplicate code'
        );

        return {
          success: false,
          error: `A company with code '${input.code}' already exists in this tenant`,
        };
      }

      // Validate email format if provided
      if (input.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!input.email.match(emailRegex)) {
          return {
            success: false,
            error: 'Invalid email format',
          };
        }
      }

      // Create the company
      const company = await prisma.company.create({
        data: {
          name: input.name,
          code: input.code,
          email: input.email,
          phoneNumber: input.phoneNumber,
          address: input.address,
          city: input.city,
          state: input.state,
          postalCode: input.postalCode,
          country: input.country,
          industry: input.industry,
          website: input.website,
          taxId: input.taxId,
          registrationNumber: input.registrationNumber,
          status: input.status || 'Active',
          tenantId: input.tenantId,
        },
      });

      // Create audit log entry
      await prisma.auditLog.create({
        data: {
          userId: createdBy,
          action: 'COMPANY_CREATED',
          module: 'Company Management',
          details: `Created company: ${company.name} (${company.code})`,
          ipAddress,
        },
      });

      logger.info(
        {
          companyId: company.id,
          companyName: company.name,
          companyCode: company.code,
          createdBy,
          tenantId: input.tenantId,
        },
        'Company created successfully'
      );

      return {
        success: true,
        data: company,
      };
    } catch (error) {
      logger.error(
        {
          error,
          input,
          createdBy,
        },
        'Failed to create company'
      );

      return {
        success: false,
        error: 'An error occurred while creating the company',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get a company by ID
   *
   * Retrieves a company with optional relations, enforcing tenant isolation.
   *
   * @param companyId - The company ID
   * @param tenantId - The tenant ID for isolation
   * @param includeRelations - Whether to include employee and department counts
   * @returns The company if found and belongs to the tenant, null otherwise
   *
   * @example
   * ```typescript
   * const company = await companyService.getCompanyById(
   *   'company-123',
   *   'tenant-456',
   *   true
   * );
   * ```
   */
  async getCompanyById(
    companyId: string,
    tenantId: string,
    includeRelations = false
  ): Promise<CompanyWithRelations | null> {
    try {
      const company = await prisma.company.findFirst({
        where: {
          id: companyId,
          tenantId,
        },
        include: includeRelations
          ? {
              _count: {
                select: {
                  employees: true,
                  departments: true,
                },
              },
            }
          : undefined,
      });

      if (!company) {
        logger.warn(
          {
            companyId,
            tenantId,
          },
          'Company not found or access denied'
        );
        return null;
      }

      return company;
    } catch (error) {
      logger.error(
        {
          error,
          companyId,
          tenantId,
        },
        'Failed to retrieve company'
      );
      return null;
    }
  }

  /**
   * Get a company by code
   *
   * Retrieves a company by its unique code within a tenant.
   *
   * @param code - The company code
   * @param tenantId - The tenant ID for isolation
   * @param includeRelations - Whether to include employee and department counts
   * @returns The company if found, null otherwise
   *
   * @example
   * ```typescript
   * const company = await companyService.getCompanyByCode(
   *   'ACME',
   *   'tenant-123'
   * );
   * ```
   */
  async getCompanyByCode(
    code: string,
    tenantId: string,
    includeRelations = false
  ): Promise<CompanyWithRelations | null> {
    try {
      const company = await prisma.company.findFirst({
        where: {
          code,
          tenantId,
        },
        include: includeRelations
          ? {
              _count: {
                select: {
                  employees: true,
                  departments: true,
                },
              },
            }
          : undefined,
      });

      return company;
    } catch (error) {
      logger.error(
        {
          error,
          code,
          tenantId,
        },
        'Failed to retrieve company by code'
      );
      return null;
    }
  }

  /**
   * List companies with filters and pagination
   *
   * Retrieves companies based on search criteria with pagination support.
   * All results are scoped to the specified tenant.
   *
   * @param input - Filter and pagination parameters
   * @returns Paginated list of companies
   *
   * @example
   * ```typescript
   * const result = await companyService.listCompanies({
   *   tenantId: 'tenant-123',
   *   status: 'Active',
   *   industry: 'Technology',
   *   search: 'acme',
   *   page: 1,
   *   limit: 20,
   *   sortBy: 'name',
   *   sortOrder: 'asc',
   * });
   * ```
   */
  async listCompanies(input: ListCompaniesInput): Promise<
    ServiceResult<{
      companies: CompanyWithRelations[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>
  > {
    try {
      const {
        tenantId,
        status,
        industry,
        country,
        search,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = input;

      // Build where clause
      const where: any = {
        tenantId,
      };

      if (status) {
        where.status = status;
      }

      if (industry) {
        where.industry = industry;
      }

      if (country) {
        where.country = country;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Count total matching records
      const total = await prisma.company.count({ where });

      // Fetch paginated results
      const companies = await prisma.company.findMany({
        where,
        include: {
          _count: {
            select: {
              employees: true,
              departments: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: {
          companies,
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        },
      };
    } catch (error) {
      logger.error(
        {
          error,
          input,
        },
        'Failed to list companies'
      );

      return {
        success: false,
        error: 'An error occurred while listing companies',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update a company
   *
   * Updates company information with validation and audit logging.
   *
   * @param input - Update data including company ID
   * @param updatedBy - User ID of the updater
   * @param ipAddress - IP address of the request
   * @returns Result object with success status and updated company data
   *
   * @example
   * ```typescript
   * const result = await companyService.updateCompany(
   *   {
   *     id: 'company-123',
   *     name: 'Acme Corporation Ltd',
   *     status: 'Active',
   *     tenantId: 'tenant-456',
   *   },
   *   'user-789',
   *   '192.168.1.1'
   * );
   * ```
   */
  async updateCompany(
    input: UpdateCompanyInput,
    updatedBy: string,
    ipAddress: string
  ): Promise<ServiceResult<Company>> {
    try {
      const { id, tenantId, ...updateData } = input;

      // Check if company exists and belongs to tenant
      const existingCompany = await this.getCompanyById(id, tenantId);

      if (!existingCompany) {
        return {
          success: false,
          error: 'Company not found or access denied',
        };
      }

      // If updating code, check for uniqueness
      if (updateData.code && updateData.code !== existingCompany.code) {
        // Validate code format
        const codeRegex = /^[A-Z0-9_]+$/;
        if (!codeRegex.test(updateData.code)) {
          return {
            success: false,
            error: 'Company code must contain only uppercase letters, numbers, and underscores',
          };
        }

        const duplicateCode = await prisma.company.findFirst({
          where: {
            code: updateData.code,
            tenantId,
            id: { not: id },
          },
        });

        if (duplicateCode) {
          return {
            success: false,
            error: `A company with code '${updateData.code}' already exists in this tenant`,
          };
        }
      }

      // Validate email format if updating
      if (updateData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!updateData.email.match(emailRegex)) {
          return {
            success: false,
            error: 'Invalid email format',
          };
        }
      }

      // Update the company
      const updatedCompany = await prisma.company.update({
        where: { id },
        data: updateData,
      });

      // Create audit log entry
      await prisma.auditLog.create({
        data: {
          userId: updatedBy,
          action: 'COMPANY_UPDATED',
          module: 'Company Management',
          details: `Updated company: ${updatedCompany.name} (${updatedCompany.code})`,
          ipAddress,
        },
      });

      logger.info(
        {
          companyId: id,
          updatedBy,
          changes: Object.keys(updateData),
        },
        'Company updated successfully'
      );

      return {
        success: true,
        data: updatedCompany,
      };
    } catch (error) {
      logger.error(
        {
          error,
          input,
          updatedBy,
        },
        'Failed to update company'
      );

      return {
        success: false,
        error: 'An error occurred while updating the company',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete a company (soft delete)
   *
   * Marks a company as inactive rather than permanently deleting it.
   * Prevents deletion if the company has active employees or departments.
   *
   * @param companyId - The company ID to delete
   * @param tenantId - The tenant ID for isolation
   * @param deletedBy - User ID of the deleter
   * @param ipAddress - IP address of the request
   * @param force - If true, allows deletion even with employees/departments
   * @returns Result object with success status
   *
   * @example
   * ```typescript
   * const result = await companyService.deleteCompany(
   *   'company-123',
   *   'tenant-456',
   *   'user-789',
   *   '192.168.1.1',
   *   false
   * );
   * ```
   */
  async deleteCompany(
    companyId: string,
    tenantId: string,
    deletedBy: string,
    ipAddress: string,
    force = false
  ): Promise<ServiceResult> {
    try {
      // Check if company exists and belongs to tenant
      const company = await this.getCompanyById(companyId, tenantId, true);

      if (!company) {
        return {
          success: false,
          error: 'Company not found or access denied',
        };
      }

      // Check if company has employees
      if (!force && company._count && company._count.employees > 0) {
        return {
          success: false,
          error: `Cannot delete company with ${company._count.employees} active employees. Transfer or remove employees first, or use force delete.`,
        };
      }

      // Check if company has departments
      if (!force && company._count && company._count.departments > 0) {
        return {
          success: false,
          error: `Cannot delete company with ${company._count.departments} active departments. Remove departments first, or use force delete.`,
        };
      }

      // Soft delete: set status to Inactive
      await prisma.company.update({
        where: { id: companyId },
        data: { status: 'Inactive' },
      });

      // Create audit log entry
      await prisma.auditLog.create({
        data: {
          userId: deletedBy,
          action: 'COMPANY_DELETED',
          module: 'Company Management',
          details: `Deleted (deactivated) company: ${company.name} (${company.code})${force ? ' - FORCED' : ''}`,
          ipAddress,
        },
      });

      logger.info(
        {
          companyId,
          companyName: company.name,
          deletedBy,
          force,
        },
        'Company deleted (soft delete)'
      );

      return {
        success: true,
        data: {
          message: 'Company successfully deactivated',
        },
      };
    } catch (error) {
      logger.error(
        {
          error,
          companyId,
          tenantId,
          deletedBy,
        },
        'Failed to delete company'
      );

      return {
        success: false,
        error: 'An error occurred while deleting the company',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get company statistics
   *
   * Retrieves aggregated statistics for companies within a tenant.
   *
   * @param tenantId - The tenant ID
   * @returns Company statistics
   *
   * @example
   * ```typescript
   * const stats = await companyService.getCompanyStats('tenant-123');
   * ```
   */
  async getCompanyStats(tenantId: string): Promise<ServiceResult<CompanyStats>> {
    try {
      // Get all companies for this tenant
      const companies = await prisma.company.findMany({
        where: { tenantId },
        include: {
          _count: {
            select: {
              employees: true,
              departments: true,
            },
          },
        },
      });

      const stats: CompanyStats = {
        totalCompanies: companies.length,
        activeCompanies: companies.filter((c: any) => c.status === 'Active').length,
        inactiveCompanies: companies.filter((c: any) => c.status === 'Inactive').length,
        suspendedCompanies: companies.filter((c: any) => c.status === 'Suspended').length,
        companiesByIndustry: {},
        companiesByCountry: {},
        totalEmployees: 0,
        totalDepartments: 0,
      };

      // Aggregate by industry and country
      for (const company of companies) {
        if (company.industry) {
          stats.companiesByIndustry[company.industry] =
            (stats.companiesByIndustry[company.industry] || 0) + 1;
        }

        if (company.country) {
          stats.companiesByCountry[company.country] =
            (stats.companiesByCountry[company.country] || 0) + 1;
        }

        stats.totalEmployees += company._count?.employees || 0;
        stats.totalDepartments += company._count?.departments || 0;
      }

      logger.info(
        {
          tenantId,
          totalCompanies: stats.totalCompanies,
        },
        'Company statistics retrieved'
      );

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      logger.error(
        {
          error,
          tenantId,
        },
        'Failed to retrieve company statistics'
      );

      return {
        success: false,
        error: 'An error occurred while retrieving company statistics',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Activate a company
   *
   * Changes company status to Active.
   *
   * @param companyId - The company ID
   * @param tenantId - The tenant ID for isolation
   * @param activatedBy - User ID of the activator
   * @param ipAddress - IP address of the request
   * @returns Result object with success status
   *
   * @example
   * ```typescript
   * const result = await companyService.activateCompany(
   *   'company-123',
   *   'tenant-456',
   *   'user-789',
   *   '192.168.1.1'
   * );
   * ```
   */
  async activateCompany(
    companyId: string,
    tenantId: string,
    activatedBy: string,
    ipAddress: string
  ): Promise<ServiceResult<Company>> {
    try {
      const company = await this.getCompanyById(companyId, tenantId);

      if (!company) {
        return {
          success: false,
          error: 'Company not found or access denied',
        };
      }

      if (company.status === 'Active') {
        return {
          success: false,
          error: 'Company is already active',
        };
      }

      const updatedCompany = await prisma.company.update({
        where: { id: companyId },
        data: { status: 'Active' },
      });

      await prisma.auditLog.create({
        data: {
          userId: activatedBy,
          action: 'COMPANY_ACTIVATED',
          module: 'Company Management',
          details: `Activated company: ${company.name} (${company.code})`,
          ipAddress,
        },
      });

      logger.info(
        {
          companyId,
          activatedBy,
        },
        'Company activated'
      );

      return {
        success: true,
        data: updatedCompany,
      };
    } catch (error) {
      logger.error(
        {
          error,
          companyId,
          tenantId,
          activatedBy,
        },
        'Failed to activate company'
      );

      return {
        success: false,
        error: 'An error occurred while activating the company',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Suspend a company
   *
   * Changes company status to Suspended.
   *
   * @param companyId - The company ID
   * @param tenantId - The tenant ID for isolation
   * @param suspendedBy - User ID of the suspender
   * @param ipAddress - IP address of the request
   * @param reason - Reason for suspension
   * @returns Result object with success status
   *
   * @example
   * ```typescript
   * const result = await companyService.suspendCompany(
   *   'company-123',
   *   'tenant-456',
   *   'user-789',
   *   '192.168.1.1',
   *   'Non-compliance with policies'
   * );
   * ```
   */
  async suspendCompany(
    companyId: string,
    tenantId: string,
    suspendedBy: string,
    ipAddress: string,
    reason?: string
  ): Promise<ServiceResult<Company>> {
    try {
      const company = await this.getCompanyById(companyId, tenantId);

      if (!company) {
        return {
          success: false,
          error: 'Company not found or access denied',
        };
      }

      if (company.status === 'Suspended') {
        return {
          success: false,
          error: 'Company is already suspended',
        };
      }

      const updatedCompany = await prisma.company.update({
        where: { id: companyId },
        data: { status: 'Suspended' },
      });

      await prisma.auditLog.create({
        data: {
          userId: suspendedBy,
          action: 'COMPANY_SUSPENDED',
          module: 'Company Management',
          details: `Suspended company: ${company.name} (${company.code})${reason ? `. Reason: ${reason}` : ''}`,
          ipAddress,
        },
      });

      logger.info(
        {
          companyId,
          suspendedBy,
          reason,
        },
        'Company suspended'
      );

      return {
        success: true,
        data: updatedCompany,
      };
    } catch (error) {
      logger.error(
        {
          error,
          companyId,
          tenantId,
          suspendedBy,
        },
        'Failed to suspend company'
      );

      return {
        success: false,
        error: 'An error occurred while suspending the company',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export default new CompanyService();
