/**
 * @module CompetencyLibrarySeed
 * @description Seed data for Competency Library Module
 * @project AURA HCM Platform
 */

// ============================================================================
// 1. COMPETENCY CATEGORIES
// ============================================================================

export const competencyCategoriesSeed = [
    {
        code: 'TECHNICAL',
        name: 'Technical',
        description: 'Technical skills and expertise related to specific technologies, tools, and methodologies',
        icon: 'Code',
        color: '#3B82F6',
        sortOrder: 1
    },
    {
        code: 'LEADERSHIP',
        name: 'Leadership',
        description: 'Competencies related to leading teams, strategic thinking, and organizational influence',
        icon: 'Users',
        color: '#F59E0B',
        sortOrder: 2
    },
    {
        code: 'BEHAVIORAL',
        name: 'Behavioral',
        description: 'Interpersonal and behavioral competencies for effective workplace interactions',
        icon: 'Heart',
        color: '#F43F5E',
        sortOrder: 3
    },
    {
        code: 'FUNCTIONAL',
        name: 'Functional',
        description: 'Business function-specific competencies for various departments',
        icon: 'Briefcase',
        color: '#8B5CF6',
        sortOrder: 4
    },
    {
        code: 'CORE',
        name: 'Core',
        description: 'Foundational competencies expected across all roles in the organization',
        icon: 'Star',
        color: '#10B981',
        sortOrder: 5
    }
];

// ============================================================================
// 2. COMPETENCY SUBCATEGORIES
// ============================================================================

export const competencySubcategoriesSeed = [
    // Technical subcategories
    { categoryCode: 'TECHNICAL', code: 'ENGINEERING', name: 'Engineering' },
    { categoryCode: 'TECHNICAL', code: 'DATA_ANALYTICS', name: 'Data & Analytics' },
    { categoryCode: 'TECHNICAL', code: 'CLOUD_INFRASTRUCTURE', name: 'Cloud & Infrastructure' },
    { categoryCode: 'TECHNICAL', code: 'SECURITY', name: 'Security' },
    { categoryCode: 'TECHNICAL', code: 'DESIGN', name: 'Design' },
    
    // Leadership subcategories
    { categoryCode: 'LEADERSHIP', code: 'PEOPLE_MANAGEMENT', name: 'People Management' },
    { categoryCode: 'LEADERSHIP', code: 'STRATEGIC', name: 'Strategic Leadership' },
    { categoryCode: 'LEADERSHIP', code: 'CHANGE_MGMT', name: 'Change Management' },
    
    // Behavioral subcategories
    { categoryCode: 'BEHAVIORAL', code: 'COMMUNICATION', name: 'Communication' },
    { categoryCode: 'BEHAVIORAL', code: 'COLLABORATION', name: 'Collaboration' },
    { categoryCode: 'BEHAVIORAL', code: 'EMOTIONAL_INT', name: 'Emotional Intelligence' },
    
    // Functional subcategories
    { categoryCode: 'FUNCTIONAL', code: 'SALES', name: 'Sales' },
    { categoryCode: 'FUNCTIONAL', code: 'MARKETING', name: 'Marketing' },
    { categoryCode: 'FUNCTIONAL', code: 'FINANCE', name: 'Finance' },
    { categoryCode: 'FUNCTIONAL', code: 'HR', name: 'Human Resources' },
    { categoryCode: 'FUNCTIONAL', code: 'OPERATIONS', name: 'Operations' },
    
    // Core subcategories
    { categoryCode: 'CORE', code: 'PROBLEM_SOLVING', name: 'Problem Solving' },
    { categoryCode: 'CORE', code: 'INNOVATION', name: 'Innovation' },
    { categoryCode: 'CORE', code: 'ETHICS', name: 'Ethics & Integrity' }
];

// ============================================================================
// 3. PROFICIENCY FRAMEWORKS
// ============================================================================

export const proficiencyFrameworksSeed = [
    {
        code: 'STANDARD_5',
        name: 'Standard 5-Level Framework',
        description: 'The default organizational proficiency framework with 5 levels from Foundational to Expert',
        type: 'Standard',
        isDefault: true
    },
    {
        code: 'TECHNICAL_6',
        name: 'Technical Proficiency Scale',
        description: 'Enhanced 6-level scale for technical competencies with Novice through Master levels',
        type: 'Custom',
        isDefault: false
    },
    {
        code: 'LEADERSHIP_4',
        name: 'Leadership Proficiency Model',
        description: 'Specialized 4-level framework for leadership competencies',
        type: 'Custom',
        isDefault: false
    },
    {
        code: 'DREYFUS',
        name: 'Dreyfus Model of Skill Acquisition',
        description: 'Industry-standard model based on Dreyfus brothers research on skill acquisition',
        type: 'Industry',
        isDefault: false
    }
];

// ============================================================================
// 4. PROFICIENCY LEVELS
// ============================================================================

