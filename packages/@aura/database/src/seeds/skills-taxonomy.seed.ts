import { PrismaClient } from '@prisma/client';

export interface Skill {
  category: string;
  name: string;
  subcategory?: string;
  level: 1 | 2 | 3 | 4 | 5;
  description: string;
}

export const technicalSkills: Skill[] = [
  // Programming Languages
  { category: 'technical', name: 'JavaScript', subcategory: 'languages', level: 3, description: 'ES6+, async/await, closures, prototypes, module systems' },
  { category: 'technical', name: 'TypeScript', subcategory: 'languages', level: 3, description: 'Static typing, generics, decorators, advanced type manipulation' },
  { category: 'technical', name: 'Python', subcategory: 'languages', level: 3, description: 'Data structures, OOP, decorators, generators, async programming' },
  { category: 'technical', name: 'Java', subcategory: 'languages', level: 3, description: 'JVM, multithreading, collections, streams, Spring ecosystem' },
  { category: 'technical', name: 'C#', subcategory: 'languages', level: 3, description: '.NET ecosystem, LINQ, async patterns, entity framework' },
  { category: 'technical', name: 'Go', subcategory: 'languages', level: 3, description: 'Goroutines, channels, interfaces, concurrency patterns' },
  { category: 'technical', name: 'Rust', subcategory: 'languages', level: 4, description: 'Ownership, borrowing, lifetimes, zero-cost abstractions' },
  { category: 'technical', name: 'Swift', subcategory: 'languages', level: 3, description: 'iOS/macOS development, protocols, generics, SwiftUI' },
  { category: 'technical', name: 'Kotlin', subcategory: 'languages', level: 3, description: 'Android development, coroutines, null safety, extensions' },
  { category: 'technical', name: 'Ruby', subcategory: 'languages', level: 3, description: 'Metaprogramming, blocks, Rails ecosystem, testing' },
  { category: 'technical', name: 'PHP', subcategory: 'languages', level: 2, description: 'Modern PHP, Laravel/Symfony, Composer, PSR standards' },
  { category: 'technical', name: 'Scala', subcategory: 'languages', level: 4, description: 'Functional programming, Akka, Spark, type system' },

  // Frameworks
  { category: 'technical', name: 'React', subcategory: 'frameworks', level: 3, description: 'Hooks, context, state management, component patterns' },
  { category: 'technical', name: 'Angular', subcategory: 'frameworks', level: 3, description: 'RxJS, dependency injection, modules, routing' },
  { category: 'technical', name: 'Vue.js', subcategory: 'frameworks', level: 3, description: 'Composition API, Vuex/Pinia, directives, plugins' },
  { category: 'technical', name: 'Next.js', subcategory: 'frameworks', level: 3, description: 'SSR, SSG, API routes, middleware, app router' },
  { category: 'technical', name: 'Node.js', subcategory: 'frameworks', level: 3, description: 'Event loop, streams, clustering, Express/Fastify' },
  { category: 'technical', name: 'Django', subcategory: 'frameworks', level: 3, description: 'ORM, middleware, REST framework, admin, signals' },
  { category: 'technical', name: 'Spring Boot', subcategory: 'frameworks', level: 3, description: 'Auto-configuration, actuator, security, microservices' },
  { category: 'technical', name: 'Flask', subcategory: 'frameworks', level: 2, description: 'Blueprints, extensions, Jinja2, SQLAlchemy integration' },
  { category: 'technical', name: 'Ruby on Rails', subcategory: 'frameworks', level: 3, description: 'MVC, ActiveRecord, Action Cable, Hotwire' },
  { category: 'technical', name: 'Express.js', subcategory: 'frameworks', level: 2, description: 'Middleware, routing, error handling, template engines' },
  { category: 'technical', name: 'NestJS', subcategory: 'frameworks', level: 3, description: 'Decorators, modules, pipes, guards, microservices' },
  { category: 'technical', name: 'FastAPI', subcategory: 'frameworks', level: 3, description: 'Async endpoints, Pydantic models, dependency injection' },

  // Databases
  { category: 'technical', name: 'PostgreSQL', subcategory: 'databases', level: 3, description: 'Advanced queries, indexing, partitioning, extensions' },
  { category: 'technical', name: 'MySQL', subcategory: 'databases', level: 2, description: 'InnoDB, replication, query optimization, stored procedures' },
  { category: 'technical', name: 'MongoDB', subcategory: 'databases', level: 3, description: 'Aggregation, indexing, sharding, replica sets' },
  { category: 'technical', name: 'Redis', subcategory: 'databases', level: 3, description: 'Data structures, pub/sub, clustering, Lua scripting' },
  { category: 'technical', name: 'Elasticsearch', subcategory: 'databases', level: 4, description: 'Full-text search, aggregations, mapping, cluster management' },
  { category: 'technical', name: 'DynamoDB', subcategory: 'databases', level: 3, description: 'Partition keys, GSIs, streams, DAX caching' },
  { category: 'technical', name: 'Cassandra', subcategory: 'databases', level: 4, description: 'Wide-column store, partitioning, consistency levels' },

  // Cloud & Infrastructure
  { category: 'technical', name: 'AWS', subcategory: 'cloud', level: 3, description: 'EC2, S3, Lambda, RDS, ECS, CloudFormation, IAM' },
  { category: 'technical', name: 'Azure', subcategory: 'cloud', level: 3, description: 'App Services, AKS, Functions, Cosmos DB, DevOps' },
  { category: 'technical', name: 'Google Cloud', subcategory: 'cloud', level: 3, description: 'GKE, Cloud Functions, BigQuery, Pub/Sub, Firestore' },
  { category: 'technical', name: 'Docker', subcategory: 'tools', level: 2, description: 'Containerization, Dockerfile, compose, networking, volumes' },
  { category: 'technical', name: 'Kubernetes', subcategory: 'tools', level: 4, description: 'Pods, services, deployments, operators, Helm charts' },
  { category: 'technical', name: 'Terraform', subcategory: 'tools', level: 3, description: 'Infrastructure as code, modules, state management, providers' },
  { category: 'technical', name: 'CI/CD', subcategory: 'tools', level: 3, description: 'GitHub Actions, Jenkins, GitLab CI, CircleCI pipelines' },
  { category: 'technical', name: 'Git', subcategory: 'tools', level: 2, description: 'Branching strategies, rebasing, hooks, submodules' },

  // Data & ML
  { category: 'technical', name: 'Machine Learning', subcategory: 'data', level: 4, description: 'Supervised/unsupervised learning, model evaluation, feature engineering' },
  { category: 'technical', name: 'Data Engineering', subcategory: 'data', level: 4, description: 'ETL pipelines, data warehousing, Spark, Airflow' },
  { category: 'technical', name: 'SQL', subcategory: 'data', level: 2, description: 'Complex queries, window functions, CTEs, optimization' },

  // Architecture & Design
  { category: 'technical', name: 'System Design', subcategory: 'architecture', level: 4, description: 'Distributed systems, scalability, high availability patterns' },
  { category: 'technical', name: 'Microservices', subcategory: 'architecture', level: 4, description: 'Service decomposition, API gateway, saga patterns, event-driven' },
  { category: 'technical', name: 'REST API Design', subcategory: 'architecture', level: 3, description: 'Resource modeling, versioning, HATEOAS, documentation' },
  { category: 'technical', name: 'GraphQL', subcategory: 'architecture', level: 3, description: 'Schema design, resolvers, subscriptions, federation' },

  // Security
  { category: 'technical', name: 'Application Security', subcategory: 'security', level: 4, description: 'OWASP, authentication, authorization, encryption, pen testing' },
  { category: 'technical', name: 'Cloud Security', subcategory: 'security', level: 4, description: 'IAM, network security, encryption at rest/transit, compliance' },

  // Mobile
  { category: 'technical', name: 'React Native', subcategory: 'mobile', level: 3, description: 'Cross-platform mobile development, native modules, navigation' },
  { category: 'technical', name: 'Flutter', subcategory: 'mobile', level: 3, description: 'Dart, widgets, state management, platform channels' },
];

