import { z } from 'zod';

// User Schemas
export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  tenantId: z.string().uuid('Invalid tenant ID'),
  employeeId: z.string().uuid('Invalid employee ID').optional(),
  status: z.enum(['Active', 'Inactive', 'Suspended']).optional().default('Active'),
  mfaEnabled: z.boolean().optional().default(false),
});

export const UpdateUserSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  status: z.enum(['Active', 'Inactive', 'Suspended']).optional(),
  mfaEnabled: z.boolean().optional(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const ResetPasswordSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

// Role Schemas
export const CreateRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(100),
  description: z.string().optional(),
  status: z.enum(['Active', 'Inactive']).optional().default('Active'),
});

export const UpdateRoleSchema = CreateRoleSchema.partial();

// Session Schemas
export const SessionQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  status: z.enum(['Active', 'Idle', 'Revoked']).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

// User Query Schemas
export const UserQuerySchema = z.object({
  search: z.string().optional(), // Search by email
  status: z.enum(['Active', 'Inactive', 'Suspended']).optional(),
  tenantId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

// Audit Log Query Schema
export const AuditLogQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  module: z.string().optional(),
  fromDate: z.string().datetime().or(z.date()).optional(),
  toDate: z.string().datetime().or(z.date()).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

// Password Policy Schemas
export const CreatePasswordPolicySchema = z.object({
  minLength: z.number().int().min(6).max(32).optional().default(8),
  requireUppercase: z.boolean().optional().default(true),
  requireLowercase: z.boolean().optional().default(true),
  requireNumbers: z.boolean().optional().default(true),
  requireSpecialChars: z.boolean().optional().default(true),
  expiryDays: z.number().int().min(0).max(365).optional().default(90),
  historyCount: z.number().int().min(0).max(24).optional().default(5),
  lockoutAttempts: z.number().int().min(0).max(10).optional().default(3),
});

export const UpdatePasswordPolicySchema = CreatePasswordPolicySchema.partial();

// SSO Configuration Schemas
export const CreateSSOConfigSchema = z.object({
  enabled: z.boolean().optional().default(false),
  provider: z.enum(['SAML', 'OIDC'], {
    errorMap: () => ({ message: 'Provider must be either SAML or OIDC' }),
  }),
  issuerUrl: z.string().url('Invalid issuer URL').optional(),
  ssoUrl: z.string().url('Invalid SSO URL').optional(),
  certificate: z.string().optional(),
});

export const UpdateSSOConfigSchema = CreateSSOConfigSchema.partial();

// MFA Configuration Schemas
export const MFAMethodsSchema = z.object({
  authenticatorApp: z.boolean().optional().default(true),
  sms: z.boolean().optional().default(false),
  email: z.boolean().optional().default(false),
});

export const CreateMFAConfigSchema = z.object({
  enabled: z.boolean().optional().default(false),
  enforceForAdmins: z.boolean().optional().default(true),
  enforceForAll: z.boolean().optional().default(false),
  methods: MFAMethodsSchema.optional().default({
    authenticatorApp: true,
    sms: false,
    email: false,
  }),
  gracePeriodDays: z.number().int().min(0).max(30).optional().default(7),
});

export const UpdateMFAConfigSchema = CreateMFAConfigSchema.partial();

// License Schemas
export const CreateLicenseSchema = z.object({
  name: z.string().min(1, 'License name is required').max(200),
  total: z.number().int().min(1, 'Total licenses must be at least 1'),
  used: z.number().int().min(0).optional().default(0),
  type: z.string().min(1, 'License type is required'), // Per User, Per Recruiter, etc.
  status: z.enum(['Active', 'Inactive']).optional().default('Active'),
});

export const UpdateLicenseSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  total: z.number().int().min(1).optional(),
  used: z.number().int().min(0).optional(),
  type: z.string().min(1).optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
});

export const LicenseQuerySchema = z.object({
  search: z.string().optional(),
  type: z.string().optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

// User Deactivation Schemas
export const DeactivateUserSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  reason: z.string().min(1, 'Reason is required').max(500),
});

export const UserDeactivationQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  deactivatedBy: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

// User Delegation Schemas
export const CreateUserDelegationSchema = z.object({
  delegatorId: z.string().uuid('Invalid delegator ID'),
  delegateeId: z.string().uuid('Invalid delegatee ID'),
  role: z.string().min(1, 'Role is required').max(100),
  startDate: z.string().datetime('Invalid start date').or(z.date()),
  endDate: z.string().datetime('Invalid end date').or(z.date()),
  reason: z.string().max(500).optional(),
  status: z.enum(['Active', 'Scheduled', 'Expired']).optional().default('Scheduled'),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end > start;
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const UpdateUserDelegationSchema = z.object({
  role: z.string().min(1).max(100).optional(),
  startDate: z.string().datetime().or(z.date()).optional(),
  endDate: z.string().datetime().or(z.date()).optional(),
  reason: z.string().max(500).optional(),
  status: z.enum(['Active', 'Scheduled', 'Expired']).optional(),
});

export const UserDelegationQuerySchema = z.object({
  delegatorId: z.string().uuid().optional(),
  delegateeId: z.string().uuid().optional(),
  status: z.enum(['Active', 'Scheduled', 'Expired']).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

// Type exports
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type CreateRoleInput = z.infer<typeof CreateRoleSchema>;
export type UpdateRoleInput = z.infer<typeof UpdateRoleSchema>;
export type SessionQueryInput = z.infer<typeof SessionQuerySchema>;
export type UserQueryInput = z.infer<typeof UserQuerySchema>;
export type AuditLogQueryInput = z.infer<typeof AuditLogQuerySchema>;
export type CreatePasswordPolicyInput = z.infer<typeof CreatePasswordPolicySchema>;
export type UpdatePasswordPolicyInput = z.infer<typeof UpdatePasswordPolicySchema>;
export type CreateSSOConfigInput = z.infer<typeof CreateSSOConfigSchema>;
export type UpdateSSOConfigInput = z.infer<typeof UpdateSSOConfigSchema>;
export type CreateMFAConfigInput = z.infer<typeof CreateMFAConfigSchema>;
export type UpdateMFAConfigInput = z.infer<typeof UpdateMFAConfigSchema>;
export type CreateLicenseInput = z.infer<typeof CreateLicenseSchema>;
export type UpdateLicenseInput = z.infer<typeof UpdateLicenseSchema>;
export type LicenseQueryInput = z.infer<typeof LicenseQuerySchema>;
export type DeactivateUserInput = z.infer<typeof DeactivateUserSchema>;
export type UserDeactivationQueryInput = z.infer<typeof UserDeactivationQuerySchema>;
export type CreateUserDelegationInput = z.infer<typeof CreateUserDelegationSchema>;
export type UpdateUserDelegationInput = z.infer<typeof UpdateUserDelegationSchema>;
export type UserDelegationQueryInput = z.infer<typeof UserDelegationQuerySchema>;
