/**
 * Helper for per-tenant module settings backed by `TenantSetting`.
 *
 * Each module page exposes its config under `/api/<module>/settings`. Instead
 * of returning a hardcoded literal, the handler reads `TenantSetting` rows
 * for that (tenantId, module) and overlays them on top of a default map that
 * lives in code. Writes upsert each key.
 *
 * That gives us:
 *   - Defaults stay near the module that owns them.
 *   - New keys appear automatically for existing tenants (default merge).
 *   - No new Prisma table per module — one shared key/value store.
 */

import { prisma } from '@aura/database';

export async function readSettings<T extends Record<string, unknown>>(
  tenantId: string,
  moduleKey: string,
  defaults: T
): Promise<T> {
  const rows = await prisma.tenantSetting.findMany({
    where: { tenantId, module: moduleKey },
  });
  const merged: Record<string, unknown> = { ...defaults };
  for (const row of rows) {
    merged[row.key] = row.value as unknown;
  }
  return merged as T;
}

export async function writeSettings(
  tenantId: string,
  moduleKey: string,
  updates: Record<string, unknown>,
  userId?: string
): Promise<void> {
  const operations = Object.entries(updates).map(([key, value]) =>
    prisma.tenantSetting.upsert({
      where: {
        tenantId_module_key: { tenantId, module: moduleKey, key },
      },
      create: {
        tenantId,
        module: moduleKey,
        key,
        value: value as any,
        updatedBy: userId,
      },
      update: {
        value: value as any,
        updatedBy: userId,
      },
    })
  );
  if (operations.length === 0) return;
  await prisma.$transaction(operations);
}
