// Career Planning Module - Sample Data

import {
  CareerLadder, EmployeeCareerPath, MobilityOpportunity, MobilityApplication, MobilityPreference,
  SuccessionPlan, CareerGoal, DevelopmentDiscussion, CareerAspiration, MentorshipRequest,
  SkillAssessment, LearningPathway, CareerSettings, CareerLevel
} from './types';

// ============================================================================
// CAREER LADDERS SAMPLE DATA
// ============================================================================

const softwareEngineerLevels: CareerLevel[] = [
  {
    levelId: 'se-level-1',
    levelNumber: 1,
    levelName: 'Junior Software Engineer',
    jobTitle: 'Junior Software Engineer',
    gradeLevel: 'IC1',
    salaryRange: { currency: 'USD', minimum: 70000, midpoint: 80000, maximum: 90000 },
    description: 'Entry-level software engineer learning fundamentals',
    responsibilities: [
      'Write clean, maintainable code under supervision',
      'Participate in code reviews',
      'Learn company tech stack and best practices',
      'Fix bugs and implement small features',
    ],
    requiredSkills: [
      { skillId: 's1', skillName: 'JavaScript', skillCategory: 'Programming', requiredProficiency: 'intermediate', isCritical: true },
      { skillId: 's2', skillName: 'Git', skillCategory: 'Tools', requiredProficiency: 'beginner', isCritical: true },
      { skillId: 's3', skillName: 'Problem Solving', skillCategory: 'Soft Skills', requiredProficiency: 'intermediate', isCritical: false },
    ],
    requiredExperience: { minimumYears: 0, maximumYears: 2 },
    requiredEducation: [{ level: 'bachelor', field: 'Computer Science', isRequired: false, alternatives: ['Self-taught', 'Bootcamp'] }],
    typicalDuration: 18,
    promotionCriteria: {
      minimumTimeInLevel: 12,
      performanceRatingRequired: 3,
      skillsAssessmentRequired: true,
      leadershipApprovalRequired: true,
    },
    nextLevel: 'se-level-2',
  },
  {
    levelId: 'se-level-2',
    levelNumber: 2,
    levelName: 'Software Engineer',
    jobTitle: 'Software Engineer',
    gradeLevel: 'IC2',
    salaryRange: { currency: 'USD', minimum: 90000, midpoint: 110000, maximum: 130000 },
    description: 'Competent engineer delivering features independently',
    responsibilities: [
      'Deliver features independently',
      'Mentor junior engineers',
      'Participate in technical design',
      'Own small to medium projects',
    ],
    requiredSkills: [
      { skillId: 's1', skillName: 'JavaScript', skillCategory: 'Programming', requiredProficiency: 'advanced', isCritical: true },
      { skillId: 's4', skillName: 'System Design', skillCategory: 'Architecture', requiredProficiency: 'intermediate', isCritical: true },
      { skillId: 's5', skillName: 'Testing', skillCategory: 'Quality', requiredProficiency: 'intermediate', isCritical: true },
    ],
    requiredExperience: { minimumYears: 2, maximumYears: 5 },
    requiredEducation: [{ level: 'bachelor', isRequired: false }],
    typicalDuration: 24,
    promotionCriteria: {
      minimumTimeInLevel: 18,
      performanceRatingRequired: 4,
      skillsAssessmentRequired: true,
      leadershipApprovalRequired: true,
      additionalCriteria: ['Lead at least 2 projects successfully'],
    },
    previousLevel: 'se-level-1',
    nextLevel: 'se-level-3',
  },
  {
    levelId: 'se-level-3',
    levelNumber: 3,
    levelName: 'Senior Software Engineer',
    jobTitle: 'Senior Software Engineer',
    gradeLevel: 'IC3',
    salaryRange: { currency: 'USD', minimum: 130000, midpoint: 160000, maximum: 190000 },
    description: 'Expert engineer leading technical initiatives',
    responsibilities: [
      'Lead complex technical projects',
      'Mentor and guide team members',
      'Define technical standards',
      'Drive architectural decisions',
    ],
    requiredSkills: [
      { skillId: 's1', skillName: 'JavaScript', skillCategory: 'Programming', requiredProficiency: 'expert', isCritical: true },
      { skillId: 's4', skillName: 'System Design', skillCategory: 'Architecture', requiredProficiency: 'advanced', isCritical: true },
      { skillId: 's6', skillName: 'Leadership', skillCategory: 'Soft Skills', requiredProficiency: 'intermediate', isCritical: true },
    ],
    requiredExperience: { minimumYears: 5, maximumYears: 8 },
    requiredEducation: [{ level: 'bachelor', isRequired: false }],
    typicalDuration: 36,
    promotionCriteria: {
      minimumTimeInLevel: 24,
      performanceRatingRequired: 4,
      skillsAssessmentRequired: true,
      leadershipApprovalRequired: true,
      additionalCriteria: ['Demonstrate technical leadership', 'Impact beyond immediate team'],
    },
    previousLevel: 'se-level-2',
    nextLevel: 'se-level-4',
  },
];

