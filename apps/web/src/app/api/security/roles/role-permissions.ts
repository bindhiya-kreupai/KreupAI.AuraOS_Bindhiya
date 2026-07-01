import { prisma } from '@aura/database';

/**
 * Replace the RolePermission rows for a role with the provided permission set.
 * Existing rows are soft-deleted; the target set is (re)activated / created.
 * Permissions are upserted by their unique (resource, action) pair.
 */
export async function syncRolePermissions(
  roleId: string,
  perms: Array<{ resource: string; action: string }>,
  actorId?: string
): Promise<void> {
  await (prisma as any).rolePermission.updateMany({
    where: { roleId, isDeleted: false },
    data: { isDeleted: true, deletedAt: new Date() },
  });
  for (const p of perms) {
    if (!p?.resource || !p?.action) continue;
    const permission = await (prisma as any).permission.upsert({
      where: { resource_action: { resource: p.resource, action: p.action } },
      update: {},
      create: { resource: p.resource, action: p.action, createdBy: actorId },
    });
    const existing = await (prisma as any).rolePermission.findFirst({
      where: { roleId, permissionId: permission.id },
    });
    if (existing) {
      await (prisma as any).rolePermission.update({
        where: { id: existing.id },
        data: { isDeleted: false, deletedAt: null, updatedBy: actorId },
      });
    } else {
      await (prisma as any).rolePermission.create({
        data: { roleId, permissionId: permission.id, createdBy: actorId },
      });
    }
  }
}

/** Shape a Role row (+ relations) into the frontend RolePermission contract. */
export function shapeRole(role: any) {
  const permissions = (role.permissions || [])
    .filter((rp: any) => rp.permission)
    .map((rp: any) => ({
      resource: rp.permission.resource,
      action: rp.permission.action,
      accessLevel: rp.permission.action,
    }));
  return {
    roleId: role.id,
    roleName: role.name,
    description: role.description ?? '',
    permissions,
    assignedUsers: role._count?.userRoles ?? 0,
    isSystem: role.isSystem,
    isActive: role.isActive,
    createdAt: role.createdAt,
  };
}
