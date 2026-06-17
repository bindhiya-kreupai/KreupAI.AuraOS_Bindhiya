/**
 * EPIC-34-S27: HRMS configuration implementation checklist / control sheet.
 *
 * Tracks the go-live items per phase (DISCOVERY → DESIGN → BUILD → TEST →
 * GO_LIVE → POST_GO_LIVE). Mandatory items must be CLOSED for the
 * HrmsConfigCertificate go-live sign-off to be unblocked.
 */

import { prisma } from '@aura/database';
import type { AuthContext } from './types';
import {
  normalisePaging,
  prismaPageArgs,
  buildPaginatedResult,
  type PaginationInput,
  type PaginatedResult,
} from '@/lib/services/pagination';

export type ImplementationPhase =
  | 'DISCOVERY'
  | 'DESIGN'
  | 'BUILD'
  | 'TEST'
  | 'GO_LIVE'
  | 'POST_GO_LIVE';
export type ImplementationStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'WAIVED';

export interface ChecklistSeed {
  phase: ImplementationPhase;
  category: string;
  code: string;
  label: string;
  isMandatory: boolean;
  ownerRole?: string;
}

export const DEFAULT_CHECKLIST: ChecklistSeed[] = [
  // DISCOVERY
  {
    phase: 'DISCOVERY',
    category: 'GOVERNANCE',
    code: 'DSC-GOV-01',
    label: 'Project sponsor & steering committee identified',
    isMandatory: true,
    ownerRole: 'PROGRAM_DIRECTOR',
  },
  {
    phase: 'DISCOVERY',
    category: 'SCOPE',
    code: 'DSC-SCP-01',
    label: 'Countries, legal entities & modules in scope signed off',
    isMandatory: true,
    ownerRole: 'PROGRAM_MANAGER',
  },
  // DESIGN
  {
    phase: 'DESIGN',
    category: 'CONFIG',
    code: 'DSG-CFG-01',
    label: 'Country rule sets approved for each in-scope country',
    isMandatory: true,
    ownerRole: 'COMPLIANCE_OFFICER',
  },
  {
    phase: 'DESIGN',
    category: 'CONFIG',
    code: 'DSG-CFG-02',
    label: 'Payroll component catalogue approved',
    isMandatory: true,
    ownerRole: 'PAYROLL_LEAD',
  },
  {
    phase: 'DESIGN',
    category: 'INTEGRATION',
    code: 'DSG-INT-01',
    label: 'Authority connectors (Qiwa/Mudad/MOHRE/LMRA/SIO) catalogued',
    isMandatory: true,
    ownerRole: 'INTEGRATION_LEAD',
  },
  // BUILD
  {
    phase: 'BUILD',
    category: 'DATA',
    code: 'BLD-DAT-01',
    label: 'Employee master migration plan dry-run validated',
    isMandatory: true,
    ownerRole: 'DATA_LEAD',
  },
  {
    phase: 'BUILD',
    category: 'CONFIG',
    code: 'BLD-CFG-01',
    label: 'Approval workflow templates published',
    isMandatory: true,
    ownerRole: 'CONFIG_LEAD',
  },
  // TEST
  {
    phase: 'TEST',
    category: 'PAYROLL',
    code: 'TST-PAY-01',
    label: 'Parallel payroll run reconciled within 0.5% per legal entity',
    isMandatory: true,
    ownerRole: 'PAYROLL_LEAD',
  },
  {
    phase: 'TEST',
    category: 'WPS',
    code: 'TST-WPS-01',
    label: 'WPS / Mudad file sample accepted by authority sandbox',
    isMandatory: true,
    ownerRole: 'PAYROLL_LEAD',
  },
  {
    phase: 'TEST',
    category: 'SECURITY',
    code: 'TST-SEC-01',
    label: 'Security review (RBAC, secrets, audit trail) signed off',
    isMandatory: true,
    ownerRole: 'SECURITY_OFFICER',
  },
  // GO_LIVE
  {
    phase: 'GO_LIVE',
    category: 'CUTOVER',
    code: 'GLV-CUT-01',
    label: 'Cutover plan & rollback plan signed off',
    isMandatory: true,
    ownerRole: 'PROGRAM_MANAGER',
  },
  {
    phase: 'GO_LIVE',
    category: 'COMMS',
    code: 'GLV-COM-01',
    label: 'Employee communication & training delivered',
    isMandatory: true,
    ownerRole: 'CHANGE_LEAD',
  },
  // POST_GO_LIVE
  {
    phase: 'POST_GO_LIVE',
    category: 'STABILISATION',
    code: 'PGL-STB-01',
    label: 'Hyper-care window (30 days) closed without P1 incidents',
    isMandatory: true,
    ownerRole: 'OPERATIONS_LEAD',
  },
];

export class HrmsImplementationService {
  async seed(auth: AuthContext) {
    const created: string[] = [];
    const skipped: string[] = [];
    for (const item of DEFAULT_CHECKLIST) {
      try {
        await (prisma as any).hrmsImplementationChecklist.create({
          data: {
            tenantId: auth.tenantId,
            phase: item.phase,
            category: item.category,
            code: item.code,
            label: item.label,
            isMandatory: item.isMandatory,
            ownerRole: item.ownerRole ?? null,
          },
        });
        created.push(item.code);
      } catch {
        skipped.push(item.code);
      }
    }
    return { created, skipped };
  }

  async list(
    tenantId: string,
    filter: { phase?: ImplementationPhase; status?: ImplementationStatus } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      ...(filter.phase ? { phase: filter.phase } : {}),
      ...(filter.status ? { status: filter.status } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).hrmsImplementationChecklist.findMany({
        where,
        orderBy: [{ phase: 'asc' }, { code: 'asc' }],
        ...prismaPageArgs(page),
      }),
      (prisma as any).hrmsImplementationChecklist.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }

  async update(
    code: string,
    input: {
      status?: ImplementationStatus;
      owner?: string;
      dueDate?: Date;
      evidenceUrl?: string;
      notes?: string;
    },
    auth: AuthContext
  ) {
    return (prisma as any).hrmsImplementationChecklist.update({
      where: {
        aura_hrms_implementation_checklist_unique: { tenantId: auth.tenantId, code },
      },
      data: {
        ...(input.status ? { status: input.status } : {}),
        ...(input.owner ? { owner: input.owner } : {}),
        ...(input.dueDate ? { dueDate: input.dueDate } : {}),
        ...(input.evidenceUrl !== undefined ? { evidenceUrl: input.evidenceUrl } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        ...(input.status === 'COMPLETED'
          ? { completedAt: new Date(), completedBy: auth.userId }
          : {}),
      },
    });
  }

  async openMandatoryCount(tenantId: string): Promise<number> {
    return (prisma as any).hrmsImplementationChecklist.count({
      where: {
        tenantId,
        isMandatory: true,
        status: { in: ['OPEN', 'IN_PROGRESS'] },
      },
    });
  }
}

export const hrmsImplementationService = new HrmsImplementationService();
