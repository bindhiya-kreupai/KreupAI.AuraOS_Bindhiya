/**
 * @service AssetService
 * @description Service layer for Asset Management
 * @project AURA HCM Platform
 */

import { PrismaClient } from '@aura/database';
import { z } from 'zod';

const prisma = new PrismaClient();

// ========================================
// VALIDATION SCHEMAS
// ========================================

export const createAssetSchema = z.object({
  tenantId: z.string(),
  assetCode: z.string().min(1, 'Asset code is required'),
  assetName: z.string().min(1, 'Asset name is required'),
  description: z.string().optional(),
  category: z.enum(['COMPUTER', 'FURNITURE', 'VEHICLE', 'MOBILE', 'EQUIPMENT', 'OTHER']),
  assetType: z.string().min(1, 'Asset type is required'),

  // Identification
  serialNumber: z.string().optional(),
  modelNumber: z.string().optional(),
  manufacturer: z.string().optional(),
  brand: z.string().optional(),

  // Financial
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().optional(),
  currentValue: z.number().optional(),
  depreciationRate: z.number().min(0).max(100).optional(),
  salvageValue: z.number().optional(),

  // Location & Status
  locationId: z.string().optional(),
  status: z.enum(['AVAILABLE', 'ASSIGNED', 'IN_REPAIR', 'RETIRED', 'DISPOSED']).default('AVAILABLE'),
  condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR']).optional(),

  // Warranty
  warrantyStartDate: z.string().optional(),
  warrantyEndDate: z.string().optional(),
  warrantyProvider: z.string().optional(),

  // Maintenance
  maintenanceInterval: z.number().optional(),

  // Metadata
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  imageUrl: z.string().optional(),
});

export const updateAssetSchema = createAssetSchema.partial().omit({ tenantId: true });

export const assignAssetSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  assignedBy: z.string().min(1, 'Assigned by is required'),
  expectedReturnDate: z.string().optional(),
  conditionAtAssignment: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR']).optional(),
  assignmentNotes: z.string().optional(),
});

export const returnAssetSchema = z.object({
  returnedBy: z.string().min(1, 'Returned by is required'),
  conditionAtReturn: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR']).optional(),
  returnNotes: z.string().optional(),
});

export const scheduleMaintenanceSchema = z.object({
  tenantId: z.string(),
  assetId: z.string(),
  maintenanceType: z.enum(['PREVENTIVE', 'CORRECTIVE', 'INSPECTION', 'UPGRADE']),
  description: z.string().min(1, 'Description is required'),
  scheduledDate: z.string(),
  serviceProvider: z.string().optional(),
  cost: z.number().optional(),
  notes: z.string().optional(),
});

// ========================================
// TYPES
// ========================================

