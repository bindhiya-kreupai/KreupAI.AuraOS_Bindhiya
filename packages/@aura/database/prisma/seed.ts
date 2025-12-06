import { PrismaClient } from '@prisma/client';
import { countriesSeed } from '../src/seeds/01-countries.seed';
import { currenciesSeed } from '../src/seeds/02-currencies.seed';
import { languagesSeed } from '../src/seeds/03-languages.seed';
import { leaveTypesSeed } from '../src/seeds/04-leave-types.seed';
import { employmentTypesSeed, employmentStatusesSeed } from '../src/seeds/05-employment-types.seed';
import { shiftTypesSeed } from '../src/seeds/06-shift-types.seed';
import { taxRegimesSeed } from '../src/seeds/07-tax-regimes.seed';
import { banksSeed } from '../src/seeds/08-banks.seed';
import { systemSettingsSeed } from '../src/seeds/09-system-settings.seed';
import { companiesSeed, businessUnitsSeed, costCentersSeed, departmentsSeed, locationsSeed } from '../src/seeds/10-org-structure.seed';
import { skillsSeed, competenciesSeed, documentTypesSeed, designationsSeed, educationLevelsSeed, relationshipsSeed, exitReasonsSeed } from '../src/seeds/11-hr-masters.seed';
import { payComponentsSeed, rolesSeed, holidaysSeed } from '../src/seeds/12-payroll-admin.seed';
import { jobFamiliesSeed, jobProfilesSeed } from '../src/seeds/13-job-architecture.seed';
import { statesSeed, citiesSeed } from '../src/seeds/14-geo-masters.seed';
import { passwordPolicySeed, mfaConfigSeed, licenseSeed, accessControlSeed, ssoConfigSeed } from '../src/seeds/15-system-policies.seed';
import { superAdminUserSeed } from '../src/seeds/16-users.seed';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting Master Data Seeding (GCC & India)...');

    // ============================================
    // 1. TENANT
    // ============================================
    const tenant = await prisma.tenant.upsert({
        where: { code: 'KREUP_AI' },
        update: {},
        create: { code: 'KREUP_AI', name: 'KreupAI Technologies' },
    });
    console.log(`✅ Tenant: ${tenant.name}`);

    // ============================================
    // A. SYSTEM SETTINGS
    // ============================================
    console.log('...Seeding System Settings');
    for (const s of systemSettingsSeed) {
        await prisma.systemSetting.upsert({
            where: { key: s.key },
            update: { value: s.value, group: s.group, description: s.description },
            create: s,
        });
    }

    // ============================================
    // B. GEO MASTERS
    // ============================================
    console.log('...Seeding Countries');
    for (const c of countriesSeed) {
        await prisma.country.upsert({
            where: { isoCode: c.code },
            update: { name: c.name, currency: c.currencyCode },
            create: { isoCode: c.code, name: c.name, currency: c.currencyCode },
        });
    }

    console.log('...Seeding Currencies');
    for (const cur of currenciesSeed) {
        const existing = await prisma.currency.findUnique({ where: { code: cur.code } });
        if (!existing) {
            await prisma.currency.create({
                data: { code: cur.code, name: cur.name, symbol: cur.symbol }
            });
        }
    }

    console.log('...Seeding States');
    for (const st of statesSeed) {
        const country = await prisma.country.findUnique({ where: { isoCode: st.countryCode } });
        if (country) {
            const existing = await prisma.state.findFirst({ where: { code: st.code, countryId: country.id } });
            if (!existing) {
                await prisma.state.create({ data: { code: st.code, name: st.name, countryId: country.id } });
            }
        }
    }

    console.log('...Seeding Cities');
    for (const ct of citiesSeed) {
        const state = await prisma.state.findFirst({ where: { code: ct.stateCode } });
        if (state) {
            const existing = await prisma.city.findFirst({ where: { name: ct.name, stateId: state.id } });
            if (!existing) {
                await prisma.city.create({ data: { name: ct.name, stateId: state.id } });
            }
        }
    }

    // Languages
    console.log('...Seeding Languages');
    for (const lang of languagesSeed) {
        const existing = await prisma.language.findUnique({ where: { code: lang.code } });
        if (!existing) {
            await prisma.language.create({ data: lang });
        }
    }

    // ============================================
    // C. JOB & ORG MASTERS
    // ============================================
    console.log('...Seeding Org Structure');

    // Business Units
    for (const bu of businessUnitsSeed) {
        await prisma.businessUnit.upsert({
            where: { code: bu.code },
            update: {},
            create: bu
        });
    }

    // Cost Centers
    for (const cc of costCentersSeed) {
        await prisma.costCenter.upsert({
            where: { code: cc.code },
            update: {},
            create: cc
        });
    }

    // Companies
    for (const comp of companiesSeed) {
        const existingComp = await prisma.company.findFirst({ where: { code: comp.code } });
        if (!existingComp) {
            await prisma.company.create({
                data: {
                    code: comp.code,
                    name: comp.name,
                    taxId: comp.taxId,
                    tenantId: tenant.id
                }
            });
        }
    }

    // Locations & Addresses
    for (const loc of locationsSeed) {
        const company = await prisma.company.findFirst({ where: { code: loc.companyCode } });
        if (!company) continue;

        const country = await prisma.country.findUnique({ where: { isoCode: loc.address.countryCode } });
        if (country) {
            // Create/Find State dummy if needed
            let state = await prisma.state.findFirst({ where: { countryId: country.id } });
            if (!state) {
                state = await prisma.state.create({ data: { countryId: country.id, code: 'DEF', name: 'Default State' } });
            }

            // Create/Find City
            let city = await prisma.city.findFirst({ where: { stateId: state.id, name: loc.address.city } });
            if (!city) {
                city = await prisma.city.create({ data: { stateId: state.id, name: loc.address.city } });
            }

            // Create Address
            const address = await prisma.address.create({
                data: {
                    line1: loc.address.line1,
                    line2: loc.address.line2,
                    postalCode: loc.address.postalCode,
                    cityId: city.id,
                    stateId: state.id,
                    countryId: country.id
                }
            });

            // Create Location
            const existingLoc = await prisma.location.findFirst({ where: { code: loc.code } });
            if (!existingLoc) {
                // @ts-ignore
                await prisma.location.create({
                    data: {
                        code: loc.code,
                        name: loc.name,
                        type: loc.type as any,
                        companyId: company.id,
                        addressId: address.id
                    }
                });
            }
        }
    }

    // Departments
    for (const dept of departmentsSeed) {
        const company = await prisma.company.findFirst({ where: { code: 'KREUP_GLOBAL' } });
        const costCenter = await prisma.costCenter.findUnique({ where: { code: dept.costCenter } });

        if (company) {
            const existing = await prisma.department.findMany({ where: { code: dept.code, companyId: company.id } });
            if (existing.length === 0) {
                await prisma.department.create({
                    data: {
                        code: dept.code,
                        name: dept.name,
                        companyId: company.id,
                        costCenterId: costCenter?.id
                    }
                });
            }
        }
    }

    // Job Functions
    const jobFunctions = [
        { code: 'ENG', name: 'Engineering' },
        { code: 'PROD', name: 'Product' },
        { code: 'HR', name: 'Human Resources' },
        { code: 'SALES', name: 'Sales' },
        { code: 'MKT', name: 'Marketing' },
        { code: 'FIN', name: 'Finance' },
    ];
    for (const jf of jobFunctions) {
        const existing = await prisma.jobFunction.findFirst({ where: { code: jf.code } });
        if (!existing) {
            await prisma.jobFunction.create({ data: jf });
        }
    }

    // Job Families
    for (const jf of jobFamiliesSeed) {
        const func = await prisma.jobFunction.findFirst({ where: { code: jf.functionCode } });
        if (func) {
            const existing = await prisma.jobFamily.findFirst({ where: { code: jf.code } });
            if (!existing) {
                await prisma.jobFamily.create({
                    data: { code: jf.code, name: jf.name, functionId: func.id }
                });
            }
        }
    }

    // Job Profiles
    for (const jp of jobProfilesSeed) {
        const fam = await prisma.jobFamily.findFirst({ where: { code: jp.familyCode } });
        if (fam) {
            const existing = await prisma.jobProfile.findFirst({ where: { code: jp.code } });
            if (!existing) {
                await prisma.jobProfile.create({
                    data: { code: jp.code, title: jp.title, description: jp.description, familyId: fam.id }
                });
            }
        }
    }

    // Grades
    const grades = [
        { code: 'L1', name: 'Intern', level: 1 },
        { code: 'L2', name: 'Junior', level: 2 },
        { code: 'L3', name: 'Associate', level: 3 },
        { code: 'L4', name: 'Senior', level: 4 },
        { code: 'L5', name: 'Lead', level: 5 },
        { code: 'L6', name: 'Principal', level: 6 },
        { code: 'L7', name: 'Staff', level: 7 },
        { code: 'L8', name: 'Director', level: 8 },
        { code: 'L9', name: 'VP', level: 9 },
        { code: 'L10', name: 'CXO', level: 10 },
    ];
    for (const g of grades) {
        const existing = await prisma.grade.findFirst({ where: { code: g.code } });
        if (!existing) {
            await prisma.grade.create({ data: g });
        }
    }
    console.log(`✅ Grades: ${grades.length} seeded`);

    // ============================================
    // D. HR MASTERS
    // ============================================
    console.log('...Seeding HR Masters');

    // Skills
    for (const sk of skillsSeed) {
        const existing = await prisma.skill.findUnique({ where: { code: sk.code } });
        if (!existing) await prisma.skill.create({ data: sk });
    }

    // Competencies
    for (const comp of competenciesSeed) {
        const existing = await prisma.competency.findUnique({ where: { code: comp.code } });
        if (!existing) await prisma.competency.create({ data: comp });
    }

    // Documents
    for (const doc of documentTypesSeed) {
        const existing = await prisma.documentType.findUnique({ where: { code: doc.code } });
        if (!existing) await prisma.documentType.create({ data: doc });
    }

    // Designations
    for (const des of designationsSeed) {
        const existing = await prisma.designation.findUnique({ where: { code: des.code } });
        if (!existing) {
            const grade = await prisma.grade.findFirst({ where: { code: des.gradeCode } });
            await prisma.designation.create({
                data: {
                    code: des.code,
                    name: des.name,
                    gradeId: grade?.id,
                }
            });
        }
    }

    // Education
    for (const edu of educationLevelsSeed) {
        const existing = await prisma.educationLevel.findUnique({ where: { name: edu.name } });
        if (!existing) await prisma.educationLevel.create({ data: edu });
    }

    // Relationships
    for (const rel of relationshipsSeed) {
        const existing = await prisma.relationship.findUnique({ where: { name: rel.name } });
        if (!existing) await prisma.relationship.create({ data: rel });
    }

    // Exit Reasons
    for (const er of exitReasonsSeed) {
        const existing = await prisma.exitReason.findUnique({ where: { reason: er.reason } });
        if (!existing) await prisma.exitReason.create({ data: er });
    }

    // ============================================
    // E. PAYROLL & ADMIN
    // ============================================
    console.log('...Seeding Payroll & Admin');

    // Pay Components
    for (const pc of payComponentsSeed) {
        const existing = await prisma.payComponent.findUnique({ where: { code: pc.code } });
        if (!existing) await prisma.payComponent.create({ data: pc });
    }

    // Roles
    for (const role of rolesSeed) {
        const existing = await prisma.role.findUnique({ where: { name: role.name } });
        if (!existing) await prisma.role.create({ data: role });
    }

    // Holidays
    for (const hol of holidaysSeed) {
        const existing = await prisma.holiday.findFirst({ where: { name: hol.name, date: hol.date } });
        if (!existing) await prisma.holiday.create({ data: hol });
    }

    // Leave Types
    for (const lt of leaveTypesSeed) {
        const existing = await prisma.leaveType.findFirst({ where: { code: lt.code } });
        if (!existing) {
            await prisma.leaveType.create({
                data: {
                    code: lt.code,
                    name: lt.name,
                    isPaid: lt.isPaid,
                }
            });
        }
    }

    // Emp Types
    for (const et of employmentTypesSeed) {
        const existing = await prisma.employmentType.findUnique({ where: { code: et.code } });
        if (!existing) {
            await prisma.employmentType.create({
                data: { code: et.code, name: et.name }
            });
        }
    }

    // Emp Status
    for (const es of employmentStatusesSeed) {
        const existing = await prisma.employeeStatus.findUnique({ where: { code: es.code } });
        if (!existing) {
            await prisma.employeeStatus.create({ data: { code: es.code, name: es.name } });
        }
    }

    // Shift Types
    for (const st of shiftTypesSeed) {
        const existing = await prisma.shiftType.findFirst({ where: { code: st.code } });
        if (!existing) {
            await prisma.shiftType.create({
                data: { code: st.code, name: st.name, startTime: st.startTime, endTime: st.endTime }
            });
        }
    }

    // Tax Regimes
    for (const tr of taxRegimesSeed) {
        const country = await prisma.country.findUnique({ where: { isoCode: tr.countryCode } });
        if (country) {
            const existing = await prisma.taxRegime.findFirst({ where: { code: tr.code } });
            if (!existing) {
                await prisma.taxRegime.create({
                    data: { code: tr.code, name: tr.name, country: country.name, status: 'Active' }
                });
            }
        }
    }

    // Banks
    for (const bk of banksSeed) {
        const existing = await prisma.bank.findFirst({ where: { swiftCode: bk.swiftCode } });
        if (!existing) {
            await prisma.bank.create({
                data: { name: bk.name, swiftCode: bk.swiftCode, status: 'Active' }
            });
        }
    }

    // ============================================
    // F. SYSTEM POLICIES & USERS
    // ============================================
    console.log('...Seeding System Policies');

    // Password Policy
    const pp = await prisma.passwordPolicy.findFirst();
    if (!pp) await prisma.passwordPolicy.create({ data: passwordPolicySeed });

    // MFA
    const mfa = await prisma.mFAConfig.findFirst();
    if (!mfa) await prisma.mFAConfig.create({ data: mfaConfigSeed });

    // License
    const lic = await prisma.license.findUnique({ where: { name: licenseSeed.name } });
    if (!lic) await prisma.license.create({ data: licenseSeed });

    // Access Control
    for (const ac of accessControlSeed) {
        // Check duplication by name
        const existing = await prisma.accessControl.findFirst({ where: { name: ac.name } });
        if (!existing) {
            await prisma.accessControl.create({ data: ac });
        }
    }

    // SSO Config
    const sso = await prisma.sSOConfig.findFirst();
    if (!sso) await prisma.sSOConfig.create({ data: ssoConfigSeed });

    // Admin User
    console.log('...Seeding Super Admin');
    const existingUser = await prisma.user.findUnique({ where: { email: superAdminUserSeed.email } });
    if (!existingUser) {
        // Create User
        const user = await prisma.user.create({
            data: {
                email: superAdminUserSeed.email,
                password: superAdminUserSeed.password, // Ideally hashed
                tenantId: tenant.id,
                status: 'Active'
            }
        });

        // Create Linked Employee
        // Need a department/location/job profile for employee.
        // We'll use defaults found or created earlier.
        const company = await prisma.company.findFirst({ where: { code: 'KREUP_GLOBAL' } });
        const dept = await prisma.department.findFirst({ where: { companyId: company?.id } }); // Any dept
        const loc = await prisma.location.findFirst({ where: { companyId: company?.id } }); // Any loc

        // Ensure we have a Job Profile and Grade
        const jobProfile = await prisma.jobProfile.findFirst();
        const grade = await prisma.grade.findFirst();
        const empStatus = await prisma.employeeStatus.findFirst({ where: { code: 'ACTIVE' } });
        const empType = await prisma.employmentType.findFirst({ where: { code: 'FULL_TIME' } });

        if (company && dept && loc && jobProfile && grade && empStatus && empType) {
            await prisma.employee.create({
                data: {
                    userId: user.id,
                    employeeCode: superAdminUserSeed.employeeCode,
                    firstName: superAdminUserSeed.firstName,
                    lastName: superAdminUserSeed.lastName,
                    email: superAdminUserSeed.email,
                    companyId: company.id,
                    departmentId: dept.id,
                    locationId: loc.id,
                    jobProfileId: jobProfile.id,
                    gradeId: grade.id,
                    statusId: empStatus.id,
                    typeId: empType.id,
                    joiningDate: new Date(),
                }
            });
            console.log(`✅ Super Admin created: ${superAdminUserSeed.email}`);
        } else {
            console.warn('⚠️ Could not create Admin Employee - links missing');
        }
    }

    console.log('🏁 Comprehensive Seeding Completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
