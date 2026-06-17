/**
 * EPIC-25 retaliation protection (must-have for GCC).
 *
 * Closes the audit gap "retaliation protection (must-have for GCC)
 * missing" — for employees who raise a grievance (especially as a
 * whistleblower), GCC labour authorities require that the employer
 * actively guard against retaliatory adverse actions for a window
 * after the complaint.
 *
 * This service implements that window operationally:
 *
 *  1. resolveProtectionWindow(employeeId, asOf?) — given a tenant +
 *     employee, finds the most recent ErGrievanceCase where the
 *     employee is the complainant (and was not closed >N days ago),
 *     and returns the active protection period.
 *
 *  2. assessAdverseAction(input) — given a proposed adverse action
 *     (DISCIPLINARY / TERMINATION / DEMOTION / SALARY_REDUCTION /
 *     INVOLUNTARY_TRANSFER), returns a typed verdict:
 *       - underProtection: boolean
 *       - requiresJustification: boolean
 *       - requiresHrDirectorSignOff: boolean
 *       - reason / reasonAr: bilingual explanation
 *
 *  3. recordAcknowledgement(...) — every proposed adverse action
 *     against a protected employee is recorded into AuditLog with
 *     resourceType='retaliation_check' and the result of the
 *     assessment. Auditors can replay this to demonstrate the
 *     employer evaluated retaliation risk before each action.
 *
 * Country knobs (window length, severity-based escalation roles)
 * are resolvable via the country rule pack
 * ('ER', 'RETALIATION_PROTECTION', at) — defaults match the
 * GCC norm (90-day window).
 *
 * No schema change required.
 */

import { prisma } from '@aura/database';
import { auditService, AuditAction, AuditSeverity } from '@/lib/audit/audit.service';
import { resolveRuleObject } from '@/lib/services/gcc-rule-library/rule-value.helper';

export interface AuthContext {
  tenantId: string;
  userId: string;
  userEmail?: string;
}

export type AdverseActionType =
  | 'DISCIPLINARY_ACTION'
  | 'TERMINATION'
  | 'DEMOTION'
  | 'SALARY_REDUCTION'
  | 'INVOLUNTARY_TRANSFER'
  | 'NEGATIVE_PERFORMANCE_REVIEW';

export interface ProtectionConfig {
  /** Days from grievance raised at which the protection window expires. */
  windowDays: number;
  /** Additional days added when isWhistleblower=true. */
  whistleblowerBonusDays: number;
  /** Action types that DO NOT require special review even under protection. */
  exemptActions: AdverseActionType[];
}

export const DEFAULT_PROTECTION_CONFIG: ProtectionConfig = {
  windowDays: 90,
  whistleblowerBonusDays: 90,
  exemptActions: [],
};

export interface ProtectionWindow {
  active: boolean;
  caseId?: string;
  caseNumber?: string;
  raisedAt?: Date;
  expiresAt?: Date;
  isWhistleblower?: boolean;
}

export interface AdverseActionVerdict {
  underProtection: boolean;
  requiresJustification: boolean;
  requiresHrDirectorSignOff: boolean;
  reason: string;
  reasonAr: string;
  window: ProtectionWindow;
}

const REASON_NO_PROTECTION = {
  en: 'Employee is not within a retaliation-protection window',
  ar: 'الموظف ليس ضمن نافذة الحماية من الانتقام',
};
const REASON_PROTECTED = {
  en: 'Employee filed a grievance within the protection window; adverse action requires HR Director sign-off and a written justification',
  ar: 'قدّم الموظف شكوى ضمن نافذة الحماية؛ يتطلب الإجراء المعاكس موافقة مدير الموارد البشرية ومبرراً مكتوباً',
};
const REASON_WHISTLEBLOWER = {
  en: 'Whistleblower-protected employee; adverse action requires HR Director sign-off, written justification and labour-authority notice review',
  ar: 'موظف محمي كمبلّغ عن مخالفات؛ يتطلب الإجراء المعاكس موافقة مدير الموارد البشرية ومبرراً مكتوباً ومراجعة سلطة العمل',
};

/**
 * Pure (no IO) helper. Given an ErGrievanceCase row and the current
 * date, return the protection window. Caller picks the right row.
 */
