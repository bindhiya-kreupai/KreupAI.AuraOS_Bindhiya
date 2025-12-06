/**
 * @module TaxRegimesSeed
 * @description Seed data for tax regimes (GCC VAT, India GST/Tax)
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */


// Assuming Type definition might differ slightly, using a loose shape based on previous context
// The interface in page.tsx was: { id, code, name, country, status }
// We conform to what likely matches the schema or at least the usage.

export const taxRegimesSeed = [
    {
        code: 'IN_NEW',
        name: 'India New Tax Regime',
        countryCode: 'IN', // Mapping by code for seeder logic
        description: 'New Personal Income Tax Regime u/s 115BAC',
        // fields for calculation logic could be added here if schema supports
        isActive: true,
    },
    {
        code: 'IN_OLD',
        name: 'India Old Tax Regime',
        countryCode: 'IN',
        description: 'Old Personal Income Tax Regime with exemptions',
        isActive: true,
    },
    {
        code: 'AE_CT',
        name: 'UAE Corporate Tax',
        countryCode: 'AE',
        description: '9% Corporate Tax for taxable income > 375,000 AED',
        isActive: true,
    },
    {
        code: 'SA_VAT',
        name: 'KSA VAT',
        countryCode: 'SA',
        description: 'Standard VAT rate of 15%',
        isActive: true,
    },
    {
        code: 'BH_VAT',
        name: 'Bahrain VAT',
        countryCode: 'BH',
        description: 'Standard VAT rate of 10%',
        isActive: true,
    },
    {
        code: 'OM_VAT',
        name: 'Oman VAT',
        countryCode: 'OM',
        description: 'Standard VAT rate of 5%',
        isActive: true,
    },
    {
        code: 'QA_TAX',
        name: 'Qatar Tax',
        countryCode: 'QA',
        description: 'Standard Tax Regime', // Qatar has no VAT yet generally, but keeping placeholder
        isActive: true,
    }
];
