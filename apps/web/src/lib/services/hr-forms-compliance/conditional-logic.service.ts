/**
 * EPIC-33 HR Forms — conditional field logic + cryptographic e-sig.
 *
 * Closes the audit gaps:
 *   - "Conditional field logic evaluator missing (S01)"
 *   - "Cryptographic e-sig missing (currently hash:userId:timestamp)"
 *
 * Two concerns:
 *
 *  1. Conditional logic: a form field's `visibleWhen` / `requiredWhen`
 *     rules are expressions over the in-progress submission values.
 *     Examples:
 *       visibleWhen:  "values.country == 'AE'"
 *       requiredWhen: "values.attachReceipt && values.amount > 1000"
 *
 *     The existing DSL (apps/web/src/lib/services/expression-dsl) is
 *     the right evaluator; this service wraps it with a typed form-
 *     field shape and a render helper.
 *
 *  2. Cryptographic e-sig: the existing
 *     hrFormSubmissionService.approveStage stores a signature as
 *     `hash:userId:timestamp` — not actually a signature, just a
 *     concatenation. This service replaces that with an HMAC-SHA256
 *     signature over a canonical payload that includes the form ID,
 *     the submission ID, the stage, and the actor's user ID +
 *     timestamp. The signing key is the `SIGNATURE_HMAC_SECRET` env
 *     var (already used by the EPIC-07 close-out).
 *
 * Pure helpers, no IO. Tests can drive everything without prisma.
 */

import { signWithHmac, verifySignature } from '@/lib/services/signing/hmac-signature.service';
import {
  evaluateRule,
  type EvaluationContext,
} from '@/lib/services/expression-dsl/expression.service';

export interface FormField {
  code: string;
  label: string;
  labelAr?: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect' | 'attachment';
  options?: Array<{ value: string; label: string; labelAr?: string }>;
  /** DSL expression — visible iff truthy. */
  visibleWhen?: string;
  /** DSL expression — required iff truthy AND the field is visible. */
  requiredWhen?: string;
  /** Default value when the field becomes visible. */
  defaultValue?: unknown;
}

export interface FieldRenderState {
  code: string;
  visible: boolean;
  required: boolean;
  /** Reason the field was hidden / made non-required, for debugging. */
  reasons: string[];
}

export interface FormRenderResult {
  fields: FieldRenderState[];
}

/**
 * Pure helper. Given a form's fields and the current submission
 * values, returns the per-field visible / required state.
 */
export function renderForm(fields: FormField[], values: Record<string, unknown>): FormRenderResult {
  const ctx: EvaluationContext = { values };
  const states: FieldRenderState[] = [];
  for (const f of fields) {
    const reasons: string[] = [];
    let visible = true;
    let required = false;
    if (f.visibleWhen && f.visibleWhen.trim().length > 0) {
      visible = evaluateRule(f.visibleWhen, ctx, (err) => {
        reasons.push(`visibleWhen error: ${err.message}`);
      });
      if (!visible) reasons.push(`hidden by visibleWhen=${f.visibleWhen}`);
    }
    if (visible && f.requiredWhen && f.requiredWhen.trim().length > 0) {
      required = evaluateRule(f.requiredWhen, ctx, (err) => {
        reasons.push(`requiredWhen error: ${err.message}`);
      });
    }
    states.push({ code: f.code, visible, required, reasons });
  }
  return { fields: states };
}

/**
 * Pure helper. Walks the rendered form and returns the codes of any
 * required-but-empty fields. Caller can use this to refuse submission.
 */
export function findMissingRequiredFields(
  render: FormRenderResult,
  values: Record<string, unknown>
): string[] {
  const missing: string[] = [];
  for (const s of render.fields) {
    if (!s.visible || !s.required) continue;
    const v = values[s.code];
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)) {
      missing.push(s.code);
    }
  }
  return missing;
}

// ============================================================================
// Cryptographic e-signature
// ============================================================================

export interface SubmissionSignatureInput {
  formId: string;
  submissionId: string;
  stage: string;
  actorId: string;
  /** Stable hash of the submission content at signing time. */
  contentHash: string;
  ipAddress?: string;
  timestampMs?: number;
}

/**
 * Replaces the legacy `hash:userId:timestamp` concatenation with an
 * HMAC-SHA256 signature scoped to `HRFORM` domain. The signature is a
 * single opaque string callers persist alongside the submission row.
 */
export function signFormSubmission(input: SubmissionSignatureInput): string {
  return signWithHmac({
    domain: 'HRFORM',
    resourceId: `${input.formId}:${input.submissionId}:${input.stage}`,
    actorId: input.actorId,
    timestampMs: input.timestampMs,
    ipAddress: input.ipAddress,
    extra: { contentHash: input.contentHash },
  });
}

export function verifyFormSubmissionSignature(signature: string): boolean {
  const result = verifySignature(signature);
  return result.valid === true;
}
