import { prisma } from '@aura/database';
import type { AuthContext } from './types';

export interface PenaltyInput {
  countryCode: string;
  establishmentId: string;
  period: string;
  type: string;
  amount?: number;
  currency?: string;
  description: string;
  businessImpact?: string;
}

/**
 * EPIC-11-S10: penalty + business-impact register.
 */
export class WpsPenaltyService {
  async raise(input: PenaltyInput, auth: AuthContext) {
    return (prisma as any).wpsPenalty.create({
      data: { tenantId: auth.tenantId, status: 'OPEN', ...input },
    });
  }
  async resolve(penaltyId: string) {
    return (prisma as any).wpsPenalty.update({
      where: { id: penaltyId },
      data: { status: 'RESOLVED', resolvedAt: new Date() },
    });
  }
  async list(tenantId: string, filter: { status?: string; period?: string } = {}) {
    return (prisma as any).wpsPenalty.findMany({
      where: { tenantId, ...filter },
      orderBy: { raisedAt: 'desc' },
    });
  }
}

export const wpsPenaltyService = new WpsPenaltyService();
