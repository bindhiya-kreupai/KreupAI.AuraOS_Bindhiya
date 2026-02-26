/**
 * @module SkillsTaxonomySeed
 * @description Hierarchical skills catalog with 8 categories and 40+ skills.
 *   Each skill maps to the Skill model (code, name, category, description).
 *   Proficiency levels are stored as SystemSetting JSON.
 * @project AuraOS Enterprise HCM — Phase 2 GAP Closure
 * @section Task Group A — Seed 2
 */

import { PrismaClient } from '@prisma/client';

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

export interface ProficiencyLevelDef {
  level: 1 | 2 | 3 | 4 | 5;
  name: string;
  description: string;
  indicators: string[];
}

export interface SkillEntry {
  code: string;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  proficiencyLevels: ProficiencyLevelDef[];
}

// ---------------------------------------------------------------------------
// Proficiency level factory — generates standard 5-level descriptions
// ---------------------------------------------------------------------------

function makeProficiencyLevels(skillName: string): ProficiencyLevelDef[] {
  return [
    {
      level: 1,
      name: 'Awareness',
      description: `Basic awareness of ${skillName}; limited practical exposure`,
      indicators: [
        'Can describe the concept at a high level',
        'Has read about or studied the topic',
        'Requires close supervision when applying',
      ],
    },
    {
      level: 2,
      name: 'Developing',
      description: `Working knowledge of ${skillName}; can apply with guidance`,
      indicators: [
        'Can perform routine tasks with some support',
        'Understands core principles and common patterns',
        'Seeks help for non-standard situations',
      ],
    },
    {
      level: 3,
      name: 'Proficient',
      description: `Solid proficiency in ${skillName}; works independently`,
      indicators: [
        'Handles complex scenarios without assistance',
        'Mentors junior team members on fundamentals',
        'Troubleshoots and resolves issues autonomously',
      ],
    },
    {
      level: 4,
      name: 'Advanced',
      description: `Deep expertise in ${skillName}; a recognised go-to person`,
      indicators: [
        'Leads projects and technical decisions in this area',
        'Designs solutions and sets standards for others',
        'Contributes to internal knowledge base and best practices',
      ],
    },
    {
      level: 5,
      name: 'Expert',
      description: `Industry-level mastery of ${skillName}; shapes best practices`,
      indicators: [
        'Recognised externally (publications, talks, open source)',
        'Defines organisational strategy in this domain',
        'Mentors and coaches advanced practitioners',
      ],
    },
  ];
}

// ---------------------------------------------------------------------------
// Category 1: Technical Skills
// ---------------------------------------------------------------------------

const technicalSkills: SkillEntry[] = [
  {
    code: 'SKL_TECH_JS',
    name: 'JavaScript',
    category: 'Technical',
    subcategory: 'Programming Languages',
    description: 'ES6+, async/await, closures, module systems, event loop',
    proficiencyLevels: makeProficiencyLevels('JavaScript'),
  },
  {
    code: 'SKL_TECH_TS',
    name: 'TypeScript',
    category: 'Technical',
    subcategory: 'Programming Languages',
    description: 'Static typing, generics, decorators, advanced type manipulation',
    proficiencyLevels: makeProficiencyLevels('TypeScript'),
  },
  {
    code: 'SKL_TECH_PY',
    name: 'Python',
    category: 'Technical',
    subcategory: 'Programming Languages',
    description: 'Data structures, OOP, decorators, generators, async programming',
    proficiencyLevels: makeProficiencyLevels('Python'),
  },
  {
    code: 'SKL_TECH_REACT',
    name: 'React',
    category: 'Technical',
    subcategory: 'Frameworks',
    description: 'Hooks, context, state management, component patterns, performance optimisation',
    proficiencyLevels: makeProficiencyLevels('React'),
  },
  {
    code: 'SKL_TECH_NEXTJS',
    name: 'Next.js',
    category: 'Technical',
    subcategory: 'Frameworks',
    description: 'SSR, SSG, ISR, API routes, middleware, app router, edge functions',
    proficiencyLevels: makeProficiencyLevels('Next.js'),
  },
  {
    code: 'SKL_TECH_POSTGRES',
    name: 'PostgreSQL',
    category: 'Technical',
    subcategory: 'Databases',
    description: 'Advanced queries, indexing, partitioning, extensions, query optimisation',
    proficiencyLevels: makeProficiencyLevels('PostgreSQL'),
  },
  {
    code: 'SKL_TECH_AWS',
    name: 'AWS',
    category: 'Technical',
    subcategory: 'Cloud',
    description: 'EC2, S3, Lambda, RDS, ECS, CloudFormation, IAM, VPC',
    proficiencyLevels: makeProficiencyLevels('AWS'),
  },
  {
    code: 'SKL_TECH_DOCKER',
    name: 'Docker & Containers',
    category: 'Technical',
    subcategory: 'DevOps',
    description: 'Containerisation, Dockerfile, compose, networking, volumes, registries',
    proficiencyLevels: makeProficiencyLevels('Docker & Containers'),
  },
];

