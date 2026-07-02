import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

// CandidateMessage is a new-model added via defensive migration; access untyped.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const candidateMessage = (prisma as any).candidateMessage;

interface StoredMessage {
  id: string;
  candidateId: string;
  applicationId: string | null;
  channel: string;
  direction: string;
  status: string;
  subject: string | null;
  body: string;
  sender: string | null;
  senderRole: string | null;
  sentAt: Date;
}

/**
 * GET /api/v1/recruitment/messages
 * List candidate communication threads (messages grouped by candidate), tenant-scoped.
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('recruitment:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing recruitment:read permission',
            messageAr: 'ممنوع: صلاحية القراءة مفقودة',
          },
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidateId') || undefined;

    const messages: StoredMessage[] = await candidateMessage.findMany({
      where: {
        tenantId: user.tenantId,
        isDeleted: false,
        ...(candidateId ? { candidateId } : {}),
      },
      orderBy: { sentAt: 'asc' },
    });

    const candidateIds = Array.from(new Set(messages.map((m) => m.candidateId)));
    const candidates = candidateIds.length
      ? await prisma.candidate.findMany({
          where: { id: { in: candidateIds } },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            applications: {
              select: { currentStage: true, jobPosting: { select: { title: true } } },
              orderBy: { appliedDate: 'desc' },
              take: 1,
            },
          },
        })
      : [];
    const candidateById = new Map(candidates.map((c) => [c.id, c]));

    const threads = candidateIds.map((cid) => {
      const cand = candidateById.get(cid);
      const threadMessages = messages
        .filter((m) => m.candidateId === cid)
        .map((m) => ({
          id: m.id,
          channel: m.channel,
          direction: m.direction,
          status: m.status,
          subject: m.subject ?? undefined,
          body: m.body,
          timestamp: m.sentAt,
          sender: m.sender ?? 'AURA Talent Team',
          senderRole: m.senderRole ?? undefined,
        }));
      const last = threadMessages[threadMessages.length - 1];
      return {
        id: cid,
        candidateId: cid,
        candidateName: cand ? `${cand.firstName} ${cand.lastName}` : 'Candidate',
        candidateEmail: cand?.email ?? '',
        candidatePhone: cand?.phone ?? '',
        jobTitle: cand?.applications[0]?.jobPosting?.title ?? '—',
        stage: cand?.applications[0]?.currentStage ?? 'Applied',
        isStarred: false,
        isArchived: false,
        unreadCount: threadMessages.filter((m) => m.direction === 'inbound' && m.status !== 'read')
          .length,
        lastMessage: last?.body.slice(0, 120) ?? '',
        lastMessageTime: last?.timestamp ?? new Date(),
        lastChannel: last?.channel ?? 'email',
        messages: threadMessages,
      };
    });

    return NextResponse.json({
      success: true,
      data: { threads, total: threads.length },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error: any) {
    console.error('[Candidate Messages API] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to fetch candidate messages',
          messageAr: 'فشل في جلب رسائل المرشح',
        },
      },
      { status: 500 }
    );
  }
});

/**
 * POST /api/v1/recruitment/messages
 * Send (persist) an outbound message to a candidate, tenant-scoped.
 */
export const POST = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, permissions } = context;
      if (!permissions.includes('recruitment:create')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing recruitment:create permission',
              messageAr: 'ممنوع: صلاحية الإنشاء مفقودة',
            },
          },
          { status: 403 }
        );
      }

      const body = await request.json();
      if (!body?.candidateId || !body?.body) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E2001',
              message: 'candidateId and body are required',
              messageAr: 'معرّف المرشح ونص الرسالة مطلوبان',
            },
          },
          { status: 400 }
        );
      }

      const candidate = await prisma.candidate.findUnique({
        where: { id: body.candidateId },
        select: { id: true },
      });
      if (!candidate) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'E4001', message: 'Candidate not found', messageAr: 'المرشح غير موجود' },
          },
          { status: 404 }
        );
      }

      const channel = body.channel === 'sms' ? 'sms' : 'email';
      const created = await candidateMessage.create({
        data: {
          tenantId: user.tenantId,
          candidateId: body.candidateId,
          applicationId: body.applicationId ?? null,
          channel,
          direction: 'outbound',
          status: 'sent',
          subject: channel === 'email' ? (body.subject ?? null) : null,
          body: String(body.body),
          sender: body.sender ?? user.name ?? 'AURA Talent Team',
          senderRole: body.senderRole ?? 'Recruiter',
          createdBy: user.id,
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: created,
          message: 'Message sent successfully',
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 201 }
      );
    } catch (error: any) {
      console.error('[Candidate Messages API] POST Error:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to send message',
            messageAr: 'فشل في إرسال الرسالة',
          },
        },
        { status: 500 }
      );
    }
  }),
  { action: AuditAction.EMPLOYEE_CREATED, resourceType: 'candidate_message' }
);
