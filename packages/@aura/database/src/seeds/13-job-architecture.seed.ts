/**
 * @module JobArchitectureSeed
 * @description Seed data for Job Families and Job Profiles
 * @project AURA HCM Platform
 */

export const jobFamiliesSeed = [
    { code: 'JF_ENG_SW', name: 'Software Engineering', functionCode: 'ENG' },
    { code: 'JF_ENG_QA', name: 'Quality Assurance', functionCode: 'ENG' },
    { code: 'JF_PROD_MGMT', name: 'Product Management', functionCode: 'PROD' },
    { code: 'JF_SALES_B2B', name: 'B2B Sales', functionCode: 'SALES' },
    { code: 'JF_HR_OPS', name: 'HR Operations', functionCode: 'HR' },
];

export const jobProfilesSeed = [
    { code: 'JP_FE_DEV', title: 'Frontend Developer', familyCode: 'JF_ENG_SW', description: 'React/Next.js Specialist' },
    { code: 'JP_BE_DEV', title: 'Backend Developer', familyCode: 'JF_ENG_SW', description: 'Node.js/Prisma Specialist' },
    { code: 'JP_QA_AUTO', title: 'QA Automation Engineer', familyCode: 'JF_ENG_QA', description: 'End-to-End Testing' },
    { code: 'JP_PROD_OWNER', title: 'Product Owner', familyCode: 'JF_PROD_MGMT', description: 'Agile Product Owner' },
    { code: 'JP_SALES_EXEC', title: 'Sales Executive', familyCode: 'JF_SALES_B2B', description: 'Regional Sales' },
    { code: 'JP_HR_GEN', title: 'HR Generalist', familyCode: 'JF_HR_OPS', description: 'Employee Relations & Ops' },
];