export const proficiencyLevelsSeed = [
    // Standard 5-Level Framework
    { frameworkCode: 'STANDARD_5', code: 'L1', name: 'Foundational', levelNumber: 1, description: 'Basic understanding and awareness. Requires guidance and supervision.', color: '#EF4444' },
    { frameworkCode: 'STANDARD_5', code: 'L2', name: 'Developing', levelNumber: 2, description: 'Growing capability with moderate supervision. Can handle routine tasks independently.', color: '#F59E0B' },
    { frameworkCode: 'STANDARD_5', code: 'L3', name: 'Proficient', levelNumber: 3, description: 'Solid working knowledge. Independently performs most tasks and guides others.', color: '#10B981' },
    { frameworkCode: 'STANDARD_5', code: 'L4', name: 'Advanced', levelNumber: 4, description: 'Deep expertise. Handles complex situations, mentors others, and drives improvements.', color: '#3B82F6' },
    { frameworkCode: 'STANDARD_5', code: 'L5', name: 'Expert', levelNumber: 5, description: 'Recognized authority. Strategic influence, shapes practices, and leads innovation.', color: '#8B5CF6' },
    
    // Technical 6-Level Framework
    { frameworkCode: 'TECHNICAL_6', code: 'T1', name: 'Novice', levelNumber: 1, description: 'New to the technology. Follows instructions and documentation.', color: '#EF4444' },
    { frameworkCode: 'TECHNICAL_6', code: 'T2', name: 'Beginner', levelNumber: 2, description: 'Can complete simple tasks with reference materials.', color: '#F97316' },
    { frameworkCode: 'TECHNICAL_6', code: 'T3', name: 'Competent', levelNumber: 3, description: 'Handles typical scenarios independently.', color: '#EAB308' },
    { frameworkCode: 'TECHNICAL_6', code: 'T4', name: 'Proficient', levelNumber: 4, description: 'Deep understanding, optimizes solutions, mentors others.', color: '#10B981' },
    { frameworkCode: 'TECHNICAL_6', code: 'T5', name: 'Expert', levelNumber: 5, description: 'Comprehensive expertise, solves novel problems.', color: '#3B82F6' },
    { frameworkCode: 'TECHNICAL_6', code: 'T6', name: 'Master', levelNumber: 6, description: 'Industry-recognized authority, shapes the field.', color: '#8B5CF6' },
    
    // Leadership 4-Level Framework
    { frameworkCode: 'LEADERSHIP_4', code: 'LD1', name: 'Emerging Leader', levelNumber: 1, description: 'Demonstrating leadership potential, learning to influence.', color: '#F59E0B' },
    { frameworkCode: 'LEADERSHIP_4', code: 'LD2', name: 'Team Leader', levelNumber: 2, description: 'Effectively leads teams and projects.', color: '#10B981' },
    { frameworkCode: 'LEADERSHIP_4', code: 'LD3', name: 'Senior Leader', levelNumber: 3, description: 'Leads multiple teams, drives organizational change.', color: '#3B82F6' },
    { frameworkCode: 'LEADERSHIP_4', code: 'LD4', name: 'Executive Leader', levelNumber: 4, description: 'Strategic leadership, shapes organization direction.', color: '#8B5CF6' },
    
    // Dreyfus Model
    { frameworkCode: 'DREYFUS', code: 'DR1', name: 'Novice', levelNumber: 1, description: 'Rigid adherence to rules, no discretionary judgment.', color: '#EF4444' },
    { frameworkCode: 'DREYFUS', code: 'DR2', name: 'Advanced Beginner', levelNumber: 2, description: 'Situational perception limited, all aspects treated separately.', color: '#F59E0B' },
    { frameworkCode: 'DREYFUS', code: 'DR3', name: 'Competent', levelNumber: 3, description: 'Coping with crowdedness, sees actions as part of goals.', color: '#EAB308' },
    { frameworkCode: 'DREYFUS', code: 'DR4', name: 'Proficient', levelNumber: 4, description: 'Holistic view, prioritizes importance of aspects.', color: '#10B981' },
    { frameworkCode: 'DREYFUS', code: 'DR5', name: 'Expert', levelNumber: 5, description: 'Intuitive grasp of situations, vision of what is possible.', color: '#8B5CF6' }
];

// ============================================================================
// 5. COMPETENCY CATALOG
// ============================================================================

