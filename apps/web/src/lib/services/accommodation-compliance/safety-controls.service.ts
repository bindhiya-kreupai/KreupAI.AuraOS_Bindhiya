/**
 * EPIC-23 accommodation safety controls (hygiene + fire + food).
 *
 * Closes the audit gap "13/18 stories with zero code: hygiene, fire
 * safety, food safety, medical controls, cost allocation, contractor
 * governance, female/family segregation, audit checklist" for
 * EPIC-23 Accommodation. This service ships the three highest-impact
 * controls (hygiene / fire / food) as pure scoring engines + bilingual
 * verdicts, leaving the rest to follow-ups.
 *
 * Each control takes a typed measurement input and returns:
 *   {
 *     pass: boolean,
 *     score: number (0..100),
 *     band: 'CRITICAL' | 'POOR' | 'ACCEPTABLE' | 'GOOD' | 'EXCELLENT',
 *     failures: [{ code, description, descriptionAr, severity }],
 *     notes: string[],
 *   }
 *
 * Pure helpers, no IO — DB-driven persistence wraps the result into
 * the existing HygieneCheck / FireSafetyCheck / FoodSafetyCheck rows.
 */

export type SafetyBand = 'CRITICAL' | 'POOR' | 'ACCEPTABLE' | 'GOOD' | 'EXCELLENT';

