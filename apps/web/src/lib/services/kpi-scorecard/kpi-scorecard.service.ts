import { prisma } from '@aura/database';

export interface ScorecardLine {
  domain: string;
  weight: number;
  greenCount: number;
  amberCount: number;
  redCount: number;
  total: number;
  domainScore: number;
  domainRag: 'GREEN' | 'AMBER' | 'RED' | null;
}

export interface ScorecardResult {
  period: string;
  overallScore: number;
  overallRag: 'GREEN' | 'AMBER' | 'RED' | null;
  lines: ScorecardLine[];
}

const RAG_POINTS: Record<string, number> = { GREEN: 100, AMBER: 60, RED: 20 };

function ragOfScore(score: number): 'GREEN' | 'AMBER' | 'RED' {
  if (score >= 85) return 'GREEN';
  if (score >= 70) return 'AMBER';
  return 'RED';
}

/**
 * EPIC-38-S07: executive compliance scorecard roll-up.
 *
 * Score per domain = weighted average of GREEN(100) / AMBER(60) / RED(20)
 * points across all KPI values in the period. Overall score = weighted average
 * of domain scores using configured domain weights.
 */
export class KpiScorecardService {
  async compute(tenantId: string, period: string): Promise<ScorecardResult> {
    const values = await (prisma as any).kpiValue.findMany({
      where: { tenantId, period },
    });
    const defs = await (prisma as any).kpiDefinition.findMany({
      where: { tenantId, status: 'ACTIVE' },
    });
    const domainByCode = new Map<string, string>();
    for (const d of defs as Array<{ code: string; domain: string }>) {
      domainByCode.set(d.code, d.domain);
    }
    const weights = await (prisma as any).kpiScorecardWeight.findMany({ where: { tenantId } });
    const weightByDomain = new Map<string, number>();
    for (const w of weights as Array<{ domain: string; weight: number }>) {
      weightByDomain.set(w.domain, w.weight);
    }

    const buckets = new Map<string, ScorecardLine>();
    for (const v of values as Array<{ kpiCode: string; ragStatus: string | null }>) {
      const domain = domainByCode.get(v.kpiCode);
      if (!domain) continue;
      const line =
        buckets.get(domain) ??
        ({
          domain,
          weight: weightByDomain.get(domain) ?? 0,
          greenCount: 0,
          amberCount: 0,
          redCount: 0,
          total: 0,
          domainScore: 0,
          domainRag: null,
        } as ScorecardLine);
      if (v.ragStatus === 'GREEN') line.greenCount += 1;
      else if (v.ragStatus === 'AMBER') line.amberCount += 1;
      else if (v.ragStatus === 'RED') line.redCount += 1;
      line.total += 1;
      buckets.set(domain, line);
    }

    let weightedSum = 0;
    let weightSum = 0;
    const lines = Array.from(buckets.values()).map((line) => {
      if (line.total === 0) {
        return { ...line, domainScore: 0, domainRag: null };
      }
      const pts =
        line.greenCount * RAG_POINTS.GREEN +
        line.amberCount * RAG_POINTS.AMBER +
        line.redCount * RAG_POINTS.RED;
      const domainScore = Math.round((pts / line.total) * 100) / 100;
      const domainRag = ragOfScore(domainScore);
      if (line.weight > 0) {
        weightedSum += domainScore * line.weight;
        weightSum += line.weight;
      }
      return { ...line, domainScore, domainRag };
    });

    const overallScore = weightSum > 0 ? Math.round((weightedSum / weightSum) * 100) / 100 : 0;
    const overallRag = weightSum > 0 ? ragOfScore(overallScore) : null;
    return { period, overallScore, overallRag, lines };
  }
}

export const kpiScorecardService = new KpiScorecardService();