export const competencyCatalogSeed = [
    // Technical Competencies
    {
        code: 'TECH-001',
        name: 'Software Development',
        categoryCode: 'TECHNICAL',
        subcategoryCode: 'ENGINEERING',
        description: 'The ability to design, develop, test, and maintain software applications using modern programming languages, frameworks, and best practices.',
        status: 'Active',
        version: '2.1',
        owner: 'Engineering Excellence Team',
        usageCount: 156
    },
    {
        code: 'TECH-002',
        name: 'Cloud Architecture',
        categoryCode: 'TECHNICAL',
        subcategoryCode: 'CLOUD_INFRASTRUCTURE',
        description: 'Expertise in designing and implementing scalable, secure, and cost-effective cloud solutions using major cloud platforms.',
        status: 'Active',
        version: '1.5',
        owner: 'Cloud Center of Excellence',
        usageCount: 89
    },
    {
        code: 'TECH-003',
        name: 'Data Engineering',
        categoryCode: 'TECHNICAL',
        subcategoryCode: 'DATA_ANALYTICS',
        description: 'Building and maintaining data pipelines, ETL processes, and data infrastructure to support analytics and business intelligence.',
        status: 'Active',
        version: '1.3',
        owner: 'Data Platform Team',
        usageCount: 67
    },
    {
        code: 'TECH-004',
        name: 'System Design',
        categoryCode: 'TECHNICAL',
        subcategoryCode: 'ENGINEERING',
        description: 'Ability to design large-scale distributed systems considering scalability, reliability, and performance.',
        status: 'Active',
        version: '1.8',
        owner: 'Architecture Board',
        usageCount: 112
    },
    {
        code: 'TECH-005',
        name: 'DevOps & CI/CD',
        categoryCode: 'TECHNICAL',
        subcategoryCode: 'CLOUD_INFRASTRUCTURE',
        description: 'Implementation and management of continuous integration, continuous deployment pipelines, and DevOps practices.',
        status: 'Active',
        version: '2.0',
        owner: 'Platform Engineering',
        usageCount: 78
    },
    {
        code: 'TECH-006',
        name: 'Cybersecurity',
        categoryCode: 'TECHNICAL',
        subcategoryCode: 'SECURITY',
        description: 'Identifying, preventing, and responding to security threats and vulnerabilities in systems and applications.',
        status: 'Active',
        version: '1.4',
        owner: 'Security Team',
        usageCount: 45
    },
    {
        code: 'TECH-007',
        name: 'UI/UX Design',
        categoryCode: 'TECHNICAL',
        subcategoryCode: 'DESIGN',
        description: 'Creating intuitive, accessible, and visually appealing user interfaces and experiences.',
        status: 'Active',
        version: '1.6',
        owner: 'Design Team',
        usageCount: 52
    },
    {
        code: 'TECH-008',
        name: 'Machine Learning',
        categoryCode: 'TECHNICAL',
        subcategoryCode: 'DATA_ANALYTICS',
        description: 'Developing and deploying machine learning models to solve business problems.',
        status: 'Active',
        version: '1.2',
        owner: 'AI/ML Team',
        usageCount: 34
    },
    
    // Leadership Competencies
    {
        code: 'LEAD-001',
        name: 'Strategic Thinking',
        categoryCode: 'LEADERSHIP',
        subcategoryCode: 'STRATEGIC',
        description: 'Ability to think long-term, anticipate trends, and develop strategies that position the organization for success.',
        status: 'Active',
        version: '1.7',
        owner: 'Leadership Development',
        usageCount: 134
    },
    {
        code: 'LEAD-002',
        name: 'Team Development',
        categoryCode: 'LEADERSHIP',
        subcategoryCode: 'PEOPLE_MANAGEMENT',
        description: 'Building high-performing teams through coaching, mentoring, and creating growth opportunities.',
        status: 'Active',
        version: '2.0',
        owner: 'Leadership Development',
        usageCount: 189
    },
    {
        code: 'LEAD-003',
        name: 'Change Leadership',
        categoryCode: 'LEADERSHIP',
        subcategoryCode: 'CHANGE_MGMT',
        description: 'Leading organizational change initiatives while maintaining team engagement and productivity.',
        status: 'Active',
        version: '1.5',
        owner: 'Change Management Office',
        usageCount: 76
    },
    {
        code: 'LEAD-004',
        name: 'Decision Making',
        categoryCode: 'LEADERSHIP',
        subcategoryCode: 'STRATEGIC',
        description: 'Making timely, well-informed decisions by analyzing data, weighing risks, and considering stakeholder impact.',
        status: 'Active',
        version: '1.3',
        owner: 'Leadership Development',
        usageCount: 145
    },
    
    // Behavioral Competencies
    {
        code: 'BEHV-001',
        name: 'Communication',
        categoryCode: 'BEHAVIORAL',
        subcategoryCode: 'COMMUNICATION',
        description: 'Effectively conveying information through verbal, written, and visual means to diverse audiences.',
        status: 'Active',
        version: '2.2',
        owner: 'HR Learning & Development',
        usageCount: 267
    },
    {
        code: 'BEHV-002',
        name: 'Collaboration',
        categoryCode: 'BEHAVIORAL',
        subcategoryCode: 'COLLABORATION',
        description: 'Working effectively with others across teams, functions, and geographies to achieve shared goals.',
        status: 'Active',
        version: '1.9',
        owner: 'HR Learning & Development',
        usageCount: 234
    },
    {
        code: 'BEHV-003',
        name: 'Emotional Intelligence',
        categoryCode: 'BEHAVIORAL',
        subcategoryCode: 'EMOTIONAL_INT',
        description: 'Understanding and managing own emotions while effectively navigating interpersonal relationships.',
        status: 'Active',
        version: '1.4',
        owner: 'HR Learning & Development',
        usageCount: 156
    },
    {
        code: 'BEHV-004',
        name: 'Conflict Resolution',
        categoryCode: 'BEHAVIORAL',
        subcategoryCode: 'COLLABORATION',
        description: 'Addressing and resolving disagreements constructively while maintaining positive relationships.',
        status: 'Active',
        version: '1.2',
        owner: 'HR Learning & Development',
        usageCount: 89
    },
    
    // Functional Competencies
    {
        code: 'FUNC-001',
        name: 'Project Management',
        categoryCode: 'FUNCTIONAL',
        subcategoryCode: 'OPERATIONS',
        description: 'Planning, executing, and closing projects effectively using appropriate methodologies and tools.',
        status: 'Active',
        version: '2.1',
        owner: 'PMO',
        usageCount: 178
    },
    {
        code: 'FUNC-002',
        name: 'Business Analysis',
        categoryCode: 'FUNCTIONAL',
        subcategoryCode: 'OPERATIONS',
        description: 'Analyzing business needs, documenting requirements, and recommending solutions.',
        status: 'Active',
        version: '1.6',
        owner: 'Business Excellence',
        usageCount: 123
    },
    {
        code: 'FUNC-003',
        name: 'Financial Acumen',
        categoryCode: 'FUNCTIONAL',
        subcategoryCode: 'FINANCE',
        description: 'Understanding financial statements, budgeting, and using financial data to drive decisions.',
        status: 'Active',
        version: '1.4',
        owner: 'Finance Team',
        usageCount: 145
    },
    {
        code: 'FUNC-004',
        name: 'Sales Excellence',
        categoryCode: 'FUNCTIONAL',
        subcategoryCode: 'SALES',
        description: 'Identifying opportunities, building relationships, and closing deals effectively.',
        status: 'Active',
        version: '1.8',
        owner: 'Sales Enablement',
        usageCount: 87
    },
    
    // Core Competencies
    {
        code: 'CORE-001',
        name: 'Problem Solving',
        categoryCode: 'CORE',
        subcategoryCode: 'PROBLEM_SOLVING',
        description: 'Analyzing complex situations, identifying root causes, and developing effective solutions.',
        status: 'Active',
        version: '2.0',
        owner: 'HR Learning & Development',
        usageCount: 312
    },
    {
        code: 'CORE-002',
        name: 'Innovation',
        categoryCode: 'CORE',
        subcategoryCode: 'INNOVATION',
        description: 'Generating creative ideas and driving implementation of new approaches and solutions.',
        status: 'Active',
        version: '1.5',
        owner: 'Innovation Office',
        usageCount: 198
    },
    {
        code: 'CORE-003',
        name: 'Adaptability',
        categoryCode: 'CORE',
        subcategoryCode: 'PROBLEM_SOLVING',
        description: 'Adjusting effectively to changing conditions, new information, and evolving priorities.',
        status: 'Active',
        version: '1.3',
        owner: 'HR Learning & Development',
        usageCount: 267
    },
    {
        code: 'CORE-004',
        name: 'Integrity',
        categoryCode: 'CORE',
        subcategoryCode: 'ETHICS',
        description: 'Acting ethically, maintaining confidentiality, and demonstrating honesty in all interactions.',
        status: 'Active',
        version: '1.1',
        owner: 'Ethics & Compliance',
        usageCount: 345
    },
    {
        code: 'CORE-005',
        name: 'Customer Focus',
        categoryCode: 'CORE',
        subcategoryCode: 'PROBLEM_SOLVING',
        description: 'Understanding customer needs and delivering value that exceeds expectations.',
        status: 'Active',
        version: '1.7',
        owner: 'Customer Success',
        usageCount: 289
    }
];