export interface SafetyFailure {
  code: string;
  description: string;
  descriptionAr: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface SafetyVerdict {
  pass: boolean;
  score: number;
  band: SafetyBand;
  failures: SafetyFailure[];
  notes: string[];
}

function bandFromScore(score: number): SafetyBand {
  if (score < 30) return 'CRITICAL';
  if (score < 50) return 'POOR';
  if (score < 70) return 'ACCEPTABLE';
  if (score < 90) return 'GOOD';
  return 'EXCELLENT';
}

// ============================================================================
// Hygiene
// ============================================================================

export interface HygieneInput {
  /** Number of occupants in the unit. */
  occupants: number;
  /** Number of toilet fixtures. */
  toiletFixtures: number;
  /** Number of shower / bath fixtures. */
  showerFixtures: number;
  /** 1..5 — visual cleanliness inspection score. */
  cleanlinessScore: number;
  /** Whether pest evidence was found (cockroaches, rodent droppings, etc.). */
  pestEvidence: boolean;
  /** Whether bedding is mildewed / stained / torn. */
  beddingPoor: boolean;
}

export function evaluateHygiene(input: HygieneInput): SafetyVerdict {
  const failures: SafetyFailure[] = [];
  const notes: string[] = [];
  let score = 100;

  const toiletRatio = input.occupants / Math.max(input.toiletFixtures, 1);
  if (toiletRatio > 8) {
    failures.push({
      code: 'TOILET_FIXTURE_RATIO',
      description: `Toilet ratio ${toiletRatio.toFixed(1)} : 1 exceeds the 1:8 occupant cap`,
      descriptionAr: `نسبة المراحيض ${toiletRatio.toFixed(1)} : 1 تتجاوز الحد المسموح 1:8`,
      severity: 'HIGH',
    });
    score -= 25;
  }
  const showerRatio = input.occupants / Math.max(input.showerFixtures, 1);
  if (showerRatio > 8) {
    failures.push({
      code: 'SHOWER_FIXTURE_RATIO',
      description: `Shower ratio ${showerRatio.toFixed(1)} : 1 exceeds the 1:8 occupant cap`,
      descriptionAr: `نسبة الاستحمام ${showerRatio.toFixed(1)} : 1 تتجاوز الحد 1:8`,
      severity: 'HIGH',
    });
    score -= 20;
  }
  if (input.cleanlinessScore < 3) {
    failures.push({
      code: 'CLEANLINESS_BELOW_3',
      description: `Cleanliness score ${input.cleanlinessScore} below minimum 3`,
      descriptionAr: `درجة النظافة ${input.cleanlinessScore} أقل من الحد الأدنى 3`,
      severity: input.cleanlinessScore < 2 ? 'CRITICAL' : 'HIGH',
    });
    score -= (3 - input.cleanlinessScore) * 15;
  }
  if (input.pestEvidence) {
    failures.push({
      code: 'PEST_EVIDENCE',
      description: 'Pest evidence (rodent / insect) observed',
      descriptionAr: 'تم رصد أدلة على وجود حشرات أو قوارض',
      severity: 'CRITICAL',
    });
    score -= 30;
  }
  if (input.beddingPoor) {
    failures.push({
      code: 'BEDDING_POOR',
      description: 'Bedding is mildewed / stained / torn',
      descriptionAr: 'الفراش متعفن أو مبقّع أو ممزق',
      severity: 'MEDIUM',
    });
    score -= 10;
  }
  score = Math.max(0, Math.min(100, score));
  return {
    pass: failures.every((f) => f.severity !== 'CRITICAL'),
    score,
    band: bandFromScore(score),
    failures,
    notes,
  };
}

// ============================================================================
// Fire safety
// ============================================================================

export interface FireSafetyInput {
  smokeDetectorsWorking: boolean;
  fireExtinguisherWithinDate: boolean;
  emergencyExitsClear: boolean;
  fireDrillLast6Months: boolean;
  fireAlarmTestedMonthly: boolean;
  /** True when an obstacle blocks a labeled emergency exit. */
  exitBlocked: boolean;
}

export function evaluateFireSafety(input: FireSafetyInput): SafetyVerdict {
  const failures: SafetyFailure[] = [];
  const notes: string[] = [];
  let score = 100;

  if (!input.smokeDetectorsWorking) {
    failures.push({
      code: 'SMOKE_DETECTORS',
      description: 'Smoke detectors not working',
      descriptionAr: 'كاشفات الدخان غير صالحة',
      severity: 'CRITICAL',
    });
    score -= 30;
  }
  if (!input.fireExtinguisherWithinDate) {
    failures.push({
      code: 'FIRE_EXTINGUISHER_EXPIRED',
      description: 'Fire extinguisher service certificate expired',
      descriptionAr: 'شهادة صيانة طفاية الحريق منتهية',
      severity: 'HIGH',
    });
    score -= 20;
  }
  if (!input.emergencyExitsClear) {
    failures.push({
      code: 'EMERGENCY_EXIT_NOT_CLEAR',
      description: 'Emergency exit pathways not clear',
      descriptionAr: 'مسالك الخروج غير سالكة',
      severity: 'CRITICAL',
    });
    score -= 25;
  }
  if (input.exitBlocked) {
    failures.push({
      code: 'EXIT_BLOCKED',
      description: 'Labelled emergency exit blocked by an obstacle',
      descriptionAr: 'مخرج طوارئ مغلق بحاجز',
      severity: 'CRITICAL',
    });
    score -= 25;
  }
  if (!input.fireDrillLast6Months) {
    failures.push({
      code: 'NO_FIRE_DRILL',
      description: 'No fire drill in the last 6 months',
      descriptionAr: 'لا يوجد تدريب على الإخلاء خلال آخر 6 أشهر',
      severity: 'MEDIUM',
    });
    score -= 10;
  }
  if (!input.fireAlarmTestedMonthly) {
    failures.push({
      code: 'FIRE_ALARM_UNTESTED',
      description: 'Fire alarm not tested in the last month',
      descriptionAr: 'لم يتم اختبار إنذار الحريق في الشهر الأخير',
      severity: 'MEDIUM',
    });
    score -= 10;
  }
  score = Math.max(0, Math.min(100, score));
  return {
    pass: failures.every((f) => f.severity !== 'CRITICAL'),
    score,
    band: bandFromScore(score),
    failures,
    notes,
  };
}

// ============================================================================
// Food safety
// ============================================================================

export interface FoodSafetyInput {
  /** Whether the cold-storage temperature log shows OK (≤ 4°C). */
  coldStorageTempOk: boolean;
  /** Whether the hot-holding temperature log shows OK (≥ 60°C). */
  hotHoldingTempOk: boolean;
  /** Were food handlers' health cards in date? */
  handlersHealthCardsValid: boolean;
  /** Was a pest-control service performed in the last quarter? */
  pestControlQuarterly: boolean;
  /** Pest-evidence observed in the food prep area? */
  pestEvidenceInPrep: boolean;
  /** General sanitation rating 1..5. */
  sanitationScore: number;
}

export function evaluateFoodSafety(input: FoodSafetyInput): SafetyVerdict {
  const failures: SafetyFailure[] = [];
  const notes: string[] = [];
  let score = 100;

  if (!input.coldStorageTempOk) {
    failures.push({
      code: 'COLD_STORAGE_TEMP',
      description: 'Cold-storage temperature exceeded the safe maximum',
      descriptionAr: 'تجاوز درجة حرارة التبريد الحد الآمن',
      severity: 'CRITICAL',
    });
    score -= 25;
  }
  if (!input.hotHoldingTempOk) {
    failures.push({
      code: 'HOT_HOLDING_TEMP',
      description: 'Hot-holding temperature below the safe minimum',
      descriptionAr: 'درجة حرارة الاحتفاظ بالطعام الساخن أقل من الحد الآمن',
      severity: 'CRITICAL',
    });
    score -= 25;
  }
  if (!input.handlersHealthCardsValid) {
    failures.push({
      code: 'HEALTH_CARD_EXPIRED',
      description: 'One or more food handlers without a valid health card',
      descriptionAr: 'أحد متناولي الطعام بدون بطاقة صحية سارية',
      severity: 'HIGH',
    });
    score -= 15;
  }
  if (!input.pestControlQuarterly) {
    failures.push({
      code: 'PEST_CONTROL_OVERDUE',
      description: 'No quarterly pest-control service on file',
      descriptionAr: 'لا توجد خدمة مكافحة حشرات ربع سنوية على الملف',
      severity: 'HIGH',
    });
    score -= 15;
  }
  if (input.pestEvidenceInPrep) {
    failures.push({
      code: 'PEST_IN_PREP_AREA',
      description: 'Pest evidence in the food preparation area',
      descriptionAr: 'أدلة على وجود آفات في منطقة تحضير الطعام',
      severity: 'CRITICAL',
    });
    score -= 30;
  }
  if (input.sanitationScore < 3) {
    failures.push({
      code: 'SANITATION_BELOW_3',
      description: `Sanitation rating ${input.sanitationScore} below minimum 3`,
      descriptionAr: `درجة النظافة ${input.sanitationScore} أقل من الحد الأدنى 3`,
      severity: input.sanitationScore < 2 ? 'CRITICAL' : 'HIGH',
    });
    score -= (3 - input.sanitationScore) * 15;
  }
  score = Math.max(0, Math.min(100, score));
  return {
    pass: failures.every((f) => f.severity !== 'CRITICAL'),
    score,
    band: bandFromScore(score),
    failures,
    notes,
  };
}
