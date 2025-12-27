/**
 * Seed Onboarding Module Data
 * Run with: npx tsx packages/@aura/database/scripts/seed-onboarding.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TENANT_ID = 'default-tenant';
const USER_ID = 'system-admin';

async function main() {
    console.log('🌱 Seeding Onboarding Module Data...');

    // Clear existing onboarding data (cascading deletes will handle related records)
    await prisma.onboardingProgram.deleteMany({ where: { tenantId: TENANT_ID } });
    console.log('✅ Cleared existing onboarding data');

    // 1. Create Onboarding Programs
    console.log('📋 Creating onboarding programs...');

    const engineeringProgram = await prisma.onboardingProgram.create({
        data: {
            tenantId: TENANT_ID,
            programCode: 'OBP-ENG-001',
            programName: 'Software Engineering Onboarding',
            description: 'Comprehensive onboarding program for software engineers including technical setup, code standards, and team integration.',
            department: 'Engineering',
            durationDays: 90,
            isTemplate: true,
            isActive: true,
            createdBy: USER_ID,
        }
    });

    const salesProgram = await prisma.onboardingProgram.create({
        data: {
            tenantId: TENANT_ID,
            programCode: 'OBP-SALES-001',
            programName: 'Sales Team Onboarding',
            description: 'Onboarding program for sales representatives covering product knowledge, sales processes, and CRM training.',
            department: 'Sales',
            durationDays: 60,
            isTemplate: true,
            isActive: true,
            createdBy: USER_ID,
        }
    });

    console.log(`✅ Created 2 onboarding programs`);

    // 2. Create Onboarding Instances
    console.log('👤 Creating onboarding instances...');

    const instance1 = await prisma.onboardingInstance.create({
        data: {
            tenantId: TENANT_ID,
            onboardingCode: 'ONB-2024-001',
            programId: engineeringProgram.id,
            employeeId: 'EMP-001',
            employeeName: 'Sarah Johnson',
            email: 'sarah.johnson@company.com',
            departmentId: 'DEPT-ENG',
            departmentName: 'Engineering',
            managerId: 'MGR-001',
            managerName: 'Michael Chen',
            hireDate: new Date('2024-12-15'),
            startDate: new Date('2024-12-26'),
            status: 'in_progress',
            currentPhase: 'first_week',
            progress: 35,
            completedTasks: 7,
            totalTasks: 20,
        }
    });

    const instance2 = await prisma.onboardingInstance.create({
        data: {
            tenantId: TENANT_ID,
            onboardingCode: 'ONB-2024-002',
            programId: salesProgram.id,
            employeeId: 'EMP-002',
            employeeName: 'David Martinez',
            email: 'david.martinez@company.com',
            departmentId: 'DEPT-SALES',
            departmentName: 'Sales',
            managerId: 'MGR-002',
            managerName: 'Jennifer Williams',
            hireDate: new Date('2024-12-01'),
            startDate: new Date('2024-12-15'),
            status: 'in_progress',
            currentPhase: 'first_month',
            progress: 60,
            completedTasks: 12,
            totalTasks: 20,
        }
    });

    const instance3 = await prisma.onboardingInstance.create({
        data: {
            tenantId: TENANT_ID,
            onboardingCode: 'ONB-2024-003',
            programId: engineeringProgram.id,
            employeeId: 'EMP-003',
            employeeName: 'Emily Rodriguez',
            email: 'emily.rodriguez@company.com',
            departmentId: 'DEPT-ENG',
            departmentName: 'Engineering',
            managerId: 'MGR-001',
            managerName: 'Michael Chen',
            hireDate: new Date('2025-01-05'),
            startDate: new Date('2025-01-05'),
            status: 'not_started',
            currentPhase: 'pre_boarding',
            progress: 0,
            completedTasks: 0,
            totalTasks: 20,
        }
    });

    console.log(`✅ Created 3 onboarding instances`);

    // 3. Create Tasks for Instance 1 (Engineering - In Progress)
    console.log('✅ Creating onboarding tasks...');

    const instance1Tasks = [
        // Pre-boarding Phase
        { taskName: 'Complete I-9 and Tax Forms', category: 'Documentation', phase: 'pre_boarding', priority: 'high', status: 'completed', displayOrder: 1, dueDate: new Date('2024-12-24'), completedDate: new Date('2024-12-20') },
        { taskName: 'Submit Emergency Contact Information', category: 'Documentation', phase: 'pre_boarding', priority: 'high', status: 'completed', displayOrder: 2, dueDate: new Date('2024-12-24'), completedDate: new Date('2024-12-20') },
        { taskName: 'Review Employee Handbook', category: 'Documentation', phase: 'pre_boarding', priority: 'medium', status: 'completed', displayOrder: 3, dueDate: new Date('2024-12-25'), completedDate: new Date('2024-12-23') },

        // First Day Phase
        { taskName: 'Office Tour and Introductions', category: 'Orientation', phase: 'first_day', priority: 'high', status: 'completed', displayOrder: 4, dueDate: new Date('2024-12-26'), completedDate: new Date('2024-12-26') },
        { taskName: 'IT Equipment Setup', category: 'Technical', phase: 'first_day', priority: 'high', status: 'completed', displayOrder: 5, dueDate: new Date('2024-12-26'), completedDate: new Date('2024-12-26') },
        { taskName: 'Create GitHub and Slack Accounts', category: 'Technical', phase: 'first_day', priority: 'high', status: 'completed', displayOrder: 6, dueDate: new Date('2024-12-26'), completedDate: new Date('2024-12-26') },
        { taskName: 'Attend Company All-Hands Meeting', category: 'Orientation', phase: 'first_day', priority: 'medium', status: 'completed', displayOrder: 7, dueDate: new Date('2024-12-26'), completedDate: new Date('2024-12-26') },

        // First Week Phase
        { taskName: 'Setup Development Environment', category: 'Technical', phase: 'first_week', priority: 'high', status: 'in_progress', displayOrder: 8, dueDate: new Date('2024-12-30') },
        { taskName: 'Review Codebase Architecture', category: 'Technical', phase: 'first_week', priority: 'high', status: 'in_progress', displayOrder: 9, dueDate: new Date('2024-12-31') },
        { taskName: 'Meet with Team Lead', category: 'Team Integration', phase: 'first_week', priority: 'high', status: 'pending', displayOrder: 10, dueDate: new Date('2024-12-27') },
        { taskName: 'Complete Security Training', category: 'Training', phase: 'first_week', priority: 'high', status: 'pending', displayOrder: 11, dueDate: new Date('2024-12-30') },
        { taskName: 'Review Code Style Guidelines', category: 'Technical', phase: 'first_week', priority: 'medium', status: 'pending', displayOrder: 12, dueDate: new Date('2025-01-02') },

        // First Month Phase
        { taskName: 'Complete First Code Review', category: 'Technical', phase: 'first_month', priority: 'high', status: 'pending', displayOrder: 13, dueDate: new Date('2025-01-10') },
        { taskName: 'Deploy First Feature to Production', category: 'Technical', phase: 'first_month', priority: 'high', status: 'pending', displayOrder: 14, dueDate: new Date('2025-01-20') },
        { taskName: 'Attend Engineering All-Hands', category: 'Team Integration', phase: 'first_month', priority: 'medium', status: 'pending', displayOrder: 15, dueDate: new Date('2025-01-15') },
        { taskName: 'Complete AWS Fundamentals Training', category: 'Training', phase: 'first_month', priority: 'medium', status: 'pending', displayOrder: 16, dueDate: new Date('2025-01-25') },

        // 30-60-90 Day Plan
        { taskName: '30-Day Check-in with Manager', category: 'Team Integration', phase: '30_60_90', priority: 'high', status: 'pending', displayOrder: 17, dueDate: new Date('2025-01-26') },
        { taskName: 'Lead First Team Stand-up', category: 'Team Integration', phase: '30_60_90', priority: 'medium', status: 'pending', displayOrder: 18, dueDate: new Date('2025-02-15') },
        { taskName: '60-Day Performance Review', category: 'Team Integration', phase: '30_60_90', priority: 'high', status: 'pending', displayOrder: 19, dueDate: new Date('2025-02-26') },
        { taskName: '90-Day Onboarding Completion Survey', category: 'Feedback', phase: '30_60_90', priority: 'high', status: 'pending', displayOrder: 20, dueDate: new Date('2025-03-26') },
    ];

    for (const task of instance1Tasks) {
        await prisma.onboardingTask.create({
            data: {
                tenantId: TENANT_ID,
                instanceId: instance1.id,
                ...task,
                isMandatory: task.priority === 'high',
                responsibleParty: task.category === 'Technical' ? 'IT Department' : task.category === 'Training' ? 'HR Learning & Development' : 'HR Onboarding Team',
                completedBy: task.status === 'completed' ? USER_ID : null,
            }
        });
    }

    // 4. Create Tasks for Instance 2 (Sales - In Progress)
    const instance2Tasks = [
        { taskName: 'Complete Onboarding Paperwork', category: 'Documentation', phase: 'pre_boarding', priority: 'high', status: 'completed', displayOrder: 1, dueDate: new Date('2024-12-13'), completedDate: new Date('2024-12-10') },
        { taskName: 'Review Sales Methodology', category: 'Training', phase: 'first_week', priority: 'high', status: 'completed', displayOrder: 2, dueDate: new Date('2024-12-20'), completedDate: new Date('2024-12-18') },
        { taskName: 'CRM System Training', category: 'Technical', phase: 'first_week', priority: 'high', status: 'completed', displayOrder: 3, dueDate: new Date('2024-12-20'), completedDate: new Date('2024-12-19') },
        { taskName: 'Product Knowledge Training', category: 'Training', phase: 'first_week', priority: 'high', status: 'completed', displayOrder: 4, dueDate: new Date('2024-12-22'), completedDate: new Date('2024-12-21') },
        { taskName: 'Shadow Senior Sales Rep', category: 'Team Integration', phase: 'first_month', priority: 'high', status: 'completed', displayOrder: 5, dueDate: new Date('2024-12-27'), completedDate: new Date('2024-12-26') },
        { taskName: 'Complete First Discovery Call', category: 'Sales Activity', phase: 'first_month', priority: 'high', status: 'completed', displayOrder: 6, dueDate: new Date('2025-01-05'), completedDate: new Date('2025-01-03') },
        { taskName: 'Learn Sales Playbook', category: 'Training', phase: 'first_month', priority: 'medium', status: 'completed', displayOrder: 7, dueDate: new Date('2025-01-10'), completedDate: new Date('2025-01-08') },
        { taskName: 'Attend Team Pipeline Review', category: 'Team Integration', phase: 'first_month', priority: 'medium', status: 'completed', displayOrder: 8, dueDate: new Date('2025-01-12'), completedDate: new Date('2025-01-12') },
        { taskName: 'Complete Competitor Analysis', category: 'Training', phase: 'first_month', priority: 'medium', status: 'completed', displayOrder: 9, dueDate: new Date('2025-01-15'), completedDate: new Date('2025-01-14') },
        { taskName: 'First Solo Demo Presentation', category: 'Sales Activity', phase: 'first_month', priority: 'high', status: 'completed', displayOrder: 10, dueDate: new Date('2025-01-20'), completedDate: new Date('2025-01-18') },
        { taskName: 'Close First Deal', category: 'Sales Activity', phase: '30_60_90', priority: 'high', status: 'completed', displayOrder: 11, dueDate: new Date('2025-02-01'), completedDate: new Date('2025-01-28') },
        { taskName: 'Meet Revenue Target (Month 2)', category: 'Sales Activity', phase: '30_60_90', priority: 'high', status: 'completed', displayOrder: 12, dueDate: new Date('2025-02-28'), completedDate: new Date('2025-02-25') },
        { taskName: '30-Day Manager Check-in', category: 'Team Integration', phase: '30_60_90', priority: 'high', status: 'in_progress', displayOrder: 13, dueDate: new Date('2025-01-15') },
        { taskName: 'Build Territory Plan', category: 'Sales Activity', phase: '30_60_90', priority: 'high', status: 'in_progress', displayOrder: 14, dueDate: new Date('2025-01-30') },
        { taskName: 'Advanced Negotiation Training', category: 'Training', phase: '30_60_90', priority: 'medium', status: 'pending', displayOrder: 15, dueDate: new Date('2025-02-10') },
        { taskName: '60-Day Performance Review', category: 'Team Integration', phase: '30_60_90', priority: 'high', status: 'pending', displayOrder: 16, dueDate: new Date('2025-02-15') },
        { taskName: 'Present at Team Meeting', category: 'Team Integration', phase: '30_60_90', priority: 'medium', status: 'pending', displayOrder: 17, dueDate: new Date('2025-02-20') },
        { taskName: 'Meet Revenue Target (Month 3)', category: 'Sales Activity', phase: '30_60_90', priority: 'high', status: 'pending', displayOrder: 18, dueDate: new Date('2025-03-31') },
        { taskName: '90-Day Onboarding Review', category: 'Feedback', phase: '30_60_90', priority: 'high', status: 'pending', displayOrder: 19, dueDate: new Date('2025-03-15') },
        { taskName: 'Complete Onboarding Survey', category: 'Feedback', phase: '30_60_90', priority: 'medium', status: 'pending', displayOrder: 20, dueDate: new Date('2025-03-20') },
    ];

    for (const task of instance2Tasks) {
        await prisma.onboardingTask.create({
            data: {
                tenantId: TENANT_ID,
                instanceId: instance2.id,
                ...task,
                isMandatory: task.priority === 'high',
                responsibleParty: task.category === 'Sales Activity' ? 'Sales Manager' : task.category === 'Training' ? 'Sales Enablement' : 'HR Onboarding Team',
                completedBy: task.status === 'completed' ? USER_ID : null,
            }
        });
    }

    // 5. Create Tasks for Instance 3 (Engineering - Not Started)
    for (const task of instance1Tasks.slice(0, 20)) {
        await prisma.onboardingTask.create({
            data: {
                tenantId: TENANT_ID,
                instanceId: instance3.id,
                taskName: task.taskName,
                category: task.category,
                phase: task.phase,
                priority: task.priority,
                status: 'pending',
                displayOrder: task.displayOrder,
                dueDate: new Date(new Date(task.dueDate).getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days later
                isMandatory: task.priority === 'high',
                responsibleParty: task.category === 'Technical' ? 'IT Department' : task.category === 'Training' ? 'HR Learning & Development' : 'HR Onboarding Team',
                completedBy: null,
                completedDate: null,
            }
        });
    }

    console.log(`✅ Created 60 onboarding tasks across 3 instances`);

    // 6. Create Equipment Requests
    console.log('💻 Creating equipment requests...');

    await prisma.onboardingEquipment.create({
        data: {
            tenantId: TENANT_ID,
            instanceId: instance1.id,
            equipmentName: 'MacBook Pro 16-inch',
            equipmentType: 'Laptop',
            description: 'M2 Max, 32GB RAM, 1TB SSD for software development',
            quantity: 1,
            status: 'assigned',
            requestedDate: new Date('2024-12-20'),
            requestedBy: USER_ID,
            approvedDate: new Date('2024-12-22'),
            approvedBy: 'IT-MANAGER-001',
            assignedDate: new Date('2024-12-26'),
            assetTag: 'LAPTOP-2024-156',
            notes: 'Development environment pre-configured',
        }
    });

    await prisma.onboardingEquipment.create({
        data: {
            tenantId: TENANT_ID,
            instanceId: instance1.id,
            equipmentName: 'Dell UltraSharp 27" Monitor',
            equipmentType: 'Monitor',
            description: '4K monitor for development work',
            quantity: 2,
            status: 'assigned',
            requestedDate: new Date('2024-12-20'),
            requestedBy: USER_ID,
            approvedDate: new Date('2024-12-22'),
            approvedBy: 'IT-MANAGER-001',
            assignedDate: new Date('2024-12-26'),
            assetTag: 'MON-2024-234, MON-2024-235',
        }
    });

    await prisma.onboardingEquipment.create({
        data: {
            tenantId: TENANT_ID,
            instanceId: instance2.id,
            equipmentName: 'MacBook Air 15-inch',
            equipmentType: 'Laptop',
            description: 'M2, 16GB RAM, 512GB SSD for sales work',
            quantity: 1,
            status: 'assigned',
            requestedDate: new Date('2024-12-08'),
            requestedBy: USER_ID,
            approvedDate: new Date('2024-12-10'),
            approvedBy: 'IT-MANAGER-001',
            assignedDate: new Date('2024-12-15'),
            assetTag: 'LAPTOP-2024-149',
        }
    });

    await prisma.onboardingEquipment.create({
        data: {
            tenantId: TENANT_ID,
            instanceId: instance2.id,
            equipmentName: 'iPhone 15 Pro',
            equipmentType: 'Mobile Device',
            description: 'Business phone for sales calls',
            quantity: 1,
            status: 'assigned',
            requestedDate: new Date('2024-12-08'),
            requestedBy: USER_ID,
            approvedDate: new Date('2024-12-10'),
            approvedBy: 'IT-MANAGER-001',
            assignedDate: new Date('2024-12-15'),
            assetTag: 'PHONE-2024-089',
        }
    });

    await prisma.onboardingEquipment.create({
        data: {
            tenantId: TENANT_ID,
            instanceId: instance3.id,
            equipmentName: 'MacBook Pro 14-inch',
            equipmentType: 'Laptop',
            description: 'M2 Pro, 16GB RAM, 512GB SSD for software development',
            quantity: 1,
            status: 'approved',
            requestedDate: new Date('2024-12-28'),
            requestedBy: USER_ID,
            approvedDate: new Date('2024-12-30'),
            approvedBy: 'IT-MANAGER-001',
            notes: 'Ready for pickup on start date',
        }
    });

    console.log(`✅ Created 5 equipment requests`);

    // 7. Create Training Modules
    console.log('📚 Creating training modules...');

    await prisma.onboardingTraining.create({
        data: {
            tenantId: TENANT_ID,
            instanceId: instance1.id,
            moduleName: 'Information Security & Data Protection',
            description: 'Comprehensive training on company security policies, data handling, and compliance requirements',
            type: 'Compliance',
            phase: 'first_week',
            deliveryMode: 'Online',
            status: 'completed',
            durationHours: 2,
            scheduledDate: new Date('2024-12-27'),
            completedDate: new Date('2024-12-27'),
            instructor: 'Security Team',
            location: 'Learning Management System',
        }
    });

    await prisma.onboardingTraining.create({
        data: {
            tenantId: TENANT_ID,
            instanceId: instance1.id,
            moduleName: 'Git & Version Control Best Practices',
            description: 'Learn team workflows, branching strategies, and code review processes',
            type: 'Technical',
            phase: 'first_week',
            deliveryMode: 'Hybrid',
            status: 'in_progress',
            durationHours: 3,
            scheduledDate: new Date('2024-12-30'),
            instructor: 'Senior Engineer - Alex Kumar',
            meetingLink: 'https://meet.google.com/abc-defg-hij',
        }
    });

    await prisma.onboardingTraining.create({
        data: {
            tenantId: TENANT_ID,
            instanceId: instance1.id,
            moduleName: 'System Architecture Deep Dive',
            description: 'Understanding microservices architecture, database design, and API patterns',
            type: 'Technical',
            phase: 'first_month',
            deliveryMode: 'In-Person',
            status: 'scheduled',
            durationHours: 4,
            scheduledDate: new Date('2025-01-08'),
            instructor: 'Principal Engineer - Maria Garcia',
            location: 'Conference Room B',
        }
    });

    await prisma.onboardingTraining.create({
        data: {
            tenantId: TENANT_ID,
            instanceId: instance1.id,
            moduleName: 'Agile & Scrum Methodology',
            description: 'Team agile practices, sprint planning, and retrospectives',
            type: 'Process',
            phase: 'first_month',
            deliveryMode: 'Online',
            status: 'pending',
            durationHours: 2.5,
            scheduledDate: new Date('2025-01-15'),
            instructor: 'Agile Coach - Tom Anderson',
            meetingLink: 'https://meet.google.com/xyz-abcd-efg',
        }
    });

    await prisma.onboardingTraining.create({
        data: {
            tenantId: TENANT_ID,
            instanceId: instance2.id,
            moduleName: 'Product Suite Overview',
            description: 'Comprehensive overview of all product features, use cases, and customer success stories',
            type: 'Product',
            phase: 'first_week',
            deliveryMode: 'In-Person',
            status: 'completed',
            durationHours: 4,
            scheduledDate: new Date('2024-12-16'),
            completedDate: new Date('2024-12-16'),
            instructor: 'Product Manager - Lisa Chen',
            location: 'Training Room A',
        }
    });

    await prisma.onboardingTraining.create({
        data: {
            tenantId: TENANT_ID,
            instanceId: instance2.id,
            moduleName: 'CRM Mastery - Salesforce',
            description: 'Advanced Salesforce training for pipeline management, forecasting, and reporting',
            type: 'Technical',
            phase: 'first_week',
            deliveryMode: 'Hybrid',
            status: 'completed',
            durationHours: 3,
            scheduledDate: new Date('2024-12-18'),
            completedDate: new Date('2024-12-18'),
            instructor: 'Sales Operations - Kevin Brown',
            meetingLink: 'https://meet.google.com/salesforce-training',
        }
    });

    await prisma.onboardingTraining.create({
        data: {
            tenantId: TENANT_ID,
            instanceId: instance2.id,
            moduleName: 'Consultative Selling Techniques',
            description: 'Advanced sales methodology: discovery, objection handling, and closing strategies',
            type: 'Sales Skills',
            phase: 'first_month',
            deliveryMode: 'In-Person',
            status: 'completed',
            durationHours: 6,
            scheduledDate: new Date('2024-12-22'),
            completedDate: new Date('2024-12-22'),
            instructor: 'VP Sales - Rachel Martinez',
            location: 'Executive Conference Room',
        }
    });

    await prisma.onboardingTraining.create({
        data: {
            tenantId: TENANT_ID,
            instanceId: instance2.id,
            moduleName: 'Competitive Intelligence Workshop',
            description: 'Understanding competitors, market positioning, and differentiation strategies',
            type: 'Product',
            phase: 'first_month',
            deliveryMode: 'Online',
            status: 'in_progress',
            durationHours: 2,
            scheduledDate: new Date('2025-01-10'),
            instructor: 'Product Marketing - James Wilson',
            meetingLink: 'https://meet.google.com/comp-intel',
        }
    });

    console.log(`✅ Created 8 training modules`);

    // Summary
    console.log('\n📊 Onboarding Seed Summary:');
    console.log('  - 2 Onboarding Programs');
    console.log('  - 3 Onboarding Instances');
    console.log('  - 60 Tasks');
    console.log('  - 5 Equipment Requests');
    console.log('  - 8 Training Modules');
    console.log('\n🎉 Onboarding module seeding complete!\n');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding onboarding data:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
