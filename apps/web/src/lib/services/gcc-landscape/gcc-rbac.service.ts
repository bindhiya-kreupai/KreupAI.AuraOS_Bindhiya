import { prisma } from '@aura/database';
import type { AuthContext } from './types';

export type GccPersona =
  | 'SYSTEM_ADMINISTRATOR'
  | 'HR_ADMIN'
  | 'HR_MANAGER'
  | 'PAYROLL_OFFICER'
  | 'PRO_OFFICER'
  | 'COMPLIANCE_OFFICER'
  | 'LINE_MANAGER'
  | 'EMPLOYEE_SELF_SERVICE'
  | 'INTERNAL_AUDITOR'
  | 'EXECUTIVE_LEADERSHIP';

interface PersonaSeed {
  code: GccPersona;
  name: string;
  description: string;
  permissions: Array<{ resource: string; action: string }>;
}

/**
 * EPIC-01-S05: GCC HR persona RBAC catalogue + country/entity scoping.
 *
 * - Seeds Role rows for the ten personas (system-wide, tenant-null).
 * - Records country/entity scope on UserRole assignments via GccRoleScope.
 * - Provides a scope check used by the dashboard aggregator.
 */
export class GccRbacService {
  private readonly seeds: PersonaSeed[] = [
    {
      code: 'SYSTEM_ADMINISTRATOR',
      name: 'System Administrator',
      description: 'Full platform configuration; manages tenants, entities, roles.',
      permissions: [
        { resource: 'tenant', action: 'manage' },
        { resource: 'role', action: 'manage' },
        { resource: 'audit', action: 'read' },
      ],
    },
    {
      code: 'HR_ADMIN',
      name: 'HR Administrator',
      description: 'Manages HR master data, employee records, onboarding.',
      permissions: [
        { resource: 'employee', action: 'manage' },
        { resource: 'onboarding', action: 'manage' },
      ],
    },
    {
      code: 'HR_MANAGER',
      name: 'HR Manager',
      description: 'Reviews HR transactions, approves onboarding and compliance items.',
      permissions: [
        { resource: 'employee', action: 'read' },
        { resource: 'onboarding', action: 'manage' },
        { resource: 'risk_register', action: 'manage' },
      ],
    },
    {
      code: 'PAYROLL_OFFICER',
      name: 'Payroll Officer',
      description: 'Owns payroll runs, WPS files, salary disbursement.',
      permissions: [
        { resource: 'payroll', action: 'manage' },
        { resource: 'wps', action: 'manage' },
      ],
    },
    {
      code: 'PRO_OFFICER',
      name: 'PRO / Immigration Officer',
      description: 'Owns visas, work permits, government liaison and renewals.',
      permissions: [
        { resource: 'immigration', action: 'manage' },
        { resource: 'visa', action: 'manage' },
      ],
    },
    {
      code: 'COMPLIANCE_OFFICER',
      name: 'Compliance Officer',
      description: 'Maintains risk register, monitors compliance KPIs across countries.',
      permissions: [
        { resource: 'risk_register', action: 'manage' },
        { resource: 'compliance_kpi', action: 'read' },
        { resource: 'audit', action: 'read' },
      ],
    },
    {
      code: 'LINE_MANAGER',
      name: 'Line Manager',
      description: 'Manages reporting line — limited to direct/indirect reports.',
      permissions: [
        { resource: 'employee', action: 'read_team' },
        { resource: 'leave', action: 'approve' },
      ],
    },
    {
      code: 'EMPLOYEE_SELF_SERVICE',
      name: 'Employee (Self-Service)',
      description: 'Self-service — own records only.',
      permissions: [
        { resource: 'employee', action: 'read_self' },
        { resource: 'leave', action: 'request' },
      ],
    },
    {
      code: 'INTERNAL_AUDITOR',
      name: 'Internal Auditor',
      description: 'Read-only access to audit log + compliance evidence.',
      permissions: [
        { resource: 'audit', action: 'read' },
        { resource: 'compliance_kpi', action: 'read' },
        { resource: 'risk_register', action: 'read' },
      ],
    },
    {
      code: 'EXECUTIVE_LEADERSHIP',
      name: 'Executive / Leadership',
      description: 'Reads dashboards across assigned countries.',
      permissions: [
        { resource: 'dashboard', action: 'read' },
        { resource: 'compliance_kpi', action: 'read' },
      ],
    },
  ];

  async seedPersonas(auth: AuthContext) {
    const created: string[] = [];
    for (const seed of this.seeds) {
      const existing = await (prisma as any).role.findFirst({
        where: { code: seed.code, tenantId: auth.tenantId },
      });
      const role =
        existing ??
        (await (prisma as any).role.create({
          data: {
            tenantId: auth.tenantId,
            code: seed.code,
            name: seed.name,
            description: seed.description,
            isSystem: true,
            isActive: true,
            createdBy: auth.userId,
            updatedBy: auth.userId,
          },
        }));
      if (!existing) created.push(seed.code);

      for (const perm of seed.permissions) {
        const permRow = await (prisma as any).permission.upsert({
          where: {
            resource_action: { resource: perm.resource, action: perm.action },
          },
          update: {},
          create: {
            resource: perm.resource,
            action: perm.action,
            description: `${perm.action} on ${perm.resource}`,
          },
        });
        await (prisma as any).rolePermission.upsert({
          where: {
            roleId_permissionId: { roleId: role.id, permissionId: permRow.id },
          },
          update: {},
          create: { roleId: role.id, permissionId: permRow.id },
        });
      }
    }
    return { created };
  }

  async listPersonas(tenantId: string) {
    const codes = this.seeds.map((s) => s.code);
    return (prisma as any).role.findMany({
      where: { tenantId, code: { in: codes } },
      orderBy: { name: 'asc' },
    });
  }

  async assignRoleScope(
    userRoleId: string,
    scopes: Array<{ countryCode?: string; legalEntityId?: string }>,
    auth: AuthContext
  ) {
    await (prisma as any).gccRoleScope.deleteMany({ where: { userRoleId } });
    const rows = [] as Array<Record<string, unknown>>;
    for (const scope of scopes) {
      const row = await (prisma as any).gccRoleScope.create({
        data: {
          userRoleId,
          countryCode: scope.countryCode?.toUpperCase() ?? null,
          legalEntityId: scope.legalEntityId ?? null,
          createdBy: auth.userId,
        },
      });
      rows.push(row);
    }
    return rows;
  }

  async listUserScopes(userRoleId: string) {
    return (prisma as any).gccRoleScope.findMany({ where: { userRoleId } });
  }

  /**
   * Resolve the union of country codes a user may read across their assigned roles.
   * `null` from any scope row means "all countries enabled for the tenant".
   */
  async resolveUserCountryScope(
    userId: string,
    tenantId: string
  ): Promise<{ countries: string[] | 'ALL' }> {
    const userRoles = await (prisma as any).userRole.findMany({
      where: { userId, tenantId },
      select: { id: true },
    });
    if (userRoles.length === 0) return { countries: [] };
    const ids = userRoles.map((r: { id: string }) => r.id);
    const scopes = await (prisma as any).gccRoleScope.findMany({
      where: { userRoleId: { in: ids } },
    });
    if (scopes.length === 0) return { countries: 'ALL' };
    const set = new Set<string>();
    for (const scope of scopes as Array<{ countryCode: string | null }>) {
      if (scope.countryCode == null) return { countries: 'ALL' };
      set.add(scope.countryCode);
    }
    return { countries: Array.from(set).sort() };
  }
}

export const gccRbacService = new GccRbacService();