// ============================================================================
// 6. PROFICIENCY DESCRIPTORS FOR COMPETENCIES
// ============================================================================

export const competencyProficiencyDescriptorsSeed = [
    // Software Development Descriptors
    {
        competencyCode: 'TECH-001',
        levelCode: 'L1',
        frameworkCode: 'STANDARD_5',
        description: 'Understands basic programming concepts and can write simple code with guidance.',
        behaviors: [
            'Writes basic code following established patterns',
            'Understands fundamental data structures',
            'Can debug simple issues with support',
            'Follows coding standards and guidelines'
        ]
    },
    {
        competencyCode: 'TECH-001',
        levelCode: 'L2',
        frameworkCode: 'STANDARD_5',
        description: 'Independently develops features with moderate complexity and participates in code reviews.',
        behaviors: [
            'Implements features with minimal guidance',
            'Writes unit tests for own code',
            'Participates actively in code reviews',
            'Understands and applies design patterns'
        ]
    },
    {
        competencyCode: 'TECH-001',
        levelCode: 'L3',
        frameworkCode: 'STANDARD_5',
        description: 'Designs and implements complex features, mentors junior developers.',
        behaviors: [
            'Designs modular, maintainable solutions',
            'Leads code reviews and provides feedback',
            'Mentors junior team members',
            'Contributes to architecture decisions'
        ]
    },
    {
        competencyCode: 'TECH-001',
        levelCode: 'L4',
        frameworkCode: 'STANDARD_5',
        description: 'Leads technical initiatives, defines best practices, and influences engineering culture.',
        behaviors: [
            'Defines and evolves coding standards',
            'Designs systems for scalability',
            'Leads cross-team technical initiatives',
            'Evaluates and introduces new technologies'
        ]
    },
    {
        competencyCode: 'TECH-001',
        levelCode: 'L5',
        frameworkCode: 'STANDARD_5',
        description: 'Industry-recognized expertise, shapes engineering direction across the organization.',
        behaviors: [
            'Sets technical vision and strategy',
            'Represents company in technical community',
            'Drives organization-wide improvements',
            'Mentors senior engineers and architects'
        ]
    },
    
    // Communication Descriptors
    {
        competencyCode: 'BEHV-001',
        levelCode: 'L1',
        frameworkCode: 'STANDARD_5',
        description: 'Communicates basic information clearly in familiar situations.',
        behaviors: [
            'Writes clear and concise emails',
            'Participates in team meetings',
            'Asks clarifying questions',
            'Documents own work'
        ]
    },
    {
        competencyCode: 'BEHV-001',
        levelCode: 'L2',
        frameworkCode: 'STANDARD_5',
        description: 'Adapts communication style to audience, presents ideas effectively.',
        behaviors: [
            'Presents to small groups confidently',
            'Creates clear documentation',
            'Actively listens and paraphrases',
            'Provides constructive feedback'
        ]
    },
    {
        competencyCode: 'BEHV-001',
        levelCode: 'L3',
        frameworkCode: 'STANDARD_5',
        description: 'Communicates complex information clearly, influences others effectively.',
        behaviors: [
            'Presents to diverse stakeholders',
            'Facilitates productive discussions',
            'Crafts compelling narratives',
            'Handles difficult conversations'
        ]
    },
    {
        competencyCode: 'BEHV-001',
        levelCode: 'L4',
        frameworkCode: 'STANDARD_5',
        description: 'Expert communicator who shapes organizational messaging and culture.',
        behaviors: [
            'Delivers executive presentations',
            'Coaches others on communication',
            'Manages crisis communications',
            'Builds cross-functional consensus'
        ]
    },
    {
        competencyCode: 'BEHV-001',
        levelCode: 'L5',
        frameworkCode: 'STANDARD_5',
        description: 'Thought leader who represents the organization externally.',
        behaviors: [
            'Speaks at industry conferences',
            'Shapes organizational voice and brand',
            'Influences industry conversations',
            'Mentors executive communicators'
        ]
    }
];

