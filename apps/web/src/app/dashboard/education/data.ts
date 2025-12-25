import type {
  FacultyMember, TenureApplication, ResearchGrant, AdjunctFaculty, AdjunctContract,
  AdjunctPool, EducationSettings
} from './types';

// Sample Faculty Members
export const sampleFacultyMembers: FacultyMember[] = [
  {
    facultyId: 'faculty-1',
    employeeId: 'emp-1001',
    facultyName: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@university.edu',
    department: 'Computer Science',
    college: 'College of Engineering',
    rank: 'associate_professor',
    tenureStatus: 'tenured',
    appointmentType: 'tenured',
    hireDate: '2015-08-15',
    tenureEligibilityDate: '2021-08-15',
    tenureApplicationDate: '2020-09-01',
    tenureDecisionDate: '2021-03-15',
    teachingLoad: {
      currentSemester: {
        semester: 'Spring',
        year: 2025,
        courses: [
          {
            courseId: 'cs101-01',
            courseCode: 'CS 101',
            courseName: 'Introduction to Programming',
            credits: 3,
            enrollmentCount: 85,
            semester: 'Spring',
            year: 2025,
            role: 'primary_instructor'
          },
          {
            courseId: 'cs450-01',
            courseCode: 'CS 450',
            courseName: 'Machine Learning',
            credits: 3,
            enrollmentCount: 35,
            semester: 'Spring',
            year: 2025,
            role: 'primary_instructor'
          }
        ],
        totalCredits: 6,
        studentCount: 120
      },
      annualLoad: 18,
      courseHistory: [],
      studentEvaluationAverage: 4.6
    },
    researchActivities: [
      {
        activityId: 'research-1',
        activityType: 'grant',
        title: 'AI in Healthcare Applications',
        description: 'Research on machine learning applications for medical diagnosis',
        startDate: '2023-01-01',
        endDate: '2025-12-31',
        role: 'principal',
        funding: 350000,
        fundingSource: 'NSF',
        status: 'active'
      }
    ],
    publications: [
      {
        publicationId: 'pub-1',
        publicationType: 'journal_article',
        title: 'Deep Learning for Medical Image Analysis',
        authors: ['Sarah Johnson', 'Michael Chen', 'Emily Rodriguez'],
        authorOrder: 1,
        venue: 'Journal of Medical Informatics',
        publicationDate: '2024-06-15',
        doi: '10.1234/jmi.2024.123',
        citations: 45,
        impactFactor: 4.2,
        peerReviewed: true,
        status: 'published'
      },
      {
        publicationId: 'pub-2',
        publicationType: 'conference_paper',
        title: 'Novel Approaches to Transfer Learning',
        authors: ['Sarah Johnson', 'David Lee'],
        authorOrder: 1,
        venue: 'International Conference on Machine Learning (ICML)',
        publicationDate: '2023-07-20',
        peerReviewed: true,
        status: 'published'
      }
    ],
    serviceActivities: [
      {
        serviceId: 'service-1',
        serviceType: 'committee',
        title: 'Curriculum Committee Member',
        description: 'Reviewing and updating CS curriculum',
        organization: 'Computer Science Department',
        role: 'Member',
        startDate: '2022-09-01',
        timeCommitment: '3 hours per week',
        level: 'departmental',
        status: 'active'
      },
      {
        serviceId: 'service-2',
        serviceType: 'advising',
        title: 'Graduate Student Advisor',
        description: 'Mentoring 6 PhD students',
        organization: 'Computer Science Department',
        role: 'Advisor',
        startDate: '2021-09-01',
        timeCommitment: '5 hours per week',
        level: 'departmental',
        status: 'active'
      }
    ],
    evaluations: [],
    awards: [
      {
        awardId: 'award-1',
        awardName: 'Excellence in Teaching Award',
        awardingOrganization: 'University',
        awardDate: '2023-05-15',
        category: 'teaching',
        level: 'university',
        monetaryValue: 5000,
        description: 'Recognized for outstanding teaching and student mentorship'
      }
    ],
    status: 'active',
    createdAt: '2015-08-15T00:00:00Z'
  },
  {
    facultyId: 'faculty-2',
    employeeId: 'emp-1002',
    facultyName: 'Dr. Michael Chen',
    email: 'michael.chen@university.edu',
    department: 'Biology',
    college: 'College of Sciences',
    rank: 'assistant_professor',
    tenureStatus: 'tenure_track',
    appointmentType: 'tenure_track',
    hireDate: '2021-08-20',
    tenureEligibilityDate: '2027-08-20',
    teachingLoad: {
      currentSemester: {
        semester: 'Spring',
        year: 2025,
        courses: [
          {
            courseId: 'bio201-01',
            courseCode: 'BIO 201',
            courseName: 'Cell Biology',
            credits: 4,
            enrollmentCount: 65,
            semester: 'Spring',
            year: 2025,
            role: 'primary_instructor'
          }
        ],
        totalCredits: 4,
        studentCount: 65
      },
      annualLoad: 12,
      courseHistory: [],
      studentEvaluationAverage: 4.3
    },
    researchActivities: [
      {
        activityId: 'research-2',
        activityType: 'publication',
        title: 'Cancer Cell Metabolism Study',
        description: 'Investigating metabolic pathways in cancer cells',
        startDate: '2022-01-01',
        role: 'principal',
        status: 'active'
      }
    ],
    publications: [
      {
        publicationId: 'pub-3',
        publicationType: 'journal_article',
        title: 'Metabolic Reprogramming in Cancer Cells',
        authors: ['Michael Chen', 'Anna Smith'],
        authorOrder: 1,
        venue: 'Nature Cell Biology',
        publicationDate: '2024-03-10',
        doi: '10.1038/ncb.2024.456',
        citations: 28,
        impactFactor: 18.5,
        peerReviewed: true,
        status: 'published'
      }
    ],
    serviceActivities: [],
    evaluations: [],
    awards: [],
    status: 'active',
    createdAt: '2021-08-20T00:00:00Z'
  }
];

