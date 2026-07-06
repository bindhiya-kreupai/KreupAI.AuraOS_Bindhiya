import {
  attendancePolicyService,
  attendanceConsentService,
  attendanceFraudService,
  attendanceCertificateService,
} from './index';

export class AttendanceExportService {
  async exportData(
    tenantId: string,
    entity: 'policies' | 'consents' | 'fraud-flags' | 'certificates',
    format: 'csv' | 'xlsx',
    filter: any = {}
  ): Promise<{ filename: string; buffer: Buffer; mimeType: string }> {
    let items: any[] = [];
    let headers: Record<string, string> = {};

    // Fetch entire dataset matching the filters (without paging limits)
    if (entity === 'policies') {
      const res = await attendancePolicyService.list(tenantId, filter, {
        page: 1,
        pageSize: 10000,
      });
      items = res.items;
      headers = {
        country: 'Country',
        grade: 'Grade',
        isEligible: 'Eligible',
        lateToleranceMin: 'Late Tolerance (Min)',
        earlyDepartureToleranceMin: 'Early Out Tolerance (Min)',
        missingPunchSlaHours: 'Missing Punch SLA (Hours)',
        regularizationSlaDays: 'Regularization SLA (Days)',
        ramadanReducedHours: 'Ramadan Reduced Hours',
        remoteWorkAllowed: 'Remote Work Allowed',
        fraudGeofenceRadiusM: 'Geofence Radius (M)',
        biometricRequired: 'Biometric Required',
        effectiveFrom: 'Effective From',
        status: 'Status',
      };
    } else if (entity === 'consents') {
      const res = await attendanceConsentService.list(tenantId, filter, {
        page: 1,
        pageSize: 10000,
      });
      items = res.items;
      headers = {
        employeeCode: 'Employee Code',
        employeeName: 'Employee Name',
        consentType: 'Consent Type',
        grantedAt: 'Granted At',
        revokedAt: 'Revoked At',
        evidenceUrl: 'Evidence URL',
        statusLabel: 'State',
      };
    } else if (entity === 'fraud-flags') {
      const res = await attendanceFraudService.list(tenantId, filter, {
        page: 1,
        pageSize: 10000,
      });
      items = res.items;
      headers = {
        punchDate: 'Punch Date',
        employeeCode: 'Employee Code',
        employeeName: 'Employee Name',
        flagType: 'Flag Type',
        severity: 'Severity',
        score: 'Score',
        status: 'Status',
        resolvedAt: 'Resolved At',
        resolutionNotes: 'Resolution Notes',
      };
    } else if (entity === 'certificates') {
      const res = await attendanceCertificateService.list(tenantId, filter, {
        page: 1,
        pageSize: 10000,
      });
      items = res.items;
      headers = {
        period: 'Period',
        status: 'Status',
        punchesTotal: 'Total Punches',
        missingPunchCount: 'Missing Punches',
        lateCount: 'Late Arrivals',
        regularizationsPending: 'Pending Regularizations',
        fraudFlagsOpen: 'Open Fraud Flags',
        absconding3DayCount: 'Absconding (3+ Days)',
        consentMissingCount: 'Missing Consents',
        gatingReason: 'Gating Blockers',
        signedAt: 'Signed At',
        signedByUserEmail: 'Signed By',
      };
    }

    // Map raw data using readable headers
    const formattedData = items.map((item) => {
      const row: any = {};

      // Calculate inline fields if needed
      const employeeCode = item.employee?.employeeCode || '—';
      const employeeName = item.employee
        ? `${item.employee.firstName} ${item.employee.lastName}`
        : '—';
      const statusLabel = item.grantedAt && !item.revokedAt ? 'ACTIVE' : 'INACTIVE';
      const signedByUserEmail = item.signedByUser?.email || '—';

      const rowData = {
        ...item,
        employeeCode,
        employeeName,
        statusLabel,
        signedByUserEmail,
      };

      for (const [key, label] of Object.entries(headers)) {
        let val = rowData[key];
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

    const filename = `attendance_${entity}_export_${new Date().toISOString().slice(0, 10)}`;

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

export const attendanceExportService = new AttendanceExportService();
