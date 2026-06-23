/**
 * EPIC-34: HRMS Configuration for GCC Compliance.
 *
 * Cross-cutting configuration layer that the other compliance epics
 * read from rather than hardcoding country rules, approval routing,
 * notification channels, and audit-trail capture policies.
 *
 *   S02  – versioned country rule sets per (country, domain) with
 *          DRAFT → PUBLISHED → SUPERSEDED lifecycle. The active rule
 *          set is whichever PUBLISHED row has effectiveFrom ≤ now and
 *          effectiveTo (null or > now).
 *   S21  – approval workflow templates: one per (templateCode), with
 *          ordered stagesJson, escalation hours and optional auto-
 *          approve predicate.
 *   S22  – notification rule registry: channels, recipient roles, and
 *          bilingual template text per (ruleCode).
 *   S23  – audit-trail capture settings per domain (reads / writes /
 *          exports, retention years, PII classification).
 *
 * Pure helpers `resolveActiveRuleSet`, `nextStage`, and
 * `auditCapturePolicy` give the rest of the platform a way to reason
 * about configuration without dragging Prisma in.
 */

import { prisma } from '@aura/database';
import {
  normalisePaging,
  prismaPageArgs,
  buildPaginatedResult,
  type PaginationInput,
  type PaginatedResult,
} from '@/lib/services/pagination';

export type { AuthContext } from './types';
import type { AuthContext } from './types';

// EPIC-34-S01 + S03–S20 + S24
export { hrmsConfigRegistryService, HrmsConfigRegistryService } from './registry.service';
export type {
  ConfigScope,
  ConfigStatus,
  ConfigObjectInput,
  ScopeResolveInput,
} from './registry.service';
export { HRMS_WORKSPACES, findWorkspaceByDomain } from './workspaces';
export type { WorkspaceDescriptor } from './workspaces';

// EPIC-34-S27
export {
  hrmsImplementationService,
  HrmsImplementationService,
  DEFAULT_CHECKLIST,
} from './implementation.service';
export type {
  ImplementationPhase,
  ImplementationStatus,
  ChecklistSeed,
} from './implementation.service';

// EPIC-34-S25
export { hrmsConnectorService, HrmsConnectorService } from './connector.service';
export type {
  ConnectorKind,
  ConnectorDirection,
  ConnectorAuthType,
  ConnectorHealthStatus,
} from './connector.service';

// EPIC-34-S26
export { hrmsMigrationService, HrmsMigrationService } from './migration.service';
export type { MigrationStatus, RunResultInput } from './migration.service';

// EPIC-34-S28 + S29
export { hrmsConfigCertificateService, HrmsConfigCertificateService } from './certificate.service';
export type { CertificateType, CertificateStatus, DashboardSummary } from './certificate.service';

export type RuleSetStatus = 'DRAFT' | 'PUBLISHED' | 'SUPERSEDED';

export interface CountryRuleSetRow {
  id: string;
  tenantId: string;
  country: string;
  domain: string;
  version: string;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  rulesJson: Record<string, unknown>;
  status: RuleSetStatus;
  supersededById: string | null;
}

/** EPIC-34-S02: returns the rule set that is currently in effect. */
export function resolveActiveRuleSet<
  T extends Pick<CountryRuleSetRow, 'status' | 'effectiveFrom' | 'effectiveTo' | 'version'>,
>(candidates: T[], at: Date = new Date()): T | null {
  const eligible = candidates.filter((c) => {
    if (c.status !== 'PUBLISHED') return false;
    if (c.effectiveFrom.getTime() > at.getTime()) return false;
    if (c.effectiveTo && c.effectiveTo.getTime() <= at.getTime()) return false;
    return true;
  });
  if (eligible.length === 0) return null;
  return eligible.sort((a, b) => b.effectiveFrom.getTime() - a.effectiveFrom.getTime())[0]!;
}

