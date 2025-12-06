/**
 * @module UsersSeed
 * @description Seed data for Super Admin User
 * @project AURA HCM Platform
 */

export const superAdminUserSeed = {
    email: 'admin@kreupai.com',
    password: 'Admin@123', // In real app, this should be hashed. Here we assume seed script handles hashing or we store plain for dev.
    // Note: If the schema expects hashed, we need to hash it in the seed script or here. 
    // Usually seeds assume a utility hashes it. Let's provide a clear plain text and handle hash in seed.ts or just store it if dev mode allows.
    firstName: 'System',
    lastName: 'Administrator',
    employeeCode: 'EMP001',
    role: 'Super Admin',
};
