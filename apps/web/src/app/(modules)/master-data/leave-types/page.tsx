/**
 * @module LeaveTypesPage
 * @description Leave Types master data management page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

'use client';

import { EmptyPage } from '@/components/ui';

export default function LeaveTypesPage() {
  return (
    <EmptyPage
      module="Leave Types"
      icon="leave"
      features={[
        'Add Leave Type',
        'Edit Leave Type',
        'Delete Leave Type',
        'View All Leave Types',
        'Configure Accrual Rules',
        'Set Carry Forward Rules',
        'Set Encashment Rules',
        'Define Eligibility',
        'Configure Approval Flow',
      ]}
    />
  );
}