// Sample Tenure Applications
export const sampleTenureApplications: TenureApplication[] = [
  {
    applicationId: 'app-1',
    facultyId: 'faculty-2',
    facultyName: 'Dr. Michael Chen',
    department: 'Biology',
    currentRank: 'assistant_professor',
    requestedRank: 'associate_professor',
    submissionDate: '2024-09-01T00:00:00Z',
    reviewDeadline: '2025-03-31',
    dossier: {
      teachingPortfolio: {
        philosophy: 'I believe in active learning and student-centered pedagogy...',
        syllabi: [
          { documentId: 'doc-1', documentType: 'syllabus', fileName: 'BIO201-syllabus.pdf', fileUrl: '/docs/bio201-syllabus.pdf', uploadDate: '2024-08-15' }
        ],
        evaluations: [4.3, 4.5, 4.4, 4.6],
        innovations: ['Flipped classroom approach', 'Integration of research into undergraduate courses']
      },
      researchPortfolio: {
        statement: 'My research focuses on understanding metabolic reprogramming in cancer cells...',
        publications: ['pub-3'],
        grants: ['grant-1'],
        presentations: [
          {
            presentationId: 'pres-1',
            title: 'Cancer Metabolism and Therapeutic Targets',
            venue: 'American Society for Cell Biology Annual Meeting',
            presentationType: 'invited',
            date: '2024-12-05',
            location: 'San Diego, CA'
          }
        ],
        collaborations: ['Collaboration with Medical School faculty on cancer research']
      },
      servicePortfolio: {
        statement: 'I am committed to service at all levels of the university...',
        activities: [],
        leadership: ['Graduate admissions committee chair'],
        mentoring: [
          {
            menteeType: 'graduate',
            menteeName: 'Jennifer Lee',
            startDate: '2022-09-01',
            outcomes: ['Published 1 paper', 'Received NSF fellowship']
          },
          {
            menteeType: 'undergraduate',
            menteeName: 'Alex Rodriguez',
            startDate: '2023-01-15',
            endDate: '2024-05-15',
            outcomes: ['Accepted to PhD program at MIT']
          }
        ]
      },
      supportingDocuments: [],
      externalReviewers: [
        {
          reviewerId: 'reviewer-1',
          name: 'Dr. Elizabeth Thompson',
          institution: 'Harvard University',
          rank: 'Professor',
          expertise: ['Cancer Biology', 'Metabolism'],
          conflictOfInterest: false,
          invitedDate: '2024-09-15',
          acceptedDate: '2024-09-20',
          submittedDate: '2024-11-10',
          letterReceived: true
        },
        {
          reviewerId: 'reviewer-2',
          name: 'Dr. James Wilson',
          institution: 'Stanford University',
          rank: 'Professor',
          expertise: ['Cell Biology', 'Biochemistry'],
          conflictOfInterest: false,
          invitedDate: '2024-09-15',
          acceptedDate: '2024-09-18',
          letterReceived: false
        }
      ]
    },
    reviewProcess: {
      stages: [
        { stageId: 'stage-1', stageName: 'Departmental Review', order: 1, startDate: '2024-10-01', status: 'completed', outcome: 'favorable' },
        { stageId: 'stage-2', stageName: 'College Review', order: 2, startDate: '2024-12-01', status: 'in_progress' },
        { stageId: 'stage-3', stageName: 'University Review', order: 3, status: 'pending' }
      ],
      currentStage: 'stage-2',
      timeline: [
        { milestoneId: 'mile-1', milestone: 'Dossier submission', dueDate: '2024-09-01', completedDate: '2024-09-01', responsible: 'Candidate', status: 'completed' },
        { milestoneId: 'mile-2', milestone: 'External reviews received', dueDate: '2024-11-15', responsible: 'Department', status: 'in_progress' },
        { milestoneId: 'mile-3', milestone: 'Final decision', dueDate: '2025-03-31', responsible: 'Provost', status: 'upcoming' }
      ],
      committees: [
        {
          committeeId: 'comm-1',
          committeeName: 'Biology Department Tenure Committee',
          committeeType: 'departmental',
          chair: 'Dr. Robert Anderson',
          members: [
            { memberId: 'mem-1', name: 'Dr. Robert Anderson', role: 'Chair', department: 'Biology' },
            { memberId: 'mem-2', name: 'Dr. Lisa Martinez', role: 'Member', department: 'Biology' },
            { memberId: 'mem-3', name: 'Dr. David Kim', role: 'Member', department: 'Biology' }
          ],
          reviewDate: '2024-10-15',
          recommendation: 'approve'
        }
      ],
      votes: [
        {
          voteId: 'vote-1',
          committeeId: 'comm-1',
          voteDate: '2024-10-15',
          votesFor: 5,
          votesAgainst: 0,
          abstentions: 0,
          recommendation: 'approve',
          summary: 'Unanimous approval from department committee'
        }
      ]
    },
    status: 'under_review',
    createdAt: '2024-08-15T00:00:00Z'
  }
];

