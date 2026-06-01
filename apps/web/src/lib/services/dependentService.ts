// @ts-nocheck — Service has schema drift against current Prisma schema (model/field names mismatch). Only called from already-disabled dashboard components. Tracked under #29 for rewrite.
import { BaseService } from './base.service';
import crypto from 'crypto';

export interface Dependent {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  relationship: 'spouse' | 'child' | 'parent' | 'domestic_partner' | 'other';
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  ssnLast4?: string;
  benefitEligible: boolean;
  coveredPlans: string[];
  createdAt: Date;
}

if (!process.env.SSN_ENCRYPTION_KEY) {
  throw new Error(
    'FATAL: SSN_ENCRYPTION_KEY environment variable is not set. Refusing to start with an insecure default.'
  );
}
const ENCRYPTION_KEY = process.env.SSN_ENCRYPTION_KEY;
const IV_LENGTH = 16;

export class DependentService extends BaseService {
  constructor() {
    super('DependentService');
  }

  private encryptSSN(ssn: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY.slice(0, 32)),
      iv
    );
    let encrypted = cipher.update(ssn, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  private decryptSSNLast4(encrypted: string): string {
    try {
      const [ivHex, encryptedData] = encrypted.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        Buffer.from(ENCRYPTION_KEY.slice(0, 32)),
        iv
      );
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return '***-**-' + decrypted.slice(-4);
    } catch {
      return '***-**-****';
    }
  }

  async listByEmployee(employeeId: string): Promise<Dependent[]> {
    const dependents = await this.prisma.dependent.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'asc' },
    });

    return dependents.map((d: any) => ({
      id: d.id,
      employeeId: d.employeeId,
      firstName: d.firstName,
      lastName: d.lastName,
      relationship: d.relationship as Dependent['relationship'],
      dateOfBirth: d.dateOfBirth,
      gender: d.gender as Dependent['gender'],
      ssnLast4: d.ssn ? this.decryptSSNLast4(d.ssn) : undefined,
      benefitEligible: d.benefitEligible,
      coveredPlans: (d.coveredPlans as string[]) || [],
      createdAt: d.createdAt,
    }));
  }

  async getById(id: string): Promise<Dependent | null> {
    const d = await this.prisma.dependent.findUnique({ where: { id } });
    if (!d) return null;
    return {
      id: d.id,
      employeeId: d.employeeId,
      firstName: d.firstName,
      lastName: d.lastName,
      relationship: d.relationship as Dependent['relationship'],
      dateOfBirth: d.dateOfBirth,
      gender: d.gender as Dependent['gender'],
      ssnLast4: d.ssn ? this.decryptSSNLast4(d.ssn) : undefined,
      benefitEligible: d.benefitEligible,
      coveredPlans: (d.coveredPlans as string[]) || [],
      createdAt: d.createdAt,
    };
  }

  async addDependent(data: {
    employeeId: string;
    firstName: string;
    lastName: string;
    relationship: Dependent['relationship'];
    dateOfBirth: Date;
    gender: Dependent['gender'];
    ssn?: string;
  }): Promise<Dependent> {
    const encryptedSSN = data.ssn ? this.encryptSSN(data.ssn) : null;

    const dependent = await this.prisma.dependent.create({
      data: {
        employeeId: data.employeeId,
        firstName: data.firstName,
        lastName: data.lastName,
        relationship: data.relationship,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        ssn: encryptedSSN,
        benefitEligible: true,
        coveredPlans: [],
      },
    });

    await this.createAuditLog({
      userId: data.employeeId,
      action: 'CREATE',
      module: 'Dependents',
      details: `Added dependent ${data.firstName} ${data.lastName}`,
    });

    return {
      id: dependent.id,
      employeeId: dependent.employeeId,
      firstName: dependent.firstName,
      lastName: dependent.lastName,
      relationship: dependent.relationship as Dependent['relationship'],
      dateOfBirth: dependent.dateOfBirth,
      gender: dependent.gender as Dependent['gender'],
      ssnLast4: dependent.ssn ? this.decryptSSNLast4(dependent.ssn) : undefined,
      benefitEligible: dependent.benefitEligible,
      coveredPlans: [],
      createdAt: dependent.createdAt,
    };
  }

  async updateDependent(
    id: string,
    data: Partial<{
      firstName: string;
      lastName: string;
      relationship: Dependent['relationship'];
      dateOfBirth: Date;
      gender: Dependent['gender'];
      ssn: string;
      benefitEligible: boolean;
    }>
  ): Promise<Dependent> {
    const updateData: any = { ...data };
    if (data.ssn) {
      updateData.ssn = this.encryptSSN(data.ssn);
      delete updateData.ssn;
      updateData.ssn = this.encryptSSN(data.ssn);
    }

    const dependent = await this.prisma.dependent.update({ where: { id }, data: updateData });
    return {
      id: dependent.id,
      employeeId: dependent.employeeId,
      firstName: dependent.firstName,
      lastName: dependent.lastName,
      relationship: dependent.relationship as Dependent['relationship'],
      dateOfBirth: dependent.dateOfBirth,
      gender: dependent.gender as Dependent['gender'],
      ssnLast4: dependent.ssn ? this.decryptSSNLast4(dependent.ssn) : undefined,
      benefitEligible: dependent.benefitEligible,
      coveredPlans: (dependent.coveredPlans as string[]) || [],
      createdAt: dependent.createdAt,
    };
  }

  async removeDependent(id: string, userId: string): Promise<void> {
    await this.prisma.dependent.delete({ where: { id } });
    await this.createAuditLog({
      userId,
      action: 'DELETE',
      module: 'Dependents',
      details: `Removed dependent ${id}`,
    });
  }
}

export const dependentService = new DependentService();