export interface ApprovalStage {
  index: number;
  role: string;
  slaHours?: number;
  parallel?: boolean;
}

/** EPIC-34-S21: pure derivation of the next pending approval stage. */
export function nextStage(
  stages: ApprovalStage[],
  completedIndices: number[]
): ApprovalStage | null {
  const sorted = [...stages].sort((a, b) => a.index - b.index);
  for (const s of sorted) {
    if (!completedIndices.includes(s.index)) return s;
  }
  return null;
}

export interface AuditCapturePolicy {
  captureReads: boolean;
  captureWrites: boolean;
  captureExports: boolean;
  retentionYears: number;
  piiClassification: string;
}

const DEFAULT_AUDIT: AuditCapturePolicy = {
  captureReads: false,
  captureWrites: true,
  captureExports: true,
  retentionYears: 7,
  piiClassification: 'CONFIDENTIAL',
};

/** EPIC-34-S23: per-domain audit policy with default fallback. */
export function auditCapturePolicy(
  settings: Array<
    Pick<
      AuditCapturePolicy,
      'captureReads' | 'captureWrites' | 'captureExports' | 'retentionYears' | 'piiClassification'
    > & { domain: string; isActive: boolean }
  >,
  domain: string
): AuditCapturePolicy {
  const row = settings.find((s) => s.domain === domain && s.isActive);
  if (!row) return DEFAULT_AUDIT;
  return {
    captureReads: row.captureReads,
    captureWrites: row.captureWrites,
    captureExports: row.captureExports,
    retentionYears: row.retentionYears,
    piiClassification: row.piiClassification,
  };
}

export const HRMS_CONFIG_CONSTANTS = {
  DEFAULT_AUDIT,
  SUPPORTED_COUNTRIES: ['UAE', 'KSA', 'BH', 'QA', 'OM', 'KW', 'IN'],
  SUPPORTED_DOMAINS: [
    'WPS',
    'OVERTIME',
    'GOSI',
    'GPSSA',
    'SIO',
    'EMIRATISATION',
    'NITAQAT',
    'BAHRAINIZATION',
    'ATTENDANCE',
    'LEAVE',
    'HOLIDAYS',
    'BENEFITS',
    'ACCOMMODATION',
    'HSE',
    'ER',
    'SEPARATION',
    'EOSB',
    'VISA_EXIT',
    'DOCUMENT_RETENTION',
    'HR_POLICIES',
    'HR_FORMS',
  ],
  CHANNELS: ['EMAIL', 'SMS', 'IN_APP', 'WHATSAPP', 'TEAMS', 'SLACK'],
  SEVERITIES: ['INFO', 'WARNING', 'CRITICAL'],
};

class CountryRuleSetService {
  async upsertDraft(
    input: {
      id?: string;
      country: string;
      domain: string;
      version: string;
      effectiveFrom: Date;
      effectiveTo?: Date | null;
      rulesJson: Record<string, unknown>;
    },
    auth: AuthContext
  ) {
    const data = {
      tenantId: auth.tenantId,
      country: input.country,
      domain: input.domain,
      version: input.version,
      effectiveFrom: input.effectiveFrom,
      effectiveTo: input.effectiveTo ?? null,
      rulesJson: input.rulesJson,
      status: 'DRAFT',
    };
    return (prisma as any).countryRuleSet.upsert({
      where: {
        aura_country_rule_set_unique: {
          tenantId: auth.tenantId,
          country: input.country,
          domain: input.domain,
          version: input.version,
        },
      },
      update: {
        rulesJson: input.rulesJson,
        effectiveFrom: input.effectiveFrom,
        effectiveTo: input.effectiveTo ?? null,
      },
      create: data,
    });
  }