export const softSkills: Skill[] = [
  { category: 'soft_skills', name: 'Verbal Communication', subcategory: 'communication', level: 2, description: 'Clear articulation of ideas, active listening, audience adaptation' },
  { category: 'soft_skills', name: 'Written Communication', subcategory: 'communication', level: 2, description: 'Professional emails, documentation, reports, proposals' },
  { category: 'soft_skills', name: 'Presentation Skills', subcategory: 'communication', level: 3, description: 'Public speaking, slide design, storytelling, audience engagement' },
  { category: 'soft_skills', name: 'Active Listening', subcategory: 'communication', level: 2, description: 'Empathetic listening, asking clarifying questions, paraphrasing' },
  { category: 'soft_skills', name: 'Negotiation', subcategory: 'communication', level: 4, description: 'Win-win strategies, BATNA, persuasion, conflict resolution' },
  { category: 'soft_skills', name: 'Team Collaboration', subcategory: 'teamwork', level: 2, description: 'Cross-functional work, shared goals, trust building' },
  { category: 'soft_skills', name: 'Conflict Resolution', subcategory: 'teamwork', level: 3, description: 'Mediation, de-escalation, finding common ground' },
  { category: 'soft_skills', name: 'Emotional Intelligence', subcategory: 'interpersonal', level: 3, description: 'Self-awareness, empathy, social skills, relationship management' },
  { category: 'soft_skills', name: 'Critical Thinking', subcategory: 'problem_solving', level: 3, description: 'Analysis, evaluation, logical reasoning, evidence-based decisions' },
  { category: 'soft_skills', name: 'Problem Solving', subcategory: 'problem_solving', level: 2, description: 'Root cause analysis, creative solutions, systematic approach' },
  { category: 'soft_skills', name: 'Adaptability', subcategory: 'personal', level: 2, description: 'Flexibility in changing environments, learning agility' },
  { category: 'soft_skills', name: 'Time Management', subcategory: 'personal', level: 2, description: 'Prioritization, deadline management, efficiency optimization' },
  { category: 'soft_skills', name: 'Creativity', subcategory: 'personal', level: 3, description: 'Innovative thinking, brainstorming, design thinking' },
  { category: 'soft_skills', name: 'Attention to Detail', subcategory: 'personal', level: 2, description: 'Accuracy, thoroughness, quality consciousness' },
  { category: 'soft_skills', name: 'Work Ethic', subcategory: 'personal', level: 1, description: 'Reliability, dedication, accountability, professionalism' },
  { category: 'soft_skills', name: 'Stress Management', subcategory: 'personal', level: 3, description: 'Resilience, composure under pressure, coping strategies' },
  { category: 'soft_skills', name: 'Cultural Awareness', subcategory: 'interpersonal', level: 3, description: 'Cross-cultural communication, inclusivity, global mindset' },
  { category: 'soft_skills', name: 'Mentoring', subcategory: 'leadership', level: 3, description: 'Guiding others, knowledge sharing, career development support' },
  { category: 'soft_skills', name: 'Networking', subcategory: 'interpersonal', level: 3, description: 'Building professional relationships, industry connections' },
  { category: 'soft_skills', name: 'Customer Focus', subcategory: 'interpersonal', level: 2, description: 'Understanding needs, service orientation, stakeholder management' },
];

