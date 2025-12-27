import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function learningSeed(tenantId: string) {
  console.log('Seeding Learning & Development data...');

  // Create Courses
  const course1 = await prisma.course.create({
    data: {
      tenantId,
      courseCode: 'LEAD-101',
      title: 'Leadership Fundamentals',
      description: 'Learn essential leadership skills for new managers and team leads. This course covers communication, delegation, conflict resolution, and team motivation.',
      type: 'INSTRUCTOR_LED',
      level: 'BEGINNER',
      status: 'PUBLISHED',
      categoryId: 'cat-leadership',
      categoryName: 'Leadership',
      duration: 16,
      durationUnit: 'hours',
      objectives: ['Understand core leadership principles', 'Develop effective communication skills', 'Learn conflict management techniques'],
      prerequisites: [],
      targetAudience: 'New managers and aspiring leaders',
      skills: ['Leadership', 'Communication', 'Conflict Resolution'],
      competencies: ['Team Management', 'Strategic Thinking'],
      maxParticipants: 50,
      currentEnrollments: 12,
      passingScore: 70,
      credits: 16,
      cost: 0,
      currency: 'USD',
      tags: ['Leadership', 'Management', 'Soft Skills'],
      isComplianceTraining: false,
      publishedDate: new Date('2024-01-15'),
      createdBy: 'system',
    },
  });

  const course2 = await prisma.course.create({
    data: {
      tenantId,
      courseCode: 'TECH-201',
      title: 'Advanced React Patterns',
      description: 'Master advanced React patterns including hooks, context, custom hooks, performance optimization, and state management.',
      type: 'E_LEARNING',
      level: 'ADVANCED',
      status: 'PUBLISHED',
      categoryId: 'cat-technical',
      categoryName: 'Technical',
      duration: 24,
      durationUnit: 'hours',
      objectives: ['Master React hooks', 'Implement custom hooks', 'Optimize performance'],
      prerequisites: ['Basic React knowledge', 'JavaScript ES6+'],
      targetAudience: 'Frontend developers with React experience',
      skills: ['React', 'JavaScript', 'Performance Optimization'],
      competencies: ['Frontend Development', 'Technical Architecture'],
      maxParticipants: 100,
      currentEnrollments: 35,
      passingScore: 80,
      credits: 24,
      cost: 0,
      currency: 'USD',
      tags: ['React', 'Frontend', 'JavaScript', 'Technical'],
      isComplianceTraining: false,
      publishedDate: new Date('2024-02-01'),
      createdBy: 'system',
    },
  });

  const course3 = await prisma.course.create({
    data: {
      tenantId,
      courseCode: 'COMP-301',
      title: 'Information Security & GDPR Compliance',
      description: 'Essential training on information security best practices and GDPR compliance requirements for all employees.',
      type: 'E_LEARNING',
      level: 'BEGINNER',
      status: 'PUBLISHED',
      categoryId: 'cat-compliance',
      categoryName: 'Compliance',
      duration: 4,
      durationUnit: 'hours',
      objectives: ['Understand GDPR requirements', 'Learn data protection principles', 'Implement security best practices'],
      prerequisites: [],
      targetAudience: 'All employees',
      skills: ['Information Security', 'GDPR', 'Data Protection'],
      competencies: ['Compliance', 'Security Awareness'],
      maxParticipants: null,
      currentEnrollments: 85,
      passingScore: 90,
      credits: 4,
      cost: 0,
      currency: 'USD',
      tags: ['Compliance', 'Security', 'GDPR', 'Mandatory'],
      isComplianceTraining: true,
      validityPeriod: 365,
      publishedDate: new Date('2024-01-01'),
      createdBy: 'system',
    },
  });

  const course4 = await prisma.course.create({
    data: {
      tenantId,
      courseCode: 'TECH-102',
      title: 'Python for Data Analysis',
      description: 'Learn Python programming for data analysis using pandas, numpy, and matplotlib.',
      type: 'SELF_PACED',
      level: 'INTERMEDIATE',
      status: 'PUBLISHED',
      categoryId: 'cat-technical',
      categoryName: 'Technical',
      duration: 32,
      durationUnit: 'hours',
      objectives: ['Master Python basics', 'Learn pandas and numpy', 'Create data visualizations'],
      prerequisites: ['Basic programming knowledge'],
      targetAudience: 'Data analysts and aspiring data scientists',
      skills: ['Python', 'Data Analysis', 'Pandas', 'Matplotlib'],
      competencies: ['Data Analysis', 'Technical Skills'],
      maxParticipants: null,
      currentEnrollments: 28,
      passingScore: 75,
      credits: 32,
      ceus: 3.2,
      cost: 0,
      currency: 'USD',
      tags: ['Python', 'Data Science', 'Technical'],
      isComplianceTraining: false,
      publishedDate: new Date('2024-01-20'),
      createdBy: 'system',
    },
  });

  // Create Learning Paths
  const learningPath1 = await prisma.learningPath.create({
    data: {
      tenantId,
      pathCode: 'LP-FRONTEND',
      title: 'Frontend Developer Career Path',
      description: 'Complete journey from beginner to advanced frontend developer, covering HTML, CSS, JavaScript, and modern frameworks.',
      level: 'INTERMEDIATE',
      categoryId: 'cat-technical',
      categoryName: 'Technical',
      duration: 120,
      courses: [
        { courseId: course2.id, courseTitle: course2.title, order: 1, isRequired: true, prerequisites: [] },
      ],
      skills: ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript'],
      competencies: ['Frontend Development', 'UI/UX Implementation'],
      isActive: true,
      enrollmentCount: 15,
      completionRate: 35.5,
      createdBy: 'system',
    },
  });

  const learningPath2 = await prisma.learningPath.create({
    data: {
      tenantId,
      pathCode: 'LP-LEADERSHIP',
      title: 'New Manager Onboarding Path',
      description: 'Comprehensive onboarding program for new managers covering leadership, team management, and organizational skills.',
      level: 'BEGINNER',
      categoryId: 'cat-leadership',
      categoryName: 'Leadership',
      duration: 40,
      courses: [
        { courseId: course1.id, courseTitle: course1.title, order: 1, isRequired: true, prerequisites: [] },
      ],
      skills: ['Leadership', 'Management', 'Communication'],
      competencies: ['Team Leadership', 'People Management'],
      isActive: true,
      enrollmentCount: 8,
      completionRate: 62.5,
      createdBy: 'system',
    },
  });

  // Create Enrollments
  const enrollment1 = await prisma.enrollment.create({
    data: {
      tenantId,
      enrollmentNumber: 'ENR-2024-001',
      courseId: course2.id,
      learnerId: 'user-1',
      learnerName: 'John Doe',
      learnerEmail: 'john.doe@example.com',
      enrollmentType: 'SELF_ENROLLED',
      status: 'IN_PROGRESS',
      enrolledDate: new Date('2024-11-01'),
      startDate: new Date('2024-11-01'),
      dueDate: new Date('2025-02-01'),
      progress: 45,
      timeSpent: 720, // 12 hours
      passingScore: 80,
      attempts: 2,
      maxAttempts: 3,
    },
  });

  const enrollment2 = await prisma.enrollment.create({
    data: {
      tenantId,
      enrollmentNumber: 'ENR-2024-002',
      courseId: course3.id,
      learnerId: 'user-2',
      learnerName: 'Jane Smith',
      learnerEmail: 'jane.smith@example.com',
      enrollmentType: 'MANDATORY',
      status: 'COMPLETED',
      enrolledDate: new Date('2024-01-15'),
      startDate: new Date('2024-01-15'),
      completedDate: new Date('2024-01-20'),
      dueDate: new Date('2024-02-15'),
      progress: 100,
      timeSpent: 240, // 4 hours
      score: 95,
      passingScore: 90,
      attempts: 1,
    },
  });

  const enrollment3 = await prisma.enrollment.create({
    data: {
      tenantId,
      enrollmentNumber: 'ENR-2024-003',
      learningPathId: learningPath1.id,
      learnerId: 'user-3',
      learnerName: 'Mike Johnson',
      learnerEmail: 'mike.johnson@example.com',
      enrollmentType: 'RECOMMENDED',
      status: 'IN_PROGRESS',
      enrolledDate: new Date('2024-10-15'),
      startDate: new Date('2024-10-15'),
      dueDate: new Date('2025-04-15'),
      progress: 25,
      timeSpent: 1800, // 30 hours
      passingScore: 70,
    },
  });

  // Create Assessments
  const assessment1 = await prisma.assessment.create({
    data: {
      tenantId,
      assessmentCode: 'QUIZ-LEAD-101',
      title: 'Leadership Fundamentals Quiz',
      description: 'Final assessment for Leadership Fundamentals course',
      courseId: course1.id,
      type: 'QUIZ',
      duration: 60,
      totalPoints: 100,
      passingScore: 70,
      maxAttempts: 3,
      isRandomized: true,
      showResults: true,
      allowReview: true,
      questions: [
        { id: 'q1', type: 'multiple_choice', question: 'What is the most important skill for a leader?', points: 10 },
        { id: 'q2', type: 'multiple_choice', question: 'How should conflicts be resolved?', points: 10 },
        { id: 'q3', type: 'short_answer', question: 'Describe your leadership style.', points: 20 },
      ],
      instructions: 'Answer all questions to the best of your ability. You have 60 minutes to complete this quiz.',
      isActive: true,
      createdBy: 'system',
    },
  });

  const assessment2 = await prisma.assessment.create({
    data: {
      tenantId,
      assessmentCode: 'EXAM-COMP-301',
      title: 'GDPR Compliance Exam',
      description: 'Mandatory compliance exam for GDPR training',
      courseId: course3.id,
      type: 'EXAM',
      duration: 45,
      totalPoints: 100,
      passingScore: 90,
      maxAttempts: 2,
      isRandomized: false,
      showResults: true,
      allowReview: false,
      questions: [
        { id: 'q1', type: 'true_false', question: 'GDPR applies to all EU citizens data.', points: 5 },
        { id: 'q2', type: 'multiple_choice', question: 'What is the penalty for GDPR violations?', points: 10 },
      ],
      instructions: 'This is a mandatory compliance exam. You must score at least 90% to pass.',
      isActive: true,
      createdBy: 'system',
    },
  });

  // Create Assessment Attempts
  const attempt1 = await prisma.assessmentAttempt.create({
    data: {
      tenantId,
      assessmentId: assessment2.id,
      learnerId: 'user-2',
      learnerName: 'Jane Smith',
      attemptNumber: 1,
      startedAt: new Date('2024-01-20T10:00:00Z'),
      submittedAt: new Date('2024-01-20T10:35:00Z'),
      duration: 35,
      score: 95,
      percentage: 95,
      passed: true,
      answers: [
        { questionId: 'q1', answer: 'true', isCorrect: true },
        { questionId: 'q2', answer: 'option_b', isCorrect: true },
      ],
    },
  });

  // Create Certifications
  const certification1 = await prisma.certification.create({
    data: {
      tenantId,
      certificateNumber: 'CERT-2024-001',
      certificateName: 'GDPR Compliance Certification',
      learnerId: 'user-2',
      learnerName: 'Jane Smith',
      learnerEmail: 'jane.smith@example.com',
      courseId: course3.id,
      courseName: course3.title,
      issuedDate: new Date('2024-01-20'),
      expiryDate: new Date('2025-01-20'),
      status: 'ACTIVE',
      issuedBy: 'system',
      verificationUrl: 'https://verify.example.com/CERT-2024-001',
    },
  });

  const certification2 = await prisma.certification.create({
    data: {
      tenantId,
      certificateNumber: 'CERT-2024-002',
      certificateName: 'Leadership Fundamentals Certificate',
      learnerId: 'user-1',
      learnerName: 'John Doe',
      learnerEmail: 'john.doe@example.com',
      courseId: course1.id,
      courseName: course1.title,
      issuedDate: new Date('2024-03-15'),
      status: 'ACTIVE',
      issuedBy: 'system',
      verificationUrl: 'https://verify.example.com/CERT-2024-002',
    },
  });

  console.log('Learning & Development seed data created successfully!');
  console.log(`- Created ${4} courses`);
  console.log(`- Created ${2} learning paths`);
  console.log(`- Created ${3} enrollments`);
  console.log(`- Created ${2} assessments`);
  console.log(`- Created ${1} assessment attempts`);
  console.log(`- Created ${2} certifications`);
}
