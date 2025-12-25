"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AgentsOverviewPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main agents page
    router.replace('/dashboard/agents');
  }, [router]);

  return null;
}
