/**
 * @module OrgStructureSeed
 * @description Seed data for Companies, Business Units, Cost Centers, Departments, Locations
 * @project AURA HCM Platform
 */

export const companiesSeed = [
    { code: 'KREUP_GLOBAL', name: 'KreupAI Technologies Global', taxId: 'TRN-100200300' },
    { code: 'KREUP_INDIA', name: 'KreupAI Technologies India Pvt Ltd', taxId: 'GSTIN-29AAACK' },
];

export const businessUnitsSeed = [
    { code: 'BU_ENT', name: 'Enterprise Solutions', head: 'John Doe' },
    { code: 'BU_SAAS', name: 'SaaS Products', head: 'Jane Smith' },
    { code: 'BU_CONS', name: 'Consulting Services', head: 'Sarah Connor' },
];

export const costCentersSeed = [
    { code: 'CC_ENG', name: 'Engineering & R&D' },
    { code: 'CC_SALES_MEA', name: 'Sales & Marketing (MEA)' },
    { code: 'CC_OPS_IND', name: 'Operations (India)' },
    { code: 'CC_CORP', name: 'Corporate Shared Services' },
];

// Department structure is hierarchical but likely seeded flat or with parent refs in main script logic
export const departmentsSeed = [
    { code: 'DEPT_ENG', name: 'Engineering', costCenter: 'CC_ENG', businessUnit: 'BU_SAAS' },
    { code: 'DEPT_PROD', name: 'Product Management', costCenter: 'CC_ENG', businessUnit: 'BU_SAAS' },
    { code: 'DEPT_SALES', name: 'Sales', costCenter: 'CC_SALES_MEA', businessUnit: 'BU_ENT' },
    { code: 'DEPT_MKT', name: 'Marketing', costCenter: 'CC_SALES_MEA', businessUnit: 'BU_ENT' },
    { code: 'DEPT_HR', name: 'Human Resources', costCenter: 'CC_CORP', businessUnit: 'BU_SAAS' },
    { code: 'DEPT_FIN', name: 'Finance', costCenter: 'CC_CORP', businessUnit: 'BU_SAAS' },
    { code: 'DEPT_IT', name: 'IT Infrastructure', costCenter: 'CC_OPS_IND', businessUnit: 'BU_CONS' },
];

// Locations need mapping to Addresses (City/Country) which is complex in seed.
// We will define logic in main seed to attach these to specific addresses or create them.
export const locationsSeed = [
    {
        code: 'LOC_DXB_HQ',
        name: 'Dubai HQ',
        type: 'HEADQUARTERS',
        companyCode: 'KREUP_GLOBAL',
        address: { line1: 'Level 24, One Central', line2: 'Trade Centre', city: 'Dubai', countryCode: 'AE', postalCode: '00000' }
    },
    {
        code: 'LOC_RUH_BR',
        name: 'Riyadh Branch',
        type: 'BRANCH',
        companyCode: 'KREUP_GLOBAL',
        address: { line1: 'Olaya Towers', line2: 'King Fahad Road', city: 'Riyadh', countryCode: 'SA', postalCode: '12213' }
    },
    {
        code: 'LOC_BLR_ODC',
        name: 'Bangalore ODC',
        type: 'REMOTE_HUB',
        companyCode: 'KREUP_INDIA',
        address: { line1: 'Prestige Tech Park', line2: 'Marathahalli', city: 'Bangalore', countryCode: 'IN', postalCode: '560103' }
    },
    {
        code: 'LOC_DOHA_BR',
        name: 'Doha Branch',
        type: 'BRANCH',
        companyCode: 'KREUP_GLOBAL',
        address: { line1: 'West Bay', line2: 'Doha Corniche', city: 'Doha', countryCode: 'QA', postalCode: '00000' }
    },
    {
        code: 'LOC_MANAMA_BR',
        name: 'Manama Branch',
        type: 'BRANCH',
        companyCode: 'KREUP_GLOBAL',
        address: { line1: 'Bahrain Financial Harbour', line2: 'King Faisal Hwy', city: 'Manama', countryCode: 'BH', postalCode: '00000' }
    },
    {
        code: 'LOC_MUSCAT_BR',
        name: 'Muscat Branch',
        type: 'BRANCH',
        companyCode: 'KREUP_GLOBAL',
        address: { line1: 'Ruwi High Street', line2: 'CBD Area', city: 'Muscat', countryCode: 'OM', postalCode: '112' }
    },
];
