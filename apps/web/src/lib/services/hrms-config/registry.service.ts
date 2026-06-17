/**
 * EPIC-34-S01: Configuration object registry with scope resolution
 * (GLOBAL → COUNTRY → LEGAL_ENTITY → DOMAIN), versioning, effective-dating,
 * and maker-checker (preparer/approver gate).
 *
 * This is the spine that the 20 per-domain config workspaces ride on
 * (LEAVE, ATTENDANCE, PAYROLL_COMPONENT, PAYROLL_CALENDAR, WPS_MAPPING,
 *  SOCIAL_INSURANCE, NATIONALISATION, IMMIGRATION, BENEFITS, ACCOMMODATION,
 *  HSE, ER, SEPARATION, EOSB_FORMULA, DOCUMENT_RETENTION, RBAC_SCOPE,
 *  CONTRACT_TEMPLATE, POSITION_RULES, EMPLOYEE_DATA_DICTIONARY, LEGAL_ENTITY).
 */

import { prisma } from '@aura/database';
import type { AuthContext } from './types';
import { validatePayload } from './validator-registry';

export type ConfigScope = 'GLOBAL' | 'COUNTRY' | 'LEGAL_ENTITY' | 'DOMAIN';
export type ConfigStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'RETIRED';

export interface ConfigObjectInput {
  domainCode: string;
  objectType: string;
  objectKey: string;
  label: string;
  scope?: ConfigScope;
  scopeRef?: string;
  country?: string;
  legalEntityId?: string;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  payload: Record<string, unknown>;
  targetModel?: string;
  targetRecordId?: string;
  rationale?: string;
  sourceReference?: string;
}

export interface ScopeResolveInput {
  domainCode: string;
  objectKey: string;
  country?: string;
  legalEntityId?: string;
  at?: Date;
}

const SCOPE_PRIORITY: Record<ConfigScope, number> = {
  LEGAL_ENTITY: 4,
  COUNTRY: 3,
  DOMAIN: 2,
  GLOBAL: 1,
};

export class HrmsConfigRegistryService {
  /**
   * Resolve the active config object for (domainCode, objectKey) at the
   * given scope. Most specific scope wins: legal entity > country >
   * domain > global. Among ties, latest effectiveFrom wins.
   */
  async resolveActive(input: ScopeResolveInput, tenantId: string) {
    const at = input.at ?? new Date();
    const candidates = await (prisma as any).hrmsConfigObject.findMany({
      where: {
        tenantId,
        domainCode: input.domainCode,
        objectKey: input.objectKey,
        status: 'ACTIVE',
        effectiveFrom: { lte: at },
        OR: [{ effectiveTo: null }, { effectiveTo: { gt: at } }],
      },
    });
    const scored = (candidates as any[])
      .filter((c) => {
        if (c.scope === 'LEGAL_ENTITY')
          return input.legalEntityId && c.legalEntityId === input.legalEntityId;
        if (c.scope === 'COUNTRY') return input.country && c.country === input.country;
        return true;
      })
      .sort((a, b) => {
        const sp =
          (SCOPE_PRIORITY[b.scope as ConfigScope] ?? 0) -
          (SCOPE_PRIORITY[a.scope as ConfigScope] ?? 0);
        if (sp !== 0) return sp;
        return new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime();
      });
    return scored[0] ?? null;
  }