// ---------------------------------------------------------------------------
// Category 2: Leadership Skills
// ---------------------------------------------------------------------------

const leadershipSkills: SkillEntry[] = [
  {
    code: 'SKL_LEAD_VISION',
    name: 'Strategic Visioning',
    category: 'Leadership',
    subcategory: 'Strategy',
    description: 'Setting long-term direction, aligning teams to organisational goals, roadmap creation',
    proficiencyLevels: makeProficiencyLevels('Strategic Visioning'),
  },
  {
    code: 'SKL_LEAD_PEOPLE',
    name: 'People Management',
    category: 'Leadership',
    subcategory: 'Team Leadership',
    description: 'Hiring, onboarding, developing, motivating, and retaining high-performing teams',
    proficiencyLevels: makeProficiencyLevels('People Management'),
  },
  {
    code: 'SKL_LEAD_CHANGE',
    name: 'Change Management',
    category: 'Leadership',
    subcategory: 'Transformation',
    description: 'Transformation planning, stakeholder buy-in, change communication, resistance management',
    proficiencyLevels: makeProficiencyLevels('Change Management'),
  },
  {
    code: 'SKL_LEAD_DECISION',
    name: 'Decision Making',
    category: 'Leadership',
    subcategory: 'Strategy',
    description: 'Data-driven decisions, risk-benefit analysis, trade-off evaluation, executive presence',
    proficiencyLevels: makeProficiencyLevels('Decision Making'),
  },
  {
    code: 'SKL_LEAD_INFLUENCE',
    name: 'Influence & Persuasion',
    category: 'Leadership',
    subcategory: 'Stakeholder Management',
    description: 'Building coalitions, executive communication, narrative crafting, stakeholder alignment',
    proficiencyLevels: makeProficiencyLevels('Influence & Persuasion'),
  },
  {
    code: 'SKL_LEAD_COACHING',
    name: 'Coaching & Mentoring',
    category: 'Leadership',
    subcategory: 'Team Leadership',
    description: 'Developing others through structured coaching conversations, career planning, feedback delivery',
    proficiencyLevels: makeProficiencyLevels('Coaching & Mentoring'),
  },
];

// ---------------------------------------------------------------------------
// Category 3: Communication Skills
// ---------------------------------------------------------------------------

const communicationSkills: SkillEntry[] = [
  {
    code: 'SKL_COMM_VERBAL',
    name: 'Verbal Communication',
    category: 'Communication',
    subcategory: 'Oral',
    description: 'Clear articulation of ideas, active listening, adapting message to audience',
    proficiencyLevels: makeProficiencyLevels('Verbal Communication'),
  },
  {
    code: 'SKL_COMM_WRITTEN',
    name: 'Written Communication',
    category: 'Communication',
    subcategory: 'Written',
    description: 'Professional emails, reports, proposals, technical documentation, executive briefs',
    proficiencyLevels: makeProficiencyLevels('Written Communication'),
  },
  {
    code: 'SKL_COMM_PRESENT',
    name: 'Presentation Skills',
    category: 'Communication',
    subcategory: 'Public Speaking',
    description: 'Slide design, storytelling, audience engagement, handling Q&A, virtual presentations',
    proficiencyLevels: makeProficiencyLevels('Presentation Skills'),
  },
  {
    code: 'SKL_COMM_NEGOTIATE',
    name: 'Negotiation',
    category: 'Communication',
    subcategory: 'Interpersonal',
    description: 'Win-win strategies, BATNA, persuasion techniques, closing deals, conflict de-escalation',
    proficiencyLevels: makeProficiencyLevels('Negotiation'),
  },
  {
    code: 'SKL_COMM_CROSSCULT',
    name: 'Cross-Cultural Communication',
    category: 'Communication',
    subcategory: 'Global',
    description: 'Navigating cultural nuances in GCC, South Asia, and Western markets; inclusive communication',
    proficiencyLevels: makeProficiencyLevels('Cross-Cultural Communication'),
  },
];

// ---------------------------------------------------------------------------
// Category 4: Analytical Skills
// ---------------------------------------------------------------------------

