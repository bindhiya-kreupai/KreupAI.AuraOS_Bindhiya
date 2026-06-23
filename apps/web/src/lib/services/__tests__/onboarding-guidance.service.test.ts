import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import { onboardingGuidanceService } from '../onboarding-guidance.service';

const prismaMock = prisma as any;

const published = {
  id: 'content-1',
  tenantId: 'tenant-1',
  contentKey: 'ONBOARDING_OVERVIEW',
  countryCode: 'SA',
  version: 1,
  status: 'PUBLISHED',
  title: 'SA onboarding compliance overview',
  introduction: 'Intro',
  objectives: ['Prepare documents'],
  keyTakeaways: ['GOSI registration trigger - Within statutory registration window'],
  obligations: [{ code: 'GOSI', label: 'GOSI registration trigger' }],
  publishedAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('OnboardingGuidanceService', () => {
  beforeEach(() => {
    prismaMock.onboardingGuidanceContent = {
      findFirst: vi.fn().mockResolvedValue(published),
      findMany: vi.fn().mockResolvedValue([published]),
      create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'content-new', ...data })),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    };
    prismaMock.onboardingGuidanceViewLog = {
      create: vi.fn().mockResolvedValue({ id: 'view-1' }),
    };
    prismaMock.auditLog = {
      create: vi.fn().mockResolvedValue({ id: 'audit-1' }),
    };
  });

  it('seeds published GCC guidance defaults with country obligations', async () => {
    prismaMock.onboardingGuidanceContent.findFirst.mockResolvedValue(null);

    const rows = await onboardingGuidanceService.seedDefaults({
      tenantId: 'tenant-1',
      userId: 'admin-1',
    });

    expect(rows).toHaveLength(6);
    expect(rows.find((row) => row.countryCode === 'SA')?.keyTakeaways).toContain(
      'GOSI registration trigger - Within statutory registration window'
    );
    expect(prismaMock.auditLog.create).toHaveBeenCalled();
  });

  it('creates a new published version and archives the previous published content', async () => {
    const row = await onboardingGuidanceService.createVersion(
      {
        contentKey: 'ONBOARDING_OVERVIEW',
        countryCode: 'SA',
        title: 'Updated KSA guidance',
        introduction: 'Updated intro',
        objectives: ['Objective 1'],
        keyTakeaways: ['Qiwa first'],
        publish: true,
      },
      { tenantId: 'tenant-1', userId: 'admin-1' }
    );

    expect(prismaMock.onboardingGuidanceContent.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'ARCHIVED' }),
      })
    );
    expect(row).toMatchObject({
      version: 2,
      status: 'PUBLISHED',
      title: 'Updated KSA guidance',
    });
  });

  it('resolves the active country content and records the shown version', async () => {
    const row = await onboardingGuidanceService.resolve('tenant-1', 'ONBOARDING_OVERVIEW', 'SA', {
      userId: 'user-1',
      onboardingCaseId: 'case-1',
      stage: 'PRE_JOINING',
    });

    expect(row).toMatchObject({
      id: 'content-1',
      countryCode: 'SA',
      version: 1,
    });
    expect(prismaMock.onboardingGuidanceViewLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          contentId: 'content-1',
          version: 1,
          onboardingCaseId: 'case-1',
          stage: 'PRE_JOINING',
        }),
      })
    );
  });
});