// ============================================================================
// 7. JOB ROLES
// ============================================================================

export const jobRolesSeed = [
    { code: 'JR-SWE-1', name: 'Software Engineer I', departmentId: 'Engineering', level: 'Entry', description: 'Entry-level software engineering role' },
    { code: 'JR-SWE-2', name: 'Software Engineer II', departmentId: 'Engineering', level: 'Mid', description: 'Mid-level software engineering role' },
    { code: 'JR-SSE', name: 'Senior Software Engineer', departmentId: 'Engineering', level: 'Senior', description: 'Senior software engineering role' },
    { code: 'JR-STAFF', name: 'Staff Engineer', departmentId: 'Engineering', level: 'Lead', description: 'Staff-level technical leadership' },
    { code: 'JR-PRINCIPAL', name: 'Principal Engineer', departmentId: 'Engineering', level: 'Lead', description: 'Principal-level technical leadership' },
    { code: 'JR-EM', name: 'Engineering Manager', departmentId: 'Engineering', level: 'Lead', description: 'Engineering people manager' },
    { code: 'JR-DIR-ENG', name: 'Director of Engineering', departmentId: 'Engineering', level: 'Executive', description: 'Engineering director role' },
    { code: 'JR-PM', name: 'Product Manager', departmentId: 'Product', level: 'Mid', description: 'Product management role' },
    { code: 'JR-SPM', name: 'Senior Product Manager', departmentId: 'Product', level: 'Senior', description: 'Senior product management role' },
    { code: 'JR-DESIGNER', name: 'UI/UX Designer', departmentId: 'Design', level: 'Mid', description: 'UI/UX design role' },
    { code: 'JR-SDESIGNER', name: 'Senior Designer', departmentId: 'Design', level: 'Senior', description: 'Senior design role' },
    { code: 'JR-DA', name: 'Data Analyst', departmentId: 'Data', level: 'Mid', description: 'Data analysis role' },
    { code: 'JR-DE', name: 'Data Engineer', departmentId: 'Data', level: 'Mid', description: 'Data engineering role' },
    { code: 'JR-DS', name: 'Data Scientist', departmentId: 'Data', level: 'Senior', description: 'Data science role' },
    { code: 'JR-DEVOPS', name: 'DevOps Engineer', departmentId: 'Platform', level: 'Mid', description: 'DevOps engineering role' },
    { code: 'JR-SRE', name: 'Site Reliability Engineer', departmentId: 'Platform', level: 'Senior', description: 'SRE role' },
    { code: 'JR-SA', name: 'Sales Associate', departmentId: 'Sales', level: 'Entry', description: 'Entry-level sales role' },
    { code: 'JR-AE', name: 'Account Executive', departmentId: 'Sales', level: 'Mid', description: 'Account executive role' },
    { code: 'JR-SAE', name: 'Senior Account Executive', departmentId: 'Sales', level: 'Senior', description: 'Senior sales role' },
    { code: 'JR-HRBP', name: 'HR Business Partner', departmentId: 'HR', level: 'Senior', description: 'HR business partner role' }
];

