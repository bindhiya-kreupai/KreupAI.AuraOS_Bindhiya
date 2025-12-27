import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { DocumentService } from '../document.service';

// Mock file storage
vi.mock('@/lib/storage/file-storage', () => ({
  FileStorage: {
    upload: vi.fn().mockResolvedValue({ path: '/documents/test.pdf', url: 'https://...' }),
    download: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    document: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    documentVersion: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    documentTemplate: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe('DocumentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockDocument = {
    id: 'doc-1',
    tenantId: 'tenant-1',
    name: 'Employment Contract',
    type: 'CONTRACT',
    fileType: 'PDF',
    filePath: '/documents/contract.pdf',
    fileSize: 102400,
    status: 'ACTIVE',
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('uploadDocument', () => {
    it('should upload document successfully', async () => {
      const file = new Blob(['test content'], { type: 'application/pdf' });
      vi.mocked(prisma.document.create).mockResolvedValue(mockDocument as any);

      const result = await DocumentService.uploadDocument('tenant-1', {
        file,
        name: 'Employment Contract',
        type: 'CONTRACT',
        employeeId: 'emp-1',
      } as any);

      expect(result.name).toBe('Employment Contract');
      expect(result.fileType).toBe('PDF');
      expect(prisma.document.create).toHaveBeenCalled();
    });

    it('should validate file type', async () => {
      const file = new Blob(['test'], { type: 'application/exe' });

      await expect(
        DocumentService.uploadDocument('tenant-1', {
          file,
          name: 'Test',
          type: 'OTHER',
        } as any)
      ).rejects.toThrow('Invalid file type');
    });

    it('should validate file size', async () => {
      const largeFile = new Blob([new ArrayBuffer(11 * 1024 * 1024)]); // 11MB

      await expect(
        DocumentService.uploadDocument('tenant-1', {
          file: largeFile,
          name: 'Large File',
          type: 'OTHER',
        } as any)
      ).rejects.toThrow('File size exceeds maximum limit');
    });

    it('should create version for existing document', async () => {
      vi.mocked(prisma.document.findUnique).mockResolvedValue(mockDocument as any);
      vi.mocked(prisma.document.update).mockResolvedValue({
        ...mockDocument,
        version: 2,
      } as any);
      vi.mocked(prisma.documentVersion.create).mockResolvedValue({
        id: 'version-1',
        documentId: 'doc-1',
        version: 2,
      } as any);

      const file = new Blob(['updated content'], { type: 'application/pdf' });
      const result = await DocumentService.uploadDocument('tenant-1', {
        file,
        name: 'Employment Contract',
        type: 'CONTRACT',
        documentId: 'doc-1', // Update existing
      } as any);

      expect(result.version).toBe(2);
      expect(prisma.documentVersion.create).toHaveBeenCalled();
    });
  });

  describe('getDocuments', () => {
    it('should return documents with pagination', async () => {
      vi.mocked(prisma.document.count).mockResolvedValue(2);
      vi.mocked(prisma.document.findMany).mockResolvedValue([
        mockDocument,
        { ...mockDocument, id: 'doc-2' },
      ] as any);

      const result = await DocumentService.getDocuments('tenant-1', {
        page: 1,
        limit: 20,
      });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });

    it('should filter by document type', async () => {
      vi.mocked(prisma.document.count).mockResolvedValue(1);
      vi.mocked(prisma.document.findMany).mockResolvedValue([mockDocument] as any);

      await DocumentService.getDocuments('tenant-1', {
        type: 'CONTRACT',
      });

      expect(prisma.document.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: 'CONTRACT',
          }),
        })
      );
    });

    it('should filter by employee', async () => {
      vi.mocked(prisma.document.count).mockResolvedValue(1);
      vi.mocked(prisma.document.findMany).mockResolvedValue([mockDocument] as any);

      await DocumentService.getDocuments('tenant-1', {
        employeeId: 'emp-1',
      });

      expect(prisma.document.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            employeeId: 'emp-1',
          }),
        })
      );
    });
  });

  describe('downloadDocument', () => {
    it('should retrieve document for download', async () => {
      const { FileStorage } = await import('@/lib/storage/file-storage');
      vi.mocked(prisma.document.findUnique).mockResolvedValue(mockDocument as any);
      vi.mocked(FileStorage.download).mockResolvedValue(Buffer.from('test content'));

      const result = await DocumentService.downloadDocument('doc-1', 'tenant-1');

      expect(result.content).toBeDefined();
      expect(result.fileName).toBe('Employment Contract.pdf');
      expect(FileStorage.download).toHaveBeenCalledWith('/documents/contract.pdf');
    });

    it('should throw error if document not found', async () => {
      vi.mocked(prisma.document.findUnique).mockResolvedValue(null);

      await expect(
        DocumentService.downloadDocument('invalid', 'tenant-1')
      ).rejects.toThrow('Document not found');
    });
  });

  describe('deleteDocument', () => {
    it('should soft delete document', async () => {
      vi.mocked(prisma.document.findUnique).mockResolvedValue(mockDocument as any);
      vi.mocked(prisma.document.update).mockResolvedValue({
        ...mockDocument,
        status: 'DELETED',
      } as any);

      await DocumentService.deleteDocument('doc-1', 'tenant-1');

      expect(prisma.document.update).toHaveBeenCalledWith({
        where: { id: 'doc-1', tenantId: 'tenant-1' },
        data: { status: 'DELETED', deletedAt: expect.any(Date) },
      });
    });

    it('should hard delete document if specified', async () => {
      const { FileStorage } = await import('@/lib/storage/file-storage');
      vi.mocked(prisma.document.findUnique).mockResolvedValue(mockDocument as any);
      vi.mocked(prisma.document.delete).mockResolvedValue(mockDocument as any);

      await DocumentService.deleteDocument('doc-1', 'tenant-1', { permanent: true });

      expect(prisma.document.delete).toHaveBeenCalled();
      expect(FileStorage.delete).toHaveBeenCalledWith('/documents/contract.pdf');
    });
  });

  describe('getDocumentVersions', () => {
    it('should return all versions of a document', async () => {
      vi.mocked(prisma.documentVersion.findMany).mockResolvedValue([
        { id: 'v1', version: 1, createdAt: new Date('2024-01-01') },
        { id: 'v2', version: 2, createdAt: new Date('2024-02-01') },
      ] as any);

      const result = await DocumentService.getDocumentVersions('doc-1', 'tenant-1');

      expect(result).toHaveLength(2);
      expect(result[0].version).toBe(2); // Latest first
      expect(result[1].version).toBe(1);
    });
  });

  describe('generateFromTemplate', () => {
    it('should generate document from template', async () => {
      vi.mocked(prisma.documentTemplate.findUnique).mockResolvedValue({
        id: 'template-1',
        name: 'Employment Contract Template',
        content: 'Employee: {{employeeName}}, Salary: {{salary}}',
      } as any);
      vi.mocked(prisma.document.create).mockResolvedValue(mockDocument as any);

      const result = await DocumentService.generateFromTemplate('tenant-1', {
        templateId: 'template-1',
        data: {
          employeeName: 'John Doe',
          salary: '15,000 SAR',
        },
        employeeId: 'emp-1',
      });

      expect(result).toBeDefined();
      expect(result.name).toContain('Employment Contract');
    });

    it('should replace template placeholders', () => {
      const template = 'Hello {{name}}, your salary is {{salary}}';
      const data = { name: 'John', salary: '10000' };

      const result = DocumentService.replacePlaceholders(template, data);

      expect(result).toBe('Hello John, your salary is 10000');
    });

    it('should throw error if template not found', async () => {
      vi.mocked(prisma.documentTemplate.findUnique).mockResolvedValue(null);

      await expect(
        DocumentService.generateFromTemplate('tenant-1', {
          templateId: 'invalid',
          data: {},
        })
      ).rejects.toThrow('Template not found');
    });
  });

  describe('getDocumentTemplates', () => {
    it('should return available templates', async () => {
      vi.mocked(prisma.documentTemplate.findMany).mockResolvedValue([
        { id: 'template-1', name: 'Employment Contract', type: 'CONTRACT' },
        { id: 'template-2', name: 'Offer Letter', type: 'OFFER_LETTER' },
      ] as any);

      const result = await DocumentService.getDocumentTemplates('tenant-1');

      expect(result).toHaveLength(2);
    });

    it('should filter templates by type', async () => {
      vi.mocked(prisma.documentTemplate.findMany).mockResolvedValue([]);

      await DocumentService.getDocumentTemplates('tenant-1', { type: 'CONTRACT' });

      expect(prisma.documentTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: 'CONTRACT',
          }),
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty file', async () => {
      const emptyFile = new Blob([], { type: 'application/pdf' });

      await expect(
        DocumentService.uploadDocument('tenant-1', {
          file: emptyFile,
          name: 'Empty',
          type: 'OTHER',
        } as any)
      ).rejects.toThrow('File is empty');
    });

    it('should sanitize file names', () => {
      const unsafeName = '../../../etc/passwd';
      const safeName = DocumentService.sanitizeFileName(unsafeName);

      expect(safeName).not.toContain('..');
      expect(safeName).not.toContain('/');
    });

    it('should handle special characters in document names', async () => {
      const file = new Blob(['test'], { type: 'application/pdf' });
      vi.mocked(prisma.document.create).mockResolvedValue({
        ...mockDocument,
        name: 'Test Document (Updated)',
      } as any);

      const result = await DocumentService.uploadDocument('tenant-1', {
        file,
        name: 'Test <Document> & "Updates"',
        type: 'OTHER',
      } as any);

      expect(result.name).not.toContain('<');
      expect(result.name).not.toContain('>');
    });
  });
});