// Sample Research Grants
export const sampleResearchGrants: ResearchGrant[] = [
  {
    grantId: 'grant-1',
    grantNumber: 'NSF-2024-12345',
    grantTitle: 'AI Applications in Healthcare Diagnostics',
    grantType: 'federal',
    fundingAgency: {
      agencyId: 'nsf-1',
      agencyName: 'National Science Foundation',
      agencyType: 'federal',
      programName: 'Computer and Information Science and Engineering',
      programOfficer: 'Dr. Amanda Rodriguez',
      contactEmail: 'arodriguez@nsf.gov'
    },
    principalInvestigator: {
      facultyId: 'faculty-1',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@university.edu',
      department: 'Computer Science',
      role: 'pi',
      effortPercentage: 25,
      responsibilities: ['Overall project management', 'Algorithm development', 'Student supervision']
    },
    coInvestigators: [
      {
        facultyId: 'faculty-med-1',
        name: 'Dr. Emily Rodriguez',
        email: 'emily.rodriguez@university.edu',
        department: 'Medicine',
        role: 'co_pi',
        effortPercentage: 15,
        responsibilities: ['Clinical validation', 'Data collection']
      }
    ],
    department: 'Computer Science',
    college: 'College of Engineering',
    submissionDate: '2023-10-15',
    startDate: '2024-01-01',
    endDate: '2026-12-31',
    duration: 36,
    requestedAmount: 500000,
    awardedAmount: 450000,
    indirectCosts: 144000,
    directCosts: 306000,
    budget: {
      totalBudget: 450000,
      directCosts: [
        {
          category: 'personnel',
          description: 'Graduate students and postdocs',
          requestedAmount: 180000,
          awardedAmount: 170000,
          spent: 85000,
          remaining: 85000,
          items: [
            { itemId: 'item-1', description: '2 PhD students @ 50% for 3 years', quantity: 2, unitCost: 45000, totalCost: 90000, fiscalYear: 2024 }
          ]
        },
        {
          category: 'equipment',
          description: 'Computing equipment',
          requestedAmount: 75000,
          awardedAmount: 60000,
          spent: 55000,
          remaining: 5000,
          items: [
            { itemId: 'item-2', description: 'GPU cluster', quantity: 1, unitCost: 50000, totalCost: 50000, fiscalYear: 2024 }
          ]
        },
        {
          category: 'travel',
          description: 'Conference travel',
          requestedAmount: 25000,
          awardedAmount: 25000,
          spent: 8000,
          remaining: 17000,
          items: []
        }
      ],
      indirectCosts: {
        rate: 48,
        base: 300000,
        total: 144000,
        rationale: 'University negotiated rate with federal government'
      },
      budgetJustification: 'Detailed justification for all budget categories...'
    },
    status: 'active',
    reviewStatus: 'approved',
    compliance: {
      irbRequired: true,
      irbApprovalNumber: 'IRB-2023-567',
      irbApprovalDate: '2023-12-01',
      iacucRequired: false,
      environmentalReview: false,
      humanSubjects: true,
      animalSubjects: false,
      exportControl: false,
      dataManagementPlan: true,
      conflictOfInterest: []
    },
    milestones: [
      {
        milestoneId: 'milestone-1',
        milestoneName: 'Complete algorithm development',
        description: 'Develop and test initial ML algorithms',
        targetDate: '2024-06-30',
        completedDate: '2024-06-15',
        status: 'completed'
      },
      {
        milestoneId: 'milestone-2',
        milestoneName: 'Clinical data collection',
        description: 'Collect 1000 patient records',
        targetDate: '2024-12-31',
        status: 'in_progress'
      },
      {
        milestoneId: 'milestone-3',
        milestoneName: 'Validation study',
        description: 'Conduct clinical validation',
        targetDate: '2025-12-31',
        status: 'not_started'
      }
    ],
    deliverables: [
      {
        deliverableId: 'deliv-1',
        deliverableType: 'report',
        title: 'Annual Progress Report Year 1',
        description: 'Progress report for first year',
        dueDate: '2025-01-31',
        status: 'pending'
      }
    ],
    financials: {
      accountNumber: 'GRANT-450-2024',
      totalAwarded: 450000,
      totalExpended: 148000,
      totalCommitted: 50000,
      availableBalance: 252000,
      expenditures: [
        {
          expenditureId: 'exp-1',
          date: '2024-02-15',
          category: 'equipment',
          description: 'GPU cluster purchase',
          amount: 50000,
          vendor: 'Dell Technologies',
          approvedBy: 'Sarah Johnson',
          fiscalYear: 2024
        },
        {
          expenditureId: 'exp-2',
          date: '2024-03-01',
          category: 'personnel',
          description: 'Graduate student stipends - Spring 2024',
          amount: 45000,
          approvedBy: 'Sarah Johnson',
          fiscalYear: 2024
        }
      ],
      invoices: [],
      reimbursements: [
        {
          reimbursementId: 'reimb-1',
          employeeId: 'emp-1001',
          employeeName: 'Dr. Sarah Johnson',
          expenseType: 'Conference Travel',
          expenseDate: '2024-07-15',
          amount: 2500,
          requestDate: '2024-07-20',
          approvalDate: '2024-07-22',
          paidDate: '2024-07-30',
          status: 'paid',
          receipts: [{ documentId: 'receipt-1', documentType: 'receipt', fileName: 'conf-receipt.pdf', fileUrl: '/receipts/conf-2024.pdf', uploadDate: '2024-07-20' }]
        }
      ]
    },
    reports: [],
    publications: ['pub-1'],
    personnel: [
      {
        personnelId: 'pers-1',
        employeeId: 'grad-1',
        name: 'Jennifer Lee',
        role: 'PhD Student',
        effortPercentage: 50,
        salary: 45000,
        benefits: 5000,
        startDate: '2024-01-01',
        status: 'active'
      }
    ],
    equipment: [
      {
        equipmentId: 'equip-1',
        equipmentName: 'GPU Computing Cluster',
        description: '8x NVIDIA A100 GPUs',
        vendor: 'Dell Technologies',
        cost: 50000,
        purchaseDate: '2024-02-15',
        serialNumber: 'DELL-GPU-2024-001',
        location: 'Engineering Lab 301',
        custodian: 'Dr. Sarah Johnson',
        status: 'operational'
      }
    ],
    createdAt: '2023-10-15T00:00:00Z'
  }
];