export const sampleCareerLadders: CareerLadder[] = [
  {
    ladderId: 'ladder-001',
    ladderName: 'Software Engineering Career Path',
    department: 'Engineering',
    description: 'Technical career progression for software engineers',
    jobFamily: 'Engineering',
    levels: softwareEngineerLevels,
    competencyFramework: 'Technical Competency Framework v2.0',
    isActive: true,
    createdBy: 'hr-admin',
    createdDate: new Date('2024-01-15'),
    updatedDate: new Date('2024-06-01'),
  },
];

export const sampleEmployeeCareerPaths: EmployeeCareerPath[] = [
  {
    pathId: 'path-001',
    employeeId: 'emp-001',
    employeeName: 'Alice Johnson',
    currentLevel: softwareEngineerLevels[1],
    targetLevel: softwareEngineerLevels[2],
    ladderId: 'ladder-001',
    ladderName: 'Software Engineering Career Path',
    progression: [
      {
        levelId: 'se-level-1',
        levelName: 'Junior Software Engineer',
        startDate: new Date('2022-06-01'),
        endDate: new Date('2023-12-01'),
        achievements: ['Completed onboarding', 'Delivered 15 features', 'Improved test coverage by 20%'],
        performanceRatings: [3.5, 4.0],
        skillsDeveloped: ['React', 'TypeScript', 'Testing'],
      },
      {
        levelId: 'se-level-2',
        levelName: 'Software Engineer',
        startDate: new Date('2023-12-01'),
        achievements: ['Led authentication redesign', 'Mentored 2 junior engineers'],
        performanceRatings: [4.2],
        skillsDeveloped: ['System Design', 'Mentoring'],
      },
    ],
    currentGaps: [
      {
        gapId: 'gap-001',
        skillId: 's4',
        skillName: 'System Design',
        currentProficiency: 'intermediate',
        requiredProficiency: 'advanced',
        priority: 'high',
        developmentActions: [
          {
            actionId: 'action-001',
            actionType: 'training',
            actionName: 'System Design Course',
            description: 'Complete advanced system design course',
            provider: 'LinkedIn Learning',
            duration: 40,
            status: 'in_progress',
          },
        ],
        status: 'in_progress',
      },
    ],
    developmentPlan: 'Focus on system design and technical leadership',
    estimatedTimeToPromotion: 12,
    readinessScore: 72,
    lastAssessmentDate: new Date('2024-11-01'),
    nextReviewDate: new Date('2025-02-01'),
  },
];

// ============================================================================
// INTERNAL MOBILITY SAMPLE DATA
// ============================================================================

