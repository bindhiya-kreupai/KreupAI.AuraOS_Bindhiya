"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PayrollComplianceOverviewPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main payroll compliance page
    router.replace('/dashboard/payroll-compliance');
  }, [router]);

  return null;
}
