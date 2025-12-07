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
    { code: 'JF_FIN', name: 'Finance', functionCode: 'FIN' },
];

export const jobProfilesSeed = [
    { code: 'JP_FE_DEV', title: 'Frontend Developer', familyCode: 'JF_ENG_SW', description: 'React/Next.js Specialist', gradeCode: 'L3', status: 'Active' },
    { code: 'JP_BE_DEV', title: 'Backend Developer', familyCode: 'JF_ENG_SW', description: 'Node.js/Prisma Specialist', gradeCode: 'L3', status: 'Active' },
    { code: 'JP_QA_AUTO', title: 'QA Automation Engineer', familyCode: 'JF_ENG_QA', description: 'End-to-End Testing', gradeCode: 'L2', status: 'Active' },
    { code: 'JP_PROD_OWNER', title: 'Product Owner', familyCode: 'JF_PROD_MGMT', description: 'Agile Product Owner', gradeCode: 'L4', status: 'Active' },
    { code: 'JP_SALES_EXEC', title: 'Sales Executive', familyCode: 'JF_SALES_B2B', description: 'Regional Sales', gradeCode: 'L3', status: 'Active' },
    { code: 'JP_HR_GEN', title: 'HR Generalist', familyCode: 'JF_HR_OPS', description: 'Employee Relations & Ops', gradeCode: 'L2', status: 'Active' },
    { code: 'JP_SR_SWE', title: 'Senior Software Engineer', familyCode: 'JF_ENG_SW', description: 'Tech Lead', gradeCode: 'L5', status: 'Active' },
    { code: 'JP_FIN_ANALYST', title: 'Financial Analyst', familyCode: 'JF_FIN', description: 'Financial Modeling', gradeCode: 'L3', status: 'Draft' }, // Note: JF_FIN needs to exist or be handled
];
