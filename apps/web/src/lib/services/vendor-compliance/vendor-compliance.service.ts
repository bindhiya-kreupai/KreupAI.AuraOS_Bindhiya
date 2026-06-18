/**
 * EPIC-34 — Vendor Compliance evaluators.
 *
 * S-VC-01 — vendor due-diligence cadence evaluator
 * S-VC-02 — conflict-of-interest disclosure checker
 * S-VC-03 — sanction-list screening
 */

// =============================================================================
// S-VC-01 — Vendor due diligence cadence
// =============================================================================

export interface Vendor {
  vendorId: string;
  name: string;
  /** Risk tier — drives the cadence. */
  riskTier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  /** Date of last full due diligence review. */
  lastDdAt?: Date;
}

export interface DdCadenceConfig {
  /** Days between reviews keyed by risk tier. */
  cadenceByTier?: Partial<Record<Vendor['riskTier'], number>>;
}

export type DdStatus = 'CURRENT' | 'DUE_SOON' | 'OVERDUE' | 'NEVER_REVIEWED';

export interface DdResult {
  vendorId: string;
  name: string;
  riskTier: Vendor['riskTier'];
  status: DdStatus;
  daysSinceReview?: number;
  cadenceDays: number;
  reason: { en: string; ar: string };
}

export interface DdReport {
  results: DdResult[];
  totals: { vendors: number; overdue: number; currentPct: number };
}

const DEFAULT_CADENCE: Record<Vendor['riskTier'], number> = {
  LOW: 1095, // 3y
  MEDIUM: 730, // 2y
  HIGH: 365, // 1y
  CRITICAL: 180, // 6m
};

export function evaluateVendorDueDiligence(
  vendors: Vendor[],
  config: DdCadenceConfig = {},
  asOf: Date = new Date()
): DdReport {
  const day = 24 * 3600 * 1000;
  const results: DdResult[] = vendors.map((v) => {
    const cadenceDays = config.cadenceByTier?.[v.riskTier] ?? DEFAULT_CADENCE[v.riskTier];
    if (!v.lastDdAt) {
      return {
        vendorId: v.vendorId,
        name: v.name,
        riskTier: v.riskTier,
        status: 'NEVER_REVIEWED',
        cadenceDays,
        reason: { en: 'Never reviewed', ar: 'لم تتم المراجعة' },
      };
    }
    const days = Math.floor((asOf.getTime() - v.lastDdAt.getTime()) / day);
    let status: DdStatus = 'CURRENT';
    if (days > cadenceDays) status = 'OVERDUE';
    else if (days > cadenceDays * 0.85) status = 'DUE_SOON';
    return {
      vendorId: v.vendorId,
      name: v.name,
      riskTier: v.riskTier,
      status,
      daysSinceReview: days,
      cadenceDays,
      reason: {
        en: `${days}d since last review, cadence ${cadenceDays}d (${v.riskTier})`,
        ar: `${days} يوم منذ آخر مراجعة`,
      },
    };
  });
  const overdue = results.filter(
    (r) => r.status === 'OVERDUE' || r.status === 'NEVER_REVIEWED'
  ).length;
  const current = results.filter((r) => r.status === 'CURRENT').length;
  return {
    results,
    totals: {
      vendors: results.length,
      overdue,
      currentPct: results.length === 0 ? 100 : Math.round((current / results.length) * 100),
    },
  };
}

// =============================================================================
// S-VC-02 — Conflict-of-interest disclosure checker
// =============================================================================

export interface CoiDisclosure {
  vendorId: string;
  declaredAt: Date;
  /** Is there a personal/financial relationship with an employee? */
  hasRelationship: boolean;
  /** Employee IDs related. */
  relatedEmployeeIds?: string[];
}

export interface VendorEmployeeLink {
  vendorId: string;
  /** Internal "champion" or decision-maker employee. */
  employeeId: string;
}

export interface CoiResult {
  vendorId: string;
  status: 'OK' | 'UNDISCLOSED_LINK' | 'DECLARED_LINK';
  reason: { en: string; ar: string };
}

export interface CoiReport {
  results: CoiResult[];
  totals: { vendors: number; undisclosed: number; declared: number };
}

