// @ts-nocheck — Dev/demo seed data, intentionally loose-typed.
import type { CivilServiceGrade, SecurityClearance, PensionScheme, GovernmentSettings } from './types';

export const sampleCivilServiceGrades: CivilServiceGrade[] = [
  {
    gradeId: 'grade-001',
    employeeId: 'emp-001',
    employeeName: 'Jennifer Martinez',
    department: 'Department of Defense',
    position: 'Program Analyst',
    gradeLevel: 'GS-12',
    step: 5,
    series: '0343',
    effectiveDate: '2020-06-01',
    salaryInformation: {
      annualBaseSalary: 89033,
      locality: 'Washington-Baltimore-Arlington, DC-MD-VA-WV-PA',
      localityPayPercentage: 32.49,
      totalAnnualSalary: 117976,
      hourlyRate: 56.72,
      overtimeRate: 85.08,
      nightDifferential: 62.40
    },
    promotionEligibility: {
      eligible: true,
      minimumTimeInGrade: 52,
      timeInCurrentGrade: 54,
      nextEligibleDate: '2024-12-01',
      targetGrade: 'GS-13',
      requiredQualifications: ['52 weeks at GS-12', 'Specialized experience', 'Performance rating of Fully Successful or higher'],
      competingService: true
    },
    performanceHistory: [
      {
        recordId: 'perf-001',
        ratingPeriod: {
          startDate: '2023-10-01',
          endDate: '2024-09-30'
        },
        overallRating: 'excellent',
        criticalElements: [
          {
            elementId: 'ce-001',
            elementName: 'Program Management',
            description: 'Manages assigned programs effectively',
            rating: 'excellent',
            weight: 25,
            comments: 'Consistently exceeds expectations in program delivery'
          },
          {
            elementId: 'ce-002',
            elementName: 'Stakeholder Communication',
            description: 'Communicates effectively with stakeholders',
            rating: 'fully_successful',
            weight: 20,
            comments: 'Maintains good relationships with all stakeholders'
          },
          {
            elementId: 'ce-003',
            elementName: 'Budget Analysis',
            description: 'Analyzes and reports on program budgets',
            rating: 'excellent',
            weight: 25,
            comments: 'Exceptional analytical skills'
          },
          {
            elementId: 'ce-004',
            elementName: 'Policy Compliance',
            description: 'Ensures compliance with policies and regulations',
            rating: 'excellent',
            weight: 30,
            comments: 'Thorough understanding and implementation of policies'
          }
        ],
        performanceSummary: 'Employee consistently delivers high-quality work and demonstrates strong leadership potential.',
        supervisorId: 'sup-001',
        supervisorName: 'Robert Chen',
        reviewDate: '2024-10-15'
      }
    ],
    qualifications: [
      {
        qualificationId: 'qual-001',
        qualificationType: 'education',
        title: 'Bachelor of Science in Business Administration',
        description: 'Undergraduate degree in Business Administration',
        institution: 'University of Maryland',
        completionDate: '2015-05-15',
        verified: true,
        verifiedBy: 'HR Specialist',
        verificationDate: '2020-05-01'
      },
      {
        qualificationId: 'qual-002',
        qualificationType: 'certification',
        title: 'Project Management Professional (PMP)',
        description: 'PMI Project Management Certification',
        institution: 'Project Management Institute',
        completionDate: '2021-08-20',
        expiryDate: '2024-08-20',
        verified: true,
        verifiedBy: 'HR Specialist',
        verificationDate: '2021-09-01'
      }
    ],
    status: 'active',
    createdAt: '2020-06-01T00:00:00Z'
  }
];