export const sampleMobilityOpportunities: MobilityOpportunity[] = [
  {
    opportunityId: 'opp-001',
    opportunityType: 'vertical',
    positionId: 'pos-001',
    jobTitle: 'Senior Product Manager',
    department: 'Product',
    location: 'San Francisco, CA',
    hiringManager: 'Sarah Williams',
    description: 'Lead product strategy for our enterprise platform',
    responsibilities: [
      'Define product roadmap and strategy',
      'Work with engineering to deliver features',
      'Conduct market research and competitive analysis',
      'Manage stakeholder expectations',
    ],
    qualifications: [
      { qualificationId: 'q1', qualificationType: 'experience', requirement: 'Product management', isRequired: true, yearsRequired: 5 },
      { qualificationId: 'q2', qualificationType: 'skill', requirement: 'Data analysis', isRequired: true },
      { qualificationId: 'q3', qualificationType: 'education', requirement: 'MBA', isRequired: false, alternatives: ['Equivalent experience'] },
    ],
    preferredSkills: ['SQL', 'User research', 'A/B testing', 'Agile'],
    salaryRange: { currency: 'USD', minimum: 140000, midpoint: 170000, maximum: 200000 },
    applicationDeadline: new Date('2025-01-15'),
    startDate: new Date('2025-02-01'),
    numberOfOpenings: 1,
    status: 'open',
    postedDate: new Date('2024-12-01'),
    postedBy: 'hr-recruiter',
    isInternalOnly: true,
    requiresRelocation: false,
  },
  {
    opportunityId: 'opp-002',
    opportunityType: 'horizontal',
    positionId: 'pos-002',
    jobTitle: 'Data Scientist',
    department: 'Analytics',
    location: 'Remote',
    hiringManager: 'Michael Chen',
    description: 'Build ML models to improve customer experience',
    responsibilities: [
      'Develop predictive models',
      'Analyze large datasets',
      'Collaborate with product teams',
      'Present findings to stakeholders',
    ],
    qualifications: [
      { qualificationId: 'q4', qualificationType: 'education', requirement: 'Masters in Statistics/CS', isRequired: true },
      { qualificationId: 'q5', qualificationType: 'skill', requirement: 'Python', isRequired: true },
      { qualificationId: 'q6', qualificationType: 'skill', requirement: 'Machine Learning', isRequired: true },
    ],
    preferredSkills: ['TensorFlow', 'PyTorch', 'SQL', 'R'],
    applicationDeadline: new Date('2025-01-20'),
    startDate: new Date('2025-02-15'),
    numberOfOpenings: 2,
    status: 'open',
    postedDate: new Date('2024-12-05'),
    postedBy: 'hr-recruiter',
    isInternalOnly: false,
    requiresRelocation: false,
  },
];

export const sampleMobilityApplications: MobilityApplication[] = [
  {
    applicationId: 'app-001',
    opportunityId: 'opp-001',
    opportunityTitle: 'Senior Product Manager',
    employeeId: 'emp-002',
    employeeName: 'Bob Martinez',
    currentPosition: 'Product Manager',
    currentDepartment: 'Product',
    applicationDate: new Date('2024-12-08'),
    motivation: 'I am excited to take on more responsibility and lead product strategy for the enterprise platform',
    relevantExperience: [
      'Led product launch for 3 major features',
      '4 years of product management experience',
      'Managed cross-functional teams of 10+ people',
    ],
    relevantSkills: ['Product Strategy', 'Roadmap Planning', 'Stakeholder Management', 'Data Analysis'],
    managerEndorsement: {
      endorsedBy: 'mgr-001',
      endorsedByName: 'Jennifer Lee',
      endorsementDate: new Date('2024-12-10'),
      isEndorsed: true,
      comments: 'Bob is ready for this next step and would excel in this role',
      supportRelease: true,
      releaseDate: new Date('2025-02-01'),
    },
    applicationStatus: 'under_review',
  },
];

export const sampleMobilityPreferences: MobilityPreference[] = [
  {
    preferenceId: 'pref-001',
    employeeId: 'emp-003',
    employeeName: 'Carol Davis',
    preferredDepartments: ['Product', 'Engineering', 'Design'],
    preferredLocations: ['San Francisco, CA', 'Remote'],
    preferredMobilityTypes: ['vertical', 'horizontal'],
    willingToRelocate: false,
    preferredRoles: ['Senior Engineer', 'Tech Lead', 'Engineering Manager'],
    availabilityDate: new Date('2025-03-01'),
    mobilityReadiness: 'ready',
    careerInterests: ['Technical Leadership', 'Product Development', 'Team Management'],
    developmentNeeds: ['Leadership Training', 'People Management'],
    lastUpdatedDate: new Date('2024-12-01'),
  },
];