export const managementSkills: Skill[] = [
  { category: 'management', name: 'Strategic Planning', subcategory: 'strategy', level: 4, description: 'Long-term vision, goal setting, resource allocation, roadmapping' },
  { category: 'management', name: 'People Management', subcategory: 'leadership', level: 3, description: 'Hiring, developing, motivating, and retaining team members' },
  { category: 'management', name: 'Performance Management', subcategory: 'leadership', level: 3, description: 'Goal setting, feedback, reviews, coaching, PIPs' },
  { category: 'management', name: 'Budget Management', subcategory: 'operations', level: 4, description: 'Financial planning, cost control, ROI analysis, forecasting' },
  { category: 'management', name: 'Project Management', subcategory: 'operations', level: 3, description: 'Scrum, Kanban, waterfall, risk management, stakeholder communication' },
  { category: 'management', name: 'Change Management', subcategory: 'strategy', level: 4, description: 'Transformation planning, stakeholder buy-in, communication strategy' },
  { category: 'management', name: 'Decision Making', subcategory: 'strategy', level: 3, description: 'Data-driven decisions, risk assessment, trade-off analysis' },
  { category: 'management', name: 'Delegation', subcategory: 'leadership', level: 3, description: 'Task assignment, empowerment, accountability, trust building' },
  { category: 'management', name: 'Stakeholder Management', subcategory: 'operations', level: 3, description: 'Expectation setting, influence mapping, communication plans' },
  { category: 'management', name: 'Team Building', subcategory: 'leadership', level: 3, description: 'Culture creation, engagement, diversity, team dynamics' },
  { category: 'management', name: 'Executive Communication', subcategory: 'strategy', level: 4, description: 'Board presentations, executive briefings, strategic narratives' },
  { category: 'management', name: 'Vendor Management', subcategory: 'operations', level: 3, description: 'Contract negotiation, SLA monitoring, relationship management' },
  { category: 'management', name: 'Risk Management', subcategory: 'operations', level: 4, description: 'Risk identification, mitigation planning, contingency strategies' },
  { category: 'management', name: 'Innovation Leadership', subcategory: 'strategy', level: 4, description: 'Fostering innovation culture, R&D direction, IP strategy' },
  { category: 'management', name: 'Organizational Design', subcategory: 'strategy', level: 5, description: 'Structure optimization, role design, span of control, matrix orgs' },
];