export const sampleSecurityClearances: SecurityClearance[] = [
  {
    clearanceId: 'clearance-001',
    employeeId: 'emp-001',
    employeeName: 'Jennifer Martinez',
    department: 'Department of Defense',
    position: 'Program Analyst',
    clearanceLevel: 'secret',
    status: 'active',
    grantedDate: '2020-07-15',
    expiryDate: '2030-07-15',
    investigationType: {
      typeCode: 'T3',
      typeName: 'Tier 3 Investigation',
      scope: 'tier_3',
      investigationDepth: 10,
      periodicReinvestigation: 10
    },
    investigationDetails: {
      investigationId: 'inv-001',
      initiatedDate: '2020-06-01',
      completedDate: '2020-07-10',
      investigatingAgency: 'Defense Counterintelligence and Security Agency',
      investigator: 'Special Agent Smith',
      subjectInterviews: [
        {
          interviewId: 'int-001',
          interviewDate: '2020-06-15',
          interviewee: 'Jennifer Martinez',
          relationship: 'Subject',
          interviewer: 'Special Agent Smith',
          location: 'Federal Building, Washington DC',
          duration: 180,
          summary: 'Subject was cooperative and forthcoming. No derogatory information disclosed.'
        }
      ],
      referenceInterviews: [
        {
          interviewId: 'int-002',
          interviewDate: '2020-06-20',
          interviewee: 'Michael Johnson',
          relationship: 'Former Supervisor',
          interviewer: 'Investigator Jones',
          location: 'Telephone Interview',
          duration: 45,
          summary: 'Reference provided positive feedback regarding subject\'s character and trustworthiness.'
        }
      ],
      employmentVerification: [
        {
          employer: 'Acme Consulting Inc.',
          position: 'Business Analyst',
          startDate: '2015-06-01',
          endDate: '2020-05-31',
          supervisor: 'Michael Johnson',
          verified: true,
          verificationDate: '2020-06-18'
        }
      ],
      educationVerification: [
        {
          institution: 'University of Maryland',
          degree: 'Bachelor of Science',
          major: 'Business Administration',
          graduationDate: '2015-05-15',
          verified: true,
          verificationDate: '2020-06-10'
        }
      ],
      criminalHistory: {
        checkDate: '2020-06-05',
        fbiCheckCompleted: true,
        localCheckCompleted: true,
        internationalCheckCompleted: false,
        recordsFound: false
      },
      creditCheck: {
        checkDate: '2020-06-08',
        creditScore: 745,
        debtToIncomeRatio: 0.28,
        bankruptcies: 0,
        latePayments: 0,
        collections: 0,
        concernsIdentified: false
      },
      foreignContacts: [],
      findings: [],
      adjudicationDate: '2020-07-15',
      adjudicator: 'Adjudication Specialist Williams',
      adjudicationDecision: 'approved'
    },
    polygraphRequired: false,
    continuousEvaluation: {
      enrolled: true,
      enrollmentDate: '2020-07-15',
      lastReview: '2024-11-01',
      nextReview: '2025-11-01',
      alerts: [],
      status: 'clear'
    },
    accessAuthorizations: [
      {
        authorizationId: 'auth-001',
        program: 'DoD Programs',
        facility: 'Pentagon',
        grantedDate: '2020-07-15',
        accessLevel: 'Secret',
        status: 'active'
      }
    ],
    suspensionHistory: [],
    debriefRequired: true,
    createdAt: '2020-07-15T00:00:00Z'
  }
];