export const sampleSuccessionPlans: SuccessionPlan[] = [
  {
    planId: 'plan-001',
    criticalPosition: 'VP of Engineering',
    department: 'Engineering',
    incumbentId: 'emp-vp-001',
    incumbentName: 'David Thompson',
    retirementRisk: 'medium',
    expectedVacancyDate: new Date('2026-06-01'),
    successors: [
      {
        successorId: 'succ-001',
        employeeId: 'emp-004',
        employeeName: 'Emma Wilson',
        currentPosition: 'Director of Engineering',
        readinessLevel: '1_year',
        readinessScore: 85,
        strengths: ['Technical expertise', 'Team leadership', 'Strategic thinking'],
        developmentNeeds: ['Executive presence', 'Board presentations'],
        developmentPlan: [
          {
            actionId: 'dp-001',
            actionType: 'coaching',
            actionName: 'Executive Coaching',
            description: '6-month executive coaching program',
            duration: 180,
            status: 'in_progress',
          },
        ],
        isEmergencyBackup: true,
        lastAssessmentDate: new Date('2024-11-15'),
      },
    ],
    developmentPipeline: [
      {
        pipelineId: 'pipe-001',
        levelName: 'Engineering Manager',
        targetCount: 5,
        currentCount: 6,
        candidates: [
          {
            employeeId: 'emp-005',
            employeeName: 'Frank Rodriguez',
            currentLevel: 'Senior Engineer',
            potentialRating: 'high',
            performanceRating: 4.5,
            readinessTimeframe: '6-12 months',
          },
        ],
      },
    ],
    riskMitigation: ['Cross-training key leaders', 'Knowledge documentation', 'Mentorship programs'],
    lastReviewDate: new Date('2024-10-01'),
    nextReviewDate: new Date('2025-01-01'),
    status: 'active',
  },
];

// ============================================================================
// CAREER GOALS SAMPLE DATA
// ============================================================================

export const sampleCareerGoals: CareerGoal[] = [
  {
    goalId: 'goal-001',
    employeeId: 'emp-006',
    employeeName: 'Grace Kim',
    goalType: 'promotion',
    goalTitle: 'Become Senior Software Engineer',
    description: 'Advance to senior engineer role within the next 12 months',
    targetPosition: 'Senior Software Engineer',
    targetDate: new Date('2025-12-01'),
    priority: 'high',
    alignedToCompanyGoals: true,
    companyGoalAlignment: 'Building technical leadership pipeline',
    milestones: [
      {
        milestoneId: 'm1',
        milestoneName: 'Complete System Design Course',
        description: 'Finish advanced system design training',
        targetDate: new Date('2025-03-01'),
        status: 'in_progress',
        successMetrics: ['Course completion certificate', 'Apply learnings to current project'],
      },
      {
        milestoneId: 'm2',
        milestoneName: 'Lead Major Project',
        description: 'Successfully lead end-to-end delivery of critical feature',
        targetDate: new Date('2025-08-01'),
        status: 'not_started',
        successMetrics: ['On-time delivery', 'Positive stakeholder feedback'],
      },
    ],
    requiredActions: [
      {
        actionId: 'act-001',
        actionType: 'training',
        actionName: 'System Design Mastery',
        description: 'Complete system design course',
        provider: 'Educative',
        duration: 40,
        startDate: new Date('2024-12-01'),
        status: 'in_progress',
      },
    ],
    progressPercentage: 35,
    status: 'in_progress',
    managerSupport: true,
    managerId: 'mgr-002',
    managerName: 'Henry Park',
    managerFeedback: 'Grace is on track. Encourage her to take more ownership of technical decisions.',
    resources: [
      {
        resourceId: 'res-001',
        resourceType: 'training',
        resourceName: 'Learning budget',
        description: '$1000 allocated for training',
        allocated: true,
        allocationDate: new Date('2024-11-01'),
        cost: 1000,
      },
    ],
    successCriteria: [
      'Demonstrate advanced system design skills',
      'Lead at least one major project',
      'Mentor 2+ junior engineers',
      'Positive peer feedback',
    ],
    createdDate: new Date('2024-11-01'),
    lastUpdatedDate: new Date('2024-12-10'),
  },
];

