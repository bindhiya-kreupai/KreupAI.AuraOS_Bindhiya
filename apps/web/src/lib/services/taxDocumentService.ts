import { BaseService } from './base.service';

export interface TaxDocument {
  id: string;
  employeeId: string;
  type: 'W2' | '1099' | 'Form16' | '1095C';
  taxYear: number;
  status: 'draft' | 'generated' | 'distributed';
  fileUrl?: string;
  generatedAt?: Date;
  createdAt: Date;
}

export class TaxDocumentService extends BaseService {
  constructor() {
    super('TaxDocumentService');
  }

  async listByEmployee(employeeId: string, taxYear?: number): Promise<TaxDocument[]> {
    const where: any = { employeeId };
    if (taxYear) where.taxYear = taxYear;

    const docs = await this.prisma.taxDocument.findMany({
      where,
      orderBy: [{ taxYear: 'desc' }, { type: 'asc' }],
    });

    return docs.map((d) => ({
      id: d.id,
      employeeId: d.employeeId,
      type: d.type as TaxDocument['type'],
      taxYear: d.taxYear,
      status: d.status as TaxDocument['status'],
      fileUrl: d.fileUrl || undefined,
      generatedAt: d.generatedAt || undefined,
      createdAt: d.createdAt,
    }));
  }

  async getById(id: string): Promise<TaxDocument | null> {
    const doc = await this.prisma.taxDocument.findUnique({ where: { id } });
    if (!doc) return null;
    return {
      id: doc.id,
      employeeId: doc.employeeId,
      type: doc.type as TaxDocument['type'],
      taxYear: doc.taxYear,
      status: doc.status as TaxDocument['status'],
      fileUrl: doc.fileUrl || undefined,
      generatedAt: doc.generatedAt || undefined,
      createdAt: doc.createdAt,
    };
  }

  async getDownloadUrl(id: string): Promise<string> {
    const doc = await this.prisma.taxDocument.findUnique({ where: { id } });
    if (!doc || !doc.fileUrl) throw new Error('Document not found or not generated');
    return doc.fileUrl;
  }

  async generateTaxDocuments(params: {
    taxYear: number;
    type: TaxDocument['type'];
    tenantId: string;
    triggeredBy: string;
  }): Promise<{ count: number; jobId: string }> {
    this.logger.info('Triggering tax document generation', params);

    await this.createAuditLog({
      userId: params.triggeredBy,
      action: 'CREATE',
      module: 'TaxDocuments',
      details: `Initiated ${params.type} generation for tax year ${params.taxYear}`,
    });

    // In production, this would queue a background job
    const jobId = `tax-gen-${Date.now()}`;
    return { count: 0, jobId };
  }

  async listAvailableYears(employeeId: string): Promise<number[]> {
    const docs = await this.prisma.taxDocument.findMany({
      where: { employeeId },
      select: { taxYear: true },
      distinct: ['taxYear'],
      orderBy: { taxYear: 'desc' },
    });
    return docs.map((d) => d.taxYear);
  }
}

export const taxDocumentService = new TaxDocumentService();
