/**
 * Validation Schemas
 *
 * Centralized Zod validation schemas for API requests.
 * Provides type-safe request validation with comprehensive error messages.
 *
 * @module lib/validation/schemas
 *
 * @example
 * ```typescript
 * import { loginSchema } from '@/lib/validation/schemas';
 *
 * const data = loginSchema.parse(requestBody);
 * ```
 */

import { z } from 'zod';

/**
 * Common validation patterns
 */
export const patterns = {
  /**
   * Email pattern with comprehensive validation
   */
  email: z
    .string()
    .email('Invalid email format')
    .min(3, 'Email must be at least 3 characters')
    .max(255, 'Email must not exceed 255 characters')
    .transform((email) => email.toLowerCase().trim()),

  /**
   * Password pattern with security requirements
   * - At least 8 characters
   * - At least one uppercase letter
   * - At least one lowercase letter
   * - At least one number
   * - At least one special character
   */
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),

  /**
   * UUID pattern
   */
  uuid: z.string().uuid('Invalid UUID format'),

  /**
   * Phone number pattern (international format)
   */
  phone: z
    .string()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      'Invalid phone number format. Use international format (e.g., +1234567890)'
    )
    .optional(),

  /**
   * URL pattern
   */
  url: z.string().url('Invalid URL format').optional(),

  /**
   * Date string pattern (ISO 8601)
   */
  dateString: z.string().datetime('Invalid date format. Use ISO 8601 format'),

  /**
   * Pagination page number
   */
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().min(1, 'Page must be at least 1')),

  /**
   * Pagination limit
   */
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(
      z
        .number()
        .int()
        .min(1, 'Limit must be at least 1')
        .max(100, 'Limit must not exceed 100')
    ),

  /**
   * Sort order
   */
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),

  /**
   * Search query
   */
  search: z.string().max(255, 'Search query too long').optional(),
};

/**
 * Authentication Schemas
 */

export const loginSchema = z.object({
  email: patterns.email,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

export const passwordResetRequestSchema = z.object({
  email: patterns.email,
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: patterns.password,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: patterns.password,
});

export const mfaSetupVerifySchema = z.object({
  code: z.string().length(6, 'MFA code must be 6 digits').regex(/^\d{6}$/, 'MFA code must contain only digits'),
});

export const mfaValidateSchema = z.object({
  userId: patterns.uuid,
  code: z.string().min(6, 'Verification code is required'),
  useBackupCode: z.boolean().optional().default(false),
});

export const mfaDisableSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

/**
 * User Schemas
 */

export const createUserSchema = z.object({
  email: patterns.email,
  password: patterns.password,
  employeeId: patterns.uuid.optional(),
  status: z.enum(['Active', 'Inactive', 'Suspended']).optional().default('Active'),
});

export const updateUserSchema = z.object({
  email: patterns.email.optional(),
  status: z.enum(['Active', 'Inactive', 'Suspended']).optional(),
  mfaEnabled: z.boolean().optional(),
});

export const listUsersQuerySchema = z.object({
  page: patterns.page,
  limit: patterns.limit,
  search: patterns.search,
  status: z.enum(['Active', 'Inactive', 'Suspended']).optional(),
  sortBy: z.enum(['email', 'createdAt', 'lastLogin']).optional().default('createdAt'),
  sortOrder: patterns.sortOrder,
});

/**
 * Employee Schemas
 */

export const createEmployeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name too long'),
  email: patterns.email,
  phoneNumber: patterns.phone,
  dateOfBirth: z.string().datetime().optional(),
  hireDate: z.string().datetime('Invalid hire date format'),
  position: z.string().max(100, 'Position name too long').optional(),
  salary: z.number().positive('Salary must be positive').optional(),
  employmentType: z.enum(['FullTime', 'PartTime', 'Contract', 'Intern']).optional().default('FullTime'),
  status: z.enum(['Active', 'Inactive', 'OnLeave', 'Terminated']).optional().default('Active'),
  departmentId: patterns.uuid.optional(),
  companyId: patterns.uuid,
});

export const updateEmployeeSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: patterns.email.optional(),
  phoneNumber: patterns.phone,
  dateOfBirth: z.string().datetime().optional(),
  hireDate: z.string().datetime().optional(),
  position: z.string().max(100).optional(),
  salary: z.number().positive().optional(),
  employmentType: z.enum(['FullTime', 'PartTime', 'Contract', 'Intern']).optional(),
  status: z.enum(['Active', 'Inactive', 'OnLeave', 'Terminated']).optional(),
  departmentId: patterns.uuid.optional(),
});

export const listEmployeesQuerySchema = z.object({
  page: patterns.page,
  limit: patterns.limit,
  search: patterns.search,
  departmentId: patterns.uuid.optional(),
  companyId: patterns.uuid.optional(),
  status: z.enum(['Active', 'Inactive', 'OnLeave', 'Terminated']).optional(),
  employmentType: z.enum(['FullTime', 'PartTime', 'Contract', 'Intern']).optional(),
  sortBy: z.enum(['firstName', 'lastName', 'hireDate', 'createdAt']).optional().default('createdAt'),
  sortOrder: patterns.sortOrder,
});