export const samplePensionSchemes: PensionScheme[] = [
  {
    pensionId: 'pension-001',
    employeeId: 'emp-001',
    employeeName: 'Jennifer Martinez',
    department: 'Department of Defense',
    pensionType: 'fers',
    enrollmentDate: '2020-06-01',
    serviceComputationDate: '2020-06-01',
    yearsOfService: 4.5,
    vestingStatus: 'fully_vested',
    retirementEligibility: {
      immediateRetirement: false,
      earlyRetirement: false,
      deferredRetirement: true,
      disabilityRetirement: false,
      eligibilityDetails: {
        minimumRetirementAge: 57,
        currentAge: 32,
        yearsOfServiceRequired: 30,
        currentYearsOfService: 4.5,
        eligibleDate: '2045-06-01'
      }
    },
    contributions: {
      employeeContributions: 18000,
      employerContributions: 36000,
      totalContributions: 54000,
      contributionRate: 0.08,
      yearToDateContributions: 8000,
      lifetimeContributions: 54000,
      contributionHistory: [
        {
          recordId: 'cont-001',
          year: 2024,
          period: 'Q1',
          employeeAmount: 2000,
          employerAmount: 4000,
          totalAmount: 6000,
          salary: 25000
        },
        {
          recordId: 'cont-002',
          year: 2024,
          period: 'Q2',
          employeeAmount: 2000,
          employerAmount: 4000,
          totalAmount: 6000,
          salary: 25000
        }
      ]
    },
    projections: {
      projectionDate: '2024-12-13',
      retirementDate: '2045-06-01',
      projectedAge: 57,
      projectedYearsOfService: 25,
      highThreeAverage: 135000,
      monthlyAnnuity: 2812.50,
      annualAnnuity: 33750,
      colaAdjustments: true,
      survivorBenefitSelected: true,
      survivorBenefitReduction: 281.25,
      healthBenefitsContinuation: true,
      projectionAssumptions: {
        annualSalaryIncrease: 3.0,
        inflationRate: 2.5,
        yearsToRetirement: 20.5
      }
    },
    beneficiaries: [
      {
        beneficiaryId: 'ben-001',
        beneficiaryType: 'primary',
        name: 'Carlos Martinez',
        relationship: 'Spouse',
        dateOfBirth: '1990-03-15',
        ssn: '***-**-1234',
        percentage: 100,
        address: '123 Main St, Arlington, VA 22201',
        contactInfo: 'carlos.martinez@email.com',
        designation: 'all'
      }
    ],
    thriftSavingsPlan: {
      accountNumber: 'TSP-123456789',
      enrollmentDate: '2020-06-01',
      contributionPercentage: 5,
      agencyMatching: 5,
      currentBalance: 45000,
      vested: true,
      vestingDate: '2020-06-01',
      allocation: [
        {
          fundCode: 'C',
          fundName: 'C Fund (Common Stock Index)',
          allocationPercentage: 40,
          currentValue: 18000,
          returnYTD: 12.5,
          returnLifetime: 45.2
        },
        {
          fundCode: 'S',
          fundName: 'S Fund (Small Cap Stock Index)',
          allocationPercentage: 20,
          currentValue: 9000,
          returnYTD: 14.8,
          returnLifetime: 52.3
        },
        {
          fundCode: 'I',
          fundName: 'I Fund (International Stock Index)',
          allocationPercentage: 20,
          currentValue: 9000,
          returnYTD: 8.2,
          returnLifetime: 28.7
        },
        {
          fundCode: 'F',
          fundName: 'F Fund (Fixed Income Index)',
          allocationPercentage: 15,
          currentValue: 6750,
          returnYTD: 3.5,
          returnLifetime: 12.4
        },
        {
          fundCode: 'G',
          fundName: 'G Fund (Government Securities)',
          allocationPercentage: 5,
          currentValue: 2250,
          returnYTD: 4.1,
          returnLifetime: 18.2
        }
      ],
      loanBalance: 0,
      loansOutstanding: [],
      projectedBalance: 850000
    },
    status: 'active',
    createdAt: '2020-06-01T00:00:00Z'
  }
];

export const sampleGovernmentSettings: GovernmentSettings = {
  settingsId: 'settings-001',
  organizationId: 'org-001',
  gradeSettings: {
    promotionCycleMonths: 12,
    performanceRatingRequired: true,
    timeInGradeMinimum: 52,
    localityPayEnabled: true
  },
  clearanceSettings: {
    reinvestigationPeriod: 120,
    continuousEvaluationEnabled: true,
    polygraphFrequency: 60,
    debriefingRequired: true
  },
  pensionSettings: {
    defaultPensionType: 'fers',
    employeeContributionRate: 0.08,
    agencyMatchPercentage: 5,
    vestingYears: 5
  },
  notifications: {
    clearanceExpiring: true,
    promotionEligible: true,
    retirementEligible: true,
    performanceReviewDue: true
  },
  updatedAt: '2024-01-01T00:00:00Z'
};
