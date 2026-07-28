/**
 * RBAC Permissions System
 * Defines all available permissions in the system
 */

export enum Resource {
  // User Management
  USERS = 'users',
  ROLES = 'roles',
  SESSIONS = 'sessions',

  // Employee Management
  EMPLOYEES = 'employees',
  DEPARTMENTS = 'departments',

  // Competency Library
  COMPETENCIES = 'competencies',
  COMPETENCY_CATEGORIES = 'competency_categories',
  PROFICIENCY_FRAMEWORKS = 'proficiency_frameworks',
  JOB_ROLES = 'job_roles',
  SKILL_ASSESSMENTS = 'skill_assessments',
  GAP_ANALYSIS = 'gap_analysis',
  DEVELOPMENT_PLANS = 'development_plans',

  // System Configuration
  PASSWORD_POLICIES = 'password_policies',
  SSO_CONFIG = 'sso_config',
  MFA_CONFIG = 'mfa_config',
  ACCESS_CONTROL = 'access_control',
  LICENSES = 'licenses',
  USER_DELEGATION = 'user_delegation',
  USER_DEACTIVATION = 'user_deactivation',
  AUDIT_LOGS = 'audit_logs',
  SYSTEM_SETTINGS = 'system_settings',

  // Payroll & Compliance
  PAYROLL = 'payroll',
  ATTENDANCE = 'attendance',
  COMPLIANCE = 'compliance',

  // Recruitment
  RECRUITMENT = 'recruitment',

  // Analytics & Reporting
  ANALYTICS = 'analytics',

  // Integrations
  INTEGRATIONS = 'integrations',

  // Master Data
  MASTER_DATA = 'master_data',
  COUNTRIES = 'countries',
  STATES = 'states',
  CITIES = 'cities',
  CURRENCIES = 'currencies',
  LANGUAGES = 'languages',

  // Workforce modules
  COMPENSATION = 'compensation',
  LEAVE = 'leave',
  ENGAGEMENT = 'engagement',
  LEARNING = 'learning',
  TRAVEL = 'travel',
  BENEFITS = 'benefits',
  SYSTEM = 'system',
  SHIFTS = 'shifts',
  SHIFT_ASSIGNMENTS = 'shift-assignments',
  SHIFT_ROSTERS = 'shift-rosters',
  SHIFT_SWAPS = 'shift-swaps',
}

export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage', // Full CRUD access
  EXPORT = 'export',
  IMPORT = 'import',
}

export type Permission = `${Resource}:${Action}`;

/**
 * Predefined role permissions
 */
export const RolePermissions: Record<string, Permission[]> = {
  SUPER_ADMIN: [
    // Full system access
    'users:manage',
    'roles:manage',
    'sessions:manage',
    'employees:manage',
    'departments:manage',
    'competencies:manage',
    'competency_categories:manage',
    'proficiency_frameworks:manage',
    'job_roles:manage',
    'skill_assessments:manage',
    'gap_analysis:manage',
    'development_plans:manage',
    'password_policies:manage',
    'sso_config:manage',
    'mfa_config:manage',
    'access_control:manage',
    'licenses:manage',
    'user_delegation:manage',
    'user_deactivation:manage',
    'audit_logs:read',
    'system_settings:manage',
    'master_data:manage',
    'shifts:manage',
    'shift-assignments:manage',
    'shift-rosters:manage',
    'shift-swaps:manage',
  ],

  ADMIN: [
    // User management
    'users:create',
    'users:read',
    'users:update',
    'users:delete',
    'roles:read',
    'sessions:read',
    'sessions:delete',

    // Employee management
    'employees:manage',
    'departments:manage',

    // Competency library
    'competencies:manage',
    'competency_categories:manage',
    'proficiency_frameworks:manage',
    'job_roles:manage',
    'skill_assessments:read',
    'skill_assessments:create',
    'gap_analysis:read',
    'development_plans:read',

    // System
    'audit_logs:read',
    'master_data:read',
    'shifts:manage',
    'shift-assignments:manage',
    'shift-rosters:manage',
    'shift-swaps:manage',
    'sso_config:manage',

    // User Management sub-modules
    'licenses:read',
    'licenses:create',
    'licenses:update',
    'licenses:delete',
    'user_delegation:read',
    'user_delegation:create',
    'user_delegation:update',
    'user_delegation:delete',
    'user_deactivation:read',
    'user_deactivation:create',
    'user_deactivation:update',
    'password_policies:manage',
    'mfa_config:manage',
    'access_control:manage',
    'system_settings:read',
    'system_settings:update',
  ],

  HR_MANAGER: [
    // User/Employee management
    'users:read',
    'employees:create',
    'employees:read',
    'employees:update',
    'departments:read',

    // Competency & Development
    'competencies:read',
    'competency_categories:read',
    'proficiency_frameworks:read',
    'job_roles:read',
    'job_roles:create',
    'job_roles:update',
    'skill_assessments:manage',
    'gap_analysis:manage',
    'development_plans:manage',

    // Master data
    'master_data:read',
    'shifts:manage',
    'shift-assignments:manage',
    'shift-rosters:manage',
    'shift-swaps:manage',
  ],

  MANAGER: [
    // Team view
    'employees:read',
    'departments:read',

    // Assessments for team members
    'competencies:read',
    'job_roles:read',
    'skill_assessments:create',
    'skill_assessments:read',
    'skill_assessments:update',
    'gap_analysis:read',
    'gap_analysis:create',
    'development_plans:read',
    'development_plans:create',
    'shifts:read',
    'shift-assignments:read',
    'shift-rosters:read',
    'shift-swaps:read',
    'shift-swaps:create',
  ],

  EMPLOYEE: [
    // Self-service
    'employees:read', // Own profile only
    'competencies:read',
    'job_roles:read',
    'skill_assessments:read', // Own assessments
    'skill_assessments:create', // Self-assessment
    'gap_analysis:read', // Own gap analysis
    'development_plans:read', // Own development plans
    'shifts:read',
    'shift-assignments:read',
    'shift-rosters:read',
    'shift-swaps:read',
    'shift-swaps:create',
  ],

  READONLY: [
    // Read-only access
    'employees:read',
    'departments:read',
    'competencies:read',
    'competency_categories:read',
    'proficiency_frameworks:read',
    'job_roles:read',
    'master_data:read',
  ],
};

/**
 * Check if a permission allows an action
 */
export function hasPermission(
  userPermissions: Permission[],
  resource: Resource,
  action: Action
): boolean {
  if (
    userPermissions.includes('*' as Permission) ||
    userPermissions.includes('all' as Permission)
  ) {
    return true;
  }
  // Check for exact permission
  const exactPermission = `${resource}:${action}` as Permission;
  if (userPermissions.includes(exactPermission)) {
    return true;
  }

  // Check for manage permission (grants all actions)
  const managePermission = `${resource}:manage` as Permission;
  if (userPermissions.includes(managePermission)) {
    return true;
  }

  return false;
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(roleName: string): Permission[] {
  return RolePermissions[roleName.toUpperCase()] || [];
}

/**
 * Check if user has required permissions
 */
export function checkPermissions(
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.every((required) => {
    const [resource, action] = required.split(':') as [Resource, Action];
    return hasPermission(userPermissions, resource, action);
  });
}
