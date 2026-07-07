import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

// BenefitCampaign is delivered via the backlog schema fragment
// (.backlog-run/schema-fragments/cleanup-benefits.prisma) and the defensive
// migration 20260702190001_cleanup_benefits. Access via the untyped delegate.
const campaignDelegate = () => (prisma as any).benefitCampaign;

const CAMPAIGN_TYPES = ['Urgent', 'Info'];

/**
 * GET /api/benefits/campaigns
 * List benefit notification campaigns for the tenant.
 */
export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const tenantId = context.user.tenantId;
    const campaigns = await campaignDelegate().findMany({
      where: { tenantId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: campaigns });
  } catch (error: any) {
    console.error('[Benefits Campaigns API] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to fetch benefit campaigns',
          messageAr: 'فشل في جلب حملات المزايا',
        },
      },
      { status: 500 }
    );
  }
});

/**
 * POST /api/benefits/campaigns
 * Create (queue) a benefit notification campaign.
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const tenantId = context.user.tenantId;
    const userId = context.user.userId;
    const body = await request.json();

    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (!title || !message) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: 'title and message are required',
            messageAr: 'العنوان والرسالة مطلوبان',
          },
        },
        { status: 400 }
      );
    }

    const type = CAMPAIGN_TYPES.includes(body.type) ? body.type : 'Info';
    const channel =
      typeof body.channel === 'string' && body.channel.trim() ? body.channel.trim() : 'Email';

    const campaign = await campaignDelegate().create({
      data: {
        tenantId,
        title,
        type,
        channel,
        message,
        status: 'QUEUED',
        createdBy: userId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: campaign,
        message: 'Campaign queued successfully',
        messageAr: 'تم وضع الحملة في قائمة الانتظار بنجاح',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[Benefits Campaigns API] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to create benefit campaign',
          messageAr: 'فشل في إنشاء حملة المزايا',
        },
      },
      { status: 500 }
    );
  }
});
