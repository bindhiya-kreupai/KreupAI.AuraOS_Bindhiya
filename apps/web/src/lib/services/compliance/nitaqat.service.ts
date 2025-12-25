/**
 * Nitaqat (Saudization) Service - Saudi Arabia
 * Tracks and manages Saudization ratios for companies in KSA
 */

import type { NitaqatBand, NitaqatStatus, NitaqatRecommendation } from './types';

// ============================================================================
// NITAQAT THRESHOLDS BY COMPANY SIZE AND INDUSTRY
// ============================================================================

interface NitaqatThreshold {
  small: { min: number; max: number; thresholds: Record<NitaqatBand, number> };
  medium: { min: number; max: number; thresholds: Record<NitaqatBand, number> };
  large: { min: number; max: number; thresholds: Record<NitaqatBand, number> };
  giant: { min: number; max: number; thresholds: Record<NitaqatBand, number> };
}

// Default thresholds (varies by industry - these are general commercial)
const DEFAULT_THRESHOLDS: NitaqatThreshold = {
  small: {
    min: 6,
    max: 49,
    thresholds: {
      PLATINUM: 40,
      GREEN_HIGH: 27,
      GREEN_MEDIUM: 20,
      GREEN_LOW: 10,
      YELLOW: 5,
      RED: 0,
    },
  },
  medium: {
    min: 50,
    max: 499,
    thresholds: {
      PLATINUM: 44,
      GREEN_HIGH: 29,
      GREEN_MEDIUM: 22,
      GREEN_LOW: 12,
      YELLOW: 6,
      RED: 0,
    },
  },
  large: {
    min: 500,
    max: 2999,
    thresholds: {
      PLATINUM: 48,
      GREEN_HIGH: 32,
      GREEN_MEDIUM: 25,
      GREEN_LOW: 15,
      YELLOW: 7,
      RED: 0,
    },
  },
  giant: {
    min: 3000,
    max: Infinity,
    thresholds: {
      PLATINUM: 52,
      GREEN_HIGH: 35,
      GREEN_MEDIUM: 28,
      GREEN_LOW: 18,
      YELLOW: 9,
      RED: 0,
    },
  },
};

// Industry-specific thresholds
const INDUSTRY_THRESHOLDS: Record<string, Partial<NitaqatThreshold>> = {
  // Retail Trade
  47: {
    small: {
      min: 6,
      max: 49,
      thresholds: {
        PLATINUM: 35,
        GREEN_HIGH: 25,
        GREEN_MEDIUM: 18,
        GREEN_LOW: 10,
        YELLOW: 5,
        RED: 0,
      },
    },
  },
  // Construction
  41: {
    small: {
      min: 6,
      max: 49,
      thresholds: {
        PLATINUM: 25,
        GREEN_HIGH: 15,
        GREEN_MEDIUM: 10,
        GREEN_LOW: 6,
        YELLOW: 3,
        RED: 0,
      },
    },
  },
  // IT & Technology
  62: {
    small: {
      min: 6,
      max: 49,
      thresholds: {
        PLATINUM: 50,
        GREEN_HIGH: 35,
        GREEN_MEDIUM: 25,
        GREEN_LOW: 15,
        YELLOW: 8,
        RED: 0,
      },
    },
  },
  // Hospitality
  55: {
    small: {
      min: 6,
      max: 49,
      thresholds: {
        PLATINUM: 30,
        GREEN_HIGH: 20,
        GREEN_MEDIUM: 15,
        GREEN_LOW: 8,
        YELLOW: 4,
        RED: 0,
      },
    },
  },
};

// Band colors for UI
export const NITAQAT_BAND_COLORS: Record<NitaqatBand, { bg: string; text: string; nameEn: string; nameAr: string }> = {
  PLATINUM: { bg: '#E5E4E2', text: '#1a1a1a', nameEn: 'Platinum', nameAr: 'البلاتيني' },
  GREEN_HIGH: { bg: '#006400', text: '#ffffff', nameEn: 'High Green', nameAr: 'الأخضر المرتفع' },
  GREEN_MEDIUM: { bg: '#228B22', text: '#ffffff', nameEn: 'Medium Green', nameAr: 'الأخضر المتوسط' },
  GREEN_LOW: { bg: '#90EE90', text: '#1a1a1a', nameEn: 'Low Green', nameAr: 'الأخضر المنخفض' },
  YELLOW: { bg: '#FFD700', text: '#1a1a1a', nameEn: 'Yellow', nameAr: 'الأصفر' },
  RED: { bg: '#DC143C', text: '#ffffff', nameEn: 'Red', nameAr: 'الأحمر' },
};

// ============================================================================
// NITAQAT SERVICE
// ============================================================================