// Sample Adjunct Faculty
export const sampleAdjunctFaculty: AdjunctFaculty[] = [
  {
    adjunctId: 'adjunct-1',
    employeeId: 'adj-2001',
    name: 'Dr. Maria Garcia',
    email: 'maria.garcia@email.com',
    phone: '+1-555-0101',
    department: 'Business Administration',
    expertise: ['Marketing', 'Consumer Behavior', 'Digital Marketing'],
    qualifications: [
      {
        qualificationId: 'qual-1',
        qualificationType: 'degree',
        title: 'PhD in Marketing',
        institution: 'University of California',
        year: '2018',
        field: 'Marketing',
        verified: true,
        verifiedBy: 'hr-admin',
        verifiedDate: '2024-08-01',
        documentUrl: '/credentials/phd-garcia.pdf'
      },
      {
        qualificationId: 'qual-2',
        qualificationType: 'experience',
        title: '5 years as Marketing Director',
        institution: 'Tech Corp Inc.',
        year: '2019-2024',
        verified: true,
        verifiedBy: 'hr-admin',
        verifiedDate: '2024-08-01'
      }
    ],
    employmentStatus: 'active',
    contractType: 'per_course',
    contracts: ['contract-1'],
    courseHistory: [
      {
        courseId: 'mkt301-f23',
        courseCode: 'MKT 301',
        courseName: 'Marketing Principles',
        credits: 3,
        enrollmentCount: 45,
        semester: 'Fall',
        year: 2023,
        role: 'primary_instructor'
      }
    ],
    availability: {
      preferredDays: ['Tuesday', 'Thursday'],
      preferredTimes: [
        { day: 'Tuesday', startTime: '18:00', endTime: '21:00' },
        { day: 'Thursday', startTime: '18:00', endTime: '21:00' }
      ],
      maxCourses: 2,
      maxCredits: 6,
      willingToTeachOnline: true,
      campusPreferences: ['Main Campus', 'Online']
    },
    compensation: {
      rateType: 'per_course',
      baseRate: 4500,
      bonuses: [
        {
          bonusType: 'enrollment',
          amount: 500,
          reason: 'High enrollment bonus (>40 students)',
          date: '2023-12-15'
        }
      ],
      totalEarnings: 9500,
      fiscalYear: 2024
    },
    evaluations: [4.7, 4.8],
    onboardingStatus: {
      applicationSubmitted: true,
      applicationDate: '2024-06-15',
      backgroundCheckCompleted: true,
      credentialsVerified: true,
      orientationCompleted: true,
      orientationDate: '2024-08-10',
      technologyTrainingCompleted: true,
      lmsAccessGranted: true,
      facultyIdIssued: true,
      status: 'completed',
      completionDate: '2024-08-15'
    },
    professionalDevelopment: [
      {
        developmentId: 'pd-1',
        activityType: 'workshop',
        title: 'Effective Online Teaching Strategies',
        provider: 'University Teaching Center',
        completionDate: '2024-08-12',
        hoursEarned: 6,
        relevantToTeaching: true
      }
    ],
    status: 'active',
    createdAt: '2024-06-15T00:00:00Z'
  }
];