export const sampleDevelopmentDiscussions: DevelopmentDiscussion[] = [
  {
    discussionId: 'disc-001',
    employeeId: 'emp-006',
    employeeName: 'Grace Kim',
    managerId: 'mgr-002',
    managerName: 'Henry Park',
    discussionDate: new Date('2024-12-01'),
    discussionType: 'quarterly_review',
    topics: ['Career progression', 'Skill development', 'Current projects'],
    careerGoalsDiscussed: ['Promotion to Senior Engineer'],
    strengthsIdentified: ['Technical skills', 'Problem-solving', 'Team collaboration'],
    areasForDevelopment: ['System design', 'Technical leadership', 'Communication'],
    actionItems: [
      {
        itemId: 'ai-001',
        action: 'Enroll in system design course',
        owner: 'employee',
        dueDate: new Date('2024-12-15'),
        status: 'completed',
        completionDate: new Date('2024-12-10'),
      },
      {
        itemId: 'ai-002',
        action: 'Assign Grace to lead Q1 project',
        owner: 'manager',
        dueDate: new Date('2025-01-01'),
        status: 'in_progress',
      },
    ],
    managerCommitments: ['Provide regular feedback', 'Create leadership opportunities'],
    employeeCommitments: ['Complete training', 'Seek mentorship', 'Take on stretch assignments'],
    nextDiscussionDate: new Date('2025-03-01'),
    summary: 'Grace is performing well and ready for more responsibility. Focus on system design and leadership.',
    participantFeedback: [
      {
        participant: 'employee',
        rating: 5,
        comments: 'Very productive discussion. Clear action items.',
        followUpNeeded: false,
      },
    ],
  },
];

// ============================================================================
// ASPIRATIONS SAMPLE DATA
// ============================================================================

export const sampleCareerAspirations: CareerAspiration[] = [
  {
    aspirationId: 'asp-001',
    employeeId: 'emp-007',
    employeeName: 'Isabella Torres',
    aspirationType: 'role',
    aspirationTitle: 'Become a CTO',
    description: 'I aspire to become a CTO of a technology company and drive technical vision',
    dreamRole: 'Chief Technology Officer',
    desiredSkills: ['Executive Leadership', 'Strategic Planning', 'Business Acumen', 'Public Speaking'],
    desiredExperience: ['Running engineering org of 100+', 'Technology strategy', 'Board presentations'],
    timeframe: '5_years',
    isSharedWithManager: true,
    managerFeedback: 'Isabella has the potential. Focus on building broader business understanding.',
    alignmentScore: 75,
    feasibilityScore: 70,
    pathwayRecommendations: [
      {
        recommendationId: 'rec-001',
        pathway: 'Engineering Leadership Track',
        description: 'Progress through engineering management roles',
        estimatedDuration: 60,
        steps: [
          {
            stepNumber: 1,
            stepName: 'Engineering Manager',
            description: 'Lead a team of 5-8 engineers',
            duration: 18,
            resources: ['Management training', 'Executive coach'],
            milestones: ['Build high-performing team', 'Deliver major initiatives'],
          },
          {
            stepNumber: 2,
            stepName: 'Senior Engineering Manager',
            description: 'Lead multiple teams (15-20 engineers)',
            duration: 24,
            resources: ['Leadership development program'],
            milestones: ['Scale organization', 'Drive strategic initiatives'],
          },
          {
            stepNumber: 3,
            stepName: 'Director of Engineering',
            description: 'Lead department (40+ engineers)',
            duration: 18,
            resources: ['Executive MBA (optional)'],
            milestones: ['Department transformation', 'Cross-functional leadership'],
          },
        ],
        requiredInvestment: 'Time commitment, possible MBA',
        successProbability: 70,
      },
    ],
    relatedOpportunities: ['Engineering Manager opening', 'Technical Lead position'],
    inspirations: ['Current CTO journey', 'Tech leaders blog'],
    barriers: [
      {
        barrierId: 'bar-001',
        barrierType: 'experience_gap',
        description: 'Limited people management experience',
        severity: 'high',
        mitigationPlan: 'Start leading projects, mentor others, take management training',
        supportRequired: ['Manager support', 'Mentorship', 'Training budget'],
        status: 'addressing',
      },
    ],
    supportNeeded: ['Mentorship from current executives', 'Leadership training', 'Stretch assignments'],
    createdDate: new Date('2024-11-01'),
    lastUpdatedDate: new Date('2024-12-05'),
    status: 'planning',
  },
];