const analyticalSkills: SkillEntry[] = [
  {
    code: 'SKL_ANLY_DATA',
    name: 'Data Analysis',
    category: 'Analytical',
    subcategory: 'Data',
    description: 'Statistical analysis, data interpretation, Excel/BI tools, insight generation',
    proficiencyLevels: makeProficiencyLevels('Data Analysis'),
  },
  {
    code: 'SKL_ANLY_CRITICAL',
    name: 'Critical Thinking',
    category: 'Analytical',
    subcategory: 'Problem Solving',
    description: 'Logical reasoning, evidence evaluation, bias identification, structured arguments',
    proficiencyLevels: makeProficiencyLevels('Critical Thinking'),
  },
  {
    code: 'SKL_ANLY_PROBLEM',
    name: 'Problem Solving',
    category: 'Analytical',
    subcategory: 'Problem Solving',
    description: 'Root cause analysis, structured frameworks (5-Why, Fishbone), creative solutions',
    proficiencyLevels: makeProficiencyLevels('Problem Solving'),
  },
  {
    code: 'SKL_ANLY_FIN',
    name: 'Financial Analysis',
    category: 'Analytical',
    subcategory: 'Finance',
    description: 'P&L reading, budget analysis, ROI calculations, variance analysis, forecasting',
    proficiencyLevels: makeProficiencyLevels('Financial Analysis'),
  },
  {
    code: 'SKL_ANLY_PROCESS',
    name: 'Process Improvement',
    category: 'Analytical',
    subcategory: 'Operations',
    description: 'Lean, Six Sigma, value stream mapping, process documentation, KPI design',
    proficiencyLevels: makeProficiencyLevels('Process Improvement'),
  },
];

// ---------------------------------------------------------------------------
// Category 5: Domain / Functional Skills
// ---------------------------------------------------------------------------

const domainSkills: SkillEntry[] = [
  {
    code: 'SKL_DOM_HROPS',
    name: 'HR Operations',
    category: 'Domain',
    subcategory: 'Human Resources',
    description: 'Employee lifecycle management, HRIS, compliance, payroll coordination, HR analytics',
    proficiencyLevels: makeProficiencyLevels('HR Operations'),
  },
  {
    code: 'SKL_DOM_RECRUIT',
    name: 'Talent Acquisition',
    category: 'Domain',
    subcategory: 'Human Resources',
    description: 'Sourcing strategies, structured interviews, offer negotiation, ATS usage, employer branding',
    proficiencyLevels: makeProficiencyLevels('Talent Acquisition'),
  },
  {
    code: 'SKL_DOM_PAYROLL',
    name: 'Payroll Management',
    category: 'Domain',
    subcategory: 'Finance',
    description: 'Payroll processing, statutory deductions, WPS, GOSI, PASI, gratuity calculations',
    proficiencyLevels: makeProficiencyLevels('Payroll Management'),
  },
  {
    code: 'SKL_DOM_SALES',
    name: 'B2B Sales',
    category: 'Domain',
    subcategory: 'Sales',
    description: 'Enterprise sales cycles, pipeline management, CRM usage, proposal writing, deal closing',
    proficiencyLevels: makeProficiencyLevels('B2B Sales'),
  },
  {
    code: 'SKL_DOM_COMPLIANCE',
    name: 'Regulatory Compliance',
    category: 'Domain',
    subcategory: 'Legal',
    description: 'GCC labour law, GDPR, SOX, data localisation, audit readiness, policy governance',
    proficiencyLevels: makeProficiencyLevels('Regulatory Compliance'),
  },
  {
    code: 'SKL_DOM_PROCUREMENT',
    name: 'Procurement & Sourcing',
    category: 'Domain',
    subcategory: 'Operations',
    description: 'Vendor evaluation, RFP management, contract negotiation, supplier relationship management',
    proficiencyLevels: makeProficiencyLevels('Procurement & Sourcing'),
  },
];

// ---------------------------------------------------------------------------
// Category 6: Creative Skills
// ---------------------------------------------------------------------------

