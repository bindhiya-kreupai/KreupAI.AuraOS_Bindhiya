import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

export interface ReportConfig {
  type: 'headcount' | 'turnover' | 'diversity' | 'compensation' | 'custom';
  format: 'pdf' | 'excel' | 'csv';
  title: string;
  description?: string;
  filters: ReportFilters;
  sections?: ReportSection[];
}

export interface ReportFilters {
  organizationId: string;
  departmentIds?: string[];
  startDate: string;
  endDate: string;
  includeSubDepartments?: boolean;
}

export interface ReportSection {
  title: string;
  type: 'table' | 'chart' | 'summary' | 'text';
  dataSource: string;
  config?: Record<string, unknown>;
}

export interface GeneratedReport {
  id: string;
  config: ReportConfig;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  filePath?: string;
  fileSize?: number;
  generatedAt?: string;
  error?: string;
}

export class ReportService {
  /**
   * Generate a PDF report based on the configuration
   */
  async generatePDF(config: ReportConfig): Promise<GeneratedReport> {
    const reportId = 'rpt_' + Date.now().toString();

    try {
      const doc = new PDFDocument();
      const filePath = path.join(process.cwd(), 'reports', `${reportId}.pdf`);
      
      // Ensure directory exists
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      
      doc.fontSize(20).text(config.title || 'Report', { align: 'center' });
      doc.moveDown();
      if (config.description) {
        doc.fontSize(12).text(config.description);
        doc.moveDown();
      }
      
      doc.text(`Filters: ${JSON.stringify(config.filters)}`);
      doc.moveDown();
      
      (config.sections || []).forEach(section => {
        doc.fontSize(16).text(section.title);
        doc.fontSize(12).text(`Type: ${section.type}, DataSource: ${section.dataSource}`);
        doc.moveDown();
      });
      
      doc.end();
      
      await new Promise((resolve) => stream.on('finish', resolve));

      return {
        id: reportId,
        config,
        status: 'completed',
        filePath: '/reports/' + reportId + '.pdf',
        fileSize: 0,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        id: reportId,
        config,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate an Excel report based on the configuration
   */
  async generateExcel(config: ReportConfig): Promise<GeneratedReport> {
    const reportId = 'rpt_' + Date.now().toString();

    try {
      const workbook = new ExcelJS.Workbook();
      const filePath = path.join(process.cwd(), 'reports', `${reportId}.xlsx`);
      
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      
      const sheet = workbook.addWorksheet('Report Summary');
      sheet.addRow(['Title', config.title]);
      sheet.addRow(['Description', config.description || '']);
      sheet.addRow(['Filters', JSON.stringify(config.filters)]);
      
      (config.sections || []).forEach((section, index) => {
        const secSheet = workbook.addWorksheet(`Section ${index + 1} - ${section.title.substring(0, 20)}`);
        secSheet.addRow(['Title', section.title]);
        secSheet.addRow(['Type', section.type]);
        secSheet.addRow(['Data Source', section.dataSource]);
      });
      
      await workbook.xlsx.writeFile(filePath);

      return {
        id: reportId,
        config,
        status: 'completed',
        filePath: '/reports/' + reportId + '.xlsx',
        fileSize: 0,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        id: reportId,
        config,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate a report in the specified format
   */
  async generate(config: ReportConfig): Promise<GeneratedReport> {
    switch (config.format) {
      case 'pdf':
        return this.generatePDF(config);
      case 'excel':
        return this.generateExcel(config);
      case 'csv':
        return this.generateCSV(config);
      default:
        throw new Error('Unsupported report format: ' + config.format);
    }
  }

  /**
   * Generate a CSV report
   */
  private async generateCSV(config: ReportConfig): Promise<GeneratedReport> {
    const reportId = 'rpt_' + Date.now().toString();

    const filePath = path.join(process.cwd(), 'reports', `${reportId}.csv`);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    
    let csvContent = `Title,${config.title}\n`;
    csvContent += `Description,${config.description || ''}\n\n`;
    csvContent += `Section Title,Section Type,Data Source\n`;
    
    (config.sections || []).forEach(sec => {
      csvContent += `${sec.title},${sec.type},${sec.dataSource}\n`;
    });
    
    fs.writeFileSync(filePath, csvContent);
    return {
      id: reportId,
      config,
      status: 'completed',
      filePath: '/reports/' + reportId + '.csv',
      fileSize: 0,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Get report status by ID
   */
  async getReportStatus(reportId: string): Promise<GeneratedReport | null> {
    // Mock database lookup
    console.log(`[ReportService] Looking up status for report ${reportId}`);
    return {
      id: reportId,
      config: {} as ReportConfig,
      status: 'completed',
      generatedAt: new Date().toISOString()
    };
  }
}

export default new ReportService();
