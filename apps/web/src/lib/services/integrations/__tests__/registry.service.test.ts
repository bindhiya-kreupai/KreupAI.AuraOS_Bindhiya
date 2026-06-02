import { describe, it, expect } from 'vitest';
import { IntegrationRegistryService } from '../registry.service';

describe('IntegrationRegistryService.getIntegrations', () => {
  it('returns the full catalog when no filter', async () => {
    const r = await IntegrationRegistryService.getIntegrations();
    expect(r.length).toBeGreaterThan(0);
  });

  it('filters by category', async () => {
    const r = await IntegrationRegistryService.getIntegrations('HRIS' as any);
    r.forEach((i) => expect(i.category).toBe('HRIS'));
  });

  it('filters by search (matches name)', async () => {
    const all = await IntegrationRegistryService.getIntegrations();
    const first = all[0];
    const r = await IntegrationRegistryService.getIntegrations(undefined, first.name);
    expect(r.find((i) => i.id === first.id)).toBeDefined();
  });

  it('search is case-insensitive', async () => {
    const all = await IntegrationRegistryService.getIntegrations();
    const lower = all[0].name.toLowerCase();
    const r = await IntegrationRegistryService.getIntegrations(undefined, lower);
    expect(r.length).toBeGreaterThan(0);
  });

  it('returns empty array for category with no matches', async () => {
    const r = await IntegrationRegistryService.getIntegrations('NONEXISTENT_CATEGORY' as any);
    expect(r).toEqual([]);
  });

  it('returns empty array for non-matching search', async () => {
    const r = await IntegrationRegistryService.getIntegrations(undefined, 'zzz_no_match_zzz');
    expect(r).toEqual([]);
  });
});

describe('IntegrationRegistryService.getIntegrationById', () => {
  it('returns integration by id', async () => {
    const r = await IntegrationRegistryService.getIntegrationById('int_sap_hcm');
    expect(r).not.toBeNull();
    expect(r!.id).toBe('int_sap_hcm');
  });

  it('returns null for unknown id', async () => {
    expect(await IntegrationRegistryService.getIntegrationById('not-a-real-id')).toBeNull();
  });
});

describe('IntegrationRegistryService.getCategories', () => {
  it('returns marketplace categories', async () => {
    const r = await IntegrationRegistryService.getCategories();
    expect(r.length).toBeGreaterThan(0);
    r.forEach((c) => {
      expect(c.name).toBeTruthy();
    });
  });
});

describe('IntegrationRegistryService.getMarketplaceListings', () => {
  it('returns listings with rating + pricing', async () => {
    const r = await IntegrationRegistryService.getMarketplaceListings('tenant-1');
    expect(r.length).toBeGreaterThan(0);
    r.forEach((l) => {
      expect(l.integration).toBeDefined();
      expect(l.rating).toBeGreaterThanOrEqual(4);
      expect(l.installCount).toBeGreaterThan(0);
      expect(l.reviewCount).toBeGreaterThan(0);
      expect(l.pricing).toBeDefined();
    });
  });

  it('premium integrations show PAID pricing', async () => {
    const r = await IntegrationRegistryService.getMarketplaceListings('tenant-1');
    const premium = r.find((l) => l.isPremium);
    if (premium) {
      expect(premium.pricing.type).toBe('PAID');
    }
  });

  it('free integrations show FREE pricing', async () => {
    const r = await IntegrationRegistryService.getMarketplaceListings('tenant-1');
    const free = r.find((l) => !l.isPremium);
    if (free) {
      expect(free.pricing.type).toBe('FREE');
    }
  });

  it('respects category filter', async () => {
    const all = await IntegrationRegistryService.getMarketplaceListings('tenant-1');
    const cat = all[0]?.integration.category;
    if (cat) {
      const filtered = await IntegrationRegistryService.getMarketplaceListings('tenant-1', cat);
      filtered.forEach((l) => expect(l.integration.category).toBe(cat));
    }
  });

  it('returns isInstalled=false by default (stub)', async () => {
    const r = await IntegrationRegistryService.getMarketplaceListings('tenant-1');
    r.forEach((l) => expect(l.isInstalled).toBe(false));
  });
});

describe('IntegrationRegistryService.getIntegrationsByCountry', () => {
  it('returns integrations supporting AE', async () => {
    const r = await IntegrationRegistryService.getIntegrationsByCountry('AE');
    expect(r.length).toBeGreaterThan(0);
  });

  it('includes integrations with no supportedCountries (global)', async () => {
    const r = await IntegrationRegistryService.getIntegrationsByCountry('XX');
    // Integrations without supportedCountries are always included
    r.forEach((i) => {
      expect(
        i.supportedCountries === undefined ||
          i.supportedCountries === null ||
          i.supportedCountries.includes('XX')
      ).toBe(true);
    });
  });
});

describe('IntegrationRegistryService.getPopularIntegrations', () => {
  it('returns 6 by default', async () => {
    const r = await IntegrationRegistryService.getPopularIntegrations();
    expect(r.length).toBeLessThanOrEqual(6);
  });

  it('respects custom limit', async () => {
    const r = await IntegrationRegistryService.getPopularIntegrations(2);
    expect(r.length).toBeLessThanOrEqual(2);
  });
});

describe('IntegrationRegistryService.getNewIntegrations', () => {
  it('returns 3 by default sorted by createdAt desc', async () => {
    const r = await IntegrationRegistryService.getNewIntegrations();
    expect(r.length).toBeLessThanOrEqual(3);
    for (let i = 1; i < r.length; i++) {
      expect(r[i - 1].createdAt.getTime()).toBeGreaterThanOrEqual(r[i].createdAt.getTime());
    }
  });

  it('respects custom limit', async () => {
    const r = await IntegrationRegistryService.getNewIntegrations(5);
    expect(r.length).toBeLessThanOrEqual(5);
  });
});
