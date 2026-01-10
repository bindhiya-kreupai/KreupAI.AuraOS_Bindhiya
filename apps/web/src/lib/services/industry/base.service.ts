import { prisma } from '@aura/database';
import { BaseService, ServiceResponse } from '../base.service';

export interface IndustryConfig {
    id: string;
    industryCode: string;
    industryName: string;
    tenantId: string;
    settings: Record<string, unknown>;
    complianceRequirements: string[];
    customFields: Record<string, unknown>;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IndustryMetrics {
    totalEmployees: number;
    avgTenure: number;
    certificationCompliance: number;
    shiftCoverage: number;
    safetyIncidents: number;
    customMetrics: Record<string, number>;
}

export interface CreateIndustryConfigInput {
    industryCode: string;
    industryName: string;
    tenantId: string;
    settings?: Record<string, unknown>;
    complianceRequirements?: string[];
    customFields?: Record<string, unknown>;
}

export interface UpdateIndustryConfigInput {
    settings?: Record<string, unknown>;
    complianceRequirements?: string[];
    customFields?: Record<string, unknown>;
    isActive?: boolean;
}

/**
 * Base service for all industry-specific operations.
 * Extended by individual industry services for specialized functionality.
 */
export class IndustryBaseService extends BaseService {
    protected industryCode: string;

    constructor(industryCode: string) {
        super(`industry-${industryCode}`);
        this.industryCode = industryCode;
    }

    /**
     * Get industry configuration for a tenant
     */
    async getConfig(tenantId: string): Promise<ServiceResponse<IndustryConfig | null>> {
        try {
            // Check if IndustryConfiguration model exists, otherwise use SystemSetting
            const config = await prisma.systemSetting.findFirst({
                where: {
                    key: `industry_config_${this.industryCode}`,
                },
            });

            if (!config) {
                return {
                    success: true,
                    data: null,
                };
            }

            return {
                success: true,
                data: {
                    id: config.id,
                    industryCode: this.industryCode,
                    industryName: this.getIndustryName(),
                    tenantId,
                    settings: config.value ? JSON.parse(config.value) : {},
                    complianceRequirements: [],
                    customFields: {},
                    isActive: true,
                    createdAt: config.createdAt,
                    updatedAt: config.updatedAt,
                },
            };
        } catch (error) {
            console.error(`Error fetching ${this.industryCode} config:`, error);
            return {
                success: false,
                error: `Failed to fetch industry configuration`,
            };
        }
    }

    /**
     * Create or update industry configuration
     */
    async upsertConfig(
        tenantId: string,
        input: CreateIndustryConfigInput | UpdateIndustryConfigInput,
        userId: string,
        ipAddress: string
    ): Promise<ServiceResponse<IndustryConfig>> {
        try {
            const key = `industry_config_${this.industryCode}`;

            const config = await prisma.systemSetting.upsert({
                where: { key },
                create: {
                    key,
                    value: JSON.stringify({
                        ...input,
                        tenantId,
                        industryCode: this.industryCode,
                    }),
                    description: `Configuration for ${this.getIndustryName()} industry`,
                },
                update: {
                    value: JSON.stringify({
                        ...input,
                        tenantId,
                        industryCode: this.industryCode,
                    }),
                },
            });

            await this.createAuditLog({
                userId,
                action: 'UPDATE',
                module: 'Industry',
                details: `Updated ${this.getIndustryName()} configuration`,
                ipAddress,
            });

            return {
                success: true,
                data: {
                    id: config.id,
                    industryCode: this.industryCode,
                    industryName: this.getIndustryName(),
                    tenantId,
                    settings: input.settings || {},
                    complianceRequirements: (input as CreateIndustryConfigInput).complianceRequirements || [],
                    customFields: (input as CreateIndustryConfigInput).customFields || {},
                    isActive: true,
                    createdAt: config.createdAt,
                    updatedAt: config.updatedAt,
                },
            };
        } catch (error) {
            console.error(`Error upserting ${this.industryCode} config:`, error);
            return {
                success: false,
                error: `Failed to update industry configuration`,
            };
        }
    }

