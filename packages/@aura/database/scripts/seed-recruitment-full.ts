/**
 * Comprehensive Recruitment Module Seed Data
 * Seeds: Candidates, Applications, Interviews, Offers, and Job Postings
 * Run with: npx tsx scripts/seed-recruitment-full.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Comprehensive Recruitment Data...\n');

    // Clear existing data (in reverse order of dependencies)
    console.log('🧹 Clearing existing recruitment data...');
    await prisma.interviewFeedback.deleteMany({});
    await prisma.interview.deleteMany({});
    await prisma.jobOffer.deleteMany({});
    await prisma.candidateApplication.deleteMany({});
    await prisma.candidate.deleteMany({});
    await prisma.jobPosting.deleteMany({});
    console.log('✅ Cleared existing data\n');

    // 1. Create Job Postings
    console.log('📋 Creating Job Postings...');
    const seniorEngineerJob = await prisma.jobPosting.create({
        data: {
            title: 'Senior Software Engineer',
            department: 'Engineering',
            location: 'San Francisco, CA',
            type: 'Full-time',
            status: 'Active',
            description: 'We are looking for an experienced Senior Software Engineer to join our growing engineering team.',
            postedDate: new Date('2024-12-01'),
            views: 2100,
            clicks: 680,
            applies: 45,
            channels: { linkedin: true, indeed: true, website: true, glassdoor: true }
        }
    });

    const productManagerJob = await prisma.jobPosting.create({
        data: {
            title: 'Product Manager',
            department: 'Product',
            location: 'Remote',
            type: 'Full-time',
            status: 'Active',
            description: 'Seeking a strategic Product Manager to drive product vision and roadmap.',
            postedDate: new Date('2024-12-05'),
            views: 1500,
            clicks: 420,
            applies: 28,
            channels: { linkedin: true, indeed: false, website: true, glassdoor: true }
        }
    });

    const designerJob = await prisma.jobPosting.create({
        data: {
            title: 'Senior UX Designer',
            department: 'Design',
            location: 'New York, NY',
            type: 'Full-time',
            status: 'Active',
            description: 'Looking for a creative UX Designer to craft exceptional user experiences.',
            postedDate: new Date('2024-12-10'),
            views: 950,
            clicks: 280,
            applies: 18,
            channels: { linkedin: true, indeed: true, website: true, glassdoor: false }
        }
    });

    console.log('✅ Created 3 job postings\n');

    // 2. Create Candidates
    console.log('👥 Creating Candidates...');
    const candidate1 = await prisma.candidate.create({
        data: {
            firstName: 'Michael',
            lastName: 'Chen',
            email: 'michael.chen@email.com',
            phone: '+1-555-0123',
            location: 'San Francisco, CA',
            linkedinUrl: 'https://linkedin.com/in/michael-chen',
            resumeUrl: 'https://example.com/resumes/michael-chen.pdf',
            source: 'LinkedIn'
        }
    });

    const candidate2 = await prisma.candidate.create({
        data: {
            firstName: 'Sarah',
            lastName: 'Williams',
            email: 'sarah.williams@email.com',
            phone: '+1-555-0124',
            location: 'Austin, TX',
            linkedinUrl: 'https://linkedin.com/in/sarah-williams',
            resumeUrl: 'https://example.com/resumes/sarah-williams.pdf',
            source: 'Company Website'
        }
    });

    const candidate3 = await prisma.candidate.create({
        data: {
            firstName: 'David',
            lastName: 'Kumar',
            email: 'david.kumar@email.com',
            phone: '+1-555-0125',
            location: 'Seattle, WA',
            linkedinUrl: 'https://linkedin.com/in/david-kumar',
            resumeUrl: 'https://example.com/resumes/david-kumar.pdf',
            source: 'Referral'
        }
    });

    const candidate4 = await prisma.candidate.create({
        data: {
            firstName: 'Emily',
            lastName: 'Rodriguez',
            email: 'emily.rodriguez@email.com',
            phone: '+1-555-0126',
            location: 'New York, NY',
            linkedinUrl: 'https://linkedin.com/in/emily-rodriguez',
            resumeUrl: 'https://example.com/resumes/emily-rodriguez.pdf',
            source: 'Indeed'
        }
    });

    console.log('✅ Created 4 candidates\n');

    // 3. Create Applications
    console.log('📝 Creating Applications...');
    const app1 = await prisma.candidateApplication.create({
        data: {
            candidateId: candidate1.id,
            jobPostingId: seniorEngineerJob.id,
            status: 'interview',
            currentStage: 'technical interview',
            source: 'LinkedIn',
            appliedDate: new Date('2024-12-15'),
            overallRating: 4,
            resumeUrl: candidate1.resumeUrl
        }
    });

    const app2 = await prisma.candidateApplication.create({
        data: {
            candidateId: candidate2.id,
            jobPostingId: seniorEngineerJob.id,
            status: 'screening',
            currentStage: 'phone screen',
            source: 'Company Website',
            appliedDate: new Date('2024-12-18'),
            resumeUrl: candidate2.resumeUrl
        }
    });

    const app3 = await prisma.candidateApplication.create({
        data: {
            candidateId: candidate3.id,
            jobPostingId: productManagerJob.id,
            status: 'offer',
            currentStage: 'offer extended',
            source: 'Referral',
            appliedDate: new Date('2024-12-10'),
            overallRating: 5,
            resumeUrl: candidate3.resumeUrl
        }
    });

    const app4 = await prisma.candidateApplication.create({
        data: {
            candidateId: candidate4.id,
            jobPostingId: designerJob.id,
            status: 'applied',
            currentStage: 'new application',
            source: 'Indeed',
            appliedDate: new Date('2024-12-20'),
            resumeUrl: candidate4.resumeUrl
        }
    });

    console.log('✅ Created 4 applications\n');

    // 4. Create Interviews
    console.log('📅 Creating Interviews...');
    const interview1 = await prisma.interview.create({
        data: {
            applicationId: app1.id,
            title: 'Technical Interview - System Design',
            type: 'Technical',
            scheduledDate: new Date('2024-12-26T14:00:00Z'),
            duration: 60,
            location: null,
            meetingLink: 'https://meet.example.com/tech-interview-1',
            interviewerIds: ['emp_1', 'emp_2'],
            interviewerNames: 'John Smith, Jane Doe',
            status: 'scheduled',
            notes: 'Focus on system design and scalability'
        }
    });

    const interview2 = await prisma.interview.create({
        data: {
            applicationId: app1.id,
            title: 'Phone Screen',
            type: 'Phone',
            scheduledDate: new Date('2024-12-18T11:00:00Z'),
            duration: 30,
            location: null,
            meetingLink: null,
            interviewerIds: ['emp_3'],
            interviewerNames: 'Bob Wilson',
            status: 'completed',
            feedbackSubmitted: true,
            overallRating: 4,
            notes: 'Initial screening - went well'
        }
    });

    const interview3 = await prisma.interview.create({
        data: {
            applicationId: app3.id,
            title: 'Product Strategy Discussion',
            type: 'In-Person',
            scheduledDate: new Date('2024-12-15T10:00:00Z'),
            duration: 90,
            location: 'Building A, Conference Room 3',
            meetingLink: null,
            interviewerIds: ['emp_4', 'emp_5'],
            interviewerNames: 'Alice Johnson, Mark Brown',
            status: 'completed',
            feedbackSubmitted: true,
            overallRating: 5,
            notes: 'Excellent strategic thinking'
        }
    });

    console.log('✅ Created 3 interviews\n');

    // 5. Create Interview Feedback
    console.log('💭 Creating Interview Feedback...');
    await prisma.interviewFeedback.create({
        data: {
            interviewId: interview2.id,
            interviewerId: 'emp_3',
            interviewerName: 'Bob Wilson',
            rating: 4,
            strengths: 'Strong technical background, excellent communication skills',
            weaknesses: 'Limited experience with distributed systems',
            recommendation: 'Hire',
            comments: 'Great candidate, recommend moving forward with technical interview'
        }
    });

    await prisma.interviewFeedback.create({
        data: {
            interviewId: interview3.id,
            interviewerId: 'emp_4',
            interviewerName: 'Alice Johnson',
            rating: 5,
            strengths: 'Outstanding product vision, data-driven approach, strong leadership',
            weaknesses: 'None identified',
            recommendation: 'Hire',
            comments: 'Exceptional candidate. Should extend offer immediately.'
        }
    });

    console.log('✅ Created 2 interview feedback entries\n');

    // 6. Create Job Offers
    console.log('💼 Creating Job Offers...');
    await prisma.jobOffer.create({
        data: {
            applicationId: app3.id,
            jobTitle: 'Product Manager',
            department: 'Product',
            location: 'Remote',
            employmentType: 'Full-time',
            startDate: new Date('2025-02-01'),
            salary: 125000,
            currency: 'USD',
            bonus: 15000,
            equity: 'RSUs: 5000 shares, 4-year vesting',
            benefits: {
                items: [
                    'Health Insurance (Medical, Dental, Vision)',
                    '401(k) with 4% company match',
                    '20 days PTO + holidays',
                    'Remote work options',
                    'Professional development budget ($3,000/year)',
                    'Home office stipend'
                ]
            },
            status: 'approved',
            approvedBy: 'hiring_manager_1',
            approvedDate: new Date('2024-12-19'),
            expiryDate: new Date('2025-01-05'),
            notes: 'Approved by VP Product'
        }
    });

    console.log('✅ Created 1 job offer\n');

    // Summary
    const stats = {
        jobPostings: await prisma.jobPosting.count(),
        candidates: await prisma.candidate.count(),
        applications: await prisma.candidateApplication.count(),
        interviews: await prisma.interview.count(),
        feedback: await prisma.interviewFeedback.count(),
        offers: await prisma.jobOffer.count()
    };

    console.log('📊 Seeding Summary:');
    console.log(`   - Job Postings: ${stats.jobPostings}`);
    console.log(`   - Candidates: ${stats.candidates}`);
    console.log(`   - Applications: ${stats.applications}`);
    console.log(`   - Interviews: ${stats.interviews}`);
    console.log(`   - Interview Feedback: ${stats.feedback}`);
    console.log(`   - Job Offers: ${stats.offers}`);
    console.log('\n✅ Recruitment module seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding recruitment data:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
