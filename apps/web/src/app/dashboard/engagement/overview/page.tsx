"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EngagementOverviewPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main engagement page
    router.replace('/dashboard/engagement');
  }, [router]);

  return null;
}

