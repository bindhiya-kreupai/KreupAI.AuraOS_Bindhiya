/**
 * Emiratisation / Nitaqat (Saudisation) Service — GCC Nationalisation Compliance
 *
 * UAE — Emiratisation:
 *  Targets set by MoHRE (Ministry of Human Resources & Emiratisation).
 *  As of 2024: Private companies with 50+ employees must maintain 2% Emirati quota
 *  increasing by 1% each year. Companies with fewer than 50 employees: 1 Emirati mandatory.
 *  Non-compliance penalty: AED 6,000/month per missing Emirati (2024 rates).
 *  Sectors: Financial, Insurance, ICT, Retail, Hospitality, Health, Education, etc.
 *
 * KSA — Nitaqat (Saudisation):
 *  MOL (Ministry of Labour) categorises companies into bands:
 *    Platinum  : Exceeds target by ≥7%
 *    Green High: Within target (two sub-bands)
 *    Green Low : Within target
 *    Yellow    : Below target (limited government services)
 *    Red       : Well below target (cannot hire expats, renew visas)
 *  Target ratios vary by sector (ISIC classification) and company size.
 *
 * References:
 *  UAE: MoHRE Federal Decree Law No. 20 of 2023 on Emiratisation
 *  KSA: MOL Ministerial Resolution No. 4040 (Nitaqat 2.0, 2023)
 */

import { z } from 'zod';
import Decimal from 'decimal.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Constants — UAE Emiratisation
// ---------------------------------------------------------------------------

/** AED penalty per missing Emirati per month (2024) */
export const UAE_EMIRATISATION_MONTHLY_PENALTY = new Decimal(6000);

/** Companies with ≥50 employees: minimum 2% Emirati quota (increasing 1%/year) */
export const UAE_LARGE_COMPANY_MIN_QUOTA = new Decimal('0.02');

/** Companies with <50 employees: at least 1 Emirati mandatory for select sectors */
export const UAE_SMALL_COMPANY_MIN_COUNT = 1;

// ---------------------------------------------------------------------------
// Constants — KSA Nitaqat Bands
// ---------------------------------------------------------------------------

export type NitaqatBand = 'PLATINUM' | 'GREEN_HIGH' | 'GREEN_LOW' | 'YELLOW' | 'RED';

interface NitaqatBandDefinition {
  band: NitaqatBand;
  label: string;
  colorClass: string;
  description: string;
}

export const NITAQAT_BANDS: NitaqatBandDefinition[] = [
  { band: 'PLATINUM', label: 'Platinum', colorClass: 'platinum', description: 'Exceeds target by ≥7% — maximum benefits, fast visa processing' },
  { band: 'GREEN_HIGH', label: 'Green (High)', colorClass: 'green', description: 'Meets or exceeds target — full government service access' },
  { band: 'GREEN_LOW', label: 'Green (Low)', colorClass: 'green', description: 'Near target — full services with monitoring' },
  { band: 'YELLOW', label: 'Yellow', colorClass: 'yellow', description: 'Below target — limited new visa allocation, cannot transfer Iqama from Red' },
  { band: 'RED', label: 'Red', colorClass: 'red', description: 'Well below target — cannot hire expats, renew visas, or register new entities' },
];

// ---------------------------------------------------------------------------
// Sector-specific Nitaqat targets (sampled from MOL Resolution 4040)
// ---------------------------------------------------------------------------

interface SectorTarget {
  sectorCode: string;
  sectorName: string;
  smallTarget: number;   // < 6 employees
  mediumTarget: number;  // 6-49 employees
  largeTarget: number;   // 50-499 employees
  giantTarget: number;   // 500+ employees
}

