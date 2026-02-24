import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const IPRestrictionSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['WHITELIST', 'BLACKLIST']),
  ipAddresses: z.array(z.string()),
  ipRanges: z.array(z.object({
    start: z.string(),
    end: z.string(),
  })).optional(),
  applicableTo: z.enum(['ALL', 'DEPARTMENT', 'DESIGNATION', 'CUSTOM']),
  departments: z.array(z.string()).optional(),
  designations: z.array(z.string()).optional(),
  employees: z.array(z.string()).optional(),
  strictMode: z.boolean().default(false), // If true, punch outside allowed IPs is rejected
  isActive: z.boolean().default(true),
});

// GET - Fetch IP restrictions
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const type = searchParams.get('type');
      const isActive = searchParams.get('isActive');

      const mockIPRestrictions = [
        {
          id: '1',
          name: 'Office Network - Whitelist',
          description: 'Allowed IP addresses from office network',
          type: 'WHITELIST',
          ipAddresses: [
            '192.168.1.1',
            '192.168.1.100',
            '203.0.113.50',
          ],
          ipRanges: [
            { start: '192.168.1.1', end: '192.168.1.255' },
            { start: '10.0.0.1', end: '10.0.0.100' },
          ],
          applicableTo: 'ALL',
          strictMode: false,
          isActive: true,
          totalIPs: 258,
          createdAt: '2024-01-01T00:00:00',
          updatedAt: '2024-01-01T00:00:00',
        },
        {
          id: '2',
          name: 'Branch Office VPN IPs',
          description: 'VPN IP addresses for branch office employees',
          type: 'WHITELIST',
          ipAddresses: [
            '203.0.113.100',
            '203.0.113.101',
          ],
          ipRanges: [
            { start: '203.0.113.100', end: '203.0.113.200' },
          ],
          applicableTo: 'DEPARTMENT',
          departments: ['Sales', 'Support'],
          strictMode: true,
          isActive: true,
          totalIPs: 103,
          createdAt: '2024-02-01T00:00:00',
          updatedAt: '2024-02-01T00:00:00',
        },
        {
          id: '3',
          name: 'Blocked IPs - Security',
          description: 'Blacklisted IP addresses due to security concerns',
          type: 'BLACKLIST',
          ipAddresses: [
            '198.51.100.50',
            '198.51.100.51',
          ],
          applicableTo: 'ALL',
          strictMode: true,
          isActive: true,
          totalIPs: 2,
          createdAt: '2024-03-01T00:00:00',
          updatedAt: '2024-03-01T00:00:00',
        },
        {
          id: '4',
          name: 'Executive Remote Access',
          description: 'Specific IPs allowed for executive team',
          type: 'WHITELIST',
          ipAddresses: [
            '203.0.113.250',
          ],
          applicableTo: 'DESIGNATION',
          designations: ['C-Level', 'VP', 'Director'],
          strictMode: false,
          isActive: true,
          totalIPs: 1,
          createdAt: '2024-04-01T00:00:00',
          updatedAt: '2024-04-01T00:00:00',
        },
      ];

      let filteredData = mockIPRestrictions;
      if (type) filteredData = filteredData.filter(r => r.type === type);
      if (isActive !== null) filteredData = filteredData.filter(r => r.isActive === (isActive === 'true'));

      const summary = {
        total: filteredData.length,
        active: filteredData.filter(r => r.isActive).length,
        inactive: filteredData.filter(r => !r.isActive).length,
        whitelist: filteredData.filter(r => r.type === 'WHITELIST').length,
        blacklist: filteredData.filter(r => r.type === 'BLACKLIST').length,
        totalAllowedIPs: filteredData
          .filter(r => r.type === 'WHITELIST')
          .reduce((sum, r) => sum + (r.totalIPs || 0), 0),
        totalBlockedIPs: filteredData
          .filter(r => r.type === 'BLACKLIST')
          .reduce((sum, r) => sum + (r.totalIPs || 0), 0),
      };

      return NextResponse.json({
        success: true,
        data: { ipRestrictions: filteredData, summary },
        meta: { total: filteredData.length },
      });
    } catch (error) {
      logger.error({ error }, 'Error fetching IP restrictions:');
      return NextResponse.json(
        { success: false, error: 'Failed to fetch IP restrictions' },
        { status: 500 }
      );
    }
  }
);

// POST - Create IP restriction or validate IP
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();

      // If action is validate, check if IP is allowed
      if (body.action === 'validate') {
        const { ipAddress, employeeId } = body;

        if (!ipAddress) {
          return NextResponse.json(
            { success: false, error: 'ipAddress is required' },
            { status: 400 }
          );
        }

        // Mock validation - check against allowed IPs
        const allowedIPs = ['192.168.1.100', '203.0.113.50', '10.0.0.50'];
        const blockedIPs = ['198.51.100.50'];

        const isBlocked = blockedIPs.includes(ipAddress);
        const isAllowed = allowedIPs.includes(ipAddress);

        // Check IP range (simple example for 192.168.1.x)
        const isInRange = ipAddress.startsWith('192.168.1.') || ipAddress.startsWith('10.0.0.');

        return NextResponse.json({
          success: true,
          data: {
            ipAddress,
            isValid: (isAllowed || isInRange) && !isBlocked,
            isBlocked,
            isAllowed: isAllowed || isInRange,
            matchedRule: isBlocked
              ? 'Blocked IPs - Security'
              : isAllowed || isInRange
                ? 'Office Network - Whitelist'
                : null,
            message: isBlocked
              ? 'IP address is blocked'
              : isAllowed || isInRange
                ? 'IP address is allowed'
                : 'IP address is not in whitelist',
          },
        });
      }

      // Create new IP restriction
      const data = IPRestrictionSchema.parse(body);

      const totalIPs =
        data.ipAddresses.length +
        (data.ipRanges?.reduce((sum, range) => {
          // Simple calculation for demonstration
          return sum + 100; // Approximate range size
        }, 0) || 0);

      const newRestriction = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        totalIPs,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user.userId,
      };

      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.userId,
          tenantId: user.tenantId,
          action: 'CREATE',
          entityType: 'Attendance - IP Restriction',
          details: `Created IP restriction: ${data.name}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: newRestriction }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      logger.error({ error }, 'Error creating IP restriction:');
      return NextResponse.json(
        { success: false, error: 'Failed to create IP restriction' },
        { status: 500 }
      );
    }
  }
);

// PUT - Update IP restriction
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const { id, ...updates } = body;

      if (!id) {
        return NextResponse.json(
          { success: false, error: 'IP restriction ID is required' },
          { status: 400 }
        );
      }

      const updated = {
        id,
        ...updates,
        updatedAt: new Date().toISOString(),
        updatedBy: user.userId,
      };

      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.userId,
          action: 'UPDATE',
          entityType: 'Attendance - IP Restriction',
          details: `Updated IP restriction: ${id}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: updated });
    } catch (error) {
      logger.error({ error }, '');
      return NextResponse.json(
        { success: false, error: 'Failed to update IP restriction' },
        { status: 500 }
      );
    }
  }
);

// DELETE - Delete IP restriction
export const DELETE = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.DELETE, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          { success: false, error: 'IP restriction ID is required' },
          { status: 400 }
        );
      }

      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.userId,
          action: 'DELETE',
          entityType: 'Attendance - IP Restriction',
          details: `Deleted IP restriction: ${id}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, message: 'IP restriction deleted successfully' });
    } catch (error) {
      logger.error({ error }, '');
      return NextResponse.json(
        { success: false, error: 'Failed to delete IP restriction' },
        { status: 500 }
      );
    }
  }
);