  async list(
    tenantId: string,
    filter: {
      domainCode?: string;
      status?: ConfigStatus;
      scope?: ConfigScope;
      country?: string;
      objectKey?: string;
    } = {}
  ) {
    return (prisma as any).hrmsConfigObject.findMany({
      where: {
        tenantId,
        ...(filter.domainCode ? { domainCode: filter.domainCode } : {}),
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.scope ? { scope: filter.scope } : {}),
        ...(filter.country ? { country: filter.country } : {}),
        ...(filter.objectKey ? { objectKey: filter.objectKey } : {}),
      },
      orderBy: [{ domainCode: 'asc' }, { objectKey: 'asc' }, { version: 'desc' }],
      take: 500,
    });
  }

  async createDraft(input: ConfigObjectInput, auth: AuthContext) {
    // Validate the payload against the per-domain Zod schema (if any
    // is registered). Domains without a registered schema accept the
    // payload as-is so existing tenants are never blocked when new
    // schemas are introduced. The validated payload is the canonical
    // shape that persists. (audit 2026-06-17 EPIC-34 — fixes the
    // "78% of domain logic missing" finding.)
    const validatedPayload = validatePayload(input.domainCode, input.payload);

    const prior = await (prisma as any).hrmsConfigObject.findFirst({
      where: {
        tenantId: auth.tenantId,
        domainCode: input.domainCode,
        objectKey: input.objectKey,
      },
      orderBy: { version: 'desc' },
    });
    const version = prior ? prior.version + 1 : 1;
    return (prisma as any).hrmsConfigObject.create({
      data: {
        tenantId: auth.tenantId,
        domainCode: input.domainCode,
        objectType: input.objectType,
        objectKey: input.objectKey,
        label: input.label,
        scope: input.scope ?? 'GLOBAL',
        scopeRef: input.scopeRef ?? null,
        country: input.country ?? null,
        legalEntityId: input.legalEntityId ?? null,
        version,
        status: 'DRAFT' as ConfigStatus,
        effectiveFrom: input.effectiveFrom,
        effectiveTo: input.effectiveTo ?? null,
        payload: validatedPayload as any,
        targetModel: input.targetModel ?? null,
        targetRecordId: input.targetRecordId ?? null,
        rationale: input.rationale ?? null,
        sourceReference: input.sourceReference ?? null,
        requestedBy: auth.userId,
      },
    });
  }

  /** Move a DRAFT to PENDING_APPROVAL. */
  async submit(id: string, auth: AuthContext) {
    const row = await (prisma as any).hrmsConfigObject.findUnique({ where: { id } });
    if (!row || row.tenantId !== auth.tenantId) throw new Error('config object not found');
    if (row.status !== 'DRAFT') throw new Error(`cannot submit object in status ${row.status}`);
    if (!row.rationale || !row.sourceReference) {
      throw new Error('rationale and sourceReference required before submit');
    }
    return (prisma as any).hrmsConfigObject.update({
      where: { id },
      data: { status: 'PENDING_APPROVAL' as ConfigStatus },
    });
  }

  /**
   * Approve a PENDING_APPROVAL object. Enforces preparer ≠ approver
   * (maker-checker). Promotes prior ACTIVE for the same (domainCode,
   * objectKey, scope, scopeRef) to RETIRED with effectiveTo = effectiveFrom.
   */
  async approve(id: string, auth: AuthContext) {
    const row = await (prisma as any).hrmsConfigObject.findUnique({ where: { id } });
    if (!row || row.tenantId !== auth.tenantId) throw new Error('config object not found');
    if (row.status !== 'PENDING_APPROVAL') {
      throw new Error(`cannot approve object in status ${row.status}`);
    }
    if (row.requestedBy === auth.userId) {
      throw new Error('approver must differ from requester (maker-checker)');
    }
    return prisma.$transaction(async (tx) => {
      await (tx as any).hrmsConfigObject.updateMany({
        where: {
          tenantId: auth.tenantId,
          domainCode: row.domainCode,
          objectKey: row.objectKey,
          scope: row.scope,
          scopeRef: row.scopeRef ?? null,
          status: 'ACTIVE',
        },
        data: {
          status: 'RETIRED' as ConfigStatus,
          effectiveTo: row.effectiveFrom,
          retiredBy: auth.userId,
          retiredAt: new Date(),
        },
      });
      return (tx as any).hrmsConfigObject.update({
        where: { id },
        data: {
          status: 'ACTIVE' as ConfigStatus,
          approvedBy: auth.userId,
          approvedAt: new Date(),
        },
      });
    });
  }

  async reject(id: string, reason: string, auth: AuthContext) {
    if (!reason || !reason.trim()) throw new Error('rejection reason required');
    const row = await (prisma as any).hrmsConfigObject.findUnique({ where: { id } });
    if (!row || row.tenantId !== auth.tenantId) throw new Error('config object not found');
    if (row.status !== 'PENDING_APPROVAL') {
      throw new Error(`cannot reject object in status ${row.status}`);
    }
    if (row.requestedBy === auth.userId) {
      throw new Error('rejecter must differ from requester (maker-checker)');
    }
    return (prisma as any).hrmsConfigObject.update({
      where: { id },
      data: {
        status: 'DRAFT' as ConfigStatus,
        rationale: `${row.rationale ?? ''} | REJECTED: ${reason.trim()}`,
      },
    });
  }

  async retire(id: string, auth: AuthContext) {
    const row = await (prisma as any).hrmsConfigObject.findUnique({ where: { id } });
    if (!row || row.tenantId !== auth.tenantId) throw new Error('config object not found');
    if (row.status !== 'ACTIVE') throw new Error(`cannot retire object in status ${row.status}`);
    return (prisma as any).hrmsConfigObject.update({
      where: { id },
      data: {
        status: 'RETIRED' as ConfigStatus,
        effectiveTo: new Date(),
        retiredBy: auth.userId,
        retiredAt: new Date(),
      },
    });
  }
}

export const hrmsConfigRegistryService = new HrmsConfigRegistryService();