const creativeSkills: SkillEntry[] = [
  {
    code: 'SKL_CREAT_DESIGN',
    name: 'UI/UX Design',
    category: 'Creative',
    subcategory: 'Design',
    description: 'User research, wireframing, prototyping, design systems, accessibility, Figma/Sketch',
    proficiencyLevels: makeProficiencyLevels('UI/UX Design'),
  },
  {
    code: 'SKL_CREAT_CONTENT',
    name: 'Content Creation',
    category: 'Creative',
    subcategory: 'Marketing',
    description: 'Copywriting, storytelling, SEO content, social media, video scripting, campaign assets',
    proficiencyLevels: makeProficiencyLevels('Content Creation'),
  },
  {
    code: 'SKL_CREAT_BRAND',
    name: 'Brand Management',
    category: 'Creative',
    subcategory: 'Marketing',
    description: 'Brand identity, visual consistency, brand guidelines, positioning, messaging framework',
    proficiencyLevels: makeProficiencyLevels('Brand Management'),
  },
  {
    code: 'SKL_CREAT_INNOV',
    name: 'Innovation & Design Thinking',
    category: 'Creative',
    subcategory: 'Innovation',
    description: 'Human-centred design, ideation workshops, prototyping, test-and-learn cycles',
    proficiencyLevels: makeProficiencyLevels('Innovation & Design Thinking'),
  },
  {
    code: 'SKL_CREAT_VISUAL',
    name: 'Data Visualisation',
    category: 'Creative',
    subcategory: 'Analytics',
    description: 'Dashboard design, chart selection, Power BI, Tableau, storytelling with data',
    proficiencyLevels: makeProficiencyLevels('Data Visualisation'),
  },
];

// ---------------------------------------------------------------------------
// Category 7: Interpersonal Skills
// ---------------------------------------------------------------------------

const interpersonalSkills: SkillEntry[] = [
  {
    code: 'SKL_INTER_EI',
    name: 'Emotional Intelligence',
    category: 'Interpersonal',
    subcategory: 'Self-Awareness',
    description: 'Self-awareness, empathy, social skills, self-regulation, relationship management',
    proficiencyLevels: makeProficiencyLevels('Emotional Intelligence'),
  },
  {
    code: 'SKL_INTER_COLLAB',
    name: 'Team Collaboration',
    category: 'Interpersonal',
    subcategory: 'Teamwork',
    description: 'Cross-functional collaboration, shared goal alignment, trust building, virtual teamwork',
    proficiencyLevels: makeProficiencyLevels('Team Collaboration'),
  },
  {
    code: 'SKL_INTER_CONFLICT',
    name: 'Conflict Resolution',
    category: 'Interpersonal',
    subcategory: 'Mediation',
    description: 'Mediation, de-escalation, neutral facilitation, finding common ground, formal resolution',
    proficiencyLevels: makeProficiencyLevels('Conflict Resolution'),
  },
  {
    code: 'SKL_INTER_CUSTFOC',
    name: 'Customer Focus',
    category: 'Interpersonal',
    subcategory: 'Service',
    description: 'Understanding customer needs, service orientation, stakeholder management, complaint handling',
    proficiencyLevels: makeProficiencyLevels('Customer Focus'),
  },
  {
    code: 'SKL_INTER_NETWORK',
    name: 'Professional Networking',
    category: 'Interpersonal',
    subcategory: 'Relationship Building',
    description: 'Building professional relationships, industry engagement, conference participation, alumni networks',
    proficiencyLevels: makeProficiencyLevels('Professional Networking'),
  },
];

// ---------------------------------------------------------------------------
// Category 8: Compliance & Risk Skills
// ---------------------------------------------------------------------------

const complianceSkills: SkillEntry[] = [
  {
    code: 'SKL_COMP_RISK',
    name: 'Risk Management',
    category: 'Compliance',
    subcategory: 'Risk',
    description: 'Risk identification, assessment, mitigation planning, risk registers, contingency strategies',
    proficiencyLevels: makeProficiencyLevels('Risk Management'),
  },
  {
    code: 'SKL_COMP_AUDIT',
    name: 'Internal Audit',
    category: 'Compliance',
    subcategory: 'Audit',
    description: 'Audit planning, control testing, finding documentation, corrective action tracking',
    proficiencyLevels: makeProficiencyLevels('Internal Audit'),
  },
  {
    code: 'SKL_COMP_GDPR',
    name: 'Data Privacy & GDPR',
    category: 'Compliance',
    subcategory: 'Data Protection',
    description: 'GDPR, PDPA, DIFC DP Law, data mapping, DPIAs, breach response, consent management',
    proficiencyLevels: makeProficiencyLevels('Data Privacy & GDPR'),
  },
  {
    code: 'SKL_COMP_LABOUR',
    name: 'Labour Law',
    category: 'Compliance',
    subcategory: 'Employment Law',
    description: 'UAE Labour Law, KSA Labour Law, India Shops & Establishment Acts, dispute resolution',
    proficiencyLevels: makeProficiencyLevels('Labour Law'),
  },
  {
    code: 'SKL_COMP_INFOSEC',
    name: 'Information Security',
    category: 'Compliance',
    subcategory: 'Security',
    description: 'ISO 27001, OWASP, security policies, access control, incident response, security training',
    proficiencyLevels: makeProficiencyLevels('Information Security'),
  },
  {
    code: 'SKL_COMP_AML',
    name: 'Anti-Money Laundering',
    category: 'Compliance',
    subcategory: 'Financial Compliance',
    description: 'AML/CFT controls, KYC procedures, transaction monitoring, FATF compliance, SAR filing',
    proficiencyLevels: makeProficiencyLevels('Anti-Money Laundering'),
  },
];