// Sample Adjunct Contracts
export const sampleAdjunctContracts: AdjunctContract[] = [
  {
    contractId: 'contract-1',
    contractNumber: 'ADJ-CON-2024-001',
    contractType: 'per_course',
    academicYear: '2024-2025',
    semester: 'Fall',
    startDate: '2024-08-20',
    endDate: '2024-12-15',
    courses: [
      {
        courseId: 'mkt301-01',
        courseCode: 'MKT 301',
        courseName: 'Marketing Principles',
        credits: 3,
        expectedEnrollment: 40,
        actualEnrollment: 47,
        schedule: {
          days: ['Tuesday', 'Thursday'],
          startTime: '18:00',
          endTime: '19:15',
          format: 'in_person'
        },
        location: 'Business Building Room 205',
        compensation: 4500
      }
    ],
    totalCompensation: 5000,
    paymentSchedule: {
      totalAmount: 5000,
      installments: [
        {
          installmentNumber: 1,
          amount: 2500,
          dueDate: '2024-10-15',
          paidDate: '2024-10-15',
          status: 'paid'
        },
        {
          installmentNumber: 2,
          amount: 2500,
          dueDate: '2024-12-15',
          status: 'pending'
        }
      ],
      paymentMethod: 'direct_deposit'
    },
    terms: {
      teachingResponsibilities: [
        'Deliver course content according to approved syllabus',
        'Hold minimum 2 office hours per week',
        'Grade all assignments within 10 business days',
        'Submit final grades by deadline'
      ],
      officeHours: 'Tuesday and Thursday, 17:00-18:00',
      assessmentRequirements: [
        'Administer midterm and final exams',
        'Provide at least 4 graded assignments'
      ],
      professionalConduct: [
        'Maintain professional demeanor',
        'Follow university policies and procedures',
        'Respect student confidentiality'
      ],
      termination: {
        noticePeriod: 30,
        conditions: ['Breach of contract', 'Low enrollment leading to course cancellation']
      },
      benefits: {
        libraryAccess: true,
        parkingPermit: true,
        facultyEmail: true,
        professionalDevelopment: true,
        healthInsurance: false,
        retirementContribution: false
      }
    },
    status: 'active',
    signedDate: '2024-07-15',
    signedBy: 'Maria Garcia',
    approvedBy: 'Department Chair',
    approvalDate: '2024-07-20',
    createdAt: '2024-07-01T00:00:00Z'
  }
];

