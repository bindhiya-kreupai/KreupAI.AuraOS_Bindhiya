/**
 * Seed Recruitment Job Postings
 * Run with: npx tsx scripts/seed-recruitment.ts
 */

import { PrismaClient } from '@prisma/client';
import { jobPostingsSeed } from '../src/seeds/17-recruitment.seed';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Recruitment Job Postings...');

    // Clear existing job postings
    await prisma.jobPosting.deleteMany({});
    console.log('✅ Cleared existing job postings');

    // Seed job postings
    for (const job of jobPostingsSeed) {
        await prisma.jobPosting.create({
            data: job
        });
    }

    console.log(`✅ Seeded ${jobPostingsSeed.length} job postings`);
}

main()
    .catch((e) => {
        console.error('Error seeding recruitment data:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
