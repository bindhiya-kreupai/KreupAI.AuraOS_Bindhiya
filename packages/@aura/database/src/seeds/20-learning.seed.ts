/**
 * Learning & Development Seed
 *
 * Schema alignment fixes:
 *  - enrollment       → courseEnrollment  (CourseEnrollment model)
 *  - assessmentAttempt → assessmentSubmission (AssessmentSubmission model)
 *  - Course field renames:
 *      courseCode     → removed (not in Course schema; use title uniqueness)
 *      categoryId     → category  (String, not a relation)
 *      categoryName   → removed
 *      durationUnit   → removed
 *      objectives / prerequisites → prerequisites (String[])
 *      targetAudience → removed
 *      competencies   → removed
 *      maxParticipants → maxEnrollment
 *      currentEnrollments → enrollmentCount
 *      isComplianceTraining → removed
 *      publishedDate  → removed
 *      skills         → skills (String[]) — kept
 *  - LearningPath field renames:
 *      estimatedHours  → duration
 *      completionRate  → removed
 *  - Assessment field renames:
 *      assessmentCode  → removed
 *      courseId        → pathId (links to LearningPath, not Course)
 *      totalPoints     → removed
 *      isRandomized/showResults/allowReview → removed
 *      questions       → questions (Json) — kept
 *      instructions    → removed
 *      isActive        → removed
 *  - CourseEnrollment (was Enrollment) field renames:
 *      enrollmentNumber → removed
 *      learnerId        → employeeId
 *      learnerName/Email → removed (denormalised fields not in schema)
 *      enrollmentType   → removed
 *      enrolledDate     → enrolledAt
 *      timeSpent        → removed
 *      attempts/maxAttempts → removed
 *      learningPathId   → separate LearningPathEnrollment model
 *  - AssessmentSubmission (was AssessmentAttempt):
 *      learnerId        → employeeId
 *      learnerName      → removed
 *      attemptNumber    → attemptNumber (kept)
 *      duration         → removed
 *      percentage       → removed
 *      answers          → answers (Json)
 *  - Certification field renames:
 *      certificateNumber → certificationId
 *      certificateName   → name
 *      learnerId         → employeeId
 *      learnerName/Email → removed
 *      courseId/courseName → removed (not in Certification schema)
 *      issuedDate        → issueDate
 *      issuedBy          → removed (no field)
 *      verificationUrl   → credentialUrl
 */

import { PrismaClient } from '@prisma/client';