// ============================================================================
// 8. JOB COMPETENCY MAPPINGS
// ============================================================================

export const jobCompetencyMappingsSeed = [
    // Software Engineer I
    { jobRoleCode: 'JR-SWE-1', competencyCode: 'TECH-001', levelCode: 'L2', weight: 1.0, isRequired: true },
    { jobRoleCode: 'JR-SWE-1', competencyCode: 'CORE-001', levelCode: 'L2', weight: 0.8, isRequired: true },
    { jobRoleCode: 'JR-SWE-1', competencyCode: 'BEHV-001', levelCode: 'L2', weight: 0.7, isRequired: true },
    { jobRoleCode: 'JR-SWE-1', competencyCode: 'BEHV-002', levelCode: 'L2', weight: 0.8, isRequired: true },
    
    // Software Engineer II
    { jobRoleCode: 'JR-SWE-2', competencyCode: 'TECH-001', levelCode: 'L3', weight: 1.0, isRequired: true },
    { jobRoleCode: 'JR-SWE-2', competencyCode: 'TECH-004', levelCode: 'L2', weight: 0.7, isRequired: false },
    { jobRoleCode: 'JR-SWE-2', competencyCode: 'CORE-001', levelCode: 'L3', weight: 0.9, isRequired: true },
    { jobRoleCode: 'JR-SWE-2', competencyCode: 'BEHV-001', levelCode: 'L3', weight: 0.8, isRequired: true },
    
    // Senior Software Engineer
    { jobRoleCode: 'JR-SSE', competencyCode: 'TECH-001', levelCode: 'L4', weight: 1.0, isRequired: true },
    { jobRoleCode: 'JR-SSE', competencyCode: 'TECH-004', levelCode: 'L3', weight: 0.9, isRequired: true },
    { jobRoleCode: 'JR-SSE', competencyCode: 'LEAD-002', levelCode: 'L2', weight: 0.7, isRequired: true },
    { jobRoleCode: 'JR-SSE', competencyCode: 'CORE-001', levelCode: 'L4', weight: 0.9, isRequired: true },
    
    // Engineering Manager
    { jobRoleCode: 'JR-EM', competencyCode: 'LEAD-002', levelCode: 'L4', weight: 1.0, isRequired: true },
    { jobRoleCode: 'JR-EM', competencyCode: 'LEAD-001', levelCode: 'L3', weight: 0.9, isRequired: true },
    { jobRoleCode: 'JR-EM', competencyCode: 'TECH-001', levelCode: 'L3', weight: 0.7, isRequired: true },
    { jobRoleCode: 'JR-EM', competencyCode: 'BEHV-001', levelCode: 'L4', weight: 0.9, isRequired: true },
    { jobRoleCode: 'JR-EM', competencyCode: 'LEAD-004', levelCode: 'L4', weight: 0.9, isRequired: true },
    
    // Product Manager
    { jobRoleCode: 'JR-PM', competencyCode: 'FUNC-002', levelCode: 'L3', weight: 1.0, isRequired: true },
    { jobRoleCode: 'JR-PM', competencyCode: 'BEHV-001', levelCode: 'L4', weight: 0.9, isRequired: true },
    { jobRoleCode: 'JR-PM', competencyCode: 'LEAD-004', levelCode: 'L3', weight: 0.8, isRequired: true },
    { jobRoleCode: 'JR-PM', competencyCode: 'CORE-005', levelCode: 'L4', weight: 1.0, isRequired: true },
    
    // Data Scientist
    { jobRoleCode: 'JR-DS', competencyCode: 'TECH-008', levelCode: 'L4', weight: 1.0, isRequired: true },
    { jobRoleCode: 'JR-DS', competencyCode: 'TECH-003', levelCode: 'L3', weight: 0.8, isRequired: true },
    { jobRoleCode: 'JR-DS', competencyCode: 'CORE-001', levelCode: 'L4', weight: 0.9, isRequired: true },
    { jobRoleCode: 'JR-DS', competencyCode: 'BEHV-001', levelCode: 'L3', weight: 0.7, isRequired: true }
];

