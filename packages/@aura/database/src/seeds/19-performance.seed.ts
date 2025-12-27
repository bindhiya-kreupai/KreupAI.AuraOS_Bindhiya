import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function performanceSeed(tenantId: string) {
    console.log('...Seeding Performance Management Data');

    // Get some employees for testing (we'll use the first 10)
    const employees = await prisma.employee.findMany({
        take: 10,
        include: {
            manager: true,
        },
    });

    if (employees.length === 0) {
        console.log('⚠️  No employees found. Skipping performance seed.');
        return;
    }

    // Create Performance Review Cycles
    const cycles = [
        {
            id: 'cycle-2024-annual',
            name: '2024 Annual Performance Review',
            description: 'Annual performance review cycle for all employees',
            type: 'ANNUAL' as const,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            reviewDueDate: new Date('2025-01-15'),
            status: 'ACTIVE' as const,
        },
        {
            id: 'cycle-2024-q4',
            name: 'Q4 2024 Quarterly Review',
            description: 'Quarterly review for Q4 2024',
            type: 'QUARTERLY' as const,
            startDate: new Date('2024-10-01'),
            endDate: new Date('2024-12-31'),
            reviewDueDate: new Date('2025-01-10'),
            status: 'IN_REVIEW' as const,
        },
        {
            id: 'cycle-2025-q1',
            name: 'Q1 2025 Quarterly Review',
            description: 'Quarterly review for Q1 2025',
            type: 'QUARTERLY' as const,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-03-31'),
            reviewDueDate: new Date('2025-04-15'),
            status: 'DRAFT' as const,
        },
    ];

    for (const cycleData of cycles) {
        await prisma.performanceReviewCycle.upsert({
            where: { id: cycleData.id },
            update: {},
            create: {
                ...cycleData,
                tenantId,
                createdBy: employees[0].id,
            },
        });
    }
    console.log(`✅ Created ${cycles.length} performance review cycles`);

    // Create Performance Goals
    const goalTemplates = [
        { title: 'Increase sales revenue by 20%', type: 'INDIVIDUAL' as const, category: 'KPI', targetValue: 120000, unit: 'USD' },
        { title: 'Complete professional certification', type: 'INDIVIDUAL' as const, category: 'SMART', progress: 65 },
        { title: 'Improve customer satisfaction score', type: 'TEAM' as const, category: 'KPI', targetValue: 4.5, currentValue: 4.1, unit: 'rating' },
        { title: 'Launch new product feature', type: 'TEAM' as const, category: 'OKR', progress: 80 },
        { title: 'Reduce operational costs by 15%', type: 'ORGANIZATIONAL' as const, category: 'KPI', targetValue: 85, unit: 'percentage' },
        { title: 'Complete leadership training program', type: 'INDIVIDUAL' as const, category: 'SMART', progress: 45 },
        { title: 'Mentor 2 junior team members', type: 'INDIVIDUAL' as const, category: 'SMART', targetValue: 2, currentValue: 1, unit: 'members' },
        { title: 'Improve code quality metrics', type: 'TEAM' as const, category: 'KPI', targetValue: 90, currentValue: 75, unit: 'percentage' },
    ];

    let goalCount = 0;
    for (const employee of employees.slice(0, 8)) {
        const template = goalTemplates[goalCount % goalTemplates.length];
        const startDate = new Date('2024-01-01');
        const dueDate = new Date('2024-12-31');

        const progress = template.progress || 0;
        await prisma.performanceGoal.create({
            data: {
                title: template.title,
                description: `Performance goal for ${employee.firstName} ${employee.lastName}`,
                type: template.type,
                category: template.category,
                targetValue: template.targetValue || null,
                currentValue: template.currentValue || 0,
                unit: template.unit || null,
                weightage: 20,
                startDate,
                dueDate,
                status: progress >= 100 ? 'COMPLETED' : progress > 0 ? 'ACTIVE' : 'DRAFT',
                progress,
                cycleId: cycles[0].id,
                employeeId: employee.id,
                tenantId,
                createdBy: employee.managerId || employee.id,
            },
        });
        goalCount++;
    }
    console.log(`✅ Created ${goalCount} performance goals`);

    // Create Performance Reviews
    const reviewCount = 0;
    for (const employee of employees.slice(0, 6)) {
        if (!employee.managerId) continue;

        // Self Review
        await prisma.performanceReview.create({
            data: {
                cycleId: cycles[1].id, // Q4 2024
                employeeId: employee.id,
                reviewerId: employee.id,
                reviewType: 'SELF',
                status: 'SUBMITTED',
                overallRating: 4.2,
                overallComments: 'I have made significant progress on my goals this quarter. Key achievements include completing major project milestones and improving team collaboration.',
                strengths: 'Strong technical skills, good communication, proactive problem-solving',
                areasForImprovement: 'Time management, delegation skills',
                selfAssessment: {
                    technicalSkills: 4,
                    communication: 4,
                    teamwork: 5,
                    leadership: 3,
                },
                submittedAt: new Date('2024-12-20'),
                tenantId,
            },
        });

        // Manager Review
        await prisma.performanceReview.create({
            data: {
                cycleId: cycles[1].id, // Q4 2024
                employeeId: employee.id,
                reviewerId: employee.managerId,
                reviewType: 'MANAGER',
                status: 'IN_PROGRESS',
                overallRating: 4.0,
                overallComments: 'Consistently delivers high-quality work and shows initiative in taking on new challenges.',
                strengths: 'Technical expertise, reliability, good team player',
                areasForImprovement: 'Could benefit from improving presentation skills and strategic thinking',
                managerAssessment: {
                    technicalSkills: 4,
                    communication: 4,
                    problemSolving: 5,
                    initiative: 4,
                },
                tenantId,
            },
        });
    }
    console.log(`✅ Created ${employees.slice(0, 6).filter(e => e.managerId).length * 2} performance reviews`);

    // Create Competencies
    const competencies = [
        {
            name: 'Technical Expertise',
            description: 'Demonstrates proficiency in technical skills required for the role',
            category: 'Technical',
            type: 'TECHNICAL' as const,
            levels: [
                { level: 1, name: 'Foundational', description: 'Basic understanding of core concepts' },
                { level: 2, name: 'Developing', description: 'Can apply skills with guidance' },
                { level: 3, name: 'Proficient', description: 'Independently applies skills effectively' },
                { level: 4, name: 'Advanced', description: 'Expert level with ability to teach others' },
                { level: 5, name: 'Expert', description: 'Recognized authority and innovator' },
            ],
        },
        {
            name: 'Communication',
            description: 'Effectively communicates with team members and stakeholders',
            category: 'Soft Skills',
            type: 'CORE' as const,
            levels: [
                { level: 1, name: 'Basic', description: 'Can convey simple messages clearly' },
                { level: 2, name: 'Developing', description: 'Communicates well in familiar situations' },
                { level: 3, name: 'Proficient', description: 'Adapts communication style to audience' },
                { level: 4, name: 'Advanced', description: 'Influences and persuades effectively' },
                { level: 5, name: 'Expert', description: 'Master communicator across all levels' },
            ],
        },
        {
            name: 'Leadership',
            description: 'Demonstrates leadership qualities and inspires others',
            category: 'Leadership',
            type: 'LEADERSHIP' as const,
            levels: [
                { level: 1, name: 'Emerging', description: 'Shows potential for leadership' },
                { level: 2, name: 'Developing', description: 'Leads small teams or projects' },
                { level: 3, name: 'Proficient', description: 'Effectively leads teams and initiatives' },
                { level: 4, name: 'Advanced', description: 'Strategic leader with proven track record' },
                { level: 5, name: 'Expert', description: 'Visionary leader who transforms organizations' },
            ],
        },
    ];

    for (const comp of competencies) {
        await prisma.performanceCompetency.create({
            data: {
                name: comp.name,
                description: comp.description,
                category: comp.category,
                type: comp.type,
                levels: comp.levels,
                isActive: true,
                tenantId,
            },
        });
    }
    console.log(`✅ Created ${competencies.length} competencies`);

    // Create Feedback entries
    const feedbackTemplates = [
        { type: 'RECOGNITION' as const, content: 'Great job on the presentation! Your clarity and engagement with the audience were excellent.' },
        { type: 'CONSTRUCTIVE' as const, content: 'Consider breaking down complex tasks into smaller milestones to improve delivery predictability.' },
        { type: 'CONTINUOUS' as const, content: 'Your collaboration on the recent project was outstanding. Keep up the excellent teamwork!' },
        { type: 'FORMAL' as const, content: 'Mid-year check-in: You are on track with your goals. Focus on the certification completion in Q3.' },
    ];

    let feedbackCount = 0;
    for (const employee of employees.slice(0, 5)) {
        if (!employee.managerId) continue;

        const template = feedbackTemplates[feedbackCount % feedbackTemplates.length];
        await prisma.feedback.create({
            data: {
                employeeId: employee.id,
                providedBy: employee.managerId,
                type: template.type,
                content: template.content,
                isPrivate: false,
                isAnonymous: false,
                tags: ['performance', 'quarterly-review'],
                tenantId,
            },
        });
        feedbackCount++;
    }
    console.log(`✅ Created ${feedbackCount} feedback entries`);

    // Create Development Plans
    for (const employee of employees.slice(0, 4)) {
        await prisma.developmentPlanPerf.create({
            data: {
                employeeId: employee.id,
                title: `${new Date().getFullYear()} Professional Development Plan`,
                description: `Development plan to enhance skills and career progression for ${employee.firstName} ${employee.lastName}`,
                goals: [
                    {
                        title: 'Complete Advanced Technical Certification',
                        targetDate: '2025-06-30',
                        status: 'in_progress',
                    },
                    {
                        title: 'Mentor Junior Team Member',
                        targetDate: '2025-12-31',
                        status: 'not_started',
                    },
                ],
                actions: [
                    {
                        action: 'Enroll in certification course',
                        dueDate: '2025-02-01',
                        status: 'completed',
                    },
                    {
                        action: 'Complete course modules',
                        dueDate: '2025-05-31',
                        status: 'in_progress',
                    },
                    {
                        action: 'Schedule mentoring sessions',
                        dueDate: '2025-03-01',
                        status: 'not_started',
                    },
                ],
                resources: {
                    budget: 2000,
                    currency: 'USD',
                    materials: ['Online certification', 'Books', 'Conference attendance'],
                },
                status: 'ACTIVE',
                startDate: new Date('2025-01-01'),
                targetDate: new Date('2025-12-31'),
                progress: 30,
                tenantId,
                createdBy: employee.managerId || employee.id,
            },
        });
    }
    console.log(`✅ Created ${employees.slice(0, 4).length} development plans`);

    // Create Calibration Sessions
    const managers = employees.filter(e => e.managerId === null || employees.some(emp => emp.managerId === e.id));
    if (managers.length >= 2) {
        await prisma.calibration.create({
            data: {
                cycleId: cycles[1].id, // Q4 2024
                name: 'Q4 2024 Performance Calibration Session',
                participants: managers.slice(0, 3).map(m => m.id),
                status: 'COMPLETED',
                meetingDate: new Date('2024-12-28'),
                decisions: {
                    adjustments: [
                        { employeeId: employees[0].id, originalRating: 4, calibratedRating: 4.5, reason: 'Exceptional performance on critical project' },
                        { employeeId: employees[1].id, originalRating: 3.5, calibratedRating: 3.5, reason: 'Rating confirmed as appropriate' },
                    ],
                },
                notes: 'Calibration session completed successfully. All ratings reviewed and adjusted where appropriate.',
                tenantId,
            },
        });
        console.log('✅ Created 1 calibration session');
    }

    // Create One-on-One Meetings
    let meetingCount = 0;
    for (const employee of employees.slice(0, 5)) {
        if (!employee.managerId) continue;

        // Past meeting
        await prisma.oneOnOneMeeting.create({
            data: {
                employeeId: employee.id,
                managerId: employee.managerId,
                scheduledDate: new Date('2024-12-15T10:00:00'),
                duration: 60,
                status: 'COMPLETED',
                agenda: [
                    { topic: 'Q4 Goals Review', duration: 20 },
                    { topic: 'Career Development Discussion', duration: 25 },
                    { topic: 'Feedback and Questions', duration: 15 },
                ],
                notes: 'Good progress on quarterly goals. Discussed career aspirations and identified training opportunities.',
                actionItems: [
                    { action: 'Enroll in leadership training', owner: employee.id, dueDate: '2025-01-15' },
                    { action: 'Review Q1 goal proposals', owner: employee.managerId, dueDate: '2025-01-05' },
                ],
                nextSteps: 'Follow up on training enrollment and schedule next 1:1 for mid-January.',
                completedAt: new Date('2024-12-15T11:00:00'),
                tenantId,
            },
        });

        // Upcoming meeting
        await prisma.oneOnOneMeeting.create({
            data: {
                employeeId: employee.id,
                managerId: employee.managerId,
                scheduledDate: new Date('2025-01-20T14:00:00'),
                duration: 60,
                status: 'SCHEDULED',
                agenda: [
                    { topic: 'Q1 Goals Planning', duration: 30 },
                    { topic: 'Development Plan Update', duration: 20 },
                    { topic: 'Team Collaboration', duration: 10 },
                ],
                tenantId,
            },
        });
        meetingCount += 2;
    }
    console.log(`✅ Created ${meetingCount} one-on-one meetings`);

    console.log('✅ Performance Management seed data completed successfully');
}
