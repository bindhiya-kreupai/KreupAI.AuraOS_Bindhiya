import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

type ComponentKind = 'earning' | 'deduction';
type ComponentCalc = 'fixed' | 'percent_of_basic' | 'percent_of_gross';

interface ComponentSpec {
  code: string;
  name: string;
  kind: ComponentKind;
  calc: ComponentCalc;
  value: number;
  taxable?: boolean;
  statutory?: boolean;
}

interface SimulationLine {
  code: string;
  name: string;
  kind: ComponentKind;
  amount: number;
  taxable: boolean;
}

interface SimulationResult {
  basicSalary: number;
  grossSalary: number;
  totalEarnings: number;
  totalDeductions: number;
  netPay: number;
  taxableIncome: number;
  currency: string;
  lines: SimulationLine[];
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function computeLine(spec: ComponentSpec, basic: number, gross: number): SimulationLine {
  let amount = 0;
  switch (spec.calc) {
    case 'fixed':
      amount = spec.value;
      break;
    case 'percent_of_basic':
      amount = basic * (spec.value / 100);
      break;
    case 'percent_of_gross':
      amount = gross * (spec.value / 100);
      break;
  }
  return {
    code: spec.code,
    name: spec.name,
    kind: spec.kind,
    amount: round2(amount),
    taxable: spec.taxable ?? spec.kind === 'earning',
  };
}

function simulate(input: {
  basicSalary: number;
  grossSalary?: number;
  currency?: string;
  components: ComponentSpec[];
}): SimulationResult {
  const basic = Number(input.basicSalary) || 0;
  const gross = Number(input.grossSalary) || basic;
  const lines = (input.components ?? []).map((c) => computeLine(c, basic, gross));

  const totalEarnings = lines.filter((l) => l.kind === 'earning').reduce((s, l) => s + l.amount, 0);
  const totalDeductions = lines
    .filter((l) => l.kind === 'deduction')
    .reduce((s, l) => s + l.amount, 0);
  const taxableIncome = lines
    .filter((l) => l.kind === 'earning' && l.taxable)
    .reduce((s, l) => s + l.amount, 0);

  return {
    basicSalary: round2(basic),
    grossSalary: round2(gross || basic + totalEarnings),
    totalEarnings: round2(totalEarnings),
    totalDeductions: round2(totalDeductions),
    netPay: round2(basic + totalEarnings - totalDeductions),
    taxableIncome: round2(taxableIncome),
    currency: input.currency ?? 'USD',
    lines,
  };
}

export const POST = withEnhancedAuth(
  async (request: NextRequest, context: { user: { tenantId: string }; permissions: string[] }) => {
    try {
      const { user, permissions } = context;
      if (!permissions.includes('payroll:read')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing payroll:read',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }

      const body = await request.json();

      // Two modes: (a) inline components in body, (b) reference an existing structure by structureId
      let components: ComponentSpec[] = Array.isArray(body.components) ? body.components : [];
      let basicSalary: number = Number(body.basicSalary) || 0;
      let grossSalary: number | undefined = body.grossSalary ? Number(body.grossSalary) : undefined;
      let currency: string = body.currency ?? 'USD';

      if (body.structureId) {
        const structure = await (prisma as any).salaryStructure.findFirst({
          where: { id: body.structureId, tenantId: user.tenantId, isDeleted: false },
        });
        if (!structure) {
          return NextResponse.json(
            { success: false, error: { code: 'E4040', message: 'Structure not found' } },
            { status: 404 }
          );
        }
        components = (structure.components as unknown as ComponentSpec[]) ?? [];
        basicSalary = body.basicSalary ? Number(body.basicSalary) : Number(structure.basicSalary);
        grossSalary = body.grossSalary ? Number(body.grossSalary) : Number(structure.grossSalary);
        currency = body.currency ?? structure.currency;
      }

      if (!basicSalary || basicSalary <= 0) {
        return NextResponse.json(
          { success: false, error: { code: 'E2001', message: 'basicSalary > 0 required' } },
          { status: 400 }
        );
      }

      const result = simulate({ basicSalary, grossSalary, currency, components });

      return NextResponse.json({
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      });
    } catch (error: unknown) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Salary simulation failed',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
          },
        },
        { status: 500 }
      );
    }
  }
);