export const KSA_SECTOR_TARGETS: SectorTarget[] = [
  { sectorCode: '47', sectorName: 'Retail Trade', smallTarget: 0, mediumTarget: 0.22, largeTarget: 0.25, giantTarget: 0.30 },
  { sectorCode: '64', sectorName: 'Financial Services & Banking', smallTarget: 0, mediumTarget: 0.50, largeTarget: 0.60, giantTarget: 0.70 },
  { sectorCode: '62', sectorName: 'IT & Software', smallTarget: 0, mediumTarget: 0.20, largeTarget: 0.25, giantTarget: 0.30 },
  { sectorCode: '86', sectorName: 'Human Health', smallTarget: 0, mediumTarget: 0.15, largeTarget: 0.20, giantTarget: 0.25 },
  { sectorCode: '41', sectorName: 'Construction', smallTarget: 0, mediumTarget: 0.06, largeTarget: 0.08, giantTarget: 0.10 },
  { sectorCode: '55', sectorName: 'Accommodation & Hotels', smallTarget: 0, mediumTarget: 0.15, largeTarget: 0.20, giantTarget: 0.25 },
  { sectorCode: '61', sectorName: 'Telecommunications', smallTarget: 0, mediumTarget: 0.30, largeTarget: 0.35, giantTarget: 0.40 },
  { sectorCode: '85', sectorName: 'Education', smallTarget: 0, mediumTarget: 0.35, largeTarget: 0.40, giantTarget: 0.50 },
  { sectorCode: 'DEFAULT', sectorName: 'Other Sectors', smallTarget: 0, mediumTarget: 0.10, largeTarget: 0.15, giantTarget: 0.20 },
];

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

export const EmiratiRatioSchema = z.object({
  entityId: z.string().uuid(),
  sectorCode: z.string().optional(),
});