/**
 * Department Schemas
 */

export const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required').max(100, 'Department name too long'),
  code: z
    .string()
    .min(1, 'Department code is required')
    .max(50, 'Department code too long')
    .regex(/^[A-Z0-9_]+$/, 'Department code must contain only uppercase letters, numbers, and underscores'),
  description: z.string().max(500, 'Description too long').optional(),
  companyId: patterns.uuid,
  managerId: patterns.uuid.optional(),
  parentId: patterns.uuid.optional(),
});

export const updateDepartmentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  code: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[A-Z0-9_]+$/, 'Department code must contain only uppercase letters, numbers, and underscores')
    .optional(),
  description: z.string().max(500).optional(),
  managerId: patterns.uuid.optional(),
  parentId: patterns.uuid.optional(),
});

export const listDepartmentsQuerySchema = z.object({
  page: patterns.page,
  limit: patterns.limit,
  search: patterns.search,
  companyId: patterns.uuid.optional(),
  parentId: patterns.uuid.optional(),
  sortBy: z.enum(['name', 'code', 'createdAt']).optional().default('name'),
  sortOrder: patterns.sortOrder,
});

/**
 * Company Schemas
 */

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(200, 'Company name too long'),
  code: z
    .string()
    .min(1, 'Company code is required')
    .max(50, 'Company code too long')
    .regex(/^[A-Z0-9_]+$/, 'Company code must contain only uppercase letters, numbers, and underscores'),
  email: patterns.email.optional(),
  phoneNumber: patterns.phone,
  address: z.string().max(255, 'Address too long').optional(),
  city: z.string().max(100, 'City name too long').optional(),
  state: z.string().max(100, 'State name too long').optional(),
  postalCode: z.string().max(20, 'Postal code too long').optional(),
  country: z.string().max(100, 'Country name too long').optional(),
  industry: z.string().max(100, 'Industry name too long').optional(),
  website: patterns.url,
  taxId: z.string().max(50, 'Tax ID too long').optional(),
  registrationNumber: z.string().max(50, 'Registration number too long').optional(),
  status: z.enum(['Active', 'Inactive', 'Suspended']).optional().default('Active'),
});

export const updateCompanySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  code: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[A-Z0-9_]+$/, 'Company code must contain only uppercase letters, numbers, and underscores')
    .optional(),
  email: patterns.email.optional(),
  phoneNumber: patterns.phone,
  address: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
  industry: z.string().max(100).optional(),
  website: patterns.url,
  taxId: z.string().max(50).optional(),
  registrationNumber: z.string().max(50).optional(),
  status: z.enum(['Active', 'Inactive', 'Suspended']).optional(),
});

export const listCompaniesQuerySchema = z.object({
  page: patterns.page,
  limit: patterns.limit,
  search: patterns.search,
  status: z.enum(['Active', 'Inactive', 'Suspended']).optional(),
  industry: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  sortBy: z.enum(['name', 'code', 'createdAt']).optional().default('name'),
  sortOrder: patterns.sortOrder,
});

/**
 * Role Schemas
 */

export const createRoleSchema = z.object({
  code: z
    .string()
    .min(1, 'Role code is required')
    .max(50, 'Role code too long')
    .regex(/^[A-Z_]+$/, 'Role code must contain only uppercase letters and underscores'),
  name: z.string().min(1, 'Role name is required').max(100, 'Role name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  permissionIds: z.array(patterns.uuid).optional(),
});

export const updateRoleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
  permissionIds: z.array(patterns.uuid).optional(),
});

export const assignRoleSchema = z.object({
  userId: patterns.uuid,
  roleId: patterns.uuid,
  expiresAt: z.string().datetime().optional(),
});

export const listRolesQuerySchema = z.object({
  page: patterns.page,
  limit: patterns.limit,
  search: patterns.search,
  includeSystem: z
    .string()
    .optional()
    .transform((val) => val === 'true')
    .pipe(z.boolean().optional().default(false)),
  isActive: z
    .string()
    .optional()
    .transform((val) => (val ? val === 'true' : undefined))
    .pipe(z.boolean().optional()),
  sortBy: z.enum(['code', 'name', 'createdAt']).optional().default('name'),
  sortOrder: patterns.sortOrder,
});

/**
 * Type exports for TypeScript
 */
export type LoginInput = z.infer<typeof loginSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetConfirmInput = z.infer<typeof passwordResetConfirmSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type MFASetupVerifyInput = z.infer<typeof mfaSetupVerifySchema>;
export type MFAValidateInput = z.infer<typeof mfaValidateSchema>;
export type MFADisableInput = z.infer<typeof mfaDisableSchema>;

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type ListEmployeesQuery = z.infer<typeof listEmployeesQuerySchema>;

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type ListDepartmentsQuery = z.infer<typeof listDepartmentsQuerySchema>;

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type ListCompaniesQuery = z.infer<typeof listCompaniesQuerySchema>;

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
export type ListRolesQuery = z.infer<typeof listRolesQuerySchema>;
