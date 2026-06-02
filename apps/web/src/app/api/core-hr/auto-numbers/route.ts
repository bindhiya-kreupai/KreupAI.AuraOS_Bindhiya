import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { z } from 'zod';

const SEQUENCES: Record<string, { prefix: string; currentNumber: number; padLength: number; description: string }> = {
  EMPLOYEE: { prefix: 'EMP', currentNumber: 1000, padLength: 6, description: 'Employee Code' },
  ASSET: { prefix: 'AST', currentNumber: 500, padLength: 6, description: 'Asset Code' },
  ID_CARD: { prefix: 'IDC', currentNumber: 100, padLength: 5, description: 'ID Card Number' },
  LETTER: { prefix: 'LTR', currentNumber: 200, padLength: 5, description: 'Letter Reference' },
  EXIT: { prefix: 'EXT', currentNumber: 50, padLength: 5, description: 'Exit Request Number' },
};

// In-memory counter state (resets on server restart - for production use a DB-backed sequence)
const counters: Record<string, number> = {};

function getNextNumber(entityType: string): string | null {
  const sequence = SEQUENCES[entityType];
  if (!sequence) return null;

  if (!counters[entityType]) {
    counters[entityType] = sequence.currentNumber;
  }

  counters[entityType] += 1;
  const numberStr = String(counters[entityType]).padStart(sequence.padLength, '0');
  return `${sequence.prefix}-${numberStr}`;
}

const generateNumberSchema = z.object({
  entityType: z.string().min(1),
});

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const sequences = Object.entries(SEQUENCES).map(([key, value]) => ({
      entityType: key,
      prefix: value.prefix,
      currentNumber: counters[key] || value.currentNumber,
      padLength: value.padLength,
      description: value.description,
      nextValue: `${value.prefix}-${String((counters[key] || value.currentNumber) + 1).padStart(value.padLength, '0')}`,
    }));

    return NextResponse.json({ sequences }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching auto-number sequences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const body = await request.json();
    const validated = generateNumberSchema.parse(body);

    const nextNumber = getNextNumber(validated.entityType.toUpperCase());

    if (!nextNumber) {
      return NextResponse.json(
        { error: `Unknown entity type: ${validated.entityType}. Valid types: ${Object.keys(SEQUENCES).join(', ')}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        entityType: validated.entityType.toUpperCase(),
        number: nextNumber,
        generatedNumber: nextNumber,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error generating auto-number:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