export function evaluateConflictOfInterest(
  links: VendorEmployeeLink[],
  disclosures: CoiDisclosure[]
): CoiReport {
  const linksByVendor = new Map<string, Set<string>>();
  for (const l of links) {
    if (!linksByVendor.has(l.vendorId)) linksByVendor.set(l.vendorId, new Set());
    linksByVendor.get(l.vendorId)!.add(l.employeeId);
  }
  const vendorIds = new Set<string>([
    ...linksByVendor.keys(),
    ...disclosures.map((d) => d.vendorId),
  ]);
  const results: CoiResult[] = Array.from(vendorIds).map((vendorId) => {
    const links = linksByVendor.get(vendorId) ?? new Set<string>();
    const disclosure = disclosures.find((d) => d.vendorId === vendorId);
    const declared = disclosure?.hasRelationship ?? false;
    const declaredIds = new Set(disclosure?.relatedEmployeeIds ?? []);
    const undisclosed = Array.from(links).some((id) => !declaredIds.has(id));
    if (undisclosed && !declared) {
      return {
        vendorId,
        status: 'UNDISCLOSED_LINK',
        reason: {
          en: 'Vendor has an internal link that has not been disclosed',
          ar: 'لدى المورد علاقة داخلية غير مفصح عنها',
        },
      };
    }
    if (declared) {
      return {
        vendorId,
        status: 'DECLARED_LINK',
        reason: {
          en: 'Conflict of interest declared and on file',
          ar: 'تم الإفصاح عن تعارض المصالح',
        },
      };
    }
    return {
      vendorId,
      status: 'OK',
      reason: { en: 'No known conflict of interest', ar: 'لا يوجد تعارض مصالح معروف' },
    };
  });
  return {
    results,
    totals: {
      vendors: results.length,
      undisclosed: results.filter((r) => r.status === 'UNDISCLOSED_LINK').length,
      declared: results.filter((r) => r.status === 'DECLARED_LINK').length,
    },
  };
}

// =============================================================================
// S-VC-03 — Sanction list screening
// =============================================================================

export interface SanctionListEntry {
  listCode: string;
  /** Normalised lowercase name. */
  name: string;
  /** Optional country of the listed party. */
  country?: string;
}

export interface ScreeningResult {
  vendorId: string;
  name: string;
  hits: Array<{ listCode: string; matchedName: string }>;
  status: 'CLEAR' | 'POSSIBLE_MATCH' | 'CONFIRMED_HIT';
  reason: { en: string; ar: string };
}

export interface ScreeningReport {
  results: ScreeningResult[];
  totals: { vendors: number; hits: number; clearPct: number };
}

function norm(s: string) {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

export function screenAgainstSanctionList(
  vendors: Array<{ vendorId: string; name: string; country?: string }>,
  list: SanctionListEntry[]
): ScreeningReport {
  const results: ScreeningResult[] = vendors.map((v) => {
    const vendorName = norm(v.name);
    const hits: Array<{ listCode: string; matchedName: string }> = [];
    for (const entry of list) {
      const entryName = norm(entry.name);
      if (
        entryName === vendorName ||
        entryName.includes(vendorName) ||
        vendorName.includes(entryName)
      ) {
        hits.push({ listCode: entry.listCode, matchedName: entry.name });
      }
    }
    let status: ScreeningResult['status'] = 'CLEAR';
    if (hits.length > 0) {
      // Exact match → confirmed; substring → possible.
      const exact = hits.some((h) => norm(h.matchedName) === vendorName);
      status = exact ? 'CONFIRMED_HIT' : 'POSSIBLE_MATCH';
    }
    return {
      vendorId: v.vendorId,
      name: v.name,
      hits,
      status,
      reason: {
        en:
          hits.length === 0
            ? 'No sanction list match'
            : `${hits.length} match(es) on ${hits.map((h) => h.listCode).join(', ')}`,
        ar: hits.length === 0 ? 'لا توجد مطابقة' : `${hits.length} مطابقات`,
      },
    };
  });
  const clear = results.filter((r) => r.status === 'CLEAR').length;
  return {
    results,
    totals: {
      vendors: results.length,
      hits: results.length - clear,
      clearPct: results.length === 0 ? 100 : Math.round((clear / results.length) * 100),
    },
  };
}
