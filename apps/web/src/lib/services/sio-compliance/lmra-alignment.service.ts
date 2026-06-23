/**
 * EPIC-15-S11 Bahrain SIO ↔ LMRA alignment service.
 *
 * Closes the audit gap "LMRA alignment service entirely missing
 * (S11)". The Bahrain Social Insurance Organization (SIO) and the
 * Labour Market Regulatory Authority (LMRA) maintain separate
 * registers of expatriate workers. Compliance officers reconcile
 * the two monthly; mismatches indicate undisclosed hires,
 * undeclared exits, or LMRA permits where no SIO contribution is
 * being made (or vice versa).
 *
 * This service produces a typed alignment report:
 *   align(input) → {
 *     onlyInSio:   [...workers SIO sees but LMRA doesn't],
 *     onlyInLmra:  [...workers LMRA sees but SIO doesn't],
 *     wageMismatch:[...workers where the declared wage differs by > tolerance],
 *     statusMismatch: [...active/inactive divergence],
 *     summary: { totalSio, totalLmra, onlyInSio, onlyInLmra,
 *                wageMismatch, statusMismatch, alignmentPct }
 *   }
 *
 * Two-way diff with a small tolerance (default 1.00 BHD) on wages
 * to avoid noise from FX rounding. All wage values are normalised
 * to BHD prior to comparison.
 *
 * Pure helpers, no IO. The DB-driven wrapper that pulls live SIO +
 * LMRA snapshots is a thin shell on top.
 */

export interface AlignmentRecord {
  cpr: string; // Bahrain CPR — the join key
  fullName?: string;
  declaredWageBhd: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface AlignmentInput {
  sioRecords: AlignmentRecord[];
  lmraRecords: AlignmentRecord[];
  wageToleranceBhd?: number;
}

export interface AlignmentMismatch {
  cpr: string;
  fullName?: string;
  sioWage?: number;
  lmraWage?: number;
  delta?: number;
  sioStatus?: 'ACTIVE' | 'INACTIVE';
  lmraStatus?: 'ACTIVE' | 'INACTIVE';
}

export interface AlignmentReport {
  onlyInSio: AlignmentRecord[];
  onlyInLmra: AlignmentRecord[];
  wageMismatch: AlignmentMismatch[];
  statusMismatch: AlignmentMismatch[];
  summary: {
    totalSio: number;
    totalLmra: number;
    onlyInSio: number;
    onlyInLmra: number;
    wageMismatch: number;
    statusMismatch: number;
    alignmentPct: number;
  };
}

/**
 * Pure helper. Performs the diff on the two collections and
 * produces the typed AlignmentReport.
 */
export function alignSioLmra(input: AlignmentInput): AlignmentReport {
  const tol = input.wageToleranceBhd ?? 1.0;
  const sioByCpr = new Map(input.sioRecords.map((r) => [r.cpr, r]));
  const lmraByCpr = new Map(input.lmraRecords.map((r) => [r.cpr, r]));

  const onlyInSio: AlignmentRecord[] = [];
  const onlyInLmra: AlignmentRecord[] = [];
  const wageMismatch: AlignmentMismatch[] = [];
  const statusMismatch: AlignmentMismatch[] = [];

  for (const [cpr, sio] of sioByCpr) {
    const lmra = lmraByCpr.get(cpr);
    if (!lmra) {
      onlyInSio.push(sio);
      continue;
    }
    const delta = Math.round((sio.declaredWageBhd - lmra.declaredWageBhd) * 100) / 100;
    if (Math.abs(delta) > tol) {
      wageMismatch.push({
        cpr,
        fullName: sio.fullName ?? lmra.fullName,
        sioWage: sio.declaredWageBhd,
        lmraWage: lmra.declaredWageBhd,
        delta,
      });
    }
    if (sio.status !== lmra.status) {
      statusMismatch.push({
        cpr,
        fullName: sio.fullName ?? lmra.fullName,
        sioStatus: sio.status,
        lmraStatus: lmra.status,
      });
    }
  }
  for (const [cpr, lmra] of lmraByCpr) {
    if (!sioByCpr.has(cpr)) onlyInLmra.push(lmra);
  }

  const total = Math.max(sioByCpr.size, lmraByCpr.size, 1);
  const aligned =
    total - onlyInSio.length - onlyInLmra.length - wageMismatch.length - statusMismatch.length;
  const alignmentPct = Math.round((aligned / total) * 10000) / 100;

  return {
    onlyInSio,
    onlyInLmra,
    wageMismatch,
    statusMismatch,
    summary: {
      totalSio: sioByCpr.size,
      totalLmra: lmraByCpr.size,
      onlyInSio: onlyInSio.length,
      onlyInLmra: onlyInLmra.length,
      wageMismatch: wageMismatch.length,
      statusMismatch: statusMismatch.length,
      alignmentPct,
    },
  };
}
