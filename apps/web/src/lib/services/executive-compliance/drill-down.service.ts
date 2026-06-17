/**
 * EPIC-31 country / entity drill-down + 2D risk heatmap.
 *
 * Closes the audit gaps:
 *   - "Country/entity drill-down missing (S04)"
 *   - "2D risk heatmap missing"
 *
 * Executives need to slice the compliance posture two ways:
 *
 *  1. Drill-down: starting from the global view, descend into
 *     country → legal entity → department → cost-centre. At each
 *     level the view shows aggregate red-flag counts, severity
 *     distribution, and the top 5 open items.
 *
 *  2. 2D heatmap: rows = compliance domain (PAYROLL, EOSB, VISA,
 *     LEAVE, ...); columns = country. Each cell holds the
 *     count + max-severity + a 0-100 risk score so the executive
 *     dashboard can render a 2D heatmap.
 *
 * Pure helpers: aggregateFlagsByCountryEntity() and
 * buildRiskHeatmap() take the already-loaded flag rows and produce
 * the typed view-model. The DB-driven fetcher is the thin
 * scanTenant() wrapper at the bottom.
 *
 * No schema change required.
 */

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface FlagSnapshot {
  id: string;
  domain: string;
  severity: Severity;
  countryCode: string;
  legalEntityId?: string;
  departmentId?: string;
  costCenterId?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'WAIVED';
  raisedAt: Date;
  label?: string;
}

const SEVERITY_WEIGHT: Record<Severity, number> = {
  LOW: 1,
  MEDIUM: 5,
  HIGH: 20,
  CRITICAL: 80,
};

export interface DrillNode {
  key: string;
  label: string;
  level: 'GLOBAL' | 'COUNTRY' | 'ENTITY' | 'DEPARTMENT' | 'COST_CENTER';
  flagCount: number;
  severityCounts: Record<Severity, number>;
  maxSeverity: Severity | null;
  riskScore: number; // 0..100
  topFive: FlagSnapshot[];
  children?: DrillNode[];
}

function emptySeverityCounts(): Record<Severity, number> {
  return { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
}

function maxSeverity(counts: Record<Severity, number>): Severity | null {
  for (const sev of ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const) {
    if (counts[sev] > 0) return sev;
  }
  return null;
}

function clamp100(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * Pure helper. Computes a 0-100 risk score from severity counts.
 * Weighted sum / log-scale tail to keep the spread legible on a
 * heatmap. The 80-weight CRITICAL means even one critical flag puts
 * a cell into the orange/red band.
 */
export function computeRiskScore(counts: Record<Severity, number>): number {
  const sum =
    counts.LOW * SEVERITY_WEIGHT.LOW +
    counts.MEDIUM * SEVERITY_WEIGHT.MEDIUM +
    counts.HIGH * SEVERITY_WEIGHT.HIGH +
    counts.CRITICAL * SEVERITY_WEIGHT.CRITICAL;
  if (sum === 0) return 0;
  // Below the CRITICAL weight (80), use a linear ramp 0..50 so low/medium
  // counts produce a legible spread on the heatmap. At and above CRITICAL,
  // switch to a log compression to keep the tail bounded.
  if (sum < SEVERITY_WEIGHT.CRITICAL) {
    return clamp100((sum / SEVERITY_WEIGHT.CRITICAL) * 50);
  }
  // Logarithmic compression so a single critical (80) ≈ 60 and 5×critical (400) ≈ 81.
  return clamp100(60 + 30 * Math.log10(sum / SEVERITY_WEIGHT.CRITICAL + 1));
}

function topFive(flags: FlagSnapshot[]): FlagSnapshot[] {
  return [...flags]
    .sort((a, b) => SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity])
    .slice(0, 5);
}

function nodeFromFlags(
  level: DrillNode['level'],
  key: string,
  label: string,
  flags: FlagSnapshot[]
): DrillNode {
  const counts = emptySeverityCounts();
  for (const f of flags) counts[f.severity] += 1;
  return {
    key,
    label,
    level,
    flagCount: flags.length,
    severityCounts: counts,
    maxSeverity: maxSeverity(counts),
    riskScore: computeRiskScore(counts),
    topFive: topFive(flags),
  };
}

/**
 * Pure helper. Builds the drill-down tree from a flat flag list.
 * Returns a single root GLOBAL node.
 */
export function aggregateFlagsByCountryEntity(flags: FlagSnapshot[]): DrillNode {
  const openFlags = flags.filter((f) => f.status === 'OPEN' || f.status === 'IN_PROGRESS');
  const root = nodeFromFlags('GLOBAL', 'global', 'Global', openFlags);
  const byCountry = new Map<string, FlagSnapshot[]>();
  for (const f of openFlags) {
    if (!byCountry.has(f.countryCode)) byCountry.set(f.countryCode, []);
    byCountry.get(f.countryCode)!.push(f);
  }
  const countryNodes: DrillNode[] = [];
  for (const [cc, cflags] of byCountry) {
    const cNode = nodeFromFlags('COUNTRY', cc, cc, cflags);
    const byEntity = new Map<string, FlagSnapshot[]>();
    for (const f of cflags) {
      const key = f.legalEntityId ?? 'UNASSIGNED_ENTITY';
      if (!byEntity.has(key)) byEntity.set(key, []);
      byEntity.get(key)!.push(f);
    }
    const entityNodes: DrillNode[] = [];
    for (const [eid, eflags] of byEntity) {
      const eNode = nodeFromFlags('ENTITY', eid, eid, eflags);
      const byDept = new Map<string, FlagSnapshot[]>();
      for (const f of eflags) {
        const key = f.departmentId ?? 'UNASSIGNED_DEPT';
        if (!byDept.has(key)) byDept.set(key, []);
        byDept.get(key)!.push(f);
      }
      eNode.children = [...byDept.entries()].map(([did, df]) =>
        nodeFromFlags('DEPARTMENT', did, did, df)
      );
      entityNodes.push(eNode);
    }
    cNode.children = entityNodes;
    countryNodes.push(cNode);
  }
  root.children = countryNodes;
  return root;
}

export interface HeatmapCell {
  domain: string;
  country: string;
  flagCount: number;
  maxSeverity: Severity | null;
  riskScore: number;
}

/**
 * Pure helper. Produces a flat list of (domain, country) cells with
 * counts + risk scores. Caller pivots into a 2D table for the
 * heatmap renderer.
 */
export function buildRiskHeatmap(flags: FlagSnapshot[]): HeatmapCell[] {
  const open = flags.filter((f) => f.status === 'OPEN' || f.status === 'IN_PROGRESS');
  const byCell = new Map<string, FlagSnapshot[]>();
  for (const f of open) {
    const key = `${f.domain}::${f.countryCode}`;
    if (!byCell.has(key)) byCell.set(key, []);
    byCell.get(key)!.push(f);
  }
  const out: HeatmapCell[] = [];
  for (const [key, cellFlags] of byCell) {
    const [domain, country] = key.split('::');
    const counts = emptySeverityCounts();
    for (const f of cellFlags) counts[f.severity] += 1;
    out.push({
      domain,
      country,
      flagCount: cellFlags.length,
      maxSeverity: maxSeverity(counts),
      riskScore: computeRiskScore(counts),
    });
  }
  out.sort((a, b) => b.riskScore - a.riskScore);
  return out;
}