export class NitaqatService {
  /**
   * Calculate Nitaqat status for a company
   */
  static calculateStatus(
    companyId: string,
    industryCode: string,
    industryName: string,
    totalEmployees: number,
    saudiEmployees: number
  ): NitaqatStatus {
    const nonSaudiEmployees = totalEmployees - saudiEmployees;
    const currentRatio = totalEmployees > 0 ? (saudiEmployees / totalEmployees) * 100 : 0;

    // Determine company size band
    const sizeBand = this.getCompanySizeBand(totalEmployees);

    // Get thresholds for industry and size
    const thresholds = this.getThresholds(industryCode, sizeBand);

    // Determine current band
    const band = this.determineBand(currentRatio, thresholds);

    // Calculate required ratio for next band
    const requiredRatio = this.getRequiredRatioForNextBand(band, thresholds);

    // Calculate deficit/surplus
    const requiredSaudis = Math.ceil((requiredRatio / 100) * totalEmployees);
    const deficit = Math.max(0, requiredSaudis - saudiEmployees);
    const surplus = Math.max(0, saudiEmployees - requiredSaudis);

    // Generate recommendations
    const recommendations = this.generateRecommendations(band, deficit, currentRatio, requiredRatio);

    return {
      companyId,
      industryCode,
      industryName,
      companySizeBand: sizeBand,
      totalEmployees,
      saudiEmployees,
      nonSaudiEmployees,
      currentRatio: Math.round(currentRatio * 100) / 100,
      requiredRatio,
      band,
      deficit,
      surplus,
      recommendations,
    };
  }

  /**
   * Determine company size band based on total employees
   */
  static getCompanySizeBand(totalEmployees: number): 'Small' | 'Medium' | 'Large' | 'Giant' {
    if (totalEmployees < 50) return 'Small';
    if (totalEmployees < 500) return 'Medium';
    if (totalEmployees < 3000) return 'Large';
    return 'Giant';
  }

  /**
   * Get thresholds for a specific industry and size
   */
  private static getThresholds(
    industryCode: string,
    sizeBand: 'Small' | 'Medium' | 'Large' | 'Giant'
  ): Record<NitaqatBand, number> {
    const sizeBandKey = sizeBand.toLowerCase() as 'small' | 'medium' | 'large' | 'giant';
    const industryThresholds = INDUSTRY_THRESHOLDS[industryCode];

    if (industryThresholds && industryThresholds[sizeBandKey]) {
      return industryThresholds[sizeBandKey]!.thresholds;
    }

    return DEFAULT_THRESHOLDS[sizeBandKey].thresholds;
  }

  /**
   * Determine Nitaqat band based on ratio and thresholds
   */
  private static determineBand(
    ratio: number,
    thresholds: Record<NitaqatBand, number>
  ): NitaqatBand {
    if (ratio >= thresholds.PLATINUM) return 'PLATINUM';
    if (ratio >= thresholds.GREEN_HIGH) return 'GREEN_HIGH';
    if (ratio >= thresholds.GREEN_MEDIUM) return 'GREEN_MEDIUM';
    if (ratio >= thresholds.GREEN_LOW) return 'GREEN_LOW';
    if (ratio >= thresholds.YELLOW) return 'YELLOW';
    return 'RED';
  }

  /**
   * Get required ratio for moving to next band
   */
  private static getRequiredRatioForNextBand(
    currentBand: NitaqatBand,
    thresholds: Record<NitaqatBand, number>
  ): number {
    switch (currentBand) {
      case 'PLATINUM':
        return thresholds.PLATINUM; // Already at top
      case 'GREEN_HIGH':
        return thresholds.PLATINUM;
      case 'GREEN_MEDIUM':
        return thresholds.GREEN_HIGH;
      case 'GREEN_LOW':
        return thresholds.GREEN_MEDIUM;
      case 'YELLOW':
        return thresholds.GREEN_LOW;
      case 'RED':
        return thresholds.YELLOW;
      default:
        return thresholds.GREEN_LOW;
    }
  }

  /**
   * Generate recommendations based on current status
   */
  private static generateRecommendations(
    band: NitaqatBand,
    deficit: number,
    currentRatio: number,
    requiredRatio: number
  ): NitaqatRecommendation[] {
    const recommendations: NitaqatRecommendation[] = [];

    if (band === 'PLATINUM') {
      recommendations.push({
        type: 'MAINTAIN',
        message: 'Maintain current Saudization ratio to keep Platinum status',
        messageAr: 'حافظ على نسبة التوطين الحالية للحفاظ على الفئة البلاتينية',
        priority: 'LOW',
      });
    } else if (band === 'RED') {
      recommendations.push({
        type: 'HIRE_SAUDI',
        message: `URGENT: Hire ${deficit} Saudi employees immediately to exit Red band`,
        messageAr: `عاجل: وظّف ${deficit} موظف سعودي فوراً للخروج من النطاق الأحمر`,
        priority: 'HIGH',
      });
      recommendations.push({
        type: 'REDUCE_EXPAT',
        message: 'Consider reducing expat workforce to improve ratio',
        messageAr: 'فكر في تقليل عدد العمالة الوافدة لتحسين النسبة',
        priority: 'HIGH',
      });
    } else if (band === 'YELLOW') {
      recommendations.push({
        type: 'HIRE_SAUDI',
        message: `Hire ${deficit} Saudi employees to move to Green zone`,
        messageAr: `وظّف ${deficit} موظف سعودي للانتقال إلى المنطقة الخضراء`,
        priority: 'HIGH',
      });
    } else {
      // Green bands
      recommendations.push({
        type: 'IMPROVE',
        message: `Hire ${deficit} more Saudi employees to reach next band (${requiredRatio}%)`,
        messageAr: `وظّف ${deficit} موظف سعودي إضافي للوصول إلى الفئة التالية (${requiredRatio}%)`,
        priority: 'MEDIUM',
      });
    }

    return recommendations;
  }