// ============================================================================
// 9. SKILL ASSESSMENTS
// ============================================================================

export const skillAssessmentsSeed = [
    {
        code: 'SA-2025-Q4-001',
        name: 'Q4 2025 Engineering Skills Assessment',
        description: 'Quarterly skills assessment for engineering team members',
        type: 'Self',
        status: 'In Progress',
        cycleId: '2025-Q4',
        startDate: '2025-10-01',
        endDate: '2025-12-31',
        createdBy: 'system'
    },
    {
        code: 'SA-2025-Q4-002',
        name: 'Sarah Chen - Annual 360 Review',
        description: '360-degree feedback assessment for Sarah Chen',
        type: '360',
        status: 'In Progress',
        cycleId: '2025-Annual',
        startDate: '2025-11-01',
        endDate: '2025-12-15',
        createdBy: 'hr-admin'
    },
    {
        code: 'SA-2025-Q4-003',
        name: 'Manager Assessment - Team Delta',
        description: 'Manager assessment of Team Delta members',
        type: 'Manager',
        status: 'Draft',
        cycleId: '2025-Q4',
        startDate: '2025-12-01',
        endDate: '2025-12-20',
        createdBy: 'manager-001'
    },
    {
        code: 'SA-2025-Q3-001',
        name: 'Q3 2025 Product Team Assessment',
        description: 'Product team competency assessment',
        type: 'Self',
        status: 'Completed',
        cycleId: '2025-Q3',
        startDate: '2025-07-01',
        endDate: '2025-09-30',
        completedAt: '2025-09-28',
        createdBy: 'system'
    },
    {
        code: 'SA-2025-Q4-004',
        name: 'Peer Review - Design Team',
        description: 'Peer-to-peer assessment within the design team',
        type: 'Peer',
        status: 'In Progress',
        cycleId: '2025-Q4',
        startDate: '2025-11-15',
        endDate: '2025-12-15',
        createdBy: 'design-lead'
    }
];

// ============================================================================
// 10. GAP ANALYSIS
// ============================================================================

export const gapAnalysisSeed = [
    {
        code: 'GA-2025-001',
        name: 'Engineering Department Gap Analysis Q4 2025',
        type: 'Department',
        targetType: 'Department',
        targetId: 'engineering',
        status: 'Active',
        createdBy: 'hr-admin'
    },
    {
        code: 'GA-2025-002',
        name: 'John Smith - Individual Development Assessment',
        type: 'Individual',
        targetType: 'Employee',
        targetId: 'emp-001',
        status: 'Active',
        createdBy: 'manager-001'
    },
    {
        code: 'GA-2025-003',
        name: 'Team Alpha Capability Assessment',
        type: 'Team',
        targetType: 'Team',
        targetId: 'team-alpha',
        status: 'Active',
        createdBy: 'team-lead-001'
    },
    {
        code: 'GA-2025-004',
        name: 'Organization-wide Leadership Gap Analysis',
        type: 'Organization',
        targetType: 'Organization',
        targetId: 'kreup-ai',
        status: 'Active',
        createdBy: 'chro'
    }
];

// ============================================================================
// 11. DEVELOPMENT PLANS
// ============================================================================

export const developmentPlansSeed = [
    {
        code: 'DP-2025-001',
        name: 'Engineering Excellence Development Program',
        description: 'Comprehensive development plan to address skill gaps in the engineering department',
        type: 'Department',
        targetType: 'Department',
        targetId: 'engineering',
        status: 'Active',
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        budget: 50000,
        createdBy: 'hr-admin'
    },
    {
        code: 'DP-2025-002',
        name: 'John Smith Career Development Plan',
        description: 'Individual development plan for promotion readiness',
        type: 'Individual',
        targetType: 'Employee',
        targetId: 'emp-001',
        status: 'In Progress',
        startDate: '2025-01-15',
        endDate: '2025-07-15',
        budget: 5000,
        createdBy: 'manager-001'
    },
    {
        code: 'DP-2025-003',
        name: 'Leadership Pipeline Program',
        description: 'Organization-wide program to develop future leaders',
        type: 'Organization',
        targetType: 'Organization',
        targetId: 'kreup-ai',
        status: 'Active',
        startDate: '2025-02-01',
        endDate: '2025-12-31',
        budget: 150000,
        createdBy: 'chro'
    }
];