export async function learningSeed(prisma: PrismaClient, tenantId: string) {
    console.log('Seeding Learning & Development data...');

    // -----------------------------------------------------------------------
    // 1. Courses
    // -----------------------------------------------------------------------
    const course1 = await prisma.course.create({
        data: {
            tenantId,
            title: 'Leadership Fundamentals',
            description: 'Learn essential leadership skills for new managers and team leads.',
            type: 'INSTRUCTOR_LED',
            level: 'BEGINNER',
            status: 'PUBLISHED',
            category: 'Leadership',                    // was categoryId+categoryName
            duration: 16,
            skills: ['Leadership', 'Communication', 'Conflict Resolution'],
            prerequisites: [],
            maxEnrollment: 50,                         // was maxParticipants
            enrollmentCount: 12,                       // was currentEnrollments
            passingScore: 70,
            cost: 0,
            createdBy: 'system',
        },
    });

    const course2 = await prisma.course.create({
        data: {
            tenantId,
            title: 'Advanced React Patterns',
            description: 'Master advanced React patterns including hooks, context, and state management.',
            type: 'E_LEARNING',
            level: 'ADVANCED',
            status: 'PUBLISHED',
            category: 'Technical',
            duration: 24,
            skills: ['React', 'JavaScript', 'Performance Optimization'],
            prerequisites: ['Basic React knowledge', 'JavaScript ES6+'],
            maxEnrollment: 100,
            enrollmentCount: 35,
            passingScore: 80,
            cost: 0,
            createdBy: 'system',
        },
    });

    const course3 = await prisma.course.create({
        data: {
            tenantId,
            title: 'Information Security & GDPR Compliance',
            description: 'Essential training on information security best practices and GDPR compliance.',
            type: 'E_LEARNING',
            level: 'BEGINNER',
            status: 'PUBLISHED',
            category: 'Compliance',
            duration: 4,
            skills: ['Information Security', 'GDPR', 'Data Protection'],
            prerequisites: [],
            maxEnrollment: 500,
            enrollmentCount: 248,
            passingScore: 90,
            cost: 0,
            createdBy: 'system',
        },
    });

    const course4 = await prisma.course.create({
        data: {
            tenantId,
            title: 'Project Management Professional (PMP) Prep',
            description: 'Comprehensive preparation for the PMP certification exam.',
            type: 'BLENDED',
            level: 'INTERMEDIATE',
            status: 'PUBLISHED',
            category: 'Project Management',
            duration: 35,
            skills: ['Project Management', 'Agile', 'Risk Management'],
            prerequisites: ['3 years project management experience'],
            maxEnrollment: 30,
            enrollmentCount: 18,
            passingScore: 75,
            cost: 299,
            createdBy: 'system',
        },
    });

    // -----------------------------------------------------------------------
    // 2. Learning Paths
    // -----------------------------------------------------------------------
    const learningPath1 = await prisma.learningPath.create({
        data: {
            tenantId,
            title: 'Engineering Leadership Track',
            description: 'A comprehensive path for engineers transitioning to leadership roles.',
            difficulty: 'INTERMEDIATE',
            duration: 80,                              // was estimatedHours
            modules: [
                { id: 'lm-1', title: 'Leadership Fundamentals', type: 'course', courseId: course1.id, order: 1 },
                { id: 'lm-2', title: 'Advanced React Patterns', type: 'course', courseId: course2.id, order: 2 },
                { id: 'lm-3', title: 'PMP Certification Prep', type: 'course', courseId: course4.id, order: 3 },
            ],
            skills: ['Leadership', 'Technical Architecture', 'Project Management'],
            isPublished: true,
            createdBy: 'system',
        },
    });

    const learningPath2 = await prisma.learningPath.create({
        data: {
            tenantId,
            title: 'Compliance & Security Essentials',
            description: 'Mandatory compliance training for all employees.',
            difficulty: 'BEGINNER',
            duration: 8,
            modules: [
                { id: 'lm-c1', title: 'GDPR Compliance', type: 'course', courseId: course3.id, order: 1 },
            ],
            skills: ['Compliance', 'Information Security'],
            isPublished: true,
            createdBy: 'system',
        },
    });

    // -----------------------------------------------------------------------
    // 3. Enrollments  →  CourseEnrollment (was prisma.enrollment)
    //    + LearningPathEnrollment for path-based enrollment
    // -----------------------------------------------------------------------
    await prisma.courseEnrollment.create({              // was prisma.enrollment
        data: {
            tenantId,
            courseId: course2.id,
            employeeId: 'user-1',                       // was learnerId
            status: 'in_progress',
            progress: 45,
            enrolledAt: new Date('2024-11-01'),         // was enrolledDate
            startedAt: new Date('2024-11-01'),
            score: null,
        },
    });

    await prisma.courseEnrollment.create({
        data: {
            tenantId,
            courseId: course3.id,
            employeeId: 'user-2',
            status: 'completed',
            progress: 100,
            enrolledAt: new Date('2024-01-15'),
            startedAt: new Date('2024-01-15'),
            completedAt: new Date('2024-01-20'),
            score: 95,
        },
    });

    // Path-based enrollment uses LearningPathEnrollment
    await prisma.learningPathEnrollment.create({
        data: {
            tenantId,
            pathId: learningPath1.id,
            employeeId: 'user-3',
            status: 'IN_PROGRESS',
            progress: 25,
            enrolledAt: new Date('2024-10-15'),
        },
    });

    // -----------------------------------------------------------------------
    // 4. Assessments
    //    courseId → pathId (Assessment links to LearningPath.pathId not Course)
    // -----------------------------------------------------------------------
    const assessment1 = await prisma.assessment.create({
        data: {
            tenantId,
            title: 'Leadership Fundamentals Quiz',
            description: 'Final assessment for Leadership Fundamentals course',
            pathId: learningPath1.id,               // was courseId
            questions: [
                { id: 'q1', type: 'multiple_choice', text: 'What is the most important skill for a leader?', points: 10, options: ['A', 'B', 'C', 'D'], correctAnswer: 'A' },
                { id: 'q2', type: 'multiple_choice', text: 'How should conflicts be resolved?', points: 10, options: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
                { id: 'q3', type: 'short_answer', text: 'Describe your leadership style.', points: 20, options: [], correctAnswer: null },
            ],
            passingScore: 70,
            timeLimit: 60,
            maxAttempts: 3,
            isPublished: true,
            createdBy: 'system',
        },
    });

    const assessment2 = await prisma.assessment.create({
        data: {
            tenantId,
            title: 'GDPR Compliance Exam',
            description: 'Mandatory compliance exam for GDPR training',
            pathId: learningPath2.id,
            questions: [
                { id: 'q1', type: 'true_false', text: 'GDPR applies to all EU citizens data.', points: 5, options: ['True', 'False'], correctAnswer: 'True' },
                { id: 'q2', type: 'multiple_choice', text: 'What is the penalty for GDPR violations?', points: 10, options: ['A', 'B', 'C', 'D'], correctAnswer: 'A' },
            ],
            passingScore: 90,
            timeLimit: 45,
            maxAttempts: 2,
            isPublished: true,
            createdBy: 'system',
        },
    });

    // -----------------------------------------------------------------------
    // 5. Assessment Attempts  →  AssessmentSubmission (was assessmentAttempt)
    //    learnerId → employeeId
    // -----------------------------------------------------------------------
    await prisma.assessmentSubmission.create({          // was prisma.assessmentAttempt
        data: {
            assessmentId: assessment2.id,
            employeeId: 'user-2',                       // was learnerId
            answers: [
                { questionId: 'q1', answer: 'True', isCorrect: true },
                { questionId: 'q2', answer: 'A', isCorrect: true },
            ],
            score: 95,
            passed: true,
            attemptNumber: 1,
            startedAt: new Date('2024-01-20T10:00:00Z'),
            submittedAt: new Date('2024-01-20T10:35:00Z'),
        },
    });

    // -----------------------------------------------------------------------
    // 6. Certifications  →  Certification
    //    certificateNumber → certificationId
    //    certificateName   → name
    //    learnerId         → employeeId
    //    issuedDate        → issueDate
    //    verificationUrl   → credentialUrl
    // -----------------------------------------------------------------------
    await prisma.certification.create({
        data: {
            tenantId,
            certificationId: 'CERT-2024-001',          // was certificateNumber
            name: 'GDPR Compliance Certification',      // was certificateName
            employeeId: 'user-2',                       // was learnerId
            issuingBody: 'AuraOS Compliance',
            issueDate: new Date('2024-01-20'),          // was issuedDate
            expiryDate: new Date('2025-01-20'),
            status: 'active',
            credentialUrl: 'https://verify.example.com/CERT-2024-001', // was verificationUrl
            skills: ['GDPR', 'Data Protection'],
        },
    });

    await prisma.certification.create({
        data: {
            tenantId,
            certificationId: 'CERT-2024-002',
            name: 'Leadership Fundamentals Certificate',
            employeeId: 'user-1',
            issuingBody: 'AuraOS Learning',
            issueDate: new Date('2024-03-15'),
            status: 'active',
            credentialUrl: 'https://verify.example.com/CERT-2024-002',
            skills: ['Leadership', 'Management'],
        },
    });

    console.log('Learning & Development seed data created successfully!');
    console.log('- Created 4 courses');
    console.log('- Created 2 learning paths');
    console.log('- Created 2 course enrollments + 1 path enrollment');
    console.log('- Created 2 assessments');
    console.log('- Created 1 assessment submission');
    console.log('- Created 2 certifications');
}
