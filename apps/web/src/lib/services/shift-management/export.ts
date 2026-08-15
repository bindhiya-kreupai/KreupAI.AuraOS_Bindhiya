import { prisma } from '@aura/database';

type ShiftExportEntity = 'shifts' | 'assignments' | 'rosters' | 'swap-requests';
type ExportFormat = 'csv' | 'xlsx' | 'pdf';

export class ShiftExportService {
  async exportData(
    tenantId: string,
    entity: ShiftExportEntity,
    format: ExportFormat,
    filter: Record<string, any> = {}
  ): Promise<{ filename: string; buffer: Buffer; mimeType: string }> {
    const where: any = { tenantId, isDeleted: false };

    if (filter.isActive !== undefined) where.isActive = filter.isActive === 'true';
    if (filter.employeeId) where.employeeId = filter.employeeId;
    if (filter.shiftId) where.shiftId = filter.shiftId;
    if (filter.status) where.status = filter.status;
    if (filter.requestorId) where.requestorId = filter.requestorId;
    if (filter.swapWithId) where.swapWithId = filter.swapWithId;
    if (filter.startDate || filter.endDate) {
      where.createdAt = {};
      if (filter.startDate) where.createdAt.gte = new Date(filter.startDate);
      if (filter.endDate) where.createdAt.lte = new Date(filter.endDate);
    }

    const XLSX = await import('xlsx');
    let formattedData: Record<string, any>[] = [];
    let headers: Record<string, string> = {};
    let title = '';

    if (entity === 'shifts') {
      title = 'Shifts';
      const items = await prisma.shift.findMany({
        where: { ...where, tenantId, isDeleted: false },
        orderBy: { name: 'asc' },
      });
      headers = {
        code: 'Code',
        name: 'Name',
        startTime: 'Start Time',
        endTime: 'End Time',
        workHours: 'Work Hours',
        graceInMinutes: 'Grace In (min)',
        graceOutMinutes: 'Grace Out (min)',
        breakDuration: 'Break (min)',
        isPaidBreak: 'Paid Break',
        overtimeAllowed: 'Overtime Allowed',
        isFlexible: 'Flexible',
        isDefault: 'Default',
        isActive: 'Active',
      };
      formattedData = items.map((i) => ({
        code: i.code,
        name: i.name,
        startTime: i.startTime,
        endTime: i.endTime,
        workHours: i.workHours,
        graceInMinutes: i.graceInMinutes,
        graceOutMinutes: i.graceOutMinutes,
        breakDuration: i.breakDuration,
        isPaidBreak: i.isPaidBreak ? 'Yes' : 'No',
        overtimeAllowed: i.overtimeAllowed ? 'Yes' : 'No',
        isFlexible: i.isFlexible ? 'Yes' : 'No',
        isDefault: i.isDefault ? 'Yes' : 'No',
        isActive: i.isActive ? 'Yes' : 'No',
      }));
    } else if (entity === 'assignments') {
      title = 'Shift Assignments';
      const items = await prisma.shiftAssignment.findMany({
        where: { ...where, tenantId, isDeleted: false },
        include: { shift: { select: { name: true, code: true } } },
        orderBy: { effectiveFrom: 'desc' },
      });
      headers = {
        employeeId: 'Employee ID',
        shiftName: 'Shift',
        shiftCode: 'Shift Code',
        effectiveFrom: 'Effective From',
        effectiveTo: 'Effective To',
        reason: 'Reason',
        isActive: 'Active',
      };
      formattedData = items.map((a) => {
        const empName =
          `${(a as any).employee?.firstName || ''} ${(a as any).employee?.lastName || ''}`.trim();
        return {
          employeeId: empName || a.employeeId,
          shiftName: a.shift?.name || '—',
          shiftCode: a.shift?.code || '—',
          effectiveFrom: a.effectiveFrom.toISOString().slice(0, 10),
          effectiveTo: a.effectiveTo ? a.effectiveTo.toISOString().slice(0, 10) : 'Current',
          reason: a.reason || '—',
          isActive: a.isActive ? 'Yes' : 'No',
        };
      });
    } else if (entity === 'rosters') {
      title = 'Shift Rosters';
      const rosterWhere: any = { tenantId, isDeleted: false };
      if (filter.employeeId) rosterWhere.employeeId = filter.employeeId;
      if (filter.shiftId) rosterWhere.shiftId = filter.shiftId;
      if (filter.status) rosterWhere.status = filter.status;
      if (filter.excludeDrafts === 'true') rosterWhere.publishedAt = { not: null };
      if (filter.startDate && filter.endDate) {
        rosterWhere.rosterDate = {
          gte: new Date(filter.startDate),
          lte: new Date(filter.endDate),
        };
      }
      const items = await prisma.shiftRoster.findMany({
        where: rosterWhere,
        include: { shift: { select: { name: true, code: true } } },
        orderBy: { rosterDate: 'asc' },
      });
      headers = {
        employeeId: 'Employee ID',
        shiftName: 'Shift',
        shiftCode: 'Shift Code',
        rosterDate: 'Date',
        customStartTime: 'Custom Start',
        customEndTime: 'Custom End',
        isWeekOff: 'Week Off',
        isHoliday: 'Holiday',
        status: 'Status',
        publishedAt: 'Published At',
      };
      formattedData = items.map((r) => {
        const empName =
          `${(r as any).employee?.firstName || ''} ${(r as any).employee?.lastName || ''}`.trim();
        return {
          employeeId: empName || r.employeeId,
          shiftName: r.shift?.name || '—',
          shiftCode: r.shift?.code || '—',
          rosterDate: r.rosterDate.toISOString().slice(0, 10),
          customStartTime: r.customStartTime || '—',
          customEndTime: r.customEndTime || '—',
          isWeekOff: r.isWeekOff ? 'Yes' : 'No',
          isHoliday: r.isHoliday ? 'Yes' : 'No',
          status: r.status,
          publishedAt: r.publishedAt ? r.publishedAt.toISOString().slice(0, 10) : '—',
        };
      });
    } else if (entity === 'swap-requests') {
      title = 'Swap Requests';
      const items = await prisma.shiftSwapRequest.findMany({
        where: { ...where, tenantId, isDeleted: false },
        orderBy: { createdAt: 'desc' },
      });
      headers = {
        requestorId: 'Requestor',
        swapWithId: 'Swap With',
        requestorShiftId: 'Requestor Shift',
        swapWithShiftId: 'Swap With Shift',
        requestorDate: 'Requestor Date',
        swapWithDate: 'Swap Date',
        status: 'Status',
        rejectionReason: 'Rejection Reason',
        createdAt: 'Created At',
      };
      formattedData = items.map((s) => ({
        requestorId: s.requestorId,
        swapWithId: s.swapWithId,
        requestorShiftId: s.requestorShiftId,
        swapWithShiftId: s.swapWithShiftId,
        requestorDate: s.requestorDate.toISOString().slice(0, 10),
        swapWithDate: s.swapWithDate.toISOString().slice(0, 10),
        status: s.status,
        rejectionReason: s.rejectionReason || '—',
        createdAt: s.createdAt.toISOString().slice(0, 10),
      }));
    }

    if (format === 'pdf') {
      return this.generatePdf(title, headers, formattedData);
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(this.mapToReadable(formattedData, headers));
    XLSX.utils.book_append_sheet(wb, ws, title.slice(0, 31));

    const filename = `shift_${entity}_${new Date().toISOString().slice(0, 10)}`;

    if (format === 'csv') {
      const csvContent = XLSX.utils.sheet_to_csv(ws);
      return {
        filename: `${filename}.csv`,
        buffer: Buffer.from(csvContent, 'utf-8'),
        mimeType: 'text/csv; charset=utf-8',
      };
    }

    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return {
      filename: `${filename}.xlsx`,
      buffer: excelBuffer,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }

  private mapToReadable(data: Record<string, any>[], headers: Record<string, string>) {
    return data.map((row) => {
      const readable: Record<string, any> = {};
      for (const [key, label] of Object.entries(headers)) {
        let val = row[key];
        if (val instanceof Date) val = val.toISOString().slice(0, 10);
        else if (typeof val === 'boolean') val = val ? 'Yes' : 'No';
        else if (val == null) val = '—';
        readable[label] = val;
      }
      return readable;
    });
  }

  private generatePdf(
    title: string,
    headers: Record<string, string>,
    data: Record<string, any>[]
  ): { filename: string; buffer: Buffer; mimeType: string } {
    const columnLabels = Object.values(headers);
    const dateStr = new Date().toISOString().slice(0, 10);

    let tableRows = '';
    for (const row of data) {
      tableRows += '<tr>';
      for (const key of Object.keys(headers)) {
        let val = row[key];
        if (val instanceof Date) val = val.toISOString().slice(0, 10);
        else if (typeof val === 'boolean') val = val ? 'Yes' : 'No';
        else if (val == null) val = '—';
        tableRows += `<td>${String(val)}</td>`;
      }
      tableRows += '</tr>';
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${title} — ${dateStr}</title>
<style>
  @page { size: landscape; margin: 15mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; font-size: 10px; color: #1e293b; padding: 20px; }
  h1 { font-size: 16px; margin-bottom: 4px; }
  .subtitle { font-size: 11px; color: #64748b; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #1e293b; color: #fff; padding: 6px 8px; text-align: left; font-weight: 600; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; }
  td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; }
  tr:nth-child(even) td { background: #f8fafc; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
<h1>${title}</h1>
<p class="subtitle">Generated ${dateStr} · AuraOS Shift Management</p>
<table>
<thead><tr>${columnLabels.map((l) => `<th>${l}</th>`).join('')}</tr></thead>
<tbody>${tableRows}</tbody>
</table>
</body>
</html>`;

    return {
      filename: `shift_${title.toLowerCase().replace(/\s+/g, '_')}_${dateStr}.html`,
      buffer: Buffer.from(html, 'utf-8'),
      mimeType: 'text/html; charset=utf-8',
    };
  }
}

export const shiftExportService = new ShiftExportService();