// Sample Adjunct Pools
export const sampleAdjunctPools: AdjunctPool[] = [
  {
    poolId: 'pool-1',
    department: 'Business Administration',
    activeAdjuncts: 12,
    availableAdjuncts: 8,
    requiredCompetencies: ['MBA or PhD', 'Industry experience', 'Teaching experience'],
    shortageAreas: ['Accounting', 'Finance'],
    recruitmentNeeds: [
      {
        needId: 'need-1',
        subject: 'Accounting',
        requiredCredentials: ['CPA', 'Masters in Accounting'],
        estimatedCourses: 3,
        semester: 'Spring 2025',
        urgency: 'high',
        status: 'open'
      }
    ],
    averageHourlyRate: 125,
    budgetAllocated: 150000,
    budgetUsed: 85000
  }
];

// Sample Education Settings
export const sampleEducationSettings: EducationSettings = {
  tenureSettings: {
    probationaryPeriod: 6,
    tenureReviewTimeline: 12,
    externalReviewersRequired: 3,
    publicationMinimum: 5,
    teachingEvaluationMinimum: 3.5
  },
  grantSettings: {
    indirectCostRate: 48,
    costSharingRequired: false,
    reportingFrequency: 'quarterly',
    approvalLevels: [
      { threshold: 50000, approver: 'Department Chair', required: true },
      { threshold: 250000, approver: 'Dean', required: true },
      { threshold: 1000000, approver: 'Provost', required: true }
    ]
  },
  adjunctSettings: {
    maxCoursesPerSemester: 2,
    minQualifications: ['Masters degree in field', '2 years teaching experience'],
    defaultCompensationRate: 4500,
    backgroundCheckRequired: true,
    orientationRequired: true,
    contractRenewalNoticeDays: 60
  }
};
