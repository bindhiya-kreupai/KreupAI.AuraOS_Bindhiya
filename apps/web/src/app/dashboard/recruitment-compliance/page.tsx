import { redirect } from 'next/navigation';

// Section landing route: forward to the first recruitment-compliance sub-module.
export default function RecruitmentCompliancePage() {
  redirect('/dashboard/recruitment-compliance/hiring-checks');
}
