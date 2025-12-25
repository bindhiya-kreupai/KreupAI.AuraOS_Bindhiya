/**
 * Enterprise Multi-Entity API Routes
 * Phase 4: Enterprise Expansion
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { EntityService } from '@/lib/services/enterprise';

/**
 * POST /api/enterprise
 * Manage entities and transfers
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required', errorAr: 'معرف المستأجر مطلوب' },
        { status: 400 }
      );
    }

    const action = body.action || 'create-entity';

    switch (action) {
      case 'create-entity':
        if (!body.entity) {
          return NextResponse.json(
            { error: 'entity is required', errorAr: 'الكيان مطلوب' },
            { status: 400 }
          );
        }

        const newEntity = await EntityService.createEntity({
          tenantId: body.tenantId,
          ...body.entity,
          createdBy: body.createdBy || 'system',
        });

        return NextResponse.json({
          success: true,
          data: newEntity,
        });

      case 'update-entity':
        if (!body.entityId || !body.updates) {
          return NextResponse.json(
            { error: 'entityId and updates are required', errorAr: 'معرف الكيان والتحديثات مطلوبان' },
            { status: 400 }
          );
        }

        const updatedEntity = await EntityService.updateEntity(body.entityId, body.updates);

        return NextResponse.json({
          success: true,
          data: updatedEntity,
        });

      case 'move-entity':
        if (!body.entityId) {
          return NextResponse.json(
            { error: 'entityId is required', errorAr: 'معرف الكيان مطلوب' },
            { status: 400 }
          );
        }

        const movedEntity = await EntityService.moveEntity(body.entityId, body.newParentId);

        return NextResponse.json({
          success: true,
          data: movedEntity,
        });

      case 'archive-entity':
        if (!body.entityId) {
          return NextResponse.json(
            { error: 'entityId is required', errorAr: 'معرف الكيان مطلوب' },
            { status: 400 }
          );
        }

        const archivedEntity = await EntityService.archiveEntity(body.entityId);

        return NextResponse.json({
          success: true,
          data: archivedEntity,
        });

      case 'create-transfer':
        if (!body.transfer) {
          return NextResponse.json(
            { error: 'transfer is required', errorAr: 'بيانات النقل مطلوبة' },
            { status: 400 }
          );
        }

        const transfer = await EntityService.createTransfer({
          ...body.transfer,
          createdBy: body.createdBy || 'system',
        });

        return NextResponse.json({
          success: true,
          data: transfer,
        });

      case 'submit-transfer':
        if (!body.transferId) {
          return NextResponse.json(
            { error: 'transferId is required', errorAr: 'معرف النقل مطلوب' },
            { status: 400 }
          );
        }

        const submittedTransfer = await EntityService.submitTransfer(body.transferId);

        return NextResponse.json({
          success: true,
          data: submittedTransfer,
        });

      case 'approve-transfer':
        if (!body.transferId || !body.approverId || !body.action) {
          return NextResponse.json(
            { error: 'transferId, approverId and action are required', errorAr: 'معرف النقل ومعرف الموافق والإجراء مطلوبان' },
            { status: 400 }
          );
        }

        const approvedTransfer = await EntityService.processTransferApproval(
          body.transferId,
          body.approverId,
          body.action,
          body.comments
        );

        return NextResponse.json({
          success: true,
          data: approvedTransfer,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action', errorAr: 'إجراء غير صالح' },
          { status: 400 }
        );
    }
  } catch {
        return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process enterprise request',
        errorAr: 'فشل في معالجة طلب المؤسسة',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/enterprise
 * Get entities and hierarchy
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const type = searchParams.get('type') || 'entities';
    const entityId = searchParams.get('entityId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required', errorAr: 'معرف المستأجر مطلوب' },
        { status: 400 }
      );
    }

    switch (type) {
      case 'entities':
        const entities = await EntityService.getEntities(tenantId, {
          type: searchParams.get('entityType') as any,
          status: searchParams.get('status') as any,
          parentId: searchParams.get('parentId') || undefined,
          country: searchParams.get('country') || undefined,
        });

        return NextResponse.json({
          success: true,
          data: entities,
        });

      case 'hierarchy':
        const hierarchy = await EntityService.getEntityHierarchy(
          tenantId,
          searchParams.get('rootId') || undefined
        );

        return NextResponse.json({
          success: true,
          data: hierarchy,
        });

      case 'entity':
        if (!entityId) {
          return NextResponse.json(
            { error: 'entityId is required', errorAr: 'معرف الكيان مطلوب' },
            { status: 400 }
          );
        }

        const entity = await EntityService.getEntityById(entityId);

        return NextResponse.json({
          success: true,
          data: entity,
        });

      case 'children':
        if (!entityId) {
          return NextResponse.json(
            { error: 'entityId is required', errorAr: 'معرف الكيان مطلوب' },
            { status: 400 }
          );
        }

        const children = await EntityService.getChildren(entityId);

        return NextResponse.json({
          success: true,
          data: children,
        });

      case 'stats':
        if (!entityId) {
          return NextResponse.json(
            { error: 'entityId is required', errorAr: 'معرف الكيان مطلوب' },
            { status: 400 }
          );
        }

        const stats = await EntityService.getEntityStats(entityId);

        return NextResponse.json({
          success: true,
          data: stats,
        });

      case 'consolidated':
        const consolidated = await EntityService.getConsolidatedView(tenantId);

        return NextResponse.json({
          success: true,
          data: consolidated,
        });

      case 'transfers':
        const transfers = await EntityService.getTransfers(tenantId, {
          employeeId: searchParams.get('employeeId') || undefined,
          sourceEntityId: searchParams.get('sourceEntityId') || undefined,
          targetEntityId: searchParams.get('targetEntityId') || undefined,
          status: searchParams.get('transferStatus') as any,
        });

        return NextResponse.json({
          success: true,
          data: transfers,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid type', errorAr: 'نوع غير صالح' },
          { status: 400 }
        );
    }
  } catch {
        return NextResponse.json(
      { error: 'Failed to fetch enterprise data', errorAr: 'فشل في جلب بيانات المؤسسة' },
      { status: 500 }
    );
  }
}
