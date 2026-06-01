/**
 * Enterprise Multi-Entity API Routes
 * Phase 4: Enterprise Expansion
 *
 * Tenant scoping: tenantId is ALWAYS extracted from the authenticated session.
 * Any tenantId / createdBy / approverId supplied in the request body or query string
 * is silently ignored for tenant context — only the resource-identifier params
 * (entityId, transferId) are read from the request.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { EntityService } from '@/lib/services/enterprise';

/**
 * POST /api/enterprise
 * Manage entities and transfers (auth: enterprise:write)
 */
export const POST = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const body = await request.json();
    const tenantId = auth!.tenantId;
    const userId = auth!.userId;
    const action = body.action || 'create-entity';

    switch (action) {
      case 'create-entity': {
        if (!body.entity) {
          return NextResponse.json(
            { error: 'entity is required', errorAr: 'الكيان مطلوب' },
            { status: 400 }
          );
        }
        const newEntity = await EntityService.createEntity({
          ...body.entity,
          tenantId,
          createdBy: userId,
        });
        return { success: true, data: newEntity };
      }

      case 'update-entity': {
        if (!body.entityId || !body.updates) {
          return NextResponse.json(
            {
              error: 'entityId and updates are required',
              errorAr: 'معرف الكيان والتحديثات مطلوبان',
            },
            { status: 400 }
          );
        }
        const updatedEntity = await EntityService.updateEntity(body.entityId, body.updates);
        return { success: true, data: updatedEntity };
      }

      case 'move-entity': {
        if (!body.entityId) {
          return NextResponse.json(
            { error: 'entityId is required', errorAr: 'معرف الكيان مطلوب' },
            { status: 400 }
          );
        }
        const movedEntity = await EntityService.moveEntity(body.entityId, body.newParentId);
        return { success: true, data: movedEntity };
      }

      case 'archive-entity': {
        if (!body.entityId) {
          return NextResponse.json(
            { error: 'entityId is required', errorAr: 'معرف الكيان مطلوب' },
            { status: 400 }
          );
        }
        const archivedEntity = await EntityService.archiveEntity(body.entityId);
        return { success: true, data: archivedEntity };
      }

      case 'create-transfer': {
        if (!body.transfer) {
          return NextResponse.json(
            { error: 'transfer is required', errorAr: 'بيانات النقل مطلوبة' },
            { status: 400 }
          );
        }
        const transfer = await EntityService.createTransfer({
          ...body.transfer,
          createdBy: userId,
        });
        return { success: true, data: transfer };
      }

      case 'submit-transfer': {
        if (!body.transferId) {
          return NextResponse.json(
            { error: 'transferId is required', errorAr: 'معرف النقل مطلوب' },
            { status: 400 }
          );
        }
        const submittedTransfer = await EntityService.submitTransfer(body.transferId);
        return { success: true, data: submittedTransfer };
      }

      case 'approve-transfer': {
        if (!body.transferId || !body.action) {
          return NextResponse.json(
            { error: 'transferId and action are required', errorAr: 'معرف النقل والإجراء مطلوبان' },
            { status: 400 }
          );
        }
        const approvedTransfer = await EntityService.processTransferApproval(
          body.transferId,
          userId,
          body.action,
          body.comments
        );
        return { success: true, data: approvedTransfer };
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action', errorAr: 'إجراء غير صالح' },
          { status: 400 }
        );
    }
  },
  {
    requiredPermissions: ['enterprise:write'],
    rateLimit: 'API_USER',
  }
);

/**
 * GET /api/enterprise
 * Get entities and hierarchy (auth: enterprise:read)
 */
export const GET = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const { searchParams } = new URL(request.url);
    const tenantId = auth!.tenantId;
    const type = searchParams.get('type') || 'entities';
    const entityId = searchParams.get('entityId');

    switch (type) {
      case 'entities': {
        const entities = await EntityService.getEntities(tenantId, {
          type: searchParams.get('entityType') as any,
          status: searchParams.get('status') as any,
          parentId: searchParams.get('parentId') || undefined,
          country: searchParams.get('country') || undefined,
        });
        return { success: true, data: entities };
      }

      case 'hierarchy': {
        const hierarchy = await EntityService.getEntityHierarchy(
          tenantId,
          searchParams.get('rootId') || undefined
        );
        return { success: true, data: hierarchy };
      }

      case 'entity': {
        if (!entityId) {
          return NextResponse.json(
            { error: 'entityId is required', errorAr: 'معرف الكيان مطلوب' },
            { status: 400 }
          );
        }
        const entity = await EntityService.getEntityById(entityId);
        return { success: true, data: entity };
      }

      case 'children': {
        if (!entityId) {
          return NextResponse.json(
            { error: 'entityId is required', errorAr: 'معرف الكيان مطلوب' },
            { status: 400 }
          );
        }
        const children = await EntityService.getChildren(entityId);
        return { success: true, data: children };
      }

      case 'stats': {
        if (!entityId) {
          return NextResponse.json(
            { error: 'entityId is required', errorAr: 'معرف الكيان مطلوب' },
            { status: 400 }
          );
        }
        const stats = await EntityService.getEntityStats(entityId);
        return { success: true, data: stats };
      }

      case 'consolidated': {
        const consolidated = await EntityService.getConsolidatedView(tenantId);
        return { success: true, data: consolidated };
      }

      case 'transfers': {
        const transfers = await EntityService.getTransfers(tenantId, {
          employeeId: searchParams.get('employeeId') || undefined,
          sourceEntityId: searchParams.get('sourceEntityId') || undefined,
          targetEntityId: searchParams.get('targetEntityId') || undefined,
          status: searchParams.get('transferStatus') as any,
        });
        return { success: true, data: transfers };
      }

      default:
        return NextResponse.json(
          { error: 'Invalid type', errorAr: 'نوع غير صالح' },
          { status: 400 }
        );
    }
  },
  {
    requiredPermissions: ['enterprise:read'],
    rateLimit: 'API_USER',
  }
);
