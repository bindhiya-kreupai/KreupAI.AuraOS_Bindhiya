/**
 * EPIC-34-S25: Data integration endpoint / connector registry.
 *
 * Models the authority + downstream connectors (Qiwa, Mudad, MOHRE, LMRA,
 * SIO, GOSI, GPSSA, bank, GL, etc.) with auth type, secret reference,
 * rotation schedule, and last-health-check result.
 */

import { prisma } from '@aura/database';
import type { AuthContext } from './types';
import {
  normalisePaging,
  prismaPageArgs,
  buildPaginatedResult,
  type PaginationInput,
  type PaginatedResult,
} from '@/lib/services/pagination';

export type ConnectorKind =
  | 'PAYROLL_BANK'
  | 'GOSI'
  | 'GPSSA'
  | 'SIO'
  | 'MOHRE'
  | 'QIWA'
  | 'MUDAD'
  | 'LMRA'
  | 'GL'
  | 'OTHER';

export type ConnectorDirection = 'INBOUND' | 'OUTBOUND' | 'BIDIRECTIONAL';
export type ConnectorAuthType = 'OAUTH2' | 'API_KEY' | 'MTLS' | 'NONE';
export type ConnectorHealthStatus = 'PASS' | 'FAIL' | 'UNKNOWN';

const DEFAULT_ROTATION_DAYS = 90;

export class HrmsConnectorService {
  async list(
    tenantId: string,
    filter: { kind?: ConnectorKind; isActive?: boolean; health?: ConnectorHealthStatus } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      ...(filter.kind ? { kind: filter.kind } : {}),
      ...(filter.isActive !== undefined ? { isActive: filter.isActive } : {}),
      ...(filter.health ? { lastHealthStatus: filter.health } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).hrmsConfigConnector.findMany({
        where,
        orderBy: [{ kind: 'asc' }, { connectorCode: 'asc' }],
        ...prismaPageArgs(page),
      }),
      (prisma as any).hrmsConfigConnector.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }

  async upsert(
    input: {
      connectorCode: string;
      label: string;
      kind: ConnectorKind;
      direction?: ConnectorDirection;
      endpointUrl?: string;
      authType?: ConnectorAuthType;
      secretRef?: string;
      configJson?: Record<string, unknown>;
      isActive?: boolean;
    },
    auth: AuthContext
  ) {
    return (prisma as any).hrmsConfigConnector.upsert({
      where: {
        aura_hrms_config_connector_unique: {
          tenantId: auth.tenantId,
          connectorCode: input.connectorCode,
        },
      },
      update: {
        label: input.label,
        kind: input.kind,
        direction: input.direction ?? 'OUTBOUND',
        endpointUrl: input.endpointUrl ?? null,
        authType: input.authType ?? 'NONE',
        secretRef: input.secretRef ?? null,
        configJson: (input.configJson ?? null) as any,
        isActive: input.isActive ?? true,
      },
      create: {
        tenantId: auth.tenantId,
        connectorCode: input.connectorCode,
        label: input.label,
        kind: input.kind,
        direction: input.direction ?? 'OUTBOUND',
        endpointUrl: input.endpointUrl ?? null,
        authType: input.authType ?? 'NONE',
        secretRef: input.secretRef ?? null,
        configJson: (input.configJson ?? null) as any,
        isActive: input.isActive ?? true,
      },
    });
  }

  /**
   * Mark secret rotation as performed. Sets lastRotatedAt = now and
   * rotationDueAt = now + DEFAULT_ROTATION_DAYS.
   */
  async markRotated(connectorCode: string, auth: AuthContext) {
    const now = new Date();
    const dueAt = new Date(now.getTime() + DEFAULT_ROTATION_DAYS * 24 * 60 * 60 * 1000);
    return (prisma as any).hrmsConfigConnector.update({
      where: {
        aura_hrms_config_connector_unique: {
          tenantId: auth.tenantId,
          connectorCode,
        },
      },
      data: { lastRotatedAt: now, rotationDueAt: dueAt },
    });
  }

  async recordHealth(
    connectorCode: string,
    input: { status: ConnectorHealthStatus; message?: string },
    auth: AuthContext
  ) {
    return (prisma as any).hrmsConfigConnector.update({
      where: {
        aura_hrms_config_connector_unique: {
          tenantId: auth.tenantId,
          connectorCode,
        },
      },
      data: {
        lastHealthCheckAt: new Date(),
        lastHealthStatus: input.status,
        lastHealthMessage: input.message ?? null,
      },
    });
  }

  async failingCount(tenantId: string): Promise<number> {
    return (prisma as any).hrmsConfigConnector.count({
      where: { tenantId, isActive: true, lastHealthStatus: 'FAIL' },
    });
  }
}

export const hrmsConnectorService = new HrmsConnectorService();
