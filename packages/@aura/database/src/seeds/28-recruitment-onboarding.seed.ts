/**
 * 28-recruitment-onboarding.seed.ts
 * Seeds the full recruitment-to-onboarding pipeline:
 *   JobRequisition, Candidate, CandidateApplication, Interview,
 *   InterviewFeedback, JobOffer, BackgroundCheck, RecruitmentVendor,
 *   OnboardingProgram, OnboardingInstance, OnboardingTask
 */
import { PrismaClient } from '@prisma/client';

export async function seedRecruitmentOnboarding(prisma: PrismaClient, tenantId: string) {
  console.log('...Seeding Recruitment & Onboarding Pipeline');

  // ── Fetch existing prerequisites ──
  const jobPostings = await prisma.jobPosting.findMany({ take: 6 });
  const employees = await prisma.employee.findMany({ take: 10 });

  if (jobPostings.length === 0) {
    console.warn('⚠️ No JobPostings found. Skipping recruitment-onboarding seed.');
    return;
  }
  if (employees.length === 0) {
    console.warn('⚠️ No Employees found. Skipping onboarding instance seed.');
  }

  const pick = <T>(arr: T[], idx: number): T => arr[idx % arr.length];

  // ================================================================
  // 1. JOB REQUISITIONS
  // ================================================================
  console.log('  ...Seeding Job Requisitions');

  const requisitionDefs = [
    {
      jobTitle: 'Senior Software Engineer',
      department: 'Engineering',
      requestedBy: 'EMP-001',
      numberOfPositions: 3,
      employmentType: 'Full-time',
      priority: 'High',
      status: 'Approved',
      location: 'Dubai, UAE',
      salaryRange: { min: 25000, max: 40000, currency: 'AED' },
      requiredSkills: ['TypeScript', 'Node.js', 'React', 'PostgreSQL'],
      description: 'Senior engineers needed to scale the core platform.',
      justification: 'Team expansion to support Q3 product launch.',
      approvalStatus: 'Approved',
    },
    {
      jobTitle: 'HR Business Partner',
      department: 'Human Resources',
      requestedBy: 'EMP-002',
      numberOfPositions: 1,
      employmentType: 'Full-time',
      priority: 'Medium',
      status: 'Open',
      location: 'Riyadh, KSA',
      salaryRange: { min: 18000, max: 28000, currency: 'SAR' },
      requiredSkills: ['HR Strategy', 'Employee Relations', 'Compensation & Benefits'],
      description: 'HRBP for the Saudi Arabia entity to support 200+ headcount.',
      justification: 'Replacement for departing HRBP plus entity growth.',
      approvalStatus: 'Approved',
    },
    {
      jobTitle: 'Data Analyst',
      department: 'Engineering',
      requestedBy: 'EMP-003',
      numberOfPositions: 2,
      employmentType: 'Full-time',
      priority: 'Medium',
      status: 'Open',
      location: 'Bangalore, IN',
      salaryRange: { min: 800000, max: 1500000, currency: 'INR' },
      requiredSkills: ['SQL', 'Python', 'Power BI', 'Statistics'],
      description: 'Data analysts for the analytics and reporting team.',
      justification: 'New analytics function buildout.',
      approvalStatus: 'Approved',
    },
    {
      jobTitle: 'Marketing Coordinator',
      department: 'Marketing',
      requestedBy: 'EMP-004',
      numberOfPositions: 1,
      employmentType: 'Full-time',
      priority: 'Low',
      status: 'Draft',
      location: 'London, UK',
      salaryRange: { min: 35000, max: 45000, currency: 'GBP' },
      requiredSkills: ['Content Marketing', 'SEO', 'Social Media'],
      description: 'Marketing coordinator for European campaigns.',
      justification: 'Pending budget approval for Q4.',
      approvalStatus: 'Pending',
    },
    {
      jobTitle: 'DevOps Lead',
      department: 'Engineering',
      requestedBy: 'EMP-001',
      numberOfPositions: 1,
      employmentType: 'Full-time',
      priority: 'High',
      status: 'Closed',
      location: 'Remote',
      salaryRange: { min: 30000, max: 50000, currency: 'AED' },
      requiredSkills: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD'],
      description: 'DevOps lead to manage cloud infrastructure and SRE.',
      justification: 'Position filled through internal transfer.',
      approvalStatus: 'Approved',
    },
  ];

  const createdRequisitions: string[] = [];
  for (const def of requisitionDefs) {
    const existing = await prisma.jobRequisition.findFirst({
      where: { tenantId, jobTitle: def.jobTitle, department: def.department },
    });
    if (existing) {
      createdRequisitions.push(existing.id);
      continue;
    }
    const req = await prisma.jobRequisition.create({
      data: { tenantId, ...def },
    });
    createdRequisitions.push(req.id);
  }
  console.log(`  ✅ Job Requisitions: ${createdRequisitions.length}`);

  // ================================================================
  // 2. CANDIDATES
  // ================================================================
  console.log('  ...Seeding Candidates');

  const candidateDefs = [
    {
      firstName: 'Alex',
      lastName: 'Thompson',
      email: 'alex.thompson@example.com',
      phone: '+1-555-0101',
      location: 'New York, US',
      source: 'LinkedIn',
      skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
      experience: { years: 6, current: 'Senior Developer at TechCorp', previous: ['MidDev at StartupX'] },
      education: { degree: 'BSc Computer Science', university: 'MIT', year: 2018 },
      resumeUrl: '/resumes/alex-thompson.pdf',
    },
    {
      firstName: 'Fatima',
      lastName: 'Al-Rashidi',
      email: 'fatima.alrashidi@example.com',
      phone: '+966-555-0102',
      location: 'Riyadh, KSA',
      source: 'Referral',
      skills: ['HR Strategy', 'Employee Relations', 'HRIS', 'Compensation'],
      experience: { years: 8, current: 'HR Manager at SaudiCo', previous: ['HR Specialist at GulfHR'] },
      education: { degree: 'MBA Human Resources', university: 'King Saud University', year: 2016 },
      resumeUrl: '/resumes/fatima-alrashidi.pdf',
    },
    {
      firstName: 'Raj',
      lastName: 'Krishnan',
      email: 'raj.krishnan@example.com',
      phone: '+91-9876543210',
      location: 'Bangalore, IN',
      source: 'Indeed',
      skills: ['Python', 'SQL', 'Power BI', 'Machine Learning'],
      experience: { years: 4, current: 'Data Analyst at InfoSys', previous: ['Intern at DataLab'] },
      education: { degree: 'MSc Statistics', university: 'IIT Bangalore', year: 2020 },
      resumeUrl: '/resumes/raj-krishnan.pdf',
    },
    {
      firstName: 'Emily',
      lastName: 'Chen',
      email: 'emily.chen@example.com',
      phone: '+1-555-0104',
      location: 'San Francisco, US',
      source: 'Career Site',
      skills: ['React', 'Vue.js', 'CSS', 'Figma', 'Design Systems'],
      experience: { years: 5, current: 'Frontend Engineer at DesignHub', previous: ['UI Dev at Agency'] },
      education: { degree: 'BSc Information Systems', university: 'Stanford University', year: 2019 },
      resumeUrl: '/resumes/emily-chen.pdf',
    },
    {
      firstName: 'Omar',
      lastName: 'Youssef',
      email: 'omar.youssef@example.com',
      phone: '+971-555-0105',
      location: 'Dubai, UAE',
      source: 'Agency',
      skills: ['Kubernetes', 'Terraform', 'AWS', 'Docker', 'CI/CD'],
      experience: { years: 7, current: 'DevOps Engineer at CloudFirst', previous: ['SysAdmin at NetCorp'] },
      education: { degree: 'BSc Computer Engineering', university: 'American University of Dubai', year: 2017 },
      resumeUrl: '/resumes/omar-youssef.pdf',
    },
    {
      firstName: 'Priya',
      lastName: 'Mehta',
      email: 'priya.mehta.candidate@example.com',
      phone: '+91-9876543211',
      location: 'Mumbai, IN',
      source: 'LinkedIn',
      skills: ['Python', 'R', 'Tableau', 'SQL', 'Statistics'],
      experience: { years: 3, current: 'Junior Analyst at DataWorks', previous: [] },
      education: { degree: 'BSc Mathematics', university: 'University of Mumbai', year: 2021 },
      resumeUrl: '/resumes/priya-mehta.pdf',
    },
    {
      firstName: 'James',
      lastName: 'Wilson',
      email: 'james.wilson@example.com',
      phone: '+44-7700-900100',
      location: 'London, UK',
      source: 'Glassdoor',
      skills: ['Content Marketing', 'SEO', 'Google Analytics', 'Copywriting'],
      experience: { years: 4, current: 'Marketing Specialist at BrandCo', previous: ['Content Writer at MediaX'] },
      education: { degree: 'BA Marketing', university: 'University of Manchester', year: 2020 },
      resumeUrl: '/resumes/james-wilson.pdf',
    },
    {
      firstName: 'Sara',
      lastName: 'Al-Dosari',
      email: 'sara.aldosari@example.com',
      phone: '+966-555-0108',
      location: 'Jeddah, KSA',
      source: 'Referral',
      skills: ['TypeScript', 'React', 'Next.js', 'PostgreSQL', 'REST APIs'],
      experience: { years: 5, current: 'Full Stack Dev at ArabTech', previous: ['Backend Dev at SaudiSoft'] },
      education: { degree: 'BSc Software Engineering', university: 'King Abdulaziz University', year: 2019 },
      resumeUrl: '/resumes/sara-aldosari.pdf',
    },
  ];

  const createdCandidates: string[] = [];
  for (const def of candidateDefs) {
    const existing = await prisma.candidate.findFirst({
      where: { email: def.email },
    });
    if (existing) {
      createdCandidates.push(existing.id);
      continue;
    }
    const cand = await prisma.candidate.create({ data: def });
    createdCandidates.push(cand.id);
  }
  console.log(`  ✅ Candidates: ${createdCandidates.length}`);

  // ================================================================
  // 3. CANDIDATE APPLICATIONS
  // ================================================================
  console.log('  ...Seeding Candidate Applications');

  const applicationDefs = [
    { candidateIdx: 0, jobPostingIdx: 0, status: 'interview', currentStage: 'technical_interview', source: 'LinkedIn', daysAgo: 30, overallRating: 4.2 },
    { candidateIdx: 1, jobPostingIdx: 1, status: 'offer', currentStage: 'offer_extended', source: 'Referral', daysAgo: 45, overallRating: 4.5 },
    { candidateIdx: 2, jobPostingIdx: 3, status: 'screening', currentStage: 'resume_review', source: 'Indeed', daysAgo: 10, overallRating: null },
    { candidateIdx: 3, jobPostingIdx: 0, status: 'interview', currentStage: 'onsite_interview', source: 'Career Site', daysAgo: 25, overallRating: 3.8 },
    { candidateIdx: 4, jobPostingIdx: 4, status: 'hired', currentStage: 'onboarding', source: 'Agency', daysAgo: 60, overallRating: 4.7 },
    { candidateIdx: 5, jobPostingIdx: 3, status: 'applied', currentStage: 'applied', source: 'LinkedIn', daysAgo: 5, overallRating: null },
    { candidateIdx: 6, jobPostingIdx: 2, status: 'rejected', currentStage: 'rejected', source: 'Glassdoor', daysAgo: 40, overallRating: 2.5 },
    { candidateIdx: 7, jobPostingIdx: 0, status: 'screening', currentStage: 'phone_screen', source: 'Referral', daysAgo: 15, overallRating: null },
  ];

  const createdApplications: string[] = [];
  for (const def of applicationDefs) {
    const candidateId = createdCandidates[def.candidateIdx];
    const jobPostingId = pick(jobPostings, def.jobPostingIdx).id;

    const existing = await prisma.candidateApplication.findFirst({
      where: { candidateId, jobPostingId },
    });
    if (existing) {
      createdApplications.push(existing.id);
      continue;
    }
    const app = await prisma.candidateApplication.create({
      data: {
        candidateId,
        jobPostingId,
        status: def.status,
        currentStage: def.currentStage,
        source: def.source,
        appliedDate: new Date(Date.now() - def.daysAgo * 24 * 60 * 60 * 1000),
        overallRating: def.overallRating,
      },
    });
    createdApplications.push(app.id);
  }
  console.log(`  ✅ Candidate Applications: ${createdApplications.length}`);

  // ================================================================
  // 4. INTERVIEWS
  // ================================================================
  console.log('  ...Seeding Interviews');

  const interviewerIds = employees.slice(0, 4).map((e) => e.id);
  const interviewerNames = employees.slice(0, 4).map((e) => `${e.firstName} ${e.lastName}`);

  const interviewDefs = [
    {
      appIdx: 0,
      title: 'Technical Screen - Senior Software Engineer',
      type: 'phone',
      daysFromNow: -20,
      duration: 45,
      location: null,
      meetingLink: 'https://meet.kreupai.com/interview-001',
      interviewerIdxs: [0, 1],
      status: 'completed',
      overallRating: 4.0,
    },
    {
      appIdx: 0,
      title: 'System Design Interview',
      type: 'video',
      daysFromNow: -10,
      duration: 90,
      location: null,
      meetingLink: 'https://meet.kreupai.com/interview-002',
      interviewerIdxs: [0, 2],
      status: 'completed',
      overallRating: 4.3,
    },
    {
      appIdx: 1,
      title: 'HRBP Competency Interview',
      type: 'video',
      daysFromNow: -25,
      duration: 60,
      location: null,
      meetingLink: 'https://meet.kreupai.com/interview-003',
      interviewerIdxs: [1],
      status: 'completed',
      overallRating: 4.5,
    },
    {
      appIdx: 3,
      title: 'Frontend Coding Challenge',
      type: 'technical',
      daysFromNow: -5,
      duration: 120,
      location: null,
      meetingLink: 'https://meet.kreupai.com/interview-004',
      interviewerIdxs: [0, 3],
      status: 'completed',
      overallRating: 3.8,
    },
    {
      appIdx: 3,
      title: 'Culture Fit - Final Round',
      type: 'onsite',
      daysFromNow: 3,
      duration: 60,
      location: 'KreupAI Office, Dubai',
      meetingLink: null,
      interviewerIdxs: [1, 2, 3],
      status: 'scheduled',
      overallRating: null,
    },
    {
      appIdx: 4,
      title: 'DevOps Technical Assessment',
      type: 'technical',
      daysFromNow: -40,
      duration: 90,
      location: null,
      meetingLink: 'https://meet.kreupai.com/interview-006',
      interviewerIdxs: [0, 2],
      status: 'completed',
      overallRating: 4.8,
    },
    {
      appIdx: 7,
      title: 'Phone Screening - Software Engineer',
      type: 'phone',
      daysFromNow: 5,
      duration: 30,
      location: null,
      meetingLink: 'https://meet.kreupai.com/interview-007',
      interviewerIdxs: [1],
      status: 'scheduled',
      overallRating: null,
    },
  ];

  const createdInterviews: string[] = [];
  for (const def of interviewDefs) {
    const applicationId = createdApplications[def.appIdx];
    if (!applicationId) continue;

    const existing = await prisma.interview.findFirst({
      where: { applicationId, title: def.title },
    });
    if (existing) {
      createdInterviews.push(existing.id);
      continue;
    }

    const selIds = def.interviewerIdxs.map((i) => interviewerIds[i] || interviewerIds[0]);
    const selNames = def.interviewerIdxs.map((i) => interviewerNames[i] || interviewerNames[0]);

    const interview = await prisma.interview.create({
      data: {
        applicationId,
        title: def.title,
        type: def.type,
        scheduledDate: new Date(Date.now() + def.daysFromNow * 24 * 60 * 60 * 1000),
        duration: def.duration,
        location: def.location,
        meetingLink: def.meetingLink,
        interviewerIds: selIds,
        interviewerNames: selNames,
        status: def.status,
        overallRating: def.overallRating,
        feedbackSubmitted: def.status === 'completed',
      },
    });
    createdInterviews.push(interview.id);
  }
  console.log(`  ✅ Interviews: ${createdInterviews.length}`);

  // ================================================================
  // 5. INTERVIEW FEEDBACK (for completed interviews)
  // ================================================================
  console.log('  ...Seeding Interview Feedback');

  const feedbackDefs = [
    {
      interviewIdx: 0,
      interviewerIdx: 0,
      rating: 4.0,
      strengths: 'Strong problem-solving skills, clean code structure, excellent communication.',
      weaknesses: 'Could improve on system design for distributed systems.',
      recommendation: 'hire',
      comments: 'Solid candidate for the senior role. Recommend proceeding to next round.',
    },
    {
      interviewIdx: 0,
      interviewerIdx: 1,
      rating: 4.2,
      strengths: 'Deep TypeScript knowledge, good architectural thinking.',
      weaknesses: 'Limited experience with microservices at scale.',
      recommendation: 'hire',
      comments: 'Would be a great addition to the platform team.',
    },
    {
      interviewIdx: 1,
      interviewerIdx: 0,
      rating: 4.5,
      strengths: 'Excellent system design approach, clear trade-off analysis.',
      weaknesses: 'None significant.',
      recommendation: 'strong_hire',
      comments: 'Top-tier candidate. Strong hire recommendation.',
    },
    {
      interviewIdx: 2,
      interviewerIdx: 1,
      rating: 4.5,
      strengths: 'Extensive HR experience in GCC region, strong stakeholder management.',
      weaknesses: 'Limited exposure to HRIS platforms beyond SAP.',
      recommendation: 'strong_hire',
      comments: 'Ideal candidate for the KSA HRBP role.',
    },
    {
      interviewIdx: 3,
      interviewerIdx: 0,
      rating: 3.5,
      strengths: 'Good React skills, clean component architecture.',
      weaknesses: 'Struggled with performance optimization questions.',
      recommendation: 'hire',
      comments: 'Decent candidate. Suggest one more round to assess depth.',
    },
    {
      interviewIdx: 3,
      interviewerIdx: 3,
      rating: 4.0,
      strengths: 'Strong CSS knowledge, good eye for design.',
      weaknesses: 'Could improve testing practices.',
      recommendation: 'hire',
      comments: 'Good cultural fit, technically competent.',
    },
    {
      interviewIdx: 5,
      interviewerIdx: 0,
      rating: 4.8,
      strengths: 'Deep Kubernetes expertise, Terraform mastery, excellent AWS knowledge.',
      weaknesses: 'None observed.',
      recommendation: 'strong_hire',
      comments: 'Exceptional DevOps candidate. Immediately productive.',
    },
    {
      interviewIdx: 5,
      interviewerIdx: 2,
      rating: 4.7,
      strengths: 'Strong CI/CD pipeline design, security-first mindset.',
      weaknesses: 'Minor gaps in cost optimization strategies.',
      recommendation: 'strong_hire',
      comments: 'Outstanding candidate. Highly recommend for the lead role.',
    },
  ];

  let feedbackCount = 0;
  for (const def of feedbackDefs) {
    const interviewId = createdInterviews[def.interviewIdx];
    const interviewerId = interviewerIds[def.interviewerIdx] || interviewerIds[0];
    if (!interviewId) continue;

    const existing = await prisma.interviewFeedback.findFirst({
      where: { interviewId, interviewerId },
    });
    if (existing) {
      feedbackCount++;
      continue;
    }

    await prisma.interviewFeedback.create({
      data: {
        interviewId,
        interviewerId,
        rating: def.rating,
        strengths: def.strengths,
        weaknesses: def.weaknesses,
        recommendation: def.recommendation,
        comments: def.comments,
      },
    });
    feedbackCount++;
  }
  console.log(`  ✅ Interview Feedback: ${feedbackCount}`);

  // ================================================================
  // 6. JOB OFFERS
  // ================================================================
  console.log('  ...Seeding Job Offers');

  const offerDefs = [
    {
      appIdx: 1,
      jobTitle: 'HR Business Partner',
      department: 'Human Resources',
      employmentType: 'Full-time',
      startDate: 30,
      salary: 24000,
      currency: 'SAR',
      bonus: 5000,
      benefits: {
        healthInsurance: 'Family coverage',
        housing: 'SAR 5,000/month allowance',
        transport: 'SAR 2,000/month allowance',
        annualLeave: '30 days',
        flightTickets: '2 return tickets/year',
      },
      status: 'sent',
      offerLetterUrl: '/offers/offer-hrbp-001.pdf',
    },
    {
      appIdx: 4,
      jobTitle: 'DevOps Lead',
      department: 'Engineering',
      employmentType: 'Full-time',
      startDate: 14,
      salary: 42000,
      currency: 'AED',
      bonus: 10000,
      benefits: {
        healthInsurance: 'Premium family coverage',
        housing: 'AED 8,000/month allowance',
        transport: 'Company car or AED 3,000/month',
        annualLeave: '30 days',
        education: 'AED 10,000/year for certifications',
      },
      status: 'accepted',
      offerLetterUrl: '/offers/offer-devops-001.pdf',
    },
    {
      appIdx: 0,
      jobTitle: 'Senior Software Engineer',
      department: 'Engineering',
      employmentType: 'Full-time',
      startDate: 45,
      salary: 35000,
      currency: 'AED',
      bonus: 7500,
      benefits: {
        healthInsurance: 'Individual + spouse coverage',
        housing: 'AED 6,000/month allowance',
        transport: 'AED 2,500/month allowance',
        annualLeave: '25 days',
        stockOptions: '500 shares vesting over 4 years',
      },
      status: 'draft',
      offerLetterUrl: null,
    },
  ];

  const createdOffers: string[] = [];
  for (const def of offerDefs) {
    const applicationId = createdApplications[def.appIdx];
    if (!applicationId) continue;

    const existing = await prisma.jobOffer.findFirst({
      where: { applicationId, jobTitle: def.jobTitle },
    });
    if (existing) {
      createdOffers.push(existing.id);
      continue;
    }

    const offer = await prisma.jobOffer.create({
      data: {
        applicationId,
        jobTitle: def.jobTitle,
        department: def.department,
        employmentType: def.employmentType,
        startDate: new Date(Date.now() + def.startDate * 24 * 60 * 60 * 1000),
        salary: def.salary,
        currency: def.currency,
        bonus: def.bonus,
        benefits: def.benefits,
        status: def.status,
        offerLetterUrl: def.offerLetterUrl,
      },
    });
    createdOffers.push(offer.id);
  }
  console.log(`  ✅ Job Offers: ${createdOffers.length}`);

  // ================================================================
  // 7. BACKGROUND CHECKS
  // ================================================================
  console.log('  ...Seeding Background Checks');

  const bgCheckDefs = [
    { appIdx: 1, candidateIdx: 1, checkType: 'criminal', provider: 'FirstAdvantage', status: 'completed', result: 'clear' },
    { appIdx: 1, candidateIdx: 1, checkType: 'education', provider: 'FirstAdvantage', status: 'completed', result: 'verified' },
    { appIdx: 1, candidateIdx: 1, checkType: 'employment', provider: 'FirstAdvantage', status: 'completed', result: 'verified' },
    { appIdx: 4, candidateIdx: 4, checkType: 'criminal', provider: 'HireRight', status: 'completed', result: 'clear' },
    { appIdx: 4, candidateIdx: 4, checkType: 'education', provider: 'HireRight', status: 'completed', result: 'verified' },
    { appIdx: 4, candidateIdx: 4, checkType: 'reference', provider: 'HireRight', status: 'completed', result: 'positive' },
    { appIdx: 0, candidateIdx: 0, checkType: 'criminal', provider: 'Sterling', status: 'in_progress', result: null },
    { appIdx: 0, candidateIdx: 0, checkType: 'employment', provider: 'Sterling', status: 'pending', result: null },
  ];

  let bgCheckCount = 0;
  for (const def of bgCheckDefs) {
    const applicationId = createdApplications[def.appIdx];
    const candidateId = createdCandidates[def.candidateIdx];
    if (!applicationId) continue;

    const existing = await prisma.backgroundCheck.findFirst({
      where: { tenantId, applicationId, checkType: def.checkType },
    });
    if (existing) {
      bgCheckCount++;
      continue;
    }

    await prisma.backgroundCheck.create({
      data: {
        tenantId,
        applicationId,
        candidateId,
        checkType: def.checkType,
        provider: def.provider,
        status: def.status,
        result: def.result,
      },
    });
    bgCheckCount++;
  }
  console.log(`  ✅ Background Checks: ${bgCheckCount}`);

  // ================================================================
  // 8. RECRUITMENT VENDORS
  // ================================================================
  console.log('  ...Seeding Recruitment Vendors');

  const vendorDefs = [
    {
      vendorCode: 'RV-HAYS',
      name: 'Hays Recruitment',
      category: 'agency',
      status: 'active',
      contactPersonName: 'Michael Roberts',
      contactEmail: 'michael.roberts@hays.com',
      rating: 4.3,
      specialties: ['Engineering', 'Technology', 'Finance'],
    },
    {
      vendorCode: 'RV-LINKEDIN',
      name: 'LinkedIn Talent Solutions',
      category: 'job_board',
      status: 'active',
      contactPersonName: 'Account Manager',
      contactEmail: 'enterprise@linkedin.com',
      rating: 4.5,
      specialties: ['All Industries', 'Executive Search', 'Employer Branding'],
    },
    {
      vendorCode: 'RV-INTERNAL',
      name: 'Internal Referral Program',
      category: 'referral',
      status: 'active',
      contactPersonName: 'HR Team',
      contactEmail: 'referrals@kreupai.com',
      rating: 4.8,
      specialties: ['All Departments', 'Employee Referrals'],
    },
  ];

  let vendorCount = 0;
  for (const def of vendorDefs) {
    const existing = await prisma.recruitmentVendor.findFirst({
      where: { tenantId, vendorCode: def.vendorCode },
    });
    if (existing) {
      vendorCount++;
      continue;
    }

    await prisma.recruitmentVendor.create({
      data: { tenantId, ...def },
    });
    vendorCount++;
  }
  console.log(`  ✅ Recruitment Vendors: ${vendorCount}`);

  // ================================================================
  // 9. ONBOARDING PROGRAMS
  // ================================================================
  console.log('  ...Seeding Onboarding Programs');

  const programDefs = [
    {
      programCode: 'ONB-ENG-STD',
      programName: 'Engineering Standard Onboarding',
      description: 'Standard 90-day onboarding program for engineering hires including technical setup, codebase familiarization, and team integration.',
      durationDays: 90,
      phases: [
        { name: 'Pre-boarding', days: '1-0', tasks: 5 },
        { name: 'Week 1 - Orientation', days: '1-5', tasks: 8 },
        { name: 'Week 2-4 - Immersion', days: '6-30', tasks: 10 },
        { name: 'Month 2 - Integration', days: '31-60', tasks: 6 },
        { name: 'Month 3 - Autonomy', days: '61-90', tasks: 4 },
      ],
      checklistTemplate: [
        { item: 'Laptop setup', phase: 'Pre-boarding', mandatory: true },
        { item: 'Email & access provisioning', phase: 'Pre-boarding', mandatory: true },
        { item: 'HR orientation session', phase: 'Week 1', mandatory: true },
        { item: 'IT security training', phase: 'Week 1', mandatory: true },
        { item: 'Codebase walkthrough', phase: 'Week 1', mandatory: true },
        { item: 'First PR submitted', phase: 'Week 2-4', mandatory: false },
        { item: 'Architecture deep-dive', phase: 'Week 2-4', mandatory: true },
        { item: '30-day check-in with manager', phase: 'Month 2', mandatory: true },
        { item: 'Independent feature delivery', phase: 'Month 3', mandatory: false },
        { item: '90-day review', phase: 'Month 3', mandatory: true },
      ],
      documentsRequired: [
        { name: 'Passport copy', mandatory: true },
        { name: 'Visa copy', mandatory: true },
        { name: 'Educational certificates', mandatory: true },
        { name: 'Previous employment letters', mandatory: false },
        { name: 'Bank account details', mandatory: true },
      ],
      isActive: true,
    },
    {
      programCode: 'ONB-CORP-STD',
      programName: 'Corporate Functions Onboarding',
      description: 'Standard 60-day onboarding for HR, Finance, Marketing, and other corporate roles.',
      durationDays: 60,
      phases: [
        { name: 'Pre-boarding', days: '1-0', tasks: 4 },
        { name: 'Week 1 - Orientation', days: '1-5', tasks: 7 },
        { name: 'Week 2-4 - Training', days: '6-30', tasks: 8 },
        { name: 'Month 2 - Performance', days: '31-60', tasks: 5 },
      ],
      checklistTemplate: [
        { item: 'Workstation setup', phase: 'Pre-boarding', mandatory: true },
        { item: 'System access provisioning', phase: 'Pre-boarding', mandatory: true },
        { item: 'Company orientation', phase: 'Week 1', mandatory: true },
        { item: 'Department introduction', phase: 'Week 1', mandatory: true },
        { item: 'Policy acknowledgment', phase: 'Week 1', mandatory: true },
        { item: 'Role-specific training', phase: 'Week 2-4', mandatory: true },
        { item: 'Stakeholder meetings', phase: 'Week 2-4', mandatory: true },
        { item: '30-day review', phase: 'Month 2', mandatory: true },
        { item: '60-day review', phase: 'Month 2', mandatory: true },
      ],
      documentsRequired: [
        { name: 'Passport copy', mandatory: true },
        { name: 'Visa copy', mandatory: true },
        { name: 'Educational certificates', mandatory: true },
        { name: 'Bank account details', mandatory: true },
      ],
      isActive: true,
    },
  ];

  const createdPrograms: string[] = [];
  for (const def of programDefs) {
    const existing = await prisma.onboardingProgram.findFirst({
      where: { tenantId, programCode: def.programCode },
    });
    if (existing) {
      createdPrograms.push(existing.id);
      continue;
    }

    const program = await prisma.onboardingProgram.create({
      data: { tenantId, ...def },
    });
    createdPrograms.push(program.id);
  }
  console.log(`  ✅ Onboarding Programs: ${createdPrograms.length}`);

  // ================================================================
  // 10. ONBOARDING INSTANCES
  // ================================================================
  console.log('  ...Seeding Onboarding Instances');

  if (employees.length === 0 || createdPrograms.length === 0) {
    console.warn('  ⚠️ Skipping Onboarding Instances — missing employees or programs.');
  } else {
    const instanceDefs = [
      { employeeIdx: 0, programIdx: 0, status: 'completed', progress: 100, totalTasks: 10, completedTasks: 10, daysAgo: 90 },
      { employeeIdx: 1, programIdx: 1, status: 'in_progress', progress: 65, totalTasks: 9, completedTasks: 6, daysAgo: 30 },
      { employeeIdx: 2, programIdx: 0, status: 'in_progress', progress: 30, totalTasks: 10, completedTasks: 3, daysAgo: 14 },
      { employeeIdx: 3, programIdx: 1, status: 'not_started', progress: 0, totalTasks: 9, completedTasks: 0, daysAgo: 0 },
    ];

    const createdInstances: string[] = [];
    for (const def of instanceDefs) {
      const employeeId = pick(employees, def.employeeIdx).id;
      const programId = createdPrograms[def.programIdx];

      const existing = await prisma.onboardingInstance.findFirst({
        where: { tenantId, employeeId, programId },
      });
      if (existing) {
        createdInstances.push(existing.id);
        continue;
      }

      const instance = await prisma.onboardingInstance.create({
        data: {
          tenantId,
          employeeId,
          programId,
          status: def.status,
          startDate: def.daysAgo > 0 ? new Date(Date.now() - def.daysAgo * 24 * 60 * 60 * 1000) : null,
          progress: def.progress,
          totalTasks: def.totalTasks,
          completedTasks: def.completedTasks,
        },
      });
      createdInstances.push(instance.id);
    }
    console.log(`  ✅ Onboarding Instances: ${createdInstances.length}`);

    // ================================================================
    // 11. ONBOARDING TASKS
    // ================================================================
    console.log('  ...Seeding Onboarding Tasks');

    const taskTemplates = [
      { taskName: 'Complete employee information form', category: 'Documentation', phase: 'Pre-boarding', isMandatory: true },
      { taskName: 'Submit identification documents', category: 'Documentation', phase: 'Pre-boarding', isMandatory: true },
      { taskName: 'Attend HR orientation session', category: 'Orientation', phase: 'Week 1', isMandatory: true },
      { taskName: 'Complete IT security training', category: 'Training', phase: 'Week 1', isMandatory: true },
      { taskName: 'Set up workstation and tools', category: 'IT Setup', phase: 'Week 1', isMandatory: true },
      { taskName: 'Meet with direct manager', category: 'Integration', phase: 'Week 1', isMandatory: true },
      { taskName: 'Complete department-specific training', category: 'Training', phase: 'Week 2-4', isMandatory: true },
      { taskName: 'Review and acknowledge company policies', category: 'Compliance', phase: 'Week 2-4', isMandatory: true },
      { taskName: 'Complete 30-day check-in', category: 'Review', phase: 'Month 2', isMandatory: true },
      { taskName: 'Submit probation review self-assessment', category: 'Review', phase: 'Month 3', isMandatory: false },
    ];

    let taskCount = 0;
    for (let instIdx = 0; instIdx < createdInstances.length; instIdx++) {
      const instanceId = createdInstances[instIdx];
      const instDef = instanceDefs[instIdx];
      const tasksForInstance = taskTemplates.slice(0, instDef.totalTasks);

      for (let tIdx = 0; tIdx < tasksForInstance.length; tIdx++) {
        const tmpl = tasksForInstance[tIdx];

        const existing = await prisma.onboardingTask.findFirst({
          where: { instanceId, taskName: tmpl.taskName },
        });
        if (existing) {
          taskCount++;
          continue;
        }

        let status = 'pending';
        if (tIdx < instDef.completedTasks) {
          status = 'completed';
        } else if (tIdx === instDef.completedTasks && instDef.status === 'in_progress') {
          status = 'in_progress';
        }

        await prisma.onboardingTask.create({
          data: {
            instanceId,
            taskName: tmpl.taskName,
            description: `${tmpl.taskName} as part of the onboarding program.`,
            category: tmpl.category,
            phase: tmpl.phase,
            status,
            dueDate: new Date(Date.now() + (tIdx + 1) * 7 * 24 * 60 * 60 * 1000),
            isMandatory: tmpl.isMandatory,
          },
        });
        taskCount++;
      }
    }
    console.log(`  ✅ Onboarding Tasks: ${taskCount}`);
  }

  console.log('✅ Recruitment & Onboarding Pipeline seeded successfully');
}