  async publish(id: string, auth: AuthContext) {
    const row = await (prisma as any).countryRuleSet.findUnique({ where: { id } });
    if (!row || row.tenantId !== auth.tenantId) throw new Error('rule set not found');
    if (row.status !== 'DRAFT') throw new Error('only DRAFT rule sets can be published');
    const prior = await (prisma as any).countryRuleSet.findMany({
      where: {
        tenantId: auth.tenantId,
        country: row.country,
        domain: row.domain,
        status: 'PUBLISHED',
      },
    });
    for (const p of prior) {
      await (prisma as any).countryRuleSet.update({
        where: { id: p.id },
        data: { status: 'SUPERSEDED', supersededById: id, effectiveTo: row.effectiveFrom },
      });
    }
    return (prisma as any).countryRuleSet.update({
      where: { id },
      data: { status: 'PUBLISHED', publishedAt: new Date(), publishedBy: auth.userId },
    });
  }

  async list(
    tenantId: string,
    filter: { country?: string; domain?: string; status?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      ...(filter.country ? { country: filter.country } : {}),
      ...(filter.domain ? { domain: filter.domain } : {}),
      ...(filter.status ? { status: filter.status } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).countryRuleSet.findMany({
        where,
        orderBy: [{ country: 'asc' }, { domain: 'asc' }, { effectiveFrom: 'desc' }],
        ...prismaPageArgs(page),
      }),
      (prisma as any).countryRuleSet.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }

  async active(tenantId: string, country: string, domain: string, at?: Date) {
    const rows = await (prisma as any).countryRuleSet.findMany({
      where: { tenantId, country, domain, status: 'PUBLISHED' },
    });
    return resolveActiveRuleSet(rows, at ?? new Date());
  }
}

export const countryRuleSetService = new CountryRuleSetService();

class ApprovalWorkflowTemplateService {
  async upsert(
    input: {
      templateCode: string;
      label: string;
      domain: string;
      country?: string;
      stagesJson: ApprovalStage[];
      escalationHours?: number;
      autoApproveWhen?: string;
      isActive?: boolean;
    },
    auth: AuthContext
  ) {
    return (prisma as any).approvalWorkflowTemplate.upsert({
      where: {
        aura_approval_workflow_template_unique: {
          tenantId: auth.tenantId,
          templateCode: input.templateCode,
        },
      },
      update: {
        label: input.label,
        domain: input.domain,
        country: input.country ?? null,
        stagesJson: input.stagesJson as any,
        escalationHours: input.escalationHours ?? 24,
        autoApproveWhen: input.autoApproveWhen ?? null,
        isActive: input.isActive ?? true,
      },
      create: {
        tenantId: auth.tenantId,
        templateCode: input.templateCode,
        label: input.label,
        domain: input.domain,
        country: input.country ?? null,
        stagesJson: input.stagesJson as any,
        escalationHours: input.escalationHours ?? 24,
        autoApproveWhen: input.autoApproveWhen ?? null,
        isActive: input.isActive ?? true,
      },
    });
  }

  async list(
    tenantId: string,
    filter: { domain?: string; country?: string; isActive?: boolean } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      ...(filter.domain ? { domain: filter.domain } : {}),
      ...(filter.country ? { country: filter.country } : {}),
      ...(filter.isActive !== undefined ? { isActive: filter.isActive } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).approvalWorkflowTemplate.findMany({
        where,
        orderBy: [{ domain: 'asc' }, { templateCode: 'asc' }],
        ...prismaPageArgs(page),
      }),
      (prisma as any).approvalWorkflowTemplate.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }

  async deactivate(id: string, auth: AuthContext) {
    return (prisma as any).approvalWorkflowTemplate.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export const approvalWorkflowTemplateService = new ApprovalWorkflowTemplateService();

class NotificationRuleService {
  async upsert(
    input: {
      ruleCode: string;
      label: string;
      domain: string;
      trigger: string;
      channelsJson: string[];
      recipientRoles: string[];
      templateText?: string;
      templateTextAr?: string;
      severity?: 'INFO' | 'WARNING' | 'CRITICAL';
      isActive?: boolean;
    },
    auth: AuthContext
  ) {
    return (prisma as any).notificationRule.upsert({
      where: {
        aura_notification_rule_unique: {
          tenantId: auth.tenantId,
          ruleCode: input.ruleCode,
        },
      },
      update: {
        label: input.label,
        domain: input.domain,
        trigger: input.trigger,
        channelsJson: input.channelsJson as any,
        recipientRoles: input.recipientRoles as any,
        templateText: input.templateText ?? null,
        templateTextAr: input.templateTextAr ?? null,
        severity: input.severity ?? 'INFO',
        isActive: input.isActive ?? true,
      },
      create: {
        tenantId: auth.tenantId,
        ruleCode: input.ruleCode,
        label: input.label,
        domain: input.domain,
        trigger: input.trigger,
        channelsJson: input.channelsJson as any,
        recipientRoles: input.recipientRoles as any,
        templateText: input.templateText ?? null,
        templateTextAr: input.templateTextAr ?? null,
        severity: input.severity ?? 'INFO',
        isActive: input.isActive ?? true,
      },
    });
  }

  async list(
    tenantId: string,
    filter: { domain?: string; trigger?: string; isActive?: boolean } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      ...(filter.domain ? { domain: filter.domain } : {}),
      ...(filter.trigger ? { trigger: filter.trigger } : {}),
      ...(filter.isActive !== undefined ? { isActive: filter.isActive } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).notificationRule.findMany({
        where,
        orderBy: [{ domain: 'asc' }, { ruleCode: 'asc' }],
        ...prismaPageArgs(page),
      }),
      (prisma as any).notificationRule.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }

  async deactivate(id: string, auth: AuthContext) {
    return (prisma as any).notificationRule.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export const notificationRuleService = new NotificationRuleService();

class AuditTrailSettingService {
  async upsert(
    input: {
      domain: string;
      captureReads?: boolean;
      captureWrites?: boolean;
      captureExports?: boolean;
      retentionYears?: number;
      piiClassification?: string;
      isActive?: boolean;
    },
    auth: AuthContext
  ) {
    return (prisma as any).auditTrailSetting.upsert({
      where: {
        aura_audit_trail_setting_unique: {
          tenantId: auth.tenantId,
          domain: input.domain,
        },
      },
      update: {
        captureReads: input.captureReads ?? DEFAULT_AUDIT.captureReads,
        captureWrites: input.captureWrites ?? DEFAULT_AUDIT.captureWrites,
        captureExports: input.captureExports ?? DEFAULT_AUDIT.captureExports,
        retentionYears: input.retentionYears ?? DEFAULT_AUDIT.retentionYears,
        piiClassification: input.piiClassification ?? DEFAULT_AUDIT.piiClassification,
        isActive: input.isActive ?? true,
      },
      create: {
        tenantId: auth.tenantId,
        domain: input.domain,
        captureReads: input.captureReads ?? DEFAULT_AUDIT.captureReads,
        captureWrites: input.captureWrites ?? DEFAULT_AUDIT.captureWrites,
        captureExports: input.captureExports ?? DEFAULT_AUDIT.captureExports,
        retentionYears: input.retentionYears ?? DEFAULT_AUDIT.retentionYears,
        piiClassification: input.piiClassification ?? DEFAULT_AUDIT.piiClassification,
        isActive: input.isActive ?? true,
      },
    });
  }

  async list(tenantId: string, paging?: PaginationInput): Promise<PaginatedResult<unknown>> {
    const where = { tenantId };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).auditTrailSetting.findMany({
        where,
        orderBy: { domain: 'asc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).auditTrailSetting.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }

  async policy(tenantId: string, domain: string): Promise<AuditCapturePolicy> {
    const settings = await (prisma as any).auditTrailSetting.findMany({
      where: { tenantId, isActive: true },
    });
    return auditCapturePolicy(settings, domain);
  }
}

export const auditTrailSettingService = new AuditTrailSettingService();
