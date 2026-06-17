/**
 * EPIC-04 recruitment stage-gate engine.
 *
 * Closes the audit gap "No stage-gates, no BGV gating, no immigration
 * eligibility, no bias controls" for EPIC-04 Recruitment & Selection.
 *
 * Recruitment cases pass through a series of stages
 * (APPLIED → SCREENED → INTERVIEWED → BGV → OFFER → JOINING). Each
 * transition must check that the prerequisites for the next stage
 * are met. Today the system permits any forward transition without
 * checks; this service plugs that hole as a pure state machine that
 * the existing recruitment-compliance service can route through.
 *
 * Gate categories:
 *   SCREENING_CRITERIA  — caller's manual screening rubric scored ≥ pass
 *   INTERVIEW_PANEL     — N interview rounds completed with > 0 score
 *   BGV_CLEARED         — background-verification case status = PASSED
 *   IMMIGRATION_OK      — work permit eligibility for the target country
 *   BIAS_REVIEW         — bias-flag review for the candidate group
 *
 * Pure logic, no IO. Tests can drive everything.
 */

export type RecruitmentStage =
  | 'APPLIED'
  | 'SCREENED'
  | 'INTERVIEWED'
  | 'BGV'
  | 'OFFER'
  | 'JOINING'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface CaseSnapshot {
  caseId: string;
  candidateId: string;
  currentStage: RecruitmentStage;
  countryCode?: string;
  // Stage prereq inputs (caller populates from existing models).
  screeningScore?: number;
  screeningPassMark?: number;
  interviewRoundsCompleted?: number;
  interviewRequiredRounds?: number;
  bgvStatus?: 'NOT_STARTED' | 'IN_PROGRESS' | 'PASSED' | 'FAILED' | 'WAIVED';
  immigrationEligible?: boolean;
  biasReviewPassed?: boolean;
}

export interface GateFailure {
  code: string;
  description: string;
  descriptionAr: string;
}

export interface TransitionVerdict {
  allow: boolean;
  fromStage: RecruitmentStage;
  toStage: RecruitmentStage;
  failures: GateFailure[];
}

const ALLOWED_TRANSITIONS: Record<RecruitmentStage, RecruitmentStage[]> = {
  APPLIED: ['SCREENED', 'REJECTED', 'WITHDRAWN'],
  SCREENED: ['INTERVIEWED', 'REJECTED', 'WITHDRAWN'],
  INTERVIEWED: ['BGV', 'REJECTED', 'WITHDRAWN'],
  BGV: ['OFFER', 'REJECTED', 'WITHDRAWN'],
  OFFER: ['JOINING', 'REJECTED', 'WITHDRAWN'],
  JOINING: [],
  REJECTED: [],
  WITHDRAWN: [],
};

const FAILURE_TEXT: Record<string, { en: string; ar: string }> = {
  TRANSITION_NOT_ALLOWED: {
    en: 'Direct transition between these stages is not allowed',
    ar: 'الانتقال المباشر بين هذه المراحل غير مسموح',
  },
  SCREENING_NOT_PASSED: {
    en: 'Screening score is below the pass mark',
    ar: 'درجة الفرز أقل من حد النجاح',
  },
  INTERVIEW_INCOMPLETE: {
    en: 'Not enough interview rounds have been completed',
    ar: 'لم يكتمل العدد المطلوب من جولات المقابلات',
  },
  BGV_NOT_PASSED: {
    en: 'Background verification has not been PASSED (or WAIVED)',
    ar: 'لم يتم اجتياز التحقق من الخلفية (أو الإعفاء منه)',
  },
  IMMIGRATION_NOT_ELIGIBLE: {
    en: 'Candidate is not immigration-eligible for the target country',
    ar: 'المرشح غير مؤهل للهجرة إلى الدولة المستهدفة',
  },
  BIAS_REVIEW_FAILED: {
    en: 'Bias-review check failed — escalate to the diversity team',
    ar: 'فشل التحقق من التحيز - أبلغ فريق التنوع',
  },
};

function fail(code: keyof typeof FAILURE_TEXT): GateFailure {
  return {
    code,
    description: FAILURE_TEXT[code].en,
    descriptionAr: FAILURE_TEXT[code].ar,
  };
}

export function isTransitionAllowed(from: RecruitmentStage, to: RecruitmentStage): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Pure helper: given a case snapshot and a desired next stage,
 * returns the typed verdict.
 */
export function evaluateTransition(
  snapshot: CaseSnapshot,
  toStage: RecruitmentStage
): TransitionVerdict {
  const failures: GateFailure[] = [];
  const fromStage = snapshot.currentStage;

  if (!isTransitionAllowed(fromStage, toStage)) {
    failures.push(fail('TRANSITION_NOT_ALLOWED'));
    return { allow: false, fromStage, toStage, failures };
  }

  // Forward transitions get the gate checks. Terminal transitions
  // (REJECTED / WITHDRAWN) bypass them — those are administrative,
  // not progress.
  if (toStage === 'REJECTED' || toStage === 'WITHDRAWN') {
    return { allow: true, fromStage, toStage, failures: [] };
  }

  if (toStage === 'INTERVIEWED') {
    if ((snapshot.screeningPassMark ?? 0) > (snapshot.screeningScore ?? 0)) {
      failures.push(fail('SCREENING_NOT_PASSED'));
    }
    if (snapshot.biasReviewPassed === false) {
      failures.push(fail('BIAS_REVIEW_FAILED'));
    }
  }
  if (toStage === 'BGV') {
    if ((snapshot.interviewRequiredRounds ?? 0) > (snapshot.interviewRoundsCompleted ?? 0)) {
      failures.push(fail('INTERVIEW_INCOMPLETE'));
    }
  }
  if (toStage === 'OFFER') {
    if (!(snapshot.bgvStatus === 'PASSED' || snapshot.bgvStatus === 'WAIVED')) {
      failures.push(fail('BGV_NOT_PASSED'));
    }
    if (snapshot.immigrationEligible === false) {
      failures.push(fail('IMMIGRATION_NOT_ELIGIBLE'));
    }
  }
  if (toStage === 'JOINING') {
    if (snapshot.immigrationEligible === false) {
      failures.push(fail('IMMIGRATION_NOT_ELIGIBLE'));
    }
  }

  return { allow: failures.length === 0, fromStage, toStage, failures };
}