export const certifications: Skill[] = [
  { category: 'certification', name: 'PMP', subcategory: 'project_management', level: 4, description: 'Project Management Professional - PMI certified' },
  { category: 'certification', name: 'PRINCE2', subcategory: 'project_management', level: 4, description: 'Projects IN Controlled Environments methodology' },
  { category: 'certification', name: 'Scrum Master (CSM)', subcategory: 'agile', level: 3, description: 'Certified Scrum Master - Scrum Alliance' },
  { category: 'certification', name: 'SAFe Agilist', subcategory: 'agile', level: 4, description: 'Scaled Agile Framework enterprise agility' },
  { category: 'certification', name: 'AWS Solutions Architect', subcategory: 'cloud', level: 4, description: 'AWS architecture best practices and services' },
  { category: 'certification', name: 'AWS Developer Associate', subcategory: 'cloud', level: 3, description: 'AWS application development and deployment' },
  { category: 'certification', name: 'Azure Solutions Architect', subcategory: 'cloud', level: 4, description: 'Microsoft Azure infrastructure and solutions' },
  { category: 'certification', name: 'Google Cloud Professional', subcategory: 'cloud', level: 4, description: 'GCP architecture and services expertise' },
  { category: 'certification', name: 'CPA', subcategory: 'finance', level: 4, description: 'Certified Public Accountant - accounting expertise' },
  { category: 'certification', name: 'CFA', subcategory: 'finance', level: 5, description: 'Chartered Financial Analyst - investment management' },
  { category: 'certification', name: 'SHRM-CP', subcategory: 'hr', level: 3, description: 'Society for Human Resource Management Certified Professional' },
  { category: 'certification', name: 'SHRM-SCP', subcategory: 'hr', level: 4, description: 'SHRM Senior Certified Professional' },
  { category: 'certification', name: 'PHR', subcategory: 'hr', level: 3, description: 'Professional in Human Resources - HRCI' },
  { category: 'certification', name: 'SPHR', subcategory: 'hr', level: 4, description: 'Senior Professional in Human Resources - HRCI' },
  { category: 'certification', name: 'CISSP', subcategory: 'security', level: 5, description: 'Certified Information Systems Security Professional' },
  { category: 'certification', name: 'CISM', subcategory: 'security', level: 4, description: 'Certified Information Security Manager' },
  { category: 'certification', name: 'CompTIA Security+', subcategory: 'security', level: 3, description: 'Foundational cybersecurity certification' },
  { category: 'certification', name: 'Six Sigma Green Belt', subcategory: 'quality', level: 3, description: 'Process improvement and quality management' },
  { category: 'certification', name: 'Six Sigma Black Belt', subcategory: 'quality', level: 4, description: 'Advanced process improvement and team leadership' },
  { category: 'certification', name: 'ITIL Foundation', subcategory: 'it_service', level: 3, description: 'IT service management best practices' },
  { category: 'certification', name: 'Kubernetes CKA', subcategory: 'cloud', level: 4, description: 'Certified Kubernetes Administrator' },
  { category: 'certification', name: 'Terraform Associate', subcategory: 'cloud', level: 3, description: 'HashiCorp infrastructure as code certification' },
  { category: 'certification', name: 'TOGAF', subcategory: 'architecture', level: 4, description: 'The Open Group Architecture Framework' },
  { category: 'certification', name: 'Data Engineering Professional', subcategory: 'data', level: 4, description: 'Google Cloud data engineering certification' },
  { category: 'certification', name: 'Tableau Desktop Specialist', subcategory: 'data', level: 3, description: 'Data visualization and business intelligence' },
];

export const proficiencyLevels = {
  1: { name: 'Beginner', description: 'Basic awareness and limited practical experience' },
  2: { name: 'Intermediate', description: 'Working knowledge, can apply with some guidance' },
  3: { name: 'Advanced', description: 'Deep understanding, can work independently and mentor others' },
  4: { name: 'Expert', description: 'Comprehensive mastery, recognized as go-to resource' },
  5: { name: 'Thought Leader', description: 'Industry recognition, shapes best practices and standards' },
};

export const skillsTaxonomy: Skill[] = [
  ...technicalSkills,
  ...softSkills,
  ...managementSkills,
  ...certifications,
];

export async function seed(prisma: PrismaClient): Promise<void> {
  console.log('Seeding skills taxonomy...');

  for (const skill of skillsTaxonomy) {
    const key = `${skill.category}_${skill.name}`;
    await prisma.skill.upsert({
      where: { key },
      update: {
        category: skill.category,
        name: skill.name,
        subcategory: skill.subcategory ?? null,
        level: skill.level,
        description: skill.description,
      },
      create: {
        key,
        category: skill.category,
        name: skill.name,
        subcategory: skill.subcategory ?? null,
        level: skill.level,
        description: skill.description,
      },
    });
  }

  console.log(`Seeded ${skillsTaxonomy.length} skills across ${new Set(skillsTaxonomy.map(s => s.category)).size} categories.`);
}