export interface AssetFilter {
  tenantId: string;
  category?: string;
  status?: string;
  locationId?: string;
  search?: string;
  condition?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AssignmentFilter {
  tenantId: string;
  assetId?: string;
  employeeId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface MaintenanceFilter {
  tenantId: string;
  assetId?: string;
  status?: string;
  maintenanceType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// ========================================
// ASSET SERVICE
// ========================================

export class AssetService {
  /**
   * Find all assets with filtering and pagination
   */
  static async findAll(filter: AssetFilter) {
    const {
      tenantId,
      category,
      status,
      locationId,
      search,
      condition,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filter;

    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
      ...(category && { category }),
      ...(status && { status }),
      ...(locationId && { locationId }),
      ...(condition && { condition }),
      ...(search && {
        OR: [
          { assetCode: { contains: search, mode: 'insensitive' } },
          { assetName: { contains: search, mode: 'insensitive' } },
          { serialNumber: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          location: true,
          assignments: {
            where: { status: 'ACTIVE' },
            take: 1,
            orderBy: { assignedDate: 'desc' },
          },
          maintenances: {
            where: { status: { in: ['SCHEDULED', 'IN_PROGRESS'] } },
            take: 5,
            orderBy: { scheduledDate: 'asc' },
          },
        },
      }),
      prisma.asset.count({ where }),
    ]);

    return {
      data: assets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find asset by ID with full details
   */
  static async findById(id: string, tenantId: string) {
    const asset = await prisma.asset.findFirst({
      where: { id, tenantId },
      include: {
        location: true,
        assignments: {
          orderBy: { assignedDate: 'desc' },
          take: 10,
        },
        maintenances: {
          orderBy: { scheduledDate: 'desc' },
          take: 10,
        },
      },
    });

    return asset;
  }

  /**
   * Create new asset
   */
  static async create(data: z.infer<typeof createAssetSchema>) {
    // Validate input
    const validatedData = createAssetSchema.parse(data);

    // Check for duplicate asset code
    const existing = await prisma.asset.findUnique({
      where: {
        tenantId_assetCode: {
          tenantId: validatedData.tenantId,
          assetCode: validatedData.assetCode,
        },
      },
    });

    if (existing) {
      throw new Error(`Asset with code ${validatedData.assetCode} already exists`);
    }

    // Create asset
    const asset = await prisma.asset.create({
      data: {
        ...validatedData,
        tags: validatedData.tags ? JSON.stringify(validatedData.tags) : undefined,
        purchaseDate: validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : undefined,
        warrantyStartDate: validatedData.warrantyStartDate ? new Date(validatedData.warrantyStartDate) : undefined,
        warrantyEndDate: validatedData.warrantyEndDate ? new Date(validatedData.warrantyEndDate) : undefined,
        // Calculate initial current value based on depreciation if provided
        currentValue: validatedData.currentValue || validatedData.purchasePrice,
      },
      include: {
        location: true,
      },
    });

    return asset;
  }

  /**
   * Update asset
   */
  static async update(id: string, tenantId: string, data: z.infer<typeof updateAssetSchema>) {
    // Validate input
    const validatedData = updateAssetSchema.parse(data);

    // Check if asset exists
    const existing = await prisma.asset.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new Error('Asset not found');
    }

    // If asset code is being changed, check for duplicates
    if (validatedData.assetCode && validatedData.assetCode !== existing.assetCode) {
      const duplicate = await prisma.asset.findUnique({
        where: {
          tenantId_assetCode: {
            tenantId,
            assetCode: validatedData.assetCode,
          },
        },
      });

      if (duplicate) {
        throw new Error(`Asset with code ${validatedData.assetCode} already exists`);
      }
    }

    // Update asset
    const asset = await prisma.asset.update({
      where: { id },
      data: {
        ...validatedData,
        tags: validatedData.tags ? JSON.stringify(validatedData.tags) : undefined,
        purchaseDate: validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : undefined,
        warrantyStartDate: validatedData.warrantyStartDate ? new Date(validatedData.warrantyStartDate) : undefined,
        warrantyEndDate: validatedData.warrantyEndDate ? new Date(validatedData.warrantyEndDate) : undefined,
      },
      include: {
        location: true,
        assignments: {
          where: { status: 'ACTIVE' },
          take: 1,
        },
      },
    });

    return asset;
  }

  /**
   * Delete asset (soft delete by setting status to DISPOSED)
   */
  static async delete(id: string, tenantId: string) {
    // Check if asset exists
    const existing = await prisma.asset.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new Error('Asset not found');
    }

    // Check if asset is currently assigned
    const activeAssignment = await prisma.assetAssignment.findFirst({
      where: {
        assetId: id,
        status: 'ACTIVE',
      },
    });

    if (activeAssignment) {
      throw new Error('Cannot delete asset that is currently assigned');
    }

    // Soft delete
    await prisma.asset.update({
      where: { id },
      data: { status: 'DISPOSED' },
    });

    return { success: true };
  }

  /**
   * Assign asset to employee
   */
  static async assignAsset(assetId: string, tenantId: string, data: z.infer<typeof assignAssetSchema>) {
    // Validate input
    const validatedData = assignAssetSchema.parse(data);

    // Check if asset exists and is available
    const asset = await prisma.asset.findFirst({
      where: { id: assetId, tenantId },
    });

    if (!asset) {
      throw new Error('Asset not found');
    }

    if (asset.status !== 'AVAILABLE') {
      throw new Error(`Asset is not available (current status: ${asset.status})`);
    }

    // Check for active assignment
    const activeAssignment = await prisma.assetAssignment.findFirst({
      where: {
        assetId,
        status: 'ACTIVE',
      },
    });

    if (activeAssignment) {
      throw new Error('Asset is already assigned');
    }

    // Create assignment and update asset
    const [assignment] = await prisma.$transaction([
      prisma.assetAssignment.create({
        data: {
          tenantId,
          assetId,
          employeeId: validatedData.employeeId,
          assignedBy: validatedData.assignedBy,
          expectedReturnDate: validatedData.expectedReturnDate ? new Date(validatedData.expectedReturnDate) : undefined,
          conditionAtAssignment: validatedData.conditionAtAssignment,
          assignmentNotes: validatedData.assignmentNotes,
          status: 'ACTIVE',
        },
      }),
      prisma.asset.update({
        where: { id: assetId },
        data: {
          status: 'ASSIGNED',
          currentEmployeeId: validatedData.employeeId,
          currentAssignedAt: new Date(),
        },
      }),
    ]);

    return assignment;
  }

  /**
   * Return asset from employee
   */
  static async returnAsset(assignmentId: string, tenantId: string, data: z.infer<typeof returnAssetSchema>) {
    // Validate input
    const validatedData = returnAssetSchema.parse(data);

    // Check if assignment exists and is active
    const assignment = await prisma.assetAssignment.findFirst({
      where: { id: assignmentId, tenantId, status: 'ACTIVE' },
      include: { asset: true },
    });

    if (!assignment) {
      throw new Error('Active assignment not found');
    }

    // Update assignment and asset
    await prisma.$transaction([
      prisma.assetAssignment.update({
        where: { id: assignmentId },
        data: {
          returnedDate: new Date(),
          returnedBy: validatedData.returnedBy,
          conditionAtReturn: validatedData.conditionAtReturn,
          returnNotes: validatedData.returnNotes,
          status: 'RETURNED',
        },
      }),
      prisma.asset.update({
        where: { id: assignment.assetId },
        data: {
          status: 'AVAILABLE',
          currentEmployeeId: null,
          currentAssignedAt: null,
          condition: validatedData.conditionAtReturn || assignment.asset.condition,
        },
      }),
    ]);

    return { success: true };
  }

  /**
   * Get assignment history for an asset
   */
  static async getAssignmentHistory(assetId: string, tenantId: string) {
    const assignments = await prisma.assetAssignment.findMany({
      where: { assetId, tenantId },
      orderBy: { assignedDate: 'desc' },
    });

    return assignments;
  }

  /**
   * Schedule maintenance
   */
  static async scheduleMaintenance(data: z.infer<typeof scheduleMaintenanceSchema>) {
    // Validate input
    const validatedData = scheduleMaintenanceSchema.parse(data);

    // Check if asset exists
    const asset = await prisma.asset.findFirst({
      where: { id: validatedData.assetId, tenantId: validatedData.tenantId },
    });

    if (!asset) {
      throw new Error('Asset not found');
    }

    // Create maintenance record
    const maintenance = await prisma.assetMaintenance.create({
      data: {
        tenantId: validatedData.tenantId,
        assetId: validatedData.assetId,
        maintenanceType: validatedData.maintenanceType,
        description: validatedData.description,
        scheduledDate: new Date(validatedData.scheduledDate),
        serviceProvider: validatedData.serviceProvider,
        cost: validatedData.cost,
        notes: validatedData.notes,
        status: 'SCHEDULED',
      },
    });

    // If maintenance type is preventive, calculate next maintenance date
    if (validatedData.maintenanceType === 'PREVENTIVE' && asset.maintenanceInterval) {
      const nextDate = new Date(validatedData.scheduledDate);
      nextDate.setDate(nextDate.getDate() + asset.maintenanceInterval);

      await prisma.asset.update({
        where: { id: validatedData.assetId },
        data: {
          lastMaintenanceDate: new Date(validatedData.scheduledDate),
          nextMaintenanceDate: nextDate,
        },
      });
    }

    return maintenance;
  }

  /**
   * Complete maintenance
   */
  static async completeMaintenance(maintenanceId: string, tenantId: string, performedBy: string, cost?: number) {
    // Check if maintenance exists
    const maintenance = await prisma.assetMaintenance.findFirst({
      where: { id: maintenanceId, tenantId },
      include: { asset: true },
    });

    if (!maintenance) {
      throw new Error('Maintenance record not found');
    }

    // Update maintenance
    await prisma.assetMaintenance.update({
      where: { id: maintenanceId },
      data: {
        completedDate: new Date(),
        performedBy,
        cost: cost || maintenance.cost,
        status: 'COMPLETED',
      },
    });

    // Update asset if it was in repair
    if (maintenance.asset.status === 'IN_REPAIR') {
      await prisma.asset.update({
        where: { id: maintenance.assetId },
        data: {
          status: maintenance.asset.currentEmployeeId ? 'ASSIGNED' : 'AVAILABLE',
          lastMaintenanceDate: new Date(),
        },
      });
    }

    return { success: true };
  }

  /**
   * Get assets with upcoming maintenance
   */
  static async getUpcomingMaintenance(tenantId: string, daysAhead: number = 30) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const maintenances = await prisma.assetMaintenance.findMany({
      where: {
        tenantId,
        status: 'SCHEDULED',
        scheduledDate: {
          gte: now,
          lte: futureDate,
        },
      },
      include: {
        asset: true,
      },
      orderBy: { scheduledDate: 'asc' },
    });

    return maintenances;
  }

  /**
   * Get assets with expiring warranty
   */
  static async getExpiringWarranty(tenantId: string, daysAhead: number = 30) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const assets = await prisma.asset.findMany({
      where: {
        tenantId,
        warrantyEndDate: {
          gte: now,
          lte: futureDate,
        },
      },
      orderBy: { warrantyEndDate: 'asc' },
    });

    return assets;
  }

  /**
   * Calculate depreciation for an asset
   */
  static async calculateDepreciation(assetId: string, tenantId: string) {
    const asset = await prisma.asset.findFirst({
      where: { id: assetId, tenantId },
    });

    if (!asset || !asset.purchasePrice || !asset.purchaseDate || !asset.depreciationRate) {
      return null;
    }

    const yearsElapsed = (Date.now() - asset.purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    const depreciationAmount = Number(asset.purchasePrice) * (asset.depreciationRate / 100) * yearsElapsed;
    const currentValue = Math.max(
      Number(asset.purchasePrice) - depreciationAmount,
      asset.salvageValue ? Number(asset.salvageValue) : 0
    );

    // Update asset with calculated value
    await prisma.asset.update({
      where: { id: assetId },
      data: { currentValue },
    });

    return {
      purchasePrice: asset.purchasePrice,
      depreciationRate: asset.depreciationRate,
      yearsElapsed: yearsElapsed.toFixed(2),
      depreciationAmount: depreciationAmount.toFixed(2),
      currentValue: currentValue.toFixed(2),
      salvageValue: asset.salvageValue,
    };
  }

  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(tenantId: string) {
    const [
      totalAssets,
      availableAssets,
      assignedAssets,
      inRepairAssets,
      retiredAssets,
      categoryBreakdown,
      upcomingMaintenance,
      expiringWarranty,
    ] = await Promise.all([
      prisma.asset.count({ where: { tenantId } }),
      prisma.asset.count({ where: { tenantId, status: 'AVAILABLE' } }),
      prisma.asset.count({ where: { tenantId, status: 'ASSIGNED' } }),
      prisma.asset.count({ where: { tenantId, status: 'IN_REPAIR' } }),
      prisma.asset.count({ where: { tenantId, status: 'RETIRED' } }),
      prisma.asset.groupBy({
        by: ['category'],
        where: { tenantId },
        _count: true,
      }),
      this.getUpcomingMaintenance(tenantId, 7),
      this.getExpiringWarranty(tenantId, 30),
    ]);

    return {
      total: totalAssets,
      available: availableAssets,
      assigned: assignedAssets,
      inRepair: inRepairAssets,
      retired: retiredAssets,
      categoryBreakdown,
      upcomingMaintenance: upcomingMaintenance.length,
      expiringWarranty: expiringWarranty.length,
    };
  }
}