// ---------------------------------------------------------------------------
// Aggregated taxonomy
// ---------------------------------------------------------------------------

export const skillsTaxonomy: SkillEntry[] = [
  ...technicalSkills,
  ...leadershipSkills,
  ...communicationSkills,
  ...analyticalSkills,
  ...domainSkills,
  ...creativeSkills,
  ...interpersonalSkills,
  ...complianceSkills,
];

export const skillCategories = [
  { code: 'Technical', name: 'Technical Skills', description: 'Software, infrastructure, and technology expertise' },
  { code: 'Leadership', name: 'Leadership Skills', description: 'Strategic thinking, people development, and executive presence' },
  { code: 'Communication', name: 'Communication Skills', description: 'Verbal, written, and cross-cultural communication' },
  { code: 'Analytical', name: 'Analytical Skills', description: 'Data analysis, critical thinking, and problem solving' },
  { code: 'Domain', name: 'Domain / Functional Skills', description: 'Industry and function-specific expertise' },
  { code: 'Creative', name: 'Creative Skills', description: 'Design, content creation, and innovation' },
  { code: 'Interpersonal', name: 'Interpersonal Skills', description: 'Emotional intelligence, collaboration, and stakeholder management' },
  { code: 'Compliance', name: 'Compliance & Risk Skills', description: 'Risk management, audit, and regulatory compliance' },
];

/**
 * Seed the skills taxonomy.
 * - Skills with proficiency levels are stored in the Skill model (code, name, category, description).
 * - Full proficiency descriptors are stored as SystemSetting JSON payloads.
 * Idempotent — safe to run multiple times.
 */
export async function seedSkillsTaxonomy(prisma: PrismaClient): Promise<void> {
  console.log('  Seeding skills taxonomy...');
  let skillCount = 0;
  let proficiencyCount = 0;

  // Store category metadata as system settings
  for (const category of skillCategories) {
    const key = `skills_taxonomy.category.${category.code.toLowerCase()}`;
    await prisma.systemSetting.upsert({
      where: { key },
      update: { value: JSON.stringify(category), description: category.description },
      create: {
        key,
        value: JSON.stringify(category),
        group: 'skills_taxonomy',
        description: category.description,
      },
    });
  }

  // Seed individual skills into the Skill model
  for (const skill of skillsTaxonomy) {
    await prisma.skill.upsert({
      where: { code: skill.code },
      update: {
        name: skill.name,
        category: skill.category,
        description: skill.description,
        status: 'Active',
      },
      create: {
        code: skill.code,
        name: skill.name,
        category: skill.category,
        description: skill.description,
        status: 'Active',
      },
    });
    skillCount++;

    // Store proficiency level descriptors as system settings
    const profKey = `skills_taxonomy.proficiency.${skill.code.toLowerCase()}`;
    await prisma.systemSetting.upsert({
      where: { key: profKey },
      update: {
        value: JSON.stringify({
          skillCode: skill.code,
          skillName: skill.name,
          category: skill.category,
          subcategory: skill.subcategory,
          proficiencyLevels: skill.proficiencyLevels,
        }),
      },
      create: {
        key: profKey,
        value: JSON.stringify({
          skillCode: skill.code,
          skillName: skill.name,
          category: skill.category,
          subcategory: skill.subcategory,
          proficiencyLevels: skill.proficiencyLevels,
        }),
        group: 'skills_proficiency',
        description: `Proficiency level descriptors for: ${skill.name} (${skill.category})`,
      },
    });
    proficiencyCount++;
  }

  const categoryNames = [...new Set(skillsTaxonomy.map(s => s.category))];
  console.log(`  ✓ Skills taxonomy: ${skillCount} skills across ${categoryNames.length} categories seeded`);
  console.log(`  ✓ Proficiency descriptors: ${proficiencyCount} skill proficiency definitions stored`);
}

// Legacy named export for backward compatibility
export { seedSkillsTaxonomy as seed };
