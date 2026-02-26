/**
 * Performance Management Seed
 *
 * Schema alignment fixes:
 *  - performanceReviewCycle  → reviewCycle  (ReviewCycle model)
 *  - performanceCompetency   → competencyCatalog (CompetencyCatalog model, with
 *                              CompetencyCategory lookup)
 *  - feedback                → continuousFeedback (ContinuousFeedback model)
 *  - developmentPlanPerf     → developmentPlan (DevelopmentPlan model)
 *  - calibration             → calibrationSession (CalibrationSession model)
 *  - PerformanceReview field names mapped to actual schema fields:
 *      overallRating         → finalRating
 *      overallComments       → managerComments / selfComments
 *      strengths             → strengths (Json, stored as JSON array)
 *      areasForImprovement   → improvements (Json)
 *      selfAssessment        → competencies (Json)
 *      managerAssessment     → competencies (Json)
 *  - PerformanceGoal:
 *      cycleId               → reviewCycleId
 *      weightage             → weight
 *  - OneOnOneMeeting:
 *      scheduledDate         → scheduledAt
 *      notes / agenda removed (stored via OneOnOneNote relation or metadata)
 *  - CalibrationSession:
 *      cycleId               → reviewCycleId
 *      name                  → sessionName
 *      meetingDate           → scheduledDate
 *      decisions             → adjustments (Json)
 */

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
        console.log('No employees found. Skipping performance seed.');
        return;
    }

    // -----------------------------------------------------------------------
    // 1. Performance Review Cycles  →  ReviewCycle
    // -----------------------------------------------------------------------
    const cycleData = [
        {
            id: 'cycle-2024-annual',
            cycleName: '2024 Annual Performance Review',
            description: 'Annual performance review cycle for all employees',
            cycleType: 'annual',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            status: 'active',
        },
        {
            id: 'cycle-2024-q4',
            cycleName: 'Q4 2024 Quarterly Review',
            description: 'Quarterly review for Q4 2024',
            cycleType: 'quarterly',
            startDate: new Date('2024-10-01'),
            endDate: new Date('2024-12-31'),
            status: 'completed',
        },
        {
            id: 'cycle-2025-q1',
            cycleName: 'Q1 2025 Quarterly Review',
            description: 'Quarterly review for Q1 2025',
            cycleType: 'quarterly',
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-03-31'),
            status: 'draft',
        },
    ];

    for (const cycle of cycleData) {
        await prisma.reviewCycle.upsert({
            where: { id: cycle.id },
            update: {},
            create: {
                ...cycle,
                tenantId,
                createdBy: employees[0].id,
            },
        });
    }
    console.log(`Created ${cycleData.length} review cycles`);

    // -----------------------------------------------------------------------
    // 2. Performance Goals  →  PerformanceGoal
    //    cycleId → reviewCycleId; weightage → weight
    // -----------------------------------------------------------------------
    const goalTemplates = [
        { title: 'Increase sales revenue by 20%', type: 'individual', category: 'KPI', targetValue: 120000, unit: 'USD' },
        { title: 'Complete professional certification', type: 'individual', category: 'SMART', progress: 65 },
        { title: 'Improve customer satisfaction score', type: 'team', category: 'KPI', targetValue: 4.5, currentValue: 4.1, unit: 'rating' },
        { title: 'Launch new product feature', type: 'team', category: 'OKR', progress: 80 },
        { title: 'Reduce operational costs by 15%', type: 'individual', category: 'KPI', targetValue: 85, unit: 'percentage' },
        { title: 'Complete leadership training program', type: 'individual', category: 'SMART', progress: 45 },
        { title: 'Mentor 2 junior team members', type: 'individual', category: 'SMART', targetValue: 2, currentValue: 1, unit: 'members' },
        { title: 'Improve code quality metrics', type: 'team', category: 'KPI', targetValue: 90, currentValue: 75, unit: 'percentage' },
    ];

    let goalCount = 0;
    for (const employee of employees.slice(0, 8)) {
        const template = goalTemplates[goalCount % goalTemplates.length];
        const progress = template.progress ?? 0;
        await prisma.performanceGoal.create({
            data: {
                title: template.title,
                description: `Performance goal for ${employee.firstName} ${employee.lastName}`,
                type: template.type,
                category: template.category,
                targetValue: template.targetValue ?? null,
                currentValue: template.currentValue ?? 0,
                unit: template.unit ?? null,
                weight: 20,                   // was `weightage` — schema field is `weight`
                startDate: new Date('2024-01-01'),
                dueDate: new Date('2024-12-31'),
                status: progress >= 100 ? 'completed' : progress > 0 ? 'active' : 'not_started',
                progress,
                reviewCycleId: 'cycle-2024-annual', // was `cycleId`
                employeeId: employee.id,
                tenantId,
                createdBy: employee.managerId ?? employee.id,
            },
        });
        goalCount++;
    }
    console.log(`Created ${goalCount} performance goals`);

    // -----------------------------------------------------------------------
    // 3. Performance Reviews  →  PerformanceReview
    //    Field renames:
    //      overallRating       → finalRating / selfRating / managerRating
    //      overallComments     → selfComments / managerComments
    //      strengths           → strengths (Json)
    //      areasForImprovement → improvements (Json)
    //      selfAssessment      → competencies (Json)
    //      reviewType values   → lowercase to match schema defaults
    // -----------------------------------------------------------------------
    let reviewCount = 0;
    for (const employee of employees.slice(0, 6)) {
        if (!employee.managerId) continue;

        // Self Review
        await prisma.performanceReview.create({
            data: {
                reviewCycleId: 'cycle-2024-q4',
                employeeId: employee.id,
                reviewerId: employee.id,
                reviewType: 'self',
                status: 'submitted',
                selfRating: 4.2,
                finalRating: 4.2,
                selfComments: 'I have made significant progress on my goals this quarter.',
                strengths: ['Strong technical skills', 'Good communication', 'Proactive problem-solving'],
                improvements: ['Time management', 'Delegation skills'],
                competencies: {
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
                reviewCycleId: 'cycle-2024-q4',
                employeeId: employee.id,
                reviewerId: employee.managerId,
                reviewType: 'manager',
                status: 'in_progress',
                managerRating: 4.0,
                managerComments: 'Consistently delivers high-quality work and shows initiative.',
                strengths: ['Technical expertise', 'Reliability', 'Good team player'],
                improvements: ['Presentation skills', 'Strategic thinking'],
                competencies: {
                    technicalSkills: 4,
                    communication: 4,
                    problemSolving: 5,
                    initiative: 4,
                },
                tenantId,
            },
        });

        reviewCount += 2;
    }
    console.log(`Created ${reviewCount} performance reviews`);

    // -----------------------------------------------------------------------
    // 4. Competencies  →  CompetencyCatalog
    //    Requires a CompetencyCategory to exist. We use upsert for safety.
    // -----------------------------------------------------------------------
    const competencyDefs = [
        { code: 'TECH-EXPERTISE', name: 'Technical Expertise', category: 'TECHNICAL', description: 'Demonstrates proficiency in technical skills required for the role' },
        { code: 'COMMUNICATION', name: 'Communication', category: 'CORE', description: 'Effectively communicates with team members and stakeholders' },
        { code: 'LEADERSHIP', name: 'Leadership', category: 'LEADERSHIP', description: 'Demonstrates leadership qualities and inspires others' },
    ];

    for (const comp of competencyDefs) {
        // Ensure the category exists
        const cat = await prisma.competencyCategory.upsert({
            where: { code: comp.category },
            update: {},
            create: {
                code: comp.category,
                name: comp.category.charAt(0) + comp.category.slice(1).toLowerCase(),
                status: 'Active',
            },
        });

        await prisma.competencyCatalog.upsert({
            where: { code: comp.code },
            update: {},
            create: {
                code: comp.code,
                name: comp.name,
                description: comp.description,
                categoryId: cat.id,
                status: 'Active',
            },
        });
    }
    console.log(`Created ${competencyDefs.length} competencies`);

    // -----------------------------------------------------------------------
    // 5. Feedback  →  ContinuousFeedback
    //    Field renames:
    //      providedBy → fromUserId
    //      content    → message
    //      (no isPrivate / tags on ContinuousFeedback — stored in visibility)
    //      type values: RECOGNITION → PRAISE; CONSTRUCTIVE stays; others → SUGGESTION
    // -----------------------------------------------------------------------
    const feedbackTypeMap: Record<string, string> = {
        RECOGNITION: 'PRAISE',
        CONSTRUCTIVE: 'CONSTRUCTIVE',
        CONTINUOUS: 'SUGGESTION',
        FORMAL: 'SUGGESTION',
    };

    const feedbackTemplates = [
        { type: 'RECOGNITION', content: 'Great job on the presentation! Your clarity and engagement with the audience were excellent.' },
        { type: 'CONSTRUCTIVE', content: 'Consider breaking down complex tasks into smaller milestones to improve delivery predictability.' },
        { type: 'CONTINUOUS', content: 'Your collaboration on the recent project was outstanding. Keep up the excellent teamwork!' },
        { type: 'FORMAL', content: 'Mid-year check-in: You are on track with your goals. Focus on the certification completion in Q3.' },
    ];

    let feedbackCount = 0;
    for (const employee of employees.slice(0, 5)) {
        if (!employee.managerId) continue;

        const template = feedbackTemplates[feedbackCount % feedbackTemplates.length];
        await prisma.continuousFeedback.create({
            data: {
                toEmployeeId: employee.id,
                fromUserId: employee.managerId,   // was `providedBy`
                type: feedbackTypeMap[template.type] ?? 'SUGGESTION',
                message: template.content,         // was `content`
                isAnonymous: false,
                visibility: 'PRIVATE',
                tenantId,
            },
        });
        feedbackCount++;
    }
    console.log(`Created ${feedbackCount} feedback entries`);

    // -----------------------------------------------------------------------
    // 6. Development Plans  →  DevelopmentPlan
    //    DevelopmentPlan requires a unique `code`. We use employeeId for that.
    //    Fields: title → name, targetDate → endDate, progress removed (not in schema)
    // -----------------------------------------------------------------------
    for (const employee of employees.slice(0, 4)) {
        const planCode = `DEV-PLAN-${employee.id.slice(0, 8).toUpperCase()}`;
        await prisma.developmentPlan.upsert({
            where: { code: planCode },
            update: {},
            create: {
                code: planCode,
                name: `${new Date().getFullYear()} Professional Development Plan — ${employee.firstName}`,
                description: `Development plan for ${employee.firstName} ${employee.lastName}`,
                type: 'Individual',
                targetType: 'Employee',
                targetId: employee.id,
                status: 'Active',
                startDate: new Date('2025-01-01'),
                endDate: new Date('2025-12-31'),    // was `targetDate`
                budget: 2000,
                createdBy: employee.managerId ?? employee.id,
            },
        });
    }
    console.log(`Created ${employees.slice(0, 4).length} development plans`);

    // -----------------------------------------------------------------------
    // 7. Calibration Sessions  →  CalibrationSession
    //    Field renames:
    //      name        → sessionName
    //      cycleId     → reviewCycleId
    //      meetingDate → scheduledDate
    //      decisions   → adjustments (Json)
    // -----------------------------------------------------------------------
    const managers = employees.filter(
        (e) => e.managerId === null || employees.some((emp) => emp.managerId === e.id)
    );

    if (managers.length >= 2) {
        await prisma.calibrationSession.create({
            data: {
                sessionName: 'Q4 2024 Performance Calibration Session', // was `name`
                reviewCycleId: 'cycle-2024-q4',                        // was `cycleId`
                status: 'completed',
                scheduledDate: new Date('2024-12-28'),                  // was `meetingDate`
                completedDate: new Date('2024-12-28'),
                facilitatorId: managers[0].id,
                department: 'Engineering',
                participants: managers.slice(0, 3).map((m) => m.id),
                adjustments: {                                          // was `decisions`
                    adjustments: [
                        { employeeId: employees[0].id, originalRating: 4, calibratedRating: 4.5, reason: 'Exceptional performance on critical project' },
                        { employeeId: employees[1]?.id, originalRating: 3.5, calibratedRating: 3.5, reason: 'Rating confirmed as appropriate' },
                    ],
                },
                notes: 'Calibration session completed successfully.',
                createdBy: managers[0].id,
                tenantId,
            },
        });
        console.log('Created 1 calibration session');
    }

    // -----------------------------------------------------------------------
    // 8. One-on-One Meetings  →  OneOnOneMeeting
    //    Field renames:
    //      scheduledDate → scheduledAt
    //    Removed fields not in schema: agenda, notes, actionItems, nextSteps
    //    (those belong to OneOnOneNote / OneOnOneActionItem relations)
    // -----------------------------------------------------------------------
    let meetingCount = 0;
    for (const employee of employees.slice(0, 5)) {
        if (!employee.managerId) continue;

        // Past completed meeting
        await prisma.oneOnOneMeeting.create({
            data: {
                employeeId: employee.id,
                managerId: employee.managerId,
                scheduledAt: new Date('2024-12-15T10:00:00'), // was `scheduledDate`
                duration: 60,
                status: 'COMPLETED',
                completedAt: new Date('2024-12-15T11:00:00'),
                tenantId,
            },
        });

        // Upcoming meeting
        await prisma.oneOnOneMeeting.create({
            data: {
                employeeId: employee.id,
                managerId: employee.managerId,
                scheduledAt: new Date('2025-01-20T14:00:00'), // was `scheduledDate`
                duration: 60,
                status: 'SCHEDULED',
                tenantId,
            },
        });

        meetingCount += 2;
    }
    console.log(`Created ${meetingCount} one-on-one meetings`);

    console.log('Performance Management seed data completed successfully');
}
