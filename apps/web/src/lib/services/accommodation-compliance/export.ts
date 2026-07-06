import {
  accommodationSiteService,
  accommodationAssignmentService,
  accommodationInspectionService,
  accommodationComplaintService,
} from './index';

export class AccommodationExportService {
  async exportData(
    tenantId: string,
    entity: 'sites' | 'assignments' | 'inspections' | 'complaints',
    format: 'csv' | 'xlsx',
    filter: any = {}
  ): Promise<{ filename: string; buffer: Buffer; mimeType: string }> {
    let items: any[] = [];
    let headers: Record<string, string> = {};

    const auth = { tenantId, userId: 'system' };

    // Fetch entire dataset matching the filters (without paging limits)
    if (entity === 'sites') {
      const res = await accommodationSiteService.list(tenantId, filter, {
        page: 1,
        pageSize: 10000,
      });
      items = res.items;
      headers = {
        name: 'Site Name',
        siteType: 'Site Type',
        country: 'Country',
        address: 'Address',
        totalCapacity: 'Total Capacity',
        currentOccupancy: 'Current Occupancy',
        femaleOnly: 'Female Only',
        familyAllowed: 'Family Allowed',
        lastInspectionAt: 'Last Inspection Date',
        nextInspectionAt: 'Next Inspection Date',
        status: 'Status',
      };
    } else if (entity === 'assignments') {
      const res = await accommodationAssignmentService.list(tenantId, filter, {
        page: 1,
        pageSize: 10000,
      });
      items = res.items;
      headers = {
        siteName: 'Site Name',
        employeeName: 'Employee Name',
        roomNumber: 'Room Number',
        bedNumber: 'Bed Number',
        checkInAt: 'Check-In Date',
        checkOutAt: 'Check-Out Date',
        status: 'Status',
        monthlyAllowance: 'Monthly Allowance',
        currency: 'Currency',
      };
    } else if (entity === 'inspections') {
      const res = await accommodationInspectionService.list(tenantId, filter, {
        page: 1,
        pageSize: 10000,
      });
      items = res.items;
      headers = {
        siteName: 'Site Name',
        inspectionDate: 'Inspection Date',
        inspectorId: 'Inspector ID',
        category: 'Category',
        score: 'Score (/100)',
        criticalFindings: 'Critical Findings',
        majorFindings: 'Major Findings',
        minorFindings: 'Minor Findings',
        status: 'Status',
        closedAt: 'Closed Date',
      };
    } else if (entity === 'complaints') {
      const res = await accommodationComplaintService.list(tenantId, filter, {
        page: 1,
        pageSize: 10000,
      });
      items = res.items;
      headers = {
        siteName: 'Site Name',
        employeeName: 'Employee Name',
        category: 'Category',
        severity: 'Severity',
        subject: 'Subject',
        description: 'Description',
        raisedAt: 'Raised Date',
        assigneeId: 'Assignee ID',
        slaHours: 'SLA Hours',
        status: 'Status',
        resolvedAt: 'Resolved Date',
        resolutionNotes: 'Resolution Notes',
      };
    }

    // Map raw data using readable headers
    const formattedData = items.map((item) => {
      const row: any = {};
      for (const [key, label] of Object.entries(headers)) {
        let val = item[key];
        if (val instanceof Date) {
          val = val.toISOString().slice(0, 10);
        } else if (typeof val === 'boolean') {
          val = val ? 'Yes' : 'No';
        } else if (val == null) {
          val = '—';
        }
        row[label] = val;
      }
      return row;
    });

    // Dynamically import SheetJS (xlsx)
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(formattedData);
    XLSX.utils.book_append_sheet(wb, ws, entity.toUpperCase());

    const filename = `accommodation_${entity}_export_${new Date().toISOString().slice(0, 10)}`;

    if (format === 'csv') {
      const csvContent = XLSX.utils.sheet_to_csv(ws);
      return {
        filename: `${filename}.csv`,
        buffer: Buffer.from(csvContent, 'utf-8'),
        mimeType: 'text/csv; charset=utf-8',
      };
    } else {
      const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      return {
        filename: `${filename}.xlsx`,
        buffer: excelBuffer,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
    }
  }
}

export const accommodationExportService = new AccommodationExportService();