  /**
   * Calculate how many Saudis needed to reach a specific band
   */
  static calculateSaudisNeededForBand(
    totalEmployees: number,
    currentSaudis: number,
    targetBand: NitaqatBand,
    industryCode: string
  ): { needed: number; newRatio: number } {
    const sizeBand = this.getCompanySizeBand(totalEmployees);
    const thresholds = this.getThresholds(industryCode, sizeBand);
    const targetRatio = thresholds[targetBand];

    const neededForTarget = Math.ceil((targetRatio / 100) * totalEmployees);
    const needed = Math.max(0, neededForTarget - currentSaudis);
    const newRatio = ((currentSaudis + needed) / totalEmployees) * 100;

    return { needed, newRatio };
  }

  /**
   * Simulate impact of hiring/reducing employees
   */
  static simulateChange(
    currentStatus: NitaqatStatus,
    saudiChange: number,
    nonSaudiChange: number,
    industryCode: string
  ): NitaqatStatus {
    const newSaudis = Math.max(0, currentStatus.saudiEmployees + saudiChange);
    const newNonSaudis = Math.max(0, currentStatus.nonSaudiEmployees + nonSaudiChange);
    const newTotal = newSaudis + newNonSaudis;

    return this.calculateStatus(
      currentStatus.companyId,
      industryCode,
      currentStatus.industryName,
      newTotal,
      newSaudis
    );
  }

  /**
   * Get band benefits and restrictions
   */
  static getBandBenefits(band: NitaqatBand): {
    benefits: { en: string; ar: string }[];
    restrictions: { en: string; ar: string }[];
  } {
    switch (band) {
      case 'PLATINUM':
        return {
          benefits: [
            { en: 'Unlimited visa issuance', ar: 'إصدار تأشيرات غير محدود' },
            { en: 'Immediate visa processing', ar: 'معالجة فورية للتأشيرات' },
            { en: 'Visa transfers from any band', ar: 'نقل التأشيرات من أي نطاق' },
            { en: 'Access to all professions', ar: 'الوصول لجميع المهن' },
            { en: 'Priority government services', ar: 'أولوية في الخدمات الحكومية' },
          ],
          restrictions: [],
        };
      case 'GREEN_HIGH':
      case 'GREEN_MEDIUM':
      case 'GREEN_LOW':
        return {
          benefits: [
            { en: 'Visa issuance allowed', ar: 'إصدار التأشيرات مسموح' },
            { en: 'Visa transfers from Yellow/Red', ar: 'نقل التأشيرات من الأصفر/الأحمر' },
          ],
          restrictions: [
            { en: 'Limited to quota based on band level', ar: 'محدود بحسب حصة مستوى النطاق' },
          ],
        };
      case 'YELLOW':
        return {
          benefits: [
            { en: 'Limited visa renewal', ar: 'تجديد تأشيرات محدود' },
          ],
          restrictions: [
            { en: 'No new visas', ar: 'لا تأشيرات جديدة' },
            { en: 'No visa transfers to company', ar: 'لا نقل تأشيرات للشركة' },
            { en: '6-month grace period', ar: 'مهلة 6 أشهر' },
          ],
        };
      case 'RED':
        return {
          benefits: [],
          restrictions: [
            { en: 'No visa services', ar: 'لا خدمات تأشيرات' },
            { en: 'Cannot open new branches', ar: 'لا يمكن فتح فروع جديدة' },
            { en: 'Subject to fines and penalties', ar: 'عرضة للغرامات والعقوبات' },
            { en: 'Business may be suspended', ar: 'قد يتم تعليق العمل' },
          ],
        };
    }
  }

  /**
   * Get list of supported industries
   */
  static getIndustries(): Array<{ code: string; name: string; nameAr: string }> {
    return [
      { code: '41', name: 'Construction', nameAr: 'البناء والتشييد' },
      { code: '45', name: 'Automotive Trade', nameAr: 'تجارة السيارات' },
      { code: '46', name: 'Wholesale Trade', nameAr: 'تجارة الجملة' },
      { code: '47', name: 'Retail Trade', nameAr: 'تجارة التجزئة' },
      { code: '55', name: 'Hospitality', nameAr: 'الضيافة' },
      { code: '56', name: 'Food Services', nameAr: 'خدمات الأغذية' },
      { code: '62', name: 'IT & Technology', nameAr: 'تقنية المعلومات' },
      { code: '64', name: 'Financial Services', nameAr: 'الخدمات المالية' },
      { code: '68', name: 'Real Estate', nameAr: 'العقارات' },
      { code: '86', name: 'Healthcare', nameAr: 'الرعاية الصحية' },
      { code: '85', name: 'Education', nameAr: 'التعليم' },
    ];
  }
}

export default NitaqatService;
