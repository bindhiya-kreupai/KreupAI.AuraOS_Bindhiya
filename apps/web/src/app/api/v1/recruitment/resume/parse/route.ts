import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import {
  forbidden,
  safeJson,
  serverError,
  successItem,
  validationError,
} from '@/lib/api/crud-helpers';

const SKILL_VOCAB = [
  'javascript',
  'typescript',
  'python',
  'java',
  'sql',
  'aws',
  'azure',
  'gcp',
  'docker',
  'kubernetes',
  'react',
  'node',
  'c++',
  'c#',
  'machine learning',
  'data analysis',
  'excel',
  'accounting',
  'payroll',
  'recruiting',
];

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('recruitment:resume:parse'))
      return forbidden('recruitment:resume:parse');
    const body = await safeJson(request);
    if (!body?.text) return validationError({ message: 'text required' });
    const text = String(body.text).toLowerCase();
    const emails = Array.from(text.matchAll(/[\w.+-]+@[\w-]+\.[\w.-]+/g)).map((m) => m[0]);
    const phones = Array.from(text.matchAll(/\+?\d[\d\s().-]{7,}\d/g)).map((m) => m[0]);
    const years = Array.from(text.matchAll(/(\d+)\+?\s*years?/g)).map((m) => Number(m[1]));
    const totalYears = years.reduce((a, b) => a + b, 0);
    const skills = SKILL_VOCAB.filter((s) => text.includes(s));
    const output = { emails, phones, totalExperienceYears: totalYears, skills };
    await prisma.aIRunRecord.create({
      data: {
        tenantId: user.tenantId,
        runType: 'resume_parse',
        output: output as any,
        completedAt: new Date(),
        durationMs: 0,
      },
    });
    return successItem(output);
  } catch (error: any) {
    return serverError(error, 'parse resume');
  }
});