// ============================================================================
// 12. DEVELOPMENT ACTIVITIES
// ============================================================================

export const developmentActivitiesSeed = [
    {
        planCode: 'DP-2025-001',
        name: 'Cloud Architecture Certification',
        type: 'Certification',
        provider: 'AWS',
        description: 'AWS Solutions Architect certification program',
        duration: '3 months',
        estimatedCost: 3000,
        status: 'Planned'
    },
    {
        planCode: 'DP-2025-001',
        name: 'System Design Workshop',
        type: 'Workshop',
        provider: 'Internal',
        description: 'Hands-on workshop on designing scalable systems',
        duration: '2 days',
        estimatedCost: 500,
        status: 'In Progress'
    },
    {
        planCode: 'DP-2025-002',
        name: 'Leadership Fundamentals Course',
        type: 'Course',
        provider: 'LinkedIn Learning',
        description: 'Foundation course on leadership principles',
        duration: '4 weeks',
        estimatedCost: 200,
        status: 'Completed'
    },
    {
        planCode: 'DP-2025-002',
        name: 'Senior Engineer Mentorship',
        type: 'Mentoring',
        provider: 'Internal',
        description: 'Monthly mentoring sessions with Principal Engineer',
        duration: '6 months',
        estimatedCost: 0,
        status: 'In Progress'
    },
    {
        planCode: 'DP-2025-003',
        name: 'Executive Leadership Program',
        type: 'Training',
        provider: 'Harvard Business School Online',
        description: 'Comprehensive leadership development program',
        duration: '6 months',
        estimatedCost: 15000,
        status: 'Planned'
    }
];

// ============================================================================
// 13. COMPETENCY DEVELOPMENT RESOURCES
// ============================================================================

export const competencyResourcesSeed = [
    { competencyCode: 'TECH-001', title: 'Clean Code', type: 'Book', provider: 'Robert C. Martin', url: 'https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882' },
    { competencyCode: 'TECH-001', title: 'Design Patterns', type: 'Course', provider: 'Pluralsight', url: 'https://www.pluralsight.com/courses/design-patterns' },
    { competencyCode: 'TECH-002', title: 'AWS Solutions Architect', type: 'Certification', provider: 'AWS', url: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/' },
    { competencyCode: 'TECH-002', title: 'Cloud Architecture Patterns', type: 'Book', provider: "O'Reilly", url: 'https://www.oreilly.com/library/view/cloud-architecture-patterns/9781449357979/' },
    { competencyCode: 'LEAD-001', title: 'Good Strategy Bad Strategy', type: 'Book', provider: 'Richard Rumelt' },
    { competencyCode: 'LEAD-002', title: 'The Manager Path', type: 'Book', provider: 'Camille Fournier' },
    { competencyCode: 'LEAD-002', title: 'Engineering Leadership', type: 'Course', provider: 'Reforge', url: 'https://www.reforge.com' },
    { competencyCode: 'BEHV-001', title: 'Crucial Conversations', type: 'Workshop', provider: 'VitalSmarts', duration: '2 days' },
    { competencyCode: 'BEHV-001', title: 'Business Writing', type: 'Course', provider: 'Coursera', url: 'https://www.coursera.org/learn/writing-for-business' },
    { competencyCode: 'CORE-001', title: 'Problem Solving 101', type: 'Book', provider: 'Ken Watanabe' },
    { competencyCode: 'CORE-002', title: 'Innovation & Design Thinking', type: 'Course', provider: 'IDEO U', url: 'https://www.ideou.com' }
];

// ============================================================================
// 14. ASSESSMENT CRITERIA
// ============================================================================

export const assessmentCriteriaSeed = [
    { competencyCode: 'TECH-001', criteria: 'Code Quality: Writes clean, maintainable, and well-documented code' },
    { competencyCode: 'TECH-001', criteria: 'Testing: Implements comprehensive unit and integration tests' },
    { competencyCode: 'TECH-001', criteria: 'Problem Solving: Efficiently debugs and resolves complex issues' },
    { competencyCode: 'TECH-001', criteria: 'Architecture: Designs scalable and extensible solutions' },
    { competencyCode: 'LEAD-002', criteria: 'Team Building: Successfully recruits and develops high-performing teams' },
    { competencyCode: 'LEAD-002', criteria: 'Performance Management: Provides effective feedback and coaching' },
    { competencyCode: 'LEAD-002', criteria: 'Delegation: Appropriately assigns work and empowers team members' },
    { competencyCode: 'BEHV-001', criteria: 'Clarity: Conveys complex information in an understandable manner' },
    { competencyCode: 'BEHV-001', criteria: 'Active Listening: Demonstrates understanding through responses and actions' },
    { competencyCode: 'BEHV-001', criteria: 'Written Communication: Produces clear and professional documentation' }
];