export const NitaqatRatioSchema = z.object({
  entityId: z.string().uuid(),
  sectorCode: z.string(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EmiratiComplianceData {
  entityId: string;
  totalEmployees: number;
  emiratiCount: number;
  nonEmiratiCount: number;
  currentRatio: Decimal;
  requiredRatio: Decimal;
  requiredCount: number;
  gap: number; // How many more Emiratis needed (negative = surplus)
  monthlyPenalty: Decimal | null; // Null if compliant
  isCompliant: boolean;
  departmentBreakdown: DepartmentNationalisationData[];
}

export interface NitaqatComplianceData {
  entityId: string;
  sectorCode: string;
  sectorName: string;
  totalEmployees: number;
  saudiCount: number;
  nonSaudiCount: number;
  currentRatio: Decimal;
  targetRatio: Decimal;
  band: NitaqatBand;
  bandLabel: string;
  gap: number;
  isCompliant: boolean;
  gapToNextBand: number | null;
  departmentBreakdown: DepartmentNationalisationData[];
}

export interface DepartmentNationalisationData {
  department: string;
  totalEmployees: number;
  nationalCount: number;
  ratio: Decimal;
  gap: number;
}

export interface NationalisationTrend {
  period: string;
  ratio: Decimal;
  nationalCount: number;
  totalCount: number;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const MOCK_UAE_DEPARTMENTS: DepartmentNationalisationData[] = [
  { department: 'Executive', totalEmployees: 8, nationalCount: 4, ratio: new Decimal('0.50'), gap: 0 },
  { department: 'Finance', totalEmployees: 22, nationalCount: 3, ratio: new Decimal('0.136'), gap: -1 },
  { department: 'Sales', totalEmployees: 55, nationalCount: 2, ratio: new Decimal('0.036'), gap: 1 },
  { department: 'IT/Engineering', totalEmployees: 82, nationalCount: 2, ratio: new Decimal('0.024'), gap: 0 },
  { department: 'Operations', totalEmployees: 70, nationalCount: 1, ratio: new Decimal('0.014'), gap: 1 },
  { department: 'HR', totalEmployees: 18, nationalCount: 1, ratio: new Decimal('0.056'), gap: 0 },
];

const MOCK_KSA_DEPARTMENTS: DepartmentNationalisationData[] = [
  { department: 'Executive', totalEmployees: 10, nationalCount: 6, ratio: new Decimal('0.60'), gap: 0 },
  { department: 'Finance', totalEmployees: 25, nationalCount: 12, ratio: new Decimal('0.48'), gap: 1 },
  { department: 'Sales', totalEmployees: 60, nationalCount: 18, ratio: new Decimal('0.30'), gap: 0 },
  { department: 'IT/Engineering', totalEmployees: 55, nationalCount: 12, ratio: new Decimal('0.218'), gap: 2 },
  { department: 'Operations', totalEmployees: 35, nationalCount: 16, ratio: new Decimal('0.457'), gap: 0 },
];

const MOCK_UAE_TREND: NationalisationTrend[] = [
  { period: '2025-03', ratio: new Decimal('0.044'), nationalCount: 11, totalCount: 247 },
  { period: '2025-06', ratio: new Decimal('0.048'), nationalCount: 12, totalCount: 248 },
  { period: '2025-09', ratio: new Decimal('0.052'), nationalCount: 13, totalCount: 248 },
  { period: '2025-12', ratio: new Decimal('0.052'), nationalCount: 13, totalCount: 249 },
  { period: '2026-01', ratio: new Decimal('0.052'), nationalCount: 13, totalCount: 249 },
  { period: '2026-02', ratio: new Decimal('0.056'), nationalCount: 14, totalCount: 249 },
];

const MOCK_KSA_TREND: NationalisationTrend[] = [
  { period: '2025-03', ratio: new Decimal('0.332'), nationalCount: 58, totalCount: 175 },
  { period: '2025-06', ratio: new Decimal('0.340'), nationalCount: 60, totalCount: 176 },
  { period: '2025-09', ratio: new Decimal('0.351'), nationalCount: 63, totalCount: 179 },
  { period: '2025-12', ratio: new Decimal('0.358'), nationalCount: 65, totalCount: 181 },
  { period: '2026-01', ratio: new Decimal('0.360'), nationalCount: 65, totalCount: 180 },
  { period: '2026-02', ratio: new Decimal('0.364'), nationalCount: 66, totalCount: 181 },
];

// ---------------------------------------------------------------------------
// Emiratisation / Nitaqat Service
// ---------------------------------------------------------------------------

export class EmiratisationService {

  // ─── UAE Emiratisation ────────────────────────────────────────────────────

  async calculateEmiratiRatio(entityId: string): Promise<EmiratiComplianceData> {
    // In production: query employee records from DB
    const totalEmployees = 249;
    const emiratiCount = 14;
    const nonEmiratiCount = totalEmployees - emiratiCount;
    const currentRatio = new Decimal(emiratiCount).div(totalEmployees).toDecimalPlaces(4);

    // Required ratio: 2% (as of 2024, increasing 1%/year)
    const requiredRatio = UAE_LARGE_COMPANY_MIN_QUOTA; // 2% for 2024
    const requiredCount = Math.ceil(totalEmployees * requiredRatio.toNumber());
    const gap = requiredCount - emiratiCount; // Positive = need more Emiratis

    const isCompliant = gap <= 0;
    const monthlyPenalty = !isCompliant
      ? UAE_EMIRATISATION_MONTHLY_PENALTY.mul(Math.abs(gap))
      : null;

    return {
      entityId,
      totalEmployees,
      emiratiCount,
      nonEmiratiCount,
      currentRatio,
      requiredRatio,
      requiredCount,
      gap,
      monthlyPenalty,
      isCompliant,
      departmentBreakdown: MOCK_UAE_DEPARTMENTS,
    };
  }

  getEmiratiTarget(sectorCode: string, companySize: number): Decimal {
    if (companySize < 50) return new Decimal(0); // 1 mandatory Emirati but no percentage target
    // 2% for 2024, increasing 1%/year
    return UAE_LARGE_COMPANY_MIN_QUOTA;
  }

  async generateEmiratiReport(entityId: string): Promise<{
    entityId: string;
    reportDate: Date;
    data: EmiratiComplianceData;
    trendData: NationalisationTrend[];
    fileName: string;
  }> {
    const data = await this.calculateEmiratiRatio(entityId);
    return {
      entityId,
      reportDate: new Date(),
      data,
      trendData: MOCK_UAE_TREND,
      fileName: `EMIRATISATION_REPORT_${entityId}_${new Date().toISOString().slice(0, 7)}.pdf`,
    };
  }

  getEmiratiTrend(entityId: string): NationalisationTrend[] {
    return MOCK_UAE_TREND;
  }

  // ─── KSA Nitaqat ─────────────────────────────────────────────────────────

  async calculateSaudiRatio(entityId: string): Promise<NitaqatComplianceData> {
    const totalEmployees = 181;
    const saudiCount = 66;
    const nonSaudiCount = totalEmployees - saudiCount;
    const currentRatio = new Decimal(saudiCount).div(totalEmployees).toDecimalPlaces(4);

    const sectorCode = '62'; // IT sector default for mock
    const targetRatio = new Decimal(this.getTargetRatio(sectorCode, totalEmployees));
    const gap = Math.ceil(totalEmployees * targetRatio.toNumber()) - saudiCount;
    const band = this.getNitaqatBand(sectorCode, totalEmployees, currentRatio.toNumber());

    return {
      entityId,
      sectorCode,
      sectorName: 'IT & Software',
      totalEmployees,
      saudiCount,
      nonSaudiCount,
      currentRatio,
      targetRatio,
      band,
      bandLabel: NITAQAT_BANDS.find(b => b.band === band)?.label ?? band,
      gap,
      isCompliant: band !== 'RED' && band !== 'YELLOW',
      gapToNextBand: this.getGapToNextBand(sectorCode, totalEmployees, currentRatio.toNumber()),
      departmentBreakdown: MOCK_KSA_DEPARTMENTS,
    };
  }

  getNitaqatBand(sectorCode: string, companySize: number, actualRatio: number): NitaqatBand {
    const target = this.getTargetRatio(sectorCode, companySize);
    const diff = actualRatio - target;

    if (diff >= 0.07) return 'PLATINUM';
    if (diff >= 0.03) return 'GREEN_HIGH';
    if (diff >= 0) return 'GREEN_LOW';
    if (diff >= -0.05) return 'YELLOW';
    return 'RED';
  }

  getTargetRatio(sectorCode: string, companySize: number): number {
    const sector = KSA_SECTOR_TARGETS.find(s => s.sectorCode === sectorCode)
      ?? KSA_SECTOR_TARGETS.find(s => s.sectorCode === 'DEFAULT')!;

    if (companySize < 6) return sector.smallTarget;
    if (companySize < 50) return sector.mediumTarget;
    if (companySize < 500) return sector.largeTarget;
    return sector.giantTarget;
  }

  private getGapToNextBand(sectorCode: string, companySize: number, currentRatio: number): number | null {
    const target = this.getTargetRatio(sectorCode, companySize);
    const band = this.getNitaqatBand(sectorCode, companySize, currentRatio);

    const bandThresholds: Record<string, number> = {
      RED: target - 0.05,
      YELLOW: target,
      GREEN_LOW: target + 0.03,
      GREEN_HIGH: target + 0.07,
      PLATINUM: Infinity,
    };

    const nextRatio = bandThresholds[band];
    if (nextRatio === Infinity) return null;
    return Math.ceil((nextRatio - currentRatio) * companySize);
  }

  async generateNitaqatReport(entityId: string): Promise<{
    entityId: string;
    reportDate: Date;
    data: NitaqatComplianceData;
    trendData: NationalisationTrend[];
    fileName: string;
  }> {
    const data = await this.calculateSaudiRatio(entityId);
    return {
      entityId,
      reportDate: new Date(),
      data,
      trendData: MOCK_KSA_TREND,
      fileName: `NITAQAT_REPORT_${entityId}_${new Date().toISOString().slice(0, 7)}.pdf`,
    };
  }

  getNitaqatTrend(entityId: string): NationalisationTrend[] {
    return MOCK_KSA_TREND;
  }

  getAllBandDefinitions(): NitaqatBandDefinition[] {
    return NITAQAT_BANDS;
  }
}

// Singleton export
export const emiratisationService = new EmiratisationService();
