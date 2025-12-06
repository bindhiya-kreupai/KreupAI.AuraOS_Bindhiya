/**
 * @module HRMastersSeed
 * @description Seed data for HR Masters (Skills, Documents, Designations, Education, Relationships, Exit Reasons)
 * @project AURA HCM Platform
 */

export const skillsSeed = [
    { code: 'SK_REACT', name: 'React.js', category: 'Technical' },
    { code: 'SK_NODE', name: 'Node.js', category: 'Technical' },
    { code: 'SK_PYTHON', name: 'Python', category: 'Technical' },
    { code: 'SK_AWS', name: 'AWS Cloud', category: 'Technical' },
    { code: 'SK_PM', name: 'Project Management', category: 'Management' },
    { code: 'SK_SALES', name: 'Sales Strategy', category: 'Business' },
    { code: 'SK_COMM', name: 'Communication', category: 'Soft Skills' }
];

export const competenciesSeed = [
    { code: 'COMP_LEAD', name: 'Leadership', description: 'Ability to lead and inspire teams' },
    { code: 'COMP_PROB', name: 'Problem Solving', description: 'Analytical thinking and resolution' },
    { code: 'COMP_TEAM', name: 'Teamwork', description: 'Collaborative working style' },
    { code: 'COMP_INNO', name: 'Innovation', description: 'Creative thinking and improvement' }
];

export const documentTypesSeed = [
    { code: 'DOC_PP', name: 'Passport', isRequired: true },
    { code: 'DOC_VISA', name: 'Visa / Residency Permit', isRequired: true },
    { code: 'DOC_EID', name: 'Emirates ID (UAE)', isRequired: true },
    { code: 'DOC_AADHAAR', name: 'Aadhaar Card (India)', isRequired: true },
    { code: 'DOC_DL', name: 'Driving License', isRequired: false },
    { code: 'DOC_EDU', name: 'Degree Certificate', isRequired: true },
    { code: 'DOC_CONTRACT', name: 'Labor Contract', isRequired: true },
    { code: 'DOC_IQAMA', name: 'Iqama / National ID (Saudi Arabia)', isRequired: true },
    { code: 'DOC_QID', name: 'Qatar ID', isRequired: true },
    { code: 'DOC_CPR', name: 'CPR Card (Bahrain)', isRequired: true },
    { code: 'DOC_CIVIL_OM', name: 'Civil ID (Oman)', isRequired: true }
];

export const designationsSeed = [
    { code: 'DES_SWE_1', name: 'Software Engineer I', gradeCode: 'L2' },
    { code: 'DES_SWE_2', name: 'Software Engineer II', gradeCode: 'L3' },
    { code: 'DES_SSE', name: 'Senior Software Engineer', gradeCode: 'L4' },
    { code: 'DES_EM', name: 'Engineering Manager', gradeCode: 'L5' },
    { code: 'DES_PM', name: 'Product Manager', gradeCode: 'L4' },
    { code: 'DES_HRBP', name: 'HR Business Partner', gradeCode: 'L4' },
    { code: 'DES_SD', name: 'Sales Director', gradeCode: 'L6' },
    { code: 'DES_CEO', name: 'Chief Executive Officer', gradeCode: 'L10' }
];

export const educationLevelsSeed = [
    { name: 'High School Diploma', description: 'Secondary Education' },
    { name: 'Diploma / Associate Degree', description: '2-Year Technical Degree' },
    { name: 'Bachelor\'s Degree', description: 'Undergraduate Degree (3-4 Years)' },
    { name: 'Master\'s Degree', description: 'Postgraduate Degree' },
    { name: 'Doctorate / PhD', description: 'Highest Academic Degree' },
    { name: 'Professional Certification', description: 'Industry Specific Certification' }
];

export const relationshipsSeed = [
    { name: 'Spouse', type: 'Immediate' },
    { name: 'Child', type: 'Immediate' },
    { name: 'Father', type: 'Immediate' },
    { name: 'Mother', type: 'Immediate' },
    { name: 'Sibling', type: 'Extended' },
    { name: 'Other', type: 'Extended' }
];

export const exitReasonsSeed = [
    { reason: 'Better Opportunity', type: 'Voluntary' },
    { reason: 'Relocation', type: 'Voluntary' },
    { reason: 'Higher Studies', type: 'Voluntary' },
    { reason: 'Health Reasons', type: 'Voluntary' },
    { reason: 'Retirement', type: 'Voluntary' },
    { reason: 'Performance', type: 'Involuntary' },
    { reason: 'Disciplinary Action', type: 'Involuntary' },
    { reason: 'Layoff / Redundancy', type: 'Involuntary' }
];