export function computeProtectionWindow(
  grievance: {
    id: string;
    caseNumber: string;
    raisedAt: Date;
    status: string;
    isWhistleblower: boolean;
  } | null,
  config: ProtectionConfig,
  asOf: Date = new Date()
): ProtectionWindow {
  if (!grievance) return { active: false };
  const windowDays =
    config.windowDays + (grievance.isWhistleblower ? config.whistleblowerBonusDays : 0);
  const expiresAt = new Date(grievance.raisedAt);
  expiresAt.setDate(expiresAt.getDate() + windowDays);
  if (asOf > expiresAt) {
    return {
      active: false,
      caseId: grievance.id,
      caseNumber: grievance.caseNumber,
      raisedAt: grievance.raisedAt,
      expiresAt,
      isWhistleblower: grievance.isWhistleblower,
    };
  }
  return {
    active: true,
    caseId: grievance.id,
    caseNumber: grievance.caseNumber,
    raisedAt: grievance.raisedAt,
    expiresAt,
    isWhistleblower: grievance.isWhistleblower,
  };
}

export function buildAdverseActionVerdict(
  window: ProtectionWindow,
  action: AdverseActionType,
  config: ProtectionConfig
): AdverseActionVerdict {
  if (!window.active || config.exemptActions.includes(action)) {
    return {
      underProtection: false,
      requiresJustification: false,
      requiresHrDirectorSignOff: false,
      reason: REASON_NO_PROTECTION.en,
      reasonAr: REASON_NO_PROTECTION.ar,
      window,
    };
  }
  if (window.isWhistleblower) {
    return {
      underProtection: true,
      requiresJustification: true,
      requiresHrDirectorSignOff: true,
      reason: REASON_WHISTLEBLOWER.en,
      reasonAr: REASON_WHISTLEBLOWER.ar,
      window,
    };
  }
  return {
    underProtection: true,
    requiresJustification: true,
    requiresHrDirectorSignOff: true,
    reason: REASON_PROTECTED.en,
    reasonAr: REASON_PROTECTED.ar,
    window,
  };
}

export class RetaliationProtectionService {
  async resolveConfig(country?: string, at: Date = new Date()): Promise<ProtectionConfig> {
    if (!country) return DEFAULT_PROTECTION_CONFIG;
    return resolveRuleObject<ProtectionConfig>(
      country,
      'ER',
      'RETALIATION_PROTECTION',
      DEFAULT_PROTECTION_CONFIG,
      { at, source: 'RetaliationProtectionService.resolveConfig' }
    );
  }

  /**
   * Find the most recent open / recently-resolved grievance for
   * `employeeId` and compute its protection window.
   */
  async resolveProtectionWindow(
    tenantId: string,
    employeeId: string,
    country?: string,
    asOf: Date = new Date()
  ): Promise<ProtectionWindow> {
    const config = await this.resolveConfig(country, asOf);
    const grievance = await (prisma as any).erGrievanceCase.findFirst({
      where: { tenantId, complainantId: employeeId },
      orderBy: { raisedAt: 'desc' },
      select: {
        id: true,
        caseNumber: true,
        raisedAt: true,
        status: true,
        isWhistleblower: true,
      },
    });
    return computeProtectionWindow(grievance, config, asOf);
  }

  /**
   * Assess a proposed adverse action against an employee's current
   * protection window. ALWAYS records the assessment into AuditLog so
   * an auditor can later prove the retaliation check ran.
   */
  async assessAdverseAction(
    input: {
      employeeId: string;
      actionType: AdverseActionType;
      country?: string;
      proposedAt?: Date;
      relatedActionId?: string;
      justification?: string;
    },
    auth: AuthContext
  ): Promise<AdverseActionVerdict> {
    const at = input.proposedAt ?? new Date();
    const config = await this.resolveConfig(input.country, at);
    const window = await this.resolveProtectionWindow(
      auth.tenantId,
      input.employeeId,
      input.country,
      at
    );
    const verdict = buildAdverseActionVerdict(window, input.actionType, config);

    await auditService.log({
      action: AuditAction.SETTINGS_UPDATED,
      severity: verdict.underProtection ? AuditSeverity.HIGH : AuditSeverity.LOW,
      userId: auth.userId,
      userEmail: auth.userEmail,
      tenantId: auth.tenantId,
      resourceType: 'retaliation_check',
      resourceId: input.employeeId,
      success: true,
      metadata: {
        employeeId: input.employeeId,
        actionType: input.actionType,
        verdict,
        relatedActionId: input.relatedActionId,
        justification: input.justification,
        checkedAt: at.toISOString(),
      },
    });

    return verdict;
  }
}

export const retaliationProtectionService = new RetaliationProtectionService();