export const sampleMentorshipRequests: MentorshipRequest[] = [
  {
    requestId: 'mentor-001',
    menteeId: 'emp-008',
    menteeName: 'Jack Anderson',
    menteePosition: 'Product Manager',
    desiredMentorProfile: {
      preferredSeniority: ['Senior PM', 'Director', 'VP'],
      preferredExpertise: ['Product Strategy', 'Enterprise Products', 'B2B SaaS'],
      preferredDepartments: ['Product'],
    },
    areasForGuidance: ['Product strategy', 'Stakeholder management', 'Career progression'],
    careerAspirations: ['Senior Product Manager', 'Product Director'],
    preferredMeetingFrequency: 'bi_weekly',
    commitmentDuration: 6,
    matchedMentorId: 'emp-mentor-001',
    matchedMentorName: 'Karen Liu',
    matchDate: new Date('2024-12-01'),
    status: 'active',
    requestDate: new Date('2024-11-20'),
  },
];

export const sampleSkillAssessments: SkillAssessment[] = [
  {
    assessmentId: 'assess-001',
    employeeId: 'emp-006',
    employeeName: 'Grace Kim',
    assessmentDate: new Date('2024-11-15'),
    assessmentType: '360_assessment',
    skills: [
      {
        skillId: 's1',
        skillName: 'JavaScript',
        skillCategory: 'Programming',
        currentProficiency: 'advanced',
        proficiencyScore: 85,
        evidence: ['Code reviews', 'Completed projects'],
        validatedBy: 'manager',
        validationDate: new Date('2024-11-15'),
      },
      {
        skillId: 's4',
        skillName: 'System Design',
        skillCategory: 'Architecture',
        currentProficiency: 'intermediate',
        targetProficiency: 'advanced',
        proficiencyScore: 65,
        improvementPlan: ['Complete advanced course', 'Design next major feature'],
      },
    ],
    overallScore: 75,
    strengthAreas: ['Coding', 'Problem-solving', 'Collaboration'],
    developmentAreas: ['System design', 'Technical leadership'],
    recommendations: ['Take system design course', 'Lead technical initiatives', 'Mentor junior engineers'],
    linkedToGoals: ['goal-001'],
    nextAssessmentDate: new Date('2025-05-15'),
  },
];

export const sampleLearningPathways: LearningPathway[] = [
  {
    pathwayId: 'pathway-001',
    pathwayName: 'Engineering Leadership Development',
    description: 'Comprehensive pathway to develop engineering leadership skills',
    targetRole: 'Engineering Manager',
    targetSkills: ['People Management', 'Technical Leadership', 'Communication', 'Strategy'],
    duration: 6,
    difficulty: 'intermediate',
    modules: [
      {
        moduleId: 'mod-001',
        moduleName: 'Fundamentals of Engineering Management',
        description: 'Core concepts of managing engineering teams',
        moduleType: 'course',
        provider: 'LinkedIn Learning',
        duration: 12,
        orderNumber: 1,
        isRequired: true,
        completionCriteria: ['Complete all lessons', 'Pass quiz'],
        resources: ['Course materials', 'Case studies'],
      },
      {
        moduleId: 'mod-002',
        moduleName: 'Leading Technical Projects',
        description: 'Hands-on project leadership experience',
        moduleType: 'project',
        duration: 160,
        orderNumber: 2,
        isRequired: true,
        completionCriteria: ['Lead end-to-end project', 'Stakeholder approval'],
        resources: ['Project template', 'Mentorship'],
      },
    ],
    estimatedCost: 500,
    estimatedTimeCommitment: 5,
    enrolledEmployees: 24,
    completionRate: 68,
    averageRating: 4.6,
    isRecommended: true,
    createdBy: 'l-d-team',
    createdDate: new Date('2024-06-01'),
    lastUpdatedDate: new Date('2024-11-01'),
    status: 'active',
  },
];

// ============================================================================
// SETTINGS SAMPLE DATA
// ============================================================================

export const sampleCareerSettings: CareerSettings = {
  settingsId: 'settings-001',
  enableCareerLadders: true,
  enableInternalMobility: true,
  enableMentorship: true,
  requireManagerApprovalForMobility: true,
  minimumTenureForMobility: 6,
  noticePeriodrequired: 2,
  allowCrossDepartmentMobility: true,
  allowCrossLocationMobility: true,
  enableSuccessionPlanning: true,
  enableSkillAssessments: true,
  assessmentFrequency: 12,
  enableCareerGoals: true,
  maxActiveGoalsPerEmployee: 5,
  goalReviewFrequency: 3,
  lastUpdatedDate: new Date('2024-11-01'),
  lastUpdatedBy: 'hr-admin',
};