    /**
     * Get industry-specific workforce metrics
     */
    async getMetrics(tenantId: string): Promise<ServiceResponse<IndustryMetrics>> {
        try {
            // Get employee count
            const employeeCount = await prisma.employee.count({
                where: {
                    company: { tenantId },
                    status: { code: 'ACTIVE' },
                },
            });

            // Calculate average tenure
            const employees = await prisma.employee.findMany({
                where: {
                    company: { tenantId },
                    status: { code: 'ACTIVE' },
                },
                select: { joiningDate: true },
            });

            const now = new Date();
            const totalTenureMonths = employees.reduce((sum, emp) => {
                const months = (now.getTime() - emp.joiningDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
                return sum + months;
            }, 0);

            const avgTenure = employees.length > 0 ? totalTenureMonths / employees.length : 0;

            return {
                success: true,
                data: {
                    totalEmployees: employeeCount,
                    avgTenure: Math.round(avgTenure * 10) / 10,
                    certificationCompliance: 0, // To be implemented with certification tracking
                    shiftCoverage: 0, // To be implemented with shift management
                    safetyIncidents: 0, // To be implemented with incident tracking
                    customMetrics: {},
                },
            };
        } catch (error) {
            console.error(`Error fetching ${this.industryCode} metrics:`, error);
            return {
                success: false,
                error: `Failed to fetch industry metrics`,
            };
        }
    }

    /**
     * Get compliance requirements for the industry
     */
    async getComplianceRequirements(tenantId: string): Promise<ServiceResponse<string[]>> {
        try {
            const requirements = this.getDefaultComplianceRequirements();
            return {
                success: true,
                data: requirements,
            };
        } catch (error) {
            console.error(`Error fetching ${this.industryCode} compliance:`, error);
            return {
                success: false,
                error: `Failed to fetch compliance requirements`,
            };
        }
    }

    /**
     * Get industry name from code
     */
    protected getIndustryName(): string {
        const industryNames: Record<string, string> = {
            agriculture: 'Agriculture',
            automotive: 'Automotive',
            aviation: 'Aviation',
            construction: 'Construction',
            energy: 'Energy',
            financial: 'Financial Services',
            government: 'Government',
            healthcare: 'Healthcare',
            hospitality: 'Hospitality',
            logistics: 'Logistics',
            manufacturing: 'Manufacturing',
            maritime: 'Maritime',
            media: 'Media & Entertainment',
            mining: 'Mining',
            nonprofit: 'Nonprofit',
            retail: 'Retail',
        };
        return industryNames[this.industryCode] || this.industryCode;
    }

    /**
     * Get default compliance requirements for the industry
     */
    protected getDefaultComplianceRequirements(): string[] {
        const requirements: Record<string, string[]> = {
            agriculture: ['OSHA Field Safety', 'Pesticide Handling', 'Worker Protection Standards'],
            automotive: ['ISO 9001', 'IATF 16949', 'Environmental Compliance'],
            aviation: ['FAA Regulations', 'EASA Compliance', 'Crew Certification'],
            construction: ['OSHA Construction', 'Fall Protection', 'Hazard Communication'],
            energy: ['NERC Reliability', 'Environmental Protection', 'Safety Management'],
            financial: ['SOX Compliance', 'AML/KYC', 'Data Protection'],
            government: ['Civil Service Rules', 'Ethics Requirements', 'Security Clearance'],
            healthcare: ['HIPAA', 'Medical Licensing', 'Patient Safety'],
            hospitality: ['Food Safety', 'Alcohol Licensing', 'Guest Safety'],
            logistics: ['DOT Regulations', 'Hours of Service', 'Vehicle Safety'],
            manufacturing: ['OSHA Manufacturing', 'ISO 45001', 'Quality Standards'],
            maritime: ['STCW Certification', 'Maritime Labor', 'Safety Management'],
            media: ['Content Licensing', 'Union Requirements', 'Child Labor Laws'],
            mining: ['MSHA Regulations', 'Environmental Impact', 'Safety Training'],
            nonprofit: ['Grant Compliance', 'Volunteer Management', 'Tax Exemption'],
            retail: ['Labor Standards', 'Consumer Protection', 'Safety Requirements'],
        };
        return requirements[this.industryCode] || [];
    }
}

// Export factory function for creating industry-specific services
export function createIndustryService(industryCode: string): IndustryBaseService {
    return new IndustryBaseService(industryCode);
}

// Pre-instantiated services for common industries
export const agricultureService = new IndustryBaseService('agriculture');
export const automotiveService = new IndustryBaseService('automotive');
export const aviationService = new IndustryBaseService('aviation');
export const constructionService = new IndustryBaseService('construction');
export const energyService = new IndustryBaseService('energy');
export const financialService = new IndustryBaseService('financial');
export const governmentService = new IndustryBaseService('government');
export const healthcareService = new IndustryBaseService('healthcare');
export const hospitalityService = new IndustryBaseService('hospitality');
export const logisticsService = new IndustryBaseService('logistics');
export const manufacturingService = new IndustryBaseService('manufacturing');
export const maritimeService = new IndustryBaseService('maritime');
export const mediaService = new IndustryBaseService('media');
export const miningService = new IndustryBaseService('mining');
export const nonprofitService = new IndustryBaseService('nonprofit');
export const retailService = new IndustryBaseService('retail');
