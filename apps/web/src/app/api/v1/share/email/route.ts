/**
 * POST /api/v1/share/email
 *
 * Tenant-scoped transactional email dispatch. Powers the shared
 * EmailRecipientPicker primitive. Subject + message text are sanitised
 * minimally (no HTML allowed in caller payload — the route wraps the
 * plaintext message in a server-controlled template).
 *
 * Auth: requires `share:email-send` permission.
 * Tenant: tenantId is always derived from the authenticated session.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { sendEmail, isEmailConfigured } from '@/lib/services/email.service';
import { AuditService } from '@/lib/audit/audit.service';

const recipientSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  email: z.string().email().optional(),
  kind: z.string().max(40).optional(),
});

const bodySchema = z.object({
  to: z.array(recipientSchema).min(1).max(50),
  cc: z.array(recipientSchema).max(50).optional().default([]),
  bcc: z.array(recipientSchema).max(50).optional().default([]),
  subject: z.string().min(1).max(200),
  message: z.string().max(10_000).default(''),
  /** Optional source — e.g. "payroll.runs:list" — for audit traceability. */
  sourceContext: z.string().max(120).optional(),
  messageAr: z.string().max(10_000).optional(),
});

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderTemplate(
  subject: string,
  message: string,
  senderName: string
): { html: string; text: string } {
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br />');
  const text = `${subject}\n\n${message}\n\n— Sent via AuraOS by ${senderName}`;
  const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8" /><title>${safeSubject}</title></head>
        <body style="font-family: -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#1f2937; padding:24px;">
          <div style="max-width:600px; margin:0 auto; background:#ffffff; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden;">
            <div style="padding:20px 24px; border-bottom:1px solid #e5e7eb;">
              <strong style="font-size:14px; color:#6366f1;">AuraOS</strong>
              <div style="font-size:18px; font-weight:600; margin-top:4px;">${safeSubject}</div>
            </div>
            <div style="padding:24px; font-size:14px; line-height:1.6;">${safeMessage || '<em>No message body provided.</em>'}</div>
            <div style="padding:16px 24px; border-top:1px solid #e5e7eb; font-size:12px; color:#6b7280;">
              Sent via AuraOS by ${escapeHtml(senderName)}.
            </div>
          </div>
        </body>
        </html>
    `;
  return { html, text };
}

function pickAddresses(list: Array<{ email?: string }>): string[] {
  return list.map((r) => r.email).filter((e): e is string => Boolean(e));
}

export const POST = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const raw = await request.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request payload.',
          errorAr: 'بيانات الطلب غير صالحة.',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const body = parsed.data;
    const toAddresses = pickAddresses(body.to);
    const ccAddresses = pickAddresses(body.cc);
    const bccAddresses = pickAddresses(body.bcc);

    if (toAddresses.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one recipient must have a valid email address.',
          errorAr: 'يجب أن يحتوي مستلم واحد على الأقل على عنوان بريد إلكتروني صالح.',
        },
        { status: 400 }
      );
    }

    if (!isEmailConfigured() && process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        {
          success: false,
          error: 'Email service is not configured for this tenant.',
          errorAr: 'لم يتم تكوين خدمة البريد الإلكتروني لهذا المستأجر.',
        },
        { status: 503 }
      );
    }

    const senderName = (auth as any)?.userName || (auth as any)?.email || 'AuraOS user';
    const { html, text } = renderTemplate(body.subject, body.message, senderName);

    const result = await sendEmail({
      to: toAddresses,
      cc: ccAddresses.length ? ccAddresses : undefined,
      bcc: bccAddresses.length ? bccAddresses : undefined,
      subject: body.subject,
      html,
      text,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to send email.',
          errorAr: 'فشل إرسال البريد الإلكتروني.',
        },
        { status: 502 }
      );
    }

    // Best-effort audit. Never fail the request because of audit logging.
    try {
      const audit = new AuditService();
      await audit.log({
        tenantId: (auth as any).tenantId,
        userId: (auth as any).userId,
        action: 'EMAIL_SENT',
        resourceType: 'share.email',
        resourceId: result.messageId ?? null,
        metadata: {
          subject: body.subject,
          recipientCount: toAddresses.length + ccAddresses.length + bccAddresses.length,
          sourceContext: body.sourceContext,
        },
      } as any);
    } catch {
      // swallow — audit failures must not block delivery
    }

    return NextResponse.json({
      success: true,
      data: {
        messageId: result.messageId,
        deliveredTo: toAddresses.length,
        cc: ccAddresses.length,
        bcc: bccAddresses.length,
      },
      message: 'Email queued for delivery.',
      messageAr: 'تم إرسال البريد الإلكتروني.',
    });
  },
  {
    requiredPermissions: ['share:email-send'],
    rateLimit: 'API_USER',
  } as any
);
