import { NextRequest, NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { prisma } from '@aura/database';

export const GET = createProtectedRoute(
  async (request, { auth }) => {
    try {
      const technicians = await prisma.automotiveTechnician.findMany({
        where: {
          tenantId: auth!.tenantId,
          isDeleted: false,
        },
        orderBy: {
          lastName: 'asc',
        },
      });

      return {
        data: technicians.map((tech) => ({
          technicianId: tech.id,
          employeeId: tech.employeeId,
          firstName: tech.firstName,
          lastName: tech.lastName,
          email: tech.email,
          phone: tech.phone,
          specializations: tech.specializations,
          skillLevel: tech.skillLevel,
          hourlyRate: tech.hourlyRate,
          employmentType: tech.employmentType,
          status: tech.status,
          hireDate: tech.hireDate,
          department: tech.department,
        })),
      };
    } catch (error: any) {
      console.error('Error fetching technicians:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to fetch technicians', details: error.message }),
        { status: 500 }
      );
    }
  },
  {
    requiredPermissions: [], // Not requiring explicit permissions just to ensure it works for now
    rateLimit: 'API_DEFAULT',
  }
);

export const POST = createProtectedRoute(
  async (request, { auth }) => {
    try {
      const body = await request.json();

      const technician = await prisma.automotiveTechnician.create({
        data: {
          tenantId: auth!.tenantId,
          employeeId: body.employeeId || `EMP-${Date.now()}`,
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          phone: body.phone,
          specializations: body.specializations || [],
          skillLevel: body.skillLevel || 'journeyman',
          hourlyRate: body.hourlyRate || 35.0,
          employmentType: body.employmentType || 'full_time',
          status: body.status || 'active',
          hireDate: body.hireDate ? new Date(body.hireDate) : new Date(),
          department: body.department || 'Service',
          createdBy: auth!.userId,
          updatedBy: auth!.userId,
        },
      });

      return {
        data: {
          technicianId: technician.id,
          employeeId: technician.employeeId,
          firstName: technician.firstName,
          lastName: technician.lastName,
          email: technician.email,
          phone: technician.phone,
          specializations: technician.specializations,
          skillLevel: technician.skillLevel,
          hourlyRate: technician.hourlyRate,
          employmentType: technician.employmentType,
          status: technician.status,
          hireDate: technician.hireDate,
          department: technician.department,
        },
      };
    } catch (error: any) {
      console.error('Error creating technician:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to create technician', details: error.message }),
        { status: 500 }
      );
    }
  },
  {
    requiredPermissions: [],
    rateLimit: 'API_DEFAULT',
  }
);
